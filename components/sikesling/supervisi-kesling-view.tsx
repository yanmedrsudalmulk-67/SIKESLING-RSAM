'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Info,
  Maximize2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Droplets,
  Wind,
  Waves,
  ShieldCheck,
  Utensils,
  Shirt,
  Bug,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { resolveRouteMeta } from '@/lib/navigation';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { useApp } from '@/components/sikesling/app-provider';

export interface KeslingDocPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
  location: string;
  uploadedAt: string;
}

export interface KeslingDocActivity {
  id: string;
  docNumber: number;
  title: string;
  fullTitle: string;
  periodLabel: string;
  category: string;
  iconName: string;
  description: string;
  defaultLocation: string;
  suggestedCaptions: string[];
  photos: KeslingDocPhoto[];
}

const STORAGE_KEY = 'sikresmi_supervisi_kesling_docs_v1';

// 8 Kegiatan Kesehatan Lingkungan RSUD Al-Mulk (Bersih tanpa foto dummy)
const DEFAULT_ACTIVITIES_DATA: KeslingDocActivity[] = [
  {
    id: 'air-bersih',
    docNumber: 1,
    title: 'Kegiatan Sampling Mutu Air Bersih',
    fullTitle: 'Dokumentasi – 1 Kegiatan Sampling Mutu Air Bersih (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Kualitas Air Bersih',
    iconName: 'Droplets',
    description: 'Pemeriksaan rutin fisika-kimia & mikrobiologi air artesis, air RO laboratorium, dan air RO poli gigi.',
    defaultLocation: 'Laboratorium & Sumur Artesis RSUD Al-Mulk',
    suggestedCaptions: [
      'Pengambilan sampel air kran laboratorium mikrobiologi',
      'Pengukuran parameter fisik & suhu di titik air baku artesis',
      'Pemeriksaan sampel air RO di poli gigi',
      'Pengisian formulir rantai pengawasan (chain of custody)',
      'Pengemasan sampel botol steril dalam coolbox berpendingin',
      'Pengiriman sampel air bersih ke Labkesda Kota Sukabumi',
    ],
    photos: [],
  },
  {
    id: 'kualitas-udara',
    docNumber: 2,
    title: 'Kegiatan Sampling Kelembaban Udara, Kebisingan, dan Pencahayaan',
    fullTitle: 'Dokumentasi – 2 Kegiatan Sampling Kelembaban Udara, Kebisingan, dan Pencahayaan (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Kualitas Fisik Udara & Ruangan',
    iconName: 'Wind',
    description: 'Pengukuran parameter fisik intensitas cahaya (Lux), kebisingan (dBA), suhu (°C), dan kelembaban (%RH) di seluruh ruang pelayanan.',
    defaultLocation: 'Ruang Operasi IBS, ICU, dan Rawat Inap',
    suggestedCaptions: [
      'Pengukuran pencahayaan lux meter di meja operasi IBS',
      'Pengukuran tingkat kebisingan sound level meter di ruang genset',
      'Pemantauan suhu & kelembaban thermo-hygrometer di ruang ICU',
      'Pemeriksaan ventilasi & difuser AC di rawat inap Khadijah',
      'Pengukuran pencahayaan di lorong rawat jalan dan loket pendaftaran',
      'Rekapitulasi pembacaan alat instrumen ukur lingkungan rumah sakit',
    ],
    photos: [],
  },
  {
    id: 'limbah-medis',
    docNumber: 3,
    title: 'Kegiatan Pengangkutan & Manifest Limbah Medis B3',
    fullTitle: 'Dokumentasi – 3 Kegiatan Pengangkutan & Manifest Limbah Medis B3 (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Limbah Medis B3',
    iconName: 'ShieldAlert',
    description: 'Penimbangan, pengemasan, pemuatan limbah medis B3, dan verifikasi manifest elektronik (Festronik KLHK) bersama transporter resmi.',
    defaultLocation: 'TPS Limbah B3 Berizin RSUD Al-Mulk',
    suggestedCaptions: [
      'Penimbangan limbah medis padat di TPS B3 berizin',
      'Pemeriksaan segel dan label limbah medis tajam (safety box)',
      'Pemuatan limbah medis ke armada transporter berizin PT Tenang Jaya',
      'Verifikasi dokumen festronik / manifest limbah B3 KLHK',
      'Desinfeksi area lantai TPS B3 pasca pengangkutan berkala',
      'Pencatatan logbook limbah B3 dan bukti serah terima resmi',
    ],
    photos: [],
  },
  {
    id: 'air-limbah-ipal',
    docNumber: 4,
    title: 'Kegiatan Sampling Efluen Air Limbah Cair IPAL',
    fullTitle: 'Dokumentasi – 4 Kegiatan Sampling Efluen Air Limbah Cair IPAL (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Limbah Cair / IPAL',
    iconName: 'Waves',
    description: 'Pengambilan sampel influent dan effluent IPAL rumah sakit, pengecekan aerasi, debit air, dan uji laboratorium terakreditasi.',
    defaultLocation: 'Instalasi Pengolahan Air Limbah (IPAL)',
    suggestedCaptions: [
      'Pengambilan sampel air limbah di titik bak kontrol inlet IPAL',
      'Pengambilan sampel di titik outflow / bak indikator akhir IPAL',
      'Pengukuran pH dan suhu air limbah in-situ dengan water checker',
      'Inspeksi operasional blower aerasi dan flow meter debit harian',
      'Pemantauan kolam bioindikator ikan air tawar di outlet IPAL',
      'Pengawetan dan pelabelan botol sampel uji BOD, COD, & TSS',
    ],
    photos: [],
  },
  {
    id: 'proteksi-radiasi',
    docNumber: 5,
    title: 'Kegiatan Pengawasan Keselamatan & Proteksi Radiasi',
    fullTitle: 'Dokumentasi – 5 Kegiatan Pengawasan Keselamatan & Proteksi Radiasi (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Proteksi Radiasi',
    iconName: 'ShieldCheck',
    description: 'Inspeksi berkala alat pelindung diri radiasi (apron Pb, thyroid shield, kaca Pb), lampu indikator bahaya radiasi, dan kepatuhan standar BAPETEN.',
    defaultLocation: 'Instalasi Radiologi',
    suggestedCaptions: [
      'Inspeksi kelayakan apron timbal (Pb) proteksi radiasi radiologi',
      'Pengecekan lampu tanda bahaya radiasi merah di pintu ruang X-Ray',
      'Pemeriksaan pemakaian dosimeter saku / TLD badge petugas',
      'Verifikasi surat izin edar & operasional BAPETEN peralatan rontgen',
      'Pemantauan uji kebocoran radiasi dinding penahan timbal',
      'Dokumentasi sosialisasi SOP keselamatan radiasi bagi staf medis',
    ],
    photos: [],
  },
  {
    id: 'pangan-siap-saji',
    docNumber: 6,
    title: 'Kegiatan Penyehatan Pangan Siap Saji / TPM Dapur Gizi',
    fullTitle: 'Dokumentasi – 6 Kegiatan Penyehatan Pangan Siap Saji / TPM Dapur Gizi (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Penyehatan Pangan & TPM',
    iconName: 'Utensils',
    description: 'Pemeriksaan higiene sanitasi tempat pengolahan makanan (TPM), sertifikat jasaboga golongan B, rantai dingin, dan kebersihan pramusaji.',
    defaultLocation: 'Dapur Gizi & Pantry Rawat Inap',
    suggestedCaptions: [
      'Inspeksi sanitasi area penerimaan bahan makanan basah & kering',
      'Pemeriksaan suhu chiller dan freezer penyimpanan protein hewani',
      'Pengawasan higiene perorangan (celemek, hairnet, sarung tangan)',
      'Uji usap alat makan dan piring saji pasien di area pencucian',
      'Pemeriksaan sampel makanan siap saji sebelum distribusi bangsal',
      'Peninjauan sertifikat laik higiene sanitasi jasaboga rekanan',
    ],
    photos: [],
  },
  {
    id: 'linen-laundry',
    docNumber: 7,
    title: 'Penyelenggaraan Manajemen Linen & Laundry',
    fullTitle: 'Dokumentasi – 7 Penyelenggaraan Manajemen Linen & Laundry (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Manajemen Linen & Laundry',
    iconName: 'Shirt',
    description: 'Pengawasan pemisahan linen infeksius dan non-infeksius, troli tertutup, suhu pencucian, dan penyimpanan lemari bersih tertutup.',
    defaultLocation: 'Instalasi Linen, Laundry, dan Ruang Perawatan',
    suggestedCaptions: [
      'Pemilahan linen infeksius (kantong kuning) dan non-infeksius',
      'Pengangkutan linen kotor menggunakan troli tertutup khusus',
      'Proses dekontaminasi dan pencucian linen dengan desinfektan',
      'Pemeriksaan suhu dan durasi pada mesin pengering komersial',
      'Pelipatan, pengepakan plastik kedap, dan penyimpanan lemari bersih',
      'Pendistribusian linen bersih ke unit rawat inap dengan troli tertutup',
    ],
    photos: [],
  },
  {
    id: 'vektor-binatang',
    docNumber: 8,
    title: 'Pengendalian Vektor dan Binatang Pembawa Penyakit',
    fullTitle: 'Dokumentasi – 8 Pengendalian Vektor dan Binatang Pembawa Penyakit (Tahun 2026 (Januari - Desember))',
    periodLabel: 'Tahun 2026 (Januari - Desember)',
    category: 'Pengendalian Vektor & Hama',
    iconName: 'Bug',
    description: 'Pemasangan perangkap lalat (fly catcher), umpan tikus (rodent trap), larvasidasi nyamuk, dan cold fogging ramah lingkungan.',
    defaultLocation: 'Perimeter Luar Gedung, TPS, dan Saluran Drainase',
    suggestedCaptions: [
      'Pemasangan dan pemeriksaan fly catcher / fly trap di ruang dapur gizi',
      'Pengecekan baiting trap / perangkap tikus di perimeter luar',
      'Pemeriksaan jentik nyamuk (larvasidasi) pada saluran drainase terbuka',
      'Pemasangan kasa nyamuk pada ventilasi udara ruang rawat inap',
      'Aplikasi pengasapan dingin (cold fogging) di area vegetasi luar gedung',
      'Pencatatan indeks kepadatan lalat dan jentik nyamuk (ABJ) bulanan',
    ],
    photos: [],
  },
];

function getActivityIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Waves':
      return <Waves className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Bug':
      return <Bug className={className} />;
    default:
      return <Camera className={className} />;
  }
}

// Kompres gambar client-side sebelum disimpan ke localStorage
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // JPEG 0.78 quality menghasilkan foto tajam ~80-140 KB
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.78);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

// Bersihkan foto dummy (SVG placeholder), pertahankan foto asli yang diunggah pengguna
function cleanDummyPhotos(list: KeslingDocActivity[]): KeslingDocActivity[] {
  return list.map((act) => ({
    ...act,
    photos: (act.photos || []).filter(
      (p) =>
        p &&
        p.url &&
        !p.url.startsWith('data:image/svg+xml') &&
        !p.id.startsWith('air-') &&
        !p.id.startsWith('udara-') &&
        !p.id.startsWith('limbah-') &&
        !p.id.startsWith('ipal-') &&
        !p.id.startsWith('radiasi-') &&
        !p.id.startsWith('pangan-') &&
        !p.id.startsWith('linen-') &&
        !p.id.startsWith('vektor-')
    ),
  }));
}

export function SupervisiKeslingView() {
  const { pushToast } = useApp();
  const [activities, setActivities] = useState<KeslingDocActivity[]>(DEFAULT_ACTIVITIES_DATA);
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'air-bersih': true,
    'kualitas-udara': true,
    'limbah-medis': true,
    'air-limbah-ipal': true,
    'proteksi-radiasi': true,
    'pangan-siap-saji': true,
    'linen-laundry': true,
    'vektor-binatang': true,
  });

  // Modal Lightbox Preview
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    caption: string;
    date: string;
    location: string;
    docTitle: string;
    docNumber: number;
  } | null>(null);

  // Load from localStorage on mount & bersihkan seluruh foto dummy secara otomatis
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          const cleaned = cleanDummyPhotos(parsed);
          setActivities(cleaned);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat dokumentasi tersimpan dari localStorage:', e);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (nextActivities: KeslingDocActivity[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextActivities));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, skipping silent save:', e);
    }
  };

  const handleToggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    activities.forEach((a) => (next[a.id] = true));
    setExpandedCards(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    activities.forEach((a) => (next[a.id] = false));
    setExpandedCards(next);
  };

  // Upload new photo(s) handler (up to 6 photos max per card)
  const handleUploadPhotos = async (activityId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const targetActivity = activities.find((a) => a.id === activityId);
    if (!targetActivity) return;

    const currentCount = targetActivity.photos.length;
    const remainingSlots = 6 - currentCount;

    if (remainingSlots <= 0) {
      pushToast({
        type: 'warning',
        title: 'Batas Maksimal Tercapai',
        message: 'Maksimal 6 foto dokumentasi telah tercapai pada modul ini.',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    try {
      pushToast({
        type: 'info',
        title: 'Memproses Foto',
        message: `Mengompresi dan mengunggah ${filesToUpload.length} foto dokumentasi...`,
      });

      const newPhotos: KeslingDocPhoto[] = [];
      const today = new Date().toISOString().split('T')[0];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const compressedUrl = await compressImageFile(file);
        const nextIdx = currentCount + i + 1;
        const suggested =
          targetActivity.suggestedCaptions[nextIdx - 1] ||
          `Dokumentasi ${targetActivity.title} (Foto ${nextIdx})`;

        newPhotos.push({
          id: `real-doc-${activityId}-${Date.now()}-${i}`,
          url: compressedUrl,
          caption: suggested,
          date: today,
          location: targetActivity.defaultLocation,
          uploadedAt: new Date().toISOString(),
        });
      }

      const updated = activities.map((act) => {
        if (act.id === activityId) {
          return {
            ...act,
            photos: [...act.photos, ...newPhotos],
          };
        }
        return act;
      });

      setActivities(updated);
      saveToStorage(updated);

      pushToast({
        type: 'success',
        title: 'Foto Berhasil Ditambahkan',
        message: `${newPhotos.length} foto dokumentasi berhasil disimpan ke kartu ${targetActivity.title}.`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Gagal Mengunggah Foto',
        message: 'Terjadi kesalahan saat memproses gambar. Pastikan file gambar valid.',
      });
    }
  };

  // Replace existing photo handler ("Ganti Foto")
  const handleReplacePhoto = async (
    activityId: string,
    photoId: string,
    file: File | null
  ) => {
    if (!file) return;

    try {
      pushToast({
        type: 'info',
        title: 'Mengganti Foto',
        message: 'Memproses dan mengompresi gambar pengganti...',
      });

      const compressedUrl = await compressImageFile(file);

      const updated = activities.map((act) => {
        if (act.id === activityId) {
          return {
            ...act,
            photos: act.photos.map((p) =>
              p.id === photoId
                ? {
                    ...p,
                    url: compressedUrl,
                    uploadedAt: new Date().toISOString(),
                  }
                : p
            ),
          };
        }
        return act;
      });

      setActivities(updated);
      saveToStorage(updated);

      pushToast({
        type: 'success',
        title: 'Foto Berhasil Diganti',
        message: 'Foto dokumentasi telah berhasil diperbarui.',
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Gagal Mengganti Foto',
        message: 'Terjadi kesalahan saat memproses gambar pengganti.',
      });
    }
  };

  // Delete photo handler
  const handleDeletePhoto = (activityId: string, photoId: string) => {
    const updated = activities.map((act) => {
      if (act.id === activityId) {
        return {
          ...act,
          photos: act.photos.filter((p) => p.id !== photoId),
        };
      }
      return act;
    });

    setActivities(updated);
    saveToStorage(updated);

    pushToast({
      type: 'info',
      title: 'Foto Dihapus',
      message: 'Foto dokumentasi telah dihapus dari kartu.',
    });
  };

  // Edit photo metadata (caption, date, location)
  const handleUpdatePhoto = (
    activityId: string,
    photoId: string,
    field: 'caption' | 'date' | 'location',
    value: string
  ) => {
    const updated = activities.map((act) => {
      if (act.id === activityId) {
        return {
          ...act,
          photos: act.photos.map((p) => (p.id === photoId ? { ...p, [field]: value } : p)),
        };
      }
      return act;
    });

    setActivities(updated);
    saveToStorage(updated);
  };

  // Reset to default (empty photos)
  const handleResetData = () => {
    if (confirm('Kosongkan seluruh foto pada 8 Card Dokumentasi dan mulai dari awal?')) {
      setActivities(DEFAULT_ACTIVITIES_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACTIVITIES_DATA));
      pushToast({
        type: 'success',
        title: 'Data Dikosongkan',
        message: 'Seluruh foto pada 8 Card Dokumentasi telah dibersihkan.',
      });
    }
  };

  // Manual save trigger
  const handleManualSave = () => {
    saveToStorage(activities);
    pushToast({
      type: 'success',
      title: 'Perubahan Disimpan',
      message: 'Seluruh foto dokumentasi dan keterangannya berhasil tersimpan ke sistem.',
    });
  };

  // Total summary counts
  const totalPhotos = useMemo(() => {
    return activities.reduce((sum, a) => sum + a.photos.length, 0);
  }, [activities]);

  const maxTotalPhotos = 8 * 6; // 48
  const completionPct = Math.round((totalPhotos / maxTotalPhotos) * 100);

  // Filter activities for search
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.photos.some((p) => p.caption.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))
    );
  }, [activities, searchQuery]);

  return (
    <PageContainer>
      {/* Page Header dengan Status Foto Terunggah */}
      <PageHeader
        title="Supervisi Kesling — Dokumentasi 8 Kegiatan"
        description="Pencatatan dan arsip foto dokumentasi untuk 8 kegiatan kesehatan lingkungan utama RSUD Al-Mulk Sukabumi (maksimal 6 foto per modul kegiatan)."
        status="Functional"
        breadcrumbs={[
          { label: 'SIKRESMI', href: '/dashboard' },
          { label: 'Supervisi Lingkungan', href: '/supervisi/dashboard' },
          { label: 'Supervisi Kesling', href: '/supervisi/kesling' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Pill Ringkas Jumlah Foto Terunggah */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-[#002147] dark:text-[#D2B48C] text-xs font-bold shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{totalPhotos} / {maxTotalPhotos} Foto</span>
              <span className="text-[10px] text-slate-500 font-semibold">({completionPct}%)</span>
            </div>

            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#002147] text-white hover:bg-[#001835] text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-[#D2B48C]" />
              <span>Simpan</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-[#002147] dark:text-[#D2B48C] hover:bg-[#F7F1E7] text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak Rekap</span>
            </button>
            <button
              type="button"
              onClick={handleResetData}
              title="Kosongkan Semua Foto"
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Navigation Mode Tabs: Card Input vs Table Preview */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 mt-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#001835] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cards'
                ? 'bg-[#002147] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4 text-[#D2B48C]" />
            <span>Card Isian Dokumentasi (8 Modul)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'table'
                ? 'bg-[#002147] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D2B48C]" />
            <span>Tabel Dokumentasi Kegiatan (Lampiran Resmi)</span>
          </button>
        </div>

        {/* Search & Collapse Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kegiatan atau keterangan foto..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002147]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeTab === 'cards' && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Tutup Semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: 8 CARDS ISIAN DOKUMENTASI (RESPONSIF MOBILE & CLEAN DESIGN)
          ========================================================================= */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#001835] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada modul kegiatan yang cocok dengan &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#002147] text-white text-xs font-semibold"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isExpanded = expandedCards[act.id] ?? true;
              const photoCount = act.photos.length;
              const isFull = photoCount >= 6;
              const remaining = 6 - photoCount;

              return (
                <div
                  key={act.id}
                  id={`card-${act.id}`}
                  className="rounded-2xl bg-white dark:bg-[#001835] border border-slate-200/90 dark:border-slate-700/80 shadow-md hover:shadow-lg transition-all overflow-hidden scroll-mt-24"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => handleToggleCard(act.id)}
                    className="p-3.5 sm:p-4.5 bg-gradient-to-r from-[#F7F1E7]/70 via-white to-slate-50 dark:from-[#002147]/70 dark:via-[#001d40] dark:to-[#001835] border-b border-slate-200 dark:border-slate-750 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Badge Nomor */}
                      <div className="w-10 h-10 rounded-xl bg-[#002147] text-[#D2B48C] flex flex-col items-center justify-center shrink-0 border border-[#D2B48C]/40 shadow-xs">
                        <span className="text-[9px] uppercase tracking-tighter font-mono font-bold leading-none">Dok</span>
                        <span className="text-sm font-black leading-none mt-0.5">{act.docNumber}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#D2B48C] text-[10.5px] font-extrabold uppercase">
                            {act.category}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            • {act.periodLabel}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-[#002147] dark:text-white truncate">
                          {act.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 hidden sm:block mt-0.5">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    {/* Counter & Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                          isFull
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : photoCount > 0
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isFull && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        <span>{photoCount} / 6 Foto</span>
                      </span>

                      <button
                        type="button"
                        aria-label="Toggle card"
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Photo Grid (Max 6 Photos) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {act.photos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#002147]/30 p-2.5 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            {/* Photo Thumbnail */}
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-300/80 dark:border-slate-700 mb-2 shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.url}
                                alt={photo.caption}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />

                              {/* Index Tag */}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#002147]/85 backdrop-blur-xs text-[#D2B48C] text-[10.5px] font-black border border-[#D2B48C]/40 shadow-xs">
                                Foto #{idx + 1}
                              </span>

                              {/* Action Overlay: Zoom & Quick Delete */}
                              <div className="absolute top-2 right-2 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhoto({
                                      url: photo.url,
                                      caption: photo.caption,
                                      date: photo.date,
                                      location: photo.location,
                                      docTitle: act.title,
                                      docNumber: act.docNumber,
                                    })
                                  }
                                  title="Perbesar Foto"
                                  className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(act.id, photo.id)}
                                  title="Hapus Foto"
                                  className="w-7 h-7 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Tombol Aksi: Ganti Foto (Kamera / Galeri) & Hapus */}
                            <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                              {/* Ganti via Kamera HP */}
                              <label
                                title="Ganti foto ini menggunakan kamera HP langsung"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10.5px] font-bold cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Kamera</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleReplacePhoto(act.id, photo.id, f);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {/* Ganti via Galeri / File */}
                              <label
                                title="Ganti foto ini dari file / galeri foto"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10.5px] font-semibold cursor-pointer hover:bg-slate-200 transition-colors shadow-2xs"
                              >
                                <RefreshCw className="w-3 h-3 text-[#D2B48C]" />
                                <span>Galeri</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleReplacePhoto(act.id, photo.id, f);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {/* Tombol Hapus */}
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(act.id, photo.id)}
                                title="Hapus foto ini"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10.5px] font-semibold hover:bg-rose-100 transition-colors shadow-2xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>

                            {/* Photo Metadata Form */}
                            <div className="space-y-2 text-xs flex-1 flex flex-col justify-between pt-2">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                                  Keterangan / Deskripsi Foto:
                                </label>
                                <textarea
                                  rows={2}
                                  value={photo.caption}
                                  onChange={(e) =>
                                    handleUpdatePhoto(act.id, photo.id, 'caption', e.target.value)
                                  }
                                  placeholder="Ketik keterangan kegiatan foto..."
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-[11.5px] leading-snug focus:outline-none focus:ring-1 focus:ring-[#002147] resize-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-750">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#D2B48C]" />
                                    <span>Tanggal:</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={photo.date}
                                    onChange={(e) =>
                                      handleUpdatePhoto(act.id, photo.id, 'date', e.target.value)
                                    }
                                    className="w-full px-2 py-1 rounded-md bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#002147]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#D2B48C]" />
                                    <span>Lokasi / Titik:</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={photo.location}
                                    onChange={(e) =>
                                      handleUpdatePhoto(act.id, photo.id, 'location', e.target.value)
                                    }
                                    placeholder="Contoh: R. ICU"
                                    className="w-full px-2 py-1 rounded-md bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#002147]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Upload Dropzone Slot (If photoCount < 6) */}
                        {!isFull && (
                          <div className="rounded-xl border-2 border-dashed border-[#D2B48C]/70 dark:border-[#D2B48C]/40 bg-[#F7F1E7]/40 dark:bg-[#002147]/20 p-4 hover:bg-[#F7F1E7]/70 dark:hover:bg-[#002147]/40 transition-colors flex flex-col items-center justify-center text-center min-h-[220px]">
                            <div className="w-11 h-11 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center mb-2 shadow-sm">
                              <Camera className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#002147] dark:text-white">
                              Tambah Foto Dokumentasi
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3 max-w-[200px]">
                              Tersedia {remaining} slot foto lagi (maksimal 6 foto per modul)
                            </p>

                            {/* Dua Tombol Aksi: Kamera Langsung & Galeri */}
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-[260px]">
                              {/* 1. Ambil Foto Kamera (Langsung buka kamera di HP) */}
                              <label
                                title="Buka kamera HP langsung untuk memotret kegiatan"
                                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-95"
                              >
                                <Camera className="w-4 h-4" />
                                <span>Kamera HP</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => {
                                    handleUploadPhotos(act.id, e.target.files);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {/* 2. Pilih dari Galeri / File Explorer */}
                              <label
                                title="Pilih foto yang sudah tersimpan di galeri atau berkas"
                                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#002147] hover:bg-[#001835] text-white text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-95"
                              >
                                <UploadCloud className="w-4 h-4 text-[#D2B48C]" />
                                <span>Pilih Galeri</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => {
                                    handleUploadPhotos(act.id, e.target.files);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Capacity Full Notice */}
                      {isFull && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-semibold">
                              Kapasitas Maksimal Terpenuhi: 6 dari 6 foto dokumentasi telah terisi lengkap.
                            </span>
                          </div>
                          <span className="text-[11px] opacity-75 hidden sm:inline">
                            Gunakan tombol &ldquo;Ganti&rdquo; atau &ldquo;Hapus&rdquo; pada foto di atas untuk memperbarui.
                          </span>
                        </div>
                      )}

                      {/* Quick Suggested Captions Pills */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D2B48C]" />
                          <span>Rekomendasi Judul Foto Kegiatan Standar RSUD Al-Mulk:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {act.suggestedCaptions.map((sug, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] border border-slate-200 dark:border-slate-700"
                            >
                              #{i + 1} {sug}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: TABEL DOKUMENTASI KEGIATAN (LAMPIRAN RESMI LAPORAN KESLING)
          ========================================================================= */}
      {activeTab === 'table' && (
        <div className="space-y-8 bg-white dark:bg-[#001835] rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-8 shadow-md">
          {/* Official Document Header */}
          <div className="text-center border-b-2 border-[#002147] pb-4 mb-6">
            <div className="text-[11px] font-bold tracking-widest text-[#D2B48C] uppercase mb-1">
              UOBK RSUD AL-MULK KOTA SUKABUMI • UNIT KESEHATAN LINGKUNGAN
            </div>
            <h2 className="text-base sm:text-xl font-extrabold uppercase text-[#002147] dark:text-white">
              DAFTAR DOKUMENTASI KEGIATAN KESEHATAN LINGKUNGAN
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold mt-1">
              PERIODE TAHUN 2026 (JANUARI – DESEMBER)
            </div>
          </div>

          {/* Quick Table of Contents */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#F7F1E7]/70 dark:bg-[#002147]/40 border border-[#D2B48C]/50 space-y-2 mb-6">
            <h4 className="text-xs font-extrabold uppercase text-[#002147] dark:text-[#D2B48C] tracking-wider mb-2">
              Daftar Dokumentasi Terjadwal:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {activities.map((act) => (
                <a
                  key={act.id}
                  href={`#tbl-${act.id}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-[#001835]/80 hover:bg-[#002147] hover:text-white transition-all text-[#002147] dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <span className="font-medium truncate pr-2">
                    Dokumentasi – {act.docNumber} {act.title}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#D2B48C]/30 text-[#002147] dark:text-[#D2B48C] font-mono text-[10px] font-bold shrink-0">
                    {act.photos.length}/6 Foto
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* 8 Structured Tables (1 for each activity) */}
          <div className="space-y-10">
            {activities.map((act) => (
              <div
                key={act.id}
                id={`tbl-${act.id}`}
                className="scroll-mt-24 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs"
              >
                {/* Table Title Banner */}
                <div className="bg-[#002147] text-white p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D2B48C]/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#D2B48C] text-[#002147] flex items-center justify-center font-black text-xs shrink-0">
                      #{act.docNumber}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold tracking-wide uppercase">
                        {act.fullTitle}
                      </h3>
                      <div className="text-[11px] text-slate-300">
                        Kategori: {act.category} • Lokasi Utama: {act.defaultLocation}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold shrink-0 self-start sm:self-auto">
                    {act.photos.length} dari 6 Foto Terisi
                  </span>
                </div>

                {/* Table Photos Content */}
                <div className="p-4 sm:p-5 bg-white dark:bg-[#001c3d]">
                  {act.photos.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Belum ada foto dokumentasi yang dimasukkan.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('cards');
                          setExpandedCards((prev) => ({ ...prev, [act.id]: true }));
                        }}
                        className="mt-2 text-xs font-bold text-[#002147] dark:text-[#D2B48C] underline"
                      >
                        Buka Card & Tambah Foto Sekarang &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {act.photos.map((photo, pIdx) => (
                        <div
                          key={photo.id}
                          className="border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-[#002147]/20 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-600 mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                              Foto {act.docNumber}.{pIdx + 1}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-snug">
                              {photo.caption}
                            </p>
                            <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-750">
                              <span>📅 {photo.date}</span>
                              <span className="truncate max-w-[140px]" title={photo.location}>
                                📍 {photo.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer of Table Report */}
          <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Dokumentasi terverifikasi oleh Sanitarian & Penanggung Jawab Kesehatan Lingkungan UOBK RSUD Al-Mulk.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002147] text-white font-semibold shadow-sm hover:bg-[#001835]"
              >
                <Printer className="w-4 h-4 text-[#D2B48C]" />
                <span>Cetak Lembar Dokumentasi Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LIGHTBOX MODAL FOR FULL PHOTO PREVIEW
          ========================================================================= */}
      {previewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-[#001835] rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-[#002147] text-white flex items-center justify-between gap-3 border-b border-[#D2B48C]/40">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#D2B48C] text-[#002147] flex items-center justify-center font-black text-xs">
                  #{previewPhoto.docNumber}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {previewPhoto.docTitle}
                  </h4>
                  <div className="text-[11px] text-slate-300">
                    📅 {previewPhoto.date} • 📍 {previewPhoto.location}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Modal Caption */}
            <div className="p-4 bg-slate-50 dark:bg-[#001c3d] border-t border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Keterangan Foto Dokumentasi:
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {previewPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
