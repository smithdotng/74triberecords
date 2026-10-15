import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const EpisodeSchema = new Schema(
  {
    videoId: { type: String, required: true, unique: true },
    showSlug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    publishedAt: { type: Date, index: true },
    durationSeconds: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EpisodeSchema.index({ title: "text", description: "text" });

export type EpisodeDoc = InferSchemaType<typeof EpisodeSchema>;
export const Episode: Model<EpisodeDoc> = models.Episode || model("Episode", EpisodeSchema);
