export type UserRole = 'player' | 'club' | 'admin';

export type ClubVerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';

export type CourtSport = 'football' | 'padel';

export type PlayerSportProfileMode = CourtSport | 'both';

export type FootballPlayerProfile = {
  position?: string;
  preferredFoot?: string;
  jerseyNumber?: string;
};

export type PadelPlayerProfile = {
  preferredSide?: string;
  style?: string;
  level?: string;
};

export type CourtFormat = '1v1' | '2v2' | '5v5' | '6v6' | '7v7' | '8v8' | '9v9' | '11v11' | 'other';

export type PaymentCollectionMode = 'full' | 'deposit' | 'at_club';

export type BookingStatus =
  | 'pending_payment'
  | 'paid'
  | 'manual_block'
  | 'cancelled'
  | 'refunded';

export type MatchStatus = 'open' | 'full' | 'payment_pending' | 'confirmed' | 'finished' | 'cancelled';

export type MatchRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  clubVerificationStatus?: ClubVerificationStatus;
};

export type Court = {
  id: string;
  clubName: string;
  name: string;
  sport: CourtSport;
  format: CourtFormat;
  neighborhood: string;
  pricePerSlot: number;
  durationMinutes: number;
  distanceKm: number;
  rating: number;
  nextSlotLabel: string;
  emoji?: string;
  surfaceType?: string;
  photos?: string[];
};

export type Booking = {
  id: string;
  courtName: string;
  clubName: string;
  startsAtLabel: string;
  amount: number;
  status: BookingStatus;
  paymentMode: PaymentCollectionMode;
};

export type OpenMatch = {
  id: string;
  courtName: string;
  neighborhood: string;
  startsAtLabel: string;
  sport: CourtSport;
  format: CourtFormat;
  spotsNeeded: number;
  pricePerPlayer: number;
  status: MatchStatus;
  emoji?: string;
  hostName?: string;
};

export type PlayerRankingEntry = {
  id: string;
  fullName: string;
  neighborhood: string;
  sports: CourtSport[];
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  mvps: number;
  streak: number;
  position: string;
};

export type AdminClubReview = {
  id: string;
  clubName: string;
  neighborhood: string;
  ownerEmail: string;
  submittedAtLabel: string;
  courtsCount: number;
};
