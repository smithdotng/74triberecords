// Grants admin to an existing account. Run with: npm run make-admin -- someone@example.com
import mongoose from "mongoose";

const email = process.argv[2]?.toLowerCase().trim();
if (!email) {
  console.error("Usage: npm run make-admin -- someone@example.com");
  process.exit(1);
}
await mongoose.connect(process.env.MONGODB_URI);
const res = await mongoose.connection.collection("users").updateOne({ email }, { $set: { role: "admin" } });
console.log(res.matchedCount ? `✓ ${email} is now an admin. Sign out and back in to see Studio admin.` : `No account found for ${email}. Sign up first.`);
await mongoose.disconnect();
