import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ReelSchema = new Schema(
  {
    /** Instagram shortcode — the part after /reel/ in the link */
    shortcode: { type: String, required: true, unique: true },
    permalink: { type: String, required: true },
    caption: { type: String, default: "" },
    /** Cover image. From the Instagram API, or pasted by an admin for manually added reels. */
    thumbnail: { type: String, default: "" },
    /** Direct video file from the Instagram API (expires; refreshed on each sync). Empty → use Instagram's embed player. */
    videoUrl: { type: String, default: "" },
    /** Optional link to one of the shows */
    showSlug: { type: String, default: "" },
    source: { type: String, enum: ["instagram", "manual"], default: "manual" },
    instagramId: { type: String },
    publishedAt: { type: Date, default: Date.now, index: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ReelDoc = InferSchemaType<typeof ReelSchema>;
export const Reel: Model<ReelDoc> = models.Reel || model("Reel", ReelSchema);
