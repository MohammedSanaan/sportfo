import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SportsHeroCarousel, type CarouselImage } from "./SportsHeroCarousel";

// Generic editorial sports photography for atmosphere -- not photos of
// real SportFo athletes. All six are free-to-use (Pexels license),
// deliberately silhouette/backlit shots with no visible team or sponsor
// branding, chosen for one consistent, cinematic golden-hour mood rather
// than a mismatched grab-bag of styles.
const CAROUSEL_IMAGES: CarouselImage[] = [
  { src: "/images/carousel/athletics.jpg", alt: "Athlete sprinting on a running track at sunset" },
  { src: "/images/carousel/football.jpg", alt: "Football player heading the ball on a beach at dusk" },
  { src: "/images/carousel/basketball.jpg", alt: "Basketball player dunking, silhouetted against a sunset sky" },
  { src: "/images/carousel/cricket.jpg", alt: "Cricketer holding a bat, silhouetted against a sunset skyline" },
  { src: "/images/carousel/tennis.jpg", alt: "Tennis player at the net during a sunset match" },
  { src: "/images/carousel/swimming.jpg", alt: "Swimmer diving beneath the water's surface" },
];

export function Hero() {
  return (
    <section className="overflow-hidden rounded-3xl bg-navy-950 px-6 py-14 sm:px-10 sm:py-16 lg:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-14">
        <div className="flex flex-col items-center gap-6 text-center lg:w-1/2 lg:items-start lg:text-left">
          <Badge variant="onDark">Built for athletes</Badge>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build Your Sporting <span className="text-brand-400">Future.</span>
          </h1>

          <p className="max-w-xl text-base text-white/70 sm:text-lg">
            Create your professional athlete identity, showcase your achievements, and get
            discovered by the sporting world.
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

        <div className="w-full lg:w-1/2">
          <SportsHeroCarousel images={CAROUSEL_IMAGES} />
        </div>
      </div>
    </section>
  );
}
