// Canonical SportFo ID format: "SF" + exactly 6 digits, e.g. SF482193.
// Case-insensitive on input (entered as "sf482193" or "Sf482193" both
// match); the stored/displayed form is always canonical uppercase.
const SPORTFO_ID_PATTERN = /^SF[0-9]{6}$/;

export function isSportfoIdFormat(value: string): boolean {
  return SPORTFO_ID_PATTERN.test(value.trim().toUpperCase());
}

export function canonicalizeSportfoId(value: string): string {
  return value.trim().toUpperCase();
}
