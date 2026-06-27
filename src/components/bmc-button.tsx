"use client";

import { useEffect, useRef } from "react";

/**
 * Buy Me a Coffee 공식 위젯 버튼.
 * button.prod.min.js 는 로드되면서 자신(script) 바로 뒤에 버튼을 주입한다.
 * 따라서 컨테이너 div 안에 스크립트를 동적으로 넣어 버튼이 그 안에 그려지게 한다.
 */
export function BmcButton() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || container.querySelector("script, img")) return;

    const script = document.createElement("script");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "qhzh33t");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "");
    script.setAttribute("data-font", "Cookie");
    script.setAttribute("data-text", "개발자 돕기");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");
    container.appendChild(script);
  }, []);

  return <div ref={ref} className="flex justify-center" />;
}
