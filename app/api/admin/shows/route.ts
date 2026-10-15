import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Show } from "@/models/Show";
import { fail, ok, zodMessage } from "@/lib/api";
import { showInputSchema } from "@/lib/show-schema";
import { getShows } from "@/lib/data";
import { isYouTubeConfigured, resolvePlaylistSource, syncShow } from "@/lib/youtube";

export async function GET() {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  return ok({ shows: (await getShows({ includeUnpublished: true })) ?? [] });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const parsed = showInputSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));

  try {
    parsed.data.youtubePlaylistId = await resolvePlaylistSource(parsed.data.youtubePlaylistId);
  } catch (e) {
    return fail(400, (e as Error).message);
  }

  await connectDB();
  if (await Show.exists({ slug: parsed.data.slug })) {
    return fail(409, `A show with the address "/shows/${parsed.data.slug}" already exists. Choose another slug.`);
  }
  if (parsed.data.featured) await Show.updateMany({}, { featured: false });
  const show = await Show.create(parsed.data);

  let sync: { episodes?: number; error?: string } = {};
  if (isYouTubeConfigured()) {
    try {
      sync = await syncShow(show.slug);
    } catch (e) {
      sync = { error: (e as Error).message };
    }
  }
  return ok({ id: show._id.toString(), slug: show.slug, sync }, { status: 201 });
}
