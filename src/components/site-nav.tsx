"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState, type ComponentType, type SVGProps } from "react";
import {
  IconHome,
  IconCalendar,
  IconScenario,
  IconBracket,
  IconTeam,
} from "./icons";
import { LOGO } from "@/lib/site";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const BGM_SRC = "/bgm/cheer.mp3";

function SpeakerOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m23 9-6 6" />
      <path d="m17 9 6 6" />
    </svg>
  );
}

const LINKS: {
  href: string;
  label: string;
  Icon: IconType;
  match: (p: string) => boolean;
}[] = [
  { href: "/", label: "홈", Icon: IconHome, match: (p) => p === "/" },
  { href: "/matches", label: "경기", Icon: IconCalendar, match: (p) => p.startsWith("/matches") },
  { href: "/scenario", label: "시나리오", Icon: IconScenario, match: (p) => p.startsWith("/scenario") },
  { href: "/bracket", label: "대진표", Icon: IconBracket, match: (p) => p.startsWith("/bracket") },
  { href: "/teams", label: "팀", Icon: IconTeam, match: (p) => p.startsWith("/teams") },
];

export function SiteNav() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [bgmOn, setBgmOn] = useState(false);

  async function toggleBgm() {
    const audio = audioRef.current;
    if (!audio) return;
    if (bgmOn) {
      audio.pause();
      setBgmOn(false);
      return;
    }
    try {
      audio.volume = 0.35;
      await audio.play();
      setBgmOn(true);
    } catch {
      /* 재생 차단/실패 */
    }
  }

  const bgmAria = bgmOn ? "응원가 끄기" : "응원가 켜기";

  return (
    <>
      <audio ref={audioRef} src={BGM_SRC} loop preload="none" />

      {/* 데스크톱 상단 바 */}
      <header className="sticky top-0 z-[200] hidden border-b border-[var(--color-border)]/70 bg-[var(--color-bg)]/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-7 px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="relative grid size-7 shrink-0 overflow-hidden rounded-lg shadow-sm">
              <Image
                src={LOGO}
                alt=""
                width={28}
                height={28}
                className="size-7"
                priority
              />
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
            </span>
            <span className="text-[15px]">
              월드컵 <span className="text-primary">경우의 수</span>
            </span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {LINKS.slice(1).map(({ href, label, Icon, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "text-primary"
                      : "text-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  <Icon
                    width={17}
                    height={17}
                    className={`transition-transform duration-300 ${active ? "scale-105" : "group-hover:scale-105"}`}
                  />
                  {label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={toggleBgm}
            aria-pressed={bgmOn}
            aria-label={bgmAria}
            title={bgmAria}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              bgmOn ? "text-primary" : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            {bgmOn ? <SpeakerOn /> : <SpeakerOff />}
            <span>{bgmOn ? "응원가 ON" : "응원가"}</span>
          </button>
        </div>
      </header>

      {/* 모바일 하단 탭 바 */}
      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-[200] flex h-16 items-stretch border-t border-[var(--color-border)]/70 bg-[var(--color-bg)]/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {LINKS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
              <Icon
                width={21}
                height={21}
                strokeWidth={active ? 2 : 1.75}
                className={`transition-transform duration-300 ${active ? "-translate-y-px scale-110" : ""}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 모바일: 우하단 플로팅 (콘텐츠 가로폭에 맞춰 right-4) */}
      <button
        type="button"
        onClick={toggleBgm}
        aria-pressed={bgmOn}
        aria-label={bgmAria}
        title={bgmAria}
        className="fixed bottom-20 right-4 z-[150] inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/90 px-3.5 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-xl transition-colors hover:border-primary/40 hover:text-primary md:hidden"
      >
        {bgmOn ? <SpeakerOn /> : <SpeakerOff />}
        <span>{bgmOn ? "응원가 ON" : "응원가"}</span>
        {bgmOn && (
          <span className="pulse-dot size-1.5 rounded-full bg-[var(--color-kor-red)]" />
        )}
      </button>
    </>
  );
}
