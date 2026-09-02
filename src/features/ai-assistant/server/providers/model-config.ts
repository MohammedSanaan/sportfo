// Centralized AI provider/model configuration -- the ONLY place that reads
// AI_PROVIDER, OPENAI_API_KEY, or OPENAI_MODEL from process.env. No other
// file in this feature (or anywhere else in SportFo) should read these
// directly or hardcode a model string; change the model by changing
// OPENAI_MODEL (or this file's default), never by hunting through
// providers/tools/routes for a literal string.
export type AIProviderName = "openai";

// A centrally documented development default -- used ONLY when
// OPENAI_MODEL is unset. Production deployments should always set
// OPENAI_MODEL explicitly; this exists purely so local development, CI,
// and the production build never fail just because that var is unset (see
// getAIModelConfig, which is only ever called at actual request time, not
// at import/build time).
export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export interface AIModelConfig {
  provider: AIProviderName;
  apiKey: string;
  model: string;
}

// Deliberately lazy: reads env only when called, and only an actual
// assistant request calls it (see providers/openai-provider.ts). This is
// what lets the whole AI feature import cleanly -- build, lint, tests, even
// booting the app -- with NO OPENAI_API_KEY set at all; only a real
// request to talk to OpenAI fails, and it fails with this clear message
// rather than an opaque error deep inside SDK client construction.
export function getAIModelConfig(): AIModelConfig {
  const provider = process.env.AI_PROVIDER?.trim() || "openai";
  if (provider !== "openai") {
    throw new Error(`Unsupported AI_PROVIDER "${provider}" -- only "openai" is implemented in Phase 1A.`);
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
