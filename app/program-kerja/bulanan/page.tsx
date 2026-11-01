import React from 'react';
import { Metadata } from 'next';
import { MonthlyProgramView } from '@/components/sikesling/monthly-program-view';

export const metadata: Metadata = {
  title: 'Program Bulanan & Mingguan Kesehatan Lingkungan - SIKESLING RSAM',
  description:
    'Rincian jadwal bulanan dan mingguan (Minggu 1 - Minggu 4) kegiatan kesehatan lingkungan UOBK RSUD Al-Mulk Kota Sukabumi.',
};

export default function ProgramBulananPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <MonthlyProgramView />
    </div>
  );
}
