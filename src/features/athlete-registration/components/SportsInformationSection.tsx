"use client";

import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SectionCard } from "@/components/ui/SectionCard";
import { getCategoriesForSport } from "@/lib/sports/catalog";
import { SKILL_LEVELS } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";
import { SportCombobox } from "./SportCombobox";
import { CategorySelect } from "./CategorySelect";

export function SportsInformationSection() {
  const { t } = useTranslation();
  const { register, control, setValue } = useFormContext<AthleteRegistrationFormValues>();

  const skillLevelOptions = translateOptions(t, "options.skillLevel", SKILL_LEVELS);

  const primarySport = useWatch({ control, name: "sportsInformation.primarySport" });
  const sportCategory = useWatch({ control, name: "sportsInformation.sportCategory" });
  const categoriesForSport = getCategoriesForSport(primarySport);

  // Keeps Category in lockstep with Sport: auto-fills a single-category
  // sport, clears a now-invalid category the moment Sport changes (never
  // leaves e.g. "Team Sports" stale after switching Cricket -> Badminton),
  // and otherwise leaves a valid in-range selection alone so an existing
  // draft's previously-chosen category among a multi-category sport's
  // options survives a reload.
  useEffect(() => {
    if (categoriesForSport.length === 1) {
      if (sportCategory !== categoriesForSport[0]) {
        setValue("sportsInformation.sportCategory", categoriesForSport[0], {
          shouldDirty: true,
        });
      }
    } else if (categoriesForSport.length === 0) {
      if (sportCategory !== "") {
        setValue("sportsInformation.sportCategory", "", { shouldDirty: true });
      }
    } else if (sportCategory && !categoriesForSport.some((category) => category === sportCategory)) {
      setValue("sportsInformation.sportCategory", "", { shouldDirty: true });
    }
    // Only re-run when the resolved category set for the current sport
    // changes -- not on every keystroke of a manual category pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primarySport, categoriesForSport.join("|")]);

  const isSingleCategory = categoriesForSport.length === 1;
  const isMultiCategory = categoriesForSport.length > 1;
  const isUnmapped = Boolean(primarySport) && categoriesForSport.length === 0;

  const categoryHelperText = isSingleCategory
    ? t("register.sports.categoryAutoHelper")
    : isMultiCategory
      ? t("register.sports.categoryMultiHelper", { sport: primarySport })
      : isUnmapped
        ? t("register.sports.categoryUnmappedHelper")
        : undefined;

  const sportComboboxCategoryLabel = isSingleCategory
    ? categoriesForSport[0]
    : isMultiCategory
      ? sportCategory || undefined
      : undefined;

  return (
    <SectionCard title={t("register.sports.title")} description={t("register.sports.description")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Controller
          name="sportsInformation.primarySport"
          control={control}
          rules={{ required: "Select your primary sport." }}
          render={({ field, fieldState }) => (
            <SportCombobox
              id="primarySport"
              label={t("register.sports.primarySport")}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              categoryLabel={sportComboboxCategoryLabel}
              placeholder={t("register.sports.primarySportSearchPlaceholder")}
              noResultsLabel={t("register.sports.primarySportNoResults")}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="sportsInformation.sportCategory"
          control={control}
          rules={{
            validate: (value) =>
              categoriesForSport.length === 0 || Boolean(value) || "Select your sport category.",
          }}
          render={({ field, fieldState }) => (
            <CategorySelect
              id="sportCategory"
              label={t("register.sports.category")}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              options={categoriesForSport}
              placeholder={t("register.sports.categoryPlaceholder")}
              locked={isSingleCategory}
              disabled={isUnmapped || !primarySport}
              helperText={categoryHelperText}
              error={fieldState.error?.message}
            />
          )}
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
