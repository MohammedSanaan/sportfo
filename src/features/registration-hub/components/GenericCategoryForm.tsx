"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { FieldShell } from "@/components/ui/FieldShell";
import { cn } from "@/lib/cn";
import { validateAchievementDocument, MAX_DOCUMENT_SIZE_LABEL } from "@/lib/file-validation";
import type { RegistrationCategoryConfig, RegistrationField } from "@/lib/registration/categories";
import { useTranslation } from "@/i18n/LocaleProvider";

interface GenericCategoryFormProps {
  /** category.fields must be present -- this component only ever renders
   * for the 7 non-athlete categories (see /register/[category]/page.tsx). */
  category: RegistrationCategoryConfig;
}

// The 7 non-Athlete categories don't have Supabase persistence yet (see
// the schema proposal in the implementation report) -- every field here is
// still fully validated, but submitting never claims a fake "registration
// successful." The dynamic, per-category field set makes a single static
// form-values type impractical; FormValues stays intentionally loose at
// this one boundary while every field's *config* (RegistrationField) is
// still strongly typed.
type FormValues = Record<string, string | string[] | File | null>;

export function GenericCategoryForm({ category }: GenericCategoryFormProps) {
  const { t } = useTranslation();
  const fields = category.fields ?? [];
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: Object.fromEntries(
      fields.map((field) => [field.id, field.type === "multiselect" ? [] : field.type === "file" ? null : ""]),
    ),
  });

  function keyBase(fieldId: string) {
    return `registerHub.categories.${category.id}.fields.${fieldId}`;
  }

  const onSubmit = handleSubmit(async () => {
    // Deliberately not calling any Supabase action -- there is nowhere
    // for this category to persist to yet. A short pause just keeps the
    // button's busy state from flashing instantly.
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSubmitted(true);
  });

  function fieldError(fieldId: string): string | undefined {
    const error = errors[fieldId];
    return typeof error?.message === "string" ? error.message : undefined;
  }

  function renderField(field: RegistrationField) {
    const label = t(`${keyBase(field.id)}.label`);
    const error = fieldError(field.id);

    if (field.type === "text" || field.type === "url") {
      return (
        <Input
          key={field.id}
          id={field.id}
          type={field.type === "url" ? "url" : "text"}
          label={label}
          optional={!field.required}
          error={error}
          placeholder={field.hasPlaceholder ? t(`${keyBase(field.id)}.placeholder`) : undefined}
          {...register(field.id, {
            required: field.required ? t("registerHub.validation.required") : false,
            validate:
              field.type === "url"
                ? (value) => {
                    const trimmed = String(value ?? "").trim();
                    if (!trimmed) return true;
                    try {
                      new URL(trimmed);
                      return true;
                    } catch {
                      return t("registerHub.validation.invalidUrl");
                    }
                  }
                : undefined,
          })}
        />
      );
    }

    if (field.type === "number") {
      return (
        <Input
          key={field.id}
          id={field.id}
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          label={label}
          optional={!field.required}
          error={error}
          {...register(field.id, {
            required: field.required ? t("registerHub.validation.required") : false,
            valueAsNumber: true,
            min: {
              value: field.min,
              message: t("registerHub.validation.numberRange", { min: field.min, max: field.max }),
            },
            max: {
              value: field.max,
              message: t("registerHub.validation.numberRange", { min: field.min, max: field.max }),
            },
          })}
        />
      );
    }

    if (field.type === "select") {
      const options = field.options.map((value) => ({
        value,
        label: t(`${keyBase(field.id)}.options.${value}`),
      }));
      return (
        <Select
          key={field.id}
          id={field.id}
          label={label}
          optional={!field.required}
          options={options}
          error={error}
          {...register(field.id, {
            required: field.required ? t("registerHub.validation.required") : false,
          })}
        />
      );
    }

    if (field.type === "multiselect") {
      return (
        <Controller
          key={field.id}
          name={field.id}
          control={control}
          rules={{
            validate: (value) =>
              !field.required || (Array.isArray(value) && value.length > 0) || t("registerHub.validation.required"),
          }}
          render={({ field: rhfField, fieldState }) => {
            const selectedValues = Array.isArray(rhfField.value) ? rhfField.value : [];
            return (
              <FieldShell
                label={label}
                htmlFor={field.id}
                optional={!field.required}
                error={fieldState.error?.message}
              >
                <div id={field.id} className="flex flex-wrap gap-2">
                  {field.options.map((value) => {
                    const selected = selectedValues.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          rhfField.onChange(
                            selected
                              ? selectedValues.filter((v) => v !== value)
                              : [...selectedValues, value],
                          )
                        }
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-border-default bg-surface text-ink-700 hover:border-brand-200 hover:bg-brand-50",
                        )}
                      >
                        {t(`${keyBase(field.id)}.options.${value}`)}
                      </button>
                    );
                  })}
                </div>
              </FieldShell>
            );
          }}
        />
      );
    }

    // file
    return (
      <Controller
        key={field.id}
        name={field.id}
        control={control}
        rules={{
          validate: (value) => {
            if (field.required && !value) return t("registerHub.validation.required");
            const result = validateAchievementDocument((value as File | null) ?? null);
            return result === true ? true : result;
          },
        }}
        render={({ field: rhfField, fieldState }) => (
          <FieldShell
            label={label}
            htmlFor={field.id}
            optional={!field.required}
            error={fieldState.error?.message}
            helperText={t("registerHub.upload.helper", { size: MAX_DOCUMENT_SIZE_LABEL })}
          >
            <input
              id={field.id}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(event) => rhfField.onChange(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 file:transition-colors hover:file:bg-brand-100"
            />
          </FieldShell>
        )}
      />
    );
  }

  return (
    <SectionCard title={t("registerHub.formDetailsTitle")} description={t("registerHub.pendingNoticeShort")}>
      {submitted && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {t("registerHub.pendingNotice", { category: t(`registerHub.categories.${category.id}.formTitle`) })}
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {fields.map((field) => renderField(field))}
        <div className="sm:col-span-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {t("registerHub.actions.registerNow")}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
