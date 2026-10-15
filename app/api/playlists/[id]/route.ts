import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Playlist } from "@/models/Playlist";
import { fail, isObjectId, ok, zodMessage } from "@/lib/api";
import { getUserPlaylist } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(1, "Give your playlist a name.").max(80).optional(),
  description: z.string().trim().max(300).optional(),
  /** Full new order of video IDs — used for reordering and bulk removal */
  order: z.array(z.string().max(20)).max(2000).optional(),
});

export async function GET(_req: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to see this playlist.");
  const { id } = await params;
  const p = await getUserPlaylist(user.id, id);
  if (!p) return fail(404, "Playlist not found.");
  return ok(p);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to edit this playlist.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Playlist not found.");
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));

  await connectDB();
  const p = await Playlist.findOne({ _id: id, userId: user.id });
  if (!p) return fail(404, "Playlist not found.");

  const { name, description, order } = parsed.data;
  if (name !== undefined) p.name = name;
  if (description !== undefined) p.description = description;
  if (order) {
    const existing = new Map(p.items.map((i) => [i.videoId, i]));
    p.set(
      "items",
      order.filter((v) => existing.has(v)).map((v) => existing.get(v)!)
    );
  }
  await p.save();
  return ok({ updated: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to delete this playlist.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Playlist not found.");
  await connectDB();
  const res = await Playlist.deleteOne({ _id: id, userId: user.id });
  if (!res.deletedCount) return fail(404, "Playlist not found.");
  return ok({ deleted: true });
}
