"use client";

import { useState } from "react";

interface OpportunityFiltersProps {
  labels: { all: string; trials: string; sponsors: string };
}

const FILTER_KEYS = ["all", "trials", "sponsors"] as const;

// Purely cosmetic local toggle -- there is no opportunities backend yet
// (see OpportunitiesSection), so switching filters never changes any
// content; it just tracks which pill looks active, matching the
// reference design's filter row without pretending to filter real data
// that doesn't exist.
export function OpportunityFilters({ labels }: OpportunityFiltersProps) {
  const [active, setActive] = useState<(typeof FILTER_KEYS)[number]>("all");

  return (
    <div className="flex gap-2">
      {FILTER_KEYS.map((key) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActive(key)}
            className={
              isActive
                ? "h-8 rounded-full border border-[#7a9dff]/45 bg-[#4d7cff]/22 px-3.5 text-[13px] font-semibold text-[#cddaff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
                : "h-8 rounded-full border border-white/[0.12] px-3.5 text-[13px] font-semibold text-[#8b96b8] transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
            }
          >
            {labels[key]}
          </button>
        );
      })}
    </div>
  );
}
