'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  Check,
  Pencil,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';

export type VectorPeriodFilter =
  | 'FULL_YEAR'
  | 'SEMESTER_1'
  | 'SEMESTER_2'
  | 'TRIWULAN_1'
  | 'TRIWULAN_2'
  | 'TRIWULAN_3'
  | 'TRIWULAN_4'
  | 'MONTH_1'
  | 'MONTH_2'
  | 'MONTH_3'
  | 'MONTH_4'
  | 'MONTH_5'
  | 'MONTH_6'
  | 'MONTH_7'
  | 'MONTH_8'
  | 'MONTH_9'
  | 'MONTH_10'
  | 'MONTH_11'
  | 'MONTH_12';

export type VectorIndicatorKey =
  | 'jentik'
  | 'aedes'
  | 'mhdCulex'
  | 'larvaCulex'
  | 'pinjal'
  | 'lalat'
  | 'kecoa'
  | 'tikus';

export interface VectorIndicatorSpec {
  key: VectorIndicatorKey;
  label: string;
  shortLabel: string;
  standardText: string;
}

export const VECTOR_INDICATORS: VectorIndicatorSpec[] = [
  {
    key: 'jentik',
    label: 'angka bebas jentik <95',
    shortLabel: 'Bebas Jentik',
    standardText: 'ABJ ≥ 95%',
  },
  {
    key: 'aedes',
    label: 'angka resting rate aedes aegypti <0,025',
    shortLabel: 'Resting Rate Aedes',
    standardText: '< 0,025',
  },
  {
    key: 'mhdCulex',
    label: 'angka man Hour Density Culex <1',
    shortLabel: 'MHD Culex',
    standardText: '< 1',
  },
  {
    key: 'larvaCulex',
    label: 'angka larva culex <5',
    shortLabel: 'Larva Culex',
    standardText: '< 5',
  },
  {
    key: 'pinjal',
    label: 'Pinjal <1',
    shortLabel: 'Pinjal',
    standardText: '< 1',
  },
  {
    key: 'lalat',
    label: 'Lalat <8',
    shortLabel: 'Lalat',
    standardText: '< 8 ekor',
  },
  {
    key: 'kecoa',
    label: 'Kecoa <2',
    shortLabel: 'Kecoa',
    standardText: '< 2 ekor',
  },
  {
    key: 'tikus',
    label: 'Angka kepadatan binatang pembawa penyakit, angka success trap tikus <1',
    shortLabel: 'Success Trap Tikus',
    standardText: '< 1%',
  },
];

export const VECTOR_MONTHS = [
  { no: 1, name: 'JANUARI', short: 'Jan' },
  { no: 2, name: 'FEBRUARI', short: 'Feb' },
  { no: 3, name: 'MARET', short: 'Mar' },
  { no: 4, name: 'APRIL', short: 'Apr' },
  { no: 5, name: 'MEI', short: 'Mei' },
  { no: 6, name: 'JUNI', short: 'Jun' },
  { no: 7, name: 'JULI', short: 'Jul' },
  { no: 8, name: 'AGUSTUS', short: 'Agu' },
  { no: 9, name: 'SEPTEMBER', short: 'Sep' },
  { no: 10, name: 'OKTOBER', short: 'Okt' },
  { no: 11, name: 'NOVEMBER', short: 'Nov' },
  { no: 12, name: 'DESEMBER', short: 'Des' },
];

export const DEFAULT_VECTOR_UNITS: string[] = [
  'IGD',
  'RAJAL',
  'RANAP KHODIJAH',
  'RANAP AISYAH',
  'RANAP USMAN',
  'RANAP FATIMAH',
  'CSSD',
  'ICU',
  'OK / IBS',
  'RADIOLOGI',
  'FARMASI',
  'RM',
  'LABORATORIUM',
  'MANAJEMEN',
  'POS SATPAM (SEPTIC TANK DEPAN)',
  'GUDANG FARMASI',
  'KOPRASI',
  'RUANGAN AMBULAN',
  'IPAL',
  'PANTRY',
];

// Map of monthNumber -> unitIndex (0..19) -> Record<VectorIndicatorKey, boolean>
// true means a checkmark (✓) is present in that cell (temuan vektor / tidak memenuhi syarat di unit tsb)
export type VectorFindingsMap = Record<
  number,
  Record<number, Partial<Record<VectorIndicatorKey, boolean>>>
>;

const STORAGE_FINDINGS_KEY = 'sikesling_vector_findings_v1';
const STORAGE_UNITS_KEY = 'sikesling_vector_units_v1';

