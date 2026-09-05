// Verified SportFo knowledge base for Coach (the AI platform guide, see
// src/features/coach/**). Every fact here is sourced directly from the
// actual app -- src/i18n/translations/en.ts (the canonical dictionary),
// src/lib/registration/categories.ts, and the real route tree under
// src/app/**. Nothing here should be invented: if SportFo doesn't do it
// yet (e.g. a live jobs marketplace or an events/trials system), that is
// recorded explicitly as "not yet available" rather than omitted, so
// Coach can say so honestly instead of guessing.
//
// Keep this file the single source of truth for what Coach knows. When
// new SportFo copy/features land, update here rather than duplicating
// facts inline in the Gemini prompt-building code.

export interface SportfoRoute {
  /** Real, existing Next.js route. Never invent a path that isn't here. */
  path: string;
  label: string;
  description: string;
  /** Signed-in users only. */
  requiresAuth?: boolean;
}

// Every entry corresponds to an actual page under src/app/**. Dynamic
// segments are written with their literal Next.js placeholder syntax
// (e.g. "/a/[slug]") since Coach only ever links to the static routes
// below, never to a specific dynamic instance it can't verify exists.
export const SPORTFO_ROUTES: SportfoRoute[] = [
  { path: "/", label: "Home", description: "The SportFo landing page: what SportFo is, its vision and mission, who it serves, the sports it covers, opportunities, platform features, how it works, and athlete stories." },
  { path: "/register", label: "Register with SportFo", description: "Registration hub. Opens the Athlete registration form by default; use the category links below to register as something else." },
  { path: "/register/athlete", label: "Register as an Athlete", description: "Create an athlete profile: personal details, sports info, achievements, and profile setup." },
  { path: "/register/academy-coach-parent", label: "Register as an Academy / Coach / Parent", description: "For academies, individual coaches, or parents registering on behalf of an athlete." },
  { path: "/register/performance-expert", label: "Register as a Performance Expert", description: "For physios, nutritionists, and other sports performance professionals." },
  { path: "/register/media-creator", label: "Register as Media & Creator", description: "For photographers and content creators covering sports." },
  { path: "/register/management-legal", label: "Register as Sports Management & Legal", description: "For managers, agents, and legal advisors working in sports." },
  { path: "/register/event-operations", label: "Register as Event & Operations Staff", description: "For referees and event coordinators." },
  { path: "/register/sponsor-csr", label: "Register as Sponsor & CSR", description: "For brands and corporate sponsors supporting sports." },
  { path: "/register/talent-analytics", label: "Register for Talent Discovery & Analytics", description: "For talent scouting and sports analytics roles." },
  { path: "/athletes", label: "Discover Athletes", description: "Public directory to search and filter athlete profiles by sport, location, and experience." },
  { path: "/athlete/profile", label: "Your Athlete Profile", description: "View and edit your own athlete profile.", requiresAuth: true },
  { path: "/dashboard", label: "Athlete Dashboard", description: "Your personal SportFo dashboard: profile strength, stats, and platform activity.", requiresAuth: true },
  { path: "/auth", label: "Sign In / Join SportFo", description: "Sign in or create an account by verifying your mobile number." },
  { path: "/stories", label: "Athlete Stories", description: "Real journeys from athletes building their future with SportFo." },
];

export function findRoute(path: string): SportfoRoute | undefined {
  return SPORTFO_ROUTES.find((route) => route.path === path);
}

