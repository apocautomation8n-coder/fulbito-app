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
import { authService } from '../../data/services/auth.service';
import { hydrateAppUser } from '../../data/services/session.service';
import type { AppUser, UserRole } from '../../types/domain';

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole, birthdate?: string) => Promise<{ userId: string; email: string }>;
  signInWithPassword: (email: string, password: string, roleFallback: UserRole) => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;

    const syncUser = async (nextUser: Parameters<typeof hydrateAppUser>[0] | null, fallbackRole: UserRole = 'player') => {
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
      signInDemo,
      signOut,
    }),
    [isLoading, signInDemo, signInWithPassword, signOut, signUp, user],
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
