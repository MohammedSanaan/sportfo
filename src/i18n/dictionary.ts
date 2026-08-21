import { DEFAULT_LOCALE, type Locale } from "./config";
import en, { type Dictionary } from "./translations/en";
import hi from "./translations/hi";
import kn from "./translations/kn";
import ta from "./translations/ta";
import te from "./translations/te";
import ml from "./translations/ml";

export type { Dictionary };

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, kn, ta, te, ml };

function getAtPath(dict: Dictionary, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && segment in node) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

// English is the fallback for any key missing in another locale (a
// translation dictionary can lag behind new keys added to en.ts without
// ever showing "undefined", a raw key path, or a blank label).
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const primary = getAtPath(DICTIONARIES[locale], key);
  if (typeof primary === "string") return interpolate(primary, vars);

  const fallback = getAtPath(DICTIONARIES[DEFAULT_LOCALE], key);
  if (typeof fallback === "string") return interpolate(fallback, vars);

  // Both the active locale and English are missing this key -- should only
  // happen for a typo'd key path during development. Never render
  // "undefined" or a blank string; the key path itself is at least visible
  // and debuggable.
  return key;
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
