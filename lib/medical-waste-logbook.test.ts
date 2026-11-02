import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MEDICAL_WASTE_SOURCES,
  getRealtimeTodayIso,
  createRealtimeInitialMedicalWasteLogbook,
  formatIsoToDisplayDate,
  parseDisplayDateToIso,
  formatWeightKgId,
  parseWeightInput,
  calculateBatchSubtotals,
  groupLogbookRowsByBatch,
  summarizeBySourceRoom,
  generateMedicalWasteLogbookAnalysis,
} from './medical-waste-logbook';

test('formatIsoToDisplayDate and parseDisplayDateToIso convert between YYYY-MM-DD and DD/MM/YYYY', () => {
  assert.equal(formatIsoToDisplayDate('2026-11-02'), '02/11/2026');
  assert.equal(parseDisplayDateToIso('02/11/2026'), '2026-11-02');
});

test('formatWeightKgId and parseWeightInput handle blank cells and Indonesian comma decimals', () => {
  assert.equal(formatWeightKgId(null), '');
  assert.equal(formatWeightKgId(null, true), '0,00');
  assert.equal(formatWeightKgId(3), '3,00');
  assert.equal(formatWeightKgId(10), '10,00');
  assert.equal(parseWeightInput('3,00'), 3);
  assert.equal(parseWeightInput('2.50'), 2.5);
  assert.equal(parseWeightInput(''), null);
});

test('createRealtimeInitialMedicalWasteLogbook initializes 11 rooms with realtime date and zero/blank dummy values', () => {
  const sampleToday = getRealtimeTodayIso(new Date(2026, 10, 2));
  assert.equal(sampleToday, '2026-11-02');

  const initialRows = createRealtimeInitialMedicalWasteLogbook(sampleToday);
  assert.equal(DEFAULT_MEDICAL_WASTE_SOURCES.length, 11);
  assert.equal(initialRows.length, 11);

  for (const row of initialRows) {
    assert.equal(row.tanggalMasuk, '2026-11-02');
    assert.equal(row.tanggalKeluar, '2026-11-02');
    assert.equal(row.beratTajamKg, null);
    assert.equal(row.beratPadatKg, null);
    assert.equal(row.noManifest, '');
  }

  const groups = groupLogbookRowsByBatch(initialRows);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].totalTajamKg, 0);
  assert.equal(groups[0].totalPadatKg, 0);
  assert.equal(groups[0].totalCombinedKg, 0);

  const emptyAnalysis = generateMedicalWasteLogbookAnalysis(initialRows);
  assert.equal(emptyAnalysis.activeYear, 2026);
  assert.equal(emptyAnalysis.grandTotalKg, 0);
  assert.equal(emptyAnalysis.rekomendasiList.length, 4);
  assert.equal(emptyAnalysis.tindakLanjutList.length, 4);

  // Now simulate user entering weights and manifest
  initialRows[0].beratPadatKg = 3.5; // IGD
  initialRows[0].beratTajamKg = 1.5;
  initialRows[0].noManifest = 'QR1112628';

  const sub = calculateBatchSubtotals(initialRows);
  assert.deepEqual(sub, {
    totalTajamKg: 1.5,
    totalPadatKg: 3.5,
    totalCombinedKg: 5.0,
  });

  const summary = summarizeBySourceRoom(initialRows);
  const igd = summary.find((s) => s.room === 'IGD');
  assert.ok(igd);
  assert.equal(igd.totalKg, 5.0);

  const activeAnalysis = generateMedicalWasteLogbookAnalysis(initialRows);
  assert.equal(activeAnalysis.grandTotalKg, 5.0);
  assert.equal(activeAnalysis.topSourceRoom?.room, 'IGD');
  assert.ok(activeAnalysis.analisaParagraph.includes('5,00 kg'));
});
