"use client";

import { Controller, useFormContext } from "react-hook-form";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SectionCard } from "@/components/ui/SectionCard";
import { Textarea } from "@/components/ui/Textarea";
import { SCHOLARSHIP_OPTIONS } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";

export function AdditionalRecognitionSection() {
  const { register, control } = useFormContext<AthleteRegistrationFormValues>();

  return (
    <SectionCard title="Additional Recognition">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Textarea
            id="awards"
            label="Awards / Recognition"
            optional
            rows={3}
            placeholder="List any other awards or recognitions"
            {...register("additionalRecognition.awards")}
          />
        </div>
        <Controller
          name="additionalRecognition.scholarshipRecipient"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Scholarship Recipient"
              name={field.name}
              options={SCHOLARSHIP_OPTIONS}
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
