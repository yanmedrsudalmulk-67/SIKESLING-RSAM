/**
 * Business Logic & Server-Side Security Layer (lib/services/index.ts)
 * Enforces Role-Based Access Control (RBAC), input validation, and audit logging on the server.
 */

import {
  UserRole,
  PermissionAction,
  hasPermission,
  validateDailyActivityInput,
  validateSupervisionInput,
  validateFileUpload,
} from '@/lib/domain';
import { getFoundationDalMetadata } from '@/lib/dal';

export function authorizeServerAction(
  role: UserRole,
  action: PermissionAction
): { authorized: boolean; message: string } {
  const allowed = hasPermission(role, action);
  if (!allowed) {
    return {
      authorized: false,
      message: `Akses ditolak di sisi server: Role "${role}" tidak memiliki izin untuk aksi "${action}".`,
    };
  }
  return {
    authorized: true,
    message: `Otorisasi server berhasil untuk role "${role}".`,
  };
}

export async function getSystemArchitectureOverview(role: UserRole = 'Administrator') {
  const auth = authorizeServerAction(role, 'view_dashboard');
  const dalMeta = await getFoundationDalMetadata();

  return {
    authorized: auth.authorized,
    application: {
      name: 'SIKESLING RSAM',
      fullName: 'Sistem Informasi Kesehatan Lingkungan',
      institution: 'UOBK RSUD Al-Mulk Kota Sukabumi',
      version: '1.0 — Foundation Development',
      stage: 'Tahap Pertama (Foundation Architecture)',
    },
    layers: [
      {
        name: 'Presentation Layer',
        tech: 'Next.js App Router, React 19, Tailwind CSS, Recharts, Lucide Icons',
        status: 'Active',
      },
      {
        name: 'Business Logic Layer',
        tech: 'TypeScript Domain Services, Server-Side RBAC Validator, Workflow State Machine',
        status: 'Active',
      },
      {
        name: 'Data Access Layer (DAL)',
        tech: 'Modular Repository Pattern (lib/dal)',
        status: 'Active',
      },
      {
        name: 'Database Layer',
        tech: 'PostgreSQL via Prisma ORM (prisma/schema.prisma)',
        status: dalMeta.dbStatus.mode,
      },
    ],
    ...dalMeta,
  };
}

export {
  validateDailyActivityInput,
  validateSupervisionInput,
  validateFileUpload,
};
