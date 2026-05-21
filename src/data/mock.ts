import type { AdminClubReview, Booking, Court, OpenMatch } from '../types/domain';

export const featuredCourts: Court[] = [
  {
    id: 'court-1',
    clubName: 'La Docta Futbol',
    name: 'Cancha 1',
    format: '7v7',
    neighborhood: 'Nueva Cordoba',
    pricePerSlot: 28000,
    durationMinutes: 60,
    distanceKm: 1.8,
    rating: 4.7,
    nextSlotLabel: 'Hoy 21:00',
  },
  {
    id: 'court-2',
    clubName: 'Barrio Norte Club',
    name: 'Sintetico A',
    format: '5v5',
    neighborhood: 'Alta Cordoba',
    pricePerSlot: 22000,
    durationMinutes: 60,
    distanceKm: 3.2,
    rating: 4.5,
    nextSlotLabel: 'Manana 19:00',
  },
  {
    id: 'court-3',
    clubName: 'Predio Kempes',
    name: 'Cancha Grande',
    format: '11v11',
    neighborhood: 'Chateau Carreras',
    pricePerSlot: 64000,
    durationMinutes: 90,
    distanceKm: 6.4,
    rating: 4.8,
    nextSlotLabel: 'Sabado 18:00',
  },
];

export const upcomingBookings: Booking[] = [
  {
    id: 'booking-1',
    courtName: 'Cancha 1',
    clubName: 'La Docta Futbol',
    startsAtLabel: 'Hoy 21:00',
    amount: 28000,
    status: 'pending_payment',
    paymentMode: 'full',
  },
  {
    id: 'booking-2',
    courtName: 'Sintetico A',
    clubName: 'Barrio Norte Club',
    startsAtLabel: 'Viernes 20:00',
    amount: 11000,
    status: 'paid',
    paymentMode: 'deposit',
  },
];

export const openMatches: OpenMatch[] = [
  {
    id: 'match-1',
    courtName: 'La Docta Futbol - Cancha 1',
    neighborhood: 'Nueva Cordoba',
    startsAtLabel: 'Hoy 21:00',
    format: '7v7',
    spotsNeeded: 3,
    pricePerPlayer: 2000,
    status: 'open',
  },
  {
    id: 'match-2',
    courtName: 'Barrio Norte Club - Sintetico A',
    neighborhood: 'Alta Cordoba',
    startsAtLabel: 'Manana 19:00',
    format: '5v5',
    spotsNeeded: 1,
    pricePerPlayer: 2200,
    status: 'payment_pending',
  },
];

export const clubsPendingReview: AdminClubReview[] = [
  {
    id: 'club-review-1',
    clubName: 'La Docta Futbol',
    neighborhood: 'Nueva Cordoba',
    ownerEmail: 'admin@ladocta.example',
    submittedAtLabel: 'Hoy 10:24',
    courtsCount: 3,
  },
  {
    id: 'club-review-2',
    clubName: 'Barrio Norte Club',
    neighborhood: 'Alta Cordoba',
    ownerEmail: 'dueno@barrionorte.example',
    submittedAtLabel: 'Ayer 18:40',
    courtsCount: 2,
  },
];
