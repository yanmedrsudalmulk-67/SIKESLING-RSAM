# SIKESLING RSAM — Sistem Informasi Kesehatan Lingkungan

**UOBK RSUD Al-Mulk Kota Sukabumi**  
*Tagline: Smart Environmental Health Monitoring & Management*  
**Versi:** 1.0 — Foundation Development

---

## 1. Deskripsi Proyek

**SIKESLING RSAM** adalah aplikasi web responsif dan Progressive Web App (PWA) yang dirancang untuk mendigitalisasi kegiatan operasional kesehatan lingkungan rumah sakit, pemantauan kualitas lingkungan, pelaksanaan supervisi lapangan menggunakan smartphone/tablet, pengelolaan alur kerja tindak lanjut temuan, serta penyusunan laporan berkala di lingkungan **UOBK RSUD Al-Mulk Kota Sukabumi**.

Pengembangan versi `1.0 — Foundation Development` berfokus pada pembangunan arsitektur modular berlapis, sistem komponen antarmuka, struktur navigasi lengkap (10 menu utama dan seluruh submodul), skema database relasional, serta fondasi keamanan berbasis role (RBAC) tanpa mengunci indikator teknis kesehatan lingkungan yang belum diverifikasi bersama petugas Kesling.

---

## 2. Technology Stack

- **Frontend:** Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI & Visualisasi:** Komponen Desain Modular SIKESLING (shadcn-compatible), Lucide React Icons, Recharts, Motion
- **Backend Architecture:** Next.js API Routes / Server Services dengan pemisahan Presentation Layer, Business Logic Layer, Data Access Layer (DAL), dan Database Layer
- **Database & ORM:** PostgreSQL (Lokal / Server Rumah Sakit) via Prisma ORM (`prisma/schema.prisma`)
- **PWA Foundation:** Native Next.js Web App Manifest (`app/manifest.ts`), ikon standar PWA, dan komponen instalasi mandiri (`PWAInstallButton`)

---

## 3. Cara Instalasi & Menjalankan Aplikasi

1. **Instalasi dependensi:**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Menjalankan server pengembangan (Development):**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` pada browser.

4. **Menjalankan Unit Test Logika Domain:**
   ```bash
   npx --yes tsx --test lib/domain.test.ts
   ```

5. **Menjalankan Build Produksi:**
   ```bash
   npm run build
   npm run start
   ```

---

## 4. Konfigurasi Environment & Menghubungkan Database PostgreSQL Lokal

Aplikasi dirancang agar dapat dijalankan pada komputer atau server internal rumah sakit tanpa ketergantungan wajib pada layanan cloud berbayar:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sikesling_rsam?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/sikesling_rsam?schema=public"
SESSION_SECRET="ganti-dengan-kunci-acak-64-karakter-pada-server-produksi"
STORAGE_PRIVATE_DIR="./storage/private"
UPLOAD_MAX_SIZE_MB="5"
```

Setelah PostgreSQL lokal aktif, jalankan migrasi skema Prisma (`prisma/schema.prisma`):
```bash
npx prisma generate
npx prisma migrate dev --name init_sikesling_foundation
```

---

## 5. Struktur Proyek Modular

```text
├── app/
│   ├── api/foundation/         # Endpoint validasi server RBAC & metadata arsitektur
│   ├── dashboard/              # Menu 1: Dashboard Utama
│   ├── operasional/            # Menu 2: Kegiatan Harian, Jadwal, Riwayat
│   ├── monitoring/             # Menu 3: Air, Udara, Limbah, IPAL, Vektor, Sanitasi, Pangan, Lainnya
│   ├── supervisi/              # Menu 4: Dashboard, Mulai Supervisi, Riwayat, Dokumentasi, Template, Rekap
│   ├── tindak-lanjut/          # Menu 5: Daftar Temuan, Pending, Proses, Verifikasi, Riwayat
│   ├── analisis/               # Menu 6: Analisis Kegiatan, Monitoring, Supervisi, Tindak Lanjut, Tren
│   ├── laporan/                # Menu 7: Bulanan, Triwulanan, Semesteran, Tahunan, Supervisi, Monitoring, Tindak Lanjut
│   ├── dokumentasi/            # Menu 8: Galeri Kegiatan, Arsip Pemeriksaan, Dokumen Kesling, SOP & Regulasi
│   ├── master-data/            # Menu 9: Ruangan, Petugas, Kategori, Indikator, Template, Standar
│   ├── pengaturan/             # Menu 10: Profil RS, Pengguna, Hak Akses, Tampilan, Aplikasi, Tentang
│   ├── manifest.ts             # Konfigurasi PWA Web App Manifest
│   └── layout.tsx              # Root Layout, Font, & Theme Provider
├── components/sikesling/       # Reusable UI Component Library & Modular Views
├── hooks/use-pwa.ts            # Hook instalasi PWA & deteksi konektivitas
├── lib/
│   ├── navigation.ts           # Definisi 10 Menu Utama, Submenu, & Breadcrumb Resolver
│   ├── domain.ts               # Model Domain, RBAC, State Machine Temuan, & Validasi Input/File
│   ├── domain.test.ts          # Unit Test Suite (node:test)
│   ├── db/index.ts             # Database Layer
│   ├── dal/index.ts            # Data Access Layer (14 Entitas Fondasi)
│   └── services/index.ts       # Business Logic & Server-Side Authorization Layer
└── prisma/
    └── schema.prisma           # Skema Database Relasional PostgreSQL (14 Tabel Fondasi)
```
