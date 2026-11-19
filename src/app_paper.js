/* ================================================================ paper narrative: two-column conference-paper format, numbered citations */
const ROMAN = n => { let s = '', x = n; [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].forEach(([v, r]) => { while (x >= v) { s += r; x -= v; } }); return s; };
// a = author label for narrative citations; p = reference as [text, italic] parts
const REF = {
  tenenhaus05: { a: () => tl('Tenenhaus dkk.', 'Tenenhaus et al.'), p: [['M. Tenenhaus, V. Esposito Vinzi, Y.-M. Chatelin, and C. Lauro, “PLS path modeling,” '], ['Computational Statistics & Data Analysis', 1], [', vol. 48, no. 1, pp. 159–205, 2005, doi: 10.1016/j.csda.2004.03.005.']] },
  sanchez13: { a: () => 'Sanchez', p: [['G. Sanchez, '], ['PLS Path Modeling with R', 1], ['. Berkeley, CA, USA: Trowchez Editions, 2013.']] },
  hair21: { a: () => tl('Hair dkk.', 'Hair et al.'), p: [['J. F. Hair, G. T. M. Hult, C. M. Ringle, M. Sarstedt, N. P. Danks, and S. Ray, '], ['Partial Least Squares Structural Equation Modeling (PLS-SEM) Using R: A Workbook', 1], ['. Cham, Switzerland: Springer, 2021, doi: 10.1007/978-3-030-80519-7.']] },
  yoo00: { a: () => tl('Yoo dkk.', 'Yoo et al.'), p: [['B. Yoo, N. Donthu, and S. Lee, “An examination of selected marketing mix elements and brand equity,” '], ['Journal of the Academy of Marketing Science', 1], [', vol. 28, no. 2, pp. 195–211, 2000, doi: 10.1177/0092070300282002.']] },
  lancelot16: { a: () => tl('Lancelot-Miltgen dkk.', 'Lancelot-Miltgen et al.'), p: [['C. Lancelot-Miltgen, J. Henseler, C. Gelhard, and A. Popovič, “Introducing new products that affect consumer privacy: A mediation model,” '], ['Journal of Business Research', 1], [', vol. 69, no. 10, pp. 4659–4666, 2016, doi: 10.1016/j.jbusres.2016.04.015.']] },
  delone2003: { a: () => tl('DeLone dan McLean', 'DeLone and McLean'), p: [['W. H. DeLone and E. R. McLean, “The DeLone and McLean model of information systems success: A ten-year update,” '], ['Journal of Management Information Systems', 1], [', vol. 19, no. 4, pp. 9–30, 2003, doi: 10.1080/07421222.2003.11045748.']] },
  davis1989: { a: () => 'Davis', p: [['F. D. Davis, “Perceived usefulness, perceived ease of use, and user acceptance of information technology,” '], ['MIS Quarterly', 1], [', vol. 13, no. 3, pp. 319–340, 1989, doi: 10.2307/249008.']] },
  venkatesh2012: { a: () => tl('Venkatesh dkk.', 'Venkatesh et al.'), p: [['V. Venkatesh, J. Y. L. Thong, and X. Xu, “Consumer acceptance and use of information technology: Extending the unified theory of acceptance and use of technology,” '], ['MIS Quarterly', 1], [', vol. 36, no. 1, pp. 157–178, 2012, doi: 10.2307/41410412.']] },
  ajzen1991: { a: () => 'Ajzen', p: [['I. Ajzen, “The theory of planned behavior,” '], ['Organizational Behavior and Human Decision Processes', 1], [', vol. 50, no. 2, pp. 179–211, 1991, doi: 10.1016/0749-5978(91)90020-T.']] },
  parasuraman1988: { a: () => tl('Parasuraman dkk.', 'Parasuraman et al.'), p: [['A. Parasuraman, V. A. Zeithaml, and L. L. Berry, “SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality,” '], ['Journal of Retailing', 1], [', vol. 64, no. 1, pp. 12–40, 1988.']] },
  oliver1999: { a: () => 'Oliver', p: [['R. L. Oliver, “Whence consumer loyalty?,” '], ['Journal of Marketing', 1], [', vol. 63, no. 4_suppl1, pp. 33–44, 1999, doi: 10.1177/00222429990634s105.']] },
  fornell1996: { a: () => tl('Fornell dkk.', 'Fornell et al.'), p: [['C. Fornell, M. D. Johnson, E. W. Anderson, J. Cha, and B. E. Bryant, “The American Customer Satisfaction Index: Nature, purpose, and findings,” '], ['Journal of Marketing', 1], [', vol. 60, no. 4, pp. 7–18, 1996, doi: 10.1177/002224299606000403.']] },
  kock18: { a: () => tl('Kock dan Hadaya', 'Kock and Hadaya'), p: [['N. Kock and P. Hadaya, “Minimum sample size estimation in PLS-SEM: The inverse square root and gamma-exponential methods,” '], ['Information Systems Journal', 1], [', vol. 28, no. 1, pp. 227–261, 2018, doi: 10.1111/isj.12131.']] },
  henseler10: { a: () => tl('Henseler dan Chin', 'Henseler and Chin'), p: [['J. Henseler and W. W. Chin, “A comparison of approaches for the analysis of interaction effects between latent variables using partial least squares path modeling,” '], ['Structural Equation Modeling: A Multidisciplinary Journal', 1], [', vol. 17, no. 1, pp. 82–109, 2010, doi: 10.1080/10705510903439003.']] },
  sarstedt19: { a: () => tl('Sarstedt dkk.', 'Sarstedt et al.'), p: [['M. Sarstedt, J. F. Hair, J.-H. Cheah, J.-M. Becker, and C. M. Ringle, “How to specify, estimate, and validate higher-order constructs in PLS-SEM,” '], ['Australasian Marketing Journal', 1], [', vol. 27, no. 3, pp. 197–211, 2019, doi: 10.1016/j.ausmj.2019.05.003.']] },
  becker12: { a: () => tl('Becker dkk.', 'Becker et al.'), p: [['J.-M. Becker, K. Klein, and M. Wetzels, “Hierarchical latent variable models in PLS-SEM: Guidelines for using reflective-formative type models,” '], ['Long Range Planning', 1], [', vol. 45, no. 5–6, pp. 359–394, 2012, doi: 10.1016/j.lrp.2012.10.001.']] },
  henseler16: { a: () => tl('Henseler dkk.', 'Henseler et al.'), p: [['J. Henseler, C. M. Ringle, and M. Sarstedt, “Testing measurement invariance of composites using partial least squares,” '], ['International Marketing Review', 1], [', vol. 33, no. 3, pp. 405–431, 2016, doi: 10.1108/IMR-09-2014-0304.']] },
  chin10: { a: () => tl('Chin dan Dibbern', 'Chin and Dibbern'), p: [['W. W. Chin and J. Dibbern, “An introduction to a permutation based procedure for multi-group PLS analysis: Results of tests of differences on simulated data and a cross cultural analysis of the sourcing of information system services between Germany and the USA,” in '], ['Handbook of Partial Least Squares', 1], [', V. Esposito Vinzi, W. W. Chin, J. Henseler, and H. Wang, Eds. Berlin, Germany: Springer, 2010, pp. 171–193, doi: 10.1007/978-3-540-32827-8_8.']] },
  keil00: { a: () => tl('Keil dkk.', 'Keil et al.'), p: [['M. Keil, B. C. Y. Tan, K.-K. Wei, T. Saarinen, V. Tuunainen, and A. Wassenaar, “A cross-cultural study on escalation of commitment behavior in software projects,” '], ['MIS Quarterly', 1], [', vol. 24, no. 2, pp. 299–325, 2000, doi: 10.2307/3250940.']] },
  ringle16: { a: () => tl('Ringle dan Sarstedt', 'Ringle and Sarstedt'), p: [['C. M. Ringle and M. Sarstedt, “Gain more insight from your PLS-SEM results: The importance-performance map analysis,” '], ['Industrial Management & Data Systems', 1], [', vol. 116, no. 9, pp. 1865–1886, 2016, doi: 10.1108/IMDS-10-2015-0449.']] },
  sembada: { a: () => APP_AUTHOR.family, p: [[`${APP_AUTHOR.initials} ${APP_AUTHOR.family}, `], ['SEMbada: Portable PLS-SEM software', 1], [`, version ${APP_VERSION}, ${new Date().getFullYear()}. [Computer software]. Available: ${APP_REPO}`]] },
  cron51: { a: () => 'Cronbach', p: [['L. J. Cronbach, “Coefficient alpha and the internal structure of tests,” '], ['Psychometrika', 1], [', vol. 16, no. 3, pp. 297–334, 1951, doi: 10.1007/BF02310555.']] },
  efron93: { a: () => tl('Efron dan Tibshirani', 'Efron and Tibshirani'), p: [['B. Efron and R. J. Tibshirani, '], ['An Introduction to the Bootstrap', 1], ['. New York, NY, USA: Chapman & Hall, 1993.']] },
  fl81: { a: () => tl('Fornell dan Larcker', 'Fornell and Larcker'), p: [['C. Fornell and D. F. Larcker, “Evaluating structural equation models with unobservable variables and measurement error,” '], ['Journal of Marketing Research', 1], [', vol. 18, no. 1, pp. 39–50, 1981, doi: 10.1177/002224378101800104.']] },
  jor71: { a: () => 'Jöreskog', p: [['K. G. Jöreskog, “Statistical analysis of sets of congeneric tests,” '], ['Psychometrika', 1], [', vol. 36, no. 2, pp. 109–133, 1971, doi: 10.1007/BF02291393.']] },
  cohen88: { a: () => 'Cohen', p: [['J. Cohen, '], ['Statistical Power Analysis for the Behavioral Sciences', 1], [', 2nd ed. Hillsdale, NJ, USA: Lawrence Erlbaum Associates, 1988.']] },
  dij15: { a: () => tl('Dijkstra dan Henseler', 'Dijkstra and Henseler'), p: [['T. K. Dijkstra and J. Henseler, “Consistent partial least squares path modeling,” '], ['MIS Quarterly', 1], [', vol. 39, no. 2, pp. 297–316, 2015, doi: 10.25300/MISQ/2015/39.2.02.']] },
  hair11: { a: () => tl('Hair dkk.', 'Hair et al.'), p: [['J. F. Hair, C. M. Ringle, and M. Sarstedt, “PLS-SEM: Indeed a silver bullet,” '], ['Journal of Marketing Theory and Practice', 1], [', vol. 19, no. 2, pp. 139–152, 2011, doi: 10.2753/MTP1069-6679190202.']] },
  hair19: { a: () => tl('Hair dkk.', 'Hair et al.'), p: [['J. F. Hair, J. J. Risher, M. Sarstedt, and C. M. Ringle, “When to use and how to report the results of PLS-SEM,” '], ['European Business Review', 1], [', vol. 31, no. 1, pp. 2–24, 2019, doi: 10.1108/EBR-11-2018-0203.']] },
  hair22: { a: () => tl('Hair dkk.', 'Hair et al.'), p: [['J. F. Hair, G. T. M. Hult, C. M. Ringle, and M. Sarstedt, '], ['A Primer on Partial Least Squares Structural Equation Modeling (PLS-SEM)', 1], [', 3rd ed. Thousand Oaks, CA, USA: Sage, 2022.']] },
  hen14: { a: () => tl('Henseler dkk.', 'Henseler et al.'), p: [['J. Henseler et al., “Common beliefs and reality about PLS: Comments on Rönkkö and Evermann (2013),” '], ['Organizational Research Methods', 1], [', vol. 17, no. 2, pp. 182–209, 2014, doi: 10.1177/1094428114526928.']] },
  hen15: { a: () => tl('Henseler dkk.', 'Henseler et al.'), p: [['J. Henseler, C. M. Ringle, and M. Sarstedt, “A new criterion for assessing discriminant validity in variance-based structural equation modeling,” '], ['Journal of the Academy of Marketing Science', 1], [', vol. 43, no. 1, pp. 115–135, 2015, doi: 10.1007/s11747-014-0403-8.']] },
  hu99: { a: () => tl('Hu dan Bentler', 'Hu and Bentler'), p: [['L. Hu and P. M. Bentler, “Cutoff criteria for fit indexes in covariance structure analysis: Conventional criteria versus new alternatives,” '], ['Structural Equation Modeling', 1], [', vol. 6, no. 1, pp. 1–55, 1999, doi: 10.1080/10705519909540118.']] },
  lohm89: { a: () => 'Lohmöller', p: [['J.-B. Lohmöller, '], ['Latent Variable Path Modeling with Partial Least Squares', 1], ['. Heidelberg, Germany: Physica-Verlag, 1989.']] },
  shm19: { a: () => tl('Shmueli dkk.', 'Shmueli et al.'), p: [['G. Shmueli et al., “Predictive model assessment in PLS-SEM: Guidelines for using PLSpredict,” '], ['European Journal of Marketing', 1], [', vol. 53, no. 11, pp. 2322–2347, 2019, doi: 10.1108/EJM-02-2019-0189.']] },
  zhao10: { a: () => tl('Zhao dkk.', 'Zhao et al.'), p: [['X. Zhao, J. G. Lynch, and Q. Chen, “Reconsidering Baron and Kenny: Myths and truths about mediation analysis,” '], ['Journal of Consumer Research', 1], [', vol. 37, no. 2, pp. 197–206, 2010, doi: 10.1086/651257.']] }
};
const refText = parts => parts.map(x => x[0]).join('');
const andJoin = a => (a.length <= 1 ? (a[0] || '') : a.length === 2 ? a.join(tl(' dan ', ' and ')) : a.slice(0, -1).join(', ') + tl(', dan ', ', and ') + a[a.length - 1]);
const andJoinSemi = a => (a.length <= 1 ? (a[0] || '') : a.length === 2 ? a.join(tl(' dan ', ' and ')) : a.slice(0, -1).join('; ') + tl('; dan ', '; and ') + a[a.length - 1]);
const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const numW = n => (I18N.lang === 'en' && n >= 0 && n <= 10 ? NUMW[n] : String(n));
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
// page geometry of the conference layout (twips): A4, 16 mm side margins, two columns 18 pt apart
const PG_W = 11906, PG_SIDE = 907, PG_GAP = 360, FULL_W = PG_W - 2 * PG_SIDE, COL_W = Math.floor((FULL_W - PG_GAP) / 2);
const tableMinWidth = bk => colNeeds(bk.head, bk.rows).reduce((s, c, i) => s + (bk.align[i] === 'r' ? Math.round(Math.min(Math.max(c, 1), 16) * 16 * 5.2 + 154) : Math.round(Math.min(Math.max(c, 1), 8) * 16 * 6.2 + 154)), 0);
const figCaption = bk => `${tl('Gambar', 'Fig.')} ${bk.num}. ${bk.title}. ${bk.note}`;

