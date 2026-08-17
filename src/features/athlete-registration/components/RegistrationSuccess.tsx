import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";

export function RegistrationSuccess() {
  return (
    <SectionCard title="You're all set">
      <div className="flex flex-col items-start gap-4">
        <p className="text-base text-ink-700">
          Your athlete profile has been created successfully.
        </p>
        <p className="text-sm text-ink-500">
          The full profile page is coming in a future update. For now, you
          can return to the homepage.
        </p>
        <Link href="/">
          <Button type="button" variant="primary">
            Back to Home
          </Button>
        </Link>
      </div>
    </SectionCard>
  );
}
