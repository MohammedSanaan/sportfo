import test from "node:test";
import assert from "node:assert/strict";

function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>): Promise<void> {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    const next = vars[key];
    if (next === undefined) delete process.env[key];
    else process.env[key] = next;
  }
  return fn().finally(() => {
    for (const key of Object.keys(previous)) {
      const prior = previous[key];
      if (prior === undefined) delete process.env[key];
      else process.env[key] = prior;
    }
  });
}

// getAIProvider() caches a module-level singleton (see providers/index.ts),
// so each test below imports a fresh copy of the module (a cache-busting
// query string forces Node to re-evaluate it) rather than sharing state
// with any other test's provider selection.
async function freshGetAIProvider() {
  const mod = await import(`./index.ts?t=${Date.now()}-${Math.random()}`);
  return mod.getAIProvider as () => { name: string };
}

test("AI_PROVIDER=openai selects the OpenAI provider", async () => {
  await withEnv({ AI_PROVIDER: "openai" }, async () => {
    const getAIProvider = await freshGetAIProvider();
    assert.equal(getAIProvider().name, "openai");
  });
});

test("AI_PROVIDER=gemini selects the Gemini provider", async () => {
  await withEnv({ AI_PROVIDER: "gemini" }, async () => {
    const getAIProvider = await freshGetAIProvider();
    assert.equal(getAIProvider().name, "gemini");
  });
});

test("AI_PROVIDER unset defaults to the OpenAI provider -- existing safe default preserved", async () => {
  await withEnv({ AI_PROVIDER: undefined }, async () => {
    const getAIProvider = await freshGetAIProvider();
    assert.equal(getAIProvider().name, "openai");
  });
});

test("an unknown AI_PROVIDER fails with a clear configuration error instead of silently falling back", async () => {
  await withEnv({ AI_PROVIDER: "anthropic" }, async () => {
    const getAIProvider = await freshGetAIProvider();
    assert.throws(() => getAIProvider(), /Unsupported AI_PROVIDER "anthropic"/);
  });
});

test("selecting a provider never requires OPENAI_API_KEY or GEMINI_API_KEY -- only generate() does", async () => {
  await withEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: undefined, OPENAI_API_KEY: undefined }, async () => {
    const getAIProvider = await freshGetAIProvider();
    assert.doesNotThrow(() => getAIProvider());
  });
});
