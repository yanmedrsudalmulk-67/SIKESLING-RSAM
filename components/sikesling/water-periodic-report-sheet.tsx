'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Check,
  X,
  Upload,
  BarChart3,
  TrendingUp,
  Droplets,
  Gauge,
  CheckCircle2,
  ChevronDown,
  Camera,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  WaterPeriodicReportRow,
  DEFAULT_SIPA_COMPANY_NAME,
  DEFAULT_WELL_SIPA_IDENTITY,
  WELL_SIPA_OPTIONS,
  mergeWellSipaOptions,
  addWellSipaOption,
  editWellSipaOption,
  deleteWellSipaOption,
  calculateWaterPeriodicReportSummary,
  buildDefaultMeterPhotoDataUrl,
} from '@/lib/water-quality';

const WELL_OPTIONS_STORAGE_KEY = 'sikesling_sipa_well_options_v1';

interface WaterPeriodicReportSheetProps {
  rows: WaterPeriodicReportRow[];
  selectedYear: number;
  isDark: boolean;
  onUpdateRows: (updated: WaterPeriodicReportRow[]) => void;
  pushToast: (toast: {
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  }) => void;
}

export function WaterPeriodicReportSheet({
  rows,
  selectedYear,
  isDark,
  onUpdateRows,
  pushToast,
}: WaterPeriodicReportSheetProps) {
  const initialRow = rows[0];
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    initialRow?.monthIndex ?? 1
  );
  const [companyName, setCompanyName] = useState<string>(
    initialRow?.companyName || DEFAULT_SIPA_COMPANY_NAME
  );
  const [wellIdentity, setWellIdentity] = useState<string>(
    initialRow?.wellIdentity || DEFAULT_WELL_SIPA_IDENTITY
  );
  const [customWellOptions, setCustomWellOptions] = useState<string[]>(() =>
    mergeWellSipaOptions(WELL_SIPA_OPTIONS, rows)
  );
  const wellOptions = useMemo(
    () => mergeWellSipaOptions(customWellOptions, rows),
    [customWellOptions, rows]
  );
  const [isWellDropdownOpen, setIsWellDropdownOpen] = useState<boolean>(false);
  const [hoveredWellTarget, setHoveredWellTarget] = useState<string | null>(null);
  const [isAddingWell, setIsAddingWell] = useState<boolean>(false);
  const [newWellInput, setNewWellInput] = useState<string>('');
  const [editingWellTarget, setEditingWellTarget] = useState<string | null>(null);
  const [editingWellInput, setEditingWellInput] = useState<string>('');
  const wellDropdownContainerRef = useRef<HTMLDivElement | null>(null);

  const [extractionInput, setExtractionInput] = useState<string>(
    initialRow ? String(initialRow.extractionVolumeM3) : ''
  );
  const [communityGrant, setCommunityGrant] = useState<'Tidak' | 'Ya'>(
    initialRow?.communityWaterGrant || 'Tidak'
  );
  const [groundwaterInput, setGroundwaterInput] = useState<string>(
    initialRow ? String(initialRow.groundwaterLevelMbmt) : ''
  );
  const [photoFileName, setPhotoFileName] = useState<string>(
    initialRow?.meterPhotoFileName || ''
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rowFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetMonthIndex, setUploadTargetMonthIndex] = useState<number | null>(null);
  const [previewPhotoRow, setPreviewPhotoRow] = useState<WaterPeriodicReportRow | null>(null);

  // Close well dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wellDropdownContainerRef.current &&
        !wellDropdownContainerRef.current.contains(e.target as Node)
      ) {
        setIsWellDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const persistWellOptions = (nextOptions: string[]) => {
    setCustomWellOptions(nextOptions);
  };

  // Inline editing state for Rekapan Table
  const [editingCell, setEditingCell] = useState<{
    monthIndex: number;
    field:
      | 'companyName'
      | 'wellIdentity'
      | 'extractionVolumeM3'
      | 'groundwaterLevelMbmt';
  } | null>(null);
  const [inlineEditVal, setInlineEditVal] = useState<string>('');

  const [chartMode, setChartMode] = useState<'composed' | 'line'>('composed');

  const summary = useMemo(
    () => calculateWaterPeriodicReportSummary(rows, selectedYear),
    [rows, selectedYear]
  );

  const chartData = useMemo(() => {
    return rows.map((r) => ({
      name: r.monthShort,
      bulan: r.monthLabel,
      pengambilanM3: r.extractionVolumeM3,
      mukaAirTanahMbmt: r.groundwaterLevelMbmt,
    }));
  }, [rows]);

  // Helper to update a specific month row and trigger floating Simpan Data button
  const updateMonthRow = (
    monthIndex: number,
    patch: Partial<WaterPeriodicReportRow>
  ) => {
    const updated = rows.map((r) => {
      if (r.monthIndex !== monthIndex) return r;
      const merged = {
        ...r,
        ...patch,
        year: selectedYear,
      };
      const status: 'Terlapor' | 'Belum Lengkap' =
        merged.extractionVolumeM3 > 0 && merged.groundwaterLevelMbmt > 0
          ? 'Terlapor'
          : 'Belum Lengkap';
      return {
        ...merged,
        status,
      };
    });
    onUpdateRows(updated);
  };

  // Handlers for Add, Edit, Delete on Sumur Dropdown
  const handleStartAddWell = () => {
    setIsAddingWell(true);
    setEditingWellTarget(null);
    setNewWellInput(`No sumur : SB - ${wellOptions.length + 1} - No Izin : 29/291300/DPMPTSP/2022`);
  };

  const handleConfirmAddWell = () => {
    const cleaned = newWellInput.trim();
    if (!cleaned) {
      pushToast({
        type: 'warning',
        title: 'No. Sumur Kosong',
        message: 'Harap isi nomor dan identitas izin sumur terlebih dahulu.',
      });
      return;
    }
    const nextOptions = addWellSipaOption(wellOptions, cleaned);
    persistWellOptions(nextOptions);
    setWellIdentity(cleaned);
    setIsAddingWell(false);
    setNewWellInput('');
    updateMonthRow(selectedMonthIndex, { wellIdentity: cleaned });
    pushToast({
      type: 'success',
      title: 'No. Sumur Ditambahkan',
      message: `"${cleaned}" berhasil ditambahkan ke daftar Sumur.`,
    });
  };

  const handleStartEditWell = (targetOpt: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAddingWell(false);
    setEditingWellTarget(targetOpt);
    setEditingWellInput(targetOpt);
  };

  const handleConfirmEditWell = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingWellTarget) return;
    const cleaned = editingWellInput.trim();
    if (!cleaned) {
      pushToast({
        type: 'warning',
        title: 'No. Sumur Tidak Boleh Kosong',
        message: 'Harap masukkan identitas sumur yang valid.',
      });
      return;
    }
    const nextOptions = editWellSipaOption(wellOptions, editingWellTarget, cleaned);
    persistWellOptions(nextOptions);
    if (wellIdentity === editingWellTarget) {
      setWellIdentity(cleaned);
    }
    // Update all rows that were using editingWellTarget
    const updatedRows = rows.map((r) =>
      r.wellIdentity === editingWellTarget ? { ...r, wellIdentity: cleaned } : r
    );
    onUpdateRows(updatedRows);
    setEditingWellTarget(null);
    setEditingWellInput('');
    pushToast({
      type: 'success',
      title: 'No. Sumur Diperbarui',
      message: `Identitas sumur berhasil diubah menjadi "${cleaned}".`,
    });
  };

  const handleDeleteWell = (targetOpt: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (wellOptions.length <= 1) {
      pushToast({
        type: 'warning',
        title: 'Tidak Dapat Menghapus',
        message: 'Minimal harus terdapat 1 No. Sumur pada daftar.',
      });
      return;
    }
    const nextOptions = deleteWellSipaOption(wellOptions, targetOpt);
    persistWellOptions(nextOptions);
    const fallbackWell = nextOptions[0] || DEFAULT_WELL_SIPA_IDENTITY;
    if (wellIdentity === targetOpt) {
      setWellIdentity(fallbackWell);
    }
    const updatedRows = rows.map((r) =>
      r.wellIdentity === targetOpt ? { ...r, wellIdentity: fallbackWell } : r
    );
    onUpdateRows(updatedRows);
    if (editingWellTarget === targetOpt) {
      setEditingWellTarget(null);
    }
    pushToast({
      type: 'info',
      title: 'No. Sumur Dihapus',
      message: `"${targetOpt}" telah dihapus dari pilihan dropdown Sumur.`,
    });
  };

  const handleSelectPeriodeMonth = (mIdx: number) => {
    setSelectedMonthIndex(mIdx);
    const found = rows.find((r) => r.monthIndex === mIdx);
    if (found) {
      setCompanyName(found.companyName || DEFAULT_SIPA_COMPANY_NAME);
      setWellIdentity(found.wellIdentity || DEFAULT_WELL_SIPA_IDENTITY);
      setExtractionInput(String(found.extractionVolumeM3));
      setCommunityGrant(found.communityWaterGrant);
      setGroundwaterInput(String(found.groundwaterLevelMbmt));
      setPhotoFileName(found.meterPhotoFileName || '');
    }
  };

  const processMeterPhotoFile = (file: File, targetMonthIdx: number) => {
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      pushToast({
        type: 'warning',
        title: 'Ukuran File Melebihi 2MB',
        message: 'Harap pilih file Foto Meter Air dengan ukuran kurang dari 2MB.',
      });
      return;
    }

    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    if (targetMonthIdx === selectedMonthIndex) {
      setPhotoFileName(file.name);
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;
        updateMonthRow(targetMonthIdx, {
          meterPhotoFileName: file.name,
          meterPhotoFileSizeKB: sizeKB,
          ...(dataUrl ? { meterPhotoDataUrl: dataUrl } : {}),
        });
        const monthRow = rows.find((r) => r.monthIndex === targetMonthIdx);
        pushToast({
          type: 'success',
          title: 'Foto Meter Air Diperbarui',
          message: `Foto "${file.name}" (${sizeKB} KB) berhasil dimuat pada bulan ${monthRow?.monthLabel ?? ''}. Klik Simpan Data di kanan bawah untuk menyimpan.`,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const monthRow = rows.find((r) => r.monthIndex === targetMonthIdx);
      updateMonthRow(targetMonthIdx, {
        meterPhotoFileName: file.name,
        meterPhotoFileSizeKB: sizeKB,
        meterPhotoDataUrl: buildDefaultMeterPhotoDataUrl(
          monthRow?.monthLabel || 'Januari',
          selectedYear,
          monthRow?.extractionVolumeM3 || 1250,
          targetMonthIdx
        ),
      });
      pushToast({
        type: 'success',
        title: 'File Meter Air Dipilih',
        message: `File "${file.name}" (${sizeKB} KB) siap disimpan pada bulan ${monthRow?.monthLabel ?? ''}.`,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processMeterPhotoFile(file, selectedMonthIndex);
    e.target.value = '';
  };

  const handleRowFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetMonthIndex === null) return;
    processMeterPhotoFile(file, uploadTargetMonthIndex);
    setUploadTargetMonthIndex(null);
    e.target.value = '';
  };

  const startInlineEdit = (
    monthIndex: number,
    field:
      | 'companyName'
      | 'wellIdentity'
      | 'extractionVolumeM3'
      | 'groundwaterLevelMbmt',
    currentVal: string | number
  ) => {
    setEditingCell({ monthIndex, field });
    setInlineEditVal(String(currentVal));
  };

  const commitInlineEdit = () => {
    if (!editingCell) return;
    const { monthIndex, field } = editingCell;

    if (field === 'companyName' || field === 'wellIdentity') {
      const cleaned =
        inlineEditVal.trim() ||
        (field === 'companyName'
          ? DEFAULT_SIPA_COMPANY_NAME
          : DEFAULT_WELL_SIPA_IDENTITY);
      updateMonthRow(monthIndex, { [field]: cleaned });
      if (monthIndex === selectedMonthIndex) {
        if (field === 'companyName') setCompanyName(cleaned);
        if (field === 'wellIdentity') setWellIdentity(cleaned);
      }
      setEditingCell(null);
      return;
    }

    const num = parseFloat(inlineEditVal.replace(',', '.').trim());
    if (Number.isNaN(num) || num < 0) {
      setEditingCell(null);
      return;
    }

    const targetRow = rows.find((r) => r.monthIndex === monthIndex);
    const nextVol =
      field === 'extractionVolumeM3'
        ? Number(num.toFixed(1))
        : targetRow?.extractionVolumeM3 ?? 0;
    const nextGw =
      field === 'groundwaterLevelMbmt'
        ? Number(num.toFixed(2))
        : targetRow?.groundwaterLevelMbmt ?? 0;

    // If using default generated SVG photo, keep the volume reading on the dial in sync
    const isCustomUploadedImage =
      targetRow?.meterPhotoDataUrl &&
      !targetRow.meterPhotoDataUrl.startsWith('data:image/svg+xml');

    updateMonthRow(monthIndex, {
      extractionVolumeM3: nextVol,
      groundwaterLevelMbmt: nextGw,
      ...(isCustomUploadedImage
        ? {}
        : {
            meterPhotoDataUrl: buildDefaultMeterPhotoDataUrl(
              targetRow?.monthLabel || 'Januari',
              selectedYear,
              nextVol,
              monthIndex
            ),
          }),
    });

    if (monthIndex === selectedMonthIndex) {
      if (field === 'extractionVolumeM3') setExtractionInput(String(nextVol));
      if (field === 'groundwaterLevelMbmt') setGroundwaterInput(String(nextGw));
    }

    pushToast({
      type: 'success',
      title: 'Data Rekapan Diperbarui',
      message: `Nilai ${
        field === 'extractionVolumeM3' ? 'Pengambilan Air (m³)' : 'Muka Air Tanah (m.bmt)'
      } bulan ${targetRow?.monthLabel ?? ''} berhasil diperbarui.`,
    });
    setEditingCell(null);
  };

  const toggleCommunityGrantRow = (monthIndex: number) => {
    const targetRow = rows.find((r) => r.monthIndex === monthIndex);
    if (!targetRow) return;
    const nextVal: 'Tidak' | 'Ya' = targetRow.communityWaterGrant === 'Tidak' ? 'Ya' : 'Tidak';
    updateMonthRow(monthIndex, { communityWaterGrant: nextVal });
    if (monthIndex === selectedMonthIndex) {
      setCommunityGrant(nextVal);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for direct photo upload in Rekapan Table */}
      <input
        ref={rowFileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleRowFileChange}
        className="sr-only"
        aria-label="Unggah Foto Meter Air Tabel"
      />

      {/* 1. FORM INPUT LAPORAN BERKALA PENGAMBILAN AIR */}
      <section
        aria-label="Form Input Laporan Berkala Pengambilan Air Tanah"
        className="rounded-[24px] bg-white dark:bg-[#001835]/95 border border-slate-200/90 dark:border-[#D2B48C]/25 shadow-[0_12px_34px_rgba(0,33,71,0.07)] p-5 sm:p-7"
      >
        <div className="space-y-5">
          {/* Nama Perusahaan */}
          <div className="space-y-2">
            <label
              htmlFor="sipa-company-name"
              className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
            >
              Nama Perusahaan
            </label>
            <div className="relative flex items-center">
              <input
                id="sipa-company-name"
                type="text"
                value={companyName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCompanyName(val);
                  updateMonthRow(selectedMonthIndex, {
                    companyName: val.trim() || DEFAULT_SIPA_COMPANY_NAME,
                  });
                }}
                placeholder="UOBK RSUD Al-Mulk"
                className="w-full rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-14 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-100 focus:border-[#3FA9F5] focus:outline-none"
              />
              <div className="absolute right-3 flex items-center gap-1.5 text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setCompanyName(DEFAULT_SIPA_COMPANY_NAME);
                    updateMonthRow(selectedMonthIndex, {
                      companyName: DEFAULT_SIPA_COMPANY_NAME,
                    });
                  }}
                  aria-label="Reset Nama Perusahaan"
                  title="Reset ke UOBK RSUD Al-Mulk"
                  className="hover:text-slate-800 dark:hover:text-white text-xs font-bold leading-none cursor-pointer"
                >
                  ×
                </button>
                <span className="text-[10px] select-none pointer-events-none">▾</span>
              </div>
            </div>
          </div>

          {/* Sumur (Interactive Dropdown with Top-Right Add Icon & Edit/Delete Icons when Selected) */}
          <div ref={wellDropdownContainerRef} className="space-y-2 max-w-4xl">
            <div className="flex items-center justify-between">
              <label
                id="sipa-well-identity-label"
                className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
              >
                Sumur
              </label>
              <button
                type="button"
                onClick={handleStartAddWell}
                aria-label="Tambah No. Sumur"
                title="Tambah No. Sumur Baru"
                className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#002147] dark:text-[#D2B48C] hover:bg-[#002147] hover:text-white dark:hover:bg-[#D2B48C] dark:hover:text-[#002147] transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Input when Adding New Well */}
            {isAddingWell && (
              <div className="flex items-center gap-2 p-2 rounded-[4px] border border-[#3FA9F5] bg-slate-50 dark:bg-slate-900/90">
                <input
                  type="text"
                  value={newWellInput}
                  onChange={(e) => setNewWellInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmAddWell();
                    }
                    if (e.key === 'Escape') {
                      setIsAddingWell(false);
                      setNewWellInput('');
                    }
                  }}
                  placeholder="Contoh: No sumur : SB - 3 - No Izin : 29/291300/DPMPTSP/2022"
                  aria-label="Input Tambah No. Sumur Baru"
                  className="flex-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 focus:border-[#3FA9F5] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleConfirmAddWell}
                  aria-label="Simpan No. Sumur Baru"
                  title="Simpan No. Sumur Baru"
                  className="p-1.5 rounded bg-[#002147] text-[#D2B48C] hover:bg-[#001630] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingWell(false);
                    setNewWellInput('');
                  }}
                  aria-label="Batal Tambah No. Sumur"
                  title="Batal"
                  className="p-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Inline Input when Editing Selected Well Directly */}
            {editingWellTarget === wellIdentity && !isWellDropdownOpen ? (
              <div className="flex items-center gap-2 p-2 rounded-[4px] border border-[#3FA9F5] bg-slate-50 dark:bg-slate-900/90">
                <input
                  type="text"
                  value={editingWellInput}
                  onChange={(e) => setEditingWellInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmEditWell();
                    }
                    if (e.key === 'Escape') {
                      setEditingWellTarget(null);
                    }
                  }}
                  aria-label="Edit No. Sumur"
                  className="flex-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 focus:border-[#3FA9F5] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleConfirmEditWell()}
                  aria-label="Simpan Perubahan No. Sumur"
                  title="Simpan Perubahan"
                  className="p-1.5 rounded bg-[#002147] text-[#D2B48C] hover:bg-[#001630] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWellTarget(null)}
                  aria-label="Batal Edit No. Sumur"
                  title="Batal"
                  className="p-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div
                  role="combobox"
                  aria-expanded={isWellDropdownOpen}
                  aria-labelledby="sipa-well-identity-label"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredWellTarget('__COMBOBOX__')}
                  onMouseLeave={() =>
                    setHoveredWellTarget((prev) => (prev === '__COMBOBOX__' ? null : prev))
                  }
                  onClick={() => {
                    setIsWellDropdownOpen((prev) => !prev);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsWellDropdownOpen((prev) => !prev);
                    }
                  }}
                  className="w-full rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-24 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-100 focus:border-[#3FA9F5] focus:outline-none cursor-pointer flex items-center justify-between select-none"
                >
                  <span className="truncate">{wellIdentity}</span>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {hoveredWellTarget === '__COMBOBOX__' && !isWellDropdownOpen && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsWellDropdownOpen(false);
                            handleStartEditWell(wellIdentity);
                          }}
                          aria-label="Edit No. Sumur Terpilih"
                          title="Edit No. Sumur"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#002147] dark:hover:text-[#D2B48C] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteWell(wellIdentity, e)}
                          aria-label="Hapus No. Sumur Terpilih"
                          title="Hapus No. Sumur"
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${
                        isWellDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Dropdown Options List with Hover-Only Edit & Hapus Icons */}
                {isWellDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Daftar Pilihan Sumur"
                    onMouseLeave={() => setHoveredWellTarget(null)}
                    className="absolute z-30 mt-1 w-full rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    {wellOptions.map((opt) => {
                      const isSelected = opt === wellIdentity;
                      const isEditingThisOption = editingWellTarget === opt;
                      const isHoveredOption = hoveredWellTarget === opt;

                      return (
                        <div
                          key={opt}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setHoveredWellTarget(opt)}
                          onMouseLeave={() =>
                            setHoveredWellTarget((prev) => (prev === opt ? null : prev))
                          }
                          className={`group/wellopt px-3.5 py-2.5 text-xs sm:text-[13.5px] flex items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? 'bg-[#FAF6F0] dark:bg-slate-800/90 font-semibold text-[#002147] dark:text-[#D2B48C]'
                              : 'text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {isEditingThisOption ? (
                            <div
                              className="flex items-center gap-1.5 w-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingWellInput}
                                onChange={(e) => setEditingWellInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleConfirmEditWell();
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingWellTarget(null);
                                  }
                                }}
                                aria-label={`Edit ${opt}`}
                                className="flex-1 rounded border border-[#3FA9F5] bg-white dark:bg-slate-950 px-2.5 py-1 text-xs sm:text-[13px] text-slate-900 dark:text-white focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={(e) => handleConfirmEditWell(e)}
                                aria-label="Simpan Edit No. Sumur"
                                title="Simpan"
                                className="p-1 rounded bg-[#002147] text-[#D2B48C] hover:bg-[#001630] cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingWellTarget(null);
                                }}
                                aria-label="Batal Edit"
                                title="Batal"
                                className="p-1 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setWellIdentity(opt);
                                  setIsWellDropdownOpen(false);
                                  setHoveredWellTarget(null);
                                  updateMonthRow(selectedMonthIndex, { wellIdentity: opt });
                                }}
                                className="flex-1 text-left truncate cursor-pointer py-0.5"
                              >
                                {opt}
                              </button>
                              {isHoveredOption && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartEditWell(opt, e)}
                                    aria-label={`Edit ${opt}`}
                                    title="Edit No. Sumur"
                                    className="p-1 rounded hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#002147] dark:hover:text-[#D2B48C] transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteWell(opt, e)}
                                    aria-label={`Hapus ${opt}`}
                                    title="Hapus No. Sumur"
                                    className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Periode (Direct Dropdown) */}
          <div className="space-y-2">
            <label
              htmlFor="sipa-periode-input"
              className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
            >
              Periode
            </label>
            <div className="relative">
              <select
                id="sipa-periode-input"
                value={selectedMonthIndex}
                onChange={(e) => handleSelectPeriodeMonth(Number(e.target.value))}
                className="w-full appearance-none rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-10 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-100 focus:border-[#3FA9F5] focus:outline-none cursor-pointer"
              >
                {rows.map((r) => (
                  <option key={r.monthIndex} value={r.monthIndex}>
                    {r.monthLabel} {selectedYear}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Subheader: Laporan Berkala */}
          <div className="pt-3">
            <h3 className="text-sm sm:text-base font-normal text-slate-700 dark:text-slate-200 border-b border-slate-600 dark:border-slate-500 pb-2">
              Laporan Berkala
            </h3>
          </div>

          {/* Laporan Pengambilan Air (m³) */}
          <div className="space-y-2">
            <label
              htmlFor="sipa-extraction-m3"
              className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
            >
              Laporan Pengambilan Air (m³)
            </label>
            <input
              id="sipa-extraction-m3"
              type="text"
              inputMode="decimal"
              value={extractionInput}
              onChange={(e) => {
                const raw = e.target.value;
                setExtractionInput(raw);
                const parsed = parseFloat(raw.replace(',', '.').trim());
                if (!Number.isNaN(parsed) && parsed >= 0) {
                  const targetRow = rows.find((r) => r.monthIndex === selectedMonthIndex);
                  const isCustomUploadedImage =
                    targetRow?.meterPhotoDataUrl &&
                    !targetRow.meterPhotoDataUrl.startsWith('data:image/svg+xml');
                  updateMonthRow(selectedMonthIndex, {
                    extractionVolumeM3: Number(parsed.toFixed(1)),
                    ...(isCustomUploadedImage
                      ? {}
                      : {
                          meterPhotoDataUrl: buildDefaultMeterPhotoDataUrl(
                            targetRow?.monthLabel || 'Januari',
                            selectedYear,
                            Number(parsed.toFixed(1)),
                            selectedMonthIndex
                          ),
                        }),
                  });
                }
              }}
              placeholder="m³"
              className="w-full rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#3FA9F5] focus:outline-none"
            />
          </div>

          {/* Apakah Ada Debit Pemberian Air untuk Masyarakat? */}
          <div className="space-y-2">
            <label
              htmlFor="sipa-community-grant"
              className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
            >
              Apakah Ada Debit Pemberian Air untuk Masyarakat?
            </label>
            <div className="relative">
              <select
                id="sipa-community-grant"
                value={communityGrant}
                onChange={(e) => {
                  const val = e.target.value as 'Tidak' | 'Ya';
                  setCommunityGrant(val);
                  updateMonthRow(selectedMonthIndex, { communityWaterGrant: val });
                }}
                className="w-full appearance-none rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-10 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-100 focus:border-[#3FA9F5] focus:outline-none cursor-pointer"
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Muka Air Tanah (m.bmt) */}
          <div className="space-y-2">
            <label
              htmlFor="sipa-groundwater-mbmt"
              className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
            >
              Muka Air Tanah (m.bmt)
            </label>
            <input
              id="sipa-groundwater-mbmt"
              type="text"
              inputMode="decimal"
              value={groundwaterInput}
              onChange={(e) => {
                const raw = e.target.value;
                setGroundwaterInput(raw);
                const parsed = parseFloat(raw.replace(',', '.').trim());
                if (!Number.isNaN(parsed) && parsed >= 0) {
                  updateMonthRow(selectedMonthIndex, {
                    groundwaterLevelMbmt: Number(parsed.toFixed(2)),
                  });
                }
              }}
              placeholder="m.bmt"
              className="w-full rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#3FA9F5] focus:outline-none"
            />
          </div>

          {/* Foto Meter Air */}
          <div className="space-y-2 max-w-3xl">
            <label
              htmlFor="sipa-meter-photo"
              className="block text-xs sm:text-[13.5px] font-normal text-slate-700 dark:text-slate-200"
            >
              Foto Meter Air
            </label>
            <div className="w-full rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 flex items-center gap-2.5">
              <input
                ref={fileInputRef}
                id="sipa-meter-photo"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="sipa-meter-photo"
                className="px-2.5 py-1 rounded-[2px] border border-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-500 text-xs text-slate-900 dark:text-slate-100 font-normal cursor-pointer shrink-0 select-none"
              >
                Upload Foto
              </label>
              <span className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 truncate">
                {photoFileName ? `${photoFileName}` : 'No file chosen'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RINGKASAN EKSEKUTIF / KPI REKAPAN PENGAMBILAN AIR TANAH */}
      <section
        aria-label="Ringkasan Rekapan Pengambilan Air Tanah"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-2xl bg-white/95 dark:bg-[#001835]/90 border border-[#D2B48C]/50 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Pengambilan Air
            </span>
            <Droplets className="w-4 h-4 text-[#002147] dark:text-[#D2B48C]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#002147] dark:text-white tabular-nums">
              {summary.totalVolumeM3.toLocaleString('id-ID')} m³
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tahun {selectedYear}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/95 dark:bg-[#001835]/90 border border-[#D2B48C]/50 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rata-rata Pengambilan
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#002147] dark:text-white tabular-nums">
              {summary.avgVolumeM3.toLocaleString('id-ID')} m³
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              per Bulan
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/95 dark:bg-[#001835]/90 border border-[#D2B48C]/50 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rata-rata Muka Air Tanah
            </span>
            <Gauge className="w-4 h-4 text-[#1D7AFC]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#002147] dark:text-white tabular-nums">
              {summary.avgGroundwaterLevelMbmt} m.bmt
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {summary.minGroundwaterLevelMbmt}–{summary.maxGroundwaterLevelMbmt} m.bmt
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/95 dark:bg-[#001835]/90 border border-[#D2B48C]/50 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kelengkapan Laporan SIPA
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#002147] dark:text-white tabular-nums">
              {summary.complianceRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {summary.terlaporCount}/12 Bulan Terlapor
            </span>
          </div>
        </div>
      </section>

      {/* 3. TABEL REKAPAN LAPORAN BERKALA PENGAMBILAN AIR TANAH (12 BULAN) */}
      <section
        aria-label="Tabel Rekapan Laporan Berkala Pengambilan Air Tanah"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/20 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden"
      >
        <div className="bg-[#002147] dark:bg-[#00152E] border-b border-[#D2B48C]/50 px-4 py-4 flex flex-col items-center justify-center text-center">
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#D2B48C] uppercase">
            REKAPAN LAPORAN BERKALA PENGAMBILAN AIR TANAH (SIPA)
          </h2>
          <p className="text-xs font-bold tracking-wider text-slate-200 mt-0.5 uppercase">
            UOBK RSUD AL-MULK KOTA SUKABUMI
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-bold">
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-12 align-middle">
                  No
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-28 align-middle">
                  Periode Bulan
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-44 align-middle">
                  Nama Perusahaan
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center min-w-[230px] align-middle">
                  Identitas Sumur &amp; No. Izin
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-36 align-middle">
                  Laporan Pengambilan Air (m³)
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-36 align-middle">
                  Debit Pemberian Air Masyarakat
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-36 align-middle">
                  Muka Air Tanah (m.bmt)
                </th>
                <th className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center w-36 align-middle">
                  Foto Meter Air
                </th>
              </tr>
            </thead>
            <tbody className="text-[#002147] dark:text-slate-100">
              {rows.map((row) => {
                const isEditingCompany =
                  editingCell?.monthIndex === row.monthIndex &&
                  editingCell?.field === 'companyName';
                const isEditingWell =
                  editingCell?.monthIndex === row.monthIndex &&
                  editingCell?.field === 'wellIdentity';
                const isEditingVol =
                  editingCell?.monthIndex === row.monthIndex &&
                  editingCell?.field === 'extractionVolumeM3';
                const isEditingGw =
                  editingCell?.monthIndex === row.monthIndex &&
                  editingCell?.field === 'groundwaterLevelMbmt';

                const photoSrc =
                  row.meterPhotoDataUrl ||
                  buildDefaultMeterPhotoDataUrl(
                    row.monthLabel,
                    selectedYear,
                    row.extractionVolumeM3,
                    row.monthIndex
                  );

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAF6F0] dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold tabular-nums bg-white dark:bg-slate-900 align-middle">
                      {row.no}
                    </td>
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-bold bg-[#FAF6F0] dark:bg-slate-900/90 align-middle">
                      {row.monthLabel}
                    </td>

                    {/* Nama Perusahaan (Inline Editable) */}
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-center font-medium bg-white dark:bg-slate-900 align-middle">
                      {isEditingCompany ? (
                        <div className="inline-flex items-center gap-1 w-full">
                          <input
                            type="text"
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitInlineEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 text-center text-xs font-semibold rounded border border-[#002147] bg-white text-[#002147]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={commitInlineEdit}
                            className="p-1 rounded bg-[#002147] text-white shrink-0"
                            aria-label="Simpan Nama Perusahaan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startInlineEdit(row.monthIndex, 'companyName', row.companyName)
                          }
                          className="w-full py-0.5 hover:underline cursor-pointer"
                          title="Klik untuk mengubah Nama Perusahaan"
                        >
                          {row.companyName}
                        </button>
                      )}
                    </td>

                    {/* Identitas Sumur & No. Izin (Inline Editable) */}
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2.5 text-left text-xs font-medium bg-white dark:bg-slate-900 align-middle">
                      {isEditingWell ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            className="w-full px-2 py-1 text-xs font-semibold rounded border border-[#002147] bg-white text-[#002147]"
                          >
                            {wellOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={commitInlineEdit}
                            className="p-1 rounded bg-[#002147] text-white shrink-0"
                            aria-label="Simpan Identitas Sumur"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startInlineEdit(row.monthIndex, 'wellIdentity', row.wellIdentity)
                          }
                          className="w-full text-left py-0.5 hover:underline cursor-pointer"
                          title="Klik untuk mengubah Identitas Sumur & No. Izin"
                        >
                          {row.wellIdentity}
                        </button>
                      )}
                    </td>

                    {/* Laporan Pengambilan Air (m³) */}
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center tabular-nums bg-[#FAF6F0]/70 dark:bg-slate-900/70 align-middle">
                      {isEditingVol ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitInlineEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-20 px-2 py-0.5 text-center text-xs font-bold rounded border border-[#002147] bg-white text-[#002147]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={commitInlineEdit}
                            className="p-1 rounded bg-[#002147] text-white"
                            aria-label="Simpan Pengambilan Air"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startInlineEdit(
                              row.monthIndex,
                              'extractionVolumeM3',
                              row.extractionVolumeM3
                            )
                          }
                          className="w-full py-0.5 font-bold tabular-nums hover:underline cursor-pointer"
                          title="Klik untuk mengubah Laporan Pengambilan Air (m³)"
                        >
                          {row.extractionVolumeM3.toLocaleString('id-ID')} m³
                        </button>
                      )}
                    </td>

                    {/* Debit Pemberian Air untuk Masyarakat */}
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center bg-white dark:bg-slate-900 align-middle">
                      <button
                        type="button"
                        onClick={() => toggleCommunityGrantRow(row.monthIndex)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          row.communityWaterGrant === 'Ya'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                        title="Klik untuk mengubah status Debit Pemberian Air untuk Masyarakat"
                      >
                        {row.communityWaterGrant}
                      </button>
                    </td>

                    {/* Muka Air Tanah (m.bmt) */}
                    <td className="border border-slate-400 dark:border-slate-700 px-3 py-2 text-center tabular-nums bg-[#FAF6F0]/70 dark:bg-slate-900/70 align-middle">
                      {isEditingGw ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={inlineEditVal}
                            onChange={(e) => setInlineEditVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitInlineEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-20 px-2 py-0.5 text-center text-xs font-bold rounded border border-[#002147] bg-white text-[#002147]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={commitInlineEdit}
                            className="p-1 rounded bg-[#002147] text-white"
                            aria-label="Simpan Muka Air Tanah"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startInlineEdit(
                              row.monthIndex,
                              'groundwaterLevelMbmt',
                              row.groundwaterLevelMbmt
                            )
                          }
                          className="w-full py-0.5 font-bold tabular-nums hover:underline cursor-pointer"
                          title="Klik untuk mengubah Muka Air Tanah (m.bmt)"
                        >
                          {row.groundwaterLevelMbmt} m.bmt
                        </button>
                      )}
                    </td>

                    {/* Foto Meter Air — Proportional Square Box Displaying Photo Directly */}
                    <td className="border border-slate-400 dark:border-slate-700 p-2 text-center bg-white dark:bg-slate-900 align-middle">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 relative group shadow-xs">
                        <img
                          src={photoSrc}
                          alt={`Foto Meter Air Bulan ${row.monthLabel}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoRow(row)}
                            className="p-1.5 rounded-lg bg-white/90 text-[#002147] hover:bg-white shadow-xs cursor-pointer"
                            title={`Lihat Foto Meter Air ${row.monthLabel}`}
                            aria-label={`Lihat Foto Meter Air ${row.monthLabel}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadTargetMonthIndex(row.monthIndex);
                              rowFileInputRef.current?.click();
                            }}
                            className="p-1.5 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#001630] shadow-xs cursor-pointer"
                            title={`Ganti Foto Meter Air ${row.monthLabel}`}
                            aria-label={`Ganti Foto Meter Air ${row.monthLabel}`}
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-extrabold">
                <td
                  colSpan={4}
                  className="border border-slate-400 dark:border-slate-700 px-4 py-3 text-right uppercase tracking-wide"
                >
                  Total &amp; Rata-rata Tahunan ({selectedYear})
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center tabular-nums">
                  {summary.totalVolumeM3.toLocaleString('id-ID')} m³
                  <span className="block text-[10px] font-semibold opacity-80">
                    (Rata-rata: {summary.avgVolumeM3} m³/bln)
                  </span>
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center">
                  {summary.communityGrantNoCount} Tidak · {summary.communityGrantYesCount} Ya
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center tabular-nums">
                  Rata-rata: {summary.avgGroundwaterLevelMbmt} m.bmt
                </td>
                <td className="border border-slate-400 dark:border-slate-700 px-3 py-3 text-center">
                  {summary.documentedPhotoCount}/12 Foto Terlampir ({summary.complianceRate}%)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Modal Preview Foto Meter Air */}
      {previewPhotoRow && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau Foto Meter Air Bulan ${previewPhotoRow.monthLabel}`}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoRow(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#D2B48C]/50 max-w-md w-full p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="text-sm font-extrabold text-[#002147] dark:text-[#D2B48C]">
                  Foto Meter Air — {previewPhotoRow.monthLabel} {selectedYear}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pengambilan: {previewPhotoRow.extractionVolumeM3.toLocaleString('id-ID')} m³ · MAT:{' '}
                  {previewPhotoRow.groundwaterLevelMbmt} m.bmt
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoRow(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Tutup Pratinjau Foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900">
              <img
                src={
                  previewPhotoRow.meterPhotoDataUrl ||
                  buildDefaultMeterPhotoDataUrl(
                    previewPhotoRow.monthLabel,
                    selectedYear,
                    previewPhotoRow.extractionVolumeM3,
                    previewPhotoRow.monthIndex
                  )
                }
                alt={`Foto Meter Air Bulan ${previewPhotoRow.monthLabel}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 truncate max-w-[200px]">
                {previewPhotoRow.meterPhotoFileName}
              </span>
              <button
                type="button"
                onClick={() => {
                  const targetIdx = previewPhotoRow.monthIndex;
                  setPreviewPhotoRow(null);
                  setUploadTargetMonthIndex(targetIdx);
                  rowFileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002147] text-[#D2B48C] text-xs font-bold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. GRAFIK VISUALISASI REKAPAN PENGAMBILAN AIR TANAH & MUKA AIR TANAH */}
      <section
        aria-label="Grafik Laporan Berkala Pengambilan Air Tanah"
        className="grid grid-cols-1 xl:grid-cols-3 gap-5"
      >
        <div className="xl:col-span-2 rounded-[28px] bg-white/95 dark:bg-slate-900/95 border border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1D7AFC] dark:text-blue-400">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Visualisasi Grafik Laporan Berkala SIPA</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Tren Pengambilan Air Tanah (m³) &amp; Kedalaman Muka Air Tanah (m.bmt)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sumur Bor SB-1 (No. Izin: 29/291300/DPMPTSP/2022) · Tahun {selectedYear}
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start">
              <button
                type="button"
                onClick={() => setChartMode('composed')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  chartMode === 'composed'
                    ? 'bg-[#002147] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Grafik Kombinasi
              </button>
              <button
                type="button"
                onClick={() => setChartMode('line')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  chartMode === 'line'
                    ? 'bg-[#002147] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Grafik Garis
              </button>
            </div>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#CBD5E1'}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                    fill: isDark ? '#E2E8F0' : '#334155',
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: isDark ? '#E2E8F0' : '#334155' }}
                  label={{
                    value: 'Volume (m³)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, (dataMax: number) => Math.max(20, Math.ceil(dataMax + 4))]}
                  tick={{ fontSize: 11, fill: isDark ? '#E2E8F0' : '#334155' }}
                  label={{
                    value: 'MAT (m.bmt)',
                    angle: 90,
                    position: 'insideRight',
                    style: { fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: '14px',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {chartMode === 'composed' ? (
                  <Bar
                    yAxisId="left"
                    dataKey="pengambilanM3"
                    name="Laporan Pengambilan Air (m³)"
                    fill={isDark ? '#38BDF8' : '#002147'}
                    radius={[6, 6, 0, 0]}
                    barSize={22}
                    isAnimationActive={false}
                  />
                ) : (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pengambilanM3"
                    name="Laporan Pengambilan Air (m³)"
                    stroke={isDark ? '#38BDF8' : '#002147'}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                )}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mukaAirTanahMbmt"
                  name="Muka Air Tanah (m.bmt)"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribusi Semester & Parameter Sumur Card */}
        <div className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 border border-[#D2B48C]/50 dark:border-white/15 shadow-[0_14px_38px_rgba(21,62,117,0.08)] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Rekapitulasi Per Semester</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Distribusi Pengambilan Air &amp; Konservasi Akuifer
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-slate-800/80 border border-[#D2B48C]/40 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold text-[#002147] dark:text-white">
                  <span>Semester I (Januari – Juni)</span>
                  <span className="tabular-nums">
                    {summary.semester1TotalM3.toLocaleString('id-ID')} m³
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Rata-rata: {(summary.semester1TotalM3 / 6).toFixed(1)} m³/bulan
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-slate-800/80 border border-[#D2B48C]/40 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold text-[#002147] dark:text-white">
                  <span>Semester II (Juli – Desember)</span>
                  <span className="tabular-nums">
                    {summary.semester2TotalM3.toLocaleString('id-ID')} m³
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Rata-rata: {(summary.semester2TotalM3 / 6).toFixed(1)} m³/bulan
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pemakaian Tertinggi:</span>
                  <strong className="text-[#002147] dark:text-white">
                    {summary.maxVolumeRow.monthLabel} ({summary.maxVolumeRow.extractionVolumeM3} m³)
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pemakaian Terendah:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {summary.minVolumeRow.monthLabel} ({summary.minVolumeRow.extractionVolumeM3} m³)
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Debit untuk Masyarakat:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {summary.communityGrantYesCount > 0
                      ? `Ya (${summary.communityGrantYesCount} Bulan)`
                      : 'Tidak'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Izin SIPA: 29/291300/DPMPTSP/2022</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Status: Aktif</span>
          </div>
        </div>
      </section>

      {/* 5. ANALISA DATA, REKOMENDASI & RENCANA TINDAK LANJUT (LAPORAN BERKALA SIPA) */}
      <section
        aria-label="Analisa Data, Rekomendasi dan Rencana Tindak Lanjut Laporan Berkala Pengambilan Air"
        className="rounded-[28px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-[1.5px] border-white/90 dark:border-white/15 p-6 sm:p-8 shadow-[0_14px_38px_rgba(21,62,117,0.08)] space-y-6"
      >
        {/* Analisa */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed text-justify indent-6 sm:indent-8 font-normal">
            {summary.analysisText}
          </p>
        </div>

        {/* Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rekomendasi :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            {summary.recommendations.map((rec, idx) => (
              <li key={idx} className="grid grid-cols-[1.5rem_1fr] items-baseline">
                <span className="font-semibold tabular-nums select-none">{idx + 1}.</span>
                <span className="text-justify">{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Rencana Tindak Lanjut */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white underline underline-offset-4 decoration-2 decoration-slate-900 dark:decoration-white">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            {summary.followUpPlans.map((plan, idx) => (
              <li key={idx} className="grid grid-cols-[1.5rem_1fr] items-baseline">
                <span className="font-semibold tabular-nums select-none">{idx + 1}.</span>
                <span className="text-justify">{plan}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
