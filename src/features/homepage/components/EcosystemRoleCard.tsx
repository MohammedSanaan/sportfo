import Image from "next/image";
import Link from "next/link";

interface EcosystemRoleCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  image: { src: string; alt: string };
  // Only the Athletes card gets a real destination (the working /auth ->
  // registration flow). Every other role's CTA is visual-only for this
  // task (see integration report) -- a real <button> with no handler,
  // never a <Link> to a route that doesn't exist yet.
  href?: string;
}

export function EcosystemRoleCard({ title, description, ctaLabel, image, href }: EcosystemRoleCardProps) {
  return (
    <div className="flex flex-col items-center overflow-hidden rounded-lg border border-gray-200 bg-white pb-4 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
      <Image
        src={image.src}
        alt={image.alt}
        width={400}
        height={128}
        className="mb-4 h-32 w-full object-cover"
      />
      <h3 className="mb-1 text-lg font-bold text-stitch-navy">{title}</h3>
      <p className="mb-4 flex-grow px-4 text-sm text-gray-600">{description}</p>
      {href ? (
        <Link
          href={href}
          className="rounded px-6 py-1.5 text-sm font-semibold text-white shadow transition-colors bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2"
        >
          {ctaLabel}
        </Link>
      ) : (
        <button
          type="button"
          className="rounded px-6 py-1.5 text-sm font-semibold text-white shadow transition-colors bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
