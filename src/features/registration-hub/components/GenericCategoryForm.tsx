"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { FieldShell } from "@/components/ui/FieldShell";
import { AlreadyRegisteredNotice } from "@/components/ui/AlreadyRegisteredNotice";
import { cn } from "@/lib/cn";
import { validateAchievementDocument, MAX_DOCUMENT_SIZE_LABEL } from "@/lib/file-validation";
import { displayFilenameFromPath } from "@/lib/storage/achievement-documents";
import { uploadRoleRegistrationDocument } from "@/lib/storage/role-registration-documents";
import { createClient } from "@/lib/supabase/client";
import { getOwnSportfoId } from "@/lib/sportfo-id/server";
import type { Json } from "@/types/supabase";
import type { RegistrationCategoryConfig, RegistrationField } from "@/lib/registration/categories";
import { useTranslation } from "@/i18n/LocaleProvider";
import { RegistrationHubSuccess } from "./RegistrationHubSuccess";

interface GenericCategoryFormProps {
  /** category.fields must be present -- this component only ever renders
   * for the 7 non-athlete categories (see /register/[category]/page.tsx). */
  category: RegistrationCategoryConfig;
  /** Previously-saved field values (from get_own_role_registration), keyed
   * exactly like `fields` -- lets a visitor come back and see/edit what
   * they already submitted, same idea as Athlete's draft reload. */
  initialFields?: Record<string, unknown>;
  /** "draft" | "submitted" | undefined (no registration at all yet) -- only
   * "submitted" shows the AlreadyRegisteredNotice above the form. */
  initialStatus?: string;
}

// A file field's value is a File (freshly picked, not yet uploaded), a
// string (an already-uploaded Storage path from a previous save), or null
// (nothing). Every other field is a string, string[] (multiselect), or "".
type FormValues = Record<string, string | string[] | File | null>;

function buildDefaultValues(
  fields: RegistrationField[],
  initialFields: Record<string, unknown> | undefined,
): FormValues {
  return Object.fromEntries(
    fields.map((field) => {
      const existing = initialFields?.[field.id];
      if (field.type === "multiselect") {
        return [field.id, Array.isArray(existing) ? existing.map(String) : []];
      }
      if (field.type === "file") {
        return [field.id, typeof existing === "string" && existing ? existing : null];
      }
      if (existing === null || existing === undefined) {
        return [field.id, ""];
      }
      return [field.id, String(existing)];
    }),
  );
}

export function GenericCategoryForm({
  category,
  initialFields,
  initialStatus,
}: GenericCategoryFormProps) {
  const { t } = useTranslation();
  const fields = category.fields ?? [];
  const [supabase] = useState(() => createClient());
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [success, setSuccess] = useState<{ sportfoId: string | null } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: buildDefaultValues(fields, initialFields),
  });

  function keyBase(fieldId: string) {
    return `registerHub.categories.${category.id}.fields.${fieldId}`;
  }

  function fieldError(fieldId: string): string | undefined {
    const error = errors[fieldId];
    return typeof error?.message === "string" ? error.message : undefined;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    setIsSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setIsSaving(false);
      setSubmitError(t("registerHub.errors.sessionExpired"));
      return;
    }
    const userId = userData.user.id;

    // Upload any newly-picked files first -- if any upload fails, stop
    // here and show the failure state. Nothing is sent to
    // save_role_registration until every file that needs uploading has
    // succeeded, so a partial upload failure can never leave the database
    // referencing a file that was never actually stored.
    const payload: Record<string, Json> = {};
    for (const field of fields) {
      const value = values[field.id];
      if (field.type === "file") {
        if (value instanceof File) {
          const uploadResult = await uploadRoleRegistrationDocument(supabase, {
            userId,
            registrationType: category.registrationType,
            fieldId: field.id,
            file: value,
          });
          if (!uploadResult.ok) {
            setIsSaving(false);
            setSubmitError(uploadResult.error ?? t("registerHub.errors.uploadFailed"));
            return;
          }
          payload[field.id] = uploadResult.path ?? null;
        }
        // A string (existing path, unchanged) or null is simply omitted --
        // save_role_registration's coalesce(new, existing) keeps whatever
        // was already saved when the key is absent.
        continue;
      }
      // Every non-file field value is a plain string or string[] -- both
      // directly JSON-serializable; File is only ever a possibility for
      // file fields, already handled and `continue`d above.
      payload[field.id] = value as Json;
    }

    const { data, error } = await supabase.rpc("save_role_registration", {
      p_registration_type: category.registrationType,
      p_status: "submitted",
      p_fields: payload,
    });

    if (error || !data) {
      console.error(`save_role_registration (${category.registrationType}) failed:`, error);
      setIsSaving(false);
      setSubmitError(t("registerHub.errors.saveFailed"));
      return;
    }

    // Never a new/second SportFo ID for this category -- this is a pure
    // read of the one permanent id already assigned to this account.
    const sportfoId = await getOwnSportfoId(supabase, userId);
    setIsSaving(false);
    setSuccess({ sportfoId });
  });

  if (success) {
    return <RegistrationHubSuccess category={category} sportfoId={success.sportfoId} />;
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
            if (value instanceof File) {
              const result = validateAchievementDocument(value);
              return result === true ? true : result;
            }
            return true;
          },
        }}
        render={({ field: rhfField, fieldState }) => {
          const existingPath = typeof rhfField.value === "string" ? rhfField.value : null;
          const pickedFile = rhfField.value instanceof File ? rhfField.value : null;
          return (
            <FieldShell
              label={label}
              htmlFor={field.id}
              optional={!field.required}
              error={fieldState.error?.message}
              helperText={t("registerHub.upload.helper", { size: MAX_DOCUMENT_SIZE_LABEL })}
            >
              <div className="flex flex-col gap-1.5">
                {existingPath && !pickedFile && (
                  <p className="text-xs text-ink-500">
                    {t("registerHub.upload.currentFile", { name: displayFilenameFromPath(existingPath) })}
                  </p>
                )}
                <input
                  id={field.id}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => rhfField.onChange(event.target.files?.[0] ?? existingPath ?? null)}
                  className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 file:transition-colors hover:file:bg-brand-100"
                />
              </div>
            </FieldShell>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {initialStatus === "submitted" && (
        <AlreadyRegisteredNotice
          title={t("registerHub.alreadyRegistered.title", {
            role: t(`account.roles.${category.id}`),
          })}
          description={t("registerHub.alreadyRegistered.description")}
        />
      )}
      <SectionCard title={t("registerHub.formDetailsTitle")}>
        {submitError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">{t("registerHub.errors.title")}</p>
            <p className="mt-1">{submitError}</p>
          </div>
        )}

        <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          {fields.map((field) => renderField(field))}
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? t("registerHub.actions.registering") : t("registerHub.actions.registerNow")}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
