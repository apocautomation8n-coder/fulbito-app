import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';
import { authService, type SignUpResult } from '../../data/services/auth.service';
import { hydrateAppUser } from '../../data/services/session.service';
import type { AppUser, UserRole } from '../../types/domain';

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    birthdate?: string,
    phone?: string,
  ) => Promise<SignUpResult>;
  signInWithPassword: (email: string, password: string, roleFallback: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase no configurado. Revisa .env.local');
  }
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

    const syncUser = async (
      nextUser: Parameters<typeof hydrateAppUser>[0] | null,
      fallbackRole: UserRole = 'player',
    ) => {
      if (!active) return;
      if (!nextUser) {
        setUser(null);
        return;
      }
      setUser(await hydrateAppUser(nextUser, fallbackRole));
    };

    supabase.auth.getUser().then(async ({ data }) => {
      if (active) {
        await syncUser(data.user);
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUser(session?.user ?? null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, role: UserRole, birthdate?: string, phone?: string) => {
      requireSupabase();
      return await authService.signUp({ email, password, fullName, role, birthdate, phone });
    },
    [],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string, roleFallback: UserRole) => {
      requireSupabase();
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      if (data.user) {
        setUser(await hydrateAppUser(data.user, roleFallback));
      }
    },
    [],
  );

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
      signOut,
    }),
    [isLoading, signInWithPassword, signOut, signUp, user],
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
