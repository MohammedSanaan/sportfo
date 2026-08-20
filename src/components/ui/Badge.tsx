import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "brand" | "neutral" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-surface-muted text-ink-600 border border-border-default",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-800",
};

export function Badge({ variant = "neutral", className, ...spanProps }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className,
      )}
      {...spanProps}
    />
  );
}
