import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { fail, isObjectId, ok, zodMessage } from "@/lib/api";
import { Booking } from "@/models/Booking";
import { rangeIsFree, takenHours, toBookingDTO } from "@/lib/bookings";
import { sendBookingStatus } from "@/lib/mail";
import type { SpaceSlug } from "@/lib/studio";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "declined", "cancelled"]),
  adminNote: z.string().trim().max(600).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return fail(403, "Admins only.");
  const { id } = await params;
  if (!isObjectId(id)) return fail(404, "Booking not found.");
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));

  await connectDB();
  const booking = await Booking.findById(id);
  if (!booking) return fail(404, "Booking not found.");

  // Re-opening a declined/cancelled request must not double-book the slot
  const reopening = ["declined", "cancelled"].includes(booking.status) && ["pending", "confirmed"].includes(parsed.data.status);
  if (reopening) {
    const taken = await takenHours(booking.space as SpaceSlug, booking.date, id);
    if (!rangeIsFree(taken, booking.startHour, booking.hours)) return fail(409, "That time has since been booked by someone else.");
  }

  const changed = booking.status !== parsed.data.status;
  booking.status = parsed.data.status;
  if (parsed.data.adminNote !== undefined) booking.adminNote = parsed.data.adminNote;
  await booking.save();
  const dto = toBookingDTO(booking.toObject());
  if (changed) await sendBookingStatus(dto);
  return ok({ booking: dto });
}
