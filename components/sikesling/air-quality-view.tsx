'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getAirQualityDataByYear, AIR_QUALITY_DATA_2026, AIR_QUALITY_DATA_2025 } from '@/lib/air-quality-data';
import {
  Calendar,
  ChevronDown,
  Check,
  TrendingUp,
  Volume2,
  Sun,
  Thermometer,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { resolveRouteMeta } from '@/lib/navigation';
import { useApp } from '@/components/sikesling/app-provider';
import { PageContainer, PageHeader } from '@/components/sikesling/ui-system';
import { FloatingSaveButton } from '@/components/sikesling/floating-save-button';

export type AirPeriodFilter =
  | 'FULL_YEAR'
  | 'SEMESTER_1'
  | 'SEMESTER_2'
  | 'TRIWULAN_1'
  | 'TRIWULAN_2'
  | 'TRIWULAN_3'
  | 'TRIWULAN_4'
  | 'MONTH_1'
  | 'MONTH_2'
  | 'MONTH_3'
  | 'MONTH_4'
  | 'MONTH_5'
  | 'MONTH_6'
  | 'MONTH_7'
  | 'MONTH_8'
  | 'MONTH_9'
  | 'MONTH_10'
  | 'MONTH_11'
  | 'MONTH_12';

const AIR_MONTHS = [
  { no: 1, name: 'JANUARI', label: 'Januari' },
  { no: 2, name: 'FEBRUARI', label: 'Februari' },
  { no: 3, name: 'MARET', label: 'Maret' },
  { no: 4, name: 'APRIL', label: 'April' },
  { no: 5, name: 'MEI', label: 'Mei' },
  { no: 6, name: 'JUNI', label: 'Juni' },
  { no: 7, name: 'JULI', label: 'Juli' },
  { no: 8, name: 'AGUSTUS', label: 'Agustus' },
  { no: 9, name: 'SEPTEMBER', label: 'September' },
  { no: 10, name: 'OKTOBER', label: 'Oktober' },
  { no: 11, name: 'NOVEMBER', label: 'November' },
  { no: 12, name: 'DESEMBER', label: 'Desember' },
];

export interface AirQualityItem {
  id: string;
  groupName: string;
  unitName: string;
  // Suhu & Kelembaban
  tempStd: string;
  humidityStd: string;
  tempResult: number;
  humidityResult: number;
  tempHumidityScore: number; // 1 = MS, 0.5 = Partial, 0 = TMS
  // Pencahayaan
  luxStd: string;
  luxResult: number;
  luxScore: number; // 1 = MS, 0 = TMS
  // Kebisingan
  noiseStd: string;
  noiseResult: number;
  noiseScore: number; // 1 = MS, 0 = TMS
  // Nilai Gabungan
  overallScore: number;
}

const DEFAULT_GROUPS = [
  'IGD',
  'RAWAT JALAN',
  'RAWAT INAP',
  'RUANG KHUSUS & PENUNJANG',
  'MANAJEMEN & ADMINISTRASI',
];

export function AirQualityView() {
  const meta = resolveRouteMeta('/monitoring/kualitas-udara');
  const { pushToast, airItems, updateAirItems } = useApp();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriod, setSelectedPeriod] = useState<AirPeriodFilter>('FULL_YEAR');
  const [activeSheet, setActiveSheet] = useState<'sheet1' | 'sheet2'>('sheet1');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Auto-hydrate from official Excel dataset if empty or year changes
  useEffect(() => {
    if (!airItems || airItems.length <= 5) {
      void updateAirItems(getAirQualityDataByYear(selectedYear));
    }
  }, [airItems, selectedYear, updateAirItems]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const dataForYear = getAirQualityDataByYear(year);
    void updateAirItems(dataForYear);
    pushToast({
      type: 'info',
      title: `Memuat Data Kualitas Udara ${year}`,
      message: `Data hasil uji fisik kualitas udara tahun ${year} berhasil dimuat dari dataset resmi.`,
    });
  };

  const items = useMemo(() => {
    if (airItems && airItems.length > 5) {
      return airItems as AirQualityItem[];
    }
    return getAirQualityDataByYear(selectedYear) as AirQualityItem[];
  }, [airItems, selectedYear]);
  const setItems = (
    updater: AirQualityItem[] | ((prev: AirQualityItem[]) => AirQualityItem[])
  ) => {
    const next = typeof updater === 'function' ? updater(items) : updater;
    setHasUnsavedChanges(true);
    void updateAirItems(next);
  };

  // State untuk inline edit nilai hasil ukur
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'temp' | 'humidity' | 'lux' | 'noise' | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // State untuk inline edit nama ruangan
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitName, setEditingUnitName] = useState<string>('');

  // State modal tambah ruangan baru
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('IGD');
  const [customGroupName, setCustomGroupName] = useState<string>('');
  const [newUnitName, setNewUnitName] = useState<string>('');
  const [newTempStd, setNewTempStd] = useState<string>('20-24');
  const [newHumidityStd, setNewHumidityStd] = useState<string>('40-60');
  const [newTempResult, setNewTempResult] = useState<string>('24.0');
  const [newHumidityResult, setNewHumidityResult] = useState<string>('50.0');
  const [newLuxStd, setNewLuxStd] = useState<string>('250 LUX');
  const [newLuxResult, setNewLuxResult] = useState<string>('250.0');
  const [newNoiseStd, setNewNoiseStd] = useState<string>('45 dB');
  const [newNoiseResult, setNewNoiseResult] = useState<string>('43.0');

  const currentPeriodLabel = useMemo(() => {
    if (selectedPeriod.startsWith('MONTH_')) {
      const mNo = Number(selectedPeriod.replace('MONTH_', ''));
      const found = AIR_MONTHS.find((m) => m.no === mNo);
      return found ? `Bulan ${found.label} ${selectedYear}` : `Bulan ${selectedYear}`;
    }
    switch (selectedPeriod) {
      case 'SEMESTER_1':
        return `Semester 1 (Januari – Juni) ${selectedYear}`;
      case 'SEMESTER_2':
        return `Semester 2 (Juli – Desember) ${selectedYear}`;
      case 'TRIWULAN_1':
        return `Triwulan I (Jan – Mar) ${selectedYear}`;
      case 'TRIWULAN_2':
        return `Triwulan II (Apr – Jun) ${selectedYear}`;
      case 'TRIWULAN_3':
        return `Triwulan III (Jul – Sep) ${selectedYear}`;
      case 'TRIWULAN_4':
        return `Triwulan IV (Okt – Des) ${selectedYear}`;
      case 'FULL_YEAR':
      default:
        return `1 Tahun Penuh (Januari – Desember) ${selectedYear}`;
    }
  }, [selectedPeriod, selectedYear]);

  // Grouping rows per unit group
  const groupedData = useMemo(() => {
    if (items.length === 0) return [];

    const groups: {
      groupName: string;
      items: AirQualityItem[];
      tempCompliance: number;
      luxCompliance: number;
      noiseCompliance: number;
    }[] = [];

    const distinctGroups = Array.from(new Set(items.map((i) => i.groupName)));

    distinctGroups.forEach((gName) => {
      const gItems = items.filter((i) => i.groupName === gName);
      const tempMs = gItems.filter((i) => i.tempHumidityScore === 1).length;
      const luxMs = gItems.filter((i) => i.luxScore === 1).length;
      const noiseMs = gItems.filter((i) => i.noiseScore === 1).length;

      groups.push({
        groupName: gName,
        items: gItems,
        tempCompliance: gItems.length > 0 ? Math.round((tempMs / gItems.length) * 100) : 0,
        luxCompliance: gItems.length > 0 ? Math.round((luxMs / gItems.length) * 100) : 0,
        noiseCompliance: gItems.length > 0 ? Math.round((noiseMs / gItems.length) * 100) : 0,
      });
    });

    return groups;
  }, [items]);

  // Chart data for comparing groups
  const chartData = useMemo(() => {
    return groupedData.map((g) => ({
      name: g.groupName,
      'Suhu & Kelembaban (%)': g.tempCompliance,
      'Pencahayaan (%)': g.luxCompliance,
      'Kebisingan (%)': g.noiseCompliance,
    }));
  }, [groupedData]);

  // Handle start editing value
  const handleStartEdit = (
    id: string,
    field: 'temp' | 'humidity' | 'lux' | 'noise',
    val: number
  ) => {
    setEditingId(id);
    setEditField(field);
    setEditValue(String(val));
  };

  const handleSaveEdit = (id: string) => {
    const num = Math.max(0, Number(editValue) || 0);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item };
        if (editField === 'temp') updated.tempResult = num;
        if (editField === 'humidity') updated.humidityResult = num;
        if (editField === 'lux') {
          updated.luxResult = num;
          updated.luxScore = num >= 100 ? 1 : 0;
        }
        if (editField === 'noise') {
          updated.noiseResult = num;
          updated.noiseScore = num <= 55 ? 1 : 0;
        }

        // Recalculate tempHumidityScore
        const isTempOk = updated.tempResult >= 18 && updated.tempResult <= 26;
        const isHumidityOk = updated.humidityResult >= 40 && updated.humidityResult <= 60;
        if (isTempOk && isHumidityOk) {
          updated.tempHumidityScore = 1;
        } else if (isTempOk || isHumidityOk) {
          updated.tempHumidityScore = 0.5;
        } else {
          updated.tempHumidityScore = 0;
        }

        return updated;
      })
    );
    setEditingId(null);
    setEditField(null);
    pushToast({
      type: 'success',
      title: 'Nilai Pemeriksaan Diperbarui',
      message: 'Hasil pengukuran fisik ruangan berhasil diperbarui secara realtime.',
    });
  };

  // Handle start editing unit name
  const handleStartEditUnitName = (item: AirQualityItem) => {
    setEditingUnitId(item.id);
    setEditingUnitName(item.unitName);
  };

  const handleSaveUnitName = (id: string) => {
    const trimmed = editingUnitName.trim();
    if (!trimmed) {
      pushToast({
        type: 'warning',
        title: 'Nama Ruangan Kosong',
        message: 'Nama ruangan tidak boleh kosong.',
      });
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unitName: trimmed } : item))
    );
    setEditingUnitId(null);
    pushToast({
      type: 'success',
      title: 'Nama Ruangan Diperbarui',
      message: `Nama ruangan berhasil diubah menjadi "${trimmed}".`,
    });
  };

  // Handle delete unit
  const handleDeleteUnit = (id: string, name: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    pushToast({
      type: 'info',
      title: 'Ruangan Dihapus',
      message: `Ruangan "${name}" telah dihapus dari tabel.`,
    });
  };

  // Handle add new room
  const handleAddNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGroupName =
      newGroupName === 'LAINNYA' ? customGroupName.trim() || 'UMUM' : newGroupName;
    const finalUnitName = newUnitName.trim();

    if (!finalUnitName) {
      pushToast({
        type: 'warning',
        title: 'Nama Ruangan Wajib Diisi',
        message: 'Silakan ketik nama ruangan atau unit yang akan dipantau.',
      });
      return;
    }

    const tRes = Math.max(0, Number(newTempResult) || 24);
    const hRes = Math.max(0, Number(newHumidityResult) || 50);
    const lRes = Math.max(0, Number(newLuxResult) || 250);
    const nRes = Math.max(0, Number(newNoiseResult) || 43);

    // Scoring
    const isTempOk = tRes >= 18 && tRes <= 26;
    const isHumidityOk = hRes >= 40 && hRes <= 60;
    const tempScore = isTempOk && isHumidityOk ? 1 : isTempOk || isHumidityOk ? 0.5 : 0;
    const luxScore = lRes >= 100 ? 1 : 0;
    const noiseScore = nRes <= 55 ? 1 : 0;
    const overallScore = Math.round(((tempScore + luxScore + noiseScore) / 3) * 10) / 10;

    const newItem: AirQualityItem = {
      id: `air-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      groupName: finalGroupName,
      unitName: finalUnitName,
      tempStd: newTempStd || '20-24',
      humidityStd: newHumidityStd || '40-60',
      tempResult: tRes,
      humidityResult: hRes,
      tempHumidityScore: tempScore,
      luxStd: newLuxStd || '250 LUX',
      luxResult: lRes,
      luxScore: luxScore,
      noiseStd: newNoiseStd || '45 dB',
      noiseResult: nRes,
      noiseScore: noiseScore,
      overallScore: overallScore,
    };

    setItems((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    setNewUnitName('');

    pushToast({
      type: 'success',
      title: 'Ruangan Berhasil Ditambahkan',
      message: `Ruangan "${finalUnitName}" telah dimasukkan ke dalam tabel pemantauan.`,
    });
  };

  return (
    <PageContainer>
      {/* 1. PAGE HEADER DENGAN FILTER PERIODE DI SISI KANAN SEJAJAR JUDUL */}
      <PageHeader
        title="Monitoring Kualitas Udara & Lingkungan Fisik Ruangan"
        description="Pemantauan Parameter Fisik Ruangan (Suhu, Kelembaban, Pencahayaan, dan Kebisingan)"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Tambah Ruangan Baru */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#002147] hover:bg-[#001630] border border-[#D2B48C]/60 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D2B48C]" />
              <span>Tambah Ruangan</span>
            </button>

            {/* Tombol Periode Tahun */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-air-year" className="sr-only">
                Tahun Pemantauan
              </label>
              <div className="relative">
                <select
                  id="filter-air-year"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  aria-label="Tahun Pemantauan"
                  className="appearance-none pl-4 pr-8 py-2 rounded-full text-xs font-bold bg-white/95 dark:bg-[#001835] text-[#002147] dark:text-slate-100 border border-[#D2B48C]/70 dark:border-slate-700 shadow-sm hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 cursor-pointer transition-all"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tombol Periode (Bulan, Triwulan, Semester, Tahunan) */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-air-period" className="sr-only">
                Rentang Periode
              </label>
              <div className="relative">
                <select
                  id="filter-air-period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as AirPeriodFilter)}
                  aria-label="Rentang Periode Pemantauan"
                  className="appearance-none pl-8 pr-8 py-2 rounded-full text-xs font-bold bg-white/95 dark:bg-[#001835] text-[#002147] dark:text-slate-100 border border-[#D2B48C]/70 dark:border-slate-700 shadow-sm hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 cursor-pointer transition-all"
                >
                  <optgroup label="Tahunan">
                    <option value="FULL_YEAR">1 Tahun Penuh (Januari – Desember)</option>
                  </optgroup>
                  <optgroup label="Semester">
                    <option value="SEMESTER_1">Semester 1 (Januari – Juni)</option>
                    <option value="SEMESTER_2">Semester 2 (Juli – Desember)</option>
                  </optgroup>
                  <optgroup label="Triwulan">
                    <option value="TRIWULAN_1">Triwulan I (Jan – Mar)</option>
                    <option value="TRIWULAN_2">Triwulan II (Apr – Jun)</option>
                    <option value="TRIWULAN_3">Triwulan III (Jul – Sep)</option>
                    <option value="TRIWULAN_4">Triwulan IV (Okt – Des)</option>
                  </optgroup>
                  <optgroup label="Bulanan">
                    {AIR_MONTHS.map((m) => (
                      <option key={m.no} value={`MONTH_${m.no}` as AirPeriodFilter}>
                        Bulan {m.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <Calendar className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#002147] dark:text-[#D2B48C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        }
      />

      {/* 2. TABEL INDIKATOR BAKU MUTU KUALITAS UDARA DENGAN TEMA OXFORD & TAN */}
      <section
        aria-label="Tabel Indikator Baku Mutu Kualitas Udara"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/20 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        {/* Banner Table Header Oxford & Tan Soft Center & Tombol Sheet di Kanan Atas */}
        <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 bg-[#002147] dark:bg-[#00152E] border-b border-[#D2B48C]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Spacer penyeimbang di sisi kiri agar judul benar-benar rata tengah */}
          <div className="hidden sm:block sm:w-56 shrink-0" aria-hidden="true" />

          {/* Judul Rata Tengah Berwarna Tan */}
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#D2B48C] uppercase text-center flex-1">
            INDIKATOR BAKU MUTU KUALITAS UDARA & FISIK RUANGAN
          </h2>

          {/* Tombol Tab Sheet di Kanan Atas Sejajar Judul */}
          <div className="w-full sm:w-56 flex justify-center sm:justify-end shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-900/90 rounded-xl border border-[#D2B48C] dark:border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveSheet('sheet1')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeSheet === 'sheet1'
                    ? 'bg-[#002147] text-white dark:bg-[#D2B48C] dark:text-[#002147] shadow-xs'
                    : 'text-[#002147] dark:text-slate-300 hover:bg-[#F5EDE0] dark:hover:bg-slate-800'
                }`}
              >
                Input Data
              </button>
              <button
                type="button"
                onClick={() => setActiveSheet('sheet2')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeSheet === 'sheet2'
                    ? 'bg-[#002147] text-white dark:bg-[#D2B48C] dark:text-[#002147] shadow-xs'
                    : 'text-[#002147] dark:text-slate-300 hover:bg-[#F5EDE0] dark:hover:bg-slate-800'
                }`}
              >
                Rekapan Data
              </button>
            </div>
          </div>
        </div>

        {/* Sheet 1: Input Data Matriks Rinci Parameter Fisik */}
        {activeSheet === 'sheet1' ? (
          <div className="overflow-x-auto max-h-[780px] overflow-y-auto smooth-scroll-container">
            {items.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-4 bg-white dark:bg-slate-900">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FAF6F0] dark:bg-slate-800 text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/60 flex items-center justify-center shadow-xs">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-extrabold text-[#002147] dark:text-white">
                    Belum Ada Data Ruangan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Data dummy telah dibersihkan. Silakan klik tombol di bawah untuk mulai menambahkan daftar nama ruangan dan hasil pengukuran fisik.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#002147] hover:bg-[#001630] border border-[#D2B48C]/60 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D2B48C]" />
                  <span>Tambah Ruangan Pertama</span>
                </button>
              </div>
            ) : (
              <table className="w-full min-w-[980px] border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 z-20 shadow-xs">
                  {/* Baris 1 Header */}
                  <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                    <th
                      rowSpan={2}
                      className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-2 py-2.5 text-center font-bold w-12 align-middle"
                    >
                      No
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-2.5 text-center font-bold w-28 align-middle"
                    >
                      Bulan
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-2.5 text-center font-bold align-middle"
                    >
                      Kelembapan udara & Suhu
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-2.5 text-center font-bold align-middle"
                    >
                      Pencahayaan
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-2.5 text-center font-bold align-middle"
                    >
                      Kebisingan
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-2 py-2.5 text-center font-bold w-14 align-middle"
                    >
                      NILAI
                    </th>
                  </tr>

                  {/* Baris 2 Sub-Header */}
                  <tr className="bg-[#FAF6F0] dark:bg-[#001B3B] text-[#002147] dark:text-[#D2B48C] font-bold">
                    {/* Kelembaban & Suhu */}
                    <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold min-w-[170px] align-middle">
                      Unit / Ruangan (Bisa Diedit)
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold w-20 align-middle">
                      Hasil Suhu
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold w-24 align-middle">
                      Hasil Kelembaban
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/60 dark:bg-[#001630] px-2 py-2 text-center font-bold w-12 align-middle">
                      NILAI
                    </th>

                    {/* Pencahayaan */}
                    <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold min-w-[130px] align-middle">
                      Unit
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold w-20 align-middle">
                      Hasil
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/60 dark:bg-[#001630] px-2 py-2 text-center font-bold w-12 align-middle">
                      NILAI
                    </th>

                    {/* Kebisingan */}
                    <th className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center font-bold min-w-[130px] align-middle">
                      Unit
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold w-20 align-middle">
                      Hasil
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/60 dark:bg-[#001630] px-2 py-2 text-center font-bold w-12 align-middle">
                      NILAI
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {groupedData.map((group, gIdx) => {
                    return (
                      <React.Fragment key={group.groupName}>
                        {/* Baris Banner Grup Unit dengan Tema Tan/Oxford */}
                        <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold border-y border-slate-400 dark:border-slate-700">
                          {gIdx === 0 && (
                            <>
                              <td
                                rowSpan={items.length + groupedData.length}
                                className="border border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#002147] dark:text-slate-100 text-center font-bold align-top pt-3 tabular-nums"
                              >
                                1
                              </td>
                              <td
                                rowSpan={items.length + groupedData.length}
                                className="border border-slate-400 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-900/90 text-[#002147] dark:text-slate-100 text-center font-extrabold align-top pt-3 uppercase tracking-wider text-[11px]"
                              >
                                {currentPeriodLabel}
                              </td>
                            </>
                          )}
                          {/* Group Header Suhu */}
                          <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 uppercase tracking-wide">
                            {group.groupName} :
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center text-[11px]">
                            {group.items[0]?.tempStd} °C
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center text-[11px]">
                            {group.items[0]?.humidityStd} %
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/45 dark:bg-[#001630] px-2 py-2 text-center font-black">
                            {group.tempCompliance}%
                          </td>

                          {/* Group Header Pencahayaan */}
                          <td className="border border-slate-400 dark:border-slate-700 px-3 py-2">
                            {group.groupName}
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center text-[11px]">
                            {group.items[0]?.luxStd}
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/45 dark:bg-[#001630] px-2 py-2 text-center font-black">
                            {group.luxCompliance}%
                          </td>

                          {/* Group Header Kebisingan */}
                          <td className="border border-slate-400 dark:border-slate-700 px-3 py-2">
                            {group.groupName}
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center text-[11px]">
                            {group.items[0]?.noiseStd}
                          </td>
                          <td className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/45 dark:bg-[#001630] px-2 py-2 text-center font-black">
                            {group.noiseCompliance}%
                          </td>

                          {/* Overall Group Nilai */}
                          <td className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C]/60 dark:bg-[#001630] px-2 py-2 text-center font-black">
                            1
                          </td>
                        </tr>

                        {/* Baris Rinci Unit dalam Grup */}
                        {group.items.map((row) => {
                          const tempCellBg =
                            row.tempHumidityScore === 1
                              ? 'bg-[#F5EDE0]/85 dark:bg-slate-800/80 text-[#002147] dark:text-slate-100'
                              : 'bg-[#FFC000] text-slate-950 font-bold';

                          const luxCellBg =
                            row.luxScore === 1
                              ? 'bg-[#F5EDE0]/85 dark:bg-slate-800/80 text-[#002147] dark:text-slate-100'
                              : 'bg-[#FFC000] text-slate-950 font-bold';

                          const noiseCellBg =
                            row.noiseScore === 1
                              ? 'bg-[#F5EDE0]/85 dark:bg-slate-800/80 text-[#002147] dark:text-slate-100'
                              : 'bg-[#FFC000] text-slate-950 font-bold';

                          return (
                            <tr
                              key={row.id}
                              className="bg-white dark:bg-slate-900 hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 group transition-colors"
                            >
                              {/* Kolom Unit / Ruangan (Bisa Diedit Namanya) */}
                              <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-[#002147] dark:text-slate-100 font-medium">
                                {editingUnitId === row.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editingUnitName}
                                      onChange={(e) => setEditingUnitName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveUnitName(row.id);
                                        if (e.key === 'Escape') setEditingUnitId(null);
                                      }}
                                      className="w-full px-2 py-1 text-xs font-bold border border-[#002147] rounded bg-white dark:bg-slate-800 text-[#002147] dark:text-white"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveUnitName(row.id)}
                                      className="p-1 rounded bg-[#002147] text-white hover:bg-[#001630]"
                                      title="Simpan Nama Ruangan"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingUnitId(null)}
                                      className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                                      title="Batal"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span
                                      className="cursor-pointer hover:underline hover:text-[#002147] dark:hover:text-[#D2B48C] transition-colors"
                                      onClick={() => handleStartEditUnitName(row)}
                                      title="Klik untuk mengubah nama ruangan ini"
                                    >
                                      {row.unitName}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditUnitName(row)}
                                        className="p-0.5 rounded text-slate-400 hover:text-[#002147] dark:hover:text-[#D2B48C]"
                                        title="Ubah Nama Ruangan"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteUnit(row.id, row.unitName)}
                                        className="p-0.5 rounded text-slate-400 hover:text-red-600"
                                        title="Hapus Ruangan"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Suhu & Kelembaban Nilai */}
                              <td
                                className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center tabular-nums cursor-pointer text-[#002147] dark:text-slate-100"
                                onClick={() => handleStartEdit(row.id, 'temp', row.tempResult)}
                                title="Klik untuk mengubah nilai suhu"
                              >
                                {editingId === row.id && editField === 'temp' ? (
                                  <div className="inline-flex items-center gap-0.5">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(row.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                      }}
                                      className="w-12 px-1 py-0.5 text-xs text-center border border-[#002147] rounded bg-white text-[#002147] font-bold"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(row.id)}
                                      className="p-0.5 bg-[#002147] text-white rounded"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span>{row.tempResult.toFixed(2).replace('.', ',')} °C</span>
                                )}
                              </td>

                              <td
                                className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center tabular-nums cursor-pointer text-[#002147] dark:text-slate-100"
                                onClick={() =>
                                  handleStartEdit(row.id, 'humidity', row.humidityResult)
                                }
                                title="Klik untuk mengubah nilai kelembaban"
                              >
                                {editingId === row.id && editField === 'humidity' ? (
                                  <div className="inline-flex items-center gap-0.5">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(row.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                      }}
                                      className="w-12 px-1 py-0.5 text-xs text-center border border-[#002147] rounded bg-white text-[#002147] font-bold"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(row.id)}
                                      className="p-0.5 bg-[#002147] text-white rounded"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span>{row.humidityResult.toFixed(1).replace('.', ',')} % RH</span>
                                )}
                              </td>

                              <td
                                className={`border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold ${tempCellBg}`}
                              >
                                {row.tempHumidityScore}
                              </td>

                              {/* Pencahayaan */}
                              <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-[#002147] dark:text-slate-100 font-medium">
                                {row.unitName}
                              </td>
                              <td
                                className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center tabular-nums cursor-pointer text-[#002147] dark:text-slate-100"
                                onClick={() => handleStartEdit(row.id, 'lux', row.luxResult)}
                                title="Klik untuk mengubah nilai pencahayaan"
                              >
                                {editingId === row.id && editField === 'lux' ? (
                                  <div className="inline-flex items-center gap-0.5">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(row.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                      }}
                                      className="w-12 px-1 py-0.5 text-xs text-center border border-[#002147] rounded bg-white text-[#002147] font-bold"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(row.id)}
                                      className="p-0.5 bg-[#002147] text-white rounded"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span>{row.luxResult.toFixed(1).replace('.', ',')} LUX</span>
                                )}
                              </td>
                              <td
                                className={`border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold ${luxCellBg}`}
                              >
                                {row.luxScore}
                              </td>

                              {/* Kebisingan */}
                              <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-[#002147] dark:text-slate-100 font-medium">
                                {row.unitName}: {row.noiseStd}
                              </td>
                              <td
                                className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center tabular-nums cursor-pointer text-[#002147] dark:text-slate-100"
                                onClick={() => handleStartEdit(row.id, 'noise', row.noiseResult)}
                                title="Klik untuk mengubah nilai kebisingan"
                              >
                                {editingId === row.id && editField === 'noise' ? (
                                  <div className="inline-flex items-center gap-0.5">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(row.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                      }}
                                      className="w-12 px-1 py-0.5 text-xs text-center border border-[#002147] rounded bg-white text-[#002147] font-bold"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(row.id)}
                                      className="p-0.5 bg-[#002147] text-white rounded"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span>{row.noiseResult.toFixed(0)} dB</span>
                                )}
                              </td>
                              <td
                                className={`border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold ${noiseCellBg}`}
                              >
                                {row.noiseScore}
                              </td>

                              {/* Nilai Gabungan */}
                              <td className="border border-slate-400 dark:border-slate-700 px-2 py-2 text-center font-bold bg-[#F5EDE0]/85 dark:bg-slate-800/80 text-[#002147] dark:text-white">
                                {row.overallScore}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* Sheet 2: Rekapan Data Persentase Capaian Baku Mutu Per Unit */
          <div className="overflow-x-auto max-h-[780px] overflow-y-auto smooth-scroll-container">
            {groupedData.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 text-sm font-medium bg-white dark:bg-slate-900">
                Belum ada data rekapan. Silakan tambahkan data ruangan terlebih dahulu.
              </div>
            ) : (
              <table className="w-full min-w-[700px] border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 z-20 shadow-xs">
                  <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-3 text-center font-bold w-14 align-middle">
                      No
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-4 py-3 text-left font-bold min-w-[180px] align-middle">
                      Kelompok Unit / Ruangan
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-3 text-center font-bold w-32 align-middle">
                      Capaian Suhu & RH
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-3 text-center font-bold w-32 align-middle">
                      Capaian Pencahayaan
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#EFE4D2] dark:bg-[#002147] px-3 py-3 text-center font-bold w-32 align-middle">
                      Capaian Kebisingan
                    </th>
                    <th className="border border-slate-400 dark:border-slate-700 bg-[#D2B48C] dark:bg-[#001630] text-[#002147] dark:text-[#D2B48C] px-3 py-3 text-center font-bold w-36 align-middle">
                      Status Kepatuhan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData.map((g, idx) => {
                    const avg = Math.round(
                      (g.tempCompliance + g.luxCompliance + g.noiseCompliance) / 3
                    );
                    return (
                      <tr
                        key={g.groupName}
                        className="hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors"
                      >
                        <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold tabular-nums text-[#002147] dark:text-slate-200">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 dark:border-slate-700 px-4 py-2.5 font-bold text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0] dark:bg-slate-900/90">
                          {g.groupName}
                        </td>
                        <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              g.tempCompliance >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : g.tempCompliance >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {g.tempCompliance}%
                          </span>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              g.luxCompliance >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : g.luxCompliance >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {g.luxCompliance}%
                          </span>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              g.noiseCompliance >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : g.noiseCompliance >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {g.noiseCompliance}%
                          </span>
                        </td>
                        <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold bg-[#F5EDE0]/85 dark:bg-slate-800/80">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs ${
                              avg >= 70
                                ? 'bg-emerald-600 text-white'
                                : avg >= 45
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-rose-600 text-white'
                            }`}
                          >
                            {avg >= 70 ? 'Memenuhi Syarat' : 'Perlu Intervensi'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Bottom Legend Bar di Bawah Tabel */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#EFE4D2]/75 dark:bg-[#00152E] border-t border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] sm:text-xs text-[#002147] dark:text-[#D2B48C] font-semibold flex items-center gap-1.5">
            <span>Keterangan Status Capaian Baku Mutu:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[#002147] dark:text-slate-200 font-semibold border border-[#D2B48C] dark:border-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span>Nilai 1 (MS): Memenuhi Syarat Baku Mutu</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFC000] text-slate-950 font-bold border border-amber-500 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shrink-0" />
              <span>Nilai 0.5 (Parsial): 1 Parameter MS</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DC2626] text-white font-bold border border-red-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shrink-0" />
              <span>Nilai 0 (TMS): Melebihi Baku Mutu</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. VISUALISASI GRAFIK REALTIME DATA KUALITAS UDARA & FISIK RUANGAN */}
      <section
        aria-label="Visualisasi Grafik Kualitas Udara"
        className="rounded-[28px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 p-4 sm:p-5 shadow-[0_14px_38px_rgba(21,62,117,0.08)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#153E75] dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Grafik Realtime Kepatuhan Fisik Ruangan</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Tingkat Pemenuhan Baku Mutu per Kelompok Ruangan ({selectedYear})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan persentase pemenuhan syarat suhu & kelembaban, intensitas cahaya lux, dan ambang batas kebisingan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Thermometer className="w-3.5 h-3.5 text-blue-500" /> Suhu & RH
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Cahaya
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> Bising
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Grafik akan otomatis muncul setelah data ruangan ditambahkan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip
                  formatter={(value) => [`${value ?? 0}%`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Suhu & Kelembaban (%)" fill="#1D7AFC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pencahayaan (%)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kebisingan (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* 4. ANALISA DATA, REKOMENDASI & RENCANA TINDAK LANJUT (1 CARD RESMI SESUAI FORMAT) */}
      <section
        aria-label="Analisa Data, Rekomendasi dan Rencana Tindak Lanjut"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 p-6 sm:p-8 shadow-[0_14px_38px_rgba(21,62,117,0.08)] space-y-6"
      >
        {/* Bagian Analisa Data */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed text-justify indent-6 sm:indent-8 font-normal">
            {items.length === 0
              ? `Pemantauan kualitas fisik udara ruangan dan lingkungan rumah sakit di UOBK RSUD Al-Mulk periode tahun ${selectedYear} mencakup pengukuran suhu (°C), kelembaban relatif (% RH), intensitas pencahayaan (LUX), dan tingkat kebisingan (dB). Silakan tambahkan data pengukuran ruangan melalui tombol "+ Tambah Ruangan" untuk menghasilkan kalkulasi kepatuhan baku mutu dan narasi evaluasi analitik secara realtime.`
              : `Berdasarkan hasil pemantauan dan pengujian laboratorium lingkungan terhadap kualitas udara dan parameter fisik ruangan di UOBK RSUD Al-Mulk sepanjang periode tahun ${selectedYear}, secara umum intensitas pencahayaan di area pelayanan utama telah memenuhi standar baku mutu (skor capaian memenuhi syarat). Pada parameter suhu dan kelembaban udara (RH) teridentifikasi tren kelembaban yang dipengaruhi oleh sirkulasi tata udara mekanik dan suhu ruangan. Pada parameter kebisingan, sebagian besar ruang rawat inap stabil memenuhi baku mutu maksimal (≤ 45 dB), dengan penertiban berkelanjutan terhadap aktivitas lalu lintas penunggu dan sumber bising operasional.`}
          </p>
        </div>

        {/* Bagian Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">1.</span>
              <span className="text-justify">
                Melakukan pembersihan berkala filter pendingin ruangan (AC split/central) serta penambahan unit <em>dehumidifier</em> portabel pada ruang penyimpanan berkas rekam medis dan depo obat farmasi untuk menekan kelembaban di bawah 60% RH.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Menata dan menambah armatur lampu LED hemat energi dengan intensitas cahaya minimal 200 LUX pada ruang poli rawat jalan anak, kebidanan, dan umum yang saat ini masih di bawah standar pencahayaan.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Memasang material peredam getaran (<em>vibration isolator</em>) pada unit kompresor/mesin operasional serta menerapkan tata tertib zona tenang dan pembatasan jumlah pengunjung di ruang rawat inap.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Melanjutkan kerja sama pemantauan dan uji sampel mikrobiologi udara (angka kuman udara dan jamur) dengan laboratorium kesehatan lingkungan terakreditasi KAN secara periodik setiap semester.
              </span>
            </li>
          </ol>
        </div>

        {/* Bagian Rencana Tindak Lanjut */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">1.</span>
              <span className="text-justify">
                Menjadwalkan pemeriksaan suhu dan kelembaban harian oleh petugas Sanitarian menggunakan <em>thermo-hygrometer</em> terkalibrasi di ruang-ruang kritis (IBS, ICU, Isolasi, dan Farmasi).
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">2.</span>
              <span className="text-justify">
                Melakukan kalibrasi tahunan terhadap alat ukur <em>sound level meter</em> dan <em>lux meter</em> oleh Balai Pengamanan Fasilitas Kesehatan (BPFK).
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">3.</span>
              <span className="text-justify">
                Mengagendakan supervisi gabungan bersama Instalasi Pemeliharaan Sarana Rumah Sakit (IPSRS) untuk pemeliharaan sistem tata udara (AHU/HEPA filter) di ruang operasi dan isolasi bertekanan negatif.
              </span>
            </li>
            <li className="grid grid-cols-[1.5rem_1fr] items-baseline">
              <span className="font-semibold tabular-nums select-none">4.</span>
              <span className="text-justify">
                Menyusun dan menyampaikan rekapitulasi laporan triwulanan pemantauan kualitas lingkungan fisik rumah sakit kepada pimpinan manajemen dan Dinas Kesehatan Kota Sukabumi.
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* 5. MODAL TAMBAH RUANGAN BARU */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#153E75] dark:text-sky-300" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Tambah Data Ruangan Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewRoom} className="space-y-4 text-xs">
              {/* Kelompok Unit */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kelompok Unit / Ruangan
                </label>
                <select
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {DEFAULT_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="LAINNYA">+ Kelompok Kustom Lainnya...</option>
                </select>
              </div>

              {newGroupName === 'LAINNYA' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kelompok Kustom
                  </label>
                  <input
                    type="text"
                    value={customGroupName}
                    onChange={(e) => setCustomGroupName(e.target.value)}
                    placeholder="Contoh: RADIOLOGI & LABORATORIUM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>
              )}

              {/* Nama Ruangan */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Ruangan / Unit
                </label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Contoh: 1. Ruang Isolasi / Poli Gigi / Kamar 101"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              {/* Parameter Suhu & Kelembaban */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-[#153E75] dark:text-sky-300 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                  <span>Parameter Suhu & Kelembaban</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Standar Suhu (°C)
                    </label>
                    <input
                      type="text"
                      value={newTempStd}
                      onChange={(e) => setNewTempStd(e.target.value)}
                      placeholder="20-24"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Hasil Suhu (°C)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTempResult}
                      onChange={(e) => setNewTempResult(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Standar Kelembaban (% RH)
                    </label>
                    <input
                      type="text"
                      value={newHumidityStd}
                      onChange={(e) => setNewHumidityStd(e.target.value)}
                      placeholder="40-60"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Hasil Kelembaban (% RH)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newHumidityResult}
                      onChange={(e) => setNewHumidityResult(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Parameter Pencahayaan */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-[#153E75] dark:text-sky-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Parameter Pencahayaan (LUX)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Standar LUX
                    </label>
                    <input
                      type="text"
                      value={newLuxStd}
                      onChange={(e) => setNewLuxStd(e.target.value)}
                      placeholder="250 LUX"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Hasil LUX
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newLuxResult}
                      onChange={(e) => setNewLuxResult(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Parameter Kebisingan */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-[#153E75] dark:text-sky-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Parameter Kebisingan (dB)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Standar Kebisingan
                    </label>
                    <input
                      type="text"
                      value={newNoiseStd}
                      onChange={(e) => setNewNoiseStd(e.target.value)}
                      placeholder="45 dB"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Hasil Kebisingan (dB)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newNoiseResult}
                      onChange={(e) => setNewNoiseResult(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153E75] hover:bg-[#10315E] text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={async () => {
          let nextItems = items;
          if (editingId && editField) {
            const num = Math.max(0, Number(editValue) || 0);
            nextItems = items.map((item) => {
              if (item.id !== editingId) return item;
              const updated = { ...item };
              if (editField === 'temp') updated.tempResult = num;
              if (editField === 'humidity') updated.humidityResult = num;
              if (editField === 'lux') {
                updated.luxResult = num;
                updated.luxScore = num >= 100 ? 1 : 0;
              }
              if (editField === 'noise') {
                updated.noiseResult = num;
                updated.noiseScore = num <= 55 ? 1 : 0;
              }
              const isTempOk = updated.tempResult >= 18 && updated.tempResult <= 26;
              const isHumidityOk =
                updated.humidityResult >= 40 && updated.humidityResult <= 60;
              updated.tempHumidityScore =
                isTempOk && isHumidityOk ? 1 : isTempOk || isHumidityOk ? 0.5 : 0;
              return updated;
            });
            setEditingId(null);
            setEditField(null);
          }
          if (editingUnitId && editingUnitName.trim()) {
            nextItems = nextItems.map((item) =>
              item.id === editingUnitId
                ? { ...item, unitName: editingUnitName.trim().toUpperCase() }
                : item
            );
            setEditingUnitId(null);
          }
          await updateAirItems(nextItems);
          setHasUnsavedChanges(false);
          pushToast({
            type: 'success',
            title: 'Data Monitoring Kualitas Udara Tersimpan',
            message:
              'Data tabel Monitoring Kualitas Udara telah disimpan dalam aplikasi dan disinkronkan ke database Supabase.',
          });
        }}
      />

      {/* Sanitarian Inspector Signature Block */}
      <section
        aria-label="Pengesahan Sanitarian Inspector"
        className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#D2B48C]/50 p-5 shadow-sm text-slate-800 dark:text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:block"
      >
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Unit Penanggung Jawab Teknis Kesling
          </p>
          <p className="text-sm font-extrabold text-[#002147] dark:text-[#D2B48C]">
            UOBK RSUD Al-Mulk Kota Sukabumi
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Pemeriksaan Parameter Fisik Kualitas Udara (Suhu, Kelembaban, Pencahayaan, Kebisingan)
          </p>
        </div>

        <div className="text-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-6 min-w-[200px]">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Sanitarian Inspector,
          </p>
          <p className="text-sm font-black text-[#002147] dark:text-[#D2B48C] underline underline-offset-4">
            Fitria Wulandari, AMKL
          </p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            NUP. 20210301P1154
          </p>
        </div>
      </section>

    </PageContainer>
  );
}
