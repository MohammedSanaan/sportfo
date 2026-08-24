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

// A compact card that expands into a full-detail modal on click. Ported
// from the flow branch's homepage ExpandableCard, adapted to this app's
// design tokens (ink-900/surface/brand-500 instead of navy-975/brand-400).
//
// Deliberately NOT a shared `layoutId` morph -- see the flow branch's
// original note: framer-motion's layout-tracked exit was unreliable in this
// stack. A plain fade + scale is fast, predictable, and closes exactly when
// it says it does.
export function ExpandableCard<T>({
  items,
  getId,
  renderCollapsed,
  renderExpanded,
  gridClassName,
  cardClassName,
  // Controlled mode: lets a sibling trigger open the same panel this grid
  // would. Falls back to internal state when omitted.
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
                  className="fixed inset-0 bg-ink-900/65 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <div className="pointer-events-none relative flex min-h-full items-center justify-center p-4 sm:p-8">
                  {/* Capped below viewport height (85vh, or 38rem on tall
                      screens) with its own scroll -- a panel taller than the
                      screen used to just spill past it, relying on the page-
                      level scroll wrapper to reach the rest. */}
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                    className="pointer-events-auto relative flex max-h-[min(85vh,38rem)] w-full max-w-xl flex-col overflow-y-auto overscroll-contain rounded-2xl bg-surface shadow-[0_32px_80px_-24px_rgba(10,22,40,0.45)]"
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
