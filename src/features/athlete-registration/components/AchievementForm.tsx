"use client";

import { useWatch, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ACHIEVEMENT_TYPES } from "@/lib/athlete-options";
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_SIZE_LABEL,
} from "@/lib/file-validation";
import { displayFilenameFromPath } from "@/lib/storage/achievement-documents";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import type { DocumentOperationState } from "../document-operations";

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
  const { register, control } = useFormContext<AthleteRegistrationFormValues>();

  const documentPath = useWatch({ control, name: `achievements.${index}.documentPath` });
  const pendingFile = useWatch({ control, name: `achievements.${index}.document` });

  const idPrefix = `achievement-${index}`;
  const busy = docOp?.kind;
  const busyLabel =
    busy === "uploading"
      ? "Uploading document..."
      : busy === "replacing"
        ? "Replacing document..."
        : busy === "removing"
          ? "Removing document..."
          : busy === "viewing"
            ? "Opening document..."
            : undefined;

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
                  View
                </button>
                <label
                  htmlFor={`${idPrefix}-document`}
                  className="cursor-pointer text-brand-700 hover:text-brand-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                  aria-disabled={Boolean(busy)}
                >
                  Replace
                </label>
                <button
                  type="button"
                  onClick={onRemoveDocument}
                  disabled={Boolean(busy)}
                  className="text-ink-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : pendingFile ? (
            <div className="flex items-center justify-between rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-ink-700">
              <span className="truncate">
                {pendingFile.name}{" "}
                <span className="text-xs text-ink-400">
                  · will upload when you save
                </span>
              </span>
              <button
                type="button"
                onClick={() => onFileSelected(null)}
                disabled={Boolean(busy)}
                className="ml-3 shrink-0 text-xs font-medium text-ink-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove file
              </button>
            </div>
          ) : (
            <label
              htmlFor={`${idPrefix}-document`}
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-surface px-4 py-6 text-center transition-colors hover:border-brand-400 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              aria-disabled={Boolean(busy)}
            >
              <span className="text-sm font-medium text-brand-700">
                Choose a file to attach
              </span>
              <span className="text-xs text-ink-400">
                PDF, JPG or PNG · Up to {MAX_DOCUMENT_SIZE_LABEL}
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
      </div>
    </div>
  );
}
