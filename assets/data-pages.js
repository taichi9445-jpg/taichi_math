/* ===========================================================================
   data-pages.js — 数学Ⅰ データの分析 32〜37 の問題。DBP.start('daihyou') などで始める
   データはすべて、その場で作るか、この教材のために作った架空のもの。
   【2026-11-23 先生の要望で作り直し】
   ・32 代表値／33 度数分布表とヒストグラム（番号を入れかえ）
   ・どのページも「基本（全員同じ数字。もう一度でも同じ）」と「練習（毎回数字がかわる）」の 2 つ
   ・小さい順に並べる行は、スマホでも PC でもかならず横 1 列。並べたあと、そのすぐ下で中央値などを続けて答える
   ========================================================================= */
(function (global) {
  'use strict';
  var D = global.DB, md = D.md, f = D.f, cell = D.cell, hd = D.hd, rint = Sek.rint, shuffle = Sek.shuffle, pick = Sek.pick;
  var app = function () { return document.getElementById('app'); }, menuEl = function () { return document.getElementById('menu'); };
  var range = function (n, fn) { return Array.from({ length: n }, function (_, i) { return fn(i); }); };
  var uniqSort = function (a) { return Array.from(new Set(a)).sort(function (x, y) { return x - y; }); };
  var uniqS = function (a) { return Array.from(new Set(a.map(String))); };
  var cur = null;
  function quizMode(make, o) { menuEl().innerHTML = ''; var go = function () { Sek.quiz(app(), make(), Object.assign({ home: cur, again: go }, o)); }; go(); }
  function taskMode(make, name) { menuEl().innerHTML = ''; var go = function () { D.run(app(), make(), { name: name, home: cur, again: go }); }; go(); }
  // メニュー：名前と問題数だけ（どんな問題かがすぐ分かる名前にする）
  var wbr = function (s) { return s.length > 7 ? s.replace(/(を|に|の|から|・|て|（)(?=[^）]{2})/g, '$1<wbr>') : s; };
  function show(lead, cards) { cur = function () { app().innerHTML = ''; Sek.menu(menuEl(), cards.map(function (c) { return { name: wbr(c[0]), sub: c[1], icon: '', go: c[2] }; }), lead); }; cur(); }
  var line = D.line, sorted = D.sorted, F1 = function (v) { return f(v); };
  var uName = function (u) { return u === 'm' ? 'ｍ' : u === 'kg' ? 'ｋｇ' : u; };   // 単位 m・kg は斜体にしない（全角にする）
  var nums = function (n, lo, hi) { return range(n, function () { return rint(lo, hi); }); };
  var withU = function (u) { return function (v) { return v + ' ' + u; }; };

  // 基本の問題は、いつも同じ数字にする（授業でみんなで同じ画面を見られるように）。練習は毎回かわる
  function seeded(seed, fn) {
    var keep = Math.random, a = seed >>> 0;
    Math.random = function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { return fn(); } finally { Math.random = keep; }
  }

  // 選ぶ問題（{ q, sub, fig, ans, wrong, say, figOpts }）を、D.run で出せる形にする
  var LBL = ['ア', 'イ', 'ウ', 'エ'];
  function asTask(z) {
    var say = z.say ? [].concat(z.say).map(function (t) { return '<p>' + md(t) + '</p>'; }).join('') + (z.ansFig ? '<div class="sk-figbox">' + z.ansFig + '</div>' : '') : '<p>' + md(z.ans) + '</p>';
    var showV = function (v) { return /^<(svg|div|table)/.test(v) ? v : md(v); };
    var short = !z.figOpts && [z.ans].concat(z.wrong).every(function (v) { return String(v).length <= 7; });
    return { q: z.q, sub: z.sub || '', mount: function (body, ctx) {
      var ch = shuffle([z.ans].concat(z.wrong.slice(0, 3))), tried = [], fin = ctx.solved;
      function draw() {
        body.innerHTML = (z.fig ? '<div class="sk-figbox">' + z.fig + '</div>' : '') + '<div class="sk-opts' + (z.figOpts ? ' figs' : short ? ' db-o4' : '') + '">' + ch.map(function (v, k) {
          var bad = tried.indexOf(v) >= 0;
          return '<button type="button" class="sk-opt' + (bad ? ' ng' : '') + (fin && v === z.ans ? ' ok' : '') + '" data-k="' + k + '"' + (fin || bad ? ' disabled' : '') + '><small>' + LBL[k] + '</small><span>' + showV(v) + '</span></button>';
        }).join('') + '</div>';
        body.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { var v = ch[+b.dataset.k]; if (v === z.ans) { fin = true; draw(); ctx.ok(say); } else { tried.push(v); ctx.miss(); draw(); } }; });
      }
      draw();
      if (fin) ctx.ok(say);
    } };
  }
  // parts：[[問題数, 問題を1つ作る関数, '選ぶ' なら選ぶ問題], …] を順につなげる。seed があれば、いつも同じ数字
  function build(parts) { return [].concat.apply([], parts.map(function (p) { return range(p[0], function (i) { var t = p[1](i); return p[2] ? asTask(t) : t; }); })); }
  function mix(name, parts, seed) { taskMode(function () { return seed ? seeded(seed, function () { return build(parts); }) : build(parts); }, name); }
  var count = function (parts) { return parts.reduce(function (a, p) { return a + p[0]; }, 0) + '問'; };
  function unit(name, parts, seed) { return [name, count(parts) + (seed ? '' : '・毎回かわる'), function () { mix(name, parts, seed); }]; }
  var CH = true;   // 選ぶ問題のしるし

  // =====================================================================
  // 32 代表値
  // =====================================================================
  function medianSay(s, u) {
    var n = s.length; u = u ? '（' + u + '）' : '';
    if (n % 2) return n + ' 個なので、小さい方から ' + ((n + 1) / 2) + ' 番目の ' + f(D.median(s)) + u + (u ? '' : ' ') + 'が中央値です。';
    return n + ' 個なので、小さい方から ' + (n / 2) + ' 番目の ' + f(s[n / 2 - 1]) + ' と ' + (n / 2 + 1) + ' 番目の ' + f(s[n / 2]) + ' の平均 ' + f(D.median(s)) + u + (u ? '' : ' ') + 'が中央値です。';
  }
  var REP = [
    { who: '8 人の 10 点満点の小テストの得点', unit: '点', lo: 2, hi: 10 },
    { who: '8 人が 1 か月に読んだ本の冊数', unit: '冊', lo: 0, hi: 9 },
    { who: '8 人の 1 週間の運動時間', unit: '時間', lo: 1, hi: 12 },
    { who: '8 人の家から駅まで歩く時間', unit: '分', lo: 3, hi: 18 }
  ];
  // 8 個のデータ：最頻値は 1 つだけ、中央値とはちがう値
  function repData(sc) {
    for (;;) {
      var m = rint(sc.lo, sc.hi), times = pick([2, 2, 3]), d = range(times, function () { return m; }), guard = 0;
      while (d.length < 8 && guard++ < 300) { var v = rint(sc.lo, sc.hi), c = d.filter(function (x) { return x === v; }).length; if (v !== m && c < times - 1) d.push(v); }
      if (d.length < 8) continue;
      var s = sorted(d), med = D.median(s);
      if (med === m || s[3] === s[4] && Math.random() < .5) continue;
      return { d: shuffle(d), s: s, med: med, mode: m, times: times };
    }
  }
  function repTask() {
    var sc = pick(REP), g = repData(sc), u = uName(sc.unit), s = g.s, U = withU(u);
    var hl = []; s.forEach(function (v, i) { if (v === g.mode) hl.push(i); });
    var steps = [
      { q: '中央値を選びなさい。', ans: U(f(g.med)), wrong: D.near(g.med, [s[3], s[4], D.mean(s), (s[0] + s[7]) / 2], 3).map(U), memo: '中央値 ' + f(g.med) + ' ' + u, mark: { at: 3.5, lab: '中央値' },
        hint: '8 個（偶数）なので、4 番目と 5 番目の平均です。' },
      { q: '最頻値を選びなさい。', ans: U(f(g.mode)), wrong: D.near(g.mode, [g.med, s[7], s[0], g.mode + 1], 3).map(U), memo: '最頻値 ' + f(g.mode) + ' ' + u, mark: { hl: hl },
        hint: 'いちばん多く出てくる値です。' }
    ];
    return { q: ['次のデータは、' + sc.who + '（' + u + '）である。', 'データを小さい順に並べてから、中央値と最頻値を求めよう。'],
      mount: D.sortSteps(g.d, steps, { say: [medianSay(s, u), f(g.mode) + ' が ' + g.times + ' 回出てきて、いちばん多いので、最頻値は ' + f(g.mode) + '（' + u + '）です。'] }) };
  }
  var MEANS = [
    { who: '6 人の 10 点満点の小テストの得点', unit: '点', lo: 1, hi: 10 },
    { who: '6 人のハンドボール投げの記録', unit: 'm', lo: 12, hi: 32 },
    { who: '6 人の 1 週間の運動時間', unit: '時間', lo: 0, hi: 14 },
    { who: '6 人の握力', unit: 'kg', lo: 22, hi: 42 }
  ];
  function meanQ() {
    for (;;) {
      var sc = pick(MEANS), u = uName(sc.unit), m = rint(sc.lo + 2, sc.hi - 2), d = nums(5, Math.max(sc.lo, m - 5), Math.min(sc.hi, m + 5)), last = 6 * m - D.sum(d);
      if (last < sc.lo || last > sc.hi) continue;
      d.push(last); d = shuffle(d);
      var sum = D.sum(d), med = D.median(d), U = withU(u);
      if (med === m) continue;
      return { q: ['次のデータは、' + sc.who + '（' + u + '）である。', '平均値を求めよう。'], sub: line(d), ans: U(f(m)), wrong: D.near(m, [med, sum / 5, (Math.min.apply(null, d) + Math.max.apply(null, d)) / 2, m + 1], 3).map(U),
        say: '平均値 = (' + d.map(F1).join(' + ') + ') ÷ 6 = ' + sum + ' ÷ 6 = ' + f(m) + '（' + u + '）' };
    }
  }
  // 時間をはかる問題用（小さい順に並んだデータから、中央値・最頻値）
  function medianQ() {
    var g = repData(REP[0]), s = g.s;
    return { big: '', q: '次の 8 個のデータは、小さい順に並んでいる。中央値を求めよ。', sub: line(s), ans: f(g.med), wrong: D.near(g.med, [s[3], s[4], Math.round(D.mean(s)), g.mode]), say: medianSay(s) };
  }
  function modeQ() {
    var g = repData(pick(REP)), s = g.s;
    return { big: '', q: '次の 8 個のデータは、小さい順に並んでいる。最頻値を求めよ。', sub: line(s), ans: f(g.mode), wrong: D.near(g.mode, [g.med, s[7], s[0], g.mode + 1]), say: g.mode + ' が ' + g.times + ' 回出てきて、もっとも多いので最頻値です。' };
  }

  // =====================================================================
  // 33 度数分布表とヒストグラム
  // =====================================================================
  var SCENES = [{ name: '20 人の数学の小テストの得点', unit: '点', w: 10, k: 6, lo: 40 }, { name: '20 人のハンドボール投げの記録', unit: 'm', w: 5, k: 6, lo: 10 }, { name: '20 人の通学時間', unit: '分', w: 10, k: 5, lo: 0 },
    { name: '20 人の 1 週間の運動時間', unit: '時間', w: 2, k: 6, lo: 0 }, { name: '20 人の先月の読書時間', unit: '時間', w: 4, k: 6, lo: 0 }];
  var SHAPES = [[2, 4, 6, 5, 2, 1], [1, 3, 5, 6, 3, 2], [3, 5, 6, 3, 2, 1], [1, 2, 4, 6, 5, 2], [2, 3, 7, 5, 2, 1], [1, 4, 5, 6, 3, 1], [2, 3, 4, 6, 4, 1], [1, 2, 5, 7, 3, 2]];
  // 度数の合計はいつも 20。度数 0 の階級は作らない
  function genClass(sc) {
    var s = sc || pick(SCENES), lo = s.lo || 0, fr = pick(SHAPES).slice(0, s.k);
    if (Math.random() < .4) fr.reverse();
    while (D.sum(fr) < 20) fr[rint(1, fr.length - 2)]++;
    var edges = range(s.k + 1, function (i) { return lo + i * s.w; }), data = [];
    fr.forEach(function (c, i) { for (var k = 0; k < c; k++) data.push(rint(edges[i], edges[i + 1] - 1)); });
    return { s: s, edges: edges, fr: fr, data: sorted(data), n: D.sum(fr), mids: fr.map(function (_, i) { return (edges[i] + edges[i + 1]) / 2; }) };
  }
  var clsName = function (c, i) { return i ? c.edges[i] + ' ～ ' + c.edges[i + 1] : c.edges[0] + ' 以上 ' + c.edges[1] + ' 未満'; };
  // 20 個のデータ：小さい順に、10 個ずつ 2 行（スマホでも 2 行）
  var data20 = function (c) { return '<div class="db-grid d20" style="--c:10">' + c.data.map(function (v) { return '<span>' + f(v) + '</span>'; }).join('') + '</div><p class="db-cap">（小さい順。単位は ' + uName(c.s.unit) + '）</p>'; };
  // all：階級値・度数・相対度数をうめる（その順に）。all でなければ度数だけ
  function freqHistTask(c, all) {
    var un = uName(c.s.unit), two = function (x) { return x.toFixed(2); };
    var head = [hd('階級（' + un + '）')].concat(all ? [hd('階級値（' + un + '）')] : [], [hd('度数（人）')], all ? [hd('相対度数')] : []);
    var midCards = uniqSort(c.mids.concat([c.edges[0]])).map(F1);
    var mids = c.mids.map(function (m, i) { var x = cell(f(m), midCards); x.hint = '階級値は、その階級の真ん中の値です。'; return x; });
    var frCards = uniqSort(c.fr.concat([0])).map(String);
    var fq = c.fr.map(function (v, i) { var x = cell(v, frCards); x.hint = c.edges[i] + ' 以上 ' + c.edges[i + 1] + ' 未満のデータの個数を数えよう。'; return x; });
    var tot = cell(c.n, [c.n - 2, c.n - 1, c.n, c.n + 1, c.n + 2]); tot.hint = '度数の合計は、データの個数と同じです。';
    var rel = c.fr.map(function (v) { var r = v / c.n, x = cell(two(r), uniqSort([r, r + .05, r + .1, Math.max(.05, r - .05), v / 10].map(function (y) { return Math.round(y * 100) / 100; })).map(two)); x.hint = '相対度数 = 度数 ÷ 度数の合計（' + c.n + '）'; return x; });
    var relT = cell('1.00', ['0.95', '1.00', '1.05', String(c.n)]); relT.hint = '相対度数の合計は 1 です。';
    var grid = [head].concat(c.fr.map(function (_, i) { return [clsName(c, i)].concat(all ? [mids[i]] : [], [fq[i]], all ? [rel[i]] : []); }), [['計'].concat(all ? [null] : [], [tot], all ? [relT] : [])]);
    var order = all ? mids.concat(fq, [tot], rel, [relT]) : fq.concat([tot]);
    return { q: ['次のデータは、' + c.s.name + 'である。', (all ? '階級値・度数・相対度数の順にうめて' : '度数をうめて') + '度数分布表を完成させ、ヒストグラムをかこう。'], sub: data20(c),
      mount: D.seq([
        { head: '(1) 度数分布表', mount: D.tableTask({ grids: [grid], order: order, say: '' }) },
        { head: '(2) ヒストグラム', mount: function (b, x) { D.histTask(c.edges, c.fr, c.s.unit)(b, { solved: x.solved, miss: x.miss, ok: function () { x.ok('<p>ヒストグラムがかけました。各階級の度数が、長方形の高さになります。</p>'); } }); } }
      ]) };
  }
  function dotData() { var n = rint(10, 14), pk = rint(2, 5); return sorted(range(n, function () { var v = pk + rint(-3, 3); return Math.max(0, Math.min(8, v)); })); }
  function dotChoice() {
    var d = dotData(), wrong = [], seen = {}; seen[String(d)] = 1;
    for (var t = 0; t < 40 && wrong.length < 3; t++) {
      var w = d.slice(); [0, 1].forEach(function () { var i = rint(0, w.length - 1); w[i] = Math.max(0, Math.min(8, w[i] + (rint(0, 1) ? 1 : -1))); });
      w = sorted(w); if (!seen[String(w)]) { seen[String(w)] = 1; wrong.push(D.dotPlot(w, 0, 8)); }
    }
    return { q: '次の ' + d.length + ' 個のデータのドットプロットはどれか。', sub: line(d), ans: D.dotPlot(d, 0, 8), wrong: wrong, figOpts: true, say: 'データの値 1 つを 1 つの点で表します。同じ値は上に重ねます。', ansFig: D.dotPlot(d, 0, 8) };
  }
  var dotDraw = function () { var d = dotData(); return { q: '次のデータ（小さい順）を、ドットプロットに表そう。', mount: D.dotTask(d, 0, 8) }; };

  // =====================================================================
  // 34 四分位数と箱ひげ図
  // =====================================================================
  // n 個のデータ（1〜20）。四分位数がきちんと分かれるもの
  function genHako(n) {
    for (;;) {
      var s = sorted(nums(n, 1, 20)), q = D.quartiles(s);
      if (q[0] < q[1] && q[1] < q[2] && s[0] < q[0] && q[2] < s[n - 1] && q[2] - q[0] >= 3) return { s: s, d: shuffle(s), q: q, five: [s[0], q[0], q[1], q[2], s[n - 1]] };
    }
  }
  // データの個数を 10・11・12・13 の順にめぐらせる（同じ個数が続かないように。4 つ終わったら、また新しく）
  var bag = [], lastN = 0;
  function nextN() {
    if (!bag.length) { bag = shuffle([10, 11, 12, 13]); if (bag[0] === lastN) bag.push(bag.shift()); }
    return lastN = bag.shift();
  }
  var drawB = function (x) { return D.boxPlot(x, 0, 20, 2); };
  // よくあるまちがいの箱ひげ図 3 つ
  function boxWrongs(five, s) {
    var n = s ? s.length : 0, h = Math.floor(n / 2), mn = five[0], q1 = five[1], med = five[2], q3 = five[3], mx = five[4];
    var c = [[mn, q1, (q1 + q3) / 2, q3, mx], [mn, q1 - 1, med, q3 + 1, mx], [mn + 1, q1, med, q3, mx - 1], [mn, q1 + 1, med, q3 - 1, mx], [mn, q1, med + 1, q3, mx], [mn, q1, med - 1, q3, mx], [mn, q1 - 2, med, q3, mx]];
    if (s && n % 2) c.unshift([mn, D.median(s.slice(0, h + 1)), med, D.median(s.slice(h)), mx]);   // 中央値も入れて前半・後半に分けたまちがい
    var key = function (a) { return a.map(F1).join(','); }, seen = {}, out = []; seen[key(five)] = 1;
    c.forEach(function (a) { var ok = a.every(function (v, i) { return v >= 0 && v <= 20 && (!i || a[i - 1] <= v); }); if (ok && !seen[key(a)] && out.length < 3) { seen[key(a)] = 1; out.push(a); } });
    return out;
  }
  // データ → 小さい順 → 中央値 → 第1・第3四分位数 → 最小値・最大値 → 範囲 → 四分位範囲（withBox なら最後に箱ひげ図を選ぶ）
  function hakoTask(b, withBox) {
    var s = b.s, n = s.length, h = Math.floor(n / 2), u0 = n % 2 ? h + 1 : h, q = b.q, mn = s[0], mx = s[n - 1], r = mx - mn, iqr = q[2] - q[0];
    var pm = (n - 1) / 2, p1 = (h - 1) / 2, p3 = u0 + (h - 1) / 2;
    var nth = function (p) { return p % 1 ? (Math.floor(p) + 1) + ' 番目と ' + (Math.ceil(p) + 1) + ' 番目の平均' : (p + 1) + ' 番目'; };
    var inc1 = n % 2 ? D.median(s.slice(0, h + 1)) : s[Math.floor(p1)], inc3 = n % 2 ? D.median(s.slice(h)) : s[Math.ceil(p3)];
    var steps = [
      { q: '中央値（第 2 四分位数）を選びなさい。', ans: f(q[1]), wrong: D.near(q[1], [s[Math.floor(pm)], s[Math.ceil(pm) + (n % 2 ? 1 : 0)], D.mean(s)]), memo: '中央値 ' + f(q[1]), mark: { at: pm, lab: '中央値' },
        hint: n + ' 個なので、真ん中は小さい方から ' + nth(pm) + 'です。' },
      { q: '第 1 四分位数を選びなさい。', ans: f(q[0]), wrong: D.near(q[0], [inc1, q[1], s[Math.ceil(p1)], q[0] + 1]), memo: '第1四分位数 ' + f(q[0]), mark: { at: p1, lab: 'Q₁' }, tint: [0, h - 1],
        hint: '色のついた前半 ' + h + ' 個の中央値です' + (n % 2 ? '（真ん中の ' + f(q[1]) + ' は入れない）' : '') + '。' },
      { q: '第 3 四分位数を選びなさい。', ans: f(q[2]), wrong: D.near(q[2], [inc3, q[1], s[Math.floor(p3)], q[2] - 1]), memo: '第3四分位数 ' + f(q[2]), mark: { at: p3, lab: 'Q₃' }, tint: [u0, n - 1],
        hint: '色のついた後半 ' + h + ' 個の中央値です' + (n % 2 ? '（真ん中の ' + f(q[1]) + ' は入れない）' : '') + '。' },
      { q: '最小値を選びなさい。', ans: f(mn), wrong: D.near(mn, [s[1], mx, q[0]]), memo: '最小値 ' + f(mn), hint: 'いちばん小さい値です。' },
      { q: '最大値を選びなさい。', ans: f(mx), wrong: D.near(mx, [s[n - 2], mn, q[2]]), memo: '最大値 ' + f(mx), hint: 'いちばん大きい値です。' },
      { q: '範囲を選びなさい。', ans: f(r), wrong: D.near(r, [iqr, mx, r + 1, mx + mn]), memo: '範囲 ' + f(mx) + ' − ' + f(mn) + ' = ' + f(r), hint: '範囲 = 最大値 − 最小値' },
      { q: '四分位範囲を選びなさい。', ans: f(iqr), wrong: D.near(iqr, [r, q[2], q[2] - q[1], iqr / 2]), memo: '四分位範囲 ' + f(q[2]) + ' − ' + f(q[0]) + ' = ' + f(iqr), hint: '四分位範囲 = 第 3 四分位数 − 第 1 四分位数' }
    ];
    if (withBox) steps.push({ q: '求めた値を表す箱ひげ図を選びなさい。', ans: drawB(b.five), wrong: boxWrongs(b.five, s).map(drawB), memoHTML: drawB(b.five), hint: 'ひげの両はしが最小値と最大値、箱の両はしが第 1・第 3 四分位数、箱の中の線が中央値です。' });
    return { q: ['次の ' + n + ' 個のデータを小さい順に並べて、', '四分位数・範囲・四分位範囲を求めよう。' + (withBox ? 'さらに箱ひげ図を選ぼう。' : '')],
      mount: D.sortSteps(b.d, steps, { say: [medianSay(s), n % 2 ? '個数が奇数なので、真ん中の値 ' + f(q[1]) + ' を除いて、前半 ' + h + ' 個と後半 ' + h + ' 個に分けます。' : '真ん中で、前半 ' + h + ' 個と後半 ' + h + ' 個に分けます。', '前半の中央値が第 1 四分位数 ' + f(q[0]) + '、後半の中央値が第 3 四分位数 ' + f(q[2]) + ' です。'] }) };
  }
  var fiveTable = function (five) { return '<table class="db-t db-five"><tr>' + ['最小値', '第 1 四分位数', '中央値', '第 3 四分位数', '最大値'].map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr><tr>' + five.map(function (v) { return '<td>' + f(v) + '</td>'; }).join('') + '</tr></table>'; };
  function boxPick(b) {
    b = b || genHako(rint(10, 13));
    return { q: '次の 5 つの値を表す箱ひげ図はどれか。', fig: fiveTable(b.five), ans: drawB(b.five), wrong: boxWrongs(b.five, b.s).map(drawB), figOpts: true, say: 'ひげの両はしが最小値と最大値、箱の両はしが第 1・第 3 四分位数、箱の中の線が中央値です。', ansFig: drawB(b.five) };
  }
  function boxDrawQ() { var b = genHako(rint(10, 13)); return { q: ['次の 5 つの値を表す箱ひげ図をかこう。', '箱 → 箱の中の線 → ひげ の順に、位置を押してかこう（押したまま動かせるよ）。'], mount: D.boxDraw(b.five, 0, 20, 2) }; }
  // 時間をはかる問題用
  function quartQ() {
    var b = genHako(rint(10, 13)), k = rint(0, 2), v = b.q[k], n = b.s.length, name = ['第 1 四分位数', '第 2 四分位数', '第 3 四分位数'][k];
    return { big: '', q: '次の ' + n + ' 個のデータは、小さい順に並んでいる。' + name + 'を求めよ。', sub: line(b.s), ans: f(v), wrong: D.near(v, b.q.concat([v + 1, v - 1])), say: '第 1 四分位数 ' + f(b.q[0]) + '、第 2 四分位数 ' + f(b.q[1]) + '、第 3 四分位数 ' + f(b.q[2]) + ' です。' };
  }
  function boxRead() {
    var b = genHako(rint(10, 13)), k = rint(0, 6), name = ['最小値', '第 1 四分位数', '中央値', '第 3 四分位数', '最大値', '範囲', '四分位範囲'][k], v = k < 5 ? b.five[k] : k === 5 ? b.five[4] - b.five[0] : b.five[3] - b.five[1];
    return { big: '', q: 'この箱ひげ図の' + name + 'はいくつか。', fig: drawB(b.five), ans: f(v), wrong: D.near(v, b.five.concat([b.five[3] - b.five[1], b.five[4] - b.five[0]])), say: '5 つの値は、小さい方から ' + b.five.map(F1).join('、') + ' です。' + (k === 5 ? '範囲 = 最大値 − 最小値。' : k === 6 ? '四分位範囲 = 第 3 四分位数 − 第 1 四分位数。' : '') };
  }

  // =====================================================================
  // 35 分散と標準偏差（5 個のデータ。単位がつくのは標準偏差だけ）
  // =====================================================================
  var VSC = [{ who: '5 人の 10 点満点の小テストの得点', head: '得点', unit: '点', lo: 0, hi: 10 }, { who: '5 人のハンドボール投げの記録', head: '記録', unit: 'm', lo: 10, hi: 35 },
    { who: '5 人の握力', head: '握力', unit: 'kg', lo: 20, hi: 45 }, { who: '5 人の 1 週間の読書時間', head: '時間', unit: '時間', lo: 0, hi: 15 }];
  function genVar() {
    for (;;) {
      var sc = pick(VSC), dv = range(4, function () { return rint(-4, 4); }), last = -D.sum(dv);
      if (Math.abs(last) > 4) continue;
      dv.push(last);
      var ss = D.sum(dv.map(function (d) { return d * d; })), V = ss / 5;
      if ([2, 4, 6, 8, 10, 16].indexOf(V) < 0 || dv.filter(function (d) { return d === 0; }).length > 1) continue;
      var m = rint(sc.lo + 4, sc.hi - 4), x = dv.map(function (d) { return m + d; });
      return { sc: sc, u: uName(sc.unit), x: x, dv: dv, m: m, ss: ss, V: V, sd: D.rootS(V) };
    }
  }
  var sgn = function (v) { return f(v); };
  function varTask() {
    var g = genVar(), u = g.u, t = D.sum(g.x);
    var sum = cell(t, uniqSort([t, t + 5, t - 5, t + 1])), mean = cell(g.m, uniqSort([g.m, g.m + 1, g.m - 1, Math.round(t / 4)]));
    sum.hint = '値の合計を計算しよう。'; mean.hint = '平均値 = 合計 ÷ 5';
    var cs = uniqSort(g.dv.concat(g.dv.map(function (d) { return -d; }))).map(sgn);
    var dc = g.dv.map(function (d, i) { var c = cell(sgn(d), cs); c.hint = '偏差 = 値 − 平均値（' + g.x[i] + ' − ' + g.m + '）'; return c; });
    var sqs = uniqSort(g.dv.map(function (d) { return d * d; }).concat([1, 4])), qc = g.dv.map(function (d) { var c = cell(d * d, sqs); c.hint = '偏差を 2 乗します。負の数も 2 乗すると正の数です。'; return c; });
    var ssc = cell(g.ss, uniqSort([g.ss, g.ss + 2, g.ss - 2, g.ss + 5])); ssc.hint = '(偏差)² の合計を計算しよう。';
    var grid = [[hd('')].concat(range(5, function (i) { return hd('①②③④⑤'[i]); }), [hd('計'), hd('平均')]), [hd(g.sc.head + '（' + u + '）')].concat(g.x, [sum, mean]), [hd('偏差')].concat(dc, ['0', '0']), [hd('(偏差)²')].concat(qc, [ssc, null])];
    var sdU = g.sd + ' ' + u, V = f(g.V);
    var steps = [
      { q: '分散を選びなさい。', ans: V, wrong: uniqS([V + ' ' + u, String(g.ss), f(g.V + 1), f(g.ss / 4)]).filter(function (v) { return v !== V; }), memo: '分散 = ' + g.ss + ' ÷ 5 = ' + V,
        hint: '分散 = (偏差)² の合計 ÷ データの個数（5）。分散には単位をつけないよ。' },
      { q: '標準偏差を選びなさい。単位にも注意しよう。', ans: sdU, wrong: uniqS([g.sd, V + ' ' + u, '√' + (g.V + 1) + ' ' + u, (g.V * 2) + ' ' + u]).filter(function (v) { return v !== sdU; }), memo: '標準偏差 = √' + V + (g.sd !== '√' + V ? ' = ' + g.sd : '') + '（' + u + '）',
        hint: '標準偏差 = √分散。標準偏差には、もとのデータと同じ単位（' + u + '）をつけます。' }
    ];
    return { q: ['次のデータは、' + g.sc.who + '（' + u + '）である。', '表を完成させて、分散と標準偏差を求めよう。'],
      mount: D.seq([
        { head: '(1) 表をうめよう', mount: D.tableTask({ grids: [grid], order: [sum, mean].concat(dc, qc, [ssc]), say: '' }) },
        { head: '(2) 分散と標準偏差', mount: D.chain(steps, { compact: true, say: ['分散 s² = ' + g.ss + ' ÷ 5 = ' + V, '標準偏差 s = √' + V + (g.sd !== '√' + V ? ' = ' + g.sd : '') + '（' + u + '）', '単位がつくのは標準偏差だけ。標準偏差は、もとのデータと同じ単位（' + u + '）で散らばりを表します。'] }) }
      ]) };
  }
  // 時間をはかる問題用
  function varQ() {
    var g = genVar(), k = rint(0, 1), sdU = g.sd + ' ' + g.u;
    return [
      { big: '', q: '次の 5 個のデータの分散を求めよ。', sub: line(g.x), ans: f(g.V), wrong: D.near(g.V, [g.ss, g.V * 2, g.V + 1]), say: '平均値 ' + g.m + '。偏差は ' + g.dv.map(F1).join('、') + '。分散 = ' + g.ss + ' ÷ 5 = ' + f(g.V) },
      { big: '', q: g.sc.who + '（' + g.u + '）の分散が ' + f(g.V) + ' のとき、標準偏差はいくつか。', ans: sdU, wrong: uniqS([g.sd, f(g.V) + ' ' + g.u, '√' + (g.V * 2) + ' ' + g.u]).filter(function (v) { return v !== sdU; }), say: '標準偏差は分散の正の平方根で、もとのデータと同じ単位をつけます。s = ' + sdU }
    ][k];
  }

  // =====================================================================
  // 36 散布図と相関係数
  // =====================================================================
  function scatterJudge() {
    var r = pick([.9, .8, -.9, -.8, 0, .05]), p = D.cloudNear(r, 18), name = r > .5 ? '正の相関関係がある' : r < -.5 ? '負の相関関係がある' : '相関関係がない';
    return { q: 'この散布図の 2 つのデータの関係はどれか。', fig: D.scatter(p), ans: name, wrong: ['正の相関関係がある', '負の相関関係がある', '相関関係がない', '関係を読みとれない'].filter(function (v) { return v !== name; }), say: r > .5 ? '点が右上がりに並んでいます。' : r < -.5 ? '点が右下がりに並んでいます。' : '点全体に、右上がりや右下がりの傾向がありません。' };
  }
  function rPick() {
    var all = [.9, .5, 0, -.5, -.9], r = pick(all), p = D.cloudNear(r, 20), a = f(r);
    return { q: 'この散布図の相関係数にもっとも近いものはどれか。', fig: D.scatter(p), ans: a, wrong: shuffle(all.filter(function (v) { return v !== r; })).slice(0, 3).map(function (v) { return f(v); }), say: '右上がりで直線に近いほど 1 に、右下がりで直線に近いほど −1 に近づきます。' };
  }
  var RFORM = '!r = {(x と y の共分散)|(x の標準偏差) × (y の標準偏差)}';
  var RC = [[12, 4, 5], [6, 2, 5], [15, 5, 6], [-12, 5, 3], [8, 2, 5], [-9, 3, 5], [18, 4, 6], [-6, 4, 2], [14, 4, 5], [-4, 2, 5]];
  var frac = function (a, b) { return '<span class="fs-fr"><span>' + a + '</span><span>' + b + '</span></span>'; }, mi = function (t) { return '<span class="fs-m">' + t + '</span>'; };
  // 公式に値を入れて式を作ってから、相関係数を求める
  function rCalcTask(c) {
    c = c || pick(RC);
    var cov = c[0], sx = c[1], sy = c[2], pr = sx * sy, r = cov / pr;
    var pool = uniqS([f(cov), sx, sy, pr, f(-cov), sx + sy]).slice(0, 6);
    var cC = cell(f(cov), pool), cX = cell(sx, pool), cY = cell(sy, pool), cP = cell(pr, uniqSort([pr, sx + sy, pr * 2, Math.abs(cov)]).map(F1)), cR = cell(f(r), uniqS([f(r), f(-r), f(cov / sx), f(Math.round((r + .1) * 10) / 10)]));
    cC.hint = '分子は x と y の共分散'; cX.hint = '分母は x の標準偏差 × y の標準偏差'; cY.hint = '分母は x の標準偏差 × y の標準偏差'; cP.hint = sx + ' × ' + sy + ' を計算しよう。'; cR.hint = f(cov) + ' ÷ ' + pr + ' を計算しよう。';
    var formula = function (box) { return mi('<i>r</i> = ') + frac(box(cC), box(cX) + ' × ' + box(cY)) + mi(' = ') + frac(f(cov), box(cP)) + mi(' = ') + box(cR); };
    return { q: ['x の標準偏差が ' + sx + '、y の標準偏差が ' + sy + '、', 'x と y の共分散が ' + f(cov) + ' である。公式に値を入れて、相関係数 r を求めよう。'],
      mount: D.tableTask({ grids: [], formula: formula, formulaHead: md(RFORM.slice(1)), order: [cC, cX, cY, cP, cR], say: 'r = ' + f(cov) + ' ÷ (' + sx + ' × ' + sy + ') = ' + f(cov) + ' ÷ ' + pr + ' = ' + f(r) }) };
  }
  function rCalcQ() { var c = pick(RC), r = c[0] / (c[1] * c[2]); return { big: '', q: 'x の標準偏差が ' + c[1] + '、y の標準偏差が ' + c[2] + '、共分散が ' + f(c[0]) + ' のとき、相関係数を求めよ。', ans: f(r), wrong: D.near(r, [-r, c[0] / c[1], c[0] / c[2], r + .1, r - .1]), say: 'r = ' + f(c[0]) + ' ÷ (' + c[1] + ' × ' + c[2] + ') = ' + f(r) + ' です。' }; }
  function genCorr() {
    var dx = [-2, -1, 0, 1, 2], dy, S, k = pick([1, 2]);
    do { dy = shuffle(dx); S = D.sum(dx.map(function (v, i) { return v * dy[i]; })); } while (Math.abs(S) < 3 || Math.abs(S) > 9);
    var ord = shuffle([0, 1, 2, 3, 4]); dx = ord.map(function (i) { return dx[i]; }); dy = ord.map(function (i) { return dy[i]; });
    var mx = rint(4, 9), my = rint(5, 12), ky = dy.map(function (v) { return v * k; });
    return { x: dx.map(function (v) { return v + mx; }), y: ky.map(function (v) { return v + my; }), dx: dx, dy: ky, mx: mx, my: my, S: S, k: k, sxy: S * k, vx: 2, vy: 2 * k * k, cov: S * k / 5, r: S / 10 };
  }
  // 表をうめて相関係数：はじめは表だけ。表ができたら x の標準偏差 → y の標準偏差 → 共分散 → 公式 と 1 つずつ出す
  function corrTask() {
    var g = genCorr(), sx = D.sum(g.x), sy = D.sum(g.y), near = function (a, b) { return uniqSort([a, a + 5, a - 5, b]); };
    var xS = cell(sx, near(sx, sx + 1)), xM = cell(g.mx, uniqSort([g.mx, g.mx + 1, g.mx - 1, sx])), yS = cell(sy, near(sy, sy + 1)), yM = cell(g.my, uniqSort([g.my, g.my + 1, g.my - 1, sy]));
    xS.hint = 'x の合計'; xM.hint = 'x の平均値 = 合計 ÷ 5'; yS.hint = 'y の合計'; yM.hint = 'y の平均値 = 合計 ÷ 5';
    var dxs = uniqSort(g.dx).map(F1), dys = uniqSort(g.dy).map(F1);
    var cdx = g.dx.map(function (v) { var c = cell(f(v), dxs); c.hint = 'x の偏差 = x − x の平均値'; return c; }), cdy = g.dy.map(function (v) { var c = cell(f(v), dys); c.hint = 'y の偏差 = y − y の平均値'; return c; });
    var q1 = uniqSort(g.dx.map(function (v) { return v * v; })), q2 = uniqSort(g.dy.map(function (v) { return v * v; }));
    var cqx = g.dx.map(function (v) { var c = cell(v * v, q1); c.hint = 'x の偏差を 2 乗します。'; return c; }), cqy = g.dy.map(function (v) { var c = cell(v * v, q2); c.hint = 'y の偏差を 2 乗します。'; return c; });
    var prods = g.dx.map(function (v, i) { return v * g.dy[i]; });
    var cp = prods.map(function (v) { var c = cell(f(v), uniqSort(prods.concat([-v])).map(F1)); c.hint = 'x の偏差 × y の偏差'; return c; });
    var tq1 = 10, tq2 = 10 * g.k * g.k, tp = g.sxy;
    var cT1 = cell(tq1, uniqSort([tq1, tq1 + 2, tq1 - 2])), cT2 = cell(tq2, uniqSort([tq2, tq2 + 2, tq2 - 2])), cTp = cell(f(tp), uniqSort([tp, tp + 1, tp - 1, -tp]).map(F1));
    var cV1 = cell(f(g.vx), uniqSort([g.vx, g.vx + 1, 1]).map(F1)), cV2 = cell(f(g.vy), uniqSort([g.vy, g.vy + 1, g.vy - 1]).map(F1)), cC = cell(f(g.cov), uniqSort([g.cov, g.cov + 1, g.cov - 1, tp]).map(F1));
    [cT1, cT2, cTp].forEach(function (c) { c.hint = '合計を計算しよう。'; });
    cV1.hint = 'x の分散 = (x の偏差)² の平均値'; cV2.hint = 'y の分散 = (y の偏差)² の平均値'; cC.hint = '共分散 = 偏差の積の平均値';
    var s1 = D.rootS(g.vx), s2 = D.rootS(g.vy);
    var sdc = function (s, v, h) { var c = cell(s, shuffle(uniqS([s, D.rootS(v + 1), f(v), D.rootS(v * 2)])).slice(0, 4)); c.hint = h; return c; };
    var rx = sdc(s1, g.vx, 'x の標準偏差 = x の分散の正の平方根'), ry = sdc(s2, g.vy, 'y の標準偏差 = y の分散の正の平方根');
    var mC = cell(f(g.cov), uniqSort([g.cov, g.cov + 1, g.cov - 1, tp]).map(F1)); mC.hint = '共分散は、表の「偏差の積」の平均です。';
    var fC = cell(f(g.cov), mC.cards), fx = cell(s1, rx.cards), fy = cell(s2, ry.cards), prod = 2 * g.k, rr = cell(f(g.r), uniqSort([g.r, -g.r, g.r / 2, g.r > 0 ? 1 : -1]).map(F1));
    fC.hint = '分子は共分散'; fx.hint = '分母は x の標準偏差 × y の標準偏差'; fy.hint = '分母は x の標準偏差 × y の標準偏差'; rr.hint = f(g.cov) + ' ÷ (' + s1 + ' × ' + s2 + ') = ' + f(g.cov) + ' ÷ ' + prod;
    var L = function (i) { return hd('①②③④⑤'[i]); };
    var tall = [[hd(''), hd('x'), hd('y'), hd('x の偏差'), hd('(x の偏差)²'), hd('y の偏差'), hd('(y の偏差)²'), hd('偏差の積')]];
    for (var i = 0; i < 5; i++) tall.push([L(i), g.x[i], g.y[i], cdx[i], cqx[i], cdy[i], cqy[i], cp[i]]);
    tall.push([hd('計'), xS, yS, '0', cT1, '0', cT2, cTp]); tall.push([hd('平均'), xM, yM, '0', cV1, '0', cV2, cC]);
    var wide = [[hd('')].concat(range(5, L), [hd('計'), hd('平均')]),
      [hd('x')].concat(g.x, [xS, xM]), [hd('y')].concat(g.y, [yS, yM]), [hd('x の偏差')].concat(cdx, ['0', '0']), [hd('(x の偏差)²')].concat(cqx, [cT1, cV1]),
      [hd('y の偏差')].concat(cdy, ['0', '0']), [hd('(y の偏差)²')].concat(cqy, [cT2, cV2]), [hd('偏差の積')].concat(cp, [cTp, cC])];
    var formula = function (box) { return mi('<i>r</i> = ') + frac(box(fC), box(fx) + ' × ' + box(fy)) + mi(' = ') + box(rr); };
    return { q: '2 つのデータ x、y の表を完成させて、相関係数 r を求めよう。', mount: D.tableTask({ grids: [tall, wide], formula: formula, reveal: true, formulaAt: fC,
      order: [xS, xM, yS, yM].concat(cdx, cqx, [cT1, cV1], cdy, cqy, [cT2, cV2], cp, [cTp, cC, rx, ry, mC, fC, fx, fy, rr]),
      below: [['x の標準偏差', rx], ['y の標準偏差', ry], ['共分散', mC]], formulaHead: md(RFORM.slice(1)),
      say: 'r = ' + f(g.cov) + ' ÷ (' + s1 + ' × ' + s2 + ') = ' + f(g.cov) + ' ÷ ' + prod + ' = ' + f(g.r) }) };
  }

  // =====================================================================
  // 37 まとめ
  // =====================================================================
  // 総合問題：各ページの問題を 1 問ずつ（全範囲）
  function allTasks() {
    return [repTask(), asTask(meanQ()), asTask(dotChoice()), freqHistTask(genClass(), true), hakoTask(genHako(nextN()), true), boxDrawQ(), varTask(), asTask(rPick()), rCalcTask()];
  }
  // タイムアタック：すぐ答えられる 4 択を 10 問
  function timeQ() { return [medianQ(), modeQ(), (function () { var z = meanQ(); z.big = ''; z.q = z.q.join(''); return z; })(), quartQ(), boxRead(), boxRead(), varQ(), scatterJudge(), rPick(), rCalcQ()].map(function (z) { z.big = ''; return z; }); }

  var P = {
    daihyou: function () {
      show('上から順にやってみよう。', [
        unit('中央値・最頻値・平均値', [[2, repTask], [2, meanQ, CH]], 3201),
        unit('代表値の練習', [[2, repTask], [2, meanQ, CH]])
      ]);
    },
    seiri: function () {
      show('上から順にやってみよう。', [
        unit('ドットプロット', [[2, dotDraw], [2, dotChoice, CH]], 3301),
        unit('度数分布表とヒストグラム', [[1, function () { return freqHistTask(genClass(SCENES[0]), false); }], [1, function () { return freqHistTask(genClass(SCENES[1]), true); }]], 3302),
        unit('ドットプロット・度数分布表の練習', [[1, dotDraw], [1, dotChoice, CH], [1, function () { return freqHistTask(genClass(), true); }]])
      ]);
    },
    hako: function () {
      show('上から順にやってみよう。', [
        unit('四分位数と箱ひげ図', [[4, function (i) { return hakoTask(genHako(10 + i), false); }], [2, function () { return boxPick(); }, CH]], 3401),
        unit('四分位数と箱ひげ図の練習', [[1, function () { return hakoTask(genHako(nextN()), true); }]]),
        unit('箱ひげ図をかく', [[2, boxDrawQ]])
      ]);
    },
    bunsan: function () {
      show('上から順にやってみよう。', [
        unit('表をうめて分散・標準偏差', [[2, varTask]], 3501),
        unit('分散・標準偏差の練習', [[2, varTask]])
      ]);
    },
    soukan: function () {
      show('上から順にやってみよう。', [
        unit('散布図と相関', [[2, scatterJudge, CH], [2, rPick, CH]]),
        unit('相関係数を計算する', [[2, function () { return rCalcTask(); }], [1, corrTask]])
      ]);
    },
    matome: function () {
      show('やりたい問題を選ぼう。', [
        ['総合問題', '9問・毎回かわる', function () { taskMode(allTasks, '総合問題'); }],
        ['タイムアタック', '10問', function () { quizMode(timeQ, { name: 'タイムアタック', timed: true }); }]
      ]);
    }
  };
  global.DBP = { start: function (k) { P[k](); }, _t: { repTask: repTask, meanQ: meanQ, genClass: genClass, freqHistTask: freqHistTask, genHako: genHako, hakoTask: hakoTask, boxWrongs: boxWrongs, genVar: genVar, varTask: varTask, rCalcTask: rCalcTask, corrTask: corrTask, allTasks: allTasks, timeQ: timeQ, nextN: nextN, seeded: seeded } };
})(window);
