// Shared between the client (src/features/coach/**) and the server route
// (src/app/api/coach/route.ts) -- kept dependency-free (no React, no
// Next.js server types) so both sides can import it safely. `Locale` is
// the one exception: it's a plain string-literal union with no React/DOM
// dependency of its own (see src/i18n/config.ts), so importing its type
// here doesn't compromise that.
import type { Locale } from "@/i18n/config";

export type CoachRole = "user" | "coach";

export interface CoachMessage {
  id: string;
  role: CoachRole;
  content: string;
}

// Only non-sensitive, navigation-relevant context -- never user identity,
// form contents, or anything else typed into the app. See "Context Coach
// receives" in the integration report for the full list.
export interface CoachPageContext {
  pathname: string;
  pageTitle?: string;
  /** The SportFo site's currently-selected UI language (see LocaleProvider). */
  locale?: Locale;
  /** True when this message originated from the mic (voice transcription) rather than typing -- see bilingual.ts for what that changes about the expected response format. */
  isVoiceInput?: boolean;
}

export interface CoachRequestBody {
  // Full running conversation, sent statelessly on every request -- the
  // server holds no session, so this is the only source of history.
  messages: CoachMessage[];
  context?: CoachPageContext;
}

export interface CoachResponseBody {
  message: CoachMessage;
}

export interface CoachErrorBody {
  error: string;
}
