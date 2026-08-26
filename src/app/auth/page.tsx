import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { getPostLoginDestination } from "@/lib/auth/post-login-destination";
import { Badge } from "@/components/ui/Badge";
import { AuthFlow } from "@/features/auth/components/AuthFlow";
import { getAuthMode } from "@/lib/auth-mode";
import { resolveSafeNextPath } from "@/lib/auth/safe-redirect";
import { getServerTranslations } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Sign In | SportFo",
  description: "Join or sign in to SportFo with your mobile number.",
};

interface AuthPageProps {
  // Where to return the visitor after a successful sign-in -- set by
  // Proxy/AthleteRegistrationScreen/the registration hub when they redirect
  // a signed-out visitor here from e.g. /register/performance-expert.
  // Untrusted input (a query param anyone can edit), so it's validated by
  // resolveSafeNextPath before ever being used for a redirect, both below
  // and in AuthFlow after login.
  //
  // `mode` is a pure UI signal, never a security/routing decision: exactly
  // "register" switches the copy from "Welcome back / Login to SportFo" to
  // "Create your SportFo account / Verify your mobile number to continue
  // registration" -- set when a guest hit the auth checkpoint mid-
  // registration (see GenericCategoryForm/AthleteRegistrationForm), so
  // they're never told "Welcome back" before they've ever had an account.
  // Anything else (absent, typo'd) falls back to the normal login copy.
  searchParams: Promise<{ next?: string; mode?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { next, mode } = await searchParams;
  const safeNext = resolveSafeNextPath(next);
  const isRegisterIntent = mode === "register";

  const user = await getAuthUser();

  if (user) {
    // Same centralized routing decision a fresh sign-in uses (see
    // AuthFlow) -- an already-authenticated visitor who lands back on
    // /auth (e.g. a stale bookmark, or the browser back button after
    // signing in) gets sent to the exact same place a brand-new login
    // would send them, never re-derived with different logic here.
    const supabase = await createClient();
    const { destination } = await getPostLoginDestination(supabase, user.id, next);
    redirect(destination);
  }

  const { t } = await getServerTranslations();
  const description =
    getAuthMode() === "demo" ? t("auth.descriptionDemo") : t("auth.descriptionOtp");
  const pageTitle = isRegisterIntent ? t("auth.registerPageTitle") : t("auth.pageTitle");
  const pageSubtitle = isRegisterIntent ? t("auth.registerPageSubtitle") : t("auth.pageSubtitle");

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
            <Badge variant="onDark">{t("auth.panelBadge")}</Badge>
            <h2 className="text-3xl font-bold leading-tight text-white">
              {t("auth.panelTitle")}
            </h2>
            <p className="text-sm text-white/70">{t("auth.panelDescription")}</p>
          </div>
        </div>

        {/* Sign-in card -- the only thing visible on mobile, where this
            whole rounded-3xl shell reads as a single clean card. */}
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-1.5 border-b border-border-default pb-5">
            <h1 className="text-lg font-semibold text-ink-900">{pageTitle}</h1>
            <p className="text-sm font-medium text-ink-700">{pageSubtitle}</p>
            <p className="text-sm text-ink-500">{description}</p>
          </div>
          <AuthFlow safeNext={safeNext} intent={isRegisterIntent ? "register" : "login"} />
        </div>
      </div>
    </div>
  );
}
