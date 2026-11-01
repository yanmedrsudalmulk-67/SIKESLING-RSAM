export type ModuleStatusType =
  | 'UI Ready'
  | 'Placeholder'
  | 'In Development'
  | 'Functional'
  | 'Needs Validation';

export interface SubMenuItem {
  id: string;
  title: string;
  href: string;
  description: string;
  status: ModuleStatusType;
  plannedFeatures: string[];
  consultationNotes?: string[];
}

export interface MainMenuItem {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  href: string;
  iconName: string;
  group: 'Utama' | 'Operasional & Lapangan' | 'Pelaporan & Arsip' | 'Konfigurasi Sistem';
  description: string;
  status: ModuleStatusType;
  subItems?: SubMenuItem[];
}

export const MAIN_NAVIGATION: MainMenuItem[] = [
  {
    id: 'dashboard',
    number: 1,
    title: 'Dashboard',
    shortTitle: 'Dashboard',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
    group: 'Utama',
    description:
      'Ringkasan eksekutif kegiatan operasional, supervisi lingkungan, tindak lanjut temuan, dan jadwal monitoring UOBK RSUD Al-Mulk Kota Sukabumi.',
    status: 'UI Ready',
  },
  {
    id: 'program-kerja',
    number: 2,
    title: 'Program Kerja Kesling',
    shortTitle: 'Program Kerja',
    href: '/program-kerja/tahunan',
    iconName: 'CalendarRange',
    group: 'Operasional & Lapangan',
    description:
      'Perencanaan dan matriks program kerja kesehatan lingkungan tahunan dan bulanan UOBK RSUD Al-Mulk Kota Sukabumi berdasarkan Permenkes No 7/2019.',
    status: 'Functional',
    subItems: [
      {
        id: 'program-tahunan',
        title: 'Program Tahunan',
        href: '/program-kerja/tahunan',
        description:
          'Matriks program kerja tahunan 9 bidang kesehatan lingkungan (Air, Udara, Sarana, Limbah, Vektor, Pangan, Linen, Radiasi, Manajemen) dari Januari hingga Desember.',
        status: 'Functional',
        plannedFeatures: [
          'Matriks 9 bidang utama penyehatan RS sesuai Permenkes No 7/2019',
          'Filter kategori dan periode tahun',
          'Status kepatuhan dan rincian parameter baku mutu',
        ],
      },
      {
        id: 'program-bulanan',
        title: 'Program Bulanan & Mingguan',
        href: '/program-kerja/bulanan',
        description:
          'Jadwal rincian mingguan (Minggu 1 s/d 4) pelaksanaan kegiatan penyehatan rumah sakit per bulan beserta hari rutin.',
        status: 'Functional',
        plannedFeatures: [
          'Jadwal pelaksanaan minggu ke-1 sampai minggu ke-4 per bulan',
          'Penjadwalan hari pelaksanaan (Senin, Rabu, Jumat, dan Sabtu)',
          'Checklist interaktif penyelesaian tugas sanitarian',
        ],
      },
    ],
  },
  {
    id: 'operasional',
    number: 3,
    title: 'Kegiatan Operasional',
    shortTitle: 'Operasional',
    href: '/operasional',
    iconName: 'ClipboardList',
    group: 'Operasional & Lapangan',
    description:
      'Manajemen pencatatan aktivitas harian petugas kesehatan lingkungan, kalender jadwal kegiatan, dan riwayat pelaksanaan.',
    status: 'UI Ready',
    subItems: [
      {
        id: 'kegiatan-harian',
        title: 'Pencatatan Kegiatan Harian',
        href: '/operasional/kegiatan-harian',
        description:
          'Wadah pencatatan aktivitas rutin harian petugas kesehatan lingkungan rumah sakit.',
        status: 'UI Ready',
        plannedFeatures: [
          'Input tanggal, jenis kegiatan, lokasi/ruangan, dan nama petugas pelaksana',
          'Pencatatan uraian kegiatan operasional dan keterangan lapangan',
          'Lampiran foto dokumentasi kegiatan terkompresi secara privat',
          'Validasi dan sinkronisasi ke database lokal rumah sakit',
        ],
        consultationNotes: [
          'Daftar klasifikasi jenis kegiatan harian rutin petugas Kesling',
          'Aturan verifikasi harian/mingguan oleh Koordinator Kesling',
        ],
      },
      {
        id: 'jadwal-kegiatan',
        title: 'Jadwal Kegiatan',
        href: '/operasional/jadwal',
        description:
          'Kalender terpadu untuk jadwal pemeriksaan, monitoring berkala, supervisi lapangan, dan pengambilan sampel.',
        status: 'UI Ready',
        plannedFeatures: [
          'Kalender bulanan dan daftar agenda kegiatan mendatang',
          'Pengelompokan jadwal pemeriksaan, monitoring, supervisi, dan sampel',
          'Pengingat jadwal pemeriksaan otomatis bagi petugas bertugas',
          'Integrasi status pelaksanaan jadwal dengan riwayat kegiatan',
        ],
      },
      {
        id: 'riwayat-kegiatan',
        title: 'Riwayat Kegiatan',
        href: '/operasional/riwayat',
        description:
          'Log historis seluruh aktivitas operasional kesehatan lingkungan yang telah dicatat.',
        status: 'UI Ready',
        plannedFeatures: [
          'Tabel riwayat kegiatan dengan filter periode, jenis kegiatan, petugas, lokasi, dan status',
          'Pencarian cepat berdasarkan kata kunci uraian atau lokasi',
          'Tampilan detail kegiatan beserta lampiran dokumentasi',
          'Rekapitulasi otomatis ke modul laporan berkala',
        ],
      },
    ],
  },
  {
    id: 'monitoring',
    number: 3,
    title: 'Monitoring Lingkungan',
    shortTitle: 'Monitoring',
    href: '/monitoring',
    iconName: 'Activity',
    group: 'Operasional & Lapangan',
    description:
      'Wadah pemantauan berkala seluruh aspek kesehatan lingkungan rumah sakit berbasis parameter yang dapat dikonfigurasi.',
    status: 'In Development',
    subItems: [
      {
        id: 'kualitas-air',
        title: 'Monitoring Kualitas Air',
        href: '/monitoring/kualitas-air',
        description:
          'Pemantauan Indikator Baku Mutu Air Bersih (Artesis, Air RO Lab, AIR RO POLI GIGI) lengkap dengan filter periode 1 tahun, grafik tren, dan analisa AI.',
        status: 'Functional',
        plannedFeatures: [
          'Tabel Indikator Baku Mutu Air Bersih (Total Coliform & E.Coli) untuk Artesis, Air RO Lab, dan AIR RO POLI GIGI',
          'Filter periode 1 tahun penuh (Januari–Desember), Semester, Triwulan, dan Bulan',
          'Visualisasi grafik interaktif dari data tabel dan komparasi capaian MS vs TMS',
          'Analisa & rekomendasi tindak lanjut sanitarian otomatis berbasis AI',
        ],
      },
      {
        id: 'kualitas-udara',
        title: 'Monitoring Kualitas Udara',
        href: '/monitoring/kualitas-udara',
        description:
          'Pemantauan parameter fisik kualitas udara ruangan (Kelembapan Udara, Pencahayaan, dan Kebisingan) beserta grafik capaian dan analisa data.',
        status: 'Functional',
        plannedFeatures: [
          'Pemantauan suhu, kelembaban, pencahayaan, dan kebisingan ruangan',
          'Manajemen tambah/edit ruangan dan filter periode bulanan, triwulan, semester, serta tahunan',
          'Visualisasi grafik interaktif dan analisa rekomendasi tindak lanjut',
        ],
      },
      {
        id: 'limbah',
        title: 'Monitoring Pengelolaan Limbah',
        href: '/monitoring/limbah',
        description:
          'Pemantauan Indikator Baku Mutu Air Limbah Rumah Sakit (Inlet & Outlet IPAL) lengkap dengan filter periode 1 tahun, grafik reduksi polutan, dan analisa serta rekomendasi AI realtime.',
        status: 'Functional',
        plannedFeatures: [
          'Tabel Indikator Baku Mutu Limbah Cair (Suhu, TSS, pH, BOD, COD, Amoniak, Zink, Sulfida, Nitrit, Nitrat, Total Coliform) untuk IPAL Inlet dan Outlet',
          'Filter periode 1 tahun penuh, semester, triwulan, titik pantau, dan status capaian',
          'Visualisasi grafik interaktif efisiensi pengolahan (BOD & COD, Coliform, pH, dan TSS)',
          'Analisa & rekomendasi teknis operasional IPAL otomatis berbasis realtime AI',
        ],
      },
      {
        id: 'ipal',
        title: 'Monitoring Baku Mutu Limbah Padat',
        href: '/monitoring/ipal',
        description:
          'Pemantauan Indikator Baku Mutu Limbah Padat (pemilahan, penyimpanan < 90 hari, TPS B3 berizin) serta rekapan timbulan Limbah B3 (Limbah Padat, Limbah Tajam, Obat Kadaluarsa) Januari–Desember.',
        status: 'Functional',
        plannedFeatures: [
          'Sheet 1: Tabel Indikator Baku Mutu Limbah Padat (Pemilahan, Penyimpanan < 90 Hari, TPS B3 Berizin, dan Nilai)',
          'Sheet 2: Tabel Hasil Limbah B3 dari Januari–Desember (Limbah Padat, Limbah Tajam, Obat Kadaluarsa, dan Total)',
          'Visualisasi grafik timbulan Limbah B3 bulanan serta analisa, rekomendasi, dan rencana tindak lanjut',
        ],
      },
      {
        id: 'vektor',
        title: 'Pengendalian Vektor & Binatang',
        href: '/monitoring/vektor',
        description:
          'Pemantauan Ruangan Bebas Vektor dan Binatang Pengganggu pada 20 unit ruangan dengan 8 indikator vektor lengkap dengan grafik dan analisa.',
        status: 'Functional',
        plannedFeatures: [
          'Tabel Ruangan Bebas Vektor dan Binatang Pengganggu (20 unit & 8 indikator vektor)',
          'Rekapan matriks capaian 12 bulan (Januari–Desember)',
          'Visualisasi grafik capaian kumulatif dan analisa tindak lanjut',
        ],
      },
      {
        id: 'higiene-sanitasi',
        title: 'Higiene dan Sanitasi Lingkungan',
        href: '/monitoring/higiene-sanitasi',
        description:
          'Wadah monitoring kebersihan ruang, fasilitas sanitasi, toilet, pengelolaan linen, dan desinfeksi lingkungan.',
        status: 'Placeholder',
        plannedFeatures: [
          'Inspeksi kebersihan permukaan lantai, dinding, dan fasilitas sanitasi ruangan',
          'Monitoring ketersediaan sarana cuci tangan dan tempat sampah terpilah',
          'Pencatatan kegiatan pembersihan umum (general cleaning) dan desinfeksi',
        ],
      },
      {
        id: 'sanitasi-pangan',
        title: 'Higiene Sanitasi Pangan',
        href: '/monitoring/sanitasi-pangan',
        description:
          'Pemantauan Kesehatan dan Keamanan Proses Penghidangan, sertifikat jasa boga golongan B, dan hasil IKL jasaboga beserta grafik dan analisa.',
        status: 'Functional',
        plannedFeatures: [
          'Tabel Kesehatan dan Keamanan Proses Penghidangan (Januari–Desember)',
          'Monitoring kepemilikan sertifikat jasa boga golongan B & hasil IKL',
          'Visualisasi grafik nilai penghidangan dan analisa tindak lanjut',
        ],
      },
      {
        id: 'monitoring-lainnya',
        title: 'Monitoring Lainnya',
        href: '/monitoring/lainnya',
        description:
          'Wadah fleksibel yang dapat dikonfigurasi untuk jenis pemantauan kesehatan lingkungan tambahan sesuai kebutuhan RSUD Al-Mulk.',
        status: 'Placeholder',
        plannedFeatures: [
          'Pembuatan modul pemantauan kustom berbasis kategori master data',
          'Konfigurasi field pemeriksaan dinamis tanpa perubahan kode inti',
        ],
      },
    ],
  },
  {
    id: 'supervisi',
    number: 4,
    title: 'Supervisi Lingkungan',
    shortTitle: 'Supervisi',
    href: '/supervisi',
    iconName: 'ShieldCheck',
    group: 'Operasional & Lapangan',
    description:
      'Modul Supervisi Ruangan & Kesling (10 Card Ruangan: Rawat Jalan, IGD, Ranap ICU & IBS, Ranap Usman, Ranap Aisyah, Ranap Fatimah, Ranap Khadijah, Manajemen, Halaman, dan Supervisi) beserta Form Input dan Tabel Rekap Supervisi.',
    status: 'Functional',
    subItems: [
      {
        id: 'supervisi-dashboard',
        title: 'Dashboard Supervisi',
        href: '/supervisi/dashboard',
        description:
          'Pilih salah satu dari 10 card ruangan (Rawat Jalan, IGD, Ranap ICU dan IBS, Ranap Usman, Ranap Aisyah, Ranap Fatimah, Ranap Khadijah, Manajemen, Halaman, atau Supervisi) untuk membuka form penginputan data supervisi.',
        status: 'Functional',
        plannedFeatures: [
          '10 Card pilihan ruangan dan modul supervisi dengan ilustrasi 3D',
          'Form penginputan berurut ke bawah (Tanggal, Supervisor, Unit, Nama Petugas, Kerapihan, Prosedur, Alat & Bahan, K3, Sikap & Perilaku, Skor 1-4, Temuan, Rekomendasi, Dokumentasi Foto, & Tanda Tangan)',
          'Integrasi otomatis penyimpanan data ke Tabel Rekap Supervisi',
        ],
      },
      {
        id: 'supervisi-evaluasi',
        title: 'Input Data Supervisi',
        href: '/supervisi/evaluasi',
        description:
          'Form penginputan data supervisi berurut ke bawah beserta penilaian skor 1–4, dokumentasi foto temuan/perbaikan, dan tanda tangan.',
        status: 'Functional',
        plannedFeatures: [
          'Input Tanggal, Supervisor, Unit, dan Nama Petugas',
          'Penilaian Kerapihan, Prosedur, Alat & Bahan, K3, dan Sikap & Perilaku (Skor 1-4)',
          'Input Temuan, Rekomendasi, Dokumentasi Foto, dan Tanda Tangan',
        ],
      },
      {
        id: 'supervisi-riwayat',
        title: 'Tabel Rekap Supervisi',
        href: '/supervisi/riwayat',
        description:
          'Tabel rekapan hasil input data supervisi ruangan beserta skor, kategori, temuan, rekomendasi, gambar dokumentasi, dan tanda tangan.',
        status: 'Functional',
        plannedFeatures: [
          'Tabel rekap laporan supervisi ruangan lengkap dengan foto dokumentasi & tanda tangan',
          'Navigasi tab per ruangan (Rawat Jalan, IGD, Ranap ICU & IBS, Usman, Aisyah, Fatimah, Khadijah, Manajemen, Halaman, Supervisi)',
        ],
      },
    ],
  },
  {
    id: 'tindak-lanjut',
    number: 5,
    title: 'Tindak Lanjut Temuan',
    shortTitle: 'Tindak Lanjut',
    href: '/tindak-lanjut',
    iconName: 'CheckSquare',
    group: 'Operasional & Lapangan',
    description:
      'Pengelolaan alur kerja perbaikan temuan lapangan dari Temuan Baru hingga Selesai Terverifikasi.',
    status: 'UI Ready',
    subItems: [
      {
        id: 'daftar-temuan',
        title: 'Daftar Temuan',
        href: '/tindak-lanjut/temuan',
        description:
          'Daftar seluruh temuan hasil supervisi dan monitoring beserta status alur kerja tindak lanjutnya.',
        status: 'UI Ready',
        plannedFeatures: [
          'Alur status: Temuan Baru → Dalam Proses → Menunggu Verifikasi → Selesai Terverifikasi',
          'Filter berdasarkan status, prioritas, lokasi ruangan, dan penanggung jawab',
          'Tampilan detail temuan mencakup foto sebelum dan sesudah perbaikan',
        ],
      },
      {
        id: 'temuan-pending',
        title: 'Temuan Belum Selesai',
        href: '/tindak-lanjut/pending',
        description:
          'Fokus pemantauan temuan berstatus Temuan Baru yang membutuhkan penugasan dan tindakan segera.',
        status: 'UI Ready',
        plannedFeatures: [
          'Daftar temuan terbuka berdasarkan tingkat urgensi dan target penyelesaian',
          'Penetapan unit/penanggung jawab tindak lanjut perbaikan',
        ],
      },
      {
        id: 'proses-perbaikan',
        title: 'Proses Perbaikan',
        href: '/tindak-lanjut/proses',
        description:
          'Pemantauan temuan yang sedang dalam tahap pengerjaan atau koordinasi lintas unit (IPSRS, Kebersihan, Unit Terkait).',
        status: 'UI Ready',
        plannedFeatures: [
          'Pencatatan progres tindakan korektif dan kendala lapangan',
          'Unggah foto bukti setelah perbaikan untuk diajukan ke tahap verifikasi',
        ],
      },
      {
        id: 'verifikasi-perbaikan',
        title: 'Verifikasi Perbaikan',
        href: '/tindak-lanjut/verifikasi',
        description:
          'Halaman review dan validasi oleh Koordinator/Petugas Kesling atas temuan yang telah diperbaiki.',
        status: 'UI Ready',
        plannedFeatures: [
          'Perbandingan dokumentasi sebelum dan sesudah perbaikan',
          'Persetujuan status Selesai Terverifikasi atau pengembalian ke Dalam Proses',
        ],
      },
      {
        id: 'riwayat-tindak-lanjut',
        title: 'Riwayat Tindak Lanjut',
        href: '/tindak-lanjut/riwayat',
        description:
          'Arsip seluruh temuan yang telah selesai ditindaklanjuti dan terverifikasi.',
        status: 'UI Ready',
        plannedFeatures: [
          'Log waktu penyelesaian (lead time) perbaikan temuan',
          'Integrasi ke Laporan Tindak Lanjut berkala',
        ],
      },
    ],
  },
  {
    id: 'analisis',
    number: 6,
    title: 'Grafik & Analisis',
    shortTitle: 'Analisis',
    href: '/analisis',
    iconName: 'BarChart3',
    group: 'Pelaporan & Arsip',
    description:
      'Visualisasi data interaktif menggunakan Recharts untuk evaluasi tren kegiatan, monitoring, supervisi, dan tindak lanjut.',
    status: 'UI Ready',
    subItems: [
      {
        id: 'analisis-kegiatan',
        title: 'Analisis Kegiatan',
        href: '/analisis/kegiatan',
        description:
          'Visualisasi distribusi dan frekuensi kegiatan operasional petugas Kesling per periode dan lokasi.',
        status: 'UI Ready',
        plannedFeatures: [
          'Bar Chart dan Line Chart tren pelaksanaan kegiatan harian',
          'Distribusi kegiatan per kategori dan unit layanan',
        ],
      },
      {
        id: 'analisis-monitoring',
        title: 'Analisis Monitoring',
        href: '/analisis/monitoring',
        description:
          'Grafik pemantauan parameter lingkungan rumah sakit berdasarkan kategori monitoring.',
        status: 'Placeholder',
        plannedFeatures: [
          'Visualisasi tren parameter air, udara, limbah, dan IPAL',
          'Indikator pencapaian setelah standar penilaian dikonfirmasi',
        ],
      },
      {
        id: 'analisis-supervisi',
        title: 'Analisis Supervisi',
        href: '/analisis/supervisi',
        description:
          'Visualisasi frekuensi supervisi lapangan, sebaran ruangan yang diperiksa, dan proporsi temuan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Grafik cakupan supervisi per instalasi rumah sakit',
          'Distribusi kategori temuan hasil supervisi',
        ],
      },
      {
        id: 'analisis-tindak-lanjut',
        title: 'Analisis Tindak Lanjut',
        href: '/analisis/tindak-lanjut',
        description:
          'Visualisasi proporsi penyelesaian temuan dan distribusi status alur kerja perbaikan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Donut Chart distribusi status temuan (Baru, Proses, Verifikasi, Selesai)',
          'Progress indicator tingkat penyelesaian tindak lanjut',
        ],
      },
      {
        id: 'tren-indikator',
        title: 'Tren Indikator',
        href: '/analisis/tren',
        description:
          'Wadah evaluasi tren indikator mutu dan kesehatan lingkungan jangka panjang.',
        status: 'Placeholder',
        plannedFeatures: [
          'Area Chart perbandingan capaian antar bulan/triwulan/tahun',
          'Konfigurasi target indikator dinamis dari modul Master Data',
        ],
      },
    ],
  },
  {
    id: 'laporan',
    number: 7,
    title: 'Laporan',
    shortTitle: 'Laporan',
    href: '/laporan',
    iconName: 'FileSpreadsheet',
    group: 'Pelaporan & Arsip',
    description:
      'Sistem penyusunan laporan berkala dengan prinsip Single Data Entry, Multiple Reporting Outputs.',
    status: 'UI Ready',
    subItems: [
      {
        id: 'laporan-bulanan',
        title: 'Laporan Bulanan',
        href: '/laporan/bulanan',
        description:
          'Rekapitulasi bulanan kegiatan operasional, monitoring, supervisi, dan tindak lanjut temuan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Filter tahun, bulan, kategori laporan, dan unit/ruangan',
          'Preview rekapitulasi otomatis dari data operasional aktual',
          'Ekspor PDF dan Excel sesuai format resmi RSUD Al-Mulk (tahap berikutnya)',
        ],
      },
      {
        id: 'laporan-triwulanan',
        title: 'Laporan Triwulanan',
        href: '/laporan/triwulanan',
        description:
          'Kompilasi capaian kesehatan lingkungan per triwulan (Q1–Q4) untuk evaluasi manajemen.',
        status: 'UI Ready',
        plannedFeatures: [
          'Agregasi data 3 bulanan secara otomatis tanpa input ulang',
          'Preview ringkasan eksekutif triwulanan',
        ],
      },
      {
        id: 'laporan-semesteran',
        title: 'Laporan Semesteran',
        href: '/laporan/semesteran',
        description:
          'Laporan evaluasi paruh tahun (Semester I dan Semester II) pengelolaan kesehatan lingkungan rumah sakit.',
        status: 'UI Ready',
        plannedFeatures: [
          'Filter tahun dan semester (Semester 1 / Semester 2)',
          'Kompilasi data monitoring lingkungan dan pelaporan instansi terkait',
        ],
      },
      {
        id: 'laporan-tahunan',
        title: 'Laporan Tahunan',
        href: '/laporan/tahunan',
        description:
          'Rekapitulasi komprehensif tahunan penyelenggaraan kesehatan lingkungan UOBK RSUD Al-Mulk.',
        status: 'UI Ready',
        plannedFeatures: [
          'Agregasi penuh seluruh kegiatan, supervisi, dan tindak lanjut selama 1 tahun',
          'Perbandingan tren antar triwulan dan semester',
        ],
      },
      {
        id: 'laporan-supervisi',
        title: 'Laporan Supervisi',
        href: '/laporan/supervisi',
        description:
          'Laporan khusus hasil pelaksanaan inspeksi dan supervisi lingkungan per unit/ruangan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Cetak berita acara atau rekap hasil supervisi beserta lampiran foto',
          'Filter berdasarkan periode, petugas, dan ruangan',
        ],
      },
      {
        id: 'laporan-monitoring',
        title: 'Laporan Monitoring',
        href: '/laporan/monitoring',
        description:
          'Laporan khusus hasil pemantauan kualitas air, udara, limbah, IPAL, vektor, dan sanitasi.',
        status: 'UI Ready',
        plannedFeatures: [
          'Kompilasi tabel hasil pemeriksaan parameter monitoring per kategori',
        ],
      },
      {
        id: 'laporan-tindak-lanjut',
        title: 'Laporan Tindak Lanjut',
        href: '/laporan/tindak-lanjut',
        description:
          'Laporan progres dan verifikasi penyelesaian temuan kesehatan lingkungan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Rekapitulasi daftar temuan, status penyelesaian, dan dokumentasi perbaikan',
        ],
      },
    ],
  },
  {
    id: 'dokumentasi',
    number: 8,
    title: 'Dokumentasi & Arsip',
    shortTitle: 'Arsip',
    href: '/dokumentasi',
    iconName: 'FolderArchive',
    group: 'Pelaporan & Arsip',
    description:
      'Pusat penyimpanan dokumentasi visual kegiatan, arsip hasil uji pemeriksaan, dokumen teknis, serta SOP & regulasi.',
    status: 'Placeholder',
    subItems: [
      {
        id: 'galeri-kegiatan',
        title: 'Galeri Kegiatan',
        href: '/dokumentasi/galeri',
        description:
          'Galeri foto dokumentasi kegiatan harian dan supervisi lapangan yang tersimpan secara terorganisasi.',
        status: 'UI Ready',
        plannedFeatures: [
          'Tampilan galeri terfilter berdasarkan kategori kegiatan, ruangan, dan periode',
          'Preview gambar resolusi penuh dengan keterangan kegiatan',
        ],
      },
      {
        id: 'arsip-pemeriksaan',
        title: 'Arsip Pemeriksaan',
        href: '/dokumentasi/pemeriksaan',
        description:
          'Repositori sertifikat hasil uji laboratorium (air, udara, limbah, usap alat/linen) dan berita acara.',
        status: 'Placeholder',
        plannedFeatures: [
          'Upload dokumen PDF/gambar hasil pemeriksaan laboratorium',
          'Kategorisasi berdasarkan jenis uji dan periode pemeriksaan',
        ],
      },
      {
        id: 'dokumen-kesling',
        title: 'Dokumen Kesling',
        href: '/dokumentasi/dokumen',
        description:
          'Penyimpanan dokumen perencanaan, pedoman kerja, perizinan lingkungan, dan manifest.',
        status: 'Placeholder',
        plannedFeatures: [
          'Manajemen dokumen internal dengan kontrol akses berbasis role',
          'Riwayat revisi dan pencarian dokumen',
        ],
      },
      {
        id: 'sop-regulasi',
        title: 'SOP & Regulasi',
        href: '/dokumentasi/sop-regulasi',
        description:
          'Kumpulan Standar Prosedur Operasional (SOP) rumah sakit dan regulasi kesehatan lingkungan yang berlaku.',
        status: 'Placeholder',
        plannedFeatures: [
          'Daftar SOP Kesling RSUD Al-Mulk beserta nomor dokumen dan tanggal terbit',
          'Referensi regulasi nasional dan daerah terkait kesehatan lingkungan RS',
        ],
      },
    ],
  },
  {
    id: 'master-data',
    number: 9,
    title: 'Master Data',
    shortTitle: 'Master Data',
    href: '/master-data',
    iconName: 'Database',
    group: 'Konfigurasi Sistem',
    description:
      'Pengelolaan data referensi dinamis agar seluruh unit, kategori, parameter, dan standar dapat dikonfigurasi tanpa hardcoding.',
    status: 'UI Ready',
    subItems: [
      {
        id: 'master-ruangan',
        title: 'Data Unit dan Ruangan',
        href: '/master-data/ruangan',
        description:
          'Pengelolaan daftar instalasi, unit kerja, gedung, dan ruangan di lingkungan UOBK RSUD Al-Mulk Kota Sukabumi.',
        status: 'UI Ready',
        plannedFeatures: [
          'Penambahan, perubahan, dan penonaktifan data unit serta ruangan',
          'Pengelompokan ruangan berdasarkan instalasi dan zona risiko',
        ],
      },
      {
        id: 'master-petugas',
        title: 'Data Petugas',
        href: '/master-data/petugas',
        description:
          'Pengelolaan data sanitarian dan petugas pelaksana kesehatan lingkungan rumah sakit.',
        status: 'UI Ready',
        plannedFeatures: [
          'Pencatatan identitas petugas, jabatan/peran, dan status penugasan aktif',
        ],
      },
      {
        id: 'master-kategori-kegiatan',
        title: 'Kategori Kegiatan',
        href: '/master-data/kategori-kegiatan',
        description:
          'Konfigurasi daftar jenis kegiatan operasional Kesling agar dapat disesuaikan dengan kebutuhan rumah sakit.',
        status: 'UI Ready',
        plannedFeatures: [
          'Manajemen kode dan nama kategori kegiatan harian',
          'Pengaturan frekuensi indikatif dan status aktif',
        ],
      },
      {
        id: 'master-kategori-monitoring',
        title: 'Kategori Monitoring',
        href: '/master-data/kategori-monitoring',
        description:
          'Konfigurasi klasifikasi dan objek pemantauan lingkungan rumah sakit.',
        status: 'UI Ready',
        plannedFeatures: [
          'Pengelolaan kelompok monitoring dan sub-kategori objek pemeriksaan',
        ],
      },
      {
        id: 'master-indikator',
        title: 'Indikator & Parameter',
        href: '/master-data/indikator',
        description:
          'Wadah konfigurasi parameter pemeriksaan, satuan pengukuran, dan metode uji (dikosongkan hingga terverifikasi).',
        status: 'Needs Validation',
        plannedFeatures: [
          'Konfigurasi nama parameter, satuan ukur, dan tipe input data',
          'Penautan parameter ke standar baku mutu yang berlaku',
        ],
      },
      {
        id: 'master-template',
        title: 'Template Pemeriksaan',
        href: '/master-data/template',
        description:
          'Konfigurasi struktur formulir dan butir pemeriksaan untuk modul monitoring serta supervisi.',
        status: 'Placeholder',
        plannedFeatures: [
          'Pembuat struktur formulir pemeriksaan dinamis per kategori',
        ],
      },
      {
        id: 'master-standar',
        title: 'Standar & Referensi',
        href: '/master-data/standar',
        description:
          'Pengelolaan referensi regulasi teknis mencakup nama standar, sumber regulasi, nomor, tanggal berlaku, versi, dan status aktif.',
        status: 'UI Ready',
        plannedFeatures: [
          'Pencatatan metadata regulasi (Nama Standar, Sumber, Nomor, Tanggal Berlaku, Versi, Status)',
          'Tidak mengisi ambang batas teknis secara sembarangan sebelum verifikasi resmi',
        ],
      },
    ],
  },
  {
    id: 'pengaturan',
    number: 10,
    title: 'Pengaturan',
    shortTitle: 'Pengaturan',
    href: '/pengaturan',
    iconName: 'Settings',
    group: 'Konfigurasi Sistem',
    description:
      'Konfigurasi identitas rumah sakit, manajemen pengguna, matriks hak akses (RBAC), preferensi tema, dan informasi sistem.',
    status: 'UI Ready',
    subItems: [
      {
        id: 'pengaturan-rs',
        title: 'Profil Rumah Sakit',
        href: '/pengaturan/rumah-sakit',
        description:
          'Konfigurasi identitas resmi UOBK RSUD Al-Mulk Kota Sukabumi dan unit Kesehatan Lingkungan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Pengelolaan nama instansi, alamat, kontak, dan kepala unit/instalasi pada kop laporan',
        ],
      },
      {
        id: 'pengaturan-pengguna',
        title: 'Manajemen Pengguna',
        href: '/pengaturan/pengguna',
        description:
          'Pengelolaan akun pengguna sistem SIKESLING RSAM beserta status keaktifan.',
        status: 'UI Ready',
        plannedFeatures: [
          'Penambahan akun pengguna, penetapan role, dan reset kredensial aman',
        ],
      },
      {
        id: 'pengaturan-hak-akses',
        title: 'Hak Akses',
        href: '/pengaturan/hak-akses',
        description:
          'Konfigurasi Role-Based Access Control (Administrator, Petugas Kesling, Koordinator Kesling, Pimpinan / Viewer) dengan validasi sisi server.',
        status: 'UI Ready',
        plannedFeatures: [
          'Matriks izin baca/tulis/verifikasi/konfigurasi per modul',
          'Simulasi dan validasi otorisasi berbasis role',
        ],
      },
      {
        id: 'pengaturan-tampilan',
        title: 'Preferensi Tampilan',
        href: '/pengaturan/tampilan',
        description:
          'Pengaturan mode warna (Light Mode, Dark Mode, Ikuti Sistem), kepadatan tabel, dan aksesibilitas gerakan.',
        status: 'Functional',
        plannedFeatures: [
          'Pemilihan tema Light, Dark, atau System dengan penyimpanan preferensi lokal',
          'Opsi pengurangan animasi (Reduced Motion) untuk kenyamanan kerja',
        ],
      },
      {
        id: 'pengaturan-aplikasi',
        title: 'Pengaturan Aplikasi',
        href: '/pengaturan/aplikasi',
        description:
          'Status arsitektur koneksi database PostgreSQL/Prisma, konfigurasi penyimpanan privat, dan instalasi PWA.',
        status: 'UI Ready',
        plannedFeatures: [
          'Indikator konfigurasi environment variables dan kesiapan database lokal',
          'Batas ukuran file upload dan direktori penyimpanan privat',
        ],
      },
      {
        id: 'pengaturan-tentang',
        title: 'Tentang Aplikasi',
        href: '/pengaturan/tentang',
        description:
          'Informasi versi SIKESLING RSAM v1.0 (Foundation Development), arsitektur sistem, dan dokumentasi teknis.',
        status: 'Functional',
        plannedFeatures: [
          'Ringkasan spesifikasi sistem, roadmap pengembangan, dan status modul',
        ],
      },
    ],
  },
];

