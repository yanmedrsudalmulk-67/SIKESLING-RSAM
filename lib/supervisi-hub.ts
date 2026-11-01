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

export interface SupervisiCardConfig {
  id: SupervisiCardId;
  title: string;
  formTitle: string;
  reportTitle: string;
  imageSrc: string;
  labelColorClass: string;
  borderHoverClass: string;
  badgeBgClass: string;
  kind: 'room_checklist' | 'supervisi_audit';
  defaultUnit: string;
  unitOptions: string[];
  officerOptions: string[];
}

export const SUPERVISI_CARDS: SupervisiCardConfig[] = [
  {
    id: 'RAWAT_JALAN',
    title: 'RAWAT JALAN',
    formTitle: 'RAWAT JALAN Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN RAWAT JALAN',
    imageSrc: '/assets/aistudio/supervisi-cards/rawat-jalan.png',
    labelColorClass: 'text-[#0277BD] dark:text-sky-400',
    borderHoverClass: 'hover:border-[#0277BD]',
    badgeBgClass: 'bg-[#0277BD]/10 text-[#0277BD]',
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
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'IGD',
    title: 'IGD',
    formTitle: 'IGD Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN IGD',
    imageSrc: '/assets/aistudio/supervisi-cards/igd.png',
    labelColorClass: 'text-[#C62828] dark:text-rose-400',
    borderHoverClass: 'hover:border-[#C62828]',
    badgeBgClass: 'bg-[#C62828]/10 text-[#C62828]',
    kind: 'room_checklist',
    defaultUnit: 'IGD',
    unitOptions: [
      'IGD',
      'TRIASE & RESUSITASI IGD',
      'RUANG OBSERVASI & TINDAKAN IGD',
      'RUANG PONEK & ISOLASI IGD',
      'AREA DROP-OFF AMBULANS IGD',
    ],
    officerOptions: [
      'HENDRA GUNAWAN',
      'AHMAD FAUZI',
      'ABU HANIFAH',
      'DEDI SUPRIADI',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'RANAP_ICU_IBS',
    title: 'RANAP ICU DAN IBS',
    formTitle: 'RANAP ICU DAN IBS Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN RANAP ICU DAN IBS',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-icu-ibs.png',
    labelColorClass: 'text-[#1B8720] dark:text-emerald-400',
    borderHoverClass: 'hover:border-[#1B8720]',
    badgeBgClass: 'bg-[#1B8720]/10 text-[#1B8720]',
    kind: 'room_checklist',
    defaultUnit: 'RANAP ICU DAN IBS',
    unitOptions: [
      'RANAP ICU DAN IBS',
      'RUANG INTENSIVE CARE UNIT (ICU)',
      'KAMAR OPERASI / IBS 1 & 2',
      'RUANG PEMULIHAN (RECOVERY ROOM)',
      'KORIDOR STERIL & SCRUB STATION IBS',
    ],
    officerOptions: [
      'AHMAD FAUZI',
      'TAUFIK HIDAYAT',
      'RINA MARLINA',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'RANAP_USMAN',
    title: 'RANAP USMAN',
    formTitle: 'RANAP USMAN Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN RANAP USMAN',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-usman.png',
    labelColorClass: 'text-[#0277BD] dark:text-sky-400',
    borderHoverClass: 'hover:border-[#0277BD]',
    badgeBgClass: 'bg-[#0277BD]/10 text-[#0277BD]',
    kind: 'room_checklist',
    defaultUnit: 'RANAP USMAN',
    unitOptions: [
      'RANAP USMAN',
      'KAMAR PASIEN RANAP USMAN 1-4',
      'NURSE STATION RANAP USMAN',
      'KAMAR MANDI / WC PASIEN USMAN',
      'SELASAR & KORIDOR RANAP USMAN',
    ],
    officerOptions: [
      'DEDI SUPRIADI',
      'YUSUF MAULANA',
      'ABU HANIFAH',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'RANAP_AISYAH',
    title: 'RANAP AISYAH',
    formTitle: 'RANAP AISYAH Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN RANAP AISYAH',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-aisyah.png',
    labelColorClass: 'text-[#D81B60] dark:text-pink-400',
    borderHoverClass: 'hover:border-[#D81B60]',
    badgeBgClass: 'bg-[#D81B60]/10 text-[#D81B60]',
    kind: 'room_checklist',
    defaultUnit: 'RANAP AISYAH',
    unitOptions: [
      'RANAP AISYAH',
      'KAMAR PASIEN RANAP AISYAH 1-4',
      'NURSE STATION RANAP AISYAH',
      'KAMAR MANDI / WC PASIEN AISYAH',
      'SELASAR & TAMAN RANAP AISYAH',
    ],
    officerOptions: [
      'SITI NURHALIZA',
      'RINA MARLINA',
      'DEDI SUPRIADI',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'RANAP_FATIMAH',
    title: 'RANAP FATIMAH',
    formTitle: 'RANAP FATIMAH Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN RANAP FATIMAH',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-fatimah.png',
    labelColorClass: 'text-[#7B1FA2] dark:text-purple-400',
    borderHoverClass: 'hover:border-[#7B1FA2]',
    badgeBgClass: 'bg-[#7B1FA2]/10 text-[#7B1FA2]',
    kind: 'room_checklist',
    defaultUnit: 'RANAP FATIMAH',
    unitOptions: [
      'RANAP FATIMAH',
      'KAMAR PASIEN NIFAS & KEBIDANAN FATIMAH',
      'NURSE STATION RANAP FATIMAH',
      'KAMAR MANDI / WC PASIEN FATIMAH',
      'SELASAR & RUANG TUNGGU FATIMAH',
    ],
    officerOptions: [
      'RINA MARLINA',
      'SITI NURHALIZA',
      'YUSUF MAULANA',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'RANAP_KHADIJAH',
    title: 'RANAP KHADIJAH',
    formTitle: 'RANAP KHADIJAH Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN RANAP KHADIJAH',
    imageSrc: '/assets/aistudio/supervisi-cards/ranap-khadijah.png',
    labelColorClass: 'text-[#0277BD] dark:text-sky-400',
    borderHoverClass: 'hover:border-[#0277BD]',
    badgeBgClass: 'bg-[#0277BD]/10 text-[#0277BD]',
    kind: 'room_checklist',
    defaultUnit: 'RANAP KHADIJAH',
    unitOptions: [
      'RANAP KHADIJAH',
      'KAMAR PASIEN RANAP KHADIJAH 1-4',
      'NURSE STATION RANAP KHADIJAH',
      'KAMAR MANDI / WC PASIEN KHADIJAH',
      'SELASAR & KORIDOR RANAP KHADIJAH',
    ],
    officerOptions: [
      'YUSUF MAULANA',
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'MANAJEMEN',
    title: 'MANAJEMEN',
    formTitle: 'MANAJEMEN Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN MANAJEMEN',
    imageSrc: '/assets/aistudio/supervisi-cards/manajemen.png',
    labelColorClass: 'text-[#263238] dark:text-slate-300',
    borderHoverClass: 'hover:border-[#263238]',
    badgeBgClass: 'bg-slate-500/10 text-slate-700',
    kind: 'room_checklist',
    defaultUnit: 'MANAJEMEN',
    unitOptions: [
      'MANAJEMEN',
      'RUANG DIREKTUR & STRUKTURAL',
      'RUANG TATA USAHA & KEUANGAN',
      'AULA & RUANG RAPAT KOMITE MEDIK',
      'TOILET & PANTRY MANAJEMEN',
    ],
    officerOptions: [
      'TAUFIK HIDAYAT',
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'HALAMAN',
    title: 'HALAMAN',
    formTitle: 'HALAMAN Form',
    reportTitle: 'LAPORAN SUPERVISI AREA HALAMAN RUMAH SAKIT',
    imageSrc: '/assets/aistudio/supervisi-cards/halaman.png',
    labelColorClass: 'text-[#D87A00] dark:text-amber-400',
    borderHoverClass: 'hover:border-[#D87A00]',
    badgeBgClass: 'bg-[#D87A00]/10 text-[#D87A00]',
    kind: 'room_checklist',
    defaultUnit: 'HALAMAN',
    unitOptions: [
      'HALAMAN RUMAH SAKIT',
      'TAMAN DEPAN & AREA PARKIR UTAMA',
      'KORIDOR LUAR & SELASAR PENGHUBUNG',
      'AREA TPS LIMBAH DOMESTIK & B3',
      'POS SATPAM & JALUR AMBULANS',
    ],
    officerOptions: [
      'HENDRA GUNAWAN',
      'YUSUF MAULANA',
      'TAUFIK HIDAYAT',
      'FITRIA WULANDARI, A.M.KL',
    ],
  },
  {
    id: 'SUPERVISI',
    title: 'SUPERVISI',
    formTitle: 'SUPERVISI Form',
    reportTitle: 'LAPORAN SUPERVISI RUANGAN',
    imageSrc: '/assets/aistudio/supervisi-cards/supervisi.png',
    labelColorClass: 'text-[#1B8720] dark:text-emerald-400',
    borderHoverClass: 'hover:border-[#1B8720]',
    badgeBgClass: 'bg-[#1B8720]/10 text-[#1B8720]',
    kind: 'supervisi_audit',
    defaultUnit: 'CSSD & LINTAS RUANGAN',
    unitOptions: [
      'CSSD',
      'RAWAT JALAN',
      'IGD',
      'RANAP ICU DAN IBS',
      'RANAP USMAN',
      'RANAP AISYAH',
      'RANAP FATIMAH',
      'RANAP KHADIJAH',
      'MANAJEMEN',
      'HALAMAN',
      'INSTALASI GIZI',
      'LAUNDRY',
      'LABORATORIUM & RADIOLOGI',
    ],
    officerOptions: [
      'ABU HANIFAH',
      'HENDRA GUNAWAN',
      'DEDI SUPRIADI',
      'SITI NURHALIZA',
      'AHMAD FAUZI',
      'RINA MARLINA',
      'YUSUF MAULANA',
      'TAUFIK HIDAYAT',
    ],
  },
];

export type ScoreValue = 1 | 2 | 3 | 4 | null;

export interface SupervisiAuditRecord {
  id: string;
  cardId: SupervisiCardId;
  tanggal: string; // e.g. '01/11/2026 16:55:01' or '12/02/2026 09:15:00'
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

/**
 * Exact 5 rows shown in Gambar 5 (LAPORAN SUPERVISI RUANGAN UOBK RSUD AL-MULK KOTA SUKABUMI BULAN FEBRUARI 2026)
 * plus initial records for each of the 9 room tabs so every tab in the bottom bar has rich real data.
 */
export function createInitialSupervisiAuditRecords(): SupervisiAuditRecord[] {
  return [
    {
      id: 'sup-feb-1',
      cardId: 'SUPERVISI',
      tanggal: '04/02/2026 09:15:10',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'KORIDOR & INSTALASI PIPA',
      namaPetugas: 'ABU HANIFAH',
      kerapihan: '',
      skorKerapihan: null,
      prosedur: '',
      skorProsedur: null,
      alatDanBahan: '',
      skorAlatDanBahan: null,
      k3: '',
      skorK3: null,
      sikapDanPerilaku: '',
      skorSikapDanPerilaku: null,
      totalSkor: null,
      kategori: '',
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
      tanggal: '09/02/2026 10:20:45',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'CSSD',
      namaPetugas: 'AHMAD FAUZI',
      kerapihan: '',
      skorKerapihan: null,
      prosedur: '',
      skorProsedur: null,
      alatDanBahan: '',
      skorAlatDanBahan: null,
      k3: '',
      skorK3: null,
      sikapDanPerilaku: '',
      skorSikapDanPerilaku: null,
      totalSkor: null,
      kategori: '',
      temuan: 'dinding CSSD berjamur',
      rekomendasi: '',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-2.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-2.png',
    },
    {
      id: 'sup-feb-3',
      cardId: 'SUPERVISI',
      tanggal: '14/02/2026 11:05:30',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'CSSD',
      namaPetugas: 'AHMAD FAUZI',
      kerapihan: '',
      skorKerapihan: null,
      prosedur: '',
      skorProsedur: null,
      alatDanBahan: '',
      skorAlatDanBahan: null,
      k3: '',
      skorK3: null,
      sikapDanPerilaku: '',
      skorSikapDanPerilaku: null,
      totalSkor: null,
      kategori: '',
      temuan: 'dinding CSSD lembab',
      rekomendasi: 'koordinasi dengan IPSRS',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-3.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-3.png',
    },
    {
      id: 'sup-feb-4',
      cardId: 'SUPERVISI',
      tanggal: '19/02/2026 13:40:12',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'LORONG ANTAR POLI (RAWAT JALAN)',
      namaPetugas: 'ABU HANIFAH',
      kerapihan: '',
      skorKerapihan: null,
      prosedur: '',
      skorProsedur: null,
      alatDanBahan: '',
      skorAlatDanBahan: null,
      k3: '',
      skorK3: null,
      sikapDanPerilaku: '',
      skorSikapDanPerilaku: null,
      totalSkor: null,
      kategori: '',
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
      tanggal: '25/02/2026 14:18:05',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'WASTAFEL RUANGAN',
      namaPetugas: 'HENDRA GUNAWAN',
      kerapihan: '',
      skorKerapihan: null,
      prosedur: '',
      skorProsedur: null,
      alatDanBahan: '',
      skorAlatDanBahan: null,
      k3: '',
      skorK3: null,
      sikapDanPerilaku: '',
      skorSikapDanPerilaku: null,
      totalSkor: null,
      kategori: '',
      temuan: 'dinding bawah wastafel berjamur hitam',
      rekomendasi:
        'diperbaiki saluran yg menimbulkan rembes air ke dinding, dibersihkan dan di cat ulang',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-5.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-5.png',
    },
    // Seeded records for the other 9 room cards so every sheet tab in the bottom bar has complete data
    {
      id: 'sup-rajal-1',
      cardId: 'RAWAT_JALAN',
      tanggal: '18/02/2026 08:30:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'POLI UMUM & PENYAKIT DALAM',
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
      temuan: 'Lorong antar poli lampu redup dan sirkulasi udara perlu exhaust tambahan',
      rekomendasi: 'Koordinasi IPSRS untuk penggantian lampu LED & pemasangan exhaust fan',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-4.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-4.png',
    },
    {
      id: 'sup-igd-1',
      cardId: 'IGD',
      tanggal: '19/02/2026 09:10:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'TRIASE & RESUSITASI IGD',
      namaPetugas: 'HENDRA GUNAWAN',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
      skorProsedur: 4,
      alatDanBahan: 'Alat kebersihan tertata rapi di janitor dan siap digunakan',
      skorAlatDanBahan: 3,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
      skorSikapDanPerilaku: 4,
      totalSkor: 19,
      kategori: 'SANGAT BAIK',
      temuan: 'Dinding bawah wastafel tindakan IGD tampak lembab akibat rembesan pipa',
      rekomendasi: 'Perbaikan seal pipa wastafel bersama IPSRS dan pengecatan ulang anti-jamur',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-5.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-5.png',
    },
    {
      id: 'sup-icu-ibs-1',
      cardId: 'RANAP_ICU_IBS',
      tanggal: '20/02/2026 10:00:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'RANAP ICU DAN IBS / CSSD',
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
      temuan: 'Dinding ruang penunjang CSSD lembab dan terdapat titik jamur',
      rekomendasi: 'Koordinasi dengan IPSRS untuk pelapisan waterproofing dinding CSSD',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-2.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-2.png',
    },
    {
      id: 'sup-usman-1',
      cardId: 'RANAP_USMAN',
      tanggal: '21/02/2026 09:45:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'KAMAR PASIEN RANAP USMAN 1-4',
      namaPetugas: 'DEDI SUPRIADI',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
      skorProsedur: 3,
      alatDanBahan: 'Troli kebersihan, mop, ember warna, dan cairan desinfektan lengkap',
      skorAlatDanBahan: 4,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
      skorSikapDanPerilaku: 4,
      totalSkor: 19,
      kategori: 'SANGAT BAIK',
      temuan: 'Lubang jalur pipa paralon di sudut kamar mandi pasien belum tertutup rapat',
      rekomendasi: 'Koordinasi dengan IPSRS untuk penutupan celah pipa dengan sealant/semen putih',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-1.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-1.png',
    },
    {
      id: 'sup-aisyah-1',
      cardId: 'RANAP_AISYAH',
      tanggal: '22/02/2026 10:15:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'KAMAR PASIEN RANAP AISYAH 1-4',
      namaPetugas: 'SITI NURHALIZA',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Pembersihan dilakukan sesuai SPO dari area bersih ke area kotor',
      skorProsedur: 4,
      alatDanBahan: 'Alat kebersihan tertata rapi di janitor dan siap digunakan',
      skorAlatDanBahan: 4,
      k3: 'APD digunakan dengan tertib selama menangani area infeksius',
      skorK3: 4,
      sikapDanPerilaku: 'Komunikasi efektif dengan kepala ruangan dan perawat jaga',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan: 'Area bawah wastafel nurse station Aisyah lembab',
      rekomendasi: 'Pembersihan rutin dan pengecekan sambungan fleksibel wastafel oleh IPSRS',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-5.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-5.png',
    },
    {
      id: 'sup-fatimah-1',
      cardId: 'RANAP_FATIMAH',
      tanggal: '23/02/2026 11:00:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'KAMAR PASIEN NIFAS & KEBIDANAN FATIMAH',
      namaPetugas: 'RINA MARLINA',
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
      temuan: 'Ventilasi kamar mandi pasien perlu pembersihan debu berkala',
      rekomendasi: 'Jadwalkan pembersihan kisi exhaust & ventilasi setiap minggu',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-3.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-3.png',
    },
    {
      id: 'sup-khadijah-1',
      cardId: 'RANAP_KHADIJAH',
      tanggal: '24/02/2026 09:20:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'KAMAR PASIEN RANAP KHADIJAH 1-4',
      namaPetugas: 'YUSUF MAULANA',
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
      temuan: 'Pencahayaan selasar belakang Ranap Khadijah kurang terang pada sore hari',
      rekomendasi: 'Koordinasi IPSRS untuk penambahan titik lampu penerangan koridor',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-4.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-4.png',
    },
    {
      id: 'sup-manajemen-1',
      cardId: 'MANAJEMEN',
      tanggal: '25/02/2026 08:45:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'RUANG TATA USAHA & KOMITE MEDIK',
      namaPetugas: 'TAUFIK HIDAYAT',
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
      temuan: 'Saluran pipa air bawah pantry manajemen perlu perapihan penutup dinding',
      rekomendasi: 'Koordinasi IPSRS untuk merapikan lubang pipa di area pantry',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-1.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-1.png',
    },
    {
      id: 'sup-halaman-1',
      cardId: 'HALAMAN',
      tanggal: '26/02/2026 07:50:00',
      supervisor: 'Fitria Wulandari, A.M.KL',
      unit: 'TAMAN DEPAN & AREA PARKIR UTAMA',
      namaPetugas: 'HENDRA GUNAWAN',
      kerapihan: 'Seragam kerja lengkap, rapi, bersih & menggunakan atribut ID Card',
      skorKerapihan: 4,
      prosedur: 'Tahapan menyapu, mengepel, dan desinfeksi dilaksanakan berurutan',
      skorProsedur: 4,
      alatDanBahan: 'Alat kebersihan tertata rapi di janitor dan siap digunakan',
      skorAlatDanBahan: 4,
      k3: 'Menggunakan APD lengkap (masker, sarung tangan/handscoon, sepatu tertutup) & pasang wet floor sign',
      skorK3: 4,
      sikapDanPerilaku: 'Disiplin waktu, ramah, sopan, dan responsif terhadap arahan supervisor',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan: 'Saluran drainase taman samping perlu pembersihan sedimen daun kering',
      rekomendasi: 'Pembersihan berkala saluran drainase halaman setiap pagi & sore',
      dokumentasiTemuanUrl: '/assets/aistudio/supervisi-temuan/temuan-3.png',
      dokumentasiPerbaikanUrl: '',
      tandaTanganUrl: '/assets/aistudio/supervisi-temuan/ttd-3.png',
    },
  ];
}

export const SUPERVISI_AUDIT_STORAGE_KEY = 'sikesling_supervisi_audit_v1';

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
