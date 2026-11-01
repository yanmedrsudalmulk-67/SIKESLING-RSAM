export type AplicleanModuleId =
  | 'RAWAT_JALAN'
  | 'IGD'
  | 'RANAP'
  | 'ICU_IBS'
  | 'SUPERVISI';

export type AplicleanTaskKey =
  | 'tugasRutin'
  | 'wastafel'
  | 'kacaPendaftaranFarmasi'
  | 'wcPasien'
  | 'kacaDepanPoli'
  | 'tamanDepanPoli'
  | 'alkes';

export type AplicleanTaskStatus = 'DILAKUKAN' | 'DILAKSANAKAN' | 'BELUM' | '';

export interface AplicleanTaskDefinition {
  key: AplicleanTaskKey;
  no: number;
  title: string;
  shortTitle: string;
  timeSlot: string;
  photoColumnLabel: string;
  defaultStatusText: 'DILAKUKAN' | 'DILAKSANAKAN';
}

export interface AplicleanTaskEntry {
  status: AplicleanTaskStatus;
  photoFileName: string;
  photoUrl: string;
  notes?: string;
}

export interface AplicleanRecord {
  id: string;
  moduleId: AplicleanModuleId;
  timestamp: string; // e.g. '2026-03-02 10:16:27'
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  dayName: string; // SENIN, SELASA, RABU, KAMIS, JUM'AT, SABTU, MINGGU
  unitName: string; // RAWAT JALAN, RUANG IGD, RUANG RANAP, RUANG ICU & IBS, SUPERVISI
  officerName: string; // e.g. ABU HANIFAH
  supervisorEvaluation: string; // e.g. 'Terverifikasi Supervisor Kesling'
  signatureFileName: string;
  signatureUrl: string;
  tasks: Record<AplicleanTaskKey, AplicleanTaskEntry>;
}

export interface AplicleanModuleConfig {
  id: AplicleanModuleId;
  code: string;
  title: string;
  shortTitle: string;
  reportHeader: string;
  subtitle: string;
  href: string;
  defaultUnitName: string;
  subUnits: string[];
  defaultOfficer: string;
  officerOptions: string[];
  defaultEvaluation: string;
  taskDefinitions: AplicleanTaskDefinition[];
}

export const APICLEAN_TASK_DEFINITIONS: AplicleanTaskDefinition[] = [
  {
    key: 'tugasRutin',
    no: 1,
    title: 'Tugas Rutin : Menyapu, Mengepel, WC',
    shortTitle: 'Menyapu, Mengepel, WC',
    timeSlot: '06.00 - 09.30',
    photoColumnLabel: 'FOTO TUGAS RUTIN',
    defaultStatusText: 'DILAKUKAN',
  },
  {
    key: 'wastafel',
    no: 2,
    title: 'Membersihkan Wastafel',
    shortTitle: 'Membersihkan Wastafel',
    timeSlot: '10.00 - 13.00',
    photoColumnLabel: 'FOTO WASTAFEL',
    defaultStatusText: 'DILAKSANAKAN',
  },
  {
    key: 'kacaPendaftaranFarmasi',
    no: 3,
    title: 'Membersihkan Kaca Pendaftaran dan Farmasi',
    shortTitle: 'Kaca Pendaftaran & Farmasi',
    timeSlot: '10.00 - 13.00',
    photoColumnLabel: 'FOTO KACA PENDAFTARAN DAN FARMASI',
    defaultStatusText: 'DILAKSANAKAN',
  },
  {
    key: 'wcPasien',
    no: 4,
    title: 'Membersihkan WC Pasien',
    shortTitle: 'Membersihkan WC Pasien',
    timeSlot: '10.00 - 13.00',
    photoColumnLabel: 'FOTO WC PASIEN',
    defaultStatusText: 'DILAKUKAN',
  },
  {
    key: 'kacaDepanPoli',
    no: 5,
    title: 'Membersihkan Kaca Depan Poli',
    shortTitle: 'Kaca Depan Poli',
    timeSlot: '10.00 - 13.00',
    photoColumnLabel: 'FOTO KACA DEPAN POLI',
    defaultStatusText: 'DILAKUKAN',
  },
  {
    key: 'tamanDepanPoli',
    no: 6,
    title: 'Membersihkan Taman Depan Poli',
    shortTitle: 'Taman Depan Poli',
    timeSlot: '10.00 - 13.00',
    photoColumnLabel: 'FOTO TAMAN DEPAN POLI',
    defaultStatusText: 'DILAKUKAN',
  },
  {
    key: 'alkes',
    no: 7,
    title: 'Membersihkan Alkes',
    shortTitle: 'Membersihkan Alkes',
    timeSlot: '10.00 - 13.00',
    photoColumnLabel: 'FOTO ALKES',
    defaultStatusText: 'DILAKSANAKAN',
  },
];

