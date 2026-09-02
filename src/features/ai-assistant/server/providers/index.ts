import type { AIProvider } from "./provider.ts";
import { OpenAIProvider } from "./openai-provider.ts";

let cachedProvider: AIProvider | null = null;

// Lazily constructed -- constructing the provider itself never reads
// environment variables or throws; only an actual generate() call does
// (see model-config.ts). This is deliberate: importing this module (at
// build time, or from a test that injects its own mock provider via
// runAssistant's `provider` param) must never require a real
// OPENAI_API_KEY. Swapping AI_PROVIDER to a future non-OpenAI provider
// happens here, once, and nowhere else.
export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = new OpenAIProvider();
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
