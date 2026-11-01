'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarRange,
  Search,
  Check,
  Building2,
  ShieldCheck,
  Droplets,
  Wind,
  Trash2,
  Bug,
  UtensilsCrossed,
  Shirt,
  Radio,
  FileText,
  Info,
  X,
  Plus,
  Pencil,
  Save,
  Trash,
} from 'lucide-react';
import {
  MONTH_SHORTS_ID,
  MONTH_NAMES_ID,
  ProgramItem,
  ProgramCategory,
  loadProgramKerjaData,
  saveProgramKerjaData,
} from '@/lib/program-kerja';

export function AnnualProgramView() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state initialized from storage
  const [categoriesData, setCategoriesData] = useState<ProgramCategory[]>(() =>
    loadProgramKerjaData()
  );

  // Edit / Add Modal state
  const [editingModal, setEditingModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    catId: string;
    item: ProgramItem;
  } | null>(null);

  // Sync state if external update fires
  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEv = e as CustomEvent<ProgramCategory[]>;
      if (customEv.detail) {
        setCategoriesData(customEv.detail);
      }
    };
    window.addEventListener('sikesling_program_updated', handleStorageUpdate);
    return () => window.removeEventListener('sikesling_program_updated', handleStorageUpdate);
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categoriesData
      .map((cat) => {
        if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
          return null;
        }
        const matchingItems = cat.items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            item.title.toLowerCase().includes(q) ||
            item.standard.toLowerCase().includes(q) ||
            item.pic.toLowerCase().includes(q) ||
            item.targetUnit.toLowerCase().includes(q)
          );
        });

        if (matchingItems.length === 0) return null;
        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter(Boolean) as ProgramCategory[];
  }, [categoriesData, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    let totalActivities = 0;
    for (const cat of categoriesData) {
      totalActivities += cat.items.length;
    }
    return {
      totalCategories: categoriesData.length,
      totalActivities,
    };
  }, [categoriesData]);

  const getCategoryIcon = (id: string, className = 'w-4 h-4') => {
    switch (id) {
      case 'air':
        return <Droplets className={className} />;
      case 'udara':
        return <Wind className={className} />;
      case 'sarana':
        return <Building2 className={className} />;
      case 'limbah':
        return <Trash2 className={className} />;
      case 'vektor':
        return <Bug className={className} />;
      case 'pangan':
        return <UtensilsCrossed className={className} />;
      case 'linen':
        return <Shirt className={className} />;
      case 'radiasi':
        return <Radio className={className} />;
      case 'manajemen':
        return <FileText className={className} />;
      default:
        return <ShieldCheck className={className} />;
    }
  };

  // Modal Handlers
  const openEditModal = (catId: string, item: ProgramItem) => {
    setEditingModal({
      isOpen: true,
      isNew: false,
      catId,
      item: JSON.parse(JSON.stringify(item)),
    });
  };

  const openAddModal = () => {
    const targetCat =
      selectedCategory !== 'all'
        ? categoriesData.find((c) => c.id === selectedCategory) || categoriesData[0]
        : categoriesData[0];
    const newSubNo = targetCat.items.length + 1;
    const newItem: ProgramItem = {
      id: `${targetCat.id}-${Date.now()}`,
      subNo: newSubNo,
      title: '',
      standard: 'Permenkes No 7 Tahun 2019',
      targetUnit: 'RSUD Al-Mulk',
      frequencyType: 'setiap_bulan',
      frequencyLabel: '1x Setiap Bulan',
      annualSchedule: [true, true, true, true, true, true, true, true, true, true, true, true],
      monthlySchedule: {},
      pic: 'Sanitarian RSAM',
      status: 'Terjadwal',
    };
    setEditingModal({
      isOpen: true,
      isNew: true,
      catId: targetCat.id,
      item: newItem,
    });
  };

  const handleSaveProgram = () => {
    if (!editingModal) return;
    const { isNew, catId, item } = editingModal;
    if (!item.title.trim()) return;

    const nextData = categoriesData.map((cat) => {
      if (cat.id !== catId) return cat;
      if (isNew) {
        return {
          ...cat,
          items: [...cat.items, { ...item, subNo: cat.items.length + 1 }],
        };
      }
      return {
        ...cat,
        items: cat.items.map((i) => (i.id === item.id ? item : i)),
      };
    });

    setCategoriesData(nextData);
    saveProgramKerjaData(nextData);
    setEditingModal(null);
  };

  const handleDeleteProgram = () => {
    if (!editingModal || editingModal.isNew) return;
    const { catId, item } = editingModal;

    const nextData = categoriesData.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.filter((i) => i.id !== item.id).map((i, idx) => ({ ...i, subNo: idx + 1 })),
      };
    });

    setCategoriesData(nextData);
    saveProgramKerjaData(nextData);
    setEditingModal(null);
  };

  return (
    <div className="w-full space-y-5 pb-20">
      {/* Top Clean Header Card - Removed Cetak/Ekspor & Jadwal Bulanan buttons */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 backdrop-blur-md border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_16px_36px_rgba(0,33,71,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1
              style={{ fontSize: '23px' }}
              className="text-[23px] font-extrabold tracking-tight text-[#002147] dark:text-white uppercase leading-snug"
            >
              PROGRAM KERJA KESEHATAN LINGKUNGAN UOBK RSUD AL-MULK
            </h1>
            <p className="text-sm font-bold text-[#D2B48C] tracking-wide">
              KOTA SUKABUMI TAHUN {selectedYear}
            </p>
          </div>

          {/* Right Action Control: ONLY Year Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#F5EDE0] dark:bg-[#002147] border border-[#D2B48C]/50 shrink-0 self-start sm:self-center">
            {[2024, 2025, 2026].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#002147] text-[#D2B48C] shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#002147]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Row Above Table: ONLY Single + Tambah Program Button on Top Right */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-[#002147] text-[#D2B48C] hover:bg-[#001835] text-xs font-bold transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Program</span>
        </button>
      </div>

      {/* Main Gantt / Matrix Table Card */}
      <div className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-md border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_16px_36px_rgba(0,33,71,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border-b border-[#D2B48C]/40 text-xs font-black tracking-wider uppercase">
                <th
                  rowSpan={2}
                  className="py-3 px-3 w-14 text-center border-r border-[#D2B48C]/30 align-middle"
                >
                  NO
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-4 min-w-[300px] border-r border-[#D2B48C]/30 align-middle"
                >
                  PROGRAM KERJA / KEGIATAN KESEHATAN LINGKUNGAN
                </th>
                <th
                  colSpan={12}
                  className="py-2 px-2 text-center bg-[#E8DAC2] dark:bg-[#001b3a] border-b border-[#D2B48C]/35"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5" />
                    <span>BULAN PELAKSANAAN (TAHUN {selectedYear})</span>
                  </div>
                </th>
              </tr>
              <tr className="bg-[#E8DAC2]/85 dark:bg-[#001b3a] text-[#002147] dark:text-[#D2B48C] border-b border-[#D2B48C]/40 text-[10.5px] font-extrabold tracking-wide uppercase">
                {MONTH_SHORTS_ID.map((m) => (
                  <th
                    key={m}
                    className="py-2 px-1.5 w-[44px] xl:w-[48px] min-w-[42px] text-center border-r border-[#D2B48C]/25 last:border-r-0"
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#D2B48C]/25 dark:divide-slate-800 text-xs">
              {filteredCategories.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Category Banner Row: Icon in NO column (replacing Roman numeral), Clean Title in Program column */}
                  <tr className="bg-[#FAF3E8] dark:bg-[#001e42] font-black text-[#002147] dark:text-[#D2B48C] border-y border-[#D2B48C]/40">
                    <td className="py-2.5 px-3 text-center border-r border-[#D2B48C]/30 bg-[#F2E5D0] dark:bg-[#002754] align-middle">
                      <div
                        title={`Bidang ${cat.roman}: ${cat.title}`}
                        className="mx-auto w-7 h-7 rounded-xl bg-[#002147] text-[#D2B48C] border border-[#D2B48C]/40 flex items-center justify-center shadow-xs"
                      >
                        {getCategoryIcon(cat.id, 'w-3.5 h-3.5')}
                      </div>
                    </td>
                    <td colSpan={13} className="py-2.5 px-4 align-middle">
                      <span className="text-[13px] font-extrabold tracking-tight text-[#002147] dark:text-[#D2B48C]">
                        {cat.title}
                      </span>
                    </td>
                  </tr>

                  {/* Program Items - Entire row click opens Edit Modal */}
                  {cat.items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openEditModal(cat.id, item)}
                      className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#002147]/50 transition-colors cursor-pointer group"
                    >
                      {/* Sub-number directly below Category Icon */}
                      <td className="py-3 px-3 w-14 text-center font-bold text-[#002147]/75 dark:text-slate-300 border-r border-[#D2B48C]/20 bg-slate-50/50 dark:bg-slate-900/30 font-mono align-middle">
                        {item.subNo}
                      </td>

                      {/* Title & Metadata */}
                      <td className="py-3 px-4 border-r border-[#D2B48C]/20">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-[#002147] dark:text-white leading-snug group-hover:text-[#1D7AFC] transition-colors flex items-center gap-1.5">
                            <span>{item.title}</span>
                            <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] font-medium">
                              {item.frequencyLabel}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              PIC: <strong className="text-slate-700 dark:text-slate-300">{item.pic}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 12 Months Matrix Cells */}
                      {item.annualSchedule.map((isActive, mIdx) => (
                        <td
                          key={mIdx}
                          className="py-2 px-1.5 w-[44px] xl:w-[48px] min-w-[42px] text-center border-r border-[#D2B48C]/15 last:border-r-0 align-middle"
                        >
                          {isActive ? (
                            <div
                              title={`${MONTH_NAMES_ID[mIdx]}: Klik untuk edit program`}
                              className="mx-auto w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-xs group-hover:scale-110 transition-transform"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 px-4 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-[#002147] dark:text-white">
              Tidak ada kegiatan yang sesuai pencarian
            </div>
            <p className="text-xs text-slate-500">
              Coba gunakan kata kunci lain atau pilih Kategori "Semua ({stats.totalCategories} Bidang)".
            </p>
          </div>
        )}
      </div>

      {/* POP-UP MODAL UNTUK EDIT / TAMBAH PROGRAM KERJA */}
      {editingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-[28px] bg-white dark:bg-[#001835] border border-[#D2B48C] shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D2B48C]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#002147] dark:text-white">
                    {editingModal.isNew ? 'Tambah Program Kerja Baru' : 'Edit Program Kerja'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Isi detail nama program, PIC, dasar regulasi, dan jadwal pelaksanaan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-[#002147]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-3.5 text-xs">
              {/* Category selector for new item */}
              {editingModal.isNew && (
                <div className="space-y-1">
                  <label className="font-bold text-[#002147] dark:text-slate-200">
                    Pilih Bidang Program
                  </label>
                  <select
                    value={editingModal.catId}
                    onChange={(e) =>
                      setEditingModal({ ...editingModal, catId: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D2B48C]/50 bg-[#FAF6F0]/60 dark:bg-[#00152E] text-[#002147] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  >
                    {categoriesData.map((c) => (
                      <option key={c.id} value={c.id}>
                        Bidang {c.roman}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nama Program */}
              <div className="space-y-1">
                <label className="font-bold text-[#002147] dark:text-slate-200">
                  Nama Program / Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemeriksaan kualitas air bersih parameter mikrobiologi"
                  value={editingModal.item.title}
                  onChange={(e) =>
                    setEditingModal({
                      ...editingModal,
                      item: { ...editingModal.item, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2B48C]/50 bg-[#FAF6F0]/60 dark:bg-[#00152E] text-[#002147] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Grid 2 Columns: PIC & Frekuensi Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#002147] dark:text-slate-200">
                    Penanggung Jawab / PIC
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sanitarian & Labkesda"
                    value={editingModal.item.pic}
                    onChange={(e) =>
                      setEditingModal({
                        ...editingModal,
                        item: { ...editingModal.item, pic: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D2B48C]/50 bg-[#FAF6F0]/60 dark:bg-[#00152E] text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#002147] dark:text-slate-200">
                    Keterangan Waktu / Frekuensi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1x Setiap Bulan (Minggu ke-2)"
                    value={editingModal.item.frequencyLabel}
                    onChange={(e) =>
                      setEditingModal({
                        ...editingModal,
                        item: { ...editingModal.item, frequencyLabel: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D2B48C]/50 bg-[#FAF6F0]/60 dark:bg-[#00152E] text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              {/* Grid 2 Columns: Regulasi & Target Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#002147] dark:text-slate-200">
                    Dasar Regulasi / Standar
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Permenkes No 2 Tahun 2023"
                    value={editingModal.item.standard}
                    onChange={(e) =>
                      setEditingModal({
                        ...editingModal,
                        item: { ...editingModal.item, standard: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D2B48C]/50 bg-[#FAF6F0]/60 dark:bg-[#00152E] text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#002147] dark:text-slate-200">
                    Sasaran / Lokasi Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Artesis, Air RO Lab, Poli Gigi"
                    value={editingModal.item.targetUnit}
                    onChange={(e) =>
                      setEditingModal({
                        ...editingModal,
                        item: { ...editingModal.item, targetUnit: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D2B48C]/50 bg-[#FAF6F0]/60 dark:bg-[#00152E] text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="font-bold text-[#002147] dark:text-slate-200">
                  Status Pelaksanaan
                </label>
                <div className="flex items-center gap-2">
                  {(['Terjadwal', 'Sedang Berjalan', 'Selesai'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        setEditingModal({
                          ...editingModal,
                          item: { ...editingModal.item, status: st },
                        })
                      }
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                        editingModal.item.status === st
                          ? 'bg-[#002147] text-[#D2B48C] shadow-xs'
                          : 'bg-[#FAF6F0] dark:bg-[#00152E] text-slate-600 dark:text-slate-300 border border-[#D2B48C]/30'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selector Checkboxes (12 Months Jan-Des) */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-[#002147] dark:text-slate-200 block">
                  Bulan Pelaksanaan (Centang Bulan aktif)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {MONTH_SHORTS_ID.map((mShort, idx) => {
                    const isChecked = editingModal.item.annualSchedule[idx];
                    return (
                      <button
                        key={mShort}
                        type="button"
                        onClick={() => {
                          const nextSch = [...editingModal.item.annualSchedule];
                          nextSch[idx] = !nextSch[idx];
                          setEditingModal({
                            ...editingModal,
                            item: { ...editingModal.item, annualSchedule: nextSch },
                          });
                        }}
                        className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                            : 'bg-[#FAF6F0] dark:bg-[#00152E] text-slate-500 border-[#D2B48C]/30 hover:bg-[#F5EDE0]'
                        }`}
                      >
                        {mShort}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#D2B48C]/30">
              {!editingModal.isNew ? (
                <button
                  type="button"
                  onClick={handleDeleteProgram}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgram}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#002147] text-[#D2B48C] hover:bg-[#001835] text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Program</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
