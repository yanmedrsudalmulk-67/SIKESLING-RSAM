'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Droplets,
  Calendar,
  Filter,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  SlidersHorizontal,
  Edit3,
  RotateCcw,
  ArrowUpRight,
  Check,
  Building2,
  ClipboardCheck,
  ChevronDown,
  FileSpreadsheet,
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
import { FloatingSaveButton } from '@/components/sikesling/floating-save-button';
import {
  WaterQualityRow,
  WaterSourceName,
  WaterIndicatorName,
  WaterComplianceStatus,
  WaterPeriodFilter,
  WATER_MONTHS,
  WATER_SOURCES,
  WATER_INDICATORS,
  WATER_PERIOD_OPTIONS,
  createInitialWaterQualityData,
  evaluateWaterCompliance,
  evaluateWaterParameterInput,
  getWaterRowDisplayValue,
  filterWaterQualityRows,
  calculateWaterQualityMetrics,
  buildMonthlyWaterChartData,
  buildSourceComplianceBreakdown,
  generateDeterministicWaterAnalysis,
  WaterAIAnalysisResult,
  WaterPeriodicReportRow,
} from '@/lib/water-quality';
import { WaterPeriodicReportSheet } from '@/components/sikesling/water-periodic-report-sheet';

type WaterSheetTab = 'baku-mutu' | 'laporan-berkala';

