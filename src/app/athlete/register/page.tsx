import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AthleteRegistrationForm } from "@/features/athlete-registration/components/AthleteRegistrationForm";
import { RegistrationStepNav } from "@/features/athlete-registration/components/RegistrationStepNav";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { loadAthleteDraft, mapDraftToFormValues } from "@/lib/athlete/registration-draft";
import { resolveAthleteMobileNumber } from "@/lib/phone/resolve-athlete-phone";

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

  const authPhone = resolveAthleteMobileNumber(user);
  const supabase = await createClient();
  const { draft, error: draftLoadFailed } = await loadAthleteDraft(supabase, user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Create Your Athlete Profile
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-500">
            Build your professional sports profile and showcase your talent,
            experience and achievements.
          </p>
        </div>
        {!draftLoadFailed && <RegistrationStepNav />}
      </div>

      {draftLoadFailed ? (
        // Rendering a blank form here would risk Save Draft silently
        // overwriting a real, already-saved draft with empty fields --
        // safer to block on a retry than to guess.
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-medium">We couldn&apos;t load your saved information.</p>
          <p className="mt-1">
            Please{" "}
            <Link href="/athlete/register" className="font-medium underline">
              try reloading this page
            </Link>
            . If this keeps happening, contact support.
          </p>
        </div>
      ) : (
        <AthleteRegistrationForm
          authPhone={authPhone}
          initialValues={draft ? mapDraftToFormValues(draft, authPhone) : undefined}
        />
      )}
    </div>
  );
}
