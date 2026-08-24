"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Faq = {
  question: string;
  answer: string;
};

const FAQS: Faq[] = [
  {
    question: "What is SportFo?",
    answer:
      "SportFo is a professional sports network where athletes can build verified profiles, showcase their achievements, get discovered, and connect with opportunities across the sports ecosystem.",
  },
  {
    question: "Who can join SportFo?",
    answer:
      "Athletes, creators, coaches, academies, sponsors, employers, and other sports professionals can join SportFo and build their presence within the sports ecosystem.",
  },
  {
    question: "How can athletes get discovered?",
    answer:
      "Athletes can create a professional profile with their sport, skill level, achievements, rankings, location, and other relevant information. Academies, coaches, sponsors, and sports organizations can then discover relevant talent.",
  },
  {
    question: "Can I showcase my achievements?",
    answer:
      "Yes. Athletes can add their sporting achievements, awards, recognition, and supporting documents to their profile so their performance history can be presented professionally.",
  },
  {
    question: "Can athletes find sports opportunities on SportFo?",
    answer:
      "Yes. SportFo is designed to connect athletes with relevant opportunities such as trials, scholarships, sponsorships, sports jobs, academies, and other professional opportunities.",
  },
  {
    question: "Can academies and sponsors find athletes?",
    answer:
      "Yes. Academies, coaches, sponsors, and organizations can use SportFo to discover athletes based on relevant information such as sport, location, skill level, ranking, and verification.",
  },
  {
    question: "Is my athlete profile verified?",
    answer:
      "SportFo supports verified athlete profiles. Verification status can be displayed on the athlete's profile so organizations can distinguish verified information from an unverified profile.",
  },
  {
    question: "Is SportFo only for athletes?",
    answer:
      "No. Athletes are the primary focus, but SportFo is designed as a broader sports ecosystem connecting athletes, creators, academies, sponsors, employers, events, and sports professionals.",
  },
];

// Splits an answer into words and staggers each one in with a gentle
// blur-to-clear reveal as the accordion panel opens. Per-word delay is kept
// small (8ms) so a full answer settles in roughly 400-600ms regardless of
// length, rather than a slow typewriter effect. Falls back to a plain
// paragraph when the user prefers reduced motion.
function BlurredStagger({ text, active }: { text: string; active: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <p className="text-[15px] leading-relaxed text-gray-500">{text}</p>;
  }

  return (
    <p className="text-[15px] leading-relaxed text-gray-500">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={active ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.35, delay: i * 0.008, ease: "easeOut" }}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </p>
  );
}

// White-background FAQ section, stacked vertically: a centered "FAQs"
// heading/description on top, followed by a single centered column of
// card-style accordion items below. Premium touches: soft elevated cards
// that lift in on scroll, a numbered index that fills solid when open, an
// accessible focus ring, ambient background glows, and a closing CTA for
// anything the list didn't answer.
export function TextRevealFaqs() {
  const [openValue, setOpenValue] = useState<string | undefined>(undefined);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="faq"
      className="scroll-mt-16 relative overflow-hidden bg-white px-4 py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-stitch-blue/[0.07] blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-[300px] w-[560px] -translate-x-1/2 rounded-full bg-stitch-orange/[0.05] blur-[100px]"
      />

      <div className="relative mx-auto flex max-w-[760px] flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-stitch-blue/20 bg-stitch-blue/[0.05] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-stitch-blue uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-stitch-blue" aria-hidden="true" />
          FAQ
        </span>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl lg:text-[46px]">
          Frequently asked questions
        </h2>
        <p className="mt-4 max-w-[480px] text-base leading-[1.75] text-gray-500 sm:text-[17px]">
          Answers to common questions about profiles, discovery, opportunities, and the
          SportFo network.
        </p>

        <Accordion
          type="single"
          collapsible
          value={openValue}
          onValueChange={setOpenValue}
          className="mt-12 flex w-full flex-col gap-3"
        >
          {FAQS.map((faq, i) => {
            const value = `faq-${i}`;
            const active = openValue === value;

            return (
              <motion.div
                key={value}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.05, ease: "easeOut" }}
              >
                <AccordionItem
                  value={value}
                  className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all duration-300 ${
                    active
                      ? "border-stitch-blue/30 shadow-md shadow-stitch-blue/[0.08]"
                      : "border-gray-200 hover:border-stitch-blue/20 hover:shadow-md"
                  }`}
                >
                  <AccordionTrigger className="gap-4 rounded-2xl px-5 py-4 text-base font-semibold text-[#111111] transition-colors hover:text-stitch-blue focus-visible:ring-2 focus-visible:ring-stitch-blue/40 focus-visible:ring-offset-2 sm:px-6 sm:py-5 sm:text-lg [&>svg]:text-gray-400 hover:[&>svg]:text-stitch-blue">
                    <span className="flex items-center gap-4">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                          active
                            ? "bg-stitch-blue text-white"
                            : "bg-stitch-blue/10 text-stitch-blue"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-5 pb-4 pl-[68px] sm:px-6 sm:pl-[76px]">
                      <AnimatePresence mode="wait">
                        {active ? (
                          <BlurredStagger key={value} text={faq.answer} active={active} />
                        ) : (
                          <p className="text-[15px] leading-relaxed text-gray-500">{faq.answer}</p>
                        )}
                      </AnimatePresence>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 px-6 py-6 sm:flex-row sm:justify-between sm:gap-6 sm:px-8">
          <p className="text-sm leading-relaxed text-gray-500 sm:text-left">
            Still have questions?{" "}
            <span className="font-medium text-[#111111]">We&apos;re happy to help.</span>
          </p>
          <a
            href="mailto:support@sportfo.com"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-stitch-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-stitch-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-blue/40 focus-visible:ring-offset-2"
          >
            Contact support
          </a>
        </div>
      </div>
    </section>
  );
}
