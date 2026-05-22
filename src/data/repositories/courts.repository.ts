import { supabase } from '../../lib/supabase';
import type { CourtFormat, CourtSport, PaymentCollectionMode } from '../../types/domain';

export type Court = {
  id: string;
  club_id: string;
  name: string;
  sport: CourtSport;
  format: CourtFormat;
  players_per_team: number | null;
  price_per_slot: number;
  duration_minutes: number;
  payment_mode: PaymentCollectionMode;
  deposit_amount: number | null;
  photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateCourtInput = {
  club_id: string;
  name: string;
  sport?: CourtSport;
  format: CourtFormat;
  players_per_team?: number;
  price_per_slot: number;
  duration_minutes?: number;
  payment_mode?: PaymentCollectionMode;
  deposit_amount?: number;
  photos?: string[];
};

export type UpdateCourtInput = Partial<Omit<Court, 'id' | 'club_id' | 'created_at'>>;

export class CourtsRepository {
  async getCourt(courtId: string): Promise<Court | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', courtId)
      .single();

    if (error) throw error;
    return data;
  }

  async getClubCourts(clubId: string): Promise<Court[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getActiveCourts(city?: string): Promise<Court[]> {
    if (!supabase) return [];

    let query = supabase
      .from('courts')
      .select(`
        *,
        clubs!inner (
          id,
          name,
          neighborhood,
          city,
          verification_status
        )
      `)
      .eq('is_active', true)
      .eq('clubs.verification_status', 'approved');

    if (city) {
      query = query.eq('clubs.city', city);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createCourt(input: CreateCourtInput): Promise<Court> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('courts')
      .insert({
        ...input,
        sport: input.sport || 'football',
        duration_minutes: input.duration_minutes || 60,
        payment_mode: input.payment_mode || 'at_club',
        photos: input.photos || [],
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCourt(courtId: string, updates: UpdateCourtInput): Promise<Court> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('courts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courtId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deactivateCourt(courtId: string): Promise<Court> {
    return this.updateCourt(courtId, { is_active: false });
  }

  async activateCourt(courtId: string): Promise<Court> {
    return this.updateCourt(courtId, { is_active: true });
  }
}

export const courtsRepository = new CourtsRepository();
