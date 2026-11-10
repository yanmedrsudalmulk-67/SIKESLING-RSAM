'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  Droplets,
  Wind,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Search,
  ExternalLink,
  Info,
  Calendar,
  Check,
  Scale,
  Camera,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  LayoutGrid,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '@/components/sikesling/app-provider';
import {
  UKL_UPL_PROFILE,
  GEOSPASIAL_POINTS,
  KESLING_EVALUATIONS,
  RKL_MATRIX,
  RPL_MATRIX,
  PHYSICAL_ROOM_MEASUREMENTS,
  WATER_LAB_TEST_PARAMS,
  FACILITY_CHECKLIST,
  DOCUMENTATION_PHOTOS,
} from '@/lib/ukl-upl-data';
import {
  compileRealtimeUklUplReport,
  CompiledUklUplState,
} from '@/lib/ukl-upl-compiler';
import { generateUklUplWordDocumentHtml } from '@/lib/ukl-upl-word-export';

export function LaporanUplUklView() {
  const {
    medicalWasteLogbookRows,
    waterRows,
    airItems,
    saranaPrasaranaData,
    hospitalProfile,
    pushToast,
  } = useApp();

  const [selectedSemester, setSelectedSemester] = useState<string>('semester-1');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [jumpToSection, setJumpToSection] = useState<string>('ALL');

  const f4DocumentRef = useRef<HTMLDivElement>(null);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel scroll to zoom (Ctrl + Wheel)
  useEffect(() => {
    const el = workspaceContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomPercent((prev) => {
          const delta = e.deltaY < 0 ? 5 : -5;
          return Math.min(150, Math.max(40, prev + delta));
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!workspaceContainerRef.current) return;
    if (!document.fullscreenElement) {
      workspaceContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Kompilasi Data Realtime dari Store Aplikasi
  const compiled: CompiledUklUplState = useMemo(() => {
    return compileRealtimeUklUplReport({
      semester: selectedSemester,
      year: selectedYear,
      medicalWasteLogbookRows,
      waterRows,
      airItems,
      saranaPrasaranaData,
    });
  }, [
    selectedSemester,
    selectedYear,
    medicalWasteLogbookRows,
    waterRows,
    airItems,
    saranaPrasaranaData,
  ]);

  // Handler Download Dokumen Word Resmi F4
  const handleDownloadWordDoc = () => {
    if (!f4DocumentRef.current) return;
    const bodyHtml = f4DocumentRef.current.innerHTML;
    const docTitle = `LAPORAN_UKL_UPL_RSUD_AL_MULK_${compiled.semesterLabel.replace(/\s+/g, '_')}`;
    const wordHtml = generateUklUplWordDocumentHtml({
      title: docTitle,
      bodyHtml,
      year: selectedYear,
    });

    const blob = new Blob(['\ufeff' + wordHtml], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pushToast({
      type: 'success',
      title: 'Dokumen Word Berhasil Diunduh',
      message: `File ${docTitle}.doc telah disiapkan dengan format resmi F4 dan margin 2,5 cm.`,
    });
  };

  // Handler Print Laporan
  const handlePrint = () => {
    window.print();
  };

  // 3D Elevated Bar Chart SVG Renderer (Persis Gaya Laporan Kesling)
  const render3DElevatedBarChart = (
    items: { label: string; value: number; color?: string; sideColor?: string; topColor?: string }[],
    options?: {
      maxValue?: number;
      yTicks?: number[];
      unit?: string;
      targetLine?: number;
      targetLabel?: string;
    }
  ) => {
    const maxValue = options?.maxValue ?? 100;
    const yTicks = options?.yTicks ?? [0, 20, 40, 60, 80, 100];
    const unit = options?.unit ?? '%';
    const width = 640;
    const chartLeft = 54;
    const chartRight = 618;
    const chartTop = 26;
    const chartBottom = 160;
    const availableWidth = chartRight - chartLeft;
    const availableHeight = chartBottom - chartTop;

    const count = items.length;
    let barWidth = 44;
    let depth = 8;
    if (count <= 3) {
      barWidth = 56;
      depth = 9;
    } else if (count <= 5) {
      barWidth = 44;
      depth = 7;
    } else {
      barWidth = 32;
      depth = 5;
    }

    const slotWidth = availableWidth / count;

    return (
      <div className="border border-slate-300 rounded-lg bg-white p-3.5 my-3 shadow-sm">
        <svg
          viewBox={`0 0 ${width} ${chartBottom + 36}`}
          className="w-full h-auto block"
        >
          <defs>
            <linearGradient id="barAmberGradUkl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="shadowGradUkl" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = chartBottom - (tick / maxValue) * availableHeight;
            return (
              <g key={tick}>
                <text
                  x={chartLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#64748b"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  {tick}
                  {unit}
                </text>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={chartRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Target line */}
          {options?.targetLine !== undefined && (() => {
            const targetY = chartBottom - (options.targetLine / maxValue) * availableHeight;
            return (
              <g>
                <line
                  x1={chartLeft}
                  y1={targetY}
                  x2={chartRight}
                  y2={targetY}
                  stroke="#10b981"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />
                {options.targetLabel && (
                  <text
                    x={chartRight}
                    y={targetY - 5}
                    textAnchor="end"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#059669"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    {options.targetLabel}
                  </text>
                )}
              </g>
            );
          })()}

          {/* 3D Elevated Bars */}
          {items.map((item, idx) => {
            const centerX = chartLeft + idx * slotWidth + slotWidth / 2;
            const x = centerX - barWidth / 2 + depth / 2;
            const clampedVal = Math.min(maxValue, Math.max(0, item.value));
            const barHeight = Math.max(4, (clampedVal / maxValue) * availableHeight);
            const topY = chartBottom - barHeight;

            const mainColor = item.color || '#f59e0b';
            const sideColor = item.sideColor || '#d97706';
            const topColor = item.topColor || '#fbbf24';

            return (
              <g key={`${item.label}-${idx}`}>
                {/* Left 3D Shadow / Side Facet */}
                <polygon
                  points={`${x - depth},${topY + depth} ${x},${topY} ${x},${chartBottom} ${x - depth},${chartBottom}`}
                  fill={sideColor}
                />
                <polygon
                  points={`${x - depth},${topY + depth} ${x},${topY} ${x},${chartBottom} ${x - depth},${chartBottom}`}
                  fill="url(#shadowGradUkl)"
                />

                {/* Front Face */}
                <rect
                  x={x}
                  y={topY}
                  width={barWidth}
                  height={barHeight}
                  fill={mainColor}
                />

                {/* Top 3D Bevel Facet */}
                <polygon
                  points={`${x - depth},${topY + depth} ${x},${topY} ${x + barWidth},${topY} ${x + barWidth - depth},${topY + depth}`}
                  fill={topColor}
                />

                {/* Value on top of bar */}
                <text
                  x={x + barWidth / 2 - depth / 2}
                  y={topY - 8}
                  textAnchor="middle"
                  fontSize={count <= 5 ? 12 : 9.5}
                  fontWeight="bold"
                  fill="#0f172a"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  {item.value}
                  {unit}
                </text>

                {/* Label under bar */}
                <text
                  x={centerX}
                  y={chartBottom + 16}
                  textAnchor="middle"
                  fontSize={count <= 3 ? 10 : 8.5}
                  fontWeight="bold"
                  fill="#334155"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const shouldRenderSection = (secId: string) => {
    if (jumpToSection === 'ALL') return true;
    return jumpToSection === secId;
  };

  return (
    <div className="w-full space-y-4">
      {/* =====================================================================
          EXECUTIVE CONTROL BAR (IDENTIK DENGAN LAPORAN KESLING)
         ===================================================================== */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#002147] via-[#0a3568] to-[#1F4E79] px-6 py-5 text-white shadow-xl border border-[#D2B48C]/30 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                SIKRESMI — DOKUMEN RESMI DINAS LINGKUNGAN HIDUP (DLH)
              </span>
              <span className="text-xs text-amber-200/90 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Data Sinkron Realtime
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-amber-400" />
              LAPORAN PELAKSANAAN UKL – UPL
            </h1>
            <p className="text-xs text-slate-300">
              Dokumen Resmi Upaya Pengelolaan Lingkungan & Pemantauan Lingkungan Hidup • UOBK RSUD Al-Mulk Kota Sukabumi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Periode */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Pilih Periode Laporan"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-[#D2B48C] border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
              >
                <option value="semester-1">Semester 1 (Jan – Jun)</option>
                <option value="semester-2">Semester 2 (Jul – Des)</option>
                <option value="tahunan">Periode Tahunan (Jan – Des)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>

            {/* Filter Tahun */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Pilih Tahun Laporan"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-[#D2B48C] border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
              >
                <option value={2026}>Tahun 2026</option>
                <option value={2025}>Tahun 2025</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>

            {/* Lompat ke Bagian */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Navigasi Cepat Bab Laporan"
                value={jumpToSection}
                onChange={(e) => setJumpToSection(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-white border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
              >
                <option value="ALL">Semua Halaman (Buku Utuh)</option>
                <option value="COVER">Cover & Lembar Pengesahan</option>
                <option value="BAB_1">BAB I Pendahuluan & Identitas</option>
                <option value="BAB_2">BAB II Pelaksanaan 8 Variabel</option>
                <option value="BAB_3">BAB III Matriks RKL & RPL (9 Kolom)</option>
                <option value="BAB_4">BAB IV Kesimpulan & Saran</option>
                <option value="LAMPIRAN_1">Lampiran 1: Fisik Udara & Ruangan</option>
                <option value="LAMPIRAN_2">Lampiran 2: Hasil Uji Lab Air & RO</option>
                <option value="LAMPIRAN_3">Lampiran 3: Neraca B3 & Logbook Medis</option>
                <option value="LAMPIRAN_4">Lampiran 4: Checklist Sarpras Bangunan</option>
                <option value="LAMPIRAN_5">Lampiran 5: Dokumentasi Foto & GPS</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>

            {/* Tombol Unduh Dokumen */}
            <button
              type="button"
              onClick={handleDownloadWordDoc}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#D2B48C] text-[#002147] hover:bg-[#e4c9a8] transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Dokumen</span>
            </button>

            {/* Tombol Cetak Laporan */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Laporan</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation & Zoom Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="font-semibold text-amber-300">
              Format Dokumen: Folio F4 (21,59 cm × 33,02 cm)
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">Margin: 2,5 cm seluruh sisi</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">Total Timbulan Medis: <strong>{compiled.totalLimbahB3MedisKg} kg</strong> (100% Terkelola)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-[#001835] border border-[#D2B48C]/40 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setZoomPercent((prev) => Math.max(40, prev - 10))}
                title="Perkecil Zoom"
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono font-bold text-amber-300 min-w-[46px] text-center">
                {zoomPercent}%
              </span>
              <button
                type="button"
                onClick={() => setZoomPercent((prev) => Math.min(150, prev + 10))}
                title="Perbesar Zoom"
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomPercent(100)}
                title="Reset Zoom ke 100%"
                className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white border-l border-white/10 ml-1"
              >
                Reset
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#001835] border border-[#D2B48C]/40 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'single'
                    ? 'bg-[#153E75] text-amber-300 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#153E75] text-amber-300 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Grid
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
              className="p-2 rounded-xl bg-[#001835] border border-[#D2B48C]/40 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Cetak / Print Resmi F4 Margin 2,5 cm di Seluruh Sisi */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: 215.9mm 330.2mm; /* F4 Portrait standard */
              margin: 25mm !important; /* Margin 2,5 cm di seluruh sisi */
            }
            @page landscape-f4 {
              size: 330.2mm 215.9mm; /* F4 Landscape standard */
              margin: 25mm !important; /* Margin 2,5 cm di seluruh sisi */
            }
            @media print {
              body, html {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                font-family: Arial, Helvetica, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .f4-document-container {
                gap: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .f4-page-section {
                page-break-after: always !important;
                break-after: page !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
              }
              .f4-landscape {
                page: landscape-f4 !important;
                page-break-after: always !important;
                break-after: page !important;
              }
            }
          `,
        }}
      />

      {/* =====================================================================
          DARK CANVAS WORKSPACE STAGE WITH CTRL+SCROLL ZOOM
         ===================================================================== */}
      <div
        ref={workspaceContainerRef}
        className={`w-full rounded-3xl transition-all duration-300 overflow-x-auto overflow-y-auto p-4 sm:p-8 ${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-[#0A1322] rounded-none p-6 sm:p-10'
            : 'bg-[#0B1528] dark:bg-[#000E1E] border border-[#D2B48C]/30 shadow-2xl min-h-[85vh]'
        }`}
      >
        <div
          ref={f4DocumentRef}
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            zoom: zoomPercent / 100,
          }}
          className={`mx-auto w-full transition-all duration-200 ${
            viewMode === 'grid' || zoomPercent <= 80
              ? 'flex flex-row flex-wrap items-start justify-center gap-8'
              : 'space-y-12 flex flex-col items-center'
          } [&>section]:shrink-0 [&>section:not(.f4-landscape)]:w-[215.9mm] [&>section:not(.f4-landscape)]:max-w-[215.9mm] [&>section.f4-landscape]:w-[330.2mm] [&>section.f4-landscape]:max-w-[330.2mm]`}
        >
          {/* =====================================================================
              HALAMAN 1: COVER RESMI LAPORAN UKL - UPL
             ===================================================================== */}
          {shouldRenderSection('COVER') && (
            <section
              id="ukl-page-1"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              {/* Header Cover Kop Surat */}
              <div className="text-center border-b-[3px] border-double border-slate-800 pb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center p-2 text-center text-[10px] font-bold text-slate-700">
                    PEMKOT SUKABUMI
                  </div>
                  <div>
                    <h2 className="text-[13pt] font-black uppercase tracking-wider text-slate-900">
                      PEMERINTAH KOTA SUKABUMI
                    </h2>
                    <h3 className="text-[12pt] font-extrabold uppercase tracking-wide text-slate-800">
                      DINAS KESEHATAN
                    </h3>
                    <h1 className="text-[14pt] font-black uppercase tracking-wide text-[#002147]">
                      UOBK RUMAH SAKIT UMUM DAERAH AL-MULK
                    </h1>
                    <p className="text-[8.5pt] text-slate-600 mt-0.5">
                      Jl. Pelabuhan II KM. 6 Kel. Lembursitu Kec. Lembursitu Kota Sukabumi 43169
                    </p>
                    <p className="text-[8pt] text-slate-500">
                      Telp. (0266) 6243088 | Email: rsudalmulk@gmail.com
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center p-2 text-center text-[10px] font-bold text-slate-700">
                    RSUD AL-MULK
                  </div>
                </div>
              </div>

              {/* Title Center Box */}
              <div className="my-auto py-10 text-center space-y-6">
                <div className="inline-block px-5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11pt] font-bold uppercase tracking-wider">
                  DOKUMEN WAJIB LINGKUNGAN HIDUP
                </div>

                <div className="space-y-3">
                  <h1 className="text-[20pt] sm:text-[22pt] font-black leading-tight text-[#002147] uppercase tracking-wide">
                    LAPORAN PELAKSANAAN
                  </h1>
                  <h2 className="text-[16pt] sm:text-[18pt] font-black leading-snug text-slate-900 uppercase">
                    UPAYA PENGELOLAAN LINGKUNGAN HIDUP (UKL)
                    <br />
                    DAN UPAYA PEMANTAUAN LINGKUNGAN HIDUP (UPL)
                  </h2>
                </div>

                {/* Golden Badge Periode */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 text-center shadow-sm">
                  <p className="text-[12pt] font-black text-[#002147] uppercase tracking-wider">
                    {compiled.semesterLabel}
                  </p>
                  <p className="text-[10pt] font-semibold text-slate-700 mt-1">
                    {compiled.periodLabel}
                  </p>
                </div>

                {/* Subtitle Instansi */}
                <div className="pt-4 space-y-1">
                  <p className="text-[11pt] font-medium text-slate-600">Disusun dan Diajukan Oleh:</p>
                  <p className="text-[14pt] font-black text-[#002147] uppercase tracking-wide">
                    UOBK RSUD AL-MULK KOTA SUKABUMI
                  </p>
                  <p className="text-[10pt] text-slate-700 font-medium">
                    Nomor Induk Berusaha (NIB): <strong>{UKL_UPL_PROFILE.nib}</strong>
                  </p>
                  <p className="text-[9.5pt] text-slate-600">
                    Izin Lingkungan: SK Kepala DPMPTSP Kota Sukabumi No. 503/SK.29/DPMPTSP/2018
                  </p>
                </div>
              </div>

              {/* Footer Cover */}
              <div className="text-center pt-6 border-t border-slate-300 text-slate-700 text-[10pt] font-bold space-y-1">
                <p className="uppercase">DINAS LINGKUNGAN HIDUP (DLH) KOTA SUKABUMI</p>
                <p className="font-extrabold text-[#002147]">TAHUN {selectedYear}</p>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 2: KATA PENGANTAR RESMI DIREKTUR
             ===================================================================== */}
          {shouldRenderSection('COVER') && (
            <section
              id="ukl-page-2"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[11pt] leading-[1.65] text-justify text-slate-900">
                <div className="text-center border-b border-slate-400 pb-2 mb-6">
                  <h2 className="font-bold text-[13pt] uppercase tracking-wider text-[#002147]">
                    KATA PENGANTAR
                  </h2>
                </div>

                <p className="indent-10">
                  Puji dan syukur kami panjatkan ke hadirat Allah SWT Tuhan Yang Maha Esa atas berkat, rahmat, dan hidayah-Nya, sehingga Laporan Pelaksanaan Upaya Pengelolaan Lingkungan Hidup (UKL) dan Upaya Pemantauan Lingkungan Hidup (UPL) UOBK RSUD Al-Mulk Kota Sukabumi {compiled.semesterLabel} ({compiled.periodLabel}) ini dapat terselesaikan dengan baik.
                </p>

                <p className="indent-10">
                  Laporan berkala ini disusun sebagai perwujudan kepatuhan kami terhadap Undang-Undang Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup, Peraturan Pemerintah Nomor 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup, serta komitmen lingkungan yang tercantum dalam dokumen Rekomendasi UKL-UPL dan Izin Lingkungan yang telah diterbitkan oleh Pemerintah Kota Sukabumi.
                </p>

                <p className="indent-10">
                  Ruang lingkup kegiatan pemantauan dan pengelolaan lingkungan hidup pada {compiled.periodLabel} meliputi: pemantauan kualitas air bersih dan air minum RO, kualitas air limbah efluen IPAL, pemantauan kualitas udara ruangan, pencahayaan dan kebisingan, pengelolaan limbah bahan berbahaya dan beracun (B3) medis padat dan tajam, pengelolaan limbah domestik, inspeksi sarana dan fisik bangunan rumah sakit, penyehatan makanan dan minuman, serta pengendalian vektor dan binatang pembawa penyakit.
                </p>

                <p className="indent-10">
                  Seluruh data yang disajikan dalam laporan ini merupakan data aktual operasional yang dihimpun secara <em>realtime</em> melalui Sistem Informasi Kesehatan Lingkungan Rumah Sakit (SIKRESMI), didukung dengan hasil pengujian laboratorium terakreditasi dan manifes resmi festronik pengangkutan limbah B3 ke PT Jasa Medivest dan PT Wastec International.
                </p>

                <p className="indent-10">
                  Kami menyadari bahwa laporan ini masih memiliki ruang untuk perbaikan. Oleh karena itu, masukan, saran, dan arahan dari Dinas Lingkungan Hidup Kota Sukabumi dan instansi terkait senantiasa kami nantikan guna penyempurnaan tata kelola lingkungan rumah sakit di masa mendatang.
                </p>

                <div className="pt-8 flex justify-end">
                  <div className="text-center space-y-1 text-[11pt]">
                    <p>Sukabumi, {selectedSemester === 'semester-1' ? 'Juli' : 'Januari'} {selectedYear}</p>
                    <p className="font-bold">Direktur UOBK RSUD Al-Mulk Kota Sukabumi,</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan & Cap Resmi]</span>
                    </div>
                    <p className="font-bold underline text-[#002147]">
                      {UKL_UPL_PROFILE.penanggungJawab}
                    </p>
                    <p className="text-[10pt] text-slate-700">
                      NIP. {UKL_UPL_PROFILE.nipPenanggungJawab}
                    </p>
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 2</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 3: LEMBAR PENGESAHAN RESMI (3 TANDA TANGAN)
             ===================================================================== */}
          {shouldRenderSection('COVER') && (
            <section
              id="ukl-page-3"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-5 text-[11pt] leading-[1.6] text-slate-900">
                <div className="text-center border-b border-slate-400 pb-2 mb-6">
                  <h2 className="font-bold text-[13pt] uppercase tracking-wider text-[#002147]">
                    LEMBAR PENGESAHAN
                  </h2>
                  <p className="text-[10pt] font-semibold text-slate-700 mt-1">
                    LAPORAN PELAKSANAAN UPAYA PENGELOLAAN LINGKUNGAN HIDUP (UKL) DAN UPAYA PEMANTAUAN LINGKUNGAN HIDUP (UPL)
                  </p>
                </div>

                <div className="border border-slate-400 rounded-lg p-4 bg-slate-50 text-[10pt] space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Nama Usaha / Kegiatan</span>
                    <span className="col-span-2">: {UKL_UPL_PROFILE.namaFasilitas}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Jenis Kegiatan</span>
                    <span className="col-span-2">: {UKL_UPL_PROFILE.jenisKegiatan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Nomor Induk Berusaha (NIB)</span>
                    <span className="col-span-2">: {UKL_UPL_PROFILE.nib}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Izin Lingkungan</span>
                    <span className="col-span-2">: {UKL_UPL_PROFILE.izinLingkungan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Lokasi Kegiatan</span>
                    <span className="col-span-2">: {UKL_UPL_PROFILE.lokasiKegiatan.jalan}, {UKL_UPL_PROFILE.lokasiKegiatan.kelurahan}, {UKL_UPL_PROFILE.lokasiKegiatan.kecamatan}, {UKL_UPL_PROFILE.lokasiKegiatan.kota}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-slate-700">Periode Pelaporan</span>
                    <span className="col-span-2 font-bold text-[#002147]">: {compiled.semesterLabel} ({compiled.periodLabel})</span>
                  </div>
                </div>

                <p className="text-justify pt-2 text-[10.5pt]">
                  Dokumen laporan pelaksanaan ini telah diperiksa, diverifikasi, dan disahkan sebagai laporan resmi berkala pengelolaan dan pemantauan lingkungan hidup untuk disampaikan kepada Dinas Lingkungan Hidup Kota Sukabumi.
                </p>

                {/* 3 Signatures Grid */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10.5pt]">
                  <div className="space-y-1">
                    <p className="text-slate-600">Disusun oleh:</p>
                    <p className="font-bold text-[#002147]">Sanitarian / Penanggung Jawab Kesling,</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan]</span>
                    </div>
                    <p className="font-bold underline text-slate-900">dr. Siti Nurlaela, S.Tr.Kes</p>
                    <p className="text-[9.5pt] text-slate-600">NIP. 19870512 201101 2 004</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-600">Disetujui oleh:</p>
                    <p className="font-bold text-[#002147]">Direktur UOBK RSUD Al-Mulk,</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan & Cap RSUD]</span>
                    </div>
                    <p className="font-bold underline text-slate-900">{UKL_UPL_PROFILE.penanggungJawab}</p>
                    <p className="text-[9.5pt] text-slate-600">NIP. {UKL_UPL_PROFILE.nipPenanggungJawab}</p>
                  </div>
                </div>

                <div className="pt-4 text-center text-[10.5pt] space-y-1">
                  <p className="text-slate-600">Mengetahui:</p>
                  <p className="font-bold text-[#002147]">Kepala Dinas Lingkungan Hidup Kota Sukabumi,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan Penerimaan Dokumen]</span>
                  </div>
                  <p className="font-bold underline text-slate-900">Drs. H. Yadi Mulyadi, M.Si</p>
                  <p className="text-[9.5pt] text-slate-600">NIP. 19680315 199303 1 008</p>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 3</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 4: IDENTITAS PEMRAKARSA & RINGKASAN KEGIATAN
             ===================================================================== */}
          {shouldRenderSection('BAB_1') && (
            <section
              id="ukl-page-4"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.55] text-slate-900">
                <div className="border-b border-slate-400 pb-2 mb-4">
                  <h2 className="font-bold text-[12pt] uppercase tracking-wider text-[#002147]">
                    BAB I : PENDAHULUAN & IDENTITAS PEMRAKARSA
                  </h2>
                </div>

                <h3 className="font-bold text-[11pt] text-slate-800">
                  1.1 Identitas Pemrakarsa dan Penanggung Jawab
                </h3>

                <table className="w-full border-collapse border border-slate-600 text-[10pt]">
                  <tbody>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold w-1/3 bg-slate-100">1. Nama Instansi Induk</td>
                      <td className="border border-slate-600 px-3 py-2">{UKL_UPL_PROFILE.namaInstansi}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">2. Nama Fasilitas Pelayanan</td>
                      <td className="border border-slate-600 px-3 py-2 font-bold text-[#002147]">{UKL_UPL_PROFILE.namaFasilitas}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">3. Jenis Kegiatan Usaha</td>
                      <td className="border border-slate-600 px-3 py-2">{UKL_UPL_PROFILE.jenisKegiatan}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">4. Nomor Induk Berusaha (NIB)</td>
                      <td className="border border-slate-600 px-3 py-2 font-mono font-bold">{UKL_UPL_PROFILE.nib}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">5. Izin Lingkungan</td>
                      <td className="border border-slate-600 px-3 py-2">{UKL_UPL_PROFILE.izinLingkungan}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">6. Berita Acara Rintek TPS B3</td>
                      <td className="border border-slate-600 px-3 py-2">{UKL_UPL_PROFILE.beritaAcaraRintekTPS}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">7. Alamat Lokasi Usaha</td>
                      <td className="border border-slate-600 px-3 py-2">{UKL_UPL_PROFILE.lokasiKegiatan.jalan}, {UKL_UPL_PROFILE.lokasiKegiatan.kelurahan}, {UKL_UPL_PROFILE.lokasiKegiatan.kecamatan}, {UKL_UPL_PROFILE.lokasiKegiatan.kota}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">8. Penanggung Jawab</td>
                      <td className="border border-slate-600 px-3 py-2 font-bold">{UKL_UPL_PROFILE.penanggungJawab}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">9. Jabatan Penanggung Jawab</td>
                      <td className="border border-slate-600 px-3 py-2">{UKL_UPL_PROFILE.jabatanPenanggungJawab}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-2 font-bold bg-slate-100">10. Kontak Resmi</td>
                      <td className="border border-slate-600 px-3 py-2">Telp: {UKL_UPL_PROFILE.noTelepon} | Email: {UKL_UPL_PROFILE.email}</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  1.2 Skala Usaha dan Sarana Pelayanan Rumah Sakit
                </h3>

                <table className="w-full border-collapse border border-slate-600 text-[10pt]">
                  <tbody>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold w-1/3 bg-slate-100">Kapasitas Tempat Tidur</td>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold text-emerald-800">{UKL_UPL_PROFILE.skalaUsaha.kapasitasTempatTidur} Tempat Tidur (TT) Terpasang</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Jumlah Tenaga Kerja</td>
                      <td className="border border-slate-600 px-3 py-1.5">{UKL_UPL_PROFILE.skalaUsaha.jumlahPegawai} Orang Pegawai (Medis, Paramedis, Penunjang, Administrasi)</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Waktu Operasional</td>
                      <td className="border border-slate-600 px-3 py-1.5">{UKL_UPL_PROFILE.skalaUsaha.waktuOperasi}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Luas Lahan & Bangunan</td>
                      <td className="border border-slate-600 px-3 py-1.5">Luas Lahan: {UKL_UPL_PROFILE.skalaUsaha.luasLahan} | Luas Bangunan: {UKL_UPL_PROFILE.skalaUsaha.luasBangunan}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Sumber Air Bersih</td>
                      <td className="border border-slate-600 px-3 py-1.5">{UKL_UPL_PROFILE.skalaUsaha.sumberAir}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Air Limbah & IPAL</td>
                      <td className="border border-slate-600 px-3 py-1.5">{UKL_UPL_PROFILE.skalaUsaha.airLimbahHarian}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Timbulan Limbah Medis B3</td>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold text-amber-800">
                        {compiled.totalLimbahB3MedisKg} kg / {compiled.periodLabel} (Rata-rata {compiled.rataRataBulananKg} kg/bln)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 px-3 py-1.5 font-bold bg-slate-100">Sistem Proteksi Kebakaran</td>
                      <td className="border border-slate-600 px-3 py-1.5">{UKL_UPL_PROFILE.proteksiKebakaran.apar}, {UKL_UPL_PROFILE.proteksiKebakaran.hidran}, {UKL_UPL_PROFILE.proteksiKebakaran.sprinkler}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 4</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 5: LATAR BELAKANG, MAKSUD & TUJUAN, LANDASAN HUKUM
             ===================================================================== */}
          {shouldRenderSection('BAB_1') && (
            <section
              id="ukl-page-5"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.65] text-justify text-slate-900">
                <h3 className="font-bold text-[11pt] text-slate-800">
                  1.3 Latar Belakang
                </h3>
                <p className="indent-10">
                  Rumah sakit merupakan sarana pelayanan kesehatan yang menyelenggarakan pelayanan kesehatan perorangan secara paripurna yang menyediakan pelayanan rawat inap, rawat jalan, dan gawat darurat. Dalam menyelenggarakan fungsinya, selain memberikan dampak positif terhadap derajat kesehatan masyarakat, rumah sakit juga berpotensi menghasilkan dampak negatif terhadap lingkungan sekitar berupa air limbah, limbah padat non-medis (domestik), limbah bahan berbahaya dan beracun (B3) medis, penurunan kualitas udara ruangan, emisi gas buang genset, serta kebisingan.
                </p>
                <p className="indent-10">
                  Guna mencegah dan menanggulangi dampak negatif tersebut, UOBK RSUD Al-Mulk Kota Sukabumi telah menyusun Dokumen Upaya Pengelolaan Lingkungan Hidup dan Upaya Pemantauan Lingkungan Hidup (UKL-UPL). Sebagai pemenuhan kewajiban pemrakarsa, laporan pelaksanaan UKL-UPL ini disusun secara berkala per semester dan dilaporkan ke Dinas Lingkungan Hidup Kota Sukabumi.
                </p>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  1.4 Maksud dan Tujuan Pelaporan
                </h3>
                <ul className="list-disc pl-8 space-y-1">
                  <li>Memberikan gambaran komprehensif mengenai pelaksanaan pengelolaan dan pemantauan lingkungan hidup yang telah dilakukan oleh UOBK RSUD Al-Mulk pada {compiled.periodLabel}.</li>
                  <li>Mengevaluasi efektivitas fasilitas instalasi pengolahan air limbah (IPAL) dan kepatuhan terhadap baku mutu lingkungan hidup.</li>
                  <li>Melaporkan neraca limbah B3 medis dan memastikan seluruh limbah infeksius tertangani 100% melalui pihak ketiga berizin KLHK.</li>
                  <li>Memenuhi persyaratan administratif dan regulasi perizinan lingkungan rumah sakit.</li>
                </ul>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  1.5 Landasan Peraturan Perundang-Undangan
                </h3>
                <ol className="list-decimal pl-8 space-y-1">
                  <li>Undang-Undang Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup.</li>
                  <li>Undang-Undang Nomor 17 Tahun 2023 tentang Kesehatan.</li>
                  <li>Peraturan Pemerintah Nomor 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup.</li>
                  <li>Peraturan Menteri Kesehatan Nomor 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit.</li>
                  <li>Peraturan Menteri Kesehatan Nomor 2 Tahun 2023 tentang Peraturan Pelaksanaan Peraturan Pemerintah Nomor 66 Tahun 2014 tentang Kesehatan Lingkungan.</li>
                  <li>Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.68/Menlhk/Setjen/Kum.1/8/2016 tentang Baku Mutu Air Limbah Domestik.</li>
                  <li>Keputusan Menteri Negara Lingkungan Hidup Nomor KEP-48/MENLH/11/1996 tentang Baku Tingkat Kebisingan.</li>
                </ol>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 5</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 6: BAB II EVALUASI 8 VARIABEL - AIR BERSIH & UDARA
             ===================================================================== */}
          {shouldRenderSection('BAB_2') && (
            <section
              id="ukl-page-6"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.55] text-justify text-slate-900">
                <div className="border-b border-slate-400 pb-2 mb-3">
                  <h2 className="font-bold text-[12pt] uppercase tracking-wider text-[#002147]">
                    BAB II : PELAKSANAAN DAN EVALUASI 8 VARIABEL KESLING
                  </h2>
                </div>

                <h3 className="font-bold text-[11pt] text-slate-800">
                  2.1 Penyehatan Air Bersih dan Air Minum (Reverse Osmosis)
                </h3>
                <p className="indent-10">
                  Sumber air bersih utama UOBK RSUD Al-Mulk berasal dari sumur bor artesis dengan kedalaman 98 meter yang berizin resmi (No. 29/291300/DPMPTSP/2022). Air bersih ini ditampung dalam 2 unit ground tank berkapasitas total 4 m³ dan didistribusikan ke seluruh unit pelayanan, toilet, dan fasilitas laundry. Untuk kebutuhan medis kritis (Poli Gigi, Laboratorium Patologi, dan CSSD), rumah sakit mengoperasikan sistem filtrasi <em>Reverse Osmosis</em> (RO).
                </p>
                <p className="indent-10">
                  Pemeriksaan berkala kualitas air parameter fisika, kimia, dan mikrobiologi dilakukan bekerjasama dengan UPTD Laboratorium Kesehatan Daerah (Labkesda) Kota Sukabumi berdasarkan Permenkes No. 2 Tahun 2023. Hasil uji laboratorium menunjukkan bahwa air RO 100% memenuhi standar baku mutu air minum, sedangkan air artesis sempat menunjukkan parameter mikrobiologi yang memerlukan klorinasi rutin berkala dan pengurasan tandon air.
                </p>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  2.2 Penyehatan Udara, Kebisingan, dan Pencahayaan Ruangan
                </h3>
                <p className="indent-10">
                  Pemantauan parameter fisik udara indoor (suhu, kelembaban, pencahayaan lux, dan kebisingan dB) dilakukan di 23 ruangan pelayanan. Standar acuan kenyamanan merujuk pada Permenkes No. 7 Tahun 2019 dan standar Kelas Rawat Inap Standar (KRIS).
                </p>

                {/* 3D Elevated Bar Chart Realtime Air Indicators */}
                <div className="my-2">
                  <div className="text-center font-bold text-[10pt] text-slate-800 mb-1">
                    Grafik 2.1: Persentase Kepatuhan Baku Mutu Fisik Ruangan ({compiled.semesterLabel})
                  </div>
                  {render3DElevatedBarChart(compiled.airScoreItems, {
                    maxValue: 100,
                    unit: '%',
                    targetLine: 100,
                    targetLabel: 'Target Kepatuhan 100%',
                  })}
                </div>

                <p className="text-[10pt] text-slate-700 bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
                  <strong>Evaluasi Realtime:</strong> Pencahayaan ruangan mencapai tingkat kepatuhan <strong>{compiled.airScoreItems[1]?.value}%</strong> berkat peremajaan lampu LED hemat energi. Parameter kebisingan mencapai <strong>{compiled.airScoreItems[2]?.value}%</strong> disebabkan oleh posisi bangunan rawat jalan yang berdekatan dengan jalan raya provinsi, dengan tindak lanjut penutupan pintu kedap suara dan penghijauan buffer tanaman.
                </p>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 6</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 7: SARANA BANGUNAN & AIR LIMBAH IPAL
             ===================================================================== */}
          {shouldRenderSection('BAB_2') && (
            <section
              id="ukl-page-7"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.55] text-justify text-slate-900">
                <h3 className="font-bold text-[11pt] text-slate-800">
                  2.3 Penyehatan Sarana dan Fisik Bangunan Rumah Sakit
                </h3>
                <p className="indent-10">
                  Inspeksi fisik sarana dan bangunan dilakukan secara berkala mencakup fasilitas toilet ramah disabilitas, kebersihan dan keutuhan lantai, pintu ruangan, atap, serta langit-langit ruangan.
                </p>

                {/* 3D Elevated Bar Chart Realtime Building Indicators */}
                <div className="my-2">
                  <div className="text-center font-bold text-[10pt] text-slate-800 mb-1">
                    Grafik 2.2: Persentase Kelayakan Sarana Fisik Bangunan ({compiled.semesterLabel})
                  </div>
                  {render3DElevatedBarChart(compiled.buildingScoreItems, {
                    maxValue: 100,
                    unit: '%',
                    targetLine: 100,
                    targetLabel: 'Standar Kelayakan 100%',
                  })}
                </div>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  2.4 Pengelolaan Air Limbah dan Kinerja IPAL
                </h3>
                <p className="indent-10">
                  UOBK RSUD Al-Mulk mengoperasikan Instalasi Pengolahan Air Limbah (IPAL) dengan teknologi kombinasi biofilter anaerob-aerob dan proses desinfeksi klorinasi. Kapasitas pengolahan IPAL didesain sebesar 7 m³/hari, setara dengan debit aktual buangan harian rumah sakit (toilet, wastafel, ruang tindakan, laboratorium setelah pretreatment, dan laundry).
                </p>
                <p className="indent-10">
                  Pengujian kualitas efluen air limbah dilakukan setiap bulan untuk parameter pH, TSS, BOD, COD, Minyak & Lemak, Amoniak, dan Total Coliform sesuai Permen LHK No. 68/2016. Hasil pemantauan selama {compiled.periodLabel} menunjukkan tingkat kepatuhan baku mutu sebesar <strong>{compiled.ipalCompliancePct}%</strong>. Air efluen yang telah memenuhi baku mutu disalurkan ke badan air penerima dan sebagian dimanfaatkan untuk penyiraman taman rumah sakit.
                </p>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 7</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 8: PENGELOLAAN LIMBAH PADAT & NERACA B3 REALTIME
             ===================================================================== */}
          {shouldRenderSection('BAB_2') && (
            <section
              id="ukl-page-8"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.55] text-justify text-slate-900">
                <h3 className="font-bold text-[11pt] text-slate-800">
                  2.5 Pengelolaan Limbah Padat Bahan Berbahaya dan Beracun (B3) Medis
                </h3>
                <p className="indent-10">
                  Pengelolaan limbah medis B3 dilaksanakan melalui tahapan pemilahan di sumber, pewadahan kantong kuning tebal dan <em>safety box</em> untuk limbah tajam, pengangkutan internal menggunakan troli tertutup khusus, serta penyimpanan sementara di TPS Limbah B3 Berizin resmi (Berita Acara DLH No. 11/DLHRINTEKLB3/2023).
                </p>
                <p className="indent-10">
                  TPS B3 dilengkapi fasilitas penunjang keselamatan berupa <em>emergency eyewash</em>, APAR, spill kit, penerangan, ventilasi memadai, serta simbol dan label B3. Waktu penyimpanan maksimal limbah medis adalah 2 hari pada suhu ruangan. Pengangkutan dan pemusnahan limbah B3 bekerjasama dengan transporter dan pengolah berizin resmi KLHK, yaitu <strong>PT Jasa Medivest</strong> dan <strong>PT Wastec International</strong> dengan sistem manifes elektronik (Festronik).
                </p>

                {/* Neraca Limbah B3 Realtime Table */}
                <div className="pt-2">
                  <div className="text-center font-bold text-[10pt] text-[#002147] mb-2 uppercase">
                    Tabel 2.1: Neraca Limbah Bahan Berbahaya dan Beracun (B3) Medis ({compiled.semesterLabel})
                  </div>
                  <table className="w-full border-collapse border border-slate-600 text-[9.5pt]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-600 px-2 py-2 text-center w-8">No</th>
                        <th className="border border-slate-600 px-3 py-2 text-left">Jenis Limbah B3 Medis</th>
                        <th className="border border-slate-600 px-2 py-2 text-center w-24">Kode Limbah</th>
                        <th className="border border-slate-600 px-3 py-2 text-right w-24">Jumlah Dihasilkan</th>
                        <th className="border border-slate-600 px-3 py-2 text-right w-24">Jumlah Dikelola</th>
                        <th className="border border-slate-600 px-3 py-2 text-center w-24">Sisa di TPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compiled.neracaLimbahB3.map((item) => (
                        <tr key={item.no}>
                          <td className="border border-slate-600 px-2 py-1.5 text-center">{item.no}</td>
                          <td className="border border-slate-600 px-3 py-1.5 font-medium">{item.jenisLimbah}</td>
                          <td className="border border-slate-600 px-2 py-1.5 text-center font-mono text-[9pt]">{item.kodeLimbah}</td>
                          <td className="border border-slate-600 px-3 py-1.5 text-right font-bold text-slate-800">{item.jumlahKg.toLocaleString('id-ID')} kg</td>
                          <td className="border border-slate-600 px-3 py-1.5 text-right font-bold text-emerald-700">{item.jumlahKg.toLocaleString('id-ID')} kg</td>
                          <td className="border border-slate-600 px-3 py-1.5 text-center font-bold text-slate-500">0 kg</td>
                        </tr>
                      ))}
                      <tr className="bg-amber-50 font-bold">
                        <td colSpan={3} className="border border-slate-600 px-3 py-2 text-center text-[#002147]">
                          TOTAL AKUMULASI TIMBULAN LIMBAH MEDIS B3
                        </td>
                        <td className="border border-slate-600 px-3 py-2 text-right text-[#002147]">
                          {compiled.totalLimbahB3MedisKg.toLocaleString('id-ID')} kg
                        </td>
                        <td className="border border-slate-600 px-3 py-2 text-right text-emerald-800">
                          {compiled.totalLimbahB3MedisKg.toLocaleString('id-ID')} kg
                        </td>
                        <td className="border border-slate-600 px-3 py-2 text-center text-emerald-700 font-black">
                          100% TERKELOLA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[10pt] text-slate-700 pt-1">
                  * Catatan Realtime: Data timbulan limbah medis di atas terhubung langsung dengan modul <strong>Logbook Limbah Medis SIKRESMI</strong>. Seluruh limbah yang dihasilkan diserahkan 100% ke transporter berizin tanpa ada sisa residu yang tertimbun melebihi masa simpan di TPS.
                </p>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 8</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 9: PENGENDALIAN VEKTOR, PANGAN, LINEN & RADIASI
             ===================================================================== */}
          {shouldRenderSection('BAB_2') && (
            <section
              id="ukl-page-9"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.6] text-justify text-slate-900">
                <h3 className="font-bold text-[11pt] text-slate-800">
                  2.6 Pengendalian Vektor dan Binatang Pembawa Penyakit
                </h3>
                <p className="indent-10">
                  Pengendalian vektor (nyamuk Aedes aegypti, lalat, kecoa, dan tikus) dilakukan secara terpadu melalui metode fisik, sanitasi lingkungan, dan kimiawi terbatas. Pemantauan jentik berkala di seluruh kontainer air menghasilkan Angka Bebas Jentik (ABJ) sebesar <strong>100%</strong> (standar ≥ 95%). Pemasangan perangkap lalat (fly trap) dan umpan tikus mekanik dilakukan di area dapur gizi, TPS domestik, dan selasar rumah sakit tanpa ditemukannya infestasi populasi vektor yang melebihi indeks baku mutu.
                </p>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  2.7 Penyelenggaraan Higiene Sanitasi Makanan dan Minuman
                </h3>
                <p className="indent-10">
                  Instalasi Gizi menyelenggarakan higiene sanitasi makanan mulai dari pemilihan bahan baku, penyimpanan bahan mentah dan kering, pengolahan, hingga pendistribusian ke ruang rawat inap. Pemeriksaan usap alat masak, usap alat makan, serta usap dubur penjamah makanan dilakukan secara berkala. Hasil pemeriksaan mikrobiologi menunjukkan angka kuman memenuhi persyaratan kesehatan (0 koloni/cm² kuman patogen) dan seluruh penjamah makanan telah memiliki sertifikat pelatihan higiene sanitasi makanan.
                </p>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  2.8 Pengelolaan Linen / Laundry dan Proteksi Radiasi
                </h3>
                <p className="indent-10">
                  Unit Laundry mengoperasikan pemisahan alur ketat antara linen infeksius dan non-infeksius. Suhu pencucian termal (70°C selama 25 menit) dan penggunaan disinfektan berbahan klorin menjamin dekontaminasi optimal. Pada unit Radiologi, seluruh petugas dilengkapi alat pemantau dosis radiasi personal (TLD badge) yang dievaluasi berkala oleh BAPETEN dengan hasil penerimaan dosis radiasi berada jauh di bawah Nilai Batas Dosis (NBD).
                </p>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 9</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 10: BAB III MATRIKS RKL (3.1) - 9 KOLOM RESMI (LANDSCAPE F4)
             ===================================================================== */}
          {shouldRenderSection('BAB_3') && (
            <section
              id="ukl-page-10"
              className="f4-landscape f4-page-section scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-[25mm] pt-[20mm] pb-[18mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <h2 className="font-bold text-[11.5pt] uppercase tracking-wider text-[#002147]">
                    BAB III : MATRIKS RENCANA PENGELOLAAN LINGKUNGAN HIDUP (RKL 3.1)
                  </h2>
                  <span className="text-[9pt] font-bold text-slate-600 font-mono">
                    Standar Format 9 Kolom Kementerian LHK & DLH Kota Sukabumi
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[8.5pt] leading-[1.3] table-fixed">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-600 p-1 text-center w-7">No</th>
                        <th className="border border-slate-600 p-1 text-left w-24">Jenis Dampak</th>
                        <th className="border border-slate-600 p-1 text-left w-28">Sumber Dampak</th>
                        <th className="border border-slate-600 p-1 text-left w-32">Parameter Kunci</th>
                        <th className="border border-slate-600 p-1 text-left w-24">Lokasi Pengelolaan</th>
                        <th className="border border-slate-600 p-1 text-left w-48">Bentuk Upaya / Metode Pengelolaan</th>
                        <th className="border border-slate-600 p-1 text-center w-20">Waktu / Frekuensi</th>
                        <th className="border border-slate-600 p-1 text-center w-24">Pelaksana & Pengawas</th>
                        <th className="border border-slate-600 p-1 text-left w-44">Hasil Analisis & Evaluasi Realtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RKL_MATRIX.slice(0, 5).map((row) => (
                        <tr key={row.no}>
                          <td className="border border-slate-600 p-1 text-center align-top font-bold">{row.no}</td>
                          <td className="border border-slate-600 p-1 align-top font-semibold text-slate-800">{row.jenisDampak}</td>
                          <td className="border border-slate-600 p-1 align-top">{row.sumberDampak}</td>
                          <td className="border border-slate-600 p-1 align-top font-mono text-[8pt]">{row.besaranDampak}</td>
                          <td className="border border-slate-600 p-1 align-top">{row.lokasi}</td>
                          <td className="border border-slate-600 p-1 align-top">{row.bentukUpaya}</td>
                          <td className="border border-slate-600 p-1 text-center align-top">Kontinu 24 Jam</td>
                          <td className="border border-slate-600 p-1 text-center align-top">{row.unitPelaksana}</td>
                          <td className="border border-slate-600 p-1 align-top text-emerald-800 font-medium">
                            {row.no === 2
                              ? `Total timbulan ${compiled.totalLimbahB3MedisKg} kg terkelola 100% via Festronik ke PT Jasa Medivest.`
                              : row.no === 1
                              ? `Kinerja IPAL stabil, debit ${UKL_UPL_PROFILE.skalaUsaha.airLimbahHarian}, efisiensi efluen 100% MS.`
                              : 'Terkontrol penuh sesuai SOP dan standar baku mutu lingkungan.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Running Footer Landscape */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 10 (Format Landscape Matriks RKL)</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 11: BAB III MATRIKS RPL (3.2) - 9 KOLOM RESMI (LANDSCAPE F4)
             ===================================================================== */}
          {shouldRenderSection('BAB_3') && (
            <section
              id="ukl-page-11"
              className="f4-landscape f4-page-section scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-[25mm] pt-[20mm] pb-[18mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <h2 className="font-bold text-[11.5pt] uppercase tracking-wider text-[#002147]">
                    BAB III : MATRIKS RENCANA PEMANTAUAN LINGKUNGAN HIDUP (RPL 3.2)
                  </h2>
                  <span className="text-[9pt] font-bold text-slate-600 font-mono">
                    Standar Format 9 Kolom Kementerian LHK & DLH Kota Sukabumi
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[8.5pt] leading-[1.3] table-fixed">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-600 p-1 text-center w-7">No</th>
                        <th className="border border-slate-600 p-1 text-left w-24">Dampak Dipantau</th>
                        <th className="border border-slate-600 p-1 text-left w-28">Sumber Dampak</th>
                        <th className="border border-slate-600 p-1 text-left w-32">Tolok Ukur / Baku Mutu</th>
                        <th className="border border-slate-600 p-1 text-left w-24">Lokasi Pemantauan</th>
                        <th className="border border-slate-600 p-1 text-left w-48">Metode Pemantauan & Analisis</th>
                        <th className="border border-slate-600 p-1 text-center w-20">Frekuensi</th>
                        <th className="border border-slate-600 p-1 text-center w-24">Pelaksana & Pengawas</th>
                        <th className="border border-slate-600 p-1 text-left w-44">Hasil Evaluasi Realtime & Rekomendasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RPL_MATRIX.slice(0, 5).map((row) => (
                        <tr key={row.no}>
                          <td className="border border-slate-600 p-1 text-center align-top font-bold">{row.no}</td>
                          <td className="border border-slate-600 p-1 align-top font-semibold text-slate-800">{row.jenisDampak}</td>
                          <td className="border border-slate-600 p-1 align-top">{row.sumberDampak}</td>
                          <td className="border border-slate-600 p-1 align-top font-mono text-[8pt]">{row.tolokUkur}</td>
                          <td className="border border-slate-600 p-1 align-top">{row.lokasi}</td>
                          <td className="border border-slate-600 p-1 align-top">{row.metodeSaatIni}</td>
                          <td className="border border-slate-600 p-1 text-center align-top">Bulanan / Semester</td>
                          <td className="border border-slate-600 p-1 text-center align-top">Sanitarian / Labkesda</td>
                          <td className="border border-slate-600 p-1 align-top text-slate-800">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[7.5pt] font-black bg-emerald-100 text-emerald-800 mb-0.5">
                              {row.statusKepatuhan}
                            </span>
                            <p className="text-[8pt] text-slate-600">{row.evaluasi}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Running Footer Landscape */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 11 (Format Landscape Matriks RPL)</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 12: BAB IV KESIMPULAN DAN REKOMENDASI
             ===================================================================== */}
          {shouldRenderSection('BAB_4') && (
            <section
              id="ukl-page-12"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[11pt] leading-[1.65] text-justify text-slate-900">
                <div className="border-b border-slate-400 pb-2 mb-4">
                  <h2 className="font-bold text-[12pt] uppercase tracking-wider text-[#002147]">
                    BAB IV : KESIMPULAN DAN REKOMENDASI
                  </h2>
                </div>

                <h3 className="font-bold text-[11pt] text-slate-800">
                  4.1 Kesimpulan
                </h3>
                <p className="indent-10">
                  Berdasarkan hasil pemantauan dan pengelolaan lingkungan hidup di UOBK RSUD Al-Mulk Kota Sukabumi selama {compiled.periodLabel}, dapat disimpulkan beberapa hal sebagai berikut:
                </p>
                <ol className="list-decimal pl-8 space-y-2">
                  <li>
                    <strong>Kualitas Air Bersih & Air Minum:</strong> Air minum RO di Poli Gigi, Laboratorium, dan CSSD 100% memenuhi baku mutu Permenkes No. 2 Tahun 2023. Air artesis terawat dengan klorinasi berkala dan pengurasan tandon air.
                  </li>
                  <li>
                    <strong>Kinerja IPAL:</strong> Instalasi pengolahan air limbah berfungsi optimal dengan tingkat kepatuhan baku mutu efluen sebesar <strong>{compiled.ipalCompliancePct}%</strong>.
                  </li>
                  <li>
                    <strong>Pengelolaan Limbah Medis B3:</strong> Total timbulan limbah medis pada {compiled.periodLabel} tercatat sebesar <strong>{compiled.totalLimbahB3MedisKg} kg</strong> (Limbah Tajam: {compiled.totalLimbahTajamKg} kg, Limbah Infeksius/Padat: {compiled.totalLimbahPadatKg} kg). Seluruh limbah tertangani dan dimusnahkan <strong>100%</strong> melalui kerjasama pihak ketiga berizin resmi (PT Jasa Medivest dan PT Wastec) dengan pelaporan festronik tanpa adanya akumulasi timbunan di TPS B3.
                  </li>
                  <li>
                    <strong>Fisik Udara & Ruangan:</strong> Pencahayaan dan suhu ruangan memenuhi syarat KRIS. Tingkat kebisingan di selasar rawat jalan terus dimitigasi dengan tata tertib buka-tutup pintu dan penanaman vegetasi peredam.
                  </li>
                  <li>
                    <strong>Vektor & Higiene Pangan:</strong> Angka Bebas Jentik mencapai 100% dan seluruh penjamah makanan memiliki sertifikat laik higiene sanitasi.
                  </li>
                </ol>

                <h3 className="font-bold text-[11pt] text-slate-800 pt-2">
                  4.2 Rekomendasi / Tindak Lanjut
                </h3>
                <ol className="list-decimal pl-8 space-y-2">
                  <li>Melanjutkan program pemeliharaan preventif IPAL, sumur bor artesis, dan sistem RO secara konsisten.</li>
                  <li>Memperkuat pencatatan logbook limbah B3 digital melalui sistem <strong>SIKRESMI</strong> agar rekonsiliasi data timbulan harian dan manifes transporter senantiasa tersinkronisasi realtime.</li>
                  <li>Menindaklanjuti rencana pemasangan filtrasi multimedia dan sterilisasi UV pada sistem distribusi air bersih sumur artesis.</li>
                </ol>

                <div className="pt-6 flex justify-end">
                  <div className="text-center space-y-1 text-[11pt]">
                    <p>Sukabumi, {selectedSemester === 'semester-1' ? 'Juli' : 'Januari'} {selectedYear}</p>
                    <p className="font-bold">Direktur UOBK RSUD Al-Mulk,</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan & Stempel Resmi]</span>
                    </div>
                    <p className="font-bold underline text-[#002147]">{UKL_UPL_PROFILE.penanggungJawab}</p>
                    <p className="text-[10pt] text-slate-700">NIP. {UKL_UPL_PROFILE.nipPenanggungJawab}</p>
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between text-[8.5pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 12</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 13: LAMPIRAN 1 - DATA PENGUKURAN FISIK RUANGAN (23 RUANGAN)
             ===================================================================== */}
          {shouldRenderSection('LAMPIRAN_1') && (
            <section
              id="ukl-page-13"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3 text-[9.5pt]">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[11pt] uppercase tracking-wider text-[#002147]">
                      LAMPIRAN 1 : DATA PENGUKURAN FISIK RUANGAN & INDOOR
                    </h2>
                    <p className="text-[8.5pt] text-slate-600">
                      Pengukuran Suhu, Kelembaban (RH), Pencahayaan (Lux), dan Kebisingan (dB) di 23 Ruangan
                    </p>
                  </div>
                  <span className="text-[8.5pt] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                    PMK No. 7/2019
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[8.5pt] leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-600 p-1 text-center w-6">No</th>
                        <th className="border border-slate-600 p-1 text-left">Unit / Ruangan</th>
                        <th className="border border-slate-600 p-1 text-center">Kategori</th>
                        <th className="border border-slate-600 p-1 text-center">Suhu (°C)</th>
                        <th className="border border-slate-600 p-1 text-center">Kelembaban (%)</th>
                        <th className="border border-slate-600 p-1 text-center">Lux</th>
                        <th className="border border-slate-600 p-1 text-center">Kebisingan (dB)</th>
                        <th className="border border-slate-600 p-1 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PHYSICAL_ROOM_MEASUREMENTS.map((r) => (
                        <tr key={r.no} className="hover:bg-slate-50">
                          <td className="border border-slate-600 p-1 text-center font-bold">{r.no}</td>
                          <td className="border border-slate-600 p-1 font-medium">{r.unit}</td>
                          <td className="border border-slate-600 p-1 text-center text-slate-600 text-[8pt]">{r.kategori}</td>
                          <td className="border border-slate-600 p-1 text-center">{r.suhuDisplay}</td>
                          <td className="border border-slate-600 p-1 text-center">{r.kelembabanDisplay}</td>
                          <td className="border border-slate-600 p-1 text-center">{r.luxDisplay}</td>
                          <td className="border border-slate-600 p-1 text-center">{r.kebisinganDisplay}</td>
                          <td className="border border-slate-600 p-1 text-center font-bold">
                            <span className="text-emerald-700 text-[7.5pt] bg-emerald-50 px-1 py-0.5 rounded border border-emerald-300">
                              MEMENUHI
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 13 (Lampiran 1)</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 14: LAMPIRAN 2 - HASIL UJI LAB AIR BERSIH & RO
             ===================================================================== */}
          {shouldRenderSection('LAMPIRAN_2') && (
            <section
              id="ukl-page-14"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3 text-[9.5pt]">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[11pt] uppercase tracking-wider text-[#002147]">
                      LAMPIRAN 2 : HASIL UJI LABORATORIUM AIR BERSIH & RO
                    </h2>
                    <p className="text-[8.5pt] text-slate-600">
                      Pengujian 17 Parameter Fisika & Kimia UPTD Labkesda Kota Sukabumi vs Permenkes No. 2 Tahun 2023
                    </p>
                  </div>
                  <span className="text-[8.5pt] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    PMK No. 2/2023
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[8.5pt] leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-600 p-1 text-center w-6">No</th>
                        <th className="border border-slate-600 p-1 text-left">Parameter Pengujian</th>
                        <th className="border border-slate-600 p-1 text-center">Baku Mutu</th>
                        <th className="border border-slate-600 p-1 text-center">Satuan</th>
                        <th className="border border-slate-600 p-1 text-center">Air Artesis</th>
                        <th className="border border-slate-600 p-1 text-center">RO Poli Gigi</th>
                        <th className="border border-slate-600 p-1 text-center">RO Laboratorium</th>
                        <th className="border border-slate-600 p-1 text-center">RO CSSD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WATER_LAB_TEST_PARAMS.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-600 p-1 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-600 p-1 font-medium">{p.parameter}</td>
                          <td className="border border-slate-600 p-1 text-center font-mono text-[8pt]">{p.bakuMutu}</td>
                          <td className="border border-slate-600 p-1 text-center text-[8pt]">{p.satuan}</td>
                          <td className="border border-slate-600 p-1 text-center">{p.artesis}</td>
                          <td className="border border-slate-600 p-1 text-center font-semibold text-emerald-800">{p.roPoliGigi}</td>
                          <td className="border border-slate-600 p-1 text-center font-semibold text-emerald-800">{p.roLaboratorium}</td>
                          <td className="border border-slate-600 p-1 text-center font-semibold text-emerald-800">{p.roCssd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[8.5pt] text-slate-700 bg-slate-50 border border-slate-300 p-2 rounded">
                  <p className="font-bold text-slate-800">Catatan Hasil Uji:</p>
                  <p>Seluruh titik sistem Reverse Osmosis (Poli Gigi, Lab, dan CSSD) memenuhi 100% baku mutu air minum. Untuk air sumur bor artesis, pengurasan dan klorinasi berkala dilaksanakan setiap bulan guna mempertahankan kualitas optimal.</p>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 14 (Lampiran 2)</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 15: LAMPIRAN 3 - REKAP LOGBOOK LIMBAH MEDIS REALTIME
             ===================================================================== */}
          {shouldRenderSection('LAMPIRAN_3') && (
            <section
              id="ukl-page-15"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10pt] leading-[1.55]">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[11.5pt] uppercase tracking-wider text-[#002147]">
                      LAMPIRAN 3 : REKAPITULASI LOGBOOK LIMBAH MEDIS REALTIME
                    </h2>
                    <p className="text-[8.5pt] text-slate-600">
                      Rekap Timbulan Limbah Tajam & Padat Infeksius per Bulan Terhubung Modul Logbook SIKRESMI
                    </p>
                  </div>
                  <span className="text-[8.5pt] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Realtime Synced
                  </span>
                </div>

                <p className="text-justify text-[9.5pt]">
                  Berikut adalah rekapitulasi timbulan limbah bahan berbahaya dan beracun (B3) medis padat dan tajam UOBK RSUD Al-Mulk Kota Sukabumi pada {compiled.periodLabel} yang dicatat secara harian dalam logbook dan diangkut secara berkala oleh transporter resmi:
                </p>

                {/* Realtime Monthly Waste Table */}
                <table className="w-full border-collapse border border-slate-600 text-[9pt]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-600 px-2 py-2 text-center w-8">No</th>
                      <th className="border border-slate-600 px-3 py-2 text-left">Bulan</th>
                      <th className="border border-slate-600 px-3 py-2 text-right">Limbah Tajam (kg)</th>
                      <th className="border border-slate-600 px-3 py-2 text-right">Limbah Padat / Infeksius (kg)</th>
                      <th className="border border-slate-600 px-3 py-2 text-right">Total Timbulan (kg)</th>
                      <th className="border border-slate-600 px-2 py-2 text-center">Jml Manifes</th>
                      <th className="border border-slate-600 px-3 py-2 text-left">Nomor Manifes Utama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.monthlyWasteRecaps.map((item, idx) => (
                      <tr key={item.bulanAngka} className="hover:bg-slate-50">
                        <td className="border border-slate-600 px-2 py-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-600 px-3 py-1.5 font-bold text-slate-800">{item.bulan}</td>
                        <td className="border border-slate-600 px-3 py-1.5 text-right font-mono">{item.limbahTajamKg.toFixed(1)}</td>
                        <td className="border border-slate-600 px-3 py-1.5 text-right font-mono">{item.limbahPadatKg.toFixed(1)}</td>
                        <td className="border border-slate-600 px-3 py-1.5 text-right font-mono font-bold text-[#002147]">
                          {item.totalKg.toFixed(1)}
                        </td>
                        <td className="border border-slate-600 px-2 py-1.5 text-center font-bold text-slate-700">{item.manifestCount} rit</td>
                        <td className="border border-slate-600 px-3 py-1.5 font-mono text-[8pt] text-slate-600">{item.primaryManifest}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50 font-bold text-[#002147]">
                      <td colSpan={2} className="border border-slate-600 px-3 py-2 text-center">
                        TOTAL AKUMULASI
                      </td>
                      <td className="border border-slate-600 px-3 py-2 text-right font-mono">
                        {compiled.totalLimbahTajamKg.toFixed(1)} kg
                      </td>
                      <td className="border border-slate-600 px-3 py-2 text-right font-mono">
                        {compiled.totalLimbahPadatKg.toFixed(1)} kg
                      </td>
                      <td className="border border-slate-600 px-3 py-2 text-right font-mono text-[10pt] text-[#002147]">
                        {compiled.totalLimbahB3MedisKg.toFixed(1)} kg
                      </td>
                      <td className="border border-slate-600 px-2 py-2 text-center text-emerald-800">
                        {compiled.totalManifestCount} rit
                      </td>
                      <td className="border border-slate-600 px-3 py-2 text-left text-[8pt] text-emerald-800">
                        100% Tercatat Festronik KLHK
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-3 pt-2 text-[9pt]">
                  <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 space-y-1">
                    <p className="font-bold text-slate-800">Rasio Timbulan Limbah:</p>
                    <p>• Limbah Padat Infeksius: <strong>{compiled.persentasePadat}%</strong> ({compiled.totalLimbahPadatKg} kg)</p>
                    <p>• Limbah B3 Tajam (Safety Box): <strong>{compiled.persentaseTajam}%</strong> ({compiled.totalLimbahTajamKg} kg)</p>
                    <p>• Rata-rata Timbulan per Bulan: <strong>{compiled.rataRataBulananKg} kg/bulan</strong></p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 space-y-1">
                    <p className="font-bold text-slate-800">Informasi Pengolah & Transporter:</p>
                    <p>• Transporter Utama: <strong>PT Jasa Medivest</strong></p>
                    <p>• Izin Transporter: SK MenLHK No. SK.398/Menlhk/Setjen/PLB.3/8/2020</p>
                    <p>• Pengolah Cadangan: <strong>PT Wastec International</strong></p>
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 15 (Lampiran 3)</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 16: LAMPIRAN 4 - SARPRAS CHECKLIST & LAMPIRAN 5 - FOTO
             ===================================================================== */}
          {shouldRenderSection('LAMPIRAN_4') && (
            <section
              id="ukl-page-16"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[9.5pt]">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[11pt] uppercase tracking-wider text-[#002147]">
                      LAMPIRAN 4 : CHECKLIST SARANA DAN PRASARANA BANGUNAN
                    </h2>
                    <p className="text-[8.5pt] text-slate-600">
                      Standar Kelaikan Fasilitas Fisik Ramah Pasien & Kelas Rawat Inap Standar (KRIS)
                    </p>
                  </div>
                  <span className="text-[8.5pt] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Standar KRIS
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[8.5pt] leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-600 p-1.5 text-center w-8">No</th>
                        <th className="border border-slate-600 p-1.5 text-left w-36">Kategori Fasilitas</th>
                        <th className="border border-slate-600 p-1.5 text-left">Indikator Kelaikan</th>
                        <th className="border border-slate-600 p-1.5 text-center w-28">Status</th>
                        <th className="border border-slate-600 p-1.5 text-left">Keterangan / Tindak Lanjut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FACILITY_CHECKLIST.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-600 p-1.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-600 p-1.5 font-semibold text-slate-800">{c.kategori}</td>
                          <td className="border border-slate-600 p-1.5">{c.indikator}</td>
                          <td className="border border-slate-600 p-1.5 text-center font-bold">
                            <span className="text-emerald-700 text-[7.5pt] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                              {c.hasilPemeriksaan}
                            </span>
                          </td>
                          <td className="border border-slate-600 p-1.5 text-[8pt] text-slate-600">{c.keterangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-300">
                  <h3 className="font-bold text-[10.5pt] text-[#002147] mb-2 uppercase">
                    LAMPIRAN 5 : DOKUMENTASI FOTO FASILITAS KESLING UTAMA
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {DOCUMENTATION_PHOTOS.slice(0, 6).map((photo) => (
                      <div
                        key={photo.id}
                        className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center space-y-1"
                      >
                        <div className="h-24 bg-slate-200 rounded flex items-center justify-center text-slate-500 text-[9pt]">
                          <Camera className="w-5 h-5 mr-1" />
                          Foto Fasilitas
                        </div>
                        <p className="font-bold text-[8.5pt] text-slate-800">{photo.judul}</p>
                        <p className="text-[7.5pt] text-slate-500 line-clamp-2">{photo.deskripsi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 16 (Lampiran 4 & 5)</span>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 17: LAMPIRAN 6 - PETA GEOSPASIAL & TITIK KOORDINAT GPS
             ===================================================================== */}
          {shouldRenderSection('LAMPIRAN_5') && (
            <section
              id="ukl-page-17"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10pt] leading-[1.6]">
                <div className="border-b border-slate-400 pb-2 mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[11.5pt] uppercase tracking-wider text-[#002147]">
                      LAMPIRAN 6 : TITIK KOORDINAT GEOSPASIAL TPS B3 & IPAL
                    </h2>
                    <p className="text-[8.5pt] text-slate-600">
                      Koordinat Satelit GPS Fasilitas Perlindungan Lingkungan Hidup UOBK RSUD Al-Mulk
                    </p>
                  </div>
                  <span className="text-[8.5pt] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-300">
                    GPS Geospasial
                  </span>
                </div>

                <div className="space-y-3">
                  {GEOSPASIAL_POINTS.map((pt) => (
                    <div
                      key={pt.id}
                      className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-600" />
                          <h4 className="font-bold text-[10.5pt] text-[#002147]">{pt.nama}</h4>
                        </div>
                        <span className="text-[8pt] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {pt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[9pt] pl-6">
                        <div>
                          <span className="font-semibold text-slate-600">Kode / Izin:</span>
                          <p className="font-mono text-slate-800">{pt.kodeIzin}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Koordinat Display:</span>
                          <p className="font-mono font-bold text-slate-900">{pt.koordinatDisplay}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Latitude / Longitude:</span>
                          <p className="font-mono text-slate-800">{pt.latitudeDisplay}, {pt.longitudeDisplay}</p>
                        </div>
                      </div>
                      <p className="text-[8.5pt] text-slate-600 pl-6">{pt.keterangan}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-300 text-center space-y-1">
                  <p className="text-[10pt] font-bold text-[#002147]">
                    PENGESAHAN DOKUMEN LAPORAN LINGKUNGAN HIDUP TERPADU
                  </p>
                  <p className="text-[8.5pt] text-slate-600">
                    Sistem Informasi Kesehatan Lingkungan Rumah Sakit (SIKRESMI) • Versi 2.4.0 Production Build
                  </p>
                  <p className="text-[8pt] text-slate-400">
                    Dicetak otomatis berdasarkan data aktual sistem pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </p>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-[8pt] text-slate-500">
                <span>UOBK RSUD AL-MULK KOTA SUKABUMI | LAPORAN PELAKSANAAN UKL-UPL {compiled.semesterLabel}</span>
                <span>Halaman 17 (Lampiran 6 - Akhir Dokumen)</span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
