export type SupervisiCardId =
  | 'RAWAT_JALAN'
  | 'IGD'
  | 'RANAP_ICU_IBS'
  | 'RANAP_USMAN'
  | 'RANAP_AISYAH'
  | 'RANAP_FATIMAH'
  | 'RANAP_KHADIJAH'
  | 'MANAJEMEN'
  | 'HALAMAN'
  | 'SUPERVISI';

export type TaskPositiveLabel = 'DILAKUKAN' | 'DILAKSANAKAN';
export type TaskStatusValue = '' | 'TIDAK' | 'DILAKUKAN' | 'DILAKSANAKAN';

export interface RoomTaskSchema {
  id: string;
  label: string;
  timeWindow?: string;
  positiveLabel: TaskPositiveLabel;
  photoSlotLabels: string[]; // empty for tasks without photo (e.g. PENGANTARAN OBAT in HALAMAN), 1 slot for standard, 3 slots for ICU/IBS & MANAJEMEN
}

export interface SupervisiCardConfig {
  id: SupervisiCardId;
  title: string;
  subtitle: string;
  formTitle: string;
  reportTitle: string;
  imageSrc: string;
  labelColorClass: string;
  borderHoverClass: string;
  badgeBgClass: string;
  accentHex: string;
  kind: 'room_checklist' | 'supervisi_audit';
  defaultUnit: string;
  unitOptions: string[];
  officerOptions: string[];
  featuredOfficers?: string[];
  tasks: RoomTaskSchema[];
  hasEvaluasiSupervisor: boolean;
  signatureSlotLabels: string[];
}

export const HARI_OPTIONS = [
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
  'MINGGU',
] as const;

export type HariValue = (typeof HARI_OPTIONS)[number] | '';

const STANDARD_RANAP_TASKS: RoomTaskSchema[] = [
  {
    id: 'tugas_rutin',
    label: 'TUGAS RUTIN : MENYAPU, MENGEPEL, WC (06.00 - 09.30)',
    timeWindow: '06.00 - 09.30',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO TUGAS RUTIN'],
  },
  {
    id: 'kaca',
    label: 'MEMBERSIHKAN KACA (10.00 - 13.00)',
    timeWindow: '10.00 - 13.00',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO KACA'],
  },
  {
    id: 'wc',
    label: 'MEMBERSIHKAN WC (10.00 - 13.00)',
    timeWindow: '10.00 - 13.00',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO WC'],
  },
  {
    id: 'alkes_1',
    label: 'MEMBERSIHKAN ALKES 1 (10.00 - 13.00)',
    timeWindow: '10.00 - 13.00',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO ALKES 1'],
  },
  {
    id: 'langit_langit',
    label: 'MEMBERSIHKAN LANGIT-LANGIT (10.00 - 13.00)',
    timeWindow: '10.00 - 13.00',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO LANGIT-LANGIT'],
  },
  {
    id: 'alkes_2',
    label: 'MEMBERSIHKAN ALKES 2 (10.00 - 13.00)',
    timeWindow: '10.00 - 13.00',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO ALKES 2'],
  },
  {
    id: 'general_cleaning',
    label: 'GENERAL CLEANING (10.00 - 13.00)',
    timeWindow: '10.00 - 13.00',
    positiveLabel: 'DILAKUKAN',
    photoSlotLabels: ['FOTO GENERAL CLEANING'],
  },
];

