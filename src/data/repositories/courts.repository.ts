import { supabase } from '../../lib/supabase';
import { uploadCourtPhotos } from '../services/court-photos.service';
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

    if (!input.club_id) {
      throw new Error('Registra tu club antes de agregar canchas.');
    }

    const localPhotos = input.photos ?? [];
    const photoUrls =
      localPhotos.length > 0 ? await uploadCourtPhotos(input.club_id, localPhotos) : [];

    const { data, error } = await supabase
      .from('courts')
      .insert({
        club_id: input.club_id,
        name: input.name,
        sport: input.sport || 'football',
        format: input.format,
        players_per_team: input.players_per_team ?? null,
        price_per_slot: input.price_per_slot,
        duration_minutes: input.duration_minutes || 60,
        payment_mode: input.payment_mode || 'at_club',
        deposit_amount: input.deposit_amount ?? null,
        photos: photoUrls,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

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
