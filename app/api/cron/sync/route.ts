import { fail, ok } from "@/lib/api";
import { isYouTubeConfigured, syncAllShows } from "@/lib/youtube";
import { isInstagramConfigured, syncInstagramReels } from "@/lib/instagram";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled refresh of every show and, when Instagram is connected, the reels
 * (which also renews their short-lived video links). Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return fail(401, "Unauthorized.");
  if (!isYouTubeConfigured() && !isInstagramConfigured()) return fail(400, "Neither YOUTUBE_API_KEY nor INSTAGRAM_ACCESS_TOKEN is set.");

  const shows = isYouTubeConfigured() ? await syncAllShows() : [];
  let reels: { reels?: number; error?: string } | null = null;
  if (isInstagramConfigured()) {
    try {
      reels = await syncInstagramReels();
    } catch (e) {
      reels = { error: (e as Error).message };
    }
  }
  return ok({ shows, reels });
}