export const SUPERVISI_CARDS: SupervisiCardConfig[] = [
  {
    id: 'RAWAT_JALAN',
    title: 'RAWAT JALAN',
    subtitle: 'Poliklinik, Pendaftaran & Farmasi',
    formTitle: 'RAWAT JALAN Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN RAWAT JALAN',
    imageSrc: '/assets/aistudio/supervisi-cards/rawat-jalan.png',
    labelColorClass: 'text-[#0277BD] dark:text-sky-400',
    borderHoverClass: 'hover:border-[#0277BD]',
    badgeBgClass: 'bg-[#0277BD]/10 text-[#0277BD]',
    accentHex: '#0277BD',
    kind: 'room_checklist',
    defaultUnit: 'RAWAT JALAN',
    unitOptions: [
      'RAWAT JALAN',
      'POLI UMUM & PENYAKIT DALAM',
      'POLI ANAK, OBGYN & KIA',
      'POLI GIGI & MULUT',
      'LOKET PENDAFTARAN & FARMASI RAJAL',
    ],
    officerOptions: [
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
    ],
    featuredOfficers: ['ABU HANIFAH'],
    tasks: [
      {
        id: 'tugas_rutin',
        label: 'TUGAS RUTIN : MENYAPU, MENGEPEL, WC (06.00 - 09.30)',
        timeWindow: '06.00 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO TUGAS RUTIN'],
      },
      {
        id: 'wastafel',
        label: 'MEMBERISHKAN WASTAFEL (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO WASTAFEL'],
      },
      {
        id: 'kaca_pendaftaran_farmasi',
        label: 'MEMBERSIHKAN KACA PENDAFTARAN DAN FARMASI (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO KACA PENDAFATARAN DAN FARMASI'],
      },
      {
        id: 'wc_pasien',
        label: 'MEMBERSIHKAN WC PASIEN (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO WC PASIEN'],
      },
      {
        id: 'kaca_depan_poli',
        label: 'MEMBERSIHKAN KACA DEPAN POLI (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO KACA DEPAN POLI'],
      },
      {
        id: 'taman_depan_poli',
        label: 'MEMBERSIHKAN TAMAN DEPAN POLI (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO TAMAN DEPAN POLI'],
      },
      {
        id: 'alkes',
        label: 'MEMBERSIHKAN ALKES (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO ALKES'],
      },
    ],
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'IGD',
    title: 'IGD',
    subtitle: 'Instalasi Gawat Darurat & Ruang EK',
    formTitle: 'IGD Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN IGD',
    imageSrc: '/assets/aistudio/supervisi-cards/igd.png',
    labelColorClass: 'text-[#C62828] dark:text-rose-400',
    borderHoverClass: 'hover:border-[#C62828]',
    badgeBgClass: 'bg-[#C62828]/10 text-[#C62828]',
    accentHex: '#C62828',
    kind: 'room_checklist',
    defaultUnit: 'IGD',
    unitOptions: [
      'IGD',
      'TRIASE & RESUSITASI IGD',
      'RUANG OBSERVASI & TINDAKAN IGD',
      'RUANG EK & PONEK IGD',
    ],
    officerOptions: [
      'HENDRA GUNAWAN',
      'AHMAD FAUZI',
      'ABU HANIFAH',
      'DEDI SUPRIADI',
    ],
    tasks: [
      {
        id: 'tugas_rutin',
        label: 'TUGAS RUTIN : MENYAPU, MENGEPEL, WC (06.00 - 09.30)',
        timeWindow: '06.00 - 09.30',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO TUGAS RUTIN'],
      },
      {
        id: 'ruang_ek',
        label: 'MEMBERISHKAN RUANG EK (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO RUANG EK'],
      },
      {
        id: 'kaca',
        label: 'MEMBERSIHKAN KACA (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO KACA'],
      },
      {
        id: 'alkes_1',
        label: 'MEMBERSIHKAN ALKES (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO ALKES'],
      },
      {
        id: 'wc',
        label: 'MEMBERSIHKAN WC (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO WC'],
      },
      {
        id: 'alkes_23',
        label: 'MEMBERSIHKAN ALKES (10.00 - 13.00)_23',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO WC_24'],
      },
      {
        id: 'langit_langit',
        label: 'MEMBERSIHKAN LANGIT-LANGIT (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO LANGIT-LANGIT'],
      },
    ],
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'RANAP_ICU_IBS',
    title: 'RANAP ICU DAN IBS',
    subtitle: 'Intensive Care Unit & Instalasi Bedah Sentral',
    formTitle: 'RANAP ICU DAN IBS Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN RANAP ICU DAN IBS',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-icu-ibs.png',
    labelColorClass: 'text-[#1B8720] dark:text-emerald-400',
    borderHoverClass: 'hover:border-[#1B8720]',
    badgeBgClass: 'bg-[#1B8720]/10 text-[#1B8720]',
    accentHex: '#1B8720',
    kind: 'room_checklist',
    defaultUnit: 'RANAP ICU DAN IBS',
    unitOptions: [
      'RANAP ICU DAN IBS',
      'RUANG INTENSIVE CARE UNIT (ICU)',
      'KAMAR OPERASI / IBS 1 & 2',
      'RUANG PEMULIHAN (RECOVERY ROOM)',
    ],
    officerOptions: [
      'AHMAD FAUZI',
      'TAUFIK HIDAYAT',
      'RINA MARLINA',
      'ABU HANIFAH',
    ],
    tasks: [
      {
        id: 'tugas_rutin',
        label: 'TUGAS RUTIN : MENYAPU, MENGEPEL, WC (06.00 - 09.30)',
        timeWindow: '06.00 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [
          'FOTO TUGAS RUTIN',
          'FOTO TUGAS RUTIN_5',
          'FOTO TUGAS RUTIN_6',
        ],
      },
      {
        id: 'kaca_1',
        label: 'MEMBERSIHKAN KACA 1 (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO KACA 1', 'FOTO KACA 1_9', 'FOTO KACA 1_10'],
      },
      {
        id: 'wc',
        label: 'MEMBERSIHKAN WC (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO WC', 'FOTO WC_13', 'FOTO WC_14'],
      },
      {
        id: 'alkes',
        label: 'MEMBERSIHKAN ALKES (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO ALKES', 'FOTO ALKES_17', 'FOTO ALKES_18'],
      },
      {
        id: 'langit_langit',
        label: 'MEMBERSIHKAN LANGIT-LANGIT (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [
          'FOTO LANGIT-LANGIT',
          'FOTO LANGIT-LANGIT_21',
          'FOTO LANGIT-LANGIT_22',
        ],
      },
      {
        id: 'halaman_belakang',
        label: 'MEMBERSIHKAN HALAMAN BELAKANG (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [
          'FOTO HALAMAN BELAKANG',
          'FOTO HALAMAN BELAKANG_25',
          'FOTO HALAMAN BELAKANG_26',
        ],
      },
      {
        id: 'general_cleaning',
        label: 'GENERAL CLEANING (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [
          'FOTO GENERAL CLEANING',
          'FOTO GENERAL CLEANING_29',
          'FOTO GENERAL CLEANING_30',
        ],
      },
    ],
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: [
      'TANDA TANGAN',
      'TANDA TANGAN_34',
      'TANDA TANGAN_35',
    ],
  },
  {
    id: 'RANAP_USMAN',
    title: 'RANAP USMAN',
    subtitle: 'Ruang Rawat Inap Usman',
    formTitle: 'RANAP USMAN Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN RANAP USMAN',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-usman.png',
    labelColorClass: 'text-[#0277BD] dark:text-sky-400',
    borderHoverClass: 'hover:border-[#0277BD]',
    badgeBgClass: 'bg-[#0277BD]/10 text-[#0277BD]',
    accentHex: '#0277BD',
    kind: 'room_checklist',
    defaultUnit: 'RANAP USMAN',
    unitOptions: [
      'RANAP USMAN',
      'KAMAR PASIEN RANAP USMAN 1-4',
      'NURSE STATION RANAP USMAN',
      'KAMAR MANDI / WC PASIEN USMAN',
    ],
    officerOptions: [
      'MIRNAWATI',
      'DEVI SURYADI',
      'DEDI SUPRIADI',
      'YUSUF MAULANA',
    ],
    featuredOfficers: ['MIRNAWATI', 'DEVI SURYADI'],
    tasks: STANDARD_RANAP_TASKS,
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'RANAP_AISYAH',
    title: 'RANAP AISYAH',
    subtitle: 'Ruang Rawat Inap Aisyah',
    formTitle: 'RANAP AISYAH Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN RANAP AISYAH',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-aisyah.png',
    labelColorClass: 'text-[#D81B60] dark:text-pink-400',
    borderHoverClass: 'hover:border-[#D81B60]',
    badgeBgClass: 'bg-[#D81B60]/10 text-[#D81B60]',
    accentHex: '#D81B60',
    kind: 'room_checklist',
    defaultUnit: 'RANAP AISYAH',
    unitOptions: [
      'RANAP AISYAH',
      'KAMAR PASIEN RANAP AISYAH 1-4',
      'NURSE STATION RANAP AISYAH',
      'KAMAR MANDI / WC PASIEN AISYAH',
    ],
    officerOptions: [
      'SITI NURHALIZA',
      'RINA MARLINA',
      'MIRNAWATI',
      'DEDI SUPRIADI',
    ],
    tasks: STANDARD_RANAP_TASKS,
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'RANAP_FATIMAH',
    title: 'RANAP FATIMAH',
    subtitle: 'Ruang Rawat Inap Fatimah',
    formTitle: 'RANAP FATIMAH Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN RANAP FATIMAH',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-fatimah.png',
    labelColorClass: 'text-[#7B1FA2] dark:text-purple-400',
    borderHoverClass: 'hover:border-[#7B1FA2]',
    badgeBgClass: 'bg-[#7B1FA2]/10 text-[#7B1FA2]',
    accentHex: '#7B1FA2',
    kind: 'room_checklist',
    defaultUnit: 'RANAP FATIMAH',
    unitOptions: [
      'RANAP FATIMAH',
      'KAMAR PASIEN NIFAS & KEBIDANAN FATIMAH',
      'NURSE STATION RANAP FATIMAH',
      'KAMAR MANDI / WC PASIEN FATIMAH',
    ],
    officerOptions: [
      'RINA MARLINA',
      'SITI NURHALIZA',
      'YUSUF MAULANA',
      'DEVI SURYADI',
    ],
    tasks: STANDARD_RANAP_TASKS,
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'RANAP_KHADIJAH',
    title: 'RANAP KHADIJAH',
    subtitle: 'Ruang Rawat Inap Khadijah',
    formTitle: 'RANAP KHADIJAH Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN RANAP KHADIJAH',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-khadijah.png',
    labelColorClass: 'text-[#0277BD] dark:text-sky-400',
    borderHoverClass: 'hover:border-[#0277BD]',
    badgeBgClass: 'bg-[#0277BD]/10 text-[#0277BD]',
    accentHex: '#0277BD',
    kind: 'room_checklist',
    defaultUnit: 'RANAP KHADIJAH',
    unitOptions: [
      'RANAP KHADIJAH',
      'KAMAR PASIEN RANAP KHADIJAH 1-4',
      'NURSE STATION RANAP KHADIJAH',
      'KAMAR MANDI / WC PASIEN KHADIJAH',
    ],
    officerOptions: [
      'YUSUF MAULANA',
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
      'MIRNAWATI',
    ],
    tasks: STANDARD_RANAP_TASKS,
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'MANAJEMEN',
    title: 'MANAJEMEN',
    subtitle: 'Perkantoran, Aula, Mushola & Administrasi',
    formTitle: 'MANAJEMEN Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN RUANGAN MANAJEMEN',
    imageSrc: '/assets/aistudio/supervisi-cards/manajemen.png',
    labelColorClass: 'text-[#263238] dark:text-slate-300',
    borderHoverClass: 'hover:border-[#263238]',
    badgeBgClass: 'bg-slate-500/10 text-slate-700',
    accentHex: '#263238',
    kind: 'room_checklist',
    defaultUnit: 'MANAJEMEN',
    unitOptions: [
      'MANAJEMEN',
      'RUANG DIREKTUR & STRUKTURAL',
      'RUANG TATA USAHA & KEUANGAN',
      'AULA & MUSHOLA MANAJEMEN',
    ],
    officerOptions: [
      'DONI ALAMSYAH',
      'TAUFIK HIDAYAT',
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
    ],
    featuredOfficers: ['DONI ALAMSYAH'],
    tasks: [
      {
        id: 'tugas_rutin',
        label: 'TUGAS RUTIN : MENYAPU, MENGEPEL, WC (06.00 - 09.30)',
        timeWindow: '06.00 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [
          'FOTO TUGAS RUTIN',
          'FOTO TUGAS RUTIN_5',
          'FOTO TUGAS RUTIN_6',
        ],
      },
      {
        id: 'kaca_1',
        label: 'MEMBERSIHKAN KACA 1 (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO KACA 1', 'FOTO KACA 1_9', 'FOTO KACA 1_10'],
      },
      {
        id: 'mukena_sajadah',
        label: 'MENCUCI MUKENA DAN SAJADAH (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: [
          'FOTO MUKENA DAN SAJADAH',
          'FOTO MUKENA DAN SAJADAH_13',
          'FOTO MUKENA DAN SAJADAH_14',
        ],
      },
      {
        id: 'tangga',
        label: 'MEMBERSIHKAN TANGGA (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO TANGGA', 'FOTO TANGGA_17', 'FOTO TANGGA_18'],
      },
      {
        id: 'kaca_2',
        label: 'MEMBERSIHKAN KACA 2 (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: ['FOTO KACA 2', 'FOTO KACA 2_21', 'FOTO KACA 2_22'],
      },
      {
        id: 'dokumen_berkas',
        label: 'MERAPIHKAN DOKUMEN/BERKAS (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [
          'FOTO DOKUMEN/BERKAS',
          'FOTO DOKUMEN/BERKAS_25',
          'FOTO DOKUMEN/BERKAS_26',
        ],
      },
      {
        id: 'furniture',
        label: 'MEMBERSIHKAN FURNITURE (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKSANAKAN',
        photoSlotLabels: [
          'FOTO FURNITURE',
          'FOTO FURNITURE_29',
          'FOTO FURNITURE_30',
        ],
      },
    ],
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: [
      'TANDA TANGAN',
      'TANDA TANGAN_34',
      'TANDA TANGAN_35',
    ],
  },
  {
    id: 'HALAMAN',
    title: 'HALAMAN',
    subtitle: 'Area Taman, Halaman, IPAL & Pengantaran',
    formTitle: 'HALAMAN Form',
    reportTitle: 'LAPORAN CEKLIST KEBERSIHAN AREA HALAMAN RUMAH SAKIT',
    imageSrc: '/assets/aistudio/supervisi-cards/halaman.png',
    labelColorClass: 'text-[#D87A00] dark:text-amber-400',
    borderHoverClass: 'hover:border-[#D87A00]',
    badgeBgClass: 'bg-[#D87A00]/10 text-[#D87A00]',
    accentHex: '#D87A00',
    kind: 'room_checklist',
    defaultUnit: 'HALAMAN',
    unitOptions: [
      'HALAMAN RUMAH SAKIT',
      'TAMAN DEPAN IGD & POLI',
      'TAMAN BELAKANG & AREA IPAL',
    ],
    officerOptions: [
      'HENDRA GUNAWAN',
      'YUSUF MAULANA',
      'TAUFIK HIDAYAT',
      'DONI ALAMSYAH',
    ],
    tasks: [
      {
        id: 'halaman_sampah',
        label: 'MEMBERSIHKAN HALAMAN DAN MEMBUANG SAMPAH (06.00 - 09.30)',
        timeWindow: '06.00 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO'],
      },
      {
        id: 'taman_depan_igd',
        label: 'MEMBERSIHKAN TAMAN DEPAN IGD (07.30 -09.30)',
        timeWindow: '07.30 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO_8'],
      },
      {
        id: 'taman_depan_poli',
        label: 'MEMBERSIHKAN TAMAN DEPAN POLI (07.30 -09.30)',
        timeWindow: '07.30 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO_12'],
      },
      {
        id: 'taman_belakang',
        label: 'MEMBERSIHKAN TAMAN BELAKANG (07.30 -09.30)',
        timeWindow: '07.30 - 09.30',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO_16'],
      },
      {
        id: 'cek_ipal_limbah',
        label: 'MENGECEK IPAL, PENGOLAHAN LIMBAH, KEGIATAN LAIN (10.00 - 13.00)',
        timeWindow: '10.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: ['FOTO_20'],
      },
      {
        id: 'pengantaran_obat',
        label: 'PENGANTARAN OBAT (11.00 - 13.00)',
        timeWindow: '11.00 - 13.00',
        positiveLabel: 'DILAKUKAN',
        photoSlotLabels: [],
      },
    ],
    hasEvaluasiSupervisor: false,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
  {
    id: 'SUPERVISI',
    title: 'SUPERVISI',
    subtitle: 'Penilaian Skor, Temuan & Rekomendasi Kesling',
    formTitle: 'SUPERVISI Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN',
    imageSrc: '/assets/aistudio/supervisi-cards/supervisi.png',
    labelColorClass: 'text-[#1B8720] dark:text-emerald-400',
    borderHoverClass: 'hover:border-[#1B8720]',
    badgeBgClass: 'bg-[#1B8720]/10 text-[#1B8720]',
    accentHex: '#1B8720',
    kind: 'supervisi_audit',
    defaultUnit: 'CSSD',
    unitOptions: [
      'CSSD',
      'RAWAT JALAN',
      'IGD',
      'RANAP ICU',
      'RANAP ICU DAN IBS',
      'KORIDOR RAWAT INAP',
      'RANAP USMAN',
      'RANAP AISYAH',
      'RANAP FATIMAH',
      'RANAP KHADIJAH',
      'MANAJEMEN',
      'HALAMAN',
      'INSTALASI GIZI',
      'LAUNDRY',
    ],
    officerOptions: [
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
      'MIRNAWATI',
      'DEVI SURYADI',
      'DONI ALAMSYAH',
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
      'AHMAD FAUZI',
      'RINA MARLINA',
      'YUSUF MAULANA',
      'TAUFIK HIDAYAT',
    ],
    tasks: [],
    hasEvaluasiSupervisor: true,
    signatureSlotLabels: ['TANDA TANGAN'],
  },
];

