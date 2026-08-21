import { Container } from "./primitives";
import { StrokeText } from "./StrokeText";

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
 * One short line, not a second hero. The heading is StrokeText (a restrained
 * outline-draw-then-fill entrance, once, on scroll) rather than the plain
 * Display/SpecLabel pair used elsewhere -- StrokeText owns its own
 * scroll-triggered entrance, so it isn't also wrapped in Reveal (would be a
 * second, redundant entrance animation on the same text).
 */
export function HeroDiscoveryBreak() {
  return (
    <section className="bg-silver-50 py-14 sm:py-16">
      <Container>
        <StrokeText />
      </Container>
    </section>
  );
}
