'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  SummaryCard,
  FilterToolbar,
  SearchInput,
  EmptyState,
  StatusBadge,
  TextField,
  SelectField,
} from '@/components/sikesling/ui-system';
import {
  FindingStatus,
  FINDING_WORKFLOW_ORDER,
  PriorityLevel,
} from '@/lib/domain';

export function TindakLanjutView({
  routePath,
  fixedStatus,
}: {
  routePath: string;
  fixedStatus?: FindingStatus;
}) {
  const meta = resolveRouteMeta(routePath);
  const {
    findings,
    addFinding,
    updateFindingStatus,
    masterRooms,
    masterOfficers,
    currentRole,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    fixedStatus || 'ALL'
  );
  const [showAddModal, setShowAddModal] = useState(false);

  // New Finding Modal fields
  const today = '2026-10-31';
  const [date, setDate] = useState(today);
  const [location, setLocation] = useState(masterRooms[0]?.name || '');
  const [category, setCategory] = useState('Sanitasi & Kebersihan Lingkungan');
  const [description, setDescription] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [picName, setPicName] = useState(
    masterOfficers[0]?.name || 'Petugas Sanitarian Pelaksana'
  );
  const [targetDate, setTargetDate] = useState(today);
  const [priority, setPriority] = useState<PriorityLevel>('Sedang');

  const activeFilterStatus = fixedStatus || selectedStatus;

  const filtered = findings.filter((f) => {
    if (activeFilterStatus !== 'ALL' && f.status !== activeFilterStatus) {
      return false;
    }
    if (
      search &&
      !f.description.toLowerCase().includes(search.toLowerCase()) &&
      !f.code.toLowerCase().includes(search.toLowerCase()) &&
      !f.location.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    addFinding({
      date,
      location,
      category,
      description: description.trim(),
      recommendation: recommendation.trim() || 'Segera lakukan perbaikan sesuai standar.',
      picName,
      targetDate,
      priority,
      status: 'Temuan Baru',
    });
    setDescription('');
    setRecommendation('');
    setShowAddModal(false);
  };

  const getStatusVariant = (st: FindingStatus) => {
    switch (st) {
      case 'Temuan Baru':
        return 'danger';
      case 'Dalam Proses':
        return 'warning';
      case 'Menunggu Verifikasi':
        return 'info';
      case 'Selesai Terverifikasi':
        return 'success';
    }
  };

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
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Temuan Baru</span>
          </button>
        }
      />

      {/* Workflow Stage Stepper */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-4">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
          Alur Kerja Standar Pengelolaan Tindak Lanjut Temuan:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {FINDING_WORKFLOW_ORDER.map((step, idx) => {
            const count = findings.filter((f) => f.status === step).length;
            return (
              <div
                key={step}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40"
              >
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono text-slate-400">
                    Tahap 0{idx + 1}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {step}
                  </div>
                </div>
                <span className="text-lg font-bold font-mono tabular-nums text-[#1D7AFC] dark:text-[#60A5FA]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        onReset={() => {
          setSearch('');
          if (!fixedStatus) setSelectedStatus('ALL');
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nomor identifikasi, lokasi ruangan, atau deskripsi temuan..."
        />
        {!fixedStatus && (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter Status Temuan"
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Semua Status Alur Kerja</option>
            {FINDING_WORKFLOW_ORDER.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        )}
      </FilterToolbar>

      {/* Findings List / Table */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Terdapat Data Temuan pada Tahap Ini"
              description="Temuan lapangan dapat berasal dari formulir Mulai Supervisi atau ditambahkan secara langsung melalui tombol Catat Temuan Baru."
              actionLabel="Catat Temuan Baru"
              onAction={() => setShowAddModal(true)}
              icon={<CheckSquare className="w-6 h-6" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Kode / Tanggal</th>
                  <th className="py-3 px-4">Lokasi & Kategori</th>
                  <th className="py-3 px-4">Deskripsi Temuan & Rekomendasi</th>
                  <th className="py-3 px-4">Penanggung Jawab & Target</th>
                  <th className="py-3 px-4">Status Saat Ini</th>
                  <th className="py-3 px-4">Aksi Alur Kerja ({currentRole})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {item.code}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.location}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.category} · Prioritas {item.priority}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm space-y-1">
                      <p className="text-slate-800 dark:text-slate-200">
                        {item.description}
                      </p>
                      <p className="text-[11px] text-[#153E75] dark:text-[#60A5FA]">
                        Rekomendasi: {item.recommendation}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800 dark:text-slate-200">
                        {item.picName}
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-400">
                        Target: {item.targetDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge
                        status={item.status}
                        variant={getStatusVariant(item.status)}
                      />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'Temuan Baru' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateFindingStatus(item.id, 'Dalam Proses')
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                          >
                            <span>Proses Perbaikan</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {item.status === 'Dalam Proses' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateFindingStatus(item.id, 'Menunggu Verifikasi')
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                          >
                            <span>Ajukan Verifikasi</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {item.status === 'Menunggu Verifikasi' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateFindingStatus(item.id, 'Selesai Terverifikasi')
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verifikasi Selesai</span>
                          </button>
                        )}
                        {item.status === 'Selesai Terverifikasi' && (
                          <span className="text-[11px] text-slate-400">
                            Telah Terverifikasi
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Catat Temuan Baru */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-finding"
        >
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3
                id="modal-add-finding"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Catat Temuan Baru (Supabase Cloud)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Tutup dialog"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Tanggal Temuan"
                  name="findingDate"
                  type="date"
                  value={date}
                  onChange={setDate}
                  required
                />
                <TextField
                  label="Target Penyelesaian"
                  name="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={setTargetDate}
                  required
                />
              </div>
              <SelectField
                label="Lokasi Ruangan / Unit"
                name="findingLocation"
                value={location}
                onChange={setLocation}
                required
                options={masterRooms.map((r) => ({
                  value: r.name,
                  label: r.name,
                }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Kategori Temuan"
                  name="findingCategory"
                  value={category}
                  onChange={setCategory}
                  required
                />
                <SelectField
                  label="Prioritas"
                  name="findingPriority"
                  value={priority}
                  onChange={(v) => setPriority(v as PriorityLevel)}
                  options={[
                    { value: 'Rendah', label: 'Rendah' },
                    { value: 'Sedang', label: 'Sedang' },
                    { value: 'Tinggi', label: 'Tinggi' },
                  ]}
                />
              </div>
              <TextField
                label="Deskripsi Temuan"
                name="findingDesc"
                value={description}
                onChange={setDescription}
                multiline
                rows={3}
                required
                placeholder="Uraikan temuan ketidaksesuaian di lapangan..."
              />
              <TextField
                label="Rekomendasi Perbaikan"
                name="findingRec"
                value={recommendation}
                onChange={setRecommendation}
                multiline
                rows={2}
                placeholder="Langkah perbaikan yang direkomendasikan..."
              />
              <TextField
                label="Penanggung Jawab (PIC)"
                name="findingPic"
                value={picName}
                onChange={setPicName}
                required
              />
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E]"
                >
                  Simpan Temuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
