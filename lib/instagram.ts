import "server-only";
import { connectDB } from "./db";
import { Reel } from "@/models/Reel";
import { Setting } from "@/models/Setting";

/**
 * Instagram Reels.
 *
 * Two ways in:
 * 1. Manual — an admin pastes a reel link. Plays through Instagram's embed player. No setup needed.
 * 2. Automatic — set INSTAGRAM_ACCESS_TOKEN (Instagram API with Instagram Login, professional account)
 *    and every reel on the account is imported, with a direct video file so it plays natively.
 */

const GRAPH = "https://graph.instagram.com";
const TOKEN_KEY = "instagram.token";
const REFRESH_AFTER_DAYS = 7; // long-lived tokens last 60 days; refresh well before that

export function isInstagramConfigured() {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN);
}

/** Accepts instagram.com/reel/CODE, /reels/CODE, /p/CODE (with or without query) or a bare shortcode. */
export function parseReelUrl(input: string) {
  const raw = input.trim();
  const m = raw.match(/instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]{5,})/i);
  if (m) return { shortcode: m[1], permalink: `https://www.instagram.com/reel/${m[1]}/` };
  if (/^[\w-]{5,40}$/.test(raw)) return { shortcode: raw, permalink: `https://www.instagram.com/reel/${raw}/` };
  return null;
}

type StoredToken = { token: string; refreshedAt: string };

async function getToken() {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!envToken) throw new Error("INSTAGRAM_ACCESS_TOKEN is not set.");
  const stored = (await Setting.findOne({ key: TOKEN_KEY }).lean())?.value as StoredToken | undefined;
  // A newer env token (pasted by the admin) always wins over one we refreshed earlier
  const base = stored && stored.token && (stored as StoredToken & { from?: string }).from === envToken ? stored : null;
  let token = base?.token ?? envToken;
  const refreshedAt = base ? new Date(base.refreshedAt).getTime() : 0;

  if (Date.now() - refreshedAt > REFRESH_AFTER_DAYS * 86400_000) {
    const res = await fetch(`${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { access_token?: string };
      if (data.access_token) {
        token = data.access_token;
        await Setting.updateOne(
          { key: TOKEN_KEY },
          { $set: { value: { token, refreshedAt: new Date().toISOString(), from: envToken } } },
          { upsert: true }
        );
      }
    }
  }
  return token;
}

type IgMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  shortcode?: string;
  timestamp: string;
};

/** Imports the account's reels (newest first, up to `max`). Existing manual entries for the same reel are upgraded. */
export async function syncInstagramReels(max = 60) {
  await connectDB();
  const token = await getToken();
  const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,shortcode,timestamp";
  let url: string | undefined = `${GRAPH}/me/media?fields=${fields}&limit=50&access_token=${encodeURIComponent(token)}`;
  const media: IgMedia[] = [];

  while (url && media.length < max * 2) {
    const res: Response = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      if (body.includes("OAuthException") || body.includes("\"code\":190")) {
        throw new Error("Instagram rejected the access token. Generate a new one and update INSTAGRAM_ACCESS_TOKEN.");
      }
      throw new Error(`Instagram API failed (${res.status}): ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as { data: IgMedia[]; paging?: { next?: string } };
    media.push(...data.data);
    url = data.paging?.next;
  }

  // Every Instagram video is a reel now; media_product_type is only returned on some API flavours
  const reels = media
    .filter((m) => m.media_type === "VIDEO" && (!m.media_product_type || m.media_product_type === "REELS"))
    .slice(0, max);

  const ops = reels.map((m) => {
    const shortcode = m.shortcode ?? parseReelUrl(m.permalink)?.shortcode ?? m.id;
    return {
      updateOne: {
        filter: { shortcode },
        update: {
          $set: {
            shortcode,
            permalink: m.permalink,
            caption: m.caption ?? "",
            thumbnail: m.thumbnail_url ?? "",
            videoUrl: m.media_url ?? "", // missing when the reel uses licensed audio → embed fallback
            source: "instagram",
            instagramId: m.id,
            publishedAt: new Date(m.timestamp),
          },
        },
        upsert: true,
      },
    };
  });
  if (ops.length) await Reel.bulkWrite(ops);
  return { reels: ops.length };
}
