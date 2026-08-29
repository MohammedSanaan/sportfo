"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Select } from "@/components/ui/Select";
import { SectionCard } from "@/components/ui/SectionCard";
import { PersonalDetailsIcon } from "@/components/ui/RegistrationIcons";
import { GENDER_OPTIONS } from "@/lib/athlete-options";
import {
  dateOfBirthRule,
  emailRule,
  mobileNumberRule,
  requiredTextRule,
  today,
} from "@/lib/athlete-validation";
import { getAuthMode } from "@/lib/auth-mode";
import { isValidE164 } from "@/lib/phone/e164";
import { LOCALES, LOCALE_LABELS } from "@/i18n/config";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";
import { EmergencyContactField } from "./EmergencyContactField";

// Reuses the exact native-script names the language selector elsewhere in
// the app already shows (see i18n/config.ts) -- these are proper nouns,
// not re-translated per active UI locale.
const PREFERRED_LANGUAGE_OPTIONS = LOCALES.map((code) => ({
  value: code,
  label: LOCALE_LABELS[code],
}));

export function PersonalDetailsSection() {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AthleteRegistrationFormValues>();

  const mobileHelperText =
    getAuthMode() === "demo" ? t("register.personal.mobileHelperDemo") : t("register.personal.mobileHelperOtp");

  const genderOptions = translateOptions(t, "options.gender", GENDER_OPTIONS);

  return (
    <SectionCard
      title={t("register.personal.title")}
      description={t("register.personal.description")}
      icon={<PersonalDetailsIcon />}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Input
          id="fullName"
          label={t("register.personal.fullName")}
          autoComplete="name"
          error={errors.personalDetails?.fullName?.message}
          {...register("personalDetails.fullName", requiredTextRule("Full name"))}
        />
        <Input
          id="dateOfBirth"
          label={t("register.personal.dateOfBirth")}
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
              label={t("register.personal.gender")}
              name={field.name}
              options={genderOptions}
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
          label={t("register.personal.nationality")}
          error={errors.personalDetails?.nationality?.message}
          {...register("personalDetails.nationality", requiredTextRule("Nationality"))}
        />
        <Input
          id="country"
          label={t("register.personal.country")}
          autoComplete="country-name"
          error={errors.personalDetails?.country?.message}
          {...register("personalDetails.country", requiredTextRule("Country"))}
        />
        <Input
          id="city"
          label={t("register.personal.city")}
          autoComplete="address-level2"
          error={errors.personalDetails?.city?.message}
          {...register("personalDetails.city", requiredTextRule("City"))}
        />
        <Input
          id="mobileNumber"
          label={t("register.personal.mobileNumber")}
          type="tel"
          autoComplete="tel"
          readOnly
          aria-readonly
          helperText={mobileHelperText}
          className="cursor-not-allowed bg-surface-muted text-ink-500"
          error={errors.personalDetails?.mobileNumber?.message}
          {...register("personalDetails.mobileNumber", mobileNumberRule)}
        />
        <Input
          id="email"
          label={t("register.personal.email")}
          type="email"
          autoComplete="email"
          error={errors.personalDetails?.email?.message}
          {...register("personalDetails.email", emailRule)}
        />
        <Select
          id="preferredLanguage"
          label={t("register.personal.preferredLanguage")}
          options={PREFERRED_LANGUAGE_OPTIONS}
          error={errors.personalDetails?.preferredLanguage?.message}
          {...register("personalDetails.preferredLanguage", {
            required: t("register.personal.preferredLanguageRequired"),
          })}
        />
        <Controller
          name="personalDetails.emergencyContact"
          control={control}
          rules={{
            // Optional -- blank is always valid. Only a non-blank value
            // gets shape-checked, and only as "is this a plausible E.164
            // number" (see isValidE164), never pinned to one country's
            // digit-count format.
            validate: (value) =>
              !value || isValidE164(value) || t("register.personal.emergencyContactInvalid"),
          }}
          render={({ field, fieldState }) => (
            <EmergencyContactField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Input
          id="school"
          label={t("register.personal.school")}
          optional
          {...register("personalDetails.school")}
        />
        <Input
          id="club"
          label={t("register.personal.club")}
          optional
          {...register("personalDetails.club")}
        />
        {/* sm:col-span-2 on the wrapper (not Input's own className, which
            only reaches the inner <input>) -- Coach/Mentor Name and
            Aadhaar/Govt ID both read better as their own full-width rows
            than squeezed into a two-column pairing. */}
        <div className="sm:col-span-2">
          <Input
            id="coachName"
            label={t("register.personal.coachName")}
            optional
            {...register("personalDetails.coachName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            id="aadhaarOrGovtId"
            label={t("register.personal.aadhaarGovtId")}
            optional
            placeholder={t("register.personal.aadhaarGovtIdPlaceholder")}
            {...register("personalDetails.aadhaarOrGovtId")}
          />
        </div>
      </div>
    </SectionCard>
  );
}
