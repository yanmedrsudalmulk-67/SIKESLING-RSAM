import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAllModulesDashboardSummaries,
  createDefaultMonitoringDataset,
  formatDashboardPeriodLabel,
  formatRealtimeGreeting,
  formatThousandsDot,
  getActiveMonthsForPeriod,
  getIndonesianTimeGreeting,
  readRealtimeMonitoringDatasetFromStorage,
} from './dashboard-monitoring-trends';

test('getIndonesianTimeGreeting and formatRealtimeGreeting return accurate Indonesian time greetings', () => {
  assert.equal(getIndonesianTimeGreeting(5), 'pagi');
  assert.equal(getIndonesianTimeGreeting(10), 'pagi');
  assert.equal(getIndonesianTimeGreeting(11), 'siang');
  assert.equal(getIndonesianTimeGreeting(14), 'siang');
  assert.equal(getIndonesianTimeGreeting(15), 'sore');
  assert.equal(getIndonesianTimeGreeting(17), 'sore');
  assert.equal(getIndonesianTimeGreeting(18), 'malam');
  assert.equal(getIndonesianTimeGreeting(23), 'malam');
  assert.equal(getIndonesianTimeGreeting(2), 'malam');

  assert.equal(formatRealtimeGreeting(8), 'Hai, selamat pagi Fitria!');
  assert.equal(formatRealtimeGreeting(13), 'Hai, selamat siang Fitria!');
  assert.equal(formatRealtimeGreeting(16), 'Hai, selamat sore Fitria!');
  assert.equal(formatRealtimeGreeting(20), 'Hai, selamat malam Fitria!');
});

test('getActiveMonthsForPeriod returns correct month indices for each period mode', () => {
  assert.deepEqual(
    getActiveMonthsForPeriod({
      year: 2026,
      mode: 'BULAN',
      month: 10,
      quarter: 4,
      semester: 2,
    }),
    [10]
  );

  assert.deepEqual(
    getActiveMonthsForPeriod({
      year: 2026,
      mode: 'TRIWULAN',
      month: 10,
      quarter: 2,
      semester: 1,
    }),
    [4, 5, 6]
  );

  assert.deepEqual(
    getActiveMonthsForPeriod({
      year: 2026,
      mode: 'SEMESTER',
      month: 10,
      quarter: 4,
      semester: 2,
    }),
    [7, 8, 9, 10, 11, 12]
  );

  assert.equal(
    getActiveMonthsForPeriod({
      year: 2026,
      mode: 'TAHUNAN',
      month: 10,
      quarter: 4,
      semester: 2,
    }).length,
    12
  );
});

test('formatDashboardPeriodLabel formats Indonesian period labels accurately', () => {
  assert.equal(
    formatDashboardPeriodLabel({
      year: 2026,
      mode: 'BULAN',
      month: 10,
      quarter: 4,
      semester: 2,
    }),
    'Oktober 2026'
  );

  assert.equal(
    formatDashboardPeriodLabel({
      year: 2026,
      mode: 'TRIWULAN',
      month: 1,
      quarter: 1,
      semester: 1,
    }),
    'Triwulan I (Jan–Mar) 2026'
  );

  assert.equal(
    formatDashboardPeriodLabel({
      year: 2025,
      mode: 'SEMESTER',
      month: 7,
      quarter: 3,
      semester: 2,
    }),
    'Semester II (Jul–Des) 2025'
  );

  assert.equal(
    formatDashboardPeriodLabel({
      year: 2026,
      mode: 'TAHUNAN',
      month: 1,
      quarter: 1,
      semester: 1,
    }),
    'Tahunan (Jan–Des) 2026'
  );
});

test('buildAllModulesDashboardSummaries builds 12-month annual series and reflects realtime monitoring changes', () => {
  const dataset = createDefaultMonitoringDataset(2026);
  const annualSummaries = buildAllModulesDashboardSummaries(
    {
      year: 2026,
      mode: 'TAHUNAN',
      month: 10,
      quarter: 4,
      semester: 2,
    },
    dataset
  );

  assert.equal(annualSummaries.air.points.length, 12);
  assert.equal(annualSummaries.udara.points.length, 12);
  assert.equal(annualSummaries.ipal.points.length, 12);
  assert.equal(annualSummaries.limbah_b3.points.length, 12);
  assert.equal(annualSummaries.vektor.points.length, 12);
  assert.equal(annualSummaries.pangan.points.length, 12);

  // Total Limbah B3 for full year matches 3.952 Kg
  assert.equal(annualSummaries.limbah_b3.headlineValue, '3.952 Kg');

  // Single month mode produces 4 weekly points and reflects updated food sanitation score
  dataset.foodRows[9] = {
    ...dataset.foodRows[9],
    nilai: 96,
  };
  const octSummaries = buildAllModulesDashboardSummaries(
    {
      year: 2026,
      mode: 'BULAN',
      month: 10,
      quarter: 4,
      semester: 2,
    },
    dataset
  );
  assert.equal(octSummaries.pangan.points.length, 4);
  assert.equal(octSummaries.pangan.complianceAvg, 96);
  assert.equal(octSummaries.pangan.headlineValue, '96%');
});

test('formatThousandsDot and readRealtimeMonitoringDatasetFromStorage are deterministic for SSR hydration', () => {
  assert.equal(formatThousandsDot(3952), '3.952');
  assert.equal(formatThousandsDot(1250000), '1.250.000');

  const ssrDataset = readRealtimeMonitoringDatasetFromStorage(2026, [], false);
  assert.equal(ssrDataset.solidWasteRows.length, 12);
  assert.equal(ssrDataset.foodRows.length, 12);
});

