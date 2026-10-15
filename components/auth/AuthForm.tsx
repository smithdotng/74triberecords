"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const ERRORS: Record<string, string> = {
  CredentialsSignin: "That email and password don’t match an account. Check them and try again.",
  OAuthAccountNotLinked: "This email is already registered with a password. Sign in with it instead.",
  default: "Sign-in didn’t complete. Try again.",
};

export function AuthForm({ mode, googleEnabled }: { mode: "signin" | "signup"; googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const [error, setError] = useState<string | null>(params.get("error") ? ERRORS[params.get("error")!] ?? ERRORS.default : null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    if (mode === "signup") {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBusy(false);
        return setError(data.error ?? "We couldn’t create your account. Try again.");
      }
    }

    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (!res || res.error) return setError(ERRORS[res?.error ?? ""] ?? ERRORS.CredentialsSignin);
    router.push(callbackUrl);
    router.refresh();
  };

  const isSignup = mode === "signup";
  const other = isSignup ? "/signin" : "/signup";
  const otherHref = callbackUrl !== "/" ? `${other}?callbackUrl=${encodeURIComponent(callbackUrl)}` : other;

  return (
    <div>
      <h1 className="display text-5xl">{isSignup ? "Join the tribe" : "Welcome back"}</h1>
      <p className="mt-3 text-sage">
        {isSignup ? "Create an account to build playlists and keep them on every device." : "Sign in to your playlists and library."}
      </p>

      {googleEnabled && (
        <>
          <button onClick={() => signIn("google", { callbackUrl })} className="btn btn-ghost mt-8 w-full">
            <Icon name="google" size={18} />
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-4 text-xs text-moss">
            <span className="h-px flex-1 bg-seam" />
            or with email
            <span className="h-px flex-1 bg-seam" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={`space-y-4 ${googleEnabled ? "" : "mt-8"}`} noValidate={false}>
        {isSignup && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-sage">
              Your name
            </label>
            <input id="name" name="name" required minLength={2} autoComplete="name" className="field" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-sage">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-sage">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isSignup ? 8 : 1}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="field"
            aria-describedby={isSignup ? "pw-hint" : undefined}
          />
          {isSignup && (
            <p id="pw-hint" className="mt-2 text-xs text-moss">
              At least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </p>
        )}

        <button className="btn btn-brass mt-2 w-full" disabled={busy}>
          {busy ? (isSignup ? "Creating your account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-sm text-sage">
        {isSignup ? "Already have an account? " : "New to 74 Tribe Studios? "}
        <Link href={otherHref} className="font-medium text-brass-soft hover:underline">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
      <p className="mt-3 text-sm">
        <Link href="/" className="text-moss hover:text-ivory">
          Keep browsing without an account
        </Link>
      </p>
    </div>
  );
}

function safeCallback(url: string | null) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}
