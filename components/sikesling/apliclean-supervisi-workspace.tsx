'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  BedDouble,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Droplets,
  Eraser,
  Eye,
  FileSpreadsheet,
  HeartPulse,
  History,
  Image as ImageIcon,
  PenTool,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Trees,
  UserCheck,
  X,
} from 'lucide-react';
import {
  APICLEAN_MODULES,
  AplicleanModuleId,
  AplicleanRecord,
  AplicleanTaskDefinition,
  AplicleanTaskKey,
  AplicleanTaskStatus,
  calculateAplicleanRecordProgress,
  createAllAplicleanRecords,
  createEmptyAplicleanTasks,
  getAplicleanModuleConfig,
  getIndonesianDayNameFromDate,
  loadAplicleanRecords,
  saveAplicleanRecords,
} from '@/lib/apliclean';
import {
  PhotoAttachmentMeta,
  PriorityLevel,
  UserRole,
  hasPermission,
  validateFileUpload,
} from '@/lib/domain';

interface OfficerOption {
  id: string;
  name: string;
  position: string;
  isActive: boolean;
}

export interface AplicleanSupervisiWorkspaceProps {
  addSupervision: (input: {
    date: string;
    officerName: string;
    roomOrUnit: string;
    category: string;
    inspectionDetails: string;
    findings: string;
    recommendations: string;
    priority: PriorityLevel;
    attachments: PhotoAttachmentMeta[];
  }) => void;
  masterOfficers: OfficerOption[];
  currentRole: UserRole;
  initialModule?: AplicleanModuleId;
  initialTab?: 'input' | 'matrix' | 'gallery';
}

