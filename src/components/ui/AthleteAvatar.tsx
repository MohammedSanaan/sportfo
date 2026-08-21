import { getInitials } from "@/lib/format";
import { cn } from "@/lib/cn";

type AthleteAvatarSize = "sm" | "md" | "lg" | "xl";

interface AthleteAvatarProps {
  fullName: string | null;
  size?: AthleteAvatarSize;
  className?: string;
}

// No profile-photo uploads exist anywhere in this codebase -- this is
// intentionally initials-only, never a placeholder/stock/AI face standing
// in for a real athlete.
const sizeStyles: Record<AthleteAvatarSize, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl",
  xl: "h-24 w-24 text-3xl sm:h-28 sm:w-28 sm:text-4xl",
};

export function AthleteAvatar({ fullName, size = "md", className }: AthleteAvatarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white",
        sizeStyles[size],
        className,
      )}
    >
      {getInitials(fullName)}
    </div>
  );
}
