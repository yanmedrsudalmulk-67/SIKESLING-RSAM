import { OFFICIAL_FINDING_RECORDS_11 } from '../lib/master-findings-data';
import {
  fetchAllFromSupabaseRest,
  upsertRowsToSupabaseRest,
  CLOUD_COLLECTION_META,
} from '../lib/supabase';

async function main() {
  console.log('--- SYNCING 11 MASTER FINDINGS TO SUPABASE ---');
  const before = await fetchAllFromSupabaseRest();
  console.log('Fetch ok:', before.ok, 'tableReady:', before.tableReady);
  const existingFindingsRow = before.rows.find((r) => r.key === 'findings');
  console.log(
    'Existing findings count in cloud:',
    existingFindingsRow && Array.isArray(existingFindingsRow.payload)
      ? (existingFindingsRow.payload as any[]).length
      : 0
  );

  const meta = CLOUD_COLLECTION_META['findings'];
  const res = await upsertRowsToSupabaseRest([
    {
      key: 'findings',
      category: meta.category,
      title: meta.title,
      payload: OFFICIAL_FINDING_RECORDS_11,
    },
  ]);

  console.log('Upsert result:', res);

  const after = await fetchAllFromSupabaseRest();
  const updatedFindingsRow = after.rows.find((r) => r.key === 'findings');
  console.log(
    'Updated findings count in cloud:',
    updatedFindingsRow && Array.isArray(updatedFindingsRow.payload)
      ? (updatedFindingsRow.payload as any[]).length
      : 0
  );
}

main().catch(console.error);
