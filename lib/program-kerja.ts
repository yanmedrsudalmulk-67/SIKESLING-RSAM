export interface WeeklyScheduleEntry {
  week: 1 | 2 | 3 | 4;
  text?: string;
  active: boolean;
  completed?: boolean;
}

export interface MonthlyScheduleDetail {
  monthIndex: number; // 0 = Jan, 11 = Des
  monthName: string;
  monthShort: string;
  active: boolean;
  weeks: {
    w1: string | null;
    w2: string | null;
    w3: string | null;
    w4: string | null;
  };
  note?: string;
}

export interface ProgramItem {
  id: string;
  subNo: number;
  title: string;
  standard: string;
  targetUnit: string;
  frequencyType:
    | 'setiap_bulan'
    | 'rutin_mingguan'
    | 'semesteran'
    | 'triwulanan'
    | 'dua_bulanan'
    | 'tahunan';
  frequencyLabel: string;
  // 12 months array (Jan..Des)
  annualSchedule: boolean[];
  // Monthly week details
  monthlySchedule: Record<number, { w1?: string; w2?: string; w3?: string; w4?: string }>;
  pic: string;
  status: 'Terjadwal' | 'Sedang Berjalan' | 'Selesai';
}

export interface ProgramCategory {
  id: string;
  roman: string;
  title: string;
  colorTheme: string;
  items: ProgramItem[];
}

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTH_SHORTS_ID = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MEI',
  'JUN',
  'JUL',
  'AGU',
  'SEP',
  'OKT',
  'NOV',
  'DES',
];

/**
 * Master Program Kerja Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi
 * Extracted directly from official hospital planning matrices (Permenkes No 7/2019 & No 2/2023).
 */
