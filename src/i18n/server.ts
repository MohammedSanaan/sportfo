import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type Locale } from "./config";
import { translate } from "./dictionary";

// Every Server Component that needs a translation reads the same cookie
// this way -- there is no other source of truth for locale on the server,
// so this and the client LocaleProvider (which writes the same cookie
// name) can never disagree about what the "current" locale is.
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
  };
}
