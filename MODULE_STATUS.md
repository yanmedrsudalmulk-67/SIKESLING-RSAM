# MODULE STATUS — SIKESLING RSAM (v1.0 Foundation)

Daftar status kesiapan seluruh modul pada **Tahap Pertama (Foundation Development)**:

| No | Menu / Modul | Route | Status | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Dashboard Utama** | `/dashboard` | `UI Ready` | Welcome section, 6 summary cards (0/aktual), 4 grafik Recharts dengan empty state, quick actions |
| **2.1** | Pencatatan Kegiatan Harian | `/operasional/kegiatan-harian` | `UI Ready` | Formulir rancangan interaktif (mode sesi lokal) terhubung ke Master Data & Riwayat |
| **2.2** | Jadwal Kegiatan | `/operasional/jadwal` | `UI Ready` | Kalender agenda pemeriksaan, monitoring, supervisi, & pengambilan sampel |
| **2.3** | Riwayat Kegiatan | `/operasional/riwayat` | `UI Ready` | Tabel riwayat kegiatan dengan filter periode, jenis, petugas, dan lokasi |
| **3.1** | Monitoring Kualitas Air | `/monitoring/kualitas-air` | `Placeholder` | Wadah standar monitoring + filter + informasi pengembangan (menunggu parameter resmi) |
| **3.2** | Monitoring Kualitas Udara | `/monitoring/kualitas-udara` | `Placeholder` | Wadah standar monitoring kualitas udara ruangan |
| **3.3** | Monitoring Pengelolaan Limbah | `/monitoring/limbah` | `Placeholder` | Wadah kategori Limbah medis, Limbah B3, Limbah domestik, & Kategori lainnya |
| **3.4** | Monitoring IPAL | `/monitoring/ipal` | `Placeholder` | Wadah pemantauan operasional harian & kualitas efluen IPAL |
| **3.5** | Pengendalian Vektor & Binatang | `/monitoring/vektor` | `Placeholder` | Wadah pemantauan survei dan pengendalian vektor |
| **3.6** | Higiene dan Sanitasi Lingkungan | `/monitoring/higiene-sanitasi` | `Placeholder` | Wadah pemantauan kebersihan ruangan, toilet, dan linen |
| **3.7** | Higiene Sanitasi Pangan | `/monitoring/sanitasi-pangan` | `Placeholder` | Wadah pemantauan sanitasi dapur dan penyelenggaraan makanan Instalasi Gizi |
| **3.8** | Monitoring Lainnya | `/monitoring/lainnya` | `Placeholder` | Wadah ekspansi monitoring tambahan sesuai kebutuhan RS |
| **4.1** | Dashboard Supervisi | `/supervisi/dashboard` | `UI Ready` | Ringkasan statistik supervisi lapangan & navigasi submodul |
| **4.2** | Mulai Supervisi | `/supervisi/baru` | `UI Ready` | Formulir generik ramah mobile + upload multi-foto preview + integrasi ke Temuan |
| **4.3** | Riwayat Supervisi | `/supervisi/riwayat` | `UI Ready` | Tabel riwayat supervisi dengan filter tanggal dan ruangan |
| **4.4** | Dokumentasi Supervisi | `/supervisi/dokumentasi` | `UI Ready` | Galeri foto dokumentasi hasil supervisi lapangan |
| **4.5** | Template Checklist | `/supervisi/template` | `Placeholder` | Wadah konfigurasi instrumen checklist per ruangan |
| **4.6** | Hasil dan Rekap Supervisi | `/supervisi/rekap` | `Placeholder` | Wadah matriks rekapitulasi supervisi bulanan |
| **5.1** | Daftar Temuan | `/tindak-lanjut/temuan` | `UI Ready` | Tabel alur kerja 4 tahap: Temuan Baru → Dalam Proses → Menunggu Verifikasi → Selesai |
| **5.2** | Temuan Belum Selesai | `/tindak-lanjut/pending` | `UI Ready` | Filter khusus temuan berstatus Temuan Baru |
| **5.3** | Proses Perbaikan | `/tindak-lanjut/proses` | `UI Ready` | Filter khusus temuan berstatus Dalam Proses |
| **5.4** | Verifikasi Perbaikan | `/tindak-lanjut/verifikasi` | `UI Ready` | Halaman validasi penyelesaian perbaikan oleh Koordinator/Admin |
| **5.5** | Riwayat Tindak Lanjut | `/tindak-lanjut/riwayat` | `UI Ready` | Arsip temuan berstatus Selesai Terverifikasi |
| **6.1–6.5** | Grafik & Analisis | `/analisis/*` | `UI Ready` | Komponen Recharts (Bar, Area/Line, Donut, Progress Distribution) berbasis data aktual |
| **7.1–7.7** | Laporan Berkala & Khusus | `/laporan/*` | `UI Ready` | Filter lengkap & preview otomatis Single Data Entry Multiple Reporting Outputs |
| **8.1** | Galeri Kegiatan | `/dokumentasi/galeri` | `UI Ready` | Galeri foto terindeks dari kegiatan harian dan supervisi |
| **8.2–8.4** | Arsip, Dokumen, SOP & Regulasi | `/dokumentasi/*` | `Placeholder` | Wadah repositori dokumen internal dan regulasi |
| **9.1–9.4** | Master Ruangan, Petugas, Kategori | `/master-data/*` | `UI Ready` | Pengelolaan data referensi dinamis yang langsung terhubung ke formulir |
| **9.5** | Indikator & Parameter | `/master-data/indikator` | `Needs Validation` | Sengaja tidak diisi angka baku mutu sebelum konfirmasi resmi petugas Kesling |
| **9.6** | Template Pemeriksaan | `/master-data/template` | `Placeholder` | Wadah konfigurasi struktur formulir pemeriksaan |
| **9.7** | Standar & Referensi | `/master-data/standar` | `UI Ready` | Pencatatan metadata regulasi (Nama, Sumber, Nomor, Tgl Berlaku, Versi, Status) |
| **10.1–10.3** | Profil RS, Pengguna, Hak Akses | `/pengaturan/*` | `UI Ready` | Konfigurasi profil instansi, simulasi role, & matriks RBAC server-side |
| **10.4** | Preferensi Tampilan | `/pengaturan/tampilan` | `Functional` | Pengaturan Light Mode, Dark Mode, System Preference, dan Reduced Motion |
| **10.5–10.6** | Pengaturan & Tentang Aplikasi | `/pengaturan/*` | `Functional` | Informasi koneksi PostgreSQL/Prisma, PWA install, & dokumentasi arsitektur |
