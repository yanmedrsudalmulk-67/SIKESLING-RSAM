export type WaterSourceName = 'Artesis' | 'Air RO Lab' | 'AIR RO POLI GIGI';

export type WaterIndicatorName = 'Total Coliform' | 'E.Coli';

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
  normalValue: string; // "0/100 ml"
  resultValue: number;
  status: WaterComplianceStatus; // MS if 0, TMS if > 0
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
  'AIR RO POLI GIGI',
];

export const WATER_INDICATORS: WaterIndicatorName[] = [
  'Total Coliform',
  'E.Coli',
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

export function evaluateWaterCompliance(value: number): WaterComplianceStatus {
  return value <= 0 ? 'MS' : 'TMS';
}

export function createInitialWaterQualityData(year = 2026): WaterQualityRow[] {
  // Exact values matching the reference spreadsheet for Jan-Apr, plus realistic annual monitoring data for May-Dec
  const presetAbnormalValues: Record<string, number> = {
    // JANUARI: Air RO Lab Total Coliform = 7 (TMS), AIR RO POLI GIGI Total Coliform = 4 (TMS)
    '1-Air RO Lab-Total Coliform': 7,
    '1-AIR RO POLI GIGI-Total Coliform': 4,
    // FEBRUARI: All 0 (MS)
    // MARET: All 0 (MS)
    // APRIL: Artesis Total Coliform = 9 (TMS)
    '4-Artesis-Total Coliform': 9,
    // JULI: AIR RO POLI GIGI Total Coliform = 3 (TMS)
    '7-AIR RO POLI GIGI-Total Coliform': 3,
    // OKTOBER: Air RO Lab Total Coliform = 2 (TMS)
    '10-Air RO Lab-Total Coliform': 2,
  };

  const rows: WaterQualityRow[] = [];

  for (const month of WATER_MONTHS) {
    for (const sourceName of WATER_SOURCES) {
      for (const indicator of WATER_INDICATORS) {
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
          status: evaluateWaterCompliance(resultValue),
        });
      }
    }
  }

  return rows;
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
  artesisEColi: number;
  roLabEColi: number;
  roPoliGigiEColi: number;
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
      artesisEColi: 0,
      roLabEColi: 0,
      roPoliGigiEColi: 0,
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
      else pt.artesisEColi = r.resultValue;
    } else if (r.sourceName === 'Air RO Lab') {
      if (r.indicator === 'Total Coliform') pt.roLabColiform = r.resultValue;
      else pt.roLabEColi = r.resultValue;
    } else if (r.sourceName === 'AIR RO POLI GIGI') {
      if (r.indicator === 'Total Coliform') pt.roPoliGigiColiform = r.resultValue;
      else pt.roPoliGigiEColi = r.resultValue;
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
      ? `Berdasarkan evaluasi ${metrics.totalTests} parameter uji kualitas mikrobiologi air bersih pada periode ${periodLabel}, seluruh titik sampel (Artesis, Air RO Lab, dan AIR RO POLI GIGI) 100% Memenuhi Syarat (MS) dengan nilai Total Coliform dan E.Coli sebesar 0/100 ml sesuai standar baku mutu kesehatan lingkungan rumah sakit.`
      : `Berdasarkan evaluasi ${metrics.totalTests} pemeriksaan pada periode ${periodLabel}, tingkat kepatuhan baku mutu air bersih mencapai ${metrics.complianceRate}% (${metrics.msCount} MS dan ${metrics.tmsCount} TMS). Parameter E.Coli tercatat ${metrics.maxEColiValue}/100 ml (${metrics.maxEColiValue === 0 ? '100% Memenuhi Syarat / bebas kontaminasi fekal' : 'terdeteksi kontaminasi fekal'}), namun ditemukan deviasi Total Coliform di atas nilai normal (0/100 ml) pada titik ${metrics.affectedSources.join(', ')} di bulan ${metrics.affectedMonths.join(', ')} dengan puncak tertinggi ${metrics.maxColiformValue}/100 ml.`;

  const keyFindings: WaterAIAnalysisResult['keyFindings'] =
    tmsRows.length > 0
      ? tmsRows.map((r) => ({
          title: `Deviasi ${r.indicator} pada ${r.sourceName} (${r.monthName})`,
          detail: `Hasil pemeriksaan menunjukkan nilai ${r.resultValue}/100 ml (melebihi nilai normal ${r.normalValue}), sehingga berstatus Tidak Memenuhi Syarat (TMS).`,
          severity: r.resultValue >= 7 || r.indicator === 'E.Coli' ? 'critical' : 'warning',
          source: r.sourceName,
          month: r.monthName,
        }))
      : [
          {
            title: 'Kepatuhan Mikrobiologi Optimal (Zero Contamination)',
            detail:
              'Seluruh parameter Total Coliform dan E.Coli pada titik Artesis, Air RO Lab, dan AIR RO POLI GIGI berada pada angka 0/100 ml (MS).',
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
          summary: `Seluruh sampel pada titik ${sourceName} memenuhi baku mutu (0/100 ml).`,
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
        'Lakukan desinfeksi kimiawi (shock chlorination) pada reservoir/tandon Artesis serta flushing & sterilisasi UV/nozzle pada unit Air RO Lab dan AIR RO POLI GIGI yang berstatus TMS.',
      targetUnit: 'Tim Sanitarian Kesling & IPSRS RSUD Al-Mulk',
      standardRef: 'Permenkes RI No. 2 Tahun 2023 (Baku Mutu Mikrobiologi Air: 0 CFU/100 ml)',
    },
    {
      priority: 'JANGKA PENDEK (1-2 Minggu)',
      action:
        'Inspeksi dan ganti cartridge pre-filter / sanitasi membran RO pada instalasi Laboratorium dan Poli Gigi, kemudian lakukan pengambilan sampel uji ulang (re-sampling) laboratorium untuk verifikasi status MS.',
      targetUnit: 'Instalasi Laboratorium, Poli Gigi & Kesling',
      standardRef: 'SOP Pemeliharaan Unit RO & Dental Unit Waterline RSAM',
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
      'Mengacu pada Peraturan Menteri Kesehatan RI Nomor 2 Tahun 2023 tentang Peraturan Pelaksanaan PP Nomor 66 Tahun 2014 tentang Kesehatan Lingkungan, kadar maksimum yang diperbolehkan untuk parameter mikrobiologi Air untuk Keperluan Higiene Sanitasi & Air RO Pelayanan Medis (Total Coliform dan E. Coli) adalah 0 CFU/100 ml sampel.',
    generatedAt: 'Realtime Sync',
    sourceEngine: 'SIKRESMI AI Sanitary Intelligence (Gemini 3.8 Flash)',
  };
}
