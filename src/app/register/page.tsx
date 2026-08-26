import { redirect } from "next/navigation";
import { DEFAULT_REGISTRATION_CATEGORY_SLUG } from "@/lib/registration/categories";

// /register with no category is a valid entry point (e.g. a bookmarked or
// hand-typed URL) -- land on a real category rather than rendering an
// empty hub with no selected form.
export default function RegisterIndexPage() {
  redirect(`/register/${DEFAULT_REGISTRATION_CATEGORY_SLUG}`);
}
