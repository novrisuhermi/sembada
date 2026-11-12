/* ---- path-diagram styles: presets, user customization, scoped CSS, figure notes, fonts for exported SVG/PNG */
const DG_PRESETS = {
  sembada: { preset: 'sembada', shape: 'ellipse', names: 'abbr', namePos: 'auto', r2: 'inside', mv: true, loadings: true, box: true, nsDashed: true, lvFill: '', lvStroke: '', lvText: '', nameColor: '', mvFill: '', mvStroke: '', mvText: '', mvEdge: '', pathColor: '', font: 1, line: 1, curve: 'auto', bend: 0.1, pngScale: 3, pngBg: 'white' },
  smartpls: { preset: 'smartpls', shape: 'circle', names: 'full', namePos: 'auto', r2: 'value', mv: true, loadings: true, box: false, nsDashed: false, lvFill: '#2196f3', lvStroke: '#2196f3', lvText: '#ffffff', nameColor: '#1d1d1f', mvFill: '#fff200', mvStroke: '#fff200', mvText: '#000000', mvEdge: '#1d1d1f', pathColor: '#1d1d1f', font: 1, line: 1, curve: 'straight', bend: 0.1 },
  mono: { preset: 'mono', shape: 'ellipse', names: 'abbr', namePos: 'auto', r2: 'inside', mv: true, loadings: true, box: false, nsDashed: true, lvFill: '#ffffff', lvStroke: '#000000', lvText: '#000000', nameColor: '#000000', mvFill: '#ffffff', mvStroke: '#000000', mvText: '#000000', mvEdge: '#000000', pathColor: '#000000', font: 1, line: 1, curve: 'auto', bend: 0.1 },
  minimal: { preset: 'minimal', shape: 'ellipse', names: 'abbr', namePos: 'auto', r2: 'inside', mv: false, loadings: false, box: false, nsDashed: true, lvFill: '#eef1f6', lvStroke: '#8a93a3', lvText: '', nameColor: '', mvFill: '', mvStroke: '', mvText: '', mvEdge: '', pathColor: '', font: 1, line: 1, curve: 'auto', bend: 0.1 }
};
const DG_SHOW = { sembada: 'coefp', smartpls: 'coef', mono: 'coefs', minimal: 'coefs' };
const DG_THEME_DEF = { lvFill: '#ffffff', lvStroke: '#262a33', lvText: '#262a33', nameColor: '#262a33', mvFill: '#fdf0f3', mvStroke: '#d2405f', mvText: '#262a33', mvEdge: '#9a9eaa', pathColor: '#262a33' };
const dgStyle = () => Object.assign({}, DG_PRESETS.sembada, (state.view && state.view.dg) || {});
const dgMainShow = R => R.boot ? (['coef', 'coefp', 'coefs'].includes(state.view.diagram) ? state.view.diagram : 'coefp') : 'coef';
const pStars = p => p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : '';
function wrapWords(t, max) {
  const out = []; let cur = '';
  String(t).split(/\s+/).filter(Boolean).forEach(x => { if (cur && (cur + ' ' + x).length > max) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; });
  if (cur) out.push(cur); return out.length ? out : [''];
}
/* CSS scoped to one diagram (#<idp>root), so several diagrams on one page keep their own look */
function dgStyleCSS(st, root) {
  const r = '#' + root, f = +st.font || 1, lw = +st.line || 1, a = [];
  const c = (sel, decl) => a.push(sel.split(',').map(x => r + ' ' + x.trim()).join(',') + '{' + decl + '}');
  if (st.lvFill) c('.lv ellipse', 'fill:' + st.lvFill);
  if (st.lvStroke) c('.lv ellipse, .hoc-in', 'stroke:' + st.lvStroke);
  if (st.lvText) c('.lv text', 'fill:' + st.lvText);
  if (st.nameColor) c('.lv-full', 'fill:' + st.nameColor);
  if (st.mvFill) c('.mv rect', 'fill:' + st.mvFill);
  if (st.mvStroke) c('.mv rect', 'stroke:' + st.mvStroke);
  if (st.mvText) c('.mv text', 'fill:' + st.mvText);
  if (st.mvEdge) { c('.mv-edge', 'stroke:' + st.mvEdge); c('.ah-mv', 'fill:' + st.mvEdge); c('.lab.mvl text', 'fill:' + st.mvEdge); }
  if (st.pathColor) { c('.sm-edge, .sm-edge.ns, .hoc-edge', 'stroke:' + st.pathColor); c('.ah', 'fill:' + st.pathColor); c('.lab.sm text', 'fill:' + st.pathColor); }
  if (f !== 1) { c('.lv-name', `font-size:${(14 * f).toFixed(1)}px`); c('.lv-r2', `font-size:${(11 * f).toFixed(1)}px`); c('.lv-r2.val', `font-size:${(13 * f).toFixed(1)}px`); c('.lv-full', `font-size:${(12.5 * f).toFixed(1)}px`); c('.mv text', `font-size:${(11 * f).toFixed(1)}px`); c('.lab text', `font-size:${(11.5 * f).toFixed(1)}px`); c('.lab.mvl text', `font-size:${(10 * f).toFixed(1)}px`); }
  if (lw !== 1) { c('.sm-edge', `stroke-width:${(1.7 * lw).toFixed(2)}px`); c('.mv-edge', `stroke-width:${(1.1 * lw).toFixed(2)}px`); c('.lv ellipse', `stroke-width:${(1.6 * lw).toFixed(2)}px`); c('.lv.endo ellipse', `stroke-width:${(2 * lw).toFixed(2)}px`); c('.hoc-edge, .mod-edge', `stroke-width:${(1.6 * lw).toFixed(2)}px`); }
  return a.join('');
}
/* figure note that always matches what the diagram shows */
function dgNote(R, show, short) {
  const st = dgStyle(), b = !!R.boot, shape = st.shape === 'circle' ? tl('lingkaran', 'circles') : tl('elips', 'ellipses');
  const mvlab = R.refl && R.refl.some(x => !x) ? tl('loading (reflektif) atau weight (formatif)', 'loadings (reflective) or weights (formative)') : 'outer loading' + (I18N.lang === 'en' ? 's' : '');
  const P = [show === 't' && b ? tl('angka pada jalur = t statistik', 'path labels show t statistics')
    : show === 'coefp' && b ? tl('angka pada jalur = koefisien jalur (p value)', 'path labels show path coefficients (p values)')
    : show === 'coefs' && b ? tl(`angka pada jalur = koefisien jalur dengan * p < ${k2(0.05)}, ** p < ${k2(0.01)}, *** p < ${fmtP(0.001)}`, `path labels show path coefficients with * p < ${k2(0.05)}, ** p < ${k2(0.01)}, *** p < ${fmtP(0.001)}`)
    : tl('angka pada jalur = koefisien jalur', 'path labels show path coefficients')];
  if (!short && st.r2 !== 'none') P.push(tl(`angka di dalam ${shape} = R²`, `values inside the ${shape} are R²`));
  if (!short && st.mv && st.loadings) P.push(tl(`angka pada panah indikator = ${mvlab}`, `values on the indicator arrows are ${mvlab}`));
  if (b && st.nsDashed) P.push(tl(`garis putus-putus = jalur tidak signifikan pada α = ${k2(R.boot.alpha)}`, `dashed lines denote paths that are not significant at α = ${k2(R.boot.alpha)}`));
  const s = P.join('; '); return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
/* exported SVGs are drawn without the page's fonts; embedding them keeps glyphs such as ² and the typography identical everywhere */
let _dgFaces = null;
function withFonts(svg) {
  if (!svg || svg.indexOf('@font-face') >= 0) return svg;
  if (_dgFaces === null) { const css = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join(''); _dgFaces = (css.match(/@font-face\{font-family:'Plus Jakarta Sans'[^}]*\}/g) || []).join(''); }
  return _dgFaces ? svg.replace(/(<svg\b[^>]*>)/, `$1<style>${_dgFaces}</style>`) : svg;
}
function dgCustomHTML() {
  const st = dgStyle();
  const sel = (k, opts, lab) => `<select data-change="dg-set" data-k="${k}" aria-label="${esc(lab)}">${opts.map(([v, t]) => `<option value="${v}"${String(st[k]) === String(v) ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
  const field = (t, k, opts) => `<label class="dgc-field"><span>${t}</span>${sel(k, opts, t)}</label>`;
  const chk = (k, t, on, dis) => `<label class="dgc-chk"><input type="checkbox" data-change="dg-set" data-k="${k}"${on ? ' checked' : ''}${dis ? ' disabled' : ''}> <span>${t}</span></label>`;
  const col = (k, t) => `<label class="dg-col"><input type="color" data-change="dg-set" data-k="${k}" value="${st[k] || DG_THEME_DEF[k]}"><span>${t}</span></label>`;
  const rng = (k, t, lo, hi, step) => `<label class="dg-rng"><span>${t} <b>${Math.round(st[k] * 100)}%</b></span><input type="range" min="${lo}" max="${hi}" step="${step}" value="${Math.round(st[k] * 100)}" data-change="dg-set" data-k="${k}"></label>`;
  const presets = [['sembada', 'SEMbada'], ['smartpls', tl('Gaya SmartPLS', 'SmartPLS style')], ['mono', tl('Hitam-putih (jurnal)', 'Black and white (journal)')], ['minimal', 'Minimal']];
  return `<div class="dg-cust" id="dg-cust">
<div class="dgc-row"><span class="dgc-lbl">${tl('Gaya', 'Style')}</span><div class="seg" role="group" aria-label="${tl('Gaya diagram', 'Diagram style')}">${presets.map(([v, t]) => `<button data-action="dg-preset" data-v="${v}" aria-pressed="${st.preset === v}">${t}</button>`).join('')}</div>${st.preset === 'custom' ? `<span class="dgc-custom">${tl('Kustom', 'Custom')}</span>` : ''}<button class="btn btn-quiet" data-action="dg-preset" data-v="sembada">${tl('Atur ulang', 'Reset')}</button></div>
<div class="dgc-grid">
<fieldset><legend>${tl('Konstruk', 'Constructs')}</legend>
${field(tl('Bentuk', 'Shape'), 'shape', [['ellipse', tl('Elips', 'Ellipse')], ['circle', tl('Lingkaran', 'Circle')]])}
${field(tl('Nama', 'Name'), 'names', [['abbr', tl('Singkatan di dalam', 'Abbreviation inside')], ['full', tl('Nama lengkap di luar', 'Full name outside')], ['both', tl('Singkatan dan nama lengkap', 'Abbreviation and full name')]])}
${st.names !== 'abbr' ? field(tl('Letak nama', 'Name position'), 'namePos', [['auto', tl('Otomatis', 'Automatic')], ['below', tl('Di bawah', 'Below')], ['above', tl('Di atas', 'Above')]]) : ''}
${field('R²', 'r2', [['inside', tl('“R² 0,73” di dalam', '“R² 0.73” inside')], ['value', tl('Hanya nilai', 'Value only')], ['none', tl('Sembunyikan', 'Hide')]])}
</fieldset>
<fieldset><legend>${tl('Indikator dan jalur', 'Indicators and paths')}</legend>
${chk('mv', tl('Tampilkan indikator', 'Show indicators'), st.mv)}
${chk('loadings', tl('Tampilkan angka loading', 'Show loading values'), st.loadings && st.mv, !st.mv)}
${chk('box', tl('Bingkai pada label angka', 'Frames around number labels'), st.box)}
${chk('nsDashed', tl('Jalur tidak signifikan putus-putus', 'Dashed non-significant paths'), st.nsDashed)}
${field(tl('Garis jalur', 'Path lines'), 'curve', [['auto', tl('Otomatis (melengkung bila melewati konstruk)', 'Automatic (curved only around constructs)')], ['straight', tl('Lurus semua', 'All straight')], ['curved', tl('Melengkung semua', 'All curved')]])}
${st.curve !== 'straight' ? rng('bend', tl('Kelengkungan', 'Curvature'), 5, 40, 1) : ''}
<p class="small muted dgc-tip">${tl('Klik sebuah garis jalur di diagram untuk mengatur garis itu sendiri: lurus, lengkung ke kiri, atau lengkung ke kanan.', 'Click a path line in the diagram to set that line on its own: straight, curved left, or curved right.')}</p>
</fieldset>
<fieldset><legend>${tl('Warna', 'Colors')}</legend><div class="dgc-colors">
${col('lvFill', tl('Isi konstruk', 'Construct fill'))}${col('lvStroke', tl('Garis konstruk', 'Construct outline'))}${col('lvText', tl('Teks di konstruk', 'Construct text'))}${col('nameColor', tl('Nama lengkap', 'Full name'))}${col('mvFill', tl('Isi indikator', 'Indicator fill'))}${col('mvStroke', tl('Garis indikator', 'Indicator outline'))}${col('mvText', tl('Teks indikator', 'Indicator text'))}${col('mvEdge', tl('Panah indikator', 'Indicator arrows'))}${col('pathColor', tl('Jalur dan angka', 'Paths and labels'))}
</div></fieldset>
<fieldset><legend>${tl('Ukuran dan ekspor', 'Size and export')}</legend>
${rng('font', tl('Ukuran huruf', 'Text size'), 70, 150, 5)}
${rng('line', tl('Tebal garis', 'Line width'), 50, 250, 10)}
${field(tl('Resolusi PNG', 'PNG resolution'), 'pngScale', [[2, '2×'], [3, '3×'], [4, '4×'], [6, '6×']])}
${chk('pngBg', tl('Latar PNG transparan', 'Transparent PNG background'), st.pngBg === 'transparent')}
</fieldset>
</div>
<p class="tbl-note">${tl('Gaya ini juga dipakai untuk gambar di makalah, Word, PowerPoint, Beamer, dan ZIP gambar, serta disimpan bersama proyek.', 'This style is also used for the figures in the paper, Word, PowerPoint, Beamer, and the figure ZIP, and it is saved with the project.')}</p>
</div>`;
}
function dgSetKey(k, v) {
  const st = dgStyle();
  if (k === 'font' || k === 'line' || k === 'bend') v = Math.round(+v) / 100; else if (k === 'pngScale') v = +v;
  st[k] = v; if (k !== 'pngScale' && k !== 'pngBg') st.preset = 'custom';
  state.view.dg = st; renderMain();
}
const DG_ACTIONS = {
  'dg-cust': () => { state.ui.dgCust = !state.ui.dgCust; renderMain(); },
  'dg-preset': el => {
    const p = el.dataset.v, cur = dgStyle();
    state.view.dg = Object.assign({}, DG_PRESETS.sembada, DG_PRESETS[p] || {}, { preset: p, pngScale: cur.pngScale, pngBg: cur.pngBg });
    if (DG_SHOW[p] && state.results && state.results.boot) state.view.diagram = DG_SHOW[p];
    renderMain();
  }
};
function dgPathPop(pid, e) {
  const pop = $('#dg-pop'); if (!pop) return; const R = state.results, p = R && R.model.paths.find(x => x.id === pid); if (!p) { pop.hidden = true; return; }
  const h = (R.hyp || []).find(x => x.pid === pid), nm = id => ((R.model.constructs.find(c => c.id === id) || {}).name || '');
  const opts = [['', tl('Ikuti gaya umum', 'Follow the style')], ['straight', tl('Lurus', 'Straight')], ['left', tl('Lengkung kiri', 'Curve left')], ['right', tl('Lengkung kanan', 'Curve right')]];
  pop.innerHTML = `<b>${tl('Garis', 'Line')} ${h && h.h ? esc(h.h) + ': ' : ''}${esc(nm(p.from))} → ${esc(nm(p.to))}</b><div class="seg">${opts.map(([v, l]) => `<button data-action="dg-curve" data-pid="${pid}" data-v="${v}" aria-pressed="${(p.curve || '') === v}">${l}</button>`).join('')}</div>`;
  const st = pop.parentElement.getBoundingClientRect(); pop.hidden = false; const w = pop.offsetWidth || 320;
  pop.style.left = Math.max(8, Math.min(st.width - w - 8, e.clientX - st.left + 12)) + 'px'; pop.style.top = (e.clientY - st.top + 12) + 'px';
}
DG_ACTIONS['dg-curve'] = el => { const pid = el.dataset.pid, v = el.dataset.v; dgSet(m => { const p = m.paths.find(x => x.id === pid); if (p) { if (v) p.curve = v; else delete p.curve; } }); dgPop(null); dgRedraw(null); };
const DG_CHANGES = { 'dg-set': el => dgSetKey(el.dataset.k, el.type === 'checkbox' ? (el.dataset.k === 'pngBg' ? (el.checked ? 'transparent' : 'white') : el.checked) : el.value) };