export type ScoreValue = 1 | 2 | 3 | 4 | null;

export interface RoomChecklistTaskEntry {
  status: TaskStatusValue;
  photos: string[]; // matches photoSlotLabels length
}

export interface RoomChecklistRecord {
  id: string;
  cardId: Exclude<SupervisiCardId, 'SUPERVISI'>;
  tanggal: string;
  hari: HariValue;
  taskEntries: Record<string, RoomChecklistTaskEntry>;
  petugas: string;
  evaluasiSupervisor: string;
  signatures: string[]; // matches signatureSlotLabels length
}

export interface SupervisiAuditRecord {
  id: string;
  cardId: SupervisiCardId;
  tanggal: string;
  supervisor: string;
  unit: string;
  namaPetugas: string;
  kerapihan: string;
  skorKerapihan: ScoreValue;
  prosedur: string;
  skorProsedur: ScoreValue;
  alatDanBahan: string;
  skorAlatDanBahan: ScoreValue;
  k3: string;
  skorK3: ScoreValue;
  sikapDanPerilaku: string;
  skorSikapDanPerilaku: ScoreValue;
  totalSkor: number | null;
  kategori: string;
  temuan: string;
  rekomendasi: string;
  dokumentasiTemuanUrl: string;
  dokumentasiPerbaikanUrl: string;
  tandaTanganUrl: string;
}

