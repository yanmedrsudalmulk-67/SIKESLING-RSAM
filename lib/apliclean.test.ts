import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APICLEAN_MODULES,
  APICLEAN_TASK_DEFINITIONS,
  calculateAplicleanRecordProgress,
  createAllAplicleanRecords,
  createEmptyAplicleanTasks,
  createInitialAplicleanRecords,
  getAplicleanModuleConfig,
  getIndonesianDayNameFromDate,
} from './apliclean';

test('APLICLEAN defines all 5 modules (Rawat Jalan, IGD, Ranap, ICU & IBS, Supervisi) with 7 checklist items each', () => {
  assert.equal(APICLEAN_MODULES.length, 5);
  assert.deepEqual(
    APICLEAN_MODULES.map((m) => m.id),
    ['RAWAT_JALAN', 'IGD', 'RANAP', 'ICU_IBS', 'SUPERVISI']
  );

  for (const mod of APICLEAN_MODULES) {
    assert.equal(mod.taskDefinitions.length, 7);
    assert.equal(mod.taskDefinitions[0].key, 'tugasRutin');
    assert.equal(mod.taskDefinitions[6].key, 'alkes');
  }

  assert.equal(APICLEAN_TASK_DEFINITIONS.length, 7);
  assert.equal(getAplicleanModuleConfig('IGD').title, 'Ruang IGD');
  assert.equal(getAplicleanModuleConfig('ICU_IBS').title, 'Ruang ICU & IBS');
  assert.equal(getAplicleanModuleConfig('SUPERVISI').title, 'Supervisi Kesling');
});

test('createInitialAplicleanRecords loads 36 Rawat Jalan records and 104 total records across all 5 modules', () => {
  const rajalRecords = createInitialAplicleanRecords('RAWAT_JALAN');
  assert.equal(rajalRecords.length, 36);

  const first = rajalRecords[0];
  assert.equal(first.date, '2026-09-02');
  assert.equal(first.dayName, 'RABU');
  assert.equal(first.officerName, 'ABU HANIFAH');
  assert.ok(first.tasks.tugasRutin.photoUrl.includes('appsheet.com'));

  const prog = calculateAplicleanRecordProgress(first);
  assert.equal(prog.totalTasks, 7);
  assert.equal(prog.completedCount, 4);
  assert.equal(prog.photoCount, 3);

  const allRecords = createAllAplicleanRecords();
  assert.equal(allRecords.length, 104);
  assert.equal(allRecords.filter((r) => r.moduleId === 'IGD').length, 18);
  assert.equal(allRecords.filter((r) => r.moduleId === 'RANAP').length, 18);
  assert.equal(allRecords.filter((r) => r.moduleId === 'ICU_IBS').length, 16);
  assert.equal(allRecords.filter((r) => r.moduleId === 'SUPERVISI').length, 16);
});

test('getIndonesianDayNameFromDate and createEmptyAplicleanTasks work deterministically', () => {
  assert.equal(getIndonesianDayNameFromDate('2026-10-31'), 'SABTU');
  const prefilled = createEmptyAplicleanTasks(true);
  assert.equal(prefilled.tugasRutin.status, 'DILAKUKAN');
  assert.equal(prefilled.wastafel.status, 'DILAKSANAKAN');
});
