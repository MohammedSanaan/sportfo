import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { lookupOwnAthleteProfile } from "@/lib/athlete/lookup-profile";

// Stable, id-free entry point ("View My Profile", nav links) that always
// resolves to the caller's own profile at its canonical /athlete/[id] URL.
// Never renders anything itself.
export default async function MyAthleteProfilePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth");
  }

  const supabase = await createClient();
  const { data: profile } = await lookupOwnAthleteProfile(supabase, user.id);

  if (!profile) {
    redirect("/athlete/register");
  }

  redirect(`/athlete/${profile.id}`);
}
