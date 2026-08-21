import { Reveal } from "./Reveal";
import { Container, Index, SpecLabel } from "./primitives";
import { ACHIEVEMENTS } from "../data/mock-data";

/**
 * Recognition, kept to one compact strip.
 *
 * Every other section argues that SportFo is useful; this one is the
 * shortest possible proof that the record concept already works — six real
 * lines pulled straight from the profiles above, not another marketing
 * paragraph.
 */
export function RecognitionSection() {
  return (
    <section className="border-y border-white/10 bg-navy-975 py-14 sm:py-16">
      <Container>
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <SpecLabel tone="light">On the record</SpecLabel>
          <p className="max-w-[36ch] text-[13px] text-steel-400 sm:text-right">
            A sample of recognitions verified through SportFo profiles.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((a, i) => (
              <li key={a.id} className="flex items-start gap-3.5 border-t border-white/10 pt-4">
                <Index value={i + 1} tone="light" className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-white">{a.title}</p>
                  <p className="mt-1 truncate text-[12px] text-steel-400">
                    {a.athleteName} · {a.sport} · {a.year}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
