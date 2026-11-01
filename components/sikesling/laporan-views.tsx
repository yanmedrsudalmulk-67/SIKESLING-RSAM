'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Layers,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import {
  PageContainer,
  PageHeader,
  FilterToolbar,
  EmptyState,
} from '@/components/sikesling/ui-system';

export function LaporanView({ routePath }: { routePath: string }) {
  const meta = resolveRouteMeta(routePath);
  const {
    activities,
    supervisions,
    findings,
    masterRooms,
    hospitalProfile,
    pushToast,
  } = useApp();

  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('10');
  const [quarter, setQuarter] = useState('Q4');
  const [semester, setSemester] = useState('Semester 2');
  const [reportCategory, setReportCategory] = useState('Semua Kategori');
  const [selectedUnit, setSelectedUnit] = useState('Semua Unit / Ruangan');
  const [previewGenerated, setPreviewGenerated] = useState(true);

  const filteredActivities = activities.filter(
    (a) =>
      selectedUnit === 'Semua Unit / Ruangan' || a.location === selectedUnit
  );
  const filteredSupervisions = supervisions.filter(
    (s) =>
      selectedUnit === 'Semua Unit / Ruangan' || s.roomOrUnit === selectedUnit
  );
  const filteredFindings = findings.filter(
    (f) =>
      selectedUnit === 'Semua Unit / Ruangan' || f.location === selectedUnit
  );

  const handleExportNotice = (format: string) => {
    pushToast({
      type: 'info',
      title: `Fitur Ekspor ${format} Dalam Tahap Pengembangan`,
      message:
        'Template kop surat dan tabel resmi laporan akan diaktifkan setelah konfirmasi format bersama petugas Kesling UOBK RSUD Al-Mulk.',
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportNotice('PDF')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5 text-[#1D7AFC]" />
              <span>Download PDF (Tahap 2)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportNotice('Excel')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Export Excel (Tahap 2)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportNotice('Cetak Laporan')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Laporan</span>
            </button>
          </div>
        }
      />

      {/* Principle Banner: Single Data Entry, Multiple Reporting Outputs */}
      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-[#EEF4FF]/50 dark:bg-slate-800/30 p-4 flex items-start gap-3">
        <Layers className="w-5 h-5 text-[#1D7AFC] dark:text-[#60A5FA] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Arsitektur Pelaporan: Single Data Entry, Multiple Reporting Outputs
          </p>
          <p>
            Petugas cukup memasukkan data satu kali pada modul <strong>Kegiatan Operasional</strong>, <strong>Monitoring</strong>, atau <strong>Supervisi Lingkungan</strong>. Sistem mengkompilasi data aktual tersebut secara otomatis untuk Laporan Bulanan, Triwulanan, Semesteran, maupun Tahunan tanpa menggunakan angka statistik fiktif.
          </p>
        </div>
      </div>

      {/* Filter Parameter Laporan */}
      <FilterToolbar
        onReset={() => {
          setYear('2026');
          setMonth('10');
          setQuarter('Q4');
          setSemester('Semester 2');
          setReportCategory('Semua Kategori');
          setSelectedUnit('Semua Unit / Ruangan');
        }}
      >
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-500">Tahun:</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Filter Tahun Laporan"
            className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {(routePath === '/laporan/bulanan' || routePath === '/laporan') && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">Bulan:</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Filter Bulan Laporan"
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
        )}

        {routePath === '/laporan/triwulanan' && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">Triwulan:</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              aria-label="Filter Triwulan Laporan"
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Q1">Triwulan I (Jan–Mar)</option>
              <option value="Q2">Triwulan II (Apr–Jun)</option>
              <option value="Q3">Triwulan III (Jul–Sep)</option>
              <option value="Q4">Triwulan IV (Okt–Des)</option>
            </select>
          </div>
        )}

        {routePath === '/laporan/semesteran' && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">Semester:</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              aria-label="Filter Semester Laporan"
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Semester 1">Semester I (Jan–Jun)</option>
              <option value="Semester 2">Semester II (Jul–Des)</option>
            </select>
          </div>
        )}

        <select
          value={reportCategory}
          onChange={(e) => setReportCategory(e.target.value)}
          aria-label="Filter Kategori Laporan"
          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="Semua Kategori">Semua Kategori Laporan</option>
          <option value="Kegiatan Operasional">Kegiatan Operasional</option>
          <option value="Monitoring Lingkungan">Monitoring Lingkungan</option>
          <option value="Supervisi Ruangan">Supervisi Ruangan</option>
          <option value="Tindak Lanjut Temuan">Tindak Lanjut Temuan</option>
        </select>

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          aria-label="Filter Unit atau Ruangan"
          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="Semua Unit / Ruangan">Semua Unit / Ruangan</option>
          {masterRooms.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setPreviewGenerated(true);
            pushToast({
              type: 'success',
              title: 'Preview Laporan Diperbarui',
              message: 'Kompilasi laporan disinkronkan dengan data sesi lokal terkini.',
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#153E75] text-white hover:bg-[#10315E] whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate & Preview</span>
        </button>
      </FilterToolbar>

      {/* Report Document Preview Sheet */}
      {previewGenerated && (
        <div className="rounded-[28px] bg-gradient-to-br from-white/62 via-white/44 to-white/54 dark:from-white/[0.10] dark:via-white/[0.05] dark:to-white/[0.08] backdrop-blur-2xl border-[1.5px] border-white/85 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-6 sm:p-8 space-y-6">
          <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#153E75] dark:text-[#60A5FA]">
                PREVIEW DOKUMEN REKAPITULASI — {hospitalProfile.institutionName}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {meta.title} ({year} · {quarter} · {semester})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unit: {selectedUnit} · Kategori: {reportCategory}
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-500 space-y-0.5">
              <div>Kegiatan: {filteredActivities.length} catatan</div>
              <div>Supervisi: {filteredSupervisions.length} catatan</div>
              <div>Temuan: {filteredFindings.length} catatan</div>
            </div>
          </div>

          {filteredActivities.length === 0 &&
          filteredSupervisions.length === 0 &&
          filteredFindings.length === 0 ? (
            <EmptyState
              title="Belum Terdapat Data Aktual untuk Direkapitulasi"
              description="Sesuai prinsip pengembangan SIKESLING RSAM, modul laporan tidak menampilkan data fiktif. Silakan catat kegiatan harian atau supervisi lapangan terlebih dahulu untuk melihat kompilasi otomatis pada laporan ini."
              actionLabel="Catat Kegiatan Operasional"
              actionHref="/operasional/kegiatan-harian"
              icon={<Eye className="w-6 h-6" />}
            />
          ) : (
            <div className="space-y-6">
              {/* Section 1: Activities */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  A. Rekapitulasi Kegiatan Operasional ({filteredActivities.length})
                </h3>
                {filteredActivities.length === 0 ? (
                  <p className="text-xs text-slate-500">Tidak ada kegiatan pada filter ini.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Tanggal</th>
                          <th className="py-2 px-3">Kategori</th>
                          <th className="py-2 px-3">Lokasi</th>
                          <th className="py-2 px-3">Petugas</th>
                          <th className="py-2 px-3">Uraian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredActivities.map((a) => (
                          <tr key={a.id}>
                            <td className="py-2 px-3 font-mono">{a.date}</td>
                            <td className="py-2 px-3 font-medium">{a.category}</td>
                            <td className="py-2 px-3">{a.location}</td>
                            <td className="py-2 px-3">{a.officerName}</td>
                            <td className="py-2 px-3">{a.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 2: Supervisions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  B. Rekapitulasi Supervisi Lingkungan ({filteredSupervisions.length})
                </h3>
                {filteredSupervisions.length === 0 ? (
                  <p className="text-xs text-slate-500">Tidak ada supervisi pada filter ini.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Tanggal</th>
                          <th className="py-2 px-3">Ruangan</th>
                          <th className="py-2 px-3">Kategori</th>
                          <th className="py-2 px-3">Pemeriksaan</th>
                          <th className="py-2 px-3">Temuan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredSupervisions.map((s) => (
                          <tr key={s.id}>
                            <td className="py-2 px-3 font-mono">{s.date}</td>
                            <td className="py-2 px-3 font-medium">{s.roomOrUnit}</td>
                            <td className="py-2 px-3">{s.category}</td>
                            <td className="py-2 px-3">{s.inspectionDetails}</td>
                            <td className="py-2 px-3">{s.findings || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
