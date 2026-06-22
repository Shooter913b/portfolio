"use client";

import Script from "next/script";

type GoatCounterProps = {
  enabled?: boolean;
};

export function GoatCounter({ enabled = true }: GoatCounterProps) {
  const site = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE;
  if (!enabled || !site) return null;

  return (
    <Script
      defer
      data-goatcounter={`https://${site}.goatcounter.com/count`}
      src={`https://${site}.goatcounter.com/count.js`}
      strategy="afterInteractive"
    />
  );
}
