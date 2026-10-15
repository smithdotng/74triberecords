import { z } from "zod";
import { connectDB, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fail, ok, zodMessage } from "@/lib/api";
import { Booking } from "@/models/Booking";
import { newReference, rangeIsFree, takenHours, toBookingDTO, validateSlot } from "@/lib/bookings";
import { sendBookingReceived } from "@/lib/mail";
import { BOOKING_RULES, SPACES, spaceBySlug, studioToday, type SpaceSlug } from "@/lib/studio";

const schema = z.object({
  space: z.enum(SPACES.map((s) => s.slug) as [SpaceSlug, ...SpaceSlug[]], { message: "Choose a space." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  startHour: z.coerce.number().int(),
  hours: z.coerce.number().int().min(BOOKING_RULES.minHours).max(BOOKING_RULES.maxHours, `Sessions can run up to ${BOOKING_RULES.maxHours} hours.`),
  guests: z.coerce.number().int().min(1, "At least one person will be on set.").max(50),
  production: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(1500).optional().default(""),
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a phone number we can reach you on.").max(30),
  company: z.string().trim().max(120).optional().default(""),
  // Honeypot: real visitors never see or fill this
  website: z.string().max(0).optional().default(""),
});

export async function POST(req: Request) {
  if (!isDbConfigured()) return fail(503, "Bookings aren't available right now. Please call or email the studio.");
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));
  const { website: _hp, ...data } = parsed.data;

  const space = spaceBySlug(data.space)!;
  if (space.capacity && data.guests > space.capacity) {
    return fail(400, `The ${space.name} seats up to ${space.capacity}. Choose another space or fewer people.`);
  }
  const slotError = validateSlot(data.date, data.startHour, data.hours, studioToday());
  if (slotError) return fail(400, slotError);

  await connectDB();
  const taken = await takenHours(data.space, data.date);
  if (!rangeIsFree(taken, data.startHour, data.hours)) {
    return fail(409, "Part of that time has just been booked. Choose another start time.");
  }

  const session = await getSession();
  const booking = await Booking.create({
    ...data,
    email: data.email.toLowerCase(),
    reference: newReference(),
    userId: session?.user?.id,
  });
  const dto = toBookingDTO(booking.toObject());
  await sendBookingReceived(dto);
  return ok({ reference: dto.reference }, { status: 201 });
}

/** Signed-in visitors' own bookings */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return fail(401, "Sign in to see your bookings.");
  await connectDB();
  const list = await Booking.find({ $or: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }] })
    .sort({ date: -1, startHour: -1 })
    .limit(50)
    .lean();
  return ok({ bookings: list.map((b) => toBookingDTO(b)) });
}
