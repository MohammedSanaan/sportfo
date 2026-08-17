"use client";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { AchievementsSection } from "./AchievementsSection";
import { AdditionalRecognitionSection } from "./AdditionalRecognitionSection";
import { FormActions } from "./FormActions";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { SportsInformationSection } from "./SportsInformationSection";

const defaultValues: AthleteRegistrationFormValues = {
  personalDetails: {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    country: "",
    city: "",
    mobileNumber: "",
    email: "",
    school: "",
    club: "",
    coachName: "",
  },
  sportsInformation: {
    primarySport: "",
    discipline: "",
    position: "",
    skillLevel: "",
  },
  achievements: [],
  additionalRecognition: {
    awards: "",
    scholarshipRecipient: "",
  },
};

export function AthleteRegistrationForm() {
  const methods = useForm<AthleteRegistrationFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  // Supabase persistence lands in the next milestone. This is the single
  // integration point the real submission call will replace.
  const handleCreateProfile: SubmitHandler<AthleteRegistrationFormValues> = async (
    data,
  ) => {
    console.log("Athlete registration payload ready for submission:", data);
  };

  const handleSaveDraft = () => {
    const draftValues = getValues();
    console.log("Draft prepared (not yet persisted):", draftValues);
  };

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={handleSubmit(handleCreateProfile)}
        className="flex flex-col gap-6"
      >
        <PersonalDetailsSection />
        <SportsInformationSection />
        <AchievementsSection />
        <AdditionalRecognitionSection />
        <FormActions onSaveDraft={handleSaveDraft} isSubmitting={isSubmitting} />
      </form>
    </FormProvider>
  );
}
