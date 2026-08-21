export const LOCALES = ["en", "hi", "kn", "ta", "te", "ml"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  ta: "தமிழ்",
  te: "తెలుగు",
  ml: "മലയാളം",
};

// The label shown for the *current* locale inside the selector trigger --
// deliberately the English name for every locale (matches the "🌐 English"
// style trigger in the spec) rather than switching to the native name,
// which would make the trigger itself change shape/width per language.
export const LOCALE_TRIGGER_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
};

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value) && (LOCALES as readonly string[]).includes(value as string);
}
