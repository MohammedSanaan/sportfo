import type { SportVisual } from "./types";

/**
 * The eight disciplines SportFo launches with.
 *
 * `image` is the atmosphere behind the sport's panel; `diagram` (rendered
 * from the sport id) is the structure drawn on top of it. Where no
 * photography of a discipline exists in the licensed set — cricket,
 * badminton, hockey — the panel falls back to the drawing alone against
 * navy, which is a deliberate part of the system rather than a gap: the
 * linework is the constant, the photograph is the accent.
 *
 * Counts are sample values. They are shaped like the real aggregate the
 * profiles table will eventually produce, so wiring this to Supabase is a
 * query swap rather than a redesign.
 */
export const SPORTS_VISUALS: SportVisual[] = [
  {
    id: "cricket",
    name: "Cricket",
    tagline: "From the nets to national selection.",
    surface: "Oval · 22-yard pitch",
    athletes: "14,208",
    events: "212",
  },
  {
    id: "football",
    name: "Football",
    tagline: "Every touch, tracked and recognised.",
    surface: "105 × 68 m pitch",
    athletes: "11,640",
    events: "186",
    image: "footballPitch",
  },
  {
    id: "badminton",
    name: "Badminton",
    tagline: "Precision earns a professional record.",
    surface: "13.4 × 6.1 m court",
    athletes: "6,915",
    events: "148",
  },
  {
    id: "tennis",
    name: "Tennis",
    tagline: "Rankings that travel with you.",
    surface: "23.77 × 10.97 m court",
    athletes: "5,402",
    events: "131",
    image: "tennisGeometry",
  },
  {
    id: "athletics",
    name: "Athletics",
    tagline: "Every split, part of your story.",
    surface: "400 m oval · 8 lanes",
    athletes: "9,873",
    events: "204",
    image: "trackLanes",
  },
  {
    id: "basketball",
    name: "Basketball",
    tagline: "Court time that builds a career.",
    surface: "28 × 15 m court",
    athletes: "4,760",
    events: "96",
    image: "basketballCourt",
  },
  {
    id: "swimming",
    name: "Swimming",
    tagline: "Times that speak for themselves.",
    surface: "50 m pool · 8 lanes",
    athletes: "3,988",
    events: "74",
    image: "poolLanes",
  },
  {
    id: "hockey",
    name: "Hockey",
    tagline: "Team sport, individual identity.",
    surface: "91.4 × 55 m pitch",
    athletes: "3,214",
    events: "88",
  },
];
