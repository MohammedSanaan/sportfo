"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, type Locale } from "./config";
import { translate } from "./dictionary";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  // Read server-side (see src/i18n/server.ts) and passed down from
  // layout.tsx so the client's first paint matches the server's exactly --
  // never re-derived from the cookie independently on the client, which is
  // exactly the kind of source-of-truth split that causes hydration
  // mismatches.
  initialLocale: Locale;
  children: ReactNode;
}

export function LocaleProvider({ initialLocale, children }: LocaleProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      // 1. Update the UI immediately for every client component reading
      //    this context -- no waiting on a network round-trip.
      setLocaleState(next);
      // 2. Persist -- survives navigation, refresh, login, and logout (a
      //    cookie, not localStorage/React state, so Server Components can
      //    read it too).
      document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      // 3. Re-render Server Components (Header/Footer/page content) against
      //    the freshly-written cookie value.
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LocaleProvider");
  }
  return ctx;
}
