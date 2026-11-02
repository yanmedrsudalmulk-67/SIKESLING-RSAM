import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compileAnnualKeslingReport,
  generateAnnualReportWordF4Html,
} from './annual-report-kesling';
import { createDefaultMonitoringDataset } from './dashboard-monitoring-trends';

test('compileAnnualKeslingReport compiles baseline 2025/2026 monitoring datasets accurately', () => {
  const dataset = createDefaultMonitoringDataset(2025, []);
  const report = compileAnnualKeslingReport({
    year: 2025,
    institutionName: 'UOBK RSUD Al-Mulk Kota Sukabumi',
    waterRows: dataset.waterRows,
    airItems: dataset.airItems,
    wastewaterRows: dataset.wastewaterRows,
    solidWasteRows: dataset.solidWasteRows,
    vectorFindings: dataset.vectorFindings,
    vectorUnitCount: dataset.vectorUnitCount,
    foodRows: dataset.foodRows,
    activities: [],
    supervisions: [],
    findings: [],
  });

  // Verify F4 Folio dimensions (215.9mm x 330.2mm)
  assert.equal(report.f4PageDimensionsMm.width, 215.9);
  assert.equal(report.f4PageDimensionsMm.height, 330.2);

  // Verify Table 5 Solid Waste B3 matches the PDF totals (2965 Padat, 987 Tajam, 85.64 Obat, 3952 Total, 329 avg)
  assert.equal(report.solidWaste.totalPadat, 2965);
  assert.equal(report.solidWaste.totalTajam, 987);
  assert.equal(report.solidWaste.totalObat, 85.64);
  assert.equal(report.solidWaste.grandTotal, 3952);
  assert.equal(report.solidWaste.monthlyAverage, 329);
  assert.equal(report.solidWaste.padatPct, 75);
  assert.equal(report.solidWaste.tajamPct, 25);

  // Verify Vector Table 6 baseline matches PDF (ABJ 87.5%, Lalat 95%, Kecoa 83%, Tikus 97%)
  const abj = report.vector.bars.find((b) => b.key === 'jentik');
  const kecoa = report.vector.bars.find((b) => b.key === 'kecoa');
  assert.equal(abj?.value, 87.5);
  assert.equal(kecoa?.value, 83);

  // Verify Lampiran 2 Logbook has 12 monthly batches and manifest numbers
  assert.equal(report.lampiran2Logbook.length, 12);
  assert.ok(report.lampiran2Logbook[0].manifestNumbers.includes('QR1112628'));
  assert.equal(report.lampiran2Logbook[0].totalAll, 396);

  // Verify Water Tabel 1 (16 rows: 2 Sumur 1 + 14 Artesis) and Tabel 2 (28 rows: 15 on Page 12 + 13 on Page 13)
  assert.equal(report.water.tabel1AirBersih.length, 16);
  assert.equal(report.water.tabel1AirBersih[2].monthlyValues[3], '<9/100 ml'); // Artesis Coliform April
  assert.equal(report.water.tabel1AirBersih[2].monthlyValues[9], ''); // Artesis Coliform Oktober (gray cell)
  assert.equal(report.water.tabel1AirBersih[2].monthlyValues[11], '<43/100 ml'); // Artesis Coliform Desember
  assert.equal(report.water.tabel2AirRo.length, 28);
  assert.equal(report.water.tabel2AirRo[0].monthlyValues[5], '0 /100 ml'); // RO Poli Gigi Coliform Juni
  assert.equal(report.water.tabel2AirRo[0].monthlyValues[8], ''); // RO Poli Gigi Coliform September (gray cell)
  assert.equal(report.water.tabel2AirRo[5].indicator, 'bau');
  assert.equal(report.water.tabel2AirRo[14].sourceLabel, 'RO LAB');
  assert.equal(report.water.tabel2AirRo[14].indicator, 'Total Coliform');
  assert.equal(report.water.tabel2AirRo[14].monthlyValues[6], '<9/100 ml'); // RO Lab Coliform Juli
  assert.equal(report.water.tabel2AirRo[14].monthlyValues[11], '<7/100 ml'); // RO Lab Coliform Desember
  assert.equal(report.water.tabel2AirRo[15].monthlyValues[3], '<4/100 ml'); // RO Lab E.Coli April
  assert.equal(report.water.tabel2AirRo[19].normalValue, '');
});

