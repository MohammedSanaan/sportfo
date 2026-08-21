import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

const navLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

// Isolated into its own async Server Component (rather than awaiting
// directly in Header) so it can be wrapped in <Suspense> -- the session
// check shouldn't delay the rest of the shared layout from streaming.
export async function AuthNav() {
  const user = await getAuthUser();

  if (user) {
    return (
      <>
        {/* Stands in for a future "dashboard" -- there isn't one yet, so
            this is where a signed-in athlete currently lands to see their
            own profile. */}
        <Link href="/athlete/profile" className={navLinkClassName}>
          View Profile
        </Link>
        <Link href="/athlete/register" className={navLinkClassName}>
          Register
        </Link>
        <LogoutButton />
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth"
        className="inline-flex h-9 items-center justify-center rounded-full border border-border-strong px-4 text-sm font-medium text-ink-700 transition-colors hover:border-ink-400 hover:bg-surface-muted hover:text-ink-900"
      >
        Login
      </Link>
      <Link
        href="/auth"
        data-solid
        className="ml-1 inline-flex h-9 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
      >
        Join SportFo
      </Link>
    </>
  );
}
