import Link from "next/link";
import type { DashboardProfile } from "../types";
import type { ProfileStrength } from "@/lib/athlete/profile-strength";

interface DashboardWelcomeProps {
  fullName: string | null;
  profile: DashboardProfile;
  profileStrength: ProfileStrength;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

// The hero card. Every line of copy here is derived from real state
// (profile strength percentage, is_public) -- never a fabricated claim
// like "Three sponsors viewed your profile this week" (the reference
// design's placeholder), since SportFo has no such event tracking. See
// the three real states below.
export function DashboardWelcome({ fullName, profile, profileStrength, t }: DashboardWelcomeProps) {
  const isComplete = profileStrength.percentage >= 100;

  const message = !isComplete
    ? t("dashboard.welcome.incomplete")
    : profile.isPublic
      ? t("dashboard.welcome.public")
      : t("dashboard.welcome.readyToDiscover");

  const primaryLabel = isComplete ? t("dashboard.welcome.viewProfile") : t("dashboard.welcome.completeProfile");

  return (
    <section className="relative flex min-h-[220px] items-center overflow-hidden rounded-[20px] border border-border-default bg-gradient-to-r from-navy-900 via-navy-800 to-brand-800">
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,.06) 0 2px, rgba(255,255,255,0) 2px 16px)",
        }}
      />
      <div className="relative px-6 py-9 sm:px-10 sm:py-10">
        <p className="font-mono text-[11px] tracking-[0.16em] text-brand-200 uppercase">
          {t("dashboard.welcome.eyebrow")}
        </p>
        <h1 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-tight text-white sm:text-[42px]">
          {t("dashboard.welcome.title", { name: fullName || t("dashboard.welcome.fallbackName") })}
        </h1>
        <p className="mt-2 max-w-md text-[15px] text-brand-100 sm:text-[17px]">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/athlete/profile"
            className="inline-flex h-11 items-center rounded-[10px] bg-brand-500 px-5 text-[15px] font-bold text-white transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/athletes"
            className="inline-flex h-11 items-center rounded-[10px] border border-white/20 bg-white/10 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            {t("dashboard.welcome.exploreAthletes")}
          </Link>
        </div>
      </div>
    </section>
  );
}
