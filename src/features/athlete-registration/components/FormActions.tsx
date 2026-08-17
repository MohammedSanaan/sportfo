import { Button } from "@/components/ui/Button";

interface FormActionsProps {
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

export function FormActions({ onSaveDraft, isSubmitting }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={onSaveDraft}
        disabled={isSubmitting}
      >
        Save Draft
      </Button>
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Creating profile..." : "Create Athlete Profile"}
      </Button>
    </div>
  );
}
