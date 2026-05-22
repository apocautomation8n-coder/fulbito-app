import type { User } from '@supabase/supabase-js';

import { hasSupabaseConfig, supabase } from '../../lib/supabase';
import type { AppUser, UserRole } from '../../types/domain';
import { clubsRepository } from '../repositories/clubs.repository';
import { profilesRepository } from '../repositories/profiles.repository';

const toAppUserFromMetadata = (supabaseUser: User, fallbackRole: UserRole = 'player'): AppUser => {
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

export async function hydrateAppUser(
  supabaseUser: User,
  fallbackRole: UserRole = 'player',
): Promise<AppUser> {
  const fallback = toAppUserFromMetadata(supabaseUser, fallbackRole);

  if (!hasSupabaseConfig || !supabase) {
    return fallback;
  }

  try {
    const profile = await profilesRepository.getProfile(supabaseUser.id);
    if (!profile) {
      return fallback;
    }

    let clubVerificationStatus = fallback.clubVerificationStatus;
    if (profile.role === 'club') {
      const club = await clubsRepository.getClubByOwner(profile.id);
      clubVerificationStatus = club?.verification_status ?? 'draft';
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      clubVerificationStatus,
    };
  } catch {
    return fallback;
  }
}
