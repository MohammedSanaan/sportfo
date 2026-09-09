"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SpeechRecognitionConstructorLike, SpeechRecognitionLike } from "./speechRecognitionTypes";

export type VoiceStatus = "idle" | "listening" | "transcribing" | "error";
export type VoiceErrorKind = "permissionDenied" | "noSpeech" | "languageUnsupported" | "generic";

// How long a pause has to last before Coach treats it as "the user is done
// talking" rather than a natural mid-sentence breath -- e.g. "How do I
// register... [pause] ...for SportFo?" should survive a pause this long
// without being cut off and sent early. Long enough for a real
// conversational pause, short enough that Coach doesn't feel unresponsive
// once the user has actually finished. This is Coach's own timer, not the
// browser's -- see the restart logic below for why that distinction matters.
const SUSTAINED_SILENCE_MS = 2600;
// A hard ceiling on one voice turn so an open mic (e.g. left on by
// accident, or picking up ambient sound that keeps resetting the silence
// timer) doesn't stay active indefinitely. Generous enough for a genuinely
// long question.
const MAX_SESSION_MS = 60_000;
// Chrome's SpeechRecognition can end a `continuous: true` session on its
// own (an internal timeout/quota, not necessarily real silence) well
// before either of the thresholds above. If that happens with no explicit
// stop and no error, it's restarted transparently -- capped so a
// pathological restart-immediately-ends loop (e.g. a browser that refuses
// to actually record) can't spin forever.
const MAX_AUTO_RESTARTS = 6;

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
  /** Live "what Coach has heard so far, not yet finalized" text -- shown
   * distinctly from a sent message so the user can see it's working and
   * catch a misheard word before it's sent. Empty when idle/finalized. */
  interimTranscript: string;
  start: () => void;
  stop: () => void;
}

