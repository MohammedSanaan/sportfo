import type { ReactNode } from "react";

interface SidebarInfoCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  // e.g. a "Contact Support" link -- optional, most tip cards are pure text.
  action?: ReactNode;
}

// A single small widget in the registration page's right-hand sidebar
// ("Why complete your profile?", "Verification builds trust", a category
// eligibility note, ...). Visually related to SectionCard (same radius/
// border/shadow language) but deliberately smaller and never a form
// container -- text and an optional action only.
export function SidebarInfoCard({ icon, title, description, action }: SidebarInfoCardProps) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        {icon && (
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
          >
            {icon}
          </span>
        )}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <p className="text-sm text-ink-500">{description}</p>
          {action && <div className="mt-1.5">{action}</div>}
        </div>
      </div>
    </div>
  );
}
