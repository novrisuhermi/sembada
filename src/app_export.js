/* ================================================================ export: shared helpers */
const APP_VERSION = '1.11.3';
const APP_AUTHOR = { family: 'Suhermi', given: 'Novri', initials: 'N.' };
const APP_REPO = 'https://github.com/novrisuhermi/sembada';
function loadLib(id, name) {
  if (window[name]) return window[name];
  const el = document.getElementById(id); if (!el) throw new Error(tl('Pustaka ekspor tidak ditemukan di aplikasi.', 'The export library is missing from the app.'));
  const s = document.createElement('script'); s.textContent = el.textContent; document.head.appendChild(s);
  if (!window[name]) throw new Error(tl('Pustaka ekspor gagal dimuat.', 'The export library could not be loaded.'));
  return window[name];
}
let BUSY = false;
async function withBusy(msg, fn) {
  if (BUSY) { toast(tl('Masih ada ekspor yang sedang disiapkan.', 'Another export is still being prepared.')); return; }
  BUSY = true; const m = $('#export-menu'); if (m) m.open = false; toast(msg);
  try { await fn(); } catch (e) { console.error(e); toast(tl('Gagal membuat file: ', 'Could not create the file: ') + (e && e.message ? e.message : e), 'err'); } finally { BUSY = false; }
}
const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
function svgToPng(svg, scale, transparent) {
  svg = withFonts(svg);
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight, cv = document.createElement('canvas');
      cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
      const g = cv.getContext('2d'); if (!transparent) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, cv.width, cv.height); } g.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      cv.toBlob(b => { if (!b) { reject(new Error('PNG')); return; } b.arrayBuffer().then(buf => resolve({ bytes: new Uint8Array(buf), w, h }), reject); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(tl('gambar tidak dapat dirender', 'the image could not be rendered'))); };
    img.src = url;
  });
}
const stTxt = () => ({ pass: tl('Memenuhi', 'Met'), warn: tl('Perlu perhatian', 'Needs attention'), fail: tl('Tidak memenuhi', 'Not met'), info: tl('Informasi', 'Information') });
const ST_HEX = { pass: '22744E', warn: '9C5D0C', fail: 'B3261E', mute: '9A9EAA', info: '5D6270' };
const ST_BG = { pass: 'E8F4ED', warn: 'FBF1E1', fail: 'FBE9E7' };
function tmToCells(tm) {
  const rows = tm.rows.filter(r => !(r && r.grp !== undefined)).map(r => r.map((c, i) => {
    const obj = c && typeof c === 'object', isText = obj ? c.t !== undefined && !c.num : typeof c === 'string', st = obj ? c.st : null;
    return { text: cellText(c), align: i === 0 || isText ? 'l' : 'r', b: !!(obj && c.b), color: ST_HEX[st], fill: ST_BG[st] };
  }));
  const head = tm.head.map((h, i) => ({ text: h, align: rows[0] ? rows[0][i].align : 'l', b: true }));
  return { head, rows };
}
// column widths in twips: every column first gets room for its content (up to cap characters); the rest goes to long-text columns
const wordLen = t => Math.max(0, ...String(t).split(/\s+/).map(w => w.length));
const colNeeds = (head, rows) => head.map((h, i) => Math.max(wordLen(h && h.text !== undefined ? h.text : h), ...rows.map(r => { const c = r[i]; return String(c === undefined || c === null ? '' : c.text !== undefined ? c.text : c).length; })));
// numeric columns keep the width their numbers need (they never wrap); text columns share the rest and may wrap at spaces
function fitWidths(need, numeric, total, fs, pad) {
  const n = need.length, twN = fs * 5.2, twT = fs * 6.2, w = new Array(n), fix = a => { a[n - 1] += total - a.reduce((x, y) => x + y, 0); return a; };
  const fixed = i => Math.round(Math.min(Math.max(need[i], 1), 16) * twN + pad), mn = i => Math.round(Math.min(Math.max(need[i], 1), 8) * twT + pad), ds = i => Math.round(Math.min(Math.max(need[i], 1), 20) * twT + pad);
  const T = []; let numSum = 0;
  for (let i = 0; i < n; i++) { if (numeric[i]) { w[i] = fixed(i); numSum += w[i]; } else T.push(i); }
  const avail = total - numSum, sMin = T.reduce((a, i) => a + mn(i), 0), sDes = T.reduce((a, i) => a + ds(i), 0);
  if (!T.length || sMin > avail) { const all = need.map((c, i) => (numeric[i] ? fixed(i) : mn(i))), s = all.reduce((a, b) => a + b, 0); return fix(all.map(v => Math.floor(v * total / s))); }
  if (sDes <= avail) { const rest = avail - sDes, ex = T.map(i => Math.max(0, need[i] - 20)), se = ex.reduce((a, b) => a + b, 0); T.forEach((i, k) => { w[i] = ds(i) + Math.floor(rest * (se ? ex[k] / se : ds(i) / sDes)); }); }
  else { const k = (avail - sMin) / (sDes - sMin); T.forEach(i => { w[i] = Math.floor(mn(i) + k * (ds(i) - mn(i))); }); }
  return fix(w);
}
const autoWidths = (head, rows) => head.map((h, i) => Math.max(4, Math.min(40, Math.max(String(h.text).length * 0.9, ...rows.map(r => (r[i] ? String(r[i].text).length : 0))))));
const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out.length ? out : [[]]; };

