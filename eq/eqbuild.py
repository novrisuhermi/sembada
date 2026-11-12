"""Render src/equations.json to SVG (for the app and slides) and OMML (for Word). Needs a TeX installation with dvisvgm and pandoc.
The result, eq/equations_out.json, is committed, so this script is only needed when an equation changes."""
# pre-render static equations: SVG (real pdflatex + pdftocairo, glyphs as paths) and OMML (pandoc), per language when needed
import json, subprocess, os, re, zipfile, sys
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
EQ = json.load(open(ROOT / 'src' / 'equations.json')); OUT = {}; W = str(ROOT / 'eq')
def variants(v): return v if isinstance(v, dict) else {'id': v, 'en': v}
jobs = [(k, lang, tex) for k, v in EQ.items() for lang, tex in variants(v).items()]
for k, lang, tex in jobs:
    name = f'{k}_{lang}'; src = '\\documentclass[border=1pt,12pt]{standalone}\n\\usepackage{amsmath,amssymb,bm}\n\\usepackage{mathptmx}\n\\begin{document}\n$\\displaystyle ' + tex + '$\n\\end{document}\n'
    open(f'{W}/{name}.tex', 'w').write(src)
    r = subprocess.run(['pdflatex', '-interaction=nonstopmode', '-halt-on-error', f'{name}.tex'], cwd=W, capture_output=True, text=True)
    if r.returncode: print('LATEX FAIL', name, r.stdout[-600:]); sys.exit(1)
    subprocess.run(['pdftocairo', '-svg', f'{name}.pdf', f'{name}.svg'], cwd=W, check=True)
    svg = open(f'{W}/{name}.svg').read()
    w, h = re.search(r'width="([\d.]+)(?:pt)?" height="([\d.]+)(?:pt)?"', svg).groups()
    OUT.setdefault(k, {})[lang] = {'tex': tex, 'svg': svg, 'w': float(w), 'h': float(h)}
md = '\n\n'.join(f'MARK{i}\n\n$$' + tex + '$$' for i, (k, lang, tex) in enumerate(jobs))
open(f'{W}/all.md', 'w').write(md); subprocess.run(['pandoc', f'{W}/all.md', '-o', f'{W}/all.docx'], check=True)
doc = zipfile.ZipFile(f'{W}/all.docx').read('word/document.xml').decode()
maths = re.findall(r'<m:oMathPara>.*?</m:oMathPara>', doc, re.S)
assert len(maths) == len(jobs), (len(maths), len(jobs))
for (k, lang, tex), m in zip(jobs, maths): OUT[k][lang]['omml'] = re.search(r'<m:oMath>.*</m:oMath>', m, re.S).group(0)

def fix_omml(x):
    def dpr(m):
        body = m.group(1); parts = {t: re.search(r'<m:%s [^>]*/>|<m:%s/>' % (t, t), body) for t in ('begChr', 'sepChr', 'endChr', 'grow', 'shp', 'ctrlPr')}
        return '<m:dPr>' + ''.join(parts[t].group(0) for t in ('begChr', 'sepChr', 'endChr', 'grow', 'shp') if parts[t]) + '</m:dPr>'
    x = re.sub(r'<m:dPr>(.*?)</m:dPr>', dpr, x, flags=re.S)
    x = re.sub(r'(<m:rPr>(?:(?!</m:rPr>).)*?<m:nor/>(?:(?!</m:rPr>).)*?)<m:sty m:val="[a-z]+"/>', r'\1', x, flags=re.S)
    x = re.sub(r'(<m:rPr>(?:(?!</m:rPr>).)*?)<m:sty m:val="[a-z]+"/>((?:(?!</m:rPr>).)*?<m:nor/>)', r'\1\2', x, flags=re.S)
    x = re.sub(r'<m:count [^>]*/>', '', x)
    return x

for k in OUT:
    for lang in OUT[k]: OUT[k][lang]['omml'] = fix_omml(OUT[k][lang]['omml'])
json.dump(OUT, open(f'{W}/equations_out.json', 'w'))
print('equations:', len(EQ), 'variants:', len(jobs), 'svg KB:', sum(len(v['svg']) for d in OUT.values() for v in d.values()) // 1024, 'omml KB:', sum(len(v['omml']) for d in OUT.values() for v in d.values()) // 1024)
