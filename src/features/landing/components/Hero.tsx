import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Deliberately abstract, not photographic: no stock/AI athlete photography
// is available in this codebase, and fabricating "athlete" imagery would
// risk implying real users. The energy comes from a deep navy surface, a
// restrained radial brand-blue highlight, and a faint diagonal line
// texture (evoking a track/motion, not a literal photo) -- one subtle
// gradient, not a stack of them.
function HeroBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden rounded-3xl bg-navy-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,102,240,0.35),_transparent_55%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none">
        <defs>
          <pattern id="hero-lines" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="28" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-lines)" />
      </svg>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl px-6 py-20 text-center sm:px-10 sm:py-24 lg:py-28">
      <HeroBackground />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <Badge variant="onDark">Built for athletes. Designed for opportunity.</Badge>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Build Your Sporting Future.
        </h1>

        <p className="max-w-xl text-base text-white/70 sm:text-lg">
          Create your professional athlete identity. Showcase your achievements. Get discovered.
        </p>

        <div className="mt-2 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/auth" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Create Athlete Profile
            </Button>
          </Link>
          <Link href="/athletes" className="w-full sm:w-auto">
            <Button variant="outlineOnDark" size="lg" className="w-full sm:w-auto">
              Discover Athletes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
