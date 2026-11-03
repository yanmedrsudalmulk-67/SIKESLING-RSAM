// Domain types, initial data, and calculation logic for Monitoring Sarana dan Prasarana
// Covers Sheet 1 (Toilet & Sanitasi), Sheet 2 (Lantai RS), Sheet 3 (Pintu & Jendela RS),
// Sheet 4 (Atap RS), Sheet 5 (Langit-langit / Plafon RS), and Sheet 6 (Rekapan & Analisa).

export interface ToiletRow {
  id: string;
  no: number;
  bulan: string;
  indikator: string; // e.g. "Toilet IGD", "Toilet Rajal", "Toilet Ranap Kebidanan", "Toilet Ranap Fatimah"
  jenisL: number;
  jenisP: number;
  jenisLP: number;
  totalJenis?: number;
  keterangan: string;
}

export interface ToiletDisabilitasRow {
  id: string;
  indikator: string; // "Toilet Disabilitas"
  rajalAda: boolean;
  rajalTidak: boolean;
  igdAda: boolean;
  igdTidak: boolean;
  penunjangAda: boolean;
  penunjangTidak: boolean;
  keterangan: string;
}

export interface LantaiRow {
  id: string;
  no: number;
  indikator: string; // e.g. "Poliklinik Rawat Jalan", "IGD", "Ruang Rawat Inap", "Ruang Operasi (OK) / Penunjang", "Selasar / Koridor"
  // Param 1: Lantai kuat, kedap air, rata, tidak licin, warna terang
  param1Ya: boolean;
  param1Tidak: boolean;
  // Param 2: Kemiringan cukup ke saluran pembuangan air limbah
  param2Ya: boolean;
  param2Tidak: boolean;
  // Param 3: Pertemuan lantai dengan dinding berbentuk konus/lengkung
  param3Ya: boolean;
  param3Tidak: boolean;
  // Param 4: Permukaan dinding kuat, warna terang, cat tidak luntur & bebas logam berat
  param4Ya: boolean;
  param4Tidak: boolean;
  keterangan: string;
}

export interface PintuJendelaRow {
  id: string;
  no: number;
  indikator: string; // e.g. "Pintu Masuk Utama & IGD", "Ruang Rawat Inap", "Kamar Mandi & Toilet Pasien", "Ruang Rawat Intensif & OK", "Gedung Rawat Inap Bertingkat"
  // Param 1: Bukaan pintu brankar minimal 120 cm, pintu non-brankar minimal 90 cm
  param1Ya: boolean;
  param1Tidak: boolean;
  // Param 2: Sekitar pintu masuk tidak boleh ada perbedaan ketinggian lantai (rata)
  param2Ya: boolean;
  param2Tidak: boolean;
  // Param 3: Pintu kamar mandi ranap & toilet aksesibel terbuka ke luar
  param3Ya: boolean;
  param3Tidak: boolean;
  // Param 4: Pintu akses tempat tidur pasien dilapisi bahan anti benturan
  param4Ya: boolean;
  param4Tidak: boolean;
  // Param 5: Ruang perawatan memiliki bukaan jendela pertukaran udara maksimal
  param5Ya: boolean;
  param5Tidak: boolean;
  // Param 6: Bangunan bertingkat, lebar bukaan jendela aman dari resiko pasien jatuh/lari
  param6Ya: boolean;
  param6Tidak: boolean;
  keterangan: string;
}

export interface AtapRow {
  id: string;
  no: number;
  indikator: string; // e.g. "Gedung Utama RS", "Gedung Rawat Inap", "Gedung Penunjang & IGD", "Gedung Manajemen & Farmasi"
  // Param 1: Kuat, tidak bocor, tahan lama, dan tidak jadi tempat perindukan hama
  param1Ya: boolean;
  param1Tidak: boolean;
  param1Ket: string;
  // Param 2: Memenuhi sebagian persyaratan di atas
  param2Ya: boolean;
  param2Tidak: boolean;
  param2Ket: string;
  keterangan: string;
}

