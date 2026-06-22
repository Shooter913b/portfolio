import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { getSite } from "@/lib/content/getSite";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
