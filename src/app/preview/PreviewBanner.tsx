import Link from "next/link";

export function PreviewBanner({ label }: { label: string }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
      Preview mode — {label}.{" "}
      <Link href="/preview" className="underline">
        All previews
      </Link>
    </div>
  );
}
