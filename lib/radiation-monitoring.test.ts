import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRadiationRowCapaian,
  calculateRadiationSummary,
  createInitialRadiationMonitoringData,
} from './radiation-monitoring';
import { MAIN_NAVIGATION, resolveRouteMeta } from './navigation';

test('createInitialRadiationMonitoringData creates 12 months with 100% matching reference image', () => {
  const rows = createInitialRadiationMonitoringData();
  assert.equal(rows.length, 12);
  assert.equal(rows[0].monthLabel, 'Januari');
  assert.equal(rows[11].monthLabel, 'Desember');

  for (let i = 0; i < 10; i++) {
    assert.equal(rows[i].izinBapeten, 'ya');
    assert.equal(rows[i].peralatanProteksi, 'ya');
    assert.equal(rows[i].pemantauanPekerja, 'ya');
    assert.equal(rows[i].capaian, 100);
  }
  assert.equal(rows[10].izinBapeten, null);
  assert.equal(rows[11].izinBapeten, null);
});

test('calculateRadiationRowCapaian computes accurate percentage for 3 indicators', () => {
  assert.equal(calculateRadiationRowCapaian('ya', 'ya', 'ya'), 100);
  assert.equal(calculateRadiationRowCapaian('ya', 'ya', 'tidak'), 67);
  assert.equal(calculateRadiationRowCapaian('ya', 'tidak', 'tidak'), 33);
  assert.equal(calculateRadiationRowCapaian('tidak', 'tidak', 'tidak'), 0);
  assert.equal(calculateRadiationRowCapaian(null, null, null), 0);
});

test('calculateRadiationSummary computes stats, analysis, recommendations, and RTL dynamically', () => {
  const rows = createInitialRadiationMonitoringData();
  const summary = calculateRadiationSummary(rows);

  assert.equal(summary.totalMonths, 12);
  assert.equal(summary.perfect100Count, 10);
  assert.equal(summary.partialCount, 2);
  assert.equal(summary.avgCapaian, 83.3);
  assert.equal(summary.izinBapetenRate, 83);
  assert.equal(summary.peralatanProteksiRate, 83);
  assert.equal(summary.pemantauanPekerjaRate, 83);
  assert.ok(summary.analysisText.includes('BAPETEN'));
  assert.ok(summary.recommendations.length >= 3);
  assert.ok(summary.followUpPlans.length >= 3);
});

test('navigation replaces Monitoring Lainnya with Monitoring Pengamanan Radiasi', () => {
  const monitoringMenu = MAIN_NAVIGATION.find((m) => m.id === 'monitoring');
  assert.ok(monitoringMenu);
  const subItems = monitoringMenu.subItems || [];
  const radiationItem = subItems.find((s) => s.id === 'pengamanan-radiasi');
  assert.ok(radiationItem);
  assert.equal(radiationItem.title, 'Monitoring Pengamanan Radiasi');
  assert.equal(radiationItem.href, '/monitoring/pengamanan-radiasi');

  const oldLainnya = subItems.find((s) => s.id === 'monitoring-lainnya');
  assert.equal(oldLainnya, undefined);

  const resolvedAlias = resolveRouteMeta('/monitoring/lainnya');
  assert.equal(resolvedAlias.title, 'Monitoring Pengamanan Radiasi');
});
