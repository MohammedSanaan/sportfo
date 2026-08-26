"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";

export interface CardItem {
  id: string | number;
  title: string;
  subtitle: string;
  imageUrl: string;
}

interface HoverRevealCardsProps {
  items: CardItem[];
  className?: string;
}

export function HoverRevealCards({ items, className }: HoverRevealCardsProps) {
  const [activeId, setActiveId] = React.useState<string | number | null>(null);

  return (
    <div role="list" className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const isDimmed = activeId !== null && !isActive;

        return (
          <div
            key={item.id}
            role="listitem"
            tabIndex={0}
            onMouseEnter={() => setActiveId(item.id)}
            onMouseLeave={() => setActiveId(null)}
            onFocus={() => setActiveId(item.id)}
            onBlur={() => setActiveId(null)}
            className={cn(
              "group relative h-72 overflow-hidden rounded-lg outline-none transition-all duration-500 ease-out",
              "focus-visible:ring-2 focus-visible:ring-stitch-orange focus-visible:ring-offset-2",
              "motion-reduce:transition-none motion-reduce:!scale-100 motion-reduce:!blur-none motion-reduce:!opacity-100",
              isActive && "z-10 scale-[1.04] opacity-100 blur-0",
              isDimmed && "scale-100 opacity-75 blur-[1px]",
              !isActive && !isDimmed && "scale-100 opacity-100 blur-0"
            )}
          >
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stitch-navy/90 via-stitch-navy/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-stitch-orange">
                {item.subtitle}
              </span>
              <h3 className="mt-1 text-lg font-bold leading-snug text-white">{item.title}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
