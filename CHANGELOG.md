# CHANGELOG — SIKESLING RSAM

Seluruh perubahan penting pada proyek **SIKESLING RSAM (UOBK RSUD Al-Mulk Kota Sukabumi)** didokumentasikan pada berkas ini.

---

## [1.0.0-foundation] — 2026-10-31

### Added
- **Project Foundation:** Inisialisasi arsitektur Next.js App Router, TypeScript, Tailwind CSS v4, konfigurasi font `Plus Jakarta Sans` & `JetBrains Mono`, serta dukungan tema Light Mode (default), Dark Mode, dan System Preference.
- **PWA Foundation:** Penambahan `app/manifest.ts`, ikon PWA standar (`192x192`, `512x512`, `maskable`, `apple-touch-icon.png`), serta komponen `PWAInstallButton` dan indikator status koneksi.
- **Responsive Application Shell:** Pembuatan `AppSidebar` (collapsible dengan tooltip & mobile drawer), `AppHeader` (breadcrumb, navigasi cepat, info notifikasi, switcher tema, switcher simulasi role RBAC), dan `MobileNavigation` (bottom bar ramah sentuhan).
- **Complete Navigation & 10 Main Menus:** Implementasi penuh seluruh rute menu dan submenu:
  1. Dashboard (`/dashboard`)
  2. Kegiatan Operasional (`/operasional/kegiatan-harian`, `/operasional/jadwal`, `/operasional/riwayat`)
  3. Monitoring Lingkungan (`/monitoring/kualitas-air`, `/monitoring/kualitas-udara`, `/monitoring/limbah`, `/monitoring/ipal`, `/monitoring/vektor`, `/monitoring/higiene-sanitasi`, `/monitoring/sanitasi-pangan`, `/monitoring/lainnya`)
  4. Supervisi Lingkungan (`/supervisi/dashboard`, `/supervisi/baru`, `/supervisi/riwayat`, `/supervisi/dokumentasi`, `/supervisi/template`, `/supervisi/rekap`)
  5. Tindak Lanjut Temuan (`/tindak-lanjut/temuan`, `/tindak-lanjut/pending`, `/tindak-lanjut/proses`, `/tindak-lanjut/verifikasi`, `/tindak-lanjut/riwayat`)
  6. Grafik & Analisis (`/analisis/kegiatan`, `/analisis/monitoring`, `/analisis/supervisi`, `/analisis/tindak-lanjut`, `/analisis/tren`)
  7. Laporan (`/laporan/bulanan`, `/laporan/triwulanan`, `/laporan/semesteran`, `/laporan/tahunan`, `/laporan/supervisi`, `/laporan/monitoring`, `/laporan/tindak-lanjut`)
  8. Dokumentasi & Arsip (`/dokumentasi/galeri`, `/dokumentasi/pemeriksaan`, `/dokumentasi/dokumen`, `/dokumentasi/sop-regulasi`)
  9. Master Data (`/master-data/ruangan`, `/master-data/petugas`, `/master-data/kategori-kegiatan`, `/master-data/kategori-monitoring`, `/master-data/indikator`, `/master-data/template`, `/master-data/standar`)
  10. Pengaturan (`/pengaturan/rumah-sakit`, `/pengaturan/pengguna`, `/pengaturan/hak-akses`, `/pengaturan/tampilan`, `/pengaturan/aplikasi`, `/pengaturan/tentang`)
- **Database & Security Foundation:** Pembuatan skema PostgreSQL Prisma ORM (`prisma/schema.prisma`) mencakup 14 entitas inti, pemisahan Presentation / Business Logic / DAL / Database Layer, serta validasi RBAC sisi server (`/api/foundation`).
- **Automated Unit Tests:** Penambahan pengujian logika domain, validasi input/upload, RBAC, dan alur status temuan pada `lib/domain.test.ts`.
