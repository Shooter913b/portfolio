export function trackResumeDownload(): void {
  if (typeof window === "undefined") return;
  const goatcounter = (
    window as Window & {
      goatcounter?: { count: (opts: { path: string; event: boolean }) => void };
    }
  ).goatcounter;
  goatcounter?.count({ path: "resume-download", event: true });
}

export function trackTimelineDetailOpen(entryId: string): void {
  if (typeof window === "undefined") return;
  const goatcounter = (
    window as Window & {
      goatcounter?: { count: (opts: { path: string; event: boolean }) => void };
    }
  ).goatcounter;
  goatcounter?.count({ path: `timeline-detail/${entryId}`, event: true });
}
