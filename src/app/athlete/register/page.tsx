import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AthleteRegistrationForm } from "@/features/athlete-registration/components/AthleteRegistrationForm";
import { getAuthUser } from "@/lib/supabase/auth-user";

export const metadata: Metadata = {
  title: "Create Your Athlete Profile | SportFo",
  description:
    "Build your professional sports profile and showcase your talent, experience and achievements.",
};

export default async function AthleteRegisterPage() {
  // Proxy (src/proxy.ts) already redirects unauthenticated requests
  // optimistically; this re-verifies the session directly with Supabase
  // rather than relying on Proxy alone.
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Create Your Athlete Profile
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ink-500">
          Build your professional sports profile and showcase your talent,
          experience and achievements.
        </p>
      </div>

      <AthleteRegistrationForm />
    </div>
  );
}
