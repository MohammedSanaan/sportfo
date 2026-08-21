// Shapes for the homepage's presentational sections. All values below are
// realistic sample data for layout/visual purposes only -- swap
// mock-data.ts for a Supabase-backed fetch later without touching the
// section components, which only depend on these types.

import type { MediaKey } from "./media";

export interface AthleteCard {
  id: string;
  name: string;
  sport: string;
  position: string;
  location: string;
  skillLevel: string;
  ranking: string;
  club: string;
  verified: boolean;
  achievementsCount: number;
  // Portrait used on discovery/profile surfaces. Optional: an athlete
  // without one still renders, falling back to the monogram treatment.
  photo?: MediaKey;
  // Headline performance mark, shown as the card's single number.
  mark?: { label: string; value: string };
  // One or two short achievement lines shown on the discovery card/drawer.
  achievements?: string[];
}

export interface CreatorCard {
  id: string;
  name: string;
  role: string;
  specialty: string;
  location: string;
  photo?: MediaKey;
  reach: string;
}

export interface AcademyCard {
  id: string;
  name: string;
  location: string;
  sports: string[];
  focus: string;
  established: string;
  athletes: string;
}

export interface EventCard {
  id: string;
  title: string;
  sport: string;
  month: string;
  day: string;
  location: string;
  type: "Trial" | "Tournament" | "Camp" | "Showcase";
  spots: string;
  // Days from the reference "today" used for the compact week filter.
  // Mocked as a fixed offset rather than a real date so filtering stays
  // deterministic without a live clock.
  daysFromNow: number;
  organizer: string;
  registrationStatus: "Open" | "Filling fast" | "Waitlist";
  description: string;
  image?: MediaKey;
}

export interface OpportunityCard {
  id: string;
  title: string;
  category: "Trial" | "Sponsorship" | "Academy" | "Job" | "Coaching" | "Event";
  organization: string;
  location: string;
  closes: string;
  detail: string;
  sport: string;
  postedDate: string;
  description: string;
}

export interface EcosystemNode {
  id: string;
  label: string;
  description: string;
  count: string;
}

export interface AchievementCard {
  id: string;
  title: string;
  athleteName: string;
  sport: string;
  org: string;
  year: string;
}