/* ================================================================ figures (standalone SVG, literal colours) */
const FX = { ink: '#262a33', ink2: '#5d6270', ink3: '#9a9eaa', grid: '#ebe7ea', drop: '#d2405f', fail: '#b3261e', warn: '#b07012' };
const FXFONT = 'Segoe UI, Helvetica Neue, Arial, sans-serif';
const sx = v => String(Math.round(v * 10) / 10);
const svgDoc = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FXFONT}"><rect width="${w}" height="${h}" fill="#ffffff"/>${body}</svg>`;
const svgT = (x, y, s, o) => { o = o || {}; return `<text x="${sx(x)}" y="${sx(y)}" font-size="${o.size || 13}" fill="${o.fill || FX.ink}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}>${esc(s)}</text>`; };
function niceTicks(lo, hi, n) {
  const raw = (hi - lo) / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag, step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag, out = [];
  for (let t = Math.ceil(lo / step - 1e-9) * step; t <= hi + 1e-9; t += step) out.push(Math.round(t / step) * step);
  return out;
}
function figHBar(o) {
  const n = o.labels.length, W = 960, left = Math.min(360, Math.max(100, Math.max(...o.labels.map(l => textW(l, 13))) + 26)), right = 72, top = o.subtitle ? 84 : 64, rh = 26, H = top + n * rh + 48;
  const vals = o.values.filter(Number.isFinite), refs = o.refs || [];
  let lo = Math.min(0, ...vals, ...refs.map(r => r.v)), hi = Math.max(o.hi || 0, ...vals, ...refs.map(r => r.v)); if (!(hi > lo)) hi = lo + 1;
  const pad = (hi - lo) * 0.04; if (lo < 0) lo -= pad; hi += pad;
  const X = v => left + (v - lo) / (hi - lo) * (W - left - right), x0 = X(0);
  let s = svgT(left, 32, o.title, { size: 18, weight: 700 }) + (o.subtitle ? svgT(left, 55, o.subtitle, { size: 13, fill: FX.ink2 }) : '');
  niceTicks(lo, hi, 5).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 4}" y2="${top + n * rh}" stroke="${FX.grid}"/>` + svgT(X(t), top + n * rh + 19, fmt(t, 2), { size: 11.5, fill: FX.ink2, anchor: 'middle' }); });
  s += `<line x1="${sx(x0)}" x2="${sx(x0)}" y1="${top - 4}" y2="${top + n * rh}" stroke="${FX.ink3}"/>`;
  o.labels.forEach((l, i) => {
    const y = top + i * rh, v = o.values[i];
    s += svgT(left - 10, y + 17.5, l, { size: 13, anchor: 'end' });
    if (!Number.isFinite(v)) return;
    const x1 = X(v);
    s += `<rect x="${sx(Math.min(x0, x1))}" y="${y + 5}" width="${sx(Math.abs(x1 - x0))}" height="16" rx="2" fill="${o.color ? o.color(v, i) : FX.ink}"/>` + svgT(v >= 0 ? x1 + 6 : x1 - 6, y + 17.5, fmt(v), { size: 12, fill: FX.ink2, anchor: v >= 0 ? 'start' : 'end' });
  });
  refs.forEach(r => { const x = X(r.v); s += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${top - 8}" y2="${top + n * rh + 2}" stroke="${FX.drop}" stroke-width="1.6" stroke-dasharray="6 4"/>` + svgT(x, top - 13, r.text, { size: 11.5, fill: FX.drop, anchor: 'middle' }); });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function figGrouped(o) {
  const nc = o.cats.length, ns = o.series.length, bh = 12, gap = 3, grp = ns * (bh + gap) + 16, W = 960, left = Math.max(100, Math.max(...o.cats.map(c => textW(c, 13))) + 26), right = 72, top = 96, H = top + nc * grp + 44;
  const hi = Math.max(1, ...o.series.flatMap(se => se.values).filter(Number.isFinite)) * 1.04, X = v => left + Math.max(0, v) / hi * (W - left - right);
  let s = svgT(left, 32, o.title, { size: 18, weight: 700 }), lx = left;
  o.series.forEach(se => { s += `<rect x="${sx(lx)}" y="47" width="13" height="13" rx="2" fill="${se.color}"/>` + svgT(lx + 19, 58, se.name, { size: 13, fill: FX.ink2 }); lx += 40 + textW(se.name, 13); });
  niceTicks(0, hi, 5).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 4}" y2="${top + nc * grp - 12}" stroke="${FX.grid}"/>` + svgT(X(t), top + nc * grp + 7, fmt(t, 2), { size: 11.5, fill: FX.ink2, anchor: 'middle' }); });
  o.cats.forEach((c, i) => {
    const y0 = top + i * grp;
    s += svgT(left - 10, y0 + ns * (bh + gap) / 2 + 4, c, { size: 13, anchor: 'end' });
    o.series.forEach((se, k) => { const v = se.values[i]; if (!Number.isFinite(v)) return; const y = y0 + k * (bh + gap); s += `<rect x="${left}" y="${y}" width="${sx(X(v) - left)}" height="${bh}" rx="2" fill="${se.color}"/>` + svgT(X(v) + 5, y + bh - 1.5, fmt(v), { size: 11, fill: FX.ink2 }); });
  });
  (o.refs || []).forEach(r => { const x = X(r.v); s += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${top - 10}" y2="${top + nc * grp - 10}" stroke="${FX.drop}" stroke-width="1.6" stroke-dasharray="6 4"/>` + svgT(x, top - 15, r.text, { size: 11.5, fill: FX.drop, anchor: 'middle' }); });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function figForest(R) {
  const a = R.boot.alpha, rows = R.hyp.map(h => ({ h, s: R.bootPath.get(h.i + ',' + h.j) })).filter(r => r.s);
  const labels = rows.map(r => `${r.h.h}   ${r.h.from} → ${r.h.to}`);
  const W = 960, left = Math.max(150, Math.max(...labels.map(l => textW(l, 13))) + 26), right = 210, top = 92, rh = 32, H = top + rows.length * rh + 50;
  let lo = Math.min(0, ...rows.map(r => r.s.lo)), hi = Math.max(0, ...rows.map(r => r.s.hi)); const pad = (hi - lo) * 0.06 || 0.1; lo -= pad; hi += pad;
  const X = v => left + (v - lo) / (hi - lo) * (W - left - right);
  let s = svgT(left, 32, tl('Koefisien jalur dan interval kepercayaan', 'Path coefficients and confidence intervals'), { size: 18, weight: 700 }) + svgT(left, 55, tl(`Titik = koefisien (O); garis = CI ${pctLabel(R.boot.lo)}–${pctLabel(R.boot.hi)} dari ${fmtInt(R.boot.B)} subsampel. Abu-abu = tidak signifikan.`, `Dot = coefficient (O); line = ${pctLabel(R.boot.lo)}–${pctLabel(R.boot.hi)} CI from ${fmtInt(R.boot.B)} subsamples. Grey = not significant.`), { size: 13, fill: FX.ink2 });
  niceTicks(lo, hi, 6).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top - 6}" y2="${top + rows.length * rh}" stroke="${FX.grid}"/>` + svgT(X(t), top + rows.length * rh + 20, fmt(t, 2), { size: 11.5, fill: FX.ink2, anchor: 'middle' }); });
  s += `<line x1="${sx(X(0))}" x2="${sx(X(0))}" y1="${top - 10}" y2="${top + rows.length * rh + 2}" stroke="${FX.drop}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  rows.forEach((r, i) => {
    const y = top + i * rh + rh / 2, sig = r.s.P < a, c = sig ? FX.ink : FX.ink3;
    s += svgT(left - 14, y + 4.5, labels[i], { size: 13, anchor: 'end', fill: sig ? FX.ink : FX.ink2 });
    s += `<line x1="${sx(X(r.s.lo))}" x2="${sx(X(r.s.hi))}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="2.4"/><line x1="${sx(X(r.s.lo))}" x2="${sx(X(r.s.lo))}" y1="${y - 6}" y2="${y + 6}" stroke="${c}" stroke-width="2"/><line x1="${sx(X(r.s.hi))}" x2="${sx(X(r.s.hi))}" y1="${y - 6}" y2="${y + 6}" stroke="${c}" stroke-width="2"/><circle cx="${sx(X(r.s.O))}" cy="${y}" r="6" fill="${sig ? FX.ink : '#ffffff'}" stroke="${c}" stroke-width="2"/>`;
    s += svgT(W - right + 22, y + 4.5, `β ${fmt(r.s.O)}   p ${fmtP(r.s.P)}`, { size: 12.5, fill: sig ? FX.ink : FX.ink2, weight: sig ? 600 : 400 });
  });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function figLikert(R) {
  const F = R.freq, cols = catColors(F.cats.length), labels = catLabels(F.cats);
  const W = 960, left = Math.max(80, Math.max(...R.base.items.map(l => textW(l, 13))) + 24), right = 70, top = 92, rh = 25, H = top + R.base.items.length * rh + 22;
  let s = svgT(left, 32, tl('Sebaran jawaban per indikator', 'Response distribution by indicator'), { size: 18, weight: 700 }), lx = left;
  labels.forEach((l, i) => { s += `<rect x="${sx(lx)}" y="47" width="13" height="13" rx="2" fill="${cols[i]}"/>` + svgT(lx + 19, 58, l, { size: 12.5, fill: FX.ink2 }); lx += 36 + textW(l, 12.5); });
  const BW = W - left - right;
  R.base.items.forEach((it, k) => {
    const m = F.per[k], n = Array.from(m.values()).reduce((a, x) => a + x, 0), y = top + k * rh;
    s += svgT(left - 10, y + 16.5, it, { size: 13, anchor: 'end' });
    let x = left;
    F.cats.forEach((c, i) => { const cnt = m.get(c) || 0, pct = n ? cnt / n : 0, w = pct * BW; if (!cnt) return; s += `<rect x="${sx(x)}" y="${y + 3}" width="${sx(w)}" height="19" fill="${cols[i]}"/>`; if (pct >= 0.07) s += svgT(x + w / 2, y + 16.5, Math.round(pct * 100) + '%', { size: 11, anchor: 'middle', fill: isLight(cols[i]) ? FX.ink : '#ffffff' }); x += w; });
    s += svgT(W - right + 10, y + 16.5, 'n = ' + n, { size: 11.5, fill: FX.ink2 });
  });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
// figure specs are built synchronously in the current language; PNGs are rendered afterwards
function figureSpecs(R, all) {
  const e = R.A.est, out = [], refl = reflIdx(R);
  const add = (key, file, title, caption, f) => out.push(Object.assign({ key, file, title, caption }, f));
  const dg = show => { const svg = diagramSVG(R.model, { idp: 'fx' + show, values: diagramValues(R, show), show, alpha: R.boot ? R.boot.alpha : 0.05, standalone: true, style: dgStyle() }); const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/); return { svg, w: +m[1], h: +m[2] }; };
  const dgInfo = { coef: [tl('diagram-jalur-koefisien', 'path-diagram-coefficients'), tl('koefisien jalur', 'path coefficients')], coefp: [tl('diagram-jalur-p-value', 'path-diagram-p-values'), tl('koefisien jalur dan p value', 'path coefficients and p values')], t: [tl('diagram-jalur-t-statistik', 'path-diagram-t-values'), tl('t statistik', 't statistics')], coefs: [tl('diagram-jalur-bintang', 'path-diagram-stars'), tl('koefisien jalur dan bintang signifikansi', 'path coefficients and significance stars')] };
  const shows = all ? (R.boot ? ['coef', 'coefp', 'coefs', 't'] : ['coef']) : [dgMainShow(R)];
  const lab = refl.length === R.L ? 'outer loading' : tl('loading atau weight', 'loading or weight');
  shows.forEach(sh => add('diagram-' + sh, dgInfo[sh][0], tl(`Diagram jalur (${dgInfo[sh][1]})`, `Path diagram (${dgInfo[sh][1]})`), dgNote(R, sh), dg(sh)));
  if (R.freq) add('likert', tl('sebaran-jawaban', 'response-distribution'), tl('Sebaran jawaban per indikator', 'Response distribution by indicator'), tl('Persentase responden pada setiap kategori jawaban.', 'Percentage of respondents in each answer category.'), figLikert(R));
  if (refl.length) {
    const L = [], V = [];
    refl.forEach(j => R.spec.blocks[j].forEach((k, a) => { L.push(`${R.items[k]} (${R.lv[j]})`); V.push(e.loadings[j][a]); }));
    add('loadings', 'outer-loadings', tl('Outer loadings indikator reflektif', 'Outer loadings of the reflective indicators'), tl(`Garis putus-putus = batas ${k2(0.70)}; batang amber atau merah berada di bawah batas.`, `Dashed line = ${k2(0.70)} threshold; amber or red bars fall below it.`), figHBar({ title: 'Outer loadings', subtitle: tl(`Batas yang disarankan ${k2(0.70)}`, `Recommended threshold ${k2(0.70)}`) + (R.opts.plsc ? tl(' (loading terkoreksi PLSc)', ' (PLSc-corrected loadings)') : ''), labels: L, values: V, refs: [{ v: 0.7, text: k2(0.70) }], color: v => (v >= 0.7 ? FX.ink : v >= 0.4 ? FX.warn : FX.fail), hi: 1 }));
    add('reliability', tl('reliabilitas', 'reliability'), tl("Reliabilitas konstruk (Cronbach's alpha, rho_A, rho_C)", "Construct reliability (Cronbach's alpha, rho_A, rho_C)"), tl(`Garis putus-putus = batas ${k2(0.70)}.`, `Dashed line = ${k2(0.70)} threshold.`), figGrouped({ title: tl('Reliabilitas konstruk', 'Construct reliability'), cats: refl.map(j => R.lv[j]), series: [{ name: "Cronbach's alpha", values: refl.map(j => R.A.alpha[j]), color: '#b4b8c2' }, { name: 'rho_A', values: refl.map(j => R.A.rhoA[j]), color: '#6f7480' }, { name: 'rho_C', values: refl.map(j => R.A.rhoC[j]), color: FX.ink }], refs: [{ v: 0.7, text: k2(0.70) }] }));
    add('ave', 'ave', 'Average variance extracted (AVE)', tl(`Garis putus-putus = batas ${k2(0.50)}.`, `Dashed line = ${k2(0.50)} threshold.`), figHBar({ title: 'Average variance extracted (AVE)', subtitle: tl(`Batas yang disarankan ${k2(0.50)}`, `Recommended threshold ${k2(0.50)}`), labels: refl.map(j => R.lv[j]), values: refl.map(j => R.A.AVE[j]), refs: [{ v: 0.5, text: k2(0.50) }], color: v => (v >= 0.5 ? FX.ink : FX.fail), hi: 1 }));
  }
  add('r2', 'r-square', tl('Koefisien determinasi (R²)', 'Coefficient of determination (R²)'), tl(`Garis acuan Hair dkk. (2011): ${k2(0.25)} lemah, ${k2(0.50)} moderat, ${k2(0.75)} kuat.`, `Reference lines from Hair et al. (2011): ${k2(0.25)} weak, ${k2(0.50)} moderate, ${k2(0.75)} substantial.`), figHBar({ title: tl('Koefisien determinasi (R²)', 'Coefficient of determination (R²)'), labels: R.endo.map(j => R.lv[j]), values: R.endo.map(j => e.R2[j]), refs: [{ v: 0.25, text: tl('lemah', 'weak') }, { v: 0.5, text: tl('moderat', 'moderate') }, { v: 0.75, text: tl('kuat', 'substantial') }], color: v => (v > 1 ? FX.fail : FX.ink), hi: 1 }));
  if (R.boot) add('forest', tl('koefisien-jalur-ci', 'path-coefficients-ci'), tl('Koefisien jalur dan interval kepercayaan bootstrap', 'Path coefficients and bootstrap confidence intervals'), tl('Titik = koefisien jalur; garis = interval kepercayaan; abu-abu = tidak signifikan.', 'Dots = path coefficients; lines = confidence intervals; grey = not significant.'), figForest(R));
  if (R.pred) add('q2', 'q2predict', tl('Q²predict per indikator endogen', 'Q²predict by endogenous indicator'), tl('Nilai di atas 0 berarti prediksi model lebih baik daripada rata-rata data latih.', 'Values above 0 mean the model predicts better than the training-sample mean.'), figHBar({ title: tl('Q²predict per indikator', 'Q²predict by indicator'), subtitle: tl(`Validasi silang ${R.pred.folds}-fold, ${R.pred.reps} kali pengulangan`, `${R.pred.folds}-fold cross-validation, ${R.pred.reps} repetitions`), labels: R.pred.items.map(x => `${R.items[x.k]} (${R.lv[x.j]})`), values: R.pred.items.map(x => x.q2), refs: [{ v: 0, text: '0' }], color: v => (v > 0 ? FX.ink : FX.fail) }));
  return out;
}
async function renderPngs(list) { for (const f of list) f.png = (await svgToPng(f.svg, 2)).bytes; return list; }

