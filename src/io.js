/* SEMbada I/O: CSV parsing, XLSX reading/writing without external libraries. */
const IO = (function () {
  'use strict';

  // ------------------------------------------------------------ CSV / TSV
  function detectDelimiter(text) {
    const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim()).slice(0, 30);
    let best = ',', bestScore = -1;
    for (const d of [',', ';', '\t', '|']) {
      const counts = lines.map(l => { let c = 0, q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === d && !q) c++; } return c; });
      if (!counts.length || counts[0] === 0) continue;
      const same = counts.filter(c => c === counts[0]).length / counts.length;
      const score = same * 100 + counts[0];
      if (score > bestScore) { bestScore = score; best = d; }
    }
    return best;
  }
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const delim = detectDelimiter(text), rows = [];
    let row = [], cell = '', q = false, i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i += 2; continue; } q = false; i++; continue; }
        cell += ch; i++; continue;
      }
      if (ch === '"' && cell === '') { q = true; i++; continue; }
      if (ch === delim) { row.push(cell); cell = ''; i++; continue; }
      if (ch === '\r' || ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; if (ch === '\r' && text[i + 1] === '\n') i++; i++; continue; }
      cell += ch; i++;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    const clean = rows.filter(r => r.some(c => String(c).trim() !== ''));
    // decimal comma: delimiter is not a comma and numeric-looking cells use a comma
    let commaNum = 0, dotNum = 0;
    if (delim !== ',') for (const r of clean.slice(1, 200)) for (const c of r) { const t = c.trim(); if (/^-?\d+,\d+$/.test(t)) commaNum++; else if (/^-?\d+\.\d+$/.test(t)) dotNum++; }
    return { rows: clean, delimiter: delim, decimalComma: commaNum > dotNum };
  }

  // ------------------------------------------------------------ cell → number
  const MISSING = new Set(['', 'na', 'n/a', 'nan', 'null', '-', '.', '?', '#n/a', 'missing']);
  function toNumber(v, decimalComma) {
    if (v === null || v === undefined) return { missing: true };
    if (typeof v === 'number') return Number.isFinite(v) ? { num: v } : { missing: true };
    if (typeof v === 'boolean') return { num: v ? 1 : 0 };
    let t = String(v).trim();
    if (MISSING.has(t.toLowerCase())) return { missing: true };
    if (decimalComma) t = t.replace(',', '.');
    if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return { num: parseFloat(t) };
    return { text: String(v) };
  }
  // rows (array of arrays, first row header) → column objects
  function rowsToColumns(rows, decimalComma) {
    if (!rows.length) throw new Error('File tidak berisi data.');
    const width = Math.max(...rows.map(r => r.length));
    const header = rows[0], body = rows.slice(1).filter(r => r.some(c => c !== null && c !== undefined && String(c).trim() !== ''));
    const used = new Map(), cols = [];
    for (let j = 0; j < width; j++) {
      let name = header[j] === undefined || header[j] === null ? '' : String(header[j]).trim();
      if (!name) name = 'Kolom_' + (j + 1);
      if (used.has(name)) { const k = used.get(name) + 1; used.set(name, k); name = name + '_' + k; } else used.set(name, 1);
      const values = new Array(body.length), texts = [];
      let nMissing = 0, nText = 0, firstText = null;
      for (let i = 0; i < body.length; i++) {
        const r = toNumber(body[i][j], decimalComma);
        if (r.missing) { values[i] = NaN; nMissing++; }
        else if (r.text !== undefined) { values[i] = NaN; nText++; if (firstText === null) firstText = { row: i + 2, value: r.text }; texts.push(r.text); }
        else values[i] = r.num;
      }
      const allEmpty = nMissing === body.length;
      cols.push({ name, values, numeric: nText === 0 && !allEmpty, nMissing, nText, firstText, texts: nText ? texts.slice(0, 200) : null });
    }
    // drop entirely empty trailing columns named Kolom_n
    const keep = cols.filter(c => !(c.nMissing === body.length && /^Kolom_\d+$/.test(c.name)));
    return { columns: keep, nRows: body.length };
  }

  // ------------------------------------------------------------ inflate (RFC 1951) fallback
  function inflateRaw(src, sizeHint) {
    let pos = 0, bitbuf = 0, bitcnt = 0, out = new Uint8Array(Math.max(sizeHint || 0, src.length * 4, 1024)), olen = 0;
    const bits = n => { while (bitcnt < n) { if (pos >= src.length) throw new Error('inflate: data terpotong'); bitbuf |= src[pos++] << bitcnt; bitcnt += 8; } const v = bitbuf & ((1 << n) - 1); bitbuf >>>= n; bitcnt -= n; return v; };
    const ensure = n => { if (olen + n > out.length) { const o2 = new Uint8Array(Math.max(out.length * 2, olen + n)); o2.set(out.subarray(0, olen)); out = o2; } };
    const build = (len, n) => { const counts = new Uint16Array(16), offs = new Uint16Array(16), symbols = new Uint16Array(n); for (let i = 0; i < n; i++) counts[len[i]]++; counts[0] = 0; for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + counts[i - 1]; for (let i = 0; i < n; i++) if (len[i]) symbols[offs[len[i]]++] = i; return { counts, symbols }; };
    const decode = h => { let code = 0, first = 0, index = 0; for (let l = 1; l < 16; l++) { code |= bits(1); const c = h.counts[l]; if (code - c < first) return h.symbols[index + (code - first)]; index += c; first += c; first <<= 1; code <<= 1; } throw new Error('inflate: kode tidak valid'); };
    const LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    const DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    const codes = (lc, dc) => { for (;;) { let s = decode(lc); if (s < 256) { ensure(1); out[olen++] = s; } else if (s === 256) return; else { s -= 257; if (s >= 29) throw new Error('inflate: panjang tidak valid'); const len = LB[s] + bits(LE[s]); const ds = decode(dc); if (ds >= 30) throw new Error('inflate: jarak tidak valid'); const dist = DB[ds] + bits(DE[ds]); if (dist > olen) throw new Error('inflate: jarak terlalu jauh'); ensure(len); for (let k = 0; k < len; k++) { out[olen] = out[olen - dist]; olen++; } } } };
    let fixed = null; const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    let last;
    do {
      last = bits(1); const type = bits(2);
      if (type === 0) { bitbuf = 0; bitcnt = 0; const len = src[pos] | (src[pos + 1] << 8); pos += 4; ensure(len); out.set(src.subarray(pos, pos + len), olen); olen += len; pos += len; }
      else if (type === 1) { if (!fixed) { const l = new Uint8Array(288); for (let i = 0; i < 288; i++) l[i] = i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8; fixed = [build(l, 288), build(new Uint8Array(30).fill(5), 30)]; } codes(fixed[0], fixed[1]); }
      else if (type === 2) {
        const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4, cl = new Uint8Array(19);
        for (let i = 0; i < ncode; i++) cl[ORDER[i]] = bits(3);
        const lencode = build(cl, 19), ll = new Uint8Array(nlen + ndist); let idx = 0;
        while (idx < nlen + ndist) { const s = decode(lencode); if (s < 16) ll[idx++] = s; else { let v = 0, rep; if (s === 16) { if (!idx) throw new Error('inflate: ulangan tanpa nilai'); v = ll[idx - 1]; rep = 3 + bits(2); } else if (s === 17) rep = 3 + bits(3); else rep = 11 + bits(7); while (rep--) ll[idx++] = v; } }
        codes(build(ll.slice(0, nlen), nlen), build(ll.slice(nlen), ndist));
      } else throw new Error('inflate: tipe blok tidak valid');
    } while (!last);
    return out.slice(0, olen);
  }
  async function inflate(data, size) {
    if (typeof DecompressionStream !== 'undefined') {
      try {
        const ds = new DecompressionStream('deflate-raw');
        const buf = await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer();
        return new Uint8Array(buf);
      } catch (e) { /* fall back */ }
    }
    return inflateRaw(data, size);
  }

  // ------------------------------------------------------------ ZIP read
  async function unzip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf);
    let eocd = -1; for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('Bukan file .xlsx yang valid (struktur zip tidak ditemukan).');
    const count = dv.getUint16(eocd + 10, true); let off = dv.getUint32(eocd + 16, true);
    const files = {}, dec = new TextDecoder();
    for (let e = 0; e < count; e++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), usize = dv.getUint32(off + 24, true);
      const nlen = dv.getUint16(off + 28, true), xlen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true), loff = dv.getUint32(off + 42, true);
      const name = dec.decode(u8.subarray(off + 46, off + 46 + nlen));
      files[name] = { method, csize, usize, loff };
      off += 46 + nlen + xlen + clen;
    }
    return {
      names: Object.keys(files),
      async read(name) {
        const f = files[name]; if (!f) return null;
        const ln = dv.getUint16(f.loff + 26, true), lx = dv.getUint16(f.loff + 28, true), start = f.loff + 30 + ln + lx;
        const raw = u8.subarray(start, start + f.csize);
        const data = f.method === 0 ? raw : f.method === 8 ? await inflate(raw, f.usize) : null;
        if (!data) throw new Error('Metode kompresi .xlsx tidak didukung.');
        return dec.decode(data);
      }
    };
  }

  // ------------------------------------------------------------ XLSX read (DOMParser)
  function colIndex(ref) { let c = 0; for (const ch of ref) { const k = ch.charCodeAt(0); if (k >= 65 && k <= 90) c = c * 26 + (k - 64); else if (k >= 97 && k <= 122) c = c * 26 + (k - 96); else break; } return c - 1; }
  const byTag = (node, tag) => Array.from(node.getElementsByTagNameNS ? node.getElementsByTagNameNS('*', tag) : node.getElementsByTagName(tag));
  function textOf(node) { // concatenated <t> text (rich text runs), ignoring phonetic runs
    const ts = byTag(node, 't').filter(t => !(t.parentNode && t.parentNode.localName === 'rPh'));
    return ts.map(t => t.textContent).join('');
  }
  async function readXLSX(buf) {
    const z = await unzip(buf), P = new DOMParser();
    const xml = async n => { const s = await z.read(n); return s === null ? null : P.parseFromString(s, 'application/xml'); };
    const wb = await xml('xl/workbook.xml'); if (!wb) throw new Error('Bukan file Excel .xlsx (workbook.xml tidak ada). Jika file .xls lama, simpan ulang sebagai .xlsx atau CSV.');
    const rels = await xml('xl/_rels/workbook.xml.rels'), relMap = {};
    if (rels) byTag(rels, 'Relationship').forEach(r => { relMap[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const sstDoc = await xml('xl/sharedStrings.xml'); const sst = sstDoc ? byTag(sstDoc, 'si').map(textOf) : [];
    const sheets = [];
    for (const s of byTag(wb, 'sheet')) {
      const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let target = relMap[rid] || ''; if (!target) continue;
      target = target.replace(/^\//, ''); if (!target.startsWith('xl/')) target = 'xl/' + target;
      sheets.push({ name: s.getAttribute('name'), path: target });
    }
    return {
      sheetNames: sheets.map(s => s.name),
      async sheet(i) {
        const doc = await xml(sheets[i].path); if (!doc) throw new Error('Sheet tidak dapat dibaca.');
        const rows = [];
        byTag(doc, 'row').forEach((r, ri) => {
          const rn = parseInt(r.getAttribute('r'), 10); const idx = Number.isFinite(rn) ? rn - 1 : ri;
          const row = rows[idx] = rows[idx] || [];
          let auto = 0;
          Array.from(r.children).filter(c => c.localName === 'c').forEach(c => {
            const ref = c.getAttribute('r'); const ci = ref ? colIndex(ref) : auto; auto = ci + 1;
            const t = c.getAttribute('t'); const vEl = Array.from(c.children).find(x => x.localName === 'v');
            let val = null;
            if (t === 's') val = vEl ? sst[parseInt(vEl.textContent, 10)] : null;
            else if (t === 'inlineStr') val = textOf(c);
            else if (t === 'str') val = vEl ? vEl.textContent : null;
            else if (t === 'b') val = vEl ? vEl.textContent === '1' : null;
            else if (t === 'e') val = null;
            else val = vEl && vEl.textContent !== '' ? Number(vEl.textContent) : null;
            row[ci] = val;
          });
        });
        const out = []; for (let i = 0; i < rows.length; i++) out.push(rows[i] || []);
        while (out.length && out[0].every(v => v === null || v === undefined || String(v).trim() === '')) out.shift();
        return out;
      }
    };
  }

  // ------------------------------------------------------------ ZIP write (stored) + XLSX write
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zipStore(files) {
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    for (const f of files) {
      const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
      h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + data.length;
    }
    const csize = central.reduce((s, x) => s + x.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
    const all = parts.concat(central, [new Uint8Array(e.buffer)]), total = all.reduce((s, x) => s + x.length, 0), out = new Uint8Array(total);
    let p = 0; for (const x of all) { out.set(x, p); p += x.length; }
    return out;
  }
  const xmlEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  function colName(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  // sheets: [{name, rows: [[cell]]}] cell = number | string | null | {v, bold, fmt}
  function writeXLSX(sheets) {
    const used = new Set();
    const names = sheets.map((s, i) => { let n = String(s.name || 'Sheet' + (i + 1)).replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31).trim() || 'Sheet' + (i + 1); let base = n, k = 2; while (used.has(n.toLowerCase())) { const suf = ' (' + k++ + ')'; n = base.slice(0, 31 - suf.length) + suf; } used.add(n.toLowerCase()); return n; });
    const files = [];
    files.push({ name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + names.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>' });
    files.push({ name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' });
    files.push({ name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + names.map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>' });
    files.push({ name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + names.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + `<Relationship Id="rId${names.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` });
    files.push({ name: 'xl/styles.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.000"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' });
    sheets.forEach((s, si) => {
      const widths = [];
      const rowsXml = s.rows.map((r, ri) => '<row r="' + (ri + 1) + '">' + r.map((cell, ci) => {
        const ref = colName(ci) + (ri + 1); let v = cell, bold = false;
        if (cell && typeof cell === 'object') { v = cell.v; bold = !!cell.bold; }
        if (v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v))) return '';
        const len = typeof v === 'number' ? 8 : String(v).length; widths[ci] = Math.min(60, Math.max(widths[ci] || 6, len + 2));
        if (typeof v === 'number') return `<c r="${ref}" s="${bold ? 1 : 2}"><v>${v}</v></c>`;
        return `<c r="${ref}" t="inlineStr"${bold ? ' s="1"' : ''}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
      }).join('') + '</row>').join('');
      const colsXml = widths.length ? '<cols>' + widths.map((w, i) => w ? `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>` : '').join('') + '</cols>' : '';
      files.push({ name: `xl/worksheets/sheet${si + 1}.xml`, data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + colsXml + '<sheetData>' + rowsXml + '</sheetData></worksheet>' });
    });
    return zipStore(files);
  }

  return { parseCSV, rowsToColumns, readXLSX, writeXLSX, zipStore, unzip, inflateRaw, crc32, toNumber };
})();
if (typeof module !== 'undefined') module.exports = IO;
