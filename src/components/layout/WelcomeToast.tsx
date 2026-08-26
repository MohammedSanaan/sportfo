"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getRegistrationCategoryById } from "@/lib/registration/categories";
import { consumeWelcomePayload, type WelcomePayload } from "@/lib/account/welcome-storage";
import { useTranslation } from "@/i18n/LocaleProvider";

const VISIBLE_MS = 6000;
// Matches AccountMenu's dropdown transition duration/easing so every
// "premium" motion moment in the app feels like the same design system,
// not a one-off. motion-reduce turns this into a plain, instant show/hide.
const TRANSITION_CLASS = "transition-all duration-150 ease-out motion-reduce:transition-none";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5 shrink-0 text-success-500">
      <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M6.5 10.25l2.25 2.25 4.75-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Mounted once, globally, in the root layout -- reads and clears the
// one-shot handoff AuthFlow leaves right after a login that recognized an
// existing, already-registered account (see welcome-storage.ts). Renders
// nothing at all on every other page load; this is not a recurring
// every-login modal, just a brief, dismissible confirmation.
export function WelcomeToast() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<WelcomePayload | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dismissTimer: number | undefined;
    // One tick after mount so the initial render starts from the
    // "closed" transform/opacity and the transition actually animates in,
    // rather than the toast just appearing already-visible. Reading
    // sessionStorage and setting state inside this callback (rather than
    // synchronously in the effect body) keeps the state updates inside a
    // callback, same shape as AuthFlow's resend-cooldown timer.
    const openTimer = window.setTimeout(() => {
      const stored = consumeWelcomePayload();
      if (!stored) return;
      setPayload(stored);
      setOpen(true);
      dismissTimer = window.setTimeout(() => setOpen(false), VISIBLE_MS);
    }, 20);
    return () => {
      window.clearTimeout(openTimer);
      if (dismissTimer) window.clearTimeout(dismissTimer);
    };
  }, []);

  // Unmount only after the closing transition has had time to finish, so
  // dismissing (manually or via the auto-timeout) fades out instead of
  // vanishing instantly.
  useEffect(() => {
    if (open || !payload) return;
    const removeTimer = window.setTimeout(() => setPayload(null), 200);
    return () => window.clearTimeout(removeTimer);
  }, [open, payload]);

  if (!payload) return null;

  const name = payload.displayName || t("account.sportfoUser");
  const category = payload.roleId ? getRegistrationCategoryById(payload.roleId) : undefined;
  const roleLabel = category ? t(`account.roles.${category.id}`) : null;
  const signedInAsParts = [roleLabel, payload.sportfoId].filter(Boolean).join(" · ");

  return (
    // top-20 clears the sticky h-16 header (see Header.tsx) with a small
    // gap, so the toast never sits on top of it -- z-30 (below the
    // header's z-40) for the same reason.
    <div className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center px-4 sm:justify-end sm:pr-4 sm:pl-0">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border-default bg-surface p-4 shadow-lg",
          TRANSITION_CLASS,
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        <CheckIcon />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">
            {t("account.welcomeBack", { name })}
          </p>
          {signedInAsParts && (
            <p className="mt-0.5 text-xs text-ink-500">
              {t("account.signedInAs")} {signedInAsParts}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={t("common.dismiss")}
          onClick={() => setOpen(false)}
          className="-m-1 shrink-0 rounded-md p-1 text-ink-400 transition-colors hover:bg-surface-muted hover:text-ink-700"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
