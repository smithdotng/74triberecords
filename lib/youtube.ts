import "server-only";
import { connectDB } from "./db";
import { Episode } from "@/models/Episode";
import { Show } from "@/models/Show";

const API = "https://www.googleapis.com/youtube/v3";

type PlaylistItem = {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    position: number;
    thumbnails?: Record<string, { url: string; width: number; height: number }>;
    resourceId: { videoId: string };
  };
  contentDetails?: { videoPublishedAt?: string };
  status?: { privacyStatus?: string };
};

type VideoItem = {
  id: string;
  contentDetails: { duration: string };
  status?: { embeddable?: boolean; privacyStatus?: string };
};

export function isYouTubeConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

function key() {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k) throw new Error("YOUTUBE_API_KEY is not set.");
  return k;
}

/** ISO-8601 duration (PT1H2M3S) → seconds */
export function parseIsoDuration(iso: string) {
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, d, h, min, s] = m.map((v) => (v ? Number(v) : 0));
  return d * 86400 + h * 3600 + min * 60 + s;
}

function bestThumb(thumbs?: PlaylistItem["snippet"]["thumbnails"]) {
  if (!thumbs) return "";
  return (thumbs.maxres ?? thumbs.standard ?? thumbs.high ?? thumbs.medium ?? thumbs.default)?.url ?? "";
}

async function ytFetch<T>(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, key: key() });
  const res = await fetch(`${API}/${path}?${qs}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    const reason = body.match(/"reason":\s*"(\w+)"/)?.[1];
    if (path === "playlistItems" && (reason === "invalid" || reason === "playlistNotFound")) {
      throw new Error(`YouTube doesn't recognise the playlist "${params.playlistId}". Edit the show and paste a playlist link (…?list=…) or a channel link (youtube.com/@name).`);
    }
    if (reason === "keyInvalid" || reason === "API_KEY_INVALID") throw new Error("YOUTUBE_API_KEY is not valid. Check it in Google Cloud Console.");
    if (reason === "accessNotConfigured") throw new Error("Enable “YouTube Data API v3” for your API key's Google Cloud project.");
    if (reason === "quotaExceeded") throw new Error("Today's YouTube API quota is used up. Try again tomorrow.");
    throw new Error(`YouTube API ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

async function fetchPlaylistItems(playlistId: string, max = 500) {
  const items: PlaylistItem[] = [];
  let pageToken: string | undefined;
  do {
    const data = await ytFetch<{ items: PlaylistItem[]; nextPageToken?: string }>("playlistItems", {
      part: "snippet,contentDetails,status",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    items.push(...data.items);
    pageToken = data.nextPageToken;
  } while (pageToken && items.length < max);
  return items;
}

async function fetchVideoDetails(ids: string[]) {
  const out = new Map<string, VideoItem>();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const data = await ytFetch<{ items: VideoItem[] }>("videos", {
      part: "contentDetails,status",
      id: chunk.join(","),
    });
    for (const v of data.items) out.set(v.id, v);
  }
  return out;
}

/** Videos shorter than this are skipped when a show imports a whole channel's uploads. */
const MIN_UPLOAD_SECONDS = 3 * 60;

/**
 * Turns whatever the admin pasted into a playlist ID:
 * - playlist links (…?list=PL…) or bare playlist IDs → used as-is
 * - channel links (/channel/UC…, /@handle, /@handle/playlists, /@handle/videos) or bare UC… / @handle
 *   → that channel's uploads playlist (UU…), i.e. every video the channel has published
 */
export async function resolvePlaylistSource(input: string): Promise<string> {
  const raw = input.trim();
  let url: URL | null = null;
  try {
    url = new URL(raw.startsWith("@") ? `https://www.youtube.com/${raw}` : raw);
  } catch {
    url = null;
  }

  const list = url?.searchParams.get("list");
  if (list) return list;

  const path = url?.pathname ?? raw;
  const channelId = path.match(/(?:^|\/channel\/)(UC[\w-]{22})/)?.[1];
  if (channelId) return `UU${channelId.slice(2)}`;

  const handle = path.match(/(?:^|\/)@([\w.-]+)/)?.[1];
  if (handle) {
    if (!isYouTubeConfigured()) {
      throw new Error("Add YOUTUBE_API_KEY to use a channel link, or paste a playlist link (…?list=…) instead.");
    }
    const data = await ytFetch<{ items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[] }>("channels", {
      part: "contentDetails",
      forHandle: `@${handle}`,
    });
    const uploads = data.items?.[0]?.contentDetails.relatedPlaylists.uploads;
    if (!uploads) throw new Error(`YouTube couldn't find a channel called @${handle}.`);
    return uploads;
  }

  if (/^(PL|UU|OL|FL|RD)[\w-]{10,}$/.test(raw)) return raw;
  throw new Error("That isn't a YouTube playlist or channel link. Paste a link like youtube.com/playlist?list=… or youtube.com/@channel.");
}

