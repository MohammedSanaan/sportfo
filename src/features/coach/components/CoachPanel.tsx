"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CoachHeader } from "./CoachHeader";
import { CoachMessage } from "./CoachMessage";
import { CoachQuickActions } from "./CoachQuickActions";
import { CoachInput } from "./CoachInput";
import type { CoachMessage as CoachMessageType } from "@/lib/coach/types";
import { useTranslation } from "@/i18n/LocaleProvider";

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CoachMessageType[];
  isLoading: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onReset: () => void;
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <div
        role="status"
        aria-label={label}
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border-default bg-white px-4 py-3"
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CoachPanel({ isOpen, onClose, messages, isLoading, error, onSend, onReset }: CoachPanelProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Auto-scroll to the latest message/typing indicator whenever the
    // conversation grows or a response starts/finishes loading.
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleSubmit() {
    if (!draft.trim() || isLoading) return;
    onSend(draft);
    setDraft("");
  }

  const quickActions = [
    { label: t("coach.quickActions.howItWorks") },
    { label: t("coach.quickActions.register") },
    { label: t("coach.quickActions.findPathway") },
    { label: t("coach.quickActions.imParent") },
    { label: t("coach.quickActions.imCoach") },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="coach-panel"
          role="dialog"
          aria-modal="true"
          aria-label={`${t("coach.name")} — ${t("coach.tagline")}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex flex-col bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:inset-auto sm:right-4 sm:bottom-24 sm:h-[min(700px,calc(100vh-7rem))] sm:w-[min(400px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-border-default sm:pt-0 sm:pb-0 sm:shadow-2xl md:right-6 md:w-[min(420px,calc(100vw-3rem))]"
        >
          <CoachHeader
            name={t("coach.name")}
            tagline={t("coach.tagline")}
            aiDisclosure={t("coach.aiDisclosure")}
            newChatLabel={t("coach.newChat")}
            closeLabel={t("coach.closeLabel")}
            onNewChat={onReset}
            onClose={onClose}
            showNewChat={messages.length > 0}
          />

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-muted px-4 py-4 sm:px-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="max-w-[90%] space-y-2 rounded-2xl rounded-bl-sm border border-border-default bg-white px-4 py-3 text-sm text-ink-800">
                  <p className="font-semibold text-ink-900">{t("coach.welcomeGreeting")}</p>
                  <p className="leading-relaxed">{t("coach.welcomeMessage")}</p>
                  <p className="leading-relaxed text-ink-500">{t("coach.welcomePrompt")}</p>
                </div>
                <CoachQuickActions actions={quickActions} onSelect={onSend} />
              </div>
            ) : (
              messages.map((message) => <CoachMessage key={message.id} message={message} />)
            )}

            {isLoading && <TypingIndicator label={t("coach.typingIndicator")} />}

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <CoachInput
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            placeholder={t("coach.inputPlaceholder")}
            sendLabel={t("coach.send")}
            disabled={isLoading}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
