import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { splitBilingualResponse } from "@/lib/coach/bilingual";
import { useTranslation } from "@/i18n/LocaleProvider";
import type { CoachMessage as CoachMessageType } from "@/lib/coach/types";

// Coach is instructed (see systemInstruction.ts) to end a process
// explanation with a single line formatted exactly as
// "Continue to [Page Label](path)". This regex is the one place that
// contract is parsed back out, turning it into a real, styled internal
// link (never a raw markdown string) -- and only for a path that starts
// with "/", so a malformed or external-looking link never becomes a
// navigable <Link>.
const LINK_LINE_PATTERN = /^(.*?)\[([^\]]+)\]\((\/[^)\s]*)\)\s*$/;

function renderLine(line: string, key: number) {
  const match = line.match(LINK_LINE_PATTERN);
  if (!match) {
    return (
      <p key={key} className="whitespace-pre-wrap">
        {line}
      </p>
    );
  }

  const [, prefix, label, href] = match;
  return (
    <div key={key} className={cn(prefix.trim().length > 0 && "space-y-2")}>
      {prefix.trim().length > 0 && <p className="whitespace-pre-wrap">{prefix.trim()}</p>}
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
      >
        {label}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function renderBlock(content: string) {
  const lines = content.split("\n").filter((line, index, all) => line.trim() !== "" || (index > 0 && index < all.length - 1));
  return lines.length > 0 ? lines.map(renderLine) : <p className="whitespace-pre-wrap">{content}</p>;
}

interface CoachMessageProps {
  message: CoachMessageType;
}

export function CoachMessage({ message }: CoachMessageProps) {
  const { t } = useTranslation();
  const isUser = message.role === "user";
  // Voice-mode replies come back as native-language-first, English-second
  // (see systemInstruction.ts/bilingual.ts) -- a typed message or a
  // response that was already in English never contains the separator, so
  // `english` is null and the toggle below never renders.
  const { primary, english } = isUser ? { primary: message.content, english: null } : splitBilingualResponse(message.content);
  // Both languages arrive in the same response already -- this only
  // switches which one is *displayed*, no re-fetch and no flash of stale
  // content when toggling back and forth.
  const [showEnglish, setShowEnglish] = useState(false);
  const shown = showEnglish ? english! : primary;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] space-y-1.5 rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-brand-600 text-white"
            : "rounded-bl-sm border border-border-default bg-white text-ink-800",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={showEnglish ? "en" : "native"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {renderBlock(shown)}
          </motion.div>
        </AnimatePresence>
        {english && (
          <button
            type="button"
            onClick={() => setShowEnglish((value) => !value)}
            className="mt-1.5 rounded-full border border-border-default px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-500 uppercase transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            {showEnglish ? t("coach.voice.showOriginal") : t("coach.voice.englishLabel")}
          </button>
        )}
      </div>
    </div>
  );
}
