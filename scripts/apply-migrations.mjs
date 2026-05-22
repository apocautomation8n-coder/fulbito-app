import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const migrationsDir = resolve(root, 'supabase', 'migrations');
const outputPath = resolve(root, 'supabase', 'all-migrations.sql');

const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();

const combined = files
  .map((filename) => {
    const sql = readFileSync(join(migrationsDir, filename), 'utf8').trim();
    return `-- ${filename}\n${sql}`;
  })
  .join('\n\n');

writeFileSync(outputPath, `${combined}\n`, 'utf8');

console.log(`Generated ${outputPath}`);
console.log('Apply it in Supabase Dashboard -> SQL Editor (one run).');
console.log('Then verify with: npm run db:check');
console.log('');
console.log('Security: do not install npm versions 9.1.6, 9.2.3, or 12.0.1.');
