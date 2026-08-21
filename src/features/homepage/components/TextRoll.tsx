"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A single hover moment, not a heading treatment.
 *
 * On hover the label rolls up and a duplicate rolls in from below, in the
 * direction of travel rather than a generic fade. Reserved for one or two
 * CTA labels -- everything else on the page stays typographically still.
 */
export function TextRoll({ children, className }: { children: string; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={`relative inline-block overflow-hidden align-top ${className ?? ""}`}>
      <motion.span
        className="inline-block"
        initial={{ y: 0 }}
        whileHover="hover"
        variants={{ hover: {} }}
      >
        <motion.span
          className="block"
          variants={{ hover: { y: "-100%" } }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        >
          {children}
        </motion.span>
        <motion.span
          aria-hidden
          className="absolute inset-0 block"
          initial={{ y: "100%" }}
          variants={{ hover: { y: 0 } }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        >
          {children}
        </motion.span>
      </motion.span>
    </span>
  );
}
