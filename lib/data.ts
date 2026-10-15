import "server-only";
import { connectDB, isDbConfigured } from "./db";
import { Show, type ShowDoc } from "@/models/Show";
import { Episode, type EpisodeDoc } from "@/models/Episode";
import { Playlist } from "@/models/Playlist";
import type { EpisodeDTO, PlaylistDTO, ReelDTO, ShowDTO } from "./types";
import { ytThumb } from "./format";
import { demoEpisodes, demoReels, demoShows } from "./demo";
import { Reel, type ReelDoc } from "@/models/Reel";

type Lean<T> = T & { _id: { toString(): string } };

export function toShowDTO(s: Lean<ShowDoc>): ShowDTO {
  return {
    id: s._id.toString(),
    slug: s.slug,
    title: s.title,
    tagline: s.tagline ?? "",
    description: s.description ?? "",
    hosts: s.hosts ?? [],
    youtubePlaylistId: s.youtubePlaylistId,
    coverImage: s.coverImage ?? "",
    accent: s.accent ?? "#C9A45C",
    schedule: s.schedule ?? "",
    order: s.order ?? 0,
    featured: Boolean(s.featured),
    published: s.published !== false,
    episodeCount: s.episodeCount ?? 0,
    lastSyncedAt: s.lastSyncedAt ? new Date(s.lastSyncedAt).toISOString() : null,
  };
}

export function toEpisodeDTO(e: EpisodeDoc, showTitle?: string): EpisodeDTO {
  return {
    videoId: e.videoId,
    showSlug: e.showSlug,
    showTitle,
    title: e.title,
    description: e.description ?? "",
    thumbnail: e.thumbnail || ytThumb(e.videoId),
    publishedAt: e.publishedAt ? new Date(e.publishedAt).toISOString() : null,
    durationSeconds: e.durationSeconds ?? 0,
  };
}

async function showTitleMap() {
  const shows = await Show.find({}, { slug: 1, title: 1 }).lean();
  return new Map(shows.map((s) => [s.slug, s.title]));
}

/** Returns null instead of throwing when the database isn't reachable, so pages can render a setup message. */
async function safe<T>(fn: () => Promise<T>, demo?: () => T): Promise<T | null> {
  if (!isDbConfigured()) return demo ? demo() : null;
  try {
    await connectDB();
    return await fn();
  } catch (e) {
    console.error("[data]", (e as Error).message);
    return null;
  }
}

export async function getShows(opts: { includeUnpublished?: boolean } = {}) {
  return safe(async () => {
    const q = opts.includeUnpublished ? {} : { published: true };
    const shows = await Show.find(q).sort({ order: 1, createdAt: 1 }).lean();
    return shows.map((s) => toShowDTO(s as Lean<ShowDoc>));
  }, () => demoShows);
}

export async function getShow(slug: string) {
  return safe(async () => {
    const s = await Show.findOne({ slug, published: true }).lean();
    return s ? toShowDTO(s as Lean<ShowDoc>) : null;
  }, () => demoShows.find((s) => s.slug === slug) ?? null);
}

export async function getShowEpisodes(slug: string, sort: "newest" | "oldest" = "newest") {
  return safe(async () => {
    const show = await Show.findOne({ slug }, { title: 1 }).lean();
    const eps = await Episode.find({ showSlug: slug, hidden: { $ne: true } })
      .sort({ publishedAt: sort === "newest" ? -1 : 1 })
      .lean();
    return eps.map((e) => toEpisodeDTO(e, show?.title));
  }, () => {
    const eps = demoEpisodes.filter((e) => e.showSlug === slug);
    return sort === "newest" ? eps : [...eps].reverse();
  });
}

export async function getLatestEpisodes(limit = 12, excludeSlug?: string) {
  return safe(async () => {
    const published = await Show.find({ published: true }, { slug: 1, title: 1 }).lean();
    const slugs = published.map((s) => s.slug).filter((s) => s !== excludeSlug);
    const titles = new Map(published.map((s) => [s.slug, s.title]));
    const eps = await Episode.find({ showSlug: { $in: slugs }, hidden: { $ne: true } })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return eps.map((e) => toEpisodeDTO(e, titles.get(e.showSlug)));
  }, () =>
    [...demoEpisodes]
      .filter((e) => e.showSlug !== excludeSlug)
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, limit)
  );
}

