"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "notice-support-hide-until";

function hiddenForToday(): boolean {
  try {
    const until = localStorage.getItem(STORAGE_KEY);
    return until !== null && Date.now() < Number(until);
  } catch {
    return false;
  }
}

/**
 * 메인 진입 시 뜨는 공지 팝업. 후원 페이지로 연결된다.
 * "오늘 하루 보지 않기"를 누르면 24시간 동안 다시 뜨지 않는다.
 */
export function NoticePopup() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (hiddenForToday()) return;
    const t = setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => setShown(true));
    }, 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setShown(false);
    setTimeout(() => setOpen(false), 200);
  }

  function hideToday() {
    try {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, String(tomorrow));
    } catch {
      /* 저장 실패 무시 */
    }
    close();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-title"
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
    >
      {/* 배경 */}
      <button
        type="button"
        aria-label="공지 닫기"
        onClick={close}
        className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 카드 */}
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl transition-all duration-200 ${
          shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        {/* 아련한 대표팀 이미지 */}
        <div className="relative aspect-[16/10] w-full">
          <Image
            src="/image/202601200936282560_0.webp"
            alt="대한민국 축구 국가대표팀"
            fill
            sizes="384px"
            className="object-cover object-top saturate-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/20 to-transparent" />
        </div>

        {/* 닫기 X */}
        <button
          type="button"
          onClick={close}
          aria-label="닫기"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/35 text-white/90 backdrop-blur transition-colors hover:bg-black/55"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="px-5 pb-5 pt-1">
          <h2 id="notice-title" className="text-lg font-bold tracking-tight text-balance">
            잠깐, 개발자 이야기 듣고 가실래요?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            이 사이트를 혼자 밤새 만든 개발자가 있습니다.
            웃기고도 짠한 사연이 하나 있는데, 잠깐만 들어주실 수 있나요?
          </p>

          <Link
            href="/support"
            onClick={close}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            개발자 이야기 들으러 가기 →
          </Link>

          <button
            type="button"
            onClick={hideToday}
            className="mt-2 w-full py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
