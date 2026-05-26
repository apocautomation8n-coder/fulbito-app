import type { Court as DbCourt } from '../repositories/courts.repository';
import type { Court } from '../../types/domain';

type CourtWithClub = DbCourt & {
  clubs?: {
    id: string;
    name: string;
    neighborhood: string | null;
    city: string;
  } | {
    id: string;
    name: string;
    neighborhood: string | null;
    city: string;
  }[] | null;
};

const pickClub = (clubs: CourtWithClub['clubs']) => {
  if (!clubs) return null;
  if (Array.isArray(clubs)) return clubs[0] ?? null;
  return clubs;
};

export const mapDbCourtToDisplay = (row: CourtWithClub): Court => {
  const club = pickClub(row.clubs);

  return {
    id: row.id,
    clubId: row.club_id,
    clubName: club?.name ?? 'Club',
    name: row.name,
    sport: row.sport,
    format: row.format,
    neighborhood: club?.neighborhood ?? 'Cordoba',
    pricePerSlot: Number(row.price_per_slot),
    durationMinutes: row.duration_minutes,
    distanceKm: 0,
    rating: 4.5,
    nextSlotLabel: 'Consultar horarios',
    surfaceType: row.sport === 'padel' ? 'Padel' : 'Futbol',
  };
};
