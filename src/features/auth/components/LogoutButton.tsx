"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoggingOut ? translate(locale, "nav.loggingOut") : translate(locale, "nav.logout")}
    </button>
  );
}
