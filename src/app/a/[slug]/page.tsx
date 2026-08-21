import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadPublicAthleteProfile } from "@/lib/athlete/public-profile";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import { ProfileHero } from "@/components/ui/ProfileHero";
import { PublicProfileSummary } from "@/features/public-profile/components/PublicProfileSummary";
import { PublicSportsSection } from "@/features/public-profile/components/PublicSportsSection";
import { PublicAchievementsSection } from "@/features/public-profile/components/PublicAchievementsSection";
import { ShareProfileButton } from "@/features/public-profile/components/ShareProfileButton";
import { getServerLocale } from "@/i18n/server";

interface PublicAthleteProfilePageProps {
  params: Promise<{ slug: string }>;
}

// Not in src/proxy.ts's PROTECTED_ROUTES -- this route is intentionally
// public and must render for a signed-out visitor. No session is read or
// required anywhere below.
export async function generateMetadata({
  params,
}: PublicAthleteProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const data = await loadPublicAthleteProfile(supabase, slug);

  if (!data) {
    return { title: "Profile Not Found | SportFo" };
  }

  const name = data.profile.full_name || "Athlete";
  const sport = getOptionLabel(PRIMARY_SPORTS, data.profile.primary_sport);
  const title = sport ? `${name} | ${sport} Athlete | SportFo` : `${name} | SportFo`;
  const description = sport
    ? `View ${name}'s ${sport.toLowerCase()} profile, achievements and sports experience on SportFo.`
    : `View ${name}'s athlete profile, achievements and sports experience on SportFo.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicAthleteProfilePage({
  params,
}: PublicAthleteProfilePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const data = await loadPublicAthleteProfile(supabase, slug);

  // Unknown slug, private profile, and still-draft profile all reach here
  // identically (the RPC's own WHERE clause is the only gate) -- so an
  // outside visitor can never tell a hidden profile apart from one that
  // doesn't exist.
  if (!data) {
    notFound();
  }

  const { profile, achievements } = data;
  const locale = await getServerLocale();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-6">
        <ProfileHero
          fullName={profile.full_name}
          primarySport={getOptionLabel(PRIMARY_SPORTS, profile.primary_sport)}
          skillLevel={getOptionLabel(SKILL_LEVELS, profile.skill_level)}
          city={profile.city}
          country={profile.country}
          actions={<ShareProfileButton />}
          bannerImage="/images/profile-banner-track.jpg"
          locale={locale}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PublicProfileSummary profile={profile} locale={locale} />
          <PublicSportsSection profile={profile} locale={locale} />
        </div>

        <PublicAchievementsSection achievements={achievements} locale={locale} />
      </div>
    </div>
  );
}
