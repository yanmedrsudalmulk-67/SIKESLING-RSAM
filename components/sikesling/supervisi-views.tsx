'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  History,
  Image as ImageIcon,
  Info,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  SummaryCard,
  FormSection,
  TextField,
  SelectField,
  FileUploader,
  FilterToolbar,
  SearchInput,
  DateRangeFilter,
  EmptyState,
  ModulePlaceholder,
} from '@/components/sikesling/ui-system';
import {
  PhotoAttachmentMeta,
  PriorityLevel,
  validateSupervisionInput,
  hasPermission,
} from '@/lib/domain';

export function SupervisiDashboardView({
  routePath = '/supervisi/dashboard',
}: {
  routePath?: string;
}) {
  const meta = resolveRouteMeta(routePath);
  const { supervisions, findings, masterRooms } = useApp();

  const allPhotos = supervisions.flatMap((s) => s.attachments);

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Link
            href="/supervisi/baru"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Supervisi Baru</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Supervisi Tercatat"
          value={supervisions.length}
          subtitle="Tersinkronisasi di Supabase"
          icon={<ShieldCheck className="w-5 h-5" />}
          href="/supervisi/riwayat"
        />
        <SummaryCard
          title="Total Ruangan Terdaftar"
          value={masterRooms.filter((r) => r.isActive).length}
          subtitle="Master unit & ruangan aktif"
          icon={<ClipboardCheck className="w-5 h-5" />}
          href="/master-data/ruangan"
        />
        <SummaryCard
          title="Temuan Hasil Supervisi"
          value={findings.length}
          subtitle="Terhubung ke Tindak Lanjut"
          icon={<FileText className="w-5 h-5" />}
          href="/tindak-lanjut/temuan"
        />
        <SummaryCard
          title="Foto Dokumentasi"
          value={allPhotos.length}
          subtitle="Lampiran foto supervisi"
          icon={<Camera className="w-5 h-5" />}
          href="/supervisi/dokumentasi"
        />
      </div>

      {/* Submenu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolveRouteMeta('/supervisi').parentMenu?.subItems?.map((sub, i) => (
          <Link
            key={sub.id}
            href={sub.href}
            className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 hover:border-[#1D7AFC]/60 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-[#153E75] dark:text-[#60A5FA]">
                4.{i + 1} · {sub.status}
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {sub.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {sub.description}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1D7AFC] dark:text-[#60A5FA]">
              Buka Submodul →
            </span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

export function MulaiSupervisiView() {
  const meta = resolveRouteMeta('/supervisi/baru');
  const {
    addSupervision,
    masterRooms,
    masterOfficers,
    masterActivityCategories,
    currentRole,
  } = useApp();

  const today = '2026-10-31';
  const [date, setDate] = useState(today);
  const [officerName, setOfficerName] = useState(
    masterOfficers[0]?.name || 'Petugas Sanitarian Pelaksana'
  );
  const [roomOrUnit, setRoomOrUnit] = useState('');
  const [category, setCategory] = useState('');
  const [inspectionDetails, setInspectionDetails] = useState('');
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Sedang');
  const [attachments, setAttachments] = useState<PhotoAttachmentMeta[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canCreate = hasPermission(currentRole, 'create_supervision');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    const validation = validateSupervisionInput({
      date,
      officerName,
      roomOrUnit,
      category,
      inspectionDetails,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    addSupervision({
      date,
      officerName,
      roomOrUnit,
      category,
      inspectionDetails,
      findings,
      recommendations,
      priority,
      attachments,
    });

    setInspectionDetails('');
    setFindings('');
    setRecommendations('');
    setAttachments([]);
  };

  const handleReset = () => {
    setDate(today);
    setRoomOrUnit('');
    setCategory('');
    setInspectionDetails('');
    setFindings('');
    setRecommendations('');
    setPriority('Sedang');
    setAttachments([]);
    setErrors({});
  };

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Link
            href="/supervisi/riwayat"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <History className="w-4 h-4" />
            <span>Riwayat Supervisi</span>
          </Link>
        }
      />

      {/* Supabase Cloud Supervision Notice */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-[#EEF4FF]/60 dark:bg-slate-800/30 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1D7AFC] dark:text-[#60A5FA] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Formulir Supervisi Lapangan Terintegrasi Supabase Cloud
          </p>
          <p>
            Formulir ini dirancang ramah smartphone/tablet untuk supervisi lapangan. Apabila kolom <strong>Temuan</strong> diisi, sistem otomatis membuat tiket pada modul <strong>Tindak Lanjut Temuan</strong> dan menyinkronkannya ke Supabase secara realtime.
          </p>
        </div>
      </div>

      {!canCreate && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300">
          Role aktif (<strong>{currentRole}</strong>) tidak memiliki izin membuat supervisi. Gunakan switcher role di kanan atas ke <strong>Petugas Kesling</strong>, <strong>Koordinator Kesling</strong>, atau <strong>Administrator</strong>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="1. Identitas & Lokasi Supervisi"
          description="Pilih ruangan atau unit yang diperiksa beserta kategori pemeriksaan."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Tanggal Supervisi"
              name="supervisionDate"
              type="date"
              value={date}
              onChange={setDate}
              required
              error={errors.date}
            />
            <SelectField
              label="Petugas Supervisi"
              name="officerName"
              value={officerName}
              onChange={setOfficerName}
              required
              error={errors.officerName}
              options={masterOfficers
                .filter((o) => o.isActive)
                .map((o) => ({ value: o.name, label: `${o.name} (${o.position})` }))}
            />
            <SelectField
              label="Unit atau Ruangan"
              name="roomOrUnit"
              value={roomOrUnit}
              onChange={setRoomOrUnit}
              required
              error={errors.roomOrUnit}
              options={masterRooms
                .filter((r) => r.isActive)
                .map((r) => ({ value: r.name, label: `${r.code} — ${r.name}` }))}
            />
            <SelectField
              label="Kategori Supervisi"
              name="category"
              value={category}
              onChange={setCategory}
              required
              error={errors.category}
              options={[
                ...masterActivityCategories.map((c) => ({
                  value: c.name,
                  label: c.name,
                })),
                {
                  value: 'Supervisi Umum Kesehatan Lingkungan',
                  label: 'Supervisi Umum Kesehatan Lingkungan',
                },
              ]}
            />
          </div>
        </FormSection>

        <FormSection
          title="2. Hasil Pemeriksaan, Temuan, & Rekomendasi"
          description="Catat kondisi aktual di lapangan, temuan ketidaksesuaian (bila ada), serta rekomendasi perbaikan."
        >
          <TextField
            label="Uraian Pemeriksaan"
            name="inspectionDetails"
            value={inspectionDetails}
            onChange={setInspectionDetails}
            multiline
            rows={3}
            required
            placeholder="Jelaskan objek atau aspek yang diperiksa pada ruangan tersebut..."
            error={errors.inspectionDetails}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Temuan Lapangan (Opsional — Otomatis Masuk ke Tindak Lanjut)"
              name="findings"
              value={findings}
              onChange={setFindings}
              multiline
              rows={3}
              placeholder="Kosongkan apabila tidak ada temuan. Isi apabila ditemukan ketidaksesuaian yang memerlukan perbaikan..."
            />
            <TextField
              label="Rekomendasi Tindak Lanjut"
              name="recommendations"
              value={recommendations}
              onChange={setRecommendations}
              multiline
              rows={3}
              placeholder="Saran tindakan korektif atau koordinasi dengan unit terkait (misal: IPSRS / Cleaning Service)..."
            />
          </div>

          <SelectField
            label="Prioritas Tindak Lanjut (Apabila Terdapat Temuan)"
            name="priority"
            value={priority}
            onChange={(val) => setPriority(val as PriorityLevel)}
            options={[
              { value: 'Rendah', label: 'Prioritas Rendah — Pemeliharaan Rutin' },
              { value: 'Sedang', label: 'Prioritas Sedang — Perlu Tindak Lanjut Terjadwal' },
              { value: 'Tinggi', label: 'Prioritas Tinggi — Penanganan Segera' },
            ]}
          />
        </FormSection>

        <FormSection
          title="3. Dokumentasi Foto Supervisi"
          description="Unggah foto bukti pemeriksaan lapangan dengan keterangan per foto."
        >
          <FileUploader
            attachments={attachments}
            onChange={setAttachments}
            label="Foto Dokumentasi Pemeriksaan"
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Bersihkan Formulir</span>
            </button>
            <button
              type="submit"
              disabled={!canCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Supervisi ke Supabase</span>
            </button>
          </div>
        </FormSection>
      </form>
    </PageContainer>
  );
}

export function RiwayatSupervisiView() {
  const meta = resolveRouteMeta('/supervisi/riwayat');
  const { supervisions, masterRooms } = useApp();

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const filtered = supervisions.filter((s) => {
    if (
      search &&
      !s.inspectionDetails.toLowerCase().includes(search.toLowerCase()) &&
      !s.findings.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;
    if (selectedRoom && s.roomOrUnit !== selectedRoom) return false;
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Link
            href="/supervisi/baru"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Supervisi</span>
          </Link>
        }
      />

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
          placeholder="Cari uraian pemeriksaan atau temuan..."
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
          aria-label="Filter Ruangan"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="">Semua Ruangan</option>
          {masterRooms.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </FilterToolbar>

      <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Ada Riwayat Supervisi"
              description="Data pelaksanaan supervisi lingkungan akan tampil di sini setelah Anda mengisi formulir Mulai Supervisi."
              actionLabel="Mulai Supervisi Pertama"
              actionHref="/supervisi/baru"
              icon={<ShieldCheck className="w-6 h-6" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">ID / Tanggal</th>
                  <th className="py-3 px-4">Unit / Ruangan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Petugas</th>
                  <th className="py-3 px-4">Uraian & Temuan</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.date}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.id}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {item.roomOrUnit}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.officerName}
                    </td>
                    <td className="py-3 px-4 max-w-sm space-y-1">
                      <p className="text-slate-800 dark:text-slate-200">
                        {item.inspectionDetails}
                      </p>
                      {item.findings && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                          Temuan: {item.findings}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{item.priority}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {item.attachments.length} foto
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export function DokumentasiSupervisiView() {
  const meta = resolveRouteMeta('/supervisi/dokumentasi');
  const { supervisions } = useApp();

  const photos = supervisions.flatMap((sup) =>
    sup.attachments.map((att) => ({
      ...att,
      roomOrUnit: sup.roomOrUnit,
      date: sup.date,
      category: sup.category,
    }))
  );

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <Link
            href="/supervisi/baru"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah dari Supervisi Baru</span>
          </Link>
        }
      />

      {photos.length === 0 ? (
        <EmptyState
          title="Belum Ada Dokumentasi Foto Supervisi"
          description="Foto yang dilampirkan saat mengisi formulir Mulai Supervisi akan tersusun secara otomatis pada galeri dokumentasi ini."
          actionLabel="Mulai Supervisi & Unggah Foto"
          actionHref="/supervisi/baru"
          icon={<ImageIcon className="w-6 h-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((p) => (
            <div
              key={p.id}
              className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-4 space-y-2"
            >
              <div className="text-xs font-mono text-[#153E75] dark:text-[#60A5FA]">
                {p.date} · {p.roomOrUnit}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {p.caption || p.fileName}
              </div>
              <div className="text-xs text-slate-500">
                Kategori: {p.category} · {(p.sizeBytes / 1024).toFixed(1)} KB
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export function SupervisiPlaceholderSubView({ routePath }: { routePath: string }) {
  const meta = resolveRouteMeta(routePath);
  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />
      <ModulePlaceholder
        title={meta.title}
        description={meta.description}
        status={meta.status}
        plannedFeatures={
          meta.subMenu?.plannedFeatures || [
            'Konfigurasi daftar periksa (checklist) dinamis per jenis ruangan',
            'Rekapitulasi hasil supervisi per instalasi rumah sakit',
          ]
        }
      />
    </PageContainer>
  );
}