// Organized to mirror the categories the product spec calls out. Each
// value is plain, verified prose pulled from the app's own copy -- not a
// paraphrase invented for Coach. Where the app is explicit that a
// feature doesn't exist yet (see the "not yet available" fields below),
// that limitation is preserved rather than smoothed over.
export const SPORTFO_KNOWLEDGE = {
  platformOverview: `SportFo is India's first unified sports platform connecting athletes, parents, coaches, academies, colleges, scouts, sponsors, CSR teams, and everyone who powers Indian sports, in one verified ecosystem. Its mission is to identify grassroots talent across India and connect them with the right opportunities, resources, and guidance, on one transparent platform. Tagline: "Building India's Sporting Future, From Grassroots to Glory."`,

  howSportfoWorks: `SportFo works in three broad stages: (1) Discover & enroll -- browse verified academies and coaches across 20+ sports. (2) Train & track -- sessions, milestones, and coach notes build up an athlete's SportFo profile over time. (3) Grow & get seen -- athletes compete and build visibility that can lead to real opportunities. The concrete, working feature today is: create a verified profile (via registration), get discovered (via the Discover Athletes directory and public profile pages), and build a track record over time.`,

  userTypes: {
    athletes: "Players across all sports, including para athletes. Register at /register/athlete or /athlete/register to build a profile.",
    academiesCoachesParents: "Training institutes, individual coaches, and parents registering on behalf of an athlete. Register at /register/academy-coach-parent.",
    performanceExperts: "Physios, nutritionists, and other sports performance professionals. Register at /register/performance-expert.",
    mediaCreators: "Photographers and content creators covering sports. Register at /register/media-creator.",
    managementLegal: "Managers, agents, or legal advisors working in sports. Register at /register/management-legal.",
    eventOperations: "Referees and event coordinators. Register at /register/event-operations.",
    sponsorsCsr: "Brands and corporate sponsors supporting sports. Register at /register/sponsor-csr.",
    talentAnalytics: "Talent discovery and sports analytics roles. Register at /register/talent-analytics.",
  },

  sports: `SportFo covers a wide range of sports across categories including Athletics, Team Sports, Combat Sports, Racquet & Paddle Sports, Water Sports, Adventure Sports, Winter Sports, Para Sports, Indian Indigenous Sports, Yoga & Wellness, and more. The specific sport a person plays is chosen from this catalog during athlete registration and can be browsed on the homepage's sports section.`,

  opportunities: `The Opportunities section on the SportFo homepage describes three planned pillars: Events / Tournaments / Trials & Selections, Sports Jobs, and Courses & Certifications. IMPORTANT: as of now, the buttons for these (e.g. "View Opportunities", "Post a Job", "Explore Courses") are not yet wired up to a live jobs marketplace, events/trials system, or courses catalog -- there is no functioning opportunities feature to browse or apply through yet. If asked about opportunities, be honest that this is part of SportFo's vision and coming roadmap, not something live to use today, and instead point the person toward what IS live: creating a verified profile and being discoverable via /athletes.`,

  community: `SportFo's community spans everyone who shapes an athlete's journey: Sportsman/Athletes (including para athletes), Academies/Coaches & Parents, Performance Experts, Media & Creators, Sports Management & Legal, Event & Operations Staff, Sponsors & CSR, and Talent Discovery & Analytics professionals. Each has its own registration category (see userTypes above).`,

  registration: `To join SportFo, go to /register (or /register/[category] directly), choose the category that matches you, and fill in the category's form. The Athlete category has the fullest flow: personal details, sports information, achievements, and profile photo/setup. Other categories (Academy/Coach/Parent, Performance Expert, Media & Creator, Management & Legal, Event & Operations, Sponsor & CSR, Talent & Analytics) use a shorter, category-specific form. Registration pages are public to view, but you must sign in (mobile number verification at /auth) to actually save/submit -- if you're not signed in yet, the form will prompt you to verify your mobile number first, then bring you back to finish. On successful registration you receive a SportFo ID.`,

  applications: `SportFo does not yet have a separate, distinct "application" system beyond registration -- registering for your category (see "registration" above) IS how you join SportFo today. There is no live jobs/events application pipeline yet (see "opportunities"). If someone asks how to "apply," guide them to register for the category that fits them.`,

  discoverAthletes: `/athletes is SportFo's public athlete directory. Anyone can search and filter registered athlete profiles by sport, location, and experience. Individual athlete profiles are viewable at their public profile link.`,

  dashboard: `Signed-in athletes have a personal Dashboard at /dashboard showing profile strength, stats, and activity. It's a separate, self-contained authenticated experience with its own layout.`,

  authentication: `SportFo sign-in/join is done by verifying a mobile number at /auth -- no separate password-based account system.`,

  support: `SportFo's support contact email is support@sportfo.com. Official social media links are not live yet (shown as "coming soon" in the footer), so Coach should not claim any social handle as active.`,
} as const;

// Compact, plain-text rendering of the knowledge base plus the route
// catalog, suitable for embedding directly in the Gemini system
// instruction (see src/app/api/coach/route.ts). Kept as a single flat
// block rather than a retrieval layer -- the whole knowledge base is
// small enough (well under typical context limits) that sending it in
// full on every request is simpler and more reliable than trying to
// guess which category a question needs.
export function buildKnowledgeContext(): string {
  const routesList = SPORTFO_ROUTES.map(
    (route) => `- ${route.path} -- ${route.label}: ${route.description}${route.requiresAuth ? " (requires sign-in)" : ""}`,
  ).join("\n");

  const knowledgeSections = Object.entries(SPORTFO_KNOWLEDGE)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `### ${key}\n${value}`;
      }
      const nested = Object.entries(value)
        .map(([subKey, subValue]) => `- ${subKey}: ${subValue}`)
        .join("\n");
      return `### ${key}\n${nested}`;
    })
    .join("\n\n");

  return `## Verified SportFo routes (only ever link to these exact paths)\n${routesList}\n\n## Verified SportFo knowledge\n${knowledgeSections}`;
}
