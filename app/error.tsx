"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6">
      <h1 className="display text-5xl">Something interrupted the broadcast</h1>
      <p className="mt-4 text-lg text-sage">The page didn’t load. Check your connection, then try again.</p>
      <button onClick={reset} className="btn btn-brass mt-8 self-start">
        Try again
      </button>
    </div>
  );
}
