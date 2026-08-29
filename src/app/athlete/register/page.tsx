import type { Metadata } from "next";
import { AthleteRegistrationScreen } from "@/features/athlete-registration/components/AthleteRegistrationScreen";
import { RegistrationShell } from "@/components/ui/RegistrationShell";
import { RegistrationHero } from "@/components/ui/RegistrationHero";
import { getServerTranslations } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Create Your Athlete Profile | SportFo",
  description:
    "Build your professional sports profile and showcase your talent, experience and achievements.",
};

export default async function AthleteRegisterPage() {
  const { t } = await getServerTranslations();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <RegistrationShell
        hero={
          <RegistrationHero
            title={t("register.pageTitle")}
            subtitle={t("register.pageDescription")}
            imageSrc="/images/hero-track.jpg"
          />
        }
      >
        <AthleteRegistrationScreen />
      </RegistrationShell>
    </div>
  );
}
