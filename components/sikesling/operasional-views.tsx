'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  History,
  Info,
  Plus,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  FormSection,
  TextField,
  SelectField,
  FileUploader,
  FilterToolbar,
  SearchInput,
  DateRangeFilter,
  EmptyState,
  StatusBadge,
  SummaryCard,
} from '@/components/sikesling/ui-system';
import { resolveRouteMeta } from '@/lib/navigation';
import {
  PhotoAttachmentMeta,
  validateDailyActivityInput,
  hasPermission,
  ScheduleRecord,
} from '@/lib/domain';

export function OperasionalIndexView() {
  const meta = resolveRouteMeta('/operasional');
  const { activities, schedules } = useApp();

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Kegiatan Harian"
          value={activities.length}
          subtitle="Tercatat pada sesi ini"
          icon={<ClipboardList className="w-5 h-5" />}
          href="/operasional/riwayat"
        />
        <SummaryCard
          title="Jadwal Kegiatan Terdaftar"
          value={schedules.length}
          subtitle="Agenda pemeriksaan & rutin"
          icon={<Calendar className="w-5 h-5" />}
          href="/operasional/jadwal"
        />
        <SummaryCard
          title="Status Penyimpanan"
          value="Supabase Cloud"
          subtitle="Terintegrasi REST v1 Realtime"
          icon={<History className="w-5 h-5" />}
          href="/pengaturan/aplikasi"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {meta.parentMenu?.subItems?.map((sub) => (
          <Link
            key={sub.id}
            href={sub.href}
            className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 hover:border-[#1D7AFC]/60 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="text-xs font-medium text-[#153E75] dark:text-[#60A5FA]">
                Submodul Operasional · {sub.status}
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {sub.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {sub.description}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1D7AFC] dark:text-[#60A5FA]">
              Buka Modul →
            </span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

export function KegiatanHarianView() {
  const meta = resolveRouteMeta('/operasional/kegiatan-harian');
  const {
    addActivity,
    masterRooms,
    masterActivityCategories,
    masterOfficers,
    currentRole,
  } = useApp();

  const today = '2026-10-31';
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [officerName, setOfficerName] = useState(
    masterOfficers[0]?.name || 'Petugas Sanitarian Pelaksana'
  );
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<PhotoAttachmentMeta[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canWrite = hasPermission(currentRole, 'manage_operational');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const validation = validateDailyActivityInput({
      date,
      category,
      location,
      officerName,
      description,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    addActivity({
      date,
      category,
      location,
      officerName,
      description,
      notes,
      attachments,
    });

    setDescription('');
    setNotes('');
    setAttachments([]);
  };

  const handleReset = () => {
    setDate(today);
    setCategory('');
    setLocation('');
    setDescription('');
    setNotes('');
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
            href="/operasional/riwayat"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <History className="w-4 h-4" />
            <span>Lihat Riwayat Kegiatan</span>
          </Link>
        }
      />

      {/* Supabase Cloud Notice */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Pencatatan Kegiatan Terintegrasi Supabase Cloud
          </p>
          <p>
            Pilihan jenis kegiatan, lokasi ruangan, dan nama petugas di bawah ini bersumber secara dinamis dari modul <strong>Master Data Supabase</strong>. Setiap kegiatan yang dicatat otomatis tersimpan ke Supabase dan memperbarui grafik serta rekap laporan secara realtime.
          </p>
        </div>
      </div>

      {!canWrite && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300">
          Role aktif saat ini (<strong>{currentRole}</strong>) hanya memiliki akses lihat (View-Only). Ubah simulasi role pada pojok kanan atas ke <strong>Petugas Kesling</strong> atau <strong>Administrator</strong> untuk mengisi formulir.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Formulir Pencatatan Kegiatan Harian"
          description="Lengkapi informasi aktivitas rutin petugas Kesehatan Lingkungan rumah sakit."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Tanggal Kegiatan"
              name="date"
              type="date"
              value={date}
              onChange={setDate}
              required
              error={errors.date}
            />
            <SelectField
              label="Nama Petugas Pelaksana"
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
              label="Jenis Kegiatan (Dapat Dikonfigurasi di Master Data)"
              name="category"
              value={category}
              onChange={setCategory}
              required
              error={errors.category}
              options={masterActivityCategories
                .filter((c) => c.isActive)
                .map((c) => ({ value: c.name, label: `${c.code} — ${c.name}` }))}
            />
            <SelectField
              label="Lokasi / Unit Ruangan"
              name="location"
              value={location}
              onChange={setLocation}
              required
              error={errors.location}
              options={masterRooms
                .filter((r) => r.isActive)
                .map((r) => ({ value: r.name, label: `${r.name} (${r.unitName})` }))}
            />
          </div>

          <TextField
            label="Uraian Kegiatan"
            name="description"
            value={description}
            onChange={setDescription}
            multiline
            rows={3}
            required
            placeholder="Tuliskan rincian kegiatan operasional yang dilakukan di lapangan..."
            error={errors.description}
          />

          <TextField
            label="Keterangan Tambahan (Opsional)"
            name="notes"
            value={notes}
            onChange={setNotes}
            multiline
            rows={2}
            placeholder="Catatan kondisi lapangan, koordinasi unit terkait, atau tindak lanjut..."
          />

          <FileUploader
            attachments={attachments}
            onChange={setAttachments}
            label="Dokumentasi Kegiatan (Opsional)"
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Formulir</span>
            </button>
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Supabase</span>
            </button>
          </div>
        </FormSection>
      </form>
    </PageContainer>
  );
}

export function JadwalKegiatanView() {
  const meta = resolveRouteMeta('/operasional/jadwal');
  const { schedules, addSchedule, toggleScheduleStatus, masterRooms, masterOfficers } =
    useApp();

  const today = '2026-10-31';
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [type, setType] = useState<ScheduleRecord['type']>('Pemeriksaan');
  const [location, setLocation] = useState(masterRooms[0]?.name || 'Area IPAL');
  const [officerName, setOfficerName] = useState(
    masterOfficers[0]?.name || 'Petugas Sanitarian Pelaksana'
  );
  const [filterType, setFilterType] = useState('ALL');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addSchedule({
      title: title.trim(),
      date,
      type,
      location,
      officerName,
      status: 'Terjadwal',
    });
    setTitle('');
  };

  const filtered = schedules.filter(
    (s) => filterType === 'ALL' || s.type === filterType
  );

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Tambah Jadwal */}
        <div className="lg:col-span-5">
          <FormSection
            title="Tambah Rencana Jadwal"
            description="Jadwalkan pemeriksaan, monitoring, supervisi, atau pengambilan sampel."
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <TextField
                label="Nama Agenda / Kegiatan"
                name="scheduleTitle"
                value={title}
                onChange={setTitle}
                required
                placeholder="Misal: Pengambilan Sampel Air Bersih Bulanan"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Tanggal Rencana"
                  name="scheduleDate"
                  type="date"
                  value={date}
                  onChange={setDate}
                  required
                />
                <SelectField
                  label="Kategori Jadwal"
                  name="scheduleType"
                  value={type}
                  onChange={(v) => setType(v as ScheduleRecord['type'])}
                  options={[
                    { value: 'Pemeriksaan', label: 'Jadwal Pemeriksaan' },
                    { value: 'Monitoring', label: 'Jadwal Monitoring' },
                    { value: 'Supervisi', label: 'Jadwal Supervisi' },
                    { value: 'Pengambilan Sampel', label: 'Pengambilan Sampel' },
                    { value: 'Kegiatan Rutin', label: 'Kegiatan Rutin' },
                  ]}
                />
              </div>
              <SelectField
                label="Lokasi / Unit"
                name="scheduleLocation"
                value={location}
                onChange={setLocation}
                options={masterRooms.map((r) => ({
                  value: r.name,
                  label: r.name,
                }))}
              />
              <SelectField
                label="Petugas Penanggung Jawab"
                name="scheduleOfficer"
                value={officerName}
                onChange={setOfficerName}
                options={masterOfficers.map((o) => ({
                  value: o.name,
                  label: o.name,
                }))}
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan ke Kalender Sesi</span>
              </button>
            </form>
          </FormSection>
        </div>

        {/* Kalender & Daftar Jadwal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Daftar Kalender Kegiatan Kesling
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Frekuensi pemeriksaan tidak dikunci agar fleksibel bagi tiap jenis kegiatan.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                {['ALL', 'Pemeriksaan', 'Monitoring', 'Supervisi', 'Pengambilan Sampel'].map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterType(tab)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        filterType === tab
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {tab === 'ALL' ? 'Semua' : tab}
                    </button>
                  )
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="Belum Ada Jadwal pada Kategori Ini"
                description="Gunakan formulir di samping untuk menambahkan jadwal pemeriksaan, monitoring, supervisi, atau pengambilan sampel."
                icon={<Calendar className="w-6 h-6" />}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono tabular-nums font-semibold text-[#153E75] dark:text-[#60A5FA]">
                          {item.date}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{item.type}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Lokasi: {item.location} · Petugas: {item.officerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge
                        status={item.status}
                        variant={item.status === 'Selesai' ? 'success' : 'info'}
                      />
                      <button
                        type="button"
                        onClick={() => toggleScheduleStatus(item.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {item.status === 'Terjadwal' ? 'Tandai Selesai' : 'Kembalikan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export function RiwayatKegiatanView() {
  const meta = resolveRouteMeta('/operasional/riwayat');
  const { activities, masterActivityCategories, masterRooms } = useApp();

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const filtered = activities.filter((item) => {
    if (
      search &&
      !item.description.toLowerCase().includes(search.toLowerCase()) &&
      !item.officerName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedLocation && item.location !== selectedLocation) return false;
    return true;
  });

  const handleReset = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setSelectedLocation('');
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
            href="/operasional/kegiatan-harian"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </Link>
        }
      />

      <FilterToolbar onReset={handleReset}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari uraian kegiatan atau nama petugas..."
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter Jenis Kegiatan"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="">Semua Jenis Kegiatan</option>
          {masterActivityCategories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          aria-label="Filter Lokasi"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="">Semua Lokasi</option>
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
              title="Belum Terdapat Riwayat Kegiatan"
              description="Seluruh aktivitas operasional harian yang dicatat pada menu Pencatatan Kegiatan Harian akan ditampilkan pada tabel ini."
              actionLabel="Catat Kegiatan Harian Pertama"
              actionHref="/operasional/kegiatan-harian"
              icon={<Clock className="w-6 h-6" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">ID / Tanggal</th>
                  <th className="py-3 px-4">Jenis Kegiatan</th>
                  <th className="py-3 px-4">Lokasi / Ruangan</th>
                  <th className="py-3 px-4">Petugas</th>
                  <th className="py-3 px-4">Uraian Kegiatan</th>
                  <th className="py-3 px-4">Dokumentasi</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.date}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.id}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.location}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.officerName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                      <p className="line-clamp-2">{item.description}</p>
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ket: {item.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                      {item.attachments.length} foto
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} variant="success" />
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
