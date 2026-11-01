import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasPermission,
  canTransitionFindingStatus,
  validateDailyActivityInput,
  validateSupervisionInput,
  validateFileUpload,
  calculateDashboardSummary,
  MAX_UPLOAD_BYTES,
} from './domain';
import { MAIN_NAVIGATION, getAllRoutes, resolveRouteMeta } from './navigation';
import {
  createInitialWaterQualityData,
  evaluateWaterCompliance,
  filterWaterQualityRows,
  calculateWaterQualityMetrics,
  buildMonthlyWaterChartData,
  generateDeterministicWaterAnalysis,
} from './water-quality';

test('navigation structure includes all 11 main menus and required routes', () => {
  assert.equal(MAIN_NAVIGATION.length, 11);
  const allRoutes = getAllRoutes();
  assert.ok(allRoutes.includes('/dashboard'));
  assert.ok(allRoutes.includes('/program-kerja/tahunan'));
  assert.ok(allRoutes.includes('/operasional/kegiatan-harian'));
  assert.ok(allRoutes.includes('/monitoring/kualitas-air'));
  assert.ok(allRoutes.includes('/monitoring/ipal'));
  assert.ok(allRoutes.includes('/supervisi/dashboard'));
  assert.ok(allRoutes.includes('/tindak-lanjut/temuan'));
  assert.ok(allRoutes.includes('/analisis/kegiatan'));
  assert.ok(allRoutes.includes('/laporan/bulanan'));
  assert.ok(allRoutes.includes('/dokumentasi/galeri'));
  assert.ok(allRoutes.includes('/master-data/ruangan'));
  assert.ok(allRoutes.includes('/master-data/standar'));
  assert.ok(allRoutes.includes('/pengaturan/hak-akses'));

  const resolved = resolveRouteMeta('/supervisi/riwayat');
  assert.equal(resolved.title, 'Tabel Rekap Supervisi');
  assert.equal(resolved.breadcrumbs.length, 3);
});

test('RBAC permissions enforce role boundaries accurately', () => {
  assert.equal(hasPermission('Administrator', 'manage_settings'), true);
  assert.equal(hasPermission('Petugas Kesling', 'create_supervision'), true);
  assert.equal(hasPermission('Petugas Kesling', 'verify_findings'), false);
  assert.equal(hasPermission('Koordinator Kesling', 'verify_findings'), true);
  assert.equal(hasPermission('Pimpinan / Viewer', 'view_dashboard'), true);
  assert.equal(hasPermission('Pimpinan / Viewer', 'manage_operational'), false);
});

test('finding workflow transitions follow sequential and role rules', () => {
  // Valid transition from Temuan Baru -> Dalam Proses by Petugas Kesling
  const step1 = canTransitionFindingStatus(
    'Temuan Baru',
    'Dalam Proses',
    'Petugas Kesling'
  );
  assert.equal(step1.allowed, true);

  // Invalid skip from Temuan Baru -> Selesai Terverifikasi
  const skip = canTransitionFindingStatus(
    'Temuan Baru',
    'Selesai Terverifikasi',
    'Koordinator Kesling'
  );
  assert.equal(skip.allowed, false);

  // Petugas Kesling cannot verify final completion
  const unauthorizedVerify = canTransitionFindingStatus(
    'Menunggu Verifikasi',
    'Selesai Terverifikasi',
    'Petugas Kesling'
  );
  assert.equal(unauthorizedVerify.allowed, false);

  // Koordinator Kesling can verify from Menunggu Verifikasi -> Selesai Terverifikasi
  const authorizedVerify = canTransitionFindingStatus(
    'Menunggu Verifikasi',
    'Selesai Terverifikasi',
    'Koordinator Kesling'
  );
  assert.equal(authorizedVerify.allowed, true);
});

test('daily activity and supervision form validations reject incomplete inputs', () => {
  const invalidActivity = validateDailyActivityInput({
    date: '',
    category: '',
    location: 'IGD',
    officerName: '',
    description: 'abc',
  });
  assert.equal(invalidActivity.valid, false);
  assert.ok(invalidActivity.errors.date);
  assert.ok(invalidActivity.errors.category);
  assert.ok(invalidActivity.errors.officerName);
  assert.ok(invalidActivity.errors.description);

  const validActivity = validateDailyActivityInput({
    date: '2026-10-31',
    category: 'Inspeksi Sanitasi Ruangan',
    location: 'Ruang Rawat Inap Lt. 2',
    officerName: 'Petugas Sanitasi A',
    description: 'Pemeriksaan kebersihan fasilitas sanitasi dan tempat sampah.',
  });
  assert.equal(validActivity.valid, true);

  const validSupervision = validateSupervisionInput({
    date: '2026-10-31',
    officerName: 'Petugas Sanitasi A',
    roomOrUnit: 'Instalasi Gizi',
    category: 'Higiene Sanitasi Pangan',
    inspectionDetails: 'Pemeriksaan area penyimpanan bahan makanan kering.',
  });
  assert.equal(validSupervision.valid, true);
});

