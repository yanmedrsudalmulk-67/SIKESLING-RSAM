'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Building,
  Database,
  Plus,
  Sliders,
  Users,
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
      {routePath === '/master-data/ruangan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <FormSection
              title="Tambah Unit / Ruangan Baru"
              description="Data ruangan yang ditambahkan langsung dapat dipilih pada formulir Kegiatan & Supervisi."
            >
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
                  });
                  setRoomCode('');
                  setRoomName('');
                  setUnitName('');
                  setBuilding('');
                }}
                className="space-y-4"
              >
                <TextField
                  label="Kode Ruangan"
                  name="roomCode"
                  value={roomCode}
                  onChange={setRoomCode}
                  placeholder="Misal: R-LAB-01"
                />
                <TextField
                  label="Nama Ruangan"
                  name="roomName"
                  value={roomName}
                  onChange={setRoomName}
                  required
                  placeholder="Misal: Laboratorium Patologi Klinik"
                />
                <TextField
                  label="Nama Unit / Instalasi"
                  name="unitName"
                  value={unitName}
                  onChange={setUnitName}
                  required
                  placeholder="Misal: Instalasi Laboratorium"
                />
                <TextField
                  label="Gedung / Lantai"
                  name="building"
                  value={building}
                  onChange={setBuilding}
                  placeholder="Misal: Gedung Penunjang Lt. 1"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Ruangan</span>
                </button>
              </form>
            </FormSection>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Daftar Master Unit & Ruangan ({masterRooms.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4">Kode</th>
                      <th className="py-2.5 px-4">Ruangan & Instalasi</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {masterRooms.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 px-4 font-mono font-semibold">{r.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {r.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {r.unitName} · {r.building}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge
                            status={r.isActive ? 'Aktif' : 'Nonaktif'}
                            variant={r.isActive ? 'success' : 'neutral'}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => toggleMasterRoomStatus(r.id)}
                            className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            {r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

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
