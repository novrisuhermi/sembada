/* ================================================================ presentations: redesigned PowerPoint deck and LaTeX Beamer slides */
const DECK_EQS = ['refl', 'form', 'struct', 'outer', 'inner', 'scheme', 'modeA', 'modeB', 'conv', 'alpha', 'rhoc', 'ave', 'htmt', 'vif', 'r2', 'f2', 'boot', 'ci', 'indirect', 'srmr', 'q2', 'rmse', 'nmin', 'inter', 'slope', 'hoc', 'micom', 'mgaperm', 'ipmap', 'ipmai'];
function slideFigures(R, L) {
  const figs = withLang(L, () => figureSpecs(R, false));
  figs.push(withLang(L, () => { const svg = paperFigSVG(R, 'hyp', true), m = svg.match(/width="([\d.]+)" height="([\d.]+)"/); return { key: 'concept', file: 'concept', title: tl('Model penelitian', 'Research model'), caption: '', svg, w: +m[1], h: +m[2] }; }));
  return figs;
}
const deckFacts = R => {
  const e = R.A.est, b = R.boot, a = b ? b.alpha : 0.05, r2 = R.endo.map(j => e.R2[j]);
  const sup = b ? R.hyp.filter(h => { const s = R.bootPath.get(h.i + ',' + h.j); return s && s.P < a; }) : [];
  return { r2lo: Math.min(...r2), r2hi: Math.max(...r2), sup, pp: R.pred ? predictPower(R) : null, srmr: R.A.fit.saturated.srmr };
};
function buildDeck2(PG, R, figs, eqs) {
  const fig = k => figs.find(f => f.key === k), brand = brandImages(), refl = reflIdx(R), e = R.A.est, form = R.lv.map((_, j) => j).filter(j => !R.refl[j]);
  const p = new PG(), F = 'Calibri', INK = '262A33', MUTE = '5D6270', SOFT = 'F7F3F5', PINK = 'F06D88', LINE = 'D9D4D7', X0 = 0.6, CW = 12.13, Y0 = 1.55, CH = 5.2, ST = stTxt(), fx = deckFacts(R);
  const algo = R.opts.plsc ? 'PLSc' : 'PLS-SEM', tails = R.boot ? (R.boot.tails === 'two' ? tl('dua arah', 'two-tailed') : tl('satu arah', 'one-tailed')) : '';
  p.layout = 'LAYOUT_WIDE'; p.author = 'SEMbada'; p.title = infoTitleFor(R); p.subject = tl('Presentasi hasil PLS-SEM', 'PLS-SEM results presentation');
  p.theme = { headFontFace: F, bodyFontFace: F };
  p.defineSlideMaster({ title: 'SB_DARK', background: { color: INK }, objects: [] });
  p.defineSlideMaster({ title: 'SB_CONTENT', background: { color: 'FFFFFF' },
    objects: [
      { image: { x: X0, y: 0.5, w: 0.38, h: 0.38, data: brand.bubble } },
      { placeholder: { options: { name: 'title', type: 'title', x: 1.15, y: 0.34, w: 11.6, h: 0.72, fontFace: F, fontSize: 32, bold: true, color: INK, align: 'left', valign: 'middle', margin: 0 }, text: '' } },
      { text: { text: 'SEMbada', options: { x: X0, y: 7.0, w: 3, h: 0.28, fontFace: F, fontSize: 10, color: '9A9EAA', margin: 0 } } }
    ],
    slideNumber: { x: 12.13, y: 7.0, w: 0.6, h: 0.28, fontFace: F, fontSize: 10, color: '9A9EAA', align: 'right' } });
  const content = (title, sub) => { const s = p.addSlide({ masterName: 'SB_CONTENT' }); s.addText(title, { placeholder: 'title' }); if (sub) s.addText(sub, { x: 1.15, y: 1.04, w: 11.6, h: 0.34, fontFace: F, fontSize: 14, color: MUTE, margin: 0, isTextBox: true }); return s; };
  const card = (s, x, y, w, h, fill) => s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: fill || SOFT }, line: { color: fill || SOFT }, rectRadius: 0.1 });
  const img = (s, f, box) => { if (!f) return; const k = Math.min(box.w / f.w, box.h / f.h), w = f.w * k, h = f.h * k; s.addImage({ data: 'image/png;base64,' + b64(f.png), x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h, altText: f.title }); };
  const eqImg = (s, key, box, zoom) => { const q = eqs[key]; if (!q) return; let w = q.w / 72 * (zoom || 1.9), h = q.h / 72 * (zoom || 1.9); const k = Math.min(1, box.w / w, box.h / h); w *= k; h *= k; s.addImage({ data: 'image/png;base64,' + b64(q.png), x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h, altText: eqv(key).tex }); };
  const eqCard = (s, x, y, w, h, title, key, note, key2) => {
    card(s, x, y, w, h);
    s.addText(title, { x: x + 0.28, y: y + 0.2, w: w - 0.56, h: 0.38, fontFace: F, fontSize: 17, bold: true, color: INK, margin: 0, isTextBox: true });
    const top = y + 0.68, bot = y + h - (note ? 0.62 : 0.2), hh = bot - top;
    if (key2) { eqImg(s, key, { x: x + 0.28, y: top, w: w - 0.56, h: hh / 2 - 0.04 }); eqImg(s, key2, { x: x + 0.28, y: top + hh / 2 + 0.04, w: w - 0.56, h: hh / 2 - 0.04 }); }
    else eqImg(s, key, { x: x + 0.28, y: top, w: w - 0.56, h: hh });
    if (note) s.addText(note, { x: x + 0.28, y: y + h - 0.52, w: w - 0.56, h: 0.36, fontFace: F, fontSize: 13, color: MUTE, margin: 0, isTextBox: true });
  };
  const divider = (no, title, desc) => {
    const s = p.addSlide({ masterName: 'SB_DARK' });
    s.addText(String(no).padStart(2, '0'), { x: 0.9, y: 1.85, w: 4, h: 1.5, fontFace: F, fontSize: 100, bold: true, color: PINK, margin: 0, isTextBox: true });
    s.addText(title, { x: 0.9, y: 3.5, w: 11.6, h: 0.9, fontFace: F, fontSize: 40, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
    if (desc) s.addText(desc, { x: 0.9, y: 4.45, w: 11.6, h: 0.9, fontFace: F, fontSize: 18, color: 'C9CCD3', margin: 0, isTextBox: true, valign: 'top' });
  };
  const tbl = (s, cells, o) => {
    o = o || {}; const w = o.w || CW, rel = o.rel || autoWidths(cells.head, cells.rows), sum = rel.reduce((a, c) => a + c, 0);
    const colW = rel.map(v => Math.round(v / sum * w * 100) / 100); colW[colW.length - 1] = Math.round((w - colW.slice(0, -1).reduce((a, c) => a + c, 0)) * 100) / 100;
    const cellOf = (c, header) => ({ text: String(c.text), options: Object.assign({ bold: header || !!c.b, color: header ? 'FFFFFF' : c.color || INK, align: c.align === 'r' ? 'right' : 'left' }, header ? { fill: { color: INK } } : c.fill ? { fill: { color: c.fill } } : {}) });
    s.addTable([cells.head.map(c => cellOf(c, true))].concat(cells.rows.map(r => r.map(c => cellOf(c, false)))), { x: o.x === undefined ? X0 : o.x, y: o.y === undefined ? Y0 : o.y, w, colW, fontFace: F, fontSize: o.fs || 14, color: INK, valign: 'middle', rowH: o.rowH || 0.42, border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', pt: 0.75, color: LINE }, { type: 'none' }] });
  };
  const chartOpts = extra => Object.assign({ barDir: 'bar', showLegend: false, showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.000', dataLabelFontFace: F, dataLabelFontSize: 11, dataLabelColor: MUTE, catAxisLabelFontFace: F, catAxisLabelFontSize: 12, catAxisLabelColor: INK, valAxisLabelFontFace: F, valAxisLabelFontSize: 11, valAxisLabelColor: MUTE, valAxisLabelFormatCode: '0.0', valGridLine: { color: 'E6E2E5', size: 0.5 }, catGridLine: { style: 'none' }, legendFontFace: F, legendFontSize: 12, legendColor: MUTE, barGapWidthPct: 45 }, extra);
  const r3 = v => Math.round(v * 1000) / 1000, rev = a => a.slice().reverse(), pct = v => fmt(v * 100, 1) + '%';
  const checksCells = items => ({ head: [{ text: tl('Kriteria', 'Criterion') }, { text: 'Status' }, { text: tl('Keterangan', 'Details') }], rows: items.map(x => [{ text: x.c }, { text: ST[x.st], b: true, color: ST_HEX[x.st], fill: ST_BG[x.st] }, { text: x.d }]) });

  /* 1. title */
  const TT = infoTitleFor(R);
  let s = p.addSlide({ masterName: 'SB_DARK' });
  s.addImage({ data: brand.mark, x: 0.85, y: 2.45, w: 1.6, h: 1.6 });
  s.addText(TT.length > 110 ? TT.slice(0, 107) + '…' : TT, { x: 2.8, y: 2.1, w: 9.9, h: 1.35, fontFace: F, fontSize: TT.length > 70 ? 26 : TT.length > 44 ? 32 : 40, bold: true, color: 'FFFFFF', valign: 'bottom', margin: 0, isTextBox: true, fit: 'shrink' });
  s.addText(tl('Hasil analisis partial least squares structural equation modeling', 'Partial least squares structural equation modeling results'), { x: 2.8, y: 3.55, w: 9.9, h: 0.55, fontFace: F, fontSize: 22, color: 'F3C9D2', margin: 0, isTextBox: true });
  s.addText(tl(`${fmtInt(R.prep.n)} responden, ${R.model.constructs.length} konstruk, ${R.hyp.length} hipotesis. Dihitung ${R.time.toLocaleDateString(LOC(), { day: 'numeric', month: 'long', year: 'numeric' })}.`, `${fmtInt(R.prep.n)} respondents, ${R.model.constructs.length} constructs, ${R.hyp.length} hypotheses. Calculated on ${R.time.toLocaleDateString(LOC(), { day: 'numeric', month: 'long', year: 'numeric' })}.`), { x: 2.8, y: 4.2, w: 9.9, h: 0.45, fontFace: F, fontSize: 16, color: 'C9CCD3', margin: 0, isTextBox: true });
  { const au = infoAuthors(); if (au.length) s.addText(au.map(a => a.name).join(', ') + (String(au[0].inst || '').trim() ? '  ·  ' + String(au[0].inst).trim() : ''), { x: 2.8, y: 4.95, w: 9.9, h: 0.5, fontFace: F, fontSize: 16, color: 'FFFFFF', margin: 0, isTextBox: true, fit: 'shrink' }); }

  /* 2. agenda */
  const agenda = [[tl('Model penelitian', 'Research model'), tl('Konstruk dan hipotesis', 'Constructs and hypotheses')], [tl('Metodologi', 'Methodology'), tl('Model, algoritma, dan kriteria', 'Model, algorithm, and criteria')], [tl('Model pengukuran', 'Measurement model'), tl('Reliabilitas dan validitas', 'Reliability and validity')], [tl('Model struktural', 'Structural model'), tl('Hipotesis, mediasi, prediksi', 'Hypotheses, mediation, prediction')], [tl('Kesimpulan', 'Conclusions'), tl('Temuan utama', 'Key findings')]];
  s = content(tl('Agenda', 'Agenda'));
  agenda.forEach(([t, d], i) => {
    const x = X0 + i * 2.47; card(s, x, Y0 + 0.4, 2.27, 3.6, i % 2 ? SOFT : 'FBEFF2');
    s.addText(String(i + 1).padStart(2, '0'), { x: x + 0.25, y: Y0 + 0.65, w: 1.8, h: 0.9, fontFace: F, fontSize: 44, bold: true, color: 'D2405F', margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.25, y: Y0 + 1.75, w: 1.85, h: 0.9, fontFace: F, fontSize: 18, bold: true, color: INK, margin: 0, isTextBox: true, valign: 'top' });
    s.addText(d, { x: x + 0.25, y: Y0 + 2.75, w: 1.85, h: 1.0, fontFace: F, fontSize: 14, color: MUTE, margin: 0, isTextBox: true, valign: 'top' });
  });

  /* 3. research model */
  divider(1, tl('Model penelitian', 'Research model'), tl(`${R.model.constructs.length} konstruk dan ${R.hyp.length} hipotesis hubungan struktural`, `${R.model.constructs.length} constructs and ${R.hyp.length} hypothesized structural relationships`));
  s = content(tl('Model penelitian dan hipotesis', 'Research model and hypotheses'));
  img(s, fig('concept'), { x: X0, y: Y0, w: 7.6, h: CH });
  card(s, 8.45, Y0, 4.28, CH);
  s.addText(R.hyp.slice(0, 14).map((h, i) => ({ text: `${h.h}  ${h.from} → ${h.to}`, options: { breakLine: i < Math.min(14, R.hyp.length) - 1, bold: false } })), { x: 8.75, y: Y0 + 0.25, w: 3.7, h: CH - 0.5, fontFace: F, fontSize: R.hyp.length > 10 ? 13 : 16, color: INK, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 6 });

  { const rowsC = R.model.constructs.map(c => ({ c, f: conFull(c.id), d: conDefTxt(c.id) })).filter(q => q.f || q.d);
    if (rowsC.length) chunk(rowsC, 7).forEach((rr, k) => { s = content(tl('Konstruk penelitian', 'Research constructs') + (k ? tl(' (lanjutan)', ' (continued)') : ''), tl('Nama lengkap dan definisi', 'Full names and definitions')); tbl(s, { head: [{ text: tl('Konstruk', 'Construct') }, { text: tl('Nama lengkap', 'Full name') }, { text: tl('Definisi', 'Definition') }], rows: rr.map(q => [{ text: q.c.name, b: true }, { text: q.f || '–' }, { text: q.d || '–' }]) }, { rel: [1, 2.3, 6.4] }); }); }

  /* 4-7. methodology with equations rendered by LaTeX */
  divider(2, tl('Metodologi', 'Methodology'), tl(`${algo}, bootstrapping, dan PLSpredict; rumus dirender dengan LaTeX`, `${algo}, bootstrapping, and PLSpredict; equations typeset with LaTeX`));
  s = content(tl('Model PLS-SEM', 'The PLS-SEM model'), tl('Model pengukuran (outer) dan model struktural (inner)', 'Measurement (outer) and structural (inner) model'));
  eqCard(s, X0, Y0 + 0.1, 3.9, 2.6, tl('Pengukuran reflektif', 'Reflective measurement'), 'refl', tl('Indikator mencerminkan konstruk', 'Indicators reflect the construct'));
  eqCard(s, X0 + 4.12, Y0 + 0.1, 3.9, 2.6, tl('Pengukuran formatif', 'Formative measurement'), 'form', tl('Indikator membentuk konstruk', 'Indicators form the construct'));
  eqCard(s, X0 + 8.24, Y0 + 0.1, 3.89, 2.6, tl('Model struktural', 'Structural model'), 'struct', tl('Pendahulu memengaruhi konstruk endogen', 'Predecessors affect each endogenous construct'));
  card(s, X0, Y0 + 2.95, CW, 2.0, 'FBEFF2');
  s.addText([{ text: tl('Mengapa PLS-SEM? ', 'Why PLS-SEM? '), options: { bold: true, color: 'B3304D' } }, { text: tl('Pendekatan berbasis varians yang memaksimalkan varians terjelaskan konstruk endogen, cocok untuk model dengan banyak konstruk dan indikator serta berorientasi prediksi.', 'A variance-based approach that maximizes the explained variance of the endogenous constructs; suited to models with many constructs and indicators and oriented towards prediction.') }], { x: X0 + 0.35, y: Y0 + 3.2, w: CW - 0.7, h: 1.5, fontFace: F, fontSize: 18, color: INK, margin: 0, isTextBox: true, valign: 'middle' });
  s = content(tl('Algoritma PLS', 'The PLS algorithm'), tl(`Skema ${R.settings.scheme}, iterasi hingga konvergen (${e.iterations} iterasi pada data ini)`, `${R.settings.scheme} scheme, iterated until convergence (${e.iterations} iterations for these data)`));
  eqCard(s, X0, Y0 + 0.05, 5.95, 2.45, tl('1  Pendekatan luar', '1  Outer approximation'), 'outer', tl('Skor konstruk = jumlah tertimbang indikator', 'Construct score = weighted sum of indicators'));
  eqCard(s, X0 + 6.18, Y0 + 0.05, 5.95, 2.45, tl('2  Pendekatan dalam', '2  Inner approximation'), 'inner', tl('Proksi dari konstruk yang berdekatan', 'Proxy from adjacent constructs'));
  eqCard(s, X0, Y0 + 2.7, 5.95, 2.45, tl('3  Bobot dalam (path weighting)', '3  Inner weights (path weighting)'), 'scheme');
  eqCard(s, X0 + 6.18, Y0 + 2.7, 5.95, 2.45, tl('4  Pembaruan bobot luar', '4  Outer weight update'), 'modeA', form.length ? tl('Mode A (reflektif) dan Mode B (formatif)', 'Mode A (reflective) and Mode B (formative)') : tl('Mode A untuk konstruk reflektif', 'Mode A for reflective constructs'), form.length ? 'modeB' : null);
  s = content(tl('Kriteria model pengukuran', 'Measurement model criteria'), tl('Reliabilitas konsistensi internal, validitas konvergen, dan validitas diskriminan', 'Internal consistency, convergent validity, and discriminant validity'));
  eqCard(s, X0, Y0 + 0.05, 5.95, 2.45, "Cronbach's alpha", 'alpha', tl(`Memadai bila ≥ ${k2(0.70)}`, `Satisfactory when ≥ ${k2(0.70)}`));
  eqCard(s, X0 + 6.18, Y0 + 0.05, 5.95, 2.45, 'Composite reliability ρC', 'rhoc', tl(`Memadai antara ${k2(0.70)} dan ${k2(0.95)}`, `Satisfactory between ${k2(0.70)} and ${k2(0.95)}`));
  eqCard(s, X0, Y0 + 2.7, 5.95, 2.45, 'Average variance extracted', 'ave', tl(`Validitas konvergen bila ≥ ${k2(0.50)}`, `Convergent validity when ≥ ${k2(0.50)}`));
  eqCard(s, X0 + 6.18, Y0 + 2.7, 5.95, 2.45, 'Heterotrait–monotrait ratio', 'htmt', tl(`Validitas diskriminan bila < ${k2(0.85)} (atau ${k2(0.90)})`, `Discriminant validity when < ${k2(0.85)} (or ${k2(0.90)})`));
  s = content(tl('Kriteria model struktural', 'Structural model criteria'), tl('Kolinearitas, daya penjelas, ukuran efek, dan signifikansi', 'Collinearity, explanatory power, effect size, and significance'));
  eqCard(s, X0, Y0 + 0.05, 3.9, 2.45, 'VIF', 'vif', tl('Di bawah 5, idealnya 3', 'Below 5, ideally 3'));
  eqCard(s, X0 + 4.12, Y0 + 0.05, 8.01, 2.45, tl('Koefisien determinasi', 'Coefficient of determination'), 'r2', tl(`${k2(0.25)} lemah, ${k2(0.50)} moderat, ${k2(0.75)} kuat`, `${k2(0.25)} weak, ${k2(0.50)} moderate, ${k2(0.75)} substantial`));
  eqCard(s, X0, Y0 + 2.7, 3.9, 2.45, tl('Ukuran efek', 'Effect size'), 'f2', `${k2(0.02)} / ${k2(0.15)} / ${k2(0.35)}`);
  eqCard(s, X0 + 4.12, Y0 + 2.7, 8.01, 2.45, R.boot ? tl(`Bootstrapping (${fmtInt(R.boot.B)} subsampel)`, `Bootstrapping (${fmtInt(R.boot.B)} subsamples)`) : 'Bootstrapping', 'boot', R.boot ? tl(`Diterima bila p < ${fmt(R.boot.alpha, 2)} (uji ${tails})`, `Supported when p < ${fmt(R.boot.alpha, 2)} (${tails} test)`) : '', 'ci');
  s = content(tl('Kecocokan model dan kekuatan prediksi', 'Model fit and predictive power'), tl('SRMR, efek tidak langsung, dan PLSpredict', 'SRMR, indirect effects, and PLSpredict'));
  eqCard(s, X0, Y0 + 0.05, 5.95, 2.45, 'SRMR', 'srmr', tl(`Kecocokan baik bila < ${k2(0.08)}`, `Good fit when < ${k2(0.08)}`));
  eqCard(s, X0 + 6.18, Y0 + 0.05, 5.95, 2.45, tl('Efek tidak langsung', 'Indirect effect'), 'indirect', tl('Jenis mediasi menurut Zhao dkk. (2010)', 'Mediation type following Zhao et al. (2010)'));
  eqCard(s, X0, Y0 + 2.7, 5.95, 2.45, 'Q²predict', 'q2', tl('Lebih baik dari rata-rata bila > 0', 'Beats the mean benchmark when > 0'));
  eqCard(s, X0 + 6.18, Y0 + 2.7, 5.95, 2.45, tl('Galat prediksi', 'Prediction error'), 'rmse', tl('Dibandingkan dengan regresi linear', 'Compared with linear regression'));
  { const ss = sampleSizeTable(R).rows[1], cards = [[tl('Ukuran sampel minimum', 'Minimum sample size'), 'nmin', ss && Number.isFinite(cellRaw(ss[3])) ? tl(`|β min| = ${fmt(cellRaw(ss[2]))} → n min = ${fmtInt(cellRaw(ss[3]))}; n = ${fmtInt(R.prep.n)}`, `|β min| = ${fmt(cellRaw(ss[2]))} → n min = ${fmtInt(cellRaw(ss[3]))}; n = ${fmtInt(R.prep.n)}`) : 'Kock & Hadaya (2018)']];
    if (hocInfo(R).length) cards.push([tl('Konstruk orde tinggi (tahap 2)', 'Higher-order construct (stage 2)'), 'hoc', tl('Disjoint two-stage; Sarstedt dkk. (2019)', 'Disjoint two-stage; Sarstedt et al. (2019)')]);
    if (modInfo(R).length) cards.push([tl('Moderasi dua tahap', 'Two-stage moderation'), 'inter', tl('Term interaksi dan simple slope; Henseler & Chin (2010)', 'Interaction term and simple slope; Henseler & Chin (2010)'), 'slope']);
    if (R.mga && !R.mga.error) cards.push([tl('MGA: MICOM dan permutasi', 'MGA: MICOM and permutation'), 'micom', tl('Henseler dkk. (2016); Chin & Dibbern (2010)', 'Henseler et al. (2016); Chin & Dibbern (2010)'), 'mgaperm']);
    if (R.ipma && R.ipma.rows && R.ipma.rows.length) cards.push(['IPMA', 'ipmap', tl('Performance 0–100 dan importance (efek total); Ringle & Sarstedt (2016)', 'Performance 0–100 and importance (total effect); Ringle & Sarstedt (2016)'), 'ipmai']);
    if (cards.length > 1 || R.ext.any) chunk(cards, 4).forEach((cc, k) => { s = content(tl('Metode analisis lanjutan', 'Advanced analysis methods') + (k ? tl(' (lanjutan)', ' (continued)') : '')); const w = (CW - 0.3) / 2, h = cc.length > 2 ? (CH - 0.3) / 2 : CH; cc.forEach((c, i) => eqCard(s, X0 + (i % 2) * (w + 0.3), Y0 + Math.floor(i / 2) * (h + 0.3), w, h, c[0], c[1], c[2], c[3])); });
  }
  s = content(tl('Gambaran data', 'Data overview'), R.source ? tl('Data: ', 'Data: ') + R.source.fileName : '');
  [[fmtInt(R.prep.n), tl('responden', 'respondents')], [String(R.model.constructs.length), tl('konstruk', 'constructs')], [String((R.base || R).items.length), tl('indikator', 'indicators')], [String(R.hyp.length), tl('hipotesis', 'hypotheses')]].forEach(([v, l], i) => {
    const x = X0 + i * 3.08; card(s, x, Y0 + 0.1, 2.82, 2.0);
    s.addText(v, { x: x + 0.3, y: Y0 + 0.3, w: 2.3, h: 1.0, fontFace: F, fontSize: 54, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(l, { x: x + 0.3, y: Y0 + 1.35, w: 2.3, h: 0.45, fontFace: F, fontSize: 18, color: MUTE, margin: 0, isTextBox: true });
  });
  s.addText([
    { text: tl('Algoritma: ', 'Algorithm: '), options: { bold: true } }, { text: tl(`${algo}, skema ${R.settings.scheme}, ${e.iterations} iterasi.`, `${algo}, ${R.settings.scheme} scheme, ${e.iterations} iterations.`), options: { breakLine: true } },
    { text: 'Bootstrapping: ', options: { bold: true } }, { text: R.boot ? tl(`${fmtInt(R.boot.B)} subsampel, uji ${tails}, α = ${k2(R.boot.alpha)}.`, `${fmtInt(R.boot.B)} subsamples, ${tails} test, α = ${k2(R.boot.alpha)}.`) : tl('tidak dijalankan.', 'not run.'), options: { breakLine: true } },
    { text: 'PLSpredict: ', options: { bold: true } }, { text: R.pred ? tl(`${R.pred.folds}-fold, ${R.pred.reps} pengulangan.`, `${R.pred.folds} folds, ${R.pred.reps} repetitions.`) : tl('tidak dijalankan.', 'not run.') }
  ], { x: X0, y: Y0 + 2.6, w: CW, h: 1.5, fontFace: F, fontSize: 18, color: INK, margin: 0, isTextBox: true, paraSpaceAfter: 6 });

  { const f = fig('v-indcor'); if (f) { s = content(tl('Korelasi antarindikator', 'Indicator correlations'), tl('Kotak = indikator satu konstruk; blok yang pekat menandakan validitas konvergen', 'Boxes = indicators of one construct; dense blocks indicate convergent validity')); img(s, f, { x: X0, y: Y0, w: CW, h: CH }); } }
  /* 8-11. measurement model results */
  divider(3, tl('Model pengukuran', 'Measurement model'), tl('Reliabilitas indikator, konsistensi internal, validitas konvergen dan diskriminan', 'Indicator reliability, internal consistency, convergent and discriminant validity'));
  s = content(tl('Evaluasi model pengukuran', 'Measurement model assessment')); tbl(s, checksCells(measurementChecks(R)), { rel: [3, 1.9, 7.2] });
  if (refl.length) {
    const L = [], V = []; refl.forEach(j => R.spec.blocks[j].forEach((k, a) => { L.push(`${R.items[k]} (${R.lv[j]})`); V.push(r3(e.loadings[j][a])); }));
    s = content('Outer loadings', tl(`Batas yang disarankan ${k2(0.70)}`, `Recommended threshold ${k2(0.70)}`) + (R.opts.plsc ? tl('; loading terkoreksi PLSc', '; PLSc-corrected loadings') : ''));
    s.addChart(p.ChartType.bar, [{ name: 'Outer loading', labels: rev(L), values: rev(V) }], chartOpts({ x: X0, y: Y0, w: CW, h: CH, chartColors: [INK], valAxisMinVal: 0, valAxisMaxVal: 1, valAxisMajorUnit: 0.1, catAxisLabelFontSize: L.length > 24 ? 9 : 11 }));
    s = content(tl('Reliabilitas dan validitas konvergen', 'Reliability and convergent validity'), tl(`Batas: alpha dan rho ≥ ${k2(0.70)}, AVE ≥ ${k2(0.50)}`, `Thresholds: alpha and rho ≥ ${k2(0.70)}, AVE ≥ ${k2(0.50)}`));
    tbl(s, tmToCells(relTable(R)), { w: 6.3, rel: [2.2, 1.6, 1.3, 2.0, 1.2], fs: 14 });
    s.addChart(p.ChartType.bar, ["Cronbach's alpha", 'rho_A', 'rho_C'].map((nm, q) => ({ name: nm, labels: rev(refl.map(j => R.lv[j])), values: rev(refl.map(j => r3([R.A.alpha[j], R.A.rhoA[j], R.A.rhoC[j]][q]))) })), chartOpts({ x: 7.1, y: Y0, w: 5.63, h: CH, barGrouping: 'clustered', chartColors: ['B4B8C2', '6F7480', INK], showLegend: true, legendPos: 'b', valAxisMinVal: 0, valAxisMaxVal: 1, valAxisMajorUnit: 0.2, dataLabelFontSize: 9, barGapWidthPct: 60 }));
    if (refl.length > 1) { s = content(tl('Validitas diskriminan (HTMT)', 'Discriminant validity (HTMT)'), tl(`Hijau < ${k2(0.85)}; kuning ${k2(0.85)}–${k2(0.90)}; merah ≥ ${k2(0.90)} (Henseler dkk., 2015)`, `Green < ${k2(0.85)}; amber ${k2(0.85)}–${k2(0.90)}; red ≥ ${k2(0.90)} (Henseler et al., 2015)`)); img(s, fig('v-htmt'), { x: X0, y: Y0, w: 7.9, h: CH });
      let mx = -1, mp = ''; refl.forEach((i, a) => refl.forEach((j, c) => { if (c > a && R.A.HTMT[i][j] > mx) { mx = R.A.HTMT[i][j]; mp = `${R.lv[i]}–${R.lv[j]}`; } })); const okH = mx < 0.85, wkH = mx < 0.90;
      card(s, 8.75, Y0 + 0.2, 3.98, 2.9); s.addText([{ text: tl('HTMT tertinggi', 'Highest HTMT'), options: { bold: true, fontSize: 16, breakLine: true } }, { text: fmt(mx), options: { fontSize: 34, bold: true, color: okH ? '22744E' : wkH ? 'B07012' : 'B3261E', breakLine: true } }, { text: mp, options: { fontSize: 14, color: MUTE, breakLine: true } }, { text: okH ? tl('Semua pasangan di bawah batas konservatif.', 'All pairs below the conservative threshold.') : wkH ? tl('Masih di bawah batas longgar 0,90.', 'Still below the lenient 0.90 threshold.') : tl('Ada pasangan di atas 0,90.', 'Some pairs exceed 0.90.'), options: { fontSize: 13, color: INK } }], { x: 9.0, y: Y0 + 0.4, w: 3.5, h: 2.5, fontFace: F, color: INK, margin: 0, valign: 'top', isTextBox: true }); }
  }

  /* 12-18. structural model results */
  divider(4, tl('Model struktural', 'Structural model'), tl('Daya penjelas, uji hipotesis, mediasi, dan kekuatan prediksi', 'Explanatory power, hypothesis tests, mediation, and predictive power'));
  s = content(tl('Evaluasi model struktural', 'Structural model assessment')); tbl(s, checksCells(structuralChecks(R)), { rel: [3, 1.9, 7.2] });
  s = content(tl('Model struktural hasil estimasi', 'Estimated structural model'), dgNote(R, dgMainShow(R), true));
  img(s, fig('diagram-' + dgMainShow(R)), { x: X0, y: Y0, w: CW, h: CH });
  s = content(tl('Koefisien determinasi (R²)', 'Coefficient of determination (R²)'), tl(`Acuan Hair dkk. (2011): ${k2(0.75)} kuat, ${k2(0.50)} moderat, ${k2(0.25)} lemah`, `Hair et al. (2011): ${k2(0.75)} substantial, ${k2(0.50)} moderate, ${k2(0.25)} weak`));
  s.addChart(p.ChartType.bar, [{ name: 'R²', labels: rev(R.endo.map(j => R.lv[j])), values: rev(R.endo.map(j => r3(e.R2[j]))) }], chartOpts({ x: X0, y: Y0, w: 6.4, h: Math.min(CH, 1.2 + 0.75 * R.endo.length), chartColors: [INK], valAxisMinVal: 0, valAxisMaxVal: Math.max(1, ...R.endo.map(j => Math.ceil(e.R2[j] * 10) / 10)), valAxisMajorUnit: 0.25 }));
  tbl(s, tmToCells(r2Table(R)), { x: 7.25, w: 5.48, rel: [1.6, 1, 1.4, 1.7], fs: 14 });
  const hypCells = R.hyp.map(h => {
    const sb = R.boot ? R.bootPath.get(h.i + ',' + h.j) : null, sig = !!(sb && sb.P < R.boot.alpha);
    return sb ? [{ text: h.h, b: true }, { text: `${h.from} → ${h.to}` }, { text: fmt(sb.O), align: 'r' }, { text: fmt(sb.T), align: 'r' }, { text: fmtP(sb.P), align: 'r', color: sig ? ST_HEX.pass : undefined, b: sig }, { text: decideTxt(sig), b: true, color: sig ? ST_HEX.pass : ST_HEX.mute, fill: sig ? ST_BG.pass : undefined }]
      : [{ text: h.h, b: true }, { text: `${h.from} → ${h.to}` }, { text: fmt(e.B[h.i][h.j]), align: 'r' }, { text: f2Cat(R.A.f2[h.i][h.j]) }];
  });
  const hypHead = R.boot ? [{ text: tl('Hipotesis', 'Hypothesis') }, { text: tl('Jalur', 'Path') }, { text: 'β', align: 'r' }, { text: tl('t statistik', 't statistic'), align: 'r' }, { text: 'P value', align: 'r' }, { text: tl('Keputusan', 'Decision') }] : [{ text: tl('Hipotesis', 'Hypothesis') }, { text: tl('Jalur', 'Path') }, { text: 'β', align: 'r' }, { text: 'Effect size f²' }];
  chunk(hypCells, 9).forEach((rows, k) => { s = content(tl('Hasil uji hipotesis', 'Hypothesis testing results') + (k ? tl(' (lanjutan)', ' (continued)') : ''), R.boot ? tl(`Bootstrapping ${fmtInt(R.boot.B)} subsampel, uji ${tails}, α = ${k2(R.boot.alpha)}`, `Bootstrapping with ${fmtInt(R.boot.B)} subsamples, ${tails} test, α = ${k2(R.boot.alpha)}`) : tl('Bootstrapping tidak dijalankan; signifikansi belum diuji', 'Bootstrapping was not run; significance has not been tested')); tbl(s, { head: hypHead, rows }, { rel: R.boot ? [1.3, 4.2, 1.4, 1.6, 1.4, 2.0] : [1.3, 5, 1.6, 2.5] }); });
  { const f = fig('v-f2'); if (f) { s = content(tl('Ukuran efek (f²)', 'Effect size (f²)'), tl('Pita = kecil 0,02, sedang 0,15, besar 0,35 (Cohen, 1988)', 'Bands = small 0.02, medium 0.15, large 0.35 (Cohen, 1988)')); img(s, f, { x: X0, y: Y0, w: CW, h: CH }); } }
  if (R.boot) {
    s = content(tl('Koefisien jalur dan interval kepercayaan', 'Path coefficients and confidence intervals'), `CI ${R.boot.ci === 'bca' ? 'BCa' : tl('persentil', 'percentile')} ${pctLabel(R.boot.lo)}–${pctLabel(R.boot.hi)}`); img(s, fig('forest'), { x: X0, y: Y0, w: CW, h: CH });
    { const f = fig('v-ridge'); if (f) { s = content(tl('Distribusi bootstrap koefisien jalur', 'Bootstrap distributions of the path coefficients'), tl(`Area berwarna = interval kepercayaan; merah = signifikan; ${fmtInt(R.boot.B)} subsampel`, `Shaded area = confidence interval; red = significant; ${fmtInt(R.boot.B)} subsamples`)); img(s, f, { x: X0, y: Y0, w: CW, h: CH }); } }
    if (R.boot.chains.length) {
      const mt = tmToCells(mediationTable(R)), cols = [0, 1, 4, 5, 8], pick = r => cols.map(i => r[i]);
      chunk(mt.rows.map(pick), 9).forEach((rows, k) => { s = content(tl('Efek tidak langsung (mediasi)', 'Indirect effects (mediation)') + (k ? tl(' (lanjutan)', ' (continued)') : ''), tl('Jenis mediasi menurut Zhao dkk. (2010)', 'Mediation types following Zhao et al. (2010)')); tbl(s, { head: pick(mt.head), rows }, { rel: [4.6, 1.3, 1.3, 1.3, 3.6] }); });
      { const f = fig('v-effects'); if (f) { s = content(tl('Dekomposisi efek langsung dan tidak langsung', 'Direct and indirect effect decomposition'), tl('Batang gelap = langsung; merah muda = tidak langsung; total di kanan', 'Dark = direct; pink = indirect; total on the right')); img(s, f, { x: X0, y: Y0, w: CW, h: CH }); } }
    }
  }
  if (R.pred) {
    const pp = fx.pp;
    s = content(tl('Kekuatan prediksi (PLSpredict)', 'Predictive power (PLSpredict)'), tl(`${R.pred.folds}-fold, ${R.pred.reps} pengulangan`, `${R.pred.folds} folds, ${R.pred.reps} repetitions`));
    s.addChart(p.ChartType.bar, [{ name: 'Q²predict', labels: rev(R.pred.items.map(x => R.items[x.k])), values: rev(R.pred.items.map(x => r3(x.q2))) }], chartOpts({ x: X0, y: Y0, w: 7.2, h: CH, chartColors: [INK], valAxisLabelFormatCode: '0.00' }));
    card(s, 8.15, Y0 + 0.1, 4.58, 3.3);
    s.addText([{ text: tl(`Daya prediksi ${pp.level}`, `Predictive power: ${pp.level}`), options: { bold: true, fontSize: 20, breakLine: true } }, { text: tl(`${pp.neg.length ? 'Ada Q²predict ≤ 0.' : 'Q²predict seluruh indikator endogen di atas 0.'} RMSE PLS lebih kecil daripada regresi linear pada ${pp.better} dari ${pp.n} indikator.`, `${pp.neg.length ? 'Some Q²predict values are ≤ 0.' : 'Q²predict is above 0 for every endogenous indicator.'} PLS RMSE is below the linear regression RMSE for ${pp.better} of ${pp.n} indicators.`), options: { fontSize: 16, color: MUTE } }], { x: 8.45, y: Y0 + 0.35, w: 4.0, h: 2.8, fontFace: F, color: INK, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 8 });
  }

  if (R.pred) { const f = fig('v-rmse'); if (f) { s = content(tl('PLSpredict: RMSE PLS dibanding LM', 'PLSpredict: RMSE of PLS versus LM'), tl('Titik merah = PLS lebih akurat daripada tolok ukur regresi linear', 'Red dots = PLS more accurate than the linear regression benchmark')); img(s, f, { x: X0, y: Y0, w: CW, h: CH }); } }
  /* advanced analyses */
  { const mdI = modInfo(R), hcI = hocInfo(R), G = R.mga && !R.mga.error ? R.mga : null, IP = R.ipma && R.ipma.rows && R.ipma.rows.length ? R.ipma : null, al = R.boot ? R.boot.alpha : 0.05;
    if (hcI.length) {
      const t1 = tmToCells(hocLocTable(R)), t2 = tmToCells(hocMeasTable(R));
      s = content(tl('Konstruk orde tinggi', 'Higher-order constructs'), tl('Disjoint two-stage: tahap 1 menilai konstruk orde rendah, tahap 2 menilai konstruk orde tinggi', 'Disjoint two-stage: stage 1 assesses the lower-order constructs, stage 2 the higher-order construct'));
      tbl(s, t1, { y: Y0 }); tbl(s, t2, { y: Y0 + 0.42 * (t1.rows.length + 1) + 0.55 });
    }
    mdI.forEach(d => {
      const sig = !!(d.s && d.s.P < al);
      s = content(tl(`Moderasi: ${d.M} × ${d.X} → ${d.Y}`, `Moderation: ${d.M} × ${d.X} → ${d.Y}`), tl('Pendekatan dua tahap; simple slope pada moderator −1 SD, rata-rata, dan +1 SD', 'Two-stage approach; simple slopes at moderator −1 SD, mean, and +1 SD'));
      img(s, fig('slope-' + d.k), { x: X0, y: Y0, w: 7.5, h: CH }); card(s, 8.35, Y0 + 0.1, 4.38, 4.1);
      s.addText([{ text: tl('Efek interaksi', 'Interaction effect'), options: { bold: true, fontSize: 18, breakLine: true } }, { text: `β = ${fmt(d.b3)}`, options: { fontSize: 30, bold: true, color: sig ? 'D2405F' : INK, breakLine: true } },
        { text: d.s ? `t = ${fmt(d.s.T)}; ${fmtPtxt(d.s.P)}` : tl('belum diuji (tanpa bootstrapping)', 'not tested (no bootstrapping)'), options: { fontSize: 15, color: MUTE, breakLine: true } }, { text: `f² = ${fmt(d.f2)} (${f2IntCat(d.f2)})`, options: { fontSize: 15, color: MUTE, breakLine: true } },
        { text: R.boot ? `${d.h.h}: ${decideTxt(sig)}` : '', options: { fontSize: 16, bold: true, breakLine: true } }, { text: ' ', options: { fontSize: 8, breakLine: true } },
        { text: tl(`Slope ${d.X} → ${d.Y}: ${fmt(d.slopes[0])} (−1 SD), ${fmt(d.slopes[1])} (rata-rata), ${fmt(d.slopes[2])} (+1 SD)`, `Slope ${d.X} → ${d.Y}: ${fmt(d.slopes[0])} (−1 SD), ${fmt(d.slopes[1])} (mean), ${fmt(d.slopes[2])} (+1 SD)`), options: { fontSize: 14, color: INK } }],
        { x: 8.6, y: Y0 + 0.3, w: 3.9, h: 3.7, fontFace: F, color: INK, margin: 0, valign: 'top', isTextBox: true });
    });
    if (G) {
      s = content(tl('MGA: invariansi pengukuran (MICOM)', 'MGA: measurement invariance (MICOM)'), `${G.column}: ${G.a} (n = ${G.nA}) vs ${G.b} (n = ${G.nB}); ${fmtInt(G.P)} ${tl('permutasi', 'permutations')}`);
      const m2 = tmToCells(micomStep2Table(R)); tbl(s, m2, { y: Y0 }); const m3 = tmToCells(micomStep3Table(R)), pick = [0, 1, 4, 5, 8]; tbl(s, { head: pick.map(i => m3.head[i]), rows: m3.rows.map(r => pick.map(i => r[i])) }, { y: Y0 + 0.42 * (m2.rows.length + 1) + 0.55 });
      const mp = tmToCells(mgaPathTable(R)); chunk(mp.rows, 10).forEach((rows, k) => { s = content(tl(`MGA: perbandingan koefisien jalur ${G.a} vs ${G.b}`, `MGA: path coefficients ${G.a} vs ${G.b}`) + (k ? tl(' (lanjutan)', ' (continued)') : ''), tl('Hijau = signifikan di grupnya; perbedaan diuji dengan uji permutasi', 'Green = significant within its group; differences tested with a permutation test')); tbl(s, { head: mp.head, rows }); });
    }
    if (IP) {
      s = content(tl(`IPMA: ${IP.targetName}`, `IPMA: ${IP.targetName}`), tl('Importance = efek total tak terstandar; performance = skor 0–100', 'Importance = unstandardized total effect; performance = 0–100 score'));
      img(s, fig('ipma'), { x: X0, y: Y0, w: 7.6, h: CH }); const it = tmToCells(ipmaTable(R)), pk = [0, 1, 2]; tbl(s, { head: pk.map(i => it.head[i]), rows: it.rows.map(r => pk.map(i => r[i])) }, { x: 8.4, y: Y0 + 0.1, w: 4.33, rel: [1, 1.25, 1.25] });
    }
  }

  /* 19-21. key findings, conclusions, references */
  s = content(tl('Temuan utama', 'Key findings'));
  const kf = [[R.boot ? `${fx.sup.length}/${R.hyp.length}` : '–', tl('hipotesis diterima', 'hypotheses supported')], [fx.r2lo === fx.r2hi ? pct(fx.r2lo) : `${fmt(fx.r2lo * 100, 0)}–${fmt(fx.r2hi * 100, 0)}%`, tl('varians konstruk endogen terjelaskan', 'variance explained in endogenous constructs')], fx.pp ? [fx.pp.code === 'high' ? tl('Tinggi', 'High') : fx.pp.code === 'medium' ? tl('Sedang', 'Medium') : fx.pp.code === 'low' ? tl('Rendah', 'Low') : '–', tl('kekuatan prediksi di luar sampel', 'out-of-sample predictive power')] : [fmt(fx.srmr), 'SRMR (saturated model)']];
  kf.forEach(([v, l], i) => { const x = X0 + i * 4.1; card(s, x, Y0 + 0.4, 3.85, 3.6, i === 0 ? 'FBEFF2' : SOFT); s.addText(v, { x: x + 0.35, y: Y0 + 0.9, w: 3.2, h: 1.5, fontFace: F, fontSize: 60, bold: true, color: i === 0 ? 'B3304D' : INK, margin: 0, isTextBox: true }); s.addText(l, { x: x + 0.35, y: Y0 + 2.6, w: 3.2, h: 1.1, fontFace: F, fontSize: 18, color: MUTE, margin: 0, isTextBox: true, valign: 'top' }); });
  s = p.addSlide({ masterName: 'SB_DARK' });
  s.addText(tl('Kesimpulan', 'Conclusions'), { x: X0, y: 0.45, w: CW, h: 0.8, fontFace: F, fontSize: 36, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  const cut = R.hyp.length > 8 ? Math.ceil(R.hyp.length / 2) : R.hyp.length, rowH = Math.min(0.62, 5.0 / Math.max(1, cut));
  R.hyp.slice(0, 20).forEach((h, i) => {
    const col = i < cut ? 0 : 1, row = col ? i - cut : i, x = X0 + col * 6.2, y = 1.55 + row * rowH, sb = R.boot ? R.bootPath.get(h.i + ',' + h.j) : null, sig = !!(sb && sb.P < R.boot.alpha);
    s.addShape(p.ShapeType.ellipse, { x, y: y + 0.07, w: 0.26, h: 0.26, fill: { color: sig ? PINK : INK }, line: { color: PINK, width: 1.5 } });
    s.addText([{ text: `${h.h}  ${h.from} → ${h.to}`, options: { bold: true, color: 'FFFFFF', breakLine: true } }, { text: sb ? `${decideTxt(sig)}: β = ${fmt(sb.O)}; ${fmtPtxt(sb.P)}` : tl(`β = ${fmt(e.B[h.i][h.j])}; signifikansi belum diuji`, `β = ${fmt(e.B[h.i][h.j])}; significance not tested`), options: { color: 'C9CCD3', fontSize: 14 } }], { x: x + 0.45, y, w: 5.6, h: rowH, fontFace: F, fontSize: 16, margin: 0, isTextBox: true, valign: 'top' });
  });
  if (R.boot) s.addText(tl('Bulatan penuh = hipotesis diterima; bulatan kosong = ditolak.', 'Filled circle = hypothesis supported; hollow circle = not supported.'), { x: X0, y: 6.85, w: CW, h: 0.35, fontFace: F, fontSize: 12, color: '9A9EAA', margin: 0, isTextBox: true });
  const refs = paperModel(R).refs.map((r, i) => `[${i + 1}] ${refText(r)}`), half = Math.ceil(refs.length / 2);
  s = content(tl('Daftar pustaka', 'References'));
  [refs.slice(0, half), refs.slice(half)].forEach((list, c) => s.addText(list.map((t, i) => ({ text: t, options: { breakLine: i < list.length - 1 } })), { x: X0 + c * 6.15, y: Y0, w: 5.95, h: CH, fontFace: F, fontSize: 10.5, color: INK, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 5 }));
  return p;
}
async function exportPptx() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun presentasi PowerPoint…', 'Building the PowerPoint presentation…'), async () => {
    const PG = loadLib('lib-pptx', 'PptxGenJS'), L = exportLang(), figs = slideFigures(R, L);
    await renderPngs(figs);
    const eqs = await eqPngs(DECK_EQS, L, 4), deck = withLang(L, () => buildDeck2(PG, R, figs, eqs));
    const blob = await deck.write({ outputType: 'blob' });
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_presentation_PLS-SEM.pptx' : '_presentasi_PLS-SEM.pptx'), blob);
    if (ok && !NATIVE) toast(tl('Presentasi PowerPoint diunduh.', 'PowerPoint presentation downloaded.'), 'ok');
  });
}

/* ---- Beamer */
const BEAMER_FILES = { concept: 'model.png', 'diagram-coefp': 'estimated.png', 'diagram-coef': 'estimated.png', 'diagram-coefs': 'estimated.png', 'diagram-t': 'estimated.png', loadings: 'loadings.png', reliability: 'reliability.png', r2: 'r2.png', forest: 'forest.png', q2: 'q2predict.png' };
function texUniPreamble() {
  return [['03B1', '\\alpha'], ['03B2', '\\beta'], ['03C1', '\\rho'], ['2192', '\\rightarrow'], ['00B2', '^{2}'], ['00B3', '^{3}'], ['2265', '\\geq'], ['2264', '\\leq'], ['00D7', '\\times'], ['2212', '-'], ['207B', '^{-}'], ['03BB', '\\lambda'], ['03BE', '\\xi'], ['03B5', '\\varepsilon'], ['03B7', '\\eta'], ['03B6', '\\zeta'], ['03C3', '\\sigma'], ['03B4', '\\delta'], ['0394', '\\Delta'], ['03A3', '\\Sigma'], ['03BC', '\\mu'], ['03B3', '\\gamma'], ['03B8', '\\theta'], ['03C4', '\\tau'], ['03C6', '\\phi'], ['03C7', '\\chi'], ['03C9', '\\omega'], ['03C0', '\\pi'], ['00B1', '\\pm'], ['2248', '\\approx'], ['2260', '\\neq'], ['221A', '\\surd']].map(([c, m]) => `\\DeclareUnicodeCharacter{${c}}{\\ensuremath{${m}}}`).concat(['\\DeclareUnicodeCharacter{2003}{\\quad{}}']);
}
function buildBeamerTex(R) {
  const refl = reflIdx(R), e = R.A.est, form = R.lv.map((_, j) => j).filter(j => !R.refl[j]), fx = deckFacts(R), b = R.boot, P = R.pred, x = texEsc, eqT = k => eqv(k).tex;
  const algo = R.opts.plsc ? 'PLSc' : 'PLS-SEM', tails = b ? (b.tails === 'two' ? tl('dua arah', 'two-tailed') : tl('satu arah', 'one-tailed')) : '';
  const L = ['% ' + tl('Presentasi Beamer dari', 'Beamer slides generated by') + ` SEMbada ${APP_VERSION}. ` + tl('Kompilasi dengan pdfLaTeX.', 'Compile with pdfLaTeX.'),
    '\\documentclass[aspectratio=169,11pt]{beamer}', '\\usepackage[T1]{fontenc}', '\\usepackage[utf8]{inputenc}', '\\usepackage{helvet}', '\\renewcommand{\\rmdefault}{ptm}', '\\renewcommand{\\familydefault}{\\sfdefault}',
    '\\usepackage{amsmath}', '\\usepackage{amssymb}', '\\usepackage{graphicx}', '\\usepackage{booktabs}', '\\usepackage{array}', '\\usepackage{adjustbox}'].concat(texUniPreamble(), [
    '\\definecolor{ink}{HTML}{262A33}', '\\definecolor{accent}{HTML}{D2405F}', '\\definecolor{accentlt}{HTML}{F06D88}', '\\definecolor{soft}{HTML}{F7F3F5}', '\\definecolor{muted}{HTML}{5D6270}', '\\definecolor{pass}{HTML}{22744E}',
    '\\setbeamercolor{normal text}{fg=ink}', '\\setbeamercolor{structure}{fg=accent}', '\\setbeamercolor{frametitle}{fg=ink}', '\\setbeamercolor{block title}{fg=white,bg=ink}', '\\setbeamercolor{block body}{fg=ink,bg=soft}',
    '\\setbeamertemplate{navigation symbols}{}', '\\setbeamertemplate{itemize items}[circle]', '\\setbeamertemplate{blocks}[rounded][shadow=false]', '\\setbeamerfont{frametitle}{size=\\Large,series=\\bfseries}', '\\setbeamerfont{block title}{size=\\small,series=\\bfseries}',
    '\\setbeamertemplate{frametitle}{\\vspace*{0.5em}{\\color{accent}\\large$\\bullet$}\\hspace{0.5em}\\insertframetitle\\par\\vspace{0.2em}}',
    '\\setbeamertemplate{footline}{\\hspace*{1.2em}{\\tiny\\color{muted}SEMbada}\\hfill{\\tiny\\color{muted}\\insertframenumber}\\hspace*{1.2em}\\vspace*{0.9em}}',
    '\\newcommand{\\darkframe}[1]{{\\setbeamercolor{background canvas}{bg=ink}\\setbeamertemplate{footline}{}\\begin{frame}[plain]#1\\end{frame}}}',
    '\\newcommand{\\sectionframe}[3]{\\darkframe{\\vfill\\begin{minipage}{0.9\\textwidth}{\\color{accentlt}\\fontsize{54}{56}\\selectfont\\bfseries #1\\par}\\vspace{0.6em}{\\color{white}\\fontsize{26}{30}\\selectfont\\bfseries #2\\par}\\vspace{0.4em}{\\color{white!70!ink}\\large #3\\par}\\end{minipage}\\vfill}}',
    '\\newcommand{\\eqblock}[3]{\\begin{block}{#1}{\\centering\\vspace{0.2em}\\adjustbox{max width=\\linewidth}{$\\displaystyle #2$}\\par}\\vspace{0.35em}{\\raggedright\\footnotesize\\color{muted}#3\\par}\\end{block}}',
    '', '\\begin{document}', '',
    `\\darkframe{\\vfill{\\color{white}${(t => (t.length > 60 ? '\\fontsize{22}{26}' : t.length > 40 ? '\\fontsize{26}{30}' : '\\fontsize{30}{34}'))(infoTitleFor(R))}\\selectfont\\bfseries ${x(infoTitleFor(R))}\\par}\\vspace{0.8em}{\\color{accentlt}\\Large ${x(tl('Hasil analisis partial least squares structural equation modeling', 'Partial least squares structural equation modeling results'))}\\par}\\vspace{0.5em}{\\color{white!70!ink}\\normalsize ${x(tl(`${fmtInt(R.prep.n)} responden, ${R.model.constructs.length} konstruk, ${R.hyp.length} hipotesis`, `${fmtInt(R.prep.n)} respondents, ${R.model.constructs.length} constructs, ${R.hyp.length} hypotheses`))}\\par}\\vfill}`, '',
    `\\begin{frame}{${x(tl('Agenda', 'Agenda'))}}`, '\\begin{enumerate}\\setlength{\\itemsep}{0.6em}\\large', ...[[tl('Model penelitian', 'Research model'), tl('konstruk dan hipotesis', 'constructs and hypotheses')], [tl('Metodologi', 'Methodology'), tl('model, algoritma, dan kriteria', 'model, algorithm, and criteria')], [tl('Model pengukuran', 'Measurement model'), tl('reliabilitas dan validitas', 'reliability and validity')], [tl('Model struktural', 'Structural model'), tl('hipotesis, mediasi, prediksi', 'hypotheses, mediation, prediction')], [tl('Kesimpulan', 'Conclusions'), tl('temuan utama', 'key findings')]].map(([t, d]) => `\\item \\textbf{${x(t)}} {\\color{muted}--- ${x(d)}}`), '\\end{enumerate}', '\\end{frame}', '',
    `\\sectionframe{01}{${x(tl('Model penelitian', 'Research model'))}}{${x(tl(`${R.model.constructs.length} konstruk dan ${R.hyp.length} hipotesis`, `${R.model.constructs.length} constructs and ${R.hyp.length} hypotheses`))}}`,
    `\\begin{frame}{${x(tl('Model penelitian dan hipotesis', 'Research model and hypotheses'))}}`, '\\begin{columns}[T]', '\\begin{column}{0.62\\textwidth}\\centering\\includegraphics[width=\\linewidth,height=0.72\\textheight,keepaspectratio]{model.png}\\end{column}',
    `\\begin{column}{0.36\\textwidth}\\begin{block}{${x(tl('Hipotesis', 'Hypotheses'))}}${R.hyp.length > 10 ? '\\scriptsize' : '\\footnotesize'}`, ...R.hyp.map(h => `\\textbf{${x(h.h)}}\\enspace ${x(h.from)} → ${x(h.to)}\\par`), '\\end{block}\\end{column}', '\\end{columns}', '\\end{frame}', '',
    `\\sectionframe{02}{${x(tl('Metodologi', 'Methodology'))}}{${x(tl(`${algo}, bootstrapping, dan PLSpredict`, `${algo}, bootstrapping, and PLSpredict`))}}`,
    `\\begin{frame}{${x(tl('Model PLS-SEM', 'The PLS-SEM model'))}}`, '\\begin{columns}[T]', `\\begin{column}{0.32\\textwidth}\\eqblock{${x(tl('Pengukuran reflektif', 'Reflective measurement'))}}{${eqT('refl')}}{${x(tl('Indikator mencerminkan konstruk', 'Indicators reflect the construct'))}}\\end{column}`,
    `\\begin{column}{0.32\\textwidth}\\eqblock{${x(tl('Pengukuran formatif', 'Formative measurement'))}}{${eqT('form')}}{${x(tl('Indikator membentuk konstruk', 'Indicators form the construct'))}}\\end{column}`,
    `\\begin{column}{0.32\\textwidth}\\eqblock{${x(tl('Model struktural', 'Structural model'))}}{${eqT('struct')}}{${x(tl('Pendahulu memengaruhi konstruk endogen', 'Predecessors affect each endogenous construct'))}}\\end{column}`, '\\end{columns}', '\\vspace{1em}',
    `{\\color{accent}\\textbf{${x(tl('Mengapa PLS-SEM?', 'Why PLS-SEM?'))}}} ${x(tl('Pendekatan berbasis varians yang memaksimalkan varians terjelaskan konstruk endogen, cocok untuk model kompleks dan berorientasi prediksi.', 'A variance-based approach that maximizes the explained variance of the endogenous constructs; suited to complex, prediction-oriented models.'))}`, '\\end{frame}', '',
    `\\begin{frame}{${x(tl('Algoritma PLS', 'The PLS algorithm'))}}`, '\\begin{columns}[T]', '\\begin{column}{0.49\\textwidth}', `\\eqblock{${x(tl('1. Pendekatan luar', '1. Outer approximation'))}}{${eqT('outer')}}{${x(tl('Skor konstruk = jumlah tertimbang indikator', 'Construct score = weighted sum of indicators'))}}`, `\\eqblock{${x(tl('3. Bobot dalam (path weighting)', '3. Inner weights (path weighting)'))}}{${eqT('scheme')}}{}`, '\\end{column}',
    '\\begin{column}{0.49\\textwidth}', `\\eqblock{${x(tl('2. Pendekatan dalam', '2. Inner approximation'))}}{${eqT('inner')}}{${x(tl('Proksi dari konstruk yang berdekatan', 'Proxy from adjacent constructs'))}}`, `\\eqblock{${x(tl('4. Pembaruan bobot luar', '4. Outer weight update'))}}{${eqT('modeA')}${form.length ? '\\qquad ' + eqT('modeB') : ''}}{${x(tl(`Berhenti bila perubahan bobot < ${pow10(R.settings.stopExp)}`, `Stops when the weight change < ${pow10(R.settings.stopExp)}`))}}`, '\\end{column}', '\\end{columns}', '\\end{frame}', '',
    `\\begin{frame}{${x(tl('Kriteria model pengukuran', 'Measurement model criteria'))}}`, '\\begin{columns}[T]', '\\begin{column}{0.49\\textwidth}', `\\eqblock{Cronbach's alpha}{${eqT('alpha')}}{${x(tl(`Memadai bila ≥ ${k2(0.70)}`, `Satisfactory when ≥ ${k2(0.70)}`))}}`, `\\eqblock{Average variance extracted}{${eqT('ave')}}{${x(tl(`Validitas konvergen bila ≥ ${k2(0.50)}`, `Convergent validity when ≥ ${k2(0.50)}`))}}`, '\\end{column}',
    '\\begin{column}{0.49\\textwidth}', `\\eqblock{Composite reliability}{${eqT('rhoc')}}{${x(tl(`Memadai antara ${k2(0.70)} dan ${k2(0.95)}`, `Satisfactory between ${k2(0.70)} and ${k2(0.95)}`))}}`, `\\eqblock{Heterotrait--monotrait ratio}{${eqT('htmt')}}{${x(tl(`Validitas diskriminan bila < ${k2(0.85)}`, `Discriminant validity when < ${k2(0.85)}`))}}`, '\\end{column}', '\\end{columns}', '\\end{frame}', '',
    `\\begin{frame}{${x(tl('Kriteria model struktural', 'Structural model criteria'))}}`, '\\begin{columns}[T]', '\\begin{column}{0.49\\textwidth}', `\\eqblock{${x(tl('Koefisien determinasi', 'Coefficient of determination'))}}{${eqT('r2')}}{${x(tl(`${k2(0.25)} lemah, ${k2(0.50)} moderat, ${k2(0.75)} kuat`, `${k2(0.25)} weak, ${k2(0.50)} moderate, ${k2(0.75)} substantial`))}}`, `\\eqblock{${x(tl('Ukuran efek dan kolinearitas', 'Effect size and collinearity'))}}{${eqT('f2')}\\qquad ${eqT('vif')}}{${x(tl(`f²: ${k2(0.02)} / ${k2(0.15)} / ${k2(0.35)}; VIF < 5`, `f²: ${k2(0.02)} / ${k2(0.15)} / ${k2(0.35)}; VIF < 5`))}}`, '\\end{column}',
    '\\begin{column}{0.49\\textwidth}', `\\eqblock{Bootstrapping${b ? ` (B = ${fmtInt(b.B)})` : ''}}{${eqT('boot')}}{${x(b ? tl(`Diterima bila p < ${fmt(b.alpha, 2)} (uji ${tails})`, `Supported when p < ${fmt(b.alpha, 2)} (${tails} test)`) : '')}}`, `\\eqblock{${x(tl('Interval kepercayaan dan efek tidak langsung', 'Confidence interval and indirect effect'))}}{${eqT('ci')}\\qquad ${eqT('indirect')}}{}`, '\\end{column}', '\\end{columns}', '\\end{frame}', '',
    `\\begin{frame}{${x(tl('Kecocokan model dan kekuatan prediksi', 'Model fit and predictive power'))}}`, '\\begin{columns}[T]', '\\begin{column}{0.49\\textwidth}', `\\eqblock{SRMR}{${eqT('srmr')}}{${x(tl(`Kecocokan baik bila < ${k2(0.08)}`, `Good fit when < ${k2(0.08)}`))}}`, '\\end{column}', '\\begin{column}{0.49\\textwidth}', `\\eqblock{Q²predict}{${eqT('q2')}}{${x(tl('Lebih baik dari rata-rata bila > 0', 'Beats the mean benchmark when > 0'))}}`, `\\eqblock{${x(tl('Galat prediksi', 'Prediction error'))}}{${eqT('rmse')}}{}`, '\\end{column}', '\\end{columns}', '\\end{frame}', '',
    `\\sectionframe{03}{${x(tl('Model pengukuran', 'Measurement model'))}}{${x(tl('Reliabilitas dan validitas', 'Reliability and validity'))}}`]);
  const relRows = refl.map(j => `${x(R.lv[j])} & ${fmt(R.A.alpha[j])} & ${fmt(R.A.rhoA[j])} & ${fmt(R.A.rhoC[j])} & ${fmt(R.A.AVE[j])} \\\\`);
  L.push(`\\begin{frame}{${x(tl('Reliabilitas dan validitas konvergen', 'Reliability and convergent validity'))}}`, '\\begin{columns}[T]', '\\begin{column}{0.44\\textwidth}\\footnotesize\\centering', '\\begin{tabular}{lrrrr}\\toprule', `\\textbf{${x(tl('Konstruk', 'Construct'))}} & $\\alpha$ & $\\rho_A$ & $\\rho_C$ & AVE \\\\\\midrule`, ...relRows, '\\bottomrule\\end{tabular}', '\\par\\vspace{0.8em}', `{\\scriptsize\\color{muted}${x(tl(`Batas: alpha dan rho ≥ ${k2(0.70)}, AVE ≥ ${k2(0.50)}`, `Thresholds: alpha and rho ≥ ${k2(0.70)}, AVE ≥ ${k2(0.50)}`))}\\par}`, '\\end{column}', '\\begin{column}{0.54\\textwidth}\\centering\\includegraphics[width=\\linewidth,height=0.7\\textheight,keepaspectratio]{loadings.png}\\end{column}', '\\end{columns}', '\\end{frame}', '');
  if (refl.length > 1) {
    const H = R.A.HTMT, hl = refl.map(j => R.lv[j]);
    L.push(`\\begin{frame}{${x(tl('Validitas diskriminan (HTMT)', 'Discriminant validity (HTMT)'))}}`, '\\centering\\small', `\\begin{tabular}{l${'r'.repeat(hl.length - 1)}}\\toprule`, ` & ${hl.slice(0, -1).map(x).join(' & ')} \\\\\\midrule`, ...refl.slice(1).map((i, a) => `${x(R.lv[i])} & ${refl.slice(0, -1).map((j, c) => (c <= a ? (H[i][j] >= 0.9 ? `\\textcolor{accent}{${fmt(H[i][j])}}` : fmt(H[i][j])) : '')).join(' & ')} \\\\`), '\\bottomrule\\end{tabular}', '\\par\\vspace{1em}', `{\\footnotesize\\color{muted}${x(tl(`Nilai di bawah ${k2(0.85)} (konservatif) atau ${k2(0.90)} mendukung validitas diskriminan.`, `Values below ${k2(0.85)} (conservative) or ${k2(0.90)} support discriminant validity.`))}\\par}`, '\\end{frame}', '');
  }
  L.push(`\\sectionframe{04}{${x(tl('Model struktural', 'Structural model'))}}{${x(tl('Hipotesis, mediasi, dan prediksi', 'Hypotheses, mediation, and prediction'))}}`,
    `\\begin{frame}{${x(tl('Model struktural hasil estimasi', 'Estimated structural model'))}}`, '\\centering\\includegraphics[width=\\linewidth,height=0.8\\textheight,keepaspectratio]{estimated.png}', '\\end{frame}', '',
    `\\begin{frame}{${x(tl('Koefisien determinasi (R²)', 'Coefficient of determination (R²)'))}}`, '\\begin{columns}[c]', '\\begin{column}{0.5\\textwidth}\\centering\\includegraphics[width=\\linewidth,height=0.6\\textheight,keepaspectratio]{r2.png}\\end{column}', '\\begin{column}{0.46\\textwidth}\\centering\\small', '\\begin{tabular}{lrrl}\\toprule', `\\textbf{${x(tl('Konstruk', 'Construct'))}} & R² & ${x(tl('R² adj.', 'Adj. R²'))} & ${x(tl('Kategori', 'Category'))} \\\\\\midrule`, ...R.endo.map(j => `${x(R.lv[j])} & ${fmt(e.R2[j])} & ${fmt(e.R2adj[j])} & ${x(r2Cat(e.R2[j]))} \\\\`), '\\bottomrule\\end{tabular}', '\\end{column}', '\\end{columns}', '\\end{frame}', '');
  const hypRows = R.hyp.map(h => { const sb = b ? R.bootPath.get(h.i + ',' + h.j) : null, sig = !!(sb && sb.P < b.alpha); return sb ? `${x(h.h)} & ${x(h.from)} → ${x(h.to)} & ${fmt(sb.O)} & ${fmt(sb.T)} & ${fmtP(sb.P)} & ${sig ? `\\textcolor{pass}{\\textbf{${x(decideTxt(true))}}}` : `\\textcolor{muted}{${x(decideTxt(false))}}`} \\\\` : `${x(h.h)} & ${x(h.from)} → ${x(h.to)} & ${fmt(e.B[h.i][h.j])} & -- & -- & -- \\\\`; });
  chunk(hypRows, 10).forEach((rows, k) => L.push(`\\begin{frame}{${x(tl('Hasil uji hipotesis', 'Hypothesis testing results') + (k ? tl(' (lanjutan)', ' (continued)') : ''))}}`, '\\centering\\small', '\\begin{tabular}{llrrrl}\\toprule', `\\textbf{${x(tl('Hipotesis', 'Hypothesis'))}} & \\textbf{${x(tl('Jalur', 'Path'))}} & $\\beta$ & t & p & \\textbf{${x(tl('Keputusan', 'Decision'))}} \\\\\\midrule`, ...rows, '\\bottomrule\\end{tabular}', '\\par\\vspace{0.8em}', `{\\footnotesize\\color{muted}${x(b ? tl(`Bootstrapping ${fmtInt(b.B)} subsampel, uji ${tails}, α = ${k2(b.alpha)}.`, `Bootstrapping with ${fmtInt(b.B)} subsamples, ${tails} test, α = ${k2(b.alpha)}.`) : tl('Bootstrapping tidak dijalankan.', 'Bootstrapping was not run.'))}\\par}`, '\\end{frame}', ''));
  if (b) {
    L.push(`\\begin{frame}{${x(tl('Koefisien jalur dan interval kepercayaan', 'Path coefficients and confidence intervals'))}}`, '\\centering\\includegraphics[width=\\linewidth,height=0.78\\textheight,keepaspectratio]{forest.png}', '\\end{frame}', '');
    if (b.chains.length) {
      const medRows = b.chains.map(c => { const s2 = c.s, sig = !!(s2 && s2.P < b.alpha); return `${c.key.map(i => x(R.lv[i])).join(' → ')} & ${s2 ? fmt(s2.O) : '--'} & ${s2 ? fmt(s2.T) : '--'} & ${s2 ? fmtP(s2.P) : '--'} & ${sig ? `\\textcolor{pass}{${x(mediationText(mediationCode(R, c)))}}` : `\\textcolor{muted}{${x(mediationText(mediationCode(R, c)))}}`} \\\\`; });
      chunk(medRows, 9).forEach((rows, k) => L.push(`\\begin{frame}{${x(tl('Efek tidak langsung (mediasi)', 'Indirect effects (mediation)') + (k ? tl(' (lanjutan)', ' (continued)') : ''))}}`, '\\centering\\footnotesize', '\\begin{tabular}{lrrrl}\\toprule', `\\textbf{${x(tl('Jalur tidak langsung', 'Indirect path'))}} & $\\beta$ & t & p & \\textbf{${x(tl('Jenis mediasi', 'Mediation type'))}} \\\\\\midrule`, ...rows, '\\bottomrule\\end{tabular}', '\\end{frame}', ''));
    }
  }
  if (P) L.push(`\\begin{frame}{${x(tl('Kekuatan prediksi (PLSpredict)', 'Predictive power (PLSpredict)'))}}`, '\\begin{columns}[c]', '\\begin{column}{0.58\\textwidth}\\centering\\includegraphics[width=\\linewidth,height=0.72\\textheight,keepaspectratio]{q2predict.png}\\end{column}', `\\begin{column}{0.38\\textwidth}\\begin{block}{${x(tl(`Daya prediksi ${fx.pp.level}`, `Predictive power: ${fx.pp.level}`))}}\\small ${x(tl(`${fx.pp.neg.length ? 'Ada Q²predict ≤ 0.' : 'Q²predict seluruh indikator di atas 0.'} RMSE PLS lebih kecil daripada regresi linear pada ${fx.pp.better} dari ${fx.pp.n} indikator.`, `${fx.pp.neg.length ? 'Some Q²predict values are ≤ 0.' : 'Q²predict is above 0 for every indicator.'} PLS RMSE is below the linear regression RMSE for ${fx.pp.better} of ${fx.pp.n} indicators.`))}\\end{block}\\end{column}`, '\\end{columns}', '\\end{frame}', '');
  const kf = [[b ? `${fx.sup.length}/${R.hyp.length}` : '--', tl('hipotesis diterima', 'hypotheses supported')], [fx.r2lo === fx.r2hi ? fmt(fx.r2lo * 100, 1) + '\\%' : `${fmt(fx.r2lo * 100, 0)}--${fmt(fx.r2hi * 100, 0)}\\%`, tl('varians terjelaskan', 'variance explained')], P ? [x(fx.pp.code === 'high' ? tl('Tinggi', 'High') : fx.pp.code === 'medium' ? tl('Sedang', 'Medium') : fx.pp.code === 'low' ? tl('Rendah', 'Low') : '--'), tl('kekuatan prediksi', 'predictive power')] : [fmt(fx.srmr), 'SRMR']];
  L.push(`\\begin{frame}{${x(tl('Temuan utama', 'Key findings'))}}`, '\\vfill\\begin{columns}[T]', ...kf.map(([v, l]) => `\\begin{column}{0.31\\textwidth}\\begin{block}{}\\centering{\\fontsize{30}{34}\\selectfont\\bfseries\\color{accent}\\mbox{${v}}\\par}\\vspace{0.3em}{\\small\\color{muted}${x(l)}\\par}\\end{block}\\end{column}`), '\\end{columns}\\vfill', '\\end{frame}', '');
  const concl = R.hyp.map(h => { const sb = b ? R.bootPath.get(h.i + ',' + h.j) : null, sig = !!(sb && sb.P < b.alpha); return `{\\color{${sig ? 'accentlt' : 'white!55!ink'}}$\\${sig ? 'bullet' : 'circ'}$}\\enspace\\textbf{${x(h.h)}} ${x(h.from)} → ${x(h.to)}: ${x(sb ? `${decideTxt(sig)} (β = ${fmt(sb.O)}; ${fmtPtxt(sb.P)})` : `β = ${fmt(e.B[h.i][h.j])}`)}\\par`; });
  L.push(`\\darkframe{\\vspace{1.2em}{\\color{white}\\fontsize{26}{30}\\selectfont\\bfseries ${x(tl('Kesimpulan', 'Conclusions'))}\\par}\\vspace{1em}{\\color{white}${R.hyp.length > 10 ? '\\scriptsize' : '\\small'}`, ...concl, '}}', '');
  const refs = paperModel(R).refs;
  L.push(`\\begin{frame}[allowframebreaks]{${x(tl('Daftar pustaka', 'References'))}}`, '\\tiny', ...refs.map((r, i) => `[${i + 1}] ${r.map(([t, it]) => (it ? `\\textit{${x(t)}}` : x(t))).join('')}\\par\\smallskip`), '\\end{frame}', '', '\\end{document}', '');
  return L.join('\n');
}
async function beamerAssets(R, L) {
  const figs = slideFigures(R, L).filter(f => BEAMER_FILES[f.key] || f.ext || ['v-htmt', 'v-f2', 'v-ridge', 'v-effects', 'v-rmse', 'v-indcor'].includes(f.key)); await renderPngs(figs);
  return figs.map(f => ({ name: BEAMER_FILES[f.key] || f.key + '.png', data: f.png }));
}
async function exportBeamerTex() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun presentasi Beamer…', 'Building the Beamer slides…'), async () => {
    const L = exportLang(), assets = await beamerAssets(R, L), tex = withLang(L, () => buildBeamerTex(R));
    const readme = withLang(L, () => tl('Kompilasi slides.tex dengan pdfLaTeX, misalnya di Overleaf (New Project > Upload Project > pilih file zip ini). Simpan semua gambar PNG di folder yang sama.\r\n', 'Compile slides.tex with pdfLaTeX, for example on Overleaf (New Project > Upload Project > choose this zip file). Keep all PNG images in the same folder.\r\n'));
    const zip = IO.zipStore([{ name: 'slides.tex', data: tex }].concat(assets, [{ name: L === 'en' ? 'README.txt' : 'BACA.txt', data: readme }]));
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_beamer_latex.zip' : '_beamer_latex.zip'), new Blob([zip], { type: 'application/zip' }));
    if (ok && !NATIVE) toast(tl('Presentasi Beamer (LaTeX) diunduh.', 'Beamer slides (LaTeX) downloaded.'), 'ok');
  });
}
async function exportBeamerPdf() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun PDF Beamer dengan LaTeX… (pertama kali sekitar 10 detik)', 'Typesetting the Beamer PDF with LaTeX… (about 10 seconds the first time)'), async () => {
    const L = exportLang(), assets = await beamerAssets(R, L), tex = withLang(L, () => buildBeamerTex(R));
    const out = await texCompile(tex, assets);
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_beamer_slides.pdf' : '_presentasi_beamer.pdf'), new Blob([out.pdf], { type: 'application/pdf' }));
    if (ok && !NATIVE) toast(tl('PDF Beamer diunduh.', 'Beamer PDF downloaded.'), 'ok');
  });
}

