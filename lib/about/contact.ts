import type { About, AboutContactLinks } from "@/lib/schemas/about";

export type ContactFieldKind = "url" | "username" | "url-or-handle";

export type ContactFieldDef = {
  key: keyof AboutContactLinks;
  label: string;
  hint?: string;
  kind: ContactFieldKind;
  vcardType?: string;
};

export const CONTACT_LINK_FIELDS: ContactFieldDef[] = [
  { key: "linkedin", label: "LinkedIn URL", kind: "url", vcardType: "linkedin" },
  { key: "github", label: "GitHub URL", kind: "url", vcardType: "github" },
  {
    key: "youtube",
    label: "YouTube channel",
    hint: "Channel URL or @handle",
    kind: "url-or-handle",
    vcardType: "youtube",
  },
  {
    key: "discord",
    label: "Discord username",
    hint: "Username only (e.g. Shooter913b)",
    kind: "username",
    vcardType: "discord",
  },
  {
    key: "twitter",
    label: "X / Twitter",
    hint: "Profile URL or @handle",
    kind: "url-or-handle",
    vcardType: "twitter",
  },
  { key: "instagram", label: "Instagram URL", kind: "url", vcardType: "instagram" },
  { key: "tiktok", label: "TikTok URL", kind: "url", vcardType: "tiktok" },
  { key: "threads", label: "Threads URL", kind: "url", vcardType: "threads" },
];

export type ContactItem = {
  id: string;
  label: string;
  value: string;
  href: string | null;
  external: boolean;
  copyOnly: boolean;
};

export function isContactValueSet(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function stripUrlPrefix(value: string): string {
  return value.replace(/^https?:\/\/(www\.)?/, "");
}

function resolveHandleUrl(value: string, baseUrl: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `${baseUrl}/${handle}`;
}

export function resolveContactHref(
  key: keyof AboutContactLinks,
  value: string
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  switch (key) {
    case "discord":
      return null;
    case "youtube":
      return resolveHandleUrl(trimmed, "https://youtube.com");
    case "twitter":
      return resolveHandleUrl(trimmed, "https://x.com");
    default:
      return trimmed;
  }
}

export function formatContactDisplay(
  key: keyof AboutContactLinks,
  value: string
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (key === "discord") {
    return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  }

  if (key === "youtube" || key === "twitter") {
    if (trimmed.startsWith("@")) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return stripUrlPrefix(trimmed);
    return `@${trimmed.replace(/^@/, "")}`;
  }

  if (/^https?:\/\//i.test(trimmed)) return stripUrlPrefix(trimmed);
  return trimmed;
}

export function listContactItems(about: About): ContactItem[] {
  const items: ContactItem[] = [];

  if (isContactValueSet(about.email)) {
    items.push({
      id: "email",
      label: "Email",
      value: about.email.trim(),
      href: `mailto:${about.email.trim()}`,
      external: false,
      copyOnly: false,
    });
  }

  for (const field of CONTACT_LINK_FIELDS) {
    const raw = about.links[field.key];
    if (!isContactValueSet(raw)) continue;

    const value = formatContactDisplay(field.key, raw);
    const href = resolveContactHref(field.key, raw);

    items.push({
      id: field.key,
      label: field.label.replace(/ URL$/, "").replace(/ channel$/, "").replace(/ username$/, ""),
      value,
      href,
      external: field.key !== "discord" && href !== null,
      copyOnly: field.key === "discord",
    });
  }

  return items;
}

export const EMPTY_CONTACT_LINKS: AboutContactLinks = {
  linkedin: "",
  github: "",
  youtube: "",
  discord: "",
  twitter: "",
  instagram: "",
  tiktok: "",
  threads: "",
};

export function normalizeContactLinks(
  links: Partial<AboutContactLinks> | undefined
): AboutContactLinks {
  return {
    linkedin: links?.linkedin ?? "",
    github: links?.github ?? "",
    youtube: links?.youtube ?? "",
    discord: links?.discord ?? "",
    twitter: links?.twitter ?? "",
    instagram: links?.instagram ?? "",
    tiktok: links?.tiktok ?? "",
    threads: links?.threads ?? "",
  };
}

export function buildVCardLines(siteName: string, siteTagline: string, siteUrl: string, about: About): string[] {
  const parts = siteName.trim().split(/\s+/);
  const family = parts.length > 1 ? parts[parts.length - 1] : "";
  const given = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${family};${given};;;`,
    `FN:${siteName}`,
    `TITLE:${siteTagline}`,
  ];

  if (isContactValueSet(about.email)) {
    lines.push(`EMAIL;TYPE=INTERNET:${about.email.trim()}`);
  }

  if (isContactValueSet(siteUrl)) {
    lines.push(`URL:${siteUrl.trim()}`);
  }

  for (const field of CONTACT_LINK_FIELDS) {
    const raw = about.links[field.key];
    if (!isContactValueSet(raw) || !field.vcardType) continue;

    const href = resolveContactHref(field.key, raw);
    const value = href ?? raw.trim();
    lines.push(`X-SOCIALPROFILE;TYPE=${field.vcardType}:${value}`);
  }

  lines.push("END:VCARD");
  return lines;
}
