/* 有名角（30°・45°・60°）の直角三角形：辺の比と角の大きさを、カードで □ にあてはめる（2026-11-19 先生の要望）
 *   使う場所：#25 三角比の値 レベル4、#26 有名角の三角比の値 レベル1
 *   ・全部で 12 パターン
 *       角がわかっている（3 問）：30°・45°・60° の三角形。3 辺の □ に 1・√2・√3・2 から入れる
 *       辺が 1 つだけわかっている（9 問）：のこり 2 辺と左下の角を、1・√2・√3・2・30°・45°・60° から入れる
 *   ・基本：6 問。はじめの 3 問は 30° → 45° → 60° の順（角がわかっている問題）、のこり 3 問は辺が 1 つの問題（30°・45°・60° を 1 問ずつ、順番はまぜる）
 *   ・ランダム：12 パターンをすべてまぜて出す
 *   ・カードはドラッグでも、「カードを押す → □ を押す」でも入る。同じカードを何回でも使える（45° の 1 と 1）
 *   RatioDrag.mount(要素, { next: 次のレベルへ進む関数, nextLabel: 'ボタンの文字', home: '../index.html' })
 */
(function () {
  const RATIO = { 30: { VR: '√3', RT: '1', VT: '2' }, 45: { VR: '1', RT: '1', VT: '√2' }, 60: { VR: '1', RT: '√3', VT: '2' } };   // V：左下の角、R：直角、T：上
  const SHAPE = { 30: [Math.sqrt(3), 1], 45: [1, 1], 60: [1, Math.sqrt(3)] };
  const SIDES = ['VR', 'RT', 'VT'];
  const LEN = ['1', '√2', '√3', '2'], ANG = ['30°', '45°', '60°'];

  const CSS = `
.rd{--rd-b:#1f4e8c;--rd-o:#d9480f;font-family:'BIZ UDPGothic',sans-serif}
.rd *{box-sizing:border-box}
.rd .rd-modes{display:flex;gap:6px;justify-content:center;margin:0 0 12px}
.rd button.rd-mode{min-height:40px!important;padding:6px 14px!important;border:1px solid #c5d3e4!important;border-radius:20px!important;background:#fff!important;color:var(--rd-b)!important;font:400 14px 'BIZ UDPGothic',sans-serif!important;cursor:pointer}
.rd button.rd-mode.on{background:var(--rd-b)!important;color:#fff!important;border-color:var(--rd-b)!important;font-weight:700!important}
.rd .rd-top{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px;color:#5b6470}
.rd .rd-badge{padding:2px 9px;background:var(--rd-b);color:#fff;font-size:15px;font-weight:700;border-radius:2px}
.rd .rd-bar{flex:1;height:4px;background:#e8edf2;border-radius:2px;overflow:hidden}.rd .rd-bar i{display:block;height:100%;background:var(--rd-b)}
.rd .rd-q{font-size:18px;line-height:1.7;margin:0 0 6px;word-break:auto-phrase}
.rd .rd-q .rd-ang{color:var(--rd-o);font-weight:700}
.rd .rd-fig{position:relative;max-width:420px;margin:0 auto 6px;padding:0 34px}
.rd .rd-fig svg.rd-tri{display:block;width:100%;height:auto}
.rd button.rd-slot{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;width:58px;height:44px;min-height:0!important;padding:0!important;margin:0;border:2px dashed var(--rd-b)!important;border-radius:6px!important;background:#fff!important;color:#1f2328!important;font:400 22px/1 'STIX Two Text',serif!important;cursor:pointer;transform:none!important;box-shadow:none!important}
.rd button.rd-slot.rd-angslot{width:62px;border-color:var(--rd-o)!important;color:var(--rd-o)!important}
.rd button.rd-slot.filled{border-style:solid!important;border-width:1px!important}
.rd button.rd-slot.over{background:#e3edf9!important;border-style:solid!important;border-width:2px!important}
.rd button.rd-slot.ok{border:2px solid #2b8a3e!important;background:#ebfbee!important}
.rd button.rd-slot.ng{border:2px solid #c92a2a!important;background:#fff5f5!important}
.rd .rd-note{margin:10px 0 8px;text-align:center;font-size:14px;color:#5b6470}
.rd .rd-tray{display:flex;flex-direction:column;gap:8px;align-items:center}
.rd .rd-row{display:flex;justify-content:center;flex-wrap:wrap;gap:8px}
.rd button.rd-chip{display:flex;align-items:center;justify-content:center;min-width:62px;height:52px;min-height:0!important;padding:0 10px!important;border:1px solid var(--rd-b)!important;border-bottom:3px solid #b6bfc9!important;border-radius:6px!important;background:#fff!important;color:#1f2328!important;font:400 24px/1 'STIX Two Text',serif!important;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
.rd button.rd-chip.ang{color:var(--rd-o)!important;border-color:var(--rd-o)!important;border-bottom-color:#e8b49b!important}
.rd button.rd-chip.sel{background:var(--rd-b)!important;color:#fff!important}
.rd button.rd-chip.ang.sel{background:var(--rd-o)!important}
.rd button.rd-chip:disabled{opacity:.55;cursor:default}
.rd .rd-ghost{position:fixed;z-index:50;pointer-events:none;margin:0;box-shadow:0 4px 12px rgba(31,35,40,.2)}
.rd .rd-acts{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:14px}
.rd button.rd-btn{min-height:44px!important;padding:9px 16px!important;border:1px solid var(--rd-b)!important;border-bottom:3px solid #b6bfc9!important;border-radius:6px!important;background:#fff!important;color:var(--rd-b)!important;font:400 15px 'BIZ UDPGothic',sans-serif!important;cursor:pointer}
.rd button.rd-btn.go{background:var(--rd-b)!important;color:#fff!important;border-bottom-color:#163a69!important}
.rd button.rd-btn:disabled{border-color:#d0d7de!important;background:#e8edf2!important;color:#5b6470!important;cursor:default}
.rd .rd-box{margin-top:14px;padding:12px;border-left:4px solid var(--rd-b);background:#f1f6fc;font-size:16px;line-height:1.75;word-break:auto-phrase}
.rd .rd-box.ok{border-color:#2b8a3e;background:#ebfbee}.rd .rd-box.ng{border-color:#c92a2a;background:#fff5f5}
.rd .rd-box b.h{display:block;margin-bottom:4px}.rd .rd-box.ok b.h{color:#2b8a3e}.rd .rd-box.ng b.h{color:#c92a2a}.rd .rd-box b.h.hint{color:var(--rd-b)}
.rd .rd-box p{margin:.2em 0}
.rd .rd-v{font-family:'STIX Two Text',serif;white-space:nowrap}
.rd svg.rd-root{display:inline-block;vertical-align:-.4em;overflow:visible}
.rd .rd-nb{white-space:nowrap}
.rd .rd-res{text-align:center;padding:24px 10px;border:1px solid #d0d7de;border-radius:6px}
.rd .rd-score{color:var(--rd-b);font-size:22px;font-weight:700;margin-bottom:6px}
.rd .rd-nav{display:flex;flex-direction:column;gap:10px;max-width:360px;margin:14px auto 0}
.rd .rd-nav a{color:var(--rd-b);font-size:15px}
@media (max-width:640px){.rd .rd-fig{padding:0 30px}.rd button.rd-chip{min-width:56px;height:50px}.rd .rd-q{font-size:17px}}
`;

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function rootSVG(d) {
    const w = 16 + d.length * 15;
    return '<svg class="rd-root" width="' + w / 20 + 'em" height="1.5em" viewBox="0 0 ' + w + ' 30" role="img" aria-label="√' + d + '"><path d="M1 16 L4 14 L7 23 L13 5 H' + (w - 1) + '" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="14" y="22" font-size="20" font-family="STIX Two Text, serif" fill="currentColor">' + d + '</text></svg>';
  }
  // 文の中の 1・√3・2 などを数式の書体に（√ は上に線）
  function tx(s) { return String(s).replace(/(\d*)√(\d+)/g, (_, c, d) => '<span class="rd-v">' + c + rootSVG(d) + '</span>'); }
  function val(v) { return '<span class="rd-v">' + tx(v) + '</span>'; }
  const R3 = '<span class="rd-nb">1 : √3 : 2</span>', R2 = '<span class="rd-nb">1 : 1 : √2</span>';

  // ---------- 問題 ----------
  function allPatterns() {
    const A = [30, 45, 60].map(deg => ({ type: 'A', deg }));
    const B = [];
    [30, 45, 60].forEach(deg => SIDES.forEach(given => B.push({ type: 'B', deg, given })));
    return { A, B };
  }
  function makeList(mode) {
    const { A, B } = allPatterns();
    if (mode === 'all') return shuffle(A.concat(B));
    // 基本：角がわかっている 3 問（30° → 45° → 60°）＋ 辺が 1 つの問題を 30°・45°・60° から 1 問ずつ（順番はまぜる）
    const pick = shuffle([30, 45, 60]).map(deg => shuffle(B.filter(b => b.deg === deg))[0]);
    return A.concat(pick);
  }
  function answerOf(q) {
    const a = Object.assign({}, RATIO[q.deg]);
    if (q.type === 'B') { delete a[q.given]; a.ang = q.deg + '°'; }
    return a;
  }
  const EXP_A = {
    30: '30° の角と向かい合う辺が、いちばん短い 1。<br>斜辺（直角と向かい合う、いちばん長い辺）は 2。<br>のこりの辺が √3。<br>辺の比は ' + R3 + '。',
    45: '45° の直角三角形は直角二等辺三角形。<br>直角をはさむ2辺が、どちらも 1。<br>斜辺は √2。<br>辺の比は ' + R2 + '。',
    60: '60° の角と向かい合う辺が √3。<br>斜辺（いちばん長い辺）は 2。<br>60° のとなりの辺が、いちばん短い 1。<br>辺の比は ' + R3 + '。'
  };
  const EXP_B = {
    30: '横の辺のほうが、たての辺より長い直角三角形。<br>辺の比は ' + R3 + ' で、いちばん短いたての辺が 1、横の辺が √3、斜辺が 2。<br>左下の角は、いちばん短い辺（1）と向かい合うので 30°。',
    45: '直角をはさむ2辺が同じ長さ → 直角二等辺三角形。<br>辺の比は ' + R2 + ' で、直角をはさむ2辺が 1、斜辺が √2。<br>左下の角は 45°。',
    60: 'たての辺のほうが、横の辺より長い直角三角形。<br>辺の比は ' + R3 + ' で、いちばん短い横の辺が 1、たての辺が √3、斜辺が 2。<br>左下の角は、√3 の辺と向かい合うので 60°。'
  };
  const HINT_A = {
    30: '30°・60°・90° の直角三角形の辺の比は ' + R3 + '。<br>いちばん短い 1 は、30° の角と向かい合う辺。<br>いちばん長い 2 は、斜辺（直角と向かい合う辺）。',
    45: '45°・45°・90° の直角三角形（直角二等辺三角形）の辺の比は ' + R2 + '。<br>いちばん長い √2 は、斜辺（直角と向かい合う辺）。',
    60: '30°・60°・90° の直角三角形の辺の比は ' + R3 + '。<br>いちばん短い 1 は、30° の角と向かい合う辺（60° のとなりの辺）。<br>いちばん長い 2 は、斜辺（直角と向かい合う辺）。'
  };
  const HINT_B = 'まず、直角をはさむ2辺（横の辺とたての辺）の長さをくらべよう。<br>' +
    '・同じ長さ → 直角二等辺三角形。辺の比は ' + R2 + '、角は 45°。<br>' +
    '・ちがう長さ → 辺の比は ' + R3 + '。いちばん短い辺（1）と向かい合う角が 30°、√3 の辺と向かい合う角が 60°。';
  function question(q) {
    if (q.type === 'A') return '<span class="rd-ang">' + q.deg + '°</span> の角をもつ直角三角形です。<br>3つの辺の □ に、辺の比をあてはめよう。';
    return '辺の長さが 1 つだけわかっている直角三角形です。<br>のこりの辺の □ に辺の比を、<span class="rd-ang">左下の角</span>の □ に角の大きさをあてはめよう。';
  }
  // まちがえたとき：どこがおかしいかを一言で（g：□ に入れたもの）
  function reason(q, g) {
    const s = Object.assign({}, RATIO[q.deg]);
    SIDES.forEach(k => { if (k in g) s[k] = g[k]; });
    if (q.type === 'B' && !/°$/.test(g.ang)) return '左下の角の □ には、角の大きさ（30°・45°・60°）を入れよう。';
    if (SIDES.some(k => /°$/.test(s[k]))) return '辺の □ には、辺の長さ（1・√2・√3・2）を入れよう。';
    const vals = SIDES.map(k => s[k]);
    if (q.deg === 45) {
      if (vals.some(v => v === '√3' || v === '2')) return '直角をはさむ2辺が同じ長さなので、直角二等辺三角形だよ。√3 や 2 は使わない。辺の比は ' + R2 + '。';
      if (s.VT !== '√2') return '斜辺（直角と向かい合う、いちばん長い辺）が √2。<br>' + R2 + ' の √2 が斜辺だよ。';
      if (s.VR !== s.RT) return '直角二等辺三角形は、直角をはさむ2辺が同じ長さになるよ。';
    } else {
      if (vals.includes('√2')) return '√2 は 45° の直角三角形で使う値だよ。この三角形の辺の比は ' + R3 + '。';
      if (s.VT !== '2') return '斜辺（直角と向かい合う、いちばん長い辺）が 2。<br>' + R3 + ' の 2 が斜辺だよ。';
      if (s.VR === s.RT) return '30°・60° の直角三角形は、3つの辺の長さがすべてちがうよ。辺の比は ' + R3 + '。';
      if (s.VR !== RATIO[q.deg].VR) {
        if (q.type === 'A') return q.deg === 30 ? 'いちばん短い辺（1）は、30° の角と向かい合う辺だよ。' : '60° の角と向かい合う辺は √3。いちばん短い辺（1）は、60° のとなりの辺だよ。';
        return q.deg === 30 ? '図をよく見ると、横の辺のほうがたての辺より長いよ。短いほうが 1、長いほうが √3。' : '図をよく見ると、たての辺のほうが横の辺より長いよ。短いほうが 1、長いほうが √3。';
      }
    }
    if (q.type === 'B' && g.ang !== q.deg + '°') {
      if (q.deg === 45) return '直角二等辺三角形なので、直角でない2つの角はどちらも 45°。';
      if (q.deg === 30) return '左下の角は、いちばん短い辺（1）と向かい合っているよ。いちばん短い辺と向かい合う角は 30°。';
      return '左下の角は、√3 の辺と向かい合っているよ。√3 の辺と向かい合う角は 60°（1 の辺と向かい合う上の角が 30°）。';
    }
    return '赤い枠の □ を見直そう。';
  }

  // ---------- 図 ----------
  function figure(q) {
    const W = 360, H = 290, pad = 46;
    const [p, h] = SHAPE[q.deg];
    const s = Math.min((W - 2 * pad) / p, (H - 2 * pad) / h);
    const x0 = (W - p * s) / 2, y0 = (H + h * s) / 2;
    const P = { V: [x0, y0], R: [x0 + p * s, y0], T: [x0 + p * s, y0 - h * s] };
    const f = v => v.toFixed(1);
    let o = '<svg class="rd-tri" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="直角三角形">';
    o += '<polygon points="' + ['V', 'R', 'T'].map(k => f(P[k][0]) + ',' + f(P[k][1])).join(' ') + '" fill="#f1f6fc" stroke="#1f2328" stroke-width="2" stroke-linejoin="round"/>';
    const m = 13;   // 直角の印
    o += '<path d="M' + f(P.R[0] - m) + ' ' + f(P.R[1]) + ' V' + f(P.R[1] - m) + ' H' + f(P.R[0]) + '" fill="none" stroke="#1f2328" stroke-width="1.5"/>';
    const t = q.deg * Math.PI / 180, r = 26;   // 左下の角の印
    o += '<path d="M' + f(x0 + r) + ' ' + f(y0) + ' A' + r + ' ' + r + ' 0 0 0 ' + f(x0 + r * Math.cos(t)) + ' ' + f(y0 - r * Math.sin(t)) + '" fill="none" stroke="#d9480f" stroke-width="2.5"/>';
    if (q.type === 'A') {
      const half = t / 2, d = Math.max(58, Math.min(100, 21 / Math.tan(half)));
      o += '<text x="' + f(x0 + d * Math.cos(half)) + '" y="' + f(y0 - d * Math.sin(half)) + '" font-size="20" font-weight="700" font-family="BIZ UDPGothic, sans-serif" fill="#d9480f" text-anchor="middle" dominant-baseline="central">' + q.deg + '°</text>';
    } else {
      // わかっている辺の長さ：辺のまん中から外側へ
      const k = q.given, a = P[k[0]], b = P[k[1]], c = P['VRT'.replace(k[0], '').replace(k[1], '')];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      let n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
      if ((c[0] - mx) * n[0] + (c[1] - my) * n[1] > 0) n = [-n[0], -n[1]];
      const v = RATIO[q.deg][k], root = v.match(/^√(\d+)$/), size = 28;
      const tw = root ? (16 + root[1].length * 15) * size / 20 : size * .6;
      const dist = 12 + Math.abs(n[0]) * tw / 2 + Math.abs(n[1]) * size * .55;
      const x = mx + n[0] * dist, y = my + n[1] * dist;
      if (root) {
        const w = (16 + root[1].length * 15) * size / 20;
        o += '<svg x="' + f(x - w / 2) + '" y="' + f(y - size * .78) + '" width="' + f(w) + '" height="' + f(size * 1.5) + '" viewBox="0 0 ' + (16 + root[1].length * 15) + ' 30" overflow="visible"><path d="M1 16 L4 14 L7 23 L13 5 H' + (15 + root[1].length * 15) + '" fill="none" stroke="#1f2328" stroke-width="1.4"/><text x="14" y="22" font-size="20" font-family="STIX Two Text, serif" fill="#1f2328">' + root[1] + '</text></svg>';
      } else {
        o += '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '" font-family="STIX Two Text, serif" fill="#1f2328" text-anchor="middle" dominant-baseline="central">' + v + '</text>';
      }
    }
    // 上下のよけいな余白を切る（□ が入るすきまは残す）
    const top = Math.max(0, P.T[1] - 58), bottom = Math.min(H, y0 + 66);
    o = o.replace('viewBox="0 0 ' + W + ' ' + H + '"', 'viewBox="0 ' + f(top) + ' ' + W + ' ' + f(bottom - top) + '"');
    return o + '</svg>';
  }
  // □ の位置：辺の □ は辺のまん中から外側へ、角の □ は左下の頂点のすぐ左
  function placeSlots(fig) {
    const svg = fig.querySelector('svg.rd-tri'), poly = svg && svg.querySelector('polygon');
    if (!poly || !fig.offsetWidth) return;
    const pts = poly.getAttribute('points').trim().split(/\s+/).map(p => p.split(',').map(Number));
    const P = { V: pts[0], R: pts[1], T: pts[2] };
    const vb = svg.viewBox.baseVal, rc = svg.getBoundingClientRect(), fr = fig.getBoundingClientRect(), k = rc.width / vb.width;
    const px = ([x, y]) => [rc.left - fr.left + (x - vb.x) * k, rc.top - fr.top + (y - vb.y) * k];
    fig.querySelectorAll('.rd-slot').forEach(el => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (el.dataset.key === 'ang') {
        const V = px(P.V);
        el.style.left = Math.max(-28, V[0] - 8 - w) + 'px';
        el.style.top = (V[1] - h / 2 - 12) + 'px';
        return;
      }
      const [a, b] = el.dataset.key.split(''), c = 'VRT'.replace(a, '').replace(b, '');
      const A = px(P[a]), B = px(P[b]), C = px(P[c]);
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      let n = [-(B[1] - A[1]) / L, (B[0] - A[0]) / L];
      if ((C[0] - mx) * n[0] + (C[1] - my) * n[1] > 0) n = [-n[0], -n[1]];
      const dist = Math.abs(n[0]) * w / 2 + Math.abs(n[1]) * h / 2 + 7;
      el.style.left = (mx + n[0] * dist - w / 2) + 'px';
      el.style.top = (my + n[1] * dist - h / 2) + 'px';
    });
    // □ が図の上下からはみ出すぶん、図のまわりにすきまをとる（下の文字と重ならないように）
    const tops = [...fig.querySelectorAll('.rd-slot')].map(e => [parseFloat(e.style.top), parseFloat(e.style.top) + e.offsetHeight]);
    const H = fig.clientHeight;
    fig.style.marginTop = Math.max(0, -Math.min(...tops.map(t => t[0])) + 4) + 'px';
    fig.style.marginBottom = Math.max(6, Math.max(...tops.map(t => t[1])) - H + 8) + 'px';
  }

  // ---------- 画面 ----------
  let st = null;   // { el, opt, mode, list, i, score, missed, done, picked, ro }
  function mount(el, opt) {
    if (!document.getElementById('rd-style')) { const s = document.createElement('style'); s.id = 'rd-style'; s.textContent = CSS; document.head.appendChild(s); }
    if (st && st.ro) st.ro.disconnect();
    st = { el, opt: opt || {}, mode: (st && st.el === el && st.mode) || 'basic' };
    el.classList.add('rd');
    start();
  }
  function start(mode) {
    if (mode) st.mode = mode;
    st.list = makeList(st.mode); st.i = 0; st.score = 0;
    render();
  }
  function modesHTML() {
    return '<div class="rd-modes"><button type="button" class="rd-mode' + (st.mode === 'basic' ? ' on' : '') + '" data-mode="basic">基本（6問）</button>' +
      '<button type="button" class="rd-mode' + (st.mode === 'all' ? ' on' : '') + '" data-mode="all">ランダム（全12問）</button></div>';
  }
  function bindModes() { st.el.querySelectorAll('.rd-mode').forEach(b => b.onclick = () => { if (b.dataset.mode !== st.mode || st.i > 0) start(b.dataset.mode); }); }
  function render() {
    const q = st.list[st.i], n = st.list.length, el = st.el;
    st.missed = false; st.done = false; st.picked = null;
    const keys = q.type === 'A' ? SIDES : SIDES.filter(k => k !== q.given).concat('ang');
    const chips = q.type === 'A' ? [LEN] : [LEN, ANG];
    el.innerHTML = modesHTML() +
      '<div class="rd-top"><span class="rd-badge">問' + (st.i + 1) + '</span><span>' + (st.i + 1) + ' / ' + n + '</span><span class="rd-bar"><i style="width:' + (st.i / n * 100) + '%"></i></span></div>' +
      '<p class="rd-q">' + tx(question(q)) + '</p>' +
      '<div class="rd-fig">' + figure(q) + keys.map(k => '<button type="button" class="rd-slot' + (k === 'ang' ? ' rd-angslot' : '') + '" data-key="' + k + '" aria-label="' + (k === 'ang' ? '左下の角の大きさを入れる場所' : '辺の長さを入れる場所') + '"></button>').join('') + '</div>' +
      '<p class="rd-note">カードを □ までドラッグしよう（カードを押してから □ を押しても入るよ）</p>' +
      '<div class="rd-tray">' + chips.map(row => '<div class="rd-row">' + row.map(v => '<button type="button" class="rd-chip' + (/°$/.test(v) ? ' ang' : '') + '" data-v="' + v + '">' + val(v) + '</button>').join('') + '</div>').join('') + '</div>' +
      '<div class="rd-acts"><button type="button" class="rd-btn rd-hintbtn">ヒント</button><button type="button" class="rd-btn go rd-check" disabled>答え合わせ</button><button type="button" class="rd-btn go rd-next" style="display:none">' + (st.i + 1 < n ? '次の問題へ' : '結果を見る') + '</button></div>' +
      '<div class="rd-box rd-hint" style="display:none"><b class="h hint">ヒント</b>' + tx(q.type === 'A' ? HINT_A[q.deg] : HINT_B) + '</div>' +
      '<div class="rd-box rd-fb" style="display:none"></div>';
    bindModes();
    const fig = el.querySelector('.rd-fig'), slots = [...fig.querySelectorAll('.rd-slot')], chipEls = [...el.querySelectorAll('.rd-chip')];
    const check = el.querySelector('.rd-check');
    const pick = v => { st.picked = st.picked === v ? null : v; chipEls.forEach(c => c.classList.toggle('sel', c.dataset.v === st.picked)); };
    const put = (s, v) => {
      if (st.done) return;
      s.dataset.v = v || ''; s.innerHTML = v ? val(v) : '';
      s.classList.toggle('filled', !!v); s.classList.remove('ok', 'ng');
      check.disabled = !slots.every(x => x.dataset.v);
    };
    slots.forEach(s => s.onclick = () => { if (st.done) return; if (st.picked) { put(s, st.picked); pick(null); } else if (s.dataset.v) put(s, ''); });
    chipEls.forEach(c => {
      c.onclick = e => { if (e.detail === 0 && !st.done) pick(c.dataset.v); };   // キーボードで押したとき
      c.addEventListener('pointerdown', e => {
        if (st.done || e.button > 0) return;
        e.preventDefault();
        const sx = e.clientX, sy = e.clientY;
        let ghost = null, over = null;
        const move = ev => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          if (!ghost) { ghost = c.cloneNode(true); ghost.classList.remove('sel'); ghost.classList.add('rd-ghost'); el.appendChild(ghost); }
          ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px';
          const t = document.elementFromPoint(ev.clientX, ev.clientY), s = t && t.closest('.rd-slot');
          const nx = s && fig.contains(s) ? s : null;
          if (over && over !== nx) over.classList.remove('over');
          over = nx; if (over) over.classList.add('over');
        };
        const up = () => {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
          if (!ghost) { pick(c.dataset.v); return; }
          ghost.remove();
          if (over) { over.classList.remove('over'); put(over, c.dataset.v); pick(null); }
        };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      });
    });
    el.querySelector('.rd-hintbtn').onclick = () => { const h = el.querySelector('.rd-hint'); h.style.display = h.style.display === 'none' ? 'block' : 'none'; };
    check.onclick = () => grade(q, slots, chipEls, check);
    el.querySelector('.rd-next').onclick = () => { st.i++; if (st.i < st.list.length) { render(); el.scrollIntoView({ block: 'start' }); } else results(); };
    placeSlots(fig);
    if (st.ro) st.ro.disconnect();
    if (window.ResizeObserver) { st.ro = new ResizeObserver(() => placeSlots(fig)); st.ro.observe(fig); }
    else window.addEventListener('resize', () => placeSlots(fig));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeSlots(fig));
  }
  function grade(q, slots, chipEls, check) {
    if (st.done) return;
    const ans = answerOf(q), g = {};
    slots.forEach(s => { g[s.dataset.key] = s.dataset.v; s.classList.add(s.dataset.v === ans[s.dataset.key] ? 'ok' : 'ng'); });
    const fb = st.el.querySelector('.rd-fb');
    if (slots.every(s => s.classList.contains('ok'))) {
      st.done = true; if (!st.missed) st.score++;
      chipEls.forEach(c => { c.disabled = true; c.classList.remove('sel'); });
      check.style.display = 'none';
      st.el.querySelector('.rd-next').style.display = '';
      fb.className = 'rd-box rd-fb ok';
      fb.innerHTML = '<b class="h">正解です！</b>' + tx(q.type === 'A' ? EXP_A[q.deg] : EXP_B[q.deg]);
    } else {
      st.missed = true;
      fb.className = 'rd-box rd-fb ng';
      fb.innerHTML = '<b class="h">ちがいます。赤い枠の □ を<span class="rd-nb">直してみよう！</span></b>' + tx(reason(q, g));
    }
    fb.style.display = 'block';
    fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function results() {
    const n = st.list.length, o = st.opt;
    if (st.ro) st.ro.disconnect();
    const other = st.mode === 'basic' ? 'all' : 'basic';
    st.el.innerHTML = modesHTML() + '<div class="rd-res"><div class="rd-score">一発正解 ' + st.score + ' / ' + n + ' 問</div>' +
      '<p>' + (st.score === n ? '全問一発正解！ 辺の比はばっちりだね。' : 'お疲れ様でした！ まちがえた三角形の辺の比を、もう一度たしかめよう。') + '</p>' +
      '<div class="rd-nav">' + (o.next ? '<button type="button" class="rd-btn go rd-gonext">' + (o.nextLabel || '次のレベルへ ▶') + '</button>' : '') +
      '<button type="button" class="rd-btn rd-again">同じ問題の出し方でもう一度</button>' +
      '<button type="button" class="rd-btn rd-other">' + (other === 'all' ? 'ランダム（全12問）でやってみる' : '基本（6問）でやってみる') + '</button>' +
      '<a class="rd-home">ほかの教材をえらぶ</a></div></div>';
    // 一覧へのリンク：ページの「← 教材の一覧へ」と同じ行き先（GAS で開いたときは書きかえ済みのものを使う）
    const back = document.querySelector('a.port-back'), home = st.el.querySelector('.rd-home');
    home.href = o.home || (back && back.href) || '../index.html';
    if (back && back.target) home.target = back.target;
    bindModes();
    if (o.next) st.el.querySelector('.rd-gonext').onclick = () => o.next();
    st.el.querySelector('.rd-again').onclick = () => start();
    st.el.querySelector('.rd-other').onclick = () => start(other);
  }

  window.RatioDrag = { mount, _test: { makeList, answerOf, reason, allPatterns } };
  window.__rdAns = () => answerOf(st.list[st.i]);
})();
