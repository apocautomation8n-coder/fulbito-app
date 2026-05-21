import { supabase } from '../../lib/supabase';

export type Rating = {
  id: string;
  rater_id: string;
  rated_id: string;
  match_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type CreateRatingInput = {
  rater_id: string;
  rated_id: string;
  match_id: string;
  rating: number;
  comment: string | null;
};

export class RatingsRepository {
  async getPlayerRating(playerId: string): Promise<number> {
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_id', playerId);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }

  async getPlayerRatings(playerId: string): Promise<Rating[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('rated_id', playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async submitRating(input: CreateRatingInput): Promise<Rating> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async hasRated(raterId: string, matchId: string): Promise<boolean> {
    if (!supabase) return false;

    const { data, error } = await supabase
      .from('ratings')
      .select('id')
      .eq('rater_id', raterId)
      .eq('match_id', matchId)
      .single();

    if (error) return false;
    return !!data;
  }
}

export const ratingsRepository = new RatingsRepository();
