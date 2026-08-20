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
          Your professional athlete profile is ready to view and share.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/athlete/me">
            <Button type="button" variant="primary">
              View My Profile
            </Button>
          </Link>
          <Link href="/">
            <Button type="button" variant="secondary">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
