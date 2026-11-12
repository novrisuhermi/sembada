/* ================================================================ analysis input & runner */
function orderedConstructs(model) {
  const m = model || M();
  const { D } = adjacency(m);
  const order = PLS.topoOrder(D) || m.constructs.map((_, i) => i);
  return order.map(i => m.constructs[i]);
}
function missingCodes() { return String(state.settings.missingCode || '').split(/[;,\s]+/).map(s => parseFloat(s)).filter(Number.isFinite); }
function prepInput() {
  const model = M(), X = extModel(model), codes = missingCodes(), hocIds = new Set(X.hocs.map(h => h.id));
  const expand = id => (hocIds.has(id) ? conById(id).locs.slice() : [id]), e1 = [];
  model.paths.forEach(p => expand(p.from).forEach(a => expand(p.to).forEach(b => e1.push([a, b]))));
  const T1 = topoConstructs(model.constructs.filter(c => !isHoc(c)), e1), cons = T1.cons, items = cons.flatMap(c => c.items);
  const raw = items.map(name => colByName(name).values.map(v => (Number.isNaN(v) || codes.includes(v) ? NaN : v)));
  const n0 = state.data.nRows;
  let rows = Array.from({ length: n0 }, (_, i) => i);
  if (state.settings.missing === 'listwise') rows = rows.filter(i => raw.every(a => !Number.isNaN(a[i])));
  if (rows.length < 5) throw new Error(tl(`Hanya ${rows.length} responden yang dapat dipakai setelah data hilang ditangani. Data terlalu sedikit.`, `Only ${rows.length} respondents remain after handling missing data. That is too few.`));
  let nImputed = 0; const empty = [];
  const cols = raw.map((a, k) => {
    let s = 0, c = 0; rows.forEach(i => { if (!Number.isNaN(a[i])) { s += a[i]; c++; } });
    if (!c) empty.push(items[k]);
    const m = c ? s / c : 0;
    return Float64Array.from(rows, i => { if (Number.isNaN(a[i])) { nImputed++; return m; } return a[i]; });
  });
  if (empty.length) throw new Error(tl(`Kolom ${empty.join(', ')} kosong seluruhnya.`, `Column(s) ${empty.join(', ')} are completely empty.`));
  const flat = items.filter((_, k) => cols[k].every(v => v === cols[k][0]));
  if (flat.length) throw new Error(tl(`Indikator ${flat.join(', ')} tidak bervariasi (semua jawaban sama) sehingga tidak dapat dianalisis. Keluarkan dari model.`, `Indicator(s) ${flat.join(', ')} have no variance (all answers are identical) and cannot be analyzed. Remove them from the model.`));
  let k = 0; const blocks = cons.map(c => c.items.map(() => k++));
  const spec = { lv: cons.map(c => c.name), blocks, mode: cons.map(c => (c.mode === 'formative' ? 'B' : 'A')), reflective: cons.map(c => c.mode !== 'formative'), D: T1.D };
  const out = { cons, items, raw, cols, spec, idx: T1.idx, rows, n: rows.length, n0, nDropped: n0 - rows.length, nImputed, codes, ext: X };
  if (!X.any) return out;
  /* stage 2: LOC scores become the indicators of their HOC; each interaction term is the product of the standardized stage-1 scores of X and M */
  const locIds = new Set(X.hocs.flatMap(h => h.locs));
  const nodes2 = model.constructs.filter(c => !locIds.has(c.id)).map(c => Object.assign({}, c, { kind: hocIds.has(c.id) ? 'hoc' : 'std' }))
    .concat(X.mods.map(m => { const p = model.paths.find(q => q.id === m.path), x = conById(p.from), mo = conById(m.moderator), nm = x.name + INT_SEP + mo.name; return { id: 'int:' + m.id, name: nm, kind: 'int', mode: 'reflective', items: [nm], x: p.from, m: m.moderator, y: p.to }; }));
  const e2 = model.paths.map(p => [p.from, p.to]).concat(X.mods.map(m => ['int:' + m.id, model.paths.find(q => q.id === m.path).to]));
  const T2 = topoConstructs(nodes2, e2), items2 = [], src = [];
  const blocks2 = T2.cons.map(c => {
    const b = [];
    if (c.kind === 'hoc') conById(c.id).locs.forEach(l => { b.push(items2.length); items2.push(conById(l).name); src.push({ t: 'score', j: T1.idx.get(l) }); });
    else if (c.kind === 'int') { b.push(items2.length); items2.push(c.name); src.push({ t: 'int', a: T1.idx.get(c.x), b: T1.idx.get(c.m) }); }
    else c.items.forEach(it => { b.push(items2.length); items2.push(it); src.push({ t: 'col', k: items.indexOf(it) }); });
    return b;
  });
  const spec2 = { lv: T2.cons.map(c => c.name), blocks: blocks2, mode: T2.cons.map(c => (c.mode === 'formative' ? 'B' : 'A')), reflective: T2.cons.map(c => c.mode !== 'formative'), D: T2.D };
  const makePrep = opts => c1 => {
    const Y = PLS.estimate(c1, spec, opts).Y, n = c1[0].length;
    return src.map(q => (q.t === 'col' ? c1[q.k] : q.t === 'score' ? Float64Array.from(Y[q.j]) : Float64Array.from({ length: n }, (_, i) => Y[q.a][i] * Y[q.b][i])));
  };
  return Object.assign(out, { cons1: cons, items1: items, cols1: cols, spec1: spec, idx1: T1.idx, cons: T2.cons, items: items2, spec: spec2, idx: T2.idx, cols: null, makePrep });
}
function frequencies(raw) {
  const all = new Set(); let ok = true;
  const per = raw.map(a => { const m = new Map(); a.forEach(v => { if (Number.isNaN(v)) return; if (!Number.isInteger(v)) ok = false; m.set(v, (m.get(v) || 0) + 1); all.add(v); }); return m; });
  let cats = Array.from(all).sort((x, y) => x - y);
  if (!ok || cats.length < 2 || cats.length > 11 || cats[cats.length - 1] - cats[0] > 10) return null;
  const lo = cats[0], hi = cats[cats.length - 1];
  if (lo >= 1 && hi <= 5) cats = [1, 2, 3, 4, 5]; else if (lo >= 1 && hi <= 7) cats = [1, 2, 3, 4, 5, 6, 7];
  else cats = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return { cats, per };
}
function signature() {
  const d = state.data; let h = 0x811c9dc5;
  const mix = x => { h ^= x; h = Math.imul(h, 16777619) >>> 0; };
  if (d) d.columns.forEach(c => { mix(c.name.length); if (c.numeric) c.values.forEach(v => mix(Number.isNaN(v) ? 7 : (Math.round(v * 1000) | 0))); });
  return JSON.stringify({ h, n: d ? d.nRows : 0, m: M().constructs.map(c => [c.id, c.name, c.mode, c.items, c.locs || null]), p: M().paths.map(p => [p.from, p.to]), mo: (M().moderations || []).map(m => [m.path, m.moderator]), s: state.settings });
}
const isStale = () => !!(state.results && state.results.sig !== signature());
function errorMessage(e, prep) {
  if (e && e.code === 'zero_variance') return tl(`Indikator ${prep.items[e.info.index]} tidak bervariasi sehingga tidak dapat dianalisis.`, `Indicator ${prep.items[e.info.index]} has no variance and cannot be analyzed.`);
  if (e && e.code === 'singular') return tl('Perhitungan gagal karena ada kolinearitas sempurna (misalnya dua indikator identik, atau indikator formatif yang saling bergantung). Periksa data dan model.', 'The calculation failed because of perfect collinearity (for example two identical indicators, or formative indicators that depend on each other). Check the data and the model.');
  if (e && e.code === 'degenerate') return tl('Skor konstruk tidak dapat dibentuk. Periksa indikator yang konstan atau konstruk yang tidak terhubung.', 'Construct scores could not be formed. Check for constant indicators or unconnected constructs.');
  return tl('Perhitungan gagal: ', 'The calculation failed: ') + (e && e.message ? trMsg(e.message) : String(e));
}
function setProgress(stage, frac) {
  if (!state.run) return;
  state.run.stage = stage; state.run.frac = frac;
  const b = $('#prog-b'), t = $('#prog-t');
  if (b) { const kids = b.children, on = Math.round(frac * kids.length); for (let i = 0; i < kids.length; i++) kids[i].className = i < on ? 'on' : ''; }
  if (t) t.textContent = stage;
}
async function runAll() {
  if (state.run && state.run.running) return;
  const v = validateModel();
  if (v.errors.length) { toast(v.errors[0], 'err'); if (state.ui.step !== 'run') goStep('run'); return; }
  let prep;
  try { prep = prepInput(); } catch (e) { toast(e.message, 'err'); return; }
  const S = clone(state.settings);
  const opts = { scheme: S.scheme, maxIter: S.maxIter, tol: Math.pow(10, -S.stopExp), plsc: S.algorithm === 'plsc' };
  if (prep.makePrep) { prep.prepFn = prep.makePrep(opts); try { prep.cols = prep.prepFn(prep.cols1); } catch (e) { toast(errorMessage(e, prep), 'err'); return; } }
  state.run = { running: true, stage: tl('Estimasi model PLS…', 'Estimating the PLS model…'), frac: 0, cancel: false };
  state.ui.step = 'run'; render();
  await tick(); await tick();
  let R = null;
  try {
    const A = PLS.analyze(prep.cols, prep.spec, opts);
    const notesIn = lang => withLang(lang, () => { const w = validateModel(); return w.warns.concat(w.info); });
    R = {
      time: new Date(), sig: signature(), name: state.name, settings: S, opts, model: clone(state.model), spec: prep.spec, idx: prep.idx,
      cons: prep.cons.map(c => ({ id: c.id, name: c.name, mode: c.mode, items: c.kind === 'hoc' ? conById(c.id).locs.map(l => conById(l).name) : c.items.slice(), kind: c.kind || 'std' })), items: prep.items,
      ext: prep.ext, base: prep.spec1 ? { items: prep.items1, lv: prep.spec1.lv, idx: prep.idx1, spec: prep.spec1 } : null, A1: prep.ext.hocs.length ? PLS.analyze(prep.cols1, prep.spec1, opts) : null,
      prep: { n: prep.n, n0: prep.n0, nDropped: prep.nDropped, nImputed: prep.nImputed, codes: prep.codes, missing: S.missing },
      source: state.source ? { fileName: state.source.fileName, kind: state.source.kind, sample: state.source.sample || null, sheet: state.source.sheetNames ? state.source.sheetNames[state.source.sheetIndex] : state.source.sheet || null } : null,
      A, classical: PLS.classical(prep.cols1 || prep.cols, (prep.spec1 || prep.spec).blocks, 0.05), desc: prep.raw.map(a => PLS.describe(a)), freq: frequencies(prep.raw),
      boot: null, pred: null, cancelled: false, notes: { id: notesIn('id'), en: notesIn('en') }
    };
    if (S.boot.run) {
      setProgress('Bootstrapping…', 0);
      R.boot = await PLS.bootstrap(prep.cols1 || prep.cols, prep.spec, opts, { B: (S.boot.B = clampBoot(S.boot.B)), seed: S.boot.seed, ci: S.boot.ci, tails: S.boot.tails, alpha: S.boot.alpha, prep: prep.prepFn, keepDraws: true },
        (f, st) => setProgress(st === 'jack' ? tl(`Jackknife untuk interval BCa: ${Math.round(f * 100)}%`, `Jackknife for BCa intervals: ${Math.round(f * 100)}%`) : tl(`Bootstrapping: ${fmtInt(Math.round(f * S.boot.B))} dari ${fmtInt(S.boot.B)} subsampel`, `Bootstrapping: ${fmtInt(Math.round(f * S.boot.B))} of ${fmtInt(S.boot.B)} subsamples`), f), () => state.run.cancel);
    }
    if (S.predict.run && !prep.ext.any) {
      setProgress('PLSpredict…', 0);
      R.pred = await PLS.plsPredict(prep.cols, prep.spec, opts, { folds: S.predict.folds, reps: S.predict.reps, seed: S.predict.seed, approach: S.predict.approach },
        f => setProgress(`PLSpredict: ${Math.round(f * 100)}%`, f), () => state.run.cancel);
    }
    R.profile = respondentProfile(prep.rows);
    if (S.ipma && S.ipma.run !== false) { try { R.ipma = computeIPMA(prep, R, opts); } catch (e) { console.error(e); R.ipma = null; } }
    if (S.mga && S.mga.run) {
      setProgress('MGA…', 0);
      try { R.mga = await runMGA(prep, opts, S, (st, f) => setProgress(st, f), () => state.run.cancel); }
      catch (e) { if (e && e.code === 'cancel') throw e; console.error(e); R.mga = { error: e && e.message ? e.message : String(e) }; }
    }
  } catch (e) {
    if (e && e.code === 'cancel' && R) { R.cancelled = true; toast(tl('Perhitungan dihentikan. Hasil yang sudah selesai tetap ditampilkan.', 'Calculation stopped. Completed results are still shown.')); }
    else { console.error(e); state.run = null; render(); toast(errorMessage(e, prep), 'err'); return; }
  }
  state.run = null; state.results = decorate(R); state.ui.step = 'results'; state.ui.section = 'summary';
  render(); const mm = $('#main'); if (mm) mm.scrollTop = 0;
  if (!R.cancelled) toast(tl('Perhitungan selesai.', 'Calculation finished.'), 'ok');
  if (typeof recentSave === 'function') recentSave();
}
function decorate(R) {
  const spec = R.spec;
  R.lv = spec.lv; R.L = spec.lv.length; R.blockOf = []; R.posOf = [];
  spec.blocks.forEach((b, j) => b.forEach((k, a) => { R.blockOf[k] = j; R.posOf[k] = a; }));
  R.endo = []; for (let j = 0; j < R.L; j++) if (PLS.predecessors(spec.D, j).length) R.endo.push(j);
  R.refl = R.cons.map(c => c.mode !== 'formative'); R.kind = R.cons.map(c => c.kind || 'std');
  R.hyp = hypotheses(R.model).map(h => ({ h: h.h, pid: h.p.id, i: R.idx.get(h.p.from), j: R.idx.get(h.p.to), from: h.from.name, to: h.to.name }));
  ((R.ext && R.ext.mods) || []).forEach(m => { const p = R.model.paths.find(q => q.id === m.path), j = R.idx.get('int:' + m.id), y = R.idx.get(p.to); R.hyp.push({ h: 'H' + (R.hyp.length + 1), pid: 'int:' + m.id, i: j, j: y, from: R.lv[j], to: R.lv[y], mod: true }); });
  if (R.base) { R.base.blockOf = []; R.base.spec.blocks.forEach((b, j) => b.forEach(k => { R.base.blockOf[k] = j; })); }
  else R.base = { items: R.items, lv: R.lv, idx: R.idx, blockOf: R.blockOf, spec: R.spec };
  if (!R.ext) R.ext = { hocs: [], mods: [], any: false };
  if (R.boot) {
    const key = a => a.join(',');
    R.bootPath = new Map(R.boot.paths.map(x => [key(x.key), x.s]));
    R.bootR2 = new Map(R.boot.r2.map(x => [x.key, x.s]));
    R.bootLoad = new Map(R.boot.loadings.map(x => [x.key[2], x.s]));
    R.bootWeight = new Map(R.boot.weights.map(x => [x.key[2], x.s]));
  }
  return R;
}

