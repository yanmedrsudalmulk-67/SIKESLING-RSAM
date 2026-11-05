'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
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
import {
  WaterQualityRow,
  WaterPeriodicReportRow,
  createInitialWaterQualityData,
  ensureCompleteWaterQualityRows,
  createInitialWaterPeriodicReports,
  ensureCompleteWaterPeriodicReports,
} from '@/lib/water-quality';
import {
  WastewaterRow,
  createInitialWastewaterData,
} from '@/lib/wastewater-quality';
import {
  SolidWasteSnapshotRow,
  FoodSanitationSnapshotRow,
  AirQualitySnapshotItem,
  VectorFindingsSnapshotMap,
  createDefaultMonitoringDataset,
} from '@/lib/dashboard-monitoring-trends';
import {
  INITIAL_HOSPITAL_PROFILE,
  INITIAL_MASTER_ACTIVITY_CATEGORIES,
  INITIAL_MASTER_OFFICERS,
  INITIAL_MASTER_ROOMS,
  INITIAL_FINDINGS,
  INITIAL_VECTOR_UNITS,
  SikeslingCloudCollectionKey,
  SikeslingCloudState,
  SupabaseSyncDiagnostic,
} from '@/lib/supabase';
import {
  MedicalWasteLogRow,
  createRealtimeInitialMedicalWasteLogbook,
} from '@/lib/medical-waste-logbook';
import {
  SaranaPrasaranaDataset,
  createInitialSaranaPrasaranaData,
} from '@/lib/sarana-prasarana';
import {
  LinenMonitoringRow,
  createInitialLinenMonitoringData,
} from '@/lib/linen-monitoring';
import {
  RadiationMonitoringRow,
  createInitialRadiationMonitoringData,
} from '@/lib/radiation-monitoring';

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

  // Operational & Supervision Records (Synced with Supabase)
  activities: DailyActivityRecord[];
  addActivity: (
    record: Omit<DailyActivityRecord, 'id' | 'createdAt' | 'status'>
  ) => void;
  supervisions: SupervisionRecord[];
  addSupervision: (record: Omit<SupervisionRecord, 'id' | 'createdAt'>) => void;
  findings: FindingFollowUpRecord[];
  addFinding: (
    record: Omit<
      FindingFollowUpRecord,
      'id' | 'code' | 'createdAt' | 'updatedAt'
    >
  ) => void;
  updateFindingStatus: (
    findingId: string,
    nextStatus: FindingStatus,
    notes?: string
  ) => { ok: boolean; error?: string };
  schedules: ScheduleRecord[];
  addSchedule: (record: Omit<ScheduleRecord, 'id'>) => void;
  toggleScheduleStatus: (scheduleId: string) => void;

  // Configurable Master Data References (Synced with Supabase)
  masterRooms: MasterRoomItem[];
  addMasterRoom: (room: Omit<MasterRoomItem, 'id'>) => void;
  toggleMasterRoomStatus: (roomId: string) => void;
  masterActivityCategories: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  }[];
  addMasterActivityCategory: (name: string, code: string) => void;
  masterOfficers: {
    id: string;
    name: string;
    nip: string;
    position: string;
    isActive: boolean;
  }[];
  addMasterOfficer: (officer: {
    name: string;
    nip: string;
    position: string;
  }) => void;
  masterStandards: MasterStandardItem[];
  addMasterStandard: (std: Omit<MasterStandardItem, 'id'>) => void;

  hospitalProfile: HospitalProfileConfig;
  updateHospitalProfile: (profile: Partial<HospitalProfileConfig>) => void;

  // Environmental Monitoring Datasets (Synced with Supabase — No Local Storage)
  waterRows: WaterQualityRow[];
  updateWaterRows: (rows: WaterQualityRow[]) => Promise<boolean>;
  waterPeriodicReports: WaterPeriodicReportRow[];
  updateWaterPeriodicReports: (rows: WaterPeriodicReportRow[]) => Promise<boolean>;
  airItems: AirQualitySnapshotItem[];
  updateAirItems: (items: AirQualitySnapshotItem[]) => Promise<boolean>;
  wastewaterRows: WastewaterRow[];
  updateWastewaterRows: (rows: WastewaterRow[]) => Promise<boolean>;
  solidWasteRows: SolidWasteSnapshotRow[];
  updateSolidWasteRows: (rows: SolidWasteSnapshotRow[]) => Promise<boolean>;
  medicalWasteLogbookRows: MedicalWasteLogRow[];
  saveMedicalWasteLogbookRows: (rows: MedicalWasteLogRow[]) => Promise<boolean>;
  vectorFindings: VectorFindingsSnapshotMap;
  updateVectorFindings: (findings: VectorFindingsSnapshotMap) => Promise<boolean>;
  vectorUnits: string[];
  updateVectorUnits: (units: string[]) => Promise<boolean>;
  foodRows: FoodSanitationSnapshotRow[];
  updateFoodRows: (rows: FoodSanitationSnapshotRow[]) => Promise<boolean>;
  saranaPrasaranaData: SaranaPrasaranaDataset;
  updateSaranaPrasaranaData: (data: SaranaPrasaranaDataset) => Promise<boolean>;
  linenRows: LinenMonitoringRow[];
  updateLinenRows: (rows: LinenMonitoringRow[]) => Promise<boolean>;
  radiationRows: RadiationMonitoringRow[];
  updateRadiationRows: (rows: RadiationMonitoringRow[]) => Promise<boolean>;

  // Supabase Cloud Diagnostics & Manual Sync Controls
  supabaseDiagnostic: SupabaseSyncDiagnostic | null;
  isSyncingSupabase: boolean;
  syncAllToSupabase: () => Promise<void>;
  refreshFromSupabase: () => Promise<void>;

  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialMonitoringDefaults = createDefaultMonitoringDataset(2026, []);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('Petugas Kesling');

  // Operational, Supervision, Findings, Schedules
  const [activities, setActivities] = useState<DailyActivityRecord[]>([]);
  const [supervisions, setSupervisions] = useState<SupervisionRecord[]>([]);
  const [findings, setFindings] = useState<FindingFollowUpRecord[]>(INITIAL_FINDINGS);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);

  // Master Data & Hospital Profile
  const [masterRooms, setMasterRooms] =
    useState<MasterRoomItem[]>(INITIAL_MASTER_ROOMS);
  const [masterActivityCategories, setMasterActivityCategories] = useState(
    INITIAL_MASTER_ACTIVITY_CATEGORIES
  );
  const [masterOfficers, setMasterOfficers] = useState(INITIAL_MASTER_OFFICERS);
  const [masterStandards, setMasterStandards] = useState<MasterStandardItem[]>(
    []
  );
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfileConfig>(
    INITIAL_HOSPITAL_PROFILE
  );

  // 6 Environmental Monitoring Datasets (Backed by Supabase REST v1)
  const [waterRows, setWaterRows] = useState<WaterQualityRow[]>(() =>
    createInitialWaterQualityData(2026)
  );
  const [waterPeriodicReports, setWaterPeriodicReports] = useState<WaterPeriodicReportRow[]>(
    () => createInitialWaterPeriodicReports(2026)
  );
  const [airItems, setAirItems] = useState<AirQualitySnapshotItem[]>(
    initialMonitoringDefaults.airItems
  );
  const [wastewaterRows, setWastewaterRows] = useState<WastewaterRow[]>(() =>
    createInitialWastewaterData(2026)
  );
  const [solidWasteRows, setSolidWasteRows] = useState<SolidWasteSnapshotRow[]>(
    initialMonitoringDefaults.solidWasteRows
  );
  const [medicalWasteLogbookRows, setMedicalWasteLogbookRows] = useState<
    MedicalWasteLogRow[]
  >(() => createRealtimeInitialMedicalWasteLogbook());
  const [vectorFindings, setVectorFindings] =
    useState<VectorFindingsSnapshotMap>(
      initialMonitoringDefaults.vectorFindings
    );
  const [vectorUnits, setVectorUnits] =
    useState<string[]>(INITIAL_VECTOR_UNITS);
  const [foodRows, setFoodRows] = useState<FoodSanitationSnapshotRow[]>(
    initialMonitoringDefaults.foodRows
  );
  const [saranaPrasaranaData, setSaranaPrasaranaData] = useState<SaranaPrasaranaDataset>(() =>
    createInitialSaranaPrasaranaData(2026)
  );
  const [linenRows, setLinenRows] = useState<LinenMonitoringRow[]>(() =>
    createInitialLinenMonitoringData()
  );
  const [radiationRows, setRadiationRows] = useState<RadiationMonitoringRow[]>(() =>
    createInitialRadiationMonitoringData()
  );

  const [supabaseDiagnostic, setSupabaseDiagnostic] =
    useState<SupabaseSyncDiagnostic | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const applyCloudState = useCallback((cloud: Partial<SikeslingCloudState>) => {
    if (
      Array.isArray(cloud.water_quality_2026) &&
      cloud.water_quality_2026.length > 0
    ) {
      setWaterRows(ensureCompleteWaterQualityRows(cloud.water_quality_2026));
    }
    if (
      Array.isArray(cloud.water_periodic_reports) &&
      cloud.water_periodic_reports.length > 0
    ) {
      setWaterPeriodicReports(
        ensureCompleteWaterPeriodicReports(cloud.water_periodic_reports)
      );
    }
    if (Array.isArray(cloud.air_quality_items)) {
      setAirItems(cloud.air_quality_items);
    }
    if (
      Array.isArray(cloud.wastewater_quality_2026) &&
      cloud.wastewater_quality_2026.length > 0
    ) {
      setWastewaterRows(cloud.wastewater_quality_2026);
    }
    if (
      Array.isArray(cloud.solid_waste_b3) &&
      cloud.solid_waste_b3.length === 12
    ) {
      setSolidWasteRows(cloud.solid_waste_b3);
    }
    if (
      Array.isArray(cloud.medical_waste_logbook) &&
      cloud.medical_waste_logbook.length > 0
    ) {
      setMedicalWasteLogbookRows(cloud.medical_waste_logbook);
    }
    if (cloud.vector_findings && typeof cloud.vector_findings === 'object') {
      setVectorFindings(cloud.vector_findings);
    }
    if (Array.isArray(cloud.vector_units) && cloud.vector_units.length > 0) {
      setVectorUnits(cloud.vector_units);
    }
    if (
      Array.isArray(cloud.food_sanitation) &&
      cloud.food_sanitation.length === 12
    ) {
      setFoodRows(cloud.food_sanitation);
    }
    if (cloud.sarana_prasarana && typeof cloud.sarana_prasarana === 'object') {
      setSaranaPrasaranaData(cloud.sarana_prasarana);
    }
    if (
      Array.isArray(cloud.linen_monitoring) &&
      cloud.linen_monitoring.length > 0
    ) {
      setLinenRows(cloud.linen_monitoring);
    }
    if (
      Array.isArray(cloud.radiation_monitoring) &&
      cloud.radiation_monitoring.length > 0
    ) {
      setRadiationRows(cloud.radiation_monitoring);
    }
    if (Array.isArray(cloud.activities)) {
      setActivities(cloud.activities);
    }
    if (Array.isArray(cloud.supervisions)) {
      setSupervisions(cloud.supervisions);
    }
    if (Array.isArray(cloud.findings)) {
      setFindings(cloud.findings);
    }
    if (Array.isArray(cloud.schedules)) {
      setSchedules(cloud.schedules);
    }
    if (Array.isArray(cloud.master_rooms) && cloud.master_rooms.length > 0) {
      setMasterRooms(cloud.master_rooms);
    }
    if (
      Array.isArray(cloud.master_activity_categories) &&
      cloud.master_activity_categories.length > 0
    ) {
      setMasterActivityCategories(cloud.master_activity_categories);
    }
    if (
      Array.isArray(cloud.master_officers) &&
      cloud.master_officers.length > 0
    ) {
      setMasterOfficers(cloud.master_officers);
    }
    if (Array.isArray(cloud.master_standards)) {
      setMasterStandards(cloud.master_standards);
    }
    if (cloud.hospital_profile && typeof cloud.hospital_profile === 'object') {
      setHospitalProfile(cloud.hospital_profile);
    }
  }, []);

  const persistCollectionToSupabase = useCallback(
    async (key: SikeslingCloudCollectionKey, payload: unknown) => {
      try {
        setIsSyncingSupabase(true);
        const res = await fetch('/api/supabase/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, payload }),
        });
        const data = await res.json();
        if (data?.diagnostic) {
          setSupabaseDiagnostic(data.diagnostic);
        }
      } catch {
        // Keep optimistic UI state on transient network failure
      } finally {
        setIsSyncingSupabase(false);
      }
    },
    []
  );

  const refreshFromSupabase = useCallback(async () => {
    try {
      setIsSyncingSupabase(true);
      const res = await fetch('/api/supabase/state', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.state) {
        applyCloudState(data.state);
      }
      if (data?.diagnostic) {
        setSupabaseDiagnostic(data.diagnostic);
      }
    } catch {
      // ignore initial network error
    } finally {
      setIsSyncingSupabase(false);
    }
  }, [applyCloudState]);

  const syncAllToSupabase = useCallback(async () => {
    try {
      setIsSyncingSupabase(true);
      const res = await fetch('/api/supabase/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_ALL' }),
      });
      const data = await res.json();
      if (data?.diagnostic) {
        setSupabaseDiagnostic(data.diagnostic);
      }
      if (data?.persistedToTable) {
        pushToast({
          type: 'success',
          title: 'Sinkronisasi Supabase Berhasil',
          message:
            'Seluruh 16 koleksi data SIKRESMI telah tersimpan di tabel Supabase.',
        });
      } else {
        pushToast({
          type: 'info',
          title: 'Endpoint Supabase Terautentikasi',
          message:
            data?.diagnostic?.statusMessage ||
            'Jalankan script SQL di Supabase SQL Editor untuk mengaktifkan penyimpanan tabel.',
        });
      }
    } catch {
      pushToast({
        type: 'error',
        title: 'Gagal Menghubungi Supabase',
        message: 'Periksa koneksi jaringan dan kredensial Supabase Anda.',
      });
    } finally {
      setIsSyncingSupabase(false);
    }
  }, [pushToast]);

  // Initial Hydration from Supabase REST v1 (No browser localStorage / sessionStorage for data)
  useEffect(() => {
    setHydrated(true);
    void refreshFromSupabase();
  }, [refreshFromSupabase]);

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
  }, [resolvedTheme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  // Monitoring Updaters (Sync directly to Supabase)
  const updateWaterRows = useCallback(
    async (rows: WaterQualityRow[]): Promise<boolean> => {
      setWaterRows(rows);
      await persistCollectionToSupabase('water_quality_2026', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateWaterPeriodicReports = useCallback(
    async (rows: WaterPeriodicReportRow[]): Promise<boolean> => {
      setWaterPeriodicReports(rows);
      await persistCollectionToSupabase('water_periodic_reports', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateAirItems = useCallback(
    async (items: AirQualitySnapshotItem[]): Promise<boolean> => {
      setAirItems(items);
      await persistCollectionToSupabase('air_quality_items', items);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateWastewaterRows = useCallback(
    async (rows: WastewaterRow[]): Promise<boolean> => {
      setWastewaterRows(rows);
      await persistCollectionToSupabase('wastewater_quality_2026', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateSolidWasteRows = useCallback(
    async (rows: SolidWasteSnapshotRow[]): Promise<boolean> => {
      setSolidWasteRows(rows);
      await persistCollectionToSupabase('solid_waste_b3', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const saveMedicalWasteLogbookRows = useCallback(
    async (rows: MedicalWasteLogRow[]): Promise<boolean> => {
      setMedicalWasteLogbookRows(rows);
      await persistCollectionToSupabase('medical_waste_logbook', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateVectorFindings = useCallback(
    async (nextFindings: VectorFindingsSnapshotMap): Promise<boolean> => {
      setVectorFindings(nextFindings);
      await persistCollectionToSupabase('vector_findings', nextFindings);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateVectorUnits = useCallback(
    async (units: string[]): Promise<boolean> => {
      setVectorUnits(units);
      await persistCollectionToSupabase('vector_units', units);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateFoodRows = useCallback(
    async (rows: FoodSanitationSnapshotRow[]): Promise<boolean> => {
      setFoodRows(rows);
      await persistCollectionToSupabase('food_sanitation', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateSaranaPrasaranaData = useCallback(
    async (data: SaranaPrasaranaDataset): Promise<boolean> => {
      setSaranaPrasaranaData(data);
      await persistCollectionToSupabase('sarana_prasarana', data);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateLinenRows = useCallback(
    async (rows: LinenMonitoringRow[]): Promise<boolean> => {
      setLinenRows(rows);
      await persistCollectionToSupabase('linen_monitoring', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  const updateRadiationRows = useCallback(
    async (rows: RadiationMonitoringRow[]): Promise<boolean> => {
      setRadiationRows(rows);
      await persistCollectionToSupabase('radiation_monitoring', rows);
      return true;
    },
    [persistCollectionToSupabase]
  );

  // Operational & Supervision Updaters (Sync directly to Supabase)
  const addActivity = (
    record: Omit<DailyActivityRecord, 'id' | 'createdAt' | 'status'>
  ) => {
    const newItem: DailyActivityRecord = {
      ...record,
      id: `ACT-${Date.now().toString().slice(-6)}`,
      status: 'Tersimpan di Supabase',
      createdAt: new Date().toISOString(),
    };
    const next = [newItem, ...activities];
    setActivities(next);
    void persistCollectionToSupabase('activities', next);
    pushToast({
      type: 'success',
      title: 'Kegiatan Tersimpan ke Supabase',
      message:
        'Data kegiatan harian berhasil disinkronkan secara realtime dengan Supabase.',
    });
  };

  const addSupervision = (
    record: Omit<SupervisionRecord, 'id' | 'createdAt'>
  ) => {
    const supId = `SUP-${Date.now().toString().slice(-6)}`;
    const newItem: SupervisionRecord = {
      ...record,
      id: supId,
      createdAt: new Date().toISOString(),
    };
    const nextSups = [newItem, ...supervisions];
    setSupervisions(nextSups);
    void persistCollectionToSupabase('supervisions', nextSups);

    if (record.findings && record.findings.trim().length > 0) {
      const findingCode = `TMN-${String(findings.length + 1).padStart(3, '0')}`;
      const newFinding: FindingFollowUpRecord = {
        id: `FND-${Date.now().toString().slice(-6)}`,
        code: findingCode,
        date: record.date,
        location: record.roomOrUnit,
        category: record.category,
        description: record.findings,
        recommendation:
          record.recommendations || 'Menunggu arahan tindak lanjut',
        picName: record.officerName,
        targetDate: record.date,
        priority: record.priority,
        status: 'Temuan Baru',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const nextFindings = [newFinding, ...findings];
      setFindings(nextFindings);
      void persistCollectionToSupabase('findings', nextFindings);
    }

    pushToast({
      type: 'info',
      title: 'Supervisi Tersimpan ke Supabase',
      message:
        'Formulir supervisi telah disinkronkan ke Supabase dan terhubung ke daftar Tindak Lanjut Temuan.',
    });
  };

  const addFinding = (
    record: Omit<
      FindingFollowUpRecord,
      'id' | 'code' | 'createdAt' | 'updatedAt'
    >
  ) => {
    const findingCode = `TMN-${String(findings.length + 1).padStart(3, '0')}`;
    const newFinding: FindingFollowUpRecord = {
      ...record,
      id: `FND-${Date.now().toString().slice(-6)}`,
      code: findingCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [newFinding, ...findings];
    setFindings(next);
    void persistCollectionToSupabase('findings', next);
    pushToast({
      type: 'success',
      title: `Temuan ${findingCode} Tersimpan ke Supabase`,
      message:
        'Temuan baru telah disinkronkan ke Supabase dan siap diproses pada alur Tindak Lanjut.',
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

    const check = canTransitionFindingStatus(
      target.status,
      nextStatus,
      currentRole
    );
    if (!check.allowed) {
      pushToast({
        type: 'error',
        title: 'Perubahan Status Ditolak (RBAC / Alur Kerja)',
        message: check.reason || 'Akses ditolak.',
      });
      return { ok: false, error: check.reason };
    }

    const next = findings.map((item) =>
      item.id === findingId
        ? {
            ...item,
            status: nextStatus,
            verificationNotes: notes || item.verificationNotes,
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    setFindings(next);
    void persistCollectionToSupabase('findings', next);

    pushToast({
      type: 'success',
      title: `Status Diperbarui di Supabase: ${nextStatus}`,
      message: `Temuan ${target.code} berhasil dipindahkan ke tahap "${nextStatus}".`,
    });

    return { ok: true };
  };

  const addSchedule = (record: Omit<ScheduleRecord, 'id'>) => {
    const newSched: ScheduleRecord = {
      ...record,
      id: `SCH-${Date.now().toString().slice(-6)}`,
    };
    const next = [newSched, ...schedules];
    setSchedules(next);
    void persistCollectionToSupabase('schedules', next);
    pushToast({
      type: 'info',
      title: 'Jadwal Kegiatan Tersimpan ke Supabase',
      message: `Agenda "${record.title}" telah disinkronkan ke kalender Supabase.`,
    });
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    const next = schedules.map((s) =>
      s.id === scheduleId
        ? ({
            ...s,
            status: s.status === 'Terjadwal' ? 'Selesai' : 'Terjadwal',
          } as ScheduleRecord)
        : s
    );
    setSchedules(next);
    void persistCollectionToSupabase('schedules', next);
  };

  const addMasterRoom = (room: Omit<MasterRoomItem, 'id'>) => {
    const next = [
      ...masterRooms,
      { ...room, id: `rm-${Date.now().toString().slice(-5)}` },
    ];
    setMasterRooms(next);
    void persistCollectionToSupabase('master_rooms', next);
    pushToast({
      type: 'success',
      title: 'Master Ruangan Tersimpan ke Supabase',
      message: `Ruangan "${room.name}" telah disinkronkan ke Supabase.`,
    });
  };

  const toggleMasterRoomStatus = (roomId: string) => {
    const next = masterRooms.map((r) =>
      r.id === roomId ? { ...r, isActive: !r.isActive } : r
    );
    setMasterRooms(next);
    void persistCollectionToSupabase('master_rooms', next);
  };

  const addMasterActivityCategory = (name: string, code: string) => {
    const next = [
      ...masterActivityCategories,
      { id: `cat-${Date.now()}`, code, name, isActive: true },
    ];
    setMasterActivityCategories(next);
    void persistCollectionToSupabase('master_activity_categories', next);
    pushToast({
      type: 'success',
      title: 'Kategori Kegiatan Tersimpan ke Supabase',
      message: `Kategori "${name}" berhasil ditambahkan ke Master Data Supabase.`,
    });
  };

  const addMasterOfficer = (officer: {
    name: string;
    nip: string;
    position: string;
  }) => {
    const next = [
      ...masterOfficers,
      { ...officer, id: `off-${Date.now()}`, isActive: true },
    ];
    setMasterOfficers(next);
    void persistCollectionToSupabase('master_officers', next);
    pushToast({
      type: 'success',
      title: 'Data Petugas Tersimpan ke Supabase',
      message: `Petugas "${officer.name}" berhasil ditambahkan ke Master Data Supabase.`,
    });
  };

  const addMasterStandard = (std: Omit<MasterStandardItem, 'id'>) => {
    const next = [
      ...masterStandards,
      { ...std, id: `std-${Date.now().toString().slice(-5)}` },
    ];
    setMasterStandards(next);
    void persistCollectionToSupabase('master_standards', next);
    pushToast({
      type: 'success',
      title: 'Referensi Standar Tersimpan ke Supabase',
      message: `Referensi "${std.standardName}" disinkronkan ke Master Standar Supabase.`,
    });
  };

  const updateHospitalProfile = (profile: Partial<HospitalProfileConfig>) => {
    const next = { ...hospitalProfile, ...profile };
    setHospitalProfile(next);
    void persistCollectionToSupabase('hospital_profile', next);
    pushToast({
      type: 'success',
      title: 'Profil Instansi Tersimpan ke Supabase',
      message:
        'Perubahan konfigurasi profil rumah sakit telah disinkronkan ke Supabase.',
    });
  };

  const roleUserMap: Record<UserRole, string> = {
    Administrator: 'Admin Sistem SIKRESMI',
    'Petugas Kesling': 'Fitria Wulandari, A.M.KL',
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
        waterRows,
        updateWaterRows,
        waterPeriodicReports,
        updateWaterPeriodicReports,
        airItems,
        updateAirItems,
        wastewaterRows,
        updateWastewaterRows,
        solidWasteRows,
        updateSolidWasteRows,
        medicalWasteLogbookRows,
        saveMedicalWasteLogbookRows,
        vectorFindings,
        updateVectorFindings,
        vectorUnits,
        updateVectorUnits,
        foodRows,
        updateFoodRows,
        saranaPrasaranaData,
        updateSaranaPrasaranaData,
        linenRows,
        updateLinenRows,
        radiationRows,
        updateRadiationRows,
        supabaseDiagnostic,
        isSyncingSupabase,
        syncAllToSupabase,
        refreshFromSupabase,
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
