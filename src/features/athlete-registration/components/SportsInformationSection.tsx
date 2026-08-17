"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SectionCard } from "@/components/ui/SectionCard";
import { Select } from "@/components/ui/Select";
import { PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";

export function SportsInformationSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AthleteRegistrationFormValues>();

  return (
    <SectionCard
      title="Sports Information"
      description="Share your primary sport and current skill level."
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Select
          id="primarySport"
          label="Primary Sport"
          options={PRIMARY_SPORTS}
          error={errors.sportsInformation?.primarySport?.message}
          {...register("sportsInformation.primarySport", {
            required: "Select your primary sport.",
          })}
        />
        <Input
          id="discipline"
          label="Sport Discipline / Sub-category"
          optional
          placeholder="e.g. Freestyle, Sprint, Striker"
          {...register("sportsInformation.discipline")}
        />
        <Input
          id="position"
          label="Position / Role"
          optional
          placeholder="e.g. Forward, Goalkeeper, All-rounder"
          {...register("sportsInformation.position")}
        />
        <Controller
          name="sportsInformation.skillLevel"
          control={control}
          rules={{ required: "Select your skill level." }}
          render={({ field, fieldState }) => (
            <RadioGroup
              label="Skill Level"
              name={field.name}
              options={SKILL_LEVELS}
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
