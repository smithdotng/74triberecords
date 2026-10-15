"use client";

export function RetryButton() {
  return (
    <button onClick={() => window.location.reload()} className="btn btn-brass mt-8">
      Try again
    </button>
  );
}
