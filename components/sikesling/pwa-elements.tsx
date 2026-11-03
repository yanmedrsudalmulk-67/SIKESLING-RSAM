'use client';

import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '@/hooks/use-pwa';

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#153E75] dark:text-sky-400">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Terpasang sebagai Aplikasi (Standalone PWA)</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-white/90 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white shadow-xs transition-all whitespace-nowrap shrink-0'
            : 'inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[#153E75] text-white hover:bg-[#0F294D] transition-colors whitespace-nowrap shrink-0'
        }
        aria-label="Pasang Aplikasi PWA SIKRESMI"
      >
        <Download className="w-3.5 h-3.5 shrink-0 text-[#1D7AFC] dark:text-sky-400" />
        <span>Pasang App</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-modal-title"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#1D7AFC] shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="pwa-modal-title"
                    className="text-base font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Panduan Instalasi PWA SIKRESMI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fondasi Progressive Web App (Tahap 1)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Tutup panduan instalasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {isIOS ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Cara Pasang pada iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah Safari.</li>
                    <li>Pilih menu <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
                    <li>Ketuk <strong>Tambah</strong> di pojok kanan atas.</li>
                  </ol>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Cara Pasang pada Desktop / Smartphone Android:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Klik ikon <strong>Install / Pasang</strong> pada bilah alamat browser (Chrome/Edge).</li>
                    <li>Atau buka menu browser (⋮) lalu pilih <strong>Instal Aplikasi / Tambahkan ke Layar Utama</strong>.</li>
                  </ol>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Catatan Teknis Tahap Foundation:</strong> Web App Manifest dan ikon standar PWA telah aktif. Fitur penyimpanan <em>offline-first</em> dan sinkronisasi latar belakang dirancang untuk diimplementasikan pada tahap pengembangan berikutnya.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-[#153E75] text-white hover:bg-[#0F294D] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 lg:bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        Koneksi Terputus — Sinkronisasi offline belum diaktifkan pada Tahap Foundation.
      </span>
    </div>
  );
}
