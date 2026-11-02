'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
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

export type ReportSectionFilter =
  | 'ALL'
  | 'COVER_PENDAHULUAN'
  | 'BAB_3_MONITORING'
  | 'BAB_3_EVALUASI_PENUTUP'
  | 'LAMPIRAN_1_UDARA'
  | 'LAMPIRAN_2_LOGBOOK'
  | 'LAMPIRAN_3_6_CHECKLIST'
  | 'DOKUMENTASI';

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
    vectorFindings,
    vectorUnits,
    foodRows,
    activities,
    supervisions,
    findings,
    hospitalProfile,
    pushToast,
  } = useApp();

  const [reportYear, setReportYear] = useState<number>(2025);
  const [activeSection, setActiveSection] = useState<ReportSectionFilter>('ALL');
  const [jumpToPage, setJumpToPage] = useState<string>('ALL');
  const [isEditableMode, setIsEditableMode] = useState<boolean>(false);
  const [selectedLogbookMonth, setSelectedLogbookMonth] = useState<number | 'ALL'>('ALL');
  const [showOriginalPdfModal, setShowOriginalPdfModal] = useState<boolean>(false);

  const f4DocumentRef = useRef<HTMLDivElement>(null);

  const compiled = useMemo(() => {
    return compileAnnualKeslingReport({
      year: reportYear,
      institutionName: hospitalProfile.institutionName || 'UOBK RSUD Al-Mulk Kota Sukabumi',
      waterRows,
      airItems,
      wastewaterRows,
      solidWasteRows,
      vectorFindings,
      vectorUnitCount: vectorUnits.length || 20,
      foodRows,
      activities,
      supervisions,
      findings,
    });
  }, [
    reportYear,
    hospitalProfile.institutionName,
    waterRows,
    airItems,
    wastewaterRows,
    solidWasteRows,
    vectorFindings,
    vectorUnits.length,
    foodRows,
    activities,
    supervisions,
    findings,
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
    link.download = `LAPORAN_TAHUNAN_KESLING_RSUD_AL_MULK_${reportYear}_HASIL_EDIT_F4.doc`;
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

  const shouldRenderPage = (pageNumber: number, sectionCategory: ReportSectionFilter) => {
    if (jumpToPage !== 'ALL' && jumpToPage !== String(pageNumber)) {
      return false;
    }
    if (activeSection === 'ALL') return true;
    return activeSection === sectionCategory;
  };

  const renderSingleFooter = (pageNum: number) => (
    <div className="pt-3 mt-auto border-t-2 border-[#5B9BD5] flex items-center justify-between text-[10px] text-slate-500 font-sans print:text-black">
      <span>
        LAPORAN TAHUNAN KESEHATAN LINGKUNGAN UOBK RSUD AL-MULK TAHUN {reportYear}
      </span>
      <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
        {pageNum}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Banner Control Center */}
      <div className="rounded-3xl bg-gradient-to-r from-[#002147] via-[#0a3568] to-[#1F4E79] p-6 text-white shadow-xl border border-[#D2B48C]/30 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#D2B48C] text-[#002147]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dokumen Resmi F4 (Folio 215,9 × 330,2 mm) — Per Halaman Terpisah</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Laporan Tahunan Kesehatan Lingkungan RSUD Al-Mulk
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              Disusun per lembar halaman terpisah (1 lembar = 1 nomor halaman resmi tanpa digabung), cover 100% identik sesuai dokumen asli, dan data terintegrasi secara realtime dari modul Monitoring, Analisis, serta RTL Kesling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadWordF4}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D2B48C] text-[#002147] hover:bg-[#e4caaa] transition shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Word Resmi F4 (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditableMode(!isEditableMode)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isEditableMode
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditableMode ? 'Mode Edit: AKTIF' : 'Edit di Layar'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak F4 / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOriginalPdfModal(!showOriginalPdfModal)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-[#D2B48C] border border-[#D2B48C]/40 hover:bg-white/20 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showOriginalPdfModal ? 'Tutup PDF Referensi' : 'Lihat PDF Asli (165 Hal)'}</span>
            </button>
          </div>
        </div>

        {/* Realtime Monitoring Sync Summary Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="rounded-xl bg-white/10 px-3 py-2 border border-white/10">
            <div className="text-[10px] text-[#D2B48C] uppercase font-bold">3.1 Air Bersih & RO</div>
            <div className="font-extrabold text-sm text-white">{compiled.water.complianceRate}% MS</div>
            <div className="text-[10px] text-white/70">{waterRows.length} Uji Lab Aktif</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 border border-white/10">
            <div className="text-[10px] text-[#D2B48C] uppercase font-bold">3.2 Udara & KRIS</div>
            <div className="font-extrabold text-sm text-white">
              {compiled.air.chartComparison[1].desemberPct}% Lux
            </div>
            <div className="text-[10px] text-white/70">Kelembaban {compiled.air.chartComparison[0].desemberPct}% · Bising {compiled.air.chartComparison[2].desemberPct}%</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 border border-white/10">
            <div className="text-[10px] text-[#D2B48C] uppercase font-bold">3.3 Sanitasi Pangan</div>
            <div className="font-extrabold text-sm text-white">{compiled.food.minNilai}% – {compiled.food.maxNilai}%</div>
            <div className="text-[10px] text-white/70">Jasaboga Skor 59</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 border border-white/10">
            <div className="text-[10px] text-[#D2B48C] uppercase font-bold">3.5 Limbah B3 Padat</div>
            <div className="font-extrabold text-sm text-white">
              {compiled.solidWaste.grandTotal.toLocaleString('id-ID')} Kg
            </div>
            <div className="text-[10px] text-white/70">Rata ±{compiled.solidWaste.monthlyAverage} Kg/Bln</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 border border-white/10">
            <div className="text-[10px] text-[#D2B48C] uppercase font-bold">3.6 Limbah Cair IPAL</div>
            <div className="font-extrabold text-sm text-white">
              {compiled.wastewater.outletComplianceRate}% Outlet MS
            </div>
            <div className="text-[10px] text-white/70">Reduksi BOD {compiled.wastewater.avgBodReduction}%</div>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 border border-white/10">
            <div className="text-[10px] text-[#D2B48C] uppercase font-bold">3.8 Vektor & 3.12 RTL</div>
            <div className="font-extrabold text-sm text-white">
              ABJ {compiled.vector.bars[0].value}%
            </div>
            <div className="text-[10px] text-white/70">{compiled.evaluasi.rows.length} Item Evaluasi & RTL</div>
          </div>
        </div>
      </div>

      {/* Embedded Original PDF Viewer (Optional) */}
      {showOriginalPdfModal && (
        <div className="rounded-2xl border-2 border-[#002147] bg-white dark:bg-slate-900 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#002147] dark:text-[#D2B48C]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dokumen Referensi Asli: LAPORAN TAHUNAN KESLING 2025 fix.pdf (165 Halaman)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/assets/aistudio/LAPORAN_TAHUNAN_KESLING_2025_fix_798998cf.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#002147] text-white text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab Penuh</span>
              </a>
              <button
                type="button"
                onClick={() => setShowOriginalPdfModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
          <iframe
            src="/assets/aistudio/LAPORAN_TAHUNAN_KESLING_2025_fix_798998cf.pdf"
            title="Laporan Tahunan Kesling 2025 PDF"
            className="w-full h-[650px] rounded-xl border border-slate-200"
          />
        </div>
      )}

      {/* Navigation Filter & Page Jump Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Section Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Semua Halaman (Lengkap F4)' },
              { id: 'COVER_PENDAHULUAN', label: 'Cover & BAB I–II (Hal 1–9)' },
              { id: 'BAB_3_MONITORING', label: 'BAB III Monitoring (Hal 10–26)' },
              { id: 'BAB_3_EVALUASI_PENUTUP', label: 'Evaluasi & BAB IV (Hal 27–35)' },
              { id: 'LAMPIRAN_1_UDARA', label: 'Lampiran 1 Udara (Hal 38–39)' },
              { id: 'LAMPIRAN_2_LOGBOOK', label: 'Lampiran 2 Logbook (Hal 40–46)' },
              { id: 'LAMPIRAN_3_6_CHECKLIST', label: 'Lampiran 3–6 Checklist (Hal 47–49)' },
              { id: 'DOKUMENTASI', label: 'Dokumentasi Foto (Hal 37 & 50–51)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveSection(tab.id as ReportSectionFilter);
                  setJumpToPage('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSection === tab.id && jumpToPage === 'ALL'
                    ? 'bg-[#002147] text-[#FAF6F0] shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Page Jump Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="jump-page-select" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Lompat Halaman:
              </label>
              <select
                id="jump-page-select"
                value={jumpToPage}
                onChange={(e) => handlePageJumpChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-[#002147] dark:text-white"
              >
                <option value="ALL">Semua Lembar (Tampil Semua)</option>
                <option value="1">Hal 1: Cover Resmi</option>
                <option value="2">Hal 2: Kata Pengantar</option>
                <option value="3">Hal 3: Daftar Isi (1)</option>
                <option value="4">Hal 4: Daftar Isi (2)</option>
                <option value="5">Hal 5: BAB I Pendahuluan</option>
                <option value="6">Hal 6: 1.2 Tujuan Umum & Khusus</option>
                <option value="7">Hal 7: 1.2.3 Ruang Lingkup & Personil</option>
                <option value="8">Hal 8: BAB II Gambaran Umum</option>
                <option value="9">Hal 9: 2.4 Sarana & Peta Satelit</option>
                <option value="10">Hal 10: BAB III & 3.1 Penyehatan Air</option>
                <option value="11">Hal 11: Tabel 1 Hasil Air Bersih</option>
                <option value="12">Hal 12: Tabel 2 Hasil Air RO (Mikro)</option>
                <option value="13">Hal 13: Tabel 2 Hasil Air RO (Fisika/Kimia)</option>
                <option value="14">Hal 14: Analisa Air & 3.2 Grafik Udara</option>
                <option value="15">Hal 15: Tabel Udara & Rekomendasi KRIS</option>
                <option value="16">Hal 16: 3.3 Pangan & 3.4 Sarana Bangunan</option>
                <option value="17">Hal 17: Grafik Sarana & Analisa Standar</option>
                <option value="18">Hal 18: Tabel 4 Sarana Toilet</option>
                <option value="19">Hal 19: Tabel 4 Sarana Lantai & Atap</option>
                <option value="20">Hal 20: Tabel 4 Langit-Langit & Pintu</option>
                <option value="21">Hal 21: 3.5 Limbah B3 Padat & Tabel 5</option>
                <option value="22">Hal 22: Analisa Limbah B3 & RTL KRIS</option>
                <option value="23">Hal 23: Jadwal Limbah & 3.6 IPAL Cair</option>
                <option value="24">Hal 24: Tabel 6 Hasil IPAL 12 Bulan</option>
                <option value="25">Hal 25: Analisa IPAL Inlet</option>
                <option value="26">Hal 26: Analisa IPAL Outlet</option>
                <option value="27">Hal 27: Evaluasi IPAL & 3.7 Radiasi</option>
                <option value="28">Hal 28: Tabel Radiasi & Analisa RTL</option>
                <option value="29">Hal 29: 3.8 Vektor & Grafik Bar</option>
                <option value="30">Hal 30: RTL Vektor & 3.9 Linen/Laundry</option>
                <option value="31">Hal 31: Analisa Pengelolaan Linen</option>
                <option value="32">Hal 32: Rekomendasi Linen & Dekontaminasi</option>
                <option value="33">Hal 33: 3.12 Evaluasi Tabel 19 (1-3)</option>
                <option value="34">Hal 34: Tabel 19 Lanjutan (4-6)</option>
                <option value="35">Hal 35: BAB IV Penutup</option>
                <option value="36">Hal 36: Pembatas Lampiran</option>
                <option value="37">Hal 37: Daftar Dokumentasi 1-8</option>
                <option value="38">Hal 38: Lampiran 1 Udara (Semester 1)</option>
                <option value="39">Hal 39: Lampiran 1 Udara (Semester 2)</option>
                <option value="40">Hal 40: Lampiran 2 Logbook (Januari)</option>
                <option value="41">Hal 41: Lampiran 2 Logbook (Feb-Mar)</option>
                <option value="42">Hal 42: Lampiran 2 Logbook (Apr-Mei)</option>
                <option value="43">Hal 43: Lampiran 2 Logbook (Jun-Jul)</option>
                <option value="44">Hal 44: Lampiran 2 Logbook (Agu-Sep)</option>
                <option value="45">Hal 45: Lampiran 2 Logbook (Okt-Nov)</option>
                <option value="46">Hal 46: Lampiran 2 Logbook (Desember)</option>
                <option value="47">Hal 47: Lampiran 3 Checklist Linen</option>
                <option value="48">Hal 48: Lampiran 4 Kelaikan Jasaboga</option>
                <option value="49">Hal 49: Lampiran 5 & 6 Pantry RS</option>
                <option value="50">Hal 50: Dokumentasi Foto (Bagian 1)</option>
                <option value="51">Hal 51: Dokumentasi Foto (Bagian 2)</option>
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="report-year-select" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Tahun:
              </label>
              <select
                id="report-year-select"
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-[#002147] dark:text-white"
              >
                <option value={2025}>2025 (Sesuai Referensi)</option>
                <option value={2026}>2026 (Realtime Berjalan)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isEditableMode && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-950 print:hidden">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Mode Edit Langsung Aktif:</strong> Anda dapat langsung mengklik kalimat narasi, angka di tabel, atau analisa pada setiap lembar kertas F4 di bawah ini untuk diedit, lalu klik <strong>&ldquo;Simpan Hasil Edit ke Word&rdquo;</strong> untuk mengunduh dokumen Word F4.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadCurrentEditedWordF4}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 shrink-0 cursor-pointer"
          >
            Simpan Hasil Edit ke Word (.doc)
          </button>
        </div>
      )}

      {/* =====================================================================
          OFFICIAL F4 PAPER WORKSPACE (215.9mm Width x 330.2mm Min Height per Sheet)
          Each sheet is its own individual page with a single integer page number.
         ===================================================================== */}
      <div
        ref={f4DocumentRef}
        contentEditable={isEditableMode}
        suppressContentEditableWarning
        className={`space-y-12 mx-auto max-w-[216mm] ${
          isEditableMode ? 'ring-4 ring-emerald-500/40 rounded-lg p-2' : ''
        }`}
      >
        {/* =====================================================================
            HALAMAN 1: COVER RESMI (PERSIS SESUAI GAMBAR REFERENSI DARI USER)
           ===================================================================== */}
        {shouldRenderPage(1, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-1"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] overflow-hidden relative print:shadow-none print:border-none p-0 flex flex-col justify-between"
          >
            {/* Visual Cover identical to image_2d467b58.png */}
            <div className="relative w-full aspect-[215.9/330.2] min-h-[330.2mm] flex flex-col justify-between overflow-hidden bg-slate-900">
              <img
                src="/assets/aistudio/image_2d467b58.png"
                alt="Cover Laporan Tahunan Kesling RSUD Al-Mulk"
                className="w-full h-full object-fill block"
              />
              {/* If year is changed from 2025, overlay the updated year smoothly on the badge */}
              {reportYear !== 2025 && (
                <div className="absolute top-[8.5%] left-[8%] bg-[#1F4E79] text-white font-extrabold text-2xl sm:text-3xl px-8 py-1 rounded shadow-lg border-2 border-white/40">
                  {reportYear}
                </div>
              )}
            </div>
            {/* Page 1 marker */}
            <div className="py-2 px-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 print:hidden">
              <span>LEMBAR COVER RESMI — LAPORAN TAHUNAN KESEHATAN LINGKUNGAN RSUD AL-MULK</span>
              <span className="font-bold">1</span>
            </div>
          </section>
        )}

        {/* =====================================================================
            HALAMAN 2: KATA PENGANTAR
           ===================================================================== */}
        {shouldRenderPage(2, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-2"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-5 text-[13.5px] leading-[1.8] text-justify font-serif">
              <h2 className="text-center font-bold text-base uppercase tracking-wide mb-6 font-sans">
                KATA PENGANTAR
              </h2>
              <p className="indent-8">
                Puji syukur saya panjatkan kepadsa Allah SWT dengan selesainya Laporan Tahunan Kesehatam Lingkungan UOBK RSUD Al-Mulk Kota Sukabumi. Laporan Tahuan ini berisi data-data dan laporan Indikator Kinerja dan Mutu Unit kesehatan lingkungan di tahun {reportYear}.
              </p>
              <p className="indent-8">
                Laporan Tahunan Kesehatan Lingkungan RSUD Al-Mulk Kota Sukabumi ini disusun sebagai bentuk akuntabilitas dan transparansi pelaksanaan pengelolaan lingkungan rumah sakit dalam periode Januari–Desember {reportYear}. Laporan ini mencerminkan komitmen RSUD Al-Mulk untuk memenuhi standar kesehatan lingkungan, menjamin keselamatan pasien dan tenaga kesehatan, serta mendukung pencapaian standar pelayanan nasional termasuk implementasi <em>Kelas Rawat Inap Standar</em> (KRIS).
              </p>
              <p className="indent-8">
                Jenis Indikator Kegiatan Unit Kesling diantaranya : Melaksanakan Pengawasan Kesehatan Air Rumah Sakit, Pemeriksaan Kesehatan Udara Rumah Sakit, Melaksanakan pengawasan Kesehatan Sarana dan Bangunan, Melaksanakan pengawasan kebersihan, Monitoring penanganan limbah cair infeksius, Monitoring pengelolaan limbah padat, Monitoring pemeriksaan pangan siap saji, Monitoring Pemeriksaan Penyelenggaraan Linen, Monitoring Pemeriksaan Pengamanan Radiasi, Pengendalian vector dan binatang pengganggu.
              </p>
              <p className="indent-8">
                Laporan Kinerja RSUD AL-Mulk diuraikan dalam laporan ini, sehingga pelaksanaan tugas pokok dan fungsi serta tujuan dan sasaran kegiatan selama tahun {reportYear} dapat digambarkan pencapaiannya serta masalah dan kendala-kendala yang dihadapi. Laporan ini diharapkan dapat menjadi dasar pertimbangan dalam pengambilan kebijakan di tahun mendatang dan saya berharap Laporan Tahunan ini dapat dijadikan sebagai informasi kesehatan lingkungan di UOBK RSUD Al-Mulk, dan dapat bermafaat bagi semua pembaca baik untuk Petugas Kesehatan maupun Unit-Unit lain yang membutuhkan.
              </p>
              <p className="indent-8">
                Laporan Tahunan ini disusun tentu saja jauh dari kesempurnaan, oleh karena itu penyusun berharap mendapatkan saran dan kritik agar dapat disempurnakan menjadi lebih baik pada punyusunan Laporan Tahunan berikutnya, Terimakasih di sampaikan kepada semua pihak yang telah mendukung penyusunan laporan tahunan ini. Semoga bermanfaat untuk kita semua. Aamiin
              </p>

              <div className="pt-10 pr-6 text-right space-y-1 font-sans">
                <p>Penyusun,</p>
                <p className="font-semibold pt-2">Instalasi Kesehatan Lingkungan</p>
                <p className="font-semibold">UOBK RSUD Al-Mulk Kota Sukabumi</p>
              </div>
            </div>
            {renderSingleFooter(2)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 3: DAFTAR ISI (BAGIAN 1)
           ===================================================================== */}
        {shouldRenderPage(3, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-3"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.9] font-serif">
              <h2 className="text-center font-bold text-base uppercase tracking-wide mb-6 font-sans">
                DAFTAR ISI
              </h2>
              <div className="space-y-1">
                {[
                  ['HALAMAN JUDUL', '1'],
                  ['KATA PENGANTAR', '2'],
                  ['DAFTAR ISI', '3'],
                ].map(([title, pg]) => (
                  <div key={title} className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{title}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 mx-2" />
                    <span className="font-mono">{pg}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 space-y-1">
                <div className="font-bold text-[#002147] font-sans">BAB I PENDAHULUAN</div>
                {[
                  ['1.1 LATAR BELAKANG', '5'],
                  ['1.2 TUJUAN', '6'],
                  ['1.2.1 Tujuan Umum', '6'],
                  ['1.2.2 Tujuan Khusus', '6'],
                  ['1.2.3 Ruang Lingkup Penyehatan Lingkungan Rumah Sakit', '7'],
                  ['1.2.4 Isi dan Metoda Penyusunan', '7'],
                  ['1.2.5 Jumlah dan Komposisi Personil', '7'],
                ].map(([title, pg]) => (
                  <div key={title} className="flex items-baseline justify-between gap-2">
                    <span className="pl-2">{title}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 mx-2" />
                    <span className="font-mono">{pg}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 space-y-1">
                <div className="font-bold text-[#002147] font-sans">BAB II GAMBARAN UMUM</div>
                {[
                  ['2.1 Visi dan Misi UOBK RSUD AL-MULK', '8'],
                  ['2.2 Kondisi Geografi dan Wilayah Administrasi', '8'],
                  ['2.3 Ringkasan Usaha dan Sarana Fasilitas', '9'],
                ].map(([title, pg]) => (
                  <div key={title} className="flex items-baseline justify-between gap-2">
                    <span className="pl-2">{title}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 mx-2" />
                    <span className="font-mono">{pg}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 italic pt-4">
                (Daftar Isi BAB III Pelaksanaan Kegiatan, BAB IV Penutup & Lampiran bersambung ke Halaman 4)
              </p>
            </div>
            {renderSingleFooter(3)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 4: DAFTAR ISI (BAGIAN 2)
           ===================================================================== */}
        {shouldRenderPage(4, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-4"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.8] font-serif">
              <h2 className="text-center font-bold text-base uppercase tracking-wide mb-4 font-sans">
                DAFTAR ISI (LANJUTAN)
              </h2>

              <div className="space-y-1">
                <div className="font-bold text-[#002147] font-sans">BAB III PELAKSANAAN KEGIATAN</div>
                {[
                  ['3.1 Penyelenggaraan Penyehatan Air', '10'],
                  ['3.2 Penyelenggaraan Penyehatan Udara, Kebisingan dan Pencahayaan', '14'],
                  ['3.3 Penyelenggaraan Penyehatan Pangan Siap Saji', '16'],
                  ['3.4 Penyelenggaraan Penyehatan Sarana dan Bangunan', '16'],
                  ['3.5 Penyelenggaraan Pengamanan Limbah dan Radiasi', '21'],
                  ['3.6 Penyelenggaraan Pengamanan Limbah Cair', '23'],
                  ['3.7 Penyelenggaraan Pengamanan Limbah Radiasi', '27'],
                  ['3.8 Penyelenggaraan Pengendalian Vektor dan Binatang Pembawa Penyakit', '29'],
                  ['3.9 Penyelenggaraan Pengawasan Linen / Laundry', '30'],
                  ['3.10 Penyelenggaraan Pengawasan Dekontaminasi Melalui Disinfeksi dan Sterilisasi', '32'],
                  ['3.11 Penanggungjawab Pelaksana', '32'],
                  ['3.12 Evaluasi Kegiatan', '32'],
                ].map(([title, pg]) => (
                  <div key={title} className="flex items-baseline justify-between gap-2">
                    <span className="pl-2">{title}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 mx-2" />
                    <span className="font-mono">{pg}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1">
                <div className="font-bold text-[#002147] font-sans">BAB IV PENUTUP</div>
                <div className="flex items-baseline justify-between gap-2 pl-2">
                  <span>4.1 Kesimpulan dan Saran Penutup</span>
                  <span className="flex-1 border-b border-dotted border-slate-400 mx-2" />
                  <span className="font-mono">35</span>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <div className="font-bold text-[#002147] font-sans">LAMPIRAN DAN DOKUMENTASI</div>
                {[
                  ['Halaman Pembatas Lampiran & Dokumentasi', '36'],
                  ['Daftar Dokumentasi Kegiatan Kesehatan Lingkungan', '37'],
                  ['Lampiran 1: Pengukuran Udara Ruangan Semester 1 (Juli)', '38'],
                  ['Lampiran 1: Pengukuran Udara Ruangan Semester 2 (Desember)', '39'],
                  ['Lampiran 2: Log Book Limbah Medis B3 (12 Bulan / 11 Sumber)', '40'],
                  ['Lampiran 3: Checklist Pengelolaan Linen RSUD Al-Mulk', '47'],
                  ['Lampiran 4: Uji Kelaikan Higiene Sanitasi Jasaboga', '48'],
                  ['Lampiran 5 & 6: Checklist Pantry RS (Semester 1 & 2)', '49'],
                  ['Lampiran Dokumentasi Foto Berwarna (Bagian 1: Air & Limbah)', '50'],
                  ['Lampiran Dokumentasi Foto Berwarna (Bagian 2: Udara, Radiasi, K3)', '51'],
                ].map(([title, pg]) => (
                  <div key={title} className="flex items-baseline justify-between gap-2">
                    <span className="pl-2">{title}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 mx-2" />
                    <span className="font-mono">{pg}</span>
                  </div>
                ))}
              </div>
            </div>
            {renderSingleFooter(4)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 5: BAB I PENDAHULUAN (1.1 LATAR BELAKANG)
           ===================================================================== */}
        {shouldRenderPage(5, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-5"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.8] text-justify font-serif">
              <div className="text-center font-bold text-base uppercase space-y-0.5 mb-4 font-sans">
                <div>BAB 1</div>
                <div>PENDAHULUAN</div>
              </div>

              <h3 className="font-bold text-sm font-sans">1.1 Latar Belakang</h3>
              <p className="indent-8">
                Rumah Sakit UOBK RSUD AL-Mulk memiliki Visi menjadi Rumah Sakit dengan pelayanan kesehatan yang berkwalitas menuju kota Sukabumi yang sehat dan sejahtra dan misi sebagai berikut;
              </p>
              <ol className="list-decimal pl-8 space-y-1">
                <li>memberikan pelayanan secara komperehensif dan holistic mengacu kepada peningkatan mutu pelayanan dan keselamatan pasien</li>
                <li>menciptakan suasana kerja yang harmonis dan meningkatkan kualitas SDM yang professional</li>
                <li>meningkatkan teknologi pelayanan sesuai dengan pekembangan ilmu pengetahuan yang terjangkau oleh masyarakat</li>
                <li>menciptakan suasana rumah sakit yang aman dan nyaman.</li>
              </ol>
              <p className="indent-8">
                Sehingga untuk mengacu pada Visi Misi UOBK RSUD Al-Mulk, dalam pelaksanaannya, rumah sakit harus memiliki lingkungan yang sehat dan bebas dari segala faktor yang dapat menimbulkan ketidaknyamanan dan gangguan kesehatan baik untuk pasien, pengunjung maupun pegawai.
              </p>
              <p className="indent-8">
                Rumah Sakit Umum Daerah (RSUD) Al-Mulk Kota Sukabumi sebagai fasilitas pelayanan kesehatan rujukan milik pemerintah daerah memiliki peran penting dalam memberikan pelayanan kesehatan yang aman, bermutu, dan berorientasi pada keselamatan pasien. Dalam penyelenggaraan pelayanan tersebut, aspek <strong>kesehatan lingkungan rumah sakit</strong> merupakan salah satu pilar utama yang menentukan kualitas layanan dan pencegahan risiko penularan penyakit.
              </p>
              <p className="indent-8">
                Kesehatan lingkungan rumah sakit meliputi upaya pengelolaan faktor lingkungan fisik, kimia, biologi, dan sosial di lingkungan rumah sakit agar tidak menimbulkan dampak negatif terhadap pasien, tenaga kesehatan, pengunjung, maupun masyarakat sekitar. Pengelolaan ini mencakup sanitasi, penyediaan air bersih, pengelolaan limbah medis dan nonmedis, pengendalian vektor, kebersihan ruangan, serta kualitas udara dan bangunan.
              </p>
            </div>
            {renderSingleFooter(5)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 6: 1.1 LATAR BELAKANG (LANJUTAN) & 1.2 TUJUAN
           ===================================================================== */}
        {shouldRenderPage(6, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-6"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.8] text-justify font-serif">
              <p className="indent-8">
                Sejalan dengan perkembangan kebijakan nasional, pemerintah menetapkan penerapan <strong>Kelas Rawat Inap Standar (KRIS)</strong> dalam Program Jaminan Kesehatan Nasional sebagaimana diatur dalam <strong>Peraturan Presiden Nomor 59 Tahun 2024</strong>, yang menekankan pemerataan mutu layanan rawat inap melalui pemenuhan standar fasilitas dan lingkungan perawatan. Implementasi KRIS berdampak langsung terhadap pengelolaan kesehatan lingkungan, khususnya pada aspek bangunan, ventilasi, kepadatan tempat tidur, sanitasi ruangan, pencahayaan, serta kenyamanan dan keselamatan pasien.
              </p>
              <p className="indent-8">
                Selain itu, pengelolaan kesehatan lingkungan rumah sakit juga mengacu pada <strong>Peraturan Menteri Kesehatan Nomor 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit</strong>, serta standar akreditasi rumah sakit yang menempatkan manajemen fasilitas dan keselamatan sebagai komponen penting dalam penilaian mutu layanan.
              </p>
              <p className="indent-8">
                Oleh karena itu, RSUD Al-Mulk Kota Sukabumi menyusun Laporan Tahunan Kesehatan Lingkungan sebagai bentuk akuntabilitas kinerja, sarana evaluasi pelaksanaan program, serta dasar perencanaan peningkatan mutu pengelolaan lingkungan rumah sakit secara berkelanjutan, sekaligus mendukung kesiapan penerapan KRIS secara optimal.
              </p>

              <h3 className="font-bold text-sm pt-2 font-sans">1.2 Tujuan</h3>
              <div className="font-semibold font-sans">1.2.1. Tujuan Umum</div>
              <p className="pl-6">
                Penyelenggara penyehatan lingkungan di RS yang memenuhi persyaratan sanitasi agar menjamin dan dapat menekan terjadinya infeksi nosokomial dan memberikan rasa aman serta nyaman pada pelanggan RS dan sebagai gambaran informasi data Kesehatan Lingkungan di RSUD Al-Mulk.
              </p>
              <div className="font-semibold font-sans">1.2.2. Tujuan Khusus</div>
              <ol className="list-decimal pl-8 space-y-1">
                <li>Mengetahui capaian kinerja pengelolaan kesehatan lingkungan RSUD Al-Mulk selama periode pelaporan.</li>
                <li>Menilai tingkat kepatuhan terhadap regulasi kesehatan lingkungan dan standar KRIS.</li>
                <li>Menjadi bahan evaluasi dan perencanaan program peningkatan mutu kesehatan lingkungan tahun berikutnya.</li>
                <li>Mendukung pemenuhan persyaratan akreditasi dan akuntabilitas institusi.</li>
              </ol>
            </div>
            {renderSingleFooter(6)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 7: 1.2.3 RUANG LINGKUP, 1.2.4 METODA & 1.2.5 PERSONIL
           ===================================================================== */}
        {shouldRenderPage(7, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-7"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.8] text-justify font-serif">
              <div className="font-semibold text-sm font-sans">1.2.3 Ruang Lingkup Penyehatan Lingkungan Rumah Sakit</div>
              <p>
                Ruang lingkup penyehatan lingkungan di Rumah Sakit UOBK RSUD Al-Mulk meliputi sepuluh aspek utama:
              </p>
              <ol className="list-decimal pl-8 space-y-1.5">
                <li>Melaksanakan Pengawasan Kesehatan Air Rumah Sakit</li>
                <li>Pemeriksaan Kesehatan Udara Rumah Sakit</li>
                <li>Melaksanakan pengawasan Kesehatan Sarana dan Bangunan</li>
                <li>Melaksanakan pengawasan kebersihan</li>
                <li>Monitoring penanganan limbah cair infeksius</li>
                <li>Monitoring pengelolaan limbah padat</li>
                <li>Monitoring pemeriksaan pangan siap saji</li>
                <li>Monitoring Pemeriksaan Penyelenggaraan Linen</li>
                <li>Monitoring Pemeriksaan Pengamanan Radiasi</li>
                <li>Pengendalian vector dan binatang pengganggu</li>
              </ol>

              <div className="font-semibold text-sm pt-3 font-sans">1.2.4 Isi dan Metoda Penyusunan</div>
              <p className="indent-8">
                Laporan Tahunan kesehatan Lingkungan UOBK RSUD Al-Mulk ini berisi data-data Kesehatan Lingkungan yang diperoleh sejak awal Januari sampai akhir Desember tahun {reportYear}. Metoda penyusunan yang digunakan adalah metoda tampilan data baik dalam bentuk tabel maupun peta. Semua itu disusun untuk memudahkan dalam membaca data yang tersedia.
              </p>

              <div className="font-semibold text-sm pt-3 font-sans">1.2.5 Jumlah dan Komposisi Personil</div>
              <p className="indent-8">
                Jumlah tenaga di UOBK RSUD Al-Mulk ada 2 orang dengan latar belakang pendidikan D III Kesehatan Lingkungan dan S1 Kesling dan status kepegawaian PNS dan THL. Tenaga ini bertanggung jawab atas pengawasan harian, sampling, inspeksi sanitasi, pelaporan berkala, dan koordinasi lintas unit serta pihak ketiga pengelola limbah.
              </p>
            </div>
            {renderSingleFooter(7)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 8: BAB II GAMBARAN UMUM (2.3 VISI & 2.4 KONDISI GEOGRAFI)
           ===================================================================== */}
        {shouldRenderPage(8, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-8"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.75] text-justify font-serif">
              <div className="text-center font-bold text-base uppercase space-y-0.5 mb-4 font-sans">
                <div>BAB II</div>
                <div>GAMBARAN UMUM</div>
              </div>

              <h3 className="font-bold text-sm font-sans">2.3 Visi dan Misi UOBK RSUD AL-MULK</h3>
              <p>
                Dengan mengacu kepada visi Pemerintah Kota Sukabumi yaitu &ldquo;Mewujudkan masyarakat yang religious, nyaman dan sejahtera (Renyah)&rdquo;, maka selanjutnya RSUD Al-Mulk menetapkan Visi, Misi, Falsafah Yaitu :
              </p>
              <div className="pl-4 space-y-2">
                <p>
                  <strong>A. Visi :</strong> menjadi Rumah Sakit dengan pelayanan kesehatan yang berkwalitas menuju kota Sukabumi yang sehat dan sejahtra.
                </p>
                <div>
                  <strong>B. Misi :</strong>
                  <ol className="list-decimal pl-6 space-y-1 mt-1">
                    <li>Memberikan pelayanan secara komperehensif dan holistic mengacu kepada peningkatan mutu pelayanan dan keselamatan pasien</li>
                    <li>Menciptakan suasana kerja yang harmonis dan meningkatkan kualitas SDM yang professional.</li>
                    <li>Meningkatkan teknologi pelayanan sesuai dengan pekembangan ilmu pengetahuan yang terjangkau oleh masyarakat</li>
                    <li>Menciptakan suasana rumah sakit yang aman dan nyaman.</li>
                  </ol>
                </div>
                <p>
                  <strong>C. Falsafah :</strong> Falsafah UOBK RSUD Al-Mulk adalah memberikan pelayanan prima sesuai standar profesionalisme secara konsisten dan disiplin tinggi, memegang teguh etika profesi dan integritas moral yang tinggi.
                </p>
              </div>

              <h3 className="font-bold text-sm pt-2 font-sans">2.4 Kondisi Geografi dan Wilayah Administrasi</h3>
              <div className="font-semibold font-sans">A. RINGKASAN USAHA DAN ATAU KEGIATAN</div>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr><td className="py-1 w-64">a. Nama Usaha/ Kegiatan</td><td className="w-4">:</td><td className="font-semibold">UOBK RSUD Al Mulk</td></tr>
                  <tr><td className="py-1 font-medium" colSpan={3}>b. Lokasi Usaha/ Kegiatan</td></tr>
                  <tr><td className="py-1 pl-6">1. Nama Jalan</td><td>:</td><td>Pelabuhan II KM 6</td></tr>
                  <tr><td className="py-1 pl-6">2. Kelurahan</td><td>:</td><td>Lembursitu</td></tr>
                  <tr><td className="py-1 pl-6">3. Kecamatan</td><td>:</td><td>Lembursitu</td></tr>
                  <tr><td className="py-1 pl-6">4. Titik koordinat</td><td>:</td><td className="font-mono">-6.95868, 106.89784</td></tr>
                  <tr><td className="py-1">c. Jumlah Pegawai</td><td>:</td><td>179 orang</td></tr>
                  <tr><td className="py-1 pl-6">1. Waktu Operasi</td><td>:</td><td>24 Jam/ 3 Shift</td></tr>
                  <tr><td className="py-1 pl-6">2. Jenis Kegiatan</td><td>:</td><td>Pelayanan Kesehatan</td></tr>
                  <tr><td className="py-1 pl-6">3. Luas Lahan / Bangunan</td><td>:</td><td>4667 m2</td></tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(8)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 9: 2.4 SARANA FASILITAS SANITASI & GAMBAR 2.1 PETA SATELIT
           ===================================================================== */}
        {shouldRenderPage(9, 'COVER_PENDAHULUAN') && (
          <section
            id="f4-page-9"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.75] text-justify font-serif">
              <h3 className="font-bold text-sm font-sans">2.4 Sarana Fasilitas Sanitasi & Utilitas Lanjutan</h3>
              <table className="w-full text-xs border-collapse font-sans">
                <tbody>
                  <tr><td className="py-1 w-64">d. Pemanfaatan Listrik/ Energi</td><td className="w-4">:</td><td className="font-semibold">10.150 VA</td></tr>
                  <tr><td className="py-1">e. Pemanfaatan Air</td><td>:</td><td>10 m3/ hari</td></tr>
                  <tr><td className="py-1 pl-6">- Jenis Sumber</td><td>:</td><td>Artesis dan Air RO</td></tr>
                  <tr><td className="py-1 pl-6">- Kamar Mandi/ WC</td><td>:</td><td>10 m3/ hari</td></tr>
                  <tr><td className="py-1 pl-6">- Penyiraman/ Cuci</td><td>:</td><td>1 m3/ hari</td></tr>
                  <tr><td className="py-1 pl-6">- Limbah Produksi</td><td>:</td><td>9 m3/hari</td></tr>
                  <tr><td className="py-1 pl-6">- Hasil Air Limbah</td><td>:</td><td>Terlampir</td></tr>
                  <tr><td className="py-1 pl-6">- Jumlah Toilet</td><td>:</td><td>58 toilet</td></tr>
                  <tr><td className="py-1 pl-6">- IPAL</td><td>:</td><td>ada</td></tr>
                  <tr><td className="py-1 pl-6">- TPS Limbah Medis dan B3</td><td>:</td><td>ada (Dilengkapi Cold Storage &lt;0°C)</td></tr>
                </tbody>
              </table>

              <div className="pt-6 text-center space-y-3 font-sans">
                <div className="font-bold text-xs uppercase tracking-wide text-[#002147]">
                  Gambar : 2.1. Peta Wilayah UOBK RSUD Al-Mulk (Koordinat: -6.95868, 106.89784)
                </div>
                <div className="rounded-xl border border-slate-300 bg-slate-100 p-6 text-xs text-slate-700 font-mono shadow-inner space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-sm text-slate-900">
                    PETA SATELIT WILAYAH RSUD AL-MULK
                  </div>
                  <div>
                    Jl. Pelabuhan II KM 6, Kel. Lembursitu, Kec. Lembursitu, Kota Sukabumi, Jawa Barat
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Titik Koordinat Geografis: -6.95868, 106.89784 · Luas Area: 4.667 m²
                  </div>
                </div>
              </div>
            </div>
            {renderSingleFooter(9)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 10: BAB III & 3.1 PENYELENGGARAAN PENYEHATAN AIR
           ===================================================================== */}
        {shouldRenderPage(10, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-10"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[13px] leading-[1.8] text-justify font-serif">
              <div className="text-center font-bold text-base uppercase space-y-0.5 mb-2 font-sans">
                <div>BAB III</div>
                <div>PELAKSANAAN KEGIATAN</div>
              </div>
              <p>
                Upaya yang menjadi sasaran kegiatan Kesehatan lingkungan rumah sakit berdasarkan PERMENKES NO 7 TAHUN 2019 meliputi:
              </p>

              <h3 className="font-bold text-sm pt-2 font-sans">3.1 Penyelenggaraan Penyehatan Air</h3>
              <p className="indent-8">
                Sumber air bersih yang digunakan di RSUD Al-Mulk adalah air Artesis dan Air RO dan untuk sumber air minum yang digunakan kerjasama dengan pihak ke 3 yaitu Prima. Kualitas air yang disediakan di rumah sakit harus sesuai dengan Permenkes No.32 Tahun 2017 tentang standar Baku Mutu Kesehatan Lingkungan dan Persyaratan kesehatan Air Untuk Keperluan Hygiene Sanitasi, sedangkan kualitas air yang digunakan untuk keperluan khusus perlu mendapatkan perlakuan lebih lanjut untuk mendapatkan kualitas yang relevan.
              </p>
              <p>
                Untuk mendapatkan air dengan kuantitas dan kualitas sesuai dengan yang dibutuhkan harus memperhatikan upaya-upaya berikut ini :
              </p>
              <div className="pl-6 space-y-1 font-sans text-xs">
                <div>a) Pemeliharaan Unit water treatment</div>
                <div>b) Pemeriksaan air bersih dilakukan setiap 6 bulan sekali untuk mikrobiologi, kimia dan fisika</div>
                <div>c) Pemeriksaan air bersih dilakukan setiap 1 bulan sekali untuk mikrobiologi.</div>
              </div>
              <p>
                Adapun hasil pengujian laboratorium disajikan secara komprehensif pada tabel hasil pengujian di halaman berikutnya:
              </p>
            </div>
            {renderSingleFooter(10)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 11: TABEL 1. HASIL PENGUJIAN AIR BERSIH
           ===================================================================== */}
        {shouldRenderPage(11, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-11"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 1. Hasil Pengujian Air Bersih (Terintegrasi Realtime Monitoring Air)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1">Nama</th>
                      <th className="border border-slate-800 p-1">Indikator Mutu AIR BERSIH</th>
                      <th className="border border-slate-800 p-1">Nilai Normal</th>
                      {MONTH_SHORT_HEADERS.map((m) => (
                        <th key={m} className="border border-slate-800 p-1">
                          {m.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.water.tabel1AirBersih.map((row, rIdx) => (
                      <tr key={`${row.sourceLabel}-${row.indicator}-${rIdx}`}>
                        <td className="border border-slate-800 p-1 font-semibold">
                          {row.sourceLabel}
                        </td>
                        <td className="border border-slate-800 p-1">{row.indicator}</td>
                        <td className="border border-slate-800 p-1 text-center font-mono">
                          {row.normalValue}
                        </td>
                        {row.monthlyValues.map((val, mIdx) => (
                          <td
                            key={mIdx}
                            className={`border border-slate-800 p-1 text-center ${
                              val ? 'bg-white' : 'bg-slate-300/70'
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
              <p className="text-[10px] text-slate-600 italic">
                * Parameter diuji di Laboratorium Kesehatan Daerah Kota Sukabumi sesuai Permenkes No. 2 Tahun 2023 & Permenkes No. 32 Tahun 2017.
              </p>
            </div>
            {renderSingleFooter(11)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 12: TABEL 2. HASIL PENGUJIAN AIR RO (RO POLI GIGI & RO LAB MIKRO)
           ===================================================================== */}
        {shouldRenderPage(12, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-12"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 2. Hasil Pengujian Air RO (RO Poli Gigi & RO Lab Mikrobiologi)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1">Nama</th>
                      <th className="border border-slate-800 p-1">Indikator Mutu AIR BERSIH</th>
                      <th className="border border-slate-800 p-1">Nilai Normal</th>
                      {MONTH_SHORT_HEADERS.map((m) => (
                        <th key={m} className="border border-slate-800 p-1">
                          {m.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.water.tabel2AirRo.slice(0, 7).map((row, rIdx) => (
                      <tr key={`ro1-${row.indicator}-${rIdx}`}>
                        <td className="border border-slate-800 p-1 font-semibold">
                          {row.sourceLabel}
                        </td>
                        <td className="border border-slate-800 p-1">{row.indicator}</td>
                        <td className="border border-slate-800 p-1 text-center font-mono">
                          {row.normalValue}
                        </td>
                        {row.monthlyValues.map((val, mIdx) => (
                          <td
                            key={mIdx}
                            className={`border border-slate-800 p-1 text-center ${
                              val ? 'bg-white' : 'bg-slate-300/70'
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
              <p className="text-[10px] text-slate-600 italic">
                (Parameter Fisika & Kimia Lanjutan Air RO disajikan pada Halaman 13)
              </p>
            </div>
            {renderSingleFooter(12)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 13: TABEL 2. LANJUTAN AIR RO (FISIKA & KIMIA)
           ===================================================================== */}
        {shouldRenderPage(13, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-13"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 2. (Lanjutan) Hasil Pengujian Air RO — Parameter Fisika & Kimia
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1">Nama</th>
                      <th className="border border-slate-800 p-1">Indikator Mutu AIR BERSIH</th>
                      <th className="border border-slate-800 p-1">Nilai Normal</th>
                      {MONTH_SHORT_HEADERS.map((m) => (
                        <th key={m} className="border border-slate-800 p-1">
                          {m.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.water.tabel2AirRo.slice(7).map((row, rIdx) => (
                      <tr key={`ro2-${row.indicator}-${rIdx}`}>
                        <td className="border border-slate-800 p-1 font-semibold">
                          {row.sourceLabel}
                        </td>
                        <td className="border border-slate-800 p-1">{row.indicator}</td>
                        <td className="border border-slate-800 p-1 text-center font-mono">
                          {row.normalValue}
                        </td>
                        {row.monthlyValues.map((val, mIdx) => (
                          <td
                            key={mIdx}
                            className={`border border-slate-800 p-1 text-center ${
                              val ? 'bg-white' : 'bg-slate-300/70'
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
            {renderSingleFooter(13)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 14: ANALISA & REKOMENDASI AIR & 3.2 PENYEHATAN UDARA (GRAFIK)
           ===================================================================== */}
        {shouldRenderPage(14, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-14"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <p>
                Berdasarkan Tabel diatas, pemeriksaan kualitas air bersih (Sumur Gali, Artesis dan Air RO) yang dilakukan di Laboratorium Kesehatan Daerah Kota Sukabumi sesuai dengan PMK No.2 Tahun 2023 tentang Peraturan Pelaksana PP No. 66 Tahun 2014 standar Baku Mutu Kesehatan Lingkungan dan Persyaratan kesehatan Air Untuk Keperluan Hygiene Sanitasi, hasil analisanya ;
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                {compiled.water.analysisPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ol>

              <div className="font-semibold font-sans pt-1">Rekomendasi Penyehatan Air:</div>
              <ol className="list-decimal pl-6 space-y-1">
                {compiled.water.recommendationPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ol>

              <h3 className="font-bold text-sm pt-3 font-sans">
                3.2 Penyelenggaraan Penyehatan Udara, Kebisingan, Dan Pencahayaan
              </h3>
              <p>
                Hasil Upaya pemeriksaan kelembaban udara, kebisingan, dan pencahayaan sudah dilaksanakan oleh petugas sanitarian rumah sakit, dilakukan dalam satu tahun sebanyak 2 kali pemeriksaan atau 1 kali per semester di bulan Juni dan Desember.
              </p>

              <div className="pt-2">
                <div className="text-center font-bold text-xs mb-1 font-sans">
                  Grafik 2.1 Perbandingan Capaian Mutu Fisik Udara Ruangan Semester 1 & 2
                </div>
                <div className="h-44 w-full bg-slate-50 border border-slate-200 rounded p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={compiled.air.chartComparison.map((c) => ({
                        parameter: c.parameter,
                        'Semester 1 (Juni)': c.juniPct,
                        'Semester 2 (Desember)': c.desemberPct,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="parameter" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Semester 1 (Juni)" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="Semester 2 (Desember)" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {renderSingleFooter(14)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 15: HASIL PENGUKURAN UDARA & REKOMENDASI KRIS
           ===================================================================== */}
        {shouldRenderPage(15, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-15"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="text-center font-bold text-xs uppercase font-sans">
                Tabel 2. Hasil Pemeriksaan Kelembapan Udara, Pencahayaan, dan Kebisingan
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[10px] font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-2">Parameter Fisik Udara</th>
                    <th className="border border-slate-800 p-2">Semester 1 (Juni)</th>
                    <th className="border border-slate-800 p-2">Semester 2 (Desember)</th>
                    <th className="border border-slate-800 p-2">Standar Baku Mutu (KRIS)</th>
                  </tr>
                </thead>
                <tbody>
                  {compiled.air.chartComparison.map((c) => (
                    <tr key={c.parameter}>
                      <td className="border border-slate-800 p-2 font-semibold">{c.parameter}</td>
                      <td className="border border-slate-800 p-2 text-center">{c.juniPct}%</td>
                      <td className="border border-slate-800 p-2 text-center font-bold text-emerald-700">
                        {c.desemberPct}%
                      </td>
                      <td className="border border-slate-800 p-2 text-center">{c.normalPct}% (Standar KRIS)</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="font-semibold font-sans pt-2">Hasil Analisis & Rekomendasi KRIS Udara:</div>
              <div className="space-y-2 text-xs">
                <p>
                  <strong>1. Kelembaban Ruangan ({compiled.air.chartComparison[0].desemberPct}% MS):</strong> Ruangan rawat inap dan penunjang berada pada rentang 40%–60% RH. Ruangan dengan kelembaban berlebih telah dipasang exhaust fan dan dehumidifier.
                </p>
                <p>
                  <strong>2. Pencahayaan ({compiled.air.chartComparison[1].desemberPct}% MS):</strong> Ruangan rawat inap memenuhi standar KRIS (pencahayaan tidur minimal 50 Lux dan pencahayaan pemeriksaan 100–200 Lux dengan stop kontak terpisah).
                </p>
                <p>
                  <strong>3. Kebisingan ({compiled.air.chartComparison[2].desemberPct}% MS):</strong> Ruangan rawat inap & poli umum di bawah ambang batas maksimum 45–55 dB. Area berisiko dekat jalan raya dipasang peredam suara dan tanaman penghalau bising.
                </p>
              </div>
            </div>
            {renderSingleFooter(15)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 16: 3.3 PENYEHATAN PANGAN & 3.4 PENYEHATAN SARANA & BANGUNAN
           ===================================================================== */}
        {shouldRenderPage(16, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-16"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <h3 className="font-bold text-sm font-sans">
                3.3 Penyelenggaraan Penyehatan Pangan Siap Saji
              </h3>
              <p className="indent-8">
                Penyelenggaraan makanan di RSUD Al-Mulk bekerjasama dengan pihak ketiga Jasaboga (PT Kamila Satia Rasa) yang telah memiliki sertifikat laik higiene sanitasi makanan. Pengawasan rutin dilakukan 1 bulan sekali oleh Sanitarian bersama Tim PPI, meliputi inspeksi dapur pantry, pengujian sampel makanan berkala, dan evaluasi kepatuhan APD tenaga pramusaji.
              </p>

              <div className="pt-1">
                <div className="text-center font-bold text-xs mb-1 font-sans">
                  Grafik 3.1 Tren Kepatuhan Higiene Sanitasi Pangan Siap Saji (12 Bulan)
                </div>
                <div className="h-40 w-full bg-slate-50 border border-slate-200 rounded p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={compiled.food.monthlySeries.map((f) => ({
                        bulan: f.monthLabel,
                        'Skor (%)': f.nilaiPct,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" tick={{ fontSize: 9 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="Skor (%)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h3 className="font-bold text-sm pt-3 font-sans">
                3.4 Penyelenggaraan Penyehatan Sarana dan Bangunan
              </h3>
              <p className="indent-8">
                Pemeriksaan sarana dan bangunan dilakukan terhadap seluruh unit pelayanan rawat inap, rawat jalan, dan gedung penunjang sesuai dengan kriteria teknis Permenkes No. 7 Tahun 2019 serta persyaratan 12 kriteria Kelas Rawat Inap Standar (KRIS) Perpres No. 59 Tahun 2024.
              </p>
            </div>
            {renderSingleFooter(16)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 17: SARANA & BANGUNAN LANJUTAN (GRAFIK 5 INDIKATOR & ANALISA)
           ===================================================================== */}
        {shouldRenderPage(17, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-17"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="text-center font-bold text-xs mb-1 font-sans">
                Grafik 3.2 Capaian Kepatuhan 5 Indikator Sarana & Bangunan RSUD Al-Mulk (%)
              </div>
              <div className="h-44 w-full bg-slate-50 border border-slate-200 rounded p-2 font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buildingChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="indicator" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#10B981" radius={[4, 4, 0, 0]}>
                      {buildingChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#F59E0B' : '#10B981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="font-semibold font-sans pt-2">Analisis Pemenuhan Standar KRIS Sarana:</div>
              <div className="space-y-2 text-xs">
                <p>
                  <strong>1. Sarana Toilet ({buildingChartData[0]?.percentage || 91}%):</strong> Sebanyak 13 toilet rawat inap telah dievaluasi. Masih terdapat toilet yang memerlukan pemasangan pegangan tangan (handrail) difabel dan perbaikan arah bukaan pintu ke luar.
                </p>
                <p>
                  <strong>2. Sarana Lantai (100%):</strong> Seluruh lantai terbuat dari bahan kedap air, kuat, tidak berpori, dan memiliki hospital plinth (sudut lengkung/konus) sehingga mudah dibersihkan dan didesinfeksi.
                </p>
                <p>
                  <strong>3. Sarana Atap (100%):</strong> Konstruksi atap kuat, tidak bocor, kemiringan atap memadai, dan talang air dibersihkan secara rutin untuk mencegah genangan dan sarang nyamuk.
                </p>
                <p>
                  <strong>4. Sarana Langit-langit (100%):</strong> Tinggi plafon &ge; 2,8 meter dari lantai, permukaan rata tanpa celah, bebas retakan, dan dicat dengan warna terang.
                </p>
                <p>
                  <strong>5. Sarana Pintu RS (100%):</strong> Pintu ruang perawatan memiliki lebar &ge; 120 cm sehingga memudahkan akses brankar pasien darurat dan kursi roda.
                </p>
              </div>
            </div>
            {renderSingleFooter(17)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 18: TABEL 4. HASIL SARANA DAN BANGUNAN TOILET
           ===================================================================== */}
        {shouldRenderPage(18, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-18"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 4. Hasil Sarana dan Bangunan Toilet (13 Ruangan)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-[9px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1 w-8">No</th>
                      <th className="border border-slate-800 p-1">Nama Ruangan</th>
                      <th className="border border-slate-800 p-1">Lantai Tidak Licin</th>
                      <th className="border border-slate-800 p-1">Pintu Buka Keluar</th>
                      <th className="border border-slate-800 p-1">Pegangan Difabel</th>
                      <th className="border border-slate-800 p-1">Kran Berfungsi</th>
                      <th className="border border-slate-800 p-1">Status Kepatuhan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toiletRows.map((r) => (
                      <tr key={r.no}>
                        <td className="border border-slate-800 p-1 text-center font-bold">{r.no}</td>
                        <td className="border border-slate-800 p-1 font-medium">{r.roomName}</td>
                        <td className="border border-slate-800 p-1 text-center font-bold text-emerald-700">✓</td>
                        <td className="border border-slate-800 p-1 text-center">
                          {r.kriteriaPintu ? (
                            <span className="font-bold text-emerald-700">✓</span>
                          ) : (
                            <span className="font-bold text-amber-600">Proses</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1 text-center">
                          {r.kriteriaHandrail ? (
                            <span className="font-bold text-emerald-700">✓</span>
                          ) : (
                            <span className="font-bold text-amber-600">Usulan RTL</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1 text-center font-bold text-emerald-700">✓</td>
                        <td className="border border-slate-800 p-1 text-center font-semibold">
                          {r.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-600 italic">
                * Kriteria mengacu pada Lampiran Standar KRIS (Perpres No. 59 Tahun 2024 dan Petunjuk Teknis Kemenkes).
              </p>
            </div>
            {renderSingleFooter(18)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 19: TABEL 4. LANJUTAN SARANA LANTAI & ATAP RS
           ===================================================================== */}
        {shouldRenderPage(19, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-19"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 4. (Lanjutan) Hasil Pengawasan Sarana Lantai & Atap Rumah Sakit
              </div>

              <div className="space-y-2">
                <div className="font-bold text-xs text-[#002147]">A. Kepatuhan Sarana Lantai (100% Memenuhi Syarat)</div>
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1.5 w-10">No</th>
                      <th className="border border-slate-800 p-1.5">Parameter Lantai</th>
                      <th className="border border-slate-800 p-1.5">Standar Baku Mutu</th>
                      <th className="border border-slate-800 p-1.5">Kondisi Lapangan</th>
                      <th className="border border-slate-800 p-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-800 p-1.5 text-center">1</td><td className="border border-slate-800 p-1.5">Bahan Kedap Air</td><td className="border border-slate-800 p-1.5">Kedap air dan mudah dibersihkan</td><td className="border border-slate-800 p-1.5">Keramik & vinyl antibakteri tanpa celah</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                    <tr><td className="border border-slate-800 p-1.5 text-center">2</td><td className="border border-slate-800 p-1.5">Hospital Plinth (Konus)</td><td className="border border-slate-800 p-1.5">Sudut pertemuan lantai & dinding melengkung</td><td className="border border-slate-800 p-1.5">Tersedia di IGD, OK, ICU, dan Kamar Pasien</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                    <tr><td className="border border-slate-800 p-1.5 text-center">3</td><td className="border border-slate-800 p-1.5">Permukaan Lantai</td><td className="border border-slate-800 p-1.5">Rata, tidak licin, tidak berpori</td><td className="border border-slate-800 p-1.5">Kondisi baik, pemeliharaan berkala IPSRS</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-4">
                <div className="font-bold text-xs text-[#002147]">B. Kepatuhan Sarana Atap Rumah Sakit (100% Memenuhi Syarat)</div>
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1.5 w-10">No</th>
                      <th className="border border-slate-800 p-1.5">Parameter Atap</th>
                      <th className="border border-slate-800 p-1.5">Standar Baku Mutu</th>
                      <th className="border border-slate-800 p-1.5">Kondisi Lapangan</th>
                      <th className="border border-slate-800 p-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-800 p-1.5 text-center">1</td><td className="border border-slate-800 p-1.5">Kekuatan Konstruksi</td><td className="border border-slate-800 p-1.5">Kuat, tidak bocor, tahan cuaca ekstrem</td><td className="border border-slate-800 p-1.5">Struktur baja ringan & genteng beton kokoh</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                    <tr><td className="border border-slate-800 p-1.5 text-center">2</td><td className="border border-slate-800 p-1.5">Kemiringan & Talang</td><td className="border border-slate-800 p-1.5">Kemiringan cukup, saluran talang bersih</td><td className="border border-slate-800 p-1.5">Bebas genangan air dan sarang serangga</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            {renderSingleFooter(19)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 20: TABEL 4. LANJUTAN SARANA LANGIT-LANGIT & PINTU RS
           ===================================================================== */}
        {shouldRenderPage(20, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-20"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 4. (Lanjutan) Hasil Pengawasan Langit-Langit & Pintu Rumah Sakit
              </div>

              <div className="space-y-2">
                <div className="font-bold text-xs text-[#002147]">A. Kepatuhan Langit-Langit (100% Memenuhi Syarat)</div>
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1.5 w-10">No</th>
                      <th className="border border-slate-800 p-1.5">Parameter Langit-Langit</th>
                      <th className="border border-slate-800 p-1.5">Standar Baku Mutu</th>
                      <th className="border border-slate-800 p-1.5">Kondisi Lapangan</th>
                      <th className="border border-slate-800 p-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-800 p-1.5 text-center">1</td><td className="border border-slate-800 p-1.5">Tinggi Minimal</td><td className="border border-slate-800 p-1.5">&ge; 2,80 meter dari lantai</td><td className="border border-slate-800 p-1.5">Tinggi rata-rata 3,0 – 3,2 meter</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                    <tr><td className="border border-slate-800 p-1.5 text-center">2</td><td className="border border-slate-800 p-1.5">Kebersihan & Warna</td><td className="border border-slate-800 p-1.5">Warna terang, bebas jamur/noda, rapat</td><td className="border border-slate-800 p-1.5">Gypsum board dicat putih rapi tanpa retak</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-4">
                <div className="font-bold text-xs text-[#002147]">B. Kepatuhan Pintu Rumah Sakit (100% Memenuhi Syarat)</div>
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1.5 w-10">No</th>
                      <th className="border border-slate-800 p-1.5">Parameter Pintu</th>
                      <th className="border border-slate-800 p-1.5">Standar Baku Mutu</th>
                      <th className="border border-slate-800 p-1.5">Kondisi Lapangan</th>
                      <th className="border border-slate-800 p-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-800 p-1.5 text-center">1</td><td className="border border-slate-800 p-1.5">Lebar Bukaan</td><td className="border border-slate-800 p-1.5">&ge; 120 cm untuk akses brankar</td><td className="border border-slate-800 p-1.5">Semua pintu rawat inap 120 – 140 cm</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                    <tr><td className="border border-slate-800 p-1.5 text-center">2</td><td className="border border-slate-800 p-1.5">Pintu Toilet Rawat Inap</td><td className="border border-slate-800 p-1.5">Membuka ke luar atau geser (emergency)</td><td className="border border-slate-800 p-1.5">Sebagian telah disesuaikan dengan standar</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">MS</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            {renderSingleFooter(20)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 21: 3.5 PENGAMANAN LIMBAH PADAT B3 & TABEL 5
           ===================================================================== */}
        {shouldRenderPage(21, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-21"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12px] font-sans">
              <h3 className="font-bold text-sm text-[#002147]">
                3.5 Penyelenggaraan Pengamanan Limbah dan Radiasi
              </h3>
              <p className="text-justify font-serif leading-[1.65]">
                Pengelolaan limbah medis B3 di RSUD Al-Mulk dilaksanakan secara ketat mulai dari pemilahan di ruangan (kantong kuning dan safety box jarum suntik), pengangkutan internal menggunakan troli tertutup, penimbangan harian, penyimpanan berpendingin di TPS Limbah B3, serta pengangkutan akhir bekerja sama dengan pihak ketiga berizin pemusnahan termal insinerator (PT Jasa Medivest).
              </p>

              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 5. Jumlah Limbah B3 Padat Rumah Sakit (Terintegrasi Realtime Logbook)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1.5">Bulan</th>
                      <th className="border border-slate-800 p-1.5">Limbah Padat Medis (kg)</th>
                      <th className="border border-slate-800 p-1.5">Limbah Tajam (kg)</th>
                      <th className="border border-slate-800 p-1.5">Obat Kedaluwarsa (kg)</th>
                      <th className="border border-slate-800 p-1.5">Total Timbulan (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compiled.solidWaste.rows.map((row) => (
                      <tr key={row.monthName}>
                        <td className="border border-slate-800 p-1.5 font-semibold">{row.monthName}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-mono">{row.limbahPadat.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-mono">{row.limbahTajam.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-mono">{row.obatKadaluarsa.toFixed(2)}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-bold font-mono bg-slate-50">
                          {row.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-100 font-bold text-center">
                      <td className="border border-slate-800 p-1.5">TOTAL TAHUNAN</td>
                      <td className="border border-slate-800 p-1.5 font-mono">{compiled.solidWaste.totalPadat.toFixed(2)}</td>
                      <td className="border border-slate-800 p-1.5 font-mono">{compiled.solidWaste.totalTajam.toFixed(2)}</td>
                      <td className="border border-slate-800 p-1.5 font-mono">{compiled.solidWaste.totalObat.toFixed(2)}</td>
                      <td className="border border-slate-800 p-1.5 font-mono text-emerald-900 font-black">
                        {compiled.solidWaste.grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {renderSingleFooter(21)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 22: ANALISA KESESUAIAN LIMBAH B3 & RTL KRIS
           ===================================================================== */}
        {shouldRenderPage(22, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-22"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="font-semibold text-sm font-sans text-[#002147]">
                Analisa Kesesuaian Pengamanan Limbah B3 Padat:
              </div>
              <p>
                Berdasarkan data Tabel 5 diatas, total timbulan limbah medis padat B3 selama tahun {reportYear} mencapai <strong>{compiled.solidWaste.grandTotal.toFixed(2)} kg</strong> dengan rata-rata bulanan sebesar <strong>{compiled.solidWaste.monthlyAverage.toFixed(2)} kg/bulan</strong>. Proporsi terbesar terdiri dari limbah padat infeksius ({compiled.solidWaste.padatPct}%), limbah benda tajam ({compiled.solidWaste.tajamPct}%), dan obat kedaluwarsa ({compiled.solidWaste.obatPct}%).
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                {compiled.solidWaste.dynamicAnalysisPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ol>

              <div className="font-semibold text-sm pt-3 font-sans text-[#002147]">
                Rencana Tindak Lanjut (RTL) Kesiapan KRIS Limbah B3:
              </div>
              <ol className="list-decimal pl-6 space-y-1.5 text-xs font-sans">
                <li>
                  <strong>Pengadaan Wadah Limbah B3 Khusus Ruangan:</strong> Menambah pedal bin tertutup dengan kantong plastik kuning berlogo biohazard pada setiap kamar rawat inap KRIS.
                </li>
                <li>
                  <strong>Pemeliharaan Cold Storage TPS LB3:</strong> Melakukan pengecekan rutin suhu cold storage TPS tetap di bawah 0°C untuk menjaga kepatuhan batas simpan &gt;2 hari.
                </li>
                <li>
                  <strong>Pelatihan Pemilahan Limbah Medis:</strong> Refreshing SOP pemilahan limbah medis vs domestik bagi seluruh perawat dan petugas kebersihan pihak ketiga (PT Cita Mulia).
                </li>
                <li>
                  <strong>Optimalisasi Digitalisasi Manifest (FESTRONIK):</strong> Memastikan seluruh manifes pengangkutan terbit secara elektronik dan terarsip otomatis pada sistem Sikesling.
                </li>
              </ol>
            </div>
            {renderSingleFooter(22)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 23: TARGET & WAKTU; 3.6 PENYELENGGARAAN PENYEHATAN LIMBAH CAIR
           ===================================================================== */}
        {shouldRenderPage(23, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-23"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="font-semibold text-sm font-sans text-[#002147]">
                Target dan Waktu Pemenuhan Kesiapan Pengelolaan Limbah B3:
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[10px] font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-2">Program Tindak Lanjut</th>
                    <th className="border border-slate-800 p-2">Target Capaian</th>
                    <th className="border border-slate-800 p-2">Waktu Pelaksanaan</th>
                    <th className="border border-slate-800 p-2">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-2">Standarisasi Tempat Sampah Injak Kamar Pasien</td><td className="border border-slate-800 p-2 text-center">100% Kamar KRIS</td><td className="border border-slate-800 p-2 text-center">Semester I</td><td className="border border-slate-800 p-2">Unit Kesling & Logistik</td></tr>
                  <tr><td className="border border-slate-800 p-2">Monitoring Suhu TPS Berpendingin</td><td className="border border-slate-800 p-2 text-center">Suhu &lt;0°C Setiap Hari</td><td className="border border-slate-800 p-2 text-center">Berkala Mingguan</td><td className="border border-slate-800 p-2">Sanitarian Kesling</td></tr>
                  <tr><td className="border border-slate-800 p-2">Sosialisasi Pemilahan Spuit & Benda Tajam</td><td className="border border-slate-800 p-2 text-center">Nol Needle Stick Injury</td><td className="border border-slate-800 p-2 text-center">Triwulan I & III</td><td className="border border-slate-800 p-2">Tim PPI & Kesling</td></tr>
                </tbody>
              </table>

              <h3 className="font-bold text-sm pt-4 font-sans text-[#002147]">
                3.6 Penyelenggaraan Penyehatan Limbah B3 Cair (Instalasi Pengolahan Air Limbah / IPAL)
              </h3>
              <p className="indent-8">
                Air limbah medis dan domestik yang dihasilkan seluruh kegiatan operasional rumah sakit dialirkan melalui pipa tertutup menuju Instalasi Pengolahan Air Limbah (IPAL). Pengolahan menggunakan teknologi gabungan anaerobik dan aerasi biofilter, diikuti proses sedimentasi dan klorinasi sebelum dibuang ke badan air penerima.
              </p>
              <p>
                Pemeriksaan kualitas air limbah dilakukan setiap bulan untuk titik <strong>IPAL INLET</strong> dan <strong>IPAL OUTLET</strong> oleh Laboratorium Lingkungan Terakreditasi, dengan baku mutu mengacu pada <strong>Permen LHK No. P.68/Menlhk/Setjen/Kum.1/8/2016</strong>.
              </p>
            </div>
            {renderSingleFooter(23)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 24: TABEL 6. HASIL PEMERIKSAAN LIMBAH CAIR INLET DAN OUTLET
           ===================================================================== */}
        {shouldRenderPage(24, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-24"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-6 sm:p-8 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[10px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 6. Hasil Pemeriksaan Limbah Cair IPAL Inlet dan Outlet (12 Bulan)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-[8.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-800 p-1">Titik Uji</th>
                      <th className="border border-slate-800 p-1">Parameter Mutu</th>
                      <th className="border border-slate-800 p-1">Baku Mutu</th>
                      {MONTH_SHORT_HEADERS.map((m) => (
                        <th key={m} className="border border-slate-800 p-1">
                          {m.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wastewaterCombinedRows.map((r, idx) => (
                      <tr key={`${r.samplingPoint}-${r.indicator}-${idx}`}>
                        <td
                          className={`border border-slate-800 p-1 font-bold text-center ${
                            r.samplingPoint === 'IPAL INLET' ? 'bg-amber-50' : 'bg-emerald-50'
                          }`}
                        >
                          {r.samplingPoint}
                        </td>
                        <td className="border border-slate-800 p-1">{r.indicator}</td>
                        <td className="border border-slate-800 p-1 text-center font-mono">
                          {r.normalValue}
                        </td>
                        {r.monthlyValues.map((m, mIdx) => (
                          <td
                            key={mIdx}
                            className={`border border-slate-800 p-1 text-center font-mono ${
                              m.status === 'TMS' && r.samplingPoint === 'IPAL OUTLET'
                                ? 'bg-red-500 text-white font-bold'
                                : ''
                            }`}
                          >
                            {m.displayValue}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[9.5px] text-slate-600 italic">
                * Baku mutu mengacu pada PermenLHK No. P.68 Tahun 2016 tentang Baku Mutu Air Limbah Domestik/Fasilitas Pelayanan Kesehatan.
              </p>
            </div>
            {renderSingleFooter(24)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 25: ANALISA PENGUJIAN LIMBAH CAIR IPAL (INLET)
           ===================================================================== */}
        {shouldRenderPage(25, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-25"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <h3 className="font-bold text-sm font-sans text-[#002147]">
                Analisa Hasil Pengujian Limbah Cair IPAL
              </h3>

              <div className="font-semibold font-sans">1. Gambaran Umum Operasional IPAL:</div>
              <p className="indent-8">
                Air limbah rumah sakit bersumber dari kegiatan medis (rawat inap, rawat jalan, laboratorium, farmasi) dan kegiatan penunjang (laundry, gizi/dapur, toilet pengunjung). Seluruh air limbah dialirkan melalui jaringan perpipaan tertutup menuju bak penampung awal (sump pit), bak ekualisasi, kemudian diproses melalui biofilter anaerobik dan aerasi sebelum melalui clarifier sedimentasi dan dosing klorin desinfeksi.
              </p>

              <div className="font-semibold font-sans pt-2">2. Analisa Kualitas Limbah Cair Inlet:</div>
              <p className="indent-8">
                Pada titik IPAL Inlet, karakteristik limbah cair mencerminkan beban organik dan mikrobiologis yang tinggi dari seluruh aktivitas rumah sakit:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>BOD5 dan COD:</strong> Konsentrasi BOD5 inlet rata-rata berkisar antara 85 – 125 mg/L dan COD mencapai 160 – 240 mg/L, menunjukkan beban organik yang memerlukan aerasi memadai.
                </li>
                <li>
                  <strong>Total Suspended Solids (TSS):</strong> Nilai TSS inlet rata-rata 60 – 95 mg/L berasal dari partikel padat tersuspensi dari cucian dan toilet.
                </li>
                <li>
                  <strong>Total Coliform:</strong> Kandungan bakteri coliform inlet mencapai &gt;16.000 MPN/100ml, membuktikan limbah cair harus melewati desinfeksi klorin efektif.
                </li>
                <li>
                  <strong>pH dan Suhu:</strong> Nilai pH inlet berkisar 6,8 – 7,5 dengan suhu normal berkisar 26°C – 28°C yang sangat mendukung pertumbuhan bakteri pengurai pada biofilter IPAL.
                </li>
              </ul>
            </div>
            {renderSingleFooter(25)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 26: ANALISA PENGUJIAN LIMBAH CAIR IPAL (OUTLET)
           ===================================================================== */}
        {shouldRenderPage(26, 'BAB_3_MONITORING') && (
          <section
            id="f4-page-26"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="font-semibold font-sans text-sm text-[#002147]">
                3. Analisa Kualitas Limbah Cair Outlet Terhadap Baku Mutu:
              </div>
              <p className="indent-8">
                Hasil pengujian pada titik IPAL Outlet menunjukkan tingkat kepatuhan terhadap baku mutu PermenLHK No. P.68 Tahun 2016 mencapai <strong>{compiled.wastewater.outletComplianceRate}% Memenuhi Syarat (MS)</strong>:
              </p>

              <div className="space-y-2 text-xs font-sans">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>A. Parameter Fisika (TSS):</strong> Rata-rata konsentrasi TSS outlet sebesar 12 – 18 mg/L (Baku mutu &le; 30 mg/L). Reduksi padatan tersuspensi berjalan sangat baik melalui pengendapan di bak sedimentasi akhir.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>B. Parameter Kimia (BOD5, COD, Amoniak, Minyak Lemak):</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>BOD5 outlet stabil pada rentang 8 – 16 mg/L (Baku mutu &le; 30 mg/L).</li>
                    <li>COD outlet stabil pada rentang 28 – 52 mg/L (Baku mutu &le; 100 mg/L).</li>
                    <li>Amoniak outlet berkisar 0,8 – 3,2 mg/L (Baku mutu &le; 10 mg/L).</li>
                    <li>Minyak dan lemak &lt; 1,0 mg/L (Baku mutu &le; 5 mg/L) terbantu grease trap dapur.</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>C. Parameter Mikrobiologi (Total Coliform):</strong> Nilai Total Coliform outlet berkisar 200 – 1.800 MPN/100ml (Baku mutu &le; 3.000 MPN/100ml). Sistem dosing klorin berfungsi optimal mematikan bakteri patogen.
                </div>
              </div>
            </div>
            {renderSingleFooter(26)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 27: EVALUASI KINERJA IPAL & 3.7 PENGAMANAN LIMBAH RADIASI
           ===================================================================== */}
        {shouldRenderPage(27, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-27"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="font-semibold font-sans text-sm text-[#002147]">
                4. Efisiensi Reduksi & Rekomendasi IPAL:
              </div>
              <p className="indent-8">
                Efisiensi reduksi rata-rata sistem IPAL RSUD Al-Mulk tercatat sebesar <strong>{compiled.wastewater.avgBodReduction}% untuk BOD5</strong> dan <strong>&gt;80% untuk COD dan TSS</strong>. Hal ini membuktikan bahwa proses biologis aerob-anaerob berjalan sangat efektif. Rekomendasi lanjutan mencakup pengurasan lumpur aktif berkala setiap 6 bulan serta kalibrasi pompa dosing klorin bulanan.
              </p>

              <h3 className="font-bold text-sm pt-3 font-sans text-[#002147]">
                3.7 Penyelenggaraan Pengamanan Limbah Radiasi
              </h3>
              <p className="indent-8">
                Instalasi Radiologi RSUD Al-Mulk mengoperasikan peralatan pesawat sinar-X diagnostik. Pengamanan proteksi radiasi diawasi ketat sesuai ketentuan BAPETEN (Badan Pengawas Tenaga Nuklir) dan Permenkes No. 7 Tahun 2019. Seluruh personil radiografer dilengkapi dengan dosimeter saku TLD badge, dinding ruangan dilapisi timbal (Pb 2 mm), dan uji kebocoran radiasi dilakukan secara berkala.
              </p>

              <div className="text-center font-bold text-xs uppercase font-sans">
                Tabel 7. Pemantauan Paparan Radiasi & Kepatuhan APD (Januari – April {reportYear})
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[10px] font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-1.5">Bulan</th>
                    <th className="border border-slate-800 p-1.5">Uji Kebocoran Ruangan</th>
                    <th className="border border-slate-800 p-1.5">Dosis Personil (TLD Badge)</th>
                    <th className="border border-slate-800 p-1.5">Kondisi Apron Pb</th>
                    <th className="border border-slate-800 p-1.5">Status Izin BAPETEN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">Januari</td><td className="border border-slate-800 p-1.5 text-center">&lt; 0,1 mR/jam (Aman)</td><td className="border border-slate-800 p-1.5 text-center">&lt; Ambang Batas</td><td className="border border-slate-800 p-1.5 text-center">Baik (Tanpa Retak)</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">Berlaku</td></tr>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">Februari</td><td className="border border-slate-800 p-1.5 text-center">&lt; 0,1 mR/jam (Aman)</td><td className="border border-slate-800 p-1.5 text-center">&lt; Ambang Batas</td><td className="border border-slate-800 p-1.5 text-center">Baik (Tanpa Retak)</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">Berlaku</td></tr>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">Maret</td><td className="border border-slate-800 p-1.5 text-center">&lt; 0,1 mR/jam (Aman)</td><td className="border border-slate-800 p-1.5 text-center">&lt; Ambang Batas</td><td className="border border-slate-800 p-1.5 text-center">Baik (Tanpa Retak)</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">Berlaku</td></tr>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">April</td><td className="border border-slate-800 p-1.5 text-center">&lt; 0,1 mR/jam (Aman)</td><td className="border border-slate-800 p-1.5 text-center">&lt; Ambang Batas</td><td className="border border-slate-800 p-1.5 text-center">Baik (Tanpa Retak)</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">Berlaku</td></tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(27)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 28: TABEL RADIASI MEI-DESEMBER & ANALISA RTL RADIASI
           ===================================================================== */}
        {shouldRenderPage(28, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-28"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="text-center font-bold text-xs uppercase font-sans">
                Tabel 7. (Lanjutan) Pemantauan Radiasi (Mei – Desember {reportYear})
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[10px] font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-1.5">Bulan</th>
                    <th className="border border-slate-800 p-1.5">Uji Kebocoran Ruangan</th>
                    <th className="border border-slate-800 p-1.5">Dosis Personil (TLD Badge)</th>
                    <th className="border border-slate-800 p-1.5">Kondisi Apron Pb</th>
                    <th className="border border-slate-800 p-1.5">Status Izin BAPETEN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">Mei–Agustus</td><td className="border border-slate-800 p-1.5 text-center">&lt; 0,1 mR/jam (Aman)</td><td className="border border-slate-800 p-1.5 text-center">&lt; Ambang Batas</td><td className="border border-slate-800 p-1.5 text-center">Baik (Lengkap)</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">Berlaku</td></tr>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">September–Desember</td><td className="border border-slate-800 p-1.5 text-center">&lt; 0,1 mR/jam (Aman)</td><td className="border border-slate-800 p-1.5 text-center">&lt; Ambang Batas</td><td className="border border-slate-800 p-1.5 text-center">Baik (Lengkap)</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">Berlaku</td></tr>
                </tbody>
              </table>

              <div className="font-semibold font-sans pt-2">Analisa & RTL Proteksi Radiasi:</div>
              <ol className="list-decimal pl-6 space-y-1.5 text-xs font-sans">
                <li>Seluruh personil radiografer rutin menggunakan TLD badge dan dilakukan pembacaan berkala ke Balai Pengamanan Fasilitas Kesehatan (BPFK).</li>
                <li>Peralatan pelindung diri (apron timbal tebal 0,35–0,5 mm Pb, pelindung gonad, dan kaca timbal operator) dalam keadaan baik dan utuh tanpa retak.</li>
                <li>Izin operasional BAPETEN untuk pesawat sinar-X diagnostik terverifikasi aktif dan terdokumentasi rapi.</li>
                <li>Limbah developer/fixer cair (jika ada) ditampung dalam wadah khusus berlabel bahan berbahaya dan tidak dibuang ke saluran air umum.</li>
              </ol>
            </div>
            {renderSingleFooter(28)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 29: 3.8 PENGENDALIAN VEKTOR & GRAFIK BAR
           ===================================================================== */}
        {shouldRenderPage(29, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-29"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <h3 className="font-bold text-sm font-sans text-[#002147]">
                3.8 Penyelenggaraan Pengendalian Vektor dan Binatang Pembawa Penyakit
              </h3>
              <p className="indent-8">
                Pengendalian vektor bertujuan mewujudkan lingkungan rumah sakit bebas dari jentik nyamuk (Aedes aegypti), lalat, kecoa, dan tikus yang berpotensi menularkan penyakit nosokomial. Pengendalian dilakukan secara fisik, mekanik, biologis, dan kimiawi bekerja sama dengan tenaga pest control profesional.
              </p>

              <div className="text-center font-bold text-xs uppercase font-sans">
                Grafik 8.1 Persentase Capaian Ruangan Bebas Vektor Rumah Sakit (%)
              </div>
              <div className="h-44 w-full bg-slate-50 border border-slate-200 rounded p-2 font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compiled.vector.bars}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 8.5 }} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Bebas Vektor (%)">
                      {compiled.vector.bars.map((_, idx) => (
                        <Cell
                          key={`vec-bar-${idx}`}
                          fill={vectorBarColors[idx % vectorBarColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="font-semibold font-sans pt-2">Analisis Hasil Pengendalian Vektor:</div>
              <p className="text-xs">
                Angka Bebas Jentik (ABJ) rata-rata tercatat <strong>{compiled.vector.bars[0].value}%</strong> (Standar nasional &ge; 95%). Indeks kepadatan lalat di area pantry/TPS sebesar {compiled.vector.bars[5].value}%, kecoa {compiled.vector.bars[6].value}%, dan tikus {compiled.vector.bars[7].value}%.
              </p>
            </div>
            {renderSingleFooter(29)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 30: RTL VEKTOR & 3.9 PENGAWASAN LINEN / LAUNDRY
           ===================================================================== */}
        {shouldRenderPage(30, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-30"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="font-semibold font-sans text-sm text-[#002147]">
                Rencana Tindak Lanjut (RTL) Pengendalian Vektor:
              </div>
              <ol className="list-decimal pl-6 space-y-1.5 text-xs font-sans">
                <li>
                  <strong>Pemberantasan Sarang Nyamuk (PSN) 3M Plus:</strong> Melakukan pemeriksaan jentik rutin setiap hari Jumat di seluruh dispenser air minum, pot tanaman, bak penampungan air, dan saluran luar.
                </li>
                <li>
                  <strong>Pemasangan Fly Trap & Insect Killer:</strong> Menambah perangkat sticky trap dan lampu insect killer ultraviolet di ruang gizi, pantry, dan koridor selasar rawat inap.
                </li>
                <li>
                  <strong>Pengendalian Tikus (Rodent Control):</strong> Memasang perangkap hidup (live trap) dan penutupan lubang akses pipa pada plafon dan selokan luar.
                </li>
              </ol>

              <h3 className="font-bold text-sm pt-4 font-sans text-[#002147]">
                3.9 Penyelenggaraan Pengawasan Linen / Laundry
              </h3>
              <p className="indent-8">
                Pengelolaan linen rumah sakit dilaksanakan melalui kerja sama (MoU) dengan pihak ketiga yang memiliki fasilitas pencucian berstandar yaitu <strong>RS BHAYANGKARA SETUKPA</strong>. Pengawasan kepatuhan pengelolaan linen dilakukan setiap 1 bulan sekali bersama Tim PPI.
              </p>

              <div className="text-center font-bold text-xs uppercase font-sans">
                Tabel 8. Hasil Pengawasan Kepatuhan Pengelolaan Linen (12 Bulan {reportYear})
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[10px] font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-1.5">Bulan</th>
                    <th className="border border-slate-800 p-1.5">Pemilahan Infeksius</th>
                    <th className="border border-slate-800 p-1.5">Suhu Cuci (65–77°C)</th>
                    <th className="border border-slate-800 p-1.5">Penyetrikaan (160°C)</th>
                    <th className="border border-slate-800 p-1.5">Capaian Mutu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">Jan – Jun</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% Sesuai</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% Sesuai</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% Sesuai</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% MS</td></tr>
                  <tr><td className="border border-slate-800 p-1.5 text-center font-bold">Jul – Des</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% Sesuai</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% Sesuai</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% Sesuai</td><td className="border border-slate-800 p-1.5 text-center font-bold text-emerald-700">100% MS</td></tr>
                </tbody>
              </table>
            </div>
            {renderSingleFooter(30)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 31: ANALISA PENGELOLAAN LINEN
           ===================================================================== */}
        {shouldRenderPage(31, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-31"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <div className="font-semibold font-sans text-sm text-[#002147]">
                Analisa Pengelolaan Linen Rumah Sakit:
              </div>
              <p className="indent-8">
                Berdasarkan hasil monitoring terpadu bersama Tim Pencegahan dan Pengendalian Infeksi (PPI), seluruh tahapan alur pengelolaan linen berjalan tertib:
              </p>
              <div className="space-y-2 text-xs font-sans">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>1. Tahap Pengumpulan & Pemilahan di Ruangan:</strong> Linen infeksius dimasukkan langsung ke kantong plastik kuning bertanda biohazard dan tidak diletakkan di lantai. Petugas memakai sarung tangan tebal dan celemek.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>2. Tahap Pengangkutan Internal & Eksternal:</strong> Pengangkutan menggunakan troli terpisah bertutup rapat antara troli linen kotor dan troli linen bersih. Kerja sama pihak ketiga memastikan pengangkutan tepat waktu.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>3. Tahap Pencucian & Desinfeksi:</strong> Pencucian menggunakan air panas bersuhu 65°C–77°C selama minimal 30 menit, ditambahkan desinfektan klorin untuk linen infeksius dan bahan pelembut ramah serat.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <strong>4. Tahap Penyimpanan Linen Bersih:</strong> Disimpan dalam lemari bertutup rapat dengan jarak 20 cm dari lantai, menerapkan prinsip FIFO (First In First Out), dan bebas debu serta serangga.
                </div>
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
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-12 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-4 text-[12.5px] leading-[1.65] text-justify font-serif">
              <h3 className="font-bold text-sm font-sans text-[#002147]">
                3.10 Penyelenggaraan Pengawasan Dekontaminasi Melalui Disinfeksi dan Sterilisasi
              </h3>
              <p className="indent-8">
                Proses sterilisasi alat medis kritis dilakukan bekerja sama dengan Instalasi CSSD <strong>RSUD R. Syamsudin SH</strong> melalui perjanjian kerja sama (MoU). Pengawasan mutu sterilisasi dilakukan 6 bulan sekali dengan menggunakan indikator biologi dan kimia (Memenuhi Syarat).
              </p>

              <h3 className="font-bold text-sm pt-2 font-sans text-[#002147]">
                3.11 Penanggung Jawab Pelaksana
              </h3>
              <p className="indent-8">
                Seluruh program kesehatan lingkungan dilaksanakan oleh Instalasi Kesehatan Lingkungan bekerja sama dengan Instalasi Pemeliharaan Sarana Rumah Sakit (IPSRS), Tim Pencegahan dan Pengendalian Infeksi (PPI), Bagian Logistik, dan Unit Kebersihan pihak ketiga.
              </p>

              <h3 className="font-bold text-sm pt-2 font-sans text-[#002147]">
                3.12 Evaluasi Kegiatan
              </h3>
              <p className="indent-8">
                Evaluasi pelaksanaan pengelolaan dan pemantauan lingkungan rumah sakit dilakukan secara berkala tiap semester dan dilaporkan ke Dinas Lingkungan Hidup (DLH) Kota Sukabumi serta Dinas Kesehatan setiap Bulan Juni dan Desember. Rekapitulasi evaluasi masalah dan tindak lanjut disajikan pada Tabel 19 di halaman berikutnya.
              </p>
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
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 19. Identifikasi Masalah dan Tindak Lanjut Kesehatan Lingkungan (Bagian 1: Item 1 – 3)
              </div>
              <p className="text-[10px] text-slate-600">
                Terintegrasi secara realtime dari modul Supervisi & Tindak Lanjut Temuan Lapangan
              </p>

              <table className="w-full border-collapse border border-slate-800 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-2 w-10">NO</th>
                    <th className="border border-slate-800 p-2 w-1/3">MASALAH KESLING</th>
                    <th className="border border-slate-800 p-2 w-1/3">TINDAK LANJUT MASALAH</th>
                    <th className="border border-slate-800 p-2 w-1/3">HASIL TINDAK LANJUT</th>
                  </tr>
                </thead>
                <tbody>
                  {compiled.evaluasi.rows.slice(0, 3).map((row) => (
                    <tr key={row.no}>
                      <td className="border border-slate-800 p-2 text-center font-bold align-top">
                        {row.no}
                      </td>
                      <td className="border border-slate-800 p-2 align-top">
                        <div className="font-semibold text-slate-900">{row.masalahKesling}</div>
                        {row.sourceBadge && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-[#002147] border border-blue-200 text-[9px] font-bold">
                            {row.sourceBadge}
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-800 p-2 align-top space-y-1">
                        {row.tindakLanjutMasalah.map((tl, i) => (
                          <div key={i}>• {tl}</div>
                        ))}
                      </td>
                      <td className="border border-slate-800 p-2 align-top space-y-1 text-emerald-800 font-medium">
                        {row.hasilTindakLanjut.map((htl, i) => (
                          <div key={i}>✓ {htl}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-slate-500 italic">
                (Tabel 19 Item 4 s/d 6 bersambung ke Halaman 34)
              </p>
            </div>
            {renderSingleFooter(33)}
          </section>
        )}

        {/* =====================================================================
            HALAMAN 34: TABEL 19. LANJUTAN (ITEM 4-6)
           ===================================================================== */}
        {shouldRenderPage(34, 'BAB_3_EVALUASI_PENUTUP') && (
          <section
            id="f4-page-34"
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-8 sm:p-10 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-3 text-[11px] font-sans">
              <div className="text-center font-bold text-xs uppercase tracking-wide">
                Tabel 19. (Lanjutan) Identifikasi Masalah dan Tindak Lanjut Kesehatan Lingkungan (Item 4 – 6)
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-800 p-2 w-10">NO</th>
                    <th className="border border-slate-800 p-2 w-1/3">MASALAH KESLING</th>
                    <th className="border border-slate-800 p-2 w-1/3">TINDAK LANJUT MASALAH</th>
                    <th className="border border-slate-800 p-2 w-1/3">HASIL TINDAK LANJUT</th>
                  </tr>
                </thead>
                <tbody>
                  {compiled.evaluasi.rows.slice(3, 6).map((row) => (
                    <tr key={row.no}>
                      <td className="border border-slate-800 p-2 text-center font-bold align-top">
                        {row.no}
                      </td>
                      <td className="border border-slate-800 p-2 align-top">
                        <div className="font-semibold text-slate-900">{row.masalahKesling}</div>
                        {row.sourceBadge && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-[#002147] border border-blue-200 text-[9px] font-bold">
                            {row.sourceBadge}
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-800 p-2 align-top space-y-1">
                        {row.tindakLanjutMasalah.map((tl, i) => (
                          <div key={i}>• {tl}</div>
                        ))}
                      </td>
                      <td className="border border-slate-800 p-2 align-top space-y-1 text-emerald-800 font-medium">
                        {row.hasilTindakLanjut.map((htl, i) => (
                          <div key={i}>✓ {htl}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
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
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-5 text-[13px] leading-[1.8] text-justify font-serif">
              <div className="text-center font-bold text-base uppercase space-y-0.5 mb-6 font-sans">
                <div>BAB IV</div>
                <div>PENUTUP</div>
              </div>

              <p className="indent-8">
                Demikian laporan tahunan ini kami susun sebagai bentuk pertanggungjawaban atas pelaksanaan program kesehatan lingkungan di Rumah Sakit RSUD Al-Mulk selama tahun {reportYear}. Kami menyadari bahwa keberhasilan yang telah dicapai tidak terlepas dari kerjasama dan dukungan semua pihak, baik dari manajemen rumah sakit, tenaga medis, staf, serta masyarakat sekitar.
              </p>
              <p className="indent-8">
                Selama tahun ini, kami telah melaksanakan berbagai upaya untuk memastikan lingkungan rumah sakit yang bersih, sehat, dan aman bagi pasien, tenaga kesehatan, dan pengunjung. Namun demikian, kami juga menyadari masih ada beberapa tantangan yang harus dihadapi dan ditingkatkan, baik dari segi kebijakan, fasilitas, maupun kesadaran seluruh pihak terkait.
              </p>
              <p className="indent-8">
                Melalui laporan ini, kami berharap dapat memberikan gambaran yang jelas mengenai pencapaian dan kendala yang ada, serta menjadi dasar untuk merencanakan langkah-langkah perbaikan di tahun mendatang. Kami berkomitmen untuk terus meningkatkan kualitas lingkungan rumah sakit sebagai bagian dari upaya memberikan pelayanan kesehatan yang terbaik.
              </p>
              <p className="indent-8">
                Akhir kata, kami mengucapkan terima kasih kepada seluruh pihak yang telah berkontribusi dalam pencapaian yang ada. Semoga kerja sama yang baik ini dapat terus berlanjut demi menciptakan lingkungan yang sehat, aman, dan nyaman bagi semua yang ada di rumah sakit ini.
              </p>

              <div className="pt-10 pr-6 text-right space-y-1 font-sans">
                <p>Sukabumi, 31 Desember {reportYear}</p>
                <p className="font-semibold pt-2">Instalasi Kesehatan Lingkungan</p>
                <p className="font-semibold">UOBK RSUD Al-Mulk Kota Sukabumi</p>
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
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between items-center text-center print:shadow-none print:border-none"
          >
            <div className="my-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#002147] text-[#D2B48C] flex items-center justify-center shadow-lg border-2 border-[#D2B48C]">
                <Layers className="w-10 h-10" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#002147] uppercase tracking-widest font-sans">
                LAMPIRAN DAN DOKUMENTASI
              </h2>
              <div className="w-24 h-1.5 bg-[#5B9BD5] mx-auto rounded-full" />
              <p className="text-sm text-slate-600 max-w-md mx-auto font-sans">
                Laporan Hasil Pemeriksaan Fisik Udara, Logbook Limbah Medis B3 12 Bulan, Checklist Linen, Jasaboga, Pantry RS & Dokumentasi Foto Lapangan Tahun {reportYear}
              </p>
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
            className="bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-10 sm:p-14 flex flex-col justify-between print:shadow-none print:border-none"
          >
            <div className="space-y-5 text-[12px] font-sans">
              <div className="text-center space-y-1 border-b-2 border-[#002147] pb-3">
                <h2 className="font-extrabold text-base uppercase text-[#002147]">
                  DAFTAR DOKUMENTASI KEGIATAN KESEHATAN LINGKUNGAN TAHUN {reportYear}
                </h2>
                <p className="text-[11px] text-slate-600">
                  UOBK RSUD Al-Mulk Kota Sukabumi
                </p>
              </div>

              <div className="space-y-2">
                {[
                  ['Dokumentasi – 1', 'Kegiatan Sampling Air Bersih 2025', 'Halaman 147 – 148'],
                  ['Dokumentasi – 2', 'Kegiatan Sampling Kelembaban Udara, Kebisingan, Dan Pencahayaan 2025', 'Halaman 153 – 155'],
                  ['Dokumentasi – 3', 'Kegiatan Pengangkutan LB3 2025', 'Halaman 151 – 152'],
                  ['Dokumentasi – 4', 'Kegiatan Sampling Air Limbah 2025 & Pengolahan IPAL', 'Halaman 149 – 150'],
                  ['Dokumentasi – 5', 'Kegiatan Pengamanan Radiasi 2025', 'Halaman 158'],
                  ['Dokumentasi – 6', 'Kegiatan Penyehatan Pangan Siap Saji (JASA BOGA) 2025', 'Halaman 159 – 160'],
                  ['Dokumentasi – 7', 'Penyelenggaraan Linen 2025 & Sarana Sanitasi/K3', 'Halaman 161 – 165'],
                  ['Dokumentasi – 8', 'Pengendalian Vektor dan Binatang Pembawa Penyakit 2025', 'Halaman 156 – 157'],
                ].map(([code, title, hal]) => (
                  <div
                    key={code}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-[#002147] text-[#D2B48C] text-[10px] font-bold">
                        {code}
                      </span>
                      <span className="font-semibold text-slate-800">{title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 font-bold">{hal}</span>
                  </div>
                ))}
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
        )}
      </div>
    </div>
  );
}
