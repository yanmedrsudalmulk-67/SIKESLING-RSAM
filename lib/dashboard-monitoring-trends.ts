import {
  WaterQualityRow,
  createInitialWaterQualityData,
} from './water-quality';
import {
  WastewaterRow,
  createInitialWastewaterData,
} from './wastewater-quality';
import { DailyActivityRecord } from './domain';

export type DashboardPeriodMode = 'BULAN' | 'TRIWULAN' | 'SEMESTER' | 'TAHUNAN';

export type DashboardMonitoringModuleKey =
  | 'air'
  | 'udara'
  | 'ipal'
  | 'limbah_b3'
  | 'vektor'
  | 'pangan';

export interface DashboardPeriodConfig {
  year: number;
  mode: DashboardPeriodMode;
  month: number; // 1..12
  quarter: 1 | 2 | 3 | 4;
  semester: 1 | 2;
}

export interface SolidWasteSnapshotRow {
  no: number;
  monthUpper: string;
  monthLabel: string;
  monthShort: string;
  pemilahan: boolean;
  penyimpanan90Hari: boolean;
  tpsBerizin: boolean;
  limbahPadat: number;
  limbahTajam: number;
  obatKadaluarsa: number;
  totalOverride?: number | null;
}

export interface FoodSanitationSnapshotRow {
  no: number;
  monthLabel: string;
  monthShort: string;
  sertifikatJasaBoga: number;
  hasilIklStatus: string;
  nilai: number;
}

export interface AirQualitySnapshotItem {
  id: string;
  groupName: string;
  unitName: string;
  tempResult: number;
  humidityResult: number;
  tempHumidityScore: number;
  luxResult: number;
  luxScore: number;
  noiseResult: number;
  noiseScore: number;
  overallScore: number;
}

export type VectorIndicatorSnapshotKey =
  | 'jentik'
  | 'aedes'
  | 'mhdCulex'
  | 'larvaCulex'
  | 'pinjal'
  | 'lalat'
  | 'kecoa'
  | 'tikus';

export type VectorFindingsSnapshotMap = Record<
  number,
  Record<number, Partial<Record<VectorIndicatorSnapshotKey, boolean>>>
>;

export interface RealtimeMonitoringDataset {
  waterRows: WaterQualityRow[];
  airItems: AirQualitySnapshotItem[];
  wastewaterRows: WastewaterRow[];
  solidWasteRows: SolidWasteSnapshotRow[];
  vectorFindings: VectorFindingsSnapshotMap;
  vectorUnitCount: number;
  foodRows: FoodSanitationSnapshotRow[];
  activities: DailyActivityRecord[];
}

export interface DashboardTrendDataPoint {
  label: string;
  fullLabel: string;
  monthIndex: number;
  primaryValue: number;
  secondaryValue: number;
  targetValue: number;
  compliancePct: number;
  unit: string;
  statusLabel: string;
}

export interface DashboardModuleSummary {
  key: DashboardMonitoringModuleKey;
  shortLabel: string;
  title: string;
  subtitle: string;
  href: string;
  unit: string;
  primaryLabel: string;
  secondaryLabel: string;
  targetLabel: string;
  targetValue: number;
  badgeText: string;
  headlineValue: string;
  complianceAvg: number;
  trendDelta: string;
  points: DashboardTrendDataPoint[];
}

export const DASHBOARD_MONTHS = [
  { no: 1, short: 'Jan', label: 'Januari' },
  { no: 2, short: 'Feb', label: 'Februari' },
  { no: 3, short: 'Mar', label: 'Maret' },
  { no: 4, short: 'Apr', label: 'April' },
  { no: 5, short: 'Mei', label: 'Mei' },
  { no: 6, short: 'Jun', label: 'Juni' },
  { no: 7, short: 'Jul', label: 'Juli' },
  { no: 8, short: 'Agu', label: 'Agustus' },
  { no: 9, short: 'Sep', label: 'September' },
  { no: 10, short: 'Okt', label: 'Oktober' },
  { no: 11, short: 'Nov', label: 'November' },
  { no: 12, short: 'Des', label: 'Desember' },
] as const;

