import React from 'react';
import { Metadata } from 'next';
import { AnnualProgramView } from '@/components/sikesling/annual-program-view';

export const metadata: Metadata = {
  title: 'Program Kerja Kesehatan Lingkungan - SIKESLING RSAM',
  description:
    'Perencanaan program kerja tahunan dan bulanan kesehatan lingkungan UOBK RSUD Al-Mulk Kota Sukabumi.',
};

export default function ProgramKerjaIndexPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <AnnualProgramView />
    </div>
  );
}