export function createInitialVectorFindings(): VectorFindingsMap {
  const map: VectorFindingsMap = {};

  for (let m = 1; m <= 12; m++) {
    map[m] = {};
  }

  // JANUARI (Sesuai persis dengan gambar referensi image_f6ccf9b6.png)
  // Unit 5 (index 4): RANAP USMAN -> jentik ✓
  map[1][4] = { jentik: true };
  // Unit 14 (index 13): MANAJEMEN -> lalat ✓, kecoa ✓
  map[1][13] = { lalat: true, kecoa: true };
  // Unit 15 (index 14): POS SATPAM (SEPTIC TANK DEPAN) -> jentik ✓, lalat ✓, kecoa ✓
  map[1][14] = { jentik: true, lalat: true, kecoa: true };
  // Unit 16 (index 15): GUDANG FARMASI -> lalat ✓, kecoa ✓
  map[1][15] = { lalat: true, kecoa: true };
  // Unit 18 (index 17): RUANGAN AMBULAN -> lalat ✓, kecoa ✓
  map[1][17] = { lalat: true, kecoa: true };
  // Unit 19 (index 18): IPAL -> jentik ✓, lalat ✓, kecoa ✓
  map[1][18] = { jentik: true, lalat: true, kecoa: true };
  // Hasil Januari:
  // jentik: 3/20 temuan -> 85% bebas
  // aedes, mhdCulex, larvaCulex, pinjal, tikus: 0/20 -> 100%
  // lalat: 5/20 temuan -> 75% bebas
  // kecoa: 5/20 temuan -> 75% bebas
  // Kumulatif Januari: (85+100+100+100+100+75+75+100)/8 = 91.875% -> 92%

  // FEBRUARI (Sesuai gambar referensi image_f6ccf9b6.png)
  // Unit 1 (index 0): IGD -> kecoa ✓
  map[2][0] = { kecoa: true };
  // Unit 6 (index 5): RANAP FATIMAH -> jentik ✓
  map[2][5] = { jentik: true };
  // Unit 8 (index 7): ICU -> jentik ✓
  map[2][7] = { jentik: true };
  // Unit 15 (index 14): POS SATPAM -> lalat ✓, kecoa ✓
  map[2][14] = { lalat: true, kecoa: true };
  // Unit 19 (index 18): IPAL -> lalat ✓, kecoa ✓
  map[2][18] = { lalat: true, kecoa: true };

  // MARET
  map[3][14] = { jentik: true, lalat: true };
  map[3][18] = { lalat: true, kecoa: true };
  map[3][19] = { lalat: true, kecoa: true };

  // APRIL
  map[4][4] = { jentik: true };
  map[4][14] = { lalat: true };
  map[4][18] = { jentik: true, lalat: true, kecoa: true };

  // MEI
  map[5][14] = { lalat: true, kecoa: true };
  map[5][18] = { lalat: true, kecoa: true };

  // JUNI
  map[6][14] = { jentik: true };
  map[6][18] = { lalat: true, kecoa: true };
  map[6][19] = { kecoa: true };

  // JULI
  map[7][14] = { lalat: true };
  map[7][18] = { lalat: true, kecoa: true };

  // AGUSTUS
  map[8][15] = { kecoa: true };
  map[8][18] = { lalat: true, kecoa: true };

  // SEPTEMBER
  map[9][14] = { jentik: true, lalat: true };
  map[9][18] = { lalat: true };

  // OKTOBER
  map[10][14] = { jentik: true };
  map[10][18] = { lalat: true, kecoa: true };

  // NOVEMBER
  map[11][14] = { jentik: true, lalat: true };
  map[11][18] = { jentik: true, lalat: true, kecoa: true };

  // DESEMBER
  map[12][14] = { lalat: true };
  map[12][18] = { lalat: true, kecoa: true };

  return map;
}

export function calculateMonthVectorSummary(
  monthFindings: Record<number, Partial<Record<VectorIndicatorKey, boolean>>> | undefined,
  totalUnits: number
) {
  const safeTotal = Math.max(1, totalUnits);
  const indicatorPercentages: Record<VectorIndicatorKey, number> = {
    jentik: 100,
    aedes: 100,
    mhdCulex: 100,
    larvaCulex: 100,
    pinjal: 100,
    lalat: 100,
    kecoa: 100,
    tikus: 100,
  };

  let sumPct = 0;

  VECTOR_INDICATORS.forEach((ind) => {
    let positiveCount = 0;
    if (monthFindings) {
      for (let u = 0; u < totalUnits; u++) {
        if (monthFindings[u]?.[ind.key]) {
          positiveCount++;
        }
      }
    }
    const freeCount = Math.max(0, totalUnits - positiveCount);
    const pct = Math.round((freeCount / safeTotal) * 100);
    indicatorPercentages[ind.key] = pct;
    sumPct += pct;
  });

  const cumulative = Math.round(sumPct / VECTOR_INDICATORS.length);

  return {
    indicatorPercentages,
    cumulative,
  };
}

