"use client";

import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { WireframeBackground } from "@/components/layout/WireframeBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WireframeBackground />
      <LoadingScreen />
      <div className="relative z-10">{children}</div>
    </>
  );
}
