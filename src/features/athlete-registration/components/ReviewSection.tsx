"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import {
  GENDER_OPTIONS,
  SKILL_LEVELS,
  COMPETITION_LEVELS,
  EMPLOYMENT_TYPES,
  APPAREL_SIZES,
} from "@/lib/athlete-options";
import { translateOptions } from "@/lib/i18n-options";
import { useTranslation } from "@/i18n/LocaleProvider";

interface ReviewSectionProps {
  onEditStep: (stepIndex: number) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-ink-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function SummaryCard({
  title,
  stepIndex,
  onEditStep,
  editLabel,
  children,
}: {
  title: string;
  stepIndex: number;
  onEditStep: (stepIndex: number) => void;
  editLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-default bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-default pb-4">
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEditStep(stepIndex)}
          className="shrink-0 rounded-md px-2.5 py-1 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          {editLabel}
        </button>
      </div>
      <dl className="flex flex-col divide-y divide-border-default">{children}</dl>
    </section>
  );
}

// The one review-before-submit screen (Section 10 of the production spec):
// a read-only summary of every step's key values with an Edit action that
// jumps straight back to that step -- no field here is independently
// editable, it only mirrors what's already in react-hook-form state so it
// can never drift out of sync with what Save Draft/Create Profile actually
// submits.
export function ReviewSection({ onEditStep }: ReviewSectionProps) {
  const { t } = useTranslation();
  const { control } = useFormContext<AthleteRegistrationFormValues>();
  const values = useWatch({ control });

  const notProvided = t("register.wizard.notProvided");
  const display = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value : notProvided;

  const genderOptions = translateOptions(t, "options.gender", GENDER_OPTIONS);
  const skillLevelOptions = translateOptions(t, "options.skillLevel", SKILL_LEVELS);
  const competitionLevelOptions = translateOptions(t, "options.competitionLevel", COMPETITION_LEVELS);
  const employmentTypeOptions = translateOptions(t, "options.employmentType", EMPLOYMENT_TYPES);
  const apparelSizeOptions = translateOptions(t, "options.apparelSize", APPAREL_SIZES);

  const displayOption = (options: { value: string; label: string }[], value: unknown) => {
    if (typeof value !== "string" || value.trim().length === 0) return notProvided;
    return options.find((option) => option.value === value)?.label ?? value;
  };

  const personal = values.personalDetails;
  const sport = values.sportsInformation;
  // Same "untouched card" definition as isBlankAchievement (see
  // achievement-helpers.ts) -- reimplemented rather than reused because
  // useWatch's snapshot is a DeepPartial, not the full Achievement shape
  // that helper requires.
  const achievements = (values.achievements ?? []).filter(
    (achievement) => achievement && (achievement.id || achievement.title?.trim()),
  );
  const profile = values.profileSetup;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">{t("register.wizard.reviewTitle")}</h2>
        <p className="mt-1 text-sm text-ink-500">{t("register.wizard.reviewDescription")}</p>
      </div>

      <SummaryCard
        title={t("register.personal.title")}
        stepIndex={0}
        onEditStep={onEditStep}
        editLabel={t("register.wizard.edit")}
      >
        <SummaryRow label={t("register.personal.fullName")} value={display(personal?.fullName)} />
        <SummaryRow label={t("register.personal.dateOfBirth")} value={display(personal?.dateOfBirth)} />
        <SummaryRow label={t("register.personal.gender")} value={displayOption(genderOptions, personal?.gender)} />
        <SummaryRow
          label={t("register.personal.city")}
          value={display(
            [personal?.city, personal?.state, personal?.country].filter(Boolean).join(", ") || undefined,
          )}
        />
        <SummaryRow label={t("register.personal.mobileNumber")} value={display(personal?.mobileNumber)} />
        <SummaryRow label={t("register.personal.email")} value={display(personal?.email)} />
      </SummaryCard>

      <SummaryCard
        title={t("register.wizard.stepSportAchievements")}
        stepIndex={1}
        onEditStep={onEditStep}
        editLabel={t("register.wizard.edit")}
      >
        <SummaryRow label={t("register.sports.primarySport")} value={display(sport?.primarySport)} />
        <SummaryRow label={t("register.sports.skillLevel")} value={displayOption(skillLevelOptions, sport?.skillLevel)} />
        <SummaryRow
          label={t("register.sports.competitionLevel")}
          value={displayOption(competitionLevelOptions, sport?.competitionLevel)}
        />
        <SummaryRow
          label={t("register.achievements.title")}
          value={t("register.wizard.achievementsAdded", {
            n: achievements.length,
            plural: achievements.length === 1 ? "" : "s",
          })}
        />
      </SummaryCard>

      <SummaryCard
        title={t("register.wizard.stepBackground")}
        stepIndex={2}
        onEditStep={onEditStep}
        editLabel={t("register.wizard.edit")}
      >
        <SummaryRow
          label={t("register.employment.employmentType")}
          value={displayOption(employmentTypeOptions, values.employment?.employmentType)}
        />
        <SummaryRow
          label={t("register.apparel.trackSuitSize")}
          value={displayOption(apparelSizeOptions, values.apparelLogistics?.trackSuitSize)}
        />
      </SummaryCard>

      <SummaryCard
        title={t("register.wizard.stepProfileVerify")}
        stepIndex={3}
        onEditStep={onEditStep}
        editLabel={t("register.wizard.edit")}
      >
        <SummaryRow label={t("register.profile.shortBio")} value={display(profile?.shortBio)} />
      </SummaryCard>
    </div>
  );
}