function paperModel(R) {
  const A = R.A, e = A.est, S = R.settings, b = R.boot, P = R.pred, alpha = b ? b.alpha : 0.05;
  const refl = reflIdx(R), form = R.lv.map((_, j) => j).filter(j => !R.refl[j]), order = [], B = [];
  const num = k => { let i = order.indexOf(k); if (i < 0) { order.push(k); i = order.length - 1; } return i + 1; };
  const cite = (...ks) => ks.map(k => `[${num(k)}]`).join(', ');
  const citeN = k => `${REF[k].a()} [${num(k)}]`;
  const p = text => B.push({ type: 'p', text }), ph = text => B.push({ type: 'ph', text }), head = (lvl, text) => B.push({ type: 'h' + lvl, text });
  const tref = n => `${tl('Tabel', 'Table')} ${ROMAN(n)}`, fref = n => `${tl('Gambar', 'Fig.')} ${n}`;
  const rng = a => `${fmt(Math.min(...a))}–${fmt(Math.max(...a))}`;
  const rngTo = a => tl(`${fmt(Math.min(...a))} hingga ${fmt(Math.max(...a))}`, `${fmt(Math.min(...a))} to ${fmt(Math.max(...a))}`);
  const pct = v => fmt(v * 100, 1) + '%', sep = state.view.comma ? '; ' : ', ';
  const pTxt = v => (v < 0.001 ? '< ' + fmt(0.001, 3) : fmt(v, 3)), ciTxt = s => `[${fmt(s.lo)}${sep}${fmt(s.hi)}]`;
  const lvl = b ? ciLevel(R) : 0, tails = b ? (b.tails === 'two' ? tl('dua arah', 'two-tailed') : tl('satu arah', 'one-tailed')) : '', ciName = b && b.ci === 'bca' ? 'BCa' : tl('persentil', 'percentile');
  const profRows = R.profile || [];
  let tn = 0; const T = {}; if (profRows.length) T.prof = ++tn; T.crit = ++tn; T.meas = ++tn; T.r2 = ++tn; T.struct = ++tn; if (b && b.chains.length) T.med = ++tn; if (P) T.pred = ++tn;
  const tbl = o => { o.type = 'table'; o.wide = tableMinWidth(o) > COL_W; B.push(o); };
  const pp = P ? predictPower(R) : null;
  const PHR = { high: tl('daya prediksi tinggi', 'high predictive power'), medium: tl('daya prediksi sedang', 'medium predictive power'), low: tl('daya prediksi rendah', 'low predictive power'), none: tl('tidak adanya daya prediksi', 'no predictive power'), neg: tl('daya prediksi yang belum memadai', 'insufficient predictive power') };
  const phr = pp ? PHR[pp.code] : '';
  const hypRows = b ? R.hyp.map(h => ({ h, s: R.bootPath.get(h.i + ',' + h.j) })).filter(x => x.s) : [];
  const sup = hypRows.filter(x => x.s.P < alpha), ns = hypRows.filter(x => !(x.s.P < alpha));
  const r2v = R.endo.map(j => e.R2[j]), r2lo = Math.min(...r2v), r2hi = Math.max(...r2v);

  /* ---- abstract and keywords (no symbols or citations) */
  let htmtMax = -Infinity; refl.forEach((i, a) => refl.forEach((j, c) => { if (c > a) htmtMax = Math.max(htmtMax, A.HTMT[i][j]); }));
  const crit = [[refl.every(j => R.spec.blocks[j].every((k, a) => e.loadings[j][a] >= 0.7)), tl('reliabilitas indikator', 'indicator reliability')], [refl.every(j => A.alpha[j] >= 0.7 && A.rhoC[j] >= 0.7), tl('reliabilitas konsistensi internal', 'internal consistency reliability')], [refl.every(j => A.AVE[j] >= 0.5), tl('validitas konvergen', 'convergent validity')], [refl.length < 2 || htmtMax < 0.9, tl('validitas diskriminan', 'discriminant validity')]];
  const okC = crit.filter(x => x[0]).map(x => x[1]), badC = crit.filter(x => !x[0]).map(x => x[1]);
  const measAbs = !refl.length ? '' : !badC.length ? tl(`Model pengukuran memenuhi kriteria ${andJoin(okC)}.`, `The measurement model met the criteria for ${andJoin(okC)}.`) : !okC.length ? tl(`Model pengukuran belum memenuhi kriteria ${andJoin(badC)}.`, `The measurement model did not meet the criteria for ${andJoin(badC)}.`) : tl(`Model pengukuran memenuhi kriteria ${andJoin(okC)}, tetapi belum memenuhi ${andJoin(badC)}.`, `The measurement model met the criteria for ${andJoin(okC)} but not for ${andJoin(badC)}.`);
  const strong = sup.slice().sort((x, y) => Math.abs(y.s.O) - Math.abs(x.s.O)).slice(0, 2);
  const hypAbs = !b ? tl('Signifikansi jalur belum diuji karena bootstrapping tidak dijalankan.', 'Path significance was not tested because bootstrapping was not performed.')
    : !sup.length ? tl('Tidak ada hipotesis yang diterima.', 'None of the hypotheses was supported.')
      : sup.length === 1 ? tl(`Satu dari ${R.hyp.length} hipotesis diterima, yaitu pengaruh ${sup[0].h.from} terhadap ${sup[0].h.to}.`, `One of the ${numW(R.hyp.length)} hypotheses was supported, namely the effect of ${sup[0].h.from} on ${sup[0].h.to}.`)
        : tl(`Sebanyak ${sup.length} dari ${R.hyp.length} hipotesis diterima, dengan pengaruh terkuat pada ${andJoin(strong.map(x => `${x.h.from} terhadap ${x.h.to}`))}.`, `${capFirst(numW(sup.length))} of the ${numW(R.hyp.length)} hypotheses were supported, with the strongest effects being those of ${andJoin(strong.map(x => `${x.h.from} on ${x.h.to}`))}.`);
  const r2Abs = (R.endo.length === 1 ? tl(`Model menjelaskan ${pct(r2v[0])} varians ${R.lv[R.endo[0]]}`, `The model explains ${pct(r2v[0])} of the variance in ${R.lv[R.endo[0]]}`) : tl(`Model menjelaskan ${pct(r2lo)} hingga ${pct(r2hi)} varians konstruk endogen`, `The model explains ${pct(r2lo)} to ${pct(r2hi)} of the variance in the endogenous constructs`)) + (P ? tl(` dan menunjukkan ${phr}.`, ` and shows ${phr}.`) : '.');
  const objT = infoTxt('objective').replace(/[.\s]+$/, '');
  const abstract = [objT ? tl(`Penelitian ini bertujuan untuk ${objT}.`, `This study aims to ${objT}.`) : tl('[Tuliskan tujuan penelitian dalam satu kalimat.]', '[State the research objective in one sentence.]'), tl(`Penelitian ini menganalisis data dari ${fmtInt(R.prep.n)} responden menggunakan partial least squares structural equation modeling (PLS-SEM).`, `This study analyzed data from ${fmtInt(R.prep.n)} respondents using partial least squares structural equation modeling (PLS-SEM).`), measAbs, hypAbs, r2Abs].filter(Boolean).join(' ');
  const keywords = ['partial least squares', 'structural equation modeling', tl('model pengukuran', 'measurement model'), tl('model struktural', 'structural model')].concat(b && b.chains.length ? [tl('mediasi', 'mediation')] : [], P ? ['PLSpredict'] : [], extKeywords(R), infoTxt('keywords') ? infoTxt('keywords').split(/[,;]/).map(x => x.trim()).filter(Boolean) : []).join(', ');

  /* ---- I. introduction (structured placeholders for the author) */
  head(1, tl('Pendahuluan', 'Introduction'));
  ph(tl('[Latar belakang: jelaskan konteks dan pentingnya masalah penelitian, didukung data dan rujukan terkini.]', '[Background: explain the context and importance of the research problem, supported by data and recent references.]'));
  ph(tl('[Celah penelitian: uraikan pertanyaan yang belum dijawab penelitian terdahulu dan mengapa hal itu penting.]', '[Research gap: explain which question prior studies have left unanswered and why it matters.]'));
  if (objT) p(tl(`Penelitian ini bertujuan untuk ${objT}.`, `This study aims to ${objT}.`)); else ph(tl('[Tujuan penelitian dalam satu kalimat.]', '[The research objective in one sentence.]'));
  ph(tl('[Kontribusi: sebutkan kontribusi teoretis dan praktis yang diharapkan.]', '[Contribution: state the expected theoretical and practical contributions.]'));
  p(tl('Bagian selanjutnya disusun sebagai berikut. Bagian II meninjau literatur dan mengembangkan hipotesis, Bagian III menjelaskan metodologi, Bagian IV menyajikan hasil, Bagian V membahas temuan, dan Bagian VI menyimpulkan penelitian.', 'The remainder of this paper is organized as follows. Section II reviews the literature and develops the hypotheses, Section III describes the methodology, Section IV presents the results, Section V discusses the findings, and Section VI concludes the paper.'));

  /* ---- II. literature review and hypothesis development */
  const eqn = { n: 0 }, eq = key => { eqn.n++; B.push({ type: 'eq', key, num: eqn.n }); }, fig = { n: 0 }, F = {};
  const plsc = R.opts.plsc; let c1 = '', nL = '', cL = '', cS = '';
  head(1, tl('Tinjauan Pustaka dan Pengembangan Hipotesis', 'Literature Review and Hypothesis Development'));
  head(2, tl('Landasan Teori', 'Theoretical Background'));
  const tplT = state.info && state.info.template ? TEMPLATES.find(t => t.key === state.info.template) : null, lowFirst = x => (/^[A-Z][a-z]/.test(x) ? x[0].toLowerCase() + x.slice(1) : x);
  const conRows = R.model.constructs.map(c => ({ c, full: conFull(c.id), def: conDefTxt(c.id) })), withDef = conRows.filter(x => x.def), noDef = conRows.filter(x => !x.def);
  const cl = nm => { const c = R.model.constructs.find(x => x.name === nm); return c ? conLabel(c.id, nm) : nm; }, mdI = modInfo(R), hcI = hocInfo(R), G = R.mga && !R.mga.error ? R.mga : null, IP = R.ipma && R.ipma.rows && R.ipma.rows.length ? R.ipma : null;
  if (tplT) p(tl(`Model penelitian ini dibangun di atas ${tplT.name.id} ${cite(...tplT.refs)}.`, `The research model builds on the ${tplT.name.en} ${cite(...tplT.refs)}.`));
  if (withDef.length) p(withDef.map(x => tl(`${x.full ? `${x.full} (${x.c.name})` : x.c.name} didefinisikan sebagai ${lowFirst(x.def).replace(/[.\s]+$/, '')}.`, `${x.full ? `${x.full} (${x.c.name})` : x.c.name} is defined as ${lowFirst(x.def).replace(/[.\s]+$/, '')}.`)).join(' '));
  if (noDef.length) ph(tl(`[Uraikan landasan teori ${withDef.length ? `untuk ${andJoin(noDef.map(x => x.c.name))}` : 'setiap konstruk'} berdasarkan penelitian terdahulu.]`, `[Describe the theoretical foundation of ${withDef.length ? andJoin(noDef.map(x => x.c.name)) : 'each construct'}, citing prior studies.]`));
  head(2, tl('Pengembangan Hipotesis', 'Hypothesis Development'));
  R.hyp.forEach(h => {
    const d = h.mod ? mdI.find(x => x.h === h) : null;
    ph(d ? tl(`[Argumen ${h.h}: jelaskan mengapa ${d.M} diharapkan memperkuat atau memperlemah pengaruh ${d.X} terhadap ${d.Y}, dengan rujukan penelitian terdahulu.]`, `[Argument for ${h.h}: explain why ${d.M} is expected to strengthen or weaken the effect of ${d.X} on ${d.Y}, citing prior studies.]`) : tl(`[Argumen ${h.h}: jelaskan mengapa ${h.from} diharapkan memengaruhi ${h.to}, dengan rujukan penelitian terdahulu.]`, `[Argument for ${h.h}: explain why ${h.from} is expected to affect ${h.to}, citing prior studies.]`));
    B.push({ type: 'hyp', label: h.h, text: d ? tl(`${cl(d.M)} memoderasi pengaruh ${cl(d.X)} terhadap ${cl(d.Y)}.`, `${cl(d.M)} moderates the effect of ${cl(d.X)} on ${cl(d.Y)}.`) : tl(`${cl(h.from)} berpengaruh signifikan terhadap ${cl(h.to)}.`, `${cl(h.from)} has a significant effect on ${cl(h.to)}.`) });
  });
  head(2, tl('Model Penelitian', 'Research Model'));
  p(tl(`${fref(fig.n + 1)} merangkum model penelitian yang terdiri atas ${R.model.constructs.length} konstruk dan ${R.hyp.length} hipotesis.`, `${fref(fig.n + 1)} summarizes the research model, which comprises ${numW(R.model.constructs.length)} constructs and ${numW(R.hyp.length)} hypotheses.`));
  B.push({ type: 'figure', num: (F.concept = ++fig.n), fkey: 'concept', file: 'fig-model.png', show: 'hyp', title: tl('Model penelitian', 'Research model'), note: tl('Setiap panah antarkonstruk menyatakan satu hipotesis; elips = konstruk, kotak = indikator.', 'Each arrow between constructs represents one hypothesis; ellipses are constructs and boxes are indicators.') });

  /* ---- III. research methodology: design, measurement, analysis (formulas in Appendix A) */
  head(1, tl('Metodologi Penelitian', 'Research Methodology'));
  head(2, tl('Desain Penelitian dan Data', 'Research Design and Data'));
  const nC = R.model.constructs.length, nRefl = R.model.constructs.filter(c => c.mode !== 'formative').length, nForm = nC - nRefl, nI = (R.base || R).items.length;
  const cells = R.prep.n * (R.base || R).items.length;
  const miss = R.prep.missing === 'listwise'
    ? (R.prep.nDropped ? tl(`; ${R.prep.nDropped} responden dengan data tidak lengkap dikeluarkan (casewise deletion)`, `; ${R.prep.nDropped} cases with incomplete data were excluded (casewise deletion)`) : tl(' tanpa data hilang', ' with no missing values'))
    : (R.prep.nImputed ? tl(`; ${fmtInt(R.prep.nImputed)} nilai hilang (${fmt(100 * R.prep.nImputed / cells, 1)}% dari seluruh sel data) diganti dengan rata-rata indikatornya`, `; ${fmtInt(R.prep.nImputed)} missing values (${fmt(100 * R.prep.nImputed / cells, 1)}% of all data points) were replaced by the indicator means`) : tl(' tanpa data hilang', ' with no missing values'));
  const likert = R.freq && R.freq.cats[0] === 1 && R.freq.cats.length >= 4 && R.freq.cats.length <= 7 ? R.freq.cats.length : 0;
  p(tl(`Analisis menggunakan data dari ${fmtInt(R.prep.n)} responden${miss}. Model terdiri atas ${nForm ? `${nC} konstruk (${nRefl} reflektif dan ${nForm} formatif)` : `${nC} konstruk reflektif`} yang diukur dengan ${nI} indikator.${likert ? ` Setiap indikator diukur dengan skala Likert ${likert} poin.` : ''}`,
    `The analysis was based on data from ${fmtInt(R.prep.n)} respondents${miss}. The model comprises ${nForm ? `${numW(nC)} constructs (${numW(nRefl)} reflective and ${numW(nForm)} formative)` : `${numW(nC)} reflective constructs`} measured by ${nI} indicators.${likert ? ` Each indicator was measured on a ${likert}-point Likert scale.` : ''}`));
  { const sk = R.source && R.source.sample, T = sk ? (TEMPLATES.find(t => t.sample === sk && t.key === (state.info && state.info.template)) || TEMPLATES.find(t => t.sample === sk)) : null;
    if (T) p(T.data.real ? tl(`Data yang dianalisis adalah dataset publik ${T.data.cite.replace(/ \(\d{4}\)$/, '')} ${cite(T.data.ref)}.`, `The data analyzed are the publicly available dataset of ${T.data.cite.replace(/ \(\d{4}\)$/, '')} ${cite(T.data.ref)}.`) : T.data.simcor ? tl(`Data yang dianalisis adalah data simulasi yang memiliki matriks korelasi yang sama dengan data ${T.data.cite.replace(/ \(\d{4}\)$/, '')} ${cite(T.data.ref)}.`, `The data analyzed are simulated to have the same correlation matrix as the data of ${T.data.cite.replace(/ \(\d{4}\)$/, '')} ${cite(T.data.ref)}.`) : tl('Data yang dianalisis adalah data simulasi untuk keperluan demonstrasi, sehingga hasilnya tidak menggambarkan populasi nyata.', 'The data analyzed are simulated for demonstration purposes, so the results do not describe a real population.')); }
  if (!(R.source && R.source.sample)) ph(tl('[Jelaskan populasi, teknik sampling, periode dan prosedur pengumpulan data, serta persetujuan etik penelitian.]', '[Describe the population, sampling technique, data collection period and procedure, and research ethics approval.]'));
  if (T.prof) { p(tl(`${tref(T.prof)} merangkum profil responden.`, `${tref(T.prof)} summarizes the respondent profile.`)); tbl({ num: T.prof, title: tl('Profil Responden', 'Respondent Profile'), head: [tl('Variabel', 'Variable'), tl('Kategori', 'Category'), 'n', '%'], rows: profRows, align: ['l', 'l', 'r', 'r'] }); }
  else ph(tl('[Sajikan profil responden (misalnya jenis kelamin, usia, pendidikan) dalam sebuah tabel.]', '[Present the respondent profile (e.g., gender, age, education) in a table.]'));
  { const sst = sampleSizeTable(R), ss = sst.rows[1], bm = ss ? cellRaw(ss[2]) : NaN, nm = ss ? cellRaw(ss[3]) : NaN, sg = sst.basis === 'sig';
    if (Number.isFinite(nm)) p(tl(`Kecukupan ukuran sampel diperiksa dengan metode inverse square root ${cite('kock18')}. Untuk mendeteksi koefisien jalur ${sg ? 'signifikan ' : ''}terkecil dalam model (|β| = ${fmt(bm)}) dengan power 80% pada taraf signifikansi 5%, diperlukan minimal (2,486/|β|)² = ${fmtInt(nm)} responden, sehingga sampel ${fmtInt(R.prep.n)} responden ${R.prep.n >= nm ? 'memadai' : 'berada di bawah batas tersebut dan hasil perlu ditafsirkan dengan hati-hati'}.`, `Sample size adequacy was assessed with the inverse square root method ${cite('kock18')}. Detecting the smallest ${sg ? 'significant ' : ''}path coefficient in the model (|β| = ${fmt(bm)}) with 80% power at the 5% significance level requires at least (2.486/|β|)² = ${fmtInt(nm)} respondents; the sample of ${fmtInt(R.prep.n)} respondents is therefore ${R.prep.n >= nm ? 'adequate' : 'below this threshold, so the results should be interpreted with caution'}.`)); }
  head(2, tl('Pengukuran', 'Measurement'));
  { const mc = R.model.constructs.filter(c => !isHoc(c)), fm = mc.filter(c => c.mode === 'formative');
    p(tl(`Konstruk diukur dengan ${likert ? `skala Likert ${likert} poin` : 'item kuesioner'}: ${mc.map(c => `${cl(c.name)} dengan ${c.items.length} item`).join('; ')}.${fm.length ? ` ${andJoin(fm.map(c => c.name))} dispesifikasikan sebagai konstruk formatif, sedangkan konstruk lainnya reflektif.` : ' Seluruh konstruk dispesifikasikan sebagai konstruk reflektif.'}`, `The constructs were measured with ${likert ? `${likert}-point Likert scales` : 'questionnaire items'}: ${mc.map(c => `${cl(c.name)} with ${c.items.length} item${c.items.length > 1 ? 's' : ''}`).join('; ')}.${fm.length ? ` ${andJoin(fm.map(c => c.name))} ${fm.length > 1 ? 'were' : 'was'} specified as formative, and the remaining constructs as reflective.` : ' All constructs were specified as reflective.'}`)); }
  ph(tl('[Sebutkan sumber item pengukuran dan adaptasi yang dilakukan, misalnya penerjemahan balik (back-translation) dan uji coba instrumen.]', '[Cite the sources of the measurement items and describe any adaptation, such as back-translation and pretesting.]'));
  head(2, tl('Analisis Data', 'Data Analysis'));
  c1 = cite('hair22');
  { const ds = (R.desc || []).filter(Boolean), nn = ds.filter(d => Math.abs(d.skew) > 1 || Math.abs(d.kurt) > 1).length, why = [];
    if (nn) why.push(tl(`${nn} dari ${ds.length} indikator menyimpang dari distribusi normal (|skewness| atau |excess kurtosis| > 1)`, `${nn} of the ${ds.length} indicators deviate from normality (|skewness| or |excess kurtosis| > 1)`));
    if (R.model.constructs.some(c => c.mode === 'formative')) why.push(tl('model memuat konstruk formatif', 'the model includes formatively measured constructs'));
    if (R.model.constructs.length >= 6 || R.hyp.length >= 8) why.push(tl(`model relatif kompleks (${R.model.constructs.length} konstruk, ${R.hyp.length} hipotesis)`, `the model is relatively complex (${R.model.constructs.length} constructs, ${R.hyp.length} hypotheses)`));
    if (R.ext && R.ext.any) why.push(tl('model memuat konstruk orde tinggi atau efek moderasi', 'the model contains higher-order constructs or moderating effects'));
    if (P) why.push(tl('penelitian ini juga menilai kemampuan prediksi model', 'the study also assesses the predictive ability of the model'));
    p(tl(`Data dianalisis dengan partial least squares structural equation modeling (PLS-SEM), metode berbasis varians yang berorientasi prediksi dan tidak mensyaratkan normalitas multivariat ${c1}${why.length ? `. Metode ini sesuai karena ${andJoin(why)}` : ''}.`, `The data were analyzed with partial least squares structural equation modeling (PLS-SEM), a variance-based, prediction-oriented method that does not require multivariate normality ${c1}${why.length ? `. The method suits this study because ${andJoin(why)}` : ''}.`)); }
  p(tl(`PLS-SEM menaksir dua submodel. Model pengukuran menghubungkan setiap konstruk dengan indikatornya; pada pengukuran reflektif, setiap indikator mencerminkan konstruknya:`, `PLS-SEM estimates two sub-models. The measurement model links each construct to its indicators; in reflective measurement, each indicator reflects its construct:`));
  eq('refl');
  p(tl('dengan λ adalah loading dan ε galat pengukuran. Pada pengukuran formatif, indikator bersama-sama membentuk konstruk melalui bobot w:', 'where λ is the loading and ε the measurement error. In formative measurement, the indicators jointly form the construct through the weights w:'));
  eq('form');
  p(tl('Model struktural menghubungkan setiap konstruk endogen η dengan konstruk pendahulunya P:', 'The structural model links each endogenous construct η to its predecessor constructs P:'));
  eq('struct');
  nL = citeN('lohm89'); cL = cite('lohm89');
  p(tl(`dengan β adalah koefisien jalur dan ζ galat struktural. Model diestimasi dengan SEMbada versi ${APP_VERSION} ${cite('sembada')} menggunakan algoritma iteratif ${nL} dengan skema pembobotan ${S.scheme === 'path' ? 'path' : S.scheme === 'factorial' ? 'factorial' : 'centroid'}, Mode A untuk konstruk reflektif${R.model.constructs.some(c => c.mode === 'formative') ? ' dan Mode B untuk konstruk formatif' : ''}, serta kriteria henti 10⁻${S.stopExp}${plsc ? `; consistent PLS (PLSc) digunakan untuk mengoreksi atenuasi korelasi antarkonstruk reflektif ${cite('dij15')}` : ''}. ${b ? `Signifikansi diuji dengan bootstrapping ${fmtInt(b.B)} subsampel (uji ${tails}; interval kepercayaan ${ciName} ${lvl}%) ${cite('efron93')}.` : ''}${P ? ` Kemampuan prediksi di luar sampel dinilai dengan PLSpredict (validasi silang ${P.folds}-fold, ${P.reps} pengulangan) ${cS = cite('shm19')}.` : ''}`,
    `where β denotes the path coefficients and ζ the structural error. The model was estimated in SEMbada version ${APP_VERSION} ${cite('sembada')} using the iterative algorithm of ${nL} with the ${S.scheme === 'path' ? 'path' : S.scheme === 'factorial' ? 'factorial' : 'centroid'} weighting scheme, Mode A for reflective${R.model.constructs.some(c => c.mode === 'formative') ? ' and Mode B for formative' : ''} constructs, and a stop criterion of 10⁻${S.stopExp}${plsc ? `; consistent PLS (PLSc) was used to correct the attenuation of the correlations between reflective constructs ${cite('dij15')}` : ''}. ${b ? `Significance was assessed by bootstrapping with ${fmtInt(b.B)} subsamples (${tails} test; ${lvl}% ${ciName} confidence intervals) ${cite('efron93')}.` : ''}${P ? ` Out-of-sample predictive power was assessed with PLSpredict (${P.folds}-fold cross-validation, ${P.reps} repetitions) ${cS = cite('shm19')}.` : ''}`));
  { const hasF = R.model.constructs.some(c => c.mode === 'formative' && !isHoc(c)), rows = [
      [tl('Reliabilitas indikator', 'Indicator reliability'), tl(`Outer loading ≥ ${fmt(0.708, 3)}`, `Outer loading ≥ ${fmt(0.708, 3)}`), cite('hair19')],
      [tl('Reliabilitas konsistensi internal', 'Internal consistency reliability'), tl(`α, ρA, ρC antara ${k2(0.70)} dan ${k2(0.95)}`, `α, ρA, ρC between ${k2(0.70)} and ${k2(0.95)}`), cite('cron51', 'dij15', 'jor71')],
      [tl('Validitas konvergen', 'Convergent validity'), `AVE ≥ ${k2(0.50)}`, cite('fl81')],
      [tl('Validitas diskriminan', 'Discriminant validity'), tl(`HTMT < ${k2(0.85)} (< ${k2(0.90)} untuk konstruk yang mirip)`, `HTMT < ${k2(0.85)} (< ${k2(0.90)} for similar constructs)`), cite('hen15')]]
      .concat(hasF ? [[tl('Pengukuran formatif', 'Formative measurement'), tl(`VIF < 3; weight signifikan atau loading ≥ ${k2(0.50)}`, `VIF < 3; significant weight or loading ≥ ${k2(0.50)}`), cite('hair19')]] : [], [
      [tl('Kolinearitas struktural', 'Structural collinearity'), tl('VIF dalam < 3', 'Inner VIF < 3'), cite('hair19')],
      [tl('Signifikansi jalur', 'Path significance'), tl(`p < ${fmt(alpha, 2)}; interval kepercayaan tidak memuat nol`, `p < ${fmt(alpha, 2)}; confidence interval excludes zero`), cite('efron93')],
      [tl('Daya penjelas', 'Explanatory power'), tl(`R² ${k2(0.25)} / ${k2(0.50)} / ${k2(0.75)}: lemah / sedang / substansial`, `R² ${k2(0.25)} / ${k2(0.50)} / ${k2(0.75)}: weak / moderate / substantial`), cite('hair11')],
      [tl('Ukuran efek', 'Effect size'), tl(`f² ${k2(0.02)} / ${k2(0.15)} / ${k2(0.35)}: kecil / sedang / besar`, `f² ${k2(0.02)} / ${k2(0.15)} / ${k2(0.35)}: small / medium / large`), cite('cohen88')]],
      P ? [[tl('Daya prediksi', 'Predictive power'), tl('Q²predict > 0; RMSE PLS < RMSE LM', 'Q²predict > 0; RMSE of PLS < RMSE of LM'), cS || cite('shm19')]] : [],
      b && b.chains.length ? [[tl('Mediasi', 'Mediation'), tl('Efek tidak langsung signifikan; tipologi Zhao dkk.', 'Significant indirect effect; Zhao et al. typology'), cite('zhao10')]] : [],
      [[tl('Model fit', 'Model fit'), `SRMR < ${k2(0.08)}`, cite('hu99', 'hen14')]]);
    p(tl(`Mengikuti pedoman ${citeN('hair19')}, model pengukuran dievaluasi sebelum model struktural. ${tref(T.crit)} merangkum kriteria dan batas yang digunakan.`, `Following the guidelines of ${citeN('hair19')}, the measurement model was evaluated before the structural model. ${tref(T.crit)} summarizes the criteria and thresholds applied.`));
    tbl({ num: T.crit, title: tl('Kriteria Evaluasi PLS-SEM', 'PLS-SEM Assessment Criteria'), head: [tl('Kriteria', 'Criterion'), tl('Batas', 'Threshold'), tl('Rujukan', 'Reference')], rows, align: ['l', 'l', 'l'] }); }
  if (hcI.length) p(tl(`${capFirst(andJoin(hcI.map(H => `${cl(H.name)} dimodelkan sebagai konstruk orde tinggi ${H.refl ? 'reflektif' : 'formatif'} dengan konstruk orde rendah ${andJoin(H.locs.map(l => l.name))}`)))} dan diestimasi dengan pendekatan disjoint two-stage ${cite('becker12', 'sarstedt19')}: skor konstruk orde rendah dari tahap 1 menjadi indikator konstruk orde tinggi pada tahap 2.`, `${capFirst(andJoin(hcI.map(H => `${cl(H.name)} was modeled as a ${H.refl ? 'reflective' : 'formative'} higher-order construct with the lower-order constructs ${andJoin(H.locs.map(l => l.name))}`)))} and estimated with the disjoint two-stage approach ${cite('becker12', 'sarstedt19')}: the stage-1 scores of the lower-order constructs serve as its indicators in stage 2.`));
  if (mdI.length) p(tl(`Efek moderasi diestimasi dengan pendekatan dua tahap ${cite('henseler10')}: term interaksi dibentuk dari hasil kali skor terstandar prediktor dan moderator, dan kedua tahap diulang pada setiap sampel bootstrap. Bentuk moderasi ditafsirkan melalui simple slope.`, `Moderating effects were estimated with the two-stage approach ${cite('henseler10')}: the interaction term is the product of the standardized predictor and moderator scores, and both stages are repeated in every bootstrap sample. The form of the moderation is interpreted through simple slopes.`));
  if (G) p(tl(`Perbedaan antara grup ${G.a} dan ${G.b} diuji dengan analisis multigrup setelah memeriksa invariansi pengukuran komposit melalui MICOM ${cite('henseler16')}; perbedaan jalur diuji dengan uji permutasi ${cite('chin10')} sebanyak ${fmtInt(G.P)} kali serta uji parametrik ${cite('keil00')} dan Welch-Satterthwaite.`, `Differences between groups ${G.a} and ${G.b} were tested with a multigroup analysis after assessing the measurement invariance of composites with MICOM ${cite('henseler16')}; path differences were tested with a permutation test ${cite('chin10')} using ${fmtInt(G.P)} permutations, complemented by the parametric ${cite('keil00')} and Welch-Satterthwaite tests.`));
  if (IP) p(tl(`Importance-performance map analysis (IPMA) ${cite('ringle16')} membandingkan efek total tak terstandar setiap konstruk terhadap ${cl(IP.targetName)} dengan kinerja rata-ratanya pada skala 0–100.`, `An importance-performance map analysis (IPMA) ${cite('ringle16')} contrasted each construct's unstandardized total effect on ${cl(IP.targetName)} with its mean performance on a 0–100 scale.`));
  p(tl('Rumus estimasi dan evaluasi selengkapnya disajikan pada Lampiran A.', 'The full estimation and evaluation formulas are given in Appendix A.'));
  head(1, tl('Hasil', 'Results'));
  head(2, tl('Evaluasi Model Pengukuran', 'Measurement Model Assessment'));
  if (refl.length > 1) F.htmt = ++fig.n;
  const cH19 = cite('hair19'), cH22 = cite('hair22');
  if (refl.length) {
    const loads = []; refl.forEach(j => R.spec.blocks[j].forEach((k, a) => loads.push({ k, v: e.loadings[j][a] })));
    const vals = loads.map(x => x.v), low = loads.filter(x => x.v < 0.7), mid = low.filter(x => x.v >= 0.4), vlow = low.filter(x => x.v < 0.4), lbl = x => `${R.items[x.k]} (${fmt(x.v)})`;
    let s = tl(`${tref(T.meas)} menyajikan hasil evaluasi model pengukuran. `, `${tref(T.meas)} presents the results of the measurement model assessment. `);
    if (!low.length) s += tl(`Seluruh outer loading indikator reflektif melampaui batas yang direkomendasikan, yaitu ${k2(0.70)} (rentang ${rng(vals)}), sehingga reliabilitas indikator terpenuhi ${cH19}.`, `All outer loadings of the reflective indicators exceeded the recommended threshold of ${k2(0.70)} (range: ${rng(vals)}), indicating satisfactory indicator reliability ${cH19}.`);
    else {
      s += tl(`Outer loading indikator reflektif berkisar antara ${rngTo(vals)}. Indikator ${andJoin(low.map(lbl))} memiliki loading di bawah batas yang direkomendasikan, yaitu ${k2(0.70)} ${cH19}.`, `Outer loadings of the reflective indicators ranged from ${rngTo(vals)}. ${andJoin(low.map(lbl))} ${low.length > 1 ? 'had loadings' : 'had a loading'} below the recommended threshold of ${k2(0.70)} ${cH19}.`);
      if (mid.length) s += tl(` Indikator dengan loading antara ${k2(0.40)} dan ${k2(0.70)} dapat dipertahankan apabila composite reliability dan AVE konstruknya memenuhi batas yang direkomendasikan ${cH22}.`, ` Indicators with loadings between ${k2(0.40)} and ${k2(0.70)} may be retained when the composite reliability and AVE of their constructs meet the recommended thresholds ${cH22}.`);
      if (vlow.length) s += tl(` Indikator dengan loading di bawah ${k2(0.40)} (${andJoin(vlow.map(lbl))}) sebaiknya dikeluarkan dari model.`, ` Indicators with loadings below ${k2(0.40)} (${andJoin(vlow.map(lbl))}) should be considered for removal.`);
    }
    p(s);
    const reflM = refl.filter(j => R.spec.blocks[j].length > 1).length ? refl.filter(j => R.spec.blocks[j].length > 1) : refl;
    const al = reflM.map(j => A.alpha[j]), ra = reflM.map(j => A.rhoA[j]), rc = reflM.map(j => A.rhoC[j]), av = reflM.map(j => A.AVE[j]);
    const relLow = reflM.filter(j => A.alpha[j] < 0.7 || A.rhoC[j] < 0.7), relHigh = reflM.filter(j => A.rhoC[j] > 0.95), aveLow = reflM.filter(j => A.AVE[j] < 0.5);
    let s2 = relLow.length
      ? tl(`Reliabilitas konsistensi internal belum sepenuhnya terpenuhi: Cronbach's alpha berkisar antara ${rngTo(al)}, rho_A antara ${rngTo(ra)}, dan composite reliability (rho_C) antara ${rngTo(rc)}, dengan ${andJoin(relLow.map(j => R.lv[j]))} berada di bawah ${k2(0.70)}.`, `Internal consistency reliability was not fully established: Cronbach's alpha ranged from ${rngTo(al)}, rho_A from ${rngTo(ra)}, and composite reliability (rho_C) from ${rngTo(rc)}, with ${andJoin(relLow.map(j => R.lv[j]))} below ${k2(0.70)}.`)
      : tl(`Reliabilitas konsistensi internal terpenuhi karena Cronbach's alpha (${rng(al)}), rho_A (${rng(ra)}), dan composite reliability rho_C (${rng(rc)}) seluruhnya melampaui ${k2(0.70)}.`, `Internal consistency reliability was established, as Cronbach's alpha (${rng(al)}), rho_A (${rng(ra)}), and composite reliability rho_C (${rng(rc)}) all exceeded ${k2(0.70)}.`);
    if (relHigh.length) s2 += tl(` Nilai rho_C di atas ${k2(0.95)} pada ${andJoin(relHigh.map(j => R.lv[j]))} dapat mengindikasikan indikator yang redundan ${cH19}.`, ` rho_C values above ${k2(0.95)} for ${andJoin(relHigh.map(j => R.lv[j]))} may indicate redundant indicators ${cH19}.`);
    s2 += aveLow.length
      ? tl(` Validitas konvergen belum terpenuhi pada ${andJoin(aveLow.map(j => `${R.lv[j]} (AVE = ${fmt(A.AVE[j])})`))} karena AVE berada di bawah ${k2(0.50)}.`, ` Convergent validity was not established for ${andJoin(aveLow.map(j => `${R.lv[j]} (AVE = ${fmt(A.AVE[j])})`))}, as the AVE fell below ${k2(0.50)}.`)
      : tl(` Validitas konvergen juga terpenuhi karena average variance extracted (AVE) setiap konstruk melampaui ${k2(0.50)} (rentang ${rng(av)}).`, ` Convergent validity was also supported, as the average variance extracted (AVE) of every construct exceeded ${k2(0.50)} (range: ${rng(av)}).`);
    p(s2);
    if (refl.length > 1) {
      let mx = -Infinity, mxPair = ''; const o90 = [], o85 = [];
      refl.forEach((i, a) => refl.forEach((j, c) => { if (c <= a) return; const v = A.HTMT[i][j], pr = `${R.lv[i]}–${R.lv[j]}`; if (v > mx) { mx = v; mxPair = pr; } if (v >= 0.9) o90.push(`${pr} (${fmt(v)})`); else if (v >= 0.85) o85.push(`${pr} (${fmt(v)})`); }));
      const cHen = cite('hen15');
      let s3 = tl(`Validitas diskriminan dievaluasi dengan heterotrait–monotrait ratio of correlations (HTMT) ${cHen}. `, `Discriminant validity was assessed with the heterotrait–monotrait ratio of correlations (HTMT) ${cHen}. `);
      if (o90.length) s3 += tl(`Seperti terlihat pada ${fref(F.htmt)}, nilai HTMT pada pasangan ${andJoin(o90)} melampaui ${k2(0.90)}, sehingga validitas diskriminan pasangan tersebut belum terpenuhi.`, `As shown in ${fref(F.htmt)}, the HTMT values of ${andJoin(o90)} exceeded ${k2(0.90)}, indicating a lack of discriminant validity for ${o90.length > 1 ? 'these pairs' : 'this pair'}.`);
      else if (o85.length) s3 += tl(`Seperti terlihat pada ${fref(F.htmt)}, seluruh nilai HTMT berada di bawah batas ${k2(0.90)} untuk konstruk yang mirip secara konseptual (tertinggi ${fmt(mx)} pada ${mxPair}), meskipun ${andJoin(o85)} melampaui batas konservatif ${k2(0.85)}.`, `As shown in ${fref(F.htmt)}, all HTMT values were below the ${k2(0.90)} threshold for conceptually similar constructs (highest: ${fmt(mx)} for ${mxPair}), although ${andJoin(o85)} exceeded the conservative threshold of ${k2(0.85)}.`);
      else s3 += tl(`Seperti terlihat pada ${fref(F.htmt)}, seluruh nilai HTMT berada di bawah batas konservatif ${k2(0.85)} (tertinggi ${fmt(mx)} pada ${mxPair}).`, `As shown in ${fref(F.htmt)}, all HTMT values were below the conservative threshold of ${k2(0.85)} (highest: ${fmt(mx)} for ${mxPair}).`);
      if (b) {
        const over1 = b.htmt.filter(x => x.s && R.refl[x.key[0]] && R.refl[x.key[1]] && x.s.hi >= 1).map(x => `${R.lv[x.key[0]]}–${R.lv[x.key[1]]}`);
        s3 += over1.length ? tl(` Batas atas interval kepercayaan bootstrap HTMT mencapai 1 atau lebih pada ${andJoin(over1)}.`, ` The upper bound of the bootstrap confidence interval of HTMT reached 1 or more for ${andJoin(over1)}.`) : tl(' Batas atas interval kepercayaan bootstrap seluruh nilai HTMT juga berada di bawah 1, sehingga validitas diskriminan terpenuhi.', ' The upper bounds of the bootstrap confidence intervals of all HTMT values were also below 1, thereby establishing discriminant validity.');
      } else if (!o90.length) s3 += tl(' Dengan demikian, validitas diskriminan terpenuhi.', ' Discriminant validity was therefore established.');
      p(s3);
    }
  }
  if (form.length) {
    let vmx = 0; const hiV = [];
    form.forEach(j => R.spec.blocks[j].forEach((k, a) => { const v = A.outerVIF[j][a]; vmx = Math.max(vmx, v); if (v >= 5) hiV.push(`${R.items[k]} (${fmt(v)})`); }));
    const fl = andJoin(form.map(j => R.lv[j]));
    let s4 = tl(`Konstruk formatif ${fl} dievaluasi melalui kolinearitas indikator dan signifikansi outer weights ${cH22}. `, `The formative construct${form.length > 1 ? 's' : ''} ${fl} ${form.length > 1 ? 'were' : 'was'} assessed in terms of indicator collinearity and the significance of the outer weights ${cH22}. `);
    s4 += hiV.length ? tl(`Nilai VIF di atas 5 ditemukan pada ${andJoin(hiV)}, yang menandakan kolinearitas tinggi.`, `VIF values above 5 were found for ${andJoin(hiV)}, indicating critical collinearity.`) : tl(`Seluruh VIF indikator formatif berada di bawah 5 (tertinggi ${fmt(vmx)}), sehingga kolinearitas tidak menjadi masalah.`, `All formative indicator VIF values were below 5 (highest: ${fmt(vmx)}), so collinearity was not a concern.`);
    if (b) { const nsw = b.weights.filter(x => !R.refl[x.key[0]] && x.s && !(x.s.P < alpha)).map(x => R.items[x.key[2]]); s4 += nsw.length ? tl(` Outer weight ${andJoin(nsw)} tidak signifikan; indikator semacam ini tetap dipertahankan bila outer loading-nya ≥ ${k2(0.50)} ${cH22}.`, ` The outer weights of ${andJoin(nsw)} were not significant; such indicators are retained when their outer loadings are ≥ ${k2(0.50)} ${cH22}.`) : tl(' Seluruh outer weights signifikan.', ' All outer weights were significant.'); }
    p(s4);
  }
  if (A.issues.length) p(tl('Catatan: solusi yang diperoleh tidak wajar (inadmissible), misalnya R² atau koefisien jalur melebihi 1, sehingga hasil perlu ditafsirkan dengan sangat hati-hati.', 'Note: the solution was inadmissible (for example, an R² or a path coefficient above 1), so the results should be interpreted with great caution.'));
  const mRows = [];
  R.lv.forEach((nm, j) => {
    const isF = !R.refl[j], cv = v => (isF ? '–' : fmt(v));
    mRows.push([nm + (isF ? tl(' (formatif)', ' (formative)') : ''), '', cv(A.alpha[j]), cv(A.rhoA[j]), cv(A.rhoC[j]), cv(A.AVE[j])]);
    R.spec.blocks[j].forEach((k, a) => mRows.push(['\u2003' + R.items[k], fmt(isF ? e.W[j][a] : e.loadings[j][a]), '', '', '', '']));
  });
  tbl({ num: T.meas, title: tl('Hasil Evaluasi Model Pengukuran', 'Measurement Model Results'), head: [tl('Konstruk / indikator', 'Construct / indicator'), form.length ? tl('Loading/bobot', 'Loading/weight') : 'Loading', "Cronbach's α", 'ρA', 'ρC', 'AVE'], rows: mRows, align: ['l', 'r', 'r', 'r', 'r', 'r'],
    note: tl(`ρA = koefisien reliabilitas rho_A; ρC = composite reliability; AVE = average variance extracted.${form.length ? ' Untuk konstruk formatif, kolom loading memuat outer weight.' : ''}${plsc ? ' Loading telah dikoreksi dengan PLSc.' : ''}`, `ρA = reliability coefficient rho_A; ρC = composite reliability; AVE = average variance extracted.${form.length ? ' For formative constructs, the loading column reports outer weights.' : ''}${plsc ? ' Loadings are PLSc-corrected.' : ''}`) });
  if (F.htmt) { const vh = vizHTMT(R); if (vh) B.push({ type: 'figure', num: F.htmt, fkey: 'v-htmt', file: 'fig-htmt.png', svg: vh.svg, col: true, title: tl('Rasio heterotrait–monotrait (HTMT)', 'Heterotrait–monotrait ratio (HTMT)'), note: tl(`Nilai di bawah ${k2(0.85)} (konservatif) atau ${k2(0.90)} mendukung validitas diskriminan ${cite('hen15')}`, `Values below ${k2(0.85)} (conservative) or ${k2(0.90)} support discriminant validity ${cite('hen15')}`) }); }

  /* ---- structural model */
  head(2, tl('Evaluasi Model Struktural', 'Structural Model Assessment'));
  let mxv = 0; R.hyp.forEach(h => { const v = A.innerVIF[h.i][h.j]; if (Number.isFinite(v)) mxv = Math.max(mxv, v); });
  const hiI = R.hyp.filter(h => A.innerVIF[h.i][h.j] >= 5).map(h => `${h.from} → ${h.to} (${fmt(A.innerVIF[h.i][h.j])})`);
  let s5 = tl(`${fref(fig.n + 1)} menyajikan model struktural hasil estimasi. Sebelum hubungan struktural diuji, model diperiksa dari sisi kolinearitas. `, `${fref(fig.n + 1)} presents the estimated structural model. Before the structural relationships were examined, the model was checked for collinearity. `);
  s5 += hiI.length ? tl(`Nilai VIF antarkonstruk melampaui 5 pada ${andJoin(hiI)}, sehingga koefisien jalurnya perlu ditafsirkan dengan hati-hati ${cH19}.`, `Inner VIF values exceeded 5 for ${andJoin(hiI)}, so the corresponding path coefficients should be interpreted with caution ${cH19}.`)
    : mxv < 3 ? tl(`Seluruh nilai VIF antarkonstruk berada di bawah 3 (tertinggi ${fmt(mxv)}), sehingga kolinearitas tidak membiaskan estimasi koefisien jalur ${cH19}.`, `All inner VIF values were below 3 (highest: ${fmt(mxv)}), indicating that collinearity did not bias the path coefficient estimates ${cH19}.`)
      : tl(`Seluruh nilai VIF antarkonstruk berada di bawah 5 (tertinggi ${fmt(mxv)}) ${cH19}.`, `All inner VIF values were below 5 (highest: ${fmt(mxv)}) ${cH19}.`);
  p(s5);
  B.push({ type: 'figure', num: (F.est = ++fig.n), fkey: 'est', file: 'fig-est.png', title: tl('Model struktural hasil estimasi', 'Estimated structural model'), note: dgNote(R, dgMainShow(R)), show: dgMainShow(R) });
  const nHair11 = citeN('hair11'), cCo = cite('cohen88');
  let s6 = tl(`Model menjelaskan ${andJoin(R.endo.map((j, i) => `${pct(r2v[i])} varians ${R.lv[j]}`))} (${tref(T.r2)}).`, `The model explains ${andJoin(R.endo.map((j, i) => (i ? `${pct(r2v[i])} in ${R.lv[j]}` : `${pct(r2v[i])} of the variance in ${R.lv[j]}`)))} (${tref(T.r2)}).`);
  if (r2hi > 1) s6 += tl(' Nilai R² di atas 1 menandakan solusi yang tidak wajar.', ' R² values above 1 indicate an inadmissible solution.');
  else { const cat = r2Cat(r2lo) === r2Cat(r2hi) ? r2Cat(r2lo) : tl(`${r2Cat(r2lo)} hingga ${r2Cat(r2hi)}`, `${r2Cat(r2lo)} to ${r2Cat(r2hi)}`); s6 += tl(` Mengacu pada ${nHair11}, daya penjelas tersebut tergolong ${cat}.`, ` Following ${nHair11}, this explanatory power can be described as ${cat}.`); }
  const f2s = R.hyp.map(h => ({ h, v: A.f2[h.i][h.j] })).filter(x => Number.isFinite(x.v)).sort((x, y) => y.v - x.v);
  if (f2s.length) s6 += tl(` Ukuran efek f² ${cCo} disajikan pada ${tref(T.struct)}; efek terbesar terdapat pada pengaruh ${f2s[0].h.from} terhadap ${f2s[0].h.to} (f² = ${fmt(f2s[0].v)}, ${f2Cat(f2s[0].v)}).`, ` The f² effect sizes ${cCo} are reported in ${tref(T.struct)}; the largest effect was that of ${f2s[0].h.from} on ${f2s[0].h.to} (f² = ${fmt(f2s[0].v)}, ${f2Cat(f2s[0].v)}).`);
  p(s6);
  const sr = A.fit.saturated.srmr, cHu = cite('hu99'), cHen14 = cite('hen14');
  p(tl(`Nilai standardized root mean square residual (SRMR) model saturated sebesar ${fmt(sr)} (estimated model: ${fmt(A.fit.estimated.srmr)}), ${sr < 0.08 ? 'di bawah' : 'di atas'} batas ${k2(0.08)} ${cHu}; namun, ukuran kecocokan model dalam PLS-SEM perlu ditafsirkan dengan hati-hati ${cHen14}.`, `The standardized root mean square residual (SRMR) of the saturated model was ${fmt(sr)} (estimated model: ${fmt(A.fit.estimated.srmr)}), ${sr < 0.08 ? 'below' : 'above'} the threshold of ${k2(0.08)} ${cHu}; however, model fit indices should be interpreted with caution in PLS-SEM ${cHen14}.`));
  const qmap = P ? new Map(P.constructs.map(x => [x.j, x.q2])) : null;
  tbl({ num: T.r2, title: P ? tl('Daya Penjelas dan Daya Prediksi Model', 'Explanatory and Predictive Power') : tl('Koefisien Determinasi', 'Coefficient of Determination'), head: [tl('Konstruk', 'Construct'), 'R²', tl('R² adj.', 'Adj. R²')].concat(P ? ['Q²predict'] : []), align: ['l', 'r', 'r'].concat(P ? ['r'] : []),
    rows: R.endo.map((j, i) => [R.lv[j], fmt(r2v[i]), fmt(e.R2adj[j])].concat(P ? [qmap.has(j) ? fmt(qmap.get(j)) : '–'] : [])),
    note: tl(`R² adj. = R² yang disesuaikan${P ? '; Q²predict dari PLSpredict pada tingkat konstruk' : ''}.`, `Adj. R² = adjusted R²${P ? '; Q²predict from PLSpredict at the construct level' : ''}.`) });

  /* ---- hypothesis testing */
  head(2, tl('Pengujian Hipotesis', 'Hypothesis Testing'));
  if (b) {
    const st = s => `β = ${fmt(s.O)}, t = ${fmt(s.T)}, ${fmtPtxt(s.P)}`;
    let s7 = tl(`${tref(T.struct)} menyajikan hasil pengujian hipotesis. `, `${tref(T.struct)} presents the results of the hypothesis tests. `);
    s7 += sup.length ? tl(`Sebanyak ${sup.length} dari ${R.hyp.length} hipotesis diterima.`, `${capFirst(numW(sup.length))} of the ${numW(R.hyp.length)} hypotheses ${sup.length === 1 ? 'was' : 'were'} supported.`) : tl('Tidak ada hipotesis yang diterima.', 'None of the hypotheses was supported.');
    sup.forEach(({ h, s }) => { s7 += ' ' + tl(`${h.from} berpengaruh ${s.O >= 0 ? 'positif' : 'negatif'} dan signifikan terhadap ${h.to} (${st(s)}, CI ${lvl}% ${ciTxt(s)}), sehingga ${h.h} diterima.`, `${h.from} had a significant ${s.O >= 0 ? 'positive' : 'negative'} effect on ${h.to} (${st(s)}, ${lvl}% CI ${ciTxt(s)}), supporting ${h.h}.`); });
    p(s7);
    if (ns.length) {
      const list = ns.map(({ h, s }) => tl(`${h.from} terhadap ${h.to} (${st(s)})`, `${h.from} on ${h.to} (${st(s)})`)), hs = andJoin(ns.map(x => x.h.h)), one = ns.length === 1;
      p(tl(`${sup.length ? 'Sebaliknya, p' : 'P'}engaruh ${andJoinSemi(list)} tidak signifikan, sehingga ${hs} ditolak.`, `${sup.length ? 'In contrast, the' : 'The'} ${one ? 'effect' : 'effects'} of ${andJoinSemi(list)} ${one ? 'was' : 'were'} not significant; therefore, ${hs} ${one ? 'was' : 'were'} not supported.`));
    }
  } else p(tl(`Bootstrapping tidak dijalankan, sehingga signifikansi koefisien jalur belum dapat diuji; koefisien jalur hasil estimasi disajikan pada ${tref(T.struct)}.`, `Bootstrapping was not performed, so the significance of the path coefficients could not be assessed; the estimated path coefficients are reported in ${tref(T.struct)}.`));
  const sRows = R.hyp.map(h => {
    const f2 = fmt(A.f2[h.i][h.j]), base = [h.h, `${h.from} → ${h.to}`];
    if (!b) return base.concat([fmt(e.B[h.i][h.j]), f2]);
    const s = R.bootPath.get(h.i + ',' + h.j); if (!s) return base.concat([fmt(e.B[h.i][h.j]), '–', '–', '–', f2, '–']);
    return base.concat([fmt(s.O), fmt(s.T), pTxt(s.P), ciTxt(s), f2, decideTxt(s.P < alpha)]);
  });
  tbl({ num: T.struct, title: tl('Hasil Pengujian Model Struktural', 'Structural Model Results'), head: b ? [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path'), 'β', 't', 'p', tl(`CI ${lvl}%`, `${lvl}% CI`), 'f²', tl('Keputusan', 'Decision')] : [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path'), 'β', 'f²'], rows: sRows, align: b ? ['l', 'l', 'r', 'r', 'r', 'r', 'r', 'l'] : ['l', 'l', 'r', 'r'],
    note: b ? tl(`β = koefisien jalur terstandar; t dan p dari bootstrapping ${fmtInt(b.B)} subsampel (uji ${tails}); CI = interval kepercayaan ${ciName}; f² = ukuran efek.`, `β = standardized path coefficient; t and p values from bootstrapping with ${fmtInt(b.B)} subsamples (${tails} test); CI = ${ciName} confidence interval; f² = effect size.`) : tl('β = koefisien jalur terstandar; f² = ukuran efek. Signifikansi belum diuji karena bootstrapping tidak dijalankan.', 'β = standardized path coefficient; f² = effect size. Significance was not tested because bootstrapping was not run.') });
  if (b) { const vr = vizRidge(R); if (vr) { F.ridge = ++fig.n; p(tl(`${fref(F.ridge)} memperlihatkan distribusi bootstrap setiap koefisien jalur. Jalur yang distribusinya tidak memuat nol pada interval kepercayaannya adalah jalur yang signifikan.`, `${fref(F.ridge)} shows the bootstrap distribution of each path coefficient. Paths whose confidence interval does not contain zero are significant.`)); B.push({ type: 'figure', num: F.ridge, fkey: 'v-ridge', file: 'fig-bootstrap.png', svg: vr.svg, title: tl('Distribusi bootstrap koefisien jalur', 'Bootstrap distributions of the path coefficients'), note: tl(`Area berwarna = interval kepercayaan ${lvl}%; merah = signifikan; garis putus-putus = nol`, `Shaded area = ${lvl}% confidence interval; red = significant; dashed line = zero`) }); } }

  /* ---- mediation */
  if (T.med) {
    head(2, tl('Analisis Mediasi', 'Mediation Analysis'));
    const nZ = citeN('zhao10'), sig = b.chains.filter(x => x.s && x.s.P < alpha), mids = ch => andJoin(ch.slice(1, -1).map(i => R.lv[i]));
    let s8 = tl(`Pengaruh mediasi dianalisis mengikuti ${nZ} dengan menguji signifikansi efek tidak langsung spesifik melalui bootstrapping (${tref(T.med)}).`, `Mediation was analyzed following ${nZ} by testing the significance of the specific indirect effects through bootstrapping (${tref(T.med)}).`);
    const withDir = sig.filter(x => mediationCode(R, x) !== 'nodirect'), noDir = sig.filter(x => mediationCode(R, x) === 'nodirect');
    withDir.forEach(x => { const ch = x.key, st = `β = ${fmt(x.s.O)}, t = ${fmt(x.s.T)}, ${fmtPtxt(x.s.P)}`, ty = mediationText(mediationCode(R, x)).toLowerCase(); s8 += ' ' + tl(`Efek tidak langsung ${R.lv[ch[0]]} terhadap ${R.lv[ch[ch.length - 1]]} melalui ${mids(ch)} signifikan (${st}), yang menunjukkan ${ty}.`, `The indirect effect of ${R.lv[ch[0]]} on ${R.lv[ch[ch.length - 1]]} through ${mids(ch)} was significant (${st}), indicating ${ty}.`); });
    if (noDir.length) { const items = noDir.map(x => `${x.key.map(i => R.lv[i]).join(' → ')} (β = ${fmt(x.s.O)}, ${fmtPtxt(x.s.P)})`), one = noDir.length === 1; s8 += ' ' + tl(`Efek tidak langsung juga signifikan pada ${one ? 'rantai' : 'rantai-rantai'} yang tidak memiliki jalur langsung dalam model, yaitu ${andJoinSemi(items)}; efek ini merupakan efek tidak langsung murni (indirect-only).`, `Significant indirect effects were also found for ${one ? 'a chain' : 'chains'} without a direct path in the model, namely ${andJoinSemi(items)}; ${one ? 'this represents an indirect-only effect' : 'these represent indirect-only effects'}.`); }
    const rest = b.chains.length - sig.length;
    s8 += ' ' + (sig.length ? (rest ? tl(`${rest} efek tidak langsung lainnya tidak signifikan.`, `The remaining ${numW(rest)} indirect ${rest === 1 ? 'effect was' : 'effects were'} not significant.`) : '') : tl('Tidak ada efek tidak langsung yang signifikan, sehingga tidak ditemukan pengaruh mediasi.', 'None of the specific indirect effects was significant; hence, no mediation was found.'));
    p(s8.trim());
    tbl({ num: T.med, title: tl('Efek Tidak Langsung Spesifik', 'Specific Indirect Effects'), head: [tl('Jalur tidak langsung', 'Indirect path'), 'β', 't', 'p', tl(`CI ${lvl}%`, `${lvl}% CI`), tl('Jenis mediasi', 'Mediation type')], align: ['l', 'r', 'r', 'r', 'r', 'l'],
      rows: b.chains.map(x => { const s = x.s; return [x.key.map(i => R.lv[i]).join(' → '), s ? fmt(s.O) : '–', s ? fmt(s.T) : '–', s ? pTxt(s.P) : '–', s ? ciTxt(s) : '–', mediationText(mediationCode(R, x))]; }),
      note: tl(`Jenis mediasi mengikuti ${nZ}.`, `Mediation types follow ${nZ}.`) });
    { const ve = vizEffects(R); if (ve) { F.eff = ++fig.n; p(tl(`${fref(F.eff)} menguraikan efek total setiap konstruk menjadi efek langsung dan tidak langsung.`, `${fref(F.eff)} decomposes the total effect of each construct into its direct and indirect parts.`)); B.push({ type: 'figure', num: F.eff, fkey: 'v-effects', file: 'fig-effects.png', svg: ve.svg, title: tl('Dekomposisi efek langsung dan tidak langsung', 'Decomposition of direct and indirect effects'), note: tl('Batang gelap = efek langsung; batang merah muda = efek tidak langsung', 'Dark bars = direct effects; pink bars = indirect effects') }); } }
  }

  /* ---- predictive power */
  if (P) {
    head(2, tl('Kekuatan Prediksi', 'Predictive Power'));
    const neg = pp.neg.map(x => R.items[x.k]);
    let s9 = tl(`${tref(T.pred)} merangkum hasil PLSpredict. `, `${tref(T.pred)} summarizes the PLSpredict results. `);
    s9 += neg.length ? tl(`Q²predict tidak lebih besar dari nol pada ${andJoin(neg)}, sehingga model belum mengungguli tolok ukur rata-rata sederhana untuk indikator tersebut.`, `Q²predict was not above zero for ${andJoin(neg)}, so the model did not outperform the naïve mean benchmark for ${neg.length > 1 ? 'these indicators' : 'this indicator'}.`) : tl('Seluruh indikator konstruk endogen memiliki Q²predict di atas nol, yang menunjukkan bahwa model mengungguli tolok ukur rata-rata sederhana.', 'All indicators of the endogenous constructs had Q²predict values above zero, indicating that the model outperforms the naïve mean benchmark.');
    s9 += tl(` Dibandingkan dengan tolok ukur regresi linear (LM), model PLS-SEM menghasilkan RMSE yang lebih kecil pada ${pp.better} dari ${pp.n} indikator, yang menandakan ${phr} ${cS}.`, ` Compared with the linear regression (LM) benchmark, the PLS-SEM model yielded a lower RMSE for ${pp.better} of the ${pp.n} indicators, which indicates ${phr} ${cS}.`);
    p(s9);
    tbl({ num: T.pred, title: tl('Hasil PLSpredict Tingkat Indikator', 'PLSpredict Results at the Indicator Level'), head: [tl('Indikator', 'Indicator'), 'Q²predict', 'RMSE PLS-SEM', 'RMSE LM', 'MAE PLS-SEM', 'MAE LM'], align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: P.items.map(x => [R.items[x.k], fmt(x.q2), fmt(x.rmsePLS), fmt(x.rmseLM), fmt(x.maePLS), fmt(x.maeLM)]),
      note: tl(`LM = tolok ukur regresi linear; validasi silang ${P.folds}-fold dengan ${P.reps} kali pengulangan.`, `LM = linear regression benchmark; ${P.folds}-fold cross-validation with ${P.reps} repetitions.`) });
  }

  const xfig = (key, title, note) => { const f = extFigures(R).find(x => x.key === key); if (!f) return; B.push({ type: 'figure', num: ++fig.n, fkey: key, file: `fig${fig.n}.png`, svg: f.svg, col: true, title, note }); return fig.n; };
  if (hcI.length) {
    head(2, tl('Konstruk Orde Tinggi', 'Higher-Order Constructs'));
    T.hoc = ++tn; const hrows = [], weak = [];
    hcI.forEach(H => H.locs.forEach(l => { const v = H.refl ? e.loadings[H.j][l.a] : e.W[H.j][l.a]; if (R.A1.AVE[l.j1] < 0.5 || R.A1.rhoC[l.j1] < 0.7) weak.push(l.name); hrows.push([H.name, l.name, fmt(v), fmt(A.outerVIF[H.j][l.a]), fmt(R.A1.rhoC[l.j1]), fmt(R.A1.AVE[l.j1])]); }));
    const lo = hcI.flatMap(H => H.locs.map(l => (H.refl ? e.loadings[H.j][l.a] : e.W[H.j][l.a])));
    p(tl(`${tref(T.hoc)} merangkum evaluasi konstruk orde tinggi. Pada tahap 1, ${weak.length ? `${andJoin(weak)} belum memenuhi kriteria reliabilitas atau validitas konvergen` : 'seluruh konstruk orde rendah memenuhi kriteria reliabilitas (ρC ≥ 0,70) dan validitas konvergen (AVE ≥ 0,50)'}. Pada tahap 2, ${hcI.every(H => H.refl) ? `loading konstruk orde rendah berkisar ${rngTo(lo)}` : `bobot konstruk orde rendah berkisar ${rngTo(lo)}`}${b ? ' dan seluruhnya diuji dengan bootstrapping' : ''}.`, `${tref(T.hoc)} summarizes the higher-order construct assessment. In stage 1, ${weak.length ? `${andJoin(weak)} did not meet the reliability or convergent validity criteria` : 'all lower-order constructs met the reliability (ρC ≥ 0.70) and convergent validity (AVE ≥ 0.50) criteria'}. In stage 2, the ${hcI.every(H => H.refl) ? 'loadings' : 'weights'} of the lower-order constructs ranged from ${rngTo(lo)}${b ? ' and were all tested with bootstrapping' : ''}.`));
    tbl({ num: T.hoc, title: tl('Evaluasi Konstruk Orde Tinggi', 'Higher-Order Construct Assessment'), head: [tl('Orde tinggi', 'Higher-order'), tl('Orde rendah', 'Lower-order'), hcI.every(H => H.refl) ? 'Loading' : 'Loading/weight', 'VIF', 'ρC', 'AVE'], rows: hrows, align: ['l', 'l', 'r', 'r', 'r', 'r'], note: tl('Loading atau weight dan VIF dari tahap 2; ρC dan AVE konstruk orde rendah dari tahap 1.', 'Loading or weight and VIF from stage 2; ρC and AVE of the lower-order constructs from stage 1.') });
  }
  if (mdI.length) {
    head(2, tl('Efek Moderasi', 'Moderating Effects'));
    T.mod = ++tn;
    p(mdI.map(d => { const sig = !!(d.s && d.s.P < alpha); return tl(`Efek interaksi ${d.M} × ${d.X} terhadap ${d.Y} ${sig ? 'signifikan' : 'tidak signifikan'} (β = ${fmt(d.b3)}${d.s ? `, t = ${fmt(d.s.T)}, p ${pTxt(d.s.P).startsWith('<') ? pTxt(d.s.P) : '= ' + pTxt(d.s.P)}` : ''}, f² = ${fmt(d.f2)}), sehingga ${d.h.h} ${sig ? 'diterima' : 'ditolak'}.${sig ? ` Efek ${d.X} terhadap ${d.Y} ${d.b3 > 0 ? 'menguat' : 'melemah'} seiring naiknya ${d.M}: ${fmt(d.slopes[0])} pada −1 SD, ${fmt(d.slopes[1])} pada rata-rata, dan ${fmt(d.slopes[2])} pada +1 SD.` : ''}`, `The interaction effect ${d.M} × ${d.X} on ${d.Y} was ${sig ? 'significant' : 'not significant'} (β = ${fmt(d.b3)}${d.s ? `, t = ${fmt(d.s.T)}, p ${pTxt(d.s.P).startsWith('<') ? pTxt(d.s.P) : '= ' + pTxt(d.s.P)}` : ''}, f² = ${fmt(d.f2)}), so ${d.h.h} was ${sig ? 'supported' : 'not supported'}.${sig ? ` The effect of ${d.X} on ${d.Y} ${d.b3 > 0 ? 'strengthens' : 'weakens'} as ${d.M} increases: ${fmt(d.slopes[0])} at −1 SD, ${fmt(d.slopes[1])} at the mean, and ${fmt(d.slopes[2])} at +1 SD.` : ''}`); }).join(' ') + ' ' + tl(`Rincian disajikan pada ${tref(T.mod)}.`, `Details are given in ${tref(T.mod)}.`));
    tbl({ num: T.mod, title: tl('Hasil Analisis Moderasi', 'Moderation Results'), head: [tl('Hipotesis', 'Hypothesis'), tl('Interaksi', 'Interaction'), 'β', 't', 'p', 'f²', tl('Slope −1 SD', 'Slope −1 SD'), tl('Slope +1 SD', 'Slope +1 SD'), tl('Keputusan', 'Decision')],
      rows: mdI.map(d => { const sig = !!(d.s && d.s.P < alpha); return [d.h.h, `${d.M} × ${d.X} → ${d.Y}`, fmt(d.b3), d.s ? fmt(d.s.T) : '–', d.s ? pTxt(d.s.P) : '–', fmt(d.f2), fmt(d.slopes[0]), fmt(d.slopes[2]), b ? (sig ? tl('Diterima', 'Supported') : tl('Ditolak', 'Not supported')) : '–']; }), align: ['l', 'l', 'r', 'r', 'r', 'r', 'r', 'r', 'l'],
      note: tl('Pendekatan dua tahap; simple slope = efek prediktor pada moderator −1 SD dan +1 SD. Ukuran efek interaksi: 0,005 kecil, 0,01 sedang, 0,025 besar.', 'Two-stage approach; simple slope = effect of the predictor at moderator −1 SD and +1 SD. Interaction effect sizes: 0.005 small, 0.01 medium, 0.025 large.') });
    mdI.filter(d => d.s && d.s.P < alpha).forEach(d => xfig('slope-' + d.k, tl(`Simple slope ${d.M} pada ${d.X} → ${d.Y}`, `Simple slope of ${d.M} on ${d.X} → ${d.Y}`), tl('Garis = efek prediktor pada moderator −1 SD, rata-rata, dan +1 SD (skor terstandar)', 'Lines = effect of the predictor at moderator −1 SD, mean, and +1 SD (standardized scores)')));
  }
  if (G) {
    head(2, tl('Analisis Multigrup', 'Multigroup Analysis'));
    T.mga = ++tn; const all2 = G.micom.every(m => m.step2), full = all2 && G.micom.every(m => m.step3a && m.step3b), dif = G.paths.filter(x => x.pPerm < G.alpha), nonInv = G.micom.filter(m => !m.step2).map(m => R.lv[m.j]);
    const hd = x => { const h = R.hyp.find(q => q.i === x.i && q.j === x.j); return h ? `${h.from} → ${h.to}` : `${R.lv[x.i]} → ${R.lv[x.j]}`; };
    p(tl(`Grup ${G.a} berisi ${fmtInt(G.nA)} responden dan grup ${G.b} berisi ${fmtInt(G.nB)} responden. ${all2 ? (full ? 'MICOM menunjukkan invariansi pengukuran penuh' : 'MICOM menunjukkan invariansi pengukuran parsial (invariansi komposisional pada langkah 2)') : `Invariansi komposisional tidak tercapai untuk ${andJoin(nonInv)}, sehingga perbandingan grup perlu ditafsirkan dengan hati-hati`}. ${dif.length ? `Uji permutasi menunjukkan perbedaan signifikan pada ${andJoin(dif.map(x => `${hd(x)} (${G.a}: ${fmt(x.bA)}; ${G.b}: ${fmt(x.bB)}; p ${pTxt(x.pPerm).startsWith('<') ? pTxt(x.pPerm) : '= ' + pTxt(x.pPerm)})`))}.` : 'Uji permutasi tidak menemukan perbedaan koefisien jalur yang signifikan antargrup.'} Hasil lengkap disajikan pada ${tref(T.mga)}.`, `Group ${G.a} comprised ${fmtInt(G.nA)} respondents and group ${G.b} ${fmtInt(G.nB)} respondents. ${all2 ? (full ? 'MICOM established full measurement invariance' : 'MICOM established partial measurement invariance (compositional invariance in step 2)') : `Compositional invariance was not established for ${andJoin(nonInv)}, so the group comparison should be interpreted with caution`}. ${dif.length ? `The permutation test revealed significant differences for ${andJoin(dif.map(x => `${hd(x)} (${G.a}: ${fmt(x.bA)}; ${G.b}: ${fmt(x.bB)}; p ${pTxt(x.pPerm).startsWith('<') ? pTxt(x.pPerm) : '= ' + pTxt(x.pPerm)})`))}.` : 'The permutation test found no significant differences in path coefficients between the groups.'} Full results are given in ${tref(T.mga)}.`));
    tbl({ num: T.mga, title: tl('Hasil Analisis Multigrup', 'Multigroup Analysis Results'), head: [tl('Hipotesis', 'Hypothesis'), tl('Jalur', 'Path'), `β ${G.a}`, `β ${G.b}`, 'Δβ', tl('p permutasi', 'Permutation p'), tl('p parametrik', 'Parametric p'), 'p Welch'],
      rows: R.hyp.filter(h => !h.mod).map(h => { const x = G.paths.find(q => q.i === h.i && q.j === h.j); return x ? [h.h, `${h.from} → ${h.to}`, fmt(x.bA), fmt(x.bB), fmt(x.d), pTxt(x.pPerm), pTxt(x.pPar), pTxt(x.pW)] : null; }).filter(Boolean), align: ['l', 'l', 'r', 'r', 'r', 'r', 'r', 'r'],
      note: tl(`Δβ = β ${G.a} − β ${G.b}; ${fmtInt(G.P)} permutasi; uji parametrik dan Welch memakai galat baku bootstrap ${fmtInt(G.B)} subsampel per grup.`, `Δβ = β ${G.a} − β ${G.b}; ${fmtInt(G.P)} permutations; the parametric and Welch tests use bootstrap standard errors from ${fmtInt(G.B)} subsamples per group.`) });
  }
  if (IP) {
    head(2, tl('Importance-Performance Map', 'Importance-Performance Map'));
    T.ipma = ++tn; const mi = IP.rows.reduce((t, r) => t + r.imp, 0) / IP.rows.length, mp = IP.rows.reduce((t, r) => t + r.perf, 0) / IP.rows.length, pri = IP.rows.filter(r => r.imp >= mi && r.perf < mp).map(r => r.name), top = IP.rows.slice().sort((x, y) => y.imp - x.imp)[0];
    const fn = xfig('ipma', tl(`Importance-performance map untuk ${IP.targetName}`, `Importance-performance map for ${IP.targetName}`), tl('Garis putus-putus = rata-rata importance dan performance', 'Dashed lines = mean importance and performance'));
    p(tl(`IPMA dengan target ${IP.targetName} (performance ${fmt(IP.targetPerf, 1)}) menunjukkan bahwa ${top.name} memiliki importance terbesar (${fmt(top.imp)}): kenaikan performance ${top.name} sebesar satu poin meningkatkan performance ${IP.targetName} sebesar ${fmt(top.imp)} poin. ${pri.length ? `${andJoin(pri)} berada di kuadran prioritas perbaikan, yaitu importance di atas rata-rata dengan performance di bawah rata-rata.` : 'Tidak ada konstruk yang berada di kuadran prioritas perbaikan.'} Lihat ${tref(T.ipma)}${fn ? ` dan ${fref(fn)}` : ''}.`, `The IPMA for the target ${IP.targetName} (performance ${fmt(IP.targetPerf, 1)}) shows that ${top.name} has the largest importance (${fmt(top.imp)}): a one-point increase in the performance of ${top.name} raises the performance of ${IP.targetName} by ${fmt(top.imp)} points. ${pri.length ? `${andJoin(pri)} ${pri.length === 1 ? 'falls' : 'fall'} in the priority quadrant, with above-average importance and below-average performance.` : 'No construct falls in the priority quadrant.'} See ${tref(T.ipma)}${fn ? ` and ${fref(fn)}` : ''}.`));
    tbl({ num: T.ipma, title: tl(`IPMA untuk ${IP.targetName}`, `IPMA for ${IP.targetName}`), head: [tl('Konstruk', 'Construct'), 'Importance', 'Performance'], rows: IP.rows.slice().sort((x, y) => y.imp - x.imp).map(r => [r.name, fmt(r.imp), fmt(r.perf, 1)]), align: ['l', 'r', 'r'], note: tl('Importance = efek total tak terstandar; performance = skor rata-rata 0–100.', 'Importance = unstandardized total effect; performance = mean 0–100 score.') });
  }

  /* ---- V. discussion */
  head(1, tl('Pembahasan', 'Discussion'));
  const sinks = R.endo.filter(j => !R.spec.D[j].some(Boolean) && R.kind[j] !== 'int'), tj = IP ? R.lv.indexOf(IP.targetName) : sinks[sinks.length - 1];
  head(2, tl('Implikasi Teoretis', 'Theoretical Implications'));
  if (b) {
    const sD = hypRows.filter(x => !x.h.mod && x.s.P < alpha), nD = hypRows.filter(x => !x.h.mod && !(x.s.P < alpha)), pT = v => (v < 0.001 ? '< ' + fmt(0.001, 3) : '= ' + fmt(v, 3));
    if (sD.length) p(tl(`Temuan mendukung ${sD.length === 1 ? 'satu' : sD.length} hipotesis efek langsung: ${sD.map(x => `${x.h.from} berpengaruh ${x.s.O > 0 ? 'positif' : 'negatif'} terhadap ${x.h.to} (${x.h.h}; β = ${fmt(x.s.O)})`).join('; ')}.`, `The findings support ${numW(sD.length)} direct-effect hypothes${sD.length === 1 ? 'is' : 'es'}: ${sD.map(x => `${x.h.from} has a ${x.s.O > 0 ? 'positive' : 'negative'} effect on ${x.h.to} (${x.h.h}; β = ${fmt(x.s.O)})`).join('; ')}.`));
    if (sD.length) ph(tl('[Bandingkan temuan ini dengan penelitian terdahulu dan jelaskan mekanisme teoretis yang mendasarinya.]', '[Compare these findings with prior studies and explain the underlying theoretical mechanisms.]'));
    if (nD.length) { p(tl(`Sebaliknya, ${andJoin(nD.map(x => `${x.h.h} (${x.h.from} → ${x.h.to}; β = ${fmt(x.s.O)}, p ${pT(x.s.P)})`))} tidak didukung.`, `In contrast, ${andJoin(nD.map(x => `${x.h.h} (${x.h.from} → ${x.h.to}; β = ${fmt(x.s.O)}, p ${pT(x.s.P)})`))} ${nD.length === 1 ? 'was' : 'were'} not supported.`)); ph(tl('[Diskusikan kemungkinan penjelasan, misalnya karakteristik konteks, sampel, atau pengukuran.]', '[Discuss possible explanations, such as the characteristics of the context, the sample, or the measurement.]')); }
    const sc = b.chains.filter(c => c.s && c.s.P < alpha && c.key.every(i => R.kind[i] !== 'int')).sort((x, y) => Math.abs(y.s.O) - Math.abs(x.s.O));
    if (sc.length) p(tl(`Analisis mediasi menunjukkan ${sc.length} efek tidak langsung yang signifikan; yang terkuat adalah ${sc.slice(0, 2).map(c => `${c.key.map(i => R.lv[i]).join(' → ')} (β = ${fmt(c.s.O)})`).join(' dan ')}. Hal ini menunjukkan bahwa sebagian pengaruh disalurkan melalui konstruk perantara.`, `The mediation analysis reveals ${numW(sc.length)} significant indirect effect${sc.length > 1 ? 's' : ''}; the strongest ${sc.length > 1 ? 'are' : 'is'} ${sc.slice(0, 2).map(c => `${c.key.map(i => R.lv[i]).join(' → ')} (β = ${fmt(c.s.O)})`).join(' and ')}, showing that part of the influence is transmitted through intermediate constructs.`));
    mdI.forEach(d => { const sig = !!(d.s && d.s.P < alpha); p(tl(`${d.M} ${sig ? `memoderasi pengaruh ${d.X} terhadap ${d.Y}: efeknya ${d.b3 > 0 ? 'menguat' : 'melemah'} pada tingkat ${d.M} yang lebih tinggi` : `tidak memoderasi pengaruh ${d.X} terhadap ${d.Y}`} (${d.h.h}; β interaksi = ${fmt(d.b3)}).`, `${d.M} ${sig ? `moderates the effect of ${d.X} on ${d.Y}: the effect ${d.b3 > 0 ? 'strengthens' : 'weakens'} at higher levels of ${d.M}` : `does not moderate the effect of ${d.X} on ${d.Y}`} (${d.h.h}; interaction β = ${fmt(d.b3)}).`)); });
    if (G) { const dif = G.paths.filter(x => x.pPerm < G.alpha); p(dif.length ? tl(`Analisis multigrup menunjukkan bahwa ${dif.length} jalur berbeda antara ${G.a} dan ${G.b}, sehingga karakteristik grup perlu dipertimbangkan dalam menafsirkan model.`, `The multigroup analysis shows that ${numW(dif.length)} path${dif.length > 1 ? 's differ' : ' differs'} between ${G.a} and ${G.b}, so group characteristics should be considered when interpreting the model.`) : tl(`Analisis multigrup tidak menemukan perbedaan jalur yang signifikan antara ${G.a} dan ${G.b}, sehingga model berlaku serupa pada kedua grup.`, `The multigroup analysis found no significant path differences between ${G.a} and ${G.b}, so the model holds similarly in both groups.`)); }
  } else p(tl('Signifikansi hipotesis belum diuji karena bootstrapping tidak dijalankan.', 'The hypotheses were not tested for significance because bootstrapping was not performed.'));
  head(2, tl('Implikasi Praktis', 'Practical Implications'));
  if (tj !== undefined && tj >= 0) {
    const drv = R.lv.map((_, i) => i).filter(i => i !== tj && R.kind[i] !== 'int' && Number.isFinite(R.A.total[i][tj]) && Math.abs(R.A.total[i][tj]) > 1e-9).sort((x, y) => Math.abs(R.A.total[y][tj]) - Math.abs(R.A.total[x][tj])).slice(0, 2);
    const mi = IP ? IP.rows.reduce((t, r) => t + r.imp, 0) / IP.rows.length : 0, mp = IP ? IP.rows.reduce((t, r) => t + r.perf, 0) / IP.rows.length : 0, pri = IP ? IP.rows.filter(r => r.imp >= mi && r.perf < mp).map(r => r.name) : [];
    if (drv.length) p(tl(`Bagi praktisi, hasil ini menunjukkan bahwa ${andJoin(drv.map(i => `${cl(R.lv[i])} (efek total ${fmt(R.A.total[i][tj])})`))} merupakan pengungkit utama untuk meningkatkan ${cl(R.lv[tj])}.${pri.length ? ` IPMA mempertajam prioritas ini: ${andJoin(pri)} memiliki importance di atas rata-rata tetapi performance di bawah rata-rata, sehingga perbaikan di sana memberi dampak terbesar.` : ''}`, `For practitioners, the results identify ${andJoin(drv.map(i => `${cl(R.lv[i])} (total effect ${fmt(R.A.total[i][tj])})`))} as the main levers for improving ${cl(R.lv[tj])}.${pri.length ? ` The IPMA sharpens these priorities: ${andJoin(pri)} ${pri.length > 1 ? 'combine' : 'combines'} above-average importance with below-average performance, so improvements there promise the largest gains.` : ''}`));
  }
  ph(tl('[Terjemahkan temuan ini menjadi rekomendasi konkret bagi pengelola atau pembuat kebijakan dalam konteks penelitian.]', '[Translate these findings into concrete recommendations for managers or policymakers in the study context.]'));
  head(2, tl('Keterbatasan dan Penelitian Selanjutnya', 'Limitations and Future Research'));
  { const sim = R.source && R.source.sample && (() => { const T0 = TEMPLATES.find(t => t.sample === R.source.sample); return T0 && !T0.data.real; })(), r2t = tj !== undefined && tj >= 0 ? e.R2[tj] : NaN, lim = [];
    lim.push(tl('desain potong lintang membatasi penarikan kesimpulan kausal', 'the cross-sectional design limits causal inference'));
    lim.push(sim ? tl('data yang dianalisis merupakan data simulasi untuk demonstrasi', 'the data analyzed are simulated for demonstration') : tl(`sampel ${fmtInt(R.prep.n)} responden dari satu konteks membatasi generalisasi`, `the sample of ${fmtInt(R.prep.n)} respondents from a single context limits generalizability`));
    if (Number.isFinite(r2t) && r2t < 0.75) lim.push(tl(`model menyisakan ${fmt((1 - r2t) * 100, 1)}% varians ${R.lv[tj]} yang belum terjelaskan`, `the model leaves ${fmt((1 - r2t) * 100, 1)}% of the variance in ${R.lv[tj]} unexplained`));
    p(tl(`Penelitian ini memiliki beberapa keterbatasan: ${andJoin(lim)}. Penelitian selanjutnya dapat menggunakan desain longitudinal, sampel dari konteks yang lebih beragam, dan prediktor tambahan${G ? '' : ', serta menguji perbedaan antarkelompok dengan analisis multigrup'}.`, `This study has several limitations: ${andJoin(lim)}. Future research could use longitudinal designs, samples from more diverse contexts, and additional predictors${G ? '' : ', and test group differences with a multigroup analysis'}.`)); }
  ph(tl('[Tambahkan keterbatasan yang spesifik untuk penelitian ini.]', '[Add limitations specific to this study.]'));
  /* ---- VI. conclusion */
  head(1, tl('Kesimpulan', 'Conclusion'));
  if (b) { const sH = sup.filter(x => !x.h.mod).map(x => x.h.h), nH = ns.filter(x => !x.h.mod).map(x => x.h.h);
    p(tl(`${objT ? `Penelitian ini bertujuan untuk ${objT}. ` : ''}Hasil analisis PLS-SEM terhadap ${fmtInt(R.prep.n)} responden mendukung ${sH.length ? andJoin(sH) : 'tidak satu pun hipotesis efek langsung'}${nH.length ? `, sedangkan ${andJoin(nH)} tidak didukung` : ''}. ${r2Abs}${pp ? ` Model juga menunjukkan ${phr}.` : ''}`, `${objT ? `This study aimed to ${objT}. ` : ''}The PLS-SEM analysis of ${fmtInt(R.prep.n)} respondents supports ${sH.length ? andJoin(sH) : 'none of the direct-effect hypotheses'}${nH.length ? `, whereas ${andJoin(nH)} ${nH.length === 1 ? 'was' : 'were'} not supported` : ''}. ${r2Abs}${pp ? ` The model also shows ${phr}.` : ''}`)); }
  else p(r2Abs);
  ph(tl('[Tutup dengan kontribusi utama penelitian dalam satu atau dua kalimat.]', '[Close with the main contribution of the study in one or two sentences.]'));
  /* ---- back matter and appendix */
  B.push({ type: 'h1', text: tl('Ucapan Terima Kasih', 'Acknowledgment'), nonum: true });
  ph(tl('[Sebutkan pendanaan atau dukungan yang diterima, atau hapus bagian ini.]', '[Acknowledge funding or support received, or remove this section.]'));
  B.push({ type: 'h1', text: tl('Ketersediaan Data', 'Data Availability'), nonum: true });
  { const sk = R.source && R.source.sample, T0 = sk ? TEMPLATES.find(t => t.sample === sk) : null;
    p(T0 && T0.data.real ? tl(`Data yang digunakan tersedia secara publik ${cite(T0.data.ref)} dan didistribusikan bersama paket R seminr atau cSEM.`, `The data used are publicly available ${cite(T0.data.ref)} and distributed with the seminr or cSEM R packages.`) : T0 ? tl('Data simulasi yang digunakan tersedia bersama perangkat lunak SEMbada.', 'The simulated data used are available with the SEMbada software.') : tl('Data yang mendukung temuan penelitian ini tersedia dari penulis korespondensi atas permintaan yang wajar.', 'The data that support the findings of this study are available from the corresponding author upon reasonable request.')); }
  B.push({ type: 'h1', text: tl('Lampiran A. Rumus Estimasi dan Evaluasi', 'Appendix A. Estimation and Evaluation Formulas'), nonum: true });
  { const grp = (title, keys) => { if (!keys.length) return; B.push({ type: 'h2', text: title, nonum: true }); keys.forEach(([lab, k]) => { p(lab); eq(k); }); }, hasF = R.model.constructs.some(c => c.mode === 'formative');
    grp(tl('Algoritma PLS', 'PLS algorithm'), [[tl('Aproksimasi luar (skor konstruk):', 'Outer approximation (construct scores):'), 'outer'], [tl('Aproksimasi dalam:', 'Inner approximation:'), 'inner'], [tl('Bobot dalam skema path:', 'Inner weights of the path scheme:'), 'scheme'], [tl('Pembaruan bobot Mode A:', 'Mode A weight update:'), 'modeA']].concat(hasF ? [[tl('Pembaruan bobot Mode B:', 'Mode B weight update:'), 'modeB']] : [], [[tl('Kriteria konvergensi:', 'Convergence criterion:'), 'conv']]));
    grp(tl('Model pengukuran', 'Measurement model'), [["Cronbach's alpha:", 'alpha'], [tl('Reliabilitas komposit:', 'Composite reliability:'), 'rhoc'], ['Reliability coefficient ρA:', 'rhoa'], ['Average variance extracted:', 'ave'], ['Heterotrait-monotrait ratio:', 'htmt']]);
    grp(tl('Model struktural', 'Structural model'), [[tl('Variance inflation factor:', 'Variance inflation factor:'), 'vif'], [tl('Koefisien determinasi:', 'Coefficient of determination:'), 'r2'], [tl('Ukuran efek:', 'Effect size:'), 'f2'], [tl('Statistik t bootstrap:', 'Bootstrap t statistic:'), 'boot'], [tl('Interval kepercayaan persentil:', 'Percentile confidence interval:'), 'ci']].concat(b && b.chains.length ? [[tl('Efek tidak langsung:', 'Indirect effect:'), 'indirect']] : [], [['SRMR:', 'srmr'], [tl('Ukuran sampel minimum (inverse square root):', 'Minimum sample size (inverse square root):'), 'nmin']]));
    grp(tl('Prediksi dan analisis lanjutan', 'Prediction and advanced analyses'), [].concat(P ? [['Q²predict:', 'q2'], ['RMSE:', 'rmse']] : [], hcI.some(H => H.refl) ? [[tl('Konstruk orde tinggi reflektif (tahap 2):', 'Reflective higher-order construct (stage 2):'), 'hoc']] : [], mdI.length ? [[tl('Term interaksi dua tahap:', 'Two-stage interaction term:'), 'inter'], ['Simple slope:', 'slope']] : [], G ? [[tl('MICOM langkah 2:', 'MICOM step 2:'), 'micom'], [tl('Nilai p permutasi:', 'Permutation p value:'), 'mgaperm']] : [], IP ? [[tl('Bobot tak terstandar yang dinormalkan:', 'Normalized unstandardized weights:'), 'ipmaw'], ['IPMA performance:', 'ipmap'], ['IPMA importance:', 'ipmai']] : [])); }
  const au = infoAuthors(), authors = au.length ? au.map(a => ({ name: String(a.name).trim(), lines: [[a.dept, a.inst].map(x => String(x || '').trim()).filter(Boolean).join(', '), String(a.city || '').trim()].filter(Boolean), email: String(a.email || '').trim() })) : [{ name: tl('Nama Penulis', 'Author Name'), lines: [tl('Departemen, Institusi', 'Department, Institution'), tl('Kota, Negara', 'City, Country')], email: tl('email@contoh.ac.id', 'email@example.com') }];
  return { title: infoTitleFor(R), authors, abstract, keywords, blocks: B, refs: order.map(k => REF[k].p) };
}

