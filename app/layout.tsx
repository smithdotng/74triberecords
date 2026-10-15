import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/hanken-grotesk/index.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getSession } from "@/lib/auth";

import { pageMeta, SITE_NAME, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  // Site-wide defaults; every page also sets its own via pageMeta()
  ...(({ alternates: _a, ...rest }) => rest)(pageMeta({ path: "/" })),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: "74 Tribe", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  ...(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? { facebook: { appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID } } : {}),
  ...(process.env.NEXT_PUBLIC_TWITTER_HANDLE
    ? { twitter: { ...pageMeta({ path: "/" }).twitter, site: process.env.NEXT_PUBLIC_TWITTER_HANDLE } }
    : {}),
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
