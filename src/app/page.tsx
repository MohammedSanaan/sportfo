import { lexend } from "@/features/homepage/lexend";
import { EcosystemHero } from "@/features/homepage/components/EcosystemHero";
import { WhoWeServeSection } from "@/features/homepage/components/WhoWeServeSection";
import { GapSection } from "@/features/homepage/components/GapSection";
import { StatsSection } from "@/features/homepage/components/StatsSection";
import { ParentsSection } from "@/features/homepage/components/ParentsSection";
import { AthleteStoriesSection } from "@/features/homepage/components/AthleteStoriesSection";

// Landing page body, recreated from the supplied Stitch design (see the
// integration report for section-by-section notes on image/font/CTA
// choices). Section order matches the Stitch source exactly.
export default function Home() {
  return (
    <div className={`${lexend.variable} flex flex-1 flex-col font-stitch text-stitch-text`}>
      <EcosystemHero />
      <WhoWeServeSection />
      <GapSection />
      <StatsSection />
      <ParentsSection />
      <AthleteStoriesSection />
    </div>
  );
}
