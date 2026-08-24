import Image from "next/image";

// Single collage photo for the About section (replaces the earlier 15-tile
// photo-wall). Source asset is 735x490 -- keep the card at or below that
// width so the low native resolution never gets upscaled/blurred.
export function SportsMosaic() {
  return (
    <div className="relative mx-auto aspect-[3/2] w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
      <Image
        src="/images/sports-collage.jpg"
        alt="Collage of SportFo athletes across sports"
        fill
        sizes="(min-width: 1024px) 576px, 100vw"
        className="object-cover"
      />

      <div className="absolute right-3 bottom-3 flex flex-col items-center justify-center rounded-xl bg-stitch-navy px-4 py-2 text-center shadow-lg">
        <span className="text-2xl font-bold text-white">15+</span>
        <span className="text-[10px] leading-tight font-semibold tracking-wide text-white/80 uppercase">
          Sports
        </span>
      </div>
    </div>
  );
}
