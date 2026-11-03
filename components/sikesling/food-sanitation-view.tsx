'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Check,
  X,
  Pencil,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { FloatingSaveButton } from '@/components/sikesling/floating-save-button';

export interface FoodSanitationMonthRow {
  no: number;
  monthLabel: string;
  monthShort: string;
  sertifikatJasaBoga: number; // % kepemilikan sertifikat jasa boga golongan B (default 100)
  hasilIklStatus: string; // 'belum memenuhi syarat' | 'memenuhi syarat' (default 'belum memenuhi syarat')
  nilai: number; // % nilai kesehatan dan keamanan proses penghidangan (78, 83, 84)
}

const INITIAL_FOOD_SANITATION_DATA: FoodSanitationMonthRow[] = [
  {
    no: 1,
    monthLabel: 'Januari',
    monthShort: 'Jan',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 78,
  },
  {
    no: 2,
    monthLabel: 'Februari',
    monthShort: 'Feb',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 78,
  },
  {
    no: 3,
    monthLabel: 'Maret',
    monthShort: 'Mar',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 78,
  },
  {
    no: 4,
    monthLabel: 'April',
    monthShort: 'Apr',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 78,
  },
  {
    no: 5,
    monthLabel: 'Mei',
    monthShort: 'Mei',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 78,
  },
  {
    no: 6,
    monthLabel: 'Juni',
    monthShort: 'Jun',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 83,
  },
  {
    no: 7,
    monthLabel: 'Juli',
    monthShort: 'Jul',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 83,
  },
  {
    no: 8,
    monthLabel: 'Agustus',
    monthShort: 'Agu',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 84,
  },
  {
    no: 9,
    monthLabel: 'September',
    monthShort: 'Sep',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 84,
  },
  {
    no: 10,
    monthLabel: 'Oktober',
    monthShort: 'Okt',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 84,
  },
  {
    no: 11,
    monthLabel: 'November',
    monthShort: 'Nov',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 84,
  },
  {
    no: 12,
    monthLabel: 'Desember',
    monthShort: 'Des',
    sertifikatJasaBoga: 100,
    hasilIklStatus: 'belum memenuhi syarat',
    nilai: 84,
  },
];

type PeriodFilter =
  | 'ALL'
  | 'SEM_1'
  | 'SEM_2'
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'M_1'
  | 'M_2'
  | 'M_3'
  | 'M_4'
  | 'M_5'
  | 'M_6'
  | 'M_7'
  | 'M_8'
  | 'M_9'
  | 'M_10'
  | 'M_11'
  | 'M_12';

