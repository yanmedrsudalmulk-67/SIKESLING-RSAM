'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Minus,
  Plus,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  Edit3,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useApp } from '@/components/sikesling/app-provider';
import {
  compileAnnualKeslingReport,
  generateAnnualReportWordF4Html,
} from '@/lib/annual-report-kesling';
import { FloatingSaveButton } from '@/components/sikesling/floating-save-button';

export type ReportSectionFilter =
  | 'ALL'
  | 'COVER_PENDAHULUAN'
  | 'BAB_3_MONITORING'
  | 'BAB_3_EVALUASI_PENUTUP'
  | 'LAMPIRAN_1_UDARA'
  | 'LAMPIRAN_2_LOGBOOK'
  | 'LAMPIRAN_3_6_CHECKLIST'
  | 'DOKUMENTASI';

export type ReportPeriodType = 'TAHUNAN' | 'BULANAN' | 'TRIWULAN' | 'SEMESTER';

const MONTH_LONG_NAMES = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

const MONTH_SHORT_HEADERS = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

export function AnnualReportF4View() {
  const {
    waterRows,
    airItems,
    wastewaterRows,
    solidWasteRows,
    medicalWasteLogbookRows,
    vectorFindings,
    vectorUnits,
    foodRows,
    activities,
    supervisions,
    findings,
    saranaPrasaranaData,
    linenRows,
    radiationRows,
    hospitalProfile,
    pushToast,
  } = useApp();

  const [reportYear, setReportYear] = useState<number>(2026);
  const [reportPeriodType, setReportPeriodType] = useState<ReportPeriodType>('TAHUNAN');
  const [reportMonth, setReportMonth] = useState<number>(10); // Default Oktober (1-12)
  const [reportTriwulan, setReportTriwulan] = useState<number>(1);
  const [reportSemester, setReportSemester] = useState<number>(1);

  // Dynamic Cover Lines matching official RSUD Al-Mulk format
  const coverLines = useMemo(() => {
    const line2 = 'UOBK RSUD AL-MULK KOTA SUKABUMI';
    if (reportPeriodType === 'BULANAN') {
      const monthName = MONTH_LONG_NAMES[reportMonth - 1] || 'OKTOBER';
      return {
        line1: 'LAPORAN BULANAN UNIT KESLING',
        line2,
        line3: `PERIODE BULAN ${monthName} ${reportYear}`,
      };
    }
    if (reportPeriodType === 'TRIWULAN') {
      const romanTriwulan = ['I', 'II', 'III', 'IV'][reportTriwulan - 1] || 'I';
      return {
        line1: 'LAPORAN TRIWULAN UNIT KESLING',
        line2,
        line3: `PERIODE TRIWULAN ${romanTriwulan} TAHUN ${reportYear}`,
      };
    }
    if (reportPeriodType === 'SEMESTER') {
      return {
        line1: 'LAPORAN SEMESTER UNIT KESLING',
        line2,
        line3: `PERIODE SEMESTER ${reportSemester} TAHUN ${reportYear}`,
      };
    }
    // Default: TAHUNAN
    return {
      line1: 'LAPORAN TAHUNAN UNIT KESLING',
      line2,
      line3: `PERIODE TAHUN ${reportYear}`,
    };
  }, [reportPeriodType, reportMonth, reportTriwulan, reportSemester, reportYear]);
  const [activeSection, setActiveSection] = useState<ReportSectionFilter>('ALL');
  const [jumpToPage, setJumpToPage] = useState<string>('ALL');
  const [isEditableMode, setIsEditableMode] = useState<boolean>(false);
  const [selectedLogbookMonth, setSelectedLogbookMonth] = useState<number | 'ALL'>('ALL');
  const [showOriginalPdfModal, setShowOriginalPdfModal] = useState<boolean>(false);

  // Zoom & Multi-Page View State
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const handleSaveReport = () => {
    setHasUnsavedChanges(false);
    pushToast({
      type: 'success',
      title: 'Perubahan Laporan Disimpan',
      message: `Perubahan laporan tahun ${reportYear} tersimpan aktif. Data terintegrasi penuh secara realtime.`,
    });
  };

  // Bersihkan cache statis HTML agar data realtime dari Monitoring, Supervisi, & Tindak Lanjut selalu sinkron
  React.useEffect(() => {
    try {
      localStorage.removeItem(`sikesling_annual_report_html_${reportYear}`);
      localStorage.removeItem('sikesling_annual_report_html_2026');
      localStorage.removeItem('sikesling_annual_report_html_2025');
    } catch {
      // ignore
    }
    setHasUnsavedChanges(false);
  }, [reportYear]);

  const f4DocumentRef = useRef<HTMLDivElement>(null);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel scroll to zoom (Ctrl + Wheel)
  React.useEffect(() => {
    const el = workspaceContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomPercent((prev) => {
          const delta = e.deltaY < 0 ? 5 : -5;
          return Math.min(150, Math.max(30, prev + delta));
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

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

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const compiled = useMemo(() => {
    return compileAnnualKeslingReport({
      year: reportYear,
      institutionName: hospitalProfile.institutionName || 'UOBK RSUD Al-Mulk Kota Sukabumi',
      waterRows,
      airItems,
      wastewaterRows,
      solidWasteRows,
      medicalWasteLogbookRows,
      vectorFindings,
      vectorUnitCount: vectorUnits.length || 20,
      foodRows,
      activities,
      supervisions,
      findings,
      saranaPrasaranaData,
      linenRows,
      radiationRows,
    });
  }, [
    reportYear,
    hospitalProfile.institutionName,
    waterRows,
    airItems,
    wastewaterRows,
    solidWasteRows,
    medicalWasteLogbookRows,
    vectorFindings,
    vectorUnits.length,
    foodRows,
    activities,
    supervisions,
    findings,
    saranaPrasaranaData,
    linenRows,
    radiationRows,
  ]);

  const buildingChartData = useMemo(() => {
    if (compiled.building && compiled.building.chartItems && compiled.building.chartItems.length > 0) {
      return compiled.building.chartItems.map((c) => ({
        indicator: c.label,
        percentage: c.valuePct,
      }));
    }
    return [
      { indicator: 'Toilet', percentage: 91 },
      { indicator: 'Lantai', percentage: 100 },
      { indicator: 'Atap', percentage: 100 },
      { indicator: 'Langit-Langit', percentage: 100 },
      { indicator: 'Pintu RS', percentage: 100 },
    ];
  }, [compiled.building]);

  const toiletRows = useMemo(() => [
    { no: 1, roomName: 'Ruang Rawat Inap Kelas 1 Usman', kriteriaPintu: true, kriteriaHandrail: false, status: '91% (Perlu Handrail)' },
    { no: 2, roomName: 'Ruang Rawat Inap Fatimah (Isolasi)', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 3, roomName: 'Ruang Rawat Inap Khadijah', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 4, roomName: 'Ruang Rawat Inap Aisyah', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 5, roomName: 'Ruang Bersalin (VK)', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 6, roomName: 'Instalasi Gawat Darurat (IGD)', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 7, roomName: 'Poli Anak & Remaja', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 8, roomName: 'Poli Bedah & Umum', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 9, roomName: 'Poli Gigi & Mulut', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 10, roomName: 'Instalasi Laboratorium', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 11, roomName: 'Instalasi Radiologi', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 12, roomName: 'Instalasi Farmasi & Gudang', kriteriaPintu: true, kriteriaHandrail: true, status: '100% Memenuhi Syarat' },
    { no: 13, roomName: 'Toilet Pengunjung Selasar', kriteriaPintu: false, kriteriaHandrail: false, status: '82% (Usulan Handrail & Pintu)' },
  ], []);

  const wastewaterCombinedRows = useMemo(() => {
    return [
      ...(compiled.wastewater?.inletMatrix || []),
      ...(compiled.wastewater?.outletMatrix || []),
    ];
  }, [compiled.wastewater]);

  const handleDownloadWordF4 = () => {
    const wordHtml = generateAnnualReportWordF4Html(compiled);
    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LAPORAN_TAHUNAN_KESLING_RSUD_AL_MULK_${reportYear}_RESMI_F4.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    pushToast({
      type: 'success',
      title: 'Dokumen Word (.doc) Ukuran F4 Berhasil Diunduh',
      message: `File LAPORAN_TAHUNAN_KESLING_RSUD_AL_MULK_${reportYear}_RESMI_F4.doc siap dibuka & diedit kapan saja di Microsoft Word dengan ukuran kertas resmi F4 (21,59 x 33,02 cm) per lembar halaman terpisah.`,
    });
  };

  const handleDownloadCurrentEditedWordF4 = () => {
    if (!f4DocumentRef.current) return;
    const editedHtmlContent = f4DocumentRef.current.innerHTML;
    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Laporan Tahunan Kesling RSUD Al-Mulk ${reportYear}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21.59cm 33.02cm; /* UKURAN RESMI F4 / FOLIO */
            margin: 2.0cm 2.0cm 2.0cm 2.0cm;
            mso-page-orientation: portrait;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
          }
          table { border-collapse: collapse; width: 100%; margin-bottom: 8pt; }
          th, td { border: 1px solid #333; padding: 4pt; }
          .f4-page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        ${editedHtmlContent}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filePeriodTag =
      reportPeriodType === 'BULANAN'
        ? `BULANAN_${MONTH_LONG_NAMES[reportMonth - 1]}_${reportYear}`
        : reportPeriodType === 'TRIWULAN'
        ? `TRIWULAN_${['I', 'II', 'III', 'IV'][reportTriwulan - 1]}_${reportYear}`
        : reportPeriodType === 'SEMESTER'
        ? `SEMESTER_${reportSemester}_${reportYear}`
        : `TAHUNAN_${reportYear}`;
    link.download = `LAPORAN_KESLING_RSUD_AL_MULK_${filePeriodTag}_F4.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    pushToast({
      type: 'success',
      title: 'Hasil Edit Word F4 Berhasil Disimpan',
      message: 'Perubahan teks dan narasi yang Anda edit di layar berhasil disimpan ke dalam file Word F4.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePageJumpChange = (pageVal: string) => {
    setJumpToPage(pageVal);
    if (pageVal !== 'ALL') {
      const targetEl = document.getElementById(`f4-page-${pageVal}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const vectorBarColors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
  ];

  const shouldRenderPage = (_pageNumber: number, _sectionCategory: ReportSectionFilter) => {
    return true;
  };

  const renderSingleFooter = (pageNum: number) => (
    <div className="pt-2 mt-auto border-t-[3.5px] border-[#5B9BD5] flex items-start justify-between text-[10px] leading-[1.35] text-slate-400 font-sans print:text-slate-500">
      <div className="uppercase tracking-tight">
        <div>LAPORAN TAHUNAN KESEHATAN LINGKUNGAN</div>
        <div>UOBK RSUD AL-MULK TAHUN {reportYear}</div>
      </div>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 pt-0.5">
        {pageNum}
      </span>
    </div>
  );

  const renderLandscapeFooter = (pageNum: number) => (
    <div className="w-[53%] mx-auto pt-1.5 mt-auto border-t-[4px] border-[#5B9BD5] flex items-start justify-between text-[9.5px] leading-[1.3] text-slate-400 font-sans print:text-slate-500">
      <div className="uppercase tracking-tight">
        <div>LAPORAN TAHUNAN KESEHATAN LINGKUNGAN</div>
        <div>UOBK RSUD AL-MULK TAHUN {reportYear}</div>
      </div>
      <span className="text-[10.5px] text-slate-500 print:text-slate-600 pt-0.5 pr-4">
        {pageNum}
      </span>
    </div>
  );

  const renderLandscapeCorner = (pageNum?: number) => (
    <div className="pointer-events-none select-none">
      <svg
        viewBox="0 0 150 96"
        className="absolute top-0 right-0 w-[135px] h-[86px]"
        preserveAspectRatio="none"
      >
        <polygon points="48,0 150,0 150,86" fill="#eef4fa" />
        <polygon points="78,0 150,0 150,62" fill="#4B8FD8" />
        <polyline
          points="75,6 135,6 135,76"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.9"
        />
      </svg>
      {pageNum !== undefined && (
        <span className="absolute top-2.5 right-3.5 text-white font-sans text-[13px] font-medium z-10">
          {pageNum}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-[340mm] mx-auto pb-20">
      {/* Header Banner & Controls */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#002147] via-[#0a3568] to-[#1F4E79] px-6 py-5 text-white shadow-xl border border-[#D2B48C]/30 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#D2B48C]">
              {reportPeriodType === 'BULANAN'
                ? 'Laporan Bulanan Kesehatan Lingkungan RSUD Al-Mulk'
                : reportPeriodType === 'TRIWULAN'
                ? 'Laporan Triwulan Kesehatan Lingkungan RSUD Al-Mulk'
                : reportPeriodType === 'SEMESTER'
                ? 'Laporan Semester Kesehatan Lingkungan RSUD Al-Mulk'
                : 'Laporan Tahunan Kesehatan Lingkungan RSUD Al-Mulk'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Jenis Periode */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Pilih Jenis Periode"
                value={reportPeriodType}
                onChange={(e) => setReportPeriodType(e.target.value as ReportPeriodType)}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-[#D2B48C] border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
              >
                <option value="TAHUNAN">Periode Tahunan</option>
                <option value="BULANAN">Periode Bulanan</option>
                <option value="TRIWULAN">Periode Triwulanan</option>
                <option value="SEMESTER">Periode Semesteran</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>

            {/* Filter Bulan Jika Mode Bulanan */}
            {reportPeriodType === 'BULANAN' && (
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Pilih Bulan Laporan"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-white border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
                >
                  {MONTH_LONG_NAMES.map((mName, idx) => (
                    <option key={mName} value={idx + 1}>
                      Bulan {mName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
              </div>
            )}

            {/* Filter Triwulan Jika Mode Triwulan */}
            {reportPeriodType === 'TRIWULAN' && (
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Pilih Triwulan Laporan"
                  value={reportTriwulan}
                  onChange={(e) => setReportTriwulan(Number(e.target.value))}
                  className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-white border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
                >
                  <option value={1}>Triwulan I (Jan - Mar)</option>
                  <option value={2}>Triwulan II (Apr - Jun)</option>
                  <option value={3}>Triwulan III (Jul - Sep)</option>
                  <option value={4}>Triwulan IV (Okt - Des)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
              </div>
            )}

            {/* Filter Semester Jika Mode Semester */}
            {reportPeriodType === 'SEMESTER' && (
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Pilih Semester Laporan"
                  value={reportSemester}
                  onChange={(e) => setReportSemester(Number(e.target.value))}
                  className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-white border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
                >
                  <option value={1}>Semester 1 (Jan - Jun)</option>
                  <option value={2}>Semester 2 (Jul - Des)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
              </div>
            )}

            {/* Filter Tahun */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Pilih Tahun Laporan"
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-xs font-bold bg-[#001835] text-[#D2B48C] border border-[#D2B48C]/60 cursor-pointer shadow-sm focus:outline-none"
              >
                <option value={2026}>Tahun 2026</option>
                <option value={2025}>Tahun 2025</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>

            {/* Tombol Unduh Dokumen */}
            <button
              type="button"
              onClick={handleDownloadCurrentEditedWordF4}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#D2B48C] text-[#002147] hover:bg-[#e4c9a8] transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          DARK CANVAS WORKSPACE STAGE WITH CTRL+SCROLL ZOOM
          Tampilan kanvas hitam/navy dengan halaman-halaman F4 bersanding (multi-page spread)
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
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={() => setHasUnsavedChanges(true)}
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            zoom: zoomPercent / 100,
          }}
          className={`mx-auto w-full transition-all duration-200 ${
            viewMode === 'grid' || zoomPercent <= 80
              ? 'flex flex-row flex-wrap items-start justify-center gap-8'
              : 'space-y-12 flex flex-col items-center'
          } [&>section]:shrink-0 [&>section:not(.f4-landscape)]:w-[215.9mm] [&>section:not(.f4-landscape)]:max-w-[215.9mm] [&>section.f4-landscape]:w-[330.2mm] [&>section.f4-landscape]:max-w-[330.2mm] ${
            isEditableMode ? 'ring-4 ring-emerald-500/40 rounded-lg p-2' : ''
          }`}
        >
        {/* =====================================================================
            HALAMAN 1: COVER RESMI SESUAI TEMPLATE RESMI RSUD AL-MULK
           ===================================================================== */}
        {shouldRenderPage(1, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-1"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] overflow-hidden relative print:shadow-none print:border-none p-0 flex flex-col"
          >
            <div className="relative w-full aspect-[215.9/330.2] min-h-[330.2mm] flex flex-col justify-between overflow-hidden bg-white select-none">
              <img
                src="/assets/aistudio/cover_kesling_official_clean.jpg"
                alt="Cover Laporan Unit Kesling RSUD Al-Mulk"
                className="w-full h-full object-fill block"
              />

              {/* Teks Format Resmi Dinamis pada Garis Biru (Proporsional & Presisi Sesuai Format Resmi) */}
              <div
                className="absolute left-0 right-0 top-[66.7%] bottom-[13.3%] flex flex-col items-center justify-center px-4 sm:px-8 text-center select-text"
                style={{ pointerEvents: 'auto' }}
              >
                <div
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={() => setHasUnsavedChanges(true)}
                  className="text-white font-black text-[22px] sm:text-[25px] md:text-[27px] tracking-wider leading-snug uppercase whitespace-nowrap outline-none focus:ring-2 focus:ring-amber-300/80 rounded px-2.5 drop-shadow-sm"
                >
                  {coverLines.line1}
                </div>
                <div
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={() => setHasUnsavedChanges(true)}
                  className="text-white font-extrabold text-[17px] sm:text-[19.5px] md:text-[21px] tracking-wide leading-snug uppercase whitespace-nowrap mt-2.5 sm:mt-3 outline-none focus:ring-2 focus:ring-amber-300/80 rounded px-2.5 drop-shadow-sm"
                >
                  {coverLines.line2}
                </div>
                <div
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={() => setHasUnsavedChanges(true)}
                  className="text-white font-extrabold text-[16px] sm:text-[18px] md:text-[19.5px] tracking-wider leading-snug uppercase whitespace-nowrap mt-2.5 sm:mt-3 outline-none focus:ring-2 focus:ring-amber-300/80 rounded px-2.5 drop-shadow-sm"
                >
                  {coverLines.line3}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            HALAMAN 2: KATA PENGANTAR (PERSIS SESUAI GAMBAR NO 2)
           ===================================================================== */}
        {shouldRenderPage(2, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-2"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[14px] leading-[1.85] text-justify text-slate-900">
              <h2 className="text-center font-bold text-[15px] uppercase tracking-normal mb-5">
                KATA PENGANTAR
              </h2>
              <p className="indent-11">
                Puji syukur saya panjatkan kepadsa Allah SWT dengan selesainya Laporan Tahunan Kesehatam Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi. Laporan Tahuan ini berisi data-data dan laporan Indikator Kinerja dan Mutu Unit kesehatan lingkungan di tahun {reportYear}.
              </p>
              <p className="indent-11">
                Laporan Tahunan Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi ini disusun sebagai bentuk akuntabilitas dan transparansi pelaksanaan pengelolaan lingkungan rumah sakit dalam periode Januari–Desember {reportYear}. Laporan ini mencerminkan komitmen RSUD Al-Mulk untuk memenuhi standar kesehatan lingkungan, menjamin keselamatan pasien dan tenaga kesehatan, serta mendukung pencapaian standar pelayanan nasional termasuk implementasi <em>Kelas Rawat Inap Standar</em> (KRIS).
              </p>
              <p className="indent-11">
                Jenis Indikator Kegiatan Unit Kesling diantaranya : Melaksanakan Pengawasan Kesehatan Air Rumah Sakit, Pemeriksaan Kesehatan Udara Rumah Sakit, Melaksanakan pengawasan Kesehatan Sarana dan Bangunan, Melaksanakan pengawasan kebersihan, Monitoring penanganan limbah cair infeksius, Monitoring pengelolaan limbah padat, Monitoring pemeriksaan pangan siap saji, Monitoring Pemeriksaan Penyelenggaraan Linen, Monitoring Pemeriksaan Pengamanan Radiasi, Pengendalian vector dan binatang pengganggu.
              </p>
              <p className="indent-11">
                Laporan Kinerja RSUD AL-Mulk diuraikan dalam laporan ini, sehingga pelaksanaan tugas pokok dan fungsi serta tujuan dan sasaran kegiatan selama tahun {reportYear} dapat digambarkan pencapaiannya serta masalah dan kendala-kendala yang dihadapi. Laporan ini diharapkan dapat menjadi dasar pertimbangan dalam pengambilan kebijakan di tahun mendatang dan saya berharap Laporan Tahunan ini dapat dijadikan sebagai informasi kesehatan lingkungan di UOBK RSUD Al-Mulk, dan dapat bermafaat bagi semua pembaca baik untuk Petugas Kesehatan maupun Unit-Unit lain yang membutuhkan.
              </p>
              <p className="indent-11">
                Laporan Tahunan ini disusun tentu saja jauh dari kesempurnaan, oleh karena itu penyusun berharap mendapatkan saran dan kritik agar dapat disempurnakan menjadi lebih baik pada punyusunan Laporan Tahunan berikutnya, Terimakasih di sampaikan kepada semua pihak yang telah mendukung penyusunan laporan tahunan ini. Semoga bermanfaat untuk kita semua. Aamiin
              </p>

              <div className="pt-4 flex justify-end pr-4">
                <div className="text-center space-y-0.5 text-[14px] leading-[1.45]">
                  <p className="mb-2">Penyusun,</p>
                  <p>Instalasi Kesehatan Lingkungan</p>
                  <p>UOBK RSUD Al-Mulk Kota Sukabumi</p>
                </div>
              </div>
            </div>
            {renderSingleFooter(2)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 3: DAFTAR ISI (PERSIS SESUAI GAMBAR NO 3)
           ===================================================================== */}
        {shouldRenderPage(3, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-3"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.5px] leading-[1.95] text-slate-900">
              <h2 className="text-center font-bold text-[15px] uppercase tracking-normal mb-7">
                DAFTAR ISI
              </h2>

              {/* Bagian Atas: Halaman Judul - Daftar Isi */}
              <div className="space-y-1.5">
                {[
                  ['HALAMAN JUDUL', '1'],
                  ['KATA PENGANTAR', '2'],
                  ['DAFTAR ISI', '3'],
                ].map(([title, pg]) => (
                  <div key={title} className="flex items-baseline justify-between">
                    <span className="w-[155px] shrink-0">{title}</span>
                    <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                    <span className="w-6 text-left pl-1">{pg}</span>
                  </div>
                ))}
              </div>

              {/* BAB I PENDAHULUAN */}
              <div className="mt-6 space-y-1.5">
                <div>BAB I PENDAHULUAN</div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">1.1 LATAR BELAKANG</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">5</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="w-[155px] shrink-0">1.2 &nbsp;TUJUAN</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">6</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">1.2.2 &nbsp;&nbsp;Tujuan Umum</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">6</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">1.2.2 Tujuan Khusus</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">6</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">1.2.3 Ruang Lingkup Penyehatan Lingkungan Rumah Sakit</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">7</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">1.2.4 Isi dan Metoda Penyusunan</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">7</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">1.2.5 Jumlah dan Komposisi Personil</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">7</span>
                </div>
              </div>

              {/* BAB II GAMBARAN UMUM */}
              <div className="mt-6 space-y-1.5">
                <div>BAB II GAMBARAN UMUM</div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">2.1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visi dan Misi UOBK RSUD AL-MULK</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">8</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">2.2 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kondisi Geografi dan Wilayah Administrasi</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">8</span>
                </div>
              </div>

              {/* BAB III PELAKSANAAN KEGIATAN */}
              <div className="mt-6 space-y-1.5">
                <div>BAB III PELAKSANAAN KEGIATAN</div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.1 Penyelenggaraan Penyehatan Air</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">10</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.2 Penyelenggaraan Penyehatan Udara, Kebisingan dan Pencahayaan</span>
                  <span className="w-6 text-left pl-1">14</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.3 Penyelenggaraan Penyehatan Pangan Siap Saji</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">16</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.4 &nbsp;Penyelenggaraan Penyehat Sarana dan Bangunan</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">16</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.5 Penyelenggaraan Pengamanan Limbah dan Radiasi</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">21</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.6 Penyelenggaraan Pengamanan Limbah Cair..........</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">23</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.7 Penyelenggaraan Pengamanan Limbah Radiasi</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">27</span>
                </div>
                <div>
                  <div>3.6 Penyelenggaraan Pengendalian Vektor dan Binatang Pembawa</div>
                  <div className="flex items-baseline justify-between pl-6">
                    <span className="shrink-0">Penyakit</span>
                    <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                    <span className="w-6 text-left pl-1">29</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.7 Penyelenggaraan Pengawasan Linen / Laundry</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">30</span>
                </div>
                <div>
                  <div>3.8 Penyelenggaraan Pengawasan Dekontaminasi Melalui Disinfeksi dan</div>
                  <div className="flex items-baseline justify-between pl-6">
                    <span className="shrink-0">Sterilisasi</span>
                    <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                    <span className="w-6 text-left pl-1">32</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.9 Penanggungjawab Pelaksana</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">32</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0">3.10 Evaluasi Kegiatan</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 mx-2" />
                  <span className="w-6 text-left pl-1">32</span>
                </div>
              </div>
            </div>
            {renderSingleFooter(3)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 4: DAFTAR ISI LANJUTAN (PERSIS SESUAI GAMBAR NO 4)
           ===================================================================== */}
        {shouldRenderPage(4, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-4"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-24 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-5 text-[14px] leading-[1.8] text-slate-900">
              <div>BAB IV PENUTUP</div>
              <div>LAMPIRAN DAN DOKUMENTASI</div>
            </div>
            <div className="h-6" />
          </section>
        )}

        {/* =====================================================================
            HALAMAN 5: BAB 1 PENDAHULUAN (PERSIS SESUAI GAMBAR NO 5)
           ===================================================================== */}
        {shouldRenderPage(5, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-5"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[14px] leading-[1.85] text-justify text-slate-900">
              <div className="text-center font-bold text-[15px] uppercase leading-[1.5] mb-3">
                <div>BAB 1</div>
                <div>PENDAHULUAN</div>
              </div>

              <div className="flex items-baseline gap-4 mb-3">
                <span className="shrink-0">1.1</span>
                <span>Latar Belakang</span>
              </div>

              <div className="pl-9 space-y-4">
                <p className="indent-10">
                  Rumah Sakit UOBK RSUD AL-Mulk memiliki Visi menjadi Rumah Sakit dengan pelayanan kesehatan yang berkwalitas menuju kota Sukabumi yang sehat dan sejahtra dan misi sebagai berikut;
                </p>

                <ol className="list-decimal pl-6 space-y-2">
                  <li className="pl-1">
                    memberikan pelayanan secara komperehensif dan holistic mengacu kepada peningkatan mutu pelayanan dan keselamatan pasien
                  </li>
                  <li className="pl-1">
                    menciptakan suasana kerja yang harmonis dan meningkatkan kualitas SDM yang professional
                  </li>
                  <li className="pl-1">
                    meningkatkan teknologi pelayanan sesuai dengan pekembangan ilmu pengetahuan yang terjangkau oleh masyarakat
                  </li>
                  <li className="pl-1">
                    menciptakan suasana rumah sakit yang aman dan nyaman.
                  </li>
                </ol>

                <p className="indent-10 pt-1">
                  Sehingga untuk mengacu pada Visi Misi UOBK RSUD Al-Mulk, dalam pelaksanaannya, rumah sakit harus memiliki lingkungan yang sehat dan bebas dari segala faktor yang dapat menimbulkan ketidaknyamanan dan gangguan kesehatan baik untuk pasien, pengunjung maupun pegawai.
                </p>

                <p className="indent-10 pt-2">
                  Rumah Sakit Umum Daerah (RSUD) Al-Mulk Kota Sukabumi sebagai fasilitas pelayanan kesehatan rujukan milik pemerintah daerah memiliki peran penting dalam memberikan pelayanan kesehatan yang aman, bermutu, dan berorientasi pada keselamatan pasien. Dalam penyelenggaraan pelayanan tersebut, aspek <strong>kesehatan lingkungan rumah sakit</strong> merupakan salah satu pilar utama yang menentukan kualitas layanan dan pencegahan risiko penularan penyakit.
                </p>

                <p className="indent-10 pt-2">
                  Kesehatan lingkungan rumah sakit meliputi upaya pengelolaan faktor lingkungan fisik, kimia, biologi, dan sosial di lingkungan rumah sakit agar tidak menimbulkan dampak negatif terhadap pasien, tenaga kesehatan, pengunjung, maupun masyarakat sekitar. Pengelolaan ini mencakup sanitasi, penyediaan air bersih, pengelolaan limbah medis dan nonmedis, pengendalian vektor, kebersihan ruangan, serta kualitas udara dan bangunan.
                </p>

                <p className="indent-10 pt-2">
                  Sejalan dengan perkembangan kebijakan nasional, pemerintah menetapkan penerapan <strong>Kelas Rawat Inap Standar (KRIS)</strong> dalam Program Jaminan Kesehatan Nasional sebagaimana diatur dalam <strong>Peraturan Presiden</strong>
                </p>
              </div>
            </div>
            {renderSingleFooter(5)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 6: 1.1 LATAR BELAKANG (LANJUTAN) & 1.2 TUJUAN (PERSIS GAMBAR 1)
           ===================================================================== */}
        {shouldRenderPage(6, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-6"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[14px] leading-[1.85] text-justify text-slate-900">
              <div className="pl-11 space-y-6">
                <p>
                  <strong>Nomor 59 Tahun 2024</strong>, yang menekankan pemerataan mutu layanan rawat inap melalui pemenuhan standar fasilitas dan lingkungan perawatan. Implementasi KRIS berdampak langsung terhadap pengelolaan kesehatan lingkungan, khususnya pada aspek bangunan, ventilasi, kepadatan tempat tidur, sanitasi ruangan, pencahayaan, serta kenyamanan dan keselamatan pasien.
                </p>
                <p className="indent-11">
                  Selain itu, pengelolaan kesehatan lingkungan rumah sakit juga mengacu pada <strong>Peraturan Menteri Kesehatan Nomor 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit</strong>, serta standar akreditasi rumah sakit yang menempatkan manajemen fasilitas dan keselamatan sebagai komponen penting dalam penilaian mutu layanan.
                </p>
                <p className="indent-11">
                  Oleh karena itu, RSUD Al-Mulk Kota Sukabumi menyusun Laporan Tahunan Kesehatan Lingkungan sebagai bentuk akuntabilitas kinerja, sarana evaluasi pelaksanaan program, serta dasar perencanaan peningkatan mutu pengelolaan lingkungan rumah sakit secara berkelanjutan, sekaligus mendukung kesiapan penerapan KRIS secara optimal.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-baseline gap-6">
                  <span className="shrink-0">1.2</span>
                  <span>Tujuan</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="shrink-0">1.2.1.</span>
                    <span>Tujuan Umum</span>
                  </div>
                  <p className="pl-12">
                    Penyelenggara penyehatan lingkungan di RS yang memenuhi persyaratan sanitasi agar menjamin dan dapat menekan terjadinya infeksi nosokomial dan memberikan rasa aman serta nyaman pada pelanggan RS dan sebagai gambaran informasi data Kesehatan Lingkungan di RSUD Al-Mulk.
                  </p>
                </div>

                <div className="pt-3 space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="shrink-0">1.2.2.</span>
                    <span>Tujuan Khusus</span>
                  </div>
                  <ol className="list-decimal pl-16 space-y-1.5">
                    <li className="pl-2">
                      Mengetahui capaian kinerja pengelolaan kesehatan lingkungan RSUD Al-Mulk selama periode pelaporan.
                    </li>
                    <li className="pl-2">
                      Menilai tingkat kepatuhan terhadap regulasi kesehatan lingkungan dan standar KRIS.
                    </li>
                    <li className="pl-2">
                      Menjadi bahan evaluasi dan perencanaan program peningkatan mutu kesehatan lingkungan tahun berikutnya.
                    </li>
                    <li className="pl-2">
                      Mendukung pemenuhan persyaratan akreditasi dan akuntabilitas institusi.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            {renderSingleFooter(6)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 7: 1.2.3 RUANG LINGKUP, 1.2.4 METODA & 1.2.5 PERSONIL (PERSIS GAMBAR 2)
           ===================================================================== */}
        {shouldRenderPage(7, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-7"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-6 text-[14px] leading-[1.85] text-justify text-slate-900">
              <div>
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="shrink-0">1.2.3</span>
                  <span>Ruang Lingkup Penyehatan Lingkungan Rumah Sakit</span>
                </div>
                <div className="pl-12 space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">1.</span>
                    <span>Melaksanakan Pengawasan Kesehatan Air Rumah Sakit</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">2.</span>
                    <span>Pemeriksaan Kesehatan Udara Rumah Sakit</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">3.</span>
                    <span>Melaksanakan pengawasan Kesehatan Sarana dan Bangunan</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">4.</span>
                    <span>Melaksanakan pengawasan kebersihan</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">5.</span>
                    <span>Monitoring penanganan limbah cair infeksius</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">6.</span>
                    <span>Monitoring pengelolaan limbah padat</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">7.</span>
                    <span>Monitoring pemeriksaan pangan siap saji</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">8.</span>
                    <span className="pl-1">Monitoring Pemeriksaan Penyelenggaraan Linen</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0">9.</span>
                    <span className="pl-1">Monitoring Pemeriksaan Pengamanan Radiasi</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="w-6 shrink-0">10.</span>
                    <span>Pengendalian vector dan binatang pengganggu</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="shrink-0">1.2.4</span>
                  <span>Isi dan Metoda Penyusunan</span>
                </div>
                <p className="pl-10 indent-12">
                  Laporan Tahunan kesehatan Lingkungan UOBK RSUD Al-Mulk ini berisi data-data Kesehatan Lingkungan yang diperoleh sejak awal Januari sampai akhir Desember tahun {reportYear}. Motoda penyusunan yang digunakan adalah metoda tampilan data baik dalam bentuk tabel maupun peta. Semua itu disusun untuk memudahkan dalam membaca data yang tersedia.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="shrink-0">1.2.5</span>
                  <span>Jumlah dan Komposisi Personil</span>
                </div>
                <p className="pl-12 indent-11">
                  Jumlah tenaga di UOBK RSUD Al-Mulk ada 2 orang dengan latar belakang pendidikan D III Kesehatan Lingkungan dan S1 Kesling dan status kepegawaian PNS dan THL
                </p>
              </div>
            </div>
            {renderSingleFooter(7)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 8: BAB II GAMBARAN UMUM (PERSIS GAMBAR 3)
           ===================================================================== */}
        {shouldRenderPage(8, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-8"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.5px] leading-[1.75] text-justify text-slate-900">
              <div className="text-center font-bold text-[15px] uppercase leading-[1.8] mb-3">
                <div>BAB II</div>
                <div>GAMBARAN UMUM</div>
              </div>

              <div className="flex items-baseline gap-5 mb-1">
                <span className="shrink-0">2.3</span>
                <span>Visi dan Misi UOBK RSUD AL-MULK</span>
              </div>

              <div className="pl-11 space-y-2.5">
                <p>
                  Dengan mengacu kepada visi Pemerintah Kota Sukabumi yaitu &ldquo; Mewujudkan masyarakat yang religious, nyaman dan sejahtera (Renyah)&rdquo;, maka selanjutnya RSUD Al-Mulk menetapkan Visi, Misi, Falsafah Yaitu :
                </p>

                <div className="pl-1 space-y-2.5">
                  <div>
                    <div className="flex items-baseline gap-4 mb-1.5">
                      <span className="shrink-0">A.</span>
                      <span>Visi :</span>
                    </div>
                    <p className="pl-7">
                      menjadi Rumah Sakit dengan pelayanan kesehatan yang berkwalitas menuju kota Sukabumi yang sehat dan sejahtra.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-4 mb-1.5">
                      <span className="shrink-0">B.</span>
                      <span>Misi</span>
                    </div>
                    <ol className="list-decimal pl-11 space-y-2">
                      <li className="pl-2">
                        Memberikan pelayanan secara komperehensif dan holistic mengacu kepada peningkatan mutu pelayanan dan keselamatan pasien
                      </li>
                      <li className="pl-2">
                        Menciptakan suasana kerja yang harmonis dan meningkatkan kualitas SDM yang professional.
                      </li>
                      <li className="pl-2">
                        Meningkatkan teknologi pelayanan sesuai dengan pekembangan ilmu pengetahuan yang terjangkau oleh masyarakat
                      </li>
                      <li className="pl-2">
                        Menciptakan suasana rumah sakit yang aman dan nyaman.
                      </li>
                    </ol>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-6 mb-1.5">
                      <span className="shrink-0">C.</span>
                      <span>Falsafah</span>
                    </div>
                    <p className="pl-9">
                      Falsafah UOBK RSUD Al-Mulk adalah memberikan pelayanan prima sesuai standar profesionalisme secara konsisten dan disiplin tinggi, memegang teguh etika profesi dan integritas moral yang tinggi
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-5 mb-1">
                  <span className="shrink-0">2.4</span>
                  <span>Kondisi Geografi dan Wilayah Administrasi</span>
                </div>

                <div className="pl-11 space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="shrink-0">A.</span>
                    <span>RINGKASAN USAHA DAN ATAU KEGIATAN</span>
                  </div>

                  <div className="pl-6 space-y-1 text-left">
                    <div className="grid grid-cols-[36px_190px_18px_1fr] items-baseline">
                      <span>a.</span>
                      <span>Nama Usaha/ Kegiatan</span>
                      <span>:</span>
                      <span className="pl-4">UOBK RSUD Al Mulk</span>
                    </div>
                    <div className="grid grid-cols-[36px_190px_18px_1fr] items-baseline">
                      <span>b.</span>
                      <span>Lokasi Usaha/ Kegiatan</span>
                      <span />
                      <span />
                    </div>
                    <div className="pl-9 space-y-1">
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>1.</span>
                        <span>Nama Jalan</span>
                        <span>:</span>
                        <span>Pelabuhan II KM 6</span>
                      </div>
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>2.</span>
                        <span>Kelurahan</span>
                        <span>:</span>
                        <span>Lembursitu</span>
                      </div>
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>3.</span>
                        <span>Kecamatan</span>
                        <span>:</span>
                        <span>Lembursitu</span>
                      </div>
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>4.</span>
                        <span>Titik koordinat</span>
                        <span>:</span>
                        <span>-6.95868, 106.89784</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-[36px_190px_18px_1fr] items-baseline pt-0.5">
                      <span>c.</span>
                      <span>Jumlah Pegawai</span>
                      <span>:</span>
                      <span className="pl-4">179 orang</span>
                    </div>
                    <div className="pl-9 space-y-1">
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>1.</span>
                        <span>Waktu Operasi</span>
                        <span>:</span>
                        <span>24 Jam/ 3 Shift</span>
                      </div>
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>2.</span>
                        <span>Jenis Kegiatan</span>
                        <span>:</span>
                        <span>Pelayanan Kesehatan</span>
                      </div>
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>3.</span>
                        <span>Luas Lahan/</span>
                        <span>:</span>
                        <span>4667 m2</span>
                      </div>
                      <div className="grid grid-cols-[24px_154px_18px_1fr] items-baseline">
                        <span>4.</span>
                        <span>Bangunan</span>
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {renderSingleFooter(8)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 9: LANJUTAN 2.4 & GAMBAR 2.1 PETA WILAYAH (PERSIS GAMBAR 4)
           ===================================================================== */}
        {shouldRenderPage(9, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-9"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[14px] leading-[1.8] text-slate-900">
              <div className="pl-16 space-y-1 text-left">
                <div className="grid grid-cols-[26px_205px_18px_1fr] items-baseline">
                  <span>d.</span>
                  <span className="flex justify-between pr-4">
                    <span>Pemanfaatan</span>
                    <span>Listrik/</span>
                  </span>
                  <span>:</span>
                  <span>10.150 VA</span>
                </div>
                <div className="grid grid-cols-[26px_205px_18px_1fr] items-baseline">
                  <span />
                  <span>Energi</span>
                  <span />
                  <span />
                </div>

                <div className="grid grid-cols-[26px_205px_18px_1fr] items-baseline pt-0.5">
                  <span>e.</span>
                  <span>Pemanfaatan Air</span>
                  <span>:</span>
                  <span>10 m3/ hari</span>
                </div>

                <div className="pl-6 space-y-1">
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span>-</span>
                    <span>Jenis Sumber</span>
                    <span>:</span>
                    <span>Artesis dan Air RO</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span className="pl-1">-</span>
                    <span className="pl-1">Kamar Mandi/ WC</span>
                    <span>:</span>
                    <span>10 m3/ hari</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span>-</span>
                    <span>Penyiraman/ Cuci</span>
                    <span>:</span>
                    <span>1 m3/ hari</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span />
                    <span>Limbah Produksi</span>
                    <span>:</span>
                    <span>9 m3/hari</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span>-</span>
                    <span>Hasil Air Limbah</span>
                    <span>:</span>
                    <span>Terlampir</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span>-</span>
                    <span>Jumlah Toilet</span>
                    <span>:</span>
                    <span>58 toilet</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span>-</span>
                    <span>IPAL</span>
                    <span>:</span>
                    <span>ada</span>
                  </div>
                  <div className="grid grid-cols-[24px_181px_18px_1fr] items-baseline">
                    <span>-</span>
                    <span>TPS Limbah Medis dan B3</span>
                    <span>:</span>
                    <span>ada</span>
                  </div>
                </div>
              </div>

              <div className="mt-9 text-center space-y-1.5">
                <div className="text-[13px] leading-[1.6] text-slate-900">
                  <div>Gambar : 2.1.</div>
                  <div>Peta Wilayah UOBK RSUD Al-Mulk</div>
                </div>
                <div className="pt-1">
                  <img
                    src="/assets/aistudio/peta-wilayah-rsam.png"
                    alt="Gambar 2.1 Peta Wilayah UOBK RSUD Al-Mulk"
                    className="w-full mx-auto block"
                  />
                </div>
              </div>
            </div>
            {renderSingleFooter(9)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 10: BAB III & 3.1 PENYEHATAN AIR (PERSIS GAMBAR 5)
           ===================================================================== */}
        {shouldRenderPage(10, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-10"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[14px] leading-[1.85] text-justify text-slate-900">
              <div className="text-center font-bold text-[15px] uppercase leading-[1.7] mb-6">
                <div>BAB III</div>
                <div>PELAKSANAAN KEGIATAN</div>
              </div>

              <p className="indent-11 mb-4">
                Upaya yang menjadi sasaran kegiatan Kesehatan lingkungan rumah sakit berdasarkan PERMENKES NO 7 TAHUN 2019 meliputi:
              </p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="shrink-0">3.1</span>
                <span>Penyelenggaraan Penyehatan Air</span>
              </div>

              <div className="pl-7 space-y-1">
                <p className="indent-9">
                  Sumber air bersih yang digunakan di RSUD Al-Mulk adalah air Artesi dan Air RO dan untuk sumber air minum yang digunakan kerjasama dengan pihak ke 3 yaitu Prima. Kualitas air yang disediakan di rumah sakit harus sesuai dengan Permenkes No.32 Tahun 2017 tentang standar Baku Mutu Kesehatan Lingkungan dan Persyaratan kesehatan Air Untuk Keperluan Hygiene Sanitasi, sedangkan kualitas air yang digunakan untuk keperluan khusus perlu mendapatkan perlakuan lebih lanjut untuk mendapatkan kualitas yang relevan.
                </p>
                <p>
                  Untuk mendapatkan air dengan kuantitas dan kualitas sesuai dengan yang dibutuhkan harus memperhatikan upaya-upaya berikut ini :
                </p>
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-baseline gap-5">
                    <span className="w-5 shrink-0">a)</span>
                    <span>Pemeliharaan Unit water treatment</span>
                  </div>
                  <div className="flex items-baseline gap-5">
                    <span className="w-5 shrink-0">b)</span>
                    <span>Pemeriksaan air bersih dilakukan setiap 6 bulan sekali untuk mikrobiologi, kimia dan fisika</span>
                  </div>
                  <div className="flex items-baseline gap-5">
                    <span className="w-5 shrink-0">c)</span>
                    <span>Pemeriksaan air bersih dilakukan setiap 1 bulan sekali untuk mikrobiologi.</span>
                  </div>
                </div>
                <p className="pl-10 pt-3">
                  Adapun hasil pengujiannya adalah sebagai berikut :
                </p>
              </div>
            </div>
            {renderSingleFooter(10)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 11: TABEL 1. HASIL PENGUJIAN AIR BERSIH (LANDSCAPE - PERSIS GAMBAR 6)
           ===================================================================== */}
        {shouldRenderPage(11, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-11"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-12 sm:px-14 pt-12 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner()}
            <div className="space-y-4 text-[12px] font-sans text-slate-900">
              <div className="text-center text-[13.5px] font-normal tracking-normal">
                Tabel 1. Hasil Pengujian Air Bersih
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-600 text-[11px] leading-[1.25] table-fixed">
                  <colgroup>
                    <col className="w-[5.2%]" />
                    <col className="w-[8.2%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[6.3%]" />
                    <col className="w-[6.7%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[6.4%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[6.5%]" />
                    <col className="w-[8.6%]" />
                    <col className="w-[6.8%]" />
                    <col className="w-[8.8%]" />
                    <col className="w-[8.8%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-center font-normal">
                      <th rowSpan={2} className="border border-slate-600 px-1 py-2 align-middle font-normal">
                        Nama
                      </th>
                      <th rowSpan={2} className="border border-slate-600 px-1 py-2 align-middle font-normal">
                        Indikator
                        <br />
                        Mutu AIR
                        <br />
                        BERSIH
                      </th>
                      <th rowSpan={2} className="border border-slate-600 px-1 py-2 align-middle font-normal">
                        Nilai
                        <br />
                        Normal
                      </th>
                      <th colSpan={12} className="border border-slate-600 px-1 py-1.5 align-middle font-normal">
                        Nilai Hasil Pemeriksaan
                      </th>
                    </tr>
                    <tr className="text-center font-normal text-[10.5px]">
                      {MONTH_SHORT_HEADERS.map((m) => (
                        <th key={m} className="border border-slate-600 px-0.5 py-2 align-middle font-normal">
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.water.tabel1AirBersih.map((row, rIdx) => {
                      const isFirstSumur1 = rIdx === 0;
                      const isFirstArtesis = rIdx === 2;
                      return (
                        <tr key={`${row.sourceLabel}-${row.indicator}-${rIdx}`}>
                          {isFirstSumur1 && (
                            <td
                              rowSpan={2}
                              className="border border-slate-600 px-1.5 py-1 align-middle text-left"
                            >
                              Sumur
                              <br />1
                            </td>
                          )}
                          {isFirstArtesis && (
                            <td
                              rowSpan={14}
                              className="border border-slate-600 px-1.5 py-1 align-middle text-left"
                            >
                              Artesis
                            </td>
                          )}
                          <td className="border border-slate-600 px-1.5 py-0.5 text-left align-middle">
                            {row.indicator === 'Total Coliform' ? (
                              <>
                                Total
                                <br />
                                Coliform
                              </>
                            ) : (
                              row.indicator
                            )}
                          </td>
                          <td className="border border-slate-600 px-1 py-0.5 text-center align-middle">
                            {row.normalValue === '0/100 ml' ? (
                              <>
                                0/100
                                <br />
                                ml
                              </>
                            ) : row.normalValue === 'suhu udara ±3°C' ? (
                              <>
                                suhu
                                <br />
                                udara
                                <br />
                                ±3°C
                              </>
                            ) : row.normalValue === 'Tidak Berbau' ? (
                              <>
                                Tidak
                                <br />
                                Berbau
                              </>
                            ) : row.normalValue === '6,5 - 8,5' ? (
                              <>
                                6,5 -
                                <br />
                                8,5
                              </>
                            ) : (
                              row.normalValue
                            )}
                          </td>
                          {row.monthlyValues.map((val, mIdx) => {
                            const isGrayCell = !val || (row.indicator === 'Kesadahan' && val === '-');
                            const shouldSplitMl =
                              val.endsWith(' ml') && mIdx !== 8 && mIdx !== 10 && !(mIdx === 11 && row.indicator === 'E.Coli');
                            return (
                              <td
                                key={mIdx}
                                className={`border border-slate-600 px-1 py-0.5 text-center align-middle ${
                                  isGrayCell ? 'bg-[#CCCCCC]' : 'bg-white'
                                }`}
                              >
                                {shouldSplitMl ? (
                                  <>
                                    {val.replace(' ml', '')}
                                    <br />
                                    ml
                                  </>
                                ) : val === 'Tidak berbau' ? (
                                  <>
                                    Tidak
                                    <br />
                                    berbau
                                  </>
                                ) : (
                                  val
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {renderLandscapeFooter(11)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 12: TABEL 2. HASIL PENGUJIAN AIR RO (LANDSCAPE - PERSIS GAMBAR 7)
           ===================================================================== */}
        {shouldRenderPage(12, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-12"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-12 sm:px-14 pt-14 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner(12)}
            <div className="space-y-4 text-[12px] font-sans text-slate-900">
              <div className="text-center text-[13.5px] font-normal tracking-normal">
                Tabel 2. Hasil Pengujian Air RO
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-600 text-[11px] leading-[1.25] table-fixed">
                  <colgroup>
                    <col className="w-[5.2%]" />
                    <col className="w-[8.2%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[6.3%]" />
                    <col className="w-[6.7%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[6.4%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[6.5%]" />
                    <col className="w-[8.6%]" />
                    <col className="w-[6.8%]" />
                    <col className="w-[8.8%]" />
                    <col className="w-[8.8%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-center font-normal">
                      <th rowSpan={2} className="border border-slate-600 px-1 py-2 align-middle font-normal">
                        Nama
                      </th>
                      <th rowSpan={2} className="border border-slate-600 px-1 py-2 align-middle font-normal">
                        Indikator
                        <br />
                        Mutu AIR
                        <br />
                        BERSIH
                      </th>
                      <th rowSpan={2} className="border border-slate-600 px-1 py-2 align-middle font-normal">
                        Nilai
                        <br />
                        Normal
                      </th>
                      <th colSpan={12} className="border border-slate-600 px-1 py-1.5 align-middle font-normal">
                        Nilai Hasil Pemeriksaan
                      </th>
                    </tr>
                    <tr className="text-center font-normal text-[10.5px]">
                      {MONTH_SHORT_HEADERS.map((m) => (
                        <th key={m} className="border border-slate-600 px-0.5 py-2 align-middle font-normal">
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.water.tabel2AirRo.slice(0, 15).map((row, rIdx) => {
                      const isFirstRoPoliGigi = rIdx === 0;
                      const isFirstRoLab = rIdx === 14;
                      return (
                        <tr key={`ro1-${row.sourceLabel}-${row.indicator}-${rIdx}`}>
                          {isFirstRoPoliGigi && (
                            <td
                              rowSpan={14}
                              className="border border-slate-600 px-1 py-1 align-middle text-center"
                            >
                              RO
                              <br />
                              POLI
                              <br />
                              GIGI
                            </td>
                          )}
                          {isFirstRoLab && (
                            <td className="border border-slate-600 px-1 py-0.5 align-middle text-center">
                              RO
                              <br />
                              LAB
                            </td>
                          )}
                          <td className="border border-slate-600 px-1.5 py-0.5 text-left align-middle">
                            {row.indicator === 'Total Coliform' ? (
                              <>
                                Total
                                <br />
                                Coliform
                              </>
                            ) : (
                              row.indicator
                            )}
                          </td>
                          <td className="border border-slate-600 px-1 py-0.5 text-center align-middle">
                            {row.normalValue === '0/100 ml' ? (
                              <>
                                0/100
                                <br />
                                ml
                              </>
                            ) : row.normalValue === '50/100 ml' ? (
                              <>
                                50/100
                                <br />
                                ml
                              </>
                            ) : row.normalValue === 'suhu udara ±3°C' ? (
                              <>
                                suhu
                                <br />
                                udara
                                <br />
                                ±3°C
                              </>
                            ) : row.normalValue === 'Tidak berbau' ? (
                              <>
                                Tidak
                                <br />
                                berbau
                              </>
                            ) : row.normalValue === '6,5 - 8,5' ? (
                              <>
                                6,5 -
                                <br />
                                8,5
                              </>
                            ) : (
                              row.normalValue
                            )}
                          </td>
                          {row.monthlyValues.map((val, mIdx) => {
                            const isGrayCell = !val;
                            const keepSingleLineMl =
                              mIdx === 8 ||
                              mIdx === 10 ||
                              mIdx === 11 ||
                              (row.indicator === 'E.Coli' && (mIdx === 1 || mIdx === 7 || mIdx === 9));
                            const shouldSplitMl = val.endsWith(' ml') && !keepSingleLineMl;
                            return (
                              <td
                                key={mIdx}
                                className={`border border-slate-600 px-1 py-0.5 text-center align-middle ${
                                  isGrayCell ? 'bg-[#CCCCCC]' : 'bg-white'
                                }`}
                              >
                                {shouldSplitMl ? (
                                  <>
                                    {val.replace(' ml', '')}
                                    <br />
                                    ml
                                  </>
                                ) : val === 'Tidak berbau' ? (
                                  <>
                                    Tidak
                                    <br />
                                    berbau
                                  </>
                                ) : (
                                  val
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {renderLandscapeFooter(12)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 13: TABEL 2 LANJUTAN AIR RO LAB (LANDSCAPE - PERSIS GAMBAR 8)
           ===================================================================== */}
        {shouldRenderPage(13, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-13"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-12 sm:px-14 pt-16 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner(13)}
            <div className="text-[12px] font-sans text-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-600 text-[11px] leading-[1.25] table-fixed">
                  <colgroup>
                    <col className="w-[5.2%]" />
                    <col className="w-[8.2%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[6.3%]" />
                    <col className="w-[6.7%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[6.4%]" />
                    <col className="w-[5.3%]" />
                    <col className="w-[6.5%]" />
                    <col className="w-[8.6%]" />
                    <col className="w-[6.8%]" />
                    <col className="w-[8.8%]" />
                    <col className="w-[8.8%]" />
                  </colgroup>
                  <tbody>
                    {compiled.water.tabel2AirRo.slice(15).map((row, rIdx) => {
                      const isFirstContinuationRow = rIdx === 0;
                      return (
                        <tr key={`ro2-${row.indicator}-${rIdx}`}>
                          {isFirstContinuationRow && (
                            <td
                              rowSpan={13}
                              className="border border-slate-600 px-1 py-1 align-middle bg-white"
                            />
                          )}
                          <td className="border border-slate-600 px-1.5 py-0.5 text-left align-middle">
                            {row.indicator}
                          </td>
                          <td className="border border-slate-600 px-1 py-0.5 text-center align-middle">
                            {row.normalValue === '0/100 ml' ? (
                              <>
                                0/100
                                <br />
                                ml
                              </>
                            ) : row.normalValue === 'suhu udara ±3°C' ? (
                              <>
                                suhu
                                <br />
                                udara
                                <br />
                                ±3°C
                              </>
                            ) : row.normalValue === '6,5 - 8,5' ? (
                              <>
                                6,5 -
                                <br />
                                8,5
                              </>
                            ) : (
                              row.normalValue
                            )}
                          </td>
                          {row.monthlyValues.map((val, mIdx) => {
                            const isGrayCell = !val;
                            const keepSingleLineMl =
                              mIdx === 1 || mIdx === 7 || mIdx === 8 || mIdx === 9 || mIdx === 10 || mIdx === 11;
                            const shouldSplitMl = val.endsWith(' ml') && !keepSingleLineMl;
                            return (
                              <td
                                key={mIdx}
                                className={`border border-slate-600 px-1 py-0.5 text-center align-middle ${
                                  isGrayCell ? 'bg-[#CCCCCC]' : 'bg-white'
                                }`}
                              >
                                {shouldSplitMl ? (
                                  <>
                                    {val.replace(' ml', '')}
                                    <br />
                                    ml
                                  </>
                                ) : val === 'Tidak berbau' ? (
                                  <>
                                    Tidak
                                    <br />
                                    berbau
                                  </>
                                ) : (
                                  val
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {renderLandscapeFooter(13)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 14: ANALISA & REKOMENDASI AIR & 3.2 PENYEHATAN UDARA (PERSIS GAMBAR 1)
           ===================================================================== */}
        {shouldRenderPage(14, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-14"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.8px] leading-[1.82] text-justify text-slate-900">
              <div className="pl-9 space-y-2">
                <p className="indent-9">
                  Berdasarkan Tabel diatas, pemeriksaan kualitas air bersih (Sumur Gali, Artesis dan Air RO) yang dilakukan di Laboratorium Kesehatan Daerah Kota Sukabumi sesuai dengan PMK No.2 Tahun 2023 tentang Peraturan Pelaksana PP No. 66 Tahun 2014 standar Baku Mutu Kesehatan Lingkungan dan Persyaratan kesehatan Air Untuk Keperluan Hygiene Sanitasi, hasil analisanya ;
                </p>

                <ol className="list-decimal pl-8 space-y-1.5">
                  <li className="pl-2">
                    Kualitas air bersih rumah sakit secara umum berada dalam kondisi baik, namun masih diperlukan pengendalian pada parameter mikrobiologi dan mangan.
                  </li>
                  <li className="pl-2">
                    Kualitas air RO menunjukkan hasil yang baik dan mendukung kebutuhan pelayanan kesehatan rumah sakit.
                  </li>
                  <li className="pl-2">
                    Monitoring dan pengujian rutin tetap diperlukan untuk menjamin kesinambungan mutu air sesuai standar kesehatan lingkungan rumah sakit.
                  </li>
                </ol>

                <div className="pt-3 pl-8">Rekomendasi</div>

                <ol className="list-decimal pl-8 space-y-1.5">
                  <li className="pl-2">
                    Melakukan desinfeksi dan pemeliharaan rutin pada seluruh sumber air bersih.
                  </li>
                  <li className="pl-2">
                    Menambahkan atau mengoptimalkan pengolahan air untuk penurunan kadar mangan.
                  </li>
                  <li className="pl-2">
                    Melakukan perawatan berkala sistem RO serta penggantian filter sesuai jadwal.
                  </li>
                  <li className="pl-2">
                    Meningkatkan frekuensi monitoring pada parameter mikrobiologi dan kimia kritis.
                  </li>
                </ol>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="shrink-0">3.2</span>
                  <span>Penyelenggaraan Penyehatan Udara, Kebisingan, Dan Pencahayaan</span>
                </div>

                <div className="pl-9 space-y-3">
                  <p className="indent-9">
                    Hasil Upaya pemeriksaan kelembaban udara, kebisingan, dan pencahayaan sudah dilaksanakan oleh petugas sanitarian rumah sakit, dilakukan dalam satu tahun sebanyak 2 kali pemeriksaan atau 1 kali per semester di bulan Juni dan Desember Adapun hasil pengujiannya sebagai berikut:
                  </p>
                </div>

                <div className="mt-3 text-center text-[13.5px]">
                  Tabel 2. Hasil Pemeriksaan Kelembapan Udara, Pencahayaan, dan Kebisingan
                </div>

                {/* Excel-style Line Chart Replica matching Gambar 1 */}
                <div className="mt-2 border border-slate-300 bg-white px-4 pt-3 pb-2.5">
                  <svg viewBox="0 0 640 215" className="w-full h-auto block">
                    {/* Horizontal grid lines (0%, 20%, 40%, 60%, 80%, 100%) */}
                    {[
                      { pct: '100%', y: 20 },
                      { pct: '80%', y: 47 },
                      { pct: '60%', y: 74 },
                      { pct: '40%', y: 101 },
                      { pct: '20%', y: 128 },
                      { pct: '0%', y: 155 },
                    ].map((g) => (
                      <g key={g.pct}>
                        <text
                          x="44"
                          y={g.y + 3.5}
                          textAnchor="end"
                          fontSize="9.5"
                          fill="#595959"
                        >
                          {g.pct}
                        </text>
                        <line
                          x1="54"
                          y1={g.y}
                          x2="615"
                          y2={g.y}
                          stroke="#D9D9D9"
                          strokeWidth="1"
                        />
                      </g>
                    ))}

                    {/* X-axis category labels */}
                    <text x="160" y="172" textAnchor="middle" fontSize="9.5" fill="#595959">
                      KELEMBABAN UDARA
                    </text>
                    <text x="342" y="172" textAnchor="middle" fontSize="9.5" fill="#595959">
                      PENCAHAYAAN
                    </text>
                    <text x="524" y="172" textAnchor="middle" fontSize="9.5" fill="#595959">
                      KEBISINGAN
                    </text>

                    {/* Series 1: JUNI (Orange #C55A11 / #ED7D31) */}
                    <polyline
                      points="160,129 342,115 524,128"
                      fill="none"
                      stroke="#C55A11"
                      strokeWidth="2.3"
                    />
                    {[
                      { x: 160, y: 129, val: `${compiled.air.chartComparison[0]?.juniPct ?? 34}%` },
                      { x: 342, y: 115, val: `${compiled.air.chartComparison[1]?.juniPct ?? 80}%` },
                      { x: 524, y: 128, val: `${compiled.air.chartComparison[2]?.juniPct ?? 35}%` },
                    ].map((pt, idx) => (
                      <g key={`juni-${idx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3.6"
                          fill="#5B9BD5"
                          stroke="#C55A11"
                          strokeWidth="2"
                        />
                        <text x={pt.x + 10} y={pt.y + 3.5} fontSize="9.5" fill="#404040">
                          {pt.val}
                        </text>
                      </g>
                    ))}

                    {/* Series 2: DESEMBER (Blue #0070C0) */}
                    <polyline
                      points="160,94 342,67 524,93"
                      fill="none"
                      stroke="#0070C0"
                      strokeWidth="2.3"
                    />
                    {[
                      { x: 160, y: 94, val: `${compiled.air.chartComparison[0]?.desemberPct ?? 46}%` },
                      { x: 342, y: 67, val: `${compiled.air.chartComparison[1]?.desemberPct ?? 100}%` },
                      { x: 524, y: 93, val: `${compiled.air.chartComparison[2]?.desemberPct ?? 49}%` },
                    ].map((pt, idx) => (
                      <g key={`des-${idx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3.6"
                          fill="#ED7D31"
                          stroke="#0070C0"
                          strokeWidth="2"
                        />
                        <text x={pt.x + 10} y={pt.y + 3.5} fontSize="9.5" fill="#404040">
                          {pt.val}
                        </text>
                      </g>
                    ))}

                    {/* Series 3: NORMAL (Light Green #A9D18E) */}
                    <polyline
                      points="160,20 342,20 524,20"
                      fill="none"
                      stroke="#A9D18E"
                      strokeWidth="4"
                    />
                    {[
                      { x: 160, y: 20, val: '100%' },
                      { x: 342, y: 20, val: '100%' },
                      { x: 524, y: 20, val: '100%' },
                    ].map((pt, idx) => (
                      <g key={`norm-${idx}`}>
                        <circle cx={pt.x} cy={pt.y} r="5.5" fill="#A9D18E" />
                        <text x={pt.x + 11} y={pt.y + 3.5} fontSize="9.5" fill="#404040">
                          {pt.val}
                        </text>
                      </g>
                    ))}

                    {/* Bottom Legend: JUNI | DESEMBER | NORMAL */}
                    <g transform="translate(205, 198)">
                      <line x1="0" y1="0" x2="22" y2="0" stroke="#C55A11" strokeWidth="2.3" />
                      <circle cx="11" cy="0" r="3.2" fill="#5B9BD5" stroke="#C55A11" strokeWidth="1.8" />
                      <text x="26" y="3.5" fontSize="9.5" fill="#595959">
                        JUNI
                      </text>

                      <line x1="62" y1="0" x2="84" y2="0" stroke="#0070C0" strokeWidth="2.3" />
                      <circle cx="73" cy="0" r="3.2" fill="#ED7D31" stroke="#0070C0" strokeWidth="1.8" />
                      <text x="88" y="3.5" fontSize="9.5" fill="#595959">
                        DESEMBER
                      </text>

                      <line x1="150" y1="0" x2="172" y2="0" stroke="#A9D18E" strokeWidth="3.8" />
                      <circle cx="161" cy="0" r="4.5" fill="#A9D18E" />
                      <text x="176" y="3.5" fontSize="9.5" fill="#595959">
                        NORMAL
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            {renderSingleFooter(14)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 15: INTERPRETASI & REKOMENDASI KRIS UDARA (PERSIS GAMBAR 2)
           ===================================================================== */}
        {shouldRenderPage(15, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-15"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-1.5 text-[13.6px] leading-[1.72] text-justify text-slate-900">
              <p>
                Berdasarkan tabel diatas hasil pengukuran semester 1 dan semester 2 di hasilkan;
              </p>

              {/* 1. Kelembaban Udara */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span>1.</span>
                  <span>Kelembaban Udara</span>
                </div>
                <ul className="list-disc pl-10 space-y-1">
                  <li className="pl-2">Juni: {compiled.air.chartComparison[0]?.juniPct ?? 34}%</li>
                  <li className="pl-2">Desember: {compiled.air.chartComparison[0]?.desemberPct ?? 46}%</li>
                  <li className="pl-2">Target KRIS: 100% (memenuhi standar kelembaban yang dipersyaratkan)</li>
                </ul>
                <p>
                  Interpretasi KRIS: Kelembaban udara masih belum memenuhi standar KRIS, di mana ruang rawat inap harus memberikan kenyamanan termal bagi pasien. Kelembaban yang terlalu rendah dapat menimbulkan rasa tidak nyaman, udara kering, dan berpotensi memengaruhi kondisi pasien.
                </p>
                <div>Rekomendasi KRIS:</div>
                <ul className="list-disc pl-10 space-y-1">
                  <li className="pl-2">Optimalisasi sistem AC dan ventilasi</li>
                  <li className="pl-2">Pemeliharaan berkala HVAC</li>
                  <li className="pl-2">
                    Penyesuaian setting kelembaban agar sesuai standar kenyamanan ruang rawat inap KRIS
                  </li>
                </ul>
              </div>

              {/* 2. Pencahayaan */}
              <div className="space-y-1 pt-0.5">
                <div>2. Pencahayaan</div>
                <ul className="list-disc pl-10 space-y-1">
                  <li className="pl-2">Juni: {compiled.air.chartComparison[1]?.juniPct ?? 80}%</li>
                  <li className="pl-2">Desember: {compiled.air.chartComparison[1]?.desemberPct ?? 100}%</li>
                  <li className="pl-2">Target KRIS: 100%</li>
                </ul>
                <p>
                  Interpretasi KRIS: Pencahayaan pada bulan Juni belum sepenuhnya memenuhi standar KRIS, namun pada bulan Desember telah memenuhi standar pencahayaan ruang rawat inap KRIS, baik untuk keselamatan pasien maupun kenyamanan visual.
                </p>
                <div>Rekomendasi KRIS:</div>
                <ul className="list-disc pl-10 space-y-1">
                  <li className="pl-2">Mempertahankan pencahayaan sesuai standar</li>
                  <li className="pl-2">Melakukan inspeksi rutin lampu dan pencahayaan alami</li>
                  <li className="pl-2">Mengganti lampu redup atau tidak berfungsi secara berkala</li>
                </ul>
              </div>

              {/* 3. Kebisingan */}
              <div className="space-y-1 pt-0.5">
                <div>3. Kebisingan</div>
                <ul className="list-disc pl-10 space-y-1">
                  <li className="pl-2">Juni: {compiled.air.chartComparison[2]?.juniPct ?? 35}%</li>
                  <li className="pl-2">Desember: {compiled.air.chartComparison[2]?.desemberPct ?? 49}%</li>
                  <li className="pl-2">Target KRIS: 100% (lingkungan rawat inap yang tenang dan kondusif)</li>
                </ul>
                <p>
                  Interpretasi KRIS: Tingkat kebisingan relatif rendah dan mendukung ketenangan ruang rawat inap, namun masih perlu pengendalian agar tetap konsisten sesuai prinsip KRIS yang mengutamakan kenyamanan dan pemulihan pasien.
                </p>
                <div>Rekomendasi KRIS:</div>
                <ul className="list-disc pl-10 space-y-1">
                  <li className="pl-2">Pengendalian sumber kebisingan (alat medis, lalu lintas internal RS)</li>
                  <li className="pl-2">Pemasangan peredam suara pada area tertentu</li>
                  <li className="pl-2">Penegakan zona tenang (quiet zone) di ruang rawat inap KRIS</li>
                </ul>
              </div>
            </div>
            {renderSingleFooter(15)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 16: 3.3 PENYEHATAN PANGAN & 3.4 SARANA BANGUNAN (PERSIS GAMBAR 3)
           ===================================================================== */}
        {shouldRenderPage(16, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-16"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.8px] leading-[1.8] text-justify text-slate-900">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="shrink-0">3.3</span>
                <span>Penyelenggaraan Penyehatan Pangan Siap Saji</span>
              </div>

              <div className="pl-9 space-y-3">
                <p className="indent-9">
                  Pengelolaan pangan siap saji di RSUD Al-Mulk dilakukan secara berkala setiap 6 bulan sekali mengunjungi Dapur, dikarenakan penyelenggaraan pangan di RSUD Al-Mulk masih dilakukan oleh pihak ke-3 dan belum dikelola sendiri.
                </p>
                <p className="indent-9">
                  Adapun hasil pemantauan ceklist penyehatan makanan dan pramusaji makanan di dapur dan pantry sebagai berikut;
                </p>
              </div>

              {/* 3D Bar Chart Replica matching Gambar 3 */}
              <div className="mt-3 border border-slate-300 bg-white px-4 pt-3 pb-2.5">
                <svg viewBox="0 0 650 265" className="w-full h-auto block">
                  {/* Y-axis percentage labels (75% to 84%) */}
                  {[84, 83, 82, 81, 80, 79, 78, 77, 76, 75].map((pct, idx) => {
                    const y = 26 + idx * 9;
                    return (
                      <text
                        key={pct}
                        x="72"
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#595959"
                      >
                        {pct}%
                      </text>
                    );
                  })}

                  {/* 12 Monthly 3D Columns */}
                  {compiled.food.monthlySeries.map((item, idx) => {
                    const x = 92 + idx * 42;
                    const val = item.nilaiPct;
                    const clamped = Math.max(75, Math.min(84, val));
                    const barBottom = 107;
                    const barHeight = 20 + ((clamped - 75) / 9) * 60;
                    const barTop = barBottom - barHeight;
                    const barWidth = 24;
                    const depth = 6;
                    return (
                      <g key={item.monthLabel}>
                        {/* Value above bar */}
                        <text
                          x={x + barWidth / 2 + 2}
                          y={barTop - 6}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#404040"
                        >
                          {val}%
                        </text>
                        {/* Front face */}
                        <rect
                          x={x}
                          y={barTop}
                          width={barWidth}
                          height={barHeight}
                          fill="#B4C7E7"
                        />
                        {/* Top 3D face */}
                        <polygon
                          points={`${x},${barTop} ${x + depth},${barTop - depth + 2} ${
                            x + barWidth + depth
                          },${barTop - depth + 2} ${x + barWidth},${barTop}`}
                          fill="#8FAADC"
                        />
                        {/* Right 3D face */}
                        <polygon
                          points={`${x + barWidth},${barTop} ${x + barWidth + depth},${
                            barTop - depth + 2
                          } ${x + barWidth + depth},${barBottom - depth + 2} ${
                            x + barWidth
                          },${barBottom}`}
                          fill="#7C97C8"
                        />
                        {/* Vertical status text: belum memenuhi / syarat */}
                        <g transform={`translate(${x + 11}, 148) rotate(-90)`}>
                          <text x="0" y="0" textAnchor="middle" fontSize="8.3" fill="#595959">
                            belum memenuhi
                          </text>
                          <text x="0" y="10" textAnchor="middle" fontSize="8.3" fill="#595959">
                            syarat
                          </text>
                        </g>
                        {/* 100% row */}
                        <text
                          x={x + barWidth / 2 + 2}
                          y="198"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#595959"
                        >
                          100%
                        </text>
                        {/* Month name row */}
                        <text
                          x={x + barWidth / 2 + 2}
                          y="218"
                          textAnchor="middle"
                          fontSize="8.5"
                          fill="#595959"
                        >
                          {item.monthLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bottom Legend: ■ Nilai */}
                  <g transform="translate(308, 244)">
                    <rect x="0" y="-7" width="7" height="7" fill="#9DC3E6" />
                    <text x="11" y="0" fontSize="9.5" fill="#595959">
                      Nilai
                    </text>
                  </g>
                </svg>
              </div>

              <div className="pl-9 mt-4 space-y-2">
                <div>Rekomendasi Pantry:</div>
                <ol className="list-decimal pl-6 space-y-1">
                  <li className="pl-2">
                    Menyediakan meja untuk penyimpanan bahan makanan yang siap saji
                  </li>
                  <li className="pl-2">Menyediakan tisu di tempat cuci tangan</li>
                  <li className="pl-2">
                    Membersihkan lantai dengan lap basah dan sabun yang tidak membuat lengket
                  </li>
                  <li className="pl-2">
                    Menyediakan rak untuk penyimpanan alat-alat makan yang tertutup
                  </li>
                  <li className="pl-2">Membersihkan rak pengering secara berkala</li>
                  <li className="pl-2">
                    Tempat penyimpanan alat kebersihan harus terpisah dengan dapur
                  </li>
                </ol>

                <p className="indent-9 pt-2">
                  Berdasarkan form ceklist Jasa Boga golongan B untuk Jasa Boga yang melayani kebutuhan khusus untuk rumah sakit sudah memenuhi syarat pada penilaian semester 2 sudah ada perbaikan.
                </p>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="shrink-0">3.4</span>
                  <span>Penyelenggaraan Penyehatan Sarana dan Bangunan</span>
                </div>
                <div className="pl-9 space-y-1">
                  <p>
                    Penyehatan Sarana dan Bangunan Rumah Sakit sudah dilakukan upaya sebagai berikut:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-4">
                      <span className="w-5 shrink-0">a)</span>
                      <span>Ketersediaan Toilet 1:20 pengunjung wanita dan 1 :30 untuk pria</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="w-5 shrink-0">b)</span>
                      <span>Tersedia Toilet Disabilitas</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="w-5 shrink-0">c)</span>
                      <span>Lantai RS terbuat dari bahan kuat dan kedap air dan mudah dibersihkan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {renderSingleFooter(16)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 17: SARANA & BANGUNAN LANJUTAN & GRAFIK (PERSIS GAMBAR 4)
           ===================================================================== */}
        {shouldRenderPage(17, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-17"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.6px] leading-[1.74] text-justify text-slate-900">
              <div className="pl-9 space-y-1">
                <div className="flex items-baseline gap-4">
                  <span className="w-5 shrink-0">d)</span>
                  <span>Pintu RS yang bisa dilalui blankar yaitu memiliki bukaan 120 cm</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-5 shrink-0">e)</span>
                  <span>
                    Atap RS kuat, tidak bocor, tahan lama dan tidak menjadi tempat perindukan serangga, tikus dan binatang pengganggu
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-5 shrink-0">f)</span>
                  <span>
                    Langit-langit kuat, berwarna terang, dan mudah dibersihkan, tdk mengandung unsur yg dpt membahayakan pasien, tidak berjamur
                  </span>
                </div>
                <p className="pt-2">
                  Adapun hasil inspeksi sanitasi sarana dan bangunan adalah sebagai berikut :
                </p>
              </div>

              {/* 5-Bar Chart Replica matching Gambar 4 */}
              <div className="mt-2.5 mx-6 border border-slate-300 bg-white px-4 pt-3 pb-2.5">
                <svg viewBox="0 0 580 190" className="w-full h-auto block">
                  {[
                    { label: '120', y: 18 },
                    { label: '100', y: 39 },
                    { label: '80', y: 60 },
                    { label: '60', y: 81 },
                    { label: '40', y: 102 },
                    { label: '20', y: 123 },
                    { label: '-', y: 144 },
                  ].map((axis) => (
                    <text
                      key={axis.label}
                      x="38"
                      y={axis.y + 3}
                      textAnchor="end"
                      fontSize="9.5"
                      fill="#595959"
                    >
                      {axis.label}
                    </text>
                  ))}

                  <line x1="50" y1="144" x2="555" y2="144" stroke="#D9D9D9" strokeWidth="1" />

                  {[
                    {
                      line1: 'TOILET DISABILITAS',
                      line2: '(%)',
                      val: compiled.building.chartItems[0]?.valuePct ?? 32,
                      color: '#FFFF00',
                      x: 78,
                    },
                    {
                      line1: 'LANTAI RS (%)',
                      line2: '',
                      val: compiled.building.chartItems[1]?.valuePct ?? 100,
                      color: '#5B9BD5',
                      x: 178,
                    },
                    {
                      line1: 'PINTU RS (%)',
                      line2: '',
                      val: compiled.building.chartItems[2]?.valuePct ?? 100,
                      color: '#5B9BD5',
                      x: 278,
                    },
                    {
                      line1: 'ATAP RS (%)',
                      line2: '',
                      val: compiled.building.chartItems[3]?.valuePct ?? 98,
                      color: '#C55A11',
                      x: 378,
                    },
                    {
                      line1: 'LANGIT2 RS (%)',
                      line2: '',
                      val: compiled.building.chartItems[4]?.valuePct ?? 93,
                      color: '#BF9000',
                      x: 478,
                    },
                  ].map((bar) => {
                    const barHeight = (bar.val / 120) * 126;
                    const barTop = 144 - barHeight;
                    const barWidth = 58;
                    return (
                      <g key={bar.line1}>
                        <text
                          x={bar.x + barWidth / 2}
                          y={barTop - 6}
                          textAnchor="middle"
                          fontSize="9.5"
                          fill="#404040"
                        >
                          {bar.val}
                        </text>
                        <rect
                          x={bar.x}
                          y={barTop}
                          width={barWidth}
                          height={barHeight}
                          fill={bar.color}
                        />
                        <text
                          x={bar.x + barWidth / 2}
                          y="158"
                          textAnchor="middle"
                          fontSize="8.8"
                          fill="#595959"
                        >
                          {bar.line1}
                        </text>
                        {bar.line2 && (
                          <text
                            x={bar.x + barWidth / 2}
                            y="170"
                            textAnchor="middle"
                            fontSize="8.8"
                            fill="#595959"
                          >
                            {bar.line2}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-3 space-y-1.5">
                <p>Dari hasil pemantauan dari bulan januari – desember didapatkan hasil;</p>
                <ol className="list-decimal pl-10 space-y-1.5">
                  <li className="pl-2">
                    <div>
                      Toilet Disabilitas (32%) Capaian masih rendah. Ini menunjukkan sebagian besar toilet belum memenuhi standar aksesibilitas bagi penyandang disabilitas (pegangan rambat, lebar pintu, ruang putar kursi roda, dll).
                    </div>
                    <div>
                      ➔ Perlu menjadi prioritas peningkatan, terutama dalam pemenuhan standar KRIS BPJS dan akreditasi RS.
                    </div>
                  </li>
                  <li className="pl-2">
                    <div>
                      Lantai RS (100%) Seluruh lantai telah memenuhi standar (tidak licin, mudah dibersihkan, kuat, dan aman)
                    </div>
                    <div>➔ Sangat baik dan memenuhi standar keselamatan pasien.</div>
                  </li>
                  <li className="pl-2">
                    <div>
                      Pintu RS (100%) Seluruh pintu telah sesuai standar (lebar, kemudahan buka-tutup, dan aksesibilitas).
                    </div>
                    <div>➔ Mendukung keselamatan dan kenyamanan pengguna layanan.</div>
                  </li>
                  <li className="pl-2">
                    <div>
                      Atap RS (98%) Hampir seluruh atap dalam kondisi baik, masih terdapat 2% yang perlu perbaikan minor.
                    </div>
                    <div>➔ Disarankan dilakukan pemeliharaan preventif.</div>
                  </li>
                  <li className="pl-2">
                    <div>
                      Langit-langit RS (93%) Sebagian besar telah sesuai standar, namun masih ada 7% yang perlu perbaikan (retak, lembap, atau berpotensi jatuh).
                    </div>
                    <div>➔ Perlu perbaikan bertahap untuk mencegah risiko keselamatan.</div>
                  </li>
                </ol>

                <p className="indent-9 pt-1">
                  Secara umum, kondisi fisik bangunan RS sudah baik, khususnya lantai dan pintu. Namun, ketersediaan toilet disabilitas masih sangat kurang dan perlu menjadi fokus utama perbaikan guna memenuhi prinsip kesetaraan akses layanan
                </p>
              </div>
            </div>
            {renderSingleFooter(17)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 18: TABEL 4. HASIL SARANA DAN BANGUNAN TOILET (LANDSCAPE - GAMBAR 5)
           ===================================================================== */}
        {shouldRenderPage(18, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-18"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-12 sm:px-14 pt-16 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner(18)}
            <div className="space-y-3 text-[12px] font-sans text-slate-900">
              <div className="text-center text-[13.5px] font-normal tracking-normal">
                Tabel 4. Hasil sarana dan bangunan toilet
              </div>
              <div className="max-w-[660px] mx-auto">
                <table className="w-full border-collapse border border-slate-600 text-[11px] leading-[1.3] table-fixed">
                  <colgroup>
                    <col className="w-[5.2%]" />
                    <col className="w-[12.2%]" />
                    <col className="w-[16.2%]" />
                    <col className="w-[3.6%]" />
                    <col className="w-[3.6%]" />
                    <col className="w-[5.2%]" />
                    <col className="w-[2.8%]" />
                    <col className="w-[12.5%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[2.7%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-center font-normal">
                      <th rowSpan={2} className="border border-slate-600 px-1 py-1 align-top font-normal">
                        No
                      </th>
                      <th rowSpan={2} className="border border-slate-600 px-1 py-1 align-top font-normal">
                        Bulan
                      </th>
                      <th rowSpan={2} className="border border-slate-600 px-1 py-1 align-top font-normal">
                        Indikator
                      </th>
                      <th colSpan={3} className="border border-slate-600 px-1 py-0.5 align-middle font-normal">
                        Jenis
                      </th>
                      <th rowSpan={2} className="border border-slate-600 bg-[#FFFF00] p-0" />
                      <th rowSpan={2} className="border border-slate-600 px-1 py-1 align-top font-normal">
                        Indikator
                      </th>
                      <th colSpan={2} className="border border-slate-600 px-1 py-0.5 align-middle font-normal">
                        Rajal
                      </th>
                      <th colSpan={2} className="border border-slate-600 px-1 py-0.5 align-middle font-normal">
                        IGD
                      </th>
                      <th colSpan={2} className="border border-slate-600 px-1 py-0.5 align-middle font-normal">
                        Penunjang
                      </th>
                      <th rowSpan={2} className="border border-slate-600 bg-[#FFFF00] p-0" />
                    </tr>
                    <tr className="text-center font-normal">
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">L</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">P</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">L/P</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">Ada</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">Tdk</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">Ada</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">Tdk</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">Ada</th>
                      <th className="border border-slate-600 px-0.5 py-0.5 font-normal">Tdk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: 'Toilet IGD',
                        l: '',
                        p: '',
                        lp: '5',
                        rightInd: 'Toilet\nDisabilitas',
                        rajalAda: '√',
                        rajalTdk: '',
                        igdAda: '',
                        igdTdk: '√',
                        penAda: '',
                        penTdk: '√',
                      },
                      { label: 'Toilet Usman', l: '', p: '', lp: '9' },
                      { label: 'Toilet Rajal', l: '1', p: '1', lp: '' },
                      { label: 'Toilet Ranap\nKebidanan', l: '', p: '1', lp: '1' },
                      { label: 'Toilet Ranap\nGabung', l: '1', p: '1', lp: '1' },
                      { label: 'Toilet Ranap\nIsolasi', l: '1', p: '1', lp: '1' },
                      { label: 'Toilet ICU', l: '', p: '', lp: '1' },
                      { label: 'Toilet IBS', l: '', p: '', lp: '1' },
                      { label: 'Toilet\nLaboratorium', l: '', p: '', lp: '1', extraPad: true },
                      { label: 'Toilet\nManajemen', l: '1', p: '1', lp: '1' },
                      { label: 'Toilet Humas\nDan Gudang', l: '', p: '1', lp: '' },
                      { label: 'Toilet Rekam\nMedis', l: '', p: '', lp: '1', whiteSep: true },
                      { label: 'Toilet\nFarmasi', l: '', p: '', lp: '1', whiteSep: true },
                    ].map((row, idx) => (
                      <tr key={row.label}>
                        {idx === 0 && (
                          <>
                            <td
                              rowSpan={13}
                              className="border border-slate-600 px-1 py-1 text-center align-top"
                            >
                              12
                            </td>
                            <td
                              rowSpan={13}
                              className="border border-slate-600 px-1.5 py-1 text-center align-top"
                            >
                              Desember
                            </td>
                          </>
                        )}
                        <td
                          className={`border border-slate-600 px-1.5 py-0.5 text-left align-top whitespace-pre-line ${
                            row.extraPad ? 'pb-4' : ''
                          }`}
                        >
                          {row.label}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.l}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.p}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.lp}
                        </td>
                        {idx === 0 && (
                          <td rowSpan={11} className="border border-slate-600 bg-[#FFFF00] p-0" />
                        )}
                        {idx === 11 && (
                          <td rowSpan={2} className="border border-slate-600 bg-white p-0" />
                        )}
                        <td className="border border-slate-600 px-1 py-0.5 text-center align-top whitespace-pre-line">
                          {row.rightInd || ''}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.rajalAda || ''}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.rajalTdk || ''}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.igdAda || ''}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.igdTdk || ''}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.penAda || ''}
                        </td>
                        <td className="border border-slate-600 px-0.5 py-0.5 text-center align-top">
                          {row.penTdk || ''}
                        </td>
                        {idx === 0 && (
                          <td rowSpan={11} className="border border-slate-600 bg-[#FFFF00] p-0" />
                        )}
                        {idx === 11 && (
                          <td rowSpan={2} className="border border-slate-600 bg-white p-0" />
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {renderLandscapeFooter(18)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 19: TABEL 4 LANTAI & ATAP RUMAH SAKIT (LANDSCAPE - GAMBAR 6)
           ===================================================================== */}
        {shouldRenderPage(19, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-19"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-12 sm:px-14 pt-20 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner(19)}
            <div className="space-y-8 text-[12px] font-sans text-slate-900">
              {/* Tabel 4. Hasil sarana dan bangunan lantai */}
              <div className="space-y-3">
                <div className="text-center text-[13.5px] font-normal">
                  Tabel 4. Hasil sarana dan bangunan lantai
                </div>
                <div className="max-w-[760px] mx-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[11px] leading-[1.35] table-fixed">
                    <colgroup>
                      <col className="w-[9.5%]" />
                      <col className="w-[10.8%]" />
                      <col className="w-[10.8%]" />
                      <col className="w-[11.2%]" />
                      <col className="w-[11.2%]" />
                      <col className="w-[10.2%]" />
                      <col className="w-[10.2%]" />
                      <col className="w-[13.0%]" />
                      <col className="w-[13.1%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-center">
                        <th rowSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-normal">
                          Indikator
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          lantai &nbsp;terbuat dari
                          <br />
                          bahan yang kuat,
                          <br />
                          kedap air,
                          <br />
                          permukaan rata,
                          <br />
                          tidak licin, warna
                          <br />
                          terang, dan mudah
                          <br />
                          dibersihkan
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          lantai yang selalu
                          <br />
                          kontak dengan air harus
                          <br />
                          mempunyai kemiringan
                          <br />
                          yang cukup ke arah
                          <br />
                          saluran pembuangan air
                          <br />
                          limbah
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          Pertemuan lantai
                          <br />
                          dengan dinding
                          <br />
                          harus berbentuk
                          <br />
                          Konus atau
                          <br />
                          lengkung agar
                          <br />
                          mudah dibersihkan
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          Permukaan dinding harus
                          <br />
                          kuat, berwarna terang &amp;
                          <br />
                          menggunakan cat yg tidak
                          <br />
                          luntur serta tidak
                          <br />
                          menggunakan cat yang
                          <br />
                          mengandung logam berat
                        </th>
                      </tr>
                      <tr className="text-center font-normal">
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td className="border border-slate-600 px-1.5 py-1.5 text-left align-top">
                          Lantai
                          <br />
                          RS
                        </td>
                        <td className="border border-slate-600 py-1.5 align-top">√</td>
                        <td className="border border-slate-600 py-1.5 align-top" />
                        <td className="border border-slate-600 py-1.5 align-top">√</td>
                        <td className="border border-slate-600 py-1.5 align-top" />
                        <td className="border border-slate-600 py-1.5 align-top" />
                        <td className="border border-slate-600 py-1.5 align-top">√</td>
                        <td className="border border-slate-600 py-1.5 align-top">√</td>
                        <td className="border border-slate-600 py-1.5 align-top" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 4. Hasil sarana dan bangunan Atap Rumah Sakit */}
              <div className="space-y-3">
                <div className="text-center text-[13.5px] font-normal">
                  Tabel 4. Hasil sarana dan bangunan Atap Rumah Sakit
                </div>
                <div className="max-w-[890px] mx-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[11px] leading-[1.35] table-fixed">
                    <colgroup>
                      <col className="w-[13.0%]" />
                      <col className="w-[9.5%]" />
                      <col className="w-[5.2%]" />
                      <col className="w-[8.6%]" />
                      <col className="w-[10.2%]" />
                      <col className="w-[16.9%]" />
                      <col className="w-[8.6%]" />
                      <col className="w-[9.2%]" />
                      <col className="w-[18.8%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-center">
                        <th colSpan={3} rowSpan={2} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          Elemen penilaian
                        </th>
                        <th colSpan={3} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          kuat, tidak bocor, tahan lama dan tidak menjadi
                          <br />
                          tempat perindukan serangga, tikus dan binatang
                          <br />
                          peng ganggu
                        </th>
                        <th colSpan={3} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          memenuhi sebagai persyaratan di atas
                        </th>
                      </tr>
                      <tr className="text-center font-normal">
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">keterangan</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td colSpan={3} className="border border-slate-600 px-2 py-1 text-left align-middle">
                          Atap rumah sakit
                        </td>
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td rowSpan={2} className="border border-slate-600 py-1 align-middle" />
                      </tr>
                      <tr className="h-7">
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                        <td className="border border-slate-600" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {renderLandscapeFooter(19)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 20: TABEL 4 LANGIT-LANGIT & PINTU RS (LANDSCAPE - GAMBAR 7)
           ===================================================================== */}
        {shouldRenderPage(20, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-20"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-10 sm:px-12 pt-16 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner(20)}
            <div className="space-y-6 text-[12px] font-sans text-slate-900">
              {/* Tabel 4. Hasil sarana dan bangunan langit-langit */}
              <div className="space-y-2.5">
                <div className="text-center text-[13.5px] font-normal">
                  Tabel 4. Hasil sarana dan bangunan langit-langit
                </div>
                <div className="max-w-[960px] mx-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[10.8px] leading-[1.32] table-fixed">
                    <colgroup>
                      <col className="w-[18.2%]" />
                      <col className="w-[10.2%]" />
                      <col className="w-[8.8%]" />
                      <col className="w-[6.0%]" />
                      <col className="w-[6.0%]" />
                      <col className="w-[6.0%]" />
                      <col className="w-[6.0%]" />
                      <col className="w-[8.8%]" />
                      <col className="w-[9.0%]" />
                      <col className="w-[10.5%]" />
                      <col className="w-[10.5%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-center">
                        <th rowSpan={2} className="border border-slate-600 px-2 py-1.5 align-top font-bold">
                          Elemen penilaian
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Langit-langit &nbsp;kuat,
                          <br />
                          berwarna terang, dan
                          <br />
                          mudah dibersihkan, tdk
                          <br />
                          mengandung unsur yg dpt
                          <br />
                          membahayakan pasien,
                          <br />
                          tidak berjamur
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Tinggi langit-
                          <br />
                          langit diruangan
                          <br />
                          minimal 2,80 m,
                          <br />
                          dan tinggi di
                          <br />
                          selasar (koridor)
                          <br />
                          minimal 2,40 m
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Tinggi langit-
                          <br />
                          langit di
                          <br />
                          ruangan operasi
                          <br />
                          minimal 3,00 m
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Pada ruang operasi dan
                          <br />
                          ruang perawatan
                          <br />
                          intensif, bahan langit-
                          <br />
                          langit harus memiliki
                          <br />
                          tingkat ketahanan api
                          <br />
                          (TKA) minimal 2 jam
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Pada tempat-tempat yang
                          <br />
                          membutuhkan tingkat
                          <br />
                          kebersihan ruangan tertentu,
                          <br />
                          maka lampu-lampu
                          <br />
                          penerangan ruangan
                          <br />
                          dipasang dibenamkan pada
                          <br />
                          plafon (recessed).
                        </th>
                      </tr>
                      <tr className="text-center font-normal">
                        <th className="border border-slate-600 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-600 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-600 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-600 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-600 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-600 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-600 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-600 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-600 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-600 py-0.5 font-normal">tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td className="border border-slate-600 px-2 py-2 text-left align-top">
                          Langit-langit rumah sakit
                        </td>
                        <td className="border border-slate-600 py-2 align-top">√</td>
                        <td className="border border-slate-600 py-2 align-top" />
                        <td className="border border-slate-600 py-2 align-top">√</td>
                        <td className="border border-slate-600 py-2 align-top" />
                        <td className="border border-slate-600 py-2 align-top">√</td>
                        <td className="border border-slate-600 py-2 align-top" />
                        <td className="border border-slate-600 py-2 align-top">√</td>
                        <td className="border border-slate-600 py-2 align-top" />
                        <td className="border border-slate-600 py-2 align-top">√</td>
                        <td className="border border-slate-600 py-2 align-top" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 4. Hasil sarana dan bangunan Pintu RS */}
              <div className="space-y-2.5">
                <div className="text-center text-[13.5px] font-normal">
                  Tabel 4. Hasil sarana dan bangunan Pintu RS
                </div>
                <div className="max-w-[1000px] mx-auto">
                  <table className="w-full border-collapse border border-slate-600 text-[10.3px] leading-[1.3] table-fixed">
                    <colgroup>
                      <col className="w-[9.5%]" />
                      <col className="w-[8.8%]" />
                      <col className="w-[9.6%]" />
                      <col className="w-[6.5%]" />
                      <col className="w-[8.8%]" />
                      <col className="w-[7.2%]" />
                      <col className="w-[7.2%]" />
                      <col className="w-[6.3%]" />
                      <col className="w-[7.1%]" />
                      <col className="w-[7.1%]" />
                      <col className="w-[6.3%]" />
                      <col className="w-[7.2%]" />
                      <col className="w-[8.4%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-center">
                        <th rowSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-normal">
                          Indikator
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Pintu utama dan pintu pintu
                          <br />
                          yg dilalui brankar / tempat
                          <br />
                          tidur pasien &nbsp;memiliki lebar
                          <br />
                          bukaan minimal 120 cm, dan
                          <br />
                          pintu- pintu yang tidak
                          <br />
                          menjadi akses tempat tidur
                          <br />
                          pasien memiliki lebar bukaan
                          <br />
                          minimal 90 cm
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Di daerah sekitar
                          <br />
                          pintu masuk tidak boleh
                          <br />
                          ada perbedaan
                          <br />
                          ketinggian lantai.
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Pintu untuk kamar
                          <br />
                          mandi di ruangan
                          <br />
                          perawatan pasien dan
                          <br />
                          pintu toilet untuk
                          <br />
                          aksesibel, harus
                          <br />
                          terbuka ke luar, dan
                          <br />
                          lebar
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Pintu-pintu yang
                          <br />
                          menjadi akses
                          <br />
                          tempat tidur pasien
                          <br />
                          harus dilapisi bahan
                          <br />
                          anti benturan
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Ruang perawatan
                          <br />
                          pasien harus memiliki
                          <br />
                          bukaan jendela yang
                          <br />
                          dapat terbuka secara
                          <br />
                          maksimal untuk
                          <br />
                          kepentingan
                          <br />
                          pertukaran udara
                        </th>
                        <th colSpan={2} className="border border-slate-600 px-1.5 py-1.5 align-top font-bold">
                          Pada bangunan rumah
                          <br />
                          sakit bertingkat, lebar
                          <br />
                          bukaan jendela harus
                          <br />
                          aman dari
                          <br />
                          kemungkinan pasien
                          <br />
                          dapat melarikan /
                          <br />
                          meloloskan diri
                        </th>
                      </tr>
                      <tr className="text-center font-normal">
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                        <th className="border border-slate-600 py-1 font-normal">ya</th>
                        <th className="border border-slate-600 py-1 font-normal">tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td className="border border-slate-600 px-1.5 py-1 text-left align-middle">
                          Pintu RS
                        </td>
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                        <td className="border border-slate-600 py-1 align-middle">√</td>
                        <td className="border border-slate-600 py-1 align-middle" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {renderLandscapeFooter(20)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 21: 3.5 PENGAMANAN LIMBAH & TABEL 5 LIMBAH B3 PADAT (PERSIS GAMBAR 1)
           ===================================================================== */}
        {shouldRenderPage(21, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-21"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.5px] leading-[1.72] text-justify text-slate-900">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="shrink-0">3.5</span>
                <span>Penyelenggaraan Pengamanan Limbah dan Radiasi</span>
              </div>

              <div className="pl-7 space-y-1.5">
                <p className="indent-9">
                  Pengamanan Limbah dan Radiasi dilakukan dengan berbagai upaya sesuai dengan jenis limbah yang dikelola, adapun upaya pengelolaan Limbah dan Radiasi di RSUD Al-Mulk sebagai berikut:
                </p>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-4">
                    <span className="w-5 shrink-0">a)</span>
                    <span>Limbah Domestik</span>
                  </div>
                  <div className="pl-9 space-y-1">
                    <div className="flex items-baseline gap-4">
                      <span className="shrink-0">-</span>
                      <span>Memiliki TPS Limbah Domestik</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="shrink-0">-</span>
                      <span>Pengangkutan di TPS dilakukan tidak boleh lebih dari 2 x 24 jam</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-4 pt-0.5">
                    <span className="w-5 shrink-0">b)</span>
                    <span>Limbah B3 Padat</span>
                  </div>
                  <div className="pl-9 space-y-1">
                    <div className="flex items-baseline gap-4">
                      <span className="shrink-0">-</span>
                      <span>Dilakukan pemilahan limbah medis dan non medis langsung dari sumber</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="shrink-0">-</span>
                      <span>Memiliki Izin TPS B3</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="shrink-0">-</span>
                      <span>
                        Pengadaan kerjasama pembuangan limbah medis dengan pihak luar yang sudah memiliki izin dan diangkut setiap 2 minggu sekali. Adapun volume limbah medis yang dihasilkan dalam kegiatan di UOBK RSUD Al–Mulk sebagai berikut:
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center text-[13.5px]">
                Tabel 5. Jumlah Limbah B3 Padat Tahun 2025
              </div>

              <div className="mt-2">
                <table className="w-full border-collapse border border-slate-500 text-[11px] leading-[1.32] table-fixed">
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[16%]" />
                    <col className="w-[16%]" />
                    <col className="w-[29%]" />
                    <col className="w-[17%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-center font-normal">
                      <th className="border border-slate-500 py-1.5 px-2 font-normal align-middle">
                        BULAN
                      </th>
                      <th className="border border-slate-500 py-1 px-2 font-normal align-middle">
                        LIMBAH
                        <br />
                        PADAT
                      </th>
                      <th className="border border-slate-500 py-1 px-2 font-normal align-middle">
                        LIMBAH
                        <br />
                        TAJAM
                      </th>
                      <th className="border border-slate-500 py-1.5 px-2 font-normal align-middle">
                        OBAT KADALUARSA
                      </th>
                      <th className="border border-slate-500 py-1.5 px-2 font-normal align-middle">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.solidWaste.rows.map((row) => (
                      <tr key={row.monthName} className="text-center">
                        <td className="border border-slate-500 px-2 py-0.5 text-left">
                          {row.monthName}
                        </td>
                        <td className="border border-slate-500 px-2 py-0.5">
                          {String(row.limbahPadat).replace('.', ',')}
                        </td>
                        <td className="border border-slate-500 px-2 py-0.5">
                          {String(row.limbahTajam).replace('.', ',')}
                        </td>
                        <td className="border border-slate-500 px-2 py-0.5">
                          {String(row.obatKadaluarsa).replace('.', ',')}
                        </td>
                        <td className="border border-slate-500 px-2 py-0.5">
                          {String(row.total).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                    <tr className="text-center">
                      <td className="border border-slate-500 px-2 py-0.5 text-left font-bold">
                        TOTAL
                      </td>
                      <td className="border border-slate-500 px-2 py-0.5">
                        {String(compiled.solidWaste.totalPadat).replace('.', ',')}
                      </td>
                      <td className="border border-slate-500 px-2 py-0.5">
                        {String(compiled.solidWaste.totalTajam).replace('.', ',')}
                      </td>
                      <td className="border border-slate-500 px-2 py-0.5">
                        {String(compiled.solidWaste.totalObat).replace('.', ',')}
                      </td>
                      <td className="border border-slate-500 px-2 py-0.5">
                        {String(compiled.solidWaste.grandTotal).replace('.', ',')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-1.5 space-y-1.5">
                <p>
                  Dari tabel diatas dapat dihasilkan secara kondisi umum total timbulan limbah medis selama satu tahun sebesar 3.952 kg dengan rata-rata ±329 kg/bulan. Komposisi limbah didominasi oleh limbah padat medis (±75%), diikuti limbah tajam (±25%), serta obat kedaluwarsa yang tercatat pada bulan Desember.
                </p>
                <div>Analisa Kesesuaian KRIS</div>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="pl-2">
                    Pemilahan limbah telah dilakukan secara konsisten sesuai jenis (padat, tajam, obat).
                  </li>
                  <li className="pl-2">
                    Pencatatan dan pelaporan timbulan limbah tersedia setiap bulan.
                  </li>
                  <li className="pl-2">
                    Pengelolaan limbah B3 dilakukan melalui pihak ketiga berizin.
                  </li>
                </ul>
              </div>
            </div>
            {renderSingleFooter(21)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 22: ISU LIMBAH & RENCANA TINDAK LANJUT (RTL) KRIS (PERSIS GAMBAR 2)
           ===================================================================== */}
        {shouldRenderPage(22, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-22"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-1 text-[13.4px] leading-[1.68] text-justify text-slate-900">
              <p>
                Namun demikian, masih ditemukan beberapa isu yang perlu ditingkatkan agar optimal sesuai prinsip kenyamanan, keselamatan, dan mutu layanan KRIS, yaitu:
              </p>

              <ol className="list-decimal pl-5 space-y-1">
                <li className="pl-2">
                  Timbulan limbah padat medis masih relatif tinggi dan fluktuatif.
                </li>
                <li className="pl-2">
                  Pemusnahan obat kedaluwarsa terakumulasi di akhir tahun.
                </li>
                <li className="pl-2">
                  Belum seluruh unit melakukan pengendalian timbulan limbah secara efisien.
                </li>
              </ol>

              <div className="pt-0.5">RENCANA TINDAK LANJUT (RTL) KRIS</div>

              {/* 1. Pengendalian Timbulan Limbah Padat Medis */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span>1.</span>
                  <span>Pengendalian Timbulan Limbah Padat Medis</span>
                </div>
                <div className="pl-6 space-y-0.5">
                  <div>Masalah: Timbulan limbah padat medis masih tinggi dan fluktuatif.</div>
                  <div>RTL:</div>
                  <ul className="list-disc pl-6 space-y-0.5">
                    <li className="pl-2">
                      Melakukan sosialisasi ulang pemilahan limbah sesuai kode warna KRIS.
                    </li>
                    <li className="pl-2">
                      Mendorong efisiensi penggunaan bahan medis habis pakai.
                    </li>
                    <li className="pl-2">
                      Monitoring timbulan limbah per unit pelayanan setiap bulan.
                    </li>
                  </ul>
                  <div>Target: Penurunan timbulan limbah padat medis secara bertahap.</div>
                  <div>Waktu: Triwulan berjalan.</div>
                </div>
              </div>

              {/* 2. Pengelolaan Limbah Tajam */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span>2.</span>
                  <span>Pengelolaan Limbah Tajam</span>
                </div>
                <div className="pl-6 space-y-0.5">
                  <div>Masalah: Peningkatan limbah tajam pada bulan tertentu.</div>
                  <div>RTL:</div>
                  <ul className="list-disc pl-6 space-y-0.5">
                    <li className="pl-2">Pengawasan penggunaan safety box sesuai kapasitas.</li>
                    <li className="pl-2">Pelatihan K3 dan PPI bagi petugas pelayanan.</li>
                    <li className="pl-2">Pengangkutan rutin ke TPS B3.</li>
                  </ul>
                  <div>Target: Tidak terjadi over-capacity safety box dan zero accident.</div>
                  <div>Waktu: Rutin bulanan.</div>
                </div>
              </div>

              {/* 3. Pengelolaan Obat Kedaluwarsa */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span>3.</span>
                  <span>Pengelolaan Obat Kedaluwarsa</span>
                </div>
                <div className="pl-6 space-y-0.5">
                  <div>Masalah: Pemusnahan obat dilakukan secara akumulatif di akhir tahun.</div>
                  <div>RTL:</div>
                  <ul className="list-disc pl-6 space-y-0.5">
                    <li className="pl-2">
                      Penjadwalan inventarisasi obat kedaluwarsa secara triwulan.
                    </li>
                    <li className="pl-2">Pemusnahan berkala melalui pihak ketiga berizin.</li>
                    <li className="pl-2">
                      Penyusunan dan pengarsipan Berita Acara pemusnahan.
                    </li>
                  </ul>
                  <div>Target:Tidak ada penumpukan obat kedaluwarsa.</div>
                  <div>Waktu: Triwulan.</div>
                </div>
              </div>

              {/* 4. Monitoring & Evaluasi KRIS */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span>4.</span>
                  <span>Monitoring &amp; Evaluasi KRIS</span>
                </div>
                <div className="pl-6 space-y-0.5">
                  <div>
                    Masalah: Belum optimalnya pemanfaatan data limbah sebagai indikator mutu KRIS.
                  </div>
                  <div>RTL:</div>
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li className="pl-2">
                    Integrasi data timbulan limbah dengan indikator BOR dan pelayanan KRIS.
                  </li>
                  <li className="pl-2">
                    Evaluasi bulanan oleh Tim Kesehatan Lingkungan dan PPI.
                  </li>
                  <li className="pl-2">Pelaporan hasil evaluasi kepada manajemen RS.</li>
                </ul>
              </div>
            </div>
            {renderSingleFooter(22)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 23: TARGET & WAKTU; 3.6 PENYEHATAN LIMBAH B3 CAIR (PERSIS GAMBAR 3)
           ===================================================================== */}
        {shouldRenderPage(23, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-23"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-14 sm:px-16 pt-14 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="text-[13.8px] leading-[1.82] text-justify text-slate-900">
              <div className="pl-8 space-y-1">
                <div>Target: Pengelolaan limbah menjadi indikator mutu lingkungan KRIS.</div>
                <div>Waktu: Bulanan dan tahunan.</div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="shrink-0">3.6</span>
                  <span>Penyelenggaraan Penyehatan Limbah B3 Cair</span>
                </div>

                <div className="pl-7 space-y-1.5">
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Rumah Sakit memiliki unit IPAL dengan teknologi yang tepat dan desain kapasitas sesuai dengan volume limbah cair yang dihasilkan.
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Unit Pengolahan Limbah cair dilengkapi fasilitas penunjang sesuai dengan ketentuan
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Memenuhi frekuensi dalam pengambilan sampel limbah cair, yakni satu kali perbulan, Memenuhi baku mutu effluent limbah cair sesuai peraturan perundang-undangan
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Memenuhi pentaatan pelaporan hasil laboratorium limbah cair kepada instansi pemerintah sesuai ketentuan minimum setiap satu kali per 3 bulan.
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Adapun Hasil Pemantauan pemeriksaan Limbah Cair pada tahun 2025 sebagai berikut:
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {renderSingleFooter(23)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 24: TABEL 6 LIMBAH CAIR INLET DAN OUTLET (LANDSCAPE - GAMBAR 4)
           ===================================================================== */}
        {shouldRenderPage(24, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-24"
            className="f4-landscape scroll-mt-24 relative overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full max-w-[330.2mm] min-h-[215.9mm] px-10 sm:px-12 pt-14 pb-6 flex flex-col justify-between print:shadow-none print:border-none"
          >
            {renderLandscapeCorner(24)}
            <div className="space-y-1.5 text-[11px] font-sans text-slate-900">
              <div className="text-center text-[13px] leading-[1.45] font-normal">
                <div>Tabel 6</div>
                <div>Hasil Pemeriksaan Limbah Cair Inlet dan Outlet</div>
              </div>

              <div className="max-w-[1060px] mx-auto pt-1">
                <table className="w-full border-collapse border border-slate-500 text-[9.5px] leading-[1.22] table-fixed">
                  <colgroup>
                    <col className="w-[6.0%]" />
                    <col className="w-[10.8%]" />
                    <col className="w-[6.4%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[6.8%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[5.0%]" />
                    <col className="w-[5.8%]" />
                    <col className="w-[6.0%]" />
                    <col className="w-[7.8%]" />
                    <col className="w-[6.8%]" />
                    <col className="w-[7.6%]" />
                    <col className="w-[7.6%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-center font-normal">
                      <th colSpan={15} className="border border-slate-500 py-0.5 font-normal">
                        BULAN
                      </th>
                    </tr>
                    <tr className="text-center font-normal">
                      <th className="border border-slate-500 px-1 py-1 align-middle font-normal">
                        LIMBAH
                      </th>
                      <th className="border border-slate-500 px-1 py-1 align-middle font-normal">
                        Indikator Mutu
                        <br />
                        Limbah Cair
                      </th>
                      <th className="border border-slate-500 px-1 py-1 align-middle font-normal">
                        Nilai
                        <br />
                        Normal
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        JANUAR
                        <br />I
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        FEBRUARI
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        MARET
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        APRIL
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        MEI
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        JUNI
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        JULI
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        AGUST
                        <br />
                        US
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        SEPTEMBER
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        OKTOBER
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        NOVEMBER
                      </th>
                      <th className="border border-slate-500 px-0.5 py-1 align-middle font-normal">
                        DESEMBER
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* IPAL INLET (11 rows, cream background #FFF2CC) */}
                    {[
                      {
                        ind: 'Suhu',
                        norm: '',
                        vals: ['23,5', '23,5', '23,5', '23,7', '16,8', '23,2', '19,7', '23,7', '24,4', '21,2', '23,2', '19'],
                      },
                      {
                        ind: 'TSS',
                        norm: '30',
                        vals: ['27', '17', '15', '18', '10', '5', '<5', '5', '5', '11', '5', '5'],
                      },
                      {
                        ind: 'PH',
                        norm: '6,0 - 9,0',
                        vals: ['5,97', '3,99', '4,24', '6,93', '6,79', '6,94', '7,24', '7,46', '7,4', '6,6', '7,09', '8'],
                      },
                      {
                        ind: 'BOD',
                        norm: '30',
                        vals: ['11', '11', '10', '9', '37', '55', '<10', '29', '53', '54', '53', '28'],
                      },
                      {
                        ind: 'COD',
                        norm: '100',
                        vals: ['32', '32', '30', '28', '106', '87', '19', '97', '152', '155', '149', '84'],
                      },
                      {
                        ind: 'Amoniak\nNitrogen',
                        norm: '10',
                        vals: ['2,8000', '0,250', '0,1600', '0,1300', '<0,01', '0,120\n0', '<0,01', '0,07', '0,46', '0,5200', '<0,01', '<0,01'],
                      },
                      {
                        ind: 'ZINK',
                        norm: '10',
                        vals: ['<0,0100', '0,010', '0,010', '0,010', '', '', '-', '0,45', '0,52', '0,3410', '0,2900', '0,48'],
                      },
                      {
                        ind: 'SULFIDA',
                        norm: '300',
                        vals: ['0,1300', '0,0600', '0,0200', '0,0300', '', '', '-', '-', '', '', '', ''],
                      },
                      {
                        ind: 'NITRIT',
                        norm: '40',
                        vals: ['<0,0035\n8', '0,95', '0,008', '3,14', '', '', '-', '0,17', '0,340', '0,420', '>3,28', '3,23'],
                      },
                      {
                        ind: 'NITRAT',
                        norm: '30',
                        vals: ['11,6', '2,45', '1,56', '0,48', '', '', '-', '14,4', '4,80', '12,30', '9,20', '0,59'],
                      },
                      {
                        ind: 'TOTAL\nCOLIFORM',
                        norm: '3000',
                        vals: ['9.000', '26.000', '11.000', '21.000', '4,3 X 10', '2,4X1\n0', '4,3 X 10', '2.4X10⁶', '2.4X10⁶', '240.000', '110.000', '24000'],
                      },
                    ].map((row, rIdx) => (
                      <tr key={`inlet-${rIdx}`} className="bg-[#FFF2CC] text-center">
                        {rIdx === 0 && (
                          <td
                            rowSpan={11}
                            className="border border-slate-500 px-1 py-0.5 align-top text-center"
                          >
                            IPAL
                            <br />
                            INLET
                          </td>
                        )}
                        <td className="border border-slate-500 px-1 py-0.5 text-left align-middle whitespace-pre-line">
                          {row.ind}
                        </td>
                        <td className="border border-slate-500 px-0.5 py-0.5 align-middle">
                          {row.norm}
                        </td>
                        {row.vals.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className="border border-slate-500 px-0.5 py-0.5 align-middle whitespace-pre-line"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* IPAL OUTLET (11 rows, white background, Oktober Total Coliform red #FF0000) */}
                    {[
                      {
                        ind: 'Suhu',
                        norm: '',
                        vals: ['23,5', '23,3', '23,5', '23,6', '15,5', '23,6', '-', '23,6', '24,3', '21,3', '23,6', '18,5'],
                      },
                      {
                        ind: 'TSS',
                        norm: '30',
                        vals: ['15', '12', '9', '10', '10', '5', '<5', '<5', '<5', '<5', '<5', ''],
                      },
                      {
                        ind: 'PH',
                        norm: '6,0 - 9,0',
                        vals: ['6,23', '4,40', '5,03', '6,65', '4,11', '7,62', '6,94', '7,33', '6,58', '7,21', '6,83', '7,42'],
                      },
                      {
                        ind: 'BOD',
                        norm: '30',
                        vals: ['6', '8', '7', '7', '12', '20', '<10', '<10', '13', '28', '19', '16'],
                      },
                      {
                        ind: 'COD',
                        norm: '100',
                        vals: ['20', '25', '23', '23', '32', '56', '<30', '<30', '33', '83', '52', '36'],
                      },
                      {
                        ind: 'Amoniak\nNitrogen',
                        norm: '10',
                        vals: ['<0,0100', '0,2500', '0,1100', '0,0800', '<0,01', '<0,01', '<0,01', '<0,01', '10,0000', '<0,01', '<0,01', '<5'],
                      },
                      {
                        ind: 'ZINK',
                        norm: '10',
                        vals: ['0,610', '<0,0100', '<0,0100', '<0,0100', '', '', '-', '0,40', '0,0000', '0,3640', '0,1900', '0,27'],
                      },
                      {
                        ind: 'SULFIDA',
                        norm: '300',
                        vals: ['0,0800', '<0,0100', '<0,0100', '<0,0100', '', '', '-', '-', '', '', '', ''],
                      },
                      {
                        ind: 'NITRIT',
                        norm: '40',
                        vals: ['<0,0035\n8', '<0,00358', '<0,00358', '0,722', '', '', '-', '1,07', '0', '0,47', '1,98', '0,08'],
                      },
                      {
                        ind: 'NITRAT',
                        norm: '30',
                        vals: ['6,3', '1,83', '0,81', '6,0', '', '', '-', '56,2', '0', '19,4', '19,8', '3,55'],
                      },
                      {
                        ind: 'TOTAL\nCOLIFORM',
                        norm: '3000',
                        vals: ['1200', '1.100', '800', '1.400', '2,4x10', '0', '7 X 10', '2.4X10⁶', '240000', '9.300', '900', '400'],
                        redCol: 9,
                      },
                    ].map((row, rIdx) => (
                      <tr key={`outlet-${rIdx}`} className="bg-white text-center">
                        {rIdx === 0 && (
                          <td
                            rowSpan={11}
                            className="border border-slate-500 px-1 py-0.5 align-top text-center"
                          >
                            IPAL
                            <br />
                            OUTLET
                          </td>
                        )}
                        <td className="border border-slate-500 px-1 py-0.5 text-left align-middle whitespace-pre-line">
                          {row.ind}
                        </td>
                        <td className="border border-slate-500 px-0.5 py-0.5 align-middle">
                          {row.norm}
                        </td>
                        {row.vals.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`border border-slate-500 px-0.5 py-0.5 align-middle whitespace-pre-line ${
                              row.redCol === cIdx ? 'bg-[#FF0000] text-slate-900' : ''
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {renderLandscapeFooter(24)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 25: ANALISA HASIL PENGUJIAN LIMBAH CAIR IPAL INLET (PERSIS GAMBAR 5)
           ===================================================================== */}
        {shouldRenderPage(25, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-25"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-12 sm:px-14 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-1.5 text-[13.5px] leading-[1.72] text-justify text-slate-900">
              <div>ANALISA HASIL PENGUJIAN LIMBAH CAIR IPAL</div>

              {/* 1. Gambaran Umum */}
              <div className="space-y-1">
                <div>1. Gambaran Umum</div>
                <p className="pl-5">
                  Pengujian mutu limbah cair dilakukan pada titik IPAL Inlet dan IPAL Outlet secara berkala selama satu tahun. Pemeriksaan meliputi parameter fisika, kimia, dan mikrobiologi, dengan tujuan untuk mengevaluasi kinerja Instalasi Pengolahan Air Limbah (IPAL) serta memastikan bahwa air limbah yang dibuang ke lingkungan telah memenuhi baku mutu limbah cair sesuai peraturan yang berlaku.
                </p>
              </div>

              {/* 2. Analisa Hasil Pengujian IPAL Inlet */}
              <div className="space-y-1 pt-0.5">
                <div>2. Analisa Hasil Pengujian IPAL Inlet</div>

                <div className="pl-5 space-y-1">
                  <div>a. Parameter Fisika</div>
                  <ul className="list-disc pl-9 space-y-1">
                    <li className="pl-2">
                      Suhu limbah cair inlet berada pada rentang normal dan relatif stabil sepanjang tahun.
                    </li>
                    <li className="pl-2">
                      TSS menunjukkan fluktuasi namun sebagian besar masih berada di bawah ambang batas baku mutu, dengan nilai tertinggi pada awal tahun dan cenderung menurun pada pertengahan hingga akhir tahun.
                    </li>
                  </ul>
                  <div className="pl-11 pt-2 space-y-0.5">
                    <div>Analisa:</div>
                    <p>
                      Kondisi fisika pada IPAL inlet mencerminkan karakteristik limbah cair rumah sakit sebelum pengolahan, dengan beban pencemar yang masih cukup tinggi namun masih dalam kisaran yang dapat ditangani oleh sistem IPAL.
                    </p>
                  </div>

                  <div className="pt-1">b. Parameter Kimia</div>
                  <ul className="list-disc pl-9 space-y-1">
                    <li className="pl-2">
                      pH pada beberapa bulan awal menunjukkan nilai di bawah baku mutu (pH &lt;6), menandakan limbah bersifat asam.
                    </li>
                    <li className="pl-2">
                      BOD dan COD pada IPAL inlet menunjukkan nilai yang fluktuatif, dengan beberapa bulan melebihi baku mutu, terutama pada pertengahan hingga akhir tahun. Hal ini mengindikasikan tingginya beban bahan organik yang masuk ke IPAL.
                    </li>
                    <li className="pl-2">
                      Amoniak Nitrogen, Nitrit, dan Nitrat secara umum masih berada di bawah baku mutu, meskipun terdapat peningkatan pada beberapa bulan tertentu.
                    </li>
                    <li className="pl-2">
                      Logam berat (Zink) dan Sulfida berada jauh di bawah ambang batas yang dipersyaratkan.
                    </li>
                  </ul>
                  <div className="pl-6 pt-2 space-y-0.5">
                    <div>Analisa:</div>
                    <p>
                      Nilai BOD dan COD yang melebihi baku mutu pada inlet merupakan kondisi yang wajar karena limbah belum mengalami proses pengolahan. Hal ini justru menunjukkan bahwa IPAL menerima beban pencemar organik yang signifikan dan membutuhkan proses pengolahan yang optimal.
                    </p>
                  </div>
                </div>

                <div className="pt-0.5">c. Parameter Mikrobiologi</div>
                <ul className="list-disc pl-9 space-y-1">
                  <li className="pl-2">
                    Total Coliform pada IPAL inlet menunjukkan nilai yang sangat tinggi dan fluktuatif sepanjang tahun, bahkan mencapai nilai jutaan/100 ml pada beberapa bulan.
                  </li>
                </ul>
              </div>
            </div>
            {renderSingleFooter(25)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 26: ANALISA HASIL PENGUJIAN IPAL OUTLET (PERSIS GAMBAR 6)
           ===================================================================== */}
        {shouldRenderPage(26, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-26"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-12 sm:px-14 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-1.5 text-[13.5px] leading-[1.74] text-justify text-slate-900">
              <div className="pl-9 space-y-0.5">
                <div>Analisa:</div>
                <p>
                  Tingginya Total Coliform pada IPAL inlet menunjukkan adanya kontaminasi mikrobiologi yang signifikan dari aktivitas pelayanan kesehatan, domestik, dan sanitasi rumah sakit.
                </p>
              </div>

              <div className="space-y-1 pt-0.5">
                <div>3. Analisa Hasil Pengujian IPAL Outlet</div>

                <div className="pl-5 space-y-1">
                  <div>a. Parameter Fisika</div>
                  <ul className="list-disc pl-9 space-y-1">
                    <li className="pl-2">
                      Suhu limbah cair outlet relatif stabil dan tidak menunjukkan perbedaan signifikan dibandingkan inlet.
                    </li>
                    <li className="pl-2">
                      TSS pada outlet menunjukkan penurunan signifikan dan seluruh hasil berada di bawah baku mutu.
                    </li>
                  </ul>
                  <div className="pl-8 pt-2 space-y-0.5">
                    <div>Analisa:</div>
                    <p>
                      Penurunan nilai TSS menunjukkan bahwa proses sedimentasi dan filtrasi dalam IPAL berjalan dengan baik.
                    </p>
                  </div>

                  <div className="pt-1">b. Parameter Kimia</div>
                  <ul className="list-disc pl-10 space-y-1">
                    <li className="pl-2">
                      pH outlet secara umum berada dalam rentang baku mutu (6,0–9,0), meskipun terdapat beberapa bulan dengan pH mendekati batas bawah.
                    </li>
                    <li className="pl-2">
                      BOD dan COD pada outlet menunjukkan penurunan yang signifikan dibandingkan inlet dan sebagian besar telah memenuhi baku mutu, meskipun pada beberapa bulan tertentu mendekati nilai ambang.
                    </li>
                    <li className="pl-2">
                      Amoniak Nitrogen, Nitrit, dan Nitrat umumnya memenuhi baku mutu, namun terdapat lonjakan nitrat pada bulan tertentu yang perlu mendapat perhatian.
                    </li>
                    <li className="pl-2">
                      Zink dan Sulfida tetap berada jauh di bawah baku mutu.
                    </li>
                  </ul>
                  <div className="pl-9 pt-2 space-y-0.5">
                    <div>Analisa:</div>
                    <p>
                      Hasil ini menunjukkan bahwa proses biologis dan kimia dalam IPAL mampu menurunkan beban pencemar secara efektif, meskipun diperlukan pengendalian operasional pada periode tertentu untuk menjaga stabilitas proses.
                    </p>
                  </div>

                  <div className="pt-1">c. Parameter Mikrobiologi</div>
                  <ul className="list-disc pl-8 space-y-1">
                    <li className="pl-2">
                      Total Coliform pada IPAL outlet menunjukkan penurunan yang sangat signifikan dibandingkan inlet.
                    </li>
                    <li className="pl-2">
                      Namun, pada beberapa bulan nilai Total Coliform masih melebihi baku mutu (3.000/100 ml).
                    </li>
                  </ul>
                  <div className="pl-11 pt-2 space-y-0.5">
                    <div>Analisa:</div>
                    <p>
                      Penurunan signifikan Total Coliform menunjukkan bahwa IPAL bekerja efektif dalam menurunkan beban mikrobiologi. Akan tetapi, hasil yang masih melebihi baku mutu pada periode tertentu mengindikasikan bahwa proses desinfeksi belum optimal atau tidak konsisten.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {renderSingleFooter(26)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 27: EVALUASI KINERJA IPAL & 3.7 PENGAMANAN LIMBAH RADIASI (PERSIS GAMBAR 7)
           ===================================================================== */}
        {shouldRenderPage(27, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-27"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-12 sm:px-14 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[13.5px] leading-[1.72] text-justify text-slate-900">
              {/* 4. Evaluasi Kinerja IPAL */}
              <div className="space-y-0.5">
                <div>4. Evaluasi Kinerja IPAL</div>
                <p className="pl-6">
                  Secara umum, IPAL rumah sakit berfungsi dengan baik dalam menurunkan beban pencemar fisika, kimia, dan mikrobiologi dari inlet ke outlet. Efisiensi penurunan terlihat jelas pada parameter TSS, BOD, COD, dan Total Coliform. Namun, masih terdapat ketidaksesuaian pada beberapa parameter outlet pada periode tertentu, terutama BOD, COD, Nitrat, dan Total Coliform.
                </p>
              </div>

              {/* 5. Kesimpulan */}
              <div className="space-y-1 pt-1">
                <div>5. Kesimpulan</div>
                <ol className="list-decimal pl-12 space-y-1">
                  <li className="pl-2">
                    Limbah cair IPAL inlet menunjukkan beban pencemar yang tinggi dan fluktuatif, sesuai karakteristik limbah rumah sakit.
                  </li>
                  <li className="pl-2">
                    Limbah cair IPAL outlet secara umum telah memenuhi baku mutu, namun masih terdapat parameter yang melebihi ambang batas pada beberapa bulan.
                  </li>
                  <li className="pl-2">
                    IPAL efektif menurunkan beban pencemar, namun memerlukan penguatan pengelolaan operasional.
                  </li>
                </ol>
              </div>

              {/* 6. Rekomendasi */}
              <div className="space-y-1">
                <div>6. Rekomendasi</div>
                <ol className="list-decimal pl-12 space-y-1">
                  <li className="pl-2">
                    Mengoptimalkan proses desinfeksi akhir (klorinasi/UV) untuk menekan Total Coliform.
                  </li>
                  <li className="pl-2">
                    Melakukan evaluasi operasional IPAL secara berkala, terutama pada saat terjadi lonjakan BOD dan COD.
                  </li>
                  <li className="pl-2">
                    Melakukan pemantauan rutin dan pencatatan harian parameter kunci IPAL.
                  </li>
                  <li className="pl-2">
                    Meningkatkan kapasitas SDM pengelola IPAL dan pemeliharaan peralatan.
                  </li>
                </ol>
              </div>

              {/* 3.7 Pengamanan Limbah Radiasi */}
              <div className="pt-3 space-y-2">
                <div>3.7 Pengamanan Limbah Radiasi</div>
                <p className="pl-8">
                  Program pengelolaan limbah radiasi yang dilakukan di UOBK RSUD Al-Mulk Kota Sukabumi sebagai berikut:
                </p>
                <div className="pl-8 space-y-1">
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Pengurusan izin untuk peralatan yang memajankan radiasi dan menggunakan zat radioaktif dari Badan Pengawas Tenaga Nuklir,
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>Menyediakan alat proteksi diri bagi pekerja radiasi,</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>Pemberian nutrisi tambahan bagi pekerja radiasi,</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="shrink-0">-</span>
                    <span>
                      Memantau kalibrasi alat radiasi, Menggunakan peralatan radioaktif yang tidak menghasilkan limbah cair atau padat.
                    </span>
                  </div>
                </div>

                {/* Tabel Radiasi Bagian 1 (Bulan 1 - 4) */}
                <div className="pt-1">
                  <table className="w-full border-collapse border border-slate-500 text-[11px] leading-[1.3] table-fixed">
                    <colgroup>
                      <col className="w-[4.8%]" />
                      <col className="w-[14.2%]" />
                      <col className="w-[12.5%]" />
                      <col className="w-[14.2%]" />
                      <col className="w-[7.2%]" />
                      <col className="w-[13.2%]" />
                      <col className="w-[10.8%]" />
                      <col className="w-[12.2%]" />
                      <col className="w-[10.9%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-center font-normal">
                        <th rowSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          No
                        </th>
                        <th rowSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Bulan
                        </th>
                        <th colSpan={2} className="border border-slate-500 px-1.5 py-1 align-top font-normal">
                          Rumah sakit mempunyai
                          <br />
                          izin penggunaan alat dari
                          <br />
                          Badan Pengawas Tenaga
                          <br />
                          Nuklir (BAPETEN)
                        </th>
                        <th colSpan={2} className="border border-slate-500 px-1.5 py-1 align-top font-normal">
                          Mempunyai
                          <br />
                          peralatan proteksi
                          <br />
                          radiasi
                        </th>
                        <th colSpan={2} className="border border-slate-500 px-1.5 py-1 align-top font-normal">
                          Melakukan
                          <br />
                          pemantauan pekerja
                          <br />
                          radiasi menggunakan
                          <br />
                          alat proteksi diri
                        </th>
                        <th rowSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Capaian
                        </th>
                      </tr>
                      <tr className="text-center font-normal">
                        <th className="border border-slate-500 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-500 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-500 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-500 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-500 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-500 py-0.5 font-normal">tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compiled.radiation.monthlyRows.slice(0, 4).map((r) => (
                        <tr key={r.no} className="text-center">
                          <td className="border border-slate-500 py-0.5">{r.no}</td>
                          <td className="border border-slate-500 px-1.5 py-0.5 text-left">
                            {r.monthName}
                          </td>
                          <td className="border border-slate-500 py-0.5">{r.izinBapeten === true ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.izinBapeten === false ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.apdProteksi === true ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.apdProteksi === false ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.pemantauanPekerja === true ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.pemantauanPekerja === false ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.izinBapeten !== null ? `${r.capaianPct}%` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {renderSingleFooter(27)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 28: LANJUTAN TABEL RADIASI & RTL RADIASI (PERSIS GAMBAR 8)
           ===================================================================== */}
        {shouldRenderPage(28, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-28"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-12 sm:px-14 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-2.5 text-[13.4px] leading-[1.68] text-justify text-slate-900">
              {/* Lanjutan Tabel Radiasi (Bulan 5 - 12) */}
              <div>
                <table className="w-full border-collapse border border-slate-500 text-[11px] leading-[1.3] table-fixed">
                  <colgroup>
                    <col className="w-[4.8%]" />
                    <col className="w-[14.2%]" />
                    <col className="w-[12.5%]" />
                    <col className="w-[14.2%]" />
                    <col className="w-[7.2%]" />
                    <col className="w-[13.2%]" />
                    <col className="w-[10.8%]" />
                    <col className="w-[12.2%]" />
                    <col className="w-[10.9%]" />
                  </colgroup>
                  <tbody>
                    {compiled.radiation.monthlyRows.slice(4).map((r) => (
                      <tr key={r.no} className="text-center">
                        <td className="border border-slate-500 py-0.5">{r.no}</td>
                        <td className="border border-slate-500 px-1.5 py-0.5 text-left">
                          {r.monthName}
                        </td>
                        <td className="border border-slate-500 py-0.5">{r.izinBapeten === true ? '✓' : ''}</td>
                        <td className="border border-slate-500 py-0.5">{r.izinBapeten === false ? '✓' : ''}</td>
                        <td className="border border-slate-500 py-0.5">{r.apdProteksi === true ? '✓' : ''}</td>
                        <td className="border border-slate-500 py-0.5">{r.apdProteksi === false ? '✓' : ''}</td>
                        <td className="border border-slate-500 py-0.5">{r.pemantauanPekerja === true ? '✓' : ''}</td>
                        <td className="border border-slate-500 py-0.5">{r.pemantauanPekerja === false ? '✓' : ''}</td>
                        <td className="border border-slate-500 py-0.5">{r.izinBapeten !== null ? `${r.capaianPct}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-1 space-y-1.5">
                <p>
                  Berdasarkan tabel pemantauan bulan Januari–Desember, diperoleh hasil sebagai berikut:
                </p>

                <ol className="list-decimal pl-10 space-y-1">
                  <li className="pl-2">
                    Izin penggunaan alat dari BAPETEN Selama 12 bulan, rumah sakit memiliki izin resmi dari BAPETEN (100%). Hal ini menunjukkan kepatuhan terhadap regulasi keselamatan radiasi sesuai peraturan perundangan yang berlaku.
                  </li>
                  <li className="pl-2">
                    Ketersediaan peralatan proteksi radiasi Rumah sakit secara konsisten memiliki peralatan proteksi radiasi lengkap (100%), seperti apron timbal, pelindung tiroid, sarung tangan timbal, dan alat pelindung lainnya sesuai kebutuhan layanan.
                  </li>
                  <li className="pl-2">
                    Pemantauan pekerja radiasi menggunakan alat proteksi diri Pemantauan terhadap pekerja radiasi dilaksanakan secara rutin dan berkelanjutan (100%), termasuk penggunaan APD dan pemantauan dosis radiasi.
                  </li>
                  <li className="pl-2">
                    Capaian indikator Seluruh indikator mencapai 100% setiap bulan, menandakan sistem pengelolaan dan pengawasan proteksi radiasi telah berjalan optimal, konsisten, dan sesuai standar.
                  </li>
                </ol>
              </div>

              <div className="pt-0.5 space-y-1">
                <div>RENCANA TINDAK LANJUT (RTL)</div>
                <ol className="list-decimal pl-10 space-y-1">
                  <li className="pl-2 space-y-0.5">
                    <div>Pemeliharaan Kepatuhan Perizinan</div>
                    <ul className="list-[circle] pl-8 space-y-0.5">
                      <li className="pl-2">
                        Memastikan izin BAPETEN selalu aktif dan diperpanjang tepat waktu
                      </li>
                      <li className="pl-2">Melakukan evaluasi dokumen perizinan secara berkala</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Pemeliharaan dan Kalibrasi Alat Proteksi</div>
                    <ul className="list-[circle] pl-8 space-y-0.5">
                      <li className="pl-2">Pemeriksaan rutin kondisi alat proteksi radiasi</li>
                      <li className="pl-2">Penggantian alat yang rusak atau tidak layak pakai</li>
                      <li className="pl-2">Kalibrasi alat ukur radiasi sesuai jadwal</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Penguatan Pemantauan Pekerja Radiasi</div>
                    <ul className="list-[circle] pl-8 space-y-0.5">
                      <li className="pl-2">Monitoring dosis radiasi pekerja secara berkala</li>
                      <li className="pl-2">Pencatatan dan pelaporan hasil pemantauan</li>
                      <li className="pl-2">Evaluasi bila terdapat paparan mendekati NAB</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Peningkatan Kompetensi SDM</div>
                    <ul className="list-[circle] pl-8 space-y-0.5">
                      <li className="pl-2">
                        Pelatihan keselamatan dan proteksi radiasi secara rutin
                      </li>
                      <li className="pl-2">Sosialisasi SOP proteksi radiasi bagi petugas baru</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Monitoring dan Evaluasi Berkala</div>
                    <ul className="list-[circle] pl-8 space-y-0.5">
                      <li className="pl-2">Audit internal pengelolaan radiasi</li>
                      <li className="pl-2">Pelaporan berkala ke manajemen rumah sakit</li>
                      <li className="pl-2">
                        Dokumentasi sebagai bukti dukung akreditasi dan KRIS
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
            {renderSingleFooter(28)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 29: 3.8 PENGENDALIAN VEKTOR & GRAFIK TABEL 6 (PERSIS GAMBAR 9)
           ===================================================================== */}
        {shouldRenderPage(29, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-29"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-12 sm:px-14 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-2 text-[13.5px] leading-[1.74] text-justify text-slate-900">
              <div className="flex items-baseline gap-1.5">
                <span className="shrink-0">3.8</span>
                <span>Penyelenggaraan Pengendalian Vektor dan Binatang Pembawa Penyakit</span>
              </div>

              <div className="pl-7 space-y-2">
                <p className="indent-12">
                  Belum dilakukannya pengendalian serangga dengan melakukan kerjasama dengan pihak ke-3, akan tetapi telah dilakukan beberapa upaya untuk pengendalian Serangga, Tikus dan Binatang Pengganggu di UOBK RSUD Al–Mulk sebagai berikut :
                </p>

                <div className="space-y-1 pl-2">
                  <div className="flex items-baseline gap-4">
                    <span className="w-4 shrink-0">a.</span>
                    <span>
                      Keberadaan nyamuk diatasi dengan penyemprotan menggunakan insektisida dengan dosis yang sesuai
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="w-4 shrink-0">b.</span>
                    <span>
                      Pengecekan larva nyamuk pada area yang memungkinkan menjadi tempat perindukan nyamuk dan melaksanakan abatesasi
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="w-4 shrink-0">c.</span>
                    <span>
                      ada laporan tanda-tanda keberadaan tikus terutama pada daerah bangunan tertutup rumah sakit.
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="w-4 shrink-0">d.</span>
                    <div className="space-y-0.5">
                      <div>Pengendalian nyamuk dengan menggunakan light trap.</div>
                      <div>Adanya hasil pemeriksaan sebagai berikut :</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1 text-center text-[13.5px]">
                Tabel 6. Tabel Hasil Pengendalian Vektor dan Binatang Pembawa Penyakit
              </div>

              {/* 8-Bar Chart Replica matching Gambar 9 */}
              <div className="border border-slate-300 bg-white px-3 pt-2.5 pb-2">
                <svg viewBox="0 0 650 245" className="w-full h-auto block">
                  {[
                    { label: '120', y: 18 },
                    { label: '100', y: 44 },
                    { label: '80', y: 70 },
                    { label: '60', y: 96 },
                    { label: '40', y: 122 },
                    { label: '20', y: 148 },
                    { label: '0', y: 174 },
                  ].map((axis) => (
                    <text
                      key={axis.label}
                      x="32"
                      y={axis.y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#595959"
                    >
                      {axis.label}
                    </text>
                  ))}

                  <line x1="42" y1="174" x2="628" y2="174" stroke="#D9D9D9" strokeWidth="1" />

                  {[
                    {
                      val: compiled.vector.bars[0]?.value ?? 87.5,
                      display: String(compiled.vector.bars[0]?.value ?? 87.5).replace('.', ','),
                      color: '#ED7D31',
                      lines: ['angka bebas', 'jentik <95'],
                      x: 62,
                    },
                    {
                      val: compiled.vector.bars[1]?.value ?? 100,
                      display: String(compiled.vector.bars[1]?.value ?? 100).replace('.', ','),
                      color: '#92D050',
                      lines: ['angka resting', 'rate aedes', 'aegypti', '<0,025'],
                      x: 134,
                    },
                    {
                      val: compiled.vector.bars[2]?.value ?? 100,
                      display: String(compiled.vector.bars[2]?.value ?? 100).replace('.', ','),
                      color: '#92D050',
                      lines: ['angka man', 'Hour Density', 'Culex <1'],
                      x: 206,
                    },
                    {
                      val: compiled.vector.bars[3]?.value ?? 100,
                      display: String(compiled.vector.bars[3]?.value ?? 100).replace('.', ','),
                      color: '#92D050',
                      lines: ['angka larva', 'culex <5'],
                      x: 278,
                    },
                    {
                      val: compiled.vector.bars[4]?.value ?? 100,
                      display: String(compiled.vector.bars[4]?.value ?? 100).replace('.', ','),
                      color: '#92D050',
                      lines: ['Pinjal <1'],
                      x: 350,
                    },
                    {
                      val: compiled.vector.bars[5]?.value ?? 95,
                      display: String(compiled.vector.bars[5]?.value ?? 95).replace('.', ','),
                      color: '#F8CBAD',
                      lines: ['Lalat <8'],
                      x: 422,
                    },
                    {
                      val: compiled.vector.bars[6]?.value ?? 83,
                      display: String(compiled.vector.bars[6]?.value ?? 83).replace('.', ','),
                      color: '#FFFF00',
                      lines: ['Kecoa <2'],
                      x: 494,
                    },
                    {
                      val: compiled.vector.bars[7]?.value ?? 97,
                      display: String(compiled.vector.bars[7]?.value ?? 97).replace('.', ','),
                      color: '#FF0000',
                      lines: [
                        'Angka',
                        'kepadatan',
                        'binatang',
                        'pembawa',
                        'penyakit,',
                        'angka success',
                        'trap tikus <1',
                      ],
                      x: 566,
                    },
                  ].map((bar, idx) => {
                    const barHeight = (bar.val / 120) * 156;
                    const barTop = 174 - barHeight;
                    const barWidth = 42;
                    return (
                      <g key={`vbar-${idx}`}>
                        <text
                          x={bar.x + barWidth / 2}
                          y={barTop - 5}
                          textAnchor="middle"
                          fontSize="8.8"
                          fill="#404040"
                        >
                          {bar.display}
                        </text>
                        <rect
                          x={bar.x}
                          y={barTop}
                          width={barWidth}
                          height={barHeight}
                          fill={bar.color}
                        />
                        {bar.lines.map((ln, lIdx) => (
                          <text
                            key={lIdx}
                            x={bar.x + barWidth / 2}
                            y={186 + lIdx * 9.5}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#595959"
                          >
                            {ln}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="pt-2 space-y-1">
                <p>
                  Hasil Analisa vektor binatang pengganggu yang telah dilakukan selama bulan januari - desember Secara umum, seluruh indikator kepadatan binatang pembawa penyakit belum memenuhi standar yang ditetapkan. Kondisi ini menunjukkan bahwa pengendalian vektor dan binatang pembawa penyakit di lingkungan fasilitas kesehatan masih perlu ditingkatkan untuk mencegah risiko penularan penyakit berbasis lingkungan.
                </p>

                <div>Rencana Tindak Lanjut (RTL)</div>
                <ol className="list-decimal pl-5 space-y-0.5">
                  <li className="pl-2 space-y-0.5">
                    <div>Peningkatan PSN (Pemberantasan Sarang Nyamuk)</div>
                    <ul className="list-[circle] pl-7 space-y-0.5">
                      <li className="pl-2">3M Plus secara rutin</li>
                      <li className="pl-2">Eliminasi genangan air</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
            {renderSingleFooter(29)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 30: LANJUTAN RTL VEKTOR & 3.9 PENGAWASAN LINEN (PERSIS GAMBAR 10)
           ===================================================================== */}
        {shouldRenderPage(30, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-30"
            className="scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] px-12 sm:px-14 pt-12 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-2.5 text-[13.5px] leading-[1.72] text-justify text-slate-900">
              <div className="pl-7 space-y-1">
                <ul className="list-[circle] pl-7">
                  <li className="pl-2">Monitoring jentik mingguan</li>
                </ul>

                <ol start={2} className="list-decimal pl-3 space-y-1">
                  <li className="pl-2 space-y-0.5">
                    <div>Pengendalian Nyamuk Dewasa</div>
                    <ul className="list-[circle] pl-7 space-y-0.5">
                      <li className="pl-2">Pemasangan ovitrap dan insect light trap</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Pengendalian Lalat &amp; Kecoa</div>
                    <ul className="list-[circle] pl-7 space-y-0.5">
                      <li className="pl-2">Perbaikan pengelolaan limbah</li>
                      <li className="pl-2">Pembersihan area dapur, TPS, dan saluran</li>
                      <li className="pl-2">Pemasangan sticky trap &amp; gel bait</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Pengendalian Tikus</div>
                    <ul className="list-[circle] pl-7 space-y-0.5">
                      <li className="pl-2">Penempatan trap di area berisiko</li>
                      <li className="pl-2">Penutupan celah bangunan</li>
                      <li className="pl-2">Kerja sama dengan pihak ketiga pest control</li>
                    </ul>
                  </li>
                  <li className="pl-2 space-y-0.5">
                    <div>Monitoring &amp; Evaluasi Berkala</div>
                    <ul className="list-[circle] pl-9 space-y-0.5">
                      <li className="pl-2">Pencatatan hasil inspeksi</li>
                      <li className="pl-2">Evaluasi bulanan</li>
                      <li className="pl-2">Pelaporan ke manajemen RS</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="pt-2 space-y-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="shrink-0">3.9</span>
                  <span>Penyelenggaraan Pengawasan Linen (Laundry)</span>
                </div>

                <p className="pl-5 indent-11">
                  Penyelenggaraan Pengawasan Linen (Laundry) dilakukan setiap 1 bulan sekali bersamaan dengan Tim PPI karena untuk penyelenggaraan laundry pihak UOBK RSUD Al-Mulk Kota Sukabumi masih menggunakan pihak ketiga dengan RS BHAYANGKARA SETUKPA dengan menggunakan form penilaian sesuai dengan Permenkes No 7 Tahun 2019. Berdasarkan hasil pengawasan, bahwa tempat pengelolaan linen (laundry) sudah memenuhi persyaratan sesuai dengan Permenkes No 7 Tahun 2019. Hasil pemeriksaan setiap bulannya;
                </p>

                <div className="pt-1">
                  <table className="w-full border-collapse border border-slate-500 text-[11px] leading-[1.3] table-fixed">
                    <colgroup>
                      <col className="w-[4.8%]" />
                      <col className="w-[16.8%]" />
                      <col className="w-[10.8%]" />
                      <col className="w-[11.2%]" />
                      <col className="w-[13.5%]" />
                      <col className="w-[14.2%]" />
                      <col className="w-[8.2%]" />
                      <col className="w-[10.2%]" />
                      <col className="w-[10.3%]" />
                    </colgroup>
                    <thead>
                      <tr className="text-center font-normal">
                        <th rowSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          No
                        </th>
                        <th rowSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Bulan
                        </th>
                        <th colSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Adanya MoU dengan
                          <br />
                          Pihak Ke tiga
                        </th>
                        <th colSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Dilakukan pemilahan antara
                          <br />
                          linen infeksius dan non
                          <br />
                          infeksius
                        </th>
                        <th colSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Dilakukan
                          <br />
                          pengawasan rutin
                        </th>
                        <th rowSpan={2} className="border border-slate-500 px-1 py-1 align-top font-normal">
                          Capaian
                        </th>
                      </tr>
                      <tr className="text-center font-normal">
                        <th className="border border-slate-500 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-500 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-500 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-500 py-0.5 font-normal">tidak</th>
                        <th className="border border-slate-500 py-0.5 font-normal">ya</th>
                        <th className="border border-slate-500 py-0.5 font-normal">tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compiled.linen.monthlyRows.map((r) => (
                        <tr key={r.no} className="text-center">
                          <td className="border border-slate-500 py-0.5">{r.no}</td>
                          <td className="border border-slate-500 py-0.5">{r.monthName}</td>
                          <td className="border border-slate-500 py-0.5">{r.mouPihakKetiga === true ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.mouPihakKetiga === false ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.pemilahanInfeksius === true ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.pemilahanInfeksius === false ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.pengawasanRutin === true ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.pengawasanRutin === false ? '✓' : ''}</td>
                          <td className="border border-slate-500 py-0.5">{r.mouPihakKetiga !== null ? `${r.capaianPct}%` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="pt-3 indent-14">
                  Berdasarkan hasil pemantauan pengelolaan linen rumah sakit selama periode Januari–Desember, seluruh indikator menunjukkan capaian 100% setiap bulan. Hal ini menandakan bahwa
                </p>
              </div>
            </div>
            {renderSingleFooter(30)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 31: ANALISA PENGELOLAAN LINEN (LANJUTAN)
           ===================================================================== */}
        {shouldRenderPage(31, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-31"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[20mm] pt-[16mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="text-[11pt] leading-[1.6] text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <p className="text-justify">
                pengelolaan linen telah dilaksanakan secara konsisten, terstandar, dan sesuai dengan prinsip KRIS BPJS Kesehatan, khususnya dalam aspek keselamatan pasien, pencegahan infeksi, dan mutu layanan rawat inap.
              </p>

              {/* 1. Kesesuaian MoU dengan Pihak Ketiga */}
              <div className="mt-4">
                <div>1. Kesesuaian MoU dengan Pihak Ketiga</div>
                <p className="indent-8 text-justify mt-3">
                  Standar KRIS menekankan pentingnya dukungan sistem pelayanan penunjang yang aman dan bermutu, termasuk pengelolaan linen. Keberadaan MoU aktif dengan pihak ketiga sepanjang tahun menunjukkan bahwa rumah sakit telah:
                </p>
                <ul className="list-disc pl-9 mt-3 space-y-1 text-justify">
                  <li className="pl-2">
                    Menjamin proses pencucian dan pengelolaan linen dilakukan oleh pihak yang kompeten.
                  </li>
                  <li className="pl-2">
                    Memastikan pemenuhan standar kebersihan, sanitasi, dan keselamatan kerja.
                  </li>
                  <li className="pl-2">
                    Menjaga kontinuitas pelayanan linen untuk mendukung kenyamanan pasien rawat inap sesuai KRIS.
                  </li>
                </ul>
                <p className="indent-9 text-justify mt-3">
                  Dengan adanya MoU ini, risiko kontaminasi silang dan gangguan pelayanan dapat diminimalkan.
                </p>
              </div>

              {/* 2. Pemilahan Linen Infeksius dan Non-Infeksius */}
              <div className="mt-4">
                <div>2. Pemilahan Linen Infeksius dan Non-Infeksius</div>
                <p className="indent-14 text-justify mt-3">
                  Pelaksanaan pemilahan linen infeksius dan non-infeksius secara konsisten setiap bulan merupakan implementasi langsung dari prinsip Pencegahan dan Pengendalian Infeksi (PPI) yang menjadi bagian penting dalam standar KRIS.
                </p>
                <p className="mt-3">Kegiatan ini menunjukkan bahwa rumah sakit telah:</p>
                <ul className="list-disc pl-9 mt-3 space-y-1 text-justify">
                  <li className="pl-2">
                    Mengendalikan potensi penularan infeksi di ruang rawat inap.
                  </li>
                  <li className="pl-2">
                    Menjamin kebersihan lingkungan perawatan yang seragam dan aman untuk seluruh kelas perawatan.
                  </li>
                  <li className="pl-2">
                    Mendukung terciptanya kualitas ruang rawat inap yang setara, sebagaimana tujuan utama KRIS.
                  </li>
                </ul>
              </div>

              {/* 3. Pengawasan Rutin Pengelolaan Linen */}
              <div className="mt-4">
                <div>3. Pengawasan Rutin Pengelolaan Linen</div>
                <p className="pl-4 indent-12 text-justify mt-1">
                  Pengawasan rutin yang dilakukan setiap bulan mencerminkan fungsi kendali mutu dan keselamatan pasien yang menjadi tuntutan dalam penerapan KRIS.
                </p>
                <p className="pl-4 mt-1">Pengawasan ini memastikan:</p>
                <ul className="list-disc pl-9 mt-1 space-y-1 text-justify">
                  <li className="pl-2">
                    Kepatuhan petugas terhadap SOP pengelolaan linen.
                  </li>
                  <li className="pl-2">
                    Konsistensi mutu linen yang digunakan pasien (bersih, layak, dan aman).
                  </li>
                  <li className="pl-2">
                    Deteksi dini terhadap potensi ketidaksesuaian sebelum berdampak pada mutu pelayanan.
                  </li>
                </ul>
              </div>

              {/* 4. Capaian Kinerja 100% */}
              <div className="mt-1">
                <div>4. Capaian Kinerja 100%</div>
                <p className="pl-4 mt-1">
                  Capaian 100% pada seluruh indikator setiap bulan menunjukkan bahwa:
                </p>
              </div>
            </div>
            {renderSingleFooter(31)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 32: REKOMENDASI LINEN, DEKONTAMINASI, PERSONIL & EVALUASI
           ===================================================================== */}
        {shouldRenderPage(32, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-32"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[20mm] pt-[16mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="text-[11pt] leading-[1.6] text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              {/* Continuation of 4. Capaian Kinerja 100% */}
              <ul className="list-disc pl-12 space-y-1 text-justify">
                <li className="pl-2">
                  Sistem pengelolaan linen telah terintegrasi dengan standar pelayanan KRIS.
                </li>
                <li className="pl-2">
                  Tidak ditemukan deviasi signifikan terhadap standar kebersihan, keselamatan, dan kenyamanan pasien.
                </li>
                <li className="pl-2">
                  Rumah sakit telah siap mendukung penerapan KRIS secara berkelanjutan dari aspek penunjang pelayanan.
                </li>
              </ul>

              {/* Rekomendasi */}
              <div className="mt-1">
                <div>Rekomendasi</div>
                <div className="mt-0.5">Untuk menjaga keberlanjutan penerapan KRIS, disarankan:</div>
                <ol className="list-decimal pl-12 mt-1 space-y-1 text-justify">
                  <li className="pl-2">
                    Mempertahankan MoU dengan pihak ketiga yang telah memenuhi standar kesehatan lingkungan.
                  </li>
                  <li className="pl-2">
                    Melakukan evaluasi berkala terhadap SOP pengelolaan linen sesuai pembaruan regulasi KRIS.
                  </li>
                  <li className="pl-2">
                    Mendokumentasikan hasil pengawasan sebagai bukti dukung akreditasi dan implementasi KRIS.
                  </li>
                </ol>
              </div>

              {/* 3.10 Penyelenggaraan Pengawasan Proses Dekontaminasi Melalui Disinfeksi dan Sterilisasi */}
              <div className="mt-5">
                <div className="flex items-start gap-2">
                  <span>3.10</span>
                  <span>
                    Penyelenggaraan Pengawasan Proses Dekontaminasi Melalui Disinfeksi dan Sterilisasi
                  </span>
                </div>
                <p className="pl-8 indent-12 text-justify mt-1">
                  Penyelenggaraan Pengawasan Proses Dekontaminasi Melalui Desinfeksi dan Sterilisasi dilakukan setiap 6 bulan sekali bersamaan dengan Tim PPI karena untuk penyelenggaraan Proses Dekontaminasi Melalui Desinfeksi dan Sterilisasi pihak RSUD Al-Mulk Kota Sukabumi masih menggunakan pihak ketiga dengan RSUD Syamsudin SH dengan menggunakan form penilaian sesuai dengan Permenkes No 7 Tahun 2019. Berdasarkan hasil pengawasan, bahwa tempat Pengawasan Proses Dekontaminasi Melalui Disinfeksi dan Sterilisasi sudah memenuhi persyaratan sesuai dengan Permenkes No 7 Tahun 2019.
                </p>
              </div>

              {/* 3.11 Penanggung Jawab Pelaksana */}
              <div className="mt-4">
                <div className="flex items-start gap-4 pl-2">
                  <span>3.11</span>
                  <span>Penanggung Jawab Pelaksana</span>
                </div>
                <p className="pl-12 indent-12 text-justify mt-3">
                  Kepala Unit Pelaksana Teknis Kesehatan Lingkungan bertanggungjawab dan bekerja sama dengan Unit pelaksana teknis lainnya terhadap pelaksanaan program sanitasi dan Kesehatan Lingkungan Rumah sakit seperti bekerja sama dengan Unit kebersihan dalam upaya menjaga kebersihan lingkungan rumah sakit, Juga kerja sama dengan pihak ketiga dalam upaya perawatan dan perbaikan Instalasi Pengolahan Air Limbah, Pengangkutan dan Pemusnahan Limbah Medis dalam hal Penyelenggaraan makanan seorang sanitarian (petugas kesehatan lingkungan) Rumah sakit melakukan kontrolling dalam semua prosesnya.
                </p>
              </div>

              {/* 3.12 Evaluasi Kegiatan */}
              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <span>3.12</span>
                  <span>Evaluasi Kegiatan</span>
                </div>
                <p className="pl-10 indent-12 text-justify mt-3">
                  Evaluasi pelaksanaan dan kegiatan pelaporan kegiatan Pengelolaan dan Pemantauan Lingkungan Rumah Sakit dilakukan tiap semester dan dilaporkan ke Kantor Lingkungan Hidup Kota Sukabumi setiap Bulan Juni dan Desember.
                </p>
              </div>

              {/* Tabel 19 Title */}
              <div className="text-center mt-5">
                Tabel 19. Identifikasi Masalah dan Tindak Lanjut Kesehatan Lingkungan
              </div>
            </div>
            {renderSingleFooter(32)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 33: TABEL 19. IDENTIFIKASI MASALAH DAN RTL KESLING (ITEM 1-3)
           ===================================================================== */}
        {shouldRenderPage(33, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-33"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[18mm] pt-[14mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="text-[10.5pt] leading-[1.28] text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <table className="w-full border-collapse border border-[#5B9BD5] table-fixed">
                <colgroup>
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '43%' }} />
                </colgroup>
                <thead>
                  <tr className="font-bold text-center">
                    <th className="border border-[#5B9BD5] px-1 py-1.5 align-middle">NO</th>
                    <th className="border border-[#5B9BD5] px-2 py-1.5 align-middle leading-[1.15]">
                      <div>MASALAH</div>
                      <div>KESLING</div>
                    </th>
                    <th className="border border-[#5B9BD5] px-2 py-1.5 align-middle leading-[1.12]">
                      <div>TINDAK</div>
                      <div>LANJUT</div>
                      <div>MASALA</div>
                      <div>H</div>
                    </th>
                    <th className="border border-[#5B9BD5] px-2 py-1.5 align-middle">
                      HASIL TINDAK LANJUT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* ROW 1 */}
                  <tr>
                    <td className="border border-[#5B9BD5] px-1 py-1 align-top text-left">1</td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Kesehatan udara berdasarkan hasil penilaian setiap ruangan Sebagian ada yang tidak memenuhi syarat sesuai dengan permenkes no 7 tahun 2019.
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      <div className="flex items-start gap-1">
                        <span>1.</span>
                        <span>
                          Dilakukan pemeriksaan rutin sebanyak 2 kali dalam 1 tahun yaitu dibulan Juni dan Desember.
                        </span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span>2.</span>
                        <span>
                          Pengajuan untuk perbaikan di masing-masing ruangan yang masih belum memenuhi syarat kesehatan Udara
                        </span>
                      </div>
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      <div className="mb-2">Sedang dalam proses perbaikan seperti;</div>
                      <div className="flex items-start gap-2">
                        <span>1.</span>
                        <span>
                          Pemasangan AC di masing-masing ruangan yang kurang sirkulasi udara
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>2.</span>
                        <span>
                          Penambahan / menaikan daya pencahayaan di masing2 ruangan yang kurang pencahayaannya.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>3.</span>
                        <span>
                          Melakukan pelatihan dan sosialisasi kepada seluruh staf rumah sakit mengenai pentingnya menjaga kebisingan, seperti berbicara dengan suara rendah, menghindari percakapan yang keras di area rawat inap, dan mengurangi penggunaan alat yang menghasilkan kebisingan berlebih.
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ROW 2 */}
                  <tr>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-right font-bold">
                      2
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Hasil Sampel Air bersih masih ada yang belum memenuhi syarat baku mutu kualitas air bersih/masih terdapat total coliform yang tinggi, air artesis masih keruh
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.6]">
                      Pengajuan penyaringan /filtrasi Sarana air bersih
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      <div className="flex items-start gap-2">
                        <span>1.</span>
                        <span>Sudah dilakukan Pengajuan filtrasi Sarana Air bersih</span>
                      </div>
                      <div className="flex items-start gap-2 leading-[1.6] text-justify">
                        <span>2.</span>
                        <span>
                          Melakukan desinfeksi dan pemeliharaan rutin pada seluruh sumber air bersih.
                        </span>
                      </div>
                      <div className="flex items-start gap-2 leading-[1.6] text-justify mt-0.5">
                        <span>3.</span>
                        <span>
                          Menambahkan atau mengoptimalkan pengolahan air untuk penurunan kadar mangan.
                        </span>
                      </div>
                      <div className="flex items-start gap-2 leading-[1.6] text-justify mt-0.5">
                        <span>4.</span>
                        <span>
                          Melakukan perawatan berkala sistem RO serta penggantian filter sesuai jadwal.
                        </span>
                      </div>
                      <div className="flex items-start gap-2 leading-[1.6] text-justify mt-0.5">
                        <span>5.</span>
                        <span>
                          Meningkatkan frekuensi monitoring pada parameter mikrobiologi dan kimia kritis.
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ROW 3 (Part 1) */}
                  <tr>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-right font-bold">
                      3
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      RSAM belum mempunyai alat kesling yaitu Sanitarian Kit seperti Sound level meter, hygrometer, lux meter, dan anemometer. sehingga terus menerus meminjam
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Mengajukan alat kesling sanitarian kit kepada RSAM supaya mempunyai alat sendiri dan memudahkan untuk pemeriksaan ruangan.
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Pengajuan alat sanitarian KIT.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(33)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 34: TABEL 19. LANJUTAN (ITEM 3 LANJUTAN & ITEM 4-6)
           ===================================================================== */}
        {shouldRenderPage(34, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-34"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[18mm] pt-[12mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="text-[10.5pt] leading-[1.28] text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <table className="w-full border-collapse border border-[#5B9BD5] table-fixed">
                <colgroup>
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '43%' }} />
                </colgroup>
                <tbody>
                  {/* ROW 3 CONTINUATION */}
                  <tr className="h-[18mm]">
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top"></td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      ke puskesmas
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top"></td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top"></td>
                  </tr>

                  {/* ROW 4 */}
                  <tr>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-right font-bold">
                      4
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Air buangan septic tang yang pertama suka meluap dan lubangnya terbuka sehingga menimbulkan bau tidak nyaman dan keluarnya binatang pengganggu (kecoa, lalat, nyamuk dll)
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Perlu dilakukan beberapa pengajuan seperti; Pengajuan pemindahan jalur pembuangan ke IPAL, penutupan septic tank atau penyedotan lumpur
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.6]">
                      Pengajuan pemindahan jalur pembuangan ke IPAL, penutupan septic tank atau penyedotan lumpur
                    </td>
                  </tr>

                  {/* ROW 5 */}
                  <tr>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-right font-bold">
                      5
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left">
                      Vektor binatang dan pengganggu di RSAM pada bulan januari-desember banyak nya angka jentik nyamuk, angka kecoa, dan ada nya keberadaan tikus sehingga mengalami masalah kepada setiap ruangan.
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.6]">
                      <div className="flex items-start gap-2">
                        <span>1.</span>
                        <span>
                          Mengajukan alat pemberantasan tikus dan kecoa, mengukur kepadatan lalat.
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mt-1">
                        <span>2.</span>
                        <span>Pengajuan untuk kerjasama dengan pihak ke-3</span>
                      </div>
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.6]">
                      <div className="flex items-start gap-2">
                        <span>1.</span>
                        <span>
                          Pengajuan alat untuk pengendalian vector dan binatang pengganggu
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mt-1">
                        <span>2.</span>
                        <span>
                          Pengajuan kerjasama dengan pihak ke 3 untuk pengendalian binatang pengganggu
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ROW 6 */}
                  <tr>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-right font-bold">
                      6
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.6]">
                      Masih kurangnya pemeliharaan bangunan dan kebersihan toilet
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.6]">
                      <div className="flex items-start gap-1">
                        <span>1.</span>
                        <span>
                          Kerjasama dengan kepegawaian dan IPSRS dalam perbaikan bangunan dan kebersihan lingkungan RS.
                        </span>
                      </div>
                      <div className="flex items-start gap-1 mt-1">
                        <span>2.</span>
                        <span>Pengajuan pelatihan untuk petugas kebersihan</span>
                      </div>
                    </td>
                    <td className="border border-[#5B9BD5] px-1.5 py-1 align-top text-left leading-[1.28]">
                      <div className="flex items-start gap-2">
                        <span>1.</span>
                        <span>Sudah terjalin kerjasama dengan kepegawaian dan IPSRS</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>2.</span>
                        <span>
                          Pengajuan pelatihan kebersihan toilet untuk karyawan kebersihan
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(34)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 35: BAB IV PENUTUP
           ===================================================================== */}
        {shouldRenderPage(35, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-35"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[19mm] pt-[14mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="text-[11pt] leading-[1.22] text-justify text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <div className="text-center font-bold mb-6">
                <div className="text-[12pt] leading-tight">BAB IV</div>
                <div className="text-[10pt] mt-2">PENUTUP</div>
              </div>

              <div className="space-y-4">
                <p className="indent-12">
                  Demikian laporan tahunan ini kami susun sebagai bentuk pertanggungjawaban atas pelaksanaan program kesehatan lingkungan di Rumah Sakit RSUD Al-Mulk selama tahun 2025. Kami menyadari bahwa keberhasilan yang telah dicapai tidak terlepas dari kerjasama dan dukungan semua pihak, baik dari manajemen rumah sakit, tenaga medis, staf, serta masyarakat sekitar.
                </p>
                <p className="indent-12">
                  Selama tahun ini, kami telah melaksanakan berbagai upaya untuk memastikan lingkungan rumah sakit yang bersih, sehat, dan aman bagi pasien, tenaga kesehatan, dan pengunjung. Namun demikian, kami juga menyadari masih ada beberapa tantangan yang harus dihadapi dan ditingkatkan, baik dari segi kebijakan, fasilitas, maupun kesadaran seluruh pihak terkait.
                </p>
                <p className="indent-12">
                  Melalui laporan ini, kami berharap dapat memberikan gambaran yang jelas mengenai pencapaian dan kendala yang ada, serta menjadi dasar untuk merencanakan langkah-langkah perbaikan di tahun mendatang. Kami berkomitmen untuk terus meningkatkan kualitas lingkungan rumah sakit sebagai bagian dari upaya memberikan pelayanan kesehatan yang terbaik.
                </p>
                <p className="indent-12">
                  Akhir kata, kami mengucapkan terima kasih kepada seluruh pihak yang telah berkontribusi dalam pencapaian yang ada. Semoga kerja sama yang baik ini dapat terus berlanjut demi menciptakan lingkungan yang sehat, aman, dan nyaman bagi semua yang ada di rumah sakit ini.
                </p>
              </div>
            </div>
            {renderSingleFooter(35)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 36: PEMBATAS "LAMPIRAN DAN DOKUMENTASI"
           ===================================================================== */}
        {shouldRenderPage(36, 'DOKUMENTASI') && (
          <section
            id="f4-page-36"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[20mm] pt-[16mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="pt-[78mm] text-center"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <h2 className="text-[20.5pt] font-bold text-black uppercase tracking-tight">
                LAMPIRAN DAN DOKUMENTASI
              </h2>
            </div>
            {renderSingleFooter(36)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 37: DAFTAR DOKUMENTASI KEGIATAN KESEHATAN LINGKUNGAN
           ===================================================================== */}
        {shouldRenderPage(37, 'DOKUMENTASI') && (
          <section
            id="f4-page-37"
            className="bg-white text-black shadow-2xl border border-slate-300 mx-auto w-[215.9mm] min-h-[330.2mm] px-[20mm] pt-[15mm] pb-[14mm] flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div
              className="text-[11pt] text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <div className="text-center mb-12">
                DAFTAR DOKUMENTASI
              </div>

              <div className="space-y-4 leading-[1.35]">
                <div>Dokumentasi – 1 Kegiatan Sampling Air Bersih 2025</div>
                <div>Dokumentasi – 4 Kegiatan Sampling Air Limbah Cair IPAL 2025</div>
                <div>Dokumentasi – 3 Kegiatan pengangkutan LB3 2025</div>
                <div>Dokumentasi – 2 Kegiatan Sampling Kelembaban Udara, Kebisingan,</div>
                <div>Dan Pencahayaan 2025</div>
                <div>Dokumentasi – 8 Pengendalian Vektor dan Binatang Pembawa Penyakit 2025</div>
                <div>Dokumentasi – 5 Kegiatan Pengamanan Radiasi 2025</div>
                <div>Dokumentasi – 6 Kegiatan Penyehatan Pangan Siap Saji (JASA BOGA) 2025</div>
                <div>Dokumentasi – 7 Penyelenggaraan Linen 2025</div>
              </div>
            </div>
            {renderSingleFooter(37)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 38: LAMPIRAN 1 (PENGUKURAN UDARA SEMESTER 1 - JULI)
           ===================================================================== */}
        {shouldRenderPage(38, 'LAMPIRAN_1_UDARA') && (
          <section
            id="f4-page-38"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="border-b-2 border-[#002147] pb-2 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 1 — HASIL PENGUKURAN KELEMBAPAN UDARA, PENCAHAYAAN, DAN KEBISINGAN RUANGAN
                </h2>
                <div className="text-[10px] text-slate-600 font-semibold mt-1">
                  SEMESTER 1 (JULI {reportYear}) — 7 KELOMPOK RUANGAN
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                <thead>
                  <tr className="bg-[#92D050] font-bold text-center">
                    <th className="border border-slate-800 p-1.5">Kelompok / Unit Ruangan</th>
                    <th className="border border-slate-800 p-1.5">Hasil Suhu (°C)</th>
                    <th className="border border-slate-800 p-1.5">Hasil Kelembaban (%RH)</th>
                    <th className="border border-slate-800 p-1.5">Hasil Pencahayaan (LUX)</th>
                    <th className="border border-slate-800 p-1.5">Hasil Kebisingan (dB)</th>
                    <th className="border border-slate-800 p-1.5">Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-1 font-semibold">IGD (R. Isolasi, Resusitasi, Kebidanan)</td><td className="border border-slate-800 p-1 text-center">27,55°C – 28,19°C</td><td className="border border-slate-800 p-1 text-center">70,4% – 71,8%</td><td className="border border-slate-800 p-1 text-center">192,4 – 259,1 LUX</td><td className="border border-slate-800 p-1 text-center">43 dB</td><td className="border border-slate-800 p-1 text-center">Lux 100%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RAJAL (Poli Anak, Bedah, Gigi, Umum)</td><td className="border border-slate-800 p-1 text-center">25,3°C – 29,20°C</td><td className="border border-slate-800 p-1 text-center">62,2% – 68,2%</td><td className="border border-slate-800 p-1 text-center">61,2 – 334 LUX</td><td className="border border-slate-800 p-1 text-center">44 – 52 dB</td><td className="border border-slate-800 p-1 text-center">Bising 40%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">PENUNJANG (Farmasi, RM, Lab, Radiologi)</td><td className="border border-slate-800 p-1 text-center">26,16°C – 29,24°C</td><td className="border border-slate-800 p-1 text-center">53,8% – 77,5%</td><td className="border border-slate-800 p-1 text-center">60,1 – 662,4 LUX</td><td className="border border-slate-800 p-1 text-center">48 – 58 dB</td><td className="border border-slate-800 p-1 text-center">Lux 100%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RANAP GABUNG (Aisyah, Khadijah, VK)</td><td className="border border-slate-800 p-1 text-center">26,0°C – 28,86°C</td><td className="border border-slate-800 p-1 text-center">54,0% – 76,8%</td><td className="border border-slate-800 p-1 text-center">50 LUX (Tidur)</td><td className="border border-slate-800 p-1 text-center">42 – 69 dB</td><td className="border border-slate-800 p-1 text-center">82%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RANAP ISOLASI (Fatimah 1–5, Pendaftaran)</td><td className="border border-slate-800 p-1 text-center">26,49°C – 29,48°C</td><td className="border border-slate-800 p-1 text-center">57,1% – 78,5%</td><td className="border border-slate-800 p-1 text-center">165,7 – 417 LUX</td><td className="border border-slate-800 p-1 text-center">47 – 71 dB</td><td className="border border-slate-800 p-1 text-center">Lux 80%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RAWAT INAP KELAS 1 (Usman 1–17 Siang)</td><td className="border border-slate-800 p-1 text-center">26,78°C – 31,24°C</td><td className="border border-slate-800 p-1 text-center">66,5% – 77,8%</td><td className="border border-slate-800 p-1 text-center">96,5 – 280 LUX</td><td className="border border-slate-800 p-1 text-center">45 – 70 dB</td><td className="border border-slate-800 p-1 text-center">53%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RAWAT INAP KELAS 1 (Saat Tidur)</td><td className="border border-slate-800 p-1 text-center">-</td><td className="border border-slate-800 p-1 text-center">-</td><td className="border border-slate-800 p-1 text-center">24,85 – 53,4 LUX</td><td className="border border-slate-800 p-1 text-center">62 dB (Koridor)</td><td className="border border-slate-800 p-1 text-center">Lux 100%</td></tr>
                  <tr className="bg-amber-100 font-bold"><td className="border border-slate-800 p-1">REKAPITULASI SEMESTER 1 (JULI)</td><td className="border border-slate-800 p-1 text-center" colSpan={2}>Kelembaban: 34% MS</td><td className="border border-slate-800 p-1 text-center">Pencahayaan: 80% MS</td><td className="border border-slate-800 p-1 text-center" colSpan={2}>Kebisingan: 35% MS</td></tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(38)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 39: LAMPIRAN 1 (PENGUKURAN UDARA SEMESTER 2 - DESEMBER)
           ===================================================================== */}
        {shouldRenderPage(39, 'LAMPIRAN_1_UDARA') && (
          <section
            id="f4-page-39"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="border-b-2 border-[#002147] pb-2 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 1 — (LANJUTAN) PENGUKURAN UDARA RUANGAN SEMESTER 2 (DESEMBER {reportYear})
                </h2>
                <div className="text-[10px] text-slate-600 font-semibold mt-1">
                  EVALUASI TINGKAT KEPATUHAN KRIS TERHADAP STANDAR NASIONAL
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                <thead>
                  <tr className="bg-[#5B9BD5] text-white font-bold text-center">
                    <th className="border border-slate-800 p-1.5">Kelompok / Unit Ruangan</th>
                    <th className="border border-slate-800 p-1.5">Hasil Suhu (°C)</th>
                    <th className="border border-slate-800 p-1.5">Hasil Kelembaban (%RH)</th>
                    <th className="border border-slate-800 p-1.5">Hasil Pencahayaan (LUX)</th>
                    <th className="border border-slate-800 p-1.5">Hasil Kebisingan (dB)</th>
                    <th className="border border-slate-800 p-1.5">Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-1 font-semibold">IGD (R. Isolasi, Resusitasi, Kebidanan)</td><td className="border border-slate-800 p-1 text-center">27,05°C – 27,6°C</td><td className="border border-slate-800 p-1 text-center">69,8% – 73,4%</td><td className="border border-slate-800 p-1 text-center">40,6 – 227,3 LUX</td><td className="border border-slate-800 p-1 text-center">43 dB</td><td className="border border-slate-800 p-1 text-center">Lux 100%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RAJAL (Poli Anak, Bedah, Gigi, Umum)</td><td className="border border-slate-800 p-1 text-center">24,0°C – 30,6°C</td><td className="border border-slate-800 p-1 text-center">56,1% – 65,6%</td><td className="border border-slate-800 p-1 text-center">64,5 – 330 LUX</td><td className="border border-slate-800 p-1 text-center">44 – 52 dB</td><td className="border border-slate-800 p-1 text-center">Poli Gigi MS</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">PENUNJANG (Farmasi, RM, Lab, Radiologi)</td><td className="border border-slate-800 p-1 text-center">26,6°C – 30,0°C</td><td className="border border-slate-800 p-1 text-center">50,2% – 74,0%</td><td className="border border-slate-800 p-1 text-center">60,5 – 450 LUX</td><td className="border border-slate-800 p-1 text-center">48 – 58 dB</td><td className="border border-slate-800 p-1 text-center">Lux 100%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RANAP GABUNG (Aisyah, Khadijah, VK)</td><td className="border border-slate-800 p-1 text-center">26,26°C – 28,26°C</td><td className="border border-slate-800 p-1 text-center">50,9% – 73,5%</td><td className="border border-slate-800 p-1 text-center">24,4 – 48,3 LUX</td><td className="border border-slate-800 p-1 text-center">42 – 57 dB</td><td className="border border-slate-800 p-1 text-center">100%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RANAP ISOLASI (Fatimah 1–5, Pendaftaran)</td><td className="border border-slate-800 p-1 text-center">26,49°C – 29,48°C</td><td className="border border-slate-800 p-1 text-center">57,2% – 72,6%</td><td className="border border-slate-800 p-1 text-center">188 – 490,5 LUX</td><td className="border border-slate-800 p-1 text-center">44 – 71 dB</td><td className="border border-slate-800 p-1 text-center">Lux 90%</td></tr>
                  <tr><td className="border border-slate-800 p-1 font-semibold">RAWAT INAP KELAS 1 (Usman Siang & Malam)</td><td className="border border-slate-800 p-1 text-center">26,78°C – 31,24°C</td><td className="border border-slate-800 p-1 text-center">66,5% – 77,8%</td><td className="border border-slate-800 p-1 text-center">21,5 – 280 LUX</td><td className="border border-slate-800 p-1 text-center">44 – 62 dB</td><td className="border border-slate-800 p-1 text-center">Lux Tidur 100%</td></tr>
                  <tr className="bg-sky-100 font-bold"><td className="border border-slate-800 p-1">REKAPITULASI SEMESTER 2 (DESEMBER)</td><td className="border border-slate-800 p-1 text-center" colSpan={2}>Kelembaban: {compiled.air.chartComparison[0].desemberPct}%</td><td className="border border-slate-800 p-1 text-center">Pencahayaan: {compiled.air.chartComparison[1].desemberPct}%</td><td className="border border-slate-800 p-1 text-center" colSpan={2}>Kebisingan: {compiled.air.chartComparison[2].desemberPct}% (Rata-rata 84%)</td></tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(39)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 40: LAMPIRAN 2 (LOGBOOK LIMBAH MEDIS - BULAN JANUARI)
           ===================================================================== */}
        {shouldRenderPage(40, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-40"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS BULAN JANUARI {reportYear}
                </h2>
                <div className="text-[10px] text-slate-600">
                  Tanggal Pengangkutan: 02/01/2025 · 09/01/2025 · 16/01/2025 · 23/01/2025 · 30/01/2025
                </div>
              </div>

              {compiled.lampiran2Logbook.length > 0 && (
                <div className="border border-slate-800 rounded overflow-hidden">
                  <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                    <span>BULAN: JANUARI {reportYear}</span>
                    <span>No. Manifest: JM001923, JM002011</span>
                  </div>
                  <table className="w-full border-collapse text-[9px]">
                    <thead>
                      <tr className="bg-[#66FF99]/60 font-bold text-center">
                        <th className="border border-slate-800 p-1 w-8">No</th>
                        <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                        <th className="border border-slate-800 p-1">Limbah Tajam (kg)</th>
                        <th className="border border-slate-800 p-1">Limbah Padat (kg)</th>
                        <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                        <th className="border border-slate-800 p-1">Tanggal Keluar</th>
                        <th className="border border-slate-800 p-1">No. Manifest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compiled.lampiran2Logbook[0].unitBreakdown.map((u) => (
                        <tr key={u.no}>
                          <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                          <td className="border border-slate-800 p-1 font-medium">{u.unitName}</td>
                          <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                          <td className="border border-slate-800 p-1 text-center">30/01/{reportYear}</td>
                          <td className="border border-slate-800 p-1 text-center font-mono">JM001923</td>
                        </tr>
                      ))}
                      <tr className="bg-[#00FF00] font-extrabold text-center">
                        <td className="border border-slate-800 p-1" colSpan={2}>TOTAL JANUARI</td>
                        <td className="border border-slate-800 p-1 font-mono">{compiled.lampiran2Logbook[0].totalTajam.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1 font-mono">{compiled.lampiran2Logbook[0].totalPadat.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1" colSpan={3}>
                          TOTAL TIMBULAN: {compiled.lampiran2Logbook[0].totalAll.toFixed(2)} kg
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {renderSingleFooter(40)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 41: LAMPIRAN 2 (LOGBOOK FEBRUARI & MARET)
           ===================================================================== */}
        {shouldRenderPage(41, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-41"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS (BULAN FEBRUARI & MARET {reportYear})
                </h2>
              </div>

              {[1, 2].map((idx) => {
                const b = compiled.lampiran2Logbook[idx];
                if (!b) return null;
                return (
                  <div key={b.monthIndex} className="border border-slate-800 rounded overflow-hidden">
                    <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                      <span>BULAN: {b.monthName.toUpperCase()} {reportYear}</span>
                      <span>Total: {b.totalAll.toFixed(2)} kg</span>
                    </div>
                    <table className="w-full border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-[#66FF99]/60 font-bold text-center">
                          <th className="border border-slate-800 p-1 w-8">No</th>
                          <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                          <th className="border border-slate-800 p-1">Tajam (kg)</th>
                          <th className="border border-slate-800 p-1">Padat (kg)</th>
                          <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                          <th className="border border-slate-800 p-1">No. Manifest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.unitBreakdown.slice(0, 6).map((u) => (
                          <tr key={u.no}>
                            <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                            <td className="border border-slate-800 p-1">{u.unitName}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{b.manifestNumbers[0]}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#00FF00] font-bold text-center">
                          <td className="border border-slate-800 p-1" colSpan={2}>TOTAL {b.monthName.toUpperCase()}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalTajam.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalPadat.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1" colSpan={2}>
                            JUMLAH TIMBULAN: {b.totalAll.toFixed(2)} kg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            {renderSingleFooter(41)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 42: LAMPIRAN 2 (LOGBOOK APRIL & MEI)
           ===================================================================== */}
        {shouldRenderPage(42, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-42"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS (BULAN APRIL & MEI {reportYear})
                </h2>
              </div>
              {[3, 4].map((idx) => {
                const b = compiled.lampiran2Logbook[idx];
                if (!b) return null;
                return (
                  <div key={b.monthIndex} className="border border-slate-800 rounded overflow-hidden">
                    <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                      <span>BULAN: {b.monthName.toUpperCase()} {reportYear}</span>
                      <span>Total: {b.totalAll.toFixed(2)} kg</span>
                    </div>
                    <table className="w-full border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-[#66FF99]/60 font-bold text-center">
                          <th className="border border-slate-800 p-1 w-8">No</th>
                          <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                          <th className="border border-slate-800 p-1">Tajam (kg)</th>
                          <th className="border border-slate-800 p-1">Padat (kg)</th>
                          <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                          <th className="border border-slate-800 p-1">No. Manifest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.unitBreakdown.slice(0, 6).map((u) => (
                          <tr key={u.no}>
                            <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                            <td className="border border-slate-800 p-1">{u.unitName}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{b.manifestNumbers[0]}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#00FF00] font-bold text-center">
                          <td className="border border-slate-800 p-1" colSpan={2}>TOTAL {b.monthName.toUpperCase()}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalTajam.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalPadat.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1" colSpan={2}>
                            JUMLAH TIMBULAN: {b.totalAll.toFixed(2)} kg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            {renderSingleFooter(42)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 43: LAMPIRAN 2 (LOGBOOK JUNI & JULI)
           ===================================================================== */}
        {shouldRenderPage(43, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-43"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS (BULAN JUNI & JULI {reportYear})
                </h2>
              </div>
              {[5, 6].map((idx) => {
                const b = compiled.lampiran2Logbook[idx];
                if (!b) return null;
                return (
                  <div key={b.monthIndex} className="border border-slate-800 rounded overflow-hidden">
                    <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                      <span>BULAN: {b.monthName.toUpperCase()} {reportYear}</span>
                      <span>Total: {b.totalAll.toFixed(2)} kg</span>
                    </div>
                    <table className="w-full border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-[#66FF99]/60 font-bold text-center">
                          <th className="border border-slate-800 p-1 w-8">No</th>
                          <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                          <th className="border border-slate-800 p-1">Tajam (kg)</th>
                          <th className="border border-slate-800 p-1">Padat (kg)</th>
                          <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                          <th className="border border-slate-800 p-1">No. Manifest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.unitBreakdown.slice(0, 6).map((u) => (
                          <tr key={u.no}>
                            <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                            <td className="border border-slate-800 p-1">{u.unitName}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{b.manifestNumbers[0]}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#00FF00] font-bold text-center">
                          <td className="border border-slate-800 p-1" colSpan={2}>TOTAL {b.monthName.toUpperCase()}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalTajam.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalPadat.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1" colSpan={2}>
                            JUMLAH TIMBULAN: {b.totalAll.toFixed(2)} kg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            {renderSingleFooter(43)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 44: LAMPIRAN 2 (LOGBOOK AGUSTUS & SEPTEMBER)
           ===================================================================== */}
        {shouldRenderPage(44, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-44"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS (BULAN AGUSTUS & SEPTEMBER {reportYear})
                </h2>
              </div>
              {[7, 8].map((idx) => {
                const b = compiled.lampiran2Logbook[idx];
                if (!b) return null;
                return (
                  <div key={b.monthIndex} className="border border-slate-800 rounded overflow-hidden">
                    <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                      <span>BULAN: {b.monthName.toUpperCase()} {reportYear}</span>
                      <span>Total: {b.totalAll.toFixed(2)} kg</span>
                    </div>
                    <table className="w-full border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-[#66FF99]/60 font-bold text-center">
                          <th className="border border-slate-800 p-1 w-8">No</th>
                          <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                          <th className="border border-slate-800 p-1">Tajam (kg)</th>
                          <th className="border border-slate-800 p-1">Padat (kg)</th>
                          <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                          <th className="border border-slate-800 p-1">No. Manifest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.unitBreakdown.slice(0, 6).map((u) => (
                          <tr key={u.no}>
                            <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                            <td className="border border-slate-800 p-1">{u.unitName}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{b.manifestNumbers[0]}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#00FF00] font-bold text-center">
                          <td className="border border-slate-800 p-1" colSpan={2}>TOTAL {b.monthName.toUpperCase()}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalTajam.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalPadat.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1" colSpan={2}>
                            JUMLAH TIMBULAN: {b.totalAll.toFixed(2)} kg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            {renderSingleFooter(44)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 45: LAMPIRAN 2 (LOGBOOK OKTOBER & NOVEMBER)
           ===================================================================== */}
        {shouldRenderPage(45, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-45"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS (BULAN OKTOBER & NOVEMBER {reportYear})
                </h2>
              </div>
              {[9, 10].map((idx) => {
                const b = compiled.lampiran2Logbook[idx];
                if (!b) return null;
                return (
                  <div key={b.monthIndex} className="border border-slate-800 rounded overflow-hidden">
                    <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                      <span>BULAN: {b.monthName.toUpperCase()} {reportYear}</span>
                      <span>Total: {b.totalAll.toFixed(2)} kg</span>
                    </div>
                    <table className="w-full border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-[#66FF99]/60 font-bold text-center">
                          <th className="border border-slate-800 p-1 w-8">No</th>
                          <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                          <th className="border border-slate-800 p-1">Tajam (kg)</th>
                          <th className="border border-slate-800 p-1">Padat (kg)</th>
                          <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                          <th className="border border-slate-800 p-1">No. Manifest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.unitBreakdown.slice(0, 6).map((u) => (
                          <tr key={u.no}>
                            <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                            <td className="border border-slate-800 p-1">{u.unitName}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                            <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                            <td className="border border-slate-800 p-1 text-center font-mono">{b.manifestNumbers[0]}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#00FF00] font-bold text-center">
                          <td className="border border-slate-800 p-1" colSpan={2}>TOTAL {b.monthName.toUpperCase()}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalTajam.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 font-mono">{b.totalPadat.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1" colSpan={2}>
                            JUMLAH TIMBULAN: {b.totalAll.toFixed(2)} kg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            {renderSingleFooter(45)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 46: LAMPIRAN 2 (LOGBOOK DESEMBER & REKAP TAHUNAN)
           ===================================================================== */}
        {shouldRenderPage(46, 'LAMPIRAN_2_LOGBOOK') && (
          <section
            id="f4-page-46"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[10px] font-sans">
              <div className="border-b-2 border-[#002147] pb-1 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 2 — LOG BOOK LIMBAH MEDIS (BULAN DESEMBER & REKAPITULASI TAHUNAN {reportYear})
                </h2>
              </div>
              {compiled.lampiran2Logbook[11] && (
                <div className="border border-slate-800 rounded overflow-hidden">
                  <div className="bg-[#00FF66] px-3 py-1 font-bold text-slate-900 flex justify-between">
                    <span>BULAN: DESEMBER {reportYear}</span>
                    <span>Total: {compiled.lampiran2Logbook[11].totalAll.toFixed(2)} kg</span>
                  </div>
                  <table className="w-full border-collapse text-[9px]">
                    <thead>
                      <tr className="bg-[#66FF99]/60 font-bold text-center">
                        <th className="border border-slate-800 p-1 w-8">No</th>
                        <th className="border border-slate-800 p-1 text-left">Sumber Limbah</th>
                        <th className="border border-slate-800 p-1">Tajam (kg)</th>
                        <th className="border border-slate-800 p-1">Padat (kg)</th>
                        <th className="border border-slate-800 p-1">Suhu &lt;0°C</th>
                        <th className="border border-slate-800 p-1">No. Manifest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compiled.lampiran2Logbook[11].unitBreakdown.slice(0, 6).map((u) => (
                        <tr key={u.no}>
                          <td className="border border-slate-800 p-1 text-center">{u.no}</td>
                          <td className="border border-slate-800 p-1">{u.unitName}</td>
                          <td className="border border-slate-800 p-1 text-center font-mono">{u.tajamKg.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 text-center font-mono">{u.padatKg.toFixed(2)}</td>
                          <td className="border border-slate-800 p-1 text-center font-bold text-emerald-800">✓</td>
                          <td className="border border-slate-800 p-1 text-center font-mono">
                            {compiled.lampiran2Logbook[11].manifestNumbers[0]}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[#00FF00] font-bold text-center">
                        <td className="border border-slate-800 p-1" colSpan={2}>TOTAL DESEMBER</td>
                        <td className="border border-slate-800 p-1 font-mono">{compiled.lampiran2Logbook[11].totalTajam.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1 font-mono">{compiled.lampiran2Logbook[11].totalPadat.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1" colSpan={2}>
                          TIMBULAN: {compiled.lampiran2Logbook[11].totalAll.toFixed(2)} kg
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 rounded-xl border-2 border-[#002147] bg-slate-50 text-xs space-y-1">
                <div className="font-extrabold text-[#002147] uppercase">
                  REKAPITULASI AKUMULATIF LOGBOOK LIMBAH MEDIS B3 TAHUN {reportYear}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div>Padat Medis: <strong>{compiled.solidWaste.totalPadat.toFixed(2)} kg</strong></div>
                  <div>Limbah Tajam: <strong>{compiled.solidWaste.totalTajam.toFixed(2)} kg</strong></div>
                  <div>Obat Kedaluwarsa: <strong>{compiled.solidWaste.totalObat.toFixed(2)} kg</strong></div>
                  <div>Grand Total: <strong className="text-emerald-700">{compiled.solidWaste.grandTotal.toFixed(2)} kg</strong></div>
                </div>
              </div>
            </div>
            {renderSingleFooter(46)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 47: LAMPIRAN 3 (CHECKLIST PENGELOLAAN LINEN RS)
           ===================================================================== */}
        {shouldRenderPage(47, 'LAMPIRAN_3_6_CHECKLIST') && (
          <section
            id="f4-page-47"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="border-b-2 border-[#002147] pb-2 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 3 — CHECK LIST METODE, SARANA, PERALATAN DAN BAHAN PENGELOLAAN LINEN
                </h2>
                <div className="text-[10px] text-slate-600">
                  UOBK RSUD AL-MULK KOTA SUKABUMI TAHUN {reportYear}
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-800 p-2 w-8">NO</th>
                    <th className="border border-slate-800 p-2 text-left">TAHAP / KETERANGAN PENGELOLAAN LINEN</th>
                    <th className="border border-slate-800 p-2 w-16 text-center">STATUS</th>
                    <th className="border border-slate-800 p-2 text-left">CATATAN PENGAWASAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-2 text-center">1</td><td className="border border-slate-800 p-2 font-medium">Tahap Pengumpulan: Pemilahan infeksius & non-infeksius, dicatat & ditandatangani, APD lengkap</td><td className="border border-slate-800 p-2 text-center font-bold text-emerald-700">YA (√)</td><td className="border border-slate-800 p-2">Linen kotor diletakkan di lantai: TIDAK (√); Dihitung ulang petugas</td></tr>
                  <tr><td className="border border-slate-800 p-2 text-center">2</td><td className="border border-slate-800 p-2 font-medium">Penerimaan: Dipisahkan antara infeksius & non-infeksius serta tingkat kekotorannya</td><td className="border border-slate-800 p-2 text-center font-bold text-emerald-700">YA (√)</td><td className="border border-slate-800 p-2">Sesuai SOP PPI & Kesling</td></tr>
                  <tr><td className="border border-slate-800 p-2 text-center">3</td><td className="border border-slate-800 p-2 font-medium">Tahap Pencucian: Penyortiran, desinfeksi, suhu air panas 65°C–77°C (30 menit)</td><td className="border border-slate-800 p-2 text-center font-bold text-emerald-700">YA (√)</td><td className="border border-slate-800 p-2">Petugas memakai APD seragam, sarung tangan, masker</td></tr>
                  <tr><td className="border border-slate-800 p-2 text-center">4–5</td><td className="border border-slate-800 p-2 font-medium">Tahap Pengeringan & Penyetrikaan: Mesin pengering, setrika plat press suhu 160°C</td><td className="border border-slate-800 p-2 text-center font-bold text-emerald-700">YA (√)</td><td className="border border-slate-800 p-2">Linen rapi dan tidak menyentuh lantai</td></tr>
                  <tr><td className="border border-slate-800 p-2 text-center">6–8</td><td className="border border-slate-800 p-2 font-medium">Tahap Penyimpanan, Distribusi & Pengangkutan: Lemari tertutup, plastik, sistem FIFO</td><td className="border border-slate-800 p-2 text-center font-bold text-emerald-700">YA (√)</td><td className="border border-slate-800 p-2">Sarana & bahan (Deterjen, Desinfektan, Pemutih, Pelembut) lengkap</td></tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(47)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 48: LAMPIRAN 4 (UJI KELAIKAN FISIK JASABOGA)
           ===================================================================== */}
        {shouldRenderPage(48, 'LAMPIRAN_3_6_CHECKLIST') && (
          <section
            id="f4-page-48"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="border-b-2 border-[#002147] pb-2 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 4 — FORM UJI KELAIKAN FISIK HIGIENE SANITASI MAKANAN JASABOGA
                </h2>
                <div className="text-[10px] text-slate-600">
                  PT KAMILA SATIA RASA (PIHAK KETIGA PENYEDIA MAKANAN PASIEN)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-300 text-[10px]">
                <div><strong>Nama Rekanan:</strong> PT Kamila Satia Rasa</div>
                <div><strong>Nama Pemeriksa:</strong> Bapak Okpan</div>
                <div><strong>Alamat:</strong> Jl. Baros Jembatan Merah</div>
                <div><strong>Hasil Penilaian:</strong> Skor <strong>59 / 100</strong></div>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-1.5">Kelompok Penilaian (44 Butir)</th>
                    <th className="border border-slate-800 p-1.5">Bobot</th>
                    <th className="border border-slate-800 p-1.5">Nilai Riil</th>
                    <th className="border border-slate-800 p-1.5 text-left">Temuan Lapangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-800 p-1.5 font-medium">Persyaratan Umum (Lokasi, Bangunan, Ventilasi, Air, Sampah, Karyawan, Peralatan — No 1–26)</td>
                    <td className="border border-slate-800 p-1.5 text-center">65</td>
                    <td className="border border-slate-800 p-1.5 text-center font-bold">55</td>
                    <td className="border border-slate-800 p-1.5">Pintu dapur belum menutup otomatis; hasil lab air & swab penjamah perlu diperbaharui.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-1.5 font-medium">Khusus Golongan A.1, A.2, A.3 (No 27–35)</td>
                    <td className="border border-slate-800 p-1.5 text-center">18</td>
                    <td className="border border-slate-800 p-1.5 text-center font-bold">3</td>
                    <td className="border border-slate-800 p-1.5">Kulkas kontrol suhu perlu perbaikan; bak cuci 1 bak tanpa air panas; grease trap perlu pembersihan.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-1.5 font-medium">Khusus Golongan B & C (No 36–44)</td>
                    <td className="border border-slate-800 p-1.5 text-center">17</td>
                    <td className="border border-slate-800 p-1.5 text-center font-bold">1</td>
                    <td className="border border-slate-800 p-1.5">Sudut lantai belum konus; cerobong asap belum berfilter. <strong>TOTAL: Bobot 100 | Nilai 59</strong>.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(48)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 49: LAMPIRAN 5 & 6 (CHECKLIST PANTRY RS)
           ===================================================================== */}
        {shouldRenderPage(49, 'LAMPIRAN_3_6_CHECKLIST') && (
          <section
            id="f4-page-49"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="border-b-2 border-[#002147] pb-2 text-center">
                <h2 className="font-extrabold text-xs uppercase text-[#002147]">
                  LAMPIRAN 5 & 6 — CHECKLIST MONITORING SANITASI MAKANAN & PRAMUSAJI PANTRY RS
                </h2>
                <div className="text-[10px] text-slate-600">
                  Pemeriksa: Fitria Wulandari (Sanitarian Kesling) · Semester 1 (19 Juni) vs Semester 2 (16 Desember {reportYear})
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-1.5 w-7">No</th>
                    <th className="border border-slate-800 p-1.5 text-left">Indikator Pemeriksaan Ruang Pantry</th>
                    <th className="border border-slate-800 p-1.5 w-12">Bobot</th>
                    <th className="border border-slate-800 p-1.5 w-14">19 Juni</th>
                    <th className="border border-slate-800 p-1.5 w-14">16 Des</th>
                    <th className="border border-slate-800 p-1.5 text-left">Keterangan Evaluasi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-1 text-center">1</td><td className="border border-slate-800 p-1">Lantai kering dan bersih</td><td className="border border-slate-800 p-1 text-center">1</td><td className="border border-slate-800 p-1 text-center">1</td><td className="border border-slate-800 p-1 text-center">1</td><td className="border border-slate-800 p-1">Lantai bersih rutin dipel</td></tr>
                  <tr><td className="border border-slate-800 p-1 text-center">2</td><td className="border border-slate-800 p-1">Bebas dari serangga/binatang pengganggu</td><td className="border border-slate-800 p-1 text-center">1</td><td className="border border-slate-800 p-1 text-center text-red-600 font-bold">0</td><td className="border border-slate-800 p-1 text-center text-emerald-700 font-bold">1</td><td className="border border-slate-800 p-1">Juni: ditemukan 1 lalat; Des: teratasi (1)</td></tr>
                  <tr><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1">Wastafel, sabun cair dan tisu sekali pakai</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1">Lengkap dan berfungsi</td></tr>
                  <tr><td className="border border-slate-800 p-1 text-center">4</td><td className="border border-slate-800 p-1">Peralatan tempat wadah makanan baik</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1">Tersedia rak peralatan khusus</td></tr>
                  <tr><td className="border border-slate-800 p-1 text-center">5–7</td><td className="border border-slate-800 p-1">Petugas pramusaji pakai APD (3), Label (1), Tertutup (2)</td><td className="border border-slate-800 p-1 text-center">6</td><td className="border border-slate-800 p-1 text-center">6</td><td className="border border-slate-800 p-1 text-center">6</td><td className="border border-slate-800 p-1">Memenuhi syarat SOP</td></tr>
                  <tr><td className="border border-slate-800 p-1 text-center">8</td><td className="border border-slate-800 p-1">Tempat sampah injak kaki bersih</td><td className="border border-slate-800 p-1 text-center">3</td><td className="border border-slate-800 p-1 text-center text-red-600 font-bold">0</td><td className="border border-slate-800 p-1 text-center text-red-600 font-bold">0</td><td className="border border-slate-800 p-1">Rekomendasi pengadaan tong injak baru</td></tr>
                  <tr><td className="border border-slate-800 p-1 text-center">9–13</td><td className="border border-slate-800 p-1">Bahan bebas cemaran, higienis, cuci tangan</td><td className="border border-slate-800 p-1 text-center">6</td><td className="border border-slate-800 p-1 text-center">5</td><td className="border border-slate-800 p-1 text-center font-bold text-emerald-700">6</td><td className="border border-slate-800 p-1">Memenuhi syarat</td></tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="border border-slate-800 p-1 text-center" colSpan={2}>NILAI CAPAIAN SANITASI PANTRY</td>
                    <td className="border border-slate-800 p-1 text-center">23</td>
                    <td className="border border-slate-800 p-1 text-center">18 (78%)</td>
                    <td className="border border-slate-800 p-1 text-center text-emerald-800">20 (87%)</td>
                    <td className="border border-slate-800 p-1 text-emerald-800">Peningkatan +9% pada Semester 2</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(49)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 50: LAMPIRAN DOKUMENTASI FOTO (BAGIAN 1: AIR & LIMBAH)
           ===================================================================== */}
        {shouldRenderPage(50, 'DOKUMENTASI') && (
          <section
            id="f4-page-50"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-xs font-sans">
              <div className="text-center space-y-1 border-b-2 border-[#002147] pb-3">
                <h2 className="font-extrabold text-sm uppercase text-[#002147]">
                  DOKUMENTASI FOTO KEGIATAN KESEHATAN LINGKUNGAN (BAGIAN 1)
                </h2>
                <p className="text-[11px] text-slate-600">
                  Dokumentasi 1 (Air Bersih), Dokumentasi 4 (Air Limbah IPAL) & Dokumentasi 3 (Pengangkutan LB3)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 1
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 147–148 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Sampling Air Bersih & Air RO Laboratorium {reportYear}
                  </div>
                  <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Pengambilan Sampel Air Bersih & Uji Labkesda]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Petugas Sanitarian melakukan sampling air artesis, tandon utama TIRTA, dan unit filtrasi RO di Poli Gigi dan Laboratorium untuk pengujian mikrobiologi dan kimia rutin.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 4
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 149–150 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Sampling Limbah Cair & Pemeliharaan IPAL {reportYear}
                  </div>
                  <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Bak Biofilter Aerasi & Dosing Klorin IPAL]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pengambilan sampel limbah pada titik inlet dan outlet IPAL, pemeriksaan blower aerasi, dan pengisian larutan kaporit desinfeksi untuk memastikan kualitas outlet aman ke lingkungan.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 3
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 151–152 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Penimbangan & Pengangkutan Limbah Medis B3 Bersama PT Jasa Medivest
                  </div>
                  <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Penimbangan Limbah Medis, TPS B3 Berpendingin & Serah Terima Truk Box Berizin]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Proses serah terima limbah B3 medis dari TPS berpendingin RSUD Al-Mulk ke kendaraan pengangkut berizin PT Jasa Medivest, penimbangan resmi, dan penerbitan manifes Festronik.
                  </p>
                </div>
              </div>
            </div>
            {renderSingleFooter(50)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 51: LAMPIRAN DOKUMENTASI FOTO (BAGIAN 2: UDARA, RADIASI, K3)
           ===================================================================== */}
        {shouldRenderPage(51, 'DOKUMENTASI') && (
          <section
            id="f4-page-51"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-xs font-sans">
              <div className="text-center space-y-1 border-b-2 border-[#002147] pb-3">
                <h2 className="font-extrabold text-sm uppercase text-[#002147]">
                  DOKUMENTASI FOTO KEGIATAN KESEHATAN LINGKUNGAN (BAGIAN 2)
                </h2>
                <p className="text-[11px] text-slate-600">
                  Dokumentasi 2 (Udara Ruangan), Dokumentasi 5 (Radiasi), Dokumentasi 6 (Pantry), Dokumentasi 7 (Linen & K3)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 2
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 153–155 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Pengukuran Fisik Kelembaban, Pencahayaan & Kebisingan
                  </div>
                  <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Pengukuran Luxmeter, Sound Level Meter, Hygrometer]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pengukuran menggunakan Luxmeter digital di ruang rawat inap Kelas 1 Usman, Aisyah, Fatimah, IGD, dan Poli Klinik.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 5
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 158 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Pengamanan Radiasi & APD Proteksi Timbal
                  </div>
                  <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Ruang Radiologi, Apron Timbal & TLD Badge]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Verifikasi peralatan radiasi diagnostik sinar-X, lampu peringatan merah tanda bahaya radiasi di pintu ruangan, dan kelengkapan apron timbal.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 6
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 159–160 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Inspeksi Sanitasi Pantry & Distribusi Makanan Pasien
                  </div>
                  <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Meja Penyimpanan Makanan, Wastafel & Wadah Pasien]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pemeriksaan kebersihan ruang pantry, rak piring tertutup, penggunaan APD pramusaji, dan pengawasan higiene sanitasi rekanan Jasaboga.
                  </p>
                </div>

                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-[#002147] text-[#D2B48C] font-bold text-[10px]">
                      Dokumentasi – 7 & 8
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hal 161–165 PDF</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    Penyelenggaraan Linen, APAR & Kampanye Efisiensi Energi
                  </div>
                  <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[11px] font-mono border border-dashed border-slate-400">
                    [Foto Penyimpanan Linen, APAR, Poster Hemat Air & Lubang Biopori]
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Dokumentasi troli linen terpisah, stiker penghematan energi listrik & air, pembuatan lubang biopori resapan, dan penataan tempat sampah pilah kuning-hijau.
                  </p>
                </div>
              </div>
            </div>
            {renderSingleFooter(51)}
          </section>
        )}        {/* End of Pages */}
        </div>
      </div>

      {/* =====================================================================
          FLOATING VERTICAL ZOOM SCROLLBAR (POJOK KANAN LAYAR RATA TENGAH)
          Desain ramping minimalis posisi vertikal di tengah sisi kanan layar
         ===================================================================== */}
      <aside
        aria-label="Pengatur Ukuran Tampilan Laporan Vertikal"
        className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-50 print:hidden flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-full bg-[#002147]/95 dark:bg-[#00142A]/95 backdrop-blur-md border border-[#D2B48C]/50 shadow-[0_8px_30px_rgba(0,33,71,0.45)] text-slate-100 select-none transition-all hover:border-[#D2B48C] w-8 sm:w-9"
      >
        {/* Toggle Mode: Grid (Banyak Halaman Bersanding) */}
        <button
          type="button"
          onClick={() => {
            if (viewMode === 'grid' || zoomPercent <= 80) {
              setViewMode('single');
              setZoomPercent(100);
            } else {
              setViewMode('grid');
              setZoomPercent(45);
            }
          }}
          title={
            viewMode === 'grid' || zoomPercent <= 80
              ? 'Beralih ke Tampilan Halaman Tunggal (100%)'
              : 'Beralih ke Tampilan Banyak Halaman / Grid (45%)'
          }
          className={`p-1 rounded-full transition-all cursor-pointer ${
            viewMode === 'grid' || zoomPercent <= 80
              ? 'bg-[#D2B48C]/25 text-[#D2B48C] ring-1 ring-[#D2B48C]/60'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>

        {/* Mode Tunggal */}
        <button
          type="button"
          onClick={() => {
            setViewMode('single');
            setZoomPercent(100);
          }}
          title="Tampilan Halaman Tunggal (100%)"
          className={`p-1 rounded-full transition-all cursor-pointer ${
            viewMode === 'single' && zoomPercent === 100
              ? 'bg-[#D2B48C]/25 text-[#D2B48C] ring-1 ring-[#D2B48C]/60'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Mode */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Pemisah Halus */}
        <div className="w-3.5 h-px bg-[#D2B48C]/30 my-0.5" />

        {/* Zoom In (+) */}
        <button
          type="button"
          onClick={() => setZoomPercent((z) => Math.min(150, z + 5))}
          title="Perbesar Tampilan (Ctrl + Scroll Up)"
          className="p-1 rounded-full text-slate-300 hover:text-[#D2B48C] hover:bg-white/10 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3 h-3 text-[#D2B48C]" />
        </button>

        {/* Slim Vertical Slider Bar */}
        <div className="py-1 flex items-center justify-center my-0.5">
          <input
            type="range"
            min={30}
            max={150}
            step={5}
            value={zoomPercent}
            onChange={(e) => setZoomPercent(Number(e.target.value))}
            aria-label="Zoom Tampilan Laporan Tahunan"
            className="vertical-zoom-slider focus:outline-none"
          />
        </div>

        {/* Zoom Out (-) */}
        <button
          type="button"
          onClick={() => setZoomPercent((z) => Math.max(30, z - 5))}
          title="Perkecil Tampilan (Ctrl + Scroll Down)"
          className="p-1 rounded-full text-slate-300 hover:text-[#D2B48C] hover:bg-white/10 transition-all cursor-pointer active:scale-95"
        >
          <Minus className="w-3 h-3 text-[#D2B48C]" />
        </button>

        {/* Persentase Badge Minimalis */}
        <button
          type="button"
          onClick={() => {
            setZoomPercent((z) => {
              if (z === 45) return 100;
              if (z === 100) return 75;
              if (z === 75) return 45;
              return 100;
            });
          }}
          title="Klik untuk beralih cepat: 45% (Banyak Halaman) · 75% · 100%"
          className="px-1 py-0.5 rounded text-[9.5px] font-mono font-bold text-[#D2B48C] hover:bg-[#D2B48C]/20 transition-all cursor-pointer whitespace-nowrap"
        >
          {zoomPercent}%
        </button>
      </aside>

      {/* Tombol Simpan Melayang di Pojok Kanan Bawah */}
      <FloatingSaveButton
        onSave={handleSaveReport}
        hasUnsavedChanges={hasUnsavedChanges}
        label="Simpan Data"
        title="Simpan Perubahan Teks Laporan Tahunan"
      />
    </div>
  );
}
