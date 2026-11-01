import React from 'react';
import { Metadata } from 'next';
import { AnnualProgramView } from '@/components/sikesling/annual-program-view';

export const metadata: Metadata = {
  title: 'Program Tahunan Kesehatan Lingkungan - SIKESLING RSAM',
  description:
    'Matriks program kerja tahunan 9 bidang kesehatan lingkungan UOBK RSUD Al-Mulk Kota Sukabumi berdasarkan Permenkes No 7 Tahun 2019.',
};

export default function ProgramTahunanPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <AnnualProgramView />
    </div>
  );
}
