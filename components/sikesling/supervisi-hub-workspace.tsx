'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eraser,
  Eye,
  FileSpreadsheet,
  LayoutGrid,
  Lock,
  LockOpen,
  PenTool,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CRITERIA_QUICK_OPTIONS,
  SUPERVISI_CARDS,
  SUPERVISOR_OPTIONS,
  ScoreValue,
  SupervisiAuditRecord,
  SupervisiCardConfig,
  SupervisiCardId,
  calculateSupervisiScores,
  createInitialSupervisiAuditRecords,
  loadSupervisiAuditRecords,
  saveSupervisiAuditRecords,
} from '@/lib/supervisi-hub';

interface SupervisiHubWorkspaceProps {
  initialMode?: 'cards' | 'form' | 'table';
  initialCardId?: SupervisiCardId;
}

const SAMPLE_TEMUAN_PHOTOS = [
  {
    label: 'Foto Paralon / Dinding',
    url: '/assets/aistudio/supervisi-temuan/temuan-1.png',
  },
  {
    label: 'Foto Dinding CSSD',
    url: '/assets/aistudio/supervisi-temuan/temuan-2.png',
  },
  {
    label: 'Foto Ventilasi / Plafon',
    url: '/assets/aistudio/supervisi-temuan/temuan-3.png',
  },
  {
    label: 'Foto Lorong Poli',
    url: '/assets/aistudio/supervisi-temuan/temuan-4.png',
  },
  {
    label: 'Foto Area Wastafel',
    url: '/assets/aistudio/supervisi-temuan/temuan-5.png',
  },
];

