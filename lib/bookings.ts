import "server-only";
import crypto from "node:crypto";
import { connectDB } from "./db";
import { Booking, HOLDING_STATUSES, type BookingDoc } from "@/models/Booking";
import { BOOKING_RULES, conflictingSpaces, spaceBySlug, type SpaceSlug } from "./studio";

export type BookingDTO = {
  id: string;
  reference: string;
  space: string;
  spaceName: string;
  date: string;
  startHour: number;
  hours: number;
  guests: number;
  production: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "pending" | "confirmed" | "declined" | "cancelled";
  adminNote: string;
  createdAt: string;
};

export function toBookingDTO(b: BookingDoc & { _id: { toString(): string }; createdAt?: Date }): BookingDTO {
  return {
    id: b._id.toString(),
    reference: b.reference,
    space: b.space,
    spaceName: spaceBySlug(b.space)?.name ?? b.space,
    date: b.date,
    startHour: b.startHour,
    hours: b.hours,
    guests: b.guests ?? 1,
    production: b.production ?? "",
    notes: b.notes ?? "",
    name: b.name,
    email: b.email,
    phone: b.phone,
    company: b.company ?? "",
    status: b.status as BookingDTO["status"],
    adminNote: b.adminNote ?? "",
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : "",
  };
}

/** Short, readable reference like T74-K7Q2M9 (no 0/O/1/I to avoid misreading). */
export function newReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  return "T74-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** Hours (start-of-hour, studio time) already taken for this space on this date. */
export async function takenHours(space: SpaceSlug, date: string, excludeId?: string) {
  await connectDB();
  const q: Record<string, unknown> = {
    space: { $in: conflictingSpaces(space) },
    date,
    status: { $in: HOLDING_STATUSES },
  };
  if (excludeId) q._id = { $ne: excludeId };
  const existing = await Booking.find(q, { startHour: 1, hours: 1 }).lean();
  const taken = new Set<number>();
  for (const b of existing) for (let h = b.startHour; h < b.startHour + b.hours; h++) taken.add(h);
  return taken;
}

export function rangeIsFree(taken: Set<number>, startHour: number, hours: number) {
  for (let h = startHour; h < startHour + hours; h++) if (taken.has(h)) return false;
  return true;
}

export function validateSlot(date: string, startHour: number, hours: number, today: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Choose a date.";
  if (date < today) return "Choose a date from today onwards.";
  const max = new Date(today + "T00:00:00Z");
  max.setUTCDate(max.getUTCDate() + BOOKING_RULES.maxDaysAhead);
  if (date > max.toISOString().slice(0, 10)) return `Sessions can be booked up to ${BOOKING_RULES.maxDaysAhead} days ahead.`;
  if (startHour < BOOKING_RULES.openHour || startHour + hours > BOOKING_RULES.closeHour) {
    return "That session runs outside studio hours. Choose an earlier start or a shorter session.";
  }
  return null;
}

/** Bookings for Studio admin: everything from today on, plus the last 30 days. */
export async function getAdminBookings(today: string) {
  await connectDB();
  const from = new Date(today + "T00:00:00Z");
  from.setUTCDate(from.getUTCDate() - 30);
  const list = await Booking.find({ date: { $gte: from.toISOString().slice(0, 10) } })
    .sort({ date: 1, startHour: 1 })
    .limit(500)
    .lean();
  return list.map((b) => toBookingDTO(b));
}

export async function getUserBookings(userId: string, email?: string | null) {
  await connectDB();
  const or: Record<string, unknown>[] = [{ userId }];
  if (email) or.push({ email: email.toLowerCase() });
  const list = await Booking.find({ $or: or }).sort({ date: -1, startHour: -1 }).limit(50).lean();
  return list.map((b) => toBookingDTO(b));
}
