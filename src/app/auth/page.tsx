import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { lookupOwnAthleteProfile } from "@/lib/athlete/lookup-profile";
import { resolveAthleteDestination } from "@/lib/athlete/resolve-destination";
import { SectionCard } from "@/components/ui/SectionCard";
import { AuthFlow } from "@/features/auth/components/AuthFlow";
import { getAuthMode } from "@/lib/auth-mode";

export const metadata: Metadata = {
  title: "Sign In | SportFo",
  description: "Join or sign in to SportFo with your mobile number.",
};

export default async function AuthPage() {
  const user = await getAuthUser();

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await lookupOwnAthleteProfile(supabase, user.id);
    redirect(resolveAthleteDestination(profile));
  }

  const description =
    getAuthMode() === "demo"
      ? "Enter your mobile number to continue to your athlete profile."
      : "Enter your mobile number and we'll send you a secure verification code.";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <SectionCard title="Join or sign in to SportFo" description={description}>
        <AuthFlow />
      </SectionCard>
    </div>
  );
}
