'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Eraser,
  FileSpreadsheet,
  LayoutGrid,
  Lock,
  LockOpen,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import {
  CRITERIA_QUICK_OPTIONS,
  HARI_OPTIONS,
  HariValue,
  RoomChecklistRecord,
  RoomChecklistTaskEntry,
  SUPERVISI_CARDS,
  SUPERVISOR_OPTIONS,
  ScoreValue,
  SupervisiAuditRecord,
  SupervisiCardConfig,
  SupervisiCardId,
  TaskStatusValue,
  buildTimestampFromParts,
  calculateRoomChecklistProgress,
  calculateSupervisiScores,
  createDefaultTaskEntriesForCard,
  createInitialRoomChecklistRecords,
  createInitialSupervisiAuditRecords,
  getHariFromDateInput,
  loadRoomChecklistRecords,
  loadSupervisiAuditRecords,
  parseTimestampToParts,
  saveRoomChecklistRecords,
  saveSupervisiAuditRecords,
  scaleCanvasCoordinates,
} from '@/lib/supervisi-hub';

interface SupervisiHubWorkspaceProps {
  initialMode?: 'cards' | 'form' | 'table';
  initialCardId?: SupervisiCardId;
}

const SAMPLE_TEMUAN_PHOTOS = [
  {
    label: 'Foto 1 (Area Pipa/Lantai)',
    url: '/assets/aistudio/supervisi-temuan/temuan-1.png',
  },
  {
    label: 'Foto 2 (Dinding/Permukaan)',
    url: '/assets/aistudio/supervisi-temuan/temuan-2.png',
  },
  {
    label: 'Foto 3 (Langit-Langit/Kaca)',
    url: '/assets/aistudio/supervisi-temuan/temuan-3.png',
  },
  {
    label: 'Foto 4 (Koridor/Poli)',
    url: '/assets/aistudio/supervisi-temuan/temuan-4.png',
  },
  {
    label: 'Foto 5 (Wastafel/Sanitasi)',
    url: '/assets/aistudio/supervisi-temuan/temuan-5.png',
  },
];

const SAMPLE_SIGNATURES = [
  '/assets/aistudio/supervisi-temuan/ttd-1.png',
  '/assets/aistudio/supervisi-temuan/ttd-2.png',
  '/assets/aistudio/supervisi-temuan/ttd-3.png',
  '/assets/aistudio/supervisi-temuan/ttd-4.png',
  '/assets/aistudio/supervisi-temuan/ttd-5.png',
];

const EVALUASI_QUICK_TEMPLATES = [
  'Seluruh tahapan pembersihan ruangan telah dilaksanakan sesuai SOP Kesling.',
  'Kondisi lantai, kaca, wastafel, dan kamar mandi bersih, kering, serta bebas bau.',
  'Peralatan medis (alkes) dan area kerja bersih; perlu dipertahankan.',
];

