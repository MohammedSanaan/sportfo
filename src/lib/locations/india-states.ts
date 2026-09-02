// The complete current list of Indian States and Union Territories, for
// the Personal Details "State" field when Country = India (see
// PersonalDetailsSection). Single source of truth -- never hardcode this
// list inline in a component.
//
// value === label, the proper name itself (never a slug) -- same
// convention as PRIMARY_SPORTS/CATEGORY_OPTIONS in athlete-options.ts:
// these are real, stable proper nouns, not an enum needing a separate
// code. This also makes existing free-text State values (already stored
// as the plain typed name, e.g. "Karnataka") match a catalog entry
// directly with zero mapping layer.
import type { SelectOption } from "@/types/athlete";

const INDIA_STATE_NAMES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

const INDIA_UNION_TERRITORY_NAMES = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

// One flat, alphabetically-sorted list -- States and Union Territories are
// not visually grouped in the dropdown (the task asks for alphabetical
// ordering, not a two-section picker), but INDIA_STATE_NAMES/
// INDIA_UNION_TERRITORY_NAMES stay separately exported in case a future
// caller needs the distinction (e.g. an analytics or address-format need).
export const INDIA_STATES_AND_UTS: SelectOption[] = [...INDIA_STATE_NAMES, ...INDIA_UNION_TERRITORY_NAMES]
  .map((name) => ({ value: name, label: name }))
  .sort((a, b) => a.label.localeCompare(b.label));

const INDIA_STATE_LOOKUP = new Map(
  INDIA_STATES_AND_UTS.map((option) => [option.value.trim().toLowerCase().replace(/\s+/g, " "), option.value]),
);

// Case/whitespace-tolerant match against the catalog -- used when loading
// an existing free-text State value (e.g. a pre-dropdown record saved as
// "karnataka" or "Karnataka ") so the select still auto-picks the right
// option. Returns the value UNCHANGED (never blanked) when it doesn't
// match anything in the catalog -- an athlete's real, already-saved State
// text is never silently discarded just because it isn't (or isn't yet)
// a recognized State/UT name.
export function normalizeIndiaState(rawValue: string): string {
  const trimmed = rawValue.trim();
  if (!trimmed) return rawValue;
  const match = INDIA_STATE_LOOKUP.get(trimmed.toLowerCase().replace(/\s+/g, " "));
  return match ?? rawValue;
}

// "India" is SportFo's primary market default (see buildEmptyFormValues),
// but Country is a free-text field -- this only recognizes the exact
// literal default spelling, deliberately not a fuzzy match, since a
// dropdown decision (which widget to render) should be predictable and
// not silently reinterpret e.g. "Indian Ocean Territory" as India.
export function isIndiaCountryValue(country: string): boolean {
  return country.trim().toLowerCase() === "india";
}
