"use client";

import Script from "next/script";
import { useEffect } from "react";
import { PUSH_AD_ENABLED } from "@/lib/ads";

/**
 * 푸시/팝 광고 통합.
 * - 코드 삽입 방식: quge5.com 인페이지 태그(zone 253946)를 로드한다.
 * - 파일 방식: /sw.js (public/sw.js) 를 루트 스코프로 등록한다.
 * - NEXT_PUBLIC_PUSH_AD=off 로 전체 비활성화. 끄면 기존 SW 등록도 해제한다.
 */
export function PushAd() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (!PUSH_AD_ENABLED) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          if (reg.active?.scriptURL.endsWith("/sw.js")) reg.unregister();
        }
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* 등록 실패는 무시 */
    });
  }, []);

  if (!PUSH_AD_ENABLED) return null;

  return (
    <Script
      id="push-ad-tag"
      src="https://quge5.com/88/tag.min.js"
      data-zone="253946"
      data-cfasync="false"
      strategy="afterInteractive"
    />
  );
}
