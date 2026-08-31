import { ProfileSetupIcon } from "@/components/ui/RegistrationIcons";
import { isSafeExternalUrl } from "@/lib/url";
import type { AthleteProfileRow } from "@/types/database";
import { DarkSectionCard } from "./DarkSectionCard";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface AthleteBioSectionProps {
  profile: AthleteProfileRow;
  locale: Locale;
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" width="14" height="14" className="shrink-0">
      <path d="M8 5h7v7M15 5 6 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Only ever rendered when there's a real short bio or at least one real,
// http(s)-validated link -- see isSafeExternalUrl. Every link opens via
// target="_blank" rel="noopener noreferrer", never a bare href that could
// carry window.opener back to an athlete-supplied URL.
export function AthleteBioSection({ profile, locale }: AthleteBioSectionProps) {
  const t = (key: string) => translate(locale, key);

  const links: { label: string; url: string }[] = [
    { label: t("register.profile.instagramUrl"), url: profile.instagram_url ?? "" },
    { label: t("register.profile.facebookUrl"), url: profile.facebook_url ?? "" },
    { label: t("register.profile.otherUrl"), url: profile.other_url ?? "" },
  ].filter((link) => isSafeExternalUrl(link.url));

  return (
    <DarkSectionCard title={t("profile.about.title")} icon={<ProfileSetupIcon />}>
      {profile.short_bio && <p className="text-sm leading-relaxed text-[#cddaff]">{profile.short_bio}</p>}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.15] bg-white/[0.05] px-3.5 text-sm font-semibold text-[#7ea3ff] transition-colors hover:bg-white/[0.1] hover:text-[#a9c1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430]"
            >
              {link.label}
              <ExternalLinkIcon />
            </a>
          ))}
        </div>
      )}
    </DarkSectionCard>
  );
}
