"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconHome,
  IconCalendar,
  IconScenario,
  IconBracket,
  IconTeam,
} from "./icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

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

  return (
    <>
      {/* 데스크톱 상단 바 */}
      <header className="sticky top-0 z-[200] hidden border-b border-[var(--color-border)]/70 bg-[var(--color-bg)]/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-7 px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="relative grid size-7 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-[var(--color-on-primary)] shadow-sm">
              26
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
    </>
  );
}
