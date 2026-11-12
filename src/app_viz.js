/* ================================================================ result visualizations and the editable results path diagram */
const STC = { pass: '#d9efe1', warn: '#fbe5bf', fail: '#f6c5bf' }, STT = { pass: '#1d6b45', warn: '#8a5207', fail: '#9e2219' };
const STB = { pass: '#5fa57f', warn: '#e0a243', fail: '#d0574b', mute: '#b4b8c2' };
const lerpC = (a, b, t) => Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
const pinkScale = t => `rgb(${lerpC(253, 210, t)},${lerpC(244, 64, t)},${lerpC(246, 95, t)})`;
const blueScale = t => `rgb(${lerpC(244, 70, t)},${lerpC(247, 110, t)},${lerpC(251, 165, t)})`;
const vTitle = (title, sub) => svgT(24, 32, title, { size: 17, weight: 700 }) + (sub ? svgT(24, 52, sub, { size: 12, fill: FX.ink2 }) : '');
const measJ = R => R.lv.map((_, j) => j).filter(j => R.kind[j] !== 'int');

/* ---- generic builders */
function heatSVG(o) {
  const fs = o.fs || 12, cw = o.cw || 58, ch = o.ch || 30, lw = Math.max(...o.rows.map(r => textW(r, fs))) + 14, rot = !!o.rot;
  const th = rot ? Math.max(...o.cols.map(c => textW(c, fs))) * 0.85 + 16 : 24, left = 24 + lw, top = 66 + th;
  const W = Math.max(left + o.cols.length * cw + 40, 560, textW(o.title, 17) + 48, o.sub ? textW(o.sub, 12) * 0.92 + 48 : 0), H = top + o.rows.length * ch + (o.legend ? 58 : 28);
  let s = vTitle(o.title, o.sub);
  o.cols.forEach((c, j) => { const x = left + j * cw + cw / 2; s += rot ? `<text x="${sx(x + 3)}" y="${sx(top - 6)}" font-size="${fs}" fill="${FX.ink2}" transform="rotate(-55 ${sx(x + 3)} ${sx(top - 6)})">${esc(c)}</text>` : svgT(x, top - 8, c, { size: fs, anchor: 'middle', weight: 600 }); });
  o.rows.forEach((r, i) => {
    s += svgT(left - 7, top + i * ch + ch / 2 + 4, r, { size: fs, anchor: 'end', weight: rot ? 400 : 600, fill: rot ? FX.ink2 : FX.ink });
    o.cols.forEach((c, j) => {
      const v = o.val(i, j); if (v === null || v === undefined || !Number.isFinite(v)) return;
      const x = left + j * cw, y = top + i * ch, m = o.mark ? o.mark(i, j, v) : null;
      s += `<rect x="${sx(x + 1)}" y="${sx(y + 1)}" width="${sx(cw - 2)}" height="${sx(ch - 2)}" rx="${cw > 16 ? 3 : 1}" fill="${o.color(v, i, j)}"${m === 'own' ? ` stroke="${FX.ink}" stroke-width="1.6"` : m === 'bad' ? ` stroke="${FX.fail}" stroke-width="2.2"` : ''}><title>${esc(`${r} × ${c}: ${fmt(v)}`)}</title></rect>`;
      if (o.text !== false) s += svgT(x + cw / 2, y + ch / 2 + fs * 0.35, fmt(v, o.dec), { size: fs - 1, anchor: 'middle', fill: o.tcol ? o.tcol(v, i, j) : FX.ink, weight: m ? 700 : 400 });
    });
  });
  (o.groups || []).forEach(([a, b]) => { s += `<rect x="${sx(left + a * cw)}" y="${sx(top + a * ch)}" width="${sx((b - a) * cw)}" height="${sx((b - a) * ch)}" fill="none" stroke="${FX.ink}" stroke-width="1.3"/>`; });
  if (o.legend) { let lx = 24; o.legend.forEach(([col, lab]) => { s += `<rect x="${lx}" y="${H - 34}" width="14" height="14" rx="2" fill="${col}" stroke="${FX.grid}"/>` + svgT(lx + 20, H - 22, lab, { size: 11.5, fill: FX.ink2 }); lx += 34 + textW(lab, 11.5); }); }
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function hbarsSVG(o) {
  const fs = 12.5, rh = o.rh || 24, n = o.rows.length, lw = Math.min(300, Math.max(70, ...o.rows.map(r => textW(r.label, fs))) + 14), left = 24 + lw, right = o.right || 96, top = 80, W = 960, H = top + n * rh + 46;
  const vals = o.rows.map(r => r.v).filter(Number.isFinite), refs = o.refs || [];
  const lo = Math.min(o.min !== undefined ? o.min : 0, ...vals), hi0 = Math.max(o.max !== undefined ? o.max : 0, ...vals, ...refs.map(r => r.v)), hi = hi0 + (hi0 - lo) * 0.06 || 1;
  const X = v => left + (v - lo) / (hi - lo) * (W - left - right), y1 = top - 8, y2 = top + n * rh + 6;
  let s = vTitle(o.title, o.sub);
  (o.bands || []).forEach(b => { const a = X(Math.max(lo, b.from)), c = X(Math.min(hi, b.to)); if (c > a) s += `<rect x="${sx(a)}" y="${y1}" width="${sx(c - a)}" height="${sx(y2 - y1)}" fill="${b.color}"/>` + (b.label ? svgT((a + c) / 2, y1 - 6, b.label, { size: 10.5, fill: FX.ink2, anchor: 'middle' }) : ''); });
  niceTicks(lo, hi, 6).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${y1}" y2="${y2}" stroke="${FX.grid}"/>` + svgT(X(t), y2 + 16, fmt(t, o.tickDec !== undefined ? o.tickDec : 2), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  if (lo < 0) s += `<line x1="${sx(X(0))}" x2="${sx(X(0))}" y1="${y1}" y2="${y2}" stroke="${FX.ink3}"/>`;
  o.rows.forEach((r, i) => {
    const y = top + i * rh; s += svgT(left - 8, y + rh / 2 + 4, r.label, { size: fs, anchor: 'end', weight: r.head ? 700 : 400 });
    if (!Number.isFinite(r.v)) return;
    s += `<rect x="${sx(Math.min(X(0), X(r.v)))}" y="${sx(y + 4)}" width="${sx(Math.max(1, Math.abs(X(r.v) - X(0))))}" height="${rh - 8}" rx="2" fill="${r.color || FX.ink}"/>` + svgT(r.v >= 0 ? X(r.v) + 6 : X(0) + 6, y + rh / 2 + 4, r.note || fmt(r.v, o.dec), { size: 11.5, anchor: 'start' });
  });
  refs.forEach(rf => { s += `<line x1="${sx(X(rf.v))}" x2="${sx(X(rf.v))}" y1="${y1}" y2="${y2}" stroke="${rf.color || FX.drop}" stroke-dasharray="5 4" stroke-width="1.4"/>` + (rf.label ? svgT(X(rf.v) + 4, y1 - 5, rf.label, { size: 10.5, fill: rf.color || FX.drop }) : ''); });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function forestSVG(o) {
  const fs = 12.5, rh = 26, n = o.rows.length, lw = Math.min(380, Math.max(80, ...o.rows.map(r => textW(r.label, fs))) + 14), left = 24 + lw, right = 190, top = 82, W = 980, H = top + n * rh + 44;
  const lo0 = Math.min(0, ...o.rows.map(r => r.lo)), hi0 = Math.max(0, ...o.rows.map(r => r.hi)), pad = (hi0 - lo0) * 0.06 || 0.1, lo = lo0 - pad, hi = hi0 + pad;
  const X = v => left + (v - lo) / (hi - lo) * (W - left - right);
  let s = vTitle(o.title, o.sub);
  niceTicks(lo, hi, 6).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 8}" y2="${top + n * rh}" stroke="${FX.grid}"/>` + svgT(X(t), top + n * rh + 18, fmt(t, 2), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  s += `<line x1="${sx(X(0))}" x2="${sx(X(0))}" y1="${top - 8}" y2="${top + n * rh}" stroke="${FX.ink3}" stroke-dasharray="4 3"/>`;
  o.rows.forEach((r, i) => {
    const y = top + i * rh + rh / 2, col = r.sig ? FX.drop : STB.mute;
    s += svgT(left - 8, y + 4, r.label, { size: fs, anchor: 'end' }) + `<line x1="${sx(X(r.lo))}" x2="${sx(X(r.hi))}" y1="${sx(y)}" y2="${sx(y)}" stroke="${col}" stroke-width="2.4"/><line x1="${sx(X(r.lo))}" x2="${sx(X(r.lo))}" y1="${sx(y - 5)}" y2="${sx(y + 5)}" stroke="${col}" stroke-width="2"/><line x1="${sx(X(r.hi))}" x2="${sx(X(r.hi))}" y1="${sx(y - 5)}" y2="${sx(y + 5)}" stroke="${col}" stroke-width="2"/><circle cx="${sx(X(r.est))}" cy="${sx(y)}" r="5" fill="${r.sig ? FX.drop : '#ffffff'}" stroke="${r.sig ? FX.drop : FX.ink3}" stroke-width="1.6"/>`;
    s += svgT(W - right + 14, y + 4, `${fmt(r.est)}  [${fmt(r.lo)}; ${fmt(r.hi)}]`, { size: 11.5, fill: r.sig ? FX.ink : FX.ink2 });
  });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}

/* ---- charts */
function vizHTMT(R) {
  const J = reflIdx(R); if (J.length < 2) return null;
  const H = R.A.HTMT, rows = J.slice(1), cols = J.slice(0, -1), st = v => (v >= 0.90 ? 'fail' : v >= 0.85 ? 'warn' : 'pass');
  return heatSVG({ title: tl('Heatmap HTMT', 'HTMT heatmap'), sub: tl(`Hijau < ${k2(0.85)}; kuning ${k2(0.85)}–${k2(0.90)}; merah ≥ ${k2(0.90)} (Henseler dkk., 2015).`, `Green < ${k2(0.85)}; amber ${k2(0.85)}–${k2(0.90)}; red ≥ ${k2(0.90)} (Henseler et al., 2015).`),
    rows: rows.map(j => R.lv[j]), cols: cols.map(j => R.lv[j]), val: (a, b) => (b <= a ? H[rows[a]][cols[b]] : null), color: v => STC[st(v)], tcol: v => STT[st(v)], cw: 66, ch: 34,
    legend: [[STC.pass, tl('memenuhi', 'met')], [STC.warn, tl('batas longgar', 'lenient limit')], [STC.fail, tl('tidak memenuhi', 'not met')]] });
}
function vizFL(R) {
  const J = measJ(R); if (J.length < 2) return null;
  const C = R.opts.plsc && R.A.est.Rc ? R.A.est.Rc : R.A.est.Rlv, sq = j => (R.refl[j] ? Math.sqrt(R.A.AVE[j]) : NaN);
  return heatSVG({ title: tl('Korelasi konstruk dan akar AVE (Fornell-Larcker)', 'Construct correlations and square root of AVE (Fornell-Larcker)'), sub: tl('Diagonal = akar AVE; sel bergaris merah = korelasi lebih besar dari akar AVE salah satu konstruknya.', 'Diagonal = square root of AVE; red-outlined cells = correlation larger than the square root of AVE of either construct.'),
    rows: J.map(j => R.lv[j]), cols: J.map(j => R.lv[j]), val: (a, b) => (b < a ? C[J[a]][J[b]] : b === a ? sq(J[a]) : null), cw: 64, ch: 34,
    color: (v, a, b) => (a === b ? '#ecebef' : v >= 0 ? pinkScale(Math.abs(v)) : blueScale(Math.abs(v))), tcol: (v, a, b) => (a !== b && Math.abs(v) > 0.62 ? '#ffffff' : FX.ink),
    mark: (a, b, v) => (a === b ? 'own' : Math.abs(v) > Math.min(...[sq(J[a]), sq(J[b])].filter(Number.isFinite), Infinity) ? 'bad' : null) });
}
function vizCross(R) {
  const J = measJ(R), K = R.items.map((_, k) => k).filter(k => R.kind[R.blockOf[k]] !== 'int'), X = R.A.est.cross;
  return heatSVG({ title: 'Cross loadings', sub: tl('Sel bergaris tebal = loading pada konstruknya sendiri; garis merah = cross loading setara atau lebih besar dari loading sendiri.', 'Bold-outlined cells = loading on its own construct; red outline = a cross loading equal to or larger than the own loading.'),
    rows: K.map(k => R.items[k]), cols: J.map(j => R.lv[j]), val: (a, b) => X[K[a]][J[b]], cw: 58, ch: 22, fs: 11,
    color: v => (v >= 0 ? pinkScale(Math.abs(v)) : blueScale(Math.abs(v))), tcol: v => (Math.abs(v) > 0.62 ? '#ffffff' : FX.ink),
    mark: (a, b, v) => { const own = R.blockOf[K[a]]; return J[b] === own ? 'own' : v >= X[K[a]][own] - 1e-9 ? 'bad' : null; } });
}
function vizIndCor(R) {
  const useBase = !!R.A1, S = useBase ? R.A1.S : R.A.S, items = useBase ? R.base.items : R.items, blocks = useBase ? R.base.spec.blocks : R.spec.blocks;
  const K = useBase ? items.map((_, k) => k) : items.map((_, k) => k).filter(k => R.kind[R.blockOf[k]] === 'std'); if (K.length < 3 || !S) return null;
  const pos = new Map(K.map((k, i) => [k, i])), groups = blocks.map(b => b.filter(k => pos.has(k)).map(k => pos.get(k))).filter(b => b.length).map(b => [Math.min(...b), Math.max(...b) + 1]);
  const cw = Math.max(9, Math.min(30, Math.floor(760 / K.length)));
  return heatSVG({ title: tl('Korelasi antarindikator', 'Indicator correlations'), sub: tl('Kotak = indikator satu konstruk. Blok yang pekat dan luar blok yang pucat menandakan validitas konvergen dan diskriminan yang baik.', 'Boxes = indicators of one construct. Dense blocks and pale off-block areas indicate good convergent and discriminant validity.'),
    rows: K.map(k => items[k]), cols: K.map(k => items[k]), rot: true, cw, ch: cw, fs: cw < 14 ? 9 : 10.5, text: K.length <= 14, dec: 2, groups,
    val: (a, b) => (a === b ? 1 : S[K[a]][K[b]]), color: v => (v >= 0 ? pinkScale(v) : blueScale(-v)), tcol: v => (Math.abs(v) > 0.62 ? '#ffffff' : FX.ink),
    legend: [[pinkScale(0.25), tl('positif lemah', 'weak positive')], [pinkScale(0.8), tl('positif kuat', 'strong positive')], [blueScale(0.5), tl('negatif', 'negative')]] });
}
function vizOVIF(R) {
  const rows = [], st = v => (v < 3 ? 'pass' : v < 5 ? 'warn' : 'fail');
  R.spec.blocks.forEach((b, j) => { if (R.kind[j] === 'int' || b.length < 2) return; b.forEach((k, a) => { const v = R.A.outerVIF[j][a]; if (Number.isFinite(v)) rows.push({ label: `${R.items[k]} (${R.lv[j]})`, v, color: STB[st(v)] }); }); });
  if (!rows.length) return null;
  return hbarsSVG({ title: tl('Kolinearitas indikator (VIF luar)', 'Indicator collinearity (outer VIF)'), sub: tl('Garis putus-putus = batas 3 (ideal) dan 5. Terutama penting untuk indikator formatif.', 'Dashed lines = thresholds 3 (ideal) and 5. Especially relevant for formative indicators.'), rows, rh: rows.length > 30 ? 18 : 22, refs: [{ v: 3, label: '3', color: STB.warn }, { v: 5, label: '5', color: STB.fail }], tickDec: 1 });
}
function vizIVIF(R) {
  const rows = [], D = R.spec.D, st = v => (v < 3 ? 'pass' : v < 5 ? 'warn' : 'fail');
  R.lv.forEach((_, j) => R.lv.forEach((__, i) => { if (D[i][j]) { const v = R.A.innerVIF[i][j]; if (Number.isFinite(v)) rows.push({ label: `${R.lv[i]} → ${R.lv[j]}`, v, color: STB[st(v)] }); } }));
  if (!rows.length) return null;
  return hbarsSVG({ title: tl('Kolinearitas antarkonstruk (VIF dalam)', 'Construct collinearity (inner VIF)'), sub: tl('Garis putus-putus = batas 3 (ideal) dan 5.', 'Dashed lines = thresholds 3 (ideal) and 5.'), rows, refs: [{ v: 3, label: '3', color: STB.warn }, { v: 5, label: '5', color: STB.fail }], tickDec: 1 });
}
function vizF2(R) {
  const rows = R.hyp.filter(h => !h.mod).map(h => { const v = R.A.f2[h.i][h.j]; return { label: `${h.h} ${h.from} → ${h.to}`, v, color: v >= 0.35 ? FX.drop : v >= 0.15 ? '#e07b93' : v >= 0.02 ? '#efb3c1' : STB.mute }; }).filter(r => Number.isFinite(r.v));
  if (!rows.length) return null;
  const mx = Math.max(0.4, ...rows.map(r => r.v));
  return hbarsSVG({ title: tl('Ukuran efek (f²)', 'Effect size (f²)'), sub: tl('Pita = kategori Cohen: kecil 0,02, sedang 0,15, besar 0,35.', 'Bands = Cohen categories: small 0.02, medium 0.15, large 0.35.'), rows, max: mx,
    bands: [{ from: 0.02, to: 0.15, color: '#fbf1f3', label: tl('kecil', 'small') }, { from: 0.15, to: 0.35, color: '#f8e3e8', label: tl('sedang', 'medium') }, { from: 0.35, to: mx * 1.06, color: '#f4d2da', label: tl('besar', 'large') }] });
}
function vizEffects(R) {
  const B = R.A.est.B, T = R.A.total, reach = PLS.reachable(R.spec.D), order = PLS.topoOrder(R.spec.D) || R.lv.map((_, j) => j), rows = [];
  order.forEach(j => {
    if (R.kind[j] === 'int') return;
    const src = R.lv.map((_, i) => i).filter(i => i !== j && reach[i][j] && R.kind[i] !== 'int').map(i => ({ i, d: R.spec.D[i][j] ? B[i][j] : 0, t: T[i][j] })).filter(o => Number.isFinite(o.t)).sort((a, b) => Math.abs(b.t) - Math.abs(a.t));
    if (!src.length) return; rows.push({ head: R.lv[j] }); src.forEach(o => rows.push({ label: `${R.lv[o.i]} → ${R.lv[j]}`, d: o.d, ind: o.t - o.d, t: o.t }));
  });
  if (!rows.length) return null;
  const fs = 12.5, rh = 22, n = rows.length, lw = Math.max(90, ...rows.map(r => textW(r.label || r.head, fs))) + 14, left = 24 + lw, right = 230, top = 92, W = 980, H = top + n * rh + 44;
  const vals = rows.filter(r => !r.head).flatMap(r => [0, r.d, r.t]), lo = Math.min(0, ...vals), hi = Math.max(0, ...vals), pad = (hi - lo) * 0.06 || 0.1, a0 = lo - (lo < 0 ? pad : 0), a1 = hi + pad;
  const X = v => left + (v - a0) / (a1 - a0) * (W - left - right);
  let s = vTitle(tl('Dekomposisi efek: langsung dan tidak langsung', 'Effect decomposition: direct and indirect'), tl('Batang gelap = efek langsung; batang merah muda = efek tidak langsung; total ditulis di kanan. Dikelompokkan per konstruk tujuan.', 'Dark bars = direct effect; pink bars = indirect effect; the total is written on the right. Grouped by target construct.'));
  s += `<rect x="24" y="62" width="14" height="10" fill="${FX.ink}"/>` + svgT(44, 71, tl('langsung', 'direct'), { size: 11.5, fill: FX.ink2 }) + `<rect x="130" y="62" width="14" height="10" fill="${FX.drop}"/>` + svgT(150, 71, tl('tidak langsung', 'indirect'), { size: 11.5, fill: FX.ink2 });
  niceTicks(a0, a1, 6).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 6}" y2="${top + n * rh}" stroke="${FX.grid}"/>` + svgT(X(t), top + n * rh + 18, fmt(t, 2), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  s += `<line x1="${sx(X(0))}" x2="${sx(X(0))}" y1="${top - 6}" y2="${top + n * rh}" stroke="${FX.ink3}"/>`;
  rows.forEach((r, k) => {
    const y = top + k * rh;
    if (r.head) { s += svgT(24, y + rh / 2 + 4, tl(`Menuju ${r.head}`, `Into ${r.head}`), { size: 12, weight: 700, fill: FX.drop }); return; }
    s += svgT(left - 8, y + rh / 2 + 4, r.label, { size: fs, anchor: 'end' });
    if (r.d) s += `<rect x="${sx(Math.min(X(0), X(r.d)))}" y="${sx(y + 4)}" width="${sx(Math.abs(X(r.d) - X(0)))}" height="${rh - 8}" fill="${FX.ink}"/>`;
    if (Math.abs(r.ind) > 1e-9) s += `<rect x="${sx(Math.min(X(r.d), X(r.t)))}" y="${sx(y + 4)}" width="${sx(Math.abs(X(r.t) - X(r.d)))}" height="${rh - 8}" fill="${FX.drop}"/>`;
    s += svgT(W - right + 12, y + rh / 2 + 4, tl(`total ${fmt(r.t)} = ${fmt(r.d)} + ${fmt(r.ind)}`, `total ${fmt(r.t)} = ${fmt(r.d)} + ${fmt(r.ind)}`), { size: 11.5, fill: FX.ink2 });
  });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function vizFit(R) {
  const f = R.A.fit; if (!f || !f.saturated) return null;
  const rows = [{ label: tl('SRMR model jenuh', 'SRMR saturated model'), v: f.saturated.srmr }, { label: tl('SRMR model estimasi', 'SRMR estimated model'), v: f.estimated.srmr }].filter(r => Number.isFinite(r.v)).map(r => Object.assign(r, { color: r.v < 0.08 ? STB.pass : r.v < 0.10 ? STB.warn : STB.fail, note: fmt(r.v) }));
  if (!rows.length) return null;
  return hbarsSVG({ title: tl('Model fit: SRMR', 'Model fit: SRMR'), sub: tl('Garis putus-putus = batas 0,08 (umum) dan 0,10 (longgar).', 'Dashed lines = thresholds 0.08 (common) and 0.10 (lenient).'), rows, rh: 30, max: 0.12, refs: [{ v: 0.08, label: '0.08', color: STB.warn }, { v: 0.10, label: '0.10', color: STB.fail }] });
}
function vizWeights(R) {
  const al = R.boot ? R.boot.alpha : 0.05, rows = [];
  R.spec.blocks.forEach((b, j) => { if (R.refl[j] || R.kind[j] === 'int') return; b.forEach((k, a) => { const s = R.boot ? R.bootWeight.get(k) : null, sig = !!(s && s.P < al); rows.push({ label: `${R.items[k]} (${R.lv[j]})`, v: R.A.est.W[j][a], color: R.boot ? (sig ? FX.drop : STB.mute) : FX.ink, note: fmt(R.A.est.W[j][a]) + (s ? ` (${fmtP(s.P)})` : '') }); }); });
  if (!rows.length) return null;
  return hbarsSVG({ title: tl('Outer weights indikator formatif', 'Outer weights of formative indicators'), sub: R.boot ? tl('Merah = signifikan; abu-abu = tidak signifikan (p dalam kurung). Weight tidak signifikan dapat dipertahankan bila loading-nya ≥ 0,50.', 'Red = significant; gray = not significant (p in brackets). A non-significant weight may be kept if its loading is ≥ 0.50.') : '', rows, min: Math.min(0, ...rows.map(r => r.v)), right: 130 });
}
function kde(d, lo, hi, n) {
  const nb = 240, w = (hi - lo) / nb, c = new Float64Array(nb); let N = 0, s1 = 0, s2 = 0;
  for (let q = 0; q < d.length; q++) { const v = d[q]; if (!Number.isFinite(v)) continue; const b = Math.floor((v - lo) / w); if (b >= 0 && b < nb) c[b]++; N++; s1 += v; s2 += v * v; }
  const sd = Math.sqrt(Math.max(1e-12, s2 / N - (s1 / N) ** 2)), h = Math.max(1.06 * sd * Math.pow(Math.max(N, 2), -0.2), w) / w, out = new Float64Array(n), r = Math.ceil(3 * h);
  for (let g = 0; g < n; g++) { const x = g / (n - 1) * nb; let acc = 0; for (let b = Math.max(0, Math.floor(x - r)); b < Math.min(nb, Math.ceil(x + r)); b++) { const z = (b + 0.5 - x) / h; acc += c[b] * Math.exp(-0.5 * z * z); } out[g] = acc; }
  return out;
}
function vizRidge(R) {
  if (!R.boot) return null;
  const m = new Map(R.boot.paths.map(x => [x.key.join(','), x])), al = R.boot.alpha, rows = R.hyp.map(h => ({ h, x: m.get(h.i + ',' + h.j) })).filter(o => o.x && o.x.d && o.x.s);
  if (!rows.length) return null;
  const q = (arr, p) => { const a = Array.from(arr).filter(Number.isFinite).sort((u, v) => u - v); return PLS.quantile7(a, p); };
  let lo = 0, hi = 0; rows.forEach(o => { lo = Math.min(lo, q(o.x.d, 0.003), o.x.s.O); hi = Math.max(hi, q(o.x.d, 0.997), o.x.s.O); }); const pad = (hi - lo) * 0.04; lo -= pad; hi += pad;
  const fs = 12.5, rh = 44, n = rows.length, lw = Math.max(90, ...rows.map(o => textW(`${o.h.h} ${o.h.from} → ${o.h.to}`, fs))) + 14, left = 24 + lw, right = 220, top = 84, W = 980, H = top + n * rh + 40, G = 140;
  const X = v => left + (v - lo) / (hi - lo) * (W - left - right);
  let s = vTitle(tl('Distribusi bootstrap koefisien jalur', 'Bootstrap distributions of the path coefficients'), tl(`Kurva = sebaran ${fmtInt(R.boot.B)} estimasi bootstrap; area berwarna = interval kepercayaan; merah = signifikan; garis putus-putus = nol.`, `Curves = distribution of ${fmtInt(R.boot.B)} bootstrap estimates; shaded area = confidence interval; red = significant; dashed line = zero.`));
  niceTicks(lo, hi, 6).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 6}" y2="${top + n * rh}" stroke="${FX.grid}"/>` + svgT(X(t), top + n * rh + 18, fmt(t, 2), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  rows.forEach((o, k) => {
    const st = o.x.s, sig = st.P < al, base = top + (k + 1) * rh - 5, dens = kde(o.x.d, lo, hi, G), mx = Math.max(...dens) || 1, px = g => X(lo + (hi - lo) * g / (G - 1)), py = g => base - dens[g] / mx * (rh - 8);
    let full = `M${sx(px(0))},${base}`; for (let g = 0; g < G; g++) full += ` L${sx(px(g))},${sx(py(g))}`; full += ` L${sx(px(G - 1))},${base} Z`;
    const g0 = Math.max(0, Math.ceil((st.lo - lo) / (hi - lo) * (G - 1))), g1 = Math.min(G - 1, Math.floor((st.hi - lo) / (hi - lo) * (G - 1)));
    let ci = `M${sx(X(st.lo))},${base}`; for (let g = g0; g <= g1; g++) ci += ` L${sx(px(g))},${sx(py(g))}`; ci += ` L${sx(X(st.hi))},${base} Z`;
    s += `<path d="${full}" fill="#f1f2f5" stroke="${FX.ink3}" stroke-width="1"/><path d="${ci}" fill="${sig ? 'rgba(210,64,95,0.38)' : 'rgba(154,158,170,0.38)'}" stroke="none"/><line x1="${left}" x2="${W - right}" y1="${base}" y2="${base}" stroke="${FX.grid}"/>`;
    s += `<circle cx="${sx(X(st.O))}" cy="${base}" r="3.6" fill="${sig ? FX.drop : FX.ink}"/>` + svgT(left - 8, base - 6, `${o.h.h} ${o.h.from} → ${o.h.to}`, { size: fs, anchor: 'end' });
    s += svgT(W - right + 12, base - 6, `β ${fmt(st.O)}; ${fmtPtxt(st.P)}`, { size: 11.5, fill: sig ? FX.ink : FX.ink2, weight: sig ? 600 : 400 });
  });
  s += `<line x1="${sx(X(0))}" x2="${sx(X(0))}" y1="${top - 6}" y2="${top + n * rh}" stroke="${FX.ink}" stroke-dasharray="5 4"/>`;
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function vizIndirect(R) {
  if (!R.boot || !R.boot.chains.length) return null;
  const al = R.boot.alpha, rows = R.boot.chains.filter(c => c.s && c.key.every(i => R.kind[i] !== 'int')).map(c => ({ label: c.key.map(i => R.lv[i]).join(' → '), est: c.s.O, lo: c.s.lo, hi: c.s.hi, sig: c.s.P < al }));
  if (!rows.length) return null;
  return forestSVG({ title: tl('Efek tidak langsung dan interval kepercayaannya', 'Indirect effects and their confidence intervals'), sub: tl(`Titik merah = signifikan (interval tidak memuat nol); interval ${pctLabel(R.boot.lo)}–${pctLabel(R.boot.hi)} dari bootstrapping.`, `Red dots = significant (interval excludes zero); ${pctLabel(R.boot.lo)}–${pctLabel(R.boot.hi)} bootstrap intervals.`), rows });
}
function vizRMSE(R) {
  const P = R.pred; if (!P || !P.items || !P.items.length) return null;
  const rows = P.items, fs = 12.5, rh = 26, n = rows.length, lw = Math.max(70, ...rows.map(x => textW(R.items[x.k], fs))) + 14, left = 24 + lw, right = 150, top = 92, W = 960, H = top + n * rh + 44;
  const vals = rows.flatMap(x => [x.rmsePLS, x.rmseLM]).filter(Number.isFinite), lo = Math.min(...vals) * 0.92, hi = Math.max(...vals) * 1.06, X = v => left + (v - lo) / (hi - lo) * (W - left - right);
  let s = vTitle(tl('PLSpredict: RMSE model PLS dibanding regresi linear', 'PLSpredict: RMSE of the PLS model versus linear regression'), tl('Titik merah = PLS lebih akurat (RMSE lebih kecil) daripada tolok ukur LM; Q²predict di kanan.', 'Red dots = PLS is more accurate (smaller RMSE) than the LM benchmark; Q²predict on the right.'));
  s += `<circle cx="30" cy="68" r="5" fill="${FX.drop}"/>` + svgT(40, 72, 'PLS', { size: 11.5, fill: FX.ink2 }) + `<circle cx="84" cy="68" r="5" fill="#ffffff" stroke="${FX.ink}" stroke-width="1.6"/>` + svgT(94, 72, tl('LM (regresi linear)', 'LM (linear regression)'), { size: 11.5, fill: FX.ink2 }) + svgT(W - right + 16, 72, 'Q²predict', { size: 11.5, fill: FX.ink2, weight: 600 });
  niceTicks(lo, hi, 6).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 6}" y2="${top + n * rh}" stroke="${FX.grid}"/>` + svgT(X(t), top + n * rh + 18, fmt(t, 2), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  rows.forEach((x, k) => {
    const y = top + k * rh + rh / 2, better = x.rmsePLS < x.rmseLM;
    s += svgT(left - 8, y + 4, R.items[x.k], { size: fs, anchor: 'end' }) + `<line x1="${sx(X(x.rmsePLS))}" x2="${sx(X(x.rmseLM))}" y1="${sx(y)}" y2="${sx(y)}" stroke="${FX.ink3}" stroke-width="2"/><circle cx="${sx(X(x.rmseLM))}" cy="${sx(y)}" r="5" fill="#ffffff" stroke="${FX.ink}" stroke-width="1.6"/><circle cx="${sx(X(x.rmsePLS))}" cy="${sx(y)}" r="5.5" fill="${better ? FX.drop : FX.ink}"/>`;
    s += svgT(W - right + 16, y + 4, fmt(x.q2), { size: 11.5, fill: x.q2 > 0 ? FX.ink : FX.fail });
  });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function vizSpecs(R) {
  const out = [], add = (sec, key, file, title, f) => { try { const r = f(); if (r) out.push(Object.assign({ key, file, sec, title, caption: '', viz: true }, r)); } catch (e) { console.error(key, e); } };
  add('desc', 'v-indcor', tl('korelasi-indikator', 'indicator-correlations'), tl('Korelasi antarindikator', 'Indicator correlations'), () => vizIndCor(R));
  add('weights', 'v-weights', tl('outer-weights-formatif', 'formative-outer-weights'), tl('Outer weights formatif', 'Formative outer weights'), () => vizWeights(R));
  add('fl', 'v-fl', tl('korelasi-konstruk-fornell-larcker', 'construct-correlations-fornell-larcker'), 'Fornell-Larcker', () => vizFL(R));
  add('htmt', 'v-htmt', 'htmt-heatmap', 'HTMT', () => vizHTMT(R));
  add('cross', 'v-cross', 'cross-loadings-heatmap', 'Cross loadings', () => vizCross(R));
  add('ovif', 'v-ovif', tl('vif-luar', 'outer-vif'), tl('VIF luar', 'Outer VIF'), () => vizOVIF(R));
  add('f2', 'v-f2', 'f2', 'f²', () => vizF2(R));
  add('ivif', 'v-ivif', tl('vif-dalam', 'inner-vif'), tl('VIF dalam', 'Inner VIF'), () => vizIVIF(R));
  add('effects', 'v-effects', tl('dekomposisi-efek', 'effect-decomposition'), tl('Dekomposisi efek', 'Effect decomposition'), () => vizEffects(R));
  add('fit', 'v-fit', 'srmr', 'SRMR', () => vizFit(R));
  add('bpaths', 'v-ridge', tl('distribusi-bootstrap', 'bootstrap-distributions'), tl('Distribusi bootstrap', 'Bootstrap distributions'), () => vizRidge(R));
  add('bindirect', 'v-indirect', tl('efek-tidak-langsung', 'indirect-effects'), tl('Efek tidak langsung', 'Indirect effects'), () => vizIndirect(R));
  add('predict', 'v-rmse', tl('plspredict-rmse', 'plspredict-rmse'), 'RMSE PLS vs LM', () => vizRMSE(R));
  return out;
}
figureSpecs = (f => (R, all) => f(R, all).concat(vizSpecs(R)))(figureSpecs);
const VIZ_SEC = { desc: ['v-indcor'], loadings: ['loadings'], weights: ['v-weights'], reliability: ['reliability', 'ave'], fl: ['v-fl'], htmt: ['v-htmt'], cross: ['v-cross'], ovif: ['v-ovif'], paths: ['r2'], f2: ['v-f2'], ivif: ['v-ivif'], effects: ['v-effects'], fit: ['v-fit'], bpaths: ['forest', 'v-ridge'], bindirect: ['v-indirect'], predict: ['q2', 'v-rmse'] };
function vizAll(R) { const k = `${I18N.lang}|${state.view.decimals}|${state.view.comma}`; if (!R._viz || R._viz.k !== k) R._viz = { k, list: figureSpecs(R, false) }; return R._viz.list; }
function vizBlock(id, R) {
  const keys = VIZ_SEC[id]; if (!keys) return '';
  const L = vizAll(R).filter(f => keys.includes(f.key)).sort((a, b) => keys.indexOf(a.key) - keys.indexOf(b.key)); if (!L.length) return '';
  return `<div class="viz-row">${L.map(f => `<figure class="viz">${f.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}${STATIC ? '' : `<figcaption class="viz-dl"><button class="btn btn-quiet" data-action="viz-dl" data-key="${f.key}" data-fmt="svg">SVG</button><button class="btn btn-quiet" data-action="viz-dl" data-key="${f.key}" data-fmt="png">PNG</button></figcaption>`}</figure>`).join('')}</div>`;
}