export const SUPERVISOR_OPTIONS = [
  'Fitria Wulandari, A.M.KL',
  'Koordinator Kesling RSUD Al-Mulk',
  'Tim Sanitarian RSUD Al-Mulk',
  'Pengawas Kebersihan & Sanitasi RSAM',
];

export const CRITERIA_QUICK_OPTIONS = {
  kerapihan: [
    'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
    'Atribut kerja cukup rapi, sepatu tertutup sesuai standar',
    'Perlu perapihan atribut kerja & kelengkapan identitas petugas',
  ],
  prosedur: [
    'Pembersihan dilakukan sesuai SPO dari area bersih ke area kotor',
    'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
    'Prosedur pengenceran desinfektan dan teknik mop perlu ditingkatkan',
  ],
  alatDanBahan: [
    'Troli kebersihan, mop, ember warna, dan cairan desinfektan lengkap',
    'Alat kebersihan tertata rapi di janitor dan siap digunakan',
    'Perlu penggantian kain pel/mikrofiber yang sudah aus',
  ],
  k3: [
    'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
    'APD digunakan dengan tertib selama menangani area infeksius',
    'Rambu lantai basah (wet floor sign) wajib dipasang saat mengepel koridor',
  ],
  sikapDanPerilaku: [
    'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
    'Kooperatif dalam menindaklanjuti temuan kebersihan di ruangan',
    'Komunikasi efektif dengan kepala ruangan dan perawat jaga',
  ],
};

