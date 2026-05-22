import { supabase } from '../../lib/supabase';
import type {
  AppUser,
  ClubVerificationStatus,
  FootballPlayerProfile,
  PadelPlayerProfile,
  PlayerSportProfileMode,
  UserRole,
} from '../../types/domain';

export type Profile = {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
};

export type PlayerProfile = {
  user_id: string;
  birthdate: string | null;
  position: string | null;
  skill_level: string | null;
  sport_profile_mode: PlayerSportProfileMode;
  football_profile: FootballPlayerProfile;
  padel_profile: PadelPlayerProfile;
  transfer_alias: string | null;
  avg_rating: number;
  matches_played: number;
  created_at: string;
};

const isMissingSchemaError = (error: { code?: string; message?: string }) =>
  error.code === 'PGRST116'
  || error.code === 'PGRST205'
  || error.code === '42P01'
  || (error.message?.includes('relation') && error.message.includes('does not exist'));

export type ClubProfile = {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  photos: string[];
  verification_status: ClubVerificationStatus;
  mp_account_id: string | null;
  mp_connected_at: string | null;
  split_deadline_hours: number;
  cancellation_policy: any;
  created_at: string;
  updated_at: string;
};

export class ProfilesRepository {
  async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (isMissingSchemaError(error)) return null;
      throw error;
    }
    return data;
  }

  async getPlayerProfile(userId: string): Promise<PlayerProfile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (isMissingSchemaError(error)) return null;
      throw error;
    }
    return data;
  }

  async createProfile(
    userId: string,
    email: string,
    fullName: string,
    role: UserRole,
  ): Promise<Profile> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createPlayerProfile(
    userId: string,
    birthdate?: string,
  ): Promise<PlayerProfile> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('player_profiles')
      .insert({
        user_id: userId,
        birthdate: birthdate || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePlayerProfile(
    userId: string,
    updates: Partial<PlayerProfile>,
  ): Promise<PlayerProfile> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('player_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  toAppUser(profile: Profile): AppUser {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
    };
  }
}

export const profilesRepository = new ProfilesRepository();
