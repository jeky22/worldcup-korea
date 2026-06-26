"use client";

import { useEffect, useRef, useState } from "react";

const ADFIT_SRC = "//t1.kakaocdn.net/kas/static/ba.min.js";

type FailRegistry = Record<string, () => void>;

/**
 * 카카오 애드핏 광고.
 * - 광고가 실제로 채워질 때만 영역(라벨 + 박스)을 노출해 자리를 차지한다.
 *   채워지기 전이나 no-fill 시에는 레이아웃 공간을 전혀 차지하지 않는다.
 * - ba.min.js는 로드 시점의 .kakao_ad_area만 렌더링하므로, SPA 라우팅에서도
 *   표시되도록 마운트마다 ins + 스크립트를 새로 주입한다.
 * - 성공 콜백이 없으므로 ins 내부에 iframe이 주입되는 시점을 감지해 노출한다.
 */
export function KakaoAdFit({
  unit,
  width,
  height,
  className = "",
}: {
  unit: string;
  width: number;
  height: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !unit) return;

    setFilled(false);
    container.innerHTML = "";

    const cbName = `__adfitFail_${Math.random().toString(36).slice(2)}`;
    const registry = window as unknown as FailRegistry;
    registry[cbName] = () => setFilled(false);

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));
    ins.setAttribute("data-ad-onfail", cbName);

    // 광고가 채워지면 ins 내부에 iframe이 주입된다. 이때만 영역을 노출한다.
    const observer = new MutationObserver(() => {
      if (ins.querySelector("iframe")) {
        setFilled(true);
        observer.disconnect();
      }
    });
    observer.observe(ins, { childList: true, subtree: true });

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = ADFIT_SRC;

    container.appendChild(ins);
    container.appendChild(script);

    return () => {
      observer.disconnect();
      container.innerHTML = "";
      delete registry[cbName];
    };
  }, [unit, width, height]);

  if (!unit) return null;

  return (
    <aside
      className={`ad-unit ${filled ? className : ""}`}
      aria-label="광고"
    >
      {filled && (
        <p className="mb-1.5 text-center text-[10px] font-medium tracking-wider text-muted">
          광고
        </p>
      )}
      <div className="flex justify-center">
        {/* ins는 마운트 즉시 주입되어야 채워질 수 있으므로 항상 렌더링한다.
            채워지기 전엔 크기를 지정하지 않아(자식 ins가 display:none) 0 높이로 접힌다. */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-lg"
          style={filled ? { width, height } : undefined}
        />
      </div>
    </aside>
  );
}