export function calculateSupervisiScores(scores: {
  skorKerapihan: ScoreValue;
  skorProsedur: ScoreValue;
  skorAlatDanBahan: ScoreValue;
  skorK3: ScoreValue;
  skorSikapDanPerilaku: ScoreValue;
}): { totalSkor: number | null; kategori: string } {
  const vals = [
    scores.skorKerapihan,
    scores.skorProsedur,
    scores.skorAlatDanBahan,
    scores.skorK3,
    scores.skorSikapDanPerilaku,
  ].filter((v): v is 1 | 2 | 3 | 4 => typeof v === 'number' && v >= 1 && v <= 4);

  if (vals.length === 0) {
    return { totalSkor: null, kategori: '' };
  }

  const sum = vals.reduce((acc, v) => acc + v, 0);
  const maxPossible = vals.length * 4;
  const pct = (sum / maxPossible) * 100;

  let kategori = 'KURANG';
  if (pct >= 85) {
    kategori = 'SANGAT BAIK';
  } else if (pct >= 70) {
    kategori = 'BAIK';
  } else if (pct >= 55) {
    kategori = 'CUKUP';
  }

  return { totalSkor: sum, kategori };
}

export function calculateRoomChecklistProgress(
  cardConfig: SupervisiCardConfig,
  taskEntries: Record<string, RoomChecklistTaskEntry>
): { completedTasks: number; totalTasks: number; percentage: number } {
  const totalTasks = cardConfig.tasks.length;
  if (totalTasks === 0) {
    return { completedTasks: 0, totalTasks: 0, percentage: 100 };
  }
  let completedTasks = 0;
  for (const t of cardConfig.tasks) {
    const entry = taskEntries[t.id];
    if (
      entry &&
      (entry.status === 'DILAKUKAN' || entry.status === 'DILAKSANAKAN')
    ) {
      completedTasks += 1;
    }
  }
  const percentage = Math.round((completedTasks / totalTasks) * 100);
  return { completedTasks, totalTasks, percentage };
}

export function createDefaultTaskEntriesForCard(
  cardConfig: SupervisiCardConfig,
  fillAllPositive = false,
  defaultPhotoUrl = ''
): Record<string, RoomChecklistTaskEntry> {
  const map: Record<string, RoomChecklistTaskEntry> = {};
  for (const t of cardConfig.tasks) {
    map[t.id] = {
      status: fillAllPositive ? t.positiveLabel : '',
      photos: t.photoSlotLabels.map((_, idx) =>
        fillAllPositive && defaultPhotoUrl && idx === 0 ? defaultPhotoUrl : ''
      ),
    };
  }
  return map;
}

/**
 * Initial records for the 9 Room Checklist tabs based on real timestamps and officers from the live APLICLEAN AppSheet app.
 */
