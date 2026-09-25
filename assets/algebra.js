/* ===========================================================================
   algebra.js  —  展開・因数分解まわりの共通部品
   ---------------------------------------------------------------------------
   展開／因数分解／2次方程式／2次不等式の教材は、
   「(x+a)(x+b) を作って、その展開形も一緒に持っておく」という
   同じ処理を何度も使う。教材ごとに書くと必ずどこかで符号をまちがえるので、
   ここに 1 か所だけ置いて、全部そこから作る。
   ========================================================================= */
(function (global) {
  'use strict';

  var F = global.Quiz ? global.Quiz.fmt : null;

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function nz(min, max) { var v = 0; while (v === 0) v = randInt(min, max); return v; }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }

  /* ------------------------------------------------------------------
     1 次式 (px + q) の表示
     ------------------------------------------------------------------ */
  function linear(p, q, v) {
    v = v || 'x';
    var head = p === 1 ? v : p === -1 ? '-' + v : p + v;
    if (q === 0) return head;
    return head + (q < 0 ? ' - ' : ' + ') + Math.abs(q);
  }

  /** かっこつきの 1 次式。(x + 3) のように出す */
  function paren(p, q, v) { return '(' + linear(p, q, v) + ')'; }

  /* ------------------------------------------------------------------
     (x + a)(x + b) 型
     ------------------------------------------------------------------ */

  /**
   * 因数分解できる 2 次式をひとつ作る。
   * 返り値は「因数の形」と「展開の形」の両方を持つ。
   *   { a, b, sum, prod, factored, expanded, coefs:{x2,x1,x0} }
   */
  function quadraticFromRoots(opt) {
    opt = opt || {};
    var lo = opt.lo === undefined ? -9 : opt.lo;
    var hi = opt.hi === undefined ? 9 : opt.hi;
    var allowSame = opt.allowSame !== false;

    var a = nz(lo, hi), b = nz(lo, hi);
    if (!allowSame && a === b) b = (b === hi ? hi - 1 : b + 1) || 1;

    var sum = a + b, prod = a * b;
    return {
      a: a, b: b, sum: sum, prod: prod,
      coefs: { x2: 1, x1: sum, x0: prod },
      factored: paren(1, a) + paren(1, b),
      expanded: F.poly([[1, F.pow('x', 2)], [sum, 'x'], [prod, '']]),
      roots: [-a, -b]
    };
  }

  /** (x + a)² 型 */
  function squareForm(opt) {
    opt = opt || {};
    var a = nz(opt.lo === undefined ? -9 : opt.lo, opt.hi === undefined ? 9 : opt.hi);
    return {
      a: a,
      coefs: { x2: 1, x1: 2 * a, x0: a * a },
      factored: paren(1, a) + '<sup>2</sup>',
      expanded: F.poly([[1, F.pow('x', 2)], [2 * a, 'x'], [a * a, '']]),
      roots: [-a, -a]
    };
  }

  /** (x + a)(x - a) 型（2乗の差） */
  function diffOfSquares(opt) {
    opt = opt || {};
    var a = randInt(1, opt.hi === undefined ? 9 : opt.hi);
    return {
      a: a,
      coefs: { x2: 1, x1: 0, x0: -a * a },
      factored: paren(1, a) + paren(1, -a),
      expanded: F.poly([[1, F.pow('x', 2)], [0, 'x'], [-a * a, '']]),
      roots: [-a, a]
    };
  }

  /* ------------------------------------------------------------------
     たすき掛け型 (px + q)(rx + s)
     ------------------------------------------------------------------ */
  function crossForm(opt) {
    opt = opt || {};
    var p = randInt(2, 4);
    var r = randInt(1, 3);
    var q = nz(-6, 6);
    var s = nz(-6, 6);

    var x2 = p * r;
    var x1 = p * s + q * r;
    var x0 = q * s;

    return {
      p: p, q: q, r: r, s: s,
      coefs: { x2: x2, x1: x1, x0: x0 },
      factored: paren(p, q) + paren(r, s),
      expanded: F.poly([[x2, F.pow('x', 2)], [x1, 'x'], [x0, '']]),
      roots: [-q / p, -s / r]
    };
  }

  /* ------------------------------------------------------------------
     共通因数でくくる型
     ------------------------------------------------------------------ */
  function commonFactor(opt) {
    opt = opt || {};
    var level = opt.level || 1;
    var k = randInt(2, level === 1 ? 6 : 9);          // 数の共通因数
    var useVar = level >= 2 && Math.random() < 0.7;   // 文字の共通因数も入れるか
    var v = useVar ? 'x' : '';
    var t1 = nz(1, 6), t2 = nz(-6, 6);

    // k·v(t1·x + t2)  の形
    var inner = linear(t1, t2);
    var common = (k === 1 ? '' : String(k)) + v;

    var termA = (k * t1) + (v ? 'x<sup>2</sup>' : 'x');
    var termB = (k * t2 === 0 ? '' : (k * t2)) + (v ? 'x' : '');
    var expanded = F.poly([
      [k * t1, v ? F.pow('x', 2) : 'x'],
      [k * t2, v ? 'x' : '']
    ]);

    return {
      k: k, v: v, t1: t1, t2: t2,
      common: common,
      inner: inner,
      factored: common + '(' + inner + ')',
      expanded: expanded
    };
  }

  /* ------------------------------------------------------------------
     判定用：因数分解の答えを受け取って正しいか見る
     ------------------------------------------------------------------
     値が合っているだけでは不十分で、「積の形になっているか」も見る。
     x²+3x+2 と入力しても（値は同じでも）因数分解にはなっていないため。  */
  function checkFactorization(userInput, expandedPlain) {
    var M = global.MathCore;
    if (!M.isEqual(userInput, expandedPlain)) return false;
    return M.isFactoredForm(userInput);
  }

  global.Algebra = {
    randInt: randInt,
    pick: pick,
    nz: nz,
    gcd: gcd,
    linear: linear,
    paren: paren,
    quadraticFromRoots: quadraticFromRoots,
    squareForm: squareForm,
    diffOfSquares: diffOfSquares,
    crossForm: crossForm,
    commonFactor: commonFactor,
    checkFactorization: checkFactorization
  };
})(typeof window !== 'undefined' ? window : globalThis);
