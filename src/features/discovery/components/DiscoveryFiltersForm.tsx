import { PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import { Button } from "@/components/ui/Button";
import type { DiscoveryFilters } from "@/lib/athlete/discovery";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface DiscoveryFiltersFormProps {
  filters: DiscoveryFilters;
  countries: string[];
  locale: Locale;
}

const controlClassName =
  "h-12 w-full rounded-xl border border-border-strong bg-surface px-3.5 text-sm text-ink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 sm:h-11";

// A plain GET <form> -- no client component, no JS required at all. The
// browser itself does the work of putting q/sport/country/city/skill into
// the URL, which is exactly what makes results shareable, back/forward-
// friendly, and refresh-safe with zero client-side routing code. Filters
// stack one-per-row on mobile (never a crushed multi-column row) and only
// become a horizontal toolbar at sm+.
export function DiscoveryFiltersForm({ filters, countries, locale }: DiscoveryFiltersFormProps) {
  const t = (key: string) => translate(locale, key);
  const skillLevelOptions = translateOptions(t, "options.skillLevel", SKILL_LEVELS);

  return (
    <form
      method="GET"
      action="/athletes"
      className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface p-5 shadow-sm sm:p-6"
    >
      <input
        type="search"
        name="q"
        defaultValue={filters.query ?? ""}
        placeholder={t("athletes.searchPlaceholder")}
        aria-label={t("athletes.searchAriaLabel")}
        className="h-14 w-full rounded-xl border border-border-strong bg-surface-muted px-5 text-base text-ink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          name="sport"
          defaultValue={filters.sport ?? ""}
          aria-label={t("athletes.filterBySport")}
          className={`${controlClassName} sm:w-auto`}
        >
          <option value="">{t("athletes.allSports")}</option>
          {PRIMARY_SPORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          name="country"
          defaultValue={filters.country ?? ""}
          aria-label={t("athletes.filterByCountry")}
          className={`${controlClassName} sm:w-auto`}
        >
          <option value="">{t("athletes.allCountries")}</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="city"
          defaultValue={filters.city ?? ""}
          placeholder={t("athletes.cityPlaceholder")}
          aria-label={t("athletes.cityAriaLabel")}
          className={`${controlClassName} sm:w-36`}
        />

        <select
          name="skill"
          defaultValue={filters.skillLevel ?? ""}
          aria-label={t("athletes.filterBySkillLevel")}
          className={`${controlClassName} sm:w-auto`}
        >
          <option value="">{t("athletes.allSkillLevels")}</option>
          {skillLevelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button type="submit" className="sm:ml-auto">
          {t("athletes.searchButton")}
        </Button>
      </div>
    </form>
  );
}
