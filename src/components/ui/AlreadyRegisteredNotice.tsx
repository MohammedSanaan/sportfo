import Link from "next/link";

interface AlreadyRegisteredNoticeProps {
  title: string;
  description: string;
  profileHref?: string;
  profileLabel?: string;
}

// Shown above an already-submitted registration's form (Athlete or any of
// the 7 role categories) instead of silently just pre-filling a form with
// no explanation -- makes the "you're not starting from scratch, and this
// isn't a second registration" state explicit. The form itself stays
// beneath this (already pre-filled from the saved row, see
// loadAthleteDraft / get_own_role_registration), so "Update Profile" is
// simply scrolling down and re-submitting -- never a second/duplicate
// registration path.
export function AlreadyRegisteredNotice({
  title,
  description,
  profileHref,
  profileLabel,
}: AlreadyRegisteredNoticeProps) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm">
      <p className="font-semibold text-brand-900">{title}</p>
      <p className="mt-1 text-brand-700">{description}</p>
      {profileHref && profileLabel && (
        <Link
          href={profileHref}
          className="mt-3 inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {profileLabel}
        </Link>
      )}
    </div>
  );
}
