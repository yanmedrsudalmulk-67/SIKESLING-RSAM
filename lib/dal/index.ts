/**
 * Data Access Layer (lib/dal/index.ts)
 * Separates data persistence queries from Business Logic and Presentation Layers.
 * Ready to delegate directly to Prisma Client once PostgreSQL migrations are applied on the hospital server.
 */

import { getDatabaseConnectionStatus } from '@/lib/db';

export const FOUNDATION_ENTITIES = [
  { order: 1, name: 'Users', table: 'User', description: 'Akun pengguna sistem dengan password hash dan relasi role' },
  { order: 2, name: 'Roles', table: 'Role', description: 'Peran pengguna (Administrator, Petugas Kesling, Koordinator Kesling, Pimpinan / Viewer)' },
  { order: 3, name: 'Permissions', table: 'Permission', description: 'Hak akses granular per modul dan aksi yang divalidasi di server' },
  { order: 4, name: 'Units', table: 'Unit', description: 'Data instalasi dan unit kerja di UOBK RSUD Al-Mulk' },
  { order: 5, name: 'Rooms', table: 'Room', description: 'Data ruangan per unit/instalasi beserta konfigurasi zona' },
  { order: 6, name: 'ActivityCategories', table: 'ActivityCategory', description: 'Master kategori kegiatan operasional harian petugas Kesling' },
  { order: 7, name: 'Activities', table: 'Activity', description: 'Pencatatan kegiatan operasional harian beserta lampiran' },
  { order: 8, name: 'MonitoringCategories', table: 'MonitoringCategory', description: 'Master kategori monitoring lingkungan (Air, Udara, Limbah, IPAL, Vektor, Sanitasi)' },
  { order: 9, name: 'InspectionTemplates', table: 'InspectionTemplate', description: 'Template checklist pemeriksaan & supervisi lapangan yang dapat dikonfigurasi' },
  { order: 10, name: 'Inspections', table: 'Inspection', description: 'Transaksi supervisi lapangan oleh petugas menggunakan smartphone/tablet' },
  { order: 11, name: 'InspectionFindings', table: 'InspectionFinding', description: 'Daftar temuan hasil supervisi dan status alur tindak lanjutnya' },
  { order: 12, name: 'Attachments', table: 'Attachment', description: 'Metadata file foto/dokumen pada penyimpanan privat terkontrol' },
  { order: 13, name: 'FollowUpActions', table: 'FollowUpAction', description: 'Log audit perubahan status dan verifikasi perbaikan temuan' },
  { order: 14, name: 'ApplicationSettings', table: 'ApplicationSetting', description: 'Konfigurasi profil rumah sakit, parameter sistem, dan referensi regulasi' },
] as const;

export async function getFoundationDalMetadata() {
  const dbStatus = getDatabaseConnectionStatus();
  return {
    dbStatus,
    entities: FOUNDATION_ENTITIES,
    timestamp: new Date().toISOString(),
  };
}
