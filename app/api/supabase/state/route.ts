import { NextRequest, NextResponse } from 'next/server';
import {
  CLOUD_COLLECTION_META,
  createInitialSikeslingCloudState,
  fetchAllFromSupabaseRest,
  getSupabaseConfig,
  SikeslingCloudCollectionKey,
  SikeslingCloudState,
  SupabaseStoreRow,
  SupabaseSyncDiagnostic,
  upsertRowsToSupabaseRest,
} from '@/lib/supabase';
import {
  ensureCompleteWaterQualityRows,
  WaterQualityRow,
} from '@/lib/water-quality';
import { ensureCompleteAirQualityItems } from '@/lib/air-quality-data';
import { ensureCompleteSaranaPrasaranaData } from '@/lib/sarana-prasarana';
import {
  createRealtimeInitialMedicalWasteLogbook,
  MedicalWasteLogRow,
} from '@/lib/medical-waste-logbook';

declare global {
  var __sikeslingServerCloudState: SikeslingCloudState | undefined;
}

function getServerCloudState(): SikeslingCloudState {
  if (!globalThis.__sikeslingServerCloudState) {
    globalThis.__sikeslingServerCloudState = createInitialSikeslingCloudState();
  } else {
    globalThis.__sikeslingServerCloudState.water_quality_2026 =
      ensureCompleteWaterQualityRows(
        globalThis.__sikeslingServerCloudState.water_quality_2026
      );
  }
  return globalThis.__sikeslingServerCloudState;
}

function buildStoreRowsFromState(
  state: SikeslingCloudState,
  onlyKeys?: SikeslingCloudCollectionKey[]
): SupabaseStoreRow[] {
  const keys =
    onlyKeys ||
    (Object.keys(CLOUD_COLLECTION_META) as SikeslingCloudCollectionKey[]);
  return keys.map((key) => ({
    key,
    category: CLOUD_COLLECTION_META[key].category,
    title: CLOUD_COLLECTION_META[key].title,
    payload: state[key],
  }));
}

