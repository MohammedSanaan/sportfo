import Link from "next/link";
import { Container } from "./primitives";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Ecosystem",
    links: [
      { label: "Athletes", href: "/#athletes" },
      { label: "Creators", href: "/#creators" },
      { label: "Academies", href: "/#academies" },
      { label: "Sponsors", href: "/#sponsors" },
      { label: "Events", href: "/#events" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Create your profile", href: "/auth" },
      { label: "Sign in", href: "/auth" },
      { label: "Opportunities", href: "/#opportunities" },
      { label: "Athlete registration", href: "/athlete/register" },
    ],
  },
  {
    title: "Sports",
    links: [
      { label: "Cricket", href: "/#athletes" },
      { label: "Football", href: "/#athletes" },
      { label: "Badminton", href: "/#athletes" },
      { label: "Athletics", href: "/#athletes" },
      { label: "All eight", href: "/#athletes" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-975">
      <Container className="py-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-base font-bold tracking-[-0.02em] text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-navy-950">
                SF
              </span>
              SportFo
            </Link>
            <p className="mt-4 text-[13.5px] leading-relaxed text-steel-300">
              The professional record for athletes, and the network of
              coaches, academies, clubs and sponsors built around it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 [&>*]:min-w-0 sm:grid-cols-3 lg:gap-16">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-[10.5px] font-semibold tracking-[0.14em] text-steel-400 uppercase">
                  {column.title}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block py-1 text-[13.5px] text-steel-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-steel-400">
            © {new Date().getFullYear()} SportFo. All rights reserved.
          </p>
          <p className="text-[12px] text-steel-400">
            Sample profiles and figures shown for illustration. Photography
            openly licensed — see{" "}
            <a
              href="/media/CREDITS.json"
              className="underline underline-offset-4 transition-colors hover:text-steel-300"
            >
              credits
            </a>
            .
          </p>
        </div>
      </Container>
    </footer>
  );
}
