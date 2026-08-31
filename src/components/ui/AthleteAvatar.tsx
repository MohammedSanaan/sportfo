import { getInitials } from "@/lib/format";
import { cn } from "@/lib/cn";

type AthleteAvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";

interface AthleteAvatarProps {
  fullName: string | null;
  size?: AthleteAvatarSize;
  className?: string;
  // A ready-to-render public Storage URL (see getProfilePhotoUrl) -- never
  // a placeholder/stock/AI face standing in for a real athlete; falls back
  // to initials whenever no real photo exists.
  photoUrl?: string | null;
}

const sizeStyles: Record<AthleteAvatarSize, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl",
  xl: "h-24 w-24 text-3xl sm:h-28 sm:w-28 sm:text-4xl",
  // The dark AthleteProfileHero's photo -- ~96-112px on mobile, growing to
  // 120-136px on desktop (see task spec), distinct from "xl" (used by the
  // public/registration ProfileHero, which stays untouched).
  "2xl": "h-24 w-24 text-3xl sm:h-28 sm:w-28 sm:text-4xl md:h-[120px] md:w-[120px] lg:h-[136px] lg:w-[136px]",
};

export function AthleteAvatar({ fullName, size = "md", className, photoUrl }: AthleteAvatarProps) {
  if (photoUrl) {
    return (
      /* An external Supabase Storage public URL, not a static/known-remote-pattern asset next/image can optimize. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", sizeStyles[size], className)}
      />
    );
  }

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
