"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdFormat = "auto" | "horizontal" | "rectangle" | "vertical";

export function AdUnit({
  slot = ADSENSE_SLOT,
  format = "auto",
  className = "",
  minHeight = 90,
}: {
  slot?: string;
  format?: AdFormat;
  className?: string;
  minHeight?: number;
}) {
  const filled = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || filled.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      filled.current = true;
    } catch {
      /* AdSense blocked or not ready */
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <aside className={`ad-unit ${className}`} aria-label="광고">
      <p className="mb-1.5 text-center text-[10px] font-medium tracking-wider text-muted">
        광고
      </p>
      <div
        className="overflow-hidden rounded-lg border border-dashed border-[var(--color-border)] bg-surface/40"
        style={{ minHeight }}
      >
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}

/** 가로형 배너 (본문 상·하단) */
export function AdBanner({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      format="horizontal"
      className={className}
      minHeight={90}
    />
  );
}

/** 본문 중간용 (모바일·데스크톱 반응형) */
export function AdInFeed({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      format="auto"
      className={className}
      minHeight={250}
    />
  );
}
