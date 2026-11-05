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
import {
  RadiationChoice,
  RadiationMonitoringRow,
  calculateRadiationRowCapaian,
  calculateRadiationSummary,
  createInitialRadiationMonitoringData,
} from '@/lib/radiation-monitoring';

type PeriodFilter =
  | 'FULL_YEAR'
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

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'FULL_YEAR', label: '1 Tahun Penuh (Januari – Desember)' },
  { value: 'SEM_1', label: 'Semester I (Januari – Juni)' },
  { value: 'SEM_2', label: 'Semester II (Juli – Desember)' },
  { value: 'Q1', label: 'Triwulan I (Jan – Mar)' },
  { value: 'Q2', label: 'Triwulan II (Apr – Jun)' },
  { value: 'Q3', label: 'Triwulan III (Jul – Sep)' },
  { value: 'Q4', label: 'Triwulan IV (Okt – Des)' },
  { value: 'M_1', label: 'Bulan Januari' },
  { value: 'M_2', label: 'Bulan Februari' },
  { value: 'M_3', label: 'Bulan Maret' },
  { value: 'M_4', label: 'Bulan April' },
  { value: 'M_5', label: 'Bulan Mei' },
  { value: 'M_6', label: 'Bulan Juni' },
  { value: 'M_7', label: 'Bulan Juli' },
  { value: 'M_8', label: 'Bulan Agustus' },
  { value: 'M_9', label: 'Bulan September' },
  { value: 'M_10', label: 'Bulan Oktober' },
  { value: 'M_11', label: 'Bulan November' },
  { value: 'M_12', label: 'Bulan Desember' },
];

