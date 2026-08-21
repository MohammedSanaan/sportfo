"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";

export function SportsInformationSection() {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AthleteRegistrationFormValues>();

  const skillLevelOptions = translateOptions(t, "options.skillLevel", SKILL_LEVELS);

  return (
    <SectionCard title={t("register.sports.title")} description={t("register.sports.description")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Select
          id="primarySport"
          label={t("register.sports.primarySport")}
          options={PRIMARY_SPORTS}
          error={errors.sportsInformation?.primarySport?.message}
          {...register("sportsInformation.primarySport", {
            required: "Select your primary sport.",
          })}
        />
        <Input
          id="discipline"
          label={t("register.sports.discipline")}
          optional
          placeholder={t("register.sports.disciplinePlaceholder")}
          {...register("sportsInformation.discipline")}
        />
        <Input
          id="position"
          label={t("register.sports.position")}
          optional
          placeholder={t("register.sports.positionPlaceholder")}
          {...register("sportsInformation.position")}
        />
        <Controller
          name="sportsInformation.skillLevel"
          control={control}
          rules={{ required: "Select your skill level." }}
          render={({ field, fieldState }) => (
            <RadioGroup
              label={t("register.sports.skillLevel")}
              name={field.name}
              options={skillLevelOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>
    </SectionCard>
  );
}
