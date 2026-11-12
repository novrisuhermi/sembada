/* ================================================================ i18n (Bahasa Indonesia / English) */
const I18N = { lang: 'en' };
const tl = (id, en) => (I18N.lang === 'en' ? en : id);
const LOC = () => (I18N.lang === 'en' ? 'en-GB' : 'id-ID');
// run fn in another language (used for exports); English output always uses a decimal point
function withLang(lang, fn) {
  const pl = I18N.lang, pc = state.view.comma;
  I18N.lang = lang; if (lang === 'en') state.view.comma = false;
  try { return fn(); } finally { I18N.lang = pl; state.view.comma = pc; }
}
const MSG_EN = {
  'File tidak berisi data.': 'The file contains no data.',
  'Bukan file .xlsx yang valid (struktur zip tidak ditemukan).': 'This is not a valid .xlsx file (zip structure not found).',
  'Bukan file Excel .xlsx (workbook.xml tidak ada). Jika file .xls lama, simpan ulang sebagai .xlsx atau CSV.': 'This is not an Excel .xlsx file (workbook.xml is missing). For an old .xls file, save it again as .xlsx or CSV.',
  'Sheet tidak dapat dibaca.': 'The sheet could not be read.',
  'Metode kompresi .xlsx tidak didukung.': 'This .xlsx compression method is not supported.',
  'Terlalu banyak sampel bootstrap yang gagal diestimasi.': 'Too many bootstrap samples could not be estimated.',
  'Jumlah observasi terlalu sedikit.': 'There are too few observations.'
};
const trMsg = m => (I18N.lang === 'en' && MSG_EN[m]) || m;
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const pow10 = k => '10' + String(-k).split('').map(c => SUP[c] || c).join('');
