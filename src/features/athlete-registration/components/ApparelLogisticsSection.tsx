"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select } from "@/components/ui/Select";
import { SectionCard } from "@/components/ui/SectionCard";
import { APPAREL_SIZES, SHORTS_SIZES, SHOE_SIZES } from "@/lib/athlete-options";
import type { AthleteRegistrationFormValues } from "@/types/athlete";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateOptions } from "@/lib/i18n-options";

export function ApparelLogisticsSection() {
  const { t } = useTranslation();
  const { control } = useFormContext<AthleteRegistrationFormValues>();

  const apparelSizeOptions = translateOptions(t, "options.apparelSize", APPAREL_SIZES);
  const shortsSizeOptions = translateOptions(t, "options.apparelSize", SHORTS_SIZES);
  // Shoe size labels are plain numbers (India/UK sizing) -- nothing to
  // translate, but translateOptions is still run for consistency/so a
  // locale could add a suffix later without touching this component.
  const shoeSizeOptions = translateOptions(t, "options.shoeSize", SHOE_SIZES);

  return (
    <SectionCard title={t("register.apparel.title")} description={t("register.apparel.description")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Controller
          name="apparelLogistics.trackSuitSize"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              id="trackSuitSize"
              label={t("register.apparel.trackSuitSize")}
              optional
              options={apparelSizeOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="apparelLogistics.tshirtSize"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              id="tshirtSize"
              label={t("register.apparel.tshirtSize")}
              optional
              options={apparelSizeOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="apparelLogistics.shortsSize"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              id="shortsSize"
              label={t("register.apparel.shortsSize")}
              optional
              options={shortsSizeOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="apparelLogistics.shoeSize"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              id="shoeSize"
              label={t("register.apparel.shoeSize")}
              optional
              options={shoeSizeOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>
    </SectionCard>
  );
}
