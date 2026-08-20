import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { ECOSYSTEM_NODES, NETWORK_STATS } from "../data/mock-data";

// Sponsors and Media are in the header nav but have no section of their own,
// so their ecosystem row carries the anchor. The rest are omitted because
// their ids already belong to a full section elsewhere on the page.
const NAV_ANCHORS = new Set(["sponsors", "media"]);

/**
 * The ecosystem, drawn as a network rather than listed as features.
 *
 * Six equal cards would say these parties are six unrelated products. The
 * diagram says what the business actually claims: everyone else on SportFo
 * is oriented around the athlete. The SVG is decorative and hidden from
 * assistive tech — the same relationships are carried by the list beneath
 * it, which is also all that renders on small screens.
 */
export function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      className="relative scroll-mt-16 bg-silver-50 py-20 sm:py-28 lg:py-32"
    >
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SpecLabel>The ecosystem</SpecLabel>
            <Display size="md" className="mt-5 max-w-[18ch]" accent="them.">
              Athletes at the centre. Opportunity around
            </Display>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[34ch] text-sm leading-relaxed text-ink-500">
              Coaches, academies, sponsors, clubs and media all work off the
              same verified record — which is why it is worth an athlete
              keeping it current.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 [&>*]:min-w-0 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <Reveal className="hidden lg:block">
            <EcosystemDiagram />
          </Reveal>

          <Reveal delay={100}>
            <ul className="border-t border-border-default">
              {ECOSYSTEM_NODES.map((node) => (
                <li
                  key={node.id}
                  id={NAV_ANCHORS.has(node.id) ? node.id : undefined}
                  className="group flex scroll-mt-20 items-start gap-5 border-b border-border-default py-4"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[15px] font-semibold text-ink-900">{node.label}</h3>
                      <span className="shrink-0 text-[13px] font-medium text-ink-400 tabular-nums">
                        {node.count}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">
                      {node.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function EcosystemDiagram() {
  const nodes = ECOSYSTEM_NODES.map((node, i) => {
    const angle = (i / ECOSYSTEM_NODES.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      x: 250 + Math.cos(angle) * 172,
      y: 250 + Math.sin(angle) * 172,
    };
  });

  return (
    <div className="relative">
      <svg viewBox="0 0 500 500" aria-hidden className="w-full">
        {/* Measure rings */}
        {[172, 118, 64].map((r) => (
          <circle
            key={r}
            cx="250"
            cy="250"
            r={r}
            fill="none"
            stroke="rgba(11,18,32,0.09)"
            strokeWidth="1"
            strokeDasharray={r === 172 ? undefined : "3 7"}
          />
        ))}

        {nodes.map((node) => (
          <line
            key={node.id}
            x1="250"
            y1="250"
            x2={node.x}
            y2={node.y}
            stroke="rgba(29,79,216,0.22)"
            strokeWidth="1"
          />
        ))}

        {/* Centre — the athlete */}
        <circle cx="250" cy="250" r="58" fill="#0b1220" />
        <circle cx="250" cy="250" r="58" fill="none" stroke="rgba(255,255,255,0.14)" />
        <text
          x="250"
          y="245"
          textAnchor="middle"
          className="fill-white text-[13px] font-semibold"
        >
          Athletes
        </text>
        <text
          x="250"
          y="264"
          textAnchor="middle"
          className="fill-[#8e9cb8] text-[11px] tabular-nums"
        >
          {NETWORK_STATS[0].value}
        </text>

        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="40" fill="#fff" />
            <circle
              cx={node.x}
              cy={node.y}
              r="40"
              fill="none"
              stroke="rgba(11,18,32,0.12)"
            />
            <text
              x={node.x}
              y={node.y - 3}
              textAnchor="middle"
              className="fill-[#0b1220] text-[11.5px] font-semibold"
            >
              {node.label}
            </text>
            <text
              x={node.x}
              y={node.y + 13}
              textAnchor="middle"
              className="fill-[#6b7280] text-[10px] tabular-nums"
            >
              {node.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
