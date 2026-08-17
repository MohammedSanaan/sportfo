"use client";

import { useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import type { Achievement, AthleteRegistrationFormValues } from "@/types/athlete";
import { buildEmptyFormValues } from "@/lib/athlete/registration-draft";
import { createAthleteProfile, saveAthleteDraft } from "../actions";
import { AchievementsSection } from "./AchievementsSection";
import { AdditionalRecognitionSection } from "./AdditionalRecognitionSection";
import { FormActions } from "./FormActions";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { RegistrationSuccess } from "./RegistrationSuccess";
import { SportsInformationSection } from "./SportsInformationSection";

interface AthleteRegistrationFormProps {
  authPhone: string;
  initialValues?: AthleteRegistrationFormValues;
}

type Banner = { kind: "success" | "error"; message: string };

// Sent to the server actions instead of the live field array so a large
// picked file never crosses the wire just to be discarded -- real uploads
// are the next milestone (see Achievement.document's doc comment).
function withoutDocuments(achievements: Achievement[]): Achievement[] {
  return achievements.map((achievement) => ({ ...achievement, document: null }));
}

export function AthleteRegistrationForm({
  authPhone,
  initialValues,
}: AthleteRegistrationFormProps) {
  const methods = useForm<AthleteRegistrationFormValues>({
    defaultValues: initialValues ?? buildEmptyFormValues(authPhone),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSaveDraft() {
    if (isSavingDraft || isSubmitting) return;

    setIsSavingDraft(true);
    setBanner(null);

    const values = getValues();
    const payload: AthleteRegistrationFormValues = {
      ...values,
      achievements: withoutDocuments(values.achievements),
    };

    const result = await saveAthleteDraft(payload);
    setIsSavingDraft(false);

    if (!result.ok) {
      setBanner({ kind: "error", message: result.error });
      return;
    }

    // Zip the server's ids back onto the achievements we sent (same order,
    // guaranteed by the RPC) so the next save updates these rows instead of
    // inserting duplicates. The current in-progress `document` selections
    // are preserved from the snapshot we sent, not re-read live, to avoid
    // clobbering an edit made while the request was in flight.
    setValue(
      "achievements",
      payload.achievements.map((achievement, index) => ({
        ...achievement,
        id: result.achievements[index]?.id,
      })),
    );
    setBanner({ kind: "success", message: "Draft saved." });
  }

  const handleCreateProfile: SubmitHandler<AthleteRegistrationFormValues> = async (
    values,
  ) => {
    setBanner(null);

    const payload: AthleteRegistrationFormValues = {
      ...values,
      achievements: withoutDocuments(values.achievements),
    };

    const result = await createAthleteProfile(payload);

    if (!result.ok) {
      setBanner({ kind: "error", message: result.error });
      return;
    }

    setIsRegistered(true);
  };

  if (isRegistered) {
    return <RegistrationSuccess />;
  }

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={handleSubmit(handleCreateProfile)}
        className="flex flex-col gap-6"
      >
        {banner && (
          <div
            role={banner.kind === "error" ? "alert" : "status"}
            className={
              banner.kind === "error"
                ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            }
          >
            {banner.message}
          </div>
        )}

        <PersonalDetailsSection />
        <SportsInformationSection />
        <AchievementsSection />
        <AdditionalRecognitionSection />
        <FormActions
          onSaveDraft={handleSaveDraft}
          isSavingDraft={isSavingDraft}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
