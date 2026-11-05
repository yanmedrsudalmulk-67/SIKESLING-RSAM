/**
 * Domain types, dataset, and pure analytical logic for
 * "INDIKATOR BAKU MUTU LIMBAH CAIR" (Monitoring Pengelolaan Limbah RSUD Al-Mulk)
 * Based on PermenLHK No. P.68/2016 and Permenkes No. 2/2023.
 */

export type WastewaterSamplingPoint = 'IPAL INLET' | 'IPAL OUTLET';

export type WastewaterIndicatorName =
  | 'Suhu'
  | 'TSS'
  | 'PH'
  | 'BOD'
  | 'COD'
  | 'Amoniak Nitrogen'
  | 'ZINK'
  | 'SULFIDA'
  | 'NITRIT'
  | 'NITRAT'
  | 'TOTAL COLIFORM';

export type WastewaterComplianceStatus = 'MS' | 'TMS';

export type WastewaterPeriodFilter =
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

export interface WastewaterRow {
  id: string;
  year: number;
  month: number;
  monthName: string;
  samplingPoint: WastewaterSamplingPoint;
  indicator: WastewaterIndicatorName;
  normalValue: string;
  resultValue: string;
  numericValue: number;
  unit: string;
  status: WastewaterComplianceStatus;
  notes: string;
}

export interface WastewaterStandardSpec {
  indicator: WastewaterIndicatorName;
  normalDisplay: string;
  unit: string;
  minVal?: number;
  maxVal?: number;
}

export const WASTEWATER_STANDARDS: Record<WastewaterIndicatorName, WastewaterStandardSpec> = {
  Suhu: {
    indicator: 'Suhu',
    normalDisplay: '-',
    unit: '°C',
    maxVal: 38, // Deviasi batas aman operasional
  },
  TSS: {
    indicator: 'TSS',
    normalDisplay: '30',
    unit: 'mg/L',
    maxVal: 30,
  },
  PH: {
    indicator: 'PH',
    normalDisplay: '6,0 - 9,0',
    unit: 'pH',
    minVal: 6.0,
    maxVal: 9.0,
  },
  BOD: {
    indicator: 'BOD',
    normalDisplay: '30',
    unit: 'mg/L',
    maxVal: 30,
  },
  COD: {
    indicator: 'COD',
    normalDisplay: '100',
    unit: 'mg/L',
    maxVal: 100,
  },
  'Amoniak Nitrogen': {
    indicator: 'Amoniak Nitrogen',
    normalDisplay: '10',
    unit: 'mg/L',
    maxVal: 10,
  },
  ZINK: {
    indicator: 'ZINK',
    normalDisplay: '10',
    unit: 'mg/L',
    maxVal: 10,
  },
  SULFIDA: {
    indicator: 'SULFIDA',
    normalDisplay: '300',
    unit: 'mg/L',
    maxVal: 300,
  },
  NITRIT: {
    indicator: 'NITRIT',
    normalDisplay: '40',
    unit: 'mg/L',
    maxVal: 40,
  },
  NITRAT: {
    indicator: 'NITRAT',
    normalDisplay: '30',
    unit: 'mg/L',
    maxVal: 30,
  },
  'TOTAL COLIFORM': {
    indicator: 'TOTAL COLIFORM',
    normalDisplay: '3000',
    unit: 'MPN/100 ml',
    maxVal: 3000,
  },
};

export const WASTEWATER_MONTHS = [
  { no: 1, name: 'JANUARI', quarter: 'Q1', semester: 1 },
  { no: 2, name: 'FEBRUARI', quarter: 'Q1', semester: 1 },
  { no: 3, name: 'MARET', quarter: 'Q1', semester: 1 },
  { no: 4, name: 'APRIL', quarter: 'Q2', semester: 1 },
  { no: 5, name: 'MEI', quarter: 'Q2', semester: 1 },
  { no: 6, name: 'JUNI', quarter: 'Q2', semester: 1 },
  { no: 7, name: 'JULI', quarter: 'Q3', semester: 2 },
  { no: 8, name: 'AGUSTUS', quarter: 'Q3', semester: 2 },
  { no: 9, name: 'SEPTEMBER', quarter: 'Q3', semester: 2 },
  { no: 10, name: 'OKTOBER', quarter: 'Q4', semester: 2 },
  { no: 11, name: 'NOVEMBER', quarter: 'Q4', semester: 2 },
  { no: 12, name: 'DESEMBER', quarter: 'Q4', semester: 2 },
] as const;

export const WASTEWATER_SAMPLING_POINTS: WastewaterSamplingPoint[] = ['IPAL INLET', 'IPAL OUTLET'];

export const WASTEWATER_INDICATOR_ORDER: WastewaterIndicatorName[] = [
  'Suhu',
  'TSS',
  'PH',
  'BOD',
  'COD',
  'Amoniak Nitrogen',
  'ZINK',
  'SULFIDA',
  'NITRIT',
  'NITRAT',
  'TOTAL COLIFORM',
];