export function FoodSanitationView() {
  const { resolvedTheme, pushToast, foodRows, updateFoodRows } = useApp();
  const isDark = resolvedTheme === 'dark';
  const meta = resolveRouteMeta('/monitoring/sanitasi-pangan');

  const rows = foodRows as FoodSanitationMonthRow[];
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{
    no: number;
    field: 'sertifikatJasaBoga' | 'hasilIklStatus' | 'nilai';
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const saveRows = (updated: FoodSanitationMonthRow[]) => {
    setHasUnsavedChanges(true);
    void updateFoodRows(updated);
  };

  // Filter rows by selected period
  const visibleRows = useMemo(() => {
    switch (periodFilter) {
      case 'SEM_1':
        return rows.filter((r) => r.no >= 1 && r.no <= 6);
      case 'SEM_2':
        return rows.filter((r) => r.no >= 7 && r.no <= 12);
      case 'Q1':
        return rows.filter((r) => r.no >= 1 && r.no <= 3);
      case 'Q2':
        return rows.filter((r) => r.no >= 4 && r.no <= 6);
      case 'Q3':
        return rows.filter((r) => r.no >= 7 && r.no <= 9);
      case 'Q4':
        return rows.filter((r) => r.no >= 10 && r.no <= 12);
      default:
        if (periodFilter.startsWith('M_')) {
          const monthNo = parseInt(periodFilter.replace('M_', ''), 10);
          return rows.filter((r) => r.no === monthNo);
        }
        return rows;
    }
  }, [rows, periodFilter]);

  // Toggle IKL status directly or edit via input
  const handleToggleIklStatus = (no: number) => {
    const updated = rows.map((r) => {
      if (r.no !== no) return r;
      const nextStatus =
        r.hasilIklStatus.toLowerCase() === 'belum memenuhi syarat'
          ? 'memenuhi syarat'
          : 'belum memenuhi syarat';
      return {
        ...r,
        hasilIklStatus: nextStatus,
      };
    });
    saveRows(updated);
    const target = updated.find((r) => r.no === no);
    if (target) {
      pushToast({
        type: 'success',
        title: 'Status IKL Diperbarui',
        message: `Status IKL bulan ${target.monthLabel} diubah menjadi "${target.hasilIklStatus}".`,
      });
    }
  };

  const startEditCell = (
    no: number,
    field: 'sertifikatJasaBoga' | 'hasilIklStatus' | 'nilai',
    currentValue: string | number
  ) => {
    setEditingCell({ no, field });
    setEditValue(String(currentValue));
  };

  const commitEditCell = () => {
    if (!editingCell) return;
    const { no, field } = editingCell;

    if (field === 'hasilIklStatus') {
      const cleaned = editValue.trim() || 'belum memenuhi syarat';
      const updated = rows.map((r) =>
        r.no === no ? { ...r, hasilIklStatus: cleaned } : r
      );
      saveRows(updated);
      const target = rows.find((r) => r.no === no);
      pushToast({
        type: 'success',
        title: 'Hasil IKL Diperbarui',
        message: `Hasil IKL bulan ${target?.monthLabel ?? ''} berhasil diperbarui.`,
      });
      setEditingCell(null);
      return;
    }

    const normalized = editValue.replace('%', '').replace(',', '.').trim();
    const parsed = parseFloat(normalized);

    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      pushToast({
        type: 'warning',
        title: 'Input Tidak Valid',
        message: 'Masukkan angka persentase yang valid (0 - 100).',
      });
      setEditingCell(null);
      return;
    }

    const updated = rows.map((r) => {
      if (r.no !== no) return r;
      return {
        ...r,
        [field]: parsed,
      };
    });

    saveRows(updated);
    const target = rows.find((r) => r.no === no);
    pushToast({
      type: 'success',
      title: 'Data Higiene Sanitasi Pangan Diperbarui',
      message: `Data ${
        field === 'sertifikatJasaBoga' ? 'Sertifikat Jasa Boga' : 'Nilai'
      } bulan ${target?.monthLabel ?? ''} diperbarui menjadi ${parsed}%.`,
    });
    setEditingCell(null);
  };

  // Summary calculations
  const summaryStats = useMemo(() => {
    const active = visibleRows.length > 0 ? visibleRows : rows;
    const avgNilai =
      Math.round(
        (active.reduce((acc, r) => acc + r.nilai, 0) / active.length) * 10
      ) / 10;
    const avgSertifikat =
      Math.round(
        (active.reduce((acc, r) => acc + r.sertifikatJasaBoga, 0) /
          active.length) *
          10
      ) / 10;

    const minRow = active.reduce(
      (min, r) => (r.nilai < min.nilai ? r : min),
      active[0]
    );
    const maxRow = active.reduce(
      (max, r) => (r.nilai > max.nilai ? r : max),
      active[0]
    );

    const memenuhiCount = active.filter(
      (r) => r.hasilIklStatus.toLowerCase() === 'memenuhi syarat'
    ).length;

    return {
      avgNilai,
      avgSertifikat,
      minRow,
      maxRow,
      memenuhiCount,
      belumMemenuhiCount: active.length - memenuhiCount,
    };
  }, [visibleRows, rows]);

  // Chart 1: Monthly Trend of Nilai & Sertifikat Jasa Boga
  const monthlyChartData = useMemo(() => {
    return visibleRows.map((r) => ({
      name: r.monthShort,
      bulan: r.monthLabel,
      'Nilai Penghidangan (%)': r.nilai,
      'Sertifikat Jasa Boga Gol. B (%)': r.sertifikatJasaBoga,
      'Standar Minimal IKL (80%)': 80,
      statusIkl: r.hasilIklStatus,
    }));
  }, [visibleRows]);

  // Chart 2: Period Progression Summary
  const periodProgressionData = useMemo(() => {
    const janMei = rows.filter((r) => r.no >= 1 && r.no <= 5);
    const junJul = rows.filter((r) => r.no >= 6 && r.no <= 7);
    const aguDes = rows.filter((r) => r.no >= 8 && r.no <= 12);

    const avg = (arr: FoodSanitationMonthRow[]) =>
      arr.length
        ? Math.round(
            (arr.reduce((sum, item) => sum + item.nilai, 0) / arr.length) * 10
          ) / 10
        : 0;

    return [
      {
        periode: 'Jan – Mei',
        nilai: avg(janMei),
        color: '#D2B48C',
      },
      {
        periode: 'Jun – Jul',
        nilai: avg(junJul),
        color: '#0D9488',
      },
      {
        periode: 'Agu – Des',
        nilai: avg(aguDes),
        color: isDark ? '#38BDF8' : '#002147',
      },
      {
        periode: 'Rata-rata Tahunan',
        nilai: summaryStats.avgNilai,
        color: isDark ? '#60A5FA' : '#1C3D63',
      },
    ];
  }, [rows, summaryStats.avgNilai, isDark]);

  return (
    <PageContainer>
      {/* 1. HEADER HALAMAN */}
      <PageHeader
        title="Higiene Sanitasi Pangan"
        description="Pemantauan Kesehatan dan Keamanan Proses Penghidangan, kepemilikan Sertifikat Jasa Boga Golongan B, serta hasil Inspeksi Kesehatan Lingkungan (IKL) di Instalasi Gizi."
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Periode Pilih Tahun */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-food-year" className="sr-only">
                Tahun Pemantauan
              </label>
              <div className="relative">
                <select
                  id="filter-food-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  aria-label="Tahun Pemantauan"
                  className="appearance-none pl-4 pr-8 py-2 rounded-full bg-white/95 dark:bg-[#001835] border border-[#D2B48C]/70 dark:border-slate-700 text-xs font-bold text-[#002147] dark:text-slate-100 shadow-sm hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 transition-all cursor-pointer"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                  <option value={2024}>Tahun 2024</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter Periode */}
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-[#002147] dark:text-[#D2B48C] absolute left-3.5 pointer-events-none" />
              <select
                aria-label="Filter Periode Bulan"
                value={periodFilter}
                onChange={(e) =>
                  setPeriodFilter(e.target.value as PeriodFilter)
                }
                className="appearance-none pl-9 pr-8 py-2 rounded-full bg-white/95 dark:bg-[#001835] border border-[#D2B48C]/70 dark:border-slate-700 text-xs font-bold text-[#002147] dark:text-slate-100 shadow-sm hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 transition-all cursor-pointer"
              >
                <optgroup label="Tahunan">
                  <option value="ALL">
                    1 Tahun Penuh (Januari – Desember)
                  </option>
                </optgroup>
                <optgroup label="Semester">
                  <option value="SEM_1">Semester 1 (Januari – Juni)</option>
                  <option value="SEM_2">Semester 2 (Juli – Desember)</option>
                </optgroup>
                <optgroup label="Triwulan">
                  <option value="Q1">Triwulan I (Jan – Mar)</option>
                  <option value="Q2">Triwulan II (Apr – Jun)</option>
                  <option value="Q3">Triwulan III (Jul – Sep)</option>
                  <option value="Q4">Triwulan IV (Okt – Des)</option>
                </optgroup>
                <optgroup label="Bulanan (Januari – Desember)">
                  {rows.map((r) => (
                    <option key={r.no} value={`M_${r.no}`}>
                      Bulan {r.monthLabel}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        }
      />

      {/* 2. TABEL UTAMA: KESEHATAN DAN KEAMANAN PROSES PENGHIDANGAN */}
      <section
        aria-label="Tabel Kesehatan dan Keamanan Proses Penghidangan"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/20 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Judul Tabel Oxford & Tan Soft Center */}
        <div className="bg-[#002147] dark:bg-[#00152E] border-b border-[#D2B48C]/50 px-4 py-4 flex flex-col items-center justify-center text-center">
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#D2B48C]">
            Kesehatan dan Keamanan Proses Penghidangan
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-14 align-middle">
                  No
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center w-36 align-middle">
                  Bulan
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center align-middle max-w-[260px]">
                  Rumah sakit memiliki sertifikat jasa boga golongan B
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center align-middle max-w-[280px]">
                  Hasil IKL memenuhi syarat jasaboga golongan B
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center w-32 align-middle bg-[#D2B48C]/55 dark:bg-[#001630]">
                  Nilai
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const isEditingSertifikat =
                  editingCell?.no === row.no &&
                  editingCell?.field === 'sertifikatJasaBoga';
                const isEditingIkl =
                  editingCell?.no === row.no &&
                  editingCell?.field === 'hasilIklStatus';
                const isEditingNilai =
                  editingCell?.no === row.no && editingCell?.field === 'nilai';

                return (
                  <tr
                    key={row.no}
                    className="hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Kolom No */}
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-right sm:text-center align-middle font-bold text-[#002147] dark:text-slate-200 bg-white dark:bg-slate-900">
                      {row.no}
                    </td>

                    {/* Kolom Bulan */}
                    <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center align-middle font-semibold text-[#002147] dark:text-slate-100 bg-[#FAF6F0] dark:bg-slate-900/90">
                      {row.monthLabel}
                    </td>

                    {/* Kolom Rumah sakit memiliki sertifikat jasa boga golongan B */}
                    <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center align-middle bg-white dark:bg-slate-900/90">
                      {isEditingSertifikat ? (
                        <div className="inline-flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEditCell();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                            className="w-16 px-2 py-1 text-center text-xs font-bold rounded border border-[#002147] bg-white dark:bg-slate-900 text-[#002147] dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={commitEditCell}
                            className="p-1 rounded bg-[#002147] text-white hover:bg-[#001630] cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCell(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startEditCell(
                              row.no,
                              'sertifikatJasaBoga',
                              row.sertifikatJasaBoga
                            )
                          }
                          className="group inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#F5EDE0] dark:hover:bg-slate-800 transition-colors cursor-pointer font-semibold text-[#002147] dark:text-slate-100"
                          title="Klik untuk mengedit persentase kepemilikan sertifikat jasa boga"
                        >
                          <span>{row.sertifikatJasaBoga}%</span>
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 text-[#002147] transition-opacity" />
                        </button>
                      )}
                    </td>

                    {/* Kolom Hasil IKL memenuhi syarat jasaboga golongan B */}
                    <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center align-middle bg-[#FAF6F0]/70 dark:bg-slate-900/70">
                      {isEditingIkl ? (
                        <div className="inline-flex items-center justify-center gap-1">
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded border border-[#002147] bg-white dark:bg-slate-900 text-[#002147] dark:text-white focus:outline-none"
                          >
                            <option value="belum memenuhi syarat">
                              belum memenuhi syarat
                            </option>
                            <option value="memenuhi syarat">
                              memenuhi syarat
                            </option>
                          </select>
                          <button
                            type="button"
                            onClick={commitEditCell}
                            className="p-1 rounded bg-[#002147] text-white hover:bg-[#001630] cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCell(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleIklStatus(row.no)}
                            className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                              row.hasilIklStatus.toLowerCase() ===
                              'memenuhi syarat'
                                ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 hover:bg-emerald-200/70'
                                : 'text-[#002147] dark:text-slate-100 hover:bg-[#F5EDE0] dark:hover:bg-slate-800'
                            }`}
                            title="Klik untuk mengubah status pemenuhan syarat IKL"
                          >
                            {row.hasilIklStatus}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              startEditCell(
                                row.no,
                                'hasilIklStatus',
                                row.hasilIklStatus
                              )
                            }
                            className="p-1 rounded opacity-50 hover:opacity-100 text-[#002147] dark:text-[#D2B48C] cursor-pointer"
                            title="Pilih status IKL"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Kolom Nilai */}
                    <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center align-middle bg-[#F5EDE0]/85 dark:bg-slate-800/80 font-bold text-[#002147] dark:text-white">
                      {isEditingNilai ? (
                        <div className="inline-flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEditCell();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                            className="w-16 px-2 py-1 text-center text-xs font-bold rounded border border-[#002147] bg-white dark:bg-slate-900 text-[#002147] dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={commitEditCell}
                            className="p-1 rounded bg-[#002147] text-white hover:bg-[#001630] cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCell(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startEditCell(row.no, 'nilai', row.nilai)
                          }
                          className="group inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer font-bold text-[#002147] dark:text-white tabular-nums"
                          title="Klik untuk mengedit Nilai (%)"
                        >
                          <span>{row.nilai}%</span>
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 text-[#002147] transition-opacity" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Baris Rata-rata Capaian */}
              <tr className="bg-[#002147] text-white font-extrabold">
                <td
                  colSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center uppercase tracking-wider text-xs text-[#D2B48C]"
                >
                  Rata-Rata Capaian ({visibleRows.length} Bulan)
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center tabular-nums">
                  {summaryStats.avgSertifikat}%
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center text-xs text-[#EADBC8]">
                  {summaryStats.memenuhiCount > 0
                    ? `${summaryStats.memenuhiCount} Bulan Memenuhi Syarat`
                    : ' Dalam Proses Pemenuhan Standar IKL Golongan B'}
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center tabular-nums text-sm text-[#D2B48C]">
                  {summaryStats.avgNilai}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. VISUALISASI GRAFIK INTERAKTIF */}
      <section
        aria-label="Grafik Kesehatan dan Keamanan Proses Penghidangan"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Grafik 1: Tren Bulanan Nilai Kesehatan & Keamanan Proses Penghidangan */}
        <div className="lg:col-span-7 rounded-[28px] bg-white/95 dark:bg-[#001835]/90 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C] mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Visualisasi Capaian Bulanan</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#002147] dark:text-white">
                Grafik Nilai Kesehatan & Keamanan Proses Penghidangan
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#002147] text-[#D2B48C] self-start sm:self-auto">
              Rata-rata Nilai: {summaryStats.avgNilai}%
            </span>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyChartData}
                margin={{ top: 10, right: 14, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#E2E8F0'}
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: isDark ? '#E2E8F0' : '#002147',
                  }}
                />
                <YAxis
                  domain={[0, 105]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: isDark ? '#E2E8F0' : '#002147',
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #D2B48C',
                    color: isDark ? '#F8FAFC' : '#002147',
                    boxShadow: '0 10px 25px rgba(0,33,71,0.12)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isDark ? '#E2E8F0' : '#002147',
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke={isDark ? '#FBBF24' : '#B8976C'}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Batas Minimal 80%',
                    position: 'insideTopRight',
                    fill: isDark ? '#FBBF24' : '#8C6D46',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Bar
                  dataKey="Nilai Penghidangan (%)"
                  fill={isDark ? '#38BDF8' : '#002147'}
                  radius={[6, 6, 0, 0]}
                  barSize={26}
                >
                  {monthlyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-nilai-${index}`}
                      fill={
                        entry['Nilai Penghidangan (%)'] >= 84
                          ? isDark
                            ? '#38BDF8'
                            : '#002147'
                          : entry['Nilai Penghidangan (%)'] >= 80
                          ? isDark
                            ? '#60A5FA'
                            : '#1C3D63'
                          : isDark
                          ? '#FBBF24'
                          : '#D2B48C'
                      }
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="Sertifikat Jasa Boga Gol. B (%)"
                  stroke={isDark ? '#FBBF24' : '#D2B48C'}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: isDark ? '#FBBF24' : '#002147' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Progres Peningkatan Nilai per Fase/Periode */}
        <div className="lg:col-span-5 rounded-[28px] bg-white/95 dark:bg-[#001835]/90 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C] mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Tren Peningkatan Bertahap</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#002147] dark:text-white">
                Progres Nilai Penghidangan per Periode
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/60 self-start sm:self-auto">
              Sertifikat: {summaryStats.avgSertifikat}%
            </span>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={periodProgressionData}
                layout="vertical"
                margin={{ top: 10, right: 24, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#E2E8F0'}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: isDark ? '#E2E8F0' : '#002147',
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="periode"
                  width={120}
                  tick={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: isDark ? '#E2E8F0' : '#002147',
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Rata-rata Nilai']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #D2B48C',
                    color: isDark ? '#F8FAFC' : '#002147',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="nilai" radius={[0, 8, 8, 0]} barSize={32}>
                  {periodProgressionData.map((entry, index) => (
                    <Cell key={`cell-prog-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. SATU CARD NARASI RESMI: ANALISA, REKOMENDASI, DAN RENCANA TINDAK LANJUT */}
      <section
        aria-label="Analisa Data, Rekomendasi, dan Rencana Tindak Lanjut Higiene Sanitasi Pangan"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-6 sm:p-8 text-slate-900 dark:text-slate-100 space-y-6"
      >
        {/* Analisa */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-black underline underline-offset-4 decoration-2 text-slate-950 dark:text-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 text-justify indent-8">
            Berdasarkan hasil pemantauan Kesehatan dan Keamanan Proses Penghidangan di Instalasi Gizi UOBK RSUD Al-Mulk Kota Sukabumi sepanjang periode pemantauan ({visibleRows.length} bulan), indikator kepemilikan Sertifikat Jasa Boga Golongan B oleh rumah sakit telah terpenuhi sebesar <strong>{summaryStats.avgSertifikat}%</strong> secara konsisten dari bulan Januari hingga Desember. Pada indikator hasil Inspeksi Kesehatan Lingkungan (IKL) jasaboga golongan B, status capaian tercatat masih <em>belum memenuhi syarat</em> secara paripurna karena terdapat beberapa item fisik dan teknis dapur instalasi gizi yang sedang dalam tahap pembenahan bertahap. Meskipun demikian, capaian <strong>Nilai</strong> Kesehatan dan Keamanan Proses Penghidangan menunjukkan tren peningkatan yang sangat positif: pada periode <strong>Januari sampai dengan Mei</strong> nilai berada pada angka <strong>78%</strong>, kemudian meningkat menjadi <strong>83%</strong> pada bulan <strong>Juni dan Juli</strong>, serta kembali mengalami peningkatan menjadi <strong>84%</strong> secara stabil pada periode <strong>Agustus hingga Desember</strong> (dengan rata-rata tahunan sebesar <strong>{summaryStats.avgNilai}%</strong>).
          </p>
        </div>

        {/* Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">1.</span>
              <span className="text-justify">
                Menindaklanjuti item-item temuan pada instrumen Inspeksi Kesehatan Lingkungan (IKL) Jasa Boga Golongan B agar status hasil IKL dapat meningkat dari <em>belum memenuhi syarat</em> menjadi <em>memenuhi syarat</em> sepenuhnya sesuai standar Permenkes No. 2 Tahun 2023.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Mempertahankan dan meningkatkan kualitas penerapan 6 prinsip higiene sanitasi pangan di Instalasi Gizi, mulai dari pemilihan bahan baku, penyimpanan bahan makanan (suhu <em>chiller</em>/<em>freezer</em>), pengolahan, penyimpanan makanan matang, pengangkutan, hingga proses penghidangan ke ruang rawat inap.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Memastikan seluruh penjamah makanan (pramusaji dan juru masak) disiplin menggunakan Alat Pelindung Diri (APD) lengkap seperti celemek, penutup kepala (<em>hairnet</em>), masker, dan sarung tangan <em>food grade</em> saat proses pemorsian dan distribusi makanan pasien.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Melakukan pemeliharaan fasilitas fisik ruang pengolahan dan ruang penghidangan makanan, termasuk kelengkapan kawat kasa anti-serangga, fungsi <em>exhaust hood</em>, pencahayaan ruangan, serta sarana pencucian peralatan makan dengan air hangat dan desinfektan.
              </span>
            </li>
          </ol>
        </div>

        {/* Rencana Tindak Lanjut */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">1.</span>
              <span className="text-justify">
                Melaksanakan inspeksi sanitasi dapur dan proses penghidangan secara rutin setiap bulan bersama Kepala Instalasi Gizi menggunakan formulir baku IKL Jasa Boga Golongan B untuk mengevaluasi perbaikan item temuan.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Melakukan pengambilan dan pengujian sampel makanan (<em>food bank sample</em> 2 x 24 jam), uji kualitas mikrobiologi makanan jadi, serta pemeriksaan usap alat makan (<em>rectal swab</em> penjamah dan <em>swab</em> alat makan) secara berkala.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Melakukan monitoring harian terhadap kebersihan kereta makan tertutup (<em>food trolley</em>) dan ketepatan suhu penghidangan makanan pasien sebelum didistribusikan ke ruang perawatan.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Mengajukan pembaruan verifikasi lapangan IKL Jasa Boga Golongan B bersama Dinas Kesehatan Kota Sukabumi setelah seluruh item perbaikan sarana fisik Instalasi Gizi terpenuhi 100%.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={async () => {
          let nextRows = rows;
          if (editingCell) {
            const { no, field } = editingCell;
            if (field === 'hasilIklStatus') {
              const cleaned = editValue.trim() || 'belum memenuhi syarat';
              nextRows = rows.map((r) =>
                r.no === no ? { ...r, hasilIklStatus: cleaned } : r
              );
            } else {
              const parsed = Math.min(
                100,
                Math.max(0, Number(editValue) || 0)
              );
              nextRows = rows.map((r) =>
                r.no === no ? { ...r, [field]: parsed } : r
              );
            }
            setEditingCell(null);
          }
          await updateFoodRows(nextRows);
          setHasUnsavedChanges(false);
          pushToast({
            type: 'success',
            title: 'Data Higiene Sanitasi Pangan Tersimpan',
            message:
              'Data tabel Higiene Sanitasi Pangan telah disimpan dalam aplikasi dan disinkronkan ke database Supabase.',
          });
        }}
      />
    </PageContainer>
  );
}
