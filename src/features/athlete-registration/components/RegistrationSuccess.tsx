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
        <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
          <Link href="/" className="sm:w-auto">
            <Button type="button" variant="secondary">
              Back to Home
            </Button>
          </Link>
          <Link href="/athlete/profile" className="sm:w-auto">
            <Button type="button" variant="primary">
              View My Profile
            </Button>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
