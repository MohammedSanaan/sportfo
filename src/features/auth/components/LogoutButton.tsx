"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface LogoutButtonProps {
  locale: Locale;
  // Callers with their own copy/styling (e.g. AccountMenu's "Sign Out" menu
  // item) can override the default nav.logout/nav.loggingOut text and
  // className instead of this rendering its own plain nav-style link --
  // the actual sign-out behavior below is identical either way.
  label?: string;
  busyLabel?: string;
  icon?: ReactNode;
  className?: string;
}

const DEFAULT_CLASS_NAME =
  "rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50";

export function LogoutButton({ locale, label, busyLabel, icon, className }: LogoutButtonProps) {
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
      className={cn(DEFAULT_CLASS_NAME, className)}
    >
      {icon}
      {isLoggingOut
        ? (busyLabel ?? translate(locale, "nav.loggingOut"))
        : (label ?? translate(locale, "nav.logout"))}
    </button>
  );
}