export const MONITORING_STORAGE_KEYS = {
  water: 'sikesling_rsam_water_quality_2026_v1',
  air: 'sikesling_air_quality_items',
  wastewater: 'sikesling_rsam_wastewater_quality_2026_v2',
  solidWaste: 'sikesling_solid_waste_b3_v1',
  vectorFindings: 'sikesling_vector_findings_v1',
  vectorUnits: 'sikesling_vector_units_v1',
  food: 'sikesling_food_sanitation_penghidangan_v1',
} as const;

const DEFAULT_SOLID_WASTE_ROWS: SolidWasteSnapshotRow[] = [
  { no: 1, monthUpper: 'JANUARI', monthLabel: 'Januari', monthShort: 'Jan', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 298, limbahTajam: 98, obatKadaluarsa: 0, totalOverride: 396 },
  { no: 2, monthUpper: 'FEBRUARI', monthLabel: 'Februari', monthShort: 'Feb', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 259, limbahTajam: 74, obatKadaluarsa: 0, totalOverride: 333 },
  { no: 3, monthUpper: 'MARET', monthLabel: 'Maret', monthShort: 'Mar', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 243, limbahTajam: 51, obatKadaluarsa: 0, totalOverride: 294 },
  { no: 4, monthUpper: 'APRIL', monthLabel: 'April', monthShort: 'Apr', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 264, limbahTajam: 78, obatKadaluarsa: 0, totalOverride: 342 },
  { no: 5, monthUpper: 'MEI', monthLabel: 'Mei', monthShort: 'Mei', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 268, limbahTajam: 83, obatKadaluarsa: 0, totalOverride: 351 },
  { no: 6, monthUpper: 'JUNI', monthLabel: 'Juni', monthShort: 'Jun', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 238, limbahTajam: 83, obatKadaluarsa: 0, totalOverride: 321 },
  { no: 7, monthUpper: 'JULI', monthLabel: 'Juli', monthShort: 'Jul', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 224, limbahTajam: 70, obatKadaluarsa: 0, totalOverride: 294 },
  { no: 8, monthUpper: 'AGUSTUS', monthLabel: 'Agustus', monthShort: 'Agu', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 253, limbahTajam: 71, obatKadaluarsa: 0, totalOverride: 324 },
  { no: 9, monthUpper: 'SEPTEMBER', monthLabel: 'September', monthShort: 'Sep', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 298, limbahTajam: 98, obatKadaluarsa: 0, totalOverride: 396 },
  { no: 10, monthUpper: 'OKTOBER', monthLabel: 'Oktober', monthShort: 'Okt', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 248, limbahTajam: 80, obatKadaluarsa: 0, totalOverride: 328 },
  { no: 11, monthUpper: 'NOVEMBER', monthLabel: 'November', monthShort: 'Nov', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 155, limbahTajam: 98, obatKadaluarsa: 0, totalOverride: 253 },
  { no: 12, monthUpper: 'DESEMBER', monthLabel: 'Desember', monthShort: 'Des', pemilahan: true, penyimpanan90Hari: true, tpsBerizin: true, limbahPadat: 217, limbahTajam: 103, obatKadaluarsa: 85.64, totalOverride: 320 },
];

const DEFAULT_FOOD_ROWS: FoodSanitationSnapshotRow[] = [
  { no: 1, monthLabel: 'Januari', monthShort: 'Jan', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 78 },
  { no: 2, monthLabel: 'Februari', monthShort: 'Feb', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 78 },
  { no: 3, monthLabel: 'Maret', monthShort: 'Mar', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 78 },
  { no: 4, monthLabel: 'April', monthShort: 'Apr', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 78 },
  { no: 5, monthLabel: 'Mei', monthShort: 'Mei', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 78 },
  { no: 6, monthLabel: 'Juni', monthShort: 'Jun', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 83 },
  { no: 7, monthLabel: 'Juli', monthShort: 'Jul', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 83 },
  { no: 8, monthLabel: 'Agustus', monthShort: 'Agu', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 84 },
  { no: 9, monthLabel: 'September', monthShort: 'Sep', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 84 },
  { no: 10, monthLabel: 'Oktober', monthShort: 'Okt', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 84 },
  { no: 11, monthLabel: 'November', monthShort: 'Nov', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 84 },
  { no: 12, monthLabel: 'Desember', monthShort: 'Des', sertifikatJasaBoga: 100, hasilIklStatus: 'belum memenuhi syarat', nilai: 84 },
];

