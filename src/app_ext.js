/* ================================================================ advanced analyses: higher-order constructs and moderation (two-stage),
   multigroup analysis with MICOM and permutation tests, importance-performance map analysis, minimum sample size */
const INT_SEP = ' × ';
const isHoc = c => !!(c && Array.isArray(c.locs));
function extModel(model) {
  const hocs = model.constructs.filter(c => isHoc(c) && c.locs.length);
  const mods = (model.moderations || []).filter(m => model.paths.some(p => p.id === m.path) && model.constructs.some(c => c.id === m.moderator));
  return { hocs, mods, any: hocs.length > 0 || mods.length > 0 };
}
const locOwner = (model, id) => model.constructs.find(h => isHoc(h) && h.locs.includes(id));
function topoConstructs(nodes, edges) {
  const L = nodes.length, pos = new Map(nodes.map((c, i) => [c.id, i])), D0 = nodes.map(() => new Array(L).fill(0));
  edges.forEach(([a, b]) => { if (pos.has(a) && pos.has(b)) D0[pos.get(a)][pos.get(b)] = 1; });
  const order = PLS.topoOrder(D0) || nodes.map((_, i) => i), cons = order.map(i => nodes[i]), idx = new Map(cons.map((c, i) => [c.id, i]));
  const D = cons.map(() => new Array(L).fill(0)); edges.forEach(([a, b]) => { if (idx.has(a) && idx.has(b)) D[idx.get(a)][idx.get(b)] = 1; });
  return { cons, idx, D };
}
const zcol = x => { const n = x.length; let m = 0; for (let i = 0; i < n; i++) m += x[i]; m /= n; let v = 0; for (let i = 0; i < n; i++) v += (x[i] - m) ** 2; const sd = Math.sqrt(v / (n - 1)) || 1; return Float64Array.from(x, t => (t - m) / sd); };
const corr = (x, y) => { const n = x.length; let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; } return sxy / Math.sqrt(sxx * syy); };
const meanVar = (x, from, to) => { let m = 0; for (let i = from; i < to; i++) m += x[i]; m /= (to - from); let v = 0; for (let i = from; i < to; i++) v += (x[i] - m) ** 2; return [m, v / (to - from - 1)]; };

/* ---- minimum sample size: inverse square root method (Kock & Hadaya, 2018), power 80%, one-tailed */
const ISR = { 0.01: 3.168, 0.05: 2.486, 0.1: 2.123 };
const nMinISR = (beta, alpha) => { const b = Math.abs(beta); return b > 0 ? Math.ceil(((ISR[alpha] || ISR[0.05]) / b) ** 2) : Infinity; };
function sampleSizeTable(R) {
  const e = R.A.est, all = R.hyp.filter(h => !h.mod).map(h => ({ h, v: Math.abs(e.B[h.i][h.j]), s: R.boot ? R.bootPath.get(h.i + ',' + h.j) : null })).filter(x => Number.isFinite(x.v)).sort((a, c) => a.v - c.v), sig = all.filter(x => x.s && x.s.P < R.boot.alpha), paths = sig.length ? sig : all, mn = paths[0], n = R.prep.n, basis = sig.length ? 'sig' : 'all';
  const rows = [0.01, 0.05, 0.1].map(a => { const nm = mn ? nMinISR(mn.v, a) : NaN, ok = n >= nm; return [Tc(`${fmt(a * 100, 0)}%`), Tc(mn ? `${mn.h.from} → ${mn.h.to}` : '–'), Nc(mn ? mn.v : NaN), Nc(nm, null, { d: 0 }), Nc(n, null, { d: 0 }), Tc(ok ? tl('cukup', 'sufficient') : tl('belum cukup', 'insufficient'), ok ? 'pass' : 'warn'), Nc((ISR[a]) / Math.sqrt(n))]; });
  return { id: 'ssize', basis, title: tl('Ukuran sampel minimum (inverse square root)', 'Minimum sample size (inverse square root)'), head: [tl('Taraf signifikansi', 'Significance level'), tl('Jalur terkecil', 'Smallest path'), '|β| min', 'n min', 'n', tl('Status', 'Status'), tl('|β| terkecil yang terdeteksi', 'Smallest detectable |β|')], rows,
    note: tl(`n min = (c / |β min|)², dengan c = 3,168; 2,486; 2,123 untuk taraf 1%, 5%, 10% (uji satu arah, power 80%; Kock dan Hadaya, 2018). |β min| = koefisien jalur absolut terkecil ${basis === 'sig' ? 'di antara jalur yang signifikan' : 'dalam model'}.`, `n min = (c / |β min|)², with c = 3.168, 2.486, 2.123 for the 1%, 5%, and 10% levels (one-tailed test, 80% power; Kock and Hadaya, 2018). |β min| = smallest absolute path coefficient ${basis === 'sig' ? 'among the significant paths' : 'in the model'}.`) };
}

/* ---- moderation: stage-2 coefficients, simple slopes */
function modInfo(R) {
  if (!R.ext || !R.ext.mods.length) return [];
  const B = R.A.est.B;
  return R.ext.mods.map((m, k) => {
    const p = R.model.paths.find(q => q.id === m.path), j = R.idx.get('int:' + m.id), x = R.idx.get(p.from), mo = R.idx.get(m.moderator), y = R.idx.get(p.to);
    const h = R.hyp.find(q => q.pid === 'int:' + m.id), s = R.boot ? R.bootPath.get(j + ',' + y) : null;
    const b1 = B[x][y] || 0, b2 = R.spec.D[mo][y] ? B[mo][y] : 0, b3 = B[j][y];
    return { m, k, h, j, x, mo, y, b1, b2, b3, s, f2: R.A.f2[j][y], X: R.lv[x], M: R.lv[mo], Y: R.lv[y], slopes: [b1 - b3, b1, b1 + b3] };
  });
}
const f2IntCat = v => (!Number.isFinite(v) ? '–' : v >= 0.025 ? tl('besar', 'large') : v >= 0.01 ? tl('sedang', 'medium') : v >= 0.005 ? tl('kecil', 'small') : tl('sangat kecil', 'negligible'));
function moderationTable(R) {
  const a = R.boot ? R.boot.alpha : 0.05;
  return { id: 'mod', title: tl('Efek moderasi (pendekatan dua tahap)', 'Moderating effects (two-stage approach)'), head: [tl('Hipotesis', 'Hypothesis'), tl('Moderasi', 'Moderation'), tl('Efek interaksi (β)', 'Interaction effect (β)'), tl('T statistik', 'T statistic'), 'P value', `CI ${R.boot ? pctLabel(R.boot.lo) : ''}`, `CI ${R.boot ? pctLabel(R.boot.hi) : ''}`, 'f²', tl('Keputusan', 'Decision')],
    rows: modInfo(R).map(d => { const sig = !!(d.s && d.s.P < a); return [Tc(d.h ? d.h.h : ''), Tc(tl(`${d.M} pada ${d.X} → ${d.Y}`, `${d.M} on ${d.X} → ${d.Y}`)), Nc(d.b3), d.s ? Nc(d.s.T) : null, d.s ? Pc(d.s.P, sig ? 'pass' : null) : null, d.s ? Nc(d.s.lo) : null, d.s ? Nc(d.s.hi) : null, Tc(`${fmt(d.f2)} (${f2IntCat(d.f2)})`, null, { num: true }), Tc(R.boot ? decideTxt(sig) : tl('belum diuji', 'not tested'), sig ? 'pass' : 'mute')]; }),
    note: tl('Tahap 1 mengestimasi model efek utama; skor konstruk terstandar X dan M dikalikan menjadi indikator tunggal term interaksi pada tahap 2 (Henseler dan Chin, 2010). Kedua tahap diulang pada setiap sampel bootstrap. Ukuran efek interaksi menurut Kenny: 0,005 kecil, 0,01 sedang, 0,025 besar.', 'Stage 1 estimates the main-effects model; the standardized scores of X and M are multiplied to form the single indicator of the interaction term in stage 2 (Henseler and Chin, 2010). Both stages are repeated in every bootstrap sample. Interaction effect sizes following Kenny: 0.005 small, 0.01 medium, 0.025 large.') };
}
function slopeTable(R) {
  return { id: 'slopes', title: tl('Analisis simple slope', 'Simple slope analysis'), head: [tl('Jalur yang dimoderasi', 'Moderated path'), tl('Moderator −1 SD', 'Moderator −1 SD'), tl('Moderator rata-rata', 'Moderator mean'), tl('Moderator +1 SD', 'Moderator +1 SD')],
    rows: modInfo(R).map(d => [Tc(`${d.X} → ${d.Y} (${d.M})`)].concat(d.slopes.map(v => Nc(v)))), note: tl('Kemiringan efek X terhadap Y pada tiga tingkat moderator: β(X→Y) + β(interaksi) × M.', 'Slope of the effect of X on Y at three moderator levels: β(X→Y) + β(interaction) × M.') };
}

