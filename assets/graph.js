/* ===========================================================================
   graph.js  —  2次関数のグラフを SVG で描く
   ---------------------------------------------------------------------------
   元教材のグラフは canvas に手描きで、
     ・軸の目盛りが等間隔に並ばず、0 の右に -8 が来るなど表示が壊れていた
     ・端末の幅が変わると目盛りと線がずれた
     ・放物線が枠外まではみ出して他の要素に重なった
   という問題があった。

   ここでは
     ・座標変換をひとつの関数にまとめ、目盛り・軸・曲線すべてがそれを使う
     ・描く範囲を先に決め、その外に出た部分は描かない（クリップ）
     ・SVG の viewBox で拡大縮小するので、どの画面幅でも崩れない
   という作りにしている。

   【教科書どおりの図にするための追加（2026-09）】
     ・座標軸の先に矢印、x・y・原点 O のラベル（文字は斜体）
     ・放物線を何本も重ねて描ける（extra）
     ・定義域があるとき、定義域の外は細い点線で描く。端点の ● ○ を選べる（domainOpen）
     ・軸 x = p の点線（axisLine）、点から座標軸への破線（points[].guide）、矢印（arrows）
     ・点のラベルは、座標軸・ほかのラベルと重ならない位置をさがして置く
   これまでの呼び出し方（a, b, c, xmin, xmax, domain, points, markVertex）はそのまま使える。
   ========================================================================= */
