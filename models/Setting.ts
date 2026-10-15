import { Schema, model, models, type Model } from "mongoose";

/** Small key/value store for app state that can't live in env vars (e.g. a refreshed Instagram token). */
const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type SettingDoc = { key: string; value: unknown; updatedAt: Date };
export const Setting: Model<SettingDoc> = models.Setting || model("Setting", SettingSchema);
