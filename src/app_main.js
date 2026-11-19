/* ================================================================ shell */
const NL_LICENSE = __NL_LICENSE__;
const LIB_LICENSES = __LIB_LICENSES__;
const STEPS = () => [['home', tl('Beranda', 'Home')], ['data', 'Data'], ['model', 'Model'], ['info', tl('Info penelitian', 'Research info')], ['run', tl('Hitung', 'Calculate')], ['results', tl('Hasil', 'Results')]];
function render() { renderTop(); renderRail(); $('#main').innerHTML = mainHTML(); afterRender(); }
function renderMain() { $('#main').innerHTML = mainHTML(); afterRender(); renderRail(); }
function renderTop() {
  I18N.lang = state.view.lang; document.documentElement.lang = state.view.lang;
  const pn = $('#project-name'); if (pn) { if (document.activeElement !== pn) pn.value = state.name; pn.setAttribute('aria-label', tl('Nama proyek', 'Project name')); }
  const sub = $('.brand-sub'); if (sub) sub.textContent = tl('PLS-SEM portabel', 'portable PLS-SEM');
  const rail = $('#rail'); if (rail) rail.setAttribute('aria-label', tl('Langkah analisis', 'Analysis steps'));
  const ta = $('.top-actions');
  if (ta && ta.dataset.lang !== state.view.lang) {
    ta.dataset.lang = state.view.lang;
    ta.innerHTML = `<button class="btn btn-quiet" data-action="open-project">${tl('Buka', 'Open')}<span class="long">${tl(' proyek', ' project')}</span></button><button class="btn btn-quiet" data-action="save-project">${tl('Simpan', 'Save')}<span class="long">${tl(' proyek', ' project')}</span></button><button class="btn btn-quiet" data-action="help">${tl('Panduan', 'Guide')}</button><button class="btn btn-quiet" data-action="settings">${tl('Pengaturan', 'Settings')}</button>${themeSegHTML()}<div class="seg lang-seg" role="group" aria-label="${tl('Bahasa aplikasi', 'App language')}"><button data-action="lang" data-v="id" aria-pressed="${state.view.lang === 'id'}" title="Bahasa Indonesia">ID</button><button data-action="lang" data-v="en" aria-pressed="${state.view.lang === 'en'}" title="English">EN</button></div>`;
  }
  document.title = !isUntitled(state.name) ? `${state.name}: SEMbada` : tl('SEMbada: PLS-SEM portabel', 'SEMbada: portable PLS-SEM');
  if (NATIVE) Neutralino.window.setTitle(document.title).catch(() => {});
}
function mainHTML() { switch (state.ui.step) { case 'home': return viewHome(); case 'info': return viewInfo(); case 'model': return viewModel(); case 'run': return viewRun(); case 'results': return viewResults(); default: return viewData(); } }
function afterRender() { document.body.dataset.step = state.ui.step; syncBound(); if (state.ui.step === 'home') fillRecent(); if (state.ui.step === 'results') bindResultDiagram(); if (state.ui.step === 'model' && state.data) { renderItems(); bindCanvas(); drawCanvas(); renderProps(); } }
function renderRail() {
  const v = state.data ? validateModel() : null;
  const sub = {
    home: tl('Mulai di sini', 'Start here'),
    info: infoFilled() ? tl('Judul dan penulis terisi', 'Title and authors filled in') : tl('Opsional', 'Optional'),
    data: state.data ? tl(`${fmtInt(state.data.nRows)} responden, ${numericNames().length} kolom angka`, `${fmtInt(state.data.nRows)} respondents, ${numericNames().length} numeric columns`) : tl('Belum ada data', 'No data yet'),
    model: M().constructs.length ? tl(`${M().constructs.length} konstruk, ${M().paths.length} jalur`, `${M().constructs.length} constructs, ${M().paths.length} paths`) : tl('Belum ada konstruk', 'No constructs yet'),
    run: state.run && state.run.running ? tl('Sedang menghitung…', 'Calculating…') : !state.data ? tl('Menunggu data', 'Waiting for data') : v.errors.length ? tl(`${v.errors.length} hal perlu diperbaiki`, `${v.errors.length} issue(s) to fix`) : tl('Siap dihitung', 'Ready to calculate'),
    results: state.results ? (isStale() ? tl('Perlu dihitung ulang', 'Needs recalculation') : tl('Hasil tersedia', 'Results available')) : tl('Belum ada hasil', 'No results yet')
  };
  const done = { home: false, info: infoFilled(), data: !!state.data, model: !!(v && !v.errors.length), run: !!state.results, results: false };
  const dis = { home: false, info: false, data: false, model: !state.data, run: !state.data, results: !state.results };
  $('#rail').innerHTML = STEPS().map(([id, label]) => `<button class="step${state.ui.step === id ? ' active' : ''}${done[id] ? ' done' : ''}" data-action="step" data-step="${id}"${dis[id] ? ' disabled' : ''}${state.ui.step === id ? ' aria-current="step"' : ''}><span class="mark" aria-hidden="true"></span><span class="lbl">${label}</span><span class="sub">${esc(sub[id])}</span></button>`).join('') +
    `<div class="rail-foot"><div class="privacy"><i class="bub pass" style="margin-top:3px"></i><span>${tl('Semua perhitungan berjalan di komputer ini. Data tidak dikirim ke mana pun.', 'All calculations run on this computer. Your data is not sent anywhere.')}</span></div></div>`;
}
function goStep(s) {
  if ((s === 'model' || s === 'run') && !state.data) { toast(tl('Muat data terlebih dahulu.', 'Load data first.')); return; }
  if (s === 'results' && !state.results) { toast(tl('Belum ada hasil. Jalankan perhitungan di langkah Hitung.', 'No results yet. Run the calculation in the Calculate step.')); return; }
  state.ui.step = s; if (s !== 'model') { state.ui.connect = false; state.ui.connectFrom = null; }
  render(); const m = $('#main'); if (m) m.scrollTop = 0;
}
const getPath = (o, p) => p.split('.').reduce((a, k) => (a === null || a === undefined ? a : a[k]), o);
function setPath(o, p, v) { const ks = p.split('.'); let x = o; for (let i = 0; i < ks.length - 1; i++) x = x[ks[i]]; x[ks[ks.length - 1]] = v; }
function syncBound() {
  $$('[data-bind]').forEach(el => { const v = getPath(state, el.dataset.bind); if (el.type === 'checkbox') el.checked = !!v; else if (el.type === 'radio') el.checked = String(v) === el.value; else if (v !== undefined && v !== null) el.value = String(v); });
}
function onBound(el) {
  const path = el.dataset.bind; let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (el.type === 'radio') { if (!el.checked) return; v = el.value; }
  else if (el.type === 'number' || el.dataset.type === 'num') {
    v = parseFloat(String(el.value).replace(',', '.'));
    if (!Number.isFinite(v)) { syncBound(); return; }
    if (el.min !== '' && el.min !== undefined && v < +el.min) v = +el.min;
    if (el.max !== '' && el.max !== undefined && v > +el.max) v = +el.max;
    if (el.type === 'number') { v = Math.round(v); el.value = v; }
  } else v = el.value;
  setPath(state, path, v); dirty = true;
  if (path === 'settings.boot.run') { const f = $('#boot-fs'); if (f) f.disabled = !v; }
  if (path === 'settings.predict.run') { const f = $('#pred-fs'); if (f) f.disabled = !v; }
  if (path === 'settings.algorithm' && state.ui.step === 'run') renderMain(); else renderRail();
}

