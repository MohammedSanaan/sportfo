// Pulled out of registration-draft.ts into its own file (relative imports
// only, no "@/..." alias) so this pure function -- and its test -- can run
// directly under Node's built-in test runner without a bundler, same
// reasoning as src/lib/sports/catalog.ts.

interface DisciplinePositionSource {
  sport_discipline: string | null;
  position_role: string | null;
}

// The registration form now collects one merged "Sport Discipline /
// Position / Role" field instead of two separate ones -- going forward,
// saving writes the full merged text into sport_discipline alone and
// leaves position_role untouched at whatever it last held (see
// buildSaveRegistrationArgs, which sends null for it from now on). A
// record saved before this change may still have both columns populated
// with genuinely different values; this never silently drops either:
//   - only sport_discipline set (or already the merged value) -> use it
//   - only position_role set -> fall back to it, nothing lost
//   - both set to different values -> join them for display, so a legacy
//     "Sprint" + "Striker" pair still surfaces as "Sprint / Striker"
//     rather than showing just one and dropping the other
export function deriveDisciplinePosition(sport: DisciplinePositionSource | null): string {
  if (!sport) return "";
  const discipline = sport.sport_discipline?.trim() ?? "";
  const position = sport.position_role?.trim() ?? "";
  if (discipline && position && discipline !== position) {
    return `${discipline} / ${position}`;
  }
  return discipline || position;
}
