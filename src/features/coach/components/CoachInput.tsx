"use client";

import { useRef, type KeyboardEvent } from "react";

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M17.5 2.5L2.5 8.75l6 2.5 2.5 6L17.5 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

interface CoachInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  sendLabel: string;
  disabled: boolean;
}

export function CoachInput({ value, onChange, onSubmit, placeholder, sendLabel, disabled }: CoachInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline for a longer question.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border-default bg-white p-3 sm:p-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-border-default bg-surface-muted px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label={sendLabel}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </div>
  );
}
