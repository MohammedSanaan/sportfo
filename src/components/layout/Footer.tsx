import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "./FooterSocialIcons";

// No official SportFo social URLs exist in the project yet -- each icon
// stays visible but inert rather than linking out to an invented profile.
// Swap in real hrefs here once they exist; SocialIcon already renders a
// real <a> the moment href is set.
const SOCIAL_LINKS: { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "X (Twitter)", Icon: XIcon },
  { label: "YouTube", Icon: YouTubeIcon },
  { label: "WhatsApp", Icon: WhatsAppIcon },
  { label: "LinkedIn", Icon: LinkedInIcon },
];

const CONTACT_EMAIL = "support@sportfo.com";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold tracking-wide text-white/40 uppercase">{children}</span>;
}

function SocialIcon({ label, Icon }: { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return (
    <span
      aria-disabled
      title={`${label} · Coming soon`}
      className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-white/15 text-white/40"
    >
      <span className="sr-only">{label}</span>
      <Icon className="h-4 w-4" />
    </span>
  );
}

// Deliberately no link columns (Platform/For Athletes/Company) -- just
// brand, contact, and a full social row, per the "just add social media,
// not a sitemap" ask.
export function Footer({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);

  return (
    <footer className="border-t border-border-default bg-navy-950">
      <Container className="flex flex-col items-start gap-8 py-16">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            SF
          </span>
          SportFo
        </Link>
        <p className="max-w-sm text-sm text-white/50">{t("footer.tagline")}</p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-sm text-white/70 transition-colors hover:text-white"
        >
          {CONTACT_EMAIL}
        </a>

        <div className="flex flex-col items-start gap-3">
          <FooterHeading>{t("footer.followUs")}</FooterHeading>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, Icon }) => (
              <SocialIcon key={label} label={label} Icon={Icon} />
            ))}
          </div>
        </div>
      </Container>

      <Container className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </p>
        <div className="flex items-center gap-5">
          <span className="text-xs text-white/30" aria-disabled title="Coming soon">
            {t("footer.privacyPolicy")}
          </span>
          <span className="text-xs text-white/30" aria-disabled title="Coming soon">
            {t("footer.termsOfService")}
          </span>
        </div>
      </Container>
    </footer>
  );
}
