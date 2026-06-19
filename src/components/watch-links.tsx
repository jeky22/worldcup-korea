import { IconExternal } from "./icons";

const LINKS = [
  {
    label: "네이버 스포츠",
    desc: "실시간 중계·문자중계",
    href: "https://m.sports.naver.com/fifaworldcup2026",
    accent: "oklch(0.6 0.17 145)",
  },
  {
    label: "치지직",
    desc: "온라인 생중계",
    href: "https://chzzk.naver.com/home/sports/fifa-worldcup-2026",
    accent: "oklch(0.7 0.15 165)",
  },
  {
    label: "JTBC",
    desc: "중계·하이라이트",
    href: "https://news.jtbc.co.kr/worldcup2026",
    accent: "oklch(0.6 0.2 25)",
  },
  {
    label: "FIFA 공식",
    desc: "기록·영상",
    href: "https://www.fifa.com/ko/tournaments/mens/worldcup/canadamexicousa2026",
    accent: "oklch(0.5 0.16 250)",
  },
];

export function WatchLinks() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="lift group relative overflow-hidden rounded-xl border bg-[var(--color-card)] p-3.5"
        >
          <span
            className="absolute inset-x-0 top-0 h-0.5"
            style={{ background: l.accent }}
          />
          <span className="block text-sm font-semibold">{l.label}</span>
          <span className="mt-0.5 block text-xs text-muted">{l.desc}</span>
          <IconExternal
            width={14}
            height={14}
            aria-hidden
            className="absolute bottom-2.5 right-3 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </a>
      ))}
    </div>
  );
}