function getAllowedMonths(period: PeriodFilter): number[] {
  switch (period) {
    case 'FULL_YEAR':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case 'SEM_1':
      return [1, 2, 3, 4, 5, 6];
    case 'SEM_2':
      return [7, 8, 9, 10, 11, 12];
    case 'Q1':
      return [1, 2, 3];
    case 'Q2':
      return [4, 5, 6];
    case 'Q3':
      return [7, 8, 9];
    case 'Q4':
      return [10, 11, 12];
    default: {
      if (period.startsWith('M_')) {
        const m = Number(period.replace('M_', ''));
        return [m];
      }
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
  }
}

export function RadiationMonitoringView() {
  const meta = resolveRouteMeta('/monitoring/pengamanan-radiasi');
  const {
    pushToast,
    radiationRows: contextRadiationRows,
    updateRadiationRows,
    resolvedTheme,
  } = useApp();
  const isDark = resolvedTheme === 'dark';

  const currentRealtimeYear = useMemo(() => String(new Date().getFullYear()), []);
  const [selectedYear, setSelectedYear] = useState<string>(currentRealtimeYear);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('FULL_YEAR');
  const [rows, setRows] = useState<RadiationMonitoringRow[]>(() =>
    contextRadiationRows && contextRadiationRows.length === 12
      ? contextRadiationRows
      : createInitialRadiationMonitoringData()
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (contextRadiationRows && contextRadiationRows.length === 12) {
      setRows(contextRadiationRows);
    }
  }, [contextRadiationRows]);

  // Inline editing state for custom Capaian (%)
  const [editingRowNo, setEditingRowNo] = useState<number | null>(null);
  const [editCapaianValue, setEditCapaianValue] = useState<string>('');

  const allowedMonthNumbers = useMemo(
    () => getAllowedMonths(selectedPeriod),
    [selectedPeriod]
  );

  const visibleRows = useMemo(
    () => rows.filter((r) => allowedMonthNumbers.includes(r.no)),
    [rows, allowedMonthNumbers]
  );

  // Realtime toggle handler for Ya / Tidak cells
  const handleSelectChoice = (
    no: number,
    field: 'izinBapeten' | 'peralatanProteksi' | 'pemantauanPekerja',
    choice: 'ya' | 'tidak'
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.no !== no) return row;
        const nextChoice: RadiationChoice =
          row[field] === choice ? null : choice;
        const updatedRow: RadiationMonitoringRow = {
          ...row,
          [field]: nextChoice,
        };
        updatedRow.capaian = calculateRadiationRowCapaian(
          updatedRow.izinBapeten,
          updatedRow.peralatanProteksi,
          updatedRow.pemantauanPekerja
        );
        return updatedRow;
      })
    );
    setHasUnsavedChanges(true);
  };

  const startEditCapaian = (no: number, currentVal: number) => {
    setEditingRowNo(no);
    setEditCapaianValue(String(currentVal));
  };

  const saveEditCapaian = () => {
    if (editingRowNo === null) return;
    const parsed = Math.min(
      100,
      Math.max(0, Math.round(Number(editCapaianValue) || 0))
    );
    setRows((prev) =>
      prev.map((row) =>
        row.no === editingRowNo ? { ...row, capaian: parsed } : row
      )
    );
    setEditingRowNo(null);
    setHasUnsavedChanges(true);
    pushToast({
      type: 'info',
      title: 'Capaian Diperbarui',
      message: `Nilai capaian bulan ke-${editingRowNo} diperbarui menjadi ${parsed}%. Klik tombol Simpan Data di kanan bawah untuk menyimpan ke Supabase.`,
    });
  };

  // Summary, Analysis, Recommendations, and RTL computed automatically in realtime
  const summaryStats = useMemo(
    () => calculateRadiationSummary(visibleRows),
    [visibleRows]
  );

  // Chart 1: Monthly Capaian Trend
  const monthlyChartData = useMemo(
    () =>
      visibleRows.map((r) => ({
        name: r.monthShort,
        monthFull: r.monthLabel,
        'Capaian Pengamanan Radiasi (%)': r.capaian,
        'Target Standar (%)': 100,
      })),
    [visibleRows]
  );

  // Chart 2: Indicator Compliance Breakdown
  const indicatorChartData = useMemo(
    () => [
      {
        indikator: 'Izin Alat BAPETEN',
        kepatuhan: summaryStats.izinBapetenRate,
        color: isDark ? '#38BDF8' : '#002147',
      },
      {
        indikator: 'Peralatan Proteksi',
        kepatuhan: summaryStats.peralatanProteksiRate,
        color: isDark ? '#60A5FA' : '#1C3D63',
      },
      {
        indikator: 'Pemantauan Pekerja',
        kepatuhan: summaryStats.pemantauanPekerjaRate,
        color: isDark ? '#FBBF24' : '#B8976C',
      },
      {
        indikator: 'Rata-rata Capaian',
        kepatuhan: Math.round(summaryStats.avgCapaian),
        color: isDark ? '#34D399' : '#0D9488',
      },
    ],
    [summaryStats, isDark]
  );

  return (
    <PageContainer>
      {/* 1. HEADER HALAMAN & FILTER PERIODE */}
      <PageHeader
        title={meta.title}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Pilihan Tahun Realtime */}
            <div className="flex items-center gap-1.5 bg-[#F5EDE0] dark:bg-slate-800 border border-[#D2B48C] dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C]" />
              <label
                htmlFor="radiation-year-select"
                className="text-xs font-bold text-[#002147] dark:text-slate-200"
              >
                Tahun:
              </label>
              <select
                id="radiation-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#002147] dark:text-[#D2B48C] focus:outline-none cursor-pointer"
              >
                <option value="2026" className="text-slate-900 bg-white">
                  2026
                </option>
                <option value="2025" className="text-slate-900 bg-white">
                  2025
                </option>
                <option value="2024" className="text-slate-900 bg-white">
                  2024
                </option>
              </select>
            </div>

            {/* Pilihan Filter Periode */}
            <div className="relative flex items-center bg-white dark:bg-slate-800 border border-[#D2B48C] dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-2xs">
              <select
                aria-label="Filter Periode Pengamanan Radiasi"
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(e.target.value as PeriodFilter)
                }
                className="appearance-none bg-transparent pr-6 text-xs font-bold text-[#002147] dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="text-slate-900 bg-white"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        }
      />

      {/* 2. TABEL UTAMA: PENGAMANAN RADIASI (SESUAI GAMBAR REFERENSI) */}
      <section
        aria-label="Tabel Pengamanan Radiasi"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/60 dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Header Tabel Oxford Blue & Tan (Rata Tengah dengan Sub-Judul UOBK RSUD AL-MULK KOTA SUKABUMI) */}
        <div className="bg-[#002147] dark:bg-[#00152E] border-b border-[#D2B48C]/50 px-4 sm:px-6 py-4 text-center">
          <h2 className="text-base sm:text-lg font-extrabold tracking-wider text-[#D2B48C] uppercase">
            PENGAMANAN RADIASI
          </h2>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-white/95 uppercase mt-1">
            UOBK RSUD AL-MULK KOTA SUKABUMI
          </p>
        </div>

        {/* Kontainer Tabel Clean & Elegan */}
        <div className="overflow-x-auto smooth-scroll-container">
          <table className="w-full min-w-[780px] border-collapse text-xs sm:text-sm">
            <thead>
              {/* Baris Header 1 */}
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#F5EDE0]">
                <th
                  rowSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center font-extrabold w-14 align-middle"
                >
                  No
                </th>
                <th
                  rowSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center font-extrabold w-36 align-middle"
                >
                  Bulan
                </th>
                <th
                  colSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-2.5 text-center font-extrabold align-middle leading-snug"
                >
                  Rumah sakit mempunyai izin penggunaan alat dari Badan Pengawas
                  Tenaga Nuklir (BAPETEN)
                </th>
                <th
                  colSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-2.5 text-center font-extrabold align-middle leading-snug"
                >
                  Mempunyai peralatan proteksi radiasi
                </th>
                <th
                  colSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-2.5 text-center font-extrabold align-middle leading-snug"
                >
                  Melakukan pemantauan pekerja radiasi menggunakan alat proteksi
                  diri
                </th>
                <th
                  rowSpan={2}
                  className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-4 py-3 text-center font-extrabold w-28 align-middle"
                >
                  Capaian
                </th>
              </tr>

              {/* Baris Header 2: Sub-kolom ya | tidak */}
              <tr className="bg-[#F7F1E7] dark:bg-[#001A38] text-[#002147] dark:text-[#EADBC8]">
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold w-20 align-middle">
                  ya
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold w-20 align-middle">
                  tidak
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold w-20 align-middle">
                  ya
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold w-20 align-middle">
                  tidak
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold w-20 align-middle">
                  ya
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold w-20 align-middle">
                  tidak
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row, idx) => {
                const isEditingThisRow = editingRowNo === row.no;
                const zebraClass =
                  idx % 2 === 0
                    ? 'bg-white dark:bg-[#001835]'
                    : 'bg-[#FAF6F0]/75 dark:bg-[#00152E]';

                return (
                  <tr
                    key={row.no}
                    className={`${zebraClass} hover:bg-[#F3E9D8]/70 dark:hover:bg-[#002147]/80 transition-colors text-slate-900 dark:text-slate-100`}
                  >
                    {/* No */}
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-center font-bold tabular-nums align-middle">
                      {row.no}
                    </td>

                    {/* Bulan */}
                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-center font-semibold align-middle">
                      {row.monthLabel}
                    </td>

                    {/* Indikator 1: Izin penggunaan alat dari BAPETEN (ya / tidak) */}
                    <td
                      onClick={() =>
                        handleSelectChoice(row.no, 'izinBapeten', 'ya')
                      }
                      className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center align-middle cursor-pointer select-none hover:bg-[#EFE4D2]/70 dark:hover:bg-slate-800 transition-colors"
                      title={`Bulan ${row.monthLabel} - Izin penggunaan alat dari BAPETEN: Ya`}
                    >
                      <button
                        type="button"
                        aria-label={`Izin BAPETEN ${row.monthLabel} Ya`}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                          row.izinBapeten === 'ya'
                            ? 'bg-[#002147] text-[#D2B48C] dark:bg-[#D2B48C] dark:text-[#002147] shadow-2xs'
                            : 'text-transparent hover:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td
                      onClick={() =>
                        handleSelectChoice(row.no, 'izinBapeten', 'tidak')
                      }
                      className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center align-middle cursor-pointer select-none hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title={`Bulan ${row.monthLabel} - Izin penggunaan alat dari BAPETEN: Tidak`}
                    >
                      <button
                        type="button"
                        aria-label={`Izin BAPETEN ${row.monthLabel} Tidak`}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                          row.izinBapeten === 'tidak'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-transparent hover:text-rose-400 border border-transparent hover:border-rose-300 dark:hover:border-rose-700'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Indikator 2: Mempunyai peralatan proteksi radiasi (ya / tidak) */}
                    <td
                      onClick={() =>
                        handleSelectChoice(row.no, 'peralatanProteksi', 'ya')
                      }
                      className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center align-middle cursor-pointer select-none hover:bg-[#EFE4D2]/70 dark:hover:bg-slate-800 transition-colors"
                      title={`Bulan ${row.monthLabel} - Mempunyai peralatan proteksi radiasi: Ya`}
                    >
                      <button
                        type="button"
                        aria-label={`Peralatan Proteksi ${row.monthLabel} Ya`}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                          row.peralatanProteksi === 'ya'
                            ? 'bg-[#002147] text-[#D2B48C] dark:bg-[#D2B48C] dark:text-[#002147] shadow-2xs'
                            : 'text-transparent hover:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td
                      onClick={() =>
                        handleSelectChoice(row.no, 'peralatanProteksi', 'tidak')
                      }
                      className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center align-middle cursor-pointer select-none hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title={`Bulan ${row.monthLabel} - Mempunyai peralatan proteksi radiasi: Tidak`}
                    >
                      <button
                        type="button"
                        aria-label={`Peralatan Proteksi ${row.monthLabel} Tidak`}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                          row.peralatanProteksi === 'tidak'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-transparent hover:text-rose-400 border border-transparent hover:border-rose-300 dark:hover:border-rose-700'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Indikator 3: Melakukan pemantauan pekerja radiasi menggunakan alat proteksi diri (ya / tidak) */}
                    <td
                      onClick={() =>
                        handleSelectChoice(row.no, 'pemantauanPekerja', 'ya')
                      }
                      className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center align-middle cursor-pointer select-none hover:bg-[#EFE4D2]/70 dark:hover:bg-slate-800 transition-colors"
                      title={`Bulan ${row.monthLabel} - Pemantauan pekerja radiasi menggunakan alat proteksi diri: Ya`}
                    >
                      <button
                        type="button"
                        aria-label={`Pemantauan Pekerja Radiasi ${row.monthLabel} Ya`}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                          row.pemantauanPekerja === 'ya'
                            ? 'bg-[#002147] text-[#D2B48C] dark:bg-[#D2B48C] dark:text-[#002147] shadow-2xs'
                            : 'text-transparent hover:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td
                      onClick={() =>
                        handleSelectChoice(row.no, 'pemantauanPekerja', 'tidak')
                      }
                      className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center align-middle cursor-pointer select-none hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title={`Bulan ${row.monthLabel} - Pemantauan pekerja radiasi menggunakan alat proteksi diri: Tidak`}
                    >
                      <button
                        type="button"
                        aria-label={`Pemantauan Pekerja Radiasi ${row.monthLabel} Tidak`}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                          row.pemantauanPekerja === 'tidak'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-transparent hover:text-rose-400 border border-transparent hover:border-rose-300 dark:hover:border-rose-700'
                        }`}
                      >
                        ✓
                      </button>
                    </td>

                    {/* Capaian (%) */}
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center align-middle bg-[#FAF6F0]/90 dark:bg-[#00152B]">
                      {isEditingThisRow ? (
                        <div className="inline-flex items-center gap-1 justify-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editCapaianValue}
                            onChange={(e) =>
                              setEditCapaianValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditCapaian();
                              if (e.key === 'Escape') setEditingRowNo(null);
                            }}
                            autoFocus
                            aria-label={`Input Capaian ${row.monthLabel}`}
                            className="w-16 px-2 py-1 text-xs font-bold text-center rounded border border-[#002147] bg-white text-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={saveEditCapaian}
                            className="p-1 rounded bg-[#002147] text-white hover:bg-[#003166] cursor-pointer"
                            title="Simpan Capaian"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRowNo(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditCapaian(row.no, row.capaian)}
                          className={`group inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-extrabold tabular-nums ${
                            row.capaian >= 100
                              ? 'text-[#002147] dark:text-[#D2B48C] hover:bg-white dark:hover:bg-slate-800'
                              : row.capaian >= 67
                              ? 'text-amber-800 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-800'
                              : 'text-rose-700 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                          title="Klik untuk mengedit persentase Capaian secara manual"
                        >
                          <span>{row.capaian}%</span>
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Baris Rekapitulasi / Rata-Rata */}
              <tr className="bg-[#002147] text-white font-extrabold">
                <td
                  colSpan={2}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center uppercase tracking-wider text-xs text-[#D2B48C]"
                >
                  Total / Rata-Rata ({visibleRows.length} Bulan)
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-2 py-3 text-center tabular-nums text-xs text-[#EADBC8]">
                  {summaryStats.izinBapetenYaCount} Ya
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-2 py-3 text-center tabular-nums text-xs text-rose-200">
                  {summaryStats.izinBapetenTidakCount} Tdk
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-2 py-3 text-center tabular-nums text-xs text-[#EADBC8]">
                  {summaryStats.peralatanProteksiYaCount} Ya
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-2 py-3 text-center tabular-nums text-xs text-rose-200">
                  {summaryStats.peralatanProteksiTidakCount} Tdk
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-2 py-3 text-center tabular-nums text-xs text-[#EADBC8]">
                  {summaryStats.pemantauanPekerjaYaCount} Ya
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-2 py-3 text-center tabular-nums text-xs text-rose-200">
                  {summaryStats.pemantauanPekerjaTidakCount} Tdk
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-center tabular-nums text-sm text-[#D2B48C]">
                  {summaryStats.avgCapaian}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. VISUALISASI GRAFIK INTERAKTIF PENGAMANAN RADIASI */}
      <section
        aria-label="Grafik Capaian Pengamanan Radiasi"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Grafik 1: Tren Capaian Bulanan */}
        <div className="lg:col-span-7 rounded-[28px] bg-white/95 dark:bg-[#001835]/90 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C] mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Visualisasi Capaian Bulanan</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#002147] dark:text-white">
                Grafik Capaian Pengamanan Radiasi ({selectedYear})
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#002147] text-[#D2B48C] self-start sm:self-auto">
              Rata-rata: {summaryStats.avgCapaian}%
            </span>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyChartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 5 }}
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
                  domain={[0, 108]}
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
                  y={100}
                  stroke={isDark ? '#34D399' : '#0D9488'}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Target 100%',
                    position: 'insideTopRight',
                    fill: isDark ? '#34D399' : '#0F766E',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Bar
                  dataKey="Capaian Pengamanan Radiasi (%)"
                  fill={isDark ? '#38BDF8' : '#002147'}
                  radius={[6, 6, 0, 0]}
                  barSize={26}
                >
                  {monthlyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-rad-${index}`}
                      fill={
                        entry['Capaian Pengamanan Radiasi (%)'] >= 100
                          ? isDark
                            ? '#38BDF8'
                            : '#002147'
                          : entry['Capaian Pengamanan Radiasi (%)'] >= 67
                          ? isDark
                            ? '#FBBF24'
                            : '#C69C6D'
                          : isDark
                          ? '#F87171'
                          : '#E11D48'
                      }
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="Capaian Pengamanan Radiasi (%)"
                  stroke={isDark ? '#FBBF24' : '#8C6D46'}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: isDark ? '#FBBF24' : '#002147' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Pemenuhan per Indikator */}
        <div className="lg:col-span-5 rounded-[28px] bg-white/95 dark:bg-[#001835]/90 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C] mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Komparasi Indikator</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#002147] dark:text-white">
                Pemenuhan 3 Indikator Utama Radiasi
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/60 self-start sm:self-auto">
              {visibleRows.length} Bulan Pantau
            </span>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={indicatorChartData}
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
                  dataKey="indikator"
                  width={130}
                  tick={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: isDark ? '#E2E8F0' : '#002147',
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Tingkat Pemenuhan']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #D2B48C',
                    color: isDark ? '#F8FAFC' : '#002147',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="kepatuhan" radius={[0, 8, 8, 0]} barSize={30}>
                  {indicatorChartData.map((entry, index) => (
                    <Cell key={`cell-ind-rad-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. ANALISA, REKOMENDASI, DAN RENCANA TINDAK LANJUT OTOMATIS */}
      <section
        aria-label="Analisa Data, Rekomendasi, dan Rencana Tindak Lanjut Pengamanan Radiasi"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-6 sm:p-8 text-slate-900 dark:text-slate-100 space-y-6"
      >
        {/* Analisa Otomatis */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-black underline underline-offset-4 decoration-2 text-slate-950 dark:text-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 text-justify indent-8">
            {summaryStats.analysisText}
          </p>
        </div>

        {/* Rekomendasi Otomatis */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            {summaryStats.recommendations.map((rec, idx) => (
              <li
                key={`rec-rad-${idx}`}
                className="grid grid-cols-[1.5rem_1fr] items-baseline"
              >
                <span className="font-semibold tabular-nums select-none">
                  {idx + 1}.
                </span>
                <span className="text-justify">{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Rencana Tindak Lanjut Otomatis */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            {summaryStats.followUpPlans.map((plan, idx) => (
              <li
                key={`rtl-rad-${idx}`}
                className="grid grid-cols-[1.5rem_1fr] items-baseline"
              >
                <span className="font-semibold tabular-nums select-none">
                  {idx + 1}.
                </span>
                <span className="text-justify">{plan}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

            {/* Sanitarian Inspector Signature Block */}
      <section
        aria-label="Pengesahan Sanitarian Inspector Radiasi"
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
            Pengamanan Radiasi Rumah Sakit (BAPETEN, Peralatan Proteksi, Pemantauan APD Pekerja)
          </p>
        </div>

        <div className="text-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-6 min-w-[200px]">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Pelaksana Sanitarian,
          </p>
          <p className="text-sm font-black text-[#002147] dark:text-[#D2B48C] underline underline-offset-4">
            Fitria Wulandari, AMKL
          </p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            NUP. 20210301P1154
          </p>
        </div>
      </section>

      {/* Tombol Simpan Data Melayang (Kanan Bawah) */}
      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={async () => {
          const ok = await updateRadiationRows(rows);
          if (ok) {
            setHasUnsavedChanges(false);
            pushToast({
              type: 'success',
              title: 'Data Pengamanan Radiasi Tersimpan',
              message:
                'Seluruh perubahan tabel Pengamanan Radiasi telah disinkronkan secara realtime ke Supabase.',
            });
          }
        }}
      />
    </PageContainer>
  );
}
