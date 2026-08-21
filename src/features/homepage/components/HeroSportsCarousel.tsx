"use client";

import { useEffect, useState } from "react";
import { EditorialImage } from "./EditorialImage";
import { DepthCarousel } from "./DepthCarousel";
import { TiltedCard } from "./TiltedCard";
import { useSportFilter } from "./SportFilterContext";
import { FEATURED_ATHLETES, SPORT_CARDS } from "../data/mock-data";

const DISCOVERY_SPORTS = new Set(FEATURED_ATHLETES.map((a) => a.sport));

// The headline/CTA/stats Reveal chain finishes fading in well under 1s
// (last delay is 260ms, transition 700ms). Starting the slider's own
// entrance at 1.5s -- after that settles, not overlapping it -- is what
// makes it read as a second, deliberate beat rather than a component that
// happened to be sitting there the whole time.
const ENTRANCE_DELAY_MS = 1500;

/**
 * The hero's right-side panel: ten real sports, not a second set of
 * athlete cards. The profile-card language already belongs to Discovery --
 * repeating it here would say "here are more people" when the point of
 * this panel is "here is the range of sport itself." Circular (see
 * DepthCarousel), so there's no dead end at either side.
 *
 * No outer frame. An earlier version wrapped the whole cluster in a
 * bordered, blurred glass panel to fix a contrast complaint -- it worked,
 * but the fix was reported as overcorrecting into "a dark blue rectangle
 * containing barely visible photographs." The actual fix belongs on the
 * photos themselves (grade="vivid", see EditorialImage.tsx) and on each
 * card's own border/shadow; the cards float directly on the hero photo.
 *
 * Hidden below `xl` so the hero's single-column layout on narrower screens
 * is untouched. Anchored toward the bottom of the arena (`items-end` plus
 * a bottom offset) so it settles just above the hero's own bottom divider.
 *
 * `z-10`: without it, the headline paragraph's `<Reveal>` wrapper -- a
 * full-width invisible div, per Reveal.tsx -- was intercepting clicks on
 * this panel's arrows. `.sf-reveal`'s scroll-triggered transform never
 * quite settles to the literal `none` keyword (see ExpandableCard.tsx for
 * the same finding), which is enough to make a transformed element
 * stack like a positioned one; being later in the DOM, it was painting
 * (and catching clicks) above this absolutely-positioned panel by default.
 *
 * Entrance: invisible for the first ENTRANCE_DELAY_MS, then fades/slides up
 * into place (.sf-hero-slider-reveal, globals.css). The interactive
 * carousel itself is only mounted once revealed -- not just faded to
 * opacity:0 -- so it can't be clicked, focused, or silently autoplaying
 * while the hero's still doing its own intro. A plain setTimeout, so this
 * never delays anything else on the page; only the slider's own paint.
 * Drifts to the right on its own once mounted (DepthCarousel's
 * `autoPlayInterval`), pausing on hover/drag, disabled under
 * prefers-reduced-motion (which also skips the entrance delay itself).
 */
export function HeroSportsCarousel() {
  const { setSport } = useSportFilter();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), ENTRANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      data-shown={shown}
      className="sf-hero-slider-reveal pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[32rem] items-end pb-4 xl:flex 2xl:w-[38rem]"
    >
      {shown && (
        <div className="pointer-events-auto w-full">
          <DepthCarousel
            items={SPORT_CARDS}
            getId={(s) => s.id}
            onActivate={(sport) => {
              // Only hand Discovery a sport it actually has profiles for --
              // filtering to one with zero matches would just show an empty
              // register, which is a worse experience than leaving it on
              // whatever was selected (usually "All") and simply scrolling.
              if (DISCOVERY_SPORTS.has(sport.name)) setSport(sport.name);
              document.getElementById("athletes")?.scrollIntoView({ behavior: "smooth" });
            }}
            cardWidthClassName="w-[13.5rem]"
            stageHeightClassName="h-[21.5rem]"
            spacing={98}
            visibleNeighbors={3}
            autoPlayInterval={2800}
            renderItem={(sport, isActive) => (
              <TiltedCard className="h-full w-full" maxTilt={5}>
                <SportCard name={sport.name} photo={sport.photo} isActive={isActive} />
              </TiltedCard>
            )}
          />
        </div>
      )}
    </div>
  );
}

function SportCard({
  name,
  photo,
  isActive,
}: {
  name: string;
  photo: (typeof SPORT_CARDS)[number]["photo"];
  isActive: boolean;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-lg border transition-[border-color,box-shadow] ${
        isActive
          ? "border-ice-300/80 shadow-[0_18px_40px_-14px_rgba(169,198,255,0.4)]"
          : "border-white/35 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* grade="vivid": no navy wash, no cool multiply cast -- the photo
          is the content here, not a backdrop something else sits on top
          of. See EditorialImage.tsx. */}
      <EditorialImage media={photo} grade="vivid" sizes="15rem" inset />
      {/* Just enough of a gradient for the name to read, not a wash over
          the whole photo -- roughly a third of the card, not three
          quarters, and lighter still once a card is in focus. */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-975/95 to-transparent ${
          isActive ? "h-1/4" : "h-[38%]"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[14.5px] font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
          {name}
        </p>
      </div>
    </div>
  );
}
