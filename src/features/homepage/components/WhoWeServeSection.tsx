import type { TFunc } from "@/i18n/dictionary";

const ROLE_KEYS = [
  "athletes",
  "academiesCoaches",
  "performanceExperts",
  "mediaCreators",
  "managementLegal",
  "eventOperations",
  "sponsorsCsr",
  "talentAnalytics",
] as const;

// The one role with no supporting line in the original copy -- rendered
// title-only rather than inventing new descriptive copy for it.
const ROLE_KEYS_WITHOUT_DESCRIPTION = new Set<(typeof ROLE_KEYS)[number]>(["talentAnalytics"]);

const ROLE_ICONS = [
  "medal",
  "users",
  "pulse",
  "camera",
  "briefcase",
  "calendar",
  "building",
  "chart",
] as const;

function RoleIcon({ icon }: { icon: (typeof ROLE_ICONS)[number] }) {
  if (icon === "medal") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="15" r="5" strokeWidth="2" />
        <path
          d="M8.5 13.5L6 21l6-3 6 3-2.5-7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (icon === "users") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" strokeWidth="2" />
        <path
          d="M4 19c0-3 2.5-5 5-5s5 2 5 5M15 14c2.2.4 4 2.2 4 5M16 8a3 3 0 10-1-5.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (icon === "pulse") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 12h4l2-7 4 14 2-7h6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (icon === "camera") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <circle cx="12" cy="13" r="3.5" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === "briefcase") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2" />
        <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "calendar") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="16" rx="2" strokeWidth="2" />
        <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === "building") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 21V9l8-5 8 5v12" strokeLinejoin="round" strokeWidth="2" />
        <path d="M9 21v-6h6v6M4 21h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

// Icon-led "sports ecosystem" overview -- reuses GapSection/
// HowSportFoWorksSection's eyebrow-pill/heading/subtitle rhythm and the
// same stitch-card-lift + orange-top-accent card language as every other
// homepage section, just with an icon badge in place of a topping photo.
// Anchor id is "community" (not "who-we-serve") since Header's nav item
// already points at #community.
export function WhoWeServeSection({ t }: { t: TFunc }) {
  const roles = ROLE_KEYS.map((key, i) => ({
    key,
    title: t(`home.community.roles.${key}.title`),
    description: ROLE_KEYS_WITHOUT_DESCRIPTION.has(key)
      ? undefined
      : t(`home.community.roles.${key}.description`),
    icon: ROLE_ICONS[i],
  }));

  return (
    <section id="community" className="scroll-mt-16 bg-stitch-gray px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.community.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl">
          {t("home.community.title")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          {t("home.community.subtitle")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.key}
              className="stitch-card-lift group flex h-full flex-col items-center rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stitch-orange/10 text-stitch-orange transition-colors duration-300 ease-out group-hover:bg-stitch-orange/20">
                <RoleIcon icon={role.icon} />
              </span>

              <h3 className="mt-4 text-base font-bold text-stitch-navy">{role.title}</h3>

              {role.description ? (
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{role.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
