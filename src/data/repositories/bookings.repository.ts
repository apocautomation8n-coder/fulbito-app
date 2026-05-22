import { supabase } from '../../lib/supabase';
import type { BookingStatus, PaymentCollectionMode } from '../../types/domain';

export type TimeSlot = {
  id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'held' | 'booked' | 'manual_block' | 'cancelled';
  held_until: string | null;
  created_by: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  player_id: string | null;
  slot_id: string;
  club_id: string;
  court_id: string;
  total_amount: number;
  amount_due_now: number;
  app_commission: number;
  club_amount: number;
  payment_mode: PaymentCollectionMode;
  mp_payment_id: string | null;
  status: BookingStatus;
  is_manual: boolean;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  clubName?: string;
  courtName?: string;
  startsAtLabel?: string;
};

export type CreateBookingInput = {
  player_id?: string;
  slot_id: string;
  club_id: string;
  court_id: string;
  total_amount: number;
  amount_due_now: number;
  app_commission: number;
  club_amount: number;
  payment_mode: PaymentCollectionMode;
  is_manual?: boolean;
};

export class BookingsRepository {
  async getTimeSlot(slotId: string): Promise<TimeSlot | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (error) throw error;
    return data;
  }

  async getAvailableSlots(
    courtId: string,
    startDate: string,
    endDate: string,
  ): Promise<TimeSlot[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('court_id', courtId)
      .eq('status', 'available')
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createTimeSlot(
    courtId: string,
    startTime: string,
    endTime: string,
    createdBy?: string,
  ): Promise<TimeSlot> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        status: 'available',
        created_by: createdBy || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async holdSlot(slotId: string, userId: string, holdUntil: string): Promise<TimeSlot> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('time_slots')
      .update({
        status: 'held',
        held_until: holdUntil,
        created_by: userId,
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async releaseSlot(slotId: string): Promise<TimeSlot> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('time_slots')
      .update({
        status: 'available',
        held_until: null,
        created_by: null,
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async bookSlot(slotId: string): Promise<TimeSlot> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('time_slots')
      .update({
        status: 'booked',
        held_until: null,
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async blockSlotManually(
    courtId: string,
    startTime: string,
    endTime: string,
    userId: string,
  ): Promise<TimeSlot> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        court_id: courtId,
        start_time: startTime,
        end_time: endTime,
        status: 'manual_block',
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data;
  }

  async getPlayerBookings(playerId: string): Promise<Booking[]> {
    if (!supabase) {
      return [
        {
          id: 'b-101',
          player_id: playerId,
          slot_id: 'slot-1',
          club_id: 'club-1',
          court_id: 'court-1',
          total_amount: 28000,
          amount_due_now: 700,
          app_commission: 1400,
          club_amount: 28000,
          payment_mode: 'at_club',
          mp_payment_id: 'mp-99081',
          status: 'paid',
          is_manual: false,
          created_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          cancelled_at: null,
          clubName: 'La Docta Futbol',
          courtName: 'Cancha 1 (Sintetico)',
          startsAtLabel: 'Hoy 21:00 hs',
        },
        {
          id: 'b-102',
          player_id: playerId,
          slot_id: 'slot-2',
          club_id: 'club-2',
          court_id: 'court-2',
          total_amount: 22000,
          amount_due_now: 550,
          app_commission: 1100,
          club_amount: 22000,
          payment_mode: 'at_club',
          mp_payment_id: null,
          status: 'pending_payment',
          is_manual: false,
          created_at: new Date().toISOString(),
          paid_at: null,
          cancelled_at: null,
          clubName: 'Barrio Norte Club',
          courtName: 'Sintetico A',
          startsAtLabel: 'Dia siguiente 19:00 hs',
        },
        {
          id: 'b-103',
          player_id: playerId,
          slot_id: 'slot-3',
          club_id: 'club-3',
          court_id: 'court-3',
          total_amount: 64000,
          amount_due_now: 1600,
          app_commission: 3200,
          club_amount: 64000,
          payment_mode: 'at_club',
          mp_payment_id: 'mp-88992',
          status: 'paid',
          is_manual: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          paid_at: new Date(Date.now() - 86400000).toISOString(),
          cancelled_at: null,
          clubName: 'Predio Kempes',
          courtName: 'Cancha Grande (Cesped)',
          startsAtLabel: 'Sabado 18:00 hs',
        },
        {
          id: 'b-104',
          player_id: playerId,
          slot_id: 'slot-4',
          club_id: 'club-4',
          court_id: 'court-4',
          total_amount: 20000,
          amount_due_now: 500,
          app_commission: 1000,
          club_amount: 20000,
          payment_mode: 'at_club',
          mp_payment_id: null,
          status: 'cancelled',
          is_manual: false,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          paid_at: null,
          cancelled_at: new Date(Date.now() - 172800000).toISOString(),
          clubName: 'Complejo El Bosque',
          courtName: 'Cancha 3',
          startsAtLabel: 'Ayer 20:00 hs',
        },
      ];
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getClubBookings(clubId: string): Promise<Booking[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...input,
        is_manual: input.is_manual || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBookingPayment(
    bookingId: string,
    mpPaymentId: string,
  ): Promise<Booking> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        mp_payment_id: mpPaymentId,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const bookingsRepository = new BookingsRepository();
