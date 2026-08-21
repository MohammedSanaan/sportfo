import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { AuthNav } from "@/components/layout/AuthNav";
import { getAuthUser } from "@/lib/supabase/auth-user";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display face, used only for the italic accent inside large headlines.
// The contrast against Inter's data/UI voice is the homepage's typographic
// signature; it is never used for body copy or anything under ~24px.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SportFo",
  description:
    "SportFo is a sports-tech platform for athletes to build professional profiles and connect with coaches, academies, and sponsors.",
};

function AuthNavFallback() {
  return (
    <span aria-hidden className="px-3 py-2 text-sm text-transparent">
      Login
    </span>
  );
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // getAuthUser is cache()-wrapped, so this and AuthNav's own call below
  // de-dupe to a single Supabase request per render, not two. Needed here
  // (rather than left entirely to AuthNav) only to decide whether Header
  // shows its own compact, always-visible "Login" link on narrow screens --
  // see the comment on that prop in Header.tsx for why.
  const user = await getAuthUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Scroll reveals are applied by JS; without it nothing would ever
            un-hide, so scripting-off gets the finished state immediately. */}
        <noscript>
          <style>{`.sf-reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-surface-muted text-ink-900">
        <Header
          authNav={
            <Suspense fallback={<AuthNavFallback />}>
              <AuthNav />
            </Suspense>
          }
          mobileAuthNav={
            <Suspense fallback={<AuthNavFallback />}>
              <AuthNav />
            </Suspense>
          }
          isAuthenticated={Boolean(user)}
        />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
