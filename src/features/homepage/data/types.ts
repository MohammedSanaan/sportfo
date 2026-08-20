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
}

export interface SportVisual {
  id: string;
  name: string;
  tagline: string;
  // Playing-surface spec, printed beside the diagram to reinforce that
  // SportFo describes sport in measurements rather than adjectives.
  surface: string;
  athletes: string;
  events: string;
  // Atmosphere behind the diagram. Absent for the disciplines with no
  // photography in the licensed set -- the panel then runs drawing-only.
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
}

export interface EcosystemNode {
  id: string;
  label: string;
  description: string;
  count: string;
}
