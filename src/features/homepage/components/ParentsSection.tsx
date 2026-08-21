import type { TFunc } from "@/i18n/dictionary";

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-stitch-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function StripIcon({ icon }: { icon: "check" | "people" | "monitor" }) {
  if (icon === "check") {
    return (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (icon === "people") {
    return (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ParentsSection({ t }: { t: TFunc }) {
  const checklistColumns: string[][] = [
    [t("home.parents.checklist1"), t("home.parents.checklist2")],
    [t("home.parents.checklist3"), t("home.parents.checklist4")],
    [t("home.parents.checklist5"), t("home.parents.checklist6")],
  ];

  const featureStrip: { value: string; label: string; icon: "check" | "people" | "monitor" }[] = [
    { value: "7/7", label: t("home.parents.coachScreening"), icon: "check" },
    { value: "1:1", label: t("home.parents.parentSupport"), icon: "people" },
    { value: "100%", label: t("home.parents.progressVisibility"), icon: "monitor" },
  ];

  return (
    <section className="bg-stitch-gray py-10">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gray-300 md:w-32" />
          <h2 className="text-2xl font-bold text-stitch-navy">{t("home.parents.heading")}</h2>
          <div className="h-px w-16 bg-gray-300 md:w-32" />
        </div>

        <div className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-x-4 gap-y-4 text-left md:grid-cols-3">
          {checklistColumns.map((column, i) => (
            <ul key={i} className="space-y-2">
              {column.map((item) => (
                <li key={item} className="flex items-center gap-2 font-medium text-stitch-navy">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="border-y border-gray-300 bg-gray-200 py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center divide-x divide-gray-400 px-4 text-stitch-navy">
          {featureStrip.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-6 py-2">
              <span className="rounded-full bg-stitch-navy p-2 text-white">
                <StripIcon icon={item.icon} />
              </span>
              <div className="text-left">
                <div className="text-xl font-bold">{item.value}</div>
                <div className="text-sm">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
