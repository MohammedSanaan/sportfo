// Centralized SportFo Sport -> Category catalog.
//
// This is the single source of truth for:
//   - the canonical list of selectable sports (the Primary Sport dropdown)
//   - the canonical list of SportFo categories
//   - which category (or categories) each sport resolves to
//
// Everything else that needs a sport list or a sport->category lookup
// (the registration form, discovery filters, profile display) should
// import from here rather than hardcoding its own copy.

// Relative import (not the "@/..." alias) so this module -- and its test --
// can run directly under Node's built-in test runner without a bundler.
import type { SelectOption } from "../../types/athlete";

// ---------------------------------------------------------------------------
// Canonical categories
// ---------------------------------------------------------------------------

export const SPORT_CATEGORIES = [
  "Adventure Sports",
  "Athletics",
  "Beach Sports",
  "Combat Sports",
  "Cycling & Racing",
  "Equestrian Sports",
  "Gymnastics",
  "Indian Indigenous Sports",
  "Mind & Strategy Sports",
  "Para Sports",
  "Paddle & Rowing Sports",
  "Racquet & Paddle Sports",
  "Roller & Skating Sports",
  "Strength Sports",
  "Target Sports",
  "Team Sports",
  "Water Sports",
  "Winter Sports",
  "Yoga & Wellness",
] as const;

