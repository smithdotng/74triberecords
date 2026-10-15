import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = pageMeta({
  title: "Create an account",
  description: "Join 74 Tribe Studios to build playlists and keep track of your studio bookings.",
  path: "/signup",
});

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
