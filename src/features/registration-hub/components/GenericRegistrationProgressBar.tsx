"use client";

import { useWatch, type Control } from "react-hook-form";
import { RegistrationProgressMeter } from "@/components/ui/RegistrationProgressMeter";
import type { RegistrationField } from "@/lib/registration/categories";
import type { FormValues } from "./GenericCategoryForm";
import { useTranslation } from "@/i18n/LocaleProvider";

interface GenericRegistrationProgressBarProps {
  control: Control<FormValues>;
  fields: RegistrationField[];
}

// Same completion-nudge idea as the Athlete flow's RegistrationProgressBar
// (see src/features/athlete-registration/components/RegistrationProgressBar.tsx
// and the shared RegistrationProgressMeter they both render through), but
// driven by each category's own `required` field list from categories.ts
// instead of a hand-picked path list -- so every one of the 7 generic
// categories gets an accurate percentage without a bespoke constant per
// category. A multiselect counts as filled once at least one option is
// chosen; every other field type counts as filled once it's a non-blank
// string.
export function GenericRegistrationProgressBar({ control, fields }: GenericRegistrationProgressBarProps) {
  const { t } = useTranslation();
  const values = useWatch({ control });

  const requiredFields = fields.filter((field) => field.required);
  const completed = requiredFields.filter((field) => {
    const value = values[field.id];
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  const percent =
    requiredFields.length === 0 ? 100 : Math.round((completed / requiredFields.length) * 100);

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
