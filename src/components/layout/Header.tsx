import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { AuthNav } from "./AuthNav";
import { MobileMenuToggle } from "./MobileMenuToggle";

function AuthNavFallback() {
  return (
    <span aria-hidden className="flex min-h-11 items-center px-3 text-sm text-transparent">
      Sign In
    </span>
  );
}

const discoverLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-white/95 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            SF
          </span>
          SportFo
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          <Link href="/athletes" className={discoverLinkClassName}>
            Discover Athletes
          </Link>
          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav />
          </Suspense>
        </nav>

        <MobileMenuToggle>
          <Link
            href="/athletes"
            className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-ink-700 hover:bg-surface-muted"
          >
            Discover Athletes
          </Link>
          <Suspense fallback={null}>
            <AuthNav />
          </Suspense>
        </MobileMenuToggle>
      </Container>
    </header>
  );
}
