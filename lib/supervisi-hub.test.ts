import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CRITERIA_QUICK_OPTIONS,
  DEFAULT_PETUGAS_LIST,
  SUPERVISI_CARDS,
  addPetugasName,
  buildAuditFindingFromRoomChecklist,
  buildTimestampFromParts,
  calculateRoomChecklistProgress,
  calculateSupervisiScores,
  createDefaultTaskEntriesForCard,
  createInitialRoomChecklistRecords,
  createInitialSupervisiAuditRecords,
  deletePetugasName,
  deriveTemuanWorkflowStatus,
  editPetugasName,
  formatMultiChoiceValue,
  getHariFromDateInput,
  isMultiChoiceOptionSelected,
  parseMultiChoiceValue,
  parseTimestampToParts,
  scaleCanvasCoordinates,
  selectAllMultiChoiceOptions,
  toggleMultiChoiceOption,
  updateSupervisiFindingFollowUp,
} from './supervisi-hub';

test('SUPERVISI_CARDS defines all 10 AppSheet APLICLEAN cards with exact task schemas', () => {
  assert.equal(SUPERVISI_CARDS.length, 10);

  const rawatJalan = SUPERVISI_CARDS.find((c) => c.id === 'RAWAT_JALAN')!;
  assert.equal(rawatJalan.tasks.length, 7);
  assert.equal(
    rawatJalan.tasks[1].label,
    'MEMBERISHKAN WASTAFEL (10.00 - 13.00)'
  );
  assert.equal(rawatJalan.tasks[1].positiveLabel, 'DILAKSANAKAN');
  assert.deepEqual(rawatJalan.featuredOfficers, ['ABU HANIFAH']);

  const igd = SUPERVISI_CARDS.find((c) => c.id === 'IGD')!;
  assert.equal(igd.tasks.length, 7);
  assert.equal(igd.tasks[1].label, 'MEMBERISHKAN RUANG EK (10.00 - 13.00)');
  assert.equal(igd.tasks[5].label, 'MEMBERSIHKAN ALKES (10.00 - 13.00)_23');
  assert.deepEqual(igd.tasks[5].photoSlotLabels, ['FOTO WC_24']);

  const icuIbs = SUPERVISI_CARDS.find((c) => c.id === 'RANAP_ICU_IBS')!;
  assert.equal(icuIbs.tasks.length, 7);
  assert.equal(icuIbs.tasks[0].photoSlotLabels.length, 3);
  assert.equal(icuIbs.signatureSlotLabels.length, 3);

  const usman = SUPERVISI_CARDS.find((c) => c.id === 'RANAP_USMAN')!;
  assert.equal(usman.tasks.length, 7);
  assert.deepEqual(usman.featuredOfficers, ['MIRNAWATI', 'DEVI SURYADI']);

  const manajemen = SUPERVISI_CARDS.find((c) => c.id === 'MANAJEMEN')!;
  assert.equal(manajemen.tasks.length, 7);
  assert.equal(manajemen.tasks[2].photoSlotLabels.length, 3);
  assert.equal(manajemen.signatureSlotLabels.length, 3);
  assert.deepEqual(manajemen.featuredOfficers, ['DONI ALAMSYAH']);

  const halaman = SUPERVISI_CARDS.find((c) => c.id === 'HALAMAN')!;
  assert.equal(halaman.tasks.length, 6);
  assert.equal(halaman.tasks[5].label, 'PENGANTARAN OBAT (11.00 - 13.00)');
  assert.equal(halaman.tasks[5].photoSlotLabels.length, 0);
  assert.equal(halaman.hasEvaluasiSupervisor, false);

  const supervisi = SUPERVISI_CARDS.find((c) => c.id === 'SUPERVISI')!;
  assert.equal(supervisi.kind, 'supervisi_audit');
});