export function createInitialRoomChecklistRecords(): RoomChecklistRecord[] {
  const photos = [
    '/assets/aistudio/supervisi-temuan/temuan-1.png',
    '/assets/aistudio/supervisi-temuan/temuan-2.png',
    '/assets/aistudio/supervisi-temuan/temuan-3.png',
    '/assets/aistudio/supervisi-temuan/temuan-4.png',
    '/assets/aistudio/supervisi-temuan/temuan-5.png',
  ];
  const sigs = [
    '/assets/aistudio/supervisi-temuan/ttd-1.png',
    '/assets/aistudio/supervisi-temuan/ttd-2.png',
    '/assets/aistudio/supervisi-temuan/ttd-3.png',
    '/assets/aistudio/supervisi-temuan/ttd-4.png',
    '/assets/aistudio/supervisi-temuan/ttd-5.png',
  ];

  const buildFullEntries = (
    cardId: Exclude<SupervisiCardId, 'SUPERVISI'>,
    photoSeedIdx: number
  ): Record<string, RoomChecklistTaskEntry> => {
    const cfg = SUPERVISI_CARDS.find((c) => c.id === cardId)!;
    const out: Record<string, RoomChecklistTaskEntry> = {};
    cfg.tasks.forEach((t, idx) => {
      out[t.id] = {
        status: t.positiveLabel,
        photos: t.photoSlotLabels.map(
          (_, slotIdx) => photos[(photoSeedIdx + idx + slotIdx) % photos.length]
        ),
      };
    });
    return out;
  };

  return [
    // RAWAT JALAN (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-rajal-1',
      cardId: 'RAWAT_JALAN',
      tanggal: '02/03/2026 10:16:27',
      hari: 'SENIN',
      taskEntries: buildFullEntries('RAWAT_JALAN', 0),
      petugas: 'ABU HANIFAH',
      evaluasiSupervisor:
        'Seluruh area poliklinik, kaca pendaftaran, farmasi, dan wastafel telah dibersihkan sesuai jadwal.',
      signatures: [sigs[0]],
    },
    {
      id: 'rc-rajal-2',
      cardId: 'RAWAT_JALAN',
      tanggal: '03/03/2026 10:30:25',
      hari: 'SELASA',
      taskEntries: buildFullEntries('RAWAT_JALAN', 1),
      petugas: 'ABU HANIFAH',
      evaluasiSupervisor:
        'Kebersihan ruang tunggu poli dan WC pasien terjaga bersih dan kering.',
      signatures: [sigs[3]],
    },
    {
      id: 'rc-rajal-3',
      cardId: 'RAWAT_JALAN',
      tanggal: '04/03/2026 10:50:14',
      hari: 'RABU',
      taskEntries: buildFullEntries('RAWAT_JALAN', 2),
      petugas: 'ABU HANIFAH',
      evaluasiSupervisor:
        'Taman depan poli dan alkes poliklinik sudah dibersihkan sesuai SPO.',
      signatures: [sigs[0]],
    },

    // IGD (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-igd-1',
      cardId: 'IGD',
      tanggal: '14/04/2026 07:12:56',
      hari: 'SELASA',
      taskEntries: buildFullEntries('IGD', 1),
      petugas: 'HENDRA GUNAWAN',
      evaluasiSupervisor:
        'Ruang EK, triase, alkes, dan WC IGD telah didesinfeksi secara menyeluruh.',
      signatures: [sigs[4]],
    },
    {
      id: 'rc-igd-2',
      cardId: 'IGD',
      tanggal: '15/04/2026 07:51:35',
      hari: 'RABU',
      taskEntries: buildFullEntries('IGD', 2),
      petugas: 'HENDRA GUNAWAN',
      evaluasiSupervisor:
        'Pembersihan kaca, langit-langit, dan area tindakan IGD terlaksana baik.',
      signatures: [sigs[1]],
    },

    // RANAP ICU DAN IBS (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-icu-1',
      cardId: 'RANAP_ICU_IBS',
      tanggal: '24/03/2026 10:02:09',
      hari: 'SELASA',
      taskEntries: buildFullEntries('RANAP_ICU_IBS', 2),
      petugas: 'AHMAD FAUZI',
      evaluasiSupervisor:
        'Sterilisasi permukaan, kaca, alkes, dan general cleaning ICU & IBS telah dilaksanakan lengkap.',
      signatures: [sigs[1], sigs[2], sigs[0]],
    },
    {
      id: 'rc-icu-2',
      cardId: 'RANAP_ICU_IBS',
      tanggal: '09/07/2026 09:12:03',
      hari: 'KAMIS',
      taskEntries: buildFullEntries('RANAP_ICU_IBS', 3),
      petugas: 'TAUFIK HIDAYAT',
      evaluasiSupervisor:
        'Area koridor steril, WC, dan halaman belakang ICU/IBS bersih dan sesuai standar.',
      signatures: [sigs[2], sigs[1], sigs[3]],
    },

    // RANAP USMAN (Real timestamps & officers MIRNAWATI / DEVI SURYADI from AppSheet APLICLEAN)
    {
      id: 'rc-usman-1',
      cardId: 'RANAP_USMAN',
      tanggal: '10/04/2026 11:49:59',
      hari: 'JUMAT',
      taskEntries: buildFullEntries('RANAP_USMAN', 0),
      petugas: 'MIRNAWATI',
      evaluasiSupervisor:
        'Tugas rutin menyapu, mengepel, pembersihan alkes 1 & 2, serta general cleaning terlaksana rapi.',
      signatures: [sigs[0]],
    },
    {
      id: 'rc-usman-2',
      cardId: 'RANAP_USMAN',
      tanggal: '13/08/2026 08:44:00',
      hari: 'KAMIS',
      taskEntries: buildFullEntries('RANAP_USMAN', 3),
      petugas: 'DEVI SURYADI',
      evaluasiSupervisor:
        'Seluruh kamar pasien Ranap Usman dan kamar mandi pasien bersih dan tidak berbau.',
      signatures: [sigs[1]],
    },

    // RANAP AISYAH (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-aisyah-1',
      cardId: 'RANAP_AISYAH',
      tanggal: '13/02/2026 10:05:26',
      hari: 'JUMAT',
      taskEntries: buildFullEntries('RANAP_AISYAH', 4),
      petugas: 'SITI NURHALIZA',
      evaluasiSupervisor:
        'Kamar perawatan Aisyah, kaca jendela, alkes, dan WC pasien telah dibersihkan.',
      signatures: [sigs[4]],
    },
    {
      id: 'rc-aisyah-2',
      cardId: 'RANAP_AISYAH',
      tanggal: '18/02/2026 09:46:33',
      hari: 'RABU',
      taskEntries: buildFullEntries('RANAP_AISYAH', 1),
      petugas: 'SITI NURHALIZA',
      evaluasiSupervisor:
        'General cleaning dan pembersihan langit-langit ruang perawatan Aisyah selesai.',
      signatures: [sigs[2]],
    },

    // RANAP FATIMAH (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-fatimah-1',
      cardId: 'RANAP_FATIMAH',
      tanggal: '18/02/2026 11:56:12',
      hari: 'RABU',
      taskEntries: buildFullEntries('RANAP_FATIMAH', 2),
      petugas: 'RINA MARLINA',
      evaluasiSupervisor:
        'Area ruang nifas Fatimah, kaca, WC, dan alkes 1 & 2 bersih sesuai jadwal.',
      signatures: [sigs[2]],
    },
    {
      id: 'rc-fatimah-2',
      cardId: 'RANAP_FATIMAH',
      tanggal: '19/02/2026 11:16:45',
      hari: 'KAMIS',
      taskEntries: buildFullEntries('RANAP_FATIMAH', 3),
      petugas: 'RINA MARLINA',
      evaluasiSupervisor:
        'Kondisi kebersihan kamar pasien dan nurse station Fatimah sangat baik.',
      signatures: [sigs[3]],
    },

    // RANAP KHADIJAH (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-khadijah-1',
      cardId: 'RANAP_KHADIJAH',
      tanggal: '02/03/2026 10:20:41',
      hari: 'SENIN',
      taskEntries: buildFullEntries('RANAP_KHADIJAH', 3),
      petugas: 'YUSUF MAULANA',
      evaluasiSupervisor:
        'Pembersihan rutin pagi dan siang di ruang Ranap Khadijah terlaksana lengkap.',
      signatures: [sigs[3]],
    },
    {
      id: 'rc-khadijah-2',
      cardId: 'RANAP_KHADIJAH',
      tanggal: '03/03/2026 10:06:15',
      hari: 'SELASA',
      taskEntries: buildFullEntries('RANAP_KHADIJAH', 0),
      petugas: 'YUSUF MAULANA',
      evaluasiSupervisor:
        'Kaca, langit-langit, alkes, dan kamar mandi pasien bersih dan kering.',
      signatures: [sigs[0]],
    },

    // MANAJEMEN (Officer DONI ALAMSYAH from AppSheet APLICLEAN)
    {
      id: 'rc-manajemen-1',
      cardId: 'MANAJEMEN',
      tanggal: '02/03/2026 08:45:00',
      hari: 'SENIN',
      taskEntries: buildFullEntries('MANAJEMEN', 0),
      petugas: 'DONI ALAMSYAH',
      evaluasiSupervisor:
        'Ruang manajemen, kaca 1 & 2, tangga, pencucian mukena/sajadah, penataan berkas, dan furniture telah dilaksanakan.',
      signatures: [sigs[0], sigs[1], sigs[2]],
    },

    // HALAMAN (Real timestamps from AppSheet APLICLEAN)
    {
      id: 'rc-halaman-1',
      cardId: 'HALAMAN',
      tanggal: '19/03/2026 07:19:50',
      hari: 'KAMIS',
      taskEntries: buildFullEntries('HALAMAN', 2),
      petugas: 'HENDRA GUNAWAN',
      evaluasiSupervisor: '',
      signatures: [sigs[2]],
    },
    {
      id: 'rc-halaman-2',
      cardId: 'HALAMAN',
      tanggal: '23/03/2026 09:06:14',
      hari: 'SENIN',
      taskEntries: buildFullEntries('HALAMAN', 4),
      petugas: 'YUSUF MAULANA',
      evaluasiSupervisor: '',
      signatures: [sigs[4]],
    },
  ];
}

