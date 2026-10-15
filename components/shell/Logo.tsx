import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="74 Tribe Studios, home">
      <span className="grid size-10 place-items-center rounded-full border border-brass/80 text-ivory transition-colors group-hover:border-brass-soft">
        <span className="display text-[1.15rem] leading-none font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>
          74
        </span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="display block text-[1.35rem] tracking-[-0.01em]">Tribe Studios</span>
        </span>
      )}
    </Link>
  );
}