export async function getEpisode(videoId: string) {
  return safe(async () => {
    const e = await Episode.findOne({ videoId }).lean();
    if (!e) return null;
    const show = await Show.findOne({ slug: e.showSlug }).lean();
    return {
      episode: toEpisodeDTO(e, show?.title),
      show: show ? toShowDTO(show as Lean<ShowDoc>) : null,
    };
  }, () => {
    const episode = demoEpisodes.find((e) => e.videoId === videoId);
    return episode ? { episode, show: demoShows.find((s) => s.slug === episode.showSlug) ?? null } : null;
  });
}

export async function getEpisodesByIds(videoIds: string[]) {
  return safe(async () => {
    if (!videoIds.length) return [];
    const [eps, titles] = await Promise.all([Episode.find({ videoId: { $in: videoIds } }).lean(), showTitleMap()]);
    const byId = new Map(eps.map((e) => [e.videoId, toEpisodeDTO(e, titles.get(e.showSlug))]));
    return videoIds.map((id) => byId.get(id)).filter(Boolean) as EpisodeDTO[];
  }, () => videoIds.map((id) => demoEpisodes.find((e) => e.videoId === id)).filter(Boolean) as EpisodeDTO[]);
}

export async function searchEpisodes(query: string) {
  return safe(async () => {
    const q = query.trim();
    if (!q) return [];
    const published = await Show.find({ published: true }, { slug: 1, title: 1 }).lean();
    const titles = new Map(published.map((s) => [s.slug, s.title]));
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const eps = await Episode.find({
      showSlug: { $in: published.map((s) => s.slug) },
      hidden: { $ne: true },
      $or: [{ title: rx }, { description: rx }],
    })
      .sort({ publishedAt: -1 })
      .limit(40)
      .lean();
    return eps.map((e) => toEpisodeDTO(e, titles.get(e.showSlug)));
  }, () => {
    const q = query.trim().toLowerCase();
    return q ? demoEpisodes.filter((e) => `${e.title} ${e.showTitle}`.toLowerCase().includes(q)) : [];
  });
}

export async function getUserPlaylists(userId: string): Promise<PlaylistDTO[] | null> {
  return safe(async () => {
    const lists = await Playlist.find({ userId }).sort({ updatedAt: -1 }).lean();
    return lists.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description ?? "",
      itemCount: p.items.length,
      videoIds: p.items.map((i) => i.videoId),
      cover: p.items[0] ? ytThumb(p.items[0].videoId) : null,
      updatedAt: new Date(p.updatedAt).toISOString(),
    }));
  });
}

export async function getUserPlaylist(userId: string, id: string) {
  return safe(async () => {
    if (!/^[a-f\d]{24}$/i.test(id)) return null;
    const p = await Playlist.findOne({ _id: id, userId }).lean();
    if (!p) return null;
    const episodes = (await getEpisodesByIds(p.items.map((i) => i.videoId))) ?? [];
    return {
      id: p._id.toString(),
      name: p.name,
      description: p.description ?? "",
      updatedAt: new Date(p.updatedAt).toISOString(),
      episodes,
    };
  });
}

export function toReelDTO(r: Lean<ReelDoc>, showTitle?: string): ReelDTO {
  return {
    id: r._id.toString(),
    shortcode: r.shortcode,
    permalink: r.permalink,
    caption: r.caption ?? "",
    thumbnail: r.thumbnail ?? "",
    videoUrl: r.videoUrl ?? "",
    showSlug: r.showSlug ?? "",
    showTitle,
    source: (r.source as ReelDTO["source"]) ?? "manual",
    publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : null,
    hidden: Boolean(r.hidden),
  };
}

export async function getReels(opts: { limit?: number; showSlug?: string; includeHidden?: boolean } = {}) {
  const { limit = 60, showSlug, includeHidden } = opts;
  return safe(
    async () => {
      const q: Record<string, unknown> = includeHidden ? {} : { hidden: { $ne: true } };
      if (showSlug) q.showSlug = showSlug;
      const [reels, titles] = await Promise.all([Reel.find(q).sort({ publishedAt: -1 }).limit(limit).lean(), showTitleMap()]);
      return reels.map((r) => toReelDTO(r as Lean<ReelDoc>, r.showSlug ? titles.get(r.showSlug) : undefined));
    },
    () => demoReels.filter((r) => !showSlug || r.showSlug === showSlug).slice(0, limit)
  );
}
