"use client";

import Script from "next/script";
import { cn } from "@/lib/cn";

type GoatCounterProps = {
  enabled?: boolean;
};

/** Official GoatCounter CDN — not hosted on your-site.goatcounter.com */
const GOATCOUNTER_SCRIPT = "https://gc.zgo.at/count.js";

export function goatCounterEndpoint(siteCode: string): string {
  return `https://${siteCode}.goatcounter.com/count`;
}

export function GoatCounter({ enabled = true }: GoatCounterProps) {
  const site = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE?.trim();
  if (!enabled || !site) return null;

  const endpoint = goatCounterEndpoint(site);
  const allowLocal = process.env.NODE_ENV === "development";

  return (
    <Script
      id="goatcounter"
      defer
      data-goatcounter={endpoint}
      data-goatcounter-settings={allowLocal ? JSON.stringify({ allow_local: true }) : undefined}
      src={GOATCOUNTER_SCRIPT}
      strategy="afterInteractive"
    />
  );
}

export function GoatCounterStatus({ className }: { className?: string }) {
  const site = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE?.trim();
  if (!site) {
    return (
      <p className={cn("text-xs text-text-muted", className)}>
        GoatCounter is not configured. Set{" "}
        <code className="font-mono">NEXT_PUBLIC_GOATCOUNTER_SITE</code> to your site code
        (e.g. <code className="font-mono">elfrick</code>).
      </p>
    );
  }

  return (
    <p className={cn("text-xs text-text-muted", className)}>
      Dashboard:{" "}
      <a
        href={`https://${site}.goatcounter.com`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-blue hover:underline"
      >
        https://{site}.goatcounter.com
      </a>
    </p>
  );
}
