'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';

export function LaporanUplUklView() {
  const meta = resolveRouteMeta('/laporan/upl-ukl');

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        status={meta.status}
        breadcrumbs={meta.breadcrumbs}
      />

      <div className="max-w-4xl mx-auto mt-6">
        <div className="relative rounded-3xl bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/60 dark:border-[#D2B48C]/30 shadow-xl p-8 sm:p-12 overflow-hidden text-center">
          {/* Subtle Ambient Background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#FAF6F0]/60 via-transparent to-[#F2E8D9]/40 dark:from-[#002147]/30 dark:to-transparent"
          />

          {/* Icon Badge */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#002147] text-[#D2B48C] flex items-center justify-center shadow-lg border-2 border-[#D2B48C]/50 mb-6">
            <FileSpreadsheet className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] dark:bg-[#002147] border border-[#D2B48C]/50 text-xs font-bold text-[#002147] dark:text-[#D2B48C] mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Format Resmi Sedang Dalam Persiapan</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#002147] dark:text-white tracking-tight mb-3">
            Laporan UPL & UKL RSUD Al-Mulk
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Format resmi dokumen laporan Upaya Pengelolaan Lingkungan Hidup dan Upaya Pemantauan Lingkungan Hidup (UKL-UPL) berkala untuk pelaporan ke Dinas Lingkungan Hidup (DLH) Kota Sukabumi sedang disiapkan dan diselaraskan.
          </p>

          {/* 3 Information Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8 text-left max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#002147]/80 border border-[#D2B48C]/40">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002147] dark:text-[#D2B48C] mb-1">
                <Building2 className="w-4 h-4 text-[#D2B48C]" />
                <span>Instansi Terkait</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dinas Lingkungan Hidup (DLH) Kota Sukabumi
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#002147]/80 border border-[#D2B48C]/40">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002147] dark:text-[#D2B48C] mb-1">
                <Clock className="w-4 h-4 text-[#D2B48C]" />
                <span>Periode Laporan</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Semesteran (Semester 1 & 2) & Tahunan
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#002147]/80 border border-[#D2B48C]/40">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002147] dark:text-[#D2B48C] mb-1">
                <ShieldCheck className="w-4 h-4 text-[#D2B48C]" />
                <span>Integrasi Data</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatis dari Modul Monitoring & Supervisi SIKRESMI
              </p>
            </div>
          </div>

          {/* Action Link to Laporan Kesling */}
          <div className="flex items-center justify-center">
            <Link
              href="/laporan/kesling"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#002147] text-[#D2B48C] hover:bg-[#001835] hover:text-white font-bold text-sm shadow-md transition-all border border-[#D2B48C]/50"
            >
              <FileText className="w-4 h-4" />
              <span>Buka Laporan Kesling (Tahunan / Bulanan / Triwulan)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