/* ---- editable results path diagram */
function dgEditBar() {
  return `<div class="dg-edit-bar"><span class="small muted">${tl('Seret konstruk atau label angka untuk merapikan diagram; klik konstruk untuk memindah letak indikatornya; klik garis jalur untuk membuatnya lurus atau melengkung. Perubahan tersimpan di proyek dan ikut ke semua ekspor.', 'Drag constructs or number labels to tidy the diagram; click a construct to move its indicators; click a path line to make it straight or curved. Changes are saved in the project and carried into every export.')}</span><span class="row" style="gap:6px"><button class="btn btn-quiet" data-action="dg-tidy">${tl('Rapikan label', 'Tidy labels')}</button><button class="btn btn-quiet" data-action="dg-reset">${tl('Atur ulang tata letak', 'Reset layout')}</button></span></div>`;
}
const resDgOpts = R => { const show = R.boot ? state.view.diagram : 'coef'; return { idp: 'rs', values: diagramValues(R, show), show, alpha: R.boot ? R.boot.alpha : 0.05, standalone: false, style: dgStyle() }; };
function dgRedraw(box) { const R = state.results, el = $('#res-dg'); if (!R || !el) return; el.innerHTML = diagramSVG(R.model, Object.assign(resDgOpts(R), box ? { box } : {})); if (R._viz) R._viz = null; }
function dgSet(fn) { [state.results && state.results.model, M()].forEach(m => { if (m) fn(m); }); dirty = true; }
function dgPop(cid, e) {
  const pop = $('#dg-pop'); if (!pop) return; if (!cid) { pop.hidden = true; return; }
  const R = state.results, c = R.model.constructs.find(x => x.id === cid); if (!c || !c.items.length) { pop.hidden = true; return; }
  const st = pop.parentElement.getBoundingClientRect(), sides = [['auto', tl('Otomatis', 'Auto')], ['left', tl('Kiri', 'Left')], ['top', tl('Atas', 'Top')], ['right', tl('Kanan', 'Right')], ['bottom', tl('Bawah', 'Bottom')]];
  pop.innerHTML = `<b>${tl('Letak indikator', 'Indicator position')} ${esc(c.name)}</b><div class="seg">${sides.map(([v, l]) => `<button data-action="dg-side" data-cid="${cid}" data-v="${v}" aria-pressed="${(c.side || 'auto') === v}">${l}</button>`).join('')}</div>`;
  pop.hidden = false; const w = pop.offsetWidth || 300;
  pop.style.left = Math.max(8, Math.min(st.width - w - 8, e.clientX - st.left + 12)) + 'px'; pop.style.top = (e.clientY - st.top + 12) + 'px';
}
function bindResultDiagram() {
  const el = $('#res-dg'); if (!el || el.dataset.bound) return; el.dataset.bound = '1'; let drag = null;
  const pt = e => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(el.querySelector('svg').getScreenCTM().inverse()); return { x: p.x, y: p.y }; };
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return; const g = e.target.closest('g.lv[data-cid], g[data-lid]'); dgPop(null);
    if (!g) { const pg = e.target.closest('g[data-pid]'); if (pg && !pg.dataset.lid && (e.target.classList.contains('hit') || e.target.classList.contains('sm-edge'))) { drag = { k: 'p', id: pg.dataset.pid, p: pt(e), moved: false }; el.setPointerCapture(e.pointerId); e.preventDefault(); } return; }
    const R = state.results, box = el.querySelector('svg').getAttribute('viewBox').split(/\s+/).map(Number), p = pt(e);
    if (g.matches('g.lv[data-cid]')) { const c = R.model.constructs.find(x => x.id === g.dataset.cid); if (!c) return; drag = { k: 'c', id: c.id, x0: c.x, y0: c.y, p, box, moved: false }; }
    else { if (!g.dataset.lid) return; drag = { k: 'l', id: g.dataset.lid, x0: +g.dataset.lx - +g.dataset.bx, y0: +g.dataset.ly - +g.dataset.by, p, box, moved: false }; }
    el.setPointerCapture(e.pointerId); el.classList.add('dragging'); e.preventDefault();
  });
  el.addEventListener('pointermove', e => {
    if (!drag || drag.k === 'p') return; const p = pt(e), dx = p.x - drag.p.x, dy = p.y - drag.p.y; if (!drag.moved && Math.hypot(dx, dy) < 3) return; drag.moved = true;
    if (drag.k === 'c') dgSet(m => { const c = m.constructs.find(x => x.id === drag.id); if (c) { c.x = Math.round(drag.x0 + dx); c.y = Math.round(drag.y0 + dy); } });
    else dgSet(m => { if (!m.labels) m.labels = {}; m.labels[drag.id] = { dx: Math.round(drag.x0 + dx), dy: Math.round(drag.y0 + dy) }; });
    dgRedraw(drag.box);
  });
  const end = e => { if (!drag) return; const d = drag; drag = null; el.classList.remove('dragging'); if (d.moved) dgRedraw(null); else if (e.type === 'pointerup') { if (d.k === 'c') dgPop(d.id, e); else if (d.k === 'p') dgPathPop(d.id, e); } };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}
