# DEVELOPMENT ROADMAP — SIKESLING RSAM

**UOBK RSUD Al-Mulk Kota Sukabumi**

---

## Tahap 1 — Foundation Development (Selesai / Saat Ini)

- Pembangunan arsitektur aplikasi Next.js App Router + TypeScript + Tailwind CSS.
- Sistem desain responsif (Desktop, Tablet, Smartphone Android/iOS) dengan Light Mode, Dark Mode, dan System Preference.
- Implementasi penuh seluruh struktur navigasi (10 Menu Utama dan 46 Rute Halaman) tanpa *dead links*.
- Pembuatan Dashboard eksekutif dengan *empty state* jujur (tanpa angka statistik fiktif).
- Implementasi formulir rancangan (Mode Sesi Lokal) untuk **Pencatatan Kegiatan Harian**, **Mulai Supervisi Lapangan** (termasuk preview dokumentasi foto), **Alur Tindak Lanjut Temuan**, dan konfigurasi **Master Data**.
- Penyusunan skema database relasional PostgreSQL (`prisma/schema.prisma`) untuk 14 entitas inti dan validasi hak akses server-side (RBAC).

---

## Tahap 2 — Konsultasi Teknis Kesling & Persistensi Database Lokal

- Konfirmasi daftar resmi parameter pemeriksaan, satuan ukur, dan baku mutu bersama petugas Kesling UOBK RSUD Al-Mulk.
- Koneksi penuh Data Access Layer (`lib/dal`) ke instance PostgreSQL lokal rumah sakit melalui Prisma Client.
- Implementasi autentikasi sesi pengguna dengan hashing password (`bcrypt`/`argon2`) dan log audit perubahan data.
- Penyimpanan fisik foto dokumentasi supervisi dan dokumen PDF pada direktori privat server (`STORAGE_PRIVATE_DIR`).

---

## Tahap 3 — Operasional Penuh Modul Monitoring & Template Checklist Dinamis

- Pembuatan *Form Builder* untuk **Template Checklist Supervisi** per jenis ruangan/instalasi.
- Implementasi tabel input parameter khusus untuk Monitoring Kualitas Air, Udara, Limbah Medis/B3/Domestik, IPAL, Vektor, dan Sanitasi Pangan.
- Perhitungan persentase kepatuhan lingkungan berdasarkan rumus resmi yang telah disahkan manajemen rumah sakit.

---

## Tahap 4 — Otomasi Pelaporan Resmi & Kemampuan Offline-First PWA

- Implementasi ekspor dokumen **PDF** (dengan kop surat resmi UOBK RSUD Al-Mulk Kota Sukabumi) dan **Excel** untuk Laporan Bulanan, Triwulanan, Semesteran, dan Tahunan.
- Implementasi *Service Worker* (`@serwist/next`) dan antrean sinkronisasi lokal (*IndexedDB*) agar petugas dapat mengisi checklist supervisi di area rumah sakit yang minim sinyal lalu menyinkronkan data saat kembali terhubung.
- Pengingat jadwal pemeriksaan dan tindak lanjut temuan otomatis.
