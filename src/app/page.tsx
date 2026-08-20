import { createClient } from "@/lib/supabase/server";
import { searchPublicAthletes, parseDiscoveryFilters } from "@/lib/athlete/discovery";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/features/landing/components/Hero";
import { DiscoverAthletesSection } from "@/features/landing/components/DiscoverAthletesSection";
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection";
import { SportingIdentitySection } from "@/features/landing/components/SportingIdentitySection";
import { FutureEcosystemSection } from "@/features/landing/components/FutureEcosystemSection";
import { FinalCtaSection } from "@/features/landing/components/FinalCtaSection";

export default async function Home() {
  const supabase = await createClient();
  // Reuses the same public-safe discovery RPC as /athletes -- no separate
  // query path, no private data, same security model. Only the first 3
  // results (of up to 12 the RPC returns) are shown as a preview.
  const { athletes } = await searchPublicAthletes(supabase, parseDiscoveryFilters({}));

  return (
    <Container className="flex flex-col gap-20 py-10 sm:gap-24 sm:py-14 lg:gap-28">
      <Hero />
      <DiscoverAthletesSection athletes={athletes.slice(0, 3)} />
      <HowItWorksSection />
      <SportingIdentitySection />
      <FutureEcosystemSection />
      <FinalCtaSection />
    </Container>
  );
}