test('calculateRoomChecklistProgress and createDefaultTaskEntriesForCard work accurately', () => {
  const rawatJalan = SUPERVISI_CARDS.find((c) => c.id === 'RAWAT_JALAN')!;
  const emptyEntries = createDefaultTaskEntriesForCard(rawatJalan, false);
  const p0 = calculateRoomChecklistProgress(rawatJalan, emptyEntries);
  assert.equal(p0.completedTasks, 0);
  assert.equal(p0.totalTasks, 7);
  assert.equal(p0.percentage, 0);

  const filledEntries = createDefaultTaskEntriesForCard(
    rawatJalan,
    true,
    '/assets/aistudio/supervisi-temuan/temuan-1.png'
  );
  const pFull = calculateRoomChecklistProgress(rawatJalan, filledEntries);
  assert.equal(pFull.completedTasks, 7);
  assert.equal(pFull.totalTasks, 7);
  assert.equal(pFull.percentage, 100);
});

test('calculateSupervisiScores and initial records are valid', () => {
  const res = calculateSupervisiScores({
    skorKerapihan: 4,
    skorProsedur: 4,
    skorAlatDanBahan: 4,
    skorK3: 4,
    skorSikapDanPerilaku: 4,
  });
  assert.equal(res.totalSkor, 20);
  assert.equal(res.kategori, 'SANGAT BAIK');

  const roomRecords = createInitialRoomChecklistRecords();
  assert.ok(roomRecords.length >= 16);

  const auditRecords = createInitialSupervisiAuditRecords();
  assert.ok(auditRecords.length >= 5);
  assert.equal(auditRecords[0].cardId, 'SUPERVISI');
});

test('parseTimestampToParts, buildTimestampFromParts, and getHariFromDateInput work seamlessly', () => {
  const parts = parseTimestampToParts('14/04/2026 07:12:56');
  assert.deepEqual(parts, {
    dateInput: '2026-04-14',
    timeInput: '07:12:56',
  });

  const rebuilt = buildTimestampFromParts('2026-03-04', '10:45:30');
  assert.equal(rebuilt, '04/03/2026 10:45:30');

  const rebuiltShortTime = buildTimestampFromParts('2026-03-04', '10:45');
  assert.equal(rebuiltShortTime, '04/03/2026 10:45:00');

  assert.equal(getHariFromDateInput('2026-03-02'), 'SENIN');
  assert.equal(getHariFromDateInput('2026-03-03'), 'SELASA');
  assert.equal(getHariFromDateInput('2026-03-04'), 'RABU');
  assert.equal(getHariFromDateInput('2026-11-01'), 'MINGGU');
});

test('scaleCanvasCoordinates maps CSS layout coordinates to internal canvas bitmap space accurately', () => {
  // Suppose a 600x208 canvas is rendered at 300x104 CSS pixels on mobile
  const pt = scaleCanvasCoordinates(
    170,
    72,
    { left: 20, top: 20, width: 300, height: 104 },
    600,
    208
  );
  assert.equal(pt.x, 300);
  assert.equal(pt.y, 104);
});

test('addPetugasName, editPetugasName, and deletePetugasName manage customizable officer list cleanly without dummy names', () => {
  assert.ok(!DEFAULT_PETUGAS_LIST.includes('HENDRA GUNAWAN'));
  assert.ok(!DEFAULT_PETUGAS_LIST.includes('AHMAD FAUZI'));
  assert.ok(!DEFAULT_PETUGAS_LIST.includes('DEDI SUPRIADI'));

  const initial = [...DEFAULT_PETUGAS_LIST];
  const withAdded = addPetugasName(initial, '  BUDI SANTOSO  ');
  assert.equal(withAdded.length, initial.length + 1);
  assert.equal(withAdded[withAdded.length - 1], 'BUDI SANTOSO');

  // Duplicate case-insensitive add should be ignored
  const duplicateAdd = addPetugasName(withAdded, 'budi santoso');
  assert.equal(duplicateAdd.length, withAdded.length);

  // Edit existing officer name
  const withEdited = editPetugasName(withAdded, 'BUDI SANTOSO', 'BUDI RAHARJO');
  assert.ok(withEdited.includes('BUDI RAHARJO'));
  assert.ok(!withEdited.includes('BUDI SANTOSO'));

  // Delete officer name
  const withDeleted = deletePetugasName(withEdited, 'BUDI RAHARJO');
  assert.ok(!withDeleted.includes('BUDI RAHARJO'));
  assert.equal(withDeleted.length, initial.length);
});

