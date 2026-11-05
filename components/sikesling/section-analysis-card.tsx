'use client';

import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Calendar, UserCheck } from 'lucide-react';

export interface SectionAnalysisCardProps {
  title: string;
  periodLabel: string;
  defaultAnalysis: string;
  defaultRecommendation: string;
  defaultFollowUp: string;
  pic?: string;
  timeline?: string;
  onEdit?: () => void;
  className?: string;
}

export function SectionAnalysisCard({
  title,
  periodLabel,
  defaultAnalysis,
  defaultRecommendation,
  defaultFollowUp,
  pic = 'Sanitarian & Unit Kerja Terkait',
  timeline = 'Periode Berjalan',
  onEdit,
  className = '',
}: SectionAnalysisCardProps) {
  return (
    <div
      className={`mt-4 p-3.5 bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-300 rounded-md text-[11px] font-sans space-y-2.5 shadow-sm print:bg-white print:border-slate-400 print:shadow-none print:p-2 print:my-2 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 print:border-slate-300">
        <div className="flex items-center gap-1.5 font-bold text-[#002147] text-[11.5px] uppercase tracking-wide">
          <FileText className="w-3.5 h-3.5 text-[#002147] shrink-0 print:hidden" />
          <span>Analisis Data, Rekomendasi & Rencana Tindak Lanjut (RTL) — {title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded border border-sky-200 print:border-none print:bg-transparent print:text-black">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* Tri-Fold Sections: A, B, C */}
      <div className="space-y-2">
        {/* A. ANALISIS DATA */}
        <div className="space-y-0.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 inline-block"></span>
            <span className="uppercase text-blue-900 font-extrabold">A. Analisis Data Aktual:</span>
          </div>
          <div
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={onEdit}
            className="text-slate-700 leading-relaxed pl-3.5 italic whitespace-pre-line outline-none focus:ring-1 focus:ring-amber-400 rounded py-0.5 bg-white/60 print:bg-transparent p-1.5 border border-slate-200/60 print:border-none"
          >
            {defaultAnalysis}
          </div>
        </div>

        {/* B. REKOMENDASI */}
        <div className="space-y-0.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 inline-block"></span>
            <span className="uppercase text-emerald-900 font-extrabold">B. Rekomendasi Teknis:</span>
          </div>
          <div
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={onEdit}
            className="text-slate-700 leading-relaxed pl-3.5 whitespace-pre-line outline-none focus:ring-1 focus:ring-amber-400 rounded py-0.5 bg-white/60 print:bg-transparent p-1.5 border border-slate-200/60 print:border-none"
          >
            {defaultRecommendation}
          </div>
        </div>

        {/* C. RENCANA TINDAK LANJUT (RTL) */}
        <div className="space-y-0.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0 inline-block"></span>
            <span className="uppercase text-amber-900 font-extrabold">C. Rencana Tindak Lanjut (RTL):</span>
          </div>
          <div
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={onEdit}
            className="text-slate-700 leading-relaxed pl-3.5 whitespace-pre-line outline-none focus:ring-1 focus:ring-amber-400 rounded py-0.5 bg-white/60 print:bg-transparent p-1.5 border border-slate-200/60 print:border-none"
          >
            {defaultFollowUp}
          </div>
        </div>
      </div>

      {/* Footer Meta: PIC & Timeline */}
      <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-medium print:border-slate-300">
        <div className="flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-slate-400" />
          <span>Penanggung Jawab (PIC): <strong className="text-slate-700">{pic}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>Batas Waktu / Target: <strong className="text-slate-700">{timeline}</strong></span>
        </div>
      </div>
    </div>
  );
}
