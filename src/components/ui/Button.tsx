import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outlineOnDark" | "inverse";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-200",
  secondary:
    "bg-surface text-ink-800 border border-border-strong hover:bg-surface-muted focus-visible:ring-brand-100",
  ghost:
    "bg-transparent text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-100",
  // For a primary/secondary CTA pair sitting on a dark hero panel, where
  // the default "secondary" (white surface, dark text) would read as an
  // odd bright rectangle against the navy background.
  outlineOnDark:
    "bg-transparent text-white border border-white/40 hover:bg-white/10 focus-visible:ring-white/40",
  // A solid white CTA for use on a brand-600/navy colored section (e.g.
  // the final CTA band) -- a dedicated variant rather than overriding
  // "secondary" via className, since conflicting Tailwind utility classes
  // don't reliably override by className string order.
  inverse:
    "bg-white text-brand-700 hover:bg-white/90 focus-visible:ring-white/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] sm:w-auto",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...buttonProps}
    />
  );
}
