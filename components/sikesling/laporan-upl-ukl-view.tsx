'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  Droplets,
  Radio,
  Wind,
  Flame,
  Bug,
  UtensilsCrossed,
  Shirt,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  Search,
  ExternalLink,
  Info,
  Calendar,
  Check,
  Scale,
  Camera,
  FileCheck2,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import {
  UKL_UPL_PROFILE,
  GEOSPASIAL_POINTS,
  KESLING_EVALUATIONS,
  RKL_MATRIX,
  RPL_MATRIX,
  PHYSICAL_ROOM_MEASUREMENTS,
  WATER_LAB_TEST_PARAMS,
  NERACA_LIMBAH_B3,
  MONTHLY_WASTE_RECAPS,
  FACILITY_CHECKLIST,
  DOCUMENTATION_PHOTOS,
} from '@/lib/ukl-upl-data';

export type UklUplTabKey =
  | 'ringkasan'
  | 'evaluasi-kesling'
  | 'matriks-rkl-rpl'
  | 'neraca-data'
  | 'sarana-checklist'
  | 'dokumentasi-legalitas';

export function LaporanUplUklView() {
  const meta = resolveRouteMeta('/laporan/upl-ukl');

  const [activeTab, setActiveTab] = useState<UklUplTabKey>('ringkasan');
  const [selectedSemester, setSelectedSemester] = useState<string>('semester-1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRklCategory, setSelectedRklCategory] = useState<string>('ALL');

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export JSON summary
  const handleExportJson = () => {
    const dataToExport = {
      profil: UKL_UPL_PROFILE,
      geospasial: GEOSPASIAL_POINTS,
      evaluasiKesling: KESLING_EVALUATIONS,
      rkl: RKL_MATRIX,
      rpl: RPL_MATRIX,
      neracaLimbahB3: NERACA_LIMBAH_B3,
      rekapBulananLimbah: MONTHLY_WASTE_RECAPS,
      ujiLabAir: WATER_LAB_TEST_PARAMS,
      saranaPrasarana: FACILITY_CHECKLIST,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_UKL_UPL_RSUD_Al_Mulk_Semester_1_2026.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered physical rooms
  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return PHYSICAL_ROOM_MEASUREMENTS;
    const q = searchTerm.toLowerCase();
    return PHYSICAL_ROOM_MEASUREMENTS.filter(
      (r) =>
        r.unit.toLowerCase().includes(q) || r.kategori.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  // Total Timbulan Medis Jan-Jun
  const totalTimbulanMedisSemester1 = useMemo(() => {
    return MONTHLY_WASTE_RECAPS.reduce((acc, curr) => acc + curr.totalKg, 0);
  }, []);

  const totalTajamSemester1 = useMemo(() => {
    return MONTHLY_WASTE_RECAPS.reduce(
      (acc, curr) => acc + curr.limbahTajamKg,
      0
    );
  }, []);

  const totalPadatSemester1 = useMemo(() => {
    return MONTHLY_WASTE_RECAPS.reduce(
      (acc, curr) => acc + curr.limbahPadatKg,
      0
    );
  }, []);

  return (
    <PageContainer>
      {/* SCREEN HEADER (Hidden in Print) */}
      <div className="print:hidden">
        <PageHeader
          title="Laporan Pelaksanaan UKL - UPL"
          description="Hasil Pelaksanaan Upaya Pengelolaan Lingkungan dan Upaya Pemantauan Lingkungan Hidup — UOBK RSUD Al-Mulk Kota Sukabumi"
          status={meta.status}
          breadcrumbs={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Laporan', href: '/laporan' },
            { label: 'Laporan UKL-UPL', href: '/laporan/upl-ukl' },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Periode Dropdown */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="appearance-none bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C]/70 rounded-full pl-8 pr-8 py-2 text-xs font-bold text-[#002147] dark:text-[#D2B48C] shadow-2xs hover:bg-[#F3ECE0] dark:hover:bg-[#002147] cursor-pointer transition-colors"
                >
                  <option value="semester-1">
                    Semester I (Januari – Juni 2026)
                  </option>
                  <option value="semester-2">
                    Semester II (Juli – Desember 2026)
                  </option>
                  <option value="tahunan">Tahun 2026 Penuh</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute left-3 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-3 pointer-events-none" />
              </div>

              {/* Tombol Cetak / PDF */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#002147] text-[#D2B48C] hover:bg-[#001835] hover:text-white border border-[#D2B48C]/60 text-xs font-bold shadow-md cursor-pointer transition-all"
                title="Cetak format resmi atau simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Save PDF</span>
              </button>

              {/* Tombol Export JSON */}
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF6F0] dark:bg-[#001835] hover:bg-[#F3ECE0] dark:hover:bg-[#002147] border border-[#D2B48C]/70 text-xs font-bold text-[#002147] dark:text-[#D2B48C] shadow-2xs cursor-pointer transition-all"
                title="Unduh seluruh struktur data laporan UKL-UPL dalam format JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>
            </div>
          }
        />
      </div>

      {/* FORMAL PRINT HEADER (Visible only in print mode) */}
      <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="text-left">
            <h1 className="text-base font-bold uppercase tracking-wider text-black">
              Pemerintah Kota Sukabumi — Dinas Kesehatan
            </h1>
            <h2 className="text-xl font-black uppercase text-black">
              UOBK RSUD AL-MULK KOTA SUKABUMI
            </h2>
            <p className="text-xs text-black">
              Jl. Pelabuhan II KM 6 RT 02 RW 07, Kel. Lembursitu, Kec.
              Lembursitu, Kota Sukabumi, Jawa Barat 43168
            </p>
            <p className="text-xs text-black">
              Telp: (0266)-6243088 | Email: rsudalmulk@gmail.com | NIB:
              1101220030984
            </p>
          </div>
        </div>
        <div className="mt-3 py-1 border-t border-b border-black text-center font-bold text-xs uppercase tracking-wider">
          LAPORAN PELAKSANAAN UPAYA PENGELOLAAN LINGKUNGAN HIDUP DAN UPAYA
          PEMANTAUAN LINGKUNGAN HIDUP (UKL – UPL)
          <br />
          PERIODE: SEMESTER I (JANUARI – JUNI) TAHUN 2026
        </div>
      </div>

      {/* METRIC PILLS / KEPATUHAN LINGKUNGAN (Screen Only) */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">Kelayakan</span>
          </div>
          <div className="text-base font-black text-[#002147] dark:text-white">
            Memenuhi Syarat
          </div>
          <div className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
            Permenkes 7/2019
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">Air Limbah IPAL</span>
          </div>
          <div className="text-base font-black text-blue-700 dark:text-blue-300">
            100% Baku Mutu
          </div>
          <div className="text-2xs text-slate-500 font-medium">
            Permen LHK 68/2016
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">Limbah B3</span>
          </div>
          <div className="text-base font-black text-amber-700 dark:text-amber-300">
            292 kg Terkelola
          </div>
          <div className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
            100% PT Jasa Medivest
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">Timbulan Logbook</span>
          </div>
          <div className="text-base font-black text-indigo-700 dark:text-indigo-300">
            {totalTimbulanMedisSemester1.toLocaleString('id-ID')} kg
          </div>
          <div className="text-2xs text-slate-500 font-medium">
            Januari – Juni (6 Bulan)
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D2B48C]" />
            <span className="font-semibold">Pencahayaan</span>
          </div>
          <div className="text-base font-black text-[#002147] dark:text-white">
            80% Sesuai
          </div>
          <div className="text-2xs text-slate-500 font-medium">
            Peningkatan Lampu LED
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold">Proteksi Kebakaran</span>
          </div>
          <div className="text-base font-black text-rose-700 dark:text-rose-300">
            23 APAR Aktif
          </div>
          <div className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
            3 Hidran & 20 Sprinkler
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (Screen Only) */}
      <div className="print:hidden flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C]/40 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ringkasan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ringkasan'
              ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-[#F2E8D9]/70 dark:hover:bg-[#002147]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>BAB I: Profil & Fasilitas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evaluasi-kesling')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'evaluasi-kesling'
              ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-[#F2E8D9]/70 dark:hover:bg-[#002147]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>BAB II: Evaluasi Kesling (8 Standar)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matriks-rkl-rpl')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'matriks-rkl-rpl'
              ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-[#F2E8D9]/70 dark:hover:bg-[#002147]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>BAB III: Matriks RKL – RPL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('neraca-data')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'neraca-data'
              ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-[#F2E8D9]/70 dark:hover:bg-[#002147]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>BAB IV & Data Lab / Neraca</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sarana-checklist')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sarana-checklist'
              ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-[#F2E8D9]/70 dark:hover:bg-[#002147]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Lampiran: Sarana Bangunan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dokumentasi-legalitas')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dokumentasi-legalitas'
              ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-[#F2E8D9]/70 dark:hover:bg-[#002147]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Dokumentasi & Legalitas</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BAB I - PROFIL RUMAH SAKIT & RINGKASAN USAHA (Print & Screen)      */}
      {/* ========================================================================= */}
      {(activeTab === 'ringkasan' || typeof window === 'undefined') && (
        <div className="space-y-6">
          {/* Card Profil Utama */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2B48C]/30 pb-5 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>BAB I — Identitas Pemrakarsa & Ringkasan Usaha</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#002147] dark:text-white">
                  {UKL_UPL_PROFILE.namaFasilitas}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {UKL_UPL_PROFILE.jenisKegiatan} • NIB:{' '}
                  <span className="font-mono font-bold text-[#002147] dark:text-[#D2B48C]">
                    {UKL_UPL_PROFILE.nib}
                  </span>
                </p>
              </div>

              <div className="text-left sm:text-right bg-[#FAF6F0] dark:bg-[#002147]/60 p-3.5 rounded-2xl border border-[#D2B48C]/40">
                <div className="text-2xs text-slate-500 uppercase tracking-wider font-semibold">
                  Penanggung Jawab UKL-UPL
                </div>
                <div className="text-sm font-bold text-[#002147] dark:text-[#D2B48C]">
                  {UKL_UPL_PROFILE.penanggungJawab}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {UKL_UPL_PROFILE.jabatanPenanggungJawab}
                </div>
                <div className="text-2xs font-mono text-slate-500">
                  NIP. {UKL_UPL_PROFILE.nipPenanggungJawab}
                </div>
              </div>
            </div>

            {/* Grid Informasi Identitas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30">
                <h4 className="font-bold text-[#002147] dark:text-[#D2B48C] text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Identitas Pemrakarsa & Legalitas</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Instansi Induk:</span>
                  <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.namaInstansi}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Kepala Dinas:</span>
                  <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.kepalaDinas}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Alamat Kantor:</span>
                  <span className="col-span-2 text-slate-700 dark:text-slate-300">
                    {UKL_UPL_PROFILE.alamatKantorPusat}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Kontak:</span>
                  <span className="col-span-2 text-slate-700 dark:text-slate-300">
                    {UKL_UPL_PROFILE.noTelepon} / {UKL_UPL_PROFILE.email}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1">
                  <span className="text-slate-500">Izin Lingkungan:</span>
                  <span className="col-span-2 font-medium text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.izinLingkungan}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30">
                <h4 className="font-bold text-[#002147] dark:text-[#D2B48C] text-xs uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Kapasitas Usaha & Skala Lingkungan</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Kapasitas RS:</span>
                  <span className="col-span-2 font-bold text-[#002147] dark:text-white">
                    {UKL_UPL_PROFILE.skalaUsaha.kapasitasTempatTidur} Tempat
                    Tidur • {UKL_UPL_PROFILE.skalaUsaha.jumlahPegawai} Pegawai
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Luas Bangunan:</span>
                  <span className="col-span-2 text-slate-700 dark:text-slate-300">
                    Lahan: {UKL_UPL_PROFILE.skalaUsaha.luasLahan} • Bangunan:{' '}
                    {UKL_UPL_PROFILE.skalaUsaha.luasBangunan}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Pemanfaatan Air:</span>
                  <span className="col-span-2 text-slate-700 dark:text-slate-300">
                    {UKL_UPL_PROFILE.skalaUsaha.airBersihHarian} (Sumur bor 98 m
                    & RO)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Air Limbah IPAL:</span>
                  <span className="col-span-2 font-semibold text-blue-600 dark:text-blue-400">
                    {UKL_UPL_PROFILE.skalaUsaha.airLimbahHarian}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1">
                  <span className="text-slate-500">Limbah B3:</span>
                  <span className="col-span-2 font-semibold text-amber-700 dark:text-amber-400">
                    {UKL_UPL_PROFILE.skalaUsaha.limbahB3Harian}
                  </span>
                </div>
              </div>
            </div>

            {/* Proteksi Kebakaran & Utilitas K3 */}
            <div className="mt-5 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Sistem Proteksi Kebakaran & Sarana Penunjang K3RS (Eksisting)
                </span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-amber-200/50">
                  <div className="text-2xs text-slate-500">APAR</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.proteksiKebakaran.apar}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-amber-200/50">
                  <div className="text-2xs text-slate-500">Pilar Hidran</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.proteksiKebakaran.hidran}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-amber-200/50">
                  <div className="text-2xs text-slate-500">Alarm Kebakaran</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.proteksiKebakaran.alarm}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-amber-200/50">
                  <div className="text-2xs text-slate-500">Sprinkler</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.proteksiKebakaran.sprinkler}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-amber-200/50">
                  <div className="text-2xs text-slate-500">Jalur Evakuasi</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.proteksiKebakaran.jalurEvakuasi}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-amber-200/50">
                  <div className="text-2xs text-slate-500">Titik Kumpul</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {UKL_UPL_PROFILE.proteksiKebakaran.titikKumpul}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Titik Koordinat GPS Fasilitas Utama Lingkungan */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
              <h3 className="text-base font-bold text-[#002147] dark:text-white">
                Titik Koordinat Geospasial Fasilitas Vital Lingkungan (Halaman
                130 Dokumen)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {GEOSPASIAL_POINTS.map((pt) => (
                <div
                  key={pt.id}
                  className="p-4 rounded-2xl bg-[#FAF6F0]/70 dark:bg-[#002147]/40 border border-[#D2B48C]/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xs font-bold text-[#D2B48C] dark:text-[#D2B48C] uppercase tracking-wider mb-1">
                      {pt.status}
                    </div>
                    <h5 className="font-bold text-[#002147] dark:text-white text-xs mb-1">
                      {pt.nama}
                    </h5>
                    <div className="text-2xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                      {pt.kodeIzin}
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#001835] font-mono text-xs font-bold text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-800 mb-2">
                      {pt.koordinatDisplay}
                    </div>
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pt.keterangan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BAB II - PELAKSANAAN & EVALUASI 8 STANDAR KESLING (Permenkes 7/2019) */}
      {/* ========================================================================= */}
      {(activeTab === 'evaluasi-kesling' || typeof window === 'undefined') && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  BAB II — Pelaksanaan dan Evaluasi Berdasarkan Permenkes No. 7
                  Tahun 2019
                </span>
              </div>
              <h3 className="text-xl font-black text-[#002147] dark:text-white">
                Evaluasi 8 Komponen Kesehatan Lingkungan Rumah Sakit (Semester I
                2026)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemeriksaan rutin berkala mencakup parameter air, udara & fisik,
                sarana fisik, limbah B3/cair, vektor, gizi pangan, linen, dan
                radiasi.
              </p>
            </div>

            <div className="space-y-4">
              {KESLING_EVALUATIONS.map((evalItem) => (
                <div
                  key={evalItem.no}
                  className="p-5 rounded-2xl bg-[#FAF6F0]/50 dark:bg-[#002147]/30 border border-[#D2B48C]/40 hover:border-[#D2B48C] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D2B48C]/20 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-xs shrink-0">
                        {evalItem.no}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#002147] dark:text-white">
                          {evalItem.variabel}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {evalItem.kegiatan} • Periode: {evalItem.periode}
                        </p>
                      </div>
                    </div>

                    <div>
                      {evalItem.statusBakuMutu === 'MEMENUHI' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-2xs font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Memenuhi Syarat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-2xs font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Sebagian / Dalam Tindak Lanjut
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Temuan Hasil */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-600" />
                        <span>Hasil Pemantauan Lapangan:</span>
                      </div>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                        {evalItem.hasil.map((h, i) => (
                          <li key={i} className="leading-relaxed">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evaluasi & Tindak Lanjut */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Evaluasi & Upaya Perbaikan:</span>
                      </div>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                        {evalItem.evaluasi.map((ev, i) => (
                          <li key={i} className="leading-relaxed">
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BAB III - MATRIKS RKL & RPL (9 ASPEK DAMPAK LINGKUNGAN)             */}
      {/* ========================================================================= */}
      {(activeTab === 'matriks-rkl-rpl' || typeof window === 'undefined') && (
        <div className="space-y-6">
          {/* Sub-tab 3.1: Upaya Pengelolaan Lingkungan (RKL) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    Subbab 3.1 — Upaya Pengelolaan Lingkungan Hidup (RKL)
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#002147] dark:text-white">
                  Matriks Pengelolaan 9 Sumber Dampak Lingkungan
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-[#D2B48C] uppercase tracking-wider text-2xs font-bold">
                    <th className="p-3 rounded-tl-xl w-10 text-center">No</th>
                    <th className="p-3 w-44">Jenis Dampak</th>
                    <th className="p-3 w-56">Sumber Dampak</th>
                    <th className="p-3 w-48">Besaran Dampak</th>
                    <th className="p-3 w-64">Metode & Bentuk Pengelolaan</th>
                    <th className="p-3 w-36">Lokasi</th>
                    <th className="p-3 rounded-tr-xl w-36">Unit Pelaksana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/30 text-slate-700 dark:text-slate-300">
                  {RKL_MATRIX.map((rkl) => (
                    <tr
                      key={rkl.no}
                      className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#002147]/50 transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-[#002147] dark:text-[#D2B48C]">
                        {rkl.no}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {rkl.jenisDampak}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rkl.sumberDampak}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-200">
                        {rkl.besaranDampak}
                      </td>
                      <td className="p-3 leading-relaxed">
                        <div className="font-semibold text-[#002147] dark:text-[#D2B48C] mb-1">
                          {rkl.bentukUpaya}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {rkl.metodePengelolaan}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {rkl.lokasi}
                      </td>
                      <td className="p-3 text-2xs font-semibold text-slate-600 dark:text-slate-400">
                        {rkl.unitPelaksana}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-tab 3.2: Upaya Pemantauan Lingkungan Hidup (RPL) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Subbab 3.2 — Pelaksanaan Pemantauan Lingkungan (RPL)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#002147] dark:text-white">
                Matriks Pemantauan, Hasil Analisa, Evaluasi, dan Rencana Tindak
                Lanjut
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-[#D2B48C] uppercase tracking-wider text-2xs font-bold">
                    <th className="p-3 rounded-tl-xl w-10 text-center">No</th>
                    <th className="p-3 w-40">Jenis Dampak</th>
                    <th className="p-3 w-44">Parameter Kunci</th>
                    <th className="p-3 w-48">Tolok Ukur / Baku Mutu</th>
                    <th className="p-3 w-44">Metode Pemantauan</th>
                    <th className="p-3 w-48">Hasil Analisa Lapangan</th>
                    <th className="p-3 w-48">Evaluasi & Hambatan</th>
                    <th className="p-3 w-48">Tindak Lanjut Perbaikan</th>
                    <th className="p-3 rounded-tr-xl w-24 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/30 text-slate-700 dark:text-slate-300">
                  {RPL_MATRIX.map((rpl) => (
                    <tr
                      key={rpl.no}
                      className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#002147]/50 transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-[#002147] dark:text-[#D2B48C]">
                        {rpl.no}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {rpl.jenisDampak}
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                        {rpl.parameterKunci}
                      </td>
                      <td className="p-3 text-2xs font-mono text-slate-600 dark:text-slate-400">
                        {rpl.tolokUkur}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rpl.metodeSaatIni}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {rpl.hasilAnalisis}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rpl.evaluasi}
                      </td>
                      <td className="p-3 text-[#002147] dark:text-[#D2B48C] font-medium leading-relaxed">
                        {rpl.tindakLanjut}
                      </td>
                      <td className="p-3 text-center">
                        {rpl.statusKepatuhan === 'MEMENUHI' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-2xs font-bold">
                            MS
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-2xs font-bold">
                            Proses
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BAB IV KESIMPULAN & NERACA LIMBAH / DATA LAB (Lampiran 1, 2, 3)     */}
      {/* ========================================================================= */}
      {(activeTab === 'neraca-data' || typeof window === 'undefined') && (
        <div className="space-y-6">
          {/* Card Kesimpulan Resmi BAB IV */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>BAB IV — Kesimpulan dan Penutup Resmi</span>
              </div>
              <h3 className="text-xl font-black text-[#002147] dark:text-white">
                Kesimpulan Pelaksanaan UKL-UPL Semester I Tahun 2026
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-2xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-[#002147] dark:text-white">
                    Kualitas Air Bersih:
                  </strong>{' '}
                  Hasil sampel air artesis pada bulan April masih ada yang belum
                  memenuhi syarat baku mutu (terdapat total coliform dan air
                  keruh). Rencana perbaikan telah diajukan sistem filtrasi air
                  bersih terpadu (UV, pasir, karbon aktif) yang sudah masuk ke
                  dalam perencanaan tahun 2026.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-2xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-[#002147] dark:text-white">
                    Kesehatan Udara & Kebisingan:
                  </strong>{' '}
                  Pengukuran pencahayaan di beberapa ruangan masih kurang terang
                  dan berproses ditingkatkan dengan lampu LED berdaya tinggi.
                  Tingkat kebisingan poli mencapai 64 dBA (baku mutu 55 dBA)
                  karena posisi di tepi jalan raya provinsi; diselesaikan dengan
                  penutupan pintu depan secara konsisten, sosialisasi suara
                  rendah, dan penanaman pohon peredam.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-2xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#002147] dark:text-white">
                    Kualitas Air Limbah IPAL:
                  </strong>{' '}
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    100% parameter memenuhi syarat Baku Mutu Lingkungan
                  </span>{' '}
                  (Permen LHK No. 68 Tahun 2016). Air olahan IPAL telah berhasil
                  diolah kembali untuk menyiram tanaman ruang terbuka hijau,
                  mencuci mobil operasional, dan persiapan *flushing toilet*.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-2xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-[#002147] dark:text-white">
                    Kualitas Pengelolaan Limbah:
                  </strong>{' '}
                  Pengangkutan limbah medis rutin 3 hari sekali bekerja sama
                  dengan PT Jasa Medivest berjalan sangat efektif. Sampah organik
                  domestik diolah menjadi kompos, sampah plastik botol dipilah,
                  dan sampah residu diangkut berkala oleh dinas kebersihan ke
                  TPA.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/30 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-2xs shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <strong className="text-[#002147] dark:text-white">
                    Sanitasi Pangan, Linen, dan Radiasi:
                  </strong>{' '}
                  Pengelolaan makanan dapur gizi dan pencucian linen pihak ketiga
                  terpantau rutin setiap bulan memenuhi syarat. Proteksi radiasi
                  terpantau aman dengan kalibrasi rutin.
                </div>
              </div>
            </div>

            {/* Kolom Tanda Tangan Resmi Dokumen */}
            <div className="mt-8 pt-6 border-t border-[#D2B48C]/40 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs">
              <div className="text-slate-500 text-center sm:text-left">
                <div>Dokumen Sah Dilaporkan Secara Berkala Kepada:</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Dinas Lingkungan Hidup (DLH) Kota Sukabumi
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-slate-600 dark:text-slate-400">
                  Sukabumi, 10 Juli 2026
                </div>
                <div className="font-bold text-[#002147] dark:text-white mt-1">
                  Direktur UOBK RSUD AL-MULK Kota Sukabumi
                </div>
                <div className="h-16 flex items-center justify-center sm:justify-end">
                  <div className="px-3 py-1 rounded-lg border border-dashed border-[#D2B48C] text-2xs text-[#D2B48C] font-mono">
                    [Tanda Tangan & Cap Resmi]
                  </div>
                </div>
                <div className="font-bold text-[#002147] dark:text-[#D2B48C] underline">
                  {UKL_UPL_PROFILE.penanggungJawab}
                </div>
                <div className="text-2xs font-mono text-slate-500">
                  NIP. {UKL_UPL_PROFILE.nipPenanggungJawab}
                </div>
              </div>
            </div>
          </div>

          {/* Lampiran 3: Neraca Limbah B3 Semester I (Hal 64-65) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                  <Scale className="w-3.5 h-3.5" />
                  <span>
                    Lampiran 3 — Neraca Bahan Berbahaya & Beracun (B3)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#002147] dark:text-white">
                  Neraca Limbah B3 Periode 01 Januari s/d 30 Juni 2026
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                  Kinerja Pengelolaan: 100%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-[#D2B48C] uppercase tracking-wider text-2xs font-bold">
                    <th className="p-3 rounded-tl-xl w-12 text-center">No</th>
                    <th className="p-3">Jenis Limbah B3</th>
                    <th className="p-3 w-32">Kode Limbah</th>
                    <th className="p-3 w-28 text-right">Jumlah (Kg)</th>
                    <th className="p-3">Bentuk Perlakuan</th>
                    <th className="p-3">Transporter & Pengolah</th>
                    <th className="p-3 rounded-tr-xl">Status Perizinan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/30 text-slate-700 dark:text-slate-300">
                  {NERACA_LIMBAH_B3.map((b3) => (
                    <tr
                      key={b3.no}
                      className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#002147]/50"
                    >
                      <td className="p-3 text-center font-bold text-[#002147] dark:text-[#D2B48C]">
                        {b3.no}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {b3.jenisLimbah}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {b3.kodeLimbah}
                      </td>
                      <td className="p-3 text-right font-black text-amber-700 dark:text-amber-400">
                        {b3.jumlahKg} kg
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {b3.perlakuan}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {b3.pengolah}
                      </td>
                      <td className="p-3 text-2xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {b3.statusIzin}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#FAF6F0] dark:bg-[#002147] font-black text-xs">
                    <td colSpan={3} className="p-3 text-right uppercase">
                      Total Limbah B3 Semester I (Neraca Resmi):
                    </td>
                    <td className="p-3 text-right text-[#002147] dark:text-[#D2B48C] text-sm">
                      292 kg
                    </td>
                    <td
                      colSpan={3}
                      className="p-3 text-emerald-700 dark:text-emerald-300"
                    >
                      Diserahkan ke Pihak III (100% Berizin KLHK)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rekapitulasi Timbulan Log Book Limbah Medis Jan-Jun 2026 (Hal 66-102) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    Rekapitulasi Timbulan Log Book Limbah Medis Jan – Jun 2026
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#002147] dark:text-white">
                  Akumulasi Harian 11 Ruangan per Bulan Pengangkutan
                </h4>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">
                  Total Timbulan 6 Bulan:
                </div>
                <div className="text-lg font-black text-[#002147] dark:text-[#D2B48C]">
                  {totalTimbulanMedisSemester1.toLocaleString('id-ID')} kg
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-[#D2B48C] uppercase tracking-wider text-2xs font-bold">
                    <th className="p-3 rounded-tl-xl w-12 text-center">Bulan</th>
                    <th className="p-3">Periode</th>
                    <th className="p-3 text-right">Limbah Tajam (kg)</th>
                    <th className="p-3 text-right">Limbah Padat (kg)</th>
                    <th className="p-3 text-right">Total Timbulan (kg)</th>
                    <th className="p-3 text-center">Frekuensi Batch</th>
                    <th className="p-3 rounded-tr-xl">
                      Contoh Nomor Manifest
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/30 text-slate-700 dark:text-slate-300">
                  {MONTHLY_WASTE_RECAPS.map((rec) => (
                    <tr
                      key={rec.bulanAngka}
                      className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#002147]/50"
                    >
                      <td className="p-3 text-center font-bold text-[#002147] dark:text-[#D2B48C]">
                        {rec.bulanAngka}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {rec.bulan}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {rec.limbahTajamKg.toFixed(2)} kg
                      </td>
                      <td className="p-3 text-right font-medium">
                        {rec.limbahPadatKg.toFixed(2)} kg
                      </td>
                      <td className="p-3 text-right font-black text-indigo-700 dark:text-indigo-300">
                        {rec.totalKg.toFixed(2)} kg
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-2xs font-bold">
                          {rec.manifestCount} Pengangkutan
                        </span>
                      </td>
                      <td className="p-3 font-mono text-2xs text-slate-500 dark:text-slate-400">
                        {rec.primaryManifest}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#FAF6F0] dark:bg-[#002147] font-black text-xs">
                    <td colSpan={2} className="p-3 text-right uppercase">
                      Total Akumulasi Semester I:
                    </td>
                    <td className="p-3 text-right text-amber-700 dark:text-amber-400">
                      {totalTajamSemester1.toFixed(2)} kg
                    </td>
                    <td className="p-3 text-right text-blue-700 dark:text-blue-400">
                      {totalPadatSemester1.toFixed(2)} kg
                    </td>
                    <td className="p-3 text-right text-[#002147] dark:text-[#D2B48C] text-sm">
                      {totalTimbulanMedisSemester1.toFixed(2)} kg
                    </td>
                    <td
                      colSpan={2}
                      className="p-3 text-center text-slate-500 font-normal text-2xs"
                    >
                      Tercatat lengkap pada tabel logbook 130 halaman
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Lampiran 2: Hasil Uji Laboratorium Air Bersih (Hal 59-63) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>
                  Lampiran 2 — Hasil Pengujian Laboratorium Air Bersih (Jan – Jun
                  2026)
                </span>
              </div>
              <h4 className="text-lg font-bold text-[#002147] dark:text-white">
                Perbandingan Baku Mutu Air Sumur Artesis vs Sistem RO (Poli Gigi,
                Lab, CSSD)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-[#D2B48C] uppercase tracking-wider text-2xs font-bold">
                    <th className="p-3 rounded-tl-xl">Parameter Uji</th>
                    <th className="p-3 w-28">Baku Mutu</th>
                    <th className="p-3 w-24">Satuan</th>
                    <th className="p-3 w-32">Sumur Artesis</th>
                    <th className="p-3 w-28">RO Poli Gigi</th>
                    <th className="p-3 w-32">RO Laboratorium</th>
                    <th className="p-3 w-28">RO CSSD</th>
                    <th className="p-3 rounded-tr-xl">Status / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/30 text-slate-700 dark:text-slate-300">
                  {WATER_LAB_TEST_PARAMS.map((w, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#002147]/50"
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {w.parameter}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {w.bakuMutu}
                      </td>
                      <td className="p-3 text-slate-500">{w.satuan}</td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {w.artesis}
                      </td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-semibold">
                        {w.roPoliGigi}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">
                        {w.roLaboratorium}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">
                        {w.roCssd}
                      </td>
                      <td className="p-3 text-2xs text-slate-600 dark:text-slate-400">
                        {w.keterangan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lampiran 1: Pengukuran Fisik Udara, Suhu, Lux & Kebisingan (Hal 53-58) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                  <Wind className="w-3.5 h-3.5" />
                  <span>
                    Lampiran 1 — Laporan Pengukuran Fisik Udara & Ruangan (Juni
                    2026)
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#002147] dark:text-white">
                  Suhu, Kelembaban, Intensitas Pencahayaan, dan Kebisingan
                </h4>
              </div>

              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama ruangan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-full text-xs bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C]/60 text-slate-800 dark:text-slate-200 focus:outline-hidden w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-[#D2B48C] uppercase tracking-wider text-2xs font-bold">
                    <th className="p-3 rounded-tl-xl w-10 text-center">No</th>
                    <th className="p-3 w-28">Kategori</th>
                    <th className="p-3 w-56">Nama Ruangan / Unit</th>
                    <th className="p-3 w-28 text-right">Suhu (°C)</th>
                    <th className="p-3 w-32 text-right">Kelembaban (%RH)</th>
                    <th className="p-3 w-32 text-right">Pencahayaan (Lux)</th>
                    <th className="p-3 rounded-tr-xl w-32 text-right">
                      Kebisingan (dB)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/30 text-slate-700 dark:text-slate-300">
                  {filteredRooms.map((rm) => (
                    <tr
                      key={rm.no}
                      className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#002147]/50"
                    >
                      <td className="p-3 text-center font-bold text-[#002147] dark:text-[#D2B48C]">
                        {rm.no}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-2xs font-semibold">
                          {rm.kategori}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {rm.unit}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {rm.suhuDisplay}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {rm.kelembabanDisplay}
                      </td>
                      <td className="p-3 text-right font-mono">
                        <span
                          className={
                            rm.luxScore === 1
                              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {rm.luxDisplay}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <span
                          className={
                            rm.kebisinganScore === 1
                              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {rm.kebisinganDisplay}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LAMPIRAN SARANA BANGUNAN (Lampiran 4 - Hal 103-105)                 */}
      {/* ========================================================================= */}
      {(activeTab === 'sarana-checklist' ||
        typeof window === 'undefined') && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Lampiran 4 — Hasil Sarana & Prasarana Fisik Bangunan
                </span>
              </div>
              <h3 className="text-xl font-black text-[#002147] dark:text-white">
                Checklist Fasilitas Toilet, Lantai Konus, Atap, Plafon, dan Pintu
                RS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              {FACILITY_CHECKLIST.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/40"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-[#002147] dark:text-[#D2B48C] uppercase tracking-wider text-2xs">
                      {item.kategori}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-2xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Memenuhi Syarat
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    {item.indikator}
                  </h5>
                  <p className="text-slate-500 dark:text-slate-400 text-2xs mb-2">
                    Standar: {item.standarRegulasi}
                  </p>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs">
                    {item.keterangan}
                  </div>
                </div>
              ))}
            </div>

            {/* Rincian Toilet RSUD Al-Mulk (Hal 103) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#002147]/30 border border-slate-200 dark:border-slate-800 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Sebaran Titik Toilet & Fasilitas Sanitasi RSUD Al-Mulk (Hasil
                  Survei Juni 2026)
                </span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                  <div className="text-2xs text-slate-500">Toilet IGD</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    5 Unit (1 L, 4 P) + Disabilitas
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                  <div className="text-2xs text-slate-500">
                    Toilet Rawat Jalan (Rajal)
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    6 Unit (1 L, 1 P, 4 Umum) + Disabilitas
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                  <div className="text-2xs text-slate-500">
                    Kamar Mandi Ranap
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    32 Kamar (14 Standar Aksesibel)
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                  <div className="text-2xs text-slate-500">
                    Toilet Khodijah/Fatimah/Aisyah
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    14 Unit Tersebar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DOKUMENTASI FOTO & LEGALITAS (Lampiran 5 & Legalitas)              */}
      {/* ========================================================================= */}
      {(activeTab === 'dokumentasi-legalitas' ||
        typeof window === 'undefined') && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-md">
            <div className="border-b border-[#D2B48C]/30 pb-4 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-xs font-bold mb-1">
                <Camera className="w-3.5 h-3.5" />
                <span>
                  Lampiran 5 — Arsip Foto Dokumentasi Kegiatan Sanitasi Lingkungan
                </span>
              </div>
              <h3 className="text-xl font-black text-[#002147] dark:text-white">
                Dokumentasi Resmi 18 Modul Kegiatan Lapangan (Semester I 2026)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seluruh dokumentasi kegiatan pengambilan sampel air, IPAL,
                pengangkutan limbah B3, survei vektor, dan pengukuran parameter
                kesehatan lingkungan terarsip lengkap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOCUMENTATION_PHOTOS.map((foto) => (
                <div
                  key={foto.id}
                  className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#002147]/40 border border-[#D2B48C]/40 flex flex-col justify-between hover:border-[#D2B48C] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-2xs mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#002147] text-[#D2B48C] font-bold">
                        {foto.modul}
                      </span>
                      <span className="font-mono text-slate-500">
                        Hal. {foto.halamanPdf} Dokumen
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                      {foto.judul}
                    </h5>

                    <p className="text-2xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {foto.deskripsi}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#D2B48C]" />
                      {foto.lokasi}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Berkas Legalitas Rekomendasi DLH & DPMPTSP */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-[#FAF6F0] to-white dark:from-[#002147] dark:to-[#001835] border border-[#D2B48C]/50">
              <h4 className="font-bold text-[#002147] dark:text-[#D2B48C] text-sm mb-2 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#D2B48C]" />
                <span>Arsip Dokumen Legalitas & Perizinan Terkait:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    1. Izin Lingkungan (DPMPTSP Kota Sukabumi)
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    Nomor: 503/SK.29/DPMPTSP/2018 (Ditetapkan 13 September 2018)
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-400 mt-1">
                    Keputusan Kepala Dinas Penanaman Modal & PTSP tentang Izin
                    Lingkungan UPT RSUD Al-Mulk di Jl. Pelabuhan II KM 6
                    Lembursitu.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    2. Berita Acara Rincian Teknis TPS LB3 (DLH Kota Sukabumi)
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    Nomor: BA: 11/DLHRINTEKLB3/2023 (Ditetapkan 01 Desember
                    2023)
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-400 mt-1">
                    Verifikasi persyaratan teknis fasilitas TPS Limbah B3 beratap
                    beton 6,75 m² kapasitas 250 kg/hari dengan PT Jasa Medivest.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FOOTER LINK TO KESLING REPORTS (Screen Only) */}
      <div className="print:hidden mt-8 pt-6 border-t border-[#D2B48C]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="text-slate-500">
          Dokumen UKL-UPL resmi ini terhubung dengan modul monitoring lingkungan
          & supervisi digital SIKRESMI.
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/laporan/kesling"
            className="inline-flex items-center gap-2 font-bold text-[#002147] dark:text-[#D2B48C] hover:underline"
          >
            <span>Buka Laporan Tahunan / Bulanan Kesling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
