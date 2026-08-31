import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DarkSectionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

// The dark-theme equivalent of SectionCard (which stays light, used
// everywhere else in the app) -- every owner-only /athlete/profile section
// below uses this so the page reads as one consistent card system, matching
// the authenticated Dashboard's card language (bg-[#0d1430], border-white/10).
export function DarkSectionCard({ title, description, icon, action, children, className }: DarkSectionCardProps) {
  return (
    <section className={cn("rounded-2xl border border-white/10 bg-[#0d1430] p-5 sm:p-7", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-start gap-3">
          {icon && (
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4d7cff]/15 text-[#7ea3ff]">
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-base font-bold text-[#e8ecf8] sm:text-lg">{title}</h2>
            {description && <p className="mt-1 text-sm text-[#8b96b8]">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
