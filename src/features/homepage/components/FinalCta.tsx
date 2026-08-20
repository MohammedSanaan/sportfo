import Link from "next/link";
import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";

/**
 * The close. One image, one sentence, one action.
 *
 * The tunnel shot is the only photograph on the page with a figure walking
 * out toward light, which is the argument the section is making.
 */
export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-975">
      <EditorialImage media="tunnel" grade="medium" inset sizes="100vw" className="-z-10" />
      {/* Vignette rather than a flat wash, so the light at the end of the
          tunnel still reads behind the statement. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_58%,transparent,rgba(4,7,15,0.82)_78%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-navy-975/45"
      />

      <Container className="relative py-24 text-center sm:py-32 lg:py-40">
        <Reveal className="flex flex-col items-center">
          <SpecLabel tone="light">Join SportFo</SpecLabel>
          <Display
            as="h2"
            tone="light"
            size="lg"
            className="mt-6 max-w-[20ch]"
            accent="profile."
          >
            Your career in sport starts with a
          </Display>
          <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-steel-300 sm:text-base">
            Build it once. Keep it verified. Put it in front of the people who
            decide who gets the trial, the place and the contract.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-navy-950 transition-colors hover:bg-silver-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-975 focus-visible:outline-none"
            >
              Create your profile
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              I&rsquo;m an academy or sponsor
            </Link>
          </div>

          <p className="mt-7 text-[12.5px] text-steel-300">
            Free for athletes. No feed, no follower count — just the record.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
