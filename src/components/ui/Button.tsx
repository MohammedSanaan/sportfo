import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-200",
  secondary:
    "bg-surface text-ink-800 border border-border-strong hover:bg-surface-muted focus-visible:ring-brand-100",
  ghost:
    "bg-transparent text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-100",
};

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors sm:w-auto",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...buttonProps}
    />
  );
}
