"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * The one piece of state the hero and Discovery share.
 *
 * Clicking a sport in the hero's carousel should filter Discovery by that
 * sport rather than just scrolling to it -- the two are the same page, no
 * reason to force a page reload or a backend round-trip to coordinate a
 * single filter value between two client components. Kept to exactly this:
 * one string and its setter, not a general-purpose store.
 */
const SportFilterContext = createContext<{
  sport: string;
  setSport: (sport: string) => void;
} | null>(null);

export function SportFilterProvider({ children }: { children: ReactNode }) {
  const [sport, setSport] = useState("All");
  const value = useMemo(() => ({ sport, setSport }), [sport]);
  return <SportFilterContext.Provider value={value}>{children}</SportFilterContext.Provider>;
}

export function useSportFilter() {
  const ctx = useContext(SportFilterContext);
  if (!ctx) {
    throw new Error("useSportFilter must be used within a SportFilterProvider");
  }
  return ctx;
}