/* ================================================================ data view */
function previewTable(d, max) {
  const n = Math.min(d.nRows, max);
  let h = '<div class="tbl-wrap tall"><table class="tbl"><thead><tr><th scope="col">#</th>' + d.columns.map(c => `<th scope="col">${esc(c.name)}</th>`).join('') + '</tr></thead><tbody>';
  for (let i = 0; i < n; i++) {
    h += `<tr><th scope="row">${i + 1}</th>` + d.columns.map(c => {
      if (!c.numeric) return `<td class="t mute">${esc(c.raw ? c.raw[i] : '')}</td>`;
      const v = c.values[i]; return Number.isNaN(v) ? '<td class="mute">–</td>' : `<td>${esc(dec(v))}</td>`;
    }).join('') + '</tr>';
  }
  return h + '</tbody></table></div>';
}
function viewData() {
  if (!state.data) {
    return `<div class="view"><div class="view-head"><div><h1>${tl('Mulai dari data kuesioner', 'Start with your questionnaire data')}</h1><p>${tl('Satu baris untuk satu responden, satu kolom untuk satu item. Baris pertama berisi nama kolom.', 'One row per respondent, one column per item. The first row holds the column names.')}</p></div></div>
    <div class="empty-grid">
      <div class="drop" id="drop" data-action="pick-file" role="button" tabindex="0" aria-label="${tl('Pilih file data', 'Choose a data file')}">
        <h2>${tl('Seret file ke sini', 'Drag a file here')}</h2>
        <p>${tl('Excel (.xlsx) atau CSV. File dibaca langsung di komputer ini dan tidak diunggah ke mana pun.', 'Excel (.xlsx) or CSV. The file is read on this computer and is not uploaded anywhere.')}</p>
        <div class="row"><button class="btn btn-primary btn-big" data-action="pick-file">${tl('Pilih file', 'Choose file')}</button><button class="btn btn-big" data-action="load-sample">${tl('Coba data contoh', 'Try sample data')}</button><button class="btn btn-quiet" data-action="step" data-step="home">${tl('Lihat 12 contoh model lain', 'See 12 more example models')}</button></div>
      </div>
      <aside class="panel"><div class="panel-h"><h3>${tl('Alur kerja', 'Workflow')}</h3></div><div class="panel-b"><ol class="steps-list">
        <li><span>${tl('Masukkan data kuesioner (Excel atau CSV).', 'Load questionnaire data (Excel or CSV).')}</span></li>
        <li><span>${tl('Susun model: kelompokkan indikator menjadi konstruk, lalu tarik jalur antar konstruk.', 'Build the model: group indicators into constructs, then draw paths between constructs.')}</span></li>
        <li><span>${tl('Klik Hitung untuk PLS-SEM, bootstrapping, dan PLSpredict.', 'Click Calculate for PLS-SEM, bootstrapping, and PLSpredict.')}</span></li>
        <li><span>${tl('Baca hasil beserta tanda lolos atau tidaknya, lalu unduh laporan Word, presentasi, atau narasi paper.', 'Read the results with their pass/fail marks, then download a Word report, a presentation, or a paper narrative.')}</span></li>
      </ol><p class="small muted" style="margin:12px 0 0">${tl('Sudah punya proyek tersimpan?', 'Have a saved project?')} <button class="btn-link" data-action="open-project">${tl('Buka file proyek', 'Open project file')}</button></p></div></aside>
    </div></div>`;
  }
  const d = state.data, src = state.source || {}, num = d.columns.filter(c => c.numeric), txt = d.columns.filter(c => !c.numeric), codes = missingCodes();
  const missCount = num.reduce((s, c) => s + c.values.filter(v => Number.isNaN(v) || codes.includes(v)).length, 0);
  const sheetSel = src.sheetNames && src.sheetNames.length > 1 ? `<div class="field"><label for="sheet">Sheet</label><select id="sheet" data-change="sheet">${src.sheetNames.map((s, i) => `<option value="${i}"${i === src.sheetIndex ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>` : '';
  const textNote = txt.length ? `<p class="small muted" style="margin:12px 0 0">${tl('Kolom teks tidak dapat dipakai sebagai indikator: ', 'Text columns cannot be used as indicators: ')}${txt.map(c => esc(c.name) + (c.firstText && c.nText < d.nRows ? tl(` (baris ${c.firstText.row} berisi "${esc(String(c.firstText.value).slice(0, 24))}")`, ` (row ${c.firstText.row} contains "${esc(String(c.firstText.value).slice(0, 24))}")`) : '')).join(', ')}.</p>` : '';
  return `<div class="view">
    <div class="view-head"><div><h1>Data</h1><p>${esc(src.fileName || 'Data')}${src.kind === 'sample' ? tl(' (data simulasi, bukan data riil)', ' (simulated data, not real data)') : ''}: ${tl(`${fmtInt(d.nRows)} responden dan ${d.columns.length} kolom.`, `${fmtInt(d.nRows)} respondents and ${d.columns.length} columns.`)}</p></div>
      <div class="row"><button class="btn" data-action="pick-file">${tl('Ganti file', 'Change file')}</button><button class="btn btn-primary" data-action="goto" data-step="model">${tl('Lanjut ke Model', 'Continue to Model')}</button></div></div>
    <div class="grid2">
      <section class="panel"><div class="panel-h"><h3>${tl('Isi data', 'Data contents')}</h3></div><div class="panel-b">${sheetSel}
        <dl class="kv"><dt>${tl('Responden (baris)', 'Respondents (rows)')}</dt><dd>${fmtInt(d.nRows)}</dd><dt>${tl('Kolom angka', 'Numeric columns')}</dt><dd>${num.length}</dd><dt>${tl('Kolom teks', 'Text columns')}</dt><dd>${txt.length}</dd><dt>${tl('Sel kosong di kolom angka', 'Empty cells in numeric columns')}</dt><dd>${fmtInt(missCount)}</dd></dl>
        ${textNote}
        <div class="colgrid" style="margin-top:14px">${d.columns.map(c => `<span class="colpill${c.numeric ? '' : ' text'}${c.numeric && c.nMissing ? ' miss' : ''}" title="${esc(c.name)}: ${c.numeric ? tl(`angka, ${c.nMissing} kosong`, `numeric, ${c.nMissing} empty`) : tl('teks', 'text')}">${esc(c.name)}</span>`).join('')}</div>
      </div></section>
      <section class="panel"><div class="panel-h"><h3>${tl('Data hilang', 'Missing data')}</h3></div><div class="panel-b">
        <div class="field"><label for="miss-code">${tl('Kode data hilang (opsional)', 'Missing-value code (optional)')}</label><input type="text" id="miss-code" data-bind="settings.missingCode" placeholder="${tl('contoh: -99', 'e.g. -99')}"><span class="hint">${tl('Sel kosong, NA, dan tanda "-" otomatis dianggap hilang. Pisahkan beberapa kode dengan koma.', 'Empty cells, NA, and "-" are treated as missing automatically. Separate several codes with commas.')}</span></div>
        <div class="field"><label for="miss-mode">${tl('Penanganan', 'Treatment')}</label><select id="miss-mode" data-bind="settings.missing"><option value="mean">${tl('Ganti dengan rata-rata kolom (mean replacement)', 'Replace with the column mean (mean replacement)')}</option><option value="listwise">${tl('Hapus responden yang tidak lengkap (casewise deletion)', 'Remove incomplete respondents (casewise deletion)')}</option></select><span class="hint">${tl('Bawaan seminr dan SmartPLS adalah mean replacement.', 'The seminr and SmartPLS default is mean replacement.')}</span></div>
      </div></section>
    </div>
    <div class="tbl-head" style="margin-top:24px"><h3>${tl('Pratinjau', 'Preview')}</h3><span class="small muted">${d.nRows > 100 ? tl('100 baris pertama', 'First 100 rows') : tl('Semua baris', 'All rows')}</span></div>
    ${previewTable(d, 100)}
  </div>`;
}

/* ================================================================ model view */
function viewModel() {
  if (!state.data) return `<div class="view"><div class="view-head"><div><h1>Model</h1><p>${tl('Muat data terlebih dahulu.', 'Load data first.')}</p></div></div><button class="btn btn-primary" data-action="goto" data-step="data">${tl('Ke halaman Data', 'Go to Data')}</button></div>`;
  const isSample = state.source && state.source.kind === 'sample';
  return `<div class="view" style="max-width:none">
  <div class="view-head"><div><h1>Model</h1><p>${tl('Seret indikator ke kanvas untuk membuat konstruk, lalu gambar jalur antar konstruk. Setiap jalur menjadi satu hipotesis.', 'Drag indicators onto the canvas to create constructs, then draw paths between constructs. Each path becomes one hypothesis.')}</p></div>
    <div class="row"><button class="btn btn-primary" data-action="goto" data-step="run">${tl('Lanjut ke Hitung', 'Continue to Calculate')}</button></div></div>
  <div class="model-grid">
    <section class="panel items-panel" aria-label="${tl('Daftar indikator', 'Indicator list')}">
      <div class="panel-h"><h3>${tl('Indikator', 'Indicators')}</h3><span class="tag" id="items-count"></span></div>
      <div class="panel-b">
        <input type="text" id="item-filter" placeholder="${tl('Cari kolom', 'Search columns')}" aria-label="${tl('Cari kolom', 'Search columns')}" data-input="item-filter" value="${esc(state.ui.itemFilter)}" style="width:100%">
        <div class="row" style="margin:9px 0 10px;gap:6px"><button class="btn" data-action="auto-group">${tl('Kelompokkan otomatis', 'Auto-group')}</button><button class="btn" data-action="group-checked" disabled>${tl('Jadikan konstruk', 'Make construct')}</button></div>
        <ul class="items-list" id="items-body"></ul>
        <p class="xs muted" style="margin:10px 0 0">${tl('Seret ke ruang kosong untuk membuat konstruk baru, atau ke atas konstruk untuk menambahkan. Centang beberapa untuk diseret sekaligus.', 'Drag to empty space to create a new construct, or onto a construct to add to it. Tick several to drag them together.')}</p>
      </div>
    </section>
    <section class="canvas-wrap" aria-label="${tl('Kanvas model', 'Model canvas')}">
      <div class="canvas-tools">
        <button class="btn" data-action="add-construct">${tl('Tambah konstruk', 'Add construct')}</button>
        <button class="btn" data-action="add-hoc" title="${tl('Konstruk yang dibentuk dari beberapa konstruk lain', 'A construct built from several other constructs')}">${tl('Konstruk orde tinggi', 'Higher-order construct')}</button>
        <button class="btn" data-action="toggle-connect" id="connect-btn" aria-pressed="${state.ui.connect}">${tl('Gambar jalur', 'Draw paths')}</button>
        <span class="sep" aria-hidden="true"></span>
        <button class="btn btn-quiet" data-action="auto-layout">${tl('Rapikan', 'Tidy up')}</button>
        ${isSample ? `<button class="btn btn-quiet" data-action="example-model">${tl('Model contoh', 'Example model')}</button>` : ''}
        <button class="btn btn-quiet btn-danger" data-action="clear-model">${tl('Kosongkan', 'Clear')}</button>
        <span class="zoom" role="group" aria-label="${tl('Zoom kanvas', 'Canvas zoom')}"><button class="btn btn-quiet" data-action="zoom" data-f="0.8" aria-label="${tl('Perbesar', 'Zoom in')}" title="${tl('Perbesar', 'Zoom in')}">+</button><button class="btn btn-quiet" data-action="zoom" data-f="1.25" aria-label="${tl('Perkecil', 'Zoom out')}" title="${tl('Perkecil', 'Zoom out')}">−</button><button class="btn btn-quiet" data-action="zoom-fit" title="${tl('Paskan seluruh model', 'Fit the whole model')}">${tl('Paskan', 'Fit')}</button></span>
      </div>
      <div class="canvas-area" id="canvas-area">
        <svg id="canvas" class="dg" xmlns="http://www.w3.org/2000/svg" role="application" aria-label="${tl('Kanvas diagram model', 'Model diagram canvas')}"></svg>
        <div class="canvas-empty hidden" id="canvas-empty"><div><h3>${tl('Kanvas masih kosong', 'The canvas is empty')}</h3><p class="small">${tl('Klik <b>Kelompokkan otomatis</b> untuk membentuk konstruk dari nama kolom (IQ1, IQ2, …), atau seret indikator dari daftar kiri ke sini.', 'Click <b>Auto-group</b> to form constructs from the column names (IQ1, IQ2, …), or drag indicators here from the list on the left.')}</p></div></div>
        <div class="canvas-hint" id="canvas-hint" aria-live="polite"></div>
      </div>
    </section>
    <section class="panel props-panel" id="props" aria-label="${tl('Properti', 'Properties')}"></section>
  </div></div>`;
}
function renderItems() {
  const el = $('#items-body'); if (!el || !state.data) return;
  const f = state.ui.itemFilter.trim().toLowerCase();
  const cols = state.data.columns.filter(c => !f || c.name.toLowerCase().includes(f));
  const cnt = $('#items-count'); if (cnt) cnt.textContent = tl(`${numericNames().filter(n => !ownerOf(n)).length} belum dipakai`, `${numericNames().filter(n => !ownerOf(n)).length} unused`);
  el.innerHTML = cols.length ? cols.map(c => {
    if (!c.numeric) return `<li class="text" title="${tl('Kolom teks tidak dapat dipakai', 'Text columns cannot be used')}"><span></span><span class="nm">${esc(c.name)}</span><span class="tag">${tl('teks', 'text')}</span></li>`;
    const o = ownerOf(c.name);
    return `<li draggable="true" data-item="${esc(c.name)}"><input type="checkbox" aria-label="${tl('Pilih ', 'Select ')}${esc(c.name)}" data-change="check-item" data-item="${esc(c.name)}"${state.ui.checked.has(c.name) ? ' checked' : ''}><span class="nm" title="${esc(c.name)}">${esc(c.name)}</span>${o ? `<span class="tag lv">${esc(o.name)}</span>` : '<span class="tag">–</span>'}</li>`;
  }).join('') : `<li class="text"><span></span><span class="nm">${tl('Tidak ada kolom yang cocok', 'No matching columns')}</span><span></span></li>`;
  const gb = $('[data-action="group-checked"]'); if (gb) gb.disabled = !state.ui.checked.size;
}
let canvasVB = null, drag = null;
function drawCanvas(keepVB) {
  const svg = $('#canvas'); if (!svg) return;
  const G = geometry(M());
  if (!keepVB || !canvasVB) {
    const b = G.bounds, pad = 30, w = Math.max(b.x2 - b.x1 + 2 * pad, 720), h = Math.max(b.y2 - b.y1 + 2 * pad, 440);
    canvasVB = [(b.x1 + b.x2) / 2 - w / 2, (b.y1 + b.y2) / 2 - h / 2, w, h];
  }
  svg.setAttribute('viewBox', canvasVB.map(v => v.toFixed(1)).join(' '));
  svg.innerHTML = diagramInner(M(), G, { idp: 'cv', interactive: true, selected: state.ui.selected, src: state.ui.connectFrom });
  svg.classList.toggle('connect', state.ui.connect);
  const empty = $('#canvas-empty'); if (empty) empty.classList.toggle('hidden', M().constructs.length > 0);
  const hint = $('#canvas-hint');
  if (hint) { const src = state.ui.connectFrom && conById(state.ui.connectFrom); hint.textContent = state.ui.connect ? (src ? tl(`Klik konstruk tujuan untuk jalur dari ${src.name}. Esc untuk selesai.`, `Click the target construct for a path from ${src.name}. Press Esc to finish.`) : tl('Mode jalur: klik konstruk asal, lalu konstruk tujuan. Esc untuk selesai.', 'Path mode: click the source construct, then the target construct. Press Esc to finish.')) : tl('Seret konstruk untuk memindahkan, klik untuk mengedit. Seret latar untuk menggeser tampilan.', 'Drag a construct to move it, click to edit it. Drag the background to pan.'); }
}
function refreshModel(keepVB) {
  renderItems(); drawCanvas(keepVB); renderProps(); renderRail();
  const cb = $('#connect-btn'); if (cb) cb.setAttribute('aria-pressed', String(state.ui.connect));
}
function svgPoint(svg, e) { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
function bindCanvas() {
  const svg = $('#canvas'); if (!svg) return;
  svg.addEventListener('pointerdown', onCanvasDown);
  svg.addEventListener('pointermove', onCanvasMove);
  svg.addEventListener('pointerup', onCanvasUp);
  svg.addEventListener('pointercancel', onCanvasUp);
  svg.addEventListener('dblclick', e => { const lv = e.target.closest('[data-cid]'); if (!lv || state.ui.connect) return; state.ui.selected = { type: 'c', id: lv.dataset.cid }; renderProps(); const inp = $('#cname'); if (inp) { inp.focus(); inp.select(); } });
  svg.addEventListener('dragover', e => { const t = Array.from(e.dataTransfer.types || []); if (t.includes('application/x-sembada-items')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
  svg.addEventListener('drop', onCanvasDrop);
}
function onCanvasDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  const svg = e.currentTarget, lv = e.target.closest('[data-cid]'), ed = e.target.closest('[data-pid]');
  if (lv) {
    const id = lv.dataset.cid;
    if (state.ui.connect) {
      e.preventDefault();
      if (!state.ui.connectFrom) state.ui.connectFrom = id;
      else if (state.ui.connectFrom === id) state.ui.connectFrom = null;
      else { const from = state.ui.connectFrom; state.ui.connectFrom = null; if (addPath(from, id)) toast(tl(`Jalur ${conById(from).name} → ${conById(id).name} ditambahkan.`, `Path ${conById(from).name} → ${conById(id).name} added.`), 'ok'); refreshModel(true); return; }
      drawCanvas(true); return;
    }
    const p = svgPoint(svg, e), c = conById(id);
    drag = { id, dx: p.x - c.x, dy: p.y - c.y, sx: p.x, sy: p.y, moved: false };
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (!state.ui.selected || state.ui.selected.id !== id) { state.ui.selected = { type: 'c', id }; renderProps(); }
    drawCanvas(true); e.preventDefault();
  } else if (ed) { state.ui.selected = { type: 'p', id: ed.dataset.pid }; renderProps(); drawCanvas(true); }
  else {
    if (state.ui.connectFrom) state.ui.connectFrom = null; else if (state.ui.selected) { state.ui.selected = null; renderProps(); }
    drawCanvas(true);
    if (canvasVB) { drag = { pan: true, cx: e.clientX, cy: e.clientY, vb: canvasVB.slice(), moved: false }; try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
  }
}
function onCanvasMove(e) {
  if (!drag) return;
  if (drag.pan) {
    const svg = e.currentTarget, k = Math.max(drag.vb[2] / (svg.clientWidth || 1), drag.vb[3] / (svg.clientHeight || 1));
    const dx = e.clientX - drag.cx, dy = e.clientY - drag.cy; if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    drag.moved = true; canvasVB = [drag.vb[0] - dx * k, drag.vb[1] - dy * k, drag.vb[2], drag.vb[3]]; drawCanvas(true); return;
  }
  const p = svgPoint(e.currentTarget, e);
  if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) < 3) return;
  drag.moved = true;
  const c = conById(drag.id); if (!c) return;
  c.x = Math.round(p.x - drag.dx); c.y = Math.round(p.y - drag.dy); drawCanvas(true);
}
function onCanvasUp() { if (!drag) return; const d = drag; drag = null; if (d.moved && !d.pan) { dirty = true; drawCanvas(true); } }
function prefixName(items) {
  const keys = items.map(n => { const m = String(n).match(/^(.+?)[\s_.\-]*(\d+)$/); return m ? m[1].replace(/[\s_.\-]+$/, '') : null; });
  return keys[0] && keys.every(k => k === keys[0]) ? keys[0] : tl('Konstruk', 'Construct');
}
function onCanvasDrop(e) {
  e.preventDefault();
  let items = [];
  try { items = JSON.parse(e.dataTransfer.getData('application/x-sembada-items') || '[]'); } catch (err) { items = []; }
  items = (Array.isArray(items) ? items : []).filter(i => numericNames().includes(i)); if (!items.length) return;
  const p = svgPoint(e.currentTarget, e), t = document.elementFromPoint(e.clientX, e.clientY), lv = t && t.closest ? t.closest('[data-cid]') : null;
  if (lv) { assignItems(lv.dataset.cid, items); state.ui.selected = { type: 'c', id: lv.dataset.cid }; }
  else { const c = addConstruct({ name: prefixName(items), items, x: p.x, y: p.y }); state.ui.selected = { type: 'c', id: c.id }; }
  state.ui.checked.clear(); refreshModel(true);
}
function renderProps() {
  const el = $('#props'); if (!el) return;
  const sel = state.ui.selected;
  if (sel && sel.type === 'c' && conById(sel.id)) el.innerHTML = propsConstruct(conById(sel.id));
  else if (sel && sel.type === 'p' && M().paths.find(p => p.id === sel.id)) el.innerHTML = propsPath(M().paths.find(p => p.id === sel.id));
  else { state.ui.selected = null; el.innerHTML = propsOverview(); }
}
function propsConstruct(c) {
  const others = M().constructs.filter(k => k.id !== c.id), rel = M().paths.filter(p => p.from === c.id || p.to === c.id);
  const unassigned = numericNames().filter(n => !ownerOf(n)), elsewhere = numericNames().filter(n => { const o = ownerOf(n); return o && o.id !== c.id; });
  const opts = list => list.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('');
  return `<div class="panel-h"><h3>${tl('Konstruk', 'Construct')}</h3><button class="btn btn-quiet" data-action="deselect">${tl('Tutup', 'Close')}</button></div><div class="panel-b">
  <div class="field"><label for="cname">${tl('Nama', 'Name')}</label><input type="text" id="cname" value="${esc(c.name)}" data-change="rename" data-cid="${c.id}" maxlength="40"></div>
  <div class="field"><span class="label">${tl('Jenis pengukuran', 'Measurement type')}</span><div class="choice">
    <label><input type="radio" name="cmode" value="reflective" data-change="mode" data-cid="${c.id}"${c.mode !== 'formative' ? ' checked' : ''}><span class="t">${tl('Reflektif', 'Reflective')}</span><span class="d">${tl('Indikator mencerminkan konstruk. Umum untuk item kuesioner sikap atau persepsi.', 'Indicators reflect the construct. Common for attitude or perception items.')}</span></label>
    <label><input type="radio" name="cmode" value="formative" data-change="mode" data-cid="${c.id}"${c.mode === 'formative' ? ' checked' : ''}><span class="t">${tl('Formatif', 'Formative')}</span><span class="d">${tl('Indikator membentuk konstruk (Mode B). Dinilai lewat outer weights dan VIF.', 'Indicators form the construct (Mode B). Assessed through outer weights and VIF.')}</span></label>
  </div></div>
  <h4>${tl('Indikator', 'Indicators')} (${c.items.length})</h4>
  <div class="chips">${c.items.map(i => `<span class="chip">${esc(i)}<button data-action="remove-item" data-cid="${c.id}" data-item="${esc(i)}" aria-label="${tl(`Lepas ${esc(i)} dari ${esc(c.name)}`, `Remove ${esc(i)} from ${esc(c.name)}`)}">×</button></span>`).join('') || `<span class="small muted">${tl('Belum ada. Seret dari daftar kiri atau pilih di bawah.', 'None yet. Drag from the list on the left or choose below.')}</span>`}</div>
  <select data-change="add-item" data-cid="${c.id}" style="margin-top:9px;width:100%" aria-label="${tl('Tambah indikator', 'Add indicator')}"><option value="">${tl('Tambah indikator…', 'Add indicator…')}</option>${unassigned.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('')}${elsewhere.length ? `<optgroup label="${tl('Pindahkan dari konstruk lain', 'Move from another construct')}">${elsewhere.map(n => `<option value="${esc(n)}">${esc(n)} (${esc(ownerOf(n).name)})</option>`).join('')}</optgroup>` : ''}</select>
  <div class="field" style="margin-top:12px"><label for="cside">${tl('Letak indikator di diagram', 'Indicator position in the diagram')}</label><select id="cside" data-change="side" data-cid="${c.id}">${[['auto', tl('Otomatis', 'Automatic')], ['left', tl('Kiri', 'Left')], ['right', tl('Kanan', 'Right')], ['top', tl('Atas', 'Top')], ['bottom', tl('Bawah', 'Bottom')]].map(([v, t]) => `<option value="${v}"${(c.side || 'auto') === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
  <h4>${tl('Jalur', 'Paths')}</h4>
  <ul class="plist">${rel.map(p => `<li><span>${esc(conById(p.from).name)} → ${esc(conById(p.to).name)}</span><button class="btn btn-quiet btn-danger" data-action="del-path" data-pid="${p.id}">${tl('Hapus', 'Delete')}</button></li>`).join('') || `<li class="muted">${tl('Belum ada jalur.', 'No paths yet.')}</li>`}</ul>
  ${others.length ? `<div class="field" style="margin-top:12px"><label for="path-to">${tl(`${esc(c.name)} memengaruhi`, `${esc(c.name)} affects`)}</label><div class="row" style="gap:6px"><select id="path-to">${opts(others)}</select><button class="btn" data-action="add-path-to" data-cid="${c.id}">${tl('Tambah', 'Add')}</button></div></div>
  <div class="field"><label for="path-from">${tl(`${esc(c.name)} dipengaruhi oleh`, `${esc(c.name)} is affected by`)}</label><div class="row" style="gap:6px"><select id="path-from">${opts(others)}</select><button class="btn" data-action="add-path-from" data-cid="${c.id}">${tl('Tambah', 'Add')}</button></div></div>` : ''}
  <button class="btn btn-quiet btn-danger" data-action="del-construct" data-cid="${c.id}" style="margin-top:6px">${tl('Hapus konstruk', 'Delete construct')}</button></div>`;
}
function propsPath(p) {
  const a = conById(p.from), b = conById(p.to), h = hypotheses().find(x => x.p.id === p.id);
  return `<div class="panel-h"><h3>${tl('Jalur', 'Path')}${h ? ' ' + h.h : ''}</h3><button class="btn btn-quiet" data-action="deselect">${tl('Tutup', 'Close')}</button></div><div class="panel-b"><p>${tl(`<b>${esc(a.name)}</b> memengaruhi <b>${esc(b.name)}</b>.`, `<b>${esc(a.name)}</b> affects <b>${esc(b.name)}</b>.`)}</p><div class="row" style="gap:6px"><button class="btn" data-action="reverse-path" data-pid="${p.id}">${tl('Balik arah', 'Reverse')}</button><button class="btn btn-danger" data-action="del-path" data-pid="${p.id}">${tl('Hapus jalur', 'Delete path')}</button></div></div>`;
}
function propsOverview() {
  const v = validateModel(), hy = hypotheses();
  const issues = v.errors.map(t => ['fail', t]).concat(v.warns.map(t => ['warn', t]), v.info.map(t => ['info', t]));
  if (!v.errors.length) issues.unshift(['pass', tl('Model siap dihitung.', 'The model is ready to calculate.')]);
  return `<div class="panel-h"><h3>${tl('Ringkasan model', 'Model summary')}</h3></div><div class="panel-b">
  <dl class="kv"><dt>${tl('Konstruk', 'Constructs')}</dt><dd>${M().constructs.length}</dd><dt>${tl('Indikator dipakai', 'Indicators used')}</dt><dd>${M().constructs.reduce((s, c) => s + c.items.length, 0)}</dd><dt>${tl('Jalur (hipotesis)', 'Paths (hypotheses)')}</dt><dd>${M().paths.length}</dd></dl>
  <h4>${tl('Pemeriksaan', 'Checks')}</h4><ul class="issues">${issues.map(([st, t]) => `<li><i class="bub ${st}"></i><span>${esc(t)}</span></li>`).join('')}</ul>${quickFixes().length ? `<div class="fix-row col">${quickFixHTML()}</div>` : ''}
  ${M().constructs.length ? `<h4>${tl('Konstruk', 'Constructs')}</h4><div class="chips">${M().constructs.map(c => `<button class="tag lv" style="cursor:pointer" data-action="select-construct" data-cid="${c.id}">${esc(c.name)} (${c.items.length})</button>`).join('')}</div>` : ''}
  ${hy.length ? `<h4>${tl('Hipotesis', 'Hypotheses')}</h4><ul class="plist">${hy.map(h => `<li><span><span class="h">${h.h}</span>${esc(h.from.name)} → ${esc(h.to.name)}</span><button class="btn btn-quiet btn-danger" data-action="del-path" data-pid="${h.p.id}" aria-label="${tl('Hapus ', 'Delete ')}${h.h}">${tl('Hapus', 'Delete')}</button></li>`).join('')}</ul>` : ''}
  <p class="xs muted" style="margin-top:14px">${tl('Klik konstruk di kanvas untuk mengubah nama, jenis, indikator, dan jalurnya.', 'Click a construct on the canvas to change its name, type, indicators, and paths.')}</p></div>`;
}

/* ================================================================ run view */
function progressHTML() {
  const r = state.run, n = 24, on = Math.round((r.frac || 0) * n);
  return `<div class="progress"><div class="bubbles" id="prog-b" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</div><div class="stage" id="prog-t" role="status">${esc(r.stage)}</div></div>`;
}
function viewRun() {
  const S = state.settings, v = validateModel(), running = !!(state.run && state.run.running);
  const callouts = (v.errors.length ? `<div class="callout fail"><p><strong>${tl('Perbaiki dulu sebelum menghitung:', 'Fix these before calculating:')}</strong></p><ul class="issues">${v.errors.map(t => `<li><i class="bub fail"></i><span>${esc(t)}</span></li>`).join('')}</ul><p class="fix-row" style="margin-top:10px">${quickFixHTML()}<button class="btn" data-action="goto" data-step="model">${tl('Ke halaman Model', 'Go to Model')}</button></p></div>` : '') +
    (v.warns.length || v.info.length ? `<div class="callout warn"><ul class="issues">${v.warns.concat(v.info).map(t => `<li><i class="bub warn"></i><span>${esc(t)}</span></li>`).join('')}</ul></div>` : '');
  const n = state.data ? state.data.nRows : 0;
  return `<div class="view">
  <div class="view-head"><div><h1>${tl('Hitung', 'Calculate')}</h1><p>${tl('Pengaturan bawaan mengikuti kebiasaan SmartPLS. Umumnya cukup langsung klik Hitung sekarang.', 'The defaults follow common SmartPLS practice. Usually you can simply click Calculate now.')}</p></div></div>
  ${callouts}
  <div class="run-grid">
    <section class="panel"><div class="panel-h"><h3>${tl('Algoritma PLS', 'PLS algorithm')}</h3></div><div class="panel-b">
      <div class="choice" role="radiogroup" aria-label="${tl('Algoritma', 'Algorithm')}">
        <label><input type="radio" name="algo" value="pls" data-bind="settings.algorithm"><span class="t">${tl('PLS-SEM standar', 'Standard PLS-SEM')}</span><span class="d">${tl('Bawaan SmartPLS. Reflektif diestimasi dengan Mode A, formatif dengan Mode B. Setara seminr composite().', 'The SmartPLS default. Reflective constructs use Mode A, formative constructs Mode B. Equivalent to seminr composite().')}</span></label>
        <label><input type="radio" name="algo" value="plsc" data-bind="settings.algorithm"><span class="t">PLSc (consistent PLS)</span><span class="d">${tl('Mengoreksi atenuasi pada konstruk reflektif. Setara seminr reflective(). Pada sampel kecil bisa menghasilkan R² atau koefisien di atas 1.', 'Corrects attenuation in reflective constructs. Equivalent to seminr reflective(). With small samples it can produce R² or coefficients above 1.')}</span></label>
      </div>
      <details class="adv"><summary>${tl('Pengaturan lanjutan', 'Advanced settings')}</summary><div class="row" style="padding-top:12px">
        <div class="field"><label for="scheme">${tl('Skema pembobotan', 'Weighting scheme')}</label><select id="scheme" data-bind="settings.scheme"><option value="path">${tl('Path (bawaan)', 'Path (default)')}</option><option value="factorial">Factorial</option><option value="centroid">Centroid</option></select></div>
        <div class="field"><label for="maxit">${tl('Iterasi maksimum', 'Maximum iterations')}</label><input type="number" id="maxit" min="10" max="5000" step="10" data-bind="settings.maxIter"></div>
        <div class="field"><label for="stop">${tl('Berhenti bila selisih &lt; 10^-k, k =', 'Stop when change &lt; 10^-k, k =')}</label><input type="number" id="stop" min="3" max="12" data-bind="settings.stopExp"></div>
      </div></details>
    </div></section>
    <section class="panel"><div class="panel-h"><h3>${tl('Uji signifikansi dan prediksi', 'Significance and prediction')}</h3></div><div class="panel-b">
      <label class="check"><input type="checkbox" data-bind="settings.boot.run"><span><b>Bootstrapping</b><br><span class="small muted">${tl('Menghasilkan t statistik, p value, dan interval kepercayaan untuk uji hipotesis.', 'Produces t statistics, p values, and confidence intervals for hypothesis tests.')}</span></span></label>
      <fieldset id="boot-fs"${S.boot.run ? '' : ' disabled'} style="margin:12px 0 18px 26px"><div class="row">
        <div class="field"><label for="bB">${tl('Jumlah subsampel (maks. 10.000)', 'Subsamples (max. 10,000)')}</label><input type="number" id="bB" min="100" max="10000" step="100" inputmode="numeric" data-bind="settings.boot.B" data-max-msg="${tl('Jumlah subsampel bootstrap paling banyak 10.000.', 'Bootstrapping is limited to 10,000 subsamples.')}" aria-describedby="boot-note"></div>
        <div class="field"><label for="bci">${tl('Interval kepercayaan', 'Confidence interval')}</label><select id="bci" data-bind="settings.boot.ci"><option value="percentile">${tl('Persentil', 'Percentile')}</option><option value="bca">BCa (bias-corrected and accelerated)</option></select></div>
        <div class="field"><label for="bt">${tl('Jenis uji', 'Test type')}</label><select id="bt" data-bind="settings.boot.tails"><option value="two">${tl('Dua arah', 'Two-tailed')}</option><option value="one">${tl('Satu arah', 'One-tailed')}</option></select></div>
        <div class="field"><label for="ba">${tl('Taraf signifikansi', 'Significance level')}</label><select id="ba" data-bind="settings.boot.alpha" data-type="num"><option value="0.01">1%</option><option value="0.05">5%</option><option value="0.1">10%</option></select></div>
        <div class="field"><label for="bs">Seed</label><input type="number" id="bs" data-bind="settings.boot.seed"></div>
      </div><p class="small muted boot-note" id="boot-note">${tl('Jumlah subsampel paling banyak 10.000. Sebanyak 5.000 subsampel sudah memadai untuk sebagian besar analisis, sedangkan 10.000 disarankan untuk hasil akhir (Hair dkk., 2022). Di atas itu ketelitian p value dan interval kepercayaan hampir tidak bertambah, sementara lama perhitungan naik sebanding dengan jumlah subsampel.', 'The number of subsamples is limited to 10,000. 5,000 subsamples are enough for most analyses, and 10,000 are recommended for final results (Hair et al., 2022). Beyond that the precision of p values and confidence intervals barely improves, while the calculation time grows in proportion to the number of subsamples.')}</p></fieldset>
      <label class="check"><input type="checkbox" data-bind="settings.predict.run"><span><b>PLSpredict</b><br><span class="small muted">${tl('Menguji kekuatan prediksi out-of-sample (Q²predict, RMSE, MAE) dengan validasi silang k-fold.', 'Tests out-of-sample predictive power (Q²predict, RMSE, MAE) with k-fold cross-validation.')}</span></span></label>
      <fieldset id="pred-fs"${S.predict.run ? '' : ' disabled'} style="margin:12px 0 0 26px"><div class="row">
        <div class="field"><label for="pf">${tl('Jumlah fold', 'Folds')}</label><input type="number" id="pf" min="2" max="20" data-bind="settings.predict.folds"></div>
        <div class="field"><label for="pr">${tl('Pengulangan', 'Repetitions')}</label><input type="number" id="pr" min="1" max="50" data-bind="settings.predict.reps"></div>
        <div class="field"><label for="pa">${tl('Pendekatan', 'Approach')}</label><select id="pa" data-bind="settings.predict.approach"><option value="DA">Direct antecedents (seminr)</option><option value="EA">Earliest antecedents (SmartPLS)</option></select></div>
      </div></fieldset>
    </div></section>
    ${advancedPanelHTML()}
  </div>
  <div class="run-go">
    <button class="btn btn-primary btn-big" data-action="run"${v.errors.length || running ? ' disabled' : ''}>${tl('Hitung sekarang', 'Calculate now')}</button>
    <div style="flex:1;min-width:240px">${running ? progressHTML() : `<span class="small muted">${tl(`${fmtInt(n)} responden, ${M().constructs.length} konstruk, ${M().paths.length} hipotesis.`, `${fmtInt(n)} respondents, ${M().constructs.length} constructs, ${M().paths.length} hypotheses.`)}${state.results ? tl(' Hasil sebelumnya akan diganti.', ' Previous results will be replaced.') : ''}</span>`}</div>
    ${running ? `<button class="btn" data-action="cancel-run">${tl('Hentikan', 'Stop')}</button>` : ''}
  </div></div>`;
}

/* ================================================================ results view */
function exportLangSeg() {
  const L = exportLang();
  return `<div class="seg" role="group" aria-label="${tl('Bahasa dokumen', 'Document language')}"><button data-action="export-lang" data-v="id" aria-pressed="${L === 'id'}">Indonesia</button><button data-action="export-lang" data-v="en" aria-pressed="${L === 'en'}">English</button></div>`;
}
function viewResults() {
  const R = state.results;
  if (!R) return `<div class="view"><div class="view-head"><div><h1>${tl('Hasil', 'Results')}</h1><p>${tl('Belum ada hasil. Susun model, lalu klik Hitung.', 'No results yet. Build the model, then click Calculate.')}</p></div></div><button class="btn btn-primary" data-action="goto" data-step="run">${tl('Ke halaman Hitung', 'Go to Calculate')}</button></div>`;
  const secs = availableSections(R);
  let cur = secs.find(s => s.id === state.ui.section); if (!cur) { cur = secs[0]; state.ui.section = cur.id; }
  const i = secs.indexOf(cur), prev = secs[i - 1], next = secs[i + 1];
  let nav = '', g = null;
  secs.forEach(s => { const gr = s.group(); if (gr !== g) { g = gr; nav += `<div class="g">${esc(g)}</div>`; } nav += `<button data-action="section" data-sec="${s.id}" aria-current="${s.id === cur.id}">${esc(s.title())}</button>`; });
  tableStore.clear();
  const body = renderSection(cur, R);
  return `<div class="view" style="max-width:none">
    ${isStale() ? `<div class="callout warn stale"><p><strong>${tl('Model, data, atau pengaturan berubah sejak perhitungan terakhir.', 'The model, data, or settings changed since the last calculation.')}</strong> ${tl('Hasil di bawah masih milik model sebelumnya.', 'The results below still belong to the previous model.')} <button class="btn" data-action="run-again">${tl('Hitung ulang', 'Recalculate')}</button></p></div>` : ''}
    <div class="view-head"><div><h1>${tl('Hasil', 'Results')}</h1><p>${tl(`${fmtInt(R.prep.n)} responden, algoritma ${R.opts.plsc ? 'PLSc' : 'PLS-SEM'}${R.boot ? `, bootstrapping ${fmtInt(R.boot.B)} subsampel` : ''}.`, `${fmtInt(R.prep.n)} respondents, ${R.opts.plsc ? 'PLSc' : 'PLS-SEM'} algorithm${R.boot ? `, bootstrapping with ${fmtInt(R.boot.B)} subsamples` : ''}.`)} ${tl('Dihitung', 'Calculated at')} ${esc(R.time.toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' }))}.</p></div>
      <div class="res-tools">
        <div class="seg" role="group" aria-label="${tl('Pemisah desimal', 'Decimal separator')}"><button data-action="decsep" data-v="dot" aria-pressed="${!state.view.comma}">0.123</button><button data-action="decsep" data-v="comma" aria-pressed="${state.view.comma}">0,123</button></div>
        <select data-change="decimals" aria-label="${tl('Jumlah desimal', 'Decimal places')}">${[2, 3, 4].map(d => `<option value="${d}"${d === state.view.decimals ? ' selected' : ''}>${d} ${tl('desimal', 'decimals')}</option>`).join('')}</select>
        <details class="menu" id="export-menu"><summary class="btn btn-primary">${tl('Unduh hasil', 'Download results')}</summary>
          <div class="menu-pop" role="menu" aria-label="${tl('Pilih format unduhan', 'Choose a download format')}">
            <div class="menu-lang"><span>${tl('Bahasa dokumen', 'Document language')}</span><span id="export-lang-seg">${exportLangSeg()}</span></div>
            <div class="menu-g">${tl('Makalah', 'Paper')}${paperLocked() ? `<span class="menu-lock">${LOCK_ICON}${tl('Terkunci', 'Locked')}</span>` : ''}</div>
            <button role="menuitem" data-action="export-paper-pdf"><b>${tl('Makalah PDF (LaTeX)', 'Paper PDF (LaTeX)')}</b><span>${tl('Dikompilasi langsung di aplikasi, siap dibaca dan dikirim', 'Compiled inside the app, ready to read and share')}</span></button>
            <button role="menuitem" data-action="export-paper"><b>${tl('Makalah Word (.docx)', 'Paper in Word (.docx)')}</b><span>${tl('Format konferensi dua kolom untuk disunting', 'Two-column conference format for editing')}</span></button>
            <button role="menuitem" data-action="export-paper-tex"><b>${tl('Makalah LaTeX (.zip)', 'Paper in LaTeX (.zip)')}</b><span>${tl('Sumber .tex dan gambar untuk Overleaf', 'The .tex source and figures for Overleaf')}</span></button>
            <div class="menu-g">${tl('Presentasi', 'Presentation')}</div>
            <button role="menuitem" data-action="export-pptx"><b>${tl('PowerPoint (.pptx)', 'PowerPoint (.pptx)')}</b><span>${tl('Grafik bisa diedit; tema terang atau gelap mengikuti aplikasi', 'Editable charts; light or dark theme follows the app')}</span></button>
            <button role="menuitem" data-action="export-beamer-pdf"><b>${tl('Beamer PDF', 'Beamer PDF')}</b><span>${tl('Slide LaTeX; tema terang atau gelap mengikuti aplikasi', 'LaTeX slides; light or dark theme follows the app')}</span></button>
            <button role="menuitem" data-action="export-beamer-tex"><b>${tl('Beamer LaTeX (.zip)', 'Beamer LaTeX (.zip)')}</b><span>${tl('Sumber slides.tex dan gambar', 'The slides.tex source and figures')}</span></button>
            <div class="menu-g">${tl('Laporan dan data', 'Report and data')}</div>
            <button role="menuitem" data-action="export-docx"><b>${tl('Laporan Word (.docx)', 'Word report (.docx)')}</b><span>${tl('Semua tabel dan gambar hasil', 'All result tables and figures')}</span></button>
            <button role="menuitem" data-action="export-zip"><b>${tl('Semua gambar (.zip)', 'All figures (.zip)')}</b><span>${tl('PNG resolusi tinggi dan SVG', 'High-resolution PNG and SVG')}</span></button>
            <button role="menuitem" data-action="export-xlsx"><b>${tl('Tabel Excel (.xlsx)', 'Excel tables (.xlsx)')}</b><span>${tl('Satu sheet untuk setiap bagian', 'One sheet per section')}</span></button>
            <button role="menuitem" data-action="export-html"><b>${tl('Laporan HTML', 'HTML report')}</b><span>${tl('Dibuka di browser', 'Opens in a browser')}</span></button>
          </div></details>
      </div></div>
    <div class="res-grid"><nav class="res-nav" aria-label="${tl('Bagian hasil', 'Results sections')}">${nav}</nav>
      <article class="res-body" id="res-body">${body}<div class="pager">${prev ? `<button class="btn" data-action="section" data-sec="${prev.id}">${tl('Sebelumnya: ', 'Previous: ')}${esc(prev.title())}</button>` : '<span></span>'}${next ? `<button class="btn" data-action="section" data-sec="${next.id}">${tl('Berikutnya: ', 'Next: ')}${esc(next.title())}</button>` : ''}</div></article>
    </div></div>`;
}

/* ================================================================ settings & help dialogs */
const themeSetting = () => { try { return localStorage.getItem('sembada-theme') || 'light'; } catch (e) { return document.documentElement.getAttribute('data-theme') || 'light'; } };
function settingsHTML() {
  const seg = (act, cur, opts, label) => `<div class="seg" role="group" aria-label="${esc(label)}">${opts.map(([v, t]) => `<button data-action="${act}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${esc(t)}</button>`).join('')}</div>`;
  return `<div class="set-grid">
    <div class="field"><span class="label">${tl('Bahasa aplikasi', 'App language')}</span>${seg('lang', state.view.lang, [['id', 'Bahasa Indonesia'], ['en', 'English']], tl('Bahasa aplikasi', 'App language'))}<span class="hint">${tl('Mengubah semua teks tampilan, tabel hasil, dan pesan.', 'Changes all interface text, result tables, and messages.')}</span></div>
    <div class="field"><span class="label">${tl('Bahasa dokumen ekspor', 'Export document language')}</span>${seg('export-lang', state.view.exportLang, [['auto', tl('Ikuti aplikasi', 'Same as app')], ['id', 'Bahasa Indonesia'], ['en', 'English']], tl('Bahasa dokumen ekspor', 'Export document language'))}<span class="hint">${tl('Berlaku untuk laporan Word, narasi paper, presentasi PowerPoint, Excel, laporan HTML, dan gambar. Dokumen berbahasa Inggris selalu memakai titik desimal.', 'Applies to the Word report, paper narrative, PowerPoint presentation, Excel, HTML report, and figures. English documents always use a decimal point.')}</span></div>
    <div class="field"><span class="label">${tl('Tema', 'Theme')}</span>${seg('set-theme', themeSetting(), [['auto', tl('Ikuti sistem', 'System')], ['light', tl('Terang', 'Light')], ['dark', tl('Gelap', 'Dark')]], tl('Tema', 'Theme'))}</div>
    <div class="field"><span class="label">${tl('Pemisah desimal', 'Decimal separator')}</span>${seg('decsep', state.view.comma ? 'comma' : 'dot', [['dot', '0.123'], ['comma', '0,123']], tl('Pemisah desimal', 'Decimal separator'))}</div>
    <div class="field"><label for="set-dec">${tl('Jumlah desimal', 'Decimal places')}</label><select id="set-dec" data-change="decimals" style="max-width:120px">${[2, 3, 4].map(d => `<option value="${d}"${d === state.view.decimals ? ' selected' : ''}>${d}</option>`).join('')}</select></div>
  </div>`;
}
function fillSettings() { $('#settings-title').textContent = tl('Pengaturan', 'Settings'); $('#settings .dlg-h button').textContent = tl('Tutup', 'Close'); $('#settings-body').innerHTML = settingsHTML(); }
function fillHelp() { $('#help-title').textContent = tl('Panduan', 'Guide'); $('#help .dlg-h button').textContent = tl('Tutup', 'Close'); $('#help-body').innerHTML = helpHTML(); }
const openDlg = id => { const d = $(id); if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); };
const closeDlg = id => { const d = $(id); if (d.close) d.close(); else d.removeAttribute('open'); };
function refreshDialogs() { const s = $('#settings'); if (s && s.open) fillSettings(); const h = $('#help'); if (h && h.open) fillHelp(); }
function setLang(l) {
  if (l !== 'id' && l !== 'en') return;
  state.view.lang = l; I18N.lang = l;
  if (isUntitled(state.name)) state.name = UNTITLED();
  try { localStorage.setItem('sembada-lang', l); } catch (e) { /* storage unavailable */ }
  render(); refreshDialogs();
}
function setTheme(v) {
  if (v === 'auto') { applyTheme(null); try { localStorage.setItem('sembada-theme', 'auto'); } catch (e) { /* storage unavailable */ } }
  else { applyTheme(v); try { localStorage.setItem('sembada-theme', v); } catch (e) { /* storage unavailable */ } }
  refreshDialogs();
}
function helpHTML() {
  const row = (a, b, c) => `<tr><th scope="row">${a}</th><td class="t">${b}</td><td class="t">${c}</td></tr>`, d = v => dec(v);
  return `<h3>${tl('Cara pakai', 'How to use')}</h3><ol class="steps-list">
    <li><span>${tl('<b>Data.</b> Seret file Excel (.xlsx) atau CSV. Baris pertama berisi nama kolom, setiap baris satu responden, isinya angka (misalnya skala Likert 1–5).', '<b>Data.</b> Drag in an Excel (.xlsx) or CSV file. The first row holds the column names, each row is one respondent, and the cells are numbers (for example a 1–5 Likert scale).')}</span></li>
    <li><span>${tl('<b>Model.</b> Klik Kelompokkan otomatis atau seret indikator ke kanvas. Pilih jenis reflektif atau formatif, lalu gambar jalur antar konstruk. Setiap jalur menjadi hipotesis H1, H2, dan seterusnya.', '<b>Model.</b> Click Auto-group or drag indicators onto the canvas. Choose reflective or formative, then draw paths between constructs. Each path becomes hypothesis H1, H2, and so on.')}</span></li>
    <li><span>${tl('<b>Hitung.</b> Pengaturan bawaan mengikuti SmartPLS: PLS-SEM, skema path, bootstrapping 5.000 subsampel, PLSpredict 10 fold.', '<b>Calculate.</b> The defaults follow SmartPLS: PLS-SEM, path scheme, bootstrapping with 5,000 subsamples, PLSpredict with 10 folds.')}</span></li>
    <li><span>${tl('<b>Hasil.</b> Baca ringkasan lolos atau tidak, tabel uji hipotesis, dan narasi paper. Lewat tombol Unduh hasil, buat laporan Word, narasi paper bergaya jurnal, presentasi PowerPoint, tabel Excel, dan kumpulan gambar (.zip) dalam bahasa Indonesia atau Inggris.', '<b>Results.</b> Read the pass/fail summary, the hypothesis table, and the paper narrative. With Download results, create a Word report, a journal-style paper narrative, a PowerPoint presentation, Excel tables, and a figure collection (.zip) in Indonesian or English.')}</span></li></ol>
  <h3>${tl('Bahasa', 'Language')}</h3><p>${tl('Pilih ID atau EN di bilah atas untuk mengganti bahasa aplikasi. Bahasa dokumen ekspor dapat diatur terpisah di Pengaturan atau langsung di menu Unduh hasil, misalnya tampilan berbahasa Indonesia tetapi narasi paper berbahasa Inggris untuk artikel jurnal.', 'Choose ID or EN in the top bar to switch the app language. The export document language can be set separately in Settings or directly in the Download results menu, for example an Indonesian interface with an English paper narrative for a journal article.')}</p>
  <h3>${tl('Kriteria evaluasi', 'Evaluation criteria')}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">${tl('Kriteria', 'Criterion')}</th><th scope="col">${tl('Batas', 'Threshold')}</th><th scope="col">${tl('Sumber', 'Source')}</th></tr></thead><tbody>
    ${row('Outer loading', tl(`≥ ${d(0.70)}; ${d(0.40)}–${d(0.70)} dipertimbangkan`, `≥ ${d(0.70)}; ${d(0.40)}–${d(0.70)} considered`), tl('Hair dkk. (2022)', 'Hair et al. (2022)'))}
    ${row("Cronbach's alpha, rho_A, rho_C", `${d(0.70)}–${d(0.95)}`, tl('Hair dkk. (2019)', 'Hair et al. (2019)'))}
    ${row('AVE', `≥ ${d(0.50)}`, 'Fornell & Larcker (1981)')}
    ${row('HTMT', tl(`< ${d(0.90)} (longgar), < ${d(0.85)} (ketat); batas atas CI < 1`, `< ${d(0.90)} (liberal), < ${d(0.85)} (conservative); upper CI bound < 1`), tl('Henseler dkk. (2015)', 'Henseler et al. (2015)'))}
    ${row('VIF', tl('< 5, idealnya < 3', '< 5, ideally < 3'), tl('Hair dkk. (2022)', 'Hair et al. (2022)'))}
    ${row('R²', tl(`${d(0.75)} kuat; ${d(0.50)} moderat; ${d(0.25)} lemah`, `${d(0.75)} substantial; ${d(0.50)} moderate; ${d(0.25)} weak`), tl('Hair dkk. (2011)', 'Hair et al. (2011)'))}
    ${row('f²', tl(`${d(0.02)} kecil; ${d(0.15)} sedang; ${d(0.35)} besar`, `${d(0.02)} small; ${d(0.15)} medium; ${d(0.35)} large`), 'Cohen (1988)')}
    ${row('SRMR', `< ${d(0.08)}`, 'Hu & Bentler (1999)')}
    ${row('Q²predict', tl('> 0; bandingkan RMSE PLS dengan LM', '> 0; compare PLS RMSE with LM'), tl('Shmueli dkk. (2019)', 'Shmueli et al. (2019)'))}
    ${row(tl('Uji hipotesis', 'Hypothesis test'), tl(`p < α (umumnya ${d(0.05)})`, `p < α (usually ${d(0.05)})`), 'bootstrapping')}</tbody></table></div>
  <h3>${tl('PLS standar atau PLSc?', 'Standard PLS or PLSc?')}</h3><p>${tl('PLS-SEM standar adalah bawaan SmartPLS dan setara dengan <code>composite()</code> di seminr. PLSc mengoreksi bias loading pada konstruk reflektif dan setara dengan <code>reflective()</code> di seminr 2.x. Pada sampel kecil dengan konstruk yang sangat berkorelasi, PLSc dapat menghasilkan R² atau koefisien di atas 1, dan bootstrap-nya menjadi tidak stabil. Bila itu terjadi, aplikasi menampilkan peringatan.', 'Standard PLS-SEM is the SmartPLS default and is equivalent to <code>composite()</code> in seminr. PLSc corrects the loading bias of reflective constructs and is equivalent to <code>reflective()</code> in seminr 2.x. With small samples and highly correlated constructs, PLSc can produce R² or coefficients above 1, and its bootstrap becomes unstable. When that happens, the app shows a warning.')}</p>
  <h3>${tl('Mengapa angka bootstrapping berbeda sedikit dari SmartPLS atau seminr?', 'Why do bootstrapping figures differ slightly from SmartPLS or seminr?')}</h3><p>${tl('Bootstrapping dan PLSpredict memakai pengambilan sampel acak. Dengan seed yang sama, hasil di aplikasi ini selalu sama, tetapi pembangkit bilangan acaknya berbeda dari R atau SmartPLS sehingga angka di desimal ketiga bisa berbeda. Estimasi PLS-nya sendiri (loading, koefisien, R², reliabilitas, HTMT) identik.', 'Bootstrapping and PLSpredict use random sampling. With the same seed this app always gives the same results, but its random number generator differs from R or SmartPLS, so the third decimal can differ. The PLS estimates themselves (loadings, coefficients, R², reliability, HTMT) are identical.')}</p>
  <h3>${tl('Narasi paper dan presentasi', 'Paper narrative and presentations')}</h3><p>${tl('Bagian Narasi paper menyusun draf makalah format konferensi dua kolom: abstrak, tinjauan pustaka dan metodologi lengkap dengan rumus, hasil, kesimpulan, serta daftar pustaka bernomor. Unduh sebagai PDF (dikompilasi LaTeX langsung di aplikasi, tanpa internet), Word, atau sumber LaTeX. Presentasi tersedia sebagai PowerPoint dengan rumus hasil render LaTeX, serta Beamer dalam PDF atau sumber LaTeX. Pendahuluan, teori konstruk, dan pembahasan diberi isian dalam kurung siku untuk dilengkapi sendiri.', 'The Paper narrative section drafts a two-column conference paper: abstract, literature review and methodology with formulas, results, conclusion, and numbered references. Download it as PDF (compiled with LaTeX inside the app, without internet), Word, or LaTeX source. Presentations are available as PowerPoint with LaTeX-rendered equations, and as Beamer in PDF or LaTeX source. The introduction, construct theory, and discussion are bracketed placeholders for you to complete.')}</p>
  <h3>${tl('Menyimpan pekerjaan', 'Saving your work')}</h3><p>${tl('Tombol Simpan proyek mengunduh file <code>.sembada.json</code> berisi data, model, dan pengaturan. Buka kembali lewat Buka proyek. Hasil tidak ikut disimpan; cukup klik Hitung lagi.', 'Save project downloads a <code>.sembada.json</code> file with the data, model, and settings. Reopen it with Open project. Results are not saved; just click Calculate again.')}</p>
  <h3>${tl('Privasi', 'Privacy')}</h3><p>${NATIVE ? tl('Aplikasi desktop ini', 'This desktop app') : tl('Aplikasi ini satu file HTML yang', 'This app is a single HTML file that')} ${tl('berjalan sepenuhnya di komputer Anda, juga tanpa internet. Tidak ada data yang dikirim ke server mana pun.', 'runs entirely on your computer, also without internet. No data is sent to any server.')}</p>
  <h3>${tl('Tentang', 'About')}</h3><p>${tl(`SEMbada versi ${APP_VERSION}. Kode sumber: <a href="${APP_REPO}" target="_blank" rel="noopener">github.com/novrisuhermi/sembada</a>. Huruf Plus Jakarta Sans karya Tokotype dan Inter karya Rasmus Andersson (keduanya SIL Open Font License 1.1). Ekspor Word dan PowerPoint memakai pustaka docx, PptxGenJS, dan JSZip (lisensi MIT). PDF LaTeX dikompilasi oleh pdfTeX dalam WebAssembly (SwiftLaTeX) dengan berkas TeX Live serta font URW dan Computer Modern; lisensinya tercantum di bawah.`, `SEMbada version ${APP_VERSION}. Source code: <a href="${APP_REPO}" target="_blank" rel="noopener">github.com/novrisuhermi/sembada</a>. Plus Jakarta Sans typeface by Tokotype and Inter typeface by Rasmus Andersson (both SIL Open Font License 1.1). Word and PowerPoint export uses the docx, PptxGenJS, and JSZip libraries (MIT license). LaTeX PDFs are compiled by pdfTeX in WebAssembly (SwiftLaTeX) with TeX Live files and URW and Computer Modern fonts; their licenses are listed below.`)}${NATIVE ? tl(' Versi desktop dibangun dengan Neutralinojs (lisensi MIT).', ' The desktop version is built with Neutralinojs (MIT license).') : ''}</p><details><summary class="small">${tl('Lisensi komponen pihak ketiga', 'Third-party licenses')}</summary><pre class="code" style="white-space:pre-wrap;margin-top:8px">${esc((NATIVE ? ['Neutralinojs\n\n' + NL_LICENSE] : []).concat(LIB_LICENSES).join('\n\n------------------------------------------------------------\n\n'))}</pre></details>`;
}

/* ================================================================ events */
const closeMenu = () => { const m = $('#export-menu'); if (m) m.open = false; };
const actions = {
  'pick-file': () => pickFile('data'),
  'load-sample': () => loadSample(),
  'open-project': () => pickFile('project'),
  'save-project': () => saveProject(),
  'help': () => { fillHelp(); openDlg('#help'); },
  'close-help': () => closeDlg('#help'),
  'settings': () => { fillSettings(); openDlg('#settings'); },
  'close-settings': () => closeDlg('#settings'),
  'lang': el => setLang(el.dataset.v),
  'export-lang': el => { state.view.exportLang = el.dataset.v; const s = $('#export-lang-seg'); if (s) s.innerHTML = exportLangSeg(); refreshDialogs(); },
  'set-theme': el => setTheme(el.dataset.v),
  'goto': el => goStep(el.dataset.step),
  'step': el => goStep(el.dataset.step),
  'auto-group': () => { autoGroup(); refreshModel(); },
  'group-checked': () => {
    const items = Array.from(state.ui.checked); if (!items.length) return;
    const vb = canvasVB || [0, 0, 1000, 600], c = addConstruct({ name: prefixName(items), items, x: vb[0] + vb[2] / 2, y: vb[1] + vb[3] / 2 });
    state.ui.checked.clear(); state.ui.selected = { type: 'c', id: c.id }; refreshModel(true);
  },
  'add-construct': () => {
    const vb = canvasVB || [0, 0, 1000, 600], k = M().constructs.length;
    const c = addConstruct({ name: tl('Konstruk', 'Construct'), x: vb[0] + vb[2] / 2 + (k % 4) * 24, y: vb[1] + vb[3] / 2 + (k % 4) * 24 });
    state.ui.selected = { type: 'c', id: c.id }; refreshModel(true);
    const inp = $('#cname'); if (inp) { inp.focus(); inp.select(); }
  },
  'zoom': el => { if (!canvasVB) return; const f = +el.dataset.f, [x, y, w, h] = canvasVB; canvasVB = [x + w / 2 - w * f / 2, y + h / 2 - h * f / 2, w * f, h * f]; drawCanvas(true); },
  'zoom-fit': () => drawCanvas(false),
  'toggle-connect': () => { state.ui.connect = !state.ui.connect; state.ui.connectFrom = null; refreshModel(true); },
  'auto-layout': () => { autoLayout(); dirty = true; refreshModel(); },
  'example-model': () => { if (M().constructs.length && !confirm(tl('Ganti model saat ini dengan model contoh?', 'Replace the current model with the example model?'))) return; exampleModel(); refreshModel(); toast(tl('Model contoh dimuat: 6 konstruk dan 9 hipotesis seperti pada Rmd.', 'Example model loaded: 6 constructs and 9 hypotheses as in the Rmd.'), 'ok'); },
  'clear-model': () => { if (!M().constructs.length || !confirm(tl('Hapus semua konstruk dan jalur?', 'Delete all constructs and paths?'))) return; state.model = { constructs: [], paths: [], moderations: [] }; state.ui.selected = null; changed(); refreshModel(); },
  'deselect': () => { state.ui.selected = null; renderProps(); drawCanvas(true); },
  'select-construct': el => { state.ui.selected = { type: 'c', id: el.dataset.cid }; renderProps(); drawCanvas(true); },
  'remove-item': el => { const c = conById(el.dataset.cid); if (c) { c.items = c.items.filter(i => i !== el.dataset.item); changed(); refreshModel(true); } },
  'del-path': el => { removePath(el.dataset.pid); refreshModel(true); },
  'reverse-path': el => { reversePath(el.dataset.pid); refreshModel(true); },
  'del-construct': el => { const c = conById(el.dataset.cid); if (c && confirm(tl(`Hapus konstruk ${c.name} beserta jalurnya?`, `Delete construct ${c.name} and its paths?`))) { removeConstruct(c.id); refreshModel(true); } },
  'add-path-to': el => { const t = $('#path-to'); if (t && addPath(el.dataset.cid, t.value)) refreshModel(true); },
  'add-path-from': el => { const f = $('#path-from'); if (f && addPath(f.value, el.dataset.cid)) refreshModel(true); },
  'run': () => runAll(),
  'run-again': () => runAll(),
  'cancel-run': () => { if (state.run) { state.run.cancel = true; setProgress(tl('Menghentikan…', 'Stopping…'), state.run.frac || 0); } },
  'section': el => { state.ui.section = el.dataset.sec; renderMain(); const m = $('#main'); if (m) m.scrollTop = 0; },
  'decsep': el => { state.view.comma = el.dataset.v === 'comma'; if (state.ui.step === 'results') renderMain(); refreshDialogs(); },
  'dgshow': el => { state.view.diagram = el.dataset.v; renderMain(); },
  'copy-table': async el => { const tm = tableStore.get(el.dataset.tid); if (!tm) return; const ok = await copyRich(tableSimpleHTML(tm), tableTSV(tm)); toast(ok ? tl(`Tabel "${tm.title}" disalin. Tempel di Word atau Excel.`, `Table "${tm.title}" copied. Paste it into Word or Excel.`) : tl('Gagal menyalin. Gunakan tombol CSV.', 'Copy failed. Use the CSV button.'), ok ? 'ok' : 'err'); },
  'csv-table': el => { const tm = tableStore.get(el.dataset.tid); if (tm) download(safeFile(tm.title) + '.csv', tableCSV(tm), 'text/csv;charset=utf-8'); },
  'copy-narr': async () => { const ps = narrative(state.results); const ok = await copyRich(ps.map(p => `<p>${esc(p)}</p>`).join(''), ps.join('\n\n')); toast(ok ? tl('Narasi disalin.', 'Narrative copied.') : tl('Gagal menyalin.', 'Copy failed.'), ok ? 'ok' : 'err'); },
  'paper-unlock': () => withPaperUnlock(() => {}),
  'copy-paper': () => withPaperUnlock(async () => { const c = paperClipboard(state.results); const ok = await copyRich(c.html, c.text); toast(ok ? tl('Narasi paper disalin, termasuk tabel. Tempel di Word.', 'Paper narrative copied, including tables. Paste it into Word.') : tl('Gagal menyalin.', 'Copy failed.'), ok ? 'ok' : 'err'); }),
  'copy-code': async () => { const code = seminrCode(state.results); const ok = await copyRich(`<pre>${esc(code)}</pre>`, code); toast(ok ? tl('Kode R disalin.', 'R code copied.') : tl('Gagal menyalin.', 'Copy failed.'), ok ? 'ok' : 'err'); },
  'export-xlsx': () => { closeMenu(); exportXLSX(); },
  'export-docx': () => exportDocx(),
  'export-paper': () => withPaperUnlock(() => exportPaperDocx()),
  'export-paper-tex': () => withPaperUnlock(() => exportPaperTex()),
  'export-paper-pdf': () => withPaperUnlock(() => exportPaperPdf()),
  'export-beamer-pdf': () => exportBeamerPdf(),
  'export-beamer-tex': () => exportBeamerTex(),
  'export-pptx': () => exportPptx(),
  'export-zip': () => exportImagesZip(),
  'export-html': () => { closeMenu(); exportHTML(); },
  'dl-svg': () => download(safeFile(state.name) + '_diagram.svg', withFonts(diagramExportSVG(true)), 'image/svg+xml'),
  'dl-png': () => downloadPNG()
};
const changes = {
  'sheet': el => switchSheet(+el.value),
  'check-item': el => { if (el.checked) state.ui.checked.add(el.dataset.item); else state.ui.checked.delete(el.dataset.item); const gb = $('[data-action="group-checked"]'); if (gb) gb.disabled = !state.ui.checked.size; },
  'rename': el => {
    const c = conById(el.dataset.cid); if (!c) return; const v = el.value.trim();
    if (!v) { el.value = c.name; return; }
    if (v !== c.name && conByName(v)) { toast(tl(`Nama ${v} sudah dipakai konstruk lain.`, `The name ${v} is already used by another construct.`), 'err'); el.value = c.name; return; }
    c.name = v; changed(); refreshModel(true);
  },
  'mode': el => { const c = conById(el.dataset.cid); if (c) { c.mode = el.value; changed(); refreshModel(true); } },
  'add-item': el => { if (el.value) { assignItems(el.dataset.cid, [el.value]); refreshModel(true); } },
  'side': el => { const c = conById(el.dataset.cid); if (c) { c.side = el.value; dirty = true; drawCanvas(true); } },
  'decimals': el => { state.view.decimals = +el.value; if (state.ui.step === 'results') renderMain(); refreshDialogs(); }
};
function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
document.addEventListener('click', e => {
  const om = document.querySelector('details.menu[open]'); if (om && !om.contains(e.target)) om.open = false;
  const el = e.target.closest('[data-action]'); if (!el || el.disabled) return;
  const fn = actions[el.dataset.action]; if (!fn) return;
  e.preventDefault(); fn(el, e);
});
document.addEventListener('keydown', e => {
  const t = e.target, tag = (t.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  if ((e.key === 'Enter' || e.key === ' ') && t.id === 'drop') { e.preventDefault(); pickFile('data'); return; }
  if (e.key === 'Enter' && t.id === 'cname') { t.blur(); return; }
  if (state.ui.step !== 'model') return;
  if (e.key === 'Escape') { if (state.ui.connect) { state.ui.connect = false; state.ui.connectFrom = null; refreshModel(true); } else if (state.ui.selected && !typing) { state.ui.selected = null; renderProps(); drawCanvas(true); } return; }
  if (typing) return;
  const sel = state.ui.selected; if (!sel) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (sel.type === 'c') removeConstruct(sel.id); else removePath(sel.id); refreshModel(true); return; }
  if (sel.type === 'c' && e.key.startsWith('Arrow')) {
    const c = conById(sel.id); if (!c) return; const d = e.shiftKey ? 40 : 10;
    if (e.key === 'ArrowLeft') c.x -= d; if (e.key === 'ArrowRight') c.x += d; if (e.key === 'ArrowUp') c.y -= d; if (e.key === 'ArrowDown') c.y += d;
    e.preventDefault(); dirty = true; drawCanvas(true);
  }
});
document.addEventListener('input', e => {
  const el = e.target; if (!el || el.type !== 'number' || el.max === '' || el.value === '') return;
  const v = parseFloat(String(el.value).replace(',', '.'));
  if (Number.isFinite(v) && v > +el.max) { el.value = el.max; toast(el.dataset.maxMsg || tl(`Nilai paling besar ${fmtInt(+el.max)}.`, `The maximum is ${fmtInt(+el.max)}.`)); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'file-input' || el.id === 'project-input') { const f = el.files && el.files[0]; if (f) loadFile(f); el.value = ''; return; }
  if (el.dataset && el.dataset.bind) { onBound(el); return; }
  if (el.dataset && el.dataset.change && changes[el.dataset.change]) changes[el.dataset.change](el, e);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.input === 'item-filter') { state.ui.itemFilter = el.value; renderItems(); }
  if (el.id === 'project-name') { state.name = el.value.trim() || UNTITLED(); dirty = true; }
});
document.addEventListener('dragstart', e => {
  const li = e.target.closest ? e.target.closest('li[data-item]') : null; if (!li) return;
  const name = li.dataset.item, items = state.ui.checked.has(name) ? Array.from(state.ui.checked) : [name];
  e.dataTransfer.setData('application/x-sembada-items', JSON.stringify(items)); e.dataTransfer.setData('text/plain', items.join(', ')); e.dataTransfer.effectAllowed = 'copy';
});
const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
document.addEventListener('dragover', e => { if (hasFiles(e)) { e.preventDefault(); const dz = $('#drop'); if (dz) dz.classList.add('over'); } });
document.addEventListener('dragleave', e => { const dz = $('#drop'); if (dz && (e.target === dz || !dz.contains(e.relatedTarget))) dz.classList.remove('over'); });
document.addEventListener('drop', e => { if (hasFiles(e) && e.dataTransfer.files.length) { e.preventDefault(); const dz = $('#drop'); if (dz) dz.classList.remove('over'); loadFile(e.dataTransfer.files[0]); } });
if (!NATIVE) window.addEventListener('beforeunload', e => { if (dirty && state.data) { e.preventDefault(); e.returnValue = ''; } });

Object.assign(actions, HOME_ACTIONS, VIZ_ACTIONS, DG_ACTIONS); Object.assign(changes, HOME_CHANGES, DG_CHANGES);
{ const st = actions['set-theme']; if (st) actions['set-theme'] = (el, e) => { st(el, e); syncThemeSeg(); }; }
/* ================================================================ init */
{ let t = 'light'; try { t = localStorage.getItem('sembada-theme') || 'light'; } catch (e) { /* storage unavailable */ } applyTheme(t === 'auto' ? null : t); }
try { const l = localStorage.getItem('sembada-lang'); if (l === 'en' || l === 'id') state.view.lang = l; } catch (e) { /* storage unavailable */ }
I18N.lang = state.view.lang; if (isUntitled(state.name)) state.name = UNTITLED();
normalizeInfo();
applyScenery();
render();
