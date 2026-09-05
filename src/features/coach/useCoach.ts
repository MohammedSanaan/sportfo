"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { askCoach } from "./coachService";
import { useTranslation } from "@/i18n/LocaleProvider";
import type { CoachMessage } from "@/lib/coach/types";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface SendMessageOptions {
  /** True when `text` is a voice transcription rather than typed input -- see bilingual.ts/systemInstruction.ts for what that changes. */
  isVoiceInput?: boolean;
}

interface UseCoachResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: CoachMessage[];
  isLoading: boolean;
  error: string | null;
  /** True while waiting on a response to a voice-originated message -- lets the UI show a "Thinking..." state distinct from the generic typed-message typing indicator. */
  isVoiceReplyPending: boolean;
  sendMessage: (text: string, options?: SendMessageOptions) => void;
  resetConversation: () => void;
}

// Session-only conversation memory -- lives entirely in this hook's React
// state for as long as the tab is open. No persistence, no server-side
// session: every request to /api/coach resends the full running history
// (see coachService.ts), and closing/reopening Coach keeps it (only
// "New chat" -- resetConversation -- clears it) since the product spec
// only calls for memory "while the chat session is active."
export function useCoach(): UseCoachResult {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceReplyPending, setIsVoiceReplyPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guards against a double-send (e.g. rapid double Enter) firing two
  // overlapping requests while the first is still in flight.
  const isSendingRef = useRef(false);

  const sendMessage = useCallback(
    (text: string, options?: SendMessageOptions) => {
      const trimmed = text.trim();
      if (!trimmed || isSendingRef.current) return;

      isSendingRef.current = true;
      setError(null);

      const userMessage: CoachMessage = { id: createId(), role: "user", content: trimmed };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsLoading(true);
      setIsVoiceReplyPending(Boolean(options?.isVoiceInput));

      const pageTitle = typeof document !== "undefined" ? document.title : undefined;

      askCoach(nextMessages, {
        pathname: pathname || "/",
        pageTitle,
        locale,
        isVoiceInput: options?.isVoiceInput,
      })
        .then((reply) => {
          setMessages((current) => [...current, reply]);
        })
        .catch((err: Error) => {
          setError(err.message || "I'm having a little trouble connecting right now. Please try again in a moment.");
        })
        .finally(() => {
          setIsLoading(false);
          isSendingRef.current = false;
        });
    },
    [messages, pathname, locale],
  );

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((value) => !value),
    messages,
    isLoading,
    isVoiceReplyPending,
    error,
    sendMessage,
    resetConversation,
  };
}