/* ---- in-app section and clipboard */
function paperTm(bk) { return { id: 'paper-t' + bk.num, title: `${tl('TABEL', 'TABLE')} ${ROMAN(bk.num)}. ${bk.title}`, head: bk.head, rows: bk.rows.map(r => r.map((c, i) => (bk.align[i] === 'r' ? Tc(c, null, { num: true }) : Tc(c)))), note: bk.note ? esc(bk.note) : '' }; }
function paperFigSVG(R, show, standalone) { return diagramSVG(R.model, { idp: (standalone ? 'pf' : 'pp') + show, values: show === 'hyp' ? null : diagramValues(R, show), show, alpha: R.boot ? R.boot.alpha : 0.05, standalone, style: dgStyle() }); }
const refHTML = parts => parts.map(([t, it]) => (it ? `<i>${esc(t)}</i>` : esc(t))).join('');
function paperHTML(R) {
  const P = paperModel(R), out = [`<div class="callout"><p>${tl('Draf makalah format konferensi dua kolom: bagian Metode dan Hasil ditulis otomatis mengikuti pedoman pelaporan Hair dkk. (2019) dengan sitasi bernomor. Judul, penulis, tujuan penelitian, pendahuluan, dan pembahasan masih berupa isian dalam kurung siku untuk Anda lengkapi.', 'A two-column conference-paper draft: the Method and Results sections are written automatically following the reporting guidelines of Hair et al. (2019), with numbered citations. The title, authors, research objective, introduction, and discussion are bracketed placeholders for you to complete.')}</p></div>`];
  if (!STATIC) out.push(`<div class="row" style="gap:8px;margin-bottom:22px;align-items:center"><button class="btn" data-action="copy-paper">${tl('Salin semua teks', 'Copy all text')}</button><button class="btn btn-primary" data-action="export-paper-pdf">${tl('Unduh PDF', 'Download PDF')}</button><button class="btn" data-action="export-paper">${tl('Word (.docx)', 'Word (.docx)')}</button><button class="btn" data-action="export-paper-tex">${tl('LaTeX (.zip)', 'LaTeX (.zip)')}</button><span class="small muted">${tl('Bahasa dokumen mengikuti pengaturan bahasa ekspor.', 'The document language follows the export language setting.')}</span></div>`);
  out.push(`<div class="paper"><p class="paper-title">${esc(P.title)}</p><div class="paper-auths">${P.authors.map(a => `<p class="paper-auth">${[`<b>${esc(a.name)}</b>`].concat(a.lines.map(esc), a.email ? [esc(a.email)] : []).join('<br>')}</p>`).join('')}</div><p class="paper-abs"><b><i>${tl('Abstrak', 'Abstract')}</i>—${esc(P.abstract)}</b></p><p class="paper-abs"><b><i>${tl('Kata kunci', 'Keywords')}—${esc(P.keywords)}</i></b></p>`);
  let h1 = 0, h2 = 0;
  P.blocks.forEach(bk => {
    if (bk.type === 'h1') { if (bk.nonum) out.push(`<h3 class="paper-h1">${esc(bk.text)}</h3>`); else { h1++; h2 = 0; out.push(`<h3 class="paper-h1">${ROMAN(h1)}. ${esc(bk.text)}</h3>`); } }
    else if (bk.type === 'h2') { if (bk.nonum) out.push(`<h4 class="paper-h2">${esc(bk.text)}</h4>`); else { h2++; out.push(`<h4 class="paper-h2">${String.fromCharCode(64 + h2)}. ${esc(bk.text)}</h4>`); } }
    else if (bk.type === 'p') out.push(`<p>${esc(bk.text)}</p>`);
    else if (bk.type === 'ph') out.push(`<p class="paper-ph">${esc(bk.text)}</p>`);
    else if (bk.type === 'table') out.push(tableHTML(paperTm(bk)));
    else if (bk.type === 'eq') { const v = eqv(bk.key); out.push(`<div class="paper-eq"><img src="${eqDataURL(v)}" alt="(${bk.num})" style="height:${(v.h * 1.25).toFixed(1)}px"><span>(${bk.num})</span></div>`); }
    else if (bk.type === 'hyp') out.push(`<p class="paper-hyp"><b>${esc(bk.label)}:</b> ${esc(bk.text)}</p>`);
    else if (bk.type === 'figure') out.push(`<div class="figure" style="margin:8px 0 6px">${bk.svg ? bk.svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ') : paperFigSVG(R, bk.show, false)}</div><p class="tbl-note">${esc(figCaption(bk))}</p>`);
  });
  out.push(`<h3 class="paper-h1">${tl('Daftar Pustaka', 'References')}</h3><ol class="refs paper-refs">${P.refs.map(r => `<li>${refHTML(r)}</li>`).join('')}</ol></div>`);
  return out.join('');
}
function paperClipboard(R) {
  const P = paperModel(R), html = [`<h1>${esc(P.title)}</h1><p>${P.authors.map(a => [a.name].concat(a.lines, a.email ? [a.email] : []).map(esc).join('<br>')).join('<br><br>')}</p><p><b><i>${tl('Abstrak', 'Abstract')}</i>—${esc(P.abstract)}</b></p><p><b><i>${tl('Kata kunci', 'Keywords')}—${esc(P.keywords)}</i></b></p>`], txt = [P.title, P.authors.join('\n'), `${tl('Abstrak', 'Abstract')}—${P.abstract}`, `${tl('Kata kunci', 'Keywords')}—${P.keywords}`];
  let h1 = 0, h2 = 0;
  P.blocks.forEach(bk => {
    if (bk.type === 'h1') { const t = bk.nonum ? bk.text : (h1++, h2 = 0, `${ROMAN(h1)}. ${bk.text}`); html.push(`<h2>${esc(t)}</h2>`); txt.push(t); }
    else if (bk.type === 'h2') { const t = bk.nonum ? bk.text : (h2++, `${String.fromCharCode(64 + h2)}. ${bk.text}`); html.push(`<h3>${esc(t)}</h3>`); txt.push(t); }
    else if (bk.type === 'p' || bk.type === 'ph') { html.push(`<p>${esc(bk.text)}</p>`); txt.push(bk.text); }
    else if (bk.type === 'eq') { const t = `(${bk.num})  ${eqv(bk.key).tex}`; html.push(`<p style="text-align:center"><img src="${eqDataURL(eqv(bk.key))}" alt="${esc(eqv(bk.key).tex)}"> (${bk.num})</p>`); txt.push(t); }
    else if (bk.type === 'hyp') { html.push(`<p><b>${esc(bk.label)}:</b> ${esc(bk.text)}</p>`); txt.push(`${bk.label}: ${bk.text}`); }
    else if (bk.type === 'table') { const tm = paperTm(bk); html.push(`<p style="text-align:center">${esc(tm.title)}</p>${tableSimpleHTML(tm)}${bk.note ? `<p><small>${esc(bk.note)}</small></p>` : ''}`); txt.push(`${tm.title}\n${tableTSV(tm)}${bk.note ? '\n' + bk.note : ''}`); }
    else if (bk.type === 'figure') { const t = `[${figCaption(bk)}]`; html.push(`<p>${esc(t)}</p>`); txt.push(t); }
  });
  html.push(`<h2>${tl('Daftar Pustaka', 'References')}</h2>${P.refs.map((r, i) => `<p>[${i + 1}] ${refHTML(r)}</p>`).join('')}`); txt.push(tl('Daftar Pustaka', 'References'), P.refs.map((r, i) => `[${i + 1}] ${refText(r)}`).join('\n'));
  return { html: html.join(''), text: txt.join('\n\n') };
}

