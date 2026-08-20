import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Real, licensed sports photography (Pexels free-to-use license) for
// atmosphere -- an anonymous silhouette, not a specific identifiable
// person, so nothing here implies a real SportFo athlete or endorsement.
// A navy wash + a restrained radial brand-blue highlight sit on top for
// text contrast, per the brief's "dark/blue image overlay" direction --
// one overlay treatment, not a stack of competing gradients.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl px-6 py-20 text-center sm:px-10 sm:py-24 lg:py-28">
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/images/hero-track.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/72" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,102,240,0.35),_transparent_55%)]" />
      </div>

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
