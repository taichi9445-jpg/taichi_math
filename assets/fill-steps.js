/* ===========================================================================
   fill-steps.js — 途中式の空欄にカードを入れる教材で共通に使う仕組み
   （27 相互関係の計算・28 面積の計算。29 正弦定理もこれを使う予定）
   ---------------------------------------------------------------------------
   使い方：
     FillSteps.mount({ el: '#app', problems: [...], hint: (p,row)=>'…', hintFig: (p,row)=>'<svg…>' });

   tabGroup: (p, i) => ({ id: 0, label: "基本" }) で問題のまとまりを色分け（0〜3）。
   問題 1 つのデータ：
     { q: '問題文', fig: '図のSVG（なくてよい）', rows: [ '1行目', '2行目', … ],
       cards: [ 'カード', ['ダミー', 'まちがえたときの一言'], … ], ans: '答え' }

   行の書き方（q・ans も同じ書き方）：
     {分子|分母}   縦の分数        [16/25]  空欄（中身が答えのカード）
     [6@s]        入れかえてよい空欄（@ の後が同じものどうしは、順番が逆でも正解）
     2√3          √（係数つき）    (…)²     中に分数があると大きなかっこになる
     ' = '        行が長すぎるときは「＝」の前で改行する
     行の先頭が #  ことばの行（「0° < A < 90° より」など）
     行の先頭が !  公式の行（うすい紫の背景と「公式」のしるし）
     行を { t: '…', h: 'ヒント' } にすると、その行のヒントを決められる
     行に sec: '見出し' をつけると、続けて同じ sec の行を1つの枠で囲む（30 の「三角比の値」など）
   カードの並びに null を入れると、そこで改行する（カードの種類ごとに行を分けたいとき）
   alts: [[空欄0の答え, 空欄1の答え, …], …] … 別の正しい答えの組（30 の単位円で考えた座標など）。
     どれか1つの組と、それまでに入れたカードがすべて合っていれば正解にする。
   スマホなど（PC の横長の画面でないとき）は、今の空欄の答えとダミー2つの3枚だけを出す（fewCards: false でやめる）。
   ヒントは、同じ行の空欄をうめているあいだは開いたまま。次の行に進むか、閉じるボタンで閉じる。
   skipAhead:true … 「S = [24/√2]」のような行で、同じ左辺のあとの行の答え（S = [12√2]）を入れても正解にして、とばした行は自動でうめる。
   softTrig:true … [sin 30°] の空欄に値 1/2 を入れても正解にして、sin 30° を入れ、ひとこと説明を出す。
   行に note: '式', noteAfter: 行番号 をつけると、その行が出たときに、この行の横に（式）を出す。
   行に cg: '名前' をつけると、同じ名前の行はスマホのカードの並びを同じにする（行の中でもカードの場所は変わらない）。
   ∫{上端|下端} 定積分の記号、⟦式⟧{上端|下端} 定積分の [ ]。² のほか ³⁴… や ′ も書ける。カードの値に {分子|分母} を使ってよい。
   行に sk: 1 をつけると、その行の空欄に次の行の答えを入れても正解にする（とばした行は自動でうめる）。
   p.eqs = { 空欄番号: { 値: つながる空欄番号 } } … 約分した値を先に入れてもよい空欄（次の行の同じ項も一緒にうまる）。
   p.big に式を入れると、問題の箱に大きく出す（p.q はその下の小さい文）。review:true で最後に「間違えた問題」の一覧を出す。
   行に pb: [[ダミー…], …]（空欄ごと）をつけると、スマホはその空欄の答え＋ダミーだけ（3〜4枚）を出す。rowCards:true は PC も行ごとのカードにする。
   06 の opt-in: roleCards:true は役割色・数カード固定/式3枚・復習を有効にする。
   roles は «x1|内容» の形（x1/y1/x2/y2/m）。指定のない教材には影響しない。
   expressionSlots は式を入れる空欄番号、expressionCards はその3択。
   ========================================================================= */
