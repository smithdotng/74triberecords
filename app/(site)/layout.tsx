import { Sidebar } from "@/components/shell/Sidebar";
import { MobileHeader, TabBar } from "@/components/shell/MobileChrome";
import { InstallBanner } from "@/components/shell/InstallBanner";
import { getShows } from "@/lib/data";
import { isDemo } from "@/lib/demo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const shows = (await getShows()) ?? [];
  return (
    <>
      <Sidebar shows={shows.map(({ slug, title, accent }) => ({ slug, title, accent }))} />
      <div className="lg:pl-(--sidebar-w)">
        <MobileHeader />
        <InstallBanner />
        {isDemo() && (
          <p className="border-b hairline bg-room px-5 py-2.5 text-center text-[0.8125rem] text-sage lg:px-10">
            You’re seeing sample shows. Add <code className="text-brass-soft">MONGODB_URI</code> to connect the real catalogue.
          </p>
        )}
        <main
          id="main"
          className="min-h-dvh"
          style={{ paddingBottom: "calc(var(--tabbar-h) + var(--minibar-h) + env(safe-area-inset-bottom) + 3rem)" }}
        >
          {children}
        </main>
      </div>
      <TabBar />
    </>
  );
}
