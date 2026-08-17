import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-border-default bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-6 border-b border-border-default pb-5">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
