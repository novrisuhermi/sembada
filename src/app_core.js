/* ================================================================ utilities */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const tick = () => new Promise(r => setTimeout(r, 0));
let uidCounter = 0;
const uid = p => p + (++uidCounter).toString(36) + Math.random().toString(36).slice(2, 6);

function fmt(x, d) {
  if (x === null || x === undefined || Number.isNaN(x)) return '–';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '-∞';
  d = d === undefined ? state.view.decimals : d;
  let s = x.toFixed(d);
  if (/^-0[.,]?0*$/.test(s)) s = s.slice(1);
  return state.view.comma ? s.replace('.', ',') : s;
}
const fmtP = p => fmt(p, 3);
const fmtPtxt = p => (p < 0.001 ? 'p < ' + fmt(0.001, 3) : 'p = ' + fmt(p, 3));
const fmtInt = n => Number(n).toLocaleString(LOC());
const dec = x => (state.view.comma ? String(x).replace('.', ',') : String(x));
const UNTITLED = () => tl('Proyek tanpa judul', 'Untitled project');
const isUntitled = n => !n || n === 'Proyek tanpa judul' || n === 'Untitled project';

function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || ''); el.setAttribute('role', kind === 'err' ? 'alert' : 'status'); el.textContent = msg;
  const box = $('#toasts'); while (box.children.length >= 3) box.firstChild.remove(); box.appendChild(el);
  setTimeout(() => el.remove(), kind === 'err' ? 7000 : 3200);
}
/* desktop bridge: when packaged with Neutralinojs, use native Save/Open dialogs */
const NATIVE = (() => { try { if (typeof Neutralino !== 'undefined' && Neutralino.init) { Neutralino.init(); return true; } } catch (e) { /* not desktop */ } return false; })();
const nlErr = e => (e && e.message ? e.message : typeof e === 'string' ? e : JSON.stringify(e));
const SAVE_FILTERS = () => ({ xlsx: ['Excel', ['xlsx']], html: [tl('Laporan HTML', 'HTML report'), ['html']], csv: ['CSV', ['csv']], svg: [tl('Gambar SVG', 'SVG image'), ['svg']], png: [tl('Gambar PNG', 'PNG image'), ['png']], json: [tl('Proyek SEMbada', 'SEMbada project'), ['json']], docx: [tl('Dokumen Word', 'Word document'), ['docx']], pptx: [tl('Presentasi PowerPoint', 'PowerPoint presentation'), ['pptx']], zip: [tl('Arsip ZIP', 'ZIP archive'), ['zip']] });
async function download(name, data, mime) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
  if (NATIVE) {
    try {
      const ext = (name.split('.').pop() || '').toLowerCase(), f = SAVE_FILTERS()[ext];
      let path = await Neutralino.os.showSaveDialog(tl('Simpan file', 'Save file'), { defaultPath: name, filters: f ? [{ name: f[0], extensions: f[1] }] : [] });
      if (!path) return false;
      if (f && !path.toLowerCase().endsWith('.' + ext)) path += '.' + ext;
      await Neutralino.filesystem.writeBinaryFile(path, await blob.arrayBuffer());
      toast(tl('Tersimpan: ', 'Saved: ') + path, 'ok'); return true;
    } catch (e) { toast(tl('Gagal menyimpan file: ', 'Could not save the file: ') + nlErr(e), 'err'); return false; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  return true;
}
async function pickFile(kind) {
  if (!NATIVE) { $(kind === 'project' ? '#project-input' : '#file-input').click(); return; }
  try {
    const filters = kind === 'project' ? [{ name: tl('Proyek SEMbada', 'SEMbada project'), extensions: ['json'] }] : [{ name: tl('Data Excel atau CSV', 'Excel or CSV data'), extensions: ['xlsx', 'xlsm', 'csv', 'tsv', 'txt'] }, { name: tl('Proyek SEMbada', 'SEMbada project'), extensions: ['json'] }];
    const sel = await Neutralino.os.showOpenDialog(kind === 'project' ? tl('Buka proyek SEMbada', 'Open SEMbada project') : tl('Pilih file data', 'Choose a data file'), { filters, multiSelections: false });
    if (!sel || !sel.length) return;
    const buf = await Neutralino.filesystem.readBinaryFile(sel[0]);
    await loadFile(new File([buf], sel[0].split(/[\\/]/).pop()));
  } catch (e) { toast(tl('Gagal membuka file: ', 'Could not open the file: ') + nlErr(e), 'err'); }
}
async function copyRich(html, text) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })]);
      return true;
    }
  } catch (e) { /* try next */ }
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; } } catch (e) { /* try next */ }
  const div = document.createElement('div'); div.contentEditable = 'true'; div.style.cssText = 'position:fixed;left:-9999px;top:0'; div.innerHTML = html; document.body.appendChild(div);
  const range = document.createRange(); range.selectNodeContents(div); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  sel.removeAllRanges(); div.remove(); return ok;
}
function safeFile(s) { return String(s || 'proyek').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'proyek'; }

/* ================================================================ state */
const DEFAULT_SETTINGS = {
  algorithm: 'pls', scheme: 'path', maxIter: 300, stopExp: 7,
  missing: 'mean', missingCode: '',
  boot: { run: true, B: 5000, seed: 123, ci: 'percentile', tails: 'two', alpha: 0.05 },
  predict: { run: true, folds: 10, reps: 10, approach: 'DA', seed: 123 },
  ipma: { run: true, target: '' },
  mga: { run: false, column: '', a: '', b: '', perms: 1000 },
  ssize: { beta: 0.2, alpha: 0.05 }
};
function newInfo() { return { title: { id: '', en: '' }, objective: { id: '', en: '' }, keywords: { id: '', en: '' }, authors: [{ name: '', dept: '', inst: '', city: '', email: '' }], cons: {} }; }
const state = {
  name: 'Proyek tanpa judul',
  source: null,
  data: null,
  model: { constructs: [], paths: [], moderations: [] },
  info: newInfo(), projectId: null,
  settings: clone(DEFAULT_SETTINGS),
  results: null,
  view: { decimals: 3, comma: false, diagram: 'coefp', lang: 'en', exportLang: 'auto' },
  ui: { step: 'home', section: 'summary', selected: null, connect: false, connectFrom: null, itemFilter: '', checked: new Set() },
  run: null
};
let dirty = false;
const exportLang = () => (state.view.exportLang === 'en' || state.view.exportLang === 'id' ? state.view.exportLang : state.view.lang);

