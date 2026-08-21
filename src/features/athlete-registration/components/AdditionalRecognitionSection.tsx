"use client";

import { Controller, useFormContext } from "react-hook-form";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SectionCard } from "@/components/ui/SectionCard";
import { Textarea } from "@/components/ui/Textarea";
import { SCHOLARSHIP_OPTIONS } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";

export function AdditionalRecognitionSection() {
  const { t } = useTranslation();
  const { register, control } = useFormContext<AthleteRegistrationFormValues>();
  const scholarshipOptions = translateOptions(t, "options.scholarship", SCHOLARSHIP_OPTIONS);

  return (
    <SectionCard title={t("register.additionalRecognition.title")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Textarea
            id="awards"
            label={t("register.additionalRecognition.awards")}
            optional
            rows={3}
            placeholder={t("register.additionalRecognition.awardsPlaceholder")}
            {...register("additionalRecognition.awards")}
          />
        </div>
        <Controller
          name="additionalRecognition.scholarshipRecipient"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label={t("register.additionalRecognition.scholarship")}
              name={field.name}
              options={scholarshipOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              optional
            />
          )}
        />
      </div>
    </SectionCard>
  );
}
