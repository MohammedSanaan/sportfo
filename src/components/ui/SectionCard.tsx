import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  // Optional small icon badge shown to the left of the title -- purely
  // decorative (aria-hidden), never the only cue for a section's purpose.
  // Every existing caller omits this and keeps rendering exactly as
  // before; this is an additive, backward-compatible prop.
  icon?: ReactNode;
  className?: string;
  // Optional trailing element in the header row (e.g. a "private" badge, a
  // count, an inline CTA) -- omitted by every existing caller, so this is
  // additive and never changes their layout.
  action?: ReactNode;
}

export function SectionCard({ title, description, children, icon, className, action }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border-default bg-surface p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8",
        className,
      )}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border-default pb-5">
        <div className="flex items-start gap-3">
          {icon && (
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
            >
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-ink-500">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
