interface QuickAction {
  label: string;
}

interface CoachQuickActionsProps {
  actions: QuickAction[];
  onSelect: (label: string) => void;
}

// Shown only on the empty/welcome state (see CoachPanel) -- every label
// here maps 1:1 to real SportFo functionality (how it works, registering,
// choosing a pathway, and the two most common user-type questions), never
// an invented capability.
export function CoachQuickActions({ actions, onSelect }: CoachQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onSelect(action.label)}
          className="rounded-full border border-border-default bg-white px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
