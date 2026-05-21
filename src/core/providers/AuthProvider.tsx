import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Provider, User } from '@supabase/supabase-js';

import { hasSupabaseConfig, supabase } from '../../lib/supabase';
import { authService } from '../../data/services/auth.service';
import type { AppUser, UserRole } from '../../types/domain';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole, birthdate?: string) => Promise<{ userId: string; email: string }>;
  signInWithPassword: (email: string, password: string, roleFallback: UserRole) => Promise<void>;
  signInWithOAuth: (provider: Extract<Provider, 'google' | 'apple'>) => Promise<void>;
  signInDemo: (role: UserRole) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const demoUsers: Record<UserRole, AppUser> = {
  player: {
    id: 'demo-player',
    email: 'jugador@fulbito.app',
    fullName: 'Jugador Demo',
    role: 'player',
  },
  club: {
    id: 'demo-club',
    email: 'club@fulbito.app',
    fullName: 'Club Demo',
    role: 'club',
    clubVerificationStatus: 'pending',
  },
  admin: {
    id: 'demo-admin',
    email: 'admin@fulbito.app',
    fullName: 'Admin Fulbito',
    role: 'admin',
  },
};

const toAppUser = (supabaseUser: User, fallbackRole: UserRole = 'player'): AppUser => {
  const metadata = supabaseUser.user_metadata ?? {};
  const role = (metadata.role as UserRole | undefined) ?? fallbackRole;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    fullName: (metadata.full_name as string | undefined) ?? 'Usuario Fulbito',
    role,
    clubVerificationStatus:
      role === 'club'
        ? ((metadata.club_verification_status as AppUser['clubVerificationStatus']) ?? 'draft')
        : undefined,
  };
};

const readAuthUrlParams = (url: string) => {
  const params = new URL(url.replace('#', '?')).searchParams;
  return {
    code: params.get('code'),
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ? toAppUser(data.user) : null);
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInDemo = useCallback((role: UserRole) => {
    setUser(demoUsers[role]);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, role: UserRole, birthdate?: string) => {
      if (!supabase) {
        const demoUser = {
          ...demoUsers[role],
          email: email || demoUsers[role].email,
          fullName: fullName || demoUsers[role].fullName,
        };
        setUser(demoUser);
        return { userId: demoUser.id, email: demoUser.email };
      }

      return await authService.signUp({ email, password, fullName, role, birthdate });
    },
    [],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string, roleFallback: UserRole) => {
      if (!supabase) {
        setUser({
          ...demoUsers[roleFallback],
          email: email || demoUsers[roleFallback].email,
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      if (data.user) {
        setUser(toAppUser(data.user, roleFallback));
      }
    },
    [],
  );

  const signInWithOAuth = useCallback(async (provider: Extract<Provider, 'google' | 'apple'>) => {
    if (!supabase) {
      setUser(demoUsers.player);
      return;
    }

    const redirectTo = makeRedirectUri({ scheme: 'fulbito' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }
    if (!data.url) {
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') {
      return;
    }

    const { code, accessToken, refreshToken } = readAuthUrlParams(result.url);
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        throw exchangeError;
      }
      return;
    }
    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        throw sessionError;
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isConfigured: hasSupabaseConfig,
      signUp,
      signInWithPassword,
      signInWithOAuth,
      signInDemo,
      signOut,
    }),
    [isLoading, signInDemo, signInWithOAuth, signInWithPassword, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
