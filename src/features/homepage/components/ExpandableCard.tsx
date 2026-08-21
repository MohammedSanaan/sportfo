"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

// document.body doesn't exist during SSR. useSyncExternalStore (rather than
// an effect that calls setState) is the lint-clean, React-recommended way to
// read this: the store never actually changes, it just differs between the
// server snapshot (false) and the client snapshot (true) taken after hydration.
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * The homepage's one "profile preview" interaction.
 *
 * Both athlete discovery and opportunities need the same thing: a compact
 * card that becomes the full detail. Deliberately NOT a shared `layoutId`
 * morph: framer-motion's layout-tracked exit measured ~600ms to actually
 * unmount in this stack (framer-motion 13 + React 19 + Next 16 Turbopack) --
 * reproducible, independent of spring/duration tuning -- which meant Escape
 * or a backdrop click *looked* instant-ish but left an invisible, still-
 * interactive overlay blocking the page for over half a second. A plain
 * fade + scale is fast, predictable, and closes exactly when it says it
 * does. If a future framer-motion/React pairing fixes the underlying issue,
 * a shared-element morph can come back as a deliberate upgrade.
 *
 * The modal is portalled to `document.body`. Every caller renders its
 * `<ExpandableCard>` inside a `<Reveal>` (see Reveal.tsx), and `.sf-reveal`
 * animates `transform` on scroll-in -- measured to still report a non-`none`
 * computed transform (a near-identity matrix) long after its transition
 * should have settled. Per spec, ANY ancestor with a non-`none` transform
 * becomes the containing block for `position: fixed` descendants, so an
 * inline-rendered modal was getting trapped inside the small Reveal wrapper
 * box instead of covering the viewport -- content clipped, unreachable, page
 * scroll never restored. Portalling out from under any such ancestor is the
 * correct fix regardless of which specific ancestor misbehaves.
 */
export function ExpandableCard<T>({
  items,
  getId,
  renderCollapsed,
  renderExpanded,
  gridClassName,
  cardClassName,
  // Controlled mode: lets a sibling trigger (e.g. a carousel) open the same
  // panel this grid would. Falls back to internal state when omitted.
  activeId: activeIdProp,
  onActiveChange,
}: {
  items: T[];
  getId: (item: T) => string;
  renderCollapsed: (item: T) => ReactNode;
  renderExpanded: (item: T, close: () => void) => ReactNode;
  gridClassName?: string;
  cardClassName?: string;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
}) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const activeId = activeIdProp !== undefined ? activeIdProp : internalActiveId;
  const setActiveId = onActiveChange ?? setInternalActiveId;
  const reduceMotion = useReducedMotion();
  const active = items.find((item) => getId(item) === activeId) ?? null;

  const mounted = useMounted();

  useEffect(() => {
    if (!activeId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeId, setActiveId]);

  return (
    <>
      <div className={gridClassName}>
        {items.map((item) => {
          const id = getId(item);
          return (
            <motion.button
              key={id}
              type="button"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={() => setActiveId(id)}
              className={cn(
                "text-left focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                cardClassName,
              )}
            >
              {renderCollapsed(item)}
            </motion.button>
          );
        })}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {active && (
              <motion.div
                className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <motion.button
                  type="button"
                  aria-label="Close"
                  onClick={() => setActiveId(null)}
                  className="fixed inset-0 bg-navy-975/65 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <div className="pointer-events-none relative flex min-h-full items-center justify-center p-4 sm:p-8">
                  {/* Capped below viewport height (85vh, or 38rem on tall
                      screens) with its own scroll -- a panel taller than the
                      screen used to just spill past it, relying on the page-
                      level scroll wrapper to reach the rest. Now the panel
                      always fits, and only its own content scrolls if long. */}
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                    className="pointer-events-auto relative flex max-h-[min(85vh,38rem)] w-full max-w-xl flex-col overflow-y-auto overscroll-contain rounded-md bg-surface shadow-[0_32px_80px_-24px_rgba(10,22,40,0.45)]"
                  >
                    {renderExpanded(active, () => setActiveId(null))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
