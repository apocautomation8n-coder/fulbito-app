import { format, parseISO } from 'date-fns';

import { supabase } from '../../lib/supabase';
import type { BookingStatus, PaymentCollectionMode } from '../../types/domain';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidPlayerId = (playerId: string) => UUID_PATTERN.test(playerId);

const formatSlotLabel = (startTime?: string | null) => {
  if (!startTime) return 'Horario a confirmar';
  try {
    return format(parseISO(startTime), 'dd/MM/yyyy HH:mm');
  } catch {
    return 'Horario a confirmar';
  }
};

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

type BookingRow = Booking & {
  clubs?: { name: string } | { name: string }[] | null;
  courts?: { name: string } | { name: string }[] | null;
  time_slots?: { start_time: string; end_time: string } | { start_time: string; end_time: string }[] | null;
};

const pickName = (value?: { name: string } | { name: string }[] | null) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value[0]?.name;
  return value.name;
};

const pickSlot = (
  value?: { start_time: string; end_time: string } | { start_time: string; end_time: string }[] | null,
) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
};

const mapBookingRow = (row: BookingRow): Booking => {
  const { clubs, courts, time_slots, ...booking } = row;
  const slot = pickSlot(time_slots);

  return {
    ...booking,
    clubName: pickName(clubs),
    courtName: pickName(courts),
    startsAtLabel: formatSlotLabel(slot?.start_time),
  };
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
    if (!supabase || !isValidPlayerId(playerId)) {
      return [];
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clubs:club_id (name),
        courts:court_id (name),
        time_slots:slot_id (start_time, end_time)
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as BookingRow[] | null)?.map(mapBookingRow) ?? [];
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