export interface LangitLangitRow {
  id: string;
  no: number;
  indikator: string; // e.g. "Ruang Perawatan Pasien", "Selasar / Koridor", "Ruang Operasi (OK)", "Ruang Rawat Intensif (ICU)", "Laboratorium & Penunjang"
  // Param 1: Kuat, warna terang, mudah dibersihkan, aman, tidak bocor/berjamur
  param1Ya: boolean;
  param1Tidak: boolean;
  // Param 2: Tinggi ruangan minimal 2,80 m, selasar minimal 2,40 m
  param2Ya: boolean;
  param2Tidak: boolean;
  // Param 3: Tinggi di ruang operasi minimal 3,00 m
  param3Ya: boolean;
  param3Tidak: boolean;
  // Param 4: Ruang OK & ICU, bahan langit-langit tahan api (TKA) min 2 jam
  param4Ya: boolean;
  param4Tidak: boolean;
  // Param 5: Lampu penerangan dibenamkan pada plafon (recessed)
  param5Ya: boolean;
  param5Tidak: boolean;
  keterangan: string;
}

export interface SaranaPrasaranaDataset {
  year: number;
  lastUpdated: string;
  // Sheet 1
  toilets: ToiletRow[];
  toiletDisabilitas: ToiletDisabilitasRow;
  // Sheet 2
  lantai: LantaiRow[];
  // Sheet 3
  pintuJendela: PintuJendelaRow[];
  // Sheet 4
  atap: AtapRow[];
  // Sheet 5
  langitLangit: LangitLangitRow[];
}

export const INITIAL_TOILET_ROWS: ToiletRow[] = [
  {
    id: 't-1',
    no: 1,
    bulan: 'Januari',
    indikator: 'Toilet IGD',
    jenisL: 0,
    jenisP: 1,
    jenisLP: 4,
    totalJenis: 5,
    keterangan: 'toilet tidak terpisah antara laki-laki dan perempuan',
  },
  {
    id: 't-2',
    no: 2,
    bulan: 'Januari',
    indikator: 'Toilet Rajal',
    jenisL: 1,
    jenisP: 1,
    jenisLP: 4,
    totalJenis: 6,
    keterangan:
      'tisu toilet jarang ada, lantai masih licin jarang di sikat, dinding masih kotor, urinoir kotor, wc dekat poli anak lampunya mati dan pintunya tidak ada',
  },
  {
    id: 't-3',
    no: 3,
    bulan: 'Januari',
    indikator: 'Toilet Ranap Kebidanan',
    jenisL: 0,
    jenisP: 0,
    jenisLP: 3,
    totalJenis: 3,
    keterangan: 'lantai masih licin, pintu dan dinding kotor.',
  },
  {
    id: 't-4',
    no: 4,
    bulan: 'Januari',
    indikator: 'Toilet Ranap Fatimah',
    jenisL: 0,
    jenisP: 0,
    jenisLP: 6,
    totalJenis: 6,
    keterangan:
      'ubin lantai terlihat kotor dan licin, dinding jarang di bersihkan, pintu kaca kotor dan tisu toilet jarang ada',
  },
];

export const INITIAL_TOILET_DISABILITAS: ToiletDisabilitasRow = {
  id: 'td-1',
  indikator: 'Toilet Disabilitas',
  rajalAda: true,
  rajalTidak: false,
  igdAda: true,
  igdTidak: false,
  penunjangAda: true,
  penunjangTidak: false,
  keterangan:
    'Tersedia toilet disabilitas di Rajal, IGD, dan Penunjang, pegangan tangan kokoh dan ram aksesibel.',
};

