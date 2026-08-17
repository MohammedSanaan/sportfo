import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

const navLinkClassName =
  "rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

// Isolated into its own async Server Component (rather than awaiting
// directly in Header) so it can be wrapped in <Suspense> -- the session
// check shouldn't delay the rest of the shared layout from streaming.
export async function AuthNav() {
  const user = await getAuthUser();

  if (user) {
    return (
      <>
        <Link href="/athlete/register" className={navLinkClassName}>
          Athlete Registration
        </Link>
        <LogoutButton />
      </>
    );
  }

  return (
    <>
      <Link href="/auth" className={navLinkClassName}>
        Login
      </Link>
      <Link
        href="/auth"
        className="ml-1 inline-flex h-9 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
      >
        Join SportFo
      </Link>
    </>
  );
}
