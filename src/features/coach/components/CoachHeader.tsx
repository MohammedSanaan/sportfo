"use client";

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 4.5l11 11M15.5 4.5l-11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

interface CoachHeaderProps {
  name: string;
  tagline: string;
  aiDisclosure: string;
  newChatLabel: string;
  closeLabel: string;
  onNewChat: () => void;
  onClose: () => void;
  showNewChat: boolean;
}

// Reuses the SportFo wordmark badge from Header.tsx (the "SF" square) so
// Coach's own header reads as the same app, not a bolted-on widget.
export function CoachHeader({
  name,
  tagline,
  aiDisclosure,
  newChatLabel,
  closeLabel,
  onNewChat,
  onClose,
  showNewChat,
}: CoachHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border-default bg-white px-4 py-3 sm:px-5 sm:py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        SF
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink-900">{name}</p>
        <p className="truncate text-xs text-ink-500">{tagline}</p>
      </div>
      <span className="hidden shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-ink-500 sm:inline">
        {aiDisclosure}
      </span>
      {showNewChat && (
        <button
          type="button"
          onClick={onNewChat}
          aria-label={newChatLabel}
          title={newChatLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          <NewChatIcon />
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
