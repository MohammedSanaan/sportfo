"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A restrained pointer-tilt wrapper, not a showpiece.
 *
 * SportFo's brief calls for "subtle, purposeful" motion -- so the tilt range
 * here is intentionally small (default 6deg) and spring-damped rather than
 * snappy, closer to a card catching light than a demo effect. Disabled
 * outright under prefers-reduced-motion rather than just slowed down.
 */
export function TiltedCard({
  children,
  className,
  maxTilt = 6,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const scale = useSpring(useMotionValue(1), { stiffness: 220, damping: 22 });

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("[perspective:1000px]", className)}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * maxTilt * 2);
        rotateX.set(py * -maxTilt * 2);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        scale.set(1);
      }}
      onPointerEnter={() => scale.set(1.015)}
    >
      <motion.div
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
