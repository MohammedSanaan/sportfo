import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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

type FooterLinkItem = { label: string; href?: string };

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold tracking-wide text-white/40 uppercase">{children}</span>;
}

function SocialIcon({ label, Icon }: { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return (
    <span
      aria-disabled
      title={`${label} · Coming soon`}
      className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-white/15 text-white/40 transition-colors hover:border-white/25"
    >
      <span className="sr-only">{label}</span>
      <Icon className="h-4 w-4" />
    </span>
  );
}

function FooterLinkRow({ label, href }: FooterLinkItem) {
  if (!href) {
    return (
      <span aria-disabled title="Coming soon" className="text-sm text-white/30">
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className="text-sm text-white/60 transition-colors hover:text-white">
      {label}
    </Link>
  );
}

// Renders the same link list twice: a native <details> accordion below
// `sm` (no JS needed for the open/close behavior) and a plain static list
// at `sm` and up -- avoids a client component just to toggle visibility.
function FooterNavColumn({ title, links }: { title: string; links: FooterLinkItem[] }) {
  return (
    <div className="border-b border-white/10 py-4 sm:border-0 sm:py-0">
      <details className="group sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
          {title}
          <ChevronDown className="h-4 w-4 text-white/50 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="mt-3 flex flex-col gap-3 pb-1">
          {links.map((link) => (
            <li key={link.label}>
              <FooterLinkRow {...link} />
            </li>
          ))}
        </ul>
      </details>

      <div className="hidden sm:block">
        <FooterHeading>{title}</FooterHeading>
        <ul className="mt-4 flex flex-col gap-3">
          {links.map((link) => (
            <li key={link.label}>
              <FooterLinkRow {...link} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);

  const discoverLinks: FooterLinkItem[] = [
    { label: t("footer.home"), href: "/" },
    { label: t("footer.sports"), href: "/#sports" },
    { label: t("footer.opportunities"), href: "/#opportunity" },
    { label: t("footer.stories"), href: "/stories" },
    { label: t("nav.joinSportfo"), href: "/#community" },
  ];

  const communityLinks: FooterLinkItem[] = [
    { label: t("footer.discoverAthletes"), href: "/athletes" },
    { label: t("footer.aboutSportfo"), href: "/#about" },
    { label: t("footer.academies") },
    { label: t("footer.sponsorsCsr") },
    { label: t("footer.eventsTrials") },
    { label: t("footer.sportsServices") },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy-950">
      {/* Decorative brand glow -- purely cosmetic, matches the dark hero
          treatment used elsewhere on the homepage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(47,102,240,0.35),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/80 to-transparent"
      />

      <Container className="relative flex flex-col items-center gap-3 pt-16 pb-10 text-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-base font-bold text-white shadow-lg shadow-brand-600/30">
            SF
          </span>
          SportFo
        </Link>
        <p className="max-w-md text-sm text-white/50">{t("footer.tagline")}</p>
      </Container>

      <Container>
        <div className="border-t border-white/10" />
      </Container>

      <Container className="relative grid gap-x-10 py-4 sm:grid-cols-2 sm:gap-y-10 sm:py-12 lg:grid-cols-[1fr_1fr_auto]">
        <FooterNavColumn title={t("footer.discover")} links={discoverLinks} />
        <FooterNavColumn title={t("footer.community")} links={communityLinks} />

        <div className="flex flex-col gap-6 py-4 sm:col-span-2 sm:py-0 lg:col-span-1">
          <div className="flex flex-col gap-3">
            <FooterHeading>{t("footer.connect")}</FooterHeading>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <FooterHeading>{t("footer.followUs")}</FooterHeading>
            <div className="flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map(({ label, Icon }) => (
                <SocialIcon key={label} label={label} Icon={Icon} />
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container className="relative flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
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
