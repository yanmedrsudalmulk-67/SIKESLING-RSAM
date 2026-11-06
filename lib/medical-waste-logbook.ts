import { REAL_MEDICAL_WASTE_LOGBOOK_2026 } from './medical-waste-excel-data';

export const DEFAULT_MEDICAL_WASTE_SOURCES: readonly string[] = [
  'IGD',
  'KELAS 1 USMAN',
  'R. Rawat Dewasa (Gabungan)',
  'R. Rawat Anak',
  'FARMASI',
  'R.Isolasi',
  'Ruang ICU',
  'Ruang OK',
  'LAB',
  'Ruang Poli',
  'Kebidanan',
] as const;

export interface MedicalWasteColumnLabels {
  no: string;
  sumberLimbah: string;
  beratTajam: string;
  beratPadat: string;
  tanggalMasuk: string;
  maksPenyimpanan: string;
  tanggalKeluar: string;
  noManifest: string;
}

export const DEFAULT_COLUMN_LABELS: MedicalWasteColumnLabels = {
  no: 'No',
  sumberLimbah: 'Sumber Limbah',
  beratTajam: 'Berat Limbah Tajam (kg)',
  beratPadat: 'Berat Limbah Padat (kg)',
  tanggalMasuk: 'Tanggal Masuk Limbah',
  maksPenyimpanan: 'Maks Penyimpanan suhu dibawah 0°C',
  tanggalKeluar: 'Tanggal Keluar Limbah',
  noManifest: 'No.Manifest',
};

export interface MedicalWasteCustomColumn {
  id: string;
  label: string;
}

export interface MedicalWasteLogRow {
  id: string;
  batchId: string;
  no: number;
  sumberLimbah: string;
  beratTajamKg: number | null;
  beratPadatKg: number | null;
  tanggalMasuk: string; // YYYY-MM-DD
  maksPenyimpananSuhu: string; // e.g. '✓'
  tanggalKeluar: string; // YYYY-MM-DD
  noManifest: string;
  customValues?: Record<string, string>;
}

export interface MedicalWasteBatchGroup {
  batchId: string;
  tanggalMasuk: string;
  tanggalKeluar: string;
  noManifest: string;
  rows: MedicalWasteLogRow[];
  totalTajamKg: number;
  totalPadatKg: number;
  totalCombinedKg: number;
}

export interface MedicalWasteLogbookAnalysisResult {
  activeYear: number;
  totalBatches: number;
  totalRows: number;
  totalTajamKg: number;
  totalPadatKg: number;
  grandTotalKg: number;
  padatPercentage: number;
  tajamPercentage: number;
  suhuCompliancePct: number;
  manifestFilledCount: number;
  topSourceRoom: { room: string; totalKg: number } | null;
  analisaParagraph: string;
  rekomendasiList: string[];
  tindakLanjutList: string[];
}

/**
 * Returns today's local date in YYYY-MM-DD format.
 */
export function getRealtimeTodayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) to DD/MM/YYYY as shown in the official logbook table.
 */
export function formatIsoToDisplayDate(isoDate: string): string {
  if (!isoDate) return '-';
  const trimmed = isoDate.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return trimmed;
}

/**
 * Converts DD/MM/YYYY or YYYY-MM-DD into standard YYYY-MM-DD for HTML5 calendar date inputs.
 */
export function parseDisplayDateToIso(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }
  return trimmed;
}

/**
 * Formats a numeric weight in kg with Indonesian comma decimals (e.g., 3 -> "3,00").
 * Returns empty string for null/undefined unless showZeroWhenEmpty is true.
 */
export function formatWeightKgId(
  value: number | null | undefined,
  showZeroWhenEmpty = false
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return showZeroWhenEmpty ? '0,00' : '';
  }
  return value.toFixed(2).replace('.', ',');
}

/**
 * Parses user-entered weight string (supports both "3,00" and "3.00").
 * Empty string returns null so the cell stays blank like the reference table.
 */
export function parseWeightInput(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Number(parsed.toFixed(2));
}

