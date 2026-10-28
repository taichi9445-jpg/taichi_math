/* ===========================================================================
   zahyou.js — 座標の図で三角比を求める練習（30 三角比（座標）・31 三角比の値（総合）で共通）
   ---------------------------------------------------------------------------
   ・zahyouFig：P が 0° から回る図（角度は図の中に書く。P の座標と半径は、うめたら書く）
   ・refTriFig：ヒントの、その角の直角三角形（30°・45°・60°）と辺の比
   ・problemFor：角度ごとの問題（P の座標 → r → 枠の中に sin・cos・tan の公式と値）。カードは assets/fill-steps.js
   ・mountZahyou：上の問題を fill-steps でならべる
   fill-steps.js のあとに読みこむ。
   ========================================================================= */
const md = FillSteps.md;
const NAVY = '#1f4e8c', RED = '#c92a2a', GREEN = '#2b8a3e', ORANGE = '#d9480f', PURPLE = '#7048e8';

// 角度ごとの P(x, y)・r・sin・cos・tan
const T = {
  0: ['1', '0', '1', '0', '1', '0'], 30: ['√3', '1', '2', '1/2', '√3/2', '1/√3'], 45: ['1', '1', '√2', '1/√2', '1/√2', '1'],
  60: ['1', '√3', '2', '√3/2', '1/2', '√3'], 90: ['0', '1', '1', '1', '0', 'なし'], 120: ['−1', '√3', '2', '√3/2', '−1/2', '−√3'],
  135: ['−1', '1', '√2', '1/√2', '−1/√2', '−1'], 150: ['−√3', '1', '2', '1/2', '−√3/2', '−1/√3'], 180: ['−1', '0', '1', '0', '−1', '0'],
  210: ['−√3', '−1', '2', '−1/2', '−√3/2', '1/√3'], 225: ['−1', '−1', '√2', '−1/√2', '−1/√2', '1'], 240: ['−1', '−√3', '2', '−√3/2', '−1/2', '√3'],
  270: ['0', '−1', '1', '−1', '0', 'なし'], 300: ['1', '−√3', '2', '−√3/2', '1/2', '−√3'], 315: ['1', '−1', '√2', '−1/√2', '1/√2', '−1'],
  330: ['√3', '−1', '2', '−1/2', '√3/2', '−1/√3'], 360: ['1', '0', '1', '0', '1', '0']
};

const num = s => { s = String(s); const neg = s[0] === '−'; s = s.replace('−', ''); const m = s.match(/^(\d*)√(\d+)$/); const v = m ? (+m[1] || 1) * Math.sqrt(+m[2]) : +s; return neg ? -v : v; };
const refOf = d => { d = ((d % 360) + 360) % 360; return d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d; };
const onAxis = d => d % 90 === 0;

// 図の中の長さ（BIZ UDPGothic の太字。√ は記号の右上から線が中の数字にかぶさる）
function svgNum(x, y, s, color, fs = 16) {
  const m = String(s).match(/^(−?\d*)√(\d+)$/), cw = fs * 0.56;
  if (!m) return `<text x="${x}" y="${y}" text-anchor="middle" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="${fs}" fill="${color}">${s}</text>`;
  const cwid = m[1].length * cw, dwid = m[2].length * cw, w = cwid + fs * 0.75 + dwid + 2, x0 = x - w / 2, x1 = x0 + cwid + 1;
  return `<text x="${x0}" y="${y}" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="${fs}" fill="${color}">${m[1]}</text>` +
    `<path d="M${x1} ${y - fs * 0.3}L${x1 + fs * 0.18} ${y - fs * 0.4}L${x1 + fs * 0.4} ${y + 1}L${x1 + fs * 0.7} ${y - fs * 0.92}H${x1 + fs * 0.75 + dwid + 2}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<text x="${x1 + fs * 0.75}" y="${y}" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="${fs}" fill="${color}">${m[2]}</text>`;
}
const it = (x, y, s, color = '#1f2328', fs = 18, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="STIX Two Text, serif" font-style="italic" font-size="${fs}" fill="${color}">${s}</text>`;
const gtext = (x, y, s, color, fs = 15) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="BIZ UDPGothic, sans-serif" font-weight="700" font-size="${fs}" fill="${color}">${s}</text>`;
const arrow = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1); return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#5b6470" stroke-width="1.4"/><path d="M${x2} ${y2}L${x2 - 10 * Math.cos(a - .4)} ${y2 - 10 * Math.sin(a - .4)}L${x2 - 10 * Math.cos(a + .4)} ${y2 - 10 * Math.sin(a + .4)}Z" fill="#5b6470"/>`; };
const zl = (x, y, W, H, html, color) => `<span class="zl" style="left:${(x / W * 100).toFixed(2)}%;top:${(y / H * 100).toFixed(2)}%;color:${color}">${html}</span>`;

