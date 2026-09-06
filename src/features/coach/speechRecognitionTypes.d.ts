// Minimal ambient types for the Web Speech API's SpeechRecognition --
// non-standard (webkit-prefixed in most shipping browsers) and not part of
// TypeScript's built-in "dom" lib, so it isn't typed anywhere else in this
// project. Only the surface useVoiceInput.ts actually uses is declared
// here; this is not a full spec typing.
export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultListLike;
  /** Index of the first result that's new/changed since the previous
   * `onresult` event -- lets a continuous session process only what's new
   * instead of re-reading (and re-appending) results it already saw. */
  resultIndex: number;
}

export interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
}

export type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  }
}
