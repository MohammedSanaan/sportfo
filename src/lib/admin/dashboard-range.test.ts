import test from "node:test";
import assert from "node:assert/strict";
import { resolveDashboardRange } from "./dashboard-range.ts";

test("today resolves to a single IST calendar day", () => {
  const range = resolveDashboardRange("today");
  assert.equal(range.dateFrom, range.dateTo);
  const from = new Date(range.timestampFrom);
  const to = new Date(range.timestampTo);
  assert.equal(to.getTime() - from.getTime(), 24 * 60 * 60 * 1000);
});

test("last7days spans exactly 7 IST calendar days ending today", () => {
  const range = resolveDashboardRange("last7days");
  const from = new Date(range.timestampFrom);
  const to = new Date(range.timestampTo);
  assert.equal((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000), 7);
  const today = resolveDashboardRange("today");
  assert.equal(range.dateTo, today.dateFrom);
});

test("thisMonth starts on the 1st and ends on today", () => {
  const range = resolveDashboardRange("thisMonth");
  assert.match(range.dateFrom, /^\d{4}-\d{2}-01$/);
  const today = resolveDashboardRange("today");
  assert.equal(range.dateTo, today.dateFrom);
});

test("thisYear starts on Jan 1st and ends on today", () => {
  const range = resolveDashboardRange("thisYear");
  assert.match(range.dateFrom, /^\d{4}-01-01$/);
  const today = resolveDashboardRange("today");
  assert.equal(range.dateTo, today.dateFrom);
  assert.equal(range.dateFrom.slice(0, 4), today.dateFrom.slice(0, 4));
});

test("custom range uses the exact given dates, inclusive", () => {
  const range = resolveDashboardRange("custom", "2026-01-05", "2026-01-10");
  assert.equal(range.dateFrom, "2026-01-05");
  assert.equal(range.dateTo, "2026-01-10");
  assert.equal(range.timestampFrom, new Date("2026-01-04T18:30:00.000Z").toISOString());
  assert.equal(range.timestampTo, new Date("2026-01-10T18:30:00.000Z").toISOString());
});

test("custom range with from after to is swapped, not inverted", () => {
  const range = resolveDashboardRange("custom", "2026-01-10", "2026-01-05");
  assert.equal(range.dateFrom, "2026-01-05");
  assert.equal(range.dateTo, "2026-01-10");
});

test("custom range with missing bounds falls back to this month", () => {
  const range = resolveDashboardRange("custom", undefined, undefined);
  const thisMonth = resolveDashboardRange("thisMonth");
  assert.equal(range.dateFrom, thisMonth.dateFrom);
  assert.equal(range.dateTo, thisMonth.dateTo);
});

test("unrecognized range key falls back to this month", () => {
  const range = resolveDashboardRange("bogus");
  const thisMonth = resolveDashboardRange("thisMonth");
  assert.equal(range.dateFrom, thisMonth.dateFrom);
  assert.equal(range.dateTo, thisMonth.dateTo);
});
