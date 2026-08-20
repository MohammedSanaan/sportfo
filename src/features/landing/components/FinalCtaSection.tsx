import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinalCtaSection() {
  return (
    <section className="flex flex-col items-center gap-6 rounded-3xl bg-brand-600 px-6 py-16 text-center sm:px-10">
      <h2 className="max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Build Your Athlete Profile
      </h2>
      <p className="max-w-md text-sm text-white/80">
        Join SportFo and create a professional profile that showcases who you are as an
        athlete.
      </p>
      <Link href="/auth">
        <Button size="lg" variant="inverse">
          Get Started
        </Button>
      </Link>
    </section>
  );
}