export const APICLEAN_MODULES: AplicleanModuleConfig[] = [
  {
    id: 'RAWAT_JALAN',
    code: 'RAWAT JALAN',
    title: 'Ruang Rawat Jalan',
    shortTitle: 'Rawat Jalan',
    reportHeader: 'LAPORAN KEGIATAN KEBERSIHAN HARIAN RAWAT JALAN',
    subtitle:
      'Ceklist harian kebersihan poliklinik, pendaftaran, farmasi, wastafel, WC pasien, taman, dan alkes Rawat Jalan.',
    href: '/supervisi/baru',
    defaultUnitName: 'RAWAT JALAN',
    subUnits: [
      'RAWAT JALAN',
      'POLI UMUM & PENYAKIT DALAM',
      'POLI ANAK, OBGYN & KIA',
      'POLI GIGI & MULUT',
      'LOKET PENDAFTARAN & FARMASI RAJAL',
    ],
    defaultOfficer: 'ABU HANIFAH',
    officerOptions: [
      'ABU HANIFAH',
      'FITRIA WULANDARI, A.M.KL',
      'HENDRA GUNAWAN',
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
    ],
    defaultEvaluation: 'Terverifikasi Supervisor Kesling — Bersih & Sesuai SOP',
    taskDefinitions: APICLEAN_TASK_DEFINITIONS,
  },
  {
    id: 'IGD',
    code: 'RUANG IGD',
    title: 'Ruang IGD',
    shortTitle: 'Ruang IGD',
    reportHeader: 'LAPORAN KEGIATAN KEBERSIHAN HARIAN RUANG IGD',
    subtitle:
      'Ceklist harian kebersihan area Triase, Resusitasi, Observasi, PONEK, WC Pasien, Drop-Off Ambulans, dan Alkes IGD.',
    href: '/supervisi/igd',
    defaultUnitName: 'RUANG IGD',
    subUnits: [
      'RUANG IGD',
      'TRIASE & RESUSITASI IGD',
      'RUANG OBSERVASI & TINDAKAN IGD',
      'RUANG PONEK & ISOLASI IGD',
      'AREA DROP-OFF AMBULANS & ADMISI IGD',
    ],
    defaultOfficer: 'HENDRA GUNAWAN',
    officerOptions: [
      'HENDRA GUNAWAN',
      'ABU HANIFAH',
      'FITRIA WULANDARI, A.M.KL',
      'AHMAD FAUZI',
      'DEDI SUPRIADI',
    ],
    defaultEvaluation: 'Terverifikasi Supervisor Kesling — Area IGD Siaga & Higienis',
    taskDefinitions: [
      {
        key: 'tugasRutin',
        no: 1,
        title: 'Tugas Rutin : Menyapu, Mengepel, WC IGD',
        shortTitle: 'Menyapu, Mengepel, WC IGD',
        timeSlot: '06.00 - 09.30',
        photoColumnLabel: 'FOTO TUGAS RUTIN IGD',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'wastafel',
        no: 2,
        title: 'Membersihkan Wastafel & Handrub Triase IGD',
        shortTitle: 'Wastafel & Handrub IGD',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO WASTAFEL IGD',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'kacaPendaftaranFarmasi',
        no: 3,
        title: 'Membersihkan Kaca Pintu Masuk & Admisi IGD',
        shortTitle: 'Kaca Pintu & Admisi IGD',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO KACA ADMISI IGD',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'wcPasien',
        no: 4,
        title: 'Membersihkan WC Pasien & Petugas IGD',
        shortTitle: 'WC Pasien & Petugas IGD',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO WC PASIEN IGD',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'kacaDepanPoli',
        no: 5,
        title: 'Membersihkan Kaca Sekat Observasi & Resusitasi',
        shortTitle: 'Kaca Observasi & Resusitasi',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO KACA OBSERVASI IGD',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'tamanDepanPoli',
        no: 6,
        title: 'Membersihkan Teras & Area Drop-Off Ambulans IGD',
        shortTitle: 'Teras & Drop-Off IGD',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO TERAS & DROP-OFF IGD',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'alkes',
        no: 7,
        title: 'Membersihkan Brankar, Troli Tindakan & Alkes IGD',
        shortTitle: 'Brankar, Troli & Alkes IGD',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO ALKES & BRANKAR IGD',
        defaultStatusText: 'DILAKSANAKAN',
      },
    ],
  },
  {
    id: 'RANAP',
    code: 'RUANG RANAP',
    title: 'Ruang Rawat Inap (Ranap)',
    shortTitle: 'Ruang Ranap',
    reportHeader: 'LAPORAN KEGIATAN KEBERSIHAN HARIAN RUANG RAWAT INAP (RANAP)',
    subtitle:
      'Ceklist harian kebersihan bangsal perawatan, kamar pasien, nurse station, kamar mandi pasien, selasar, dan bed/alkes Ranap.',
    href: '/supervisi/ranap',
    defaultUnitName: 'RUANG RANAP',
    subUnits: [
      'RUANG RANAP',
      'RANAP DEWASA & INTERNA LT. 1',
      'RANAP ANAK & PERINATOLOGI LT. 2',
      'RANAP NIFAS / KEBIDANAN (VK)',
      'RUANG ISOLASI & VIP RANAP',
    ],
    defaultOfficer: 'DEDI SUPRIADI',
    officerOptions: [
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
      'ABU HANIFAH',
      'FITRIA WULANDARI, A.M.KL',
      'HENDRA GUNAWAN',
    ],
    defaultEvaluation: 'Terverifikasi Supervisor Kesling — Kamar Ranap Bersih & Nyaman',
    taskDefinitions: [
      {
        key: 'tugasRutin',
        no: 1,
        title: 'Tugas Rutin : Menyapu, Mengepel, WC Kamar Ranap',
        shortTitle: 'Menyapu, Mengepel, WC Ranap',
        timeSlot: '06.00 - 09.30',
        photoColumnLabel: 'FOTO TUGAS RUTIN RANAP',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'wastafel',
        no: 2,
        title: 'Membersihkan Wastafel Nurse Station & Koridor Ranap',
        shortTitle: 'Wastafel Nurse Station',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO WASTAFEL RANAP',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'kacaPendaftaranFarmasi',
        no: 3,
        title: 'Membersihkan Kaca Nurse Station & Ruang Obat Ranap',
        shortTitle: 'Kaca Nurse Station & Obat',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO KACA NURSE STATION',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'wcPasien',
        no: 4,
        title: 'Membersihkan WC & Kamar Mandi Pasien Ranap',
        shortTitle: 'WC & Kamar Mandi Pasien',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO WC PASIEN RANAP',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'kacaDepanPoli',
        no: 5,
        title: 'Membersihkan Kaca Jendela Kamar & Selasar Ranap',
        shortTitle: 'Kaca Kamar & Selasar Ranap',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO KACA KAMAR RANAP',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'tamanDepanPoli',
        no: 6,
        title: 'Membersihkan Taman Tengah & Balkon Ruang Ranap',
        shortTitle: 'Taman & Balkon Ranap',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO TAMAN & SELASAR RANAP',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'alkes',
        no: 7,
        title: 'Membersihkan Bed Pasien, Nakas, Tiang Infus & Alkes',
        shortTitle: 'Bed Pasien, Nakas & Alkes',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO ALKES & BED RANAP',
        defaultStatusText: 'DILAKSANAKAN',
      },
    ],
  },
  {
    id: 'ICU_IBS',
    code: 'RUANG ICU & IBS',
    title: 'Ruang ICU & IBS',
    shortTitle: 'ICU & IBS',
    reportHeader: 'LAPORAN KEGIATAN KEBERSIHAN HARIAN RUANG ICU & IBS',
    subtitle:
      'Ceklist harian desinfeksi & sterilisasi permukaan zona kritis Intensive Care Unit (ICU), Kamar Operasi (IBS), Scrub Sink, dan Alkes Steril.',
    href: '/supervisi/icu-ibs',
    defaultUnitName: 'RUANG ICU & IBS',
    subUnits: [
      'RUANG ICU & IBS',
      'INTENSIVE CARE UNIT (ICU) SENTRAL',
      'INSTALASI BEDAH SENTRAL (IBS / KAMAR OK)',
      'RUANG PEMULIHAN (RECOVERY ROOM / RR)',
      'RUANG STERILISASI SENTRAL (CSSD)',
    ],
    defaultOfficer: 'RINA KARTIKA',
    officerOptions: [
      'RINA KARTIKA',
      'AHMAD FAUZI',
      'FITRIA WULANDARI, A.M.KL',
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
    ],
    defaultEvaluation: 'Terverifikasi Supervisor Kesling — Zona Steril ICU & IBS Sesuai Baku Mutu',
    taskDefinitions: [
      {
        key: 'tugasRutin',
        no: 1,
        title: 'Tugas Rutin : Mengepel Desinfektan, Koridor & WC ICU/IBS',
        shortTitle: 'Mengepel Desinfektan ICU/IBS',
        timeSlot: '06.00 - 09.30',
        photoColumnLabel: 'FOTO TUGAS RUTIN ICU & IBS',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'wastafel',
        no: 2,
        title: 'Membersihkan Scrub Sink / Wastafel Steril ICU & OK',
        shortTitle: 'Scrub Sink & Wastafel Steril',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO SCRUB SINK ICU & IBS',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'kacaPendaftaranFarmasi',
        no: 3,
        title: 'Membersihkan Kaca Ruang Monitor ICU & Loket Transfer IBS',
        shortTitle: 'Kaca Monitor & Transfer IBS',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO KACA MONITOR ICU & IBS',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'wcPasien',
        no: 4,
        title: 'Membersihkan WC & Ruang Ganti Petugas/Pasien ICU-IBS',
        shortTitle: 'WC & Ruang Ganti ICU-IBS',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO WC & RUANG GANTI ICU-IBS',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'kacaDepanPoli',
        no: 5,
        title: 'Membersihkan Kaca Pintu Hermetik OK & Sekat Isolasi ICU',
        shortTitle: 'Kaca Hermetik OK & Isolasi',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO KACA HERMETIK ICU & IBS',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'tamanDepanPoli',
        no: 6,
        title: 'Membersihkan Area Tunggu Keluarga & Selasar Steril ICU/IBS',
        shortTitle: 'Area Tunggu & Selasar Steril',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO SELASAR ICU & IBS',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'alkes',
        no: 7,
        title: 'Desinfeksi Meja Operasi, Bed ICU, Ventilator & Alkes Steril',
        shortTitle: 'Desinfeksi Meja OK & Alkes',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO DESINFEKSI ALKES ICU-IBS',
        defaultStatusText: 'DILAKSANAKAN',
      },
    ],
  },
  {
    id: 'SUPERVISI',
    code: 'SUPERVISI',
    title: 'Supervisi Kesling',
    shortTitle: 'Supervisi',
    reportHeader: 'LAPORAN INSPEKSI & EVALUASI SUPERVISOR KESEHATAN LINGKUNGAN',
    subtitle:
      'Instrumen verifikasi supervisor kesehatan lingkungan lintas instalasi (Rawat Jalan, IGD, Ranap, ICU & IBS) beserta tanda tangan validasi.',
    href: '/supervisi/evaluasi',
    defaultUnitName: 'SUPERVISI LINTAS RUANGAN',
    subUnits: [
      'SUPERVISI LINTAS RUANGAN',
      'SUPERVISI ZONA RAWAT JALAN & FARMASI',
      'SUPERVISI ZONA IGD & PONEK',
      'SUPERVISI ZONA RAWAT INAP (RANAP)',
      'SUPERVISI ZONA KRITIS ICU, IBS & CSSD',
    ],
    defaultOfficer: 'FITRIA WULANDARI, A.M.KL',
    officerOptions: [
      'FITRIA WULANDARI, A.M.KL',
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
      'DEDI SUPRIADI',
      'RINA KARTIKA',
    ],
    defaultEvaluation: 'Audit Supervisi Kesling Selesai — Seluruh Area Memenuhi Standar Permenkes No 7/2019',
    taskDefinitions: [
      {
        key: 'tugasRutin',
        no: 1,
        title: 'Inspeksi Kebersihan Lantai, Dinding & Plafon Ruangan',
        shortTitle: 'Inspeksi Lantai & Ruangan',
        timeSlot: '08.00 - 11.00',
        photoColumnLabel: 'FOTO INSPEKSI LANTAI & RUANG',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'wastafel',
        no: 2,
        title: 'Verifikasi Kebersihan Wastafel, Sabun Cuci Tangan & Air',
        shortTitle: 'Verifikasi Sarana Wastafel',
        timeSlot: '08.00 - 11.00',
        photoColumnLabel: 'FOTO VERIFIKASI WASTAFEL',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'kacaPendaftaranFarmasi',
        no: 3,
        title: 'Inspeksi Kebersihan Kaca, Meja Pelayanan & Area Publik',
        shortTitle: 'Inspeksi Kaca & Area Publik',
        timeSlot: '08.00 - 11.00',
        photoColumnLabel: 'FOTO INSPEKSI AREA PUBLIK',
        defaultStatusText: 'DILAKSANAKAN',
      },
      {
        key: 'wcPasien',
        no: 4,
        title: 'Audit Sanitasi Toilet/WC Pasien & Kelengkapan Desinfektan',
        shortTitle: 'Audit Sanitasi Toilet/WC',
        timeSlot: '08.00 - 11.00',
        photoColumnLabel: 'FOTO AUDIT SANITASI WC',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'kacaDepanPoli',
        no: 5,
        title: 'Pemantauan Kepatuhan Pemilahan Sampah Medis B3 & Domestik',
        shortTitle: 'Pemilahan Sampah B3 & Domestik',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO PEMILAHAN SAMPAH',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'tamanDepanPoli',
        no: 6,
        title: 'Inspeksi Kebersihan Taman, Saluran Drainase & Selasar Luar',
        shortTitle: 'Inspeksi Taman & Drainase',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO TAMAN & DRAINASE',
        defaultStatusText: 'DILAKUKAN',
      },
      {
        key: 'alkes',
        no: 7,
        title: 'Audit Desinfeksi Alkes, Linen & Kepatuhan APD Petugas',
        shortTitle: 'Audit Alkes, Linen & APD',
        timeSlot: '10.00 - 13.00',
        photoColumnLabel: 'FOTO AUDIT ALKES & APD',
        defaultStatusText: 'DILAKSANAKAN',
      },
    ],
  },
];