/* ================================================================ image zip */
async function exportImagesZip() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyiapkan semua gambar…', 'Preparing all figures…'), async () => {
    const L = exportLang(), figs = withLang(L, () => figureSpecs(R, true)), nm = (f, i) => String(i + 1).padStart(2, '0') + '-' + f.file;
    await renderPngs(figs);
    const txt = withLang(L, () => tl(`Gambar hasil analisis PLS-SEM: ${R.name}\r\nDibuat oleh SEMbada, ${new Date().toLocaleString(LOC())}\r\n\r\n`, `Figures from the PLS-SEM analysis: ${R.name}\r\nCreated by SEMbada, ${new Date().toLocaleString(LOC())}\r\n\r\n`) + figs.map((f, i) => tl(`Gambar ${i + 1}. ${f.title}\r\n  File: ${nm(f, i)}.png (versi vektor di folder svg)\r\n  ${f.caption}`, `Figure ${i + 1}. ${f.title}\r\n  File: ${nm(f, i)}.png (vector version in the svg folder)\r\n  ${f.caption}`)).join('\r\n\r\n') + '\r\n');
    const files = [{ name: L === 'en' ? 'list-of-figures.txt' : 'daftar-gambar.txt', data: txt }];
    figs.forEach((f, i) => { files.push({ name: nm(f, i) + '.png', data: f.png }, { name: 'svg/' + nm(f, i) + '.svg', data: withFonts(f.svg) }); });
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_figures_PLS-SEM.zip' : '_gambar_PLS-SEM.zip'), new Blob([IO.zipStore(files)], { type: 'application/zip' }));
    if (ok && !NATIVE) toast(tl(`${figs.length} gambar diunduh dalam satu file zip.`, `${figs.length} figures downloaded in one zip file.`), 'ok');
  });
}

