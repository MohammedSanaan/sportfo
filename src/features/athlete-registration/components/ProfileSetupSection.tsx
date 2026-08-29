"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProfilePhotoField } from "@/components/ui/ProfilePhotoField";
import { validateProfilePhoto } from "@/lib/file-validation";
import { buildProfilePhotoUrl } from "@/lib/storage/profile-photo";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";

const BIO_MAX_LENGTH = 500;

function validateOptionalUrl(value: string | undefined, message: string): true | string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return message;
  }
}

export function ProfileSetupSection() {
  const { t } = useTranslation();
  const { register, control, setValue } = useFormContext<AthleteRegistrationFormValues>();

  const photoPath = useWatch({ control, name: "profileSetup.photoPath" });
  const shortBio = useWatch({ control, name: "profileSetup.shortBio" }) ?? "";

  return (
    <SectionCard title={t("register.profile.title")} description={t("register.profile.description")}>
      <div className="flex flex-col gap-6">
        <Controller
          name="profileSetup.photo"
          control={control}
          rules={{
            validate: (value) => {
              if (value instanceof File) {
                const result = validateProfilePhoto(value);
                return result === true ? true : result;
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <PhotoPreview
              file={field.value}
              photoPath={photoPath}
              label={t("register.profile.photo")}
              error={fieldState.error?.message}
              onFileSelected={(file) => field.onChange(file)}
              onRemoveExisting={() => {
                field.onChange(null);
                setValue("profileSetup.photoPath", null, { shouldDirty: true });
              }}
            />
          )}
        />

        <Textarea
          id="shortBio"
          label={t("register.profile.shortBio")}
          optional
          rows={4}
          maxLength={BIO_MAX_LENGTH}
          helperText={t("register.profile.shortBioCharCount", {
            count: shortBio.length,
            max: BIO_MAX_LENGTH,
          })}
          placeholder={t("register.profile.shortBioPlaceholder")}
          {...register("profileSetup.shortBio", {
            maxLength: {
              value: BIO_MAX_LENGTH,
              message: t("register.profile.shortBioTooLong", { max: BIO_MAX_LENGTH }),
            },
          })}
        />

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <Input
            id="instagramUrl"
            type="url"
            label={t("register.profile.instagramUrl")}
            optional
            placeholder="https://instagram.com/yourhandle"
            {...register("profileSetup.instagramUrl", {
              validate: (value) => validateOptionalUrl(value, t("registerHub.validation.invalidUrl")),
            })}
          />
          <Input
            id="facebookUrl"
            type="url"
            label={t("register.profile.facebookUrl")}
            optional
            placeholder="https://facebook.com/yourprofile"
            {...register("profileSetup.facebookUrl", {
              validate: (value) => validateOptionalUrl(value, t("registerHub.validation.invalidUrl")),
            })}
          />
          <Input
            id="otherUrl"
            type="url"
            label={t("register.profile.otherUrl")}
            optional
            placeholder="https://"
            {...register("profileSetup.otherUrl", {
              validate: (value) => validateOptionalUrl(value, t("registerHub.validation.invalidUrl")),
            })}
          />
        </div>
      </div>
    </SectionCard>
  );
}

interface PhotoPreviewProps {
  file: File | null;
  photoPath: string | null | undefined;
  label: string;
  error?: string;
  onFileSelected: (file: File | null) => void;
  onRemoveExisting: () => void;
}

// Same object-URL-lifecycle pattern as GenericCategoryForm's
// PhotoFieldPreview (see src/features/registration-hub/components/
// GenericCategoryForm.tsx) -- kept as a separate copy rather than a shared
// export because the two call sites bind to differently-shaped form values
// (Athlete splits File/path into two RHF fields; the generic hub form
// merges them into one).
function PhotoPreview({ file, photoPath, label, error, onFileSelected, onRemoveExisting }: PhotoPreviewProps) {
  // Derived during render (not via setState-in-effect) -- a plain function
  // of `file`, so useMemo is the right tool; a separate effect below only
  // ever runs for its cleanup (revoking the previous object URL), never to
  // set state itself.
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl = file ? objectUrl : buildProfilePhotoUrl(photoPath);

  return (
    <ProfilePhotoField
      id="profilePhoto"
      label={label}
      error={error}
      previewUrl={previewUrl}
      onFileSelected={onFileSelected}
      onRemoveExisting={photoPath ? onRemoveExisting : undefined}
    />
  );
}
