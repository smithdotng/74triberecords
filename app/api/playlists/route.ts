import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Playlist } from "@/models/Playlist";
import { fail, ok, zodMessage } from "@/lib/api";
import { getUserPlaylists } from "@/lib/data";

const createSchema = z.object({
  name: z.string().trim().min(1, "Give your playlist a name.").max(80),
  description: z.string().trim().max(300).optional().default(""),
  videoId: z.string().trim().max(20).optional(),
});

export async function GET() {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to see your playlists.");
  return ok({ playlists: (await getUserPlaylists(user.id)) ?? [] });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return fail(401, "Sign in to create a playlist.");
  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));

  await connectDB();
  const count = await Playlist.countDocuments({ userId: user.id });
  if (count >= 100) return fail(400, "You've reached the limit of 100 playlists.");

  const { name, description, videoId } = parsed.data;
  const p = await Playlist.create({
    userId: user.id,
    name,
    description,
    items: videoId ? [{ videoId }] : [],
  });
  return ok({ id: p._id.toString(), name: p.name }, { status: 201 });
}
