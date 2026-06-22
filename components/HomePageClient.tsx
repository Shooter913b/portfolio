"use client";

import type { Site } from "@/lib/schemas/site";
import type { Profile } from "@/lib/schemas/profile";
import type { ResolvedTimelineEntry } from "@/lib/schemas/timeline";
import type { BlogPost } from "@/lib/schemas/blog";
import { HeroSection } from "@/components/hero/HeroSection";
import { TimelineSection } from "@/components/timeline/TimelineSection";

type HomePageClientProps = {
  site: Site;
  profile: Profile;
  timeline: ResolvedTimelineEntry[];
  featuredPosts: BlogPost[];
  posts: BlogPost[];
};

export function HomePageClient({
  site,
  profile,
  timeline,
  featuredPosts,
  posts,
}: HomePageClientProps) {
  return (
    <main>
      <HeroSection site={site} profile={profile} featuredPosts={featuredPosts} />
      <TimelineSection entries={timeline} site={site} posts={posts} />
    </main>
  );
}
