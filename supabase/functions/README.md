# Supabase Edge Functions para Fulbito

Este directorio contiene las Edge Functions de Supabase necesarias para integrar MercadoPago en la app Fulbito.

## Configuración

### Variables de entorno

Necesitas configurar las siguientes variables de entorno en tu proyecto de Supabase:

```bash
# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_PUBLIC_KEY=your_public_key

# Supabase (automáticamente disponibles en Edge Functions)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Instalación

1. Instala la CLI de Supabase:
```bash
npm install -g supabase
```

2. Inicia el entorno local:
```bash
supabase start
```

3. Despliega las funciones:
```bash
supabase functions deploy
```

## Funciones disponibles

### 1. mercado-pago-create-preference

Crea una preferencia de pago en MercadoPago para una reserva.

**Endpoint:** `/functions/v1/mercado-pago-create-preference`

**Método:** POST

**Body:**
```json
{
  "bookingId": "uuid",
  "amount": 25000,
  "description": "Reserva de cancha - La Docta Futbol"
}
```

**Respuesta:**
```json
{
  "preferenceId": "pref_xxxxx",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_xxxxx"
}
```

### 2. mercado-pago-webhook

Webhook para recibir notificaciones de MercadoPago sobre el estado de los pagos.

**Endpoint:** `/functions/v1/mercado-pago-webhook`

**Método:** POST

**Body:** (Webhook payload de MercadoPago)

Esta función actualiza el estado de la reserva en la base de datos cuando el pago es completado.

### 3. mercado-pago-split-payment

Procesa pagos divididos para partidos con split de pagos.

**Endpoint:** `/functions/v1/mercado-pago-split-payment`

**Método:** POST

**Body:**
```json
{
  "matchId": "uuid",
  "playerId": "uuid",
  "amount": 2000
}
```

## Notas importantes

- Las Edge Functions corren en Deno, no en Node.js
- Usa ES modules con importaciones desde URLs
- No incluyas secretos en el código de la app móvil
- Usa SUPABASE_SERVICE_ROLE_KEY para operaciones administrativas en las Edge Functions
- Implementa validación de webhooks para verificar que las notificaciones vienen de MercadoPago

## Próximos pasos

1. Obtener credenciales de MercadoPago Marketplace
2. Implementar la integración real con la API de MercadoPago
3. Configurar el webhook en MercadoPago
4. Probar el flujo de pago completo
5. Implementar manejo de errores y reintentos
