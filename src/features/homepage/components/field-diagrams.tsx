import type { SVGProps } from "react";

interface DiagramProps extends SVGProps<SVGSVGElement> {
  sportId: string;
}

/**
 * Court and field markings drawn as technical linework.
 *
 * These are the page's answer to "show eight sports at once". Eight stock
 * action photographs would arrive in eight different colour grades, eras and
 * levels of competition; eight drawings of the actual playing surface arrive
 * as one system, and they say something truer about the product — SportFo
 * treats sport as structure and record, not spectacle.
 *
 * Hairline weights are deliberate. At 0.75–1.1 the marks read as a survey
 * drawing rather than an icon set, which is the whole point.
 */
const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const HAIR = { ...LINE, strokeWidth: 0.75, opacity: 0.55 };
const HEAVY = { ...LINE, strokeWidth: 2 };

function Diagram({ sportId }: { sportId: string }) {
  switch (sportId) {
    case "football":
      return (
        <>
          <rect x="30" y="24" width="340" height="212" {...LINE} />
          <line x1="200" y1="24" x2="200" y2="236" {...LINE} />
          <circle cx="200" cy="130" r="36" {...LINE} />
          <circle cx="200" cy="130" r="2" fill="currentColor" stroke="none" />
          <rect x="30" y="72" width="54" height="116" {...LINE} />
          <rect x="30" y="100" width="20" height="60" {...LINE} />
          <rect x="316" y="72" width="54" height="116" {...LINE} />
          <rect x="350" y="100" width="20" height="60" {...LINE} />
          <path d="M84 104a36 36 0 0 0 0 52" {...LINE} />
          <path d="M316 104a36 36 0 0 1 0 52" {...LINE} />
          <path d="M30 32a8 8 0 0 0 8-8" {...HAIR} />
          <path d="M370 32a8 8 0 0 1-8-8" {...HAIR} />
          <path d="M30 228a8 8 0 0 1 8 8" {...HAIR} />
          <path d="M370 228a8 8 0 0 0-8 8" {...HAIR} />
        </>
      );

    case "basketball":
      return (
        <>
          <rect x="34" y="30" width="332" height="200" {...LINE} />
          <line x1="200" y1="30" x2="200" y2="230" {...LINE} />
          <circle cx="200" cy="130" r="30" {...LINE} />
          <rect x="34" y="100" width="66" height="60" {...LINE} />
          <circle cx="100" cy="130" r="30" {...HAIR} />
          <path d="M34 52a78 78 0 0 1 0 156" {...LINE} />
          <rect x="300" y="100" width="66" height="60" {...LINE} />
          <circle cx="300" cy="130" r="30" {...HAIR} />
          <path d="M366 52a78 78 0 0 0 0 156" {...LINE} />
          <line x1="34" y1="52" x2="52" y2="52" {...LINE} />
          <line x1="34" y1="208" x2="52" y2="208" {...LINE} />
          <line x1="366" y1="52" x2="348" y2="52" {...LINE} />
          <line x1="366" y1="208" x2="348" y2="208" {...LINE} />
        </>
      );

    case "tennis":
      return (
        <>
          <rect x="52" y="34" width="296" height="192" {...LINE} />
          <rect x="52" y="58" width="296" height="144" {...LINE} />
          <line x1="52" y1="130" x2="348" y2="130" {...HEAVY} />
          <line x1="142" y1="58" x2="142" y2="202" {...LINE} />
          <line x1="258" y1="58" x2="258" y2="202" {...LINE} />
          <line x1="142" y1="130" x2="258" y2="130" {...LINE} />
          <line x1="200" y1="34" x2="200" y2="42" {...LINE} />
          <line x1="200" y1="218" x2="200" y2="226" {...LINE} />
          <line x1="52" y1="122" x2="52" y2="138" {...HAIR} />
          <line x1="348" y1="122" x2="348" y2="138" {...HAIR} />
        </>
      );

    case "badminton":
      return (
        <>
          <rect x="76" y="30" width="248" height="200" {...LINE} />
          <line x1="76" y1="130" x2="324" y2="130" {...HEAVY} />
          <line x1="76" y1="94" x2="324" y2="94" {...LINE} />
          <line x1="76" y1="166" x2="324" y2="166" {...LINE} />
          <line x1="76" y1="46" x2="324" y2="46" {...LINE} />
          <line x1="76" y1="214" x2="324" y2="214" {...LINE} />
          <line x1="200" y1="30" x2="200" y2="94" {...LINE} />
          <line x1="200" y1="166" x2="200" y2="230" {...LINE} />
          <line x1="94" y1="30" x2="94" y2="230" {...LINE} />
          <line x1="306" y1="30" x2="306" y2="230" {...LINE} />
          <line x1="76" y1="118" x2="76" y2="142" {...HAIR} />
          <line x1="324" y1="118" x2="324" y2="142" {...HAIR} />
        </>
      );

    case "athletics":
      return (
        <>
          <rect x="34" y="42" width="332" height="176" rx="88" {...LINE} />
          <rect x="52" y="58" width="296" height="144" rx="72" {...HAIR} />
          <rect x="70" y="74" width="260" height="112" rx="56" {...HAIR} />
          <rect x="88" y="90" width="224" height="80" rx="40" {...LINE} />
          <line x1="200" y1="42" x2="200" y2="60" {...LINE} />
          <line x1="200" y1="200" x2="200" y2="218" {...LINE} />
          <rect x="140" y="112" width="120" height="36" rx="18" {...HAIR} />
        </>
      );

    case "swimming":
      return (
        <>
          <rect x="40" y="34" width="320" height="192" {...LINE} />
          {[1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="40"
              y1={34 + i * 32}
              x2="360"
              y2={34 + i * 32}
              {...LINE}
              strokeDasharray="7 7"
            />
          ))}
          <line x1="58" y1="34" x2="58" y2="226" {...HEAVY} />
          <line x1="342" y1="34" x2="342" y2="226" {...HEAVY} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="40"
              y1={50 + i * 32}
              x2="52"
              y2={50 + i * 32}
              {...HAIR}
            />
          ))}
        </>
      );

    case "hockey":
      return (
        <>
          <rect x="30" y="24" width="340" height="212" {...LINE} />
          <line x1="200" y1="24" x2="200" y2="236" {...LINE} />
          <line x1="115" y1="24" x2="115" y2="236" {...HAIR} strokeDasharray="5 6" />
          <line x1="285" y1="24" x2="285" y2="236" {...HAIR} strokeDasharray="5 6" />
          <path d="M30 62a82 82 0 0 1 0 136" {...LINE} />
          <path d="M370 62a82 82 0 0 0 0 136" {...LINE} />
          <path d="M30 78a64 64 0 0 1 0 104" {...HAIR} strokeDasharray="4 6" />
          <path d="M370 78a64 64 0 0 0 0 104" {...HAIR} strokeDasharray="4 6" />
          <line x1="30" y1="112" x2="30" y2="148" {...HEAVY} />
          <line x1="370" y1="112" x2="370" y2="148" {...HEAVY} />
        </>
      );

    case "cricket":
    default:
      return (
        <>
          <ellipse cx="200" cy="130" rx="168" ry="104" {...LINE} />
          <ellipse cx="200" cy="130" rx="112" ry="70" {...HAIR} strokeDasharray="5 7" />
          <rect x="182" y="68" width="36" height="124" {...LINE} />
          <line x1="176" y1="88" x2="224" y2="88" {...LINE} />
          <line x1="176" y1="172" x2="224" y2="172" {...LINE} />
          <line x1="193" y1="82" x2="193" y2="68" {...HEAVY} />
          <line x1="200" y1="82" x2="200" y2="68" {...HEAVY} />
          <line x1="207" y1="82" x2="207" y2="68" {...HEAVY} />
          <line x1="193" y1="178" x2="193" y2="192" {...HEAVY} />
          <line x1="200" y1="178" x2="200" y2="192" {...HEAVY} />
          <line x1="207" y1="178" x2="207" y2="192" {...HEAVY} />
        </>
      );
  }
}

export function FieldDiagram({ sportId, ...svgProps }: DiagramProps) {
  return (
    <svg viewBox="0 0 400 260" {...svgProps}>
      <Diagram sportId={sportId} />
    </svg>
  );
}
