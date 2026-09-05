"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { askCoach } from "./coachService";
import type { CoachMessage } from "@/lib/coach/types";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface UseCoachResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: CoachMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guards against a double-send (e.g. rapid double Enter) firing two
  // overlapping requests while the first is still in flight.
  const isSendingRef = useRef(false);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSendingRef.current) return;

      isSendingRef.current = true;
      setError(null);

      const userMessage: CoachMessage = { id: createId(), role: "user", content: trimmed };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsLoading(true);

      const pageTitle = typeof document !== "undefined" ? document.title : undefined;

      askCoach(nextMessages, { pathname: pathname || "/", pageTitle })
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
    [messages, pathname],
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
    error,
    sendMessage,
    resetConversation,
  };
}
