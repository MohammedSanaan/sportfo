import { Hero } from "@/features/homepage/components/Hero";
import { RecordSection } from "@/features/homepage/components/RecordSection";
import { SportsShowcase } from "@/features/homepage/components/SportsShowcase";
import { EcosystemSection } from "@/features/homepage/components/EcosystemSection";
import { DiscoverySection } from "@/features/homepage/components/DiscoverySection";
import { OpportunitiesSection } from "@/features/homepage/components/OpportunitiesSection";
import { VoicesSection } from "@/features/homepage/components/VoicesSection";
import { EventsSection } from "@/features/homepage/components/EventsSection";
import { FinalCta } from "@/features/homepage/components/FinalCta";
import { Footer } from "@/features/homepage/components/Footer";

// Section order is the page's argument, and the rhythm is deliberate:
// dark photography, light product, dark index, light diagram, dark register,
// light board, light band, light calendar, dark close. No two adjacent
// sections share a layout or a background.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <RecordSection />
      <SportsShowcase />
      <EcosystemSection />
      <DiscoverySection />
      <OpportunitiesSection />
      <VoicesSection />
      <EventsSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
