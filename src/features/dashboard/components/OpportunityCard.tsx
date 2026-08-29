interface OpportunityCardProps {
  tag: string;
  title: string;
  meta: string;
  ctaLabel: string;
  ctaHref: string;
  accent: "blue" | "orange" | "green";
}

const ACCENT_STYLES: Record<OpportunityCardProps["accent"], { tag: string; cta: string; media: string }> = {
  blue: {
    tag: "bg-[#7ea3ff] text-[#0a0f22]",
    cta: "bg-[#7ea3ff] text-[#0a0f22] hover:bg-[#a9c1ff]",
    media: "bg-gradient-to-br from-[#16255e] to-[#0c1330]",
  },
  orange: {
    tag: "bg-[#ffb020] text-[#0a0f22]",
    cta: "bg-[#ffb020] text-[#0a0f22] hover:bg-[#ffc457]",
    media: "bg-gradient-to-br from-[#4a3410] to-[#161227]",
  },
  green: {
    tag: "bg-[#2fd07a] text-[#0a0f22]",
    cta: "bg-[#2fd07a] text-[#0a0f22] hover:bg-[#5fe0a0]",
    media: "bg-gradient-to-br from-[#0f3d2c] to-[#0c1330]",
  },
};

// A single real opportunity/trial/sponsorship/camp card -- not rendered
// anywhere yet (SportFo has no opportunities/trials/sponsorships backend
// today, see get-athlete-dashboard.ts), but built ready for the day that
// data exists rather than left as a TODO. Never called with placeholder
// data in the meantime -- see OpportunitiesSection's empty state instead.
export function OpportunityCard({ tag, title, meta, ctaLabel, ctaHref, accent }: OpportunityCardProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430] transition-colors hover:border-[#7ea3ff]/40">
      <div className={`flex h-[120px] items-end justify-end p-3 ${styles.media}`}>
        <span className={`rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase ${styles.tag}`}>
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-bold leading-tight text-[#e8ecf8]">{title}</h3>
        <p className="text-sm text-[#8f9bbd]">{meta}</p>
        <a
          href={ctaHref}
          className={`mt-auto inline-flex h-10 items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430] ${styles.cta}`}
        >
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}
