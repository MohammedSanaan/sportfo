"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { setProfileVisibility } from "@/features/athlete-profile/actions";
import { useTranslation } from "@/i18n/LocaleProvider";

interface ProfileVisibilityCardProps {
  initialIsPublic: boolean;
  initialSlug: string | null;
}

// window is unavailable during the server render, so the origin is read
// directly during render (not stored in state/effect -- setState inside a
// bare effect is exactly the anti-pattern react-hooks/set-state-in-effect
// flags) and the one text node that depends on it is marked
// suppressHydrationWarning: the server renders the path only, the client's
// first paint immediately corrects to the full host + path, and that
// one-frame difference is the intended, self-correcting behavior.
function getOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

// Only rendered for a submitted profile (see src/app/athlete/profile/page.tsx
// -- a non-submitted profile never reaches this page at all), so there is no
// separate "must be submitted" gate here; set_athlete_profile_visibility
// enforces it server-side regardless.
export function ProfileVisibilityCard({
  initialIsPublic,
  initialSlug,
}: ProfileVisibilityCardProps) {
  const { t } = useTranslation();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const profilePath = slug ? `/a/${slug}` : "";
  const origin = getOrigin();
  const profileUrl = slug && origin ? `${origin}${profilePath}` : "";
  const displayUrl = origin ? `${origin.replace(/^https?:\/\//, "")}${profilePath}` : profilePath;

  function handleToggle(next: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setProfileVisibility(next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setIsPublic(result.isPublic);
      setSlug(result.slug);
    });
  }

  async function handleCopy() {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable -- nothing more we can safely do here.
    }
  }

  return (
    <section className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2 border-b border-border-default pb-4">
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18" aria-hidden>
            <rect x="4.5" y="9" width="11" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h2 className="text-base font-bold text-ink-900 sm:text-lg">{t("profile.visibility.title")}</h2>
          <p className="mt-0.5 text-sm text-ink-500">{t("profile.visibility.description")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label={t("profile.visibility.toggleAriaLabel")}
            disabled={isPending}
            onClick={() => handleToggle(!isPublic)}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isPublic ? "bg-brand-600" : "bg-border-strong",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                isPublic ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
          <span className="text-sm font-semibold text-ink-900">
            {isPublic ? t("profile.visibility.public") : t("profile.visibility.private")}
          </span>
        </div>

        {isPublic && slug ? (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <p suppressHydrationWarning className="break-all text-sm text-brand-700">
              {displayUrl}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                // Gated on `slug` (server/client-identical), not `profileUrl`
                // -- `profileUrl` is empty during SSR because `origin` isn't
                // available yet (see getOrigin()), which mismatched the
                // disabled attribute between server and client HTML. `slug`
                // alone is enough: by the time a user can actually click
                // this, hydration has finished and `origin` is already
                // resolved, so handleCopy's own `!profileUrl` guard never
                // fires in practice.
                disabled={!slug}
                className="inline-flex h-9 items-center rounded-lg border border-border-default bg-surface-muted px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("profile.visibility.copyLink")}
              </button>
              <Link
                href={profilePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                {t("profile.visibility.viewPublic")}
              </Link>
              {copied && (
                <span role="status" className="text-xs font-medium text-success-500">
                  {t("profile.visibility.linkCopied")}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-500">{t("profile.visibility.privateNote")}</p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