/**
 * Exact rows from Gambar 5 & live AppSheet SUPERVISI view:
 * First 5 rows match Gambar 5 (LAPORAN SUPERVISI RUANGAN UOBK RSUD AL-MULK KOTA SUKABUMI BULAN FEBRUARI 2026)
 * followed by additional real findings from the live AppSheet SUPERVISI table.
 */
export function createInitialSupervisiAuditRecords(): SupervisiAuditRecord[] {
  return [
    {
      id: 'sup-feb-1',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 09:21:42',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'CSSD',
      namaPetugas: 'ABU HANIFAH',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Pembersihan dilakukan sesuai SPO dari area bersih ke area kotor',
      skorProsedur: 4,
      alatDanBahan: 'Troli kebersihan, mop, ember warna, dan cairan desinfektan lengkap',
      skorAlatDanBahan: 4,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan:
        'lubang untuk paralon yg nempel ke dinding tidak rapih, sehingga mengundang semut membawa tanah ke dalam',
      rekomendasi:
        'koordinasi dengan IPSRS untuk di tutup lubangnya dengan rapih',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-1.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-1.png',
    },
    {
      id: 'sup-feb-2',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 09:29:22',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'CSSD',
      namaPetugas: 'AHMAD FAUZI',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
      skorProsedur: 4,
      alatDanBahan: 'Alat kebersihan tertata rapi di janitor dan siap digunakan',
      skorAlatDanBahan: 3,
      k3: 'APD digunakan dengan tertib selama menangani area infeksius',
      skorK3: 4,
      sikapDanPerilaku: 'Kooperatif dalam menindaklanjuti temuan kebersihan di ruangan',
      skorSikapDanPerilaku: 4,
      totalSkor: 19,
      kategori: 'SANGAT BAIK',
      temuan: 'dinding CSSD berjamur',
      rekomendasi: 'koordinasi dengan IPSRS untuk pembersihan dan pengecatan anti-jamur',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-2.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-2.png',
    },
    {
      id: 'sup-feb-3',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 09:31:14',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'CSSD',
      namaPetugas: 'AHMAD FAUZI',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Pembersihan dilakukan sesuai SPO dari area bersih ke area kotor',
      skorProsedur: 4,
      alatDanBahan: 'Troli kebersihan, mop, ember warna, dan cairan desinfektan lengkap',
      skorAlatDanBahan: 4,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan: 'dinding CSSD lembab',
      rekomendasi: 'koordinasi dengan IPSRS',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-3.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-3.png',
    },
    {
      id: 'sup-feb-4',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 10:02:35',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'RAWAT JALAN',
      namaPetugas: 'ABU HANIFAH',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
      skorProsedur: 4,
      alatDanBahan: 'Troli kebersihan, mop, ember warna, dan cairan desinfektan lengkap',
      skorAlatDanBahan: 4,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan:
        'lorong antar poli, lampu mati dan sirkulasi udara kurang sehingga menimbulkan bau lembab',
      rekomendasi: 'perbaiki lampu, dan pengajuan pembuatan exhause',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-4.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-4.png',
    },
    {
      id: 'sup-feb-5',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 10:06:52',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'RANAP ICU',
      namaPetugas: 'HENDRA GUNAWAN',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Pembersihan dilakukan sesuai SPO dari area bersih ke area kotor',
      skorProsedur: 3,
      alatDanBahan: 'Alat kebersihan tertata rapi di janitor dan siap digunakan',
      skorAlatDanBahan: 4,
      k3: 'APD digunakan dengan tertib selama menangani area infeksius',
      skorK3: 4,
      sikapDanPerilaku: 'Kooperatif dalam menindaklanjuti temuan kebersihan di ruangan',
      skorSikapDanPerilaku: 4,
      totalSkor: 19,
      kategori: 'SANGAT BAIK',
      temuan: 'dinding bawah wastafel berjamur hitam',
      rekomendasi:
        'diperbaiki saluran yg menimbulkan rembes air ke dinding, dibersihkan dan di cat ulang',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-5.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-5.png',
    },
    {
      id: 'sup-feb-6',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 10:08:31',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'RANAP ICU',
      namaPetugas: 'AHMAD FAUZI',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Pembersihan dilakukan sesuai SPO dari area bersih ke area kotor',
      skorProsedur: 4,
      alatDanBahan: 'Troli kebersihan, mop, ember warna, dan cairan desinfektan lengkap',
      skorAlatDanBahan: 4,
      k3: 'APD digunakan dengan tertib selama menangani area infeksius',
      skorK3: 4,
      sikapDanPerilaku: 'Kooperatif dalam menindaklanjuti temuan kebersihan di ruangan',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan: 'wc spolhok berjamur, plafon menguning bekas rembesan air dari toilet atas',
      rekomendasi: 'koordinasi IPSRS untuk perbaikan kebocoran dak toilet atas dan pembersihan jamur',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-3.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-3.png',
    },
    {
      id: 'sup-feb-7',
      cardId: 'SUPERVISI',
      tanggal: '02/03/2026 10:35:16',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'RANAP AISYAH',
      namaPetugas: 'SITI NURHALIZA',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
      skorProsedur: 4,
      alatDanBahan: 'Alat kebersihan tertata rapi di janitor dan siap digunakan',
      skorAlatDanBahan: 4,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Komunikasi efektif dengan kepala ruangan dan perawat jaga',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan: 'plafon ruangan perawat berjamur & atap kaca ranap kotor harus di bersihkan',
      rekomendasi: 'jadwal general cleaning atap kaca ranap dan perbaikan plafon bersama IPSRS',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-2.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-2.png',
    },
  ];
}

export const SUPERVISI_AUDIT_STORAGE_KEY = 'sikesling_supervisi_audit_v2';
export const ROOM_CHECKLIST_STORAGE_KEY = 'sikesling_room_checklist_v2';

export function loadSupervisiAuditRecords(): SupervisiAuditRecord[] {
  const initial = createInitialSupervisiAuditRecords();
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(SUPERVISI_AUDIT_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as SupervisiAuditRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return initial;
    const existingIds = new Set(parsed.map((r) => r.id));
    const merged = [...parsed];
    for (const item of initial) {
      if (!existingIds.has(item.id)) {
        merged.push(item);
      }
    }
    return merged;
  } catch {
    return initial;
  }
}

