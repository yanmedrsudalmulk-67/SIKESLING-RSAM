import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLinenRowCapaian,
  calculateLinenSummary,
  createEmptyLinenMonitoringData,
  createInitialLinenMonitoringData,
} from './linen-monitoring';
import { MAIN_NAVIGATION, resolveRouteMeta } from './navigation';

test('createInitialLinenMonitoringData creates 12 months matching reference image', () => {
  const rows = createInitialLinenMonitoringData();
  assert.equal(rows.length, 12);
  assert.equal(rows[0].monthLabel, 'Januari');
  assert.equal(rows[0].capaian, 100);
  assert.equal(rows[1].monthLabel, 'Februari');
  assert.equal(rows[1].capaian, 100);
  assert.equal(rows[2].monthLabel, 'Maret');
  assert.equal(rows[2].capaian, 100);
  assert.equal(rows[9].monthLabel, 'Oktober');
  assert.equal(rows[9].capaian, 100);
  assert.equal(rows[10].monthLabel, 'November');
  assert.equal(rows[10].capaian, 0);
  assert.equal(rows[11].monthLabel, 'Desember');
  assert.equal(rows[11].capaian, 0);
});

test('calculateLinenRowCapaian computes accurate percentage for 3 indicators', () => {
  assert.equal(calculateLinenRowCapaian('ya', 'ya', 'ya'), 100);
  assert.equal(calculateLinenRowCapaian('ya', 'ya', 'tidak'), 67);
  assert.equal(calculateLinenRowCapaian('ya', 'tidak', 'tidak'), 33);
  assert.equal(calculateLinenRowCapaian('tidak', 'tidak', 'tidak'), 0);
  assert.equal(calculateLinenRowCapaian(null, null, null), 0);
});

test('calculateLinenSummary computes stats, analysis, recommendations, and RTL dynamically', () => {
  const initialRows = createInitialLinenMonitoringData();
  const summary = calculateLinenSummary(initialRows);
  assert.equal(summary.totalMonths, 12);
  assert.equal(summary.perfect100Count, 10);
  assert.equal(summary.partialCount, 2);
  assert.equal(summary.mouRate, 83);
  assert.equal(summary.pemilahanRate, 83);
  assert.equal(summary.pengawasanRate, 83);
  assert.equal(summary.avgCapaian, 83.3);
  assert.ok(summary.analysisText.includes('Penyelenggaraan Linen'));
  assert.ok(summary.recommendations.length >= 4);
  assert.ok(summary.followUpPlans.length >= 4);

  const emptyRows = createEmptyLinenMonitoringData();
  const emptySummary = calculateLinenSummary(emptyRows);
  assert.equal(emptySummary.avgCapaian, 0);
  assert.equal(emptySummary.perfect100Count, 0);
});

test('navigation replaces Higiene dan Sanitasi Lingkungan with Monitoring Penyelenggaraan Linen', () => {
  const monitoringMenu = MAIN_NAVIGATION.find((m) => m.id === 'monitoring');
  assert.ok(monitoringMenu);
  const subIds = monitoringMenu.subItems?.map((s) => s.id) || [];
  assert.ok(subIds.includes('penyelenggaraan-linen'));
  assert.ok(!subIds.includes('higiene-sanitasi'));

  const meta = resolveRouteMeta('/monitoring/penyelenggaraan-linen');
  assert.equal(meta.title, 'Monitoring Penyelenggaraan Linen');

  const aliasMeta = resolveRouteMeta('/monitoring/higiene-sanitasi');
  assert.equal(aliasMeta.title, 'Monitoring Penyelenggaraan Linen');
});
