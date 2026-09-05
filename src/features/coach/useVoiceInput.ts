"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SpeechRecognitionConstructorLike, SpeechRecognitionLike } from "./speechRecognitionTypes";

export type VoiceStatus = "idle" | "listening" | "transcribing" | "error";
export type VoiceErrorKind = "permissionDenied" | "noSpeech" | "languageUnsupported" | "generic";

function getSpeechRecognitionCtor(): SpeechRecognitionConstructorLike | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

// Feature support never changes after the page loads, so "subscribe" has
// nothing to subscribe to -- this is purely a way to read a
// client-only value (whether SpeechRecognition exists) without a
// server/client render mismatch: getServerSnapshot fixes the server (and
// the client's very first render) at `false`, then the real client value
// is read on the client's next paint. That's also why this avoids a
// setState-in-effect, which the lint rule above correctly flags as
// effect misuse for a value like this.
function subscribeNoop() {
  return () => {};
}

function useSpeechRecognitionSupported(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => Boolean(getSpeechRecognitionCtor()),
    () => false,
  );
}

interface UseVoiceInputOptions {
  /** BCP-47 tag, e.g. "ta-IN" -- see voiceLocale.ts. */
  lang: string;
  onTranscript: (text: string) => void;
}

interface UseVoiceInputResult {
  isSupported: boolean;
  status: VoiceStatus;
  errorKind: VoiceErrorKind | null;
  start: () => void;
  stop: () => void;
}

// Wraps the browser's SpeechRecognition (Web Speech API) as Coach's voice
// input source. Audio never leaves the browser as a file or stream here --
// the browser/OS speech engine does recognition locally or via its own
// vendor service, and only the resulting transcript (plain text) reaches
// this hook and, from there, the normal sendMessage() path. No audio is
// captured, stored, or uploaded by this app's own code.
export function useVoiceInput({ lang, onTranscript }: UseVoiceInputOptions): UseVoiceInputResult {
  const isSupported = useSpeechRecognitionSupported();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [errorKind, setErrorKind] = useState<VoiceErrorKind | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keeping the latest callback in a ref (rather than depending on
  // `onTranscript` directly inside `start` below) is what lets `start`'s
  // identity stay stable across re-renders -- but the ref write itself
  // must happen in an effect, not during render, or React can't
  // guarantee it's observed correctly on the next read.
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) return;

    // A fresh instance per attempt rather than one long-lived, reused
    // recognizer -- simpler and more consistent across browsers, since
    // some implementations don't reliably support restarting an ended
    // instance.
    const recognition = new RecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onTranscriptRef.current(transcript);
        setStatus("idle");
      } else {
        setErrorKind("noSpeech");
        setStatus("error");
      }
    };

    recognition.onspeechend = () => setStatus("transcribing");

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setErrorKind("permissionDenied");
      } else if (event.error === "no-speech") {
        setErrorKind("noSpeech");
      } else if (event.error === "language-not-supported") {
        setErrorKind("languageUnsupported");
      } else {
        setErrorKind("generic");
      }
      setStatus("error");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Only fall back to idle if nothing else (a result or error) already
      // moved status forward -- otherwise this would clobber a just-set
      // "error" state back to a silent idle.
      setStatus((current) => (current === "listening" || current === "transcribing" ? "idle" : current));
    };

    recognitionRef.current = recognition;
    setErrorKind(null);
    setStatus("listening");

    try {
      recognition.start();
    } catch {
      setErrorKind("generic");
      setStatus("error");
    }
  }, [lang]);

  return { isSupported, status, errorKind, start, stop };
}
