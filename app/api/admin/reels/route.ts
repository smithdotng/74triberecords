import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Reel } from "@/models/Reel";
import { Show } from "@/models/Show";
import { fail, ok, zodMessage } from "@/lib/api";
import { getReels } from "@/lib/data";
import { parseReelUrl } from "@/lib/instagram";

const schema = z.object({
  url: z.string().trim().min(5, "Paste an Instagram reel link."),
  caption: z.string().trim().max(2200).optional().default(""),
  coverImage: z.union([z.url("Cover image must be a full https:// link."), z.literal("")]).optional().default(""),
  showSlug: z.string().trim().max(80).optional().default(""),
});

export async function GET() {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  return ok({ reels: (await getReels({ limit: 200, includeHidden: true })) ?? [] });
}

/** Add one reel by link. It plays through Instagram's embed player. */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));
  const ref = parseReelUrl(parsed.data.url);
  if (!ref) return fail(400, "That doesn't look like an Instagram reel link. It should look like instagram.com/reel/…");

  await connectDB();
  if (parsed.data.showSlug && !(await Show.exists({ slug: parsed.data.showSlug }))) return fail(400, "Choose a show from the list.");
  if (await Reel.exists({ shortcode: ref.shortcode })) return fail(409, "That reel is already on the site.");

  const reel = await Reel.create({
    ...ref,
    caption: parsed.data.caption,
    thumbnail: parsed.data.coverImage,
    showSlug: parsed.data.showSlug,
    source: "manual",
    publishedAt: new Date(),
  });
  return ok({ id: reel._id.toString() }, { status: 201 });
}
