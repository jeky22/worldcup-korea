"use client";

import { useEffect, useRef, useState } from "react";
import {
  ADSENSE_CLIENT,
  ADSENSE_SLOT,
  ADFIT_ENABLED,
  ADFIT_UNIT_PC,
  ADFIT_UNIT_MOBILE,
} from "@/lib/ads";
import { KakaoAdFit } from "./kakao-adfit";

/** min 이상이면 true (PC). 마운트 전에는 null. */
function useIsWide(min = 768) {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [min]);
  return wide;
}

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

/**
 * 본문 광고 (상·하단). 애드핏 사용 시 화면 폭에 맞는 한 종류만 렌더링한다.
 * - PC(≥768px): 728×90 가로 배너
 * - 모바일: 320×100 배너
 */
export function AdBanner({ className = "" }: { className?: string }) {
  const wide = useIsWide(768);

  if (ADFIT_ENABLED) {
    if (wide === null) return null;
    return wide ? (
      <KakaoAdFit
        unit={ADFIT_UNIT_PC}
        width={728}
        height={90}
        className={className}
      />
    ) : (
      <KakaoAdFit
        unit={ADFIT_UNIT_MOBILE}
        width={320}
        height={100}
        className={className}
      />
    );
  }
  return <AdUnit format="horizontal" className={className} minHeight={90} />;
}