/* ================================================================ table model & renderer */
const tableStore = new Map();
let STATIC = false;
const Nc = (v, st, o) => Object.assign({ v, st: st || null }, o || {});
const Tc = (t, st, o) => Object.assign({ t: String(t), st: st || null }, o || {});
const Pc = (v, st) => ({ v, st: st || null, p: true });
const k2 = v => fmt(v, 2);
function cellText(c) {
  if (c === null || c === undefined) return '';
  if (typeof c === 'number') return fmt(c);
  if (typeof c === 'string') return c;
  if (c.t !== undefined) return c.t;
  return c.p ? fmtP(c.v) : fmt(c.v, c.d);
}
function cellRaw(c) {
  if (c === null || c === undefined) return null;
  if (typeof c === 'number') return Number.isFinite(c) ? c : null;
  if (typeof c === 'string') return c;
  if (c.t !== undefined) return c.t;
  return Number.isFinite(c.v) ? c.v : (Number.isNaN(c.v) ? null : cellText(c));
}
function tableHTML(tm) {
  if (!STATIC) tableStore.set(tm.id, tm);
  const head = `<thead><tr>${tm.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>`;
  const body = tm.rows.map(r => {
    if (r && r.grp !== undefined) return `<tr class="grp"><td colspan="${tm.head.length}">${esc(r.grp)}</td></tr>`;
    return '<tr>' + r.map((c, ci) => {
      const cls = [];
      if (c && typeof c === 'object') { if (c.st) cls.push(c.st); if (c.t !== undefined && ci > 0 && !c.num) cls.push('t'); if (c.b) cls.push('strong'); }
      else if (typeof c === 'string' && ci > 0) cls.push('t');
      if (c === null || c === undefined) cls.push('mute');
      const a = cls.length ? ` class="${cls.join(' ')}"` : '';
      return ci === 0 ? `<th scope="row"${a}>${esc(cellText(c))}</th>` : `<td${a}>${esc(cellText(c))}</td>`;
    }).join('') + '</tr>';
  }).join('');
  const tools = STATIC ? '' : `<div class="tbl-tools"><button class="btn btn-quiet" data-action="copy-table" data-tid="${tm.id}">${tl('Salin', 'Copy')}</button><button class="btn btn-quiet" data-action="csv-table" data-tid="${tm.id}">CSV</button></div>`;
  const legend = tm.legend ? `<div class="legend">${tm.legend.map(([st, txt]) => `<span><i class="bub ${st}"></i>${esc(txt)}</span>`).join('')}</div>` : '';
  return `<div class="tbl-block"><div class="tbl-head"><h3>${esc(tm.title)}</h3>${tools}</div><div class="tbl-wrap${tm.rows.length > 18 && !STATIC ? ' tall' : ''}"><table class="tbl">${head}<tbody>${body}</tbody></table></div>${legend}${tm.note ? `<p class="tbl-note">${tm.note}</p>` : ''}</div>`;
}
function tableTSV(tm) { return [tm.head.join('\t')].concat(tm.rows.map(r => (r && r.grp !== undefined ? r.grp : r.map(cellText).join('\t')))).join('\n'); }
function tableSimpleHTML(tm) {
  const td = (t, h) => `<${h ? 'th' : 'td'} style="border:1px solid #999;padding:3px 6px">${esc(t)}</${h ? 'th' : 'td'}>`;
  return `<table style="border-collapse:collapse"><tr>${tm.head.map(h => td(h, true)).join('')}</tr>${tm.rows.map(r => (r && r.grp !== undefined ? `<tr>${td(r.grp, true)}</tr>` : `<tr>${r.map(c => td(cellText(c))).join('')}</tr>`)).join('')}</table>`;
}
function tableCSV(tm) {
  const sep = state.view.comma ? ';' : ',', q = s => (/[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
  return '\uFEFF' + [tm.head.map(q).join(sep)].concat(tm.rows.map(r => (r && r.grp !== undefined ? q(r.grp) : r.map(c => q(cellText(c))).join(sep)))).join('\r\n');
}
const stripTags = s => String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/* ================================================================ criteria */
const stLoad = v => (v >= 0.70 ? 'pass' : v >= 0.40 ? 'warn' : 'fail');
const stRel = v => (v > 0.95 ? 'warn' : v >= 0.70 ? 'pass' : v >= 0.60 ? 'warn' : 'fail');
const stAVE = v => (v >= 0.50 ? 'pass' : 'fail');
const stHTMT = v => (v < 0.85 ? 'pass' : v < 0.90 ? 'warn' : 'fail');
const stVIF = v => (v < 3 ? 'pass' : v < 5 ? 'warn' : 'fail');
const r2Code = v => (v > 1 ? 'bad' : v >= 0.75 ? 'sub' : v >= 0.50 ? 'mod' : v >= 0.25 ? 'weak' : 'vweak');
const r2Cat = v => ({ bad: tl('tidak wajar (> 1)', 'inadmissible (> 1)'), sub: tl('kuat', 'substantial'), mod: tl('moderat', 'moderate'), weak: tl('lemah', 'weak'), vweak: tl('sangat lemah', 'very weak') }[r2Code(v)]);
const f2Cat = v => (!Number.isFinite(v) ? '–' : v < 0 ? tl('tidak wajar (negatif)', 'inadmissible (negative)') : v >= 0.35 ? tl('besar', 'large') : v >= 0.15 ? tl('sedang', 'medium') : v >= 0.02 ? tl('kecil', 'small') : tl('tidak ada efek', 'no effect'));
const q2Cat = v => (v > 0.5 ? tl('besar', 'large') : v > 0.25 ? tl('sedang', 'medium') : v > 0 ? tl('kecil', 'small') : tl('tidak ada', 'none'));
const LG = {
  loading: () => [['pass', `≥ ${k2(0.70)}`], ['warn', tl(`${k2(0.40)}–${k2(0.70)}: pertimbangkan dihapus bila AVE/reliabilitas belum terpenuhi`, `${k2(0.40)}–${k2(0.70)}: consider removal if AVE/reliability are not met`)], ['fail', `< ${k2(0.40)}`]],
  rel: () => [['pass', `${k2(0.70)}–${k2(0.95)}`], ['warn', tl(`${k2(0.60)}–${k2(0.70)} (eksploratori) atau > ${k2(0.95)} (item redundan)`, `${k2(0.60)}–${k2(0.70)} (exploratory) or > ${k2(0.95)} (redundant items)`)], ['fail', `< ${k2(0.60)}`]],
  htmt: () => [['pass', `< ${k2(0.85)}`], ['warn', `${k2(0.85)}–${k2(0.90)}`], ['fail', `≥ ${k2(0.90)}`]],
  vif: () => [['pass', '< 3'], ['warn', '3–5'], ['fail', '≥ 5']]
};
const pctLabel = q => fmt(q * 100, Math.abs(q * 1000 - Math.round(q * 1000)) < 1e-9 && Math.round(q * 1000) % 10 ? 1 : 0) + '%';
const ciLevel = R => Math.round((R.boot.hi - R.boot.lo) * 100);
const reflIdx = R => R.lv.map((_, j) => j).filter(j => R.refl[j] && !(R.kind && R.kind[j] === 'int'));
const rngTxt = arr => (arr.length ? `${fmt(Math.min(...arr))}–${fmt(Math.max(...arr))}` : '–');
const decideTxt = sig => (sig ? tl('Diterima', 'Supported') : tl('Ditolak', 'Not supported'));
function bootHead(R, first) { return first.concat([tl('Sampel asli (O)', 'Original sample (O)'), tl('Rata-rata (M)', 'Sample mean (M)'), 'STDEV', tl('T statistik', 'T statistics'), tl('P value', 'P values'), `CI ${pctLabel(R.boot.lo)}`, `CI ${pctLabel(R.boot.hi)}`]); }
function bootCells(s, alpha) { if (!s) return [null, null, null, null, null, null, null]; return [Nc(s.O), Nc(s.M), Nc(s.SD), Nc(s.T), Pc(s.P, s.P < alpha ? 'pass' : null), Nc(s.lo), Nc(s.hi)]; }
function mediationCode(R, x) {
  const a = R.boot.alpha, ch = x.key, s = x.s, X = ch[0], Y = ch[ch.length - 1];
  const dir = R.spec.D[X][Y] ? R.bootPath.get(X + ',' + Y) : null, ind = !!(s && s.P < a), dsig = !!(dir && dir.P < a);
  if (!dir) return ind ? 'nodirect' : 'none_nd';
  if (ind && dsig) return s.O * dir.O > 0 ? 'compl' : 'compet';
  if (ind) return 'full';
  return dsig ? 'direct' : 'noeffect';
}
const mediationText = code => ({ nodirect: tl('Efek tidak langsung (tanpa jalur langsung)', 'Indirect effect (no direct path)'), none_nd: tl('Tidak ada efek tidak langsung', 'No indirect effect'), compl: tl('Mediasi parsial komplementer', 'Complementary partial mediation'), compet: tl('Mediasi parsial kompetitif', 'Competitive partial mediation'), full: tl('Mediasi penuh', 'Full mediation (indirect-only)'), direct: tl('Tidak ada mediasi (hanya efek langsung)', 'No mediation (direct-only)'), noeffect: tl('Tidak ada efek', 'No effect') }[code]);

/* ================================================================ tables */
function descTable(R) {
  const io = v => Nc(v, null, Number.isInteger(v) ? { d: 0 } : {});
  return { id: 'desc', title: tl('Statistik deskriptif per indikator', 'Descriptive statistics by indicator'), head: [tl('Indikator', 'Indicator'), tl('Konstruk', 'Construct'), 'N', tl('Hilang', 'Missing'), 'Mean', 'Median', 'SD', 'Min', tl('Maks', 'Max'), 'Skewness', 'Kurtosis'],
    rows: R.base.items.map((it, k) => { const d = R.desc[k]; return [Tc(it), Tc(R.base.lv[R.base.blockOf[k]]), Nc(d.n, null, { d: 0 }), Nc(d.miss, d.miss ? 'warn' : null, { d: 0 }), Nc(d.mean), io(d.median), Nc(d.sd), io(d.min), io(d.max), Nc(d.skew, Math.abs(d.skew) > 2 ? 'warn' : null), Nc(d.kurt, Math.abs(d.kurt) > 2 ? 'warn' : null)]; }),
    note: tl('Skewness dan excess kurtosis di luar ±2 menandakan distribusi menjauhi normal. PLS-SEM tidak mensyaratkan normalitas, tetapi informasi ini lazim dilaporkan.', 'Skewness and excess kurtosis beyond ±2 indicate departures from normality. PLS-SEM does not require normality, but these values are commonly reported.') + (R.prep.codes.length ? tl(` Kode data hilang: ${esc(R.prep.codes.join(', '))}.`, ` Missing-value code(s): ${esc(R.prep.codes.join(', '))}.`) : '') };
}
const LIKERT = () => ({ 5: tl('STS TS N S SS', 'SD D N A SA').split(' '), 4: tl('STS TS S SS', 'SD D A SA').split(' ') });
function catLabels(cats) { const L = LIKERT()[cats.length]; return cats[0] === 1 && L ? cats.map((c, i) => `${c} (${L[i]})`) : cats.map(String); }
function catColors(k) {
  const lo = [179, 48, 77], mid = [205, 207, 214], hi = [44, 51, 66];
  return Array.from({ length: k }, (_, i) => { const t = k === 1 ? 1 : i / (k - 1); const [a, b, u] = t < 0.5 ? [lo, mid, t * 2] : [mid, hi, (t - 0.5) * 2]; return 'rgb(' + a.map((x, z) => Math.round(x + (b[z] - x) * u)).join(',') + ')'; });
}
const isLight = rgb => { const [r, g, b] = rgb.match(/\d+/g).map(Number); return 0.299 * r + 0.587 * g + 0.114 * b > 150; };
function freqTable(R) {
  const F = R.freq;
  return { id: 'freq', title: tl('Frekuensi jawaban per indikator', 'Response frequencies by indicator'), head: [tl('Indikator', 'Indicator')].concat(catLabels(F.cats), ['N']),
    rows: R.base.items.map((it, k) => { const m = F.per[k], n = Array.from(m.values()).reduce((s, x) => s + x, 0); return [Tc(it)].concat(F.cats.map(c => { const x = m.get(c) || 0; return Tc(`${x} (${fmt(n ? 100 * x / n : 0, 1)}%)`, null, { num: true }); }), [Nc(n, null, { d: 0 })]); }) };
}
function likertHTML(R) {
  const F = R.freq, cols = catColors(F.cats.length), labels = catLabels(F.cats);
  const note5 = F.cats.length === 5 && F.cats[0] === 1 ? `<span>${tl('STS = sangat tidak setuju, SS = sangat setuju', 'SD = strongly disagree, SA = strongly agree')}</span>` : '';
  const legend = `<div class="legend" style="margin-bottom:12px">${labels.map((l, i) => `<span><i class="bub" style="color:${cols[i]};background:${cols[i]}"></i>${esc(l)}</span>`).join('')}${note5}</div>`;
  const rows = R.base.items.map((it, k) => {
    const m = F.per[k], n = Array.from(m.values()).reduce((s, x) => s + x, 0);
    const segs = F.cats.map((c, i) => { const x = m.get(c) || 0, pct = n ? 100 * x / n : 0; if (!x) return ''; return `<span style="width:${pct.toFixed(2)}%;background:${cols[i]}"${isLight(cols[i]) ? ' class="lightseg"' : ''} title="${esc(it)}: ${esc(labels[i])} = ${x} (${fmt(pct, 1)}%)">${pct >= 8 ? Math.round(pct) + '%' : ''}</span>`; }).join('');
    return `<div class="stack-row"><span class="small">${esc(it)}</span><div class="stack-bar" role="img" aria-label="${esc(tl('Sebaran jawaban ', 'Response distribution ') + it)}">${segs}</div><span class="xs muted num">n = ${n}</span></div>`;
  }).join('');
  return `${legend}<div class="stack-chart" style="margin-bottom:26px">${rows}</div>${tableHTML(freqTable(R))}`;
}
function classicTables(R) {
  const C = R.classical, rowsV = [], rowsA = [], rowsD = [], na = tl('tidak dapat diuji (1 item)', 'not testable (1 item)');
  C.blocks.forEach((b, j) => {
    const name = R.base.lv[j];
    b.items.forEach(x => {
      if (!Number.isFinite(x.r)) { rowsV.push([Tc(name), Tc(R.base.items[x.c]), null, null, Nc(C.rtab), Tc(na, 'mute')]); return; }
      const ok = x.r > C.rtab && x.p < 0.05;
      rowsV.push([Tc(name), Tc(R.base.items[x.c]), Nc(x.r), Pc(x.p), Nc(C.rtab), Tc(ok ? tl('Valid', 'Valid') : tl('Tidak valid', 'Not valid'), ok ? 'pass' : 'fail')]);
    });
    const ok = b.alpha > 0.70, fin = Number.isFinite(b.alpha);
    rowsA.push([Tc(name), fin ? Nc(b.alpha, ok ? 'pass' : 'fail') : null, Nc(b.items.length, null, { d: 0 }), fin ? Tc(ok ? tl('Reliabel', 'Reliable') : tl('Tidak reliabel', 'Not reliable'), ok ? 'pass' : 'fail') : Tc(na, 'mute')]);
    b.items.forEach((x, a) => { const v = b.drop[a]; if (!Number.isFinite(v)) return; const up = v > b.alpha; rowsD.push([Tc(name), Tc(R.base.items[x.c]), Nc(v, up ? 'warn' : null), Tc(up ? tl('alpha naik bila dihapus', 'alpha increases if deleted') : tl('alpha turun bila dihapus', 'alpha decreases if deleted'), up ? 'warn' : 'mute')]); });
  });
  const rev = C.blocks.flatMap(b => b.reversed.map(c => R.base.items[c]));
  const out = [
    { id: 'cl-valid', title: tl('Validitas item (korelasi item–total terkoreksi)', 'Item validity (corrected item–total correlation)'), head: [tl('Konstruk', 'Construct'), 'Item', tl('r hitung', 'r (item–rest)'), tl('P value', 'P value'), tl('r tabel', 'r critical'), tl('Keterangan', 'Result')], rows: rowsV,
      note: tl(`n = ${R.prep.n}, df = ${C.df}, r tabel = ${fmt(C.rtab)} (α = 5%, dua arah). Item valid bila r hitung > r tabel dan p < ${k2(0.05)}. Skor total dihitung tanpa item yang sedang diuji.`, `n = ${R.prep.n}, df = ${C.df}, critical r = ${fmt(C.rtab)} (α = 5%, two-tailed). An item is valid when its item–rest correlation exceeds the critical r and p < ${k2(0.05)}. The total score excludes the item being tested.`) },
    { id: 'cl-alpha', title: tl("Reliabilitas (Cronbach's alpha data mentah)", "Reliability (raw-data Cronbach's alpha)"), head: [tl('Konstruk', 'Construct'), "Cronbach's alpha", tl('Jumlah item', 'Items'), tl('Keterangan', 'Result')], rows: rowsA,
      note: tl(`Kriteria alpha > ${k2(0.70)} (Nunnally & Bernstein, 1994). Alpha di sini dihitung dari kovarians data mentah seperti psych::alpha, sehingga bisa sedikit berbeda dari alpha di bagian Model pengukuran yang memakai data terstandar.`, `Criterion: alpha > ${k2(0.70)} (Nunnally & Bernstein, 1994). This alpha is computed from raw-data covariances like psych::alpha, so it can differ slightly from the alpha in the Measurement model section, which uses standardized data.`) + (rev.length ? tl(` Item dibalik otomatis karena berkorelasi negatif: ${esc(rev.join(', '))}.`, ` Items reversed automatically because of negative correlations: ${esc(rev.join(', '))}.`) : '') }
  ];
  if (rowsD.length) out.push({ id: 'cl-drop', title: tl('Alpha jika item dihapus', 'Alpha if item deleted'), head: [tl('Konstruk', 'Construct'), 'Item', tl('Alpha jika dihapus', 'Alpha if deleted'), tl('Keterangan', 'Note')], rows: rowsD });
  return out;
}
function loadingsTable(R) {
  const e = R.A.est;
  return { id: 'loadings', title: 'Outer loadings' + (R.opts.plsc ? tl(' (terkoreksi PLSc)', ' (PLSc-corrected)') : ''), head: [tl('Indikator', 'Indicator')].concat(R.lv),
    rows: R.items.map((it, k) => { const j = R.blockOf[k], v = e.loadings[j][R.posOf[k]]; return [Tc(it)].concat(R.lv.map((_, jj) => (jj === j ? Nc(v, R.refl[j] ? stLoad(v) : null, { b: true }) : null))); }),
    legend: LG.loading(), note: R.refl.some(x => !x) ? tl('Loading konstruk formatif ditampilkan tanpa penilaian; konstruk formatif dinilai lewat outer weights dan VIF.', 'Loadings of formative constructs are shown without assessment; formative constructs are assessed through outer weights and VIF.') : '' };
}
function weightsTable(R) {
  const e = R.A.est;
  return { id: 'weights', title: 'Outer weights', head: [tl('Indikator', 'Indicator')].concat(R.lv), rows: R.items.map((it, k) => { const j = R.blockOf[k]; return [Tc(it)].concat(R.lv.map((_, jj) => (jj === j ? Nc(e.W[j][R.posOf[k]], null, { b: true }) : null))); }),
    note: tl('Bobot dipakai untuk membentuk skor konstruk dari indikator terstandar. Untuk konstruk formatif, signifikansinya diuji di bagian Bootstrapping.', 'Weights form the construct scores from the standardized indicators. For formative constructs, their significance is tested in the Bootstrapping section.') };
}
function relTable(R) {
  const A = R.A;
  return { id: 'reliability', title: tl('Reliabilitas dan validitas konvergen', 'Construct reliability and convergent validity'), head: [tl('Konstruk', 'Construct'), "Cronbach's alpha", 'rho_A', 'Composite reliability (rho_C)', 'AVE'],
    rows: R.lv.map((nm, j) => (R.refl[j] ? [Tc(nm), Nc(A.alpha[j], stRel(A.alpha[j])), Nc(A.rhoA[j], stRel(A.rhoA[j])), Nc(A.rhoC[j], stRel(A.rhoC[j])), Nc(A.AVE[j], stAVE(A.AVE[j]))] : [Tc(nm + tl(' (formatif)', ' (formative)')), null, null, null, null])),
    legend: LG.rel().concat([['pass', `AVE ≥ ${k2(0.50)}`], ['fail', `AVE < ${k2(0.50)}`]]),
    note: (R.opts.plsc ? tl('rho_C dan AVE dihitung dari loading terkoreksi PLSc, sama seperti seminr. ', 'rho_C and AVE are computed from the PLSc-corrected loadings, as in seminr. ') : '') + tl("Cronbach's alpha dihitung dari data terstandar, sama seperti seminr dan SmartPLS.", "Cronbach's alpha is computed from standardized data, as in seminr and SmartPLS.") };
}
function barChart(labels, values, thr, title) {
  const W = 620, rh = 28, left = Math.max(60, Math.max(...labels.map(l => textW(l, 12))) + 14), right = 60, top = 30, H = top + labels.length * rh + 26;
  const max = Math.max(1, ...values.filter(Number.isFinite)), x = v => left + Math.max(0, Math.min(max, v)) / max * (W - left - right);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}" style="width:100%;height:auto;display:block"><text x="${left}" y="18" style="font-size:12px;font-weight:600;fill:var(--ink)">${esc(title)}</text>`;
  labels.forEach((l, i) => { const y = top + i * rh, v = values[i]; s += `<text x="${left - 8}" y="${y + 17}" text-anchor="end" style="font-size:12px;fill:var(--ink)">${esc(l)}</text><rect x="${left}" y="${y + 5}" width="${Math.max(0, x(v) - left).toFixed(1)}" height="16" rx="2" style="fill:${v >= thr ? 'var(--ink)' : 'var(--fail)'}"/><text x="${(x(v) + 6).toFixed(1)}" y="${y + 17}" style="font-size:11.5px;fill:var(--ink-2)">${esc(fmt(v))}</text>`; });
  const thx = x(thr).toFixed(1);
  s += `<line x1="${thx}" x2="${thx}" y1="${top - 2}" y2="${top + labels.length * rh + 4}" style="stroke:var(--dropout);stroke-width:1.5;stroke-dasharray:5 4"/><text x="${thx}" y="${H - 6}" text-anchor="middle" style="font-size:11px;fill:var(--dropout-ink)">${esc(k2(thr))}</text></svg>`;
  return `<div class="figure chart" style="padding:12px 14px;margin-bottom:24px;max-width:680px">${s}</div>`;
}
function relHTML(R) {
  const js = reflIdx(R);
  return tableHTML(relTable(R));
}
function flTable(R) {
  const A = R.A, L = R.L, rl = A.est.Rlv, dg = j => (R.refl[j] ? Math.sqrt(A.AVE[j]) : NaN);
  const rows = R.lv.map((nm, i) => [Tc(nm)].concat(R.lv.map((_, j) => {
    if (j > i) return null;
    if (j === i) { if (!R.refl[i]) return Tc('–', 'mute'); let ok = true; for (let k = 0; k < L; k++) if (k !== i && Math.abs(rl[i][k]) >= dg(i)) ok = false; return Nc(dg(i), ok ? 'pass' : 'fail', { b: true }); }
    const r = rl[i][j], bad = (R.refl[i] && Math.abs(r) >= dg(i)) || (R.refl[j] && Math.abs(r) >= dg(j));
    return Nc(r, bad ? 'fail' : null);
  })));
  return { id: 'fl', title: tl('Kriteria Fornell-Larcker', 'Fornell-Larcker criterion'), head: [''].concat(R.lv), rows, note: tl('Diagonal (tebal) = akar AVE; di luar diagonal = korelasi antar skor konstruk. Terpenuhi bila akar AVE setiap konstruk lebih besar daripada korelasinya dengan konstruk lain. Henseler dkk. (2015) menyarankan HTMT sebagai kriteria utama.', 'Diagonal (bold) = square root of AVE; off-diagonal = correlations between construct scores. The criterion is met when each construct\'s square root of AVE exceeds its correlations with other constructs. Henseler et al. (2015) recommend HTMT as the primary criterion.') };
}
function htmtTable(R) {
  const H = R.A.HTMT;
  return { id: 'htmt', title: tl('Matriks HTMT', 'HTMT matrix'), head: [''].concat(R.lv.slice(0, -1)), rows: R.lv.slice(1).map((nm, a) => { const i = a + 1; return [Tc(nm)].concat(R.lv.slice(0, -1).map((_, j) => (j < i ? Nc(H[i][j], stHTMT(H[i][j])) : null))); }),
    legend: LG.htmt(), note: tl(`Validitas diskriminan terpenuhi bila HTMT < ${k2(0.90)} (kriteria longgar) atau < ${k2(0.85)} (kriteria ketat). Dihitung dari nilai mutlak korelasi indikator, seperti seminr.`, `Discriminant validity is established when HTMT < ${k2(0.90)} (liberal) or < ${k2(0.85)} (conservative). Computed from absolute indicator correlations, as in seminr.`) + (R.refl.some(x => !x) ? tl(' HTMT tidak relevan untuk konstruk formatif.', ' HTMT is not relevant for formative constructs.') : '') };
}
function crossTable(R) {
  const C = R.A.est.cross;
  return { id: 'cross', title: 'Cross loadings', head: [tl('Indikator', 'Indicator')].concat(R.lv), rows: R.items.map((it, k) => {
    const own = R.blockOf[k], ov = Math.abs(C[k][own]), viol = R.lv.some((_, j) => j !== own && Math.abs(C[k][j]) >= ov);
    return [Tc(it)].concat(R.lv.map((_, j) => (j === own ? Nc(C[k][j], viol ? 'warn' : null, { b: true }) : Nc(C[k][j], Math.abs(C[k][j]) >= ov ? 'fail' : null))));
  }), note: tl('Setiap indikator seharusnya memiliki loading tertinggi (tebal) pada konstruknya sendiri. Nilai adalah korelasi indikator dengan skor konstruk', 'Each indicator should load highest (bold) on its own construct. Values are correlations between indicators and construct scores') + (R.opts.plsc ? tl(' tanpa koreksi PLSc, seperti seminr.', ' without the PLSc correction, as in seminr.') : '.') };
}
function outerVifTable(R) {
  const anyF = R.refl.some(x => !x);
  return { id: 'ovif', title: tl('VIF indikator', 'Indicator VIF'), head: [tl('Indikator', 'Indicator'), tl('Konstruk', 'Construct'), 'VIF'], rows: R.items.map((it, k) => { const j = R.blockOf[k], v = R.A.outerVIF[j][R.posOf[k]]; return [Tc(it), Tc(R.lv[j] + (R.refl[j] ? '' : tl(' (formatif)', ' (formative)'))), Nc(v, R.refl[j] ? null : stVIF(v))]; }),
    legend: anyF ? LG.vif() : null, note: tl('Untuk indikator formatif, VIF sebaiknya < 3 (maksimal 5). Untuk indikator reflektif, VIF tinggi wajar karena indikatornya memang saling berkorelasi, sehingga nilainya hanya sebagai informasi.', 'For formative indicators, VIF should be below 3 (at most 5). For reflective indicators, high VIF values are expected because the indicators are meant to correlate, so the values are for information only.') };
}
function pathMatrixTable(R) {
  const B = R.A.est.B, D = R.spec.D, srcs = R.lv.map((_, i) => i).filter(i => D[i].some(Boolean));
  return { id: 'pmatrix', title: tl('Matriks koefisien jalur (baris memengaruhi kolom)', 'Path coefficient matrix (rows affect columns)'), head: [''].concat(R.endo.map(j => R.lv[j])), rows: srcs.map(i => [Tc(R.lv[i])].concat(R.endo.map(j => (D[i][j] ? Nc(B[i][j], Math.abs(B[i][j]) > 1 ? 'fail' : null) : null)))) };
}
function pathListTable(R) {
  return { id: 'plist', title: tl('Koefisien jalur per hipotesis', 'Path coefficients by hypothesis'), head: [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path'), tl('Koefisien (β)', 'Coefficient (β)')], rows: R.hyp.map(h => { const v = R.A.est.B[h.i][h.j]; return [Tc(h.h), Tc(`${h.from} → ${h.to}`), Nc(v, Math.abs(v) > 1 ? 'fail' : null)]; }) };
}
function r2Table(R) {
  const e = R.A.est;
  return { id: 'r2', title: tl('R² konstruk endogen', 'R² of endogenous constructs'), head: [tl('Konstruk', 'Construct'), 'R²', 'R² adjusted', tl('Kategori', 'Category')], rows: R.endo.map(j => [Tc(R.lv[j]), Nc(e.R2[j], e.R2[j] > 1 ? 'fail' : null), Nc(e.R2adj[j]), Tc(r2Cat(e.R2[j]), e.R2[j] > 1 ? 'fail' : null)]),
    note: tl(`Kategori menurut Hair dkk. (2011): ${k2(0.75)} kuat, ${k2(0.50)} moderat, ${k2(0.25)} lemah. Penelitian perilaku umumnya menerima R² yang lebih rendah.`, `Categories follow Hair et al. (2011): ${k2(0.75)} substantial, ${k2(0.50)} moderate, ${k2(0.25)} weak. Lower R² values are often acceptable in behavioral research.`) };
}
function f2Table(R) {
  return { id: 'f2', title: 'Effect size f²', head: [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path'), 'f²', tl('Kategori', 'Category')], rows: R.hyp.map(h => { const v = R.A.f2[h.i][h.j]; return [Tc(h.h), Tc(`${h.from} → ${h.to}`), Nc(v, v < 0 ? 'fail' : null), Tc(f2Cat(v), v < 0 ? 'fail' : null)]; }),
    note: tl(`f² = (R² dengan jalur − R² tanpa jalur) / (1 − R² dengan jalur); model diestimasi ulang tanpa jalur tersebut, seperti seminr. Pedoman Cohen (1988): ${k2(0.02)} kecil, ${k2(0.15)} sedang, ${k2(0.35)} besar.`, `f² = (R² included − R² excluded) / (1 − R² included); the model is re-estimated without the path, as in seminr. Cohen (1988): ${k2(0.02)} small, ${k2(0.15)} medium, ${k2(0.35)} large.`) };
}
function innerVifTable(R) {
  const V = R.A.innerVIF;
  return { id: 'ivif', title: tl('VIF antar konstruk (inner model)', 'Construct VIF (inner model)'), head: [tl('Prediktor', 'Predictor'), tl('Konstruk endogen', 'Endogenous construct'), 'VIF'], rows: R.hyp.map(h => { const v = V[h.i][h.j]; return [Tc(h.from), Tc(h.to), Nc(v, stVIF(v))]; }),
    legend: LG.vif(), note: tl('VIF di atas 5 (idealnya 3) menandakan kolinearitas antar prediktor yang dapat membiaskan koefisien jalur (Hair dkk., 2022).', 'VIF values above 5 (ideally 3) indicate collinearity among predictors that can bias the path coefficients (Hair et al., 2022).') };
}
function effectsTables(R) {
  const T = R.A.total, Rch = PLS.reachable(R.spec.D), pairs = [], out = [];
  for (let i = 0; i < R.L; i++) for (let j = 0; j < R.L; j++) if (Rch[i][j]) pairs.push([i, j]);
  const hasChain = (i, j) => R.A.chains.some(c => c.chain[0] === i && c.chain[c.chain.length - 1] === j);
  out.push({ id: 'total', title: tl('Efek langsung, tidak langsung, dan total', 'Direct, indirect, and total effects'), head: [tl('Dari', 'From'), tl('Ke', 'To'), tl('Efek langsung', 'Direct effect'), tl('Efek tidak langsung', 'Indirect effect'), tl('Efek total', 'Total effect')],
    rows: pairs.map(([i, j]) => [Tc(R.lv[i]), Tc(R.lv[j]), R.spec.D[i][j] ? Nc(R.A.est.B[i][j]) : null, hasChain(i, j) ? Nc(R.A.indirect[i][j]) : null, Nc(T[i][j])]) });
  if (R.A.chains.length) out.push({ id: 'spec-ind', title: tl('Efek tidak langsung spesifik', 'Specific indirect effects'), head: [tl('Jalur tidak langsung', 'Indirect path'), tl('Efek', 'Effect')], rows: R.A.chains.map(c => [Tc(c.chain.map(i => R.lv[i]).join(' → ')), Nc(c.value)]),
    note: tl('Efek tidak langsung spesifik = hasil kali koefisien jalur sepanjang rantai. Uji signifikansinya ada di bagian Bootstrapping.', 'A specific indirect effect is the product of the path coefficients along the chain. Its significance is tested in the Bootstrapping section.') });
  return out;
}
function fitTable(R) {
  const s = R.A.fit.saturated, e = R.A.fit.estimated, st = v => (v < 0.08 ? 'pass' : v < 0.10 ? 'warn' : 'fail');
  return { id: 'fit', title: 'Model fit', head: [tl('Ukuran', 'Measure'), 'Saturated model', 'Estimated model'],
    rows: [[Tc('SRMR'), Nc(s.srmr, st(s.srmr)), Nc(e.srmr, st(e.srmr))], [Tc('d_ULS'), Nc(s.duls), Nc(e.duls)], [Tc('d_G'), Nc(s.dg), Nc(e.dg)], [Tc('Chi-square'), Nc(s.chi2), Nc(e.chi2)], [Tc('NFI'), Nc(s.nfi), Nc(e.nfi)]],
    legend: [['pass', `SRMR < ${k2(0.08)}`], ['warn', `${k2(0.08)}–${k2(0.10)}`], ['fail', `≥ ${k2(0.10)}`]],
    note: tl(`Matriks korelasi implisit mengikuti Henseler dkk. (2014): model komposit untuk PLS standar${R.opts.plsc ? ' dan model faktor umum untuk konstruk reflektif pada PLSc' : ''}. Saturated model memakai korelasi antar konstruk apa adanya; estimated model memakai korelasi yang diimplikasikan model struktural. NFI makin mendekati 1 makin baik. Ukuran fit di PLS-SEM masih diperdebatkan, jadi laporkan dengan hati-hati.`, `The model-implied correlation matrix follows Henseler et al. (2014): a composite model for standard PLS${R.opts.plsc ? ' and a common factor model for reflective constructs under PLSc' : ''}. The saturated model uses the observed construct correlations; the estimated model uses those implied by the structural model. NFI values closer to 1 are better. Fit measures in PLS-SEM remain debated, so report them with caution.`) };
}
function itTable(R) {
  return { id: 'itc', title: tl('Kriteria informasi AIC dan BIC (seminr it_criteria)', 'AIC and BIC information criteria (seminr it_criteria)'), head: [tl('Konstruk endogen', 'Endogenous construct'), 'AIC', 'BIC'], rows: R.A.itc.map(x => [Tc(R.lv[x.j]), Nc(x.aic), Nc(x.bic)]),
    note: tl('Dipakai untuk membandingkan beberapa model alternatif: nilai lebih kecil lebih baik. Bukan ukuran kecocokan model mutlak.', 'Used to compare alternative models: smaller values are better. They are not absolute measures of model fit.') };
}
function hypTable(R) {
  const b = R.boot, a = b.alpha;
  const rows = R.hyp.map(h => { const s = R.bootPath.get(h.i + ',' + h.j), sig = !!(s && s.P < a); return [Tc(h.h), Tc(`${h.from} → ${h.to}`)].concat(bootCells(s, a), [Tc(decideTxt(sig), sig ? 'pass' : 'mute')]); });
  const mism = R.hyp.filter(h => { const s = R.bootPath.get(h.i + ',' + h.j); return s && (s.P < a) === (s.lo <= 0 && s.hi >= 0); });
  const tails = b.tails === 'two' ? tl('dua arah', 'two-tailed') : tl('satu arah', 'one-tailed'), ci = b.ci === 'bca' ? 'BCa' : tl('persentil', 'percentile');
  return { id: 'hyp', title: tl('Hasil uji hipotesis', 'Hypothesis testing results'), head: bootHead(R, [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path')]).concat([tl('Keputusan', 'Decision')]), rows,
    note: tl(`Bootstrapping ${fmtInt(b.B)} subsampel, uji ${tails}, α = ${k2(a)}. T statistik = |O/STDEV|; p value dari distribusi t dengan df = jumlah subsampel − 1, seperti SmartPLS. Interval kepercayaan ${ci}.`, `Bootstrapping with ${fmtInt(b.B)} subsamples, ${tails} test, α = ${k2(a)}. T statistic = |O/STDEV|; p values from the t distribution with df = number of subsamples − 1, as in SmartPLS. ${ci === 'BCa' ? 'BCa' : 'Percentile'} confidence intervals.`) +
      (mism.length ? tl(` Perhatian: kesimpulan p value dan interval kepercayaan berbeda pada ${esc(mism.map(h => h.h).join(', '))} karena distribusi bootstrap-nya tidak simetris.`, ` Note: the p value and the confidence interval disagree for ${esc(mism.map(h => h.h).join(', '))} because the bootstrap distribution is asymmetric.`) : '') + (b.fails ? tl(` ${b.fails} subsampel gagal diestimasi dan diganti subsampel baru.`, ` ${b.fails} subsamples could not be estimated and were replaced.`) : '') };
}
function bootR2Table(R) { return { id: 'boot-r2', title: tl('R² (bootstrapping)', 'R² (bootstrapping)'), head: bootHead(R, [tl('Konstruk', 'Construct')]), rows: R.endo.map(j => [Tc(R.lv[j])].concat(bootCells(R.bootR2.get(j), R.boot.alpha))) }; }
function mediationTable(R) {
  const a = R.boot.alpha;
  const rows = R.boot.chains.map(x => { const code = mediationCode(R, x), ind = !!(x.s && x.s.P < a); return [Tc(x.key.map(i => R.lv[i]).join(' → '))].concat(bootCells(x.s, a), [Tc(mediationText(code), ind ? 'pass' : 'mute')]); });
  return { id: 'mediation', title: tl('Efek tidak langsung spesifik (mediasi)', 'Specific indirect effects (mediation)'), head: bootHead(R, [tl('Jalur tidak langsung', 'Indirect path')]).concat([tl('Jenis mediasi', 'Mediation type')]), rows,
    note: tl('Jenis mediasi mengikuti Zhao dkk. (2010) dan Hair dkk. (2022): signifikansi efek tidak langsung dibandingkan dengan efek langsung X → Y.', 'Mediation types follow Zhao et al. (2010) and Hair et al. (2022): the significance of the indirect effect is compared with that of the direct effect X → Y.') };
}
function bootTotalIndTable(R) { return { id: 'boot-totind', title: tl('Efek tidak langsung total', 'Total indirect effects'), head: bootHead(R, [tl('Dari', 'From'), tl('Ke', 'To')]), rows: R.boot.totalInd.map(x => [Tc(R.lv[x.key[0]]), Tc(R.lv[x.key[1]])].concat(bootCells(x.s, R.boot.alpha))) }; }
function bootTotalTable(R) { return { id: 'boot-total', title: tl('Efek total (bootstrapping)', 'Total effects (bootstrapping)'), head: bootHead(R, [tl('Dari', 'From'), tl('Ke', 'To')]), rows: R.boot.totals.map(x => [Tc(R.lv[x.key[0]]), Tc(R.lv[x.key[1]])].concat(bootCells(x.s, R.boot.alpha))) }; }
function bootOuterTable(R, kind) {
  const arr = kind === 'load' ? R.boot.loadings : R.boot.weights;
  return { id: 'boot-' + kind, title: kind === 'load' ? 'Outer loadings (bootstrapping)' : 'Outer weights (bootstrapping)', head: bootHead(R, [tl('Indikator', 'Indicator'), tl('Konstruk', 'Construct')]),
    rows: arr.map(x => [Tc(R.items[x.key[2]]), Tc(R.lv[x.key[0]])].concat(bootCells(x.s, R.boot.alpha))),
    note: kind === 'weight' ? tl(`Untuk indikator formatif: bila weight tidak signifikan tetapi loading ≥ ${k2(0.50)}, indikator tetap dipertahankan (Hair dkk., 2022).`, `For formative indicators: when a weight is not significant but the loading is ≥ ${k2(0.50)}, the indicator is retained (Hair et al., 2022).`) : '' };
}
function bootHTMTTable(R) {
  const b = R.boot;
  const rows = b.htmt.filter(x => x.s && R.refl[x.key[0]] && R.refl[x.key[1]]).map(x => { const s = x.s, ok = s.hi < 1; return [Tc(`${R.lv[x.key[0]]} – ${R.lv[x.key[1]]}`), Nc(s.O, stHTMT(s.O)), Nc(s.M), Nc(s.lo), Nc(s.hi, ok ? 'pass' : 'fail'), Tc(ok ? tl('ya', 'yes') : tl('tidak', 'no'), ok ? 'pass' : 'fail')]; });
  return { id: 'boot-htmt', title: tl('HTMT dan interval kepercayaannya', 'HTMT and its confidence intervals'), head: [tl('Pasangan', 'Pair'), 'HTMT (O)', tl('Rata-rata (M)', 'Sample mean (M)'), `CI ${pctLabel(b.lo)}`, `CI ${pctLabel(b.hi)}`, tl('Batas atas < 1?', 'Upper bound < 1?')], rows,
    note: tl(`Validitas diskriminan didukung bila batas atas interval kepercayaan HTMT di bawah 1 (Henseler dkk., 2015); kriteria yang lebih ketat memakai ${k2(0.90)} atau ${k2(0.85)}.`, `Discriminant validity is supported when the upper bound of the HTMT confidence interval is below 1 (Henseler et al., 2015); stricter criteria use ${k2(0.90)} or ${k2(0.85)}.`) };
}
function predictTables(R) {
  const P = R.pred, appr = P.approach === 'EA' ? 'earliest antecedents' : 'direct antecedents';
  return [
    { id: 'pred-mv', title: tl('Prediksi tingkat indikator', 'Indicator-level prediction'), head: [tl('Indikator', 'Indicator'), tl('Konstruk', 'Construct'), 'Q²predict', 'PLS RMSE', 'PLS MAE', 'LM RMSE', 'LM MAE', tl('RMSE PLS < LM?', 'PLS RMSE < LM?')],
      rows: P.items.map(x => { const better = x.rmsePLS < x.rmseLM; return [Tc(R.items[x.k]), Tc(R.lv[x.j]), Nc(x.q2, x.q2 > 0 ? 'pass' : 'fail'), Nc(x.rmsePLS), Nc(x.maePLS), Nc(x.rmseLM), Nc(x.maeLM), Tc(better ? tl('ya', 'yes') : tl('tidak', 'no'), better ? 'pass' : 'warn')]; }),
      note: tl(`Validasi silang ${P.folds}-fold, ${P.reps} kali pengulangan, pendekatan ${appr}. Q²predict = 1 − SSE(PLS)/SSE(rata-rata data latih). LM = regresi linear setiap indikator endogen pada indikator konstruk ${P.approach === 'EA' ? 'eksogen' : 'anteseden langsungnya'}.`, `${P.folds}-fold cross-validation with ${P.reps} repetitions, ${appr} approach. Q²predict = 1 − SSE(PLS)/SSE(training mean). LM = linear regression of each endogenous indicator on the indicators of its ${P.approach === 'EA' ? 'exogenous' : 'direct antecedent'} constructs.`) },
    { id: 'pred-lv', title: tl('Prediksi tingkat konstruk', 'Construct-level prediction'), head: [tl('Konstruk', 'Construct'), 'Q²predict', 'RMSE', 'MAE', tl('Relevansi prediktif', 'Predictive relevance')], rows: P.constructs.map(x => [Tc(R.lv[x.j]), Nc(x.q2, x.q2 > 0 ? 'pass' : 'fail'), Nc(x.rmse), Nc(x.mae), Tc(q2Cat(x.q2))]),
      note: tl(`RMSE dan MAE dalam satuan skor konstruk terstandar. Kategori Q²: > 0 kecil, > ${k2(0.25)} sedang, > ${k2(0.50)} besar (Hair dkk., 2019).`, `RMSE and MAE are in standardized construct-score units. Q² categories: > 0 small, > ${k2(0.25)} medium, > ${k2(0.50)} large (Hair et al., 2019).`) }
  ];
}
function predictPower(R) {
  const it = R.pred.items, neg = it.filter(x => !(x.q2 > 0)), better = it.filter(x => x.rmsePLS < x.rmseLM).length, n = it.length;
  let code, st;
  if (neg.length) { code = 'neg'; st = 'fail'; } else if (better === n) { code = 'high'; st = 'pass'; } else if (better > n / 2) { code = 'medium'; st = 'pass'; } else if (better > 0) { code = 'low'; st = 'warn'; } else { code = 'none'; st = 'fail'; }
  const level = { neg: tl('tidak memadai pada indikator dengan Q²predict ≤ 0', 'insufficient for indicators with Q²predict ≤ 0'), high: tl('tinggi', 'high'), medium: tl('sedang', 'medium'), low: tl('rendah', 'low'), none: tl('tidak ada (PLS tidak lebih baik dari LM)', 'lacking (PLS is not better than LM)') }[code];
  return { neg, better, n, code, level, st };
}
function predictHTML(R) {
  const pp = predictPower(R);
  return `<div class="callout ${pp.st === 'pass' ? 'ok' : pp.st}"><p><strong>${tl('Daya prediksi ', 'Predictive power: ')}${esc(pp.level)}.</strong> ${pp.neg.length ? tl(`Q²predict ≤ 0 pada ${esc(pp.neg.map(x => R.items[x.k]).join(', '))}.`, `Q²predict ≤ 0 for ${esc(pp.neg.map(x => R.items[x.k]).join(', '))}.`) : tl('Q²predict seluruh indikator endogen di atas 0.', 'Q²predict is above 0 for every endogenous indicator.')} ${tl(`RMSE PLS lebih kecil daripada LM pada ${pp.better} dari ${pp.n} indikator. Pedoman Shmueli dkk. (2019): semua = tinggi, mayoritas = sedang, minoritas = rendah, tidak satu pun = tidak memiliki daya prediksi.`, `PLS RMSE is below the LM RMSE for ${pp.better} of ${pp.n} indicators. Shmueli et al. (2019): all = high, majority = medium, minority = low, none = no predictive power.`)}</p></div>` + predictTables(R).map(tableHTML).join('');
}
function infoRows(R) {
  const S = R.settings, b = R.boot, P = R.pred, e = R.A.est;
  const sch = { path: 'Path', factorial: 'Factorial', centroid: 'Centroid' }[S.scheme];
  return [
    [tl('Proyek', 'Project'), R.name], [tl('Waktu hitung', 'Calculated'), R.time.toLocaleString(LOC())], [tl('File data', 'Data file'), R.source ? R.source.fileName + (R.source.sheet ? ` (sheet ${R.source.sheet})` : '') : '–'],
    [tl('Responden dianalisis', 'Respondents analyzed'), String(R.prep.n)], [tl('Penanganan data hilang', 'Missing data'), R.prep.missing === 'listwise' ? tl(`casewise deletion (${R.prep.nDropped} responden dihapus)`, `casewise deletion (${R.prep.nDropped} respondents removed)`) : tl(`mean replacement (${R.prep.nImputed} sel diisi)`, `mean replacement (${R.prep.nImputed} cells imputed)`)],
    [tl('Algoritma', 'Algorithm'), R.opts.plsc ? 'PLSc (consistent PLS)' : tl('PLS-SEM standar', 'Standard PLS-SEM')], [tl('Skema pembobotan', 'Weighting scheme'), sch],
    [tl('Iterasi', 'Iterations'), `${e.iterations} ${e.converged ? tl('(konvergen)', '(converged)') : tl('(belum konvergen)', '(not converged)')}`], [tl('Kriteria berhenti', 'Stop criterion'), pow10(S.stopExp)], [tl('Iterasi maksimum', 'Maximum iterations'), String(S.maxIter)],
    ['Bootstrapping', b ? tl(`${b.B} subsampel, seed ${S.boot.seed}, CI ${b.ci === 'bca' ? 'BCa' : 'persentil'}, uji ${b.tails === 'two' ? 'dua arah' : 'satu arah'}, α = ${S.boot.alpha}`, `${b.B} subsamples, seed ${S.boot.seed}, ${b.ci === 'bca' ? 'BCa' : 'percentile'} CI, ${b.tails === 'two' ? 'two-tailed' : 'one-tailed'} test, α = ${S.boot.alpha}`) : tl('tidak dijalankan', 'not run')],
    ['PLSpredict', P ? tl(`${P.folds} fold, ${P.reps} pengulangan, pendekatan ${P.approach}, seed ${S.predict.seed}`, `${P.folds} folds, ${P.reps} repetitions, ${P.approach} approach, seed ${S.predict.seed}`) : tl('tidak dijalankan', 'not run')]
  ];
}
function infoTable(R) { return { id: 'info', title: tl('Pengaturan perhitungan', 'Calculation settings'), head: [tl('Butir', 'Item'), tl('Nilai', 'Value')], rows: infoRows(R).map(([k, v]) => [Tc(k), Tc(v)]) }; }
function seminrCode(R) {
  const q = s => JSON.stringify(String(s)), S = R.settings, L = [];
  L.push('library(seminr)', 'library(readxl)', '', `df <- as.data.frame(read_excel(${q(R.source && R.source.kind === 'xlsx' ? R.source.fileName : 'data.xlsx')}))  # ${tl('as.data.frame mencegah error predict_pls', 'as.data.frame avoids the predict_pls error')}`);
  if (R.prep.missing === 'listwise') L.push('df <- na.omit(df)  # casewise deletion');
  L.push('', 'measurement_model <- constructs(');
  R.cons.forEach((c, j) => { const it = 'c(' + c.items.map(q).join(', ') + ')'; const fn = c.mode === 'formative' ? `composite(${q(c.name)}, ${it}, weights = mode_B)` : R.opts.plsc ? `reflective(${q(c.name)}, ${it})` : `composite(${q(c.name)}, ${it})`; L.push('  ' + fn + (j < R.cons.length - 1 ? ',' : '')); });
  L.push(')', '', 'structural_model <- relationships(');
  R.hyp.forEach((h, k) => L.push(`  paths(from = ${q(h.from)}, to = ${q(h.to)})${k < R.hyp.length - 1 ? ',' : ''}`));
  L.push(')', '');
  if (S.scheme === 'centroid') L.push(tl('# skema centroid tidak tersedia di seminr; dipakai path_weighting', '# the centroid scheme is not available in seminr; path_weighting is used'));
  L.push('pls_model <- estimate_pls(', '  data = df,', '  measurement_model = measurement_model,', '  structural_model = structural_model,', `  inner_weights = ${S.scheme === 'factorial' ? 'path_factorial' : 'path_weighting'},`,
    `  missing = mean_replacement, missing_value = ${R.prep.codes.length ? R.prep.codes[0] : 'NA'},`, `  maxIt = ${S.maxIter}, stopCriterion = ${S.stopExp}`, ')', 'summary(pls_model)');
  if (R.boot) L.push('', `boot_model <- bootstrap_model(seminr_model = pls_model, nboot = ${R.boot.B}, seed = ${S.boot.seed})`, `summary(boot_model, alpha = ${S.boot.alpha})`);
  if (R.pred) L.push('', `predict_model <- predict_pls(model = pls_model, technique = predict_${R.pred.approach}, noFolds = ${R.pred.folds}, reps = ${R.pred.reps})`, 'summary(predict_model)');
  return L.join('\n');
}
const etal = () => tl('dkk.', 'et al.');
const refsList = () => [
  'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum.',
  'Dijkstra, T. K., & Henseler, J. (2015). Consistent partial least squares path modeling. MIS Quarterly, 39(2), 297–316.',
  'Hair, J. F., Hult, G. T. M., Ringle, C. M., & Sarstedt, M. (2022). A primer on partial least squares structural equation modeling (PLS-SEM) (3rd ed.). Sage.',
  'Hair, J. F., Risher, J. J., Sarstedt, M., & Ringle, C. M. (2019). When to use and how to report the results of PLS-SEM. European Business Review, 31(1), 2–24.',
  'Hair, J. F., Ringle, C. M., & Sarstedt, M. (2011). PLS-SEM: Indeed a silver bullet. Journal of Marketing Theory and Practice, 19(2), 139–152.',
  `Henseler, J., Dijkstra, T. K., Sarstedt, M., ${etal()} (2014). Common beliefs and reality about PLS. Organizational Research Methods, 17(2), 182–209.`,
  'Henseler, J., Ringle, C. M., & Sarstedt, M. (2015). A new criterion for assessing discriminant validity in variance-based structural equation modeling. Journal of the Academy of Marketing Science, 43(1), 115–135.',
  'Nunnally, J. C., & Bernstein, I. H. (1994). Psychometric theory (3rd ed.). McGraw-Hill.',
  `Shmueli, G., Sarstedt, M., Hair, J. F., ${etal()} (2019). Predictive model assessment in PLS-SEM: Guidelines for using PLSpredict. European Journal of Marketing, 53(11), 2322–2347.`,
  'Zhao, X., Lynch, J. G., & Chen, Q. (2010). Reconsidering Baron and Kenny: Myths and truths about mediation analysis. Journal of Consumer Research, 37(2), 197–206.'
];
const refsHTML = () => `<h3 style="margin:24px 0 8px">${tl('Referensi', 'References')}</h3><ul class="refs">${refsList().map(r => `<li>${esc(r)}</li>`).join('')}</ul>`;
function notesHTML(R) {
  const list = (R.notes && R.notes[I18N.lang]) || [];
  const warn = list.map(t => `<li><i class="bub info"></i><span>${esc(t)}</span></li>`).join('');
  return tableHTML(infoTable(R)) + (warn ? `<h3 style="margin:0 0 8px">${tl('Catatan saat menghitung', 'Notes from the calculation')}</h3><ul class="issues" style="margin-bottom:24px">${warn}</ul>` : '') +
    `<div class="tbl-head"><h3>${tl('Kode R (seminr) yang setara', 'Equivalent R code (seminr)')}</h3>${STATIC ? '' : `<button class="btn btn-quiet" data-action="copy-code">${tl('Salin kode', 'Copy code')}</button>`}</div><pre class="code" id="rcode">${esc(seminrCode(R))}</pre>` +
    `<p class="tbl-note">${tl('Hasil estimasi identik dengan seminr 2.x. Angka bootstrapping dan PLSpredict sedikit berbeda karena pembangkit bilangan acak R berbeda.', 'Estimates are identical to seminr 2.x. Bootstrapping and PLSpredict figures differ slightly because R uses a different random number generator.')}</p>` + refsHTML();
}

/* ================================================================ summary, checks, narrative */
function measurementChecks(R) {
  const A = R.A, e = A.est, out = [], refl = reflIdx(R), form = R.lv.map((_, j) => j).filter(j => !R.refl[j]);
  if (refl.length) {
    const lo = [], vlo = []; let min = Infinity, cnt = 0;
    refl.forEach(j => R.spec.blocks[j].forEach((k, a) => { const v = e.loadings[j][a]; cnt++; min = Math.min(min, v); if (v < 0.4) vlo.push(`${R.items[k]} (${fmt(v)})`); else if (v < 0.7) lo.push(`${R.items[k]} (${fmt(v)})`); }));
    out.push({ st: vlo.length ? 'fail' : lo.length ? 'warn' : 'pass', c: `Outer loading ≥ ${k2(0.70)}`, sec: 'loadings',
      d: lo.length || vlo.length ? tl(`Di bawah ${k2(0.70)}: ${lo.concat(vlo).join(', ')}.`, `Below ${k2(0.70)}: ${lo.concat(vlo).join(', ')}.`) + (vlo.length ? tl(` Loading < ${k2(0.40)} sebaiknya dihapus.`, ` Loadings < ${k2(0.40)} should be removed.`) : tl(' Boleh dipertahankan bila AVE dan reliabilitas konstruknya terpenuhi.', ' They may be retained if the construct\'s AVE and reliability are met.')) : tl(`Seluruh ${cnt} indikator reflektif memenuhi (terendah ${fmt(min)}).`, `All ${cnt} reflective indicators meet the criterion (lowest ${fmt(min)}).`) });
    if (R.boot) { const ns = R.boot.loadings.filter(x => R.refl[x.key[0]] && x.s && !(x.s.P < R.boot.alpha)); out.push({ st: ns.length ? 'fail' : 'pass', c: tl('Signifikansi loading', 'Loading significance'), sec: 'bouter', d: ns.length ? tl(`Tidak signifikan: ${ns.map(x => R.items[x.key[2]]).join(', ')}.`, `Not significant: ${ns.map(x => R.items[x.key[2]]).join(', ')}.`) : tl(`Seluruh loading signifikan (p < ${k2(R.boot.alpha)}).`, `All loadings are significant (p < ${k2(R.boot.alpha)}).`) }); }
    const reflM = refl.filter(j => R.spec.blocks[j].length > 1).length ? refl.filter(j => R.spec.blocks[j].length > 1) : refl;
    const relv = j => [A.alpha[j], A.rhoC[j]], bad = reflM.filter(j => relv(j).some(v => v < 0.70)), high = reflM.filter(j => relv(j).some(v => v > 0.95));
    out.push({ st: bad.some(j => relv(j).some(v => v < 0.6)) ? 'fail' : bad.length || high.length ? 'warn' : 'pass', c: tl(`Reliabilitas (alpha dan rho_C ≥ ${k2(0.70)})`, `Reliability (alpha and rho_C ≥ ${k2(0.70)})`), sec: 'reliability',
      d: `Cronbach's alpha ${rngTxt(reflM.map(j => A.alpha[j]))}; rho_C ${rngTxt(reflM.map(j => A.rhoC[j]))}; rho_A ${rngTxt(reflM.map(j => A.rhoA[j]))}.` + (bad.length ? tl(` Belum memenuhi: ${bad.map(j => R.lv[j]).join(', ')}.`, ` Not met: ${bad.map(j => R.lv[j]).join(', ')}.`) : '') + (high.length ? tl(` Di atas ${k2(0.95)} (indikasi item redundan): ${high.map(j => R.lv[j]).join(', ')}.`, ` Above ${k2(0.95)} (possible redundant items): ${high.map(j => R.lv[j]).join(', ')}.`) : '') });
    const aveBad = refl.filter(j => A.AVE[j] < 0.5);
    out.push({ st: aveBad.length ? 'fail' : 'pass', c: tl(`Validitas konvergen (AVE ≥ ${k2(0.50)})`, `Convergent validity (AVE ≥ ${k2(0.50)})`), sec: 'reliability', d: aveBad.length ? tl(`AVE di bawah ${k2(0.50)}: `, `AVE below ${k2(0.50)}: `) + aveBad.map(j => `${R.lv[j]} (${fmt(A.AVE[j])})`).join(', ') + '.' : `AVE ${rngTxt(refl.map(j => A.AVE[j]))}.` });
    if (refl.length > 1) {
      let mx = -Infinity; const pairs = [];
      refl.forEach((i, a) => refl.forEach((j, b) => { if (b <= a) return; const v = A.HTMT[i][j]; mx = Math.max(mx, v); if (v >= 0.9) pairs.push(`${R.lv[i]}–${R.lv[j]} (${fmt(v)})`); }));
      out.push({ st: pairs.length ? 'fail' : mx >= 0.85 ? 'warn' : 'pass', c: tl(`Validitas diskriminan (HTMT < ${k2(0.90)})`, `Discriminant validity (HTMT < ${k2(0.90)})`), sec: 'htmt', d: pairs.length ? tl(`Tidak terpenuhi: ${pairs.join(', ')}.`, `Not met: ${pairs.join(', ')}.`) : tl(`HTMT tertinggi ${fmt(mx)}${mx >= 0.85 ? `, lolos kriteria ${k2(0.90)} tetapi belum lolos kriteria ketat ${k2(0.85)}` : ''}.`, `Highest HTMT ${fmt(mx)}${mx >= 0.85 ? `, meeting the ${k2(0.90)} but not the stricter ${k2(0.85)} criterion` : ''}.`) });
      if (R.boot) { const over = R.boot.htmt.filter(x => x.s && R.refl[x.key[0]] && R.refl[x.key[1]] && x.s.hi >= 1); out.push({ st: over.length ? 'fail' : 'pass', c: tl('Inferensi HTMT (batas atas CI < 1)', 'HTMT inference (upper CI bound < 1)'), sec: 'bhtmt', d: over.length ? tl('Batas atas ≥ 1: ', 'Upper bound ≥ 1: ') + over.map(x => `${R.lv[x.key[0]]}–${R.lv[x.key[1]]}`).join(', ') + '.' : tl('Batas atas interval kepercayaan HTMT seluruhnya di bawah 1.', 'All upper bounds of the HTMT confidence intervals are below 1.') }); }
      const flBad = refl.filter(i => refl.some(j => j !== i && Math.abs(e.Rlv[i][j]) >= Math.sqrt(A.AVE[i])));
      out.push({ st: flBad.length ? 'fail' : 'pass', c: tl('Kriteria Fornell-Larcker', 'Fornell-Larcker criterion'), sec: 'fl', d: flBad.length ? tl('Akar AVE lebih kecil dari korelasi dengan konstruk lain: ', 'Square root of AVE is below a correlation with another construct: ') + flBad.map(j => R.lv[j]).join(', ') + '.' : tl('Akar AVE setiap konstruk melebihi korelasinya dengan konstruk lain.', 'Each construct\'s square root of AVE exceeds its correlations with other constructs.') });
    }
  }
  if (form.length) {
    const hi = []; form.forEach(j => R.spec.blocks[j].forEach((k, a) => { const v = A.outerVIF[j][a]; if (v >= 5) hi.push(`${R.items[k]} (${fmt(v)})`); }));
    out.push({ st: hi.length ? 'fail' : 'pass', c: tl('Kolinearitas indikator formatif (VIF < 5)', 'Formative indicator collinearity (VIF < 5)'), sec: 'ovif', d: hi.length ? `VIF ≥ 5: ${hi.join(', ')}.` : tl('Seluruh VIF indikator formatif di bawah 5.', 'All formative indicator VIFs are below 5.') });
    if (R.boot) { const ns = R.boot.weights.filter(x => !R.refl[x.key[0]] && x.s && !(x.s.P < R.boot.alpha)); out.push({ st: ns.length ? 'warn' : 'pass', c: tl('Signifikansi outer weights (formatif)', 'Outer weight significance (formative)'), sec: 'bouter', d: ns.length ? tl('Tidak signifikan: ', 'Not significant: ') + ns.map(x => `${R.items[x.key[2]]} (loading ${fmt(e.loadings[x.key[0]][x.key[1]])})`).join(', ') + '.' + tl(` Pertahankan bila loading ≥ ${k2(0.50)}.`, ` Retain them if the loading is ≥ ${k2(0.50)}.`) : tl('Seluruh outer weights signifikan.', 'All outer weights are significant.') }); }
  }
  return out;
}
function structuralChecks(R) {
  const A = R.A, e = A.est, out = [];
  let mx = 0; const hi = [];
  R.hyp.forEach(h => { const v = A.innerVIF[h.i][h.j]; if (Number.isFinite(v)) { mx = Math.max(mx, v); if (v >= 5) hi.push(`${h.from} → ${h.to} (${fmt(v)})`); } });
  out.push({ st: hi.length ? 'fail' : mx >= 3 ? 'warn' : 'pass', c: tl('Kolinearitas antar konstruk (VIF < 5)', 'Construct collinearity (VIF < 5)'), sec: 'ivif', d: hi.length ? `VIF ≥ 5: ${hi.join(', ')}.` : tl(`VIF tertinggi ${fmt(mx)}.`, `Highest VIF ${fmt(mx)}.`) });
  out.push({ st: R.endo.some(j => e.R2[j] > 1) ? 'fail' : 'info', c: tl('Koefisien determinasi (R²)', 'Coefficient of determination (R²)'), sec: 'paths', d: R.endo.map(j => `${R.lv[j]} ${fmt(e.R2[j])} (${r2Cat(e.R2[j])})`).join('; ') + '.' });
  if (R.boot) { const sig = R.hyp.filter(h => { const s = R.bootPath.get(h.i + ',' + h.j); return s && s.P < R.boot.alpha; }); out.push({ st: 'info', c: tl('Signifikansi jalur', 'Path significance'), sec: 'bpaths', d: tl(`${sig.length} dari ${R.hyp.length} hipotesis diterima pada α = ${k2(R.boot.alpha)}`, `${sig.length} of ${R.hyp.length} hypotheses are supported at α = ${k2(R.boot.alpha)}`) + (sig.length ? ': ' + sig.map(h => h.h).join(', ') : '') + '.' }); }
  out.push({ st: R.hyp.some(h => A.f2[h.i][h.j] < 0) ? 'fail' : 'info', c: 'Effect size (f²)', sec: 'f2', d: R.hyp.map(h => `${h.from} → ${h.to} ${fmt(A.f2[h.i][h.j])}`).join('; ') + '.' });
  const s = A.fit.saturated.srmr;
  out.push({ st: s < 0.08 ? 'pass' : s < 0.10 ? 'warn' : 'fail', c: `Model fit (SRMR < ${k2(0.08)})`, sec: 'fit', d: `SRMR saturated ${fmt(s)}, estimated ${fmt(A.fit.estimated.srmr)}.` });
  if (R.pred) { const pp = predictPower(R); out.push({ st: pp.st, c: tl('Kekuatan prediksi (PLSpredict)', 'Predictive power (PLSpredict)'), sec: 'predict', d: (pp.neg.length ? tl('Ada Q²predict ≤ 0', 'Some Q²predict values ≤ 0') : tl('Q²predict seluruh indikator di atas 0', 'Q²predict above 0 for every indicator')) + tl(`; RMSE PLS < LM pada ${pp.better} dari ${pp.n} indikator, sehingga daya prediksi ${pp.level}.`, `; PLS RMSE < LM for ${pp.better} of ${pp.n} indicators, so predictive power is ${pp.level}.`) }); }
  return out;
}
const ST_LABEL = () => ({ pass: tl('memenuhi', 'met'), warn: tl('perlu perhatian', 'needs attention'), fail: tl('tidak memenuhi', 'not met'), info: tl('informasi', 'information') });
function checklistHTML(items) {
  return `<ul class="checklist">${items.map(x => `<li><i class="bub ${x.st}" aria-label="${ST_LABEL()[x.st]}"></i><span class="c">${x.sec && !STATIC ? `<button class="btn-link" data-action="section" data-sec="${x.sec}">${esc(x.c)}</button>` : esc(x.c)}</span><span>${esc(x.d)}</span></li>`).join('')}</ul>`;
}
function narrative(R) {
  const A = R.A, e = A.est, ps = [], refl = reflIdx(R), algo = R.opts.plsc ? 'PLSc (consistent PLS)' : 'PLS-SEM';
  if (refl.length) {
    const lows = []; refl.forEach(j => R.spec.blocks[j].forEach((k, a) => { if (e.loadings[j][a] < 0.7) lows.push(`${R.items[k]} (${fmt(e.loadings[j][a])})`); }));
    let p = tl(`Model pengukuran dievaluasi dengan algoritma ${algo} pada ${R.prep.n} responden. Nilai outer loading berkisar ${rngTxt(refl.flatMap(j => Array.from(e.loadings[j])))}`, `The measurement model was evaluated with the ${algo} algorithm on ${R.prep.n} respondents. Outer loadings ranged from ${rngTxt(refl.flatMap(j => Array.from(e.loadings[j]))).replace('–', ' to ')}`);
    p += lows.length ? tl(`; indikator dengan loading di bawah ${k2(0.70)} adalah ${lows.join(', ')}.`, `; indicators loading below ${k2(0.70)} were ${lows.join(', ')}.`) : tl(`, sehingga seluruh indikator memenuhi batas ${k2(0.70)}.`, `, so every indicator met the ${k2(0.70)} threshold.`);
    const relBad = refl.filter(j => A.alpha[j] < 0.7 || A.rhoC[j] < 0.7);
    p += tl(` Cronbach's alpha berkisar ${rngTxt(refl.map(j => A.alpha[j]))} dan composite reliability (rho_C) ${rngTxt(refl.map(j => A.rhoC[j]))}`, ` Cronbach's alpha ranged from ${rngTxt(refl.map(j => A.alpha[j])).replace('–', ' to ')} and composite reliability (rho_C) from ${rngTxt(refl.map(j => A.rhoC[j])).replace('–', ' to ')}`) + (relBad.length ? tl(`; konstruk ${relBad.map(j => R.lv[j]).join(', ')} belum memenuhi batas ${k2(0.70)}.`, `; ${relBad.map(j => R.lv[j]).join(', ')} did not reach ${k2(0.70)}.`) : tl(', sehingga seluruh konstruk reliabel.', ', so all constructs were reliable.'));
    const aveBad = refl.filter(j => A.AVE[j] < 0.5);
    p += tl(` Nilai AVE berkisar ${rngTxt(refl.map(j => A.AVE[j]))}`, ` AVE values ranged from ${rngTxt(refl.map(j => A.AVE[j])).replace('–', ' to ')}`) + (aveBad.length ? tl(`; validitas konvergen belum terpenuhi pada ${aveBad.map(j => R.lv[j]).join(', ')}.`, `; convergent validity was not established for ${aveBad.map(j => R.lv[j]).join(', ')}.`) : tl(', sehingga validitas konvergen terpenuhi.', ', establishing convergent validity.'));
    if (refl.length > 1) {
      let mx = -Infinity; const bad = [];
      refl.forEach((i, a) => refl.forEach((j, b) => { if (b > a) { mx = Math.max(mx, A.HTMT[i][j]); if (A.HTMT[i][j] >= 0.9) bad.push(`${R.lv[i]}–${R.lv[j]} (${fmt(A.HTMT[i][j])})`); } }));
      p += bad.length ? tl(` Validitas diskriminan berdasarkan HTMT belum terpenuhi pada pasangan ${bad.join(', ')}.`, ` Discriminant validity based on HTMT was not established for ${bad.join(', ')}.`) : tl(` Validitas diskriminan terpenuhi karena seluruh nilai HTMT di bawah ${k2(0.90)} (tertinggi ${fmt(mx)}).`, ` Discriminant validity was established, as all HTMT values were below ${k2(0.90)} (highest ${fmt(mx)}).`);
    }
    ps.push(p);
  }
  let mxv = 0; R.hyp.forEach(h => { const v = A.innerVIF[h.i][h.j]; if (Number.isFinite(v)) mxv = Math.max(mxv, v); });
  ps.push(tl(`Pada model struktural, nilai VIF antar konstruk tertinggi ${fmt(mxv)}`, `In the structural model, the highest inner VIF was ${fmt(mxv)}`) + (mxv < 5 ? tl(', sehingga tidak terdapat masalah kolinearitas.', ', so collinearity was not a concern.') : tl(', menandakan kolinearitas yang perlu diperhatikan.', ', indicating collinearity that needs attention.')) + tl(' Nilai R² ', ' The R² values were ') + R.endo.map(j => tl(`${R.lv[j]} sebesar ${fmt(e.R2[j])} (${r2Cat(e.R2[j])})`, `${fmt(e.R2[j])} for ${R.lv[j]} (${r2Cat(e.R2[j])})`)).join(', ') + '.');
  if (R.boot) {
    const b = R.boot, tails = b.tails === 'two' ? tl('dua arah', 'two-tailed') : tl('satu arah', 'one-tailed');
    ps.push(tl(`Pengujian hipotesis menggunakan bootstrapping ${fmtInt(b.B)} subsampel dengan uji ${tails} pada α = ${k2(b.alpha)}. `, `Hypotheses were tested with bootstrapping (${fmtInt(b.B)} subsamples, ${tails} test, α = ${k2(b.alpha)}). `) + R.hyp.map(h => {
      const s = R.bootPath.get(h.i + ',' + h.j); if (!s) return '';
      const sig = s.P < b.alpha, stat = `β = ${fmt(s.O)}; t = ${fmt(s.T)}; ${fmtPtxt(s.P)}`;
      return tl(`${h.from} berpengaruh ${s.O >= 0 ? 'positif' : 'negatif'} ${sig ? 'dan signifikan' : 'tetapi tidak signifikan'} terhadap ${h.to} (${stat}), sehingga ${h.h} ${sig ? 'diterima' : 'ditolak'}.`, sig ? `${h.from} had a significant ${s.O >= 0 ? 'positive' : 'negative'} effect on ${h.to} (${stat}), supporting ${h.h}.` : `The effect of ${h.from} on ${h.to} was not significant (${stat}), so ${h.h} was not supported.`);
    }).join(' '));
    if (b.chains.length) { const med = b.chains.filter(x => x.s && x.s.P < b.alpha); ps.push(med.length ? tl('Efek tidak langsung yang signifikan: ', 'Significant indirect effects: ') + med.map(x => `${x.key.map(i => R.lv[i]).join(' → ')} (β = ${fmt(x.s.O)}; ${fmtPtxt(x.s.P)})`).join('; ') + '.' : tl('Tidak ada efek tidak langsung (mediasi) yang signifikan.', 'No indirect (mediation) effect was significant.')); }
  }
  if (R.pred) { const pp = predictPower(R); ps.push(tl(`Hasil PLSpredict (${R.pred.folds}-fold, ${R.pred.reps} pengulangan) menunjukkan ${pp.neg.length ? `Q²predict ≤ 0 pada ${pp.neg.map(x => R.items[x.k]).join(', ')}` : 'Q²predict seluruh indikator endogen bernilai positif'}, dan RMSE model PLS lebih kecil daripada benchmark regresi linear pada ${pp.better} dari ${pp.n} indikator, sehingga daya prediksi model tergolong ${pp.level}.`, `PLSpredict (${R.pred.folds} folds, ${R.pred.reps} repetitions) showed ${pp.neg.length ? `Q²predict ≤ 0 for ${pp.neg.map(x => R.items[x.k]).join(', ')}` : 'positive Q²predict values for every endogenous indicator'}, and the PLS model produced a lower RMSE than the linear regression benchmark for ${pp.better} of ${pp.n} indicators, indicating ${pp.level} predictive power.`)); }
  return ps;
}
function summaryHTML(R) {
  const A = R.A, e = A.est, parts = [];
  if (A.issues.length) {
    const lst = A.issues.map(x => (x.type === 'r2' ? `R² ${R.lv[x.j]} = ${fmt(x.value)}` : x.type === 'beta' ? tl(`koefisien ${R.lv[x.i]} → ${R.lv[x.j]} = ${fmt(x.value)}`, `coefficient ${R.lv[x.i]} → ${R.lv[x.j]} = ${fmt(x.value)}`) : x.type === 'loading' ? `loading ${R.items[x.k]} = ${fmt(x.value)}` : x.type === 'corr' ? tl(`korelasi terkoreksi ${R.lv[x.i]}–${R.lv[x.j]} = ${fmt(x.value)}`, `corrected correlation ${R.lv[x.i]}–${R.lv[x.j]} = ${fmt(x.value)}`) : tl('matriks korelasi konstruk terkoreksi tidak definit positif', 'the corrected construct correlation matrix is not positive definite')));
    parts.push(`<div class="callout fail"><p><strong>${tl('Solusi tidak wajar (inadmissible):', 'Inadmissible solution:')}</strong> ${esc(lst.join('; '))}. ${R.opts.plsc ? tl('Ini lazim terjadi pada PLSc dengan sampel kecil dan konstruk yang sangat berkorelasi, dan membuat bootstrap tidak stabil. Pertimbangkan algoritma PLS-SEM standar dan periksa validitas diskriminan (HTMT).', 'This is common for PLSc with small samples and highly correlated constructs, and it makes bootstrapping unstable. Consider the standard PLS-SEM algorithm and check discriminant validity (HTMT).') : tl('Periksa kolinearitas dan validitas diskriminan.', 'Check collinearity and discriminant validity.')}</p></div>`);
  }
  if (!e.converged) parts.push(`<div class="callout warn"><p><strong>${tl('Algoritma belum konvergen', 'The algorithm did not converge')}</strong> ${tl(`setelah ${e.iterations} iterasi. Naikkan iterasi maksimum di pengaturan lanjutan.`, `after ${e.iterations} iterations. Increase the maximum iterations in the advanced settings.`)}</p></div>`);
  if (R.cancelled) parts.push(`<div class="callout warn"><p>${tl('Perhitungan dihentikan sebelum selesai, sehingga sebagian hasil (bootstrapping atau PLSpredict) tidak tersedia.', 'The calculation was stopped early, so some results (bootstrapping or PLSpredict) are unavailable.')}</p></div>`);
  parts.push(`<div class="metric-row">${[[fmtInt(R.prep.n), tl('responden', 'respondents')], [R.model.constructs.length, tl('konstruk', 'constructs')], [(R.base || R).items.length, tl('indikator', 'indicators')], [R.hyp.length, tl('hipotesis', 'hypotheses')], [R.opts.plsc ? 'PLSc' : 'PLS-SEM', tl('algoritma', 'algorithm')]].map(([v, l]) => `<div class="metric"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>`);
  parts.push(`<h3 style="margin-bottom:8px">${tl('Evaluasi model pengukuran', 'Measurement model assessment')}</h3>${checklistHTML(measurementChecks(R))}`);
  parts.push(`<h3 style="margin-bottom:8px">${tl('Evaluasi model struktural', 'Structural model assessment')}</h3>${checklistHTML(structuralChecks(R))}`);
  if (R.boot) parts.push(tableHTML(hypTable(R)));
  else parts.push(`<div class="callout"><p>${tl('Bootstrapping tidak dijalankan, sehingga signifikansi jalur belum diuji. Aktifkan di halaman Hitung.', 'Bootstrapping was not run, so path significance has not been tested. Enable it on the Calculate page.')}</p></div>` + tableHTML(pathListTable(R)));
  parts.push(`<div class="tbl-head" style="margin-top:6px"><h3>${tl('Draf narasi hasil', 'Draft results narrative')}</h3>${STATIC ? '' : `<button class="btn btn-quiet" data-action="copy-narr">${tl('Salin teks', 'Copy text')}</button>`}</div><div class="narr" id="narr">${narrative(R).map(p => `<p>${esc(p)}</p>`).join('')}</div><p class="tbl-note">${tl('Draf singkat untuk membantu menulis bab hasil. Versi lengkap bergaya artikel jurnal ada di bagian Narasi paper.', 'A short draft to help write the results chapter. A full journal-style version is in the Paper narrative section.')}</p>`);
  return parts.join('');
}

/* ================================================================ diagram section */
function diagramValues(R, show) {
  const path = new Map(), r2 = new Map(), mv = new Map(), e = R.A.est;
  R.hyp.forEach(h => { const s = R.boot ? R.bootPath.get(h.i + ',' + h.j) : null; path.set(h.pid, { coef: e.B[h.i][h.j], p: s ? s.P : undefined, t: s ? s.T : undefined }); });
  R.cons.forEach((c, j) => { if (Number.isFinite(e.R2[j])) r2.set(c.id, e.R2[j]); });
  R.spec.blocks.forEach((b, j) => b.forEach((k, a) => {
    const form = !R.refl[j], v = form ? e.W[j][a] : e.loadings[j][a];
    const s = R.boot ? (form ? R.bootWeight.get(k) : R.bootLoad.get(k)) : null;
    mv.set(R.items[k], show === 't' && s ? fmt(s.T) : fmt(v));
  }));
  return { path, r2, mv };
}
function diagramExportSVG(standalone) {
  const R = state.results, show = R.boot ? state.view.diagram : 'coef';
  return diagramSVG(R.model, { idp: standalone ? 'ex' : 'rs', values: diagramValues(R, show), show, alpha: R.boot ? R.boot.alpha : 0.05, standalone, style: dgStyle() });
}
function diagramSection(R) {
  const show = R.boot ? state.view.diagram : 'coef';
  const seg = R.boot && !STATIC ? `<div class="seg" role="group" aria-label="${tl('Isi label jalur', 'Path label content')}">${[['coef', tl('Koefisien', 'Coefficients')], ['coefp', tl('Koefisien (p value)', 'Coefficients (p values)')], ['coefs', tl('Koefisien + bintang', 'Coefficients + stars')], ['t', tl('t statistik', 't statistics')]].map(([v, t]) => `<button data-action="dgshow" data-v="${v}" aria-pressed="${show === v}">${t}</button>`).join('')}</div>` : '<span></span>';
  const tools = STATIC ? '' : `<div class="row" style="justify-content:space-between;margin-bottom:12px">${seg}<div class="row" style="gap:6px"><button class="btn${state.ui.dgCust ? ' btn-on' : ''}" data-action="dg-cust" aria-expanded="${!!state.ui.dgCust}">${tl('Sesuaikan tampilan', 'Customize')}</button><button class="btn" data-action="dl-svg">${tl('Unduh SVG', 'Download SVG')}</button><button class="btn" data-action="dl-png">${tl('Unduh PNG', 'Download PNG')}</button></div></div>`;
  const lab = R.refl.some(x => !x) ? tl('loading (reflektif) atau weight (formatif)', 'loading (reflective) or weight (formative)') : 'outer loading';
  return `${tools}${!STATIC && state.ui.dgCust ? dgCustomHTML() : ''}${STATIC ? '' : dgEditBar()}<div class="dg-stage"><div class="figure" id="res-dg">${diagramExportSVG(false)}</div><div class="dg-pop" id="dg-pop" hidden></div></div><p class="tbl-note">${dgNote(R, show)}</p>`;
}

/* ================================================================ sections registry */
const SECTIONS = [
  { id: 'summary', group: () => tl('Ikhtisar', 'Overview'), title: () => tl('Ringkasan dan uji hipotesis', 'Summary and hypothesis tests'), short: () => tl('Ringkasan', 'Summary'), render: summaryHTML, tables: R => (R.boot ? [hypTable(R)] : [pathListTable(R)]) },
  { id: 'diagram', group: () => tl('Ikhtisar', 'Overview'), title: () => tl('Diagram jalur', 'Path diagram'), render: diagramSection },
  { id: 'desc', group: () => 'Data', title: () => tl('Statistik deskriptif', 'Descriptive statistics'), short: () => tl('Deskriptif', 'Descriptives'), tables: R => [descTable(R)] },
  { id: 'likert', group: () => 'Data', title: () => tl('Sebaran jawaban', 'Response distribution'), short: () => tl('Sebaran jawaban', 'Responses'), need: R => !!R.freq, render: likertHTML, tables: R => [freqTable(R)] },
  { id: 'classic', group: () => tl('Uji instrumen klasik', 'Classical instrument tests'), title: () => tl('Validitas dan reliabilitas item', 'Item validity and reliability'), short: () => tl('Uji klasik', 'Classical tests'), lead: () => tl("Uji klasik seperti pada Rmd: korelasi item–total terkoreksi (Pearson) dibandingkan dengan r tabel, dan Cronbach's alpha data mentah. Lazim dilaporkan sebagai uji instrumen sebelum analisis PLS-SEM.", "Classical tests as in the Rmd: corrected item–total (Pearson) correlations compared with the critical r, and raw-data Cronbach's alpha. Commonly reported as an instrument check before the PLS-SEM analysis."), tables: classicTables },
  { id: 'loadings', group: () => tl('Model pengukuran', 'Measurement model'), title: () => 'Outer loadings', lead: () => tl(`Loading menunjukkan seberapa kuat setiap indikator mencerminkan konstruknya. Loading ≥ ${k2(0.70)} berarti konstruk menjelaskan lebih dari separuh varians indikator.`, `Loadings show how strongly each indicator reflects its construct. A loading ≥ ${k2(0.70)} means the construct explains more than half of the indicator's variance.`), tables: R => [loadingsTable(R)] },
  { id: 'weights', group: () => tl('Model pengukuran', 'Measurement model'), title: () => 'Outer weights', tables: R => [weightsTable(R)] },
  { id: 'reliability', group: () => tl('Model pengukuran', 'Measurement model'), title: () => tl('Reliabilitas dan validitas konvergen', 'Reliability and convergent validity'), short: () => tl('Reliabilitas & AVE', 'Reliability & AVE'), lead: () => tl("Reliabilitas konsistensi internal (Cronbach's alpha, rho_A, rho_C) dan validitas konvergen (AVE) untuk konstruk reflektif.", "Internal consistency reliability (Cronbach's alpha, rho_A, rho_C) and convergent validity (AVE) of the reflective constructs."), render: relHTML, tables: R => [relTable(R)] },
  { id: 'fl', group: () => tl('Model pengukuran', 'Measurement model'), title: () => tl('Kriteria Fornell-Larcker', 'Fornell-Larcker criterion'), short: () => 'Fornell-Larcker', tables: R => [flTable(R)] },
  { id: 'htmt', group: () => tl('Model pengukuran', 'Measurement model'), title: () => 'Heterotrait-monotrait ratio (HTMT)', short: () => 'HTMT', lead: () => tl('HTMT adalah kriteria validitas diskriminan yang direkomendasikan: rasio rata-rata korelasi antar-konstruk terhadap rata-rata korelasi di dalam konstruk.', 'HTMT is the recommended discriminant validity criterion: the mean between-construct correlation relative to the mean within-construct correlation.'), tables: R => [htmtTable(R)] },
  { id: 'cross', group: () => tl('Model pengukuran', 'Measurement model'), title: () => 'Cross loadings', tables: R => [crossTable(R)] },
  { id: 'ovif', group: () => tl('Model pengukuran', 'Measurement model'), title: () => tl('Kolinearitas indikator (VIF luar)', 'Indicator collinearity (outer VIF)'), short: () => tl('VIF luar', 'Outer VIF'), tables: R => [outerVifTable(R)] },
  { id: 'paths', group: () => tl('Model struktural', 'Structural model'), title: () => tl('Koefisien jalur dan R²', 'Path coefficients and R²'), short: () => tl('Jalur dan R2', 'Paths and R2'), tables: R => [pathListTable(R), pathMatrixTable(R), r2Table(R)] },
  { id: 'f2', group: () => tl('Model struktural', 'Structural model'), title: () => 'Effect size (f²)', short: () => 'f2', tables: R => [f2Table(R)] },
  { id: 'ivif', group: () => tl('Model struktural', 'Structural model'), title: () => tl('Kolinearitas antar konstruk (VIF dalam)', 'Construct collinearity (inner VIF)'), short: () => tl('VIF dalam', 'Inner VIF'), tables: R => [innerVifTable(R)] },
  { id: 'effects', group: () => tl('Model struktural', 'Structural model'), title: () => tl('Efek total dan tidak langsung', 'Total and indirect effects'), short: () => tl('Efek total', 'Total effects'), tables: effectsTables },
  { id: 'fit', group: () => tl('Model struktural', 'Structural model'), title: () => tl('Model fit dan kriteria informasi', 'Model fit and information criteria'), short: () => 'Model fit', tables: R => [fitTable(R), itTable(R)] },
  { id: 'bpaths', group: () => 'Bootstrapping', title: () => tl('Uji hipotesis (koefisien jalur)', 'Hypothesis tests (path coefficients)'), short: () => tl('Boot jalur', 'Boot paths'), need: R => !!R.boot, tables: R => [hypTable(R), bootR2Table(R)] },
  { id: 'bindirect', group: () => 'Bootstrapping', title: () => tl('Efek tidak langsung (mediasi)', 'Indirect effects (mediation)'), short: () => tl('Boot mediasi', 'Boot mediation'), need: R => !!R.boot && R.boot.chains.length > 0, tables: R => [mediationTable(R), bootTotalIndTable(R)] },
  { id: 'btotal', group: () => 'Bootstrapping', title: () => tl('Efek total', 'Total effects'), short: () => tl('Boot efek total', 'Boot total effects'), need: R => !!R.boot, tables: R => [bootTotalTable(R)] },
  { id: 'bouter', group: () => 'Bootstrapping', title: () => tl('Signifikansi loadings dan weights', 'Significance of loadings and weights'), short: () => tl('Boot outer', 'Boot outer'), need: R => !!R.boot, tables: R => [bootOuterTable(R, 'load'), bootOuterTable(R, 'weight')] },
  { id: 'bhtmt', group: () => 'Bootstrapping', title: () => tl('Interval kepercayaan HTMT', 'HTMT confidence intervals'), short: () => 'Boot HTMT', need: R => !!R.boot && reflIdx(R).length > 1, tables: R => [bootHTMTTable(R)] },
  { id: 'predict', group: () => 'PLSpredict', title: () => tl('Kekuatan prediksi (PLSpredict)', 'Predictive power (PLSpredict)'), short: () => 'PLSpredict', need: R => !!R.pred, render: predictHTML, tables: predictTables },
  { id: 'notes', group: () => tl('Lainnya', 'Other'), title: () => tl('Catatan algoritma dan kode R', 'Algorithm notes and R code'), short: () => tl('Catatan', 'Notes'), render: notesHTML, tables: () => [] }
];
const availableSections = R => SECTIONS.filter(s => !s.need || s.need(R));
function renderSection(sec, R) {
  const lead = sec.lead ? `<p class="lead">${esc(sec.lead(R))}</p>` : '';
  return `<h2>${esc(sec.title())}</h2>${lead}${vizBlock(sec.id, R)}${sec.render ? sec.render(R) : sec.tables(R).map(tableHTML).join('')}`;
}

/* ================================================================ exports (Excel, HTML) */
function exportXLSX() {
  const R = state.results; if (!R) return;
  try {
    const sheets = withLang(exportLang(), () => {
      const out = [{ name: 'Info', rows: [[{ v: tl('Hasil analisis PLS-SEM (SEMbada)', 'PLS-SEM results (SEMbada)'), bold: true }], []].concat(infoRows(R)) }];
      availableSections(R).forEach(sec => {
        const tms = sec.tables ? sec.tables(R) : []; if (!tms.length) return;
        const rows = [];
        tms.forEach((tm, t) => {
          if (t) rows.push([]);
          rows.push([{ v: tm.title, bold: true }], tm.head.map(h => ({ v: h, bold: true })));
          tm.rows.forEach(r => rows.push(r && r.grp !== undefined ? [{ v: r.grp, bold: true }] : r.map(cellRaw)));
          if (tm.note) rows.push([stripTags(tm.note)]);
        });
        out.push({ name: (sec.short || sec.title)(), rows });
      });
      out.push({ name: tl('Narasi', 'Narrative'), rows: narrative(R).map(p => [p]) });
      out.push({ name: tl('Kode R', 'R code'), rows: seminrCode(R).split('\n').map(l => [l]) });
      return out;
    });
    download(safeFile(state.name) + (exportLang() === 'en' ? '_results_PLS-SEM.xlsx' : '_hasil_PLS-SEM.xlsx'), new Blob([IO.writeXLSX(sheets)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    if (!NATIVE) toast(tl('File Excel hasil diunduh.', 'Excel results downloaded.'), 'ok');
  } catch (e) { console.error(e); toast(tl('Gagal membuat file Excel: ', 'Could not create the Excel file: ') + e.message, 'err'); }
}
const REPORT_CSS = 'html,body{height:auto}.report{max-width:1100px;margin:0 auto;padding:36px 28px 60px}.rep-head{border-bottom:2px solid var(--rule);padding-bottom:14px;margin-bottom:26px}.rep-head p{max-width:none}.rep-sec{margin-bottom:40px}.rep-sec>h2{margin-bottom:8px;padding-top:14px;border-top:1px solid var(--line)}.tbl-wrap{max-height:none!important;overflow:visible}.figure svg{min-width:0}@media print{.report{padding:0}.rep-sec{break-before:auto}.tbl-block{break-inside:avoid}}';
function exportHTML() {
  const R = state.results; if (!R) return;
  const L = exportLang();
  STATIC = true;
  try {
    const html = withLang(L, () => {
      const body = availableSections(R).map(s => `<section class="rep-sec">${renderSection(s, R)}</section>`).join('');
      return `<!DOCTYPE html><html lang="${L}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(R.name)}: ${tl('laporan PLS-SEM', 'PLS-SEM report')}</title><style>${$('#app-css').textContent}</style><style>${REPORT_CSS}</style></head><body><div class="report"><header class="rep-head"><h1>${esc(R.name)}</h1><p class="muted">${tl(`Laporan PLS-SEM dari SEMbada, dibuat ${esc(new Date().toLocaleString(LOC()))}.`, `PLS-SEM report from SEMbada, created ${esc(new Date().toLocaleString(LOC()))}.`)} ${esc(R.source ? tl('Data: ', 'Data: ') + R.source.fileName + '. ' : '')}${tl(`${R.prep.n} responden, algoritma ${R.opts.plsc ? 'PLSc' : 'PLS-SEM'}.`, `${R.prep.n} respondents, ${R.opts.plsc ? 'PLSc' : 'PLS-SEM'} algorithm.`)}</p></header>${body}</div></body></html>`;
    });
    download(safeFile(state.name) + (L === 'en' ? '_report_PLS-SEM.html' : '_laporan_PLS-SEM.html'), html, 'text/html;charset=utf-8');
    if (!NATIVE) toast(tl('Laporan HTML diunduh. Buka di browser, lalu Cetak > Simpan sebagai PDF bila perlu.', 'HTML report downloaded. Open it in a browser and use Print > Save as PDF if needed.'), 'ok');
  } catch (e) { console.error(e); toast(tl('Gagal membuat laporan: ', 'Could not create the report: ') + e.message, 'err'); }
  finally { STATIC = false; }
}
async function downloadPNG() {
  try {
    const st = dgStyle(), tr = st.pngBg === 'transparent', R = state.results, show = R.boot ? state.view.diagram : 'coef';
    const svg = diagramSVG(R.model, { idp: 'ex', values: diagramValues(R, show), show, alpha: R.boot ? R.boot.alpha : 0.05, standalone: true, style: st, transparent: tr });
    const out = await svgToPng(svg, +st.pngScale || 3, tr);
    download(safeFile(state.name) + '_diagram.png', new Blob([out.bytes], { type: 'image/png' }));
  } catch (e) { toast(tl('Gagal membuat PNG: ', 'Could not create the PNG: ') + e.message, 'err'); }
}
