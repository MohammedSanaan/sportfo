import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DEFAULT_REGISTRATION_CATEGORY_SLUG } from "@/lib/registration/categories";
import { getServerTranslations } from "@/i18n/server";

// Reached when /register/[category] doesn't match any known category slug
// (e.g. /register/abcxyz) -- a safe, on-brand 404 rather than a crash or a
// silent redirect that hides the bad URL from the visitor.
export default async function RegisterCategoryNotFound() {
  const { t } = await getServerTranslations();

  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{t("registerHub.notFound.title")}</h1>
      <p className="mt-3 max-w-md text-base text-ink-500">{t("registerHub.notFound.description")}</p>
      <Link href={`/register/${DEFAULT_REGISTRATION_CATEGORY_SLUG}`} className="mt-6">
        <Button type="button" variant="primary">
          {t("registerHub.notFound.action")}
        </Button>
      </Link>
    </Container>
  );
}
