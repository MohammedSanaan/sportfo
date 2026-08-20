"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { cn } from "@/lib/cn";
import { setProfileVisibility } from "@/features/athlete-profile/actions";

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
    <SectionCard
      title="Profile Visibility"
      description="Control whether your athlete profile can be viewed by anyone with the link."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Toggle profile visibility"
            disabled={isPending}
            onClick={() => handleToggle(!isPublic)}
            className={cn(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2",
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
          <span className="text-sm font-medium text-ink-800">
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        {isPublic && slug ? (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p suppressHydrationWarning className="break-all text-sm text-ink-600">
              {displayUrl}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!profileUrl}
              >
                Copy Profile Link
              </Button>
              {copied && (
                <span role="status" className="text-xs text-ink-500">
                  Profile link copied
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-400">
            Your profile is private. Make it public to get a shareable link.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </SectionCard>
  );
}
