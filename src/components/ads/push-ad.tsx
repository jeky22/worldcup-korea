"use client";

import { useEffect } from "react";
import { PUSH_AD_ENABLED } from "@/lib/ads";

/**
 * 3nbf4.com 푸시/팝 광고 서비스워커 등록.
 * - /sw.js (public/sw.js) 를 루트 스코프로 등록한다.
 * - NEXT_PUBLIC_PUSH_AD=off 로 비활성화 가능. 끄면 기존 등록도 해제한다.
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

  return null;
}
