"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { RegistrationProgressMeter } from "@/components/ui/RegistrationProgressMeter";

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
    <RegistrationProgressMeter
      percent={percent}
      message={message}
      percentLabel={t("register.progress.percentComplete", { percent })}
      ariaLabel={t("register.progress.label")}
    />
  );
}
