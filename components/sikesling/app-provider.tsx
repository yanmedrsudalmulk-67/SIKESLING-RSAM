'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  UserRole,
  DailyActivityRecord,
  SupervisionRecord,
  FindingFollowUpRecord,
  ScheduleRecord,
  MasterRoomItem,
  MasterStandardItem,
  FindingStatus,
  canTransitionFindingStatus,
} from '@/lib/domain';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface HospitalProfileConfig {
  institutionName: string;
  shortName: string;
  unitName: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  headOfUnit: string;
}

interface AppContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUserName: string;

  // Operational & Supervision Session Records (starts empty by default per Rule 4)
  activities: DailyActivityRecord[];
  addActivity: (record: Omit<DailyActivityRecord, 'id' | 'createdAt' | 'status'>) => void;
  supervisions: SupervisionRecord[];
  addSupervision: (record: Omit<SupervisionRecord, 'id' | 'createdAt'>) => void;
  findings: FindingFollowUpRecord[];
  addFinding: (
    record: Omit<FindingFollowUpRecord, 'id' | 'code' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateFindingStatus: (
    findingId: string,
    nextStatus: FindingStatus,
    notes?: string
  ) => { ok: boolean; error?: string };
  schedules: ScheduleRecord[];
  addSchedule: (record: Omit<ScheduleRecord, 'id'>) => void;
  toggleScheduleStatus: (scheduleId: string) => void;

  // Configurable Master Data References (Rule 14: Data-Driven Design, not locked)
  masterRooms: MasterRoomItem[];
  addMasterRoom: (room: Omit<MasterRoomItem, 'id'>) => void;
  toggleMasterRoomStatus: (roomId: string) => void;
  masterActivityCategories: { id: string; code: string; name: string; isActive: boolean }[];
  addMasterActivityCategory: (name: string, code: string) => void;
  masterOfficers: { id: string; name: string; nip: string; position: string; isActive: boolean }[];
  addMasterOfficer: (officer: { name: string; nip: string; position: string }) => void;
  masterStandards: MasterStandardItem[];
  addMasterStandard: (std: Omit<MasterStandardItem, 'id'>) => void;

  hospitalProfile: HospitalProfileConfig;
  updateHospitalProfile: (profile: Partial<HospitalProfileConfig>) => void;

  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const INITIAL_ROOMS: MasterRoomItem[] = [
  {
    id: 'rm-1',
    code: 'R-IGD-01',
    name: 'Instalasi Gawat Darurat (IGD)',
    unitName: 'Instalasi Gawat Darurat',
    building: 'Gedung Utama Lt. 1',
    isActive: true,
  },
  {
    id: 'rm-2',
    code: 'R-RANAP-01',
    name: 'Ruang Rawat Inap Dewasa',
    unitName: 'Instalasi Rawat Inap',
    building: 'Gedung Perawatan Lt. 2',
    isActive: true,
  },
  {
    id: 'rm-3',
    code: 'R-GIZI-01',
    name: 'Dapur & Penyelenggaraan Makanan',
    unitName: 'Instalasi Gizi',
    building: 'Gedung Penunjang',
    isActive: true,
  },
  {
    id: 'rm-4',
    code: 'R-IPAL-01',
    name: 'Area Instalasi Pengolahan Air Limbah (IPAL)',
    unitName: 'Unit Kesehatan Lingkungan',
    building: 'Area Utilitas Belakang',
    isActive: true,
  },
  {
    id: 'rm-5',
    code: 'R-TPSB3-01',
    name: 'TPS Limbah B3 & Medis Padat',
    unitName: 'Unit Kesehatan Lingkungan',
    building: 'Area Utilitas Belakang',
    isActive: true,
  },
];

const INITIAL_ACTIVITY_CATEGORIES = [
  { id: 'cat-1', code: 'KEG-01', name: 'Inspeksi Sanitasi & Kebersihan Ruangan', isActive: true },
  { id: 'cat-2', code: 'KEG-02', name: 'Pemantauan Operasional Harian IPAL', isActive: true },
  { id: 'cat-3', code: 'KEG-03', name: 'Pengelolaan & Penimbangan Limbah Medis/B3', isActive: true },
  { id: 'cat-4', code: 'KEG-04', name: 'Pemantauan Kualitas Air Bersih', isActive: true },
  { id: 'cat-5', code: 'KEG-05', name: 'Pengendalian Vektor & Binatang Pengganggu', isActive: true },
  { id: 'cat-6', code: 'KEG-06', name: 'Pengawasan Higiene Sanitasi Pangan', isActive: true },
];

const INITIAL_OFFICERS = [
  {
    id: 'off-1',
    name: 'Petugas Sanitarian Pelaksana',
    nip: 'Konfigurasi Master Data',
    position: 'Sanitarian / Petugas Kesling',
    isActive: true,
  },
  {
    id: 'off-2',
    name: 'Koordinator Kesehatan Lingkungan',
    nip: 'Konfigurasi Master Data',
    position: 'Koordinator Kesling',
    isActive: true,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('Petugas Kesling');

  // Strict Rule 4: Start with 0 operational statistics so no fake hospital data is shown
  const [activities, setActivities] = useState<DailyActivityRecord[]>([]);
  const [supervisions, setSupervisions] = useState<SupervisionRecord[]>([]);
  const [findings, setFindings] = useState<FindingFollowUpRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);

  const [masterRooms, setMasterRooms] = useState<MasterRoomItem[]>(INITIAL_ROOMS);
  const [masterActivityCategories, setMasterActivityCategories] = useState(
    INITIAL_ACTIVITY_CATEGORIES
  );
  const [masterOfficers, setMasterOfficers] = useState(INITIAL_OFFICERS);
  const [masterStandards, setMasterStandards] = useState<MasterStandardItem[]>([]);

  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfileConfig>({
    institutionName: 'UOBK RSUD Al-Mulk Kota Sukabumi',
    shortName: 'RSUD Al-Mulk',
    unitName: 'Unit Kesehatan Lingkungan (Kesling)',
    city: 'Kota Sukabumi, Jawa Barat',
    address: 'Jl. Pelabuhan II KM. 6, Lembursitu, Kota Sukabumi',
    phone: '(0266) — Konfigurasi Instansi',
    email: 'kesling@rsudalmulk.sukabumikota.go.id',
    headOfUnit: 'Belum Dikonfigurasi (Tahap Foundation)',
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedTheme = localStorage.getItem('sikesling-theme') as ThemeMode | null;
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeState(savedTheme);
        }
        const savedAct = sessionStorage.getItem('sikesling-activities');
        if (savedAct) setActivities(JSON.parse(savedAct));
        const savedSup = sessionStorage.getItem('sikesling-supervisions');
        if (savedSup) setSupervisions(JSON.parse(savedSup));
        const savedFnd = sessionStorage.getItem('sikesling-findings');
        if (savedFnd) setFindings(JSON.parse(savedFnd));
        const savedSch = sessionStorage.getItem('sikesling-schedules');
        if (savedSch) setSchedules(JSON.parse(savedSch));
      } catch {
        // ignore storage errors
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem('sikesling-activities', JSON.stringify(activities));
      sessionStorage.setItem('sikesling-supervisions', JSON.stringify(supervisions));
      sessionStorage.setItem('sikesling-findings', JSON.stringify(findings));
      sessionStorage.setItem('sikesling-schedules', JSON.stringify(schedules));
    } catch {
      // ignore storage errors
    }
  }, [activities, supervisions, findings, schedules, hydrated]);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'dark'
      ? 'dark'
      : hydrated &&
          theme === 'system' &&
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (hydrated) {
      try {
        localStorage.setItem('sikesling-theme', theme);
      } catch {
        // ignore storage errors
      }
    }
  }, [theme, resolvedTheme, hydrated]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const pushToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addActivity = (
    record: Omit<DailyActivityRecord, 'id' | 'createdAt' | 'status'>
  ) => {
    const newItem: DailyActivityRecord = {
      ...record,
      id: `ACT-${Date.now().toString().slice(-6)}`,
      status: 'Tercatat (Sesi Lokal)',
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newItem, ...prev]);
    pushToast({
      type: 'success',
      title: 'Draft Kegiatan Sesi Lokal Tercatat',
      message:
        'Data kegiatan ditambahkan ke sesi lokal untuk uji alur kerja (belum disimpan ke PostgreSQL).',
    });
  };

  const addSupervision = (record: Omit<SupervisionRecord, 'id' | 'createdAt'>) => {
    const supId = `SUP-${Date.now().toString().slice(-6)}`;
    const newItem: SupervisionRecord = {
      ...record,
      id: supId,
      createdAt: new Date().toISOString(),
    };
    setSupervisions((prev) => [newItem, ...prev]);

    if (record.findings && record.findings.trim().length > 0) {
      const findingCode = `TMN-${String(findings.length + 1).padStart(3, '0')}`;
      const newFinding: FindingFollowUpRecord = {
        id: `FND-${Date.now().toString().slice(-6)}`,
        code: findingCode,
        date: record.date,
        location: record.roomOrUnit,
        category: record.category,
        description: record.findings,
        recommendation: record.recommendations || 'Menunggu arahan tindak lanjut',
        picName: record.officerName,
        targetDate: record.date,
        priority: record.priority,
        status: 'Temuan Baru',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFindings((prev) => [newFinding, ...prev]);
    }

    pushToast({
      type: 'info',
      title: 'Rancangan Supervisi Dicatat (Sesi Lokal)',
      message:
        'Formulir supervisi disimpan pada memori sesi browser dan terhubung ke daftar Tindak Lanjut Temuan.',
    });
  };

  const addFinding = (
    record: Omit<FindingFollowUpRecord, 'id' | 'code' | 'createdAt' | 'updatedAt'>
  ) => {
    const findingCode = `TMN-${String(findings.length + 1).padStart(3, '0')}`;
    const newFinding: FindingFollowUpRecord = {
      ...record,
      id: `FND-${Date.now().toString().slice(-6)}`,
      code: findingCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFindings((prev) => [newFinding, ...prev]);
    pushToast({
      type: 'success',
      title: `Temuan ${findingCode} Ditambahkan (Sesi Lokal)`,
      message: 'Temuan baru siap diproses pada alur Tindak Lanjut Temuan.',
    });
  };

  const updateFindingStatus = (
    findingId: string,
    nextStatus: FindingStatus,
    notes?: string
  ): { ok: boolean; error?: string } => {
    const target = findings.find((f) => f.id === findingId);
    if (!target) {
      return { ok: false, error: 'Data temuan tidak ditemukan.' };
    }

    const check = canTransitionFindingStatus(target.status, nextStatus, currentRole);
    if (!check.allowed) {
      pushToast({
        type: 'error',
        title: 'Perubahan Status Ditolak (RBAC / Alur Kerja)',
        message: check.reason || 'Akses ditolak.',
      });
      return { ok: false, error: check.reason };
    }

    setFindings((prev) =>
      prev.map((item) =>
        item.id === findingId
          ? {
              ...item,
              status: nextStatus,
              verificationNotes: notes || item.verificationNotes,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    pushToast({
      type: 'success',
      title: `Status Diperbarui: ${nextStatus}`,
      message: `Temuan ${target.code} berhasil dipindahkan ke tahap "${nextStatus}".`,
    });

    return { ok: true };
  };

  const addSchedule = (record: Omit<ScheduleRecord, 'id'>) => {
    const newSched: ScheduleRecord = {
      ...record,
      id: `SCH-${Date.now().toString().slice(-6)}`,
    };
    setSchedules((prev) => [newSched, ...prev]);
    pushToast({
      type: 'info',
      title: 'Jadwal Kegiatan Ditambahkan (Sesi Lokal)',
      message: `Agenda "${record.title}" terdaftar pada kalender sesi ini.`,
    });
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? { ...s, status: s.status === 'Terjadwal' ? 'Selesai' : 'Terjadwal' }
          : s
      )
    );
  };

  const addMasterRoom = (room: Omit<MasterRoomItem, 'id'>) => {
    setMasterRooms((prev) => [
      ...prev,
      { ...room, id: `rm-${Date.now().toString().slice(-5)}` },
    ]);
    pushToast({
      type: 'success',
      title: 'Master Ruangan Ditambahkan',
      message: `Ruangan "${room.name}" siap dipilih pada formulir operasional dan supervisi.`,
    });
  };

  const toggleMasterRoomStatus = (roomId: string) => {
    setMasterRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const addMasterActivityCategory = (name: string, code: string) => {
    setMasterActivityCategories((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, code, name, isActive: true },
    ]);
    pushToast({
      type: 'success',
      title: 'Kategori Kegiatan Ditambahkan',
      message: `Kategori "${name}" berhasil ditambahkan ke daftar pilihan dinamis.`,
    });
  };

  const addMasterOfficer = (officer: { name: string; nip: string; position: string }) => {
    setMasterOfficers((prev) => [
      ...prev,
      { ...officer, id: `off-${Date.now()}`, isActive: true },
    ]);
    pushToast({
      type: 'success',
      title: 'Data Petugas Ditambahkan',
      message: `Petugas "${officer.name}" berhasil ditambahkan ke Master Data.`,
    });
  };

  const addMasterStandard = (std: Omit<MasterStandardItem, 'id'>) => {
    setMasterStandards((prev) => [
      ...prev,
      { ...std, id: `std-${Date.now().toString().slice(-5)}` },
    ]);
    pushToast({
      type: 'success',
      title: 'Referensi Standar Dicatat',
      message: `Referensi "${std.standardName}" ditambahkan ke Master Standar & Regulasi.`,
    });
  };

  const updateHospitalProfile = (profile: Partial<HospitalProfileConfig>) => {
    setHospitalProfile((prev) => ({ ...prev, ...profile }));
    pushToast({
      type: 'success',
      title: 'Profil Instansi Diperbarui (Sesi Lokal)',
      message: 'Perubahan konfigurasi profil rumah sakit diterapkan pada sesi ini.',
    });
  };

  const roleUserMap: Record<UserRole, string> = {
    Administrator: 'Admin Sistem SIKESLING',
    'Petugas Kesling': 'Sanitarian Pelaksana',
    'Koordinator Kesling': 'Koordinator Kesling RSAM',
    'Pimpinan / Viewer': 'Manajemen RSUD Al-Mulk',
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        reducedMotion,
        setReducedMotion,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        currentRole,
        setCurrentRole,
        currentUserName: roleUserMap[currentRole],
        activities,
        addActivity,
        supervisions,
        addSupervision,
        findings,
        addFinding,
        updateFindingStatus,
        schedules,
        addSchedule,
        toggleScheduleStatus,
        masterRooms,
        addMasterRoom,
        toggleMasterRoomStatus,
        masterActivityCategories,
        addMasterActivityCategory,
        masterOfficers,
        addMasterOfficer,
        masterStandards,
        addMasterStandard,
        hospitalProfile,
        updateHospitalProfile,
        toasts,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
