import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { lookupOwnAthleteProfile } from "@/lib/athlete/lookup-profile";
import { resolveAthleteDestination } from "@/lib/athlete/resolve-destination";
import { Badge } from "@/components/ui/Badge";
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-border-default bg-surface shadow-sm lg:grid-cols-2">
        {/* Brand/storytelling panel -- desktop only. Reuses the same
            licensed photo + navy overlay as the landing hero for a
            consistent visual language, not a second competing treatment. */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-10 lg:flex">
          <div aria-hidden className="absolute inset-0">
            <Image
              src="/images/hero-track.jpg"
              alt=""
              fill
              sizes="50vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-navy-950/75" />
          </div>

          <Link
            href="/"
            className="relative flex items-center gap-2 text-lg font-bold text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              SF
            </span>
            SportFo
          </Link>

          <div className="relative flex flex-col gap-4">
            <Badge variant="onDark">Built for athletes. Designed for opportunity.</Badge>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Your sporting career deserves a professional home.
            </h2>
            <p className="text-sm text-white/70">
              Build your profile, showcase your achievements, and share a link people can
              trust.
            </p>
          </div>
        </div>

        {/* Sign-in card -- the only thing visible on mobile, where this
            whole rounded-3xl shell reads as a single clean card. */}
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-1.5 border-b border-border-default pb-5">
            <h1 className="text-lg font-semibold text-ink-900">Join or sign in to SportFo</h1>
            <p className="text-sm text-ink-500">{description}</p>
          </div>
          <AuthFlow />
        </div>
      </div>
    </div>
  );
}
