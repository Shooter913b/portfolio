import type { ReactNode } from "react";
import Image from "next/image";
import type { About } from "@/lib/schemas/about";
import { CONTACT_LINK_FIELDS, formatContactDisplay, isContactValueSet, listContactItems } from "@/lib/about/contact";
import type { BlogFrontmatter } from "@/lib/schemas/blog";
import type { Profile } from "@/lib/schemas/profile";
import type { Site } from "@/lib/schemas/site";
import type { SkillCategory } from "@/lib/schemas/skills";
import type { TimelineEntry } from "@/lib/schemas/timeline";
import type { TimelineLink, TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { getFeaturedPostMedia, getSupplementaryPostMedia } from "@/lib/log/postMedia";
import { getFeaturedMedia, getMediaPreviewSrc } from "@/lib/timeline/featuredMedia";
import { SkillDots } from "@/components/timeline/SkillDots";
import { proficiencyColor } from "@/lib/skills/proficiency";
import { cn } from "@/lib/cn";

export function PreviewRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 space-y-4", className)}>{children}</div>;
}

export function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#8888a0]">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function PreviewText({
  children,
  muted,
  className,
}: {
  children: ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("text-sm leading-relaxed", muted ? "text-[#8888a0]" : "text-[#f0f0f5]", className)}>
      {children}
    </p>
  );
}

export function PreviewRow({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="grid grid-cols-[minmax(5rem,7rem)_1fr] gap-x-3 gap-y-0.5 text-sm">
      <span className="text-[#8888a0]">{label}</span>
      <span className="min-w-0 break-words text-[#c8c8d8]">{value}</span>
    </div>
  );
}

export function PreviewBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-white/10 bg-[#1a1a24] px-2 py-0.5 text-xs text-[#c8c8d8]">
      {children}
    </span>
  );
}

export function PreviewBadgeList({ items }: { items: string[] }) {
  if (items.length === 0) return <PreviewText muted>None</PreviewText>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <PreviewBadge key={item}>{item}</PreviewBadge>
      ))}
    </div>
  );
}

