const runtime = globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const env = runtime.process?.env ?? {};

export const integrations = {
  supabase: {
    url: env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  mercadoPago: {
    publicKey: env.EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? '',
  },
  firebase: {
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    senderId: env.EXPO_PUBLIC_FIREBASE_SENDER_ID ?? '',
    androidAppId: env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID ?? '',
    iosAppId: env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS ?? '',
  },
} as const;

export const integrationStatus = {
  hasSupabase: Boolean(integrations.supabase.url && integrations.supabase.anonKey),
  hasMercadoPagoPublicKey: Boolean(integrations.mercadoPago.publicKey),
  hasFirebaseProject: Boolean(integrations.firebase.projectId && integrations.firebase.senderId),
} as const;
