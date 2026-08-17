import { Button } from "@/components/ui/Button";

interface FormActionsProps {
  onSaveDraft: () => void;
  isSavingDraft: boolean;
  isSubmitting: boolean;
}

export function FormActions({
  onSaveDraft,
  isSavingDraft,
  isSubmitting,
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
        {isSavingDraft ? "Saving draft..." : "Save Draft"}
      </Button>
      <Button type="submit" variant="primary" disabled={busy}>
        {isSubmitting ? "Creating profile..." : "Create Athlete Profile"}
      </Button>
    </div>
  );
}