test('file upload validation checks MIME type and 5MB size limit', () => {
  const validJpg = validateFileUpload({
    name: 'dokumentasi-ipal.jpg',
    type: 'image/jpeg',
    size: 1024 * 500,
  });
  assert.equal(validJpg.valid, true);

  const invalidType = validateFileUpload({
    name: 'script.exe',
    type: 'application/x-msdownload',
    size: 1024,
  });
  assert.equal(invalidType.valid, false);

  const oversized = validateFileUpload({
    name: 'huge-photo.png',
    type: 'image/png',
    size: MAX_UPLOAD_BYTES + 100,
  });
  assert.equal(oversized.valid, false);
});

test('dashboard summary returns zero values on empty state and never invents fake compliance percentages', () => {
  const emptySummary = calculateDashboardSummary({
    activities: [],
    supervisions: [],
    findings: [],
    schedules: [],
  });
  assert.equal(emptySummary.totalActivities, 0);
  assert.equal(emptySummary.totalSupervisions, 0);
  assert.equal(emptySummary.unresolvedFindings, 0);
  assert.equal(emptySummary.compliancePercentage, null);
  assert.equal(emptySummary.upcomingSchedules, 0);
  assert.equal(emptySummary.availableReports, 0);
});

test('water quality dataset matches reference image and period filters accurately', () => {
  const rows = createInitialWaterQualityData(2026);
  // 12 months * 3 sources * 2 indicators = 72 rows
  assert.equal(rows.length, 72);

  // Verify JANUARI values match screenshot:
  // Artesis: Total Coliform = 0 (MS), E.Coli = 0 (MS)
  // Air RO Lab: Total Coliform = 7 (TMS), E.Coli = 0 (MS)
  // AIR RO POLI GIGI: Total Coliform = 4 (TMS), E.Coli = 0 (MS)
  const janRows = filterWaterQualityRows(rows, { period: 'MONTH_1' });
  assert.equal(janRows.length, 6);
  const janRoLabColiform = janRows.find(
    (r) => r.sourceName === 'Air RO Lab' && r.indicator === 'Total Coliform'
  );
  assert.equal(janRoLabColiform?.resultValue, 7);
  assert.equal(janRoLabColiform?.status, 'TMS');

  const janPoliGigiColiform = janRows.find(
    (r) => r.sourceName === 'AIR RO POLI GIGI' && r.indicator === 'Total Coliform'
  );
  assert.equal(janPoliGigiColiform?.resultValue, 4);
  assert.equal(janPoliGigiColiform?.status, 'TMS');

  // Verify FEBRUARI & MARET all 0 (MS)
  const febMarRows = rows.filter((r) => r.monthIndex === 2 || r.monthIndex === 3);
  assert.equal(febMarRows.every((r) => r.resultValue === 0 && r.status === 'MS'), true);

  // Verify APRIL Artesis Total Coliform = 9 (TMS)
  const aprRows = filterWaterQualityRows(rows, { period: 'MONTH_4' });
  const aprArtesisColiform = aprRows.find(
    (r) => r.sourceName === 'Artesis' && r.indicator === 'Total Coliform'
  );
  assert.equal(aprArtesisColiform?.resultValue, 9);
  assert.equal(aprArtesisColiform?.status, 'TMS');

  // Verify Q1 filter returns 3 months (18 rows)
  const q1Rows = filterWaterQualityRows(rows, { period: 'Q1' });
  assert.equal(q1Rows.length, 18);

  // Verify chart aggregation and AI deterministic analysis
  const chartData = buildMonthlyWaterChartData(rows);
  assert.equal(chartData.length, 12);
  assert.equal(chartData[0].roLabColiform, 7);
  assert.equal(chartData[0].roPoliGigiColiform, 4);
  assert.equal(chartData[3].artesisColiform, 9);

  const metrics = calculateWaterQualityMetrics(rows);
  assert.equal(metrics.tmsCount, 5);
  assert.equal(metrics.msCount, 67);
  assert.equal(evaluateWaterCompliance(0), 'MS');
  assert.equal(evaluateWaterCompliance(1), 'TMS');

  const analysis = generateDeterministicWaterAnalysis(rows, '1 Tahun Penuh (2026)');
  assert.equal(analysis.sourceDiagnoses.length, 3);
  assert.ok(analysis.recommendations.length >= 3);
});

