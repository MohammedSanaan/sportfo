"use client";

import { useState } from "react";
import { getAchievementDocumentSignedUrl } from "@/features/athlete-registration/actions";

interface ViewCertificateButtonProps {
  achievementId: string;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

// Deliberately a two-step "prepare, then open" flow rather than fetching
// the signed URL and calling window.open() in one click: browsers require
// window.open() to run synchronously within the click for it to count as a
// real user gesture, and the signed-URL fetch (an await) breaks that chain
// -- observed in testing to get silently popup-blocked even when a blank
// tab is pre-opened and later navigated via a held window reference (that
// pattern works in isolation, but not reliably once a Next.js Server
// Action call sits in between). A real <a target="_blank"> the athlete
// clicks themselves has no such timing dependency.
export function ViewCertificateButton({ achievementId }: ViewCertificateButtonProps) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function handlePrepare() {
    setState({ status: "loading" });
    const result = await getAchievementDocumentSignedUrl(achievementId);

    if (!result.ok) {
      setState({ status: "error", message: result.error });
      return;
    }
    setState({ status: "ready", url: result.url });
  }

  if (state.status === "ready") {
    return (
      <a
        href={state.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-brand-700 underline hover:text-brand-800"
      >
        Open certificate
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePrepare}
        disabled={state.status === "loading"}
        className="text-sm font-medium text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state.status === "loading" ? "Preparing..." : "View certificate"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {state.message}
        </p>
      )}
    </div>
  );
}
