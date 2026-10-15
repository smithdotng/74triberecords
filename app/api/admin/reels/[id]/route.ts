import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Reel } from "@/models/Reel";
import { fail, isObjectId, ok, zodMessage } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  hidden: z.boolean().optional(),
  showSlug: z.string().trim().max(80).optional(),
  caption: z.string().trim().max(2200).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Reel not found.");
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));
  await connectDB();
  const res = await Reel.updateOne({ _id: id }, { $set: parsed.data });
  if (!res.matchedCount) return fail(404, "Reel not found.");
  return ok({ updated: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Reel not found.");
  await connectDB();
  const reel = await Reel.findById(id);
  if (!reel) return fail(404, "Reel not found.");
  // Imported reels would come straight back on the next sync, so hide them instead of deleting
  if (reel.source === "instagram") {
    reel.hidden = true;
    await reel.save();
    return ok({ hidden: true });
  }
  await reel.deleteOne();
  return ok({ deleted: true });
}
