"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import type { Achievement, AthleteRegistrationFormValues } from "@/types/athlete";
import type { DocumentOperationsByField } from "../document-operations";
import { AchievementForm } from "./AchievementForm";

function createEmptyAchievement(): Achievement {
  return {
    title: "",
    type: "",
    organization: "",
    date: "",
    description: "",
    document: null,
    documentPath: null,
  };
}

interface AchievementsSectionProps {
  docOpsByField: DocumentOperationsByField;
  onFileSelected: (fieldId: string, index: number, file: File | null) => void;
  onViewDocument: (fieldId: string, index: number) => void;
  onRemoveDocument: (fieldId: string, index: number) => void;
}

export function AchievementsSection({
  docOpsByField,
  onFileSelected,
  onViewDocument,
  onRemoveDocument,
}: AchievementsSectionProps) {
  const { control } = useFormContext<AthleteRegistrationFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "achievements",
  });

  return (
    <SectionCard
      title="Achievements & Certificates"
      description="Add medals, awards, and certifications that showcase your journey."
    >
      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          No achievements added yet.
        </p>
      )}

      {fields.length > 0 && (
        <div className="flex flex-col gap-5">
          {fields.map((field, index) => (
            <AchievementForm
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              docOp={docOpsByField[field.id]}
              onFileSelected={(file) => onFileSelected(field.id, index, file)}
              onViewDocument={() => onViewDocument(field.id, index)}
              onRemoveDocument={() => onRemoveDocument(field.id, index)}
            />
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        onClick={() => append(createEmptyAchievement())}
        className="self-start"
      >
        + Add Achievement
      </Button>
    </SectionCard>
  );
}
