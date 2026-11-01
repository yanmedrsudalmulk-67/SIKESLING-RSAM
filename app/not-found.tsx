import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF6F0] dark:bg-[#001228] text-center">
      <div className="max-w-md w-full p-8 rounded-[28px] bg-white dark:bg-[#001835] border border-[#D2B48C]/50 shadow-xl space-y-4">
        <h2 className="text-2xl font-black text-[#002147] dark:text-white">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 rounded-2xl bg-[#002147] text-[#D2B48C] text-xs font-bold hover:bg-[#001835] transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
