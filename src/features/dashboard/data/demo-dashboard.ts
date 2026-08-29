// DEVELOPMENT/DEMO-ONLY dashboard filler content.
//
// Every value in this file is fabricated sample content used purely to show
// what the Athlete Dashboard looks like once its still-unbuilt backends
// (opportunities/trials/sponsorships, coach & academy discovery) exist. It
// is rendered ONLY when isDashboardDemoModeEnabled() is true (see
// src/lib/dashboard-demo-mode.ts, gated by NEXT_PUBLIC_DASHBOARD_DEMO_DATA)
// -- with that flag unset or false, none of this is imported into a
// rendered page, and the dashboard shows its real, honest empty states.
//
// This is intentionally isolated from AthleteDashboardData (../types.ts):
// the real data layer (get-athlete-dashboard.ts) never imports this file,
// never merges it into a Supabase query result, and nothing here is ever
// written to a database table. Callers (the dashboard page/components)
// decide per-section whether to use real data or, only in demo mode, this
// fixture -- see AthleteDashboard.tsx's `demo` prop.
//
// Left deliberately un-translated (plain English literals, not run through
// the i18n dictionary): this is dev/demo fixture content, disabled by
// default and never shown in production, not real product copy -- unlike
// every other user-facing string in the app. Only the small amount of real
// "chrome" this feature adds (the "Demo Data" badge and "Demo only" toast)
// goes through the normal dashboard.* i18n namespace.

export type DemoOpportunityTag = "trial" | "sponsor" | "camp";

export interface DemoOpportunity {
  id: string;
  tag: DemoOpportunityTag;
  /** Small caption shown over the placeholder image block, e.g. "MATCH PHOTO". */
  imageCaption: string;
  title: string;
  meta: string;
  ctaLabel: string;
}

export interface DemoCoach {
  id: string;
  name: string;
  subtitle: string;
}

export interface DemoAcademy {
  id: string;
  name: string;
  meta: string;
}

export interface DashboardDemoData {
  metrics: {
    sponsorships: { value: number; helperText: string; ctaLabel: string };
    trials: { value: number; helperText: string; ctaLabel: string };
    invites: { value: number; helperText: string; ctaLabel: string };
  };
  opportunities: DemoOpportunity[];
  myStats: {
    followers: string;
    rank: string;
    medals: string;
  };
  topCoaches: DemoCoach[];
  recommendedAcademies: DemoAcademy[];
  recommendedAcademiesCtaLabel: string;
  /** Pre-formatted for display (e.g. "5,000+") -- these are sample counts,
   *  not real registration totals, so they're strings, not numbers. */
  platformCounts: {
    athletes: string;
    academies: string;
    sponsors: string;
  };
}

export const DASHBOARD_DEMO_DATA: DashboardDemoData = {
  metrics: {
    sponsorships: { value: 3, helperText: "₹1.5L monthly total", ctaLabel: "Manage" },
    trials: { value: 2, helperText: "Next: Mumbai, May 28", ctaLabel: "See schedule" },
    invites: { value: 1, helperText: "Elite Sports Camp · expires 4d", ctaLabel: "Respond" },
  },
  opportunities: [
    {
      id: "demo-trial-mumbai",
      tag: "trial",
      imageCaption: "MATCH PHOTO",
      title: "Football trials — Mumbai",
      meta: "May 28, 2026 · U21 open selection",
      ctaLabel: "Apply now",
    },
    {
      id: "demo-sponsor-gold",
      tag: "sponsor",
      imageCaption: "TROPHY SHOT",
      title: "Gold level sponsorship",
      meta: "₹1,50,000 / month · 12-month term",
      ctaLabel: "View offer",
    },
    {
      id: "demo-camp-elite",
      tag: "camp",
      imageCaption: "TEAM PHOTO",
      title: "Elite sports academy camp",
      meta: "June 10–12 · Bangalore · 40 seats",
      ctaLabel: "Join now",
    },
  ],
  myStats: {
    followers: "8.2K",
    rank: "#7",
    medals: "45",
  },
  topCoaches: [
    { id: "demo-coach-rahul", name: "Rahul Sharma", subtitle: "Cricket coach · Level 3" },
    { id: "demo-coach-anita", name: "Anita Mehra", subtitle: "Athletics coach · Sprint" },
    { id: "demo-coach-dev", name: "Dev Nair", subtitle: "Football coach · U19" },
  ],
  recommendedAcademies: [
    { id: "demo-academy-profit", name: "ProFit Sports Academy", meta: "Pune · 4.8 ★ · 320 athletes" },
    { id: "demo-academy-starkick", name: "Star Kick Soccer School", meta: "Mumbai · 4.6 ★ · 210 athletes" },
    { id: "demo-academy-apex", name: "Apex Athletics Center", meta: "Bangalore · 4.9 ★ · 150 athletes" },
  ],
  recommendedAcademiesCtaLabel: "View all academies",
  platformCounts: {
    athletes: "5,000+",
    academies: "120+",
    sponsors: "150+",
  },
};
