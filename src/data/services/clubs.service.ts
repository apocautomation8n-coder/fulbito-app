import { clubsRepository, type UpdateClubInput } from '../repositories/clubs.repository';
import { profilesRepository } from '../repositories/profiles.repository';

export type CreateClubProfileInput = {
  owner_id: string;
  name: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  lat?: number;
  lng?: number;
  photos?: string[];
};

export class ClubsService {
  async createClubProfile(input: CreateClubProfileInput): Promise<{ clubId: string }> {
    const club = await clubsRepository.createClub(input);
    return { clubId: club.id };
  }

  async getClubByOwner(ownerId: string) {
    return clubsRepository.getClubByOwner(ownerId);
  }

  async submitClubForApproval(clubId: string) {
    return clubsRepository.submitForApproval(clubId);
  }

  async updateClubProfile(clubId: string, updates: UpdateClubInput) {
    return clubsRepository.updateClub(clubId, updates);
  }
}

export const clubsService = new ClubsService();
