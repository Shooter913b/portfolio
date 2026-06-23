function trackGoatCounterEvent(path: string): void {
  if (typeof window === "undefined") return;

  const send = () => {
    const goatcounter = (
      window as Window & {
        goatcounter?: { count: (opts: { path: string; event: boolean }) => void };
      }
    ).goatcounter;
    goatcounter?.count({ path, event: true });
  };

  if (
    (
      window as Window & {
        goatcounter?: { count: (opts: { path: string; event: boolean }) => void };
      }
    ).goatcounter?.count
  ) {
    send();
    return;
  }

  let attempts = 0;
  const id = window.setInterval(() => {
    attempts += 1;
    const goatcounter = (
      window as Window & {
        goatcounter?: { count: (opts: { path: string; event: boolean }) => void };
      }
    ).goatcounter;
    if (goatcounter?.count) {
      send();
      window.clearInterval(id);
    } else if (attempts >= 24) {
      window.clearInterval(id);
    }
  }, 250);
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
