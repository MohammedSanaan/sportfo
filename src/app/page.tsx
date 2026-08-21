import { Hero } from "@/features/homepage/components/Hero";
import { HeroDiscoveryBreak } from "@/features/homepage/components/HeroDiscoveryBreak";
import { DiscoverySection } from "@/features/homepage/components/DiscoverySection";
import { OpportunitiesSection } from "@/features/homepage/components/OpportunitiesSection";
import { EventsSection } from "@/features/homepage/components/EventsSection";
import { RecognitionSection } from "@/features/homepage/components/RecognitionSection";
import { VoicesSection } from "@/features/homepage/components/VoicesSection";
import { FinalCta } from "@/features/homepage/components/FinalCta";
import { Footer } from "@/features/homepage/components/Footer";
import { SportFilterProvider } from "@/features/homepage/components/SportFilterContext";

// Section order follows what a visitor can actually do, not an explanation
// of the ecosystem: people and profiles first, then opportunities, then
// events, then the shortest possible proof (Recognition) before the close.
// Rhythm stays deliberate — dark photography, light product, dark register,
// light board, light calendar, dark proof strip, light band, dark close.
export default function Home() {
  return (
    <SportFilterProvider>
      <div className="flex flex-1 flex-col">
        <Hero />
        <HeroDiscoveryBreak />
        <DiscoverySection />
        <OpportunitiesSection />
        <EventsSection />
        <RecognitionSection />
        <VoicesSection />
        <FinalCta />
        <Footer />
      </div>
    </SportFilterProvider>
  );
}