/** Pulls every public, embeddable video from the show's YouTube playlist into MongoDB. */
export async function syncShow(slug: string) {
  await connectDB();
  const show = await Show.findOne({ slug });
  if (!show) throw new Error(`Show "${slug}" not found`);

  // Shows saved before channel links were supported may hold a full URL; resolve and fix it in place
  if (!/^(PL|UU|OL|FL|RD)[\w-]{10,}$/.test(show.youtubePlaylistId)) {
    show.youtubePlaylistId = await resolvePlaylistSource(show.youtubePlaylistId);
    await show.save();
  }

  const items = (await fetchPlaylistItems(show.youtubePlaylistId)).filter(
    (i) => i.status?.privacyStatus !== "private" && i.snippet.title !== "Deleted video" && i.snippet.title !== "Private video"
  );
  const details = await fetchVideoDetails(items.map((i) => i.snippet.resourceId.videoId));
  const isUploads = show.youtubePlaylistId.startsWith("UU");

  const ops = items
    .filter((i) => {
      const d = details.get(i.snippet.resourceId.videoId);
      if (!d || d.status?.embeddable === false || d.status?.privacyStatus === "private") return false;
      // A channel's full uploads list (UU…) also holds Shorts and short clips; keep only full episodes
      if (isUploads && parseIsoDuration(d.contentDetails.duration) < MIN_UPLOAD_SECONDS) return false;
      return true;
    })
    .map((i) => {
      const videoId = i.snippet.resourceId.videoId;
      const d = details.get(videoId)!;
      return {
        updateOne: {
          filter: { videoId },
          update: {
            $set: {
              videoId,
              showSlug: show.slug,
              title: i.snippet.title,
              description: i.snippet.description,
              thumbnail: bestThumb(i.snippet.thumbnails),
              publishedAt: new Date(i.contentDetails?.videoPublishedAt ?? i.snippet.publishedAt),
              durationSeconds: parseIsoDuration(d.contentDetails.duration),
              position: i.snippet.position,
            },
          },
          upsert: true,
        },
      };
    });

  if (ops.length) await Episode.bulkWrite(ops);

  const keepIds = ops.map((o) => o.updateOne.filter.videoId);
  await Episode.deleteMany({ showSlug: show.slug, videoId: { $nin: keepIds } });

  show.episodeCount = keepIds.length;
  show.lastSyncedAt = new Date();
  await show.save();

  return { slug: show.slug, episodes: keepIds.length };
}

export async function syncAllShows() {
  await connectDB();
  const shows = await Show.find({}, { slug: 1 }).lean();
  const results: { slug: string; episodes?: number; error?: string }[] = [];
  for (const s of shows) {
    try {
      results.push(await syncShow(s.slug));
    } catch (e) {
      results.push({ slug: s.slug, error: (e as Error).message });
    }
  }
  return results;
}

/** Fire-and-forget refresh when a show's cache is older than `maxAgeHours`. */
export async function syncIfStale(slug: string, lastSyncedAt: Date | null | undefined, maxAgeHours = 6) {
  if (!isYouTubeConfigured()) return;
  const age = lastSyncedAt ? Date.now() - new Date(lastSyncedAt).getTime() : Infinity;
  if (age < maxAgeHours * 3600_000) return;
  try {
    await syncShow(slug);
  } catch (e) {
    console.error(`[youtube] background sync for ${slug} failed:`, (e as Error).message);
  }
}
