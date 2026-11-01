'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bug,
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  Droplets,
  FileSpreadsheet,
  Flame,
  MoreVertical,
  Pause,
  Play,
  ShieldCheck,
  Timer,
  TrendingUp,
  Utensils,
  Waves,
  Wind,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '@/components/sikesling/app-provider';
import { calculateDashboardSummary } from '@/lib/domain';
import {
  DASHBOARD_MONTHS,
  DashboardMonitoringModuleKey,
  DashboardPeriodConfig,
  DashboardPeriodMode,
  buildAllModulesDashboardSummaries,
  formatDashboardPeriodLabel,
  formatRealtimeGreeting,
  readRealtimeMonitoringDatasetFromStorage,
} from '@/lib/dashboard-monitoring-trends';

interface QuickChecklistItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  completed: boolean;
  iconType: 'air' | 'ipal' | 'vektor' | 'supervisi' | 'laporan';
}

const INITIAL_CHECKLIST_ITEMS: QuickChecklistItem[] = [
  {
    id: 'chk-1',
    title: 'Monitoring Kualitas Air & Udara',
    subtitle: 'Air 100% MS · Fisik Udara 20 Ruangan',
    href: '/monitoring/kualitas-air',
    completed: true,
    iconType: 'air',
  },
  {
    id: 'chk-2',
    title: 'Limbah Cair IPAL & Padat B3',
    subtitle: 'Inlet-Outlet IPAL · B3 3.952 Kg/Thn',
    href: '/monitoring/ipal',
    completed: true,
    iconType: 'ipal',
  },
  {
    id: 'chk-3',
    title: 'Vektor & Higiene Sanitasi Pangan',
    subtitle: 'Bebas Vektor 92% · Jasa Boga 84%',
    href: '/monitoring/vektor',
    completed: true,
    iconType: 'vektor',
  },
  {
    id: 'chk-4',
    title: 'Supervisi & Tindak Lanjut Temuan',
    subtitle: 'Inspeksi 20 Unit · Verifikasi Perbaikan',
    href: '/supervisi/dashboard',
    completed: false,
    iconType: 'supervisi',
  },
  {
    id: 'chk-5',
    title: 'Analisis Tren & Laporan Berkala',
    subtitle: 'Grafik Evaluasi · Rekap Bulanan–Tahunan',
    href: '/laporan/bulanan',
    completed: false,
    iconType: 'laporan',
  },
];