export type SportCategory = (typeof SPORT_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Canonical sports list (dropdown source of truth). Order here is source
// order, not display order -- CANONICAL_SPORTS below sorts alphabetically
// for browsing, per product requirement.
// ---------------------------------------------------------------------------

const CANONICAL_SPORTS_SOURCE = [
  "Acrobatics",
  "Aikido",
  "Alpine Skiing",
  "American Football",
  "Archery",
  "Artistic Gymnastics",
  "Athletics – Decathlon",
  "Athletics – Discus Throw",
  "Athletics – Hammer Throw",
  "Athletics – Heptathlon",
  "Athletics – High Jump",
  "Athletics – Hurdles",
  "Athletics – Javelin Throw",
  "Athletics – Long Jump",
  "Athletics – Marathon / Long Distance (All Category)",
  "Athletics – Pole Vault",
  "Athletics – Relay",
  "Athletics – Shot Put",
  "Athletics – Sprint (All Category)",
  "Athletics – Triple Jump",
  "Athletics – Others",
  "Badminton",
  "Ball Badminton",
  "Baseball",
  "Basketball",
  "Beach Soccer",
  "Beach Tennis",
  "Beach Volleyball",
  "Best Physique",
  "Blind Cricket",
  "Bodybuilding",
  "Bobsleigh",
  "Boat Racing (Vallam Kali)",
  "Bowling",
  "Boxing",
  "BMX",
  "Bridge",
  "Brazilian Jiu-Jitsu",
  "Carrom",
  "Canoeing",
  "Canoeing & Kayaking",
  "Cheerleading",
  "Chess",
  "Circle Style Kabaddi",
  "Cross Country Races",
  "Cricket",
  "CrossFit",
  "Curling",
  "Cycling – BMX",
  "Cycling – Mountain Biking",
  "Cycling – Road",
  "Cycling – Track",
  "Darts",
  "Decathlon",
  "Diving",
  "Dragon Boat Racing",
  "Drone Racing",
  "Drop Roball",
  "Dressage",
  "E-Sports",
  "Eventing",
  "Fencing",
  "Field Hockey",
  "Football (Soccer)",
  "Freerunning",
  "Freestyle Skiing",
  "Futsal",
  "Gaelic Football",
  "Golf",
  "Go (Board Game)",
  "Gully Cricket",
  "Gymnastics – Artistic",
  "Gymnastics – Rhythmic",
  "Hammer Throw",
  "Handball",
  "Heptathlon",
  "High Jump",
  "Horse Racing",
  "Hockey",
  "Hurling",
  "Ice Hockey",
  "Ice Skating",
  "Javelin Throw",
  "Judo",
  "Kabaddi",
  "Karting",
  "Karate",
  "Kayaking",
  "Kick Boxing",
  "Kite Surfing",
  "Kho-Kho",
  "Korf Ball",
  "Wrestling",
  "Lagori (Seven Stones)",
  "Lacrosse",
  "Long-Distance Running",
  "Long Jump",
  "Luge",
  "Mallakhamba",
  "Marathon",
  "Mini Golf",
  "Middle-Distance Running",
  "Mixed Martial Arts (MMA)",
  "MotoGP",
  "Motor Racing (F1)",
  "Mountain Biking",
  "Muay Thai",
  "Netball",
  "Nordic Skiing",
  "Orienteering",
  "Para Athletics",
  "Para Swimming",
  "Para (Others)",
  "Parkour",
  "Paragliding",
  "Paddle Tennis",
  "Pencak Silat",
  "Pickleball",
  "Pole Vault",
  "Power Lifting",
  "Qwan Ki Do",
  "Racquetball",
  "Rally Racing",
  "Real Tennis",
  "Relay",
  "Rhythmic Gymnastics",
  "Rock Climbing",
  "Roll Ball",
  "Roller Hockey",
  "Roller Sports",
  "Rope Skipping",
  "Rowing",
  "Rugby League",
  "Rugby Sevens",
  "Rugby Union",
  "Sailing",
  "Sambo",
  "Shooting – Pistol",
  "Shooting – Rifle",
  "Shooting – Shotgun",
  "Shot Put",
  "Show Jumping",
  "Silambam",
  "Skiing – Alpine",
  "Skiing – Nordic",
  "Skydiving",
  "Snowboarding",
  "Soft Tennis",
  "Softball",
  "Squash",
  "Stand-Up Paddleboarding",
  "Strongman",
  "Sumo",
  "Surfing",
  "Swimming",
  "Table Tennis",
  "Taekwondo",
  "Target Ball",
  "Tennis",
  "Trail Running",
  "Trampolining",
  "Triple Jump",
  "Tug of War",
  "Ultimate Frisbee",
  "Volleyball",
  "Water Polo",
  "Weightlifting",
  "Wheelchair Basketball",
  "Wheelchair Racing",
  "Windsurfing",
  "Woodball",
  "Wushu",
  "Yachting",
  "Yoga",
  "Others",
] as const;

export type CanonicalSport = (typeof CANONICAL_SPORTS_SOURCE)[number];

// Alphabetical, for browsing -- never reordered by popularity.
export const CANONICAL_SPORTS: string[] = [...CANONICAL_SPORTS_SOURCE].sort((a, b) =>
  a.localeCompare(b),
);

// ---------------------------------------------------------------------------
// Aliases: canonical dropdown label -> the label used to key
// SPORT_CATEGORY_MAP below, for sports where the two differ. The canonical
// dropdown value shown to the user and stored on save is never rewritten --
// aliasing only affects category lookup.
// ---------------------------------------------------------------------------

const SPORT_ALIASES: Record<string, string> = {
  "Mixed Martial Arts (MMA)": "MMA",
  "Power Lifting": "Powerlifting",
  "Cycling – Road": "Road Cycling",
  "Cycling – Track": "Track Cycling",
  "Cycling – Mountain Biking": "Mountain Biking",
  "Cycling – BMX": "BMX",
  "Skiing – Alpine": "Alpine Skiing",
  "Skiing – Nordic": "Nordic Skiing",
  "Gymnastics – Artistic": "Artistic Gymnastics",
  "Gymnastics – Rhythmic": "Rhythmic Gymnastics",
  "Go (Board Game)": "Go",
  "Lagori (Seven Stones)": "Lagori",
  "Para (Others)": "Para Others",
  "Athletics – Decathlon": "Decathlon",
  "Athletics – Discus Throw": "Discus Throw",
  "Athletics – Hammer Throw": "Hammer Throw",
  "Athletics – Heptathlon": "Heptathlon",
  "Athletics – High Jump": "High Jump",
  "Athletics – Hurdles": "Hurdles",
  "Athletics – Javelin Throw": "Javelin Throw",
  "Athletics – Long Jump": "Long Jump",
  "Athletics – Pole Vault": "Pole Vault",
  "Athletics – Relay": "Relay",
  "Athletics – Shot Put": "Shot Put",
  "Athletics – Triple Jump": "Triple Jump",
  "Athletics – Sprint (All Category)": "Sprinting",
  // Both "Marathon" and "Long-Distance Running" resolve to the single
  // Athletics category, so this combined entry is unambiguous.
  "Athletics – Marathon / Long Distance (All Category)": "Marathon",
  // Both Freestyle and Greco-Roman wrestling resolve to the single Combat
  // Sports category, so collapsing the plain "Wrestling" canonical entry
  // onto either mapping label is unambiguous.
  Wrestling: "Wrestling – Freestyle",
};

// ---------------------------------------------------------------------------
// Sport -> Category mapping (source of truth supplied by product).
// Keyed by the *mapping* label (see SPORT_ALIASES above for sports whose
// canonical dropdown label differs from this key). Sports with legitimate
// overlaps carry more than one category -- never silently collapsed to one.
// ---------------------------------------------------------------------------

const SPORT_CATEGORY_MAP: Record<string, SportCategory[]> = {
  // Adventure Sports
  "Rock Climbing": ["Adventure Sports"],
  Mountaineering: ["Adventure Sports"],
  Trekking: ["Adventure Sports"],
  Orienteering: ["Adventure Sports"],
  "Trail Running": ["Adventure Sports"],
  Paragliding: ["Adventure Sports"],
  Skydiving: ["Adventure Sports"],

  // Athletics
  Sprinting: ["Athletics"],
  "Middle-Distance Running": ["Athletics"],
  "Long-Distance Running": ["Athletics"],
  Marathon: ["Athletics"],
  Hurdles: ["Athletics"],
  Relay: ["Athletics"],
  "Long Jump": ["Athletics"],
  "High Jump": ["Athletics"],
  "Triple Jump": ["Athletics"],
  "Pole Vault": ["Athletics"],
  "Shot Put": ["Athletics"],
  "Discus Throw": ["Athletics"],
  "Javelin Throw": ["Athletics"],
  "Hammer Throw": ["Athletics"],
  Decathlon: ["Athletics"],
  Heptathlon: ["Athletics"],
  "Cross Country Races": ["Athletics"],
  // Not aliased from a supplied mapping label -- the sport's own dropdown
  // name states its category explicitly ("Athletics – Others"), so this is
  // a direct read of the name, not a guessed classification.
  "Athletics – Others": ["Athletics"],

  // Beach Sports
  "Beach Volleyball": ["Beach Sports"],
  "Beach Soccer": ["Beach Sports"],
  "Beach Tennis": ["Beach Sports"],
  "Kite Surfing": ["Beach Sports"],
  Surfing: ["Beach Sports", "Water Sports"],

  // Combat Sports
  Boxing: ["Combat Sports"],
  "Wrestling – Freestyle": ["Combat Sports"],
  "Wrestling – Greco Roman": ["Combat Sports"],
  Judo: ["Combat Sports"],
  Karate: ["Combat Sports"],
  Taekwondo: ["Combat Sports"],
  "Kick Boxing": ["Combat Sports"],
  MMA: ["Combat Sports"],
  "Brazilian Jiu-Jitsu": ["Combat Sports"],
  "Muay Thai": ["Combat Sports"],
  Silambam: ["Indian Indigenous Sports", "Combat Sports"],
  Aikido: ["Combat Sports"],
  "Kung Fu": ["Combat Sports"],
  Sambo: ["Combat Sports"],
  Sumo: ["Combat Sports"],
  "Qwan Ki Do": ["Combat Sports"],
  "Pencak Silat": ["Combat Sports"],

  // Cycling & Racing
  "Road Cycling": ["Cycling & Racing"],
  "Track Cycling": ["Cycling & Racing"],
  "Mountain Biking": ["Cycling & Racing"],
  BMX: ["Cycling & Racing"],
  "Motor Racing (F1)": ["Cycling & Racing"],
  MotoGP: ["Cycling & Racing"],
  "Rally Racing": ["Cycling & Racing"],
  Karting: ["Cycling & Racing"],
  "Drone Racing": ["Cycling & Racing"],

  // Equestrian Sports
  "Horse Racing": ["Equestrian Sports"],
  "Show Jumping": ["Equestrian Sports"],
  Dressage: ["Equestrian Sports"],
  Eventing: ["Equestrian Sports"],
  Yachting: ["Equestrian Sports"],

  // Gymnastics
  "Artistic Gymnastics": ["Gymnastics"],
  "Rhythmic Gymnastics": ["Gymnastics"],
  Trampolining: ["Gymnastics"],
  Cheerleading: ["Gymnastics"],
  Parkour: ["Gymnastics"],
  Freerunning: ["Gymnastics"],
  Acrobatics: ["Gymnastics"],

  // Indian Indigenous Sports
  Kabaddi: ["Indian Indigenous Sports", "Team Sports"],
  "Circle Style Kabaddi": ["Indian Indigenous Sports", "Team Sports"],
  "Kho-Kho": ["Indian Indigenous Sports", "Team Sports"],
  Mallakhamba: ["Indian Indigenous Sports"],
  "Gully Cricket": ["Indian Indigenous Sports"],
  Lagori: ["Indian Indigenous Sports"],
  "Boat Racing (Vallam Kali)": ["Indian Indigenous Sports"],

  // Mind & Strategy Sports
  Chess: ["Mind & Strategy Sports"],
  Carrom: ["Mind & Strategy Sports"],
  Bridge: ["Mind & Strategy Sports"],
  Go: ["Mind & Strategy Sports"],

  // Para Sports
  "Wheelchair Basketball": ["Para Sports"],
  "Wheelchair Racing": ["Para Sports"],
  "Para Swimming": ["Para Sports"],
  "Para Athletics": ["Para Sports"],
  "Blind Cricket": ["Para Sports"],
  "Para Others": ["Para Sports"],

  // Paddle & Rowing Sports
  Canoeing: ["Paddle & Rowing Sports", "Water Sports"],
  Kayaking: ["Paddle & Rowing Sports", "Water Sports"],
  Rowing: ["Paddle & Rowing Sports", "Water Sports"],
  "Dragon Boat Racing": ["Paddle & Rowing Sports"],
  "Stand-Up Paddleboarding": ["Paddle & Rowing Sports", "Water Sports"],
  "Canoeing & Kayaking": ["Paddle & Rowing Sports"],

  // Racquet & Paddle Sports
  Badminton: ["Racquet & Paddle Sports"],
  "Ball Badminton": ["Racquet & Paddle Sports"],
  Tennis: ["Racquet & Paddle Sports"],
  "Table Tennis": ["Racquet & Paddle Sports"],
  Squash: ["Racquet & Paddle Sports"],
  Pickleball: ["Racquet & Paddle Sports"],
  "Paddle Tennis": ["Racquet & Paddle Sports"],
  Racquetball: ["Racquet & Paddle Sports"],
  "Soft Tennis": ["Racquet & Paddle Sports"],
  "Real Tennis": ["Racquet & Paddle Sports"],

  // Roller & Skating Sports
  "Roller Hockey": ["Roller & Skating Sports"],
  "Roller Sports": ["Roller & Skating Sports"],
  "Roll Ball": ["Roller & Skating Sports", "Team Sports"],
  "Rope Skipping": ["Roller & Skating Sports"],
  "Ice Skating": ["Roller & Skating Sports", "Winter Sports"],

  // Strength Sports
  Weightlifting: ["Strength Sports"],
  Powerlifting: ["Strength Sports"],
  Bodybuilding: ["Strength Sports"],
  Strongman: ["Strength Sports"],
  CrossFit: ["Strength Sports"],
  "Best Physique": ["Strength Sports"],

  // Target Sports
  Archery: ["Target Sports"],
  "Shooting – Rifle": ["Target Sports"],
  "Shooting – Pistol": ["Target Sports"],
  "Shooting – Shotgun": ["Target Sports"],
  Darts: ["Target Sports"],
  Golf: ["Target Sports"],
  Bowling: ["Target Sports"],
  "Target Ball": ["Target Sports"],
  "Mini Golf": ["Target Sports"],
  Woodball: ["Target Sports"],

  // Team Sports
  "Football (Soccer)": ["Team Sports"],
  Cricket: ["Team Sports"],
  Basketball: ["Team Sports"],
  Volleyball: ["Team Sports"],
  Handball: ["Team Sports"],
  "Field Hockey": ["Team Sports"],
  "Ice Hockey": ["Team Sports", "Winter Sports"],
  "Rugby Union": ["Team Sports"],
  "Rugby League": ["Team Sports"],
  "Rugby Sevens": ["Team Sports"],
  Baseball: ["Team Sports"],
  Softball: ["Team Sports"],
  Netball: ["Team Sports"],
  Lacrosse: ["Team Sports"],
  "Water Polo": ["Team Sports", "Water Sports"],
  "Ultimate Frisbee": ["Team Sports"],
  Futsal: ["Team Sports"],
  "American Football": ["Team Sports"],
  "Gaelic Football": ["Team Sports"],
  Hurling: ["Team Sports"],
  "Drop Roball": ["Team Sports"],

  // Water Sports
  Swimming: ["Water Sports"],
  Diving: ["Water Sports"],
  Sailing: ["Water Sports"],
  Windsurfing: ["Water Sports"],

  // Winter Sports
  "Alpine Skiing": ["Winter Sports"],
  "Nordic Skiing": ["Winter Sports"],
  "Freestyle Skiing": ["Winter Sports"],
  Snowboarding: ["Winter Sports"],
  Curling: ["Winter Sports"],
  Luge: ["Winter Sports"],
  Bobsleigh: ["Winter Sports"],

  // Yoga & Wellness
  Yoga: ["Yoga & Wellness"],
};

function normalizeSportLabel(sport: string): string {
  return SPORT_ALIASES[sport] ?? sport;
}

// Sports with no clear category in the supplied source resolve to an empty
// array rather than a guessed category -- the UI is responsible for showing
// "Select category" (unresolved, not auto-assigned to "Others" or anything
// else) when this comes back empty. See the audit helpers below for the
// full unresolved list.
export function getCategoriesForSport(sport: string | null | undefined): SportCategory[] {
  if (!sport) return [];
  return SPORT_CATEGORY_MAP[normalizeSportLabel(sport)] ?? [];
}

// ---------------------------------------------------------------------------
// Select options for the Sport dropdown/combobox. value === label: the
// canonical sport name itself is the stored value (see AthleteRegistration
// requirements -- no slugs, no combined "Category - Sport" strings).
// ---------------------------------------------------------------------------

export const SPORT_OPTIONS: SelectOption[] = CANONICAL_SPORTS.map((sport) => ({
  value: sport,
  label: sport,
}));

export const CATEGORY_OPTIONS: SelectOption[] = SPORT_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

// ---------------------------------------------------------------------------
// Full catalog entries -- one per canonical sport, alphabetical, each
// carrying its resolved categories. Used for the searchable/grouped Sport
// combobox UI as well as the audit utilities below.
// ---------------------------------------------------------------------------

export interface SportCatalogEntry {
  sport: string;
  categories: SportCategory[];
  /** First resolved category, used only to pick a single browsing group for
   * a multi-category sport -- never used to decide the *stored* category. */
  primaryCategory: SportCategory | "Uncategorized";
}

export const SPORTS_CATALOG: SportCatalogEntry[] = CANONICAL_SPORTS.map((sport) => {
  const categories = getCategoriesForSport(sport);
  return {
    sport,
    categories,
    primaryCategory: categories[0] ?? "Uncategorized",
  };
});

export interface SportsCatalogGroup {
  group: SportCategory | "Uncategorized";
  sports: SportCatalogEntry[];
}

// Grouped once at module load (the catalog is static) for the combobox's
// "browse without a search query" view. Group order follows SPORT_CATEGORIES
// order, with unresolved sports collected in a trailing "Uncategorized"
// group -- never distributed into a guessed category.
export const SPORTS_GROUPED_FOR_BROWSING: SportsCatalogGroup[] = (() => {
  const groups: SportsCatalogGroup[] = [...SPORT_CATEGORIES, "Uncategorized" as const].map(
    (group) => ({ group, sports: [] as SportCatalogEntry[] }),
  );
  const byGroup = new Map(groups.map((g) => [g.group, g]));
  for (const entry of SPORTS_CATALOG) {
    byGroup.get(entry.primaryCategory)?.sports.push(entry);
  }
  return groups.filter((g) => g.sports.length > 0);
})();

// ---------------------------------------------------------------------------
// Audit utilities -- report every canonical sport, its resolved
// categories (if any), and flag unresolved / multi-category sports. Backs
// both the automated test in catalog.test.ts and the implementation report.
// ---------------------------------------------------------------------------

export interface SportsCatalogAuditEntry {
  sport: string;
  lookupLabel: string;
  categories: SportCategory[];
  resolved: boolean;
  multiCategory: boolean;
}

export function auditSportsCatalog(): SportsCatalogAuditEntry[] {
  return CANONICAL_SPORTS.map((sport) => {
    const categories = getCategoriesForSport(sport);
    return {
      sport,
      lookupLabel: normalizeSportLabel(sport),
      categories,
      resolved: categories.length > 0,
      multiCategory: categories.length > 1,
    };
  });
}

export function getUnresolvedSports(): string[] {
  return auditSportsCatalog()
    .filter((entry) => !entry.resolved)
    .map((entry) => entry.sport);
}

export function getMultiCategorySports(): SportsCatalogAuditEntry[] {
  return auditSportsCatalog().filter((entry) => entry.multiCategory);
}
