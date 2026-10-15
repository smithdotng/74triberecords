import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { getReels, getShows } from "@/lib/data";
import { isInstagramConfigured } from "@/lib/instagram";
import { ReelsAdmin } from "@/components/admin/ReelsAdmin";
import { isYouTubeConfigured } from "@/lib/youtube";
import { isDemo } from "@/lib/demo";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Studio admin" };

export default async function AdminPage() {
  if (isDemo()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="display text-5xl">Studio admin</h1>
        <p className="mt-5 text-lg text-sage">Connect the database first: add MONGODB_URI to your environment, restart, then sign up with an email listed in ADMIN_EMAILS.</p>
      </div>
    );
  }
  const user = await requireUser();
  if (!user) redirect("/signin?callbackUrl=/admin");
  if (!(await requireAdmin())) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="display text-5xl">Admins only</h1>
        <p className="mt-5 text-lg text-sage">
          This area is for the 74 Tribe Studios team. Ask an administrator to add {user.email} to ADMIN_EMAILS, then sign out and back in.
        </p>
      </div>
    );
  }
  const [shows, reels] = await Promise.all([getShows({ includeUnpublished: true }), getReels({ limit: 200, includeHidden: true })]);
  return (
    <>
      <AdminPanel initialShows={shows ?? []} youtubeReady={isYouTubeConfigured()} />
      <ReelsAdmin
        initialReels={reels ?? []}
        shows={(shows ?? []).map(({ slug, title }) => ({ slug, title }))}
        instagramReady={isInstagramConfigured()}
      />
    </>
  );
}
