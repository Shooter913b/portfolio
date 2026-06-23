import { cn } from "@/lib/cn";

/** Official GoatCounter CDN — not hosted on your-site.goatcounter.com */
export const GOATCOUNTER_SCRIPT = "https://gc.zgo.at/count.js";

export function goatCounterEndpoint(siteCode: string): string {
  return `https://${siteCode}.goatcounter.com/count`;
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
