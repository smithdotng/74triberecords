import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const BookingSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    space: { type: String, required: true, index: true },
    /** Studio-local calendar date, YYYY-MM-DD (avoids time-zone drift) */
    date: { type: String, required: true, index: true },
    startHour: { type: Number, required: true },
    hours: { type: Number, required: true },
    guests: { type: Number, default: 1 },
    production: { type: String, default: "" },
    notes: { type: String, default: "" },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    company: { type: String, default: "" },
    userId: { type: Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: ["pending", "confirmed", "declined", "cancelled"], default: "pending", index: true },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

BookingSchema.index({ space: 1, date: 1, status: 1 });

export type BookingDoc = InferSchemaType<typeof BookingSchema>;
export const Booking: Model<BookingDoc> = models.Booking || model("Booking", BookingSchema);

/** Requests that hold a slot. Declined and cancelled ones free it again. */
export const HOLDING_STATUSES = ["pending", "confirmed"] as const;