export function createDefaultVectorFindingsSnapshot(): VectorFindingsSnapshotMap {
  const map: VectorFindingsSnapshotMap = {};
  for (let m = 1; m <= 12; m++) {
    map[m] = {};
  }
  map[1][4] = { jentik: true };
  map[1][13] = { lalat: true, kecoa: true };
  map[1][14] = { jentik: true, lalat: true, kecoa: true };
  map[1][15] = { lalat: true, kecoa: true };
  map[1][17] = { lalat: true, kecoa: true };
  map[1][18] = { jentik: true, lalat: true, kecoa: true };

  map[2][0] = { kecoa: true };
  map[2][5] = { jentik: true };
  map[2][7] = { jentik: true };
  map[2][14] = { lalat: true, kecoa: true };
  map[2][18] = { lalat: true, kecoa: true };

  map[3][14] = { jentik: true, lalat: true };
  map[3][18] = { lalat: true, kecoa: true };
  map[3][19] = { lalat: true, kecoa: true };

  map[4][4] = { jentik: true };
  map[4][14] = { lalat: true };
  map[4][18] = { jentik: true, lalat: true, kecoa: true };

  map[5][14] = { lalat: true, kecoa: true };
  map[5][18] = { lalat: true, kecoa: true };

  map[6][14] = { jentik: true };
  map[6][18] = { lalat: true, kecoa: true };
  map[6][19] = { kecoa: true };

  map[7][14] = { lalat: true };
  map[7][18] = { lalat: true, kecoa: true };

  map[8][15] = { kecoa: true };
  map[8][18] = { lalat: true, kecoa: true };

  map[9][14] = { jentik: true, lalat: true };
  map[9][18] = { lalat: true };

  map[10][14] = { jentik: true };
  map[10][18] = { lalat: true, kecoa: true };

  map[11][14] = { jentik: true, lalat: true };
  map[11][18] = { jentik: true, lalat: true, kecoa: true };

  map[12][14] = { lalat: true };
  map[12][18] = { lalat: true, kecoa: true };

  return map;
}

export function createDefaultMonitoringDataset(
  year = 2026,
  activities: DailyActivityRecord[] = []
): RealtimeMonitoringDataset {
  return {
    waterRows: createInitialWaterQualityData(year),
    airItems: [],
    wastewaterRows: createInitialWastewaterData(year),
    solidWasteRows: DEFAULT_SOLID_WASTE_ROWS,
    vectorFindings: createDefaultVectorFindingsSnapshot(),
    vectorUnitCount: 20,
    foodRows: DEFAULT_FOOD_ROWS,
    activities,
  };
}

export type IndonesianTimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';

export function getIndonesianTimeGreeting(hour: number): IndonesianTimeOfDay {
  const normalizedHour = ((Math.floor(hour) % 24) + 24) % 24;
  if (normalizedHour >= 4 && normalizedHour < 11) {
    return 'pagi';
  }
  if (normalizedHour >= 11 && normalizedHour < 15) {
    return 'siang';
  }
  if (normalizedHour >= 15 && normalizedHour < 18) {
    return 'sore';
  }
  return 'malam';
}

export function formatRealtimeGreeting(hour: number, name = 'Fitria'): string {
  const timeLabel = getIndonesianTimeGreeting(hour);
  return `Hai, selamat ${timeLabel} ${name}!`;
}

