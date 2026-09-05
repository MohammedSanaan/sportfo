"use client";

import { useRef, type KeyboardEvent } from "react";
import { useVoiceInput } from "../useVoiceInput";
import { getVoiceRecognitionLang } from "../voiceLocale";
import type { Locale } from "@/i18n/config";

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M17.5 2.5L2.5 8.75l6 2.5 2.5 6L17.5 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  );
}

interface VoiceCopy {
  micLabel: string;
  stopLabel: string;
  listening: string;
  transcribing: string;
  errors: {
    permissionDenied: string;
    noSpeech: string;
    languageUnsupported: string;
    generic: string;
  };
}

interface CoachInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceTranscript: (text: string) => void;
  placeholder: string;
  sendLabel: string;
  disabled: boolean;
  locale: Locale;
  voiceCopy: VoiceCopy;
}

export function CoachInput({
  value,
  onChange,
  onSubmit,
  onVoiceTranscript,
  placeholder,
  sendLabel,
  disabled,
  locale,
  voiceCopy,
}: CoachInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const voice = useVoiceInput({
    lang: getVoiceRecognitionLang(locale),
    onTranscript: onVoiceTranscript,
  });

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline for a longer question.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  const isListening = voice.status === "listening" || voice.status === "transcribing";
  const statusText =
    voice.status === "listening"
      ? voiceCopy.listening
      : voice.status === "transcribing"
        ? voiceCopy.transcribing
        : voice.status === "error" && voice.errorKind
          ? voiceCopy.errors[voice.errorKind]
          : null;

  return (
    <div className="border-t border-border-default bg-white p-3 sm:p-4">
      {statusText && (
        <p
          role={voice.status === "error" ? "alert" : "status"}
          className={`mb-2 text-xs ${voice.status === "error" ? "text-red-600" : "text-ink-500"}`}
        >
          {statusText}
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-border-default bg-surface-muted px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        />
        {/* Hidden entirely (not just disabled) when the browser has no
            SpeechRecognition support -- voice is always additive, never
            the only way to reach Coach; see useVoiceInput.ts. */}
        {voice.isSupported && (
          <button
            type="button"
            onClick={isListening ? voice.stop : voice.start}
            disabled={disabled}
            aria-label={isListening ? voiceCopy.stopLabel : voiceCopy.micLabel}
            aria-pressed={isListening}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
              isListening
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-border-default bg-surface-muted text-ink-600 hover:bg-white"
            }`}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </button>
        )}
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
    </div>
  );
}
