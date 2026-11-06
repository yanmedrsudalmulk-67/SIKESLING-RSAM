'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Plus,
  Trash2,
  Pencil,
  BarChart3,
  Building2,
  FileSpreadsheet,
  Scale,
  QrCode,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  RefreshCw,
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
import {
  DEFAULT_MEDICAL_WASTE_SOURCES,
  DEFAULT_COLUMN_LABELS,
  MedicalWasteColumnLabels,
  MedicalWasteCustomColumn,
  MedicalWasteLogRow,
  getRealtimeTodayIso,
  formatIsoToDisplayDate,
  formatWeightKgId,
  parseWeightInput,
  groupLogbookRowsByBatch,
  summarizeBySourceRoom,
  generateMedicalWasteLogbookAnalysis,
  createRealtimeInitialMedicalWasteLogbook,
} from '@/lib/medical-waste-logbook';

export const LOGBOOK_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

type EditableFieldKey =
  | 'sumberLimbah'
  | 'beratTajamKg'
  | 'beratPadatKg'
  | 'tanggalMasuk'
  | 'maksPenyimpananSuhu'
  | 'tanggalKeluar'
  | 'noManifest'
  | `custom:${string}`;

interface PendingDeleteAction {
  type: 'row' | 'batch' | 'column';
  id: string;
  label: string;
}