/* ================================================================ data */
function numericNames() { return state.data ? state.data.columns.filter(c => c.numeric).map(c => c.name) : []; }
function colByName(name) { return state.data ? state.data.columns.find(c => c.name === name) : null; }
function setData(parsed, source) {
  state.data = parsed; state.source = Object.assign({}, state.source && state.source.keepWb ? state.source : {}, source);
  const valid = new Set(numericNames()); let removed = 0;
  state.model.constructs.forEach(c => { const before = c.items.length; c.items = c.items.filter(i => valid.has(i)); removed += before - c.items.length; });
  state.ui.checked = new Set();
  state.results = null; dirty = true;
  if (removed) toast(tl(`${removed} indikator di model dilepas karena tidak ada di data baru.`, `${removed} indicator(s) were removed from the model because they are not in the new data.`));
}
function readText(file) {
  return file.arrayBuffer().then(buf => {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { return new TextDecoder('windows-1252').decode(buf); }
  });
}
async function loadFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  try {
    if (ext === 'xlsx' || ext === 'xlsm') {
      const wb = await IO.readXLSX(await file.arrayBuffer());
      let idx = 0;
      for (let i = 0; i < wb.sheetNames.length; i++) { const rows = await wb.sheet(i); if (rows.length > 1) { idx = i; break; } }
      const rows = await wb.sheet(idx);
      setData(IO.rowsToColumns(rows, false), { fileName: file.name, kind: 'xlsx', sheetNames: wb.sheetNames, sheetIndex: idx });
      state.source.wb = wb;
    } else if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
      const p = IO.parseCSV(await readText(file));
      setData(IO.rowsToColumns(p.rows, p.decimalComma), { fileName: file.name, kind: 'csv', delimiter: p.delimiter, decimalComma: p.decimalComma });
    } else if (ext === 'json' || ext === 'sembada') {
      loadProject(JSON.parse(await readText(file)), file.name); return;
    } else if (ext === 'xls') {
      throw new Error(tl('Format .xls (Excel 97–2003) belum didukung. Buka di Excel, lalu Simpan Sebagai .xlsx atau CSV.', 'The .xls format (Excel 97–2003) is not supported. Open it in Excel and use Save As .xlsx or CSV.'));
    } else if (ext === 'sav' || ext === 'dta') {
      throw new Error(tl('File SPSS/Stata belum didukung. Ekspor dulu ke .xlsx atau CSV.', 'SPSS/Stata files are not supported. Export the data to .xlsx or CSV first.'));
    } else throw new Error(tl('Jenis file tidak dikenali. Gunakan .xlsx atau .csv.', 'Unrecognized file type. Use .xlsx or .csv.'));
    if (isUntitled(state.name)) state.name = file.name.replace(/\.[^.]+$/, '');
    state.ui.step = 'data';
    render();
    const d = state.data;
    toast(tl(`${fmtInt(d.nRows)} baris dan ${d.columns.length} kolom terbaca dari ${file.name}.`, `Read ${fmtInt(d.nRows)} rows and ${d.columns.length} columns from ${file.name}.`), 'ok');
  } catch (e) {
    console.error(e); toast(trMsg(e.message) || tl('File tidak dapat dibaca.', 'The file could not be read.'), 'err');
  }
}
async function switchSheet(i) {
  const wb = state.source && state.source.wb; if (!wb) return;
  try {
    const rows = await wb.sheet(i), src = state.source;
    setData(IO.rowsToColumns(rows, false), { fileName: src.fileName, kind: 'xlsx', sheetNames: src.sheetNames, sheetIndex: i });
    state.source.wb = wb; render();
  } catch (e) { toast(trMsg(e.message), 'err'); }
}
function loadSample() {
  const p = IO.parseCSV($('#sample-data').textContent.trim());
  setData(IO.rowsToColumns(p.rows, false), { fileName: tl('contoh-delone-mclean.csv', 'example-delone-mclean.csv'), kind: 'sample' });
  state.name = tl('Contoh model kesuksesan SI', 'IS success model example');
  render();
  toast(tl('Data contoh dimuat: 150 responden simulasi, 21 item Likert 1–5.', 'Sample data loaded: 150 simulated respondents, 21 Likert items (1–5).'), 'ok');
}

/* ================================================================ project files */
function projectObject() {
  return {
    app: 'SEMbada', version: 1, savedAt: new Date().toISOString(), name: state.name,
    source: state.source ? { fileName: state.source.fileName, kind: state.source.kind, sheet: state.source.sheetNames ? state.source.sheetNames[state.source.sheetIndex] : null } : null,
    data: state.data ? { nRows: state.data.nRows, columns: state.data.columns.map(c => ({ name: c.name, numeric: c.numeric, values: c.numeric ? c.values.map(v => (Number.isNaN(v) ? null : v)) : null, raw: c.numeric ? null : c.raw })) } : null,
    model: state.model, settings: state.settings, view: state.view, info: state.info, id: state.projectId
  };
}
async function saveProject() {
  const ok = await download(safeFile(state.name) + '.sembada.json', JSON.stringify(projectObject()), 'application/json');
  if (!ok) return; dirty = false;
  if (!NATIVE) toast(tl('Proyek disimpan sebagai file .sembada.json. Buka kembali lewat tombol Buka proyek.', 'Project saved as a .sembada.json file. Reopen it with Open project.'), 'ok');
}
function loadProject(obj, fileName) {
  if (!obj || obj.app !== 'SEMbada') { toast(tl('File ini bukan proyek SEMbada.', 'This file is not a SEMbada project.'), 'err'); return; }
  state.name = obj.name || tl('Proyek', 'Project');
  state.data = obj.data ? {
    nRows: obj.data.nRows,
    columns: obj.data.columns.map(c => {
      const values = c.numeric ? c.values.map(v => (v === null ? NaN : v)) : new Array(obj.data.nRows).fill(NaN);
      return { name: c.name, numeric: c.numeric, values, raw: c.raw || null, nMissing: values.filter(v => Number.isNaN(v)).length, nText: c.numeric ? 0 : obj.data.nRows, firstText: null };
    })
  } : null;
  state.source = obj.source ? { fileName: obj.source.fileName, kind: 'project', sheet: obj.source.sheet } : null;
  state.model = obj.model || { constructs: [], paths: [] };
  state.model.constructs.forEach(c => { if (!c.side) c.side = 'auto'; });
  if (!Array.isArray(state.model.moderations)) state.model.moderations = [];
  state.info = Object.assign(newInfo(), obj.info || {}); if (!Array.isArray(state.info.authors) || !state.info.authors.length) state.info.authors = newInfo().authors; if (!state.info.cons) state.info.cons = {};
  state.projectId = obj.id || uid('p');
  state.settings = Object.assign(clone(DEFAULT_SETTINGS), obj.settings || {}); if (state.settings.boot) state.settings.boot.B = clampBoot(state.settings.boot.B);
  state.settings.boot = Object.assign(clone(DEFAULT_SETTINGS.boot), (obj.settings || {}).boot || {});
  state.settings.predict = Object.assign(clone(DEFAULT_SETTINGS.predict), (obj.settings || {}).predict || {});
  ['ipma', 'mga', 'ssize'].forEach(k => { state.settings[k] = Object.assign(clone(DEFAULT_SETTINGS[k]), (obj.settings || {})[k] || {}); });
  if (obj.view) { const keep = state.view.lang; state.view = Object.assign(state.view, obj.view); state.view.lang = keep; }
  state.results = null; state.ui.selected = null; state.ui.step = state.model.constructs.length ? 'model' : 'data';
  dirty = false; render(); if (typeof recentSave === 'function') recentSave();
  toast(tl(`Proyek "${state.name}" dibuka${fileName ? ' dari ' + fileName : ''}. Klik Hitung untuk memperoleh hasil.`, `Project "${state.name}" opened${fileName ? ' from ' + fileName : ''}. Click Calculate to get the results.`), 'ok');
}

