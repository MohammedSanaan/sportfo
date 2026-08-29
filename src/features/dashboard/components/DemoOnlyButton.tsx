"use client";

import { useEffect, useState } from "react";

interface DemoOnlyButtonProps {
  label: string;
  demoOnlyLabel: string;
  className: string;
}

// Every "Apply now"/"Manage"/"Follow"-style CTA rendered in demo mode uses
// this instead of a real Link or Server Action -- there is no real
// sponsorship/trial/coach-follow backend for it to call. Clicking never
// writes anything (no fetch, no Supabase call, no navigation); it only
// shows a small transient "Demo only" note next to the button so it still
// feels interactive without pretending the action did something real. Takes
// only strings as props, so it stays a safe, self-contained Client
// Component -- no server function is ever passed into it.
export function DemoOnlyButton({ label, demoOnlyLabel, className }: DemoOnlyButtonProps) {
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    if (!showNote) return;
    const timer = setTimeout(() => setShowNote(false), 1800);
    return () => clearTimeout(timer);
  }, [showNote]);

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={() => setShowNote(true)} className={className}>
        {label}
      </button>
      {showNote && (
        <span
          role="status"
          className="absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-[#0a0f22] px-2.5 py-1 text-[11px] font-medium text-[#b6c1e2] shadow-lg"
        >
          {demoOnlyLabel}
        </span>
      )}
    </span>
  );
}
