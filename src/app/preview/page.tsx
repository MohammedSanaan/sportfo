import type { Metadata } from "next";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";
import { PreviewBanner } from "./PreviewBanner";

export const metadata: Metadata = {
  title: "UI Preview | SportFo",
};

const LINKS: { href: string; title: string; description: string }[] = [
  {
    href: "/",
    title: "Homepage",
    description: "Public landing page. No auth required.",
  },
  {
    href: "/auth",
    title: "Sign In / OTP",
    description: "Real phone OTP flow. Needs a real code to get past this screen.",
  },
  {
    href: "/preview/athlete-registration",
    title: "Athlete Registration (sample data)",
    description: "The real registration form, pre-filled. Save/Submit won't persist.",
  },
  {
    href: "/preview/athlete-profile",
    title: "Athlete Profile (sample data)",
    description: "The real profile view, rendered with a sample athlete.",
  },
];

// Dev-only index of every screen, real and preview, for reviewing the UI
// without going through OTP sign-in. Not linked from anywhere in the real
// app -- remove this route (and src/app/preview) once no longer needed.
export default function PreviewIndexPage() {
  return (
    <>
      <PreviewBanner label="index of every screen" />
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          UI Preview
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Temporary, dev-only links for reviewing the product UI without a
          real sign-in. Nothing here touches the database.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {LINKS.map((link) => (
            <SectionCard key={link.href} title={link.title} description={link.description}>
              <Link href={link.href} className="text-sm font-medium text-brand-700 hover:underline">
                Open →
              </Link>
            </SectionCard>
          ))}
        </div>
      </div>
    </>
  );
}
