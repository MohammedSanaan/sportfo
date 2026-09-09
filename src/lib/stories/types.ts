// Story content is intentionally English-only editorial data (like
// src/lib/athlete/public-profile.ts's real-world profile content) rather
// than i18n dictionary entries -- see src/lib/stories/data.ts for why.

export type StoryContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface Story {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverImage: string;
  heroImage: string;
  imageAlt: string;
  author: string;
  publishedAt: string; // ISO date (YYYY-MM-DD)
  readTimeMinutes: number;
  content: StoryContentBlock[];
  /** Explicit related slugs; falls back to same-category stories when omitted. */
  relatedSlugs?: string[];
}