// Wraps the browser's SpeechRecognition (Web Speech API) as Coach's voice
// input source, as a continuous session rather than a single stop-on-
// first-pause capture: `continuous`/`interimResults` are on, a real pause
// is tolerated up to SUSTAINED_SILENCE_MS before finalizing, and the
// browser unexpectedly ending the underlying recognition session (which
// happens even with continuous:true) is invisible to the caller -- a new
// instance picks up where the last one left off, stitched into the same
// growing message. Audio never leaves the browser as a file or stream
// here -- the browser/OS speech engine does recognition locally or via its
// own vendor service, and only the resulting transcript (plain text)
// reaches this hook and, from there, the normal sendMessage() path. No
// audio is captured, stored, or uploaded by this app's own code.
export function useVoiceInput({ lang, onTranscript }: UseVoiceInputOptions): UseVoiceInputResult {
  const isSupported = useSpeechRecognitionSupported();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [errorKind, setErrorKind] = useState<VoiceErrorKind | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  // Finalized text collected so far across the whole voice turn -- persists
  // across an auto-restart (a fresh SpeechRecognition instance starts its
  // own results list from zero, so this is the only place the full
  // spoken-so-far message actually lives).
  const segmentsRef = useRef<string[]>([]);
  // The current, not-yet-final tail -- kept alongside segmentsRef so a
  // manual stop or the silence timer can finalize on whatever's live at
  // that instant, not just what's already been marked final by the API.
  const interimRef = useRef("");
  // True for the whole voice turn, from start() to a clean end (manual
  // stop, sustained silence, fatal error, or unmount) -- onend only
  // auto-restarts while this is true, so a deliberate stop never comes
  // back to life on its own.
  const isActiveRef = useRef(false);
  const hasFinalizedRef = useRef(false);
  const restartCountRef = useRef(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keeping the latest callback in a ref (rather than depending on
  // `onTranscript` directly inside `start` below) is what lets `start`'s
  // identity stay stable across re-renders -- but the ref write itself
  // must happen in an effect, not during render, or React can't
  // guarantee it's observed correctly on the next read.
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    silenceTimerRef.current = null;
    sessionTimerRef.current = null;
  }, []);

  // Ends the voice turn for good (no further auto-restart) and, if there's
  // any real content, hands the combined transcript to the same
  // sendMessage() path a typed message uses. Never sends on empty/
  // whitespace-only content -- a manual stop with nothing said, or a
  // silence timeout that never heard anything, should just go quiet.
  const finalize = useCallback(() => {
    if (hasFinalizedRef.current) return;
    hasFinalizedRef.current = true;
    isActiveRef.current = false;
    clearTimers();

    const combined = [...segmentsRef.current, interimRef.current].join(" ").replace(/\s+/g, " ").trim();
    recognitionRef.current?.stop();

    setInterimTranscript("");
    // No separate "transcribing" pause here -- handing off to onTranscript
    // below immediately puts the message on the same send path as typed
    // text, which has its own loading/typing-indicator state in useCoach.
    setStatus("idle");

    if (combined) {
      onTranscriptRef.current(combined);
    }
  }, [clearTimers]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(finalize, SUSTAINED_SILENCE_MS);
  }, [finalize]);

  // Holds the latest "start one recognition instance" closure, always kept
  // up to date below rather than declared as a self-referencing const --
  // onend needs to call "whatever starting-a-new-instance means right
  // now" without a TDZ/self-reference problem, and without forcing this
  // function's identity to matter for memoization the way a useCallback
  // dependency would.
  const startRecognitionInstanceRef = useRef<() => void>(() => {});

  useEffect(() => {
    startRecognitionInstanceRef.current = () => {
      const RecognitionCtor = getSpeechRecognitionCtor();
      if (!RecognitionCtor) return;

      const recognition = new RecognitionCtor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? "";
          if (result.isFinal) {
            if (transcript.trim()) segmentsRef.current.push(transcript.trim());
          } else {
            interim += transcript;
          }
        }
        interimRef.current = interim.trim();
        setInterimTranscript([...segmentsRef.current, interimRef.current].join(" ").replace(/\s+/g, " ").trim());
        // Any speech activity -- interim or final -- means the user is
        // still talking, so the "have they gone quiet" clock starts over.
        resetSilenceTimer();
        restartCountRef.current = 0; // Real progress resets the loop guard too.
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          isActiveRef.current = false;
          clearTimers();
          setErrorKind("permissionDenied");
          setStatus("error");
          return;
        }
        if (event.error === "language-not-supported") {
          isActiveRef.current = false;
          clearTimers();
          setErrorKind("languageUnsupported");
          setStatus("error");
          return;
        }
        // "no-speech", "network", "aborted", etc. are treated as
        // recoverable -- onend fires right after most of these and
        // decides whether to restart or finalize; a real fatal case just
        // won't ever produce content and will eventually hit the
        // no-speech/restart-limit path below.
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        if (!isActiveRef.current) return; // Deliberate stop/finalize already handled everything.

        if (restartCountRef.current >= MAX_AUTO_RESTARTS) {
          // The browser keeps ending the session immediately with nothing
          // captured -- stop trying rather than spin forever, and surface
          // it the same way a normal no-speech timeout would.
          if (segmentsRef.current.length === 0 && !interimRef.current) {
            isActiveRef.current = false;
            clearTimers();
            setErrorKind("noSpeech");
            setStatus("error");
            return;
          }
          finalize();
          return;
        }

        restartCountRef.current += 1;
        try {
          startRecognitionInstanceRef.current();
        } catch {
          finalize();
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
        setStatus("listening");
      } catch {
        // `recognition.start()` can throw synchronously (a known Web
        // Speech API quirk when restarting too soon after a stop) --
        // when that happens onend never fires for this instance, so
        // nothing else will naturally clean up. On the very first attempt
        // that's a real error; on a restart, finalize with whatever was
        // already captured (or go quiet if nothing was) instead of
        // silently sitting in "listening" until a timer eventually saves it.
        recognitionRef.current = null;
        if (restartCountRef.current === 0) {
          setErrorKind("generic");
          setStatus("error");
          isActiveRef.current = false;
          clearTimers();
        } else {
          finalize();
        }
      }
    };
  }, [lang, resetSilenceTimer, finalize, clearTimers]);

  const start = useCallback(() => {
    if (!getSpeechRecognitionCtor() || isActiveRef.current) return;

    segmentsRef.current = [];
    interimRef.current = "";
    restartCountRef.current = 0;
    hasFinalizedRef.current = false;
    isActiveRef.current = true;
    setErrorKind(null);
    setInterimTranscript("");

    sessionTimerRef.current = setTimeout(finalize, MAX_SESSION_MS);
    startRecognitionInstanceRef.current();
  }, [finalize]);

  const stop = useCallback(() => {
    if (!isActiveRef.current) return;
    finalize();
  }, [finalize]);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      clearTimers();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, [clearTimers]);

  return { isSupported, status, errorKind, interimTranscript, start, stop };
}
