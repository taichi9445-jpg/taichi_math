/* ===========================================================================
   hint-fig.js — sin の値を思い出すためのヒントの図（28 面積の計算で使う）
   ---------------------------------------------------------------------------
     HintFig.trace(30, 'sin')  … 30°・45°・60° の直角三角形と辺の比に、筆記体の s（c・t）をなぞる線
                                 （26 有名角の三角比の値の textbookTrace と同じ形）
     HintFig.semi(120)         … 120°・135°・150°：半径 r の半円の上の点 P と直角三角形
   ========================================================================= */
(function (global) {
  'use strict';
  var RATIO = { 30: ['√3', '1', '2'], 45: ['1', '1', '√2'], 60: ['1', '√3', '2'] };
  var SHAPE = { 30: [Math.sqrt(3), 1], 45: [1, 1], 60: [1, Math.sqrt(3)] };
  var POINT = { 120: ['−1', '√3', '2'], 135: ['−1', '1', '√2'], 150: ['−√3', '1', '2'] };
  var INK = '#1f2328', RED = '#c92a2a', NAVY = '#1f4e8c', GREEN = '#2b8a3e', ORANGE = '#d9480f';

  // 図の中の文字（√ は記号の右上から横線が中の数字にかぶさる。外と中の数字は同じ書体・大きさ）。(x, y) が文字のまん中
  function label(x, y, s, color, fs) {
    color = color || INK; fs = fs || 19;
    var m = String(s).match(/^(−?)(\d*)√(\d+)$/), cw = fs * 0.56, base = y + fs * 0.35;
    if (!m) return '<text x="' + x + '" y="' + base + '" text-anchor="middle" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="' + fs + '" fill="' + color + '">' + s + '</text>';
    var head = m[1] + m[2], hw = head.length * cw, dw = m[3].length * cw, w = hw + fs * 0.75 + dw + 2, x0 = x - w / 2, x1 = x0 + hw + 1;
    return '<text x="' + x0 + '" y="' + base + '" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="' + fs + '" fill="' + color + '">' + head + '</text>' +
      '<path d="M' + x1 + ' ' + (base - fs * 0.3) + 'L' + (x1 + fs * 0.18) + ' ' + (base - fs * 0.4) + 'L' + (x1 + fs * 0.4) + ' ' + (base + 1) + 'L' + (x1 + fs * 0.7) + ' ' + (base - fs * 0.92) + 'H' + (x1 + fs * 0.75 + dw + 2) + '" fill="none" stroke="' + color + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<text x="' + (x1 + fs * 0.75) + '" y="' + base + '" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="' + fs + '" fill="' + color + '">' + m[3] + '</text>';
  }
  function word(x, y, s, color, fs) {
    return '<text x="' + x + '" y="' + (y + (fs || 18) * 0.35) + '" text-anchor="middle" font-family="BIZ UDPGothic, sans-serif" font-size="' + (fs || 18) + '" fill="' + (color || INK) + '">' + s + '</text>';
  }

  // 直角三角形と、筆記体の s・c・t をなぞる線（26 の textbookTrace をもとに、角 A の代わりに角度を書く）
  function trace(deg, fn) {
    var ratio = RATIO[deg], scale = Math.min(178 / SHAPE[deg][0], 130 / SHAPE[deg][1]), w = SHAPE[deg][0] * scale, h = SHAPE[deg][1] * scale;
    var ax = 57, by = 100, cy = by + h, bx = ax + w, path, t = deg * Math.PI / 180;
    if (fn === 'sin') path = 'M' + (ax - 25) + ' ' + (cy - 25) + ' C' + (ax + 15) + ' ' + (cy - 48) + ' ' + (bx - 25) + ' ' + (by - 55) + ' ' + (bx + 23) + ' ' + (by - 64) + ' C' + (bx + 70) + ' ' + (by - 92) + ' ' + (bx + 55) + ' ' + (by - 127) + ' ' + (bx + 31) + ' ' + (by - 101) + ' C' + (bx + 5) + ' ' + (by - 72) + ' ' + (bx + 60) + ' ' + (by - 25) + ' ' + (bx + 65) + ' ' + (by + 15) + ' C' + (bx + 85) + ' ' + (cy + 72) + ' ' + (ax + 93) + ' ' + (cy + 63) + ' ' + (ax + 58) + ' ' + (cy + 40);
    else if (fn === 'cos') path = 'M' + (bx + 24) + ' ' + (by - 24) + ' C' + (bx - 7) + ' ' + (by - 70) + ' ' + (ax + 55) + ' ' + (by - 50) + ' ' + (ax - 16) + ' ' + (cy - 29) + ' C' + (ax - 70) + ' ' + (cy + 58) + ' ' + (ax + 47) + ' ' + (cy + 95) + ' ' + (bx + 15) + ' ' + (cy + 48);
    else path = 'M' + (ax - 18) + ' ' + (cy + 48) + ' C' + (ax + 75) + ' ' + (cy + 76) + ' ' + (bx + 55) + ' ' + (cy + 58) + ' ' + (bx + 76) + ' ' + (cy - 22) + ' L' + (bx + 80) + ' ' + (by + 8) + ' M' + (bx + 76) + ' ' + (cy - 22) + ' C' + (bx + 74) + ' ' + (cy + 35) + ' ' + (bx + 83) + ' ' + (cy + 48) + ' ' + (bx + 105) + ' ' + (cy + 50) + ' M' + (bx + 60) + ' ' + (by + 40) + 'L' + (bx + 102) + ' ' + (by + 40);
    var id = 'hf-' + fn + '-' + deg;
    var s = '<svg class="hf-trace" viewBox="0 -20 360 ' + (cy + 115) + '" role="img" aria-label="' + deg + '度の直角三角形と筆記体の' + fn[0] + '">' +
      '<defs><marker id="' + id + '" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto-start-reverse"><path d="M1 1L6 3.5L1 6" fill="none" stroke="' + RED + '" stroke-width="1.2"/></marker></defs>' +
      '<path d="M' + ax + ' ' + cy + 'L' + bx + ' ' + by + 'V' + cy + 'Z" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + (bx - 11) + ' ' + cy + 'v-11h11" fill="none" stroke="' + INK + '"/>' +
      '<path d="M' + (ax + 26) + ' ' + cy + 'A26 26 0 0 0 ' + (ax + 26 * Math.cos(t)) + ' ' + (cy - 26 * Math.sin(t)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2"/>' +
      label(ax + 46 * Math.cos(t / 2) + 6, cy - 46 * Math.sin(t / 2) + 2, deg + '°', ORANGE, 15) +
      '<g transform="translate(' + ((ax + bx) / 2 - 10) + ',' + ((by + cy) / 2 - 14) + ') rotate(' + (-deg) + ')"><text text-anchor="middle" font-family="BIZ UDPGothic" font-size="20">斜辺</text></g>' +
      label((ax + bx) / 2 + 13, (by + cy) / 2 + 14, ratio[2]) +
      word(bx + 28, (by + cy) / 2 - 12, '対辺', INK, 19) + label(bx + 28, (by + cy) / 2 + 16, ratio[1]) +
      word((ax + bx) / 2 - 16, cy + 22, '底辺', INK, 19) + label((ax + bx) / 2 + 22, cy + 22, ratio[0]) +
      '<path class="hf-line" d="' + path + '" fill="none" stroke="' + RED + '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"' + (fn !== 'tan' ? ' marker-end="url(#' + id + ')"' : '') + '/>';
    if (fn === 'cos') s += '<path d="M' + (bx + 24) + ' ' + (by - 24) + 'l-13 -14" stroke="' + RED + '" stroke-width="2.8" stroke-linecap="round" fill="none" marker-end="url(#' + id + ')"/>';
    else if (fn === 'sin') s += '<path d="M' + (ax - 15) + ' ' + (cy - 30) + 'l22 -14" stroke="' + RED + '" stroke-width="2.8" stroke-linecap="round" fill="none" marker-end="url(#' + id + ')"/>';
    else s += '<path d="M' + (ax - 14) + ' ' + (cy + 49) + 'l22 5" marker-end="url(#' + id + ')" stroke="' + RED + '" stroke-width="2.8" stroke-linecap="round" fill="none"/><path d="M' + (bx + 88) + ' ' + (cy + 48) + 'l17 2" stroke="' + RED + '" stroke-width="2.8" stroke-linecap="round" fill="none" marker-end="url(#' + id + ')"/>';
    return s + '</svg>';
  }

  // 半径 r の半円の上の点 P(x, y) と直角三角形（120°・135°・150°）
  function semi(deg) {
    var pt = POINT[deg], ox = 250, oy = 200, R = 120, t = deg * Math.PI / 180;
    var px = ox + R * Math.cos(t), py = oy - R * Math.sin(t);
    var line = function (x1, y1, x2, y2, c, w) { return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + c + '" stroke-width="' + w + '" fill="none"/>'; };
    var s = '<svg class="hf-semi" viewBox="0 0 440 250" role="img" aria-label="' + deg + '度の半円と点P">' +
      '<path d="M' + (ox - R) + ' ' + oy + 'A' + R + ' ' + R + ' 0 0 1 ' + (ox + R) + ' ' + oy + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>' +
      line(90, oy, 420, oy, INK, 1.4) + line(ox, 236, ox, 50, INK, 1.4) +
      '<path d="M413 196L420 200L413 204M246 57L250 50L254 57" fill="none" stroke="' + INK + '" stroke-width="1.4"/>' +
      '<g font-family="STIX Two Text, serif" font-style="italic" font-size="19" fill="' + INK + '"><text x="414" y="222">x</text><text x="258" y="62">y</text><text x="' + (ox + 8) + '" y="' + (oy + 20) + '">O</text></g>' +
      '<path d="M' + px + ' ' + oy + 'L' + px + ' ' + py + 'L' + ox + ' ' + oy + 'Z" fill="#eef4fb"/>' +
      line(ox, oy, px, py, NAVY, 3) + line(px, py, px, oy, RED, 3) + line(ox, oy, px, oy, GREEN, 3) +
      '<path d="M' + (px + 10) + ' ' + oy + 'v-10h-10" fill="none" stroke="' + INK + '"/>' +
      '<path d="M' + (ox + 26) + ' ' + oy + 'A26 26 0 0 0 ' + (ox + 26 * Math.cos(t)) + ' ' + (oy - 26 * Math.sin(t)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2"/>' +
      label(ox + 30, oy - 40, deg + '°', ORANGE, 15) +
      '<circle cx="' + px + '" cy="' + py + '" r="4" fill="' + INK + '"/>';
    // P(x, y)：点の左上、半円の外に、右端が点のすぐ左にくるように並べる
    var fs = 17, wd = function (v) { var m = String(v).match(/^(−?)(\d*)√(\d+)$/); return m ? (m[1] + m[2]).length * fs * 0.56 + fs * 0.75 + m[3].length * fs * 0.56 + 2 : String(v).length * fs * 0.6; };
    var parts = [['P(', 0], [pt[0], 1], [',', 0], [pt[1], 1], [')', 0]], x = px - 8 - parts.reduce(function (a, q) { return a + wd(q[0]) + 2; }, 0), ly = py - 26;
    parts.forEach(function (q) { var w = wd(q[0]); s += q[1] ? label(x + w / 2, ly, q[0], INK, fs) : word(x + w / 2, ly, q[0], INK, fs); x += w + 2; });
    s += label(px - 22, (py + oy) / 2, pt[1], RED, 18) + label((px + ox) / 2, oy + 20, pt[0].replace('−', ''), GREEN, 18);
    var mx = (px + ox) / 2, my = (py + oy) / 2;
    s += label(mx + 16 * Math.sin(t) + 10, my + 16 * Math.cos(t) - 6, pt[2], NAVY, 18);
    return s + '</svg>';
  }

  global.HintFig = { trace: trace, semi: semi, POINT: POINT };
})(window);
