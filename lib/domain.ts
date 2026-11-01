export type UserRole =
  | 'Administrator'
  | 'Petugas Kesling'
  | 'Koordinator Kesling'
  | 'Pimpinan / Viewer';

export type PermissionAction =
  | 'view_dashboard'
  | 'manage_operational'
  | 'manage_monitoring'
  | 'create_supervision'
  | 'manage_findings'
  | 'verify_findings'
  | 'view_analytics'
  | 'generate_reports'
  | 'manage_documents'
  | 'manage_master_data'
  | 'manage_settings';

export type FindingStatus =
  | 'Temuan Baru'
  | 'Dalam Proses'
  | 'Menunggu Verifikasi'
  | 'Selesai Terverifikasi';

export type PriorityLevel = 'Rendah' | 'Sedang' | 'Tinggi';

export interface PhotoAttachmentMeta {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  caption: string;
  previewUrl: string;
  createdAt: string;
}

export interface DailyActivityRecord {
  id: string;
  date: string;
  category: string;
  location: string;
  officerName: string;
  description: string;
  notes: string;
  status: 'Tercatat (Sesi Lokal)' | 'Terverifikasi';
  attachments: PhotoAttachmentMeta[];
  createdAt: string;
}

export interface SupervisionRecord {
  id: string;
  date: string;
  officerName: string;
  roomOrUnit: string;
  category: string;
  inspectionDetails: string;
  findings: string;
  recommendations: string;
  priority: PriorityLevel;
  attachments: PhotoAttachmentMeta[];
  createdAt: string;
}

export interface FindingFollowUpRecord {
  id: string;
  code: string;
  date: string;
  location: string;
  category: string;
  description: string;
  recommendation: string;
  picName: string;
  targetDate: string;
  priority: PriorityLevel;
  status: FindingStatus;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleRecord {
  id: string;
  title: string;
  date: string;
  type:
    | 'Pemeriksaan'
    | 'Monitoring'
    | 'Supervisi'
    | 'Pengambilan Sampel'
    | 'Kegiatan Rutin';
  location: string;
  officerName: string;
  status: 'Terjadwal' | 'Selesai';
}

export interface MasterRoomItem {
  id: string;
  code: string;
  name: string;
  unitName: string;
  building: string;
  isActive: boolean;
}

export interface MasterStandardItem {
  id: string;
  standardName: string;
  regulationSource: string;
  regulationNumber: string;
  effectiveDate: string;
  version: string;
  isActive: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  Administrator: [
    'view_dashboard',
    'manage_operational',
    'manage_monitoring',
    'create_supervision',
    'manage_findings',
    'verify_findings',
    'view_analytics',
    'generate_reports',
    'manage_documents',
    'manage_master_data',
    'manage_settings',
  ],
  'Petugas Kesling': [
    'view_dashboard',
    'manage_operational',
    'manage_monitoring',
    'create_supervision',
    'manage_findings',
    'view_analytics',
    'generate_reports',
    'manage_documents',
  ],
  'Koordinator Kesling': [
    'view_dashboard',
    'manage_operational',
    'manage_monitoring',
    'create_supervision',
    'manage_findings',
    'verify_findings',
    'view_analytics',
    'generate_reports',
    'manage_documents',
    'manage_master_data',
  ],
  'Pimpinan / Viewer': ['view_dashboard', 'view_analytics', 'generate_reports'],
};

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(action);
}

export const FINDING_WORKFLOW_ORDER: FindingStatus[] = [
  'Temuan Baru',
  'Dalam Proses',
  'Menunggu Verifikasi',
  'Selesai Terverifikasi',
];

