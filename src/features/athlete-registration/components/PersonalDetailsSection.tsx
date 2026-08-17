"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SectionCard } from "@/components/ui/SectionCard";
import { GENDER_OPTIONS } from "@/lib/athlete-options";
import {
  dateOfBirthRule,
  emailRule,
  mobileNumberRule,
  requiredTextRule,
  today,
} from "@/lib/athlete-validation";
import type { AthleteRegistrationFormValues } from "@/types/athlete";

export function PersonalDetailsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AthleteRegistrationFormValues>();

  return (
    <SectionCard
      title="Personal Details"
      description="Tell us who you are and how to reach you."
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Input
          id="fullName"
          label="Full Name"
          autoComplete="name"
          error={errors.personalDetails?.fullName?.message}
          {...register("personalDetails.fullName", requiredTextRule("Full name"))}
        />
        <Input
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          max={today()}
          error={errors.personalDetails?.dateOfBirth?.message}
          {...register("personalDetails.dateOfBirth", dateOfBirthRule)}
        />
        <Controller
          name="personalDetails.gender"
          control={control}
          rules={{ required: "Select your gender." }}
          render={({ field, fieldState }) => (
            <RadioGroup
              label="Gender"
              name={field.name}
              options={GENDER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Input
          id="nationality"
          label="Nationality"
          error={errors.personalDetails?.nationality?.message}
          {...register("personalDetails.nationality", requiredTextRule("Nationality"))}
        />
        <Input
          id="country"
          label="Country"
          autoComplete="country-name"
          error={errors.personalDetails?.country?.message}
          {...register("personalDetails.country", requiredTextRule("Country"))}
        />
        <Input
          id="city"
          label="City"
          autoComplete="address-level2"
          error={errors.personalDetails?.city?.message}
          {...register("personalDetails.city", requiredTextRule("City"))}
        />
        <Input
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          autoComplete="tel"
          readOnly
          aria-readonly
          helperText="This is the number you verified at login and can't be changed here."
          className="cursor-not-allowed bg-surface-muted text-ink-500"
          error={errors.personalDetails?.mobileNumber?.message}
          {...register("personalDetails.mobileNumber", mobileNumberRule)}
        />
        <Input
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.personalDetails?.email?.message}
          {...register("personalDetails.email", emailRule)}
        />
        <Input
          id="school"
          label="School / College"
          optional
          {...register("personalDetails.school")}
        />
        <Input
          id="club"
          label="Club / Academy"
          optional
          {...register("personalDetails.club")}
        />
        <Input
          id="coachName"
          label="Coach / Mentor Name"
          optional
          {...register("personalDetails.coachName")}
        />
      </div>
    </SectionCard>
  );
}
