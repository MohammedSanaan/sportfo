// Centralized AI provider/model configuration -- the ONLY place that reads
// AI_PROVIDER, OPENAI_API_KEY, OPENAI_MODEL, GEMINI_API_KEY, or
// GEMINI_MODEL from process.env. No other file in this feature (or
// anywhere else in SportFo) should read these directly or hardcode a
// model string; change the model by changing OPENAI_MODEL/GEMINI_MODEL
// (or this file's defaults), never by hunting through
// providers/tools/routes for a literal string.
export type AIProviderName = "openai" | "gemini";

// Centrally documented development defaults -- used ONLY when the
// matching *_MODEL env var is unset. Production deployments should always
// set OPENAI_MODEL/GEMINI_MODEL explicitly; these exist purely so local
// development, CI, and the production build never fail just because that
// var is unset (see getAIModelConfig, which is only ever called at actual
// request time, not at import/build time).
export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
// Matches the default Coach (src/app/api/coach/route.ts) already uses in
// production against the same GEMINI_API_KEY/account -- one default
// Gemini model across SportFo rather than two different ones.
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

export interface AIModelConfig {
  provider: AIProviderName;
  apiKey: string;
  model: string;
}

// Reads AI_PROVIDER only -- never throws for "unset" (falls back to
// "openai", the existing safe default) or for a recognized name, only for
// a value that is neither "openai" nor "gemini". This is the ONE place
// that decides which provider is active: providers/index.ts calls this to
// pick a class, and getAIModelConfig below calls it to pick which
// secret/model env vars to read, so both always agree and an invalid
// AI_PROVIDER is never silently treated as "openai".
export function getAIProviderName(): AIProviderName {
  const provider = process.env.AI_PROVIDER?.trim() || "openai";
  if (provider !== "openai" && provider !== "gemini") {
    throw new Error(`Unsupported AI_PROVIDER "${provider}" -- must be "openai" or "gemini".`);
  }
  return provider;
}

// Deliberately lazy: reads env only when called, and only an actual
// assistant request calls it (see providers/openai-provider.ts and
// providers/gemini-provider.ts). This is what lets the whole AI feature
// import cleanly -- build, lint, tests, even booting the app -- with NO
// OPENAI_API_KEY/GEMINI_API_KEY set at all; only a real request to talk to
// the configured provider fails, and it fails with this clear message
// rather than an opaque error deep inside SDK client construction.
export function getAIModelConfig(): AIModelConfig {
  const provider = getAIProviderName();

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Set it in .env.local (see .env.example) to use the SportFo Assistant with AI_PROVIDER=gemini.",
      );
    }
    const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
    return { provider: "gemini", apiKey, model };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Set it in .env.local (see .env.example) to use the SportFo Assistant.",
    );
  }
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  return { provider: "openai", apiKey, model };
}