/* Beamer additions: authors, research constructs, advanced methods and results */
buildBeamerTex = (f => R => {
  let t = f(R); const x = texEsc, eqT = k => eqv(k).tex, mdI = modInfo(R), hcI = hocInfo(R), G = R.mga && !R.mga.error ? R.mga : null, IP = R.ipma && R.ipma.rows && R.ipma.rows.length ? R.ipma : null, al = R.boot ? R.boot.alpha : 0.05;
  const ins = (marker, text, from) => { const i = t.indexOf(marker, from || 0); if (i < 0) return false; t = t.slice(0, i) + text + t.slice(i); return true; };
  const tab = (title, sub, cols, head, rows, note) => [`\\begin{frame}{${x(title)}}`, sub ? `{\\small\\color{muted}${x(sub)}\\par}\\vspace{0.4em}` : '', '\\centering\\footnotesize', `\\begin{tabular}{${cols}}\\toprule`, head.join(' & ') + ' \\\\\\midrule', ...rows.map(r => r.join(' & ') + ' \\\\'), '\\bottomrule\\end{tabular}', note ? `\\par\\vspace{0.5em}{\\scriptsize\\color{muted}${x(note)}\\par}` : '', '\\end{frame}', ''].join('\n');
  const cv = c => x(cellText(c)), au = infoAuthors(), doc = t.indexOf('\\begin{document}');
  if (au.length) ins('\\vfill}', `\\vspace{1em}{\\color{white}\\normalsize ${x(au.map(a => a.name).join(', '))}\\par}${String(au[0].inst || '').trim() ? `{\\color{white!70!ink}\\small ${x(String(au[0].inst).trim())}\\par}` : ''}`, doc);
  const rowsC = R.model.constructs.map(c => ({ c, f: conFull(c.id), d: conDefTxt(c.id) })).filter(q => q.f || q.d);
  if (rowsC.length) ins('\\sectionframe{02}', chunk(rowsC, 6).map((rr, k) => tab(tl('Konstruk penelitian', 'Research constructs') + (k ? tl(' (lanjutan)', ' (continued)') : ''), '', 'l>{\\raggedright\\arraybackslash}p{0.25\\textwidth}>{\\raggedright\\arraybackslash}p{0.55\\textwidth}', [x(tl('Konstruk', 'Construct')), x(tl('Nama lengkap', 'Full name')), x(tl('Definisi', 'Definition'))], rr.map(q => [`\\textbf{${x(q.c.name)}}`, x(q.f || '--'), x(q.d || '--')]))).join('\n'), doc);
  const ss = sampleSizeTable(R).rows[1], blocks = [[tl('Ukuran sampel minimum', 'Minimum sample size'), 'nmin', ss && Number.isFinite(cellRaw(ss[3])) ? `|β min| = ${fmt(cellRaw(ss[2]))}; n min = ${fmtInt(cellRaw(ss[3]))}; n = ${fmtInt(R.prep.n)}` : 'Kock & Hadaya (2018)']];
  if (hcI.length) blocks.push([tl('Konstruk orde tinggi (tahap 2)', 'Higher-order construct (stage 2)'), 'hoc', 'Sarstedt et al. (2019)']);
  if (mdI.length) blocks.push([tl('Term interaksi (dua tahap)', 'Interaction term (two-stage)'), 'inter', 'Henseler & Chin (2010)'], ['Simple slope', 'slope', tl('Efek X pada tingkat moderator', 'Effect of X at moderator levels')]);
  if (G) blocks.push(['MICOM', 'micom', 'Henseler et al. (2016)'], [tl('Uji permutasi', 'Permutation test'), 'mgaperm', 'Chin & Dibbern (2010)']);
  if (IP) blocks.push(['IPMA performance', 'ipmap', 'Ringle & Sarstedt (2016)'], ['IPMA importance', 'ipmai', tl('Efek total tak terstandar', 'Unstandardized total effect')]);
  if (R.ext.any || blocks.length > 1) ins('\\sectionframe{03}', chunk(blocks, 4).map((bb, k) => [`\\begin{frame}{${x(tl('Metode analisis lanjutan', 'Advanced analysis methods') + (k ? tl(' (lanjutan)', ' (continued)') : ''))}}`, '\\begin{columns}[T]', ...[0, 1].map(c => `\\begin{column}{0.48\\textwidth}${bb.filter((_, i) => i % 2 === c).map(q => `\\eqblock{${x(q[0])}}{${eqT(q[1])}}{${x(q[2])}}`).join('\\vspace{0.4em}')}\\end{column}`), '\\end{columns}', '\\end{frame}', ''].join('\n')).join('\n'), doc);
  const X = [];
  if (hcI.length) { const a = hocLocTable(R), c = hocMeasTable(R); X.push(tab(tl('Konstruk orde tinggi', 'Higher-order constructs'), tl('Tahap 1: konstruk orde rendah; tahap 2: model pengukuran konstruk orde tinggi', 'Stage 1: lower-order constructs; stage 2: higher-order construct measurement'), 'llrrrr', [x(tl('Orde rendah', 'Lower-order')), x(tl('Orde tinggi', 'Higher-order')), 'rho\\_C', 'AVE', tl('Loading/weight', 'Loading/weight'), 'VIF'], a.rows.map((r, i) => { const m = c.rows[i]; return [cv(r[0]), cv(r[1]), cv(r[5]), cv(r[6]), m ? cv(m[2]) + ' / ' + cv(m[3]) : '--', m ? cv(m[4]) : '--']; }))); }
  mdI.forEach(d => { const sig = !!(d.s && d.s.P < al); X.push([`\\begin{frame}{${x(tl(`Moderasi: ${d.M} × ${d.X} → ${d.Y}`, `Moderation: ${d.M} × ${d.X} → ${d.Y}`))}}`, '\\begin{columns}[c]', `\\begin{column}{0.58\\textwidth}\\centering\\includegraphics[width=\\linewidth,height=0.74\\textheight,keepaspectratio]{slope-${d.k}.png}\\end{column}`, `\\begin{column}{0.38\\textwidth}\\begin{block}{${x(tl('Efek interaksi', 'Interaction effect'))}}{\\Large\\bfseries ${sig ? '\\color{accent}' : ''}$\\beta$ = ${x(fmt(d.b3))}\\par}\\vspace{0.3em}${d.s ? x(`t = ${fmt(d.s.T)}; ${fmtPtxt(d.s.P)}`) : x(tl('belum diuji', 'not tested'))}\\par ${x(`f² = ${fmt(d.f2)} (${f2IntCat(d.f2)})`)}\\par ${R.boot ? `\\textbf{${x(`${d.h.h}: ${decideTxt(sig)}`)}}` : ''}\\end{block}\\vspace{0.4em}\\begin{block}{Simple slope}${x(`−1 SD: ${fmt(d.slopes[0])}; ${tl('rata-rata', 'mean')}: ${fmt(d.slopes[1])}; +1 SD: ${fmt(d.slopes[2])}`)}\\end{block}\\end{column}`, '\\end{columns}', '\\end{frame}', ''].join('\n')); });
  if (G) {
    X.push(tab(tl('MGA: invariansi pengukuran (MICOM)', 'MGA: measurement invariance (MICOM)'), `${G.column}: ${G.a} (n = ${G.nA}) vs ${G.b} (n = ${G.nB}); ${fmtInt(G.P)} ${tl('permutasi', 'permutations')}`, 'lrrlll', [x(tl('Konstruk', 'Construct')), 'c', x(tl('Kuantil 5%', '5% quantile')), x(tl('Langkah 2', 'Step 2')), x(tl('Rata-rata', 'Mean')), x(tl('Varians', 'Variance'))], G.micom.map(m => [x(R.lv[m.j]), x(fmt(m.c)), m.single ? '--' : x(fmt(m.q05)), x(m.step2 ? tl('ya', 'yes') : tl('tidak', 'no')), x(m.step3a ? tl('setara', 'equal') : tl('berbeda', 'different')), x(m.step3b ? tl('setara', 'equal') : tl('berbeda', 'different'))])));
    const pr = R.hyp.filter(h => !h.mod).map(h => ({ h, q: G.paths.find(z => z.i === h.i && z.j === h.j) })).filter(o => o.q);
    chunk(pr, 10).forEach((rr, k) => X.push(tab(tl(`MGA: koefisien jalur ${G.a} vs ${G.b}`, `MGA: path coefficients ${G.a} vs ${G.b}`) + (k ? tl(' (lanjutan)', ' (continued)') : ''), '', 'llrrrrl', [x(tl('Hipotesis', 'Hypothesis')), x(tl('Jalur', 'Path')), x(`β ${G.a}`), x(`β ${G.b}`), '$\\Delta\\beta$', x(tl('p permutasi', 'Permutation p')), x(tl('Berbeda?', 'Different?'))], rr.map(o => [x(o.h.h), x(`${o.h.from} → ${o.h.to}`), x(fmt(o.q.bA)), x(fmt(o.q.bB)), x(fmt(o.q.d)), x(fmtP(o.q.pPerm)), o.q.pPerm < G.alpha ? `\\textbf{\\color{accent}${x(tl('ya', 'yes'))}}` : x(tl('tidak', 'no'))]), tl(`Uji permutasi ${fmtInt(G.P)} kali (Chin dan Dibbern, 2010).`, `Permutation test with ${fmtInt(G.P)} permutations (Chin and Dibbern, 2010).`))));
  }
  if (IP) X.push([`\\begin{frame}{${x(`IPMA: ${IP.targetName}`)}}`, '\\begin{columns}[c]', '\\begin{column}{0.6\\textwidth}\\centering\\includegraphics[width=\\linewidth,height=0.74\\textheight,keepaspectratio]{ipma.png}\\end{column}', `\\begin{column}{0.36\\textwidth}\\centering\\footnotesize\\begin{tabular}{lrr}\\toprule ${x(tl('Konstruk', 'Construct'))} & Imp. & Perf. \\\\\\midrule ${IP.rows.slice().sort((a, c) => c.imp - a.imp).map(r => `${x(r.name)} & ${x(fmt(r.imp))} & ${x(fmt(r.perf, 1))} \\\\`).join(' ')}\\bottomrule\\end{tabular}\\par\\vspace{0.5em}{\\scriptsize\\color{muted}${x(tl('Merah = prioritas perbaikan.', 'Red = priority for improvement.'))}\\par}\\end{column}`, '\\end{columns}', '\\end{frame}', ''].join('\n'));
  if (X.length) ins(`\\begin{frame}{${x(tl('Temuan utama', 'Key findings'))}}`, X.join('\n') + '\n', doc);
  return t;
})(buildBeamerTex);

