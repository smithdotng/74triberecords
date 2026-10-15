import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/hanken-grotesk/index.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getSession } from "@/lib/auth";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "74 Tribe Studios", template: "%s — 74 Tribe Studios" },
  description: "Watch every show from 74 Tribe Studios. Sign in to build playlists and pick up where you left off.",
  applicationName: "74 Tribe Studios",
  appleWebApp: { capable: true, title: "74 Tribe", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "74 Tribe Studios",
    title: "74 Tribe Studios",
    description: "Conversations worth sitting down for.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c231e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = process.env.NEXTAUTH_SECRET || process.env.NODE_ENV !== "production" ? await getSession().catch(() => null) : null;
  // Browser extensions (e.g. Grammarly) add attributes to <html>/<body> before React loads; ignore those mismatches
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