/* ================================================================ Word report (docx) */
function docxTable(D, head, rows, rel) {
  const n = head.length, total = 9638, fs = n > 7 ? 16 : 18;
  let cw;
  if (rel) { const sum = rel.reduce((a, b) => a + b, 0); cw = rel.map(v => Math.floor(v / sum * total)); cw[n - 1] += total - cw.reduce((a, b) => a + b, 0); }
  else cw = fitWidths(colNeeds(head, rows), head.map(h => h.align === 'r'), total, fs, 180);
  const line = { style: D.BorderStyle.SINGLE, size: 4, color: 'D9D4D7' }, none = { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const cell = (c, i, header) => {
    const o = { width: { size: cw[i], type: D.WidthType.DXA }, margins: { top: 40, bottom: 40, left: 70, right: 70 }, verticalAlign: D.VerticalAlign.CENTER, borders: { top: line, bottom: line, left: none, right: none },
      children: [new D.Paragraph({ alignment: c.align === 'r' ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT, spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' }, children: [new D.TextRun({ text: String(c.text), bold: header || !!c.b, color: c.color || '262A33', size: fs })] })] };
    const fill = header ? 'F3EEF0' : c.fill; if (fill) o.shading = { type: D.ShadingType.CLEAR, color: 'auto', fill };
    return new D.TableCell(o);
  };
  return new D.Table({ width: { size: total, type: D.WidthType.DXA }, columnWidths: cw, rows: [new D.TableRow({ tableHeader: true, children: head.map((c, i) => cell(c, i, true)) })].concat(rows.map(r => new D.TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))) });
}
function buildReportDoc(D, R, figs) {
  const fig = k => figs.find(f => f.key === k), kids = []; let tno = 0, gno = 0, firstH1 = true;
  const run = (text, o) => new D.TextRun(Object.assign({ text: String(text) }, o || {}));
  const para = (runs, o) => kids.push(new D.Paragraph(Object.assign({ children: runs }, o || {})));
  const P = text => para([run(text)]);
  const H1 = text => { para([run(text)], { heading: D.HeadingLevel.HEADING_1, pageBreakBefore: !firstH1 }); firstH1 = false; };
  const H2 = text => para([run(text)], { heading: D.HeadingLevel.HEADING_2 });
  const note = text => { if (text) para([run(text)], { style: 'SemNote' }); else para([], { spacing: { after: 120 } }); };
  const table = (title, cells, rel, nt) => { tno++; para([run(`${tl('Tabel', 'Table')} ${tno}. `, { bold: true }), run(title)], { style: 'SemCaption' }); kids.push(docxTable(D, cells.head, cells.rows, rel)); note(nt || ''); };
  const tm = t => table(t.title, tmToCells(t), null, t.note ? stripTags(t.note) : '');
  const figure = key => {
    const f = fig(key); if (!f) return; gno++;
    let w = 620, h = Math.round(620 * f.h / f.w); if (h > 800) { w = Math.round(w * 800 / h); h = 800; }
    para([new D.ImageRun({ type: 'png', data: f.png, transformation: { width: w, height: h }, altText: { title: f.title, description: f.caption, name: f.key } })], { alignment: D.AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 60, line: 240, lineRule: 'auto' } });
    para([run(`${tl('Gambar', 'Figure')} ${gno}. `, { bold: true }), run(f.title)], { style: 'SemCaption', alignment: D.AlignmentType.CENTER });
    note(f.caption);
  };
  const ST = stTxt(), crit = [{ text: tl('Kriteria', 'Criterion'), align: 'l' }, { text: 'Status', align: 'l' }, { text: tl('Keterangan', 'Details'), align: 'l' }];
  const checks = (title, items) => table(title, { head: crit, rows: items.map(x => [{ text: x.c, align: 'l' }, { text: ST[x.st], align: 'l', b: true, color: ST_HEX[x.st], fill: ST_BG[x.st] }, { text: x.d, align: 'l' }]) }, [2.7, 1.5, 6]);
  para([run(R.name)], { heading: D.HeadingLevel.TITLE });
  para([run(tl('Laporan analisis PLS-SEM', 'PLS-SEM analysis report'), { size: 28, color: '5D6270' })], { spacing: { after: 240 } });
  table(tl('Informasi analisis', 'Analysis information'), { head: [{ text: tl('Butir', 'Item'), align: 'l' }, { text: tl('Nilai', 'Value'), align: 'l' }], rows: infoRows(R).map(([k, v]) => [{ text: k, align: 'l', b: true }, { text: v, align: 'l' }]) }, [3, 7]);
  if (R.A.issues.length) para([run(tl('Perhatian: solusi tidak wajar (inadmissible). ', 'Warning: inadmissible solution. '), { bold: true, color: 'B3261E' }), run(tl('Lihat bagian Ringkasan di aplikasi untuk rinciannya; pertimbangkan algoritma PLS-SEM standar.', 'See the Summary section in the app for details; consider the standard PLS-SEM algorithm.'))]);
  H1(tl('1. Ringkasan dan uji hipotesis', '1. Summary and hypothesis tests'));
  checks(tl('Evaluasi model pengukuran', 'Measurement model assessment'), measurementChecks(R)); checks(tl('Evaluasi model struktural', 'Structural model assessment'), structuralChecks(R));
  tm(R.boot ? hypTable(R) : pathListTable(R));
  H2(tl('Draf narasi hasil', 'Draft results narrative')); narrative(R).forEach(P);
  H1(tl('2. Diagram jalur', '2. Path diagram')); figure('diagram-' + dgMainShow(R));
  H1('3. Data'); tm(descTable(R)); if (R.freq) { figure('likert'); tm(freqTable(R)); }
  H1(tl('4. Uji instrumen klasik', '4. Classical instrument tests')); classicTables(R).forEach(tm);
  H1(tl('5. Model pengukuran', '5. Measurement model')); tm(loadingsTable(R)); figure('loadings'); tm(weightsTable(R)); tm(relTable(R)); figure('reliability'); figure('ave'); tm(flTable(R)); tm(htmtTable(R)); tm(crossTable(R)); tm(outerVifTable(R));
  H1(tl('6. Model struktural', '6. Structural model')); tm(pathMatrixTable(R)); tm(r2Table(R)); figure('r2'); tm(f2Table(R)); tm(innerVifTable(R)); effectsTables(R).forEach(tm); tm(fitTable(R)); tm(itTable(R));
  if (R.boot) { H1('7. Bootstrapping'); figure('forest'); tm(bootR2Table(R)); if (R.boot.chains.length) { tm(mediationTable(R)); tm(bootTotalIndTable(R)); } tm(bootTotalTable(R)); tm(bootOuterTable(R, 'load')); tm(bootOuterTable(R, 'weight')); if (reflIdx(R).length > 1) tm(bootHTMTTable(R)); }
  if (R.pred) { H1((R.boot ? '8' : '7') + '. PLSpredict'); const pp = predictPower(R); P(tl(`Daya prediksi ${pp.level}. RMSE PLS lebih kecil daripada LM pada ${pp.better} dari ${pp.n} indikator (Shmueli dkk., 2019).`, `Predictive power: ${pp.level}. PLS RMSE is below the LM RMSE for ${pp.better} of ${pp.n} indicators (Shmueli et al., 2019).`)); predictTables(R).forEach(tm); figure('q2'); }
  extReportBlocks(R, { H1, H2, tm, figure, P });
  H1(tl('Lampiran: kode R (seminr) yang setara', 'Appendix: equivalent R code (seminr)')); seminrCode(R).split('\n').forEach(l => para([run(l || ' ')], { style: 'SemCode' }));
  H2(tl('Referensi', 'References')); refsList().forEach(P);
  return { doc: new D.Document({
    creator: 'SEMbada', title: R.name, description: tl('Laporan analisis PLS-SEM dari SEMbada', 'PLS-SEM analysis report from SEMbada'),
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: '262A33' }, paragraph: { spacing: { after: 120, line: 276, lineRule: 'auto' } } },
        title: { run: { font: 'Calibri', size: 48, bold: true, color: '262A33' }, paragraph: { spacing: { before: 0, after: 80 }, keepNext: true } },
        heading1: { run: { font: 'Calibri', size: 32, bold: true, color: '262A33' }, paragraph: { spacing: { before: 0, after: 160 }, keepNext: true } },
        heading2: { run: { font: 'Calibri', size: 26, bold: true, color: '262A33' }, paragraph: { spacing: { before: 280, after: 100 }, keepNext: true } }
      },
      paragraphStyles: [
        { id: 'SemCaption', name: tl('Judul Tabel dan Gambar', 'Table and Figure Caption'), basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri', size: 20, color: '262A33' }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true } },
        { id: 'SemNote', name: tl('Catatan Tabel', 'Table Note'), basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri', size: 17, color: '5D6270' }, paragraph: { spacing: { before: 60, after: 200 } } },
        { id: 'SemCode', name: tl('Kode Program', 'Program Code'), basedOn: 'Normal', next: 'SemCode', run: { font: 'Consolas', size: 17 }, paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' } } }
      ]
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
      footers: { default: new D.Footer({ children: [new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [new D.TextRun({ text: tl('SEMbada, halaman ', 'SEMbada, page '), size: 16, color: '9A9EAA' }), new D.TextRun({ children: [D.PageNumber.CURRENT], size: 16, color: '9A9EAA' })] })] }) },
      children: kids
    }]
  }), tno, gno };
}
async function exportDocx() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun laporan Word…', 'Building the Word report…'), async () => {
    const D = loadLib('lib-docx', 'docx'), L = exportLang(), figs = withLang(L, () => figureSpecs(R, false));
    await renderPngs(figs);
    const out = withLang(L, () => buildReportDoc(D, R, figs));
    const blob = await D.Packer.toBlob(out.doc);
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_report_PLS-SEM.docx' : '_laporan_PLS-SEM.docx'), blob);
    if (ok && !NATIVE) toast(tl(`Laporan Word diunduh: ${out.tno} tabel dan ${out.gno} gambar.`, `Word report downloaded: ${out.tno} tables and ${out.gno} figures.`), 'ok');
  });
}

/* ================================================================ PowerPoint deck (pptxgenjs, native charts) */
function brandImages(dark) {
  const mk = (size, dark, marks) => {
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), u = size / 100;
    if (marks) { g.fillStyle = dark ? '#ffffff' : '#262a33'; [27, 47.5, 68].forEach(y => g.fillRect(4 * u, y * u, 19 * u, 7 * u)); }
    const cx = marks ? 64 * u : 50 * u, cy = 51 * u, r = marks ? 28 * u : 38 * u;
    g.lineWidth = marks ? 6.5 * u : 10 * u; g.strokeStyle = '#f06d88'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = dark ? '#ffffff' : '#262a33'; g.beginPath(); g.arc(cx, cy, r * 0.56, 0, Math.PI * 2); g.fill();
    return 'image/png;base64,' + c.toDataURL('image/png').split(',')[1];
  };
  return { mark: mk(400, !!dark, true), bubble: mk(160, !!dark, false) };
}
