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
  function near(ans, cands, n) {
    var o = [], seen = {}; seen[f(ans)] = 1;
    cands.concat([ans + 1, ans - 1, ans + 2, ans - 2, ans + 0.5, ans + 3]).forEach(function (v) { var k = f(v); if (!seen[k] && o.length < (n || 3)) { seen[k] = 1; o.push(k); } });
    return o;
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
    var W = 340, H = 220, L = 34, B = 40, T = 12, top = Math.max.apply(null, freq) + 1, n = edges.length - 1;
    var X = function (i) { return L + i / n * (W - L - 14); }, Y = function (v) { return H - B - v / top * (H - B - T); }, s = '';
    for (var v = 0; v <= top; v++) s += '<path d="M' + L + ' ' + Y(v) + 'H' + (W - 14) + '" stroke="#dbe2ea"/>' + txt(L - 6, Y(v) + 5, v, 'end', 13);
    freq.forEach(function (c, i) { s += '<rect x="' + X(i) + '" y="' + Y(c) + '" width="' + (X(1) - X(0)) + '" height="' + (Y(0) - Y(c)) + '" fill="' + BLUE + '" stroke="' + NAVY + '" stroke-width="1.5"/>'; });
    s += '<path d="M' + L + ' ' + Y(0) + 'H' + (W - 14) + 'M' + L + ' ' + Y(0) + 'V' + T + '" stroke="' + INK + '" stroke-width="1.3" fill="none"/>';
    edges.forEach(function (e, i) { s += txt(X(i), Y(0) + 17, e, 'middle', 13); });
    s += txt(W - 14, H - 6, unit || '', 'end', 12) + txt(L - 6, T + 3, '(人)', 'end', 11);
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
        '<div class="sk-q"><span class="ask">' + md(t.q) + '</span></div><div id="dbBody"></div><div class="db-say" id="dbSay"></div>' +
        '<div class="fs-nav"><button type="button" class="fs-btn" data-prev' + (i ? '' : ' disabled') + '>前の問題</button><button type="button" class="fs-btn' + (st.done ? ' primary' : '') + '" data-next>' + (allDone ? '結果を見る' : '次の問題') + '</button></div>';
      el.querySelector('[data-home]').onclick = o.home;
      el.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { i = +b.dataset.go; draw(); }; });
      el.querySelector('[data-prev]').onclick = function () { i--; draw(); window.scrollTo(0, 0); };
      el.querySelector('[data-next]').onclick = function () { if (allDone) finish(); else { i = (i + 1) % tasks.length; draw(); window.scrollTo(0, 0); } };
      t.mount(el.querySelector('#dbBody'), {
        solved: st.done,
        miss: function () { st.miss++; },
        ok: function (say) {
          if (!st.done) { st.done = true; var tab = el.querySelector('[data-go="' + i + '"]'); if (tab) tab.classList.add(st.miss ? 'ng' : 'ok'); el.querySelector('[data-next]').classList.add('primary'); if (S.every(function (s) { return s.done; })) el.querySelector('[data-next]').textContent = '結果を見る'; }
          if (say) el.querySelector('#dbSay').innerHTML = '<div class="sk-ans"><b>正解</b>' + say + '</div>';
        }
      });
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

  // ---- ヒストグラムをかく（柱の高さを押す） ----
  function histTask(edges, freq, unit) {
    return function (body, ctx) {
      var n = freq.length, i = ctx.solved ? n : 0, top = Math.max.apply(null, freq) + 1;
      function draw(bad) {
        var cols = freq.map(function (c, k) {
          var cells = '';
          for (var h = top; h >= 1; h--) cells += '<button type="button" class="db-hc' + (k < i && h <= c ? ' on' : '') + (bad && bad[0] === k && bad[1] === h ? ' ng' : '') + (k === i ? ' now' : '') + '" data-c="' + k + '" data-h="' + h + '"' + (k === i ? '' : ' disabled') + '></button>';
          return '<div class="db-hcol">' + cells + '</div>';
        }).join('');
        var y = ''; for (var h = top; h >= 1; h--) y += '<span>' + h + '</span>';
        body.innerHTML = '<div class="db-hwrap"><div class="db-hy">' + y + '</div><div class="db-hist" style="--n:' + n + '">' + cols + '</div></div>' +
          '<div class="db-hx" style="--n:' + n + '">' + edges.map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div><p class="db-note">' + (i < n ? '色のついた列の、度数の高さを押そう。' : '') + (unit ? '（横：' + unit + '、縦：人）' : '') + '</p>';
        body.querySelectorAll('[data-c]').forEach(function (b) {
          b.onclick = function () { var h = +b.dataset.h, k = +b.dataset.c; if (h === freq[k]) { i++; while (i < n && freq[i] === 0) i++; draw(); if (i >= n) ctx.ok(); } else { ctx.miss(); draw([k, h]); } };
        });
      }
      while (i < n && freq[i] === 0) i++;
      draw();
      if (ctx.solved) ctx.ok();
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
      function draw(bad) {
        var grid = o.grids[g], html = '<div class="db-tw"><table class="db-t">' + grid.map(function (row, ri) {
          return '<tr>' + row.map(function (c) {
            if (c === null) return '<td class="off"></td>';
            if (typeof c === 'object' && c.a !== undefined) return '<td class="fill' + (c === cur ? ' now' : '') + (c.v !== null ? ' ok' : '') + '" data-i="' + o.order.indexOf(c) + '">' + (c.v !== null ? md(c.v) : '') + '</td>';
            var hd = typeof c === 'object' ? c : { t: c };
            return '<' + (hd.h ? 'th' : 'td') + (hd.hl ? ' class="hl"' : '') + '>' + md(String(hd.t)) + '</' + (hd.h ? 'th' : 'td') + '>';
          }).join('') + '</tr>';
        }).join('') + '</table></div>';
        if (o.below) html += '<table class="db-t db-b">' + o.below.map(function (r) { return '<tr><th>' + md(r[0]) + '</th><td class="fill' + (r[1] === cur ? ' now' : '') + (r[1].v !== null ? ' ok' : '') + '" data-i="' + o.order.indexOf(r[1]) + '">' + (r[1].v !== null ? md(r[1].v) : '') + '</td></tr>'; }).join('') + '</table>';
        if (o.grids.length > 1) html += '<div class="sk-ctrl"><button type="button" class="fs-btn" data-flip>表の向きを変える</button></div>';
        html += '<div class="db-cards">' + (cur ? cur.cards.map(function (v, k) { return '<button type="button" class="fs-card' + (bad === v ? ' db-bad' : '') + '" data-k="' + k + '">' + md(v) + '</button>'; }).join('') : '') + '</div>';
        if (cur && cur.hint) html = '<p class="db-note">' + md(cur.hint) + '</p>' + html;
        if (o.pre) html = o.pre + html;
        body.innerHTML = html;
        body.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { var c = o.order[+b.dataset.i]; if (c.v === null) { cur = c; draw(); } }; });
        body.querySelectorAll('[data-k]').forEach(function (b) {
          b.onclick = function () {
            var v = cur.cards[+b.dataset.k];
            if (v === cur.a) { cur.v = v; cur = firstOpen(); draw(); if (!cur) ctx.ok(o.say ? '<p>' + md(o.say) + '</p>' : ''); }
            else { ctx.miss(); draw(v); }
          };
        });
        var fl = body.querySelector('[data-flip]'); if (fl) fl.onclick = function () { g = (g + 1) % o.grids.length; draw(); };
      }
      draw();
      if (ctx.solved) ctx.ok(o.say ? '<p>' + md(o.say) + '</p>' : '');
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
    run: run, sortTask: sortTask, thenPick: thenPick, dotTask: dotTask, histTask: histTask, cell: cell, tableTask: tableTask, hd: hd, termQuiz: termQuiz };
})(window);
