/** Canonical share URL for an expanded timeline entry. */
export function timelineEntryHref(entryId: string): string {
  return `/?entry=${encodeURIComponent(entryId)}#timeline`;
}

/**
 * Keep the address bar in sync with the open overlay without involving the
 * Next.js router — router.replace would re-fire the deep-link effect.
 */
export function syncTimelineEntrySearchParam(entryId: string | null): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get("entry");

  if (entryId) {
    if (current === entryId) {
      if (!url.hash) {
        url.hash = "timeline";
        window.history.replaceState(
          window.history.state,
          "",
          `${url.pathname}${url.search}${url.hash}`
        );
      }
      return;
    }
    url.searchParams.set("entry", entryId);
    if (url.pathname === "/" && url.hash !== "#timeline") {
      url.hash = "timeline";
    }
  } else if (current) {
    url.searchParams.delete("entry");
  } else {
    return;
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`
  );
}
