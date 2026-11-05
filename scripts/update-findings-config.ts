import * as fs from 'fs';
import * as path from 'path';

const supabasePath = path.join(__dirname, '..', 'lib', 'supabase.ts');
let content = fs.readFileSync(supabasePath, 'utf8');

if (!content.includes('INITIAL_FINDINGS')) {
  content = content.replace(
    "import { OFFICIAL_MASTER_ROOMS_74 } from './master-rooms-data';",
    "import { OFFICIAL_MASTER_ROOMS_74 } from './master-rooms-data';\nimport { OFFICIAL_FINDING_RECORDS_11 } from './master-findings-data';\n\nexport const INITIAL_FINDINGS: FindingFollowUpRecord[] = [\n  ...OFFICIAL_FINDING_RECORDS_11,\n];"
  );
}

content = content.replace('findings: [],', 'findings: [...INITIAL_FINDINGS],');
fs.writeFileSync(supabasePath, content, 'utf8');
console.log('Updated lib/supabase.ts with INITIAL_FINDINGS');

// Update app-provider.tsx as well
const appProviderPath = path.join(__dirname, '..', 'components', 'sikesling', 'app-provider.tsx');
let appContent = fs.readFileSync(appProviderPath, 'utf8');

if (!appContent.includes('INITIAL_FINDINGS')) {
  appContent = appContent.replace(
    '  INITIAL_MASTER_ROOMS,',
    '  INITIAL_MASTER_ROOMS,\n  INITIAL_FINDINGS,'
  );
  appContent = appContent.replace(
    'const [findings, setFindings] = useState<FindingFollowUpRecord[]>([]);',
    'const [findings, setFindings] = useState<FindingFollowUpRecord[]>(INITIAL_FINDINGS);'
  );
  fs.writeFileSync(appProviderPath, appContent, 'utf8');
  console.log('Updated app-provider.tsx with INITIAL_FINDINGS');
} else {
  console.log('app-provider.tsx already has INITIAL_FINDINGS');
}
