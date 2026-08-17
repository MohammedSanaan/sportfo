"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ACHIEVEMENT_TYPES } from "@/lib/athlete-options";
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_SIZE_LABEL,
  validateAchievementDocument,
} from "@/lib/file-validation";
import type { AthleteRegistrationFormValues } from "@/types/athlete";

interface AchievementFormProps {
  index: number;
  onRemove: () => void;
}

export function AchievementForm({ index, onRemove }: AchievementFormProps) {
  const { register, control } = useFormContext<AthleteRegistrationFormValues>();

  const idPrefix = `achievement-${index}`;

  return (
    <div className="rounded-lg border border-border-default bg-surface-muted p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-800">
          Achievement {index + 1}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-surface hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-title`}
          label="Achievement Title"
          {...register(`achievements.${index}.title`)}
        />
        <Select
          id={`${idPrefix}-type`}
          label="Achievement Type"
          options={ACHIEVEMENT_TYPES}
          {...register(`achievements.${index}.type`)}
        />
        <Input
          id={`${idPrefix}-organization`}
          label="Issuing Organization"
          {...register(`achievements.${index}.organization`)}
        />
        <Input
          id={`${idPrefix}-date`}
          label="Achievement Date"
          type="date"
          {...register(`achievements.${index}.date`)}
        />
        <div className="sm:col-span-2">
          <Textarea
            id={`${idPrefix}-description`}
            label="Description"
            optional
            rows={3}
            {...register(`achievements.${index}.description`)}
          />
        </div>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">
            Supporting Document
          </span>
          <Controller
            name={`achievements.${index}.document`}
            control={control}
            rules={{ validate: validateAchievementDocument }}
            render={({ field: { value, onChange, onBlur, name, ref }, fieldState }) => (
              <>
                <label
                  htmlFor={`${idPrefix}-document`}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-surface px-4 py-6 text-center transition-colors hover:border-brand-400"
                >
                  <span className="text-sm font-medium text-brand-700">
                    Choose a file to attach
                  </span>
                  <span className="text-xs text-ink-400">
                    PDF, JPG or PNG · Up to {MAX_DOCUMENT_SIZE_LABEL} · Uploaded
                    once account storage is connected
                  </span>
                  <input
                    id={`${idPrefix}-document`}
                    name={name}
                    ref={ref}
                    type="file"
                    accept={ACCEPTED_DOCUMENT_EXTENSIONS.join(",")}
                    className="sr-only"
                    onBlur={onBlur}
                    aria-invalid={fieldState.error ? true : undefined}
                    aria-describedby={
                      fieldState.error ? `${idPrefix}-document-error` : undefined
                    }
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                  />
                </label>
                {value && (
                  <div className="mt-2 flex items-center justify-between rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-ink-700">
                    <span className="truncate">{value.name}</span>
                    <button
                      type="button"
                      onClick={() => onChange(null)}
                      className="ml-3 shrink-0 text-xs font-medium text-ink-500 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
                    >
                      Remove file
                    </button>
                  </div>
                )}
                {fieldState.error?.message && (
                  <p
                    id={`${idPrefix}-document-error`}
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
