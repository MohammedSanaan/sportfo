"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Lets nav items rendered as children (see HeaderNav.tsx) close the panel
// after handling their own click, without this toggle needing to know
// anything about what it's rendering.
const MobileMenuCloseContext = createContext<() => void>(() => {});

export function useCloseMobileMenu() {
  return useContext(MobileMenuCloseContext);
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5.5h14M3 10h14M3 14.5h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5l11 11M15.5 4.5l-11 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Owns only open/closed state and the trigger button; the panel's content
// (Discover Athletes, AuthNav) is passed in as children so it can stay a
// real async Server Component -- this toggle never needs to know what's
// inside it.
export function MobileMenuToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute inset-x-0 top-16 z-30 flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto rounded-b-2xl border-b border-border-default bg-surface px-4 pt-3 pb-4 shadow-xl"
          >
            <MobileMenuCloseContext.Provider value={() => setOpen(false)}>
              {children}
            </MobileMenuCloseContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
