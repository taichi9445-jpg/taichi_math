/* ===========================================================================
   exam.js — 数学Ⅰ テスト対策（目指せ30点！・目指せ60点！）  2026-11-21 先生の要望
   ---------------------------------------------------------------------------
   ・三角比とデータの分析を、1 問ずつ順に解いていく。「もう一度」で数字が全部かわる（何度でもくり返せる）
   ・すべてカード・選択肢で答える（キーボードは使わない）。選択肢は 6 個前後で、ダミーは半分くらい
   ・使う部品：assets/fill-steps.js（途中式の穴うめ）、sekibun.js、data-bun.js（DB.run・表・ヒストグラム・並べかえ）
   EXAM.start(30) / EXAM.start(60)
   ========================================================================= */
(function (global) {
  'use strict';
  var D = global.DB, md = D.md, f = D.f, rint = Sek.rint, shuffle = Sek.shuffle, pick = Sek.pick;
  var M = '−';
  var uniq = function (a) { return Array.from(new Set(a.map(String))); };
  var range = function (n, fn) { return Array.from({ length: n }, function (_, i) { return fn(i); }); };
  var sgn = function (n) { return n < 0 ? M + Math.abs(n) : String(n); };
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function sqfree(n) { for (var k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false; return true; }
  function rootOf(k) { var r = Math.round(Math.sqrt(k)); return r * r === k ? String(r) : '√' + k; }
  // 分数 n/d（約分して、分母 1 なら整数）。neg で −
  function frac(n, d, neg) { var g = gcd(n, d); n /= g; d /= g; return (neg ? M : '') + (d === 1 ? n : n + '/' + d); }
  var mdFrac = function (v) { var m = String(v).match(/^(−?)([^/]+)\/(.+)$/); return m ? m[1] + '{' + m[2] + '|' + m[3] + '}' : String(v); };
  // 選択肢の「1/2」「−√3/2」は、上下の分数で出す（式や単位つきの文字はそのまま）
  var choiceMd = function (v) { v = String(v); return md(/^−?[^\s/()÷+]+\/[^\s/()÷+]+$/.test(v) ? mdFrac(v) : v); };
  // 答えのカード＋ダミーで、全部で n 枚（答えはそのまま、ダミーは答えと重ならないもの）
  // 足りないときは、答えに近いまちがい（±1、2倍、分母と分子の入れかえ、√ の中を ±1）でうめる
  function nearMiss(v) {
    v = String(v); var out = [], m;
    if (/^−?\d+$/.test(v)) { var k = +v.replace(M, '-'); out = [k + 1, k - 1, k * 2, k + 2].filter(function (x) { return x >= 0; }).map(sgn); }
    else if ((m = v.match(/^(−?)(\d*)√(\d+)$/))) out = [m[1] + m[2] + '√' + (+m[3] + 1), m[1] + (m[2] ? +m[2] + 1 : 2) + '√' + m[3], m[1] + m[3]];
    else if ((m = v.match(/^(−?)([^/]+)\/(.+)$/))) out = [m[1] + m[3] + '/' + m[2], (m[1] ? '' : M) + m[2] + '/' + m[3], m[1] + m[2] + '/' + (/^\d+$/.test(m[3]) ? +m[3] + 1 : m[3] + '2')];
    return out;
  }
  var tidy = function (v) { return String(v).replace(/^(−?)(\d+)\/1$/, '$1$2'); };
  function deck(ans, dummies, n) {
    n = n || 6;
    var a = uniq(ans), ok = function (v) { return v !== null && v !== undefined && v !== '' && !/NaN|undefined|Infinity/.test(String(v)); };
    var d = uniq(dummies.filter(ok).map(tidy)).filter(function (v) { return a.indexOf(v) < 0; });
    if (a.length + d.length < n) a.forEach(function (v) { nearMiss(v).forEach(function (x) { x = tidy(x); if (ok(x) && a.indexOf(x) < 0 && d.indexOf(x) < 0) d.push(x); }); });
    return shuffle(a.concat(d.slice(0, Math.max(0, n - a.length))));
  }

  // ---------- 図：直角三角形 ----------
  // p：VR の長さ、q：RT の長さ（R が直角）。names：{V,R,T} の頂点名、sides：{VR,RT,VT} に書く文字、or：向き（n・x・y・xy）、mark：V に角の印
  function lab(x, y, t, color) {
    t = String(t); color = color || '#1f2328';
    var m = t.match(/^(\d*)√(\d+)$/);
    if (m) {
      var fs = 22, cw = fs * .5, w0 = m[1].length * cw, w = w0 + fs * .75 + m[2].length * cw + 2, x0 = x - w / 2, x1 = x0 + w0 + 1, b = y + 8;
      return (m[1] ? '<text x="' + x0 + '" y="' + b + '" font-family="STIX Two Text, serif" font-size="' + fs + '" fill="' + color + '">' + m[1] + '</text>' : '') +
        '<path d="M' + x1 + ' ' + (b - 7) + 'L' + (x1 + 4) + ' ' + (b - 9) + 'L' + (x1 + 9) + ' ' + (b + 1) + 'L' + (x1 + 15) + ' ' + (b - 19) + 'H' + (x1 + fs * .75 + m[2].length * cw + 2) + '" fill="none" stroke="' + color + '" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<text x="' + (x1 + fs * .75) + '" y="' + b + '" font-family="STIX Two Text, serif" font-size="' + fs + '" fill="' + color + '">' + m[2] + '</text>';
    }
    var it = /^[a-zA-Z]$/.test(t);
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="central" font-family="STIX Two Text, serif" font-size="22"' + (it ? ' font-style="italic"' : '') + ' fill="' + color + '">' + t + '</text>';
  }
  function triPts(o, W, H, pad) {
    var or = o.or || 'n', fx = or === 'x' || or === 'xy', fy = or === 'y' || or === 'xy';
    var Mm = { V: [0, 0], R: [o.p, 0], T: [o.p, o.q] };
    Object.keys(Mm).forEach(function (k) { Mm[k] = [fx ? -Mm[k][0] : Mm[k][0], fy ? -Mm[k][1] : Mm[k][1]]; });
    var xs = [], ys = []; Object.keys(Mm).forEach(function (k) { xs.push(Mm[k][0]); ys.push(Mm[k][1]); });
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs), miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var s = Math.min((W - 2 * pad) / (maxx - minx), (H - 2 * pad) / (maxy - miny));
    var ox = (W - (maxx - minx) * s) / 2, oy = (H - (maxy - miny) * s) / 2, P = {};
    Object.keys(Mm).forEach(function (k) { P[k] = [ox + (Mm[k][0] - minx) * s, oy + (maxy - Mm[k][1]) * s]; });
    return P;
  }
  function rtFig(o) {
    var W = 340, H = 270, P = triPts(o, W, H, 52), f1 = function (v) { return v.toFixed(1); };
    var unit = function (a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
    var G = [(P.V[0] + P.R[0] + P.T[0]) / 3, (P.V[1] + P.R[1] + P.T[1]) / 3];
    var s = '<polygon points="' + ['V', 'R', 'T'].map(function (k) { return f1(P[k][0]) + ',' + f1(P[k][1]); }).join(' ') + '" fill="#f1f6fc" stroke="#1f2328" stroke-width="2" stroke-linejoin="round"/>';
    var u1 = unit(P.R, P.V), u2 = unit(P.R, P.T), m = 13;
    s += '<path d="M' + f1(P.R[0] + u1[0] * m) + ' ' + f1(P.R[1] + u1[1] * m) + 'L' + f1(P.R[0] + (u1[0] + u2[0]) * m) + ' ' + f1(P.R[1] + (u1[1] + u2[1]) * m) + 'L' + f1(P.R[0] + u2[0] * m) + ' ' + f1(P.R[1] + u2[1] * m) + '" fill="none" stroke="#1f2328" stroke-width="1.5"/>';
    var mk = o.mark === true ? 'V' : o.mark;   // 角の印をつける頂点（V か T）
    if (mk) {
      var oth = 'VRT'.replace(mk, '').split(''), a1 = unit(P[mk], P[oth[0]]), a2 = unit(P[mk], P[oth[1]]), r = 24, cr = a1[0] * a2[1] - a1[1] * a2[0];
      s += '<path d="M' + f1(P[mk][0] + a1[0] * r) + ' ' + f1(P[mk][1] + a1[1] * r) + 'A' + r + ' ' + r + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + f1(P[mk][0] + a2[0] * r) + ' ' + f1(P[mk][1] + a2[1] * r) + '" fill="none" stroke="#d9480f" stroke-width="2.4"/>';
    }
    if (o.names) ['V', 'R', 'T'].forEach(function (k) {
      if (!o.names[k]) return;
      var d = unit(G, P[k]);
      s += '<text x="' + f1(P[k][0] + d[0] * 19) + '" y="' + f1(P[k][1] + d[1] * 19) + '" text-anchor="middle" dominant-baseline="central" font-family="STIX Two Text, serif" font-style="italic" font-size="21" fill="' + (mk === k ? '#d9480f' : '#1f2328') + '">' + o.names[k] + '</text>';
    });
    if (o.sides) [['VR', 'V', 'R', 'T'], ['RT', 'R', 'T', 'V'], ['VT', 'V', 'T', 'R']].forEach(function (e) {
      var t = o.sides[e[0]]; if (t === undefined || t === null || t === '') return;
      var A = P[e[1]], B = P[e[2]], C = P[e[3]], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      var n = [-(B[1] - A[1]) / L, (B[0] - A[0]) / L]; if ((C[0] - mx) * n[0] + (C[1] - my) * n[1] > 0) n = [-n[0], -n[1]];
      var tw = String(t).length * 12 + (/√/.test(t) ? 8 : 0), dist = 14 + Math.abs(n[0]) * tw / 2 + Math.abs(n[1]) * 11;
      s += lab(f1(mx + n[0] * dist), f1(my + n[1] * dist), t, (o.colors && o.colors[e[0]]) || '#1f4e8c');
    });
    var Ys = ['V', 'R', 'T'].map(function (k) { return P[k][1]; }), top = Math.max(0, Math.min.apply(null, Ys) - 44), bot = Math.min(H, Math.max.apply(null, Ys) + 44);
    return '<svg class="ex-tri" viewBox="0 ' + f1(top) + ' ' + W + ' ' + f1(bot - top) + '" role="img" aria-label="直角三角形">' + s + '</svg>';
  }

  // ---------- ヒントの図（ボタンを押すと開く） ----------
  function hintBox(html, open, label) {
    return '<details class="ex-hint"' + (open ? ' open' : '') + '><summary>' + (label || 'ヒント') + '</summary><div class="ex-hintbody">' + html + '</div></details>';
  }
  // 図の中の式（「(−1, √3)」のように √ がまじる文字）。x はまん中、anchor：'start'・'middle'・'end'
  function mtext(x, y, str, color, fs, anchor) {
    fs = fs || 19; color = color || '#1f2328';
    var parts = String(str).split(/(\d*√\d+)/).filter(function (p) { return p !== ''; });
    var cw = function (ch) { return /[0-9]/.test(ch) ? .5 : /[A-Z]/.test(ch) ? .66 : /[(),]/.test(ch) ? .33 : ch === ' ' ? .25 : ch === '−' ? .72 : ch === '=' ? .62 : .55; };
    var wOf = function (p) { var m = p.match(/^(\d*)√(\d+)$/); if (m) return (m[1].length * .5 + .75 + m[2].length * .5) * fs + 3; return p.split('').reduce(function (s, ch) { return s + cw(ch) * fs; }, 0); };
    var W = parts.reduce(function (s, p) { return s + wOf(p); }, 0), cx = anchor === 'start' ? x : anchor === 'end' ? x - W : x - W / 2, out = '', b = y + fs * .35;
    parts.forEach(function (p) {
      var m = p.match(/^(\d*)√(\d+)$/), w = wOf(p);
      if (m) {
        var x0 = cx; if (m[1]) { out += '<text x="' + x0.toFixed(1) + '" y="' + b.toFixed(1) + '" font-family="STIX Two Text, serif" font-size="' + fs + '" fill="' + color + '">' + m[1] + '</text>'; x0 += m[1].length * .5 * fs; }
        var x1 = x0 + 1, k = fs / 22;
        out += '<path d="M' + x1.toFixed(1) + ' ' + (b - 7 * k).toFixed(1) + 'L' + (x1 + 4 * k).toFixed(1) + ' ' + (b - 9 * k).toFixed(1) + 'L' + (x1 + 9 * k).toFixed(1) + ' ' + (b + 1 * k).toFixed(1) + 'L' + (x1 + 15 * k).toFixed(1) + ' ' + (b - 19 * k).toFixed(1) + 'H' + (x1 + fs * .75 + m[2].length * .5 * fs + 2).toFixed(1) + '" fill="none" stroke="' + color + '" stroke-width="1.3" stroke-linejoin="round"/>';
        out += '<text x="' + (x1 + fs * .75).toFixed(1) + '" y="' + b.toFixed(1) + '" font-family="STIX Two Text, serif" font-size="' + fs + '" fill="' + color + '">' + m[2] + '</text>';
      } else out += '<text x="' + cx.toFixed(1) + '" y="' + b.toFixed(1) + '" font-family="STIX Two Text, serif" font-size="' + fs + '" fill="' + color + '"' + (/^[A-Za-z]+$/.test(p.trim()) ? ' font-style="italic"' : '') + ' xml:space="preserve">' + p + '</text>';
      cx += w;
    });
    return out;
  }
  var arcPath = function (P, u, v, r, color, wdt) {   // 頂点 P で、向き u から向き v までの角の印
    var cr = u[0] * v[1] - u[1] * v[0];
    return '<path d="M' + (P[0] + u[0] * r).toFixed(1) + ' ' + (P[1] + u[1] * r).toFixed(1) + 'A' + r + ' ' + r + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + (P[0] + v[0] * r).toFixed(1) + ' ' + (P[1] + v[1] * r).toFixed(1) + '" fill="none" stroke="' + (color || '#d9480f') + '" stroke-width="' + (wdt || 2.2) + '"/>';
  };
  var unitV = function (a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  var degText = function (x, y, d, color) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="16" fill="' + (color || '#d9480f') + '">' + d + '°</text>'; };

  // 有名角のヒント：角が左下・直角が右下の直角三角形に、s・c・t の筆記体（書き順の矢印つき）
  var SP_SIDE = { 30: ['√3', '1', '2', [Math.sqrt(3), 1]], 45: ['1', '1', '√2', [1, 1]], 60: ['1', '√3', '2', [1, Math.sqrt(3)]] };   // 底辺・高さ・斜辺
  // 教科書の図にならう：sin は斜辺にそって上へ → B の右上でくるっと → 対辺の外を下へ。cos は B から A をまわって底辺の下へ（大きな c）。tan は底辺の下から、対辺の外を上へ（t）
  function spFig(fn, deg) {
    var t = SP_SIDE[deg], hyp = Math.hypot(t[3][0], t[3][1]), s = 200 / hyp, bw = t[3][0] * s, hh = t[3][1] * s;
    var W = 340, x0 = (W - bw) / 2 - 14, y0 = 70 + hh, V = [x0, y0], R = [x0 + bw, y0], T = [x0 + bw, y0 - hh], f1 = function (v) { return v.toFixed(1); };
    var RED = '#d6336c', hv = unitV(V, T), nh = [hv[1], -hv[0]], mid = [(V[0] + T[0]) / 2, (V[1] + T[1]) / 2];
    var at = function (p, a, b) { return [p[0] + hv[0] * a + nh[0] * b, p[1] + hv[1] * a + nh[1] * b]; };   // p から斜辺の向きに a、外へ b
    var P = function (p) { return f1(p[0]) + ' ' + f1(p[1]); };
    var smooth = function (pts) {   // 点を通るなめらかな線
      var d = 'M' + P(pts[0]);
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += 'C' + P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + P(p2);
      }
      return d;
    };
    var head = function (p, u) { var n = [-u[1], u[0]]; return '<path d="M' + P([p[0] + u[0] * 8, p[1] + u[1] * 8]) + 'L' + P([p[0] - u[0] * 5 + n[0] * 5.5, p[1] - u[1] * 5 + n[1] * 5.5]) + 'L' + P([p[0] - u[0] * 5 - n[0] * 5.5, p[1] - u[1] * 5 - n[1] * 5.5]) + 'z" fill="' + RED + '"/>'; };
    var out = '<defs><marker id="exArw' + fn + deg + '" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + RED + '"/></marker></defs>';
    out += '<polygon points="' + [V, R, T].map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="#f1f6fc" stroke="#1f2328" stroke-width="2" stroke-linejoin="round"/>';
    out += '<path d="M' + f1(R[0] - 13) + ' ' + f1(R[1]) + 'V' + f1(R[1] - 13) + 'H' + f1(R[0]) + '" fill="none" stroke="#1f2328" stroke-width="1.5"/>';
    out += arcPath(V, [1, 0], hv, 28) + degText(V[0] + 48 * Math.cos(deg * Math.PI / 360), V[1] - 48 * Math.sin(deg * Math.PI / 360), deg);
    var d, extra = '';
    if (fn === 'sin') {
      var S1 = at(T, 34, 12), L = function (a, b) { return at(S1, a, b); };
      d = smooth([at(V, -30, 12), at(mid, 0, 12), S1, L(20, 10), L(12, 30), L(-8, 24), L(-10, -8), [R[0] + 30, T[1] + 26], [R[0] + 36, (T[1] + R[1]) / 2 + 8], [R[0] + 24, R[1] + 14], [R[0] - 16, R[1] + 22]]);
      extra = head(at(V, 4, 12), hv);
    } else if (fn === 'cos') {
      d = smooth([[T[0] + 14, T[1] - 4], [T[0] - 2, T[1] - 24], at(T, -24, 30), at(mid, 0, 34), at(V, 8, 30), [V[0] - 20, V[1] + 8], [V[0] + 24, V[1] + 22], [R[0] - 10, R[1] + 20], [R[0] + 18, R[1] + 2]]);
    } else {
      d = 'M' + P([V[0] - 14, V[1] + 15]) + 'L' + P([R[0] + 34, R[1] + 15]);
      extra = head([V[0] + 6, V[1] + 15], [1, 0]) +
        '<path d="' + smooth([[R[0] - 40, R[1] + 15], [R[0] + 6, R[1] + 2], [R[0] + 18, R[1] - 24], [R[0] + 20, (T[1] + R[1]) / 2], [R[0] + 20, T[1] - 26]]) + '" fill="none" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M' + P([R[0] + 2, T[1] + 4]) + 'H' + f1(R[0] + 38) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/>';
    }
    out += '<path d="' + d + '" fill="none" stroke="' + RED + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#exArw' + fn + deg + ')"/>' + extra;
    // 辺の長さ（赤い線より外がわ）
    var hd = fn === 'cos' ? 56 : 34;
    out += lab(f1(V[0] + bw / 2), f1(y0 + 44), t[0], '#1f4e8c') + lab(f1(R[0] + (fn === 'sin' ? 62 : 52)), f1(y0 - hh / 2), t[1], '#1f4e8c') + lab(f1(mid[0] + nh[0] * hd), f1(mid[1] + nh[1] * hd), t[2], '#1f4e8c');
    return '<svg class="ex-tri ex-sp" viewBox="0 ' + f1(T[1] - 64) + ' ' + W + ' ' + f1(hh + 64 + 66) + '" role="img" aria-label="' + deg + '° の直角三角形">' + out + '</svg>' +
      '<p class="ex-hcap">' + md(fn + ' ' + deg + '° = ' + (fn === 'sin' ? '{対辺|斜辺}' : fn === 'cos' ? '{底辺|斜辺}' : '{対辺|底辺}')) + '</p>';
  }

  // 鈍角・0°・90°・180° のヒント：角度に合わせた半径の円（30°・60° の仲間は 2、45° の仲間は √2、0°・90°・180° は 1）
  var OBP = { 120: ['2', [-1, Math.sqrt(3)], '−1, √3'], 135: ['√2', [-1, 1], '−1, 1'], 150: ['2', [-Math.sqrt(3), 1], '−√3, 1'], 0: ['1', [1, 0], '1, 0'], 90: ['1', [0, 1], '0, 1'], 180: ['1', [-1, 0], '−1, 0'] };
  function obFig(deg) {
    var e = OBP[deg], r = Math.hypot(e[1][0], e[1][1]), Rp = 92, k = Rp / r, W = 340, O = [W / 2, 128], f1 = function (v) { return v.toFixed(1); };
    var P = [O[0] + e[1][0] * k, O[1] - e[1][1] * k], H = [P[0], O[1]], out = '';
    out += '<defs><marker id="exAx" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5b6470"/></marker></defs>';
    out += '<circle cx="' + O[0] + '" cy="' + O[1] + '" r="' + Rp + '" fill="none" stroke="#9db6d6" stroke-width="1.6"/>';
    out += '<path d="M' + (O[0] - Rp - 26) + ' ' + O[1] + 'H' + (O[0] + Rp + 30) + '" stroke="#5b6470" stroke-width="1.4" marker-end="url(#exAx)"/><path d="M' + O[0] + ' ' + (O[1] + Rp + 14) + 'V' + (O[1] - Rp - 22) + '" stroke="#5b6470" stroke-width="1.4" marker-end="url(#exAx)"/>';
    out += '<text x="' + (O[0] + Rp + 32) + '" y="' + (O[1] + 16) + '" font-family="STIX Two Text, serif" font-style="italic" font-size="18" fill="#5b6470">x</text><text x="' + (deg === 90 ? O[0] - 20 : O[0] + 8) + '" y="' + (O[1] - Rp - 12) + '" font-family="STIX Two Text, serif" font-style="italic" font-size="18" fill="#5b6470">y</text>';
    out += '<text x="' + (O[0] - 6) + '" y="' + (O[1] + 18) + '" text-anchor="end" font-family="STIX Two Text, serif" font-style="italic" font-size="18" fill="#1f2328">O</text>';
    // 直角三角形（P から x 軸へ下ろす）
    if (Math.abs(e[1][0]) > 1e-9 && Math.abs(e[1][1]) > 1e-9) {
      out += '<polygon points="' + [O, H, P].map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="#f1f6fc" stroke="none"/>';
      out += '<path d="M' + f1(P[0]) + ' ' + f1(P[1]) + 'V' + f1(O[1]) + '" stroke="#1f2328" stroke-width="1.8" stroke-dasharray="5 4"/>';
      var sx = P[0] < O[0] ? 1 : -1;
      out += '<path d="M' + f1(H[0] + sx * 11) + ' ' + f1(H[1]) + 'V' + f1(H[1] - 11) + 'H' + f1(H[0]) + '" fill="none" stroke="#1f2328" stroke-width="1.3"/>';
    }
    out += '<path d="M' + O[0] + ' ' + O[1] + 'L' + f1(P[0]) + ' ' + f1(P[1]) + '" stroke="#1f2328" stroke-width="2.4"/>';
    // 角の印
    var ra = 22;
    if (deg > 0) out += '<path d="M' + (O[0] + ra) + ' ' + O[1] + 'A' + ra + ' ' + ra + ' 0 0 0 ' + f1(O[0] + ra * Math.cos(deg * Math.PI / 180)) + ' ' + f1(O[1] - ra * Math.sin(deg * Math.PI / 180)) + '" fill="none" stroke="#d9480f" stroke-width="2.2"/>' +
      degText(O[0] + (ra + 18) * Math.cos(deg * Math.PI / 360) + (deg === 180 ? 0 : 6), O[1] - (ra + 18) * Math.sin(deg * Math.PI / 360) - (deg === 180 ? 4 : 0), deg);
    // 半径（斜辺）の長さ
    var u = unitV(O, P), n = [u[1], -u[0]];
    if (n[1] > 0 || (Math.abs(n[1]) < 1e-9 && deg === 0)) n = [-n[0], -n[1]];   // x 軸と反対がわ（上）に書く
    if (deg === 90) n = [-1, 0];
    out += lab(f1((O[0] + P[0]) / 2 + n[0] * 18), f1((O[1] + P[1]) / 2 + n[1] * 18), e[0], '#1f4e8c');
    // 点 P と座標
    out += '<circle cx="' + f1(P[0]) + '" cy="' + f1(P[1]) + '" r="4.5" fill="#d9480f"/>';
    var lx = P[0] + u[0] * 14, ly = P[1] + u[1] * 14 - (deg === 0 || deg === 180 ? 16 : 6), anc = u[0] < -.3 ? 'end' : u[0] > .3 ? 'start' : 'middle';
    if (deg === 90) { lx = P[0] + 10; anc = 'start'; ly = P[1] - 14; }
    if (deg === 180) { lx = P[0] - 12; anc = 'start'; ly = P[1] + 26; }
    if (deg > 90 && deg < 180) { lx = P[0] + (deg === 120 ? 28 : 40); anc = 'end'; ly = P[1] - 22; }
    out += mtext(lx, ly, 'P(' + e[2] + ')', '#d9480f', 19, anc);
    return '<svg class="ex-tri ex-ob" viewBox="0 0 ' + W + ' 246" role="img" aria-label="' + deg + '° の点 P">' + out + '</svg>' +
      '<p class="ex-hcap">' + md('sin = {y|r}、cos = {x|r}、tan = {y|x}') + '</p>';
  }

  // 一般の三角形（A を左下、B を右下に置く）。angA・angB：角、side：{ a, b } に書く文字、col：{ a, b } の色
  function sTri(angA, angB, side, col) {
    var A0 = angA * Math.PI / 180, B0 = angB * Math.PI / 180, C0 = Math.PI - A0 - B0, c = Math.sin(C0), b = Math.sin(B0);
    var raw = [[0, 0], [c, 0], [b * Math.cos(A0), b * Math.sin(A0)]], W = 340, pad = 44;
    var xs = raw.map(function (p) { return p[0]; }), ys = raw.map(function (p) { return p[1]; });
    var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs), mxy = Math.max.apply(null, ys);
    var s = Math.min((W - 2 * pad) / (mxx - mnx), 170 / mxy), Hh = mxy * s + 2 * pad;
    var P = raw.map(function (p) { return [pad + (p[0] - mnx) * s, pad + (mxy - p[1]) * s]; }), A = P[0], B = P[1], C = P[2], f1 = function (v) { return v.toFixed(1); };
    var G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    var out = '<polygon points="' + P.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="#f1f6fc" stroke="#1f2328" stroke-width="2" stroke-linejoin="round"/>';
    [[A, B, C, angA], [B, A, C, angB]].forEach(function (e) {
      var u = unitV(e[0], e[1]), v = unitV(e[0], e[2]), m = unitV([0, 0], [u[0] + v[0], u[1] + v[1]]);
      out += arcPath(e[0], u, v, 22) + degText(e[0][0] + m[0] * 44, e[0][1] + m[1] * 44, e[3]);
    });
    [[A, 'A'], [B, 'B'], [C, 'C']].forEach(function (e) { var d = unitV(G, e[0]); out += '<text x="' + f1(e[0][0] + d[0] * 18) + '" y="' + f1(e[0][1] + d[1] * 18) + '" text-anchor="middle" dominant-baseline="central" font-family="STIX Two Text, serif" font-style="italic" font-size="21">' + e[1] + '</text>'; });
    var sideLab = function (U, V, O, txt, color) { if (!txt) return ''; var mx = (U[0] + V[0]) / 2, my = (U[1] + V[1]) / 2, L = Math.hypot(V[0] - U[0], V[1] - U[1]), n = [-(V[1] - U[1]) / L, (V[0] - U[0]) / L]; if ((O[0] - mx) * n[0] + (O[1] - my) * n[1] > 0) n = [-n[0], -n[1]]; var tw = String(txt).length * 12 + (/√/.test(txt) ? 8 : 0), dist = 14 + Math.abs(n[0]) * tw / 2 + Math.abs(n[1]) * 11; return lab(f1(mx + n[0] * dist), f1(my + n[1] * dist), txt, color); };
    out += sideLab(B, C, A, side.a, col.a) + sideLab(C, A, B, side.b, col.b);
    return '<svg class="ex-tri" viewBox="0 0 ' + W + ' ' + f1(Hh) + '" role="img" aria-label="三角形">' + out + '</svg>';
  }

  // ---------- 部品：選ぶ（1問〜何問か続けて） ----------
  // items：[{ q, fig?, ans, wrong:[…], say? }]。正解したら少し待って次へ。最後まで行ったら ctx.ok
  function chooseTask(items, o) {
    o = o || {};
    return function (body, ctx) {
      var k = ctx.solved ? items.length : 0, tried = [], LBL = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'], lock = false, hintOpen = false;
      items.forEach(function (it) { it.ch = it.ch || shuffle([it.ans].concat(it.wrong.slice(0, (it.n || o.n || 6) - 1))); });
      function draw(okNow) {
        if (k >= items.length) { body.innerHTML = (o.pre || '') + (o.done ? '<p class="ex-done">' + md(o.done) + '</p>' : '<p class="ex-clear">ぜんぶ正解！</p>'); return; }
        var it = items[k];
        body.innerHTML = (o.pre || '') + (items.length > 1 && !o.noCount ? '<p class="ex-count">' + (k + 1) + ' / ' + items.length + '</p>' : '') +
          (it.pre || '') + (it.q ? '<p class="ex-ask">' + md(it.q) + '</p>' : '') + (it.fig ? '<div class="ex-figbox">' + it.fig + '</div>' : '') +
          (it.hintFig ? hintBox(it.hintFig, hintOpen) : '') +
          '<div class="sk-opts ex-opts' + (it.ch.length > 4 ? ' six' : '') + (it.ch.some(function (v) { return String(v).length > 14; }) ? ' stack' : '') + '">' + it.ch.map(function (v, j) {
            var bad = tried.indexOf(v) >= 0, good = okNow && v === it.ans;
            return '<button type="button" class="sk-opt' + (bad ? ' ng' : '') + (good ? ' ok' : '') + '" data-k="' + j + '"' + (bad || okNow ? ' disabled' : '') + '><small>' + LBL[j] + '</small><span>' + choiceMd(v) + '</span></button>';
          }).join('') + '</div>' + (tried.length && it.hint ? '<p class="db-note">' + md(it.hint) + '</p>' : '');
        var hb = body.querySelector('details.ex-hint'); if (hb) hb.addEventListener('toggle', function () { hintOpen = hb.open; });
        body.querySelectorAll('[data-k]').forEach(function (b) {
          b.onclick = function () {
            if (lock) return;
            var v = it.ch[+b.dataset.k];
            if (v === it.ans) {
              lock = true; draw(true);
              setTimeout(function () { lock = false; k++; tried = []; draw(); if (k >= items.length) ctx.ok(o.say ? D.paras(o.say) : ''); }, items.length > 1 ? 450 : 250);
            } else { tried.push(v); ctx.miss(); draw(); }
          };
        });
        D.fitAll(body);
      }
      draw();
      if (ctx.solved) ctx.ok(o.say ? D.paras(o.say) : '');
    };
  }

  // ---------- 部品：途中式の穴うめ（fill-steps）。行ごとに 6 枚のカード ----------
  // rows：[{ t, h, cards }]（t の書き方は fill-steps と同じ。[…] が空欄、{a|b} が分数、# ことば、! 公式）
  function fillTask(rows, ans) {
    var fn = function (body, ctx) {
      var box = document.createElement('div'); box.className = 'ex-fs'; body.appendChild(box);
      var fired = false, lastMiss = 0;
      var prob = { q: '', rows: rows.map(function (r) { return { t: r.t, h: r.h }; }), cards: [].concat.apply([], rows.map(function (r) { return r.cards || []; })), ans: ans };
      var api = FillSteps.mount({
        el: box, problems: [prob], fewCards: false,
        hint: function (p, row) { return row.h || ''; },
        before: function (p, st) {
          var b = st.active !== null ? st.active : p.blankOrder.filter(function (i) { return st.fill[i] === undefined; })[0];
          if (b !== undefined && b !== null) p.cards = (rows[p.blanks[b].row].cards || []).map(function (v) { return { v: String(v) }; });
        },
        after: function (root, p, st) {
          if (st.miss > lastMiss) { for (var i = lastMiss; i < st.miss; i++) ctx.miss(); lastMiss = st.miss; }
          if (!fired && (st.done || st.shown)) { fired = true; if (st.shown && !st.done) ctx.miss(); ctx.ok('<p>' + md(ans) + '</p>'); }
        }
      });
      if (ctx.solved && api) { var s = api.state()[0]; s.shown = true; api.go(0); }
    };
    fn.rows = rows; fn.ans = ans;   // 確かめ用
    return fn;
  }

  // ---------- 部品：図の □ に数のカードを入れる（B を左下に動かした三角形） ----------
  function slotTask(figOpt, answer, chips, say) {
    return function (body, ctx) {
      var keys = Object.keys(answer), got = {}, picked = null, done = !!ctx.solved;
      if (done) keys.forEach(function (k) { got[k] = answer[k]; });
      body.innerHTML = '<div class="ex-slotfig">' + rtFig(figOpt) + keys.map(function (k) { return '<button type="button" class="ex-slot" data-key="' + k + '"></button>'; }).join('') + '</div>' +
        '<p class="db-note">カードを □ にドラッグ（カードを押してから □ を押しても入る）</p>' +
        '<div class="ex-chips">' + chips.map(function (v) { return '<button type="button" class="fs-card ex-chip" data-v="' + v + '">' + md(v) + '</button>'; }).join('') + '</div>' +
        '<div class="sk-ctrl"><button type="button" class="fs-btn primary ex-check" disabled>答え合わせ</button></div><div class="ex-msg"></div>';
      body.__ans = answer;   // 確かめ用
      var fig = body.querySelector('.ex-slotfig'), slots = [].slice.call(fig.querySelectorAll('.ex-slot')), cs = [].slice.call(body.querySelectorAll('.ex-chip')), chk = body.querySelector('.ex-check');
      function paint() {
        slots.forEach(function (s) { var v = got[s.dataset.key]; s.innerHTML = v ? md(v) : ''; s.classList.toggle('filled', !!v); });
        cs.forEach(function (c) { c.classList.toggle('sel', c.dataset.v === picked); c.disabled = done; });
        chk.disabled = done || !keys.every(function (k) { return got[k]; });
      }
      function put(s, v) { if (done) return; got[s.dataset.key] = v; slots.forEach(function (x) { x.classList.remove('ok', 'ng'); }); paint(); }
      slots.forEach(function (s) { s.onclick = function () { if (done) return; if (picked) { put(s, picked); picked = null; paint(); } else if (got[s.dataset.key]) { got[s.dataset.key] = ''; paint(); } }; });
      cs.forEach(function (c) {
        c.onclick = function (e) { if (e.detail === 0 && !done) { picked = picked === c.dataset.v ? null : c.dataset.v; paint(); } };
        c.addEventListener('pointerdown', function (e) {
          if (done || e.button > 0) return; e.preventDefault();
          var sx = e.clientX, sy = e.clientY, ghost = null, over = null;
          function mv(ev) {
            if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
            if (!ghost) { ghost = c.cloneNode(true); ghost.classList.add('ex-ghost'); document.body.appendChild(ghost); }
            ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px';
            var t = document.elementFromPoint(ev.clientX, ev.clientY), s = t && t.closest('.ex-slot'), nx = s && fig.contains(s) ? s : null;
            if (over && over !== nx) over.classList.remove('over'); over = nx; if (over) over.classList.add('over');
          }
          function up() {
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
            if (!ghost) { picked = picked === c.dataset.v ? null : c.dataset.v; paint(); return; }
            ghost.remove(); if (over) { over.classList.remove('over'); put(over, c.dataset.v); picked = null; paint(); }
          }
          window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
        });
      });
      chk.onclick = function () {
        var all = true;
        slots.forEach(function (s) { var ok = got[s.dataset.key] === answer[s.dataset.key]; s.classList.add(ok ? 'ok' : 'ng'); if (!ok) all = false; });
        if (all) { done = true; paint(); slots.forEach(function (s) { s.classList.add('ok'); }); body.querySelector('.ex-msg').innerHTML = ''; chk.hidden = true; body.classList.add('ex-sdone'); ctx.ok(say ? D.paras(say) : ''); }
        else { ctx.miss(); body.querySelector('.ex-msg').innerHTML = '<p class="db-note ex-ng">赤い枠の □ を直そう。動かしても、辺の長さは変わらない。</p>'; }
      };
      function place() {
        var svg = fig.querySelector('svg'), poly = svg && svg.querySelector('polygon'); if (!poly || !fig.offsetWidth) return;
        var pts = poly.getAttribute('points').trim().split(/\s+/).map(function (p) { return p.split(',').map(Number); }), P = { V: pts[0], R: pts[1], T: pts[2] };
        var vb = svg.viewBox.baseVal, rc = svg.getBoundingClientRect(), fr = fig.getBoundingClientRect(), k = rc.width / vb.width;
        var px = function (p) { return [rc.left - fr.left + (p[0] - vb.x) * k, rc.top - fr.top + (p[1] - vb.y) * k]; };
        // 頂点の文字（A・B・C）と □ が重ならないように、重なるときは辺から少しずつ遠ざける
        var busy = [].slice.call(svg.querySelectorAll('text')).map(function (t) { var r = t.getBoundingClientRect(); return [r.left - fr.left - 3, r.top - fr.top - 3, r.right - fr.left + 3, r.bottom - fr.top + 3]; });
        var hit = function (a) { return busy.some(function (b) { return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]; }); };
        slots.forEach(function (el) {
          var a = el.dataset.key[0], b = el.dataset.key[1], c = 'VRT'.replace(a, '').replace(b, ''), A = px(P[a]), B = px(P[b]), C = px(P[c]);
          var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, n = [-(B[1] - A[1]) / L, (B[0] - A[0]) / L];
          if ((C[0] - mx) * n[0] + (C[1] - my) * n[1] > 0) n = [-n[0], -n[1]];
          var w = el.offsetWidth, h = el.offsetHeight, dist = Math.abs(n[0]) * w / 2 + Math.abs(n[1]) * h / 2 + 7, x, y;
          for (var g = 0; g < 30; g++) { x = mx + n[0] * dist - w / 2; y = my + n[1] * dist - h / 2; if (!hit([x, y, x + w, y + h])) break; dist += 4; }
          el.style.left = x + 'px'; el.style.top = y + 'px';
          busy.push([x, y, x + w, y + h]);
        });
        var tb = slots.map(function (e) { return [parseFloat(e.style.top), parseFloat(e.style.top) + e.offsetHeight]; });
        fig.style.marginTop = Math.max(4, -Math.min.apply(null, tb.map(function (t) { return t[0]; })) + 6) + 'px';
        fig.style.marginBottom = Math.max(8, Math.max.apply(null, tb.map(function (t) { return t[1]; })) - fig.clientHeight + 10) + 'px';
      }
      paint(); place();
      if (global.ResizeObserver) new ResizeObserver(place).observe(fig);
      if (done) { chk.hidden = true; body.classList.add('ex-sdone'); ctx.ok(say ? D.paras(say) : ''); }
    };
  }

  // ---------- 部品：続きの問題を、同じ大問の下へ順に出していく ----------
  // parts：[{ head?, mount, note? }]。1 つできたら、その下に次の問題を出す（そこまでスクロール）
  //   note：その問題の解説を、その場に小さく残す。最後の問題の解説が「正解」の欄に出る
  function seqTask(parts) {
    var fn = function (body, ctx) {
      body.innerHTML = '';
      function open(i) {
        var p = parts[i], box = document.createElement('section'), inner = document.createElement('div'), fired = false;
        box.className = 'ex-part' + (i ? ' next' : '');
        if (p.head) box.innerHTML = '<p class="ex-ph">' + md(p.head) + '</p>';
        box.appendChild(inner); body.appendChild(box);
        p.mount(inner, {
          solved: ctx.solved, miss: ctx.miss,
          ok: function (say) {
            if (fired) return; fired = true;
            if (i === parts.length - 1) { ctx.ok(say || '<p>よくできました！</p>'); return; }
            if (say && p.note) box.insertAdjacentHTML('beforeend', '<div class="ex-psay">' + say + '</div>');
            var nx = open(i + 1);
            if (!ctx.solved) setTimeout(function () { try { nx.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { nx.scrollIntoView(); } }, 380);
          }
        });
        return box;
      }
      open(0);
    };
    fn.parts = parts;   // 確かめ用
    return fn;
  }

  // ---------- 部品：ヒストグラムをかく（1 本の柱を、右上から左下への斜線でぬる） ----------
  function histTask(edges, freq, unit) {
    return function (body, ctx) {
      var n = freq.length, i = ctx.solved ? n : 0, top = Math.max.apply(null, freq) + 1;
      var W = 340, H = 250, L = 36, R = 14, B = 34, T = 14;
      var X = function (k) { return L + k / n * (W - L - R); }, Y = function (v) { return H - B - v / top * (H - B - T); }, f1 = function (v) { return v.toFixed(1); };
      function draw(bad) {
        var s = '<defs><pattern id="exHatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" stroke="#1f4e8c" stroke-width="1.3"/></pattern></defs>';
        if (i < n) s += '<rect x="' + f1(X(i)) + '" y="' + f1(Y(top)) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(0) - Y(top)) + '" fill="#fff1db"/>';
        for (var v = 0; v <= top; v++) s += '<path d="M' + L + ' ' + f1(Y(v)) + 'H' + (W - R) + '" stroke="#dbe2ea"/><text x="' + (L - 7) + '" y="' + f1(Y(v) + 5) + '" text-anchor="end" font-family="STIX Two Text, serif" font-size="14" fill="#1f2328">' + v + '</text>';
        freq.forEach(function (c, k) { if (k < i) s += '<rect x="' + f1(X(k)) + '" y="' + f1(Y(c)) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(0) - Y(c)) + '" fill="url(#exHatch)" stroke="#1f4e8c" stroke-width="2"/>'; });
        if (bad) s += '<rect x="' + f1(X(bad[0])) + '" y="' + f1(Y(bad[1])) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(0) - Y(bad[1])) + '" fill="#ffc9c9" fill-opacity=".7" stroke="#c92a2a" stroke-width="1.5"/>';
        s += '<path d="M' + L + ' ' + f1(Y(0)) + 'H' + (W - R) + 'M' + L + ' ' + f1(Y(0)) + 'V' + T + '" stroke="#1f2328" stroke-width="1.4" fill="none"/>';
        edges.forEach(function (e, k) { s += '<text x="' + f1(X(k)) + '" y="' + f1(Y(0) + 19) + '" text-anchor="middle" font-family="STIX Two Text, serif" font-size="14" fill="#1f2328">' + f(e) + '</text>'; });
        if (i < n) for (var h = 1; h <= top; h++) s += '<rect class="ex-hc" data-h="' + h + '" x="' + f1(X(i)) + '" y="' + f1(Y(h)) + '" width="' + f1(X(1) - X(0)) + '" height="' + f1(Y(h - 1) - Y(h)) + '" fill="#1f4e8c" fill-opacity="0"/>';
        body.innerHTML = '<div class="ex-hist"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="ヒストグラム">' + s + '</svg></div>' +
          '<p class="db-note">' + (i < n ? 'オレンジの列で、度数の高さを押そう。' : '') + '（横：' + unit + '、縦：人）</p>';
        body.querySelectorAll('.ex-hc').forEach(function (r) {
          r.addEventListener('click', function () {
            var h = +r.getAttribute('data-h');
            if (h === freq[i]) { i++; draw(); if (i >= n) ctx.ok(''); } else { ctx.miss(); draw([i, h]); }
          });
        });
      }
      draw();
      if (ctx.solved) ctx.ok('');
    };
  }

  // =====================================================================
  // 問題をつくる（呼ぶたびに数字がかわる）
  // =====================================================================
  var ORS = ['n', 'x', 'y', 'xy'];

  // ---- 1 三平方の定理の式を選ぶ ----
  //   30 点：直角はいつも右下（C）で、斜辺は c。60 点：直角の位置（右下・左下・右上・左上）も文字もランダム
  function pythFormula(level) {
    var easy = level < 60, AB = shuffle(['A', 'B']);
    var L = easy ? [AB[0], 'C', AB[1]] : shuffle(['A', 'B', 'C']), names = { V: L[0], R: L[1], T: L[2] }, lo = function (c) { return c.toLowerCase(); };
    var h = lo(names.R), l1 = lo(names.V), l2 = lo(names.T);   // RT は V の向かい、VR は T の向かい、VT は R の向かい（斜辺）
    var sides = { RT: l1, VR: l2, VT: h };
    var t = pick([[3, 4], [4, 3], [5, 12], [8, 6]]), legs = shuffle([l1, l2]);
    if (easy) legs = [l1, l2].sort();   // a² + b² = c² の形
    var ans = legs[0] + '² + ' + legs[1] + '² = ' + h + '²';
    return {
      q: '【三平方の定理】<br>直角三角形 ABC で成り立つ式を選びなさい。',
      sub: '<div class="ex-figbox">' + rtFig({ p: t[0], q: t[1], names: names, sides: sides, or: easy ? 'n' : pick(ORS) }) + '</div>',
      mount: chooseTask([{ q: '', ans: ans, wrong: [l1 + '² + ' + h + '² = ' + l2 + '²', l2 + '² + ' + h + '² = ' + l1 + '²', legs[0] + ' + ' + legs[1] + ' = ' + h], hint: '直角と向かい合う辺（斜辺）はどれかな？ 斜辺の2乗が、ほかの2辺の2乗の和になるよ。' }],
        { n: 4, say: '直角は ' + names.R + '。直角と向かい合う辺 ' + h + ' が斜辺なので、' + ans + '。' })
    };
  }

  // ---- 2 三平方の定理で x を求める ----
  function pythSolve(level) {
    var c, rt = Math.random() < .35, unk = Math.random() < .55 ? 'leg' : 'hyp';
    if (!rt) { c = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]); c = Math.random() < .5 ? [c[1], c[0], c[2]] : c; }
    else if (unk === 'hyp') { var l = pick([[1, 2], [2, 3], [1, 3], [2, 5], [3, 5], [1, 4]]); c = shuffle(l).concat([null]); }
    else { var g = pick([[3, 2], [4, 3], [4, 1], [5, 2], [6, 5], [3, 1.5]].filter(function (x) { return x[1] % 1 === 0 && sqfree(x[0] * x[0] - x[1] * x[1]); })); c = [null, g[1], g[0]]; }
    var p, q, r, rows, ans, xKey;
    if (unk === 'hyp') {
      p = c[0]; q = c[1]; var d = p * p + q * q; r = rootOf(d); ans = 'x = ' + r;
      xKey = 'VT';
      rows = [
        { t: '[' + p + '@s]² + [' + q + '@s]² = [x]²', h: '斜辺 x の2乗が、ほかの2辺の2乗の和。', cards: deck([p, q, 'x'], [p * p, q * q, p + q, 2 * p, 2 * q]) },
        { t: '[' + p * p + '@t] + [' + q * q + '@t] = x²', h: '2乗を計算しよう。', cards: deck([p * p, q * q], [2 * p, 2 * q, p + q, (p + q) * (p + q), p * q]) },
        { t: 'x² = [' + d + ']', h: 'たし算をしよう。', cards: deck([d], [(p + q) * (p + q), Math.abs(q * q - p * p), d + 1, d - 1, 2 * (p + q)]) },
        { t: '#x > 0 なので' },
        { t: 'x = [' + r + ']', h: '2乗して ' + d + ' になる正の数は？', cards: deck([r], [d, 2 * d, d / 2, '√' + (d + 1), rootOf(d - 1) === r ? null : '√' + (d - 1), Math.round(Math.sqrt(d)) + 1]) }
      ];
      // 図の形：直角をはさむ2辺の長さ
      var fig = { p: p, q: q, sides: { VR: p, RT: q, VT: 'x' } };
    } else {
      q = c[1]; r = c[2]; var d2 = r * r - q * q, xv = rootOf(d2); ans = 'x = ' + xv;
      xKey = 'VR';
      rows = [
        { t: '[x@s]² + [' + q + '@s]² = [' + r + ']²', h: '斜辺（直角と向かい合う辺）は ' + r + '。斜辺の2乗が、ほかの2辺の2乗の和。', cards: deck(['x', q, r], [q * q, r * r, r - q, q + r]) },
        { t: 'x² + [' + q * q + '] = [' + r * r + ']', h: '2乗を計算しよう。', cards: deck([q * q, r * r], [2 * q, 2 * r, q + r, r * r - q * q]) },
        { t: 'x² = [' + r * r + '] − [' + q * q + ']', h: q * q + ' を右に移項しよう。移項すると符号がかわるよ。', cards: deck([r * r, q * q], [r * r + q * q, 2 * r, 2 * q, r - q]) },
        { t: 'x² = [' + d2 + ']', h: 'ひき算をしよう。', cards: deck([d2], [r * r + q * q, (r - q) * (r - q), 2 * (r - q), d2 + 1, d2 - 1]) },
        { t: '#x > 0 なので' },
        { t: 'x = [' + xv + ']', h: '2乗して ' + d2 + ' になる正の数は？', cards: deck([xv], [d2, 2 * d2, d2 / 2, '√' + (d2 + 1), Math.round(Math.sqrt(d2)) + 1, r - q]) }
      ];
      var sx = Math.sqrt(d2), sw = Math.random() < .5;
      var fig = sw ? { p: q, q: sx, sides: { VR: q, RT: 'x', VT: r } } : { p: sx, q: q, sides: { VR: 'x', RT: q, VT: r } };
    }
    fig.or = level < 60 ? 'n' : pick(ORS);   // 30 点：直角はいつも右下
    fig.colors = {}; fig.colors[Object.keys(fig.sides).filter(function (k) { return fig.sides[k] === 'x'; })[0]] = '#d9480f';
    // ヒント：同じ形・同じ向きの三角形に、頂点 A・B・C と a・b・c、三平方の定理の式
    var hint = '<div class="ex-figbox">' + rtFig({ p: fig.p, q: fig.q, or: fig.or, names: { V: 'B', R: 'C', T: 'A' }, sides: { VR: 'a', RT: 'b', VT: 'c' }, colors: { VT: '#d9480f' } }) + '</div>' +
      '<p class="ex-hcap">' + md('a² + b² = c²') + '<br><small>斜辺 c は、直角と向かい合う辺</small></p>';
    return { q: '【三平方の定理】<br>図の x の値を求めなさい。', sub: '<div class="ex-figbox">' + rtFig(fig) + '</div>' + hintBox(hint, false, 'ヒント（公式の図）'), mount: fillTask(rows, ans) };
  }

  // ---- 3 sin A・cos A・tan A ----
  var TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
  function trigA() {
    var t = pick(TRI), legs = Math.random() < .5 ? [t[0], t[1]] : [t[1], t[0]], b = legs[0], a = legs[1], c = t[2];   // b = AC（となり）、a = BC（向かい）
    var dm = function (x) { return [x === a ? b : a, a + b, c + 1, 2 * x, c - a].filter(function (v) { return v > 0; }); };
    var rows = [
      { t: 'sin A = {[' + a + ']|[' + c + ']}', h: 'sin A = {対辺|斜辺}。A と向かい合う辺が対辺、直角と向かい合う辺が斜辺。', cards: deck([a, c], dm(a)) },
      { t: 'cos A = {[' + b + ']|[' + c + ']}', h: 'cos A = {底辺|斜辺}。A のとなりの辺（斜辺でないほう）が底辺。', cards: deck([b, c], dm(b)) },
      { t: 'tan A = {[' + a + ']|[' + b + ']}', h: 'tan A = {対辺|底辺}。', cards: deck([a, b], dm(a).concat([c])) }
    ];
    return {
      q: '【三角比】<br>直角三角形 ABC で、sin A、cos A、tan A の値を求めなさい。',
      sub: '<div class="ex-figbox">' + rtFig({ p: b, q: a, names: { V: 'A', R: 'C', T: 'B' }, sides: { VR: b, RT: a, VT: c }, mark: true }) + '</div>',
      mount: fillTask(rows, 'sin A = {' + a + '|' + c + '}、cos A = {' + b + '|' + c + '}、tan A = {' + a + '|' + b + '}')
    };
  }

  // ---- 4 角 B を左下に動かしてから、sin B・cos B・tan B（約分がいる） ----
  function trigBPair() {
    var base = pick([[3, 4, 5, 2], [3, 4, 5, 3], [3, 4, 5, 4], [5, 12, 13, 2], [3, 4, 5, 5]]), k = base[3];
    var legs = Math.random() < .5 ? [base[0], base[1]] : [base[1], base[0]];
    var BC = legs[0] * k, CA = legs[1] * k, AB = base[2] * k;   // B のとなり BC、B の向かい CA
    // もとの図：B が左下にこない向き
    var orig = pick([
      { names: { V: 'A', R: 'C', T: 'B' }, or: pick(ORS), p: CA, q: BC, sides: { VR: CA, RT: BC, VT: AB } },
      { names: { V: 'B', R: 'C', T: 'A' }, or: pick(['x', 'y', 'xy']), p: BC, q: CA, sides: { VR: BC, RT: CA, VT: AB } }
    ]);
    var moved = { names: { V: 'B', R: 'C', T: 'A' }, or: 'n', p: BC, q: CA, mark: true };
    var chips = shuffle(uniq([BC, CA, AB, legs[0], legs[1], base[2]]).concat([]));
    if (chips.length < 6) chips = shuffle(uniq(chips.concat([AB + k, BC + CA])).slice(0, 6));
    var mv = Object.assign({}, moved, { sides: { VR: BC, RT: CA, VT: AB } });
    var s = frac(CA, AB), c = frac(BC, AB), t = frac(CA, BC);
    var slot = slotTask(moved, { VR: String(BC), RT: String(CA), VT: String(AB) }, chips.map(String), '');
    var rows = [
      { t: 'sin B = {[' + CA + ']|[' + AB + ']} = [' + s + ']', h: 'sin B = {対辺|斜辺}。分数は約分して答えよう。', cards: deck([CA, AB, s], [BC, frac(AB, CA), frac(BC, AB)]) },
      { t: 'cos B = {[' + BC + ']|[' + AB + ']} = [' + c + ']', h: 'cos B = {底辺|斜辺}。約分しよう。', cards: deck([BC, AB, c], [CA, frac(AB, BC), frac(CA, AB)]) },
      { t: 'tan B = {[' + CA + ']|[' + BC + ']} = [' + t + ']', h: 'tan B = {対辺|底辺}。約分しよう。', cards: deck([CA, BC, t], [AB, frac(BC, CA), frac(CA, AB)]) }
    ];
    var fill = fillTask(rows, 'sin B = ' + mdFrac(s) + '、cos B = ' + mdFrac(c) + '、tan B = ' + mdFrac(t));
    return {
      q: '【三角比】<br>直角三角形 ABC を、角 B が左下、直角 C が右下になるように動かした。',
      sub: '<div class="ex-figbox">' + rtFig(Object.assign({}, orig, { mark: orig.names.V === 'B' ? 'V' : 'T' })) + '</div>',
      mount: seqTask([
        { head: '(1) 辺の長さを □ に入れなさい。', mount: slot },
        { head: '(2) sin B、cos B、tan B の値を求めなさい。', mount: fill }
      ])
    };
  }

  // ---- 5 30°・45°・60° の三角比（9 問、順番はまぜる） ----
  var VAL = { sin: { 30: '1/2', 45: '1/√2', 60: '√3/2' }, cos: { 30: '√3/2', 45: '1/√2', 60: '1/2' }, tan: { 30: '1/√3', 45: '1', 60: '√3' } };
  var SPECIAL_HINT = { 30: '30° の直角三角形の辺の比は 1 : √3 : 2（30° と向かい合う辺が 1）。', 45: '45° の直角三角形の辺の比は 1 : 1 : √2。', 60: '60° の直角三角形の辺の比は 1 : √3 : 2（60° と向かい合う辺が √3）。' };
  function special9() {
    var six = ['1/2', '√3/2', '1/√2', '1/√3', '√3', '1'], items = [];
    ['sin', 'cos', 'tan'].forEach(function (fn) { [30, 45, 60].forEach(function (d) { items.push({ q: fn + ' ' + d + '°', ans: VAL[fn][d], wrong: six.filter(function (v) { return v !== VAL[fn][d]; }), hint: SPECIAL_HINT[d], hintFig: spFig(fn, d) }); }); });
    return { q: '【有名角の三角比】<br>次の三角比の値を選びなさい。', mount: chooseTask(shuffle(items), { say: 'sin・cos・tan と 30°・45°・60° の 9 つ、全部答えられたね！' }) };
  }

  // ---- 6 データ（6 個の小テストの得点）：平均値 → 中央値 → 最頻値 を 1 つの大問で ----
  function dataSet() {
    for (;;) {
      var mode = rint(3, 8), data = [mode, mode], used = {}; used[mode] = 1;
      while (data.length < 6) { var v = rint(2, 10); if (used[v]) continue; used[v] = 1; data.push(v); }
      var sum = D.sum(data), med = D.median(data), mean = sum / 6;
      if (sum % 3 === 0 && med !== mode && mean !== mode && mean !== med) return { data: shuffle(data), mode: mode };
    }
  }
  function dataTask(level, g) {
    g = g || dataSet();
    var u = ' 点', d = g.data, so = D.sorted(d), sum = D.sum(d), mean = sum / 6, med = D.median(d), mn = so[0], mx = so[5];
    var dis = uniq(d).map(Number), plus = function (a) { return '(' + a.join('+') + ')'; };
    // 式は 4 択。数 1 つだけのちがいのような細かいまちがい探しはしない（考え方のちがいだけ）
    //   中央値の式（まん中 2 つの平均）、最小値と最大値のまん中、2 でわる
    var meanF = uniq(['(' + so[2] + '+' + so[3] + ')÷2', '(' + mn + '+' + mx + ')÷2', plus(d) + '÷2']).filter(function (v) { return v !== plus(d) + '÷6'; });
    var mean1 = chooseTask([
      { q: '平均値を求める式を選びなさい。', ans: plus(d) + '÷6', wrong: meanF, n: 4, hint: '平均値 = (データの合計) ÷ (データの個数)' },
      { pre: '<p class="ex-memo">' + md('平均値 = (' + d.join(' + ') + ') ÷ 6') + '</p>', q: '平均値を選びなさい。', ans: f(mean) + u, wrong: D.near(mean, [sum / 5, (mn + mx) / 2, med, mean + 0.5], 5).map(function (v) { return v + u; }), hint: '合計を 6 でわろう。' }
    ], { n: 6, noCount: true, done: '平均値 = (' + d.join(' + ') + ') ÷ 6 = ' + f(mean) + '（点）' });
    // 2026-11-24 先生の要望（データの分析 32・34 にそろえる）：小さい順に並べたら、そのすぐ下で 中央値 → 最頻値（60 点はさらに四分位数・最小値・最大値）と続けて答える。
    //   並べた行はかならず横 1 列。中央値・四分位数の位置に ∨（間）や ○（その数）の印、最頻値に色が残る
    var hl = []; so.forEach(function (v, i) { if (v === g.mode) hl.push(i); });
    var modeW = uniq([f(med), f(mean), mx, mn, g.mode + 1, g.mode - 1, 2].map(function (v) { return v + u; })).filter(function (v) { return v !== g.mode + u; });
    var steps = [
      { q: '中央値を選びなさい。', ans: f(med) + u, wrong: D.near(med, [so[2], so[3], mean, (mn + mx) / 2], 5).map(function (v) { return v + u; }), memo: '中央値 ' + f(med) + u, mark: { at: 2.5, lab: '中央値' }, hint: 'データは 6 個（偶数）なので、3 番目と 4 番目の平均。' },
      { q: '最頻値を選びなさい。', ans: g.mode + u, wrong: shuffle(modeW), memo: '最頻値 ' + g.mode + u, mark: { hl: hl }, hint: 'いちばん多く出てくる値をさがそう。' }
    ];
    var say = ['データは 6 個（偶数）なので、中央値は 3 番目と 4 番目の平均。(' + so[2] + ' + ' + so[3] + ') ÷ 2 = ' + f(med) + '（点）', g.mode + ' が 2 回でいちばん多いので、最頻値は ' + g.mode + '（点）'];
    var parts = [
      { head: '(1) 平均値', mount: mean1 },
      { head: '(2) データを小さい順に並べて、中央値と最頻値' + (level >= 60 ? '、四分位数' : '') + 'を求めなさい。', mount: null, note: true }
    ];
    if (level >= 60) {   // 60 点：最頻値のあとに 第1・第3四分位数 → 最小値・最大値、そのあと箱ひげ図
      var bp = boxParts(so, med, mean);
      steps = steps.concat(bp.steps);
      say.push('第1四分位数 ' + so[1] + '、第3四分位数 ' + so[4] + '、最小値 ' + mn + '、最大値 ' + mx + '（点）');
      parts.push({ head: '(3) 箱ひげ図', mount: bp.box });
    }
    parts[1].mount = D.sortSteps(d, steps, { n: 6, say: say });
    return {
      q: '【データの代表値' + (level >= 60 ? 'と箱ひげ図' : '') + '】<br>以下のデータは、6 人の小テスト（10 点満点）の得点である。<br>' +
        (level >= 60 ? '代表値と四分位数を求め、箱ひげ図を選びなさい。' : '平均値・中央値・最頻値を求めなさい。'), sub: D.line(d),
      mount: seqTask(parts)
    };
  }

  // ---- 60 点：第1四分位数・第3四分位数・最小値・最大値（並べた行の続き）→ 正しい箱ひげ図を 4 択 ----
  //   6 個のデータ（小さい順に so[0]〜so[5]）。下半分 so[0..2] の中央値が第1四分位数 so[1]、上半分 so[3..5] の中央値が第3四分位数 so[4]
  function boxParts(so, med, mean) {
    var u = ' 点', q1 = so[1], q3 = so[4], mn = so[0], mx = so[5];
    var pool = uniq(so.concat([med, so[2], so[3], (so[0] + so[1]) / 2, (so[4] + so[5]) / 2]).map(function (v) { return f(v); }));
    var opts = function (ans, extra) { return shuffle(uniq(extra.map(function (v) { return f(v); }).concat(shuffle(pool))).filter(function (v) { return v !== f(ans); })).slice(0, 5).map(function (v) { return v + u; }); };
    var steps = [
      { q: '第1四分位数を選びなさい。', ans: f(q1) + u, wrong: opts(q1, [(so[0] + so[1]) / 2, so[2], mn]), memo: '第1四分位数 ' + q1 + u, mark: { at: 1, lab: 'Q₁' }, tint: [0, 2], hint: '色のついた前半 3 個の中央値が第1四分位数。' },
      { q: '第3四分位数を選びなさい。', ans: f(q3) + u, wrong: opts(q3, [(so[4] + so[5]) / 2, so[3], mx]), memo: '第3四分位数 ' + q3 + u, mark: { at: 4, lab: 'Q₃' }, tint: [3, 5], hint: '色のついた後半 3 個の中央値が第3四分位数。' },
      { q: '最小値を選びなさい。', ans: f(mn) + u, wrong: opts(mn, [mx, q1]), memo: '最小値 ' + mn + u, hint: 'いちばん小さい値。' },
      { q: '最大値を選びなさい。', ans: f(mx) + u, wrong: opts(mx, [mn, q3]), memo: '最大値 ' + mx + u, hint: 'いちばん大きい値。' }
    ];
    // 箱ひげ図：正しい 1 つ ＋ よくあるまちがい 3 つ
    var five = [mn, q1, med, q3, mx], key = function (a) { return a.map(function (v) { return f(v); }).join(','); };
    var okFive = function (a) { for (var i = 0; i < 4; i++) if (a[i] > a[i + 1]) return false; return a[0] >= 0 && a[4] <= 10; };
    var cands = [[mn, so[2], med, so[3], mx], [mn, q1, mean, q3, mx], [mn, (so[0] + so[1]) / 2, med, (so[4] + so[5]) / 2, mx], [mn, q1, so[2], q3, mx],
      [mn, q1, med + 1, q3, mx], [mn, q1 - 1, med, q3 + 1, mx], [mn + 1, q1, med, q3, mx - 1], [mn, q1 + 1, med, q3 - 1, mx]];
    var seen = {}, wrongs = []; seen[key(five)] = 1;
    cands.forEach(function (c) { if (wrongs.length < 3 && okFive(c) && !seen[key(c)]) { seen[key(c)] = 1; wrongs.push(c); } });
    var fig = function (a) { return D.boxPlot(a, 0, 10, 1); };
    var box = D.chain([{ q: '正しい箱ひげ図を選びなさい。', ans: fig(five), wrong: wrongs.map(fig), memo: '箱ひげ図', memoHTML: fig(five), hint: '左から 最小値・第1四分位数・中央値・第3四分位数・最大値 の順。箱の中の線が中央値。' }],
      { say: '' });
    return { steps: steps, box: box };
  }

  // ---- 7 度数分布表 → ヒストグラム（1 つの大問で） ----
  var SCENE2 = [{ name: '10 人の通学時間', unit: '分', w: 5, k: 4, lo: 0 }, { name: '10 人のハンドボール投げの記録', unit: 'm', w: 5, k: 4, lo: 10 }, { name: '10 人の 1 日のスマホの使用時間', unit: '時間', w: 1, k: 4, lo: 0 }, { name: '10 人のテストの得点', unit: '点', w: 10, k: 4, lo: 60 }];
  function freqTask() {
    var s = pick(SCENE2), fr;
    do { fr = range(s.k, function () { return rint(1, 5); }); } while (D.sum(fr) !== 10);   // 度数 0 の階級は作らない
    var edges = range(s.k + 1, function (i) { return s.lo + i * s.w; }), data = [];
    fr.forEach(function (c, i) { for (var j = 0; j < c; j++) data.push(s.w === 1 ? +(edges[i] + rint(0, 9) / 10).toFixed(1) : rint(edges[i], edges[i + 1] - 1)); });
    data = D.sorted(data);
    var un = s.unit === 'm' ? 'ｍ' : s.unit, cls = function (i) { return edges[i] + ' 以上 ' + edges[i + 1] + ' 未満'; }, mid = function (i) { return f((edges[i] + edges[i + 1]) / 2); };
    var cells = fr.map(function (v) { return D.cell(v, ['0', '1', '2', '3', '4', '5']); }), tot = D.cell(10, ['8', '9', '10', '11', '12', '20']);
    tot.hint = '度数の合計は、データの個数と同じ';
    var grid = [[D.hd('階級（' + un + '）'), D.hd('階級値（' + un + '）'), D.hd('度数（人）')]].concat(fr.map(function (_, i) { return [cls(i), mid(i), cells[i]]; }), [['計', null, tot]]);
    return {
      q: '【度数分布表とヒストグラム】<br>以下のデータは、' + s.name + '（' + un + '）である。<br>度数分布表を完成させ、ヒストグラムをかきなさい。', sub: D.line(data),
      mount: seqTask([
        { head: '(1) 度数分布表', mount: D.tableTask({ grids: [grid], order: cells.concat([tot]), say: '' }) },
        { head: '(2) ヒストグラム', mount: histTask(edges, fr, un) }
      ])
    };
  }

  // =====================================================================
  // 60 点コース
  // =====================================================================
  // ---- 相互関係（acute：0°〜90°、obtuse：90°〜180°） ----
  function soukan(obtuse) {
    // 2 乗する数は小さく（分母は 5 まで。15/17 のような 2 けたは使わない）
    var ints = [[3, 5], [4, 5]], roots = [[2, 3], [1, 4], [3, 4]];
    var gfn, n, d, useRoot = Math.random() < .5;
    if (useRoot) { var r = pick(roots); gfn = 'cos'; n = r[0]; d = r[1]; }
    else { var r2 = pick(ints); gfn = obtuse && Math.random() < .5 ? 'cos' : pick(['sin', 'cos']); n = r2[0]; d = r2[1]; }
    var ofn = gfn === 'sin' ? 'cos' : 'sin', k = d * d - n * n, om = rootOf(k), d2 = d * d;
    var negOf = function (fn) { return obtuse && fn === 'cos'; };
    var gv = (negOf(gfn) ? M : '') + n + '/' + d, ov = (negOf(ofn) ? M : '') + om + '/' + d;
    var sn = gfn === 'sin' ? String(n) : om, cn = gfn === 'cos' ? n : +om;   // sin・cos の分子（cos の分子はいつも整数）
    var tneg = obtuse, tv = /√/.test(sn) ? (tneg ? M : '') + sn + (cn === 1 ? '' : '/' + cn) : frac(+sn, cn, tneg);
    var rng = obtuse ? '90° < A < 180°' : '0° < A < 90°', sign = ofn + ' A ' + (negOf(ofn) ? '<' : '>') + ' 0', badSign = ofn + ' A ' + (negOf(ofn) ? '>' : '<') + ' 0';
    var put = gfn === 'cos' ? 'sin²A + ([' + gv + '])² = 1' : '([' + gv + '])² + cos²A = 1';
    var sq = gfn === 'cos' ? 'sin²A + [' + n * n + '/' + d2 + '] = 1' : '[' + n * n + '/' + d2 + '] + cos²A = 1';
    var paren = function (v) { return /^−/.test(v) ? '([' + v + '])' : '[' + v + ']'; };
    var sv = gfn === 'sin' ? gv : ov, cvv = gfn === 'cos' ? gv : ov, rec = (negOf('cos') ? M : '') + d + (cn === 1 ? '' : '/' + cn);
    if (cn === 1) rec = (negOf('cos') ? M : '') + d;
    var rows = [
      { t: '![sin²A@s] + [cos²A@s] = [1]', h: '三角比の相互関係の式から始めます。', cards: deck(['sin²A', 'cos²A', '1'], ['tan²A', '2', '0']) },
      { t: put, h: gfn + ' A = ' + mdFrac(gv) + ' を代入します。', cards: deck([gv], [(negOf(gfn) ? '' : M) + n + '/' + d, d + '/' + n, n + '/' + d2, n * n + '/' + d]) },
      { t: sq, h: '( )² を計算します。分子と分母を、それぞれ2乗します。', cards: deck([n * n + '/' + d2], [n * n + '/' + d, 2 * n + '/' + 2 * d, M + n * n + '/' + d2, n + '/' + d2]) },
      { t: ofn + '²A = [1] − [' + n * n + '/' + d2 + ']', h: '左の分数を右へ移項します。移項すると符号が変わります。', cards: deck(['1', n * n + '/' + d2], ['0', n * n + '/' + d, k + '/' + d2, '2']) },
      { t: ofn + '²A = [' + k + '/' + d2 + ']', h: '1 = {' + d2 + '|' + d2 + '} として、ひき算をします。', cards: deck([k + '/' + d2], [(d2 + n * n) + '/' + d2, (d - n) + '/' + d2, k + '/' + d, n * n + '/' + d2]) },
      { t: '#' + rng + ' より [' + sign + '] なので', h: obtuse ? '90° < A < 180° では、sin A は正、cos A は負。' : '0° < A < 90° では、sin A も cos A も正。', cards: deck([sign], [badSign, ofn + ' A = 0', gfn + ' A ' + (negOf(ofn) ? '<' : '>') + ' 0']) },
      { t: ofn + ' A = ' + (negOf(ofn) ? M : '') + '{√' + k + '|√' + d2 + '} = [' + ov + ']', h: '分子と分母、それぞれの √ をとります。√' + d2 + ' = ' + d + '。', cards: deck([ov], [(negOf(ofn) ? '' : M) + om + '/' + d, om + '/' + d2, k + '/' + d, '√' + k + '/' + d2]) },
      { t: '!tan A = {[sin A]|[cos A]}', h: '三角比の相互関係の、tan A の式です。', cards: deck(['sin A', 'cos A'], ['tan A', '1', 'sin²A', 'cos²A']) },
      { t: 'tan A = ' + paren(sv) + ' ÷ ' + paren(cvv), h: 'sin A と cos A の値を、それぞれ代入します。', cards: deck([sv, cvv], [d + '/' + n, (negOf('cos') ? '' : M) + cn + '/' + d, sn + '/' + cn]) },
      { t: 'tan A = ' + mdFrac(sv) + ' × ' + paren(rec) + ' = [' + tv + ']', h: '分数でわるときは、わる数の逆数をかけます。', cards: deck([rec, tv], [(negOf('cos') ? M : '') + cn + '/' + d, (tneg ? '' : M) + tv.replace(/^−/, ''), cn + '/' + sn.replace('√', '√'), sn + '/' + d]) }
    ];
    var ans = ofn + ' A = ' + mdFrac(ov) + '、tan A = ' + mdFrac(tv);
    return {
      q: '【三角比の相互関係】<br>' + rng + ' で、' + gfn + ' A = ' + mdFrac(gv) + ' のとき、' + ofn + ' A と tan A の値を求めなさい。',
      mount: fillTask(rows, ans)
    };
  }

  // ---- 三角形の面積 S = ½ bc sin A ----
  var SINV = { 30: '1/2', 150: '1/2', 60: '√3/2', 120: '√3/2', 45: '1/√2', 135: '1/√2' };
  function area() {
    var deg = pick([30, 45, 60]), b, c;   // 鋭角だけ
    do { b = rint(2, 10); c = rint(2, 10); } while ((b * c) % 4 !== 0 || b === c);
    var P = b * c / 2, sv = SINV[deg], ans, rows;
    rows = [
      { t: 'S = {1|2} × [' + c + '@s] × [' + b + '@s] × sin [' + deg + ']°', h: '2 つの辺 AB・AC と、その間の角 A を使います。', cards: deck([c, b, deg], [b + c, b * c, 90 - deg, 90]) },
      { t: 'S = [' + P + '] × sin ' + deg + '°', h: '{1|2} × ' + c + ' × ' + b + ' を計算します。', cards: deck([P], [b * c, P / 2, b + c, 2 * P]) },
      { t: '#sin ' + deg + '° = [' + sv + '] より', h: deg > 90 ? 'sin(180° − θ) = sin θ。sin ' + deg + '° = sin ' + (180 - deg) + '°。' : deg + '° の直角三角形の辺の比を思い出そう。', cards: deck([sv], ['1/2', '√3/2', '1/√2', M + sv, '1']) }
    ];
    if (deg === 30 || deg === 150) { ans = String(P / 2); rows.push({ t: 'S = ' + P + ' × {1|2} = [' + ans + ']', h: P + ' ÷ 2 を計算します。', cards: deck([ans], [P, P * 2, ans + '√3', ans + '√2']) }); }
    else if (deg === 60 || deg === 120) { ans = (P / 2 === 1 ? '' : P / 2) + '√3'; rows.push({ t: 'S = ' + P + ' × {√3|2} = [' + ans + ']', h: P + ' ÷ 2 に √3 をつけます。', cards: deck([ans], [P + '√3', P / 2, (P / 2) + '√2', P * 2 + '√3']) }); }
    else { ans = (P / 2 === 1 ? '' : P / 2) + '√2'; rows.push({ t: 'S = ' + P + ' × {1|√2} = [' + P + '/√2]', h: P + ' を √2 でわります。', cards: deck([P + '/√2'], [P + '√2', P / 2, (P / 2) + '/√2', P + '/2']) },
      { t: '#分母を有理化して' }, { t: 'S = {' + P + ' × √2|√2 × √2} = [' + ans + ']', h: '{' + P + '√2|2} を約分します。', cards: deck([ans], [P + '√2', P / 2, (P / 2) + '√3', P * 2 + '√2']) }); }
    var fig = '<div class="ex-figbox">' + gTri(deg, c, b) + '</div>';
    return { q: '【三角形の面積】<br>△ABC で、AB = ' + c + '、AC = ' + b + '、A = ' + deg + '° のとき、面積 S を求めなさい。', sub: fig, mount: fillTask(rows, 'S = ' + ans) };
  }
  // 一般の三角形（A の角と、AB・AC の長さ）
  function gTri(deg, ab, ac) {
    var t = deg * Math.PI / 180, raw = [[0, 0], [ab, 0], [ac * Math.cos(t), ac * Math.sin(t)]];
    var xs = raw.map(function (p) { return p[0]; }), ys = raw.map(function (p) { return p[1]; }), W = 340, pad = 40;
    var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs), mny = Math.min.apply(null, ys), mxy = Math.max.apply(null, ys);
    var s = Math.min((W - 2 * pad) / (mxx - mnx), 170 / (mxy - mny)), H = (mxy - mny) * s + 2 * pad + 10;
    var P = raw.map(function (p) { return [pad + (p[0] - mnx) * s, pad + (mxy - p[1]) * s]; }), A = P[0], B = P[1], C = P[2];
    var G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], f1 = function (v) { return v.toFixed(1); };
    var out = '<polygon points="' + P.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="#f1f6fc" stroke="#1f2328" stroke-width="2"/>';
    var r = deg > 100 ? 16 : 24; out += '<path d="M' + f1(A[0] + r) + ' ' + f1(A[1]) + 'A' + r + ' ' + r + ' 0 0 0 ' + f1(A[0] + r * Math.cos(t)) + ' ' + f1(A[1] - r * Math.sin(t)) + '" fill="none" stroke="#d9480f" stroke-width="2.2"/>';
    var mid = t / 2, rr = deg > 100 ? 34 : 48; out += '<text x="' + f1(A[0] + rr * Math.cos(mid)) + '" y="' + f1(A[1] - rr * Math.sin(mid)) + '" text-anchor="middle" dominant-baseline="central" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="16" fill="#d9480f">' + deg + '°</text>';
    [[A, 'A'], [B, 'B'], [C, 'C']].forEach(function (e) { var dx = e[0][0] - G[0], dy = e[0][1] - G[1], L = Math.hypot(dx, dy); out += '<text x="' + f1(e[0][0] + dx / L * 18) + '" y="' + f1(e[0][1] + dy / L * 18) + '" text-anchor="middle" dominant-baseline="central" font-family="STIX Two Text, serif" font-style="italic" font-size="21">' + e[1] + '</text>'; });
    var side = function (U, V, O, txt) { var mx = (U[0] + V[0]) / 2, my = (U[1] + V[1]) / 2, L = Math.hypot(V[0] - U[0], V[1] - U[1]), n = [-(V[1] - U[1]) / L, (V[0] - U[0]) / L]; if ((O[0] - mx) * n[0] + (O[1] - my) * n[1] > 0) n = [-n[0], -n[1]]; return lab(f1(mx + n[0] * 18), f1(my + n[1] * 18), txt, '#1f4e8c'); };
    out += side(A, B, C, ab) + side(A, C, B, ac);
    return '<svg class="ex-tri" viewBox="0 0 ' + W + ' ' + f1(H) + '" role="img" aria-label="三角形">' + out + '</svg>';
  }

  // ---- 正弦定理（辺の長さを求める。使う角は 30°・45°・60° の鋭角だけ） ----
  //   sin30° : sin45° : sin60° = 1 : √2 : √3 なので、辺は k、k√2、k√3 の形になる（k は 2〜5）
  var SV = { 30: '1/2', 45: '1/√2', 60: '√3/2' }, SREC = { 30: '2', 45: '√2', 60: '2/√3' }, SR = { 30: 1, 45: 2, 60: 3 };
  function sineRule() {
    var ang = shuffle([30, 45, 60]).slice(0, 2), P = ang[0], Q = ang[1], k = rint(2, 5);
    var kr = function (r) { return r === 1 ? String(k) : k + '√' + r; };
    var s1 = kr(SR[P]), s2 = kr(SR[Q]), findB = Math.random() < .6;
    var X = findB ? 'a' : 'b', Y = findB ? 'b' : 'a', PX = X.toUpperCase(), QY = Y.toUpperCase();
    var other = function (v) { return [k, k + '√2', k + '√3', 2 * k].map(String).filter(function (x) { return x !== v; }); };
    var rows = [
      { t: '{[' + s1 + ']|sin [' + P + ']°} = {' + Y + '|sin [' + Q + ']°}', h: '正弦定理 {a|sin A} = {b|sin B} に、わかっている辺と角を入れます。', cards: deck([s1, P, Q], [180 - P - Q, 90, other(s1)[0]]) },
      { t: '#sin ' + P + '° = [' + SV[P] + ']、sin ' + Q + '° = [' + SV[Q] + '] より', h: '30°・45°・60° の直角三角形の辺の比を思い出そう。', cards: deck([SV[P], SV[Q]], ['1/2', '√3/2', '1/√2', '√3', '2/√3', '1/√3']) },
      { t: Y + ' = ' + s1 + ' ÷ [' + SV[P] + '] × [' + SV[Q] + ']', h: '両辺に sin ' + Q + '° をかけると、' + Y + ' = ' + s1 + ' ÷ sin ' + P + '° × sin ' + Q + '°。', cards: deck([SV[P], SV[Q]], ['1/2', '√3/2', '1/√2', '2', '√2', '2/√3']) },
      { t: Y + ' = ' + s1 + ' × [' + SREC[P] + '] × ' + mdFrac(SV[Q]), h: '分数でわるときは、わる数の逆数をかけます。', cards: deck([SREC[P]], [SV[P], '2', '√2', '2/√3', '√3/2', '1/2']) },
      { t: Y + ' = [' + s2 + ']', h: '√ どうしをかけたり、約分したりして計算します。', cards: deck([s2], other(s2).concat([s1, k + '√6'])) }
    ];
    var side = {}, col = {}; side[X] = s1; side[Y] = Y; col[X] = '#1f4e8c'; col[Y] = '#d9480f';
    var angA = PX === 'A' ? P : Q, angB = PX === 'B' ? P : Q;
    return {
      q: '【正弦定理】<br>△ABC で、' + X + ' = ' + s1 + '、' + PX + ' = ' + P + '°、' + QY + ' = ' + Q + '° のとき、' + Y + ' を求めなさい。',
      sub: '<div class="ex-figbox">' + sTri(angA, angB, side, col) + '</div>',
      mount: fillTask(rows, Y + ' = ' + s2), _chk: { s1: s1, s2: s2, P: P, Q: Q, k: k }
    };
  }

  // ---- 鈍角と 0°・90°・180° の三角比（18 問、順番はまぜる） ----
  var OB = { 120: ['√3/2', '−1/2', '−√3'], 135: ['1/√2', '−1/√2', '−1'], 150: ['1/2', '−√3/2', '−1/√3'], 0: ['0', '1', '0'], 90: ['1', '0', 'なし'], 180: ['0', '−1', '0'] };
  var OB_HINT = { 120: '120° は 180° − 60°。半径 2 の円で P(−1, √3)。', 135: '135° は 180° − 45°。半径 √2 の円で P(−1, 1)。', 150: '150° は 180° − 30°。半径 2 の円で P(−√3, 1)。', 0: '0° のとき、半径 1 の円で P(1, 0)。', 90: '90° のとき、P(0, 1)。tan は x = 0 でわることになるので…？', 180: '180° のとき、P(−1, 0)。' };
  var OBFIG = {};
  function obtuse18() {
    var pool = ['1/2', '√3/2', '1/√2', '−1/2', '−√3/2', '−1/√2', '√3', '−√3', '1/√3', '−1/√3', '1', '−1', '0', 'なし'];
    var make = function (degs) {
      var items = [];
      ['sin', 'cos', 'tan'].forEach(function (fn, j) {
        degs.forEach(function (d) {
          var a = OB[d][j], flip = a === '0' || a === 'なし' ? null : a[0] === '−' ? a.slice(1) : M + a;
          var w = shuffle(pool.filter(function (v) { return v !== a && v !== flip; })).slice(0, flip ? 4 : 5);
          items.push({ q: fn + ' ' + d + '°', ans: a, wrong: (flip ? [flip] : []).concat(w), hint: OB_HINT[d], hintFig: OBFIG[d] || (OBFIG[d] = obFig(d)) });
        });
      });
      return shuffle(items);
    };
    // 前半 9 問は 120°・135°・150°、後半 9 問は 0°・90°・180°（それぞれの中で順番はまぜる）
    return { q: '【鈍角と 0°・90°・180° の三角比】<br>次の三角比の値を選びなさい。', mount: chooseTask(make([120, 135, 150]).concat(make([0, 90, 180])), { say: '鈍角では cos と tan が負になるね。0°・90°・180° は点 P の座標で考えよう。' }) };
  }

  // ---- 分散と標準偏差（8 個のデータ） ----
  function varTask() {
    var dev, V, ss, N = 6;
    for (;;) {
      dev = range(N - 1, function () { return rint(-3, 3); }); var last = -D.sum(dev);
      if (Math.abs(last) > 3) continue;
      dev.push(last); ss = D.sum(dev.map(function (x) { return x * x; }));
      if (ss % N !== 0) continue; V = ss / N;
      if ([1, 2, 3, 4, 5, 6].indexOf(V) >= 0 && dev.filter(function (x) { return x === 0; }).length <= 1) break;
    }
    var m = rint(4, 7), x = dev.map(function (d) { return m + d; }), S = D.sum(x), unit = '点';
    var sumC = D.cell(S, uniq([S, S + 1, S - 1, S + 2, S - 10, m]).slice(0, 6)), meanC = D.cell(m, uniq([m, m + 1, m - 1, m + 2, Math.round(S / 5), S]).slice(0, 6));
    sumC.hint = 'データの合計を計算しよう。'; meanC.hint = '平均値 = 合計 ÷ 6';
    var dC = dev.map(function (d, i) { var c = D.cell(sgn(d), uniq([d, -d, d + 1, d - 1, x[i], 0]).map(Number).sort(function (a, b) { return a - b; }).map(sgn).slice(0, 6)); c.hint = '偏差 = データの値 − 平均値（' + x[i] + ' − ' + m + '）'; return c; });
    var sC = dev.map(function (d) { var c = D.cell(d * d, uniq([d * d, Math.abs(2 * d), Math.abs(d), d * d + 1, 0, 9, 4, 1]).map(Number).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; }).slice(0, 6)); if (c.cards.indexOf(String(d * d)) < 0) c.cards[0] = String(d * d); c.hint = '偏差を 2 乗しよう（負の数の 2 乗は正）'; return c; });
    var ssC = D.cell(ss, uniq([ss, ss + 2, ss - 2, ss + 6, D.sum(dev.map(Math.abs)), 0]).slice(0, 6)), vC = D.cell(V, uniq([V, ss, V + 1, V * 2, f(ss / 5), f(Math.sqrt(V))].map(function (v) { return f(v); })).slice(0, 6));
    ssC.hint = '偏差の 2 乗の合計'; vC.hint = '偏差の 2 乗の平均値 = 合計 ÷ 6';
    var H = D.hd, horiz = [[H('')].concat(range(N, function (i) { return H(String(i + 1)); }), [H('合計'), H('平均')]),
      [H('データ')].concat(x, [sumC, meanC]), [H('偏差')].concat(dC, [null, null]), [H('偏差²')].concat(sC, [ssC, vC])];
    var sd = rootOf(V), sdU = sd + ' ' + unit;
    var vWrong = uniq([V + ' ' + unit, ss, V + 1, V * 2, f(ss / 5)]).filter(function (v) { return v !== String(V); });
    var sdWrong = uniq([sd, V + ' ' + unit, (V * V) + ' ' + unit, rootOf(ss) + ' ' + unit, '√' + (V + 1) + ' ' + unit, (V * 2) + ' ' + unit]).filter(function (v) { return v !== sdU; });
    return {
      q: '以下は、6 人の小テストの得点（点）である。<br>このデータの分散と標準偏差を求めなさい。',
      mount: seqTask([
        { head: '(1) 表を埋めなさい。', mount: D.tableTask({ grids: [horiz], order: [sumC, meanC].concat(dC, sC, [ssC, vC]), say: '' }) },
        { head: '(2) 分散と標準偏差', mount: D.chain([
          { q: '分散を選びなさい。', ans: String(V), wrong: vWrong, memo: '分散 = ' + V, hint: '分散 = (偏差の 2 乗の合計) ÷ (データの個数)。分散には単位をつけないよ。' },
          { q: '標準偏差を選びなさい。単位にも注意しよう。', ans: sdU, wrong: sdWrong, memo: '標準偏差 = ' + sdU, hint: '標準偏差 = √分散。単位はデータと同じ「点」。' }
        ], { say: '分散は偏差の 2 乗の平均値で ' + ss + ' ÷ 6 = ' + V + '。標準偏差は √' + V + (sd !== '√' + V ? ' = ' + sd : '') + '（' + unit + '）。単位がつくのは標準偏差だけ。' }) }
      ])
    };
  }

  // =====================================================================
  // コース
  // =====================================================================
  function course(level) {
    // 続きの問題（動かした図 → 三角比、平均値 → 中央値 → 最頻値、表 → ヒストグラム、表 → 分散）は、1 つの大問の中で下へ続ける
    var t = [pythFormula(level), pythSolve(level), trigA(), trigBPair(), special9()];
    if (level >= 60) t = t.concat([soukan(false), soukan(true), area(), sineRule(), obtuse18()]);
    t = t.concat([dataTask(level), freqTask()]);
    if (level >= 60) t.push(varTask());
    t.forEach(function (x) { if (typeof x.q === 'string') x.q = x.q.split('<br>'); });   // 問題文は行ごとに（DB.run が文字をそのまま出すため）
    return t;
  }
  function start(level) {
    var app = document.getElementById('app');
    var home = function () { var b = document.querySelector('a.port-back'); if (b) b.click(); };
    var go = function () { D.run(app, course(level), { name: '目指せ' + level + '点', home: home, again: go }); };
    go();
  }
  global.EXAM = { start: start, _t: { pythFormula: pythFormula, pythSolve: pythSolve, trigA: trigA, trigBPair: trigBPair, special9: special9, dataSet: dataSet, dataTask: dataTask, freqTask: freqTask, soukan: soukan, area: area, sineRule: sineRule, obtuse18: obtuse18, varTask: varTask, course: course, frac: frac, rootOf: rootOf, spFig: spFig, obFig: obFig, sTri: sTri, rtFig: rtFig } };
})(window);
