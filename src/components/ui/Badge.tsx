import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "brand" | "neutral" | "success" | "warning" | "onDark";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-surface-muted text-ink-600 border border-border-default",
  success: "bg-success-50 text-success-500",
  warning: "bg-amber-50 text-amber-800",
  onDark: "bg-white/10 text-white ring-1 ring-inset ring-white/20",
};

export function Badge({ variant = "brand", className, ...spanProps }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variantStyles[variant],
        className,
      )}
      {...spanProps}
    />
  );
}