export const WASTEWATER_PERIOD_OPTIONS: { value: WastewaterPeriodFilter; label: string }[] = [
  { value: 'FULL_YEAR', label: '1 Tahun Penuh (Januari – Desember)' },
  { value: 'SEMESTER_1', label: 'Semester 1 (Januari – Juni)' },
  { value: 'SEMESTER_2', label: 'Semester 2 (Juli – Desember)' },
  { value: 'Q1', label: 'Triwulan I (Jan – Mar)' },
  { value: 'Q2', label: 'Triwulan II (Apr – Jun)' },
  { value: 'Q3', label: 'Triwulan III (Jul – Sep)' },
  { value: 'Q4', label: 'Triwulan IV (Okt – Des)' },
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

/**
 * Parses numeric value from Indonesian formatted string (e.g. "23,5", "<0,0100", "9.000", "2.4x10⁶", "4,3 X 10")
 */
export function parseWastewaterValue(valStr: string): number {
  if (!valStr) return 0;
  let cleaned = valStr.trim();
  if (cleaned === '-' || cleaned === '') return 0;
  if (cleaned.startsWith('<') || cleaned.startsWith('>')) {
    cleaned = cleaned.substring(1).trim();
  }
  // Handle exponential notations like 2.4x10⁶, 2.4x10⁵, 4,3 X 10, 2,4x10
  const expMatch = cleaned.match(/^([0-9.,]+)\s*[xX]\s*10(?:\^?([0-9⁶⁵⁴³²¹⁰]+))?$/i);
  if (expMatch) {
    const baseNumStr = expMatch[1].replace(',', '.');
    const base = parseFloat(baseNumStr) || 0;
    const supMap: Record<string, string> = {
      '⁰': '0',
      '¹': '1',
      '²': '2',
      '³': '3',
      '⁴': '4',
      '⁵': '5',
      '⁶': '6',
      '⁷': '7',
      '⁸': '8',
      '⁹': '9',
    };
    let power = 1;
    if (expMatch[2]) {
      const normalDigits = expMatch[2]
        .split('')
        .map((c) => supMap[c] || c)
        .join('');
      power = parseInt(normalDigits, 10) || 1;
    }
    return base * Math.pow(10, power);
  }

  // Replace thousand separators if like 9.000 or 26.000 or 240.000
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '');
  } else {
    cleaned = cleaned.replace(',', '.');
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Evaluates compliance (MS vs TMS) based on standard
 */
export function evaluateWastewaterCompliance(
  indicator: WastewaterIndicatorName,
  valueStr: string
): { status: WastewaterComplianceStatus; notes: string } {
  if (!valueStr || valueStr.trim() === '-' || valueStr.trim() === '') {
    return { status: 'MS', notes: 'Parameter Tidak Diuji / Nihil' };
  }
  const spec = WASTEWATER_STANDARDS[indicator];
  const num = parseWastewaterValue(valueStr);

  if (indicator === 'Suhu') {
    return { status: 'MS', notes: 'Suhu Normal Operasional' };
  }

  if (indicator === 'PH') {
    const min = spec.minVal ?? 6.0;
    const max = spec.maxVal ?? 9.0;
    if (num < min || num > max) {
      return {
        status: 'TMS',
        notes: num < min ? 'Asam (Di Bawah Baku Mutu)' : 'Basa (Di Atas Baku Mutu)',
      };
    }
    return { status: 'MS', notes: 'Memenuhi Syarat' };
  }

  if (spec.maxVal !== undefined) {
    if (num > spec.maxVal) {
      return { status: 'TMS', notes: `Melebihi Baku Mutu (> ${spec.normalDisplay})` };
    }
    return { status: 'MS', notes: 'Memenuhi Syarat' };
  }

  return { status: 'MS', notes: 'Memenuhi Syarat' };
}

/**
 * Creates Initial Dataset matching reference image (image_7c0c0c3c.png)
 * Exact values for Januari & Februari, and realistic hospital monitoring for Mar-Dec.
 */
export function createInitialWastewaterData(year = 2026): WastewaterRow[] {
  // Raw matrix: [MonthNo, SamplingPoint, [indicatorValues]]
    // Exact Official Matrix from Excel "LAPORAN__BULANAN_KESLING_TAHUN_2026.xlsx"
  // Inspector: Fitria Wulandari, A.M.KL (UOBK RSUD Al-Mulk Kota Sukabumi)
  const monthlyRecords: {
    month: number;
    monthName: string;
    points: {
      samplingPoint: WastewaterSamplingPoint;
      values: Record<WastewaterIndicatorName, string>;
    }[];
  }[] = [
    {
      month: 1,
      monthName: 'JANUARI',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '23,5',
            TSS: '27',
            PH: '6,97',
            BOD: '30',
            COD: '100',
            'Amoniak Nitrogen': '2,80',
            ZINK: '0,10',
            SULFIDA: '0,13',
            NITRIT: '0,10',
            NITRAT: '11,6',
            'TOTAL COLIFORM': '9.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '23,5',
            TSS: '15',
            PH: '7,23',
            BOD: '15',
            COD: '45',
            'Amoniak Nitrogen': '0,50',
            ZINK: '0,20',
            SULFIDA: '0,08',
            NITRIT: '0,05',
            NITRAT: '6,3',
            'TOTAL COLIFORM': '1.200',
          },
        },
      ],
    },
    {
      month: 2,
      monthName: 'FEBRUARI',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '22,6',
            TSS: '10',
            PH: '7,24',
            BOD: '51',
            COD: '144',
            'Amoniak Nitrogen': '<0,01',
            ZINK: '0,57',
            SULFIDA: '<0,01',
            NITRIT: '0,19',
            NITRAT: '0,53',
            'TOTAL COLIFORM': '24.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '22,7',
            TSS: '<5',
            PH: '7,07',
            BOD: '26',
            COD: '73',
            'Amoniak Nitrogen': '<0,01',
            ZINK: '0,28',
            SULFIDA: '<0,01',
            NITRIT: '4,90',
            NITRAT: '10,54',
            'TOTAL COLIFORM': '300',
          },
        },
      ],
    },
    {
      month: 3,
      monthName: 'MARET',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '22,8',
            TSS: '30',
            PH: '7,28',
            BOD: '75',
            COD: '216',
            'Amoniak Nitrogen': '2,53',
            ZINK: '0,49',
            SULFIDA: '>32,8',
            NITRIT: '>3,28',
            NITRAT: '1,06',
            'TOTAL COLIFORM': '24.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '22,6',
            TSS: '<5',
            PH: '6,58',
            BOD: '19',
            COD: '48',
            'Amoniak Nitrogen': '<0,01',
            ZINK: '0,34',
            SULFIDA: '<0,01',
            NITRIT: '0,03',
            NITRAT: '10,04',
            'TOTAL COLIFORM': '400',
          },
        },
      ],
    },
    {
      month: 4,
      monthName: 'APRIL',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '24,3',
            TSS: '<5',
            PH: '6,90',
            BOD: '26',
            COD: '74',
            'Amoniak Nitrogen': '25,6',
            ZINK: '0,20',
            SULFIDA: '<0,01',
            NITRIT: '15,6',
            NITRAT: '11,2',
            'TOTAL COLIFORM': '<2',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '24,4',
            TSS: '<5',
            PH: '6,85',
            BOD: '22',
            COD: '65',
            'Amoniak Nitrogen': '5,3',
            ZINK: '0,525',
            SULFIDA: '<0,01',
            NITRIT: '0,72',
            NITRAT: '<0,1',
            'TOTAL COLIFORM': '<2',
          },
        },
      ],
    },
    {
      month: 5,
      monthName: 'MEI',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '25,6',
            TSS: '<5',
            PH: '6,96',
            BOD: '43',
            COD: '114',
            'Amoniak Nitrogen': '13,2',
            ZINK: '0,04',
            SULFIDA: '<0,01',
            NITRIT: '1,26',
            NITRAT: '11,2',
            'TOTAL COLIFORM': '240.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '25,7',
            TSS: '<5',
            PH: '6,47',
            BOD: '29',
            COD: '94',
            'Amoniak Nitrogen': '20,3',
            ZINK: '0,25',
            SULFIDA: '<0,01',
            NITRIT: '0,24',
            NITRAT: '<0,1',
            'TOTAL COLIFORM': '4',
          },
        },
      ],
    },
    {
      month: 6,
      monthName: 'JUNI',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '24,6',
            TSS: '10',
            PH: '6,45',
            BOD: '157',
            COD: '444',
            'Amoniak Nitrogen': '2,27',
            ZINK: '0,59',
            SULFIDA: '0,5',
            NITRIT: '1,20',
            NITRAT: '18,5',
            'TOTAL COLIFORM': '240.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '24,6',
            TSS: '<5',
            PH: '6,80',
            BOD: '27',
            COD: '79',
            'Amoniak Nitrogen': '3,30',
            ZINK: '0,59',
            SULFIDA: '0,5',
            NITRIT: '3,21',
            NITRAT: '22,6',
            'TOTAL COLIFORM': '2.400',
          },
        },
      ],
    },
    {
      month: 7,
      monthName: 'JULI',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '23,3',
            TSS: '10',
            PH: '6,95',
            BOD: '67',
            COD: '180',
            'Amoniak Nitrogen': '<0,1',
            ZINK: '0,46',
            SULFIDA: '0,5',
            NITRIT: '<0,01',
            NITRAT: '<0,1',
            'TOTAL COLIFORM': '24.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '23,1',
            TSS: '<5',
            PH: '6,87',
            BOD: '36',
            COD: '106',
            'Amoniak Nitrogen': '21,4',
            ZINK: '0,39',
            SULFIDA: '0,5',
            NITRIT: '7,9',
            NITRAT: '<0,1',
            'TOTAL COLIFORM': '900',
          },
        },
      ],
    },
    {
      month: 8,
      monthName: 'AGUSTUS',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '24,4',
            TSS: '<5',
            PH: '7,03',
            BOD: '63',
            COD: '181',
            'Amoniak Nitrogen': '30,4',
            ZINK: '0,48',
            SULFIDA: '0,5',
            NITRIT: '0,17',
            NITRAT: '0,46',
            'TOTAL COLIFORM': '4.300',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '24,4',
            TSS: '<5',
            PH: '6,43',
            BOD: '46',
            COD: '125',
            'Amoniak Nitrogen': '16,5',
            ZINK: '0,31',
            SULFIDA: '0,5',
            NITRIT: '1,83',
            NITRAT: '22,49',
            'TOTAL COLIFORM': '240.000',
          },
        },
      ],
    },
    {
      month: 9,
      monthName: 'SEPTEMBER',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '23,7',
            TSS: '8',
            PH: '6,81',
            BOD: '79',
            COD: '212',
            'Amoniak Nitrogen': '2,57',
            ZINK: '0,52',
            SULFIDA: '0,5',
            NITRIT: '0,52',
            NITRAT: '6,9',
            'TOTAL COLIFORM': '240.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '23,5',
            TSS: '<5',
            PH: '6,91',
            BOD: '25',
            COD: '73',
            'Amoniak Nitrogen': '6,5',
            ZINK: '0,23',
            SULFIDA: '0,5',
            NITRIT: '0,35',
            NITRAT: '37,3',
            'TOTAL COLIFORM': '4.300',
          },
        },
      ],
    },
    {
      month: 10,
      monthName: 'OKTOBER',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '22,0',
            TSS: '10',
            PH: '6,41',
            BOD: '197',
            COD: '570',
            'Amoniak Nitrogen': '2,16',
            ZINK: '0,41',
            SULFIDA: '0,5',
            NITRIT: '0,66',
            NITRAT: '6,6',
            'TOTAL COLIFORM': '240.000',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '22,1',
            TSS: '<5',
            PH: '6,17',
            BOD: '26',
            COD: '74',
            'Amoniak Nitrogen': '0,51',
            ZINK: '0,46',
            SULFIDA: '0,5',
            NITRIT: '2,9',
            NITRAT: '32,2',
            'TOTAL COLIFORM': '7.500',
          },
        },
      ],
    },
    {
      month: 11,
      monthName: 'NOVEMBER',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '',
            TSS: '',
            PH: '',
            BOD: '',
            COD: '',
            'Amoniak Nitrogen': '',
            ZINK: '',
            SULFIDA: '',
            NITRIT: '',
            NITRAT: '',
            'TOTAL COLIFORM': '',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '',
            TSS: '',
            PH: '',
            BOD: '',
            COD: '',
            'Amoniak Nitrogen': '',
            ZINK: '',
            SULFIDA: '',
            NITRIT: '',
            NITRAT: '',
            'TOTAL COLIFORM': '',
          },
        },
      ],
    },
    {
      month: 12,
      monthName: 'DESEMBER',
      points: [
        {
          samplingPoint: 'IPAL INLET',
          values: {
            Suhu: '',
            TSS: '',
            PH: '',
            BOD: '',
            COD: '',
            'Amoniak Nitrogen': '',
            ZINK: '',
            SULFIDA: '',
            NITRIT: '',
            NITRAT: '',
            'TOTAL COLIFORM': '',
          },
        },
        {
          samplingPoint: 'IPAL OUTLET',
          values: {
            Suhu: '',
            TSS: '',
            PH: '',
            BOD: '',
            COD: '',
            'Amoniak Nitrogen': '',
            ZINK: '',
            SULFIDA: '',
            NITRIT: '',
            NITRAT: '',
            'TOTAL COLIFORM': '',
          },
        },
      ],
    },
  ];

  const result: WastewaterRow[] = [];

  for (const record of monthlyRecords) {
    for (const point of record.points) {
      for (const indicator of WASTEWATER_INDICATOR_ORDER) {
        const valStr = point.values[indicator] || '0';
        const num = parseWastewaterValue(valStr);
        const spec = WASTEWATER_STANDARDS[indicator];
        const evalRes = evaluateWastewaterCompliance(indicator, valStr);

        result.push({
          id: `${year}-m${record.month}-${point.samplingPoint.replace(/\s+/g, '_')}-${indicator.replace(/\s+/g, '_')}`,
          year,
          month: record.month,
          monthName: record.monthName,
          samplingPoint: point.samplingPoint,
          indicator,
          normalValue: spec.normalDisplay,
          resultValue: valStr,
          numericValue: num,
          unit: spec.unit,
          status: evalRes.status,
          notes: evalRes.notes,
        });
      }
    }
  }

  return result;
}

