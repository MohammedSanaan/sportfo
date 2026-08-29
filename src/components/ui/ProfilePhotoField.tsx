"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { FieldShell } from "./FieldShell";
import { MAX_PHOTO_SIZE_LABEL } from "@/lib/file-validation";
import { useTranslation } from "@/i18n/LocaleProvider";

interface ProfilePhotoFieldProps {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
  optional?: boolean;
  /** A ready-to-render preview URL -- either an object URL for a freshly
   * picked File, or the public Storage URL for an already-uploaded photo.
   * Resolving which one that is (and revoking object URLs when done) is
   * the caller's job; this component only ever renders what it's given. */
  previewUrl: string | null;
  onFileSelected: (file: File | null) => void;
  /** Shown only when there's an existing uploaded photo (previewUrl set
   * and no file picked this session) -- lets the visitor remove it
   * without picking a replacement first. */
  onRemoveExisting?: () => void;
  disabled?: boolean;
}

// The one shared profile-photo/organization-logo upload control used by
// both the Athlete Profile Setup section and every one of the other 7
// registration categories (see GenericCategoryForm's "photo" field type) --
// never a second, unrelated upload implementation per category.
export function ProfilePhotoField({
  id,
  label,
  helperText,
  error,
  optional = true,
  previewUrl,
  onFileSelected,
  onRemoveExisting,
  disabled,
}: ProfilePhotoFieldProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      optional={optional}
      error={error}
      helperText={
        error ? undefined : (helperText ?? t("register.profile.photoHelper", { size: MAX_PHOTO_SIZE_LABEL }))
      }
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-surface-muted",
            error ? "border-red-400" : "border-border-default",
          )}
        >
          {previewUrl ? (
            /* A user-picked local File's object URL (and, for an already-uploaded photo, an external Supabase Storage URL) can't go through next/image's static/remote-pattern optimization. */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-7 w-7 text-ink-300">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4.5 19.5c1.4-3.2 4.3-5 7.5-5s6.1 1.8 7.5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center rounded-lg border border-border-default bg-surface px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {previewUrl ? t("register.profile.changePhoto") : t("register.profile.choosePhoto")}
          </button>
          {previewUrl && onRemoveExisting && (
            <button
              type="button"
              disabled={disabled}
              onClick={onRemoveExisting}
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-ink-500 transition-colors hover:bg-surface-muted hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("register.profile.removePhoto")}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </div>
    </FieldShell>
  );
}
