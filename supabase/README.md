# Supabase setup

Apply migrations from `supabase/migrations` once the Supabase project exists.

Secrets that must stay server-side:

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_CLIENT_SECRET`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- Firebase service account JSON, if used from Edge Functions.

Public mobile values can go in `.env.local` with the `EXPO_PUBLIC_` prefix.
