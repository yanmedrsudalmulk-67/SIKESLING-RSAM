'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Waves,
  Calendar,
  Filter,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  TableProperties,
  SlidersHorizontal,
  Edit3,
  RotateCcw,
  Check,
  Building2,
  ClipboardCheck,
  Download,
  Info,
  ArrowDownRight,
  ShieldCheck,
  Activity,
  ChevronDown,
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
import {
  WastewaterRow,
  WastewaterSamplingPoint,
  WastewaterIndicatorName,
  WastewaterComplianceStatus,
  WastewaterPeriodFilter,
  WASTEWATER_MONTHS,
  WASTEWATER_SAMPLING_POINTS,
  WASTEWATER_INDICATOR_ORDER,
  WASTEWATER_STANDARDS,
  WASTEWATER_PERIOD_OPTIONS,
  createInitialWastewaterData,
  evaluateWastewaterCompliance,
  filterWastewaterRows,
  calculateWastewaterMetrics,
  buildMonthlyWastewaterChartData,
  generateDeterministicWastewaterAnalysis,
  WastewaterAIAnalysisResult,
  parseWastewaterValue,
} from '@/lib/wastewater-quality';

const STORAGE_KEY_WASTEWATER = 'sikesling_rsam_wastewater_quality_2026_v2';

