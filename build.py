"""Build SEMbada into one self-contained HTML file: app/SEMbada_PLS-SEM.html.

Usage:  python3 build.py   (Python 3.9+, standard library only)
It also writes build/app.js (the bundled application script) and build/desktop/index.html (the page used for the desktop builds).
"""
import base64, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent; W = ROOT; S = ROOT / 'src'; V = ROOT / 'vendor'
engine = (S / 'engine.js').read_text()
io = (S / 'io.js').read_text()
old = "cols.push({ name, values, numeric: nText === 0 && !allEmpty, nMissing, nText, firstText, texts: nText ? texts.slice(0, 200) : null });"
new = "cols.push({ name, values, numeric: nText === 0 && !allEmpty, nMissing, nText, firstText, raw: nText || allEmpty ? body.map(r => (r[j] === null || r[j] === undefined ? '' : String(r[j]))) : null });"
assert old in io; io = io.replace(old, new)
extra_css = """
.btn-link { background: none; border: 0; padding: 0; color: inherit; font: inherit; font-weight: 600; text-decoration: underline; text-decoration-color: var(--rule); text-decoration-thickness: 2px; text-underline-offset: 3px; cursor: pointer; text-align: left; }
.btn-link:hover { text-decoration-color: var(--dropout); }
pre.code { background: var(--sheet); border: 1px solid var(--line); padding: 12px 14px; border-radius: var(--r); overflow: auto; font-family: ui-monospace, "Cascadia Mono", Consolas, "Liberation Mono", monospace; font-size: 12.5px; line-height: 1.55; margin: 0; max-width: 100%; }
code { font-family: ui-monospace, Consolas, monospace; font-size: .92em; background: var(--sheet); padding: 0 4px; border-radius: 3px; }
.refs { padding-left: 18px; font-size: var(--fs-sm); color: var(--ink-2); max-width: 95ch; }
.refs li { margin-bottom: 4px; }
.top-actions .btn svg { width: 17px; height: 17px; }
.figure.chart svg { min-width: 0; }
.steps-list li > span { display: block; }
"""
css = ((ROOT / 'fonts' / 'inter_faces.css').read_text() + (S / 'app.css').read_text() + (S / 'app_glass.css').read_text()) + extra_css
fonts = ''.join("@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:%d;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');}" % (w, base64.b64encode((ROOT / 'fonts' / f'plus-jakarta-sans-latin-{w}-normal.woff2').read_bytes()).decode()) for w in (400, 600, 700))
import json as _json
app = "(function () {\n'use strict';\n" + (S / 'app_i18n.js').read_text() + "\n" + (S / 'app_core.js').read_text() + "\n" + (S / 'app_results.js').read_text() + "\n" + (S / 'app_export.js').read_text() + "\n" + (S / 'app_tex.js').read_text() + "\n" + (S / 'app_paper.js').read_text() + "\n" + (S / 'app_slides.js').read_text() + "\n" + (S / 'app_ext.js').read_text() + "\n" + (S / 'app_viz.js').read_text() + "\n" + (S / 'app_dgstyle.js').read_text() + "\n" + (S / 'app_look.js').read_text() + "\n" + (S / 'app_home.js').read_text() + "\n" + (S / 'app_main.js').read_text() + "\n})();\n"
app = app.replace('__NL_LICENSE__', _json.dumps((V / 'licenses' / 'nl_license.txt').read_text().strip()))
G = V / 'licenses'
jz = (V / 'licenses' / 'jszip_LICENSE.markdown').read_text().split('GPL version 3')[0].strip()
app = app.replace('__LIB_LICENSES__', _json.dumps(['docx (Dolan Miu)\n\n' + (G / 'docx_LICENSE.txt').read_text().strip(), 'PptxGenJS (Brent Ely)\n\n' + (G / 'pptxgenjs_LICENSE.txt').read_text().strip(), 'JSZip\n\n' + jz, 'SwiftLaTeX (pdfTeX WebAssembly engine)\n\n' + (V / 'swiftlatex' / 'LICENSE_swiftlatex.txt').read_text().strip(), 'TeX components bundled with the LaTeX engine\n\npdfTeX is free software under the GNU General Public License, version 2 or later. The LaTeX kernel and macro packages from TeX Live are distributed under the LaTeX Project Public License 1.3c or other free licenses stated in each file. Fonts: URW Nimbus Roman, Nimbus Sans and Standard Symbols (GNU AGPL with font exception), Computer Modern and AMS Type 1 fonts (SIL Open Font License). Sources: https://www.tug.org/texlive/ and https://github.com/SwiftLaTeX/SwiftLaTeX']))
eqo = _json.load(open(ROOT / 'eq' / 'equations_out.json'))
EQS = {k: ({'en': v['en'], 'id': 'en'} if v['id']['svg'] == v['en']['svg'] else v) for k, v in eqo.items()}
for k in EQS:
    for l in ('en', 'id'):
        if isinstance(EQS[k][l], dict): EQS[k][l] = {kk: EQS[k][l][kk] for kk in ('tex', 'svg', 'w', 'h')}