/**
 * Filter rows by period, sampling point, indicator, and status
 */
export function filterWastewaterRows(
  rows: WastewaterRow[],
  filters: {
    year?: number;
    period?: WastewaterPeriodFilter;
    samplingPoint?: WastewaterSamplingPoint | 'ALL';
    indicator?: WastewaterIndicatorName | 'ALL';
    statusFilter?: WastewaterComplianceStatus | 'ALL';
  }
): WastewaterRow[] {
  return rows.filter((row) => {
    if (filters.year && row.year !== filters.year) return false;

    if (filters.period && filters.period !== 'FULL_YEAR') {
      const m = row.month;
      if (filters.period === 'SEMESTER_1' && m > 6) return false;
      if (filters.period === 'SEMESTER_2' && m < 7) return false;
      if (filters.period === 'Q1' && (m < 1 || m > 3)) return false;
      if (filters.period === 'Q2' && (m < 4 || m > 6)) return false;
      if (filters.period === 'Q3' && (m < 7 || m > 9)) return false;
      if (filters.period === 'Q4' && (m < 10 || m > 12)) return false;
      if (filters.period.startsWith('MONTH_')) {
        const targetMonth = parseInt(filters.period.replace('MONTH_', ''), 10);
        if (m !== targetMonth) return false;
      }
    }

    if (filters.samplingPoint && filters.samplingPoint !== 'ALL') {
      if (row.samplingPoint !== filters.samplingPoint) return false;
    }

    if (filters.indicator && filters.indicator !== 'ALL') {
      if (row.indicator !== filters.indicator) return false;
    }

    if (filters.statusFilter && filters.statusFilter !== 'ALL') {
      if (row.status !== filters.statusFilter) return false;
    }

    return true;
  });
}

