import { ApparelIcon } from "@/components/ui/RegistrationIcons";
import type { AthleteProfileRow } from "@/types/database";
import { DarkSectionCard } from "./DarkSectionCard";
import { AthleteInfoGrid } from "./AthleteInfoGrid";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface AthleteApparelSectionProps {
  profile: AthleteProfileRow;
  locale: Locale;
}

// Owner-only operational data (kit sizing) -- only ever rendered on
// /athlete/profile, never fetched by or exposed through the public profile
// RPC (get_public_athlete_profile has no apparel columns), so this section
// existing at all is already the privacy boundary; the visible "only you"
// note is a belt-and-suspenders UI cue on top of that, not the actual
// control. Only shown when at least one size is set.
export function AthleteApparelSection({ profile, locale }: AthleteApparelSectionProps) {
  const t = (key: string) => translate(locale, key);

  const items = [
    { label: t("register.apparel.trackSuitSize"), value: profile.track_suit_size ?? "" },
    { label: t("register.apparel.tshirtSize"), value: profile.tshirt_size ?? "" },
    { label: t("register.apparel.shortsSize"), value: profile.shorts_size ?? "" },
    { label: t("register.apparel.shoeSize"), value: profile.shoe_size ?? "" },
  ];

  return (
    <DarkSectionCard
      title={t("register.apparel.title")}
      icon={<ApparelIcon />}
      action={
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#8b96b8] uppercase">
          {t("profile.privateNote")}
        </span>
      }
    >
      <AthleteInfoGrid items={items} />
    </DarkSectionCard>
  );
}
