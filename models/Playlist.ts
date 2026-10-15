import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const PlaylistItemSchema = new Schema(
  {
    videoId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlaylistSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 300 },
    items: { type: [PlaylistItemSchema], default: [] },
  },
  { timestamps: true }
);

export type PlaylistDoc = InferSchemaType<typeof PlaylistSchema>;
export const Playlist: Model<PlaylistDoc> = models.Playlist || model("Playlist", PlaylistSchema);