export const APICLEAN_UNITS: string[] = APICLEAN_MODULES.flatMap((m) => m.subUnits);

export function getAplicleanModuleConfig(
  moduleId: AplicleanModuleId = 'RAWAT_JALAN'
): AplicleanModuleConfig {
  return (
    APICLEAN_MODULES.find((m) => m.id === moduleId) || APICLEAN_MODULES[0]
  );
}

const APPSHEET_BASE =
  'https://www.appsheet.com/template/gettablefileurl?appName=APLICLEAN-680696780&tableName=RAWAT%20JALAN&fileName=';

function buildAppSheetUrl(fileName: string): string {
  if (!fileName) return '';
  return `${APPSHEET_BASE}${encodeURIComponent(fileName).replace(/%2F/g, '/')}`;
}

export function getIndonesianDayNameFromDate(dateStr: string): string {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', "JUM'AT", 'SABTU'];
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'SENIN';
  return days[parsed.getDay()];
}

export function createEmptyAplicleanTasks(
  preFillDone = true
): Record<AplicleanTaskKey, AplicleanTaskEntry> {
  return {
    tugasRutin: {
      status: preFillDone ? 'DILAKUKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
    wastafel: {
      status: preFillDone ? 'DILAKSANAKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
    kacaPendaftaranFarmasi: {
      status: preFillDone ? 'DILAKSANAKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
    wcPasien: {
      status: preFillDone ? 'DILAKUKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
    kacaDepanPoli: {
      status: preFillDone ? 'DILAKUKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
    tamanDepanPoli: {
      status: preFillDone ? 'DILAKUKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
    alkes: {
      status: preFillDone ? 'DILAKSANAKAN' : 'BELUM',
      photoFileName: '',
      photoUrl: '',
    },
  };
}

export function calculateAplicleanRecordProgress(record: AplicleanRecord): {
  completedCount: number;
  photoCount: number;
  totalTasks: number;
  percentage: number;
} {
  const keys = APICLEAN_TASK_DEFINITIONS.map((d) => d.key);
  let completedCount = 0;
  let photoCount = 0;

  for (const k of keys) {
    const entry = record.tasks[k];
    if (!entry) continue;
    const hasPhoto = Boolean(entry.photoUrl || entry.photoFileName);
    if (entry.status === 'DILAKUKAN' || entry.status === 'DILAKSANAKAN' || hasPhoto) {
      completedCount += 1;
    }
    if (hasPhoto) {
      photoCount += 1;
    }
  }

  const totalTasks = keys.length;
  const percentage = Math.round((completedCount / totalTasks) * 100);
  return { completedCount, photoCount, totalTasks, percentage };
}

interface RawSeedRow {
  timestamp: string;
  dayName: string;
  officerName?: string;
  supervisorEvaluation?: string;
  signatureFile?: string;
  tugasRutin?: [AplicleanTaskStatus, string];
  wastafel?: [AplicleanTaskStatus, string];
  kacaPendaftaranFarmasi?: [AplicleanTaskStatus, string];
  wcPasien?: [AplicleanTaskStatus, string];
  kacaDepanPoli?: [AplicleanTaskStatus, string];
  tamanDepanPoli?: [AplicleanTaskStatus, string];
  alkes?: [AplicleanTaskStatus, string];
}

const RAW_APICLEAN_SEED_ROWS: RawSeedRow[] = [
  {
    timestamp: '2026-03-02 10:16:27',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-02-2026 10-16-03.FOTO TUGAS RUTIN.031827.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-02-2026 10-16-03.FOTO WC PASIEN.031827.jpg'],
    alkes: ['DILAKUKAN', 'RAWAT JALAN_Images/03-02-2026 10-16-03.FOTO ALKES.031828.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-02-2026 10-16-03.TANDA TANGAN.031830.png',
  },
  {
    timestamp: '2026-03-03 10:30:25',
    dayName: 'SELASA',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-03-2026 10-30-45.FOTO TUGAS RUTIN.033211.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKUKAN',
      'RAWAT JALAN_Images/03-03-2026 10-30-45.FOTO KACA PENDAFATARAN DAN FARMASI.033210.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-03-2026 10-30-45.FOTO WC PASIEN.033211.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-03-2026 10-30-45.TANDA TANGAN.033213.png',
  },
  {
    timestamp: '2026-03-04 10:50:14',
    dayName: 'RABU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-04-2026 10-50-14.FOTO TUGAS RUTIN.035138.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-04-2026 10-50-14.FOTO WC PASIEN.035138.jpg'],
    kacaDepanPoli: ['DILAKUKAN', 'RAWAT JALAN_Images/03-04-2026 10-50-14.FOTO KACA DEPAN POLI.035138.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-04-2026 10-50-14.TANDA TANGAN.035141.png',
  },
  {
    timestamp: '2026-03-05 11:25:25',
    dayName: 'KAMIS',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-05-2026 11-25-25.FOTO TUGAS RUTIN.042718.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-05-2026 11-25-25.FOTO WASTAFEL.042718.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-05-2026 11-25-25.FOTO WC PASIEN.042718.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-05-2026 11-25-25.TANDA TANGAN.042721.png',
  },
  {
    timestamp: '2026-03-09 12:44:54',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-09-2026 12-44-54.FOTO TUGAS RUTIN.054604.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-09-2026 12-44-54.FOTO WASTAFEL.054604.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-09-2026 12-44-54.FOTO WC PASIEN.054604.jpg'],
  },
  {
    timestamp: '2026-03-12 11:01:43',
    dayName: 'KAMIS',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-12-2026 11-01-43.FOTO TUGAS RUTIN.040240.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-12-2026 11-01-43.FOTO WASTAFEL.040240.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/03-12-2026 11-01-43.FOTO KACA PENDAFATARAN DAN FARMASI.040240.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-12-2026 11-01-43.FOTO WC PASIEN.040330.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-12-2026 11-01-43.TANDA TANGAN.040243.png',
  },
  {
    timestamp: '2026-03-14 10:21:05',
    dayName: 'SABTU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-14-2026 10-21-05.FOTO TUGAS RUTIN.044245.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-14-2026 10-21-05.FOTO WASTAFEL.044245.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-14-2026 10-21-05.FOTO WC PASIEN.044245.jpg'],
    tamanDepanPoli: [
      'DILAKUKAN',
      'RAWAT JALAN_Images/03-14-2026 10-21-05.FOTO TAMAN DEPAN POLI.044248.jpg',
    ],
    signatureFile: 'RAWAT JALAN_Images/03-14-2026 10-21-05.TANDA TANGAN.044248.png',
  },
  {
    timestamp: '2026-03-16 11:42:40',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-16-2026 11-42-40.FOTO TUGAS RUTIN.044358.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-16-2026 11-42-40.FOTO WASTAFEL.044358.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-16-2026 11-42-40.FOTO WC PASIEN.044359.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-16-2026 11-42-40.TANDA TANGAN.044401.png',
  },
  {
    timestamp: '2026-03-17 11:14:33',
    dayName: 'SELASA',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-17-2026 11-14-33.FOTO TUGAS RUTIN.041656.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-17-2026 11-14-33.FOTO WASTAFEL.041656.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/03-17-2026 11-14-33.FOTO KACA PENDAFATARAN DAN FARMASI.041656.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-17-2026 11-14-33.FOTO WC PASIEN.041700.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-17-2026 11-14-33.TANDA TANGAN.041700.png',
  },
  {
    timestamp: '2026-03-25 12:09:50',
    dayName: 'RABU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-25-2026 12-09-50.FOTO TUGAS RUTIN.051108.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-25-2026 12-09-50.FOTO WASTAFEL.051108.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/03-25-2026 12-09-50.FOTO KACA PENDAFATARAN DAN FARMASI.051108.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-25-2026 12-09-50.FOTO WC PASIEN.051110.jpg'],
  },
  {
    timestamp: '2026-03-28 10:58:08',
    dayName: 'SABTU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-28-2026 10-58-08.FOTO TUGAS RUTIN.040002.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-28-2026 10-58-08.FOTO WASTAFEL.040002.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/03-28-2026 10-58-08.FOTO KACA PENDAFATARAN DAN FARMASI.040002.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/03-28-2026 10-58-08.FOTO WC PASIEN.040005.jpg'],
    signatureFile: 'RAWAT JALAN_Images/03-28-2026 10-58-08.TANDA TANGAN.040005.png',
  },
  {
    timestamp: '2026-03-30 14:08:16',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/03-30-2026 14-08-16.FOTO TUGAS RUTIN.070928.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/03-30-2026 14-08-16.FOTO WASTAFEL.070928.jpg'],
    kacaPendaftaranFarmasi: ['DILAKSANAKAN', ''],
  },
  {
    timestamp: '2026-04-07 13:19:38',
    dayName: 'SELASA',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-07-2026 13-19-38.FOTO TUGAS RUTIN.062040.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-07-2026 13-19-38.FOTO WASTAFEL.062040.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/04-07-2026 13-19-38.FOTO KACA PENDAFATARAN DAN FARMASI.062040.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-07-2026 13-19-38.FOTO WC PASIEN.062043.jpg'],
    signatureFile: 'RAWAT JALAN_Images/04-07-2026 13-19-38.TANDA TANGAN.062042.png',
  },
  {
    timestamp: '2026-04-09 12:40:29',
    dayName: 'KAMIS',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-09-2026 12-40-29.FOTO TUGAS RUTIN.054201.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-09-2026 12-40-29.FOTO WASTAFEL.054201.jpg'],
    kacaPendaftaranFarmasi: ['DILAKSANAKAN', ''],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-09-2026 12-40-29.FOTO WC PASIEN.054201.jpg'],
    kacaDepanPoli: ['DILAKUKAN', 'RAWAT JALAN_Images/04-09-2026 12-40-29.FOTO KACA DEPAN POLI.054204.jpg'],
  },
  {
    timestamp: '2026-04-10 11:57:11',
    dayName: "JUM'AT",
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-10-2026 11-57-11.FOTO TUGAS RUTIN.045849.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-10-2026 11-57-11.FOTO WASTAFEL.045849.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/04-10-2026 11-57-11.FOTO KACA PENDAFATARAN DAN FARMASI.045849.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-10-2026 11-57-11.FOTO WC PASIEN.045851.jpg'],
  },
  {
    timestamp: '2026-04-13 12:55:00',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-13-2026 12-55-00.FOTO TUGAS RUTIN.055650.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-13-2026 12-55-00.FOTO WASTAFEL.055650.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/04-13-2026 12-55-00.FOTO KACA PENDAFATARAN DAN FARMASI.055650.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-13-2026 12-55-00.FOTO WC PASIEN.055653.jpg'],
    kacaDepanPoli: ['DILAKUKAN', 'RAWAT JALAN_Images/04-13-2026 12-55-00.FOTO KACA DEPAN POLI.055653.jpg'],
  },
  {
    timestamp: '2026-04-15 15:40:50',
    dayName: 'RABU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-15-2026 15-40-50.FOTO TUGAS RUTIN.084157.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-15-2026 15-40-50.FOTO WASTAFEL.084157.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-15-2026 15-40-50.FOTO WC PASIEN.084157.jpg'],
  },
  {
    timestamp: '2026-04-20 13:42:02',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-20-2026 13-42-02.FOTO TUGAS RUTIN.065120.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-20-2026 13-42-02.FOTO WASTAFEL.065120.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/04-20-2026 13-42-02.FOTO KACA PENDAFATARAN DAN FARMASI.065120.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-20-2026 13-42-02.FOTO WC PASIEN.065123.jpg'],
    signatureFile: 'RAWAT JALAN_Images/04-20-2026 13-42-02.TANDA TANGAN.065123.png',
  },
  {
    timestamp: '2026-04-23 13:25:00',
    dayName: 'KAMIS',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-23-2026 13-25-00.FOTO TUGAS RUTIN.062634.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-23-2026 13-25-00.FOTO WASTAFEL.062634.jpg'],
    kacaPendaftaranFarmasi: ['DILAKSANAKAN', ''],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-23-2026 13-25-00.FOTO WC PASIEN.062634.jpg'],
    kacaDepanPoli: ['DILAKUKAN', 'RAWAT JALAN_Images/04-23-2026 13-25-00.FOTO KACA DEPAN POLI.062637.jpg'],
  },
  {
    timestamp: '2026-04-27 12:11:45',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/04-27-2026 12-11-45.FOTO TUGAS RUTIN.051329.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-27-2026 12-11-45.FOTO WASTAFEL.051329.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/04-27-2026 12-11-45.FOTO KACA PENDAFATARAN DAN FARMASI.051329.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/04-27-2026 12-11-45.FOTO WC PASIEN.051331.jpg'],
    alkes: ['DILAKSANAKAN', 'RAWAT JALAN_Images/04-27-2026 12-11-45.FOTO ALKES.051331.jpg'],
    signatureFile: 'RAWAT JALAN_Images/04-27-2026 12-11-45.TANDA TANGAN.051331.png',
  },
  {
    timestamp: '2026-05-02 09:06:03',
    dayName: 'SABTU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/05-02-2026 09-06-03.FOTO TUGAS RUTIN.020721.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/05-02-2026 09-06-03.FOTO WASTAFEL.020721.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/05-02-2026 09-06-03.FOTO KACA PENDAFATARAN DAN FARMASI.020721.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/05-02-2026 09-06-03.FOTO WC PASIEN.020724.jpg'],
    alkes: ['DILAKSANAKAN', 'RAWAT JALAN_Images/05-02-2026 09-06-03.FOTO ALKES.020724.jpg'],
    signatureFile: 'RAWAT JALAN_Images/05-02-2026 09-06-03.TANDA TANGAN.020725.png',
  },
  {
    timestamp: '2026-05-04 13:47:55',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/05-04-2026 13-47-55.FOTO TUGAS RUTIN.064941.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/05-04-2026 13-47-55.FOTO WASTAFEL.064941.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/05-04-2026 13-47-55.FOTO WC PASIEN.064941.jpg'],
  },
  {
    timestamp: '2026-05-05 14:06:17',
    dayName: 'SELASA',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/05-05-2026 14-06-17.FOTO TUGAS RUTIN.070710.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/05-05-2026 14-06-17.FOTO WASTAFEL.070710.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/05-05-2026 14-06-17.FOTO KACA PENDAFATARAN DAN FARMASI.070710.jpg',
    ],
    tamanDepanPoli: [
      'DILAKUKAN',
      'RAWAT JALAN_Images/05-05-2026 14-06-17.FOTO TAMAN DEPAN POLI.070713.jpg',
    ],
  },
  {
    timestamp: '2026-07-22 10:38:26',
    dayName: 'RABU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-22-2026 10-38-26.FOTO TUGAS RUTIN.040652.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-22-2026 10-38-26.FOTO WASTAFEL.040652.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-22-2026 10-38-26.FOTO KACA PENDAFATARAN DAN FARMASI.040652.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/07-22-2026 10-38-26.FOTO WC PASIEN.040655.jpg'],
  },
  {
    timestamp: '2026-07-23 19:31:20',
    dayName: 'KAMIS',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-23-2026 19-31-20.FOTO TUGAS RUTIN.123250.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-23-2026 19-31-20.FOTO WASTAFEL.123250.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-23-2026 19-31-20.FOTO KACA PENDAFATARAN DAN FARMASI.123250.jpg',
    ],
    wcPasien: ['DILAKUKAN', ''],
    signatureFile: 'RAWAT JALAN_Images/07-23-2026 19-31-20.TANDA TANGAN.123253.png',
  },
  {
    timestamp: '2026-07-24 20:09:37',
    dayName: "JUM'AT",
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-24-2026 20-09-37.FOTO TUGAS RUTIN.131231.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-24-2026 20-09-37.FOTO WASTAFEL.131231.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-24-2026 20-09-37.FOTO KACA PENDAFATARAN DAN FARMASI.131231.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/07-24-2026 20-09-37.FOTO WC PASIEN.131233.jpg'],
    alkes: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-24-2026 20-09-37.FOTO ALKES.131234.jpg'],
    signatureFile: 'RAWAT JALAN_Images/07-24-2026 20-09-37.TANDA TANGAN.131234.png',
  },
  {
    timestamp: '2026-07-27 13:30:20',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-27-2026 13-30-20.FOTO TUGAS RUTIN.063140.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-27-2026 13-30-20.FOTO WASTAFEL.063140.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-27-2026 13-30-20.FOTO KACA PENDAFATARAN DAN FARMASI.063140.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/07-27-2026 13-30-20.FOTO WC PASIEN.063142.jpg'],
    alkes: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-27-2026 13-30-20.FOTO ALKES.063142.jpg'],
    signatureFile: 'RAWAT JALAN_Images/07-27-2026 13-30-20.TANDA TANGAN.063145.png',
  },
  {
    timestamp: '2026-07-28 11:26:10',
    dayName: 'SELASA',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-28-2026 11-26-10.FOTO TUGAS RUTIN.042812.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-28-2026 11-26-10.FOTO WASTAFEL.042813.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-28-2026 11-26-10.FOTO KACA PENDAFATARAN DAN FARMASI.042812.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/07-28-2026 11-26-10.FOTO WC PASIEN.042815.jpg'],
    kacaDepanPoli: ['DILAKUKAN', 'RAWAT JALAN_Images/07-28-2026 11-26-10.FOTO KACA DEPAN POLI.042815.jpg'],
    alkes: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-28-2026 11-26-10.FOTO ALKES.042815.jpg'],
    signatureFile: 'RAWAT JALAN_Images/07-28-2026 11-26-10.TANDA TANGAN.042818.png',
  },
  {
    timestamp: '2026-07-29 13:37:18',
    dayName: 'RABU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-29-2026 13-37-18.FOTO TUGAS RUTIN.063831.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-29-2026 13-37-18.FOTO WASTAFEL.063831.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-29-2026 13-37-18.FOTO KACA PENDAFATARAN DAN FARMASI.063831.jpg',
    ],
    alkes: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-29-2026 13-37-18.FOTO ALKES.063834.jpg'],
    signatureFile: 'RAWAT JALAN_Images/07-29-2026 13-37-18.TANDA TANGAN.063834.png',
  },
  {
    timestamp: '2026-07-30 15:25:47',
    dayName: 'KAMIS',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-30-2026 15-25-47.FOTO TUGAS RUTIN.082706.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-30-2026 15-25-47.FOTO WASTAFEL.082706.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-30-2026 15-25-47.FOTO KACA PENDAFATARAN DAN FARMASI.082706.jpg',
    ],
    kacaDepanPoli: ['DILAKUKAN', 'RAWAT JALAN_Images/07-30-2026 15-25-47.FOTO KACA DEPAN POLI.082709.jpg'],
  },
  {
    timestamp: '2026-07-31 17:42:01',
    dayName: "JUM'AT",
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/07-31-2026 17-42-01.FOTO TUGAS RUTIN.104248.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/07-31-2026 17-42-01.FOTO WASTAFEL.104248.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/07-31-2026 17-42-01.FOTO KACA PENDAFATARAN DAN FARMASI.104248.jpg',
    ],
  },
  {
    timestamp: '2026-08-07 10:59:51',
    dayName: "JUM'AT",
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/08-07-2026 10-59-51.FOTO TUGAS RUTIN.040121.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/08-07-2026 10-59-51.FOTO WASTAFEL.040120.jpg'],
    kacaPendaftaranFarmasi: [
      'DILAKSANAKAN',
      'RAWAT JALAN_Images/08-07-2026 10-59-51.FOTO KACA PENDAFATARAN DAN FARMASI.040120.jpg',
    ],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/08-07-2026 10-59-51.FOTO WC PASIEN.040123.jpg'],
    signatureFile: 'RAWAT JALAN_Images/08-07-2026 10-59-51.TANDA TANGAN.040123.png',
  },
  {
    timestamp: '2026-08-08 12:29:59',
    dayName: 'SABTU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/08-08-2026 12-29-59.FOTO TUGAS RUTIN.053109.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/08-08-2026 12-29-59.FOTO WASTAFEL.053109.jpg'],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/08-08-2026 12-29-59.FOTO WC PASIEN.053109.jpg'],
  },
  {
    timestamp: '2026-08-10 22:08:56',
    dayName: 'SENIN',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/08-10-2026 22-08-56.FOTO TUGAS RUTIN.151109.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/08-10-2026 22-08-56.FOTO WASTAFEL.151109.jpg'],
  },
  {
    timestamp: '2026-08-18 22:05:06',
    dayName: 'SELASA',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/08-18-2026 22-05-06.FOTO TUGAS RUTIN.150731.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/08-18-2026 22-05-06.FOTO WASTAFEL.150731.jpg'],
    kacaPendaftaranFarmasi: ['DILAKSANAKAN', ''],
    tamanDepanPoli: [
      'DILAKUKAN',
      'RAWAT JALAN_Images/08-18-2026 22-05-06.FOTO TAMAN DEPAN POLI.150731.jpg',
    ],
  },
  {
    timestamp: '2026-09-02 11:31:56',
    dayName: 'RABU',
    officerName: 'ABU HANIFAH',
    supervisorEvaluation: 'Terverifikasi Supervisor Kesling',
    tugasRutin: ['DILAKUKAN', 'RAWAT JALAN_Images/09-02-2026 11-31-56.FOTO TUGAS RUTIN.043305.jpg'],
    wastafel: ['DILAKSANAKAN', 'RAWAT JALAN_Images/09-02-2026 11-31-56.FOTO WASTAFEL.043305.jpg'],
    kacaPendaftaranFarmasi: ['DILAKSANAKAN', ''],
    wcPasien: ['DILAKUKAN', 'RAWAT JALAN_Images/09-02-2026 11-31-56.FOTO WC PASIEN.043305.jpg'],
    signatureFile: 'RAWAT JALAN_Images/09-02-2026 11-31-56.TANDA TANGAN.043309.png',
  },
];

