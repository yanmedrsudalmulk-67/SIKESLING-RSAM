import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DailyActivityRecord,
  SupervisionRecord,
  FindingFollowUpRecord,
  ScheduleRecord,
  MasterRoomItem,
  MasterStandardItem,
} from './domain';
import {
  WaterQualityRow,
  createInitialWaterQualityData,
} from './water-quality';
import {
  WastewaterRow,
  createInitialWastewaterData,
} from './wastewater-quality';
import {
  SolidWasteSnapshotRow,
  FoodSanitationSnapshotRow,
  AirQualitySnapshotItem,
  VectorFindingsSnapshotMap,
  createDefaultMonitoringDataset,
} from './dashboard-monitoring-trends';
import {
  MedicalWasteLogRow,
  createRealtimeInitialMedicalWasteLogbook,
} from './medical-waste-logbook';

export const DEFAULT_SUPABASE_RAW_URL =
  'https://zwsshqpenadbpytvwkje.supabase.co/rest/v1/';

export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c3NocXBlbmFkYnB5dHZ3a2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NzA0MDUsImV4cCI6MjEwOTA0NjQwNX0.rdRDwcEiYOnR8rXSm9ngpohZqOXrYu0-nNRPKjNjcsg';

export const SUPABASE_CLOUD_TABLE = 'sikesling_cloud_store';

export interface SupabaseEndpointConfig {
  rawUrl: string;
  projectUrl: string;
  restUrl: string;
  anonKey: string;
  projectRef: string;
  isConfigured: boolean;
}

/**
 * Normalizes NEXT_PUBLIC_SUPABASE_URL whether provided as
 * "https://zwsshqpenadbpytvwkje.supabase.co/rest/v1/" or
 * "https://zwsshqpenadbpytvwkje.supabase.co"
 */
export function normalizeSupabaseUrls(rawInput?: string): {
  rawUrl: string;
  projectUrl: string;
  restUrl: string;
  projectRef: string;
} {
  const cleaned = (rawInput || DEFAULT_SUPABASE_RAW_URL).trim();
  const withoutTrailingSlash = cleaned.replace(/\/+$/, '');
  const projectUrl = withoutTrailingSlash.replace(/\/rest\/v1$/i, '');
  const restUrl = `${projectUrl}/rest/v1`;

  let projectRef = 'zwsshqpenadbpytvwkje';
  try {
    const parsed = new URL(projectUrl);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length > 0 && hostParts[0]) {
      projectRef = hostParts[0];
    }
  } catch {
    // keep default projectRef
  }

  return {
    rawUrl: cleaned,
    projectUrl,
    restUrl,
    projectRef,
  };
}

