'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  FolderArchive,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  FilterToolbar,
  SearchInput,
  EmptyState,
  ModulePlaceholder,
} from '@/components/sikesling/ui-system';

export function DokumentasiView({ routePath }: { routePath: string }) {
  const meta = resolveRouteMeta(routePath);
  const { activities, supervisions, pushToast } = useApp();
  const [search, setSearch] = useState('');

  const allPhotos = [
    ...activities.flatMap((a) =>
      a.attachments.map((att) => ({
        ...att,
        source: 'Kegiatan Harian',
        location: a.location,
        date: a.date,
        category: a.category,
      }))
    ),
    ...supervisions.flatMap((s) =>
      s.attachments.map((att) => ({
        ...att,
        source: 'Supervisi Lingkungan',
        location: s.roomOrUnit,
        date: s.date,
        category: s.category,
      }))
    ),
  ].filter(
    (p) =>
      !search ||
      p.fileName.toLowerCase().includes(search.toLowerCase()) ||
      p.caption.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

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
                title: 'Repositori Arsip Privat (Tahap Foundation)',
                message:
                  'Penyimpanan dokumen PDF/SOP menggunakan arsitektur direktori privat terkontrol yang akan diaktifkan bersama server lokal RSUD Al-Mulk.',
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Dokumen / Arsip</span>
          </button>
        }
      />

      <FilterToolbar onReset={() => setSearch('')}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nama dokumen, keterangan foto, atau lokasi ruangan..."
        />
      </FilterToolbar>

      {routePath === '/dokumentasi/galeri' ? (
        allPhotos.length === 0 ? (
          <EmptyState
            title="Galeri Kegiatan Masih Kosong"
            description="Foto yang Anda unggah pada Pencatatan Kegiatan Harian maupun Mulai Supervisi akan otomatis terindeks di galeri ini."
            actionLabel="Unggah Foto via Supervisi"
            actionHref="/supervisi/baru"
            icon={<ImageIcon className="w-6 h-6" />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPhotos.map((item) => (
              <div
                key={item.id}
                className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-4 space-y-2"
              >
                <div className="text-xs font-mono text-[#153E75] dark:text-[#60A5FA]">
                  {item.date} · {item.source}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.caption || item.fileName}
                </div>
                <div className="text-xs text-slate-500">
                  Lokasi: {item.location} · Kategori: {item.category}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <ModulePlaceholder
          title={meta.title}
          description={meta.description}
          status={meta.status}
          plannedFeatures={
            meta.subMenu?.plannedFeatures || [
              'Upload dokumen PDF, sertifikat uji laboratorium, dan SOP Kesling',
              'Kategorisasi dokumen, pencarian metadata, dan riwayat revisi',
              'Penyimpanan privat dengan kontrol akses berbasis role (tidak diekspos ke direktori publik tanpa otorisasi)',
            ]
          }
        >
          <EmptyState
            title={`Arsip ${meta.title} Belum Memiliki Dokumen`}
            description="Struktur penyimpanan dokumen internal dan regulasi telah disiapkan untuk tahap implementasi database dan file server rumah sakit."
            icon={<FolderArchive className="w-6 h-6" />}
          />
        </ModulePlaceholder>
      )}
    </PageContainer>
  );
}
