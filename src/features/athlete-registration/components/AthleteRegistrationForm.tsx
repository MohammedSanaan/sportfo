"use client";

import { useState } from "react";
import { FormProvider, useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import type { Achievement, AthleteRegistrationFormValues } from "@/types/athlete";
import { buildEmptyFormValues } from "@/lib/athlete/registration-draft";
import { isBlankAchievement } from "@/lib/athlete/achievement-helpers";
import { createClient } from "@/lib/supabase/client";
import { validateAchievementDocument } from "@/lib/file-validation";
import {
  deleteAchievementDocumentObject,
  uploadAchievementDocument,
} from "@/lib/storage/achievement-documents";
import type { DocumentOperationsByField } from "../document-operations";
import {
  createAthleteProfile,
  getAchievementDocumentSignedUrl,
  saveAthleteDraft,
  setAchievementDocumentPath,
  type SaveRegistrationResult,
} from "../actions";
import { AchievementsSection } from "./AchievementsSection";
import { AdditionalRecognitionSection } from "./AdditionalRecognitionSection";
import { FormActions } from "./FormActions";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { RegistrationSuccess } from "./RegistrationSuccess";
import { SportsInformationSection } from "./SportsInformationSection";
import { useTranslation } from "@/i18n/LocaleProvider";

interface AthleteRegistrationFormProps {
  authPhone: string;
  initialValues?: AthleteRegistrationFormValues;
}

type Banner = { kind: "success" | "warning" | "error"; message: string };

export function AthleteRegistrationForm({
  authPhone,
  initialValues,
}: AthleteRegistrationFormProps) {
  const { t } = useTranslation();
  const [supabase] = useState(() => createClient());

  const methods = useForm<AthleteRegistrationFormValues>({
    defaultValues: initialValues ?? buildEmptyFormValues(authPhone),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;

  // Read-only subscription to the same field array AchievementsSection owns
  // (mutated only there via append/remove) -- this is just so document
  // operation state can be keyed by RHF's stable per-row id instead of
  // array index, which would drift as rows are added/removed.
  const { fields } = useFieldArray({ control, name: "achievements" });

  const [docOpsByField, setDocOpsByField] = useState<DocumentOperationsByField>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftPhaseLabel, setDraftPhaseLabel] = useState<string>();
  const [submitPhaseLabel, setSubmitPhaseLabel] = useState<string>();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  function setDocOp(fieldId: string, state: DocumentOperationsByField[string] | undefined) {
    setDocOpsByField((prev) => {
      const next = { ...prev };
      if (state === undefined || (!state.kind && !state.error)) delete next[fieldId];
      else next[fieldId] = state;
      return next;
    });
  }

  // Shared by the immediate (existing achievement, picked from the file
  // input) and deferred (brand-new achievement, uploaded right after it
  // gets a real id from Save Draft/Create Profile) paths -- both just need
  // an achievement id, a file, and the row's previous document path.
  async function uploadAndPersist(params: {
    fieldId: string;
    index: number;
    achievementId: string;
    file: File;
    previousPath: string | null | undefined;
  }): Promise<boolean> {
    const { fieldId, index, achievementId, file, previousPath } = params;
    setDocOp(fieldId, { kind: previousPath ? "replacing" : "uploading" });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setDocOp(fieldId, { error: "Your session has expired. Please sign in again." });
      return false;
    }

    const uploadResult = await uploadAchievementDocument(supabase, {
      userId: userData.user.id,
      achievementId,
      file,
    });
    if (!uploadResult.ok || !uploadResult.path) {
      setDocOp(fieldId, { error: uploadResult.error ?? t("register.uploadFailed") });
      return false;
    }

    const pathResult = await setAchievementDocumentPath(achievementId, uploadResult.path);
    if (!pathResult.ok) {
      // The file made it to Storage but we couldn't record it -- clean up
      // the orphaned upload rather than leaving it dangling and unreferenced.
      await deleteAchievementDocumentObject(supabase, uploadResult.path);
      setDocOp(fieldId, { error: pathResult.error });
      return false;
    }

    if (previousPath && previousPath !== uploadResult.path) {
      // Old file is only removed after the replacement is fully persisted.
      await deleteAchievementDocumentObject(supabase, previousPath);
    }

    setValue(`achievements.${index}.documentPath`, uploadResult.path);
    setValue(`achievements.${index}.document`, null);
    setDocOp(fieldId, undefined);
    return true;
  }

  function handleFileSelected(fieldId: string, index: number, file: File | null) {
    if (file === null) {
      setValue(`achievements.${index}.document`, null);
      setDocOp(fieldId, undefined);
      return;
    }

    const validation = validateAchievementDocument(file);
    if (validation !== true) {
      setDocOp(fieldId, { error: validation });
      return;
    }

    const achievement = getValues(`achievements.${index}`);

    if (achievement.id) {
      // Already a real database row -- upload right away rather than
      // waiting for the next Save Draft/Create Profile.
      void uploadAndPersist({
        fieldId,
        index,
        achievementId: achievement.id,
        file,
        previousPath: achievement.documentPath,
      });
      return;
    }

    // Brand-new, unsaved achievement -- no id to upload against yet.
    // Deferred until this row is persisted (see persistAndSync below).
    setDocOp(fieldId, undefined);
    setValue(`achievements.${index}.document`, file);
  }

  async function handleViewDocument(fieldId: string, index: number) {
    const achievement = getValues(`achievements.${index}`);
    if (!achievement.id) return;

    setDocOp(fieldId, { kind: "viewing" });
    const result = await getAchievementDocumentSignedUrl(achievement.id);
    setDocOp(fieldId, result.ok ? undefined : { error: result.error });

    if (result.ok) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleRemoveDocument(fieldId: string, index: number) {
    const achievement = getValues(`achievements.${index}`);
    if (!achievement.id || !achievement.documentPath) return;

    setDocOp(fieldId, { kind: "removing" });

    const deleteResult = await deleteAchievementDocumentObject(
      supabase,
      achievement.documentPath,
    );
    if (!deleteResult.ok) {
      setDocOp(fieldId, { error: deleteResult.error });
      return;
    }

    const pathResult = await setAchievementDocumentPath(achievement.id, null);
    if (!pathResult.ok) {
      setDocOp(fieldId, { error: t("register.documentRemovedButSyncFailed") });
      return;
    }

    setValue(`achievements.${index}.documentPath`, null);
    setDocOp(fieldId, undefined);
  }

  // Shared by Save Draft and Create Athlete Profile: persist via the
  // atomic Step 5 RPC, merge real ids/document paths back without
  // disturbing untouched blank cards, clean up storage for achievements
  // the save just removed, then upload any newly-picked files that were
  // waiting on a real id. Returns whether every required step succeeded.
  async function persistAndSync(
    action: (values: AthleteRegistrationFormValues) => Promise<SaveRegistrationResult>,
    setPhaseLabel: (label: string | undefined) => void,
  ): Promise<{ ok: boolean; uploadFailures: number }> {
    const values = getValues();
    const beforeAchievements = values.achievements;

    const persistableIndices: number[] = [];
    beforeAchievements.forEach((a, i) => {
      if (!isBlankAchievement(a)) persistableIndices.push(i);
    });

    const payload: AthleteRegistrationFormValues = {
      ...values,
      achievements: persistableIndices.map((i) => ({
        ...beforeAchievements[i],
        document: null, // never send the raw File over the wire
      })),
    };

    const result = await action(payload);
    if (!result.ok) {
      setBanner({ kind: "error", message: result.error });
      return { ok: false, uploadFailures: 0 };
    }

    const merged = [...beforeAchievements];
    persistableIndices.forEach((originalIndex, sentIndex) => {
      const serverRow = result.achievements[sentIndex];
      if (!serverRow) return;
      merged[originalIndex] = {
        ...merged[originalIndex],
        id: serverRow.id,
        documentPath: serverRow.documentPath ?? merged[originalIndex].documentPath ?? null,
      };
    });

    // Anything that had a real id before this save but isn't in the
    // server's response anymore was deleted by the sync -- clean up its
    // document, if it had one, so it doesn't become an orphaned object.
    const survivingIds = new Set(result.achievements.map((a) => a.id));
    const removed = beforeAchievements.filter((a) => a.id && !survivingIds.has(a.id));
    await Promise.all(
      removed
        .filter((a): a is Achievement & { documentPath: string } => Boolean(a.documentPath))
        .map((a) => deleteAchievementDocumentObject(supabase, a.documentPath)),
    );

    setValue("achievements", merged);

    // Achievements that just received a real id for the first time and are
    // still holding a locally-picked, not-yet-uploaded file.
    const pending = persistableIndices
      .map((originalIndex) => ({ originalIndex, achievement: merged[originalIndex] }))
      .filter(({ achievement }) => achievement.document && achievement.id);

    let uploadFailures = 0;
    if (pending.length > 0) {
      setPhaseLabel(t("register.actions.uploadingDocuments"));
      const outcomes = await Promise.all(
        pending.map(({ originalIndex, achievement }) =>
          uploadAndPersist({
            fieldId: fields[originalIndex]?.id ?? String(originalIndex),
            index: originalIndex,
            achievementId: achievement.id as string,
            file: achievement.document as File,
            previousPath: achievement.documentPath,
          }),
        ),
      );
      uploadFailures = outcomes.filter((ok) => !ok).length;
      setPhaseLabel(undefined);
    }

    return { ok: true, uploadFailures };
  }

  async function handleSaveDraft() {
    if (isSavingDraft || isSubmitting) return;

    setIsSavingDraft(true);
    setBanner(null);

    const { ok, uploadFailures } = await persistAndSync(saveAthleteDraft, setDraftPhaseLabel);
    setIsSavingDraft(false);

    if (!ok) return;

    setBanner(
      uploadFailures > 0
        ? {
            kind: "warning",
            message: t("register.banners.draftSavedWithFailures", {
              n: uploadFailures,
              plural: uploadFailures > 1 ? "s" : "",
            }),
          }
        : { kind: "success", message: t("register.banners.draftSaved") },
    );
  }

  const handleCreateProfile: SubmitHandler<AthleteRegistrationFormValues> = async () => {
    setBanner(null);

    const { ok, uploadFailures } = await persistAndSync(
      createAthleteProfile,
      setSubmitPhaseLabel,
    );
    if (!ok) return;

    if (uploadFailures > 0) {
      // The registration itself is saved and submitted -- only the optional
      // document upload didn't finish. Stay on the form so the athlete can
      // retry rather than hiding that behind a success screen.
      setBanner({
        kind: "warning",
        message: t("register.banners.createdWithFailures", {
          n: uploadFailures,
          plural: uploadFailures > 1 ? "s" : "",
        }),
      });
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
                : banner.kind === "warning"
                  ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            }
          >
            {banner.message}
          </div>
        )}

        <div id="section-personal" className="scroll-mt-24">
          <PersonalDetailsSection />
        </div>
        <div id="section-sport" className="scroll-mt-24">
          <SportsInformationSection />
        </div>
        <div id="section-achievements" className="scroll-mt-24">
          <AchievementsSection
            docOpsByField={docOpsByField}
            onFileSelected={handleFileSelected}
            onViewDocument={handleViewDocument}
            onRemoveDocument={handleRemoveDocument}
          />
        </div>
        <AdditionalRecognitionSection />
        <div id="section-review" className="scroll-mt-24">
          <FormActions
            onSaveDraft={handleSaveDraft}
            isSavingDraft={isSavingDraft}
            isSubmitting={isSubmitting}
            draftLabel={draftPhaseLabel ?? t("register.actions.savingDraft")}
            submitLabel={submitPhaseLabel ?? t("register.actions.creatingProfile")}
          />
        </div>
      </form>
    </FormProvider>
  );
}