export function DashboardView() {
  const {
    activities,
    supervisions,
    findings,
    schedules,
    waterRows,
    airItems,
    wastewaterRows,
    solidWasteRows,
    vectorFindings,
    vectorUnits,
    foodRows,
  } = useApp();

  const [openAccordion, setOpenAccordion] = useState<string>('monitoring');
  const [checklist, setChecklist] = useState<QuickChecklistItem[]>(INITIAL_CHECKLIST_ITEMS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(225); // 03:45 default visual match

  // Top Header Period Controls State (Tahun + Bulan / Triwulan / Semester / Tahunan)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [periodMode, setPeriodMode] = useState<DashboardPeriodMode>('TAHUNAN');
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Oktober default
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(4);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(2);

  // Bottom Interactive Monitoring Trend Card State
  const [selectedModule, setSelectedModule] = useState<DashboardMonitoringModuleKey>('air');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [currentHour, setCurrentHour] = useState<number>(9);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setCurrentHour(new Date().getHours());
    }, 0);
    const clockInterval = window.setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);
    return () => {
      window.clearTimeout(mountTimer);
      window.clearInterval(clockInterval);
    };
  }, []);

  const realtimeDataset = useMemo(() => {
    return readRealtimeMonitoringDatasetFromStorage(
      selectedYear,
      activities,
      false,
      {
        waterRows,
        airItems,
        wastewaterRows,
        solidWasteRows,
        vectorFindings,
        vectorUnitCount: vectorUnits.length,
        foodRows,
      }
    );
  }, [
    selectedYear,
    activities,
    waterRows,
    airItems,
    wastewaterRows,
    solidWasteRows,
    vectorFindings,
    vectorUnits.length,
    foodRows,
  ]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const periodConfig: DashboardPeriodConfig = useMemo(
    () => ({
      year: selectedYear,
      mode: periodMode,
      month: selectedMonth,
      quarter: selectedQuarter,
      semester: selectedSemester,
    }),
    [selectedYear, periodMode, selectedMonth, selectedQuarter, selectedSemester]
  );

  const activePeriodLabel = useMemo(
    () => formatDashboardPeriodLabel(periodConfig),
    [periodConfig]
  );

  const moduleSummaries = useMemo(
    () => buildAllModulesDashboardSummaries(periodConfig, realtimeDataset),
    [periodConfig, realtimeDataset]
  );

  const activeModuleSummary = moduleSummaries[selectedModule];

  const overallComplianceAvg = useMemo(() => {
    const keys: DashboardMonitoringModuleKey[] = [
      'air',
      'udara',
      'ipal',
      'limbah_b3',
      'vektor',
      'pangan',
    ];
    const sum = keys.reduce((acc, k) => acc + moduleSummaries[k].complianceAvg, 0);
    return Math.round(sum / keys.length);
  }, [moduleSummaries]);

  const summary = calculateDashboardSummary({
    activities,
    supervisions,
    findings,
    schedules,
  });

  const completedTasksCount = checklist.filter((c) => c.completed).length;

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // 6 Indikator Utama Monitoring (Air, Udara, Limbah Cair, Limbah B3, Vektor, Pangan) synced with Realtime Summaries
  const monitoringBars: {
    key: DashboardMonitoringModuleKey;
    code: string;
    label: string;
    heightPercent: number;
    active: boolean;
    score: string;
    badge?: string;
  }[] = [
    {
      key: 'air',
      code: 'Air',
      label: 'Kualitas Air',
      heightPercent: Math.max(35, moduleSummaries.air.complianceAvg),
      active: selectedModule === 'air',
      score: `${moduleSummaries.air.complianceAvg}%`,
      badge: selectedModule === 'air' ? `${moduleSummaries.air.complianceAvg}% MS` : undefined,
    },
    {
      key: 'udara',
      code: 'Udr',
      label: 'Kualitas Udara',
      heightPercent: Math.max(35, moduleSummaries.udara.complianceAvg),
      active: selectedModule === 'udara',
      score: `${moduleSummaries.udara.complianceAvg}%`,
      badge: selectedModule === 'udara' ? `${moduleSummaries.udara.complianceAvg}% MS` : undefined,
    },
    {
      key: 'ipal',
      code: 'Cair',
      label: 'Limbah Cair',
      heightPercent: Math.max(35, moduleSummaries.ipal.complianceAvg),
      active: selectedModule === 'ipal',
      score: `${moduleSummaries.ipal.complianceAvg}%`,
      badge: selectedModule === 'ipal' ? `${moduleSummaries.ipal.complianceAvg}% MS` : undefined,
    },
    {
      key: 'limbah_b3',
      code: 'B3',
      label: 'Limbah Padat',
      heightPercent: Math.max(35, moduleSummaries.limbah_b3.complianceAvg),
      active: selectedModule === 'limbah_b3',
      score: `${moduleSummaries.limbah_b3.complianceAvg}%`,
      badge:
        selectedModule === 'limbah_b3'
          ? moduleSummaries.limbah_b3.badgeText
          : undefined,
    },
    {
      key: 'vektor',
      code: 'Vkt',
      label: 'Bebas Vektor',
      heightPercent: Math.max(35, moduleSummaries.vektor.complianceAvg),
      active: selectedModule === 'vektor',
      score: `${moduleSummaries.vektor.complianceAvg}%`,
      badge: selectedModule === 'vektor' ? `${moduleSummaries.vektor.complianceAvg}% MS` : undefined,
    },
    {
      key: 'pangan',
      code: 'Pgn',
      label: 'Sanitasi Pangan',
      heightPercent: Math.max(35, moduleSummaries.pangan.complianceAvg),
      active: selectedModule === 'pangan',
      score: `${moduleSummaries.pangan.complianceAvg}%`,
      badge: selectedModule === 'pangan' ? `${moduleSummaries.pangan.complianceAvg}% IKL` : undefined,
    },
  ];

  const renderChecklistIcon = (type: QuickChecklistItem['iconType']) => {
    switch (type) {
      case 'air':
        return <Droplets className="w-3.5 h-3.5 text-[#D2B48C]" />;
      case 'ipal':
        return <Activity className="w-3.5 h-3.5 text-[#D2B48C]" />;
      case 'vektor':
        return <Wind className="w-3.5 h-3.5 text-[#D2B48C]" />;
      case 'laporan':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#D2B48C]" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#D2B48C]" />;
    }
  };

  return (
    <div className="w-full flex-1 min-h-0 px-3 sm:px-4 lg:px-5 pb-3 pt-2.5 sm:pt-3.5 lg:pt-4 flex flex-col justify-between gap-3.5 lg:overflow-hidden">
      {/* =====================================================================
          SECTION 1: HERO HEADER & PERIOD FILTER CONTROLS
         ===================================================================== */}
      <section className="shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          {/* Left: Realtime Greeting + Italic Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-bold tracking-tight text-[#002147] dark:text-white leading-tight">
              {formatRealtimeGreeting(currentHour, 'Fitria')}
            </h1>
            <p className="text-xs sm:text-sm italic text-[#002147]/75 dark:text-slate-300 leading-relaxed">
              Pantau kualitas lingkungan, kelola supervisi, dan tindak lanjuti temuan secara terintegrasi
            </p>
          </div>

          {/* Right: Period Filter Controls (Aligned with Subtitle in Right Corner) */}
          <div
            role="group"
            aria-label="Filter Periode Monitoring Dashboard"
            className="flex flex-wrap items-center lg:justify-end gap-2 shrink-0"
          >
            {/* 1. Tombol Pilih Tahun */}
            <div className="relative inline-flex items-center rounded-full bg-[#002147] text-white pl-3.5 pr-2.5 py-1.5 shadow-xs border border-[#002147] dark:border-[#D2B48C]/40">
              <Calendar className="w-3.5 h-3.5 text-[#D2B48C] mr-1.5 shrink-0" />
              <span className="text-[11px] font-medium text-[#D2B48C] mr-1.5">
                Tahun
              </span>
              <select
                aria-label="Pilih Periode Tahun"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value={2024} className="bg-[#002147] text-white">
                  2024
                </option>
                <option value={2025} className="bg-[#002147] text-white">
                  2025
                </option>
                <option value={2026} className="bg-[#002147] text-white">
                  2026
                </option>
                <option value={2027} className="bg-[#002147] text-white">
                  2027
                </option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#D2B48C] pointer-events-none -ml-3" />
            </div>

            {/* 2. Segmented Pill Mode Periode: Bulan, Triwulan, Semester, Tahunan */}
            <div className="inline-flex items-center p-1 rounded-full bg-white/95 dark:bg-[#001835] border border-[#D2B48C]/70 dark:border-slate-700 shadow-2xs">
              {(
                [
                  { mode: 'BULAN', label: 'Bulan' },
                  { mode: 'TRIWULAN', label: 'Triwulan' },
                  { mode: 'SEMESTER', label: 'Semester' },
                  { mode: 'TAHUNAN', label: 'Tahunan' },
                ] as { mode: DashboardPeriodMode; label: string }[]
              ).map((item) => {
                const isActive = periodMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => {
                      setPeriodMode(item.mode);
                      setHoveredPointIdx(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#002147] text-[#D2B48C] shadow-xs font-bold'
                        : 'text-[#002147]/80 dark:text-slate-300 hover:text-[#002147] hover:bg-[#FAF6F0]/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* 3. Sub-Periode Spesifik (Muncul otomatis untuk Bulan, Triwulan, atau Semester) */}
            {periodMode === 'BULAN' && (
              <div className="relative inline-flex items-center rounded-full bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C] dark:border-slate-700 px-3 py-1.5 shadow-2xs">
                <select
                  aria-label="Pilih Bulan"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    setHoveredPointIdx(null);
                  }}
                  className="bg-transparent text-[#002147] dark:text-[#D2B48C] text-xs font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {DASHBOARD_MONTHS.map((m) => (
                    <option
                      key={m.no}
                      value={m.no}
                      className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white"
                    >
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] pointer-events-none -ml-3" />
              </div>
            )}

            {periodMode === 'TRIWULAN' && (
              <div className="relative inline-flex items-center rounded-full bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C] dark:border-slate-700 px-3 py-1.5 shadow-2xs">
                <select
                  aria-label="Pilih Triwulan"
                  value={selectedQuarter}
                  onChange={(e) => {
                    setSelectedQuarter(Number(e.target.value) as 1 | 2 | 3 | 4);
                    setHoveredPointIdx(null);
                  }}
                  className="bg-transparent text-[#002147] dark:text-[#D2B48C] text-xs font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  <option value={1} className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white">
                    Triwulan I (Jan–Mar)
                  </option>
                  <option value={2} className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white">
                    Triwulan II (Apr–Jun)
                  </option>
                  <option value={3} className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white">
                    Triwulan III (Jul–Sep)
                  </option>
                  <option value={4} className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white">
                    Triwulan IV (Okt–Des)
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] pointer-events-none -ml-3" />
              </div>
            )}

            {periodMode === 'SEMESTER' && (
              <div className="relative inline-flex items-center rounded-full bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C] dark:border-slate-700 px-3 py-1.5 shadow-2xs">
                <select
                  aria-label="Pilih Semester"
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(Number(e.target.value) as 1 | 2);
                    setHoveredPointIdx(null);
                  }}
                  className="bg-transparent text-[#002147] dark:text-[#D2B48C] text-xs font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  <option value={1} className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white">
                    Semester I (Jan–Jun)
                  </option>
                  <option value={2} className="bg-white dark:bg-[#001835] text-[#002147] dark:text-white">
                    Semester II (Jul–Des)
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] pointer-events-none -ml-3" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: SINGLE-VIEWPORT HERO BENTO GRID (4 Columns, No Scroll)
         ===================================================================== */}
      <section
        aria-label="Panel Utama SIKESLING RSAM"
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch"
      >
        {/* -------------------------------------------------------------------
            COLUMN 1 (lg:col-span-3): Officer Profile Card + Quick Menu Accordion
           ------------------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          {/* Card 1A: 3D Pop-Out Hero Banner Portrait Card (Preserved) */}
          <div className="relative h-[230px] xl:h-[245px] pt-5 select-none group shrink-0">
            <div className="relative h-full w-full rounded-[26px] bg-gradient-to-b from-[#E5CDAE] via-[#1C3D63] to-[#002147] shadow-[0_16px_36px_rgba(0,33,71,0.20),inset_0_1.5px_2px_rgba(255,255,255,0.95)] border-[1.5px] border-white/95 dark:border-[#D2B48C]/30 flex flex-col justify-end p-4">
              {/* Clipped Background Scenery & Animated Grafik/Laporan Widgets Inside Card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[25px] overflow-hidden z-0"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#FAF6F0]/45 blur-2xl" />
                <div className="absolute top-3 right-9 w-7 h-7 rounded-full bg-[#D2B48C]/45" />
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-48 h-14 rounded-full border border-[#D2B48C]/60 -rotate-6 shadow-[0_0_20px_rgba(210,180,140,0.3)]" />

                {/* Left Animated Floating Widget: Grafik */}
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [-2, 1, -2] }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-4 left-3 w-[84px] h-[118px] rounded-2xl bg-white/30 backdrop-blur-md border border-white/55 shadow-[0_10px_24px_rgba(0,33,71,0.18),inset_0_1px_1px_rgba(255,255,255,0.75)] p-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-6 h-6 rounded-lg bg-[#002147] text-[#D2B48C] flex items-center justify-center shadow-xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </motion.div>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#FAF6F0]/90 text-[#002147] text-[8px] font-extrabold tracking-tight shadow-2xs">
                      <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                      92%
                    </span>
                  </div>

                  {/* Animated Mini Bar Chart */}
                  <div className="flex items-end justify-between gap-1.5 h-11 px-1 pt-1">
                    {[
                      { heights: ['38%', '82%', '52%', '38%'], delay: 0, color: 'bg-[#002147]' },
                      { heights: ['65%', '35%', '90%', '65%'], delay: 0.25, color: 'bg-[#D2B48C]' },
                      { heights: ['45%', '95%', '60%', '45%'], delay: 0.5, color: 'bg-[#002147]' },
                      { heights: ['80%', '50%', '100%', '80%'], delay: 0.75, color: 'bg-[#FAF6F0]' },
                    ].map((bar, idx) => (
                      <div
                        key={idx}
                        className="w-2.5 h-full rounded-full bg-white/25 flex items-end overflow-hidden p-[1px]"
                      >
                        <motion.div
                          animate={{ height: bar.heights }}
                          transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: bar.delay,
                          }}
                          className={`w-full rounded-full ${bar.color}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/35 pt-1">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white drop-shadow-2xs">
                      Grafik
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </motion.div>

                {/* Right Animated Floating Widget: Laporan */}
                <motion.div
                  animate={{ y: [0, 6, 0], rotate: [2, -1, 2] }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="absolute top-7 right-3 w-[84px] h-[112px] rounded-2xl bg-white/30 backdrop-blur-md border border-white/55 shadow-[0_10px_24px_rgba(0,33,71,0.18),inset_0_1px_1px_rgba(255,255,255,0.75)] p-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-1.5 py-0.5 rounded-full bg-[#002147]/85 text-[#D2B48C] text-[8px] font-extrabold tracking-tight">
                      Rekap
                    </span>
                    <motion.div
                      animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-6 h-6 rounded-lg bg-[#FAF6F0] text-[#002147] flex items-center justify-center shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>

                  {/* Animated Report Lines & Check Indicator */}
                  <div className="space-y-1.5 px-0.5 my-auto">
                    <div className="h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
                      <motion.div
                        animate={{ width: ['45%', '95%', '70%', '45%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full rounded-full bg-[#002147]"
                      />
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
                      <motion.div
                        animate={{ width: ['75%', '40%', '90%', '75%'] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        className="h-full rounded-full bg-[#D2B48C]"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1 pt-0.5">
                      <motion.span
                        animate={{ scale: [0.92, 1.06, 0.92] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[7px] font-bold shadow-2xs"
                      >
                        <Check className="w-2 h-2 stroke-[3]" />
                        Valid
                      </motion.span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/35 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2B48C] animate-ping" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white drop-shadow-2xs">
                      Laporan
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* 3D Pop-Out Subject Container */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 -top-7 rounded-b-[25px] overflow-hidden z-10 flex items-end justify-center">
                <div className="relative w-[90%] h-full transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02]">
                  <Image
                    src="/assets/aistudio/fitria_mirrored_cutout.png"
                    alt="Profil Fitria Wulandari, A.M.KL - Sanitarian RSAM"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    referrerPolicy="no-referrer"
                    className="object-contain object-bottom drop-shadow-[0_14px_24px_rgba(0,33,71,0.45)]"
                  />
                </div>
              </div>

              {/* Bottom Contrast Scrim Over Lower Torso */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[25px] bg-gradient-to-t from-[#002147] via-[#002147]/80 to-transparent z-20"
              />

              {/* Officer Name & Frosted Pill Badge */}
              <div className="relative z-30 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[14px] font-bold text-white tracking-tight leading-snug drop-shadow-xs">
                    Fitria Wulandari, A.M.KL
                  </div>
                  <div className="text-[12px] font-semibold text-[#D2B48C]">
                    Sanitarian RSAM
                  </div>
                </div>
                <Link
                  href="/pengaturan/rumah-sakit"
                  className="px-3.5 py-1 rounded-full border border-[#D2B48C]/70 bg-[#002147]/70 backdrop-blur-md text-[11px] font-semibold text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#002147] transition-colors whitespace-nowrap shadow-xs"
                >
                  RSUD Al-Mulk
                </Link>
              </div>
            </div>
          </div>

          {/* Card 1B: Expandable Quick Menu Card covering all modules */}
          <div className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_12px_32px_rgba(0,33,71,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] px-4 py-2.5 flex-1 min-h-0 flex flex-col justify-between divide-y divide-[#D2B48C]/35 dark:divide-slate-800 overflow-hidden">
            {/* Row 1: Monitoring Lingkungan */}
            <div className="py-1 first:pt-0">
              <button
                type="button"
                onClick={() =>
                  setOpenAccordion(openAccordion === 'monitoring' ? '' : 'monitoring')
                }
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#002147] dark:text-slate-200 hover:text-[#002147] dark:hover:text-[#D2B48C] py-0.5 cursor-pointer"
              >
                <span>Monitoring Lingkungan (6)</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openAccordion === 'monitoring' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'monitoring' && (
                <div className="pt-1 pb-0.5 grid grid-cols-3 gap-1">
                  <Link
                    href="/monitoring/kualitas-air"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Air Bersih
                  </Link>
                  <Link
                    href="/monitoring/kualitas-udara"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Udara Fisik
                  </Link>
                  <Link
                    href="/monitoring/limbah"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Limbah Cair
                  </Link>
                  <Link
                    href="/monitoring/ipal"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Limbah B3
                  </Link>
                  <Link
                    href="/monitoring/vektor"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Vektor
                  </Link>
                  <Link
                    href="/monitoring/sanitasi-pangan"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Pangan
                  </Link>
                </div>
              )}
            </div>

            {/* Row 2: Instrumen Supervisi */}
            <div className="py-1">
              <button
                type="button"
                onClick={() =>
                  setOpenAccordion(openAccordion === 'instrumen' ? '' : 'instrumen')
                }
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#002147] dark:text-slate-200 hover:text-[#002147] py-0.5 cursor-pointer"
              >
                <span>Instrumen Supervisi (5)</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openAccordion === 'instrumen' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'instrumen' && (
                <div className="pt-1 pb-0.5 grid grid-cols-3 gap-1">
                  <Link
                    href="/supervisi/baru"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Rawat Jalan
                  </Link>
                  <Link
                    href="/supervisi/igd"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Ruang IGD
                  </Link>
                  <Link
                    href="/supervisi/ranap"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Ruang Ranap
                  </Link>
                  <Link
                    href="/supervisi/icu-ibs"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    ICU & IBS
                  </Link>
                  <Link
                    href="/supervisi/evaluasi"
                    className="px-2 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] truncate text-center"
                  >
                    Supervisi
                  </Link>
                  <Link
                    href="/supervisi/riwayat"
                    className="px-2 py-1 rounded-lg bg-[#002147] text-[10px] font-semibold text-[#D2B48C] hover:bg-[#003166] truncate text-center"
                  >
                    Tabel Rekap
                  </Link>
                </div>
              )}
            </div>

            {/* Row 3: Grafik & Analisis */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'analisis' ? '' : 'analisis')}
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#002147] dark:text-slate-200 hover:text-[#002147] py-0.5 cursor-pointer"
              >
                <span>Grafik & Analisis Data</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openAccordion === 'analisis' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'analisis' && (
                <div className="pt-1 pb-0.5 flex flex-wrap gap-1">
                  <Link
                    href="/analisis/kegiatan"
                    className="px-2.5 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C]"
                  >
                    Tren Kegiatan
                  </Link>
                  <Link
                    href="/analisis/supervisi"
                    className="px-2.5 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C]"
                  >
                    Supervisi
                  </Link>
                  <Link
                    href="/analisis/tindak-lanjut"
                    className="px-2.5 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C]"
                  >
                    Tindak Lanjut
                  </Link>
                </div>
              )}
            </div>

            {/* Row 4: Rekapitulasi Laporan */}
            <div className="py-1 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'laporan' ? '' : 'laporan')}
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#002147] dark:text-slate-200 hover:text-[#002147] py-0.5 cursor-pointer"
              >
                <span>Rekapitulasi Laporan</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openAccordion === 'laporan' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 'laporan' && (
                <div className="pt-1 pb-0.5 flex flex-wrap gap-1">
                  <Link
                    href="/laporan/bulanan"
                    className="px-2.5 py-1 rounded-full bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C]"
                  >
                    Bulanan
                  </Link>
                  <Link
                    href="/laporan/triwulanan"
                    className="px-2.5 py-1 rounded-full bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C]"
                  >
                    Triwulanan
                  </Link>
                  <Link
                    href="/laporan/tahunan"
                    className="px-2.5 py-1 rounded-full bg-[#F5EDE0] dark:bg-[#002147] text-[10px] font-semibold text-[#002147] dark:text-[#D2B48C]"
                  >
                    Tahunan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            COLUMNS 2 & 3 (lg:col-span-6):
            Top Row = "Capaian Monitoring" + "Monitor Supervisi"
            Bottom Row = Wide Integrated Overview & Schedule Card
           ------------------------------------------------------------------- */}
        <div className="lg:col-span-6 flex flex-col gap-4 min-h-0">
          {/* Top Sub-Row: 2 Equal Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
            {/* Card 2A: Capaian Monitoring (6 Modul) */}
            <div className="h-[230px] xl:h-[245px] rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_12px_32px_rgba(0,33,71,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-normal text-[#002147] dark:text-white tracking-tight">
                    Capaian Monitoring
                  </h2>
                  <div className="mt-1 flex items-center gap-2 min-w-0">
                    <span className="text-2xl xl:text-3xl font-light tracking-tight text-[#002147] dark:text-white font-mono tabular-nums whitespace-nowrap shrink-0">
                      {overallComplianceAvg}% MS
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                      Rata-rata 6 modul
                      <br />
                      {activePeriodLabel}
                    </span>
                  </div>
                </div>
                <Link
                  href={activeModuleSummary.href}
                  aria-label="Buka Modul Monitoring Lingkungan"
                  className="w-8 h-8 rounded-full bg-[#F5EDE0] dark:bg-[#002147] border border-[#D2B48C]/60 dark:border-slate-700 flex items-center justify-center text-[#002147] dark:text-[#D2B48C] hover:bg-[#002147] hover:text-white transition-colors shadow-2xs shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 6 Vertical Stem Bars (Air, Udr, Cair, B3, Vkt, Pgn) */}
              <div className="pt-4">
                <div className="grid grid-cols-6 gap-2 items-end h-20 px-1">
                  {monitoringBars.map((bar, idx) => (
                    <button
                      key={bar.key}
                      type="button"
                      onClick={() => {
                        setSelectedModule(bar.key);
                        setHoveredPointIdx(null);
                      }}
                      aria-label={`Lihat grafik ${bar.label}`}
                      className="relative flex flex-col items-center justify-end h-full cursor-pointer group/bar focus:outline-none"
                    >
                      {bar.badge && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#002147] text-[#D2B48C] text-[9px] font-bold whitespace-nowrap shadow-xs z-10">
                          {bar.badge}
                        </div>
                      )}
                      <div
                        style={{ height: `${bar.heightPercent}%` }}
                        title={`${bar.label}: ${bar.score}`}
                        className={`w-2.5 rounded-full relative flex flex-col items-center justify-start transition-all ${
                          bar.active
                            ? 'bg-[#002147] dark:bg-[#D2B48C] scale-x-110'
                            : idx % 2 === 1
                              ? 'bg-[#D2B48C] dark:bg-[#D2B48C]/70 group-hover/bar:bg-[#002147]/70'
                              : 'bg-[#EADBC8] dark:bg-slate-700 group-hover/bar:bg-[#002147]/60'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full -mt-0.5 ${
                            bar.active
                              ? 'bg-[#D2B48C] ring-2 ring-[#002147]'
                              : 'bg-white/95 dark:bg-slate-900'
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 pt-2 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  {monitoringBars.map((bar) => (
                    <span
                      key={bar.key}
                      className={
                        bar.active
                          ? 'text-[#002147] dark:text-[#D2B48C] font-bold'
                          : ''
                      }
                    >
                      {bar.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2B: Program Kerja Kesling (Program Tahunan & Program Bulanan) */}
            <div className="h-[230px] xl:h-[245px] rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_12px_32px_rgba(0,33,71,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] p-4 xl:p-5 flex flex-col justify-between">
              {/* Header: Clean Title with 'RSUD Al-Mulk' */}
              <div>
                <h2 className="text-base xl:text-lg font-extrabold text-[#002147] dark:text-white tracking-tight leading-tight">
                  Program Kerja Kesling
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                  RSUD Al-Mulk
                </span>
              </div>

              {/* 2 Interactive Program Quick Access Cards with Hover Animation to Blue Theme & Cream Text */}
              <div className="grid grid-cols-2 gap-3 my-auto">
                {/* Program Tahunan Button Card */}
                <Link
                  href="/program-kerja/tahunan"
                  className="group/card flex flex-col justify-between p-3.5 xl:p-4 rounded-2xl bg-white/80 dark:bg-[#001835]/80 border border-[#D2B48C]/50 hover:bg-[#002147] hover:border-[#002147] dark:hover:bg-[#002147] dark:hover:border-[#D2B48C] transition-all duration-300 ease-out shadow-2xs hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <div className="text-xs xl:text-sm font-extrabold text-[#002147] dark:text-white group-hover/card:text-[#D2B48C] transition-colors leading-tight">
                    Program Tahunan
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <span className="px-3 py-1 rounded-xl bg-[#002147] text-[#D2B48C] group-hover/card:bg-[#D2B48C] group-hover/card:text-[#002147] text-[10px] font-extrabold transition-all duration-300 shadow-2xs">
                      Buka →
                    </span>
                  </div>
                </Link>

                {/* Program Bulanan Button Card */}
                <Link
                  href="/program-kerja/bulanan"
                  className="group/card flex flex-col justify-between p-3.5 xl:p-4 rounded-2xl bg-white/80 dark:bg-[#001835]/80 border border-[#D2B48C]/50 hover:bg-[#002147] hover:border-[#002147] dark:hover:bg-[#002147] dark:hover:border-[#D2B48C] transition-all duration-300 ease-out shadow-2xs hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <div className="text-xs xl:text-sm font-extrabold text-[#002147] dark:text-white group-hover/card:text-[#D2B48C] transition-colors leading-tight">
                    Program Bulanan
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <span className="px-3 py-1 rounded-xl bg-[#002147] text-[#D2B48C] group-hover/card:bg-[#D2B48C] group-hover/card:text-[#002147] text-[10px] font-extrabold transition-all duration-300 shadow-2xs">
                      Buka →
                    </span>
                  </div>
                </Link>
              </div>

              {/* Bottom Quick Footer */}
              <div className="pt-1.5 border-t border-[#D2B48C]/25 dark:border-slate-800 text-[10.5px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Tahun Perencanaan: <strong className="text-[#002147] dark:text-[#D2B48C]">{selectedYear}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Wide Card: Interactive Realtime Monitoring Trend Chart + Module Selector */}
          <div className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_12px_32px_rgba(0,33,71,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] p-3.5 xl:p-4 flex-1 min-h-0 flex flex-col justify-between gap-2">
            {/* Top Header: Only Title & Subtitle (Center Aligned) */}
            <div className="min-w-0 shrink-0 text-center">
              <h2 className="text-xs sm:text-sm font-bold text-[#002147] dark:text-white truncate">
                {activeModuleSummary.title} · {activePeriodLabel}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {activeModuleSummary.subtitle}
              </p>
            </div>

            {/* Center Interactive SVG Trend Chart */}
            {(() => {
              const pts = activeModuleSummary.points;
              const isWeight = selectedModule === 'limbah_b3';
              const maxVal = isWeight
                ? Math.max(420, ...pts.map((p) => p.primaryValue), activeModuleSummary.targetValue + 40)
                : 105;
              const minVal = isWeight ? 0 : 50;
              const range = Math.max(1, maxVal - minVal);

              const svgW = 640;
              const svgH = 104;
              const padL = 28;
              const padR = 24;
              const padT = 18;
              const padB = 20;
              const plotW = svgW - padL - padR;
              const plotH = svgH - padT - padB;

              const toX = (i: number) =>
                pts.length <= 1
                  ? padL + plotW / 2
                  : padL + (i / (pts.length - 1)) * plotW;
              const toY = (val: number) => {
                const clamped = Math.min(maxVal, Math.max(minVal, val));
                return padT + plotH - ((clamped - minVal) / range) * plotH;
              };

              const coords = pts.map((p, i) => ({
                x: toX(i),
                y: toY(p.primaryValue),
                secY: toY(
                  selectedModule === 'air' || selectedModule === 'ipal'
                    ? Math.min(100, Math.max(55, 100 - p.secondaryValue * 2))
                    : p.secondaryValue
                ),
                point: p,
              }));

              const linePath = coords
                .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
                .join(' ');

              const areaPath =
                coords.length > 0
                  ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
                  : '';

              const targetY = toY(activeModuleSummary.targetValue);

              return (
                <div className="relative flex-1 min-h-[96px] flex flex-col justify-center bg-[#FAF6F0]/60 dark:bg-[#001226]/60 rounded-2xl border border-[#D2B48C]/35 dark:border-slate-800/80 px-3 py-1.5 overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="w-full h-[92px] xl:h-[104px] overflow-visible select-none"
                    role="img"
                    aria-label={`Grafik ${activeModuleSummary.title} periode ${activePeriodLabel}`}
                  >
                    <defs>
                      <linearGradient id="dashboardTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#002147" stopOpacity="0.28" />
                        <stop offset="65%" stopColor="#D2B48C" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#D2B48C" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    {[0, 0.5, 1].map((ratio, idx) => {
                      const gy = padT + ratio * plotH;
                      return (
                        <line
                          key={idx}
                          x1={padL}
                          y1={gy}
                          x2={svgW - padR}
                          y2={gy}
                          stroke="#D2B48C"
                          strokeOpacity="0.28"
                          strokeDasharray="3 3"
                        />
                      );
                    })}

                    {/* Target Baku Mutu Reference Line */}
                    <line
                      x1={padL}
                      y1={targetY}
                      x2={svgW - padR}
                      y2={targetY}
                      stroke="#A67C52"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Area Under Primary Curve */}
                    {areaPath && <path d={areaPath} fill="url(#dashboardTrendGrad)" />}

                    {/* Primary Trend Line */}
                    {linePath && (
                      <motion.path
                        key={`${selectedModule}-${periodMode}-${selectedYear}-${selectedMonth}-${selectedQuarter}-${selectedSemester}`}
                        initial={{ opacity: 0.35, pathLength: 0.2 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        d={linePath}
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-[#002147] dark:stroke-[#F5EDE0]"
                      />
                    )}

                    {/* Data Points, Value Labels & Hover Columns */}
                    {coords.map((c, idx) => {
                      const isHovered = hoveredPointIdx === idx;
                      const barW = Math.min(24, Math.max(10, plotW / (coords.length * 2.4)));
                      const barH = Math.max(4, padT + plotH - c.y);
                      return (
                        <g
                          key={`${c.point.label}-${idx}`}
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                          onMouseLeave={() => setHoveredPointIdx(null)}
                          className="cursor-pointer"
                        >
                          {/* Subtle Vertical Bar Accent */}
                          <rect
                            x={c.x - barW / 2}
                            y={c.y}
                            width={barW}
                            height={barH}
                            rx={3}
                            fill={isHovered ? '#002147' : '#D2B48C'}
                            fillOpacity={isHovered ? 0.22 : 0.16}
                          />

                          {/* Point Circle */}
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isHovered ? 5 : 3.6}
                            strokeWidth="1.8"
                            className={
                              isHovered
                                ? 'fill-[#D2B48C] stroke-[#FAF6F0] dark:fill-[#FAF6F0] dark:stroke-[#002147]'
                                : 'fill-[#002147] stroke-[#FAF6F0] dark:fill-[#001835] dark:stroke-[#F5EDE0]'
                            }
                          />

                          {/* Numeric Value Above Point */}
                          <text
                            x={c.x}
                            y={Math.max(11, c.y - 6)}
                            textAnchor="middle"
                            className="fill-[#002147] dark:fill-slate-100 font-mono text-[8.5px] font-bold"
                          >
                            {isWeight
                              ? c.point.primaryValue
                              : `${c.point.primaryValue}%`}
                          </text>

                          {/* X-Axis Period Label */}
                          <text
                            x={c.x}
                            y={svgH - 5}
                            textAnchor="middle"
                            className={`text-[9px] ${
                              isHovered
                                ? 'fill-[#002147] dark:fill-[#D2B48C] font-bold'
                                : 'fill-slate-500 dark:fill-slate-400 font-semibold'
                            }`}
                          >
                            {c.point.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}

            {/* Bottom Interactive Monitoring Module Selector Tabs */}
            <div
              role="tablist"
              aria-label="Pilih Modul Grafik Monitoring"
              className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-0.5 shrink-0"
            >
              {(
                [
                  {
                    key: 'air',
                    label: 'Air Bersih',
                    val: moduleSummaries.air.badgeText,
                    icon: Droplets,
                  },
                  {
                    key: 'udara',
                    label: 'Udara',
                    val: `${moduleSummaries.udara.complianceAvg}% MS`,
                    icon: Wind,
                  },
                  {
                    key: 'ipal',
                    label: 'IPAL',
                    val: moduleSummaries.ipal.badgeText,
                    icon: Waves,
                  },
                  {
                    key: 'limbah_b3',
                    label: 'Limbah B3',
                    val: moduleSummaries.limbah_b3.badgeText,
                    icon: Flame,
                  },
                  {
                    key: 'vektor',
                    label: 'Vektor',
                    val: moduleSummaries.vektor.badgeText,
                    icon: Bug,
                  },
                  {
                    key: 'pangan',
                    label: 'Pangan',
                    val: moduleSummaries.pangan.badgeText,
                    icon: Utensils,
                  },
                ] as {
                  key: DashboardMonitoringModuleKey;
                  label: string;
                  val: string;
                  icon: React.ComponentType<{ className?: string }>;
                }[]
              ).map((m) => {
                const isSelected = selectedModule === m.key;
                const IconComp = m.icon;
                return (
                  <button
                    key={m.key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedModule(m.key);
                      setHoveredPointIdx(null);
                    }}
                    className={`group rounded-xl py-1 px-2 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#002147] text-white border-[#002147] dark:border-[#D2B48C] shadow-xs'
                        : 'bg-[#FAF6F0]/90 dark:bg-[#002147]/40 text-[#002147] dark:text-slate-200 border-[#D2B48C]/45 dark:border-slate-700 hover:bg-[#F5EDE0] dark:hover:bg-[#002147]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span
                        className={`text-[10px] font-semibold truncate ${
                          isSelected
                            ? 'text-[#D2B48C] font-bold'
                            : 'text-slate-600 dark:text-slate-300 group-hover:text-[#002147]'
                        }`}
                      >
                        {m.label}
                      </span>
                      <IconComp
                        className={`w-3 h-3 shrink-0 ${
                          isSelected
                            ? 'text-[#D2B48C]'
                            : 'text-[#002147]/60 dark:text-[#D2B48C]/70'
                        }`}
                      />
                    </div>
                    <div
                      className={`text-[11px] font-mono tabular-nums truncate mt-0.5 ${
                        isSelected
                          ? 'font-bold text-white'
                          : 'font-bold text-[#002147] dark:text-slate-200'
                      }`}
                    >
                      {m.val}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            COLUMN 4 (lg:col-span-3):
            Top = "Tindak Lanjut" Card
            Bottom = Deep Oxford Blue (#002147) "Agenda & Cakupan Kesling" Card
           ------------------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          {/* Card 4A: Tindak Lanjut */}
          <div className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_12px_32px_rgba(0,33,71,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] p-4 xl:p-5 space-y-3 shrink-0">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-[#002147] dark:text-white tracking-tight">
                Tindak Lanjut
              </h2>
              <span className="text-2xl xl:text-3xl font-light text-[#002147] dark:text-white font-mono tabular-nums">
                {Math.round((completedTasksCount / checklist.length) * 100)}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-12 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span className="col-span-5">Baru ({summary.unresolvedFindings})</span>
                <span className="col-span-4">Proses</span>
                <span className="col-span-3">Selesai</span>
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                <Link
                  href="/tindak-lanjut/temuan"
                  className="col-span-5 h-8 xl:h-9 rounded-xl bg-[#002147] text-white px-3 flex items-center text-[11px] font-semibold shadow-2xs hover:bg-[#001630]"
                >
                  Temuan
                </Link>
                <Link
                  href="/tindak-lanjut/proses"
                  aria-label="Proses Perbaikan"
                  className="col-span-4 h-8 xl:h-9 rounded-xl bg-[#D2B48C] flex items-center justify-center text-[10px] font-bold text-[#002147] hover:opacity-90 transition-opacity"
                >
                  Proses
                </Link>
                <Link
                  href="/tindak-lanjut/verifikasi"
                  aria-label="Verifikasi Perbaikan"
                  className="col-span-3 h-8 xl:h-9 rounded-xl bg-[#EADBC8] dark:bg-slate-700 flex items-center justify-center text-[10px] font-semibold text-[#002147] dark:text-slate-200 hover:opacity-90 transition-opacity"
                >
                  Valid
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4B: Deep Oxford Blue (#002147) Checklist Card with Tan (#D2B48C) Accents */}
          <div className="rounded-[26px] bg-gradient-to-br from-[#002147] via-[#001B3B] to-[#00132B] backdrop-blur-2xl border-[1.5px] border-[#D2B48C]/45 text-white p-3.5 xl:p-4 shadow-[0_18px_42px_rgba(0,33,71,0.28),inset_0_1px_2px_rgba(255,255,255,0.25)] flex-1 min-h-0 flex flex-col justify-between space-y-2">
            <div className="flex items-baseline justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-[#D2B48C] tracking-tight">
                  Agenda Kesling
                </h2>
                <p className="text-[10px] text-white/80">
                  Ringkasan seluruh modul & tindak lanjut
                </p>
              </div>
              <span className="text-2xl xl:text-3xl font-light text-[#D2B48C] font-mono tabular-nums">
                {completedTasksCount}/{checklist.length}
              </span>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col justify-around min-h-0">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 group"
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 min-w-0 flex-1"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        item.completed
                          ? 'bg-white/10 text-[#D2B48C]'
                          : 'bg-white/15 text-[#D2B48C] group-hover:bg-[#D2B48C] group-hover:text-[#002147]'
                      }`}
                    >
                      {renderChecklistIcon(item.iconType)}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-[11px] font-medium truncate transition-colors leading-tight ${
                          item.completed
                            ? 'line-through text-white/55'
                            : 'text-white group-hover:text-[#D2B48C]'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#D2B48C]/75 truncate leading-tight">
                        {item.subtitle}
                      </div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    aria-label={`Tandai ${item.title}`}
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      item.completed
                        ? 'bg-[#D2B48C] text-[#002147] shadow-xs'
                        : 'border border-[#D2B48C]/45 bg-white/5 hover:border-[#D2B48C]'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
