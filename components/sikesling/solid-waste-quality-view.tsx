'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  RotateCcw,
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
} from 'recharts';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { FloatingSaveButton } from '@/components/sikesling/floating-save-button';

export interface SolidWasteMonthRow {
  no: number;
  monthUpper: string;
  monthLabel: string;
  monthShort: string;
  // Sheet 1: Indikator Baku Mutu Limbah Padat
  pemilahan: boolean; // Melakukan pemilahan limbah medis dan non medis
  penyimpanan90Hari: boolean; // Memenuhi ketentuan lamanya penyimpanan limbah medis B3 < 90 hari
  tpsBerizin: boolean; // Memiliki TPS B3 yang berizin
  // Sheet 2: Hasil Limbah B3 (Januari - Desember)
  limbahPadat: number;
  limbahTajam: number;
  obatKadaluarsa: number;
  totalOverride?: number | null;
}

const INITIAL_SOLID_WASTE_DATA: SolidWasteMonthRow[] = [
  {
    no: 1,
    monthUpper: 'JANUARI',
    monthLabel: 'Januari',
    monthShort: 'Jan',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 298,
    limbahTajam: 98,
    obatKadaluarsa: 0,
    totalOverride: 396,
  },
  {
    no: 2,
    monthUpper: 'FEBRUARI',
    monthLabel: 'Februari',
    monthShort: 'Feb',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 259,
    limbahTajam: 74,
    obatKadaluarsa: 0,
    totalOverride: 333,
  },
  {
    no: 3,
    monthUpper: 'MARET',
    monthLabel: 'Maret',
    monthShort: 'Mar',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 243,
    limbahTajam: 51,
    obatKadaluarsa: 0,
    totalOverride: 294,
  },
  {
    no: 4,
    monthUpper: 'APRIL',
    monthLabel: 'April',
    monthShort: 'Apr',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 264,
    limbahTajam: 78,
    obatKadaluarsa: 0,
    totalOverride: 342,
  },
  {
    no: 5,
    monthUpper: 'MEI',
    monthLabel: 'Mei',
    monthShort: 'Mei',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 268,
    limbahTajam: 83,
    obatKadaluarsa: 0,
    totalOverride: 351,
  },
  {
    no: 6,
    monthUpper: 'JUNI',
    monthLabel: 'Juni',
    monthShort: 'Jun',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 238,
    limbahTajam: 83,
    obatKadaluarsa: 0,
    totalOverride: 321,
  },
  {
    no: 7,
    monthUpper: 'JULI',
    monthLabel: 'Juli',
    monthShort: 'Jul',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 224,
    limbahTajam: 70,
    obatKadaluarsa: 0,
    totalOverride: 294,
  },
  {
    no: 8,
    monthUpper: 'AGUSTUS',
    monthLabel: 'Agustus',
    monthShort: 'Agu',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 253,
    limbahTajam: 71,
    obatKadaluarsa: 0,
    totalOverride: 324,
  },
  {
    no: 9,
    monthUpper: 'SEPTEMBER',
    monthLabel: 'September',
    monthShort: 'Sep',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 298,
    limbahTajam: 98,
    obatKadaluarsa: 0,
    totalOverride: 396,
  },
  {
    no: 10,
    monthUpper: 'OKTOBER',
    monthLabel: 'Oktober',
    monthShort: 'Okt',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 248,
    limbahTajam: 80,
    obatKadaluarsa: 0,
    totalOverride: 328,
  },
  {
    no: 11,
    monthUpper: 'NOVEMBER',
    monthLabel: 'November',
    monthShort: 'Nov',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 155,
    limbahTajam: 98,
    obatKadaluarsa: 0,
    totalOverride: 253,
  },
  {
    no: 12,
    monthUpper: 'DESEMBER',
    monthLabel: 'Desember',
    monthShort: 'Des',
    pemilahan: true,
    penyimpanan90Hari: true,
    tpsBerizin: true,
    limbahPadat: 217,
    limbahTajam: 103,
    obatKadaluarsa: 85.64,
    totalOverride: 320,
  },
];

