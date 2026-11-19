/* ================================================================ look and feel: generated misty landscape behind the glass UI, home hero */
function sceneSVG(dark) {
  const W = 1600, H = 1000, cx = W / 2;
  const ridge = (base, amp, f, ph, rough, edge) => { let d = `M0,${H} L0,${base}`; for (let x = 0; x <= W; x += 14) { const e = (x - cx) / cx, y = base - amp * (0.55 * Math.sin(x * f + ph) + 0.28 * Math.sin(x * f * 2.17 + ph * 1.9) + 0.12 * Math.sin(x * f * 4.9 + ph * 0.7) + rough * Math.sin(x * f * 11.3 + ph * 2.3)) - edge * e * e; d += ` L${x},${y.toFixed(1)}`; } return d + ` L${W},${H} Z`; };
  const P = dark
    ? { sky: ['#04060c', '#0b1122', '#142039'], sun: 'rgba(130,160,235,0.26)', mist: 'rgba(110,135,190,0.13)', haze: 'rgba(125,150,205,0.20)', layers: [['#1a2336', '#1f2a40'], ['#18213a', '#1d2840'], ['#172036', '#1c263b'], ['#111827', '#151d2d'], ['#0a0f19', '#0e1420']] }
    : { sky: ['#ebe9e4', '#f4f1e9', '#efebe1'], sun: 'rgba(255,253,246,0.95)', mist: 'rgba(255,255,255,0.62)', haze: 'rgba(255,253,247,0.75)', layers: [['#dcd9cd', '#e4e1d6'], ['#cbcab4', '#d6d4c3'], ['#b3b893', '#c3c6a8'], ['#959f70', '#a9b187'], ['#76845a', '#8a9668']] };
  const L = [[560, 60, 0.0028, 1.3, 0.05, -10], [615, 72, 0.0035, 2.1, 0.06, 10], [688, 82, 0.0042, 0.4, 0.07, 40], [790, 105, 0.0030, 4.0, 0.08, 150], [905, 120, 0.0022, 5.1, 0.06, 330]];
  let defs = `<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset=".55" stop-color="${P.sky[1]}"/><stop offset="1" stop-color="${P.sky[2]}"/></linearGradient><radialGradient id="sn" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${P.sun}"/><stop offset="1" stop-color="${P.sun}" stop-opacity="0"/></radialGradient><filter id="bl" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="28"/></filter><filter id="bl2" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>`;
  let body = `<rect width="${W}" height="${H}" fill="url(#sk)"/><ellipse cx="${cx}" cy="520" rx="760" ry="380" fill="url(#sn)"/>`;
  L.forEach(([b, a, f, ph, r, e], i) => {
    defs += `<linearGradient id="r${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.layers[i][0]}"/><stop offset="1" stop-color="${P.layers[i][1]}"/></linearGradient>`;
    body += `<path d="${ridge(b, a, f, ph, r, e)}" fill="url(#r${i})"/>`;
    if (i < 4) body += `<ellipse cx="${cx + (i % 2 ? -160 : 180)}" cy="${b + 38}" rx="${880 - i * 60}" ry="${46 + i * 10}" fill="${i < 2 ? P.haze : P.mist}" filter="url(#bl)"/>`;
  });
  body += `<rect x="0" y="${H - 260}" width="${W}" height="260" fill="${P.mist}" filter="url(#bl2)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice"><defs>${defs}</defs>${body}</svg>`;
}
const isDarkNow = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); };
function applyScenery() {
  let el = document.getElementById('scenery'); if (!el) { el = document.createElement('div'); el.id = 'scenery'; el.setAttribute('aria-hidden', 'true'); document.body.prepend(el); }
  el.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(sceneSVG(isDarkNow()))}")`;
}
applyTheme = (f => t => { f(t); applyScenery(); })(applyTheme);
if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyScenery()); } catch (e) { /* older engines */ } }
const ICON_SEARCH = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12.6 12.6 17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_WIFI = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 8a11 11 0 0 1 15 0M5.2 10.8a7 7 0 0 1 9.6 0M7.9 13.6a3 3 0 0 1 4.2 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="16" r="1.2" fill="currentColor"/></svg>';
function heroWidgets() {
  const bars = [0.93, 0.88, 0.84, 0.79, 0.74, 0.69].map((v, i) => `<rect x="0" y="${i * 13}" width="${(v * 150).toFixed(0)}" height="8" rx="4" fill="${i < 2 ? '#d2405f' : 'var(--ink)'}" opacity="${i < 2 ? 1 : 0.82 - i * 0.08}"/>`).join('');
  const g = (m, s, h) => { let d = ''; for (let x = 0; x <= 160; x += 4) { const z = (x - m) / s; d += `${x ? ' L' : 'M'}${x},${(h - 26 * Math.exp(-0.5 * z * z)).toFixed(1)}`; } return d; };
  const ridges = [[96, 14, 30, '#d2405f'], [64, 16, 52, 'var(--ink-3)'], [112, 12, 74, '#d2405f']].map(([m, s, h, c]) => `<path d="${g(m, s, h)} L160,${h} L0,${h} Z" fill="${c}" opacity=".28"/><path d="${g(m, s, h)}" fill="none" stroke="${c}" stroke-width="1.6"/>`).join('') + '<line x1="40" x2="40" y1="0" y2="78" stroke="var(--ink-2)" stroke-dasharray="3 3"/>';
  const heat = [0.25, 0.55, 0.35, 0.8, 0.45, 0.6].map((v, i) => { const pos = [[0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [2, 3]][i]; return `<rect x="${pos[0] * 26}" y="${(pos[1] - 1) * 26}" width="23" height="23" rx="5" fill="#d2405f" opacity="${(0.15 + v * 0.75).toFixed(2)}"/>`; }).join('');
  const doc = '<rect x="0" y="0" width="160" height="78" rx="8" fill="var(--fill)"/><rect x="40" y="9" width="80" height="6" rx="3" fill="var(--ink)"/>' + [0, 1].map(c => [0, 1, 2, 3, 4].map(r => `<rect x="${10 + c * 74}" y="${24 + r * 10}" width="${c ? 64 - (r % 2) * 14 : 66 - (r % 3) * 10}" height="4" rx="2" fill="var(--ink-3)"/>`).join('')).join('');
  return { bars: `<svg viewBox="0 0 160 76">${bars}</svg>`, ridges: `<svg viewBox="0 0 160 78">${ridges}</svg>`, heat: `<svg viewBox="0 0 160 78"><g transform="translate(42,0)">${heat}</g></svg>`, doc: `<svg viewBox="0 0 160 78">${doc}</svg>` };
}
function heroHTML() {
  const w = heroWidgets(), dm = TEMPLATES.find(t => t.key === 'dm');
  return `<section class="hero2">
    <div class="hero2-eyebrow">${HOME_MARK}<span>${tl('PLS-SEM untuk semua orang', 'PLS-SEM for everyone')}</span><span class="dot" aria-hidden="true"></span><span class="ver">SEMbada ${APP_VERSION}</span></div>
    <h1><span>${tl('Ukur yang laten,', 'Measure the latent.')}</span><span>${tl('jelaskan jalurnya.', 'Explain the paths.')}</span></h1>
    <p class="lead">${tl('SEMbada mengestimasi model pengukuran dan model struktural dengan PLS-SEM yang setara paket R seminr, lalu menyajikan reliabilitas, validitas, koefisien jalur, dan hasil bootstrap sebagai grafik, tabel, serta draf makalah yang rapi. Semuanya tetap di komputer Anda.', 'SEMbada estimates measurement and structural models with PLS-SEM, matching the seminr R package, and presents reliability, validity, path coefficients, and bootstrap results as clear charts, tables, and well-organized paper drafts. Everything stays on your computer.')}</p>
    <div class="hero2-cta"><button class="btn btn-primary btn-big" data-action="home-new">${tl('Mulai proyek baru', 'Start a new project')}</button><button class="btn btn-big" data-action="home-sample">${tl('Coba data contoh', 'Try the sample data')}</button><button class="btn btn-quiet btn-big" data-action="open-project">${tl('Buka proyek', 'Open project')}</button></div>
    <ul class="hero2-facts"><li>${tl('Offline sepenuhnya', 'Fully offline')}</li><li>${tl('Setara paket R seminr', 'Matches the seminr R package')}</li><li>${tl('Makalah, slide, dan laporan', 'Papers, slides, and reports')}</li><li>${tl('Bahasa Indonesia dan Inggris', 'Indonesian and English')}</li></ul>
    <div class="hero2-stage" aria-hidden="true"><div class="mock"><div class="mock-notch"></div><div class="mock-bar"><span class="l">${HOME_MARK}SEMbada</span><span class="r">${ICON_SEARCH}${ICON_WIFI}<span>09:41</span></span></div>
      <div class="mock-body">
        <div class="widget wide"><h4><i></i>${tl('Model jalur', 'Path model')}</h4>${dm ? tplMini(dm) : ''}<div class="cap">${tl('Seret konstruk, sambungkan jalur, lalu hitung.', 'Drag constructs, connect paths, then calculate.')}</div></div>
        <div class="widget"><h4>Outer loadings</h4>${w.bars}</div>
        <div class="widget"><h4>${tl('Distribusi bootstrap', 'Bootstrap distributions')}</h4>${w.ridges}</div>
        <div class="widget"><h4>HTMT</h4>${w.heat}</div>
        <div class="widget"><h4>${tl('Draf makalah', 'Paper draft')}</h4>${w.doc}</div>
      </div></div></div>
  </section>`;
}
/* tapping outside a dialog (on its backdrop) closes it, which also helps on touch screens without an Esc key */
document.addEventListener('click', e => {
  const d = e.target; if (!d || d.tagName !== 'DIALOG' || !d.open) return;
  const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
});
/* phones: move to the top of the page on navigation and keep the active step and results section in view */
function toTop() { const m = $('#main'); if (m) m.scrollTop = 0; const se = document.scrollingElement; if (se && se.scrollTop) se.scrollTop = 0; }
function centerActive() {
  const fit = (box, el) => { if (!box || !el || box.scrollWidth <= box.clientWidth + 2) return; const b = box.getBoundingClientRect(), r = el.getBoundingClientRect(); box.scrollLeft += (r.left - b.left) - (box.clientWidth - r.width) / 2; };
  const rail = $('#rail'); fit(rail, rail && rail.querySelector('.step.active'));
  const rn = document.querySelector('.res-nav'); fit(rn, rn && rn.querySelector('button[aria-current="true"]'));
}
afterRender = (f => () => { f(); requestAnimationFrame(centerActive); })(afterRender);
/* the download menu opens on whichever side keeps it inside the screen (button on the right on desktop, on the left on phones) */
document.addEventListener('toggle', e => {
  const d = e.target; if (!d || d.id !== 'export-menu' || !d.open) return; const m = d.querySelector('.menu-pop'); if (!m) return;
  m.style.left = ''; m.style.right = ''; const r = m.getBoundingClientRect();
  if (r.left < 8) { m.style.left = '0'; m.style.right = 'auto'; } else if (r.right > innerWidth - 8) { m.style.right = '0'; m.style.left = 'auto'; }
}, true);