// 座標軸と円（半円）。ticks に文字を入れると、目盛りに長さを書く
function axes(W, H, ox, oy, R, full, tick, noO) {
  let s = `<path d="${full ? `M${ox + R} ${oy}A${R} ${R} 0 1 0 ${ox - R} ${oy}A${R} ${R} 0 1 0 ${ox + R} ${oy}` : `M${ox + R} ${oy}A${R} ${R} 0 0 0 ${ox - R} ${oy}`}" fill="none" stroke="#98a2ad" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  s += arrow(14, oy, W - 8, oy) + arrow(ox, full ? H - 8 : oy + 24, ox, 10);
  s += it(W - 12, oy + 20, 'x', '#5b6470', 17) + it(ox + 12, 20, 'y', '#5b6470', 17) + (noO ? '' : it(ox - (full ? 15 : 12), oy + (full ? 22 : 19), 'O', '#5b6470', 17));
  [[ox + R, oy, 1], [ox - R, oy, 1], [ox, oy - R, 0]].concat(full ? [[ox, oy + R, 0]] : []).forEach(([x, y, h]) => {
    s += h ? `<path d="M${x} ${y - 5}V${y + 5}" stroke="#5b6470" stroke-width="1.4"/>` : `<path d="M${x - 5} ${y}H${x + 5}" stroke="#5b6470" stroke-width="1.4"/>`;
  });
  if (tick) s += svgNum(ox + R, oy + 19, tick, '#5b6470', 14) + svgNum(ox - R - 4, oy + 19, '−' + tick, '#5b6470', 14) + svgNum(ox - 16, oy - R + 5, tick, '#5b6470', 14);
  return s;
}

// 辺 AB の長さを、辺のまん中から（cx, cy）と反対側に置く
function sideNum(A, B, cx, cy, txt, color, fs = 16) {
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2; let nx = -(B[1] - A[1]), ny = B[0] - A[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
  if ((cx - mx) * nx + (cy - my) * ny > 0) { nx = -nx; ny = -ny; }
  const k = Math.abs(nx) > .6 ? 18 + String(txt).length * 2 : 13;
  return svgNum(mx + nx * k, my + ny * k + fs * .36, txt, color, fs);
}

// 問題の図：0° から deg まで OP が回る（t が今の角度）
function zahyouFig(deg, t, info) {
  const full = deg > 180, W = 360, H = full ? 330 : 236, ox = 180, oy = full ? 168 : 206, R = 128;
  const a = t * Math.PI / 180, px = ox + R * Math.cos(a), py = oy - R * Math.sin(a), fin = t === deg;
  let s = axes(W, H, ox, oy, R, full, '', true), labels = '';
  // 原点 O：直角三角形と重ならない側に
  s += it(ox + (Math.cos(a) < -0.01 && Math.sin(a) < -0.01 ? 15 : -14), oy + (full ? 22 : 19), 'O', '#5b6470', 17);
  if (fin && !onAxis(deg)) {
    s += `<path d="M${ox} ${oy}L${px} ${oy}L${px} ${py}Z" fill="#e3ecf7" opacity=".8"/>`;
    s += `<path d="M${px} ${py}V${oy}" stroke="${NAVY}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    const sx = px > ox ? -1 : 1, sy = py < oy ? -1 : 1;
    s += `<path d="M${px + sx * 10} ${oy}V${oy + sy * 10}H${px}" fill="none" stroke="${NAVY}" stroke-width="1.3"/>`;
  }
  if (t > 0) {
    const r0 = t > 180 ? 16 : 24, big = t > 180 ? 1 : 0, e = [ox + r0 * Math.cos(a), oy - r0 * Math.sin(a)];
    s += t >= 359.9 ? `<circle cx="${ox}" cy="${oy}" r="${r0}" fill="none" stroke="${ORANGE}" stroke-width="2.2"/>`
      : `<path d="M${ox + r0} ${oy}A${r0} ${r0} 0 ${big} 0 ${e[0]} ${e[1]}" fill="none" stroke="${ORANGE}" stroke-width="2.2"/>`;
  }
  if (fin) {
    // 角度の文字：弧の外の、二等分線の上（軸にかかるときは少しずらす）
    let m = deg / 2, rr = deg < 60 ? Math.min(70, 25 / Math.sin(deg * Math.PI / 360)) : 46;
    if (deg === 0) { m = 18; rr = 52; } else if (deg === 180) { m = 122; rr = 50; } else if (deg === 360) { m = 125; rr = 50; }
    let lx = ox + rr * Math.cos(m * Math.PI / 180), ly = oy - rr * Math.sin(m * Math.PI / 180);
    if (Math.abs(lx - ox) < 24) lx = ox + (Math.cos(m * Math.PI / 180) < -0.01 ? -24 : 24);   // y 軸にかからない
    if (Math.abs(ly - oy) < 13) ly = oy + (Math.sin(m * Math.PI / 180) < -0.01 ? 13 : -13);  // x 軸にかからない
    s += gtext(lx, ly + 5, deg + '°', ORANGE, 16);
  }
  s += `<path d="M${ox} ${oy}L${px} ${py}" stroke="${RED}" stroke-width="3" stroke-linecap="round"/><circle cx="${px}" cy="${py}" r="4.5" fill="${RED}"/>`;
  if (fin) {
    // P の名前（座標がうまったら P(x, y)）。点から外向きに
    const ux = Math.cos(a), uy = -Math.sin(a), w = info.xy ? 30 + (info.xy.join('').length) * 9 : 14;
    let lx = px + ux * 18 + (Math.abs(ux) > .25 ? Math.sign(ux) * w / 2 : 0), ly = py + uy * 20 + (Math.abs(uy) < .3 ? -14 : 0);
    lx = Math.min(W - w / 2 - 2, Math.max(w / 2 + 2, lx));
    labels += zl(lx, Math.max(12, Math.min(H - 12, ly)), W, H, info.xy ? md(`P(${info.xy[0]}, ${info.xy[1]})`) : md('P'), RED);
    if (info.r) { // 半径がうまったら OP の長さ
      const mx = (ox + px) / 2, my = (oy + py) / 2; let nx = -(py - oy), ny = px - ox; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      if (!onAxis(deg) && nx * (px - mx) + ny * (oy - my) > 0) { nx = -nx; ny = -ny; }
      if (onAxis(deg)) { nx = deg % 180 === 0 ? 0 : -1; ny = deg % 180 === 0 ? -1 : 0; }
      s += svgNum(mx + nx * 16, my + ny * 16 + 6, info.r, NAVY, 16);
    }
  }
  return `<div class="zf"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${deg}°の動径OP">${s}</svg>${labels}</div>`;
}