test('compileAnnualKeslingReport updates dynamically in realtime when monitoring or findings data changes', () => {
  const dataset = createDefaultMonitoringDataset(2025, []);

  // Simulate user updating January solid waste in Menu Monitoring
  const updatedSolidWaste = dataset.solidWasteRows.map((row) =>
    row.no === 1
      ? { ...row, limbahPadat: 400, limbahTajam: 100, totalOverride: 500 }
      : row
  );

  // Simulate user adding a finding from Supervisi -> Tindak Lanjut
  const report = compileAnnualKeslingReport({
    year: 2025,
    institutionName: 'UOBK RSUD Al-Mulk Kota Sukabumi',
    waterRows: dataset.waterRows,
    airItems: dataset.airItems,
    wastewaterRows: dataset.wastewaterRows,
    solidWasteRows: updatedSolidWaste,
    vectorFindings: dataset.vectorFindings,
    vectorUnitCount: dataset.vectorUnitCount,
    foodRows: dataset.foodRows,
    activities: [],
    supervisions: [],
    findings: [
      {
        id: 'FND-001',
        code: 'TMN-001',
        date: '2025-12-20',
        location: 'Ruang IGD',
        category: 'Sanitasi Ruang',
        description: 'Wastafel IGD membutuhkan perbaikan keran',
        recommendation: 'Koordinasi IPSRS untuk penggantian keran wastafel',
        picName: 'Fitria Wulandari',
        targetDate: '2025-12-22',
        priority: 'Tinggi',
        status: 'Dalam Proses',
        createdAt: '2025-12-20T08:00:00Z',
        updatedAt: '2025-12-20T09:00:00Z',
      },
    ],
  });

  // Solid waste total should increase by +104 kg (from 3952 to 4056)
  assert.equal(report.solidWaste.grandTotal, 4056);
  assert.equal(report.lampiran2Logbook[0].totalAll, 500);

  // Evaluation Table 19 should include the 6 PDF rows + 1 dynamic finding row = 7 rows
  assert.equal(report.evaluasi.rows.length, 7);
  assert.ok(report.evaluasi.rows[6].masalahKesling.includes('TMN-001'));
});

test('generateAnnualReportWordF4Html generates valid Word HTML with F4 paper specification', () => {
  const dataset = createDefaultMonitoringDataset(2025, []);
  const report = compileAnnualKeslingReport({
    year: 2025,
    institutionName: 'UOBK RSUD Al-Mulk Kota Sukabumi',
    waterRows: dataset.waterRows,
    airItems: dataset.airItems,
    wastewaterRows: dataset.wastewaterRows,
    solidWasteRows: dataset.solidWasteRows,
    vectorFindings: dataset.vectorFindings,
    vectorUnitCount: dataset.vectorUnitCount,
    foodRows: dataset.foodRows,
    activities: [],
    supervisions: [],
    findings: [],
  });

  const docHtml = generateAnnualReportWordF4Html(report);
  assert.ok(docHtml.includes('size: 21.59cm 33.02cm'));
  assert.ok(docHtml.includes('xmlns:w="urn:schemas-microsoft-com:office:word"'));
  assert.ok(docHtml.includes('KATA PENGANTAR'));
  assert.ok(docHtml.includes('Peraturan Presiden Nomor 59 Tahun 2024'));
  assert.ok(docHtml.includes('Tabel 5. Jumlah Limbah B3 Padat'));
  assert.ok(docHtml.includes('Tabel 19. Identifikasi Masalah dan Tindak Lanjut Kesehatan Lingkungan'));
  assert.ok(docHtml.includes('LAMPIRAN 2: LOG BOOK LIMBAH MEDIS'));
});
