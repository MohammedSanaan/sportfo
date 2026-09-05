import Link from "next/link";
import { cn } from "@/lib/cn";
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

interface CoachMessageProps {
  message: CoachMessageType;
}

export function CoachMessage({ message }: CoachMessageProps) {
  const isUser = message.role === "user";
  const lines = message.content.split("\n").filter((line, index, all) => line.trim() !== "" || (index > 0 && index < all.length - 1));

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
        {lines.length > 0 ? lines.map(renderLine) : <p className="whitespace-pre-wrap">{message.content}</p>}
      </div>
    </div>
  );
}
