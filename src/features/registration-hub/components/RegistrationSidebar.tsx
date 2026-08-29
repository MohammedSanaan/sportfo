"use client";

import { SidebarInfoCard } from "@/components/ui/SidebarInfoCard";
import { TipsIcon, VerifyIcon, SupportIcon } from "@/components/ui/RegistrationIcons";
import { useTranslation } from "@/i18n/LocaleProvider";

interface RegistrationSidebarProps {
  /** A category-specific "why this matters" note -- e.g. what a complete,
   * verified profile unlocks for this particular category. The other 3
   * cards are the same copy on every registration page. */
  noteTitle: string;
  noteDescription: string;
}

// The right-hand info column for every registration page (Athlete and all
// 7 generic hub categories) -- 3 shared trust/guidance cards plus one
// category-specific note, reusing SidebarInfoCard for all four. Pure
// content, no form state -- safe to mount on both flows without any
// coupling to either one's form values.
export function RegistrationSidebar({ noteTitle, noteDescription }: RegistrationSidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      <SidebarInfoCard
        icon={<TipsIcon />}
        title={t("registerHub.sidebar.whyComplete.title")}
        description={t("registerHub.sidebar.whyComplete.description")}
      />
      <SidebarInfoCard
        icon={<VerifyIcon />}
        title={t("registerHub.sidebar.verificationTrust.title")}
        description={t("registerHub.sidebar.verificationTrust.description")}
      />
      <SidebarInfoCard icon={<TipsIcon />} title={noteTitle} description={noteDescription} />
      <SidebarInfoCard
        icon={<SupportIcon />}
        title={t("registerHub.sidebar.support.title")}
        description={t("registerHub.sidebar.support.description")}
      />
    </>
  );
}
