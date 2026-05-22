import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env.local');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const entries = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    entries[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return entries;
}

const env = { ...process.env, ...loadEnvFile(envPath) };
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const tables = [
  'profiles',
  'player_profiles',
  'clubs',
  'courts',
  'time_slots',
  'bookings',
];

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
};

let ready = true;

for (const table of tables) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
  const status = response.status;
  const ok = status === 200;
  console.log(`${ok ? 'OK' : 'MISSING'} ${table} -> HTTP ${status}`);
  if (!ok) ready = false;
}

if (ready) {
  console.log('\nSupabase schema looks ready for the mobile app.');
  process.exit(0);
}

console.log('\nSchema not ready. Run: npm run db:bundle');
console.log('Then execute supabase/all-migrations.sql in the Supabase SQL Editor.');
process.exit(1);
