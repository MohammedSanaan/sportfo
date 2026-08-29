"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";

// The same fields each section already enforces via `required`/`rules`
// (see PersonalDetailsSection and SportsInformationSection) -- Achievements,
// Employment, Apparel & Logistics, and Profile Setup have no required
// fields of their own today, so they don't factor into this percentage.
// Purely a visual completion nudge, never a gate on Save Draft/Create
// Profile -- those stay governed by each field's own RHF validation.
const REQUIRED_FIELD_PATHS = [
  "personalDetails.fullName",
  "personalDetails.dateOfBirth",
  "personalDetails.gender",
  "personalDetails.nationality",
  "personalDetails.country",
  "personalDetails.city",
  "personalDetails.mobileNumber",
  "personalDetails.email",
  "personalDetails.preferredLanguage",
  "sportsInformation.primarySport",
  "sportsInformation.skillLevel",
  "sportsInformation.competitionLevel",
] as const;

function readPath(values: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && segment in node) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, values);
}

export function RegistrationProgressBar() {
  const { t } = useTranslation();
  const { control } = useFormContext<AthleteRegistrationFormValues>();
  const values = useWatch({ control });

  const completed = REQUIRED_FIELD_PATHS.filter((path) => {
    const value = readPath(values, path);
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  const percent = Math.round((completed / REQUIRED_FIELD_PATHS.length) * 100);

  const message =
    percent >= 100
      ? t("register.progress.complete")
      : percent >= 75
        ? t("register.progress.almostThere")
        : percent >= 25
          ? t("register.progress.keepGoing")
          : t("register.progress.getStarted");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border-default bg-surface px-4 py-3.5 sm:px-5">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-ink-500">
        <span>{message}</span>
        <span>{t("register.progress.percentComplete", { percent })}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("register.progress.label")}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
