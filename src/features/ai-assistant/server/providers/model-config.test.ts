import test from "node:test";
import assert from "node:assert/strict";
import { getAIModelConfig, DEFAULT_OPENAI_MODEL } from "./model-config.ts";

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