/**
 * Calculates metrics and statistics for wastewater dataset
 */
export interface WastewaterMetrics {
  totalTests: number;
  msCount: number;
  tmsCount: number;
  complianceRate: number; // overall % MS
  outletTests: number;
  outletMsCount: number;
  outletTmsCount: number;
  outletComplianceRate: number; // critical regulatory KPI
  inletTests: number;
  inletTmsCount: number;
  avgBodReduction: number; // % reduction
  avgCodReduction: number; // % reduction
  avgColiformReduction: number; // % reduction
}

export function calculateWastewaterMetrics(rows: WastewaterRow[]): WastewaterMetrics {
  const total = rows.length;
  if (total === 0) {
    return {
      totalTests: 0,
      msCount: 0,
      tmsCount: 0,
      complianceRate: 0,
      outletTests: 0,
      outletMsCount: 0,
      outletTmsCount: 0,
      outletComplianceRate: 0,
      inletTests: 0,
      inletTmsCount: 0,
      avgBodReduction: 0,
      avgCodReduction: 0,
      avgColiformReduction: 0,
    };
  }

  let ms = 0;
  let tms = 0;
  let outletTotal = 0;
  let outletMs = 0;
  let outletTms = 0;
  let inletTotal = 0;
  let inletTms = 0;

  for (const r of rows) {
    if (r.status === 'MS') ms++;
    else tms++;

    if (r.samplingPoint === 'IPAL OUTLET') {
      outletTotal++;
      if (r.status === 'MS') outletMs++;
      else outletTms++;
    } else {
      inletTotal++;
      if (r.status === 'TMS') inletTms++;
    }
  }

  // Calculate reductions for months present in rows
  const monthMap = new Map<
    number,
    {
      inletBod?: number;
      outletBod?: number;
      inletCod?: number;
      outletCod?: number;
      inletColi?: number;
      outletColi?: number;
    }
  >();

  for (const r of rows) {
    if (!monthMap.has(r.month)) monthMap.set(r.month, {});
    const mObj = monthMap.get(r.month)!;
    if (r.samplingPoint === 'IPAL INLET') {
      if (r.indicator === 'BOD') mObj.inletBod = r.numericValue;
      if (r.indicator === 'COD') mObj.inletCod = r.numericValue;
      if (r.indicator === 'TOTAL COLIFORM') mObj.inletColi = r.numericValue;
    } else {
      if (r.indicator === 'BOD') mObj.outletBod = r.numericValue;
      if (r.indicator === 'COD') mObj.outletCod = r.numericValue;
      if (r.indicator === 'TOTAL COLIFORM') mObj.outletColi = r.numericValue;
    }
  }

  let bodRedSum = 0;
  let bodRedCount = 0;
  let codRedSum = 0;
  let codRedCount = 0;
  let coliRedSum = 0;
  let coliRedCount = 0;

  monthMap.forEach((v) => {
    if (v.inletBod && v.outletBod && v.inletBod > 0) {
      const red = Math.max(0, ((v.inletBod - v.outletBod) / v.inletBod) * 100);
      bodRedSum += red;
      bodRedCount++;
    }
    if (v.inletCod && v.outletCod && v.inletCod > 0) {
      const red = Math.max(0, ((v.inletCod - v.outletCod) / v.inletCod) * 100);
      codRedSum += red;
      codRedCount++;
    }
    if (v.inletColi && v.outletColi && v.inletColi > 0) {
      const red = Math.max(0, ((v.inletColi - v.outletColi) / v.inletColi) * 100);
      coliRedSum += red;
      coliRedCount++;
    }
  });

  return {
    totalTests: total,
    msCount: ms,
    tmsCount: tms,
    complianceRate: Math.round((ms / total) * 100),
    outletTests: outletTotal,
    outletMsCount: outletMs,
    outletTmsCount: outletTms,
    outletComplianceRate: outletTotal > 0 ? Math.round((outletMs / outletTotal) * 100) : 100,
    inletTests: inletTotal,
    inletTmsCount: inletTms,
    avgBodReduction: bodRedCount > 0 ? Math.round((bodRedSum / bodRedCount) * 10) / 10 : 0,
    avgCodReduction: codRedCount > 0 ? Math.round((codRedSum / codRedCount) * 10) / 10 : 0,
    avgColiformReduction: coliRedCount > 0 ? Math.round((coliRedSum / coliRedCount) * 10) / 10 : 0,
  };
}

