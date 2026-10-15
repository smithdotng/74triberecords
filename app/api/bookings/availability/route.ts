import { fail, ok } from "@/lib/api";
import { isDbConfigured } from "@/lib/db";
import { takenHours } from "@/lib/bookings";
import { spaceBySlug, type SpaceSlug } from "@/lib/studio";

export const dynamic = "force-dynamic";

/** GET /api/bookings/availability?space=lounge-set&date=2026-10-20 → hours already held that day */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const space = url.searchParams.get("space") ?? "";
  const date = url.searchParams.get("date") ?? "";
  if (!spaceBySlug(space)) return fail(400, "Unknown space.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(400, "Invalid date.");
  if (!isDbConfigured()) return ok({ taken: [] });
  try {
    const taken = await takenHours(space as SpaceSlug, date);
    return ok({ taken: [...taken].sort((a, b) => a - b) });
  } catch {
    return fail(503, "Availability isn't available right now.");
  }
}