// ヒントの図：その角の直角三角形（30°・45°・60°）と辺の比。座標の図と同じ向きにかく
function refTriFig(deg) {
  const d = ((deg % 360) + 360) % 360, ref = refOf(d), [x, y, r] = T[deg];
  const W = 260, H = 170, a = d * Math.PI / 180, L = Math.min(170 / Math.abs(Math.cos(a)), 112 / Math.abs(Math.sin(a)), 160);
  const dx = Math.cos(a) * L, dy = -Math.sin(a) * L;
  const ox = (W - dx) / 2, oy = (H - dy) / 2;
  const O = [ox, oy], Hh = [ox + dx, oy], P = [ox + dx, oy + dy];
  const cx = (O[0] + Hh[0] + P[0]) / 3, cy = (O[1] + Hh[1] + P[1]) / 3;
  let s = `<path d="M${O[0] - 20 * Math.sign(dx || 1)} ${oy}H${Hh[0] + 20 * Math.sign(dx || 1)}" stroke="#98a2ad" stroke-width="1.2"/>`;
  s += `<path d="M${O[0]} ${O[1]}L${Hh[0]} ${Hh[1]}L${P[0]} ${P[1]}Z" fill="#f1f6fc"/>`;
  s += `<path d="M${O[0]} ${O[1]}L${Hh[0]} ${Hh[1]}" stroke="${GREEN}" stroke-width="3.5"/><path d="M${Hh[0]} ${Hh[1]}L${P[0]} ${P[1]}" stroke="${RED}" stroke-width="3.5"/><path d="M${O[0]} ${O[1]}L${P[0]} ${P[1]}" stroke="${NAVY}" stroke-width="3.5"/>`;
  const sx = Math.sign(O[0] - Hh[0]), sy = Math.sign(P[1] - Hh[1]);
  s += `<path d="M${Hh[0] + sx * 10} ${Hh[1]}V${Hh[1] + sy * 10}H${Hh[0]}" fill="none" stroke="#1f2328" stroke-width="1.2"/>`;
  // O の角
  const b0 = dx >= 0 ? 0 : Math.PI, b1 = Math.atan2(-dy, dx), r0 = 22;
  const p0 = [ox + r0 * Math.cos(b0), oy - r0 * Math.sin(b0)], p1 = [ox + r0 * Math.cos(b1), oy - r0 * Math.sin(b1)];
  const diff = Math.atan2(Math.sin(b1 - b0), Math.cos(b1 - b0));
  s += `<path d="M${p0[0]} ${p0[1]}A${r0} ${r0} 0 0 ${diff > 0 ? 0 : 1} ${p1[0]} ${p1[1]}" fill="none" stroke="${ORANGE}" stroke-width="2"/>`;
  const bm = b0 + diff / 2, rl = ref === 60 ? 36 : ref === 45 ? 42 : 50;
  s += gtext(ox + rl * Math.cos(bm), oy - rl * Math.sin(bm) + 5, ref + '°', ORANGE, 14);
  // 辺の長さ（符号はつけない）
  const side = (A, B, txt, color) => sideNum(A, B, cx, cy, txt, color);
  s += side(O, Hh, x.replace('−', ''), GREEN) + side(Hh, P, y.replace('−', ''), RED) + side(O, P, r, NAVY);
  const vn = (Q, n) => { let ux = Q[0] - cx, uy = Q[1] - cy; const l = Math.hypot(ux, uy); return it(Q[0] + ux / l * 14, Q[1] + uy / l * 14 + 6, n, '#1f2328', 16); };
  s += vn(O, 'O') + vn(P, 'P') + vn(Hh, 'H');
  return `<div class="zf"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${ref}°の直角三角形">${s}</svg></div>`;
}

