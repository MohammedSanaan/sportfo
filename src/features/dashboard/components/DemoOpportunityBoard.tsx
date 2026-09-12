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
    chip: "bg-brand-600 text-white",
    image: "bg-gradient-to-br from-brand-100 to-brand-50",
    button: "bg-brand-600 hover:bg-brand-700 text-white",
    label: "TRIAL",
  },
  sponsor: {
    chip: "bg-amber-500 text-ink-900",
    image: "bg-gradient-to-br from-amber-100 to-amber-50",
    button: "bg-amber-500 hover:bg-amber-600 text-ink-900",
    label: "SPONSOR",
  },
  camp: {
    chip: "bg-green-500 text-white",
    image: "bg-gradient-to-br from-green-100 to-green-50",
    button: "bg-green-500 hover:bg-green-600 text-white",
    label: "CAMP",
  },
};

// DEV/DEMO ONLY (see demo-dashboard.ts) -- the one place the "All / Trials /
// Sponsors" filter actually changes what's rendered. OpportunitiesSection's
// real (non-demo) empty state shows no filter row at all, since there's no
// real list yet for one to meaningfully act on.
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
                  ? "h-8 rounded-full border border-brand-300 bg-brand-50 px-3.5 text-[13px] font-semibold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  : "h-8 rounded-full border border-border-default px-3.5 text-[13px] font-semibold text-ink-500 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
            <article key={item.id} className="overflow-hidden rounded-2xl border border-border-default bg-white">
              <div className={`relative flex h-28 items-end p-3 ${styles.image}`}>
                <span className="font-mono text-[10px] tracking-[0.14em] text-ink-500 uppercase">
                  {item.imageCaption}
                </span>
                <span
                  className={`absolute top-3 right-3 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide ${styles.chip}`}
                >
                  {styles.label}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-bold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{item.meta}</p>
                <DemoOnlyButton
                  label={item.ctaLabel}
                  demoOnlyLabel={demoOnlyLabel}
                  className={`mt-4 flex h-10 w-full items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${styles.button}`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
