import { getSite } from "@/lib/content/getSite";
import { getProfile } from "@/lib/content/getProfile";
import { getTimeline } from "@/lib/content/getTimeline";
import {
  getAllPosts,
  getFeaturedPosts,
} from "@/lib/content/getFeaturedPosts";
import { HomePageClient } from "@/components/HomePageClient";

export default function HomePage() {
  const site = getSite();
  const profile = getProfile();
  const timeline = getTimeline();
  const posts = getAllPosts();
  const featuredPosts = getFeaturedPosts();

  return (
    <HomePageClient
      site={site}
      profile={profile}
      timeline={timeline}
      featuredPosts={featuredPosts}
      posts={posts}
    />
  );
}
