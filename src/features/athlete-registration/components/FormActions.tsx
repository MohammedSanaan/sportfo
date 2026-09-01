"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";

interface FormActionsProps {
  onSaveDraft: () => void;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  draftLabel?: string;
  submitLabel?: string;
  // Real submitted-profile state (see AthleteRegistrationScreen), never
  // guessed from the URL or which button was clicked -- drives the main
  // CTA's resting-state label only; Save Draft's own label never changes
  // between modes.
  isEditMode?: boolean;
}

export function FormActions({
  onSaveDraft,
  isSavingDraft,
  isSubmitting,
  draftLabel,
  submitLabel,
  isEditMode = false,
}: FormActionsProps) {
  const { t } = useTranslation();
  const busy = isSavingDraft || isSubmitting;
  const restingSubmitLabel = isEditMode
    ? t("register.actions.updateProfile")
    : t("register.actions.createProfile");
  const busySubmitLabel = isEditMode
    ? t("register.actions.updatingProfile")
    : t("register.actions.creatingProfile");

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={onSaveDraft} disabled={busy}>
        {isSavingDraft ? (draftLabel ?? t("register.actions.savingDraft")) : t("register.actions.saveDraft")}
      </Button>
      <Button type="submit" variant="primary" disabled={busy}>
        {isSubmitting ? (submitLabel ?? busySubmitLabel) : restingSubmitLabel}
      </Button>
    </div>
  );
}
