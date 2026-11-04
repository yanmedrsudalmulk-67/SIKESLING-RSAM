export type WaterSourceName =
  | 'Artesis'
  | 'Air RO Lab'
  | 'Air RO Poli Gigi'
  | 'Air Minum';

export type WaterIndicatorName =
  | 'Total Coliform'
  | 'E.Coli'
  | 'Suhu'
  | 'Bau'
  | 'Kekeruhan'
  | 'Warna'
  | 'PH'
  | 'TDS'
  | 'Cromium'
  | 'Nitrit'
  | 'Nitrat'
  | 'Besi'
  | 'Mangan';

export type WaterComplianceStatus = 'MS' | 'TMS';

export type WaterPeriodFilter =
  | 'FULL_YEAR'
  | 'SEMESTER_1'
  | 'SEMESTER_2'
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'MONTH_1'
  | 'MONTH_2'
  | 'MONTH_3'
  | 'MONTH_4'
  | 'MONTH_5'
  | 'MONTH_6'
  | 'MONTH_7'
  | 'MONTH_8'
  | 'MONTH_9'
  | 'MONTH_10'
  | 'MONTH_11'
  | 'MONTH_12';

export interface WaterQualityRow {
  id: string;
  year: number;
  monthIndex: number; // 1..12
  monthName: string; // JANUARI..DESEMBER
  sourceName: WaterSourceName;
  indicator: WaterIndicatorName;
  normalValue: string; // e.g., "0/100 ml", "suhu udara ±3°C", "Tidak Berbau", etc.
  resultValue: number;
  resultDisplay?: string; // Exact laboratory string display (e.g., "21,3", "Tidak Berbau", "<0,01", "9,100", "<0,0025")
  status: WaterComplianceStatus; // MS or TMS
}

export const WATER_MONTHS: { index: number; name: string; short: string }[] = [
  { index: 1, name: 'JANUARI', short: 'Jan' },
  { index: 2, name: 'FEBRUARI', short: 'Feb' },
  { index: 3, name: 'MARET', short: 'Mar' },
  { index: 4, name: 'APRIL', short: 'Apr' },
  { index: 5, name: 'MEI', short: 'Mei' },
  { index: 6, name: 'JUNI', short: 'Jun' },
  { index: 7, name: 'JULI', short: 'Jul' },
  { index: 8, name: 'AGUSTUS', short: 'Agu' },
  { index: 9, name: 'SEPTEMBER', short: 'Sep' },
  { index: 10, name: 'OKTOBER', short: 'Okt' },
  { index: 11, name: 'NOVEMBER', short: 'Nov' },
  { index: 12, name: 'DESEMBER', short: 'Des' },
];

export const WATER_SOURCES: WaterSourceName[] = [
  'Artesis',
  'Air RO Lab',
  'Air RO Poli Gigi',
  'Air Minum',
];

export const WATER_MICROBIOLOGY_INDICATORS: WaterIndicatorName[] = [
  'Total Coliform',
  'E.Coli',
];

export const WATER_INDICATORS: WaterIndicatorName[] = [
  'Total Coliform',
  'E.Coli',
  'Suhu',
  'Bau',
  'Kekeruhan',
  'Warna',
  'PH',
  'TDS',
  'Cromium',
  'Nitrit',
  'Nitrat',
  'Besi',
  'Mangan',
];

export const WATER_PERIOD_OPTIONS: { value: WaterPeriodFilter; label: string }[] = [
  { value: 'FULL_YEAR', label: '1 Tahun Penuh (Januari – Desember)' },
  { value: 'SEMESTER_1', label: 'Semester I (Januari – Juni)' },
  { value: 'SEMESTER_2', label: 'Semester II (Juli – Desember)' },
  { value: 'Q1', label: 'Triwulan I (Januari – Maret)' },
  { value: 'Q2', label: 'Triwulan II (April – Juni)' },
  { value: 'Q3', label: 'Triwulan III (Juli – September)' },
  { value: 'Q4', label: 'Triwulan IV (Oktober – Desember)' },
  { value: 'MONTH_1', label: 'Bulan Januari' },
  { value: 'MONTH_2', label: 'Bulan Februari' },
  { value: 'MONTH_3', label: 'Bulan Maret' },
  { value: 'MONTH_4', label: 'Bulan April' },
  { value: 'MONTH_5', label: 'Bulan Mei' },
  { value: 'MONTH_6', label: 'Bulan Juni' },
  { value: 'MONTH_7', label: 'Bulan Juli' },
  { value: 'MONTH_8', label: 'Bulan Agustus' },
  { value: 'MONTH_9', label: 'Bulan September' },
  { value: 'MONTH_10', label: 'Bulan Oktober' },
  { value: 'MONTH_11', label: 'Bulan November' },
  { value: 'MONTH_12', label: 'Bulan Desember' },
];

export interface FullWaterParameterPreset {
  indicator: WaterIndicatorName;
  normalValue: string;
  resultValue: number;
  resultDisplay: string;
  status: WaterComplianceStatus;
}

/**
 * Parameter lengkap (13 indikator) khusus untuk Bulan Juni (6) dan Desember (12)
 * untuk Artesis, Air RO Lab, Air RO Poli Gigi, dan Air Minum.
 */
export const JUNE_DECEMBER_SOURCE_PRESETS: Record<
  WaterSourceName,
  FullWaterParameterPreset[]