export const PROGRAM_KERJA_CATEGORIES: ProgramCategory[] = [
  {
    id: 'air',
    roman: 'I',
    title: 'Kesehatan Air Rumah Sakit',
    colorTheme: 'blue',
    items: [
      {
        id: 'air-1',
        subNo: 1,
        title: 'Pemeriksaan kualitas air bersih parameter mikrobiologi',
        standard: 'Permenkes No 2 Tahun 2023 (Total Coliform & E.Coli)',
        targetUnit: 'Artesis, Air RO Lab, Air RO Poli Gigi, Distribusi Ranap',
        frequencyType: 'setiap_bulan',
        frequencyLabel: '1x Setiap Bulan (Minggu ke-2)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w2: 'Sampling Mikrobiologi' },
          1: { w2: 'Sampling Mikrobiologi' },
          2: { w2: 'Sampling Mikrobiologi' },
          3: { w2: 'Sampling Mikrobiologi' },
          4: { w2: 'Sampling Mikrobiologi' },
          5: { w2: 'Sampling Mikrobiologi' },
          6: { w2: 'Sampling Mikrobiologi' },
          7: { w2: 'Sampling Mikrobiologi' },
          8: { w2: 'Sampling Mikrobiologi' },
          9: { w2: 'Sampling Mikrobiologi' },
          10: { w2: 'Sampling Mikrobiologi' },
          11: { w2: 'Sampling Mikrobiologi' },
        },
        pic: 'Sanitarian & Labkesda',
        status: 'Sedang Berjalan',
      },
      {
        id: 'air-2',
        subNo: 2,
        title: 'Pemeriksaan kualitas air bersih secara fisik, kimia, mikrobiologi',
        standard: 'Permenkes No 2 Tahun 2023 (Fisik, Kimia Lengkap & Mikrobiologi)',
        targetUnit: 'Sumber Air Bersih Utama & Reservoar Rumah Sakit',
        frequencyType: 'semesteran',
        frequencyLabel: '2x Setahun (Juni & Desember Minggu ke-2)',
        annualSchedule: [false, false, false, false, false, true, false, false, false, false, false, true],
        monthlySchedule: {
          5: { w2: 'Uji Laboratorium Lengkap (Fisik, Kimia, Biologi)' },
          11: { w2: 'Uji Laboratorium Lengkap (Fisik, Kimia, Biologi)' },
        },
        pic: 'Sanitarian & Lab Eksternal Terakreditasi KAN',
        status: 'Terjadwal',
      },
    ],
  },
  {
    id: 'udara',
    roman: 'II',
    title: 'Kesehatan Udara Rumah Sakit',
    colorTheme: 'cyan',
    items: [
      {
        id: 'udara-1',
        subNo: 1,
        title: 'Pemeriksaan Kualitas Udara Indoor',
        standard: 'Permenkes No 7 Tahun 2019 (Suhu, Kelembaban, Pencahayaan, Kebisingan)',
        targetUnit: 'Ruang Perawatan, Ruang Isolasi, Koridor Utama',
        frequencyType: 'triwulanan',
        frequencyLabel: '4x Setahun (Feb, Jun, Agu, Des Minggu ke-4)',
        annualSchedule: [false, true, false, false, false, true, false, true, false, false, false, true],
        monthlySchedule: {
          1: { w4: 'Pengukuran Fisik Udara Indoor' },
          5: { w4: 'Pengukuran Fisik Udara Indoor' },
          7: { w4: 'Pengukuran Fisik Udara Indoor' },
          11: { w4: 'Pengukuran Fisik Udara Indoor' },
        },
        pic: 'Petugas Kesling RSAM',
        status: 'Terjadwal',
      },
      {
        id: 'udara-2',
        subNo: 2,
        title: 'Pemeriksaan Kualitas Udara Ambien',
        standard: 'Baku Mutu Udara Ambien Nasional (SO2, NO2, CO, TSP)',
        targetUnit: 'Halaman Depan, Area Parkir, Area Sekitar IPAL & TPS B3',
        frequencyType: 'triwulanan',
        frequencyLabel: '4x Setahun (Feb, Jun, Agu, Des Minggu ke-4)',
        annualSchedule: [false, true, false, false, false, true, false, true, false, false, false, true],
        monthlySchedule: {
          1: { w4: 'Sampling Ambien Pihak Ke-3' },
          5: { w4: 'Sampling Ambien Pihak Ke-3' },
          7: { w4: 'Sampling Ambien Pihak Ke-3' },
          11: { w4: 'Sampling Ambien Pihak Ke-3' },
        },
        pic: 'Laboratorium Lingkungan Eksternal',
        status: 'Terjadwal',
      },
      {
        id: 'udara-3',
        subNo: 3,
        title: 'Pemeriksaan Kualitas udara Ruangan (Rajal, Ranap, IGD, Radiologi, ICU, Farmasi, dan Laboratorium)',
        standard: 'Permenkes No 7 Tahun 2019 (Angka Kuman Udara & Angka Ventilasi)',
        targetUnit: 'Rajal, Ranap, IGD, Radiologi, ICU, Farmasi, Laboratorium (7 Unit Khusus)',
        frequencyType: 'triwulanan',
        frequencyLabel: '4x Setahun (Feb, Jun, Agu, Des Minggu ke-4)',
        annualSchedule: [false, true, false, false, false, true, false, true, false, false, false, true],
        monthlySchedule: {
          1: { w4: 'Uji Angka Kuman & Swab Udara' },
          5: { w4: 'Uji Angka Kuman & Swab Udara' },
          7: { w4: 'Uji Angka Kuman & Swab Udara' },
          11: { w4: 'Uji Angka Kuman & Swab Udara' },
        },
        pic: 'Sanitarian & Tim PPI RSAM',
        status: 'Terjadwal',
      },
    ],
  },
  {
    id: 'sarana',
    roman: 'III',
    title: 'Kesehatan Sarana dan Bangunan',
    colorTheme: 'amber',
    items: [
      {
        id: 'sarana-1',
        subNo: 1,
        title: 'Pemeriksaan Sarana dan Bangunan berdasarkan Form Pemeriksaan Permenkes No 7 Tahun 2019',
        standard: 'Instrumen Standar IKL Sarana Prasarana Fasyankes',
        targetUnit: 'Seluruh Bangunan, Saluran Air Hujan, Dinding, Lantai, Ventilasi, dan Plafon',
        frequencyType: 'rutin_mingguan',
        frequencyLabel: 'Rutin Mingguan (Setiap Senin, Rabu, Jumat)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          1: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          2: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          3: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          4: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          5: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          6: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          7: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          8: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          9: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          10: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
          11: { w1: 'senin, rabu, jumat', w2: 'senin, rabu, jumat', w3: 'senin, rabu, jumat', w4: 'senin, rabu, jumat' },
        },
        pic: 'Sanitarian & Tim Pemeliharaan Sarana (IPSRS)',
        status: 'Sedang Berjalan',
      },
    ],
  },
  {
    id: 'limbah',
    roman: 'IV',
    title: 'Pengamanan Limbah',
    colorTheme: 'emerald',
    items: [
      {
        id: 'limbah-1',
        subNo: 1,
        title: 'Pengangkutan-Pengelolaan Limbah Padat & Medis B3',
        standard: 'PP No 22 Tahun 2021 & Manifest Festronik KLHK',
        targetUnit: 'TPS B3 Rumah Sakit & Seluruh Unit Penghasil Limbah',
        frequencyType: 'rutin_mingguan',
        frequencyLabel: 'Rutin Mingguan (Setiap Hari Sabtu)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          1: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          2: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          3: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          4: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          5: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          6: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          7: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          8: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          9: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          10: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
          11: { w1: 'setiap hari sabtu', w2: 'setiap hari sabtu', w3: 'setiap hari sabtu', w4: 'setiap hari sabtu' },
        },
        pic: 'Petugas TPS B3 & Transporter Berizin',
        status: 'Sedang Berjalan',
      },
      {
        id: 'limbah-2',
        subNo: 2,
        title: 'Pemeriksaan Limbah Cair (Inlet & Outlet IPAL)',
        standard: 'Permen LHK No 68/2016 & Pergub Jabar',
        targetUnit: 'Instalasi Pengolahan Air Limbah (Inlet & Outlet)',
        frequencyType: 'setiap_bulan',
        frequencyLabel: '1x Setiap Bulan (Minggu ke-4)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w4: 'Sampling Uji Limbah Cair IPAL' },
          1: { w4: 'Sampling Uji Limbah Cair IPAL' },
          2: { w4: 'Sampling Uji Limbah Cair IPAL' },
          3: { w4: 'Sampling Uji Limbah Cair IPAL' },
          4: { w4: 'Sampling Uji Limbah Cair IPAL' },
          5: { w4: 'Sampling Uji Limbah Cair IPAL' },
          6: { w4: 'Sampling Uji Limbah Cair IPAL' },
          7: { w4: 'Sampling Uji Limbah Cair IPAL' },
          8: { w4: 'Sampling Uji Limbah Cair IPAL' },
          9: { w4: 'Sampling Uji Limbah Cair IPAL' },
          10: { w4: 'Sampling Uji Limbah Cair IPAL' },
          11: { w4: 'Sampling Uji Limbah Cair IPAL' },
        },
        pic: 'Operator IPAL & Laboratorium Lingkungan',
        status: 'Sedang Berjalan',
      },
    ],
  },
  {
    id: 'vektor',
    roman: 'V',
    title: 'Vektor dan Binatang Pengganggu',
    colorTheme: 'teal',
    items: [
      {
        id: 'vektor-1',
        subNo: 1,
        title: 'Pemeriksaan Vektor dan Binatang Pengganggu Form Pemeriksaan Permenkes No 7 Tahun 2019',
        standard: 'Standar Indeks Kepadatan Jentik, Nyamuk, Lalat, Kecoa, Tikus, Kucing',
        targetUnit: '20 Unit Instalasi & Area Sekitar Lingkungan Luar',
        frequencyType: 'rutin_mingguan',
        frequencyLabel: 'Rutin Mingguan (Setiap Hari Rabu & Jumat)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          1: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          2: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          3: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          4: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          5: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          6: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          7: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          8: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          9: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          10: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
          11: { w1: 'rabu, jumat', w2: 'rabu, jumat', w3: 'rabu, jumat', w4: 'rabu, jumat' },
        },
        pic: 'Petugas Pengendalian Vektor & Sanitarian',
        status: 'Sedang Berjalan',
      },
    ],
  },
  {
    id: 'pangan',
    roman: 'VI',
    title: 'Pangan Siap Saji',
    colorTheme: 'orange',
    items: [
      {
        id: 'pangan-1',
        subNo: 1,
        title: 'Pemeriksaan Pangan Siap Saji Form Pemeriksaan Permenkes No 7 Tahun 2019',
        standard: 'Pemeriksaan Mikrobiologi Sampel Makanan, Usap Alat, Usap Dubur Penjamah',
        targetUnit: 'Instalasi Gizi & Dapur Pengolahan Makanan',
        frequencyType: 'semesteran',
        frequencyLabel: '2x Setahun (Januari & Juni Minggu ke-2)',
        annualSchedule: [true, false, false, false, false, true, false, false, false, false, false, false],
        monthlySchedule: {
          0: { w2: 'Uji Laboratorium Sampel Makanan & Usap Alat' },
          5: { w2: 'Uji Laboratorium Sampel Makanan & Usap Alat' },
        },
        pic: 'Sanitarian & Labkesda',
        status: 'Sedang Berjalan',
      },
      {
        id: 'pangan-2',
        subNo: 2,
        title: 'Pemantauan Pangan Siap Saji Form Pemeriksaan Permenkes No 7 Tahun 2019',
        standard: 'IKL Higiene Sanitasi Dapur, Penyimpanan Bahan, Suhu Distribusi',
        targetUnit: 'Ruang Penerimaan Bahan, Dapur Masak, Penyajian Pasien',
        frequencyType: 'setiap_bulan',
        frequencyLabel: '1x Setiap Bulan (Minggu ke-1)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          1: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          2: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          3: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          4: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          5: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          6: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          7: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          8: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          9: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          10: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
          11: { w1: 'IKL Higiene Sanitasi Dapur & Penyajian' },
        },
        pic: 'Sanitarian & Tim Instalasi Gizi',
        status: 'Sedang Berjalan',
      },
    ],
  },
  {
    id: 'linen',
    roman: 'VII',
    title: 'Penyelenggaraan Linen',
    colorTheme: 'purple',
    items: [
      {
        id: 'linen-1',
        subNo: 1,
        title: 'Pemeriksaan Penyelenggaraan Linen Form Pemeriksaan Permenkes No 7 Tahun 2019 dan Form Check List Metode Pengelolaan Linen',
        standard: 'Standar Pemilahan Linen Infeksius/Non-Infeksius, Pencucian, Desinfeksi, & Uji Angka Kuman Linen Bersih',
        targetUnit: 'Instalasi Laundry / Unit Pengelolaan Linen Rumah Sakit',
        frequencyType: 'setiap_bulan',
        frequencyLabel: '1x Setiap Bulan (Jan W1, Feb-Des W2)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'Inspeksi & Uji Angka Kuman Linen' },
          1: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          2: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          3: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          4: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          5: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          6: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          7: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          8: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          9: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          10: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
          11: { w2: 'Inspeksi & Uji Angka Kuman Linen' },
        },
        pic: 'Sanitarian & Petugas Laundry RSAM',
        status: 'Sedang Berjalan',
      },
    ],
  },
  {
    id: 'radiasi',
    roman: 'VIII',
    title: 'Pengamanan Radiasi',
    colorTheme: 'indigo',
    items: [
      {
        id: 'radiasi-1',
        subNo: 1,
        title: 'Pemeriksaan Pengamanan Radiasi Form Pemeriksaan Permenkes No 7 Tahun 2019',
        standard: 'BAPETEN & Permenkes No 7/2019 (Kalibrasi Pesawat Sinar-X, TLD Badge, Paparan Dinding Timbal)',
        targetUnit: 'Instalasi Radiologi & Ruang Pemeriksaan Rontgen',
        frequencyType: 'dua_bulanan',
        frequencyLabel: 'Setiap 2 Bulan (Feb, Apr, Jun, Agu, Okt, Des Minggu ke-2)',
        annualSchedule: [false, true, false, true, false, true, false, true, false, true, false, true],
        monthlySchedule: {
          1: { w2: 'Uji Paparan Radiasi & Evaluasi TLD' },
          3: { w2: 'Uji Paparan Radiasi & Evaluasi TLD' },
          5: { w2: 'Uji Paparan Radiasi & Evaluasi TLD' },
          7: { w2: 'Uji Paparan Radiasi & Evaluasi TLD' },
          9: { w2: 'Uji Paparan Radiasi & Evaluasi TLD' },
          11: { w2: 'Uji Paparan Radiasi & Evaluasi TLD' },
        },
        pic: 'PPR (Petugas Proteksi Radiasi) & Sanitarian',
        status: 'Terjadwal',
      },
    ],
  },
  {
    id: 'manajemen',
    roman: 'IX',
    title: 'Manajemen Kesehatan Rumah Sakit',
    colorTheme: 'slate',
    items: [
      {
        id: 'manajemen-1',
        subNo: 1,
        title: 'Memiliki dokumen Pedoman, SK, SOP Kesling',
        standard: 'Regulasi Internal Direktur RSUD Al-Mulk & Standar Akreditasi Kemenkes',
        targetUnit: 'Dokumen Kesling, Sekretariat, dan Komite PPI/MFK',
        frequencyType: 'tahunan',
        frequencyLabel: 'Tahunan (Januari Minggu ke-4)',
        annualSchedule: [true, false, false, false, false, false, false, false, false, false, false, false],
        monthlySchedule: {
          0: { w4: 'Penyusunan & Pembaruan SK / SOP Kesling' },
        },
        pic: 'Sanitarian & Manajemen RSUD Al-Mulk',
        status: 'Selesai',
      },
      {
        id: 'manajemen-2',
        subNo: 2,
        title: 'PPI dan MFK',
        standard: 'Komite PPI (Pencegahan & Pengendalian Infeksi) & MFK (Manajemen Fasilitas & Keselamatan)',
        targetUnit: 'Seluruh Ruangan Pelayanan & Fasilitas Penunjang',
        frequencyType: 'setiap_bulan',
        frequencyLabel: 'Berkala (Jan, Jun, Jul, Agu, Sep, Okt, Nov, Des)',
        annualSchedule: [true, false, false, false, false, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'Audit PPI & MFK Bersama' },
          5: { w1: 'Audit PPI & MFK Bersama' },
          6: { w1: 'Audit PPI & MFK Bersama' },
          7: { w1: 'Audit PPI & MFK Bersama' },
          8: { w1: 'Audit PPI & MFK Bersama' },
          9: { w1: 'Audit PPI & MFK Bersama' },
          10: { w1: 'Audit PPI & MFK Bersama' },
          11: { w1: 'Audit PPI & MFK Bersama' },
        },
        pic: 'Sanitarian, Tim PPI & Komite K3/MFK',
        status: 'Sedang Berjalan',
      },
      {
        id: 'manajemen-3',
        subNo: 3,
        title: 'Membuat laporan bulanan kesling',
        standard: 'Pelaporan Kinerja Kesling kepada Direksi & Dinas Kesehatan Kota Sukabumi',
        targetUnit: 'Sekretariat Kesling & Dinas Kesehatan',
        frequencyType: 'setiap_bulan',
        frequencyLabel: '1x Setiap Bulan (Minggu ke-1 Awal Bulan)',
        annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
        monthlySchedule: {
          0: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          1: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          2: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          3: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          4: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          5: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          6: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          7: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          8: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          9: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          10: { w1: 'Penyusunan Rekap Laporan Bulanan' },
          11: { w1: 'Penyusunan Rekap Laporan Bulanan' },
        },
        pic: 'Fitria Wulandari, A.M.KL (Sanitarian RSAM)',
        status: 'Sedang Berjalan',
      },
      {
        id: 'manajemen-4',
        subNo: 4,
        title: 'Membuat laporan UKL UPL',
        standard: 'Dokumen Evaluasi Lingkungan Hidup Berkala DLH Kota Sukabumi',
        targetUnit: 'Dinas Lingkungan Hidup (DLH) Kota Sukabumi',
        frequencyType: 'semesteran',
        frequencyLabel: '2x Setahun (Semester I: Juni W4, Semester II: Des W4)',
        annualSchedule: [false, false, false, false, false, true, false, false, false, false, false, true],
        monthlySchedule: {
          5: { w4: 'Penyusunan & Pengiriman Laporan UKL-UPL Sem I' },
          11: { w4: 'Penyusunan & Pengiriman Laporan UKL-UPL Sem II' },
        },
        pic: 'Sanitarian & Tim Lingkungan Hidup RSAM',
        status: 'Terjadwal',
      },
    ],
  },
];

