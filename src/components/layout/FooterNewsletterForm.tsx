"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// No newsletter backend exists yet -- this deliberately never sends the
// email anywhere. Submitting just swaps in an honest "coming soon"
// acknowledgement so the UI is ready for future integration without
// pretending a subscription was recorded.
export function FooterNewsletterForm({
  placeholder,
  submitLabel,
  thanksMessage,
}: {
  placeholder: string;
  submitLabel: string;
  thanksMessage: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <p className="text-sm font-medium text-white/80">{thanksMessage}</p>;
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        {placeholder}
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        placeholder={placeholder}
        className="h-11 w-full min-w-0 rounded-lg border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder:text-white/40 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
      />
      <Button type="submit" variant="inverse" size="md" className="shrink-0">
        {submitLabel}
      </Button>
    </form>
  );
}