app = app.replace('__EQS__', _json.dumps(EQS, separators=(',', ':')))
TEXB = (V / 'swiftlatex' / 'bundle.b64'); tex_bundle = TEXB.read_text() if TEXB.exists() else ''
lib_docx = (V / 'docx.min.js').read_text(); lib_pptx = (V / 'pptx.bundle.js').read_text()
assert '</script' not in lib_docx.lower() and '</script' not in lib_pptx.lower()
(ROOT / 'build').mkdir(exist_ok=True); (ROOT / 'build' / 'app.js').write_text(app)
sample = (ROOT / 'data' / 'sample.csv').read_text().strip()
samples = (ROOT / 'data' / 'samples.json').read_text().strip()
brand = '<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><rect x="1" y="4" width="6" height="3" fill="var(--ink)"/><rect x="1" y="13.5" width="6" height="3" fill="var(--ink)"/><rect x="1" y="23" width="6" height="3" fill="var(--ink)"/><circle cx="19.5" cy="15" r="9.3" fill="none" stroke="var(--dropout)" stroke-width="1.8"/><circle cx="19.5" cy="15" r="5.6" fill="var(--ink)"/></svg>'
theme_icon = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 2.8a7.2 7.2 0 0 1 0 14.4z" fill="currentColor"/></svg>'
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="SEMbada: aplikasi PLS-SEM portabel satu file. PLS, PLSc, bootstrapping, PLSpredict, berjalan offline di browser.">
<title>SEMbada: PLS-SEM portabel</title>
<style id="app-css">{fonts}
{css}</style>
</head>
<body>
<div id="app">
  <header class="topbar">
    <div class="brand">{brand}<span class="brand-name">SEMbada</span><span class="brand-sub">PLS-SEM portabel</span></div>
    <input id="project-name" class="project-name" type="text" aria-label="Nama proyek" maxlength="80" spellcheck="false">
    <div class="top-actions">
      <button class="btn btn-quiet" data-action="open-project">Buka<span class="long"> proyek</span></button>
      <button class="btn btn-quiet" data-action="save-project">Simpan<span class="long"> proyek</span></button>
      <button class="btn btn-quiet" data-action="help">Panduan</button>
      <button class="btn btn-quiet" data-action="theme" aria-label="Ganti tema terang atau gelap" title="Ganti tema">{theme_icon}</button>
    </div>
  </header>
  <nav class="rail" id="rail" aria-label="Langkah analisis"></nav>
  <main id="main" tabindex="-1"></main>
</div>
<div id="toasts" aria-live="polite"></div>
<dialog id="help" aria-labelledby="help-title"><div class="dlg-h"><h2 id="help-title">Panduan</h2><button class="btn btn-quiet" data-action="close-help">Tutup</button></div><div class="dlg-b" id="help-body"></div></dialog>
<dialog id="settings" aria-labelledby="settings-title"><div class="dlg-h"><h2 id="settings-title">Pengaturan</h2><button class="btn btn-quiet" data-action="close-settings">Tutup</button></div><div class="dlg-b" id="settings-body"></div></dialog>
<input type="file" id="file-input" accept=".xlsx,.xlsm,.csv,.tsv,.txt,.json" hidden>
<input type="file" id="project-input" accept=".json" hidden>
<script type="text/plain" id="lib-docx">{lib_docx}</script>
<script type="text/plain" id="tex-bundle">{tex_bundle}</script>
<script type="text/plain" id="lib-pptx">{lib_pptx}</script>
<script type="text/plain" id="sample-data">
{sample}
</script>
<script type="application/json" id="sample-sets">{samples}</script>
<script>
{engine}
</script>
<script>
{io}
</script>
<script>
{app}
</script>
</body>
</html>
"""
for part in (engine, io, app, sample, samples):
    assert '</script' not in part.lower()
assert '</style' not in css.lower()
out = (ROOT / 'app' / 'SEMbada_PLS-SEM.html')
out.write_text(html)
print('written', out, len(html.encode()) // 1024, 'KB')

desk = html.replace('<script>\n' + engine, '<script src="/js/neutralino.js"></script>\n<script>\n' + engine, 1)
assert desk != html
D = ROOT / 'build' / 'desktop'; D.mkdir(parents=True, exist_ok=True); (D / 'index.html').write_text(desk)
print('desktop index written', len(desk.encode()) // 1024, 'KB')
