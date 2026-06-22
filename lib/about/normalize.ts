import { aboutSchema, type About } from "@/lib/schemas/about";
import { normalizeContactLinks } from "./contact";

type LegacyAbout = {
  bio?: string[];
  location?: string;
  email?: string;
  links?: Partial<About["links"]>;
};

type LegacySite = {
  email?: string;
  links?: { linkedin?: string; github?: string };
};

/** Merges contact fields from site.json when about.json predates the move. */
export function normalizeAbout(aboutRaw: unknown, siteRaw?: unknown): About {
  const about = aboutRaw as LegacyAbout;
  const site = (siteRaw ?? {}) as LegacySite;

  return aboutSchema.parse({
    bio: about.bio ?? [],
    location: about.location,
    email: about.email ?? site.email ?? "",
    links: normalizeContactLinks({
      ...about.links,
      linkedin: about.links?.linkedin ?? site.links?.linkedin ?? "",
      github: about.links?.github ?? site.links?.github ?? "",
    }),
  });
}
