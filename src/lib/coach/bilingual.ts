// Shared contract for Coach's voice-mode bilingual response format (native
// language first, English second -- see systemInstruction.ts, which
// instructs Gemini to emit this exact marker on its own line, and
// CoachMessage.tsx, which parses it back out). Kept in one module so the
// prompt-side instruction and the render-side parser can never drift.
export const BILINGUAL_SEPARATOR = "---ENGLISH---";

export interface SplitCoachResponse {
  /** The response in whatever language Coach determined the user spoke (or the site locale/English fallback). Always present. */
  primary: string;
  /** The English restatement, only present when Coach's answer wasn't already in English. */
  english: string | null;
}

// Deliberately line-based (not a substring/regex match on the whole
// string) so stray leading/trailing whitespace Gemini adds around the
// marker line never breaks the split.
export function splitBilingualResponse(content: string): SplitCoachResponse {
  const lines = content.split("\n");
  const separatorIndex = lines.findIndex((line) => line.trim() === BILINGUAL_SEPARATOR);

  if (separatorIndex === -1) {
    return { primary: content.trim(), english: null };
  }

  const primary = lines.slice(0, separatorIndex).join("\n").trim();
  const english = lines.slice(separatorIndex + 1).join("\n").trim();

  // A separator with nothing meaningful on one side is a malformed/edge
  // case (e.g. Gemini emitted the marker but nothing else) -- treat as a
  // single-language response rather than showing an empty section.
  if (!primary || !english) {
    return { primary: content.trim(), english: null };
  }

  return { primary, english };
}
