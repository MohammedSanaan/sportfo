"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SectionCard } from "@/components/ui/SectionCard";
import { EMPLOYMENT_TYPES, YEARS_EXPERIENCE } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";

export function EmploymentSection() {
  const { t } = useTranslation();
  const { register, control } = useFormContext<AthleteRegistrationFormValues>();

  const employmentTypeOptions = translateOptions(t, "options.employmentType", EMPLOYMENT_TYPES);
  const yearsExperienceOptions = translateOptions(t, "options.yearsExperience", YEARS_EXPERIENCE);

  const employmentType = useWatch({ control, name: "employment.employmentType" });
  // A Student or Unemployed athlete has no organization/job title to
  // report -- those two fields stay optional in that case rather than
  // blocking submission over data that doesn't exist yet.
  const organizationRequired = Boolean(
    employmentType && employmentType !== "student" && employmentType !== "unemployed",
  );

  return (
    <SectionCard title={t("register.employment.title")} description={t("register.employment.description")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Controller
          name="employment.employmentType"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              id="employmentType"
              label={t("register.employment.employmentType")}
              optional
              options={employmentTypeOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="employment.yearsExperience"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              id="yearsExperience"
              label={t("register.employment.yearsExperience")}
              optional
              options={yearsExperienceOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Input
          id="organization"
          label={t("register.employment.organization")}
          optional={!organizationRequired}
          placeholder={t("register.employment.organizationPlaceholder")}
          {...register("employment.organization")}
        />
        <Input
          id="jobTitle"
          label={t("register.employment.jobTitle")}
          optional={!organizationRequired}
          placeholder={t("register.employment.jobTitlePlaceholder")}
          {...register("employment.jobTitle")}
        />
      </div>
    </SectionCard>
  );
}
