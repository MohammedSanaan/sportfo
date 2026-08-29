"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
      // A caller-supplied className fully REPLACES the default rather than
      // merging with it -- `cn()` here is a plain string join with no
      // Tailwind conflict resolution, so merging two different `text-*`/
      // `rounded-*`/spacing utilities would leave the winner up to
      // generated-CSS source order, not which one the caller actually
      // intended. Every caller with its own className is expected to be
      // complete (see AccountMenu's menuItemClassName usage).
      className={className ?? DEFAULT_CLASS_NAME}
    >
      {icon}
      {isLoggingOut
        ? (busyLabel ?? translate(locale, "nav.loggingOut"))
        : (label ?? translate(locale, "nav.logout"))}
    </button>
  );
}