export const INITIAL_LANTAI_ROWS: LantaiRow[] = [
  {
    id: 'l-1',
    no: 1,
    indikator: 'Poliklinik Rawat Jalan',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    keterangan:
      'Lantai keramik terang dan kedap air, konus lantai dinding terpasang rapi.',
  },
  {
    id: 'l-2',
    no: 2,
    indikator: 'Instalasi Gawat Darurat (IGD)',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    keterangan:
      'Permukaan rata dan tidak licin, sudut hospital plinth konus mempermudah sanitasi dekontaminasi.',
  },
  {
    id: 'l-3',
    no: 3,
    indikator: 'Ruang Rawat Inap',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: false,
    param3Tidak: true,
    param4Ya: true,
    param4Tidak: false,
    keterangan:
      'Sebagian sudut dinding ranap lama belum berkonus sempurna, memerlukan perbaikan plinth.',
  },
  {
    id: 'l-4',
    no: 4,
    indikator: 'Kamar Operasi (OK) & Penunjang',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    keterangan:
      'Lantai vinyl anti-bakteri dan konduktif dengan sambungan welded melengkung (coved).',
  },
  {
    id: 'l-5',
    no: 5,
    indikator: 'Selasar & Koridor Rumah Sakit',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    keterangan:
      'Lantai rata tanpa undakan, kemiringan ke arah drainase eksterior baik.',
  },
];

export const INITIAL_PINTU_JENDELA_ROWS: PintuJendelaRow[] = [
  {
    id: 'pj-1',
    no: 1,
    indikator: 'Pintu Masuk Utama & IGD',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    param6Ya: true,
    param6Tidak: false,
    keterangan:
      'Bukaan pintu utama > 140 cm, brankar dan kursi roda leluasa melintas tanpa hambatan level lantai.',
  },
  {
    id: 'pj-2',
    no: 2,
    indikator: 'Ruang Rawat Inap (Dewasa & Anak)',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    param6Ya: true,
    param6Tidak: false,
    keterangan:
      'Pintu kamar ranap dilengkapi bumper guard pelindung benturan brankar dan jendela ventilasi lancar.',
  },
  {
    id: 'pj-3',
    no: 3,
    indikator: 'Kamar Mandi & Toilet Pasien',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    param6Ya: true,
    param6Tidak: false,
    keterangan:
      'Seluruh pintu kamar mandi pasien membuka ke luar sesuai standar evakuasi keselamatan.',
  },
  {
    id: 'pj-4',
    no: 4,
    indikator: 'Kamar Operasi (OK) & ICU',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    param6Ya: true,
    param6Tidak: false,
    keterangan:
      'Pintu hermetik kedap udara berlebar 150 cm dengan pelindung benturan baja nirkarat (stainless steel).',
  },
  {
    id: 'pj-5',
    no: 5,
    indikator: 'Gedung Rawat Inap Bertingkat',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    param6Ya: true,
    param6Tidak: false,
    keterangan:
      'Jendela lantai 2 terpasang pengaman pembatas bukaan (restrictor stay) maksimal 15 cm demi keamanan pasien.',
  },
];

export const INITIAL_ATAP_ROWS: AtapRow[] = [
  {
    id: 'a-1',
    no: 1,
    indikator: 'Gedung Pelayanan Utama (IGD & Rajal)',
    param1Ya: true,
    param1Tidak: false,
    param1Ket: 'Kondisi atap kokoh, dak beton kedap air, tidak ada kebocoran.',
    param2Ya: true,
    param2Tidak: false,
    param2Ket: 'Bebas dari sarang tikus dan genangan air hujan.',
    keterangan: 'Kondisi struktur dan waterproof atap berfungsi sangat baik.',
  },
  {
    id: 'a-2',
    no: 2,
    indikator: 'Gedung Rawat Inap',
    param1Ya: true,
    param1Tidak: false,
    param1Ket: 'Rangka baja ringan dan genteng metal dalam kondisi baik.',
    param2Ya: true,
    param2Tidak: false,
    param2Ket: 'Pembersihan talang air rutin tiap 2 minggu.',
    keterangan: 'Perlu pemeriksaan rutin berkala pada saluran talang saat musim hujan.',
  },
  {
    id: 'a-3',
    no: 3,
    indikator: 'Gedung Penunjang Medik & IPAL/TPS',
    param1Ya: true,
    param1Tidak: false,
    param1Ket: 'Kuat dan bebas rembesan.',
    param2Ya: true,
    param2Tidak: false,
    param2Ket: 'Kisi ventilasi diberi kawat kasa anti burung dan tikus.',
    keterangan: 'Kondisi terpantau aman dan terbebas dari hama serangga.',
  },
  {
    id: 'a-4',
    no: 4,
    indikator: 'Gedung Manajemen & Farmasi',
    param1Ya: true,
    param1Tidak: false,
    param1Ket: 'Struktur atap rapat dan insulasi termal baik.',
    param2Ya: true,
    param2Tidak: false,
    param2Ket: 'Saluran pembuangan air hujan mengalir langsung ke drainase utama.',
    keterangan: 'Memenuhi persyaratan teknis atap rumah sakit.',
  },
];

