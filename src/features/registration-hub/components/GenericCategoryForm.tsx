"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { FieldShell } from "@/components/ui/FieldShell";
import { ProfilePhotoField } from "@/components/ui/ProfilePhotoField";
import { AlreadyRegisteredNotice } from "@/components/ui/AlreadyRegisteredNotice";
import { cn } from "@/lib/cn";
import {
  validateAchievementDocument,
  validateProfilePhoto,
  MAX_DOCUMENT_SIZE_LABEL,
} from "@/lib/file-validation";
import { displayFilenameFromPath } from "@/lib/storage/achievement-documents";
import { uploadRoleRegistrationDocument } from "@/lib/storage/role-registration-documents";
import { uploadProfilePhoto, buildProfilePhotoUrl } from "@/lib/storage/profile-photo";
import { createClient } from "@/lib/supabase/client";
import { getOwnSportfoId } from "@/lib/sportfo-id/server";
import {
  clearRegistrationDraft,
  consumeRegistrationDraft,
  saveRegistrationDraft,
} from "@/lib/registration/draft-storage";
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

interface StoredDraft {
  values: FormValues;
  /** True if any field held a picked-but-not-yet-uploaded File when this
   * draft was saved -- Files aren't JSON-serializable, and the task
   * explicitly forbids persisting uploads client-side even transiently, so
   * they're stripped below. Drives the "please reselect your file(s)"
   * notice after restoring, instead of silently losing them. */
  hadPendingFiles: boolean;
}

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
      if (field.type === "file" || field.type === "photo") {
        return [field.id, typeof existing === "string" && existing ? existing : null];
      }
      if (existing === null || existing === undefined) {
        return [field.id, ""];
      }
      return [field.id, String(existing)];
    }),
  );
}

function buildStoredDraft(values: FormValues): StoredDraft {
  const stripped: FormValues = {};
  let hadPendingFiles = false;
  for (const [key, value] of Object.entries(values)) {
    if (value instanceof File) {
      hadPendingFiles = true;
      stripped[key] = null;
    } else {
      stripped[key] = value;
    }
  }
  return { values: stripped, hadPendingFiles };
}

export function GenericCategoryForm({
  category,
  initialFields,
  initialStatus,
}: GenericCategoryFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const fields = category.fields ?? [];
  const [supabase] = useState(() => createClient());
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [restoreNotice, setRestoreNotice] = useState<{ warning: boolean; message: string } | null>(
    null,
  );
  const [success, setSuccess] = useState<{ sportfoId: string | null } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: buildDefaultValues(fields, initialFields),
  });

  // Restores a draft left by the auth checkpoint in onSubmit below (guest
  // filled the form, hit Register Now, got sent to verify, and is now back
  // on this same category page) -- consumed once. Wrapped in a callback
  // (not called synchronously in the effect body) to keep the setState
  // calls inside a callback, same shape as WelcomeToast's sessionStorage
  // read.
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const draft = consumeRegistrationDraft<StoredDraft>(category.slug);
      if (!draft) return;
      reset(draft.values);
      setRestoreNotice({
        warning: draft.hadPendingFiles,
        message: draft.hadPendingFiles
          ? t("registerHub.banners.draftRestoredReselectFiles")
          : t("registerHub.banners.draftRestored"),
      });
    }, 0);
    return () => window.clearTimeout(restoreTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount only
  }, []);

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

    // Registration pages are public to view; auth is only required here,
    // at the save/submit step. A guest (or a session that expired mid-
    // form) never sees a generic error: their in-progress form (minus any
    // picked-but-not-yet-uploaded files) is preserved in sessionStorage,
    // and they're sent to verify with registration-intent copy, returning
    // to this exact category page afterward.
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setIsSaving(false);
      saveRegistrationDraft(category.slug, buildStoredDraft(values));
      router.push(`/auth?mode=register&next=${encodeURIComponent(`/register/${category.slug}`)}`);
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
      if (field.type === "file" || field.type === "photo") {
        if (value instanceof File) {
          // A "photo" field goes to the shared public profile-photos
          // bucket (same one used by Athlete Profile Setup); every other
          // "file" field keeps going to the private role-registration
          // bucket -- never mixed, since only the former is ever meant to
          // be publicly viewable.
          const uploadResult =
            field.type === "photo"
              ? await uploadProfilePhoto(supabase, { userId, file: value })
              : await uploadRoleRegistrationDocument(supabase, {
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
    clearRegistrationDraft(category.slug);
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

    if (field.type === "photo") {
      return (
        <Controller
          key={field.id}
          name={field.id}
          control={control}
          rules={{
            validate: (value) => {
              if (field.required && !value) return t("registerHub.validation.required");
              if (value instanceof File) {
                const result = validateProfilePhoto(value);
                return result === true ? true : result;
              }
              return true;
            },
          }}
          render={({ field: rhfField, fieldState }) => (
            <PhotoFieldPreview
              id={field.id}
              label={label}
              optional={!field.required}
              error={fieldState.error?.message}
              value={rhfField.value instanceof File || typeof rhfField.value === "string" ? rhfField.value : null}
              onFileSelected={(file) => rhfField.onChange(file)}
              onRemoveExisting={() => rhfField.onChange(null)}
            />
          )}
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
          exploreCommunityLabel={t("register.success.exploreCommunity")}
        />
      )}
      <SectionCard title={t("registerHub.formDetailsTitle")}>
        {restoreNotice && (
          <div
            role="status"
            className={cn(
              "rounded-xl border p-4 text-sm",
              restoreNotice.warning
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-green-200 bg-green-50 text-green-700",
            )}
          >
            {restoreNotice.message}
          </div>
        )}
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

interface PhotoFieldPreviewProps {
  id: string;
  label: string;
  optional: boolean;
  error?: string;
  /** A freshly picked File, an already-uploaded Storage path, or null. */
  value: File | string | null;
  onFileSelected: (file: File | null) => void;
  onRemoveExisting: () => void;
}

// Resolves a react-hook-form "photo" field's raw File|string|null value
// into a ready-to-render preview URL for ProfilePhotoField -- a fresh File
// gets a local object URL (created/revoked here, never leaked across
// renders); an already-uploaded path gets the shared public bucket's URL
// via buildProfilePhotoUrl. Isolated into its own component (rather than
// inline in renderField) so this object-URL lifecycle has a stable place
// to hook into useEffect's cleanup.
function PhotoFieldPreview({
  id,
  label,
  optional,
  error,
  value,
  onFileSelected,
  onRemoveExisting,
}: PhotoFieldPreviewProps) {
  // Derived during render (not via setState-in-effect) -- a plain function
  // of `value`, so useMemo is the right tool; a separate effect below only
  // ever runs for its cleanup (revoking the previous object URL), never to
  // set state itself.
  const objectUrl = useMemo(
    () => (value instanceof File ? URL.createObjectURL(value) : null),
    [value],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl = value instanceof File ? objectUrl : buildProfilePhotoUrl(value);

  return (
    <ProfilePhotoField
      id={id}
      label={label}
      optional={optional}
      error={error}
      previewUrl={previewUrl}
      onFileSelected={onFileSelected}
      onRemoveExisting={typeof value === "string" ? onRemoveExisting : undefined}
    />
  );
}
