import test from "node:test";
import assert from "node:assert/strict";
import { getAIModelConfig, getAIProviderName, DEFAULT_OPENAI_MODEL, DEFAULT_GEMINI_MODEL } from "./model-config.ts";

function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    const next = vars[key];
    if (next === undefined) delete process.env[key];
    else process.env[key] = next;
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(previous)) {
      const prior = previous[key];
      if (prior === undefined) delete process.env[key];
      else process.env[key] = prior;
    }
  }
}

test("throws a clear error when OPENAI_API_KEY is missing -- never a raw SDK error, and importing this module never requires a key", () => {
  withEnv({ AI_PROVIDER: undefined, OPENAI_API_KEY: undefined, OPENAI_MODEL: undefined }, () => {
    assert.throws(() => getAIModelConfig(), /OPENAI_API_KEY is not configured/);
  });
});

test("uses the centrally documented development default model when OPENAI_MODEL is unset", () => {
  withEnv({ AI_PROVIDER: undefined, OPENAI_API_KEY: "sk-test-key", OPENAI_MODEL: undefined }, () => {
    const config = getAIModelConfig();
    assert.equal(config.model, DEFAULT_OPENAI_MODEL);
    assert.equal(config.provider, "openai");
  });
});

test("uses OPENAI_MODEL when set -- runtime model selection, never a hardcoded string elsewhere", () => {
  withEnv({ AI_PROVIDER: undefined, OPENAI_API_KEY: "sk-test-key", OPENAI_MODEL: "gpt-test-model" }, () => {
    assert.equal(getAIModelConfig().model, "gpt-test-model");
  });
});

test("rejects an unsupported AI_PROVIDER with a clear message", () => {
  withEnv({ AI_PROVIDER: "anthropic", OPENAI_API_KEY: "sk-test-key", OPENAI_MODEL: undefined }, () => {
    assert.throws(() => getAIModelConfig(), /Unsupported AI_PROVIDER/);
  });
});

test("a missing-key error never includes any API key value in its message", () => {
  withEnv({ AI_PROVIDER: undefined, OPENAI_API_KEY: undefined, OPENAI_MODEL: undefined }, () => {
    assert.throws(() => getAIModelConfig(), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message.includes("sk-"), false);
      return true;
    });
  });
});

test("AI_PROVIDER unset defaults to openai -- existing safe default preserved", () => {
  withEnv({ AI_PROVIDER: undefined }, () => {
    assert.equal(getAIProviderName(), "openai");
  });
});

test("AI_PROVIDER=gemini selects gemini", () => {
  withEnv({ AI_PROVIDER: "gemini" }, () => {
    assert.equal(getAIProviderName(), "gemini");
  });
});

test("AI_PROVIDER=openai selects openai", () => {
  withEnv({ AI_PROVIDER: "openai" }, () => {
    assert.equal(getAIProviderName(), "openai");
  });
});

test("an unsupported AI_PROVIDER is never silently treated as openai or gemini", () => {
  withEnv({ AI_PROVIDER: "anthropic" }, () => {
    assert.throws(() => getAIProviderName(), /Unsupported AI_PROVIDER "anthropic"/);
  });
});

test("throws a clear error when GEMINI_API_KEY is missing -- never a raw SDK error, and importing this module never requires a key", () => {
  withEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: undefined, GEMINI_MODEL: undefined }, () => {
    assert.throws(() => getAIModelConfig(), /GEMINI_API_KEY is not configured/);
  });
});

test("uses the centrally documented development default model when GEMINI_MODEL is unset", () => {
  withEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "gm-test-key", GEMINI_MODEL: undefined }, () => {
    const config = getAIModelConfig();
    assert.equal(config.model, DEFAULT_GEMINI_MODEL);
    assert.equal(config.provider, "gemini");
  });
});

test("uses GEMINI_MODEL when set -- runtime model selection, never a hardcoded string elsewhere", () => {
  withEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "gm-test-key", GEMINI_MODEL: "gemini-test-model" }, () => {
    assert.equal(getAIModelConfig().model, "gemini-test-model");
  });
});

test("a missing Gemini key error never includes any API key value in its message", () => {
  withEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: undefined, GEMINI_MODEL: undefined }, () => {
    assert.throws(() => getAIModelConfig(), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message.includes("gm-"), false);
      return true;
    });
  });
});

test("AI_PROVIDER=gemini never falls back to reading OpenAI env vars", () => {
  withEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "gm-test-key", GEMINI_MODEL: undefined, OPENAI_API_KEY: "sk-should-not-be-used", OPENAI_MODEL: "gpt-should-not-be-used" }, () => {
    const config = getAIModelConfig();
    assert.equal(config.provider, "gemini");
    assert.equal(config.apiKey, "gm-test-key");
    assert.equal(config.model, DEFAULT_GEMINI_MODEL);
  });
});
