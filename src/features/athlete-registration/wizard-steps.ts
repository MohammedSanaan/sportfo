import type { AthleteRegistrationFormValues } from "@/types/athlete";

// Single source of truth for the Athlete registration wizard's steps --
// AthleteRegistrationForm (rendering + Back/Continue/validation gating) and
// RegistrationWizardStepper (the visual 1-2-3-4-5 nav) both read this same
// list, so the two can never drift out of sync with each other.
export interface WizardStep {
  id: string;
  /** i18n key under register.wizard for this step's short label. */
  labelKey: string;
  /** DOM ids (from AthleteRegistrationForm's per-section wrapper divs) this
   * step renders -- used only to resolve an incoming #section-x deep link
   * (e.g. from ProfileStrengthCard) to the step that contains it. */
  sectionIds: string[];
  /** Top-level AthleteRegistrationFormValues keys this step owns -- passed
   * to react-hook-form's trigger() before allowing Continue, so a step
   * can never be left with an invalid required field. Empty for steps
   * with no fields of their own (Review). */
  fieldGroups: (keyof AthleteRegistrationFormValues)[];
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "personal",
    labelKey: "register.wizard.stepPersonal",
    sectionIds: ["section-personal"],
    fieldGroups: ["personalDetails"],
  },
  {
    id: "sport",
    labelKey: "register.wizard.stepSportAchievements",
    sectionIds: ["section-sport", "section-achievements"],
    fieldGroups: ["sportsInformation", "achievements", "additionalRecognition"],
  },
  {
    id: "background",
    labelKey: "register.wizard.stepBackground",
    sectionIds: ["section-employment", "section-apparel"],
    fieldGroups: ["employment", "apparelLogistics"],
  },
  {
    id: "profile",
    labelKey: "register.wizard.stepProfileVerify",
    sectionIds: ["section-profile", "section-verify"],
    fieldGroups: ["profileSetup"],
  },
  {
    id: "review",
    labelKey: "register.wizard.stepReview",
    sectionIds: ["section-review"],
    fieldGroups: [],
  },
];

// Resolves an incoming URL hash (e.g. from a ProfileStrengthCard link
// landing on /athlete/register#section-achievements) to the step index that
// actually renders it -- so a deep link still works now that steps are
// gated instead of every section always being mounted. Returns null for an
// unrecognized/absent hash.
export function findStepIndexForSectionId(sectionId: string): number | null {
  const index = WIZARD_STEPS.findIndex((step) => step.sectionIds.includes(sectionId));
  return index === -1 ? null : index;
}
