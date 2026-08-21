"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";

// Web Share API where available (mobile browsers mostly), clipboard
// fallback everywhere else. Never alert() -- a small inline confirmation
// next to the button instead, matching how ViewCertificateButton and
// ProfileVisibilityCard surface their own inline status.
export function ShareProfileButton() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        // Cancelled or unsupported mid-call -- fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable -- nothing more we can safely do here.
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="secondary" onClick={handleShare}>
        {t("publicProfile.share.button")}
      </Button>
      {copied && (
        <p role="status" className="text-xs text-ink-500">
          {t("publicProfile.share.linkCopied")}
        </p>
      )}
    </div>
  );
}
