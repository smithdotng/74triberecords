import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Playlist } from "@/models/Playlist";
import { Episode } from "@/models/Episode";
import { fail, isObjectId, ok, zodMessage } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };
const bodySchema = z.object({ videoId: z.string().trim().min(5).max(20) });

export async function POST(req: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to save episodes.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Playlist not found.");
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));

  await connectDB();
  if (!(await Episode.exists({ videoId: parsed.data.videoId }))) return fail(404, "Episode not found.");

  const res = await Playlist.updateOne(
    { _id: id, userId: user.id, "items.videoId": { $ne: parsed.data.videoId } },
    { $push: { items: { videoId: parsed.data.videoId, addedAt: new Date() } } }
  );
  if (!res.matchedCount) {
    const exists = await Playlist.exists({ _id: id, userId: user.id });
    if (!exists) return fail(404, "Playlist not found.");
  }
  return ok({ added: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to edit this playlist.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Playlist not found.");
  const videoId = new URL(req.url).searchParams.get("videoId");
  if (!videoId) return fail(400, "Missing videoId.");

  await connectDB();
  const res = await Playlist.updateOne({ _id: id, userId: user.id }, { $pull: { items: { videoId } } });
  if (!res.matchedCount) return fail(404, "Playlist not found.");
  return ok({ removed: true });
}
