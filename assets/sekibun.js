/* ===========================================================================
   sekibun.js — 数学Ⅱ 積分 08〜10 で共通に使う仕組み
   ---------------------------------------------------------------------------
   Sek.P…   分数と多項式の計算（答えはいつも計算で出す）
   Sek.indefinite / definite / area … 問題を作る（途中式の行・カード・4択・解説を1つのデータから）
   Sek.quiz … 4択（ノートで解く・タイムアタック・超鬼連チャン）。まちがえたら正解を選ぶまで進まない
   Sek.fill … 途中式をカードでうめる（fill-steps.js）
   Sek.menu … メニュー（ポップで中央ぞろえ、正方形に近いカード）
   Sek.fig  … 教科書のような図（座標軸・斜線・端の点線）
   ========================================================================= */
(function (global) {
  'use strict';
  var M = '−';

  // ---- 分数 [分子, 分母] ----
  var gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  var R = function (n, d) { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return [n / g, d / g]; };
  var add = function (a, b) { return R(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); };
  var sub = function (a, b) { return R(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); };
  var mul = function (a, b) { return R(a[0] * b[0], a[1] * b[1]); };
  var div = function (a, b) { return R(a[0] * b[1], a[1] * b[0]); };
  var neg = function (a) { return [-a[0], a[1]]; };
  var same = function (a, b) { return a[0] === b[0] && a[1] === b[1]; };
  var pow = function (a, n) { var r = [1, 1]; for (var i = 0; i < n; i++) r = mul(r, a); return r; };
  // 数の文字：{8|3}、−{8|3}、3。par をつけると負の数に (−3)
  function num(r, par) {
    var s = r[1] === 1 ? String(Math.abs(r[0])) : '{' + Math.abs(r[0]) + '|' + r[1] + '}';
    if (r[0] >= 0) return s;
    return par ? '(' + M + s + ')' : M + s;
  }

  // ---- 多項式：[{ r: 分数, p: 指数 }, …]（指数の大きい順） ----
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  var sup = function (n) { return String(n).split('').map(function (c) { return SUP[+c]; }).join(''); };
  var xp = function (p) { return p === 0 ? '' : p === 1 ? 'x' : 'x' + sup(p); };
  // 符号なしの項
  function mono(r, p) {
    var a = [Math.abs(r[0]), r[1]];
    if (p === 0) return num(a);
    if (a[1] === 1) return (a[0] === 1 ? '' : a[0]) + xp(p);
    return num(a) + xp(p);
  }
  function join(items, brk) {   // items: [{ s: 文字, neg: 負か }]。brk：4 項以上は入らないとき途中で改行してよい
    return items.map(function (t, i) { return (brk && i === 2 && items.length > 3 ? ' ⏎' : '') + (i ? (t.neg ? ' ' + M + ' ' : ' + ') : (t.neg ? M : '')) + t.s; }).join('');
  }
  var polyS = function (ts) { return ts.length ? join(ts.map(function (t) { return { s: mono(t.r, t.p), neg: t.r[0] < 0 }; })) : '0'; };
  function parse(str) {
    var s = String(str).replace(/\s/g, '').replace(/−/g, '-'), out = {};
    (s.match(/[+-]?[^+-]+/g) || []).forEach(function (t) {
      var m = t.match(/^([+-]?)(\d*)(x?)([⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/);
      var k = (m[1] === '-' ? -1 : 1) * (m[2] ? +m[2] : 1);
      var p = m[3] ? (m[4] ? +m[4].split('').map(function (c) { return SUP.indexOf(c); }).join('') : 1) : 0;
      out[p] = add(out[p] || [0, 1], [k, 1]);
    });
    return norm(Object.keys(out).map(function (p) { return { r: out[p], p: +p }; }));
  }
  function norm(ts) {
    var m = {};
    ts.forEach(function (t) { m[t.p] = add(m[t.p] || [0, 1], t.r); });
    return Object.keys(m).map(function (p) { return { r: m[p], p: +p }; }).filter(function (t) { return t.r[0] !== 0; }).sort(function (a, b) { return b.p - a.p; });
  }
  var plus = function (a, b) { return norm(a.concat(b)); };
  var minus = function (a, b) { return norm(a.concat(b.map(function (t) { return { r: neg(t.r), p: t.p }; }))); };
  var times = function (a, b) { var o = []; a.forEach(function (s) { b.forEach(function (t) { o.push({ r: mul(s.r, t.r), p: s.p + t.p }); }); }); return norm(o); };
  var anti = function (ts) { return ts.map(function (t) { return { r: div(t.r, [t.p + 1, 1]), p: t.p + 1 }; }); };
  var deriv = function (ts) { return ts.filter(function (t) { return t.p > 0; }).map(function (t) { return { r: mul(t.r, [t.p, 1]), p: t.p - 1 }; }); };
  var at = function (ts, x) { return ts.reduce(function (s, t) { return add(s, mul(t.r, pow(x, t.p))); }, [0, 1]); };
  var val = function (ts, x) { return ts.reduce(function (s, t) { return s + t.r[0] / t.r[1] * Math.pow(x, t.p); }, 0); };
  var paren = function (ts) { return ts.length > 1 ? '(' + polyS(ts) + ')' : polyS(ts); };

  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var uniq = function (a) { var seen = {}; return a.filter(function (v) { var k = Array.isArray(v) ? v[0] : v; if (seen[k]) return false; seen[k] = 1; return true; }); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var rint = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };

  // ---- 積分の項のカード ----
  // そのまま積分した形（3 × {1|3}x³）と、計算した形（x³）
  function rawTerm(t) {
    var k = [Math.abs(t.r[0]), t.r[1]], q = t.p + 1;
    if (t.p === 0) return mono(k, 1);
    if (same(k, [1, 1])) return mono([1, q], q);
    return num(k) + ' × ' + mono([1, q], q);
  }
  var simpTerm = function (t) { return mono(div([Math.abs(t.r[0]), t.r[1]], [t.p + 1, 1]), t.p + 1); };
  function termDummies(t) {
    var k = [Math.abs(t.r[0]), t.r[1]], o = [];
    if (t.p > 0) {
      o.push([mono(mul(k, [t.p, 1]), t.p - 1), '積分は微分の逆です。指数を 1 つふやします。']);
      o.push([mono(k, t.p + 1), '指数に 1 を足したら、その数でわります。']);
      o.push([mono(div(k, [t.p, 1]), t.p + 1), 'わる数は、もとの指数に 1 を足した数です。']);
    } else {
      o.push([mono(k, 0), '定数 k を積分すると kx です。']);
      o.push([mono(div(k, [2, 1]), 2), '定数 k を積分すると kx です。']);
    }
    return o;
  }

  var valsOf = function (ds) { return ds.map(function (d) { return d[0]; }); };
  // 項ごとに積分する行。base：それまでの空欄の数。detail：かけ算の形を1度書いてから約分する
  function integrateRows(ts, lhs, base, tail, detail) {
    var F = anti(ts), rows = [], cards = [], eqs = {}, n = base;
    var raws = ts.map(rawTerm), simps = ts.map(simpTerm), dums = ts.map(termDummies);
    var pb = dums.map(valsOf);
    ts.forEach(function (t, i) { cards = cards.concat(dums[i]); });
    var two = detail && raws.some(function (v, i) { return v !== simps[i]; });
    if (!two) {
      rows.push({ t: lhs + join(ts.map(function (t, i) { n++; return { s: '[' + simps[i] + ']', neg: t.r[0] < 0 }; })) + tail, pb: pb,
        h: '1 つの項ずつ、指数を 1 つふやして、その数でわります。定数 k は kx です。' });
      return { rows: rows, cards: simps.concat(cards), eqs: eqs, count: n - base, F: F };
    }
    var rawIdx = [];
    rows.push({ t: lhs + join(ts.map(function (t, i) { rawIdx.push(n++); return { s: '[' + raws[i] + ']', neg: t.r[0] < 0 }; }), true) + tail, pb: pb,
      h: '指数を 1 つふやして、その数でわります。係数はそのままかけておきます。' });
    var pb2 = [];
    var row2 = '= ' + join(ts.map(function (t, i) {
      if (raws[i] === simps[i]) return { s: simps[i], neg: t.r[0] < 0 };
      var b = n++; eqs[rawIdx[i]] = {}; eqs[rawIdx[i]][simps[i]] = b; pb2.push(pb[i]);
      return { s: '[' + simps[i] + ']', neg: t.r[0] < 0 };
    })) + tail;
    rows.push({ t: row2, pb: pb2, h: 'かけ算をして、約分します。' });
    return { rows: rows, cards: raws.concat(simps, cards), eqs: eqs, count: n - base, F: F };
  }
  // かっこを展開した形の空欄（単項式のカード）
  function expandRow(ts, pre, post) {
    var ds = ts.map(function (t) { return [[mono(mul(t.r, [2, 1]), t.p), '係数をもう一度計算しよう。'], [mono(t.r, t.p ? t.p + 1 : 1), '指数をもう一度確かめよう。']]; });
    var cards = ts.map(function (t) { return mono(t.r, t.p); });
    ds.forEach(function (d) { cards = cards.concat(d); });
    return { t: pre + '(' + join(ts.map(function (t) { return { s: '[' + mono(t.r, t.p) + ']', neg: t.r[0] < 0 }; })) + ')' + post, pb: ds.map(valsOf), cards: cards, h: '分配法則や乗法公式で、かっこをはずして同類項をまとめよう。' };
  }
  function cleanCards(cards) {
    var good = cards.filter(function (c) { return typeof c === 'string'; });
    return uniq(cards.filter(function (c) { return typeof c === 'string' || good.indexOf(c[0]) < 0; }));
  }
  var blanks = function (rows) { return rows.reduce(function (n, r) { return n + ((r.t || r).match(/\[/g) || []).length; }, 0); };
  var INT = '∫', DX = ' dx';

  // ---- 08 不定積分 ----
  // q: { f: '3x²-4x+1' } / { show: '(x+1)²', ts } / { f, at: 1, value: 5 }（F(1) = 5 の条件）。detail：かけ算の形を書く
  function indefinite(q, detail) {
    var ts = q.ts || parse(q.f), rows = [], cards = [], n = 0, intg = paren(ts);
    var lead = INT + ' ' + (q.show || intg) + DX;
    if (q.at !== undefined) rows.push('F(x) = ' + INT + ' ' + intg + DX);
    if (q.show) {
      rows.push('#かっこを展開する');
      var ex = expandRow(ts, '= ' + INT + ' ', DX);
      rows.push({ t: ex.t, pb: ex.pb, h: ex.h });
      cards = cards.concat(ex.cards); n += ts.length;
      rows.push('#1 つの項ずつ積分する');
    }
    var part = integrateRows(ts, '= ', n, ' + C', detail);
    rows = rows.concat(part.rows); cards = cards.concat(part.cards);
    var F = part.F, ans = polyS(F) + ' + C', problem, eqs = part.eqs;
    if (q.at !== undefined) {
      var x = [q.at, 1], Fa = at(F, x), C = sub([q.value, 1], Fa);
      rows.push('#F(' + num(x) + ') = ' + q.value + ' より');
      rows.push({ t: 'F(' + num(x) + ') = [' + num(Fa) + '] + C = ' + q.value, h: 'F(x) の x に ' + num(x) + ' を代入して、計算しよう。', pb: [[num(add(Fa, [1, 1])), num(neg(Fa))]] });
      rows.push({ t: 'C = [' + num(C) + ']', h: '移項して C を求めよう。', pb: [[num(neg(C)), num(add(C, [1, 1]))]] });
      var Full = norm(F.concat(C[0] ? [{ r: C, p: 0 }] : []));
      rows.push('#したがって');
      var tailC = C[0] === 0 ? '' : (C[0] < 0 ? ' ' + M + ' ' : ' + ') + '[' + num([Math.abs(C[0]), C[1]]) + ']';
      if (tailC) rows.push({ t: 'F(x) = ' + polyS(F) + tailC, h: '求めた C を、F(x) の式に入れよう。', pb: [[num(add([Math.abs(C[0]), C[1]], [1, 1])), num(add([Math.abs(C[0]), C[1]], [2, 1]))]] });
      else rows.push('F(x) = ' + polyS(F));
      cards.push(num(Fa), num(C), num([Math.abs(C[0]), C[1]]),
        [num(neg(C)), '移項すると符号が変わります。'], [num(add(Fa, [1, 1])), 'もう一度代入して計算しよう。'], [num(neg(Fa)), 'もう一度代入して計算しよう。'], [num(add(C, [1, 1])), '移項して計算しよう。'],
        [num(add([Math.abs(C[0]), C[1]], [1, 1])), '上の行の C を見よう。'], [num(add([Math.abs(C[0]), C[1]], [2, 1])), '上の行の C を見よう。']);
      ans = 'F(x) = ' + polyS(Full);
      problem = { big: 'F′(x) = ' + polyS(ts) + '、F(' + num(x) + ') = ' + q.value, q: 'を満たす関数 F(x) を求めよ。', rows: rows, cards: cleanCards(cards), ans: ans, eqs: eqs };
    } else {
      problem = { big: INT + ' ' + (q.show || intg) + DX, q: '不定積分を求めよ。', rows: rows, cards: cleanCards(cards), ans: ans, eqs: eqs };
    }
    problem.group = q.group;
    problem.wrong = indefWrong(ts, F, q);
    return problem;
  }
  function indefWrong(ts, F, q) {
    if (q.at !== undefined) {
      var C = sub([q.value, 1], at(F, [q.at, 1]));
      var mk = function (c) { return 'F(x) = ' + polyS(norm(F.concat([{ r: c, p: 0 }]))); };
      return uniq([mk(neg(C)), mk(add(C, [1, 1])), mk([q.value, 1]), mk(sub(C, [1, 1])), mk(add(C, [2, 1]))]).filter(function (v) { return v !== mk(C); }).slice(0, 3);
    }
    var C = ' + C', good = polyS(F) + C, o = [];
    o.push(polyS(ts.map(function (t) { return { r: t.r, p: t.p + 1 }; })) + C);                     // わるのを忘れる
    if (ts.some(function (t) { return t.p; })) o.push(polyS(deriv(ts)) + C);                        // 微分してしまう
    o.push(polyS(ts.map(function (t) { return { r: t.p ? div(t.r, [t.p, 1]) : t.r, p: t.p + 1 }; })) + C);  // もとの指数でわる
    o.push(polyS(F));                                                                               // C を忘れる
    if (F.length > 1) o.push(polyS(F.map(function (t, i) { return i === F.length - 1 ? { r: neg(t.r), p: t.p } : t; })) + C);
    o.push(polyS(F.map(function (t) { return { r: mul(t.r, [2, 1]), p: t.p }; })) + C);
    o.push(polyS(ts) + C);                                                                          // そのまま
    o.push(polyS(F.map(function (t) { return { r: t.r, p: t.p + 1 }; })) + C);
    return uniq(o).filter(function (v) { return v !== good; }).slice(0, 3);
  }

  var lim = function (b, a) { return '{' + num([b, 1]) + '|' + num([a, 1]) + '}'; };
  // ---- 09 定積分の計算の行 ----
  // ts を a から b まで。lhs はその前の式。cards に足す
  function subst(F, c) {   // 上端・下端を代入した形（代入する数が空欄）
    var v = num([c, 1], true);
    return join(F.map(function (t) {
      var a = [Math.abs(t.r[0]), t.r[1]], x = '[' + v + ']' + (t.p > 1 ? sup(t.p) : '');
      return { s: same(a, [1, 1]) ? x : num(a) + ' × ' + x, neg: t.r[0] < 0 };
    }));
  }
  // 代入して計算した項の値：(4 + 6)
  function termVals(F, c) {
    return F.map(function (t) { return mul(t.r, pow([c, 1], t.p)); });
  }
  var valsRow = function (vs) { return join(vs.map(function (v) { return { s: '[' + num([Math.abs(v[0]), v[1]]) + ']', neg: v[0] < 0 }; })); };
  var hasFrac = function (vs) { return vs.some(function (v) { return v[1] !== 1; }); };
  function evalRows(ts, a, b, lhs, detail) {
    var F = anti(ts), Fa = at(F, [a, 1]), Fb = at(F, [b, 1]), ans = sub(Fb, Fa), rows = [];
    var terms = join(F.map(function (t) { return { s: '[' + mono(t.r, t.p) + ']', neg: t.r[0] < 0 }; }));
    var dums = ts.map(termDummies), pb = dums.map(valsOf);
    rows.push({ t: lhs + '⟦' + terms + '⟧' + lim(b, a), pb: pb, h: '指数を 1 つふやして、その数でわります。定積分では C はいりません。' });
    var cards = F.map(function (t) { return mono(t.r, t.p); });
    dums.forEach(function (d) { cards = cards.concat(d); });
    var br = ' ⏎ ', zero = termVals(F, a).every(function (v) { return v[0] === 0; });
    var P = function (s, big) { return /\(/.test(s) ? '⦃' + s + '⦄' : (big ? '⦅' : '(') + s + (big ? '⦆' : ')'); };
    if (detail) {
      var coef = F.some(function (t) { return t.r[1] !== 1; });
      rows.push({ t: '= ' + P(subst(F, b), coef) + br + '− ' + P(subst(F, a), coef), h: '[ ] の式の x に、上端を代入した式から、下端を代入した式をひきます。' });
      cards.push(num([b, 1], true), num([a, 1], true), [num(neg([b, 1]), true), '代入する数を確かめよう。'], [num(add([a, 1], [1, 1]), true), '上端と下端を確かめよう。']);
    }
    if (F.length > 1) {
      var vb = termVals(F, b), va = termVals(F, a), big = hasFrac(vb) || hasFrac(va), all = vb.concat(zero ? [] : va);
      var rowV = { t: '= ' + P(valsRow(vb), big) + br + '− ' + (zero ? '0' : P(valsRow(va), big)), h: '代入して、1 つの項ずつ計算します。' };
      var abs = all.map(function (v) { return num([Math.abs(v[0]), v[1]]); });
      if (uniq(abs).length > 3) rowV.pb = abs.map(function (s, i) { return [num(add([Math.abs(all[i][0]), all[i][1]], [1, 1])), num(add([Math.abs(all[i][0]), all[i][1]], [2, 1]))]; });
      rows.push(rowV);
      cards = cards.concat(abs);
      all.forEach(function (v) { var w = [Math.abs(v[0]), v[1]]; [add(w, [1, 1]), add(w, [2, 1])].forEach(function (d) { cards.push([num(d), 'もう一度計算しよう。']); }); });
    }
    var g = zero ? null : groups(termVals(F, b), termVals(F, a));
    if (!g || !g.alt) rows.push({ t: '= [' + num(Fb) + '] − ' + (zero ? '0' : '[' + num(Fa, true) + ']'), h: 'かっこの中を計算します。', sk: 1 });
    else {
      var X = num(g.A), Y = num([Math.abs(g.B[0]), g.B[1]]), plusB = g.B[0] > 0;
      var why = g.ints ? '分数どうし、整数どうしをまとめて計算してもかまいません（分数を先に書きます）。' : '分母が同じ数どうしをまとめて計算してもかまいません。';
      if (plusB) {
        rows.push({ t: '= [' + num(Fb) + '] [−] [' + num(Fa, true) + ']', h: 'かっこの中を計算します。' + why + 'そのときは、真ん中の符号に気をつけよう。', sk: 1, alt: [[X, '+', Y]] });
        cards.push('+', '−');
      } else rows.push({ t: '= [' + num(Fb) + '] − [' + num(Fa, true) + ']', h: 'かっこの中を計算します。' + why, sk: 1, alt: [[X, Y]] });
      cards.push(X, Y, [num(neg(g.A)), '符号を確かめよう。']);
    }
    rows.push({ t: '= [' + num(ans) + ']', h: 'ひき算をします。負の数をひくときは、たし算になります。' });
    cards.push(num(Fb), num(Fa, true), num(ans));
    cards.push([num(add(Fb, [1, 1])), 'もう一度計算しよう。'], [num(neg(Fa), true), '符号を確かめよう。'],
      [num(add(Fb, Fa)), '上端の値から、下端の値をひきます。'], [num(sub(Fa, Fb)), '上端の値 − 下端の値 の順です。']);
    return { rows: rows, cards: cards, ans: ans, Fa: Fa, Fb: Fb, bad3: !!(g && g.bad) };
  }
  // 代入した項の値を、分母ごとにまとめる。分母が 3 種類（例：{1|3}・{1|2}・整数）になる問題は出さない（bad）
  //   2 種類なら、A（分数／先に出てくる分母）と B（もう一方）の「上端 − 下端」を別解にする
  function groups(vb, va) {
    if (vb.every(function (v) { return v[0] === 0; })) return null;
    var ds = [];
    vb.concat(va).forEach(function (v) { if (ds.indexOf(v[1]) < 0) ds.push(v[1]); });
    if (ds.length >= 3) return { bad: true };
    if (ds.length < 2) return null;
    var d1 = ds[0] === 1 ? ds[1] : ds[0];
    var part = function (d, list) { return list.filter(function (v) { return (v[1] === d1) === d; }).reduce(add, [0, 1]); };
    return { alt: true, ints: ds.indexOf(1) >= 0, A: sub(part(true, vb), part(true, va)), B: sub(part(false, vb), part(false, va)) };
  }
  function nearValues(ans, list) {
    var o = list.slice(), k = 1;
    while (k < 9 && uniq(o.map(function (r) { return num(r); })).filter(function (v) { return v !== num(ans); }).length < 3) { o.push(add(ans, [k, 1]), sub(ans, [k, 1])); k++; }
    return uniq(o.map(function (r) { return num(r); })).filter(function (v) { return v !== num(ans); }).slice(0, 3);
  }
  // q: { f or ts, a, b, show? }。detail：代入の行も書く
  function definite(q, detail) {
    var ts = q.ts || parse(q.f), rows = [], cards = [], head = INT + lim(q.b, q.a) + ' ' + (q.show || paren(ts)) + DX;
    if (q.show) {
      rows.push('#かっこを展開する');
      var ex = expandRow(ts, '= ' + INT + lim(q.b, q.a) + ' ', DX);
      rows.push({ t: ex.t, pb: ex.pb, h: ex.h });
      cards = cards.concat(ex.cards);
    }
    var e = evalRows(ts, q.a, q.b, '= ', detail);
    rows = rows.concat(e.rows); cards = cards.concat(e.cards);
    return { big: head, q: '定積分を求めよ。', rows: rows, cards: cleanCards(cards), ans: num(e.ans), group: q.group, value: e.ans, bad3: e.bad3,
      wrong: nearValues(e.ans, [add(e.Fb, e.Fa), sub(e.Fa, e.Fb), e.Fb, at(ts, [q.b, 1]), sub(at(ts, [q.b, 1]), at(ts, [q.a, 1]))]) };
  }

  // ---- 解説（途中式の行を、空欄をうめた形で） ----
  function workOf(p) {
    return p.rows.map(function (r) {
      var t = (r.t || r).replace(/^[!#]/, '');
      return /^#/.test(r.t || r) ? '<p class="sk-w prose">' + FillSteps.md(t) + '</p>' : '<p class="sk-w">' + FillSteps.md(t) + '</p>';
    }).join('');
  }

  // ---- 図 ----
  // o: { curves: [{ ts, label, color? }], regions: [{ a, b, up, low }], xs: [{ x, label }], xr, yr, h }
  var NAVY = '#1f4e8c', ORANGE = '#c2410c', INK = '#1f2328';
  var uidN = 0;
  function fig(o) {
    var W = 340, H = o.h || 270, L = 22, T = 16, Rg = 22, B = 22;
    var xr = o.xr, yr = o.yr;
    var X = function (x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (W - L - Rg); };
    var Y = function (y) { return H - B - (y - yr[0]) / (yr[1] - yr[0]) * (H - T - B); };
    var f1 = function (v) { return Math.round(v * 10) / 10; };
    var id = 'skh' + (++uidN), s = '';
    s += '<svg class="sk-fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.alt || 'グラフと面積の図') + '"><defs>' +
      '<pattern id="' + id + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#dfeaf7"/><path d="M0 0V7" stroke="#6f97c6" stroke-width="1.3"/></pattern>' +
      '<clipPath id="' + id + 'c"><rect x="' + L + '" y="' + T + '" width="' + (W - L - Rg) + '" height="' + (H - T - B) + '"/></clipPath></defs>';
    // 斜線の部分
    (o.regions || []).forEach(function (g) {
      var pts = [], n = 60, i, x;
      for (i = 0; i <= n; i++) { x = g.a + (g.b - g.a) * i / n; pts.push(f1(X(x)) + ',' + f1(Y(val(g.up, x)))); }
      for (i = n; i >= 0; i--) { x = g.a + (g.b - g.a) * i / n; pts.push(f1(X(x)) + ',' + f1(Y(val(g.low, x)))); }
      s += '<polygon points="' + pts.join(' ') + '" fill="url(#' + id + ')" stroke="none"/>';
    });
    // 座標軸
    var ox = X(0), oy = Y(0);
    s += '<path d="M' + (L - 10) + ' ' + f1(oy) + 'H' + (W - 12) + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + (W - 12) + ' ' + f1(oy) + 'l-8 -3.6v7.2z" fill="' + INK + '"/>';
    s += '<path d="M' + f1(ox) + ' ' + (H - 8) + 'V8" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f1(ox) + ' 8l-3.6 8h7.2z" fill="' + INK + '"/>';
    var txt = function (x, y, t, anchor, it, size, color) {
      return '<text x="' + f1(x) + '" y="' + f1(y) + '" text-anchor="' + (anchor || 'middle') + '" font-family="STIX Two Text, serif" font-size="' + (size || 17) + '"' + (it ? ' font-style="italic"' : '') + ' fill="' + (color || INK) + '" paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round">' + t + '</text>';
    };
    var marks = [];
    // 端の点線と目もり
    (o.xs || []).forEach(function (m) {
      var below = m.below === undefined ? false : m.below, yv = m.y === undefined ? 0 : m.y;
      if (Math.abs(yv) > 1e-9) s += '<path d="M' + f1(X(m.x)) + ' ' + f1(oy) + 'V' + f1(Y(yv)) + '" stroke="' + INK + '" stroke-width="1.1" stroke-dasharray="4 3"/>';
      s += '<circle cx="' + f1(X(m.x)) + '" cy="' + f1(oy) + '" r="2" fill="' + INK + '"/>';
      marks.push(txt(X(m.x) + (m.dx || 0), oy + (below ? 19 : -7) + (m.up ? -13 : 0), String(m.label).replace(/-/g, M), 'middle', /[a-zαβ]/i.test(m.label), 16));
    });
    (o.ys || []).forEach(function (m) {
      s += '<path d="M' + f1(ox) + ' ' + f1(Y(m.y)) + 'H' + f1(X(m.x)) + '" stroke="' + INK + '" stroke-width="1.1" stroke-dasharray="4 3"/>';
      marks.push(txt(ox - 6, Y(m.y) + 5, String(m.label).replace(/-/g, M), 'end', false, 16));
    });
    // 曲線
    var boxes = [];
    (o.curves || []).forEach(function (c, ci) {
      var d = [], n = 160, col = c.color || (ci ? ORANGE : NAVY);
      for (var i = 0; i <= n; i++) { var x = xr[0] + (xr[1] - xr[0]) * i / n; d.push((i ? 'L' : 'M') + f1(X(x)) + ' ' + f1(Y(val(c.ts, x)))); }
      s += '<path d="' + d.join('') + '" fill="none" stroke="' + col + '" stroke-width="2.4" clip-path="url(#' + id + 'c)"/>';
    });
    s += marks.join('');
    s += txt(ox - 8, oy + 17, 'O', 'end', true, 16) + txt(W - 14, oy - 8, 'x', 'middle', true, 18) + txt(ox + 11, 19, 'y', 'middle', true, 18);
    // 式の名前：線にかからない場所をさがす
    (o.curves || []).forEach(function (c, ci) {
      if (!c.label || o.noLabel) return;
      var col = c.color || (ci ? ORANGE : NAVY), w = c.label.length * 7.6 + 8, h = 18, best = null, bestScore = -1e9;
      var pts = [];
      (o.curves || []).forEach(function (k) { for (var i = 0; i <= 80; i++) { var x = xr[0] + (xr[1] - xr[0]) * i / 80; pts.push([X(x), Y(val(k.ts, x))]); } });
      for (var i = 0; i <= 60; i++) {
        var x = xr[0] + (xr[1] - xr[0]) * (1 - i / 60), cy = Y(val(c.ts, x));
        if (cy < T + 4 || cy > H - B - 2) continue;
        [[8, -12], [8, 18], [-w - 8, -12], [-w - 8, 18]].forEach(function (off) {
          var lx = X(x) + off[0], ly = cy + off[1];
          if (lx < 4 || lx + w > W - 4 || ly - h < 4 || ly > H - 4) return;
          var hit = pts.some(function (q) { return q[0] > lx - 2 && q[0] < lx + w + 2 && q[1] > ly - h - 1 && q[1] < ly + 4; });
          var axis = (oy > ly - h - 2 && oy < ly + 5) || (ox > lx - 2 && ox < lx + w + 2);
          var other = boxes.some(function (b) { return lx < b[0] + b[2] && lx + w > b[0] && ly - h < b[1] && ly > b[1] - b[3]; });
          var inReg = (o.regions || []).some(function (g) { var xa = X(g.a), xb = X(g.b); return lx + w > xa && lx < xb && (function () { var xm = g.a + (g.b - g.a) * Math.min(1, Math.max(0, ((lx + w / 2) - xa) / (xb - xa))), yu = Y(val(g.up, xm)), yl = Y(val(g.low, xm)); return ly > yu && ly - h < yl; })(); });
          var score = (hit ? -100 : 0) + (axis ? -40 : 0) + (other ? -200 : 0) + (inReg ? -60 : 0) - i * 0.2;
          if (score > bestScore) { bestScore = score; best = [lx, ly]; }
        });
      }
      if (!best) best = [W - w - 6, T + 16];
      boxes.push([best[0], best[1], w, h]);
      s += labelMath(best[0], best[1], c.label, col);
    });
    return s + '</svg>';
  }
  // 図の中の式：x・y は斜体、数字は立体、² は小さく上に
  function labelMath(x, y, t, col) {
    var out = t.replace(/[a-zA-Zαβ]/g, function (m) { return '<tspan font-style="italic">' + m + '</tspan>'; })
      .replace(/([²³⁴])/g, function (m) { return '<tspan dy="-6" font-size="11">' + (SUP.indexOf(m)) + '</tspan><tspan dy="6"> </tspan>'; });
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-family="STIX Two Text, serif" font-size="16" fill="' + col + '" paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round">' + out + '</text>';
  }

  // ---- メニュー ----
  function menu(el, cards, lead, back) {
    var plain = cards.every(function (c) { return !c.icon; });
    el.innerHTML = (back ? '<button type="button" class="fs-btn zm-back sk-mback" data-back>← もどる</button>' : '') + (lead ? '<p class="sk-lead">' + lead + '</p>' : '') + '<div class="sk-menu n' + cards.length + (plain ? ' plain' : '') + '">' + cards.map(function (c, i) {
      return '<button type="button" class="sk-card c' + ((c.c === undefined ? i : c.c) % 6) + '" data-i="' + i + '">' + (c.icon ? '<span class="ic">' + c.icon + '</span>' : '') + '<b>' + c.name + '</b>' + (c.sub ? '<small>' + c.sub + '</small>' : '') + '</button>';
    }).join('') + '</div>';
    el.querySelectorAll('.sk-card').forEach(function (b) { b.onclick = function () { cards[+b.dataset.i].go(); }; });
    var bk = el.querySelector('[data-back]'); if (bk) bk.onclick = back;
    window.scrollTo(0, 0);
  }

  // ---- 途中式 ----
  function fill(el, problems, o) {
    o = o || {};
    if (typeof el === 'string') el = document.querySelector(el);
    var tb = '<button type="button" class="fs-btn zm-back" data-home>メニューへ</button>';
    var api = FillSteps.mount({
      el: el, problems: problems, review: true, rowCards: true,
      tabsBefore: tb, top: o.top, hint: o.hint, tabGroup: o.tabGroup,
      after: function (root, p) {
        var h = root.querySelector('[data-home]'); if (h) h.onclick = o.home;
        figGate(root, p, function () { api.go(problems.indexOf(p)); });
        root.querySelectorAll('.fs-card').forEach(function (e) { if (e.querySelector('.fs-fr')) e.classList.add('frac'); });
      },
      finalExtra: '<p><button type="button" class="fs-btn" id="skHome">メニューにもどる</button></p>'
    });
    // 最後の画面のボタン
    new MutationObserver(function () { var b = el.querySelector('#skHome'); if (b) b.onclick = o.home; var h = el.querySelector('[data-home]'); if (h) h.onclick = o.home; }).observe(el, { childList: true, subtree: true });
    return api;
  }
  // 後半の問題：図をかくす。図を選ぶ（または 図を見る を押す）と、途中式に進める
  function figGate(root, p, redraw) {
    var box = root.querySelector('.fs-fig');
    root.classList.toggle('sk-wait', !!(p.figHide && !p.figOpen));
    if (!box || !p.figHide || p.figOpen) return;
    p.figTried = p.figTried || {};
    box.innerHTML = '<p class="sk-figask">この問題の図はどれかな。図を選んでから、式を作ろう。</p><div class="sk-opts figs">' + p.figOpts.map(function (v, k) {
      return '<button type="button" class="sk-opt' + (p.figTried[k] ? ' ng' : '') + '" data-fo="' + k + '"' + (p.figTried[k] ? ' disabled' : '') + '><span>' + v.svg + '</span></button>';
    }).join('') + '</div><div class="sk-ctrl"><button type="button" class="fs-btn" data-fsee>図を見る</button></div>';
    box.querySelectorAll('[data-fo]').forEach(function (b) {
      b.onclick = function () { var k = +b.dataset.fo; if (p.figOpts[k].ok) { p.figOpen = true; redraw(); } else { p.figTried[k] = true; figGate(root, p, redraw); } };
    });
    box.querySelector('[data-fsee]').onclick = function () { p.figOpen = true; redraw(); };
  }
  // = で始まる行は、上の行の = の下にそろえる
  function alignEq(root) {
    var rows = [].slice.call(root.querySelectorAll('.fs-row')), lastEq = null;
    rows.forEach(function (row) {
      var eq = row.querySelector('.fs-eq');
      if (!eq) return;
      eq.style.marginLeft = '';
      var txt = eq.textContent.trim();
      if (txt[0] !== '=' && !/^[　 ]*−/.test(eq.textContent)) { var m = eq.querySelector('.fs-eqs'); lastEq = m ? m.getBoundingClientRect().left : null; return; }
      if (lastEq === null) return;
      var gap = lastEq - eq.getBoundingClientRect().left;
      if (gap <= 0) return;
      var room = eq.clientWidth - eq.scrollWidth;
      eq.style.marginLeft = Math.min(gap, gap + Math.min(0, room + gap - 4 > 0 ? 0 : room)) + 'px';
      if (eq.scrollWidth > eq.clientWidth + 1) eq.style.marginLeft = Math.max(0, gap - (eq.scrollWidth - eq.clientWidth)) + 'px';
    });
  }

  // ---- 4択 ----
  // list: [{ big, q, ans, wrong:[3], p?（途中式の問題）, fig? }]
  // o: { name, timed, oni, home, again }
  var liveTimer = null;
  function quiz(el, list, o) {
    clearInterval(liveTimer);
    var S = list.map(function (q) { return { ch: shuffle([q.ans].concat(q.wrong.slice(0, 3))), tried: [], done: false, hint: 0 }; });
    var i = 0, t0 = performance.now(), lock = false, ended = false;
    var md = FillSteps.md, LBL = ['ア', 'イ', 'ウ', 'エ'];
    var show = function (v) { return /^<svg/.test(v) ? v : md(v); };
    var doneN = function () { return S.filter(function (s) { return s.done; }).length; };
    var fmt = function (ms) { var s = Math.floor(ms / 1000), d = Math.floor(ms % 1000 / 100); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + '.' + d; };
    function tick() { var e = el.querySelector('#skTime'); if (e) e.textContent = fmt(performance.now() - t0); }
    function nextOpen() { for (var k = 1; k <= list.length; k++) { var c = (i + k) % list.length; if (!S[c].done) return c; } return -1; }
    function fit() {
      el.querySelectorAll('.big-formula,.sk-opts:not(.wrap) .sk-opt>span,.fit1').forEach(function (e) {
        if (e.querySelector('svg.sk-fig')) return;
        e.style.fontSize = '';
        var size = parseFloat(getComputedStyle(e).fontSize);
        while (e.scrollWidth > e.clientWidth + 1 && size > 11) { size -= 1; e.style.fontSize = size + 'px'; }
      });
    }
    function draw() {
      var q = list[i], st = S[i], tabs = '', hideNow = q.figHide && !st.see && !st.done;
      if (list.length <= 24 && !o.oni) tabs = '<nav class="sk-tabs">' + list.map(function (_, k) {
        var c = (k === i ? ' cur' : '') + (S[k].done ? (S[k].tried.length ? ' ng' : ' ok') : '');
        return '<button type="button" class="sk-tab' + c + '" data-go="' + k + '">' + (k + 1) + '</button>';
      }).join('') + '</nav>';
      var hints = '';
      if (!o.timed && q.p) {
        var rows = q.p.rows.filter(function (r) { return !/^#/.test(r.t || r); });
        hints = '<div class="sk-hints">' + rows.slice(0, st.hint).map(function (r, k) { return '<div class="sk-hint"><b>考え方' + (k + 1) + '</b>' + (r.h ? '<div class="say">' + md(r.h) + '</div>' : '') + '<p>' + md((r.t || r).replace(/^!/, '')) + '</p></div>'; }).join('') + '</div>' +
          (st.done ? '' : '<div class="sk-ctrl"><button type="button" class="fs-btn" data-hint' + (st.hint >= rows.length ? ' disabled' : '') + '>' + (st.hint ? '次のヒント' : 'ヒント') + '</button></div>');
      }
      var jpLong = st.ch.some(function (v) { return !/^<svg/.test(v) && /[぀-ヿ一-鿿]/.test(v) && v.replace(/[{}|]/g, '').length > 9; });
      var stack = q.stack || jpLong || st.ch.some(function (v) { return !/^<svg/.test(v) && v.length > 24; });
      var ans = q.say ? [].concat(q.say).map(function (t) { return '<p>' + md(t) + '</p>'; }).join('') + (q.ansFig ? '<div class="sk-figbox">' + q.ansFig + '</div>' : '') : q.p ? workOf(q.p) : '<p>' + show(q.ans) + '</p>';
      var allDone = doneN() >= list.length;
      el.innerHTML = '<div class="sk-top"><button type="button" class="fs-btn zm-back" data-home>メニューへ</button><span class="sk-count">' + o.name + '　' + (i + 1) + ' / ' + list.length + '</span>' + (o.timed ? '<span class="sk-time" id="skTime">' + fmt(performance.now() - t0) + '</span>' : '') + '</div>' +
        '<div class="sk-bar"><span style="width:' + (doneN() / list.length * 100) + '%"></span></div>' + tabs +
        '<div class="sk-body' + (q.fig && !hideNow ? ' has-fig' : '') + '"><div class="sk-left"><div class="sk-q">' + (q.big ? '<span class="big-formula">' + md(q.big) + '</span>' : '') + '<span class="ask">' + [].concat(q.q).map(md).join('<br>') + '</span>' + (q.sub || '') + '</div>' + (q.fig ? (hideNow ? '<div class="sk-ctrl"><button type="button" class="fs-btn" data-see>図を見る</button></div>' : '<div class="sk-figbox">' + q.fig + '</div>') : '') + '</div>' +
        '<div class="sk-right"><div class="sk-opts' + (q.figOpts ? ' figs' : '') + (stack ? ' stack' : '') + (jpLong ? ' wrap' : '') + '">' + st.ch.map(function (v, k) {
          var bad = st.tried.indexOf(v) >= 0, good = st.done && v === q.ans;
          return '<button type="button" class="sk-opt' + (bad ? ' ng' : '') + (good ? ' ok' : '') + '" data-k="' + k + '"' + (bad || st.done ? ' disabled' : '') + '><small>' + LBL[k] + '</small><span>' + show(v) + '</span></button>';
        }).join('') + '</div>' + hints +
        (st.done && !o.timed ? '<div class="sk-ans"><b>' + (st.tried.length ? '答え' : '正解') + '</b>' + ans + '</div>' : '') +
        (st.done && (!o.timed || allDone) ? '<div class="sk-ctrl"><button type="button" class="fs-btn primary" data-next>' + (allDone ? '結果を見る' : '次の問題へ') + '</button></div>' : '') +
        '</div></div>';
      el.querySelector('[data-home]').onclick = function () { clearInterval(liveTimer); o.home(); };
      el.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { i = +b.dataset.go; draw(); }; });
      el.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { choose(st.ch[+b.dataset.k], b); }; });
      var see = el.querySelector('[data-see]'); if (see) see.onclick = function () { st.see = true; draw(); };
      var h = el.querySelector('[data-hint]'); if (h) h.onclick = function () { st.hint++; draw(); };
      var n = el.querySelector('[data-next]'); if (n) n.onclick = function () { if (doneN() >= list.length) finish(); else { i = nextOpen(); draw(); window.scrollTo(0, 0); } };
      fit();
    }
    function choose(v, b) {
      var q = list[i], st = S[i];
      if (lock || st.done) return;
      if (v === q.ans) {
        st.done = true;
        if (o.timed) {
          lock = true; b.classList.add('ok');
          setTimeout(function () { lock = false; if (doneN() >= list.length) finish(); else { i = nextOpen(); draw(); } }, 220);
        } else draw();
        return;
      }
      st.tried.push(v);
      if (o.oni) { st.done = true; finish(); return; }
      draw();
    }
    function finish() {
      if (ended) return; ended = true; clearInterval(liveTimer);
      var ms = performance.now() - t0, solved = S.filter(function (s) { return s.done && !s.tried.length; }).length, bad = [];
      S.forEach(function (s, k) { if (s.tried.length) bad.push(k); });
      var head = o.oni ? '<h2>連続 ' + solved + ' 問 正解！</h2>' : '<h2>' + o.name + '　おわり</h2><p class="sk-score">一発で正解　<b>' + solved + '</b> / ' + list.length + '</p>';
      el.innerHTML = '<section class="sk-result">' + head + (o.timed ? '<p class="sk-big">' + fmt(ms) + '</p>' : '') +
        (bad.length ? '<p><button type="button" class="fs-btn primary" data-rev>間違えた問題を確認する（' + bad.length + '問）</button></p>' : '<p>間違えた問題はありません</p>') +
        '<div id="skRev" hidden>' + bad.map(function (k) {
          var q = list[k];
          return '<div class="sk-item"><h3>問題 ' + (k + 1) + '</h3><div class="sk-q">' + (q.big ? '<span class="big-formula">' + md(q.big) + '</span>' : '') + '<span class="ask">' + [].concat(q.q).map(md).join('<br>') + '</span>' + (q.sub || '') + '</div>' + (q.fig ? '<div class="sk-figbox">' + q.fig + '</div>' : '') +
            (q.figOpts ? '' : '<p>選んだ答え：' + S[k].tried.map(show).join('、') + '</p><p>正しい答え：' + show(q.ans) + '</p>') + (q.say ? [].concat(q.say).map(function (t) { return '<p>' + md(t) + '</p>'; }).join('') + (q.ansFig ? '<div class="sk-figbox">' + q.ansFig + '</div>' : '') : '') + (q.p ? workOf(q.p) : '') + '</div>';
        }).join('') + '</div>' +
        '<div class="fs-nav"><button type="button" class="fs-btn" data-home>メニューへ</button><button type="button" class="fs-btn" data-again>もう一度</button></div></section>';
      el.querySelector('[data-home]').onclick = o.home;
      el.querySelector('[data-again]').onclick = o.again;
      var r = el.querySelector('[data-rev]'); if (r) r.onclick = function () { el.querySelector('#skRev').hidden = false; r.hidden = true; };
      window.scrollTo(0, 0);
    }
    if (o.timed) liveTimer = setInterval(tick, 100);
    draw(); window.scrollTo(0, 0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return { state: S, list: list, cur: function () { return i; } };
  }

  global.Sek = {
    R: R, add: add, sub: sub, mul: mul, div: div, neg: neg, pow: pow, num: num, same: same,
    parse: parse, polyS: polyS, norm: norm, plus: plus, minus: minus, times: times, anti: anti, at: at, val: val, paren: paren, mono: mono, join: join,
    shuffle: shuffle, uniq: uniq, pick: pick, rint: rint, cleanCards: cleanCards, blanks: blanks,
    lim: lim, integrateRows: integrateRows, expandRow: expandRow, indefinite: indefinite, definite: definite, evalRows: evalRows, nearValues: nearValues, workOf: workOf,
    fig: fig, menu: menu, fill: fill, quiz: quiz, alignEq: alignEq
  };
})(window);