/* ---- Word export: conference layout (A4, title block in one column, body in two columns) */
function confTable(D, bk, widthTw) {
  const numeric = bk.align.map(a => a === 'r'), cw = fitWidths(colNeeds(bk.head, bk.rows), numeric, widthTw, 16, 154), AL = D.AlignmentType;
  const line = { style: D.BorderStyle.SINGLE, size: 4, color: '000000' };
  const keep = bk.rows.length <= 30; // keep short tables on one page: every row but the last stays with the next
  const cell = (t, i, header, last) => new D.TableCell({ width: { size: cw[i], type: D.WidthType.DXA }, margins: { top: 20, bottom: 20, left: 57, right: 57 }, verticalAlign: D.VerticalAlign.CENTER,
    children: [new D.Paragraph({ style: header ? 'tablecolhead' : 'tablecopy', alignment: header || numeric[i] ? AL.CENTER : AL.LEFT, keepNext: keep && !last, children: [new D.TextRun({ text: String(t) })] })] });
  return new D.Table({ width: { size: cw.reduce((a, c) => a + c, 0), type: D.WidthType.DXA }, columnWidths: cw, alignment: AL.CENTER, borders: { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line },
    rows: [new D.TableRow({ tableHeader: true, cantSplit: true, children: bk.head.map((h, i) => cell(h, i, true, false)) })].concat(bk.rows.map((r, ri) => new D.TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri === bk.rows.length - 1)) }))) });
}
function buildPaperDoc(D, R, P, figs, eqs) {
  const TNR = 'Times New Roman', AL = D.AlignmentType, run = (t, o) => new D.TextRun(Object.assign({ text: String(t) }, o || {})), secs = [];
  let cur = null;
  const open = cols => { cur = { cols, children: [] }; secs.push(cur); };
  const narrow = x => { if (cur.cols !== 2) open(2); cur.children.push(x); };
  const wide = x => { if (cur.cols !== 1 || cur.title) open(1); cur.children.push(x); };
  open(1); cur.title = true;
  cur.children.push(new D.Paragraph({ style: 'papertitle', children: [run(P.title)] }));
  const auL = []; P.authors.forEach((a, ai) => { auL.push({ t: a.name, o: {}, gap: ai ? 200 : 360 }); a.lines.forEach(t => auL.push({ t, o: { size: 18, italics: true } })); if (a.email) auL.push({ t: a.email, o: { size: 18 } }); });
  auL.forEach((l, i) => cur.children.push(new D.Paragraph({ style: 'Author', spacing: { before: l.gap || 0, after: i === auL.length - 1 ? 360 : 0 }, children: [run(l.t, l.o)] })));
  narrow(new D.Paragraph({ style: 'Abstract', children: [run(tl('Abstrak', 'Abstract'), { italics: true }), run('—' + P.abstract)] }));
  narrow(new D.Paragraph({ style: 'Keywords', children: [run(`${tl('Kata kunci', 'Keywords')}—${P.keywords}`)] }));
  P.blocks.forEach(bk => {
    if (bk.type === 'h1') narrow(new D.Paragraph(Object.assign({ heading: D.HeadingLevel.HEADING_1, children: [run(bk.text)] }, bk.nonum ? {} : { numbering: { reference: 'heads', level: 0 } })));
    else if (bk.type === 'h2') narrow(new D.Paragraph(Object.assign({ heading: D.HeadingLevel.HEADING_2, children: [run(bk.text)] }, bk.nonum ? {} : { numbering: { reference: 'heads', level: 1 } })));
    else if (bk.type === 'p') narrow(new D.Paragraph({ style: 'BodyText', children: [run(bk.text)] }));
    else if (bk.type === 'ph') narrow(new D.Paragraph({ style: 'BodyText', children: [run(bk.text, { italics: true, color: '5C4A00', highlight: 'yellow' })] }));
    else if (bk.type === 'hyp') narrow(new D.Paragraph({ style: 'BodyText', indent: { left: 288, firstLine: 0 }, children: [run(bk.label + ': ', { bold: true }), run(bk.text)] }));
    else if (bk.type === 'eq' && eqs[bk.key]) {
      const q = eqs[bk.key], k = Math.min(1, 290 / (q.w * 1.12)), w = Math.round(q.w * 1.12 * k), h = Math.round(q.h * 1.12 * k);
      narrow(new D.Paragraph({ tabStops: [{ type: D.TabStopType.CENTER, position: Math.round(COL_W / 2) }, { type: D.TabStopType.RIGHT, position: COL_W }], spacing: { before: 80, after: 80 }, children: [new D.TextRun({ children: [new D.Tab()] }), new D.ImageRun({ type: 'png', data: q.png, transformation: { width: w, height: h }, altText: { title: `(${bk.num})`, description: eqv(bk.key).tex, name: 'equation-' + bk.num } }), new D.TextRun({ children: [new D.Tab(), `(${bk.num})`] })] }));
    }
    else if (bk.type === 'table') {
      const put = bk.wide ? wide : narrow;
      put(new D.Paragraph({ style: 'tablehead', children: [run(`${tl('TABEL', 'TABLE')} ${ROMAN(bk.num)}. `), run(bk.title)] }));
      put(confTable(D, bk, bk.wide ? FULL_W : COL_W));
      put(new D.Paragraph({ style: 'tablefootnote', children: [run(bk.note || '')] }));
    } else if (bk.type === 'figure' && figs[bk.fkey]) {
      const fig = figs[bk.fkey];
      let w = 640, h = Math.round(640 * fig.h / fig.w); if (h > 760) { w = Math.round(w * 760 / h); h = 760; }
      wide(new D.Paragraph({ alignment: AL.CENTER, spacing: { before: 120, after: 0, line: 240, lineRule: 'auto' }, children: [new D.ImageRun({ type: 'png', data: fig.png, transformation: { width: w, height: h }, altText: { title: bk.title, description: bk.note, name: 'figure-' + bk.num } })] }));
      wide(new D.Paragraph({ style: 'figurecaption', children: [run(`${tl('Gambar', 'Fig.')} ${bk.num}. `), run(`${bk.title}. ${bk.note}`)] }));
    }
  });
  narrow(new D.Paragraph({ heading: D.HeadingLevel.HEADING_5, children: [run(tl('Daftar Pustaka', 'References'))] }));
  P.refs.forEach(parts => narrow(new D.Paragraph({ style: 'references', numbering: { reference: 'refs', level: 0 }, children: parts.map(([t, it]) => run(t, it ? { italics: true } : {})) })));
  const margin = { top: 1080, right: PG_SIDE, bottom: 1440, left: PG_SIDE, header: 720, footer: 720 }, size = { width: PG_W, height: 16838 };
  return new D.Document({
    creator: 'SEMbada', title: R.name, description: tl('Draf makalah dari SEMbada', 'Paper draft from SEMbada'),
    numbering: { config: [
      { reference: 'heads', levels: [{ level: 0, format: D.LevelFormat.UPPER_ROMAN, text: '%1.', alignment: AL.CENTER, suffix: D.LevelSuffix.SPACE, style: { paragraph: { indent: { left: 0, hanging: 0 } } } }, { level: 1, format: D.LevelFormat.UPPER_LETTER, text: '%2.', alignment: AL.LEFT, suffix: D.LevelSuffix.SPACE, style: { paragraph: { indent: { left: 0, hanging: 0 } } } }] },
      { reference: 'refs', levels: [{ level: 0, format: D.LevelFormat.DECIMAL, text: '[%1]', alignment: AL.LEFT, suffix: D.LevelSuffix.TAB, style: { paragraph: { indent: { left: 360, hanging: 360 } } } }] }
    ] },
    styles: {
      default: {
        document: { run: { font: TNR, size: 20 }, paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' } } },
        heading1: { run: { font: TNR, size: 20, smallCaps: true, bold: false, italics: false, color: '000000' }, paragraph: { alignment: AL.CENTER, spacing: { before: 160, after: 80 }, keepNext: true } },
        heading2: { run: { font: TNR, size: 20, italics: true, bold: false, color: '000000' }, paragraph: { alignment: AL.LEFT, spacing: { before: 120, after: 60 }, keepNext: true } },
        heading5: { run: { font: TNR, size: 20, smallCaps: true, bold: false, italics: false, color: '000000' }, paragraph: { alignment: AL.CENTER, spacing: { before: 160, after: 80 }, keepNext: true } }
      },
      paragraphStyles: [
        { id: 'papertitle', name: 'paper title', basedOn: 'Normal', next: 'Author', run: { font: TNR, size: 48 }, paragraph: { alignment: AL.CENTER, spacing: { before: 0, after: 120 } } },
        { id: 'Author', name: 'Author', basedOn: 'Normal', next: 'Author', run: { font: TNR, size: 22 }, paragraph: { alignment: AL.CENTER, spacing: { before: 0, after: 0 } } },
        { id: 'Abstract', name: 'Abstract', basedOn: 'Normal', next: 'Keywords', run: { font: TNR, size: 18, bold: true }, paragraph: { alignment: AL.JUSTIFIED, indent: { firstLine: 272 }, spacing: { before: 0, after: 200 } } },
        { id: 'Keywords', name: 'Keywords', basedOn: 'Abstract', next: 'BodyText', run: { font: TNR, size: 18, bold: true, italics: true }, paragraph: { alignment: AL.JUSTIFIED, indent: { firstLine: 274 }, spacing: { before: 0, after: 120 } } },
        { id: 'BodyText', name: 'Body Text', basedOn: 'Normal', next: 'BodyText', run: { font: TNR, size: 20 }, paragraph: { alignment: AL.JUSTIFIED, indent: { firstLine: 288 }, spacing: { before: 0, after: 120, line: 228, lineRule: 'auto' } } },
        { id: 'tablehead', name: 'table head', basedOn: 'Normal', next: 'Normal', run: { font: TNR, size: 16, smallCaps: true }, paragraph: { alignment: AL.CENTER, keepNext: true, spacing: { before: 240, after: 120 } } },
        { id: 'tablecolhead', name: 'table col head', basedOn: 'Normal', run: { font: TNR, size: 16, bold: true }, paragraph: { alignment: AL.CENTER } },
        { id: 'tablecopy', name: 'table copy', basedOn: 'Normal', run: { font: TNR, size: 16 } },
        { id: 'tablefootnote', name: 'table footnote', basedOn: 'Normal', next: 'BodyText', run: { font: TNR, size: 14 }, paragraph: { alignment: AL.JUSTIFIED, spacing: { before: 60, after: 200 } } },
        { id: 'figurecaption', name: 'figure caption', basedOn: 'Normal', next: 'BodyText', run: { font: TNR, size: 16 }, paragraph: { alignment: AL.JUSTIFIED, spacing: { before: 80, after: 240 } } },
        { id: 'references', name: 'references', basedOn: 'Normal', next: 'references', run: { font: TNR, size: 16 }, paragraph: { alignment: AL.JUSTIFIED, spacing: { before: 0, after: 50, line: 180, lineRule: 'exact' } } }
      ]
    },
    sections: secs.map((s, i) => ({ properties: Object.assign({ page: { size, margin: i ? margin : Object.assign({}, margin, { top: 540 }) }, column: s.cols === 2 ? { count: 2, space: PG_GAP, equalWidth: true } : { count: 1, space: 720 } }, i ? { type: D.SectionType.CONTINUOUS } : {}), children: s.children }))
  });
}

/* ---- LaTeX export: standard article class reproducing the same two-column layout */
const TEX_SUP = { '⁰': '0', '¹': '1', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
const texEsc = s => String(s).replace(/\\/g, '\\textbackslash{}').replace(/([&%$#_{}])/g, '\\$1').replace(/~/g, '\\textasciitilde{}').replace(/\^/g, '\\textasciicircum{}')
  .replace(/(\d+)([⁻⁰¹⁴⁵⁶⁷⁸⁹]+)/g, (m, a, s2) => `$${a}^{${s2.split('').map(c => TEX_SUP[c]).join('')}}$`).replace(/—/g, '---');
function texTable(bk) {
  const env = bk.wide ? 'table*' : 'table', box = bk.wide ? '\\textwidth' : '\\columnwidth', spec = '|' + bk.align.map(a => (a === 'r' ? 'c' : 'l')).join('|') + '|';
  const hcell = (h, i) => { const t = texEsc(h); return `\\textbf{${bk.align[i] === 'r' && /\s/.test(h) ? `\\shortstack{${t.split(/\s+/).join('\\\\')}}` : t}}`; };
  return [`\\begin{${env}}[!t]`, '\\centering', `\\caption{${texEsc(bk.title)}}`, '\\footnotesize', `\\begin{adjustbox}{max width=${box}}`, `\\begin{tabular}{${spec}}`, '\\hline', bk.head.map(hcell).join(' & ') + ' \\\\', '\\hline']
    .concat(bk.rows.map(r => r.map(c => texEsc(c)).join(' & ') + ' \\\\ \\hline'), ['\\end{tabular}', '\\end{adjustbox}', bk.note ? `\\par\\smallskip\\parbox{${box}}{\\scriptsize ${texEsc(bk.note)}}` : '', `\\end{${env}}`, '']).join('\n');
}
function buildPaperTex(R, P) {
  const uni = [['0394', '\\Delta'], ['03A3', '\\Sigma'], ['03BC', '\\mu'], ['03B3', '\\gamma'], ['03B8', '\\theta'], ['03C4', '\\tau'], ['03C6', '\\phi'], ['03C7', '\\chi'], ['03C9', '\\omega'], ['03C0', '\\pi'], ['00B1', '\\pm'], ['2248', '\\approx'], ['2260', '\\neq'], ['221A', '\\surd'], ['03B1', '\\alpha'], ['03B2', '\\beta'], ['03C1', '\\rho'], ['2192', '\\rightarrow'], ['00B2', '^{2}'], ['00B3', '^{3}'], ['2265', '\\geq'], ['2264', '\\leq'], ['00D7', '\\times'], ['2212', '-'], ['207B', '^{-}'], ['03BB', '\\lambda'], ['03BE', '\\xi'], ['03B5', '\\varepsilon'], ['03B7', '\\eta'], ['03B6', '\\zeta'], ['03C3', '\\sigma'], ['03B4', '\\delta']], txt = [['2003', '\\quad{}']];
  const L = [`% ${tl('Draf makalah dari', 'Paper draft generated by')} SEMbada ${APP_VERSION}. ${tl('Kompilasi dengan pdfLaTeX.', 'Compile with pdfLaTeX.')}`,
    '\\documentclass[10pt,a4paper,twocolumn]{article}', '\\usepackage[T1]{fontenc}', '\\usepackage[utf8]{inputenc}', '\\usepackage{textcomp}', '\\usepackage{mathptmx}',
    '\\usepackage[a4paper,top=19mm,bottom=25.4mm,left=16mm,right=16mm,columnsep=6.35mm]{geometry}', '\\usepackage{amsmath}', '\\usepackage{graphicx}', '\\usepackage{array}', '\\usepackage{adjustbox}', '\\usepackage{caption}', '\\usepackage{titlesec}']
    .concat(uni.map(([c, m]) => `\\DeclareUnicodeCharacter{${c}}{\\ensuremath{${m}}}`), txt.map(([c, m]) => `\\DeclareUnicodeCharacter{${c}}{${m}}`), [
      '\\renewcommand{\\thesection}{\\Roman{section}}', '\\renewcommand{\\thesubsection}{\\Alph{subsection}}',
      '\\titleformat{\\section}{\\normalfont\\normalsize\\scshape\\centering}{\\thesection.}{0.5em}{}', '\\titlespacing*{\\section}{0pt}{8pt}{4pt}',
      '\\titleformat{\\subsection}{\\normalfont\\normalsize\\itshape}{\\thesubsection.}{0.5em}{}', '\\titlespacing*{\\subsection}{0pt}{6pt}{3pt}',
      '\\renewcommand{\\thetable}{\\Roman{table}}', '\\usepackage{xcolor}', '\\definecolor{phcol}{HTML}{A23A12}',
      `\\captionsetup[table]{name=${tl('TABEL', 'TABLE')},labelsep=period,justification=centering,font={footnotesize,sc},skip=4pt}`,
      `\\captionsetup[figure]{name=${tl('Gambar', 'Fig.')},labelsep=period,justification=justified,singlelinecheck=false,font=footnotesize,skip=4pt}`,
      `\\renewcommand{\\refname}{${tl('Daftar Pustaka', 'References')}}`, '\\setlength{\\parindent}{14.4pt}', '\\pagestyle{empty}', '', '\\begin{document}', '',
      '\\twocolumn[{%', '\\centering', `{\\fontsize{24}{28}\\selectfont ${texEsc(P.title)}\\par}`, '\\vspace{14pt}', texAuthors(P.authors), '\\vspace{18pt}', '}]', '',
      `\\noindent{\\small\\bfseries\\textit{${tl('Abstrak', 'Abstract')}}---${texEsc(P.abstract)}\\par}`, '\\vspace{6pt}',
      `\\noindent{\\small\\bfseries\\itshape ${tl('Kata kunci', 'Keywords')}---${texEsc(P.keywords)}\\par}`, '']);
  P.blocks.forEach(bk => {
    if (bk.type === 'h1') L.push(bk.nonum ? `\\section*{${texEsc(bk.text)}}` : `\\section{${texEsc(bk.text)}}`);
    else if (bk.type === 'h2') L.push(bk.nonum ? `\\subsection*{${texEsc(bk.text)}}` : `\\subsection{${texEsc(bk.text)}}`);
    else if (bk.type === 'p') L.push(texEsc(bk.text), '');
    else if (bk.type === 'ph') L.push(`{\\color{phcol}\\textit{${texEsc(bk.text)}}}`, '');
    else if (bk.type === 'hyp') L.push(`\\noindent\\hspace*{1em}\\textbf{${texEsc(bk.label)}}: ${texEsc(bk.text)}\\par`, '');
    else if (bk.type === 'eq') L.push('\\begin{equation}', `\\adjustbox{max width=\\columnwidth}{$\\displaystyle ${eqv(bk.key).tex}$}`, '\\end{equation}', '');
    else if (bk.type === 'table') L.push(texTable(bk));
    else if (bk.type === 'figure' && bk.col) L.push('\\begin{figure}[!t]', '\\centering', `\\includegraphics[width=\\columnwidth]{${bk.file}}`, `\\caption{${texEsc(bk.title)}. ${texEsc(bk.note)}}`, '\\end{figure}', '');
    else if (bk.type === 'figure') L.push('\\begin{figure*}[!t]', '\\centering', `\\includegraphics[width=${bk.fkey === 'concept' ? '0.8' : '0.92'}\\textwidth]{${bk.file}}`, `\\caption{${texEsc(bk.title)}. ${texEsc(bk.note)}}`, '\\end{figure*}', '');
  });
  L.push('\\begin{thebibliography}{00}', '\\footnotesize');
  P.refs.forEach((parts, i) => L.push(`\\bibitem{r${i + 1}} ` + parts.map(([t, it]) => (it ? `\\textit{${texEsc(t)}}` : texEsc(t))).join('')));
  L.push('\\end{thebibliography}', '', '\\end{document}', '');
  return L.join('\n');
}

/* ---- exports */
async function paperFigures(R, L, scale) {
  const mk = show => withLang(L, () => { const svg = paperFigSVG(R, show, true), m = svg.match(/width="([\d.]+)" height="([\d.]+)"/); return { svg, w: +m[1], h: +m[2] }; });
  const out = { concept: mk('hyp'), est: mk(dgMainShow(R)) };
  withLang(L, () => extFigures(R).concat(vizSpecs(R).filter(f => ['v-htmt', 'v-ridge', 'v-effects'].includes(f.key)))).forEach(f => { out[f.key] = { svg: f.svg, w: f.w, h: f.h }; });
  for (const k of Object.keys(out)) out[k].png = (await svgToPng(out[k].svg, scale)).bytes;
  return out;
}
const paperAssets = (figs, P) => P.blocks.filter(bk => bk.type === 'figure' && figs[bk.fkey]).map(bk => ({ name: bk.file, data: figs[bk.fkey].png }));
const texAuthors = A => A.map(a => `\\begin{tabular}[t]{c}{\\fontsize{11}{13}\\selectfont ${texEsc(a.name)}}${a.lines.map(t => `\\\\ {\\small\\itshape ${texEsc(t)}}`).join('')}${a.email ? `\\\\ {\\small ${texEsc(a.email)}}` : ''}\\end{tabular}`).reduce((t, x, i) => t + (i ? (i % 3 ? '\\hspace{1.6em}' : '\\\\[10pt]') : '') + x, '') + '\\par';
const extKeywords = R => [].concat(R.ext && R.ext.mods.length ? [tl('moderasi', 'moderation')] : [], R.ext && R.ext.hocs.length ? [tl('konstruk orde tinggi', 'higher-order construct')] : [], R.mga && !R.mga.error ? [tl('analisis multigrup', 'multigroup analysis')] : [], R.ipma && R.ipma.rows && R.ipma.rows.length ? ['IPMA'] : []);
async function exportPaperDocx() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun makalah Word…', 'Building the Word paper…'), async () => {
    const D = loadLib('lib-docx', 'docx'), L = exportLang(), figs = await paperFigures(R, L, 2), P = withLang(L, () => paperModel(R));
    const eqs = await eqPngs(P.blocks.filter(x => x.type === 'eq').map(x => x.key), L, 4);
    const blob = await D.Packer.toBlob(withLang(L, () => buildPaperDoc(D, R, P, figs, eqs)));
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_paper.docx' : '_makalah.docx'), blob);
    if (ok && !NATIVE) toast(tl('Makalah Word diunduh.', 'Word paper downloaded.'), 'ok');
  });
}
async function exportPaperTex() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun makalah LaTeX…', 'Building the LaTeX paper…'), async () => {
    const L = exportLang(), figs = await paperFigures(R, L, 3), P = withLang(L, () => paperModel(R)), tex = withLang(L, () => buildPaperTex(R, P));
    const readme = withLang(L, () => tl('Kompilasi paper.tex dengan pdfLaTeX, misalnya di Overleaf (New Project > Upload Project > pilih file zip ini). Simpan fig1.png dan fig2.png di folder yang sama. Nama penulis, afiliasi, tujuan penelitian, pendahuluan, landasan teori konstruk, dan pembahasan masih berupa isian dalam kurung siku.\r\n', 'Compile paper.tex with pdfLaTeX, for example on Overleaf (New Project > Upload Project > choose this zip file). Keep fig1.png and fig2.png in the same folder. Author names, affiliations, the research objective, the introduction, the construct theory, and the discussion are bracketed placeholders to complete.\r\n'));
    const zip = IO.zipStore([{ name: 'paper.tex', data: tex }].concat(paperAssets(figs, P), [{ name: L === 'en' ? 'README.txt' : 'BACA.txt', data: readme }]));
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_paper_latex.zip' : '_makalah_latex.zip'), new Blob([zip], { type: 'application/zip' }));
    if (ok && !NATIVE) toast(tl('Makalah LaTeX diunduh.', 'LaTeX paper downloaded.'), 'ok');
  });
}
async function exportPaperPdf() {
  const R = state.results; if (!R) return;
  await withBusy(tl('Menyusun PDF makalah dengan LaTeX… (pertama kali sekitar 10 detik)', 'Typesetting the paper PDF with LaTeX… (about 10 seconds the first time)'), async () => {
    const L = exportLang(), figs = await paperFigures(R, L, 3), P = withLang(L, () => paperModel(R)), tex = withLang(L, () => buildPaperTex(R, P));
    const out = await texCompile(tex, paperAssets(figs, P));
    const ok = await download(safeFile(state.name) + (L === 'en' ? '_paper.pdf' : '_makalah.pdf'), new Blob([out.pdf], { type: 'application/pdf' }));
    if (ok && !NATIVE) toast(tl('PDF makalah diunduh.', 'Paper PDF downloaded.'), 'ok');
  });
}
SECTIONS.splice(2, 0, { id: 'paper', group: () => tl('Ikhtisar', 'Overview'), title: () => tl('Narasi paper', 'Paper narrative'), short: () => tl('Narasi paper', 'Paper narrative'), need: () => !(STATIC && paperLocked()), render: R => (paperLocked() ? paperLockedHTML() : paperHTML(R)), tables: () => [] });


