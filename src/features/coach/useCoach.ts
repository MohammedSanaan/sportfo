"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  /** True for the whole request lifecycle, until the complete reply (or an error) comes back -- drives the typing indicator. */
  isLoading: boolean;
  /** Same lifecycle as isLoading; kept as a separate flag (matching isLoading) so callers can disable sending a second message. */
  isBusy: boolean;
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
  const [isBusy, setIsBusy] = useState(false);
  const [isVoiceReplyPending, setIsVoiceReplyPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guards against a double-send (e.g. rapid double Enter) firing two
  // overlapping requests while the first is still in flight.
  const isSendingRef = useRef(false);
  // Lets an in-flight request be cancelled -- on "New chat" mid-response,
  // or if the component unmounts -- rather than letting a stream nobody
  // will see keep consuming the response body (and Gemini output tokens).
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

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
      setIsBusy(true);
      setIsVoiceReplyPending(Boolean(options?.isVoiceInput));

      const pageTitle = typeof document !== "undefined" ? document.title : undefined;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // /api/coach now returns one complete JSON reply (see
      // coachService.ts) rather than a stream -- the typing indicator
      // (isLoading) stays up for the whole request and the reply is
      // appended in one piece once it resolves, instead of growing
      // token-by-token.
      askCoach(
        nextMessages,
        { pathname: pathname || "/", pageTitle, locale, isVoiceInput: options?.isVoiceInput },
        controller.signal,
      )
        .then((reply) => {
          setMessages((current) => [...current, reply]);
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return; // Cancelled deliberately -- not a user-facing error.
          setError(err.message || "I'm having a little trouble connecting right now. Please try again in a moment.");
        })
        .finally(() => {
          setIsLoading(false);
          setIsBusy(false);
          isSendingRef.current = false;
          if (abortControllerRef.current === controller) abortControllerRef.current = null;
        });
    },
    [messages, pathname, locale],
  );

  const resetConversation = useCallback(() => {
    abortControllerRef.current?.abort();
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
    isBusy,
    isVoiceReplyPending,
    error,
    sendMessage,
    resetConversation,
  };
}