/* ================================================================ model operations */
const M = () => state.model;
const conById = id => M().constructs.find(c => c.id === id);
const conByName = n => M().constructs.find(c => c.name === n);
function ownerOf(item) { return M().constructs.find(c => c.items.includes(item)); }
function uniqueName(base) {
  base = String(base || tl('Konstruk', 'Construct')).trim() || tl('Konstruk', 'Construct');
  if (!conByName(base)) return base;
  let k = 2; while (conByName(base + ' ' + k)) k++; return base + ' ' + k;
}
function changed() { dirty = true; }
function detachItem(it) { M().constructs.forEach(c => { c.items = c.items.filter(x => x !== it); }); }
function addConstruct(opt) {
  const items = (opt.items || []).filter(i => numericNames().includes(i));
  items.forEach(detachItem);
  const c = { id: uid('c'), name: uniqueName(opt.name), mode: opt.mode || 'reflective', items, x: Math.round(opt.x === undefined ? 320 : opt.x), y: Math.round(opt.y === undefined ? 260 : opt.y), side: 'auto' };
  M().constructs.push(c); changed(); return c;
}
function assignItems(cid, items) {
  const c = conById(cid); if (!c) return;
  items.filter(i => numericNames().includes(i)).forEach(i => { if (!c.items.includes(i)) { detachItem(i); c.items.push(i); } });
  changed();
}
function removeConstruct(id) {
  M().constructs = M().constructs.filter(c => c.id !== id);
  M().paths = M().paths.filter(p => p.from !== id && p.to !== id);
  M().constructs.forEach(h => { if (isHoc(h)) h.locs = h.locs.filter(l => l !== id); });
  M().moderations = (M().moderations || []).filter(m => m.moderator !== id && M().paths.some(p => p.id === m.path));
  if (state.info && state.info.cons) delete state.info.cons[id];
  if (state.ui.selected && state.ui.selected.id === id) state.ui.selected = null;
  changed();
}
function adjacency(model, extra) {
  const cs = model.constructs, idx = new Map(cs.map((c, i) => [c.id, i])), L = cs.length;
  const D = cs.map(() => new Array(L).fill(0));
  model.paths.concat(extra ? [extra] : []).forEach(p => { if (idx.has(p.from) && idx.has(p.to)) D[idx.get(p.from)][idx.get(p.to)] = 1; });
  return { D, idx };
}
function addPath(from, to) {
  const a = conById(from), b = conById(to);
  if (!a || !b) return false;
  if (from === to) { toast(tl('Jalur harus menghubungkan dua konstruk yang berbeda.', 'A path must connect two different constructs.'), 'err'); return false; }
  if (M().paths.some(p => p.from === from && p.to === to)) { toast(tl(`Jalur ${a.name} → ${b.name} sudah ada.`, `The path ${a.name} → ${b.name} already exists.`)); return false; }
  if (M().paths.some(p => p.from === to && p.to === from)) { toast(tl(`Sudah ada jalur ${b.name} → ${a.name}. PLS-SEM tidak mendukung hubungan timbal balik.`, `A path ${b.name} → ${a.name} already exists. PLS-SEM does not support reciprocal relationships.`), 'err'); return false; }
  const { D } = adjacency(M(), { from, to });
  if (PLS.hasCycle(D)) { toast(tl(`Jalur ${a.name} → ${b.name} membentuk putaran (siklus). PLS-SEM hanya mendukung model rekursif.`, `The path ${a.name} → ${b.name} would create a cycle. PLS-SEM supports recursive models only.`), 'err'); return false; }
  M().paths.push({ id: uid('p'), from, to }); changed(); return true;
}
function removePath(id) { M().paths = M().paths.filter(p => p.id !== id); M().moderations = (M().moderations || []).filter(m => m.path !== id); if (state.ui.selected && state.ui.selected.id === id) state.ui.selected = null; changed(); }
function reversePath(id) {
  const p = M().paths.find(x => x.id === id); if (!p) return;
  const rest = { constructs: M().constructs, paths: M().paths.filter(x => x.id !== id) };
  const { D } = adjacency(rest, { from: p.to, to: p.from });
  if (PLS.hasCycle(D)) { toast(tl('Membalik arah jalur ini akan membentuk siklus.', 'Reversing this path would create a cycle.'), 'err'); return; }
  const t = p.from; p.from = p.to; p.to = t; changed();
}
function hypotheses(model) {
  const m = model || M();
  return m.paths.map((p, k) => ({ h: 'H' + (k + 1), p, from: m.constructs.find(c => c.id === p.from), to: m.constructs.find(c => c.id === p.to) })).filter(x => x.from && x.to);
}
function autoGroup() {
  const assigned = new Set(M().constructs.flatMap(c => c.items));
  const groups = new Map(), skipped = [];
  for (const name of numericNames()) {
    if (assigned.has(name)) continue;
    const m = String(name).match(/^(.+?)[\s_.\-]*(\d+)$/);
    if (!m) { skipped.push(name); continue; }
    const key = m[1].replace(/[\s_.\-]+$/, '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(name);
  }
  let made = 0, used = 0;
  groups.forEach((items, key) => {
    if (items.length < 2) { skipped.push(...items); return; }
    const ex = conByName(key);
    if (ex) assignItems(ex.id, items); else addConstruct({ name: key, items });
    made++; used += items.length;
  });
  if (!made) { toast(tl('Tidak ada kolom yang bisa dikelompokkan otomatis. Pola yang dikenali: IQ1, IQ2, … atau X1.1, X1.2, …', 'No columns could be grouped automatically. Recognized patterns: IQ1, IQ2, … or X1.1, X1.2, …')); return; }
  autoLayout(); changed();
  const sk = skipped.slice(0, 6).join(', ') + (skipped.length > 6 ? ', …' : '');
  toast(tl(`${made} konstruk disusun dari ${used} indikator.`, `${made} construct(s) created from ${used} indicators.`) + (skipped.length ? tl(` Tidak dikelompokkan: ${sk}.`, ` Not grouped: ${sk}.`) : ''), 'ok');
}
function exampleModel() {
  const want = [['IQ', ['IQ1', 'IQ2', 'IQ3', 'IQ4']], ['SQ', ['SQ1', 'SQ2', 'SQ3', 'SQ4']], ['SVQ', ['SV1', 'SV2', 'SV3', 'SV4']], ['US', ['US1', 'US2', 'US3']], ['ITU', ['IU1', 'IU2']], ['NB', ['NB1', 'NB2', 'NB3', 'NB4']]];
  const have = new Set(numericNames());
  if (!want.every(([, it]) => it.every(i => have.has(i)))) { toast(tl('Model contoh membutuhkan kolom IQ1–NB4 seperti pada data contoh.', 'The example model needs the columns IQ1–NB4 from the sample data.'), 'err'); return; }
  state.model = { constructs: [], paths: [], moderations: [] };
  const id = {}; want.forEach(([n, it]) => { id[n] = addConstruct({ name: n, items: it }).id; });
  [['IQ', 'ITU'], ['IQ', 'US'], ['SQ', 'ITU'], ['SQ', 'US'], ['SVQ', 'ITU'], ['SVQ', 'US'], ['US', 'ITU'], ['ITU', 'NB'], ['US', 'NB']].forEach(([a, b]) => addPath(id[a], id[b]));
  autoLayout(); state.ui.selected = null; changed();
}
function autoLayout() {
  const cs = M().constructs; if (!cs.length) return;
  const { D } = adjacency(M()); const L = cs.length;
  cs.forEach((h, hi) => { if (isHoc(h)) h.locs.forEach(l => { const li = cs.findIndex(c => c.id === l); if (li >= 0) D[li][hi] = 1; }); });
  const order = PLS.topoOrder(D) || cs.map((_, i) => i);
  const layer = new Array(L).fill(0);
  for (const j of order) for (let i = 0; i < L; i++) if (D[i][j]) layer[j] = Math.max(layer[j], layer[i] + 1);
  const connected = i => D[i].some(Boolean) || D.some(r => r[i]);
  const nl = Math.max(...layer) + 1, layers = Array.from({ length: nl }, () => []);
  order.forEach(j => { if (connected(j)) layers[layer[j]].push(j); });
  const iso = order.filter(j => !connected(j));
  const SPY = 170, X0 = 250, DX = 236, y = new Array(L).fill(0);
  layers[0].forEach((j, k) => { y[j] = (k - (layers[0].length - 1) / 2) * SPY; });
  for (let l = 1; l < nl; l++) {
    const ly = layers[l];
    const want = j => { const pr = []; for (let i = 0; i < L; i++) if (D[i][j]) pr.push(y[i]); return pr.reduce((s, v) => s + v, 0) / pr.length; };
    ly.forEach(j => { y[j] = want(j); });
    ly.sort((a, b) => y[a] - y[b]);
    for (let k = 1; k < ly.length; k++) if (y[ly[k]] - y[ly[k - 1]] < SPY) y[ly[k]] = y[ly[k - 1]] + SPY;
    const shift = ly.reduce((s, j) => s + want(j), 0) / ly.length - ly.reduce((s, j) => s + y[j], 0) / ly.length;
    ly.forEach(j => { y[j] += shift; });
    if (ly.length === 1 && l < nl - 1) y[ly[0]] += (l % 2 ? 1 : -1) * SPY * 0.48;
  }
  layers.forEach((ly, l) => ly.forEach(j => { cs[j].x = X0 + l * DX; cs[j].y = Math.round(320 + y[j]); }));
  iso.forEach((j, k) => { cs[j].x = X0 + nl * DX + 40; cs[j].y = 120 + k * 150; });
  cs.forEach(c => { c.side = 'auto'; });
}
function validateModel() {
  const errors = [], warns = [], info = [];
  if (!state.data) { errors.push(tl('Belum ada data. Muat file di langkah Data.', 'No data yet. Load a file in the Data step.')); return { errors, warns, info }; }
  const cs = M().constructs;
  if (cs.length < 2) errors.push(tl('Model membutuhkan minimal dua konstruk.', 'The model needs at least two constructs.'));
  if (!M().paths.length) errors.push(tl('Belum ada jalur antar konstruk. Gunakan "Gambar jalur" atau panel kanan.', 'There are no paths between constructs yet. Use "Draw paths" or the right-hand panel.'));
  const nn = new Set(numericNames()), emptyC = [], unconC = [];
  cs.forEach(c => {
    if (!c.items.length && !isHoc(c)) emptyC.push(c.name);
    const bad = c.items.filter(i => !nn.has(i)); if (bad.length) errors.push(tl(`Indikator ${bad.join(', ')} pada ${c.name} bukan kolom angka.`, `Indicator(s) ${bad.join(', ')} in ${c.name} are not numeric columns.`));
    if (!M().paths.some(p => p.from === c.id || p.to === c.id) && !locOwner(M(), c.id)) unconC.push(c.name);
    if (c.items.length === 1) warns.push(tl(`${c.name} hanya punya 1 indikator (single-item); reliabilitas dianggap 1.`, `${c.name} has a single indicator; its reliability is set to 1.`));
    if (c.mode === 'formative' && c.items.length >= state.data.nRows - 1) errors.push(tl(`Konstruk formatif ${c.name} punya indikator terlalu banyak untuk jumlah responden.`, `Formative construct ${c.name} has too many indicators for the number of respondents.`));
  });
  if (emptyC.length) errors.push(emptyC.length === 1 ? tl(`Konstruk ${emptyC[0]} belum memiliki indikator. Seret indikator ke konstruk ini di langkah Model.`, `Construct ${emptyC[0]} has no indicators yet. Drag indicators onto it in the Model step.`) : tl(`${emptyC.length} konstruk belum memiliki indikator: ${emptyC.join(', ')}. Seret indikator ke konstruk tersebut di langkah Model.`, `${emptyC.length} constructs have no indicators yet: ${emptyC.join(', ')}. Drag indicators onto them in the Model step.`));
  if (unconC.length) errors.push(unconC.length === 1 ? tl(`Konstruk ${unconC[0]} belum terhubung ke jalur mana pun. Hubungkan dengan jalur atau hapus konstruk ini.`, `Construct ${unconC[0]} is not connected to any path. Connect it with a path or remove it.`) : tl(`${unconC.length} konstruk belum terhubung ke jalur mana pun: ${unconC.join(', ')}. Hubungkan dengan jalur atau hapus konstruk tersebut.`, `${unconC.length} constructs are not connected to any path: ${unconC.join(', ')}. Connect them with paths or remove them.`));
  extValidate(errors, warns, info);
  const names = cs.map(c => c.name), dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) errors.push(tl(`Nama konstruk ganda: ${[...new Set(dup)].join(', ')}.`, `Duplicate construct names: ${[...new Set(dup)].join(', ')}.`));
  if (state.data && !errors.length) {
    const n = state.data.nRows; let maxArrows = 0;
    cs.forEach(c => { const inc = M().paths.filter(p => p.to === c.id).length; maxArrows = Math.max(maxArrows, inc, c.mode === 'formative' ? c.items.length : 0); });
    if (n < 10 * maxArrows) info.push(tl(`Aturan praktis "10 kali": n = ${n} lebih kecil dari 10 × ${maxArrows} panah terbanyak yang menuju satu konstruk. Tafsirkan hasil dengan hati-hati.`, `"10-times" rule of thumb: n = ${n} is below 10 × ${maxArrows}, the largest number of arrows pointing at one construct. Interpret the results with caution.`));
    if (state.settings.algorithm === 'plsc' && n < 100) info.push(tl('PLSc pada sampel kecil (n < 100) rawan menghasilkan R² > 1 atau koefisien > 1.', 'PLSc with small samples (n < 100) can produce R² > 1 or coefficients > 1.'));
  }
  return { errors, warns, info };
}

