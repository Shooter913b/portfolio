"use client";

import { GoatCounter } from "@/components/analytics/GoatCounter";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { WireframeBackground } from "@/components/layout/WireframeBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WireframeBackground />
      <LoadingScreen />
      <GoatCounter />
      <div className="relative z-10">{children}</div>
    </>
  );
}
