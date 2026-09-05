"use client";

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="9.5" r="1" fill="currentColor" />
      <circle cx="12" cy="9.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

interface CoachButtonProps {
  isOpen: boolean;
  onClick: () => void;
  label: string;
  name: string;
}

// The single persistent, global entry point to Coach -- bottom-right on
// every viewport (see the bottom-[calc(...+env(safe-area-inset-bottom))]
// fallback for devices with a home indicator/gesture bar). Uses the app's
// own brand-600 button color, not a generic third-party-widget
// green/purple, so it reads as a native SportFo control. Hidden entirely
// while the panel is open -- CoachHeader already owns the close control,
// so this avoids a second, redundant close affordance on screen at once.
export function CoachButton({ isOpen, onClick, label, name }: CoachButtonProps) {
  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={isOpen}
      aria-controls="coach-panel"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex h-14 items-center gap-2 rounded-full bg-brand-600 pr-5 pl-4 text-white shadow-lg transition-all duration-200 hover:bg-brand-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 active:scale-95 sm:right-6 sm:bottom-6"
    >
      <ChatIcon />
      <span className="hidden text-sm font-semibold sm:inline">{name}</span>
    </button>
  );
}