/* ================================================================ diagram geometry & renderer */
const LV_RY = 31, MV_H = 22, MV_SP = 7, GAP_SIDE = 42, GAP_TB = 38;
const textW = (s, size) => String(s).length * size * 0.6 + 6;
function resolveSide(model, c) {
  if (c.side && c.side !== 'auto') return c.side;
  const inc = model.paths.filter(p => p.to === c.id), out = model.paths.filter(p => p.from === c.id);
  if (!inc.length) return 'left';
  if (!out.length) return 'right';
  const nb = inc.map(p => p.from).concat(out.map(p => p.to)).map(id => model.constructs.find(k => k.id === id)).filter(Boolean);
  const my = nb.reduce((s, k) => s + k.y, 0) / nb.length;
  return c.y <= my ? 'top' : 'bottom';
}
const BOOT_MIN = 100, BOOT_MAX = 10000, clampBoot = v => Math.max(BOOT_MIN, Math.min(BOOT_MAX, Math.round(+v || 5000)));
function geometry(model, st) {
  const f = st ? (+st.font || 1) : 1, circ = !!(st && st.shape === 'circle'), mvOn = !st || st.mv !== false;
  const cons = model.constructs.map(c => {
    const side = resolveSide(model, c), inner = st && st.names === 'full' ? '' : c.name;
    let rx, ry;
    if (circ) rx = ry = Math.max(30 * f, textW(inner || '0.000', 14 * f) / 2 + 12 * f);
    else { rx = Math.max(44 * f, textW(inner || 'R² 0.000', 14 * f) / 2 + 16 * f); ry = LV_RY * f; }
    const bh = MV_H * f, bsp = MV_SP * f;
    const boxes = mvOn ? c.items.map(name => ({ name, w: Math.max(40 * f, textW(name, 11 * f) + 10 * f), h: bh })) : [];
    if (side === 'left' || side === 'right') {
      const sp = bh + bsp, tot = boxes.length * sp - bsp;
      boxes.forEach((b, k) => { b.y = c.y - tot / 2 + k * sp + bh / 2; b.x = side === 'left' ? c.x - rx - GAP_SIDE - b.w / 2 : c.x + rx + GAP_SIDE + b.w / 2; });
    } else {
      const tot = boxes.reduce((s, b) => s + b.w, 0) + bsp * (boxes.length - 1); let x0 = c.x - tot / 2;
      boxes.forEach(b => { b.x = x0 + b.w / 2; x0 += b.w + bsp; b.y = side === 'top' ? c.y - ry - GAP_TB - bh / 2 : c.y + ry + GAP_TB + bh / 2; });
    }
    let nl = null;
    if (st && st.names && st.names !== 'abbr') {
      const full = (typeof conFull === 'function' ? conFull(c.id) : '') || (st.names === 'full' ? c.name : '');
      if (full) {
        const lines = wrapWords(full, 16), lh = 15 * f, w = Math.max(...lines.map(t => textW(t, 12.5 * f))) + 6, h = lines.length * lh;
        let pos = st.namePos || 'auto'; if (pos === 'auto') pos = side === 'bottom' && boxes.length ? 'above' : 'below';
        let y1;
        if (pos === 'above') { const top = side === 'top' && boxes.length ? Math.min(...boxes.map(b => b.y - b.h / 2)) - 2 : c.y - ry; y1 = top - 6 * f - h; }
        else { const bot = side === 'bottom' && boxes.length ? Math.max(...boxes.map(b => b.y + b.h / 2)) + 2 : c.y + ry; y1 = bot + 6 * f; }
        nl = { lines, x: c.x, y1, lh, w, h };
      }
    }
    return { c, rx, ry, side, boxes, nl };
  });
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  cons.forEach(g => { x1 = Math.min(x1, g.c.x - g.rx); x2 = Math.max(x2, g.c.x + g.rx); y1 = Math.min(y1, g.c.y - g.ry); y2 = Math.max(y2, g.c.y + g.ry + 16 * f); g.boxes.forEach(b => { x1 = Math.min(x1, b.x - b.w / 2); x2 = Math.max(x2, b.x + b.w / 2); y1 = Math.min(y1, b.y - b.h / 2); y2 = Math.max(y2, b.y + b.h / 2); }); if (g.nl) { x1 = Math.min(x1, g.nl.x - g.nl.w / 2); x2 = Math.max(x2, g.nl.x + g.nl.w / 2); y1 = Math.min(y1, g.nl.y1); y2 = Math.max(y2, g.nl.y1 + g.nl.h); } });
  if (!cons.length) { x1 = 0; y1 = 0; x2 = 1000; y2 = 600; }
  const n = cons.length || 1, cx = cons.reduce((t, g) => t + g.c.x, 0) / n, cy = cons.reduce((t, g) => t + g.c.y, 0) / n;
  return { cons, byId: new Map(cons.map(g => [g.c.id, g])), bounds: { x1, y1, x2, y2 }, f, cx, cy, curve: st ? (st.curve || 'auto') : 'auto', bend: st ? (+st.bend || 0.1) : 0.1 };
}
function ellPt(g, tx, ty) {
  const dx = tx - g.c.x, dy = ty - g.c.y; if (!dx && !dy) return { x: g.c.x, y: g.c.y };
  const t = 1 / Math.sqrt((dx / g.rx) ** 2 + (dy / g.ry) ** 2); return { x: g.c.x + dx * t, y: g.c.y + dy * t };
}
function segHitsEllipse(ax, ay, bx, by, g, pad) {
  const kx = 1 / (g.rx + pad), ky = 1 / (g.ry + pad);
  const px = (ax - g.c.x) * kx, py = (ay - g.c.y) * ky, qx = (bx - g.c.x) * kx, qy = (by - g.c.y) * ky;
  const dx = qx - px, dy = qy - py, l2 = dx * dx + dy * dy; let t = l2 ? -(px * dx + py * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
  const cx = px + t * dx, cy = py + t * dy; return cx * cx + cy * cy < 1 && t > 0.02 && t < 0.98;
}
function edgeGeom(G, p) {
  const a = G.byId.get(p.from), b = G.byId.get(p.to); if (!a || !b) return null;
  const mode = p.curve || G.curve || 'auto';
  const straight = () => {
    const s = ellPt(a, b.c.x, b.c.y), e = ellPt(b, a.c.x, a.c.y);
    return { d: `M${s.x.toFixed(1)},${s.y.toFixed(1)} L${e.x.toFixed(1)},${e.y.toFixed(1)}`, lx: (s.x + e.x) / 2, ly: (s.y + e.y) / 2, pt: t => ({ x: s.x + (e.x - s.x) * t, y: s.y + (e.y - s.y) * t }) };
  };
  const quad = (cx, cy) => {
    const s = ellPt(a, cx, cy), e = ellPt(b, cx, cy);
    return { d: `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`, lx: 0.25 * s.x + 0.5 * cx + 0.25 * e.x, ly: 0.25 * s.y + 0.5 * cy + 0.25 * e.y,
      pt: t => ({ x: (1 - t) * (1 - t) * s.x + 2 * (1 - t) * t * cx + t * t * e.x, y: (1 - t) * (1 - t) * s.y + 2 * (1 - t) * t * cy + t * t * e.y }) };
  };
  if (mode === 'straight') return straight();
  const mx = (a.c.x + b.c.x) / 2, my = (a.c.y + b.c.y) / 2, dx = b.c.x - a.c.x, dy = b.c.y - a.c.y, len = Math.hypot(dx, dy) || 1;
  const bend = 2 * (G.bend || 0.1) * len; /* the arc's peak sits bend/2 from the chord */
  if (mode === 'left' || mode === 'right') { const sg = mode === 'left' ? 1 : -1; return quad(mx + sg * dy / len * bend, my - sg * dx / len * bend); }
  let nx = -dy / len, ny = dx / len;
  const obst = G.cons.filter(g => g !== a && g !== b && segHitsEllipse(a.c.x, a.c.y, b.c.x, b.c.y, g, 14));
  if (obst.length) {
    const o = obst[0], side = (o.c.x - a.c.x) * nx + (o.c.y - a.c.y) * ny; if (side > 0) { nx = -nx; ny = -ny; }
    const off = Math.max(90, o.ry * 2 + 60, mode === 'curved' ? bend : 0); return quad(mx + nx * off, my + ny * off);
  }
  if (mode !== 'curved') return straight();
  if ((G.cx - mx) * nx + (G.cy - my) * ny > 0) { nx = -nx; ny = -ny; } /* gentle arc bowing away from the centre of the diagram */
  return quad(mx + nx * bend, my + ny * bend);
}
/* label placement: manual offsets from model.labels first; otherwise the first spot along the edge that clears ellipses, indicator boxes, and earlier labels */
function placeLabels(labels, G, model) {
  const man = model.labels || {}, obst = [], placed = [];
  G.cons.forEach(g => { obst.push([g.c.x - g.rx, g.c.y - g.ry, g.c.x + g.rx, g.c.y + g.ry]); g.boxes.forEach(b => obst.push([b.x - b.w / 2, b.y - b.h / 2, b.x + b.w / 2, b.y + b.h / 2])); if (g.nl) obst.push([g.nl.x - g.nl.w / 2, g.nl.y1, g.nl.x + g.nl.w / 2, g.nl.y1 + g.nl.h]); });
  const area = (r, list) => list.reduce((a, q) => a + Math.max(0, Math.min(r[2], q[2]) - Math.max(r[0], q[0])) * Math.max(0, Math.min(r[3], q[3]) - Math.max(r[1], q[1])), 0);
  labels.forEach(l => {
    l.bx = l.x; l.by = l.y;
    const w = textW(l.txt, 11.5 * (G.f || 1)) + 4, h = 18 * (G.f || 1), rect = (x, y) => [x - w / 2 - 3, y - h / 2 - 2, x + w / 2 + 3, y + h / 2 + 2], m = l.lid ? man[l.lid] : null;
    if (m && Number.isFinite(m.dx)) { l.x += m.dx; l.y += m.dy; }
    else if (l.pt) {
      let best = null;
      for (const t of [0.5, 0.4, 0.6, 0.33, 0.67, 0.45, 0.55, 0.27, 0.73, 0.22, 0.78]) {
        const p = l.pt(t), r = rect(p.x, p.y), pen = Math.abs(t - 0.5) * 30, cost = area(r, obst) * 2 + area(r, placed) * 4 + pen;
        if (!best || cost < best.cost) best = { cost, x: p.x, y: p.y };
        if (cost <= pen + 0.5) break;
      }
      l.x = best.x; l.y = best.y;
    }
    placed.push(rect(l.x, l.y));
  });
}
function labelSVG(x, y, text, cls, f, plain) {
  f = f || 1; const w = textW(text, (cls === 'mvl' ? 10 : 11.5) * f) + 4 * f, h = (cls === 'mvl' ? 14 : 18) * f;
  return `<g class="lab ${cls}${plain ? ' plain' : ''}">${plain ? '' : `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>`}<text x="${x.toFixed(1)}" y="${(y + (cls === 'mvl' ? 3.5 : 4) * f).toFixed(1)}">${esc(text)}</text></g>`;
}
function diagramInner(model, G, opts) {
  const idp = opts.idp || 'd';
  const mk = (id, cls, size) => `<marker id="${idp}${id}" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="${size}" markerHeight="${size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="${cls}"/></marker>`;
  const st = opts.style || null, f = G.f || 1, plain = !!(st && st.box === false), ms = st ? Math.max(0.75, Math.sqrt(+st.line || 1)) * Math.sqrt(f) : 1;
  let s = `<defs>${mk('a', 'ah', 11 * ms)}${mk('m', 'ah-mv', 8 * ms)}${mk('s', 'ah-sel', 12 * ms)}</defs>`;
  const V = opts.values;
  G.cons.forEach(g => {
    const form = g.c.mode === 'formative';
    g.boxes.forEach(b => {
      const anchor = g.side === 'left' ? { x: b.x + b.w / 2, y: b.y } : g.side === 'right' ? { x: b.x - b.w / 2, y: b.y } : g.side === 'top' ? { x: b.x, y: b.y + b.h / 2 } : { x: b.x, y: b.y - b.h / 2 };
      const e = ellPt(g, anchor.x, anchor.y);
      const [p1, p2] = form ? [anchor, e] : [e, anchor];
      s += `<path class="mv-edge" d="M${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)}" marker-end="url(#${idp}m)"/>`;
      if (V && V.mv && V.mv.has(b.name) && !(st && st.loadings === false)) { const t = 0.36; s += labelSVG(anchor.x + (e.x - anchor.x) * t, anchor.y + (e.y - anchor.y) * t, V.mv.get(b.name), 'mvl', f, plain); }
      s += `<g class="mv"><rect x="${(b.x - b.w / 2).toFixed(1)}" y="${(b.y - b.h / 2).toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.h}" rx="3"/><text x="${b.x.toFixed(1)}" y="${(b.y + 4 * f).toFixed(1)}">${esc(b.name)}</text></g>`;
    });
  });
  const hyp = new Map(hypotheses(model).map(h => [h.p.id, h.h])), labels = [];
  model.paths.forEach(p => {
    const eg = edgeGeom(G, p); if (!eg) return;
    const sel = opts.selected && opts.selected.type === 'p' && opts.selected.id === p.id;
    const val = V && V.path ? V.path.get(p.id) : null;
    const ns = val && val.p !== undefined && val.p >= (opts.alpha || 0.05);
    s += `<g data-pid="${p.id}"><path class="hit" d="${eg.d}"/><path class="sm-edge${sel ? ' sel' : ''}${ns && !(st && st.nsDashed === false) ? ' ns' : ''}" d="${eg.d}" marker-end="url(#${idp}${sel ? 's' : 'a'})"/></g>`;
    let txt = null;
    if (val) {
      if (opts.show === 't' && val.t !== undefined) txt = 't = ' + fmt(val.t);
      else if (opts.show === 'coefp' && val.p !== undefined) txt = fmt(val.coef) + ' (' + fmtP(val.p) + ')';
      else if (opts.show === 'coefs' && val.p !== undefined) txt = fmt(val.coef) + pStars(val.p);
      else txt = fmt(val.coef);
    } else if (opts.interactive || opts.show === 'hyp') txt = hyp.get(p.id);
    if (txt) labels.push({ x: eg.lx, y: eg.ly, txt, pid: p.id, lid: p.id, pt: eg.pt });
  });
  const gOf = id => G.cons.find(g => g.c.id === id);
  model.constructs.forEach(h => {
    if (!isHoc(h)) return; const hg = gOf(h.id); if (!hg) return;
    h.locs.forEach(l => {
      const lg = gOf(l); if (!lg) return;
      const refl = h.mode !== 'formative', A = refl ? hg : lg, Bq = refl ? lg : hg, p1 = ellPt(A, Bq.c.x, Bq.c.y), p2 = ellPt(Bq, A.c.x, A.c.y);
      s += `<path class="hoc-edge" d="M${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)}" marker-end="url(#${idp}a)"/>`;
      const v = V && V.hoc ? V.hoc.get(h.id + ':' + l) : null; if (v) labels.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, txt: v, pid: '', lid: 'hoc:' + h.id + ':' + l, pt: t => ({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t }) });
    });
  });
  (model.moderations || []).forEach((m, k) => {
    const p = model.paths.find(q => q.id === m.path), mg = gOf(m.moderator); if (!p || !mg) return; const eg = edgeGeom(G, p); if (!eg) return;
    const s0 = ellPt(mg, eg.lx, eg.ly), dx = eg.lx - s0.x, dy = eg.ly - s0.y, dl = Math.hypot(dx, dy) || 1, ex = eg.lx - dx / dl * 17, ey = eg.ly - dy / dl * 17;
    s += `<path class="mod-edge" d="M${s0.x.toFixed(1)},${s0.y.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}" marker-end="url(#${idp}s)"/>`;
    const val = V && V.mod ? V.mod.get(m.id) : null; let txt = null;
    if (val) txt = opts.show === 't' && val.t !== undefined ? 't = ' + fmt(val.t) : opts.show === 'coefp' && val.p !== undefined ? fmt(val.coef) + ' (' + fmtP(val.p) + ')' : opts.show === 'coefs' && val.p !== undefined ? fmt(val.coef) + pStars(val.p) : fmt(val.coef);
    else if (opts.interactive || opts.show === 'hyp') txt = 'H' + (model.paths.length + k + 1);
    if (txt) labels.push({ x: (s0.x + ex) / 2, y: (s0.y + ey) / 2, txt, pid: '', lid: 'mod:' + m.id, pt: t => ({ x: s0.x + (ex - s0.x) * t, y: s0.y + (ey - s0.y) * t }) });
  });
  G.cons.forEach(g => {
    const c = g.c, endo = model.paths.some(p => p.to === c.id);
    const sel = opts.selected && opts.selected.type === 'c' && opts.selected.id === c.id, src = opts.src === c.id;
    const r2 = V && V.r2 ? V.r2.get(c.id) : undefined;
    s += `<g class="lv${endo ? ' endo' : ''}${sel ? ' sel' : ''}${src ? ' src' : ''}" data-cid="${c.id}"${opts.interactive ? ` role="button" tabindex="-1" aria-label="${esc(tl('Konstruk ', 'Construct ') + c.name)}"` : ''}>`;
    s += `<ellipse cx="${c.x}" cy="${c.y}" rx="${g.rx.toFixed(1)}" ry="${g.ry}"/>`;
    if (isHoc(c)) s += `<ellipse class="hoc-in" cx="${c.x}" cy="${c.y}" rx="${(g.rx - 4.5).toFixed(1)}" ry="${g.ry - 4.5}"/>`;
    const inner = st && st.names === 'full' ? '' : c.name, valOnly = !!(st && st.r2 === 'value');
    const r2t = r2 !== undefined && !(st && st.r2 === 'none') ? (valOnly ? fmt(r2) : 'R² ' + fmt(r2)) : '';
    if (inner && r2t) s += `<text class="lv-name" x="${c.x}" y="${(c.y - 2 * f).toFixed(1)}">${esc(inner)}</text><text class="lv-r2${valOnly ? ' val' : ''}" x="${c.x}" y="${(c.y + 14 * f).toFixed(1)}">${esc(r2t)}</text>`;
    else if (inner) s += `<text class="lv-name" x="${c.x}" y="${(c.y + 5 * f).toFixed(1)}">${esc(inner)}</text>`;
    else if (r2t) s += `<text class="lv-r2 solo${valOnly ? ' val' : ''}" x="${c.x}" y="${(c.y + 4.5 * f).toFixed(1)}">${esc(r2t)}</text>`;
    s += '</g>';
    if (g.nl) s += `<text class="lv-full">${g.nl.lines.map((t, i) => `<tspan x="${g.nl.x}" y="${(g.nl.y1 + (i + 0.78) * g.nl.lh).toFixed(1)}">${esc(t)}</tspan>`).join('')}</text>`;
  });
  placeLabels(labels, G, model);
  labels.forEach(l => { s += `<g data-pid="${l.pid}" data-lid="${esc(l.lid || '')}" data-bx="${l.bx.toFixed(1)}" data-by="${l.by.toFixed(1)}" data-lx="${l.x.toFixed(1)}" data-ly="${l.y.toFixed(1)}">${labelSVG(l.x, l.y, l.txt, 'sm', f, plain)}</g>`; });
  return s;
}
const DIAGRAM_EXPORT_CSS = `.dg text{font-family:"Plus Jakarta Sans","Segoe UI",Arial,sans-serif;fill:#262a33}.dg .lv ellipse{fill:#fff;stroke:#262a33;stroke-width:1.6}.dg .lv.endo ellipse{stroke-width:2}.dg .lv-name{font-weight:700;font-size:14px;text-anchor:middle}.dg .lv-r2{font-size:11px;text-anchor:middle;fill:#5d6270}.dg .mv rect{fill:#fdf0f3;stroke:#d2405f;stroke-width:1}.dg .mv text{font-size:11px;text-anchor:middle}.dg .mv-edge{stroke:#9a9eaa;stroke-width:1.1;fill:none}.dg .sm-edge{stroke:#262a33;stroke-width:1.7;fill:none}.dg .sm-edge.ns{stroke-dasharray:6 4;stroke:#5d6270}.dg .hit{stroke:none;fill:none}.dg .lab rect{fill:#fff;stroke:#e6e2e5}.dg .lab text{font-size:11.5px;text-anchor:middle}.dg .lab.sm text{font-weight:600}.dg .lab.mvl text{font-size:10px;fill:#5d6270}.dg .lab.mvl rect{stroke:none}.dg .ah{fill:#262a33}.dg .ah-mv{fill:#9a9eaa}.dg .ah-sel{fill:#d2405f}.dg .hoc-edge{stroke:#5d6270;stroke-width:1.5;fill:none}.dg .mod-edge{stroke:#d2405f;stroke-width:1.6;stroke-dasharray:6 4;fill:none}.dg .hoc-in{fill:none;stroke:#262a33;stroke-width:1}.dg .lab.plain text{paint-order:stroke;stroke:#ffffff;stroke-width:3px;stroke-linejoin:round}.dg .lv-full{font-weight:700;font-size:12.5px;text-anchor:middle;fill:#262a33}.dg .lv-r2.val{font-size:13px;font-weight:700;fill:#262a33}`;
function diagramSVG(model, opts) {
  const st = opts.style || null, G = geometry(model, st), b = G.bounds, pad = 26, root = (opts.idp || 'd') + 'root', sc = st ? dgStyleCSS(st, root) : '';
  const vb = (opts.box || [b.x1 - pad, b.y1 - pad, b.x2 - b.x1 + 2 * pad, b.y2 - b.y1 + 2 * pad]).map(v => Number(v).toFixed(0));
  const style = opts.standalone ? `<style>${DIAGRAM_EXPORT_CSS}${sc}</style>${opts.transparent ? '' : `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="#ffffff"/>`}` : (sc ? `<style>${sc}</style>` : '');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}" role="img" aria-label="${esc(tl('Diagram jalur model PLS-SEM', 'PLS-SEM path diagram'))}">${style}<g id="${root}">${diagramInner(model, G, opts)}</g></svg>`;
}
