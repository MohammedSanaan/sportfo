import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export function ProfileActions() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <LogoutButton />
      <Link href="/athlete/register">
        <Button type="button" variant="secondary">
          Edit Profile
        </Button>
      </Link>
    </div>
  );
}
