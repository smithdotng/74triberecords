import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ShowSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    hosts: { type: [String], default: [] },
    /** YouTube playlist ID (PL…) or channel uploads playlist (UU…) that holds this show's episodes */
    youtubePlaylistId: { type: String, required: true, trim: true },
    coverImage: { type: String, default: "" },
    /** Hex colour used to tint this show's pages */
    accent: { type: String, default: "#C9A45C" },
    schedule: { type: String, default: "" },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    lastSyncedAt: { type: Date },
    episodeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ShowDoc = InferSchemaType<typeof ShowSchema>;
export const Show: Model<ShowDoc> = models.Show || model("Show", ShowSchema);