/* ---- higher-order constructs */
function hocInfo(R) {
  if (!R.ext || !R.ext.hocs.length) return [];
  return R.ext.hocs.map(h => { const j = R.idx.get(h.id); return { h, j, name: R.lv[j], refl: h.mode !== 'formative', locs: R.spec.blocks[j].map((k, a) => ({ k, a, name: R.items[k], j1: R.base.idx.get(h.locs[a]) })) }; });
}
function hocLocTable(R) {
  const A1 = R.A1, rows = [];
  hocInfo(R).forEach(H => H.locs.forEach(l => { const j = l.j1, ld = Array.from(A1.est.loadings[j]); rows.push([Tc(l.name), Tc(H.name), Tc(`${fmt(Math.min(...ld))}–${fmt(Math.max(...ld))}`, null, { num: true }), Nc(A1.alpha[j], stRel(A1.alpha[j])), Nc(A1.rhoA[j], stRel(A1.rhoA[j])), Nc(A1.rhoC[j], stRel(A1.rhoC[j])), Nc(A1.AVE[j], stAVE(A1.AVE[j]))]); }));
  return { id: 'hoc-loc', title: tl('Konstruk orde rendah (tahap 1)', 'Lower-order constructs (stage 1)'), head: [tl('Konstruk orde rendah', 'Lower-order construct'), tl('Konstruk orde tinggi', 'Higher-order construct'), 'Outer loadings', "Cronbach's alpha", 'rho_A', 'rho_C', 'AVE'], rows,
    note: tl('Tahap 1 menghubungkan konstruk orde rendah langsung dengan konstruk lain yang terkait dengan konstruk orde tinggi (disjoint two-stage; Sarstedt dkk., 2019). Reliabilitas dan validitasnya dinilai di sini.', 'Stage 1 links the lower-order constructs directly to the constructs related to the higher-order construct (disjoint two-stage; Sarstedt et al., 2019). Their reliability and validity are assessed here.') };
}
function hocMeasTable(R) {
  const e = R.A.est, a = R.boot ? R.boot.alpha : 0.05, rows = [];
  hocInfo(R).forEach(H => H.locs.forEach(l => { const s = R.boot ? (H.refl ? R.bootLoad.get(l.k) : R.bootWeight.get(l.k)) : null; rows.push([Tc(H.name), Tc(l.name), Nc(e.loadings[H.j][l.a], H.refl ? stLoad(e.loadings[H.j][l.a]) : null), Nc(e.W[H.j][l.a]), Nc(R.A.outerVIF[H.j][l.a], H.refl ? null : stVIF(R.A.outerVIF[H.j][l.a])), s ? Pc(s.P, s.P < a ? 'pass' : null) : null, Tc(H.refl ? tl('reflektif', 'reflective') : tl('formatif', 'formative'))]); }));
  return { id: 'hoc-meas', title: tl('Model pengukuran konstruk orde tinggi (tahap 2)', 'Higher-order construct measurement (stage 2)'), head: [tl('Konstruk orde tinggi', 'Higher-order construct'), tl('Konstruk orde rendah (indikator)', 'Lower-order construct (indicator)'), 'Loading', 'Weight', 'VIF', 'P value', tl('Jenis', 'Type')], rows,
    note: tl('Pada tahap 2, skor konstruk orde rendah menjadi indikator konstruk orde tinggi. Untuk tipe reflektif nilai loading yang dinilai; untuk tipe formatif nilai weight dan VIF.', 'In stage 2, the lower-order construct scores serve as indicators of the higher-order construct. Loadings are assessed for the reflective type; weights and VIF for the formative type.') };
}