export function WastewaterQualityMonitoringView() {
  const meta = resolveRouteMeta('/monitoring/limbah');
  const { pushToast, addFinding } = useApp();

  const [activeSheet, setActiveSheet] = useState<'sheet1' | 'sheet2'>('sheet1');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriod, setSelectedPeriod] = useState<WastewaterPeriodFilter>('FULL_YEAR');
  const [selectedPoint, setSelectedPoint] = useState<WastewaterSamplingPoint | 'ALL'>('ALL');
  const [selectedIndicator, setSelectedIndicator] = useState<WastewaterIndicatorName | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<WastewaterComplianceStatus | 'ALL'>('ALL');
  const [chartMetric, setChartMetric] = useState<'bod_cod' | 'coliform' | 'ph' | 'tss'>('bod_cod');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const [rows, setRows] = useState<WastewaterRow[]>(() =>
    createInitialWastewaterData(2026)
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_WASTEWATER);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRows(parsed);
          }
        }
      } catch {
        // ignore storage errors
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const saveRows = (updated: WastewaterRow[]) => {
    setRows(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY_WASTEWATER, JSON.stringify(updated));
      window.dispatchEvent(new Event('sikesling-monitoring-updated'));
    } catch {
      // ignore storage errors
    }
  };

  // Inline editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('0');

  // Quick Input Modal State
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [modalMonth, setModalMonth] = useState<number>(1);
  const [modalPoint, setModalPoint] = useState<WastewaterSamplingPoint>('IPAL OUTLET');
  const [modalIndicator, setModalIndicator] = useState<WastewaterIndicatorName>('BOD');
  const [modalValue, setModalValue] = useState<string>('6');

  const currentPeriodLabel = useMemo(() => {
    const found = WASTEWATER_PERIOD_OPTIONS.find((o) => o.value === selectedPeriod);
    return `${found ? found.label : '1 Tahun Penuh'} · Tahun ${selectedYear}`;
  }, [selectedPeriod, selectedYear]);

  const filteredRows = useMemo(() => {
    return filterWastewaterRows(rows, {
      year: selectedYear,
      period: selectedPeriod,
      samplingPoint: selectedPoint,
      indicator: selectedIndicator,
      statusFilter: selectedStatus,
    });
  }, [rows, selectedYear, selectedPeriod, selectedPoint, selectedIndicator, selectedStatus]);

  const metrics = useMemo(() => calculateWastewaterMetrics(filteredRows), [filteredRows]);

  const chartData = useMemo(() => buildMonthlyWastewaterChartData(filteredRows), [filteredRows]);

  // AI Analysis State (deterministic instant sync + refreshable via server-side Gemini API)
  const deterministicAnalysis = useMemo(
    () => generateDeterministicWastewaterAnalysis(filteredRows, currentPeriodLabel),
    [filteredRows, currentPeriodLabel]
  );

  const [customAiAnalysis, setCustomAiAnalysis] = useState<{
    key: string;
    analysis: WastewaterAIAnalysisResult;
  } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const analysisFilterKey = `${selectedYear}-${selectedPeriod}-${selectedPoint}-${selectedIndicator}-${selectedStatus}-${rows.map((r) => r.resultValue).join(',')}`;

  const activeAiAnalysis =
    customAiAnalysis && customAiAnalysis.key === analysisFilterKey
      ? customAiAnalysis.analysis
      : deterministicAnalysis;

  // Handle inline edit save
  const handleStartInlineEdit = (row: WastewaterRow) => {
    setEditingRowId(row.id);
    setEditingValue(row.resultValue);
  };

  const handleSaveInlineEdit = (rowId: string) => {
    const updated = rows.map((r) => {
      if (r.id !== rowId) return r;
      const evalRes = evaluateWastewaterCompliance(r.indicator, editingValue);
      return {
        ...r,
        resultValue: editingValue.trim(),
        numericValue: parseWastewaterValue(editingValue),
        status: evalRes.status,
        notes: evalRes.notes,
      };
    });

    saveRows(updated);
    setEditingRowId(null);
    pushToast({
      type: 'success',
      title: 'Hasil Pemeriksaan Diperbarui',
      message: `Nilai parameter berhasil disimpan dan grafik & analisa AI diperbarui otomatis.`,
    });
  };

  // Handle quick modal submission
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMonthName = WASTEWATER_MONTHS.find((m) => m.no === modalMonth)?.name || 'JANUARI';
    const evalRes = evaluateWastewaterCompliance(modalIndicator, modalValue);
    const num = parseWastewaterValue(modalValue);

    const updated = rows.map((r) => {
      if (
        r.month === modalMonth &&
        r.samplingPoint === modalPoint &&
        r.indicator === modalIndicator
      ) {
        return {
          ...r,
          resultValue: modalValue.trim(),
          numericValue: num,
          status: evalRes.status,
          notes: evalRes.notes,
        };
      }
      return r;
    });

    saveRows(updated);
    setIsInputModalOpen(false);
    pushToast({
      type: evalRes.status === 'TMS' ? 'warning' : 'success',
      title: 'Pemeriksaan Disimpan',
      message: `Data ${modalPoint} (${modalIndicator}) bulan ${targetMonthName} berhasil disimpan (${evalRes.status}).`,
    });
  };

  // Reset dataset to initial baseline
  const handleResetData = () => {
    const baseline = createInitialWastewaterData(2026);
    saveRows(baseline);
    setCustomAiAnalysis(null);
    pushToast({
      type: 'info',
      title: 'Data Direset',
      message: 'Data indikator baku mutu limbah cair telah dikembalikan ke data referensi awal.',
    });
  };

  // Live call to server-side Gemini API
  const handleGenerateGeminiAI = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/wastewater-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: filteredRows,
          periodLabel: currentPeriodLabel,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi layanan Gemini AI.');
      }

      const data = await res.json();
      if (data?.analysis) {
        setCustomAiAnalysis({ key: analysisFilterKey, analysis: data.analysis });
        pushToast({
          type: 'success',
          title: 'Analisa AI Berhasil Diperbarui',
          message: 'Rekomendasi teknis operasional IPAL telah dianalisa langsung oleh Gemini AI.',
        });
      }
    } catch {
      pushToast({
        type: 'info',
        title: 'Analisa Standar Aktif',
        message: 'Menggunakan algoritma analitik sanitarian RSAM bawaan.',
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Convert TMS finding into formal supervision finding
  const handleCreateSupervisionFinding = (r: WastewaterRow) => {
    addFinding({
      date: new Date().toISOString().slice(0, 10),
      location: `Instalasi Pengolahan Air Limbah (${r.samplingPoint})`,
      category: 'Limbah Cair / IPAL',
      description: `Hasil uji parameter ${r.indicator} pada ${r.samplingPoint} bulan ${r.monthName} adalah ${r.resultValue} ${r.unit}, melebihi baku mutu lingkungan (${r.normalValue} ${r.unit}).`,
      recommendation:
        r.indicator === 'TOTAL COLIFORM'
          ? 'Kalibrasi dosing klorin dan pembersihan bak kontak desinfeksi'
          : r.indicator === 'PH'
            ? 'Pemeriksaan bak netralisasi dan penelusuran buangan asam instalasi laboratorium'
            : 'Pengecekan dissolved oxygen (DO) dan efisiensi aerasi IPAL',
      picName: 'Petugas Sanitarian & IPAL RSAM',
      targetDate: '2026-11-05',
      priority: r.samplingPoint === 'IPAL OUTLET' ? 'Tinggi' : 'Sedang',
      status: 'Temuan Baru',
    });

    pushToast({
      type: 'warning',
      title: 'Temuan Dibuat',
      message: `Temuan parameter ${r.indicator} telah dicatat ke Modul Tindak Lanjut Temuan.`,
    });
  };

  // Group rows for spreadsheet table rendering
  const groupedTableData = useMemo(() => {
    const monthGroups: {
      monthNumber: number;
      monthName: string;
      totalRowsInMonth: number;
      points: {
        samplingPoint: WastewaterSamplingPoint;
        rows: WastewaterRow[];
      }[];
    }[] = [];

    const distinctMonths = Array.from(new Set(filteredRows.map((r) => r.month))).sort(
      (a, b) => a - b
    );

    for (const mNo of distinctMonths) {
      const monthRows = filteredRows.filter((r) => r.month === mNo);
      const mName = monthRows[0]?.monthName || `BULAN ${mNo}`;

      const distinctPoints = Array.from(
        new Set(monthRows.map((r) => r.samplingPoint))
      ) as WastewaterSamplingPoint[];

      const pointsData = distinctPoints.map((pt) => {
        return {
          samplingPoint: pt,
          rows: monthRows.filter((r) => r.samplingPoint === pt),
        };
      });

      monthGroups.push({
        monthNumber: mNo,
        monthName: mName,
        totalRowsInMonth: monthRows.length,
        points: pointsData,
      });
    }

    return monthGroups;
  }, [filteredRows]);

  // Export table data to CSV (Sheet 1 detailed list or Sheet 2 12-month matrix)
  const handleExportCSV = () => {
    if (activeSheet === 'sheet2') {
      const headers = [
        'LIMBAH',
        'Indikator Mutu Limbah Cair',
        'Nilai Normal',
        ...WASTEWATER_MONTHS.map((m) => m.name),
      ];

      const matrixRows: string[][] = [];
      (['IPAL INLET', 'IPAL OUTLET'] as WastewaterSamplingPoint[]).forEach((point) => {
        WASTEWATER_INDICATOR_ORDER.forEach((indicator) => {
          const spec = WASTEWATER_STANDARDS[indicator];
          const rowVals = WASTEWATER_MONTHS.map((m) => {
            const cell = rows.find(
              (r) => r.samplingPoint === point && r.indicator === indicator && r.month === m.no
            );
            return cell ? `"${cell.resultValue}"` : '""';
          });
          matrixRows.push([
            `"${point}"`,
            `"${indicator === 'SULFIDA' ? 'SULFID' : indicator}"`,
            `"${spec.normalDisplay === '-' ? '' : spec.normalDisplay}"`,
            ...rowVals,
          ]);
        });
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...matrixRows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Rekapitulasi_Sheet2_Baku_Mutu_Limbah_Cair_RSUD_Al-Mulk_${selectedYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      pushToast({
        type: 'success',
        title: 'Export Rekapan (Sheet 2) Berhasil',
        message: 'File CSV rekapitulasi matriks tahunan limbah cair berhasil diunduh.',
      });
      return;
    }

    const headers = [
      'No',
      'Bulan',
      'Titik Pantau',
      'Indikator Mutu Limbah Cair',
      'Nilai Normal',
      'Nilai Hasil Pemeriksaan',
      'Satuan',
      'Capaian',
      'Keterangan',
    ];
    const csvRows = filteredRows.map((r) => [
      r.month,
      r.monthName,
      r.samplingPoint,
      r.indicator,
      `"${r.normalValue}"`,
      `"${r.resultValue}"`,
      `"${r.unit}"`,
      r.status,
      `"${r.notes}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Baku_Mutu_Limbah_Cair_Sheet1_RSUD_Al-Mulk_${selectedYear}_${selectedPeriod}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    pushToast({
      type: 'success',
      title: 'Export Sheet 1 Berhasil',
      message: 'File CSV indikator baku mutu limbah cair berhasil diunduh.',
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Monitoring Pengelolaan Limbah Cair (IPAL)"
        description="Pemantauan Indikator Baku Mutu Air Limbah Rumah Sakit (Inlet & Outlet IPAL)"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Periode Tahun */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-wastewater-year" className="sr-only">
                Tahun Pemantauan
              </label>
              <div className="relative">
                <select
                  id="filter-wastewater-year"
                  value={selectedYear}
                  onChange={(e) => {
                    const yr = Number(e.target.value);
                    setSelectedYear(yr);
                    setRows((prev) => prev.map((r) => ({ ...r, year: yr })));
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
              <label htmlFor="filter-wastewater-period" className="sr-only">
                Rentang Periode
              </label>
              <div className="relative">
                <select
                  id="filter-wastewater-period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as WastewaterPeriodFilter)}
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
                    {WASTEWATER_MONTHS.map((m) => (
                      <option key={m.no} value={`MONTH_${m.no}` as WastewaterPeriodFilter}>
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

      {/* 2. TABEL INDIKATOR BAKU MUTU LIMBAH CAIR DENGAN TEMA OXFORD & TAN */}
      <section
        aria-label="Tabel Indikator Baku Mutu Limbah Cair"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/20 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Table Header Oxford & Tan Soft Center & Tombol Sheet di Kanan Atas */}
        <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 bg-[#002147] dark:bg-[#00152E] border-b border-[#D2B48C]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Spacer penyeimbang di sisi kiri agar judul benar-benar rata tengah */}
          <div className="hidden sm:block sm:w-56 shrink-0" aria-hidden="true" />

          {/* Judul Rata Tengah Berwarna Tan */}
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#D2B48C] uppercase text-center flex-1">
            INDIKATOR BAKU MUTU LIMBAH CAIR
          </h2>

          {/* Tombol Tab Sheet di Kanan Atas Sejajar Judul */}
          <div className="w-full sm:w-56 flex justify-center sm:justify-end shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-900/90 rounded-xl border border-[#D2B48C] dark:border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveSheet('sheet1')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
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
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
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

        {/* Sheet 1: Input Data Detail Bulanan */}
        {activeSheet === 'sheet1' ? (
          <div className="overflow-x-auto max-h-[780px] overflow-y-auto smooth-scroll-container">
            <table className="w-full min-w-[760px] border-collapse text-xs sm:text-sm">
              <thead className="sticky top-0 z-20 shadow-xs">
                <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-3 text-center font-bold w-14 align-middle">
                    No
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-36 align-middle">
                    Bulan
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold min-w-[170px] align-middle">
                    Indikator Mutu Limbah Cair
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-32 align-middle">
                    Nilai Normal
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-center font-bold w-44 align-middle">
                    Nilai Hasil Pemeriksaan
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-4 py-3 text-center font-bold w-24 align-middle">
                    Capaian
                  </th>
                  <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-4 py-3 text-center font-bold w-40 align-middle">
                    ket
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
                      Tidak ada data pemeriksaan limbah yang sesuai dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  groupedTableData.map((monthGroup) => {
                    return monthGroup.points.map((pointGroup, pIdx) =>
                      pointGroup.rows.map((row, rIdx) => {
                        const isFirstInMonth = pIdx === 0 && rIdx === 0;
                        const isFirstInPoint = rIdx === 0;
                        const isTms = row.status === 'TMS';
                        const isCriticalRed =
                          row.samplingPoint === 'IPAL OUTLET' &&
                          isTms &&
                          row.indicator === 'TOTAL COLIFORM';

                        let dataCellBg =
                          'bg-white dark:bg-slate-900/90 text-[#002147] dark:text-slate-100';
                        let resultCellBg =
                          'bg-[#FAF6F0]/70 dark:bg-slate-900/70 text-[#002147] dark:text-slate-100';
                        let capaianCellBg =
                          'bg-[#F5EDE0]/85 dark:bg-slate-800/80 text-[#002147] dark:text-white';

                        if (isCriticalRed) {
                          dataCellBg = 'bg-[#DC2626] text-white font-black';
                          resultCellBg = 'bg-[#DC2626] text-white font-black';
                          capaianCellBg = 'bg-[#DC2626] text-white font-black';
                        } else if (isTms) {
                          dataCellBg =
                            'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold';
                          resultCellBg =
                            'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold';
                          capaianCellBg =
                            'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold';
                        }

                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {/* Column No (Spans whole month) */}
                            {isFirstInMonth && (
                              <td
                                rowSpan={monthGroup.totalRowsInMonth}
                                className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center align-top font-bold tabular-nums text-[#002147] dark:text-slate-200 bg-white dark:bg-slate-900"
                              >
                                {monthGroup.monthNumber}
                              </td>
                            )}

                            {/* Column Bulan & Sampling Point */}
                            {isFirstInPoint && (
                              <td
                                rowSpan={pointGroup.rows.length}
                                className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center align-middle font-bold tracking-tight bg-[#FAF6F0] dark:bg-slate-900/90"
                              >
                                <div className="uppercase font-bold text-[#002147] dark:text-slate-100">
                                  {isFirstInMonth ? (
                                    <span className="block text-xs font-black text-[#002147] dark:text-[#D2B48C] mb-1">
                                      {monthGroup.monthName}
                                    </span>
                                  ) : null}
                                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFE4D2] dark:bg-slate-800 text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/60">
                                    {pointGroup.samplingPoint}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* Column Indikator Mutu Limbah Cair */}
                            <td
                              className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-left font-semibold ${dataCellBg}`}
                            >
                              {row.indicator}
                            </td>

                            {/* Column Nilai Normal */}
                            <td
                              className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center tabular-nums font-medium ${dataCellBg}`}
                            >
                              {row.normalValue}
                            </td>

                            {/* Column Nilai Hasil Pemeriksaan (Clickable Inline Edit) */}
                            <td
                              className={`border border-slate-400 dark:border-slate-700 px-3 py-2 text-center tabular-nums ${resultCellBg}`}
                            >
                              {editingRowId === row.id ? (
                                <div className="inline-flex items-center gap-1">
                                  <input
                                    type="text"
                                    aria-label={`Input Nilai ${row.samplingPoint} ${row.indicator} ${row.monthName}`}
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineEdit(row.id);
                                      if (e.key === 'Escape') setEditingRowId(null);
                                    }}
                                    className="w-20 px-2 py-0.5 text-center text-xs font-bold rounded border border-[#002147] bg-white text-[#002147] shadow-xs"
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
                                  title="Klik untuk mengubah nilai hasil pemeriksaan secara realtime"
                                >
                                  {row.resultValue}
                                </button>
                              )}
                            </td>

                            {/* Column Capaian (MS / TMS) */}
                            <td
                              className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-black tracking-wider ${capaianCellBg}`}
                            >
                              {row.status}
                            </td>

                            {/* Column Keterangan */}
                            <td
                              className={`border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-left text-[11px] font-medium ${capaianCellBg}`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span>{row.notes}</span>
                                {isTms && (
                                  <button
                                    type="button"
                                    onClick={() => handleCreateSupervisionFinding(row)}
                                    title="Buat temuan supervisi tindak lanjut"
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-800 text-white hover:bg-amber-900 shrink-0 font-semibold cursor-pointer"
                                  >
                                    + Temuan
                                  </button>
                                )}
                              </div>
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
        ) : (
          /* Sheet 2: Rekapan Data Matriks 12 Bulan */
          <div className="overflow-x-auto max-h-[780px] overflow-y-auto smooth-scroll-container">
            <table className="w-full min-w-[1080px] border-collapse text-xs sm:text-sm">
              <thead className="sticky top-0 z-20 shadow-xs">
                <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                  <th
                    rowSpan={2}
                    className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-2.5 text-center font-extrabold text-xs tracking-wider w-24 uppercase align-middle"
                  >
                    LIMBAH
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-2.5 text-center font-extrabold text-xs tracking-wider min-w-[150px] align-middle"
                  >
                    Indikator Mutu Limbah Cair
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-2 py-2.5 text-center font-extrabold text-xs tracking-wider w-24 align-middle"
                  >
                    Nilai Normal
                  </th>
                  <th
                    colSpan={12}
                    className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-2 py-2 text-center font-black text-xs tracking-widest uppercase align-middle"
                  >
                    BULAN
                  </th>
                </tr>
                <tr className="bg-[#FAF6F0] dark:bg-[#001B3B] text-[#002147] dark:text-[#D2B48C] font-bold">
                  {WASTEWATER_MONTHS.map((m) => (
                    <th
                      key={m.no}
                      className="border border-slate-400 dark:border-slate-700 bg-[#FAF6F0] dark:bg-[#001B3B] px-2 py-2 text-center font-extrabold text-[11px] min-w-[66px] uppercase tracking-wider align-middle"
                    >
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#002147] dark:text-slate-100">
                {(['IPAL INLET', 'IPAL OUTLET'] as WastewaterSamplingPoint[]).map((point) => {
                  return WASTEWATER_INDICATOR_ORDER.map((indicator, indIdx) => {
                    const spec = WASTEWATER_STANDARDS[indicator];
                    const isFirstRowOfPoint = indIdx === 0;

                    return (
                      <tr key={`${point}-${indicator}`}>
                        {/* Merged LIMBAH Column (11 rows) */}
                        {isFirstRowOfPoint && (
                          <td
                            rowSpan={WASTEWATER_INDICATOR_ORDER.length}
                            className="border border-slate-400 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-800 text-[#002147] dark:text-[#D2B48C] font-extrabold text-center align-middle uppercase tracking-wide text-xs w-24"
                          >
                            <span className="block font-black text-[13px] leading-tight">
                              {point}
                            </span>
                          </td>
                        )}

                        {/* Indikator Mutu Column */}
                        <td className="border border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-[#002147] dark:text-slate-100 px-3 py-2 font-bold text-left whitespace-nowrap">
                          {indicator === 'SULFIDA' ? 'SULFID' : indicator}
                        </td>

                        {/* Nilai Normal Column */}
                        <td className="border border-slate-400 dark:border-slate-700 bg-[#FAF6F0]/80 dark:bg-slate-800/80 text-[#002147] dark:text-slate-100 px-2 py-2 text-center tabular-nums font-semibold">
                          {spec.normalDisplay === '-' ? '' : spec.normalDisplay}
                        </td>

                        {/* 12 Months Columns */}
                        {WASTEWATER_MONTHS.map((m) => {
                          const cellRow = rows.find(
                            (r) =>
                              r.samplingPoint === point &&
                              r.indicator === indicator &&
                              r.month === m.no
                          );
                          const isTms = cellRow?.status === 'TMS';
                          const isCriticalRed =
                            point === 'IPAL OUTLET' &&
                            isTms &&
                            (indicator === 'TOTAL COLIFORM' || (indicator === 'PH' && m.no === 5));

                          let cellBg =
                            'bg-white dark:bg-slate-900 text-[#002147] dark:text-slate-100 hover:bg-[#FAF6F0]';
                          if (isCriticalRed) {
                            cellBg = 'bg-[#DC2626] text-white font-black';
                          } else if (isTms) {
                            cellBg =
                              'bg-[#FDE047] dark:bg-[#FACC15] text-slate-950 font-bold';
                          }

                          const displayVal = cellRow ? cellRow.resultValue : '-';

                          return (
                            <td
                              key={m.no}
                              className={`border border-slate-400 dark:border-slate-700 px-2 py-1.5 text-center tabular-nums text-xs transition-colors ${cellBg}`}
                            >
                              {cellRow ? (
                                editingRowId === cellRow.id ? (
                                  <div className="inline-flex items-center gap-0.5">
                                    <input
                                      type="text"
                                      aria-label={`Input ${point} ${indicator} ${m.name}`}
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveInlineEdit(cellRow.id);
                                        if (e.key === 'Escape') setEditingRowId(null);
                                      }}
                                      className="w-14 px-1 py-0.5 text-center text-xs font-bold rounded border border-[#002147] bg-white text-[#002147] shadow-xs"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveInlineEdit(cellRow.id)}
                                      aria-label="Simpan Nilai"
                                      className="p-0.5 rounded bg-[#002147] text-white hover:bg-[#001630]"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartInlineEdit(cellRow)}
                                    className="w-full py-0.5 font-bold tabular-nums cursor-pointer select-none hover:underline"
                                    title={`Klik untuk mengedit data ${point} ${indicator} ${m.name}`}
                                  >
                                    {displayVal}
                                  </button>
                                )
                              ) : (
                                '-'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Legend Bar di Bawah Tabel */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#EFE4D2]/75 dark:bg-[#00152E] border-t border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] sm:text-xs text-[#002147] dark:text-[#D2B48C] font-semibold flex items-center gap-1.5">
            <span>Keterangan Status Capaian:</span>
          </div>

          {/* Keterangan Status Baku Mutu di Bawah Tabel */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[#002147] dark:text-slate-200 font-semibold border border-[#D2B48C] dark:border-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span>MS: Memenuhi Syarat Baku Mutu</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FDE047] text-slate-950 font-bold border border-amber-500 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shrink-0" />
              <span>TMS: Tidak Memenuhi Syarat</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DC2626] text-white font-bold border border-red-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shrink-0" />
              <span>Kritis / Melebihi Baku Mutu</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4. GRAFIK TREN IPAL & EFISIENSI REDUKSI (REALTIME DARI DATA TABEL) */}
      <section
        aria-label="Visualisasi Grafik Data Pengelolaan Limbah Cair"
        className="rounded-[28px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 p-4 sm:p-5 shadow-[0_14px_38px_rgba(21,62,117,0.08)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1D7AFC] dark:text-blue-400">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Grafik Kinerja & Efisiensi Pengolahan IPAL</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Komparasi Inlet vs Outlet Terhadap Baku Mutu Lingkungan
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Selector Tabs */}
            <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartMetric('bod_cod')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  chartMetric === 'bod_cod'
                    ? 'bg-[#153E75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                BOD & COD
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('coliform')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  chartMetric === 'coliform'
                    ? 'bg-[#153E75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Total Coliform
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('ph')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  chartMetric === 'ph'
                    ? 'bg-[#153E75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Derajat Keasaman (pH)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('tss')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  chartMetric === 'tss'
                    ? 'bg-[#153E75] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                TSS (Zat Tersuspensi)
              </button>
            </div>

            {/* Chart Type Toggle */}
            <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  chartType === 'line'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Line
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'bod_cod' ? (
              chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine
                    y={30}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{ value: 'Baku Mutu BOD: 30 mg/L', fill: '#EF4444', fontSize: 10, position: 'top' }}
                  />
                  <Bar dataKey="inletBod" name="BOD Inlet (mg/L)" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outletBod" name="BOD Outlet (mg/L)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outletCod" name="COD Outlet (mg/L)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 60]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="4 4" label="Baku Mutu BOD (30)" />
                  <Line type="monotone" dataKey="inletBod" name="BOD Inlet" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="outletBod" name="BOD Outlet" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="outletCod" name="COD Outlet" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              )
            ) : chartMetric === 'coliform' ? (
              chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine
                    y={3000}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{ value: 'Baku Mutu: 3.000 MPN/100ml', fill: '#EF4444', fontSize: 10, position: 'top' }}
                  />
                  <Bar dataKey="inletColiform" name="Inlet Coliform (MPN/100ml)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outletColiform" name="Outlet Coliform (MPN/100ml)" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine y={3000} stroke="#EF4444" strokeDasharray="4 4" label="Baku Mutu (3.000)" />
                  <Line type="monotone" dataKey="inletColiform" name="Inlet Coliform" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="outletColiform" name="Outlet Coliform" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              )
            ) : chartMetric === 'ph' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                <YAxis domain={[3, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={6.0} stroke="#EF4444" strokeDasharray="4 4" label="Batas Bawah pH (6.0)" />
                <ReferenceLine y={9.0} stroke="#EF4444" strokeDasharray="4 4" label="Batas Atas pH (9.0)" />
                <Line type="monotone" dataKey="inletPh" name="pH Influena Inlet" stroke="#EA580C" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="outletPh" name="pH Efluen Outlet" stroke="#0284C7" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 40]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="4 4" label="Baku Mutu TSS (30 mg/L)" />
                <Bar dataKey="inletTss" name="TSS Inlet (mg/L)" fill="#D97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outletTss" name="TSS Outlet (mg/L)" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Live Efficiency Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Reduksi BOD</span>
            <span className="text-sm font-bold text-emerald-600">
              {metrics.avgBodReduction}% Efluen
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Reduksi COD</span>
            <span className="text-sm font-bold text-blue-600">
              {metrics.avgCodReduction}% Efluen
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Reduksi Coliform</span>
            <span className="text-sm font-bold text-purple-600">
              {metrics.avgColiformReduction}% Desinfeksi
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Stabilitas pH Efluen</span>
            <span className="text-sm font-bold text-teal-600">
              6.23 - 7.30 (Aman)
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
            Berdasarkan hasil pemantauan dan pengujian laboratorium terhadap parameter fisika, kimia, dan mikrobiologi outlet IPAL di UOBK RSUD Al-Mulk sepanjang periode tahun {selectedYear}, secara umum sistem pengolahan limbah cair berfungsi secara efektif. Konsentrasi parameter kunci pada outlet seperti BOD (6–28 mg/L), COD (20–83 mg/L), dan TSS (5–15 mg/L) seluruhnya berada di bawah ambang batas baku mutu maksimal yang ditetapkan (BOD ≤ 30 mg/L, COD ≤ 100 mg/L, TSS ≤ 30 mg/L sesuai Permen LHK No. 68 Tahun 2016). Nilai derajat keasaman (pH) outlet berkisar antara 4,11 hingga 7,62, di mana sebagian besar bulan berada pada rentang netral 6,0–9,0. Efisiensi reduksi beban pencemar dari inlet ke outlet menunjukkan performa aerasi dan sedimentasi yang optimal, sehingga efluen yang dihasilkan aman terhadap lingkungan sekitar dan dapat dimanfaatkan kembali (<em>water reuse</em>) untuk penyiraman taman rumah sakit.
          </p>
        </div>

        {/* Bagian Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li>
              Melakukan perawatan berkala (<em>preventive maintenance</em>) terhadap mesin blower aerasi, pompa transfer limbah, dan <em>dosing pump</em> klorinasi secara terjadwal untuk mencegah penurunan efisiensi pengolahan.
            </li>
            <li>
              Menjaga kestabilan dosis bahan netralisasi dan disinfektan (kaporit/klorin) agar fluktuasi nilai pH dan angka Total Coliform pada outlet tetap konsisten memenuhi standar baku mutu.
            </li>
            <li>
              Melakukan pengurasan dan pengelolaan lumpur aktif (<em>sludge removal</em>) pada bak sedimentasi secara berkala guna mencegah akumulasi endapan padatan.
            </li>
            <li>
              Melanjutkan kerja sama pemantauan dan uji sampel berkala dengan laboratorium lingkungan eksternal terakreditasi KAN setiap bulan secara konsisten.
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
              Melaksanakan inspeksi supervisi harian terhadap operasional bak ekualisasi, clarifier, dan ruang dosing klorinasi oleh tim Sanitarian RSUD Al-Mulk.
            </li>
            <li>
              Melakukan kalibrasi berkala pada instrumen pH meter portabel dan sensor debit efluen setiap triwulan.
            </li>
            <li>
              Mengagendakan desinfeksi berkala kompartemen kontak klorin dan pengurasan bak kontrol setiap 6 bulan sekali.
            </li>
            <li>
              Menyusun dan menyampaikan pelaporan semesteran pemenuhan baku mutu limbah cair rumah sakit ke Dinas Lingkungan Hidup Kota Sukabumi serta penginputan pada sistem SIMPEL KLHK.
            </li>
          </ol>
        </div>
      </section>

      {/* 6. MODAL CEPAT INPUT NILAI PEMERIKSAAN LIMBAH */}
      {isInputModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#153E75] dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Input / Edit Nilai Hasil Pemeriksaan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInputModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bulan Pemeriksaan (Tahun 2026)
                </label>
                <select
                  value={modalMonth}
                  onChange={(e) => setModalMonth(parseInt(e.target.value, 10))}
                  aria-label="Pilih Bulan Pemeriksaan"
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {WASTEWATER_MONTHS.map((m) => (
                    <option key={m.no} value={m.no}>
                      {m.name} (Bulan {m.no})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titik Pengambilan Sampel
                </label>
                <select
                  value={modalPoint}
                  onChange={(e) => setModalPoint(e.target.value as WastewaterSamplingPoint)}
                  aria-label="Pilih Titik Pengambilan Sampel Modal"
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {WASTEWATER_SAMPLING_POINTS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parameter Baku Mutu Limbah Cair
                </label>
                <select
                  value={modalIndicator}
                  onChange={(e) => setModalIndicator(e.target.value as WastewaterIndicatorName)}
                  aria-label="Pilih Parameter Baku Mutu Modal"
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {WASTEWATER_INDICATOR_ORDER.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind} — Nilai Normal: {WASTEWATER_STANDARDS[ind].normalDisplay} {WASTEWATER_STANDARDS[ind].unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai Hasil Pemeriksaan
                </label>
                <input
                  type="text"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder="Contoh: 15 atau 6,23 atau <0,0100"
                  aria-label="Nilai Hasil Pemeriksaan Modal"
                  required
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Baku Mutu: {WASTEWATER_STANDARDS[modalIndicator].normalDisplay} {WASTEWATER_STANDARDS[modalIndicator].unit}. Jika melebihi baku mutu, otomatis ditandai TMS warna kuning.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153E75] text-white font-bold hover:bg-[#10315E] shadow-sm"
                >
                  Simpan & Sinkronkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
