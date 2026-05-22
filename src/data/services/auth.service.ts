import { supabase } from '../../lib/supabase';
import type { UserRole } from '../../types/domain';

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  birthdate?: string;
};

export type AuthError = {
  message: string;
  code?: string;
};

const normalizeBirthdate = (birthdate?: string) => {
  const value = birthdate?.trim();
  if (!value) return undefined;

  const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month}-${day}`;
  }

  return value;
};

export class AuthService {
  async signUp(input: SignUpInput): Promise<{ userId: string; email: string }> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: input.role,
          birthdate: normalizeBirthdate(input.birthdate),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    return {
      userId: data.user.id,
      email: data.user.email || input.email,
    };
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  }

  getCurrentUser() {
    if (!supabase) return null;
    return supabase.auth.getUser();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
