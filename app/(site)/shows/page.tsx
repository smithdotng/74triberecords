import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLatestEpisodes, getShows } from "@/lib/data";
import { ShowTile } from "@/components/ShowTile";
import { EmptyCatalogue } from "@/components/EmptyCatalogue";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMeta({
  title: "Shows",
  description: "Every series recorded at 74 Tribe Studios — conversations on culture, business, faith, money and the arts.",
  path: "/shows",
});

export default async function ShowsPage() {
  const [shows, latest] = await Promise.all([getShows(), getLatestEpisodes(60)]);
  if (!shows?.length) return <EmptyCatalogue />;
  const firstThumb = Object.fromEntries((latest ?? []).reverse().map((e) => [e.showSlug, e.thumbnail]));

  return (
    <div className="px-5 pt-12 lg:px-10 lg:pt-20">
      <header className="max-w-2xl">
        <h1 className="display text-5xl sm:text-7xl">Shows</h1>
        <p className="mt-5 text-lg leading-relaxed text-sage">
          Every series recorded at 74 Tribe Studios. Choose one to watch its full run of episodes.
        </p>
      </header>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:mt-16 lg:grid-cols-4 lg:gap-x-6 2xl:grid-cols-5">
        {shows.map((s) => (
          <ShowTile key={s.slug} show={s} fallbackImage={firstThumb[s.slug]} size="lg" />
        ))}
      </div>
    </div>
  );
}
