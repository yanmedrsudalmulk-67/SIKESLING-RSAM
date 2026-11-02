'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Eraser,
  ExternalLink,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { FindingStatus, FINDING_WORKFLOW_ORDER } from '@/lib/domain';
import {
  DEFAULT_PETUGAS_LIST,
  SUPERVISI_CARDS,
  SUPERVISOR_OPTIONS,
  SupervisiAuditRecord,
  TemuanWorkflowStatus,
  buildTimestampFromParts,
  createInitialSupervisiAuditRecords,
  deriveTemuanWorkflowStatus,
  loadCustomPetugasList,
  loadSupervisiAuditRecords,
  parseTimestampToParts,
  saveSupervisiAuditRecords,
  scaleCanvasCoordinates,
  updateSupervisiFindingFollowUp,
} from '@/lib/supervisi-hub';

const SAMPLE_SIGNATURES = [
  '/assets/aistudio/supervisi-temuan/ttd-1.png',
  '/assets/aistudio/supervisi-temuan/ttd-2.png',
  '/assets/aistudio/supervisi-temuan/ttd-3.png',
  '/assets/aistudio/supervisi-temuan/ttd-4.png',
  '/assets/aistudio/supervisi-temuan/ttd-5.png',
];

function formatNowTimestamp(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

export function TindakLanjutView({
  routePath,
  fixedStatus,
}: {
  routePath: string;
  fixedStatus?: FindingStatus;
}) {
  const meta = resolveRouteMeta(routePath);

  const [records, setRecords] = useState<SupervisiAuditRecord[]>(() =>
    createInitialSupervisiAuditRecords()
  );
  const [petugasOptions, setPetugasOptions] = useState<string[]>(() => [
    ...DEFAULT_PETUGAS_LIST,
  ]);
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    fixedStatus || 'ALL'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Modal state for Updating Follow-Up / Proses Perbaikan on an existing row
  const [editingRecord, setEditingRecord] =
    useState<SupervisiAuditRecord | null>(null);
  const [editTanggalPerbaikan, setEditTanggalPerbaikan] = useState<string>('');
  const [editProsesPerbaikan, setEditProsesPerbaikan] = useState<string>('');
  const [editDokPerbaikanUrl, setEditDokPerbaikanUrl] = useState<string>('');
  const [editTtdPerbaikanUrl, setEditTtdPerbaikanUrl] = useState<string>('');
  const [isEditSigUnlocked, setIsEditSigUnlocked] = useState<boolean>(true);
  const [isDrawingEditSig, setIsDrawingEditSig] = useState<boolean>(false);
  const editSigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editSigLastPtRef = useRef<{ x: number; y: number } | null>(null);
  const editPerbaikanFileRef = useRef<HTMLInputElement | null>(null);

  // Modal state for Adding a New Temuan directly (also syncs to Supervisi Audit table)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTanggal, setNewTanggal] = useState<string>('01/11/2026 09:00:00');
  const [newUnit, setNewUnit] = useState<string>('RAWAT JALAN');
  const [newPetugas, setNewPetugas] = useState<string>('ABU HANIFAH');
  const [newSupervisor, setNewSupervisor] = useState<string>(
    SUPERVISOR_OPTIONS[0]
  );
  const [newTemuan, setNewTemuan] = useState<string>('');
  const [newRekomendasi, setNewRekomendasi] = useState<string>('');
  const [newDokTemuanUrl, setNewDokTemuanUrl] = useState<string>('');
  const [newTtdTemuanUrl, setNewTtdTemuanUrl] = useState<string>('');
  const [newProsesPerbaikan, setNewProsesPerbaikan] = useState<string>('');
  const [newTanggalPerbaikan, setNewTanggalPerbaikan] = useState<string>('');
  const [newDokPerbaikanUrl, setNewDokPerbaikanUrl] = useState<string>('');
  const [newTtdPerbaikanUrl, setNewTtdPerbaikanUrl] = useState<string>('');
  const newTemuanFileRef = useRef<HTMLInputElement | null>(null);
  const newPerbaikanFileRef = useRef<HTMLInputElement | null>(null);
  const newSigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const newSigLastPtRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawingNewSig, setIsDrawingNewSig] = useState<boolean>(false);

  useEffect(() => {
    const syncFromStorage = () => {
      setRecords(loadSupervisiAuditRecords());
      setPetugasOptions(loadCustomPetugasList());
    };
    syncFromStorage();
    setNewTanggal(formatNowTimestamp());

    window.addEventListener('sikesling-supervisi-updated', syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('sikesling-supervisi-updated', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const unitOptionsList = useMemo(() => {
    const supervisiCard = SUPERVISI_CARDS.find((c) => c.id === 'SUPERVISI');
    const baseUnits = supervisiCard ? supervisiCard.unitOptions : [];
    const fromRecords = records.map((r) => r.unit).filter(Boolean);
    return Array.from(new Set([...baseUnits, ...fromRecords]));
  }, [records]);

  const activeFilterStatus = fixedStatus || selectedStatus;

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const status = deriveTemuanWorkflowStatus(rec);
      if (activeFilterStatus !== 'ALL' && status !== activeFilterStatus) {
        return false;
      }
      if (selectedUnit !== 'ALL' && rec.unit !== selectedUnit) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          rec.tanggal.toLowerCase().includes(q) ||
          rec.unit.toLowerCase().includes(q) ||
          rec.namaPetugas.toLowerCase().includes(q) ||
          rec.supervisor.toLowerCase().includes(q) ||
          rec.temuan.toLowerCase().includes(q) ||
          rec.rekomendasi.toLowerCase().includes(q) ||
          (rec.prosesPerbaikan || '').toLowerCase().includes(q) ||
          (rec.tanggalPerbaikan || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [records, activeFilterStatus, selectedUnit, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<TemuanWorkflowStatus, number> = {
      'Temuan Baru': 0,
      'Dalam Proses': 0,
      'Menunggu Verifikasi': 0,
      'Selesai Terverifikasi': 0,
    };
    for (const r of records) {
      const st = deriveTemuanWorkflowStatus(r);
      counts[st] = (counts[st] || 0) + 1;
    }
    return counts;
  }, [records]);

  const openEditFollowUpModal = (rec: SupervisiAuditRecord) => {
    setEditingRecord(rec);
    setEditTanggalPerbaikan(
      rec.tanggalPerbaikan?.trim() || formatNowTimestamp()
    );
    setEditProsesPerbaikan(rec.prosesPerbaikan || '');
    setEditDokPerbaikanUrl(rec.dokumentasiPerbaikanUrl || '');
    setEditTtdPerbaikanUrl(
      rec.tandaTanganPerbaikanUrl || rec.tandaTanganUrl || ''
    );
    setIsEditSigUnlocked(true);
  };

  const handleSaveFollowUpModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updated = updateSupervisiFindingFollowUp(records, editingRecord.id, {
      prosesPerbaikan: editProsesPerbaikan,
      tanggalPerbaikan: editTanggalPerbaikan,
      dokumentasiPerbaikanUrl: editDokPerbaikanUrl,
      tandaTanganPerbaikanUrl: editTtdPerbaikanUrl,
    });
    setRecords(updated);
    saveSupervisiAuditRecords(updated);
    setEditingRecord(null);
    setToastMessage(
      'Data Proses Perbaikan, Tanggal, Dokumentasi & Tanda Tangan Perbaikan berhasil disimpan!'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveSupervisiAuditRecords(updated);
    setToastMessage('Data temuan supervisi berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveNewFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemuan.trim()) return;

    const newRec: SupervisiAuditRecord = {
      id: `sup-${Date.now()}`,
      cardId: 'SUPERVISI',
      tanggal: newTanggal.trim() || formatNowTimestamp(),
      supervisor: newSupervisor || SUPERVISOR_OPTIONS[0],
      unit: newUnit || 'RAWAT JALAN',
      namaPetugas: newPetugas || petugasOptions[0] || 'ABU HANIFAH',
      kerapihan: 'Sesuai hasil supervisi lapangan',
      skorKerapihan: 4,
      prosedur: 'Sesuai hasil supervisi lapangan',
      skorProsedur: 4,
      alatDanBahan: 'Sesuai hasil supervisi lapangan',
      skorAlatDanBahan: 4,
      k3: 'Sesuai hasil supervisi lapangan',
      skorK3: 4,
      sikapDanPerilaku: 'Sesuai hasil supervisi lapangan',
      skorSikapDanPerilaku: 4,
      totalSkor: 20,
      kategori: 'SANGAT BAIK',
      temuan: newTemuan.trim(),
      rekomendasi:
        newRekomendasi.trim() || 'Koordinasi tindak lanjut perbaikan segera',
      dokumentasiTemuanUrl:
        newDokTemuanUrl || '/assets/aistudio/supervisi-temuan/temuan-1.png',
      dokumentasiPerbaikanUrl: newDokPerbaikanUrl,
      tandaTanganUrl:
        newTtdTemuanUrl || '/assets/aistudio/supervisi-temuan/ttd-1.png',
      prosesPerbaikan: newProsesPerbaikan.trim(),
      tanggalPerbaikan: newProsesPerbaikan.trim()
        ? newTanggalPerbaikan.trim() || formatNowTimestamp()
        : '',
      tandaTanganPerbaikanUrl: newTtdPerbaikanUrl,
    };

    const updated = [newRec, ...records];
    setRecords(updated);
    saveSupervisiAuditRecords(updated);
    setNewTemuan('');
    setNewRekomendasi('');
    setNewDokTemuanUrl('');
    setNewTtdTemuanUrl('');
    setNewProsesPerbaikan('');
    setNewTanggalPerbaikan('');
    setNewDokPerbaikanUrl('');
    setNewTtdPerbaikanUrl('');
    setShowAddModal(false);
    setToastMessage(
      'Temuan baru berhasil ditambahkan ke Daftar Temuan & Tabel Rekap Supervisi!'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  // File upload helpers
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Canvas pointer drawing helper for Edit Follow-Up Modal
  const startEditSigDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isEditSigUnlocked) setIsEditSigUnlocked(true);
    e.preventDefault();
    const canvas = editSigCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = scaleCanvasCoordinates(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect(),
      canvas.width,
      canvas.height
    );
    editSigLastPtRef.current = pt;
    ctx.strokeStyle = '#002147';
    ctx.fillStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawingEditSig(true);
  };

  const moveEditSigDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingEditSig) return;
    e.preventDefault();
    const canvas = editSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = scaleCanvasCoordinates(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect(),
      canvas.width,
      canvas.height
    );
    const last = editSigLastPtRef.current;
    ctx.strokeStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (last) {
      const midX = (last.x + pt.x) / 2;
      const midY = (last.y + pt.y) / 2;
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
    } else {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    editSigLastPtRef.current = pt;
  };

  const endEditSigDraw = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingEditSig) return;
    const canvas = editSigCanvasRef.current;
    if (canvas && e) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    }
    setIsDrawingEditSig(false);
    editSigLastPtRef.current = null;
    if (canvas) {
      setEditTtdPerbaikanUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearEditSig = () => {
    const canvas = editSigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    editSigLastPtRef.current = null;
    setEditTtdPerbaikanUrl('');
  };

  // Canvas pointer drawing helper for New Temuan Modal
  const startNewSigDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = newSigCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = scaleCanvasCoordinates(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect(),
      canvas.width,
      canvas.height
    );
    newSigLastPtRef.current = pt;
    ctx.strokeStyle = '#002147';
    ctx.fillStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawingNewSig(true);
  };

  const moveNewSigDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingNewSig) return;
    e.preventDefault();
    const canvas = newSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = scaleCanvasCoordinates(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect(),
      canvas.width,
      canvas.height
    );
    const last = newSigLastPtRef.current;
    ctx.strokeStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (last) {
      const midX = (last.x + pt.x) / 2;
      const midY = (last.y + pt.y) / 2;
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
    } else {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    newSigLastPtRef.current = pt;
  };

  const endNewSigDraw = () => {
    if (!isDrawingNewSig) return;
    setIsDrawingNewSig(false);
    newSigLastPtRef.current = null;
    if (newSigCanvasRef.current) {
      setNewTtdTemuanUrl(newSigCanvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status="Functional"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/supervisi/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-xl bg-[#FAF6F0] text-[#002147] border border-[#D2B48C] hover:bg-[#D2B48C]/30 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Input Data Supervisi</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setNewTanggal(formatNowTimestamp());
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl bg-[#002147] text-[#D2B48C] hover:bg-[#082B54] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Temuan Baru</span>
            </button>
          </div>
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl bg-[#1B8720] text-white px-4 py-3 text-xs sm:text-sm font-extrabold shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Status Cards (Themed Oxford Blue & Warm Tan) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {FINDING_WORKFLOW_ORDER.map((step, idx) => {
          const count = statusCounts[step] || 0;
          const isSelected = activeFilterStatus === step;
          return (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (fixedStatus) return;
                setSelectedStatus((prev) => (prev === step ? 'ALL' : step));
              }}
              className={`text-left rounded-2xl p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#002147] text-white border-[#002147] shadow-md ring-2 ring-[#D2B48C]'
                  : 'bg-white/90 dark:bg-slate-900/90 text-[#002147] dark:text-slate-100 border-[#D2B48C]/60 dark:border-slate-700 hover:bg-[#FAF6F0]'
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <div
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isSelected ? 'text-[#D2B48C]' : 'text-slate-500'
                  }`}
                >
                  Tahap 0{idx + 1}
                </div>
                <div className="text-xs sm:text-sm font-extrabold truncate">
                  {step}
                </div>
              </div>
              <span
                className={`text-lg sm:text-xl font-extrabold tabular-nums px-2.5 py-1 rounded-xl ${
                  isSelected
                    ? 'bg-[#D2B48C] text-[#002147]'
                    : 'bg-[#FAF6F0] dark:bg-slate-800 text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/50'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-[#FAF6F0]/95 dark:bg-slate-900/95 border border-[#D2B48C]/60 dark:border-slate-700 p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tanggal supervisi, unit ruangan, uraian temuan, rekomendasi, atau proses perbaikan..."
            aria-label="Cari Daftar Temuan"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D2B48C]/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Unit */}
          <div className="relative">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              aria-label="Filter Unit Ruangan"
              className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-[#D2B48C]/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147] cursor-pointer"
            >
              <option value="ALL">Semua Unit / Ruangan</option>
              {unitOptionsList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Status */}
          {!fixedStatus && (
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter Status Temuan"
                className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-[#D2B48C]/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147] cursor-pointer"
              >
                <option value="ALL">Semua Status ({records.length})</option>
                {FINDING_WORKFLOW_ORDER.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {(search || selectedUnit !== 'ALL' || (!fixedStatus && selectedStatus !== 'ALL')) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedUnit('ALL');
                if (!fixedStatus) setSelectedStatus('ALL');
              }}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          THEMED TABLE: DAFTAR TEMUAN TERINTEGRASI DARI INPUT DATA SUPERVISI
          Kolom:
          1. No
          2. Tanggal Supervisi
          3. Temuan
          4. Dokumentasi (Foto)
          5. Rekomendasi
          6. Tanda Tangan
          7. Proses Perbaikan Disertai Tanggal
          8. Dokumentasi Perbaikan
          9. Tanda Tangan (Perbaikan)
          10. Aksi
         ===================================================================== */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#D2B48C]/60 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* Themed Header Banner matching SIKESLING RSAM Table Theme */}
        <div className="bg-gradient-to-r from-[#002147] via-[#002b5c] to-[#002147] text-[#FAF6F0] px-4 sm:px-5 py-3.5 border-b border-[#D2B48C]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-extrabold tracking-tight uppercase text-[#FAF6F0]">
              DAFTAR TEMUAN &amp; TINDAK LANJUT PERBAIKAN HASIL SUPERVISI
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-[#D2B48C] mt-0.5">
              UOBK RSUD AL-MULK KOTA SUKABUMI — TERINTEGRASI OTOMATIS DARI INPUT DATA SUPERVISI
            </div>
          </div>
          <div className="inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-lg bg-[#FAF6F0]/10 border border-[#D2B48C]/40 text-[#D2B48C] text-xs font-extrabold tabular-nums shrink-0">
            Total Ditampilkan: {filteredRecords.length} Temuan
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-white dark:bg-slate-900">
          <table
            data-testid="daftar-temuan-table"
            className="w-full border-collapse text-xs text-[#002147] dark:text-slate-100"
          >
            <thead>
              <tr className="bg-[#002147] text-[#FAF6F0] font-extrabold uppercase text-[11px] text-center border-b-2 border-[#D2B48C]">
                <th className="border border-[#1e3a5f] px-2.5 py-3 w-12">
                  NO
                </th>
                <th className="border border-[#1e3a5f] px-3 py-3 min-w-[140px]">
                  TANGGAL SUPERVISI
                </th>
                <th className="border border-[#1e3a5f] px-3 py-3 min-w-[200px]">
                  TEMUAN
                </th>
                <th className="border border-[#1e3a5f] px-2.5 py-3 w-28 text-[#D2B48C]">
                  DOKUMENTASI (FOTO)
                </th>
                <th className="border border-[#1e3a5f] px-3 py-3 min-w-[190px]">
                  REKOMENDASI
                </th>
                <th className="border border-[#1e3a5f] px-2.5 py-3 w-28 text-[#D2B48C]">
                  TANDA TANGAN
                </th>
                <th className="border border-[#1e3a5f] px-3 py-3 min-w-[220px]">
                  PROSES PERBAIKAN DISERTAI TANGGAL
                </th>
                <th className="border border-[#1e3a5f] px-2.5 py-3 w-28 text-[#D2B48C]">
                  DOKUMENTASI PERBAIKAN
                </th>
                <th className="border border-[#1e3a5f] px-2.5 py-3 w-28 text-[#D2B48C]">
                  TANDA TANGAN
                </th>
                <th className="border border-[#1e3a5f] px-2.5 py-3 w-24">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="border border-[#D2B48C]/40 dark:border-slate-700 px-4 py-10 text-center text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 bg-[#FAF6F0]/40 dark:bg-slate-800/40"
                  >
                    Belum ada data temuan supervisi yang sesuai dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row, idx) => {
                  const status = deriveTemuanWorkflowStatus(row);
                  const hasPerbaikanText = Boolean(row.prosesPerbaikan?.trim());
                  const hasDokPerbaikan = Boolean(
                    row.dokumentasiPerbaikanUrl?.trim()
                  );
                  const hasTtdPerbaikan = Boolean(
                    row.tandaTanganPerbaikanUrl?.trim()
                  );

                  return (
                    <tr
                      key={row.id}
                      className="odd:bg-white even:bg-[#FAF6F0]/70 hover:bg-[#D2B48C]/15 dark:odd:bg-slate-900 dark:even:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors align-middle"
                    >
                      {/* 1. NO */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 px-2 py-3 text-center font-extrabold tabular-nums text-[#002147] dark:text-[#D2B48C]">
                        {idx + 1}
                      </td>

                      {/* 2. TANGGAL SUPERVISI (+ Unit & Petugas Badge) */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 px-3 py-3 text-center">
                        <div className="font-extrabold tabular-nums text-[#002147] dark:text-white">
                          {row.tanggal}
                        </div>
                        <div className="mt-1 inline-block px-2 py-0.5 rounded-md bg-[#002147] text-[#D2B48C] text-[10px] font-extrabold uppercase">
                          {row.unit}
                        </div>
                        {row.namaPetugas && (
                          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                            Petugas: {row.namaPetugas}
                          </div>
                        )}
                      </td>

                      {/* 3. TEMUAN */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 px-3 py-3 text-left leading-relaxed font-semibold text-[#002147] dark:text-slate-100">
                        {row.temuan}
                      </td>

                      {/* 4. DOKUMENTASI (FOTO) */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 p-2 text-center">
                        {row.dokumentasiTemuanUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: row.dokumentasiTemuanUrl,
                                title: `Dokumentasi Temuan — ${row.unit} (${row.tanggal})`,
                              })
                            }
                            className="inline-block group cursor-pointer"
                            title="Klik untuk memperbesar foto temuan"
                          >
                            <img
                              src={row.dokumentasiTemuanUrl}
                              alt={`Dokumentasi Temuan ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-[#D2B48C] shadow-xs group-hover:scale-105 transition-transform mx-auto"
                            />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Tidak ada foto
                          </span>
                        )}
                      </td>

                      {/* 5. REKOMENDASI */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 px-3 py-3 text-left leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                        {row.rekomendasi}
                      </td>

                      {/* 6. TANDA TANGAN (SUPERVISI / TEMUAN) */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 p-2 text-center bg-white">
                        {row.tandaTanganUrl ? (
                          <img
                            src={row.tandaTanganUrl}
                            alt={`Tanda Tangan Temuan ${idx + 1}`}
                            className="w-16 h-14 object-contain mx-auto"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum TTD
                          </span>
                        )}
                      </td>

                      {/* 7. PROSES PERBAIKAN DISERTAI TANGGAL */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 px-3 py-3 text-left">
                        {hasPerbaikanText ? (
                          <div className="space-y-1.5">
                            {row.tanggalPerbaikan && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1B8720]/15 text-[#1B8720] dark:text-emerald-300 text-[10px] font-extrabold tabular-nums">
                                <Clock className="w-3 h-3" />
                                <span>Tgl: {row.tanggalPerbaikan}</span>
                              </div>
                            )}
                            <p className="text-xs font-semibold text-[#002147] dark:text-slate-100 leading-relaxed">
                              {row.prosesPerbaikan}
                            </p>
                            <div>
                              <span
                                className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  status === 'Selesai Terverifikasi'
                                    ? 'bg-[#1B8720] text-white'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-2">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-extrabold">
                              Belum Ditindaklanjuti
                            </span>
                            <button
                              type="button"
                              onClick={() => openEditFollowUpModal(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#082B54] text-[11px] font-extrabold cursor-pointer transition-colors"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>Isi Proses Perbaikan</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 8. DOKUMENTASI PERBAIKAN */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 p-2 text-center">
                        {hasDokPerbaikan ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: row.dokumentasiPerbaikanUrl,
                                title: `Dokumentasi Perbaikan — ${row.unit} (${row.tanggalPerbaikan || row.tanggal})`,
                              })
                            }
                            className="inline-block group cursor-pointer"
                            title="Klik untuk memperbesar foto perbaikan"
                          >
                            <img
                              src={row.dokumentasiPerbaikanUrl}
                              alt={`Dokumentasi Perbaikan ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-[#1B8720] shadow-xs group-hover:scale-105 transition-transform mx-auto"
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEditFollowUpModal(row)}
                            className="inline-flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#002147] text-[10px] font-bold text-slate-500 hover:text-[#002147] cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
                            <span>Unggah Foto</span>
                          </button>
                        )}
                      </td>

                      {/* 9. TANDA TANGAN (PERBAIKAN) */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 p-2 text-center bg-white">
                        {hasTtdPerbaikan ? (
                          <img
                            src={row.tandaTanganPerbaikanUrl}
                            alt={`Tanda Tangan Perbaikan ${idx + 1}`}
                            className="w-16 h-14 object-contain mx-auto"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEditFollowUpModal(row)}
                            className="px-2 py-1 rounded-lg bg-[#FAF6F0] border border-[#D2B48C] text-[10px] font-extrabold text-[#002147] hover:bg-[#D2B48C]/30 cursor-pointer"
                          >
                            Isi TTD
                          </button>
                        )}
                      </td>

                      {/* 10. AKSI */}
                      <td className="border border-[#D2B48C]/45 dark:border-slate-700 px-2 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditFollowUpModal(row)}
                            aria-label={`Update perbaikan temuan nomor ${idx + 1}`}
                            title="Update Proses Perbaikan, Tanggal, Foto & Tanda Tangan"
                            className="p-1.5 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#082B54] transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(row.id)}
                            aria-label={`Hapus temuan nomor ${idx + 1}`}
                            title="Hapus Baris Temuan"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: UPDATE PROSES PERBAIKAN DISERTAI TANGGAL, DOKUMENTASI & TTD
         ===================================================================== */}
      {editingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-update-perbaikan-title"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#FAF6F0] dark:bg-slate-900 border-2 border-[#D2B48C] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#002147] text-white px-5 py-4 flex items-center justify-between border-b border-[#D2B48C]/40">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#D2B48C]">
                  Tindak Lanjut Temuan Supervisi — {editingRecord.unit}
                </div>
                <h3
                  id="modal-update-perbaikan-title"
                  className="text-sm sm:text-base font-extrabold text-white"
                >
                  Input / Update Proses Perbaikan, Tanggal, Dokumentasi &amp; Tanda Tangan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                aria-label="Tutup dialog"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveFollowUpModal}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {/* Context Summary of Finding */}
              <div className="rounded-xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 p-3.5 space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-[#002147] dark:text-[#D2B48C]">
                    Tanggal Supervisi: {editingRecord.tanggal}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] text-[10px] font-extrabold">
                    Unit: {editingRecord.unit}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Temuan: </span>
                  <span className="font-semibold text-[#002147] dark:text-white">
                    {editingRecord.temuan}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Rekomendasi: </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {editingRecord.rekomendasi}
                  </span>
                </div>
              </div>

              {/* Tanggal & Waktu Perbaikan */}
              {(() => {
                const parts = parseTimestampToParts(editTanggalPerbaikan);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="edit-perbaikan-date"
                        className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                      >
                        Pilih Tanggal Perbaikan
                      </label>
                      <input
                        id="edit-perbaikan-date"
                        type="date"
                        value={parts.dateInput}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          setEditTanggalPerbaikan(
                            buildTimestampFromParts(
                              e.target.value,
                              parts.timeInput
                            )
                          );
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="edit-perbaikan-time"
                        className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                      >
                        Pilih Waktu Perbaikan
                      </label>
                      <input
                        id="edit-perbaikan-time"
                        type="time"
                        step="1"
                        value={parts.timeInput}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          setEditTanggalPerbaikan(
                            buildTimestampFromParts(
                              parts.dateInput,
                              e.target.value
                            )
                          );
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Uraian Proses Perbaikan */}
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-proses-perbaikan"
                  className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                >
                  Proses Perbaikan
                </label>
                <textarea
                  id="edit-proses-perbaikan"
                  rows={3}
                  value={editProsesPerbaikan}
                  onChange={(e) => setEditProsesPerbaikan(e.target.value)}
                  placeholder="Ketik uraian tindakan / proses perbaikan yang telah dilakukan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                />
              </div>

              {/* Dokumentasi Perbaikan (Foto) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200">
                  Dokumentasi Perbaikan (Foto)
                </label>
                <input
                  ref={editPerbaikanFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setEditDokPerbaikanUrl)}
                  className="hidden"
                />
                <div
                  onClick={() => editPerbaikanFileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      editPerbaikanFileRef.current?.click();
                    }
                  }}
                  className="w-full min-h-[96px] rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-[#002147] flex items-center justify-center p-3 cursor-pointer"
                >
                  {editDokPerbaikanUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={editDokPerbaikanUrl}
                        alt="Preview Dokumentasi Perbaikan"
                        className="w-20 h-16 object-cover rounded-lg border border-slate-300"
                      />
                      <div className="text-left">
                        <div className="text-xs font-extrabold text-[#1B8720]">
                          Foto Perbaikan Terlampir
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Klik untuk mengganti foto perbaikan
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <Camera className="w-6 h-6 text-[#002147] dark:text-[#D2B48C]" />
                      <span className="text-xs font-semibold">
                        Ambil / Unggah Foto Dokumentasi Perbaikan
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tanda Tangan Perbaikan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200">
                    Tanda Tangan Perbaikan
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditSigUnlocked(true);
                        setEditTtdPerbaikanUrl(SAMPLE_SIGNATURES[0]);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#002147] text-[#D2B48C] text-[11px] font-bold cursor-pointer"
                    >
                      Gunakan TTD Digital
                    </button>
                    {editTtdPerbaikanUrl && (
                      <button
                        type="button"
                        onClick={clearEditSig}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Hapus TTD</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative w-full h-40 rounded-xl border-2 border-slate-300 bg-white overflow-hidden select-none touch-none shadow-inner">
                  <button
                    type="button"
                    onClick={() => setIsEditSigUnlocked((p) => !p)}
                    className="absolute top-2.5 left-2.5 z-20 p-1.5 rounded-lg bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    {isEditSigUnlocked ? (
                      <LockOpen className="w-4 h-4 text-[#1B8720]" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  <canvas
                    ref={editSigCanvasRef}
                    width={560}
                    height={160}
                    onPointerDown={startEditSigDraw}
                    onPointerMove={moveEditSigDraw}
                    onPointerUp={endEditSigDraw}
                    onPointerCancel={endEditSigDraw}
                    onPointerLeave={endEditSigDraw}
                    className="w-full h-full touch-none select-none cursor-crosshair"
                  />
                  {editTtdPerbaikanUrl &&
                    !isDrawingEditSig &&
                    editTtdPerbaikanUrl.startsWith('/assets/') && (
                      <img
                        src={editTtdPerbaikanUrl}
                        alt="TTD Perbaikan"
                        className="pointer-events-none absolute inset-0 m-auto max-h-28 object-contain"
                      />
                    )}
                  <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center text-[11px] font-semibold text-slate-400">
                    Sentuh / goreskan tanda tangan perbaikan di area ini
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D2B48C]/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1B8720] hover:bg-[#146918] text-white text-xs font-extrabold shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Tindak Lanjut Perbaikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: TAMBAH TEMUAN BARU SECARA LANGSUNG
         ===================================================================== */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-temuan-title"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#FAF6F0] dark:bg-slate-900 border-2 border-[#D2B48C] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#002147] text-white px-5 py-4 flex items-center justify-between border-b border-[#D2B48C]/40">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#D2B48C]">
                  Integrasi Supervisi &amp; Daftar Temuan
                </div>
                <h3
                  id="modal-add-temuan-title"
                  className="text-sm sm:text-base font-extrabold text-white"
                >
                  Tambah Data Temuan Supervisi Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Tutup dialog"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveNewFinding}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {(() => {
                const parts = parseTimestampToParts(newTanggal);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="new-temuan-date"
                        className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                      >
                        Pilih Tanggal Supervisi
                      </label>
                      <input
                        id="new-temuan-date"
                        type="date"
                        value={parts.dateInput}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          setNewTanggal(
                            buildTimestampFromParts(
                              e.target.value,
                              parts.timeInput
                            )
                          );
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-[#002147] dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="new-temuan-time"
                        className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                      >
                        Pilih Waktu Supervisi
                      </label>
                      <input
                        id="new-temuan-time"
                        type="time"
                        step="1"
                        value={parts.timeInput}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          setNewTanggal(
                            buildTimestampFromParts(
                              parts.dateInput,
                              e.target.value
                            )
                          );
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-[#002147] dark:text-white"
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="new-temuan-unit"
                    className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                  >
                    Unit / Ruangan
                  </label>
                  <select
                    id="new-temuan-unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs font-bold text-[#002147] dark:text-white"
                  >
                    {unitOptionsList.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="new-temuan-petugas"
                    className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                  >
                    Nama Petugas
                  </label>
                  <select
                    id="new-temuan-petugas"
                    value={newPetugas}
                    onChange={(e) => setNewPetugas(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs font-bold text-[#002147] dark:text-white"
                  >
                    {petugasOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="new-temuan-supervisor"
                    className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                  >
                    Supervisor
                  </label>
                  <select
                    id="new-temuan-supervisor"
                    value={newSupervisor}
                    onChange={(e) => setNewSupervisor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs font-bold text-[#002147] dark:text-white"
                  >
                    {SUPERVISOR_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="new-temuan-desc"
                  className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                >
                  Temuan <span className="text-rose-600">*</span>
                </label>
                <input
                  id="new-temuan-desc"
                  type="text"
                  required
                  value={newTemuan}
                  onChange={(e) => setNewTemuan(e.target.value)}
                  placeholder="Ketik temuan supervisi di lapangan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#002147] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="new-temuan-rec"
                  className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                >
                  Rekomendasi
                </label>
                <input
                  id="new-temuan-rec"
                  type="text"
                  value={newRekomendasi}
                  onChange={(e) => setNewRekomendasi(e.target.value)}
                  placeholder="Ketik rekomendasi perbaikan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#002147] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200">
                    Dokumentasi (Foto Temuan)
                  </label>
                  <input
                    ref={newTemuanFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setNewDokTemuanUrl)}
                    className="hidden"
                  />
                  <div
                    onClick={() => newTemuanFileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        newTemuanFileRef.current?.click();
                      }
                    }}
                    className="min-h-[84px] rounded-xl border border-dashed border-slate-300 bg-white dark:bg-slate-800 flex items-center justify-center p-2.5 cursor-pointer"
                  >
                    {newDokTemuanUrl ? (
                      <img
                        src={newDokTemuanUrl}
                        alt="Preview Foto Temuan"
                        className="h-14 w-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Camera className="w-5 h-5 text-[#002147]" />
                        <span className="text-[11px] font-semibold">
                          Unggah Foto Temuan
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200">
                    Dokumentasi Perbaikan (Opsional)
                  </label>
                  <input
                    ref={newPerbaikanFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setNewDokPerbaikanUrl)}
                    className="hidden"
                  />
                  <div
                    onClick={() => newPerbaikanFileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        newPerbaikanFileRef.current?.click();
                      }
                    }}
                    className="min-h-[84px] rounded-xl border border-dashed border-slate-300 bg-white dark:bg-slate-800 flex items-center justify-center p-2.5 cursor-pointer"
                  >
                    {newDokPerbaikanUrl ? (
                      <img
                        src={newDokPerbaikanUrl}
                        alt="Preview Foto Perbaikan"
                        className="h-14 w-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Camera className="w-5 h-5 text-[#002147]" />
                        <span className="text-[11px] font-semibold">
                          Unggah Foto Perbaikan
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="new-proses-perbaikan"
                  className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200"
                >
                  Proses Perbaikan (Opsional)
                </label>
                <input
                  id="new-proses-perbaikan"
                  type="text"
                  value={newProsesPerbaikan}
                  onChange={(e) => setNewProsesPerbaikan(e.target.value)}
                  placeholder="Ketik proses perbaikan bila sudah ditindaklanjuti..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-[#002147] dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase text-[#002147] dark:text-slate-200">
                    Tanda Tangan
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewTtdTemuanUrl(SAMPLE_SIGNATURES[0])}
                    className="px-2.5 py-1 rounded-lg bg-[#002147] text-[#D2B48C] text-[11px] font-bold cursor-pointer"
                  >
                    Gunakan TTD Digital
                  </button>
                </div>
                <div className="relative w-full h-32 rounded-xl border-2 border-slate-300 bg-white overflow-hidden select-none touch-none">
                  <canvas
                    ref={newSigCanvasRef}
                    width={560}
                    height={128}
                    onPointerDown={startNewSigDraw}
                    onPointerMove={moveNewSigDraw}
                    onPointerUp={endNewSigDraw}
                    onPointerCancel={endNewSigDraw}
                    onPointerLeave={endNewSigDraw}
                    className="w-full h-full touch-none select-none cursor-crosshair"
                  />
                  {newTtdTemuanUrl &&
                    !isDrawingNewSig &&
                    newTtdTemuanUrl.startsWith('/assets/') && (
                      <img
                        src={newTtdTemuanUrl}
                        alt="TTD"
                        className="pointer-events-none absolute inset-0 m-auto max-h-24 object-contain"
                      />
                    )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#D2B48C]/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1B8720] hover:bg-[#146918] text-white text-xs font-extrabold shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Temuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Enlarging Documentation Photos */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full rounded-2xl bg-white p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="text-xs font-extrabold text-[#002147]">
                {lightboxImage.title}
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[70vh] object-contain rounded-lg bg-slate-50"
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