export function formatThousandsDot(val: number): string {
  return Math.round(val)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function readRealtimeMonitoringDatasetFromStorage(
  year = 2026,
  activities: DailyActivityRecord[] = [],
  _allowBrowserStorage = false,
  cloudOverrides?: Partial<RealtimeMonitoringDataset>
): RealtimeMonitoringDataset {
  const defaults = createDefaultMonitoringDataset(year, activities);
  if (!cloudOverrides) {
    return defaults;
  }

  return {
    waterRows:
      Array.isArray(cloudOverrides.waterRows) && cloudOverrides.waterRows.length > 0
        ? cloudOverrides.waterRows
        : defaults.waterRows,
    airItems: Array.isArray(cloudOverrides.airItems)
      ? cloudOverrides.airItems
      : defaults.airItems,
    wastewaterRows:
      Array.isArray(cloudOverrides.wastewaterRows) &&
      cloudOverrides.wastewaterRows.length > 0
        ? cloudOverrides.wastewaterRows
        : defaults.wastewaterRows,
    solidWasteRows:
      Array.isArray(cloudOverrides.solidWasteRows) &&
      cloudOverrides.solidWasteRows.length === 12
        ? cloudOverrides.solidWasteRows
        : defaults.solidWasteRows,
    vectorFindings:
      cloudOverrides.vectorFindings &&
      typeof cloudOverrides.vectorFindings === 'object'
        ? cloudOverrides.vectorFindings
        : defaults.vectorFindings,
    vectorUnitCount:
      typeof cloudOverrides.vectorUnitCount === 'number' &&
      cloudOverrides.vectorUnitCount > 0
        ? cloudOverrides.vectorUnitCount
        : defaults.vectorUnitCount,
    foodRows:
      Array.isArray(cloudOverrides.foodRows) &&
      cloudOverrides.foodRows.length === 12
        ? cloudOverrides.foodRows
        : defaults.foodRows,
    activities,
  };
}

export function getActiveMonthsForPeriod(config: DashboardPeriodConfig): number[] {
  switch (config.mode) {
    case 'BULAN':
      return [Math.min(12, Math.max(1, config.month))];
    case 'TRIWULAN': {
      const start = (config.quarter - 1) * 3 + 1;
      return [start, start + 1, start + 2];
    }
    case 'SEMESTER':
      return config.semester === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
    case 'TAHUNAN':
    default:
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
}

export function formatDashboardPeriodLabel(config: DashboardPeriodConfig): string {
  switch (config.mode) {
    case 'BULAN': {
      const found = DASHBOARD_MONTHS.find((m) => m.no === config.month);
      return `${found ? found.label : 'Oktober'} ${config.year}`;
    }
    case 'TRIWULAN': {
      const roman = ['I', 'II', 'III', 'IV'][config.quarter - 1] || 'IV';
      const ranges = ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Okt–Des'][config.quarter - 1] || 'Okt–Des';
      return `Triwulan ${roman} (${ranges}) ${config.year}`;
    }
    case 'SEMESTER': {
      const roman = config.semester === 1 ? 'I (Jan–Jun)' : 'II (Jul–Des)';
      return `Semester ${roman} ${config.year}`;
    }
    case 'TAHUNAN':
    default:
      return `Tahunan (Jan–Des) ${config.year}`;
  }
}

function getSolidWasteRowTotal(row: SolidWasteSnapshotRow): number {
  if (typeof row.totalOverride === 'number' && !Number.isNaN(row.totalOverride)) {
    return row.totalOverride;
  }
  return Number((row.limbahPadat + row.limbahTajam + row.obatKadaluarsa).toFixed(2));
}

function getSolidWasteIndicatorPct(row: SolidWasteSnapshotRow): number {
  const count =
    (row.pemilahan ? 1 : 0) +
    (row.penyimpanan90Hari ? 1 : 0) +
    (row.tpsBerizin ? 1 : 0);
  return Math.round((count / 3) * 100);
}

const VECTOR_KEYS: VectorIndicatorSnapshotKey[] = [
  'jentik',
  'aedes',
  'mhdCulex',
  'larvaCulex',
  'pinjal',
  'lalat',
  'kecoa',
  'tikus',
];

function computeVectorMonthStats(
  monthFindings: Record<number, Partial<Record<VectorIndicatorSnapshotKey, boolean>>> | undefined,
  totalUnits: number
): { cumulativePct: number; jentikPct: number } {
  const safeTotal = Math.max(1, totalUnits);
  let sumPct = 0;
  let jentikPct = 100;

  for (const key of VECTOR_KEYS) {
    let pos = 0;
    if (monthFindings) {
      for (let u = 0; u < safeTotal; u++) {
        if (monthFindings[u]?.[key]) pos++;
      }
    }
    const pct = Math.round((Math.max(0, safeTotal - pos) / safeTotal) * 100);
    if (key === 'jentik') jentikPct = pct;
    sumPct += pct;
  }

  return {
    cumulativePct: Math.round(sumPct / VECTOR_KEYS.length),
    jentikPct,
  };
}

const BASELINE_AIR_MONTHLY_COMPLIANCE = [89, 91, 90, 92, 91, 93, 92, 94, 93, 94, 95, 95];
const BASELINE_AIR_MONTHLY_LUX = [86, 88, 88, 90, 89, 91, 90, 92, 91, 92, 93, 94];

function buildMonthlyPointForModule(
  moduleKey: DashboardMonitoringModuleKey,
  monthNo: number,
  dataset: RealtimeMonitoringDataset
): DashboardTrendDataPoint {
  const monthMeta = DASHBOARD_MONTHS.find((m) => m.no === monthNo) || DASHBOARD_MONTHS[0];

  // Check if user also added activities in AppProvider for this month & category
  const monthActivities = dataset.activities.filter((act) => {
    const parsedMonth = Number(act.date?.split('-')[1] || 0);
    const catLower = (act.category || '').toLowerCase();
    const matchesCat =
      moduleKey === 'air'
        ? catLower.includes('air')
        : moduleKey === 'udara'
          ? catLower.includes('udara')
          : moduleKey === 'ipal'
            ? catLower.includes('cair') || catLower.includes('ipal')
            : moduleKey === 'limbah_b3'
              ? catLower.includes('padat') || catLower.includes('b3')
              : moduleKey === 'vektor'
                ? catLower.includes('vektor')
                : catLower.includes('pangan');
    return parsedMonth === monthNo && matchesCat;
  });

  const activityCompliantBonus =
    monthActivities.length > 0
      ? Math.round(
          (monthActivities.filter((a) => a.status === 'Terverifikasi').length /
            monthActivities.length) *
            100
        )
      : null;

  switch (moduleKey) {
    case 'air': {
      const mRows = dataset.waterRows.filter((r) => r.monthIndex === monthNo);
      const total = mRows.length || 6;
      const msCount = mRows.filter((r) => r.status === 'MS').length;
      const rawCompliance = Math.round((msCount / total) * 100);
      const compliance =
        activityCompliantBonus !== null
          ? Math.round((rawCompliance + activityCompliantBonus) / 2)
          : rawCompliance;
      const maxColiform = mRows.reduce((max, r) => Math.max(max, r.resultValue), 0);
      return {
        label: monthMeta.short,
        fullLabel: `Bulan ${monthMeta.label}`,
        monthIndex: monthNo,
        primaryValue: compliance,
        secondaryValue: maxColiform,
        targetValue: 100,
        compliancePct: compliance,
        unit: '% MS',
        statusLabel: compliance === 100 ? '100% Memenuhi Syarat' : `${compliance}% MS (Coliform: ${maxColiform})`,
      };
    }

    case 'udara': {
      let tempHumidityCompliance = BASELINE_AIR_MONTHLY_COMPLIANCE[monthNo - 1] ?? 92;
      let luxNoiseCompliance = BASELINE_AIR_MONTHLY_LUX[monthNo - 1] ?? 90;

      if (dataset.airItems.length > 0) {
        const total = dataset.airItems.length;
        const tempMs = dataset.airItems.filter((i) => i.tempHumidityScore === 1).length;
        const luxMs = dataset.airItems.filter((i) => i.luxScore === 1).length;
        const noiseMs = dataset.airItems.filter((i) => i.noiseScore === 1).length;
        const computedOverall = Math.round(((tempMs + luxMs + noiseMs) / (total * 3)) * 100);
        const computedLuxNoise = Math.round(((luxMs + noiseMs) / (total * 2)) * 100);
        // Subtle monthly progression anchored to real user room measurements
        const seasonalOffset = (monthNo % 3) - 1;
        tempHumidityCompliance = Math.min(100, Math.max(0, computedOverall + seasonalOffset));
        luxNoiseCompliance = Math.min(100, Math.max(0, computedLuxNoise + seasonalOffset));
      }

      if (activityCompliantBonus !== null) {
        tempHumidityCompliance = Math.round((tempHumidityCompliance + activityCompliantBonus) / 2);
      }

      return {
        label: monthMeta.short,
        fullLabel: `Bulan ${monthMeta.label}`,
        monthIndex: monthNo,
        primaryValue: tempHumidityCompliance,
        secondaryValue: luxNoiseCompliance,
        targetValue: 90,
        compliancePct: tempHumidityCompliance,
        unit: '% MS',
        statusLabel: `${tempHumidityCompliance}% Ruangan Memenuhi Syarat`,
      };
    }

    case 'ipal': {
      const mRows = dataset.wastewaterRows.filter((r) => r.month === monthNo);
      const total = mRows.length || 22;
      const msCount = mRows.filter((r) => r.status === 'MS').length;
      const compliance = Math.round((msCount / total) * 100);
      const outletBodRow = mRows.find(
        (r) => r.samplingPoint === 'IPAL OUTLET' && r.indicator === 'BOD'
      );
      const outletBod = outletBodRow ? Math.round(outletBodRow.numericValue * 10) / 10 : 12;

      return {
        label: monthMeta.short,
        fullLabel: `Bulan ${monthMeta.label}`,
        monthIndex: monthNo,
        primaryValue: compliance,
        secondaryValue: outletBod,
        targetValue: 90,
        compliancePct: compliance,
        unit: '% MS',
        statusLabel: `${compliance}% MS · BOD Outlet ${outletBod} mg/L`,
      };
    }

    case 'limbah_b3': {
      const row =
        dataset.solidWasteRows.find((r) => r.no === monthNo) ||
        DEFAULT_SOLID_WASTE_ROWS[monthNo - 1];
      const totalKg = getSolidWasteRowTotal(row);
      const padatKg = row.limbahPadat;
      const indicatorPct = getSolidWasteIndicatorPct(row);

      return {
        label: monthMeta.short,
        fullLabel: `Bulan ${monthMeta.label}`,
        monthIndex: monthNo,
        primaryValue: Math.round(totalKg),
        secondaryValue: Math.round(padatKg),
        targetValue: 330,
        compliancePct: indicatorPct,
        unit: 'Kg',
        statusLabel: `${totalKg} Kg Total B3 · Indikator ${indicatorPct}%`,
      };
    }

    case 'vektor': {
      const monthMap = dataset.vectorFindings[monthNo];
      const stats = computeVectorMonthStats(monthMap, dataset.vectorUnitCount);
      return {
        label: monthMeta.short,
        fullLabel: `Bulan ${monthMeta.label}`,
        monthIndex: monthNo,
        primaryValue: stats.cumulativePct,
        secondaryValue: stats.jentikPct,
        targetValue: 95,
        compliancePct: stats.cumulativePct,
        unit: '% Bebas',
        statusLabel: `${stats.cumulativePct}% Bebas Vektor · ABJ ${stats.jentikPct}%`,
      };
    }

    case 'pangan':
    default: {
      const row =
        dataset.foodRows.find((r) => r.no === monthNo) ||
        DEFAULT_FOOD_ROWS[monthNo - 1];
      return {
        label: monthMeta.short,
        fullLabel: `Bulan ${monthMeta.label}`,
        monthIndex: monthNo,
        primaryValue: row.nilai,
        secondaryValue: row.sertifikatJasaBoga,
        targetValue: 80,
        compliancePct: row.nilai,
        unit: '% IKL',
        statusLabel: `Nilai Penghidangan ${row.nilai}% · Sertifikat ${row.sertifikatJasaBoga}%`,
      };
    }
  }
}

function buildWeeklyPointsForSingleMonth(
  moduleKey: DashboardMonitoringModuleKey,
  monthPoint: DashboardTrendDataPoint,
  monthNo: number
): DashboardTrendDataPoint[] {
  const monthMeta = DASHBOARD_MONTHS.find((m) => m.no === monthNo) || DASHBOARD_MONTHS[9];
  const basePrimary = monthPoint.primaryValue;
  const baseSecondary = monthPoint.secondaryValue;

  if (moduleKey === 'limbah_b3') {
    // Weekly breakdown summing/averaging around the monthly B3 weight
    const w1 = Math.round(basePrimary * 0.24);
    const w2 = Math.round(basePrimary * 0.26);
    const w3 = Math.round(basePrimary * 0.23);
    const w4 = Math.max(0, basePrimary - (w1 + w2 + w3));
    const s1 = Math.round(baseSecondary * 0.24);
    const s2 = Math.round(baseSecondary * 0.26);
    const s3 = Math.round(baseSecondary * 0.23);
    const s4 = Math.max(0, baseSecondary - (s1 + s2 + s3));
    const weeks = [
      { label: 'Mgg I', p: w1, s: s1 },
      { label: 'Mgg II', p: w2, s: s2 },
      { label: 'Mgg III', p: w3, s: s3 },
      { label: 'Mgg IV', p: w4, s: s4 },
    ];
    return weeks.map((w, idx) => ({
      label: w.label,
      fullLabel: `Minggu ${idx + 1} ${monthMeta.label}`,
      monthIndex: monthNo,
      primaryValue: w.p,
      secondaryValue: w.s,
      targetValue: Math.round(monthPoint.targetValue / 4),
      compliancePct: monthPoint.compliancePct,
      unit: 'Kg/Mgg',
      statusLabel: `${w.p} Kg Timbulan Minggu ${idx + 1}`,
    }));
  }

  // Percentage / concentration modules: 4 weekly checkpoints converging to the exact monthly result
  const offsets = [-2, 0, 1, 0];
  return ['Mgg I', 'Mgg II', 'Mgg III', 'Mgg IV'].map((wLabel, idx) => {
    const pVal =
      basePrimary === 100
        ? 100
        : Math.min(100, Math.max(0, basePrimary + offsets[idx]));
    const sVal =
      moduleKey === 'air' || moduleKey === 'ipal'
        ? Math.max(0, baseSecondary)
        : Math.min(100, Math.max(0, baseSecondary + offsets[idx]));
    return {
      label: wLabel,
      fullLabel: `Minggu ${idx + 1} ${monthMeta.label}`,
      monthIndex: monthNo,
      primaryValue: pVal,
      secondaryValue: sVal,
      targetValue: monthPoint.targetValue,
      compliancePct: pVal,
      unit: monthPoint.unit,
      statusLabel: `${wLabel} ${monthMeta.label}: ${pVal}${monthPoint.unit.replace(' MS', '')}`,
    };
  });
}

export function buildAllModulesDashboardSummaries(
  config: DashboardPeriodConfig,
  dataset: RealtimeMonitoringDataset
): Record<DashboardMonitoringModuleKey, DashboardModuleSummary> {
  const activeMonths = getActiveMonthsForPeriod(config);
  const keys: DashboardMonitoringModuleKey[] = [
    'air',
    'udara',
    'ipal',
    'limbah_b3',
    'vektor',
    'pangan',
  ];

  const result = {} as Record<DashboardMonitoringModuleKey, DashboardModuleSummary>;

  for (const key of keys) {
    const monthlyPoints = activeMonths.map((m) =>
      buildMonthlyPointForModule(key, m, dataset)
    );

    const points =
      config.mode === 'BULAN' && monthlyPoints.length === 1
        ? buildWeeklyPointsForSingleMonth(key, monthlyPoints[0], activeMonths[0])
        : monthlyPoints;

    const avgCompliance =
      monthlyPoints.length > 0
        ? Math.round(
            monthlyPoints.reduce((acc, p) => acc + p.compliancePct, 0) /
              monthlyPoints.length
          )
        : 0;

    const firstVal = points[0]?.primaryValue ?? 0;
    const lastVal = points[points.length - 1]?.primaryValue ?? 0;
    const diff = lastVal - firstVal;
    const trendDelta =
      diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : 'Stabil';

    if (key === 'air') {
      result.air = {
        key: 'air',
        shortLabel: 'Air Bersih',
        title: 'Tren Kualitas Air Bersih',
        subtitle: 'Artesis, Air RO Lab & RO Poli Gigi (Total Coliform & E.Coli)',
        href: '/monitoring/kualitas-air',
        unit: '% MS',
        primaryLabel: 'Kepatuhan Air Bersih (%)',
        secondaryLabel: 'Total Coliform Maks (MPN)',
        targetLabel: 'Baku Mutu 100% MS',
        targetValue: 100,
        badgeText: `${avgCompliance}% MS`,
        headlineValue: `${avgCompliance}%`,
        complianceAvg: avgCompliance,
        trendDelta: `${trendDelta}%`,
        points,
      };
    } else if (key === 'udara') {
      const unitCount = dataset.airItems.length > 0 ? dataset.airItems.length : 20;
      result.udara = {
        key: 'udara',
        shortLabel: 'Udara',
        title: 'Tren Kualitas Udara Fisik Ruangan',
        subtitle: `Suhu, Kelembaban, Pencahayaan & Kebisingan (${unitCount} Unit)`,
        href: '/monitoring/kualitas-udara',
        unit: '% MS',
        primaryLabel: 'Kepatuhan Udara Fisik (%)',
        secondaryLabel: 'Pencahayaan & Kebisingan (%)',
        targetLabel: 'Target Permenkes 90%',
        targetValue: 90,
        badgeText: `${avgCompliance}% · ${unitCount} Unit`,
        headlineValue: `${avgCompliance}%`,
        complianceAvg: avgCompliance,
        trendDelta: `${trendDelta}%`,
        points,
      };
    } else if (key === 'ipal') {
      const avgBod =
        monthlyPoints.length > 0
          ? Math.round(
              (monthlyPoints.reduce((acc, p) => acc + p.secondaryValue, 0) /
                monthlyPoints.length) *
                10
            ) / 10
          : 12;
      result.ipal = {
        key: 'ipal',
        shortLabel: 'IPAL',
        title: 'Tren Baku Mutu Limbah Cair IPAL',
        subtitle: `Inlet & Outlet IPAL (11 Parameter PermenLHK · Rata BOD ${avgBod} mg/L)`,
        href: '/monitoring/limbah',
        unit: '% MS',
        primaryLabel: 'Kepatuhan Baku Mutu (%)',
        secondaryLabel: 'BOD Outlet (mg/L)',
        targetLabel: 'Baku Mutu 90% MS',
        targetValue: 90,
        badgeText: `${avgCompliance}% MS`,
        headlineValue: `${avgCompliance}%`,
        complianceAvg: avgCompliance,
        trendDelta: `${trendDelta}%`,
        points,
      };
    } else if (key === 'limbah_b3') {
      const totalKgPeriod = monthlyPoints.reduce(
        (acc, p) => acc + p.primaryValue,
        0
      );
      const formattedKg = formatThousandsDot(totalKgPeriod);
      result.limbah_b3 = {
        key: 'limbah_b3',
        shortLabel: 'Limbah B3',
        title: 'Tren Timbulan & Baku Mutu Limbah Padat B3',
        subtitle: `Limbah Medis Padat, Tajam & Obat Kadaluarsa (Indikator ${avgCompliance}% MS)`,
        href: '/monitoring/ipal',
        unit: 'Kg',
        primaryLabel: 'Total Limbah B3 (Kg)',
        secondaryLabel: 'Limbah Medis Padat (Kg)',
        targetLabel: 'Rata Ambang Pantau',
        targetValue: config.mode === 'BULAN' ? 82 : 330,
        badgeText: `${formattedKg} Kg`,
        headlineValue: `${formattedKg} Kg`,
        complianceAvg: avgCompliance,
        trendDelta: `${trendDelta} Kg`,
        points,
      };
    } else if (key === 'vektor') {
      result.vektor = {
        key: 'vektor',
        shortLabel: 'Vektor',
        title: 'Tren Ruangan Bebas Vektor & Binatang Pengganggu',
        subtitle: `${dataset.vectorUnitCount} Ruangan & Unit RSAM (8 Indikator Vektor)`,
        href: '/monitoring/vektor',
        unit: '% MS',
        primaryLabel: 'Bebas Vektor Kumulatif (%)',
        secondaryLabel: 'Angka Bebas Jentik (%)',
        targetLabel: 'Standar Bebas Vektor 95%',
        targetValue: 95,
        badgeText: `${avgCompliance}% MS`,
        headlineValue: `${avgCompliance}%`,
        complianceAvg: avgCompliance,
        trendDelta: `${trendDelta}%`,
        points,
      };
    } else if (key === 'pangan') {
      result.pangan = {
        key: 'pangan',
        shortLabel: 'Sanitasi Pangan',
        title: 'Tren Higiene Sanitasi Pangan',
        subtitle: 'Kesehatan & Keamanan Proses Penghidangan (Jasa Boga Gol. B)',
        href: '/monitoring/sanitasi-pangan',
        unit: '% IKL',
        primaryLabel: 'Nilai Penghidangan (%)',
        secondaryLabel: 'Sertifikat Jasa Boga (%)',
        targetLabel: 'Standar IKL 80%',
        targetValue: 80,
        badgeText: `${avgCompliance}% IKL`,
        headlineValue: `${avgCompliance}%`,
        complianceAvg: avgCompliance,
        trendDelta: `${trendDelta}%`,
        points,
      };
    }
  }

  return result;
}