export const INITIAL_LANGIT_LANGIT_ROWS: LangitLangitRow[] = [
  {
    id: 'll-1',
    no: 1,
    indikator: 'Ruang Perawatan Pasien',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    keterangan:
      'masih ada sebagian ruangan yang langit2nya ada bekas genangan air hujan yg bocor sehingga menimbulkan bekas lembab dan berjamur, masih ada langit2 yang bolong',
  },
  {
    id: 'll-2',
    no: 2,
    indikator: 'Selasar / Koridor Rumah Sakit',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    keterangan:
      'Tinggi langit-langit koridor mencapai 2,55 m (melebihi ambang batas minimal 2,40 m).',
  },
  {
    id: 'll-3',
    no: 3,
    indikator: 'Ruang Operasi (OK)',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    keterangan:
      'Tinggi plafon 3,10 m (> 3,00 m), bahan gypsum fire-rated TKA 2 jam dengan lampu recessed tertanam rata.',
  },
  {
    id: 'll-4',
    no: 4,
    indikator: 'Ruang Perawatan Intensif (ICU)',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    keterangan:
      'Plafon bebas debu dengan material TKA tahan api dan sistem penerangan tertanam rata.',
  },
  {
    id: 'll-5',
    no: 5,
    indikator: 'Laboratorium & Radiologi',
    param1Ya: true,
    param1Tidak: false,
    param2Ya: true,
    param2Tidak: false,
    param3Ya: true,
    param3Tidak: false,
    param4Ya: true,
    param4Tidak: false,
    param5Ya: true,
    param5Tidak: false,
    keterangan:
      'Kondisi plafon cat terang, sambungan rapi tanpa retakan dan mudah disanitasi.',
  },
];

export function createInitialSaranaPrasaranaData(year = 2026): SaranaPrasaranaDataset {
  return {
    year,
    lastUpdated: new Date().toISOString(),
    toilets: JSON.parse(JSON.stringify(INITIAL_TOILET_ROWS)),
    toiletDisabilitas: JSON.parse(JSON.stringify(INITIAL_TOILET_DISABILITAS)),
    lantai: JSON.parse(JSON.stringify(INITIAL_LANTAI_ROWS)),
    pintuJendela: JSON.parse(JSON.stringify(INITIAL_PINTU_JENDELA_ROWS)),
    atap: JSON.parse(JSON.stringify(INITIAL_ATAP_ROWS)),
    langitLangit: JSON.parse(JSON.stringify(INITIAL_LANGIT_LANGIT_ROWS)),
  };
}

export interface SaranaAspectScore {
  sheetId: string;
  name: string;
  totalChecks: number;
  passedChecks: number;
  complianceRate: number;
  status: 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan';
  highlightIssue: string;
}

