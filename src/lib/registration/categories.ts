// Centralized SportFo registration category catalog.
//
// Single source of truth for the 8 categories reachable from the
// homepage Community section and the /register/[category] hub: their
// route slugs, the i18n keys that describe them, whether they persist to
// Supabase yet, and (for the 7 non-Athlete categories) the field schema
// that drives GenericCategoryForm. Athlete has no `fields` here -- it
// reuses the real, existing AthleteRegistrationForm business logic
// instead of the generic config-driven renderer.

export type RegistrationCategoryId =
  | "athlete"
  | "academyCoachParent"
  | "performanceExpert"
  | "mediaCreator"
  | "managementLegal"
  | "eventOperations"
  | "sponsorCsr"
  | "talentAnalytics";

export type RegistrationFieldType =
  | "text"
  | "url"
  | "number"
  | "select"
  | "multiselect"
  | "file"
  | "photo";

interface RegistrationFieldBase {
  /** camelCase; also the react-hook-form field name and the i18n key
   * segment under registerHub.categories.{id}.fields.{fieldId}. */
  id: string;
  required: boolean;
}

export interface RegistrationTextField extends RegistrationFieldBase {
  type: "text" | "url";
  hasPlaceholder?: boolean;
}

export interface RegistrationNumberField extends RegistrationFieldBase {
  type: "number";
  min: number;
  max: number;
}

export interface RegistrationSelectField extends RegistrationFieldBase {
  type: "select" | "multiselect";
  /** Canonical English option values -- stable, stored/validated as-is.
   * Displayed labels come from registerHub.categories.{id}.fields.{fieldId}.options.{value}. */
  options: string[];
}

export interface RegistrationFileField extends RegistrationFieldBase {
  type: "file";
}

// Uploads to the shared public profile-photos bucket (see
// src/lib/storage/profile-photo.ts) -- never the private
// role-registration-uploads bucket a plain "file" field uses. Individual
// categories show this as "Profile Photo"; organization-oriented ones as
// "Profile Photo / Organization Logo" -- both are just this same field
// type, the wording difference lives entirely in i18n.
export interface RegistrationPhotoField extends RegistrationFieldBase {
  type: "photo";
}

export type RegistrationField =
  | RegistrationTextField
  | RegistrationNumberField
  | RegistrationSelectField
  | RegistrationFileField
  | RegistrationPhotoField;

export interface RegistrationCategoryConfig {
  id: RegistrationCategoryId;
  /** URL segment under /register/{slug}. */
  slug: string;
  /** Reuses home.community.roles.{roleKey} (title/description) for the
   * sidebar label -- the Community section already has these 8 keys. */
  roleKey:
    | "athletes"
    | "academiesCoaches"
    | "performanceExperts"
    | "mediaCreators"
    | "managementLegal"
    | "eventOperations"
    | "sponsorsCsr"
    | "talentAnalytics";
  /** "live" = writes to Supabase today. "pending" = validated UI only;
   * see GenericCategoryForm's pending-persistence notice -- never a faked
   * success screen. */
  persistence: "live" | "pending";
  /** snake_case value stored in registrations.registration_type and passed
   * to the save_role_registration/get_own_role_registration RPCs -- kept
   * distinct from the camelCase `id` used everywhere in the TS/i18n side. */
  registrationType: string;
  /** Absent for athlete (reuses the real AthleteRegistrationForm). */
  fields?: RegistrationField[];
}

const EXPERIENCE_LEVEL_OPTIONS = ["0-2 years", "3-5 years", "6-10 years", "10+ years"];