const SAMPLE_SIGNATURES = [
  '/assets/aistudio/supervisi-temuan/ttd-1.png',
  '/assets/aistudio/supervisi-temuan/ttd-2.png',
  '/assets/aistudio/supervisi-temuan/ttd-3.png',
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

export function SupervisiHubWorkspace({
  initialMode = 'cards',
  initialCardId = 'SUPERVISI',
}: SupervisiHubWorkspaceProps) {
  const [mode, setMode] = useState<'cards' | 'form' | 'table'>(initialMode);
  const [activeCardId, setActiveCardId] =
    useState<SupervisiCardId>(initialCardId);
  const [records, setRecords] = useState<SupervisiAuditRecord[]>(() =>
    createInitialSupervisiAuditRecords()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllUnitsInTable, setShowAllUnitsInTable] =
    useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Sequential Form States (matching Gambar 2, 3, 4)
  const [tanggal, setTanggal] = useState<string>('01/11/2026 16:55:01');
  const [supervisor, setSupervisor] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [namaPetugas, setNamaPetugas] = useState<string>('');
  const [kerapihan, setKerapihan] = useState<string>('');
  const [skorKerapihan, setSkorKerapihan] = useState<ScoreValue>(null);
  const [prosedur, setProsedur] = useState<string>('');
  const [skorProsedur, setSkorProsedur] = useState<ScoreValue>(null);
  const [alatDanBahan, setAlatDanBahan] = useState<string>('');
  const [skorAlatDanBahan, setSkorAlatDanBahan] = useState<ScoreValue>(null);
  const [k3, setK3] = useState<string>('');
  const [skorK3, setSkorK3] = useState<ScoreValue>(null);
  const [sikapDanPerilaku, setSikapDanPerilaku] = useState<string>('');
  const [skorSikapDanPerilaku, setSkorSikapDanPerilaku] =
    useState<ScoreValue>(null);
  const [temuan, setTemuan] = useState<string>('');
  const [rekomendasi, setRekomendasi] = useState<string>('');
  const [dokumentasiTemuanUrl, setDokumentasiTemuanUrl] = useState<string>('');
  const [dokumentasiPerbaikanUrl, setDokumentasiPerbaikanUrl] =
    useState<string>('');
  const [tandaTanganUrl, setTandaTanganUrl] = useState<string>('');

  // Quick-pick expansion toggles for '+' buttons on KERAPIHAN, PROSEDUR, ALAT DAN BAHAN, K3, SIKAP DAN PERILAKU
  const [openPickerKey, setOpenPickerKey] = useState<
    | 'kerapihan'
    | 'prosedur'
    | 'alatDanBahan'
    | 'k3'
    | 'sikapDanPerilaku'
    | null
  >(null);

  // Signature Pad Lock & Canvas state (matching Gambar 4 "Tap to unlock")
  const [isSignatureUnlocked, setIsSignatureUnlocked] =
    useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const temuanFileInputRef = useRef<HTMLInputElement | null>(null);
  const perbaikanFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setRecords(loadSupervisiAuditRecords());
    setTanggal(formatNowTimestamp());
  }, []);

  const activeCardConfig: SupervisiCardConfig = useMemo(() => {
    return (
      SUPERVISI_CARDS.find((c) => c.id === activeCardId) ||
      SUPERVISI_CARDS[SUPERVISI_CARDS.length - 1]
    );
  }, [activeCardId]);

  const computedScoreSummary = useMemo(() => {
    return calculateSupervisiScores({
      skorKerapihan,
      skorProsedur,
      skorAlatDanBahan,
      skorK3,
      skorSikapDanPerilaku,
    });
  }, [
    skorKerapihan,
    skorProsedur,
    skorAlatDanBahan,
    skorK3,
    skorSikapDanPerilaku,
  ]);

  const resetFormForCard = (cardId: SupervisiCardId) => {
    const cfg =
      SUPERVISI_CARDS.find((c) => c.id === cardId) ||
      SUPERVISI_CARDS[SUPERVISI_CARDS.length - 1];
    setTanggal(formatNowTimestamp());
    setSupervisor('');
    setUnit(cardId === 'SUPERVISI' ? '' : cfg.defaultUnit);
    setNamaPetugas('');
    setKerapihan('');
    setSkorKerapihan(null);
    setProsedur('');
    setSkorProsedur(null);
    setAlatDanBahan('');
    setSkorAlatDanBahan(null);
    setK3('');
    setSkorK3(null);
    setSikapDanPerilaku('');
    setSkorSikapDanPerilaku(null);
    setTemuan('');
    setRekomendasi('');
    setDokumentasiTemuanUrl('');
    setDokumentasiPerbaikanUrl('');
    setTandaTanganUrl('');
    setIsSignatureUnlocked(false);
    setOpenPickerKey(null);
  };

  const handleSelectCard = (cardId: SupervisiCardId) => {
    setActiveCardId(cardId);
    resetFormForCard(cardId);
    setMode('form');
  };

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'temuan' | 'perbaikan'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (target === 'temuan') {
        setDokumentasiTemuanUrl(result);
      } else {
        setDokumentasiPerbaikanUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Signature Canvas Handlers
  const getCanvasPoint = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isSignatureUnlocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCanvasPoint(e, canvas);
    ctx.strokeStyle = '#002147';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawing(true);
  };

  const drawMove = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !isSignatureUnlocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCanvasPoint(e, canvas);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    setTandaTanganUrl(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setTandaTanganUrl('');
  };

  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newRecord: SupervisiAuditRecord = {
      id: `sup-${Date.now()}`,
      cardId: activeCardId,
      tanggal: tanggal.trim() || formatNowTimestamp(),
      supervisor: supervisor.trim() || 'Fitria Wulandari, A.M.KL',
      unit: unit.trim() || activeCardConfig.defaultUnit,
      namaPetugas: namaPetugas.trim() || activeCardConfig.officerOptions[0],
      kerapihan: kerapihan.trim(),
      skorKerapihan,
      prosedur: prosedur.trim(),
      skorProsedur,
      alatDanBahan: alatDanBahan.trim(),
      skorAlatDanBahan,
      k3: k3.trim(),
      skorK3,
      sikapDanPerilaku: sikapDanPerilaku.trim(),
      skorSikapDanPerilaku,
      totalSkor: computedScoreSummary.totalSkor,
      kategori: computedScoreSummary.kategori,
      temuan: temuan.trim() || 'Kondisi ruangan bersih & sesuai standar',
      rekomendasi: rekomendasi.trim() || 'Pertahankan kebersihan rutin sesuai SOP',
      dokumentasiTemuanUrl:
        dokumentasiTemuanUrl || '/assets/aistudio/supervisi-temuan/temuan-1.png',
      dokumentasiPerbaikanUrl,
      tandaTanganUrl:
        tandaTanganUrl || '/assets/aistudio/supervisi-temuan/ttd-1.png',
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    saveSupervisiAuditRecords(updated);
    setShowAllUnitsInTable(false);
    setMode('table');
    setToastMessage(
      `Data ${activeCardConfig.title} berhasil disimpan ke Tabel Rekap Supervisi!`
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveSupervisiAuditRecords(updated);
  };

  const filteredTableRecords = useMemo(() => {
    return records.filter((r) => {
      if (!showAllUnitsInTable && r.cardId !== activeCardId) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.unit.toLowerCase().includes(q) ||
        r.namaPetugas.toLowerCase().includes(q) ||
        r.supervisor.toLowerCase().includes(q) ||
        r.temuan.toLowerCase().includes(q) ||
        r.rekomendasi.toLowerCase().includes(q) ||
        r.tanggal.toLowerCase().includes(q)
      );
    });
  }, [records, activeCardId, showAllUnitsInTable, searchQuery]);

  const stepActiveSheetTab = (dir: -1 | 1) => {
    const idx = SUPERVISI_CARDS.findIndex((c) => c.id === activeCardId);
    const nextIdx =
      (idx + dir + SUPERVISI_CARDS.length) % SUPERVISI_CARDS.length;
    setActiveCardId(SUPERVISI_CARDS[nextIdx].id);
    setShowAllUnitsInTable(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#002147] via-[#082B54] to-[#002147] p-3.5 sm:px-5 text-white border border-[#D2B48C]/45 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D2B48C] text-[#002147] flex items-center justify-center font-extrabold shadow-xs shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#D2B48C]">
              MODUL SUPERVISI RUANGAN & KESLING
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {mode === 'cards' &&
                'Pilih Ruangan / Unit Supervisi (10 Modul Ruangan)'}
              {mode === 'form' &&
                `Form Input Data Supervisi — ${activeCardConfig.title}`}
              {mode === 'table' &&
                `Tabel Rekap Supervisi — ${
                  showAllUnitsInTable ? 'SEMUA RUANGAN' : activeCardConfig.title
                }`}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('cards')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'cards'
                ? 'bg-[#D2B48C] text-[#002147] shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Pilih Card Ruangan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetFormForCard(activeCardId);
              setMode('form');
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'form'
                ? 'bg-[#D2B48C] text-[#002147] shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Form Input Supervisi</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('table')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'table'
                ? 'bg-[#D2B48C] text-[#002147] shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tabel Rekap Supervisi ({records.length})</span>
          </button>
        </div>
      </div>

      {/* Toast Notification after Save */}
      {toastMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs sm:text-sm font-extrabold shadow-lg"
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

      {/* =====================================================================
          VIEW 1: GAMBAR NO. 1 — GRID 10 CARD RUANGAN UNTUK DIPILIH
         ===================================================================== */}
      {mode === 'cards' && (
        <div className="rounded-2xl bg-[#F8F9FA] dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SUPERVISI_CARDS.map((card) => {
              const countForCard = records.filter(
                (r) => r.cardId === card.id
              ).length;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectCard(card.id)}
                  className={`group relative flex flex-col items-start rounded-xl bg-white dark:bg-slate-800 border border-[#DADCE0] dark:border-slate-700 ${card.borderHoverClass} p-3 text-left shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
                >
                  {/* 3D Illustration Image matching Gambar 1 */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white flex items-center justify-center mb-3">
                    <Image
                      src={card.imageSrc}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                      referrerPolicy="no-referrer"
                      className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Bottom Label with Hospital Building Icon matching Gambar 1 */}
                  <div
                    className={`w-full flex items-center justify-between gap-1 pt-0.5 ${card.labelColorClass}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-extrabold tracking-tight uppercase truncate">
                        {card.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                      {countForCard}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: GAMBAR NO. 2-4 — FORM PENGINPUTAN BERURUT KE BAWAH
         ===================================================================== */}
      {mode === 'form' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {/* Top Sticky Form Action Bar (Exact Match to Gambar 2: "X SUPERVISI Form" | "Cancel" | "Save") */}
          <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMode('cards')}
                aria-label="Tutup Form"
                title="Kembali ke Pilihan Card Ruangan"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">
                {activeCardConfig.formTitle}
              </h3>

              {/* Quick Switcher between the 10 Cards */}
              <select
                aria-label="Ganti Modul Ruangan"
                value={activeCardId}
                onChange={(e) => {
                  const nextId = e.target.value as SupervisiCardId;
                  setActiveCardId(nextId);
                  resetFormForCard(nextId);
                }}
                className="hidden md:block ml-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {SUPERVISI_CARDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setMode('cards')}
                className="px-4 py-1.5 rounded-md border border-[#1B8720] text-[#1B8720] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm()}
                className="px-5 py-1.5 rounded-md bg-[#1B8720] hover:bg-[#146918] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>

          {/* Vertical Sequential Form Body (Berurut ke bawah seperti Gambar 2, 3, 4) */}
          <form
            onSubmit={handleSaveForm}
            className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6"
          >
            {/* 1. TANGGAL * */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-tanggal"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                TANGGAL<span className="text-sky-600 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  id="supervisi-tanggal"
                  type="text"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setTanggal(formatNowTimestamp())}
                  title="Perbarui ke Waktu Sekarang"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. SUPERVISOR */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-supervisor"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                SUPERVISOR
              </label>
              <div className="relative">
                <select
                  id="supervisi-supervisor"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full appearance-none px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="">-- Pilih Supervisor --</option>
                  {SUPERVISOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 3. UNIT */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-unit"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                UNIT
              </label>
              <div className="relative">
                <select
                  id="supervisi-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full appearance-none px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="">-- Pilih Unit / Ruangan --</option>
                  {activeCardConfig.unitOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 4. NAMA PETUGAS */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-petugas"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                NAMA PETUGAS
              </label>
              <div className="relative">
                <select
                  id="supervisi-petugas"
                  value={namaPetugas}
                  onChange={(e) => setNamaPetugas(e.target.value)}
                  className="w-full appearance-none px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="">-- Pilih Nama Petugas --</option>
                  {activeCardConfig.officerOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 5. KERAPIHAN */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-kerapihan"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                KERAPIHAN
              </label>
              <div className="relative">
                <input
                  id="supervisi-kerapihan"
                  type="text"
                  value={kerapihan}
                  onChange={(e) => setKerapihan(e.target.value)}
                  placeholder="Klik + untuk opsi cepat atau ketik catatan kerapihan..."
                  className="w-full px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpenPickerKey(
                      openPickerKey === 'kerapihan' ? null : 'kerapihan'
                    )
                  }
                  title="Pilih Kriteria Kerapihan"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {openPickerKey === 'kerapihan' && (
                <div className="rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 space-y-1">
                  {CRITERIA_QUICK_OPTIONS.kerapihan.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setKerapihan(item);
                        setOpenPickerKey(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 6. SKOR (KERAPIHAN) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                SKOR
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setSkorKerapihan(skorKerapihan === val ? null : val)
                    }
                    className={`py-3 rounded-sm border text-sm font-medium transition-colors cursor-pointer ${
                      skorKerapihan === val
                        ? 'bg-[#1B8720] text-white border-[#1B8720] font-bold'
                        : 'bg-[#F8F9FA] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. PROSEDUR */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-prosedur"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                PROSEDUR
              </label>
              <div className="relative">
                <input
                  id="supervisi-prosedur"
                  type="text"
                  value={prosedur}
                  onChange={(e) => setProsedur(e.target.value)}
                  placeholder="Klik + untuk opsi cepat atau ketik evaluasi prosedur..."
                  className="w-full px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpenPickerKey(
                      openPickerKey === 'prosedur' ? null : 'prosedur'
                    )
                  }
                  title="Pilih Kriteria Prosedur"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {openPickerKey === 'prosedur' && (
                <div className="rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 space-y-1">
                  {CRITERIA_QUICK_OPTIONS.prosedur.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setProsedur(item);
                        setOpenPickerKey(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 8. SKOR_8 (PROSEDUR) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                SKOR_8
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setSkorProsedur(skorProsedur === val ? null : val)
                    }
                    className={`py-3 rounded-sm border text-sm font-medium transition-colors cursor-pointer ${
                      skorProsedur === val
                        ? 'bg-[#1B8720] text-white border-[#1B8720] font-bold'
                        : 'bg-[#F8F9FA] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 9. ALAT DAN BAHAN */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-alat"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                ALAT DAN BAHAN
              </label>
              <div className="relative">
                <input
                  id="supervisi-alat"
                  type="text"
                  value={alatDanBahan}
                  onChange={(e) => setAlatDanBahan(e.target.value)}
                  placeholder="Klik + untuk opsi cepat atau ketik kelengkapan alat dan bahan..."
                  className="w-full px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpenPickerKey(
                      openPickerKey === 'alatDanBahan' ? null : 'alatDanBahan'
                    )
                  }
                  title="Pilih Kriteria Alat dan Bahan"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {openPickerKey === 'alatDanBahan' && (
                <div className="rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 space-y-1">
                  {CRITERIA_QUICK_OPTIONS.alatDanBahan.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setAlatDanBahan(item);
                        setOpenPickerKey(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 10. SKOR_10 (ALAT DAN BAHAN) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                SKOR_10
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setSkorAlatDanBahan(skorAlatDanBahan === val ? null : val)
                    }
                    className={`py-3 rounded-sm border text-sm font-medium transition-colors cursor-pointer ${
                      skorAlatDanBahan === val
                        ? 'bg-[#1B8720] text-white border-[#1B8720] font-bold'
                        : 'bg-[#F8F9FA] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 11. KESELAMATAN DAN KESEHATAN KERJA (K3) */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-k3"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                KESELAMATAN DAN KESEHATAN KERJA (K3)
              </label>
              <div className="relative">
                <input
                  id="supervisi-k3"
                  type="text"
                  value={k3}
                  onChange={(e) => setK3(e.target.value)}
                  placeholder="Klik + untuk opsi cepat atau ketik kepatuhan K3 / APD..."
                  className="w-full px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpenPickerKey(openPickerKey === 'k3' ? null : 'k3')
                  }
                  title="Pilih Kriteria K3"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {openPickerKey === 'k3' && (
                <div className="rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 space-y-1">
                  {CRITERIA_QUICK_OPTIONS.k3.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setK3(item);
                        setOpenPickerKey(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 12. SKOR_12 (K3) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                SKOR_12
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSkorK3(skorK3 === val ? null : val)}
                    className={`py-3 rounded-sm border text-sm font-medium transition-colors cursor-pointer ${
                      skorK3 === val
                        ? 'bg-[#1B8720] text-white border-[#1B8720] font-bold'
                        : 'bg-[#F8F9FA] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 13. SIKAP DAN PERILAKU */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-sikap"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                SIKAP DAN PERILAKU
              </label>
              <div className="relative">
                <input
                  id="supervisi-sikap"
                  type="text"
                  value={sikapDanPerilaku}
                  onChange={(e) => setSikapDanPerilaku(e.target.value)}
                  placeholder="Klik + untuk opsi cepat atau ketik evaluasi sikap & perilaku..."
                  className="w-full px-3.5 py-3 pr-10 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpenPickerKey(
                      openPickerKey === 'sikapDanPerilaku'
                        ? null
                        : 'sikapDanPerilaku'
                    )
                  }
                  title="Pilih Kriteria Sikap dan Perilaku"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {openPickerKey === 'sikapDanPerilaku' && (
                <div className="rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 space-y-1">
                  {CRITERIA_QUICK_OPTIONS.sikapDanPerilaku.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSikapDanPerilaku(item);
                        setOpenPickerKey(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 14. SKOR_14 (SIKAP DAN PERILAKU) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                SKOR_14
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setSkorSikapDanPerilaku(
                        skorSikapDanPerilaku === val ? null : val
                      )
                    }
                    className={`py-3 rounded-sm border text-sm font-medium transition-colors cursor-pointer ${
                      skorSikapDanPerilaku === val
                        ? 'bg-[#1B8720] text-white border-[#1B8720] font-bold'
                        : 'bg-[#F8F9FA] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Computed Total Skor & Kategori Preview */}
            {computedScoreSummary.totalSkor !== null && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <span>
                  TOTAL SKOR OTOMATIS:{' '}
                  <strong className="text-sm">
                    {computedScoreSummary.totalSkor}
                  </strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1B8720] text-white">
                  KATEGORI: {computedScoreSummary.kategori}
                </span>
              </div>
            )}

            {/* 15. TEMUAN (Matching Gambar 4) */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-temuan"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                TEMUAN
              </label>
              <input
                id="supervisi-temuan"
                type="text"
                value={temuan}
                onChange={(e) => setTemuan(e.target.value)}
                placeholder="Ketik temuan supervisi di lapangan..."
                className="w-full px-3.5 py-3 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* 16. REKOMENDASI (Matching Gambar 4) */}
            <div className="space-y-1.5">
              <label
                htmlFor="supervisi-rekomendasi"
                className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                REKOMENDASI
              </label>
              <input
                id="supervisi-rekomendasi"
                type="text"
                value={rekomendasi}
                onChange={(e) => setRekomendasi(e.target.value)}
                placeholder="Ketik rekomendasi tindak lanjut (misal: koordinasi dengan IPSRS)..."
                className="w-full px-3.5 py-3 rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* 17. DOKUMENTASI TEMUAN (Matching Gambar 4 — Large Camera Box) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                DOKUMENTASI TEMUAN
              </label>
              <input
                ref={temuanFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileUpload(e, 'temuan')}
                className="hidden"
              />
              <div
                onClick={() => temuanFileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    temuanFileInputRef.current?.click();
                  }
                }}
                className="w-full min-h-[96px] rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 flex flex-col items-center justify-center p-3 transition-colors cursor-pointer"
              >
                {dokumentasiTemuanUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={dokumentasiTemuanUrl}
                      alt="Preview Dokumentasi Temuan"
                      className="h-20 w-24 object-cover rounded border border-slate-300"
                    />
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Foto Dokumentasi Temuan Terlampir
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Klik kotak ini untuk mengganti foto
                      </div>
                    </div>
                  </div>
                ) : (
                  <Camera className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                )}
              </div>

              {/* Quick sample photo selector for fast testing */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Pilih Cepat Foto Lapangan:
                </span>
                {SAMPLE_TEMUAN_PHOTOS.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setDokumentasiTemuanUrl(p.url)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      dokumentasiTemuanUrl === p.url
                        ? 'bg-[#1B8720] text-white border-[#1B8720]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 18. DOKUMENTASI PERBAIKAN (Matching Gambar 4 — Large Camera Box) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                DOKUMENTASI PERBAIKAN
              </label>
              <input
                ref={perbaikanFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileUpload(e, 'perbaikan')}
                className="hidden"
              />
              <div
                onClick={() => perbaikanFileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    perbaikanFileInputRef.current?.click();
                  }
                }}
                className="w-full min-h-[96px] rounded-md border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 flex flex-col items-center justify-center p-3 transition-colors cursor-pointer"
              >
                {dokumentasiPerbaikanUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={dokumentasiPerbaikanUrl}
                      alt="Preview Dokumentasi Perbaikan"
                      className="h-20 w-24 object-cover rounded border border-slate-300"
                    />
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Foto Dokumentasi Perbaikan Terlampir
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Klik kotak ini untuk mengganti foto
                      </div>
                    </div>
                  </div>
                ) : (
                  <Camera className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                )}
              </div>
            </div>

            {/* 19. TANDA TANGAN (Matching Gambar 4 — Lock icon + "Tap to unlock" + Signature Canvas) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  TANDA TANGAN
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignatureUnlocked(true);
                      setTandaTanganUrl(SAMPLE_SIGNATURES[0]);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Gunakan TTD Supervisor
                  </button>
                  {tandaTanganUrl && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-[10px] font-bold text-rose-700 border border-rose-200 cursor-pointer"
                    >
                      <Eraser className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              <div
                onClick={() => {
                  if (!isSignatureUnlocked) {
                    setIsSignatureUnlocked(true);
                  }
                }}
                className="relative w-full h-56 rounded-md border border-slate-400 dark:border-slate-600 bg-white overflow-hidden select-none"
              >
                {/* Top-Left Lock / Unlock Button matching Gambar 4 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSignatureUnlocked((prev) => !prev);
                  }}
                  title={
                    isSignatureUnlocked
                      ? 'Kunci Kotak Tanda Tangan'
                      : 'Tap to unlock'
                  }
                  className="absolute top-3 left-3 z-20 p-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isSignatureUnlocked ? (
                    <LockOpen className="w-5 h-5 text-[#1B8720]" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                {/* Interactive Canvas */}
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={224}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={finishDrawing}
                  onMouseLeave={finishDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawMove}
                  onTouchEnd={finishDrawing}
                  className={`w-full h-full ${
                    isSignatureUnlocked
                      ? 'cursor-crosshair'
                      : 'cursor-pointer pointer-events-none'
                  }`}
                />

                {/* If sample/existing signature URL is chosen and canvas not drawn directly */}
                {tandaTanganUrl && !isDrawing && (
                  <img
                    src={tandaTanganUrl}
                    alt="Tanda Tangan"
                    className="pointer-events-none absolute inset-0 m-auto max-h-36 object-contain"
                  />
                )}

                {/* Bottom Center "Tap to unlock" caption matching Gambar 4 */}
                <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-sm font-medium text-slate-700">
                  {isSignatureUnlocked
                    ? 'Silakan goreskan tanda tangan di area ini'
                    : 'Tap to unlock'}
                </div>
              </div>
            </div>

            {/* Bottom Form Save / Cancel Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMode('cards')}
                className="px-5 py-2.5 rounded-md border border-[#1B8720] text-[#1B8720] dark:text-emerald-400 hover:bg-emerald-50 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-md bg-[#1B8720] hover:bg-[#146918] text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                Simpan Data ke Tabel Rekap Supervisi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: GAMBAR NO. 5 — TABEL REKAP SUPERVISI (DENGAN GAMBAR & TANDA TANGAN
          SERTA TAB SHEET RUANGAN DI BAGIAN BAWAH)
         ===================================================================== */}
      {mode === 'table' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden">
          {/* Top Action & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('cards')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Pilih Card Ruangan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetFormForCard(activeCardId);
                  setMode('form');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1B8720] hover:bg-[#146918] text-white text-xs font-extrabold shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Input {activeCardConfig.title}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAllUnitsInTable((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  showAllUnitsInTable
                    ? 'bg-[#002147] text-[#D2B48C] border-[#002147]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {showAllUnitsInTable
                  ? 'Menampilkan: Semua Ruangan'
                  : `Tab Aktif: ${activeCardConfig.title}`}
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari temuan, unit, petugas..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#002147]"
              />
            </div>
          </div>

          {/* Spreadsheet Title Header (Exact Match to Gambar 5) */}
          <div className="bg-white text-black px-4 py-3 border-b border-slate-300">
            <div className="text-lg sm:text-xl font-extrabold tracking-tight uppercase">
              {showAllUnitsInTable
                ? 'LAPORAN SUPERVISI RUANGAN (SEMUA UNIT)'
                : activeCardConfig.reportTitle}
            </div>
            <div className="text-base sm:text-lg font-extrabold tracking-tight uppercase mt-0.5">
              UOBK RSUD AL-MULK KOTA SUKABUMI BULAN FEBRUARI 2026
            </div>
          </div>

          {/* Spreadsheet Recap Table with Bright Green Header Row (#00FF00) matching Gambar 5 */}
          <div className="overflow-x-auto bg-white text-black">
            <table className="w-full min-w-[1180px] border-collapse text-[10px] leading-tight">
              <thead>
                <tr className="bg-[#00FF00] text-black font-extrabold uppercase text-center">
                  <th className="border border-black px-1 py-1.5 w-[66px]">
                    TANGGAL
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[72px]">
                    SUPERVISOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[68px]">
                    UNIT
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[68px]">
                    NAMA PETUGAS
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[64px]">
                    KERAPIHAN
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[34px]">
                    SKOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[64px]">
                    PROSEDUR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[34px]">
                    SKOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[68px]">
                    ALAT DAN BAHAN
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[34px]">
                    SKOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[86px]">
                    KESELAMATAN DAN KESEHATAN KERJA (K3)
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[34px]">
                    SKOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[68px]">
                    SIKAP DAN PERILAKU
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[34px]">
                    SKOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[42px]">
                    TOTAL SKOR
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[56px]">
                    KATEGORI
                  </th>
                  <th className="border border-black px-1.5 py-1.5 w-[135px]">
                    TEMUAN
                  </th>
                  <th className="border border-black px-1.5 py-1.5 w-[130px]">
                    REKOMENDASI
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[72px]">
                    DOKUMENTASI TEMUAN
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[72px]">
                    DOKUMENTASI PERBAIKAN
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[70px]">
                    TANDA TANGAN
                  </th>
                  <th className="border border-black px-1 py-1.5 w-[32px]">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTableRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={22}
                      className="border border-black px-4 py-8 text-center text-xs font-bold text-slate-500"
                    >
                      Belum ada data untuk tab ini. Klik tombol &ldquo;+ Input{' '}
                      {activeCardConfig.title}&rdquo; di atas untuk menambahkan
                      data supervisi.
                    </td>
                  </tr>
                ) : (
                  filteredTableRecords.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-white hover:bg-emerald-50/40 transition-colors text-center align-middle"
                    >
                      <td className="border border-black px-1 py-1.5 font-medium text-[9.5px]">
                        {row.tanggal}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9.5px]">
                        {row.supervisor}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-semibold text-[9.5px]">
                        {row.unit}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9.5px]">
                        {row.namaPetugas}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9px]">
                        {row.kerapihan}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-bold">
                        {row.skorKerapihan ?? ''}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9px]">
                        {row.prosedur}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-bold">
                        {row.skorProsedur ?? ''}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9px]">
                        {row.alatDanBahan}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-bold">
                        {row.skorAlatDanBahan ?? ''}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9px]">
                        {row.k3}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-bold">
                        {row.skorK3 ?? ''}
                      </td>
                      <td className="border border-black px-1 py-1.5 text-[9px]">
                        {row.sikapDanPerilaku}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-bold">
                        {row.skorSikapDanPerilaku ?? ''}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-extrabold">
                        {row.totalSkor ?? ''}
                      </td>
                      <td className="border border-black px-1 py-1.5 font-bold text-[9px]">
                        {row.kategori}
                      </td>
                      <td className="border border-black px-1.5 py-1.5 text-[10px] leading-snug">
                        {row.temuan}
                      </td>
                      <td className="border border-black px-1.5 py-1.5 text-[10px] leading-snug">
                        {row.rekomendasi}
                      </td>
                      <td className="border border-black p-0.5">
                        {row.dokumentasiTemuanUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: row.dokumentasiTemuanUrl,
                                title: `Dokumentasi Temuan — ${row.unit} (${row.tanggal})`,
                              })
                            }
                            className="block mx-auto group relative cursor-pointer"
                            title="Klik untuk memperbesar foto"
                          >
                            <img
                              src={row.dokumentasiTemuanUrl}
                              alt={row.temuan || 'Dokumentasi Temuan'}
                              className="w-14 h-18 object-cover mx-auto border border-slate-300"
                            />
                          </button>
                        ) : null}
                      </td>
                      <td className="border border-black p-0.5">
                        {row.dokumentasiPerbaikanUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: row.dokumentasiPerbaikanUrl,
                                title: `Dokumentasi Perbaikan — ${row.unit} (${row.tanggal})`,
                              })
                            }
                            className="block mx-auto group relative cursor-pointer"
                            title="Klik untuk memperbesar foto"
                          >
                            <img
                              src={row.dokumentasiPerbaikanUrl}
                              alt="Dokumentasi Perbaikan"
                              className="w-14 h-18 object-cover mx-auto border border-slate-300"
                            />
                          </button>
                        ) : null}
                      </td>
                      <td className="border border-black p-0.5 bg-white">
                        {row.tandaTanganUrl ? (
                          <img
                            src={row.tandaTanganUrl}
                            alt={`Tanda Tangan ${row.namaPetugas}`}
                            className="w-14 h-16 object-contain mx-auto"
                          />
                        ) : null}
                      </td>
                      <td className="border border-black px-1 py-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(row.id)}
                          title="Hapus Baris"
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Google-Sheets-Style Unit Tab Bar (Exact Match to Bottom of Gambar 5) */}
          <div className="flex items-center justify-between bg-[#F1F3F4] border-t border-slate-300 px-2 py-1 select-none">
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
              {SUPERVISI_CARDS.map((card) => {
                const isSelected =
                  !showAllUnitsInTable && activeCardId === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setActiveCardId(card.id);
                      setShowAllUnitsInTable(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold whitespace-nowrap border-r border-slate-300 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#1A73E8] border-b-2 border-b-[#1A73E8] shadow-2xs font-extrabold'
                        : 'bg-[#F1F3F4] hover:bg-[#E8EAED] text-slate-700'
                    }`}
                  >
                    <span>{card.title}</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 pl-2 shrink-0 bg-[#F1F3F4]">
              <button
                type="button"
                onClick={() => stepActiveSheetTab(-1)}
                aria-label="Tab Sebelumnya"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => stepActiveSheetTab(1)}
                aria-label="Tab Selanjutnya"
                className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
    </div>
  );
}
