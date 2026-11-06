import rawRows from './medical-waste-excel-data.json';
import type { MedicalWasteLogRow } from './medical-waste-logbook';

/**
 * Real Medical Waste Logbook data for Year 2026 extracted directly from
 * LOOG_BOOK_LIMBAH_2026.xlsx (Bulan Januari s.d. Oktober 2026).
 *
 * Totals per Excel:
 * - Jan: 272 kg (Padat: 214 kg, Tajam: 58 kg)
 * - Feb: 252 kg (Padat: 194 kg, Tajam: 58 kg)
 * - Mar: 285 kg (Padat: 208 kg, Tajam: 77 kg)
 * - Apr: 381 kg (Padat: 254 kg, Tajam: 115 kg, Obat ED: 12 kg [QR1122531])
 * - Mei: 347 kg (Padat: 242 kg, Tajam: 105 kg)
 * - Jun: 269 kg (Padat: 168 kg, Tajam: 101 kg)
 * - Jul: 292 kg (Padat: 209 kg, Tajam: 75 kg, Obat Kadaluarsa: 8 kg [QR1122200])
 * - Agu: 306 kg (Padat: 226 kg, Tajam: 80 kg)
 * - Sep: 301 kg (Padat: 231 kg, Tajam: 70 kg)
 * - Okt: Siap input / 0 kg (Manifest QR1124947)
 * - Nov - Des: Template kalender
 */
export const REAL_MEDICAL_WASTE_LOGBOOK_2026: MedicalWasteLogRow[] = (
  rawRows as MedicalWasteLogRow[]
).map((r) => ({
  ...r,
  maksPenyimpananSuhu: r.maksPenyimpananSuhu || '✓',
  customValues: r.customValues || {},
}));
