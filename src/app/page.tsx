import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        Build your professional athlete profile with SportFo
      </h1>
      <p className="mt-4 max-w-xl text-base text-ink-500 sm:text-lg">
        Showcase your sports background, achievements, and experience — and
        connect with coaches, academies, and sponsors.
      </p>
      <Link
        href="/auth"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
      >
        Create Your Athlete Profile
      </Link>
    </div>
  );
}
