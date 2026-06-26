const LINKS = [
  {
    label: "네이버 스포츠",
    desc: "실시간 중계·문자중계",
    href: "https://m.sports.naver.com/fifaworldcup2026",
    domain: "sports.naver.com",
  },
  {
    label: "치지직",
    desc: "온라인 생중계",
    href: "https://chzzk.naver.com/home/sports/fifa-worldcup-2026",
    domain: "chzzk.naver.com",
  },
  {
    label: "JTBC",
    desc: "중계·하이라이트",
    href: "https://news.jtbc.co.kr/worldcup2026",
    domain: "news.jtbc.co.kr",
  },
  {
    label: "FIFA",
    desc: "기록·영상",
    href: "https://www.fifa.com/ko/tournaments/mens/worldcup/canadamexicousa2026",
    domain: "fifa.com",
  },
] as const;

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function WatchLinks({ tone = "default" }: { tone?: "default" | "hero" }) {
  const isHero = tone === "hero";
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <span className={`mr-0.5 text-[11px] ${isHero ? "text-white/60" : "text-muted"}`}>
        중계
      </span>
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`${l.label} — ${l.desc}`}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
            isHero
              ? " bg-white/10 text-white/90 hover:border-white/40 hover:text-white"
              : " bg-[var(--color-card)] hover:border-primary/30 hover:text-primary"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconUrl(l.domain)}
            alt=""
            aria-hidden
            width={14}
            height={14}
            className="size-3.5 shrink-0 rounded-[2px]"
            loading="lazy"
          />
          {l.label}
        </a>
      ))}
    </div>
  );
}