function problemFor(deg, mode) {
  const [x, y, r, sn, cs, tn] = T[deg];
  const flip = v => (v === '0' || v === 'なし') ? null : v[0] === '−' ? v.slice(1) : '−' + v;
  const NUM = ['−2', '−√3', '−√2', '−1', '0', '1', '√2', '√3', '2'];
  const RAT = ['−√3', '−1', '−√3/2', '−1/√2', '−1/2', '−1/√3', '0', '1/√3', '1/2', '1/√2', '√3/2', '1', '√3', 'なし'];
  const nums = new Set([x, y, r]); [x, y].forEach(v => { const f = flip(v); if (f) nums.add(f); });
  nums.add(r === '2' ? '√2' : '2');
  const rats = new Set([sn, cs, tn]); [sn, cs, tn].forEach(v => { const f = flip(v); if (f && rats.size < 6) rats.add(f); });
  for (const v of ['1/2', '√3/2', '1/√3', '√3', '−1/2', '−√3/2']) if (rats.size < 6) rats.add(v);
  // ゴールは sin・cos・tan の値。枠で囲み、公式（sin θ = y/r など）の行と値の行を分ける（先生の要望）
  const G = 'ゴール：三角比の値', goal = t => ({ t, sec: G });
  const rows = [`P([${x}], [${y}])`, `r = OP = [${r}]`,
    goal('!sin θ = {[y]|[r]}'), goal(`sin ${deg}° = [${sn}]`),
    goal('!cos θ = {[x]|[r]}'), goal(`cos ${deg}° = [${cs}]`),
    goal('!tan θ = {[y]|[x]}'), goal(tn === 'なし' ? `#x = 0 なので、tan ${deg}° の値は [なし]` : `tan ${deg}° = [${tn}]`)];
  // 半径 1（単位円）や半径 2 で考えた P の座標・r も正解にする（座標の値がそのまま cos・sin になる）
  const main = [x, y, r, 'y', 'r', sn, 'x', 'r', cs, 'y', 'x', tn];
  const val = c => { const neg = c[0] === '−', [n, d] = c.replace('−', '').split('/'); return (neg ? -1 : 1) * num(n) / (d ? num(d) : 1); };
  const named = v => NUM.concat(RAT).find(c => c !== 'なし' && Math.abs(val(c) - v) < 1e-9);
  const alts = ['1', '2'].filter(r1 => r1 !== r).map(r1 => {
    const k = num(r1) / num(r), xy = [x, y].map(v => named(num(v) * k));
    return xy.every(Boolean) ? [xy[0], xy[1], r1].concat(main.slice(3)) : null;
  }).filter(Boolean);
  return {
    deg, mode, fig: ' ',
    q: `点 P の座標と r を求めて、${deg}° の三角比の値を求めよう。`,
    rows, alts,
    cards: ['x', 'y', 'r', null].concat(NUM.filter(v => nums.has(v)), [null], RAT.filter(v => rats.has(v) && !nums.has(v))),
    ans: `sin ${deg}° = ${tex(sn)}、cos ${deg}° = ${tex(cs)}、tan ${deg}° ${tn === 'なし' ? 'の値はなし' : '= ' + tex(tn)}`
  };
}
function tex(v) { const m = v.match(/^(−?)([^/]+)\/(.+)$/); return m ? m[1] + '{' + m[2] + '|' + m[3] + '}' : v; }

