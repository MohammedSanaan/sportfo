"use client";

import { ExpandableCard } from "./ExpandableCard";
import { AthleteCard } from "./AthleteCard";
import { AthleteExpandedPanel } from "./AthleteExpandedPanel";
import type { PublicAthleteSearchResult } from "@/lib/athlete/discovery";
import type { Locale } from "@/i18n/config";

// The Client Component boundary this needs to sit at: ExpandableCard takes
// its renderCollapsed/renderExpanded as function props, and functions can't
// cross the Server->Client Component prop boundary. /athletes/page.tsx
// (a Server Component, for the Supabase fetch + auth check) hands this
// plain, serializable data instead -- the closures live entirely on the
// client side of that boundary.
export function AthleteDiscoveryGrid({
  athletes,
  locale,
  isLoggedIn,
}: {
  athletes: PublicAthleteSearchResult[];
  locale: Locale;
  isLoggedIn: boolean;
}) {
  return (
    <ExpandableCard
      items={athletes}
      getId={(athlete) => athlete.public_slug}
      gridClassName="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      cardClassName="h-full"
      renderCollapsed={(athlete) => <AthleteCard athlete={athlete} locale={locale} />}
      renderExpanded={(athlete, close) => (
        <AthleteExpandedPanel
          athlete={athlete}
          locale={locale}
          isLoggedIn={isLoggedIn}
          onClose={close}
        />
      )}
    />
  );
}
