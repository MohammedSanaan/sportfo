import test from "node:test";
import assert from "node:assert/strict";
import { resolveSafeNextPath } from "./safe-redirect.ts";

test("accepts every registration hub category route", () => {
  const slugs = [
    "athlete",
    "academy-coach-parent",
    "performance-expert",
    "media-creator",
    "management-legal",
    "event-operations",
    "sponsor-csr",
    "talent-analytics",
  ];
  for (const slug of slugs) {
    assert.equal(resolveSafeNextPath(`/register/${slug}`), `/register/${slug}`);
  }
});

test("accepts the existing athlete routes", () => {
  assert.equal(resolveSafeNextPath("/athlete/register"), "/athlete/register");
  assert.equal(resolveSafeNextPath("/athlete/profile"), "/athlete/profile");
});

test("accepts the admin dashboard route", () => {
  assert.equal(resolveSafeNextPath("/admin/dashboard"), "/admin/dashboard");
});

test("accepts the discover-athletes route", () => {
  assert.equal(resolveSafeNextPath("/athletes"), "/athletes");
});

test("rejects an unknown registration category slug", () => {
  assert.equal(resolveSafeNextPath("/register/abcxyz"), null);
});

test("rejects absent/empty/null/undefined next", () => {
  assert.equal(resolveSafeNextPath(null), null);
  assert.equal(resolveSafeNextPath(undefined), null);
  assert.equal(resolveSafeNextPath(""), null);
});

test("rejects absolute external URLs", () => {
  assert.equal(resolveSafeNextPath("https://evil.example"), null);
  assert.equal(resolveSafeNextPath("http://evil.example/register/athlete"), null);
});

test("rejects protocol-relative URLs", () => {
  assert.equal(resolveSafeNextPath("//evil.example"), null);
  assert.equal(resolveSafeNextPath("//evil.example/register/athlete"), null);
});

test("rejects javascript: and other non-http schemes", () => {
  assert.equal(resolveSafeNextPath("javascript:alert(1)"), null);
  assert.equal(resolveSafeNextPath("data:text/html,evil"), null);
});

test("rejects a relative path not starting with a single slash", () => {
  assert.equal(resolveSafeNextPath("register/athlete"), null);
  assert.equal(resolveSafeNextPath("\\/evil.example"), null);
});

test("rejects a same-origin path that isn't a known SportFo route", () => {
  assert.equal(resolveSafeNextPath("/some/random/internal/path"), null);
  assert.equal(resolveSafeNextPath("/"), null);
  assert.equal(resolveSafeNextPath("/auth"), null);
});

test("drops query/hash and validates on the pathname alone", () => {
  assert.equal(resolveSafeNextPath("/register/athlete?foo=bar"), "/register/athlete");
  assert.equal(resolveSafeNextPath("/register/athlete#section"), "/register/athlete");
});
