/**
 * Realtime period helpers (SIKRESMI).
 *
 * Aturan data realtime:
 * 1. Bulan yang belum berjalan (setelah bulan berjalan) TIDAK boleh berisi data.
 * 2. Data yang tidak memiliki hasil input riil ditampilkan KOSONG (bukan angka dummy / baseline).
 * 3. Dataset yang hanya berlaku untuk satu tahun (mis. 2026) hanya muncul saat tahun tersebut dipilih;
 *    data 2025 hanya muncul ketika filter tahun = 2025.
 */

/** Tahun dataset operasional yang tersimpan di koleksi Supabase saat ini. */
export const ACTIVE_DATASET_YEAR = 2026;

/** Tahun-tahun yang dapat dipilih pada filter periode. */
export const SELECTABLE_YEARS: number[] = [2025, 2026];

export function getRealtimeNow(now: Date = new Date()): { year: number; month: number } {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Bulan terakhir yang sudah boleh berisi data untuk `year`.
 * - Tahun lampau  -> 12
 * - Tahun berjalan -> bulan berjalan
 * - Tahun depan   -> 0 (belum ada bulan yang boleh diisi)
 */
export function getLastOpenMonth(year: number, now: Date = new Date()): number {
  const current = getRealtimeNow(now);
  if (year < current.year) return 12;
  if (year > current.year) return 0;
  return current.month;
}

/** true jika bulan (1..12) pada `year` belum berjalan, sehingga datanya wajib kosong. */
export function isFutureMonth(year: number, month: number, now: Date = new Date()): boolean {
  return month > getLastOpenMonth(year, now);
}

/** true jika tahun yang dipilih sama dengan tahun dataset (data boleh ditampilkan). */
export function isDatasetYear(selectedYear: number, datasetYear: number = ACTIVE_DATASET_YEAR): boolean {
  return selectedYear === datasetYear;
}

/** Nilai teks dianggap kosong (belum diinput). */
export function isBlankValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return Number.isNaN(value);
  const s = String(value).trim();
  return s === '' || s === '-';
}
