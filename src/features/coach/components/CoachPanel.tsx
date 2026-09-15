"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { CoachHeader } from "./CoachHeader";
import { CoachMessage } from "./CoachMessage";
import { CoachQuickActions } from "./CoachQuickActions";
import { CoachInput } from "./CoachInput";
import type { CoachMessage as CoachMessageType } from "@/lib/coach/types";
import { useTranslation } from "@/i18n/LocaleProvider";

interface CoachPanelProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  messages: CoachMessageType[];
  isLoading: boolean;
  isBusy: boolean;
  isVoiceReplyPending: boolean;
  error: string | null;
  onSend: (text: string, options?: { isVoiceInput?: boolean }) => void;
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

function MinimizedCloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 4.5l11 11M15.5 4.5l-11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 12l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CoachPanel({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onRestore,
  messages,
  isLoading,
  isBusy,
  isVoiceReplyPending,
  error,
  onSend,
  onReset,
}: CoachPanelProps) {
  const { t, locale } = useTranslation();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  // Desktop only: on mobile the panel is a full-width bottom sheet, so
  // freely repositioning it wouldn't make sense there.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  function startDrag(event: ReactPointerEvent) {
    if (!isDesktop) return;
    dragControls.start(event);
  }

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

  // Desktop: clicking anywhere on the page outside the expanded panel
  // collapses it to the small pill instead of doing nothing (previously
  // that area of the page was simply unreachable while Coach was open).
  // Mobile has its own tap-the-scrim handling below, so this is skipped
  // there.
  useEffect(() => {
    if (!isOpen || isMinimized || !isDesktop) return;
    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && event.target instanceof Node && panelRef.current.contains(event.target)) return;
      onMinimize();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, isMinimized, isDesktop, onMinimize]);

  function handleSubmit() {
    if (!draft.trim() || isBusy) return;
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
        <>
          {/* Mobile-only scrim: keeps the rest of the site visible while
              Coach is open, and tapping it collapses the sheet to the
              minimized pill rather than losing the conversation. */}
          {!isMinimized && (
            <motion.div
              key="coach-backdrop"
              aria-hidden="true"
              onClick={onMinimize}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-40 bg-ink-900/40 sm:hidden"
            />
          )}
          {/* Bounds the desktop drag gesture to the viewport so the panel
              can be repositioned anywhere on screen but never dragged
              off-screen. Invisible and non-interactive itself. */}
          <div ref={dragConstraintsRef} className="pointer-events-none fixed inset-0 z-50">
            {isMinimized ? (
              <motion.div
                key="coach-minimized"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] flex items-center gap-1 rounded-full border border-border-default bg-white py-2 pr-2 pl-3 shadow-xl sm:right-6 sm:bottom-6"
              >
                <button
                  type="button"
                  onClick={onRestore}
                  aria-label={t("coach.restoreLabel")}
                  className="flex items-center gap-2 rounded-full py-1 pr-1 pl-0.5 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                    SF
                  </span>
                  <span className="text-sm font-semibold text-ink-800">{t("coach.name")}</span>
                  {isLoading && (
                    <span className="flex items-center gap-0.5 pl-0.5">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1 w-1 animate-bounce rounded-full bg-ink-400"
                          style={{ animationDelay: `${dot * 120}ms` }}
                        />
                      ))}
                    </span>
                  )}
                  <ExpandIcon />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("coach.closeLabel")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface-muted hover:text-ink-700"
                >
                  <MinimizedCloseIcon />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="coach-panel"
                ref={panelRef}
                id="coach-panel"
                role="dialog"
                aria-modal="true"
                aria-label={`${t("coach.name")} — ${t("coach.tagline")}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                drag={isDesktop}
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={dragConstraintsRef}
                dragMomentum={false}
                dragElastic={0}
                whileDrag={{ cursor: "grabbing" }}
                className="pointer-events-auto fixed inset-x-0 bottom-0 top-[8dvh] flex flex-col overflow-hidden rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:inset-auto sm:top-auto sm:right-4 sm:bottom-24 sm:h-[min(700px,calc(100vh-7rem))] sm:w-[min(400px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-border-default sm:pb-0 md:right-6 md:w-[min(420px,calc(100vw-3rem))]"
              >
                {/* Mobile: tap to minimize, matching the pull-tab convention
                    of a dismissible sheet. Desktop: grabbing the header
                    instead lets the panel be dragged anywhere on screen
                    without closing it, so it never has to block content the
                    user needs to reach. */}
                <button
                  type="button"
                  onClick={onMinimize}
                  aria-label={t("coach.minimizeLabel")}
                  className="flex shrink-0 justify-center pt-2 pb-1 sm:hidden"
                >
                  <span className="h-1.5 w-10 rounded-full bg-ink-200" />
                </button>

                <div onPointerDown={startDrag} className="shrink-0 sm:cursor-grab sm:active:cursor-grabbing">
                  <CoachHeader
                    name={t("coach.name")}
                    tagline={t("coach.tagline")}
                    aiDisclosure={t("coach.aiDisclosure")}
                    newChatLabel={t("coach.newChat")}
                    closeLabel={t("coach.closeLabel")}
                    minimizeLabel={t("coach.minimizeLabel")}
                    onNewChat={onReset}
                    onClose={onClose}
                    onMinimize={onMinimize}
                    showNewChat={messages.length > 0}
                  />
                </div>

                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-muted px-4 py-4 sm:px-4">
                  {messages.length === 0 ? (
                    <div className="space-y-5">
                      <div className="space-y-3 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white px-5 py-6 text-center sm:text-left">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-md sm:mx-0">
                          SF
                        </span>
                        <div className="space-y-1.5">
                          <p className="text-lg leading-snug font-bold text-ink-900">{t("coach.welcomeGreeting")}</p>
                          <p className="text-sm leading-relaxed text-ink-700">{t("coach.welcomeMessage")}</p>
                        </div>
                        <p className="text-xs font-semibold text-ink-500">{t("coach.welcomePrompt")}</p>
                      </div>
                      <CoachQuickActions actions={quickActions} onSelect={onSend} />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <CoachMessage key={message.id} message={message} onNavigate={onMinimize} />
                    ))
                  )}

                  {isLoading && (
                    <TypingIndicator label={isVoiceReplyPending ? t("coach.voice.thinking") : t("coach.typingIndicator")} />
                  )}

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
                  onVoiceTranscript={(text) => onSend(text, { isVoiceInput: true })}
                  placeholder={t("coach.inputPlaceholder")}
                  sendLabel={t("coach.send")}
                  disabled={isBusy}
                  locale={locale}
                  voiceCopy={{
                    micLabel: t("coach.voice.micLabel"),
                    stopLabel: t("coach.voice.stopLabel"),
                    listening: t("coach.voice.listening"),
                    transcribing: t("coach.voice.transcribing"),
                    errors: {
                      permissionDenied: t("coach.voice.errors.permissionDenied"),
                      noSpeech: t("coach.voice.errors.noSpeech"),
                      languageUnsupported: t("coach.voice.errors.languageUnsupported"),
                      generic: t("coach.voice.errors.generic"),
                    },
                  }}
                />
              </motion.div>
            )}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