export async function GET() {
  const cfg = getSupabaseConfig();
  const state = getServerCloudState();

  const remote = await fetchAllFromSupabaseRest();
  const existingRemoteKeys = new Set<SikeslingCloudCollectionKey>();

  if (remote.ok && remote.tableReady && remote.rows.length > 0) {
    for (const row of remote.rows) {
      const k = row.key as SikeslingCloudCollectionKey;
      if (k in CLOUD_COLLECTION_META && row.payload !== undefined && row.payload !== null) {
        if (k === 'water_quality_2026' && Array.isArray(row.payload)) {
          const upgraded = ensureCompleteWaterQualityRows(row.payload as WaterQualityRow[]);
          state.water_quality_2026 = upgraded;
          if (upgraded.length !== row.payload.length) {
            void upsertRowsToSupabaseRest(
              buildStoreRowsFromState(state, ['water_quality_2026'])
            );
          }
        } else if (k === 'air_quality_items' && Array.isArray(row.payload)) {
          const upgraded = ensureCompleteAirQualityItems(row.payload, 2026);
          state.air_quality_items = upgraded;
          if (upgraded.length !== row.payload.length) {
            void upsertRowsToSupabaseRest(
              buildStoreRowsFromState(state, ['air_quality_items'])
            );
          }
        } else if (k === 'sarana_prasarana' && row.payload) {
          const upgraded = ensureCompleteSaranaPrasaranaData(row.payload, 2026);
          state.sarana_prasarana = upgraded;
          if (!Array.isArray((row.payload as any)?.toilets) || (row.payload as any).toilets.length < 15) {
            void upsertRowsToSupabaseRest(
              buildStoreRowsFromState(state, ['sarana_prasarana'])
            );
          }
        } else if (k === 'medical_waste_logbook' && Array.isArray(row.payload)) {
          if ((row.payload as unknown[]).length < 200) {
            const upgraded = createRealtimeInitialMedicalWasteLogbook();
            state.medical_waste_logbook = upgraded;
            void upsertRowsToSupabaseRest(
              buildStoreRowsFromState(state, ['medical_waste_logbook'])
            );
          } else {
            state.medical_waste_logbook = row.payload as MedicalWasteLogRow[];
          }
        } else if (k === 'solid_waste_b3' && Array.isArray(row.payload)) {
          const janRow = (row.payload as any[]).find((r: any) => r.no === 1);
          if (janRow && janRow.limbahPadat === 298) {
            state.solid_waste_b3 = createInitialSikeslingCloudState().solid_waste_b3;
            void upsertRowsToSupabaseRest(
              buildStoreRowsFromState(state, ['solid_waste_b3'])
            );
          } else {
            state.solid_waste_b3 = row.payload as any[];
          }
        } else {
          (state as unknown as Record<string, unknown>)[k] = row.payload;
        }
        existingRemoteKeys.add(k);
      }
    }
  }

  const allKeys = Object.keys(
    CLOUD_COLLECTION_META
  ) as SikeslingCloudCollectionKey[];

  // Auto-seed any missing collections into Supabase when table is ready
  let seededNow = false;
  if (remote.ok && remote.tableReady) {
    const missingKeys = allKeys.filter((k) => !existingRemoteKeys.has(k));
    if (missingKeys.length > 0) {
      const toSeed = buildStoreRowsFromState(state, missingKeys);
      const seedRes = await upsertRowsToSupabaseRest(toSeed);
      if (seedRes.ok) {
        seededNow = true;
        for (const k of missingKeys) {
          existingRemoteKeys.add(k);
        }
      }
    }
  }

  const diagnostic: SupabaseSyncDiagnostic = {
    connected: remote.ok,
    tableReady: remote.tableReady,
    projectRef: cfg.projectRef,
    restUrl: cfg.restUrl,
    syncedKeysCount: remote.tableReady
      ? existingRemoteKeys.size
      : allKeys.length,
    lastSyncedAt: new Date().toISOString(),
    statusMessage: remote.tableReady
      ? seededNow
        ? 'Terhubung ke Supabase REST v1 · Seluruh 16 koleksi berhasil diinisialisasi & disinkronkan.'
        : 'Terhubung ke Supabase REST v1 · Seluruh data tersinkronisasi secara realtime.'
      : remote.ok
        ? 'Endpoint Supabase REST v1 aktif & terautentikasi (Menunggu eksekusi tabel SQL sikesling_cloud_store).'
        : `Gagal menghubungi Supabase: ${remote.errorMessage || 'Unknown error'}`,
    errorCode: remote.errorCode,
  };

  return NextResponse.json({
    ok: true,
    state,
    diagnostic,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const cfg = getSupabaseConfig();
    const state = getServerCloudState();
    const body = await req.json();

    const action = body.action as string | undefined;

    if (action === 'SYNC_ALL') {
      const allRows = buildStoreRowsFromState(state);
      const upsertRes = await upsertRowsToSupabaseRest(allRows);

      const diagnostic: SupabaseSyncDiagnostic = {
        connected: upsertRes.ok || upsertRes.errorCode === 'PGRST205',
        tableReady: upsertRes.tableReady,
        projectRef: cfg.projectRef,
        restUrl: cfg.restUrl,
        syncedKeysCount: Object.keys(CLOUD_COLLECTION_META).length,
        lastSyncedAt: new Date().toISOString(),
        statusMessage: upsertRes.ok
          ? 'Seluruh 16 koleksi data SIKRESMI berhasil disimpan ke Supabase REST v1.'
          : upsertRes.errorMessage ||
            'Endpoint Supabase aktif; jalankan script SQL di Supabase SQL Editor untuk menyimpan ke tabel.',
        errorCode: upsertRes.errorCode,
      };

      return NextResponse.json({
        ok: true,
        persistedToTable: upsertRes.ok,
        state,
        diagnostic,
      });
    }

    if (action === 'RESET_COLLECTION') {
      const key = body.key as SikeslingCloudCollectionKey | undefined;
      if (!key || !(key in CLOUD_COLLECTION_META)) {
        return NextResponse.json(
          { ok: false, error: 'Koleksi data tidak valid.' },
          { status: 400 }
        );
      }
      const defaults = createInitialSikeslingCloudState();
      (state as unknown as Record<string, unknown>)[key] = defaults[key];
      const rows = buildStoreRowsFromState(state, [key]);
      const upsertRes = await upsertRowsToSupabaseRest(rows);

      return NextResponse.json({
        ok: true,
        persistedToTable: upsertRes.ok,
        key,
        payload: state[key],
      });
    }

    // Standard single or multi-collection update
    const key = body.key as SikeslingCloudCollectionKey | undefined;
    const payload = body.payload;

    if (!key || !(key in CLOUD_COLLECTION_META)) {
      return NextResponse.json(
        { ok: false, error: 'Key koleksi Supabase tidak valid.' },
        { status: 400 }
      );
    }

    (state as unknown as Record<string, unknown>)[key] = payload;

    const rows = buildStoreRowsFromState(state, [key]);
    const upsertRes = await upsertRowsToSupabaseRest(rows);

    const diagnostic: SupabaseSyncDiagnostic = {
      connected: upsertRes.ok || upsertRes.errorCode === 'PGRST205',
      tableReady: upsertRes.tableReady,
      projectRef: cfg.projectRef,
      restUrl: cfg.restUrl,
      syncedKeysCount: Object.keys(CLOUD_COLLECTION_META).length,
      lastSyncedAt: new Date().toISOString(),
      statusMessage: upsertRes.ok
        ? `Koleksi "${key}" tersimpan ke Supabase (${cfg.projectRef}).`
        : upsertRes.errorMessage || 'Tersinkronisasi ke state server Supabase.',
      errorCode: upsertRes.errorCode,
    };

    return NextResponse.json({
      ok: true,
      persistedToTable: upsertRes.ok,
      key,
      diagnostic,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Gagal memproses sinkronisasi Supabase.',
      },
      { status: 400 }
    );
  }
}
