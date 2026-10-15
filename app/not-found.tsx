import Link from "next/link";
import { Logo } from "@/components/shell/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col px-6 py-8 sm:px-12">
      <Logo />
      <div className="my-auto max-w-xl">
        <div className="weave mb-10 h-1.5 w-40" aria-hidden />
        <h1 className="display text-6xl sm:text-7xl">This page isn’t on air</h1>
        <p className="mt-5 text-lg text-sage">The link may be old, or the episode has been taken down. Everything we’ve published is on the shows page.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/shows" className="btn btn-brass">
            Browse shows
          </Link>
          <Link href="/" className="btn btn-ghost">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
