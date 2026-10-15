import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = pageMeta({ title: "Sign in", description: "Sign in to your 74 Tribe Studios playlists and bookings.", path: "/signin" });

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm mode="signin" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