function hint(p, row) {
  const i = p.rows.indexOf(row), d = p.deg, ref = refOf(d), v = T[d];
  if (i === 0) return onAxis(d) ? `${d}° のとき、P は軸の上にあります。この円の半径は 1 です。` :
    `${ref}° の直角三角形で考えよう。P が y 軸より左なら x 座標は −、x 軸より下なら y 座標は − です。`;
  if (i === 1) return onAxis(d) ? 'この円の半径は 1 です。' : '直角三角形の斜辺の長さが r です。';
  if (i === 2) return 'sin θ = {y|r}';
  if (i === 4) return 'cos θ = {x|r}';
  if (i === 6) return 'tan θ = {y|x}';
  if (i === 3) return `sin ${d}° = {y|r} = {${v[1]}|${v[2]}}`;
  if (i === 5) return `cos ${d}° = {x|r} = {${v[0]}|${v[2]}}`;
  if (i === 7) return v[5] === 'なし' ? `tan ${d}° = {y|x} = {${v[1]}|0}。0 でわることはできません。` : `tan ${d}° = {y|x} = {${v[1]}|${v[0]}}`;
  return '';
}
function hintFig(p, row) { const i = p.rows.indexOf(row); return (i <= 1 && !onAxis(p.deg)) ? refTriFig(p.deg) : ''; }

