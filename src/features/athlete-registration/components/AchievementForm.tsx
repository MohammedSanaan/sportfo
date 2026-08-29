"use client";

import { useWatch, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ACHIEVEMENT_TYPES, CERTIFICATE_LEVELS, ISSUING_ORGANIZATIONS } from "@/lib/athlete-options";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_SIZE_LABEL,
} from "@/lib/file-validation";
import { displayFilenameFromPath } from "@/lib/storage/achievement-documents";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import type { DocumentOperationState } from "../document-operations";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";

interface AchievementFormProps {
  index: number;
  onRemove: () => void;
  docOp: DocumentOperationState | undefined;
  onFileSelected: (file: File | null) => void;
  onViewDocument: () => void;
  onRemoveDocument: () => void;
}

export function AchievementForm({
  index,
  onRemove,
  docOp,
  onFileSelected,
  onViewDocument,
  onRemoveDocument,
}: AchievementFormProps) {
  const { t } = useTranslation();
  const { register, control } = useFormContext<AthleteRegistrationFormValues>();

  const documentPath = useWatch({ control, name: `achievements.${index}.documentPath` });
  const pendingFile = useWatch({ control, name: `achievements.${index}.document` });
  const achievementType = useWatch({ control, name: `achievements.${index}.type` });
  const issuingOrganization = useWatch({ control, name: `achievements.${index}.organization` });
  const verificationStatus = useWatch({ control, name: `achievements.${index}.verificationStatus` });
  const isOtherType = achievementType === "other";
  const isOtherOrganization = issuingOrganization === "other";

  const idPrefix = `achievement-${index}`;
  const busy = docOp?.kind;
  const busyLabel =
    busy === "uploading"
      ? t("register.achievements.uploading")
      : busy === "replacing"
        ? t("register.achievements.replacing")
        : busy === "removing"
          ? t("register.achievements.removing")
          : busy === "viewing"
            ? t("register.achievements.opening")
            : undefined;

  const issuingOrganizationOptions = translateOptions(
    t,
    "options.issuingOrganization",
    ISSUING_ORGANIZATIONS,
  );
  const achievementTypeOptions = translateOptions(t, "options.achievementType", ACHIEVEMENT_TYPES);
  const certificateLevelOptions = translateOptions(
    t,
    "options.certificateLevel",
    CERTIFICATE_LEVELS,
  );

  const verificationBadge = verificationStatus
    ? {
        pending: {
          label: t("register.achievements.verification.pending"),
          className: "border-amber-200 bg-amber-50 text-amber-700",
        },
        verified: {
          label: t("register.achievements.verification.verified"),
          className: "border-green-200 bg-green-50 text-green-700",
        },
        rejected: {
          label: t("register.achievements.verification.rejected"),
          className: "border-red-200 bg-red-50 text-red-700",
        },
      }[verificationStatus]
    : undefined;

  return (
    <div className="rounded-xl border border-border-default bg-surface-muted p-5 transition-colors hover:border-brand-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink-800">
          {t("register.achievements.achievementN", { n: index + 1 })}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-surface hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
        >
          {t("register.achievements.remove")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-title`}
          label={t("register.achievements.achievementTitle")}
          {...register(`achievements.${index}.title`)}
        />
        <Select
          id={`${idPrefix}-organization`}
          label={t("register.achievements.organization")}
          options={issuingOrganizationOptions}
          {...register(`achievements.${index}.organization`)}
        />
        {isOtherOrganization && (
          <div className="sm:col-span-2">
            <Input
              id={`${idPrefix}-organizationOther`}
              label={t("register.achievements.organizationOther")}
              placeholder={t("register.achievements.organizationOtherPlaceholder")}
              {...register(`achievements.${index}.organizationOther`, {
                required: t("register.achievements.organizationOtherRequired"),
              })}
            />
          </div>
        )}
        <Select
          id={`${idPrefix}-type`}
          label={t("register.achievements.achievementType")}
          options={achievementTypeOptions}
          {...register(`achievements.${index}.type`)}
        />
        {isOtherType && (
          <div className="sm:col-span-2">
            <Input
              id={`${idPrefix}-typeOther`}
              label={t("register.achievements.typeOther")}
              placeholder={t("register.achievements.typeOtherPlaceholder")}
              {...register(`achievements.${index}.typeOther`, {
                required: t("register.achievements.typeOtherRequired"),
              })}
            />
          </div>
        )}
        <Select
          id={`${idPrefix}-certificateLevel`}
          label={t("register.achievements.certificateLevel")}
          optional
          options={certificateLevelOptions}
          {...register(`achievements.${index}.certificateLevel`)}
        />
        <Input
          id={`${idPrefix}-date`}
          label={t("register.achievements.achievementDate")}
          type="date"
          {...register(`achievements.${index}.date`)}
        />
        <div className="sm:col-span-2">
          <Textarea
            id={`${idPrefix}-description`}
            label={t("register.achievements.description2")}
            optional
            rows={3}
            {...register(`achievements.${index}.description`)}
          />
        </div>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">
            {t("register.achievements.supportingDocument")}
          </span>

          {documentPath ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-border-default bg-surface px-3 py-2.5 text-sm text-ink-700">
              <span className="truncate">{displayFilenameFromPath(documentPath)}</span>
              <div className="flex shrink-0 items-center gap-3 text-xs font-medium">
                <button
                  type="button"
                  onClick={onViewDocument}
                  disabled={Boolean(busy)}
                  className="text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("register.achievements.view")}
                </button>
                <label
                  htmlFor={`${idPrefix}-document`}
                  className="cursor-pointer text-brand-700 hover:text-brand-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                  aria-disabled={Boolean(busy)}
                >
                  {t("register.achievements.replace")}
                </label>
                <button
                  type="button"
                  onClick={onRemoveDocument}
                  disabled={Boolean(busy)}
                  className="text-ink-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("register.achievements.removeDoc")}
                </button>
              </div>
            </div>
          ) : pendingFile ? (
            <div className="flex items-center justify-between rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-ink-700">
              <span className="truncate">
                {pendingFile.name}{" "}
                <span className="text-xs text-ink-400">
                  · {t("register.achievements.willUpload")}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onFileSelected(null)}
                disabled={Boolean(busy)}
                className="ml-3 shrink-0 text-xs font-medium text-ink-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("register.achievements.removeFile")}
              </button>
            </div>
          ) : (
            <label
              htmlFor={`${idPrefix}-document`}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong bg-surface px-4 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              aria-disabled={Boolean(busy)}
            >
              <span className="text-sm font-medium text-brand-700">
                {t("register.achievements.chooseFile")}
              </span>
              <span className="text-xs text-ink-400">
                {t("register.achievements.fileHint", { maxSize: MAX_DOCUMENT_SIZE_LABEL })}
              </span>
            </label>
          )}

          <input
            id={`${idPrefix}-document`}
            type="file"
            accept={ACCEPTED_DOCUMENT_EXTENSIONS.join(",")}
            className="sr-only"
            disabled={Boolean(busy)}
            aria-invalid={docOp?.error ? true : undefined}
            aria-describedby={docOp?.error ? `${idPrefix}-document-error` : undefined}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onFileSelected(file);
              e.target.value = "";
            }}
          />

          {busyLabel && (
            <p className="mt-1.5 text-xs text-ink-500">{busyLabel}</p>
          )}
          {docOp?.error && (
            <p
              id={`${idPrefix}-document-error`}
              role="alert"
              className="mt-1.5 text-xs text-red-600"
            >
              {docOp.error}
            </p>
          )}
        </div>

        {/* Read-only -- only an admin RPC can ever change this value, so
         * the athlete only ever sees a display badge here, never a
         * dropdown/checkbox for it (see admin_set_achievement_verification_status). */}
        {verificationBadge && (
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-ink-800">
              {t("register.achievements.verificationStatus")}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                verificationBadge.className,
              )}
            >
              {verificationBadge.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
