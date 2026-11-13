'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Database,
  Info,
  Lock,
  Moon,
  Monitor,
  Save,
  Shield,
  Sun,
  Users,
  XCircle,
} from 'lucide-react';
import { resolveRouteMeta, MAIN_NAVIGATION } from '@/lib/navigation';
import { useApp, ThemeMode } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  FormSection,
  TextField,
  StatusBadge,
} from '@/components/sikesling/ui-system';
import {
  UserRole,
  PermissionAction,
  ROLE_PERMISSIONS,
  hasPermission,
} from '@/lib/domain';
import { FOUNDATION_ENTITIES } from '@/lib/dal';
import { PWAInstallButton } from '@/components/sikesling/pwa-elements';
import { SUPABASE_SETUP_SQL, getSupabaseConfig } from '@/lib/supabase';
import { Cloud, Copy, RefreshCw } from 'lucide-react';

const ALL_ACTIONS: { action: PermissionAction; label: string }[] = [
  { action: 'view_dashboard', label: 'Melihat Dashboard & Statistik' },
  { action: 'manage_operational', label: 'Mengelola Kegiatan Operasional Harian' },
  { action: 'manage_monitoring', label: 'Mengelola Data Monitoring Lingkungan' },
  { action: 'create_supervision', label: 'Melaksanakan Supervisi Lapangan' },
  { action: 'manage_findings', label: 'Memperbarui Progres Tindak Lanjut Temuan' },
  { action: 'verify_findings', label: 'Memverifikasi Penyelesaian Temuan (Final)' },
  { action: 'view_analytics', label: 'Melihat Grafik & Analisis Capaian' },
  { action: 'generate_reports', label: 'Menyusun & Preview Laporan Berkala' },
  { action: 'manage_documents', label: 'Mengelola Dokumentasi & Arsip Kesling' },
  { action: 'manage_master_data', label: 'Mengonfigurasi Master Data & Standar' },
  { action: 'manage_settings', label: 'Mengelola Pengaturan Sistem & Pengguna' },
];