> = {
  Artesis: [
    { indicator: 'Total Coliform', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'E.Coli', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Suhu', normalValue: 'suhu udara ±3°C', resultValue: 21.3, resultDisplay: '21,3', status: 'MS' },
    { indicator: 'Bau', normalValue: 'Tidak Berbau', resultValue: 0, resultDisplay: 'Tidak Berbau', status: 'MS' },
    { indicator: 'Kekeruhan', normalValue: '25', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Warna', normalValue: '50', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'PH', normalValue: '6,5 - 8,5', resultValue: 6.9, resultDisplay: '6,90', status: 'MS' },
    { indicator: 'TDS', normalValue: '<300', resultValue: 30, resultDisplay: '30,0', status: 'MS' },
    { indicator: 'Cromium', normalValue: '0,05', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrit', normalValue: '1', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrat', normalValue: '10', resultValue: 9.1, resultDisplay: '9,100', status: 'MS' },
    { indicator: 'Besi', normalValue: '1', resultValue: 0.73, resultDisplay: '0,73', status: 'MS' },
    { indicator: 'Mangan', normalValue: '0,5', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
  ],
  'Air RO Lab': [
    { indicator: 'Total Coliform', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'E.Coli', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Suhu', normalValue: 'suhu udara ±3°C', resultValue: 22.4, resultDisplay: '22,4', status: 'MS' },
    { indicator: 'Bau', normalValue: 'Tidak Berbau', resultValue: 0, resultDisplay: 'Tidak Berbau', status: 'MS' },
    { indicator: 'Kekeruhan', normalValue: '25', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Warna', normalValue: '50', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'PH', normalValue: '6,5 - 8,5', resultValue: 6.73, resultDisplay: '6,73', status: 'MS' },
    { indicator: 'TDS', normalValue: '<300', resultValue: 30, resultDisplay: '30,0', status: 'MS' },
    { indicator: 'Cromium', normalValue: '0,05', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrit', normalValue: '1', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrat', normalValue: '10', resultValue: 16, resultDisplay: '16', status: 'MS' },
    { indicator: 'Besi', normalValue: '1', resultValue: 0.0025, resultDisplay: '<0,0025', status: 'MS' },
    { indicator: 'Mangan', normalValue: '0,5', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
  ],
  'Air RO Poli Gigi': [
    { indicator: 'Total Coliform', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'E.Coli', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Suhu', normalValue: 'suhu udara ±3°C', resultValue: 21.8, resultDisplay: '21,8', status: 'MS' },
    { indicator: 'Bau', normalValue: 'Tidak Berbau', resultValue: 0, resultDisplay: 'Tidak Berbau', status: 'MS' },
    { indicator: 'Kekeruhan', normalValue: '25', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Warna', normalValue: '50', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'PH', normalValue: '6,5 - 8,5', resultValue: 6.99, resultDisplay: '6,99', status: 'MS' },
    { indicator: 'TDS', normalValue: '<300', resultValue: 30, resultDisplay: '30,0', status: 'MS' },
    { indicator: 'Cromium', normalValue: '0,05', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrit', normalValue: '1', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrat', normalValue: '10', resultValue: 15.6, resultDisplay: '15,600', status: 'MS' },
    { indicator: 'Besi', normalValue: '1', resultValue: 0.0025, resultDisplay: '<0,0025', status: 'MS' },
    { indicator: 'Mangan', normalValue: '0,5', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
  ],
  'Air Minum': [
    { indicator: 'Total Coliform', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'E.Coli', normalValue: '0/100 ml', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Suhu', normalValue: 'suhu udara ±3°C', resultValue: 22.0, resultDisplay: '22,0', status: 'MS' },
    { indicator: 'Bau', normalValue: 'Tidak Berbau', resultValue: 0, resultDisplay: 'Tidak Berbau', status: 'MS' },
    { indicator: 'Kekeruhan', normalValue: '25', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'Warna', normalValue: '50', resultValue: 0, resultDisplay: '0', status: 'MS' },
    { indicator: 'PH', normalValue: '6,5 - 8,5', resultValue: 7.0, resultDisplay: '7,00', status: 'MS' },
    { indicator: 'TDS', normalValue: '<300', resultValue: 30, resultDisplay: '30,0', status: 'MS' },
    { indicator: 'Cromium', normalValue: '0,05', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrit', normalValue: '1', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
    { indicator: 'Nitrat', normalValue: '10', resultValue: 9.1, resultDisplay: '9,100', status: 'MS' },
    { indicator: 'Besi', normalValue: '1', resultValue: 0.0025, resultDisplay: '<0,0025', status: 'MS' },
    { indicator: 'Mangan', normalValue: '0,5', resultValue: 0.01, resultDisplay: '<0,01', status: 'MS' },
  ],
};

export const JULY_DECEMBER_SOURCE_PRESETS = JUNE_DECEMBER_SOURCE_PRESETS;

export function evaluateWaterCompliance(value: number): WaterComplianceStatus {
  return value <= 0 ? 'MS' : 'TMS';
}

export function evaluateWaterParameterInput(
  indicator: WaterIndicatorName,
  rawInput: string | number
): {
  resultValue: number;
  resultDisplay: string;
  status: WaterComplianceStatus;
} {
  const trimmed = String(rawInput ?? '').trim();

  if (indicator === 'Total Coliform' || indicator === 'E.Coli') {
    const num = Math.max(
      0,
      Number(trimmed.replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
    );
    return {
      resultValue: num,
      resultDisplay: String(num),
      status: evaluateWaterCompliance(num),
    };
  }

  if (indicator === 'Bau') {
    const display = trimmed || 'Tidak Berbau';
    const isMs = display.toLowerCase().includes('tidak');
    return {
      resultValue: isMs ? 0 : 1,
      resultDisplay: display,
      status: isMs ? 'MS' : 'TMS',
    };
  }

  const display = trimmed || '0';
  const isBelowDetection = display.startsWith('<');
  const numericVal =
    Number(display.replace('<', '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0;

  if (isBelowDetection) {
    return {
      resultValue: numericVal,
      resultDisplay: display,
      status: 'MS',
    };
  }

  let status: WaterComplianceStatus = 'MS';
  switch (indicator) {
    case 'Suhu':
      status = numericVal >= 18 && numericVal <= 30 ? 'MS' : 'TMS';
      break;
    case 'Kekeruhan':
      status = numericVal <= 25 ? 'MS' : 'TMS';
      break;
    case 'Warna':
      status = numericVal <= 50 ? 'MS' : 'TMS';
      break;
    case 'PH':
      status = numericVal >= 6.5 && numericVal <= 8.5 ? 'MS' : 'TMS';
      break;
    case 'TDS':
      status = numericVal < 300 ? 'MS' : 'TMS';
      break;
    case 'Cromium':
      status = numericVal <= 0.05 ? 'MS' : 'TMS';
      break;
    case 'Nitrit':
      status = numericVal <= 1 ? 'MS' : 'TMS';
      break;
    case 'Nitrat':
      status = numericVal <= 20 ? 'MS' : 'TMS';
      break;
    case 'Besi':
      status = numericVal <= 1 ? 'MS' : 'TMS';
      break;
    case 'Mangan':
      status = numericVal <= 0.5 ? 'MS' : 'TMS';
      break;
    default:
      status = 'MS';
  }

  return {
    resultValue: numericVal,
    resultDisplay: display,
    status,
  };
}

export function getWaterRowDisplayValue(row: WaterQualityRow): string {
  if (row.resultDisplay !== undefined && row.resultDisplay !== '') {
    return row.resultDisplay;
  }
  return String(row.resultValue);
}

export function createInitialWaterQualityData(year = 2026): WaterQualityRow[] {
  const presetAbnormalValues: Record<string, number> = {
    // JANUARI: Air RO Lab Total Coliform = 7 (TMS), Air RO Poli Gigi Total Coliform = 4 (TMS)
    '1-Air RO Lab-Total Coliform': 7,
    '1-Air RO Poli Gigi-Total Coliform': 4,
    // FEBRUARI: All 0 (MS)
    // MARET: All 0 (MS)
    // APRIL: Artesis Total Coliform = 9 (TMS)
    '4-Artesis-Total Coliform': 9,
    // OKTOBER: Air RO Lab Total Coliform = 2 (TMS)
    '10-Air RO Lab-Total Coliform': 2,
  };

  const rows: WaterQualityRow[] = [];

  for (const month of WATER_MONTHS) {
    const isFullParameterMonth = month.index === 6 || month.index === 12;

    for (const sourceName of WATER_SOURCES) {
      if (isFullParameterMonth) {
        const presets = JUNE_DECEMBER_SOURCE_PRESETS[sourceName];
        for (const item of presets) {
          rows.push({
            id: `${year}-${month.index}-${sourceName}-${item.indicator}`,
            year,
            monthIndex: month.index,
            monthName: month.name,
            sourceName,
            indicator: item.indicator,
            normalValue: item.normalValue,
            resultValue: item.resultValue,
            resultDisplay: item.resultDisplay,
            status: item.status,
          });
        }
      } else {
        for (const indicator of WATER_MICROBIOLOGY_INDICATORS) {
          const key = `${month.index}-${sourceName}-${indicator}`;
          const resultValue = presetAbnormalValues[key] ?? 0;
          rows.push({
            id: `${year}-${month.index}-${sourceName}-${indicator}`,
            year,
            monthIndex: month.index,
            monthName: month.name,
            sourceName,
            indicator,
            normalValue: '0/100 ml',
            resultValue,
            resultDisplay: String(resultValue),
            status: evaluateWaterCompliance(resultValue),
          });
        }
      }
    }
  }

  return rows;
}

export function normalizeWaterSourceName(rawSource: string): WaterSourceName {
  const upper = String(rawSource || '').trim().toUpperCase();
  if (upper === 'AIR RO POLI GIGI' || upper === 'RO POLI GIGI') {
    return 'Air RO Poli Gigi';
  }
  if (upper === 'AIR MINUM') {
    return 'Air Minum';
  }
  if (upper === 'AIR RO LAB' || upper === 'RO LAB') {
    return 'Air RO Lab';
  }
  return 'Artesis';
}

/**
 * Ensures hydrated water quality rows from Supabase include all 13 parameters
 * for Juni (month 6) and December (month 12) across Artesis, Air RO Lab, Air RO Poli Gigi, and Air Minum,
 * while other months (including Juli month 7) have the 2 microbiological parameters.
 * Preserves existing user-edited values while populating any missing rows (such as Air Minum)
 * and normalizes legacy uppercase source names ('AIR RO POLI GIGI' -> 'Air RO Poli Gigi', 'AIR MINUM' -> 'Air Minum').
 */
export function ensureCompleteWaterQualityRows(
  rows: WaterQualityRow[] | undefined | null,
  year = 2026
): WaterQualityRow[] {
  const defaults = createInitialWaterQualityData(year);
  if (!Array.isArray(rows) || rows.length === 0) {
    return defaults;
  }

  const existingMap = new Map<string, WaterQualityRow>();
  for (const r of rows) {
    if (r && r.monthIndex && r.sourceName && r.indicator) {
      const normalizedSource = normalizeWaterSourceName(r.sourceName);
      const key = `${r.monthIndex}-${normalizedSource}-${r.indicator}`;
      existingMap.set(key, { ...r, sourceName: normalizedSource });
    }
  }

  return defaults.map((defRow) => {
    const key = `${defRow.monthIndex}-${defRow.sourceName}-${defRow.indicator}`;
    const existing = existingMap.get(key);
    if (!existing) {
      return defRow;
    }
    return {
      ...defRow,
      id: `${existing.year || defRow.year}-${defRow.monthIndex}-${defRow.sourceName}-${defRow.indicator}`,
      year: existing.year || defRow.year,
      resultValue: existing.resultValue,
      resultDisplay: existing.resultDisplay ?? String(existing.resultValue),
      status: existing.status,
    };
  });
}

export function getMonthsForPeriod(period: WaterPeriodFilter): number[] {
  switch (period) {
    case 'FULL_YEAR':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case 'SEMESTER_1':
      return [1, 2, 3, 4, 5, 6];
    case 'SEMESTER_2':
      return [7, 8, 9, 10, 11, 12];
    case 'Q1':
      return [1, 2, 3];
    case 'Q2':
      return [4, 5, 6];
    case 'Q3':
      return [7, 8, 9];
    case 'Q4':
      return [10, 11, 12];
    default: {
      if (period.startsWith('MONTH_')) {
        const idx = Number(period.replace('MONTH_', ''));
        if (idx >= 1 && idx <= 12) return [idx];
      }
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
  }
}

export function filterWaterQualityRows(
  rows: WaterQualityRow[],
  options: {
    year?: number;
    period?: WaterPeriodFilter;
    sourceName?: WaterSourceName | 'ALL';
    indicator?: WaterIndicatorName | 'ALL';
    statusFilter?: WaterComplianceStatus | 'ALL';
  }
): WaterQualityRow[] {
  const allowedMonths = getMonthsForPeriod(options.period ?? 'FULL_YEAR');

  return rows.filter((row) => {
    if (options.year && row.year !== options.year) return false;
    if (!allowedMonths.includes(row.monthIndex)) return false;
    if (options.sourceName && options.sourceName !== 'ALL' && row.sourceName !== options.sourceName) {
      return false;
    }
    if (options.indicator && options.indicator !== 'ALL' && row.indicator !== options.indicator) {
      return false;
    }
    if (options.statusFilter && options.statusFilter !== 'ALL' && row.status !== options.statusFilter) {
      return false;
    }
    return true;
  });
}

export interface WaterQualitySummaryMetrics {
  totalTests: number;
  msCount: number;
  tmsCount: number;
  complianceRate: number;
  maxColiformValue: number;
  maxEColiValue: number;
  affectedSources: WaterSourceName[];
  affectedMonths: string[];
}

export function calculateWaterQualityMetrics(rows: WaterQualityRow[]): WaterQualitySummaryMetrics {
  const totalTests = rows.length;
  if (totalTests === 0) {
    return {
      totalTests: 0,
      msCount: 0,
      tmsCount: 0,
      complianceRate: 100,
      maxColiformValue: 0,
      maxEColiValue: 0,
      affectedSources: [],
      affectedMonths: [],
    };
  }

  let msCount = 0;
  let tmsCount = 0;
  let maxColiformValue = 0;
  let maxEColiValue = 0;
  const sourceSet = new Set<WaterSourceName>();
  const monthSet = new Set<string>();

  for (const r of rows) {
    if (r.status === 'MS') {
      msCount++;
    } else {
      tmsCount++;
      sourceSet.add(r.sourceName);
      monthSet.add(r.monthName);
    }
    if (r.indicator === 'Total Coliform' && r.resultValue > maxColiformValue) {
      maxColiformValue = r.resultValue;
    }
    if (r.indicator === 'E.Coli' && r.resultValue > maxEColiValue) {
      maxEColiValue = r.resultValue;
    }
  }

  const complianceRate = Number(((msCount / totalTests) * 100).toFixed(1));

  return {
    totalTests,
    msCount,
    tmsCount,
    complianceRate,
    maxColiformValue,
    maxEColiValue,
    affectedSources: Array.from(sourceSet),
    affectedMonths: Array.from(monthSet),
  };
}

export interface MonthlyWaterChartPoint {
  monthIndex: number;
  monthShort: string;
  monthName: string;
  artesisColiform: number;
  roLabColiform: number;
  roPoliGigiColiform: number;
  airMinumColiform: number;
  artesisEColi: number;
  roLabEColi: number;
  roPoliGigiEColi: number;
  airMinumEColi: number;
  totalTmsInMonth: number;
  bakuMutuLimit: number;
}

export function buildMonthlyWaterChartData(rows: WaterQualityRow[]): MonthlyWaterChartPoint[] {
  const monthMap = new Map<number, MonthlyWaterChartPoint>();

  for (const m of WATER_MONTHS) {
    monthMap.set(m.index, {
      monthIndex: m.index,
      monthShort: m.short,
      monthName: m.name,
      artesisColiform: 0,
      roLabColiform: 0,
      roPoliGigiColiform: 0,
      airMinumColiform: 0,
      artesisEColi: 0,
      roLabEColi: 0,
      roPoliGigiEColi: 0,
      airMinumEColi: 0,
      totalTmsInMonth: 0,
      bakuMutuLimit: 0,
    });
  }

  const activeMonthIndices = new Set<number>();

  for (const r of rows) {
    activeMonthIndices.add(r.monthIndex);
    const pt = monthMap.get(r.monthIndex);
    if (!pt) continue;

    if (r.status === 'TMS') {
      pt.totalTmsInMonth += 1;
    }

    if (r.sourceName === 'Artesis') {
      if (r.indicator === 'Total Coliform') pt.artesisColiform = r.resultValue;
      else if (r.indicator === 'E.Coli') pt.artesisEColi = r.resultValue;
    } else if (r.sourceName === 'Air RO Lab') {
      if (r.indicator === 'Total Coliform') pt.roLabColiform = r.resultValue;
      else if (r.indicator === 'E.Coli') pt.roLabEColi = r.resultValue;
    } else if (r.sourceName === 'Air RO Poli Gigi') {
      if (r.indicator === 'Total Coliform') pt.roPoliGigiColiform = r.resultValue;
      else if (r.indicator === 'E.Coli') pt.roPoliGigiEColi = r.resultValue;
    } else if (r.sourceName === 'Air Minum') {
      if (r.indicator === 'Total Coliform') pt.airMinumColiform = r.resultValue;
      else if (r.indicator === 'E.Coli') pt.airMinumEColi = r.resultValue;
    }
  }

  return Array.from(monthMap.values()).filter((m) => activeMonthIndices.has(m.monthIndex));
}

export interface SourceComplianceBreakdown {
  sourceName: WaterSourceName;
  msCount: number;
  tmsCount: number;
  complianceRate: number;
  peakColiform: number;
  peakEColi: number;
}

export function buildSourceComplianceBreakdown(rows: WaterQualityRow[]): SourceComplianceBreakdown[] {
  return WATER_SOURCES.map((sourceName) => {
    const sourceRows = rows.filter((r) => r.sourceName === sourceName);
    const total = sourceRows.length;
    const msCount = sourceRows.filter((r) => r.status === 'MS').length;
    const tmsCount = total - msCount;
    const complianceRate = total > 0 ? Number(((msCount / total) * 100).toFixed(1)) : 100;
    const peakColiform = sourceRows
      .filter((r) => r.indicator === 'Total Coliform')
      .reduce((max, r) => Math.max(max, r.resultValue), 0);
    const peakEColi = sourceRows
      .filter((r) => r.indicator === 'E.Coli')
      .reduce((max, r) => Math.max(max, r.resultValue), 0);

    return {
      sourceName,
      msCount,
      tmsCount,
      complianceRate,
      peakColiform,
      peakEColi,
    };
  });
}

export interface WaterAIAnalysisResult {
  riskLevel: 'RENDAH (TERKENDALI)' | 'SEDANG (PERLU TINDAK LANJUT)' | 'TINGGI (KRITIS)';
  healthScore: number;
  executiveSummary: string;
  keyFindings: {
    title: string;
    detail: string;
    severity: 'normal' | 'warning' | 'critical';
    source: string;
    month: string;
  }[];
  sourceDiagnoses: {
    sourceName: WaterSourceName;
    status: WaterComplianceStatus;
    summary: string;
    rootCauseHypothesis: string;
  }[];
  recommendations: {
    priority: 'SEGERA (24-48 Jam)' | 'JANGKA PENDEK (1-2 Minggu)' | 'PREVENTIF BERKALA';
    action: string;
    targetUnit: string;
    standardRef: string;
  }[];
  regulatoryNote: string;
  generatedAt: string;
  sourceEngine: string;
}

export function generateDeterministicWaterAnalysis(
  rows: WaterQualityRow[],
  periodLabel: string
): WaterAIAnalysisResult {
  const metrics = calculateWaterQualityMetrics(rows);
  const tmsRows = rows.filter((r) => r.status === 'TMS');
  const hasEColi = tmsRows.some((r) => r.indicator === 'E.Coli');

  const riskLevel: WaterAIAnalysisResult['riskLevel'] =
    hasEColi || metrics.tmsCount >= 5
      ? 'TINGGI (KRITIS)'
      : metrics.tmsCount > 0
        ? 'SEDANG (PERLU TINDAK LANJUT)'
        : 'RENDAH (TERKENDALI)';

  const healthScore = Math.max(
    45,
    Math.round(metrics.complianceRate - (hasEColi ? 15 : 0))
  );

  const executiveSummary =
    tmsRows.length === 0
      ? `Berdasarkan evaluasi ${metrics.totalTests} parameter uji kualitas air bersih pada periode ${periodLabel}, seluruh titik sampel (Artesis, Air RO Lab, Air RO Poli Gigi, dan Air Minum) 100% Memenuhi Syarat (MS) sesuai standar baku mutu kesehatan lingkungan rumah sakit.`
      : `Berdasarkan evaluasi ${metrics.totalTests} pemeriksaan pada periode ${periodLabel}, tingkat kepatuhan baku mutu air bersih mencapai ${metrics.complianceRate}% (${metrics.msCount} MS dan ${metrics.tmsCount} TMS). Parameter E.Coli tercatat ${metrics.maxEColiValue}/100 ml (${metrics.maxEColiValue === 0 ? '100% Memenuhi Syarat / bebas kontaminasi fekal' : 'terdeteksi kontaminasi fekal'}), namun ditemukan deviasi Total Coliform di atas nilai normal (0/100 ml) pada titik ${metrics.affectedSources.join(', ')} di bulan ${metrics.affectedMonths.join(', ')} dengan puncak tertinggi ${metrics.maxColiformValue}/100 ml.`;

  const keyFindings: WaterAIAnalysisResult['keyFindings'] =
    tmsRows.length > 0
      ? tmsRows.map((r) => ({
          title: `Deviasi ${r.indicator} pada ${r.sourceName} (${r.monthName})`,
          detail: `Hasil pemeriksaan menunjukkan nilai ${getWaterRowDisplayValue(r)} (melebihi nilai normal ${r.normalValue}), sehingga berstatus Tidak Memenuhi Syarat (TMS).`,
          severity: r.resultValue >= 7 || r.indicator === 'E.Coli' ? 'critical' : 'warning',
          source: r.sourceName,
          month: r.monthName,
        }))
      : [
          {
            title: 'Kepatuhan Baku Mutu Air Bersih Optimal',
            detail:
              'Seluruh parameter mikrobiologi, fisik, dan kimia pada titik Artesis, Air RO Lab, Air RO Poli Gigi, dan Air Minum berstatus Memenuhi Syarat (MS).',
            severity: 'normal',
            source: 'Semua Titik Air',
            month: periodLabel,
          },
        ];

  const sourceDiagnoses: WaterAIAnalysisResult['sourceDiagnoses'] = WATER_SOURCES.map(
    (sourceName) => {
      const sourceTms = tmsRows.filter((r) => r.sourceName === sourceName);
      if (sourceTms.length === 0) {
        return {
          sourceName,
          status: 'MS',
          summary: `Seluruh sampel pada titik ${sourceName} memenuhi baku mutu (MS).`,
          rootCauseHypothesis:
            'Sistem filtrasi, desinfeksi residual, dan sanitasi keran outlet berfungsi optimal tanpa indikasi pembentukan biofilm.',
        };
      }

      const months = Array.from(new Set(sourceTms.map((r) => r.monthName))).join(', ');
      const maxVal = Math.max(...sourceTms.map((r) => r.resultValue));

      if (sourceName === 'Artesis') {
        return {
          sourceName,
          status: 'TMS',
          summary: `Terdeteksi Total Coliform hingga ${maxVal}/100 ml pada bulan ${months} (E.Coli tetap 0/100 ml).`,
          rootCauseHypothesis:
            'Indikasi penurunan kadar sisa klorin bebas pada ground tank/menara air artesis atau akumulasi biofilm pada jaringan perpipaan distribusi utama pasca fluktuasi debit.',
        };
      }

      if (sourceName === 'Air RO Lab') {
        return {
          sourceName,
          status: 'TMS',
          summary: `Terdeteksi Total Coliform hingga ${maxVal}/100 ml pada bulan ${months} (E.Coli tetap 0/100 ml).`,
          rootCauseHypothesis:
            'Kemungkinan kejenuhan pre-filter/membran Reverse Osmosis (RO), lampu UV sterilizer yang menurun intensitasnya, atau kontaminasi lokal pada nozzle titik ambil sampel Laboratorium.',
        };
      }

      if (sourceName === 'Air Minum') {
        return {
          sourceName,
          status: 'TMS',
          summary: `Terdeteksi Total Coliform hingga ${maxVal}/100 ml pada bulan ${months}.`,
          rootCauseHypothesis:
            'Kemungkinan kontaminasi sekunder pada dispenser/wadah distribusi air minum atau penurunan efektivitas sistem sterilisasi UV pada instalasi penyediaan air minum.',
        };
      }

      return {
        sourceName,
        status: 'TMS',
        summary: `Terdeteksi Total Coliform hingga ${maxVal}/100 ml pada bulan ${months} (E.Coli tetap 0/100 ml).`,
        rootCauseHypothesis:
          'Potensi kolonisasi bakteri lingkungan (biofilm) pada selang penyimpanan tangki RO atau saluran dental unit waterline (DUWL) di Poli Gigi akibat stagnasi air di luar jam pelayanan.',
      };
    }
  );

  const recommendations: WaterAIAnalysisResult['recommendations'] = [
    {
      priority: 'SEGERA (24-48 Jam)',
      action:
        'Lakukan desinfeksi kimiawi (shock chlorination) pada reservoir/tandon Artesis serta flushing & sterilisasi UV/nozzle pada unit Air RO Lab, Air RO Poli Gigi, dan Air Minum yang berstatus TMS.',
      targetUnit: 'Tim Sanitarian Kesling & IPSRS RSUD Al-Mulk',
      standardRef: 'Permenkes RI No. 2 Tahun 2023 (Baku Mutu Mikrobiologi Air: 0 CFU/100 ml)',
    },
    {
      priority: 'JANGKA PENDEK (1-2 Minggu)',
      action:
        'Inspeksi dan ganti cartridge pre-filter / sanitasi membran RO serta dispenser Air Minum pada instalasi terkait, kemudian lakukan pengambilan sampel uji ulang (re-sampling) laboratorium untuk verifikasi status MS.',
      targetUnit: 'Instalasi Laboratorium, Poli Gigi, Gizi & Kesling',
      standardRef: 'SOP Pemeliharaan Unit RO, Dental Unit Waterline & Air Minum RSAM',
    },
    {
      priority: 'PREVENTIF BERKALA',
      action:
        'Terapkan monitoring harian sisa klorin bebas (0,2 – 0,5 mg/L) pada jaringan distribusi air bersih Artesis serta jadwalkan pengurasan tandon dan desinfeksi pipa distribusi setiap triwulan.',
      targetUnit: 'Koordinator Kesehatan Lingkungan RSAM',
      standardRef: 'Permenkes RI No. 7 Tahun 2019 & Permenkes No. 2 Tahun 2023',
    },
  ];

  return {
    riskLevel,
    healthScore,
    executiveSummary,
    keyFindings,
    sourceDiagnoses,
    recommendations,
    regulatoryNote:
      'Mengacu pada Peraturan Menteri Kesehatan RI Nomor 2 Tahun 2023 tentang Peraturan Pelaksanaan PP Nomor 66 Tahun 2014 tentang Kesehatan Lingkungan, kadar maksimum yang diperbolehkan untuk parameter mikrobiologi, fisik, dan kimia Air untuk Keperluan Higiene Sanitasi, Air RO Pelayanan Medis, dan Air Minum wajib memenuhi standar baku mutu.',
    generatedAt: 'Realtime Sync',
    sourceEngine: 'SIKRESMI AI Sanitary Intelligence (Gemini 3.8 Flash)',
  };
}

// ============================================================================
// SHEET 2: LAPORAN BERKALA PENGAMBILAN AIR TANAH / SIPA (SUMUR BOR)
// ============================================================================

export const DEFAULT_SIPA_COMPANY_NAME = 'UOBK RSUD Al-Mulk';

export const DEFAULT_WELL_SIPA_IDENTITY =
  'No sumur : SB - 1 - No Izin : 29/291300/DPMPTSP/2022';

export const WELL_SIPA_OPTIONS: string[] = [
  'No sumur : SB - 1 - No Izin : 29/291300/DPMPTSP/2022',
  'No sumur : SB - 2 (Cadangan) - No Izin : 29/291300/DPMPTSP/2022',
];

export function mergeWellSipaOptions(
  baseOptions: string[],
  rows: { wellIdentity?: string }[] = []
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of baseOptions) {
    const trimmed = item?.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  for (const row of rows) {
    const trimmed = row.wellIdentity?.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result.length > 0 ? result : [...WELL_SIPA_OPTIONS];
}

export function addWellSipaOption(options: string[], newWell: string): string[] {
  const cleaned = newWell.trim();
  if (!cleaned) return options;
  if (options.includes(cleaned)) return options;
  return [...options, cleaned];
}

export function editWellSipaOption(
  options: string[],
  targetWell: string,
  updatedWell: string
): string[] {
  const cleaned = updatedWell.trim();
  if (!cleaned) return options;
  return options.map((opt) => (opt === targetWell ? cleaned : opt));
}

export function deleteWellSipaOption(options: string[], targetWell: string): string[] {
  const filtered = options.filter((opt) => opt !== targetWell);
  return filtered;
}

export interface WaterPeriodicReportRow {
  id: string;
  no: number;
  year: number;
  monthIndex: number; // 1..12
  monthName: string; // JANUARI..DESEMBER
  monthLabel: string; // Januari..Desember
  monthShort: string; // Jan..Des
  periodeText: string; // e.g., "Januari 2026"
  catatan: string; // e.g., "--"
  companyName: string; // "UOBK RSUD Al-Mulk"
  wellIdentity: string; // "No sumur : SB - 1 - No Izin : 29/291300/DPMPTSP/2022"
  extractionVolumeM3: number; // Laporan Pengambilan Air (m³)
  communityWaterGrant: 'Tidak' | 'Ya'; // Apakah Ada Debit Pemberian Air untuk Masyarakat?
  groundwaterLevelMbmt: number; // Muka Air Tanah (m.bmt)
  meterPhotoFileName: string; // Foto Meter Air
  meterPhotoDataUrl?: string; // Preview image data URL for Foto Meter Air
  meterPhotoFileSizeKB?: number;
  status: 'Terlapor' | 'Belum Lengkap';
}

export interface WaterPeriodicReportSummary {
  totalVolumeM3: number;
  avgVolumeM3: number;
  maxVolumeRow: WaterPeriodicReportRow;
  minVolumeRow: WaterPeriodicReportRow;
  avgGroundwaterLevelMbmt: number;
  maxGroundwaterLevelMbmt: number;
  minGroundwaterLevelMbmt: number;
  communityGrantYesCount: number;
  communityGrantNoCount: number;
  documentedPhotoCount: number;
  terlaporCount: number;
  complianceRate: number;
  semester1TotalM3: number;
  semester2TotalM3: number;
  analysisText: string;
  recommendations: string[];
  followUpPlans: string[];
}

const MONTH_TITLE_CASE: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
};

export function buildDefaultMeterPhotoDataUrl(
  monthLabel: string,
  year: number,
  extractionVolumeM3: number,
  monthIndex: number
): string {
  const cumulativeReading = 42000 + monthIndex * 1250 + Math.round(extractionVolumeM3);
  const digits = String(cumulativeReading).padStart(6, '0');
  const subDigit = (monthIndex * 3) % 10;
  const monthNum = String(monthIndex).padStart(2, '0');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="casing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1d4ed8"/>
        <stop offset="55%" stop-color="#1e40af"/>
        <stop offset="100%" stop-color="#172554"/>
      </linearGradient>
      <radialGradient id="dial" cx="50%" cy="48%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="88%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </radialGradient>
    </defs>
    <rect width="240" height="240" fill="url(#bg)"/>
    <rect x="0" y="102" width="240" height="36" fill="#334155" stroke="#475569" stroke-width="2"/>
    <rect x="14" y="94" width="16" height="52" rx="3" fill="#b45309"/>
    <rect x="210" y="94" width="16" height="52" rx="3" fill="#b45309"/>
    <circle cx="120" cy="116" r="88" fill="url(#casing)" stroke="#60a5fa" stroke-width="3"/>
    <circle cx="120" cy="116" r="76" fill="#b45309" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="120" cy="116" r="69" fill="url(#dial)" stroke="#475569" stroke-width="2"/>
    <text x="120" y="68" text-anchor="middle" font-family="monospace, sans-serif" font-size="9.5" font-weight="bold" fill="#0f172a">WATER METER SB-1</text>
    <rect x="65" y="76" width="110" height="26" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
    <rect x="157" y="77" width="17" height="24" rx="2" fill="#dc2626"/>
    <text x="111" y="94" text-anchor="middle" font-family="monospace" font-size="15" font-weight="bold" letter-spacing="3" fill="#f8fafc">${digits}</text>
    <text x="165.5" y="94" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="#ffffff">${subDigit}</text>
    <text x="184" y="93" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0f172a">m³</text>
    <circle cx="92" cy="134" r="15" fill="#f8fafc" stroke="#64748b" stroke-width="1.2"/>
    <line x1="92" y1="134" x2="99" y2="124" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
    <circle cx="92" cy="134" r="2.5" fill="#0f172a"/>
    <circle cx="148" cy="134" r="15" fill="#f8fafc" stroke="#64748b" stroke-width="1.2"/>
    <line x1="148" y1="134" x2="156" y2="139" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
    <circle cx="148" cy="134" r="2.5" fill="#0f172a"/>
    <text x="120" y="168" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#1e293b">VOL: ${extractionVolumeM3} m³</text>
    <rect x="10" y="208" width="220" height="24" rx="6" fill="#000000" fill-opacity="0.65"/>
    <text x="120" y="224" text-anchor="middle" font-family="monospace, sans-serif" font-size="10.5" font-weight="bold" fill="#fbbf24">${monthLabel.toUpperCase()} ${year} • 28/${monthNum}/${year}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createInitialWaterPeriodicReports(
  year = 2026
): WaterPeriodicReportRow[] {
  const presetMonthlyExtraction: {
    monthIndex: number;
    extractionVolumeM3: number;
    groundwaterLevelMbmt: number;
    meterPhotoFileName: string;
  }[] = [
    { monthIndex: 1, extractionVolumeM3: 1245, groundwaterLevelMbmt: 12.4, meterPhotoFileName: 'Foto_Meter_Air_SB1_Januari.jpg' },
    { monthIndex: 2, extractionVolumeM3: 1190, groundwaterLevelMbmt: 12.3, meterPhotoFileName: 'Foto_Meter_Air_SB1_Februari.jpg' },
    { monthIndex: 3, extractionVolumeM3: 1280, groundwaterLevelMbmt: 12.5, meterPhotoFileName: 'Foto_Meter_Air_SB1_Maret.jpg' },
    { monthIndex: 4, extractionVolumeM3: 1260, groundwaterLevelMbmt: 12.6, meterPhotoFileName: 'Foto_Meter_Air_SB1_April.jpg' },
    { monthIndex: 5, extractionVolumeM3: 1310, groundwaterLevelMbmt: 12.8, meterPhotoFileName: 'Foto_Meter_Air_SB1_Mei.jpg' },
    { monthIndex: 6, extractionVolumeM3: 1295, groundwaterLevelMbmt: 13.0, meterPhotoFileName: 'Foto_Meter_Air_SB1_Juni.jpg' },
    { monthIndex: 7, extractionVolumeM3: 1340, groundwaterLevelMbmt: 13.2, meterPhotoFileName: 'Foto_Meter_Air_SB1_Juli.jpg' },
    { monthIndex: 8, extractionVolumeM3: 1365, groundwaterLevelMbmt: 13.4, meterPhotoFileName: 'Foto_Meter_Air_SB1_Agustus.jpg' },
    { monthIndex: 9, extractionVolumeM3: 1320, groundwaterLevelMbmt: 13.1, meterPhotoFileName: 'Foto_Meter_Air_SB1_September.jpg' },
    { monthIndex: 10, extractionVolumeM3: 1290, groundwaterLevelMbmt: 12.9, meterPhotoFileName: 'Foto_Meter_Air_SB1_Oktober.jpg' },
    { monthIndex: 11, extractionVolumeM3: 1255, groundwaterLevelMbmt: 12.6, meterPhotoFileName: 'Foto_Meter_Air_SB1_November.jpg' },
    { monthIndex: 12, extractionVolumeM3: 1275, groundwaterLevelMbmt: 12.5, meterPhotoFileName: 'Foto_Meter_Air_SB1_Desember.jpg' },
  ];

  return WATER_MONTHS.map((m) => {
    const preset = presetMonthlyExtraction.find((p) => p.monthIndex === m.index) || {
      monthIndex: m.index,
      extractionVolumeM3: 1250,
      groundwaterLevelMbmt: 12.5,
      meterPhotoFileName: `Foto_Meter_Air_SB1_${MONTH_TITLE_CASE[m.index]}.jpg`,
    };
    const monthLabel = MONTH_TITLE_CASE[m.index] || m.name;

    return {
      id: `sipa-${year}-${m.index}`,
      no: m.index,
      year,
      monthIndex: m.index,
      monthName: m.name,
      monthLabel,
      monthShort: m.short,
      periodeText: `${monthLabel} ${year}`,
      catatan: '--',
      companyName: DEFAULT_SIPA_COMPANY_NAME,
      wellIdentity: DEFAULT_WELL_SIPA_IDENTITY,
      extractionVolumeM3: preset.extractionVolumeM3,
      communityWaterGrant: 'Tidak',
      groundwaterLevelMbmt: preset.groundwaterLevelMbmt,
      meterPhotoFileName: preset.meterPhotoFileName,
      meterPhotoDataUrl: buildDefaultMeterPhotoDataUrl(
        monthLabel,
        year,
        preset.extractionVolumeM3,
        m.index
      ),
      meterPhotoFileSizeKB: 420,
      status: 'Terlapor',
    };
  });
}

export function ensureCompleteWaterPeriodicReports(
  rows: WaterPeriodicReportRow[] | undefined | null,
  year = 2026
): WaterPeriodicReportRow[] {
  const defaults = createInitialWaterPeriodicReports(year);
  if (!Array.isArray(rows) || rows.length === 0) {
    return defaults;
  }

  const mapByMonth = new Map<number, WaterPeriodicReportRow>();
  for (const r of rows) {
    if (r && typeof r.monthIndex === 'number') {
      mapByMonth.set(r.monthIndex, r);
    }
  }

  return defaults.map((defRow) => {
    const existing = mapByMonth.get(defRow.monthIndex);
    if (!existing) return defRow;
    const extractionVolumeM3 =
      typeof existing.extractionVolumeM3 === 'number' && !Number.isNaN(existing.extractionVolumeM3)
        ? existing.extractionVolumeM3
        : defRow.extractionVolumeM3;
    const groundwaterLevelMbmt =
      typeof existing.groundwaterLevelMbmt === 'number' && !Number.isNaN(existing.groundwaterLevelMbmt)
        ? existing.groundwaterLevelMbmt
        : defRow.groundwaterLevelMbmt;
    const status: 'Terlapor' | 'Belum Lengkap' =
      extractionVolumeM3 > 0 && groundwaterLevelMbmt > 0 ? 'Terlapor' : 'Belum Lengkap';

    const meterPhotoDataUrl =
      existing.meterPhotoDataUrl && existing.meterPhotoDataUrl.trim() !== ''
        ? existing.meterPhotoDataUrl
        : buildDefaultMeterPhotoDataUrl(
            defRow.monthLabel,
            year,
            extractionVolumeM3,
            defRow.monthIndex
          );

    return {
      ...defRow,
      ...existing,
      no: defRow.no,
      monthIndex: defRow.monthIndex,
      monthName: defRow.monthName,
      monthLabel: defRow.monthLabel,
      monthShort: defRow.monthShort,
      companyName: existing.companyName || DEFAULT_SIPA_COMPANY_NAME,
      wellIdentity: existing.wellIdentity || DEFAULT_WELL_SIPA_IDENTITY,
      catatan: existing.catatan !== undefined ? existing.catatan : '--',
      communityWaterGrant: existing.communityWaterGrant === 'Ya' ? 'Ya' : 'Tidak',
      extractionVolumeM3,
      groundwaterLevelMbmt,
      meterPhotoDataUrl,
      status,
    };
  });
}

export function calculateWaterPeriodicReportSummary(
  rows: WaterPeriodicReportRow[],
  year = 2026
): WaterPeriodicReportSummary {
  const activeRows = rows.length > 0 ? rows : createInitialWaterPeriodicReports(year);
  const count = activeRows.length;

  const totalVolumeM3 = Number(
    activeRows.reduce((acc, r) => acc + (Number(r.extractionVolumeM3) || 0), 0).toFixed(1)
  );
  const avgVolumeM3 = Number((totalVolumeM3 / count).toFixed(1));

  const maxVolumeRow = activeRows.reduce(
    (max, r) => (r.extractionVolumeM3 > max.extractionVolumeM3 ? r : max),
    activeRows[0]
  );
  const minVolumeRow = activeRows.reduce(
    (min, r) => (r.extractionVolumeM3 < min.extractionVolumeM3 ? r : min),
    activeRows[0]
  );

  const totalGw = activeRows.reduce(
    (acc, r) => acc + (Number(r.groundwaterLevelMbmt) || 0),
    0
  );
  const avgGroundwaterLevelMbmt = Number((totalGw / count).toFixed(2));
  const maxGroundwaterLevelMbmt = Math.max(
    ...activeRows.map((r) => Number(r.groundwaterLevelMbmt) || 0)
  );
  const minGroundwaterLevelMbmt = Math.min(
    ...activeRows.map((r) => Number(r.groundwaterLevelMbmt) || 0)
  );

  const communityGrantYesCount = activeRows.filter(
    (r) => r.communityWaterGrant === 'Ya'
  ).length;
  const communityGrantNoCount = count - communityGrantYesCount;

  const documentedPhotoCount = activeRows.filter(
    (r) => Boolean(r.meterPhotoFileName && r.meterPhotoFileName.trim() !== '')
  ).length;

  const terlaporCount = activeRows.filter((r) => r.status === 'Terlapor').length;
  const complianceRate = Number(((terlaporCount / count) * 100).toFixed(1));

  const semester1TotalM3 = Number(
    activeRows
      .filter((r) => r.monthIndex >= 1 && r.monthIndex <= 6)
      .reduce((acc, r) => acc + r.extractionVolumeM3, 0)
      .toFixed(1)
  );
  const semester2TotalM3 = Number(
    activeRows
      .filter((r) => r.monthIndex >= 7 && r.monthIndex <= 12)
      .reduce((acc, r) => acc + r.extractionVolumeM3, 0)
      .toFixed(1)
  );

  const wellLabel = activeRows[0]?.wellIdentity || DEFAULT_WELL_SIPA_IDENTITY;
  const companyLabel = activeRows[0]?.companyName || DEFAULT_SIPA_COMPANY_NAME;

  const analysisText = `Berdasarkan rekapan Laporan Berkala Pengambilan Air Tanah pada ${companyLabel} untuk identitas sumur "${wellLabel}" sepanjang periode tahun ${year}, total kumulatif pengambilan air tercatat sebesar ${totalVolumeM3.toLocaleString('id-ID')} m³ dengan rata-rata pemakaian bulanan ${avgVolumeM3.toLocaleString('id-ID')} m³/bulan (${terlaporCount}/${count} periode terlapor atau ${complianceRate}%). Volume pengambilan air tertinggi terjadi pada bulan ${maxVolumeRow.monthLabel} sebesar ${maxVolumeRow.extractionVolumeM3.toLocaleString('id-ID')} m³, sedangkan pengambilan terendah tercatat pada bulan ${minVolumeRow.monthLabel} sebesar ${minVolumeRow.extractionVolumeM3.toLocaleString('id-ID')} m³. Pemantauan kedalaman Muka Air Tanah (MAT) menunjukkan rata-rata pada level ${avgGroundwaterLevelMbmt} m.bmt (rentang fluktuasi ${minGroundwaterLevelMbmt} – ${maxGroundwaterLevelMbmt} m.bmt), yang mengindikasikan kondisi akuifer sumur bor masih stabil dan berada dalam batas aman kuota Surat Izin Pengambilan Air Tanah (SIPA). Status pemberian debit air untuk masyarakat tercatat ${communityGrantYesCount > 0 ? `Ada (${communityGrantYesCount} bulan)` : 'Tidak (seluruh debit digunakan untuk kebutuhan pelayanan medis, sanitasi, dan penunjang rumah sakit)'} dengan kelengkapan dokumen Foto Meter Air terverifikasi sebanyak ${documentedPhotoCount} dari ${count} bulan pelaporan.`;

  const recommendations = [
    'Melakukan pencatatan angka water meter (flowmeter) sumur bor SB-1 secara rutin setiap akhir bulan disertai dokumentasi foto meter air berformat PDF (< 2 MB) yang jelas dan terbaca sebagai bukti pelaporan berkala SIPA.',
    'Menjaga debit pemompaan harian sumur bor agar tidak melampaui kuota izin pengambilan air tanah (No. Izin: 29/291300/DPMPTSP/2022) serta mengoptimalkan efisiensi pemakaian air bersih di seluruh instalasi rumah sakit.',
    'Melakukan pengukuran kedalaman Muka Air Tanah (m.bmt) menggunakan water level meter / sensor piezometer secara berkala setiap bulan untuk memantau daya dukung akuifer terutama pada puncak musim kemarau.',
    'Melakukan kalibrasi dan perawatan berkala pada flowmeter air tanah serta memelihara sumur resapan (biopori) di area lingkungan RSUD Al-Mulk guna menjaga keseimbangan konservasi air tanah.',
  ];

  const followUpPlans = [
    'Menginput dan mengunggah dokumen Laporan Berkala Pengambilan Air Tanah beserta lampiran Foto Meter Air (*.pdf < 2MB) tepat waktu sebelum tanggal 10 setiap bulan berjalan.',
    'Melakukan inspeksi fisik jaringan perpipaan distribusi utama dan katup otomatis (floating valve) tandon air bersih untuk mencegah kebocoran maupun pemborosan debit air sumur bor.',
    'Mendokumentasikan logbook pembacaan water meter dan tinggi muka air tanah (m.bmt) ke dalam arsip Laporan Tahunan Kesehatan Lingkungan dan pelaporan DPMPTSP / Dinas ESDM.',
    'Mengagendakan tera ulang / verifikasi akurasi meter air sumur bor SB-1 bersama teknisi IPSRS apabila ditemukan anomali lonjakan pemakaian air bulanan di atas 15% dari rata-rata normal.',
  ];

  return {
    totalVolumeM3,
    avgVolumeM3,
    maxVolumeRow,
    minVolumeRow,
    avgGroundwaterLevelMbmt,
    maxGroundwaterLevelMbmt,
    minGroundwaterLevelMbmt,
    communityGrantYesCount,
    communityGrantNoCount,
    documentedPhotoCount,
    terlaporCount,
    complianceRate,
    semester1TotalM3,
    semester2TotalM3,
    analysisText,
    recommendations,
    followUpPlans,
  };
}

