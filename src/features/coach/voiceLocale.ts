import type { Locale } from "@/i18n/config";

// BCP-47 tags for the Web Speech API's `recognition.lang`, one per
// SportFo locale. Chosen as the India-region variant throughout (SportFo
// is India-only) rather than a generic/US variant.
//
// Real-world support caveat (documented here since it can't be verified
// from this environment): Chrome's SpeechRecognition is cloud-backed
// (Google's speech service, requires network) and has solid support for
// hi-IN and en-IN; ta-IN, te-IN, kn-IN, and ml-IN are also recognized by
// Chrome/Android but with more variable accuracy than Hindi/English in
// practice. Firefox has no unprefixed SpeechRecognition support at all.
// Safari exposes webkitSpeechRecognition on some versions but historically
// has patchy/no support for Indic languages. None of this is queryable at
// runtime -- there's no API to ask "is ta-IN supported" ahead of time --
// so failures surface only via the recognizer's onerror/onresult (see
// useVoiceInput.ts), which is exactly what the graceful-fallback handling
// there is for.
const VOICE_RECOGNITION_LANG: Record<Locale, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  ml: "ml-IN",
};

export function getVoiceRecognitionLang(locale: Locale): string {
  return VOICE_RECOGNITION_LANG[locale];
}