export function getSupabaseConfig(): SupabaseEndpointConfig {
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_RAW_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const { rawUrl, projectUrl, restUrl, projectRef } =
    normalizeSupabaseUrls(envUrl);

  return {
    rawUrl,
    projectUrl,
    restUrl,
    anonKey: envKey.trim(),
    projectRef,
    isConfigured: Boolean(projectUrl && envKey),
  };
}

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedSupabaseClient) {
    const cfg = getSupabaseConfig();
    cachedSupabaseClient = createClient(cfg.projectUrl, cfg.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedSupabaseClient;
}

export interface HospitalProfileData {
  institutionName: string;
  shortName: string;
  unitName: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  headOfUnit: string;
}

export interface MasterActivityCategoryItem {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface MasterOfficerItem {
  id: string;
  name: string;
  nip: string;
  position: string;
  isActive: boolean;
}

export interface SikeslingCloudState {
  water_quality_2026: WaterQualityRow[];
  air_quality_items: AirQualitySnapshotItem[];
  wastewater_quality_2026: WastewaterRow[];
  solid_waste_b3: SolidWasteSnapshotRow[];
  medical_waste_logbook: MedicalWasteLogRow[];
  vector_findings: VectorFindingsSnapshotMap;
  vector_units: string[];
  food_sanitation: FoodSanitationSnapshotRow[];
  activities: DailyActivityRecord[];
  supervisions: SupervisionRecord[];
  findings: FindingFollowUpRecord[];
  schedules: ScheduleRecord[];
  master_rooms: MasterRoomItem[];
  master_activity_categories: MasterActivityCategoryItem[];
  master_officers: MasterOfficerItem[];
  master_standards: MasterStandardItem[];
  hospital_profile: HospitalProfileData;
}

export type SikeslingCloudCollectionKey = keyof SikeslingCloudState;

export const INITIAL_VECTOR_UNITS: string[] = [
  'IGD',
  'POLI RAWAT JALAN',
  'RANAP ANAK (ABU BAKAR)',
  'RANAP KEBIDANAN (KHADIJAH)',
  'RANAP USMAN',
  'RANAP FATIMAH',
  'CSSD',
  'ICU',
  'OK / IBS',
  'RADIOLOGI',
  'FARMASI',
  'RM',
  'LABORATORIUM',
  'MANAJEMEN',
  'POS SATPAM (SEPTIC TANK DEPAN)',
  'GUDANG FARMASI',
  'KOPRASI',
  'RUANGAN AMBULAN',
  'IPAL',
  'PANTRY',
];

export const INITIAL_MASTER_ROOMS: MasterRoomItem[] = [
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

export const INITIAL_MASTER_ACTIVITY_CATEGORIES: MasterActivityCategoryItem[] = [
  {
    id: 'cat-1',
    code: 'KEG-01',
    name: 'Inspeksi Sanitasi & Kebersihan Ruangan',
    isActive: true,
  },
  {
    id: 'cat-2',
    code: 'KEG-02',
    name: 'Pemantauan Operasional Harian IPAL',
    isActive: true,
  },
  {
    id: 'cat-3',
    code: 'KEG-03',
    name: 'Pengelolaan & Penimbangan Limbah Medis/B3',
    isActive: true,
  },
  {
    id: 'cat-4',
    code: 'KEG-04',
    name: 'Pemantauan Kualitas Air Bersih',
    isActive: true,
  },
  {
    id: 'cat-5',
    code: 'KEG-05',
    name: 'Pengendalian Vektor & Binatang Pengganggu',
    isActive: true,
  },
  {
    id: 'cat-6',
    code: 'KEG-06',
    name: 'Pengawasan Higiene Sanitasi Pangan',
    isActive: true,
  },
];

export const INITIAL_MASTER_OFFICERS: MasterOfficerItem[] = [
  {
    id: 'off-1',
    name: 'Fitria Wulandari, A.M.KL',
    nip: 'Sanitarian RSAM',
    position: 'Sanitarian / Petugas Kesling',
    isActive: true,
  },
  {
    id: 'off-2',
    name: 'Koordinator Kesehatan Lingkungan',
    nip: 'Koordinator Kesling RSAM',
    position: 'Koordinator Kesling',
    isActive: true,
  },
];

export const INITIAL_HOSPITAL_PROFILE: HospitalProfileData = {
  institutionName: 'UOBK RSUD Al-Mulk Kota Sukabumi',
  shortName: 'RSUD Al-Mulk',
  unitName: 'Unit Kesehatan Lingkungan (Kesling)',
  city: 'Kota Sukabumi, Jawa Barat',
  address: 'Jl. Pelabuhan II KM. 6, Lembursitu, Kota Sukabumi',
  phone: '(0266) — UOBK RSUD Al-Mulk',
  email: 'kesling@rsudalmulk.sukabumikota.go.id',
  headOfUnit: 'Fitria Wulandari, A.M.KL',
};

export function createInitialSikeslingCloudState(): SikeslingCloudState {
  const defaultMonitoring = createDefaultMonitoringDataset(2026, []);
  return {
    water_quality_2026: createInitialWaterQualityData(2026),
    air_quality_items: defaultMonitoring.airItems,
    wastewater_quality_2026: createInitialWastewaterData(2026),
    solid_waste_b3: defaultMonitoring.solidWasteRows,
    medical_waste_logbook: createRealtimeInitialMedicalWasteLogbook(),
    vector_findings: defaultMonitoring.vectorFindings,
    vector_units: [...INITIAL_VECTOR_UNITS],
    food_sanitation: defaultMonitoring.foodRows,
    activities: [],
    supervisions: [],
    findings: [],
    schedules: [],
    master_rooms: [...INITIAL_MASTER_ROOMS],
    master_activity_categories: [...INITIAL_MASTER_ACTIVITY_CATEGORIES],
    master_officers: [...INITIAL_MASTER_OFFICERS],
    master_standards: [],
    hospital_profile: { ...INITIAL_HOSPITAL_PROFILE },
  };
}

export const CLOUD_COLLECTION_META: Record<
  SikeslingCloudCollectionKey,
  { category: string; title: string }
> = {
  water_quality_2026: {
    category: 'MONITORING',
    title: 'Monitoring Kualitas Air Bersih (Artesis, RO Lab, RO Poli Gigi)',
  },
  air_quality_items: {
    category: 'MONITORING',
    title: 'Monitoring Kualitas Udara Fisik Ruangan (Suhu, Kelembaban, Lux, Kebisingan)',
  },
  wastewater_quality_2026: {
    category: 'MONITORING',
    title: 'Monitoring Baku Mutu Limbah Cair IPAL (Inlet & Outlet 11 Parameter)',
  },
  solid_waste_b3: {
    category: 'MONITORING',
    title: 'Monitoring Limbah Padat Medis B3, Tajam & Obat Kadaluarsa',
  },
  medical_waste_logbook: {
    category: 'MONITORING',
    title: 'Log Book Limbah Medis Harian per Sumber Ruangan',
  },
  vector_findings: {
    category: 'MONITORING',
    title: 'Matriks Pengendalian Vektor & Binatang Pengganggu (12 Bulan × 20 Unit)',
  },
  vector_units: {
    category: 'MONITORING',
    title: 'Daftar Unit & Ruangan Pemantauan Vektor RSAM',
  },
  food_sanitation: {
    category: 'MONITORING',
    title: 'Monitoring Higiene Sanitasi Pangan & Keamanan Penghidangan',
  },
  activities: {
    category: 'OPERASIONAL',
    title: 'Pencatatan Kegiatan Operasional Harian Kesling',
  },
  supervisions: {
    category: 'SUPERVISI',
    title: 'Data Pelaksanaan Supervisi Lingkungan Lapangan',
  },
  findings: {
    category: 'TINDAK_LANJUT',
    title: 'Daftar Temuan & Alur Tindak Lanjut Perbaikan',
  },
  schedules: {
    category: 'OPERASIONAL',
    title: 'Kalender & Jadwal Kegiatan Kesehatan Lingkungan',
  },
  master_rooms: {
    category: 'MASTER_DATA',
    title: 'Master Data Ruangan & Instalasi RSUD Al-Mulk',
  },
  master_activity_categories: {
    category: 'MASTER_DATA',
    title: 'Master Kategori Kegiatan Operasional Kesling',
  },
  master_officers: {
    category: 'MASTER_DATA',
    title: 'Master Data Petugas Sanitarian & Koordinator Kesling',
  },
  master_standards: {
    category: 'MASTER_DATA',
    title: 'Master Referensi Standar Baku Mutu & Regulasi',
  },
  hospital_profile: {
    category: 'PENGATURAN',
    title: 'Profil Resmi Instansi UOBK RSUD Al-Mulk Kota Sukabumi',
  },
};

export interface SupabaseStoreRow {
  key: SikeslingCloudCollectionKey;
  category: string;
  title: string;
  payload: unknown;
  updated_at?: string;
}

export interface SupabaseSyncDiagnostic {
  connected: boolean;
  tableReady: boolean;
  projectRef: string;
  restUrl: string;
  syncedKeysCount: number;
  lastSyncedAt: string;
  statusMessage: string;
  errorCode?: string;
}

/**
 * Fetches all rows from https://zwsshqpenadbpytvwkje.supabase.co/rest/v1/sikesling_cloud_store
 */
export async function fetchAllFromSupabaseRest(): Promise<{
  ok: boolean;
  tableReady: boolean;
  rows: SupabaseStoreRow[];
  errorCode?: string;
  errorMessage?: string;
}> {
  const cfg = getSupabaseConfig();
  const endpoint = `${cfg.restUrl}/${SUPABASE_CLOUD_TABLE}?select=key,category,title,payload,updated_at`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = (await res.json()) as SupabaseStoreRow[];
      return {
        ok: true,
        tableReady: true,
        rows: Array.isArray(data) ? data : [],
      };
    }

    const errText = await res.text();
    let parsedErr: { code?: string; message?: string } = {};
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = { message: errText };
    }

    // PGRST205 means Supabase REST is reachable & authenticated, but table public.sikesling_cloud_store needs to be created
    if (parsedErr.code === 'PGRST205' || res.status === 404) {
      return {
        ok: true,
        tableReady: false,
        rows: [],
        errorCode: parsedErr.code || 'PGRST205',
        errorMessage:
          parsedErr.message ||
          `Tabel public.${SUPABASE_CLOUD_TABLE} belum dibuat pada Supabase SQL Editor.`,
      };
    }

    return {
      ok: false,
      tableReady: false,
      rows: [],
      errorCode: parsedErr.code || `HTTP_${res.status}`,
      errorMessage: parsedErr.message || `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      tableReady: false,
      rows: [],
      errorCode: 'NETWORK_ERROR',
      errorMessage: err instanceof Error ? err.message : 'Network error',
    };
  }
}

/**
 * Upserts one or multiple collection records into Supabase REST v1 (`sikesling_cloud_store`)
 */
export async function upsertRowsToSupabaseRest(
  rows: SupabaseStoreRow[]
): Promise<{
  ok: boolean;
  tableReady: boolean;
  errorCode?: string;
  errorMessage?: string;
}> {
  const cfg = getSupabaseConfig();
  const endpoint = `${cfg.restUrl}/${SUPABASE_CLOUD_TABLE}?on_conflict=key`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(
        rows.map((r) => ({
          key: r.key,
          category: r.category,
          title: r.title,
          payload: r.payload,
          updated_at: new Date().toISOString(),
        }))
      ),
      cache: 'no-store',
    });

    if (res.ok) {
      return { ok: true, tableReady: true };
    }

    const errText = await res.text();
    let parsedErr: { code?: string; message?: string } = {};
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = { message: errText };
    }

    if (parsedErr.code === 'PGRST205' || res.status === 404) {
      return {
        ok: false,
        tableReady: false,
        errorCode: 'PGRST205',
        errorMessage: `Tabel public.${SUPABASE_CLOUD_TABLE} belum diinisialisasi di Supabase SQL Editor.`,
      };
    }

    return {
      ok: false,
      tableReady: true,
      errorCode: parsedErr.code || `HTTP_${res.status}`,
      errorMessage: parsedErr.message || `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      tableReady: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export const SUPABASE_SETUP_SQL = `-- ============================================================================
-- SIKESLING RSAM — SUPABASE CLOUD SCHEMA & RLS SETUP
-- Project Ref : zwsshqpenadbpytvwkje
-- Endpoint    : https://zwsshqpenadbpytvwkje.supabase.co/rest/v1/
-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Tabel Utama Penyimpanan Terintegrasi SIKESLING RSAM (16 Koleksi Modul)
CREATE TABLE IF NOT EXISTS public.sikesling_cloud_store (
  key TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'MONITORING',
  title TEXT NOT NULL,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS) dan Kebijakan Akses Anon/Authenticated
ALTER TABLE public.sikesling_cloud_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to sikesling_cloud_store" ON public.sikesling_cloud_store;
CREATE POLICY "Allow full access to sikesling_cloud_store"
  ON public.sikesling_cloud_store
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.sikesling_cloud_store TO anon, authenticated, service_role;

-- 3. Reload PostgREST Schema Cache agar endpoint /rest/v1/sikesling_cloud_store langsung aktif
NOTIFY pgrst, 'reload schema';
`;
