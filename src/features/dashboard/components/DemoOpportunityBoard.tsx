"use client";

import { useState } from "react";
import { DemoOnlyButton } from "./DemoOnlyButton";
import type { DemoOpportunity, DemoOpportunityTag } from "../data/demo-dashboard";

interface DemoOpportunityBoardProps {
  items: DemoOpportunity[];
  labels: { all: string; trials: string; sponsors: string };
  demoOnlyLabel: string;
}

type FilterKey = "all" | "trials" | "sponsors";

const FILTER_KEYS: FilterKey[] = ["all", "trials", "sponsors"];

// "camp" tagged items have no dedicated filter tab and only ever show up
// under "All", per the demo spec -- a fourth "Camps" pill can be added
// later if/when that becomes a real filterable category.
const FILTER_TAG: Record<Exclude<FilterKey, "all">, DemoOpportunityTag> = {
  trials: "trial",
  sponsors: "sponsor",
};

const TAG_STYLES: Record<DemoOpportunityTag, { chip: string; image: string; button: string; label: string }> = {
  trial: {
    chip: "bg-[#4d7cff] text-white",
    image: "bg-gradient-to-br from-[#1c2f6e] to-[#0d1430]",
    button: "bg-[#4d7cff] hover:bg-[#6a92ff] text-white",
    label: "TRIAL",
  },
  sponsor: {
    chip: "bg-[#ffb020] text-[#241703]",
    image: "bg-gradient-to-br from-[#5a4110] to-[#0d1430]",
    button: "bg-[#ffb020] hover:bg-[#ffc457] text-[#241703]",
    label: "SPONSOR",
  },
  camp: {
    chip: "bg-[#2fbf71] text-[#03210f]",
    image: "bg-gradient-to-br from-[#134028] to-[#0d1430]",
    button: "bg-[#2fbf71] hover:bg-[#4fd98d] text-[#03210f]",
    label: "CAMP",
  },
};

// DEV/DEMO ONLY (see demo-dashboard.ts) -- the one place the "All / Trials /
// Sponsors" filter actually changes what's rendered. The real (non-demo)
// OpportunityFilters pill row stays purely cosmetic on OpportunitiesSection's
// honest empty state, since there's no real list to filter yet.
export function DemoOpportunityBoard({ items, labels, demoOnlyLabel }: DemoOpportunityBoardProps) {
  const [active, setActive] = useState<FilterKey>("all");

  const visibleItems = active === "all" ? items : items.filter((item) => item.tag === FILTER_TAG[active]);

  return (
    <div>
      <div className="mb-4 flex gap-2">
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

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => {
          const styles = TAG_STYLES[item.tag];
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
              <div className={`relative flex h-28 items-end p-3 ${styles.image}`}>
                <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">
                  {item.imageCaption}
                </span>
                <span
                  className={`absolute top-3 right-3 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide ${styles.chip}`}
                >
                  {styles.label}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-bold text-[#e8ecf8]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#8b96b8]">{item.meta}</p>
                <DemoOnlyButton
                  label={item.ctaLabel}
                  demoOnlyLabel={demoOnlyLabel}
                  className={`mt-4 flex h-10 w-full items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430] ${styles.button}`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