function formatNumberID(val: number): string {
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(2).replace('.', ',');
}

function calculateIndicatorScore(row: SolidWasteMonthRow): number {
  const checkedCount =
    (row.pemilahan ? 1 : 0) +
    (row.penyimpanan90Hari ? 1 : 0) +
    (row.tpsBerizin ? 1 : 0);
  return Math.round((checkedCount / 3) * 100);
}

function getRowB3Total(row: SolidWasteMonthRow): number {
  if (typeof row.totalOverride === 'number') {
    return row.totalOverride;
  }
  return Number((row.limbahPadat + row.limbahTajam).toFixed(2));
}

export function SolidWasteQualityView() {
  const meta = resolveRouteMeta('/monitoring/ipal');
  const { resolvedTheme, pushToast, solidWasteRows, updateSolidWasteRows } = useApp();
  const isDark = resolvedTheme === 'dark';

  // Sheet switcher ('sheet1' = Indikator Baku Mutu Limbah Padat, 'sheet2' = Grafik/Tabel Hasil Limbah B3)
  const [activeSheet, setActiveSheet] = useState<'sheet1' | 'sheet2'>('sheet1');

  // Filter periode
  const [selectedPeriod, setSelectedPeriod] = useState<string>('FULL_YEAR');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const rows = solidWasteRows as SolidWasteMonthRow[];
  const setRows = (
    updater:
      | SolidWasteMonthRow[]
      | ((prev: SolidWasteMonthRow[]) => SolidWasteMonthRow[])
  ) => {
    const next = typeof updater === 'function' ? updater(rows) : updater;
    setHasUnsavedChanges(true);
    void updateSolidWasteRows(next);
  };

  // Inline editing state for Sheet 2 numbers
  const [editingCell, setEditingCell] = useState<{
    monthNo: number;
    field: 'limbahPadat' | 'limbahTajam' | 'obatKadaluarsa' | 'total';
  } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Filter rows by selectedPeriod
  const visibleRows = useMemo(() => {
    if (selectedPeriod.startsWith('MONTH_')) {
      const mNo = Number(selectedPeriod.replace('MONTH_', ''));
      return rows.filter((r) => r.no === mNo);
    }
    switch (selectedPeriod) {
      case 'SEMESTER_1':
        return rows.filter((r) => r.no >= 1 && r.no <= 6);
      case 'SEMESTER_2':
        return rows.filter((r) => r.no >= 7 && r.no <= 12);
      case 'TRIWULAN_1':
        return rows.filter((r) => r.no >= 1 && r.no <= 3);
      case 'TRIWULAN_2':
        return rows.filter((r) => r.no >= 4 && r.no <= 6);
      case 'TRIWULAN_3':
        return rows.filter((r) => r.no >= 7 && r.no <= 9);
      case 'TRIWULAN_4':
        return rows.filter((r) => r.no >= 10 && r.no <= 12);
      case 'FULL_YEAR':
      default:
        return rows;
    }
  }, [rows, selectedPeriod]);

  // Toggle √ on Sheet 1
  const handleToggleIndicator = (
    monthNo: number,
    field: 'pemilahan' | 'penyimpanan90Hari' | 'tpsBerizin'
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.no === monthNo ? { ...r, [field]: !r[field] } : r))
    );
  };

  // Start editing cell on Sheet 2
  const handleStartEditB3 = (
    row: SolidWasteMonthRow,
    field: 'limbahPadat' | 'limbahTajam' | 'obatKadaluarsa' | 'total'
  ) => {
    setEditingCell({ monthNo: row.no, field });
    if (field === 'total') {
      setEditingValue(formatNumberID(getRowB3Total(row)));
    } else {
      setEditingValue(formatNumberID(row[field]));
    }
  };

  // Save edited cell on Sheet 2
  const handleSaveEditB3 = () => {
    if (!editingCell) return;
    const normalized = editingValue.trim().replace(',', '.');
    const parsed = Number(normalized);
    if (Number.isNaN(parsed) || parsed < 0) {
      setEditingCell(null);
      return;
    }

    setRows((prev) =>
      prev.map((r) => {
        if (r.no !== editingCell.monthNo) return r;
        if (editingCell.field === 'total') {
          return { ...r, totalOverride: parsed };
        }
        const updated = { ...r, [editingCell.field]: parsed };
        // Automatically recalculate total (Limbah Padat + Limbah Tajam) when Padat or Tajam changes
        if (
          editingCell.field === 'limbahPadat' ||
          editingCell.field === 'limbahTajam'
        ) {
          updated.totalOverride = Number(
            (updated.limbahPadat + updated.limbahTajam).toFixed(2)
          );
        }
        return updated;
      })
    );
    setEditingCell(null);
    pushToast({
      type: 'success',
      title: 'Data Limbah B3 Diperbarui',
      message: 'Nilai timbulan limbah B3 berhasil disimpan.',
    });
  };

  const handleResetDefault = () => {
    setRows(INITIAL_SOLID_WASTE_DATA);
    setEditingCell(null);
    pushToast({
      type: 'info',
      title: 'Data Direset ke Standar Awal',
      message:
        'Tabel Indikator Baku Mutu Limbah Padat & Hasil Limbah B3 dikembalikan sesuai data referensi.',
    });
  };

  // Summary totals for Sheet 2 & Charts & Narrative
  const b3Summary = useMemo(() => {
    const sumPadat = Number(
      visibleRows.reduce((acc, r) => acc + r.limbahPadat, 0).toFixed(2)
    );
    const sumTajam = Number(
      visibleRows.reduce((acc, r) => acc + r.limbahTajam, 0).toFixed(2)
    );
    const sumObat = Number(
      visibleRows.reduce((acc, r) => acc + r.obatKadaluarsa, 0).toFixed(2)
    );
    const sumTotal = Number(
      visibleRows.reduce((acc, r) => acc + getRowB3Total(r), 0).toFixed(2)
    );
    const avgNilai = Math.round(
      visibleRows.reduce((acc, r) => acc + calculateIndicatorScore(r), 0) /
        Math.max(1, visibleRows.length)
    );

    // Peak and lowest month
    let maxRow = visibleRows[0] || INITIAL_SOLID_WASTE_DATA[0];
    let minRow = visibleRows[0] || INITIAL_SOLID_WASTE_DATA[0];
    for (const r of visibleRows) {
      if (getRowB3Total(r) > getRowB3Total(maxRow)) maxRow = r;
      if (getRowB3Total(r) < getRowB3Total(minRow)) minRow = r;
    }

    return {
      sumPadat,
      sumTajam,
      sumObat,
      sumTotal,
      avgNilai,
      maxRow,
      minRow,
    };
  }, [visibleRows]);

  // Chart 1 data: Monthly B3 Waste Breakdown
  const monthlyChartData = useMemo(() => {
    return visibleRows.map((r) => ({
      name: r.monthShort.toUpperCase(),
      fullName: r.monthUpper,
      'Limbah Padat (kg)': r.limbahPadat,
      'Limbah Tajam (kg)': r.limbahTajam,
      'Obat Kadaluarsa (kg)': r.obatKadaluarsa,
      'Total Limbah B3 (kg)': getRowB3Total(r),
      'Nilai Kepatuhan (%)': calculateIndicatorScore(r),
    }));
  }, [visibleRows]);

  // Chart 2 data: Category composition + Indicator compliance
  const categoryCompositionData = useMemo(() => {
    return [
      {
        kategori: 'Limbah Padat',
        jumlah: b3Summary.sumPadat,
        color: '#1D7AFC',
      },
      {
        kategori: 'Limbah Tajam',
        jumlah: b3Summary.sumTajam,
        color: '#0D9488',
      },
      {
        kategori: 'Obat Kadaluarsa',
        jumlah: b3Summary.sumObat,
        color: '#F59E0B',
      },
    ];
  }, [b3Summary]);

  return (
    <PageContainer>
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Monitoring Baku Mutu Limbah Padat"
        description="Pemantauan Indikator Baku Mutu Limbah Padat & Rekapan Timbulan Limbah B3 Rumah Sakit"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Reset Data */}
            <button
              type="button"
              onClick={handleResetDefault}
              title="Kembalikan ke data standar referensi"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/85 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar</span>
            </button>

            {/* Dropdown Filter Periode */}
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-[#002147] dark:text-[#D2B48C] absolute left-3.5 pointer-events-none" />
              <select
                aria-label="Filter Periode Pemantauan Limbah Padat"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-full text-xs sm:text-sm font-bold text-[#002147] dark:text-[#F5EDE0] bg-white/95 dark:bg-slate-900/90 border-[1.5px] border-[#D2B48C] dark:border-[#D2B48C]/40 shadow-xs hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 transition-all cursor-pointer"
              >
                <optgroup label="Tahunan">
                  <option value="FULL_YEAR">
                    1 Tahun Penuh (Januari – Desember)
                  </option>
                </optgroup>
                <optgroup label="Semester">
                  <option value="SEMESTER_1">Semester 1 (Januari – Juni)</option>
                  <option value="SEMESTER_2">
                    Semester 2 (Juli – Desember)
                  </option>
                </optgroup>
                <optgroup label="Triwulan">
                  <option value="TRIWULAN_1">Triwulan I (Jan – Mar)</option>
                  <option value="TRIWULAN_2">Triwulan II (Apr – Jun)</option>
                  <option value="TRIWULAN_3">Triwulan III (Jul – Sep)</option>
                  <option value="TRIWULAN_4">Triwulan IV (Okt – Des)</option>
                </optgroup>
                <optgroup label="Bulanan">
                  {INITIAL_SOLID_WASTE_DATA.map((m) => (
                    <option key={m.no} value={`MONTH_${m.no}`}>
                      Bulan {m.monthLabel}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        }
      />

      {/* 2. TABEL UTAMA DENGAN 2 SHEET SESUAI GAMBAR REFERENSI image_171a8d8c.png */}
      <section
        aria-label="Tabel Monitoring Baku Mutu Limbah Padat"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm border-[1.5px] border-[#E3D1B8] dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Header Tabel dengan Judul Rata Tengah Berwarna Oxford Blue & Tombol 2 Sheet di Kanan Atas */}
        <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 bg-[#002147] dark:bg-slate-800/95 border-b border-[#002147] dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Spacer penyeimbang di sisi kiri agar judul benar-benar rata tengah */}
          <div className="hidden lg:block lg:w-72 shrink-0" aria-hidden="true" />

          {/* Judul Tabel Rata Tengah Berwarna Tan / Krem */}
          <h2 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-[#D2B48C] dark:text-[#D2B48C] uppercase text-center flex-1">
            {activeSheet === 'sheet1'
              ? 'INDIKATOR BAKU MUTU LIMBAH PADAT'
              : 'GRAFIK HASIL LIMBAH B3 DARI JANUARI-DESEMBER'}
          </h2>

          {/* Tombol Tab 2 Sheet di Kanan Atas Sejajar Judul */}
          <div className="w-full sm:w-auto lg:w-72 flex justify-center sm:justify-end shrink-0">
            <div className="inline-flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-900/90 rounded-xl border border-[#D2B48C] dark:border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveSheet('sheet1')}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  activeSheet === 'sheet1'
                    ? 'bg-[#002147] text-white dark:bg-[#D2B48C] dark:text-[#002147] shadow-xs'
                    : 'text-[#002147] dark:text-slate-300 hover:bg-[#F5EDE0] dark:hover:bg-slate-800'
                }`}
              >
                Indikator Baku Mutu
              </button>
              <button
                type="button"
                onClick={() => setActiveSheet('sheet2')}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  activeSheet === 'sheet2'
                    ? 'bg-[#002147] text-white dark:bg-[#D2B48C] dark:text-[#002147] shadow-xs'
                    : 'text-[#002147] dark:text-slate-300 hover:bg-[#F5EDE0] dark:hover:bg-slate-800'
                }`}
              >
                Hasil Limbah B3
              </button>
            </div>
          </div>
        </div>

        {/* SHEET 1: TABEL INDIKATOR BAKU MUTU LIMBAH PADAT */}
        {activeSheet === 'sheet1' ? (
          <div className="overflow-x-auto smooth-scroll-container">
            <table className="w-full min-w-[880px] table-fixed border-collapse text-xs sm:text-sm">
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>

              <thead>
                <tr className="bg-[#EFE4D2] dark:bg-slate-800 text-[#002147] dark:text-[#F5EDE0]">
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-3 text-center align-middle font-extrabold">
                    No
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold">
                    Bulan
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold leading-snug">
                    Melakukan pemilahan limbah medis dan non medis
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold leading-snug">
                    Memenuhi ketentuan lamanya penyimpanan limbah medis B3 &lt; 90 hari
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold leading-snug">
                    Memiliki TPS B3 yang berizin
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2.5 py-3 text-center align-middle font-extrabold">
                    Nilai
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row) => {
                  const score = calculateIndicatorScore(row);
                  return (
                    <tr
                      key={row.no}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* No */}
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-center align-middle tabular-nums font-semibold">
                        {row.no}
                      </td>

                      {/* Bulan */}
                      <td className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-center align-middle font-semibold">
                        {row.monthLabel}
                      </td>

                      {/* Indikator 1: Pemilahan */}
                      <td
                        onClick={() => handleToggleIndicator(row.no, 'pemilahan')}
                        title="Klik untuk mengubah status pemilahan limbah medis dan non medis"
                        className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-center align-middle cursor-pointer select-none hover:bg-[#F5EDE0] dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="font-bold text-[#002147] dark:text-[#D2B48C] text-base">
                          {row.pemilahan ? '√' : ''}
                        </span>
                      </td>

                      {/* Indikator 2: Penyimpanan < 90 hari */}
                      <td
                        onClick={() =>
                          handleToggleIndicator(row.no, 'penyimpanan90Hari')
                        }
                        title="Klik untuk mengubah status penyimpanan limbah medis B3 < 90 hari"
                        className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-center align-middle cursor-pointer select-none hover:bg-[#F5EDE0] dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="font-bold text-[#002147] dark:text-[#D2B48C] text-base">
                          {row.penyimpanan90Hari ? '√' : ''}
                        </span>
                      </td>

                      {/* Indikator 3: TPS B3 Berizin */}
                      <td
                        onClick={() => handleToggleIndicator(row.no, 'tpsBerizin')}
                        title="Klik untuk mengubah status kepemilikan TPS B3 berizin"
                        className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-center align-middle cursor-pointer select-none hover:bg-[#F5EDE0] dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="font-bold text-[#002147] dark:text-[#D2B48C] text-base">
                          {row.tpsBerizin ? '√' : ''}
                        </span>
                      </td>

                      {/* Nilai */}
                      <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2.5 text-center align-middle tabular-nums font-bold text-[#002147] dark:text-white">
                        {score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* SHEET 2: TABEL GRAFIK HASIL LIMBAH B3 DARI JANUARI-DESEMBER */
          <div className="overflow-x-auto smooth-scroll-container">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-xs sm:text-sm">
              <colgroup>
                <col style={{ width: '22%' }} />
                <col style={{ width: '19.5%' }} />
                <col style={{ width: '19.5%' }} />
                <col style={{ width: '19.5%' }} />
                <col style={{ width: '19.5%' }} />
              </colgroup>

              <thead>
                <tr className="bg-[#EFE4D2] dark:bg-slate-800 text-[#002147] dark:text-[#F5EDE0]">
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold uppercase">
                    BULAN
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold uppercase leading-snug">
                    LIMBAH PADAT
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold uppercase leading-snug">
                    LIMBAH TAJAM
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold uppercase leading-snug">
                    OBAT KADALUARSA
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-3 py-3 text-center align-middle font-extrabold uppercase">
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row) => {
                  const rowTotal = getRowB3Total(row);

                  const renderEditableNumberCell = (
                    field:
                      | 'limbahPadat'
                      | 'limbahTajam'
                      | 'obatKadaluarsa'
                      | 'total',
                    displayVal: number,
                    isTotalCol = false
                  ) => {
                    const isEditing =
                      editingCell?.monthNo === row.no &&
                      editingCell?.field === field;

                    if (isEditing) {
                      return (
                        <td
                          key={field}
                          className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 bg-[#FAF6F0] dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditB3();
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-20 px-1.5 py-0.5 text-right text-xs font-bold border border-[#002147] rounded bg-white text-slate-900"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditB3}
                              className="p-0.5 rounded bg-[#002147] text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCell(null)}
                              className="p-0.5 rounded bg-slate-200 text-slate-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={field}
                        onClick={() => handleStartEditB3(row, field)}
                        title="Klik untuk mengedit nilai"
                        className={`border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-right align-middle tabular-nums cursor-pointer group transition-colors ${
                          isTotalCol
                            ? 'bg-[#EFE4D2]/70 dark:bg-slate-800/90 font-bold text-[#002147] dark:text-white hover:bg-[#D2B48C]/40'
                            : 'font-semibold text-slate-800 dark:text-slate-100 hover:bg-[#FAF6F0] dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="inline-flex items-center justify-end gap-1.5 w-full">
                          <span>{formatNumberID(displayVal)}</span>
                          <Pencil className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </td>
                    );
                  };

                  return (
                    <tr
                      key={row.no}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
                    >
                      <td className="border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-left align-middle font-bold uppercase text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0] dark:bg-slate-900">
                        {row.monthUpper}
                      </td>
                      {renderEditableNumberCell('limbahPadat', row.limbahPadat)}
                      {renderEditableNumberCell('limbahTajam', row.limbahTajam)}
                      {renderEditableNumberCell(
                        'obatKadaluarsa',
                        row.obatKadaluarsa
                      )}
                      {renderEditableNumberCell('total', rowTotal, true)}
                    </tr>
                  );
                })}

                {/* Baris TOTAL Bawah Sesuai Gambar Referensi */}
                <tr className="bg-[#DCEBFE] dark:bg-slate-800 text-slate-950 dark:text-white font-black">
                  <td className="border border-slate-400 dark:border-slate-700 px-3.5 py-3 text-left align-middle uppercase tracking-wide text-[#153E75] dark:text-sky-200">
                    TOTAL
                  </td>
                  <td className="border border-slate-400 dark:border-slate-700 px-3.5 py-3 text-right align-middle tabular-nums">
                    {formatNumberID(b3Summary.sumPadat)}
                  </td>
                  <td className="border border-slate-400 dark:border-slate-700 px-3.5 py-3 text-right align-middle tabular-nums">
                    {formatNumberID(b3Summary.sumTajam)}
                  </td>
                  <td className="border border-slate-400 dark:border-slate-700 px-3.5 py-3 text-right align-middle tabular-nums">
                    {formatNumberID(b3Summary.sumObat)}
                  </td>
                  <td className="border border-slate-400 dark:border-slate-700 px-3.5 py-3 text-right align-middle tabular-nums bg-slate-300/80 dark:bg-slate-700">
                    {formatNumberID(b3Summary.sumTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. VISUALISASI GRAFIK INTERAKTIF */}
      <section
        aria-label="Grafik Timbulan Limbah B3 dan Baku Mutu Limbah Padat"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Grafik 1: Grafik Hasil Limbah B3 dari Januari - Desember */}
        <div className="lg:col-span-7 rounded-[28px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1D7AFC] dark:text-sky-400 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Visualisasi Timbulan Bulanan</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Grafik Hasil Limbah B3 dari Januari – Desember
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCEBFE] dark:bg-slate-800 text-[#153E75] dark:text-sky-300 self-start sm:self-auto">
              Total: {formatNumberID(b3Summary.sumTotal)} kg
            </span>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyChartData}
                margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
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
                    fill: isDark ? '#E2E8F0' : '#475569',
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: isDark ? '#E2E8F0' : '#475569',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    boxShadow: '0 10px 25px rgba(15,23,42,0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                />
                <Bar
                  dataKey="Limbah Padat (kg)"
                  fill="#1D7AFC"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="Limbah Tajam (kg)"
                  fill="#0D9488"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="Obat Kadaluarsa (kg)"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Line
                  type="monotone"
                  dataKey="Total Limbah B3 (kg)"
                  stroke={isDark ? '#38BDF8' : '#153E75'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: isDark ? '#38BDF8' : '#153E75' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Komposisi Kategori Limbah B3 & Skor Indikator */}
        <div className="lg:col-span-5 rounded-[28px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Akumulasi Per Kategori</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Komposisi Timbulan Limbah B3 & Kepatuhan
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
              Nilai Baku Mutu: {b3Summary.avgNilai}%
            </span>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryCompositionData}
                layout="vertical"
                margin={{ top: 10, right: 24, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#E2E8F0'}
                />
                <XAxis
                  type="number"
                  tick={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: isDark ? '#E2E8F0' : '#475569',
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="kategori"
                  width={115}
                  tick={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: isDark ? '#E2E8F0' : '#1E293B',
                  }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumberID(Number(value ?? 0))} kg`,
                    'Total Timbulan',
                  ]}
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="jumlah" radius={[0, 8, 8, 0]} barSize={32}>
                  {categoryCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. SATU CARD NARASI RESMI: ANALISA, REKOMENDASI, DAN RENCANA TINDAK LANJUT */}
      <section
        aria-label="Analisa Data, Rekomendasi, dan Rencana Tindak Lanjut Pengelolaan Limbah Padat dan B3"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-6 sm:p-8 text-slate-900 dark:text-slate-100 space-y-6"
      >
        {/* Analisa */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-black underline underline-offset-4 decoration-2 text-slate-950 dark:text-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 text-justify indent-8">
            Berdasarkan hasil pemantauan Indikator Baku Mutu Limbah Padat di UOBK RSUD Al-Mulk Kota Sukabumi sepanjang periode pemantauan ({visibleRows.length} bulan), tingkat kepatuhan pengelolaan limbah padat mencapai rata-rata nilai <strong>{b3Summary.avgNilai}</strong> dari standar maksimal 100. Seluruh indikator utama yang meliputi pemilahan limbah medis dan non-medis di sumber penghasil, pemenuhan ketentuan batas waktu penyimpanan limbah medis B3 kurang dari 90 hari, serta kepemilikan Tempat Penyimpanan Sementara (TPS) Limbah B3 yang berizin telah terpenuhi secara konsisten sesuai Peraturan Menteri Kesehatan No. 2 Tahun 2023 dan Peraturan Menteri LHK No. P.56/Menlhk-Setjen/2015. Adapun berdasarkan rekapitulasi timbulan Limbah B3, total akumulasi limbah tercatat sebesar <strong>{formatNumberID(b3Summary.sumTotal)} kg</strong> yang terdiri dari Limbah Padat sebesar <strong>{formatNumberID(b3Summary.sumPadat)} kg</strong>, Limbah Tajam (<em>sharps</em>) sebesar <strong>{formatNumberID(b3Summary.sumTajam)} kg</strong>, serta Obat Kadaluarsa sebesar <strong>{formatNumberID(b3Summary.sumObat)} kg</strong>. Volume timbulan tertinggi tercatat pada bulan <strong>{b3Summary.maxRow.monthLabel}</strong> ({formatNumberID(getRowB3Total(b3Summary.maxRow))} kg) dan terendah pada bulan <strong>{b3Summary.minRow.monthLabel}</strong> ({formatNumberID(getRowB3Total(b3Summary.minRow))} kg).
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
                Mempertahankan kedisiplinan pemilahan limbah medis infeksius (kantong kuning), limbah benda tajam (<em>safety box</em>), dan limbah domestik non-medis (kantong hitam) pada seluruh ruangan pelayanan.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Menjaga jadwal pengangkutan limbah B3 bersama pihak ketiga pengangkut dan pengolah berizin secara berkala agar durasi penyimpanan di TPS B3 senantiasa berada jauh di bawah ambang batas maksimal 90 hari.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Melakukan koordinasi berkala dengan Instalasi Farmasi terkait inventarisasi sediaan farmasi mendekati masa kedaluwarsa (<em>near-expired</em>) guna meminimalkan timbulan limbah obat kadaluarsa pada akhir tahun.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Memastikan fasilitas timbangan digital, <em>cold storage</em>/pendingin limbah medis, serta kelengkapan simbol dan label B3 di TPS B3 selalu dalam kondisi laik fungsi dan terkalibrasi.
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
                Melaksanakan supervisi harian ke unit penghasil limbah (IGD, Rawat Inap, IBS, Laboratorium, dan Poliklinik) untuk memantau kepatuhan pemilahan serta penggantian <em>safety box</em> setelah terisi 3/4 penuh.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Melakukan pencatatan neraca limbah B3 harian pada <em>logbook</em> TPS B3 dan memverifikasi dokumen manifes elektronik (Festronik) setiap kali dilakukan pengangkutan oleh mitra pengolah berizin.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Melaksanakan prosedur berita acara pemusnahan/penyerahan khusus bersama Instalasi Farmasi untuk pengelolaan stok obat kadaluarsa sesuai regulasi BPOM dan Kementerian LHK.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Melaporkan rekapitulasi neraca timbulan limbah padat dan B3 secara berkala setiap triwulan dan semester kepada manajemen rumah sakit serta instansi lingkungan hidup terkait.
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
            const parsed = Math.max(
              0,
              parseFloat(editingValue.replace(',', '.')) || 0
            );
            nextRows = rows.map((r) => {
              if (r.no !== editingCell.monthNo) return r;
              if (editingCell.field === 'limbahPadat') {
                return { ...r, limbahPadat: parsed, totalOverride: null };
              }
              if (editingCell.field === 'limbahTajam') {
                return { ...r, limbahTajam: parsed, totalOverride: null };
              }
              if (editingCell.field === 'obatKadaluarsa') {
                return { ...r, obatKadaluarsa: parsed };
              }
              if (editingCell.field === 'total') {
                return { ...r, totalOverride: parsed };
              }
              return r;
            });
            setEditingCell(null);
          }
          await updateSolidWasteRows(nextRows);
          setHasUnsavedChanges(false);
          pushToast({
            type: 'success',
            title: 'Data Monitoring Limbah Padat Tersimpan',
            message:
              'Data tabel Monitoring Baku Mutu Limbah Padat & B3 telah disimpan dalam aplikasi dan disinkronkan ke database Supabase.',
          });
        }}
      />
    </PageContainer>
  );
}
