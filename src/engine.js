/* SEMbada engine: PLS-SEM numerical core (no DOM). */
const PLS = (function () {
  'use strict';

  // ---------------------------------------------------------------- errors
  class PLSError extends Error {
    constructor(code, message, info) { super(message); this.code = code; this.info = info || {}; }
  }

  // ---------------------------------------------------------------- linear algebra
  function zeros(r, c) { const m = new Array(r); for (let i = 0; i < r; i++) m[i] = new Float64Array(c); return m; }
  function copyMat(A) { return A.map(r => Float64Array.from(r)); }
  function sub(A, rows, cols) { return rows.map(i => Float64Array.from(cols, j => A[i][j])); }

  // Solve A x = b (A square, small) with partial pivoting. Throws on singular.
  function solve(A, b) {
    const n = A.length, M = A.map((r, i) => { const x = new Float64Array(n + 1); for (let j = 0; j < n; j++) x[j] = r[j]; x[n] = b[i]; return x; });
    for (let c = 0; c < n; c++) {
      let piv = c, best = Math.abs(M[c][c]);
      for (let r = c + 1; r < n; r++) { const v = Math.abs(M[r][c]); if (v > best) { best = v; piv = r; } }
      if (!(best > 1e-13)) throw new PLSError('singular', 'Matriks singular (kolinearitas sempurna).');
      if (piv !== c) { const t = M[piv]; M[piv] = M[c]; M[c] = t; }
      const d = M[c][c];
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / d; if (f === 0) continue;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
    return x;
  }
  function inverse(A) {
    const n = A.length, M = A.map((r, i) => { const x = new Float64Array(2 * n); for (let j = 0; j < n; j++) x[j] = r[j]; x[n + i] = 1; return x; });
    for (let c = 0; c < n; c++) {
      let piv = c, best = Math.abs(M[c][c]);
      for (let r = c + 1; r < n; r++) { const v = Math.abs(M[r][c]); if (v > best) { best = v; piv = r; } }
      if (!(best > 1e-13)) throw new PLSError('singular', 'Matriks singular (kolinearitas sempurna).');
      if (piv !== c) { const t = M[piv]; M[piv] = M[c]; M[c] = t; }
      const d = M[c][c];
      for (let k = 0; k < 2 * n; k++) M[c][k] /= d;
      for (let r = 0; r < n; r++) {
        if (r === c) continue; const f = M[r][c]; if (f === 0) continue;
        for (let k = 0; k < 2 * n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map(r => r.slice(n));
  }
  function cholesky(A) {
    const n = A.length, L = zeros(n, n);
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
      let s = A[i][j]; for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (!(s > 1e-14)) return null; L[i][i] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function logdetPD(A) { const L = cholesky(A); if (!L) return NaN; let s = 0; for (let i = 0; i < A.length; i++) s += Math.log(L[i][i]); return 2 * s; }
  // Jacobi eigenvalues for symmetric matrices
  function symEigen(A0) {
    const n = A0.length, A = copyMat(A0), V = zeros(n, n);
    for (let i = 0; i < n; i++) V[i][i] = 1;
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
      if (off < 1e-22) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
      }
    }
    return { values: Array.from({ length: n }, (_, i) => A[i][i]), vectors: V };
  }

  // ---------------------------------------------------------------- vectors / basic stats
  function dot(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
  function meanOf(a) { let s = 0, c = 0; for (const v of a) if (!Number.isNaN(v)) { s += v; c++; } return c ? s / c : NaN; }
  function standardize(col) {
    const n = col.length; let m = 0; for (let i = 0; i < n; i++) m += col[i]; m /= n;
    let v = 0; for (let i = 0; i < n; i++) { const d = col[i] - m; v += d * d; }
    const sd = Math.sqrt(v / (n - 1)); const z = new Float64Array(n);
    if (!(sd > 1e-12)) return { z, mean: m, sd: 0 };
    for (let i = 0; i < n; i++) z[i] = (col[i] - m) / sd;
    return { z, mean: m, sd };
  }
  function corCols(a, b) { // general Pearson correlation of two complete columns
    const n = a.length; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n;
    let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < n; i++) { const da = a[i] - ma, db = b[i] - mb; sab += da * db; saa += da * da; sbb += db * db; }
    return sab / Math.sqrt(saa * sbb);
  }
  function corMatrixStd(Zs) { // columns already standardized (n-1)
    const L = Zs.length, n = Zs[0].length, R = zeros(L, L);
    for (let i = 0; i < L; i++) { R[i][i] = 1; for (let j = i + 1; j < L; j++) { const r = dot(Zs[i], Zs[j]) / (n - 1); R[i][j] = r; R[j][i] = r; } }
    return R;
  }

  // ---------------------------------------------------------------- distributions
  function lgamma(x) {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1; let a = c[0]; const t = x + g + 0.5;
    for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-16, FPMIN = 1e-300;
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function ibeta(x, a, b) { // regularized incomplete beta I_x(a,b)
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tcdf(t, df) {
    if (!Number.isFinite(t)) return t > 0 ? 1 : 0;
    const x = df / (df + t * t), p = 0.5 * ibeta(x, df / 2, 0.5);
    return t >= 0 ? 1 - p : p;
  }
  function tquant(p, df) {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    if (p < 0.5) return -tquant(1 - p, df);
    let lo = 0, hi = 1; while (tcdf(hi, df) < p) hi *= 2;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (tcdf(mid, df) < p) lo = mid; else hi = mid; if (hi - lo < 1e-12) break; }
    return (lo + hi) / 2;
  }
  function erfc(x) { // Numerical Recipes erfc (Chebyshev), rel. err < 1.2e-7; refined via series for small |x|
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function pnorm(x) { return 0.5 * erfc(-x / Math.SQRT2); }
  function qnorm(p) { // Acklam + one Newton step
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const e = pnorm(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  function quantile7(sorted, q) { // R type 7
    const n = sorted.length; if (!n) return NaN; const h = (n - 1) * q, lo = Math.floor(h), hi = Math.ceil(h);
    return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
  }

  // ---------------------------------------------------------------- RNG (xoshiro128**, seeded by splitmix32)
  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    function sm() { s = (s + 0x9e3779b9) >>> 0; let z = s; z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0; z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0; return (z ^ (z >>> 16)) >>> 0; }
    let a = sm(), b = sm(), c = sm(), d = sm();
    function next() {
      const r = Math.imul(rotl(Math.imul(b, 5), 7), 9) >>> 0, t = (b << 9) >>> 0;
      c ^= a; d ^= b; b ^= c; a ^= d; c ^= t; d = rotl(d, 11);
      return r / 4294967296;
    }
    function rotl(x, k) { return ((x << k) | (x >>> (32 - k))) >>> 0; }
    return { random: next, int: n => Math.floor(next() * n) };
  }

  // ---------------------------------------------------------------- model spec helpers
  // spec: { lv: [names], blocks: [[colIdx]], mode: ['A'|'B'], reflective: [bool], D: L×L (0/1) }
  function predecessors(D, j) { const r = []; for (let i = 0; i < D.length; i++) if (D[i][j]) r.push(i); return r; }
  function successors(D, i) { const r = []; for (let j = 0; j < D.length; j++) if (D[i][j]) r.push(j); return r; }
  function topoOrder(D) {
    const L = D.length, indeg = new Array(L).fill(0), out = [];
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (D[i][j]) indeg[j]++;
    const q = []; for (let i = 0; i < L; i++) if (!indeg[i]) q.push(i);
    while (q.length) { const v = q.shift(); out.push(v); for (let j = 0; j < L; j++) if (D[v][j] && --indeg[j] === 0) q.push(j); }
    return out.length === L ? out : null;
  }
  function hasCycle(D) { return topoOrder(D) === null; }
  // all directed chains (length >= 2 edges) between each pair
  function enumerateChains(D) {
    const L = D.length, chains = [];
    function dfs(path) {
      const last = path[path.length - 1];
      for (let j = 0; j < L; j++) if (D[last][j]) { const np = path.concat(j); if (np.length >= 3) chains.push(np); dfs(np); }
    }
    for (let i = 0; i < L; i++) dfs([i]);
    return chains;
  }
  function reachable(D) { // R[i][j] = true if a directed path i -> j exists
    const L = D.length, R = Array.from({ length: L }, () => new Array(L).fill(false));
    for (let i = 0; i < L; i++) { const st = [i]; while (st.length) { const v = st.pop(); for (let j = 0; j < L; j++) if (D[v][j] && !R[i][j]) { R[i][j] = true; st.push(j); } } }
    return R;
  }

  // ---------------------------------------------------------------- core estimation
  // cols: array p of Float64Array(n) (complete data). opts: {scheme, maxIter, tol, plsc}
  function estimate(cols, spec, opts) {
    const scheme = opts.scheme || 'path', maxIter = opts.maxIter || 300, tol = opts.tol || 1e-7;
    const n = cols[0].length, p = cols.length, L = spec.lv.length, D = spec.D, blocks = spec.blocks;
    if (n < 3) throw new PLSError('n', 'Jumlah observasi terlalu sedikit.');
    const Z = new Array(p), mu = new Float64Array(p), sdv = new Float64Array(p);
    for (let k = 0; k < p; k++) {
      const s = standardize(cols[k]); if (!s.sd) throw new PLSError('zero_variance', 'Indikator tidak bervariasi (SD = 0).', { index: k });
      Z[k] = s.z; mu[k] = s.mean; sdv[k] = s.sd;
    }
    const preds = [], succs = [], nbrs = [];
    for (let j = 0; j < L; j++) { preds[j] = predecessors(D, j); succs[j] = successors(D, j); nbrs[j] = preds[j].concat(succs[j]); }
    // Mode B inverse correlation per block
    const blockSinv = blocks.map((b, j) => {
      if (spec.mode[j] !== 'B' || b.length < 2) return null;
      const S = zeros(b.length, b.length);
      for (let a = 0; a < b.length; a++) for (let c = 0; c < b.length; c++) S[a][c] = a === c ? 1 : dot(Z[b[a]], Z[b[c]]) / (n - 1);
      return inverse(S);
    });
    let W = blocks.map(b => new Float64Array(b.length).fill(1));
    const scoresOf = (Wt) => blocks.map((b, j) => { const y = new Float64Array(n); for (let a = 0; a < b.length; a++) { const z = Z[b[a]], w = Wt[j][a]; for (let i = 0; i < n; i++) y[i] += w * z[i]; } return y; });
    const stdInPlace = (y) => { const s = standardize(y); if (!s.sd) throw new PLSError('degenerate', 'Skor konstruk tidak bervariasi.'); return s.z; };
    let Y = scoresOf(W).map(stdInPlace);
    let iter = 0, converged = false;
    for (iter = 1; iter <= maxIter + 1; iter++) {
      const R = corMatrixStd(Y);
      const Zin = new Array(L);
      for (let j = 0; j < L; j++) {
        const zj = new Float64Array(n);
        const add = (i, e) => { if (!e) return; const yi = Y[i]; for (let r = 0; r < n; r++) zj[r] += e * yi[r]; };
        if (scheme === 'path') {
          const P = preds[j];
          if (P.length) { const beta = solve(sub(R, P, P), Float64Array.from(P, i => R[i][j])); P.forEach((i, a) => add(i, beta[a])); }
          for (const k of succs[j]) add(k, R[j][k]);
        } else if (scheme === 'factorial') { for (const i of nbrs[j]) add(i, R[i][j]); }
        else { for (const i of nbrs[j]) add(i, Math.sign(R[i][j])); }
        Zin[j] = stdInPlace(zj);
      }
      const Wn = blocks.map((b, j) => {
        let w;
        if (spec.mode[j] === 'B' && blockSinv[j]) { const c = Float64Array.from(b, k => dot(Z[k], Zin[j]) / (n - 1)); w = new Float64Array(b.length); for (let a = 0; a < b.length; a++) w[a] = dot(blockSinv[j][a], c); }
        else w = Float64Array.from(b, k => dot(Z[k], Zin[j]) / (n - 1));
        const y = new Float64Array(n); for (let a = 0; a < b.length; a++) { const z = Z[b[a]]; for (let i = 0; i < n; i++) y[i] += w[a] * z[i]; }
        const s = Math.sqrt(dot(y, y) / (n - 1)); if (!(s > 0)) throw new PLSError('degenerate', 'Bobot luar tidak dapat dinormalisasi.');
        for (let a = 0; a < w.length; a++) w[a] /= s; return w;
      });
      let diff = 0; for (let j = 0; j < L; j++) for (let a = 0; a < Wn[j].length; a++) diff += Math.abs(Wn[j][a] - W[j][a]);
      W = Wn; Y = scoresOf(W).map(stdInPlace);
      if (diff < tol) { converged = true; break; }
    }
    if (iter > maxIter + 1) iter = maxIter + 1;
    const Rlv = corMatrixStd(Y);
    // loadings (correlations) for all indicators x all constructs
    const cross = zeros(p, L);
    for (let k = 0; k < p; k++) for (let j = 0; j < L; j++) cross[k][j] = dot(Z[k], Y[j]) / (n - 1);
    const loadPLS = blocks.map((b, j) => Float64Array.from(b, k => cross[k][j]));
    // rhoA (for every block with >= 2 indicators; single = 1)
    const rhoA = blocks.map((b, j) => {
      if (b.length < 2) return 1;
      const w = W[j]; let ww = 0, num = 0, den = 0;
      for (let a = 0; a < b.length; a++) ww += w[a] * w[a];
      for (let a = 0; a < b.length; a++) for (let c = 0; c < b.length; c++) if (a !== c) { num += w[a] * w[c] * dot(Z[b[a]], Z[b[c]]) / (n - 1); den += w[a] * w[c] * w[a] * w[c]; }
      return ww * ww * num / den;
    });
    let Rm = Rlv, loadings = loadPLS, Rc = null;
    if (opts.plsc) {
      const rho = blocks.map((b, j) => spec.reflective[j] ? rhoA[j] : 1);
      Rc = zeros(L, L);
      for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) Rc[i][j] = i === j ? 1 : Rlv[i][j] / Math.sqrt(rho[i] * rho[j]);
      Rm = Rc;
      loadings = blocks.map((b, j) => {
        if (!spec.reflective[j]) return loadPLS[j];
        const w = W[j]; let ww = 0; for (const v of w) ww += v * v; const f = Math.sqrt(rhoA[j]) / ww;
        return Float64Array.from(w, v => v * f);
      });
    }
    const B = zeros(L, L), R2 = new Float64Array(L).fill(NaN), R2adj = new Float64Array(L).fill(NaN);
    for (let j = 0; j < L; j++) {
      const P = preds[j]; if (!P.length) continue;
      const beta = solve(sub(Rm, P, P), Float64Array.from(P, i => Rm[i][j]));
      let r2 = 0; P.forEach((i, a) => { B[i][j] = beta[a]; r2 += beta[a] * Rm[i][j]; });
      R2[j] = r2; R2adj[j] = 1 - (1 - r2) * (n - 1) / (n - P.length - 1);
    }
    return { n, p, L, W, Y, Z, mu, sd: sdv, Rlv, Rc, Rm, B, R2, R2adj, loadings, loadPLS, cross, rhoA, iterations: iter, converged, preds, opts };
  }

  // total effects: T = B + B^2 + ...
  function totalEffects(B) {
    const L = B.length; const T = zeros(L, L); let P = copyMat(B);
    for (let s = 0; s < L; s++) {
      let any = false;
      for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) { T[i][j] += P[i][j]; if (P[i][j] !== 0) any = true; }
      if (!any) break;
      const N = zeros(L, L);
      for (let i = 0; i < L; i++) for (let k = 0; k < L; k++) { const a = P[i][k]; if (!a) continue; for (let j = 0; j < L; j++) N[i][j] += a * B[k][j]; }
      P = N;
    }
    return T;
  }

  function indicatorCorr(Z) { // full p×p correlation of standardized columns
    const p = Z.length, n = Z[0].length, S = zeros(p, p);
    for (let a = 0; a < p; a++) { S[a][a] = 1; for (let b = a + 1; b < p; b++) { const r = dot(Z[a], Z[b]) / (n - 1); S[a][b] = r; S[b][a] = r; } }
    return S;
  }
  function htmtMatrix(S, blocks) {
    const L = blocks.length, H = zeros(L, L);
    const mono = blocks.map(b => { if (b.length < 2) return 1; let s = 0, c = 0; for (let a = 0; a < b.length; a++) for (let d = a + 1; d < b.length; d++) { s += Math.abs(S[b[a]][b[d]]); c++; } return s / c; });
    for (let i = 0; i < L; i++) for (let j = i + 1; j < L; j++) {
      let s = 0, c = 0; for (const a of blocks[i]) for (const d of blocks[j]) { s += Math.abs(S[a][d]); c++; }
      const v = (s / c) / Math.sqrt(mono[i] * mono[j]); H[i][j] = v; H[j][i] = v;
    }
    return H;
  }

  // construct-level model-implied correlation (recursive structural model)
  function impliedLV(B, PhiSat, D) {
    const L = B.length, order = topoOrder(D), Phi = zeros(L, L), done = new Array(L).fill(false);
    const exo = [], endo = [];
    for (let j = 0; j < L; j++) (predecessors(D, j).length ? endo : exo).push(j);
    for (const i of exo) { for (const k of exo) Phi[i][k] = PhiSat[i][k]; done[i] = true; }
    for (const j of order) {
      if (done[j]) continue; const P = predecessors(D, j);
      for (let k = 0; k < L; k++) { if (!done[k]) continue; let s = 0; for (const i of P) s += B[i][j] * Phi[i][k]; Phi[j][k] = s; Phi[k][j] = s; }
      Phi[j][j] = 1; done[j] = true;
    }
    return Phi;
  }

  function modelFit(est, spec, S, Phi) {
    const blocks = spec.blocks, p = S.length;
    const blockOf = new Array(p), pos = new Array(p);
    blocks.forEach((b, j) => b.forEach((k, a) => { blockOf[k] = j; pos[k] = a; }));
    const Sig = zeros(p, p);
    for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) {
      if (a === b) { Sig[a][b] = 1; continue; }
      const i = blockOf[a], j = blockOf[b];
      if (i === j) {
        if (est.opts.plsc && spec.reflective[i]) Sig[a][b] = est.loadings[i][pos[a]] * est.loadings[i][pos[b]];
        else Sig[a][b] = S[a][b];
      } else Sig[a][b] = est.loadings[i][pos[a]] * Phi[i][j] * est.loadings[j][pos[b]];
    }
    let ss = 0; for (let a = 0; a < p; a++) for (let b = a + 1; b < p; b++) { const d = S[a][b] - Sig[a][b]; ss += d * d; }
    const srmr = Math.sqrt(ss / (p * (p + 1) / 2)), duls = ss;
    let dg = NaN, chi2 = NaN, nfi = NaN;
    try {
      const Lc = cholesky(S);
      if (Lc) {
        const Li = inverse(Lc); // lower
        const M = zeros(p, p); // Li Sig Li'
        const T = zeros(p, p);
        for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) { let s = 0; for (let k = 0; k <= a; k++) s += Li[a][k] * Sig[k][b]; T[a][b] = s; }
        for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) { let s = 0; for (let k = 0; k <= b; k++) s += T[a][k] * Li[b][k]; M[a][b] = s; }
        for (let a = 0; a < p; a++) for (let b = a + 1; b < p; b++) { const v = (M[a][b] + M[b][a]) / 2; M[a][b] = v; M[b][a] = v; }
        const ev = symEigen(M).values;
        if (ev.every(v => v > 0)) dg = 0.5 * ev.reduce((s, v) => s + Math.log(v) ** 2, 0);
        const ldSig = logdetPD(Sig), ldS = logdetPD(S);
        if (Number.isFinite(ldSig) && Number.isFinite(ldS)) {
          const Si = inverse(Sig); let tr = 0; for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) tr += S[a][b] * Si[b][a];
          const F = ldSig + tr - ldS - p, F0 = -ldS;
          chi2 = (est.n - 1) * F; nfi = 1 - F / F0;
        }
      }
    } catch (e) { /* leave NaN */ }
    return { srmr, duls, dg, chi2, nfi };
  }

  // drop paths & isolated constructs → sub-spec (used for f²)
  function reducedSpec(spec, drop) {
    const L = spec.lv.length, D = spec.D.map(r => Array.from(r));
    D[drop[0]][drop[1]] = 0;
    const keep = []; for (let j = 0; j < L; j++) { let any = false; for (let k = 0; k < L; k++) if (D[j][k] || D[k][j]) any = true; if (any) keep.push(j); }
    const map = new Map(keep.map((j, a) => [j, a]));
    return { spec: { lv: keep.map(j => spec.lv[j]), blocks: keep.map(j => spec.blocks[j]), mode: keep.map(j => spec.mode[j]), reflective: keep.map(j => spec.reflective[j]), D: keep.map(i => keep.map(j => D[i][j])) }, map };
  }

  function analyze(cols, spec, opts) {
    const est = estimate(cols, spec, opts);
    const L = est.L, p = est.p, n = est.n, blocks = spec.blocks, D = spec.D;
    const S = indicatorCorr(est.Z);
    const refl = spec.reflective;
    const alpha = blocks.map(b => { const k = b.length; if (k < 2) return 1; let s = 0; for (const a of b) for (const c of b) s += S[a][c]; return k / (k - 1) * (1 - k / s); });
    const rhoC = [], AVE = [];
    blocks.forEach((b, j) => {
      const lam = est.loadings[j]; if (b.length < 2) { rhoC.push(1); AVE.push(lam[0] * lam[0]); return; }
      let sl = 0, se = 0, s2 = 0; for (const v of lam) { sl += v; se += 1 - v * v; s2 += v * v; }
      rhoC.push(sl * sl / (sl * sl + se)); AVE.push(s2 / lam.length);
    });
    const FL = zeros(L, L);
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) FL[i][j] = i === j ? Math.sqrt(AVE[i]) : est.Rlv[i][j];
    const HTMT = htmtMatrix(S, blocks);
    const outerVIF = blocks.map(b => {
      if (b.length < 2) return Float64Array.from([1]);
      try { const inv = inverse(b.map(a => Float64Array.from(b, c => S[a][c]))); return Float64Array.from(b, (_, a) => inv[a][a]); }
      catch (e) { return Float64Array.from(b, () => Infinity); }
    });
    const innerVIF = zeros(L, L).map(r => r.fill(NaN));
    for (let j = 0; j < L; j++) {
      const P = est.preds[j]; if (!P.length) continue;
      if (P.length === 1) { innerVIF[P[0]][j] = 1; continue; }
      try { const inv = inverse(sub(est.Rlv, P, P)); P.forEach((i, a) => { innerVIF[i][j] = inv[a][a]; }); } catch (e) { P.forEach(i => { innerVIF[i][j] = Infinity; }); }
    }
    // f² (re-estimate without the path, as in seminr / Hair et al.)
    const f2 = zeros(L, L).map(r => r.fill(NaN));
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (D[i][j]) {
      const r2in = est.R2[j]; let r2ex = 0;
      const others = est.preds[j].filter(x => x !== i);
      if (others.length) {
        try { const red = reducedSpec(spec, [i, j]); const e2 = estimate(cols, red.spec, opts); r2ex = e2.R2[red.map.get(j)]; }
        catch (e) { r2ex = NaN; }
      }
      f2[i][j] = (r2in - r2ex) / (1 - r2in);
    }
    const T = totalEffects(est.B);
    const IND = zeros(L, L); for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) IND[i][j] = T[i][j] - est.B[i][j];
    const chains = enumerateChains(D).map(c => { let v = 1; for (let a = 0; a + 1 < c.length; a++) v *= est.B[c[a]][c[a + 1]]; return { chain: c, value: v }; });
    // AIC / BIC as in seminr (OLS on construct scores)
    const itc = [];
    for (let j = 0; j < L; j++) {
      const P = est.preds[j]; if (!P.length) continue;
      const beta = solve(sub(est.Rlv, P, P), Float64Array.from(P, i => est.Rlv[i][j]));
      let r2 = 0; P.forEach((i, a) => { r2 += beta[a] * est.Rlv[i][j]; });
      const sse = (n - 1) * (1 - r2), k = P.length;
      itc.push({ j, aic: n * Math.log(sse / n) + 2 * (k + 1), bic: n * Math.log(sse / n) + (k + 1) * Math.log(n) });
    }
    const PhiSat = opts.plsc ? est.Rc : est.Rlv;
    const fitSat = modelFit(est, spec, S, PhiSat);
    const fitEst = modelFit(est, spec, S, impliedLV(est.B, PhiSat, D));
    // admissibility checks
    const issues = [];
    for (let j = 0; j < L; j++) if (Number.isFinite(est.R2[j]) && est.R2[j] > 1) issues.push({ type: 'r2', j, value: est.R2[j] });
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (D[i][j] && Math.abs(est.B[i][j]) > 1) issues.push({ type: 'beta', i, j, value: est.B[i][j] });
    blocks.forEach((b, j) => est.loadings[j].forEach((v, a) => { if (Math.abs(v) > 1) issues.push({ type: 'loading', j, k: b[a], value: v }); }));
    if (opts.plsc) { for (let i = 0; i < L; i++) for (let j = i + 1; j < L; j++) if (Math.abs(est.Rc[i][j]) > 1) issues.push({ type: 'corr', i, j, value: est.Rc[i][j] }); if (!cholesky(est.Rc)) issues.push({ type: 'notpd' }); }
    return { est, S, alpha, rhoA: est.rhoA, rhoC, AVE, FL, HTMT, outerVIF, innerVIF, f2, total: T, indirect: IND, chains, itc, fit: { saturated: fitSat, estimated: fitEst }, issues };
  }

  // ---------------------------------------------------------------- bootstrapping
  function extractStats(est, spec, ctx, withHTMT) {
    const out = new Float64Array(ctx.size); let o = 0;
    for (const [i, j] of ctx.paths) out[o++] = est.B[i][j];
    const T = totalEffects(est.B);
    for (const c of ctx.chains) { let v = 1; for (let a = 0; a + 1 < c.length; a++) v *= est.B[c[a]][c[a + 1]]; out[o++] = v; }
    for (const [i, j] of ctx.totalInd) out[o++] = T[i][j] - est.B[i][j];
    for (const [i, j] of ctx.totals) out[o++] = T[i][j];
    for (const j of ctx.endo) out[o++] = est.R2[j];
    spec.blocks.forEach((b, j) => b.forEach((_, a) => { out[o++] = est.loadings[j][a]; }));
    spec.blocks.forEach((b, j) => b.forEach((_, a) => { out[o++] = est.W[j][a]; }));
    if (withHTMT) { const H = htmtMatrix(indicatorCorr(est.Z), spec.blocks); for (const [i, j] of ctx.pairs) out[o++] = H[i][j]; }
    else for (let x = 0; x < ctx.pairs.length; x++) out[o++] = NaN;
    return out;
  }
  function bootContext(spec) {
    const L = spec.lv.length, D = spec.D, R = reachable(D);
    const paths = [], totals = [], totalInd = [], endo = [], pairs = [];
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (D[i][j]) paths.push([i, j]);
    const chains = enumerateChains(D);
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (R[i][j]) totals.push([i, j]);
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) if (chains.some(c => c[0] === i && c[c.length - 1] === j)) totalInd.push([i, j]);
    for (let j = 0; j < L; j++) if (predecessors(D, j).length) endo.push(j);
    for (let i = 0; i < L; i++) for (let j = i + 1; j < L; j++) pairs.push([i, j]);
    const nInd = spec.blocks.reduce((s, b) => s + b.length, 0);
    const size = paths.length + chains.length + totalInd.length + totals.length + endo.length + 2 * nInd + pairs.length;
    return { paths, chains, totals, totalInd, endo, pairs, size, nInd };
  }
  function resample(cols, idx) { return cols.map(c => { const r = new Float64Array(idx.length); for (let i = 0; i < idx.length; i++) r[i] = c[idx[i]]; return r; }); }
  const tick = () => new Promise(r => setTimeout(r, 0));

  async function bootstrap(cols, spec, opts, bopts, onProgress, isCancelled) {
    const B = bopts.B, n = cols[0].length, rng = makeRng(bopts.seed), ctx = bootContext(spec);
    // optional stage-1 hook: maps resampled raw indicator columns to the stage-2 data of two-stage models (HOC, interaction terms)
    const prep = typeof bopts.prep === 'function' ? bopts.prep : (c => c);
    const withHTMT = bopts.htmt !== false;
    const orig = extractStats(estimate(prep(cols), spec, opts), spec, ctx, withHTMT);
    const draws = Array.from({ length: ctx.size }, () => new Float64Array(B));
    let b = 0, fails = 0, lastTick = Date.now();
    while (b < B) {
      const idx = new Int32Array(n); for (let i = 0; i < n; i++) idx[i] = rng.int(n);
      let st;
      try { st = extractStats(estimate(prep(resample(cols, idx)), spec, opts), spec, ctx, withHTMT); }
      catch (e) { fails++; if (fails > Math.max(50, B)) throw new PLSError('boot_fail', 'Terlalu banyak sampel bootstrap yang gagal diestimasi.'); continue; }
      for (let k = 0; k < ctx.size; k++) draws[k][b] = st[k];
      b++;
      if (Date.now() - lastTick > 40) { lastTick = Date.now(); if (onProgress) onProgress(b / B, 'boot'); await tick(); if (isCancelled && isCancelled()) throw new PLSError('cancel', 'Dibatalkan.'); }
    }
    let jack = null;
    if (bopts.ci === 'bca') {
      jack = Array.from({ length: ctx.size }, () => new Float64Array(n));
      for (let i = 0; i < n; i++) {
        const idx = new Int32Array(n - 1); for (let a = 0, c = 0; a < n; a++) if (a !== i) idx[c++] = a;
        let st; try { st = extractStats(estimate(prep(resample(cols, idx)), spec, opts), spec, ctx, withHTMT); } catch (e) { st = new Float64Array(ctx.size).fill(NaN); }
        for (let k = 0; k < ctx.size; k++) jack[k][i] = st[k];
        if (Date.now() - lastTick > 40) { lastTick = Date.now(); if (onProgress) onProgress(i / n, 'jack'); await tick(); if (isCancelled && isCancelled()) throw new PLSError('cancel', 'Dibatalkan.'); }
      }
    }
    const alpha = bopts.alpha, two = bopts.tails !== 'one';
    const lo = two ? alpha / 2 : alpha, hi = 1 - lo;
    const summary = [];
    for (let k = 0; k < ctx.size; k++) {
      const v = draws[k], O = orig[k];
      if (!Number.isFinite(O)) { summary.push(null); continue; }
      const fin = Array.from(v).filter(Number.isFinite).sort((a, c) => a - c);
      const m = fin.reduce((s, x) => s + x, 0) / fin.length;
      const sd = Math.sqrt(fin.reduce((s, x) => s + (x - m) * (x - m), 0) / (fin.length - 1));
      const t = Math.abs(O / sd), df = fin.length - 1;
      const pv = two ? 2 * (1 - tcdf(t, df)) : 1 - tcdf(t, df);
      let ciLo, ciHi;
      if (jack) {
        const jk = Array.from(jack[k]).filter(Number.isFinite), jm = jk.reduce((s, x) => s + x, 0) / jk.length;
        let num = 0, den = 0; for (const x of jk) { const d = jm - x; num += d * d * d; den += d * d; }
        const acc = den > 0 ? num / (6 * Math.pow(den, 1.5)) : 0;
        let below = 0; for (const x of fin) if (x < O) below++;
        const prop = Math.min(Math.max(below / fin.length, 1 / (fin.length + 1)), fin.length / (fin.length + 1));
        const z0 = qnorm(prop);
        const adj = q => { const zq = qnorm(q); return pnorm(z0 + (z0 + zq) / (1 - acc * (z0 + zq))); };
        ciLo = quantile7(fin, adj(lo)); ciHi = quantile7(fin, adj(hi));
      } else { ciLo = quantile7(fin, lo); ciHi = quantile7(fin, hi); }
      summary.push({ O, M: m, SD: sd, T: t, P: pv, lo: ciLo, hi: ciHi, bias: m - O });
    }
    // split into named groups
    let o = 0; const take = (arr, mk, kd) => arr.map(x => { const r = { key: mk(x), s: summary[o] }; if (kd && bopts.keepDraws) r.d = Float32Array.from(draws[o]); o++; return r; });
    const res = {
      paths: take(ctx.paths, x => x, true), chains: take(ctx.chains, x => x, true), totalInd: take(ctx.totalInd, x => x), totals: take(ctx.totals, x => x),
      r2: take(ctx.endo, x => x),
      loadings: [], weights: [], htmt: null, B, fails, ci: bopts.ci, alpha, tails: two ? 'two' : 'one', lo, hi
    };
    spec.blocks.forEach((b, j) => b.forEach((k, a) => res.loadings.push({ key: [j, a, k], s: summary[o++] })));
    spec.blocks.forEach((b, j) => b.forEach((k, a) => res.weights.push({ key: [j, a, k], s: summary[o++] })));
    res.htmt = take(ctx.pairs, x => x);
    // HTMT one-sided style interval is reported as two-sided CI per settings; also report percentile 95% upper bound
    return res;
  }

  // ---------------------------------------------------------------- PLSpredict
  function olsFit(Xs, y) { // Xs: array of columns; returns coef (intercept first)
    const n = y.length, k = Xs.length + 1;
    const XtX = zeros(k, k), Xty = new Float64Array(k);
    const col = (c, i) => c === 0 ? 1 : Xs[c - 1][i];
    for (let a = 0; a < k; a++) { for (let c = a; c < k; c++) { let s = 0; for (let i = 0; i < n; i++) s += col(a, i) * col(c, i); XtX[a][c] = s; XtX[c][a] = s; } let s = 0; for (let i = 0; i < n; i++) s += col(a, i) * y[i]; Xty[a] = s; }
    for (let a = 0; a < k; a++) XtX[a][a] += 1e-10;
    return solve(XtX, Xty);
  }
  async function plsPredict(cols, spec, opts, popts, onProgress, isCancelled) {
    const n = cols[0].length, L = spec.lv.length, D = spec.D, folds = Math.min(popts.folds, n), reps = popts.reps, rng = makeRng(popts.seed);
    const endo = []; for (let j = 0; j < L; j++) if (predecessors(D, j).length) endo.push(j);
    const exo = []; for (let j = 0; j < L; j++) if (!predecessors(D, j).length) exo.push(j);
    const order = topoOrder(D);
    const tgt = []; endo.forEach(j => spec.blocks[j].forEach((k, a) => tgt.push({ j, a, k })));
    const acc = tgt.map(() => ({ ssePLS: 0, sseLM: 0, sso: 0, aePLS: 0, aeLM: 0, cnt: 0 }));
    const lvAcc = endo.map(() => ({ sse: 0, sso: 0, ae: 0, cnt: 0 }));
    let done = 0, lastTick = Date.now(); const total = folds * reps;
    for (let r = 0; r < reps; r++) {
      const perm = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = rng.int(i + 1); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
      for (let f = 0; f < folds; f++) {
        const test = [], train = [];
        perm.forEach((v, pos) => (Math.floor(pos * folds / n) === f ? test : train).push(v));
        const trCols = resample(cols, Int32Array.from(train));
        const est = estimate(trCols, spec, opts);
        // test construct scores (training metric, not re-standardized)
        const nt = test.length;
        const Ysc = spec.blocks.map((b, j) => { const y = new Float64Array(nt); b.forEach((k, a) => { const w = est.W[j][a], m = est.mu[k], s = est.sd[k]; test.forEach((row, t) => { y[t] += w * (cols[k][row] - m) / s; }); }); return y; });
        const Yhat = Ysc.map(y => Float64Array.from(y));
        if (popts.approach === 'EA') {
          for (const j of order) { const P = predecessors(D, j); if (!P.length) continue; const yh = new Float64Array(nt); for (const i of P) for (let t = 0; t < nt; t++) yh[t] += est.B[i][j] * Yhat[i][t]; Yhat[j] = yh; }
        } else {
          for (const j of endo) { const yh = new Float64Array(nt); for (const i of predecessors(D, j)) for (let t = 0; t < nt; t++) yh[t] += est.B[i][j] * Ysc[i][t]; Yhat[j] = yh; }
        }
        endo.forEach((j, e) => { for (let t = 0; t < nt; t++) { const d = Ysc[j][t] - Yhat[j][t]; lvAcc[e].sse += d * d; lvAcc[e].sso += Ysc[j][t] * Ysc[j][t]; lvAcc[e].ae += Math.abs(d); lvAcc[e].cnt++; } });
        // LM benchmark predictors
        const lmCache = new Map();
        tgt.forEach((g, x) => {
          const k = g.k, lam = est.loadings[g.j][g.a], m = est.mu[k], s = est.sd[k];
          const predItems = (popts.approach === 'EA' ? exo : predecessors(D, g.j)).flatMap(i => spec.blocks[i]);
          let coef = lmCache.get(k);
          if (!coef) { coef = olsFit(predItems.map(c => trCols[c]), trCols[k]); lmCache.set(k, coef); }
          const trMean = est.mu[k];
          test.forEach((row, t) => {
            const yv = cols[k][row];
            const pls = lam * Yhat[g.j][t] * s + m;
            let lm = coef[0]; predItems.forEach((c, a) => { lm += coef[a + 1] * cols[c][row]; });
            const a1 = acc[x]; a1.ssePLS += (yv - pls) ** 2; a1.sseLM += (yv - lm) ** 2; a1.sso += (yv - trMean) ** 2; a1.aePLS += Math.abs(yv - pls); a1.aeLM += Math.abs(yv - lm); a1.cnt++;
          });
        });
        done++;
        if (Date.now() - lastTick > 40) { lastTick = Date.now(); if (onProgress) onProgress(done / total, 'predict'); await tick(); if (isCancelled && isCancelled()) throw new PLSError('cancel', 'Dibatalkan.'); }
      }
    }
    return {
      items: tgt.map((g, x) => { const a = acc[x]; return { j: g.j, k: g.k, q2: 1 - a.ssePLS / a.sso, rmsePLS: Math.sqrt(a.ssePLS / a.cnt), maePLS: a.aePLS / a.cnt, rmseLM: Math.sqrt(a.sseLM / a.cnt), maeLM: a.aeLM / a.cnt }; }),
      constructs: endo.map((j, e) => { const a = lvAcc[e]; return { j, q2: 1 - a.sse / a.sso, rmse: Math.sqrt(a.sse / a.cnt), mae: a.ae / a.cnt }; }),
      folds, reps, approach: popts.approach
    };
  }

  // ---------------------------------------------------------------- classical item analysis (as in the Rmd)
  function classical(cols, blocks, alphaLevel) {
    const n = cols[0].length, df = n - 2, tc = tquant(1 - (alphaLevel || 0.05) / 2, df), rtab = tc / Math.sqrt(df + tc * tc);
    const covM = (ix) => { const k = ix.length, C = zeros(k, k), m = ix.map(c => meanOf(cols[c])); for (let a = 0; a < k; a++) for (let b = a; b < k; b++) { let s = 0; for (let i = 0; i < n; i++) s += (cols[ix[a]][i] - m[a]) * (cols[ix[b]][i] - m[b]); C[a][b] = C[b][a] = s / (n - 1); } return C; };
    const rawAlpha = (C, keys, use) => { const k = use.length; if (k < 2) return NaN; let tv = 0, sv = 0; for (const a of use) { sv += C[a][a]; for (const b of use) tv += keys[a] * keys[b] * C[a][b]; } return k / (k - 1) * (1 - sv / tv); };
    const out = blocks.map(b => {
      const k = b.length;
      const items = b.map((c, a) => {
        if (k < 2) return { c, r: NaN, p: NaN };
        const rest = new Float64Array(n); b.forEach((d, e) => { if (e !== a) for (let i = 0; i < n; i++) rest[i] += cols[d][i]; });
        const r = corCols(cols[c], rest), t = r * Math.sqrt(df / (1 - r * r)), p = 2 * (1 - tcdf(Math.abs(t), df));
        return { c, r, p };
      });
      let alpha = NaN, drop = b.map(() => NaN), reversed = [];
      if (k >= 2) {
        const C = covM(b), R = C.map((r, a) => Float64Array.from(r, (v, e) => v / Math.sqrt(C[a][a] * C[e][e])));
        const ev = symEigen(R); let best = 0; ev.values.forEach((v, i) => { if (v > ev.values[best]) best = i; });
        let vec = ev.vectors.map(r => r[best]); if (vec.reduce((s, v) => s + v, 0) < 0) vec = vec.map(v => -v);
        const keys = vec.map(v => (v < 0 ? -1 : 1)); reversed = b.filter((_, a) => keys[a] < 0);
        const all = b.map((_, a) => a);
        alpha = rawAlpha(C, keys, all);
        drop = b.map((_, a) => rawAlpha(C, keys, all.filter(x => x !== a)));
      }
      return { items, alpha, drop, reversed };
    });
    return { rtab, df, tcrit: tc, blocks: out };
  }

  // ---------------------------------------------------------------- descriptives
  function describe(values) {
    const v = values.filter(x => !Number.isNaN(x)), n = v.length, miss = values.length - n;
    if (!n) return { n: 0, miss, mean: NaN, median: NaN, sd: NaN, min: NaN, max: NaN, skew: NaN, kurt: NaN };
    const s = v.slice().sort((a, b) => a - b), m = v.reduce((a, b) => a + b, 0) / n;
    let m2 = 0; for (const x of v) m2 += (x - m) ** 2; const sd = Math.sqrt(m2 / (n - 1));
    let g3 = 0, g4 = 0; for (const x of v) { const z = (x - m) / sd; g3 += z ** 3; g4 += z ** 4; }
    const skew = n > 2 && sd > 0 ? n / ((n - 1) * (n - 2)) * g3 : NaN;
    const kurt = n > 3 && sd > 0 ? n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * g4 - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3)) : NaN;
    return { n, miss, mean: m, median: quantile7(s, 0.5), sd, min: s[0], max: s[n - 1], skew, kurt };
  }

  return {
    PLSError, estimate, analyze, bootstrap, bootContext, plsPredict, classical, describe, totalEffects, enumerateChains, topoOrder, hasCycle, resample,
    predecessors, successors, reachable, htmtMatrix, indicatorCorr, makeRng, tcdf, tquant, pnorm, qnorm, quantile7, solve, inverse, symEigen
  };
})();
if (typeof module !== 'undefined') module.exports = PLS;