document.addEventListener('pointerdown', e => { const pop = $('#dg-pop'); if (pop && !pop.hidden && !pop.contains(e.target) && !e.target.closest('#res-dg')) pop.hidden = true; });
const VIZ_ACTIONS = {
  'viz-dl': async el => {
    const R = state.results, f = R ? vizAll(R).find(x => x.key === el.dataset.key) : null; if (!f) return;
    const name = `${safeFile(state.name)}_${f.file || f.key}`;
    if (el.dataset.fmt === 'svg') download(name + '.svg', withFonts(f.svg), 'image/svg+xml'); else download(name + '.png', new Blob([(await svgToPng(f.svg, 2)).bytes], { type: 'image/png' }));
  },
  'dg-side': el => { const id = el.dataset.cid, v = el.dataset.v; dgSet(m => { const c = m.constructs.find(x => x.id === id); if (c) c.side = v; }); dgPop(null); dgRedraw(null); },
  'dg-tidy': () => { dgSet(m => { m.labels = {}; }); dgRedraw(null); toast(tl('Label kembali ke penempatan otomatis.', 'Labels returned to automatic placement.'), 'ok'); },
  'dg-reset': () => { autoLayout(); const pos = new Map(M().constructs.map(c => [c.id, c])); dgSet(m => { m.labels = {}; m.constructs.forEach(c => { const q = pos.get(c.id); if (q) { c.x = q.x; c.y = q.y; } c.side = 'auto'; }); m.paths.forEach(p => { delete p.curve; }); }); dgRedraw(null); toast(tl('Tata letak diagram diatur ulang.', 'Diagram layout reset.'), 'ok'); }
};
