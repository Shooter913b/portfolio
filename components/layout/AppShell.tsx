"use client";

import { usePathname } from "next/navigation";

import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { WireframeBackground } from "@/components/layout/WireframeBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Keying on the route remounts the loader on every navigation, so the flight
  // replays and covers the transition instead of only running on first load.
  const pathname = usePathname();

  return (
    <>
      <WireframeBackground />
      <LoadingScreen key={pathname} isHome={pathname === "/"} />
      <div className="relative z-10">{children}</div>
    </>
  );
}
