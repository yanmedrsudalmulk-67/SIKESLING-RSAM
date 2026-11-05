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

// 8 Kegiatan Kesehatan Lingkungan RSUD Al-Mulk (Persis Daftar Dokumentasi Halaman 37 & Lampiran Resmi)
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
    photos: [
      {
        id: 'air-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f3b61"/><circle cx="300" cy="180" r="70" fill="%230284c7" opacity="0.4"/><path d="M300 130 C270 170 250 200 250 225 C250 255 272 275 300 275 C328 275 350 255 350 225 C350 200 330 170 300 130 Z" fill="%2338bdf8"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Sampling Air Kran Laboratorium</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">Dokumentasi 1 - UOBK RSUD Al-Mulk Sukabumi</text></svg>',
        caption: 'Pengambilan sampel air kran laboratorium mikrobiologi untuk uji baku mutu Total Coliform & E.Coli.',
        date: '2026-03-12',
        location: 'Kran Wastafel Laboratorium Sentral',
        uploadedAt: '2026-03-12T09:30:00Z',
      },
      {
        id: 'air-2',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230c4a6e"/><rect x="220" y="140" width="160" height="120" rx="12" fill="%230369a1" opacity="0.5"/><path d="M260 230 L340 230 M300 160 L300 230" stroke="%2338bdf8" stroke-width="8" stroke-linecap="round"/><circle cx="300" cy="160" r="14" fill="%2338bdf8"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Pengukuran Suhu &amp; Kekeruhan Air Artesis</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">Titik Sumur Bor Kedalaman 80m</text></svg>',
        caption: 'Pengukuran suhu in-situ dan kekeruhan pada titik tandon distribusi sumur artesis.',
        date: '2026-03-12',
        location: 'Rumah Pompa Sumur Artesis',
        uploadedAt: '2026-03-12T10:15:00Z',
      },
    ],
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
    photos: [
      {
        id: 'udara-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><circle cx="300" cy="180" r="60" fill="%23f59e0b" opacity="0.3"/><path d="M300 130 L300 230 M250 180 L350 180" stroke="%23fbbf24" stroke-width="6"/><circle cx="300" cy="180" r="30" fill="%23fbbf24"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Pengukuran Lux Meter Meja Operasi</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">Instalasi Bedah Sentral (IBS)</text></svg>',
        caption: 'Pengukuran intensitas pencahayaan di meja operasi IBS menggunakan Luxmeter digital (capaian 100% standar).',
        date: '2026-06-18',
        location: 'Kamar Bedah IBS Utama',
        uploadedAt: '2026-06-18T11:00:00Z',
      },
    ],
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
    photos: [
      {
        id: 'limbah-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23451a03"/><rect x="220" y="130" width="160" height="130" rx="8" fill="%23b45309" opacity="0.5"/><path d="M260 210 L340 210 L320 160 L280 160 Z" fill="%23f59e0b"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Penimbangan &amp; Serah Terima Limbah B3</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%23fde68a" text-anchor="middle">Armada Transporter Berizin KLHK</text></svg>',
        caption: 'Penimbangan limbah medis padat dan serah terima dokumen Festronik bersama transporter berizin.',
        date: '2026-04-08',
        location: 'Depan TPS B3 RSUD Al-Mulk',
        uploadedAt: '2026-04-08T14:20:00Z',
      },
    ],
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
    photos: [
      {
        id: 'ipal-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23064e3b"/><rect x="230" y="140" width="140" height="110" rx="10" fill="%23047857" opacity="0.6"/><path d="M250 200 Q280 180 300 200 T350 200" stroke="%2334d399" stroke-width="6" fill="none"/><circle cx="300" cy="165" r="16" fill="%236ee7b7"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Sampling Outlet &amp; Kolam Bioindikator IPAL</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%23a7f3d0" text-anchor="middle">Kepatuhan 100% Baku Mutu Efluen Permenkes No. 7/2019</text></svg>',
        caption: 'Pengambilan sampel effluent air limbah pada bak kontrol akhir dan pemeriksaan kesehatan ikan bioindikator.',
        date: '2026-05-15',
        location: 'Bak Outlet IPAL & Kolam Indikator',
        uploadedAt: '2026-05-15T10:00:00Z',
      },
    ],
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
    photos: [
      {
        id: 'radiasi-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%233b0764"/><circle cx="300" cy="180" r="60" fill="%239333ea" opacity="0.4"/><polygon points="300,140 330,220 270,220" fill="%23c084fc"/><circle cx="300" cy="180" r="14" fill="%23ffffff"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Inspeksi Apron Pb &amp; Tanda Bahaya Radiasi</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%23e9d5ff" text-anchor="middle">Standar Keselamatan Fisika Medik BAPETEN</text></svg>',
        caption: 'Pemeriksaan integritas pelindung apron timbal (Pb) dan lampu indikator peringatan bahaya radiasi aktif.',
        date: '2026-07-22',
        location: 'Ruang Pemeriksaan Rontgen / Radiologi',
        uploadedAt: '2026-07-22T09:45:00Z',
      },
    ],
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
    photos: [
      {
        id: 'pangan-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23713f12"/><circle cx="300" cy="180" r="60" fill="%23ca8a04" opacity="0.4"/><path d="M260 170 L260 210 M280 170 L280 210 M340 170 L340 220" stroke="%23facc15" stroke-width="5" stroke-linecap="round"/><circle cx="300" cy="190" r="35" fill="none" stroke="%23facc15" stroke-width="4"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Inspeksi Higiene Sanitasi Dapur Gizi</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%23fef08a" text-anchor="middle">Pengawasan Rantai Dingin &amp; APD Pramusaji</text></svg>',
        caption: 'Pemeriksaan kebersihan meja penyiapan makanan dan kelengkapan APD pramusaji di instalasi dapur gizi.',
        date: '2026-08-14',
        location: 'Instalasi Gizi & Pantry Sentral',
        uploadedAt: '2026-08-14T11:30:00Z',
      },
    ],
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
    photos: [
      {
        id: 'linen-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23134e4a"/><rect x="230" y="140" width="140" height="110" rx="8" fill="%230d9488" opacity="0.5"/><path d="M260 160 L300 190 L340 160" stroke="%235eead4" stroke-width="6" stroke-linecap="round"/><line x1="240" y1="210" x2="360" y2="210" stroke="%235eead4" stroke-width="4"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Manajemen Pemilahan Linen &amp; Troli Tertutup</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%2399f6e4" text-anchor="middle">Pemisahan Alur Infeksius dan Non-Infeksius</text></svg>',
        caption: 'Pemisahan jalur distribusi troli linen bersih tertutup dan troli linen kotor bersekat sesuai PPI.',
        date: '2026-09-05',
        location: 'Ruang Dekontaminasi & Penyimpanan Linen',
        uploadedAt: '2026-09-05T13:10:00Z',
      },
    ],
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
    photos: [
      {
        id: 'vektor-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e1b4b"/><circle cx="300" cy="180" r="50" fill="%234338ca" opacity="0.4"/><ellipse cx="300" cy="185" rx="30" ry="40" fill="%23818cf8"/><circle cx="300" cy="145" r="16" fill="%23818cf8"/><line x1="255" y1="170" x2="280" y2="185" stroke="%23c7d2fe" stroke-width="4"/><line x1="345" y1="170" x2="320" y2="185" stroke="%23c7d2fe" stroke-width="4"/><text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" text-anchor="middle">Monitoring Perangkap Vektor &amp; Larvasidasi</text><text x="300" y="348" font-family="Arial, sans-serif" font-size="13" fill="%23c7d2fe" text-anchor="middle">20 Unit Ruangan Bebas Vektor 100%</text></svg>',
        caption: 'Pemeriksaan rutin fly catcher dan rodent baiting station di area penunjang medis luar gedung.',
        date: '2026-10-10',
        location: 'Perimeter Dapur & Selasar Belakang RSUD',
        uploadedAt: '2026-10-10T08:30:00Z',
      },
    ],
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          setActivities(parsed);
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

  // Upload photo handler (up to 6 photos max)
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
        title: 'Mengompresi Foto',
        message: `Memproses ${filesToUpload.length} foto dokumentasi dengan resolusi optimal...`,
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
          id: `doc-${activityId}-${Date.now()}-${i}`,
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
        message: 'Terjadi kesalahan saat memproses file gambar. Pastikan file valid.',
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

  // Reset to default
  const handleResetData = () => {
    if (confirm('Kembalikan 8 Card Dokumentasi ke format awal standar RSUD Al-Mulk?')) {
      setActivities(DEFAULT_ACTIVITIES_DATA);
      localStorage.removeItem(STORAGE_KEY);
      pushToast({
        type: 'success',
        title: 'Data Direset',
        message: '8 Card Dokumentasi telah dikembalikan ke format awal standar.',
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
      {/* Page Header */}
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
            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#002147] text-white hover:bg-[#001835] text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-[#D2B48C]" />
              <span>Simpan Perubahan</span>
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
              title="Reset ke Template Awal"
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#001835] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Top Banner KPI & Quick Jump */}
      <div className="rounded-2xl bg-gradient-to-br from-[#002147] via-[#002b5c] to-[#013875] text-white p-4 sm:p-5 shadow-lg border border-[#D2B48C]/40 mb-5 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#D2B48C]/10 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D2B48C]/25 text-[#D2B48C] text-[11px] font-bold uppercase tracking-wider border border-[#D2B48C]/40">
                Dokumentasi Resmi Kesling
              </span>
              <span className="text-xs text-slate-200">Tahun 2026 (Januari – Desember)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              8 Modul Dokumentasi Kegiatan Kesehatan Lingkungan
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 max-w-2xl">
              Setiap modul mendukung input maksimal 6 foto beresolusi tinggi dengan kompresi otomatis, lengkap dengan tanggal kegiatan, lokasi, dan keterangan resmi untuk lampiran laporan.
            </p>
          </div>

          {/* KPI Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#D2B48C] text-[#002147] flex items-center justify-center font-black text-base shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-200 font-medium">Total Foto Terunggah</div>
              <div className="text-lg sm:text-xl font-black text-white">
                {totalPhotos} <span className="text-xs text-[#D2B48C] font-semibold">/ {maxTotalPhotos} Foto ({completionPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Jump Bar to 8 Activities */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-bold text-[#D2B48C] uppercase tracking-wider shrink-0 mr-1">
            Pintas Kartu:
          </span>
          {activities.map((act) => {
            const count = act.photos.length;
            const isFull = count === 6;
            return (
              <a
                key={act.id}
                href={`#card-${act.id}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  isFull
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-500/40'
                    : count > 0
                    ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/15'
                }`}
              >
                <span>Dok {act.docNumber}</span>
                <span className="text-[10px] opacity-80">({count}/6)</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Navigation Mode Tabs: Card Input vs Table Preview */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
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
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-300/80 dark:border-slate-700 mb-2.5 shadow-2xs">
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

                              {/* Action Overlay */}
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

                            {/* Photo Metadata Form */}
                            <div className="space-y-2 text-xs flex-1 flex flex-col justify-between">
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
                          <div className="relative rounded-xl border-2 border-dashed border-[#D2B48C]/70 dark:border-[#D2B48C]/40 bg-[#F7F1E7]/40 dark:bg-[#002147]/20 p-4 hover:bg-[#F7F1E7]/70 dark:hover:bg-[#002147]/40 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer min-h-[220px]">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleUploadPhotos(act.id, e.target.files)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-12 h-12 rounded-full bg-[#002147] text-[#D2B48C] flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#002147] dark:text-white">
                              Tambah Foto Dokumentasi
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                              Klik atau seret file gambar ({remaining} slot tersisa dari maks. 6)
                            </p>
                            <span className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#002147] text-[#D2B48C] text-[10px] font-bold shadow-2xs">
                              <Plus className="w-3 h-3" />
                              Pilih File Foto
                            </span>
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
                            Hapus salah satu foto jika ingin mengganti dengan dokumentasi baru.
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

          {/* Quick Table of Contents (Persis Gambar 2 Pengguna) */}
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
