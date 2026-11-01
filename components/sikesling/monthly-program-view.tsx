'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  Check,
  Building2,
  Droplets,
  Wind,
  Trash2,
  Bug,
  UtensilsCrossed,
  Shirt,
  Radio,
  FileText,
  ShieldCheck,
  Info,
  Pencil,
  X,
  Plus,
  Save,
  Trash,
} from 'lucide-react';
import {
  MONTH_NAMES_ID,
  MONTH_SHORTS_ID,
  ProgramCategory,
  ProgramItem,
  loadProgramKerjaData,
  saveProgramKerjaData,
} from '@/lib/program-kerja';

export function MonthlyProgramView() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0); // 0 = Jan
  const [viewScope, setViewScope] = useState<'single_month' | 'semester_1' | 'semester_2' | 'full_year'>('single_month');
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

  // Interactive completed tasks state
  const [completedWeeklyTasks, setCompletedWeeklyTasks] = useState<Record<string, boolean>>({
    'air-1-0-w2': true,
    'sarana-1-0-w1': true,
    'sarana-1-0-w2': true,
    'limbah-1-0-w1': true,
    'limbah-1-0-w2': true,
    'vektor-1-0-w1': true,
    'vektor-1-0-w2': true,
    'pangan-2-0-w1': true,
    'linen-1-0-w1': true,
    'manajemen-1-0-w4': true,
  });

  const toggleTask = (taskId: string) => {
    setCompletedWeeklyTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Determine months to show in multi-month table
  const activeMonths = useMemo(() => {
    if (viewScope === 'single_month') {
      return [selectedMonthIdx];
    }
    if (viewScope === 'semester_1') {
      return [0, 1, 2, 3, 4, 5];
    }
    if (viewScope === 'semester_2') {
      return [6, 7, 8, 9, 10, 11];
    }
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }, [viewScope, selectedMonthIdx]);

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
      {/* Top Banner Card - Clean & Uncluttered (Removed Cetak/Ekspor & Matriks Tahunan buttons) */}
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
              KOTA SUKABUMI TAHUN {selectedYear} ·{' '}
              {viewScope === 'single_month'
                ? `BULAN ${MONTH_NAMES_ID[selectedMonthIdx].toUpperCase()}`
                : viewScope === 'semester_1'
                  ? 'SEMESTER I (JANUARI – JUNI)'
                  : viewScope === 'semester_2'
                    ? 'SEMESTER II (JULI – DESEMBER)'
                    : '1 TAHUN PENUH (JANUARI – DESEMBER)'}
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

        {/* View Scope Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-[#D2B48C]/30 dark:border-slate-800">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#FAF6F0] dark:bg-[#001835] border border-[#D2B48C]/40">
            <button
              type="button"
              onClick={() => setViewScope('single_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'single_month'
                  ? 'bg-[#002147] text-[#D2B48C] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#002147]'
              }`}
            >
              Fokus Per Bulan
            </button>
            <button
              type="button"
              onClick={() => setViewScope('semester_1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'semester_1'
                  ? 'bg-[#002147] text-[#D2B48C] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#002147]'
              }`}
            >
              Semester I (Jan–Jun)
            </button>
            <button
              type="button"
              onClick={() => setViewScope('semester_2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'semester_2'
                  ? 'bg-[#002147] text-[#D2B48C] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#002147]'
              }`}
            >
              Semester II (Jul–Des)
            </button>
            <button
              type="button"
              onClick={() => setViewScope('full_year')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'full_year'
                  ? 'bg-[#002147] text-[#D2B48C] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#002147]'
              }`}
            >
              Semua 12 Bulan
            </button>
          </div>

          {/* Month Selector Tabs */}
          {viewScope === 'single_month' && (
            <div
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full py-0.5"
            >
              {MONTH_SHORTS_ID.map((mShort, idx) => (
                <button
                  key={mShort}
                  type="button"
                  onClick={() => setSelectedMonthIdx(idx)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedMonthIdx === idx
                      ? 'bg-[#002147] text-[#D2B48C] shadow-xs'
                      : 'bg-white dark:bg-[#001835] text-slate-600 dark:text-slate-300 border border-[#D2B48C]/30 hover:bg-[#F5EDE0]'
                  }`}
                >
                  {mShort}
                </button>
              ))}
            </div>
          )}
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

      {/* Main Schedule Matrix Table */}
      <div className="rounded-[28px] bg-white/95 dark:bg-[#001835]/95 backdrop-blur-md border-[1.5px] border-[#D2B48C]/45 dark:border-[#D2B48C]/20 shadow-[0_16px_36px_rgba(0,33,71,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            {/* Multi-Tier Header (No Edit column) */}
            <thead>
              <tr className="bg-[#EFE4D2] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] border-b border-[#D2B48C]/40 text-xs font-black tracking-wider uppercase">
                <th
                  rowSpan={2}
                  className="py-3 px-3 w-12 text-center border-r border-[#D2B48C]/30 align-middle"
                >
                  NO
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-4 min-w-[300px] border-r border-[#D2B48C]/30 align-middle"
                >
                  PROGRAM KERJA KESEHATAN LINGKUNGAN
                </th>
                {activeMonths.map((mIdx) => (
                  <th
                    key={mIdx}
                    colSpan={4}
                    className="py-2 px-2 text-center border-r border-[#D2B48C]/30 last:border-r-0 bg-[#E8DAC2] dark:bg-[#001b3a]"
                  >
                    <div className="font-extrabold text-[12px] tracking-wide">
                      {MONTH_SHORTS_ID[mIdx]} ({MONTH_NAMES_ID[mIdx]})
                    </div>
                  </th>
                ))}
              </tr>

              <tr className="bg-[#FAF3E8] dark:bg-[#001835] text-[#002147] dark:text-slate-200 border-b border-[#D2B48C]/40 text-[10px] font-bold">
                {activeMonths.map((mIdx) => (
                  <React.Fragment key={`sub-${mIdx}`}>
                    <th className="py-1.5 px-1.5 text-center w-24 border-r border-[#D2B48C]/20 bg-[#F5EDE0]/70 dark:bg-[#001f42]">
                      Minggu 1
                    </th>
                    <th className="py-1.5 px-1.5 text-center w-24 border-r border-[#D2B48C]/20 bg-[#F5EDE0]/70 dark:bg-[#001f42]">
                      Minggu 2
                    </th>
                    <th className="py-1.5 px-1.5 text-center w-24 border-r border-[#D2B48C]/20 bg-[#F5EDE0]/70 dark:bg-[#001f42]">
                      Minggu 3
                    </th>
                    <th className="py-1.5 px-1.5 text-center w-24 border-r border-[#D2B48C]/30 last:border-r-0 bg-[#F5EDE0]/70 dark:bg-[#001f42]">
                      Minggu 4
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#D2B48C]/25 dark:divide-slate-800 text-xs">
              {filteredCategories.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Category Section Banner: Icon in NO column replacing Roman numeral */}
                  <tr className="bg-[#FAF3E8] dark:bg-[#001e42] font-black text-[#002147] dark:text-[#D2B48C] border-y border-[#D2B48C]/40">
                    <td className="py-2.5 px-3 w-14 text-center border-r border-[#D2B48C]/30 bg-[#F2E5D0] dark:bg-[#002754] align-middle">
                      <div
                        title={`Bidang ${cat.roman}: ${cat.title}`}
                        className="mx-auto w-7 h-7 rounded-xl bg-[#002147] text-[#D2B48C] border border-[#D2B48C]/40 flex items-center justify-center shadow-xs"
                      >
                        {getCategoryIcon(cat.id, 'w-3.5 h-3.5')}
                      </div>
                    </td>
                    <td
                      colSpan={1 + activeMonths.length * 4}
                      className="py-2.5 px-4 align-middle"
                    >
                      <span className="text-[12.5px] font-extrabold tracking-tight text-[#002147] dark:text-[#D2B48C]">
                        {cat.title}
                      </span>
                    </td>
                  </tr>

                  {/* Program Items */}
                  {cat.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#002147]/50 transition-colors group"
                    >
                      {/* Sub-number directly below Category Icon */}
                      <td className="py-2.5 px-3 w-14 text-center font-bold text-[#002147]/75 dark:text-slate-300 border-r border-[#D2B48C]/20 bg-slate-50/50 dark:bg-slate-900/30 font-mono align-middle">
                        {item.subNo}
                      </td>

                      {/* Title & Standard (Clickable to Edit) */}
                      <td
                        onClick={() => openEditModal(cat.id, item)}
                        className="py-2.5 px-4 border-r border-[#D2B48C]/20 cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-[#002147] dark:text-white leading-snug group-hover:text-[#1D7AFC] transition-colors flex items-center gap-1">
                            <span>{item.title}</span>
                            <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {item.standard} · PIC: <strong className="text-slate-700 dark:text-slate-300">{item.pic}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Week Cells */}
                      {activeMonths.map((mIdx) => {
                        const mSchedule = item.monthlySchedule[mIdx] || {};
                        const weeks = [
                          { key: 'w1', label: 'Minggu 1', val: mSchedule.w1 },
                          { key: 'w2', label: 'Minggu 2', val: mSchedule.w2 },
                          { key: 'w3', label: 'Minggu 3', val: mSchedule.w3 },
                          { key: 'w4', label: 'Minggu 4', val: mSchedule.w4 },
                        ];

                        return weeks.map((w) => {
                          const taskId = `${item.id}-${mIdx}-${w.key}`;
                          const isCompleted = completedWeeklyTasks[taskId];
                          const hasSchedule = Boolean(w.val);

                          return (
                            <td
                              key={`${mIdx}-${w.key}`}
                              className="py-1 px-1 text-center border-r border-[#D2B48C]/15 last:border-r-0 align-middle"
                            >
                              {hasSchedule ? (
                                <button
                                  type="button"
                                  onClick={() => toggleTask(taskId)}
                                  title={`Klik untuk tandai selesai: ${item.title} (${MONTH_NAMES_ID[mIdx]} ${w.label})`}
                                  className={`w-full py-1 px-1 rounded-lg text-[9px] font-bold leading-tight transition-all cursor-pointer ${
                                    isCompleted
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-400/50 hover:bg-emerald-200'
                                  }`}
                                >
                                  <span className="flex items-center justify-center gap-0.5">
                                    {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    <span>{w.val}</span>
                                  </span>
                                </button>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700 text-xs">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        });
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL UNTUK EDIT / TAMBAH PROGRAM KERJA BULANAN */}
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
                    {editingModal.isNew ? 'Tambah Program Kerja Baru' : 'Edit Program Kerja & Schedule'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Atur nama program, PIC, dan jadwal rincian per minggu (Minggu 1 s/d 4).
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
                  placeholder="Contoh: Pemeriksaan Kualitas Udara Indoor"
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
                    placeholder="Contoh: Sanitarian RSAM"
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
                    Hari / Frekuensi Rutin
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Setiap Hari Rabu & Jumat"
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
                    Dasar Regulasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Permenkes No 7 Tahun 2019"
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
                    Sasaran Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20 Unit Instalasi RSUD Al-Mulk"
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

              {/* Weekly Schedule Editor for Selected Month */}
              <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#00152E] border border-[#D2B48C]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#002147] dark:text-slate-200">
                    Atur Rincian Minggu ({MONTH_NAMES_ID[selectedMonthIdx]})
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Isi teks jadwal (e.g., "rabu, jumat" atau "Sampling Mikrobiologi")
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['w1', 'w2', 'w3', 'w4'] as const).map((wKey, wIdx) => {
                    const currentVal =
                      editingModal.item.monthlySchedule[selectedMonthIdx]?.[wKey] || '';
                    return (
                      <div key={wKey} className="space-y-1">
                        <span className="text-[10px] font-bold text-[#002147] dark:text-[#D2B48C]">
                          Minggu {wIdx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Kosong"
                          value={currentVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            const prevMS = editingModal.item.monthlySchedule || {};
                            const monthObj = prevMS[selectedMonthIdx] || {};
                            setEditingModal({
                              ...editingModal,
                              item: {
                                ...editingModal.item,
                                monthlySchedule: {
                                  ...prevMS,
                                  [selectedMonthIdx]: {
                                    ...monthObj,
                                    [wKey]: val ? val : undefined,
                                  },
                                },
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#D2B48C]/40 bg-white dark:bg-[#001835] text-[11px] font-medium text-[#002147] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002147]"
                        />
                      </div>
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
