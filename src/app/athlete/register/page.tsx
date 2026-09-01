import type { Metadata } from "next";
import { AthleteRegistrationScreen } from "@/features/athlete-registration/components/AthleteRegistrationScreen";
import { RegistrationShell } from "@/components/ui/RegistrationShell";
import { RegistrationHero } from "@/components/ui/RegistrationHero";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { getAthleteProfileStatus } from "@/lib/athlete/registration-draft";
import { isEditModeFromStatus } from "@/lib/athlete/registration-mode";
import { getServerTranslations } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Create Your Athlete Profile | SportFo",
  description:
    "Build your professional sports profile and showcase your talent, experience and achievements.",
};

export default async function AthleteRegisterPage() {
  const { t } = await getServerTranslations();

  // A minimal, single-column status lookup (see getAthleteProfileStatus) --
  // not the full loadAthleteDraft the form itself does further down inside
  // AthleteRegistrationScreen -- just enough to pick the right hero copy
  // before that heavier, form-owned load even starts. Real submitted-
  // profile state, never guessed from a query param or which link was
  // clicked.
  const user = await getAuthUser();
  const isEditMode = user
    ? isEditModeFromStatus(await getAthleteProfileStatus(await createClient(), user.id))
    : false;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <RegistrationShell
        hero={
          <RegistrationHero
            title={isEditMode ? t("register.pageTitleEdit") : t("register.pageTitle")}
            subtitle={isEditMode ? t("register.pageDescriptionEdit") : t("register.pageDescription")}
            imageSrc="/images/hero-track.jpg"
          />
        }
      >
        <AthleteRegistrationScreen />
      </RegistrationShell>
    </div>
  );
}
