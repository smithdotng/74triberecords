import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Show } from "@/models/Show";
import { Episode } from "@/models/Episode";
import { fail, isObjectId, ok, zodMessage } from "@/lib/api";
import { showInputSchema } from "@/lib/show-schema";
import { resolvePlaylistSource } from "@/lib/youtube";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Show not found.");
  const parsed = showInputSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));

  try {
    parsed.data.youtubePlaylistId = await resolvePlaylistSource(parsed.data.youtubePlaylistId);
  } catch (e) {
    return fail(400, (e as Error).message);
  }

  await connectDB();
  const show = await Show.findById(id);
  if (!show) return fail(404, "Show not found.");
  if (parsed.data.slug !== show.slug && (await Show.exists({ slug: parsed.data.slug }))) {
    return fail(409, `The slug "${parsed.data.slug}" is already taken.`);
  }
  const oldSlug = show.slug;
  if (parsed.data.featured) await Show.updateMany({ _id: { $ne: id } }, { featured: false });
  show.set(parsed.data);
  await show.save();
  if (oldSlug !== show.slug) await Episode.updateMany({ showSlug: oldSlug }, { showSlug: show.slug });
  return ok({ updated: true, slug: show.slug });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Show not found.");
  await connectDB();
  const show = await Show.findByIdAndDelete(id);
  if (!show) return fail(404, "Show not found.");
  await Episode.deleteMany({ showSlug: show.slug });
  return ok({ deleted: true });
}
