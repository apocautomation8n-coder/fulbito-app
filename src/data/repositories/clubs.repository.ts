import { supabase } from '../../lib/supabase';
import type { ClubVerificationStatus } from '../../types/domain';

export type Club = {
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

export type CreateClubInput = {
  owner_id: string;
  name: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  lat?: number;
  lng?: number;
  photos?: string[];
};

export type UpdateClubInput = Partial<Omit<Club, 'id' | 'owner_id' | 'created_at'>>;

export class ClubsRepository {
  async getClub(clubId: string): Promise<Club | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) throw error;
    return data;
  }

  async getClubByOwner(ownerId: string): Promise<Club | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getApprovedClubs(city?: string): Promise<Club[]> {
    if (!supabase) return [];

    let query = supabase
      .from('clubs')
      .select('*')
      .eq('verification_status', 'approved');

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getPendingClubs(): Promise<Club[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createClub(input: CreateClubInput): Promise<Club> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        ...input,
        verification_status: 'draft',
        city: input.city || 'Cordoba',
        photos: input.photos || [],
        split_deadline_hours: 3,
        cancellation_policy: [
          { label: 'Reembolso total', hours_before: 24, refund_rate: 1 },
          { label: 'Reembolso parcial', hours_before: 3, refund_rate: 0.5 },
          { label: 'Sin reembolso', hours_before: 0, refund_rate: 0 },
        ],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateClub(clubId: string, updates: UpdateClubInput): Promise<Club> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('clubs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clubId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async submitForApproval(clubId: string): Promise<Club> {
    return this.updateClub(clubId, { verification_status: 'pending' });
  }

  async approveClub(clubId: string): Promise<Club> {
    return this.updateClub(clubId, { verification_status: 'approved' });
  }

  async rejectClub(clubId: string): Promise<Club> {
    return this.updateClub(clubId, { verification_status: 'rejected' });
  }

  async suspendClub(clubId: string): Promise<Club> {
    return this.updateClub(clubId, { verification_status: 'suspended' });
  }

  async connectMercadoPago(clubId: string, mpAccountId: string): Promise<Club> {
    return this.updateClub(clubId, {
      mp_account_id: mpAccountId,
      mp_connected_at: new Date().toISOString(),
    });
  }

  async updateCancellationPolicy(
    clubId: string,
    policy: Array<{ label: string; hours_before: number; refund_rate: number }>,
  ): Promise<Club> {
    return this.updateClub(clubId, { cancellation_policy: policy });
  }

  async updateSplitDeadline(clubId: string, hours: number): Promise<Club> {
    return this.updateClub(clubId, { split_deadline_hours: hours });
  }
}

export const clubsRepository = new ClubsRepository();

