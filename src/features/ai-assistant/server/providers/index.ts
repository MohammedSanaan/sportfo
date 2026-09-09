import type { AIProvider } from "./provider.ts";
import { OpenAIProvider } from "./openai-provider.ts";
import { GeminiProvider } from "./gemini-provider.ts";
import { getAIProviderName } from "./model-config.ts";

let cachedProvider: AIProvider | null = null;

// Lazily constructed -- selecting/constructing a provider never reads an
// API key or throws for a *missing* key; only an actual generate() call
// does (see model-config.ts's getAIModelConfig). This IS the one place
// that decides which provider class to build, based on AI_PROVIDER (via
// getAIProviderName, which throws for an explicitly-set-but-unrecognized
// value rather than silently falling back to another provider) -- nothing
// above this layer (orchestrator, tools, route) ever branches on
// AI_PROVIDER or imports a provider class directly. Importing this module
// (at build time, or from a test that injects its own mock provider via
// runAssistant's `provider` param) must never require a real
// OPENAI_API_KEY/GEMINI_API_KEY.
export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = getAIProviderName() === "gemini" ? new GeminiProvider() : new OpenAIProvider();
  }
  return cachedProvider;
}

export type {
  AIConversationItem,
  AIGenerateParams,
  AIGenerateResult,
  AIProvider,
  AIToolCallRequest,
  AIToolParameterSchema,
  AIToolSpec,
  AIUsage,
} from "./provider.ts";
