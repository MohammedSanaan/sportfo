import type { SelectOption } from "@/types/athlete";
import type { TFunc } from "@/i18n/dictionary";

// Translates the *label* shown for an option we own (Gender, Skill Level,
// Achievement Type, ...) while leaving `value` -- the thing actually stored
// in the database -- completely untouched. Never used for user-entered
// data (athlete name, city, achievement title, etc.), only for these fixed
// enumerated lists in src/lib/athlete-options.ts.
export function translateOptions(
  t: TFunc,
  keyPrefix: string,
  options: SelectOption[],
): SelectOption[] {
  return options.map((option) => ({
    ...option,
    label: t(`${keyPrefix}.${option.value}`),
  }));
}