/* Beamer: frames for the result visualizations */
buildBeamerTex = (f => R => {
  let t = f(R); const x = texEsc, has = k => vizAll(R).some(v => v.key === k), imgF = (title, file, note) => [`\\begin{frame}{${x(title)}}`, '\\centering', `\\includegraphics[width=\\linewidth,height=0.76\\textheight,keepaspectratio]{${file}}`, note ? `\\par\\vspace{0.3em}{\\scriptsize\\color{muted}${x(note)}\\par}` : '', '\\end{frame}', ''].join('\n');
  const frameAt = title => { const a = t.indexOf(`\\begin{frame}{${x(title)}`); if (a < 0) return null; const e = t.indexOf('\\end{frame}', a); return e < 0 ? null : [a, e + '\\end{frame}'.length]; };
  const after = (title, text) => { const r = frameAt(title); if (!r) return false; t = t.slice(0, r[1]) + '\n' + text + t.slice(r[1]); return true; };
  const replace = (title, text) => { const r = frameAt(title); if (!r) return false; t = t.slice(0, r[0]) + text + t.slice(r[1]); return true; };
  if (has('v-htmt')) replace(tl('Validitas diskriminan (HTMT)', 'Discriminant validity (HTMT)'), imgF(tl('Validitas diskriminan (HTMT)', 'Discriminant validity (HTMT)'), 'v-htmt.png', tl('Hijau < 0,85; kuning 0,85–0,90; merah ≥ 0,90 (Henseler dkk., 2015).', 'Green < 0.85; amber 0.85–0.90; red ≥ 0.90 (Henseler et al., 2015).')));
  if (has('v-f2')) after(tl('Koefisien determinasi (R²)', 'Coefficient of determination (R²)'), imgF(tl('Ukuran efek (f²)', 'Effect size (f²)'), 'v-f2.png', tl('Pita = kecil 0,02, sedang 0,15, besar 0,35.', 'Bands = small 0.02, medium 0.15, large 0.35.')));
  if (has('v-ridge')) after(tl('Koefisien jalur dan interval kepercayaan', 'Path coefficients and confidence intervals'), imgF(tl('Distribusi bootstrap koefisien jalur', 'Bootstrap distributions of the path coefficients'), 'v-ridge.png', tl('Area berwarna = interval kepercayaan; merah = signifikan.', 'Shaded area = confidence interval; red = significant.')));
  if (has('v-effects')) { const ttl = tl('Efek tidak langsung (mediasi)', 'Indirect effects (mediation)'); let last = null, from = 0; while (true) { const a = t.indexOf(`\\begin{frame}{${x(ttl)}`, from); if (a < 0) break; last = a; from = a + 10; } if (last !== null) { const e = t.indexOf('\\end{frame}', last) + '\\end{frame}'.length; t = t.slice(0, e) + '\n' + imgF(tl('Dekomposisi efek langsung dan tidak langsung', 'Direct and indirect effect decomposition'), 'v-effects.png', tl('Gelap = langsung; merah muda = tidak langsung.', 'Dark = direct; pink = indirect.')) + t.slice(e); } }
  if (has('v-rmse')) after(tl('Kekuatan prediksi (PLSpredict)', 'Predictive power (PLSpredict)'), imgF(tl('PLSpredict: RMSE PLS dibanding LM', 'PLSpredict: RMSE of PLS versus LM'), 'v-rmse.png', tl('Titik merah = PLS lebih akurat daripada tolok ukur regresi linear.', 'Red dots = PLS more accurate than the linear regression benchmark.')));
  if (has('v-indcor')) { const a = t.indexOf('\\sectionframe{03}'); if (a >= 0) t = t.slice(0, a) + imgF(tl('Korelasi antarindikator', 'Indicator correlations'), 'v-indcor.png', tl('Kotak = indikator satu konstruk.', 'Boxes = indicators of one construct.')) + '\n' + t.slice(a); }
  return t;
})(buildBeamerTex);
