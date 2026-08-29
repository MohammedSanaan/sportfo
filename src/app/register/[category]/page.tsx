import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegistrationHero } from "@/components/ui/RegistrationHero";
import { RegistrationShell } from "@/components/ui/RegistrationShell";
import { RegistrationCategoryNav } from "@/features/registration-hub/components/RegistrationCategoryNav";
import { GenericCategoryForm } from "@/features/registration-hub/components/GenericCategoryForm";
import { AthleteRegistrationScreen } from "@/features/athlete-registration/components/AthleteRegistrationScreen";
import {
  REGISTRATION_CATEGORIES,
  getRegistrationCategoryBySlug,
} from "@/lib/registration/categories";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/i18n/server";
import { translate } from "@/i18n/dictionary";
import { DEFAULT_LOCALE } from "@/i18n/config";

interface RegisterCategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return REGISTRATION_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: RegisterCategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getRegistrationCategoryBySlug(slug);
  if (!category) {
    return { title: "Category Not Found | SportFo" };
  }
  const formTitle = translate(DEFAULT_LOCALE, `registerHub.categories.${category.id}.formTitle`);
  return { title: `${formTitle} | SportFo` };
}

export default async function RegisterCategoryPage({ params }: RegisterCategoryPageProps) {
  const { category: slug } = await params;
  const category = getRegistrationCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { t, locale } = await getServerTranslations();
  const formTitle = t(`registerHub.categories.${category.id}.formTitle`);

  // Registration pages are public-to-view, auth-required-only-at-submit
  // (see GenericCategoryForm/AthleteRegistrationScreen, which check auth
  // themselves at Save/Submit and redirect to /auth?mode=register&next=
  // with the in-progress form preserved) -- so a guest here just gets a
  // blank form, never bounced to /auth for merely opening the page.
  // Athlete's own screen re-verifies/loads its own draft (see
  // AthleteRegistrationScreen); the other 7 categories share this one
  // authenticated-only prefill lookup since they have no independent entry
  // point of their own.
  let initialFields: Record<string, unknown> | undefined;
  let initialStatus: string | undefined;
  if (category.id !== "athlete") {
    const user = await getAuthUser();
    if (user) {
      // Pre-fill with whatever this account already submitted for this
      // category, same idea as loadAthleteDraft for the Athlete flow. A
      // missing/failed lookup just renders a blank form -- never blocks it.
      // `status` (draft vs. submitted) also drives the "you're already
      // registered" notice below -- a duplicate submission is already
      // impossible at the database level (save_role_registration upserts
      // on the (user_id, registration_type) unique constraint), this is
      // purely about not presenting an already-registered visitor with
      // what looks like a first-time blank form.
      const supabase = await createClient();
      const { data } = await supabase.rpc("get_own_role_registration", {
        p_registration_type: category.registrationType,
      });
      if (data && typeof data === "object") {
        const result = data as { fields?: Record<string, unknown>; status?: string };
        initialFields = result.fields;
        initialStatus = result.status;
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <RegistrationShell
        hero={
          <RegistrationHero
            title={formTitle}
            subtitle={t("registerHub.pageSubtitle")}
            imageSrc={category.heroImage}
          />
        }
      >
        {/* Two columns only: category nav (~280px, sticky on desktop) and
            the form at the remaining width -- no third info-sidebar
            column, so the form never gets squeezed. Falls back to a
            single stacked column (nav's own horizontal-scroll switcher on
            top, full-width form below) under the lg breakpoint. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <RegistrationCategoryNav activeCategoryId={category.id} locale={locale} />

          <div className="min-w-0">
            {category.id === "athlete" ? (
              <AthleteRegistrationScreen reloadHref="/register/athlete" showHeading={false} />
            ) : (
              <GenericCategoryForm
                category={category}
                initialFields={initialFields}
                initialStatus={initialStatus}
              />
            )}
          </div>
        </div>
      </RegistrationShell>
    </div>
  );
}
