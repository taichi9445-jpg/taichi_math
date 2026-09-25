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
   ========================================================================= */
(function (global) {
  'use strict';

  var W = 360, H = 300;          // 図の基準サイズ（viewBox）
  var PAD = 26;

  /**
   * 放物線 y = a(x-p)² + q（または y = ax² + bx + c）を描く。
   * @param {object} o
   *   a, b, c        … y = ax² + bx + c の係数
   *   xmin,xmax      … 表示する x の範囲（省略時は自動）
   *   domain         … [lo, hi] 定義域を太線で強調する
   *   points         … [{x, y, label}] 目立たせたい点
   *   markVertex     … true なら頂点に印をつける
   */
  function parabola(o) {
    var a = o.a, b = o.b || 0, c = o.c || 0;
    if (!a) a = 1;

    var vx = -b / (2 * a);
    var vy = a * vx * vx + b * vx + c;

    // 表示範囲を決める。頂点が必ず入るようにする。
    var xmin = o.xmin !== undefined ? o.xmin : Math.round(vx) - 5;
    var xmax = o.xmax !== undefined ? o.xmax : Math.round(vx) + 5;
    if (o.domain) {
      xmin = Math.min(xmin, o.domain[0] - 1);
      xmax = Math.max(xmax, o.domain[1] + 1);
    }

    // y の範囲は、その x 範囲で実際にとる値から決める
    var ys = [];
    for (var t = xmin; t <= xmax; t += 0.25) ys.push(a * t * t + b * t + c);
    var ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
    // 0 を必ず含め、少し余裕をもたせる
    ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0);
    var margin = Math.max(1, (ymax - ymin) * 0.15);
    ymin -= margin; ymax += margin;

    var sx = function (x) { return PAD + (x - xmin) / (xmax - xmin) * (W - 2 * PAD); };
    var sy = function (y) { return H - PAD - (y - ymin) / (ymax - ymin) * (H - 2 * PAD); };

    var svg = [];
    svg.push('<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="2次関数のグラフ">');

    // --- 目盛り（整数のところだけ。細かすぎるときは間引く） ---
    var stepX = Math.max(1, Math.ceil((xmax - xmin) / 10));
    for (var gx = Math.ceil(xmin); gx <= xmax; gx += stepX) {
      var X = sx(gx);
      svg.push('<line x1="' + X.toFixed(1) + '" y1="' + PAD + '" x2="' + X.toFixed(1) + '" y2="' + (H - PAD) + '" stroke="#eef2f8" stroke-width="1"/>');
      if (gx !== 0) {
        svg.push('<text x="' + X.toFixed(1) + '" y="' + (sy(0) + 14) + '" font-size="10" fill="#8896aa" text-anchor="middle">' + gx + '</text>');
      }
    }
    var stepY = Math.max(1, Math.ceil((ymax - ymin) / 8));
    for (var gy = Math.ceil(ymin); gy <= ymax; gy += stepY) {
      var Y = sy(gy);
      svg.push('<line x1="' + PAD + '" y1="' + Y.toFixed(1) + '" x2="' + (W - PAD) + '" y2="' + Y.toFixed(1) + '" stroke="#eef2f8" stroke-width="1"/>');
      if (gy !== 0) {
        svg.push('<text x="' + (sx(0) - 6) + '" y="' + (Y + 3.5).toFixed(1) + '" font-size="10" fill="#8896aa" text-anchor="end">' + gy + '</text>');
      }
    }

    // --- 座標軸 ---
    svg.push('<line x1="' + PAD + '" y1="' + sy(0).toFixed(1) + '" x2="' + (W - PAD) + '" y2="' + sy(0).toFixed(1) + '" stroke="#5b6676" stroke-width="1.5"/>');
    svg.push('<line x1="' + sx(0).toFixed(1) + '" y1="' + PAD + '" x2="' + sx(0).toFixed(1) + '" y2="' + (H - PAD) + '" stroke="#5b6676" stroke-width="1.5"/>');
    svg.push('<text x="' + (W - PAD + 8) + '" y="' + (sy(0) + 4).toFixed(1) + '" font-size="12" fill="#5b6676">x</text>');
    svg.push('<text x="' + (sx(0) + 6).toFixed(1) + '" y="' + (PAD - 8) + '" font-size="12" fill="#5b6676">y</text>');
    svg.push('<text x="' + (sx(0) - 6).toFixed(1) + '" y="' + (sy(0) + 14).toFixed(1) + '" font-size="10" fill="#8896aa" text-anchor="end">O</text>');

    // --- 放物線本体（枠の外には描かない） ---
    function pathFor(lo, hi) {
      var d = '', first = true;
      for (var x = lo; x <= hi + 1e-9; x += (hi - lo) / 160) {
        var y = a * x * x + b * x + c;
        if (y < ymin || y > ymax) { first = true; continue; }   // 枠外は描かない
        var px = sx(x).toFixed(1), py = sy(y).toFixed(1);
        d += (first ? 'M ' : 'L ') + px + ' ' + py + ' ';
        first = false;
      }
      return d;
    }

    svg.push('<path d="' + pathFor(xmin, xmax) + '" fill="none" stroke="#2f6fed" stroke-width="2.5"/>');

    // --- 定義域の強調 ---
    if (o.domain) {
      svg.push('<path d="' + pathFor(o.domain[0], o.domain[1]) + '" fill="none" stroke="#e0483c" stroke-width="5" stroke-linecap="round" opacity="0.85"/>');
      [o.domain[0], o.domain[1]].forEach(function (x) {
        var y = a * x * x + b * x + c;
        svg.push('<circle cx="' + sx(x).toFixed(1) + '" cy="' + sy(y).toFixed(1) + '" r="4.5" fill="#e0483c"/>');
      });
    }

    // --- 頂点 ---
    if (o.markVertex) {
      svg.push('<circle cx="' + sx(vx).toFixed(1) + '" cy="' + sy(vy).toFixed(1) + '" r="5" fill="#e79b16"/>');
    }

    // --- 指定された点 ---
    (o.points || []).forEach(function (p) {
      svg.push('<circle cx="' + sx(p.x).toFixed(1) + '" cy="' + sy(p.y).toFixed(1) + '" r="5" fill="#10a05a"/>');
      if (p.label) {
        svg.push('<text x="' + (sx(p.x) + 8).toFixed(1) + '" y="' + (sy(p.y) - 8).toFixed(1) +
          '" font-size="12" fill="#0a6b3c" font-weight="bold">' + p.label + '</text>');
      }
    });

    svg.push('</svg>');
    return svg.join('');
  }

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
      s.push('<text x="' + sx(t).toFixed(1) + '" y="' + (y + 18) + '" font-size="10" fill="#8896aa" text-anchor="middle">' + t + '</text>');
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