function formatNowTimestamp(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

function getCurrentHariIndonesia(): HariValue {
  const dayIdx = new Date().getDay(); // 0 = Sunday
  const map: Record<number, HariValue> = {
    0: 'MINGGU',
    1: 'SENIN',
    2: 'SELASA',
    3: 'RABU',
    4: 'KAMIS',
    5: 'JUMAT',
    6: 'SABTU',
  };
  return map[dayIdx] || 'SENIN';
}

export function SupervisiHubWorkspace({
  initialMode = 'cards',
  initialCardId = 'SUPERVISI',
}: SupervisiHubWorkspaceProps) {
  const [mode, setMode] = useState<'cards' | 'form' | 'table'>(initialMode);
  const [activeCardId, setActiveCardId] =
    useState<SupervisiCardId>(initialCardId);

  // Records state for both Room Checklists (9 rooms) and Supervisi Audit (10th card)
  const [roomRecords, setRoomRecords] = useState<RoomChecklistRecord[]>(() =>
    createInitialRoomChecklistRecords()
  );
  const [auditRecords, setAuditRecords] = useState<SupervisiAuditRecord[]>(() =>
    createInitialSupervisiAuditRecords()
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const activeCardConfig: SupervisiCardConfig = useMemo(() => {
    return (
      SUPERVISI_CARDS.find((c) => c.id === activeCardId) ||
      SUPERVISI_CARDS[SUPERVISI_CARDS.length - 1]
    );
  }, [activeCardId]);

  // =========================================================================
  // STATE FOR ROOM CHECKLIST FORM (9 ROOM CARDS: RAWAT JALAN .. HALAMAN)
  // =========================================================================
  const [roomTanggal, setRoomTanggal] = useState<string>(
    '01/11/2026 08:30:00'
  );
  const [roomHari, setRoomHari] = useState<HariValue>('SENIN');
  const [roomTaskEntries, setRoomTaskEntries] = useState<
    Record<string, RoomChecklistTaskEntry>
  >(() =>
    createDefaultTaskEntriesForCard(
      SUPERVISI_CARDS.find((c) => c.id === initialCardId) || SUPERVISI_CARDS[0],
      false
    )
  );
  const [roomPetugas, setRoomPetugas] = useState<string>('');
  const [roomEvaluasi, setRoomEvaluasi] = useState<string>('');
  const [roomSignatures, setRoomSignatures] = useState<string[]>(['']);
  const [activeRoomSigSlot, setActiveRoomSigSlot] = useState<number>(0);
  const [isRoomSigUnlocked, setIsRoomSigUnlocked] = useState<boolean>(true);
  const [isDrawingRoomSig, setIsDrawingRoomSig] = useState<boolean>(false);
  const roomSigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const roomSigLastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Hidden file input for any room task photo slot
  const roomPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingPhotoTarget, setPendingPhotoTarget] = useState<{
    taskId: string;
    slotIdx: number;
  } | null>(null);

  // =========================================================================
  // STATE FOR SUPERVISI AUDIT FORM (10TH CARD: SUPERVISI)
  // =========================================================================
  const [tanggal, setTanggal] = useState<string>('01/11/2026 16:55:01');
  const [supervisor, setSupervisor] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [namaPetugas, setNamaPetugas] = useState<string>('');
  const [kerapihan, setKerapihan] = useState<string>('');
  const [skorKerapihan, setSkorKerapihan] = useState<ScoreValue>(null);
  const [prosedur, setProsedur] = useState<string>('');
  const [skorProsedur, setSkorProsedur] = useState<ScoreValue>(null);
  const [alatDanBahan, setAlatDanBahan] = useState<string>('');
  const [skorAlatDanBahan, setSkorAlatDanBahan] = useState<ScoreValue>(null);
  const [k3, setK3] = useState<string>('');
  const [skorK3, setSkorK3] = useState<ScoreValue>(null);
  const [sikapDanPerilaku, setSikapDanPerilaku] = useState<string>('');
  const [skorSikapDanPerilaku, setSkorSikapDanPerilaku] =
    useState<ScoreValue>(null);
  const [temuan, setTemuan] = useState<string>('');
  const [rekomendasi, setRekomendasi] = useState<string>('');
  const [dokumentasiTemuanUrl, setDokumentasiTemuanUrl] = useState<string>('');
  const [dokumentasiPerbaikanUrl, setDokumentasiPerbaikanUrl] =
    useState<string>('');
  const [tandaTanganUrl, setTandaTanganUrl] = useState<string>('');

  const [openPickerKey, setOpenPickerKey] = useState<
    | 'kerapihan'
    | 'prosedur'
    | 'alatDanBahan'
    | 'k3'
    | 'sikapDanPerilaku'
    | null
  >(null);

  const [isSignatureUnlocked, setIsSignatureUnlocked] =
    useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const auditSigLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const temuanFileInputRef = useRef<HTMLInputElement | null>(null);
  const perbaikanFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setRoomRecords(loadRoomChecklistRecords());
    setAuditRecords(loadSupervisiAuditRecords());
    const nowStr = formatNowTimestamp();
    setTanggal(nowStr);
    setRoomTanggal(nowStr);
    setRoomHari(getCurrentHariIndonesia());
  }, []);

  const computedScoreSummary = useMemo(() => {
    return calculateSupervisiScores({
      skorKerapihan,
      skorProsedur,
      skorAlatDanBahan,
      skorK3,
      skorSikapDanPerilaku,
    });
  }, [
    skorKerapihan,
    skorProsedur,
    skorAlatDanBahan,
    skorK3,
    skorSikapDanPerilaku,
  ]);

  const roomProgress = useMemo(() => {
    return calculateRoomChecklistProgress(activeCardConfig, roomTaskEntries);
  }, [activeCardConfig, roomTaskEntries]);

  const resetFormForCard = (cardId: SupervisiCardId) => {
    const cfg =
      SUPERVISI_CARDS.find((c) => c.id === cardId) ||
      SUPERVISI_CARDS[SUPERVISI_CARDS.length - 1];
    const nowStr = formatNowTimestamp();

    // Reset Room Checklist form state
    setRoomTanggal(nowStr);
    setRoomHari(getCurrentHariIndonesia());
    setRoomTaskEntries(createDefaultTaskEntriesForCard(cfg, false));
    setRoomPetugas(cfg.featuredOfficers?.[0] || '');
    setRoomEvaluasi('');
    setRoomSignatures(cfg.signatureSlotLabels.map(() => ''));
    setActiveRoomSigSlot(0);
    setIsRoomSigUnlocked(true);
    if (roomSigCanvasRef.current) {
      const ctx = roomSigCanvasRef.current.getContext('2d');
      ctx?.clearRect(
        0,
        0,
        roomSigCanvasRef.current.width,
        roomSigCanvasRef.current.height
      );
    }

    // Reset Supervisi Audit form state
    setTanggal(nowStr);
    setSupervisor('');
    setUnit(cardId === 'SUPERVISI' ? '' : cfg.defaultUnit);
    setNamaPetugas('');
    setKerapihan('');
    setSkorKerapihan(null);
    setProsedur('');
    setSkorProsedur(null);
    setAlatDanBahan('');
    setSkorAlatDanBahan(null);
    setK3('');
    setSkorK3(null);
    setSikapDanPerilaku('');
    setSkorSikapDanPerilaku(null);
    setTemuan('');
    setRekomendasi('');
    setDokumentasiTemuanUrl('');
    setDokumentasiPerbaikanUrl('');
    setTandaTanganUrl('');
    setIsSignatureUnlocked(true);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setOpenPickerKey(null);
  };

  const handleSelectCard = (cardId: SupervisiCardId) => {
    setActiveCardId(cardId);
    resetFormForCard(cardId);
    setMode('form');
  };

  const handleQuickFillAllPositive = () => {
    if (activeCardConfig.kind === 'room_checklist') {
      const filled: Record<string, RoomChecklistTaskEntry> = {};
      activeCardConfig.tasks.forEach((t, idx) => {
        filled[t.id] = {
          status: t.positiveLabel,
          photos: t.photoSlotLabels.map(
            (_, slotIdx) =>
              SAMPLE_TEMUAN_PHOTOS[
                (idx + slotIdx) % SAMPLE_TEMUAN_PHOTOS.length
              ].url
          ),
        };
      });
      setRoomTaskEntries(filled);
      if (!roomHari) setRoomHari(getCurrentHariIndonesia());
      if (!roomPetugas) {
        setRoomPetugas(
          activeCardConfig.featuredOfficers?.[0] ||
            activeCardConfig.officerOptions[0] ||
            'ABU HANIFAH'
        );
      }
      if (activeCardConfig.hasEvaluasiSupervisor && !roomEvaluasi) {
        setRoomEvaluasi(EVALUASI_QUICK_TEMPLATES[0]);
      }
      setRoomSignatures(
        activeCardConfig.signatureSlotLabels.map(
          (_, idx) => SAMPLE_SIGNATURES[idx % SAMPLE_SIGNATURES.length]
        )
      );
      setIsRoomSigUnlocked(true);
    } else {
      setSupervisor('Fitria Wulandari, A.M.KL');
      if (!unit) setUnit(activeCardConfig.unitOptions[0]);
      if (!namaPetugas) setNamaPetugas(activeCardConfig.officerOptions[0]);
      setKerapihan(CRITERIA_QUICK_OPTIONS.kerapihan[0]);
      setSkorKerapihan(4);
      setProsedur(CRITERIA_QUICK_OPTIONS.prosedur[0]);
      setSkorProsedur(4);
      setAlatDanBahan(CRITERIA_QUICK_OPTIONS.alatDanBahan[0]);
      setSkorAlatDanBahan(4);
      setK3(CRITERIA_QUICK_OPTIONS.k3[0]);
      setSkorK3(4);
      setSikapDanPerilaku(CRITERIA_QUICK_OPTIONS.sikapDanPerilaku[0]);
      setSkorSikapDanPerilaku(4);
      if (!temuan) {
        setTemuan('Kondisi kebersihan ruangan terjaga baik sesuai standar SOP');
      }
      if (!rekomendasi) {
        setRekomendasi('Pertahankan jadwal pembersihan rutin pagi & siang');
      }
      if (!dokumentasiTemuanUrl) {
        setDokumentasiTemuanUrl(SAMPLE_TEMUAN_PHOTOS[0].url);
      }
      if (!tandaTanganUrl) {
        setTandaTanganUrl(SAMPLE_SIGNATURES[0]);
      }
      setIsSignatureUnlocked(true);
    }
  };

  // Room Task Entry Helpers
  const setTaskStatus = (taskId: string, status: TaskStatusValue) => {
    setRoomTaskEntries((prev) => {
      const existing = prev[taskId] || { status: '', photos: [] };
      const nextStatus = existing.status === status ? '' : status;
      return {
        ...prev,
        [taskId]: {
          ...existing,
          status: nextStatus,
        },
      };
    });
  };

  const setTaskPhotoAtSlot = (
    taskId: string,
    slotIdx: number,
    photoUrl: string,
    totalSlots: number
  ) => {
    setRoomTaskEntries((prev) => {
      const existing = prev[taskId] || {
        status: '',
        photos: Array.from({ length: totalSlots }, () => ''),
      };
      const nextPhotos = [...existing.photos];
      while (nextPhotos.length < totalSlots) {
        nextPhotos.push('');
      }
      nextPhotos[slotIdx] = photoUrl;
      return {
        ...prev,
        [taskId]: {
          ...existing,
          photos: nextPhotos,
        },
      };
    });
  };

  const handleRoomPhotoUploadChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !pendingPhotoTarget) return;
    const { taskId, slotIdx } = pendingPhotoTarget;
    const taskCfg = activeCardConfig.tasks.find((t) => t.id === taskId);
    const totalSlots = taskCfg ? taskCfg.photoSlotLabels.length : 1;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        setTaskPhotoAtSlot(taskId, slotIdx, result, totalSlots);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'temuan' | 'perbaikan'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (target === 'temuan') {
        setDokumentasiTemuanUrl(result);
      } else {
        setDokumentasiPerbaikanUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Signature Canvas Helpers (shared geometry logic with responsive scaling)
  const getScaledPointerPoint = (
    e: React.PointerEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    return scaleCanvasCoordinates(
      e.clientX,
      e.clientY,
      rect,
      canvas.width,
      canvas.height
    );
  };

  // Room Checklist Signature Canvas Handlers (Multi-platform Pointer Events)
  const startRoomSigDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isRoomSigUnlocked) {
      setIsRoomSigUnlocked(true);
    }
    e.preventDefault();
    e.stopPropagation();
    const canvas = roomSigCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore if synthetic event does not have active pointerId
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getScaledPointerPoint(e, canvas);
    roomSigLastPointRef.current = pt;
    ctx.strokeStyle = '#002147';
    ctx.fillStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw initial tap dot so single taps or start of stroke are crisp
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawingRoomSig(true);
  };

  const drawMoveRoomSig = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRoomSig) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = roomSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getScaledPointerPoint(e, canvas);
    const lastPt = roomSigLastPointRef.current;
    ctx.strokeStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPt) {
      const midX = (lastPt.x + pt.x) / 2;
      const midY = (lastPt.y + pt.y) / 2;
      ctx.quadraticCurveTo(lastPt.x, lastPt.y, midX, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
    } else {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    roomSigLastPointRef.current = pt;
  };

  const finishRoomSigDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRoomSig) return;
    const canvas = roomSigCanvasRef.current;
    if (canvas && e) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    }
    setIsDrawingRoomSig(false);
    roomSigLastPointRef.current = null;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setRoomSignatures((prev) => {
      const next = [...prev];
      next[activeRoomSigSlot] = dataUrl;
      return next;
    });
  };

  const clearRoomSignatureSlot = (slotIdx: number) => {
    const canvas = roomSigCanvasRef.current;
    if (canvas && slotIdx === activeRoomSigSlot) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    roomSigLastPointRef.current = null;
    setRoomSignatures((prev) => {
      const next = [...prev];
      next[slotIdx] = '';
      return next;
    });
  };

  // Supervisi Audit Signature Canvas Handlers (Multi-platform Pointer Events)
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSignatureUnlocked) {
      setIsSignatureUnlocked(true);
    }
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore if synthetic event
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getScaledPointerPoint(e, canvas);
    auditSigLastPointRef.current = pt;
    ctx.strokeStyle = '#002147';
    ctx.fillStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawing(true);
  };

  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getScaledPointerPoint(e, canvas);
    const lastPt = auditSigLastPointRef.current;
    ctx.strokeStyle = '#002147';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPt) {
      const midX = (lastPt.x + pt.x) / 2;
      const midY = (lastPt.y + pt.y) / 2;
      ctx.quadraticCurveTo(lastPt.x, lastPt.y, midX, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
    } else {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    auditSigLastPointRef.current = pt;
  };

  const finishDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && e) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    }
    setIsDrawing(false);
    auditSigLastPointRef.current = null;
    if (!canvas) return;
    setTandaTanganUrl(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    auditSigLastPointRef.current = null;
    setTandaTanganUrl('');
  };

  // Save Form Handler (Handles both 9 Room Checklist cards and 10th Supervisi Audit card)
  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activeCardConfig.kind === 'room_checklist') {
      const normalizedEntries: Record<string, RoomChecklistTaskEntry> = {};
      activeCardConfig.tasks.forEach((t, idx) => {
        const current = roomTaskEntries[t.id];
        normalizedEntries[t.id] = {
          status: current?.status || t.positiveLabel,
          photos: t.photoSlotLabels.map(
            (_, slotIdx) =>
              current?.photos?.[slotIdx] ||
              SAMPLE_TEMUAN_PHOTOS[
                (idx + slotIdx) % SAMPLE_TEMUAN_PHOTOS.length
              ].url
          ),
        };
      });

      const newRoomRec: RoomChecklistRecord = {
        id: `rc-${Date.now()}`,
        cardId: activeCardId as Exclude<SupervisiCardId, 'SUPERVISI'>,
        tanggal: roomTanggal.trim() || formatNowTimestamp(),
        hari: roomHari || getCurrentHariIndonesia(),
        taskEntries: normalizedEntries,
        petugas:
          roomPetugas.trim() ||
          activeCardConfig.featuredOfficers?.[0] ||
          activeCardConfig.officerOptions[0] ||
          'ABU HANIFAH',
        evaluasiSupervisor: activeCardConfig.hasEvaluasiSupervisor
          ? roomEvaluasi.trim() || EVALUASI_QUICK_TEMPLATES[0]
          : '',
        signatures: activeCardConfig.signatureSlotLabels.map(
          (_, idx) =>
            roomSignatures[idx] ||
            SAMPLE_SIGNATURES[idx % SAMPLE_SIGNATURES.length]
        ),
      };

      const updated = [newRoomRec, ...roomRecords];
      setRoomRecords(updated);
      saveRoomChecklistRecords(updated);
      setMode('table');
      setToastMessage(
        `Data Ceklist ${activeCardConfig.title} berhasil disimpan ke Tabel Rekap!`
      );
      setTimeout(() => setToastMessage(null), 4500);
      return;
    }

    // Supervisi Audit Record (Card 10: SUPERVISI)
    const newAuditRec: SupervisiAuditRecord = {
      id: `sup-${Date.now()}`,
      cardId: 'SUPERVISI',
      tanggal: tanggal.trim() || formatNowTimestamp(),
      supervisor: supervisor.trim() || 'Fitria Wulandari, A.M.KL',
      unit: unit.trim() || activeCardConfig.defaultUnit,
      namaPetugas: namaPetugas.trim() || activeCardConfig.officerOptions[0],
      kerapihan: kerapihan.trim(),
      skorKerapihan,
      prosedur: prosedur.trim(),
      skorProsedur,
      alatDanBahan: alatDanBahan.trim(),
      skorAlatDanBahan,
      k3: k3.trim(),
      skorK3,
      sikapDanPerilaku: sikapDanPerilaku.trim(),
      skorSikapDanPerilaku,
      totalSkor: computedScoreSummary.totalSkor,
      kategori: computedScoreSummary.kategori,
      temuan: temuan.trim() || 'Kondisi ruangan bersih & sesuai standar',
      rekomendasi:
        rekomendasi.trim() || 'Pertahankan kebersihan rutin sesuai SOP',
      dokumentasiTemuanUrl:
        dokumentasiTemuanUrl || '/assets/aistudio/supervisi-temuan/temuan-1.png',
      dokumentasiPerbaikanUrl,
      tandaTanganUrl:
        tandaTanganUrl || '/assets/aistudio/supervisi-temuan/ttd-1.png',
    };

    const updated = [newAuditRec, ...auditRecords];
    setAuditRecords(updated);
    saveSupervisiAuditRecords(updated);
    setMode('table');
    setToastMessage(
      `Data ${activeCardConfig.title} berhasil disimpan ke Tabel Rekap Supervisi!`
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleDeleteRoomRecord = (id: string) => {
    const updated = roomRecords.filter((r) => r.id !== id);
    setRoomRecords(updated);
    saveRoomChecklistRecords(updated);
  };

  const handleDeleteAuditRecord = (id: string) => {
    const updated = auditRecords.filter((r) => r.id !== id);
    setAuditRecords(updated);
    saveSupervisiAuditRecords(updated);
  };

  const filteredRoomRecords = useMemo(() => {
    return roomRecords.filter((r) => {
      if (r.cardId !== activeCardId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.tanggal.toLowerCase().includes(q) ||
        r.hari.toLowerCase().includes(q) ||
        r.petugas.toLowerCase().includes(q) ||
        r.evaluasiSupervisor.toLowerCase().includes(q)
      );
    });
  }, [roomRecords, activeCardId, searchQuery]);

  const filteredAuditRecords = useMemo(() => {
    return auditRecords.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.unit.toLowerCase().includes(q) ||
        r.namaPetugas.toLowerCase().includes(q) ||
        r.supervisor.toLowerCase().includes(q) ||
        r.temuan.toLowerCase().includes(q) ||
        r.rekomendasi.toLowerCase().includes(q) ||
        r.tanggal.toLowerCase().includes(q)
      );
    });
  }, [auditRecords, searchQuery]);

  const totalAllRecordsCount = roomRecords.length + auditRecords.length;

  const getRecordCountForCard = (cardId: SupervisiCardId): number => {
    if (cardId === 'SUPERVISI') return auditRecords.length;
    return roomRecords.filter((r) => r.cardId === cardId).length;
  };

  const stepActiveSheetTab = (dir: -1 | 1) => {
    const idx = SUPERVISI_CARDS.findIndex((c) => c.id === activeCardId);
    const nextIdx =
      (idx + dir + SUPERVISI_CARDS.length) % SUPERVISI_CARDS.length;
    const nextCardId = SUPERVISI_CARDS[nextIdx].id;
    setActiveCardId(nextCardId);
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input for Room Checklist Photo Slots */}
      <input
        ref={roomPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleRoomPhotoUploadChange}
        className="hidden"
      />

      {/* Toast Notification after Save */}
      {toastMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl bg-[#1B8720] text-white px-4 py-3 text-xs sm:text-sm font-extrabold shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          VIEW 1: GAMBAR NO. 1 — GRID 10 CARD RUANGAN UNTUK DIPILIH
         ===================================================================== */}
      {mode === 'cards' && (
        <div className="rounded-2xl bg-[#FAF6F0]/90 dark:bg-slate-900/90 border border-[#D2B48C]/60 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {SUPERVISI_CARDS.map((card) => {
              const countForCard = getRecordCountForCard(card.id);
              const taskBadgeText =
                card.kind === 'room_checklist'
                  ? `${card.tasks.length} Tugas Ceklist`
                  : '5 Aspek & Temuan';
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectCard(card.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 dark:border-slate-700 ${card.borderHoverClass} p-3 sm:p-3.5 text-left shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
                >
                  <div className="w-full">
                    {/* 3D Illustration Image matching Gambar 1 */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-700/50">
                      <Image
                        src={card.imageSrc}
                        alt={card.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
                        referrerPolicy="no-referrer"
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title & Subtitle */}
                    <div
                      className={`flex items-center gap-1.5 ${card.labelColorClass}`}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs sm:text-[13px] font-extrabold tracking-tight uppercase truncate">
                        {card.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Card Footer Metadata */}
                  <div className="w-full mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>{taskBadgeText}</span>
                    <span className="tabular-nums text-[#002147] dark:text-[#D2B48C]">
                      {countForCard} Data
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: FORM PENGINPUTAN KHUSUS SESUAI CARD RUANGAN YANG DIPILIH
         ===================================================================== */}
      {mode === 'form' && (
        <div className="rounded-2xl bg-[#FAF6F0] dark:bg-slate-900 border border-[#D2B48C]/70 dark:border-slate-700 shadow-lg overflow-hidden">
          {/* Top Sticky Form Header (Back Button + Room Identity Only — Save/Cancel are at bottom) */}
          <div className="sticky top-0 z-30 bg-[#002147] text-white px-4 sm:px-6 py-3.5 border-b border-[#D2B48C]/40 shadow-md">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Back button + Active Room Icon + Form Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMode('cards')}
                  aria-label="Kembali ke Pilihan Ruangan"
                  title="Kembali ke Pilihan Card Ruangan"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-[#D2B48C]">
                  <Image
                    src={activeCardConfig.imageSrc}
                    alt={activeCardConfig.title}
                    fill
                    sizes="36px"
                    referrerPolicy="no-referrer"
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#D2B48C]">
                    {activeCardConfig.subtitle}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                    {activeCardConfig.formTitle}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              BRANCH A: 9 ROOM CHECKLIST FORMS (RAWAT JALAN .. HALAMAN)
             =============================================================== */}
          {activeCardConfig.kind === 'room_checklist' ? (
            <form
              onSubmit={handleSaveForm}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
            >
              {/* Top Metadata Card: TANGGAL & HARI + Live Progress */}
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 dark:border-slate-700 p-4 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white">
                      01. Waktu Pelaksanaan & Identitas Hari
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Waktu tercatat otomatis dan dapat disesuaikan sesuai shift pembersihan ruangan.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FAF6F0] dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-[#D2B48C]/50">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        Progres Ceklist
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-[#D2B48C] tabular-nums">
                        {roomProgress.completedTasks} / {roomProgress.totalTasks} Tugas ({roomProgress.percentage}%)
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#002147] text-[#D2B48C] flex items-center justify-center font-extrabold text-xs tabular-nums">
                      {roomProgress.percentage}%
                    </div>
                  </div>
                </div>

                {/* TANGGAL & JAM Interactive Selector */}
                {(() => {
                  const roomParts = parseTimestampToParts(roomTanggal);
                  return (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="room-tanggal"
                          className="block text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-slate-200"
                        >
                          TANGGAL &amp; JAM <span className="text-rose-600">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nowTs = formatNowTimestamp();
                            setRoomTanggal(nowTs);
                            setRoomHari(getCurrentHariIndonesia());
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#082B54] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Set Waktu Sekarang</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Date Picker */}
                        <div className="space-y-1">
                          <label
                            htmlFor="room-tanggal-date"
                            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300"
                          >
                            Pilih Tanggal
                          </label>
                          <div className="relative">
                            <input
                              id="room-tanggal-date"
                              type="date"
                              aria-label="Pilih Tanggal"
                              value={roomParts.dateInput}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                if (!newDate) return;
                                setRoomTanggal(
                                  buildTimestampFromParts(
                                    newDate,
                                    roomParts.timeInput
                                  )
                                );
                                setRoomHari(getHariFromDateInput(newDate));
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/60 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums focus:outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/20 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Time Picker */}
                        <div className="space-y-1">
                          <label
                            htmlFor="room-tanggal-time"
                            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300"
                          >
                            Pilih Jam (WIB)
                          </label>
                          <div className="relative">
                            <input
                              id="room-tanggal-time"
                              type="time"
                              step="1"
                              aria-label="Pilih Jam"
                              value={roomParts.timeInput}
                              onChange={(e) => {
                                const newTime = e.target.value;
                                if (!newTime) return;
                                setRoomTanggal(
                                  buildTimestampFromParts(
                                    roomParts.dateInput,
                                    newTime
                                  )
                                );
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/60 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums focus:outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/20 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Formatted Timestamp Value (Editable) */}
                        <div className="space-y-1">
                          <label
                            htmlFor="room-tanggal"
                            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300"
                          >
                            Format Rekap (DD/MM/YYYY HH:mm:ss)
                          </label>
                          <input
                            id="room-tanggal"
                            type="text"
                            value={roomTanggal}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRoomTanggal(val);
                              const parsed = parseTimestampToParts(val);
                              if (parsed.dateInput) {
                                setRoomHari(
                                  getHariFromDateInput(parsed.dateInput)
                                );
                              }
                            }}
                            required
                            placeholder="DD/MM/YYYY HH:mm:ss"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/60 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums focus:outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/20"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* HARI Selector (Quick 7-Day Buttons + Dropdown compatibility) */}
                <div className="space-y-2">
                  <label
                    htmlFor="room-hari"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-slate-200"
                  >
                    HARI
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {HARI_OPTIONS.map((h) => {
                      const active = roomHari === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setRoomHari(h)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#002147] text-[#D2B48C] border-[#002147] shadow-xs'
                              : 'bg-[#FAF6F0]/60 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#002147]'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 2: Sequential Room Tasks (Matches exact AppSheet tasks & photo slots) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white">
                      02. Daftar Ceklist Tugas Kebersihan ({activeCardConfig.title})
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Pilih status pelaksanaan dan lampirkan foto dokumentasi untuk setiap item tugas di bawah ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFillAllPositive}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B8720] hover:bg-[#146918] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Semua Selesai</span>
                  </button>
                </div>

                {activeCardConfig.tasks.map((task, taskIdx) => {
                  const entry = roomTaskEntries[task.id] || {
                    status: '',
                    photos: task.photoSlotLabels.map(() => ''),
                  };
                  const isPositive =
                    entry.status === 'DILAKUKAN' ||
                    entry.status === 'DILAKSANAKAN';
                  const isNegative = entry.status === 'TIDAK';

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl bg-white dark:bg-slate-800 border transition-all p-4 sm:p-5 shadow-xs space-y-4 ${
                        isPositive
                          ? 'border-[#1B8720]/60 dark:border-emerald-600/60'
                          : isNegative
                            ? 'border-rose-400 dark:border-rose-600'
                            : 'border-[#D2B48C]/60 dark:border-slate-700'
                      }`}
                    >
                      {/* Task Header + Status Buttons */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 tabular-nums ${
                              isPositive
                                ? 'bg-[#1B8720] text-white'
                                : 'bg-[#002147] text-[#D2B48C]'
                            }`}
                          >
                            {String(taskIdx + 1).padStart(2, '0')}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm font-extrabold text-[#002147] dark:text-white leading-snug">
                              {task.label}
                            </div>
                            {task.timeWindow && (
                              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                                <Clock className="w-3 h-3" />
                                <span>Jadwal: {task.timeWindow} WIB</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Two-Button Status Selector matching AppSheet: TIDAK | DILAKUKAN / DILAKSANAKAN */}
                        <div className="grid grid-cols-2 gap-2.5 sm:w-72 shrink-0">
                          <button
                            type="button"
                            onClick={() => setTaskStatus(task.id, 'TIDAK')}
                            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isNegative
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-rose-500'
                            }`}
                          >
                            <span>TIDAK</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setTaskStatus(task.id, task.positiveLabel)
                            }
                            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isPositive
                                ? 'bg-[#1B8720] text-white border-[#1B8720] shadow-xs'
                                : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#1B8720]'
                            }`}
                          >
                            {isPositive && <Check className="w-3.5 h-3.5" />}
                            <span>{task.positiveLabel}</span>
                          </button>
                        </div>
                      </div>

                      {/* Photo Slots (1 slot for standard rooms, 3 slots for RANAP ICU & IBS and MANAJEMEN, 0 for PENGANTARAN OBAT) */}
                      {task.photoSlotLabels.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/70 space-y-2.5">
                          <div
                            className={`grid gap-3 ${
                              task.photoSlotLabels.length === 3
                                ? 'grid-cols-1 sm:grid-cols-3'
                                : 'grid-cols-1'
                            }`}
                          >
                            {task.photoSlotLabels.map((slotLabel, slotIdx) => {
                              const currentPhoto =
                                entry.photos?.[slotIdx] || '';
                              return (
                                <div
                                  key={slotLabel}
                                  className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900/70 p-3 flex flex-col justify-between gap-2.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                      {slotLabel}
                                    </span>
                                    {currentPhoto && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setTaskPhotoAtSlot(
                                            task.id,
                                            slotIdx,
                                            '',
                                            task.photoSlotLabels.length
                                          )
                                        }
                                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                                      >
                                        Hapus Foto
                                      </button>
                                    )}
                                  </div>

                                  <div
                                    onClick={() => {
                                      setPendingPhotoTarget({
                                        taskId: task.id,
                                        slotIdx,
                                      });
                                      roomPhotoInputRef.current?.click();
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setPendingPhotoTarget({
                                          taskId: task.id,
                                          slotIdx,
                                        });
                                        roomPhotoInputRef.current?.click();
                                      }
                                    }}
                                    className="min-h-[84px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#002147] flex items-center justify-center p-2.5 transition-colors cursor-pointer"
                                  >
                                    {currentPhoto ? (
                                      <div className="flex items-center gap-3 w-full">
                                        <img
                                          src={currentPhoto}
                                          alt={slotLabel}
                                          className="w-16 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                                        />
                                        <div className="min-w-0 text-left">
                                          <div className="text-xs font-extrabold text-[#1B8720] dark:text-emerald-400 truncate">
                                            Foto Terlampir
                                          </div>
                                          <div className="text-[10px] text-slate-500">
                                            Klik untuk ganti foto kamera/galeri
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Camera className="w-6 h-6 text-[#002147] dark:text-[#D2B48C]" />
                                        <span className="text-[11px] font-semibold">
                                          Ambil / Unggah Foto
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* 1-Click Sample Photo Button for Fast Field Simulation */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {SAMPLE_TEMUAN_PHOTOS.slice(0, 3).map(
                                      (sample, sIdx) => (
                                        <button
                                          key={sample.url}
                                          type="button"
                                          onClick={() =>
                                            setTaskPhotoAtSlot(
                                              task.id,
                                              slotIdx,
                                              sample.url,
                                              task.photoSlotLabels.length
                                            )
                                          }
                                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                            currentPhoto === sample.url
                                              ? 'bg-[#002147] text-[#D2B48C] border-[#002147]'
                                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                          }`}
                                        >
                                          Contoh Foto {sIdx + 1}
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section 3: PETUGAS, EVALUASI SUPERVISOR, & TANDA TANGAN */}
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 dark:border-slate-700 p-4 sm:p-6 shadow-xs space-y-6">
                <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                  03. Identitas Petugas, Evaluasi & Pengesahan Tanda Tangan
                </h4>

                {/* PETUGAS */}
                <div className="space-y-2.5">
                  <label
                    htmlFor="room-petugas"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-slate-200"
                  >
                    PETUGAS
                  </label>

                  {/* Featured Officer Quick Buttons (Matches AppSheet e.g. ABU HANIFAH, MIRNAWATI / DEVI SURYADI, DONI ALAMSYAH) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeCardConfig.officerOptions.map((off) => {
                      const isSelected = roomPetugas === off;
                      return (
                        <button
                          key={off}
                          type="button"
                          onClick={() => setRoomPetugas(off)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#002147] text-[#D2B48C] border-[#002147] shadow-xs'
                              : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#002147]'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{off}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative">
                    <select
                      id="room-petugas"
                      value={roomPetugas}
                      onChange={(e) => setRoomPetugas(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm font-semibold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147] cursor-pointer"
                    >
                      <option value="">-- Pilih Nama Petugas Kebersihan --</option>
                      {activeCardConfig.officerOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* EVALUASI SUPERVISOR (If applicable for this card) */}
                {activeCardConfig.hasEvaluasiSupervisor && (
                  <div className="space-y-2">
                    <label
                      htmlFor="room-evaluasi"
                      className="block text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-slate-200"
                    >
                      EVALUASI SUPERVISOR
                    </label>
                    <textarea
                      id="room-evaluasi"
                      rows={2}
                      value={roomEvaluasi}
                      onChange={(e) => setRoomEvaluasi(e.target.value)}
                      placeholder="Ketik catatan evaluasi supervisor untuk ruangan ini..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      {EVALUASI_QUICK_TEMPLATES.map((tpl, idx) => (
                        <button
                          key={tpl}
                          type="button"
                          onClick={() => setRoomEvaluasi(tpl)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          Template Evaluasi {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TANDA TANGAN (Supports 1 slot or 3 slots for RANAP ICU & IBS / MANAJEMEN) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#002147] dark:text-slate-200">
                      {activeCardConfig.signatureSlotLabels.length > 1
                        ? `TANDA TANGAN (${activeCardConfig.signatureSlotLabels.length} SLOT PENGESAHAN)`
                        : 'TANDA TANGAN'}
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRoomSigUnlocked(true);
                          if (roomSigCanvasRef.current) {
                            const ctx =
                              roomSigCanvasRef.current.getContext('2d');
                            ctx?.clearRect(
                              0,
                              0,
                              roomSigCanvasRef.current.width,
                              roomSigCanvasRef.current.height
                            );
                          }
                          setRoomSignatures(
                            activeCardConfig.signatureSlotLabels.map(
                              (_, idx) =>
                                SAMPLE_SIGNATURES[idx % SAMPLE_SIGNATURES.length]
                            )
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#082B54] text-[11px] font-bold cursor-pointer"
                      >
                        Gunakan TTD Digital
                      </button>
                      {roomSignatures[activeRoomSigSlot] && (
                        <button
                          type="button"
                          onClick={() =>
                            clearRoomSignatureSlot(activeRoomSigSlot)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 border border-rose-200 cursor-pointer"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          <span>Hapus TTD</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If 3 signature slots exist (RANAP ICU DAN IBS / MANAJEMEN), show slot selector tabs */}
                  {activeCardConfig.signatureSlotLabels.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {activeCardConfig.signatureSlotLabels.map(
                        (sigLabel, idx) => {
                          const hasSig = Boolean(roomSignatures[idx]);
                          const isCurrent = activeRoomSigSlot === idx;
                          return (
                            <button
                              key={sigLabel}
                              type="button"
                              onClick={() => {
                                setActiveRoomSigSlot(idx);
                                const canvas = roomSigCanvasRef.current;
                                if (canvas) {
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.clearRect(
                                      0,
                                      0,
                                      canvas.width,
                                      canvas.height
                                    );
                                    const savedSig = roomSignatures[idx];
                                    if (
                                      savedSig &&
                                      savedSig.startsWith('data:image/')
                                    ) {
                                      const img = new window.Image();
                                      img.onload = () => {
                                        ctx.drawImage(
                                          img,
                                          0,
                                          0,
                                          canvas.width,
                                          canvas.height
                                        );
                                      };
                                      img.src = savedSig;
                                    }
                                  }
                                }
                              }}
                              className={`py-2 px-3 rounded-xl text-xs font-extrabold border flex items-center justify-between gap-1.5 cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#002147] text-[#D2B48C] border-[#002147]'
                                  : 'bg-[#FAF6F0]/60 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              <span className="truncate">{sigLabel}</span>
                              {hasSig && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Signature Pad Box — Responsive Multi-Platform Touch & Pointer Canvas */}
                  <div
                    onClick={() => {
                      if (!isRoomSigUnlocked) {
                        setIsRoomSigUnlocked(true);
                      }
                    }}
                    className="relative w-full h-52 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white overflow-hidden select-none touch-none shadow-inner"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRoomSigUnlocked((prev) => !prev);
                      }}
                      title={
                        isRoomSigUnlocked
                          ? 'Kunci Kotak Tanda Tangan'
                          : 'Buka Kunci Tanda Tangan'
                      }
                      className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {isRoomSigUnlocked ? (
                        <LockOpen className="w-4 h-4 text-[#1B8720]" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    <canvas
                      ref={roomSigCanvasRef}
                      data-testid="room-signature-canvas"
                      width={600}
                      height={208}
                      onPointerDown={startRoomSigDrawing}
                      onPointerMove={drawMoveRoomSig}
                      onPointerUp={finishRoomSigDrawing}
                      onPointerCancel={finishRoomSigDrawing}
                      onPointerLeave={finishRoomSigDrawing}
                      className={`w-full h-full touch-none select-none ${
                        isRoomSigUnlocked
                          ? 'cursor-crosshair'
                          : 'cursor-pointer'
                      }`}
                    />

                    {roomSignatures[activeRoomSigSlot] &&
                      !isDrawingRoomSig &&
                      roomSignatures[activeRoomSigSlot].startsWith(
                        '/assets/'
                      ) && (
                        <img
                          src={roomSignatures[activeRoomSigSlot]}
                          alt="Tanda Tangan"
                          className="pointer-events-none absolute inset-0 m-auto max-h-36 object-contain"
                        />
                      )}

                    <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-xs sm:text-sm font-semibold text-slate-500">
                      {isRoomSigUnlocked
                        ? `Sentuh / goreskan ${activeCardConfig.signatureSlotLabels[activeRoomSigSlot]} di area ini`
                        : 'Sentuh untuk membuka kunci tanda tangan'}
                    </div>
                  </div>
                </div>

                {/* Bottom Form Submit Bar */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('cards')}
                    className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    Batal / Kembali
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B8720] hover:bg-[#146918] text-white text-xs sm:text-sm font-extrabold shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Simpan Data {activeCardConfig.title} ke Tabel Rekap
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ===============================================================
               BRANCH B: 10TH CARD — SUPERVISI AUDIT FORM (GAMBAR 2-4)
               =============================================================== */
            <form
              onSubmit={handleSaveForm}
              className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6"
            >
              {/* Card 1: Identitas Waktu, Supervisor, Unit & Petugas */}
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 dark:border-slate-700 p-4 sm:p-6 shadow-xs space-y-5">
                <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                  01. Identitas Waktu, Supervisor, Unit & Petugas
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. TANGGAL & JAM * (Interactive Date + Time Picker) */}
                  {(() => {
                    const auditParts = parseTimestampToParts(tanggal);
                    return (
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label
                            htmlFor="supervisi-tanggal"
                            className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                          >
                            TANGGAL &amp; JAM
                            <span className="text-sky-600 ml-0.5">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setTanggal(formatNowTimestamp())}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002147] text-[#D2B48C] hover:bg-[#082B54] text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Set Waktu Sekarang</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                          <div className="space-y-1">
                            <label
                              htmlFor="supervisi-tanggal-date"
                              className="block text-[11px] font-bold text-slate-600 dark:text-slate-300"
                            >
                              Pilih Tanggal
                            </label>
                            <input
                              id="supervisi-tanggal-date"
                              type="date"
                              aria-label="Pilih Tanggal Supervisi"
                              value={auditParts.dateInput}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                if (!newDate) return;
                                setTanggal(
                                  buildTimestampFromParts(
                                    newDate,
                                    auditParts.timeInput
                                  )
                                );
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/60 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums focus:outline-none focus:border-[#002147] cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor="supervisi-tanggal-time"
                              className="block text-[11px] font-bold text-slate-600 dark:text-slate-300"
                            >
                              Pilih Jam (WIB)
                            </label>
                            <input
                              id="supervisi-tanggal-time"
                              type="time"
                              step="1"
                              aria-label="Pilih Jam Supervisi"
                              value={auditParts.timeInput}
                              onChange={(e) => {
                                const newTime = e.target.value;
                                if (!newTime) return;
                                setTanggal(
                                  buildTimestampFromParts(
                                    auditParts.dateInput,
                                    newTime
                                  )
                                );
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/60 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums focus:outline-none focus:border-[#002147] cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor="supervisi-tanggal"
                              className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate"
                            >
                              Hasil Waktu Rekap
                            </label>
                            <input
                              id="supervisi-tanggal"
                              type="text"
                              value={tanggal}
                              onChange={(e) => setTanggal(e.target.value)}
                              required
                              placeholder="DD/MM/YYYY HH:mm:ss"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/60 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#002147] dark:text-white tabular-nums focus:outline-none focus:border-[#002147]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. SUPERVISOR */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="supervisi-supervisor"
                      className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                    >
                      SUPERVISOR
                    </label>
                    <div className="relative">
                      <select
                        id="supervisi-supervisor"
                        value={supervisor}
                        onChange={(e) => setSupervisor(e.target.value)}
                        className="w-full appearance-none px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm font-semibold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147] cursor-pointer"
                      >
                        <option value="">-- Pilih Supervisor --</option>
                        {SUPERVISOR_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* 3. UNIT */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="supervisi-unit"
                      className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                    >
                      UNIT
                    </label>
                    <div className="relative">
                      <select
                        id="supervisi-unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full appearance-none px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm font-semibold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147] cursor-pointer"
                      >
                        <option value="">-- Pilih Unit / Ruangan --</option>
                        {activeCardConfig.unitOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* 4. NAMA PETUGAS */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="supervisi-petugas"
                      className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                    >
                      NAMA PETUGAS
                    </label>
                    <div className="relative">
                      <select
                        id="supervisi-petugas"
                        value={namaPetugas}
                        onChange={(e) => setNamaPetugas(e.target.value)}
                        className="w-full appearance-none px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm font-semibold text-[#002147] dark:text-white focus:outline-none focus:border-[#002147] cursor-pointer"
                      >
                        <option value="">-- Pilih Nama Petugas --</option>
                        {activeCardConfig.officerOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-600 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Penilaian 5 Kriteria & Skor (1–4) */}
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 dark:border-slate-700 p-4 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white">
                    02. Penilaian Aspek Kinerja & Skor Supervisi (1–4)
                  </h4>
                  {computedScoreSummary.totalSkor !== null && (
                    <div className="text-xs font-extrabold text-[#1B8720] dark:text-emerald-400 tabular-nums">
                      Total Skor: {computedScoreSummary.totalSkor} · Kategori:{' '}
                      {computedScoreSummary.kategori}
                    </div>
                  )}
                </div>

                {/* 5. KERAPIHAN & 6. SKOR */}
                <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <label
                    htmlFor="supervisi-kerapihan"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    KERAPIHAN
                  </label>
                  <div className="relative">
                    <input
                      id="supervisi-kerapihan"
                      type="text"
                      value={kerapihan}
                      onChange={(e) => setKerapihan(e.target.value)}
                      placeholder="Klik + untuk opsi cepat atau ketik catatan kerapihan..."
                      className="w-full px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPickerKey(
                          openPickerKey === 'kerapihan' ? null : 'kerapihan'
                        )
                      }
                      title="Pilih Kriteria Kerapihan"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {openPickerKey === 'kerapihan' && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-900 p-2 space-y-1">
                      {CRITERIA_QUICK_OPTIONS.kerapihan.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setKerapihan(item);
                            setOpenPickerKey(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#002147] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 space-y-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      SKOR
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSkorKerapihan(skorKerapihan === val ? null : val)
                          }
                          className={`min-h-[44px] py-2.5 rounded-xl border text-sm font-extrabold tabular-nums transition-all cursor-pointer ${
                            skorKerapihan === val
                              ? 'bg-[#1B8720] text-white border-[#1B8720] shadow-xs'
                              : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#002147]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 7. PROSEDUR & 8. SKOR_8 */}
                <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <label
                    htmlFor="supervisi-prosedur"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    PROSEDUR
                  </label>
                  <div className="relative">
                    <input
                      id="supervisi-prosedur"
                      type="text"
                      value={prosedur}
                      onChange={(e) => setProsedur(e.target.value)}
                      placeholder="Klik + untuk opsi cepat atau ketik evaluasi prosedur..."
                      className="w-full px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPickerKey(
                          openPickerKey === 'prosedur' ? null : 'prosedur'
                        )
                      }
                      title="Pilih Kriteria Prosedur"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {openPickerKey === 'prosedur' && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-900 p-2 space-y-1">
                      {CRITERIA_QUICK_OPTIONS.prosedur.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setProsedur(item);
                            setOpenPickerKey(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#002147] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 space-y-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      SKOR_8
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSkorProsedur(skorProsedur === val ? null : val)
                          }
                          className={`min-h-[44px] py-2.5 rounded-xl border text-sm font-extrabold tabular-nums transition-all cursor-pointer ${
                            skorProsedur === val
                              ? 'bg-[#1B8720] text-white border-[#1B8720] shadow-xs'
                              : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#002147]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 9. ALAT DAN BAHAN & 10. SKOR_10 */}
                <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <label
                    htmlFor="supervisi-alat"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    ALAT DAN BAHAN
                  </label>
                  <div className="relative">
                    <input
                      id="supervisi-alat"
                      type="text"
                      value={alatDanBahan}
                      onChange={(e) => setAlatDanBahan(e.target.value)}
                      placeholder="Klik + untuk opsi cepat atau ketik kelengkapan alat dan bahan..."
                      className="w-full px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPickerKey(
                          openPickerKey === 'alatDanBahan'
                            ? null
                            : 'alatDanBahan'
                        )
                      }
                      title="Pilih Kriteria Alat dan Bahan"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {openPickerKey === 'alatDanBahan' && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-900 p-2 space-y-1">
                      {CRITERIA_QUICK_OPTIONS.alatDanBahan.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setAlatDanBahan(item);
                            setOpenPickerKey(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#002147] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 space-y-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      SKOR_10
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSkorAlatDanBahan(
                              skorAlatDanBahan === val ? null : val
                            )
                          }
                          className={`min-h-[44px] py-2.5 rounded-xl border text-sm font-extrabold tabular-nums transition-all cursor-pointer ${
                            skorAlatDanBahan === val
                              ? 'bg-[#1B8720] text-white border-[#1B8720] shadow-xs'
                              : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#002147]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 11. KESELAMATAN DAN KESEHATAN KERJA (K3) & 12. SKOR_12 */}
                <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <label
                    htmlFor="supervisi-k3"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    KESELAMATAN DAN KESEHATAN KERJA (K3)
                  </label>
                  <div className="relative">
                    <input
                      id="supervisi-k3"
                      type="text"
                      value={k3}
                      onChange={(e) => setK3(e.target.value)}
                      placeholder="Klik + untuk opsi cepat atau ketik kepatuhan K3 / APD..."
                      className="w-full px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPickerKey(openPickerKey === 'k3' ? null : 'k3')
                      }
                      title="Pilih Kriteria K3"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {openPickerKey === 'k3' && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-900 p-2 space-y-1">
                      {CRITERIA_QUICK_OPTIONS.k3.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setK3(item);
                            setOpenPickerKey(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#002147] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 space-y-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      SKOR_12
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSkorK3(skorK3 === val ? null : val)}
                          className={`min-h-[44px] py-2.5 rounded-xl border text-sm font-extrabold tabular-nums transition-all cursor-pointer ${
                            skorK3 === val
                              ? 'bg-[#1B8720] text-white border-[#1B8720] shadow-xs'
                              : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#002147]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 13. SIKAP DAN PERILAKU & 14. SKOR_14 */}
                <div className="space-y-2">
                  <label
                    htmlFor="supervisi-sikap"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    SIKAP DAN PERILAKU
                  </label>
                  <div className="relative">
                    <input
                      id="supervisi-sikap"
                      type="text"
                      value={sikapDanPerilaku}
                      onChange={(e) => setSikapDanPerilaku(e.target.value)}
                      placeholder="Klik + untuk opsi cepat atau ketik evaluasi sikap & perilaku..."
                      className="w-full px-3.5 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPickerKey(
                          openPickerKey === 'sikapDanPerilaku'
                            ? null
                            : 'sikapDanPerilaku'
                        )
                      }
                      title="Pilih Kriteria Sikap dan Perilaku"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {openPickerKey === 'sikapDanPerilaku' && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-900 p-2 space-y-1">
                      {CRITERIA_QUICK_OPTIONS.sikapDanPerilaku.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setSikapDanPerilaku(item);
                            setOpenPickerKey(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#002147] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 space-y-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      SKOR_14
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSkorSikapDanPerilaku(
                              skorSikapDanPerilaku === val ? null : val
                            )
                          }
                          className={`min-h-[44px] py-2.5 rounded-xl border text-sm font-extrabold tabular-nums transition-all cursor-pointer ${
                            skorSikapDanPerilaku === val
                              ? 'bg-[#1B8720] text-white border-[#1B8720] shadow-xs'
                              : 'bg-[#FAF6F0]/70 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-[#002147]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Temuan, Rekomendasi, Dokumentasi & Tanda Tangan */}
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-[#D2B48C]/60 dark:border-slate-700 p-4 sm:p-6 shadow-xs space-y-5">
                <h4 className="text-sm sm:text-base font-extrabold text-[#002147] dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
                  03. Temuan, Rekomendasi, Dokumentasi & Tanda Tangan
                </h4>

                {/* 15. TEMUAN */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="supervisi-temuan"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    TEMUAN
                  </label>
                  <input
                    id="supervisi-temuan"
                    type="text"
                    value={temuan}
                    onChange={(e) => setTemuan(e.target.value)}
                    placeholder="Ketik temuan supervisi di lapangan..."
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                  />
                </div>

                {/* 16. REKOMENDASI */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="supervisi-rekomendasi"
                    className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200"
                  >
                    REKOMENDASI
                  </label>
                  <input
                    id="supervisi-rekomendasi"
                    type="text"
                    value={rekomendasi}
                    onChange={(e) => setRekomendasi(e.target.value)}
                    placeholder="Ketik rekomendasi tindak lanjut (misal: koordinasi dengan IPSRS)..."
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 text-sm text-[#002147] dark:text-white focus:outline-none focus:border-[#002147]"
                  />
                </div>

                {/* 17. DOKUMENTASI TEMUAN & 18. DOKUMENTASI PERBAIKAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200">
                      DOKUMENTASI TEMUAN
                    </label>
                    <input
                      ref={temuanFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'temuan')}
                      className="hidden"
                    />
                    <div
                      onClick={() => temuanFileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          temuanFileInputRef.current?.click();
                        }
                      }}
                      className="w-full min-h-[104px] rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 hover:border-[#002147] flex flex-col items-center justify-center p-3 transition-colors cursor-pointer"
                    >
                      {dokumentasiTemuanUrl ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={dokumentasiTemuanUrl}
                            alt="Preview Dokumentasi Temuan"
                            className="h-16 w-20 object-cover rounded-lg border border-slate-300"
                          />
                          <div className="text-left space-y-0.5">
                            <div className="text-xs font-extrabold text-[#1B8720]">
                              Foto Temuan Terlampir
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Klik untuk mengganti
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <Camera className="w-6 h-6 text-[#002147] dark:text-[#D2B48C]" />
                          <span className="text-xs font-semibold">
                            Unggah Foto Temuan
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SAMPLE_TEMUAN_PHOTOS.map((p, idx) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setDokumentasiTemuanUrl(p.url)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            dokumentasiTemuanUrl === p.url
                              ? 'bg-[#002147] text-[#D2B48C] border-[#002147]'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Contoh {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200">
                      DOKUMENTASI PERBAIKAN
                    </label>
                    <input
                      ref={perbaikanFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'perbaikan')}
                      className="hidden"
                    />
                    <div
                      onClick={() => perbaikanFileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          perbaikanFileInputRef.current?.click();
                        }
                      }}
                      className="w-full min-h-[104px] rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-[#FAF6F0]/50 dark:bg-slate-900 hover:border-[#002147] flex flex-col items-center justify-center p-3 transition-colors cursor-pointer"
                    >
                      {dokumentasiPerbaikanUrl ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={dokumentasiPerbaikanUrl}
                            alt="Preview Dokumentasi Perbaikan"
                            className="h-16 w-20 object-cover rounded-lg border border-slate-300"
                          />
                          <div className="text-left space-y-0.5">
                            <div className="text-xs font-extrabold text-[#1B8720]">
                              Foto Perbaikan Terlampir
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Klik untuk mengganti
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <Camera className="w-6 h-6 text-[#002147] dark:text-[#D2B48C]" />
                          <span className="text-xs font-semibold">
                            Unggah Foto Perbaikan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 19. TANDA TANGAN */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-[#002147] dark:text-slate-200">
                      TANDA TANGAN
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignatureUnlocked(true);
                          setTandaTanganUrl(SAMPLE_SIGNATURES[0]);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#002147] text-[#D2B48C] text-[11px] font-bold cursor-pointer"
                      >
                        Gunakan TTD Supervisor
                      </button>
                      {tandaTanganUrl && (
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 border border-rose-200 cursor-pointer"
                        >
                          <Eraser className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      if (!isSignatureUnlocked) {
                        setIsSignatureUnlocked(true);
                      }
                    }}
                    className="relative w-full h-52 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white overflow-hidden select-none touch-none shadow-inner"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSignatureUnlocked((prev) => !prev);
                      }}
                      title={
                        isSignatureUnlocked
                          ? 'Kunci Kotak Tanda Tangan'
                          : 'Buka Kunci Tanda Tangan'
                      }
                      className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {isSignatureUnlocked ? (
                        <LockOpen className="w-4 h-4 text-[#1B8720]" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    <canvas
                      ref={canvasRef}
                      data-testid="audit-signature-canvas"
                      width={600}
                      height={208}
                      onPointerDown={startDrawing}
                      onPointerMove={drawMove}
                      onPointerUp={finishDrawing}
                      onPointerCancel={finishDrawing}
                      onPointerLeave={finishDrawing}
                      className={`w-full h-full touch-none select-none ${
                        isSignatureUnlocked
                          ? 'cursor-crosshair'
                          : 'cursor-pointer'
                      }`}
                    />

                    {tandaTanganUrl &&
                      !isDrawing &&
                      tandaTanganUrl.startsWith('/assets/') && (
                        <img
                          src={tandaTanganUrl}
                          alt="Tanda Tangan"
                          className="pointer-events-none absolute inset-0 m-auto max-h-36 object-contain"
                        />
                      )}

                    <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-xs sm:text-sm font-semibold text-slate-500">
                      {isSignatureUnlocked
                        ? 'Sentuh / goreskan tanda tangan di area ini'
                        : 'Sentuh untuk membuka kunci tanda tangan'}
                    </div>
                  </div>
                </div>

                {/* Bottom Form Save / Cancel Bar */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('cards')}
                    className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B8720] hover:bg-[#146918] text-white text-xs sm:text-sm font-extrabold shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Data ke Tabel Rekap Supervisi</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 3: GAMBAR NO. 5 — TABEL REKAP SUPERVISI & CEKLIST RUANGAN
          (TAB SHEET DI ATAS TABEL SATU LAYAR PENUH + TEMA WARNA SIKESLING RSAM)
         ===================================================================== */}
      {mode === 'table' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#D2B48C]/50 dark:border-slate-700 shadow-xl overflow-hidden">
          {/* Top Full-Width Sheet Switcher Bar (All 10 Room Sheets Visible Without Horizontal Scroll) */}
          <div
            data-testid="rekap-sheet-tabs"
            className="bg-[#FAF6F0] dark:bg-slate-800/90 border-b border-[#D2B48C]/50 dark:border-slate-700 p-2 select-none"
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 w-full">
              {SUPERVISI_CARDS.map((card) => {
                const isSelected = activeCardId === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    data-testid={`sheet-tab-${card.id}`}
                    onClick={() => setActiveCardId(card.id)}
                    className={`w-full min-h-[38px] px-1.5 py-1.5 rounded-lg text-[10px] xl:text-[10.5px] leading-tight font-extrabold uppercase tracking-tight text-center flex items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#002147] text-[#D2B48C] border-[#002147] shadow-sm ring-1 ring-[#D2B48C]/60'
                        : 'bg-white dark:bg-slate-900 hover:bg-[#002147]/5 dark:hover:bg-slate-700 text-[#002147] dark:text-slate-200 border-[#D2B48C]/40 dark:border-slate-700'
                    }`}
                  >
                    <span className="line-clamp-2 break-words">
                      {card.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Themed Report Title Header */}
          <div className="bg-gradient-to-r from-[#002147] via-[#002b5c] to-[#002147] text-[#FAF6F0] px-4 py-3 border-b border-[#D2B48C]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <div className="text-sm sm:text-base lg:text-lg font-extrabold tracking-tight uppercase text-[#FAF6F0]">
                {activeCardConfig.reportTitle}
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#D2B48C] mt-0.5">
                UOBK RSUD AL-MULK KOTA SUKABUMI BULAN FEBRUARI 2026
              </div>
            </div>
            <div className="inline-flex items-center self-start sm:self-auto px-2.5 py-1 rounded-md bg-[#FAF6F0]/10 border border-[#D2B48C]/40 text-[#D2B48C] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
              Sheet Aktif: {activeCardConfig.title}
            </div>
          </div>

          {/* Dynamic Full-Width Table: Room Checklist Table (9 rooms) OR Supervisi Audit Table (10th card) */}
          <div className="w-full overflow-x-hidden bg-white dark:bg-slate-900 text-[#002147] dark:text-slate-100">
            {activeCardConfig.kind === 'room_checklist' ? (
              <table
                data-testid="rekap-room-table"
                className="w-full table-fixed border-collapse text-[8px] xl:text-[8.5px] leading-tight"
              >
                <thead>
                  <tr className="bg-[#002147] text-[#FAF6F0] font-extrabold uppercase text-center border-b-2 border-[#D2B48C]">
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      TANGGAL
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[4.2%]">
                      HARI
                    </th>
                    {activeCardConfig.tasks.map((t) => (
                      <React.Fragment key={t.id}>
                        <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%] leading-snug">
                          {t.label}
                        </th>
                        {t.photoSlotLabels.length > 0 && (
                          <th className="border border-[#1e3a5f] px-0.5 py-2 w-[4.1%] text-[#D2B48C] leading-snug">
                            {t.photoSlotLabels[0]}
                          </th>
                        )}
                      </React.Fragment>
                    ))}
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      PETUGAS
                    </th>
                    {activeCardConfig.hasEvaluasiSupervisor && (
                      <th className="border border-[#1e3a5f] px-1 py-2 w-[8.5%]">
                        EVALUASI SUPERVISOR
                      </th>
                    )}
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[4.6%] text-[#D2B48C]">
                      TANDA TANGAN
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[2.8%]">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoomRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={20}
                        className="border border-[#D2B48C]/40 dark:border-slate-700 px-4 py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-[#FAF6F0]/40 dark:bg-slate-800/40"
                      >
                        Belum ada data rekapan untuk sheet {activeCardConfig.title}.
                      </td>
                    </tr>
                  ) : (
                    filteredRoomRecords.map((row) => (
                      <tr
                        key={row.id}
                        className="odd:bg-white even:bg-[#FAF6F0]/70 hover:bg-[#D2B48C]/15 dark:odd:bg-slate-900 dark:even:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors text-center align-middle"
                      >
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-semibold tabular-nums text-[8px] xl:text-[8.5px] text-[#002147] dark:text-slate-200">
                          {row.tanggal}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-extrabold text-[8px] xl:text-[8.5px] text-[#002147] dark:text-[#D2B48C]">
                          {row.hari}
                        </td>
                        {activeCardConfig.tasks.map((t) => {
                          const entry = row.taskEntries[t.id];
                          const status = entry?.status || t.positiveLabel;
                          const photos = (entry?.photos || []).filter(Boolean);
                          return (
                            <React.Fragment key={t.id}>
                              <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold">
                                <span
                                  className={`inline-block max-w-full px-1 py-0.5 rounded text-[7px] xl:text-[7.5px] font-extrabold tracking-tight ${
                                    status === 'TIDAK'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                      : 'bg-[#002147]/10 text-[#002147] dark:bg-[#D2B48C]/20 dark:text-[#D2B48C]'
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                              {t.photoSlotLabels.length > 0 && (
                                <td className="border border-[#D2B48C]/40 dark:border-slate-700 p-0.5">
                                  {photos.length > 0 ? (
                                    <div className="flex items-center justify-center gap-0.5">
                                      {photos.slice(0, 2).map((pUrl, pIdx) => (
                                        <button
                                          key={`${t.id}-${pIdx}`}
                                          type="button"
                                          onClick={() =>
                                            setLightboxImage({
                                              url: pUrl,
                                              title: `${t.label} — ${row.petugas} (${row.tanggal})`,
                                            })
                                          }
                                          className="block cursor-pointer"
                                          title="Klik untuk memperbesar foto"
                                        >
                                          <img
                                            src={pUrl}
                                            alt={t.label}
                                            className="w-9 h-10 object-cover rounded border border-[#D2B48C]/60 shadow-2xs"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </td>
                              )}
                            </React.Fragment>
                          );
                        })}
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-bold text-[8px] xl:text-[8.5px] text-[#002147] dark:text-slate-100">
                          {row.petugas}
                        </td>
                        {activeCardConfig.hasEvaluasiSupervisor && (
                          <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8px] xl:text-[8.5px] leading-snug text-slate-700 dark:text-slate-300">
                            {row.evaluasiSupervisor}
                          </td>
                        )}
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 p-0.5 bg-white">
                          {row.signatures?.[0] ? (
                            <img
                              src={row.signatures[0]}
                              alt={`TTD ${row.petugas}`}
                              className="w-11 h-10 object-contain mx-auto"
                            />
                          ) : null}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteRoomRecord(row.id)}
                            title="Hapus Baris"
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              /* Supervisi Audit Table (Themed SIKESLING RSAM & Full-Width Without Horizontal Scroll) */
              <table
                data-testid="rekap-audit-table"
                className="w-full table-fixed border-collapse text-[8px] xl:text-[9px] leading-tight"
              >
                <thead>
                  <tr className="bg-[#002147] text-[#FAF6F0] font-extrabold uppercase text-center border-b-2 border-[#D2B48C]">
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.4%]">
                      TANGGAL
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      SUPERVISOR
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[4.4%]">
                      UNIT
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.4%]">
                      NAMA PETUGAS
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      KERAPIHAN
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[3%] text-[#D2B48C] whitespace-nowrap">
                      SKOR
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      PROSEDUR
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[3%] text-[#D2B48C] whitespace-nowrap">
                      SKOR
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      ALAT DAN BAHAN
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[3%] text-[#D2B48C] whitespace-nowrap">
                      SKOR
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[6.2%]">
                      KESELAMATAN &amp; KESEHATAN KERJA (K3)
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[3%] text-[#D2B48C] whitespace-nowrap">
                      SKOR
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.8%]">
                      SIKAP DAN PERILAKU
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[3%] text-[#D2B48C] whitespace-nowrap">
                      SKOR
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[3.4%] text-[#D2B48C]">
                      TOTAL SKOR
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[5.2%] text-[#D2B48C] whitespace-nowrap">
                      KATEGORI
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[7.2%]">
                      TEMUAN
                    </th>
                    <th className="border border-[#1e3a5f] px-1 py-2 w-[7.2%]">
                      REKOMENDASI
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[4.4%] text-[#D2B48C]">
                      DOK. TEMUAN
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[4.8%] text-[#D2B48C]">
                      DOK. PERBAIKAN
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[4.6%] text-[#D2B48C]">
                      TANDA TANGAN
                    </th>
                    <th className="border border-[#1e3a5f] px-0.5 py-2 w-[2.8%] whitespace-nowrap">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={22}
                        className="border border-[#D2B48C]/40 dark:border-slate-700 px-4 py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-[#FAF6F0]/40 dark:bg-slate-800/40"
                      >
                        Belum ada data rekapan untuk sheet ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditRecords.map((row) => (
                      <tr
                        key={row.id}
                        className="odd:bg-white even:bg-[#FAF6F0]/70 hover:bg-[#D2B48C]/15 dark:odd:bg-slate-900 dark:even:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors text-center align-middle"
                      >
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-semibold tabular-nums text-[8.5px] xl:text-[9px] text-[#002147] dark:text-slate-200 break-words">
                          {row.tanggal}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8.5px] xl:text-[9px] text-slate-700 dark:text-slate-300 break-words">
                          {row.supervisor}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-extrabold text-[8.5px] xl:text-[9px] text-[#002147] dark:text-[#D2B48C] break-words">
                          {row.unit}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-semibold text-[8.5px] xl:text-[9px] text-[#002147] dark:text-slate-200 break-words">
                          {row.namaPetugas}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8px] xl:text-[8.5px] text-slate-700 dark:text-slate-300 break-words">
                          {row.kerapihan}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold tabular-nums text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0]/50 dark:bg-slate-800/40">
                          {row.skorKerapihan ?? ''}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8px] xl:text-[8.5px] text-slate-700 dark:text-slate-300 break-words">
                          {row.prosedur}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold tabular-nums text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0]/50 dark:bg-slate-800/40">
                          {row.skorProsedur ?? ''}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8px] xl:text-[8.5px] text-slate-700 dark:text-slate-300 break-words">
                          {row.alatDanBahan}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold tabular-nums text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0]/50 dark:bg-slate-800/40">
                          {row.skorAlatDanBahan ?? ''}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8px] xl:text-[8.5px] text-slate-700 dark:text-slate-300 break-words">
                          {row.k3}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold tabular-nums text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0]/50 dark:bg-slate-800/40">
                          {row.skorK3 ?? ''}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8px] xl:text-[8.5px] text-slate-700 dark:text-slate-300 break-words">
                          {row.sikapDanPerilaku}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold tabular-nums text-[#002147] dark:text-[#D2B48C] bg-[#FAF6F0]/50 dark:bg-slate-800/40">
                          {row.skorSikapDanPerilaku ?? ''}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5 font-extrabold tabular-nums text-[9.5px] text-[#002147] dark:text-[#D2B48C] bg-[#D2B48C]/20 dark:bg-slate-800">
                          {row.totalSkor ?? ''}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 font-extrabold text-[8px] xl:text-[8.5px] break-words">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[#002147] text-[#D2B48C]">
                            {row.kategori}
                          </span>
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8.5px] xl:text-[9px] leading-snug text-slate-800 dark:text-slate-200 break-words">
                          {row.temuan}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-1 py-1.5 text-[8.5px] xl:text-[9px] leading-snug text-slate-800 dark:text-slate-200 break-words">
                          {row.rekomendasi}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 p-0.5">
                          {row.dokumentasiTemuanUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: row.dokumentasiTemuanUrl,
                                  title: `Dokumentasi Temuan — ${row.unit} (${row.tanggal})`,
                                })
                              }
                              className="block mx-auto group relative cursor-pointer"
                              title="Klik untuk memperbesar foto"
                            >
                              <img
                                src={row.dokumentasiTemuanUrl}
                                alt={row.temuan || 'Dokumentasi Temuan'}
                                className="w-11 h-14 object-cover mx-auto rounded border border-[#D2B48C]/60 shadow-2xs"
                              />
                            </button>
                          ) : null}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 p-0.5">
                          {row.dokumentasiPerbaikanUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: row.dokumentasiPerbaikanUrl,
                                  title: `Dokumentasi Perbaikan — ${row.unit} (${row.tanggal})`,
                                })
                              }
                              className="block mx-auto group relative cursor-pointer"
                              title="Klik untuk memperbesar foto"
                            >
                              <img
                                src={row.dokumentasiPerbaikanUrl}
                                alt="Dokumentasi Perbaikan"
                                className="w-11 h-14 object-cover mx-auto rounded border border-[#D2B48C]/60 shadow-2xs"
                              />
                            </button>
                          ) : null}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 p-0.5 bg-white">
                          {row.tandaTanganUrl ? (
                            <img
                              src={row.tandaTanganUrl}
                              alt={`Tanda Tangan ${row.namaPetugas}`}
                              className="w-12 h-12 object-contain mx-auto"
                            />
                          ) : null}
                        </td>
                        <td className="border border-[#D2B48C]/40 dark:border-slate-700 px-0.5 py-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteAuditRecord(row.id)}
                            title="Hapus Baris"
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Enlarging Documentation Photos */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full rounded-2xl bg-white p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="text-xs font-extrabold text-[#002147]">
                {lightboxImage.title}
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[70vh] object-contain rounded-lg bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
