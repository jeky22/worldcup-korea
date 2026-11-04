import Link from "next/link";

/** 홈 노출용 다음 대회 요약 — 상세는 /next */
const ITEMS = [
  {
    name: "AFC 아시안컵 2027",
    period: "2027. 12. 23 ~ 2028. 1. 21",
    place: "사우디아라비아",
    note: "중동 정세로 12월 연기 · 한국 본선 확정",
    tone: "text-warning",
    label: "연기",
  },
  {
    name: "LA 올림픽 남자축구",
    period: "2028. 7월",
    place: "미국",
    note: "아시아 티켓 2장 · U-23 예선 통과 필요",
    tone: "text-accent",
    label: "예선 예정",
  },
  {
    name: "FIFA 월드컵 2030",
    period: "2030년 여름",
    place: "스페인·포르투갈·모로코",
    note: "48개국 · 11회 연속 진출 도전",
    tone: "text-muted",
    label: "예선 추후",
  },
];

export function NextTournaments() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {ITEMS.map((t) => (
        <Link
          key={t.name}
          href="/next"
          className="lift group block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold tracking-tight">{t.name}</h3>
            <span className={`shrink-0 text-[11px] font-bold ${t.tone}`}>{t.label}</span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-ink/90 tnum">{t.period}</p>
          <p className="text-xs text-muted">{t.place}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{t.note}</p>
        </Link>
      ))}
    </div>
  );
}
