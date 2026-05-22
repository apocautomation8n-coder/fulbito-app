# Supabase setup

Project ref: `tiasxbpvequuoemuxhsp`

## 1. Check schema from the repo

```bash
npm run db:check
```

If tables return `MISSING`, apply migrations (step 2).

## 2. Apply migrations

### Option A: bundled SQL (no extra npm packages)

```bash
npm run db:bundle
```

Open `supabase/all-migrations.sql` in Supabase Dashboard -> SQL Editor and run it once.

### Option B: Supabase Dashboard (file by file)

1. Open SQL Editor for the project.
2. Run each file in `supabase/migrations/` in order: `001` -> `006`.
3. Run `npm run db:check`.

## 3. Mobile env

Only public keys belong in `.env.local`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Never commit `service_role`, secret keys, or the database password.

## npm security

Do not install or upgrade to npm `9.1.6`, `9.2.3`, or `12.0.1` (known compromised releases). Use your current Node/npm as-is for this repo.

## Edge Function secrets (server-side only)

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_CLIENT_SECRET`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
