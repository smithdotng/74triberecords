import { Logo } from "@/components/shell/Logo";
import { pageMeta } from "@/lib/seo";
import { RetryButton } from "@/components/RetryButton";

export const dynamic = "force-static";
export const metadata = pageMeta({ title: "Offline", path: "/offline", noindex: true });

export default function Offline() {
  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-8 sm:px-12">
      <Logo />
      <div className="my-auto max-w-xl">
        <div className="weave mb-10 h-1.5 w-40" aria-hidden />
        <h1 className="display text-6xl">You’re offline</h1>
        <p className="mt-5 text-lg text-sage">Episodes stream from YouTube, so they need a connection. Reconnect and we’ll pick up right where you were.</p>
        <RetryButton />
      </div>
    </div>
  );
}
