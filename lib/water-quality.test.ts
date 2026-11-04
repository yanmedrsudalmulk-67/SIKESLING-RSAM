import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WATER_SOURCES,
  WATER_INDICATORS,
  WATER_MICROBIOLOGY_INDICATORS,
  JUNE_DECEMBER_SOURCE_PRESETS,
  createInitialWaterQualityData,
  ensureCompleteWaterQualityRows,
  buildMonthlyWaterChartData,
  buildSourceComplianceBreakdown,
  WaterQualityRow,
} from './water-quality';

test('WATER_SOURCES places Air Minum directly below Air RO Poli Gigi in title case', () => {
  assert.deepEqual(WATER_SOURCES, [
    'Artesis',
    'Air RO Lab',
    'Air RO Poli Gigi',
    'Air Minum',
  ]);
});

test('createInitialWaterQualityData generates Air RO Poli Gigi and Air Minum for standard months and Juni/Desember', () => {
  const rows = createInitialWaterQualityData(2026);
  // 10 standard months * 4 sources * 2 indicators = 80
  // 2 full months (Juni, Desember) * 4 sources * 13 indicators = 104
  // Total = 184 rows
  assert.equal(rows.length, 184);

  // Check standard month (Januari = 1)
  const janRows = rows.filter((r) => r.monthIndex === 1);
  assert.equal(janRows.length, 8);
  const janAirMinum = janRows.filter((r) => r.sourceName === 'Air Minum');
  assert.deepEqual(
    janAirMinum.map((r) => r.indicator),
    WATER_MICROBIOLOGY_INDICATORS
  );
  assert.ok(janAirMinum.every((r) => r.normalValue === '0/100 ml'));

  // Check Juni (6) and Desember (12)
  for (const monthIdx of [6, 12]) {
    const fullMonthRows = rows.filter((r) => r.monthIndex === monthIdx);
    assert.equal(fullMonthRows.length, 52);
    const airMinumFull = fullMonthRows.filter((r) => r.sourceName === 'Air Minum');
    assert.equal(airMinumFull.length, 13);
    assert.deepEqual(
      airMinumFull.map((r) => r.indicator),
      WATER_INDICATORS
    );
    // Verify normal values match Air RO Poli Gigi
    const roPoliGigiPresets = JUNE_DECEMBER_SOURCE_PRESETS['Air RO Poli Gigi'];
    airMinumFull.forEach((row, idx) => {
      assert.equal(row.normalValue, roPoliGigiPresets[idx].normalValue);
    });
  }
});

test('ensureCompleteWaterQualityRows normalizes legacy uppercase AIR RO POLI GIGI and AIR MINUM while preserving edits', () => {
  const fullDefaults = createInitialWaterQualityData(2026);
  // Simulate legacy rows stored with uppercase 'AIR RO POLI GIGI' and a custom edit on E.Coli in Januari
  const legacyRows = fullDefaults
    .filter((r) => r.sourceName !== 'Air Minum')
    .map((r) => {
      const legacySourceName =
        r.sourceName === 'Air RO Poli Gigi'
          ? ('AIR RO POLI GIGI' as unknown as WaterQualityRow['sourceName'])
          : r.sourceName;
      if (
        r.monthIndex === 1 &&
        r.sourceName === 'Air RO Poli Gigi' &&
        r.indicator === 'E.Coli'
      ) {
        return {
          ...r,
          sourceName: legacySourceName,
          resultValue: 2,
          resultDisplay: '2',
          status: 'TMS' as const,
        };
      }
      return { ...r, sourceName: legacySourceName };
    });

  const upgraded = ensureCompleteWaterQualityRows(legacyRows, 2026);
  assert.equal(upgraded.length, 184);

  // Verify custom edit on legacy uppercase 'AIR RO POLI GIGI' was preserved under 'Air RO Poli Gigi'
  const editedRow = upgraded.find(
    (r) =>
      r.monthIndex === 1 &&
      r.sourceName === 'Air RO Poli Gigi' &&
      r.indicator === 'E.Coli'
  );
  assert.equal(editedRow?.resultValue, 2);
  assert.equal(editedRow?.status, 'TMS');

  // Verify Air Minum rows exist in Januari, Juni, and Desember
  assert.equal(
    upgraded.filter((r) => r.monthIndex === 1 && r.sourceName === 'Air Minum').length,
    2
  );
  assert.equal(
    upgraded.filter((r) => r.monthIndex === 6 && r.sourceName === 'Air Minum').length,
    13
  );
  assert.equal(
    upgraded.filter((r) => r.monthIndex === 12 && r.sourceName === 'Air Minum').length,
    13
  );

  // Verify chart & breakdown include Air RO Poli Gigi and Air Minum
  const chart = buildMonthlyWaterChartData(upgraded);
  assert.equal(chart.length, 12);
  assert.equal(typeof chart[0].airMinumColiform, 'number');

  const breakdown = buildSourceComplianceBreakdown(upgraded);
  assert.equal(breakdown.length, 4);
  assert.equal(breakdown[2].sourceName, 'Air RO Poli Gigi');
  assert.equal(breakdown[3].sourceName, 'Air Minum');
});