export interface ProgramSummaryStats {
  totalCategories: number;
  totalActivities: number;
  totalMonthlyScheduled: number;
  totalWeeklyRoutines: number;
  complianceRate: number;
}

export function getProgramSummaryStats(): ProgramSummaryStats {
  const totalCategories = PROGRAM_KERJA_CATEGORIES.length;
  let totalActivities = 0;
  let totalMonthlyScheduled = 0;
  let totalWeeklyRoutines = 0;

  for (const cat of PROGRAM_KERJA_CATEGORIES) {
    for (const item of cat.items) {
      totalActivities += 1;
      if (item.frequencyType === 'rutin_mingguan') {
        totalWeeklyRoutines += 1;
      }
      totalMonthlyScheduled += item.annualSchedule.filter(Boolean).length;
    }
  }

  return {
    totalCategories,
    totalActivities,
    totalMonthlyScheduled,
    totalWeeklyRoutines,
    complianceRate: 100,
  };
}

export const STORAGE_KEY_PROGRAM_KERJA = 'sikesling_program_kerja_v2';

export function loadProgramKerjaData(): ProgramCategory[] {
  if (typeof window === 'undefined') return PROGRAM_KERJA_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRAM_KERJA);
    if (!raw) return PROGRAM_KERJA_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Failed to parse program kerja data from storage:', err);
  }
  return PROGRAM_KERJA_CATEGORIES;
}

export function saveProgramKerjaData(categories: ProgramCategory[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROGRAM_KERJA, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('sikesling_program_updated', { detail: categories }));
  } catch (err) {
    console.error('Failed to save program kerja data:', err);
  }
  if (typeof fetch !== 'undefined') {
    void fetch('/api/supabase/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'program_kerja_categories', payload: categories }),
    }).catch(() => {
      // ignore offline error
    });
  }
}

