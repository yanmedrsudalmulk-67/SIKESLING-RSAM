import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPERVISI_CARDS,
  calculateSupervisiScores,
  createInitialSupervisiAuditRecords,
} from './supervisi-hub.ts';

test('SUPERVISI_CARDS defines all 10 unit cards matching Gambar 1', () => {
  assert.equal(SUPERVISI_CARDS.length, 10);
  assert.deepEqual(
    SUPERVISI_CARDS.map((c) => c.title),
    [
      'RAWAT JALAN',
      'IGD',
      'RANAP ICU DAN IBS',
      'RANAP USMAN',
      'RANAP AISYAH',
      'RANAP FATIMAH',
      'RANAP KHADIJAH',
      'MANAJEMEN',
      'HALAMAN',
      'SUPERVISI',
    ]
  );
});

test('calculateSupervisiScores returns null/empty when no scores are selected, and computes sum + kategori when selected', () => {
  const empty = calculateSupervisiScores({
    skorKerapihan: null,
    skorProsedur: null,
    skorAlatDanBahan: null,
    skorK3: null,
    skorSikapDanPerilaku: null,
  });
  assert.equal(empty.totalSkor, null);
  assert.equal(empty.kategori, '');

  const perfect = calculateSupervisiScores({
    skorKerapihan: 4,
    skorProsedur: 4,
    skorAlatDanBahan: 4,
    skorK3: 4,
    skorSikapDanPerilaku: 4,
  });
  assert.equal(perfect.totalSkor, 20);
  assert.equal(perfect.kategori, 'SANGAT BAIK');

  const good = calculateSupervisiScores({
    skorKerapihan: 3,
    skorProsedur: 3,
    skorAlatDanBahan: 3,
    skorK3: 3,
    skorSikapDanPerilaku: 3,
  });
  assert.equal(good.totalSkor, 15);
  assert.equal(good.kategori, 'BAIK');
});

test('createInitialSupervisiAuditRecords contains the 5 Februari 2026 SUPERVISI findings from Gambar 5 plus room records', () => {
  const records = createInitialSupervisiAuditRecords();
  const supRecords = records.filter((r) => r.cardId === 'SUPERVISI');
  assert.equal(supRecords.length, 5);
  assert.ok(supRecords[0].temuan.includes('lubang untuk paralon'));
  assert.ok(supRecords[1].temuan.includes('dinding CSSD berjamur'));
  assert.ok(supRecords[2].temuan.includes('dinding CSSD lembab'));
  assert.ok(supRecords[3].temuan.includes('lorong antar poli'));
  assert.ok(supRecords[4].temuan.includes('dinding bawah wastafel berjamur hitam'));
});
