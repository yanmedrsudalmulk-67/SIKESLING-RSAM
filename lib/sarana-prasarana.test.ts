import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSaranaPrasaranaData,
  calculateSaranaPrasaranaSummary,
  INITIAL_TOILET_ROWS,
  INITIAL_LANTAI_ROWS,
  INITIAL_PINTU_JENDELA_ROWS,
  INITIAL_ATAP_ROWS,
  INITIAL_LANGIT_LANGIT_ROWS,
} from './sarana-prasarana';
import { MAIN_NAVIGATION } from './navigation';

test('createInitialSaranaPrasaranaData initializes 5 sheets properly', () => {
  const data = createInitialSaranaPrasaranaData(2026);
  assert.equal(data.year, 2026);
  assert.equal(data.toilets.length, 15);
  assert.equal(data.toiletDisabilitas.rajalAda, true);
  assert.equal(data.toiletDisabilitas.igdAda, true);
  assert.equal(data.toiletDisabilitas.penunjangAda, true);
  assert.equal(data.lantai.length, 5);
  assert.equal(data.pintuJendela.length, 5);
  assert.equal(data.atap.length, 4);
  assert.equal(data.langitLangit.length, 5);
});

test('calculateSaranaPrasaranaSummary calculates compliance rate, chart data, and RTL correctly', () => {
  const data = createInitialSaranaPrasaranaData(2026);
  const summary = calculateSaranaPrasaranaSummary(data);

  assert.ok(summary.overallCompliance > 50 && summary.overallCompliance <= 100);
  assert.equal(summary.aspects.length, 5);
  assert.equal(summary.chartData.length, 5);
  assert.equal(summary.zoneData.length, 5);
  assert.ok(summary.recommendations.length >= 5);
  assert.ok(summary.actionPlans.length >= 5);
  assert.ok(summary.analysisText.includes('kepatuhan'));
});

test('navigation contains sarana-prasarana submodule under monitoring and excludes analisis from primary 5 main menus', () => {
  const monitoringMenu = MAIN_NAVIGATION.find((m) => m.id === 'monitoring');
  assert.ok(monitoringMenu);
  assert.ok(monitoringMenu.subItems);

  const sarprasSub = monitoringMenu.subItems.find((s) => s.id === 'sarana-prasarana');
  assert.ok(sarprasSub, 'sarana-prasarana should be registered under monitoring subItems');
  assert.equal(sarprasSub.href, '/monitoring/sarana-prasarana');
});
