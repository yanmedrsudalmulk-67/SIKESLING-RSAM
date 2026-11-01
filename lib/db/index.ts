/**
 * Database Layer (lib/db/index.ts)
 * Provides database configuration metadata and connection readiness check
 * for local or hospital server PostgreSQL via Prisma ORM.
 */

export interface DatabaseConnectionStatus {
  provider: 'postgresql';
  orm: 'Prisma ORM';
  isConfigured: boolean;
  mode: 'Local Session Draft Mode (Foundation)' | 'PostgreSQL Connected';
  storagePath: string;
  maxUploadSizeMb: number;
}

export function getDatabaseConnectionStatus(): DatabaseConnectionStatus {
  const dbUrl = process.env.DATABASE_URL;
  const isRealPostgresConfigured =
    Boolean(dbUrl) &&
    !dbUrl!.includes('localhost:5432/sikesling_rsam') &&
    dbUrl!.startsWith('postgres');

  return {
    provider: 'postgresql',
    orm: 'Prisma ORM',
    isConfigured: isRealPostgresConfigured,
    mode: isRealPostgresConfigured
      ? 'PostgreSQL Connected'
      : 'Local Session Draft Mode (Foundation)',
    storagePath: process.env.STORAGE_PRIVATE_DIR || './storage/private',
    maxUploadSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB || 5),
  };
}
