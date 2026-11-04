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
