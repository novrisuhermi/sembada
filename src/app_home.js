/* ================================================================ home, research info, model templates, recent projects, citation, advanced-analysis controls */
const T_ = (key, en, id, den, did, pre, items) => ({ key, en, id, den, did, pre: pre || [], items: items || null });
const R_ = (p, a, b) => Array.from({ length: b - a + 1 }, (_, i) => p + (a + i));
const TEMPLATES = [
  { key: 'dm', kind: 'theory', refs: ['delone2003'], sample: 'dm', data: { real: false, n: 150 }, name: { en: 'IS Success Model (DeLone & McLean)', id: 'Model Kesuksesan SI (DeLone & McLean)' }, src: 'DeLone & McLean (2003)',
    desc: { en: 'Information, system, and service quality drive use and user satisfaction, which produce net benefits.', id: 'Kualitas informasi, sistem, dan layanan memengaruhi penggunaan dan kepuasan pengguna, yang menghasilkan manfaat bersih.' },
    cons: [T_('IQ', 'Information Quality', 'Kualitas Informasi', 'The desirable characteristics of the system outputs, such as accuracy, relevance, completeness, and timeliness.', 'Karakteristik yang diharapkan dari keluaran sistem, seperti akurasi, relevansi, kelengkapan, dan ketepatan waktu.', ['IQ', 'KI'], R_('IQ', 1, 4)),
      T_('SQ', 'System Quality', 'Kualitas Sistem', 'The desirable characteristics of the information system itself, such as ease of use, reliability, and response time.', 'Karakteristik yang diharapkan dari sistem informasi itu sendiri, seperti kemudahan penggunaan, keandalan, dan waktu respons.', ['SQ', 'KS'], R_('SQ', 1, 4)),
      T_('SVQ', 'Service Quality', 'Kualitas Layanan', 'The quality of the support that users receive from the system provider or IT support staff.', 'Kualitas dukungan yang diterima pengguna dari penyedia sistem atau staf dukungan TI.', ['SVQ', 'SV', 'KL'], R_('SV', 1, 4)),
      T_('ITU', 'Intention to Use', 'Niat Menggunakan', 'The degree to which users intend to use the capabilities of the information system.', 'Sejauh mana pengguna berniat memanfaatkan kemampuan sistem informasi.', ['ITU', 'IU', 'NM'], R_('IU', 1, 2)),
      T_('US', 'User Satisfaction', 'Kepuasan Pengguna', "Users' level of satisfaction with the system, its outputs, and its support services.", 'Tingkat kepuasan pengguna terhadap sistem, keluarannya, dan layanan pendukungnya.', ['US', 'KP'], R_('US', 1, 3)),
      T_('NB', 'Net Benefits', 'Manfaat Bersih', 'The extent to which the system contributes to the success of individuals, groups, and organizations.', 'Sejauh mana sistem berkontribusi pada keberhasilan individu, kelompok, dan organisasi.', ['NB', 'MB'], R_('NB', 1, 4))],
    paths: [['IQ', 'ITU'], ['IQ', 'US'], ['SQ', 'ITU'], ['SQ', 'US'], ['SVQ', 'ITU'], ['SVQ', 'US'], ['US', 'ITU'], ['ITU', 'NB'], ['US', 'NB']] },
  { key: 'tam', kind: 'theory', refs: ['davis1989'], sample: 'tam', data: { real: false, n: 240 }, settings: { mga: { run: true, column: 'Gender', a: 'L', b: 'P' } }, name: { en: 'Technology Acceptance Model (TAM)', id: 'Technology Acceptance Model (TAM)' }, src: 'Davis (1989)',
    desc: { en: 'Perceived ease of use and usefulness shape attitude and intention, which lead to actual use.', id: 'Persepsi kemudahan dan kegunaan membentuk sikap dan niat, yang berujung pada penggunaan aktual.' },
    cons: [T_('PEOU', 'Perceived Ease of Use', 'Persepsi Kemudahan Penggunaan', 'The degree to which a person believes that using a particular system would be free of effort.', 'Sejauh mana seseorang yakin bahwa menggunakan suatu sistem tidak memerlukan banyak usaha.', ['PEOU', 'PEU', 'PKP']),
      T_('PU', 'Perceived Usefulness', 'Persepsi Kegunaan', 'The degree to which a person believes that using a particular system would enhance his or her job performance.', 'Sejauh mana seseorang yakin bahwa menggunakan suatu sistem akan meningkatkan kinerjanya.', ['PU', 'PK']),
      T_('ATT', 'Attitude Toward Using', 'Sikap terhadap Penggunaan', "The user's overall positive or negative evaluation of using the system.", 'Evaluasi positif atau negatif pengguna secara keseluruhan terhadap penggunaan sistem.', ['ATT', 'ATU', 'SK']),
      T_('BI', 'Behavioral Intention', 'Niat Perilaku', "The strength of a person's intention to use the system.", 'Kekuatan niat seseorang untuk menggunakan sistem.', ['BI', 'NP']),
      T_('AU', 'Actual Use', 'Penggunaan Aktual', 'The actual frequency and extent of system use.', 'Frekuensi dan intensitas penggunaan sistem yang sebenarnya.', ['AU', 'PA'])],
    paths: [['PEOU', 'PU'], ['PEOU', 'ATT'], ['PU', 'ATT'], ['PU', 'BI'], ['ATT', 'BI'], ['BI', 'AU']] },
  { key: 'utaut2', kind: 'theory', refs: ['venkatesh2012'], sample: 'utaut2', data: { real: false, n: 320 }, name: { en: 'UTAUT2', id: 'UTAUT2' }, src: 'Venkatesh, Thong & Xu (2012)',
    desc: { en: 'Seven drivers explain behavioral intention, which with facilitating conditions and habit explains use behavior.', id: 'Tujuh pendorong menjelaskan niat perilaku, yang bersama kondisi pendukung dan kebiasaan menjelaskan perilaku penggunaan.' },
    cons: [T_('PE', 'Performance Expectancy', 'Ekspektasi Kinerja', 'The degree to which using a technology will provide benefits to consumers in performing certain activities.', 'Sejauh mana penggunaan teknologi memberikan manfaat bagi konsumen dalam melakukan aktivitas tertentu.', ['PE', 'EK']),
      T_('EE', 'Effort Expectancy', 'Ekspektasi Usaha', "The degree of ease associated with consumers' use of technology.", 'Tingkat kemudahan yang terkait dengan penggunaan teknologi oleh konsumen.', ['EE', 'EU']),
      T_('SI', 'Social Influence', 'Pengaruh Sosial', 'The extent to which consumers perceive that important others believe they should use a particular technology.', 'Sejauh mana konsumen merasa bahwa orang-orang yang penting baginya meyakini ia sebaiknya menggunakan teknologi tersebut.', ['SI', 'PS']),
      T_('FC', 'Facilitating Conditions', 'Kondisi Pendukung', "Consumers' perceptions of the resources and support available to perform a behavior.", 'Persepsi konsumen tentang sumber daya dan dukungan yang tersedia untuk melakukan suatu perilaku.', ['FC', 'KD']),
      T_('HM', 'Hedonic Motivation', 'Motivasi Hedonis', 'The fun or pleasure derived from using a technology.', 'Kesenangan atau kenikmatan yang diperoleh dari penggunaan teknologi.', ['HM', 'MH']),
      T_('PV', 'Price Value', 'Nilai Harga', "Consumers' cognitive trade-off between the perceived benefits of the technology and the monetary cost of using it.", 'Pertimbangan kognitif konsumen antara manfaat teknologi yang dirasakan dan biaya moneter penggunaannya.', ['PV', 'NH']),
      T_('HT', 'Habit', 'Kebiasaan', 'The extent to which people tend to perform behaviors automatically because of learning.', 'Sejauh mana seseorang cenderung melakukan perilaku secara otomatis karena proses belajar.', ['HT', 'HB', 'KB']),
      T_('BI', 'Behavioral Intention', 'Niat Perilaku', "The strength of consumers' intention to use the technology.", 'Kekuatan niat konsumen untuk menggunakan teknologi.', ['BI', 'NP']),
      T_('UB', 'Use Behavior', 'Perilaku Penggunaan', 'The actual frequency of technology use.', 'Frekuensi penggunaan teknologi yang sebenarnya.', ['UB', 'PP'])],
    paths: [['PE', 'BI'], ['EE', 'BI'], ['SI', 'BI'], ['FC', 'BI'], ['HM', 'BI'], ['PV', 'BI'], ['HT', 'BI'], ['FC', 'UB'], ['HT', 'UB'], ['BI', 'UB']] },
  { key: 'tpb', kind: 'theory', refs: ['ajzen1991'], sample: 'tpb', data: { real: false, n: 260 }, name: { en: 'Theory of Planned Behavior (TPB)', id: 'Theory of Planned Behavior (TPB)' }, src: 'Ajzen (1991)',
    desc: { en: 'Attitude, subjective norm, and perceived behavioral control form intention, which together with control predicts behavior.', id: 'Sikap, norma subjektif, dan persepsi kontrol perilaku membentuk niat, yang bersama kontrol memprediksi perilaku.' },
    cons: [T_('ATT', 'Attitude Toward the Behavior', 'Sikap terhadap Perilaku', 'The degree to which a person has a favorable or unfavorable evaluation of the behavior.', 'Sejauh mana seseorang memiliki evaluasi yang positif atau negatif terhadap perilaku tersebut.', ['ATT', 'SK']),
      T_('SN', 'Subjective Norm', 'Norma Subjektif', 'The perceived social pressure to perform or not to perform the behavior.', 'Tekanan sosial yang dirasakan untuk melakukan atau tidak melakukan perilaku tersebut.', ['SN', 'NS']),
      T_('PBC', 'Perceived Behavioral Control', 'Persepsi Kontrol Perilaku', 'The perceived ease or difficulty of performing the behavior.', 'Persepsi tentang mudah atau sulitnya melakukan perilaku tersebut.', ['PBC', 'PKP']),
      T_('INT', 'Intention', 'Niat', "An indication of a person's readiness to perform the behavior.", 'Indikasi kesiapan seseorang untuk melakukan perilaku tersebut.', ['INT', 'NI']),
      T_('BEH', 'Behavior', 'Perilaku', 'The observed performance of the behavior.', 'Perilaku yang benar-benar dilakukan.', ['BEH', 'PR'])],
    paths: [['ATT', 'INT'], ['SN', 'INT'], ['PBC', 'INT'], ['PBC', 'BEH'], ['INT', 'BEH']] },
  { key: 'servqual', kind: 'theory', refs: ['parasuraman1988', 'oliver1999'], sample: 'servqual', data: { real: false, n: 300 }, name: { en: 'Service Quality, Satisfaction, and Loyalty', id: 'Kualitas Layanan, Kepuasan, dan Loyalitas' }, src: 'Parasuraman et al. (1988)',
    desc: { en: 'The five SERVQUAL dimensions drive customer satisfaction, which drives loyalty.', id: 'Lima dimensi SERVQUAL memengaruhi kepuasan pelanggan, yang memengaruhi loyalitas.' },
    cons: [T_('TAN', 'Tangibles', 'Bukti Fisik', 'Physical facilities, equipment, and appearance of personnel.', 'Fasilitas fisik, peralatan, dan penampilan karyawan.', ['TAN', 'TG', 'BF']),
      T_('REL', 'Reliability', 'Keandalan', 'Ability to perform the promised service dependably and accurately.', 'Kemampuan memberikan layanan yang dijanjikan secara andal dan akurat.', ['REL', 'RL', 'KD']),
      T_('RES', 'Responsiveness', 'Daya Tanggap', 'Willingness to help customers and provide prompt service.', 'Kesediaan membantu pelanggan dan memberikan layanan dengan cepat.', ['RES', 'RS', 'DT']),
      T_('ASR', 'Assurance', 'Jaminan', 'Knowledge and courtesy of employees and their ability to inspire trust and confidence.', 'Pengetahuan dan kesopanan karyawan serta kemampuan mereka menumbuhkan kepercayaan dan keyakinan.', ['ASR', 'AS', 'JM']),
      T_('EMP', 'Empathy', 'Empati', 'Caring, individualized attention that the firm provides its customers.', 'Kepedulian dan perhatian personal yang diberikan perusahaan kepada pelanggan.', ['EMP', 'EM']),
      T_('SAT', 'Customer Satisfaction', 'Kepuasan Pelanggan', "Customers' overall evaluation of their experience with the service.", 'Evaluasi menyeluruh pelanggan atas pengalamannya dengan layanan.', ['SAT', 'CS', 'KPL']),
      T_('LOY', 'Customer Loyalty', 'Loyalitas Pelanggan', 'A deeply held commitment to repurchase or repatronize the service in the future.', 'Komitmen kuat untuk membeli ulang atau menggunakan kembali layanan di masa depan.', ['LOY', 'LY', 'LP'])],
    paths: [['TAN', 'SAT'], ['REL', 'SAT'], ['RES', 'SAT'], ['ASR', 'SAT'], ['EMP', 'SAT'], ['SAT', 'LOY']] },
  { key: 'acsi', kind: 'theory', refs: ['fornell1996'], sample: 'mobi', data: { real: true, n: 250, cite: 'Tenenhaus et al. (2005)', ref: 'tenenhaus05' }, settings: { ipma: { run: true, target: 'LOY' } }, name: { en: 'American Customer Satisfaction Index (ACSI)', id: 'American Customer Satisfaction Index (ACSI)' }, src: 'Fornell et al. (1996)',
    desc: { en: 'Expectations, perceived quality, and perceived value drive satisfaction, which affects complaints and loyalty. Sample: mobile phone customers; item CUSL2 (loading 0.20) is left out, and HTMT flags known overlaps between quality, satisfaction, and loyalty.', id: 'Ekspektasi, persepsi kualitas, dan persepsi nilai memengaruhi kepuasan, yang berdampak pada keluhan dan loyalitas. Sampel: pelanggan ponsel; item CUSL2 (loading 0,20) tidak dipakai, dan HTMT menandai tumpang tindih yang dikenal antara kualitas, kepuasan, dan loyalitas.' },
    cons: [T_('EXP', 'Customer Expectations', 'Ekspektasi Pelanggan', "Customers' anticipation of the quality of a product or service, based on prior experience and information.", 'Antisipasi pelanggan terhadap kualitas produk atau layanan berdasarkan pengalaman dan informasi sebelumnya.', ['EXP', 'CE', 'CUEX'], R_('CUEX', 1, 3)),
      T_('PQ', 'Perceived Quality', 'Persepsi Kualitas', "Customers' evaluation of the quality of their recent consumption experience.", 'Evaluasi pelanggan atas kualitas pengalaman konsumsi terakhirnya.', ['PQ', 'PERQ'], R_('PERQ', 1, 7)),
      T_('PV', 'Perceived Value', 'Persepsi Nilai', 'The perceived level of quality relative to the price paid.', 'Tingkat kualitas yang dirasakan relatif terhadap harga yang dibayar.', ['PV', 'PERV'], R_('PERV', 1, 2)),
      T_('SAT', 'Customer Satisfaction', 'Kepuasan Pelanggan', "Customers' overall evaluation of their consumption experience to date.", 'Evaluasi menyeluruh pelanggan atas pengalaman konsumsinya hingga saat ini.', ['SAT', 'CUSA'], R_('CUSA', 1, 3)),
      T_('CC', 'Customer Complaints', 'Keluhan Pelanggan', 'The extent to which customers complain about the product or service.', 'Sejauh mana pelanggan menyampaikan keluhan tentang produk atau layanan.', ['CC', 'COMP', 'KL'], ['CUSCO']),
      T_('LOY', 'Customer Loyalty', 'Loyalitas Pelanggan', 'The likelihood of repurchase and tolerance to price increases.', 'Kemungkinan pembelian ulang dan toleransi terhadap kenaikan harga.', ['LOY', 'CUSL'], ['CUSL1', 'CUSL3'])],
    paths: [['EXP', 'PQ'], ['EXP', 'PV'], ['EXP', 'SAT'], ['PQ', 'PV'], ['PQ', 'SAT'], ['PV', 'SAT'], ['SAT', 'CC'], ['SAT', 'LOY'], ['CC', 'LOY']] },
  { key: 'corprep', kind: 'case', refs: ['hair22'], sample: 'corprep', data: { real: true, n: 344, cite: 'Hair et al. (2022)', ref: 'hair22' }, modes: { QUAL: 'formative', PERF: 'formative', CSOR: 'formative', ATTR: 'formative' },
    settings: { missingCode: '-99', mga: { run: true, column: 'servicetype', a: 'prepaid', b: 'contract' }, ipma: { run: true, target: 'CUSL' } },
    name: { en: 'Corporate Reputation Model', id: 'Model Reputasi Perusahaan' }, src: 'Hair et al. (2022)',
    desc: { en: 'The textbook PLS-SEM case: four formative drivers shape the competence and likeability of a mobile network operator, which drive satisfaction and loyalty. Group column: service type.', id: 'Kasus buku ajar PLS-SEM: empat pendorong formatif membentuk kompetensi dan kesukaan terhadap operator seluler, yang memengaruhi kepuasan dan loyalitas. Kolom grup: jenis layanan.' },
    cons: [T_('QUAL', 'Quality', 'Kualitas', "The perceived quality of the company's products and services and of its customer orientation.", 'Persepsi kualitas produk dan layanan perusahaan serta orientasinya pada pelanggan.', [], R_('qual_', 1, 8)),
      T_('PERF', 'Performance', 'Kinerja', "The company's perceived economic performance and management, such as stability, growth potential, and a clear vision.", 'Persepsi kinerja ekonomi dan manajemen perusahaan, seperti stabilitas, potensi pertumbuhan, dan visi yang jelas.', [], R_('perf_', 1, 5)),
      T_('CSOR', 'Corporate Social Responsibility', 'Tanggung Jawab Sosial Perusahaan', 'The extent to which the company is seen to act in socially conscious and responsible ways.', 'Sejauh mana perusahaan dipandang bertindak secara sadar sosial dan bertanggung jawab.', [], R_('csor_', 1, 5)),
      T_('ATTR', 'Attractiveness', 'Daya Tarik', "The company's attractiveness as an employer and the appeal of its physical appearance.", 'Daya tarik perusahaan sebagai tempat kerja dan penampilan fisiknya.', [], R_('attr_', 1, 3)),
      T_('COMP', 'Competence', 'Kompetensi', "The cognitive dimension of corporate reputation: the company's perceived competence and market leadership.", 'Dimensi kognitif reputasi perusahaan: kompetensi dan kepemimpinan pasar yang dipersepsikan.', [], R_('comp_', 1, 3)),
      T_('LIKE', 'Likeability', 'Kesukaan', 'The affective dimension of corporate reputation: the sympathy and liking the company evokes.', 'Dimensi afektif reputasi perusahaan: simpati dan rasa suka yang ditimbulkan perusahaan.', [], R_('like_', 1, 3)),
      T_('CUSA', 'Customer Satisfaction', 'Kepuasan Pelanggan', "Customers' overall satisfaction with the company.", 'Kepuasan pelanggan secara keseluruhan terhadap perusahaan.', [], ['cusa']),
      T_('CUSL', 'Customer Loyalty', 'Loyalitas Pelanggan', 'The intention to remain a customer, to recommend the company, and to choose it again.', 'Niat untuk tetap menjadi pelanggan, merekomendasikan perusahaan, dan memilihnya kembali.', [], R_('cusl_', 1, 3))],
    paths: [['QUAL', 'COMP'], ['QUAL', 'LIKE'], ['PERF', 'COMP'], ['PERF', 'LIKE'], ['CSOR', 'COMP'], ['CSOR', 'LIKE'], ['ATTR', 'COMP'], ['ATTR', 'LIKE'], ['COMP', 'CUSA'], ['COMP', 'CUSL'], ['LIKE', 'CUSA'], ['LIKE', 'CUSL'], ['CUSA', 'CUSL']] },
  { key: 'ecsi', kind: 'case', refs: ['tenenhaus05'], sample: 'mobi', data: { real: true, n: 250, cite: 'Tenenhaus et al. (2005)', ref: 'tenenhaus05' }, settings: { ipma: { run: true, target: 'LOY' } },
    name: { en: 'European Customer Satisfaction Index (ECSI)', id: 'European Customer Satisfaction Index (ECSI)' }, src: 'Tenenhaus et al. (2005)',
    desc: { en: 'The European adaptation of ACSI with corporate image, estimated on mobile phone customers; a classic PLS path modeling example with real measurement issues to practice on (CUSL2 is left out).', id: 'Adaptasi ACSI di Eropa dengan citra perusahaan, diestimasi pada pelanggan ponsel; contoh klasik PLS path modeling dengan masalah pengukuran nyata untuk latihan (CUSL2 tidak dipakai).' },
    cons: [T_('IMAG', 'Image', 'Citra', 'The associations and reputation that customers attach to the company or brand.', 'Asosiasi dan reputasi yang dilekatkan pelanggan pada perusahaan atau merek.', ['IMAG'], R_('IMAG', 1, 5)),
      T_('EXP', 'Customer Expectations', 'Ekspektasi Pelanggan', "Customers' anticipation of the quality of a product or service, based on prior experience and information.", 'Antisipasi pelanggan terhadap kualitas produk atau layanan berdasarkan pengalaman dan informasi sebelumnya.', ['CUEX'], R_('CUEX', 1, 3)),
      T_('PQ', 'Perceived Quality', 'Persepsi Kualitas', "Customers' evaluation of the quality of their recent consumption experience.", 'Evaluasi pelanggan atas kualitas pengalaman konsumsi terakhirnya.', ['PERQ'], R_('PERQ', 1, 7)),
      T_('PV', 'Perceived Value', 'Persepsi Nilai', 'The perceived level of quality relative to the price paid.', 'Tingkat kualitas yang dirasakan relatif terhadap harga yang dibayar.', ['PERV'], R_('PERV', 1, 2)),
      T_('SAT', 'Customer Satisfaction', 'Kepuasan Pelanggan', "Customers' overall evaluation of their consumption experience to date.", 'Evaluasi menyeluruh pelanggan atas pengalaman konsumsinya hingga saat ini.', ['CUSA'], R_('CUSA', 1, 3)),
      T_('CC', 'Customer Complaints', 'Keluhan Pelanggan', 'The extent to which customers complain about the product or service.', 'Sejauh mana pelanggan menyampaikan keluhan tentang produk atau layanan.', ['CUSCO'], ['CUSCO']),
      T_('LOY', 'Customer Loyalty', 'Loyalitas Pelanggan', 'The likelihood of repurchase and tolerance to price increases.', 'Kemungkinan pembelian ulang dan toleransi terhadap kenaikan harga.', ['CUSL'], ['CUSL1', 'CUSL3'])],
    paths: [['IMAG', 'EXP'], ['IMAG', 'SAT'], ['IMAG', 'LOY'], ['EXP', 'PQ'], ['EXP', 'PV'], ['EXP', 'SAT'], ['PQ', 'PV'], ['PQ', 'SAT'], ['PV', 'SAT'], ['SAT', 'CC'], ['SAT', 'LOY'], ['CC', 'LOY']] },
  { key: 'bank', kind: 'case', refs: ['sanchez13'], sample: 'bank', data: { real: true, n: 250, cite: 'Sanchez (2013)', ref: 'sanchez13' }, settings: { mga: { run: true, column: 'gender', a: 'female', b: 'male' }, ipma: { run: true, target: 'LOY' } },
    name: { en: 'Bank Customer Satisfaction', id: 'Kepuasan Nasabah Bank' }, src: 'Sanchez (2013)',
    desc: { en: 'An ECSI-type model for the customers of a Spanish credit institution, with a gender column for multigroup analysis; expectations and quality overlap strongly (HTMT), a useful case for discussing discriminant validity.', id: 'Model tipe ECSI untuk nasabah sebuah lembaga kredit di Spanyol, dengan kolom gender untuk analisis multigrup; ekspektasi dan kualitas sangat tumpang tindih (HTMT), kasus yang baik untuk membahas validitas diskriminan.' },
    cons: [T_('IMAG', 'Image', 'Citra', "The institution's reputation, trustworthiness, seriousness, solidity, and care for customers.", 'Reputasi, kepercayaan, keseriusan, kekokohan, dan kepedulian lembaga terhadap nasabah.', [], R_('imag', 1, 5)),
      T_('EXPE', 'Expectations', 'Ekspektasi', "Customers' expectations of the institution's products and services.", 'Ekspektasi nasabah terhadap produk dan layanan lembaga.', [], R_('expe', 1, 5)),
      T_('QUAL', 'Perceived Quality', 'Persepsi Kualitas', "Customers' evaluation of the quality of the institution's products and services.", 'Evaluasi nasabah atas kualitas produk dan layanan lembaga.', [], R_('qual', 1, 5)),
      T_('VAL', 'Perceived Value', 'Persepsi Nilai', 'The value received relative to the price and effort paid.', 'Nilai yang diterima relatif terhadap harga dan usaha yang dikeluarkan.', [], R_('val', 1, 4)),
      T_('SAT', 'Satisfaction', 'Kepuasan', "Customers' overall satisfaction with the institution.", 'Kepuasan nasabah secara keseluruhan terhadap lembaga.', [], R_('sat', 1, 4)),
      T_('LOY', 'Loyalty', 'Loyalitas', 'The intention to stay with and recommend the institution.', 'Niat untuk tetap menjadi nasabah dan merekomendasikan lembaga.', [], R_('loy', 1, 4))],
    paths: [['IMAG', 'EXPE'], ['IMAG', 'SAT'], ['IMAG', 'LOY'], ['EXPE', 'QUAL'], ['EXPE', 'VAL'], ['EXPE', 'SAT'], ['QUAL', 'VAL'], ['QUAL', 'SAT'], ['VAL', 'SAT'], ['SAT', 'LOY']] },
  { key: 'influencer', kind: 'case', refs: ['hair21'], sample: 'influencer', data: { real: true, n: 222, cite: 'Hair et al. (2021)', ref: 'hair21' }, modes: { SIC: 'formative' }, mods: [['PQ', 'PI', 'PIC']], settings: { ipma: { run: true, target: 'PI' } },
    name: { en: 'Influencer Marketing', id: 'Pemasaran Influencer' }, src: 'Hair et al. (2021)',
    desc: { en: 'Self-influencer congruence drives product liking, perceived quality, and purchase intention; influencer competence moderates the quality effect.', id: 'Kesesuaian diri dengan influencer memengaruhi kesukaan produk, persepsi kualitas, dan niat beli; kompetensi influencer memoderasi efek kualitas.' },
    cons: [T_('SIC', 'Self-Influencer Congruence', 'Kesesuaian Diri dengan Influencer', 'The degree to which consumers see themselves reflected in the influencer.', 'Sejauh mana konsumen melihat dirinya tercermin pada influencer.', [], R_('sic_', 1, 7)),
      T_('PL', 'Product Liking', 'Kesukaan Produk', "The consumer's liking of the presented product.", 'Rasa suka konsumen terhadap produk yang ditampilkan.', [], R_('pl_', 1, 4)),
      T_('PQ', 'Perceived Quality', 'Persepsi Kualitas', 'The perceived quality of the presented product.', 'Persepsi kualitas produk yang ditampilkan.', [], R_('pq_', 1, 4)),
      T_('PIC', 'Perceived Influencer Competence', 'Persepsi Kompetensi Influencer', 'The perceived qualification, expertise, and experience of the influencer.', 'Persepsi kualifikasi, keahlian, dan pengalaman influencer.', [], R_('pic_', 1, 5)),
      T_('PI', 'Purchase Intention', 'Niat Beli', 'The likelihood that the consumer will buy and recommend the presented product.', 'Kemungkinan konsumen membeli dan merekomendasikan produk yang ditampilkan.', [], R_('pi_', 1, 5)),
      T_('WTP', 'Willingness to Pay', 'Kesediaan Membayar', 'The price in euros that the consumer is willing to pay for the product.', 'Harga dalam euro yang bersedia dibayar konsumen untuk produk tersebut.', [], ['wtp'])],
    paths: [['SIC', 'PL'], ['SIC', 'PQ'], ['SIC', 'PI'], ['PL', 'PI'], ['PQ', 'PI'], ['PIC', 'PI'], ['PI', 'WTP']] },
  { key: 'brand', kind: 'case', refs: ['yoo00'], sample: 'yoo', data: { real: false, simcor: true, n: 569, cite: 'Yoo et al. (2000)', ref: 'yoo00' }, hoc: { BR: { locs: ['QL', 'LO', 'AA'], mode: 'formative' } }, settings: { ipma: { run: false }, boot: { B: 1000 } },
    name: { en: 'Marketing Mix and Brand Equity', id: 'Bauran Pemasaran dan Ekuitas Merek' }, src: 'Yoo et al. (2000)',
    desc: { en: 'Five marketing-mix elements drive brand equity, a higher-order construct formed by quality, loyalty, and awareness; standardized data with the original correlations; 1,000 bootstrap subsamples by default because both stages are repeated in each subsample.', id: 'Lima elemen bauran pemasaran memengaruhi ekuitas merek, konstruk orde tinggi yang dibentuk kualitas, loyalitas, dan kesadaran; data terstandar dengan korelasi studi asli; bawaan 1.000 subsampel bootstrap karena kedua tahap diulang di setiap subsampel.' },
    cons: [T_('PR', 'Price', 'Harga', 'The perceived price level of the brand.', 'Persepsi tingkat harga merek.', [], R_('PR', 1, 3)),
      T_('IM', 'Store Image', 'Citra Toko', 'The perceived image of the stores that carry the brand.', 'Persepsi citra toko yang menjual merek tersebut.', [], R_('IM', 1, 3)),
      T_('DI', 'Distribution Intensity', 'Intensitas Distribusi', 'The perceived number of stores in which the brand is available.', 'Persepsi banyaknya toko yang menyediakan merek tersebut.', [], R_('DI', 1, 3)),
      T_('AD', 'Advertising Spending', 'Belanja Iklan', 'The perceived intensity of advertising for the brand.', 'Persepsi intensitas iklan merek tersebut.', [], R_('AD', 1, 3)),
      T_('DL', 'Price Deals', 'Promosi Harga', 'The perceived frequency of price promotions for the brand.', 'Persepsi frekuensi promosi harga untuk merek tersebut.', [], R_('DL', 1, 3)),
      T_('QL', 'Perceived Quality', 'Persepsi Kualitas', "The consumer's judgment of the brand's overall excellence.", 'Penilaian konsumen atas keunggulan merek secara keseluruhan.', [], R_('QL', 1, 6)),
      T_('LO', 'Brand Loyalty', 'Loyalitas Merek', 'The tendency to be loyal to the brand and to choose it first.', 'Kecenderungan untuk setia pada merek dan memilihnya terlebih dahulu.', [], R_('LO', 1, 3)),
      T_('AA', 'Brand Awareness/Associations', 'Kesadaran dan Asosiasi Merek', 'The ability to recognize the brand and the associations linked to it.', 'Kemampuan mengenali merek dan asosiasi yang melekat padanya.', [], R_('AA', 1, 6)),
      T_('BR', 'Brand Equity', 'Ekuitas Merek', 'The overall value that the brand adds, formed by perceived quality, brand loyalty, and brand awareness/associations.', 'Nilai keseluruhan yang ditambahkan merek, dibentuk oleh persepsi kualitas, loyalitas merek, serta kesadaran dan asosiasi merek.', [], []),
      T_('OBE', 'Overall Brand Equity', 'Ekuitas Merek Keseluruhan', 'The preference for the brand over an otherwise identical unbranded product.', 'Preferensi terhadap merek dibandingkan produk tanpa merek yang setara.', [], R_('OBE', 1, 4))],
    paths: [['PR', 'BR'], ['IM', 'BR'], ['DI', 'BR'], ['AD', 'BR'], ['DL', 'BR'], ['BR', 'OBE']] },
  { key: 'privacy', kind: 'case', refs: ['lancelot16'], sample: 'privacy', data: { real: true, n: 1090, cite: 'Lancelot-Miltgen et al. (2016)', ref: 'lancelot16' }, settings: { ipma: { run: true, target: 'INT' } },
    name: { en: 'Privacy Concerns and Adoption Intention', id: 'Kekhawatiran Privasi dan Niat Adopsi' }, src: 'Lancelot-Miltgen et al. (2016)',
    desc: { en: "Young Europeans' intention to adopt a location tracker: privacy concerns act through trust and perceived risk (mediation).", id: 'Niat anak muda Eropa mengadopsi pelacak lokasi: kekhawatiran privasi bekerja melalui kepercayaan dan risiko yang dirasakan (mediasi).' },
    cons: [T_('PC', 'Privacy Concerns', 'Kekhawatiran Privasi', 'Concerns about how personal information is collected and used.', 'Kekhawatiran tentang cara informasi pribadi dikumpulkan dan digunakan.', [], R_('privcon', 1, 4)),
      T_('TR', 'Trust', 'Kepercayaan', 'Trust in the provider of the technology.', 'Kepercayaan terhadap penyedia teknologi.', [], R_('trust', 1, 2)),
      T_('RI', 'Perceived Risk', 'Risiko yang Dirasakan', 'The perceived risk of using the technology.', 'Risiko yang dirasakan dalam menggunakan teknologi.', [], R_('risk', 1, 3)),
      T_('INT', 'Adoption Intention', 'Niat Adopsi', 'The intention to adopt the location tracker technology.', 'Niat untuk mengadopsi teknologi pelacak lokasi.', [], R_('intent', 1, 2))],
    paths: [['PC', 'TR'], ['PC', 'RI'], ['TR', 'RI'], ['PC', 'INT'], ['TR', 'INT'], ['RI', 'INT']] }
];
const SAMPLES = (() => { try { return JSON.parse(document.getElementById('sample-sets').textContent); } catch (e) { return {}; } })();
/* ---- research info helpers (all read the document language through I18N.lang) */
const otherL = L => (L === 'id' ? 'en' : 'id');
const pickL = v => { if (!v) return ''; if (typeof v === 'string') return v.trim(); const L = I18N.lang; return String(v[L] || v[otherL(L)] || '').trim(); };
const infoTxt = field => pickL(state.info && state.info[field]);
const conInfo = id => (state.info && state.info.cons && state.info.cons[id]) || null;
const conFull = id => { const c = conInfo(id); return c ? pickL(c.name) : ''; };
const conDefTxt = id => { const c = conInfo(id); return c ? pickL(c.def) : ''; };
const conLabel = (id, abbr) => { const f = conFull(id); return f && f !== abbr ? `${f} (${abbr})` : abbr; };
const infoAuthors = () => ((state.info && state.info.authors) || []).filter(a => a && String(a.name || '').trim());
const infoFilled = () => !!(infoTxt('title') || infoAuthors().length);
function ensureConInfo(id) {
  if (!state.info.cons) state.info.cons = {};
  const c = state.info.cons[id] || (state.info.cons[id] = {});
  ['name', 'def'].forEach(k => { if (!c[k] || typeof c[k] !== 'object') c[k] = { id: typeof c[k] === 'string' ? c[k] : '', en: typeof c[k] === 'string' ? c[k] : '' }; });
  return c;
}
function normalizeInfo() {
  const I = state.info || (state.info = newInfo());
  ['title', 'objective', 'keywords'].forEach(k => { if (!I[k] || typeof I[k] !== 'object') I[k] = { id: typeof I[k] === 'string' ? I[k] : '', en: typeof I[k] === 'string' ? I[k] : '' }; });
  if (!Array.isArray(I.authors) || !I.authors.length) I.authors = [{ name: '', dept: '', inst: '', city: '', email: '' }];
  M().constructs.forEach(c => ensureConInfo(c.id));
}
/* paper and slide helpers */
const infoTitleFor = R => infoTxt('title') || R.name;
function citeText(fmtKey) {
  const y = new Date().getFullYear(), v = APP_VERSION, A = APP_AUTHOR;
  if (fmtKey === 'ieee') return `${A.initials} ${A.family}, “SEMbada: Portable PLS-SEM software,” version ${v}, ${y}. [Computer software]. Available: ${APP_REPO}`;
  if (fmtKey === 'bib') return `@software{${A.family.toLowerCase()}${y}sembada,\n  author  = {${A.family}, ${A.given}},\n  title   = {SEMbada: Portable PLS-SEM software},\n  version = {${v}},\n  year    = {${y}},\n  url     = {${APP_REPO}}\n}`;
  return `${A.family}, ${A.initials} (${y}). SEMbada: Portable PLS-SEM software (Version ${v}) [Computer software]. ${APP_REPO}`;
}

