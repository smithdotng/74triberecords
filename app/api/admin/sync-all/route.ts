import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { isYouTubeConfigured, syncAllShows } from "@/lib/youtube";

export const maxDuration = 60;

export async function POST() {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  if (!isYouTubeConfigured()) return fail(400, "Add YOUTUBE_API_KEY to your environment to sync episodes.");
  return ok({ results: await syncAllShows() });
}
