import { lexend } from "@/features/homepage/lexend";
import { EcosystemHero } from "@/features/homepage/components/EcosystemHero";
import { AboutSportFoSection } from "@/features/homepage/components/AboutSportFoSection";
import { VisionMissionSection } from "@/features/homepage/components/VisionMissionSection";
import { WhoWeServeSection } from "@/features/homepage/components/WhoWeServeSection";
import { OpportunitiesSection } from "@/features/homepage/components/OpportunitiesSection";
import { PlatformFeaturesSection } from "@/features/homepage/components/PlatformFeaturesSection";
import { GapSection } from "@/features/homepage/components/GapSection";
import { HowSportFoWorksSection } from "@/features/homepage/components/HowSportFoWorksSection";
import { StatsSection } from "@/features/homepage/components/StatsSection";
import { ParentsSection } from "@/features/homepage/components/ParentsSection";
import { AthleteStoriesSection } from "@/features/homepage/components/AthleteStoriesSection";
import { getServerTranslations } from "@/i18n/server";

// Landing page body, recreated from the supplied Stitch design (see the
// integration report for section-by-section notes on image/font/CTA
// choices). Section order matches the Stitch source exactly.
export default async function Home() {
  const { t } = await getServerTranslations();

  return (
    <div className={`${lexend.variable} flex flex-1 flex-col font-stitch text-stitch-text`}>
      <EcosystemHero t={t} />
      <AboutSportFoSection t={t} />
      <VisionMissionSection t={t} />
      <WhoWeServeSection t={t} />
      <OpportunitiesSection t={t} />
      <PlatformFeaturesSection t={t} />
      <GapSection t={t} />
      <HowSportFoWorksSection t={t} />
      <StatsSection t={t} />
      <ParentsSection t={t} />
      <AthleteStoriesSection t={t} />
    </div>
  );
}