export function canTransitionFindingStatus(
  current: FindingStatus,
  next: FindingStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  if (current === next) {
    return { allowed: false, reason: 'Status tujuan sama dengan status saat ini.' };
  }

  if (next === 'Selesai Terverifikasi') {
    if (!hasPermission(role, 'verify_findings')) {
      return {
        allowed: false,
        reason:
          'Hanya Koordinator Kesling atau Administrator yang memiliki wewenang memverifikasi penyelesaian temuan.',
      };
    }
    if (current !== 'Menunggu Verifikasi') {
      return {
        allowed: false,
        reason:
          'Temuan harus berada pada tahap "Menunggu Verifikasi" sebelum disahkan menjadi "Selesai Terverifikasi".',
      };
    }
    return { allowed: true };
  }

  if (!hasPermission(role, 'manage_findings')) {
    return {
      allowed: false,
      reason: 'Role pengguna saat ini tidak memiliki hak akses mengubah status temuan.',
    };
  }

  const validTransitions: Record<FindingStatus, FindingStatus[]> = {
    'Temuan Baru': ['Dalam Proses'],
    'Dalam Proses': ['Menunggu Verifikasi', 'Temuan Baru'],
    'Menunggu Verifikasi': ['Dalam Proses', 'Selesai Terverifikasi'],
    'Selesai Terverifikasi': ['Dalam Proses'],
  };

  if (!validTransitions[current].includes(next)) {
    return {
      allowed: false,
      reason: `Perubahan status dari "${current}" langsung ke "${next}" tidak sesuai alur kerja.`,
    };
  }

  return { allowed: true };
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateDailyActivityInput(input: {
  date?: string;
  category?: string;
  location?: string;
  officerName?: string;
  description?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.date || input.date.trim() === '') {
    errors.date = 'Tanggal kegiatan wajib diisi.';
  }
  if (!input.category || input.category.trim() === '') {
    errors.category = 'Jenis kegiatan wajib dipilih atau diisi.';
  }
  if (!input.location || input.location.trim() === '') {
    errors.location = 'Lokasi kegiatan wajib diisi.';
  }
  if (!input.officerName || input.officerName.trim() === '') {
    errors.officerName = 'Nama petugas pelaksana wajib diisi.';
  }
  if (!input.description || input.description.trim().length < 5) {
    errors.description = 'Uraian kegiatan wajib diisi (minimal 5 karakter).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSupervisionInput(input: {
  date?: string;
  officerName?: string;
  roomOrUnit?: string;
  category?: string;
  inspectionDetails?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.date || input.date.trim() === '') {
    errors.date = 'Tanggal supervisi wajib diisi.';
  }
  if (!input.officerName || input.officerName.trim() === '') {
    errors.officerName = 'Nama petugas supervisi wajib diisi.';
  }
  if (!input.roomOrUnit || input.roomOrUnit.trim() === '') {
    errors.roomOrUnit = 'Unit atau ruangan wajib dipilih.';
  }
  if (!input.category || input.category.trim() === '') {
    errors.category = 'Kategori supervisi wajib dipilih.';
  }
  if (!input.inspectionDetails || input.inspectionDetails.trim().length < 5) {
    errors.inspectionDetails = 'Uraian pemeriksaan wajib diisi (minimal 5 karakter).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateFileUpload(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  if (!file.name || file.name.trim() === '') {
    return { valid: false, error: 'Nama file tidak valid.' };
  }
  if (!ALLOWED_IMAGE_MIMES.includes(file.type as (typeof ALLOWED_IMAGE_MIMES)[number])) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Gunakan foto format JPG, PNG, atau WebP.',
    };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'Ukuran file kosong atau tidak valid.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: 'Ukuran file melebihi batas maksimum 5 MB.',
    };
  }
  return { valid: true };
}

export interface DashboardSummaryMetrics {
  totalActivities: number;
  totalSupervisions: number;
  unresolvedFindings: number;
  compliancePercentage: number | null;
  upcomingSchedules: number;
  availableReports: number;
}

export function calculateDashboardSummary(params: {
  activities: DailyActivityRecord[];
  supervisions: SupervisionRecord[];
  findings: FindingFollowUpRecord[];
  schedules: ScheduleRecord[];
}): DashboardSummaryMetrics {
  const unresolvedFindings = params.findings.filter(
    (f) => f.status !== 'Selesai Terverifikasi'
  ).length;

  const upcomingSchedules = params.schedules.filter(
    (s) => s.status === 'Terjadwal'
  ).length;

  // Compliance formula is intentionally null in Foundation Stage (Rule 4 & Section 14.3:
  // "Jangan menggunakan rumus capaian yang belum ditetapkan" / "Jangan membuat angka statistik palsu")
  return {
    totalActivities: params.activities.length,
    totalSupervisions: params.supervisions.length,
    unresolvedFindings,
    compliancePercentage: null,
    upcomingSchedules,
    availableReports: 0,
  };
}