export function VectorControlView() {
  const meta = resolveRouteMeta('/monitoring/vektor');
  const { pushToast } = useApp();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriod, setSelectedPeriod] = useState<VectorPeriodFilter>('FULL_YEAR');
  const [activeSheet, setActiveSheet] = useState<'sheet1' | 'sheet2'>('sheet1');
  const [chartType, setChartType] = useState<'monthly' | 'indicator'>('monthly');

  // Daftar nama unit
  const [units, setUnits] = useState<string[]>(DEFAULT_VECTOR_UNITS);

  // Data checklist vektor per bulan dan unit
  const [findings, setFindings] = useState<VectorFindingsMap>(() =>
    createInitialVectorFindings()
  );
  const [storageHydrated, setStorageHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedUnits = localStorage.getItem(STORAGE_UNITS_KEY);
        if (savedUnits) {
          const parsedUnits = JSON.parse(savedUnits);
          if (Array.isArray(parsedUnits) && parsedUnits.length > 0) {
            setUnits(parsedUnits);
          }
        }
        const savedFindings = localStorage.getItem(STORAGE_FINDINGS_KEY);
        if (savedFindings) {
          const parsedFindings = JSON.parse(savedFindings);
          if (parsedFindings && typeof parsedFindings === 'object') {
            setFindings(parsedFindings);
          }
        }
      } catch {
        // ignore
      }
      setStorageHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Persist changes
  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(STORAGE_UNITS_KEY, JSON.stringify(units));
      window.dispatchEvent(new Event('sikesling-monitoring-updated'));
    } catch {
      // ignore
    }
  }, [units, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    try {
      localStorage.setItem(STORAGE_FINDINGS_KEY, JSON.stringify(findings));
      window.dispatchEvent(new Event('sikesling-monitoring-updated'));
    } catch {
      // ignore
    }
  }, [findings, storageHydrated]);

  // Inline edit unit name state
  const [editingUnitIdx, setEditingUnitIdx] = useState<number | null>(null);
  const [editingUnitValue, setEditingUnitValue] = useState<string>('');

  // Modal tambah unit baru
  const [isAddUnitOpen, setIsAddUnitOpen] = useState<boolean>(false);
  const [newUnitName, setNewUnitName] = useState<string>('');

  // Filter visible months based on selectedPeriod
  const visibleMonths = useMemo(() => {
    if (selectedPeriod.startsWith('MONTH_')) {
      const mNo = Number(selectedPeriod.replace('MONTH_', ''));
      return VECTOR_MONTHS.filter((m) => m.no === mNo);
    }
    switch (selectedPeriod) {
      case 'SEMESTER_1':
        return VECTOR_MONTHS.filter((m) => m.no >= 1 && m.no <= 6);
      case 'SEMESTER_2':
        return VECTOR_MONTHS.filter((m) => m.no >= 7 && m.no <= 12);
      case 'TRIWULAN_1':
        return VECTOR_MONTHS.filter((m) => m.no >= 1 && m.no <= 3);
      case 'TRIWULAN_2':
        return VECTOR_MONTHS.filter((m) => m.no >= 4 && m.no <= 6);
      case 'TRIWULAN_3':
        return VECTOR_MONTHS.filter((m) => m.no >= 7 && m.no <= 9);
      case 'TRIWULAN_4':
        return VECTOR_MONTHS.filter((m) => m.no >= 10 && m.no <= 12);
      case 'FULL_YEAR':
      default:
        return VECTOR_MONTHS;
    }
  }, [selectedPeriod]);

  // Toggle checkmark (✓) on cell click
  const handleToggleCell = (monthNo: number, unitIdx: number, indicatorKey: VectorIndicatorKey) => {
    setFindings((prev) => {
      const monthData = { ...(prev[monthNo] || {}) };
      const unitData = { ...(monthData[unitIdx] || {}) };
      const nextVal = !unitData[indicatorKey];

      if (nextVal) {
        unitData[indicatorKey] = true;
      } else {
        delete unitData[indicatorKey];
      }

      monthData[unitIdx] = unitData;
      return {
        ...prev,
        [monthNo]: monthData,
      };
    });
  };

  // Save edited unit name
  const handleSaveUnitName = (idx: number) => {
    const trimmed = editingUnitValue.trim().toUpperCase();
    if (!trimmed) {
      setEditingUnitIdx(null);
      return;
    }
    setUnits((prev) => prev.map((u, i) => (i === idx ? trimmed : u)));
    setEditingUnitIdx(null);
    pushToast({
      type: 'success',
      title: 'Nama Unit Diperbarui',
      message: `Nama ruangan/unit berhasil diubah menjadi "${trimmed}".`,
    });
  };

  // Add new unit
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUnitName.trim().toUpperCase();
    if (!trimmed) return;
    setUnits((prev) => [...prev, trimmed]);
    setNewUnitName('');
    setIsAddUnitOpen(false);
    pushToast({
      type: 'success',
      title: 'Unit Berhasil Ditambahkan',
      message: `Unit "${trimmed}" telah ditambahkan ke seluruh bulan pemantauan.`,
    });
  };

  // Reset to default reference image data
  const handleResetDefault = () => {
    setUnits(DEFAULT_VECTOR_UNITS);
    setFindings(createInitialVectorFindings());
    pushToast({
      type: 'info',
      title: 'Data Direset ke Standar Awal',
      message: 'Tabel dikembalikan sesuai data referensi awal RSUD Al-Mulk.',
    });
  };

  // Monthly summaries for charts and Sheet 2
  const monthlySummaries = useMemo(() => {
    return VECTOR_MONTHS.map((m) => {
      const summary = calculateMonthVectorSummary(findings[m.no], units.length);
      return {
        monthNo: m.no,
        monthName: m.name,
        monthShort: m.short,
        ...summary,
      };
    });
  }, [findings, units.length]);

  const filteredMonthlyChartData = useMemo(() => {
    const allowedNos = new Set(visibleMonths.map((m) => m.no));
    return monthlySummaries
      .filter((s) => allowedNos.has(s.monthNo))
      .map((s) => ({
        name: s.monthShort,
        fullName: s.monthName,
        'Capaian Kumulatif (%)': s.cumulative,
        'Bebas Jentik (%)': s.indicatorPercentages.jentik,
        'Bebas Lalat (%)': s.indicatorPercentages.lalat,
        'Bebas Kecoa (%)': s.indicatorPercentages.kecoa,
        'Bebas Tikus (%)': s.indicatorPercentages.tikus,
      }));
  }, [monthlySummaries, visibleMonths]);

  const indicatorAverageChartData = useMemo(() => {
    const allowedNos = new Set(visibleMonths.map((m) => m.no));
    const activeMonths = monthlySummaries.filter((s) => allowedNos.has(s.monthNo));
    const count = Math.max(1, activeMonths.length);

    return VECTOR_INDICATORS.map((ind) => {
      const avg = Math.round(
        activeMonths.reduce((acc, cur) => acc + cur.indicatorPercentages[ind.key], 0) / count
      );
      return {
        name: ind.shortLabel,
        'Rata-rata Bebas Vektor (%)': avg,
      };
    });
  }, [monthlySummaries, visibleMonths]);

  // Aggregate overall cumulative for narrative
  const overallStats = useMemo(() => {
    const allowedNos = new Set(visibleMonths.map((m) => m.no));
    const active = monthlySummaries.filter((s) => allowedNos.has(s.monthNo));
    const count = Math.max(1, active.length);
    const avgCumulative = Math.round(active.reduce((a, b) => a + b.cumulative, 0) / count);
    const avgJentik = Math.round(
      active.reduce((a, b) => a + b.indicatorPercentages.jentik, 0) / count
    );
    const avgLalat = Math.round(
      active.reduce((a, b) => a + b.indicatorPercentages.lalat, 0) / count
    );
    const avgKecoa = Math.round(
      active.reduce((a, b) => a + b.indicatorPercentages.kecoa, 0) / count
    );
    return { avgCumulative, avgJentik, avgLalat, avgKecoa };
  }, [monthlySummaries, visibleMonths]);

  return (
    <PageContainer>
      {/* 1. PAGE HEADER DENGAN DROPDOWN PERIODE DI KANAN SEJAJAR JUDUL */}
      <PageHeader
        title="Pengendalian Vektor & Binatang Pengganggu"
        description="Pemantauan Indikator Ruangan Bebas Vektor dan Binatang Pembawa Penyakit"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Tambah Unit */}
            <button
              type="button"
              onClick={() => setIsAddUnitOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white bg-[#153E75] hover:bg-[#10315E] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Unit</span>
            </button>

            {/* Tombol Periode Tahun */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-vector-year" className="sr-only">
                Tahun Pemantauan
              </label>
              <div className="relative">
                <select
                  id="filter-vector-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  aria-label="Tahun Pemantauan"
                  className="appearance-none pl-3.5 pr-8 py-2 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs hover:border-[#1D7AFC] focus:outline-none focus:ring-2 focus:ring-[#1D7AFC] cursor-pointer transition-all"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tombol Periode (Bulan Januari-Desember, Triwulan, Semester, Tahunan) */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-vector-period" className="sr-only">
                Rentang Periode
              </label>
              <div className="relative">
                <select
                  id="filter-vector-period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as VectorPeriodFilter)}
                  aria-label="Rentang Periode Pemantauan"
                  className="appearance-none pl-8 pr-8 py-2 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-900/90 text-[#002147] dark:text-[#F5EDE0] border border-[#D2B48C] dark:border-slate-700 shadow-xs hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer transition-all"
                >
                  <optgroup label="Tahunan">
                    <option value="FULL_YEAR">1 Tahun Penuh (Januari – Desember)</option>
                  </optgroup>
                  <optgroup label="Semester">
                    <option value="SEMESTER_1">Semester 1 (Januari – Juni)</option>
                    <option value="SEMESTER_2">Semester 2 (Juli – Desember)</option>
                  </optgroup>
                  <optgroup label="Triwulan">
                    <option value="TRIWULAN_1">Triwulan I (Jan – Mar)</option>
                    <option value="TRIWULAN_2">Triwulan II (Apr – Jun)</option>
                    <option value="TRIWULAN_3">Triwulan III (Jul – Sep)</option>
                    <option value="TRIWULAN_4">Triwulan IV (Okt – Des)</option>
                  </optgroup>
                  <optgroup label="Bulanan">
                    {VECTOR_MONTHS.map((m) => (
                      <option key={m.no} value={`MONTH_${m.no}` as VectorPeriodFilter}>
                        Bulan {m.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <Calendar className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        }
      />

      {/* 2. TABEL RUANGAN BEBAS VEKTOR DAN BINATANG PENGGANGGU (SESUAI GAMBAR REFERENSI) */}
      <section
        aria-label="Tabel Ruangan Bebas Vektor dan Binatang Pengganggu"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm border-[1.5px] border-[#E3D1B8] dark:border-white/15 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Table Header dengan Judul Rata Tengah Berwarna Oxford Blue & Tombol Sheet di Kanan Atas */}
        <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 bg-[#002147] dark:bg-slate-800/95 border-b border-[#002147] dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Spacer penyeimbang di sisi kiri agar judul benar-benar rata tengah */}
          <div className="hidden lg:block lg:w-64 shrink-0" aria-hidden="true" />

          {/* Judul Tabel Rata Tengah Berwarna Tan / Krem */}
          <h2 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-[#D2B48C] dark:text-[#D2B48C] uppercase text-center flex-1">
            RUANGAN BEBAS VEKTOR DAN BINATANG PENGGANGGU
          </h2>

          {/* Tombol Tab Sheet di Kanan Atas Sejajar Judul */}
          <div className="w-full sm:w-auto lg:w-64 flex justify-center sm:justify-end shrink-0">
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
                Input Data
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
                Rekapan Data
              </button>
            </div>
          </div>
        </div>

        {/* Sheet 1: Tabel Rinci Per Unit & Bulan dengan Kolom Ceklist Sama Rata & Header Krem/Tan */}
        {activeSheet === 'sheet1' ? (
          <div className="overflow-x-auto max-h-[780px] overflow-y-auto smooth-scroll-container">
            <table className="w-full min-w-[1140px] table-fixed border-collapse text-xs">
              <colgroup>
                <col style={{ width: '7.6%' }} />
                <col style={{ width: '3.6%' }} />
                <col style={{ width: '14.4%' }} />
                {VECTOR_INDICATORS.map((ind) => (
                  <col key={ind.key} style={{ width: '8.3%' }} />
                ))}
                <col style={{ width: '8.0%' }} />
              </colgroup>

              <thead className="sticky top-0 z-20 shadow-xs">
                {/* Baris 1 Header */}
                <tr className="bg-[#EFE4D2] dark:bg-slate-800 text-[#002147] dark:text-[#F5EDE0]">
                  <th
                    rowSpan={2}
                    className="border border-[#C9B393] dark:border-slate-700 bg-[#EFE4D2] dark:bg-slate-800 px-2 py-2.5 text-center align-middle font-extrabold"
                  >
                    Bulan
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-[#C9B393] dark:border-slate-700 bg-[#EFE4D2] dark:bg-slate-800 px-1.5 py-2.5 text-center align-middle font-extrabold"
                  >
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-[#C9B393] dark:border-slate-700 bg-[#EFE4D2] dark:bg-slate-800 px-2.5 py-2.5 text-center align-middle font-extrabold"
                  >
                    Unit
                  </th>
                  <th
                    colSpan={8}
                    className="border border-[#C9B393] dark:border-slate-700 bg-[#EFE4D2] dark:bg-slate-800 px-3 py-2 text-center align-middle font-extrabold tracking-wide"
                  >
                    Indikator Vektor dan Binatang Pengganggu
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-[#C9B393] dark:border-slate-700 bg-[#EFE4D2] dark:bg-slate-800 px-2 py-2.5 text-center align-middle font-extrabold uppercase leading-snug"
                  >
                    CAPAIAN KUMULATIF
                  </th>
                </tr>

                {/* Baris 2 Sub-Header Indikator (Lebar Kolom Sama Rata & Rata Tengah) */}
                <tr className="bg-[#FAF6F0] dark:bg-slate-800/90 text-[#002147] dark:text-[#F5EDE0]">
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    angka bebas jentik &lt;95
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    angka resting rate aedes aegypti &lt;0,025
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    angka man Hour Density Culex &lt;1
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    angka larva culex &lt;5
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    Pinjal &lt;1
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    Lalat &lt;8
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    Kecoa &lt;2
                  </th>
                  <th className="border border-[#C9B393] dark:border-slate-700 px-2 py-2.5 text-center align-middle font-semibold leading-snug">
                    Angka kepadatan binatang pembawa penyakit, angka success trap tikus &lt;1
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleMonths.map((month) => {
                  const monthSummary = calculateMonthVectorSummary(findings[month.no], units.length);

                  return (
                    <React.Fragment key={month.no}>
                      {units.map((unitName, uIdx) => {
                        const unitRowFindings = findings[month.no]?.[uIdx] || {};

                        return (
                          <tr
                            key={`${month.no}-${uIdx}`}
                            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-[#F5F9FF] dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {/* Kolom Bulan (Paling Pertama, RowSpan sepanjang jumlah unit) */}
                            {uIdx === 0 && (
                              <td
                                rowSpan={units.length}
                                className="border border-slate-300 dark:border-slate-700 px-2 py-3 text-center align-top font-extrabold uppercase tracking-wide text-[#153E75] dark:text-sky-200 bg-[#F8FBFF] dark:bg-slate-900"
                              >
                                {month.name}
                              </td>
                            )}

                            {/* Kolom No (1 s.d 20) */}
                            <td className="border border-slate-300 dark:border-slate-700 px-1.5 py-1.5 text-center align-middle tabular-nums font-semibold text-slate-600 dark:text-slate-300">
                              {uIdx + 1}
                            </td>

                            {/* Kolom Unit (Bisa diklik untuk edit nama unit) */}
                            <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-left align-middle font-semibold text-slate-800 dark:text-slate-100 group break-words leading-snug">
                              {editingUnitIdx === uIdx ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingUnitValue}
                                    onChange={(e) => setEditingUnitValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveUnitName(uIdx);
                                      if (e.key === 'Escape') setEditingUnitIdx(null);
                                    }}
                                    className="w-full px-1.5 py-0.5 text-xs font-bold border border-[#153E75] rounded bg-white text-slate-900"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveUnitName(uIdx)}
                                    className="p-0.5 rounded bg-[#153E75] text-white shrink-0"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingUnitIdx(null)}
                                    className="p-0.5 rounded bg-slate-200 text-slate-700 shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    onClick={() => {
                                      setEditingUnitIdx(uIdx);
                                      setEditingUnitValue(unitName);
                                    }}
                                    className="cursor-pointer hover:text-[#153E75] dark:hover:text-sky-300"
                                    title="Klik untuk mengedit nama unit"
                                  >
                                    {unitName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUnitIdx(uIdx);
                                      setEditingUnitValue(unitName);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-[#153E75] transition-opacity shrink-0"
                                    title="Edit nama unit"
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* 8 Kolom Indikator Vektor (Lebar Sama Rata, Klik untuk toggle tanda ✓) */}
                            {VECTOR_INDICATORS.map((ind) => {
                              const isChecked = Boolean(unitRowFindings[ind.key]);
                              return (
                                <td
                                  key={ind.key}
                                  onClick={() => handleToggleCell(month.no, uIdx, ind.key)}
                                  title={`Klik untuk mengubah status ${ind.shortLabel} pada ${unitName} (${month.name})`}
                                  className={`border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-center align-middle cursor-pointer select-none transition-colors ${
                                    isChecked
                                      ? 'bg-[#EBF4FF] dark:bg-sky-950/40 text-[#153E75] dark:text-sky-300 font-black text-sm'
                                      : 'hover:bg-[#F0F7FF] dark:hover:bg-slate-800/70 text-transparent'
                                  }`}
                                >
                                  {isChecked ? '✓' : '·'}
                                </td>
                              );
                            })}

                            {/* Kolom Capaian Kumulatif per baris unit dikosongkan sesuai gambar referensi */}
                            <td className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-center align-middle bg-slate-50/40 dark:bg-slate-900/40" />
                          </tr>
                        );
                      })}

                      {/* Baris Kuning Rekap Persentase Bulanan */}
                      <tr className="bg-[#FFF200] text-slate-950 font-extrabold">
                        <td className="border border-slate-400 px-1.5 py-2" />
                        <td className="border border-slate-400 px-2 py-2" />
                        <td className="border border-slate-400 px-2.5 py-2 text-right text-[11px] uppercase tracking-wider" />
                        {VECTOR_INDICATORS.map((ind) => (
                          <td
                            key={ind.key}
                            className="border border-slate-400 px-2 py-2 text-center align-middle tabular-nums"
                          >
                            {monthSummary.indicatorPercentages[ind.key]}%
                          </td>
                        ))}
                        <td className="border border-slate-400 px-2 py-2 text-center align-middle tabular-nums font-black">
                          {monthSummary.cumulative}%
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Sheet 2: Rekapan Data Matriks 12 Bulan */
          <div className="overflow-x-auto max-h-[780px] overflow-y-auto smooth-scroll-container">
            <table className="w-full min-w-[960px] border-collapse text-xs">
              <thead className="sticky top-0 z-20 shadow-xs">
                <tr className="bg-[#D6E8FF] dark:bg-slate-800 text-[#153E75] dark:text-sky-100">
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#D6E8FF] dark:bg-slate-800 px-3 py-2.5 text-center align-middle font-extrabold w-10">
                    No
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#D6E8FF] dark:bg-slate-800 px-3 py-2.5 text-center align-middle font-extrabold min-w-[220px]">
                    Indikator Vektor dan Binatang Pengganggu
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#D6E8FF] dark:bg-slate-800 px-2 py-2.5 text-center align-middle font-extrabold w-24">
                    Baku Mutu
                  </th>
                  {VECTOR_MONTHS.map((m) => (
                    <th
                      key={m.no}
                      className="border border-slate-400 dark:border-slate-700 bg-[#E6F1FF] dark:bg-slate-800/90 px-2 py-2.5 text-center align-middle font-extrabold w-16"
                    >
                      {m.short.toUpperCase()}
                    </th>
                  ))}
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#C2DEFF] dark:bg-slate-700 px-2.5 py-2.5 text-center align-middle font-black w-20">
                    RATA-RATA
                  </th>
                </tr>
              </thead>
              <tbody>
                {VECTOR_INDICATORS.map((ind, idx) => {
                  const vals = monthlySummaries.map((s) => s.indicatorPercentages[ind.key]);
                  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

                  return (
                    <tr
                      key={ind.key}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      <td className="border border-slate-800 dark:border-slate-700 px-2 py-2 text-center font-bold tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-800 dark:border-slate-700 px-3 py-2 font-semibold">
                        {ind.label}
                      </td>
                      <td className="border border-slate-800 dark:border-slate-700 px-2 py-2 text-center font-medium text-slate-600 dark:text-slate-300">
                        {ind.standardText}
                      </td>
                      {vals.map((v, mIdx) => (
                        <td
                          key={mIdx}
                          className={`border border-slate-800 dark:border-slate-700 px-2 py-2 text-center font-bold tabular-nums ${
                            v < 85
                              ? 'bg-[#FDE047] text-slate-950'
                              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {v}%
                        </td>
                      ))}
                      <td className="border border-slate-800 dark:border-slate-700 bg-sky-50 dark:bg-slate-800 px-2 py-2 text-center font-black tabular-nums text-[#153E75] dark:text-sky-300">
                        {avg}%
                      </td>
                    </tr>
                  );
                })}

                {/* Baris Kumulatif Tahunan */}
                <tr className="bg-[#FFFF00] text-slate-950 font-black">
                  <td colSpan={3} className="border border-slate-800 px-3 py-2 text-right uppercase">
                    CAPAIAN KUMULATIF BULANAN (%)
                  </td>
                  {monthlySummaries.map((s) => (
                    <td
                      key={s.monthNo}
                      className="border border-slate-800 px-2 py-2 text-center tabular-nums"
                    >
                      {s.cumulative}%
                    </td>
                  ))}
                  <td className="border border-slate-800 bg-[#00B0F0] px-2 py-2 text-center tabular-nums">
                    {Math.round(
                      monthlySummaries.reduce((a, b) => a + b.cumulative, 0) /
                        monthlySummaries.length
                    )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Legend Bar di Bawah Tabel */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#E2E8F0]/90 dark:bg-slate-800/90 border-t-2 border-slate-800 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Keterangan Tabel (Klik sel untuk memberi/menghapus tanda ✓):
            </span>
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer"
              title="Kembalikan data ke standar awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Awal</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-300 dark:border-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span>Sel Kosong: Bebas Vektor (MS)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-slate-800 text-[#153E75] dark:text-sky-300 font-bold border border-blue-300 dark:border-slate-700 shadow-xs">
              <span>✓ : Ditemukan Indikasi Vektor pada Unit</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFFF00] text-slate-950 font-extrabold border border-amber-500 shadow-xs">
              <span>Baris Kuning: % Capaian Bebas Vektor & Kumulatif</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. GRAFIK REALTIME CAPAIAN RUANGAN BEBAS VEKTOR */}
      <section
        aria-label="Visualisasi Grafik Pengendalian Vektor"
        className="rounded-[28px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 p-4 sm:p-5 shadow-[0_14px_38px_rgba(21,62,117,0.08)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#153E75] dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Visualisasi Grafik Realtime</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Grafik Capaian Ruangan Bebas Vektor & Binatang Pengganggu ({selectedYear})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Terhubung langsung secara otomatis dengan perubahan tanda ceklis (✓) pada tabel di atas
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-[#153E75] dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tren Kumulatif Bulanan
            </button>
            <button
              type="button"
              onClick={() => setChartType('indicator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'indicator'
                  ? 'bg-white dark:bg-slate-900 text-[#153E75] dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Perbandingan 8 Indikator
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'monthly' ? (
              <LineChart
                data={filteredMonthlyChartData}
                margin={{ top: 10, right: 15, left: -10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip
                  formatter={(value) => [`${value ?? 0}%`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine
                  y={95}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  label={{ value: 'Target 95%', position: 'insideTopRight', fill: '#10B981', fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="Capaian Kumulatif (%)"
                  stroke="#153E75"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Bebas Jentik (%)"
                  stroke="#0284C7"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Bebas Lalat (%)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="Bebas Kecoa (%)"
                  stroke="#DC2626"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </LineChart>
            ) : (
              <BarChart
                data={indicatorAverageChartData}
                margin={{ top: 10, right: 15, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip
                  formatter={(value) => [`${value ?? 0}%`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar
                  dataKey="Rata-rata Bebas Vektor (%)"
                  fill="#1D7AFC"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. ANALISA DATA, REKOMENDASI & RENCANA TINDAK LANJUT (1 CARD RESMI SESUAI FORMAT) */}
      <section
        aria-label="Analisa Data, Rekomendasi dan Rencana Tindak Lanjut"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 p-6 sm:p-8 shadow-[0_14px_38px_rgba(21,62,117,0.08)] space-y-6"
      >
        {/* Bagian Analisa Data */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed text-justify indent-6 sm:indent-8 font-normal">
            Berdasarkan hasil survei dan pemantauan kepadatan vektor serta binatang pembawa penyakit pada {units.length} unit/ruangan di UOBK RSUD Al-Mulk sepanjang periode tahun {selectedYear}, rata-rata capaian kumulatif ruangan bebas vektor mencapai {overallStats.avgCumulative}%. Parameter utama seperti <em>resting rate Aedes aegypti</em> (&lt; 0,025), <em>Man Hour Density (MHD) Culex</em> (&lt; 1), angka larva <em>Culex</em> (&lt; 5), kepadatan pinjal (&lt; 1), serta <em>success trap</em> tikus (&lt; 1) secara konsisten mencapai kepatuhan 100% memenuhi syarat baku mutu. Sementara itu, pada indikator Angka Bebas Jentik (ABJ rata-rata {overallStats.avgJentik}%), indeks populasi lalat ({overallStats.avgLalat}%), dan indeks kecoa ({overallStats.avgKecoa}%) masih ditemukan aktivitas vektor di beberapa titik area terbuka/penunjang seperti Pos Satpam (Septic Tank Depan), area IPAL, Gudang Farmasi, Ruangan Ambulan, serta ruang Manajemen. Kondisi tersebut berkaitan erat dengan adanya genangan air hujan pada kontainer luar ruangan serta akses celah saluran drainase pada area penunjang.
          </p>
        </div>

        {/* Bagian Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li>
              Melaksanakan gerakan Pemberantasan Sarang Nyamuk (PSN 3M Plus) dan penaburan bubuk larvasida (<em>abatisasi</em>) secara berkala pada bak kontrol, saluran air sekitar Pos Satpam, area IPAL, dan taman rumah sakit.
            </li>
            <li>
              Melakukan aplikasi <em>residual spraying</em> dan pemasangan <em>gel baiting</em> kecoa pada jalur perpipaan, celah lemari penyimpanan di Gudang Farmasi, Manajemen, serta garasi Ambulan.
            </li>
            <li>
              Mengoptimalkan pengoperasian unit perangkap lalat elektrik (<em>insect killer / fly catcher</em>) dan menutup rapat tempat penampungan sampah domestik maupun saluran <em>floor drain</em> dengan kawat kasa anti-serangga.
            </li>
            <li>
              Melanjutkan kerja sama pengendalian vektor dan hama terpadu (<em>Integrated Pest Management</em>) dengan pihak ketiga berizin resmi secara rutin setiap bulan.
            </li>
          </ol>
        </div>

        {/* Bagian Rencana Tindak Lanjut */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li>
              Melakukan inspeksi survei jentik dan pemantauan perangkap vektor mingguan pada seluruh 20 unit pelayanan dan penunjang oleh tim Sanitarian RSUD Al-Mulk.
            </li>
            <li>
              Menutup celah fisik bangunan (<em>pest proofing</em>) dan memperbaiki penutup <em>septic tank</em> depan serta bak kontrol IPAL agar tidak menjadi tempat perkembangbiakan nyamuk dan kecoa.
            </li>
            <li>
              Melaksanakan tindakan <em>fogging</em> fokus atau <em>ULV cold fogging</em> di area luar gedung apabila ditemukan penurunan Angka Bebas Jentik di bawah ambang baku mutu 95%.
            </li>
            <li>
              Menyusun dan mengevaluasi laporan bulanan capaian ruangan bebas vektor sebagai bahan evaluasi mutu komite PPI dan pelaporan kesehatan lingkungan ke Dinas Kesehatan Kota Sukabumi.
            </li>
          </ol>
        </div>
      </section>

      {/* 5. MODAL TAMBAH UNIT BARU */}
      {isAddUnitOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Tambah Unit Pemantauan Vektor
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUnitOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Unit / Ruangan
                </label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Contoh: INSTALASI GIZI / LAUNDRY / TPS B3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold uppercase"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153E75] hover:bg-[#10315E] text-white font-bold shadow-sm cursor-pointer"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
