'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DoorOpen,
  Download,
  Eye,
  FileSpreadsheet,
  Info,
  Maximize2,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Umbrella,
  X,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { FloatingSaveButton } from '@/components/sikesling/floating-save-button';
import {
  SaranaPrasaranaDataset,
  ToiletRow,
  ToiletDisabilitasRow,
  LantaiRow,
  PintuJendelaRow,
  AtapRow,
  LangitLangitRow,
  calculateSaranaPrasaranaSummary,
  createInitialSaranaPrasaranaData,
} from '@/lib/sarana-prasarana';
import { DATA_INSPEKSI_SANITASI_RUANGAN, TOTAL_INSPEKSI_RUANGAN, SANITARIAN_INSPECTOR_OFFICIAL } from '@/lib/sarana-prasarana';

type ActiveSheetTab =
  | 'sheet-1'
  | 'sheet-2'
  | 'sheet-3'
  | 'sheet-4'
  | 'sheet-5'
  | 'sheet-6'
  | 'sheet-ruangan';

export function SaranaPrasaranaView() {
  const meta = resolveRouteMeta('/monitoring/sarana-prasarana');
  const {
    saranaPrasaranaData,
    updateSaranaPrasaranaData,
    syncAllToSupabase,
    pushToast,
    resolvedTheme,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveSheetTab>('sheet-1');
  const [data, setData] = useState<SaranaPrasaranaDataset>(
    () => saranaPrasaranaData || createInitialSaranaPrasaranaData(2026)
  );

  // Sync internal state when context dataset updates (e.g. from Supabase hydration)
  React.useEffect(() => {
    if (saranaPrasaranaData) {
      if (!saranaPrasaranaData.toilets || saranaPrasaranaData.toilets.length < 15) {
        const fresh = createInitialSaranaPrasaranaData(2026);
        setData(fresh);
        void updateSaranaPrasaranaData(fresh);
      } else {
        setData(saranaPrasaranaData);
      }
    }
  }, [saranaPrasaranaData, updateSaranaPrasaranaData]);

  // Delete modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    sheet: 'toilet' | 'lantai' | 'pintu' | 'atap' | 'plafon';
    id: string;
    label: string;
  } | null>(null);

  // Compute summary, charts, recommendations and RTL
  const summary = useMemo(() => calculateSaranaPrasaranaSummary(data), [data]);

  // Save handler
  const handleSaveData = async () => {
    try {
      await updateSaranaPrasaranaData(data);
      await syncAllToSupabase();
      pushToast({
        type: 'success',
        title: 'Data Sarpras Tersimpan',
        message:
          'Data pemeriksaan 5 Sheet Sarana dan Prasarana berhasil disimpan dan disinkronkan ke Supabase.',
      });
    } catch {
      pushToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kendala saat menyimpan data ke Supabase.',
      });
    }
  };

  // Reset to initial
  const handleResetToDefault = () => {
    const fresh = createInitialSaranaPrasaranaData(2026);
    setData(fresh);
    pushToast({
      type: 'info',
      title: 'Data Direset',
      message: 'Data sarana prasarana telah dikembalikan ke standar awal.',
    });
  };

  // ----------------------------------------------------
  // Sheet 1 Helpers
  // ----------------------------------------------------
  const updateToiletRow = (id: string, field: keyof ToiletRow, value: unknown) => {
    setData((prev) => ({
      ...prev,
      toilets: prev.toilets.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === 'jenisL' || field === 'jenisP' || field === 'jenisLP') {
          updated.totalJenis =
            Number(updated.jenisL || 0) +
            Number(updated.jenisP || 0) +
            Number(updated.jenisLP || 0);
        }
        return updated;
      }),
    }));
  };

  const addToiletRow = () => {
    const nextNo = data.toilets.length + 1;
    const newRow: ToiletRow = {
      id: `t-${Date.now()}`,
      no: nextNo,
      bulan: 'Januari',
      indikator: 'Toilet Ruangan Baru',
      jenisL: 0,
      jenisP: 0,
      jenisLP: 1,
      totalJenis: 1,
      keterangan: 'Pemeriksaan rutin kebersihan & fasilitas',
    };
    setData((prev) => ({ ...prev, toilets: [...prev.toilets, newRow] }));
    pushToast({
      type: 'success',
      title: 'Baris Ditambahkan',
      message: 'Baris baru telah ditambahkan pada Sheet 1 (Toilet & Sanitasi).',
    });
  };

  const updateToiletDisabilitas = (
    field: keyof ToiletDisabilitasRow,
    value: unknown
  ) => {
    setData((prev) => ({
      ...prev,
      toiletDisabilitas: {
        ...prev.toiletDisabilitas,
        [field]: value,
      },
    }));
  };

  // ----------------------------------------------------
  // Sheet 2 Helpers (Lantai)
  // ----------------------------------------------------
  const updateLantaiRow = (id: string, field: keyof LantaiRow, value: unknown) => {
    setData((prev) => ({
      ...prev,
      lantai: prev.lantai.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const toggleLantaiParam = (id: string, paramIndex: 1 | 2 | 3 | 4, isYa: boolean) => {
    setData((prev) => ({
      ...prev,
      lantai: prev.lantai.map((row) => {
        if (row.id !== id) return row;
        if (paramIndex === 1) return { ...row, param1Ya: isYa, param1Tidak: !isYa };
        if (paramIndex === 2) return { ...row, param2Ya: isYa, param2Tidak: !isYa };
        if (paramIndex === 3) return { ...row, param3Ya: isYa, param3Tidak: !isYa };
        if (paramIndex === 4) return { ...row, param4Ya: isYa, param4Tidak: !isYa };
        return row;
      }),
    }));
  };

  const addLantaiRow = () => {
    const nextNo = data.lantai.length + 1;
    const newRow: LantaiRow = {
      id: `l-${Date.now()}`,
      no: nextNo,
      indikator: 'Ruangan / Area Baru',
      param1Ya: true,
      param1Tidak: false,
      param2Ya: true,
      param2Tidak: false,
      param3Ya: true,
      param3Tidak: false,
      param4Ya: true,
      param4Tidak: false,
      keterangan: 'Kondisi fisik lantai dan dinding memenuhi standar',
    };
    setData((prev) => ({ ...prev, lantai: [...prev.lantai, newRow] }));
    pushToast({
      type: 'success',
      title: 'Baris Ditambahkan',
      message: 'Area baru ditambahkan pada Sheet 2 (Lantai Rumah Sakit).',
    });
  };

  // ----------------------------------------------------
  // Sheet 3 Helpers (Pintu & Jendela)
  // ----------------------------------------------------
  const updatePintuRow = (id: string, field: keyof PintuJendelaRow, value: unknown) => {
    setData((prev) => ({
      ...prev,
      pintuJendela: prev.pintuJendela.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const togglePintuParam = (id: string, paramIndex: 1 | 2 | 3 | 4 | 5 | 6, isYa: boolean) => {
    setData((prev) => ({
      ...prev,
      pintuJendela: prev.pintuJendela.map((row) => {
        if (row.id !== id) return row;
        if (paramIndex === 1) return { ...row, param1Ya: isYa, param1Tidak: !isYa };
        if (paramIndex === 2) return { ...row, param2Ya: isYa, param2Tidak: !isYa };
        if (paramIndex === 3) return { ...row, param3Ya: isYa, param3Tidak: !isYa };
        if (paramIndex === 4) return { ...row, param4Ya: isYa, param4Tidak: !isYa };
        if (paramIndex === 5) return { ...row, param5Ya: isYa, param5Tidak: !isYa };
        if (paramIndex === 6) return { ...row, param6Ya: isYa, param6Tidak: !isYa };
        return row;
      }),
    }));
  };

  const addPintuRow = () => {
    const nextNo = data.pintuJendela.length + 1;
    const newRow: PintuJendelaRow = {
      id: `pj-${Date.now()}`,
      no: nextNo,
      indikator: 'Pintu / Jendela Unit Baru',
      param1Ya: true,
      param1Tidak: false,
      param2Ya: true,
      param2Tidak: false,
      param3Ya: true,
      param3Tidak: false,
      param4Ya: true,
      param4Tidak: false,
      param5Ya: true,
      param5Tidak: false,
      param6Ya: true,
      param6Tidak: false,
      keterangan: 'Memenuhi persyaratan lebar bukaan dan keselamatan',
    };
    setData((prev) => ({ ...prev, pintuJendela: [...prev.pintuJendela, newRow] }));
    pushToast({
      type: 'success',
      title: 'Baris Ditambahkan',
      message: 'Unit pintu/jendela baru ditambahkan pada Sheet 3.',
    });
  };

  // ----------------------------------------------------
  // Sheet 4 Helpers (Atap)
  // ----------------------------------------------------
  const updateAtapRow = (id: string, field: keyof AtapRow, value: unknown) => {
    setData((prev) => ({
      ...prev,
      atap: prev.atap.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const toggleAtapParam = (id: string, paramIndex: 1 | 2, isYa: boolean) => {
    setData((prev) => ({
      ...prev,
      atap: prev.atap.map((row) => {
        if (row.id !== id) return row;
        if (paramIndex === 1) return { ...row, param1Ya: isYa, param1Tidak: !isYa };
        if (paramIndex === 2) return { ...row, param2Ya: isYa, param2Tidak: !isYa };
        return row;
      }),
    }));
  };

  const addAtapRow = () => {
    const nextNo = data.atap.length + 1;
    const newRow: AtapRow = {
      id: `a-${Date.now()}`,
      no: nextNo,
      indikator: 'Gedung Unit Baru',
      param1Ya: true,
      param1Tidak: false,
      param1Ket: 'Kondisi atap kokoh dan tidak bocor.',
      param2Ya: true,
      param2Tidak: false,
      param2Ket: 'Bebas dari sarang hewan pengganggu.',
      keterangan: 'Memenuhi standar teknis atap rumah sakit.',
    };
    setData((prev) => ({ ...prev, atap: [...prev.atap, newRow] }));
    pushToast({
      type: 'success',
      title: 'Baris Ditambahkan',
      message: 'Gedung baru ditambahkan pada Sheet 4 (Atap RS).',
    });
  };

  // ----------------------------------------------------
  // Sheet 5 Helpers (Langit-langit / Plafon)
  // ----------------------------------------------------
  const updateLangitRow = (id: string, field: keyof LangitLangitRow, value: unknown) => {
    setData((prev) => ({
      ...prev,
      langitLangit: prev.langitLangit.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const toggleLangitParam = (
    id: string,
    paramIndex: 1 | 2 | 3 | 4 | 5,
    isYa: boolean
  ) => {
    setData((prev) => ({
      ...prev,
      langitLangit: prev.langitLangit.map((row) => {
        if (row.id !== id) return row;
        if (paramIndex === 1) return { ...row, param1Ya: isYa, param1Tidak: !isYa };
        if (paramIndex === 2) return { ...row, param2Ya: isYa, param2Tidak: !isYa };
        if (paramIndex === 3) return { ...row, param3Ya: isYa, param3Tidak: !isYa };
        if (paramIndex === 4) return { ...row, param4Ya: isYa, param4Tidak: !isYa };
        if (paramIndex === 5) return { ...row, param5Ya: isYa, param5Tidak: !isYa };
        return row;
      }),
    }));
  };

  const addLangitRow = () => {
    const nextNo = data.langitLangit.length + 1;
    const newRow: LangitLangitRow = {
      id: `ll-${Date.now()}`,
      no: nextNo,
      indikator: 'Ruangan / Area Evaluasi Baru',
      param1Ya: true,
      param1Tidak: false,
      param2Ya: true,
      param2Tidak: false,
      param3Ya: true,
      param3Tidak: false,
      param4Ya: true,
      param4Tidak: false,
      param5Ya: true,
      param5Tidak: false,
      keterangan: 'Kondisi langit-langit memenuhi ketentuan teknis',
    };
    setData((prev) => ({ ...prev, langitLangit: [...prev.langitLangit, newRow] }));
    pushToast({
      type: 'success',
      title: 'Baris Ditambahkan',
      message: 'Ruangan baru ditambahkan pada Sheet 5 (Langit-langit RS).',
    });
  };

  // Confirm delete execution
  const executeDelete = () => {
    if (!deleteConfirmation) return;
    const { sheet, id } = deleteConfirmation;

    if (sheet === 'toilet') {
      setData((prev) => ({
        ...prev,
        toilets: prev.toilets
          .filter((r) => r.id !== id)
          .map((r, i) => ({ ...r, no: i + 1 })),
      }));
    } else if (sheet === 'lantai') {
      setData((prev) => ({
        ...prev,
        lantai: prev.lantai
          .filter((r) => r.id !== id)
          .map((r, i) => ({ ...r, no: i + 1 })),
      }));
    } else if (sheet === 'pintu') {
      setData((prev) => ({
        ...prev,
        pintuJendela: prev.pintuJendela
          .filter((r) => r.id !== id)
          .map((r, i) => ({ ...r, no: i + 1 })),
      }));
    } else if (sheet === 'atap') {
      setData((prev) => ({
        ...prev,
        atap: prev.atap
          .filter((r) => r.id !== id)
          .map((r, i) => ({ ...r, no: i + 1 })),
      }));
    } else if (sheet === 'plafon') {
      setData((prev) => ({
        ...prev,
        langitLangit: prev.langitLangit
          .filter((r) => r.id !== id)
          .map((r, i) => ({ ...r, no: i + 1 })),
      }));
    }

    setDeleteConfirmation(null);
    pushToast({
      type: 'info',
      title: 'Baris Dihapus',
      message: 'Baris telah berhasil dihapus dari tabel.',
    });
  };

  // Chart theme colors
  const isDark = resolvedTheme === 'dark';
  const barColorPassed = isDark ? '#D2B48C' : '#002147';
  const barColorIssues = isDark ? '#F87171' : '#E11D48';

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      {/* Tabs navigation without 'Sheet' prefix - Responsive 6-column grid in one screen without horizontal scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1.5 sm:gap-2 w-full mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('sheet-1')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-1'
              ? 'bg-[#002147] text-white shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/85 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/40 hover:bg-[#F7F1E7]'
          }`}
        >
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span>Toilet & Sanitasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet-2')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-2'
              ? 'bg-[#002147] text-white shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/85 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/40 hover:bg-[#F7F1E7]'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Lantai RS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet-3')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-3'
              ? 'bg-[#002147] text-white shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/85 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/40 hover:bg-[#F7F1E7]'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Pintu & Jendela RS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet-4')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-4'
              ? 'bg-[#002147] text-white shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/85 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/40 hover:bg-[#F7F1E7]'
          }`}
        >
          <Umbrella className="w-3.5 h-3.5 shrink-0" />
          <span>Atap RS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet-5')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-5'
              ? 'bg-[#002147] text-white shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/85 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/40 hover:bg-[#F7F1E7]'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5 shrink-0" />
          <span>Langit-langit RS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet-ruangan')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-ruangan'
              ? 'bg-[#002147] text-[#D2B48C] shadow-md ring-2 ring-[#D2B48C]'
              : 'bg-white/85 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/40 hover:bg-[#F7F1E7]'
          }`}
        >
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span>74 Ruangan (Inspeksi)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet-6')}
          className={`w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs xl:text-[12.5px] font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheet-6'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
              : 'bg-white/85 dark:bg-[#001835]/80 text-amber-900 dark:text-amber-200 border border-amber-300/60 hover:bg-amber-50 dark:hover:bg-[#002147]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>Rekapan & Analisa</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SHEET 1: TOILET & SANITASI + TOILET DISABILITAS                            */}
      {/* ========================================================================= */}
      {activeTab === 'sheet-1' && (
        <div className="space-y-6">
          {/* Main Table: Toilet Ruangan */}
          <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white flex items-center gap-2">
                  <span>Tabel 1A: Indikator Fasilitas Toilet Rumah Sakit</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5EDE0] text-[#002147] dark:bg-[#002147] dark:text-[#D2B48C]">
                    Tahun {data.year}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Klik langsung pada sel apa pun untuk mengedit nilai. Dilengkapi klasifikasi jenis toilet (Laki-laki, Perempuan, Gabungan L/P) dan catatan inspeksi.
                </p>
              </div>

              <button
                type="button"
                onClick={addToiletRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#001835] transition-all shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Toilet</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40">
                    <th rowSpan={2} className="py-2.5 px-3 font-bold text-center w-12 border-r border-[#D2B48C]/30">No</th>
                    <th rowSpan={2} className="py-2.5 px-3 font-bold w-28 border-r border-[#D2B48C]/30">Bulan</th>
                    <th rowSpan={2} className="py-2.5 px-3 font-bold min-w-[180px] border-r border-[#D2B48C]/30">Indikator</th>
                    <th colSpan={3} className="py-1.5 px-3 font-bold text-center border-r border-[#D2B48C]/30">Jenis</th>
                    <th rowSpan={2} className="py-2.5 px-3 font-bold text-center w-16 border-r border-[#D2B48C]/30">Total</th>
                    <th rowSpan={2} className="py-2.5 px-3 font-bold min-w-[280px]">Keterangan</th>
                    <th rowSpan={2} className="py-2.5 px-2 font-bold text-center w-12">Aksi</th>
                  </tr>
                  <tr className="bg-[#FAF6F0] dark:bg-[#001D3D]/70 text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-center">
                    <th className="py-1.5 px-2 font-bold w-14 border-r border-[#D2B48C]/20">L</th>
                    <th className="py-1.5 px-2 font-bold w-14 border-r border-[#D2B48C]/20">P</th>
                    <th className="py-1.5 px-2 font-bold w-16 border-r border-[#D2B48C]/30">L/P</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/20">
                  {data.toilets.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-[#D2B48C]/20">
                        {row.no}
                      </td>
                      <td className="py-2 px-3 border-r border-[#D2B48C]/20">
                        <input
                          type="text"
                          value={row.bulan}
                          onChange={(e) => updateToiletRow(row.id, 'bulan', e.target.value)}
                          className="w-full bg-transparent px-1.5 py-1 rounded text-slate-800 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 border-r border-[#D2B48C]/20">
                        <input
                          type="text"
                          value={row.indikator}
                          onChange={(e) => updateToiletRow(row.id, 'indikator', e.target.value)}
                          className="w-full bg-transparent px-1.5 py-1 rounded font-bold text-[#002147] dark:text-[#D2B48C] focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center border-r border-[#D2B48C]/20">
                        <input
                          type="number"
                          min="0"
                          value={row.jenisL === 0 ? '' : row.jenisL}
                          placeholder="-"
                          onChange={(e) => updateToiletRow(row.id, 'jenisL', Number(e.target.value) || 0)}
                          className="w-full text-center bg-transparent px-1 py-1 rounded font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-[#001630] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center border-r border-[#D2B48C]/20">
                        <input
                          type="number"
                          min="0"
                          value={row.jenisP === 0 ? '' : row.jenisP}
                          placeholder="-"
                          onChange={(e) => updateToiletRow(row.id, 'jenisP', Number(e.target.value) || 0)}
                          className="w-full text-center bg-transparent px-1 py-1 rounded font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-[#001630] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center border-r border-[#D2B48C]/30">
                        <input
                          type="number"
                          min="0"
                          value={row.jenisLP === 0 ? '' : row.jenisLP}
                          placeholder="-"
                          onChange={(e) => updateToiletRow(row.id, 'jenisLP', Number(e.target.value) || 0)}
                          className="w-full text-center bg-transparent px-1 py-1 rounded font-bold text-[#002147] dark:text-[#D2B48C] focus:bg-white dark:focus:bg-[#001630] outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#002147] dark:text-white border-r border-[#D2B48C]/20 bg-[#FAF6F0]/40 dark:bg-[#001B3B]/40">
                        {row.totalJenis ?? (row.jenisL + row.jenisP + row.jenisLP)}
                      </td>
                      <td className="py-2 px-3">
                        <textarea
                          rows={2}
                          value={row.keterangan}
                          onChange={(e) => updateToiletRow(row.id, 'keterangan', e.target.value)}
                          placeholder="Tulis catatan kondisi toilet, kebersihan, pintu, lampu, dan tisu..."
                          className="w-full bg-transparent px-2 py-1 rounded text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none resize-y"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmation({
                              sheet: 'toilet',
                              id: row.id,
                              label: `${row.indikator} (${row.bulan})`,
                            })
                          }
                          title="Hapus baris ini"
                          className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 1B: Toilet Disabilitas */}
          <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
            <div className="mb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white flex items-center gap-2">
                <span>Tabel 1B: Ketersediaan Toilet Aksesibel Disabilitas</span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Sesuai Lampiran 2
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Checklist ketersediaan fasilitas toilet disabilitas pada zona Rawat Jalan (Rajal), IGD, dan Gedung Penunjang.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40 text-center">
                    <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[180px] border-r border-[#D2B48C]/30">Indikator</th>
                    <th colSpan={2} className="py-1.5 px-3 font-bold border-r border-[#D2B48C]/30">Rajal</th>
                    <th colSpan={2} className="py-1.5 px-3 font-bold border-r border-[#D2B48C]/30">IGD</th>
                    <th colSpan={2} className="py-1.5 px-3 font-bold border-r border-[#D2B48C]/30">Penunjang</th>
                    <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[260px]">Keterangan</th>
                  </tr>
                  <tr className="bg-[#FAF6F0] dark:bg-[#001D3D]/70 text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-center">
                    <th className="py-1.5 px-2 font-bold w-12 border-r border-[#D2B48C]/20">Ad</th>
                    <th className="py-1.5 px-2 font-bold w-12 border-r border-[#D2B48C]/30">Tdk</th>
                    <th className="py-1.5 px-2 font-bold w-12 border-r border-[#D2B48C]/20">Ad</th>
                    <th className="py-1.5 px-2 font-bold w-12 border-r border-[#D2B48C]/30">Tdk</th>
                    <th className="py-1.5 px-2 font-bold w-12 border-r border-[#D2B48C]/20">Ad</th>
                    <th className="py-1.5 px-2 font-bold w-12 border-r border-[#D2B48C]/30">Tdk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white/70 dark:bg-[#001630]/70">
                    <td className="py-3 px-3 font-bold text-[#002147] dark:text-[#D2B48C] border-r border-[#D2B48C]/20">
                      {data.toiletDisabilitas.indikator}
                    </td>

                    {/* Rajal */}
                    <td className="py-2 px-2 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => {
                          updateToiletDisabilitas('rajalAda', true);
                          updateToiletDisabilitas('rajalTidak', false);
                        }}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold transition-all ${
                          data.toiletDisabilitas.rajalAda
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 hover:bg-slate-100 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => {
                          updateToiletDisabilitas('rajalAda', false);
                          updateToiletDisabilitas('rajalTidak', true);
                        }}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold transition-all ${
                          data.toiletDisabilitas.rajalTidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 hover:bg-slate-100 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* IGD */}
                    <td className="py-2 px-2 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => {
                          updateToiletDisabilitas('igdAda', true);
                          updateToiletDisabilitas('igdTidak', false);
                        }}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold transition-all ${
                          data.toiletDisabilitas.igdAda
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 hover:bg-slate-100 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => {
                          updateToiletDisabilitas('igdAda', false);
                          updateToiletDisabilitas('igdTidak', true);
                        }}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold transition-all ${
                          data.toiletDisabilitas.igdTidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 hover:bg-slate-100 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Penunjang */}
                    <td className="py-2 px-2 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => {
                          updateToiletDisabilitas('penunjangAda', true);
                          updateToiletDisabilitas('penunjangTidak', false);
                        }}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold transition-all ${
                          data.toiletDisabilitas.penunjangAda
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 hover:bg-slate-100 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => {
                          updateToiletDisabilitas('penunjangAda', false);
                          updateToiletDisabilitas('penunjangTidak', true);
                        }}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold transition-all ${
                          data.toiletDisabilitas.penunjangTidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 hover:bg-slate-100 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Keterangan */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={data.toiletDisabilitas.keterangan}
                        onChange={(e) => updateToiletDisabilitas('keterangan', e.target.value)}
                        className="w-full bg-transparent px-2 py-1 rounded text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none text-xs"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHEET 2: LANTAI RUMAH SAKIT                                               */}
      {/* ========================================================================= */}
      {activeTab === 'sheet-2' && (
        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white flex items-center gap-2">
                <span>Penilaian Fisik Lantai & Dinding Rumah Sakit</span>
                <span className="text-[11px] font-semibold text-[#002147] dark:text-[#D2B48C] bg-[#F5EDE0] dark:bg-[#002147] px-2 py-0.5 rounded-full border border-[#D2B48C]/40">
                  4 Parameter Utama
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kriteria bahan kedap air, kemiringan saluran pembuangan, sudut konus/lengkung (hospital plinth), dan cat bebas logam berat.
              </p>
            </div>

            <button
              type="button"
              onClick={addLantaiRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#001835] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ruangan / Area</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40 text-center">
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[170px] border-r border-[#D2B48C]/30">Indikator</th>
                  <th colSpan={2} className="py-2 px-2.5 font-bold border-r border-[#D2B48C]/30 text-[11px] max-w-[210px]">
                    1. Lantai terbuat dari bahan kuat, kedap air, rata, tdk licin, warna terang
                  </th>
                  <th colSpan={2} className="py-2 px-2.5 font-bold border-r border-[#D2B48C]/30 text-[11px] max-w-[210px]">
                    2. Kontak air cukup miring ke arah saluran pembuangan limbah
                  </th>
                  <th colSpan={2} className="py-2 px-2.5 font-bold border-r border-[#D2B48C]/30 text-[11px] max-w-[210px]">
                    3. Pertemuan lantai & dinding berbentuk konus/lengkung mudah dibersihkan
                  </th>
                  <th colSpan={2} className="py-2 px-2.5 font-bold border-r border-[#D2B48C]/30 text-[11px] max-w-[210px]">
                    4. Permukaan dinding kuat, warna terang, cat tdk luntur & tdk mengandung logam berat
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[240px]">Keterangan</th>
                  <th rowSpan={2} className="py-2.5 px-2 font-bold text-center w-12">Aksi</th>
                </tr>
                <tr className="bg-[#FAF6F0] dark:bg-[#001D3D]/70 text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-center">
                  <th className="py-1 px-1.5 font-bold w-11 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1.5 font-bold w-11 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1.5 font-bold w-11 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1.5 font-bold w-11 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/30">tidak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2B48C]/20">
                {data.lantai.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-[#002147] dark:text-[#D2B48C] border-r border-[#D2B48C]/20">
                      <input
                        type="text"
                        value={row.indikator}
                        onChange={(e) => updateLantaiRow(row.id, 'indikator', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded font-bold text-[#002147] dark:text-[#D2B48C] focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    {/* Param 1 */}
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 1, true)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param1Ya
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 1, false)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param1Tidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Param 2 */}
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 2, true)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param2Ya
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 2, false)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param2Tidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Param 3 */}
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 3, true)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param3Ya
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 3, false)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param3Tidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Param 4 */}
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 4, true)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param4Ya
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/30">
                      <button
                        type="button"
                        onClick={() => toggleLantaiParam(row.id, 4, false)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param4Tidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Keterangan */}
                    <td className="py-2 px-3">
                      <textarea
                        rows={2}
                        value={row.keterangan}
                        onChange={(e) => updateLantaiRow(row.id, 'keterangan', e.target.value)}
                        placeholder="Catatan kondisi fisik lantai & konus..."
                        className="w-full bg-transparent px-2 py-1 rounded text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none resize-y"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmation({
                            sheet: 'lantai',
                            id: row.id,
                            label: row.indikator,
                          })
                        }
                        title="Hapus baris ini"
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHEET 3: PINTU & JENDELA RUMAH SAKIT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'sheet-3' && (
        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white flex items-center gap-2">
                <span>Penilaian Pintu & Bukaan Jendela Rumah Sakit</span>
                <span className="text-[11px] font-semibold text-[#002147] dark:text-[#D2B48C] bg-[#F5EDE0] dark:bg-[#002147] px-2 py-0.5 rounded-full border border-[#D2B48C]/40">
                  6 Parameter Aksesibilitas
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bukaan brankar minimal 120 cm, tanpa beda tinggi level lantai, pintu KM ranap membuka keluar, pelindung benturan, ventilasi dan pengaman gedung bertingkat.
              </p>
            </div>

            <button
              type="button"
              onClick={addPintuRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#001835] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Unit Evaluasi</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40 text-center">
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[170px] border-r border-[#D2B48C]/30">Indikator</th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[170px]">
                    1. Pintu brankar bukaan min 120 cm & pintu lain min 90 cm
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[160px]">
                    2. Sekitar pintu masuk tdk boleh ada perbedaan ketinggian lantai
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[170px]">
                    3. Pintu kamar mandi ranap & toilet aksesibel terbuka ke luar
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[160px]">
                    4. Pintu akses tempat tidur pasien dilapisi bahan anti benturan
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[170px]">
                    5. Ruang perawatan memiliki bukaan jendela pertukaran udara maksimal
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[170px]">
                    6. Gedung bertingkat lebar bukaan jendela aman pasien jatuh/lari
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[220px]">Keterangan</th>
                  <th rowSpan={2} className="py-2.5 px-2 font-bold text-center w-12">Aksi</th>
                </tr>
                <tr className="bg-[#FAF6F0] dark:bg-[#001D3D]/70 text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-center">
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tdk</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tdk</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tdk</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tdk</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tdk</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tdk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2B48C]/20">
                {data.pintuJendela.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-[#002147] dark:text-[#D2B48C] border-r border-[#D2B48C]/20">
                      <input
                        type="text"
                        value={row.indikator}
                        onChange={(e) => updatePintuRow(row.id, 'indikator', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded font-bold text-[#002147] dark:text-[#D2B48C] focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    {/* Param 1 to 6 */}
                    {[1, 2, 3, 4, 5, 6].map((pIdx) => {
                      const isYa =
                        pIdx === 1 ? row.param1Ya :
                        pIdx === 2 ? row.param2Ya :
                        pIdx === 3 ? row.param3Ya :
                        pIdx === 4 ? row.param4Ya :
                        pIdx === 5 ? row.param5Ya : row.param6Ya;

                      const isTidak =
                        pIdx === 1 ? row.param1Tidak :
                        pIdx === 2 ? row.param2Tidak :
                        pIdx === 3 ? row.param3Tidak :
                        pIdx === 4 ? row.param4Tidak :
                        pIdx === 5 ? row.param5Tidak : row.param6Tidak;

                      return (
                        <React.Fragment key={pIdx}>
                          <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                            <button
                              type="button"
                              onClick={() => togglePintuParam(row.id, pIdx as 1 | 2 | 3 | 4 | 5 | 6, true)}
                              className={`w-5 h-5 mx-auto rounded flex items-center justify-center font-bold text-[11px] ${
                                isYa
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'border border-slate-300 text-transparent hover:bg-slate-100'
                              }`}
                            >
                              ✓
                            </button>
                          </td>
                          <td className="py-2 px-1 text-center border-r border-[#D2B48C]/30">
                            <button
                              type="button"
                              onClick={() => togglePintuParam(row.id, pIdx as 1 | 2 | 3 | 4 | 5 | 6, false)}
                              className={`w-5 h-5 mx-auto rounded flex items-center justify-center font-bold text-[11px] ${
                                isTidak
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'border border-slate-300 text-transparent hover:bg-slate-100'
                              }`}
                            >
                              ✓
                            </button>
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td className="py-2 px-3">
                      <textarea
                        rows={2}
                        value={row.keterangan}
                        onChange={(e) => updatePintuRow(row.id, 'keterangan', e.target.value)}
                        placeholder="Catatan hasil inspeksi pintu & bukaan jendela..."
                        className="w-full bg-transparent px-2 py-1 rounded text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none resize-y"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmation({
                            sheet: 'pintu',
                            id: row.id,
                            label: row.indikator,
                          })
                        }
                        title="Hapus baris ini"
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHEET 4: ATAP RUMAH SAKIT                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'sheet-4' && (
        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white flex items-center gap-2">
                <span>Elemen Penilaian Atap Rumah Sakit</span>
                <span className="text-[11px] font-semibold text-[#002147] dark:text-[#D2B48C] bg-[#F5EDE0] dark:bg-[#002147] px-2 py-0.5 rounded-full border border-[#D2B48C]/40">
                  Struktur & Anti Perindukan Vektor
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kekuatan konstruksi atap, bebas kebocoran, daya tahan, serta pencegahan perindukan serangga, tikus dan binatang pengganggu.
              </p>
            </div>

            <button
              type="button"
              onClick={addAtapRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#001835] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Gedung / Atap</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40 text-center">
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[180px] border-r border-[#D2B48C]/30">Elemen Penilaian</th>
                  <th colSpan={3} className="py-2 px-3 font-bold border-r border-[#D2B48C]/30 text-[11px]">
                    Kuat, tidak bocor, tahan lama dan tidak menjadi tempat perindukan serangga, tikus & binatang pengganggu
                  </th>
                  <th colSpan={3} className="py-2 px-3 font-bold border-r border-[#D2B48C]/30 text-[11px]">
                    Memenuhi sebagian persyaratan di atas
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[200px]">Catatan Tindak Lanjut</th>
                  <th rowSpan={2} className="py-2.5 px-2 font-bold text-center w-12">Aksi</th>
                </tr>
                <tr className="bg-[#FAF6F0] dark:bg-[#001D3D]/70 text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-center">
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/20">tidak</th>
                  <th className="py-1 px-2 font-bold min-w-[160px] border-r border-[#D2B48C]/30 text-left">keterangan</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1.5 font-bold w-12 border-r border-[#D2B48C]/20">tidak</th>
                  <th className="py-1 px-2 font-bold min-w-[160px] border-r border-[#D2B48C]/30 text-left">keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2B48C]/20">
                {data.atap.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-[#002147] dark:text-[#D2B48C] border-r border-[#D2B48C]/20">
                      <input
                        type="text"
                        value={row.indikator}
                        onChange={(e) => updateAtapRow(row.id, 'indikator', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded font-bold text-[#002147] dark:text-[#D2B48C] focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    {/* Param 1 */}
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleAtapParam(row.id, 1, true)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param1Ya
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleAtapParam(row.id, 1, false)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param1Tidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-2 border-r border-[#D2B48C]/30">
                      <input
                        type="text"
                        value={row.param1Ket}
                        onChange={(e) => updateAtapRow(row.id, 'param1Ket', e.target.value)}
                        placeholder="Rincian kondisi fisik atap..."
                        className="w-full bg-transparent px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    {/* Param 2 */}
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleAtapParam(row.id, 2, true)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param2Ya
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                      <button
                        type="button"
                        onClick={() => toggleAtapParam(row.id, 2, false)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs ${
                          row.param2Tidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-300 text-transparent hover:bg-slate-100'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-2 px-2 border-r border-[#D2B48C]/30">
                      <input
                        type="text"
                        value={row.param2Ket}
                        onChange={(e) => updateAtapRow(row.id, 'param2Ket', e.target.value)}
                        placeholder="Catatan pemenuhan parsial..."
                        className="w-full bg-transparent px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    {/* Keterangan */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.keterangan}
                        onChange={(e) => updateAtapRow(row.id, 'keterangan', e.target.value)}
                        placeholder="Rekomendasi teknis atap..."
                        className="w-full bg-transparent px-1.5 py-1 rounded text-[11px] text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmation({
                            sheet: 'atap',
                            id: row.id,
                            label: row.indikator,
                          })
                        }
                        title="Hapus baris ini"
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHEET 5: LANGIT-LANGIT (PLAFON) RUMAH SAKIT                               */}
      {/* ========================================================================= */}
      {activeTab === 'sheet-5' && (
        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white flex items-center gap-2">
                <span>Elemen Penilaian Langit-langit (Plafon) Rumah Sakit</span>
                <span className="text-[11px] font-semibold text-[#002147] dark:text-[#D2B48C] bg-[#F5EDE0] dark:bg-[#002147] px-2 py-0.5 rounded-full border border-[#D2B48C]/40">
                  5 Parameter Penilaian
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kekuatan, bebas bekas genangan bocor/jamur, tinggi ruangan min 2,80m & selasar 2,40m, ruang operasi 3,00m, ketahanan api TKA min 2 jam, dan lampu recessed.
              </p>
            </div>

            <button
              type="button"
              onClick={addLangitRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002147] text-white text-xs font-bold hover:bg-[#001835] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ruangan Evaluasi</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40 text-center">
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[170px] border-r border-[#D2B48C]/30">Elemen Penilaian</th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[200px]">
                    1. Langit2 kuat, terang, mudah dibersihkan, aman, tdk bocor/berjamur
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[180px]">
                    2. Tinggi di ruangan min 2,80 m, selasar (koridor) min 2,40 m
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[170px]">
                    3. Tinggi langit-langit di ruang operasi minimal 3,00 m
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[180px]">
                    4. Ruang OK & ICU, bahan langit-langit tahan api (TKA) min 2 jam
                  </th>
                  <th colSpan={2} className="py-2 px-2 font-bold border-r border-[#D2B48C]/30 text-[10.5px] max-w-[180px]">
                    5. Area kebersihan tinggi, lampu dipasang dibenamkan plafon (recessed)
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 font-bold text-left min-w-[260px]">Keterangan</th>
                  <th rowSpan={2} className="py-2.5 px-2 font-bold text-center w-12">Aksi</th>
                </tr>
                <tr className="bg-[#FAF6F0] dark:bg-[#001D3D]/70 text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-center">
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tidak</th>
                  <th className="py-1 px-1 font-bold w-10 border-r border-[#D2B48C]/20">ya</th>
                  <th className="py-1 px-1 font-bold w-11 border-r border-[#D2B48C]/30">tidak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2B48C]/20">
                {data.langitLangit.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-[#002147] dark:text-[#D2B48C] border-r border-[#D2B48C]/20">
                      <input
                        type="text"
                        value={row.indikator}
                        onChange={(e) => updateLangitRow(row.id, 'indikator', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded font-bold text-[#002147] dark:text-[#D2B48C] focus:bg-white dark:focus:bg-[#001630] outline-none"
                      />
                    </td>

                    {/* Param 1 to 5 */}
                    {[1, 2, 3, 4, 5].map((pIdx) => {
                      const isYa =
                        pIdx === 1 ? row.param1Ya :
                        pIdx === 2 ? row.param2Ya :
                        pIdx === 3 ? row.param3Ya :
                        pIdx === 4 ? row.param4Ya : row.param5Ya;

                      const isTidak =
                        pIdx === 1 ? row.param1Tidak :
                        pIdx === 2 ? row.param2Tidak :
                        pIdx === 3 ? row.param3Tidak :
                        pIdx === 4 ? row.param4Tidak : row.param5Tidak;

                      return (
                        <React.Fragment key={pIdx}>
                          <td className="py-2 px-1 text-center border-r border-[#D2B48C]/20">
                            <button
                              type="button"
                              onClick={() => toggleLangitParam(row.id, pIdx as 1 | 2 | 3 | 4 | 5, true)}
                              className={`w-5 h-5 mx-auto rounded flex items-center justify-center font-bold text-[11px] ${
                                isYa
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'border border-slate-300 text-transparent hover:bg-slate-100'
                              }`}
                            >
                              ✓
                            </button>
                          </td>
                          <td className="py-2 px-1 text-center border-r border-[#D2B48C]/30">
                            <button
                              type="button"
                              onClick={() => toggleLangitParam(row.id, pIdx as 1 | 2 | 3 | 4 | 5, false)}
                              className={`w-5 h-5 mx-auto rounded flex items-center justify-center font-bold text-[11px] ${
                                isTidak
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'border border-slate-300 text-transparent hover:bg-slate-100'
                              }`}
                            >
                              ✓
                            </button>
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td className="py-2 px-3">
                      <textarea
                        rows={2}
                        value={row.keterangan}
                        onChange={(e) => updateLangitRow(row.id, 'keterangan', e.target.value)}
                        placeholder="Catatan kebersihan plafon, rembesan kebocoran, TKA, dsb..."
                        className="w-full bg-transparent px-2 py-1 rounded text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-[#001630] focus:ring-1 focus:ring-[#002147] outline-none resize-y"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmation({
                            sheet: 'plafon',
                            id: row.id,
                            label: row.indikator,
                          })
                        }
                        title="Hapus baris ini"
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHEET 6: REKAPAN DARI 5 SHEET + GRAFIK + ANALISA + REKOMENDASI + RTL      */}
      {/* ========================================================================= */}
      {activeTab === 'sheet-6' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[24px] bg-gradient-to-br from-white/95 to-[#FAF6F0] dark:from-[#001E42]/90 dark:to-[#00152E]/90 border border-[#D2B48C]/50 shadow-sm p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kepatuhan Fisik Keseluruhan
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#002147] dark:text-[#D2B48C] mt-1">
                  {summary.overallCompliance}%
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 inline-block">
                  Standar Permenkes No. 7/2019
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#002147] text-[#D2B48C] flex items-center justify-center font-extrabold text-lg shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-white/95 to-[#FAF6F0] dark:from-[#001E42]/90 dark:to-[#00152E]/90 border border-[#D2B48C]/50 shadow-sm p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Parameter Memenuhi (MS)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  {summary.totalPassed} / {summary.totalChecks}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 inline-block">
                  Dari Seluruh Aspek Sarpras
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-white/95 to-[#FAF6F0] dark:from-[#001E42]/90 dark:to-[#00152E]/90 border border-[#D2B48C]/50 shadow-sm p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Perlu Tindak Lanjut
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                  {summary.totalIssues} Titik
                </div>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 inline-block font-medium">
                  Kebocoran plafon & sanitasi toilet
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-white/95 to-[#FAF6F0] dark:from-[#001E42]/90 dark:to-[#00152E]/90 border border-[#D2B48C]/50 shadow-sm p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status Kelaikan Fasilitas
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-[#002147] dark:text-[#D2B48C] mt-1">
                  LAIK BERSYARAT
                </div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5 inline-block">
                  Prioritas Perbaikan IPSRS & CS
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Table Summary per Aspect */}
          <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
            <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
              <span>Rekapitulasi Kepatuhan Fisik per Aspek Sarana & Prasarana</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40">
                    <th className="py-2.5 px-3 font-bold w-12 text-center">No</th>
                    <th className="py-2.5 px-3 font-bold w-52">Aspek Sarana Prasarana</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Total Uji</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Memenuhi (MS)</th>
                    <th className="py-2.5 px-3 font-bold text-center w-32">% Kepatuhan</th>
                    <th className="py-2.5 px-3 font-bold text-center w-32">Status</th>
                    <th className="py-2.5 px-3 font-bold min-w-[280px]">Highlight Catatan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/20">
                  {summary.aspects.map((aspect, idx) => (
                    <tr
                      key={aspect.sheetId}
                      className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#002147] dark:text-[#D2B48C]">
                        {aspect.name}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300">
                        {aspect.totalChecks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                        {aspect.passedChecks}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-[#002147] dark:bg-[#D2B48C] rounded-full"
                              style={{ width: `${aspect.complianceRate}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-[#002147] dark:text-white">
                            {aspect.complianceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            aspect.status === 'Sangat Baik'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : aspect.status === 'Baik'
                              ? 'bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {aspect.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                        {aspect.highlightIssue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Bar Chart Kepatuhan per Aspek */}
            <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
                <span>Tingkat Kepatuhan per Aspek Sarana & Prasarana</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                Komparasi parameter Memenuhi Standar vs Perlu Perbaikan per sheet
              </p>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.chartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#334155' : '#E2E8F0'}
                    />
                    <XAxis
                      dataKey="aspect"
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      tick={{ fontSize: 10, fill: isDark ? '#CBD5E1' : '#334155' }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: isDark ? '#CBD5E1' : '#334155' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#001835' : '#FFFFFF',
                        borderColor: '#D2B48C',
                        borderRadius: 12,
                        fontSize: 11,
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                    />
                    <Bar
                      dataKey="memenuhi"
                      name="Memenuhi (MS)"
                      fill={barColorPassed}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="belumMemenuhi"
                      name="Belum Memenuhi (TMS)"
                      fill={barColorIssues}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Penilaian Skor Fisik per Zona Rumah Sakit */}
            <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-white mb-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
                <span>Distribusi Skor Kelaikan Fisik per Zona Ruangan RS</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                Indeks persentase pemenuhan baku mutu sarpras per instalasi rumah sakit
              </p>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.zoneData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#334155' : '#E2E8F0'}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: isDark ? '#CBD5E1' : '#334155' }}
                    />
                    <YAxis
                      dataKey="zone"
                      type="category"
                      width={110}
                      tick={{ fontSize: 10, fill: isDark ? '#CBD5E1' : '#334155' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#001835' : '#FFFFFF',
                        borderColor: '#D2B48C',
                        borderRadius: 12,
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="skor" name="Skor Kepatuhan (%)" radius={[0, 6, 6, 0]}>
                      {summary.zoneData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.skor >= 90
                              ? '#10B981'
                              : entry.skor >= 80
                              ? '#002147'
                              : '#E11D48'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Analisa Otomatis & Rekomendasi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Analisa Otomatis */}
            <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-white">
                    Analisa Data Inspeksi Sarana Prasarana
                  </h4>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Sintesis otomatis hasil audit lingkungan fisik
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F1E7]/70 dark:bg-[#002147]/50 border border-[#D2B48C]/35 text-xs text-slate-700 dark:text-slate-200 leading-relaxed text-justify">
                {summary.analysisText}
              </div>
            </div>

            {/* Rekomendasi Teknis */}
            <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-white">
                    Rekomendasi Teknis Sanitarian
                  </h4>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Tindakan preventif & korektif penyehatan fisik RS
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                {summary.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#001B3B]/60 border border-[#D2B48C]/30"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Matriks Rencana Tindak Lanjut (RTL) */}
          <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/50 shadow-sm p-4 sm:p-5 overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-white">
                    Matriks Rencana Tindak Lanjut (RTL) Sarana Prasarana
                  </h4>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Penetapan PIC penanggung jawab dan target waktu penyelesaian
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#D2B48C]/40">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F1E7] dark:bg-[#002147]/80 text-[#002147] dark:text-white border-b border-[#D2B48C]/40">
                    <th className="py-2.5 px-3 font-bold text-center w-12">No</th>
                    <th className="py-2.5 px-3 font-bold w-40">Aspek Sarpras</th>
                    <th className="py-2.5 px-3 font-bold min-w-[220px]">Temuan Masalah</th>
                    <th className="py-2.5 px-3 font-bold min-w-[260px]">Rencana Tindak Lanjut</th>
                    <th className="py-2.5 px-3 font-bold w-36">PIC</th>
                    <th className="py-2.5 px-3 font-bold w-32 text-center">Target Waktu</th>
                    <th className="py-2.5 px-3 font-bold w-24 text-center">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2B48C]/20">
                  {summary.actionPlans.map((plan) => (
                    <tr
                      key={plan.no}
                      className="hover:bg-[#FAF6F0]/70 dark:hover:bg-[#002147]/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {plan.no}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#002147] dark:text-[#D2B48C]">
                        {plan.aspek}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                        {plan.temuanMasalah}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100">
                        {plan.rencanaTindakLanjut}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                        {plan.pic}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">
                        {plan.targetWaktu}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.prioritas === 'Tinggi'
                              ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {plan.prioritas}
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

      {/* Floating Save Button with Jelly Touch Effect */}
            {/* Sanitarian Inspector Signature Block */}
      <section
        aria-label="Pengesahan Sanitarian Inspector Sarpras"
        className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#D2B48C]/50 p-5 shadow-sm text-slate-800 dark:text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 print:block"
      >
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Unit Penanggung Jawab Teknis Kesling
          </p>
          <p className="text-sm font-extrabold text-[#002147] dark:text-[#D2B48C]">
            UOBK RSUD Al-Mulk Kota Sukabumi
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Pemeriksaan Kesehatan Sarana dan Bangunan Rumah Sakit (Permenkes No. 7 Tahun 2019)
          </p>
        </div>

        <div className="text-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-6 min-w-[200px]">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Sanitarian Inspector,
          </p>
          <p className="text-sm font-black text-[#002147] dark:text-[#D2B48C] underline underline-offset-4">
            Fitria Wulandari, AMKL
          </p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            NUP. 20210301P1154
          </p>
        </div>
      </section>

      <FloatingSaveButton onSave={handleSaveData} />

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001228]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#001835] border border-[#D2B48C]/60 shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Hapus Baris
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus data baris:
                <br />
                <span className="font-bold text-[#002147] dark:text-[#D2B48C]">
                  {deleteConfirmation.label}
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
