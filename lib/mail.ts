import "server-only";
import nodemailer from "nodemailer";
import type { BookingDTO } from "./bookings";
import { hourLabel } from "./studio";

/**
 * Optional booking emails. Set SMTP_HOST, SMTP_USER and SMTP_PASS (e.g. Hostinger:
 * smtp.hostinger.com, port 465). Without them bookings still work — they just appear
 * in Studio admin without an email going out.
 */
export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function transport() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const from = () => process.env.MAIL_FROM || `74 Tribe Studios <${process.env.SMTP_USER}>`;
const site = () => process.env.NEXTAUTH_URL ?? "";

function when(b: BookingDTO) {
  const d = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(b.date + "T00:00:00Z")
  );
  return `${d}, ${hourLabel(b.startHour)} – ${hourLabel(b.startHour + b.hours)}`;
}

function summary(b: BookingDTO) {
  return [
    `Reference: ${b.reference}`,
    `Space: ${b.spaceName}`,
    `When: ${when(b)}`,
    `People on set: ${b.guests}`,
    b.production && `Production: ${b.production}`,
    `Name: ${b.name}${b.company ? ` (${b.company})` : ""}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone}`,
    b.notes && `Notes: ${b.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function send(to: string, subject: string, text: string, replyTo?: string) {
  if (!mailConfigured() || !to) return;
  try {
    await transport().sendMail({ from: from(), to, subject, text, replyTo });
  } catch (e) {
    console.error("[mail]", (e as Error).message);
  }
}

export async function sendBookingReceived(b: BookingDTO) {
  const team = process.env.BOOKINGS_EMAIL || process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "";
  await Promise.all([
    send(
      b.email,
      `We've received your booking request (${b.reference})`,
      `Hi ${b.name.split(" ")[0]},\n\nThanks for your request to book the ${b.spaceName} at 74 Tribe Studios. We'll check the details and confirm by email shortly.\n\n${summary(b)}\n\n74 Tribe Studios\n${site()}`
    ),
    send(team, `New booking request: ${b.spaceName}, ${b.date} (${b.reference})`, `${summary(b)}\n\nReview it in Studio admin: ${site()}/admin#bookings`, b.email),
  ]);
}

export async function sendBookingStatus(b: BookingDTO) {
  if (b.status !== "confirmed" && b.status !== "declined") return;
  const confirmed = b.status === "confirmed";
  await send(
    b.email,
    confirmed ? `Your session is confirmed (${b.reference})` : `About your booking request (${b.reference})`,
    `Hi ${b.name.split(" ")[0]},\n\n${
      confirmed
        ? `Your session at 74 Tribe Studios is confirmed. We look forward to hosting you.`
        : `Unfortunately we can't host this session as requested. Reply to this email and we'll help you find another time.`
    }\n${b.adminNote ? `\nA note from the team: ${b.adminNote}\n` : ""}\n${summary(b)}\n\n74 Tribe Studios\n${site()}`
  );
}