export interface BreadcrumbSegment {
  label: string;
  href: string;
}

export function resolveRouteMeta(pathname: string): {
  title: string;
  description: string;
  status: ModuleStatusType;
  breadcrumbs: BreadcrumbSegment[];
  parentMenu?: MainMenuItem;
  subMenu?: SubMenuItem;
} {
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/dashboard';

  for (const menu of MAIN_NAVIGATION) {
    if (menu.href === cleanPath) {
      return {
        title: menu.title,
        description: menu.description,
        status: menu.status,
        breadcrumbs: [
          { label: 'SIKESLING RSAM', href: '/dashboard' },
          { label: menu.title, href: menu.href },
        ],
        parentMenu: menu,
      };
    }

    if (menu.subItems) {
      for (const sub of menu.subItems) {
        if (sub.href === cleanPath) {
          return {
            title: sub.title,
            description: sub.description,
            status: sub.status,
            breadcrumbs: [
              { label: 'SIKESLING RSAM', href: '/dashboard' },
              { label: menu.title, href: menu.href },
              { label: sub.title, href: sub.href },
            ],
            parentMenu: menu,
            subMenu: sub,
          };
        }
      }
    }
  }

  return {
    title: 'Dashboard',
    description:
      'Sistem Monitoring dan Manajemen Kesehatan Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi.',
    status: 'UI Ready',
    breadcrumbs: [{ label: 'SIKESLING RSAM', href: '/dashboard' }],
  };
}

export function getAllRoutes(): string[] {
  const routes: string[] = [];
  for (const menu of MAIN_NAVIGATION) {
    routes.push(menu.href);
    if (menu.subItems) {
      for (const sub of menu.subItems) {
        routes.push(sub.href);
      }
    }
  }
  return routes;
}
