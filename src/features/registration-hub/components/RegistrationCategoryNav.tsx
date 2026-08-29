import Link from "next/link";
import { cn } from "@/lib/cn";
import { REGISTRATION_CATEGORIES, type RegistrationCategoryId } from "@/lib/registration/categories";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";
import { CategoryIcon } from "./CategoryIcon";

interface RegistrationCategoryNavProps {
  activeCategoryId: RegistrationCategoryId;
  locale: Locale;
}

// Category switching is pure URL navigation (real <Link>s, not client
// state) -- direct URL entry, refresh, and the sidebar/mobile switcher all
// stay trivially in sync because the active category is derived from the
// route itself. Sidebar labels reuse home.community.roles.{roleKey}.title,
// the same 8 category names already translated for the homepage Community
// section, rather than duplicating them under a second key.
export function RegistrationCategoryNav({ activeCategoryId, locale }: RegistrationCategoryNavProps) {
  const items = REGISTRATION_CATEGORIES.map((category) => ({
    ...category,
    label: translate(locale, `home.community.roles.${category.roleKey}.title`),
  }));
  const navLabel = translate(locale, "registerHub.chooseCategory");

  return (
    <>
      {/* Desktop: vertical sidebar, sticky under the page header. Rendered
          as a grid item (the page sets the column's width via
          `grid-cols-[280px_...]`), so this only needs to fill that cell --
          no separate fixed width/shrink of its own to keep in sync with
          the grid track. */}
      <nav aria-label={navLabel} className="hidden lg:block lg:w-full">
        <div className="sticky top-24 flex flex-col gap-2">
          {items.map((item) => {
            const active = item.id === activeCategoryId;
            return (
              <Link
                key={item.id}
                href={`/register/${item.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-md"
                    : "border-border-default bg-surface text-ink-700 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md",
                )}
              >
                <CategoryIcon
                  category={item.id}
                  className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-brand-600")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile/tablet: compact horizontally-scrolling switcher above the
          form -- scrolls internally, never widens the page. */}
      <nav aria-label={navLabel} className="lg:hidden">
        <p className="mb-3 text-sm font-semibold text-ink-500">{navLabel}</p>
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <ul className="flex w-max gap-2">
            {items.map((item) => {
              const active = item.id === activeCategoryId;
              return (
                <li key={item.id}>
                  <Link
                    href={`/register/${item.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                      active
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-border-default bg-surface text-ink-700",
                    )}
                  >
                    <CategoryIcon
                      category={item.id}
                      className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-brand-600")}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
