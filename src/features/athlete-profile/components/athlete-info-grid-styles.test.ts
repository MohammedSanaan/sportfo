import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// A source-scan test, not a rendered-DOM one -- this repo's test runner is
// plain `node --test` with no React rendering/DOM harness (see every other
// *.test.ts here), so the most direct, dependency-free way to guard "never
// truncate a real profile value again" is asserting the actual className
// strings AthleteInfoGrid ships with. Reading the file by relative path
// (not the "@/..." alias) so this runs the same way under node --test as
// every other test in this codebase.
const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "AthleteInfoGrid.tsx"), "utf8");

// Scoped to just the <dd> (the actual value element) className -- not the
// whole file. overflow-hidden legitimately appears elsewhere in this
// component (clipping the outer <dl>'s rounded corners), which is
// unrelated to whether a *value* gets clipped; asserting over the whole
// file would false-positive on that.
function getDdClassName(): string {
  const match = source.match(/<dd\b[^>]*className=(["'`])([^"'`]*)\1/);
  assert.ok(match, "expected to find the <dd> element's className in AthleteInfoGrid.tsx");
  return match[2];
}

function hasClassToken(className: string, haystack: string): boolean {
  return new RegExp(`\\b${className}\\b`).test(haystack);
}

test("AthleteInfoGrid's value element never truncates real profile data", () => {
  const ddClassName = getDdClassName();
  for (const forbidden of ["truncate", "overflow-hidden", "whitespace-nowrap", "text-ellipsis"]) {
    assert.equal(hasClassToken(forbidden, ddClassName), false, `<dd> must not use "${forbidden}"`);
  }
});

test("AthleteInfoGrid's value element explicitly allows wrapping and growing", () => {
  const ddClassName = getDdClassName();
  for (const required of ["break-words", "whitespace-normal", "min-w-0"]) {
    assert.equal(hasClassToken(required, ddClassName), true, `<dd> should apply "${required}"`);
  }
});
