// Upserts the shows listed in scripts/shows.json. Run with: npm run seed
// Episodes are imported from YouTube afterwards — from Studio admin ("Sync all shows") or the cron endpoint.
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local first.");
  process.exit(1);
}

const shows = JSON.parse(await readFile(new URL("./shows.json", import.meta.url), "utf8"));
await mongoose.connect(uri);
const col = mongoose.connection.collection("shows");
await col.createIndex({ slug: 1 }, { unique: true });

for (const s of shows) {
  const now = new Date();
  await col.updateOne(
    { slug: s.slug },
    {
      $set: { ...s, published: s.published ?? true, updatedAt: now },
      $setOnInsert: { createdAt: now, episodeCount: 0 },
    },
    { upsert: true }
  );
  console.log(`✓ ${s.title} (/shows/${s.slug})`);
}

await mongoose.disconnect();
console.log(`\nSeeded ${shows.length} shows. Open /admin and press "Sync all shows" to import episodes.`);
