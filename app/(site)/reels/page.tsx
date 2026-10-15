import type { Metadata } from "next";
import Link from "next/link";
import { getReels } from "@/lib/data";
import { ReelsFeed } from "@/components/reels/ReelsFeed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reels", description: "Short clips from every 74 Tribe Studios show." };

export default async function ReelsPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  const reels = (await getReels({ limit: 80 })) ?? [];

  if (!reels.length) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-20">
        <div className="weave mb-10 h-1.5 w-40" aria-hidden />
        <h1 className="display text-5xl">Reels are on their way</h1>
        <p className="mt-5 text-lg text-sage">Short clips from our shows will appear here. In the meantime, every full episode is waiting.</p>
        <Link href="/shows" className="btn btn-brass mt-8 self-start">
          Browse shows
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="sr-only">Reels</h1>
      <ReelsFeed reels={reels} startAt={r} />
    </>
  );
}
