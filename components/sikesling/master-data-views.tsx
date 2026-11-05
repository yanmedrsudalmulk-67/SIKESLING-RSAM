'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Building,
  Database,
  Plus,
  Sliders,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Bath,
  Sparkles,
  Building2,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  FormSection,
  TextField,
  EmptyState,
  StatusBadge,
  ModulePlaceholder,
} from '@/components/sikesling/ui-system';

export function MasterDataView({ routePath }: { routePath: string }) {
  const meta = resolveRouteMeta(routePath);
  const {
    masterRooms,
    addMasterRoom,
    toggleMasterRoomStatus,
    masterOfficers,
    addMasterOfficer,
    masterActivityCategories,
    addMasterActivityCategory,
    masterStandards,
    addMasterStandard,
  } = useApp();

  // Room form state
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [building, setBuilding] = useState('');
  const [toiletUmumL, setToiletUmumL] = useState('0');
  const [toiletUmumP, setToiletUmumP] = useState('0');
  const [toiletKaryawanL, setToiletKaryawanL] = useState('0');
  const [toiletKaryawanP, setToiletKaryawanP] = useState('0');
  const [wastafel, setWastafel] = useState('0');
  const [keteranganFisik, setKeteranganFisik] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Search & filter state
  const [roomSearch, setRoomSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState<'ALL' | 'DEFECT' | 'GOOD'>('ALL');

  // Officer form state
  const [officerName, setOfficerName] = useState('');
  const [officerNip, setOfficerNip] = useState('');
  const [officerPos, setOfficerPos] = useState('Sanitarian Pelaksana');

  // Category form state
  const [catCode, setCatCode] = useState('');
  const [catName, setCatName] = useState('');

  // Standard form state (Section 7 Menu 9.7: Nama standar, Sumber regulasi, Nomor regulasi, Tanggal berlaku, Versi, Status aktif)
  const [stdName, setStdName] = useState('');
  const [stdSource, setStdSource] = useState('');
  const [stdNumber, setStdNumber] = useState('');
  const [stdDate, setStdDate] = useState('2026-01-01');
  const [stdVersion, setStdVersion] = useState('1.0');

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      {/* 9.0 Master Data Overview */}
      {routePath === '/master-data' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resolveRouteMeta('/master-data').parentMenu?.subItems?.map((sub, i) => (
            <Link
              key={sub.id}
              href={sub.href}
              className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 hover:border-[#1D7AFC]/60 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-[#153E75] dark:text-[#60A5FA]">
                  9.{i + 1} · {sub.status}
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {sub.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sub.description}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1D7AFC] dark:text-[#60A5FA]">
                Kelola Data Master →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* 9.1 Data Unit dan Ruangan */}
      {routePath === '/master-data/ruangan' && (() => {
        const hasDefect = (keterangan?: string) => {
          if (!keterangan) return false;
          const lower = keterangan.toLowerCase().trim();
          if (lower === '' || lower === '-' || lower === 'baik' || lower === 'aman') return false;
          return (
            lower.includes('bocor') ||
            lower.includes('rusak') ||
            lower.includes('kecil') ||
            lower.includes('tidak') ||
            lower.includes('dibongkar') ||
            lower.includes('lepas') ||
            lower.includes('rembes') ||
            lower.includes('pudar') ||
            lower.includes('kurang') ||
            lower.includes('mati') ||
            lower.includes('sobek') ||
            lower.includes('mengalir') ||
            lower.includes('disabilitas')
          );
        };

        const totalRuangan = masterRooms.length;
        const totalToiletUmumL = masterRooms.reduce((acc, r) => acc + (r.toiletUmumL || 0), 0);
        const totalToiletUmumP = masterRooms.reduce((acc, r) => acc + (r.toiletUmumP || 0), 0);
        const totalToiletUmum = totalToiletUmumL + totalToiletUmumP;

        const totalToiletKaryawanL = masterRooms.reduce((acc, r) => acc + (r.toiletKaryawanL || 0), 0);
        const totalToiletKaryawanP = masterRooms.reduce((acc, r) => acc + (r.toiletKaryawanP || 0), 0);
        const totalToiletKaryawan = totalToiletKaryawanL + totalToiletKaryawanP;

        const totalWastafel = masterRooms.reduce((acc, r) => acc + (r.wastafel || 0), 0);
        const roomsWithDefects = masterRooms.filter((r) => hasDefect(r.keteranganFisik));
        const totalRuanganDefect = roomsWithDefects.length;

        const unitList = Array.from(new Set(masterRooms.map((r) => r.unitName).filter(Boolean))).sort();

        const filteredRooms = masterRooms.filter((r) => {
          const query = roomSearch.toLowerCase();
          const matchSearch =
            roomSearch === '' ||
            r.name.toLowerCase().includes(query) ||
            r.code.toLowerCase().includes(query) ||
            (r.unitName && r.unitName.toLowerCase().includes(query)) ||
            (r.building && r.building.toLowerCase().includes(query)) ||
            (r.keteranganFisik && r.keteranganFisik.toLowerCase().includes(query));

          const matchUnit = unitFilter === 'ALL' || r.unitName === unitFilter;

          const isDefective = hasDefect(r.keteranganFisik);
          const matchCondition =
            conditionFilter === 'ALL' ||
            (conditionFilter === 'DEFECT' && isDefective) ||
            (conditionFilter === 'GOOD' && !isDefective);

          return matchSearch && matchUnit && matchCondition;
        });

        return (
          <div className="space-y-6">
            {/* Executive Sanitation Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="rounded-[22px] bg-gradient-to-br from-white/80 via-white/60 to-white/70 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.05] backdrop-blur-xl border border-white/80 dark:border-white/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Total Ruangan</span>
                  <Building2 className="w-4 h-4 text-[#1D7AFC]" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totalRuangan}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  {masterRooms.filter((r) => r.isActive).length} Unit Aktif Beroperasi
                </div>
              </div>

              <div className="rounded-[22px] bg-gradient-to-br from-white/80 via-white/60 to-white/70 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.05] backdrop-blur-xl border border-white/80 dark:border-white/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Toilet Umum</span>
                  <Bath className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totalToiletUmum}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  L: {totalToiletUmumL} · P: {totalToiletUmumP} bilik
                </div>
              </div>

              <div className="rounded-[22px] bg-gradient-to-br from-white/80 via-white/60 to-white/70 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.05] backdrop-blur-xl border border-white/80 dark:border-white/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Toilet Staf</span>
                  <Bath className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totalToiletKaryawan}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  L: {totalToiletKaryawanL} · P: {totalToiletKaryawanP} bilik
                </div>
              </div>

              <div className="rounded-[22px] bg-gradient-to-br from-white/80 via-white/60 to-white/70 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.05] backdrop-blur-xl border border-white/80 dark:border-white/10 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Wastafel CTPS</span>
                  <Droplets className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totalWastafel}
                </div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
                  Sarana Cuci Tangan
                </div>
              </div>

              <div className="rounded-[22px] bg-gradient-to-br from-rose-50/80 via-white/70 to-amber-50/60 dark:from-rose-950/20 dark:via-slate-900 dark:to-amber-950/20 backdrop-blur-xl border border-rose-200/60 dark:border-rose-900/40 p-4 shadow-sm">
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Perlu Perbaikan</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {totalRuanganDefect}
                </div>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                  Catatan Temuan Inspeksi
                </div>
              </div>
            </div>

            {/* Form Toggle & Toolbar */}
            <div className="rounded-[28px] bg-gradient-to-br from-white/70 via-white/50 to-white/60 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.06] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari nama ruangan, kode, unit instalasi, atau temuan fisik..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1D7AFC]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    aria-label="Filter Instalasi atau Unit"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D7AFC]"
                  >
                    <option value="ALL">Semua Unit ({unitList.length})</option>
                    {unitList.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>

                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value as any)}
                    aria-label="Filter Kondisi Sanitasi"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D7AFC]"
                  >
                    <option value="ALL">Semua Kondisi</option>
                    <option value="DEFECT">⚠️ Perlu Atensi ({totalRuanganDefect})</option>
                    <option value="GOOD">✅ Kondisi Baik ({totalRuangan - totalRuanganDefect})</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#153E75] text-white hover:bg-[#10315E] transition-colors shrink-0 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Tutup Form Tambah' : 'Tambah Ruangan Baru'}</span>
              </button>
            </div>

            {/* Collapsible Add Room Form */}
            {showAddForm && (
              <div className="rounded-[28px] bg-gradient-to-br from-white/80 via-white/60 to-white/70 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.06] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 p-6 shadow-md">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Formulir Pendaftaran Unit & Ruangan Baru
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Data master ruangan langsung disinkronkan ke Supabase Cloud dan tersedia pada seluruh form supervisi & operasional.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!roomName.trim() || !unitName.trim()) return;
                    addMasterRoom({
                      code: roomCode.trim() || `R-${Date.now().toString().slice(-3)}`,
                      name: roomName.trim(),
                      unitName: unitName.trim(),
                      building: building.trim() || 'Gedung Utama',
                      isActive: true,
                      toiletUmumL: parseInt(toiletUmumL, 10) || 0,
                      toiletUmumP: parseInt(toiletUmumP, 10) || 0,
                      toiletKaryawanL: parseInt(toiletKaryawanL, 10) || 0,
                      toiletKaryawanP: parseInt(toiletKaryawanP, 10) || 0,
                      wastafel: parseInt(wastafel, 10) || 0,
                      keteranganFisik: keteranganFisik.trim() || undefined,
                    });
                    setRoomCode('');
                    setRoomName('');
                    setUnitName('');
                    setBuilding('');
                    setToiletUmumL('0');
                    setToiletUmumP('0');
                    setToiletKaryawanL('0');
                    setToiletKaryawanP('0');
                    setWastafel('0');
                    setKeteranganFisik('');
                    setShowAddForm(false);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <TextField
                      label="Kode Ruangan"
                      name="roomCode"
                      value={roomCode}
                      onChange={setRoomCode}
                      placeholder="Misal: R-75"
                    />
                    <TextField
                      label="Nama Ruangan"
                      name="roomName"
                      value={roomName}
                      onChange={setRoomName}
                      required
                      placeholder="Misal: Ruang Isolasi TB"
                    />
                    <TextField
                      label="Nama Unit / Instalasi"
                      name="unitName"
                      value={unitName}
                      onChange={setUnitName}
                      required
                      placeholder="Misal: Instalasi Rawat Inap"
                    />
                    <TextField
                      label="Gedung / Lantai"
                      name="building"
                      value={building}
                      onChange={setBuilding}
                      placeholder="Misal: Gedung Rawat Inap Lt. 2"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <TextField
                      label="Toilet Umum (L)"
                      name="toiletUmumL"
                      type="number"
                      value={toiletUmumL}
                      onChange={setToiletUmumL}
                      placeholder="0"
                    />
                    <TextField
                      label="Toilet Umum (P)"
                      name="toiletUmumP"
                      type="number"
                      value={toiletUmumP}
                      onChange={setToiletUmumP}
                      placeholder="0"
                    />
                    <TextField
                      label="Toilet Staf (L)"
                      name="toiletKaryawanL"
                      type="number"
                      value={toiletKaryawanL}
                      onChange={setToiletKaryawanL}
                      placeholder="0"
                    />
                    <TextField
                      label="Toilet Staf (P)"
                      name="toiletKaryawanP"
                      type="number"
                      value={toiletKaryawanP}
                      onChange={setToiletKaryawanP}
                      placeholder="0"
                    />
                    <TextField
                      label="Wastafel"
                      name="wastafel"
                      type="number"
                      value={wastafel}
                      onChange={setWastafel}
                      placeholder="0"
                    />
                    <TextField
                      label="Kondisi Fisik"
                      name="keteranganFisik"
                      value={keteranganFisik}
                      onChange={setKeteranganFisik}
                      placeholder="Baik / Kran bocor / dll."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#153E75] text-white hover:bg-[#10315E]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan Ruangan Baru</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Master Rooms Table */}
            <div className="rounded-[28px] bg-gradient-to-br from-white/70 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Daftar Master Unit & Ruangan RSUD Al-Mulk</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1D7AFC]/10 text-[#1D7AFC] font-mono font-bold">
                    {filteredRooms.length} dari {masterRooms.length}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Tersinkronisasi Realtime ke Supabase Cloud
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5 w-16 text-center">Kode</th>
                      <th className="py-3 px-4 min-w-[240px]">Ruangan & Instalasi</th>
                      <th className="py-3 px-3 text-center w-28">Toilet Umum</th>
                      <th className="py-3 px-3 text-center w-28">Toilet Staf</th>
                      <th className="py-3 px-3 text-center w-24">Wastafel</th>
                      <th className="py-3 px-4 min-w-[240px]">Kondisi Fisik / Catatan Sanitasi</th>
                      <th className="py-3 px-3 text-center w-24">Status</th>
                      <th className="py-3 px-3 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredRooms.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Tidak ada data ruangan yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRooms.map((r) => {
                        const isDefective = hasDefect(r.keteranganFisik);
                        return (
                          <tr
                            key={r.id}
                            className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                              isDefective ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                            }`}
                          >
                            <td className="py-3 px-3.5 text-center font-mono font-bold text-[#153E75] dark:text-[#60A5FA]">
                              {r.code}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {r.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-medium text-slate-600 dark:text-slate-400">{r.unitName}</span>
                                <span>·</span>
                                <span>{r.building}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {(r.toiletUmumL || 0) + (r.toiletUmumP || 0) > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
                                  L: {r.toiletUmumL || 0} · P: {r.toiletUmumP || 0}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-mono">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {(r.toiletKaryawanL || 0) + (r.toiletKaryawanP || 0) > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                                  L: {r.toiletKaryawanL || 0} · P: {r.toiletKaryawanP || 0}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-mono">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {(r.wastafel || 0) > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
                                  {r.wastafel} unit
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-mono">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {isDefective ? (
                                <div className="inline-flex items-start gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-[11px] leading-tight">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                                  <span className="font-medium">{r.keteranganFisik}</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{r.keteranganFisik || 'Baik & Normal'}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <StatusBadge
                                status={r.isActive ? 'Aktif' : 'Nonaktif'}
                                variant={r.isActive ? 'success' : 'neutral'}
                              />
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleMasterRoomStatus(r.id)}
                                className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                {r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9.2 Data Petugas */}
      {routePath === '/master-data/petugas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <FormSection
              title="Tambah Petugas Kesling"
              description="Daftarkan nama petugas sanitarian agar dapat dipilih pada pencatatan kegiatan & supervisi."
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!officerName.trim()) return;
                  addMasterOfficer({
                    name: officerName.trim(),
                    nip: officerNip.trim() || '—',
                    position: officerPos.trim(),
                  });
                  setOfficerName('');
                  setOfficerNip('');
                }}
                className="space-y-4"
              >
                <TextField
                  label="Nama Lengkap & Gelar"
                  name="officerName"
                  value={officerName}
                  onChange={setOfficerName}
                  required
                  placeholder="Nama petugas sanitarian..."
                />
                <TextField
                  label="NIP / Nomor Pegawai (Opsional)"
                  name="officerNip"
                  value={officerNip}
                  onChange={setOfficerNip}
                  placeholder="Nomor identitas pegawai..."
                />
                <TextField
                  label="Jabatan / Peran"
                  name="officerPos"
                  value={officerPos}
                  onChange={setOfficerPos}
                  required
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Petugas</span>
                </button>
              </form>
            </FormSection>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Nama Petugas</th>
                    <th className="py-3 px-4">NIP / ID</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {masterOfficers.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {o.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{o.nip}</td>
                      <td className="py-3 px-4">{o.position}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status="Aktif" variant="success" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9.3 Kategori Kegiatan */}
      {routePath === '/master-data/kategori-kegiatan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <FormSection
              title="Tambah Kategori Kegiatan"
              description="Kategori tidak dikunci dalam kode agar dapat disesuaikan dengan rincian tupoksi Kesling."
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!catName.trim()) return;
                  addMasterActivityCategory(
                    catName.trim(),
                    catCode.trim() || `KEG-0${masterActivityCategories.length + 1}`
                  );
                  setCatCode('');
                  setCatName('');
                }}
                className="space-y-4"
              >
                <TextField
                  label="Kode Kategori"
                  name="catCode"
                  value={catCode}
                  onChange={setCatCode}
                  placeholder="Misal: KEG-07"
                />
                <TextField
                  label="Nama Kategori Kegiatan"
                  name="catName"
                  value={catName}
                  onChange={setCatName}
                  required
                  placeholder="Misal: Penyuluhan Kesehatan Lingkungan"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Kategori</span>
                </button>
              </form>
            </FormSection>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Kategori Kegiatan</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {masterActivityCategories.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-4 font-mono font-semibold">{c.code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {c.name}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="Aktif" variant="success" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9.7 Standar & Referensi */}
      {routePath === '/master-data/standar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <FormSection
              title="Tambah Standar & Referensi Regulasi"
              description="Sesuai aturan pengembangan, nilai standar tidak diisi sembarangan sebelum dikonfirmasi resmi."
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!stdName.trim() || !stdSource.trim()) return;
                  addMasterStandard({
                    standardName: stdName.trim(),
                    regulationSource: stdSource.trim(),
                    regulationNumber: stdNumber.trim() || '—',
                    effectiveDate: stdDate,
                    version: stdVersion.trim() || '1.0',
                    isActive: true,
                  });
                  setStdName('');
                  setStdSource('');
                  setStdNumber('');
                }}
                className="space-y-4"
              >
                <TextField
                  label="Nama Standar"
                  name="stdName"
                  value={stdName}
                  onChange={setStdName}
                  required
                  placeholder="Misal: Standar Baku Mutu Kesehatan Lingkungan RS"
                />
                <TextField
                  label="Sumber Regulasi"
                  name="stdSource"
                  value={stdSource}
                  onChange={setStdSource}
                  required
                  placeholder="Misal: Peraturan Menteri Kesehatan RI"
                />
                <TextField
                  label="Nomor Regulasi"
                  name="stdNumber"
                  value={stdNumber}
                  onChange={setStdNumber}
                  required
                  placeholder="Masukkan nomor regulasi resmi..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Tanggal Berlaku"
                    name="stdDate"
                    type="date"
                    value={stdDate}
                    onChange={setStdDate}
                    required
                  />
                  <TextField
                    label="Versi"
                    name="stdVersion"
                    value={stdVersion}
                    onChange={setStdVersion}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Metadata Standar</span>
                </button>
              </form>
            </FormSection>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden p-5">
              {masterStandards.length === 0 ? (
                <EmptyState
                  title="Belum Ada Standar Regulasi yang Didaftarkan"
                  description="Nilai standar dan referensi teknis sengaja dikosongkan pada awal instalasi agar tidak terjadi kesalahan acuan regulasi. Gunakan formulir di samping untuk menambahkan metadata standar resmi."
                  icon={<BookOpen className="w-6 h-6" />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Nama Standar</th>
                        <th className="py-2.5 px-3">Sumber & Nomor Regulasi</th>
                        <th className="py-2.5 px-3">Tgl Berlaku</th>
                        <th className="py-2.5 px-3">Versi</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {masterStandards.map((s) => (
                        <tr key={s.id}>
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                            {s.standardName}
                          </td>
                          <td className="py-3 px-3">
                            <div>{s.regulationSource}</div>
                            <div className="font-mono text-slate-400">
                              No: {s.regulationNumber}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono">{s.effectiveDate}</td>
                          <td className="py-3 px-3 font-mono">v{s.version}</td>
                          <td className="py-3 px-3">
                            <StatusBadge status="Aktif" variant="success" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9.4, 9.5, 9.6 Placeholders */}
      {(routePath === '/master-data/kategori-monitoring' ||
        routePath === '/master-data/indikator' ||
        routePath === '/master-data/template') && (
        <ModulePlaceholder
          title={meta.title}
          description={meta.description}
          status={meta.status}
          plannedFeatures={
            meta.subMenu?.plannedFeatures || [
              'Konfigurasi parameter pemeriksaan, satuan pengukuran, dan batas nilai normal',
              'Penonaktifan atau pembaruan indikator tanpa merusak histori pemeriksaan lama',
            ]
          }
        />
      )}
    </PageContainer>
  );
}