export function calculateBatchSubtotals(rows: MedicalWasteLogRow[]): {
  totalTajamKg: number;
  totalPadatKg: number;
  totalCombinedKg: number;
} {
  let tajam = 0;
  let padat = 0;
  for (const row of rows) {
    if (typeof row.beratTajamKg === 'number' && Number.isFinite(row.beratTajamKg)) {
      tajam += row.beratTajamKg;
    }
    if (typeof row.beratPadatKg === 'number' && Number.isFinite(row.beratPadatKg)) {
      padat += row.beratPadatKg;
    }
  }
  const totalTajamKg = Number(tajam.toFixed(2));
  const totalPadatKg = Number(padat.toFixed(2));
  const totalCombinedKg = Number((totalTajamKg + totalPadatKg).toFixed(2));
  return { totalTajamKg, totalPadatKg, totalCombinedKg };
}

export function groupLogbookRowsByBatch(
  rows: MedicalWasteLogRow[]
): MedicalWasteBatchGroup[] {
  const map = new Map<string, MedicalWasteLogRow[]>();
  const order: string[] = [];

  for (const row of rows) {
    const key = row.batchId || `batch-${row.tanggalMasuk || 'default'}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(row);
  }

  return order.map((batchId) => {
    const groupRows = map.get(batchId)!.map((r, idx) => ({
      ...r,
      no: idx + 1,
    }));
    const first = groupRows[0];
    const { totalTajamKg, totalPadatKg, totalCombinedKg } =
      calculateBatchSubtotals(groupRows);

    return {
      batchId,
      tanggalMasuk: first?.tanggalMasuk || getRealtimeTodayIso(),
      tanggalKeluar: first?.tanggalKeluar || getRealtimeTodayIso(),
      noManifest: first?.noManifest || '',
      rows: groupRows,
      totalTajamKg,
      totalPadatKg,
      totalCombinedKg,
    };
  });
}

export function summarizeBySourceRoom(rows: MedicalWasteLogRow[]): {
  room: string;
  tajamKg: number;
  padatKg: number;
  totalKg: number;
}[] {
  const map = new Map<string, { tajamKg: number; padatKg: number }>();

  for (const r of rows) {
    const name = r.sumberLimbah.trim() || 'Lainnya';
    const current = map.get(name) || { tajamKg: 0, padatKg: 0 };
    current.tajamKg += r.beratTajamKg || 0;
    current.padatKg += r.beratPadatKg || 0;
    map.set(name, current);
  }

  return Array.from(map.entries()).map(([room, val]) => {
    const tajamKg = Number(val.tajamKg.toFixed(2));
    const padatKg = Number(val.padatKg.toFixed(2));
    return {
      room,
      tajamKg,
      padatKg,
      totalKg: Number((tajamKg + padatKg).toFixed(2)),
    };
  });
}

/**
 * Creates the initial realtime Log Book dataset.
 * Defaults to the official Year 2026 data extracted from LOOG_BOOK_LIMBAH_2026.xlsx
 * (Januari s.d. Oktober 2026). If a custom date string is provided, creates a single batch.
 */
export function createRealtimeInitialMedicalWasteLogbook(
  customIso?: string
): MedicalWasteLogRow[] {
  if (!customIso && REAL_MEDICAL_WASTE_LOGBOOK_2026 && REAL_MEDICAL_WASTE_LOGBOOK_2026.length > 0) {
    return REAL_MEDICAL_WASTE_LOGBOOK_2026;
  }
  const todayIso = customIso || getRealtimeTodayIso();
  const batchId = `batch-${todayIso}`;
  return DEFAULT_MEDICAL_WASTE_SOURCES.map((room, idx) => ({
    id: `log-${todayIso}-${idx + 1}`,
    batchId,
    no: idx + 1,
    sumberLimbah: room,
    beratTajamKg: null,
    beratPadatKg: null,
    tanggalMasuk: todayIso,
    maksPenyimpananSuhu: '✓',
    tanggalKeluar: todayIso,
    noManifest: '',
    customValues: {},
  }));
}

/**
 * Alias kept for backward compatibility in tests/imports.
 */
export function createInitialMedicalWasteLogbook2025(
  todayIso: string = getRealtimeTodayIso()
): MedicalWasteLogRow[] {
  return createRealtimeInitialMedicalWasteLogbook(todayIso);
}

/**
 * Generates automatic Analysis, Recommendations, and Follow-up Plan (RTL)
 * based on the currently displayed Log Book Limbah Medis rows.
 */
export function generateMedicalWasteLogbookAnalysis(
  rows: MedicalWasteLogRow[]
): MedicalWasteLogbookAnalysisResult {
  const groups = groupLogbookRowsByBatch(rows);
  const { totalTajamKg, totalPadatKg, totalCombinedKg } =
    calculateBatchSubtotals(rows);
  const roomSummaries = summarizeBySourceRoom(rows);

  const firstDate = rows[0]?.tanggalMasuk || getRealtimeTodayIso();
  const parsedYear = Number(firstDate.slice(0, 4));
  const activeYear = Number.isFinite(parsedYear) && parsedYear > 2000
    ? parsedYear
    : new Date().getFullYear();

  const padatPercentage =
    totalCombinedKg > 0
      ? Number(((totalPadatKg / totalCombinedKg) * 100).toFixed(1))
      : 0;
  const tajamPercentage =
    totalCombinedKg > 0
      ? Number(((totalTajamKg / totalCombinedKg) * 100).toFixed(1))
      : 0;

  const suhuCompliantCount = rows.filter(
    (r) => r.maksPenyimpananSuhu.trim() === '✓'
  ).length;
  const suhuCompliancePct =
    rows.length > 0
      ? Math.round((suhuCompliantCount / rows.length) * 100)
      : 100;

  const manifestFilledCount = rows.filter(
    (r) => r.noManifest.trim().length > 0
  ).length;
  const uniqueManifests = Array.from(
    new Set(rows.map((r) => r.noManifest.trim()).filter(Boolean))
  );

  const sortedRooms = [...roomSummaries].sort((a, b) => b.totalKg - a.totalKg);
  const topSourceRoom =
    sortedRooms.length > 0 && sortedRooms[0].totalKg > 0
      ? { room: sortedRooms[0].room, totalKg: sortedRooms[0].totalKg }
      : null;

  const dateRangeText =
    groups.length === 1
      ? `tanggal ${formatIsoToDisplayDate(groups[0].tanggalMasuk)}`
      : `${groups.length} kelompok tanggal (${formatIsoToDisplayDate(
          groups[0]?.tanggalMasuk || firstDate
        )} s/d ${formatIsoToDisplayDate(
          groups[groups.length - 1]?.tanggalMasuk || firstDate
        )})`;

  const analisaParagraph =
    totalCombinedKg > 0
      ? `Berdasarkan pencatatan Log Book Limbah Medis di UOBK RSUD Al-Mulk Kota Sukabumi Tahun ${activeYear} pada ${dateRangeText} (${rows.length} baris sumber ruangan), total timbulan limbah medis tercatat sebesar ${formatWeightKgId(
          totalCombinedKg,
          true
        )} kg yang terdiri dari Limbah Padat Infeksius sebesar ${formatWeightKgId(
          totalPadatKg,
          true
        )} kg (${String(padatPercentage).replace('.', ',')}%) dan Limbah Benda Tajam sebesar ${formatWeightKgId(
          totalTajamKg,
          true
        )} kg (${String(tajamPercentage).replace('.', ',')}%). ${
          topSourceRoom
            ? `Sumber penghasil limbah medis tertinggi berasal dari ruangan ${
                topSourceRoom.room
              } dengan total timbulan ${formatWeightKgId(
                topSourceRoom.totalKg,
                true
              )} kg. `
            : ''
        }Kepatuhan pemenuhan standar penyimpanan dingin pada suhu di bawah 0°C mencapai ${suhuCompliancePct}% (${suhuCompliantCount} dari ${
          rows.length
        } baris pencatatan), serta tercatat ${
          uniqueManifests.length > 0
            ? `${uniqueManifests.length} nomor manifest pengangkutan aktif (${uniqueManifests.join(
                ', '
              )})`
            : 'belum terdapat nomor manifest pengangkutan yang diinput pada periode ini'
        } sesuai ketentuan Permenkes No. 2 Tahun 2023 dan PermenLHK No. P.56/Menlhk-Setjen/2015.`
      : `Berdasarkan tabel Log Book Limbah Medis UOBK RSUD Al-Mulk Kota Sukabumi Tahun ${activeYear} pada ${dateRangeText} (${rows.length} baris sumber ruangan), daftar sumber ruangan penghasil limbah medis telah siap digunakan untuk pencatatan harian secara realtime namun belum terdapat input berat timbulan limbah (0,00 kg). Kepatuhan kesiapan penyimpanan pada suhu di bawah 0°C tercatat sebesar ${suhuCompliancePct}%. Silakan klik langsung pada sel Berat Limbah Tajam (kg), Berat Limbah Padat (kg), Tanggal Masuk/Keluar, atau No.Manifest untuk mencatat timbulan harian dan klik tombol Simpan di kanan bawah.`;

  const rekomendasiList: string[] = [
    topSourceRoom
      ? `Mengoptimalkan pengawasan pemilahan limbah medis padat dan benda tajam (safety box) terutama pada ruangan dengan timbulan tertinggi yaitu ${topSourceRoom.room} (${formatWeightKgId(
          topSourceRoom.totalKg,
          true
        )} kg) agar tidak terjadi pencampuran limbah domestik ke dalam kantong kuning.`
      : 'Memastikan seluruh 11 ruangan penghasil limbah medis melakukan penimbangan harian secara tertib sebelum limbah dimasukkan ke dalam Tempat Penyimpanan Sementara (TPS) B3.',
    suhuCompliancePct < 100
      ? `Melakukan pemeriksaan suhu cold storage / freezer TPS B3 karena terdapat ${
          rows.length - suhuCompliantCount
        } baris pencatatan yang belum memenuhi indikator penyimpanan suhu di bawah 0°C.`
      : 'Mempertahankan kestabilan suhu fasilitas cold storage TPS B3 di bawah 0°C (100% memenuhi syarat) untuk mencegah pembusukan dan perkembangbiakan mikroorganisme patogen apabila limbah disimpan lebih dari 2×24 jam.',
    manifestFilledCount < rows.length
      ? `Melengkapi pencatatan Nomor Manifest elektronik (Festronik) pada ${
          rows.length - manifestFilledCount
        } baris catatan yang masih kosong setiap kali dilakukan serah terima pengangkutan limbah medis dengan pihak ketiga berizin.`
      : `Mempertahankan ketertiban dokumentasi Nomor Manifest (${uniqueManifests.join(
          ', '
        )}) dan kesesuaian antara Tanggal Masuk serta Tanggal Keluar Limbah di TPS B3.`,
    'Memastikan timbangan digital di TPS Limbah B3 terkalibrasi secara berkala serta petugas pengangkut internal menggunakan Alat Pelindung Diri (APD) lengkap saat penimbangan.',
  ];

  const tindakLanjutList: string[] = [
    `Melaksanakan verifikasi harian terhadap pencatatan berat Limbah Tajam dan Limbah Padat dari ${roomSummaries.length} unit/ruangan penghasil limbah medis serta menyimpannya ke database terintegrasi SIKRESMI.`,
    topSourceRoom
      ? `Melakukan supervisi lapangan ke ${topSourceRoom.room} dan unit pelayanan kritis lainnya guna memastikan penggantian safety box dilakukan segera setelah terisi 3/4 penuh.`
      : 'Melakukan supervisi lapangan rutin ke seluruh unit pelayanan (IGD, Rawat Inap, ICU, OK, Laboratorium, Farmasi, Poliklinik, dan Kebidanan) terkait kepatuhan pemilahan limbah di sumber.',
    'Melakukan rekonsiliasi data timbulan harian pada Log Book Limbah Medis dengan dokumen manifes pengangkutan pihak ketiga berizin setiap minggu dan akhir bulan.',
    `Menyusun rekapitulasi neraca timbulan Limbah Medis Tahun ${activeYear} sebagai bahan evaluasi manajemen rumah sakit dan pelaporan berkala ke Dinas Lingkungan Hidup serta Dinas Kesehatan.`,
  ];

  return {
    activeYear,
    totalBatches: groups.length,
    totalRows: rows.length,
    totalTajamKg,
    totalPadatKg,
    grandTotalKg: totalCombinedKg,
    padatPercentage,
    tajamPercentage,
    suhuCompliancePct,
    manifestFilledCount,
    topSourceRoom,
    analisaParagraph,
    rekomendasiList,
    tindakLanjutList,
  };
}
