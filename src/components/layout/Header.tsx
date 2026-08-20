import Link from "next/link";
import { Suspense } from "react";
import { AuthNav } from "./AuthNav";

function AuthNavFallback() {
  return (
    <span aria-hidden className="px-3 py-2 text-sm text-transparent">
      Login
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
            SF
          </span>
          SportFo
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <Link
            href="/athletes"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900"
          >
            Discover Athletes
          </Link>
          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
