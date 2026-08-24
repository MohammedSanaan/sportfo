"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Carousel3D } from "@/components/ui/3d-carousel";

interface GalleryItem {
  key: string;
  name: string;
  image: string;
  description: string;
  discoveryValue: string | null;
}

interface SportsGalleryInteractiveProps {
  items: GalleryItem[];
  viewAthletesLabel: string;
  dragHintLabel: string;
  closeLabel: string;
}

// Thin client boundary around the (also client) Carousel3D: owns only the
// "which card is expanded" state and the expanded-panel copy. Everything
// text-bearing here arrives pre-translated as plain strings from the server
// component above it -- no i18n function crosses the server/client split.
export function SportsGalleryInteractive({
  items,
  viewAthletesLabel,
  dragHintLabel,
  closeLabel,
}: SportsGalleryInteractiveProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const carouselItems = useMemo(
    () => items.map(({ key, name, image }) => ({ key, title: name, image })),
    [items],
  );
  const selected = items.find((item) => item.key === selectedKey) ?? null;

  return (
    <div>
      <div className="h-[260px] sm:h-[300px] lg:h-[340px]">
        <Carousel3D
          items={carouselItems}
          onSelect={(item) => setSelectedKey(item.key)}
          className="h-full"
        />
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">{dragHintLabel}</p>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
          >
            <span className="text-xs font-bold tracking-[0.2em] text-stitch-blue uppercase">
              {selected.name}
            </span>
            <p className="text-base leading-relaxed text-gray-600">{selected.description}</p>
            <div className="mt-2 flex items-center gap-4">
              {selected.discoveryValue && (
                <Link
                  href={`/athletes?sport=${selected.discoveryValue}`}
                  className="inline-flex h-10 items-center justify-center rounded px-5 text-sm font-semibold text-white shadow transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2"
                >
                  {viewAthletesLabel}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                className="text-sm font-medium text-gray-500 underline-offset-4 hover:text-stitch-navy hover:underline"
              >
                {closeLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