function mapSeedRowToRecord(
  row: RawSeedRow,
  idx: number,
  moduleId: AplicleanModuleId,
  prefix: string,
  unitOverride?: string,
  officerOverride?: string,
  evaluationOverride?: string
): AplicleanRecord {
  const [datePart, timePart] = row.timestamp.split(' ');
  const buildTask = (tuple?: [AplicleanTaskStatus, string]): AplicleanTaskEntry => {
    if (!tuple) {
      return { status: 'BELUM', photoFileName: '', photoUrl: '' };
    }
    return {
      status: tuple[0],
      photoFileName: tuple[1],
      photoUrl: buildAppSheetUrl(tuple[1]),
    };
  };

  const sigFile = row.signatureFile || '';

  return {
    id: `${prefix}-2026-${String(idx + 1).padStart(3, '0')}`,
    moduleId,
    timestamp: row.timestamp,
    date: datePart,
    time: timePart || '10:00:00',
    dayName: row.dayName || getIndonesianDayNameFromDate(datePart),
    unitName: unitOverride || 'RAWAT JALAN',
    officerName: officerOverride || row.officerName || 'ABU HANIFAH',
    supervisorEvaluation:
      evaluationOverride || row.supervisorEvaluation || 'Sesuai Standar SOP',
    signatureFileName: sigFile,
    signatureUrl: buildAppSheetUrl(sigFile),
    tasks: {
      tugasRutin: buildTask(row.tugasRutin),
      wastafel: buildTask(row.wastafel),
      kacaPendaftaranFarmasi: buildTask(row.kacaPendaftaranFarmasi),
      wcPasien: buildTask(row.wcPasien),
      kacaDepanPoli: buildTask(row.kacaDepanPoli),
      tamanDepanPoli: buildTask(row.tamanDepanPoli),
      alkes: buildTask(row.alkes),
    },
  };
}

