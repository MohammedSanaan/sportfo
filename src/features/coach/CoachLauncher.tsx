"use client";

import { useCoach } from "./useCoach";
import { CoachButton } from "./components/CoachButton";
import { CoachPanel } from "./components/CoachPanel";
import { useTranslation } from "@/i18n/LocaleProvider";

// The single global Coach instance -- mounted once in SiteChrome so state
// (open/closed, conversation) survives client-side navigation between
// pages instead of resetting on every route change. Nothing else in the
// app should render CoachButton/CoachPanel directly.
export function CoachLauncher() {
  const { t } = useTranslation();
  const coach = useCoach();

  return (
    <>
      <CoachButton isOpen={coach.isOpen} onClick={coach.toggle} label={t("coach.openLabel")} name={t("coach.name")} />
      <CoachPanel
        isOpen={coach.isOpen}
        isMinimized={coach.isMinimized}
        onClose={coach.close}
        onMinimize={coach.minimize}
        onRestore={coach.restore}
        messages={coach.messages}
        isLoading={coach.isLoading}
        isBusy={coach.isBusy}
        isVoiceReplyPending={coach.isVoiceReplyPending}
        error={coach.error}
        onSend={coach.sendMessage}
        onReset={coach.resetConversation}
      />
    </>
  );
}
