/* ===========================================================================
   data-bun.js — 数学Ⅰ データの分析 32〜37 で共通に使う仕組み
   ---------------------------------------------------------------------------
   統計の計算、図（ドットプロット・ヒストグラム・箱ひげ図・散布図）、
   操作する問題（点を打つ・ならべる・表をうめる・柱をかく）。4択は Sek.quiz を使う。
   ========================================================================= */
(function (global) {
  'use strict';
  var md = function (s) { return FillSteps.md(s); }, M = '−';
  var rint = Sek.rint, shuffle = Sek.shuffle, pick = Sek.pick;
  // ---- 統計 ----
  var sum = function (a) { return a.reduce(function (s, v) { return s + v; }, 0); };
  var mean = function (a) { return sum(a) / a.length; };
  var sorted = function (a) { return a.slice().sort(function (x, y) { return x - y; }); };
  function median(a) { var s = sorted(a), n = s.length, h = Math.floor(n / 2); return n % 2 ? s[h] : (s[h - 1] + s[h]) / 2; }
  function halves(a) { var s = sorted(a), n = s.length, h = Math.floor(n / 2); return [s.slice(0, h), s.slice(n % 2 ? h + 1 : h)]; }
  function quartiles(a) { var h = halves(a); return [median(h[0]), median(a), median(h[1])]; }
  function modes(a) { var c = {}, best = 0; a.forEach(function (v) { c[v] = (c[v] || 0) + 1; best = Math.max(best, c[v]); }); return Object.keys(c).filter(function (k) { return c[k] === best; }).map(Number); }
  // 数の文字（負は −、小数は余分な 0 なし）
  function f(v, d) { var r = Math.round(v * 1000) / 1000, s = d === undefined ? String(Math.abs(r)) : Math.abs(r).toFixed(d); return (r < 0 ? M : '') + s; }
  var list = function (a) { return a.map(function (v) { return f(v); }).join('　'); };
  // まちがいの数（本物とちがう、なるべく近い数）
  var decs = function (v) { var s = f(v), i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };
  function near(ans, cands, n) {
    var o = [], seen = {}, dmax = Math.max(1, decs(ans)); seen[f(ans)] = 1;
    cands.concat([ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans - 3, ans + 0.5]).forEach(function (v) { var k = f(v); if (!seen[k] && decs(v) <= dmax && o.length < (n || 3)) { seen[k] = 1; o.push(k); } });
    return o;
  }
  // データを横1列で（入らないときは小さくする）。多いときは per 個ずつの表
  function line(a) { return '<div class="db-line fit1">' + a.map(function (v) { return '<span>' + f(v) + '</span>'; }).join('') + '</div>'; }
  function grid(a, per) { return '<div class="db-grid" style="--c:' + per + '">' + a.map(function (v) { return '<span>' + f(v) + '</span>'; }).join('') + '</div>'; }
  // 横に入らない式や行を、入る大きさまで小さくする
  function fitAll(el) {
    el.querySelectorAll('.fit1').forEach(function (e) {
      e.style.fontSize = '';
      var size = parseFloat(getComputedStyle(e).fontSize);
      while (e.scrollWidth > e.clientWidth + 1 && size > 11) { size -= 1; e.style.fontSize = size + 'px'; }
    });
  }
  // √n を簡単にした形（12 → 2√3）
  function rootS(n) { for (var k = Math.floor(Math.sqrt(n)); k >= 1; k--) if (n % (k * k) === 0) { var r = n / (k * k); return r === 1 ? String(k) : (k > 1 ? k : '') + '√' + r; } return '√' + n; }
  var gcd = function (a, b) { while (b) { var t = a % b; a = b; b = t; } return Math.abs(a); };
  // 平方の和 ss を個数 n でわった分散と、その標準偏差。小数のときは分数の形も
  function sdForms(ss, n) {
    var v = ss / n;
    if (ss % n === 0) return { v: f(v), s: rootS(v), vf: '', sf: '' };
    var g = gcd(ss, n), a = ss / g, b = n / g, ra = rootS(a), rb = rootS(b), rr = rootS(a * b), m = rr.match(/^(\d*)√(\d+)$/);
    var k = m ? (+m[1] || 1) : +rr, rad = m ? '√' + m[2] : '', g2 = gcd(k, b), k2 = k / g2, b2 = b / g2;
    var rat = (k2 === 1 && rad ? '' : k2) + rad, last = b2 === 1 ? rat : '{' + rat + '|' + b2 + '}';
    var steps = ['{√' + a + '|√' + b + '}'];
    if (ra !== '√' + a || rb !== '√' + b) steps.push('{' + ra + '|' + rb + '}');
    if (last !== steps[steps.length - 1]) steps.push(last);
    return { v: f(v), s: '√' + f(v), vf: '{' + a + '|' + b + '}', sf: steps.join(' = ') };
  }

  // ---- 図 ----
  var INK = '#1f2328', NAVY = '#1f4e8c', BLUE = '#dfeaf7', ORANGE = '#c2410c';
  var txt = function (x, y, t, a, size, it, col) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (a || 'middle') + '" font-family="STIX Two Text, serif" font-size="' + (size || 14) + '"' + (it ? ' font-style="italic"' : '') + ' fill="' + (col || INK) + '">' + t + '</text>'; };
  function ticks(lo, hi, step, X, y, label) {
    var s = '';
    for (var v = lo; v <= hi + 1e-9; v += step) s += '<path d="M' + X(v) + ' ' + y + 'v5" stroke="' + INK + '"/>' + txt(X(v), y + 19, f(v));
    return s + (label ? txt(X(hi) + 4, y + 36, label, 'end', 12) : '');
  }
  function dotPlot(data, lo, hi, step) {
    var W = 340, H = 150, X = function (v) { return 18 + (v - lo) / (hi - lo) * (W - 36); }, y0 = H - 34, c = {}, s = '';
    data.forEach(function (v) { c[v] = (c[v] || 0) + 1; s += '<circle cx="' + X(v) + '" cy="' + (y0 - 8 - (c[v] - 1) * 11) + '" r="4.3" fill="' + NAVY + '"/>'; });
    return '<svg class="sk-fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="ドットプロット"><path d="M8 ' + y0 + 'H' + (W - 8) + '" stroke="' + INK + '" stroke-width="1.3"/>' + ticks(lo, hi, step || 1, X, y0) + s + '</svg>';
  }
  // edges: 階級の境目、freq: 度数
  function histogram(edges, freq, unit) {
    var W = 340, H = 236, L = 34, B = 40, T = 30, top = Math.max.apply(null, freq) + 1, n = edges.length - 1;
    var X = function (i) { return L + i / n * (W - L - 14); }, Y = function (v) { return H - B - v / top * (H - B - T); }, s = '';
    for (var v = 0; v <= top; v++) s += '<path d="M' + L + ' ' + Y(v) + 'H' + (W - 14) + '" stroke="#dbe2ea"/>' + txt(L - 6, Y(v) + 5, v, 'end', 13);
    freq.forEach(function (c, i) { s += '<rect x="' + X(i) + '" y="' + Y(c) + '" width="' + (X(1) - X(0)) + '" height="' + (Y(0) - Y(c)) + '" fill="' + BLUE + '" stroke="' + NAVY + '" stroke-width="1.5"/>'; });
    s += '<path d="M' + L + ' ' + Y(0) + 'H' + (W - 14) + 'M' + L + ' ' + Y(0) + 'V' + T + '" stroke="' + INK + '" stroke-width="1.3" fill="none"/>';
    edges.forEach(function (e, i) { s += txt(X(i), Y(0) + 17, e, 'middle', 13); });
    s += txt(W - 14, H - 6, unit || '', 'end', 12) + txt(L, 14, '（人）', 'middle', 12);
    return '<svg class="sk-fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="ヒストグラム">' + s + '</svg>';
  }
  // five: [最小, Q1, Q2, Q3, 最大]
  function boxPlot(five, lo, hi, step, label) {
    var W = 340, H = 106, X = function (v) { return 18 + (v - lo) / (hi - lo) * (W - 36); }, y = 34, h = 42, y0 = 84, s = '';
    for (var v = lo; v <= hi + 1e-9; v += step) s += '<path d="M' + X(v) + ' 8V' + y0 + '" stroke="#e3e8ee"/>';
    s += '<path d="M18 ' + y0 + 'H' + (W - 10) + '" stroke="' + INK + '" stroke-width="1.3"/>' + ticks(lo, hi, step, X, y0);
    s += '<path d="M' + X(five[0]) + ' ' + y + 'H' + X(five[1]) + 'M' + X(five[3]) + ' ' + y + 'H' + X(five[4]) + 'M' + X(five[0]) + ' ' + (y - 9) + 'V' + (y + 9) + 'M' + X(five[4]) + ' ' + (y - 9) + 'V' + (y + 9) + '" stroke="' + INK + '" stroke-width="1.8" fill="none"/>';
    s += '<rect x="' + X(five[1]) + '" y="' + (y - h / 2 + 8) + '" width="' + (X(five[3]) - X(five[1])) + '" height="' + (h - 16) + '" fill="' + BLUE + '" stroke="' + NAVY + '" stroke-width="1.8"/>';
    s += '<path d="M' + X(five[2]) + ' ' + (y - h / 2 + 8) + 'v' + (h - 16) + '" stroke="' + NAVY + '" stroke-width="2.4"/>';
    return '<svg class="sk-fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="箱ひげ図">' + s + '</svg>';
  }
  function scatter(pts, xl, yl) {
    var W = 300, H = 240, L = 34, B = 34, T = 12, xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var X = function (v) { return L + 14 + (v - x0) / ((x1 - x0) || 1) * (W - L - 34); }, Y = function (v) { return H - B - 14 - (v - y0) / ((y1 - y0) || 1) * (H - B - T - 22); }, s = '';
    s += '<path d="M' + L + ' ' + (H - B) + 'H' + (W - 6) + 'M' + L + ' ' + (H - B) + 'V' + (T - 4) + '" stroke="' + INK + '" stroke-width="1.3" fill="none"/>';
    s += '<path d="M' + (W - 6) + ' ' + (H - B) + 'l-8 -3.5v7z M' + L + ' ' + (T - 4) + 'l-3.5 8h7z" fill="' + INK + '"/>';
    pts.forEach(function (p) { s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4" fill="' + NAVY + '"/>'; });
    s += txt(W - 8, H - B + 18, xl || 'x', 'end', 15, !xl) + txt(L - 8, T + 8, yl || 'y', 'end', 15, !yl);
    return '<svg class="sk-fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="散布図">' + s + '</svg>';
  }
  // 相関の強さ r に近い点の集まり
  function cloud(r, n) {
    var pts = [], k = Math.sqrt(Math.max(0, 1 - r * r));
    for (var i = 0; i < n; i++) {
      var a = gauss(), b = gauss();
      pts.push([a, r * a + k * b]);
    }
    return pts;
  }
  function gauss() { var u = Math.random() || .1, v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function corr(p) {
    var mx = mean(p.map(function (q) { return q[0]; })), my = mean(p.map(function (q) { return q[1]; })), sxy = 0, sx = 0, sy = 0;
    p.forEach(function (q) { sxy += (q[0] - mx) * (q[1] - my); sx += Math.pow(q[0] - mx, 2); sy += Math.pow(q[1] - my, 2); });
    return sxy / Math.sqrt(sx * sy);
  }
  function cloudNear(r, n) { for (var i = 0; i < 200; i++) { var p = cloud(r, n); if (Math.abs(corr(p) - r) < 0.04) return p; } return cloud(r, n); }

  // ---- 問題を順に進める ----
  // tasks: [{ q: 問題文, mount(body, ctx), review?() }]
  function run(el, tasks, o) {
    var S = tasks.map(function () { return { done: false, miss: 0 }; }), i = 0;
    function draw() {
      var t = tasks[i], st = S[i], allDone = S.every(function (s) { return s.done; });
      el.innerHTML = '<div class="sk-top"><button type="button" class="fs-btn zm-back" data-home>メニューへ</button><span class="sk-count">' + o.name + '　' + (i + 1) + ' / ' + tasks.length + '</span></div>' +
        '<nav class="sk-tabs">' + tasks.map(function (_, k) { return '<button type="button" class="sk-tab' + (k === i ? ' cur' : '') + (S[k].done ? (S[k].miss ? ' ng' : ' ok') : '') + '" data-go="' + k + '">' + (k + 1) + '</button>'; }).join('') + '</nav>' +
        '<div class="sk-q"><span class="ask">' + [].concat(t.q).map(md).join('<br>') + '</span></div><div id="dbBody"></div><div class="db-say" id="dbSay"></div>' +
        '<div class="fs-nav"><button type="button" class="fs-btn" data-prev' + (i ? '' : ' disabled') + '>前の問題</button><button type="button" class="fs-btn' + (st.done ? ' primary' : '') + '" data-next>' + (allDone ? '結果を見る' : '次の問題') + '</button></div>';
      el.querySelector('[data-home]').onclick = o.home;
      el.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { i = +b.dataset.go; draw(); }; });
      el.querySelector('[data-prev]').onclick = function () { i--; draw(); window.scrollTo(0, 0); };
      el.querySelector('[data-next]').onclick = function () { if (allDone) finish(); else { i = (i + 1) % tasks.length; draw(); window.scrollTo(0, 0); } };
      el.querySelector('.sk-q').insertAdjacentHTML('beforeend', t.sub || '');
      t.mount(el.querySelector('#dbBody'), {
        solved: st.done,
        miss: function () { st.miss++; },
        ok: function (say) {
          if (!st.done) { st.done = true; var tab = el.querySelector('[data-go="' + i + '"]'); if (tab) tab.classList.add(st.miss ? 'ng' : 'ok'); el.querySelector('[data-next]').classList.add('primary'); if (S.every(function (s) { return s.done; })) el.querySelector('[data-next]').textContent = '結果を見る'; }
          if (say) el.querySelector('#dbSay').innerHTML = '<div class="sk-ans"><b>正解</b>' + say + '</div>';
        }
      });
      fitAll(el);
    }
    function finish() {
      var clean = S.filter(function (s) { return s.done && !s.miss; }).length, bad = [];
      S.forEach(function (s, k) { if (s.miss) bad.push(k); });
      el.innerHTML = '<section class="sk-result"><h2>' + o.name + '　おわり</h2><p class="sk-score">まちがいなし　<b>' + clean + '</b> / ' + tasks.length + '</p>' +
        (bad.length ? '<p><button type="button" class="fs-btn primary" data-rev>間違えた問題を確認する（' + bad.length + '問）</button></p>' : '<p>間違えた問題はありません</p>') +
        '<div id="dbRev" hidden>' + bad.map(function (k) { return '<p><button type="button" class="fs-btn" data-open="' + k + '">問題 ' + (k + 1) + ' を見る（まちがい ' + S[k].miss + ' 回）</button></p>'; }).join('') + '</div>' +
        '<div class="fs-nav"><button type="button" class="fs-btn" data-home>メニューへ</button><button type="button" class="fs-btn" data-again>もう一度</button></div></section>';
      el.querySelector('[data-home]').onclick = o.home;
      el.querySelector('[data-again]').onclick = o.again;
      var r = el.querySelector('[data-rev]'); if (r) r.onclick = function () { el.querySelector('#dbRev').hidden = false; r.hidden = true; };
      el.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { i = +b.dataset.open; draw(); window.scrollTo(0, 0); }; });
      window.scrollTo(0, 0);
    }
    draw(); window.scrollTo(0, 0);
  }

  // ---- 小さい順にならべる ----
  function sortTask(data, then) {
    var s = sorted(data), got = [];
    return function (body, ctx) {
      var used = data.map(function () { return ctx.solved; });
      if (ctx.solved) got = s.slice();
      function draw(bad) {
        body.innerHTML = '<div class="db-slots">' + s.map(function (_, k) { return '<span class="db-slot' + (k < got.length ? ' on' : k === got.length ? ' now' : '') + '">' + (k < got.length ? f(got[k]) : '') + '</span>'; }).join('') + '</div>' +
          '<div class="db-pool">' + data.map(function (v, k) { return '<button type="button" class="fs-card db-num' + (used[k] ? ' used' : '') + (bad === k ? ' ng' : '') + '" data-v="' + k + '"' + (used[k] ? ' disabled' : '') + '>' + f(v) + '</button>'; }).join('') + '</div>';
        body.querySelectorAll('[data-v]').forEach(function (b) {
          b.onclick = function () {
            var k = +b.dataset.v;
            if (data[k] === s[got.length]) { used[k] = true; got.push(data[k]); draw(); if (got.length === s.length) (then ? then(body, ctx) : ctx.ok('<p>' + md('小さい順：' + list(s)) + '</p>')); }
            else { ctx.miss(); draw(k); }
          };
        });
      }
      draw();
      if (ctx.solved && then) then(body, ctx);
    };
  }
  // ならべたあとに答えを選ぶ（中央値など）
  function thenPick(q, ans, wrong, say) {
    return function (body, ctx) {
      var box = document.createElement('div'); box.className = 'db-then'; body.appendChild(box);
      var ch = shuffle([ans].concat(wrong)), tried = [], fin = ctx.solved;
      function draw() {
        box.innerHTML = '<p class="db-q2">' + md(q) + '</p><div class="sk-opts">' + ch.map(function (v, k) { return '<button type="button" class="sk-opt' + (tried.indexOf(v) >= 0 ? ' ng' : '') + (fin && v === ans ? ' ok' : '') + '" data-k="' + k + '"' + (fin || tried.indexOf(v) >= 0 ? ' disabled' : '') + '><span>' + md(v) + '</span></button>'; }).join('') + '</div>';
        box.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { var v = ch[+b.dataset.k]; if (v === ans) { fin = true; draw(); ctx.ok('<p>' + md(say) + '</p>'); } else { tried.push(v); ctx.miss(); draw(); } }; });
      }
      draw();
      if (fin) ctx.ok('<p>' + md(say) + '</p>');
    };
  }

  // ---- ドットプロットをかく ----
  function dotTask(data, lo, hi) {
    return function (body, ctx) {
      var i = ctx.solved ? data.length : 0, vals = []; for (var v = lo; v <= hi; v++) vals.push(v);
      function draw(bad) {
        var c = {}; data.slice(0, i).forEach(function (x) { c[x] = (c[x] || 0) + 1; });
        var top = Math.max(4, Math.max.apply(null, vals.map(function (x) { return c[x] || 0; })) + 1);
        body.innerHTML = '<div class="db-chips">' + data.map(function (x, k) { return '<span class="db-chip' + (k < i ? ' on' : k === i ? ' now' : '') + '">' + f(x) + '</span>'; }).join('') + '</div>' +
          '<div class="db-dots" style="--n:' + vals.length + '">' + vals.map(function (x) {
            var d = ''; for (var k = 0; k < (c[x] || 0); k++) d += '<i></i>';
            return '<button type="button" class="db-col' + (bad === x ? ' ng' : '') + '" data-x="' + x + '"' + (i >= data.length ? ' disabled' : '') + '><span class="st" style="min-height:' + top * 15 + 'px">' + d + '</span><b>' + f(x) + '</b></button>';
          }).join('') + '</div><p class="db-note">' + (i < data.length ? '色のついた数の場所を押して、点を打とう。' : '') + '</p>';
        body.querySelectorAll('[data-x]').forEach(function (b) {
          b.onclick = function () { var x = +b.dataset.x; if (x === data[i]) { i++; draw(); if (i === data.length) ctx.ok(); } else { ctx.miss(); draw(x); } };
        });
      }
      draw();
      if (ctx.solved) ctx.ok();
    };
  }

  // ---- ヒストグラムをかく（1 本ずつ、オレンジの列で度数の高さを押す。柱は斜線でぬる）2026-11-23 テスト対策と同じかき方に ----
  var hatchId = 0;
  function histTask(edges, freq, unit) {
    return function (body, ctx) {
      var n = freq.length, i = ctx.solved ? n : 0, top = Math.max.apply(null, freq) + 1, pid = 'dbHatch' + (++hatchId);
      var W = 340, H = 250, L = 36, R = 14, B = 34, T = 14;
      var X = function (k) { return L + k / n * (W - L - R); }, Y = function (v) { return H - B - v / top * (H - B - T); }, f1 = function (v) { return v.toFixed(1); };
      function draw(bad) {
        var s = '<defs><pattern id="' + pid + '" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" stroke="' + NAVY + '" stroke-width="1.3"/></pattern></defs>';
        if (i < n) s += '<rect x="' + f1(X(i)) + '" y="' + f1(Y(top)) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(0) - Y(top)) + '" fill="#fff1db"/>';
        for (var v = 0; v <= top; v++) s += '<path d="M' + L + ' ' + f1(Y(v)) + 'H' + (W - R) + '" stroke="#dbe2ea"/>' + txt(L - 7, f1(Y(v) + 5), v, 'end', 14);
        freq.forEach(function (c, k) { if (k < i && c > 0) s += '<rect x="' + f1(X(k)) + '" y="' + f1(Y(c)) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(0) - Y(c)) + '" fill="url(#' + pid + ')" stroke="' + NAVY + '" stroke-width="2"/>'; });
        if (bad) s += '<rect x="' + f1(X(bad[0])) + '" y="' + f1(Y(bad[1])) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(0) - Y(bad[1])) + '" fill="#ffc9c9" fill-opacity=".7" stroke="#c92a2a" stroke-width="1.5"/>';
        s += '<path d="M' + L + ' ' + f1(Y(0)) + 'H' + (W - R) + 'M' + L + ' ' + f1(Y(0)) + 'V' + T + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
        edges.forEach(function (e, k) { s += txt(f1(X(k)), f1(Y(0) + 19), f(e), 'middle', 14); });
        if (i < n) for (var h = 1; h <= top; h++) s += '<rect class="db-hc2" data-h="' + h + '" x="' + f1(X(i)) + '" y="' + f1(Y(h)) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(h - 1) - Y(h)) + '" fill="' + NAVY + '" fill-opacity="0"/>';
        body.innerHTML = '<div class="db-hist2"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="ヒストグラム">' + s + '</svg></div>' +
          '<p class="db-note">' + (i < n ? 'オレンジの列で、度数の高さを押そう。' : '') + '（横：' + (unit === 'm' ? 'ｍ' : unit) + '、縦：人）</p>';
        body.querySelectorAll('.db-hc2').forEach(function (r) {
          r.addEventListener('click', function () {
            var h = +r.getAttribute('data-h');
            if (h === freq[i]) { i++; while (i < n && freq[i] === 0) i++; draw(); if (i >= n) ctx.ok(''); } else { ctx.miss(); draw([i, h]); }
          });
        });
      }
      while (i < n && freq[i] === 0) i++;
      draw();
      if (ctx.solved) ctx.ok('');
    };
  }

  // ---- 続きの問題を、同じ問題の下へ順に出していく（テスト対策の seqTask と同じ） ----
  // parts：[{ head?, mount, note? }]。1 つできたら、その下に次を出す（そこまでスクロール）
  function seq(parts) {
    return function (body, ctx) {
      body.innerHTML = '';
      function open(i) {
        var p = parts[i], box = document.createElement('section'), inner = document.createElement('div'), fired = false;
        box.className = 'db-part' + (i ? ' next' : '');
        if (p.head) box.innerHTML = '<p class="db-ph">' + md(p.head) + '</p>';
        box.appendChild(inner); body.appendChild(box);
        p.mount(inner, {
          solved: ctx.solved, miss: ctx.miss,
          ok: function (say) {
            if (fired) return; fired = true;
            if (i === parts.length - 1) { ctx.ok(say || ''); return; }
            if (say && p.note) box.insertAdjacentHTML('beforeend', '<div class="db-psay">' + say + '</div>');
            var nx = open(i + 1);
            if (!ctx.solved) setTimeout(function () { try { nx.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { nx.scrollIntoView(); } }, 380);
          }
        });
        return box;
      }
      open(0);
    };
  }

  // ---- 小さい順に並べてから、順に答える（中央値・最頻値・四分位数 など）2026-11-23 ----
  //   並べた行は、スマホでも PC でもかならず横 1 列。並べ終わったら数のカードは消して、すぐ下に問題を出す
  //   steps：[{ q, ans, wrong, memo?, hint?, mark?, tint? }]
  //     mark：{ at: 位置, lab }（at は 0 から数えた番号。3.5 なら 4 番目と 5 番目の間に ∨、整数ならその数を ○ で囲む）
  //           { hl: [番号…], lab }（その数に色をつける：最頻値）
  //     tint：[から, まで]（その問題を答えている間、その範囲に色をつける：前半・後半）
  function sortSteps(data, steps, o) {
    o = o || {};
    var s = sorted(data), n = s.length, LB = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'];
    steps.forEach(function (st) { st.ch = st.ch || shuffle([st.ans].concat(st.wrong.slice(0, (o.n || 4) - 1))); });
    return function (body, ctx) {
      var got = ctx.solved ? n : 0, used = data.map(function () { return !!ctx.solved; }), k = ctx.solved ? steps.length : 0, tried = [], bad = -1;
      function rowHTML() {
        var mk = {}, at = function (i) { return mk[i] = mk[i] || {}; };
        steps.slice(0, k).forEach(function (st) {
          [].concat(st.mark || []).forEach(function (m) {
            if (m.hl) m.hl.forEach(function (i) { at(i).hl = true; });
            else if (m.at % 1) at(Math.ceil(m.at)).v = m.lab || '';
            else at(m.at).ring = m.lab || '';
          });
        });
        var tint = got === n && k < steps.length && steps[k].tint, marked = Object.keys(mk).length > 0;
        return '<div class="db-rowbox"><div class="db-row' + (marked ? ' mk' : '') + (n > 10 ? ' many' : '') + '" style="--n:' + n + '">' + s.map(function (v, i) {
          var m = mk[i] || {}, c = 'db-slot' + (i < got ? ' on' : i === got ? ' now' : '') + (m.ring !== undefined ? ' ring' : '') + (m.hl ? ' hl' : '') + (tint && i >= tint[0] && i <= tint[1] ? ' tint' : '');
          return '<span class="' + c + '">' + (i < got ? f(v) : '') + (m.v !== undefined ? '<i class="vm">∨</i>' + (m.v ? '<i class="lb lv">' + m.v + '</i>' : '') : '') + (m.ring ? '<i class="lb">' + m.ring + '</i>' : '') + '</span>';
        }).join('') + '</div></div>';
      }
      function draw() {
        var h = rowHTML();
        if (got < n) {
          var cols = n <= 8 ? n : Math.ceil(n / 2);
          h += '<p class="db-note">' + (o.sortNote || '小さい数から順に押そう。') + '</p><div class="db-pool2" style="--c:' + cols + '">' + data.map(function (v, j) {
            return '<button type="button" class="fs-card db-num' + (used[j] ? ' used' : '') + (bad === j ? ' ng' : '') + '" data-v="' + j + '"' + (used[j] ? ' disabled' : '') + '>' + f(v) + '</button>';
          }).join('') + '</div>';
        } else {
          var memo = steps.slice(0, k).filter(function (st) { return st.memo; }).map(function (st) { return '<span>' + String(st.memo).replace(/</g, '&lt;') + '</span>'; }).join('');
          var figs = steps.slice(0, k).filter(function (st) { return st.memoHTML; }).map(function (st) { return '<div class="db-mfig">' + st.memoHTML + '</div>'; }).join('');
          if (memo) h += '<div class="db-memo2">' + memo + '</div>';
          h += figs;
          if (k < steps.length) {
            var st = steps[k], fig = /^<svg/.test(st.ans), long = !fig && st.ch.some(function (v) { return String(v).length > 7; });
            h += '<p class="db-q2"><b>' + (k + 1) + '</b> ' + md(st.q) + '</p><div class="sk-opts ' + (fig ? 'figs stack' : long ? 'db-o2' : st.ch.length > 4 ? 'db-o3' : 'db-o4') + '">' + st.ch.map(function (v, j) {
              var ng = tried.indexOf(v) >= 0;
              return '<button type="button" class="sk-opt' + (ng ? ' ng' : '') + '" data-k="' + j + '"' + (ng ? ' disabled' : '') + '><small>' + LB[j] + '</small><span>' + (fig ? v : md(v)) + '</span></button>';
            }).join('') + '</div>' + (tried.length && st.hint ? '<p class="db-note">' + md(st.hint) + '</p>' : '');
          }
        }
        body.innerHTML = h;
        body.querySelectorAll('[data-v]').forEach(function (b) {
          b.onclick = function () {
            var j = +b.dataset.v;
            if (data[j] === s[got]) { used[j] = true; got++; bad = -1; draw(); if (got === n && !steps.length) ctx.ok(paras(o.say)); }
            else { bad = j; ctx.miss(); draw(); }
          };
        });
        body.querySelectorAll('[data-k]').forEach(function (b) {
          b.onclick = function () {
            var st = steps[k], v = st.ch[+b.dataset.k];
            if (v === st.ans) { k++; tried = []; draw(); if (k === steps.length) ctx.ok(paras(o.say)); }
            else { tried.push(v); ctx.miss(); draw(); }
          };
        });
      }
      draw();
      if (ctx.solved) ctx.ok(paras(o.say));
    };
  }

  // ---- 箱ひげ図をかく（指やマウスで、数直線の上を押して・なぞって位置を決める）2026-11-23 ----
  //   箱（第1・第3四分位数）→ 箱の中の線（中央値）→ ひげ（最小値・最大値）の順にかく。
  //   押している間は線がついてきて、値が上に出る。はなすと答え合わせ
  var BOX_ORDER = [1, 3, 2, 0, 4], BOX_NAME = ['最小値', '第 1 四分位数', '中央値（第 2 四分位数）', '第 3 四分位数', '最大値'];
  function fiveHTML(five, cur) {
    var hd = ['最小値', '第 1 四分位数', '中央値', '第 3 四分位数', '最大値'];
    return '<table class="db-t db-five"><tr>' + hd.map(function (h, i) { return '<th' + (i === cur ? ' class="hl"' : '') + '>' + h + '</th>'; }).join('') + '</tr><tr>' + five.map(function (v, i) { return '<td' + (i === cur ? ' class="hl"' : '') + '>' + f(v) + '</td>'; }).join('') + '</tr></table>';
  }
  function boxDraw(five, lo, hi, step, o) {
    o = o || {};
    return function (body, ctx) {
      var W = 340, H = 128, L = 18, R = 18, yc = 50, bh = 36, y0 = 100, k = ctx.solved ? 5 : 0, P = {}, busy = false;
      var X = function (v) { return L + (v - lo) / (hi - lo) * (W - L - R); }, f1 = function (v) { return (+v).toFixed(1); };
      var snap = five.some(function (v) { return v % 1; }) ? 0.5 : 1;
      if (ctx.solved) five.forEach(function (v, i) { P[i] = v; });
      var st = '';
      for (var v = lo; v <= hi + 1e-9; v += 1) st += '<path d="M' + f1(X(v)) + ' 8V' + y0 + '" stroke="' + ((v - lo) % step ? '#f1f4f7' : '#e1e7ee') + '"/>';
      st += '<path d="M' + (L - 8) + ' ' + y0 + 'H' + (W - R + 8) + '" stroke="' + INK + '" stroke-width="1.3"/>';
      for (v = lo; v <= hi + 1e-9; v += 1) st += '<path d="M' + f1(X(v)) + ' ' + y0 + 'v' + ((v - lo) % step ? 3 : 6) + '" stroke="' + INK + '"/>' + ((v - lo) % step ? '' : txt(f1(X(v)), y0 + 21, f(v), 'middle', 14));
      body.innerHTML = '<div class="db-bdt"></div><div class="db-bd"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="箱ひげ図をかく">' + st + '<g class="dy"></g><rect class="hit" x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"/></svg></div><p class="db-note db-bdn"></p>';
      var svg = body.querySelector('svg'), dy = body.querySelector('.dy');
      function shape(Q, live, ng) {
        var s = '', top = yc - bh / 2, line = function (x, y1, y2, c, w) { return '<path d="M' + f1(x) + ' ' + y1 + 'V' + y2 + '" stroke="' + (c || NAVY) + '" stroke-width="' + (w || 2.2) + '"/>'; };
        if (Q[1] !== undefined && Q[3] !== undefined) s += '<rect x="' + f1(Math.min(X(Q[1]), X(Q[3]))) + '" y="' + top + '" width="' + f1(Math.abs(X(Q[3]) - X(Q[1]))) + '" height="' + bh + '" fill="' + BLUE + '" stroke="' + NAVY + '" stroke-width="2"/>';
        else if (Q[1] !== undefined) s += line(X(Q[1]), top, top + bh);
        if (Q[2] !== undefined) s += line(X(Q[2]), top, top + bh, NAVY, 2.8);
        if (Q[0] !== undefined) s += '<path d="M' + f1(X(Q[0])) + ' ' + yc + 'H' + f1(X(Q[1])) + 'M' + f1(X(Q[0])) + ' ' + (yc - 10) + 'V' + (yc + 10) + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
        if (Q[4] !== undefined) s += '<path d="M' + f1(X(Q[3])) + ' ' + yc + 'H' + f1(X(Q[4])) + 'M' + f1(X(Q[4])) + ' ' + (yc - 10) + 'V' + (yc + 10) + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
        if (live !== undefined) {
          var c = ng ? '#c92a2a' : '#e8590c', x = X(live), bx = Math.max(22, Math.min(W - 22, x));
          s += '<path d="M' + f1(x) + ' 18V' + y0 + '" stroke="' + c + '" stroke-width="1.6" stroke-dasharray="4 3"/>' +
            '<rect x="' + f1(bx - 20) + '" y="0" width="40" height="18" rx="5" fill="' + c + '"/>' + txt(f1(bx), 14, f(live), 'middle', 14, false, '#fff');
        }
        return s;
      }
      function note() {
        body.querySelector('.db-bdt').innerHTML = fiveHTML(five, k < 5 ? BOX_ORDER[k] : -1);
        body.querySelector('.db-bdn').innerHTML = k < 5 ? '<b>' + BOX_NAME[BOX_ORDER[k]] + '</b>（' + f(five[BOX_ORDER[k]]) + '）の位置を押そう。' : '';
      }
      function paint(live, ng) { var Q = {}; Object.keys(P).forEach(function (i) { Q[i] = P[i]; }); if (live !== undefined && k < 5) Q[BOX_ORDER[k]] = live; dy.innerHTML = shape(Q, live, ng); }
      function valAt(ev) {
        var r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, v = lo + (x - L) / (W - L - R) * (hi - lo);
        return Math.max(lo, Math.min(hi, Math.round(v / snap) * snap));
      }
      var down = false;
      svg.addEventListener('pointerdown', function (ev) { if (k >= 5 || busy) return; down = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) {} ev.preventDefault(); paint(valAt(ev)); });
      svg.addEventListener('pointermove', function (ev) { if (down) paint(valAt(ev)); });
      var up = function (ev) {
        if (!down) return; down = false;
        var v = valAt(ev), want = five[BOX_ORDER[k]];
        if (Math.abs(v - want) < 1e-9) { P[BOX_ORDER[k]] = want; k++; paint(); note(); if (k === 5) ctx.ok(paras(o.say || 'ひげの両はしが最小値と最大値、箱の両はしが第 1・第 3 四分位数、箱の中の線が中央値です。')); }
        else { ctx.miss(); busy = true; paint(v, true); body.querySelector('.db-bdn').innerHTML = f(v) + ' ではないよ。表の値をもう一度見よう。'; setTimeout(function () { busy = false; paint(); note(); }, 900); }
      };
      svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', function () { down = false; paint(); });
      paint(); note();
      if (ctx.solved) ctx.ok(paras(o.say || ''));
    };
  }

  // ---- 表をうめる ----
  // cell(a, cards)：うめるマス。grids：表の形（向きを切りかえるときは2つ）。order：うめる順
  function cell(a, cards) { return { a: String(a), cards: cards.map(String), v: null }; }
  function tableTask(o) {
    return function (body, ctx) {
      var g = 0, cur = null;
      if (ctx.solved) o.order.forEach(function (c) { c.v = c.a; });
      function firstOpen() { for (var k = 0; k < o.order.length; k++) if (o.order[k].v === null) return o.order[k]; return null; }
      cur = firstOpen();
      // reveal：下の欄（標準偏差など）と公式は、そこまで来たら 1 つずつ出す
      var reached = function (c) { return !o.reveal || c.v !== null || c === cur; };
      function draw(bad) {
        var grid = o.grids[g], html = !grid ? '' : '<div class="db-tw"><table class="db-t">' + grid.map(function (row, ri) {
          return '<tr>' + row.map(function (c) {
            if (c === null) return '<td class="off"></td>';
            if (typeof c === 'object' && c.a !== undefined) return '<td class="fill' + (c === cur ? ' now' : '') + (c.v !== null ? ' ok' : '') + '" data-i="' + o.order.indexOf(c) + '">' + (c.v !== null ? md(c.v) : '') + '</td>';
            var hd = typeof c === 'object' ? c : { t: c };
            return '<' + (hd.h ? 'th' : 'td') + (hd.hl ? ' class="hl"' : '') + '>' + md(String(hd.t)) + '</' + (hd.h ? 'th' : 'td') + '>';
          }).join('') + '</tr>';
        }).join('') + '</table></div>';
        var box = function (c) { return '<span class="fill db-box' + (c === cur ? ' now' : '') + (c.v !== null ? ' ok' : '') + '" data-i="' + o.order.indexOf(c) + '">' + (c.v !== null ? md(c.v) : '') + '</span>'; };
        var below = (o.below || []).filter(function (r) { return reached(r[1]); });
        if (below.length) html += '<table class="db-t db-b">' + below.map(function (r) { return '<tr><th>' + md(r[0]) + '</th><td class="fill' + (r[1] === cur ? ' now' : '') + (r[1].v !== null ? ' ok' : '') + '" data-i="' + o.order.indexOf(r[1]) + '">' + (r[1].v !== null ? md(r[1].v) : '') + '</td></tr>'; }).join('') + '</table>';
        if (o.formula && (!o.formulaAt || reached(o.formulaAt))) html += '<div class="db-fx">' + (o.formulaHead ? '<p class="db-fh">公式　' + o.formulaHead + '</p>' : '') + '<p class="db-fl fit1">' + o.formula(box) + '</p></div>';
        if (o.grids.length > 1) html = '<div class="sk-ctrl db-flip"><button type="button" class="fs-btn" data-flip>表の向きを変える</button></div>' + html;
        html += '<div class="db-cards">' + (cur ? cur.cards.map(function (v, k) { return '<button type="button" class="fs-card' + (bad === v ? ' db-bad' : '') + '" data-k="' + k + '">' + md(v) + '</button>'; }).join('') : '') + '</div>';
        if (cur && cur.hint) html = '<p class="db-note">' + md(cur.hint) + '</p>' + html;
        if (o.pre) html = o.pre + html;
        body.innerHTML = html;
        body.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { var c = o.order[+b.dataset.i]; if (c.v === null) { cur = c; draw(); } }; });
        body.querySelectorAll('[data-k]').forEach(function (b) {
          b.onclick = function () {
            var v = cur.cards[+b.dataset.k];
            if (v === cur.a) { cur.v = v; cur = firstOpen(); draw(); if (!cur) ctx.ok(paras(o.say)); }
            else { ctx.miss(); draw(v); }
          };
        });
        var fl = body.querySelector('[data-flip]'); if (fl) fl.onclick = function () { g = (g + 1) % o.grids.length; draw(); };
      }
      draw();
      if (ctx.solved) ctx.ok(paras(o.say));
    };
  }
  var paras = function (say) { return say ? [].concat(say).map(function (t) { return '<p>' + md(t) + '</p>'; }).join('') : ''; };

  // ---- 順に選んで進む（値を1つずつ求めてから図を選ぶ、など） ----
  // steps: [{ q, ans, wrong, memo?（できたら上に残す文）, hint? }]。o: { pre, say }
  function chain(steps, o) {
    return function (body, ctx) {
      var k = ctx.solved ? steps.length : 0, tried = [], LBL = ['ア', 'イ', 'ウ', 'エ'];
      steps.forEach(function (s) { s.ch = s.ch || shuffle([s.ans].concat(s.wrong.slice(0, 3))); });
      function draw() {
        var memo = steps.slice(0, k).filter(function (s) { return s.memo; }).map(function (s) { return '<li' + (s.memoHTML ? ' class="fig"' : '') + '>' + (s.memoHTML || md(s.memo)) + '</li>'; }).join('');
        var h = (o.pre || '') + (memo ? '<ol class="db-memo">' + memo + '</ol>' : '');
        if (k < steps.length) {
          var s = steps[k], fig = /^<svg/.test(s.ans), long = !fig && s.ch.some(function (v) { return /[぀-ヿ一-鿿]/.test(v) && v.length > 9; });
          h += '<p class="db-q2"><b>' + (k + 1) + '</b> ' + md(s.q) + '</p><div class="sk-opts' + (fig ? ' figs stack' : long ? ' stack wrap' : o.compact ? ' db-o4' : '') + '">' + s.ch.map(function (v, j) {
            var bad = tried.indexOf(v) >= 0;
            return '<button type="button" class="sk-opt' + (bad ? ' ng' : '') + '" data-k="' + j + '"' + (bad ? ' disabled' : '') + '><small>' + LBL[j] + '</small><span>' + (fig ? v : md(v)) + '</span></button>';
          }).join('') + '</div>' + (tried.length && s.hint ? '<p class="db-note">' + md(s.hint) + '</p>' : '');
        }
        body.innerHTML = h;
        body.querySelectorAll('[data-k]').forEach(function (b) {
          b.onclick = function () {
            var s = steps[k], v = s.ch[+b.dataset.k];
            if (v === s.ans) { k++; tried = []; draw(); if (k === steps.length) ctx.ok(paras(o.say)); }
            else { tried.push(v); ctx.miss(); draw(); }
          };
        });
        fitAll(body);
      }
      draw();
      if (ctx.solved) ctx.ok(paras(o.say));
    };
  }
  var hd = function (t, hl) { return { t: t, h: true, hl: hl }; };

  // ---- 用語の問題 ----
  // T: [[言葉, 意味], …]
  function termQuiz(T, n, extra) {
    var a = shuffle(T).slice(0, n || T.length);
    return a.map(function (t, i) {
      var others = shuffle(T.concat(extra || []).filter(function (x) { return x !== t; })).slice(0, 3);
      return i % 2
        ? { big: '', q: '「' + t[1] + '」を何というか。', ans: t[0], wrong: others.map(function (x) { return x[0]; }), say: t[0] + '：' + t[1] }
        : { big: '', q: '「' + t[0] + '」の説明はどれか。', ans: t[1], wrong: others.map(function (x) { return x[1]; }), say: t[0] + '：' + t[1] };
    });
  }

  global.DB = { md: md, sum: sum, mean: mean, sorted: sorted, median: median, halves: halves, quartiles: quartiles, modes: modes, f: f, list: list, near: near,
    dotPlot: dotPlot, histogram: histogram, boxPlot: boxPlot, scatter: scatter, cloudNear: cloudNear, corr: corr,
    line: line, grid: grid, fitAll: fitAll, rootS: rootS, sdForms: sdForms, chain: chain, paras: paras,
    run: run, sortTask: sortTask, thenPick: thenPick, dotTask: dotTask, histTask: histTask, cell: cell, tableTask: tableTask, hd: hd, termQuiz: termQuiz,
    seq: seq, sortSteps: sortSteps, boxDraw: boxDraw, fiveHTML: fiveHTML };
})(window);
