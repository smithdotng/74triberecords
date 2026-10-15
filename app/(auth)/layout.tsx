import { Logo } from "@/components/shell/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-10 sm:px-12 lg:px-16">
        <Logo />
        <div className="my-auto w-full max-w-sm py-12">{children}</div>
        <p className="text-xs text-moss">© {new Date().getFullYear()} 74 Tribe Studios</p>
      </div>
      <aside className="relative hidden overflow-hidden border-l hairline lg:block" aria-hidden>
        <div
          className="weave absolute inset-0 opacity-25"
          style={{ maskImage: "linear-gradient(to bottom, #000 0%, transparent 75%)", WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 75%)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_30%,color-mix(in_oklab,var(--color-brass)_18%,transparent),transparent)]" />
        <div className="absolute right-16 bottom-16 left-16">
          <p className="display text-6xl leading-[1.05] text-balance xl:text-7xl">Conversations worth sitting down for.</p>
          <div className="weave mt-8 h-1.5 w-48" />
        </div>
      </aside>
    </div>
  );
}
