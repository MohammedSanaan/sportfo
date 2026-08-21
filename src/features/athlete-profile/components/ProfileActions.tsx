import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

export function ProfileActions({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <LogoutButton locale={locale} />
      <Link href="/athlete/register">
        <Button type="button" variant="secondary">
          {translate(locale, "profile.actions.editProfile")}
        </Button>
      </Link>
    </div>
  );
}
