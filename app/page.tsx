import { getSite } from "@/lib/content/getSite";
import { getProfile } from "@/lib/content/getProfile";
import { getTimeline } from "@/lib/content/getTimeline";
import {
  getAllPosts,
  getFeaturedPosts,
} from "@/lib/content/getFeaturedPosts";
import { HeroSection } from "@/components/hero/HeroSection";
import { MobileDesktopNotice } from "@/components/hero/MobileDesktopNotice";
import { TimelineSection } from "@/components/timeline/TimelineSection";

export default function HomePage() {
  const site = getSite();
  const profile = getProfile();
  const timeline = getTimeline();
  const posts = getAllPosts();
  const featuredPosts = getFeaturedPosts();

  return (
    <main>
      <HeroSection site={site} profile={profile} featuredPosts={featuredPosts} />
      <MobileDesktopNotice />
      <TimelineSection entries={timeline} site={site} posts={posts} />
    </main>
  );
}
