"""How the bundled example datasets were prepared (data/samples.json).
Simulated datasets are generated with a fixed seed; the real datasets were read from the .rda files of the R packages seminr and cSEM with pyreadr.
Paths below point to the original working folders and may need adjusting.
"""
import json, numpy as np, pandas as pd
P = lambda k: pd.read_pickle(f'/tmp/ds/{k}.pkl')
def csv_of(df, dec=None):
    def f(v):
        if isinstance(v, str): return v
        if pd.isna(v): return ''
        if float(v).is_integer(): return str(int(v))
        return f'{v:.{dec or 4}f}'.rstrip('0').rstrip('.')
    return '\n'.join([','.join(df.columns)] + [','.join(f(v) for v in r) for r in df.itertuples(index=False)])
def sim(cons, paths, n, seed, scale=5, exo_r=0.45, grp=None):
    rng = np.random.default_rng(seed); names = [c for c, _ in cons]
    preds = {c: [(a, b) for a, t, b in paths if t == c] for c in names}; exo = [c for c in names if not preds[c]]
    C = np.full((len(exo), len(exo)), exo_r); np.fill_diagonal(C, 1); Z = rng.standard_normal((n, len(exo))) @ np.linalg.cholesky(C).T
    eta = {c: Z[:, i] for i, c in enumerate(exo)}; gender = np.where(rng.random(n) < 0.5, 'L', 'P'); rest = [c for c in names if c not in exo]
    while rest:
        for c in list(rest):
            if all(a in eta for a, _ in preds[c]):
                mu = np.zeros(n)
                for a, b in preds[c]: mu += (np.where(gender == 'P', grp[2], grp[3]) if grp and (a, c) == grp[:2] else b) * eta[a]
                e = mu + rng.standard_normal(n) * np.sqrt(max(1 - np.var(mu), 0.25)); eta[c] = (e - e.mean()) / e.std(); rest.remove(c)
    th = [-1.9, -1.1, -0.25, 0.85] if scale == 5 else [-2.1, -1.45, -0.85, -0.25, 0.45, 1.2]; cols = {}
    for c, m in cons:
        for j, l in enumerate(rng.uniform(0.76, 0.9, m)): cols[f'{c}{j + 1}'] = 1 + np.searchsorted(th, l * eta[c] + np.sqrt(1 - l * l) * rng.standard_normal(n))
    df = pd.DataFrame(cols); df['Gender'] = gender; return df
S = {}
S['tam'] = sim([('PEOU', 4), ('PU', 4), ('ATT', 3), ('BI', 3), ('AU', 3)], [('PEOU', 'PU', .55), ('PEOU', 'ATT', .30), ('PU', 'ATT', .45), ('PU', 'BI', .35), ('ATT', 'BI', .40), ('BI', 'AU', .55)], 240, 11, grp=('PU', 'BI', .55, .15))
S['utaut2'] = sim([('PE', 4), ('EE', 4), ('SI', 3), ('FC', 4), ('HM', 3), ('PV', 3), ('HT', 4), ('BI', 3), ('UB', 3)], [('PE', 'BI', .28), ('EE', 'BI', .10), ('SI', 'BI', .14), ('FC', 'BI', .08), ('HM', 'BI', .20), ('PV', 'BI', .12), ('HT', 'BI', .25), ('FC', 'UB', .15), ('HT', 'UB', .25), ('BI', 'UB', .38)], 320, 12, scale=7, exo_r=.35)
S['tpb'] = sim([('ATT', 4), ('SN', 3), ('PBC', 4), ('INT', 3), ('BEH', 3)], [('ATT', 'INT', .38), ('SN', 'INT', .20), ('PBC', 'INT', .25), ('PBC', 'BEH', .22), ('INT', 'BEH', .45)], 260, 13, exo_r=.35)
S['servqual'] = sim([('TAN', 4), ('REL', 5), ('RES', 4), ('ASR', 4), ('EMP', 5), ('SAT', 3), ('LOY', 3)], [('TAN', 'SAT', .10), ('REL', 'SAT', .30), ('RES', 'SAT', .20), ('ASR', 'SAT', .15), ('EMP', 'SAT', .18), ('SAT', 'LOY', .62)], 300, 14, exo_r=.4)
S['mobi'] = P('mobi')
cr = P('corp_rep_data').copy(); cr['servicetype'] = cr['servicetype'].map({1: 'prepaid', 2: 'contract'}); cr['serviceprovider'] = cr['serviceprovider'].map(lambda v: f'provider{int(v)}'); S['corprep'] = cr
S['bank'] = P('satisfaction_gender')
inf = P('influencer_data').copy(); inf['influencer_group'] = inf['influencer_group'].map(lambda v: f'group{int(v)}'); S['influencer'] = inf
S['yoo'] = P('Yooetal2000'); S['privacy'] = P('LancelotMiltgenetal2016')
FILES = {'tam': 'contoh_tam_simulasi.csv', 'utaut2': 'contoh_utaut2_simulasi.csv', 'tpb': 'contoh_tpb_simulasi.csv', 'servqual': 'contoh_servqual_simulasi.csv', 'mobi': 'ecsi_mobile_phone.csv', 'corprep': 'corporate_reputation.csv', 'bank': 'bank_satisfaction_gender.csv', 'influencer': 'influencer_marketing.csv', 'yoo': 'brand_equity_yoo2000.csv', 'privacy': 'privacy_location_tracker.csv'}
out = {k: {'file': FILES[k], 'csv': csv_of(df, 4)} for k, df in S.items()}
json.dump(out, open('samples.json', 'w'), separators=(',', ':'))
for k, df in S.items():
    num = df.select_dtypes('number')
    print(f'{k:<10} n={len(df):<5} cols={df.shape[1]:<3} text={[c for c in df.columns if c not in num.columns]} range={num.min().min():g}..{num.max().max():g}  KB={len(out[k]["csv"]) // 1024}')
print('total KB', sum(len(v['csv']) for v in out.values()) // 1024)
