import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import { getSite } from "@/lib/content/getSite";
import { goatCounterEndpoint } from "@/components/analytics/GoatCounter";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const goatCounterSite = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE?.trim();

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const site = getSite();

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
  metadataBase: new URL(site.links.site),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    url: site.links.site,
    siteName: site.meta.title,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased" suppressHydrationWarning>
        {goatCounterSite ? (
          <Script
            id="goatcounter"
            strategy="beforeInteractive"
            src="https://gc.zgo.at/count.js"
            data-goatcounter={goatCounterEndpoint(goatCounterSite)}
            {...(process.env.NODE_ENV === "development"
              ? { "data-goatcounter-settings": JSON.stringify({ allow_local: true }) }
              : {})}
          />
        ) : null}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
