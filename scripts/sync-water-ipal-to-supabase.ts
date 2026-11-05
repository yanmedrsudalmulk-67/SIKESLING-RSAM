import { createInitialWaterQualityData, createInitialWaterPeriodicReports } from '../lib/water-quality';
import { createInitialWastewaterData } from '../lib/wastewater-quality';
import {
  fetchAllFromSupabaseRest,
  upsertRowsToSupabaseRest,
  CLOUD_COLLECTION_META,
} from '../lib/supabase';

async function main() {
  console.log('--- SYNCING REAL WATER & IPAL DATASETS TO SUPABASE ---');
  
  const waterRows = createInitialWaterQualityData(2026);
  const wastewaterRows = createInitialWastewaterData(2026);
  const sipaRows = createInitialWaterPeriodicReports(2026);

  console.log(`Water rows to sync: ${waterRows.length}`);
  console.log(`Wastewater rows to sync: ${wastewaterRows.length}`);
  console.log(`SIPA periodic reports to sync: ${sipaRows.length}`);

  const waterMeta = CLOUD_COLLECTION_META['water_quality_2026'];
  const wastewaterMeta = CLOUD_COLLECTION_META['wastewater_quality_2026'];
  const sipaMeta = CLOUD_COLLECTION_META['water_periodic_reports'];

  const res = await upsertRowsToSupabaseRest([
    {
      key: 'water_quality_2026',
      category: waterMeta.category,
      title: waterMeta.title,
      payload: waterRows,
    },
    {
      key: 'wastewater_quality_2026',
      category: wastewaterMeta.category,
      title: wastewaterMeta.title,
      payload: wastewaterRows,
    },
    {
      key: 'water_periodic_reports',
      category: sipaMeta.category,
      title: sipaMeta.title,
      payload: sipaRows,
    },
  ]);

  console.log('Supabase Cloud upsert result:', res);

  const check = await fetchAllFromSupabaseRest();
  const cloudWater = check.rows.find((r) => r.key === 'water_quality_2026');
  const cloudWaste = check.rows.find((r) => r.key === 'wastewater_quality_2026');
  const cloudSipa = check.rows.find((r) => r.key === 'water_periodic_reports');

  console.log('Verified cloud counts:');
  console.log('  water_quality_2026:', Array.isArray(cloudWater?.payload) ? (cloudWater?.payload as any[]).length : 0);
  console.log('  wastewater_quality_2026:', Array.isArray(cloudWaste?.payload) ? (cloudWaste?.payload as any[]).length : 0);
  console.log('  water_periodic_reports:', Array.isArray(cloudSipa?.payload) ? (cloudSipa?.payload as any[]).length : 0);
}

main().catch(console.error);
