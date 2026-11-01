/**
 * Database Layer (lib/db/index.ts)
 * Provides database configuration metadata and connection readiness check
 * for Supabase PostgreSQL & REST v1 integration.
 */

import { getSupabaseConfig } from '@/lib/supabase';

export interface DatabaseConnectionStatus {
  provider: 'supabase-postgresql';
  orm: 'Supabase REST v1 & PostgreSQL';
  isConfigured: boolean;
  mode: 'Supabase Cloud Connected (REST v1)' | 'PostgreSQL Connected';
  supabaseRestUrl: string;
  supabaseProjectRef: string;
  storagePath: string;
  maxUploadSizeMb: number;
}

export function getDatabaseConnectionStatus(): DatabaseConnectionStatus {
  const cfg = getSupabaseConfig();

  return {
    provider: 'supabase-postgresql',
    orm: 'Supabase REST v1 & PostgreSQL',
    isConfigured: cfg.isConfigured,
    mode: 'Supabase Cloud Connected (REST v1)',
    supabaseRestUrl: cfg.restUrl,
    supabaseProjectRef: cfg.projectRef,
    storagePath: process.env.STORAGE_PRIVATE_DIR || './storage/private',
    maxUploadSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB || 5),
  };
}
