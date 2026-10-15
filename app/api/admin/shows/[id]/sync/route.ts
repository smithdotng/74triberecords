import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Show } from "@/models/Show";
import { fail, isObjectId, ok } from "@/lib/api";
import { isYouTubeConfigured, syncShow } from "@/lib/youtube";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  if (!isYouTubeConfigured()) return fail(400, "Add YOUTUBE_API_KEY to your environment to sync episodes.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Show not found.");
  await connectDB();
  const show = await Show.findById(id, { slug: 1 }).lean();
  if (!show) return fail(404, "Show not found.");
  try {
    return ok(await syncShow(show.slug));
  } catch (e) {
    return fail(502, (e as Error).message);
  }
}
