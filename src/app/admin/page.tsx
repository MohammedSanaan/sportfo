import { redirect } from "next/navigation";

// /admin with no sub-path is a valid entry point (e.g. from the account
// menu's "View Dashboard" if it ever links here directly, or a bookmarked
// URL) -- land on the one real admin destination. Authorization itself is
// enforced entirely by /admin/dashboard, not here.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
