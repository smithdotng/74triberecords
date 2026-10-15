import type { Metadata } from "next";
import { cleanDescription, pageMeta } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode, getShowEpisodes, getUserPlaylist } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatDate, formatLongDuration } from "@/lib/format";
import { Stage } from "@/components/player/Stage";
import { AddToPlaylist } from "@/components/AddToPlaylist";
import { ShareButton } from "@/components/ShareButton";
import { UpNext } from "@/components/UpNext";
import { Description } from "@/components/Description";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ videoId: string }>; searchParams: Promise<{ list?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const videoId = (await params).videoId;
  const data = await getEpisode(videoId);
  if (!data) return pageMeta({ title: "Episode not found", path: `/watch/${videoId}`, noindex: true });
  const { episode, show } = data;
  return pageMeta({
    title: show ? `${episode.title} | ${show.title}` : episode.title,
    description: cleanDescription(episode.description, show?.tagline || `Watch ${episode.title} on 74 Tribe Studios.`),
    path: `/watch/${videoId}`,
    image: { url: episode.thumbnail, width: 1280, height: 720, alt: episode.title },
    type: "video.episode",
  });
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { videoId } = await params;
  const { list } = await searchParams;
  const data = await getEpisode(videoId);
  if (!data) notFound();
  const { episode, show } = data;

  // Queue comes from the visitor's playlist when they arrived from one, otherwise from the show
  let queue = (await getShowEpisodes(episode.showSlug)) ?? [episode];
  let queueTitle = show ? `More from ${show.title}` : "More episodes";
  let listId: string | undefined;
  if (list) {
    const user = await requireUser();
    const playlist = user ? await getUserPlaylist(user.id, list) : null;
    if (playlist && playlist.episodes.some((e) => e.videoId === videoId)) {
      queue = playlist.episodes;
      queueTitle = playlist.name;
      listId = playlist.id;
    }
  }

  const isDemo = videoId.startsWith("demo-");

  return (
    <div className="px-0 pt-0 sm:px-5 sm:pt-6 lg:px-10 lg:pt-10">
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_23rem] xl:gap-12">
        <div className="min-w-0">
          <Stage episode={episode} queue={queue} listId={listId} />

          <div className="px-5 sm:px-0">
            <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                {show && (
                  <Link href={`/shows/${show.slug}`} className="inline-flex items-center gap-2.5 text-sage hover:text-ivory">
                    <span className="h-3.5 w-[3px] rounded-full" style={{ background: show.accent }} />
                    {show.title}
                  </Link>
                )}
                <h1 className="display mt-3 text-[2.1rem] text-balance sm:text-5xl">{episode.title}</h1>
                <p className="mt-3 text-sm text-moss">
                  {[formatDate(episode.publishedAt), formatLongDuration(episode.durationSeconds)].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <AddToPlaylist episode={episode} variant="button" />
                <ShareButton title={episode.title} />
                {!isDemo && (
                  <a
                    href={`https://www.youtube.com/watch?v=${episode.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-quiet"
                  >
                    <Icon name="expand" size={16} />
                    Open on YouTube
                  </a>
                )}
              </div>
            </div>

            {episode.description && <Description text={episode.description} />}
          </div>
        </div>

        <aside className="px-5 sm:px-0" aria-labelledby="upnext">
          <UpNext title={queueTitle} episodes={queue} listId={listId} currentId={episode.videoId} />
        </aside>
      </div>
    </div>
  );
}
