import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";

/**
 * The seam between the hero and Discovery.
 *
 * Hero and Discovery are both dark (navy-975, navy-900) with only a hairline
 * border between them -- not enough of a break for Discover Athletes to
 * read as its own section rather than a continuation of the arena. This is
 * a light band dropped between the two: it breaks the dark continuity on
 * BOTH sides at once (dark-to-light entering, light-to-dark leaving), which
 * does more for the seam than nudging one shade of navy against another.
 *
 * One short line, not a second hero. No ParticleText here -- it doesn't
 * exist yet in this codebase (checked: no component, no canvas dependency),
 * and building a canvas particle system from scratch is the kind of "flashy
 * animation section" this brief explicitly asked to avoid. Same italic-
 * accent Display pattern used by every other section on the page.
 */
export function HeroDiscoveryBreak() {
  return (
    <section className="bg-silver-50 py-14 sm:py-16">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <SpecLabel>SportFo</SpecLabel>
          <Display size="sm" className="max-w-[22ch]" accent="discovered.">
            Talent deserves to be
          </Display>
        </Reveal>
      </Container>
    </section>
  );
}
