-- ============================================================================
-- SIKESLING RSAM — SUPABASE CLOUD SCHEMA & RLS SETUP
-- Project Ref : jgrgwhfgbmmxjgmjotzr
-- Endpoint    : https://jgrgwhfgbmmxjgmjotzr.supabase.co/rest/v1/
-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Tabel Utama Penyimpanan Terintegrasi SIKESLING RSAM (Seluruh 27 Koleksi Modul)
CREATE TABLE IF NOT EXISTS public.sikesling_cloud_store (
  key TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'MONITORING',
  title TEXT NOT NULL,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS) dan Kebijakan Akses untuk Anon/Authenticated Key
ALTER TABLE public.sikesling_cloud_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to sikesling_cloud_store" ON public.sikesling_cloud_store;
CREATE POLICY "Allow full access to sikesling_cloud_store"
  ON public.sikesling_cloud_store
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.sikesling_cloud_store TO anon, authenticated, service_role;

-- 3. Reload PostgREST Schema Cache agar endpoint /rest/v1/sikesling_cloud_store langsung aktif
NOTIFY pgrst, 'reload schema';