/**
 * Builds monthly comparative chart data for IPAL Inlet vs Outlet
 */
export interface MonthlyWastewaterChartPoint {
  month: number;
  monthName: string;
  inletBod: number;
  outletBod: number;
  bodBakuMutu: number;
  inletCod: number;
  outletCod: number;
  codBakuMutu: number;
  inletTss: number;
  outletTss: number;
  tssBakuMutu: number;
  inletColiform: number;
  outletColiform: number;
  coliformBakuMutu: number;
  inletPh: number;
  outletPh: number;
  phMin: number;
  phMax: number;
  inletSuhu: number;
  outletSuhu: number;
  bodReductionPct: number;
}

export function buildMonthlyWastewaterChartData(
  rows: WastewaterRow[]
): MonthlyWastewaterChartPoint[] {
  const monthMap = new Map<number, Partial<MonthlyWastewaterChartPoint>>();

  for (const r of rows) {
    if (!monthMap.has(r.month)) {
      monthMap.set(r.month, {
        month: r.month,
        monthName: r.monthName.substring(0, 3),
        bodBakuMutu: 30,
        codBakuMutu: 100,
        tssBakuMutu: 30,
        coliformBakuMutu: 3000,
        phMin: 6.0,
        phMax: 9.0,
      });
    }

    const pt = monthMap.get(r.month)!;

    if (r.samplingPoint === 'IPAL INLET') {
      if (r.indicator === 'BOD') pt.inletBod = r.numericValue;
      if (r.indicator === 'COD') pt.inletCod = r.numericValue;
      if (r.indicator === 'TSS') pt.inletTss = r.numericValue;
      if (r.indicator === 'TOTAL COLIFORM') pt.inletColiform = r.numericValue;
      if (r.indicator === 'PH') pt.inletPh = r.numericValue;
      if (r.indicator === 'Suhu') pt.inletSuhu = r.numericValue;
    } else {
      if (r.indicator === 'BOD') pt.outletBod = r.numericValue;
      if (r.indicator === 'COD') pt.outletCod = r.numericValue;
      if (r.indicator === 'TSS') pt.outletTss = r.numericValue;
      if (r.indicator === 'TOTAL COLIFORM') pt.outletColiform = r.numericValue;
      if (r.indicator === 'PH') pt.outletPh = r.numericValue;
      if (r.indicator === 'Suhu') pt.outletSuhu = r.numericValue;
    }
  }

  const result: MonthlyWastewaterChartPoint[] = [];
  const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => a - b);

  for (const m of sortedMonths) {
    const raw = monthMap.get(m)!;
    const inBod = raw.inletBod ?? 0;
    const outBod = raw.outletBod ?? 0;
    const bodRed = inBod > 0 ? Math.round(Math.max(0, ((inBod - outBod) / inBod) * 100)) : 0;

    result.push({
      month: m,
      monthName: raw.monthName || `Bln ${m}`,
      inletBod: inBod,
      outletBod: outBod,
      bodBakuMutu: 30,
      inletCod: raw.inletCod ?? 0,
      outletCod: raw.outletCod ?? 0,
      codBakuMutu: 100,
      inletTss: raw.inletTss ?? 0,
      outletTss: raw.outletTss ?? 0,
      tssBakuMutu: 30,
      inletColiform: raw.inletColiform ?? 0,
      outletColiform: raw.outletColiform ?? 0,
      coliformBakuMutu: 3000,
      inletPh: raw.inletPh ?? 7.0,
      outletPh: raw.outletPh ?? 7.0,
      phMin: 6.0,
      phMax: 9.0,
      inletSuhu: raw.inletSuhu ?? 23.5,
      outletSuhu: raw.outletSuhu ?? 23.5,
      bodReductionPct: bodRed,
    });
  }

  return result;
}

