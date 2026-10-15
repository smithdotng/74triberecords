import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { isInstagramConfigured, syncInstagramReels } from "@/lib/instagram";

export const maxDuration = 60;

export async function POST() {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  if (!isInstagramConfigured()) return fail(400, "Add INSTAGRAM_ACCESS_TOKEN to your environment to import reels automatically.");
  try {
    return ok(await syncInstagramReels());
  } catch (e) {
    return fail(502, (e as Error).message);
  }
}
