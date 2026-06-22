import type { Metadata } from "next";
import { AboutPageBack } from "@/components/about/AboutPageBack";
import { BusinessCard } from "@/components/about/BusinessCard";
import { getAbout } from "@/lib/content/getAbout";
import { getProfile } from "@/lib/content/getProfile";
import { getSite } from "@/lib/content/getSite";

const site = getSite();

export const metadata: Metadata = {
  title: `${site.name} · Digital Card`,
  description: site.meta.description,
};

export default function AboutPage() {
  const profile = getProfile();
  const about = getAbout();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <AboutPageBack className="mb-5" />
        <BusinessCard site={site} profile={profile} about={about} />
      </div>
    </main>
  );
}
