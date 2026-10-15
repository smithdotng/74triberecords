import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { fail, ok, zodMessage } from "@/lib/api";
import { adminEmails } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(60),
  email: z.email("Enter a valid email address.").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Use at least 8 characters for your password.").max(128),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(400, zodMessage(parsed.error));
  const { name, email, password } = parsed.data;

  try {
    await connectDB();
  } catch {
    return fail(503, "Accounts aren't available right now. The database isn't connected.");
  }
  const exists = await User.exists({ email });
  if (exists) return fail(409, "An account with this email already exists. Sign in instead.");

  await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    provider: "credentials",
    role: adminEmails().includes(email) ? "admin" : "member",
  });

  return ok({ created: true }, { status: 201 });
}
