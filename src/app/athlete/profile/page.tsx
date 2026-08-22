import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import { calculateProfileStrength } from "@/lib/athlete/profile-strength";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import { ProfileHero } from "@/components/ui/ProfileHero";
import { SportsIconPattern } from "@/components/ui/SportsIconPattern";
import { AthletePersonalInfo } from "@/features/athlete-profile/components/AthletePersonalInfo";
import { AthleteSportsSection } from "@/features/athlete-profile/components/AthleteSportsSection";
import { AthleteAchievementsSection } from "@/features/athlete-profile/components/AthleteAchievementsSection";
import { ProfileActions } from "@/features/athlete-profile/components/ProfileActions";
import { ProfileVisibilityCard } from "@/features/athlete-profile/components/ProfileVisibilityCard";
import { ProfileStrengthCard } from "@/features/athlete-profile/components/ProfileStrengthCard";
import { getServerTranslations } from "@/i18n/server";
import { getOwnSportfoId } from "@/lib/sportfo-id/server";

export const metadata: Metadata = {
  title: "My Athlete Profile | SportFo",
  description: "View your SportFo athlete profile.",
};

export default async function AthleteProfilePage() {
  // Proxy (src/proxy.ts) already redirects unauthenticated requests
  // optimistically; this re-verifies the session directly with Supabase
  // rather than relying on Proxy alone -- same pattern as
  // /athlete/register.
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth");
  }

  const supabase = await createClient();
  // Same RLS-scoped query the registration page uses -- ownership is
  // enforced by "Athletes can view own profile" etc., never by a
  // client-supplied id, and never a service-role client.
  const { draft, error: loadFailed } = await loadAthleteDraft(supabase, user.id);
  const { locale, t } = await getServerTranslations();
  const sportfoId = await getOwnSportfoId(supabase, user.id);

  if (loadFailed) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-medium">{t("profile.loadFailed")}</p>
          <p className="mt-1">
            {t("common.pleasePrefix")}{" "}
            <Link href="/athlete/profile" className="font-medium underline">
              {t("profile.reload")}
            </Link>
            . {t("profile.contactSupport")}
          </p>
        </div>
      </div>
    );
  }

  // No profile, or still a draft -- registration isn't finished yet, so
  // there's nothing to show here. Only a submitted profile renders.
  if (!draft || draft.profile.profile_status !== "submitted") {
    redirect("/athlete/register");
  }

  const { profile, sport, achievements } = draft;
  const strength = calculateProfileStrength(draft);

  return (
    <div className="relative overflow-hidden">
      <SportsIconPattern className="text-brand-600 opacity-[0.06]" />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {t("profile.pageTitle")}
          </h1>

          <ProfileHero
            headingLevel="h2"
            fullName={profile.full_name}
            primarySport={getOptionLabel(PRIMARY_SPORTS, sport?.primary_sport)}
            skillLevel={getOptionLabel(SKILL_LEVELS, sport?.skill_level)}
            city={profile.city}
            country={profile.country}
            actions={<ProfileActions locale={locale} />}
            sportfoId={sportfoId}
            locale={locale}
          />

          <ProfileStrengthCard strength={strength} locale={locale} />

          <ProfileVisibilityCard
            initialIsPublic={profile.is_public}
            initialSlug={profile.public_slug}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AthletePersonalInfo profile={profile} locale={locale} />
            <AthleteSportsSection sport={sport} locale={locale} />
          </div>

          <AthleteAchievementsSection achievements={achievements} locale={locale} />
        </div>
      </div>
    </div>
  );
}
