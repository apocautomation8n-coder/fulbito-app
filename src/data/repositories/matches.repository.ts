import { supabase } from '../../lib/supabase';
import type { MatchStatus, MatchRequestStatus } from '../../types/domain';

export type Match = {
  id: string;
  booking_id: string;
  organizer_id: string;
  spots_total: number;
  spots_taken: number;
  is_split_payment: boolean;
  price_per_player: number;
  payment_deadline: string;
  status: MatchStatus;
  description: string | null;
  created_at: string;
};

export type MatchRequest = {
  id: string;
  match_id: string;
  player_id: string;
  status: MatchRequestStatus;
  paid: boolean;
  mp_payment_id: string | null;
  created_at: string;
  decided_at: string | null;
};

export type CreateMatchInput = {
  booking_id: string;
  organizer_id: string;
  spots_total: number;
  is_split_payment?: boolean;
  price_per_player?: number;
  payment_deadline: string;
  description?: string;
};

export type RequestToJoinInput = {
  match_id: string;
  player_id: string;
};

export class MatchesRepository {
  async getMatch(matchId: string): Promise<Match | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data;
  }

  async getMatchByBooking(bookingId: string): Promise<Match | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) throw error;
    return data;
  }

  async getOpenMatches(city?: string): Promise<Match[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        bookings!inner (
          club_id,
          court_id,
          courts!inner (
            club_id,
            clubs!inner (
              city
            )
          )
        )
      `)
      .in('status', ['open', 'payment_pending'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    let matches = data || [];
    if (city) {
      matches = matches.filter(m => 
        m.bookings?.courts?.clubs?.city === city
      );
    }
    
    return matches;
  }

  async getPlayerMatches(playerId: string): Promise<Match[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('organizer_id', playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPlayerJoinedMatches(playerId: string): Promise<Match[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('match_requests')
      .select('matches(*)')
      .eq('player_id', playerId)
      .in('status', ['approved']);

    if (error) throw error;
    return (data?.map((r: any) => r.matches).filter((m: any) => m) as unknown as Match[]) || [];
  }

  async createMatch(input: CreateMatchInput): Promise<Match> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('matches')
      .insert({
        ...input,
        spots_taken: 1,
        is_split_payment: input.is_split_payment !== false,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMatch(matchId: string, updates: Partial<Match>): Promise<Match> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async confirmMatch(matchId: string): Promise<Match> {
    return this.updateMatch(matchId, { status: 'confirmed' });
  }

  async finishMatch(matchId: string): Promise<Match> {
    return this.updateMatch(matchId, { status: 'finished' });
  }

  async cancelMatch(matchId: string): Promise<Match> {
    return this.updateMatch(matchId, { status: 'cancelled' });
  }

  async getMatchRequests(matchId: string): Promise<MatchRequest[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('match_requests')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async requestToJoin(input: RequestToJoinInput): Promise<MatchRequest> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('match_requests')
      .insert({
        ...input,
        status: 'pending',
        paid: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async approveRequest(requestId: string): Promise<MatchRequest> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('match_requests')
      .update({
        status: 'approved',
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async rejectRequest(requestId: string): Promise<MatchRequest> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('match_requests')
      .update({
        status: 'rejected',
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markRequestAsPaid(requestId: string, mpPaymentId: string): Promise<MatchRequest> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('match_requests')
      .update({
        paid: true,
        mp_payment_id: mpPaymentId,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async incrementSpotsTaken(matchId: string): Promise<Match> {
    const match = await this.getMatch(matchId);
    if (!match) throw new Error('Match not found');

    return this.updateMatch(matchId, { spots_taken: match.spots_taken + 1 });
  }

  async decrementSpotsTaken(matchId: string): Promise<Match> {
    const match = await this.getMatch(matchId);
    if (!match) throw new Error('Match not found');

    return this.updateMatch(matchId, { spots_taken: match.spots_taken - 1 });
  }
}

export const matchesRepository = new MatchesRepository();