test('deriveTemuanWorkflowStatus, updateSupervisiFindingFollowUp, and buildAuditFindingFromRoomChecklist integrate Supervisi with Daftar Temuan', () => {
  const initialAudit = createInitialSupervisiAuditRecords();
  // First record has prosesPerbaikan, dokumentasiPerbaikanUrl, and tandaTanganPerbaikanUrl
  assert.equal(
    deriveTemuanWorkflowStatus(initialAudit[0]),
    'Selesai Terverifikasi'
  );
  // 6th record has prosesPerbaikan only
  assert.equal(deriveTemuanWorkflowStatus(initialAudit[5]), 'Dalam Proses');
  // 7th record is brand new finding
  assert.equal(deriveTemuanWorkflowStatus(initialAudit[6]), 'Temuan Baru');

  const updated = updateSupervisiFindingFollowUp(initialAudit, 'sup-feb-7', {
    prosesPerbaikan: 'Atap kaca ranap dan plafon telah dibersihkan',
    tanggalPerbaikan: '05/03/2026 11:00:00',
    dokumentasiPerbaikanUrl: '/assets/aistudio/supervisi-temuan/temuan-2.png',
    tandaTanganPerbaikanUrl: '/assets/aistudio/supervisi-temuan/ttd-2.png',
  });
  const target = updated.find((r) => r.id === 'sup-feb-7')!;
  assert.equal(deriveTemuanWorkflowStatus(target), 'Selesai Terverifikasi');
  assert.equal(target.tanggalPerbaikan, '05/03/2026 11:00:00');

  const igdCard = SUPERVISI_CARDS.find((c) => c.id === 'IGD')!;
  const rawEntries = createDefaultTaskEntriesForCard(igdCard, false);
  rawEntries.wc = { status: 'TIDAK', photos: [''] };
  const roomRec = createInitialRoomChecklistRecords()[0];
  const syncedFinding = buildAuditFindingFromRoomChecklist(
    igdCard,
    roomRec,
    'Kamar mandi pasien perlu desinfeksi ulang',
    rawEntries
  );
  assert.ok(syncedFinding !== null);
  assert.equal(syncedFinding!.unit, 'IGD');
  assert.ok(
    syncedFinding!.temuan.includes('Kamar mandi pasien perlu desinfeksi ulang')
  );
});

test('multi-choice Supervisi question helpers support selecting, toggling, and preserving options containing commas', () => {
  const opt1 = CRITERIA_QUICK_OPTIONS.kerapihan[0]; // contains commas
  const opt2 = CRITERIA_QUICK_OPTIONS.kerapihan[2];

  let current = '';
  current = toggleMultiChoiceOption(current, opt1);
  assert.equal(isMultiChoiceOptionSelected(current, opt1), true);
  assert.equal(isMultiChoiceOptionSelected(current, opt2), false);

  current = toggleMultiChoiceOption(current, opt2);
  const parsed = parseMultiChoiceValue(current);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0], opt1);
  assert.equal(parsed[1], opt2);

  // Toggling opt1 again removes it while keeping opt2 intact
  current = toggleMultiChoiceOption(current, opt1);
  assert.equal(isMultiChoiceOptionSelected(current, opt1), false);
  assert.equal(isMultiChoiceOptionSelected(current, opt2), true);
  assert.deepEqual(parseMultiChoiceValue(current), [opt2]);

  // Select all options
  const all = selectAllMultiChoiceOptions(current, CRITERIA_QUICK_OPTIONS.kerapihan);
  assert.equal(
    parseMultiChoiceValue(all).length,
    CRITERIA_QUICK_OPTIONS.kerapihan.length
  );
  assert.equal(formatMultiChoiceValue([opt1, opt1, opt2]), `${opt1}; ${opt2}`);
});