export function WaterQualityMonitoringView() {
  const meta = resolveRouteMeta('/monitoring/kualitas-air');
  const {
    resolvedTheme,
    pushToast,
    addFinding,
    waterRows: rows,
    updateWaterRows,
    waterPeriodicReports,
    updateWaterPeriodicReports,
  } = useApp();
  const isDark = resolvedTheme === 'dark';

  const [activeSheet, setActiveSheet] = useState<WaterSheetTab>('baku-mutu');

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriod, setSelectedPeriod] = useState<WaterPeriodFilter>('FULL_YEAR');
  const [selectedSource, setSelectedSource] = useState<WaterSourceName | 'ALL'>('ALL');
  const [selectedIndicator, setSelectedIndicator] = useState<WaterIndicatorName | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<WaterComplianceStatus | 'ALL'>('ALL');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const saveRows = useCallback(
    (updated: WaterQualityRow[]) => {
      setHasUnsavedChanges(true);
      void updateWaterRows(updated);
    },
    [updateWaterRows]
  );

  const savePeriodicReports = useCallback(
    (updated: WaterPeriodicReportRow[]) => {
      setHasUnsavedChanges(true);
      void updateWaterPeriodicReports(updated);
    },
    [updateWaterPeriodicReports]
  );

  // Inline editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('0');

  // Quick modal input state
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [modalMonth, setModalMonth] = useState<number>(1);
  const [modalSource, setModalSource] = useState<WaterSourceName>('Artesis');
  const [modalColiform, setModalColiform] = useState<string>('0');
  const [modalEColi, setModalEColi] = useState<string>('0');

  const currentPeriodLabel = useMemo(() => {
    const found = WATER_PERIOD_OPTIONS.find((o) => o.value === selectedPeriod);
    return `${found ? found.label : '1 Tahun Penuh'} · Tahun ${selectedYear}`;
  }, [selectedPeriod, selectedYear]);

  const filteredRows = useMemo(() => {
    return filterWaterQualityRows(rows, {
      year: selectedYear,
      period: selectedPeriod,
      sourceName: selectedSource,
      indicator: selectedIndicator,
      statusFilter: selectedStatus,
    });
  }, [rows, selectedYear, selectedPeriod, selectedSource, selectedIndicator, selectedStatus]);

  const metrics = useMemo(() => calculateWaterQualityMetrics(filteredRows), [filteredRows]);

  const chartData = useMemo(() => buildMonthlyWaterChartData(filteredRows), [filteredRows]);

  const sourceBreakdown = useMemo(
    () => buildSourceComplianceBreakdown(filteredRows),
    [filteredRows]
  );

  // AI Analysis State (initialized deterministically and refreshable via server-side Gemini API)
  const deterministicAnalysis = useMemo(
    () => generateDeterministicWaterAnalysis(filteredRows, currentPeriodLabel),
    [filteredRows, currentPeriodLabel]
  );

  const [customAiAnalysis, setCustomAiAnalysis] = useState<{
    key: string;
    analysis: WaterAIAnalysisResult;
  } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const waterFilterKey = `${selectedYear}-${selectedPeriod}-${selectedSource}-${selectedIndicator}-${selectedStatus}-${rows.map((r) => getWaterRowDisplayValue(r)).join(',')}`;

  const activeAiAnalysis =
    customAiAnalysis && customAiAnalysis.key === waterFilterKey
      ? customAiAnalysis.analysis
      : deterministicAnalysis;

  const handleRefreshAiAnalysis = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/water-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: filteredRows,
          periodLabel: currentPeriodLabel,
        }),
      });
      if (!response.ok) {
        throw new Error('Gagal memuat analisa AI');
      }
      const data = await response.json();
      if (data?.analysis) {
        setCustomAiAnalysis({ key: waterFilterKey, analysis: data.analysis });
        pushToast({
          type: 'success',
          title: 'Analisa & Rekomendasi AI Diperbarui',
          message: `Evaluasi kualitas air bersih periode ${currentPeriodLabel} berhasil dianalisis.`,
        });
      }
    } catch {
      setCustomAiAnalysis(null);
      pushToast({
        type: 'info',
        title: 'Analisa Cerdas Diperbarui',
        message: 'Menampilkan hasil analisis sanitarian berbasis data pemeriksaan terkini.',
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleStartInlineEdit = (row: WaterQualityRow) => {
    setEditingRowId(row.id);
    setEditingValue(getWaterRowDisplayValue(row));
  };

  const handleSaveInlineEdit = (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) return;
    const evaluated = evaluateWaterParameterInput(targetRow.indicator, editingValue);
    const updated = rows.map((r) => {
      if (r.id !== rowId) return r;
      return {
        ...r,
        resultValue: evaluated.resultValue,
        resultDisplay: evaluated.resultDisplay,
        status: evaluated.status,
      };
    });
    saveRows(updated);
    setEditingRowId(null);
    pushToast({
      type: 'success',
      title: 'Nilai Pemeriksaan Diperbarui',
      message: `Nilai ${targetRow.indicator} berhasil diubah menjadi ${evaluated.resultDisplay} (${evaluated.status}).`,
    });
  };

  const handleOpenModalForMonthSource = (monthIdx: number, source: WaterSourceName) => {
    const coliformRow = rows.find(
      (r) =>
        r.monthIndex === monthIdx &&
        r.sourceName === source &&
        r.indicator === 'Total Coliform'
    );
    const ecoliRow = rows.find(
      (r) =>
        r.monthIndex === monthIdx &&
        r.sourceName === source &&
        r.indicator === 'E.Coli'
    );
    setModalMonth(monthIdx);
    setModalSource(source);
    setModalColiform(String(coliformRow?.resultValue ?? 0));
    setModalEColi(String(ecoliRow?.resultValue ?? 0));
    setIsInputModalOpen(true);
  };

  const handleSaveModalInput = (e: React.FormEvent) => {
    e.preventDefault();
    const coliformVal = Math.max(0, Number(modalColiform) || 0);
    const ecoliVal = Math.max(0, Number(modalEColi) || 0);

    const updated = rows.map((r) => {
      if (r.monthIndex === modalMonth && r.sourceName === modalSource) {
        if (r.indicator === 'Total Coliform') {
          return {
            ...r,
            resultValue: coliformVal,
            status: evaluateWaterCompliance(coliformVal),
          };
        }
        if (r.indicator === 'E.Coli') {
          return {
            ...r,
            resultValue: ecoliVal,
            status: evaluateWaterCompliance(ecoliVal),
          };
        }
      }
      return r;
    });

    saveRows(updated);
    setIsInputModalOpen(false);
    const monthLabel = WATER_MONTHS.find((m) => m.index === modalMonth)?.name || '';
    pushToast({
      type: 'success',
      title: 'Data Pemeriksaan Tersimpan',
      message: `Hasil uji ${modalSource} bulan ${monthLabel} berhasil diperbarui.`,
    });
  };

  const handleResetDefaultData = () => {
    const fresh = createInitialWaterQualityData(selectedYear);
    saveRows(fresh);
    setSelectedPeriod('FULL_YEAR');
    setSelectedSource('ALL');
    setSelectedIndicator('ALL');
    setSelectedStatus('ALL');
    setCustomAiAnalysis(null);
    pushToast({
      type: 'info',
      title: 'Data Direset ke Standar Referensi',
      message: 'Tabel Indikator Baku Mutu Air Bersih dikembalikan ke data awal.',
    });
  };

  const handleCreateFollowUpFromRecommendation = useCallback(
    (rec: {
      priority: string;
      action: string;
      targetUnit: string;
    }) => {
      const today = new Date().toISOString().slice(0, 10);
      const targetDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      addFinding({
        date: today,
        location:
          selectedSource === 'ALL'
            ? 'Instalasi Air Bersih (Artesis, RO Lab, RO Poli Gigi, Air Minum)'
            : selectedSource,
        category: 'Monitoring Kualitas Air Bersih',
        description: `Tindak lanjut temuan parameter mikrobiologi air bersih (${metrics.tmsCount} parameter TMS pada periode ${currentPeriodLabel}).`,
        recommendation: rec.action,
        picName: rec.targetUnit,
        targetDate: targetDate,
        priority: rec.priority.includes('SEGERA') ? 'Tinggi' : 'Sedang',
        status: 'Temuan Baru',
      });
    },
    [addFinding, selectedSource, metrics.tmsCount, currentPeriodLabel]
  );

  // Group filteredRows by Month -> Source -> Indicator so we can render exact rowSpans matching the spreadsheet
  const groupedTableData = useMemo(() => {
    const monthGroups: {
      no: number;
      monthIndex: number;
      monthName: string;
      totalRowsInMonth: number;
      sources: {
        sourceName: WaterSourceName;
        rows: WaterQualityRow[];
      }[];
    }[] = [];

    const distinctMonths = Array.from(new Set(filteredRows.map((r) => r.monthIndex))).sort(
      (a, b) => a - b
    );

    distinctMonths.forEach((mIdx, idx) => {
      const mRows = filteredRows.filter((r) => r.monthIndex === mIdx);
      const mName = mRows[0]?.monthName || '';
      const distinctSources = WATER_SOURCES.filter((s) =>
        mRows.some((r) => r.sourceName === s)
      );

      const sources = distinctSources.map((sName) => ({
        sourceName: sName,
        rows: mRows.filter((r) => r.sourceName === sName),
      }));

      const totalRowsInMonth = sources.reduce((acc, s) => acc + s.rows.length, 0);

      monthGroups.push({
        no: mIdx,
        monthIndex: mIdx,
        monthName: mName,
        totalRowsInMonth,
        sources,
      });
    });

    return monthGroups;
  }, [filteredRows]);

  return (
    <PageContainer>
      <PageHeader
        title="Monitoring Kualitas Air Bersih"
        description="Rekapitulasi Indikator Baku Mutu Air Bersih (Artesis, Air RO Lab, Air RO Poli Gigi, dan Air Minum)"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Periode Tahun */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-water-year" className="sr-only">
                Tahun Pemantauan
              </label>
              <div className="relative">
                <select
                  id="filter-water-year"
                  value={selectedYear}
                  onChange={(e) => {
                    const yr = Number(e.target.value);
                    setSelectedYear(yr);
                    saveRows(rows.map((r) => ({ ...r, year: yr })));
                  }}
                  aria-label="Tahun Pemantauan"
                  className="appearance-none pl-4 pr-8 py-2 rounded-full text-xs font-bold bg-white/95 dark:bg-[#001835] text-[#002147] dark:text-slate-100 border border-[#D2B48C]/70 dark:border-slate-700 shadow-sm hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 cursor-pointer transition-all"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tombol Periode (Bulan, Triwulan, Semester, Tahunan) */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-water-period" className="sr-only">
                Rentang Periode
              </label>
              <div className="relative">
                <select
                  id="filter-water-period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as WaterPeriodFilter)}
                  aria-label="Rentang Periode Pemantauan"
                  className="appearance-none pl-8 pr-8 py-2 rounded-full text-xs font-bold bg-white/95 dark:bg-[#001835] text-[#002147] dark:text-slate-100 border border-[#D2B48C]/70 dark:border-slate-700 shadow-sm hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 cursor-pointer transition-all"
                >
                  <optgroup label="Tahunan">
                    <option value="FULL_YEAR">1 Tahun Penuh (Januari – Desember)</option>
                  </optgroup>
                  <optgroup label="Semester">
                    <option value="SEMESTER_1">Semester 1 (Januari – Juni)</option>
                    <option value="SEMESTER_2">Semester 2 (Juli – Desember)</option>
                  </optgroup>
                  <optgroup label="Triwulan">
                    <option value="Q1">Triwulan I (Jan – Mar)</option>
                    <option value="Q2">Triwulan II (Apr – Jun)</option>
                    <option value="Q3">Triwulan III (Jul – Sep)</option>
                    <option value="Q4">Triwulan IV (Okt – Des)</option>
                  </optgroup>
                  <optgroup label="Bulanan">
                    {WATER_MONTHS.map((m) => (
                      <option key={m.index} value={`MONTH_${m.index}` as WaterPeriodFilter}>
                        Bulan {m.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <Calendar className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        }
      />

      {/* SHEET MENU TABS: Indikator Baku Mutu Air Bersih & Laporan Berkala Pengambilan Air (SIPA) */}
      <div
        role="tablist"
        aria-label="Pilih Sheet Monitoring Kualitas Air"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSheet === 'baku-mutu'}
          onClick={() => setActiveSheet('baku-mutu')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeSheet === 'baku-mutu'
              ? 'bg-[#002147] text-[#D2B48C] shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/90 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/50 hover:bg-[#F7F1E7]'
          }`}
        >
          <Droplets className="w-4 h-4 shrink-0" />
          <span>Indikator Baku Mutu Air Bersih</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSheet === 'laporan-berkala'}
          onClick={() => setActiveSheet('laporan-berkala')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer whitespace-nowrap ${
            activeSheet === 'laporan-berkala'
              ? 'bg-[#002147] text-[#D2B48C] shadow-md ring-2 ring-[#D2B48C]/60'
              : 'bg-white/90 dark:bg-[#001835]/80 text-[#002147] dark:text-slate-200 border border-[#D2B48C]/50 hover:bg-[#F7F1E7]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Laporan Berkala Pengambilan Air (SIPA)</span>
        </button>
      </div>

      {activeSheet === 'laporan-berkala' ? (
        <WaterPeriodicReportSheet
          rows={waterPeriodicReports}
          selectedYear={selectedYear}
          isDark={isDark}
          onUpdateRows={savePeriodicReports}
          pushToast={pushToast}
        />
      ) : (
        <>
      {/* 2. TABEL INDIKATOR BAKU MUTU AIR BERSIH DENGAN TEMA OXFORD & TAN */}
      <section
        aria-label="Tabel Indikator Baku Mutu Air Bersih"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/20 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Judul Tabel Oxford & Tan Soft Center */}
        <div className="bg-[#002147] dark:bg-[#00152E] border-b border-[#D2B48C]/50 px-4 py-4 flex flex-col items-center justify-center text-center">
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#D2B48C] uppercase">
            INDIKATOR BAKU MUTU AIR BERSIH
          </h2>
        </div>

        <div className="overflow-x-auto max-h-[760px] overflow-y-auto smooth-scroll-container">
          <table className="w-full min-w-[680px] border-collapse text-xs sm:text-sm">
            <thead className="sticky top-0 z-20 shadow-xs">
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-3 text-center font-bold w-14 align-middle">
                  NO
                </th>
                <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-32 align-middle">
                  BULAN
                </th>
                <th
                  style={{ fontSize: '13px' }}
                  className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-40 align-middle text-[13px]"
                >
                  NAMA
                </th>
                <th
                  style={{ fontSize: '13px' }}
                  className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold min-w-[170px] align-middle text-[13px]"
                >
                  Indikator Mutu AIR BERSIH
                </th>
                <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-36 align-middle">
                  Nilai Normal
                </th>
                <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-44 align-middle">
                  Nilai Hasil Pemeriksaan
                </th>
                <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-4 py-3 text-center font-bold w-28 align-middle">
                  Capaian
                </th>
              </tr>
            </thead>
            <tbody className="text-[#002147] dark:text-slate-100">
              {groupedTableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border border-slate-400 dark:border-slate-700 px-6 py-10 text-center text-slate-500"
                  >
                    Tidak ada data pemeriksaan yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                groupedTableData.map((monthGroup) => {
                  return monthGroup.sources.map((sourceGroup, sIdx) =>
                    sourceGroup.rows.map((row, rIdx) => {
                      const isFirstInMonth = sIdx === 0 && rIdx === 0;
                      const isFirstInSource = rIdx === 0;
                      const isTms = row.status === 'TMS';

                      const dataCellBg = isTms
                        ? 'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold'
                        : 'bg-white dark:bg-slate-900/90 text-[#002147] dark:text-slate-100';

                      const resultCellBg = isTms
                        ? 'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold'
                        : 'bg-[#FAF6F0]/70 dark:bg-slate-900/70 text-[#002147] dark:text-slate-100';

                      const capaianCellBg = isTms
                        ? 'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold'
                        : 'bg-[#F5EDE0]/85 dark:bg-slate-800/80 text-[#002147] dark:text-white font-bold';

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {isFirstInMonth && (
                            <td
                              rowSpan={monthGroup.totalRowsInMonth}
                              className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center align-top font-bold tabular-nums text-[#002147] dark:text-slate-200 bg-white dark:bg-slate-900"
                            >
                              {monthGroup.no}
                            </td>
                          )}

                          {isFirstInMonth && (
                            <td
                              rowSpan={monthGroup.totalRowsInMonth}
                              className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center align-top font-bold tracking-wide uppercase text-[#002147] dark:text-slate-100 bg-[#FAF6F0] dark:bg-slate-900/90"
                            >
                              {monthGroup.monthName}
                            </td>
                          )}

                          {isFirstInSource && (
                            <td
                              rowSpan={sourceGroup.rows.length}
                              className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center align-middle font-semibold text-[#002147] dark:text-slate-100 bg-white dark:bg-slate-900/90"
                            >
                              {sourceGroup.sourceName}
                            </td>
                          )}

                          <td
                            className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-left font-medium ${dataCellBg}`}
                          >
                            {row.indicator}
                          </td>

                          <td
                            className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center tabular-nums font-semibold ${dataCellBg}`}
                          >
                            {row.normalValue}
                          </td>

                          <td
                            className={`border border-slate-400 dark:border-slate-700 px-3 py-2 text-center tabular-nums ${resultCellBg}`}
                          >
                            {editingRowId === row.id ? (
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="text"
                                  aria-label={`Input Nilai ${row.sourceName} ${row.indicator} ${row.monthName}`}
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInlineEdit(row.id);
                                    if (e.key === 'Escape') setEditingRowId(null);
                                  }}
                                  className="w-24 px-2 py-0.5 text-center text-xs font-bold rounded border border-[#002147] bg-white text-[#002147] shadow-sm"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineEdit(row.id)}
                                  aria-label="Simpan Nilai"
                                  className="p-1 rounded bg-[#002147] text-white hover:bg-[#001630]"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartInlineEdit(row)}
                                className="w-full py-0.5 font-bold tabular-nums cursor-pointer select-none hover:underline"
                                title="Klik untuk mengubah nilai hasil pemeriksaan"
                              >
                                {getWaterRowDisplayValue(row)}
                              </button>
                            )}
                          </td>

                          <td
                            className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold tracking-wide ${capaianCellBg}`}
                          >
                            {row.status}
                          </td>
                        </tr>
                      );
                    })
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Legend Keterangan Baku Mutu */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#EFE4D2]/75 dark:bg-[#00152E] border-t border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#002147] dark:text-[#D2B48C]">
            Keterangan Capaian Baku Mutu Air Bersih:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[#002147] dark:text-slate-200 font-semibold border border-[#D2B48C] dark:border-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block shrink-0" />
              <span>MS: Memenuhi Syarat (0/100 ml)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FDE047] text-slate-950 font-bold border border-amber-500 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block shrink-0" />
              <span>TMS: Tidak Memenuhi Syarat (&gt; 0/100 ml)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4. VISUALISASI GRAFIK DARI DATA TABEL */}
      <section
        aria-label="Grafik Visualisasi Data Kualitas Air Bersih"
        className="grid grid-cols-1 xl:grid-cols-3 gap-5"
      >
        {/* Main Monthly Trend Chart (2 columns wide on desktop) */}
        <div className="xl:col-span-2 rounded-[28px] bg-gradient-to-br from-white/90 via-white/80 to-white/85 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/90 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1D7AFC] dark:text-blue-400">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Visualisasi Grafik Tabel</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Tren Hasil Pemeriksaan Total Coliform & E.Coli per Titik Sampel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Satuan: CFU / 100 ml sampel · Nilai Normal Baku Mutu: 0 / 100 ml ({currentPeriodLabel})
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  chartType === 'bar'
                    ? 'bg-[#153E75] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Grafik Batang
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  chartType === 'line'
                    ? 'bg-[#153E75] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Grafik Garis Tren
              </button>
            </div>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 16, right: 16, left: -10, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#CBD5E1'}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="monthShort"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? '#E2E8F0' : '#334155',
                      fontWeight: 600,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(10, dataMax + 1)]}
                    tick={{ fontSize: 11, fill: isDark ? '#E2E8F0' : '#334155' }}
                    label={{
                      value: 'CFU/100ml',
                      angle: -90,
                      position: 'insideLeft',
                      style: {
                        fontSize: 10,
                        fill: isDark ? '#94A3B8' : '#64748B',
                      },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderRadius: '14px',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '10px',
                      color: isDark ? '#E2E8F0' : '#334155',
                    }}
                  />
                  <Bar
                    dataKey="artesisColiform"
                    name="Artesis (Total Coliform)"
                    fill={isDark ? '#38BDF8' : '#153E75'}
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="roLabColiform"
                    name="Air RO Lab (Total Coliform)"
                    fill="#D97706"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="roPoliGigiColiform"
                    name="Air RO Poli Gigi (Total Coliform)"
                    fill="#1D7AFC"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="airMinumColiform"
                    name="Air Minum (Total Coliform)"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 16, right: 16, left: -10, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#CBD5E1'}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="monthShort"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? '#E2E8F0' : '#334155',
                      fontWeight: 600,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(10, dataMax + 1)]}
                    tick={{ fontSize: 11, fill: isDark ? '#E2E8F0' : '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderRadius: '14px',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '10px',
                      color: isDark ? '#E2E8F0' : '#334155',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="artesisColiform"
                    name="Artesis (Total Coliform)"
                    stroke={isDark ? '#38BDF8' : '#153E75'}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="roLabColiform"
                    name="Air RO Lab (Total Coliform)"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="roPoliGigiColiform"
                    name="Air RO Poli Gigi (Total Coliform)"
                    stroke="#1D7AFC"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="airMinumColiform"
                    name="Air Minum (Total Coliform)"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Compliance Comparison Card */}
        <div className="rounded-[28px] bg-gradient-to-br from-white/90 via-white/80 to-white/85 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/90 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#153E75] dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Komparasi Per Titik Sampel</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Distribusi Capaian MS vs TMS per Sumber Air
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluasi tingkat kepatuhan per titik instalasi air bersih
            </p>

            <div className="mt-4 space-y-4">
              {sourceBreakdown.map((item) => (
                <div
                  key={item.sourceName}
                  className="p-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.sourceName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                        item.tmsCount === 0
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {item.complianceRate}% MS
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${item.complianceRate}%` }}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${Math.max(0, 100 - item.complianceRate)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                    <span>
                      MS: <strong className="text-emerald-600">{item.msCount}</strong> · TMS:{' '}
                      <strong className="text-amber-600">{item.tmsCount}</strong>
                    </span>
                    <span>
                      Puncak Coliform: <strong>{item.peakColiform}/100 ml</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Standar: Permenkes No. 2 Tahun 2023</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              Target: 100% MS
            </span>
          </div>
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
            Berdasarkan hasil pemantauan dan pengujian laboratorium terhadap parameter mikrobiologi (Total Coliform dan Escherichia Coli) serta parameter fisik dan kimia lengkap pada Bulan Juni dan Desember pada 4 titik pemeriksaan (Artesis, Air RO Lab, Air RO Poli Gigi, dan Air Minum) di UOBK RSUD Al-Mulk sepanjang periode tahun {selectedYear}, secara umum kualitas air bersih dan air minum berada dalam kondisi terkendali dan higienis. Parameter E.Coli pada seluruh titik uji secara konsisten menunjukkan angka 0/100 ml sampel (100% Memenuhi Syarat baku mutu sesuai Permenkes No. 2 Tahun 2023), sehingga bebas dari kontaminasi feses patogen. Pada titik Air RO Lab, Air RO Poli Gigi, dan Air Minum, hasil pemeriksaan parameter fisik, kimia, maupun mikrobiologi terkendali berkat sistem filtrasi membran dan sterilisasi ultraviolet yang berfungsi prima. Sementara itu, pada titik sumur Artesis teridentifikasi fluktuasi Total Coliform pada beberapa bulan musim hujan dengan rentang 4–8/100 ml (TMS), yang dipicu oleh tingginya muka air tanah permukaan di sekitar sumur resapan sebelum dialirkan ke proses klorinasi tandon utama.
          </p>
        </div>

        {/* Bagian Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">1.</span>
              <span className="text-justify">
                Melakukan pemantauan dan penjagaan residu klor aktif bebas secara ketat (0,2–0,5 mg/L) pada tandon penampungan utama (<em>ground water tank</em>) dan saluran distribusi terjauh.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Melakukan penggantian berkala <em>cartridge filter spun</em> (sedimen 1 &amp; 5 mikron) serta pemeriksaan intensitas radiasi lampu UV sterilisasi pada unit RO Laboratorium dan Poli Gigi setiap 3 bulan sekali.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Melakukan pengurasan, pencucian, dan desinfeksi toren penampungan air secara periodik minimal 1 kali per semester guna mencegah terbentuknya lapisan <em>biofilm</em>.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Melanjutkan kerja sama pemantauan dan pengujian laboratorium lingkungan eksternal terakreditasi KAN setiap bulan secara konsisten.
              </span>
            </li>
          </ol>
        </div>

        {/* Bagian Rencana Tindak Lanjut */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">1.</span>
              <span className="text-justify">
                Melakukan inspeksi sanitasi lingkungan radius 15 meter di sekeliling titik sumur bor artesis untuk memastikan bebas genangan dan bebas resapan limbah cair domestik.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Melaksanakan pengurasan menyeluruh dan desinfeksi klorinasi pada tandon penampungan air bersih pada awal semester berjalan.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Mengagendakan uji petik mandiri (<em>resampling</em>) pada titik kran terjauh 24 jam setelah klorinasi jika ditemukan angka Total Coliform &gt; 0/100 ml.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Mendokumentasikan kartu kontrol pemeliharaan unit filter RO dan melampirkan hasil uji laboratorium pada laporan pemantauan sanitasi rumah sakit triwulanan.
              </span>
            </li>
          </ol>
        </div>
      </section>
        </>
      )}

      {/* MODAL INPUT / EDIT HASIL PEMERIKSAAN BULANAN */}
      {isInputModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-water-input-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3
                  id="modal-water-input-title"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  Input / Edit Hasil Pemeriksaan Air Bersih
                </h3>
                <p className="text-xs text-slate-500">
                  Nilai Normal Baku Mutu: 0/100 ml (Otomatis MS jika 0, TMS jika &gt; 0)
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveModalInput} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="modal-water-month"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Bulan Pemeriksaan
                  </label>
                  <select
                    id="modal-water-month"
                    value={modalMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setModalMonth(m);
                      const cRow = rows.find(
                        (r) =>
                          r.monthIndex === m &&
                          r.sourceName === modalSource &&
                          r.indicator === 'Total Coliform'
                      );
                      const eRow = rows.find(
                        (r) =>
                          r.monthIndex === m &&
                          r.sourceName === modalSource &&
                          r.indicator === 'E.Coli'
                      );
                      setModalColiform(String(cRow?.resultValue ?? 0));
                      setModalEColi(String(eRow?.resultValue ?? 0));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {WATER_MONTHS.map((m) => (
                      <option key={m.index} value={m.index}>
                        {m.index}. {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="modal-water-source"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Nama Titik Air
                  </label>
                  <select
                    id="modal-water-source"
                    value={modalSource}
                    onChange={(e) => {
                      const s = e.target.value as WaterSourceName;
                      setModalSource(s);
                      const cRow = rows.find(
                        (r) =>
                          r.monthIndex === modalMonth &&
                          r.sourceName === s &&
                          r.indicator === 'Total Coliform'
                      );
                      const eRow = rows.find(
                        (r) =>
                          r.monthIndex === modalMonth &&
                          r.sourceName === s &&
                          r.indicator === 'E.Coli'
                      );
                      setModalColiform(String(cRow?.resultValue ?? 0));
                      setModalEColi(String(eRow?.resultValue ?? 0));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {WATER_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="modal-coliform-val"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Total Coliform (/100 ml)
                  </label>
                  <input
                    id="modal-coliform-val"
                    type="number"
                    min={0}
                    max={999}
                    value={modalColiform}
                    onChange={(e) => setModalColiform(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 tabular-nums"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Capaian:{' '}
                    <strong>
                      {evaluateWaterCompliance(Number(modalColiform) || 0)}
                    </strong>
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="modal-ecoli-val"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    E.Coli (/100 ml)
                  </label>
                  <input
                    id="modal-ecoli-val"
                    type="number"
                    min={0}
                    max={999}
                    value={modalEColi}
                    onChange={(e) => setModalEColi(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 tabular-nums"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Capaian:{' '}
                    <strong>
                      {evaluateWaterCompliance(Number(modalEColi) || 0)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#153E75] text-white hover:bg-[#10315E]"
                >
                  Simpan Hasil Pemeriksaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={async () => {
          let nextRows = rows;
          if (editingRowId) {
            const targetRow = rows.find((r) => r.id === editingRowId);
            if (targetRow) {
              const evaluated = evaluateWaterParameterInput(
                targetRow.indicator,
                editingValue
              );
              nextRows = rows.map((r) =>
                r.id === editingRowId
                  ? {
                      ...r,
                      resultValue: evaluated.resultValue,
                      resultDisplay: evaluated.resultDisplay,
                      status: evaluated.status,
                    }
                  : r
              );
            }
            setEditingRowId(null);
          }
          await updateWaterRows(nextRows);
          await updateWaterPeriodicReports(waterPeriodicReports);
          setHasUnsavedChanges(false);
          pushToast({
            type: 'success',
            title: 'Data Monitoring Kualitas Air Tersimpan',
            message:
              'Seluruh sheet Monitoring Kualitas Air telah disimpan dalam aplikasi dan disinkronkan ke database Supabase.',
          });
        }}
      />
    </PageContainer>
  );
}
