"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";

interface FormActionsProps {
  onSaveDraft: () => void;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  draftLabel?: string;
  submitLabel?: string;
}

export function FormActions({
  onSaveDraft,
  isSavingDraft,
  isSubmitting,
  draftLabel,
  submitLabel,
}: FormActionsProps) {
  const { t } = useTranslation();
  const busy = isSavingDraft || isSubmitting;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={onSaveDraft} disabled={busy}>
        {isSavingDraft ? (draftLabel ?? t("register.actions.savingDraft")) : t("register.actions.saveDraft")}
      </Button>
      <Button type="submit" variant="primary" disabled={busy}>
        {isSubmitting ? (submitLabel ?? t("register.actions.creatingProfile")) : t("register.actions.createProfile")}
      </Button>
    </div>
  );
}