export function saveSupervisiAuditRecords(records: SupervisiAuditRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      SUPERVISI_AUDIT_STORAGE_KEY,
      JSON.stringify(records)
    );
  } catch {
    // ignore storage quota errors
  }
}

export function loadRoomChecklistRecords(): RoomChecklistRecord[] {
  const initial = createInitialRoomChecklistRecords();
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(ROOM_CHECKLIST_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as RoomChecklistRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return initial;
    const existingIds = new Set(parsed.map((r) => r.id));
    const merged = [...parsed];
    for (const item of initial) {
      if (!existingIds.has(item.id)) {
        merged.push(item);
      }
    }
    return merged;
  } catch {
    return initial;
  }
}

export function saveRoomChecklistRecords(records: RoomChecklistRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ROOM_CHECKLIST_STORAGE_KEY,
      JSON.stringify(records)
    );
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Parses a timestamp string in "DD/MM/YYYY HH:mm:ss" (or "DD/MM/YYYY HH:mm") format
 * into HTML input[type="date"] ("YYYY-MM-DD") and input[type="time"] ("HH:mm:ss") values.
 */
export function parseTimestampToParts(timestampStr: string): {
  dateInput: string;
  timeInput: string;
} {
  const trimmed = (timestampStr || '').trim();
  const match = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (match) {
    const dd = match[1].padStart(2, '0');
    const mm = match[2].padStart(2, '0');
    const yyyy = match[3];
    const hh = (match[4] || '08').padStart(2, '0');
    const min = (match[5] || '00').padStart(2, '0');
    const ss = (match[6] || '00').padStart(2, '0');
    return {
      dateInput: `${yyyy}-${mm}-${dd}`,
      timeInput: `${hh}:${min}:${ss}`,
    };
  }

  // Fallback if user typed YYYY-MM-DD directly
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (isoMatch) {
    const yyyy = isoMatch[1];
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    const hh = (isoMatch[4] || '08').padStart(2, '0');
    const min = (isoMatch[5] || '00').padStart(2, '0');
    const ss = (isoMatch[6] || '00').padStart(2, '0');
    return {
      dateInput: `${yyyy}-${mm}-${dd}`,
      timeInput: `${hh}:${min}:${ss}`,
    };
  }

  return {
    dateInput: '2026-11-01',
    timeInput: '08:30:00',
  };
}

/**
 * Builds a canonical "DD/MM/YYYY HH:mm:ss" timestamp string from HTML date ("YYYY-MM-DD")
 * and time ("HH:mm" or "HH:mm:ss") inputs.
 */
export function buildTimestampFromParts(
  dateInput: string,
  timeInput: string
): string {
  const dMatch = (dateInput || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const yyyy = dMatch ? dMatch[1] : '2026';
  const mm = dMatch ? dMatch[2].padStart(2, '0') : '11';
  const dd = dMatch ? dMatch[3].padStart(2, '0') : '01';

  const tMatch = (timeInput || '')
    .trim()
    .match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  const hh = tMatch ? tMatch[1].padStart(2, '0') : '08';
  const min = tMatch ? tMatch[2].padStart(2, '0') : '30';
  const ss = tMatch ? (tMatch[3] || '00').padStart(2, '0') : '00';

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

/**
 * Returns the Indonesian day name (SENIN..MINGGU) for a given "YYYY-MM-DD" date string.
 */
export function getHariFromDateInput(dateInput: string): HariValue {
  const dMatch = (dateInput || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!dMatch) return 'SENIN';
  const year = Number(dMatch[1]);
  const monthIndex = Number(dMatch[2]) - 1;
  const day = Number(dMatch[3]);
  const dt = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(dt.getTime())) return 'SENIN';
  const dayIdx = dt.getUTCDay();
  const map: Record<number, HariValue> = {
    0: 'MINGGU',
    1: 'SENIN',
    2: 'SELASA',
    3: 'RABU',
    4: 'KAMIS',
    5: 'JUMAT',
    6: 'SABTU',
  };
  return map[dayIdx] || 'SENIN';
}

/**
 * Scales pointer/touch clientX & clientY coordinates to the internal bitmap coordinate space
 * of a <canvas> element so touch/stylus/mouse strokes align with the exact finger position
 * across any responsive screen width or height.
 */
export function scaleCanvasCoordinates(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const safeRectWidth = rect.width > 0 ? rect.width : canvasWidth || 1;
  const safeRectHeight = rect.height > 0 ? rect.height : canvasHeight || 1;
  const scaleX = canvasWidth / safeRectWidth;
  const scaleY = canvasHeight / safeRectHeight;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export const CUSTOM_PETUGAS_STORAGE_KEY = 'sikesling_custom_petugas_v1';

export const DEFAULT_PETUGAS_LIST: string[] = [
  'ABU HANIFAH',
  'MIRNAWATI',
  'DEVI SURYADI',
  'DONI ALAMSYAH',
];

export function addPetugasName(list: string[], rawName: string): string[] {
  const trimmed = (rawName || '').trim();
  if (!trimmed) return list;
  const exists = list.some(
    (item) => item.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return list;
  return [...list, trimmed];
}

export function editPetugasName(
  list: string[],
  oldName: string,
  rawNewName: string
): string[] {
  const trimmed = (rawNewName || '').trim();
  if (!trimmed) return list;
  if (oldName.toLowerCase() !== trimmed.toLowerCase()) {
    const duplicate = list.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) return list;
  }
  return list.map((item) => (item === oldName ? trimmed : item));
}

export function deletePetugasName(
  list: string[],
  targetName: string
): string[] {
  return list.filter((item) => item !== targetName);
}

export function loadCustomPetugasList(): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_PETUGAS_LIST];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PETUGAS_STORAGE_KEY);
    if (!raw) return [...DEFAULT_PETUGAS_LIST];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_PETUGAS_LIST];
    return parsed.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
  } catch {
    return [...DEFAULT_PETUGAS_LIST];
  }
}

export function saveCustomPetugasList(list: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CUSTOM_PETUGAS_STORAGE_KEY,
      JSON.stringify(list)
    );
  } catch {
    // ignore storage errors
  }
}