/**
 * Returns the 36 historical Rawat Jalan records (default) or records for a specific module.
 */
export function createInitialAplicleanRecords(
  moduleId: AplicleanModuleId = 'RAWAT_JALAN'
): AplicleanRecord[] {
  if (moduleId === 'RAWAT_JALAN') {
    return RAW_APICLEAN_SEED_ROWS.map((row, idx) =>
      mapSeedRowToRecord(row, idx, 'RAWAT_JALAN', 'APC-RJ', 'RAWAT JALAN')
    ).reverse();
  }

  if (moduleId === 'IGD') {
    const igdSubUnits = [
      'RUANG IGD',
      'TRIASE & RESUSITASI IGD',
      'RUANG OBSERVASI & TINDAKAN IGD',
      'RUANG PONEK & ISOLASI IGD',
    ];
    return RAW_APICLEAN_SEED_ROWS.filter((_, i) => i % 2 === 0)
      .map((row, idx) =>
        mapSeedRowToRecord(
          row,
          idx,
          'IGD',
          'APC-IGD',
          igdSubUnits[idx % igdSubUnits.length],
          idx % 3 === 0 ? 'ABU HANIFAH' : 'HENDRA GUNAWAN',
          'Terverifikasi Supervisor Kesling — Area IGD Siaga & Higienis'
        )
      )
      .reverse();
  }

  if (moduleId === 'RANAP') {
    const ranapSubUnits = [
      'RUANG RANAP',
      'RANAP DEWASA & INTERNA LT. 1',
      'RANAP ANAK & PERINATOLOGI LT. 2',
      'RANAP NIFAS / KEBIDANAN (VK)',
    ];
    return RAW_APICLEAN_SEED_ROWS.filter((_, i) => i % 2 === 1)
      .map((row, idx) =>
        mapSeedRowToRecord(
          row,
          idx,
          'RANAP',
          'APC-RNP',
          ranapSubUnits[idx % ranapSubUnits.length],
          idx % 2 === 0 ? 'DEDI SUPRIADI' : 'SITI NURHALIZA',
          'Terverifikasi Supervisor Kesling — Kamar Ranap Bersih & Nyaman'
        )
      )
      .reverse();
  }

  if (moduleId === 'ICU_IBS') {
    const icuSubUnits = [
      'RUANG ICU & IBS',
      'INTENSIVE CARE UNIT (ICU) SENTRAL',
      'INSTALASI BEDAH SENTRAL (IBS / KAMAR OK)',
      'RUANG PEMULIHAN (RECOVERY ROOM / RR)',
    ];
    return RAW_APICLEAN_SEED_ROWS.slice(20)
      .map((row, idx) =>
        mapSeedRowToRecord(
          row,
          idx,
          'ICU_IBS',
          'APC-ICU',
          icuSubUnits[idx % icuSubUnits.length],
          idx % 2 === 0 ? 'RINA KARTIKA' : 'AHMAD FAUZI',
          'Terverifikasi Supervisor Kesling — Zona Steril ICU & IBS Sesuai Baku Mutu'
        )
      )
      .reverse();
  }

  // SUPERVISI
  const supervisiSubUnits = [
    'SUPERVISI LINTAS RUANGAN',
    'SUPERVISI ZONA RAWAT JALAN & FARMASI',
    'SUPERVISI ZONA IGD & PONEK',
    'SUPERVISI ZONA RAWAT INAP (RANAP)',
    'SUPERVISI ZONA KRITIS ICU, IBS & CSSD',
  ];
  return RAW_APICLEAN_SEED_ROWS.slice(20)
    .map((row, idx) =>
      mapSeedRowToRecord(
        row,
        idx,
        'SUPERVISI',
        'APC-SPV',
        supervisiSubUnits[idx % supervisiSubUnits.length],
        'FITRIA WULANDARI, A.M.KL',
        'Audit Supervisi Kesling Selesai — Memenuhi Standar Permenkes No 7/2019'
      )
    )
    .reverse();
}

export function createAllAplicleanRecords(): AplicleanRecord[] {
  return [
    ...createInitialAplicleanRecords('RAWAT_JALAN'),
    ...createInitialAplicleanRecords('IGD'),
    ...createInitialAplicleanRecords('RANAP'),
    ...createInitialAplicleanRecords('ICU_IBS'),
    ...createInitialAplicleanRecords('SUPERVISI'),
  ];
}

const APICLEAN_STORAGE_KEY = 'sikesling_apliclean_records_v2';

export function loadAplicleanRecords(): AplicleanRecord[] {
  const initial = createAllAplicleanRecords();
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(APICLEAN_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as AplicleanRecord[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((rec) => ({
        ...rec,
        moduleId: rec.moduleId || 'RAWAT_JALAN',
      }));
    }
    return initial;
  } catch {
    return initial;
  }
}

export function saveAplicleanRecords(records: AplicleanRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(APICLEAN_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(
      new CustomEvent('sikesling_apliclean_updated', { detail: records })
    );
  } catch {
    // ignore storage quota errors
  }
}
