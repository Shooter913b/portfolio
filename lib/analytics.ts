function trackGoatCounterEvent(path: string): void {
  if (typeof window === "undefined") return;
  const goatcounter = (
    window as Window & {
      goatcounter?: { count: (opts: { path: string; event: boolean }) => void };
    }
  ).goatcounter;
  goatcounter?.count({ path, event: true });
}

export function trackResumeDownload(): void {
  trackGoatCounterEvent("resume-download");
}

export function trackTimelineDetailOpen(entryId: string): void {
  trackGoatCounterEvent(`timeline-detail/${entryId}`);
}

export function trackLogPostView(slug: string): void {
  trackGoatCounterEvent(`log/${slug}`);
}
