import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import { calculateProfileStrength } from "@/lib/athlete/profile-strength";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import { buildProfilePhotoUrl } from "@/lib/storage/profile-photo";
import { isSafeExternalUrl } from "@/lib/url";
import { AthleteProfileHero } from "@/features/athlete-profile/components/AthleteProfileHero";
import { AthletePersonalInfo } from "@/features/athlete-profile/components/AthletePersonalInfo";
import { AthleteSportsSection } from "@/features/athlete-profile/components/AthleteSportsSection";
import { AthleteAchievementsSection } from "@/features/athlete-profile/components/AthleteAchievementsSection";
import { AthleteEmploymentSection } from "@/features/athlete-profile/components/AthleteEmploymentSection";
import { AthleteApparelSection } from "@/features/athlete-profile/components/AthleteApparelSection";
import { AthleteBioSection } from "@/features/athlete-profile/components/AthleteBioSection";
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

  // Additional sections render only when the athlete actually filled them
  // in -- never an empty card, per the task's "do not blindly dump every
  // DB field" instruction.
  const hasEmployment = Boolean(
    profile.employment_type || profile.organization || profile.job_title || profile.years_experience,
  );
  const hasApparel = Boolean(
    profile.track_suit_size || profile.tshirt_size || profile.shorts_size || profile.shoe_size,
  );
  const hasBio =
    Boolean(profile.short_bio) ||
    [profile.instagram_url, profile.facebook_url, profile.other_url].some(isSafeExternalUrl);

  return (
    <div
      className="min-h-screen bg-[#05080f] text-[#e8ecf8]"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at 12% -5%, #16215a 0%, rgba(6,10,24,0) 60%), radial-gradient(900px 500px at 95% 8%, #2a1146 0%, rgba(6,10,24,0) 55%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-6">
          <AthleteProfileHero
            fullName={profile.full_name}
            primarySport={getOptionLabel(PRIMARY_SPORTS, sport?.primary_sport)}
            skillLevel={getOptionLabel(SKILL_LEVELS, sport?.skill_level)}
            city={profile.city}
            country={profile.country}
            sportfoId={sportfoId}
            photoUrl={buildProfilePhotoUrl(profile.profile_photo_path)}
            locale={locale}
          />

          <ProfileStrengthCard strength={strength} locale={locale} />

          <ProfileVisibilityCard
            initialIsPublic={profile.is_public}
            initialSlug={profile.public_slug}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AthletePersonalInfo profile={profile} locale={locale} />
            <AthleteSportsSection sport={sport} profile={profile} locale={locale} />
          </div>

          <AthleteAchievementsSection achievements={achievements} locale={locale} />

          {(hasEmployment || hasApparel || hasBio) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {hasEmployment && <AthleteEmploymentSection profile={profile} locale={locale} />}
              {hasApparel && <AthleteApparelSection profile={profile} locale={locale} />}
              {hasBio && (
                <div className={hasEmployment && hasApparel ? "lg:col-span-2" : undefined}>
                  <AthleteBioSection profile={profile} locale={locale} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