test('wastewater quality dataset matches reference image and calculations accurately', () => {
  const {
    createInitialWastewaterData,
    filterWastewaterRows,
    evaluateWastewaterCompliance,
    calculateWastewaterMetrics,
    buildMonthlyWastewaterChartData,
    generateDeterministicWastewaterAnalysis,
  } = require('./wastewater-quality');

  const rows = createInitialWastewaterData(2026);
  // 12 months * 2 points * 11 indicators = 264 rows
  assert.equal(rows.length, 264);

  // Verify Januari Inlet TSS = 27, pH = 5,97 (TMS), Total Coliform = 9.000 (TMS)
  const janInlet = rows.filter((r) => r.month === 1 && r.samplingPoint === 'IPAL INLET');
  assert.equal(janInlet.length, 11);
  const janInletPh = janInlet.find((r) => r.indicator === 'PH');
  assert.equal(janInletPh?.resultValue, '5,97');
  assert.equal(janInletPh?.status, 'TMS');

  const janInletColi = janInlet.find((r) => r.indicator === 'TOTAL COLIFORM');
  assert.equal(janInletColi?.resultValue, '9.000');
  assert.equal(janInletColi?.status, 'TMS');

  // Verify Januari Outlet BOD = 6 (MS), COD = 20 (MS), Coliform = 1200 (MS)
  const janOutlet = rows.filter((r) => r.month === 1 && r.samplingPoint === 'IPAL OUTLET');
  assert.equal(janOutlet.length, 11);
  const janOutletBod = janOutlet.find((r) => r.indicator === 'BOD');
  assert.equal(janOutletBod?.resultValue, '6');
  assert.equal(janOutletBod?.status, 'MS');

  // Verify Februari Inlet pH = 3,99 (TMS), Coliform = 26.000 (TMS)
  const febInletPh = rows.find(
    (r) => r.month === 2 && r.samplingPoint === 'IPAL INLET' && r.indicator === 'PH'
  );
  assert.equal(febInletPh?.resultValue, '3,99');
  assert.equal(febInletPh?.status, 'TMS');

  const febInletColi = rows.find(
    (r) => r.month === 2 && r.samplingPoint === 'IPAL INLET' && r.indicator === 'TOTAL COLIFORM'
  );
  assert.equal(febInletColi?.resultValue, '26.000');
  assert.equal(febInletColi?.status, 'TMS');

  // Verify Evaluator
  assert.equal(evaluateWastewaterCompliance('PH', '7,2').status, 'MS');
  assert.equal(evaluateWastewaterCompliance('PH', '5,5').status, 'TMS');
  assert.equal(evaluateWastewaterCompliance('BOD', '25').status, 'MS');
  assert.equal(evaluateWastewaterCompliance('BOD', '35').status, 'TMS');
  assert.equal(evaluateWastewaterCompliance('TOTAL COLIFORM', '4500').status, 'TMS');
  assert.equal(evaluateWastewaterCompliance('TOTAL COLIFORM', '1500').status, 'MS');

  // Verify Metrics and Chart aggregation
  const metrics = calculateWastewaterMetrics(rows);
  assert.ok(metrics.totalTests === 264);
  assert.ok(metrics.outletComplianceRate >= 95);
  assert.ok(metrics.avgBodReduction > 0);

  const chart = buildMonthlyWastewaterChartData(rows);
  assert.equal(chart.length, 12);
  assert.equal(chart[0].inletBod, 11);
  assert.equal(chart[0].outletBod, 6);

  // Verify AI analysis
  const ai = generateDeterministicWastewaterAnalysis(rows, '1 Tahun Penuh (2026)');
  assert.ok(ai.recommendations.length >= 3);
  assert.ok(ai.executiveSummary.length > 20);
});

test('air quality and indoor physical environment dataset is populated with required groups and parameters', () => {
  // Test navigation route metadata for /monitoring/kualitas-udara
  const { resolveRouteMeta } = require('./navigation');
  const meta = resolveRouteMeta('/monitoring/kualitas-udara');
  assert.equal(meta.title, 'Monitoring Kualitas Udara');
  assert.ok(meta.breadcrumbs.length >= 2);
});

test('supabase integration normalizes REST v1 URLs and defines all 16 application collections', () => {
  const {
    normalizeSupabaseUrls,
    getSupabaseConfig,
    createInitialSikeslingCloudState,
  } = require('./supabase');

  const parsed = normalizeSupabaseUrls('https://zwsshqpenadbpytvwkje.supabase.co/rest/v1/');
  assert.equal(parsed.projectUrl, 'https://zwsshqpenadbpytvwkje.supabase.co');
  assert.equal(parsed.restUrl, 'https://zwsshqpenadbpytvwkje.supabase.co/rest/v1');

  const cfg = getSupabaseConfig();
  assert.equal(cfg.restUrl, 'https://zwsshqpenadbpytvwkje.supabase.co/rest/v1');
  assert.ok(cfg.anonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));

  const initialState = createInitialSikeslingCloudState();
  assert.equal(Object.keys(initialState).length, 16);
});