export const REGISTRATION_CATEGORIES: RegistrationCategoryConfig[] = [
  {
    id: "athlete",
    slug: "athlete",
    roleKey: "athletes",
    persistence: "live",
    registrationType: "athlete",
  },
  {
    id: "academyCoachParent",
    slug: "academy-coach-parent",
    roleKey: "academiesCoaches",
    persistence: "live",
    registrationType: "academy_coach_parent",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "academyCoachName", type: "text", required: true },
      { id: "sportsOffered", type: "text", required: true, hasPlaceholder: true },
      { id: "ageGroupsTrained", type: "text", required: true, hasPlaceholder: true },
      { id: "coachCertification", type: "text", required: false },
      { id: "experienceLevel", type: "select", required: true, options: EXPERIENCE_LEVEL_OPTIONS },
      { id: "location", type: "text", required: true },
      { id: "uploadAcademyInfo", type: "file", required: false },
      { id: "uploadIdProof", type: "file", required: true },
    ],
  },
  {
    id: "performanceExpert",
    slug: "performance-expert",
    roleKey: "performanceExperts",
    persistence: "live",
    registrationType: "performance_expert",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "fullName", type: "text", required: true },
      {
        id: "expertise",
        type: "select",
        required: true,
        options: [
          "Sports Physiotherapist",
          "Nutritionist",
          "Sports Psychologist",
          "Strength & Conditioning",
          "Performance Trainer",
          "Rehabilitation Specialist",
          "Other",
        ],
      },
      { id: "experienceLevel", type: "select", required: true, options: EXPERIENCE_LEVEL_OPTIONS },
      { id: "servicesOffered", type: "text", required: true, hasPlaceholder: true },
      { id: "certifications", type: "text", required: false },
      { id: "location", type: "text", required: true },
      { id: "uploadCertificate", type: "file", required: false },
      { id: "uploadIdProof", type: "file", required: true },
    ],
  },
  {
    id: "mediaCreator",
    slug: "media-creator",
    roleKey: "mediaCreators",
    persistence: "live",
    registrationType: "media_creator",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "fullName", type: "text", required: true },
      { id: "portfolioLink", type: "url", required: false },
      {
        id: "contentType",
        type: "select",
        required: true,
        options: [
          "Photography",
          "Videography",
          "Journalism",
          "Sports Writing",
          "Social Media",
          "Broadcasting",
          "Other",
        ],
      },
      { id: "socialMediaHandles", type: "text", required: false, hasPlaceholder: true },
      { id: "location", type: "text", required: true },
      { id: "uploadPortfolio", type: "file", required: false },
    ],
  },
  {
    id: "managementLegal",
    slug: "management-legal",
    roleKey: "managementLegal",
    persistence: "live",
    registrationType: "management_legal",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "fullName", type: "text", required: true },
      {
        id: "role",
        type: "select",
        required: true,
        options: ["Manager", "Agent", "Lawyer", "Consultant"],
      },
      { id: "licenseNumber", type: "text", required: false },
      { id: "organization", type: "text", required: true },
      { id: "experienceLevel", type: "select", required: true, options: EXPERIENCE_LEVEL_OPTIONS },
      { id: "location", type: "text", required: true },
      { id: "uploadLicense", type: "file", required: false },
      { id: "uploadIdProof", type: "file", required: true },
    ],
  },
  {
    id: "eventOperations",
    slug: "event-operations",
    roleKey: "eventOperations",
    persistence: "live",
    registrationType: "event_operations",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "fullName", type: "text", required: true },
      {
        id: "role",
        type: "select",
        required: true,
        options: ["Referee", "Umpire", "Volunteer", "Coordinator"],
      },
      { id: "certification", type: "text", required: false },
      { id: "experienceYears", type: "number", required: true, min: 0, max: 60 },
      { id: "availability", type: "text", required: true, hasPlaceholder: true },
      { id: "location", type: "text", required: true },
      { id: "uploadIdProof", type: "file", required: true },
    ],
  },
  {
    id: "sponsorCsr",
    slug: "sponsor-csr",
    roleKey: "sponsorsCsr",
    persistence: "live",
    registrationType: "sponsor_csr",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "organizationName", type: "text", required: true },
      { id: "contactPerson", type: "text", required: true },
      {
        id: "sponsorshipInterest",
        type: "multiselect",
        required: true,
        options: [
          "Youth",
          "Women",
          "Grassroots",
          "Para Sports",
          "Academies",
          "Events",
          "Talent Development",
          "Other",
        ],
      },
      {
        id: "budgetRange",
        type: "select",
        required: true,
        options: ["Under ₹1L", "₹1L–5L", "₹5L–25L", "₹25L+"],
      },
      { id: "sportsFocus", type: "text", required: true, hasPlaceholder: true },
      { id: "location", type: "text", required: true },
      { id: "uploadProposal", type: "file", required: false },
      { id: "uploadIdProof", type: "file", required: true },
    ],
  },
  {
    id: "talentAnalytics",
    slug: "talent-analytics",
    roleKey: "talentAnalytics",
    persistence: "live",
    registrationType: "talent_analytics",
    fields: [
      { id: "profilePhoto", type: "photo", required: false },
      { id: "fullName", type: "text", required: true },
      {
        id: "role",
        type: "select",
        required: true,
        options: ["Scout", "Analyst", "Data Expert"],
      },
      { id: "toolsUsed", type: "text", required: true, hasPlaceholder: true },
      { id: "experienceYears", type: "number", required: true, min: 0, max: 60 },
      { id: "sportsSpecialization", type: "text", required: true, hasPlaceholder: true },
      { id: "location", type: "text", required: true },
      { id: "uploadPortfolioReport", type: "file", required: false },
    ],
  },
];

export function getRegistrationCategoryBySlug(slug: string): RegistrationCategoryConfig | undefined {
  return REGISTRATION_CATEGORIES.find((category) => category.slug === slug);
}

// Reverse lookup for the admin dashboard, which only ever has the
// snake_case `registration_type` value stored in the database (never the
// camelCase `id`) to work from.
export function getRegistrationCategoryByType(
  registrationType: string,
): RegistrationCategoryConfig | undefined {
  return REGISTRATION_CATEGORIES.find((category) => category.registrationType === registrationType);
}

// Lookup by the camelCase `id` -- e.g. resolving a stored WelcomePayload's
// roleId (see src/lib/account/welcome-storage.ts) back to a full category
// for its i18n role label.
export function getRegistrationCategoryById(
  id: string,
): RegistrationCategoryConfig | undefined {
  return REGISTRATION_CATEGORIES.find((category) => category.id === id);
}

export const DEFAULT_REGISTRATION_CATEGORY_SLUG = "athlete";

// Where "View Profile" / a post-login landing should point for a category
// that already has a submitted registration. Athlete has a real dedicated
// profile route; the other 7 categories don't have one yet, so their own
// (pre-filled, see /register/[category]/page.tsx) registration form is the
// closest thing to a profile view -- a safe, real route, never a broken
// or invented one. Single source of truth so this mapping is never
// duplicated between the account menu and post-login routing.
export function getProfileHrefForCategory(category: RegistrationCategoryConfig): string {
  return category.id === "athlete" ? "/athlete/profile" : `/register/${category.slug}`;
}