(function (global) {
  'use strict';

  var JP = '　-〿぀-ヿ一-鿿！-｠';
  var JP_RUN = new RegExp('([' + JP + ']+)|([^' + JP + ']+)', 'g');

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // √ は小さな SVG で描く（記号の右上から横線が切れ目なく中の数字にかぶさる）。中の数字は係数と同じ STIX。
  function radicalSVG(d) {
    var w = 16 + String(d).length * 11;
    return '<svg class="fs-root" width="' + (w / 20) + 'em" height="1.3em" viewBox="0 0 ' + w + ' 26" aria-label="√' + d + '">' +
      '<path d="M1 15 L4 13 L7.5 22.5 L13 3 H' + (w - 0.5) + '" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<text x="14.5" y="21" font-size="20" font-family="STIX Two Text, serif" fill="currentColor">' + d + '</text></svg>';
  }

  // 数式の部分：sin・cos・tan は立体、A や x などの文字は斜体、² は右上の小さい 2
  function mathRun(s) {
    var h = '';
    s.replace(/(\d*)√(\d+)|(sin|cos|tan)|([²³⁴⁵⁶⁷⁸⁹⁰¹ⁿ⁺⁻]+)|([A-Za-zθαβ])|(√)|(′)|([^A-Za-zθαβ²³⁴⁵⁶⁷⁸⁹⁰¹ⁿ⁺⁻√′]+?(?=\d*√|√|′|sin|cos|tan|[²³⁴⁵⁶⁷⁸⁹⁰¹ⁿ⁺⁻]|[A-Za-zθαβ]|$))/g,
      function (m, c, d, fn, sq, letter, root, prime) {
        if (d !== undefined) h += '<span class="fs-rt">' + (c || '') + radicalSVG(d) + '</span>';
        else if (fn) h += '<span class="fs-fn">' + fn + '</span>';
        else if (sq) h += '<sup>' + sq.replace(/./g, function (ch) { var k = '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch); return k >= 0 ? k : ch === 'ⁿ' ? '<i>n</i>' : ch === '⁺' ? '+' : '−'; }) + '</sup>';
        else if (letter) h += '<i' + (letter === 'f' || letter === 'F' ? ' class="fs-fl"' : '') + '>' + letter + '</i>';
        else if (root) h += '√';
        else if (prime) h += '<span class="pr">′</span>';
        else h += esc(m);
        return '';
      });
    return '<span class="fs-m">' + h + '</span>';
  }
  function runHTML(s) {
    return String(s).replace(JP_RUN, function (m, jp, mt) { return jp ? '<span class="fs-jp">' + esc(jp) + '</span>' : mathRun(mt); });
  }
  function frac(n, d) { return '<span class="fs-fr"><span>' + n + '</span><span>' + d + '</span></span>'; }

  // カードの中身（3/5 や −√21/2 は縦の分数にする）
  function valHTML(v) {
    if (/[{⟦]/.test(v)) return md(v);
    var m = String(v).match(/^(−?)([^\s\/]+)\/([^\s\/]+)$/);
    if (m) return '<span class="fs-sf">' + (m[1] ? '<span class="fs-m fs-minus">−</span>' : '') + frac(runHTML(m[2]), runHTML(m[3])) + '</span>';
    return runHTML(v);
  }

  function closing(s, i, open, close) {
    for (var depth = 0, j = i; j < s.length; j++) {
      if (s[j] === open) depth++;
      else if (s[j] === close && --depth === 0) return j;
    }
    return s.length;
  }
  // 「{…}」「[…]」「⦅…⦆」の外にある区切りで分ける
  function splitTop(s, sep) {
    var out = [], depth = 0, last = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '{' || ch === '[' || ch === '⦅' || ch === '«' || ch === '⟦') depth++;
      else if (ch === '}' || ch === ']' || ch === '⦆' || ch === '»' || ch === '⟧') depth--;
      else if (depth === 0 && s.substr(i, sep.length) === sep) { out.push(s.slice(last, i)); last = i + sep.length; i += sep.length - 1; }
    }
    out.push(s.slice(last));
    return out;
  }
  // 分数の入ったかっこは大きくする（空欄の答えそのものの (−{1|3}) は変えない）
  function bigParens(s) { return s.replace(/\(([^()]*[{\/][^()]*)\)/g, function (m, g, at) { return s[at - 1] === '[' && s[at + m.length] === ']' ? m : '⦅' + g + '⦆'; }); }

  var INT_SVG = '<svg class="fs-igs" viewBox="0 0 14 40" aria-hidden="true"><path d="M12.8 4.4c-.9-2.3-3.4-2.7-4.4-.6-.8 1.6-.9 4-1.1 7l-1.3 18.4c-.2 3-.5 5.6-1.3 7-1.1 1.9-3.4 1.6-4.1-.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  function parse(s, ctx) {
    var out = '', buf = '', i = 0;
    function flush() { if (buf) { out += runHTML(buf); buf = ''; } }
    while (i < s.length) {
      var ch = s[i], j;
      if (ch === '«') {
        flush(); j = s.indexOf('»', i);
        var roleEnd = s.indexOf('|', i), role = s.slice(i + 1, roleEnd);
        out += '<span class="fs-role role-' + (/^(x1|y1|x2|y2|m)$/.test(role) ? role : 'none') + '">' + parse(s.slice(roleEnd + 1, j), ctx) + '</span>';
        i = j + 1;
      } else if (ch === '∫') {
        flush();
        if (s[i + 1] === '{') {
          j = closing(s, i + 1, '{', '}');
          var lim = splitTop(s.slice(i + 2, j), '|');
          out += '<span class="fs-int">' + INT_SVG + '<span class="fs-lim"><span>' + parse(lim[0], ctx) + '</span><span>' + parse(lim[1] || '', ctx) + '</span></span></span>';
          i = j + 1;
        } else { out += '<span class="fs-int">' + INT_SVG + '</span>'; i++; }
      } else if (ch === '⟦') {
        flush(); j = closing(s, i, '⟦', '⟧');
        var ev = parse(s.slice(i + 1, j), ctx), evl = '';
        i = j + 1;
        if (s[i] === '{') {
          j = closing(s, i, '{', '}');
          var el = splitTop(s.slice(i + 1, j), '|');
          evl = '<span class="fs-lim"><span>' + parse(el[0], ctx) + '</span><span>' + parse(el[1] || '', ctx) + '</span></span>';
          i = j + 1;
        }
        out += '<span class="fs-ev"><span class="fs-evb">[</span>' + ev + '<span class="fs-evb">]</span>' + evl + '</span>';
      } else if (ch === '{') {
        flush(); j = closing(s, i, '{', '}');
        var parts = splitTop(s.slice(i + 1, j), '|');
        out += frac(parse(parts[0], ctx), parse(parts[1] || '', ctx));
        i = j + 1;
      } else if (ch === '[') {
        flush(); j = s.indexOf(']', i);
        out += ctx.blank(s.slice(i + 1, j));
        i = j + 1;
      } else if (ch === '⦅') {
        flush(); j = closing(s, i, '⦅', '⦆');
        var inner = parse(s.slice(i + 1, j), ctx), sup = '';
        i = j + 1;
        if (s[i] === '²') { sup = '<sup>2</sup>'; i++; }
        out += '<span class="fs-pg"><span class="fs-bp">(</span>' + inner + '<span class="fs-bp">)</span>' + sup + '</span>';
      } else { buf += ch; i++; }
    }
    flush();
    return out;
  }
  // 空欄のない式（問題文・答え・解説など）を HTML にする
  function md(s) { return parse(bigParens(String(s)), { blank: function (v) { return valHTML(v.split('@')[0]); } }); }

  function rowObj(r) { return typeof r === 'string' ? { t: r } : r; }

  // 表示・alts用の番号は分子からのまま。移動順だけ分母を先にする。
  function blankVisitOrder(src, start) {
    var next = start;
    function walk(s) {
      var order = [];
      for (var i = 0; i < s.length;) {
        if (s[i] === '[') {
          order.push(next++); i = s.indexOf(']', i) + 1;
        } else if (s[i] === '{') {
          var end = closing(s, i, '{', '}'), parts = splitTop(s.slice(i + 1, end), '|');
          var numerator = walk(parts[0]), denominator = walk(parts[1] || '');
          order = order.concat(denominator, numerator); i = end + 1;
        } else { i++; }
      }
      return order;
    }
    return walk(src);
  }

  var SIN_VALUE = { 30: '1/2', 45: '1/√2', 60: '√3/2', 90: '1', 120: '√3/2', 135: '1/√2', 150: '1/2' };
  function prepare(p, o) {
    p.rows = p.rows.map(rowObj);
    p.blanks = [];
    p.blankOrder = [];
    p.rows.forEach(function (row, ri) {
      row.prose = row.t[0] === '#';
      row.formula = row.t[0] === '!';
      row.src = bigParens(row.prose || row.formula ? row.t.slice(1) : row.t);
      row.blanks = [];
      p.blankOrder = p.blankOrder.concat(blankVisitOrder(row.src, p.blanks.length));
      parse(row.src, { blank: function (spec) {
        var sp = spec.split('@'), b = { a: sp[0], g: sp[1] || null, row: ri, i: p.blanks.length };
        p.blanks.push(b); row.blanks.push(b.i); return '';
      } });
    });
    p.cards = p.cards.map(function (c) { return c === null ? { sep: true } : Array.isArray(c) ? { v: c[0], why: c[1] } : { v: c }; });
    p.rows.forEach(function (row, ri) {
      if (!row.sk) return;
      var next = p.rows.slice(ri + 1).filter(function (r) { return r.blanks.length; })[0];
      if (next) row.blanks.forEach(function (i) { p.blanks[i].jump = [next.blanks[next.blanks.length - 1]]; });
    });
    if (o.softTrig) p.blanks.forEach(function (b) {
      var m = b.a.match(/^sin (\d+)°$/), val = m && SIN_VALUE[m[1]];
      if (!val || p.rows[b.row].blanks.some(function (i) { return p.blanks[i].a === val; })) return;
      if (p.cards.some(function (c) { return c.v === val; })) b.soft = [val];
    });
    if (o.skipAhead) {
      var ends = [];
      p.rows.forEach(function (row) {
        if (row.prose || row.formula || !row.blanks.length) return;
        var segs = splitTop(row.src, ' = ');
        if (segs.length > 1 && /^\[[^\]]+\]$/.test(segs[segs.length - 1])) ends.push({ lhs: segs[0], b: row.blanks[row.blanks.length - 1] });
      });
      ends.forEach(function (e, k) {
        var later = ends.slice(k + 1).filter(function (x) { return x.lhs === e.lhs; }).map(function (x) { return x.b; });
        if (later.length) p.blanks[e.b].jump = later;
      });
    }
  }

  function mount(o) {
    var root = typeof o.el === 'string' ? document.querySelector(o.el) : o.el;
    var P = o.problems;
    P.forEach(function (p) { prepare(p, o); });
    var S = P.map(function () { return fresh(); });
    var cur = 0, hintOpen = false, hintRow = -1, msg = '', finalView = false;
    var wide = window.matchMedia ? matchMedia('(min-width:900px) and (orientation:landscape)') : { matches: true };
    if (wide.addEventListener) wide.addEventListener('change', function () { render(); });

    function fresh() { return { fill: {}, active: null, shown: false, done: false, miss: 0, wrongBlanks: {}, says: {} }; }
    function firstEmpty(p, st) { for (var n = 0; n < p.blankOrder.length; n++) { var i = p.blankOrder[n]; if (st.fill[i] === undefined) return i; } return null; }
    function rowDone(p, st, ri) { return p.rows[ri].blanks.every(function (b) { return st.fill[b] !== undefined; }); }

    // その空欄に、そのカードを入れてよいか（@ のついた空欄は、同じ組の中で入れかえてよい）
    function accepts(p, st, i, v) {
      var b = p.blanks[i];
      if (!b.g && p.alts) {
        return [p.blanks.map(function (x) { return x.a; })].concat(p.alts).some(function (set) {
          if (set[i] !== v) return false;
          for (var k in st.fill) if (!p.blanks[k].g && set[k] !== st.fill[k]) return false;
          return true;
        });
      }
      if (!b.g) return b.a === v;
      var pool = [];
      p.blanks.forEach(function (x) { if (x.g === b.g) pool.push(x.a); });
      p.blanks.forEach(function (x) {
        if (x.g === b.g && x.i !== i && st.fill[x.i] !== undefined) { var k = pool.indexOf(st.fill[x.i]); if (k >= 0) pool.splice(k, 1); }
      });
      return pool.indexOf(v) >= 0;
    }
    function needCount(p, v) {
      // 単位円の座標と三角比で同じカードを使う別解も、最後まで使える回数を確保。
      var sets = [p.blanks.map(function (b) { return b.a; })].concat(p.alts || []);
      return Math.max.apply(null, sets.map(function (set) { return set.filter(function (a) { return a === v; }).length; }));
    }
    function usedCount(p, st, v) { var n = 0; for (var k in st.fill) if (st.fill[k] === v) n++; return n; }
    function isOff(p, st, v) { var need = needCount(p, v); return need > 0 && usedCount(p, st, v) >= need; }

    // スマホ：その行（cg の行）の答えのカードと、なるべく同じ種類のダミー。
    //   行の中ではカードの場所を変えない（同じカードを続けて押せるように、問題と行の番号だけで並びを決める）
    function kind(v) { v = String(v); return /^(sin|cos|tan)/.test(v) ? 't' : /[A-Za-zθ]/.test(v) ? 'v' : /[\/{]/.test(v) ? 'f' : /√/.test(v) ? 'r' : /°/.test(v) ? 'd' : 'n'; }
    function fewRows(p, ri) {
      var cg = p.rows[ri].cg, out = [];
      if (!cg) return [ri];
      p.rows.forEach(function (r, k) { if (r.cg === cg) out.push(k); });
      return out;
    }
    function fewCards(p, st, i) {
      var ri = p.blanks[i].row, row = p.rows[ri], per = !!row.pb && !wide.matches;
      var key = (wide.matches ? 'w' : '') + (per ? 'b' + i : row.cg || 'r' + ri);
      p.fewSets = p.fewSets || {};
      if (p.fewSets[key] !== undefined) return p.fewSets[key];
      var seed = (P.indexOf(p) + 1) * 7919 + (fewRows(p, ri)[0] + 1) * 104729 + (per ? i * 31 : 0) + 17;
      var rnd = function () { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
      var vals = [], miss = false, first = {}, pref = [];
      p.cards.forEach(function (c, ci) { if (!c.sep && first[c.v] === undefined) first[c.v] = ci; });
      function add(v, must) { if (first[v] === undefined) { if (must) miss = true; return; } if (vals.indexOf(v) < 0) vals.push(v); }
      (per ? [i] : [].concat.apply([], fewRows(p, ri).map(function (r) { return p.rows[r].blanks; }))).forEach(function (bi) {
        var b = p.blanks[bi];
        add(b.a, true);
        (b.soft || []).forEach(function (v) { add(v); });
        if (b.jump) add(p.blanks[b.jump[b.jump.length - 1]].a);
        if (p.eqs && p.eqs[bi]) Object.keys(p.eqs[bi]).forEach(function (v) { add(v); });
        if (o.roleCards) (p.alts || []).forEach(function (set) { add(set[bi]); });
      });
      if (miss) return (p.fewSets[key] = null);
      if (row.pb) pref = per ? row.pb[row.blanks.indexOf(i)] || [] : [].concat.apply([], row.pb);
      var pool = Object.keys(first).filter(function (v) { return vals.indexOf(v) < 0 && (!o.roleCards || p.numericCards.indexOf(first[v]) >= 0); });
      var k = kind(vals[0]), letters = vals.every(function (v) { return /^[A-Za-zθ]$/.test(v); }), n = vals.length;
      var want = letters && n >= 3 ? 0 : n >= 4 ? 0 : n === 3 ? 1 : 3 - n;
      if (wide.matches) want += 3;
      var others = pool.map(function (v) { return { ci: first[v], w: (pref.indexOf(v) >= 0 ? -2 : 0) + (kind(v) === k ? 0 : 1) + rnd() }; })
        .sort(function (a, b) { return a.w - b.w; }).slice(0, want).map(function (x) { return x.ci; });
      var set = vals.map(function (v) { return first[v]; }).concat(others);
      for (var m = set.length - 1; m > 0; m--) { var j = Math.floor(rnd() * (m + 1)), t = set[m]; set[m] = set[j]; set[j] = t; }
      return (p.fewSets[key] = set);
    }
    // スマホのカード：その行で使い切ったカードだけうすくする（場所はそのまま）
    function fewOff(p, st, v) {
      var need = 0, used = 0;
      fewRows(p, p.blanks[st.active].row).forEach(function (r) {
        p.rows[r].blanks.forEach(function (bi) { if (p.blanks[bi].a === v) need++; if (st.fill[bi] === v) used++; });
      });
      return need > 0 && used >= need;
    }

    function render() {
      if (finalView) return renderFinal();
      var p = P[cur], st = S[cur];
      if (st.active === null || st.fill[st.active] !== undefined) st.active = firstEmpty(p, st);
      if (o.before) o.before(p, st);
      var all = st.shown || st.done;
      var activeRow = st.active === null ? -1 : p.blanks[st.active].row;
      if (hintOpen && (all || activeRow !== hintRow)) hintOpen = false;
      var stop = all ? p.rows.length : -1;
      if (!all) { stop = p.rows.length; for (var r = 0; r < p.rows.length; r++) if (!rowDone(p, st, r)) { stop = r + 1; break; } }

      var no = 0, rows = '', sec = null;
      p.rows.forEach(function (row, ri) {
        if (ri >= stop) return;
        if ((row.sec || null) !== sec) {
          if (sec) rows += '</ol></li>';
          sec = row.sec || null;
          if (sec) rows += '<li class="fs-sec"><p class="fs-sec-h">' + md(sec) + '</p><ol class="fs-rows">';
        }
        var ctx = { k: 0, blank: function () {
          var i = row.blanks[ctx.k++], b = p.blanks[i], v = st.fill[i];
          var isFrac = (/\//.test(b.a) && !/\s/.test(b.a)) || /\{/.test(b.a);
          var cls = 'fs-blank' + (isFrac ? ' frac' : '') + (v !== undefined ? ' ok' : '') + (i === st.active && !all ? ' active' : '') + ((o.roleCards || o.review) && st.wrongBlanks[i] ? ' reviewed-wrong' : '');
          return '<button type="button" class="' + cls + '" data-b="' + i + '" aria-label="空欄">' + (v !== undefined ? valHTML(v) : '') + '</button>';
        } };
        var body;
        if (row.prose) body = '<div class="fs-prose">' + parse(row.src, ctx) + '</div>';
        else body = '<div class="fs-eq">' + splitTop(row.src, ' = ').map(function (g, gi) {
          return '<span class="fs-g">' + (gi ? '<span class="fs-m fs-eqs">=</span>' : '') + parse(g, ctx) + '</span>';
        }).join('') + (row.note && stop > row.noteAfter ? '<span class="fs-g fs-rnote">（' + md(row.note) + '）</span>' : '') + '</div>';
        rows += '<li class="fs-row' + (row.prose ? ' prose' : '') + (row.formula ? ' formula' : '') + (ri === activeRow && !all ? ' now' : '') + '">' +
          (row.prose ? '<span class="fs-no"></span>' : '<span class="fs-no">' + (++no) + '</span>') + (row.formula ? '<span class="fs-ftag">公式</span>' : '') + body + '</li>';
        if (st.says[ri]) rows += '<li class="fs-say">' + md(st.says[ri]) + '</li>';
        if (hintOpen && ri === activeRow && !all) rows += '<li class="fs-hint"><b>ヒント</b><button type="button" class="fs-hx" data-act="hint" aria-label="ヒントを閉じる">×</button>' + hintHTML(p, row) + '</li>';
      });
      if (sec) rows += '</ol></li>';

      var groupInfo = P.map(function (p, i) {
        var g = o.tabGroup ? o.tabGroup(p, i) : null;
        return g === null || g === undefined ? null : typeof g === 'object' ? g : { id: g, label: 'グループ ' + (Number(g) + 1) };
      });
      var tabs = P.map(function (_, i) {
        var s = S[i], g = groupInfo[i], groupClass = g ? ' fs-group-' + (Math.abs(Number(g.id) || 0) % 4) + (i && groupInfo[i - 1] && groupInfo[i - 1].id !== g.id ? ' fs-group-start' : '') : '';
        var groupTitle = g ? ' title="' + esc(g.label) + '"' : '';
        return '<button type="button" class="fs-tab' + groupClass + (i === cur ? ' cur' : '') + (s.done ? ' done' : s.shown ? ' shown' : '') + '"' + groupTitle + ' data-go="' + i + '" aria-label="問' + (i + 1) + '">' + (o.tabLabel ? o.tabLabel(P[i], i) : (i + 1)) + '</button>';
      }).join('');

      var few = o.fewCards !== false && (!wide.matches || o.rowCards) && !all && st.active !== null ? fewCards(p, st, st.active) : null;
      if (o.roleCards) {
        few = p.expressionSlots.includes(st.active) ? p.expressionCards[st.active] : few || p.numericCards;
      }
      var cards = (few || p.cards.map(function (_, ci) { return ci; })).map(function (ci) {
        var c = p.cards[ci];
        if (c.sep) return '<span class="fs-sep"></span>';
        var off = all || (few ? fewOff(p, st, c.v) : isOff(p, st, c.v));
        if (o.roleCards) off = all;   // 同じ数はカード1枚で、何回でも使える
        return '<button type="button" class="fs-card' + (off ? ' used' : '') + '" data-c="' + ci + '"' + (off ? ' disabled' : '') + '>' + valHTML(c.v) + '</button>';
      }).join('');

      var done = '';
      if (all) done = '<div class="fs-done' + (st.shown && !st.done ? ' shown' : '') + '"><b>' + (st.done ? '正解' : '答え') + '</b>' +
        '<span>' + md(p.ans) + '</span></div>';

      root.innerHTML =
        '<nav class="fs-tabs">' + (o.tabsBefore || '') + '<span>' + (o.tabPrefix === undefined ? '問' : o.tabPrefix) + '</span>' + tabs + '</nav>' +
        '<div class="fs-grid"><section class="fs-main">' + (o.top ? o.top(p) : '') +
        '<div class="fs-q' + (p.fig ? ' has-fig' : '') + '"><p class="fs-qt"><span class="fs-badge">' + (o.badge ? o.badge(p, cur) : '問' + (cur + 1)) + '</span>' + (p.big ? '<span class="big-formula">' + md(p.big) + '</span><span class="ask">' + md(p.q) + '</span>' : md(p.q)) + '</p>' + (p.fig ? '<div class="fs-fig">' + p.fig + '</div>' : '') + '</div>' +
        '<ol class="fs-rows">' + rows + '</ol>' + done +
        '<div class="fs-ctrl">' +
        (all ? '' : '<button type="button" class="fs-btn" data-act="hint">' + (hintOpen ? 'ヒントを閉じる' : 'ヒント') + '</button><button type="button" class="fs-btn" data-act="show">答えを見る</button>') +
        ((all || Object.keys(st.fill).length) ? '<button type="button" class="fs-btn" data-act="reset">やり直す</button>' : '') + '</div>' +
        '<div class="fs-nav"><button type="button" class="fs-btn" data-act="prev"' + (cur ? '' : ' disabled') + '>前の問題</button>' +
        '<button type="button" class="fs-btn' + (all ? ' primary' : '') + '" data-act="next">' + (cur === P.length - 1 ? '結果を見る' : '次の問題') + '</button></div>' +
        '</section><aside class="fs-bank"' + (all ? ' hidden' : '') + '><p class="fs-msg" role="status"' + (msg ? '' : ' hidden') + '>' + msg + '</p><div class="fs-cards' + (few && (!wide.matches || o.roleCards) ? ' few' + (few.length > 4 ? ' many' : '') : '') + '">' + cards + '</div></aside></div>';

      bind(p, st);
      layout();
      if (o.after) o.after(root, p, st);
      // 役わりの色のふち用に、数の文字を data-t に写す（after で書きかえた問題文も。fill-steps.css の .fs-role）
      if (o.roleCards) root.querySelectorAll('.fs-role .fs-m').forEach(function (e) { if (!e.children.length) e.setAttribute('data-t', e.textContent); });
    }

    function hintHTML(p, row) {
      var h = row.h || (o.hint ? o.hint(p, row) : '') || '直前の行の式を見て、次に何をするか考えよう。';
      return '<div>' + md(h) + '</div>' + (o.hintFig ? (o.hintFig(p, row) || '') : '');
    }

    // 値を入れても正解にする空欄（@ の組は、まだ入っていない空欄をさがす）
    function softOwner(p, st, i, v) {
      var b = p.blanks[i], list = b.g ? p.blanks.filter(function (x) { return x.g === b.g && st.fill[x.i] === undefined; }) : [b];
      for (var n = 0; n < list.length; n++) if ((list[n].soft || []).indexOf(v) >= 0) return list[n];
      return null;
    }
    function jumpTo(p, i, v) {
      var t = (p.blanks[i].jump || []).filter(function (k) { return p.blanks[k].a === v; });
      return t.length ? t[0] : null;
    }

    function place(i, v) {
      var p = P[cur], st = S[cur];
      if (st.done || st.shown || st.fill[i] !== undefined) return;
      var link = p.eqs && p.eqs[i] ? p.eqs[i][v] : undefined;
      if (link !== undefined) {
        st.fill[i] = v; st.fill[link] = v; msg = ''; st.active = null;
        if (firstEmpty(p, st) === null) st.done = true;
        render(); follow();
        return;
      }
      var good = accepts(p, st, i, v), soft = good ? null : softOwner(p, st, i, v), jump = good || soft ? null : jumpTo(p, i, v);
      if (soft !== null) {
        st.fill[i] = soft.a; msg = ''; st.active = null;
        st.says[p.blanks[i].row] = '（' + v + ' でも正解。ここは公式どおり ' + soft.a + ' と書いて、値はあとの行で入れよう）';
        render(); follow();
      } else if (jump !== null) {
        p.blanks.forEach(function (x) { if (x.i <= jump && st.fill[x.i] === undefined) st.fill[x.i] = x.a; });
        msg = ''; st.active = null;
        st.says[p.blanks[jump].row] = '（途中をとばしても正解。とばした行も見ておこう）';
        if (firstEmpty(p, st) === null) st.done = true;
        render(); follow();
      } else if (good) {
        st.fill[i] = v; msg = ''; st.active = null;
        if (firstEmpty(p, st) === null) st.done = true;
        render(); follow();
      } else {
        st.miss++;
        st.wrongBlanks[i] = true;
        var card = p.cards.filter(function (c) { return c.v === v; })[0];
        var row = p.rows[p.blanks[i].row];
        msg = (card && card.why) || (o.wrong && o.wrong(p, p.blanks[i], v)) || ('その空欄には入りません。' + (row.h ? '' : 'ヒントも見てみよう。'));
        msg = md(msg);
        render();
        var el = root.querySelector('[data-b="' + i + '"]');
        if (el) { el.classList.add('ng'); setTimeout(function () { el.classList.remove('ng'); }, 500); }
      }
    }

    function bind(p, st) {
      root.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { go(+b.dataset.go); }; });
      root.querySelectorAll('[data-b]').forEach(function (b) {
        b.onclick = function () { var i = +b.dataset.b; if (st.fill[i] === undefined) { st.active = i; render(); } };
      });
      root.querySelectorAll('[data-c]').forEach(function (b) {
        var v = p.cards[+b.dataset.c].v;
        b.onclick = function () { if (b._dragged) { b._dragged = false; return; } if (st.active !== null) place(st.active, v); };
        drag(b, v);
      });
      root.querySelectorAll('[data-act]').forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === 'hint') { hintOpen = !hintOpen; hintRow = st.active === null ? -1 : p.blanks[st.active].row; render(); if (hintOpen) follow('.fs-hint'); }
          else if (a === 'show') { p.blanks.forEach(function (x) { st.fill[x.i] = x.a; }); st.shown = true; msg = ''; render(); }
          else if (a === 'reset') { S[cur] = fresh(); msg = ''; hintOpen = false; render(); window.scrollTo(0, 0); }
          else if (a === 'prev') go(cur - 1);
          else if (a === 'next') { if (cur === P.length - 1) { finalView = true; render(); window.scrollTo(0, 0); } else go(cur + 1); }
        };
      });
    }

    // カードを空欄までドラッグして入れる（スマホの指でも動くように pointer events で作る）
    //   指のときは touch events を使う（pointer events は、ページのスクロールの勢いが残っていると取り消されて、ドラッグできなかった）
    function drag(b, v) {
      var start = null, ghost = null;
      function begin(x, y) { if (b.disabled) return false; start = [x, y]; b._dragged = false; return true; }
      function move(x, y) {
        if (!start) return;
        if (!b._dragged && Math.hypot(x - start[0], y - start[1]) < 8) return;
        b._dragged = true;
        if (!ghost) { ghost = b.cloneNode(true); ghost.className = 'fs-card fs-ghost'; document.body.appendChild(ghost); }
        ghost.style.left = x + 'px'; ghost.style.top = y + 'px';
        root.querySelectorAll('.fs-blank.over').forEach(function (z) { z.classList.remove('over'); });
        var z = document.elementFromPoint(x, y); z = z && z.closest('.fs-blank:not(.ok)');
        if (z) z.classList.add('over');
      }
      function end(x, y) {
        if (!start) return; start = null;
        if (ghost) { ghost.remove(); ghost = null; }
        if (b._dragged) {
          var z = document.elementFromPoint(x, y); z = z && z.closest('.fs-blank');
          if (z) place(+z.dataset.b, v); else root.querySelectorAll('.fs-blank.over').forEach(function (q) { q.classList.remove('over'); });
        }
      }
      function cancel() { start = null; if (ghost) { ghost.remove(); ghost = null; } b._dragged = false; }
      b.onpointerdown = function (e) { if (e.pointerType === 'touch') return; if (begin(e.clientX, e.clientY)) try { b.setPointerCapture(e.pointerId); } catch (_) {} };
      b.onpointermove = function (e) { if (e.pointerType !== 'touch') move(e.clientX, e.clientY); };
      b.onpointerup = function (e) { if (e.pointerType !== 'touch') end(e.clientX, e.clientY); };
      b.onpointercancel = function (e) { if (e.pointerType !== 'touch') cancel(); };
      b.addEventListener('touchstart', function (e) { begin(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      b.addEventListener('touchmove', function (e) { if (!start) return; if (e.cancelable) e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
      b.addEventListener('touchend', function (e) { var dragged = b._dragged, t = e.changedTouches[0]; end(t.clientX, t.clientY); if (dragged && e.cancelable) e.preventDefault(); });
      b.addEventListener('touchcancel', cancel);
    }

    // 入れたあと、次の空欄の行がカードの箱に隠れないように少し動かす
    function follow(sel) {
      requestAnimationFrame(function () {
        var t = root.querySelector(sel || '.fs-row.now') || root.querySelector('.fs-done');
        if (!t) return;
        var bank = root.querySelector('.fs-bank'), r = t.getBoundingClientRect();
        var bottom = innerHeight - 12;
        if (bank && !bank.hidden && getComputedStyle(bank).position === 'sticky' && bank.getBoundingClientRect().top > innerHeight / 3) bottom = bank.getBoundingClientRect().top - 12;
        if (r.bottom > bottom) window.scrollBy({ top: r.bottom - bottom, behavior: 'smooth' });
        else if (r.top < 8) window.scrollBy({ top: r.top - 8, behavior: 'smooth' });
      });
    }

    // 式が横に入りきらないとき：まず少し小さくする → それでも入らなければ「＝」の前で改行 → さらに小さく
    function layout() {
      root.querySelectorAll('.fs-card').forEach(function (c) {
        c.style.fontSize = '';
        var size = parseFloat(getComputedStyle(c).fontSize);
        while (c.scrollWidth > c.clientWidth + 1 && size > 11) { size -= 1; c.style.fontSize = size + 'px'; }
      });
      root.querySelectorAll('.fs-eq').forEach(function (e) {
        e.classList.remove('fs-wrapeq'); e.style.fontSize = '';
        var base = parseFloat(getComputedStyle(e).fontSize), size = base;
        var over = function () { return e.scrollWidth > e.clientWidth + 1; };
        while (over() && size > base * 0.78) { size -= 1; e.style.fontSize = size + 'px'; }
        if (!over()) return;
        e.style.fontSize = ''; size = base; e.classList.add('fs-wrapeq');
        while (over() && size > base * 0.72) { size -= 1; e.style.fontSize = size + 'px'; }
      });
    }

    function go(i) { cur = Math.max(0, Math.min(P.length - 1, i)); msg = ''; hintOpen = false; finalView = false; render(); window.scrollTo(0, 0); }

    function renderFinal() {
      var self = S.filter(function (s) { return s.done && !s.shown; }).length, shown = S.filter(function (s) { return s.shown; }).length;
      var miss = S.reduce(function (a, s) { return a + s.miss; }, 0);
      root.innerHTML = '<section class="fs-final"><h2>学習の記録</h2>' +
        '<p>自分で全部うめた問題　<b>' + self + '</b> / ' + P.length + '</p><p>答えを見た問題　' + shown + '</p><p>まちがえて入れた回数　' + miss + '</p>' +
        '<div class="fs-nav"><button type="button" class="fs-btn" data-act="back">問題にもどる</button><button type="button" class="fs-btn primary" data-act="again">最初からやり直す</button></div>' +
        (o.finalExtra || '<p><a href="../index.html">教材の一覧へ</a></p>') + '</section>';
      if (o.roleCards || o.review) {
        var review = document.createElement('div');
        var ids = S.map(function(s,i){return s.miss || s.shown ? i : -1;}).filter(function(i){return i>=0;});
        review.innerHTML = ids.length ? '<h3>間違えた問題を確認する</h3>' + ids.map(function(i){return '<button class="fs-btn" data-review="'+i+'">問'+(i+1)+'：まちがい '+S[i].miss+'回'+(S[i].shown?'・答えを見た':'')+'</button>';}).join('') : '<p>間違えた問題はありません</p>';
        root.querySelector('.fs-final').append(review);
        review.querySelectorAll('[data-review]').forEach(function(b){b.onclick=function(){var i=+b.dataset.review;var sets=[P[i].blanks.map(function(b){return b.a;})].concat(P[i].alts||[]), chosen=sets.find(function(set){return Object.keys(S[i].fill).every(function(k){return set[k]===S[i].fill[k];});})||sets[0];P[i].blanks.forEach(function(x){if(S[i].fill[x.i]===undefined)S[i].fill[x.i]=chosen[x.i];});S[i].shown = S[i].shown || !S[i].done;go(i);};});
      }
      root.querySelector('[data-act="back"]').onclick = function () { finalView = false; render(); };
      root.querySelector('[data-act="again"]').onclick = function () { S = P.map(fresh); go(0); };
    }

    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    render();
    return { go: go, state: function () { return S; } };
  }

  global.FillSteps = { mount: mount, md: md, valHTML: valHTML, radicalSVG: radicalSVG };
})(window);