export interface SaranaRecapSummary {
  overallCompliance: number;
  totalChecks: number;
  totalPassed: number;
  totalIssues: number;
  aspects: SaranaAspectScore[];
  chartData: { aspect: string; memenuhi: number; belumMemenuhi: number; rate: number }[];
  zoneData: { zone: string; skor: number; status: string }[];
  analysisText: string;
  recommendations: string[];
  actionPlans: {
    no: number;
    aspek: string;
    temuanMasalah: string;
    rencanaTindakLanjut: string;
    pic: string;
    targetWaktu: string;
    prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  }[];
}

export function calculateSaranaPrasaranaSummary(data: SaranaPrasaranaDataset): SaranaRecapSummary {
  // 1. Toilet & Sanitasi (Sheet 1)
  // Check hygiene notes and disability toilet
  const toiletIssuesCount = data.toilets.filter((t) =>
    t.keterangan.toLowerCase().includes('licin') ||
    t.keterangan.toLowerCase().includes('kotor') ||
    t.keterangan.toLowerCase().includes('mati') ||
    t.keterangan.toLowerCase().includes('tidak terpisah')
  ).length;
  const toiletDisabPassed = (data.toiletDisabilitas.rajalAda ? 1 : 0) +
    (data.toiletDisabilitas.igdAda ? 1 : 0) +
    (data.toiletDisabilitas.penunjangAda ? 1 : 0);
  const toiletTotalChecks = data.toilets.length + 3;
  const toiletPassed = Math.max(0, toiletTotalChecks - toiletIssuesCount);
  const toiletRate = Math.round((toiletPassed / toiletTotalChecks) * 100);

  // 2. Lantai (Sheet 2): 4 params per row
  let lantaiTotal = 0;
  let lantaiPassed = 0;
  data.lantai.forEach((row) => {
    lantaiTotal += 4;
    if (row.param1Ya) lantaiPassed += 1;
    if (row.param2Ya) lantaiPassed += 1;
    if (row.param3Ya) lantaiPassed += 1;
    if (row.param4Ya) lantaiPassed += 1;
  });
  const lantaiRate = lantaiTotal > 0 ? Math.round((lantaiPassed / lantaiTotal) * 100) : 100;

  // 3. Pintu & Jendela (Sheet 3): 6 params per row
  let pintuTotal = 0;
  let pintuPassed = 0;
  data.pintuJendela.forEach((row) => {
    pintuTotal += 6;
    if (row.param1Ya) pintuPassed += 1;
    if (row.param2Ya) pintuPassed += 1;
    if (row.param3Ya) pintuPassed += 1;
    if (row.param4Ya) pintuPassed += 1;
    if (row.param5Ya) pintuPassed += 1;
    if (row.param6Ya) pintuPassed += 1;
  });
  const pintuRate = pintuTotal > 0 ? Math.round((pintuPassed / pintuTotal) * 100) : 100;

  // 4. Atap (Sheet 4): 2 params per row
  let atapTotal = 0;
  let atapPassed = 0;
  data.atap.forEach((row) => {
    atapTotal += 2;
    if (row.param1Ya) atapPassed += 1;
    if (row.param2Ya) atapPassed += 1;
  });
  const atapRate = atapTotal > 0 ? Math.round((atapPassed / atapTotal) * 100) : 100;

  // 5. Langit-langit (Sheet 5): 5 params per row
  let plafonTotal = 0;
  let plafonPassed = 0;
  data.langitLangit.forEach((row) => {
    plafonTotal += 5;
    if (row.param1Ya) plafonPassed += 1;
    if (row.param2Ya) plafonPassed += 1;
    if (row.param3Ya) plafonPassed += 1;
    if (row.param4Ya) plafonPassed += 1;
    if (row.param5Ya) plafonPassed += 1;
  });
  const plafonRate = plafonTotal > 0 ? Math.round((plafonPassed / plafonTotal) * 100) : 100;

  const totalChecks = toiletTotalChecks + lantaiTotal + pintuTotal + atapTotal + plafonTotal;
  const totalPassed = toiletPassed + lantaiPassed + pintuPassed + atapPassed + plafonPassed;
  const overallCompliance = Math.round((totalPassed / totalChecks) * 100);
  const totalIssues = totalChecks - totalPassed;

  const getStatus = (rate: number): 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan' => {
    if (rate >= 90) return 'Sangat Baik';
    if (rate >= 75) return 'Baik';
    return 'Perlu Perbaikan';
  };

  const aspects: SaranaAspectScore[] = [
    {
      sheetId: 'sheet-1',
      name: 'Toilet & Sanitasi',
      totalChecks: toiletTotalChecks,
      passedChecks: toiletPassed,
      complianceRate: toiletRate,
      status: getStatus(toiletRate),
      highlightIssue: 'Kebersihan lantai toilet, penyediaan tisu, dan pemisahan toilet gender di IGD.',
    },
    {
      sheetId: 'sheet-2',
      name: 'Lantai Rumah Sakit',
      totalChecks: lantaiTotal,
      passedChecks: lantaiPassed,
      complianceRate: lantaiRate,
      status: getStatus(lantaiRate),
      highlightIssue: 'Sebagian sudut lantai ruang rawat inap lama memerlukan perbaikan konus (hospital plinth).',
    },
    {
      sheetId: 'sheet-3',
      name: 'Pintu & Jendela RS',
      totalChecks: pintuTotal,
      passedChecks: pintuPassed,
      complianceRate: pintuRate,
      status: getStatus(pintuRate),
      highlightIssue: 'Bukaan pintu brankar 120 cm dan pintu KM ranap membuka keluar telah terpenuhi.',
    },
    {
      sheetId: 'sheet-4',
      name: 'Atap Rumah Sakit',
      totalChecks: atapTotal,
      passedChecks: atapPassed,
      complianceRate: atapRate,
      status: getStatus(atapRate),
      highlightIssue: 'Struktur atap kokoh, pemeliharaan berkala talang air saat musim penghujan.',
    },
    {
      sheetId: 'sheet-5',
      name: 'Langit-langit (Plafon)',
      totalChecks: plafonTotal,
      passedChecks: plafonPassed,
      complianceRate: plafonRate,
      status: getStatus(plafonRate),
      highlightIssue: 'Terdapat bekas genangan rembesan air hujan di sebagian ruang perawatan yang menyebabkan lembab/berjamur.',
    },
  ];

  const chartData = aspects.map((a) => ({
    aspect: a.name,
    memenuhi: a.passedChecks,
    belumMemenuhi: a.totalChecks - a.passedChecks,
    rate: a.complianceRate,
  }));

  const zoneData = [
    { zone: 'IGD & Ambulans', skor: 88, status: 'Memenuhi Standar' },
    { zone: 'Rawat Jalan (Poliklinik)', skor: 78, status: 'Perlu Perbaikan Sanitasi' },
    { zone: 'Rawat Inap (Dewasa & Anak)', skor: 82, status: 'Perbaikan Plafon & Konus' },
    { zone: 'Kamar Operasi (OK) & ICU', skor: 98, status: 'Sangat Baik (Steril)' },
    { zone: 'Penunjang (Laboratorium/Farmasi)', skor: 92, status: 'Sangat Baik' },
  ];

  const analysisText = `Berdasarkan hasil inspeksi komprehensif pada 5 aspek fisik sarana dan prasarana UOBK RSUD Al-Mulk Kota Sukabumi, diperoleh tingkat kepatuhan keseluruhan sebesar ${overallCompliance}%. Aspek dengan pemenuhan tertinggi berada pada Kamar Operasi (OK) & ICU serta Pintu dan Jendela RS (${pintuRate}%) yang telah memenuhi standar bukaan brankar minimal 120 cm dan pintu toilet membuka ke luar. Namun demikian, temuan kritis teridentifikasi pada Sheet 1 (Sanitasi Toilet) terkait kebersihan ubin yang licin, ketiadaan tisu toilet, dan urinoir kotor di Rajal, serta Sheet 5 (Langit-langit) di mana terdapat bekas genangan air hujan bocor yang menimbulkan noda lembab dan jamur pada sebagian ruang perawatan.`;

  const recommendations = [
    'Lakukan penggantian dan perbaikan panel plafon (gypsum) yang berjamur dan bolong di ruang perawatan pasien akibat bekas kebocoran atap.',
    'Tingkatkan Standar Operasional Prosedur (SOP) cleaning service toilet dengan sikat lantai rutin minimal 3x sehari dan pengisian dispenser tisu secara kontinyu.',
    'Pasang pintu dan perbaiki instalasi lampu toilet dekat poli anak rawat jalan yang mati demi keselamatan dan privasi pengunjung.',
    'Lengkapi hospital plinth coved (sudut lengkung/konus) pada pertemuan lantai dan dinding ruang perawatan rawat inap yang belum sempurna.',
    'Lakukan pembersihan dan inspeksi talang air atap secara berkala menjelang musim penghujan guna mencegah rembesan air ke langit-langit.',
  ];

  const actionPlans = [
    {
      no: 1,
      aspek: 'Langit-langit (Plafon)',
      temuanMasalah: 'Terdapat bekas rembesan air hujan, plafon lembab berjamur dan bolong di ruang perawatan.',
      rencanaTindakLanjut: 'Perbaikan titik kebocoran atap dan penggantian lembaran plafon gypsum yang rusak dengan cat anti-jamur.',
      pic: 'IPSRS & Unit Kesling',
      targetWaktu: 'Minggu ke-2 berjalan',
      prioritas: 'Tinggi' as const,
    },
    {
      no: 2,
      aspek: 'Toilet & Sanitasi',
      temuanMasalah: 'Lantai toilet licin di Rajal, Ranap Kebidanan, dan Ranap Fatimah; tisu toilet kosong; urinoir kotor.',
      rencanaTindakLanjut: 'Supervisi ketat vendor CS, jadwal pembersihan harian, pengadaan refill tisu kontinyu dan karbol desinfektan.',
      pic: 'Koordinator Kesling & Vendor CS',
      targetWaktu: 'Segera (1 x 24 Jam)',
      prioritas: 'Tinggi' as const,
    },
    {
      no: 3,
      aspek: 'Toilet Rajal & Poli Anak',
      temuanMasalah: 'WC dekat poli anak lampunya mati dan daun pintu tidak ada.',
      rencanaTindakLanjut: 'Pemasangan daun pintu PVC baru berkunci indikator dan penggantian bola lampu LED terang tahan air.',
      pic: 'IPSRS',
      targetWaktu: '3 Hari Kerja',
      prioritas: 'Tinggi' as const,
    },
    {
      no: 4,
      aspek: 'Lantai RS',
      temuanMasalah: 'Sudut pertemuan lantai dan dinding ranap belum berkonus (belum hospital plinth).',
      rencanaTindakLanjut: 'Penambahan list coved plinth lengkung resin/epoxy agar debu tidak bersarang dan mudah disanitasi.',
      pic: 'Pemeliharaan Sarana (IPSRS)',
      targetWaktu: 'Bulan berjalan',
      prioritas: 'Sedang' as const,
    },
    {
      no: 5,
      aspek: 'Atap RS',
      temuanMasalah: 'Resiko penumpukan sampah daun dan debu di talang air yang memicu luapan air ke plafon.',
      rencanaTindakLanjut: 'Pembersihan rutin talang air atap tiap 2 minggu sekali dan pengecekan kawat kasa anti hama.',
      pic: 'Petugas Sarana Prasarana',
      targetWaktu: 'Rutin Dwi-Mingguan',
      prioritas: 'Sedang' as const,
    },
  ];

  return {
    overallCompliance,
    totalChecks,
    totalPassed,
    totalIssues,
    aspects,
    chartData,
    zoneData,
    analysisText,
    recommendations,
    actionPlans,
  };
}
