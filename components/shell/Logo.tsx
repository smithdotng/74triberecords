import Link from "next/link";

/**
 * 74 Tribe Studios logo: the green waveform mark beside the "74TRIBE / STUDIOS" wordmark.
 * Files live in /public/brand (regenerate with scripts/assets/make_brand.py).
 */
export function Logo({ compact = false, size = "md" }: { compact?: boolean; size?: "md" | "lg" }) {
  const mark = size === "lg" ? 52 : 40;
  const wordH = size === "lg" ? 40 : 31;
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="74 Tribe Studios, home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-mark.png"
        alt=""
        width={mark}
        height={mark}
        className="shrink-0 transition-transform duration-500 ease-(--ease-studio) group-hover:scale-105"
      />
      {!compact && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/brand/logo-wordmark.png" alt="" height={wordH} width={Math.round((wordH * 600) / 248)} style={{ height: wordH, width: "auto" }} />
      )}
    </Link>
  );
}
