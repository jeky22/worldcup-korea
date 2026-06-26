"use client";

import Script from "next/script";
import { ADSENSE_CLIENT, ADFIT_ENABLED } from "@/lib/ads";

/** AdSense 스크립트 — layout에서 1회 로드 (애드핏 사용 시엔 불필요하므로 생략) */
export function AdProvider() {
  if (ADFIT_ENABLED) return null;
  if (!ADSENSE_CLIENT) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
