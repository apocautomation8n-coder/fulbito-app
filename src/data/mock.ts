import type { AdminClubReview, Booking, Court, OpenMatch, PlayerRankingEntry } from '../types/domain';

/** @deprecated Sin datos mock en produccion. Usar repositorios Supabase. */
export const featuredCourts: Court[] = [];
export const upcomingBookings: Booking[] = [];
export const openMatches: OpenMatch[] = [];
export const playerRanking: PlayerRankingEntry[] = [];
export const clubsPendingReview: AdminClubReview[] = [];