/* ---- recent projects: kept in this browser or app only (IndexedDB) */
function idbOpen() { return new Promise((res, rej) => { try { if (!window.indexedDB) return rej(new Error('no idb')); const r = indexedDB.open('sembada', 1); r.onupgradeneeded = () => r.result.createObjectStore('recent', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); }
async function idbAll() { const db = await idbOpen(); return new Promise(res => { const out = [], q = db.transaction('recent').objectStore('recent').openCursor(); q.onsuccess = e => { const c = e.target.result; if (c) { out.push(c.value); c.continue(); } else res(out.sort((a, b) => b.t - a.t)); }; q.onerror = () => res(out); }); }
async function idbDo(fn) { const db = await idbOpen(); return new Promise((res, rej) => { const tx = db.transaction('recent', 'readwrite'), st = tx.objectStore('recent'); fn(st); tx.oncomplete = () => res(true); tx.onerror = () => rej(tx.error); }); }
async function recentSave() {
  try {
    if (!state.data) return;
    if (!state.projectId) state.projectId = uid('p');
    const meta = { id: state.projectId, t: Date.now(), name: state.name, n: state.data.nRows, k: M().constructs.length, calc: !!state.results, project: projectObject() };
    await idbDo(st => st.put(meta));
    const all = await idbAll(); if (all.length > 8) await idbDo(st => all.slice(8).forEach(x => st.delete(x.id)));
  } catch (e) { /* storage unavailable: recent list is optional */ }
}
async function fillRecent() {
  const box = $('#recent-list'); if (!box) return;
  let all = []; try { all = await idbAll(); } catch (e) { box.innerHTML = `<p class="small muted">${tl('Riwayat proyek tidak tersedia di peramban ini.', 'Project history is not available in this browser.')}</p>`; return; }
  const btn = $('#recent-clear'); if (btn) btn.hidden = !all.length;
  box.innerHTML = all.length ? `<ul class="recent">${all.map(r => `<li><button class="recent-open" data-action="recent-open" data-id="${esc(r.id)}"><span class="r-name">${esc(r.name)}</span><span class="r-meta">${esc(tl(`${fmtInt(r.n)} responden · ${r.k} konstruk${r.calc ? ' · sudah dihitung' : ''}`, `${fmtInt(r.n)} respondents · ${r.k} constructs${r.calc ? ' · calculated' : ''}`))} · ${esc(new Date(r.t).toLocaleString(state.view.lang === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</span></button><button class="btn btn-quiet r-del" data-action="recent-del" data-id="${esc(r.id)}" aria-label="${esc(tl(`Hapus ${r.name} dari riwayat`, `Remove ${r.name} from history`))}" title="${esc(tl('Hapus dari riwayat', 'Remove from history'))}">×</button></li>`).join('')}</ul>`
    : `<p class="small muted" style="margin:0">${tl('Belum ada. Proyek yang dibuka, disimpan, atau dihitung akan muncul di sini.', 'Nothing yet. Projects you open, save, or calculate will appear here.')}</p>`;
}

/* ---- templates: sample data, application to the user's data, quick fixes */
function tplMini(T) {
  const L = T.cons.length, idx = new Map(T.cons.map((c, i) => [c.key, i])), layer = new Array(L).fill(0), links = T.paths.slice();
  Object.entries(T.hoc || {}).forEach(([h, o]) => o.locs.forEach(l => links.push([l, h])));
  for (let it = 0; it < L; it++) links.forEach(([a, b]) => { layer[idx.get(b)] = Math.max(layer[idx.get(b)], layer[idx.get(a)] + 1); });
  const nl = Math.max(...layer) + 1, by = Array.from({ length: nl }, () => []); T.cons.forEach((c, i) => by[layer[i]].push(i));
  const W = 260, H = 118, pos = [], zig = nl > 3 && by.filter(q => q.length === 1).length > 2;
  by.forEach((g, l) => g.forEach((i, k) => { pos[i] = { x: 30 + (nl === 1 ? 0 : l * (W - 60) / (nl - 1)), y: H / 2 + (g.length === 1 && zig ? (l % 2 ? 16 : -16) : (k - (g.length - 1) / 2) * Math.min(24, (H - 22) / Math.max(1, g.length - 1 || 1))) }; }));
  let s = '';
  links.forEach(([a, b]) => { const p = pos[idx.get(a)], q = pos[idx.get(b)], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1; s += `<line x1="${sx(p.x + dx / d * 15)}" y1="${sx(p.y + dy / d * 9)}" x2="${sx(q.x - dx / d * 15)}" y2="${sx(q.y - dy / d * 9)}"/>`; });
  T.cons.forEach((c, i) => { const p = pos[i]; s += `<g${T.hoc && T.hoc[c.key] ? ' class="h"' : ''}><ellipse cx="${sx(p.x)}" cy="${sx(p.y)}" rx="17" ry="9.5"/><text x="${sx(p.x)}" y="${sx(p.y + 3)}">${esc(c.key)}</text></g>`; });
  return `<svg class="tpl-mini" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
}
const escRe = x => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const preMatch = (n, pres) => pres.some(p => new RegExp('^' + escRe(p) + '[\\s_.-]?\\d+$', 'i').test(n));
function templateMatches(T) { const nums = numericNames(); return T.cons.filter(c => !(T.hoc && T.hoc[c.key]) && ((c.items && c.items.length && c.items.every(i => nums.includes(i))) || nums.some(n => preMatch(n, c.pre)))).length; }
function applyTemplate(key, opts) {
  opts = opts || {}; const T = TEMPLATES.find(t => t.key === key); if (!T || !state.data) return;
  const nums = numericNames(), have = new Set(nums), used = new Set(), miss = [], ids = {};
  const pick = c => (c.items && c.items.length && c.items.every(i => have.has(i)) ? c.items.slice() : nums.filter(n => !used.has(n) && preMatch(n, c.pre)));
  state.model = { constructs: [], paths: [], moderations: [] }; normalizeInfo(); state.info.cons = {};
  T.cons.forEach(c => {
    const hoc = T.hoc && T.hoc[c.key], items = hoc ? [] : pick(c); items.forEach(i => used.add(i));
    const k = addConstruct({ name: c.key, items }); ids[c.key] = k.id;
    if (hoc) { k.locs = []; k.mode = hoc.mode || 'reflective'; } else { if (T.modes && T.modes[c.key]) k.mode = T.modes[c.key]; if (!items.length) miss.push(c.key); }
    state.info.cons[k.id] = { name: { id: c.id, en: c.en }, def: { id: c.did, en: c.den } };
  });
  Object.entries(T.hoc || {}).forEach(([h, o]) => { conById(ids[h]).locs = o.locs.map(l => ids[l]); });
  T.paths.forEach(([a, b]) => addPath(ids[a], ids[b]));
  (T.mods || []).forEach(([x, y, m]) => { const p = M().paths.find(q => q.from === ids[x] && q.to === ids[y]); if (p) M().moderations.push({ id: uid('m'), path: p.id, moderator: ids[m] }); });
  state.info.template = T.key; const TS = T.settings || {};
  if (opts.sample) {
    const keepAlgo = state.settings.algorithm; state.settings = clone(DEFAULT_SETTINGS); state.settings.algorithm = keepAlgo;
    if (TS.missingCode) state.settings.missingCode = TS.missingCode;
    if (TS.boot) Object.assign(state.settings.boot, TS.boot);
    if (TS.mga) Object.assign(state.settings.mga, TS.mga);
    if (TS.ipma) Object.assign(state.settings.ipma, TS.ipma, { target: TS.ipma.target ? ids[TS.ipma.target] || '' : '' });
  } else if (TS.ipma && TS.ipma.target) state.settings.ipma.target = ids[TS.ipma.target] || '';
  autoLayout(); state.ui.selected = null; state.results = null; changed(); goStep('model');
  if (!opts.sample) toast(miss.length ? tl(`${T.name.id} dipasang. ${T.cons.length - miss.length} dari ${T.cons.length} konstruk langsung terisi indikator; seret indikator ke ${miss.join(', ')}, atau buka contoh model ini dengan datanya dari Beranda.`, `${T.name.en} applied. ${T.cons.length - miss.length} of ${T.cons.length} constructs were filled with indicators; drag indicators onto ${miss.join(', ')}, or open this model's example with its data from Home.`) : tl(`${T.name.id} dipasang dan semua konstruk terisi indikator.`, `${T.name.en} applied and every construct received its indicators.`), miss.length ? '' : 'ok');
}
function loadSampleSet(key) {
  const T = TEMPLATES.find(t => t.key === key); if (!T) return;
  if (T.sample === 'dm') setData(IO.rowsToColumns(IO.parseCSV($('#sample-data').textContent.trim()).rows, false), { fileName: tl('contoh-delone-mclean.csv', 'example-delone-mclean.csv'), kind: 'sample' });
  else { const S = SAMPLES[T.sample]; if (!S) { toast(tl('Data contoh tidak tersedia.', 'Sample data is not available.'), 'err'); return; } setData(IO.rowsToColumns(IO.parseCSV(S.csv).rows, false), { fileName: S.file, kind: 'sample' }); }
  if (!state.data) return;
  state.source.sample = T.sample; state.name = T.name[state.view.lang] || T.name.en; state.projectId = null;
  applyTemplate(key, { sample: true });
  const kind = T.data.real ? tl('data asli', 'real data') : T.data.simcor ? tl('data simulasi dengan korelasi studi asli', 'simulated data with the original correlations') : tl('data simulasi', 'simulated data');
  toast(tl(`Contoh dibuka: ${fmtInt(state.data.nRows)} responden, ${kind}${T.data.cite ? ' (' + T.data.cite + ')' : ''}. Klik Hitung untuk melihat hasilnya.`, `Example opened: ${fmtInt(state.data.nRows)} respondents, ${kind}${T.data.cite ? ' (' + T.data.cite + ')' : ''}. Click Calculate to see the results.`), 'ok');
}
function templateCSV(key) {
  const T = TEMPLATES.find(t => t.key === key); if (!T) return;
  if (T.sample === 'dm') { download(tl('contoh-delone-mclean.csv', 'example-delone-mclean.csv'), $('#sample-data').textContent.trim() + '\n', 'text/csv'); return; }
  if (SAMPLES[T.sample]) { download(SAMPLES[T.sample].file, SAMPLES[T.sample].csv + '\n', 'text/csv'); return; }
  const head = T.cons.filter(c => !(T.hoc && T.hoc[c.key])).flatMap(c => (c.items && c.items.length ? c.items : Array.from({ length: 3 }, (_, i) => c.key + (i + 1))));
  download(`format_${T.key}.csv`, head.join(',') + '\n', 'text/csv');
}
function choose(title, html, buttons) {
  return new Promise(res => {
    const d = document.createElement('dialog'); d.className = 'choice-dlg';
    d.innerHTML = `<form method="dialog"><h3>${esc(title)}</h3><div class="choice-b">${html}</div><div class="choice-a">${buttons.map(o => `<button class="btn${o.primary ? ' btn-primary' : o.quiet ? ' btn-quiet' : ''}" value="${o.v}">${esc(o.label)}</button>`).join('')}</div></form>`;
    document.body.appendChild(d); d.addEventListener('close', () => { res(d.returnValue || null); d.remove(); }); d.showModal();
  });
}
function autoFillPlan() {
  const m = M(), taken = new Set(m.constructs.flatMap(c => c.items)), free = numericNames().filter(n => !taken.has(n)), T = state.info && state.info.template ? TEMPLATES.find(t => t.key === state.info.template) : null, plan = [];
  m.constructs.filter(c => !isHoc(c) && !c.items.length).forEach(c => { const tc = T ? T.cons.find(x => x.key === c.name) : null, its = free.filter(n => preMatch(n, [c.name].concat(tc ? tc.pre : []))); if (its.length) { plan.push([c, its]); its.forEach(i => free.splice(free.indexOf(i), 1)); } });
  return plan;
}
function quickFixes() {
  const m = M(), out = []; if (!state.data) return out;
  const uncon = m.constructs.filter(c => !locOwner(m, c.id) && !m.paths.some(p => p.from === c.id || p.to === c.id)), empty = m.constructs.filter(c => !isHoc(c) && !c.items.length);
  if (uncon.length && m.paths.length) out.push({ a: 'fix-unconnected', label: tl(`Hapus ${uncon.length} konstruk yang tidak terhubung`, `Remove ${uncon.length} unconnected construct${uncon.length > 1 ? 's' : ''}`) });
  if (empty.length && autoFillPlan().length) out.push({ a: 'fix-autofill', label: tl('Isi indikator otomatis dari nama kolom', 'Fill indicators from column names') });
  const T = state.info && state.info.template ? TEMPLATES.find(t => t.key === state.info.template) : null;
  if (T && T.sample && empty.length && !(state.source && state.source.sample === T.sample)) out.push({ a: 'fix-sample', label: tl(`Buka contoh ${T.name.id} beserta datanya`, `Open the ${T.name.en} example with its data`) });
  return out;
}
const quickFixHTML = () => quickFixes().map(f => `<button class="btn" data-action="${f.a}">${esc(f.label)}</button>`).join('');
const THEME_ICONS = { auto: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 3.4a6.6 6.6 0 0 1 0 13.2z" fill="currentColor"/></svg>',
  light: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  dark: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.2 12.6A6.8 6.8 0 0 1 7.4 3.8a6.8 6.8 0 1 0 8.8 8.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' };
const themeSegHTML = () => { const t = themeSetting(); return `<div class="seg theme-seg" role="group" aria-label="${tl('Tampilan', 'Appearance')}">${[['auto', tl('Ikuti sistem', 'Follow system')], ['light', tl('Terang', 'Light')], ['dark', tl('Gelap', 'Dark')]].map(([v, l]) => `<button data-action="top-theme" data-v="${v}" aria-pressed="${t === v}" title="${l}" aria-label="${l}">${THEME_ICONS[v]}</button>`).join('')}</div>`; };
function syncThemeSeg() { const t = themeSetting(); $$('.theme-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === t))); }
function resetProject() {
  state.name = UNTITLED(); state.source = null; state.data = null; state.model = { constructs: [], paths: [], moderations: [] };
  state.info = newInfo(); normalizeInfo(); state.projectId = null; state.settings = clone(DEFAULT_SETTINGS); state.results = null;
  state.ui.selected = null; state.ui.pendingTemplate = null; state.ui.checked = new Set(); dirty = false;
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (er) { ok = false; } ta.remove(); return ok;
  }
}

/* ---- home view */
const HOME_MARK = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" class="hm-bg"/><ellipse cx="20" cy="22" rx="10" ry="6.5" class="hm-n"/><ellipse cx="20" cy="44" rx="10" ry="6.5" class="hm-n"/><ellipse cx="46" cy="33" rx="11" ry="7" class="hm-e"/><path d="M29 24.5 L34.5 29.5 M29 41.5 L34.5 36.5" class="hm-a"/></svg>`;
function viewHome() {
  normalizeInfo();
  const cur = state.data ? `<section class="panel home-cur"><div class="panel-b"><div class="cur-t"><span class="eyebrow">${tl('Proyek aktif', 'Current project')}</span><b>${esc(state.name)}</b><span class="small muted">${esc(tl(`${fmtInt(state.data.nRows)} responden · ${M().constructs.length} konstruk · ${M().paths.length} jalur`, `${fmtInt(state.data.nRows)} respondents · ${M().constructs.length} constructs · ${M().paths.length} paths`))}</span></div><div class="row" style="gap:8px"><button class="btn" data-action="step" data-step="${state.results ? 'results' : M().constructs.length ? 'model' : 'data'}">${state.results ? tl('Lihat hasil', 'View results') : tl('Lanjutkan', 'Continue')}</button></div></div></section>` : '';
  const feats = [[tl('Offline sepenuhnya', 'Fully offline'), tl('Data tidak pernah meninggalkan komputer Anda.', 'Your data never leaves your computer.')], [tl('Setara seminr', 'Matches seminr'), tl('Estimasi diuji terhadap paket R seminr.', 'Estimates are validated against the seminr R package.')], [tl('Siap publikasi', 'Publication-ready'), tl('Makalah, presentasi, dan laporan dalam dua bahasa.', 'Papers, slides, and reports in two languages.')], [tl('Analisis lanjutan', 'Advanced analyses'), tl('Moderasi, orde tinggi, MGA, IPMA, dan ukuran sampel.', 'Moderation, higher-order constructs, MGA, IPMA, and sample size.')]];
  return `<div class="view home">
  ${heroHTML()}
  ${cur}
  <div class="home-grid">
    <section class="panel"><div class="panel-h"><h3>${tl('Proyek terakhir', 'Recent projects')}</h3><button class="btn btn-quiet" id="recent-clear" data-action="recent-clear" hidden>${tl('Hapus riwayat', 'Clear history')}</button></div><div class="panel-b" id="recent-list"><p class="small muted" style="margin:0">${tl('Memuat…', 'Loading…')}</p></div></section>
    <section class="panel"><div class="panel-h"><h3>${tl('Cara mengutip SEMbada', 'How to cite SEMbada')}</h3></div><div class="panel-b">
      <p class="small muted" style="margin-top:0">${tl('Cantumkan perangkat lunak yang dipakai di bagian metode skripsi, tesis, atau artikel Anda.', 'Cite the software you used in the methods section of your thesis or article.')}</p>
      ${[['apa', 'APA 7'], ['ieee', 'IEEE'], ['bib', 'BibTeX']].map(([k, l]) => `<div class="cite"><div class="cite-h"><span class="tag">${l}</span><button class="btn btn-quiet" data-action="cite-copy" data-fmt="${k}">${tl('Salin', 'Copy')}</button></div><pre class="cite-t">${esc(citeText(k))}</pre></div>`).join('')}
    </div></section>
  </div>
  ${[['theory', tl('Model teori', 'Theory models'), tl('Model yang sering dipakai di skripsi dan artikel. Setiap model punya data contoh; ACSI memakai data asli, model lain memakai data simulasi yang ditandai jelas. Pakai untuk data Anda: indikator dipasangkan otomatis bila nama kolom diawali singkatan konstruk, misalnya PU1, PU2, PU3.', 'Models commonly used in theses and articles. Every model has sample data; ACSI uses real data, the others use clearly labeled simulated data. To use one with your own data, indicators are matched automatically when column names start with the construct abbreviation, for example PU1, PU2, PU3.')], ['case', tl('Studi kasus dengan data publik', 'Case studies with public data'), tl('Model dan data dari literatur PLS-SEM, termasuk konstruk formatif, mediasi, moderasi, konstruk orde tinggi, dan kolom grup untuk MGA. Data berasal dari paket R seminr dan cSEM (lisensi GPL-3); sumber aslinya dikutip di setiap kartu dan di makalah.', 'Models and data from the PLS-SEM literature, including formative constructs, mediation, moderation, higher-order constructs, and group columns for MGA. The data come from the seminr and cSEM R packages (GPL-3 license); the original sources are cited on each card and in the paper.')]].map(([kind, title, text]) => `<section class="home-tpl">
    <div class="sec-h"><h2>${title}</h2><p>${text}</p></div>
    <div class="tpl-grid">${TEMPLATES.filter(T => T.kind === kind).map(T => `<article class="tpl">${tplMini(T)}<div class="tpl-badges"><span class="badge ${T.data.real ? 'real' : 'sim'}">${T.data.real ? tl('Data asli', 'Real data') : T.data.simcor ? tl('Data simulasi (korelasi asli)', 'Simulated (original correlations)') : tl('Data simulasi', 'Simulated data')}</span><span class="badge">n = ${fmtInt(T.data.n)}</span>${T.modes ? `<span class="badge">${tl('formatif', 'formative')}</span>` : ''}${T.mods ? `<span class="badge">${tl('moderasi', 'moderation')}</span>` : ''}${T.hoc ? `<span class="badge">${tl('orde tinggi', 'higher-order')}</span>` : ''}${T.settings && T.settings.mga ? '<span class="badge">MGA</span>' : ''}</div><h3>${esc(T.name[state.view.lang] || T.name.en)}</h3><p class="tpl-src">${esc(T.src)}${T.data.cite && T.data.cite !== T.src ? ` · ${tl('data', 'data')}: ${esc(T.data.cite)}` : ''}</p><p class="tpl-d">${esc(T.desc[state.view.lang] || T.desc.en)}</p><p class="tpl-k">${T.cons.map(c => `<span title="${esc(state.view.lang === 'en' ? c.en : c.id)}">${esc(c.key)}</span>`).join('')}</p><div class="tpl-act"><button class="btn btn-primary" data-action="tpl-sample" data-tpl="${T.key}">${tl('Buka contoh', 'Open example')}</button><button class="btn" data-action="tpl-use" data-tpl="${T.key}">${tl('Pakai untuk data saya', 'Use with my data')}</button><button class="btn btn-quiet tpl-csv" data-action="tpl-csv" data-tpl="${T.key}" title="${tl('Unduh data contoh model ini; header-nya dapat dipakai sebagai format data Anda', 'Download this model\'s sample data; its header can serve as the format for your own data')}">${tl('Unduh data (CSV)', 'Download data (CSV)')}</button></div></article>`).join('')}</div>
  </section>`).join('')}
  <p class="home-foot small muted">${tl('SEMbada berjalan sepenuhnya di perangkat ini. Riwayat proyek disimpan di peramban atau aplikasi ini saja dan dapat dihapus kapan pun.', 'SEMbada runs entirely on this device. Project history is stored only in this browser or app and can be cleared at any time.')}</p>
</div>`;
}

/* ---- research info view */
function viewInfo() {
  normalizeInfo();
  const L = state.ui.infoLang || state.view.lang, I = state.info, cs = M().constructs;
  const fld = (id, label, path, o) => { o = o || {}; return `<div class="field${o.wide ? ' wide' : ''}"><label for="${id}">${label}</label>${o.area ? `<textarea id="${id}" rows="${o.rows || 3}" data-bind="${path}" placeholder="${esc(o.ph || '')}"></textarea>` : `<input type="${o.type || 'text'}" id="${id}" data-bind="${path}" placeholder="${esc(o.ph || '')}" maxlength="${o.max || 300}">`}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}</div>`; };
  return `<div class="view info-view">
  <div class="view-head"><div><h1>${tl('Info penelitian', 'Research info')}</h1><p>${tl('Opsional. Isian ini mengisi judul, penulis, tujuan, nama lengkap konstruk, dan teori pada makalah, presentasi, dan laporan, sehingga isian dalam kurung siku berkurang. Perubahan di sini tidak mengharuskan hitung ulang.', 'Optional. These entries fill the title, authors, objective, full construct names, and theory in the paper, slides, and report, so fewer bracketed placeholders remain. Changes here do not require recalculation.')}</p></div></div>
  <div class="info-lang"><span class="small muted">${tl('Isi untuk dokumen berbahasa', 'Entries for documents in')}</span><div class="seg" role="group" aria-label="${tl('Bahasa isian', 'Entry language')}"><button data-action="info-lang" data-v="id" aria-pressed="${L === 'id'}">Indonesia</button><button data-action="info-lang" data-v="en" aria-pressed="${L === 'en'}">English</button></div><span class="small muted">${tl('Isian satu bahasa juga dipakai untuk bahasa lainnya bila kosong.', 'Entries in one language are also used for the other when it is empty.')}</span></div>
  <section class="panel"><div class="panel-h"><h3>${tl('Judul dan tujuan', 'Title and objective')}</h3></div><div class="panel-b"><div class="info-grid">
    ${fld('if-title', tl('Judul penelitian', 'Research title'), `info.title.${L}`, { wide: true, ph: state.name, max: 250 })}
    ${fld('if-obj', tl('Tujuan penelitian', 'Research objective'), `info.objective.${L}`, { wide: true, area: true, rows: 3, ph: L === 'id' ? 'menganalisis pengaruh kualitas sistem informasi akademik terhadap kepuasan dan manfaat bagi mahasiswa' : 'analyze the effect of academic information system quality on student satisfaction and net benefits', hint: L === 'id' ? 'Tulis sebagai lanjutan kalimat “Penelitian ini bertujuan untuk …”.' : 'Write it as the continuation of “This study aims to …”.' })}
    ${fld('if-kw', tl('Kata kunci tambahan', 'Additional keywords'), `info.keywords.${L}`, { wide: true, ph: L === 'id' ? 'sistem informasi akademik, mahasiswa' : 'academic information system, students', hint: tl('Pisahkan dengan koma. Ditambahkan ke kata kunci bawaan.', 'Separate with commas. Added to the default keywords.') })}
  </div></div></section>
  <section class="panel"><div class="panel-h"><h3>${tl('Penulis', 'Authors')}</h3><button class="btn" data-action="info-add-author"${I.authors.length >= 6 ? ' disabled' : ''}>${tl('Tambah penulis', 'Add author')}</button></div><div class="panel-b">
    ${I.authors.map((a, k) => `<div class="author"><div class="author-h"><b>${tl('Penulis', 'Author')} ${k + 1}</b>${I.authors.length > 1 ? `<button class="btn btn-quiet btn-danger" data-action="info-del-author" data-i="${k}">${tl('Hapus', 'Remove')}</button>` : ''}</div><div class="info-grid">
      ${fld('au-n' + k, tl('Nama lengkap', 'Full name'), `info.authors.${k}.name`, { ph: tl('Nama dan gelar', 'Name and titles') })}${fld('au-e' + k, 'Email', `info.authors.${k}.email`, { type: 'email', ph: 'nama@kampus.ac.id' })}
      ${fld('au-d' + k, tl('Departemen atau program studi', 'Department or study program'), `info.authors.${k}.dept`)}${fld('au-i' + k, tl('Institusi', 'Institution'), `info.authors.${k}.inst`)}
      ${fld('au-c' + k, tl('Kota dan negara', 'City and country'), `info.authors.${k}.city`, { ph: 'Surabaya, Indonesia' })}
    </div></div>`).join('')}
  </div></section>
  <section class="panel"><div class="panel-h"><h3>${tl('Konstruk', 'Constructs')}</h3></div><div class="panel-b">
    ${cs.length ? `<p class="small muted" style="margin-top:0">${tl('Nama lengkap dipakai saat konstruk pertama kali disebut dan pada hipotesis. Definisi dipakai di bagian Tinjauan Pustaka; bila semua konstruk berdefinisi, isian teori dalam kurung siku tidak lagi dibuat.', 'Full names are used when a construct is first mentioned and in the hypotheses. Definitions are used in the Literature Review; when every construct has one, the bracketed theory placeholder is no longer created.')}</p>
    <div class="con-table">${cs.map(c => `<div class="con-row"><div class="con-abbr"><span class="tag lv">${esc(c.name)}</span>${isHoc(c) ? `<span class="xs muted">${tl('orde tinggi', 'higher-order')}</span>` : ''}</div><div class="field"><label for="cf-${c.id}">${tl('Nama lengkap', 'Full name')}</label><input type="text" id="cf-${c.id}" data-bind="info.cons.${c.id}.name.${L}" maxlength="120" placeholder="${esc(L === 'id' ? 'misalnya Kualitas Informasi' : 'e.g. Information Quality')}"></div><div class="field"><label for="cd-${c.id}">${tl('Definisi (opsional)', 'Definition (optional)')}</label><textarea id="cd-${c.id}" rows="2" data-bind="info.cons.${c.id}.def.${L}" placeholder="${esc(L === 'id' ? 'Sejauh mana …' : 'The degree to which …')}"></textarea></div></div>`).join('')}</div>`
    : `<p class="small muted" style="margin:0">${tl('Belum ada konstruk. Susun model di langkah Model atau pilih model teori di Beranda.', 'No constructs yet. Build the model in the Model step or pick a theory model on the Home page.')}</p>`}
  </div></section>
  <section class="panel"><div class="panel-h"><h3>${tl('Pratinjau di dokumen', 'Preview in documents')}</h3></div><div class="panel-b" id="info-preview">${infoPreviewHTML(L)}</div></section>
</div>`;
}
function infoPreviewHTML(L) {
  return withLang(L, () => {
    const t = infoTxt('title') || state.name, au = infoAuthors(), obj = infoTxt('objective'), hy = hypotheses();
    const nm = id => { const c = conById(id); return c ? conLabel(id, c.name) : ''; };
    return `<div class="prev"><p class="prev-t">${esc(t)}</p><p class="small muted">${esc(au.length ? au.map(a => a.name).join(', ') : tl('[Nama penulis]', '[Author name]'))}</p>
      <p><span class="eyebrow">${tl('Abstrak, kalimat pertama', 'Abstract, first sentence')}</span><br>${esc(obj ? tl(`Penelitian ini bertujuan untuk ${obj.replace(/\.$/, '')}.`, `This study aims to ${obj.replace(/\.$/, '')}.`) : tl('[Tuliskan latar belakang dan tujuan penelitian.]', '[State the research background and objective.]'))}</p>
      ${hy.length ? `<p class="eyebrow" style="margin-bottom:4px">${tl('Hipotesis', 'Hypotheses')}</p><ul class="prev-h">${hy.slice(0, 4).map(h => `<li><b>${h.h}:</b> ${esc(tl(`${nm(h.p.from)} berpengaruh signifikan terhadap ${nm(h.p.to)}.`, `${nm(h.p.from)} has a significant effect on ${nm(h.p.to)}.`))}</li>`).join('')}${hy.length > 4 ? `<li class="muted">${tl(`… dan ${hy.length - 4} hipotesis lainnya`, `… and ${hy.length - 4} more`)}</li>` : ''}</ul>` : ''}</div>`;
  });
}

/* ---- advanced-analysis controls on the Calculate page */
function sampleSizeLine() {
  const S = state.settings.ssize, nm = nMinISR(S.beta, S.alpha), n = state.data ? state.data.nRows : 0;
  if (!Number.isFinite(nm)) return tl('Isi |β min| lebih besar dari 0.', 'Enter a |β min| greater than 0.');
  return tl(`n minimum = <b>${fmtInt(nm)}</b> responden${n ? `; data Anda ${fmtInt(n)} responden (${n >= nm ? '<span class="ok">cukup</span>' : '<span class="no">belum cukup</span>'})` : ''}.`, `minimum n = <b>${fmtInt(nm)}</b> respondents${n ? `; your data has ${fmtInt(n)} respondents (${n >= nm ? '<span class="ok">sufficient</span>' : '<span class="no">insufficient</span>'})` : ''}.`);
}
function advancedPanelHTML() {
  const S = state.settings, cols = groupColumns(), vals = S.mga.column ? groupValues(S.mga.column) : [];
  const endo = M().constructs.filter(c => M().paths.some(p => p.to === c.id));
  return `<section class="panel adv-panel"><div class="panel-h"><h3>${tl('Analisis lanjutan', 'Advanced analyses')}</h3></div><div class="panel-b">
      <label class="check"><input type="checkbox" data-bind="settings.ipma.run"><span><b>${tl('IPMA (peta importance-performance)', 'IPMA (importance-performance map)')}</b><br><span class="small muted">${tl('Menunjukkan konstruk mana yang paling layak diperbaiki untuk menaikkan konstruk target.', 'Shows which constructs are most worth improving to raise a target construct.')}</span></span></label>
      <fieldset id="ipma-fs"${S.ipma.run !== false ? '' : ' disabled'} style="margin:10px 0 18px 26px"><div class="row"><div class="field"><label for="ipma-t">${tl('Konstruk target', 'Target construct')}</label><select id="ipma-t" data-bind="settings.ipma.target"><option value="">${tl('Otomatis (konstruk akhir)', 'Automatic (final construct)')}</option>${endo.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div></div></fieldset>
      <label class="check"><input type="checkbox" data-bind="settings.mga.run"><span><b>${tl('Analisis multigrup (MGA)', 'Multigroup analysis (MGA)')}</b><br><span class="small muted">${tl('Membandingkan koefisien jalur dua kelompok responden, dilengkapi uji invariansi MICOM dan uji permutasi.', 'Compares path coefficients between two groups of respondents, with the MICOM invariance test and a permutation test.')}</span></span></label>
      <fieldset id="mga-fs"${S.mga.run ? '' : ' disabled'} style="margin:10px 0 18px 26px">${cols.length ? `<div class="row">
        <div class="field"><label for="mga-col">${tl('Kolom pengelompokan', 'Grouping column')}</label><select id="mga-col" data-bind="settings.mga.column"><option value="">${tl('Pilih kolom…', 'Choose a column…')}</option>${cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></div>
        <div class="field"><label for="mga-a">${tl('Grup 1', 'Group 1')}</label><select id="mga-a" data-bind="settings.mga.a">${vals.map(([v, k]) => `<option value="${esc(v)}">${esc(v)} (n = ${k})</option>`).join('')}</select></div>
        <div class="field"><label for="mga-b">${tl('Grup 2', 'Group 2')}</label><select id="mga-b" data-bind="settings.mga.b">${vals.map(([v, k]) => `<option value="${esc(v)}">${esc(v)} (n = ${k})</option>`).join('')}</select></div>
        <div class="field"><label for="mga-p">${tl('Permutasi', 'Permutations')}</label><input type="number" id="mga-p" min="100" max="5000" step="100" data-bind="settings.mga.perms"></div>
      </div>` : `<p class="small muted" style="margin:0">${tl('Tidak ada kolom yang cocok untuk pengelompokan (2–10 kategori, misalnya jenis kelamin).', 'No column suits grouping (2–10 categories, such as gender).')}</p>`}</fieldset>
      <div class="ssize"><b>${tl('Ukuran sampel minimum', 'Minimum sample size')}</b><p class="small muted" style="margin:2px 0 8px">${tl('Metode inverse square root (Kock dan Hadaya, 2018): n minimum untuk mendeteksi koefisien jalur sekecil |β min| dengan power 80%.', 'Inverse square root method (Kock and Hadaya, 2018): minimum n to detect a path coefficient as small as |β min| with 80% power.')}</p>
        <div class="row"><div class="field"><label for="ss-b">${tl('|β min| yang ingin terdeteksi', '|β min| to detect')}</label><input type="text" inputmode="decimal" id="ss-b" data-type="num" data-bind="settings.ssize.beta"></div><div class="field"><label for="ss-a">${tl('Taraf signifikansi', 'Significance level')}</label><select id="ss-a" data-bind="settings.ssize.alpha" data-type="num"><option value="0.01">1%</option><option value="0.05">5%</option><option value="0.1">10%</option></select></div></div>
        <p class="ss-out" id="ss-out">${sampleSizeLine()}</p></div>
    </div></section>`;
}

/* ---- construct and path panels: full name, lower-order constructs, moderators */
propsConstruct = (f => c => {
  ensureConInfo(c.id);
  let h = f(c); const L = state.view.lang;
  const full = `<div class="field"><label for="cfull">${tl('Nama lengkap', 'Full name')} <span class="xs muted">(${tl('untuk dokumen', 'for documents')})</span></label><input type="text" id="cfull" data-bind="info.cons.${c.id}.name.${L}" maxlength="120" placeholder="${esc(L === 'id' ? 'misalnya Kualitas Informasi' : 'e.g. Information Quality')}"></div>`;
  const i0 = h.indexOf('maxlength="40"></div>'); if (i0 >= 0) h = h.slice(0, i0 + 21) + full + h.slice(i0 + 21);
  if (!isHoc(c)) return h;
  const cand = M().constructs.filter(o => o.id !== c.id && !isHoc(o) && o.items.length), owner = id => { const o = locOwner(M(), id); return o && o.id !== c.id ? o : null; };
  const locs = `<h4>${tl('Konstruk orde rendah', 'Lower-order constructs')} (${c.locs.length})</h4><p class="xs muted" style="margin:0 0 8px">${tl('Centang konstruk yang membentuk atau dicerminkan oleh konstruk orde tinggi ini (minimal dua). Estimasi memakai pendekatan disjoint two-stage.', 'Tick the constructs that form or reflect this higher-order construct (at least two). Estimation uses the disjoint two-stage approach.')}</p>
    ${cand.length ? `<ul class="loc-list">${cand.map(o => `<li><label class="check"><input type="checkbox" data-change="loc" data-hoc="${c.id}" data-loc="${o.id}"${c.locs.includes(o.id) ? ' checked' : ''}><span>${esc(o.name)} <span class="xs muted">(${o.items.length} ${tl('indikator', 'indicators')}${owner(o.id) ? `; ${tl('kini di', 'now in')} ${esc(owner(o.id).name)}` : ''})</span></span></label></li>`).join('')}</ul>` : `<p class="small muted">${tl('Buat dulu konstruk biasa beserta indikatornya.', 'First create regular constructs with their indicators.')}</p>`}
    <p class="xs muted">${tl('Reflektif: konstruk orde rendah mencerminkan konstruk orde tinggi (reflektif-reflektif). Formatif: konstruk orde rendah membentuk konstruk orde tinggi (reflektif-formatif).', 'Reflective: the lower-order constructs reflect the higher-order construct (reflective-reflective). Formative: the lower-order constructs form it (reflective-formative).')}</p>`;
  const a = h.indexOf(`<h4>${tl('Indikator', 'Indicators')}`), b = h.indexOf(`<h4>${tl('Jalur', 'Paths')}`);
  if (a >= 0 && b > a) h = h.slice(0, a) + locs + h.slice(b);
  return h.replace(`<h3>${tl('Konstruk', 'Construct')}</h3>`, `<h3>${tl('Konstruk orde tinggi', 'Higher-order construct')}</h3>`);
})(propsConstruct);
propsPath = (f => p => {
  const h = f(p), mods = (M().moderations || []).filter(m => m.path === p.id), cand = M().constructs.filter(c => c.id !== p.from && c.id !== p.to && !isHoc(c) && !locOwner(M(), c.id) && c.items.length && !mods.some(m => m.moderator === c.id));
  const base = M().paths.length;
  const sec = `<h4>${tl('Moderasi', 'Moderation')}</h4><p class="xs muted" style="margin:0 0 8px">${tl('Moderator mengubah kekuatan jalur ini. Jalur efek utama moderator ke konstruk tujuan ditambahkan otomatis; efek interaksi diestimasi dengan pendekatan dua tahap.', 'A moderator changes the strength of this path. The main-effect path from the moderator to the target construct is added automatically; the interaction effect is estimated with the two-stage approach.')}</p>
    ${mods.length ? `<ul class="plist">${mods.map(m => { const k = (M().moderations || []).indexOf(m); return `<li><span><span class="h">H${base + k + 1}</span>${esc(conById(m.moderator).name)} × ${esc(conById(p.from).name)}</span><button class="btn btn-quiet btn-danger" data-action="del-mod" data-mid="${m.id}">${tl('Hapus', 'Delete')}</button></li>`; }).join('')}</ul>` : ''}
    ${cand.length ? `<div class="row" style="gap:6px"><select id="mod-sel" aria-label="${tl('Pilih moderator', 'Choose a moderator')}">${cand.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><button class="btn" data-action="add-mod" data-pid="${p.id}">${tl('Tambah moderator', 'Add moderator')}</button></div>` : `<p class="small muted">${tl('Tidak ada konstruk lain yang dapat menjadi moderator.', 'No other construct can act as a moderator.')}</p>`}`;
  const k = h.lastIndexOf('</div>'); return h.slice(0, k) + sec + h.slice(k);
})(propsPath);
onBound = (f => el => {
  f(el); const p = el.dataset.bind || '';
  if (p === 'settings.ipma.run') { const x = $('#ipma-fs'); if (x) x.disabled = state.settings.ipma.run === false; }
  if (p === 'settings.mga.run') { const x = $('#mga-fs'); if (x) x.disabled = !state.settings.mga.run; }
  if (p === 'settings.mga.column') { const v = groupValues(state.settings.mga.column); state.settings.mga.a = v[0] ? v[0][0] : ''; state.settings.mga.b = v[1] ? v[1][0] : ''; if (state.ui.step === 'run') renderMain(); }
  if (p.startsWith('settings.ssize.')) { const o = $('#ss-out'); if (o) o.innerHTML = sampleSizeLine(); }
  if (p.startsWith('info.')) { const pv = $('#info-preview'); if (pv) pv.innerHTML = infoPreviewHTML(state.ui.infoLang || state.view.lang); renderRail(); }
})(onBound);
loadFile = (f => async file => {
  const r = await f(file), pend = state.ui.pendingTemplate;
  if (pend && Date.now() - pend.t < 120000 && state.data && state.source && state.source.kind !== 'project') { state.ui.pendingTemplate = null; applyTemplate(pend.key); }
  return r;
})(loadFile);

const HOME_ACTIONS = {
  'home-new': () => { if (dirty && state.data && !confirm(tl('Perubahan pada proyek saat ini belum disimpan. Mulai proyek baru?', 'The current project has unsaved changes. Start a new project?'))) return; resetProject(); goStep('data'); },
  'home-sample': () => { if (dirty && state.data && !confirm(tl('Perubahan pada proyek saat ini belum disimpan. Ganti dengan data contoh?', 'The current project has unsaved changes. Replace it with the sample data?'))) return; resetProject(); loadSampleSet('dm'); },
  'tpl-sample': el => { if (dirty && state.data && !confirm(tl('Perubahan pada proyek saat ini belum disimpan. Buka contoh ini?', 'The current project has unsaved changes. Open this example?'))) return; resetProject(); loadSampleSet(el.dataset.tpl); },
  'fix-unconnected': () => { const m = M(), un = m.constructs.filter(c => !locOwner(m, c.id) && !m.paths.some(p => p.from === c.id || p.to === c.id)); un.forEach(c => removeConstruct(c.id)); toast(tl(`${un.length} konstruk yang tidak terhubung dihapus.`, `${un.length} unconnected construct(s) removed.`), 'ok'); render(); },
  'fix-autofill': () => { const pl = autoFillPlan(); pl.forEach(([c, its]) => { c.items = its; }); changed(); toast(tl(`Indikator terisi untuk ${pl.map(([c]) => c.name).join(', ')}.`, `Indicators filled for ${pl.map(([c]) => c.name).join(', ')}.`), 'ok'); render(); },
  'fix-sample': () => { const T = TEMPLATES.find(t => t.key === state.info.template); if (T && (!dirty || confirm(tl('Data dan model saat ini akan diganti dengan contoh. Lanjutkan?', 'The current data and model will be replaced by the example. Continue?')))) { resetProject(); loadSampleSet(T.key); } },
  'top-theme': el => { const v = el.dataset.v; if (v === 'auto') { applyTheme(null); try { localStorage.setItem('sembada-theme', 'auto'); } catch (e) { /* storage unavailable */ } } else { applyTheme(v); try { localStorage.setItem('sembada-theme', v); } catch (e) { /* storage unavailable */ } } syncThemeSeg(); },
  'tpl-use': async el => {
    const k = el.dataset.tpl, T = TEMPLATES.find(t => t.key === k);
    if (!state.data || (state.source && state.source.kind === 'sample')) { state.ui.pendingTemplate = { key: k, t: Date.now() }; toast(tl('Pilih file data Anda. Model akan dipasang setelah data dimuat.', 'Choose your data file. The model will be applied once the data is loaded.')); pickFile('data'); return; }
    if (!templateMatches(T)) { const c = await choose(tl('Kolom data tidak cocok', 'No matching columns'), `<p>${esc(tl(`Data Anda (${state.source && state.source.fileName ? state.source.fileName : 'tanpa nama'}) tidak memiliki kolom yang cocok dengan konstruk ${T.name.id}, misalnya ${T.cons.slice(0, 3).map(c => (c.items && c.items[0]) || c.key + '1').join(', ')}.`, `Your data (${state.source && state.source.fileName ? state.source.fileName : 'untitled'}) has no columns matching the constructs of ${T.name.en}, such as ${T.cons.slice(0, 3).map(c => (c.items && c.items[0]) || c.key + '1').join(', ')}.`))}</p><p>${esc(tl('Anda dapat membuka contoh model ini beserta datanya, atau memasang model kosong lalu menyeret indikator Anda ke setiap konstruk.', 'You can open this model\'s example with its data, or apply an empty model and drag your indicators onto each construct.'))}</p>`, [{ v: 'sample', label: tl('Buka contoh beserta datanya', 'Open the example with its data'), primary: true }, { v: 'empty', label: tl('Pasang model kosong', 'Apply an empty model') }, { v: 'cancel', label: tl('Batal', 'Cancel'), quiet: true }]);
      if (c === 'sample') { resetProject(); loadSampleSet(k); return; } if (c !== 'empty') return;
    } else if (M().constructs.length && !confirm(tl('Model saat ini akan diganti dengan model ini. Lanjutkan?', 'The current model will be replaced by this model. Continue?'))) return;
    applyTemplate(k);
  },
  'tpl-csv': el => templateCSV(el.dataset.tpl),
  'recent-open': async el => { try { const all = await idbAll(), r = all.find(x => x.id === el.dataset.id); if (!r) return; if (dirty && state.data && !confirm(tl('Perubahan pada proyek saat ini belum disimpan. Buka proyek lain?', 'The current project has unsaved changes. Open another project?'))) return; loadProject(r.project, null); } catch (e) { toast(tl('Proyek tidak dapat dibuka dari riwayat.', 'The project could not be opened from history.'), 'err'); } },
  'recent-del': async el => { try { await idbDo(st => st.delete(el.dataset.id)); } catch (e) { /* ignore */ } fillRecent(); },
  'recent-clear': async () => { if (!confirm(tl('Hapus seluruh riwayat proyek di perangkat ini? File proyek yang sudah Anda simpan tidak terpengaruh.', 'Clear the whole project history on this device? Project files you saved are not affected.'))) return; try { await idbDo(st => st.clear()); } catch (e) { /* ignore */ } fillRecent(); },
  'cite-copy': async el => { const ok = await copyText(citeText(el.dataset.fmt)); toast(ok ? tl('Sitasi disalin.', 'Citation copied.') : tl('Gagal menyalin; pilih teksnya secara manual.', 'Copy failed; select the text manually.'), ok ? 'ok' : 'err'); },
  'info-lang': el => { state.ui.infoLang = el.dataset.v; renderMain(); },
  'info-add-author': () => { if (state.info.authors.length < 6) { state.info.authors.push({ name: '', dept: '', inst: '', city: '', email: '' }); dirty = true; renderMain(); } },
  'info-del-author': el => { state.info.authors.splice(+el.dataset.i, 1); if (!state.info.authors.length) state.info.authors.push({ name: '', dept: '', inst: '', city: '', email: '' }); dirty = true; renderMain(); },
  'add-hoc': () => { addHOC(); refreshModel(true); toast(tl('Konstruk orde tinggi dibuat. Pilih konstruk orde rendahnya di panel kanan, lalu hubungkan jalurnya.', 'Higher-order construct created. Choose its lower-order constructs in the right-hand panel, then connect its paths.')); },
  'add-mod': el => { const s = $('#mod-sel'); if (s && addModeration(el.dataset.pid, s.value)) refreshModel(true); },
  'del-mod': el => { removeModeration(el.dataset.mid); refreshModel(true); }
};
const HOME_CHANGES = { loc: el => { toggleLoc(el.dataset.hoc, el.dataset.loc, el.checked); refreshModel(true); } };
