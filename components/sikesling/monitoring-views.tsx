'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Calendar,
  FileSpreadsheet,
  FolderOpen,
  Plus,
  Sliders,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  SummaryCard,
  FilterToolbar,
  SearchInput,
  DateRangeFilter,
  EmptyState,
  ModulePlaceholder,
} from '@/components/sikesling/ui-system';

export function MonitoringIndexView() {
  const meta = resolveRouteMeta('/monitoring');

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {meta.parentMenu?.subItems?.map((sub, idx) => (
          <Link
            key={sub.id}
            href={sub.href}
            className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 hover:border-[#1D7AFC]/60 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#153E75] dark:text-[#60A5FA]">
                3.{idx + 1} · {sub.status}
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {sub.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {sub.description}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1D7AFC] dark:text-[#60A5FA]">
              Buka Wadah Modul →
            </span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

export function MonitoringSubmoduleView({
  routePath,
  subCategories,
}: {
  routePath: string;
  subCategories?: string[];
}) {
  const meta = resolveRouteMeta(routePath);
  const { masterRooms, pushToast } = useApp();

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [activeSubTab, setActiveSubTab] = useState(
    subCategories && subCategories.length > 0 ? subCategories[0] : 'Semua Kategori'
  );

  const plannedFeatures = meta.subMenu?.plannedFeatures || [
    'Pencatatan hasil pemantauan berkala berbasis parameter dinamis',
    'Filter periode, titik lokasi sampel, dan kategori pemantauan',
    'Lampiran sertifikat uji laboratorium dan dokumentasi foto',
  ];

  const consultationNotes = meta.subMenu?.consultationNotes;

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <button
            type="button"
            onClick={() =>
              pushToast({
                type: 'info',
                title: 'Modul Sedang Dalam Tahap Pengembangan',
                message:
                  'Parameter teknis dan ambang batas pemeriksaan untuk modul ini akan diaktifkan setelah konfirmasi dengan petugas Kesling RSUD Al-Mulk.',
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Monitoring</span>
          </button>
        }
      />

      {/* Sub-category selector (e.g. for Pengelolaan Limbah: Limbah medis, Limbah B3, Limbah domestik, Kategori lainnya) */}
      {subCategories && subCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] w-fit">
          {subCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveSubTab(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === cat
                  ? 'bg-[#153E75] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Summary Card Placeholders (Strict Rule 4: Zero values, no fake thresholds) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Catatan Pemantauan"
          value={0}
          subtitle={`Kategori: ${activeSubTab}`}
          icon={<Activity className="w-5 h-5" />}
        />
        <SummaryCard
          title="Parameter & Baku Mutu"
          value="Konfigurasi"
          subtitle="Dikosongkan hingga verifikasi Kesling"
          icon={<Sliders className="w-5 h-5" />}
          href="/master-data/indikator"
        />
        <SummaryCard
          title="Jadwal Pemantauan Berikutnya"
          value={0}
          subtitle="Belum ada jadwal terhubung"
          icon={<Calendar className="w-5 h-5" />}
          href="/operasional/jadwal"
        />
      </div>

      {/* Standard Filter Area */}
      <FilterToolbar
        onReset={() => {
          setSearch('');
          setStartDate('');
          setEndDate('');
          setSelectedRoom('');
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={`Cari catatan pada ${meta.title}...`}
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          aria-label="Filter Titik Lokasi atau Ruangan"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="">Semua Titik Lokasi / Ruangan</option>
          {masterRooms.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </FilterToolbar>

      {/* Module Placeholder & Data Table Area */}
      <ModulePlaceholder
        title={meta.title}
        description={meta.description}
        status={meta.status}
        plannedFeatures={plannedFeatures}
        consultationNotes={consultationNotes}
      >
        <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Tabel Data {meta.title} ({activeSubTab})
            </span>
            <span className="text-xs font-mono text-slate-400">0 Baris Data</span>
          </div>
          <div className="p-6">
            <EmptyState
              title={`Belum Terdapat Data ${meta.title}`}
              description="Tabel data pemantauan telah disiapkan. Kolom parameter ukur dan satuan akan dirender secara dinamis dari konfigurasi Master Indikator & Parameter setelah disepakati bersama petugas Kesling."
              actionLabel="Konfigurasi Master Parameter"
              actionHref="/master-data/indikator"
              icon={<FolderOpen className="w-6 h-6" />}
            />
          </div>
        </div>
      </ModulePlaceholder>
    </PageContainer>
  );
}
