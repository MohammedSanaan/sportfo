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

// White-background FAQ section, two-column: a left-aligned "FAQs"
// heading/description (vertically centered against the list) and a
// right-hand divider-based accordion at ~60% width. Same composition as
// the original navy version -- only the surface color changed.
export function TextRevealFaqs() {
  const [openValue, setOpenValue] = useState<string | undefined>(undefined);

  return (
    <section id="faq" className="scroll-mt-16 bg-white px-4 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[35%_65%] lg:gap-16">
        <div className="lg:flex lg:flex-col lg:justify-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-stitch-blue" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[0.2em] text-stitch-blue uppercase">
              SportFo
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl lg:text-[46px]">
            FAQs
          </h2>
          <p className="mt-4 max-w-[380px] text-base leading-[1.75] text-gray-500 sm:text-[17px]">
            Answers to common questions about profiles, discovery, opportunities, and the
            SportFo network.
          </p>
        </div>

        <div>
          <Accordion
            type="single"
            collapsible
            value={openValue}
            onValueChange={setOpenValue}
            className="divide-y divide-gray-200 border-t border-b border-gray-200"
          >
            {FAQS.map((faq, i) => {
              const value = `faq-${i}`;
              const active = openValue === value;

              return (
                <AccordionItem key={value} value={value} className="border-gray-200">
                  <AccordionTrigger className="-mx-4 px-4 text-base font-semibold text-[#111111] transition-colors hover:bg-gray-50 hover:text-stitch-blue sm:text-lg [&>svg]:text-gray-400 hover:[&>svg]:text-stitch-blue">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="border-l-2 border-stitch-blue/30 pl-4">
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
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
