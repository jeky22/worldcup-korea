"use client";

import { useEffect, useRef, useState } from "react";

function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function useInView<T extends HTMLElement>(
  threshold = 0,
  // 뷰포트 아래로 400px 들어오기 전에 미리 트리거해 "빈 칸"이 보이지 않게 한다.
  rootMargin = "0px 0px 400px 0px",
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);
  return { ref, inView };
}

/** 스크롤 진입 시 페이드 + 슬라이드업 */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : `translateY(${y}px)`,
        transition: `opacity 600ms var(--ease-out-expo) ${delay}ms, transform 600ms var(--ease-out-expo) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/** 0 → value 카운트업 (뷰 진입 시 1회) */
export function CountUp({
  value,
  duration = 1300,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;
    if (prefersReduced()) {
      setN(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** 마우스 위치에 따라 살짝 기우는 3D 카드 */
export function TiltCard({
  children,
  className = "",
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) scale(1.01)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transition: "transform 250ms var(--ease-out-expo)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}

/** 뷰 진입 시 0 → width%로 자라는 막대 */
export function GrowBar({
  width,
  className = "",
  delay = 0,
  title,
}: {
  width: number; // 0~1
  className?: string;
  delay?: number;
  title?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      title={title}
      className={className}
      style={{
        width: inView ? `${width * 100}%` : "0%",
        transition: `width 800ms var(--ease-out-expo) ${delay}ms`,
      }}
    />
  );
}
