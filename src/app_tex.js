/* ================================================================ embedded LaTeX engine: pdfTeX (SwiftLaTeX build) in a Web Worker, fully offline */
// The bundle (gzip, base64 in #tex-bundle) holds: 4-byte header length, JSON header {files: [[name, offset, length]], index: {"fmt/request": name}}, then the file bytes.
const TEX_BOOT = `
let FILES = {}, INDEX = {};
self.XMLHttpRequest = function () { this.status = 0; this.response = null; this.h = {}; };
self.XMLHttpRequest.prototype.open = function (m, u) { this.u = u; };
self.XMLHttpRequest.prototype.setRequestHeader = function () {};
self.XMLHttpRequest.prototype.getResponseHeader = function (k) { return this.h[k] || null; };
self.XMLHttpRequest.prototype.send = function () {
  const m = /pdftex\\/([^/]+)\\/(.+)$/.exec(this.u || ''), key = m ? m[1] + '/' + decodeURIComponent(m[2]) : '', name = m ? decodeURIComponent(m[2]) : '';
  const EXT = { '3': '.tfm', '33': '.vf', '32': '.pfb', '44': '.enc', '26': '.tex', '11': '.map', '10': '.fmt' }, fx = m ? m[1] : '';
  const file = INDEX[key] || (FILES[name] ? name : FILES[name + (EXT[fx] || '')] ? name + EXT[fx] : null);
  if (file && FILES[file]) { this.status = 200; this.response = FILES[file].slice().buffer; this.h.fileid = file; } else this.status = 301;
};
self.onmessage = function (e) {
  const d = e.data; if (!d || !d.boot) return;
  const raw = new Uint8Array(d.raw); d.head.files.forEach(function (f) { FILES[f[0]] = raw.subarray(d.base + f[1], d.base + f[1] + f[2]); }); INDEX = d.head.index;
  self.Module = { wasmBinary: FILES['swiftlatexpdftex.wasm'] };
  importScripts(URL.createObjectURL(new Blob([FILES['swiftlatexpdftex.js']], { type: 'text/javascript' })));
};`;
let TEX = null;
async function gunzip(u8) {
  if (typeof DecompressionStream === 'undefined') throw new Error(tl('Browser ini belum mendukung dekompresi bawaan; gunakan Chrome, Edge, atau Safari terbaru.', 'This browser lacks built-in decompression; use a recent Chrome, Edge, or Safari.'));
  return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
}
async function texEngine() {
  if (TEX) return TEX.ready;
  TEX = {};
  TEX.ready = (async () => {
    const el = document.getElementById('tex-bundle');
    if (!el || el.textContent.length < 1000) throw new Error(tl('Mesin LaTeX tidak tersedia di aplikasi ini. Unduh versi LaTeX (.zip) lalu kompilasi di Overleaf.', 'The LaTeX engine is not available in this app. Download the LaTeX version (.zip) and compile it on Overleaf.'));
    const b = atob(el.textContent.trim()), gz = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) gz[i] = b.charCodeAt(i);
    const raw = await gunzip(gz), hl = new DataView(raw.buffer, raw.byteOffset, 4).getUint32(0, true);
    const head = JSON.parse(new TextDecoder().decode(raw.subarray(4, 4 + hl)));
    const w = new Worker(URL.createObjectURL(new Blob([TEX_BOOT], { type: 'text/javascript' })));
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(tl('Mesin LaTeX tidak merespons.', 'The LaTeX engine did not respond.'))), 60000);
      w.onmessage = ev => { if (ev.data && ev.data.result === 'ok') { clearTimeout(timer); resolve(); } };
      w.onerror = ev => { clearTimeout(timer); reject(new Error(ev.message || 'LaTeX worker')); };
      w.postMessage({ boot: true, raw: raw.buffer, base: 4 + hl, head }, [raw.buffer]);
    });
    TEX.worker = w; TEX.queue = Promise.resolve();
    return TEX;
  })();
  TEX.ready.catch(() => { TEX = null; });
  return TEX.ready;
}
const texError = log => { const L = String(log || '').split('\n'), i = L.findIndex(l => l.startsWith('!')); return i < 0 ? tl('Kompilasi LaTeX gagal.', 'LaTeX compilation failed.') : L.slice(i, i + 3).join(' ').slice(0, 300); };
async function texCompile(mainTex, assets) {
  const T = await texEngine();
  const job = T.queue.then(() => new Promise((resolve, reject) => {
    const w = T.worker, timer = setTimeout(() => reject(new Error(tl('Kompilasi LaTeX terlalu lama.', 'LaTeX compilation took too long.'))), 120000);
    w.onmessage = ev => {
      const d = ev.data; if (!d || d.cmd !== 'compile') return;
      clearTimeout(timer);
      if (d.result === 'ok' && d.pdf) resolve({ pdf: new Uint8Array(d.pdf), log: d.log }); else reject(Object.assign(new Error(texError(d.log)), { log: d.log }));
    };
    w.postMessage({ cmd: 'flushcache' });
    (assets || []).forEach(a => w.postMessage({ cmd: 'writefile', url: a.name, src: a.data }));
    w.postMessage({ cmd: 'writefile', url: 'main.tex', src: /\\(nonstopmode|batchmode)/.test(mainTex.slice(0, 600)) ? mainTex : '\\nonstopmode\n' + mainTex });
    w.postMessage({ cmd: 'setmainfile', url: 'main.tex' });
    w.postMessage({ cmd: 'compilelatex' });
  }));
  T.queue = job.catch(() => {});
  return job;
}
/* ---- static equations rendered at build time with LaTeX (SVG with glyph outlines) */
const EQS = __EQS__;
const eqv = (k, lang) => { const e = EQS[k], v = e[lang || I18N.lang] || e.en; return typeof v === 'string' ? e[v] : v; };
const eqDataURL = v => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(v.svg)));
async function eqPngs(keys, lang, scale, color) { const out = {}; for (const k of keys) { const v = eqv(k, lang); out[k] = Object.assign({ w: v.w, h: v.h }, { png: (await svgToPng(color ? v.svg.split('rgb(0%, 0%, 0%)').join(color) : v.svg, scale || 4, true)).bytes }); } return out; }