export function PreviewList({ items, empty = "None" }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <PreviewText muted>{empty}</PreviewText>;

  return (
    <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-[#c8c8d8]">
      {items.map((item, index) => (
        <li key={`${item.slice(0, 24)}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function PreviewLinks({ links }: { links: TimelineLink[] }) {
  if (links.length === 0) return <PreviewText muted>No links</PreviewText>;

  return (
    <ul className="space-y-1.5 text-sm">
      {links.map((link, index) => (
        <li key={`${link.href}-${index}`}>
          <span className="text-[#f0f0f5]">{link.label || "Untitled"}</span>
          <span className="text-[#8888a0]"> · </span>
          <span className="break-all font-mono text-xs text-[#00d4ff]/80">{link.href}</span>
          {link.icon && (
            <span className="ml-1.5 text-xs text-[#8888a0]">({link.icon})</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PreviewMediaGrid({
  items,
  featuredOnly,
}: {
  items: TimelineMediaItem[];
  featuredOnly?: boolean;
}) {
  const shown = featuredOnly ? items.filter((item) => item.featured) : items;
  if (shown.length === 0) {
    return <PreviewText muted>{featuredOnly ? "No featured media" : "No media"}</PreviewText>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {shown.map((item, index) => {
        const src = getMediaPreviewSrc(item);
        return (
          <figure
            key={`${item.src}-${index}`}
            className="overflow-hidden rounded-md border border-white/10 bg-[#1a1a24]"
          >
            <div className="relative aspect-video bg-[#0c0c12]">
              {src ? (
                <Image
                  src={src}
                  alt={item.alt ?? item.caption ?? item.type}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-[#8888a0]">
                  {item.type}
                </div>
              )}
              {item.featured && (
                <span className="absolute left-1 top-1 rounded bg-[#00d4ff]/20 px-1 py-0.5 font-mono text-[9px] uppercase text-[#00d4ff]">
                  Featured
                </span>
              )}
            </div>
            {(item.caption || item.alt) && (
              <figcaption className="truncate px-1.5 py-1 text-[10px] text-[#8888a0]">
                {item.caption ?? item.alt}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

export function SitePreview({ data }: { data: Site }) {
  return (
    <PreviewRoot>
      <PreviewText className="text-xl font-semibold">{data.name}</PreviewText>
      <PreviewText>{data.tagline}</PreviewText>
      <PreviewRow label="Site URL" value={data.links.site} />
      <PreviewSection title="SEO">
        <PreviewRow label="Title" value={data.meta.title} />
        <PreviewText muted>{data.meta.description || "No description"}</PreviewText>
      </PreviewSection>
      <PreviewSection title="Resume">
        <PreviewRow label="Path" value={data.resume.pdfPath} />
        <PreviewRow label="Updated" value={data.resume.lastUpdated} />
      </PreviewSection>
    </PreviewRoot>
  );
}

export function AboutPreview({ data }: { data: About }) {
  return (
    <PreviewRoot>
      {data.location && (
        <PreviewSection title="Location">
          <PreviewText>{data.location}</PreviewText>
        </PreviewSection>
      )}
      <PreviewSection title="Bio">
        {data.bio.length === 0 ? (
          <PreviewText muted>No paragraphs yet.</PreviewText>
        ) : (
          data.bio.map((paragraph, index) => (
            <PreviewText key={index}>{paragraph}</PreviewText>
          ))
        )}
      </PreviewSection>
      <PreviewSection title="Contact">
        {listContactItems(data).length === 0 ? (
          <PreviewText muted>No contact links yet.</PreviewText>
        ) : (
          <>
            {isContactValueSet(data.email) && (
              <PreviewRow label="Email" value={data.email} />
            )}
            {CONTACT_LINK_FIELDS.map((field) => {
              const value = data.links[field.key];
              if (!isContactValueSet(value)) return null;
              return (
                <PreviewRow
                  key={field.key}
                  label={field.label.replace(/ URL$/, "")}
                  value={formatContactDisplay(field.key, value)}
                />
              );
            })}
          </>
        )}
      </PreviewSection>
    </PreviewRoot>
  );
}

export function ProfilePreview({ data }: { data: Profile }) {
  return (
    <PreviewRoot>
      <div className="flex items-start gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#1a1a24]">
          {data.photo.src ? (
            <Image
              src={data.photo.src}
              alt={data.photo.alt}
              fill
              className="object-cover"
              sizes="112px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#8888a0]">
              {data.photo.placeholderInitials}
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <PreviewRow label="Alt" value={data.photo.alt} />
          <PreviewRow label="Initials" value={data.photo.placeholderInitials} />
          <PreviewRow label="Path" value={data.photo.src} />
        </div>
      </div>
    </PreviewRoot>
  );
}

export function ResumePreview({ pdfPath = "/resume.pdf" }: { pdfPath?: string }) {
  return (
    <PreviewRoot>
      <PreviewSection title="PDF preview">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#1a1a24]">
          <iframe
            src={pdfPath}
            title="Resume preview"
            className="h-[min(70vh,520px)] w-full bg-white"
          />
        </div>
        <PreviewRow label="Path" value={pdfPath} />
      </PreviewSection>
    </PreviewRoot>
  );
}

export function SkillsCategoryPreview({ category }: { category: SkillCategory }) {
  const sorted = [...(category.skills ?? [])].sort(
    (a, b) => b.level - a.level || a.name.localeCompare(b.name)
  );

  return (
    <PreviewRoot>
      <PreviewRow label="ID" value={category.id} />
      <PreviewSection title={`Skills (${sorted.length})`}>
        {sorted.length === 0 ? (
          <PreviewText muted>No skills yet.</PreviewText>
        ) : (
          <ul className="space-y-2">
            {sorted.map((skill, index) => (
              <li key={`${skill.name}-${index}`} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium" style={{ color: proficiencyColor(skill.level) }}>
                  {skill.name}
                </span>
                <SkillDots level={skill.level} />
              </li>
            ))}
          </ul>
        )}
      </PreviewSection>
    </PreviewRoot>
  );
}

export function SkillsFullPreview({ categories }: { categories: SkillCategory[] }) {
  return (
    <PreviewRoot>
      {categories.map((category) => {
        const sorted = [...(category.skills ?? [])].sort(
          (a, b) => b.level - a.level || a.name.localeCompare(b.name)
        );

        return (
          <PreviewSection key={category.id} title={`${category.label} (${sorted.length})`}>
            {sorted.length === 0 ? (
              <PreviewText muted>No skills</PreviewText>
            ) : (
              <ul className="space-y-2">
                {sorted.map((skill, index) => (
                  <li key={`${skill.name}-${index}`} className="flex items-center justify-between gap-3">
                    <span
                      className="text-sm font-medium"
                      style={{ color: proficiencyColor(skill.level) }}
                    >
                      {skill.name}
                    </span>
                    <SkillDots level={skill.level} />
                  </li>
                ))}
              </ul>
            )}
          </PreviewSection>
        );
      })}
      {categories.length === 0 && <PreviewText muted>No categories yet.</PreviewText>}
    </PreviewRoot>
  );
}

type NarrativeEntry = Extract<
  TimelineEntry,
  { type: "experience" | "education" | "project" }
>;

function isNarrative(entry: TimelineEntry): entry is NarrativeEntry {
  return (
    entry.type === "experience" ||
    entry.type === "education" ||
    entry.type === "project"
  );
}

export function TimelineEntryPreview({ entry }: { entry: TimelineEntry }) {
  if (!isNarrative(entry)) {
    return (
      <PreviewRoot>
        <PreviewRow label="Type" value={entry.type} />
        <PreviewRow label="ID" value={entry.id} />
        <PreviewRow label="Visible" value={entry.visible ? "Yes" : "Hidden"} />
        <PreviewText muted>
          Static block — content comes from{" "}
          {entry.type === "resume" ? "resume.pdf" : "Skills tab"}.
        </PreviewText>
      </PreviewRoot>
    );
  }

  const featured = getFeaturedMedia(entry.media);

  return (
    <PreviewRoot>
      <PreviewSection title="Card">
        <PreviewRow label="Type" value={entry.type} />
        <PreviewRow label="Visible" value={entry.visible ? "Yes" : "Hidden"} />
        <PreviewText className="text-lg font-semibold">{entry.title}</PreviewText>
        {entry.subtitle && <PreviewText muted>{entry.subtitle}</PreviewText>}
        {entry.location && <PreviewText muted>{entry.location}</PreviewText>}
        <PreviewText muted>
          {entry.startDate}
          {entry.endDate ? ` → ${entry.endDate}` : " → Present"}
        </PreviewText>
        <PreviewText>{entry.summary}</PreviewText>
        <PreviewBadgeList items={entry.tags} />
        {featured.length > 0 && (
          <PreviewMediaGrid items={featured} featuredOnly />
        )}
      </PreviewSection>

      <PreviewSection title="Detail overlay">
        <PreviewList items={entry.body} empty="No body bullets" />
      </PreviewSection>

      <PreviewSection title="Media">
        <PreviewMediaGrid items={entry.media} />
      </PreviewSection>

      <PreviewSection title="Links">
        <PreviewLinks links={entry.links} />
      </PreviewSection>
    </PreviewRoot>
  );
}

export function LogPostPreview({
  frontmatter,
  body,
  timelineLabel,
}: {
  frontmatter: BlogFrontmatter;
  body: string;
  timelineLabel?: string;
}) {
  const featured = getFeaturedPostMedia({ ...frontmatter, slug: "", content: body });
  const gallery = getSupplementaryPostMedia({ ...frontmatter, slug: "", content: body });

  return (
    <PreviewRoot>
      <PreviewSection title="Header">
        <PreviewText className="text-lg font-semibold">{frontmatter.title}</PreviewText>
        <PreviewRow label="Date" value={frontmatter.date} />
        <PreviewRow label="Featured" value={frontmatter.featured ? "Yes" : "No"} />
        <PreviewRow label="Timeline" value={timelineLabel ?? frontmatter.relatedTimeline ?? "None"} />
        {frontmatter.excerpt && <PreviewText muted>{frontmatter.excerpt}</PreviewText>}
        <PreviewBadgeList items={frontmatter.tags ?? []} />
      </PreviewSection>

      {featured.length > 0 && (
        <PreviewSection title="Featured media (carousel)">
          <PreviewMediaGrid items={featured} />
        </PreviewSection>
      )}

      <PreviewSection title="Body">
        <PreviewText className="whitespace-pre-wrap">
          {body.trim() || "No content yet."}
        </PreviewText>
      </PreviewSection>

      {gallery.length > 0 && (
        <PreviewSection title="Gallery">
          <PreviewMediaGrid items={gallery} />
        </PreviewSection>
      )}

      <PreviewSection title="Links">
        <PreviewLinks links={frontmatter.links ?? []} />
      </PreviewSection>
    </PreviewRoot>
  );
}
