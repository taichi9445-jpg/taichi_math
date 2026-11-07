/* ===========================================================================
   data-pages.js — 数学Ⅰ データの分析 32〜37 の問題。DBP.start('seiri') などで始める
   データはすべて、その場で作るか、この教材のために作った架空のもの。
   データは小さい順に並べて出す（平均値・分散・相関のように、並べなくてよい問題はそのまま）。
   データは問題文の下に横1列で出す（入らないときは小さくする）。
   ========================================================================= */
(function (global) {
  'use strict';
  var D = global.DB, md = D.md, f = D.f, cell = D.cell, hd = D.hd, rint = Sek.rint, shuffle = Sek.shuffle, pick = Sek.pick;
  var app = function () { return document.getElementById('app'); }, menuEl = function () { return document.getElementById('menu'); };
  var range = function (n, fn) { return Array.from({ length: n }, function (_, i) { return fn(i); }); };
  var uniqSort = function (a) { return Array.from(new Set(a)).sort(function (x, y) { return x - y; }); };
  var uniqS = function (a) { return Array.from(new Set(a)); };
  var cur = null;
  function quizMode(make, o) { menuEl().innerHTML = ''; var go = function () { Sek.quiz(app(), make(), Object.assign({ home: cur, again: go }, o)); }; go(); }
  function taskMode(make, name) { menuEl().innerHTML = ''; var go = function () { D.run(app(), make(), { name: name, home: cur, again: go }); }; go(); }
  function fillMode(make) { menuEl().innerHTML = ''; Sek.fill(app(), make(), { home: cur }); }
  // メニュー：名前と問題数だけ（どんな問題かがすぐ分かる名前にする）
  var wbr = function (s) { return s.length > 7 ? s.replace(/(を|に|の|から|・|て)(?=[^）]{2})/g, '$1<wbr>') : s; };
  function show(lead, cards) { cur = function () { app().innerHTML = ''; Sek.menu(menuEl(), cards.map(function (c) { return { name: wbr(c[0]), sub: c[1], icon: '', go: c[2] }; }), lead); }; cur(); }
  var hint = function (rows) { return { rows: rows.map(function (r) { return { t: r[0], h: r[1] }; }) }; };
  var line = D.line, sorted = D.sorted, F1 = function (v) { return f(v); };
  // 問題文の中の単位（m は斜体にしない）
  var U = function (c) { return c.s.unit === 'm' ? 'ｍ' : c.s.unit; };
  var nOf = function (a) { return a.length + ' 個'; };

  // ---- 度数分布 ----
  var SCENES = [{ name: '先月の読書時間', unit: '時間', w: 4, k: 6 }, { name: '1 週間の運動時間', unit: '時間', w: 2, k: 6 }, { name: '小テストの得点', unit: '点', w: 10, k: 6, lo: 40 }, { name: '通学時間', unit: '分', w: 10, k: 5 }, { name: 'ハンドボール投げの記録', unit: 'm', w: 5, k: 6, lo: 10 }];
  var SHAPES = [[2, 4, 6, 5, 2, 1], [1, 3, 5, 6, 3, 2], [3, 5, 6, 3, 2, 1], [1, 2, 4, 6, 5, 2], [2, 3, 7, 5, 2, 1], [1, 4, 5, 6, 3, 1]];
  function genClass() {
    var s = pick(SCENES), lo = s.lo || 0, fr = pick(SHAPES).slice(0, s.k);
    while (D.sum(fr) < 20) fr[D.sum(fr) % fr.length]++;
    var edges = range(s.k + 1, function (i) { return lo + i * s.w; }), data = [];
    fr.forEach(function (c, i) { for (var k = 0; k < c; k++) data.push(rint(edges[i], edges[i + 1] - 1)); });
    return { s: s, edges: edges, fr: fr, data: sorted(data), n: D.sum(fr), mids: fr.map(function (_, i) { return (edges[i] + edges[i + 1]) / 2; }) };
  }
  var clsName = function (c, i) { return i ? c.edges[i] + ' ～ ' + c.edges[i + 1] : c.edges[0] + ' 以上 ' + c.edges[1] + ' 未満'; };
  // hl：色をつける列。見出しは付箋でかくす（見出しに答えが書いてあるため）
  function freqHTML(c, hl) {
    var head = ['階級（' + c.s.unit + '）', '階級値（' + c.s.unit + '）', '度数（人）'];
    return '<table class="db-t"><tr>' + head.map(function (h, k) { return k === hl ? '<th class="hl db-tag"><span>？</span></th>' : '<th>' + h + '</th>'; }).join('') + '</tr>' +
      c.fr.map(function (v, i) { return '<tr><td' + (hl === 0 ? ' class="hl"' : '') + '>' + clsName(c, i) + '</td><td' + (hl === 1 ? ' class="hl"' : '') + '>' + c.mids[i] + '</td><td' + (hl === 2 ? ' class="hl"' : '') + '>' + v + '</td></tr>'; }).join('') +
      '<tr><td>計</td><td></td><td>' + c.n + '</td></tr></table>';
  }
  var T1 = [['ドットプロット', '数直線の上にデータを点で表した図'], ['階級', 'データを整理するために使う区間'], ['階級の幅', 'データを整理するために使う区間の大きさ'], ['度数', '各階級に入っているデータの値の個数'], ['階級値', '階級の真ん中の値'], ['度数分布表', 'データをいくつかの階級に分けて整理した表'], ['累積度数', '最初の階級からその階級までの度数を合計したもの'], ['ヒストグラム', '階級の幅を横、度数を縦とする長方形をすきまなく並べたグラフ'], ['相対度数', '各階級の度数を度数の合計でわった値'], ['累積相対度数', '最初の階級からその階級までの相対度数を合計したもの']];
  function tableWords() {
    var out = [], names = ['階級', '階級値', '度数'], says = ['データを整理するために使う区間が階級です。', '階級の真ん中の値が階級値です。', '各階級に入っているデータの個数が度数です。'];
    shuffle([0, 1, 2, 0, 1, 2]).forEach(function (hl) {
      out.push({ big: '', q: '付箋でかくした見出しには、何と書いてあるか。', fig: freqHTML(genClass(), hl), ans: names[hl], wrong: names.filter(function (n) { return n !== names[hl]; }).concat(['相対度数']), say: says[hl] });
    });
    var c2 = genClass();
    out.push({ big: '', q: 'この度数分布表の階級の幅はいくつか。', fig: freqHTML(c2), ans: c2.s.w + U(c2), wrong: [c2.s.w * 2 + U(c2), c2.s.w / 2 + U(c2), c2.s.w * 3 + U(c2)], say: '階級の区間の大きさが階級の幅です。' });
    return out;
  }
  function dotData() { var n = rint(10, 14), pk = rint(2, 5); return sorted(range(n, function () { var v = pk + rint(-3, 3); return Math.max(0, Math.min(8, v)); })); }
  function dotChoice() {
    var d = dotData(), wrong = [], seen = {}; seen[String(d)] = 1;
    for (var t = 0; t < 40 && wrong.length < 3; t++) {
      var w = d.slice(); [0, 1].forEach(function () { var i = rint(0, w.length - 1); w[i] = Math.max(0, Math.min(8, w[i] + (rint(0, 1) ? 1 : -1))); });
      w = sorted(w); if (!seen[String(w)]) { seen[String(w)] = 1; wrong.push(D.dotPlot(w, 0, 8)); }
    }
    return { big: '', q: '次の ' + nOf(d) + 'のデータのドットプロットはどれか。', sub: line(d), ans: D.dotPlot(d, 0, 8), wrong: wrong, figOpts: true, say: 'データの値 1 つを 1 つの点で表します。同じ値は上に重ねます。', ansFig: D.dotPlot(d, 0, 8) };
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
    return { q: [c.s.name + 'のデータ（単位 ' + U(c) + '、小さい順）を、', '度数分布表にまとめよう。'], sub: D.grid(c.data, 10), mount: D.tableTask({ grids: [grid], order: order, say: '度数の合計はデータの個数 ' + c.n + ' になります。' }) };
  }
  function relTask() {
    var c = genClass(), acc = 0, grid = [[hd('階級（' + c.s.unit + '）'), hd('度数'), hd('相対度数'), hd('累積度数'), hd('累積相対度数')]], rc = [], ac = [], arc = [];
    var two = function (x) { return x.toFixed(2); };
    c.fr.forEach(function (v, i) {
      acc += v;
      var rel = v / c.n, crel = acc / c.n;
      var r = cell(two(rel), uniqSort([rel, rel + .05, Math.max(0, rel - .05), v / 10]).map(two)); r.hint = '相対度数 = 度数 ÷ ' + c.n;
      var q = cell(acc, uniqSort([acc, acc + 1, Math.max(0, acc - 1), v])); q.hint = '累積度数は、最初の階級からこの階級までの度数の合計';
      var a = cell(two(crel), uniqSort([crel, Math.min(1, crel + .05), Math.max(0, crel - .05), rel]).map(two)); a.hint = '累積相対度数 = 累積度数 ÷ ' + c.n + '（相対度数をたしていってもよい）';
      rc.push(r); ac.push(q); arc.push(a); grid.push([clsName(c, i), v, r, q, a]);
    });
    grid.push(['計', c.n, '1.00', null, null]);
    return { q: '相対度数、累積度数、累積相対度数をうめよう。', mount: D.tableTask({ grids: [grid], order: rc.concat(ac, arc), say: '相対度数の合計は 1 です。累積度数の最後は度数の合計、累積相対度数の最後は 1 になります。' }) };
  }
  function histChoice() {
    var c = genClass(), wrong = [], seen = {}; seen[String(c.fr)] = 1;
    for (var t = 0; t < 40 && wrong.length < 3; t++) {
      var w = c.fr.slice(), i = rint(0, w.length - 2), x = w[i]; w[i] = w[i + 1]; w[i + 1] = x;
      if (t % 2) { var j = rint(0, w.length - 1); w[j] = Math.max(1, w[j] + (rint(0, 1) ? 1 : -1)); }
      if (!seen[String(w)]) { seen[String(w)] = 1; wrong.push(D.histogram(c.edges, w, c.s.unit)); }
    }
    return { big: '', q: 'この度数分布表のヒストグラムはどれか。', fig: freqHTML(c), ans: D.histogram(c.edges, c.fr, c.s.unit), wrong: wrong, figOpts: true, say: '各階級の度数が、長方形の高さになります。', ansFig: D.histogram(c.edges, c.fr, c.s.unit) };
  }
  function histRead() {
    var c = genClass(), k = rint(2, c.fr.length - 2), below = D.sum(c.fr.slice(0, k)), maxF = Math.max.apply(null, c.fr), top = c.fr.indexOf(maxF), pct = below / c.n * 100;
    var lim = c.edges[k] + U(c) + '未満', fig = D.histogram(c.edges, c.fr, c.s.unit), head = c.s.name + 'のヒストグラム', un = U(c);
    var list = [
      { big: '', q: [head, lim + 'の人は何人か。'], fig: fig, ans: below + '人', wrong: D.near(below, [below + c.fr[k], c.fr[k - 1]]).map(function (v) { return v + '人'; }), say: '最初の階級から ' + lim + 'までの度数を合計して ' + below + ' 人です。' },
      { big: '', q: [head, lim + 'の人の割合は、全体の何 % か。'], fig: fig, ans: f(pct) + '%', wrong: D.near(pct, [pct + 5, pct - 5, pct + 10, c.fr[k] / c.n * 100]).map(function (v) { return v + '%'; }), say: lim + 'の人は ' + below + ' 人。' + below + ' ÷ ' + c.n + ' = ' + f(below / c.n) + ' なので ' + f(pct) + ' % です。' }
    ];
    if (c.fr.filter(function (v) { return v === maxF; }).length === 1) list.push({ big: '', q: [head, '度数がもっとも大きい階級の階級値はいくつか。'], fig: fig, ans: c.mids[top] + un, wrong: uniqS([c.edges[top] + un, c.edges[top + 1] + un, maxF + un, c.mids[(top + 1) % c.mids.length] + un]).filter(function (v) { return v !== c.mids[top] + un; }).slice(0, 3), say: 'もっとも高い長方形の階級の、真ん中の値です。' });
    return pick(list);
  }

  // ---- 代表値 ----
  var T2 = [['代表値', 'データ全体の特徴を表す数値'], ['平均値', 'データの値の合計をデータの総数でわった値'], ['中央値', 'データの値を小さい順に並べたとき、中央にある値'], ['最頻値', 'データのなかでもっとも多く出てくる値'], ['外れ値', 'ほかの値から極端にかけ離れたデータの値'], ['メジアン', '中央値の別の呼び方'], ['モード', '最頻値の別の呼び方']];
  function nums(n, lo, hi) { return range(n, function () { return rint(lo, hi); }); }
  function medianSay(d) {
    var s = sorted(d), n = s.length;
    if (n % 2) return n + ' 個なので、小さい方から ' + ((n + 1) / 2) + ' 番目の ' + f(D.median(d)) + ' が中央値です。';
    return n + ' 個なので、小さい方から ' + (n / 2) + ' 番目 ' + f(s[n / 2 - 1]) + ' と ' + (n / 2 + 1) + ' 番目 ' + f(s[n / 2]) + ' の平均 ' + f(D.median(d)) + ' が中央値です。';
  }
  function medianQ() {
    var n = pick([7, 8, 9, 10]), s = sorted(nums(n, 1, 20)), m = D.median(s), h = Math.floor(n / 2);
    return { big: '', q: '次の ' + n + ' 個のデータは、小さい順に並んでいる。中央値を求めよ。', sub: line(s), ans: f(m), wrong: D.near(m, [s[h - 1], s[h], s[h + 1] === undefined ? m + 1 : s[h + 1], Math.round(D.mean(s))]), say: medianSay(s),
      p: hint([[n + ' 個のデータ', n % 2 ? '個数が奇数のときは、真ん中の 1 つです。' : '個数が偶数のときは、真ん中の 2 つの平均です。'], ['中央値 = ' + f(m), '小さい方から数えよう。']]) };
  }
  function meanQ() {
    var n = pick([4, 5, 6, 8]), m = rint(4, 12), d = nums(n - 1, Math.max(0, m - 5), m + 5); d.push(m * n - D.sum(d));
    if (d[n - 1] < 0) return meanQ();
    d = shuffle(d);
    return { big: '', q: '次の ' + n + ' 個のデータの平均値を求めよ。', sub: line(d), ans: f(m), wrong: D.near(m, [Math.round(D.median(d)), D.sum(d), m + 1, m - 1]), say: '合計 ' + D.sum(d) + ' を個数 ' + n + ' でわって ' + f(m) + ' です。', p: hint([['(' + d.map(F1).join(' + ') + ') ÷ ' + n, '合計を個数でわります。'], ['= ' + D.sum(d) + ' ÷ ' + n + ' = ' + f(m), 'わり算をします。']]) };
  }
  function modeQ() {
    var base = rint(2, 9), d = nums(7, 1, 12).concat([base, base, base]), md0 = D.modes(d);
    if (md0.length !== 1) return modeQ();
    d = sorted(d);
    var cnt = d.filter(function (v) { return v === md0[0]; }).length;
    return { big: '', q: '次の ' + d.length + ' 個のデータは、小さい順に並んでいる。最頻値を求めよ。', sub: line(d), ans: f(md0[0]), wrong: D.near(md0[0], [Math.round(D.median(d)), Math.round(D.mean(d)), Math.max.apply(null, d)]), say: md0[0] + ' が ' + cnt + ' 回出てきて、もっとも多いので最頻値です。' };
  }
  var FRS = [[2, 3, 4, 1], [1, 4, 3, 2], [1, 2, 5, 2], [3, 4, 2, 1], [2, 5, 3, 2], [1, 3, 4, 2]];
  function freqMeanQ() {
    var w = pick([2, 4, 10]), k = 4, fr = pick(FRS), mids = range(k, function (i) { return i * w + w / 2; }), tot = D.sum(fr), s = D.sum(fr.map(function (v, i) { return v * mids[i]; })), m = s / tot;
    var c = { s: { unit: '点' }, edges: range(k + 1, function (i) { return i * w; }), fr: fr, mids: mids, n: tot };
    var mi = fr.indexOf(Math.max.apply(null, fr));
    return pick([
      { big: '', q: 'この度数分布表から、階級値を使って平均値を求めよ。', fig: freqHTML(c), ans: f(m), wrong: D.near(m, [D.mean(mids), m + w, m - w / 2]), say: '（階級値 × 度数）の合計 ' + s + ' を、度数の合計 ' + tot + ' でわって ' + f(m) + ' です。',
        p: hint([[fr.map(function (v, i) { return mids[i] + ' × ' + v; }).join(' + ') + ' = ' + s, '（階級値）×（度数）を合計します。'], [s + ' ÷ ' + tot + ' = ' + f(m), '度数の合計でわります。']]) },
      { big: '', q: 'この度数分布表の最頻値を求めよ。', fig: freqHTML(c), ans: f(mids[mi]), wrong: D.near(mids[mi], [fr[mi], c.edges[mi], c.edges[mi + 1]]), say: '度数がもっとも大きい階級は ' + clsName(c, mi).replace(' 以上 ', '～').replace(' 未満', '') + '。その階級値 ' + mids[mi] + ' を最頻値とします。' }
    ]);
  }
  // 外れ値：第 1・第 3 四分位数から、四分位範囲の 1.5 倍以上はなれた値
  function fences(s) { var q = D.quartiles(s), iqr = q[2] - q[0]; return { q: q, iqr: iqr, lo: q[0] - 1.5 * iqr, hi: q[2] + 1.5 * iqr }; }
  var isOut = function (v, F) { return v <= F.lo || v >= F.hi; };
  function outlierQ() {
    for (;;) {
      var base = nums(pick([6, 8]), 20, 28), big = rint(38, 46), all = sorted(base.concat([big])), F = fences(all);
      if (!isOut(big, F) || base.some(function (v) { return isOut(v, F); })) continue;
      var m1 = D.mean(all), m2 = D.mean(base), r1 = Math.round(m1 * 10) / 10, r2 = Math.round(m2 * 10) / 10;
      if (r1 * 10 % 1 || r2 * 10 % 1) continue;
      return { big: '', q: '次のデータで、外れ値 ' + big + ' を除くと、平均値と中央値はどうなるか。', sub: line(all), ans: '平均値は大きく下がるが、中央値はあまり変わらない', wrong: ['平均値も中央値もほとんど変わらない', '中央値は大きく下がるが、平均値はあまり変わらない', '平均値も中央値も大きく上がる'],
        say: ['平均値 ' + f(r1) + ' → ' + f(r2) + '（およそ）、中央値 ' + f(D.median(all)) + ' → ' + f(D.median(base)) + '。', '平均値は外れ値の影響を大きく受けますが、中央値はあまり受けません。', '（' + big + ' が外れ値であることは、四分位範囲を使って確かめられます：' + f(F.q[2]) + ' + 1.5 × ' + f(F.iqr) + ' = ' + f(F.hi) + ' 以上）'] };
    }
  }

  // ---- 四分位数と箱ひげ図 ----
  var T3 = [['範囲', '最大値から最小値をひいた値'], ['四分位数', 'データを小さい順に並べて 4 等分したときの区切りの値'], ['第 2 四分位数', '中央値のこと'], ['第 1 四分位数', '前半のデータの中央値'], ['第 3 四分位数', '後半のデータの中央値'], ['四分位範囲', '第 3 四分位数から第 1 四分位数をひいた値'], ['箱ひげ図', '四分位数を使って、データの散らばりぐあいを見やすく表した図'], ['レンジ', '範囲の別の呼び方']];
  function genBox() {
    for (;;) {
      var n = pick([7, 8, 9, 10, 11]), s = sorted(nums(n, 1, 19)), q = D.quartiles(s);
      if (q[0] < q[1] && q[1] < q[2] && s[0] < q[0] && q[2] < s[n - 1]) return { d: s, s: s, q: q, five: [s[0], q[0], q[1], q[2], s[n - 1]] };
    }
  }
  var fiveName = ['最小値', '第 1 四分位数', '第 2 四分位数（中央値）', '第 3 四分位数', '最大値'];
  var halfSay = function (s) { var hv = D.halves(s); return '前半 ' + hv[0].map(F1).join(' ') + '　後半 ' + hv[1].map(F1).join(' '); };
  function quartQ() {
    var b = genBox(), k = rint(0, 2), v = b.q[k], n = b.s.length;
    return { big: '', q: '次の ' + n + ' 個のデータは、小さい順に並んでいる。' + fiveName[k + 1].replace('（中央値）', '') + 'を求めよ。', sub: line(b.s), ans: f(v), wrong: D.near(v, b.q.concat([v + 1, v - 1])),
      say: [halfSay(b.s), '第 1 四分位数 ' + f(b.q[0]) + '、第 2 四分位数 ' + f(b.q[1]) + '、第 3 四分位数 ' + f(b.q[2]) + ' です。'],
      p: hint([['中央値 = ' + f(b.q[1]), '真ん中の値（' + n + ' 個なので' + (n % 2 ? '真ん中の 1 つ' : '真ん中の 2 つの平均') + '）。'], [halfSay(b.s), n % 2 ? '中央値を除いて、前半と後半に分けます。' : '真ん中で前半と後半に分けます。'], ['第 1 四分位数 = ' + f(b.q[0]) + '、第 3 四分位数 = ' + f(b.q[2]), '前半の中央値と、後半の中央値です。']]) };
  }
  function rangeQ() {
    var b = genBox(), n = b.s.length, r = b.s[n - 1] - b.s[0], iqr = b.q[2] - b.q[0], head = '次の ' + n + ' 個のデータは、小さい順に並んでいる。';
    return pick([{ big: '', q: head + '範囲を求めよ。', sub: line(b.s), ans: f(r), wrong: D.near(r, [iqr, b.s[n - 1], r + 1]), say: '範囲 = 最大値 − 最小値 = ' + b.s[n - 1] + ' − ' + b.s[0] + ' = ' + r + ' です。' },
      { big: '', q: head + '四分位範囲を求めよ。', sub: line(b.s), ans: f(iqr), wrong: D.near(iqr, [r, b.q[2], b.q[1], iqr / 2]), say: [halfSay(b.s), '四分位範囲 = 第 3 四分位数 − 第 1 四分位数 = ' + f(b.q[2]) + ' − ' + f(b.q[0]) + ' = ' + f(iqr) + ' です。'],
        p: hint([[halfSay(b.s), '中央値で前半と後半に分けます。'], ['第 1 四分位数 = ' + f(b.q[0]) + '、第 3 四分位数 = ' + f(b.q[2]), '前半・後半それぞれの中央値です。']]) }]);
  }
  function boxWrongs(five) {
    var a = five.slice(); a[2] = five[1] + (five[3] - five[2]);
    var b = five.slice(); b[1] = five[1] + 2; b[3] = Math.min(five[4], five[3] + 2);
    var c = five.slice(); c[0] = five[0] + 1; c[4] = five[4] - 2; c[1] = Math.max(c[0], five[1] - 1);
    return [a, b, c].filter(function (x) { return x[1] <= x[2] && x[2] <= x[3] && x[3] <= x[4]; });
  }
  var drawB = function (x) { return D.boxPlot(x, 0, 20, 2); };
  var fiveTable = function (five) { return '<table class="db-t db-five"><tr>' + ['最小値', '第 1 四分位数', '第 2 四分位数', '第 3 四分位数', '最大値'].map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr><tr>' + five.map(function (v) { return '<td>' + f(v) + '</td>'; }).join('') + '</tr></table>'; };
  function goodBox() { for (;;) { var b = genBox(), W = boxWrongs(b.five); if (W.length === 3 && new Set(W.map(String).concat([String(b.five)])).size === 4) { b.W = W; return b; } } }
  function boxPick() {
    var b = goodBox();
    return { big: '', q: '次の 5 つの値を表す箱ひげ図はどれか。', fig: fiveTable(b.five), ans: drawB(b.five), wrong: b.W.map(drawB), figOpts: true, stack: true, say: 'ひげの両端が最小値と最大値、箱の両端が第 1・第 3 四分位数、箱の中の線が第 2 四分位数です。', ansFig: drawB(b.five) };
  }
  // データから箱ひげ図：5 つの値を順に求めてから、図を選ぶ
  function boxFromData() {
    var b = goodBox(), n = b.s.length, hs = halfSay(b.s);
    var steps = b.five.map(function (v, k) {
      var name = fiveName[k];
      return { q: name + 'はいくつか。', ans: f(v), wrong: D.near(v, b.five.filter(function (x) { return x !== v; }).concat([v + 1, v - 1])), memo: name + ' = ' + f(v),
        hint: k === 0 || k === 4 ? 'いちばん' + (k ? '大きい' : '小さい') + '値です。' : k === 2 ? n + ' 個なので、' + (n % 2 ? '真ん中の 1 つです。' : '真ん中の 2 つの平均です。') : hs + '。' + (k === 1 ? '前半' : '後半') + 'の中央値です。' };
    });
    steps.push({ q: '求めた 5 つの値を表す箱ひげ図はどれか。', ans: drawB(b.five), wrong: b.W.map(drawB), hint: 'ひげの両端が最小値と最大値、箱の両端が第 1・第 3 四分位数です。', memo: '箱ひげ図', memoHTML: drawB(b.five) });
    return { q: ['次の ' + n + ' 個のデータ（小さい順）の箱ひげ図をつくろう。', 'まず 5 つの値を求めよう。'], sub: line(b.s), mount: D.chain(steps, { say: '5 つの値（' + b.five.map(F1).join('、') + '）から、箱ひげ図がかけました。' }) };
  }
  function boxRead() {
    var b = genBox(), k = rint(0, 6), name = fiveName.concat(['範囲', '四分位範囲'])[k], v = k < 5 ? b.five[k] : k === 5 ? b.five[4] - b.five[0] : b.five[3] - b.five[1];
    return { big: '', q: 'この箱ひげ図の' + name + 'はいくつか。', fig: D.boxPlot(b.five, 0, 20, 2), ans: f(v), wrong: D.near(v, b.five.concat([b.five[3] - b.five[1], b.five[4] - b.five[0]])), say: '5 つの値は、小さい方から ' + b.five.map(F1).join('、') + ' です。' + (k === 5 ? '範囲 = 最大値 − 最小値。' : k === 6 ? '四分位範囲 = 第 3 四分位数 − 第 1 四分位数。' : '') };
  }
  // 外れ値を見つける（定義どおりに計算する）。外れ値が大きい方・小さい方・ないのどれか
  function outlierFind() {
    var kind = pick(['hi', 'lo', 'none']);
    for (;;) {
      var n = pick([9, 10, 11]), core = nums(n - 1, 10, 22), extra = kind === 'hi' ? rint(32, 40) : kind === 'lo' ? rint(0, 3) : rint(8, 24), s = sorted(core.concat([extra])), F = fences(s);
      var outs = s.filter(function (v) { return isOut(v, F); });
      if (kind === 'none' ? outs.length : outs.length !== 1 || outs[0] !== extra) continue;
      if (F.iqr < 3 || F.iqr % 1) continue;
      var ans = kind === 'none' ? '外れ値はない' : f(extra), cands = uniqS([s[0], s[n - 1], s[1], s[n - 2], s[2], s[n - 3]].concat(s).map(F1)).filter(function (v) { return v !== ans; });
      var steps = [
        { q: '第 1 四分位数はいくつか。', ans: f(F.q[0]), wrong: D.near(F.q[0], [F.q[1], F.q[0] + 1, F.q[0] - 1]), memo: '第 1 四分位数 = ' + f(F.q[0]), hint: halfSay(s) + '。前半の中央値です。' },
        { q: '第 3 四分位数はいくつか。', ans: f(F.q[2]), wrong: D.near(F.q[2], [F.q[1], F.q[2] + 1, F.q[2] - 1]), memo: '第 3 四分位数 = ' + f(F.q[2]), hint: halfSay(s) + '。後半の中央値です。' },
        { q: '四分位範囲はいくつか。', ans: f(F.iqr), wrong: D.near(F.iqr, [F.iqr * 1.5, F.q[2] + F.q[0], s[n - 1] - s[0]]), memo: '四分位範囲 = ' + f(F.q[2]) + ' − ' + f(F.q[0]) + ' = ' + f(F.iqr), hint: '第 3 四分位数 − 第 1 四分位数' },
        { q: '（第 1 四分位数）− 1.5 ×（四分位範囲）はいくつか。', ans: f(F.lo), wrong: D.near(F.lo, [F.q[0] - F.iqr, F.q[0] - 1.5, F.lo + 1.5]), memo: f(F.q[0]) + ' − 1.5 × ' + f(F.iqr) + ' = ' + f(F.lo) + '（以下は外れ値）', hint: f(F.q[0]) + ' − 1.5 × ' + f(F.iqr) },
        { q: '（第 3 四分位数）+ 1.5 ×（四分位範囲）はいくつか。', ans: f(F.hi), wrong: D.near(F.hi, [F.q[2] + F.iqr, F.q[2] + 1.5, F.hi - 1.5]), memo: f(F.q[2]) + ' + 1.5 × ' + f(F.iqr) + ' = ' + f(F.hi) + '（以上は外れ値）', hint: f(F.q[2]) + ' + 1.5 × ' + f(F.iqr) },
        { q: '外れ値はどれか。', ans: ans, wrong: (kind === 'none' ? cands : ['外れ値はない'].concat(cands)).slice(0, 3), hint: f(F.lo) + ' 以下か、' + f(F.hi) + ' 以上の値をさがそう。' }
      ];
      var say = kind === 'none' ? 'どの値も ' + f(F.lo) + ' より大きく ' + f(F.hi) + ' より小さいので、外れ値はありません。' : extra + ' は ' + (kind === 'hi' ? f(F.hi) + ' 以上' : f(F.lo) + ' 以下') + 'なので、外れ値です。';
      return { q: ['次の ' + n + ' 個のデータ（小さい順）に、外れ値はあるか。', '（第 1・第 3 四分位数から、四分位範囲の 1.5 倍以上はなれた値を外れ値とする）'], sub: line(s), mount: D.chain(steps, { say: say }) };
    }
  }

  // ---- 分散と標準偏差 ----
  var T4 = [['偏差', 'データの個々の値から平均値をひいた値'], ['分散', '偏差の 2 乗の平均値'], ['標準偏差', '分散の正の平方根']];
  var T4X = [['四分位範囲', '第 3 四分位数から第 1 四分位数をひいた値'], ['範囲', '最大値から最小値をひいた値'], ['平均値', 'データの値の合計をデータの総数でわった値']];
  var DEV = [[-2, -1, 0, 1, 2], [-3, -1, 0, 1, 3], [-4, -2, 0, 2, 4], [-3, -2, 0, 2, 3], [-1, -1, 0, 1, 1], [-4, -1, 0, 1, 4], [-5, -3, 0, 3, 5], [-3, -3, 0, 3, 3]];
  function genVar() { var dv = shuffle(pick(DEV)), m = rint(5, 15), x = dv.map(function (d) { return m + d; }), ss = D.sum(dv.map(function (d) { return d * d; })); return { x: x, dv: dv, m: m, ss: ss, v: ss / 5, sd: D.sdForms(ss, 5) }; }
  // 分散・標準偏差の答え（小数のときは分数の形も）
  function sdSay(g) {
    var o = ['分散 s² = ' + g.ss + ' ÷ 5 = ' + g.sd.v + '、標準偏差 s = ' + g.sd.s];
    if (g.sd.vf) o.push('分数で表すと、s² = ' + g.sd.vf + '、s = ' + g.sd.s + ' = ' + g.sd.sf);
    return o;
  }
  function varTask() {
    var g = genVar(), t = D.sum(g.x), sum = cell(t, uniqSort([t, t + 5, t - 5, t + 1])), mean = cell(g.m, uniqSort([g.m, g.m + 1, g.m - 1, t]));
    sum.hint = '値の合計を計算しよう。'; mean.hint = '平均値 = 合計 ÷ 5';
    var cs = uniqSort(g.dv.concat(g.dv.map(function (d) { return -d; })));
    var dc = g.dv.map(function (d) { var c = cell(f(d), cs.map(function (v) { return f(v); })); c.hint = '偏差 = 値 − 平均値'; return c; });
    var sqs = uniqSort(g.dv.map(function (d) { return d * d; }).concat([1, 4])), qc = g.dv.map(function (d) { var c = cell(d * d, sqs); c.hint = '偏差を 2 乗します。負の数も 2 乗すると正の数です。'; return c; });
    var ssc = cell(g.ss, uniqSort([g.ss, g.ss + 2, g.ss - 2, g.ss + 5])), vc = cell(g.sd.v, uniqSort([g.v, g.v + 1, Math.max(1, g.v - 1), g.ss]).map(function (v) { return f(v); }));
    ssc.hint = '(偏差)² の合計を計算しよう。'; vc.hint = '分散 = (偏差)² の平均値 = 合計 ÷ 5';
    var s = g.sd.s, sc = cell(s, shuffle(uniqS([s, g.sd.v, '√' + f(g.v + 1), '√' + g.ss])).slice(0, 4)); sc.hint = '標準偏差 = 分散の正の平方根';
    var grid = [[hd('')].concat(range(5, function (i) { return hd('①②③④⑤'[i]); }), [hd('計'), hd('平均')]), [hd('値')].concat(g.x, [sum, mean]), [hd('偏差')].concat(dc, ['0', '0']), [hd('(偏差)²')].concat(qc, [ssc, vc])];
    return { q: '5 個のデータの表を完成させて、分散と標準偏差を求めよう。', mount: D.tableTask({ grids: [grid], order: [sum, mean].concat(dc, qc, [ssc, vc, sc]), below: [['標準偏差 s', sc]], say: sdSay(g) }) };
  }
  function varQ() {
    var g = genVar(), s = g.sd.s, k = rint(0, 2);
    return [
      { big: '', q: '次のデータの平均値は ' + g.m + ' である。偏差の合計はいくつか。', sub: line(g.x), ans: '0', wrong: uniqS(['1', String(g.ss), String(g.m === 5 ? 10 : 5), String(D.sum(g.x))]).slice(0, 3), say: '偏差の合計は必ず 0 になります。だから偏差の平均では散らばりを表せません。' },
      { big: '', q: '次の 5 個のデータの分散を求めよ。', sub: line(g.x), ans: g.sd.v, wrong: D.near(g.v, [g.ss, g.v * 2, g.v + 1]), say: ['平均値 ' + g.m + '。偏差は ' + g.dv.map(F1).join('、') + '。'].concat(sdSay(g).slice(0, 1), g.sd.vf ? ['分数で表すと s² = ' + g.sd.vf] : []), p: hint([['平均値 = ' + g.m, 'まず平均値を求めます。'], ['偏差：' + g.dv.map(F1).join('、'), '値 − 平均値 です。'], ['(偏差)² の合計 = ' + g.ss, '偏差を 2 乗して合計します。'], ['分散 = ' + g.ss + ' ÷ 5 = ' + g.sd.v, '(偏差)² の平均値です。']]) },
      { big: '', q: '分散が ' + g.sd.v + ' のとき、標準偏差はいくつか。', ans: s, wrong: uniqS([g.sd.v, '√' + f(g.v * 2), '√' + f(g.v + 1), f(g.v * g.v)]).filter(function (v) { return v !== s; }).slice(0, 3), say: ['標準偏差は分散の正の平方根です。s = ' + s].concat(g.sd.sf ? ['分数で表すと s = ' + g.sd.sf] : []) }
    ][k];
  }
  function varCompare() {
    var a = [-1, -1, 0, 1, 1], b = pick([[-4, -2, 0, 2, 4], [-3, -3, 0, 3, 3]]), m = rint(6, 10), bigA = rint(0, 1), askBig = rint(0, 1);
    var A = (bigA ? b : a).map(function (d) { return d + m; }), B = (bigA ? a : b).map(function (d) { return d + m; });
    var ans = (askBig ? bigA : !bigA) ? 'A' : 'B';
    var fig = '<table class="db-t"><tr><th>A</th>' + shuffle(A).map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr><tr><th>B</th>' + shuffle(B).map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr></table>';
    return { big: '', q: 'A、B の平均値はどちらも ' + m + ' である。' + (askBig ? '散らばりが大きいのはどちらか。' : '標準偏差が小さいのはどちらか。'), fig: fig, ans: ans, wrong: [ans === 'A' ? 'B' : 'A', '同じ', '比べられない'], say: '平均値 ' + m + ' から離れた値が多いほど、散らばり（分散・標準偏差）は大きくなります。' };
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
  var RFORM = '!r = {(x と y の共分散)|(x の標準偏差) × (y の標準偏差)}';
  // 相関係数の計算：公式に値を入れてから計算する（途中式）
  var RC = [[12, 4, 5], [6, 2, 5], [15, 5, 6], [-12, 5, 3], [8, 2, 5], [-9, 3, 5], [18, 4, 6], [-6, 4, 2], [14, 4, 5], [-4, 2, 5]];
  function rCalcP(c) {
    var cov = c[0], sx = c[1], sy = c[2], pr = sx * sy, r = cov / pr;
    return { q: 'x の標準偏差が ' + sx + '、y の標準偏差が ' + sy + '、x と y の共分散が ' + f(cov) + ' である。相関係数 r を求めよ。',
      rows: [RFORM, { t: 'r = {[' + f(cov) + ']|[' + sx + '] × [' + sy + ']}', h: '分子に共分散、分母に x と y の標準偏差を入れよう。' }, { t: '= {' + f(cov) + '|[' + pr + ']}', h: '分母のかけ算をしよう。', sk: 1 }, { t: '= [' + f(r) + ']', h: 'わり算をしよう。' }],
      cards: Sek.cleanCards([f(cov), String(sx), String(sy), String(pr), f(r), [f(-cov), '共分散の符号を確かめよう。'], [String(sx + sy), '分母はかけ算です。'], [f(cov / sx), '分母は 2 つの標準偏差の積です。'], [f(-r), '符号を確かめよう。']]),
      ans: 'r = ' + f(r) };
  }
  function rCalcQ() { var c = pick(RC), r = c[0] / (c[1] * c[2]); return { big: '', q: 'x の標準偏差が ' + c[1] + '、y の標準偏差が ' + c[2] + '、共分散が ' + f(c[0]) + ' のとき、相関係数を求めよ。', ans: f(r), wrong: D.near(r, [-r, c[0] / c[1], c[0] / c[2], r + .1, r - .1]), say: 'r = ' + f(c[0]) + ' ÷ (' + c[1] + ' × ' + c[2] + ') = ' + f(r) + ' です。' }; }
  function rRangeQ() {
    return pick([
      { big: '', q: '相関係数 r の値の範囲はどれか。', ans: '−1 ≦ r ≦ 1', wrong: ['0 ≦ r ≦ 1', '−1 < r < 1', '0 < r'], say: '相関係数は −1 以上 1 以下の値です。' },
      { big: '', q: '正の相関関係が強いほど、相関係数 r はどの値に近づくか。', ans: '1', wrong: ['0', '−1', '2'], say: '正の相関が強いほど 1 に近づきます。' },
      { big: '', q: '負の相関関係が強いほど、相関係数 r はどの値に近づくか。', ans: '−1', wrong: ['0', '1', '−2'], say: '負の相関が強いほど −1 に近づきます。' },
      { big: '', q: '勉強時間と読書時間に正の相関関係があるとき、正しいものはどれか。', ans: '勉強時間が長い人は、読書時間も長い傾向がある', wrong: ['勉強時間をふやせば、必ず読書時間もふえる', '勉強時間が読書時間の原因である', '勉強時間と読書時間はいつも等しい'], say: '相関関係があっても、一方がもう一方の原因とは限りません。' }
    ]);
  }
  function genCorr() {
    var dx = [-2, -1, 0, 1, 2], dy, S, k = pick([1, 2]);
    do { dy = shuffle(dx); S = D.sum(dx.map(function (v, i) { return v * dy[i]; })); } while (Math.abs(S) < 3 || Math.abs(S) > 9);
    var ord = shuffle([0, 1, 2, 3, 4]); dx = ord.map(function (i) { return dx[i]; }); dy = ord.map(function (i) { return dy[i]; });
    var mx = rint(4, 9), my = rint(5, 12), ky = dy.map(function (v) { return v * k; });
    return { x: dx.map(function (v) { return v + mx; }), y: ky.map(function (v) { return v + my; }), dx: dx, dy: ky, mx: mx, my: my, S: S, k: k, sxy: S * k, vx: 2, vy: 2 * k * k, cov: S * k / 5, r: S / 10 };
  }
  // 表をうめて相関係数：列ごとに上から（値 → 計 → 平均）。最後に標準偏差と共分散をメモして、公式に入れる
  function corrTask() {
    var g = genCorr(), sx = D.sum(g.x), sy = D.sum(g.y), near = function (a, b) { return uniqSort([a, a + 5, a - 5, b]); };
    var xS = cell(sx, near(sx, sx + 1)), xM = cell(g.mx, uniqSort([g.mx, g.mx + 1, g.mx - 1, sx])), yS = cell(sy, near(sy, sy + 1)), yM = cell(g.my, uniqSort([g.my, g.my + 1, g.my - 1, sy]));
    xS.hint = 'x の合計'; xM.hint = 'x の平均値 = 合計 ÷ 5'; yS.hint = 'y の合計'; yM.hint = 'y の平均値 = 合計 ÷ 5';
    var dxs = uniqSort(g.dx).map(function (v) { return f(v); }), dys = uniqSort(g.dy).map(function (v) { return f(v); });
    var cdx = g.dx.map(function (v) { var c = cell(f(v), dxs); c.hint = 'x の偏差 = x − x の平均値'; return c; }), cdy = g.dy.map(function (v) { var c = cell(f(v), dys); c.hint = 'y の偏差 = y − y の平均値'; return c; });
    var q1 = uniqSort(g.dx.map(function (v) { return v * v; })), q2 = uniqSort(g.dy.map(function (v) { return v * v; }));
    var cqx = g.dx.map(function (v) { var c = cell(v * v, q1); c.hint = 'x の偏差を 2 乗します。'; return c; }), cqy = g.dy.map(function (v) { var c = cell(v * v, q2); c.hint = 'y の偏差を 2 乗します。'; return c; });
    var prods = g.dx.map(function (v, i) { return v * g.dy[i]; });
    var cp = prods.map(function (v) { var c = cell(f(v), uniqSort(prods.concat([-v])).map(function (w) { return f(w); })); c.hint = 'x の偏差 × y の偏差'; return c; });
    var tq1 = 10, tq2 = 10 * g.k * g.k, tp = g.sxy;
    var cT1 = cell(tq1, uniqSort([tq1, tq1 + 2, tq1 - 2])), cT2 = cell(tq2, uniqSort([tq2, tq2 + 2, tq2 - 2])), cTp = cell(f(tp), uniqSort([tp, tp + 1, tp - 1, -tp]).map(function (v) { return f(v); }));
    var cV1 = cell(f(g.vx), uniqSort([g.vx, g.vx + 1, 1]).map(function (v) { return f(v); })), cV2 = cell(f(g.vy), uniqSort([g.vy, g.vy + 1, g.vy - 1]).map(function (v) { return f(v); })), cC = cell(f(g.cov), uniqSort([g.cov, g.cov + 1, g.cov - 1, tp]).map(function (v) { return f(v); }));
    [cT1, cT2, cTp].forEach(function (c) { c.hint = '合計を計算しよう。'; });
    cV1.hint = 'x の分散 = (x の偏差)² の平均値'; cV2.hint = 'y の分散 = (y の偏差)² の平均値'; cC.hint = '共分散 = 偏差の積の平均値';
    var s1 = D.rootS(g.vx), s2 = D.rootS(g.vy);
    var sdc = function (s, v, h) { var c = cell(s, shuffle(uniqS([s, D.rootS(v + 1), f(v), D.rootS(v * 2)])).slice(0, 4)); c.hint = h; return c; };
    var rx = sdc(s1, g.vx, 'x の標準偏差 = x の分散の正の平方根'), ry = sdc(s2, g.vy, 'y の標準偏差 = y の分散の正の平方根');
    var mC = cell(f(g.cov), uniqSort([g.cov, g.cov + 1, g.cov - 1, tp]).map(function (v) { return f(v); })); mC.hint = '共分散は、表の「偏差の積」の平均です。';
    var fC = cell(f(g.cov), mC.cards), fx = cell(s1, rx.cards), fy = cell(s2, ry.cards), prod = 2 * g.k, rr = cell(f(g.r), uniqSort([g.r, -g.r, g.r / 2, g.r > 0 ? 1 : -1]).map(function (v) { return f(v); }));
    fC.hint = '分子は共分散'; fx.hint = '分母は x の標準偏差 × y の標準偏差'; fy.hint = '分母は x の標準偏差 × y の標準偏差'; rr.hint = f(g.cov) + ' ÷ (' + s1 + ' × ' + s2 + ') = ' + f(g.cov) + ' ÷ ' + prod;
    var L = function (i) { return hd('①②③④⑤'[i]); };
    // 縦の表：列は x, y, x の偏差, (x の偏差)², y の偏差, (y の偏差)², 偏差の積。行は ①〜⑤, 計, 平均
    var tall = [[hd(''), hd('x'), hd('y'), hd('x の偏差'), hd('(x の偏差)²'), hd('y の偏差'), hd('(y の偏差)²'), hd('偏差の積')]];
    for (var i = 0; i < 5; i++) tall.push([L(i), g.x[i], g.y[i], cdx[i], cqx[i], cdy[i], cqy[i], cp[i]]);
    tall.push([hd('計'), xS, yS, '0', cT1, '0', cT2, cTp]); tall.push([hd('平均'), xM, yM, '0', cV1, '0', cV2, cC]);
    var wide = [[hd('')].concat(range(5, L), [hd('計'), hd('平均')]),
      [hd('x')].concat(g.x, [xS, xM]), [hd('y')].concat(g.y, [yS, yM]), [hd('x の偏差')].concat(cdx, ['0', '0']), [hd('(x の偏差)²')].concat(cqx, [cT1, cV1]),
      [hd('y の偏差')].concat(cdy, ['0', '0']), [hd('(y の偏差)²')].concat(cqy, [cT2, cV2]), [hd('偏差の積')].concat(cp, [cTp, cC])];
    var formula = function (box) { return '<span class="fs-m"><i>r</i> = </span><span class="fs-fr"><span>' + box(fC) + '</span><span>' + box(fx) + ' × ' + box(fy) + '</span></span><span class="fs-m"> = </span>' + box(rr); };
    return { q: '2 つのデータ x、y の表を完成させて、相関係数 r を求めよう。', mount: D.tableTask({ grids: [tall, wide], formula: formula,
      order: [xS, xM, yS, yM].concat(cdx, cqx, [cT1, cV1], cdy, cqy, [cT2, cV2], cp, [cTp, cC, rx, ry, mC, fC, fx, fy, rr]),
      below: [['x の標準偏差', rx], ['y の標準偏差', ry], ['共分散', mC]], formulaHead: md(RFORM.slice(1)),
      say: 'r = ' + f(g.cov) + ' ÷ (' + s1 + ' × ' + s2 + ') = ' + f(g.cov) + ' ÷ ' + prod + ' = ' + f(g.r) }) };
  }

  // ---- 章のまとめ ----
  var FILL = [
    ['データの値の合計をデータの個数でわった値を（　）という。', '平均値'], ['データの値を小さい順に並べたとき、中央にある値を（　）という。', '中央値'], ['データのなかでもっとも多く出てくる値を（　）という。', '最頻値'],
    ['中央値を境にデータを 2 つに分けたとき、前半のデータの中央値を（　）という。', '第 1 四分位数'], ['中央値を境にデータを 2 つに分けたとき、後半のデータの中央値を（　）という。', '第 3 四分位数'],
    ['（データの個々の値）−（平均値）を（　）という。', '偏差'], ['偏差の 2 乗の平均値を（　）という。', '分散'], ['分散の正の平方根を（　）という。', '標準偏差'], ['x の偏差と y の偏差の積の平均値を（　）という。', '共分散']];
  function fillQ() {
    return shuffle(FILL).map(function (t) { var w = shuffle(FILL.filter(function (x) { return x !== t; })).slice(0, 3).map(function (x) { return x[1]; }); return { big: '', q: t[0], ans: t[1], wrong: w, say: t[0].replace('（　）', t[1]) }; });
  }
  function judgeQ() {
    return shuffle([
      { big: '', q: 'データの活用の手順で、「どのようなデータを、どのように集めるか」を考える段階はどれか。', ans: '計画', wrong: ['問題', '分析', '結論'], say: '問題 → 計画 → データ → 分析 → 結論 の順に進めます。' },
      { big: '', q: 'データの活用の手順で、「グラフや表に表し、特徴や傾向をつかむ」段階はどれか。', ans: '分析', wrong: ['計画', 'データ', '結論'], say: '問題 → 計画 → データ → 分析 → 結論 の順に進めます。' },
      { big: '', q: '20 人のうち 16 人が新メニュー A を選んだ。コインを 20 回投げて、表が 16 回以上出る割合は約 0.6 % である。5 % を基準にすると、どう判断できるか。', ans: 'A が選ばれやすいと考えてよい', wrong: ['偶然と考えるのがふつうである', 'A が必ず選ばれる', 'どちらともいえない'], say: '0.6 % は 5 % 以下なので、ほとんど起こらないことが起きたと考え、「偶然である」という仮説は正しくないと判断します。' },
      { big: '', q: '20 人のうち 12 人が新メニュー A を選んだ。コインを 20 回投げて、表が 12 回以上出る割合は約 25 % である。5 % を基準にすると、どう判断できるか。', ans: 'A が選ばれやすいとはいえない', wrong: ['A が選ばれやすいと考えてよい', 'A は選ばれにくい', '仮説はまちがっている'], say: '25 % は 5 % より大きいので、偶然ではないと判断する根拠にはなりません。' }
    ]);
  }
  function allQ() {
    return [meanQ(), medianQ(), modeQ(), quartQ(), rangeQ(), boxRead(), varQ(), rPick(), scatterJudge(), rCalcQ()];
  }

  var n = function (k, fn) { return function () { return range(k, fn); }; };
  var P = {
    seiri: function () {
      show('やりたい問題を選ぼう。', [
        ['言葉の意味', '10問', function () { quizMode(function () { return D.termQuiz(T1, 10); }, { name: '言葉の意味' }); }],
        ['度数分布表の見方', '7問', function () { quizMode(tableWords, { name: '度数分布表の見方' }); }],
        ['ドットプロットに点を打つ', '3問', function () { taskMode(n(3, function () { var d = dotData(); return { q: '次のデータ（小さい順）を、ドットプロットに表そう。', mount: D.dotTask(d, 0, 8) }; }), 'ドットプロットに点を打つ'); }],
        ['ドットプロットを選ぶ', '5問', function () { quizMode(n(5, dotChoice), { name: 'ドットプロットを選ぶ' }); }],
        ['度数分布表をつくる', '3問', function () { taskMode(n(3, function (i) { return freqTask(i > 0); }), '度数分布表をつくる'); }],
        ['ヒストグラムをかく', '3問', function () { taskMode(n(3, function () { var c = genClass(); return { q: c.s.name + 'の度数分布表から、ヒストグラムをかこう。', mount: function (b, x) { var w = document.createElement('div'); w.innerHTML = freqHTML(c); b.appendChild(w); var d = document.createElement('div'); b.appendChild(d); D.histTask(c.edges, c.fr, c.s.unit)(d, x); } }; }), 'ヒストグラムをかく'); }],
        ['ヒストグラムを選ぶ', '5問', function () { quizMode(n(5, histChoice), { name: 'ヒストグラムを選ぶ' }); }],
        ['ヒストグラムを読みとる', '6問', function () { quizMode(n(6, histRead), { name: 'ヒストグラムを読みとる' }); }],
        ['相対度数・累積度数の表', '3問', function () { taskMode(n(3, relTask), '相対度数・累積度数の表'); }]
      ]);
    },
    daihyou: function () {
      show('やりたい問題を選ぼう。', [
        ['言葉の意味', '7問', function () { quizMode(function () { return D.termQuiz(T2, 7); }, { name: '言葉の意味' }); }],
        ['データを小さい順に並べる', '5問', function () { taskMode(n(5, function () { var d = nums(rint(7, 10), 1, 30); return { q: 'データを小さい順に押そう。', mount: D.sortTask(d) }; }), '小さい順に並べる'); }],
        ['並べてから中央値', '5問', function () { taskMode(n(5, function () { var d = nums(pick([7, 8, 9, 10]), 1, 20), m = D.median(d), s = sorted(d), h = Math.floor(s.length / 2); return { q: 'データを小さい順に並べて、中央値を求めよう。', mount: D.sortTask(d, D.thenPick('中央値はどれか。', f(m), D.near(m, [s[h - 1], s[h], Math.round(D.mean(d))]), medianSay(d))) }; }), '並べてから中央値'); }],
        ['中央値を求める', '8問', function () { quizMode(n(8, medianQ), { name: '中央値を求める' }); }],
        ['平均値を求める', '8問', function () { quizMode(n(8, meanQ), { name: '平均値を求める' }); }],
        ['最頻値を求める', '6問', function () { quizMode(n(6, modeQ), { name: '最頻値を求める' }); }],
        ['度数分布表から平均値・最頻値', '6問', function () { quizMode(n(6, freqMeanQ), { name: '度数分布表から' }); }],
        ['外れ値と平均値・中央値', '4問', function () { quizMode(n(4, outlierQ), { name: '外れ値と平均値・中央値' }); }]
      ]);
    },
    hako: function () {
      show('やりたい問題を選ぼう。', [
        ['言葉の意味', '8問', function () { quizMode(function () { return D.termQuiz(T3, 8); }, { name: '言葉の意味' }); }],
        ['四分位数を求める', '8問', function () { quizMode(n(8, quartQ), { name: '四分位数を求める' }); }],
        ['範囲・四分位範囲を求める', '6問', function () { quizMode(n(6, rangeQ), { name: '範囲・四分位範囲' }); }],
        ['5 つの値から箱ひげ図を選ぶ', '6問', function () { quizMode(n(6, boxPick), { name: '箱ひげ図を選ぶ' }); }],
        ['データから箱ひげ図をつくる', '4問', function () { taskMode(n(4, boxFromData), 'データから箱ひげ図'); }],
        ['箱ひげ図を読みとる', '8問', function () { quizMode(n(8, boxRead), { name: '箱ひげ図を読みとる' }); }],
        ['外れ値を見つける', '4問', function () { taskMode(n(4, outlierFind), '外れ値を見つける'); }]
      ]);
    },
    bunsan: function () {
      show('やりたい問題を選ぼう。', [
        ['言葉の意味', '6問', function () { quizMode(function () { return D.termQuiz(T4, 3, T4X).concat(D.termQuiz(T4, 3, T4X)); }, { name: '言葉の意味' }); }],
        ['表をうめて分散・標準偏差', '3問', function () { taskMode(n(3, varTask), '表をうめる'); }],
        ['偏差・分散・標準偏差の計算', '8問', function () { quizMode(n(8, varQ), { name: '計算' }); }],
        ['散らばりを比べる', '4問', function () { quizMode(n(4, varCompare), { name: '散らばりを比べる' }); }]
      ]);
    },
    soukan: function () {
      show('やりたい問題を選ぼう。', [
        ['言葉の意味', '5問', function () { quizMode(function () { return D.termQuiz(T5, 5); }, { name: '言葉の意味' }); }],
        ['散布図から相関を読む', '6問', function () { quizMode(n(6, scatterJudge), { name: '散布図から相関を読む' }); }],
        ['散布図から相関係数を選ぶ', '6問', function () { quizMode(n(6, rPick), { name: '相関係数を選ぶ' }); }],
        ['相関係数の性質', '4問', function () { quizMode(n(4, rRangeQ), { name: '相関係数の性質' }); }],
        ['公式で相関係数を計算する', '6問', function () { fillMode(function () { return shuffle(RC).slice(0, 6).map(rCalcP); }); }],
        ['表をうめて相関係数', '2問', function () { taskMode(n(2, corrTask), '表をうめる'); }]
      ]);
    },
    matome: function () {
      show('やりたい問題を選ぼう。', [
        ['言葉の穴うめ', '9問', function () { quizMode(fillQ, { name: '言葉の穴うめ' }); }],
        ['総合問題', '10問', function () { quizMode(allQ, { name: '総合問題' }); }],
        ['データの活用（手順と判断）', '4問', function () { quizMode(judgeQ, { name: 'データの活用' }); }],
        ['タイムアタック', '10問', function () { quizMode(allQ, { name: 'タイムアタック', timed: true }); }]
      ]);
    }
  };
  global.DBP = { start: function (k) { P[k](); } };
})(window);
