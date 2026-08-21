"use client";

import Link from "next/link";
import { ExpandableCard } from "./ExpandableCard";
import { Reveal } from "./Reveal";
import { TiltedCard } from "./TiltedCard";
import { Container, Display, SpecLabel } from "./primitives";
import { OPPORTUNITIES } from "../data/mock-data";
import type { OpportunityCard } from "../data/types";

const CATEGORY_TONE: Record<string, string> = {
  Trial: "border-brand-200 bg-brand-50 text-brand-700",
  Sponsorship: "border-border-strong bg-silver-100 text-ink-700",
  Academy: "border-border-strong bg-silver-100 text-ink-700",
  Job: "border-border-strong bg-silver-100 text-ink-700",
  Coaching: "border-border-strong bg-silver-100 text-ink-700",
  Event: "border-border-strong bg-silver-100 text-ink-700",
};

/**
 * Opportunities, in the same profile-card language as Discovery.
 *
 * A job board reads as a listings site; a grid of organisation-fronted
 * cards that expand in place reads as part of the same network the
 * athletes live on. Same interaction model as athlete discovery, on
 * purpose — one way of previewing-then-opening runs through the page.
 */
export function OpportunitiesSection() {
  return (
    <section
      id="opportunities"
      className="scroll-mt-16 bg-surface py-20 sm:py-28 lg:py-32"
    >
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SpecLabel>Opportunities</SpecLabel>
            <Display size="md" className="mt-5 max-w-[17ch]" accent="opportunity.">
              Talent should lead to
            </Display>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[34ch] text-sm leading-relaxed text-ink-500">
              Trials, sponsorships, academy places, coaching roles and jobs —
              posted by the organisations running them, open to any athlete
              who qualifies.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <ExpandableCard
            items={OPPORTUNITIES}
            getId={(o) => o.id}
            gridClassName="mt-12 grid grid-cols-1 gap-4 [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-3"
            cardClassName="h-full"
            renderCollapsed={(item) => (
              <TiltedCard className="h-full w-full" maxTilt={3}>
                <OpportunityTile opportunity={item} />
              </TiltedCard>
            )}
            renderExpanded={(item, close) => <OpportunityExpanded opportunity={item} onClose={close} />}
          />
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/auth"
              className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              See all opportunities
            </Link>
            <p className="text-[13px] text-ink-400">
              834 open listings across 8 sports and 12 countries.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function OrgAvatar({ organization, size = "h-11 w-11 text-[13px]" }: { organization: string; size?: string }) {
  const initials = organization
    .split(" ")
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 font-semibold text-brand-700 ${size}`}
    >
      {initials || organization[0]}
    </span>
  );
}

function OpportunityTile({ opportunity }: { opportunity: OpportunityCard }) {
  return (
    <div className="group flex h-full flex-col rounded-sm border border-brand-200 bg-brand-50 p-5 shadow-[0_1px_2px_rgba(26,63,176,0.06)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-brand-400 hover:bg-brand-100 hover:shadow-[0_20px_36px_-18px_rgba(47,102,240,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <OrgAvatar organization={opportunity.organization} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink-600">{opportunity.organization}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-400">
              <VerifiedIcon /> Verified organisation
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-medium ${
            CATEGORY_TONE[opportunity.category] ?? CATEGORY_TONE.Event
          }`}
        >
          {opportunity.category}
        </span>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{opportunity.title}</h3>
      <p className="mt-1 text-[12.5px] text-ink-500">
        {opportunity.sport} · {opportunity.location}
      </p>
      <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">
        {opportunity.detail}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-brand-200/70 pt-3.5">
        <span className="text-[11.5px] text-ink-400">{opportunity.postedDate}</span>
        <span className="flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1 text-[11.5px] font-medium text-ink-600 transition-colors group-hover:border-brand-400 group-hover:text-brand-700">
          Closes in {opportunity.closes}
          <ArrowGlyph className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

function OpportunityExpanded({
  opportunity,
  onClose,
}: {
  opportunity: OpportunityCard;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <OrgAvatar organization={opportunity.organization} size="h-12 w-12 text-[14px]" />
          <div>
            <p className="text-[13.5px] font-medium text-ink-600">{opportunity.organization}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-400">
              <VerifiedIcon /> Verified organisation
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface text-ink-500 shadow-sm transition-colors hover:border-border-strong hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <CloseIcon />
        </button>
      </div>

      <span
        className={`mt-5 inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-medium ${
          CATEGORY_TONE[opportunity.category] ?? CATEGORY_TONE.Event
        }`}
      >
        {opportunity.category}
      </span>

      <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-ink-900">{opportunity.title}</h2>
      <p className="mt-1.5 text-sm text-ink-500">
        {opportunity.sport} · {opportunity.location}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border-default py-5">
        <Field label="Sport" value={opportunity.sport} />
        <Field label="Posted" value={opportunity.postedDate} />
        <Field label="Closes in" value={opportunity.closes} />
        <Field label="Type" value={opportunity.category} />
      </dl>

      <div className="mt-5">
        <SpecLabel>About this listing</SpecLabel>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-700">{opportunity.description}</p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href="/auth"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Apply — sign in to continue
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-medium tracking-[0.12em] text-ink-400 uppercase">{label}</dt>
      <dd className="mt-1 text-[13.5px] font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function VerifiedIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-brand-600">
      <path
        d="M8 1.5 13 3.4v3.7c0 3.4-2.1 5.9-5 7.4-2.9-1.5-5-4-5-7.4V3.4L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="m5.7 8.1 1.6 1.6 3.1-3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={className ? `h-3 w-3 ${className}` : "h-3 w-3"}>
      <path
        d="M3.5 8h9M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
