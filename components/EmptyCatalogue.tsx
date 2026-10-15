import Link from "next/link";
import { isDbConfigured } from "@/lib/db";

export function EmptyCatalogue() {
  const db = isDbConfigured();
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-20">
      <div className="weave mb-10 h-1.5 w-40" aria-hidden />
      <h1 className="display text-5xl">The studio is getting ready</h1>
      <p className="mt-5 text-lg leading-relaxed text-sage">
        {db
          ? "No shows have been published yet. Sign in with an admin account and add your first show from its YouTube playlist."
          : "We couldn’t reach the database. Check MONGODB_URI in your environment and reload."}
      </p>
      {db && (
        <div className="mt-8 flex gap-3">
          <Link href="/admin" className="btn btn-brass">
            Open studio admin
          </Link>
        </div>
      )}
    </section>
  );
}
