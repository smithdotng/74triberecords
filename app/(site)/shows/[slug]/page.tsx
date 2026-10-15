import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getReels, getShow, getShowEpisodes } from "@/lib/data";
import { ReelRail } from "@/components/reels/ReelRail";
import { syncIfStale } from "@/lib/youtube";
import { formatLongDuration } from "@/lib/format";
import { PlayButton } from "@/components/player/PlayButton";
import { EpisodeList } from "@/components/EpisodeList";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const show = await getShow((await params).slug);
  if (!show) return { title: "Show not found" };
  return {
    title: show.title,
    description: show.tagline || show.description.slice(0, 160),
    openGraph: show.coverImage ? { images: [show.coverImage] } : undefined,
  };
}

export default async function ShowPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sort = (await searchParams).sort === "oldest" ? "oldest" : "newest";
  const show = await getShow(slug);
  if (!show) notFound();

  const [episodesRaw, reels] = await Promise.all([getShowEpisodes(slug, sort), getReels({ showSlug: slug, limit: 12 })]);
  const episodes = episodesRaw ?? [];
  if (show.youtubePlaylistId !== "demo") after(() => syncIfStale(slug, show.lastSyncedAt ? new Date(show.lastSyncedAt) : null));

  const cover = show.coverImage || episodes[0]?.thumbnail;
  const totalSeconds = episodes.reduce((t, e) => t + e.durationSeconds, 0);
  const newest = sort === "newest" ? episodes[0] : episodes[episodes.length - 1];
  const oldest = sort === "newest" ? episodes[episodes.length - 1] : episodes[0];

  return (
    <div style={{ ["--accent" as string]: show.accent }}>
      <section
        className="relative overflow-hidden px-5 pt-10 pb-12 lg:px-10 lg:pt-20 lg:pb-16"
        style={{ background: `radial-gradient(120% 90% at 85% 0%, color-mix(in oklab, ${show.accent} 22%, transparent), transparent 60%)` }}
      >
        <div className="grid items-end gap-8 md:grid-cols-[minmax(0,15rem)_1fr] lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-14">
          {cover && (
            <div className="w-44 overflow-hidden rounded-tile shadow-2xl shadow-black/50 sm:w-56 md:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" className={`w-full object-cover ${show.coverImage ? "aspect-4/5" : "aspect-4/5"}`} />
            </div>
          )}
          <div className="max-w-3xl">
            <h1 className="display text-5xl text-balance sm:text-7xl lg:text-[6rem]">{show.title}</h1>
            {show.tagline && <p className="mt-5 text-xl leading-relaxed text-ivory/85">{show.tagline}</p>}
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {show.hosts.length > 0 && (
                <div>
                  <dt className="text-moss">Hosted by</dt>
                  <dd className="text-ivory">{show.hosts.join(", ")}</dd>
                </div>
              )}
              {show.schedule && (
                <div>
                  <dt className="text-moss">Schedule</dt>
                  <dd className="text-ivory">{show.schedule}</dd>
                </div>
              )}
              <div>
                <dt className="text-moss">Episodes</dt>
                <dd className="text-ivory tabular-nums">
                  {episodes.length}
                  {totalSeconds > 0 && <span className="text-sage"> — {formatLongDuration(totalSeconds)} in total</span>}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {newest && (
                <PlayButton
                  episode={newest}
                  queue={sort === "newest" ? episodes : [...episodes].reverse()}
                  label="Play latest"
                />
              )}
              {oldest && episodes.length > 1 && (
                <PlayButton
                  episode={oldest}
                  queue={sort === "oldest" ? episodes : [...episodes].reverse()}
                  label="Start from episode one"
                  variant="ghost"
                />
              )}
              <ShareButton title={show.title} />
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 lg:px-10">
        <div className="h-[3px] w-24 bg-(--accent)" aria-hidden />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-14">
          <aside>
            <h2 className="display text-3xl">About the show</h2>
            {show.description ? (
              <p className="prose-studio mt-4">{show.description}</p>
            ) : (
              <p className="mt-4 text-sage">More about this show is coming soon.</p>
            )}
          </aside>

          <section aria-labelledby="episodes-heading">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="episodes-heading" className="display text-3xl">
                Episodes
              </h2>
              <div className="flex rounded-full border hairline p-1 text-sm" role="group" aria-label="Sort episodes">
                {(["newest", "oldest"] as const).map((s) => (
                  <Link
                    key={s}
                    href={s === "newest" ? `/shows/${slug}` : `/shows/${slug}?sort=oldest`}
                    scroll={false}
                    aria-current={sort === s ? "true" : undefined}
                    className={`rounded-full px-3.5 py-1.5 transition-colors ${
                      sort === s ? "bg-panel text-ivory" : "text-sage hover:text-ivory"
                    }`}
                  >
                    {s === "newest" ? "Newest first" : "Oldest first"}
                  </Link>
                ))}
              </div>
            </div>
            {episodes.length ? (
              <EpisodeList episodes={episodes} showShow={false} />
            ) : (
              <p className="border-y hairline py-10 text-sage">
                Episodes for this show will appear here as soon as they’re published on YouTube.
              </p>
            )}
          </section>
        </div>
        <ReelRail reels={reels ?? []} title={`Clips from ${show.title}`} />
      </div>
    </div>
  );
}
