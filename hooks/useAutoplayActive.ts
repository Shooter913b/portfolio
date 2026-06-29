"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports whether an autoplaying widget should currently advance: `true` only
 * while its element is on-screen and the tab is visible. Callers attach `ref`
 * to the widget root and AND `active` into their own paused / reduced-motion
 * checks, so off-screen and backgrounded carousels stop spending timers.
 */
export function useAutoplayActive<T extends Element = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = false;
    let visible = !document.hidden;
    const update = () => setActive(onScreen && visible);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      },
      { rootMargin: "100px 0px" }
    );
    observer.observe(el);

    const onVisibility = () => {
      visible = !document.hidden;
      update();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { ref, active };
}