// 図：問題がかわったときだけ OP を回す。うめた座標・r は図にもかきこむ
let animKey = null, animTok = 0;
function afterRender(root, p, st) {
  const box = root.querySelector('.fs-fig'); if (!box) return;
  const filled = i => st.fill[i] !== undefined || st.shown;
  const info = { xy: filled(0) && filled(1) ? [st.fill[0] || p.blanks[0].a, st.fill[1] || p.blanks[1].a] : null, r: filled(2) ? (st.fill[2] || p.blanks[2].a) : null };
  const key = p.mode + p.deg, tok = ++animTok;
  if (animKey === key || matchMedia('(prefers-reduced-motion: reduce)').matches) { box.innerHTML = zahyouFig(p.deg, p.deg, info); animKey = key; return; }
  animKey = key;
  const t0 = performance.now(), dur = 300 + p.deg * 3.2;
  (function step(now) {
    if (tok !== animTok) return;
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    box.innerHTML = zahyouFig(p.deg, k >= 1 ? p.deg : p.deg * e, info);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}


// メニューのカードの小さな図（kind：'ang' 角度の図・'rev' θ を求める・'ta' タイムアタック・'mr' マラソン）
function menuIcon(kind, deg = 150, color = NAVY) {
  const g = '#98a2ad';
  if (kind === 'ta') return `<svg viewBox="0 0 88 58" aria-hidden="true"><circle cx="44" cy="33" r="19" fill="#fff" stroke="${color}" stroke-width="3"/><path d="M39 9h10M44 9v5M60 17l4-4" stroke="${color}" stroke-width="3" stroke-linecap="round"/><path d="M44 33V21M44 33l8 5" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/><circle cx="44" cy="33" r="2.4" fill="${RED}"/></svg>`;
  if (kind === 'mr') return `<svg viewBox="0 0 88 58" aria-hidden="true"><path d="M8 50H80" stroke="${g}" stroke-width="2"/><path d="M30 50V8" stroke="${color}" stroke-width="3" stroke-linecap="round"/><path d="M31 9h30l-7 9 7 9H31z" fill="${color}" opacity=".85"/><path d="M38 13h6v5h-6zM50 18h6v5h-6zM44 18h6v5h-6z" fill="#fff" opacity=".9"/></svg>`;
  const full = deg > 180, ox = 44, oy = full ? 29 : 50, R = full ? 24 : 36, a = deg * Math.PI / 180;
  let s = `<path d="M${full ? 12 : 4} ${oy}H${full ? 76 : 84}M${ox} ${full ? 54 : 54}V${full ? 3 : 8}" stroke="${g}" stroke-width="1.4"/>`;
  s += full ? `<circle cx="${ox}" cy="${oy}" r="${R}" fill="none" stroke="${g}" stroke-width="1.6" stroke-dasharray="4 3"/>`
    : `<path d="M${ox + R} ${oy}A${R} ${R} 0 0 0 ${ox - R} ${oy}" fill="none" stroke="${g}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
  if (kind === 'rev') {
    const yy = oy - R * 0.5, dx = R * Math.sqrt(0.75);
    s += `<path d="M6 ${yy}H82" stroke="${ORANGE}" stroke-width="2" stroke-dasharray="5 3"/>`;
    [-1, 1].forEach(k => { s += `<path d="M${ox} ${oy}L${ox + k * dx} ${yy}" stroke="${color}" stroke-width="2.6"/><circle cx="${ox + k * dx}" cy="${yy}" r="3.4" fill="${color}"/>`; });
    return `<svg viewBox="0 0 88 58" aria-hidden="true">${s}</svg>`;
  }
  const r0 = full ? 9 : 12, e = [ox + r0 * Math.cos(a), oy - r0 * Math.sin(a)];
  s += `<path d="M${ox + r0} ${oy}A${r0} ${r0} 0 ${deg > 180 ? 1 : 0} 0 ${e[0]} ${e[1]}" fill="none" stroke="${ORANGE}" stroke-width="2"/>`;
  s += `<path d="M${ox} ${oy}L${ox + R * Math.cos(a)} ${oy - R * Math.sin(a)}" stroke="${RED}" stroke-width="2.8" stroke-linecap="round"/><circle cx="${ox + R * Math.cos(a)}" cy="${oy - R * Math.sin(a)}" r="3.6" fill="${RED}"/>`;
  return `<svg viewBox="0 0 88 58" aria-hidden="true">${s}</svg>`;
}

// 角度の一覧から、図が動く練習をはじめる（menuBtn：タブの左に出すボタン、finalExtra：最後の画面のボタン）
function mountZahyou(app, angles, key, o = {}) {
  animKey = null;
  const problems = angles.map(d => problemFor(d, key));
  let api = null;
  api = FillSteps.mount({
    el: app, problems, hint, hintFig,
    after: (root, p, st) => { afterRender(root, p, st); if (api && o.onDone && api.state().every(s => s.done || s.shown)) o.onDone(); },
    tabLabel: p => p.deg + '°', tabPrefix: '', badge: p => p.deg + '°',
    tabsBefore: o.menuBtn || '', finalExtra: o.finalExtra
  });
  return api;
}