export function AplicleanSupervisiWorkspace({
  addSupervision,
  masterOfficers,
  currentRole,
  initialModule = 'RAWAT_JALAN',
  initialTab = 'input',
}: AplicleanSupervisiWorkspaceProps) {
  const [records, setRecords] = useState<AplicleanRecord[]>(() =>
    createAllAplicleanRecords()
  );

  // Active APLICLEAN Module: RAWAT_JALAN, IGD, RANAP, ICU_IBS, SUPERVISI
  const [activeModuleId, setActiveModuleId] =
    useState<AplicleanModuleId>(initialModule);

  const activeModule = useMemo(
    () => getAplicleanModuleConfig(activeModuleId),
    [activeModuleId]
  );

  // Active workspace tab: 'input' (Form Checklist Baru), 'matrix' (Tabel Rekap APLICLEAN), 'gallery' (Galeri Bukti Foto & TTD)
  const [activeTab, setActiveTab] = useState<'input' | 'matrix' | 'gallery'>(
    initialTab
  );

  // Form states matching exact APLICLEAN structure
  const [date, setDate] = useState<string>('2026-10-31');
  const [time, setTime] = useState<string>('10:30:00');
  const [dayName, setDayName] = useState<string>(() =>
    getIndonesianDayNameFromDate('2026-10-31')
  );
  const [unitName, setUnitName] = useState<string>(
    () => getAplicleanModuleConfig(initialModule).defaultUnitName
  );
  const [officerName, setOfficerName] = useState<string>(
    () => getAplicleanModuleConfig(initialModule).defaultOfficer
  );
  const [supervisorEvaluation, setSupervisorEvaluation] = useState<string>(
    () => getAplicleanModuleConfig(initialModule).defaultEvaluation
  );
  const [tasks, setTasks] = useState(() => createEmptyAplicleanTasks(true));
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filters for Matrix & Gallery
  const [matrixModuleScope, setMatrixModuleScope] = useState<
    AplicleanModuleId | 'ALL'
  >(initialModule);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterDay, setFilterDay] = useState<string>('ALL');

  // Detail / Lightbox Modal
  const [selectedRecord, setSelectedRecord] = useState<AplicleanRecord | null>(
    null
  );
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle: string;
  } | null>(null);

  // Canvas Digital Signature Pad Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const canCreate = hasPermission(currentRole, 'create_supervision');

  useEffect(() => {
    setRecords(loadAplicleanRecords());
    const handleUpdated = (e: Event) => {
      const customEv = e as CustomEvent<AplicleanRecord[]>;
      if (customEv.detail) {
        setRecords(customEv.detail);
      }
    };
    window.addEventListener('sikesling_apliclean_updated', handleUpdated);
    return () =>
      window.removeEventListener('sikesling_apliclean_updated', handleUpdated);
  }, []);

  const handleSelectModule = (nextModuleId: AplicleanModuleId) => {
    const cfg = getAplicleanModuleConfig(nextModuleId);
    setActiveModuleId(nextModuleId);
    setMatrixModuleScope(nextModuleId);
    setUnitName(cfg.defaultUnitName);
    setOfficerName(cfg.defaultOfficer);
    setSupervisorEvaluation(cfg.defaultEvaluation);
    setSaveSuccessMsg(null);
    setUploadError(null);
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setDayName(getIndonesianDayNameFromDate(nextDate));
  };

  // Signature Pad Handlers
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.strokeStyle = '#002147';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    isDrawingRef.current = true;
    setHasDrawnSignature(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureDataUrl('');
    setHasDrawnSignature(false);
  };

  // Task Status & Photo Handlers
  const updateTaskStatus = (key: AplicleanTaskKey, status: AplicleanTaskStatus) => {
    setTasks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status,
      },
    }));
  };

  const handleTaskPhotoUpload = (
    key: AplicleanTaskKey,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateFileUpload({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!check.valid) {
      setUploadError(
        check.error || 'File foto tidak valid (Maks 5MB, JPG/PNG/WebP)'
      );
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const def = activeModule.taskDefinitions.find((d) => d.key === key);

    setTasks((prev) => ({
      ...prev,
      [key]: {
        status:
          prev[key].status === 'BELUM' || !prev[key].status
            ? def?.defaultStatusText || 'DILAKUKAN'
            : prev[key].status,
        photoFileName: `${activeModule.code}_Images/${date} ${time}.${def?.photoColumnLabel || 'FOTO'}.${file.name}`,
        photoUrl: previewUrl,
      },
    }));

    e.target.value = '';
  };

  const removeTaskPhoto = (key: AplicleanTaskKey) => {
    setTasks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        photoFileName: '',
        photoUrl: '',
      },
    }));
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateFileUpload({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!check.valid) {
      setUploadError(check.error || 'File tanda tangan tidak valid');
      e.target.value = '';
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setSignatureDataUrl(previewUrl);
    setHasDrawnSignature(true);
    e.target.value = '';
  };

  const resetForm = () => {
    setDate('2026-10-31');
    setTime('10:30:00');
    setDayName(getIndonesianDayNameFromDate('2026-10-31'));
    setUnitName(activeModule.defaultUnitName);
    setOfficerName(activeModule.defaultOfficer);
    setSupervisorEvaluation(activeModule.defaultEvaluation);
    setTasks(createEmptyAplicleanTasks(true));
    clearSignature();
    setUploadError(null);
    setSaveSuccessMsg(null);
  };

  const handleSubmitApliclean = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setSaveSuccessMsg(null);

    const newRecord: AplicleanRecord = {
      id: `APC-${activeModule.id.slice(0, 3)}-${String(records.length + 1).padStart(3, '0')}`,
      moduleId: activeModuleId,
      timestamp: `${date} ${time}`,
      date,
      time,
      dayName: dayName || getIndonesianDayNameFromDate(date),
      unitName,
      officerName: officerName.trim() || activeModule.defaultOfficer,
      supervisorEvaluation:
        supervisorEvaluation.trim() || activeModule.defaultEvaluation,
      signatureFileName: hasDrawnSignature
        ? `${activeModule.code}_Images/${date} ${time}.TANDA TANGAN.png`
        : '',
      signatureUrl: signatureDataUrl,
      tasks: { ...tasks },
    };

    const nextRecords = [newRecord, ...records];
    setRecords(nextRecords);
    saveAplicleanRecords(nextRecords);

    // Also sync to global SIKESLING supervisions state so Dashboard, Riwayat & Laporan stay updated
    const prog = calculateAplicleanRecordProgress(newRecord);
    const completedNames = activeModule.taskDefinitions
      .filter(
        (d) =>
          newRecord.tasks[d.key].status === 'DILAKUKAN' ||
          newRecord.tasks[d.key].status === 'DILAKSANAKAN'
      )
      .map((d) => d.shortTitle);

    const pendingNames = activeModule.taskDefinitions
      .filter(
        (d) =>
          newRecord.tasks[d.key].status !== 'DILAKUKAN' &&
          newRecord.tasks[d.key].status !== 'DILAKSANAKAN'
      )
      .map((d) => d.shortTitle);

    const attachments: PhotoAttachmentMeta[] = activeModule.taskDefinitions
      .filter((d) => Boolean(newRecord.tasks[d.key].photoUrl))
      .map((d, idx) => ({
        id: `ATT-${Date.now()}-${idx}`,
        fileName:
          newRecord.tasks[d.key].photoFileName || `${d.photoColumnLabel}.jpg`,
        mimeType: 'image/jpeg',
        sizeBytes: 185000,
        caption: `${d.title} (${d.timeSlot})`,
        createdAt: new Date().toISOString(),
        previewUrl: newRecord.tasks[d.key].photoUrl,
      }));

    addSupervision({
      date,
      officerName: newRecord.officerName,
      roomOrUnit: unitName,
      category: `Ceklist Harian APLICLEAN (${activeModule.shortTitle})`,
      inspectionDetails: `Supervisi ${activeModule.title} (${prog.completedCount}/${prog.totalTasks} tugas selesai): ${completedNames.join(', ')}.`,
      findings:
        pendingNames.length > 0
          ? `Tugas belum ditandai selesai: ${pendingNames.join(', ')}`
          : '',
      recommendations: newRecord.supervisorEvaluation,
      priority: pendingNames.length > 2 ? 'Tinggi' : 'Sedang',
      attachments,
    });

    setSaveSuccessMsg(
      `Data Ceklist Supervisi ${activeModule.title} (${date} · ${dayName}) berhasil disimpan ke Tabel Rekap (${prog.completedCount}/7 item selesai).`
    );
    setActiveTab('matrix');
  };

  // Count per module for top module switcher badges
  const countsByModule = useMemo(() => {
    const map: Record<AplicleanModuleId, number> = {
      RAWAT_JALAN: 0,
      IGD: 0,
      RANAP: 0,
      ICU_IBS: 0,
      SUPERVISI: 0,
    };
    for (const r of records) {
      const m = r.moduleId || 'RAWAT_JALAN';
      map[m] = (map[m] || 0) + 1;
    }
    return map;
  }, [records]);

  // Records for the active module (used in KPIs)
  const moduleRecords = useMemo(
    () => records.filter((r) => (r.moduleId || 'RAWAT_JALAN') === activeModuleId),
    [records, activeModuleId]
  );

  // KPI Metrics for the active module
  const kpiStats = useMemo(() => {
    const totalRecords = moduleRecords.length;
    let totalPhotos = 0;
    let totalSignatures = 0;
    let totalCompletedTasks = 0;
    const totalPossibleTasks = totalRecords * 7;

    for (const rec of moduleRecords) {
      const prog = calculateAplicleanRecordProgress(rec);
      totalPhotos += prog.photoCount;
      totalCompletedTasks += prog.completedCount;
      if (rec.signatureUrl) {
        totalSignatures += 1;
      }
    }

    const avgCompliance =
      totalPossibleTasks > 0
        ? Math.round((totalCompletedTasks / totalPossibleTasks) * 100)
        : 0;

    return {
      totalRecords,
      totalPhotos,
      totalSignatures,
      avgCompliance,
    };
  }, [moduleRecords]);

  // Filtered records for Matrix & Gallery
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const recMod = rec.moduleId || 'RAWAT_JALAN';
      if (matrixModuleScope !== 'ALL' && recMod !== matrixModuleScope) {
        return false;
      }
      if (filterMonth !== 'ALL' && !rec.date.startsWith(filterMonth)) {
        return false;
      }
      if (filterDay !== 'ALL' && rec.dayName !== filterDay) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDate = rec.date.toLowerCase().includes(q);
        const matchDay = rec.dayName.toLowerCase().includes(q);
        const matchOfficer = rec.officerName.toLowerCase().includes(q);
        const matchUnit = rec.unitName.toLowerCase().includes(q);
        if (!matchDate && !matchDay && !matchOfficer && !matchUnit) {
          return false;
        }
      }
      return true;
    });
  }, [records, matrixModuleScope, filterMonth, filterDay, searchQuery]);

  // Flatten all photos for Gallery tab
  const galleryItems = useMemo(() => {
    const items: {
      id: string;
      recordId: string;
      moduleId: AplicleanModuleId;
      date: string;
      time: string;
      dayName: string;
      unitName: string;
      officerName: string;
      taskTitle: string;
      timeSlot: string;
      photoUrl: string;
      photoFileName: string;
      isSignature?: boolean;
    }[] = [];

    for (const rec of filteredRecords) {
      const modCfg = getAplicleanModuleConfig(rec.moduleId || 'RAWAT_JALAN');
      for (const def of modCfg.taskDefinitions) {
        const entry = rec.tasks[def.key];
        if (entry && entry.photoUrl) {
          items.push({
            id: `${rec.id}-${def.key}`,
            recordId: rec.id,
            moduleId: rec.moduleId || 'RAWAT_JALAN',
            date: rec.date,
            time: rec.time,
            dayName: rec.dayName,
            unitName: rec.unitName,
            officerName: rec.officerName,
            taskTitle: def.title,
            timeSlot: def.timeSlot,
            photoUrl: entry.photoUrl,
            photoFileName: entry.photoFileName,
          });
        }
      }
      if (rec.signatureUrl) {
        items.push({
          id: `${rec.id}-signature`,
          recordId: rec.id,
          moduleId: rec.moduleId || 'RAWAT_JALAN',
          date: rec.date,
          time: rec.time,
          dayName: rec.dayName,
          unitName: rec.unitName,
          officerName: rec.officerName,
          taskTitle: 'TANDA TANGAN PETUGAS / SUPERVISOR',
          timeSlot: 'Validasi Harian',
          photoUrl: rec.signatureUrl,
          photoFileName: rec.signatureFileName,
          isSignature: true,
        });
      }
    }

    return items;
  }, [filteredRecords]);

  // Current form completion progress
  const currentFormProgress = useMemo(() => {
    let done = 0;
    let photos = 0;
    for (const def of activeModule.taskDefinitions) {
      const t = tasks[def.key];
      if (t.status === 'DILAKUKAN' || t.status === 'DILAKSANAKAN') done += 1;
      if (t.photoUrl) photos += 1;
    }
    return { done, photos, total: 7, pct: Math.round((done / 7) * 100) };
  }, [tasks, activeModule]);

  const getModuleIcon = (modId: AplicleanModuleId, className = 'w-4 h-4') => {
    switch (modId) {
      case 'RAWAT_JALAN':
        return <Building2 className={className} />;
      case 'IGD':
        return <Activity className={className} />;
      case 'RANAP':
        return <BedDouble className={className} />;
      case 'ICU_IBS':
        return <HeartPulse className={className} />;
      case 'SUPERVISI':
        return <ShieldCheck className={className} />;
    }
  };

  const getTaskIcon = (key: AplicleanTaskKey) => {
    switch (key) {
      case 'tugasRutin':
        return <Sparkles className="w-4 h-4" />;
      case 'wastafel':
        return <Droplets className="w-4 h-4" />;
      case 'kacaPendaftaranFarmasi':
        return <Building2 className="w-4 h-4" />;
      case 'wcPasien':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'kacaDepanPoli':
        return <Eye className="w-4 h-4" />;
      case 'tamanDepanPoli':
        return <Trees className="w-4 h-4" />;
      case 'alkes':
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  // Matrix table column definitions (either activeModule or selected matrixModuleScope)
  const matrixColumnDefs: AplicleanTaskDefinition[] = useMemo(() => {
    if (matrixModuleScope === 'ALL') {
      return activeModule.taskDefinitions;
    }
    return getAplicleanModuleConfig(matrixModuleScope).taskDefinitions;
  }, [matrixModuleScope, activeModule]);

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-7 py-4 space-y-4">
      {/* =====================================================================
          5-MODULE SELECTOR BAR (RAWAT JALAN | IGD | RANAP | ICU & IBS | SUPERVISI)
         ===================================================================== */}
      <section
        aria-label="Pilih Modul Ruangan APLICLEAN"
        className="rounded-[24px] bg-gradient-to-r from-[#002147] via-[#002B5B] to-[#001835] p-3 sm:p-4 border border-[#D2B48C]/40 shadow-[0_14px_34px_rgba(0,33,71,0.18)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D2B48C]/20 border border-[#D2B48C]/40 flex items-center justify-center text-[#D2B48C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#D2B48C]">
                INTEGRASI PENUH 5 MODUL APLICLEAN · UOBK RSUD AL-MULK
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Pilih Area Ruangan atau Lembar Supervisi Kesling
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#FAF6F0]/85">
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
              Total Seluruh Area: <strong className="text-[#D2B48C]">{records.length}</strong> Laporan
            </span>
            <Link
              href="/supervisi/dashboard"
              className="px-3 py-1 rounded-full bg-[#D2B48C] text-[#002147] font-bold hover:bg-[#E5CDAE] transition-colors"
            >
              Ringkasan 5 Unit →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {APICLEAN_MODULES.map((mod, idx) => {
            const isSelected = activeModuleId === mod.id;
            const modCount = countsByModule[mod.id] || 0;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.id)}
                className={`group text-left rounded-2xl p-3 transition-all cursor-pointer border flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#FAF6F0] via-white to-[#F5EDE0] text-[#002147] border-[#D2B48C] shadow-[0_8px_24px_rgba(0,0,0,0.22)] scale-[1.01]'
                    : 'bg-white/[0.07] hover:bg-white/[0.13] text-white border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#002147] text-[#D2B48C]'
                        : 'bg-white/10 text-[#D2B48C] group-hover:bg-white/20'
                    }`}
                  >
                    {getModuleIcon(mod.id, 'w-4 h-4')}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                      isSelected
                        ? 'bg-[#002147]/10 text-[#002147]'
                        : 'bg-white/10 text-[#D2B48C]'
                    }`}
                  >
                    {modCount} Rekap
                  </span>
                </div>

                <div>
                  <div
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isSelected ? 'text-[#8B6B43]' : 'text-[#D2B48C]/80'
                    }`}
                  >
                    MODUL 0{idx + 1}
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${
                      isSelected ? 'text-[#002147]' : 'text-white'
                    }`}
                  >
                    {mod.shortTitle}
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isSelected ? 'text-slate-600' : 'text-slate-300/80'
                    }`}
                  >
                    PIC: {mod.defaultOfficer}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          HEADER BANNER & TAB SWITCHER FOR ACTIVE MODULE
         ===================================================================== */}
      <header className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/95 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#002147]/95 backdrop-blur-xl border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/25 shadow-[0_14px_36px_rgba(0,33,71,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/dashboard"
                className="font-semibold text-slate-500 hover:text-[#002147] dark:text-slate-400 dark:hover:text-[#D2B48C]"
              >
                SIKRESMI
              </Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <Link
                href="/supervisi"
                className="font-semibold text-slate-500 hover:text-[#002147] dark:text-slate-400 dark:hover:text-[#D2B48C]"
              >
                Supervisi Lingkungan
              </Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-bold text-[#002147] dark:text-[#D2B48C]">
                {activeModule.title}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#002147] text-[#D2B48C] border border-[#D2B48C]/40">
                <Sparkles className="w-3 h-3" />
                {activeModule.code}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#002147] dark:text-white">
              {activeModule.reportHeader}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl">
              {activeModule.subtitle}
            </p>
          </div>

          {/* 3-Mode Workspace Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#F5EDE0] dark:bg-[#001229] border border-[#D2B48C]/55 dark:border-slate-800 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'input'
                  ? 'bg-[#002147] text-white shadow-sm dark:bg-[#D2B48C] dark:text-[#002147]'
                  : 'text-[#002147] hover:bg-[#EADBC8]/70 dark:text-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Ceklist ({activeModule.shortTitle})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#002147] text-white shadow-sm dark:bg-[#D2B48C] dark:text-[#002147]'
                  : 'text-[#002147] hover:bg-[#EADBC8]/70 dark:text-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabel Rekap ({filteredRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#002147] text-white shadow-sm dark:bg-[#D2B48C] dark:text-[#002147]'
                  : 'text-[#002147] hover:bg-[#EADBC8]/70 dark:text-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Galeri Foto & TTD ({galleryItems.length})</span>
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Strip for Active Module */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#D2B48C]/35 dark:border-slate-800/80">
          <div className="rounded-2xl bg-[#FAF6F0] dark:bg-[#001229]/90 border border-[#D2B48C]/45 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rekap {activeModule.shortTitle}
              </div>
              <div className="text-lg font-extrabold text-[#002147] dark:text-white font-mono">
                {kpiStats.totalRecords}{' '}
                <span className="text-xs font-semibold text-slate-500">Hari</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF6F0] dark:bg-[#001229]/90 border border-[#D2B48C]/45 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bukti Foto {activeModule.shortTitle}
              </div>
              <div className="text-lg font-extrabold text-[#002147] dark:text-white font-mono">
                {kpiStats.totalPhotos}{' '}
                <span className="text-xs font-semibold text-slate-500">Foto</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF6F0] dark:bg-[#001229]/90 border border-[#D2B48C]/45 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kepatuhan Tugas Rutin
              </div>
              <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                {kpiStats.avgCompliance}%{' '}
                <span className="text-xs font-semibold text-slate-500">SOP</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF6F0] dark:bg-[#001229]/90 border border-[#D2B48C]/45 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tanda Tangan Valid
              </div>
              <div className="text-lg font-extrabold text-[#002147] dark:text-white font-mono">
                {kpiStats.totalSignatures}{' '}
                <span className="text-xs font-semibold text-slate-500">TTD</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Feedback Banner */}
      {saveSuccessMsg && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/70 px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="p-1 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/40"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/70 px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold text-rose-900 dark:text-rose-200">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="p-1 rounded-lg hover:bg-rose-200/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          TAB 1: FORM INPUT CEKLIST SUPERVISI (7 ITEM + FOTO + TANDA TANGAN)
         ===================================================================== */}
      {activeTab === 'input' && (
        <form onSubmit={handleSubmitApliclean} className="space-y-4">
          {/* Card 1: Identitas Waktu, Ruangan & Petugas */}
          <section className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/25 shadow-[0_12px_32px_rgba(0,33,71,0.07)] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3.5 mb-4 border-b border-[#D2B48C]/35 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#002147] dark:text-white">
                    Identitas Waktu, Unit ({activeModule.shortTitle}) & Petugas Pelaksana
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sesuai kolom TANGGAL, HARI, RUANGAN, PETUGAS, dan EVALUASI SUPERVISOR pada instrumen {activeModule.code}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5EDE0] dark:bg-[#002147] border border-[#D2B48C]/60 text-xs font-bold text-[#002147] dark:text-[#D2B48C]">
                <span>Progres Ceklist:</span>
                <span className="font-mono">
                  {currentFormProgress.done}/7 Selesai ({currentFormProgress.pct}%)
                </span>
                <span>·</span>
                <span className="font-mono">{currentFormProgress.photos} Foto</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
              {/* Tanggal */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                  Tanggal Supervisi *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-white dark:bg-[#001229] text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Jam */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                  Jam Pencatatan *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    step="1"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold font-mono rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-white dark:bg-[#001229] text-[#002147] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              {/* Hari (Otomatis / Bisa Disesuaikan) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                  Hari Pelaksanaan *
                </label>
                <select
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0] dark:bg-[#001229] text-[#002147] dark:text-[#D2B48C] focus:outline-none"
                >
                  {['SENIN', 'SELASA', 'RABU', 'KAMIS', "JUM'AT", 'SABTU', 'MINGGU'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Sub-Unit / Area Ruangan */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                  Unit / Area {activeModule.shortTitle} *
                </label>
                <select
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-white dark:bg-[#001229] text-[#002147] dark:text-white focus:outline-none"
                >
                  {activeModule.subUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Petugas */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                  Petugas Pelaksana *
                </label>
                <input
                  type="text"
                  list="apliclean-officers-list"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="Ketik atau pilih nama petugas..."
                  required
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-white dark:bg-[#001229] text-[#002147] dark:text-white focus:outline-none"
                />
                <datalist id="apliclean-officers-list">
                  {activeModule.officerOptions.map((off) => (
                    <option key={off} value={off} />
                  ))}
                  {masterOfficers
                    .filter((o) => o.isActive)
                    .map((o) => (
                      <option key={o.id} value={o.name.toUpperCase()} />
                    ))}
                </datalist>
              </div>

              {/* Evaluasi Supervisor */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#002147] dark:text-[#D2B48C]">
                  Evaluasi Supervisor
                </label>
                <input
                  type="text"
                  value={supervisorEvaluation}
                  onChange={(e) => setSupervisorEvaluation(e.target.value)}
                  placeholder="Catatan verifikasi supervisor..."
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-white dark:bg-[#001229] text-[#002147] dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 2: 7 Item Checklist Kebersihan Harian + Upload Foto per Item */}
          <section className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/25 shadow-[0_12px_32px_rgba(0,33,71,0.07)] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3.5 mb-4 border-b border-[#D2B48C]/35 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#002147] dark:text-white">
                    Daftar 7 Ceklist Kebersihan Harian & Dokumentasi Foto ({activeModule.shortTitle})
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih status pelaksanaan (DILAKUKAN / DILAKSANAKAN / BELUM) dan lampirkan foto bukti pada setiap titik
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTasks(createEmptyAplicleanTasks(true))}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Tandai Semua Selesai
                </button>
                <button
                  type="button"
                  onClick={() => setTasks(createEmptyAplicleanTasks(false))}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Kosongkan Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {activeModule.taskDefinitions.map((def) => {
                const entry = tasks[def.key];
                const isDone =
                  entry.status === 'DILAKUKAN' || entry.status === 'DILAKSANAKAN';

                return (
                  <div
                    key={def.key}
                    className={`rounded-2xl border p-3.5 transition-all flex flex-col justify-between gap-3 ${
                      isDone
                        ? 'bg-[#FAF6F0]/90 dark:bg-[#001229]/90 border-[#D2B48C]/75 dark:border-[#D2B48C]/35 shadow-xs'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top: Task Title & Shift Time Badge */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isDone
                                ? 'bg-[#002147] text-[#D2B48C]'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {getTaskIcon(def.key)}
                          </div>
                          <span className="text-[11px] font-extrabold font-mono text-slate-400">
                            #{def.no}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#002147]/10 dark:bg-[#D2B48C]/15 text-[#002147] dark:text-[#D2B48C] text-[10px] font-bold font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {def.timeSlot}
                        </span>
                      </div>

                      <h3 className="text-xs font-extrabold text-[#002147] dark:text-white leading-snug">
                        {def.title}
                      </h3>

                      {/* Status Toggle Buttons matching exact CSV terms */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(def.key, 'DILAKUKAN')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            entry.status === 'DILAKUKAN'
                              ? 'bg-[#002147] text-[#D2B48C] shadow-xs ring-1 ring-[#D2B48C]/60'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[#F5EDE0]'
                          }`}
                        >
                          {entry.status === 'DILAKUKAN' && (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                          DILAKUKAN
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTaskStatus(def.key, 'DILAKSANAKAN')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            entry.status === 'DILAKSANAKAN'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          {entry.status === 'DILAKSANAKAN' && (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                          DILAKSANAKAN
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTaskStatus(def.key, 'BELUM')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            entry.status === 'BELUM' || !entry.status
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          BELUM
                        </button>
                      </div>
                    </div>

                    {/* Bottom: Photo Upload / Preview */}
                    <div className="pt-2 border-t border-[#D2B48C]/30 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {def.photoColumnLabel}
                        </span>
                        {entry.photoUrl && (
                          <button
                            type="button"
                            onClick={() => removeTaskPhoto(def.key)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </button>
                        )}
                      </div>

                      {entry.photoUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-[#D2B48C]/60 bg-slate-900 h-28">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={entry.photoUrl}
                            alt={def.photoColumnLabel}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end justify-between p-2">
                            <span className="text-[10px] font-mono text-white truncate max-w-[80%]">
                              {entry.photoFileName}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: entry.photoUrl,
                                  title: def.title,
                                  subtitle: `${date} · ${unitName} · ${officerName}`,
                                })
                              }
                              className="p-1.5 rounded-lg bg-white/90 text-[#002147] hover:bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 w-full h-16 rounded-xl border border-dashed border-[#D2B48C] dark:border-slate-700 bg-white/75 dark:bg-[#001835]/60 hover:bg-[#F5EDE0]/70 dark:hover:bg-[#002147] text-xs font-bold text-[#002147] dark:text-[#D2B48C] cursor-pointer transition-colors">
                          <Camera className="w-4 h-4" />
                          <span>Ambil / Unggah {def.photoColumnLabel}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleTaskPhotoUpload(def.key, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Card 3: Tanda Tangan Digital Petugas & Tombol Simpan */}
          <section className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/90 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/25 shadow-[0_12px_32px_rgba(0,33,71,0.07)] p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center font-bold text-xs">
                      03
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-[#002147] dark:text-white">
                        Tanda Tangan Validasi ({activeModule.shortTitle})
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Goreskan tanda tangan langsung pada kanvas atau unggah file tanda tangan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 rounded-lg bg-[#F5EDE0] dark:bg-[#002147] text-[11px] font-bold text-[#002147] dark:text-[#D2B48C] hover:bg-[#EADBC8] cursor-pointer">
                      Upload PNG/JPG
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleSignatureFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    >
                      <Eraser className="w-3 h-3" />
                      Bersihkan
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border-[1.5px] border-[#D2B48C]/70 dark:border-slate-700 bg-white overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={540}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    className="w-full h-[120px] cursor-crosshair touch-none"
                  />
                  {!hasDrawnSignature && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-400">
                      Tanda tangan petugas ({officerName}) di area ini...
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Box */}
              <div className="lg:col-span-5 rounded-2xl bg-[#002147] text-white p-4 sm:p-5 border border-[#D2B48C]/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D2B48C]">
                    Ringkasan Pengiriman {activeModule.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D2B48C]/20 text-[#D2B48C] text-[10px] font-bold">
                    {dayName}, {date}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Unit / Area Ruangan:</span>
                    <span className="font-bold text-white">{unitName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Petugas Pelaksana:</span>
                    <span className="font-bold text-[#D2B48C]">{officerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Ceklist Selesai:</span>
                    <span className="font-bold text-emerald-400">
                      {currentFormProgress.done} dari 7 Tugas ({currentFormProgress.pct}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Lampiran Foto & TTD:</span>
                    <span className="font-bold text-white">
                      {currentFormProgress.photos} Foto ·{' '}
                      {hasDrawnSignature ? 'TTD Terlampir' : 'Tanpa TTD'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!canCreate}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D2B48C] hover:bg-[#E5CDAE] text-[#002147] text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Ceklist {activeModule.shortTitle}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </form>
      )}

      {/* =====================================================================
          TAB 2: TABEL REKAPITULASI APLICLEAN (MATRIKS 7 TUGAS + FOTO + TTD)
         ===================================================================== */}
      {activeTab === 'matrix' && (
        <section className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/95 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/25 shadow-[0_14px_38px_rgba(0,33,71,0.08)] overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-[#D2B48C]/35 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white uppercase">
                {matrixModuleScope === 'ALL'
                  ? 'REKAPITULASI GABUNGAN SELURUH MODUL APLICLEAN (RAWAT JALAN, IGD, RANAP, ICU & IBS, SUPERVISI)'
                  : getAplicleanModuleConfig(matrixModuleScope).reportHeader}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                UOBK RSUD AL-MULK KOTA SUKABUMI · Menampilkan {filteredRecords.length}{' '}
                rekaman supervisi beserta foto & tanda tangan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Modul Ruangan */}
              <select
                aria-label="Filter Modul Ruangan"
                value={matrixModuleScope}
                onChange={(e) => {
                  const val = e.target.value as AplicleanModuleId | 'ALL';
                  setMatrixModuleScope(val);
                  if (val !== 'ALL') {
                    setActiveModuleId(val);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-[#002147] text-[#D2B48C]"
              >
                <option value="ALL">Semua Modul Unit ({records.length})</option>
                {APICLEAN_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({countsByModule[m.id] || 0})
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tanggal, hari, unit, petugas..."
                  className="pl-8 pr-3 py-1.5 text-xs font-semibold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-white dark:bg-[#001229] text-[#002147] dark:text-white focus:outline-none"
                />
              </div>

              <select
                aria-label="Filter Bulan"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0] dark:bg-[#001229] text-[#002147] dark:text-[#D2B48C]"
              >
                <option value="ALL">Semua Bulan (2026)</option>
                <option value="2026-03">Maret 2026</option>
                <option value="2026-04">April 2026</option>
                <option value="2026-05">Mei 2026</option>
                <option value="2026-07">Juli 2026</option>
                <option value="2026-08">Agustus 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">Oktober 2026</option>
              </select>

              <select
                aria-label="Filter Hari"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0] dark:bg-[#001229] text-[#002147] dark:text-[#D2B48C]"
              >
                <option value="ALL">Semua Hari</option>
                {['SENIN', 'SELASA', 'RABU', 'KAMIS', "JUM'AT", 'SABTU'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1060px]">
              <thead>
                <tr className="bg-[#002147] text-white text-[10px] font-extrabold uppercase tracking-wider border-b border-[#D2B48C]/40">
                  <th className="py-3 px-2 text-center w-9">No</th>
                  <th className="py-3 px-2.5 w-36">Tanggal & Unit</th>
                  <th className="py-3 px-2 text-center w-16">Hari</th>
                  {matrixColumnDefs.map((def) => (
                    <th
                      key={def.key}
                      className="py-3 px-1.5 text-center border-l border-white/10"
                    >
                      <div className="text-[#D2B48C] leading-tight">
                        {def.shortTitle}
                      </div>
                      <div className="text-[9px] font-mono font-normal text-slate-300 mt-0.5">
                        ({def.timeSlot})
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center border-l border-white/10 w-24">
                    Petugas
                  </th>
                  <th className="py-3 px-2 text-center border-l border-white/10 w-20">
                    TTD
                  </th>
                  <th className="py-3 px-2 text-center border-l border-white/10 w-16">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2B48C]/30 dark:divide-slate-800 text-xs">
                {filteredRecords.map((rec, index) => {
                  const prog = calculateAplicleanRecordProgress(rec);
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#FAF6F0]/90 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-500">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <div className="font-extrabold text-[#002147] dark:text-white font-mono">
                          {rec.date}
                        </div>
                        <div className="text-[10px] font-bold text-[#8B6B43] dark:text-[#D2B48C] truncate max-w-[135px]">
                          {rec.unitName}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F5EDE0] dark:bg-[#002147] text-[#002147] dark:text-[#D2B48C] text-[10px] font-extrabold">
                          {rec.dayName}
                        </span>
                      </td>

                      {matrixColumnDefs.map((def) => {
                        const entry = rec.tasks[def.key];
                        const isDone =
                          entry.status === 'DILAKUKAN' ||
                          entry.status === 'DILAKSANAKAN' ||
                          Boolean(entry.photoUrl);

                        return (
                          <td
                            key={def.key}
                            className="py-2 px-1.5 text-center border-l border-[#D2B48C]/20 dark:border-slate-800/80 align-middle"
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              {isDone ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  {entry.status || 'SELESAI'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">
                                  —
                                </span>
                              )}

                              {entry.photoUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLightboxImage({
                                      url: entry.photoUrl,
                                      title: `${def.title} (${def.timeSlot})`,
                                      subtitle: `${rec.date} (${rec.dayName}) · ${rec.unitName} · Petugas: ${rec.officerName}`,
                                    })
                                  }
                                  className="group relative w-11 h-8 rounded-md overflow-hidden border border-[#D2B48C] shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                                  title={`Lihat ${def.photoColumnLabel}`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={entry.photoUrl}
                                    alt={def.shortTitle}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-2 text-center border-l border-[#D2B48C]/20 dark:border-slate-800/80">
                        <div className="text-[10px] font-extrabold text-[#002147] dark:text-[#D2B48C] leading-tight">
                          {rec.officerName}
                        </div>
                        <div className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {prog.completedCount}/7 Tugas
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center border-l border-[#D2B48C]/20 dark:border-slate-800/80">
                        {rec.signatureUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: rec.signatureUrl,
                                title: 'TANDA TANGAN PETUGAS / SUPERVISOR',
                                subtitle: `${rec.date} (${rec.dayName}) · ${rec.unitName} · ${rec.officerName}`,
                              })
                            }
                            className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-white border border-[#D2B48C] p-0.5 hover:scale-105 transition-transform cursor-pointer"
                            title="Lihat Tanda Tangan"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rec.signatureUrl}
                              alt="Tanda Tangan"
                              loading="lazy"
                              className="w-full h-full object-contain"
                            />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 text-center border-l border-[#D2B48C]/20 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(rec)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#003166] text-[10px] font-bold cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Buka</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 3: GALERI BUKTI FOTO & TANDA TANGAN APLICLEAN
         ===================================================================== */}
      {activeTab === 'gallery' && (
        <section className="space-y-4">
          <div className="rounded-[26px] bg-gradient-to-br from-white/95 via-white/90 to-[#FAF6F0]/95 dark:from-[#001835]/95 dark:via-[#00152E]/90 dark:to-[#001835]/95 border-[1.5px] border-[#D2B48C]/50 dark:border-[#D2B48C]/25 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#002147] dark:text-white">
                Galeri Dokumentasi Foto & Tanda Tangan ({matrixModuleScope === 'ALL' ? 'Semua Unit' : activeModule.title})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {galleryItems.length} lampiran visual terekam dari pelaksanaan supervisi kebersihan harian
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Modul Galeri"
                value={matrixModuleScope}
                onChange={(e) => {
                  const val = e.target.value as AplicleanModuleId | 'ALL';
                  setMatrixModuleScope(val);
                  if (val !== 'ALL') setActiveModuleId(val);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-[#002147] text-[#D2B48C]"
              >
                <option value="ALL">Semua Modul Unit</option>
                {APICLEAN_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter Bulan Galeri"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#D2B48C]/60 dark:border-slate-700 bg-[#FAF6F0] dark:bg-[#001229] text-[#002147] dark:text-[#D2B48C]"
              >
                <option value="ALL">Semua Bulan (2026)</option>
                <option value="2026-03">Maret 2026</option>
                <option value="2026-04">April 2026</option>
                <option value="2026-05">Mei 2026</option>
                <option value="2026-07">Juli 2026</option>
                <option value="2026-08">Agustus 2026</option>
                <option value="2026-09">September 2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setLightboxImage({
                    url: item.photoUrl,
                    title: item.taskTitle,
                    subtitle: `${item.date} (${item.dayName}) · ${item.unitName} · ${item.officerName}`,
                  })
                }
                className="group rounded-2xl bg-white dark:bg-[#001835] border border-[#D2B48C]/55 dark:border-slate-800 shadow-xs hover:shadow-md overflow-hidden cursor-pointer transition-all flex flex-col justify-between"
              >
                <div
                  className={`relative h-36 w-full overflow-hidden ${
                    item.isSignature ? 'bg-white p-3' : 'bg-slate-900'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photoUrl}
                    alt={item.taskTitle}
                    loading="lazy"
                    className={`w-full h-full ${
                      item.isSignature
                        ? 'object-contain'
                        : 'object-cover group-hover:scale-105 transition-transform duration-300'
                    }`}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#002147]/85 text-[#D2B48C] text-[10px] font-bold font-mono">
                    {item.date}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/65 text-white text-[9px] font-bold">
                    {item.unitName}
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <div className="text-[11px] font-extrabold text-[#002147] dark:text-white line-clamp-1">
                    {item.taskTitle}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-[#8B6B43] dark:text-[#D2B48C] truncate">
                      {item.officerName}
                    </span>
                    <span className="font-mono">{item.timeSlot}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          MODAL RINCIAN REKAMAN HARIAN APLICLEAN
         ===================================================================== */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-[#FAF6F0] dark:bg-[#001835] border-2 border-[#D2B48C] rounded-[28px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#D2B48C]/40 pb-3">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6B43] dark:text-[#D2B48C]">
                  {getAplicleanModuleConfig(selectedRecord.moduleId || 'RAWAT_JALAN').reportHeader}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#002147] dark:text-white">
                  {selectedRecord.dayName}, {selectedRecord.date} · Pukul{' '}
                  {selectedRecord.time}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Unit: <strong>{selectedRecord.unitName}</strong> · Petugas:{' '}
                  <strong>{selectedRecord.officerName}</strong> · Evaluasi:{' '}
                  <strong>{selectedRecord.supervisorEvaluation}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-full bg-[#002147] text-[#D2B48C] hover:bg-[#003166] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getAplicleanModuleConfig(
                selectedRecord.moduleId || 'RAWAT_JALAN'
              ).taskDefinitions.map((def) => {
                const entry = selectedRecord.tasks[def.key];
                const isDone =
                  entry.status === 'DILAKUKAN' ||
                  entry.status === 'DILAKSANAKAN' ||
                  Boolean(entry.photoUrl);

                return (
                  <div
                    key={def.key}
                    className="rounded-2xl bg-white dark:bg-[#001229] border border-[#D2B48C]/50 p-3 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Tugas #{def.no}</span>
                        <span>{def.timeSlot}</span>
                      </div>
                      <div className="text-xs font-extrabold text-[#002147] dark:text-white mt-0.5">
                        {def.title}
                      </div>
                      <div className="mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            isDone
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isDone ? entry.status || 'DILAKUKAN' : 'BELUM TERCATAT'}
                        </span>
                      </div>
                    </div>

                    {entry.photoUrl ? (
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: entry.photoUrl,
                            title: def.title,
                            subtitle: `${selectedRecord.date} · ${selectedRecord.unitName} · ${selectedRecord.officerName}`,
                          })
                        }
                        className="rounded-xl overflow-hidden border border-[#D2B48C] h-32 bg-slate-900 cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.photoUrl}
                          alt={def.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="h-20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-400">
                        Tidak ada lampiran foto
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Signature Card inside Modal */}
              {selectedRecord.signatureUrl && (
                <div className="rounded-2xl bg-white border border-[#D2B48C]/60 p-3 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6B43]">
                      Validasi Petugas / Supervisor
                    </div>
                    <div className="text-xs font-extrabold text-[#002147]">
                      Tanda Tangan Digital
                    </div>
                  </div>
                  <div className="h-28 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedRecord.signatureUrl}
                      alt="Tanda Tangan"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LIGHTBOX MODAL UNTUK ZOOM FOTO BUKTI & TTD
         ===================================================================== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white dark:bg-[#001835] border-2 border-[#D2B48C] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#002147] text-white">
              <div>
                <div className="text-xs font-extrabold text-[#D2B48C]">
                  {lightboxImage.title}
                </div>
                <div className="text-[11px] text-slate-300">
                  {lightboxImage.subtitle}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[68vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