/* ---- multigroup analysis: group bootstraps, MICOM steps 2-3, permutation, parametric and Welch tests */
function groupValues(colName) {
  const c = colByName(colName); if (!c) return [];
  const vals = new Map(); for (let i = 0; i < state.data.nRows; i++) { const v = mgaVal(c, i); if (v !== null && v !== '') vals.set(v, (vals.get(v) || 0) + 1); }
  return Array.from(vals.entries()).sort((a, b) => b[1] - a[1]);
}
const mgaVal = (c, i) => (c.numeric ? (Number.isNaN(c.values[i]) ? null : String(c.values[i])) : (c.raw ? String(c.raw[i] === undefined || c.raw[i] === null ? '' : c.raw[i]).trim() : null));
const groupColumns = () => (state.data ? state.data.columns.filter(c => { let k = 0; const s = new Set(); for (let i = 0; i < state.data.nRows && s.size <= 10; i++) { const v = mgaVal(c, i); if (v !== null && v !== '') { s.add(v); k++; } } return s.size >= 2 && s.size <= 10 && k >= 20; }).map(c => c.name) : []);
async function runMGA(prep, opts, S, progress, cancel) {
  const g = S.mga, col = colByName(g.column);
  if (!col) throw new Error(tl('Kolom pengelompokan untuk MGA tidak ditemukan.', 'The grouping column for MGA was not found.'));
  const ia = [], ib = []; prep.rows.forEach((r, i) => { const v = mgaVal(col, r); if (v === g.a) ia.push(i); else if (v === g.b) ib.push(i); });
  const minN = Math.max(10, prep.spec.lv.length + 2);
  if (ia.length < minN || ib.length < minN) throw new Error(tl(`Ukuran grup terlalu kecil untuk MGA (${g.a}: ${ia.length}, ${g.b}: ${ib.length}).`, `Group sizes are too small for MGA (${g.a}: ${ia.length}, ${g.b}: ${ib.length}).`));
  const spec = prep.spec, sub = idx => PLS.resample(prep.cols, idx), L = spec.lv.length, nA = ia.length, nB = ib.length, pool = ia.concat(ib), N = pool.length;
  const estA = PLS.estimate(sub(ia), spec, opts), estB = PLS.estimate(sub(ib), spec, opts), estP = PLS.estimate(sub(pool), spec, opts);
  const bo = { B: S.boot.B, seed: S.boot.seed, ci: 'percentile', tails: S.boot.tails, alpha: S.boot.alpha, htmt: false };
  const bootA = await PLS.bootstrap(sub(ia), spec, opts, bo, f => progress(tl(`MGA: bootstrapping grup ${g.a}`, `MGA: bootstrapping group ${g.a}`), 0.35 * f), cancel);
  const bootB = await PLS.bootstrap(sub(ib), spec, opts, Object.assign({}, bo, { seed: bo.seed + 1 }), f => progress(tl(`MGA: bootstrapping grup ${g.b}`, `MGA: bootstrapping group ${g.b}`), 0.35 + 0.35 * f), cancel);
  const Zp = sub(pool).map(zcol), comp = (w, j) => { const out = new Float64Array(N); spec.blocks[j].forEach((k, a) => { const z = Zp[k], wa = w[a]; for (let i = 0; i < N; i++) out[i] += wa * z[i]; }); return out; };
  const S3 = spec.lv.map((_, j) => zcol(comp(estP.W[j], j)));
  const step3 = (perm) => S3.map(s => { const x = perm ? Float64Array.from(perm, i => s[i]) : s, [mA, vA] = meanVar(x, 0, nA), [mB, vB] = meanVar(x, nA, N); return [mA - mB, Math.log(vA / vB)]; });
  const pairs = []; for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (spec.D[i][j]) pairs.push([i, j]);
  const dObs = pairs.map(([i, j]) => estA.B[i][j] - estB.B[i][j]), cObs = spec.lv.map((_, j) => corr(comp(estA.W[j], j), comp(estB.W[j], j))), s3Obs = step3(null);
  const P = Math.max(100, Math.min(5000, g.perms || 1000)), rng = PLS.makeRng((S.boot.seed || 123) + 77), dPerm = pairs.map(() => []), cPerm = spec.lv.map(() => []), mdPerm = spec.lv.map(() => []), lvPerm = spec.lv.map(() => []);
  const order = Array.from({ length: N }, (_, i) => i); let fails = 0, last = Date.now();
  for (let r = 0; r < P; r++) {
    for (let i = N - 1; i > 0; i--) { const k = rng.int(i + 1), t = order[i]; order[i] = order[k]; order[k] = t; }
    const pa = order.slice(0, nA).map(i => pool[i]), pb = order.slice(nA).map(i => pool[i]);
    let ea, eb; try { ea = PLS.estimate(sub(pa), spec, opts); eb = PLS.estimate(sub(pb), spec, opts); } catch (e) { fails++; continue; }
    pairs.forEach(([i, j], q) => dPerm[q].push(ea.B[i][j] - eb.B[i][j]));
    spec.lv.forEach((_, j) => { const wa = ea.W[j], wb = eb.W[j], ca = new Float64Array(N), cb = new Float64Array(N); spec.blocks[j].forEach((k, a) => { const z = Zp[k]; for (let i = 0; i < N; i++) { ca[i] += wa[a] * z[i]; cb[i] += wb[a] * z[i]; } }); cPerm[j].push(corr(ca, cb)); });
    step3(order).forEach(([md, lv], j) => { mdPerm[j].push(md); lvPerm[j].push(lv); });
    if (Date.now() - last > 40) { last = Date.now(); progress(tl(`MGA: permutasi ${r + 1} dari ${P}`, `MGA: permutation ${r + 1} of ${P}`), 0.7 + 0.3 * (r + 1) / P); await tick(); if (cancel()) throw new PLS.PLSError('cancel', 'Dibatalkan.'); }
  }
  const q = (arr, p) => PLS.quantile7(arr.slice().sort((a, b) => a - b), p), statOf = (bt, i, j) => { const x = bt.paths.find(y => y.key[0] === i && y.key[1] === j); return x ? x.s : null; };
  const paths = pairs.map(([i, j], k) => {
    const sa = statOf(bootA, i, j), sb = statOf(bootB, i, j), d = dObs[k], ad = Math.abs(d), seA = sa ? sa.SD : NaN, seB = sb ? sb.SD : NaN;
    const pPerm = (dPerm[k].filter(x => Math.abs(x) >= ad).length + 1) / (dPerm[k].length + 1);
    const pooled = Math.sqrt(((nA - 1) ** 2 / (nA + nB - 2)) * seA ** 2 + ((nB - 1) ** 2 / (nA + nB - 2)) * seB ** 2) * Math.sqrt(1 / nA + 1 / nB), pPar = 2 * (1 - PLS.tcdf(ad / pooled, nA + nB - 2));
    const sw = Math.sqrt(seA ** 2 + seB ** 2), dfW = (seA ** 2 + seB ** 2) ** 2 / (seA ** 4 / (nA - 1) + seB ** 4 / (nB - 1)), pW = 2 * (1 - PLS.tcdf(ad / sw, dfW));
    return { i, j, bA: estA.B[i][j], bB: estB.B[i][j], d, sa, sb, pPerm, pPar, pW };
  });
  const micom = spec.lv.map((_, j) => ({ j, single: spec.blocks[j].length < 2, c: cObs[j], q05: q(cPerm[j], 0.05), pc: cPerm[j].filter(x => x < cObs[j]).length / cPerm[j].length, md: s3Obs[j][0], mdLo: q(mdPerm[j], 0.025), mdHi: q(mdPerm[j], 0.975), lv: s3Obs[j][1], lvLo: q(lvPerm[j], 0.025), lvHi: q(lvPerm[j], 0.975) }));
  micom.forEach(m => { m.step2 = m.single || m.c >= m.q05; m.step3a = m.md >= m.mdLo && m.md <= m.mdHi; m.step3b = m.lv >= m.lvLo && m.lv <= m.lvHi; });
  return { column: g.column, a: g.a, b: g.b, nA, nB, P, fails, alpha: S.boot.alpha, tails: S.boot.tails, B: S.boot.B, paths, micom, r2A: estA.R2, r2B: estB.R2 };
}
const yesNo = v => Tc(v ? tl('ya', 'yes') : tl('tidak', 'no'), v ? 'pass' : 'fail');
function micomStep2Table(R) {
  const G = R.mga;
  return { id: 'micom2', title: tl('MICOM langkah 2: invariansi komposisional', 'MICOM step 2: compositional invariance'), head: [tl('Konstruk', 'Construct'), tl('Korelasi asli (c)', 'Original correlation (c)'), tl('Kuantil 5% permutasi', '5% permutation quantile'), 'P value', tl('Invariansi komposisional', 'Compositional invariance')],
    rows: G.micom.map(m => [Tc(R.lv[m.j]), Nc(m.c), m.single ? Tc('–', 'mute') : Nc(m.q05), m.single ? Tc('–', 'mute') : Pc(m.pc), yesNo(m.step2)]),
    note: tl(`c = korelasi skor komposit data gabungan yang dihitung dengan bobot grup ${G.a} dan grup ${G.b}. Invariansi komposisional terpenuhi bila c ≥ kuantil 5% dari ${fmtInt(G.P)} permutasi (Henseler dkk., 2016). Konstruk satu indikator otomatis invarian.`, `c = correlation of the pooled composite scores computed with the weights of group ${G.a} and group ${G.b}. Compositional invariance holds when c ≥ the 5% quantile of ${fmtInt(G.P)} permutations (Henseler et al., 2016). Single-item constructs are invariant by definition.`) };
}
function micomStep3Table(R) {
  const G = R.mga;
  return { id: 'micom3', title: tl('MICOM langkah 3: kesetaraan rata-rata dan varians komposit', 'MICOM step 3: equality of composite means and variances'), head: [tl('Konstruk', 'Construct'), tl('Selisih rata-rata', 'Mean difference'), 'CI 2.5%', 'CI 97.5%', tl('Rata-rata setara', 'Equal mean'), tl('Log rasio varians', 'Log variance ratio'), 'CI 2.5%', 'CI 97.5%', tl('Varians setara', 'Equal variance')],
    rows: G.micom.map(m => [Tc(R.lv[m.j]), Nc(m.md), Nc(m.mdLo), Nc(m.mdHi), yesNo(m.step3a), Nc(m.lv), Nc(m.lvLo), Nc(m.lvHi), yesNo(m.step3b)]),
    note: tl('Skor komposit dihitung dengan bobot data gabungan. Bila langkah 2 terpenuhi, invariansi parsial tercapai dan koefisien jalur antargrup boleh dibandingkan; bila langkah 3a dan 3b juga terpenuhi, invariansi penuh tercapai.', 'Composite scores use the pooled-data weights. If step 2 holds, partial invariance is established and path coefficients may be compared across groups; if steps 3a and 3b also hold, full invariance is established.') };
}
function mgaPathTable(R) {
  const G = R.mga, a = G.alpha;
  return { id: 'mga-paths', title: tl(`Perbandingan koefisien jalur: ${G.a} vs ${G.b}`, `Path coefficient comparison: ${G.a} vs ${G.b}`), head: [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path'), `β ${G.a}`, `β ${G.b}`, tl('Selisih', 'Difference'), tl('P permutasi', 'Permutation p'), tl('P parametrik', 'Parametric p'), 'P Welch', tl('Berbeda?', 'Different?')],
    rows: R.hyp.filter(h => !h.mod).map(h => { const x = G.paths.find(q => q.i === h.i && q.j === h.j); if (!x) return null; const sig = x.pPerm < a; return [Tc(h.h), Tc(`${h.from} → ${h.to}`), Nc(x.bA, x.sa && x.sa.P < a ? 'pass' : null), Nc(x.bB, x.sb && x.sb.P < a ? 'pass' : null), Nc(x.d), Pc(x.pPerm, sig ? 'pass' : null), Pc(x.pPar), Pc(x.pW), Tc(sig ? tl('ya', 'yes') : tl('tidak', 'no'), sig ? 'pass' : 'mute')]; }).filter(Boolean),
    note: tl(`Grup ${G.a}: n = ${G.nA}; grup ${G.b}: n = ${G.nB} (kolom ${G.column}). Uji permutasi ${fmtInt(G.P)} kali (Chin dan Dibbern, 2010), p = (jumlah |Δβ| permutasi ≥ |Δβ| asli + 1)/(permutasi + 1). Uji parametrik (Keil dkk., 2000) dan Welch-Satterthwaite memakai galat baku bootstrap ${fmtInt(G.B)} subsampel per grup. Koefisien berwarna hijau signifikan di grupnya.`, `Group ${G.a}: n = ${G.nA}; group ${G.b}: n = ${G.nB} (column ${G.column}). Permutation test with ${fmtInt(G.P)} permutations (Chin and Dibbern, 2010), p = (number of permuted |Δβ| ≥ original |Δβ| + 1)/(permutations + 1). The parametric (Keil et al., 2000) and Welch-Satterthwaite tests use bootstrap standard errors from ${fmtInt(G.B)} subsamples per group. Green coefficients are significant within their group.`) };
}

/* ---- importance-performance map analysis */
function computeIPMA(prep, R, opts) {
  if (prep.ext && prep.ext.hocs.length) return { skipped: 'hoc' };
  const spec = prep.spec1 || prep.spec, cols = prep.cols1 || prep.cols, est = prep.ext && prep.ext.any ? PLS.estimate(cols, spec, opts) : R.A.est, L = spec.lv.length, idx1 = prep.idx1 || prep.idx;
  const endo = spec.lv.map((_, j) => j).filter(j => PLS.predecessors(spec.D, j).length), sinks = endo.filter(j => !spec.D[j].some(Boolean));
  const want = state.settings.ipma.target && idx1.has(state.settings.ipma.target) ? idx1.get(state.settings.ipma.target) : null, t = want !== null && endo.includes(want) ? want : (sinks.length ? sinks[sinks.length - 1] : endo[endo.length - 1]);
  if (t === undefined) return { skipped: 'noendo' };
  const n = cols[0].length, ranges = new Set();
  const resc = cols.map(c => { let mn = Infinity, mx = -Infinity, int = true; for (const v of c) { if (v < mn) mn = v; if (v > mx) mx = v; if (!Number.isInteger(v)) int = false; }
    if (int && mx <= 10 && mn >= 0) { mn = mn >= 1 ? 1 : 0; mx = mx <= 5 ? 5 : mx <= 7 ? 7 : 10; } ranges.add(int ? `${mn}–${mx}` : tl('min–maks', 'min–max'));
    const r = mx - mn || 1; return Float64Array.from(c, v => (v - mn) / r * 100); }), lik = ranges.size ? Array.from(ranges).join(', ') : null;
  const neg = [], LV = spec.blocks.map((b, j) => {
    const wu = b.map((k, a) => { const w = est.W[j][a]; if (!(w > 0)) neg.push(spec.lv[j]); return w / est.sd[k]; }), sw = wu.reduce((s, x) => s + x, 0), out = new Float64Array(n);
    b.forEach((k, a) => { const w = wu[a] / sw; for (let i = 0; i < n; i++) out[i] += w * resc[k][i]; }); return out;
  });
  const perf = LV.map(x => x.reduce((s, v) => s + v, 0) / n), Bu = spec.lv.map(() => new Array(L).fill(0));
  endo.forEach(j => {
    const pr = PLS.predecessors(spec.D, j), q = pr.length + 1, XtX = Array.from({ length: q }, () => new Array(q).fill(0)), Xty = new Array(q).fill(0);
    for (let i = 0; i < n; i++) { const row = [1].concat(pr.map(p => LV[p][i])); for (let a = 0; a < q; a++) { Xty[a] += row[a] * LV[j][i]; for (let c = 0; c < q; c++) XtX[a][c] += row[a] * row[c]; } }
    const bet = PLS.solve(XtX, Xty); pr.forEach((p, a) => { Bu[p][j] = bet[a + 1]; });
  });
  const T = PLS.totalEffects(Bu), reach = PLS.reachable(spec.D);
  const rows = spec.lv.map((_, j) => j).filter(j => j !== t && reach[j][t]).map(j => ({ j, name: spec.lv[j], imp: T[j][t], perf: perf[j] }));
  return { target: t, targetName: spec.lv[t], targetPerf: perf[t], rows, neg: Array.from(new Set(neg)), scale: lik };
}
function ipmaTable(R) {
  const I = R.ipma, mi = I.rows.reduce((s, r) => s + r.imp, 0) / I.rows.length, mp = I.rows.reduce((s, r) => s + r.perf, 0) / I.rows.length;
  return { id: 'ipma', title: tl(`IPMA untuk konstruk target ${I.targetName}`, `IPMA for the target construct ${I.targetName}`), head: [tl('Konstruk', 'Construct'), tl('Importance (efek total)', 'Importance (total effect)'), tl('Performance (0–100)', 'Performance (0–100)'), tl('Kuadran', 'Quadrant')],
    rows: I.rows.slice().sort((a, b) => b.imp - a.imp).map(r => { const hi = r.imp >= mi, hp = r.perf >= mp, qd = hi && !hp ? ['fail', tl('prioritas perbaikan', 'priority for improvement')] : hi && hp ? ['pass', tl('pertahankan', 'keep up the good work')] : !hi && !hp ? ['mute', tl('prioritas rendah', 'low priority')] : ['warn', tl('kemungkinan berlebih', 'possible overkill')]; return [Tc(r.name), Nc(r.imp), Nc(r.perf, null, { d: 1 }), Tc(qd[1], qd[0])]; }),
    note: tl(`Indikator diskalakan ulang ke 0–100${I.scale ? ` berdasarkan rentang skala ${I.scale}` : ' berdasarkan nilai minimum dan maksimum'}; performance = rata-rata skor konstruk dari bobot tak terstandar yang dinormalkan; importance = efek total tak terstandar terhadap ${I.targetName} (Ringle dan Sarstedt, 2016). Performance ${I.targetName} = ${fmt(I.targetPerf, 1)}. Kuadran dibandingkan dengan rata-rata importance (${fmt(mi)}) dan performance (${fmt(mp, 1)}).${I.neg.length ? ` Perhatian: ada outer weight tidak positif pada ${I.neg.join(', ')}, sehingga syarat IPMA tidak terpenuhi.` : ''}`, `Indicators were rescaled to 0–100${I.scale ? ` using the scale range ${I.scale}` : ' using their minimum and maximum'}; performance = mean construct score from normalized unstandardized weights; importance = unstandardized total effect on ${I.targetName} (Ringle and Sarstedt, 2016). Performance of ${I.targetName} = ${fmt(I.targetPerf, 1)}. Quadrants are relative to the mean importance (${fmt(mi)}) and performance (${fmt(mp, 1)}).${I.neg.length ? ` Note: non-positive outer weights in ${I.neg.join(', ')} violate an IPMA requirement.` : ''}`) };
}

/* ---- figures (standalone SVG) */
function figSlope(R, d) {
  const W = 760, H = 460, left = 70, right = 170, top = 70, bot = 60, xs = [-2, 2], lev = [-1, 0, 1], cols = ['#b4b8c2', '#6f7480', FX.ink];
  const ys = lev.flatMap(m => xs.map(x => (d.b1 + d.b3 * m) * x + d.b2 * m)); let lo = Math.min(...ys), hi = Math.max(...ys); const pad = (hi - lo) * 0.1 || 0.5; lo -= pad; hi += pad;
  const X = x => left + (x + 2) / 4 * (W - left - right), Y = y => top + (hi - y) / (hi - lo) * (H - top - bot);
  let s = svgT(left, 32, tl(`Simple slope: ${d.M} memoderasi ${d.X} → ${d.Y}`, `Simple slope: ${d.M} moderating ${d.X} → ${d.Y}`), { size: 17, weight: 700 }) + svgT(left, 52, tl('Sumbu: skor terstandar (SD)', 'Axes: standardized scores (SD)'), { size: 12, fill: FX.ink2 });
  niceTicks(lo, hi, 5).forEach(t => { s += `<line x1="${left}" x2="${W - right}" y1="${sx(Y(t))}" y2="${sx(Y(t))}" stroke="${FX.grid}"/>` + svgT(left - 8, Y(t) + 4, fmt(t, 1), { size: 11, fill: FX.ink2, anchor: 'end' }); });
  [-2, -1, 0, 1, 2].forEach(t => { s += svgT(X(t), H - bot + 20, fmt(t, 0), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  s += svgT((left + W - right) / 2, H - 14, d.X, { size: 13, anchor: 'middle', weight: 600 }) + `<text x="18" y="${sx((top + H - bot) / 2)}" font-size="13" font-weight="600" fill="${FX.ink}" transform="rotate(-90 18 ${sx((top + H - bot) / 2)})" text-anchor="middle">${esc(d.Y)}</text>`;
  lev.forEach((m, i) => { const y1 = (d.b1 + d.b3 * m) * -2 + d.b2 * m, y2 = (d.b1 + d.b3 * m) * 2 + d.b2 * m; s += `<line x1="${sx(X(-2))}" y1="${sx(Y(y1))}" x2="${sx(X(2))}" y2="${sx(Y(y2))}" stroke="${cols[i]}" stroke-width="3"/>`; s += `<rect x="${W - right + 18}" y="${top + 8 + i * 26}" width="22" height="4" fill="${cols[i]}"/>` + svgT(W - right + 48, top + 14 + i * 26, `${d.M} ${m < 0 ? '−1 SD' : m > 0 ? '+1 SD' : tl('rata-rata', 'mean')}`, { size: 12.5, fill: FX.ink2 }); });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function figIPMA(R) {
  const I = R.ipma, W = 820, H = 520, left = 74, right = 40, top = 70, bot = 64, mi = I.rows.reduce((s, r) => s + r.imp, 0) / I.rows.length, mp = I.rows.reduce((s, r) => s + r.perf, 0) / I.rows.length;
  const xmax = Math.max(0.05, ...I.rows.map(r => r.imp)) * 1.18, xmin = Math.min(0, ...I.rows.map(r => r.imp)), pv = I.rows.map(r => r.perf), ylo = Math.max(0, Math.floor((Math.min(...pv) - 10) / 10) * 10), yhi = Math.min(100, Math.ceil((Math.max(...pv) + 10) / 10) * 10);
  const X = x => left + (x - xmin) / (xmax - xmin) * (W - left - right), Y = y => top + (yhi - y) / (yhi - ylo) * (H - top - bot);
  let s = svgT(left, 32, tl(`Importance-performance map: ${I.targetName}`, `Importance-performance map: ${I.targetName}`), { size: 17, weight: 700 }) + svgT(left, 52, tl('Importance = efek total tak terstandar; performance = skor 0–100', 'Importance = unstandardized total effect; performance = 0–100 score'), { size: 12, fill: FX.ink2 });
  niceTicks(xmin, xmax, 5).forEach(t => { s += `<line x1="${sx(X(t))}" x2="${sx(X(t))}" y1="${top}" y2="${H - bot}" stroke="${FX.grid}"/>` + svgT(X(t), H - bot + 18, fmt(t, 2), { size: 11, fill: FX.ink2, anchor: 'middle' }); });
  niceTicks(ylo, yhi, 5).forEach(t => { s += `<line x1="${left}" x2="${W - right}" y1="${sx(Y(t))}" y2="${sx(Y(t))}" stroke="${FX.grid}"/>` + svgT(left - 8, Y(t) + 4, fmt(t, 0), { size: 11, fill: FX.ink2, anchor: 'end' }); });
  s += `<line x1="${sx(X(mi))}" x2="${sx(X(mi))}" y1="${top}" y2="${H - bot}" stroke="${FX.drop}" stroke-dasharray="6 4" stroke-width="1.4"/><line x1="${left}" x2="${W - right}" y1="${sx(Y(mp))}" y2="${sx(Y(mp))}" stroke="${FX.drop}" stroke-dasharray="6 4" stroke-width="1.4"/>`;
  s += svgT((left + W - right) / 2, H - 16, 'Importance', { size: 13, anchor: 'middle', weight: 600 }) + `<text x="20" y="${sx((top + H - bot) / 2)}" font-size="13" font-weight="600" fill="${FX.ink}" transform="rotate(-90 20 ${sx((top + H - bot) / 2)})" text-anchor="middle">Performance</text>`;
  I.rows.forEach(r => { const pri = r.imp >= mi && r.perf < mp; s += `<circle cx="${sx(X(r.imp))}" cy="${sx(Y(r.perf))}" r="7" fill="${pri ? FX.drop : FX.ink}"/>` + svgT(X(r.imp) + 11, Y(r.perf) + 4.5, r.name, { size: 13, weight: 600, fill: pri ? FX.drop : FX.ink }); });
  return { svg: svgDoc(W, H, s), w: W, h: H };
}
function figMGA(R) {
  const G = R.mga, hs = R.hyp.filter(h => !h.mod).map(h => ({ h, x: G.paths.find(q => q.i === h.i && q.j === h.j) })).filter(o => o.x);
  return figGrouped({ title: tl(`Koefisien jalur per grup: ${G.a} vs ${G.b}`, `Path coefficients by group: ${G.a} vs ${G.b}`), cats: hs.map(o => `${o.h.h} ${o.h.from} → ${o.h.to}`), series: [{ name: `${G.a} (n = ${G.nA})`, values: hs.map(o => o.x.bA), color: '#b4b8c2' }, { name: `${G.b} (n = ${G.nB})`, values: hs.map(o => o.x.bB), color: FX.ink }], refs: [] });
}
function extFigures(R) {
  const out = [];
  modInfo(R).forEach((d, k) => out.push(Object.assign({ key: 'slope-' + k, file: tl('simple-slope-', 'simple-slope-') + (k + 1), sec: 'moderation', ext: true, title: tl(`Simple slope ${d.M} pada ${d.X} → ${d.Y}`, `Simple slope of ${d.M} on ${d.X} → ${d.Y}`), caption: tl('Garis = efek X terhadap Y pada moderator −1 SD, rata-rata, dan +1 SD.', 'Lines = effect of X on Y at moderator −1 SD, mean, and +1 SD.') }, figSlope(R, d))));
  if (R.mga && !R.mga.error) out.push(Object.assign({ key: 'mga', file: tl('mga-koefisien', 'mga-coefficients'), sec: 'mga', ext: true, title: tl('Koefisien jalur per grup', 'Path coefficients by group'), caption: tl('Perbandingan koefisien jalur kedua grup.', 'Comparison of the path coefficients of both groups.') }, figMGA(R)));
  if (R.ipma && R.ipma.rows && R.ipma.rows.length) out.push(Object.assign({ key: 'ipma', file: 'ipma', sec: 'ipma', ext: true, title: tl('Importance-performance map', 'Importance-performance map'), caption: tl('Titik merah = importance di atas rata-rata dengan performance di bawah rata-rata (prioritas perbaikan).', 'Red points = above-average importance with below-average performance (priority for improvement).') }, figIPMA(R)));
  return out;
}
figureSpecs = (f => (R, all) => f(R, all).concat(extFigures(R)))(figureSpecs);

/* ---- result sections */
const figBox = f => `<div class="figure chart" style="padding:10px 12px;margin-bottom:22px;max-width:${Math.min(900, f.w)}px">${f.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div>`;
function moderationHTML(R) {
  const md = modInfo(R), a = R.boot ? R.boot.alpha : 0.05, txt = md.map(d => { const sig = !!(d.s && d.s.P < a); return tl(`${d.M} ${sig ? 'memoderasi secara signifikan' : 'tidak memoderasi secara signifikan'} pengaruh ${d.X} terhadap ${d.Y} (β interaksi = ${fmt(d.b3)}${d.s ? `; ${fmtPtxt(d.s.P)}` : ''}).${sig ? ` Kemiringan efek ${d.X} → ${d.Y} ${d.b3 > 0 ? 'meningkat' : 'menurun'} seiring naiknya ${d.M}: ${fmt(d.slopes[0])} pada −1 SD, ${fmt(d.slopes[1])} pada rata-rata, ${fmt(d.slopes[2])} pada +1 SD.` : ''}`, `${d.M} ${sig ? 'significantly moderates' : 'does not significantly moderate'} the effect of ${d.X} on ${d.Y} (interaction β = ${fmt(d.b3)}${d.s ? `; ${fmtPtxt(d.s.P)}` : ''}).${sig ? ` The slope of ${d.X} → ${d.Y} ${d.b3 > 0 ? 'increases' : 'decreases'} as ${d.M} rises: ${fmt(d.slopes[0])} at −1 SD, ${fmt(d.slopes[1])} at the mean, ${fmt(d.slopes[2])} at +1 SD.` : ''}`); });
  return `<div class="callout"><p>${esc(txt.join(' '))}</p></div>${tableHTML(moderationTable(R))}${tableHTML(slopeTable(R))}${md.map(d => figBox(figSlope(R, d))).join('')}`;
}
function mgaHTML(R) {
  const G = R.mga; if (G.error) return `<div class="callout fail"><p>${esc(G.error)}</p></div>`;
  const all2 = G.micom.every(m => m.step2), full = all2 && G.micom.every(m => m.step3a && m.step3b), diff = mgaPathTable(R).rows.filter(r => r[r.length - 1].st === 'pass').length;
  const msg = tl(`${all2 ? (full ? 'Invariansi pengukuran penuh tercapai' : 'Invariansi pengukuran parsial tercapai (MICOM langkah 2)') : 'Invariansi komposisional tidak tercapai pada sebagian konstruk, sehingga perbandingan grup perlu ditafsirkan hati-hati'}. ${diff} koefisien jalur berbeda signifikan antara ${G.a} dan ${G.b} (uji permutasi).`, `${all2 ? (full ? 'Full measurement invariance was established' : 'Partial measurement invariance was established (MICOM step 2)') : 'Compositional invariance was not established for some constructs, so group comparisons should be interpreted with caution'}. ${diff} path coefficient(s) differ significantly between ${G.a} and ${G.b} (permutation test).`);
  return `<div class="callout ${all2 ? 'ok' : 'warn'}"><p>${esc(msg)}</p></div>${tableHTML(micomStep2Table(R))}${tableHTML(micomStep3Table(R))}${tableHTML(mgaPathTable(R))}${figBox(figMGA(R))}`;
}
function ipmaHTML(R) {
  const I = R.ipma, mi = I.rows.reduce((s, r) => s + r.imp, 0) / I.rows.length, mp = I.rows.reduce((s, r) => s + r.perf, 0) / I.rows.length, pri = I.rows.filter(r => r.imp >= mi && r.perf < mp).map(r => r.name);
  return `<div class="callout"><p>${esc(pri.length ? tl(`Prioritas perbaikan untuk meningkatkan ${I.targetName}: ${pri.join(', ')} (importance di atas rata-rata, performance di bawah rata-rata).`, `Priorities for improving ${I.targetName}: ${pri.join(', ')} (above-average importance, below-average performance).`) : tl(`Tidak ada konstruk di kuadran prioritas perbaikan untuk ${I.targetName}.`, `No construct falls in the priority quadrant for ${I.targetName}.`))}</p></div>${tableHTML(ipmaTable(R))}${figBox(figIPMA(R))}`;
}
const EXT_SECTIONS = [
  { id: 'moderation', group: () => tl('Analisis lanjutan', 'Advanced analyses'), title: () => tl('Analisis moderasi', 'Moderation analysis'), short: () => tl('Moderasi', 'Moderation'), need: R => modInfo(R).length > 0, render: moderationHTML, tables: R => [moderationTable(R), slopeTable(R)] },
  { id: 'hoc', group: () => tl('Analisis lanjutan', 'Advanced analyses'), title: () => tl('Konstruk orde tinggi', 'Higher-order constructs'), short: () => tl('Orde tinggi', 'Higher-order'), need: R => hocInfo(R).length > 0 && !!R.A1, tables: R => [hocLocTable(R), hocMeasTable(R)] },
  { id: 'mga', group: () => tl('Analisis lanjutan', 'Advanced analyses'), title: () => tl('Analisis multigrup (MGA)', 'Multigroup analysis (MGA)'), short: () => 'MGA', need: R => !!R.mga, render: mgaHTML, tables: R => (R.mga.error ? [] : [micomStep2Table(R), micomStep3Table(R), mgaPathTable(R)]) },
  { id: 'ipma', group: () => tl('Analisis lanjutan', 'Advanced analyses'), title: () => tl('Importance-performance map (IPMA)', 'Importance-performance map (IPMA)'), short: () => 'IPMA', need: R => !!(R.ipma && R.ipma.rows && R.ipma.rows.length), render: ipmaHTML, tables: R => [ipmaTable(R)] },
  { id: 'samplesize', group: () => tl('Analisis lanjutan', 'Advanced analyses'), title: () => tl('Ukuran sampel minimum', 'Minimum sample size'), short: () => tl('Ukuran sampel', 'Sample size'), tables: R => [sampleSizeTable(R)] }
];
SECTIONS.splice(SECTIONS.findIndex(s => s.id === 'notes'), 0, ...EXT_SECTIONS);
function extReportBlocks(R, o) {
  const secs = EXT_SECTIONS.filter(s => !s.need || s.need(R)); if (!secs.length) return;
  o.H1(tl('Analisis lanjutan', 'Advanced analyses'));
  secs.forEach(s => { o.H2(s.title()); (s.tables(R) || []).forEach(o.tm); extFigures(R).filter(f => f.sec === s.id).forEach(f => o.figure(f.key)); });
}
/* measurement-evaluation tables never show interaction terms (single-item helper constructs) */
const dropInt = tm => {
  const bad = new Set(); tm.head.forEach((h, i) => { if (i && String(h).includes(INT_SEP)) bad.add(i); });
  const rows = tm.rows.filter(r => !(r && r.grp === undefined && r[0] && String(cellText(r[0])).includes(INT_SEP))).map(r => (r && r.grp !== undefined ? r : r.filter((_, i) => !bad.has(i))));
  return Object.assign({}, tm, { head: tm.head.filter((_, i) => !bad.has(i)), rows: bad.size ? rows.filter(r => !r || r.grp !== undefined || r.slice(1).some(c => c !== null && c !== undefined)) : rows });
};
loadingsTable = (f => R => dropInt(f(R)))(loadingsTable); weightsTable = (f => R => dropInt(f(R)))(weightsTable); relTable = (f => R => dropInt(f(R)))(relTable);
flTable = (f => R => dropInt(f(R)))(flTable); htmtTable = (f => R => dropInt(f(R)))(htmtTable); crossTable = (f => R => dropInt(f(R)))(crossTable); outerVifTable = (f => R => dropInt(f(R)))(outerVifTable);
bootOuterTable = (f => (R, k) => dropInt(f(R, k)))(bootOuterTable); bootHTMTTable = (f => R => dropInt(f(R)))(bootHTMTTable);
/* summary checklist entries for the advanced analyses */
structuralChecks = (f => R => {
  const out = f(R), a = R.boot ? R.boot.alpha : 0.05;
  modInfo(R).forEach(d => { const sig = !!(d.s && d.s.P < a); out.push({ st: 'info', c: tl(`Moderasi ${d.M} pada ${d.X} → ${d.Y}`, `Moderation of ${d.M} on ${d.X} → ${d.Y}`), sec: 'moderation', d: tl(`β interaksi ${fmt(d.b3)}${d.s ? `; ${fmtPtxt(d.s.P)}` : ''}; ${sig ? 'signifikan' : 'tidak signifikan'}.`, `Interaction β ${fmt(d.b3)}${d.s ? `; ${fmtPtxt(d.s.P)}` : ''}; ${sig ? 'significant' : 'not significant'}.`) }); });
  if (R.mga && !R.mga.error) { const G = R.mga, all2 = G.micom.every(m => m.step2), diff = G.paths.filter(x => x.pPerm < G.alpha).length; out.push({ st: all2 ? 'pass' : 'warn', c: tl(`MGA ${G.a} vs ${G.b}`, `MGA ${G.a} vs ${G.b}`), sec: 'mga', d: tl(`Invariansi komposisional ${all2 ? 'tercapai' : 'tidak tercapai pada sebagian konstruk'}; ${diff} jalur berbeda signifikan.`, `Compositional invariance ${all2 ? 'established' : 'not established for some constructs'}; ${diff} path(s) differ significantly.`) }); }
  if (R.ipma && R.ipma.rows && R.ipma.rows.length) { const I = R.ipma, mi = I.rows.reduce((s, r) => s + r.imp, 0) / I.rows.length, mp = I.rows.reduce((s, r) => s + r.perf, 0) / I.rows.length, pri = I.rows.filter(r => r.imp >= mi && r.perf < mp).map(r => r.name); out.push({ st: 'info', c: `IPMA (${I.targetName})`, sec: 'ipma', d: pri.length ? tl(`Prioritas perbaikan: ${pri.join(', ')}.`, `Priority for improvement: ${pri.join(', ')}.`) : tl('Tidak ada konstruk di kuadran prioritas.', 'No construct in the priority quadrant.') }); }
  const ss = sampleSizeTable(R).rows[1]; if (ss && Number.isFinite(cellRaw(ss[3]))) out.push({ st: R.prep.n >= cellRaw(ss[3]) ? 'pass' : 'warn', c: tl('Ukuran sampel minimum', 'Minimum sample size'), sec: 'samplesize', d: tl(`n min ${cellRaw(ss[3])} untuk |β| terkecil ${fmt(cellRaw(ss[2]))} (α = 5%); n = ${R.prep.n}.`, `n min ${cellRaw(ss[3])} for the smallest |β| ${fmt(cellRaw(ss[2]))} (α = 5%); n = ${R.prep.n}.`) });
  return out;
})(structuralChecks);
measurementChecks = (f => R => {
  const out = f(R); if (!R.A1 || !hocInfo(R).length) return out;
  const A1 = R.A1, locs = hocInfo(R).flatMap(H => H.locs), bad = locs.filter(l => A1.AVE[l.j1] < 0.5 || A1.rhoC[l.j1] < 0.7);
  out.push({ st: bad.length ? 'warn' : 'pass', c: tl('Konstruk orde rendah (tahap 1)', 'Lower-order constructs (stage 1)'), sec: 'hoc', d: bad.length ? tl(`Belum memenuhi rho_C ≥ 0,70 atau AVE ≥ 0,50: ${bad.map(l => l.name).join(', ')}.`, `Not meeting rho_C ≥ 0.70 or AVE ≥ 0.50: ${bad.map(l => l.name).join(', ')}.`) : tl(`rho_C dan AVE seluruh konstruk orde rendah memenuhi (${locs.map(l => l.name).join(', ')}).`, `rho_C and AVE of all lower-order constructs are satisfactory (${locs.map(l => l.name).join(', ')}).`) });
  return out;
})(measurementChecks);
infoRows = (f => R => {
  const out = f(R);
  if (R.ext && R.ext.hocs.length) out.push([tl('Konstruk orde tinggi', 'Higher-order constructs'), hocInfo(R).map(H => `${H.name} (${H.locs.map(l => l.name).join(', ')}; ${H.refl ? tl('reflektif', 'reflective') : tl('formatif', 'formative')}, disjoint two-stage)`).join('; ')]);
  if (R.ext && R.ext.mods.length) out.push([tl('Moderasi', 'Moderation'), modInfo(R).map(d => `${d.M} × ${d.X} → ${d.Y}`).join('; ') + tl(' (pendekatan dua tahap)', ' (two-stage approach)')]);
  if (R.mga) out.push(['MGA', R.mga.error ? R.mga.error : tl(`${R.mga.column}: ${R.mga.a} (n = ${R.mga.nA}) vs ${R.mga.b} (n = ${R.mga.nB}), ${R.mga.P} permutasi`, `${R.mga.column}: ${R.mga.a} (n = ${R.mga.nA}) vs ${R.mga.b} (n = ${R.mga.nB}), ${R.mga.P} permutations`)]);
  if (R.ipma && R.ipma.rows) out.push(['IPMA', tl(`target ${R.ipma.targetName}`, `target ${R.ipma.targetName}`)]);
  return out;
})(infoRows);
/* seminr code for two-stage models */
seminrCode = (f => R => {
  if (!R.ext || !R.ext.any) return f(R);
  const q = s => JSON.stringify(String(s)), m = R.model, cons = m.constructs, L = ['library(seminr)', 'library(readxl)', '', `df <- as.data.frame(read_excel(${q(R.source && R.source.kind === 'xlsx' ? R.source.fileName : 'data.xlsx')}))`, '', 'measurement_model <- constructs('];
  const lines = cons.filter(c => !isHoc(c)).map(c => `composite(${q(c.name)}, c(${c.items.map(q).join(', ')})${c.mode === 'formative' ? ', weights = mode_B' : ''})`)
    .concat(cons.filter(c => isHoc(c) && c.locs.length).map(c => `higher_composite(${q(c.name)}, c(${c.locs.map(l => q(conName(m, l))).join(', ')}), method = two_stage${c.mode === 'formative' ? ', weights = mode_B' : ''})`))
    .concat((m.moderations || []).map(md => { const p = m.paths.find(x => x.id === md.path); return `interaction_term(iv = ${q(conName(m, p.from))}, moderator = ${q(conName(m, md.moderator))}, method = two_stage)`; }));
  lines.forEach((l, i) => L.push('  ' + l + (i < lines.length - 1 ? ',' : '')));
  const rel = m.paths.map(p => `paths(from = ${q(conName(m, p.from))}, to = ${q(conName(m, p.to))})`).concat((m.moderations || []).map(md => { const p = m.paths.find(x => x.id === md.path); return `paths(from = ${q(conName(m, p.from) + '*' + conName(m, md.moderator))}, to = ${q(conName(m, p.to))})`; }));
  L.push(')', '', 'structural_model <- relationships(');
  rel.forEach((l, i) => L.push('  ' + l + (i < rel.length - 1 ? ',' : '')));
  L.push(')', '', 'pls_model <- estimate_pls(data = df, measurement_model = measurement_model, structural_model = structural_model)', 'summary(pls_model)');
  if (R.boot) L.push('', `boot_model <- bootstrap_model(seminr_model = pls_model, nboot = ${R.boot.B}, seed = ${R.settings.boot.seed})`, `summary(boot_model, alpha = ${R.settings.boot.alpha})`);
  L.push('', tl('# Catatan: seminr memakai implementasi dua tahapnya sendiri, sehingga angka dapat berbeda sedikit dari SEMbada (disjoint two-stage).', '# Note: seminr uses its own two-stage implementation, so figures may differ slightly from SEMbada (disjoint two-stage).'));
  return L.join('\n');
})(seminrCode);
const conName = (m, id) => { const c = m.constructs.find(x => x.id === id); return c ? c.name : ''; };

/* ---- model operations for higher-order constructs and moderation */
function addHOC() {
  const used = new Set(M().constructs.map(c => c.name)); let k = 1, nm = 'HOC'; while (used.has(nm)) nm = 'HOC' + (++k);
  const c = addConstruct({ name: nm, items: [] }); c.locs = []; c.mode = 'reflective';
  state.ui.selected = { type: 'c', id: c.id }; changed(); return c;
}
function toggleLoc(hocId, locId, on) {
  const h = conById(hocId); if (!h || !isHoc(h)) return;
  h.locs = h.locs.filter(x => x !== locId);
  if (on) { M().constructs.forEach(o => { if (isHoc(o) && o.id !== hocId) o.locs = o.locs.filter(x => x !== locId); }); h.locs.push(locId); }
  changed();
}
function addModeration(pathId, modId) {
  const m = M(), p = m.paths.find(q => q.id === pathId), mo = conById(modId); if (!p || !mo) return false;
  const x = conById(p.from), y = conById(p.to);
  if (modId === p.from || modId === p.to) { toast(tl('Moderator harus berbeda dari kedua konstruk pada jalur.', 'The moderator must differ from both constructs on the path.'), 'err'); return false; }
  if ((m.moderations || []).some(q => q.path === pathId && q.moderator === modId)) { toast(tl(`${mo.name} sudah menjadi moderator jalur ini.`, `${mo.name} already moderates this path.`)); return false; }
  if (!m.paths.some(q => q.from === modId && q.to === p.to)) {
    if (!addPath(modId, p.to)) return false;
    toast(tl(`Jalur efek utama ${mo.name} → ${y.name} ditambahkan, karena model moderasi wajib memuatnya.`, `The main-effect path ${mo.name} → ${y.name} was added, as a moderation model must include it.`));
  }
  if (!Array.isArray(m.moderations)) m.moderations = [];
  m.moderations.push({ id: uid('m'), path: pathId, moderator: modId }); changed();
  toast(tl(`Moderasi ditambahkan: ${mo.name} memoderasi ${x.name} → ${y.name}.`, `Moderation added: ${mo.name} moderates ${x.name} → ${y.name}.`), 'ok'); return true;
}
function removeModeration(id) { M().moderations = (M().moderations || []).filter(q => q.id !== id); changed(); }
function extValidate(errors, warns, info) {
  const m = M(), owner = new Map(), X = extModel(m);
  m.constructs.filter(isHoc).forEach(h => {
    if (h.items.length) errors.push(tl(`Konstruk orde tinggi ${h.name} tidak boleh memiliki indikator sendiri; indikatornya adalah konstruk orde rendah.`, `Higher-order construct ${h.name} cannot have its own indicators; its indicators are the lower-order constructs.`));
    if (h.locs.length < 2) errors.push(tl(`Konstruk orde tinggi ${h.name} membutuhkan minimal dua konstruk orde rendah. Pilih di panel kanan.`, `Higher-order construct ${h.name} needs at least two lower-order constructs. Choose them in the right-hand panel.`));
    h.locs.forEach(l => {
      const c = conById(l); if (!c) return;
      if (isHoc(c)) errors.push(tl(`${c.name} adalah konstruk orde tinggi sehingga tidak dapat menjadi konstruk orde rendah dari ${h.name}.`, `${c.name} is a higher-order construct and cannot be a lower-order construct of ${h.name}.`));
      if (owner.has(l)) errors.push(tl(`${c.name} menjadi konstruk orde rendah lebih dari satu konstruk orde tinggi.`, `${c.name} is a lower-order construct of more than one higher-order construct.`));
      owner.set(l, h.id);
      if (m.paths.some(p => p.from === l || p.to === l)) errors.push(tl(`Konstruk orde rendah ${c.name} tidak boleh punya jalur struktural sendiri; hubungkan jalurnya ke ${h.name}.`, `Lower-order construct ${c.name} cannot have its own structural paths; connect them to ${h.name}.`));
    });
  });
  (m.moderations || []).forEach(md => {
    const p = m.paths.find(q => q.id === md.path), mo = conById(md.moderator); if (!p || !mo) return;
    const x = conById(p.from), y = conById(p.to);
    if ([x, mo].some(c => isHoc(c) || owner.has(c.id))) errors.push(tl(`Moderasi ${mo.name} pada ${x.name} → ${y.name}: konstruk orde tinggi atau orde rendah belum didukung sebagai prediktor atau moderator.`, `Moderation of ${mo.name} on ${x.name} → ${y.name}: higher- or lower-order constructs are not yet supported as predictor or moderator.`));
    if (!m.paths.some(q => q.from === mo.id && q.to === y.id)) errors.push(tl(`Moderasi ${mo.name} pada ${x.name} → ${y.name} membutuhkan jalur efek utama ${mo.name} → ${y.name}.`, `The moderation of ${mo.name} on ${x.name} → ${y.name} requires the main-effect path ${mo.name} → ${y.name}.`));
  });
  if (X.any && state.settings.predict.run) info.push(tl('PLSpredict tidak dijalankan untuk model dengan moderasi atau konstruk orde tinggi.', 'PLSpredict is not run for models with moderation or higher-order constructs.'));
  if (X.hocs.length && state.settings.ipma.run !== false) info.push(tl('IPMA tidak dihitung untuk model dengan konstruk orde tinggi.', 'IPMA is not computed for models with higher-order constructs.'));
  const g = state.settings.mga;
  if (g && g.run) {
    if (X.any) errors.push(tl('MGA belum mendukung model dengan moderasi atau konstruk orde tinggi. Matikan MGA atau sederhanakan model.', 'MGA does not yet support models with moderation or higher-order constructs. Turn MGA off or simplify the model.'));
    else if (!g.column || !colByName(g.column)) errors.push(tl('Pilih kolom pengelompokan untuk MGA di langkah Hitung.', 'Choose a grouping column for MGA in the Calculate step.'));
    else if (!g.a || !g.b || g.a === g.b) errors.push(tl('Pilih dua grup yang berbeda untuk MGA di langkah Hitung.', 'Choose two different groups for MGA in the Calculate step.'));
  }
}
/* diagram labels for interaction terms, HOC links, and stage-1 indicators of the lower-order constructs */
diagramValues = (f => (R, show) => {
  const V = f(R, show); if (!V || !R.ext || !R.ext.any) return V;
  V.mod = new Map(); V.hoc = new Map();
  modInfo(R).forEach(d => V.mod.set(d.m.id, { coef: d.b3, p: d.s ? d.s.P : undefined, t: d.s ? d.s.T : undefined }));
  if (R.A1) {
    const e = R.A.est, e1 = R.A1.est, sp1 = R.base.spec;
    hocInfo(R).forEach(H => H.locs.forEach(l => {
      const v = H.refl ? e.loadings[H.j][l.a] : e.W[H.j][l.a], s = R.boot ? (H.refl ? R.bootLoad.get(l.k) : R.bootWeight.get(l.k)) : null;
      V.hoc.set(H.h.id + ':' + H.h.locs[l.a], show === 't' && s ? fmt(s.T) : fmt(v));
      sp1.blocks[l.j1].forEach((k, a) => V.mv.set(R.base.items[k], fmt(sp1.reflective[l.j1] ? e1.loadings[l.j1][a] : e1.W[l.j1][a])));
    }));
  }
  return V;
})(diagramValues);

/* respondent profile for the paper: text columns with 2-10 categories, counted over the analyzed rows */
function respondentProfile(rows) {
  const out = []; if (!state.data) return out;
  state.data.columns.forEach(c => {
    if (c.numeric || !c.raw) return; const m = new Map(); let k = 0;
    rows.forEach(i => { const v = c.raw[i] === undefined || c.raw[i] === null ? '' : String(c.raw[i]).trim(); if (v) { m.set(v, (m.get(v) || 0) + 1); k++; } });
    if (m.size < 2 || m.size > 10 || k < rows.length * 0.8) return;
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).forEach(([v, n], q) => out.push([q ? '' : c.name, v, fmtInt(n), fmt(100 * n / k, 1)]));
  });
  return out;
}
