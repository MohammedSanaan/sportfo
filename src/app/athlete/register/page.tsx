import type { Metadata } from "next";
import { AthleteRegistrationScreen } from "@/features/athlete-registration/components/AthleteRegistrationScreen";

export const metadata: Metadata = {
  title: "Create Your Athlete Profile | SportFo",
  description:
    "Build your professional sports profile and showcase your talent, experience and achievements.",
};

export default function AthleteRegisterPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <AthleteRegistrationScreen />
    </div>
  );
}
