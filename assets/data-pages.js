/* ===========================================================================
   data-pages.js — 数学Ⅰ データの分析 32〜37 の問題。DBP.start('seiri') などで始める
   データはすべて、その場で作るか、この教材のために作った架空のもの。
   ========================================================================= */
(function (global) {
  'use strict';
  var D = global.DB, md = D.md, f = D.f, cell = D.cell, hd = D.hd, rint = Sek.rint, shuffle = Sek.shuffle, pick = Sek.pick;
  var M = '−', app = function () { return document.getElementById('app'); }, menuEl = function () { return document.getElementById('menu'); };
  var range = function (n, fn) { return Array.from({ length: n }, function (_, i) { return fn(i); }); };
  var uniqSort = function (a) { return Array.from(new Set(a)).sort(function (x, y) { return x - y; }); };
  var cur = null;
  function quizMode(make, o) { menuEl().innerHTML = ''; var go = function () { Sek.quiz(app(), make(), Object.assign({ home: cur, again: go }, o)); }; go(); }
  function taskMode(make, name) { menuEl().innerHTML = ''; var go = function () { D.run(app(), make(), { name: name, home: cur, again: go }); }; go(); }
  function show(lead, cards) { cur = function () { app().innerHTML = ''; Sek.menu(menuEl(), cards, lead); }; cur(); }
  var ic = function (t) { return '<span class="db-ic">' + t + '</span>'; };
  var dataBox = function (t, a) { return '<div class="db-data">' + (t ? md(t) + '<br>' : '') + D.list(a) + '</div>'; };
  var hint = function (rows) { return { rows: rows.map(function (r) { return { t: r[0], h: r[1] }; }) }; };

  // ---- 度数分布 ----
  var SCENES = [{ name: '先月の読書時間', unit: '時間', w: 4, k: 6 }, { name: '1 週間の運動時間', unit: '時間', w: 2, k: 6 }, { name: '小テストの得点', unit: '点', w: 10, k: 6, lo: 40 }, { name: '通学時間', unit: '分', w: 10, k: 5 }, { name: 'ハンドボール投げの記録', unit: 'm', w: 5, k: 6, lo: 10 }];
  var SHAPES = [[2, 4, 6, 5, 2, 1], [1, 3, 5, 6, 3, 2], [3, 5, 6, 3, 2, 1], [1, 2, 4, 6, 5, 2], [2, 3, 7, 5, 2, 1], [1, 4, 5, 5, 4, 1]];
  function genClass() {
    var s = pick(SCENES), lo = s.lo || 0, fr = pick(SHAPES).slice(0, s.k);
    while (D.sum(fr) < 20) fr[D.sum(fr) % fr.length]++;
    var edges = range(s.k + 1, function (i) { return lo + i * s.w; }), data = [];
    fr.forEach(function (c, i) { for (var k = 0; k < c; k++) data.push(rint(edges[i], edges[i + 1] - 1)); });
    return { s: s, edges: edges, fr: fr, data: shuffle(data), n: D.sum(fr), mids: fr.map(function (_, i) { return (edges[i] + edges[i + 1]) / 2; }) };
  }
  var clsName = function (c, i) { return i ? c.edges[i] + ' ～ ' + c.edges[i + 1] : c.edges[0] + ' 以上 ' + c.edges[1] + ' 未満'; };
  function freqHTML(c, hl) {
    var head = ['階級（' + c.s.unit + '）', '階級値（' + c.s.unit + '）', '度数（人）'];
    return '<table class="db-t"><tr>' + head.map(function (h, k) { return '<th' + (k === hl ? ' class="hl"' : '') + '>' + h + '</th>'; }).join('') + '</tr>' +
      c.fr.map(function (v, i) { return '<tr><td' + (hl === 0 ? ' class="hl"' : '') + '>' + clsName(c, i) + '</td><td' + (hl === 1 ? ' class="hl"' : '') + '>' + c.mids[i] + '</td><td' + (hl === 2 ? ' class="hl"' : '') + '>' + v + '</td></tr>'; }).join('') +
      '<tr><td>計</td><td></td><td>' + c.n + '</td></tr></table>';
  }
  var T1 = [['ドットプロット', '数直線の上にデータを点で表した図'], ['階級', 'データを整理するために使う区間'], ['階級の幅', 'データを整理するために使う区間の大きさ'], ['度数', '各階級に入っているデータの値の個数'], ['階級値', '階級の真ん中の値'], ['度数分布表', 'データをいくつかの階級に分けて整理した表'], ['累積度数', '最初の階級からその階級までの度数を合計したもの'], ['ヒストグラム', '階級の幅を横、度数を縦とする長方形をすきまなく並べたグラフ'], ['相対度数', '各階級の度数を度数の合計でわった値'], ['累積相対度数', '最初の階級からその階級までの相対度数を合計したもの']];
  function tableWords() {
    var out = [];
    for (var i = 0; i < 6; i++) {
      var c = genClass(), hl = i % 3, names = ['階級', '階級値', '度数'];
      out.push({ big: '', q: '色のついた列は何を表しているか。', fig: freqHTML(c, hl), ans: names[hl], wrong: shuffle(names.filter(function (n) { return n !== names[hl]; }).concat(['相対度数'])).slice(0, 3), say: ['データを整理するために使う区間が階級です。', '階級の真ん中の値が階級値です。', '各階級に入っているデータの個数が度数です。'][hl] });
    }
    var c2 = genClass();
    out.push({ big: '', q: 'この度数分布表の階級の幅はいくつか。', fig: freqHTML(c2), ans: c2.s.w + c2.s.unit, wrong: [c2.s.w * 2 + c2.s.unit, c2.s.w / 2 + c2.s.unit, c2.s.w * 3 + c2.s.unit], say: '階級の区間の大きさが階級の幅です。' });
    return out;
  }
  function dotData() { var n = rint(10, 14), pk = rint(2, 5); return range(n, function () { var v = pk + rint(-3, 3); return Math.max(0, Math.min(8, v)); }); }
  function dotChoice() {
    var d = dotData(), wrong = [], base = D.sorted(d);
    for (var t = 0; t < 3; t++) { var w = base.slice(); [0, 1, 2].forEach(function (k) { var i = rint(0, w.length - 1); w[i] = Math.max(0, Math.min(8, w[i] + (rint(0, 1) ? 1 : -1))); }); wrong.push(D.dotPlot(w, 0, 8)); }
    return { big: '', q: 'データ ' + D.list(d) + ' のドットプロットはどれか。', ans: D.dotPlot(d, 0, 8), wrong: wrong, figOpts: true, say: 'データの値 1 つを 1 つの点で表します。同じ値は上に重ねます。', ansFig: D.dotPlot(d, 0, 8) };
  }
  function freqTask(withMid) {
    var c = genClass(), order = [], grid = [[hd('階級（' + c.s.unit + '）')]];
    if (withMid) grid[0].push(hd('階級値（' + c.s.unit + '）'));
    grid[0].push(hd('度数（人）'));
    var mids = c.mids.map(function (m) { return cell(m, c.mids.concat([c.mids[0] - c.s.w / 2])); }), colF = uniqSort(c.fr.concat([0])), fq = c.fr.map(function (v) { return cell(v, colF); });
    c.fr.forEach(function (_, i) { grid.push([clsName(c, i)].concat(withMid ? [mids[i]] : [], [fq[i]])); });
    var tot = cell(c.n, [c.n, c.n - 1, c.n + 1, c.n + 2]);
    grid.push(['計'].concat(withMid ? [null] : [], [tot]));
    if (withMid) order = order.concat(mids);
    order = order.concat(fq, [tot]);
    return { q: c.s.name + 'のデータ（単位 ' + c.s.unit + '）を度数分布表にまとめよう。', mount: D.tableTask({ grids: [grid], order: order, pre: dataBox('', c.data), say: '度数の合計はデータの個数 ' + c.n + ' になります。' }) };
  }
  function relTask() {
    var c = genClass(), rels = c.fr.map(function (v) { return v / c.n; }), acc = 0, grid = [[hd('階級（' + c.s.unit + '）'), hd('度数'), hd('相対度数'), hd('累積度数')]], rc = [], ac = [];
    c.fr.forEach(function (v, i) {
      acc += v;
      var a = rels[i].toFixed(2), r = cell(a, uniqSort([rels[i], rels[i] + .05, Math.max(0, rels[i] - .05), v / 10]).map(function (x) { return x.toFixed(2); }));
      r.hint = '相対度数 = 度数 ÷ ' + c.n;
      var q = cell(acc, uniqSort([acc, acc + 1, Math.max(0, acc - 1), v]));
      q.hint = '累積度数は、最初の階級からこの階級までの度数の合計';
      rc.push(r); ac.push(q); grid.push([clsName(c, i), v, r, q]);
    });
    grid.push(['計', c.n, '1.00', null]);
    return { q: '相対度数と累積度数をうめよう。', mount: D.tableTask({ grids: [grid], order: rc.concat(ac), say: '相対度数の合計は 1 です。累積度数の最後は度数の合計になります。' }) };
  }
  function histChoice() {
    var c = genClass(), wrong = [];
    var seen = {}; seen[String(c.fr)] = 1;
    for (var t = 0; t < 40 && wrong.length < 3; t++) {
      var w = c.fr.slice(), i = rint(0, w.length - 2), x = w[i]; w[i] = w[i + 1]; w[i + 1] = x;
      if (t % 2) { var j = rint(0, w.length - 1); w[j] = Math.max(1, w[j] + (rint(0, 1) ? 1 : -1)); }
      if (!seen[String(w)]) { seen[String(w)] = 1; wrong.push(D.histogram(c.edges, w, c.s.unit)); }
    }
    return { big: '', q: 'この度数分布表のヒストグラムはどれか。', fig: freqHTML(c), ans: D.histogram(c.edges, c.fr, c.s.unit), wrong: wrong, figOpts: true, say: '各階級の度数が、長方形の高さになります。', ansFig: D.histogram(c.edges, c.fr, c.s.unit) };
  }
  function histRead() {
    var c = genClass(), k = rint(2, c.fr.length - 2), below = D.sum(c.fr.slice(0, k)), top = c.fr.indexOf(Math.max.apply(null, c.fr)), pct = below / c.n * 100;
    return pick([
      { big: '', q: c.s.name + 'のヒストグラムである。' + c.edges[k] + c.s.unit + ' 未満の人は何人か。', fig: D.histogram(c.edges, c.fr, c.s.unit), ans: below + '人', wrong: D.near(below, [below + c.fr[k], c.fr[k - 1]]).map(function (v) { return v + '人'; }), say: '最初の階級から度数を合計します。' },
      { big: '', q: c.s.name + 'のヒストグラムである。' + c.edges[k] + c.s.unit + ' 未満の人の割合は全体の何 % か。', fig: D.histogram(c.edges, c.fr, c.s.unit), ans: f(pct) + '%', wrong: D.near(pct, [pct + 5, pct - 5, pct + 10, c.fr[k] / c.n * 100]).map(function (v) { return v + '%'; }), say: below + ' ÷ ' + c.n + ' = ' + f(below / c.n) + ' なので ' + f(pct) + ' % です。' },
      { big: '', q: '度数がもっとも大きい階級の階級値はいくつか。', fig: D.histogram(c.edges, c.fr, c.s.unit), ans: c.mids[top] + c.s.unit, wrong: Sek.uniq([c.edges[top] + c.s.unit, c.edges[top + 1] + c.s.unit, c.fr[top] + c.s.unit, c.mids[(top + 1) % c.mids.length] + c.s.unit]).filter(function (v) { return v !== c.mids[top] + c.s.unit; }).slice(0, 3), say: 'もっとも高い長方形の階級の、真ん中の値です。' }
    ]);
  }

  // ---- 代表値 ----
  var T2 = [['代表値', 'データ全体の特徴を表す数値'], ['平均値', 'データの値の合計をデータの総数でわった値'], ['中央値', 'データの値を小さい順に並べたとき、中央にある値'], ['最頻値', 'データのなかでもっとも多く出てくる値'], ['外れ値', 'ほかの値から極端にかけ離れたデータの値'], ['メジアン', '中央値の別の呼び方'], ['モード', '最頻値の別の呼び方']];
  function nums(n, lo, hi) { return range(n, function () { return rint(lo, hi); }); }
  function medianSay(d) {
    var s = D.sorted(d), n = s.length;
    if (n % 2) return '小さい順に ' + D.list(s) + '。' + n + ' 個なので、' + ((n + 1) / 2) + ' 番目の ' + f(D.median(d)) + ' が中央値です。';
    return '小さい順に ' + D.list(s) + '。' + n + ' 個なので、' + (n / 2) + ' 番目と ' + (n / 2 + 1) + ' 番目の平均 ' + f(D.median(d)) + ' が中央値です。';
  }
  function medianQ(sortedShow) {
    var n = pick([7, 8, 9, 10]), d = nums(n, 1, 20), s = D.sorted(d), m = D.median(d), h = Math.floor(n / 2);
    return { big: '', q: (sortedShow ? '小さい順に並べたデータ ' + D.list(s) : 'データ ' + D.list(d)) + ' の中央値を求めよ。', ans: f(m), wrong: D.near(m, [s[h - 1], s[h], s[h + 1] === undefined ? m + 1 : s[h + 1], D.mean(d)]), say: medianSay(d), p: hint([[D.list(s), '小さい順に並べます。'], ['中央値 = ' + f(m), n % 2 ? '真ん中の値です。' : '真ん中の 2 つの平均です。']]) };
  }
  function meanQ() {
    var n = pick([4, 5, 6, 8]), m = rint(4, 12), d = nums(n - 1, Math.max(0, m - 5), m + 5); d.push(m * n - D.sum(d));
    if (d[n - 1] < 0) return meanQ();
    d = shuffle(d);
    return { big: '', q: 'データ ' + D.list(d) + ' の平均値を求めよ。', ans: f(m), wrong: D.near(m, [D.median(d), D.sum(d), m + 1, m - 1]), say: '合計 ' + D.sum(d) + ' を個数 ' + n + ' でわって ' + f(m) + ' です。', p: hint([['(' + d.map(f).join(' + ') + ') ÷ ' + n, '合計を個数でわります。'], ['= ' + D.sum(d) + ' ÷ ' + n + ' = ' + f(m), 'わり算をします。']]) };
  }
  function modeQ() {
    var base = rint(2, 9), d = nums(7, 1, 12).concat([base, base, base]), md0 = D.modes(d);
    if (md0.length !== 1) return modeQ();
    d = shuffle(d);
    return { big: '', q: 'データ ' + D.list(d) + ' の最頻値を求めよ。', ans: f(md0[0]), wrong: D.near(md0[0], [D.median(d), D.mean(d), Math.max.apply(null, d)]), say: '3 回以上出てくる ' + md0[0] + ' が、もっとも多く出てくる値です。' };
  }
  function freqMeanQ() {
    var w = pick([2, 4, 10]), k = 4, fr = pick([[2, 3, 4, 1], [1, 4, 3, 2], [3, 3, 2, 2], [1, 2, 5, 2]]), mids = range(k, function (i) { return i * w + w / 2; }), tot = D.sum(fr), s = D.sum(fr.map(function (v, i) { return v * mids[i]; })), m = s / tot;
    var c = { s: { unit: '点' }, edges: range(k + 1, function (i) { return i * w; }), fr: fr, mids: mids, n: tot };
    var mi = fr.indexOf(Math.max.apply(null, fr));
    return pick([
      { big: '', q: 'この度数分布表から、階級値を使って平均値を求めよ。', fig: freqHTML(c), ans: f(m), wrong: D.near(m, [D.mean(mids), m + w, m - w / 2]), say: '（階級値 × 度数）の合計 ' + s + ' を度数の合計 ' + tot + ' でわって ' + f(m) + ' です。' },
      { big: '', q: 'この度数分布表の最頻値を求めよ。', fig: freqHTML(c), ans: f(mids[mi]), wrong: D.near(mids[mi], [fr[mi], c.edges[mi], c.edges[mi + 1]]), say: '度数分布表では、度数のもっとも大きい階級の階級値を最頻値とします。' }
    ]);
  }
  function outlierQ() {
    var base = range(5, function () { return rint(20, 28); }), big = rint(38, 45), all = shuffle(base.concat([big])), m1 = D.mean(all), m2 = D.mean(base), md1 = D.median(all), md2 = D.median(base);
    var t = pick([0, 1]);
    if (t) return { big: '', q: 'データ ' + D.list(all) + ' の外れ値はどれか。', ans: f(big), wrong: shuffle(base).slice(0, 3).map(f).filter(function (v, i, a) { return a.indexOf(v) === i; }).concat(['ない', '平均値']).slice(0, 3), say: big + ' だけが、ほかの値から極端に離れています。' };
    return { big: '', q: 'データ ' + D.list(all) + ' から外れ値 ' + big + ' を除くと、どうなるか。', ans: '平均値は大きく下がるが、中央値はあまり変わらない', wrong: ['平均値も中央値もほとんど変わらない', '中央値は大きく下がるが、平均値はあまり変わらない', '平均値も中央値も大きく上がる'], say: '平均値 ' + f(Math.round(m1 * 10) / 10) + ' → ' + f(Math.round(m2 * 10) / 10) + '、中央値 ' + f(md1) + ' → ' + f(md2) + '。平均値は外れ値の影響を受けやすい値です。' };
  }

  // ---- 四分位数と箱ひげ図 ----
  var T3 = [['範囲', '最大値から最小値をひいた値'], ['四分位数', 'データを小さい順に並べて 4 等分したときの区切りの値'], ['第 2 四分位数', '中央値のこと'], ['第 1 四分位数', '前半のデータの中央値'], ['第 3 四分位数', '後半のデータの中央値'], ['四分位範囲', '第 3 四分位数から第 1 四分位数をひいた値'], ['箱ひげ図', '四分位数を使って、データの散らばりぐあいを見やすく表した図'], ['レンジ', '範囲の別の呼び方']];
  function genBox() {
    for (;;) {
      var n = pick([7, 8, 9, 10, 11]), d = nums(n, 1, 19), q = D.quartiles(d), s = D.sorted(d);
      if (q[0] < q[1] && q[1] < q[2] && s[0] < q[0] && q[2] < s[n - 1]) return { d: d, s: s, q: q, five: [s[0], q[0], q[1], q[2], s[n - 1]] };
    }
  }
  var fiveName = ['最小値', '第 1 四分位数', '第 2 四分位数', '第 3 四分位数', '最大値'];
  function quartQ(showSorted) {
    var b = genBox(), k = rint(0, 2), v = b.q[k], hv = D.halves(b.d);
    return { big: '', q: (showSorted ? '小さい順に並べたデータ ' + D.list(b.s) : 'データ ' + D.list(b.d)) + ' の' + fiveName[k + 1] + 'を求めよ。', ans: f(v), wrong: D.near(v, b.q.concat([D.mean(b.d), v + 1, v - 1])),
      say: '前半 ' + D.list(hv[0]) + '、後半 ' + D.list(hv[1]) + '。第 1 四分位数 ' + f(b.q[0]) + '、第 2 四分位数 ' + f(b.q[1]) + '、第 3 四分位数 ' + f(b.q[2]) + ' です。',
      p: hint([[D.list(b.s), '小さい順に並べ、中央値を境に 2 つに分けます。'], ['前半 ' + D.list(hv[0]) + '　後半 ' + D.list(hv[1]), '前半の中央値が第 1 四分位数、後半の中央値が第 3 四分位数です。']]) };
  }
  function rangeQ() {
    var b = genBox(), r = b.s[b.s.length - 1] - b.s[0], iqr = b.q[2] - b.q[0];
    return pick([{ big: '', q: 'データ ' + D.list(b.s) + ' の範囲を求めよ。', ans: f(r), wrong: D.near(r, [iqr, b.s[b.s.length - 1], r + 1]), say: '最大値 ' + b.s[b.s.length - 1] + ' − 最小値 ' + b.s[0] + ' = ' + r + ' です。' },
      { big: '', q: 'データ ' + D.list(b.s) + ' の四分位範囲を求めよ。', ans: f(iqr), wrong: D.near(iqr, [r, b.q[2], b.q[1], iqr / 2]), say: '第 3 四分位数 ' + f(b.q[2]) + ' − 第 1 四分位数 ' + f(b.q[0]) + ' = ' + f(iqr) + ' です。' }]);
  }
  function boxWrongs(five) {
    var a = five.slice(); a[2] = five[1] + (five[3] - five[2]);
    var b = five.slice(); b[1] = five[1] + 2; b[3] = Math.min(five[4], five[3] + 2);
    var c = five.slice(); c[0] = five[0] + 1; c[4] = five[4] - 2; c[1] = Math.max(c[0], five[1] - 1);
    return [a, b, c].filter(function (x) { return x[1] <= x[2] && x[2] <= x[3] && x[3] <= x[4]; });
  }
  function boxPick(fromData) {
    var b = genBox(), W = boxWrongs(b.five), lo = 0, hi = 20, st = 2, drawB = function (x) { return D.boxPlot(x, lo, hi, st); };
    if (W.length < 3 || new Set(W.map(String)).size < 3 || W.some(function (x) { return String(x) === String(b.five); })) return boxPick(fromData);
    return { big: '', q: fromData ? 'データ ' + D.list(b.d) + ' の箱ひげ図はどれか。' : '最小値 ' + f(b.five[0]) + '、第 1 四分位数 ' + f(b.five[1]) + '、第 2 四分位数 ' + f(b.five[2]) + '、第 3 四分位数 ' + f(b.five[3]) + '、最大値 ' + f(b.five[4]) + ' の箱ひげ図はどれか。',
      ans: drawB(b.five), wrong: W.map(drawB), figOpts: true, stack: true, say: 'ひげの両端が最小値と最大値、箱の両端が第 1・第 3 四分位数、箱の中の線が第 2 四分位数です。5 つの値：' + b.five.map(f).join('、'), ansFig: drawB(b.five) };
  }
  function boxRead() {
    var b = genBox(), k = rint(0, 6), name = fiveName.concat(['範囲', '四分位範囲'])[k], v = k < 5 ? b.five[k] : k === 5 ? b.five[4] - b.five[0] : b.five[3] - b.five[1];
    return { big: '', q: 'この箱ひげ図の' + name + 'はいくつか。', fig: D.boxPlot(b.five, 0, 20, 2), ans: f(v), wrong: D.near(v, b.five.concat([b.five[3] - b.five[1], b.five[4] - b.five[0]])), say: '5 つの値は ' + b.five.map(f).join('、') + ' です。' };
  }
  function outlierBox() {
    var d = [3, 5, 6, 6, 7, 8, 9, 9].map(function (v) { return v + rint(0, 1); }), big = rint(20, 24), all = D.sorted(d.concat([big])), q = D.quartiles(all), iqr = q[2] - q[0], up = q[2] + 1.5 * iqr;
    return { big: '', q: 'データ ' + D.list(all) + ' で、第 3 四分位数から四分位範囲の 1.5 倍以上離れた値を外れ値とするとき、外れ値はどれか。', ans: f(big), wrong: [f(all[7]), f(all[0]), 'ない'], say: '四分位範囲 ' + f(iqr) + '。' + f(q[2]) + ' + 1.5 × ' + f(iqr) + ' = ' + f(up) + ' より大きい ' + big + ' が外れ値です。' };
  }

  // ---- 分散と標準偏差 ----
  var T4 = [['偏差', 'データの個々の値から平均値をひいた値'], ['分散', '偏差の 2 乗の平均値'], ['標準偏差', '分散の正の平方根']];
  var T4X = [['四分位範囲', '第 3 四分位数から第 1 四分位数をひいた値'], ['範囲', '最大値から最小値をひいた値'], ['平均値', 'データの値の合計をデータの総数でわった値']];
  var DEV = [[-2, -1, 0, 1, 2], [-3, -1, 0, 1, 3], [-4, -2, 0, 2, 4], [-3, -2, 0, 2, 3], [-1, -1, 0, 1, 1], [-4, -1, 0, 1, 4], [-5, -3, 0, 3, 5], [-3, -3, 0, 3, 3]];
  function root(n) { for (var k = Math.floor(Math.sqrt(n)); k >= 1; k--) if (n % (k * k) === 0) { var r = n / (k * k); return r === 1 ? String(k) : (k > 1 ? k : '') + '√' + r; } return '√' + n; }
  function genVar() { var dv = shuffle(pick(DEV)), m = rint(5, 15), x = dv.map(function (d) { return m + d; }), ss = D.sum(dv.map(function (d) { return d * d; })); return { x: x, dv: dv, m: m, ss: ss, v: ss / 5 }; }
  function varTask() {
    var g = genVar(), t = D.sum(g.x), sum = cell(t, uniqSort([t, t + 5, t - 5, t + 1])), mean = cell(g.m, uniqSort([g.m, g.m + 1, g.m - 1, t])), cs = uniqSort(g.dv.concat(g.dv.map(function (d) { return -d; })));
    sum.hint = '値の合計を計算しよう。'; mean.hint = '平均値 = 合計 ÷ 5';
    var dc = g.dv.map(function (d) { var c = cell(f(d), cs.map(function (v) { return f(v); })); c.hint = '偏差 = 値 − 平均値'; return c; });
    var sqs = uniqSort(g.dv.map(function (d) { return d * d; }).concat([1, 4])), qc = g.dv.map(function (d) { var c = cell(d * d, sqs); c.hint = '偏差を 2 乗します。負の数も 2 乗すると正の数です。'; return c; });
    var ssc = cell(g.ss, uniqSort([g.ss, g.ss + 2, g.ss - 2, g.ss + 5])), vc = cell(f(g.v), uniqSort([g.v, g.v + 1, Math.max(1, g.v - 1), g.ss]).map(function (v) { return f(v); }));
    ssc.hint = '(偏差)² の合計を計算しよう。'; vc.hint = '分散 = (偏差)² の平均値';
    var s = root(g.v), sc = cell(s, shuffle(Sek.uniq([s, root(g.v + 1), root(g.v * 2), f(g.v)])).slice(0, 4)); sc.hint = '標準偏差 = 分散の正の平方根';
    var grid = [[hd('')].concat(range(5, function (i) { return hd('①②③④⑤'[i]); }), [hd('平均'), hd('計')]), [hd('値')].concat(g.x, [mean, sum]), [hd('偏差')].concat(dc, ['0', '0']), [hd('(偏差)²')].concat(qc, [vc, ssc])];
    return { q: '5 個のデータの表を完成させて、分散と標準偏差を求めよう。', mount: D.tableTask({ grids: [grid], order: [sum, mean].concat(dc, qc, [ssc, vc, sc]), below: [['標準偏差 s', sc]], say: '分散 s² = ' + f(g.v) + '、標準偏差 s = ' + s } ) };
  }
  function varQ() {
    var g = genVar(), s = root(g.v), k = rint(0, 2);
    return [
      { big: '', q: 'データ ' + D.list(g.x) + '（平均値 ' + g.m + '）の偏差の合計はいくつか。', ans: '0', wrong: ['1', String(g.ss), String(g.m === 5 ? 10 : 5)].concat([String(D.sum(g.x))]).filter(function (v, i, x) { return x.indexOf(v) === i; }).slice(0, 3), say: '偏差の合計は必ず 0 になります。だから偏差の平均では散らばりを表せません。' },
      { big: '', q: 'データ ' + D.list(g.x) + ' の分散を求めよ。', ans: f(g.v), wrong: D.near(g.v, [g.ss, g.v * 2, g.v + 1]), say: '平均値 ' + g.m + '。偏差の 2 乗の合計 ' + g.ss + ' を 5 でわって ' + f(g.v) + ' です。', p: hint([['平均値 = ' + g.m, 'まず平均値を求めます。'], ['偏差：' + g.dv.map(f).join('、'), '値 − 平均値 です。'], ['(偏差)² の合計 = ' + g.ss, '偏差を 2 乗して合計します。']]) },
      { big: '', q: '分散が ' + f(g.v) + ' のとき、標準偏差はいくつか。', ans: s, wrong: Sek.uniq([f(g.v), root(g.v * 2), root(g.v + 1), f(g.v * g.v)]).filter(function (v) { return v !== s; }).slice(0, 3), say: '標準偏差は分散の正の平方根です。' }
    ][k];
  }
  function varCompare() {
    var a = [-1, -1, 0, 1, 1], b = pick([[-4, -2, 0, 2, 4], [-3, -3, 0, 3, 3]]), m = rint(6, 10), A = a.map(function (d) { return d + m; }), B = b.map(function (d) { return d + m; }), first = rint(0, 1);
    return { big: '', q: first ? 'A：' + D.list(A) + '　B：' + D.list(B) + '　平均値はどちらも ' + m + '。散らばりが大きいのはどちらか。' : 'A：' + D.list(B) + '　B：' + D.list(A) + '　平均値はどちらも ' + m + '。標準偏差が小さいのはどちらか。', ans: 'B', wrong: ['A', '同じ', '比べられない'], say: '平均値から離れた値が多いほど、分散・標準偏差は大きくなります。' };
  }

  // ---- 相関 ----
  var T5 = [['散布図', '2 つの数量の組を点として平面上に表した図'], ['正の相関関係', '一方が増加するとき他方も増加する傾向があること'], ['負の相関関係', '一方が増加するとき他方は減少する傾向があること'], ['共分散', 'x の偏差と y の偏差の積の平均値'], ['相関係数', '共分散を x の標準偏差と y の標準偏差の積でわった値']];
  function scatterJudge() {
    var r = pick([.9, .8, -.9, -.8, 0, .05]), p = D.cloudNear(r, 18), name = r > .5 ? '正の相関関係がある' : r < -.5 ? '負の相関関係がある' : '相関関係がない';
    return { big: '', q: 'この散布図の 2 つのデータの関係はどれか。', fig: D.scatter(p), ans: name, wrong: ['正の相関関係がある', '負の相関関係がある', '相関関係がない', '関係を読みとれない'].filter(function (v) { return v !== name; }), say: r > .5 ? '点が右上がりに並んでいます。' : r < -.5 ? '点が右下がりに並んでいます。' : '点全体に、右上がりや右下がりの傾向がありません。' };
  }
  function rPick() {
    var all = [.9, .5, 0, -.5, -.9], r = pick(all), p = D.cloudNear(r, 20), a = f(r);
    return { big: '', q: 'この散布図の相関係数にもっとも近いものはどれか。', fig: D.scatter(p), ans: a, wrong: shuffle(all.filter(function (v) { return v !== r; })).slice(0, 3).map(function (v) { return f(v); }), say: '右上がりで直線に近いほど 1 に、右下がりで直線に近いほど −1 に近づきます。' };
  }
  function genCorr() {
    var dx = [-2, -1, 0, 1, 2], dy, S, k = pick([1, 2]);
    do { dy = shuffle(dx); S = D.sum(dx.map(function (v, i) { return v * dy[i]; })); } while (Math.abs(S) < 3 || Math.abs(S) > 9);
    var ord = shuffle([0, 1, 2, 3, 4]); dx = ord.map(function (i) { return dx[i]; }); dy = ord.map(function (i) { return dy[i]; });
    var mx = rint(4, 9), my = rint(5, 12), ky = dy.map(function (v) { return v * k; });
    return { x: dx.map(function (v) { return v + mx; }), y: ky.map(function (v) { return v + my; }), dx: dx, dy: ky, mx: mx, my: my, S: S, k: k, sxy: S * k, vx: 2, vy: 2 * k * k, cov: S * k / 5, r: S / 10 };
  }
  function corrTask() {
    var g = genCorr(), sx = D.sum(g.x), sy = D.sum(g.y), near = function (a, b) { return uniqSort([a, a + 5, a - 5, b]); };
    var xS = cell(sx, near(sx, sx + 1)), xM = cell(g.mx, uniqSort([g.mx, g.mx + 1, g.mx - 1, sx])), yS = cell(sy, near(sy, sy + 1)), yM = cell(g.my, uniqSort([g.my, g.my + 1, g.my - 1, sy]));
    var dxs = uniqSort(g.dx).map(function (v) { return f(v); }), dys = uniqSort(g.dy).map(function (v) { return f(v); });
    var cdx = g.dx.map(function (v) { var c = cell(f(v), dxs); c.hint = 'x の偏差 = x − x の平均値'; return c; }), cdy = g.dy.map(function (v) { var c = cell(f(v), dys); c.hint = 'y の偏差 = y − y の平均値'; return c; });
    var q1 = uniqSort(g.dx.map(function (v) { return v * v; })), q2 = uniqSort(g.dy.map(function (v) { return v * v; }));
    var cqx = g.dx.map(function (v) { var c = cell(v * v, q1); c.hint = 'x の偏差を 2 乗します。'; return c; }), cqy = g.dy.map(function (v) { var c = cell(v * v, q2); c.hint = 'y の偏差を 2 乗します。'; return c; });
    var prods = g.dx.map(function (v, i) { return v * g.dy[i]; }), ps = uniqSort(prods.concat(prods.map(function (v) { return -v; }))).slice(0, 7);
    var cp = prods.map(function (v) { var c = cell(f(v), uniqSort(prods.concat([-v])).map(function (w) { return f(w); })); c.hint = 'x の偏差 × y の偏差'; return c; });
    var tq1 = 10, tq2 = 10 * g.k * g.k, tp = g.sxy;
    var cT1 = cell(tq1, uniqSort([tq1, tq1 + 2, tq1 - 2])), cT2 = cell(tq2, uniqSort([tq2, tq2 + 2, tq2 - 2])), cTp = cell(f(tp), uniqSort([tp, tp + 1, tp - 1, -tp]).map(function (v) { return f(v); }));
    var cV1 = cell(f(g.vx), uniqSort([g.vx, g.vx + 1, 1]).map(function (v) { return f(v); })), cV2 = cell(f(g.vy), uniqSort([g.vy, g.vy + 1, g.vy - 1]).map(function (v) { return f(v); })), cC = cell(f(g.cov), uniqSort([g.cov, g.cov + 1, g.cov - 1, tp]).map(function (v) { return f(v); }));
    [cT1, cT2, cTp].forEach(function (c) { c.hint = '合計を計算しよう。'; });
    cV1.hint = 'x の分散 = (x の偏差)² の平均値'; cV2.hint = 'y の分散 = (y の偏差)² の平均値'; cC.hint = '共分散 = 偏差の積の平均値';
    var s1 = root(g.vx), s2 = root(g.vy), rx = cell(s1, shuffle(Sek.uniq([s1, root(g.vx + 1), f(g.vx)]))), ry = cell(s2, shuffle(Sek.uniq([s2, root(g.vy + 1), f(g.vy)]))), rr = cell(f(g.r), uniqSort([g.r, -g.r, g.r / 2, g.r > 0 ? 1 : -1]).map(function (v) { return f(v); }));
    rx.hint = '標準偏差 = 分散の正の平方根'; ry.hint = '標準偏差 = 分散の正の平方根'; rr.hint = '相関係数 r = 共分散 ÷ (x の標準偏差 × y の標準偏差)';
    var tall = [[hd('x'), hd('y'), hd('x の偏差'), hd('(x の偏差)²'), hd('y の偏差'), hd('(y の偏差)²'), hd('偏差の積')]];
    for (var i = 0; i < 5; i++) tall.push([g.x[i], g.y[i], cdx[i], cqx[i], cdy[i], cqy[i], cp[i]]);
    tall.push([xM, yM, '0', cV1, '0', cV2, cC]); tall.push([xS, yS, '0', cT1, '0', cT2, cTp]);
    tall[0] = [hd('')].concat(tall[0]); for (i = 1; i <= 5; i++) tall[i] = [hd('①②③④⑤'[i - 1])].concat(tall[i]);
    tall[6] = [hd('平均')].concat(tall[6]); tall[7] = [hd('計')].concat(tall[7]);
    var wide = [[hd('')].concat(range(5, function (k) { return hd('①②③④⑤'[k]); }), [hd('平均'), hd('計')]),
      [hd('x')].concat(g.x, [xM, xS]), [hd('y')].concat(g.y, [yM, yS]), [hd('x の偏差')].concat(cdx, ['0', '0']), [hd('y の偏差')].concat(cdy, ['0', '0']),
      [hd('(x の偏差)²')].concat(cqx, [cV1, cT1]), [hd('(y の偏差)²')].concat(cqy, [cV2, cT2]), [hd('偏差の積')].concat(cp, [cC, cTp])];
    return { q: '2 つのデータ x、y の表を完成させて、相関係数 r を求めよう。', mount: D.tableTask({ grids: [tall, wide], order: [xS, xM, yS, yM].concat(cdx, cdy, cqx, cqy, cp, [cT1, cV1, cT2, cV2, cTp, cC, rx, ry, rr]), below: [['x の標準偏差', rx], ['y の標準偏差', ry], ['相関係数 r', rr]], say: 'r = ' + f(g.cov) + ' ÷ (' + s1 + ' × ' + s2 + ') = ' + f(g.r) }) };
  }
  function rCalcQ() {
    var c = pick([[12, 4, 5], [6, 2, 5], [15, 5, 6], [-12, 5, 3], [8, 2, 5], [-9, 3, 5], [18, 4, 6], [-6, 4, 2]]), r = c[0] / (c[1] * c[2]);
    return { big: '', q: 'x の標準偏差が ' + c[1] + '、y の標準偏差が ' + c[2] + '、共分散が ' + f(c[0]) + ' のとき、相関係数を求めよ。', ans: f(r), wrong: D.near(r, [-r, c[0] / c[1], c[0] / c[2], r + .1, r - .1]), say: 'r = ' + f(c[0]) + ' ÷ (' + c[1] + ' × ' + c[2] + ') = ' + f(r) + ' です。' };
  }
  function rRangeQ() {
    return pick([
      { big: '', q: '相関係数 r の値の範囲はどれか。', ans: '−1 ≦ r ≦ 1', wrong: ['0 ≦ r ≦ 1', '−1 < r < 1', '0 < r'], say: '相関係数は −1 以上 1 以下の値です。' },
      { big: '', q: '正の相関関係が強いほど、相関係数 r はどの値に近づくか。', ans: '1', wrong: ['0', '−1', '2'], say: '正の相関が強いほど 1 に近づきます。' },
      { big: '', q: '負の相関関係が強いほど、相関係数 r はどの値に近づくか。', ans: '−1', wrong: ['0', '1', '−2'], say: '負の相関が強いほど −1 に近づきます。' },
      { big: '', q: '勉強時間と読書時間に正の相関関係があるとき、正しいものはどれか。', ans: '勉強時間が長い人は、読書時間も長い傾向がある', wrong: ['勉強時間をふやせば、必ず読書時間もふえる', '勉強時間が読書時間の原因である', '勉強時間と読書時間はいつも等しい'], say: '相関関係があっても、一方がもう一方の原因とは限りません。' }
    ]);
  }

  // ---- 章のまとめ ----
  var FILL = [
    ['データの値の合計をデータの個数でわった値を（　）という。', '平均値'], ['データの値を小さい順に並べたとき、中央にある値を（　）という。', '中央値'], ['データのなかでもっとも多く出てくる値を（　）という。', '最頻値'],
    ['中央値を境にデータを 2 つに分けたとき、前半のデータの中央値を（　）という。', '第 1 四分位数'], ['中央値を境にデータを 2 つに分けたとき、後半のデータの中央値を（　）という。', '第 3 四分位数'],
    ['（データの個々の値）−（平均値）を（　）という。', '偏差'], ['偏差の 2 乗の平均値を（　）という。', '分散'], ['分散の正の平方根を（　）という。', '標準偏差'], ['x の偏差と y の偏差の積の平均値を（　）という。', '共分散']];
  function fillQ() {
    return shuffle(FILL).map(function (t) { var w = shuffle(FILL.filter(function (x) { return x !== t; })).slice(0, 3).map(function (x) { return x[1]; }); return { big: '', q: t[0], ans: t[1], wrong: w, say: t[0].replace('（　）', t[1]) }; });
  }
  var STEP5 = ['問題', '計画', 'データ', '分析', '結論'];
  function judgeQ() {
    return shuffle([
      { big: '', q: 'データの活用の手順で、「どのようなデータを、どのように集めるか」を考える段階はどれか。', ans: '計画', wrong: ['問題', '分析', '結論'], say: '問題 → 計画 → データ → 分析 → 結論 の順に進めます。' },
      { big: '', q: 'データの活用の手順で、「グラフや表に表し、特徴や傾向をつかむ」段階はどれか。', ans: '分析', wrong: ['計画', 'データ', '結論'], say: '問題 → 計画 → データ → 分析 → 結論 の順に進めます。' },
      { big: '', q: '20 人のうち 16 人が新メニュー A を選んだ。コインを 20 回投げて表が 16 回以上出る割合は約 0.6 % である。5 % を基準にすると、どう判断できるか。', ans: 'A が選ばれやすいと考えてよい', wrong: ['偶然と考えるのがふつうである', 'A が必ず選ばれる', 'どちらともいえない'], say: '0.6 % は 5 % 以下なので、ほとんど起こらないことが起きたと考え、「偶然である」という仮説は正しくないと判断します。' },
      { big: '', q: '20 人のうち 12 人が新メニュー A を選んだ。コインを 20 回投げて表が 12 回以上出る割合は約 25 % である。5 % を基準にすると、どう判断できるか。', ans: 'A が選ばれやすいとはいえない', wrong: ['A が選ばれやすいと考えてよい', 'A は選ばれにくい', '仮説はまちがっている'], say: '25 % は 5 % より大きいので、偶然ではないと判断する根拠にはなりません。' }
    ]);
  }
  function mixedTask() {
    var b = genBox(), n = b.s.length, m = D.sum(b.d) / n;
    var t = [{ q: 'データを小さい順に並べ、中央値を答えよう。', mount: D.sortTask(b.d, D.thenPick('中央値はどれか。', f(b.q[1]), D.near(b.q[1], [b.q[0], b.q[2], m]), medianSay(b.d))) }];
    return t;
  }
  function allQ() {
    return [meanQ(), medianQ(true), modeQ(), quartQ(true), rangeQ(), boxRead(), varQ(), rPick(), scatterJudge(), rCalcQ()];
  }

  var n = function (k, fn) { return function () { return range(k, fn); }; };
  var P = {
    seiri: function () {
      show('データの整理：順番に進めよう。', [
        { name: '言葉の意味', sub: '階級・度数・階級値…（10問）', icon: ic('度数'), go: function () { quizMode(function () { return D.termQuiz(T1, 10); }, { name: '言葉の意味' }); } },
        { name: '表を読む', sub: '階級・階級値・度数はどれ？', icon: ic('階級'), go: function () { quizMode(tableWords, { name: '表を読む' }); } },
        { name: 'ドットプロット', sub: '数直線に点を打つ（3問）', icon: ic('・:⋮'), go: function () { taskMode(n(3, function () { var d = dotData(); return { q: 'データを順に、ドットプロットに表そう。', mount: D.dotTask(d, 0, 8) }; }), 'ドットプロット'); } },
        { name: 'ドットプロットを選ぶ', sub: 'データに合う図は？（5問）', icon: ic('⋮:・'), go: function () { quizMode(n(5, dotChoice), { name: 'ドットプロットを選ぶ' }); } },
        { name: '度数分布表', sub: '度数を数えて表をうめる（3問）', icon: ic('正'), go: function () { taskMode(n(3, function (i) { return freqTask(i > 0); }), '度数分布表'); } },
        { name: 'ヒストグラムをかく', sub: '度数の高さを押す（3問）', icon: ic('▂▅▇▃'), go: function () { taskMode(n(3, function () { var c = genClass(); return { q: c.s.name + 'の度数分布表から、ヒストグラムをかこう。', mount: function (b, x) { var w = document.createElement('div'); w.innerHTML = freqHTML(c); b.appendChild(w); var d = document.createElement('div'); b.appendChild(d); D.histTask(c.edges, c.fr, c.s.unit)(d, x); } }; }), 'ヒストグラムをかく'); } },
        { name: 'ヒストグラムを選ぶ', sub: '表に合うグラフは？（5問）', icon: ic('▃▇▅▂'), go: function () { quizMode(n(5, histChoice), { name: 'ヒストグラムを選ぶ' }); } },
        { name: 'ヒストグラムを読む', sub: '人数や割合を読みとる（6問）', icon: ic('%'), go: function () { quizMode(n(6, histRead), { name: 'ヒストグラムを読む' }); } },
        { name: '相対度数', sub: '相対度数と累積度数の表（3問）', icon: ic('0.35'), go: function () { taskMode(n(3, relTask), '相対度数'); } }
      ]);
    },
    daihyou: function () {
      show('代表値：まず言葉、次に並べかえ、最後は計算。', [
        { name: '言葉の意味', sub: '平均値・中央値・最頻値（7問）', icon: ic('代表値'), go: function () { quizMode(function () { return D.termQuiz(T2, 7); }, { name: '言葉の意味' }); } },
        { name: '小さい順に並べる', sub: '順に押して並べる（5問）', icon: ic('1 2 3'), go: function () { taskMode(n(5, function () { var d = nums(rint(7, 10), 1, 30); return { q: 'データを小さい順に押そう。', mount: D.sortTask(d) }; }), '小さい順に並べる'); } },
        { name: '並べて中央値', sub: '並べてから中央値（5問）', icon: ic('中央'), go: function () { taskMode(n(5, function () { var d = nums(pick([7, 8, 9, 10]), 1, 20), m = D.median(d), s = D.sorted(d), h = Math.floor(s.length / 2); return { q: 'データを小さい順に並べて、中央値を求めよう。', mount: D.sortTask(d, D.thenPick('中央値はどれか。', f(m), D.near(m, [s[h - 1], s[h], D.mean(d)]), medianSay(d))) }; }), '並べて中央値'); } },
        { name: '中央値', sub: '並んだデータから（8問）', icon: ic('メジアン'), go: function () { quizMode(n(8, function () { return medianQ(true); }), { name: '中央値' }); } },
        { name: '平均値', sub: 'データから計算（8問）', icon: ic('x̄'), go: function () { quizMode(n(8, meanQ), { name: '平均値' }); } },
        { name: '最頻値', sub: 'いちばん多い値（6問）', icon: ic('モード'), go: function () { quizMode(n(6, modeQ), { name: '最頻値' }); } },
        { name: '度数分布表から', sub: '階級値で平均値・最頻値（6問）', icon: ic('表'), go: function () { quizMode(n(6, freqMeanQ), { name: '度数分布表から' }); } },
        { name: '外れ値', sub: '外れ値と代表値の関係（5問）', icon: ic('●　　・'), go: function () { quizMode(n(5, outlierQ), { name: '外れ値' }); } }
      ]);
    },
    hako: function () {
      show('四分位数と箱ひげ図：まず値、次に図。', [
        { name: '言葉の意味', sub: '範囲・四分位数…（8問）', icon: ic('範囲'), go: function () { quizMode(function () { return D.termQuiz(T3, 8); }, { name: '言葉の意味' }); } },
        { name: '四分位数を求める', sub: '並んだデータから（8問）', icon: ic('Q₁ Q₂ Q₃'), go: function () { quizMode(n(8, function () { return quartQ(true); }), { name: '四分位数を求める' }); } },
        { name: '範囲・四分位範囲', sub: '最大 − 最小、Q₃ − Q₁（6問）', icon: ic('Q₃ − Q₁'), go: function () { quizMode(n(6, rangeQ), { name: '範囲・四分位範囲' }); } },
        { name: '箱ひげ図を選ぶ', sub: '5 つの値に合う図（6問）', icon: ic('├─▭─┤'), go: function () { quizMode(n(6, function () { return boxPick(false); }), { name: '箱ひげ図を選ぶ' }); } },
        { name: 'データから箱ひげ図', sub: '自分で値を求めて選ぶ（5問）', icon: ic('├▭──┤'), go: function () { quizMode(n(5, function () { return boxPick(true); }), { name: 'データから箱ひげ図' }); } },
        { name: '箱ひげ図を読む', sub: '図から値を答える（8問）', icon: ic('読む'), go: function () { quizMode(n(8, boxRead), { name: '箱ひげ図を読む' }); } },
        { name: '外れ値を見つける', sub: '四分位範囲の 1.5 倍（4問）', icon: ic('1.5 倍'), go: function () { quizMode(n(4, outlierBox), { name: '外れ値を見つける' }); } }
      ]);
    },
    bunsan: function () {
      show('分散と標準偏差：言葉 → 表 → 計算。', [
        { name: '言葉の意味', sub: '偏差・分散・標準偏差（6問）', icon: ic('偏差'), go: function () { quizMode(function () { return D.termQuiz(T4, 3, T4X).concat(D.termQuiz(T4, 3, T4X)); }, { name: '言葉の意味' }); } },
        { name: '表をうめる', sub: '5 個のデータで計算（3問）', icon: ic('s²'), go: function () { taskMode(n(3, varTask), '表をうめる'); } },
        { name: '計算', sub: '偏差・分散・標準偏差（8問）', icon: ic('√s²'), go: function () { quizMode(n(8, varQ), { name: '計算' }); } },
        { name: '散らばりを比べる', sub: '2 つのデータを比べる（4問）', icon: ic('A・B'), go: function () { quizMode(n(4, varCompare), { name: '散らばりを比べる' }); } }
      ]);
    },
    soukan: function () {
      show('散布図と相関係数：図 → 値 → 表で計算。', [
        { name: '言葉の意味', sub: '散布図・共分散…（5問）', icon: ic('相関'), go: function () { quizMode(function () { return D.termQuiz(T5, 5); }, { name: '言葉の意味' }); } },
        { name: '散布図を読む', sub: '正・負・なしを選ぶ（6問）', icon: ic('⋰'), go: function () { quizMode(n(6, scatterJudge), { name: '散布図を読む' }); } },
        { name: '相関係数を選ぶ', sub: '図に合う値はどれ？（6問）', icon: ic('r = 0.9'), go: function () { quizMode(n(6, rPick), { name: '相関係数を選ぶ' }); } },
        { name: '相関係数の性質', sub: '範囲と読みとり方（4問）', icon: ic('−1 ≦ r ≦ 1'), go: function () { quizMode(n(4, rRangeQ), { name: '相関係数の性質' }); } },
        { name: '相関係数の計算', sub: '共分散と標準偏差から（6問）', icon: ic('r ='), go: function () { quizMode(n(6, rCalcQ), { name: '相関係数の計算' }); } },
        { name: '表をうめる', sub: '共分散と r を求める（2問）', icon: ic('表'), go: function () { taskMode(n(2, corrTask), '表をうめる'); } }
      ]);
    },
    matome: function () {
      show('データの分析の総まとめ。', [
        { name: '言葉のまとめ', sub: '（　）に入る言葉（9問）', icon: ic('（　）'), go: function () { quizMode(fillQ, { name: '言葉のまとめ' }); } },
        { name: '総合問題', sub: '代表値から相関まで（10問）', icon: ic('総合'), go: function () { quizMode(allQ, { name: '総合問題' }); } },
        { name: 'データの活用', sub: '手順と、データにもとづく判断', icon: ic('問題→結論'), go: function () { quizMode(judgeQ, { name: 'データの活用' }); } },
        { name: 'タイムアタック', sub: '4択で10問、最後に確認', icon: '10', go: function () { quizMode(allQ, { name: 'タイムアタック', timed: true }); } }
      ]);
    }
  };
  global.DBP = { start: function (k) { P[k](); } };
})(window);
