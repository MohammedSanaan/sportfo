import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
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

  // Athlete's own screen re-verifies auth itself (see
  // AthleteRegistrationScreen); the other 7 categories share this one gate
  // since they have no independent auth-checking entry point of their own.
  let initialFields: Record<string, unknown> | undefined;
  if (category.id !== "athlete") {
    const user = await getAuthUser();
    if (!user) {
      redirect(`/auth?next=${encodeURIComponent(`/register/${category.slug}`)}`);
    }

    // Pre-fill with whatever this account already submitted for this
    // category, same idea as loadAthleteDraft for the Athlete flow. A
    // missing/failed lookup just renders a blank form -- never blocks it.
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_own_role_registration", {
      p_registration_type: category.registrationType,
    });
    if (data && typeof data === "object" && "fields" in data) {
      initialFields = (data as { fields?: Record<string, unknown> }).fields;
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          {t("registerHub.pageTitle")}
        </h1>
        <p className="text-base text-ink-500">{t("registerHub.pageSubtitle")}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <RegistrationCategoryNav activeCategoryId={category.id} locale={locale} />

        <div className="min-w-0 flex-1">
          <h2 className="mb-5 text-xl font-bold text-ink-900 sm:text-2xl">{formTitle}</h2>
          {category.id === "athlete" ? (
            <AthleteRegistrationScreen reloadHref="/register/athlete" showHeading={false} />
          ) : (
            <GenericCategoryForm category={category} initialFields={initialFields} />
          )}
        </div>
      </div>
    </Container>
  );
}
