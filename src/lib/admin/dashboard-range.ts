// Resolves the admin dashboard's TIME RANGE filter (Today / Last 7 Days /
// This Month / This Year / Custom) into concrete boundaries for the
// admin_registration_trend/admin_category_breakdown/admin_list_registrations
// RPCs. Computed in Asia/Kolkata, matching admin_registration_kpis' own
// timezone convention (see that RPC's comment for why) -- deliberately not
// server UTC or the browser's local timezone, so a filter picked in the UI
// always lines up with what a plain-language "Today"/"This Month" would
// mean for an India-focused product, regardless of where the dashboard is
// opened from.
//
// India has a single fixed UTC+5:30 offset with no DST, which is what
// makes this safe to compute with plain arithmetic instead of a timezone
// database: shifting a UTC instant by exactly 5.5 hours and reading its
// UTC calendar fields back off gives the correct IST calendar date, and
// JS's Date normalizes day/month overflow (day 0, month 12, etc.) for us
// when building boundaries back out.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export type DashboardRangeKey = "today" | "last7days" | "thisMonth" | "thisYear" | "custom";

export const DASHBOARD_RANGE_KEYS: DashboardRangeKey[] = [
  "today",
  "last7days",
  "thisMonth",
  "thisYear",
  "custom",
];

export interface DashboardRange {
  /** ISO instant, inclusive -- for admin_category_breakdown/admin_list_registrations. */
  timestampFrom: string;
  /** ISO instant, exclusive -- for admin_category_breakdown/admin_list_registrations. */
  timestampTo: string;
  /** YYYY-MM-DD, inclusive (IST calendar date) -- for admin_registration_trend. */
  dateFrom: string;
  /** YYYY-MM-DD, inclusive (IST calendar date) -- for admin_registration_trend. */
  dateTo: string;
}

function istDateParts(date: Date): { year: number; month: number; day: number } {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  };
}

// Midnight IST on the given (possibly out-of-range, e.g. day 0 or day 32 --
// JS Date normalizes it) calendar date, as a real UTC instant.
function istMidnightUtc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - IST_OFFSET_MS);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymd(year: number, month: number, day: number): string {
  // Route through a Date to normalize overflow the same way the instant
  // computation above does, so the string always matches a real calendar day.
  const normalized = new Date(Date.UTC(year, month, day));
  return `${normalized.getUTCFullYear()}-${pad2(normalized.getUTCMonth() + 1)}-${pad2(normalized.getUTCDate())}`;
}

const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateString(value: string): { year: number; month: number; day: number } | null {
  if (!DATE_STRING_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return { year, month: month - 1, day };
}

export function resolveDashboardRange(
  rangeKey: string,
  customFrom?: string,
  customTo?: string,
): DashboardRange {
  const { year, month, day } = istDateParts(new Date());

  let start = { year, month, day };
  let endInclusive = { year, month, day };

  if (rangeKey === "last7days") {
    start = { year, month, day: day - 6 };
  } else if (rangeKey === "thisYear") {
    start = { year, month: 0, day: 1 };
  } else if (rangeKey === "custom") {
    const from = customFrom ? parseDateString(customFrom) : null;
    const to = customTo ? parseDateString(customTo) : null;
    if (from && to) {
      start = from;
      endInclusive = to;
    } else {
      // Incomplete/invalid custom range -- fall back to This Month rather
      // than an unbounded or malformed query.
      start = { year, month, day: 1 };
    }
  } else if (rangeKey !== "today") {
    // "thisMonth" and any unrecognized value both default here.
    start = { year, month, day: 1 };
  }

  // Guard against a reversed custom range (from after to) -- swap rather
  // than sending an inverted window to the database.
  const startInstant = istMidnightUtc(start.year, start.month, start.day);
  const endInstant = istMidnightUtc(endInclusive.year, endInclusive.month, endInclusive.day);
  if (startInstant > endInstant) {
    [start, endInclusive] = [endInclusive, start];
  }

  const dateFrom = ymd(start.year, start.month, start.day);
  const dateTo = ymd(endInclusive.year, endInclusive.month, endInclusive.day);
  const [ey, em, ed] = dateTo.split("-").map(Number);

  return {
    timestampFrom: istMidnightUtc(start.year, start.month, start.day).toISOString(),
    timestampTo: istMidnightUtc(ey, em - 1, ed + 1).toISOString(),
    dateFrom,
    dateTo,
  };
}