(function (global) {
  'use strict';

  var W = 360, H = 300;          // 図の基準サイズ（viewBox）
  var PAD = 26;
  var MATH_FONT = "'Times New Roman', serif";
  var uid = 0;                   // 1 ページに図が何枚あっても矢印の id がぶつからないように

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ラベルの文字：式の部分は数式の書体（文字は斜体、数字・記号はまっすぐ）、日本語は普通の書体
  var RUN = /[A-Za-z0-9²³±√≦≧=+\-−·×÷\/.,()' ]*[A-Za-z0-9][A-Za-z0-9²³±√≦≧=+\-−·×÷\/.,()' ]*/g;
  function mathText(s) {
    s = String(s);
    var out = '', last = 0;
    s.replace(RUN, function (run, at) {
      out += esc(s.slice(last, at));
      var body = esc(run.replace(/-/g, '−')).replace(/[A-Za-z]+/g, function (w) { return '<tspan font-style="italic">' + w + '</tspan>'; });
      out += '<tspan font-family="' + MATH_FONT.replace(/"/g, '') + '">' + body + '</tspan>';
      last = at + run.length;
      return run;
    });
    return out + esc(s.slice(last));
  }
  // ラベルの幅のおよその見積もり（半角 0.55 文字ぶん、全角 1 文字ぶん）
  function textWidth(s, size) {
    var w = 0;
    String(s).split('').forEach(function (ch) { w += /[\u0000-ÿ−²]/.test(ch) ? 0.56 : 1; });
    return w * size;
  }

  /**
   * 放物線 y = a(x-p)² + q（または y = ax² + bx + c）を描く。
   * @param {object} o
   *   a, b, c        … y = ax² + bx + c の係数
   *   xmin,xmax      … 表示する x の範囲（省略時は自動）
   *   domain         … [lo, hi] 定義域を太線で強調する（外側は細い点線）
   *   domainOpen     … [false, true] のように、端点をふくまない側を ○ にする
   *   points         … [{x, y, label, color, open, guide}] 目立たせたい点（guide: 座標軸への破線）
   *   markVertex     … true なら頂点に印をつける
   *   extra          … [{a, b, c, dash, color}] いっしょに描く放物線（元のグラフなど）
   *   axisLine       … true なら軸 x = p の点線とラベル
   *   arrows         … [{x1, y1, x2, y2, color}] 点から点への矢印（平行移動など）
   */
  function parabola(o) {
    var a = o.a, b = o.b || 0, c = o.c || 0;
    if (!a) a = 1;
    var id = 'g' + (++uid);

    var vx = -b / (2 * a);
    var vy = a * vx * vx + b * vx + c;

    // 表示範囲を決める。頂点が必ず入るようにする。
    var xmin = o.xmin !== undefined ? o.xmin : Math.round(vx) - 5;
    var xmax = o.xmax !== undefined ? o.xmax : Math.round(vx) + 5;
    if (o.domain) {
      xmin = Math.min(xmin, o.domain[0] - 1);
      xmax = Math.max(xmax, o.domain[1] + 1);
    }
    // y 軸と原点 O がいつも図の中に入るように（端にくっつくと x・y・O の文字が重なる）
    xmin = Math.min(xmin, -1);
    xmax = Math.max(xmax, 1);

    // y の範囲は、その x 範囲で実際にとる値から決める（重ねる放物線は頂点が入るようにする）
    var ys = [];
    for (var t = xmin; t <= xmax; t += 0.25) ys.push(a * t * t + b * t + c);
    ys.push(a * xmax * xmax + b * xmax + c);
    (o.extra || []).forEach(function (e) {
      var ex = -(e.b || 0) / (2 * e.a);
      if (ex >= xmin && ex <= xmax) ys.push(e.a * ex * ex + (e.b || 0) * ex + (e.c || 0));
    });
    (o.points || []).forEach(function (p) { ys.push(p.y); });
    var ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
    // 0 を必ず含め、少し余裕をもたせる
    ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0);
    var margin = Math.max(1, (ymax - ymin) * 0.15);
    ymin -= margin; ymax += margin;

    var sx = function (x) { return PAD + (x - xmin) / (xmax - xmin) * (W - 2 * PAD); };
    var sy = function (y) { return H - PAD - (y - ymin) / (ymax - ymin) * (H - 2 * PAD); };
    var X0 = sx(0), Y0 = sy(0);
    var boxes = [];              // もう置いた文字の場所（重ならないようにするため）

    var svg = [];
    svg.push('<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="2次関数のグラフ">');
    svg.push('<defs>' +
      '<marker id="' + id + '-ax" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,1 L9,5 L0,9 z" fill="#5b6676"/></marker>' +
      '<marker id="' + id + '-mv" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,1 L9,5 L0,9 z" fill="#10a05a"/></marker>' +
      '</defs>');

    // --- 目盛り（整数のところだけ。細かすぎるときは間引く） ---
    var stepX = Math.max(1, Math.ceil((xmax - xmin) / 10));
    for (var gx = Math.ceil(xmin); gx <= xmax; gx += stepX) {
      var X = sx(gx);
      svg.push('<line x1="' + X.toFixed(1) + '" y1="' + PAD + '" x2="' + X.toFixed(1) + '" y2="' + (H - PAD) + '" stroke="#eef2f8" stroke-width="1"/>');
      if (gx !== 0) {
        svg.push('<text x="' + X.toFixed(1) + '" y="' + (Y0 + 14) + '" font-size="10" fill="#8896aa" text-anchor="middle" font-family="' + MATH_FONT + '">' + mathText(gx) + '</text>');
        boxes.push({ x1: X - 8, x2: X + 8, y1: Y0 + 4, y2: Y0 + 16 });
      }
    }
    var stepY = Math.max(1, Math.ceil((ymax - ymin) / 8));
    for (var gy = Math.ceil(ymin); gy <= ymax; gy += stepY) {
      var Y = sy(gy);
      svg.push('<line x1="' + PAD + '" y1="' + Y.toFixed(1) + '" x2="' + (W - PAD) + '" y2="' + Y.toFixed(1) + '" stroke="#eef2f8" stroke-width="1"/>');
      if (gy !== 0) {
        svg.push('<text x="' + (X0 - 6).toFixed(1) + '" y="' + (Y + 3.5).toFixed(1) + '" font-size="10" fill="#8896aa" text-anchor="end" font-family="' + MATH_FONT + '">' + mathText(gy) + '</text>');
        boxes.push({ x1: X0 - 6 - textWidth(gy, 10), x2: X0 - 4, y1: Y - 5, y2: Y + 5 });
      }
    }

    // --- 座標軸（矢印つき）と x・y・O ---
    svg.push('<line x1="' + PAD + '" y1="' + Y0.toFixed(1) + '" x2="' + (W - PAD + 10) + '" y2="' + Y0.toFixed(1) + '" stroke="#5b6676" stroke-width="1.5" marker-end="url(#' + id + '-ax)"/>');
    svg.push('<line x1="' + X0.toFixed(1) + '" y1="' + (H - PAD) + '" x2="' + X0.toFixed(1) + '" y2="' + (PAD - 12) + '" stroke="#5b6676" stroke-width="1.5" marker-end="url(#' + id + '-ax)"/>');
    svg.push('<text x="' + (W - PAD + 6) + '" y="' + (Y0 - 7).toFixed(1) + '" font-size="14" fill="#374151" font-family="' + MATH_FONT + '" font-style="italic">x</text>');
    svg.push('<text x="' + (X0 + 7).toFixed(1) + '" y="' + (PAD - 6) + '" font-size="14" fill="#374151" font-family="' + MATH_FONT + '" font-style="italic">y</text>');
    svg.push('<text x="' + (X0 - 5).toFixed(1) + '" y="' + (Y0 + 14).toFixed(1) + '" font-size="12" fill="#374151" text-anchor="end" font-family="' + MATH_FONT + '" font-style="italic">O</text>');
    boxes.push({ x1: W - PAD + 2, x2: W - PAD + 16, y1: Y0 - 20, y2: Y0 - 2 }, { x1: X0 + 4, x2: X0 + 16, y1: PAD - 20, y2: PAD - 2 },
      { x1: X0 - 16, x2: X0 - 2, y1: Y0 + 2, y2: Y0 + 16 });

    // --- 放物線（枠の外には描かない） ---
    function pathFor(A, B, C, lo, hi) {
      var d = '', first = true;
      for (var x = lo; x <= hi + 1e-9; x += (hi - lo) / 160) {
        var y = A * x * x + B * x + C;
        if (y < ymin || y > ymax) { first = true; continue; }   // 枠外は描かない
        var px = sx(x).toFixed(1), py = sy(y).toFixed(1);
        d += (first ? 'M ' : 'L ') + px + ' ' + py + ' ';
        first = false;
      }
      return d;
    }

    // 重ねる放物線（元のグラフなど）：先に描いて、主役の放物線の下にする
    (o.extra || []).forEach(function (e) {
      svg.push('<path d="' + pathFor(e.a, e.b || 0, e.c || 0, xmin, xmax) + '" fill="none" stroke="' + (e.color || '#94a3b8') + '" stroke-width="2.2"' +
        (e.dash === false ? '' : ' stroke-dasharray="6,5"') + '/>');
    });

    // 軸 x = p（頂点を通る縦の点線）
    if (o.axisLine) {
      var AX = sx(vx);
      svg.push('<line x1="' + AX.toFixed(1) + '" y1="' + PAD + '" x2="' + AX.toFixed(1) + '" y2="' + (H - PAD) + '" stroke="#e79b16" stroke-width="1.3" stroke-dasharray="3,4"/>');
    }

    if (o.domain) {
      // 定義域の外は細い点線、定義域の中は太線
      svg.push('<path d="' + pathFor(a, b, c, xmin, o.domain[0]) + '" fill="none" stroke="#2f6fed" stroke-width="1.6" stroke-dasharray="4,4" opacity="0.8"/>');
      svg.push('<path d="' + pathFor(a, b, c, o.domain[1], xmax) + '" fill="none" stroke="#2f6fed" stroke-width="1.6" stroke-dasharray="4,4" opacity="0.8"/>');
      svg.push('<path d="' + pathFor(a, b, c, o.domain[0], o.domain[1]) + '" fill="none" stroke="#e0483c" stroke-width="4.5" stroke-linecap="round"/>');
      [o.domain[0], o.domain[1]].forEach(function (x, k) {
        var y = a * x * x + b * x + c;
        var open = o.domainOpen && o.domainOpen[k];
        svg.push('<circle cx="' + sx(x).toFixed(1) + '" cy="' + sy(y).toFixed(1) + '" r="4.5" fill="' + (open ? '#fff' : '#e0483c') + '" stroke="#e0483c" stroke-width="2"/>');
      });
    } else {
      svg.push('<path d="' + pathFor(a, b, c, xmin, xmax) + '" fill="none" stroke="#2f6fed" stroke-width="2.5"/>');
    }

    // --- 矢印（頂点の移動など） ---
    (o.arrows || []).forEach(function (r) {
      if (Math.abs(r.x1 - r.x2) + Math.abs(r.y1 - r.y2) < 1e-9) return;
      svg.push('<line x1="' + sx(r.x1).toFixed(1) + '" y1="' + sy(r.y1).toFixed(1) + '" x2="' + sx(r.x2).toFixed(1) + '" y2="' + sy(r.y2).toFixed(1) +
        '" stroke="' + (r.color || '#10a05a') + '" stroke-width="2.5" marker-end="url(#' + id + '-mv)"/>');
    });

    // --- 頂点 ---
    if (o.markVertex) {
      svg.push('<circle cx="' + sx(vx).toFixed(1) + '" cy="' + sy(vy).toFixed(1) + '" r="5" fill="#e79b16"/>');
    }

    // --- 指定された点（座標軸への破線・ラベル） ---
    var labels = [];
    (o.points || []).forEach(function (p) {
      var PX = sx(p.x), PY = sy(p.y);
      if (p.guide) {
        svg.push('<line x1="' + PX.toFixed(1) + '" y1="' + PY.toFixed(1) + '" x2="' + PX.toFixed(1) + '" y2="' + Y0.toFixed(1) + '" stroke="#e0483c" stroke-width="1.5" stroke-dasharray="5,4"/>');
        svg.push('<line x1="' + PX.toFixed(1) + '" y1="' + PY.toFixed(1) + '" x2="' + X0.toFixed(1) + '" y2="' + PY.toFixed(1) + '" stroke="#e0483c" stroke-width="1.5" stroke-dasharray="5,4"/>');
      }
      var col = p.color || '#10a05a';
      svg.push('<circle cx="' + PX.toFixed(1) + '" cy="' + PY.toFixed(1) + '" r="5" fill="' + (p.open ? '#fff' : col) + '" stroke="' + col + '" stroke-width="2"/>');
      if (p.label) labels.push({ PX: PX, PY: PY, text: String(p.label), color: p.labelColor || '#0a6b3c' });
    });
    // 軸 x = p のラベルも、ほかと重ならない位置に置く
    if (o.axisLine) labels.push({ PX: sx(vx), PY: null, text: 'x = ' + fmtNum(vx), color: '#b45309', axis: true });

    // ラベルの置き場所：点の右上・左上・右下・左下…の順に、座標軸・目盛り・ほかのラベルと重ならないところ
    function hit(bx) {
      if (bx.x1 < 2 || bx.x2 > W - 2 || bx.y1 < 2 || bx.y2 > H - 2) return true;
      if (bx.y1 - 2 < Y0 && bx.y2 + 2 > Y0) return true;          // x 軸
      if (bx.x1 - 2 < X0 && bx.x2 + 2 > X0) return true;          // y 軸
      return boxes.some(function (q) { return bx.x1 < q.x2 && q.x1 < bx.x2 && bx.y1 < q.y2 && q.y1 < bx.y2; });
    }
    labels.forEach(function (L) {
      var w = textWidth(L.text, 12), h = 12, cands;
      if (L.axis) {
        cands = [[L.PX + 4, H - PAD - 4], [L.PX - 4 - w, H - PAD - 4], [L.PX + 4, PAD + 12], [L.PX - 4 - w, PAD + 12], [L.PX + 4, H / 2]];
      } else {
        cands = [[8, -8], [-8 - w, -8], [8, 18], [-8 - w, 18], [-w / 2, -12], [-w / 2, 22], [12, 4], [-12 - w, 4]]
          .map(function (d) { return [L.PX + d[0], L.PY + d[1]]; });
      }
      var pick = null;
      for (var i = 0; i < cands.length; i++) {
        var bx = { x1: cands[i][0], x2: cands[i][0] + w, y1: cands[i][1] - h + 2, y2: cands[i][1] + 3 };
        if (!hit(bx)) { pick = cands[i]; boxes.push(bx); break; }
      }
      if (!pick) { pick = cands[0]; boxes.push({ x1: pick[0], x2: pick[0] + w, y1: pick[1] - h + 2, y2: pick[1] + 3 }); }
      svg.push('<text x="' + pick[0].toFixed(1) + '" y="' + pick[1].toFixed(1) + '" font-size="12" fill="' + L.color + '" font-weight="bold" stroke="#fff" stroke-width="3" paint-order="stroke">' + mathText(L.text) + '</text>');
    });

    svg.push('</svg>');
    return svg.join('');
  }

  function fmtNum(n) { n = Math.round(n * 100) / 100; return n < 0 ? '−' + Math.abs(n) : String(n); }

  /** 数直線（不等式の解を示す） */
  function numberLine(o) {
    var lo = o.lo, hi = o.hi;
    var w = 340, h = 74, pad = 24;
    var sx = function (x) { return pad + (x - lo) / (hi - lo) * (w - 2 * pad); };
    var y = 40;
    var s = ['<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="数直線">'];
    s.push('<line x1="' + pad + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '" stroke="#5b6676" stroke-width="1.5"/>');
    for (var t = Math.ceil(lo); t <= hi; t++) {
      s.push('<line x1="' + sx(t).toFixed(1) + '" y1="' + (y - 4) + '" x2="' + sx(t).toFixed(1) + '" y2="' + (y + 4) + '" stroke="#5b6676" stroke-width="1.2"/>');
      s.push('<text x="' + sx(t).toFixed(1) + '" y="' + (y + 18) + '" font-size="10" fill="#8896aa" text-anchor="middle" font-family="' + MATH_FONT + '">' + mathText(t) + '</text>');
    }
    (o.ranges || []).forEach(function (r) {
      var x1 = sx(Math.max(lo, r.from)), x2 = sx(Math.min(hi, r.to));
      s.push('<line x1="' + x1.toFixed(1) + '" y1="' + (y - 12) + '" x2="' + x2.toFixed(1) + '" y2="' + (y - 12) + '" stroke="#2f6fed" stroke-width="5" stroke-linecap="round"/>');
    });
    (o.points || []).forEach(function (p) {
      s.push('<circle cx="' + sx(p.x).toFixed(1) + '" cy="' + (y - 12) + '" r="5" fill="' + (p.filled ? '#2f6fed' : '#fff') + '" stroke="#2f6fed" stroke-width="2"/>');
    });
    s.push('</svg>');
    return s.join('');
  }

  global.Graph = { parabola: parabola, numberLine: numberLine };
})(typeof window !== 'undefined' ? window : globalThis);
