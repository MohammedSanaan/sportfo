import { Button } from "@/components/ui/Button";

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
  const busy = isSavingDraft || isSubmitting;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={onSaveDraft}
        disabled={busy}
      >
        {isSavingDraft ? (draftLabel ?? "Saving draft...") : "Save Draft"}
      </Button>
      <Button type="submit" variant="primary" disabled={busy}>
        {isSubmitting ? (submitLabel ?? "Creating profile...") : "Create Athlete Profile"}
      </Button>
    </div>
  );
}
