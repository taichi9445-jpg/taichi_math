/* ===========================================================================
   mathcore.js  —  数式の採点エンジン
   ---------------------------------------------------------------------------
   目的：「答えが違うのに正解になる」「合っているのに不正解になる」を無くす。

   従来の教材は  userInput === "2x+3"  のような文字列比較で採点していたため、
     ・"3+2x" と書くと不正解
     ・"2x+3 " のような空白や全角文字で不正解
     ・"2x+30" のように部分一致してしまい正解になる（indexOf 系の実装）
   といった事故が起きていた。

   ここでは
     1) 入力を正規化（全角→半角、×→*、√、暗黙の掛け算 2x → 2*x など）
     2) 数式としてパース（AST 化）
     3) 変数にランダムな値を何点も代入して数値評価し、全点で一致するか判定
   という「多項式恒等性テスト」を行う。これにより
     2x+3 と 3+2x と (4x+6)/2 は同じ、2x+3 と 2x+4 は違う、と厳密に判定できる。

   さらに「因数分解して答えよ」「分母を有理化せよ」のように *形* が問われる
   問題のために、形のチェック関数も用意している。
   ========================================================================= */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------
     1. 正規化
     ------------------------------------------------------------------ */

  // 全角英数記号 → 半角
  function toHalfWidth(s) {
    return s.replace(/[！-～]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    }).replace(/　/g, ' ');
  }

  var SUPERSCRIPTS = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
  };

  function normalize(input) {
    if (input === null || input === undefined) return '';
    var s = String(input);

    s = toHalfWidth(s);

    // 上付き数字 x² → x^2
    s = s.replace(/[⁰¹²³⁴-⁹]+/g, function (run) {
      var digits = '';
      for (var i = 0; i < run.length; i++) digits += SUPERSCRIPTS[run[i]];
      return '^' + digits;
    });

    // 各種の記号ゆれを吸収
    s = s
      .replace(/[×✕✖・⋅]/g, '*')   // × ・ ⋅
      .replace(/[÷∕]/g, '/')                      // ÷
      .replace(/[−–—－ー]/g, '-')    // − – — ー
      .replace(/[“”‘’]/g, '')
      .replace(/√/g, '#')                              // √ を内部記号 # に
      .replace(/sqrt/gi, '#')
      .replace(/root/gi, '#')
      .replace(/\bpi\b/gi, 'PI')
      .replace(/π/g, 'PI');

    // 「x=3」「y = 2」のように左辺が付いていても右辺だけ見る
    var eq = s.lastIndexOf('=');
    if (eq >= 0) s = s.slice(eq + 1);

    // 空白・カンマ区切りの桁区切りを除去（1,000 → 1000）
    s = s.replace(/(\d),(?=\d{3}\b)/g, '$1');
    s = s.replace(/\s+/g, '');

    return s;
  }

  /* ------------------------------------------------------------------
     2. トークナイザ（暗黙の掛け算をここで明示化する）
     ------------------------------------------------------------------ */

  var T_NUM = 'num', T_VAR = 'var', T_OP = 'op', T_LP = '(', T_RP = ')';

  function tokenize(s) {
    var tokens = [];
    var i = 0;
    while (i < s.length) {
      var c = s[i];

      if (c >= '0' && c <= '9' || c === '.') {
        var j = i;
        while (j < s.length && (s[j] >= '0' && s[j] <= '9' || s[j] === '.')) j++;
        var text = s.slice(i, j);
        if ((text.match(/\./g) || []).length > 1) throw new ParseError('数が不正です: ' + text);
        tokens.push({ t: T_NUM, v: parseFloat(text) });
        i = j;
        continue;
      }

      if (/[A-Za-z]/.test(c)) {
        // PI だけは 2 文字以上の名前として扱う。それ以外は 1 文字＝1 変数
        if (s.slice(i, i + 2) === 'PI') { tokens.push({ t: T_NUM, v: Math.PI }); i += 2; continue; }
        tokens.push({ t: T_VAR, v: c });
        i++;
        continue;
      }

      if ('+-*/^#'.indexOf(c) >= 0) { tokens.push({ t: T_OP, v: c }); i++; continue; }
      if (c === '(' || c === '{' || c === '[') { tokens.push({ t: T_LP }); i++; continue; }
      if (c === ')' || c === '}' || c === ']') { tokens.push({ t: T_RP }); i++; continue; }

      throw new ParseError('使えない文字です: ' + c);
    }

    // ---- 暗黙の掛け算を挿入 ----
    // 2x → 2*x / x(x+1) → x*(x+1) / )( → )*( / 2#3 → 2*#3 / xy → x*y
    var out = [];
    for (var k = 0; k < tokens.length; k++) {
      var prev = out[out.length - 1];
      var cur = tokens[k];
      if (prev) {
        var prevEnds = (prev.t === T_NUM || prev.t === T_VAR || prev.t === T_RP);
        var curStarts = (cur.t === T_NUM || cur.t === T_VAR || cur.t === T_LP ||
                         (cur.t === T_OP && cur.v === '#'));
        if (prevEnds && curStarts) out.push({ t: T_OP, v: '*' });
      }
      out.push(cur);
    }
    return out;
  }

  function ParseError(msg) { this.name = 'ParseError'; this.message = msg; }
  ParseError.prototype = Object.create(Error.prototype);

  /* ------------------------------------------------------------------
     3. パーサ（再帰下降）
        expr  := term (('+'|'-') term)*
        term  := unary (('*'|'/') unary)*
        unary := ('-'|'+') unary | power
        power := atom ('^' unary)?          ※ 右結合
        atom  := num | var | '(' expr ')' | '#' atom
     ------------------------------------------------------------------ */

  function parse(str) {
    var tokens = tokenize(str);
    var pos = 0;

    function peek() { return tokens[pos]; }
    function eat() { return tokens[pos++]; }
    function isOp(v) { var t = peek(); return t && t.t === T_OP && t.v === v; }

    function parseExpr() {
      var node = parseTerm();
      while (isOp('+') || isOp('-')) {
        var op = eat().v;
        node = { k: op, a: node, b: parseTerm() };
      }
      return node;
    }

    function parseTerm() {
      var node = parseUnary();
      while (isOp('*') || isOp('/')) {
        var op = eat().v;
        node = { k: op, a: node, b: parseUnary() };
      }
      return node;
    }

    function parseUnary() {
      if (isOp('-')) { eat(); return { k: 'neg', a: parseUnary() }; }
      if (isOp('+')) { eat(); return parseUnary(); }
      return parsePower();
    }

    function parsePower() {
      var base = parseAtom();
      if (isOp('^')) { eat(); return { k: '^', a: base, b: parseUnary() }; }
      return base;
    }

    function parseAtom() {
      var t = peek();
      if (!t) throw new ParseError('式が途中で終わっています');
      if (t.t === T_NUM) { eat(); return { k: 'num', v: t.v }; }
      if (t.t === T_VAR) { eat(); return { k: 'var', v: t.v }; }
      if (t.t === T_LP) {
        eat();
        var inner = parseExpr();
        if (!peek() || peek().t !== T_RP) throw new ParseError('カッコが閉じていません');
        eat();
        return inner;
      }
      if (t.t === T_OP && t.v === '#') { eat(); return { k: 'sqrt', a: parseAtom() }; }
      throw new ParseError('式が読み取れません');
    }

    var ast = parseExpr();
    if (pos !== tokens.length) throw new ParseError('式の後ろに余分な文字があります');
    return ast;
  }

  /* ------------------------------------------------------------------
     4. 評価と変数収集
     ------------------------------------------------------------------ */

  function evaluate(node, env) {
    switch (node.k) {
      case 'num': return node.v;
      case 'var':
        if (!(node.v in env)) throw new ParseError('未知の文字: ' + node.v);
        return env[node.v];
      case 'neg': return -evaluate(node.a, env);
      case '+': return evaluate(node.a, env) + evaluate(node.b, env);
      case '-': return evaluate(node.a, env) - evaluate(node.b, env);
      case '*': return evaluate(node.a, env) * evaluate(node.b, env);
      case '/': {
        var d = evaluate(node.b, env);
        if (d === 0) return NaN;
        return evaluate(node.a, env) / d;
      }
      case '^': {
        var base = evaluate(node.a, env), ex = evaluate(node.b, env);
        var r = Math.pow(base, ex);
        return isFinite(r) ? r : NaN;
      }
      case 'sqrt': {
        var x = evaluate(node.a, env);
        if (x < 0) return NaN;
        return Math.sqrt(x);
      }
    }
    throw new ParseError('評価できません');
  }

  function collectVars(node, set) {
    set = set || {};
    if (!node) return set;
    if (node.k === 'var') set[node.v] = true;
    ['a', 'b'].forEach(function (key) { if (node[key]) collectVars(node[key], set); });
    return set;
  }

  /* ------------------------------------------------------------------
     5. 同値判定（本体）
     ------------------------------------------------------------------ */

  // 判定に使う代入値。0 や 1 は「たまたま一致」しやすいので避ける。
  var SAMPLE_POINTS = [
    1.7182818, 2.3141592, -1.4142135, 3.7320508, -2.6180339,
    0.5772156, -4.1234567, 5.6180339, -0.7320508, 6.2831853
  ];

  /**
   * 2 つの数式が数学的に等しいかを判定する。
   * @param {string} userStr  生徒の入力
   * @param {string} answerStr 正答
   * @param {object} [opts]   { vars: ['x'], tol: 1e-9 }
   * @returns {boolean}
   */
  function isEqual(userStr, answerStr, opts) {
    opts = opts || {};
    var tol = opts.tol || 1e-9;

    var u = normalize(userStr);
    var a = normalize(answerStr);
    if (u === '') return false;

    var userAst, ansAst;
    try { userAst = parse(u); } catch (e) { return false; }   // 読めない入力は不正解
    try { ansAst = parse(a); } catch (e) {
      // 正答側が読めない＝出題データの不備。安全側に倒して文字列一致のみ。
      if (global.console) console.warn('[mathcore] 正答が数式として読めません:', answerStr);
      return u === a;
    }

    var userVars = collectVars(userAst);
    var ansVars = collectVars(ansAst);

    // 使ってよい文字は「正答に出てくる文字」だけ。
    // これを許すと y=2x の答えに z を混ぜても通ってしまう。
    for (var v in userVars) {
      if (!ansVars[v]) return false;
    }

    var vars = Object.keys(ansVars);

    // 定数同士なら 1 回の評価で足りる
    if (vars.length === 0) {
      var uv = evaluate(userAst, {});
      var av = evaluate(ansAst, {});
      return closeEnough(uv, av, tol);
    }

    // 変数がある場合は複数点で照合する（多項式恒等性テスト）
    var matched = 0, tried = 0;
    for (var i = 0; i < SAMPLE_POINTS.length && matched < 6; i++) {
      var env = {};
      for (var j = 0; j < vars.length; j++) {
        env[vars[j]] = SAMPLE_POINTS[(i + j * 3) % SAMPLE_POINTS.length];
      }
      var ue, ae;
      try { ue = evaluate(userAst, env); ae = evaluate(ansAst, env); }
      catch (e) { return false; }
      tried++;
      if (!isFinite(ue) || !isFinite(ae)) continue;  // 0 割などはこの点を捨てる
      if (!closeEnough(ue, ae, tol)) return false;
      matched++;
    }
    return matched >= 2;   // 有効な点が 2 つ以上一致して初めて正解
  }

  function closeEnough(x, y, tol) {
    if (typeof x !== 'number' || typeof y !== 'number') return false;
    if (isNaN(x) || isNaN(y)) return false;
    if (!isFinite(x) || !isFinite(y)) return false;
    var scale = Math.max(1, Math.abs(x), Math.abs(y));
    return Math.abs(x - y) <= tol * scale;
  }

  /** 数値としての正誤（分数・小数・√ を含む入力も可） */
  function isEqualNumber(userStr, answerValue, opts) {
    opts = opts || {};
    var tol = opts.tol || 1e-9;
    var u = normalize(userStr);
    if (u === '') return false;
    var ast;
    try { ast = parse(u); } catch (e) { return false; }
    if (Object.keys(collectVars(ast)).length > 0) return false;  // 文字が入っていたら不正解
    var val;
    try { val = evaluate(ast, {}); } catch (e) { return false; }
    return closeEnough(val, Number(answerValue), tol);
  }

  /**
   * 「x = 2, 3」のように解が複数ある答えの判定。順序は問わない。
   * @param {string} userStr
   * @param {number[]} answers
   */
  function isEqualSet(userStr, answers, opts) {
    opts = opts || {};
    var tol = opts.tol || 1e-9;
    var raw = String(userStr === null || userStr === undefined ? '' : userStr);
    raw = toHalfWidth(raw).replace(/[、，]/g, ',').replace(/\s*(?:または|or|and)\s*/gi, ',');
    // 「x=2,x=3」「x=2,3」どちらも受け付ける
    var parts = raw.split(',').map(function (p) { return p.trim(); }).filter(function (p) { return p !== ''; });
    if (parts.length !== answers.length) return false;

    var values = [];
    for (var i = 0; i < parts.length; i++) {
      var s = normalize(parts[i]);
      if (s === '') return false;
      var ast;
      try { ast = parse(s); } catch (e) { return false; }
      if (Object.keys(collectVars(ast)).length > 0) return false;
      try { values.push(evaluate(ast, {})); } catch (e) { return false; }
    }

    var remaining = answers.slice();
    for (var k = 0; k < values.length; k++) {
      var hit = -1;
      for (var m = 0; m < remaining.length; m++) {
        if (closeEnough(values[k], Number(remaining[m]), tol)) { hit = m; break; }
      }
      if (hit < 0) return false;
      remaining.splice(hit, 1);
    }
    return remaining.length === 0;
  }

  /* ------------------------------------------------------------------
     6. 「形」のチェック
        値が合っていても形が違えば不正解にすべき問題のために使う。
     ------------------------------------------------------------------ */

  /** 因数分解された形か（トップレベルに + / - が現れない＝積になっている） */
  function isFactoredForm(userStr) {
    var s = normalize(userStr);
    if (s === '') return false;
    var ast;
    try { ast = parse(s); } catch (e) { return false; }
    return isProductShape(ast);
  }

  function isProductShape(node) {
    if (node.k === '+' || node.k === '-') return false;
    if (node.k === 'neg') return isProductShape(node.a);
    if (node.k === '*' || node.k === '/') return true;   // 積の形になっている
    if (node.k === '^') return true;                     // (x+1)^2 も因数分解形
    return false;                                        // 単項・単独の数や文字は分解になっていない
  }

  /** 分母が有理化されているか（分母に √ が残っていない） */
  function isRationalized(userStr) {
    var s = normalize(userStr);
    if (s === '') return false;
    var ast;
    try { ast = parse(s); } catch (e) { return false; }
    return !denominatorHasSqrt(ast);
  }

  function denominatorHasSqrt(node) {
    if (!node) return false;
    if (node.k === '/') {
      if (containsSqrt(node.b)) return true;
    }
    return denominatorHasSqrt(node.a) || denominatorHasSqrt(node.b);
  }

  function containsSqrt(node) {
    if (!node) return false;
    if (node.k === 'sqrt') return true;
    return containsSqrt(node.a) || containsSqrt(node.b);
  }

  /** √ の中が最簡になっているか（√8 のように平方因数が残っていないか） */
  function isSimplestRadical(userStr) {
    var s = normalize(userStr);
    if (s === '') return false;
    var ast;
    try { ast = parse(s); } catch (e) { return false; }
    return checkRadicals(ast);
  }

  function checkRadicals(node) {
    if (!node) return true;
    if (node.k === 'sqrt') {
      // √ の中が定数なら平方因数が無いことを確かめる
      if (Object.keys(collectVars(node.a)).length === 0) {
        var v;
        try { v = evaluate(node.a, {}); } catch (e) { return true; }
        if (Number.isInteger(v) && v > 0 && hasSquareFactor(v)) return false;
      }
    }
    return checkRadicals(node.a) && checkRadicals(node.b);
  }

  function hasSquareFactor(n) {
    for (var d = 2; d * d <= n; d++) {
      if (n % (d * d) === 0) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------
     7. 表示用のユーティリティ
     ------------------------------------------------------------------ */

  /** 内部表記（#3, x^2, *）を人間が読む形（√3, x², ×省略）に直す */
  function pretty(str) {
    if (str === null || str === undefined) return '';
    var s = String(str)
      .replace(/#/g, '√')
      .replace(/\*/g, '')
      .replace(/\^2\b/g, '²')
      .replace(/\^3\b/g, '³')
      .replace(/<=/g, '≦')
      .replace(/>=/g, '≧');
    return s;
  }

  /** 最大公約数 */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }

  global.MathCore = {
    normalize: normalize,
    parse: parse,
    evaluate: evaluate,
    isEqual: isEqual,
    isEqualNumber: isEqualNumber,
    isEqualSet: isEqualSet,
    isFactoredForm: isFactoredForm,
    isRationalized: isRationalized,
    isSimplestRadical: isSimplestRadical,
    hasSquareFactor: hasSquareFactor,
    pretty: pretty,
    gcd: gcd
  };
})(typeof window !== 'undefined' ? window : globalThis);
