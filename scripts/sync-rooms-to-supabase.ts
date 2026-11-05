import { OFFICIAL_MASTER_ROOMS_74 } from '../lib/master-rooms-data';
import {
  fetchAllFromSupabaseRest,
  upsertRowsToSupabaseRest,
  CLOUD_COLLECTION_META,
} from '../lib/supabase';

async function main() {
  console.log('--- SYNCING 74 MASTER ROOMS TO SUPABASE ---');
  const before = await fetchAllFromSupabaseRest();
  console.log('Fetch ok:', before.ok, 'tableReady:', before.tableReady);
  const existingRoomsRow = before.rows.find((r) => r.key === 'master_rooms');
  console.log(
    'Existing master_rooms row count:',
    existingRoomsRow && Array.isArray(existingRoomsRow.payload)
      ? (existingRoomsRow.payload as any[]).length
      : 0
  );

  const meta = CLOUD_COLLECTION_META['master_rooms'];
  const res = await upsertRowsToSupabaseRest([
    {
      key: 'master_rooms',
      category: meta.category,
      title: meta.title,
      payload: OFFICIAL_MASTER_ROOMS_74,
    },
  ]);

  console.log('Upsert result:', res);

  const after = await fetchAllFromSupabaseRest();
  const updatedRoomsRow = after.rows.find((r) => r.key === 'master_rooms');
  console.log(
    'Updated master_rooms row count:',
    updatedRoomsRow && Array.isArray(updatedRoomsRow.payload)
      ? (updatedRoomsRow.payload as any[]).length
      : 0
  );
}

main().catch(console.error);
