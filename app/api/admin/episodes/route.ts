import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Show } from "@/models/Show";
import { Episode } from "@/models/Episode";
import { fail, isObjectId, ok, zodMessage } from "@/lib/api";
import { parseVideoId, ytThumb } from "@/lib/format";

/**
 * Add a single episode by YouTube link. Works without an API key (uses YouTube oEmbed),
 * so the studio can publish an episode before the playlist sync runs.
 */
const schema = z.object({
  showId: z.string().refine(isObjectId, "Choose a show."),
  url: z.string().trim().min(5, "Paste a YouTube video link."),
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));
  const videoId = parseVideoId(parsed.data.url);
  if (!/^[\w-]{11}$/.test(videoId)) return fail(400, "That doesn't look like a YouTube video link.");

  await connectDB();
  const show = await Show.findById(parsed.data.showId);
  if (!show) return fail(404, "Show not found.");

  let title = parsed.data.title;
  if (!title) {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
    );
    if (!res.ok) return fail(400, "YouTube couldn't find that video, or it isn't public and embeddable.");
    title = ((await res.json()) as { title: string }).title;
  }

  await Episode.updateOne(
    { videoId },
    {
      $set: { showSlug: show.slug, title, ...(parsed.data.description ? { description: parsed.data.description } : {}) },
      $setOnInsert: { videoId, thumbnail: ytThumb(videoId, "maxresdefault"), publishedAt: new Date() },
    },
    { upsert: true }
  );
  show.episodeCount = await Episode.countDocuments({ showSlug: show.slug });
  await show.save();
  return ok({ added: true, videoId }, { status: 201 });
}
