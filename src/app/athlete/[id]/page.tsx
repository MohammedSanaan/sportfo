import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { loadAthleteProfileById } from "@/lib/athlete/load-athlete-profile";
import { AthleteProfileView } from "@/features/athlete-profile/components/AthleteProfileView";

export const metadata: Metadata = {
  title: "Athlete Profile | SportFo",
};

interface AthleteProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function AthleteProfilePage({ params }: AthleteProfilePageProps) {
  const { id } = await params;

  // Public viewing isn't wired up yet -- athlete_profiles RLS only grants
  // select where auth.uid() = user_id (see the RLS migration), so an
  // unauthenticated visitor could never see a profile regardless. Once a
  // "view submitted profiles publicly" RLS policy exists, this route stays
  // the same; only this guard and the RLS need to change.
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth");
  }

  const supabase = await createClient();
  const { draft, error } = await loadAthleteProfileById(supabase, id);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-medium">We couldn&apos;t load this profile.</p>
          <p className="mt-1">Please try reloading the page.</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    notFound();
  }

  const isOwner = draft.profile.user_id === user.id;

  // A draft has no finished registration to show. Owners get sent back to
  // finish it; anyone else (once public viewing exists) sees a 404 rather
  // than an incomplete identity.
  if (draft.profile.profile_status === "draft") {
    if (isOwner) {
      redirect("/athlete/register");
    }
    notFound();
  }

  return <AthleteProfileView draft={draft} isOwner={isOwner} />;
}