/* ---- temporary password lock for the paper (PDF, Word, LaTeX, copy, narrative view, and the paper section of the HTML report).
   A client-side gate only: the code keeps a salted SHA-256 digest, never the password itself. Set digest to '' to lift the lock. */
const PAPER_LOCK = { salt: 'sembada-paper-lock-v1:', digest: '9a9c9bc6dad62492675891819f29ce2008b3b355f86e29757d517ff514cdaf5c' };
let paperOpen = false;
try { paperOpen = sessionStorage.getItem('sembada-paper') === PAPER_LOCK.digest.slice(0, 24); } catch (e) { /* storage unavailable */ }
const paperLocked = () => !!PAPER_LOCK.digest && !paperOpen;
const LOCK_ICON = '<svg class="lock-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Zm3 4a2 2 0 0 1 1 3.73V19h-2v-1.27A2 2 0 0 1 12 14Z"/></svg>';
function sha256hex(str) {
  const bytes = Array.from(new TextEncoder().encode(str)), K = [], H = [], w = new Array(64);
  for (let n = 2, c = 0; c < 64; n++) {
    let prime = true; for (let i = 2; i * i <= n; i++) if (n % i === 0) { prime = false; break; }
    if (prime) { if (c < 8) H[c] = (Math.pow(n, 1 / 2) % 1) * 4294967296 | 0; K[c++] = (Math.pow(n, 1 / 3) % 1) * 4294967296 | 0; }
  }
  const bitLen = bytes.length * 8; bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 255);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = (bytes[off + 4 * i] << 24) | (bytes[off + 4 * i + 1] << 16) | (bytes[off + 4 * i + 2] << 8) | bytes[off + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
function askPaperPassword() {
  return new Promise(res => {
    const d = document.createElement('dialog'); d.className = 'choice-dlg lock-dlg';
    d.innerHTML = `<form method="dialog"><h3>${LOCK_ICON}${esc(tl('Makalah terkunci sementara', 'The paper is temporarily locked'))}</h3><div class="choice-b"><p>${esc(tl('Ekspor hasil dalam bentuk makalah (PDF, Word, LaTeX) untuk sementara dikunci. Masukkan kata sandi untuk membukanya selama sesi ini.', 'Exporting the results as a paper (PDF, Word, LaTeX) is locked for now. Enter the password to unlock it for this session.'))}</p><label class="lock-f"><span>${esc(tl('Kata sandi', 'Password'))}</span><input type="password" name="pw" autocomplete="off" spellcheck="false" required></label><p class="lock-err" role="alert" hidden>${esc(tl('Kata sandi salah. Coba lagi.', 'Wrong password. Please try again.'))}</p></div><div class="choice-a"><button type="button" class="btn btn-quiet" data-lock="cancel">${esc(tl('Batal', 'Cancel'))}</button><button class="btn btn-primary" value="ok">${esc(tl('Buka kunci', 'Unlock'))}</button></div></form>`;
    const form = d.querySelector('form'), inp = d.querySelector('input'), err = d.querySelector('.lock-err');
    d.querySelector('[data-lock="cancel"]').addEventListener('click', () => d.close('cancel'));
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      if (sha256hex(PAPER_LOCK.salt + inp.value) === PAPER_LOCK.digest) {
        paperOpen = true;
        try { sessionStorage.setItem('sembada-paper', PAPER_LOCK.digest.slice(0, 24)); } catch (e) { /* storage unavailable */ }
        d.close('ok');
      } else { err.hidden = false; inp.select(); }
    });
    document.body.appendChild(d);
    d.addEventListener('close', () => { res(d.returnValue === 'ok'); d.remove(); });
    d.showModal(); inp.focus();
  });
}
async function withPaperUnlock(fn) {
  if (!paperLocked()) return fn();
  if (!(await askPaperPassword())) return;
  toast(tl('Makalah terbuka untuk sesi ini.', 'The paper is unlocked for this session.'), 'ok');
  render();
  return fn();
}
function paperLockedHTML() {
  return `<div class="callout lock-card"><p><b>${LOCK_ICON}${esc(tl('Narasi paper terkunci sementara.', 'The paper narrative is temporarily locked.'))}</b> ${esc(tl('Draf makalah dan ekspornya (PDF, Word, LaTeX) dibuka dengan kata sandi. Hasil analisis lain tetap bisa dilihat dan diunduh seperti biasa.', 'The draft paper and its exports (PDF, Word, LaTeX) open with a password. All other results can still be viewed and downloaded as usual.'))}</p><button class="btn btn-primary" data-action="paper-unlock">${esc(tl('Buka dengan kata sandi', 'Unlock with password'))}</button></div>`;
}
