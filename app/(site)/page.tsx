import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { getLatestEpisodes, getReels, getShowEpisodes, getShows } from "@/lib/data";
import { ReelRail } from "@/components/reels/ReelRail";
import { SetPlan } from "@/components/studio/SetPlan";
import { formatDate, formatLongDuration } from "@/lib/format";
import { PlayButton } from "@/components/player/PlayButton";
import { AddToPlaylist } from "@/components/AddToPlaylist";
import { ShowTile } from "@/components/ShowTile";
import { EpisodeRail } from "@/components/EpisodeRail";
import { EpisodeList } from "@/components/EpisodeList";
import { ContinueWatching } from "@/components/ContinueWatching";
import { Thumb } from "@/components/ui/Thumb";
import { EmptyCatalogue } from "@/components/EmptyCatalogue";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMeta({ path: "/" });

export default async function Home() {
  const shows = (await getShows()) ?? [];
  if (!shows.length) return <EmptyCatalogue />;

  const featuredShow = shows.find((s) => s.featured) ?? shows[0];
  const [featuredEpisodes, latest, reels] = await Promise.all([
    getShowEpisodes(featuredShow.slug),
    getLatestEpisodes(20),
    getReels({ limit: 12 }),
  ]);
  const hero = featuredEpisodes?.[0] ?? latest?.[0];
  const latestList = latest ?? [];

  // First episode thumbnail per show, used when a show has no cover artwork yet
  const firstThumb = Object.fromEntries(latestList.map((e) => [e.showSlug, e.thumbnail]));

  return (
    <>
      {hero && (
        <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
          <div className="hero-art relative aspect-video w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[68%]">
            <Thumb src={hero.thumbnail} eager className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/10 to-transparent lg:bg-linear-to-r lg:from-ink lg:via-ink/50 lg:to-transparent" />
            <div className="absolute inset-0 hidden bg-linear-to-t from-ink via-transparent to-transparent lg:block" />
          </div>

          <div className="relative px-5 pb-10 lg:flex lg:min-h-[min(78vh,760px)] lg:items-end lg:px-10 lg:pt-28 lg:pb-16">
            <div className="max-w-2xl">
              <p className="hero-line mb-4 text-sage" style={{ animationDelay: "0.1s" }}>
                <Link href={`/shows/${featuredShow.slug}`} className="hover:text-ivory">
                  {hero.showTitle}
                </Link>
                <span className="mx-3 inline-block h-px w-6 translate-y-[-4px] bg-brass/70" aria-hidden />
                <span className="text-moss">Latest episode</span>
              </p>
              <h1
                id="hero-title"
                className="hero-line display text-[2.75rem] text-balance sm:text-6xl lg:text-[5.25rem]"
                style={{ animationDelay: "0.2s" }}
              >
                {hero.title}
              </h1>
              <p
                className="hero-line mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-sage"
                style={{ animationDelay: "0.35s" }}
              >
                {featuredShow.tagline || hero.description.split("\n")[0].slice(0, 180)}
              </p>
              <div className="hero-line mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.5s" }}>
                <PlayButton episode={hero} queue={featuredEpisodes ?? undefined} label="Play episode" />
                <AddToPlaylist episode={hero} variant="button" />
                <span className="ml-1 text-sm text-moss">
                  {[formatLongDuration(hero.durationSeconds), formatDate(hero.publishedAt)].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>
          </div>
          <div className="hero-weave weave mx-5 h-2 lg:mx-10" aria-hidden />
        </section>
      )}

      <div className="px-5 lg:px-10">
        <ContinueWatching />

        <section className="mt-16" aria-labelledby="shows-heading">
          <div className="mb-7 flex items-end justify-between gap-6">
            <h2 id="shows-heading" className="display text-[1.9rem] sm:text-4xl">
              Our shows
            </h2>
            <Link href="/shows" className="text-sm text-sage hover:text-brass-soft">
              See all shows
            </Link>
          </div>
          <div className="scroll-row -mx-5 scroll-px-5 lg:scroll-px-10 auto-cols-[62%] gap-4 px-5 sm:auto-cols-[38%] md:auto-cols-[30%] lg:-mx-10 lg:auto-cols-[calc((100%-4*1.25rem)/5)] lg:gap-5 lg:px-10">
            {shows.map((s) => (
              <ShowTile key={s.slug} show={s} fallbackImage={firstThumb[s.slug]} />
            ))}
          </div>
        </section>

        <ReelRail reels={reels ?? []} title="Reels" />

        {latestList.length > 0 && (
          <section className="mt-16" aria-labelledby="new-heading">
            <h2 id="new-heading" className="display mb-7 text-[1.9rem] sm:text-4xl">
              New from the studio
            </h2>
            <EpisodeRail episodes={latestList.slice(0, 8)} />
          </section>
        )}

        <section className="mt-20 overflow-hidden rounded-xl border hairline bg-room/50" aria-labelledby="studio-band">
          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
            <div>
              <h2 id="studio-band" className="display text-4xl text-balance sm:text-5xl">
                Record your show at 74 Tribe Studios
              </h2>
              <p className="mt-4 max-w-xl text-lg text-sage">
                Lounge, coffee table, news and full sets, a world-class recording studio, meeting rooms and lounges — ready for your next episode.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/book" className="btn btn-brass">
                  Book a session
                </Link>
                <Link href="/about" className="btn btn-ghost">
                  Tour the studio
                </Link>
              </div>
            </div>
            <div className="text-brass/80">
              <SetPlan slug="lounge-set" className="w-full" />
            </div>
          </div>
        </section>

        {latestList.length > 8 && (
          <section className="mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-14" aria-labelledby="archive-heading">
            <div className="mb-6 lg:mb-0">
              <h2 id="archive-heading" className="display text-[1.9rem] sm:text-4xl">
                From the archive
              </h2>
              <p className="mt-3 max-w-xs text-sage">Earlier episodes across every show. Save any of them to a playlist for later.</p>
            </div>
            <EpisodeList episodes={latestList.slice(8, 20)} />
          </section>
        )}
      </div>
    </>
  );
}