export function PengaturanView({ routePath }: { routePath: string }) {
  const meta = resolveRouteMeta(routePath);
  const {
    theme,
    setTheme,
    reducedMotion,
    setReducedMotion,
    currentRole,
    setCurrentRole,
    hospitalProfile,
    updateHospitalProfile,
    supabaseDiagnostic,
    syncAllToSupabase,
    pushToast,
  } = useApp();

  const [instName, setInstName] = useState(hospitalProfile.institutionName);
  const [unitName, setUnitName] = useState(hospitalProfile.unitName);
  const [address, setAddress] = useState(hospitalProfile.address);
  const [headOfUnit, setHeadOfUnit] = useState(hospitalProfile.headOfUnit);
  const [syncingSupabase, setSyncingSupabase] = useState(false);

  const [serverAuthResult, setServerAuthResult] = useState<string | null>(null);

  const testServerAuthorization = async (
    role: UserRole,
    action: PermissionAction
  ) => {
    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, action }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setServerAuthResult(`HTTP 200 OK — ${data.message}`);
      } else {
        setServerAuthResult(`HTTP ${res.status} FORBIDDEN — ${data.error}`);
      }
    } catch {
      setServerAuthResult('Gagal menghubungi endpoint server.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      {/* 10.0 Pengaturan Index */}
      {routePath === '/pengaturan' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resolveRouteMeta('/pengaturan').parentMenu?.subItems?.map((sub, i) => (
            <Link
              key={sub.id}
              href={sub.href}
              className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 hover:border-[#1D7AFC]/60 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-[#153E75] dark:text-[#60A5FA]">
                  10.{i + 1} · {sub.status}
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {sub.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sub.description}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1D7AFC] dark:text-[#60A5FA]">
                Buka Pengaturan →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* 10.1 Profil Rumah Sakit */}
      {routePath === '/pengaturan/rumah-sakit' && (
        <FormSection
          title="Profil Instansi Rumah Sakit"
          description="Konfigurasi identitas resmi rumah sakit untuk kop laporan dan header aplikasi."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateHospitalProfile({
                institutionName: instName,
                unitName,
                address,
                headOfUnit,
              });
            }}
            className="space-y-4 max-w-2xl"
          >
            <TextField
              label="Nama Resmi Rumah Sakit"
              name="instName"
              value={instName}
              onChange={setInstName}
              required
            />
            <TextField
              label="Nama Unit / Instalasi Pengelola"
              name="unitName"
              value={unitName}
              onChange={setUnitName}
              required
            />
            <TextField
              label="Alamat Lengkap"
              name="address"
              value={address}
              onChange={setAddress}
              required
            />
            <TextField
              label="Nama Koordinator / Kepala Unit Kesling"
              name="headOfUnit"
              value={headOfUnit}
              onChange={setHeadOfUnit}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Rumah Sakit</span>
            </button>
          </form>
        </FormSection>
      )}

      {/* 10.2 Manajemen Pengguna */}
      {routePath === '/pengaturan/pengguna' && (
        <div className="space-y-4">
          <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Struktur Manajemen Pengguna & Keamanan Kredensial
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Skema tabel <code>User</code> pada <code>prisma/schema.prisma</code> dirancang menyimpan <code>passwordHash</code> (bukan plaintext) dan terhubung ke tabel <code>Role</code>. Pada tahap Foundation ini, Anda dapat mensimulasikan keempat peran pengguna secara langsung.
            </p>
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Akun Role Standar</th>
                    <th className="py-2.5 px-4">Deskripsi Kewenangan</th>
                    <th className="py-2.5 px-4">Status Sesi</th>
                    <th className="py-2.5 px-4">Simulasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(
                    [
                      {
                        role: 'Administrator' as UserRole,
                        desc: 'Mengelola konfigurasi sistem, pengguna, master data, dan pengaturan aplikasi.',
                      },
                      {
                        role: 'Petugas Kesling' as UserRole,
                        desc: 'Mengelola data kegiatan, monitoring, supervisi, dan laporan sesuai kewenangan.',
                      },
                      {
                        role: 'Koordinator Kesling' as UserRole,
                        desc: 'Melakukan monitoring kegiatan, review, dan verifikasi perbaikan temuan.',
                      },
                      {
                        role: 'Pimpinan / Viewer' as UserRole,
                        desc: 'Melihat dashboard, hasil monitoring, grafik, dan laporan yang diizinkan.',
                      },
                    ]
                  ).map((item) => (
                    <tr key={item.role}>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {item.role}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {item.desc}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={currentRole === item.role ? 'Sedang Aktif' : 'Tersedia'}
                          variant={currentRole === item.role ? 'success' : 'neutral'}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setCurrentRole(item.role)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-[#EEF4FF] dark:hover:bg-slate-800"
                        >
                          Gunakan Role Ini
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10.3 Hak Akses (RBAC Matrix & Server Validation Tester) */}
      {routePath === '/pengaturan/hak-akses' && (
        <div className="space-y-6">
          <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Matriks Role-Based Access Control (RBAC)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hak akses divalidasi pada sisi server (API Route / Service Layer), bukan hanya menyembunyikan menu antarmuka.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Uji Server API sebagai:</span>
                <span className="text-xs font-bold text-[#1D7AFC] dark:text-[#60A5FA]">
                  {currentRole}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Izin Aksi / Modul</th>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Petugas Kesling</th>
                    <th className="py-3 px-4">Koordinator Kesling</th>
                    <th className="py-3 px-4">Pimpinan / Viewer</th>
                    <th className="py-3 px-4">Uji Validasi Server</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ALL_ACTIONS.map((row) => (
                    <tr key={row.action}>
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        <div>{row.label}</div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {row.action}
                        </div>
                      </td>
                      {(
                        [
                          'Administrator',
                          'Petugas Kesling',
                          'Koordinator Kesling',
                          'Pimpinan / Viewer',
                        ] as UserRole[]
                      ).map((r) => {
                        const allowed = hasPermission(r, row.action);
                        return (
                          <td key={r} className="py-2.5 px-4">
                            {allowed ? (
                              <span className="inline-flex items-center gap-1 text-[#1D7AFC] dark:text-[#60A5FA] font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Diizinkan</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            testServerAuthorization(currentRole, row.action)
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Tes Endpoint
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {serverAuthResult && (
              <div className="p-3.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs">
                Respons Server (/api/foundation): {serverAuthResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10.4 Preferensi Tampilan */}
      {routePath === '/pengaturan/tampilan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSection
            title="Mode Tema Warna (Light & Dark Mode)"
            description="Pilih tampilan antarmuka yang paling nyaman bagi petugas di dalam ruangan maupun di lapangan."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { mode: 'light' as ThemeMode, label: 'Light Mode', icon: <Sun className="w-4 h-4" /> },
                  { mode: 'dark' as ThemeMode, label: 'Dark Mode', icon: <Moon className="w-4 h-4" /> },
                  { mode: 'system' as ThemeMode, label: 'Ikuti Sistem', icon: <Monitor className="w-4 h-4" /> },
                ]
              ).map((opt) => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setTheme(opt.mode)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                    theme === opt.mode
                      ? 'border-[#153E75] bg-[#EEF4FF]/60 dark:bg-slate-800/50 text-[#153E75] dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {opt.icon}
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection
            title="Aksesibilitas & Kenyamanan Interaksi"
            description="Hormati preferensi gerakan mikro pada perangkat petugas."
          >
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Kurangi Efek Animasi (Reduced Motion)
                </div>
                <div className="text-xs text-slate-500">
                  Meminimalkan transisi halaman untuk penghematan baterai perangkat mobile.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  reducedMotion
                    ? 'bg-[#153E75] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {reducedMotion ? 'Aktif' : 'Standar'}
              </button>
            </div>
          </FormSection>
        </div>
      )}

      {/* 10.5 Pengaturan Aplikasi */}
      {routePath === '/pengaturan/aplikasi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection
              title="Integrasi Cloud Supabase REST v1 (Aktif)"
              description="Seluruh 27 koleksi modul data SIKRESMI kini terhubung penuh ke Supabase Cloud."
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <span className="text-slate-500">REST v1 Endpoint:</span>
                  <span className="font-mono font-semibold text-right truncate max-w-[240px]">
                    {getSupabaseConfig().restUrl}/
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Project Reference:</span>
                  <span className="font-mono font-semibold">
                    {supabaseDiagnostic?.projectRef || 'jgrgwhfgbmmxjgmjotzr'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Mode Penyimpanan:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% Terintegrasi Supabase Cloud (27 Koleksi Modul)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Status Tabel Cloud:</span>
                  <span className="font-mono font-semibold text-[#153E75] dark:text-[#60A5FA]">
                    {supabaseDiagnostic?.tableReady
                      ? 'Tabel sikesling_cloud_store Aktif'
                      : 'Siap Sinkronisasi (27 Koleksi Aktif)'}
                  </span>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={syncingSupabase}
                    onClick={async () => {
                      setSyncingSupabase(true);
                      await syncAllToSupabase();
                      setSyncingSupabase(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#002147] text-[#FAF6F0] text-xs font-semibold hover:bg-[#003166] transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
                    {syncingSupabase ? 'Menyinkronkan...' : 'Sinkronkan 27 Modul ke Supabase'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                        pushToast({
                          type: 'success',
                          title: 'SQL Supabase Disalin',
                          message: 'Script SQL tabel Supabase berhasil disalin ke clipboard.',
                        });
                      } catch {
                        pushToast({
                          type: 'warning',
                          title: 'Gagal Menyalin',
                          message: 'Gagal menyalin SQL ke clipboard.',
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D2B48C]/60 bg-[#FAF6F0] dark:bg-slate-900 text-[#002147] dark:text-slate-200 text-xs font-semibold hover:bg-[#EFE8DC] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Salin SQL Tabel Supabase
                  </button>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Progressive Web App (PWA) & Instalasi Perangkat"
              description="Fondasi instalasi aplikasi pada desktop, tablet, dan smartphone Android/iOS."
            >
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  SIKRESMI dilengkapi Web App Manifest standar agar dapat dipasang ke layar utama perangkat petugas lapangan dan langsung menyinkronkan data ke Supabase Cloud.
                </p>
                <PWAInstallButton />
              </div>
            </FormSection>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              14 Entitas Database Fondasi (prisma/schema.prisma)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FOUNDATION_ENTITIES.map((ent) => (
                <div
                  key={ent.name}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1"
                >
                  <div className="text-xs font-mono font-bold text-[#153E75] dark:text-[#60A5FA]">
                    {String(ent.order).padStart(2, '0')}. {ent.name}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {ent.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10.6 Tentang Aplikasi */}
      {routePath === '/pengaturan/tentang' && (
        <div className="space-y-6">
          <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#1D7AFC] dark:text-[#60A5FA]">
                SISTEM INFORMASI KESEHATAN LINGKUNGAN RSUD AL-MULK KOTA SUKABUMI
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                SIKRESMI — Versi 1.0 (Foundation Development)
              </h2>
              <p className="text-xs text-slate-500">
                Sistem Informasi Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi · Smart Environmental Health Monitoring & Management
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Aplikasi ini dibangun dengan arsitektur berlapis (Presentation Layer, Business Logic Layer, Data Access Layer, dan Database Layer) serta pendekatan <em>Data-Driven Design</em> agar seluruh modul operasional, monitoring, supervisi, tindak lanjut, dan pelaporan dapat dikembangkan secara bertahap sesuai hasil konsultasi bersama petugas Kesehatan Lingkungan.
            </p>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3">
                Status Kesiapan 10 Menu Utama (Tahap 1 — Foundation):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MAIN_NAVIGATION.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {m.number}. {m.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.subItems ? `${m.subItems.length} Submenu` : 'Halaman Utama'}
                      </div>
                    </div>
                    <StatusBadge status={m.status} variant="info" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