export function MedicalWasteLogbookView() {
  const meta = resolveRouteMeta('/monitoring/logbook-limbah-medis');
  const {
    resolvedTheme,
    masterRooms,
    pushToast,
    medicalWasteLogbookRows,
    saveMedicalWasteLogbookRows,
    isSyncingSupabase,
  } = useApp();
  const isDark = resolvedTheme === 'dark';
  const filterDateInputRef = useRef<HTMLInputElement>(null);

  // Core logbook rows state synced with AppProvider & Supabase
  // If cloud state has old placeholder (< 200 rows), initialize with full 2026 Excel data
  const [rows, setRows] = useState<MedicalWasteLogRow[]>(() => {
    if (medicalWasteLogbookRows && medicalWasteLogbookRows.length >= 200) {
      return medicalWasteLogbookRows;
    }
    return createRealtimeInitialMedicalWasteLogbook();
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [jellyTick, setJellyTick] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncingExcel, setIsSyncingExcel] = useState<boolean>(false);

  // Sync local rows when cloud state hydrates from Supabase (unless user has unsaved local edits)
  useEffect(() => {
    if (!hasUnsavedChanges) {
      if (medicalWasteLogbookRows.length >= 200) {
        setRows(medicalWasteLogbookRows);
      } else {
        const real = createRealtimeInitialMedicalWasteLogbook();
        setRows(real);
        void saveMedicalWasteLogbookRows(real);
      }
    }
  }, [medicalWasteLogbookRows, hasUnsavedChanges, saveMedicalWasteLogbookRows]);

  // Editable column headers & custom extra columns
  const [columnLabels, setColumnLabels] = useState<MedicalWasteColumnLabels>(
    DEFAULT_COLUMN_LABELS
  );
  const [customColumns, setCustomColumns] = useState<MedicalWasteCustomColumn[]>(
    []
  );

  // Inline cell editing state
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    field: EditableFieldKey;
  } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Inline header editing state
  const [editingHeaderKey, setEditingHeaderKey] = useState<string | null>(null);
  const [editingHeaderValue, setEditingHeaderValue] = useState<string>('');

  // Modal state for "+ Batch Tanggal (11 Ruangan)" -> choose date first
  const [showBatchDateModal, setShowBatchDateModal] = useState<boolean>(false);
  const [newBatchDateMasuk, setNewBatchDateMasuk] = useState<string>(() =>
    getRealtimeTodayIso()
  );
  const [newBatchDateKeluar, setNewBatchDateKeluar] = useState<string>(() =>
    getRealtimeTodayIso()
  );

  // Confirmation modal state for Delete ("Ya / Tidak")
  const [pendingDelete, setPendingDelete] =
    useState<PendingDeleteAction | null>(null);

  // Filter Periode: Dropdown Pilih Bulan dan Pilih Tahun (Sejajar Judul)
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Filter / search state
  const [searchRoomOrManifest, setSearchRoomOrManifest] = useState<string>('');
  const [filterDateMasuk, setFilterDateMasuk] = useState<string>('');

  const updateRowsDirty = (
    updater:
      | MedicalWasteLogRow[]
      | ((prev: MedicalWasteLogRow[]) => MedicalWasteLogRow[])
  ) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Room suggestions combining the 11 reference rooms + masterRooms
  const roomOptions = useMemo(() => {
    const set = new Set<string>(DEFAULT_MEDICAL_WASTE_SOURCES);
    for (const r of masterRooms) {
      if (r.name) set.add(r.name);
    }
    for (const r of rows) {
      if (r.sumberLimbah) set.add(r.sumberLimbah);
    }
    return Array.from(set);
  }, [masterRooms, rows]);

  // Filtered rows respecting Year, Month, Specific Date, and Search
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // 1. Filter by Year
      if (r.tanggalMasuk) {
        const rowYear = parseInt(r.tanggalMasuk.slice(0, 4), 10);
        if (!isNaN(rowYear) && rowYear !== selectedYear) {
          return false;
        }
      }

      // 2. Filter by Month
      if (selectedMonth !== 'ALL' && r.tanggalMasuk) {
        const rowMonth = parseInt(r.tanggalMasuk.slice(5, 7), 10);
        if (!isNaN(rowMonth) && rowMonth !== selectedMonth) {
          return false;
        }
      }

      // 3. Filter by Specific Date Masuk if selected
      if (filterDateMasuk && r.tanggalMasuk !== filterDateMasuk) {
        return false;
      }

      // 4. Search query
      if (searchRoomOrManifest.trim()) {
        const q = searchRoomOrManifest.toLowerCase();
        const matchRoom = r.sumberLimbah.toLowerCase().includes(q);
        const matchManifest = r.noManifest.toLowerCase().includes(q);
        const matchDate = formatIsoToDisplayDate(r.tanggalMasuk)
          .toLowerCase()
          .includes(q);
        if (!matchRoom && !matchManifest && !matchDate) return false;
      }
      return true;
    });
  }, [rows, selectedYear, selectedMonth, filterDateMasuk, searchRoomOrManifest]);

  const batchGroups = useMemo(
    () => groupLogbookRowsByBatch(filteredRows),
    [filteredRows]
  );

  // Overall metrics
  const overallMetrics = useMemo(() => {
    let totalTajam = 0;
    let totalPadat = 0;
    const manifests = new Set<string>();
    const rooms = new Set<string>();

    for (const r of filteredRows) {
      totalTajam += r.beratTajamKg || 0;
      totalPadat += r.beratPadatKg || 0;
      if (r.noManifest.trim()) manifests.add(r.noManifest.trim());
      if (r.sumberLimbah.trim()) rooms.add(r.sumberLimbah.trim());
    }

    const tajam = Number(totalTajam.toFixed(2));
    const padat = Number(totalPadat.toFixed(2));
    return {
      totalTajam: tajam,
      totalPadat: padat,
      grandTotal: Number((tajam + padat).toFixed(2)),
      manifestCount: manifests.size,
      roomCount: rooms.size,
    };
  }, [filteredRows]);

  // Room summary for chart visualization
  const roomChartData = useMemo(() => {
    return summarizeBySourceRoom(filteredRows);
  }, [filteredRows]);

  // Automatic Analisa, Rekomendasi & Rencana Tindak Lanjut based on displayed data
  const autoAnalysis = useMemo(() => {
    return generateMedicalWasteLogbookAnalysis(filteredRows);
  }, [filteredRows]);

  // Start editing a cell
  const startEditCell = (row: MedicalWasteLogRow, field: EditableFieldKey) => {
    let initialVal = '';
    if (field === 'sumberLimbah') {
      initialVal = row.sumberLimbah;
    } else if (field === 'beratTajamKg') {
      initialVal =
        row.beratTajamKg !== null && row.beratTajamKg !== undefined
          ? String(row.beratTajamKg)
          : '';
    } else if (field === 'beratPadatKg') {
      initialVal =
        row.beratPadatKg !== null && row.beratPadatKg !== undefined
          ? String(row.beratPadatKg)
          : '';
    } else if (field === 'tanggalMasuk') {
      initialVal = row.tanggalMasuk;
    } else if (field === 'maksPenyimpananSuhu') {
      initialVal = row.maksPenyimpananSuhu;
    } else if (field === 'tanggalKeluar') {
      initialVal = row.tanggalKeluar;
    } else if (field === 'noManifest') {
      initialVal = row.noManifest;
    } else if (field.startsWith('custom:')) {
      const colId = field.replace('custom:', '');
      initialVal = row.customValues?.[colId] || '';
    }

    setEditingCell({ rowId: row.id, field });
    setEditingValue(initialVal);
  };

  // Commit cell edit
  const commitEditCell = (applyToWholeBatch = false) => {
    if (!editingCell) return;
    const { rowId, field } = editingCell;
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) {
      setEditingCell(null);
      return;
    }

    updateRowsDirty((prev) =>
      prev.map((row) => {
        const isTarget =
          row.id === rowId ||
          (applyToWholeBatch && row.batchId === targetRow.batchId);
        if (!isTarget) return row;

        if (field === 'sumberLimbah') {
          return {
            ...row,
            sumberLimbah: editingValue.trim() || row.sumberLimbah,
          };
        }
        if (field === 'beratTajamKg') {
          return {
            ...row,
            beratTajamKg: parseWeightInput(editingValue),
          };
        }
        if (field === 'beratPadatKg') {
          return {
            ...row,
            beratPadatKg: parseWeightInput(editingValue),
          };
        }
        if (field === 'tanggalMasuk') {
          return {
            ...row,
            tanggalMasuk: editingValue || row.tanggalMasuk,
          };
        }
        if (field === 'maksPenyimpananSuhu') {
          return {
            ...row,
            maksPenyimpananSuhu: editingValue.trim() || '✓',
          };
        }
        if (field === 'tanggalKeluar') {
          return {
            ...row,
            tanggalKeluar: editingValue || row.tanggalKeluar,
          };
        }
        if (field === 'noManifest') {
          return {
            ...row,
            noManifest: editingValue.trim(),
          };
        }
        if (field.startsWith('custom:')) {
          const colId = field.replace('custom:', '');
          return {
            ...row,
            customValues: {
              ...(row.customValues || {}),
              [colId]: editingValue,
            },
          };
        }
        return row;
      })
    );

    setEditingCell(null);
  };

  // Start editing a column header
  const startEditHeader = (key: string, currentLabel: string) => {
    setEditingHeaderKey(key);
    setEditingHeaderValue(currentLabel);
  };

  const commitEditHeader = () => {
    if (!editingHeaderKey) return;
    const trimmed = editingHeaderValue.trim();
    if (trimmed) {
      if (editingHeaderKey.startsWith('custom:')) {
        const colId = editingHeaderKey.replace('custom:', '');
        setCustomColumns((prev) =>
          prev.map((c) => (c.id === colId ? { ...c, label: trimmed } : c))
        );
      } else {
        setColumnLabels((prev) => ({
          ...prev,
          [editingHeaderKey]: trimmed,
        }));
      }
      setHasUnsavedChanges(true);
    }
    setEditingHeaderKey(null);
  };

  // Add a single row to a specific batch
  const handleAddRowToBatch = (batchId?: string) => {
    const todayIso = getRealtimeTodayIso();
    const targetBatchId =
      batchId ||
      (batchGroups.length > 0
        ? batchGroups[batchGroups.length - 1].batchId
        : `batch-${todayIso}`);
    const existingBatchRows = rows.filter((r) => r.batchId === targetBatchId);
    const refRow = existingBatchRows[existingBatchRows.length - 1];

    const newRow: MedicalWasteLogRow = {
      id: `log-row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      batchId: targetBatchId,
      no: existingBatchRows.length + 1,
      sumberLimbah: 'IGD',
      beratTajamKg: null,
      beratPadatKg: null,
      tanggalMasuk: refRow?.tanggalMasuk || todayIso,
      maksPenyimpananSuhu: '✓',
      tanggalKeluar: refRow?.tanggalKeluar || todayIso,
      noManifest: refRow?.noManifest || '',
      customValues: {},
    };

    updateRowsDirty((prev) => {
      if (!batchId) return [...prev, newRow];
      const lastIndex = prev.map((r) => r.batchId).lastIndexOf(targetBatchId);
      if (lastIndex === -1) return [...prev, newRow];
      const next = [...prev];
      next.splice(lastIndex + 1, 0, newRow);
      return next;
    });
  };

  // Open modal to pick date first before creating an 11-room batch
  const handleOpenBatchDateModal = () => {
    let initialDate = getRealtimeTodayIso();
    if (selectedMonth !== 'ALL') {
      const isCur =
        new Date().getFullYear() === selectedYear &&
        new Date().getMonth() + 1 === selectedMonth;
      const curDay = isCur
        ? String(new Date().getDate()).padStart(2, '0')
        : '01';
      initialDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${curDay}`;
    } else if (selectedYear !== new Date().getFullYear()) {
      initialDate = `${selectedYear}-01-01`;
    }
    setNewBatchDateMasuk(initialDate);
    setNewBatchDateKeluar(initialDate);
    setShowBatchDateModal(true);
  };

  // Confirm adding new 11-room batch for the chosen calendar date
  const handleConfirmAddDateBatch = () => {
    const chosenMasuk = newBatchDateMasuk || getRealtimeTodayIso();
    const chosenKeluar = newBatchDateKeluar || chosenMasuk;
    const batchId = `batch-${chosenMasuk}-${Date.now().toString().slice(-4)}`;

    const newBatchRows: MedicalWasteLogRow[] =
      DEFAULT_MEDICAL_WASTE_SOURCES.map((room, idx) => ({
        id: `log-${batchId}-${idx + 1}`,
        batchId,
        no: idx + 1,
        sumberLimbah: room,
        beratTajamKg: null,
        beratPadatKg: null,
        tanggalMasuk: chosenMasuk,
        maksPenyimpananSuhu: '✓',
        tanggalKeluar: chosenKeluar,
        noManifest: '',
        customValues: {},
      }));

    updateRowsDirty((prev) => [...prev, ...newBatchRows]);
    setShowBatchDateModal(false);
    pushToast({
      type: 'success',
      title: 'Batch Tanggal Baru Ditambahkan',
      message: `11 ruangan untuk tanggal ${formatIsoToDisplayDate(
        chosenMasuk
      )} berhasil dibuat.`,
    });
  };

  // Add a custom column inline directly in the table header
  const handleAddInlineColumn = () => {
    const id = `col-${Date.now()}`;
    const defaultLabel = `Kolom ${customColumns.length + 1}`;
    setCustomColumns((prev) => [...prev, { id, label: defaultLabel }]);
    setEditingHeaderKey(`custom:${id}`);
    setEditingHeaderValue(defaultLabel);
    setHasUnsavedChanges(true);
  };

  // Request confirmation before deleting row, batch, or custom column
  const requestDeleteConfirmation = (action: PendingDeleteAction) => {
    setPendingDelete(action);
  };

  const confirmPendingDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'row') {
      updateRowsDirty((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      pushToast({
        type: 'info',
        title: 'Baris Dihapus',
        message: `Baris "${pendingDelete.label}" telah dihapus. Klik Simpan untuk menyinkronkan ke database.`,
      });
    } else if (pendingDelete.type === 'batch') {
      updateRowsDirty((prev) =>
        prev.filter((r) => r.batchId !== pendingDelete.id)
      );
      pushToast({
        type: 'info',
        title: 'Batch Tanggal Dihapus',
        message: `Kelompok tanggal ${pendingDelete.label} telah dihapus.`,
      });
    } else if (pendingDelete.type === 'column') {
      setCustomColumns((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setHasUnsavedChanges(true);
    }
    setPendingDelete(null);
  };

  // Save to AppProvider & Supabase with Jelly effect
  const handleSaveToSupabase = async () => {
    setJellyTick((t) => t + 1);
    setIsSaving(true);
    try {
      await saveMedicalWasteLogbookRows(rows);
      setHasUnsavedChanges(false);
      pushToast({
        type: 'success',
        title: 'Log Book Limbah Medis Tersimpan',
        message:
          'Data Log Book Limbah Medis telah disimpan dalam aplikasi dan disinkronkan ke database Supabase.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Manual trigger to reload full real data from Excel 2026 (Jan - Okt)
  const handleReloadExcelData = async () => {
    setIsSyncingExcel(true);
    try {
      const real = createRealtimeInitialMedicalWasteLogbook();
      setRows(real);
      setHasUnsavedChanges(false);
      await saveMedicalWasteLogbookRows(real);
      pushToast({
        type: 'success',
        title: 'Sinkronisasi Data Excel Berhasil',
        message: `Seluruh ${real.length} baris data dari Excel (Januari s.d. Oktober 2026) berhasil dimuat dan disinkronkan ke Supabase.`,
      });
    } finally {
      setIsSyncingExcel(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description=""
        status="Functional"
        breadcrumbs={meta.breadcrumbs}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* 1. Dropdown Pilih Bulan */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-logbook-month" className="sr-only">
                Pilih Bulan
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#002147] dark:text-[#D2B48C]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <select
                  id="filter-logbook-month"
                  aria-label="Pilih Bulan"
                  value={selectedMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMonth(val === 'ALL' ? 'ALL' : Number(val));
                  }}
                  className="appearance-none pl-8.5 pr-8 py-2 rounded-full text-xs font-bold bg-[#FAF6F0] dark:bg-[#001835] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/70 dark:border-slate-700 shadow-2xs hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 cursor-pointer transition-all"
                >
                  <option value="ALL">Semua Bulan</option>
                  {LOGBOOK_MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#002147] dark:text-[#D2B48C]">
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </div>
              </div>
            </div>

            {/* 2. Dropdown Pilih Tahun */}
            <div className="relative inline-flex items-center">
              <label htmlFor="filter-logbook-year" className="sr-only">
                Pilih Tahun
              </label>
              <div className="relative">
                <select
                  id="filter-logbook-year"
                  aria-label="Pilih Tahun"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="appearance-none pl-4 pr-8 py-2 rounded-full text-xs font-bold bg-[#FAF6F0] dark:bg-[#001835] text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/70 dark:border-slate-700 shadow-2xs hover:border-[#002147] focus:outline-none focus:ring-2 focus:ring-[#002147]/30 cursor-pointer transition-all"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                  <option value={2024}>Tahun 2024</option>
                  <option value={2027}>Tahun 2027</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#002147] dark:text-[#D2B48C]">
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </div>
              </div>
            </div>

            {/* 3. Tombol + Batch */}
            <button
              type="button"
              onClick={handleOpenBatchDateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#002147] text-white hover:bg-[#003166] text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D2B48C]" />
              <span>Batch</span>
            </button>
          </div>
        }
      />

      {/* Modal Pilih Tanggal Saat Klik "+ Batch Tanggal (11 Ruangan)" */}
      <AnimatePresence>
        {showBatchDateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001228]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              className="w-full max-w-md rounded-[26px] bg-white dark:bg-[#001835] border-[1.5px] border-[#D2B48C]/70 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#D2B48C]/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#002147] dark:text-white">
                      Pilih Tanggal Batch Baru (11 Ruangan)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tentukan tanggal kalender sebelum menambahkan 11 ruangan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatchDateModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#002147] dark:text-[#D2B48C] mb-1">
                    Tanggal Masuk Limbah (Kalender)
                  </label>
                  <input
                    type="date"
                    value={newBatchDateMasuk}
                    onChange={(e) => {
                      setNewBatchDateMasuk(e.target.value);
                      setNewBatchDateKeluar(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#001228] border border-[#D2B48C]/60 text-xs font-bold text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002147] dark:text-[#D2B48C] mb-1">
                    Tanggal Keluar Limbah (Kalender)
                  </label>
                  <input
                    type="date"
                    value={newBatchDateKeluar}
                    onChange={(e) => setNewBatchDateKeluar(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#001228] border border-[#D2B48C]/60 text-xs font-bold text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchDateModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddDateBatch}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#002147] text-[#D2B48C] hover:bg-[#003166] text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Batch (11 Ruangan)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus (Pilihan Ya / Tidak) */}
      <AnimatePresence>
        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001228]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              className="w-full max-w-sm rounded-[26px] bg-white dark:bg-[#001835] border-[1.5px] border-[#D2B48C]/70 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#002147] dark:text-white">
                    Konfirmasi Hapus Data
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Apakah Anda yakin ingin menghapus{' '}
                    <strong>{pendingDelete.label}</strong>?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Tidak
                </button>
                <button
                  type="button"
                  onClick={confirmPendingDelete}
                  className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant KPI Summary Cards Matching Oxford Blue & Warm Tan Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-[24px] bg-gradient-to-br from-[#002147] via-[#002B5B] to-[#001835] text-white p-4.5 border border-[#D2B48C]/40 shadow-[0_12px_32px_rgba(0,33,71,0.16)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D2B48C]">
              Total Timbulan Limbah
            </div>
            <div className="text-2xl font-black mt-1 tracking-tight">
              {formatWeightKgId(overallMetrics.grandTotal, true)}{' '}
              <span className="text-xs font-semibold text-[#D2B48C]">kg</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Akumulasi Tajam + Padat
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#D2B48C]/20 border border-[#D2B48C]/40 flex items-center justify-center text-[#D2B48C]">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 p-4.5 border border-[#D2B48C]/55 dark:border-[#D2B48C]/25 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D2B48C]/80">
              Total Limbah Padat
            </div>
            <div className="text-2xl font-black text-[#002147] dark:text-white mt-1">
              {formatWeightKgId(overallMetrics.totalPadat, true)}{' '}
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                kg
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Dari {filteredRows.length} baris pencatatan
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 p-4.5 border border-[#D2B48C]/55 dark:border-[#D2B48C]/25 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D2B48C]/80">
              Total Limbah Tajam
            </div>
            <div className="text-2xl font-black text-[#002147] dark:text-white mt-1">
              {formatWeightKgId(overallMetrics.totalTajam, true)}{' '}
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                kg
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Safety Box / Benda Tajam
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F7F1E7] dark:bg-[#002147] border border-[#D2B48C]/60 flex items-center justify-center text-[#002147] dark:text-[#D2B48C]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-[24px] bg-white/90 dark:bg-[#001835]/90 p-4.5 border border-[#D2B48C]/55 dark:border-[#D2B48C]/25 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#D2B48C]/80">
              Sumber Ruangan &amp; Manifest
            </div>
            <div className="text-2xl font-black text-[#002147] dark:text-white mt-1">
              {overallMetrics.roomCount}{' '}
              <span className="text-xs font-semibold text-slate-500">
                Ruangan
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {overallMetrics.manifestCount} Nomor Manifest Aktif
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F7F1E7] dark:bg-[#002147] border border-[#D2B48C]/60 flex items-center justify-center text-[#002147] dark:text-[#D2B48C]">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Datalist for Sumber Limbah Room Picker */}
      <datalist id="sikesling-waste-room-list">
        {roomOptions.map((roomName) => (
          <option key={roomName} value={roomName} />
        ))}
      </datalist>

      {/* Main Official Log Book Limbah Medis Table Card */}
      <div className="rounded-[28px] bg-white dark:bg-[#00152E] border-[1.5px] border-[#D2B48C]/70 dark:border-[#D2B48C]/30 shadow-[0_18px_50px_rgba(0,33,71,0.10)] overflow-hidden">
        {/* Official Document Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FAF6F0] via-white to-[#FAF6F0] dark:from-[#001D3D] dark:via-[#00152E] dark:to-[#001D3D] border-b border-[#D2B48C]/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <h2 className="text-center sm:text-left text-base sm:text-lg font-extrabold tracking-wide text-[#002147] dark:text-white uppercase">
            LOG BOOK LIMBAH MEDIS {selectedMonth === 'ALL' ? `TAHUN ${selectedYear}` : `BULAN ${LOGBOOK_MONTH_NAMES[selectedMonth - 1].toUpperCase()} ${selectedYear}`}
          </h2>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#002147]/5 dark:bg-white/10 text-[#002147] dark:text-[#D2B48C] border border-[#D2B48C]/40">
            {filteredRows.length} Baris Pencatatan ({batchGroups.length} Batch)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-b from-[#002147] to-[#001835] text-white font-bold text-center">
                {/* No */}
                <th className="border border-[#D2B48C]/40 px-2.5 py-3 w-12 align-middle">
                  {editingHeaderKey === 'no' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditHeader('no', columnLabels.no)}
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.no}
                    </button>
                  )}
                </th>

                {/* Sumber Limbah */}
                <th className="border border-[#D2B48C]/40 px-3 py-3 min-w-[200px] align-middle">
                  {editingHeaderKey === 'sumberLimbah' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-2 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader(
                          'sumberLimbah',
                          columnLabels.sumberLimbah
                        )
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.sumberLimbah}
                    </button>
                  )}
                </th>

                {/* Berat Limbah Tajam (kg) */}
                <th className="border border-[#D2B48C]/40 px-2.5 py-3 w-28 align-middle leading-snug">
                  {editingHeaderKey === 'beratTajam' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader('beratTajam', columnLabels.beratTajam)
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.beratTajam}
                    </button>
                  )}
                </th>

                {/* Berat Limbah Padat (kg) */}
                <th className="border border-[#D2B48C]/40 px-2.5 py-3 w-28 align-middle leading-snug">
                  {editingHeaderKey === 'beratPadat' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader('beratPadat', columnLabels.beratPadat)
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.beratPadat}
                    </button>
                  )}
                </th>

                {/* Tanggal Masuk Limbah */}
                <th className="border border-[#D2B48C]/40 px-3 py-3 w-36 align-middle leading-snug">
                  {editingHeaderKey === 'tanggalMasuk' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader(
                          'tanggalMasuk',
                          columnLabels.tanggalMasuk
                        )
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.tanggalMasuk}
                    </button>
                  )}
                </th>

                {/* Maks Penyimpanan suhu dibawah 0°C */}
                <th className="border border-[#D2B48C]/40 px-2.5 py-3 w-36 align-middle leading-snug">
                  {editingHeaderKey === 'maksPenyimpanan' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader(
                          'maksPenyimpanan',
                          columnLabels.maksPenyimpanan
                        )
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.maksPenyimpanan}
                    </button>
                  )}
                </th>

                {/* Tanggal Keluar Limbah */}
                <th className="border border-[#D2B48C]/40 px-3 py-3 w-36 align-middle leading-snug">
                  {editingHeaderKey === 'tanggalKeluar' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader(
                          'tanggalKeluar',
                          columnLabels.tanggalKeluar
                        )
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.tanggalKeluar}
                    </button>
                  )}
                </th>

                {/* No.Manifest */}
                <th className="border border-[#D2B48C]/40 px-3 py-3 w-36 align-middle">
                  {editingHeaderKey === 'noManifest' ? (
                    <input
                      type="text"
                      value={editingHeaderValue}
                      onChange={(e) => setEditingHeaderValue(e.target.value)}
                      onBlur={commitEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && commitEditHeader()}
                      autoFocus
                      className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEditHeader('noManifest', columnLabels.noManifest)
                      }
                      className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                      title="Klik untuk ubah nama kolom"
                    >
                      {columnLabels.noManifest}
                    </button>
                  )}
                </th>

                {/* Dynamic Custom Columns */}
                {customColumns.map((col) => (
                  <th
                    key={col.id}
                    className="border border-[#D2B48C]/40 px-3 py-3 min-w-[130px] align-middle"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {editingHeaderKey === `custom:${col.id}` ? (
                        <input
                          type="text"
                          value={editingHeaderValue}
                          onChange={(e) =>
                            setEditingHeaderValue(e.target.value)
                          }
                          onBlur={commitEditHeader}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && commitEditHeader()
                          }
                          autoFocus
                          className="w-full px-1 py-0.5 text-center rounded bg-white text-[#002147] text-xs font-bold"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startEditHeader(`custom:${col.id}`, col.label)
                          }
                          className="hover:text-[#D2B48C] transition-colors cursor-pointer"
                        >
                          {col.label}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          requestDeleteConfirmation({
                            type: 'column',
                            id: col.id,
                            label: `Kolom "${col.label}"`,
                          })
                        }
                        className="text-rose-300 hover:text-rose-400 text-[11px] font-bold px-1 rounded cursor-pointer"
                        title="Hapus kolom ini"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}

                {/* Aksi Baris & Tambah Kolom Inline */}
                <th className="border border-[#D2B48C]/40 px-2 py-2.5 w-24 align-middle">
                  <div className="flex flex-col items-center gap-1">
                    <span>Aksi</span>
                    <button
                      type="button"
                      onClick={handleAddInlineColumn}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#D2B48C] text-[#002147] hover:bg-[#EADBC8] text-[10px] font-extrabold transition-colors cursor-pointer"
                      title="Tambah kolom baru pada tabel"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Kolom</span>
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {batchGroups.map((group) => (
                <React.Fragment key={group.batchId}>
                  {group.rows.map((row) => {
                    const isEditing = (field: EditableFieldKey) =>
                      editingCell?.rowId === row.id &&
                      editingCell?.field === field;

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-[#FAF6F0]/90 dark:hover:bg-[#002147]/50 transition-colors text-[#002147] dark:text-slate-100"
                      >
                        {/* No */}
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-semibold">
                          {row.no}
                        </td>

                        {/* Sumber Limbah (Editable with Room List Datalist) */}
                        <td
                          onClick={() => {
                            if (!isEditing('sumberLimbah')) {
                              startEditCell(row, 'sumberLimbah');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-3 py-1.5 font-medium cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk pilih atau edit Sumber Limbah"
                        >
                          {isEditing('sumberLimbah') ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                list="sikesling-waste-room-list"
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onBlur={() => commitEditCell(false)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEditCell(false);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-full px-2 py-1 rounded border border-[#002147] bg-white text-[#002147] text-xs font-semibold focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <span>{row.sumberLimbah}</span>
                              <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                          )}
                        </td>

                        {/* Berat Limbah Tajam (kg) - Manual Input */}
                        <td
                          onClick={() => {
                            if (!isEditing('beratTajamKg')) {
                              startEditCell(row, 'beratTajamKg');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center font-medium cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk input manual Berat Limbah Tajam (kg)"
                        >
                          {isEditing('beratTajamKg') ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => commitEditCell(false)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEditCell(false);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              placeholder="0,00"
                              autoFocus
                              className="w-full px-1.5 py-1 text-center rounded border border-[#002147] bg-white text-[#002147] text-xs font-bold focus:outline-none"
                            />
                          ) : (
                            <span>{formatWeightKgId(row.beratTajamKg)}</span>
                          )}
                        </td>

                        {/* Berat Limbah Padat (kg) - Manual Input */}
                        <td
                          onClick={() => {
                            if (!isEditing('beratPadatKg')) {
                              startEditCell(row, 'beratPadatKg');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center font-medium cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk input manual Berat Limbah Padat (kg)"
                        >
                          {isEditing('beratPadatKg') ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => commitEditCell(false)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEditCell(false);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              placeholder="0,00"
                              autoFocus
                              className="w-full px-1.5 py-1 text-center rounded border border-[#002147] bg-white text-[#002147] text-xs font-bold focus:outline-none"
                            />
                          ) : (
                            <span>{formatWeightKgId(row.beratPadatKg)}</span>
                          )}
                        </td>

                        {/* Tanggal Masuk Limbah - Calendar Picker */}
                        <td
                          onClick={() => {
                            if (!isEditing('tanggalMasuk')) {
                              startEditCell(row, 'tanggalMasuk');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk pilih Tanggal Masuk dari Kalender"
                        >
                          {isEditing('tanggalMasuk') ? (
                            <div
                              className="flex flex-col items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="date"
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEditCell(false);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-full px-1.5 py-1 rounded border border-[#002147] bg-white text-[#002147] text-xs font-semibold focus:outline-none cursor-pointer"
                              />
                              <div className="flex items-center gap-1 w-full justify-center">
                                <button
                                  type="button"
                                  onClick={() => commitEditCell(false)}
                                  className="px-2 py-0.5 rounded bg-[#002147] text-white text-[10px] font-bold cursor-pointer"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => commitEditCell(true)}
                                  className="px-2 py-0.5 rounded bg-[#D2B48C] text-[#002147] text-[10px] font-bold cursor-pointer"
                                  title="Terapkan tanggal ini ke semua baris di batch ini"
                                >
                                  Semua Baris
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5">
                              <span>
                                {formatIsoToDisplayDate(row.tanggalMasuk)}
                              </span>
                            </span>
                          )}
                        </td>

                        {/* Maks Penyimpanan suhu dibawah 0°C */}
                        <td
                          onClick={() => {
                            if (!isEditing('maksPenyimpananSuhu')) {
                              startEditCell(row, 'maksPenyimpananSuhu');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center font-bold cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk ubah status Maks Penyimpanan suhu dibawah 0°C"
                        >
                          {isEditing('maksPenyimpananSuhu') ? (
                            <div
                              className="flex items-center justify-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingValue('✓');
                                  updateRowsDirty((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, maksPenyimpananSuhu: '✓' }
                                        : r
                                    )
                                  );
                                  setEditingCell(null);
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingValue('-');
                                  updateRowsDirty((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, maksPenyimpananSuhu: '-' }
                                        : r
                                    )
                                  );
                                  setEditingCell(null);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                              >
                                -
                              </button>
                            </div>
                          ) : (
                            <span>{row.maksPenyimpananSuhu}</span>
                          )}
                        </td>

                        {/* Tanggal Keluar Limbah - Calendar Picker */}
                        <td
                          onClick={() => {
                            if (!isEditing('tanggalKeluar')) {
                              startEditCell(row, 'tanggalKeluar');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk pilih Tanggal Keluar dari Kalender"
                        >
                          {isEditing('tanggalKeluar') ? (
                            <div
                              className="flex flex-col items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="date"
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEditCell(false);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-full px-1.5 py-1 rounded border border-[#002147] bg-white text-[#002147] text-xs font-semibold focus:outline-none cursor-pointer"
                              />
                              <div className="flex items-center gap-1 w-full justify-center">
                                <button
                                  type="button"
                                  onClick={() => commitEditCell(false)}
                                  className="px-2 py-0.5 rounded bg-[#002147] text-white text-[10px] font-bold cursor-pointer"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => commitEditCell(true)}
                                  className="px-2 py-0.5 rounded bg-[#D2B48C] text-[#002147] text-[10px] font-bold cursor-pointer"
                                  title="Terapkan tanggal keluar ini ke semua baris di batch ini"
                                >
                                  Semua Baris
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span>
                              {formatIsoToDisplayDate(row.tanggalKeluar)}
                            </span>
                          )}
                        </td>

                        {/* No.Manifest - Manual Input */}
                        <td
                          onClick={() => {
                            if (!isEditing('noManifest')) {
                              startEditCell(row, 'noManifest');
                            }
                          }}
                          className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center font-mono font-semibold cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                          title="Klik untuk input manual No.Manifest"
                        >
                          {isEditing('noManifest') ? (
                            <div
                              className="flex flex-col items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEditCell(false);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                placeholder="Input No.Manifest..."
                                autoFocus
                                className="w-full px-1.5 py-1 text-center rounded border border-[#002147] bg-white text-[#002147] text-xs font-mono font-bold focus:outline-none"
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => commitEditCell(false)}
                                  className="px-2 py-0.5 rounded bg-[#002147] text-white text-[10px] font-sans font-bold cursor-pointer"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => commitEditCell(true)}
                                  className="px-2 py-0.5 rounded bg-[#D2B48C] text-[#002147] text-[10px] font-sans font-bold cursor-pointer"
                                  title="Terapkan No.Manifest ke semua baris pada tanggal ini"
                                >
                                  Semua Baris
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-800 dark:text-slate-100">
                              {row.noManifest || (
                                <span className="text-[11px] font-sans font-normal text-slate-400 italic">
                                  Klik input...
                                </span>
                              )}
                            </span>
                          )}
                        </td>

                        {/* Custom Columns Cells */}
                        {customColumns.map((col) => {
                          const fieldKey: EditableFieldKey = `custom:${col.id}`;
                          return (
                            <td
                              key={col.id}
                              onClick={() => {
                                if (!isEditing(fieldKey)) {
                                  startEditCell(row, fieldKey);
                                }
                              }}
                              className="border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center cursor-pointer hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147]"
                            >
                              {isEditing(fieldKey) ? (
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) =>
                                    setEditingValue(e.target.value)
                                  }
                                  onBlur={() => commitEditCell(false)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                      commitEditCell(false);
                                    if (e.key === 'Escape')
                                      setEditingCell(null);
                                  }}
                                  autoFocus
                                  className="w-full px-1.5 py-1 text-center rounded border border-[#002147] bg-white text-[#002147] text-xs font-semibold focus:outline-none"
                                />
                              ) : (
                                <span>{row.customValues?.[col.id] || ''}</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Delete Row Button (Triggers Ya/Tidak Confirmation Dialog) */}
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              requestDeleteConfirmation({
                                type: 'row',
                                id: row.id,
                                label: `Baris No.${row.no} (${row.sumberLimbah} — ${formatIsoToDisplayDate(
                                  row.tanggalMasuk
                                )})`,
                              })
                            }
                            aria-label={`Hapus baris ${row.sumberLimbah}`}
                            title="Hapus baris ini"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Batch Subtotal Row */}
                  <tr className="bg-gradient-to-r from-[#E6F4EA] via-[#D1FAE5] to-[#E6F4EA] dark:from-emerald-950/80 dark:via-emerald-900/70 dark:to-emerald-950/80 font-extrabold text-[#002147] dark:text-emerald-200">
                    <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center"></td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                          Subtotal ({formatIsoToDisplayDate(group.tanggalMasuk)}
                          )
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddRowToBatch(group.batchId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#002147] text-[#D2B48C] hover:bg-[#003166] text-[10px] font-bold transition-colors cursor-pointer"
                            title="Tambah baris sumber limbah pada tanggal ini"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Baris</span>
                          </button>
                          {batchGroups.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                requestDeleteConfirmation({
                                  type: 'batch',
                                  id: group.batchId,
                                  label: `Batch Tanggal ${formatIsoToDisplayDate(
                                    group.tanggalMasuk
                                  )} (${group.rows.length} baris)`,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-200 hover:bg-rose-50 text-[10px] font-semibold transition-colors cursor-pointer"
                              title="Hapus seluruh kelompok tanggal ini"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Batch</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Subtotal Berat Limbah Tajam (kg) */}
                    <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-center text-emerald-950 dark:text-emerald-100">
                      {formatWeightKgId(group.totalTajamKg, true)}
                    </td>
                    {/* Subtotal Berat Limbah Padat (kg) */}
                    <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-center text-emerald-950 dark:text-emerald-100">
                      {formatWeightKgId(group.totalPadatKg, true)}
                    </td>
                    {/* Total Combined Weight (Tajam + Padat) under Tanggal Masuk column */}
                    <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-center text-emerald-950 dark:text-emerald-100">
                      {formatWeightKgId(group.totalCombinedKg, true)}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-center"></td>
                    <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-center"></td>
                    <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-center"></td>
                    {customColumns.map((col) => (
                      <td
                        key={col.id}
                        className="border border-slate-300 dark:border-slate-700 px-2.5 py-2"
                      ></td>
                    ))}
                    <td className="border border-slate-300 dark:border-slate-700 px-2 py-2"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear, Simple & Elegant Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-[26px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/60 dark:border-[#D2B48C]/25 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#002147] dark:text-white">
                  Visualisasi Timbulan Limbah Medis per Sumber Ruangan (kg)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Grafik otomatis menyesuaikan secara realtime saat berat limbah
                  atau baris ruangan diedit
                </p>
              </div>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roomChartData}
                margin={{ top: 10, right: 16, left: 0, bottom: 45 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#E2E8F0'}
                />
                <XAxis
                  dataKey="room"
                  tick={{
                    fontSize: 10,
                    fill: isDark ? '#E2E8F0' : '#002147',
                    fontWeight: 600,
                  }}
                  stroke={isDark ? '#475569' : '#94A3B8'}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: isDark ? '#E2E8F0' : '#002147',
                    fontWeight: 600,
                  }}
                  stroke={isDark ? '#475569' : '#94A3B8'}
                  unit=" kg"
                />
                <Tooltip
                  formatter={(value) =>
                    `${formatWeightKgId(Number(value ?? 0), true)} kg`
                  }
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: '#D2B48C',
                    borderRadius: '14px',
                    color: isDark ? '#F8FAFC' : '#002147',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  itemStyle={{ color: isDark ? '#F8FAFC' : '#002147' }}
                  labelStyle={{
                    color: isDark ? '#D2B48C' : '#002147',
                    fontWeight: 700,
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    paddingTop: 12,
                    color: isDark ? '#E2E8F0' : '#002147',
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="padatKg"
                  name="Limbah Padat (kg)"
                  fill={isDark ? '#38BDF8' : '#002147'}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="tajamKg"
                  name="Limbah Tajam (kg)"
                  fill={isDark ? '#FBBF24' : '#D2B48C'}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Rekapitulasi per Sumber Ruangan */}
        <div className="rounded-[26px] bg-white/90 dark:bg-[#001835]/90 border border-[#D2B48C]/60 dark:border-[#D2B48C]/25 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F7F1E7] dark:bg-[#002147] border border-[#D2B48C]/60 text-[#002147] dark:text-[#D2B48C] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#002147] dark:text-white">
                  Ringkasan Sumber Limbah
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Akumulasi berat per unit ruangan
                </p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[225px] overflow-y-auto pr-1">
              {roomChartData.map((item, idx) => (
                <div
                  key={item.room}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6F0]/85 dark:bg-[#001228]/80 border border-[#D2B48C]/35 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#002147] text-[#D2B48C] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#002147] dark:text-slate-100 truncate">
                      {item.room}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#002147] dark:text-[#D2B48C] shrink-0">
                    {formatWeightKgId(item.totalKg, true)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D2B48C]/40 flex items-center justify-between text-xs font-bold text-[#002147] dark:text-[#D2B48C]">
            <span>Total Keseluruhan</span>
            <span>{formatWeightKgId(overallMetrics.grandTotal, true)} kg</span>
          </div>
        </div>
      </div>

      {/* Automatic Analisa, Rekomendasi & Rencana Tindak Lanjut Card */}
      <section
        aria-label="Analisa Data, Rekomendasi, dan Rencana Tindak Lanjut Log Book Limbah Medis"
        className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-sm border-[1.5px] border-[#D2B48C]/65 dark:border-[#D2B48C]/25 shadow-[0_14px_38px_rgba(0,33,71,0.08)] p-6 sm:p-8 text-[#002147] dark:text-slate-100 space-y-6"
      >
        {/* Analisa */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-black underline underline-offset-4 decoration-2 text-[#002147] dark:text-white">
            Analisa :
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 text-justify indent-8">
            {autoAnalysis.analisaParagraph}
          </p>
        </div>

        {/* Rekomendasi */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white underline underline-offset-4 decoration-2">
            Rekomendasi :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            {autoAnalysis.rekomendasiList.map((item, idx) => (
              <li
                key={idx}
                className="grid grid-cols-[1.5rem_1fr] items-baseline"
              >
                <span className="font-semibold tabular-nums select-none">
                  {idx + 1}.
                </span>
                <span className="text-justify">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Rencana Tindak Lanjut */}
        <div className="space-y-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white underline underline-offset-4 decoration-2">
            Rencana Tindak Lanjut :
          </h3>
          <ol className="list-none pl-1 space-y-2 text-xs sm:text-[13.5px] text-slate-800 dark:text-slate-200 leading-relaxed">
            {autoAnalysis.tindakLanjutList.map((item, idx) => (
              <li
                key={idx}
                className="grid grid-cols-[1.5rem_1fr] items-baseline"
              >
                <span className="font-semibold tabular-nums select-none">
                  {idx + 1}.
                </span>
                <span className="text-justify">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Floating Save Button at Bottom-Right with Jelly Effect & Supabase Sync */}
      <div className="fixed bottom-24 lg:bottom-8 right-5 lg:right-8 z-40">
        <motion.button
          key={jellyTick}
          type="button"
          onClick={handleSaveToSupabase}
          disabled={isSaving}
          initial={{ scale: 1 }}
          animate={
            jellyTick > 0
              ? {
                  scale: [1, 1.24, 0.84, 1.12, 0.95, 1.03, 1],
                  rotate: [0, -3, 3, -1.5, 0],
                }
              : { scale: 1 }
          }
          whileHover={{
            scale: [1, 1.12, 0.93, 1.05, 0.98, 1],
            transition: { duration: 0.55, ease: 'easeInOut' },
          }}
          whileTap={{
            scale: 0.86,
            transition: { type: 'spring', stiffness: 600, damping: 12 },
          }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#002147] via-[#002E63] to-[#001835] text-white border-[1.5px] border-[#D2B48C] shadow-[0_10px_24px_rgba(0,33,71,0.34),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-pointer select-none"
          title="Simpan Data ke Aplikasi & Database Supabase"
        >
          {hasUnsavedChanges ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
          ) : null}
          <div className="w-6 h-6 rounded-full bg-[#D2B48C] text-[#002147] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Save className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold tracking-wide text-white pr-1">
            {isSaving ? 'Menyimpan...' : 'Simpan Data'}
          </span>
        </motion.button>
      </div>
    </PageContainer>
  );
}
