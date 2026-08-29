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
    <section className="relative flex min-h-[220px] items-center overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-r from-[#0f1a48] via-[#1b1c56] to-[#3a1150]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,.05) 0 2px, rgba(255,255,255,0) 2px 16px)",
        }}
      />
      <div className="relative px-6 py-9 sm:px-10 sm:py-10">
        <p className="font-mono text-[11px] tracking-[0.16em] text-[#8fa6ff] uppercase">
          {t("dashboard.welcome.eyebrow")}
        </p>
        <h1 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-tight text-white sm:text-[42px]">
          {t("dashboard.welcome.title", { name: fullName || t("dashboard.welcome.fallbackName") })}
        </h1>
        <p className="mt-2 max-w-md text-[15px] text-[#b6c1e2] sm:text-[17px]">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/athlete/profile"
            className="inline-flex h-11 items-center rounded-[10px] bg-[#4d7cff] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#6a92ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c56]"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/athletes"
            className="inline-flex h-11 items-center rounded-[10px] border border-white/[0.18] bg-white/[0.08] px-5 text-[15px] font-semibold text-[#e8ecf8] transition-colors hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c56]"
          >
            {t("dashboard.welcome.exploreAthletes")}
          </Link>
        </div>
      </div>
    </section>
  );
}