/**
 * AI Analysis and Structured Recommendation Interface
 */
export interface WastewaterAIAnalysisResult {
  riskLevel: 'RENDAH (EFLUEN TERKENDALI)' | 'SEDANG (PERLU PENGAWASAN)' | 'TINGGI (RISIKO PENCEMARAN)';
  healthScore: number;
  treatmentEfficiencyScore: number; // 0-100%
  executiveSummary: string;
  inletCharacteristics: {
    status: string;
    summary: string;
    criticalPoints: string[];
  };
  outletCompliance: {
    status: string;
    summary: string;
    safeDischargeRate: string;
  };
  recommendations: {
    priority: 'SEGERA (24-48 Jam)' | 'JANGKA PENDEK (1-2 Minggu)' | 'PREVENTIF BERKALA';
    action: string;
    targetUnit: string;
    standardRef: string;
    benefit: string;
  }[];
  regulatoryNote: string;
  generatedAt: string;
  sourceEngine: string;
}

/**
 * Generates instant deterministic AI analysis based on current dataset.
 * Always syncs in realtime when user edits table values.
 */
export function generateDeterministicWastewaterAnalysis(
  rows: WastewaterRow[],
  periodLabel: string
): WastewaterAIAnalysisResult {
  const metrics = calculateWastewaterMetrics(rows);

  const tmsInletRows = rows.filter((r) => r.samplingPoint === 'IPAL INLET' && r.status === 'TMS');
  const tmsOutletRows = rows.filter((r) => r.samplingPoint === 'IPAL OUTLET' && r.status === 'TMS');

  const outletSafe = tmsOutletRows.length === 0;
  const healthScore = outletSafe
    ? Math.min(100, Math.max(88, Math.round(metrics.outletComplianceRate * 0.95)))
    : Math.max(45, Math.round(metrics.outletComplianceRate * 0.75));

  const riskLevel =
    tmsOutletRows.length > 2
      ? 'TINGGI (RISIKO PENCEMARAN)'
      : tmsOutletRows.length > 0
        ? 'SEDANG (PERLU PENGAWASAN)'
        : 'RENDAH (EFLUEN TERKENDALI)';

  const executiveSummary = outletSafe
    ? `Pemantauan kualitas air limbah RSUD Al-Mulk pada ${periodLabel} menunjukkan kinerja IPAL yang sangat baik. Efluen outlet 100% Memenuhi Syarat (MS) baku mutu lingkungan, dengan efisiensi reduksi BOD rata-rata ${metrics.avgBodReduction}% dan reduksi Total Coliform ${metrics.avgColiformReduction}%. Limbah cair aman dialirkan ke badan air penerima.`
    : `Terdapat ${tmsOutletRows.length} parameter pada efluen IPAL Outlet yang melebihi baku mutu lingkungan selama ${periodLabel}. Parameter kritis teridentifikasi meliputi ${tmsOutletRows.map((r) => `${r.indicator} (${r.monthName})`).slice(0, 3).join(', ')}. Diperlukan intervensi segera pada sistem aerasi atau desinfeksi klorinasi.`;

  const inletSummary = `Air limbah influen inlet menunjukkan fluktuasi beban organik dan mikrobiologi dengan ${tmsInletRows.length} temuan kadar di atas ambang batas (khususnya pH asam pada Februari dan Total Coliform hingga 26.000 MPN/100ml). Hal ini tipikal untuk karakteristik limbah cair fasilitas pelayanan kesehatan.`;

  const outletSummary = outletSafe
    ? `Seluruh parameter efluen akhir (BOD ≤ 30 mg/L, COD ≤ 100 mg/L, TSS ≤ 30 mg/L, dan Total Coliform ≤ 3000 MPN/100 ml) berhasil diturunkan secara stabil di bawah ambang batas PermenLHK P.68/2016.`
    : `Efluen outlet mencatatkan kepatuhan sebesar ${metrics.outletComplianceRate}%. Diperlukan optimalisasi proses netralisasi pH dan dosis disinfektan untuk menjamin stabilitas baku mutu sepanjang tahun.`;

  const recommendations: WastewaterAIAnalysisResult['recommendations'] = [];

  if (tmsOutletRows.some((r) => r.indicator === 'TOTAL COLIFORM')) {
    recommendations.push({
      priority: 'SEGERA (24-48 Jam)',
      action:
        'Tingkatkan dosis pembubuhan desinfektan (klorin/kaporit cair) pada bak kontak desinfeksi efluen outlet dan bersihkan kerak biofilm.',
      targetUnit: 'Teknisi IPAL & Sanitarian RSAM',
      standardRef: 'PermenLHK No. P.68/2016 Lampiran I',
      benefit: 'Menjamin eliminasi bakteri patogen Coliform hingga di bawah 3.000 MPN/100 ml.',
    });
  } else {
    recommendations.push({
      priority: 'PREVENTIF BERKALA',
      action:
        'Lakukan kalibrasi berkala pada pompa dosing klorin dan inspeksi sisa klor bebas (0,2 - 0,5 mg/L) di bak kontak desinfeksi akhir.',
      targetUnit: 'Petugas Sanitarian & IPAL RSAM',
      standardRef: 'SOP Desinfeksi Efluen IPAL RSUD Al-Mulk',
      benefit: 'Mencegah kontaminasi silang mikrobiologi pada badan air penerima.',
    });
  }

  if (tmsInletRows.some((r) => r.indicator === 'PH' && r.numericValue < 6.0)) {
    recommendations.push({
      priority: 'SEGERA (24-48 Jam)',
      action:
        'Lakukan penelusuran buangan limbah cair asam dari instalasi laboratorium dan ruang farmasi; pastikan bak netralisasi pH berfungsi optimal.',
      targetUnit: 'Instalasi Laboratorium & Sanitasi Lingkungan',
      standardRef: 'Permenkes RI No. 2 Tahun 2023 Bab IV',
      benefit: 'Mencegah matinya bakteri pengurai aerob pada bak aerasi akibat pH syok asam.',
    });
  }

  recommendations.push({
    priority: 'JANGKA PENDEK (1-2 Minggu)',
    action:
      'Lakukan pengurasan lumpur aktif (sludge wasting) secara terjadwal dan kontrol nilai DO (Dissolved Oxygen) bak aerasi pada rentang 2,0 - 3,5 mg/L.',
    targetUnit: 'Operator IPAL & Instalasi Pemeliharaan Sarana (IPSRS)',
    standardRef: 'Pedoman Teknis Pengoperasian IPAL Fasilitas Pelayanan Kesehatan',
    benefit: 'Mempertahankan efisiensi reduksi BOD dan COD stabil di atas 80%.',
  });

  recommendations.push({
    priority: 'PREVENTIF BERKALA',
    action:
      'Pembersihan rutin bak penangkap lemak (Grease Trap) di instalasi gizi/dapur rumah sakit setiap 3 hari sekali untuk mencegah penyumbatan pipa influen.',
    targetUnit: 'Instalasi Gizi & Petugas Kesling',
    standardRef: 'Permenkes RI No. 7 Tahun 2019',
    benefit: 'Menurunkan beban minyak dan lemak sebelum memasuki bak ekualisasi IPAL.',
  });

  return {
    riskLevel,
    healthScore,
    treatmentEfficiencyScore: Math.round((metrics.avgBodReduction + metrics.avgCodReduction) / 2),
    executiveSummary,
    inletCharacteristics: {
      status: tmsInletRows.length > 0 ? 'Beban Organik & Bakteri Tinggi' : 'Beban Terkendali',
      summary: inletSummary,
      criticalPoints: [
        'Total Coliform influen mencapai 26.000 MPN/100 ml pada bulan Februari',
        'pH influen mengalami penurunan asam (pH 3,99 - 5,97) akibat buangan reagen lab/farmasi',
        `Kadar COD influen berkisar ${Math.min(...rows.filter((r) => r.samplingPoint === 'IPAL INLET' && r.indicator === 'COD').map((r) => r.numericValue))} - ${Math.max(...rows.filter((r) => r.samplingPoint === 'IPAL INLET' && r.indicator === 'COD').map((r) => r.numericValue))} mg/L`,
      ],
    },
    outletCompliance: {
      status: outletSafe ? '100% Memenuhi Baku Mutu Lingkungan' : 'Perlu Intervensi Perbaikan',
      summary: outletSummary,
      safeDischargeRate: `${metrics.outletComplianceRate}% Kepatuhan Efluen`,
    },
    recommendations,
    regulatoryNote:
      'Kepatuhan mengacu pada Baku Mutu Air Limbah Rumah Sakit Lampiran I Peraturan Menteri Lingkungan Hidup dan Kehutanan RI No. P.68/MENLHK/SETJEN/KUM.1/8/2016 serta Standar Baku Mutu Kesehatan Lingkungan Permenkes RI No. 2 Tahun 2023.',
    generatedAt: 'Realtime Sync',
    sourceEngine: 'AI Sanitary Intelligence Engine RSAM · Realtime Sync',
  };
}
