import { Badge } from "@/components/ui/Badge";

const ECOSYSTEM = [
  { name: "Athletes", status: "live" as const },
  { name: "Academies", status: "soon" as const },
  { name: "Sponsors", status: "soon" as const },
  { name: "Creators", status: "soon" as const },
  { name: "Events", status: "soon" as const },
];

// Deliberately non-interactive -- plain divs, not <Link>s. Only "Athletes"
// is real today; everything else is clearly labeled as roadmap, never
// implying live functionality.
export function FutureEcosystemSection() {
  return (
    <section className="flex flex-col gap-8 rounded-3xl bg-navy-950 px-6 py-16 sm:px-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          The SportFo Ecosystem
        </h2>
        <p className="max-w-xl text-sm text-white/60">
          Athletes can build their profile today. Academies, sponsors, creators, and
          events are part of what we&apos;re building next.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ECOSYSTEM.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center"
          >
            <span className="text-sm font-semibold text-white">{item.name}</span>
            <Badge variant={item.status === "live" ? "success" : "onDark"}>
              {item.status === "live" ? "Live now" : "Coming soon"}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
