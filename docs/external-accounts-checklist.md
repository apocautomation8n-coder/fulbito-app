# Cuentas externas para Fulbito

## Lo que ya quedo preparado localmente

- Bundle/package ID: `com.apoc.fulbito`.
- Nombre app: Fulbito.
- Empresa: Apoc Automation.
- Soporte: apoc@apocautomation.site.
- Web: https://apoc.apocautomation.site.
- Variables publicas en `.env.example`.
- Carpeta de migraciones Supabase.
- Carpeta para Supabase Edge Functions.
- Config EAS para builds Android/iOS.

## Lo que requiere cuenta o aprobacion manual

### Supabase

Crear proyecto:

- Nombre sugerido: `fulbito-prod`.
- Region sugerida: cercana a Argentina/Brasil.
- Auth providers:
  - Email/password.

Luego completar `.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Aplicar la migracion:

```bash
supabase db push
```

Secretos que no van en la app:

```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=...
supabase secrets set MERCADOPAGO_CLIENT_SECRET=...
supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=...
```

### Firebase

Crear proyecto:

- Nombre sugerido: `fulbito`.
- Android package: `com.apoc.fulbito`.
- iOS bundle ID: `com.apoc.fulbito`.

Descargar archivos:

- `google-services.json` para Android.
- `GoogleService-Info.plist` para iOS.

No subir service accounts privadas al repo.

### MercadoPago

Crear app de Marketplace.

Valores necesarios:

- Public key.
- Access token de test.
- Client ID.
- Client secret.
- Webhook secret.
- Redirect URL para conectar clubes.

Regla MVP:

- Fulbito retiene 5% sobre el valor total del turno.
- El club puede cobrar pago completo o sena.
- Toda reserva creada desde Fulbito requiere pago online.

### Apple Developer

Crear o usar cuenta Apple Developer de Apoc Automation.

Configurar:

- Bundle ID: `com.apoc.fulbito`.
- Push notifications.
- Privacy policy URL.
- Support URL: https://apoc.apocautomation.site.

### Google Play Console

Crear app Android:

- Package: `com.apoc.fulbito`.
- Support email: apoc@apocautomation.site.
- Privacy policy URL.

## Prioridad recomendada

1. Crear Supabase.
2. Aplicar migracion inicial.
3. Crear Firebase para push.
4. Crear MercadoPago Marketplace y empezar aprobacion.
5. Crear Apple Developer / Google Play cuando ya tengamos primer build de prueba.
