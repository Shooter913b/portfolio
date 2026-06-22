import type { Profile } from "@/lib/schemas/profile";
import type { Site } from "@/lib/schemas/site";
import type { BlogPost } from "@/lib/schemas/blog";
import { ProfilePhotoGate } from "./ProfilePhotoGate";
import { ContactLinks } from "./ContactLinks";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { ScrollIndicator } from "./ScrollIndicator";

type HeroSectionProps = {
  site: Site;
  profile: Profile;
  featuredPosts: BlogPost[];
};

export function HeroSection({ site, profile, featuredPosts }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center px-6 py-24 md:px-12">
      <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <ProfilePhotoGate profile={profile} />
          <h1 className="accent-gradient-text mt-6 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {site.name}
          </h1>
          <p className="mt-3 text-lg text-text-muted">{site.tagline}</p>
          <div className="mt-6">
            <ContactLinks />
          </div>
        </div>

        <div className="md:pl-4">
          <FeaturedCarousel posts={featuredPosts} className="mt-0" />
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
