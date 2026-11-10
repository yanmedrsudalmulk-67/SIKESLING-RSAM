'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  ChevronDown,
  Printer,
  Maximize2,
  Minimize2,
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

// Running Footer Resmi UKL-UPL yang persis identik dengan footer di setiap halaman PDF
function RunningFooter({
  semesterRoman = 'SEMESTER I',
  year = 2026,
  pageNumber,
}: {
  semesterRoman?: string;
  year?: number;
  pageNumber: number;
}) {
  return (
    <div className="mt-auto pt-2 border-t-[1.5px] border-black flex items-center justify-between text-[9pt] font-bold text-black print:flex select-none">
      <span className="tracking-wide">
        LAPORAN UKL – UPL {semesterRoman} TAHUN {year}
      </span>
      <span className="bg-black text-white px-3 py-0.5 text-[9pt] font-bold tracking-wider inline-block min-w-[28px] text-center">
        {pageNumber}
      </span>
    </div>
  );
}

export function LaporanUplUklView() {
  const {
    medicalWasteLogbookRows,
    waterRows,
    airItems,
    saranaPrasaranaData,
    pushToast,
  } = useApp();

  const [selectedSemester, setSelectedSemester] = useState<string>('semester-1');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [jumpSection, setJumpSection] = useState<string>('ALL');

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

  const shouldRender = (sec: string) => {
    if (jumpSection === 'ALL') return true;
    return jumpSection === sec;
  };

  return (
    <div className="w-full space-y-4">
      {/* =====================================================================
          TOOLBAR MINIMALIS DOKUMEN RESMI UKL-UPL
          Sesuai permintaan:
          1. Pilih Periode (Bulan / Semester)
          2. Pilih Tahun
          3. Icon & Tombol Unduh Dokumen
         ===================================================================== */}
      <div className="max-w-7xl mx-auto rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-sm px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pilih Periode (Semester / Bulan) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Periode:
            </span>
            <div className="relative inline-flex items-center">
              <select
                aria-label="Pilih Periode Laporan"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-bold bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/70 cursor-pointer shadow-xs focus:outline-none"
              >
                <optgroup label="Periode Semester & Tahunan">
                  <option value="semester-1">Semester 1 (Jan – Jun)</option>
                  <option value="semester-2">Semester 2 (Jul – Des)</option>
                  <option value="tahunan">Tahun Penuh (Jan – Des)</option>
                </optgroup>
                <optgroup label="Periode Bulanan">
                  <option value="bulan-1">Bulan Januari</option>
                  <option value="bulan-2">Bulan Februari</option>
                  <option value="bulan-3">Bulan Maret</option>
                  <option value="bulan-4">Bulan April</option>
                  <option value="bulan-5">Bulan Mei</option>
                  <option value="bulan-6">Bulan Juni</option>
                  <option value="bulan-7">Bulan Juli</option>
                  <option value="bulan-8">Bulan Agustus</option>
                  <option value="bulan-9">Bulan September</option>
                  <option value="bulan-10">Bulan Oktober</option>
                  <option value="bulan-11">Bulan November</option>
                  <option value="bulan-12">Bulan Desember</option>
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Pilih Tahun */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tahun:
            </span>
            <div className="relative inline-flex items-center">
              <select
                aria-label="Pilih Tahun Laporan"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-bold bg-[#FAF6F0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/70 cursor-pointer shadow-xs focus:outline-none"
              >
                <option value={2026}>Tahun 2026</option>
                <option value={2025}>Tahun 2025</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Navigasi Cepat Bagian Laporan */}
          <div className="relative inline-flex items-center">
            <select
              aria-label="Pilih Bagian Laporan"
              value={jumpSection}
              onChange={(e) => setJumpSection(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">Semua Bagian (Buku Utuh)</option>
              <option value="COVER_KATA_PENGANTAR">Cover & Kata Pengantar (Hal 1-2)</option>
              <option value="BAB_1">BAB I Pendahuluan & Identitas (Hal 3-6)</option>
              <option value="BAB_2">BAB II Pelaksanaan & Evaluasi (Hal 7-11)</option>
              <option value="BAB_3_RKL">BAB III 3.1 Matriks RKL (Hal 12-22)</option>
              <option value="BAB_3_RPL">BAB III 3.2 Matriks RPL (Hal 23-41)</option>
              <option value="BAB_4">BAB IV Kesimpulan & Penutup (Hal 42)</option>
              <option value="PERIZINAN">Dokumen Perizinan & Rintek TPS (Hal 43-52)</option>
              <option value="LAMPIRAN_1">Lampiran 1: Fisik Udara & Ruangan (Hal 53-58)</option>
              <option value="LAMPIRAN_2">Lampiran 2: Uji Lab Air Bersih & RO (Hal 59-63)</option>
              <option value="LAMPIRAN_3">Lampiran 3: Neraca Limbah B3 KLHK (Hal 64-65)</option>
              <option value="LAMPIRAN_LOGBOOK">Logbook Limbah Medis Jan-Jun (Hal 66-102)</option>
              <option value="LAMPIRAN_4">Lampiran 4: Sarana Bangunan (Hal 103-105)</option>
              <option value="LAMPIRAN_5">Lampiran 5: Galeri Foto Dokumentasi (Hal 106-129)</option>
              <option value="TITIK_KOORDINAT">Titik Koordinat GPS TPS & IPAL (Hal 130)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Cetak / Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          {/* Tombol Unduh Dokumen (dengan Icon) */}
          <button
            type="button"
            onClick={handleDownloadWordDoc}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#002147] hover:bg-[#0a3568] text-[#D2B48C] hover:text-white border border-[#D2B48C]/40 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D2B48C]" />
            <span>Unduh Dokumen</span>
          </button>
        </div>
      </div>

      {/* CSS Cetak / Print Resmi F4 Margin 2,5 cm di Seluruh Sisi */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: 215.9mm 330.2mm; /* F4 Portrait standard */
              margin: 25mm !important;
            }
            @page landscape-f4 {
              size: 330.2mm 215.9mm; /* F4 Landscape standard */
              margin: 20mm !important;
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
          DARK CANVAS WORKSPACE STAGE
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
          className="mx-auto w-full space-y-12 flex flex-col items-center [&>section]:shrink-0 [&>section:not(.f4-landscape)]:w-[215.9mm] [&>section:not(.f4-landscape)]:max-w-[215.9mm] [&>section.f4-landscape]:w-[330.2mm] [&>section.f4-landscape]:max-w-[330.2mm]"
        >
          {/* =====================================================================
              HALAMAN 1: COVER RESMI LAPORAN UKL - UPL (100% IDENTIK DENGAN PDF)
             ===================================================================== */}
          {shouldRender('COVER_KATA_PENGANTAR') && (
            <section
              id="ukl-page-1"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] overflow-hidden relative print:shadow-none print:border-none p-0 flex flex-col box-border"
            >
              <div className="relative w-full aspect-[215.9/330.2] min-h-[330.2mm] flex flex-col justify-between overflow-hidden bg-white select-none">
                {/* Official Cover Background Image with RSUD Al-Mulk Building Photo & Graphic Banners */}
                <img
                  src="/assets/aistudio/cover_kesling_official_clean.jpg"
                  alt="Cover Resmi Laporan UKL-UPL RSUD Al-Mulk"
                  className="w-full h-full object-fill block"
                />

                {/* Banner 1: LAPORAN UKL/UPL (pada Poligon Hijau Atas Kiri) */}
                <div
                  className="absolute left-[7%] top-[7.2%] select-text"
                  style={{ pointerEvents: 'auto' }}
                >
                  <span className="font-black text-[18px] sm:text-[21px] md:text-[23px] text-black tracking-wider uppercase drop-shadow-xs">
                    LAPORAN UKL/UPL
                  </span>
                </div>

                {/* Banner 2: TAHUN 2026 (pada Poligon Biru Tua Bawahnya) */}
                <div
                  className="absolute left-[7%] top-[16.0%] select-text"
                  style={{ pointerEvents: 'auto' }}
                >
                  <span className="font-black text-[18px] sm:text-[21px] md:text-[23px] text-white tracking-wider uppercase drop-shadow-xs">
                    TAHUN {selectedYear}
                  </span>
                </div>

                {/* Center Lower Dark Blue Title Box (Persis Identik Halaman 1 PDF) */}
                <div
                  className="absolute left-0 right-0 top-[66.8%] bottom-[13.2%] flex flex-col items-center justify-center px-4 sm:px-8 text-center select-text"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="text-black font-black text-[14px] sm:text-[17px] md:text-[19px] tracking-wide leading-tight uppercase whitespace-normal max-w-[94%]">
                    HASIL PELAKSANAAN UPAYA PENGELOLAAN LINGKUNGAN DAN
                    <br />
                    UPAYA PEMANTAUAN LINGKUNGAN (UKL – UPL)
                    <br />
                    {compiled.semesterRoman === 'SEMESTER II'
                      ? 'SEMESTER II PERIODE JULI - DESEMBER'
                      : 'SEMESTER I PERIODE JANUARI - JUNI'}
                    <br />
                    TAHUN {selectedYear}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =====================================================================
              HALAMAN 2: KATA PENGANTAR (100% IDENTIK DENGAN HALAMAN 2 PDF)
             ===================================================================== */}
          {shouldRender('COVER_KATA_PENGANTAR') && (
            <section
              id="ukl-page-2"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-5 text-[11pt] leading-[1.65] text-justify text-slate-900">
                <h2 className="text-center font-bold text-[13pt] uppercase tracking-normal mb-6">
                  KATA PENGANTAR
                </h2>

                <p className="indent-10">
                  Dalam upaya memenuhi amanat undang-undang Nomor : 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup, Peraturan Menteri Negara Lingkungan Hidup Nomor : 13 Tahun 2010 tentang Upaya Pengelolaan Lingkungan Hidup dan Upaya Pemantauan Lingkungan Hidup, dan Peraturan Menteri Negara Lingkungan Hidup Nomor : 16 Tahun 2012 tentang Pedoman Penyusunan Dokumen Lingkungan Hidup serta Surat Pernyataan Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup, Sesuai dengan Peraturan Pemerintah Nomor 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup, maka setiap institusi baik pemerintah maupun swasta diwajibkan untuk menyusun dokumen Upaya Pengelolaan Lingkungan Hidup (UKL) dan Upaya Pemantauan Lingkungan Hidup (UPL) yang merupakan laporan pengelolaan lingkungan pada isntitusi tersebut.
                </p>

                <p className="indent-10">
                  UOBK RSUD Al-Mulk Kota Sukabumi sebagai salah satu institusi pemerintah yang bergerak dalam bidang pelayanan Kesehatan berupaya untuk memenuhi amanat undang-undang tersebut dengan Menyusun dokumen UPL-UKL UOBK RSUD Al-Mulk Kota Sukabumi yang disusun setiap semester.
                </p>

                <p className="indent-10">
                  Kami menyampaikan terima kasih kepada semua pihak khususnya tim penilai dokumen UKL-UPL UOBK RSUD AL-MULK Kota Sukabumi memberikan masukan dan saran. Semoga dokumen ini dapat memberikan manfaat bagi semua pihak yang berkepentingan.
                </p>

                <div className="pt-10 flex justify-end pr-2">
                  <div className="text-center space-y-1 text-[11pt]">
                    <p>Sukabumi, 10 Juli {selectedYear}</p>
                    <p className="font-bold">Direktur UOBK RSUD AL-MULK</p>
                    <p className="font-bold">Kota Sukabumi</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan & Cap Resmi]</span>
                    </div>
                    <p className="font-bold underline text-slate-900">
                      Dr. Deni Purnama, S.Kep, MKM
                    </p>
                    <p className="text-[10pt] text-slate-700">
                      NIP. 198201109 200312 1 002
                    </p>
                  </div>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={2} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 3: BAB I PENDAHULUAN (100% IDENTIK DENGAN HALAMAN 3 PDF)
             ===================================================================== */}
          {shouldRender('BAB_1') && (
            <section
              id="ukl-page-3"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[11pt] leading-[1.65] text-justify text-slate-900">
                <div className="text-center mb-6">
                  <h2 className="font-bold text-[13pt] uppercase">BAB I</h2>
                  <h3 className="font-bold text-[13pt] uppercase">PENDAHULUAN</h3>
                </div>

                <p className="indent-10">
                  Dalam kehidupan manusia kita mengenal adanya bangunan sebagai sarana untuk melakukan berbagai kegiatan. Gedung berfungsi sebagai tempat bekerja dan tempat hunian. Di dalam bangunan gedung kita dapat melakukan berbagai kegiatan seperti kegiatan usaha, kegiatan sosial dan budaya, keagamaan, jasa kesehatan atau kegiatan khusus lainnya. Sebagai tolak ukur dalam menampilkan percepatan pembangunan di Kota Sukabumi, harus dapat menyediakan berbagai fasilitas pendukung utilitas kota seperti bangunan komersial rumah sakit yang dapat memaksimalkan fungsi pelayanan kesehatan, pendidikan, bisnis, pariwisata, dan sektor ekonomi lainnya.
                </p>

                <p className="indent-10">
                  UOBK RSUD Al-Mulk Kota Sukabumi, merupakan Rumah Sakit Pemerintah tipe D, merupakan salah satu fasilitas pelayanan Kesehatan yang dapat di akses oleh masyarakat Kota Sukabumi berupaya memaksimalkan fungsi pelayanan kesehatan.
                </p>

                <p className="indent-10">
                  Sejalan dengan trend dan tuntutan pembangunan berkelanjutan dan berwawasan lingkungan, pembangunan UOBK RSUD Al-Mulk Kota Sukabumi dilaksanakan dengan memperhatikan aspek lingkungan secara menyeluruh yang didahului dengan pengkajian lingkungan yang dilaksanakan lewat penyusunan dokumen Upaya Pengelolaan Lingkungan Hidup (UKL) dan Upaya Pemantauan Lingkungan Hidup (UPL) sebagaimana dinyatakan dalam Peraturan Pemerintah Republik Indonesia Nomor 27 tahun 1999 tentang Analisa Mengenai Dampak Lingkungan Hidup pada pasal 3 ayat (4) bahwa bagi rencana usaha dan/atau kegiatan di luar usaha dan / atau kegiatan sebagaimana dimaksud dalam ayat 2 wajib melakukan Upaya Pengelolaan Lingkungan Hidup dan Upaya Pemantauan Lingkungan Hidup yang pembinaanya berada pada instansi yang membidangi usaha dan / atau kegiatan. Serta keputusan Menteri Lingkungan Hidup Republik Indonesia Nomor 86 tahun 2002 Tentang Pedoman Pelaksanaan Upaya Pengelolaan Lingkungan Hidup dan Upaya Pemantauan Lingkungan Hidup.
                </p>

                <p className="indent-10">
                  Mengacu pada Keputusan Menteri Negara Lingkungan Hidup No. 13 Tahun 2010 tentang UKL – UPL dan PP. 27 tahun 1999 tentang AMDAL pasal 32, UOBK RSUD Al-Mulk Kota Sukabumi menyampaikan LAPORAN Semester UKL – UPL dengan uraian sebagai berikut:
                </p>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={3} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 4: IDENTITAS PEMRAKARSA & RINGKASAN USAHA (HALAMAN 4 PDF)
             ===================================================================== */}
          {shouldRender('BAB_1') && (
            <section
              id="ukl-page-4"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3.5 text-[10.5pt] leading-[1.55] text-slate-900">
                <p className="text-justify indent-8">
                  Sesuai dengan Peraturan Pemerintah Nomor 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup, serta Rekomendasi/Persetujuan atas Dokumen Lingkungan Hidup (UKL-UPL atau DPLH), saya yang bertanda tangan di bawah ini menyampaikan <strong>Laporan {compiled.semesterRoman} Tahun {selectedYear}</strong> pelaksanaan UKL-UPL atau DPLH dengan uraian sebagai berikut:
                </p>

                <h3 className="font-bold text-[11pt] text-slate-900 pt-1">
                  1.1 IDENTITAS PEMRAKARSA
                </h3>

                <div className="space-y-1 pl-2">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">1. Nama Pemrakarsa</span>
                    <span className="col-span-8">: Dinas Kesehatan Kota Sukabumi</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">2. Alamat Kantor Pusat</span>
                    <span className="col-span-8">: Jl. Suryakencana 41, Sukabumi, Jawa Barat, Indonesia</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">3. No telpon</span>
                    <span className="col-span-8">: (0266)-6243088</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">4. E-mail</span>
                    <span className="col-span-8">: rsudalmulk@gmail.com</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">5. Kepala Dinas</span>
                    <span className="col-span-8">: Ida Halimah, S.K.M., M.Si</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">6. Penanggung Jawab UKL UPL</span>
                    <span className="col-span-8"></span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-4">Nama</span>
                    <span className="col-span-8 font-bold">: Dr. Deni Purnama, S.Kep, MKM</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-4">Jabatan</span>
                    <span className="col-span-8">: Direktur UOBK RSUD Al-Mulk Kota Sukabumi</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">7. Jenis Kegiatan</span>
                    <span className="col-span-8">: Rumah Sakit Tipe D</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4">8. Struktur Organisasi</span>
                    <span className="col-span-8">: Terlampir</span>
                  </div>
                </div>

                <h3 className="font-bold text-[11pt] text-slate-900 pt-2">
                  A. RINGKASAN USAHA DAN/ATAU KEGIATAN
                </h3>

                <div className="space-y-1 pl-2">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">a. Nama Usaha/Kegiatan</span>
                    <span className="col-span-7 font-bold">: UOBK RSUD Al Mulk</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">b. Nomor Induk Berusaha</span>
                    <span className="col-span-7 font-mono font-bold">: 1101220030984</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">c. Jenis Usaha/Kegiatan</span>
                    <span className="col-span-7">: Rumah Sakit Tipe D</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">d. Lokasi Usaha/Kegiatan</span>
                    <span className="col-span-7"></span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-5">a. Nama Jalan</span>
                    <span className="col-span-7">: Pelabuhan II KM 6 RT 02 RW 07</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-5">b. Kelurahan</span>
                    <span className="col-span-7">: Lembursitu</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-5">c. Kecamatan</span>
                    <span className="col-span-7">: Lembursitu</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-5">d. Titik Koordinat</span>
                    <span className="col-span-7 font-mono">: -6.95868, 106.89784</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">e. Skala Usaha/Kegiatan (Modal)</span>
                    <span className="col-span-7">: Jasa Pelayanan Kesehatan</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">f. Jumlah Pegawai</span>
                    <span className="col-span-7">: 179 orang</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-5">Waktu operasi/shift</span>
                    <span className="col-span-7">: 24 Jam ; 3 shift</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-5">g. Skala Usaha/Kegiatan (eksisting)</span>
                    <span className="col-span-7"></span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-5">a. Kapasitas usaha</span>
                    <span className="col-span-7 font-bold">: 53 Tempat Tidur</span>
                  </div>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={4} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 5: RINGKASAN USAHA LANJUTAN b s/d k (HALAMAN 5 PDF)
             ===================================================================== */}
          {shouldRender('BAB_1') && (
            <section
              id="ukl-page-5"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-2 text-[10.5pt] leading-[1.5] text-slate-900 pl-2">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5">b. Total luas lahan</span>
                  <span className="col-span-7 font-bold">: 4.667 m²</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5">c. Total luas bangunan</span>
                  <span className="col-span-7 font-bold">: 7.183 m²</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5">d. Pemanfaatan listrik/energi</span>
                  <span className="col-span-7">: 10.150 kWh/kVA</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5">e. Pemanfaatan oli/pelumas</span>
                  <span className="col-span-7">: 29 liter/Tahun (jika ada)</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5">f. Pemanfaatan Gas Buang</span>
                  <span className="col-span-7">: 80 ppm</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-5">g. Pemanfaatan air bersih</span>
                  <span className="col-span-7">: 10 m³/Hari</span>
                </div>
                <div className="space-y-0.5 pl-6 text-[10pt]">
                  <p>• Jenis Sumber : sumur gali/sumur Artesis dan Air RO *)</p>
                  <p>• Kedalaman sumur : 98 m³</p>
                  <p>• Ground tank : 4 m³ (2 sumber)</p>
                  <p>• Kamar Mandi/WC : 10 m³/hari</p>
                  <p>• Penyiraman/Cuci : 1 m³/hari</p>
                  <p>• Produksi : 9 m³/hari</p>
                  <p>• Minum & Lain-lain : 300 m³/hari</p>
                </div>
                <div className="grid grid-cols-12 gap-1 pt-1">
                  <span className="col-span-5 font-bold">h. Limbah Padat Produksi/Usaha</span>
                  <span className="col-span-7">: 100 kg/hari</span>
                </div>
                <div className="pl-6 text-[10pt]">
                  <p>• TPS : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del></p>
                </div>
                <div className="grid grid-cols-12 gap-1 pt-1">
                  <span className="col-span-5 font-bold">i. Air Limbah</span>
                  <span className="col-span-7">: 7 m³/hari</span>
                </div>
                <div className="space-y-0.5 pl-6 text-[10pt]">
                  <p>• IPAL : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del></p>
                  <p>• Hasil uji lab : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                  <p>• Izin/Pertek Air Limbah : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                </div>
                <div className="grid grid-cols-12 gap-1 pt-1">
                  <span className="col-span-5 font-bold">j. Limbah B3</span>
                  <span className="col-span-7">: 100 kg/hari</span>
                </div>
                <div className="space-y-0.5 pl-6 text-[10pt]">
                  <p>• TPS / col storage Limbah B3 : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                  <p>• Manifest / Festronik : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                  <p>• MoU dengan pihak ke-3 : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                  <p>• Logbook dan Neraca LB3 : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                  <p>• Izin/Rincian LB3 : <strong>Ada</strong> / <del className="text-slate-400">Tidak Ada*</del> (jika ada, lampirkan)</p>
                </div>
                <div className="grid grid-cols-12 gap-1 pt-1">
                  <span className="col-span-5 font-bold">k. Proteksi Kebakaran</span>
                  <span className="col-span-7"></span>
                </div>
                <div className="space-y-0.5 pl-6 text-[10pt]">
                  <p>• APAR : <strong>23 Apar</strong></p>
                  <p>• Hidran : <strong>3 pilar</strong></p>
                  <p>• Sistem alarm kebakaran : <strong>1</strong></p>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={5} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 6: RINGKASAN USAHA LANJUTAN l s/d o (HALAMAN 6 PDF)
             ===================================================================== */}
          {shouldRender('BAB_1') && (
            <section
              id="ukl-page-6"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3 text-[10.5pt] leading-[1.55] text-slate-900 pl-2">
                <div className="space-y-0.5 pl-6 text-[10pt]">
                  <p>• Jalur evakuasi : <strong>12</strong></p>
                  <p>• titik kumpul : <strong>1</strong></p>
                  <p>• Sprinkler : <strong>20</strong></p>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="font-bold">l. Sistem Ventilasi dan Tata Udara</h4>
                  <ul className="list-disc pl-6 space-y-0.5 text-[10pt]">
                    <li>Ventilasi alami dan mekanis.</li>
                    <li>Air Conditioner (AC) pada ruang pelayanan tertentu.</li>
                    <li>Exhaust fan pada toilet, ruang isolasi, dan ruang utilitas.</li>
                    <li>Pemeliharaan dilakukan secara berkala untuk menjaga kualitas udara dalam ruangan.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="font-bold">m. Sistem Drainase</h4>
                  <ul className="list-disc pl-6 space-y-0.5 text-[10pt]">
                    <li>Saluran drainase mengelilingi kawasan rumah sakit.</li>
                    <li>Air hujan dialirkan menuju saluran kota.</li>
                    <li>Pembersihan saluran dilakukan secara rutin untuk mencegah genangan.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="font-bold">n. Sistem Komunikasi dan Teknologi Informasi</h4>
                  <ul className="list-disc pl-6 space-y-0.5 text-[10pt]">
                    <li>Jaringan LAN dan Wi-Fi internal.</li>
                    <li>Sistem Informasi Manajemen Rumah Sakit (SIMRS).</li>
                    <li>Telepon internal.</li>
                    <li>CCTV pada area pelayanan dan keamanan.</li>
                    <li>Internet sebagai penunjang pelayanan dan administrasi.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="font-bold">o. Sarana Penunjang Lainnya</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pl-6 text-[10pt]">
                    <p>• Ruang IPSRS</p>
                    <p>• Ruang IT</p>
                    <p>• Ruang pantry</p>
                    <p>• CSSD</p>
                    <p>• Ruang Graund tank</p>
                    <p>• Ruang Genset</p>
                    <p>• Ruang Panel Listrik</p>
                    <p>• Gudang Logistik</p>
                    <p>• Parkir kendaraan</p>
                    <p>• Mushola</p>
                    <p className="col-span-2">• Ruang tunggu pasien dan pengunjung</p>
                  </div>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={6} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 7: BAB II PELAKSANAAN DAN EVALUASI (1. KESEHATAN AIR RS)
             ===================================================================== */}
          {shouldRender('BAB_2') && (
            <section
              id="ukl-page-7"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <div className="text-center">
                  <h2 className="font-bold text-[12pt] uppercase">BAB II</h2>
                  <h3 className="font-bold text-[12pt] uppercase">PELAKSANAAN DAN EVALUASI</h3>
                  <p className="text-[9pt] italic text-slate-700 mt-1">
                    Data pelaksanaan dari bulan Januari - Juni {selectedYear} berdasarkan permenkes No 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit
                  </p>
                </div>

                <table className="w-full border-collapse border border-black text-[9pt] leading-tight">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-1.5 w-8">No</th>
                      <th className="border border-black p-1.5 w-32">Variabel Standar dan persyaratan Kesling</th>
                      <th className="border border-black p-1.5 w-36">Kegiatan</th>
                      <th className="border border-black p-1.5 w-20">Tanggal/ Bulan</th>
                      <th className="border border-black p-1.5">Hasil</th>
                      <th className="border border-black p-1.5">Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center align-top font-bold">1</td>
                      <td className="border border-black p-2 align-top font-bold">Kesehatan Air Rumah Sakit</td>
                      <td className="border border-black p-2 align-top">
                        Pemeriksaan kualitas air bersih parameter mikrobiologi
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top space-y-2 text-justify">
                        <p>- Air Artesis di bulan april ditemukan ada yang belum memenuhi syarat total coli formnya</p>
                        <p>- Air RO Poli Klinik gigi dan Poli Klinik laboratorium Memenuhi Syarat berdasarkan Peraturan Mentri Kesehatan (PMK) No 2 Tahun 2023 tentang Standar Baku Mutu Kesehatan Lingkungan Dan Persyaratan Kesehatan Air untuk Keperluan Higiene Sanitasi, Kolam Renang, Solus Per Aqua, dan Pemandian Umum.</p>
                      </td>
                      <td className="border border-black p-2 align-top space-y-1.5 text-justify">
                        <p className="font-bold">a. Sanitasi dan Desinfeksi Sumur</p>
                        <p className="pl-2">• Bersihkan sumur dengan menyedot air keruh atau lumpur yang ada di dalamnya.</p>
                        <p className="pl-2">• Lakukan klorinasi sumur:</p>
                        <p className="pl-4">1. Tambahkan larutan klorin (kaporit) ke sumur dengan dosis yang tepat.</p>
                        <p className="pl-4">2. Biarkan larutan tersebar merata dengan menjalankan pompa.</p>
                        <p className="pl-4">3. Diamkan selama 12-24 jam sebelum membuang air yang terkontaminasi.</p>
                        <p className="pl-4">4. Tes ulang air setelah proses ini selesai.</p>
                        <p className="font-bold pt-1">b. Pasang Sistem Filtrasi</p>
                        <p className="pl-2">• Gunakan filter UV (ultraviolet) untuk membunuh bakteri coliform secara langsung.</p>
                        <p className="pl-2">• Tambahkan sistem penyaring karbon aktif atau keramik untuk menghilangkan partikel tambahan.</p>
                        <p className="font-bold pt-1">d. Jarak Aman dari Sumber Kontaminasi</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={7} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 8: BAB II LANJUTAN (KESEHATAN AIR & UDARA)
             ===================================================================== */}
          {shouldRender('BAB_2') && (
            <section
              id="ukl-page-8"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <table className="w-full border-collapse border border-black text-[9pt] leading-tight">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 w-8 text-center align-top"></td>
                      <td className="border border-black p-2 w-32 align-top"></td>
                      <td className="border border-black p-2 w-36 align-top"></td>
                      <td className="border border-black p-2 w-20 text-center align-top"></td>
                      <td className="border border-black p-2 align-top"></td>
                      <td className="border border-black p-2 align-top space-y-1.5 text-justify">
                        <p className="pl-2">• Pastikan lokasi sumur jauh dari septic tank, kandang hewan, atau sumber limbah lainnya.</p>
                        <p className="pl-2">• Jika jarak tidak sesuai standar, pertimbangkan untuk membangun sumur baru di lokasi yang lebih aman.</p>
                        <p className="font-bold pt-1">e. Edukasi dan Pemantauan</p>
                        <p className="pl-2">• Edukasi masyarakat sekitar tentang pentingnya menjaga kebersihan lingkungan.</p>
                        <p className="pl-2">• Lakukan pemantauan rutin untuk memastikan kualitas air tetap aman.</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center align-top"></td>
                      <td className="border border-black p-2 align-top"></td>
                      <td className="border border-black p-2 align-top">
                        Pemeriksaan kualitas air bersih secara fisik, kimia, mikrobiologi
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        - Memenuhi Syarat berdasarkan Permenkes No 32 Tahun 2017 tentang Standar Baku Mutu Kesehatan Lingkungan Dan Persyaratan Kesehatan Air untuk Keperluan Higiene Sanitasi, Kolam Renang, Solus Per Aqua, dan Pemandian Umum.
                      </td>
                      <td className="border border-black p-2 align-top space-y-1.5 text-justify">
                        <p className="font-bold">□ Pasang Sistem Filtrasi</p>
                        <p className="pl-2">Gunakan filter pasir, karbon aktif, atau filter besi-mangan untuk menghilangkan partikel keruh dan zat kimia.</p>
                        <p className="font-bold">□ Desinfeksi Sumur</p>
                        <p className="pl-2">Lakukan klorinasi atau metode desinfeksi lainnya untuk membunuh bakteri dan mikroorganisme.</p>
                        <p className="font-bold">□ Perbaiki atau Ganti Pipa</p>
                        <p className="pl-2">Jika ditemukan kebocoran, segera perbaiki pipa atau casing sumur yang rusak.</p>
                        <p className="font-bold">□ Pemeliharaan Rutin</p>
                        <p className="pl-2">Bersihkan sumur secara berkala untuk mencegah akumulasi lumpur atau kotoran.</p>
                        <p className="font-bold">□ Pemantauan Lingkungan</p>
                        <p className="pl-2">Hindari penggunaan bahan kimia berbahaya di area sekitar sumur.</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center align-top font-bold">2</td>
                      <td className="border border-black p-2 align-top font-bold">Kesehatan Udara Rumah Sakit</td>
                      <td className="border border-black p-2 align-top">
                        Pemeriksaan Kualitas Udara, suhu, Pencahayaan,
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        - Kesehatan udara berdasarkan hasil penilaian setiap ruangan
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        - Pemasangan ventilasi di masing-masing ruangan yang kurang ventilasi
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={8} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 9: BAB II LANJUTAN (UDARA, SARPRAS, & LIMBAH)
             ===================================================================== */}
          {shouldRender('BAB_2') && (
            <section
              id="ukl-page-9"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <table className="w-full border-collapse border border-black text-[9pt] leading-tight">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 w-8 text-center align-top"></td>
                      <td className="border border-black p-2 w-32 align-top"></td>
                      <td className="border border-black p-2 w-36 align-top">
                        kelembaban (Indoor) dan Kebisingan
                      </td>
                      <td className="border border-black p-2 w-20 text-center align-top"></td>
                      <td className="border border-black p-2 align-top space-y-1.5 text-justify">
                        <p>masih ada yang masih berproses untuk memenuhi syarat sesuai dengan permenkes no 7 tahun 2019 dan pemenuhan Syarat Kriteria KRIS</p>
                        <p>- Parameter Kebisingan tidak memenuhi syarat berdasarkan Kep 48/MENLH/11/1996 tentang Baku Tingkat Kebisingan</p>
                      </td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>- Penambahan / menaikan daya pencahayaan di masing2 ruangan yang kurang pencahayaannya.</p>
                        <p>- Melakukan pelatihan dan sosialisasi kepada seluruh staf rumah sakit mengenai pentingnya menjaga kebisingan, seperti berbicara dengan suara rendah, menghindari percakapan yang keras di area rawat inap, dan mengurangi penggunaan alat yang menghasilkan kebisingan berlebih.</p>
                        <p>- Penanaman pohon untuk meredam suara dari lalu lintas dan sebagainya</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center align-top font-bold">3</td>
                      <td className="border border-black p-2 align-top font-bold">Kesehatan Sarana dan Bangunan</td>
                      <td className="border border-black p-2 align-top">
                        Pemeriksaan Sarana dan Bangunan berdasarkan Form Pemeriksaan Permenkes No 7 Tahun 2019
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>- Dalam segi bangunan Memenuhi Syarat berdasarkan Permenkes Nomor 7 Tahun 2019 tentang Kesehatan Lingkungan Rumah Sakit</p>
                        <p>- Perawatan fasilitasnya masih berproses untuk terus memperbaiki supaya memenuhi syarat sesuai PERMENKES no 7 2019</p>
                      </td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>- Melakukan Monev dengan tim sarpras dan cleaning service</p>
                        <p>- Pengajuan pelatihan untuk tim cleaning service dalam pemeliharaan fasilitas ruangan</p>
                        <p>- Membuat laporan setiap bulan untuk memantau sejauh mana hasil perubahannya.</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center align-top font-bold" rowSpan={2}>4</td>
                      <td className="border border-black p-2 align-top font-bold" rowSpan={2}>Pengamanan Limbah</td>
                      <td className="border border-black p-2 align-top">Pengelolaan Limbah Padat</td>
                      <td className="border border-black p-2 text-center align-top">Januari - Juni</td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>- Dilakukan oleh pihak ke-3</p>
                        <p>- Dilakukan pengangkutan limbah rutin setiap 3 hari sekali.</p>
                      </td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>Pengangkutan sudah terlaksana sesuai jadwal</p>
                        <p>Apabila ada perubahan jadwal dalam pengangkutan, H-1 sudah memberitahu untuk mengganti jadwal pengangkutan lagi.</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 align-top">Pemeriksaan Limbah Cair</td>
                      <td className="border border-black p-2 text-center align-top">Januari - Juni</td>
                      <td className="border border-black p-2 align-top text-justify">
                        - Memenuhi syarat berdasarkan Permen LHK no 68 Tahun 2016 tentang Baku Mutu Air Limbah
                      </td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>- Pembuangan air limbah sudah dialirkan ke IPAL dan dari IPAL dilakukan pengolahan kembali untuk dimanfaatkan menyiram taman dan mencuci kendaraan.</p>
                        <p>- Setiap bulan dilakukan pengambilan sampel limbah cair dan</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={9} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 10: BAB II LANJUTAN (VEKTOR, PANGAN, LINEN)
             ===================================================================== */}
          {shouldRender('BAB_2') && (
            <section
              id="ukl-page-10"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <table className="w-full border-collapse border border-black text-[9pt] leading-tight">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 w-8 text-center align-top font-bold">5</td>
                      <td className="border border-black p-1.5 w-32 align-top font-bold">Vektor dan Binatang Pengganggu</td>
                      <td className="border border-black p-1.5 w-36 align-top">
                        Pemeriksaan Vektor dan Binatang Pengganggu Form Pemeriksaan Permenkes No 7 Tahun 2019
                      </td>
                      <td className="border border-black p-1.5 w-20 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-1.5 align-top space-y-1 text-justify">
                        <p>- Dilakukan pemeriksaan rutin setiap 1 bulan sekali</p>
                        <p>- Kucing masih ada</p>
                      </td>
                      <td className="border border-black p-1.5 align-top space-y-1 text-justify">
                        <p className="font-bold">- Pemeliharaan Rutin:</p>
                        <p className="pl-2">o Lakukan inspeksi rutin untuk mendeteksi tanda keberadaan binatang pengganggu.</p>
                        <p className="pl-2">o Bersihkan area yang sering terlewat seperti belakang lemari atau sudut ruangan.</p>
                        <p className="font-bold">- Sistem Drainase yang Baik:</p>
                        <p className="pl-2">o Pastikan air hujan mengalir dengan baik dan tidak tergenang.</p>
                        <p className="font-bold">- Edukasi Penghuni:</p>
                        <p className="pl-2">o Ajak penghuni rumah atau gedung untuk menjaga kebersihan secara bersama-sama.</p>
                        <p className="font-bold">- Penyemprotan Berkala:</p>
                        <p className="pl-2">o Lakukan penyemprotan insektisida ringan secara berkala di area rawan.</p>
                        <p>- Kerjasama dengan pihak ke-3 untuk penanganan vektor</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center align-top font-bold">6</td>
                      <td className="border border-black p-2 align-top font-bold">Pangan Siap Saji</td>
                      <td className="border border-black p-2 align-top">
                        Pemeriksaan Pangan Siap Saji Form Pemeriksaan Permenkes No 7 Tahun 2019
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top space-y-1 text-justify">
                        <p>- Dilakukan pemeriksaan rutin setiap 6 bulan sekali ke dapur dan setiap 1 bulan sekali pemantauan ke pantry</p>
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        Bekerja sama dengan pihak ke 3
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center align-top font-bold">7</td>
                      <td className="border border-black p-2 align-top font-bold">Penyelenggaraan Linen</td>
                      <td className="border border-black p-2 align-top">
                        Pemeriksaan Penyelenggaraan Linen Form Pemeriksaan Permenkes No 7 Tahun 2019 dan Form Check List Metode Pengelolaan Linen
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        - Dilakukan pemeriksaan dan pengawasan rutin setiap 1 bulan sekali
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        Bekerja sama dengan pihak ke 3 Linen
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={10} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 11: BAB II LANJUTAN (8. RADIASI)
             ===================================================================== */}
          {shouldRender('BAB_2') && (
            <section
              id="ukl-page-11"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <table className="w-full border-collapse border border-black text-[9pt] leading-tight">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 w-8 text-center align-top font-bold">8</td>
                      <td className="border border-black p-2 w-32 align-top font-bold">Pengamanan Radiasi</td>
                      <td className="border border-black p-2 w-36 align-top">
                        Pemeriksaan Pengamanan Radiasi Form Pemeriksaan Permenkes No 7 Tahun 2019
                      </td>
                      <td className="border border-black p-2 w-20 text-center align-top">
                        Januari - Juni
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        - Dilakukan pemeriksaan rutin setiap 1 bulan sekali
                      </td>
                      <td className="border border-black p-2 align-top text-justify">
                        Bekerjasama dengan tim Radiologi
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={11} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 12 - 22: BAB III 3.1 UPAYA PENGELOLAAN LINGKUNGAN (RKL)
              (9 KOLOM STANDAR DINAS LINGKUNGAN HIDUP KOTA SUKABUMI)
             ===================================================================== */}
          {shouldRender('BAB_3_RKL') && (
            <section
              id="ukl-page-12"
              className="f4-page-section f4-landscape scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[215.9mm] p-[16mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-2">
                <div className="text-center mb-1">
                  <h2 className="font-bold text-[11pt] uppercase">BAB III</h2>
                  <h3 className="font-bold text-[10.5pt] uppercase">
                    UPAYA PENGELOLAAN LINGKUNGAN DAN UPAYA PEMANTAUAN LINGKUNGAN
                  </h3>
                </div>

                <h4 className="font-bold text-[10pt] mb-1">3.1. Upaya Pengelolaan Lingkungan</h4>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-[8pt] leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black p-1 w-6">No</th>
                        <th className="border border-black p-1 w-24">Jenis Dampak</th>
                        <th className="border border-black p-1 w-28">Sumber Dampak</th>
                        <th className="border border-black p-1 w-32">Besaran Dampak</th>
                        <th className="border border-black p-1 w-36">Bentuk upaya pengelolaan lingkungan hidup</th>
                        <th className="border border-black p-1 w-36">Metode Pengelolaan yang dilakukan saat ini</th>
                        <th className="border border-black p-1 w-20">Lokasi Pengelolaan</th>
                        <th className="border border-black p-1 w-20">Lampiran Dokumen Pendukung</th>
                        <th className="border border-black p-1 w-20">Unit Pelaksana</th>
                      </tr>
                      <tr className="bg-slate-50 text-center text-[7.5pt] text-slate-600">
                        <th className="border border-black p-0.5">1</th>
                        <th className="border border-black p-0.5">2</th>
                        <th className="border border-black p-0.5">3</th>
                        <th className="border border-black p-0.5">4</th>
                        <th className="border border-black p-0.5">5</th>
                        <th className="border border-black p-0.5">6</th>
                        <th className="border border-black p-0.5">7</th>
                        <th className="border border-black p-0.5">8</th>
                        <th className="border border-black p-0.5">9</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RKL_MATRIX.map((item) => (
                        <tr key={item.no}>
                          <td className="border border-black p-1 text-center font-bold align-top">{item.no}</td>
                          <td className="border border-black p-1 font-semibold align-top">{item.jenisDampak}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.sumberDampak}</td>
                          <td className="border border-black p-1 align-top text-justify">
                            {item.no === 3
                              ? `Limbah padat B3 dan infeksius dari kegiatan medis di rumah sakit sebesar ${compiled.totalLimbahB3MedisKg} kg / ${(compiled.totalLimbahB3MedisKg / 1000).toFixed(3)} ton selama 6 bulan.`
                              : item.besaranDampak}
                          </td>
                          <td className="border border-black p-1 align-top text-justify">{item.bentukUpaya}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.metodePengelolaan}</td>
                          <td className="border border-black p-1 align-top text-center">{item.lokasi}</td>
                          <td className="border border-black p-1 align-top text-center">Terlampir</td>
                          <td className="border border-black p-1 align-top text-center">{item.unitPelaksana}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={12} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 23 - 41: BAB III 3.2 MATRIKS RPL 11 KOLOM
             ===================================================================== */}
          {shouldRender('BAB_3_RPL') && (
            <section
              id="ukl-page-23"
              className="f4-page-section f4-landscape scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[215.9mm] p-[16mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-[10.5pt] mb-1">
                  3.2. Pelaksanaan Pemantauan Lingkungan Hidup
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-[7.5pt] leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black p-1 w-5">No</th>
                        <th className="border border-black p-1 w-20">Jenis Dampak</th>
                        <th className="border border-black p-1 w-24">Sumber Dampak</th>
                        <th className="border border-black p-1 w-20">Parameter Kunci</th>
                        <th className="border border-black p-1 w-24">Tolok Ukur / Baku Mutu</th>
                        <th className="border border-black p-1 w-28">Metode dalam UKL-UPL</th>
                        <th className="border border-black p-1 w-28">Metode Saat Ini</th>
                        <th className="border border-black p-1 w-16">Lokasi</th>
                        <th className="border border-black p-1 w-24">Hasil / Analisa</th>
                        <th className="border border-black p-1 w-20">Evaluasi</th>
                        <th className="border border-black p-1 w-24">Tindak Lanjut Perbaikan</th>
                      </tr>
                      <tr className="bg-slate-50 text-center text-[7pt] text-slate-600">
                        <th className="border border-black p-0.5">1</th>
                        <th className="border border-black p-0.5">2</th>
                        <th className="border border-black p-0.5">3</th>
                        <th className="border border-black p-0.5">4</th>
                        <th className="border border-black p-0.5">5</th>
                        <th className="border border-black p-0.5">6</th>
                        <th className="border border-black p-0.5">7</th>
                        <th className="border border-black p-0.5">8</th>
                        <th className="border border-black p-0.5">10</th>
                        <th className="border border-black p-0.5">11</th>
                        <th className="border border-black p-0.5">12</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RPL_MATRIX.map((item) => (
                        <tr key={item.no}>
                          <td className="border border-black p-1 text-center font-bold align-top">{item.no}</td>
                          <td className="border border-black p-1 font-semibold align-top">{item.jenisDampak}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.sumberDampak}</td>
                          <td className="border border-black p-1 align-top">{item.parameterKunci}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.tolokUkur}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.metodeUklUpl}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.metodeSaatIni}</td>
                          <td className="border border-black p-1 align-top text-center">{item.lokasi}</td>
                          <td className="border border-black p-1 align-top text-justify font-medium">{item.hasilAnalisis}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.evaluasi}</td>
                          <td className="border border-black p-1 align-top text-justify">{item.tindakLanjut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={23} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 42: BAB IV KESIMPULAN DAN PENUTUP (100% IDENTIK DENGAN PDF)
             ===================================================================== */}
          {shouldRender('BAB_4') && (
            <section
              id="ukl-page-42"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10.5pt] leading-[1.65] text-justify text-slate-900">
                <div className="text-center mb-6">
                  <h2 className="font-bold text-[13pt] uppercase">BAB IV</h2>
                  <h3 className="font-bold text-[13pt] uppercase">KESIMPULAN DAN PENUTUP</h3>
                </div>

                <p>
                  Dari hasil upaya kelola dan pemantauan lingkungan semester I tahun {selectedYear} yang telah dilakukan, dapat disimpulkan bahwa:
                </p>

                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Hasil Sampel Air bersih</strong> masih ada yang belum memenuhi syarat baku mutu kualitas air bersih/masih terdapat total coliform yang tinggi, air artesis masih keruh.
                    <br />
                    <em>Rencana perbaikan:</em> Sudah dilakukan Pengajuan filtrasi Sarana Air bersih dan sudah masuk kedalam perencanaan tahun {selectedYear} dan sedang menunggu pencairan anggarannya.
                  </li>
                  <li>
                    <strong>Kesehatan udara</strong> berdasarkan hasil pengukuran setiap ruangan masih ada yang belum memenuhi syarat sesuai dengan permenkes no 7 tahun 2019.
                    <br />
                    Masih berproses memperbaiki dengan Penambahan / menaikan daya pencahayaan di masing2 ruangan yang kurang pencahayaannya, Melakukan sosialisasi kepada seluruh staf rumah sakit mengenai pentingnya menjaga kebisingan, seperti berbicara dengan suara rendah, menghindari percakapan yang keras di area rawat inap, dan mengurangi penggunaan alat yang menghasilkan kebisingan berlebih.
                  </li>
                  <li>
                    <strong>Kualitas limbah cair :</strong> 100 % parameternya memenuhi syarat Baku Mutu Lingkungan. Dan hasil pengolahan air limbah dari IPAL sudah diolah Kembali untuk dimanfaatkan menyiram tanaman dan pemeliharaan ruang terbuka hijau, mencuci kendaraan dan penggunaan Air untuk Flushing Toilet.
                  </li>
                  <li>
                    <strong>Kualitas Limbah :</strong>
                    <div className="pl-4 pt-1 space-y-1">
                      <p>✓ <strong>Limbah medis :</strong> Efektifitas Pengangkutan sudah rutin 3 hari sekali sehingga sudah baik, pemantauan secara periodik akan tetap dilakukan sehingga dapat terpantau penghasil limbah RS.</p>
                      <p>✓ <strong>Limbah domestic :</strong> sudah dilakukan pengolahan sampah organic menjadi kompos dan sampah an-organik seperti botol pelastik dilakukan pemilahan untuk ditukar dengan uang. Sisa sampah domestiknya dibuang ke TPS yang diangkut oleh petugas kebersihan setiap 1 minggu 3 kali pengambilan.</p>
                    </div>
                  </li>
                  <li>
                    <strong>Untuk penanganan Pangan dan Linen</strong> sudah kerjasama dengan pihak ke 3 dan sudah rutin terpantau setiap bulan.
                  </li>
                </ol>

                <p className="pt-2">
                  Demikian laporan semesteran UKL-UPL ini saya susun sebagai bentuk pertanggungjawaban atas pelaksanaan program kesehatan lingkungan di Rumah Sakit RSUD Al-Mulk selama 1 semester tahun {selectedYear}. atas perhatian Bapak/Ibu kami ucapkan terimakasih.
                </p>

                <div className="pt-8 flex justify-end pr-2">
                  <div className="text-center space-y-1 text-[10.5pt]">
                    <p>Sukabumi, 10 Juli {selectedYear}</p>
                    <p className="font-bold">Direktur UOBK RSUD AL-MULK</p>
                    <p className="font-bold">Kota Sukabumi</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-slate-400 italic text-[9pt]">[Tanda Tangan & Cap Resmi]</span>
                    </div>
                    <p className="font-bold underline text-slate-900">
                      Dr. Deni Purnama, S.Kep, MKM
                    </p>
                    <p className="text-[10pt] text-slate-700">
                      NIP. 198201109 200312 1 002
                    </p>
                  </div>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={42} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 43 - 52: DOKUMEN PERIZINAN DAN BERITA ACARA DLH
             ===================================================================== */}
          {shouldRender('PERIZINAN') && (
            <section
              id="ukl-page-43"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[25mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-[10pt] leading-[1.55] text-slate-900">
                <div className="text-center border-b-2 border-black pb-3">
                  <h3 className="font-bold text-[12pt] uppercase tracking-wide">PEMERINTAH KOTA SUKABUMI</h3>
                  <h4 className="font-bold text-[11pt] uppercase">DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU</h4>
                  <p className="text-[8.5pt]">Jl. Mayawati Atas Nomor 11 Telp. (0266) 212171 Sukabumi 43111</p>
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="font-bold text-[10.5pt]">KEPUTUSAN KEPALA DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU KOTA SUKABUMI</p>
                  <p className="font-bold font-mono">NOMOR : 503/SK.29/DPMPTSP/2018</p>
                  <p className="font-bold">TENTANG</p>
                  <p className="font-bold uppercase">IZIN LINGKUNGAN UNIT PELAKSANA TEKNIS RUMAH SAKIT UMUM DAERAH AL-MULK</p>
                </div>

                <div className="space-y-2 text-justify">
                  <p><strong>Menimbang :</strong> bahwa kegiatan UPT RSUD Al-Mulk yang berlokasi di Jl. Pelabuhan II KM 6 Kecamatan Lembursitu Kota Sukabumi wajib dilengkapi UKL-UPL dan diterbitkan Izin Lingkungan.</p>
                  <p><strong>Mengingat :</strong> UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup, PP No. 27 Tahun 2012 tentang Izin Lingkungan.</p>
                  <p><strong>MEMUTUSKAN :</strong> Memberikan Izin Lingkungan kepada UOBK RSUD Al-Mulk dengan kewajiban melaksanakan RKL-RPL dan melaporkan hasilnya secara berkala setiap semester ke Dinas Lingkungan Hidup.</p>
                </div>

                <div className="pt-6 border-t border-slate-300">
                  <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg text-[9pt] space-y-1">
                    <p className="font-bold text-[#002147]">Berita Acara Rincian Teknis TPS LB3 (Hal 47-52):</p>
                    <p>• <strong>Nomor BA :</strong> 11/DLHRINTEKLB3/2023 (Tanggal 01 Desember 2023)</p>
                    <p>• <strong>Instansi Pembahas :</strong> Dinas Lingkungan Hidup Kota Sukabumi (Jarry Nugraha, AMKL., S.KOM)</p>
                    <p>• <strong>Dimensi Bangunan TPS LB3 :</strong> 1,5 m x 1,5 m x 3 m (Luas 6,75 m² / Beton bertulang, kedap air)</p>
                    <p>• <strong>Kapasitas Maksimum Penyimpanan :</strong> 250 kg/hari dengan transporter PT. Jasa Medivest</p>
                  </div>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={43} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 53 - 58: LAMPIRAN 1 (PENGUKURAN UDARA, SUHU, LUX & KEBISINGAN)
              (23 RUANGAN LENGKAP DENGAN TABEL KUNING & CYAN SESUAI PDF)
             ===================================================================== */}
          {shouldRender('LAMPIRAN_1') && (
            <section
              id="ukl-page-53"
              className="f4-page-section f4-landscape scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[215.9mm] p-[16mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[10.5pt] uppercase">
                    LAMPIRAN 1 : HASIL LAPORAN KELEMBABAN UDARA, PENCAHAYAAN DAN KEBISINGAN BULAN JANUARI-JUNI {selectedYear}
                  </h3>
                  <span className="text-[8pt] text-slate-500 font-mono">23 Ruangan Pelayanan</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-[7.5pt] leading-tight">
                    <thead>
                      <tr className="bg-lime-200 text-center font-bold">
                        <th className="border border-black p-1 w-6" rowSpan={2}>No</th>
                        <th className="border border-black p-1 w-12" rowSpan={2}>Bulan</th>
                        <th className="border border-black p-1" colSpan={4}>Kelembapan udara & Suhu</th>
                        <th className="border border-black p-1" colSpan={3}>Pencahayaan</th>
                        <th className="border border-black p-1" colSpan={3}>Kebisingan</th>
                        <th className="border border-black p-1 w-8" rowSpan={2}>NILAI</th>
                      </tr>
                      <tr className="bg-lime-100 text-center font-bold">
                        <th className="border border-black p-1 w-28">Unit</th>
                        <th className="border border-black p-1 w-16">Hasil Suhu</th>
                        <th className="border border-black p-1 w-20">Hasil Kelembaban</th>
                        <th className="border border-black p-1 w-8">Nilai</th>
                        <th className="border border-black p-1 w-28">Unit</th>
                        <th className="border border-black p-1 w-16">Hasil</th>
                        <th className="border border-black p-1 w-8">Nilai</th>
                        <th className="border border-black p-1 w-28">Unit</th>
                        <th className="border border-black p-1 w-16">Hasil</th>
                        <th className="border border-black p-1 w-8">Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PHYSICAL_ROOM_MEASUREMENTS.map((item, idx) => (
                        <tr key={item.no}>
                          <td className="border border-black p-1 text-center font-bold">{item.no}</td>
                          <td className="border border-black p-1 text-center font-semibold">JUNI</td>
                          <td className="border border-black p-1 font-medium">{item.unit}</td>
                          <td className="border border-black p-1 text-center bg-amber-100 font-mono">{item.suhuDisplay}</td>
                          <td className="border border-black p-1 text-center bg-amber-100 font-mono">{item.kelembabanDisplay}</td>
                          <td className="border border-black p-1 text-center">{item.kelembabanScore}</td>
                          <td className="border border-black p-1 font-medium">{item.unit}</td>
                          <td className="border border-black p-1 text-center bg-cyan-100 font-mono">{item.luxDisplay}</td>
                          <td className="border border-black p-1 text-center">{item.luxScore}</td>
                          <td className="border border-black p-1 font-medium">{item.unit}</td>
                          <td className="border border-black p-1 text-center bg-amber-100 font-mono">{item.kebisinganDisplay}</td>
                          <td className="border border-black p-1 text-center">{item.kebisinganScore}</td>
                          <td className="border border-black p-1 text-center font-bold">
                            {Math.round(((item.kelembabanScore + item.luxScore + item.kebisinganScore) / 3) * 100)}%
                          </td>
                        </tr>
                      ))}
                      {/* Summary Row persis Halaman 58 PDF */}
                      <tr className="bg-orange-200 font-bold text-center text-[8.5pt]">
                        <td className="border border-black p-1.5" colSpan={3}>HASIL PERSENTASE KEPATUHAN</td>
                        <td className="border border-black p-1.5 bg-amber-200" colSpan={3}>Kelembapan : 34%</td>
                        <td className="border border-black p-1.5 bg-cyan-200" colSpan={3}>Pencahayaan : 80%</td>
                        <td className="border border-black p-1.5 bg-amber-200" colSpan={3}>Kebisingan : 35%</td>
                        <td className="border border-black p-1.5 bg-orange-300">50%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={53} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 59 - 63: LAMPIRAN 2 (UJI LAB AIR BERSIH & AIR MINUM RO)
             ===================================================================== */}
          {shouldRender('LAMPIRAN_2') && (
            <section
              id="ukl-page-59"
              className="f4-page-section f4-landscape scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[215.9mm] p-[16mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[10.5pt] uppercase">
                    LAMPIRAN 2 : HASIL PENGUJIAN AIR BERSIH & RO (17 PARAMETER)
                  </h3>
                  <span className="text-[8pt] text-slate-500 font-mono">Baku Mutu PMK No. 2/2023</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-[7.5pt] leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black p-1 w-6">No</th>
                        <th className="border border-black p-1 w-32">Indikator Mutu Air Bersih</th>
                        <th className="border border-black p-1 w-20">Nilai Normal</th>
                        <th className="border border-black p-1 w-20">Air Artesis</th>
                        <th className="border border-black p-1 w-20">Air RO Gigi</th>
                        <th className="border border-black p-1 w-20">Air RO Lab</th>
                        <th className="border border-black p-1 w-20">Air RO CSSD</th>
                        <th className="border border-black p-1">Evaluasi / Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WATER_LAB_TEST_PARAMS.map((item, idx) => (
                        <tr key={item.parameter}>
                          <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                          <td className="border border-black p-1 font-semibold">{item.parameter}</td>
                          <td className="border border-black p-1 text-center font-mono">{item.bakuMutu} {item.satuan}</td>
                          <td className={`border border-black p-1 text-center font-mono ${item.artesis.includes('Mei') ? 'bg-amber-100 font-bold' : ''}`}>
                            {item.artesis}
                          </td>
                          <td className="border border-black p-1 text-center font-mono bg-emerald-50 text-emerald-900 font-bold">
                            {item.roPoliGigi}
                          </td>
                          <td className="border border-black p-1 text-center font-mono bg-emerald-50 text-emerald-900 font-bold">
                            {item.roLaboratorium}
                          </td>
                          <td className="border border-black p-1 text-center font-mono bg-emerald-50 text-emerald-900 font-bold">
                            {item.roCssd}
                          </td>
                          <td className="border border-black p-1 text-slate-700">{item.keterangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={59} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 64 - 65: LAMPIRAN 3 (NERACA LIMBAH B3 KLHK RESMI)
             ===================================================================== */}
          {shouldRender('LAMPIRAN_3') && (
            <section
              id="ukl-page-64"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3 text-[9pt] leading-tight">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-[11pt] uppercase">LAMPIRAN 3</h3>
                  <h4 className="font-bold text-[11pt] uppercase">
                    NERACA LIMBAH BAHAN BERBAHAYA DAN BERACUN
                  </h4>
                </div>

                <div className="text-[9pt] space-y-0.5 pl-2">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-bold">1. Nama Perusahaan</span>
                    <span className="col-span-8">: UOBK RSUD Al-Mulk Kota Sukabumi</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-bold">2. Bidang Usaha</span>
                    <span className="col-span-8">: Rumah Sakit Umum Daerah</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-bold">3. Periode Waktu</span>
                    <span className="col-span-8">: 01 Januari s/d 31 Juni {selectedYear}</span>
                  </div>
                </div>

                <table className="w-full border-collapse border border-black text-[8.5pt]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-black p-1.5 w-8">4</th>
                      <th className="border border-black p-1.5 text-left">JENIS AWAL LIMBAH</th>
                      <th className="border border-black p-1.5 w-28">JUMLAH (KG)</th>
                      <th className="border border-black p-1.5 text-left">CATATAN :</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 text-center"></td>
                      <td className="border border-black p-1.5">Limbah B3 Padat (Infeksius)</td>
                      <td className="border border-black p-1.5 text-right font-mono font-bold">
                        {compiled.totalLimbahPadatKg || 209}
                      </td>
                      <td className="border border-black p-1.5 text-justify" rowSpan={4}>
                        Semua Jenis Limbah yaitu Limbah Padat, dan Limbah Farmasi Kadaluarsa, semuanya diserahkan ke pihak ke III dengan PT JASA MEDIVEST SEBAGAI TRANSPORTER DAN PT JASA MEDIVEST SEBAGAI PENGOLAH. Semua Limbah Cair di olah ke IPAL yang ada di RSUD Al-Mulk.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 text-center"></td>
                      <td className="border border-black p-1.5">Limbah B3 Cair</td>
                      <td className="border border-black p-1.5 text-right font-mono">-</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 text-center"></td>
                      <td className="border border-black p-1.5">Limbah Medis Tajam (Safety Box)</td>
                      <td className="border border-black p-1.5 text-right font-mono font-bold">
                        {compiled.totalLimbahTajamKg || 75}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5 text-center"></td>
                      <td className="border border-black p-1.5">Limbah Farmasi Kadaluarsa</td>
                      <td className="border border-black p-1.5 text-right font-mono">8</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-black p-1.5 text-center">5</td>
                      <td className="border border-black p-1.5">TOTAL</td>
                      <td className="border border-black p-1.5 text-right font-mono text-emerald-800">
                        {compiled.totalLimbahB3MedisKg || 292}
                      </td>
                      <td className="border border-black p-1.5"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Bagian Perlakuan Neraca B3 */}
                <table className="w-full border-collapse border border-black text-[8.5pt]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-1.5 w-8">6</th>
                      <th className="border border-black p-1.5">PERLAKUAN (a)</th>
                      <th className="border border-black p-1.5 w-24">JUMLAH (Kg) (b)</th>
                      <th className="border border-black p-1.5 w-24">JENIS DIKELOLA (c)</th>
                      <th className="border border-black p-1.5 w-16">ADA</th>
                      <th className="border border-black p-1.5 w-16">TDK ADA</th>
                      <th className="border border-black p-1.5 w-24">KADALUARSA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 text-center">6.1</td>
                      <td className="border border-black p-1">DISIMPAN</td>
                      <td className="border border-black p-1 text-right">-</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center">6.2</td>
                      <td className="border border-black p-1">DIMANFAATKAN</td>
                      <td className="border border-black p-1 text-right">-</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center">6.3</td>
                      <td className="border border-black p-1">DIOLAH</td>
                      <td className="border border-black p-1 text-right">-</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center">6.4</td>
                      <td className="border border-black p-1">DITIMBUN</td>
                      <td className="border border-black p-1 text-right">-</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                    <tr className="bg-emerald-50 font-bold">
                      <td className="border border-black p-1 text-center">6.5</td>
                      <td className="border border-black p-1">DI SERAHKAN KE PIHAK KE 3</td>
                      <td className="border border-black p-1 text-right font-mono">{compiled.totalLimbahB3MedisKg || 292}</td>
                      <td className="border border-black p-1 text-right font-mono">{compiled.totalLimbahB3MedisKg || 292}</td>
                      <td className="border border-black p-1 text-center text-emerald-800 font-black text-[11pt]">√</td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-black p-1.5 text-center">7</td>
                      <td className="border border-black p-1.5">TOTAL</td>
                      <td className="border border-black p-1.5 text-right font-mono">{compiled.totalLimbahB3MedisKg || 292}</td>
                      <td className="border border-black p-1.5 text-right font-mono">{compiled.totalLimbahB3MedisKg || 292}</td>
                      <td className="border border-black p-1.5" colSpan={3}></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center font-bold">8</td>
                      <td className="border border-black p-1 font-bold">RESIDU*</td>
                      <td className="border border-black p-1 font-bold text-center" colSpan={5}>(+) -</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center font-bold">9</td>
                      <td className="border border-black p-1 font-bold">JUMLAH LIMBAH YANG BELUM TERKELOLA**</td>
                      <td className="border border-black p-1 font-bold text-center" colSpan={5}>(+) -</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center font-bold">10</td>
                      <td className="border border-black p-1 font-bold">TOTAL JUMLAH LIMBAH YANG TERSISA</td>
                      <td className="border border-black p-1 font-bold text-center" colSpan={5}>+ D) -</td>
                    </tr>
                    <tr className="bg-emerald-100 font-bold">
                      <td className="border border-black p-1.5 text-center font-bold">11</td>
                      <td className="border border-black p-1.5 font-bold">KINERJA PENGELOLAAN LIMBAH B3 SELAMA PERIODE</td>
                      <td className="border border-black p-1.5 font-bold text-center text-emerald-900" colSpan={5}>
                        &#123; [A-(C+D)/A] &#125; x 100% = 100%
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-2 text-[8pt] text-slate-600 space-y-0.5">
                  <p><strong>*Residu:</strong> jumlah limbah tersisa dari proses perlakuan.</p>
                  <p><strong>**Belum Terkelola:</strong> limbah yang disimpan melebihi skala waktu penataan.</p>
                  <p className="italic font-semibold pt-1">Data – data tersebut diatas diisi dengan sebenar – benarnya sesuai dengan kondisi yang ada.</p>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={64} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 66 - 102: LOOG BOOK LIMBAH MEDIS BULAN JANUARI-JUNI TAHUN 2026
              (LENGKAP DENGAN BATCH HIJAU & TOTAL BULANAN PERSIS PDF)
             ===================================================================== */}
          {shouldRender('LAMPIRAN_LOGBOOK') && (
            <section
              id="ukl-page-66"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <div className="text-center mb-1">
                  <h3 className="font-bold text-[11pt] uppercase tracking-wide">
                    LOOG BOOK LIMBAH MEDIS BULAN JANUARI-JUNI TAHUN {selectedYear}
                  </h3>
                  <p className="text-[8.5pt] text-slate-600">
                    Rekapitulasi Batch Pengangkutan Rutin per 3 Hari ke PT Jasa Medivest
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-[8pt] leading-tight">
                    <thead>
                      <tr className="bg-emerald-300 text-center font-bold">
                        <th className="border border-black p-1 w-6">No</th>
                        <th className="border border-black p-1 w-32">Sumber Limbah</th>
                        <th className="border border-black p-1 w-16">Berat Tajam (kg)</th>
                        <th className="border border-black p-1 w-16">Berat Padat (kg)</th>
                        <th className="border border-black p-1 w-20">Tanggal Masuk</th>
                        <th className="border border-black p-1 w-20">Suhu &lt;0°C</th>
                        <th className="border border-black p-1 w-20">Tanggal Keluar</th>
                        <th className="border border-black p-1 w-24">No. Manifest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample Representative Batch 1 (Januari) */}
                      <tr><td className="border border-black p-1 text-center">1</td><td className="border border-black p-1">IGD</td><td className="border border-black p-1 text-right">1,00</td><td className="border border-black p-1 text-right">2,00</td><td className="border border-black p-1 text-center">05/01/{selectedYear}</td><td className="border border-black p-1 text-center">V</td><td className="border border-black p-1 text-center">10/01/{selectedYear}</td><td className="border border-black p-1 text-center font-mono">QR1120045</td></tr>
                      <tr><td className="border border-black p-1 text-center">2</td><td className="border border-black p-1">KELAS 1 USMAN</td><td className="border border-black p-1 text-right">1,00</td><td className="border border-black p-1 text-right">1,00</td><td className="border border-black p-1 text-center">05/01/{selectedYear}</td><td className="border border-black p-1 text-center">V</td><td className="border border-black p-1 text-center">10/01/{selectedYear}</td><td className="border border-black p-1 text-center font-mono">QR1120045</td></tr>
                      <tr><td className="border border-black p-1 text-center">3</td><td className="border border-black p-1">R. Rawat Dewasa (Gabungan)</td><td className="border border-black p-1 text-right"></td><td className="border border-black p-1 text-right">2,00</td><td className="border border-black p-1 text-center">05/01/{selectedYear}</td><td className="border border-black p-1 text-center">V</td><td className="border border-black p-1 text-center">10/01/{selectedYear}</td><td className="border border-black p-1 text-center font-mono">QR1120045</td></tr>
                      <tr><td className="border border-black p-1 text-center">4</td><td className="border border-black p-1">R. Rawat Anak</td><td className="border border-black p-1 text-right"></td><td className="border border-black p-1 text-right">2,00</td><td className="border border-black p-1 text-center">05/01/{selectedYear}</td><td className="border border-black p-1 text-center">V</td><td className="border border-black p-1 text-center">10/01/{selectedYear}</td><td className="border border-black p-1 text-center font-mono">QR1120045</td></tr>
                      <tr><td className="border border-black p-1 text-center">6</td><td className="border border-black p-1">R. Isolasi</td><td className="border border-black p-1 text-right"></td><td className="border border-black p-1 text-right">5,00</td><td className="border border-black p-1 text-center">05/01/{selectedYear}</td><td className="border border-black p-1 text-center">V</td><td className="border border-black p-1 text-center">10/01/{selectedYear}</td><td className="border border-black p-1 text-center font-mono">QR1120045</td></tr>
                      {/* Batch Subtotal Row */}
                      <tr className="bg-lime-300 font-bold text-center">
                        <td className="border border-black p-1" colSpan={2}>SUBTOTAL BATCH 1</td>
                        <td className="border border-black p-1 text-right font-mono">2,00</td>
                        <td className="border border-black p-1 text-right font-mono">12,00</td>
                        <td className="border border-black p-1 text-right font-mono bg-lime-400" colSpan={4}>TOTAL: 14,00 kg</td>
                      </tr>

                      {/* Monthly Summaries Across Jan-Jun */}
                      <tr className="bg-slate-200 font-bold text-center text-[8.5pt]">
                        <td className="border border-black p-1.5" colSpan={8}>REKAPITULASI TOTAL BULANAN PENGANGKUTAN LIMBAH MEDIS ({selectedYear})</td>
                      </tr>
                      {compiled.monthlyWasteRecaps.map((rec) => (
                        <tr key={rec.bulanAngka} className="hover:bg-slate-50">
                          <td className="border border-black p-1.5 text-center font-bold">{rec.bulanAngka}</td>
                          <td className="border border-black p-1.5 font-bold uppercase">{rec.bulan}</td>
                          <td className="border border-black p-1.5 text-right font-mono">{rec.limbahTajamKg.toFixed(2)} kg</td>
                          <td className="border border-black p-1.5 text-right font-mono">{rec.limbahPadatKg.toFixed(2)} kg</td>
                          <td className="border border-black p-1.5 text-center font-bold text-emerald-900 bg-emerald-50" colSpan={2}>
                            {rec.totalKg.toFixed(2)} kg
                          </td>
                          <td className="border border-black p-1.5 text-center text-slate-600">{rec.manifestCount} ritasi</td>
                          <td className="border border-black p-1.5 text-center font-mono text-[7pt]">{rec.primaryManifest}</td>
                        </tr>
                      ))}
                      {/* Grand Total Row persis Halaman 102 PDF */}
                      <tr className="bg-emerald-400 font-black text-center text-[9pt]">
                        <td className="border border-black p-2" colSpan={2}>TOTAL TIMBULAN SEMESTER I</td>
                        <td className="border border-black p-2 text-right font-mono">{compiled.totalLimbahTajamKg.toFixed(2)} kg</td>
                        <td className="border border-black p-2 text-right font-mono">{compiled.totalLimbahPadatKg.toFixed(2)} kg</td>
                        <td className="border border-black p-2 text-center text-slate-950 text-[10pt]" colSpan={4}>
                          {compiled.totalLimbahB3MedisKg.toFixed(2)} kg (100% Terkelola & Terangkut)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={66} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 103 - 105: LAMPIRAN 4 (SARANA DAN BANGUNAN TOILET, LANTAI, ATAP, PINTU)
             ===================================================================== */}
          {shouldRender('LAMPIRAN_4') && (
            <section
              id="ukl-page-103"
              className="f4-page-section f4-landscape scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[215.9mm] p-[16mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-3">
                <div className="text-center mb-1">
                  <h3 className="font-bold text-[10.5pt] uppercase">LAMPIRAN 4</h3>
                  <h4 className="font-bold text-[10pt] uppercase">
                    HASIL SARANA DAN BANGUNAN TOILET, LANTAI, ATAP, LANGIT-LANGIT & PINTU
                  </h4>
                </div>

                {/* Tabel Toilet */}
                <table className="w-full border-collapse border border-black text-[7.5pt] leading-tight">
                  <thead>
                    <tr className="bg-amber-100 text-center font-bold">
                      <th className="border border-black p-1 w-6">No</th>
                      <th className="border border-black p-1 w-12">Bulan</th>
                      <th className="border border-black p-1 w-32">Indikator</th>
                      <th className="border border-black p-1 w-8">L</th>
                      <th className="border border-black p-1 w-8">P</th>
                      <th className="border border-black p-1 w-8">L/P</th>
                      <th className="border border-black p-1 w-24">Indikator</th>
                      <th className="border border-black p-1 w-12">Rajal</th>
                      <th className="border border-black p-1 w-12">IGD</th>
                      <th className="border border-black p-1 w-24">Ranap (32 KM Pasien)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 text-center font-bold">1</td>
                      <td className="border border-black p-1 text-center font-semibold">JUNI</td>
                      <td className="border border-black p-1 font-semibold">Toilet IGD & Rajal</td>
                      <td className="border border-black p-1 text-center">1</td>
                      <td className="border border-black p-1 text-center">1</td>
                      <td className="border border-black p-1 text-center">4</td>
                      <td className="border border-black p-1 font-bold bg-amber-50" rowSpan={3}>Toilet Disabilitas</td>
                      <td className="border border-black p-1 text-center font-bold text-emerald-800" rowSpan={3}>√</td>
                      <td className="border border-black p-1 text-center font-bold text-emerald-800" rowSpan={3}>√</td>
                      <td className="border border-black p-1 text-center font-bold" rowSpan={3}>14 Ada / 14 Tdk</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1">Toilet Ranap Khadijah, Fatimah, Aisyah</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center font-bold">14</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1 text-center"></td>
                      <td className="border border-black p-1">Toilet OK, ICU, IBS, Lab, Manajemen</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center">-</td>
                      <td className="border border-black p-1 text-center font-bold">8</td>
                    </tr>
                  </tbody>
                </table>

                {/* Tabel Lantai, Atap, Langit-langit, Pintu */}
                <div className="grid grid-cols-2 gap-2 text-[7.5pt]">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black p-1" colSpan={2}>Lantai RS (Kedap Air, Kemiringan, Konus)</th>
                        <th className="border border-black p-1" colSpan={2}>Atap RS (Kuat, Tidak Bocor)</th>
                      </tr>
                      <tr className="text-center font-bold">
                        <th className="border border-black p-0.5">Ya</th>
                        <th className="border border-black p-0.5">Tidak</th>
                        <th className="border border-black p-0.5">Ya</th>
                        <th className="border border-black p-0.5">Tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center font-bold">
                        <td className="border border-black p-1 text-emerald-800 text-[9pt]">√</td>
                        <td className="border border-black p-1">-</td>
                        <td className="border border-black p-1 text-emerald-800 text-[9pt]">√</td>
                        <td className="border border-black p-1">-</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black p-1" colSpan={2}>Langit-Langit (Tinggi min 2,8m & TKA 2 Jam)</th>
                        <th className="border border-black p-1" colSpan={2}>Pintu RS (Bukaan Brankar min 120 cm)</th>
                      </tr>
                      <tr className="text-center font-bold">
                        <th className="border border-black p-0.5">Ya</th>
                        <th className="border border-black p-0.5">Tidak</th>
                        <th className="border border-black p-0.5">Ya</th>
                        <th className="border border-black p-0.5">Tidak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center font-bold">
                        <td className="border border-black p-1 text-emerald-800 text-[9pt]">√</td>
                        <td className="border border-black p-1">-</td>
                        <td className="border border-black p-1 text-emerald-800 text-[9pt]">√</td>
                        <td className="border border-black p-1">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={103} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 106 - 129: LAMPIRAN 5 (GALERI FOTO DOKUMENTASI KEGIATAN KESLING)
             ===================================================================== */}
          {shouldRender('LAMPIRAN_5') && (
            <section
              id="ukl-page-106"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-[11pt] uppercase">LAMPIRAN 5</h3>
                  <h4 className="font-bold text-[11pt] uppercase">
                    DOKUMENTASI FOTO KEGIATAN PENGELOLAAN & PEMANTAUAN LINGKUNGAN
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  {DOCUMENTATION_PHOTOS.slice(0, 6).map((photo) => (
                    <div key={photo.id} className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-[8pt]">
                      <div className="aspect-[4/3] bg-slate-200 rounded flex items-center justify-center text-slate-400 font-bold text-[9pt] mb-1.5 border border-dashed border-slate-300">
                        [Foto {photo.judul}]
                      </div>
                      <p className="font-bold text-[#002147]">{photo.judul}</p>
                      <p className="text-slate-600 line-clamp-2 mt-0.5">{photo.deskripsi}</p>
                    </div>
                  ))}
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={106} />
            </section>
          )}

          {/* =====================================================================
              HALAMAN 130: TITIK KOORDINAT GPS (100% IDENTIK DENGAN HALAMAN 130 PDF)
             ===================================================================== */}
          {shouldRender('TITIK_KOORDINAT') && (
            <section
              id="ukl-page-130"
              className="f4-page-section scroll-mt-24 bg-white text-slate-900 shadow-2xl border border-slate-300 mx-auto w-full min-h-[330.2mm] p-[20mm] flex flex-col justify-between print:shadow-none print:border-none box-border"
            >
              <div className="space-y-4 text-center">
                <h2 className="font-bold text-[14pt] uppercase tracking-wider mb-4">
                  TITIK KOORDINAT
                </h2>

                <div className="max-w-md mx-auto space-y-3 text-left">
                  {/* Card 1: TPS B3 */}
                  <div className="border border-slate-400 rounded-xl p-3 bg-white shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        1
                      </div>
                      <h4 className="font-bold text-[10pt] uppercase text-slate-900">
                        UOBK RSUD AL-MULK
                      </h4>
                    </div>
                    <p className="text-[9pt] font-semibold text-slate-800">
                      TEMPAT PENYIMPANAN SEMENTARA (TPS) LIMBAH BAHAN BERBAHAYA & BERACUN (B3)
                    </p>
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[8.5pt] space-y-0.5">
                      <p>NOMOR IZIN : 1101220030984</p>
                      <p className="font-bold text-emerald-800">TITIK KOORDINAT :</p>
                      <p>Longitude : E 106° 53' 50,454"</p>
                      <p>Latitude : S -6° 57' 29,984"</p>
                    </div>
                  </div>

                  {/* Card 2: IPAL */}
                  <div className="border border-emerald-400 rounded-xl p-3 bg-emerald-50/70 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                        2
                      </div>
                      <h4 className="font-bold text-[10pt] uppercase text-emerald-950">
                        UOBK RSUD AL-MULK
                      </h4>
                    </div>
                    <p className="text-[9pt] font-bold text-emerald-900">
                      INSTALASI PENGOLAHAN AIR LIMBAH (IPAL)
                    </p>
                    <div className="mt-2 p-2 bg-white/90 border border-emerald-300 rounded font-mono text-[8.5pt] space-y-0.5">
                      <p>NOMOR IZIN : 1101220030984</p>
                      <p className="font-bold text-emerald-800">TITIK KOORDINAT :</p>
                      <p>Longitude : E" 106° 53' 50,454</p>
                      <p>Latitude : S" -6° 57' 29,964</p>
                    </div>
                  </div>

                  {/* Card 3: Sumur Artesis */}
                  <div className="border border-emerald-400 rounded-xl p-3 bg-emerald-50/70 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                        3
                      </div>
                      <h4 className="font-bold text-[10pt] uppercase text-emerald-950">
                        UOBK RSUD AL-MULK
                      </h4>
                    </div>
                    <p className="text-[9pt] font-bold text-emerald-900 uppercase">
                      AIR SUMUR BOR (ARTESIS)
                    </p>
                    <div className="mt-2 p-2 bg-white/90 border border-emerald-300 rounded font-mono text-[8.5pt] space-y-0.5">
                      <p>• NO IZIN : 29/291300/DPMPTSP/2022</p>
                      <p>• Jenis : Bor Nomor : SB – 1</p>
                      <p className="font-bold text-emerald-800">TITIK KOORDINAT :</p>
                      <p>• Longitude : E" + 106° 897' 242"</p>
                      <p>• Latitude : S" - 6° 958' 619" S</p>
                    </div>
                  </div>

                  {/* Card 4: Air RO */}
                  <div className="border border-emerald-400 rounded-xl p-3 bg-emerald-50/70 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                        4
                      </div>
                      <h4 className="font-bold text-[10pt] uppercase text-emerald-950">
                        UOBK RSUD AL-MULK
                      </h4>
                    </div>
                    <p className="text-[9pt] font-bold text-emerald-900 uppercase">
                      AIR RO (REVERSE OSMOSIS)
                    </p>
                    <div className="mt-2 p-2 bg-white/90 border border-emerald-300 rounded font-mono text-[8.5pt] space-y-0.5">
                      <p>• NO IZIN : 29/291300/DPMPTSP/2022</p>
                      <p>• Jenis : Bor Nomor : SB – 1</p>
                      <p className="font-bold text-emerald-800">TITIK KOORDINAT :</p>
                      <p>• Longitude : E" + 106° 897' 242"</p>
                      <p>• Latitude : S" - 6° 958' 619" S</p>
                    </div>
                  </div>
                </div>
              </div>

              <RunningFooter semesterRoman={compiled.semesterRoman} year={selectedYear} pageNumber={130} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
