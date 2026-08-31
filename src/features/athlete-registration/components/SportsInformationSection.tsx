"use client";

import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FieldShell } from "@/components/ui/FieldShell";
import { SectionCard } from "@/components/ui/SectionCard";
import { SportsIcon } from "@/components/ui/RegistrationIcons";
import { cn } from "@/lib/cn";
import { getCategoriesForSport } from "@/lib/sports/catalog";
import { SKILL_LEVELS, COMPETITION_LEVELS, SUPPORT_NEEDED } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";
import { SportCombobox } from "./SportCombobox";
import { CategorySelect } from "./CategorySelect";
import { SecondarySportsField } from "./SecondarySportsField";

export function SportsInformationSection() {
  const { t } = useTranslation();
  const { register, control, setValue } = useFormContext<AthleteRegistrationFormValues>();

  const skillLevelOptions = translateOptions(t, "options.skillLevel", SKILL_LEVELS);
  const competitionLevelOptions = translateOptions(
    t,
    "options.competitionLevel",
    COMPETITION_LEVELS,
  );
  const supportNeededOptions = translateOptions(t, "options.supportNeeded", SUPPORT_NEEDED);

  const supportNeeded = useWatch({ control, name: "sportsInformation.supportNeeded" }) ?? [];
  const supportNeededIncludesOther = supportNeeded.includes("Other");

  const primarySport = useWatch({ control, name: "sportsInformation.primarySport" });
  const sportCategory = useWatch({ control, name: "sportsInformation.sportCategory" });
  const competitionLevel = useWatch({ control, name: "sportsInformation.competitionLevel" });
  const secondarySports = useWatch({ control, name: "sportsInformation.secondarySports" }) ?? [];
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

  // Primary Sport can never also sit in Secondary Sports (see task spec)
  // -- SecondarySportsField already excludes the current primary sport
  // from its own pickable options, but if the athlete picks a NEW primary
  // sport that happens to already be selected as a secondary one, that
  // stale entry must be dropped automatically rather than silently
  // leaving a sport duplicated across both fields.
  useEffect(() => {
    if (primarySport && secondarySports.includes(primarySport)) {
      setValue(
        "sportsInformation.secondarySports",
        secondarySports.filter((sport) => sport !== primarySport),
        { shouldDirty: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primarySport]);

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
    <SectionCard
      title={t("register.sports.title")}
      description={t("register.sports.description")}
      icon={<SportsIcon />}
    >
      {/* Row 1: Primary Sport / Secondary Sports */}
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
          name="sportsInformation.secondarySports"
          control={control}
          render={({ field }) => (
            <SecondarySportsField
              id="secondarySports"
              label={t("register.sports.secondarySports")}
              value={Array.isArray(field.value) ? field.value : []}
              onChange={field.onChange}
              primarySport={primarySport}
              placeholder={t("register.sports.secondarySportsPlaceholder")}
              noResultsLabel={t("register.sports.primarySportNoResults")}
              removeLabel={t("register.sports.secondarySportsRemove")}
              helperText={t("register.sports.secondarySportsHelper")}
            />
          )}
        />

        {/* Row 2: Category / Sport Discipline / Position / Role */}
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
          id="disciplinePosition"
          label={t("register.sports.disciplinePosition")}
          optional
          placeholder={t("register.sports.disciplinePositionPlaceholder")}
          {...register("sportsInformation.disciplinePosition")}
        />

        {/* Row 3: Skill Level / Highest Competition Level */}
        <Controller
          name="sportsInformation.skillLevel"
          control={control}
          rules={{ required: "Select your skill level." }}
          render={({ field, fieldState }) => (
            <Select
              id="skillLevel"
              label={t("register.sports.skillLevel")}
              options={skillLevelOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="sportsInformation.competitionLevel"
          control={control}
          rules={{ required: "Select your highest competition level." }}
          render={({ field, fieldState }) => (
            <Select
              id="competitionLevel"
              label={t("register.sports.competitionLevel")}
              helperText={t("register.sports.competitionLevelHelper")}
              options={competitionLevelOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        {competitionLevel === "other" && (
          <div className="sm:col-span-2">
            <Input
              id="competitionLevelOther"
              label={t("register.sports.competitionLevelOther")}
              placeholder={t("register.sports.competitionLevelOtherPlaceholder")}
              {...register("sportsInformation.competitionLevelOther", {
                required: t("register.sports.competitionLevelOtherRequired"),
              })}
            />
          </div>
        )}

        {/* Row 4: Club / Academy / Coach / Mentor Name -- moved here from
            Personal Details (see task spec). */}
        <Input
          id="sportsClub"
          label={t("register.personal.club")}
          optional
          {...register("sportsInformation.club")}
        />
        <Input
          id="sportsCoachName"
          label={t("register.personal.coachName")}
          optional
          {...register("sportsInformation.coachName")}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <Controller
          name="sportsInformation.supportNeeded"
          control={control}
          render={({ field }) => {
            const selectedValues = Array.isArray(field.value) ? field.value : [];
            return (
              <FieldShell
                label={t("register.sports.supportNeeded")}
                htmlFor="supportNeeded"
                optional
                helperText={t("register.sports.supportNeededHelper")}
              >
                <div id="supportNeeded" className="flex flex-wrap gap-2">
                  {supportNeededOptions.map((option) => {
                    const selected = selectedValues.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const next = selected
                            ? selectedValues.filter((value) => value !== option.value)
                            : [...selectedValues, option.value];
                          field.onChange(next);
                          if (option.value === "Other" && selected) {
                            setValue("sportsInformation.supportNeededOther", "", {
                              shouldDirty: true,
                            });
                          }
                        }}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-border-default bg-surface text-ink-700 hover:border-brand-200 hover:bg-brand-50",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </FieldShell>
            );
          }}
        />
        {supportNeededIncludesOther && (
          <Input
            id="supportNeededOther"
            label={t("register.sports.supportNeededOther")}
            optional
            placeholder={t("register.sports.supportNeededOtherPlaceholder")}
            {...register("sportsInformation.supportNeededOther")}
          />
        )}
      </div>
    </SectionCard>
  );
}
