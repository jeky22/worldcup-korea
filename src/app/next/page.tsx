import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { IconExternal } from "@/components/icons";

export const metadata = pageMetadata({
  title: "다음 대회 — 아시안컵·올림픽·2030 월드컵",
  description:
    "2026 월드컵 이후 대한민국 축구 대표팀이 나설 다음 대회 정리 — 2027 AFC 아시안컵(12월 연기), 2028 LA 올림픽 남자축구, 2030 FIFA 월드컵 일정과 핵심 포인트.",
  path: "/next",
  keywords: [
    "아시안컵 일정",
    "2027 아시안컵",
    "아시안컵 연기",
    "2028 올림픽 축구",
    "LA 올림픽 남자축구",
    "2030 월드컵",
    "대한민국 축구 일정",
  ],
});

/** 다음 대회 정적 컨텐츠 — 일정 변경 시 이 배열만 갱신 */
const TOURNAMENTS = [
  {
    badge: "AFC 아시안컵 2027",
    status: "연기 확정",
    statusTone: "warning" as const,
    title: "사우디아라비아 아시안컵, 1월에서 12월로 전격 연기",
    period: "2027. 12. 23 ~ 2028. 1. 21 (변경) · 사우디아라비아",
    body: [
      "당초 2027년 1월 7일~2월 5일에 열릴 예정이던 AFC 아시안컵이 중동 정세 불안에 따른 물류·이동 차질을 이유로 2027년 12월 23일~2028년 1월 21일로 연기됐다. AFC가 2026년 11월 3일 일정 변경을 승인했으며, FIFA의 최종 승인 절차가 남아 있다.",
      "대한민국은 본선 진출을 이미 확정한 상태다. 1960년 이후 67년 만의 우승 도전이 1년 가까이 미뤄지면서, 베테랑 자원의 마지막 메이저 대회 출전 여부와 대표팀 세대교체 일정에도 변수가 생겼다.",
    ],
    points: [
      "본선 24개국 · 대한민국 진출 확정",
      "개최지: 사우디아라비아 (리야드 등)",
      "연기 사유: 중동 정세 불안 — FIFA 최종 승인 대기",
    ],
    links: [
      {
        label: "AFC Asian Cup 2027 (Wikipedia)",
        href: "https://en.wikipedia.org/wiki/2027_AFC_Asian_Cup",
      },
    ],
  },
  {
    badge: "LA 올림픽 2028",
    status: "예선 진행 예정",
    statusTone: "accent" as const,
    title: "2028 로스앤젤레스 올림픽 남자축구",
    period: "2028. 7월 · 미국 (결승전: 패서디나 로즈볼)",
    body: [
      "남자 축구는 12개국이 본선에서 겨루며, 아시아(AFC)에 배정된 본선 티켓은 단 2장이다. 23세 이하(U-23) 대표팀이 나서는 대회로, 와일드카드(연령 초과) 선수를 3명까지 포함할 수 있다.",
      "조별리그는 개회식 전인 7월 초중순 미국 여러 도시에서 분산 개최되고, 메달 경기는 패서디나 로즈볼 스타디움에서 열린다. 대한민국은 AFC U-23 아시안컵을 겸하는 예선을 통과해야 본선에 오른다.",
    ],
    points: [
      "남자 12개국 · 여자 16개국",
      "아시아 남자 본선 티켓 2장 — U-23 아시안컵이 예선 겸임",
      "와일드카드 3명 허용",
    ],
    links: [
      {
        label: "LA28 축구 일정 (olympics.com)",
        href: "https://www.olympics.com/en/news/la28-olympic-football-schedule-host-cities-confirmed",
      },
    ],
  },
  {
    badge: "FIFA 월드컵 2030",
    status: "예선 추후 시작",
    statusTone: "muted" as const,
    title: "2030 월드컵 — 3대륙 6개국 공동 개최",
    period: "2030년 여름 · 스페인·포르투갈·모로코 (+100주년 기념 남미 3경기)",
    body: [
      "월드컵 100주년을 맞는 2030년 대회는 스페인·포르투갈·모로코 3개국이 공동 개최하고, 초대 대회(1930 우루과이)를 기념해 우루과이·아르헨티나·파라과이에서 개막 경기 3경기가 열린다.",
      "본선은 2026년과 같은 48개국 체제다. 아시아 지역 예선 일정은 추후 확정되며, 대한민국은 11회 연속 본선 진출에 도전한다.",
    ],
    points: [
      "48개국 본선 · 사상 첫 3대륙 개최",
      "아시아 본선 티켓 8.5장 (2026년 기준 체제)",
      "대한민국, 11회 연속 진출 도전",
    ],
    links: [
      {
        label: "2030 FIFA World Cup (Wikipedia)",
        href: "https://en.wikipedia.org/wiki/2030_FIFA_World_Cup",
      },
    ],
  },
];

const TONE: Record<string, string> = {
  warning: "bg-warning/10 text-warning",
  accent: "bg-accent/10 text-accent",
  muted: "bg-surface text-muted",
};

export default function NextTournamentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "다음 대회", path: "/next" },
        ])}
      />

      <header>
        <h1 className="text-2xl font-bold tracking-tight">다음 대회</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          2026 월드컵은 끝났지만 대표팀의 일정은 계속됩니다. 아시안컵·올림픽·
          2030 월드컵까지, 대한민국이 나설 다음 무대를 정리했습니다.
        </p>
        <p className="mt-1 text-xs text-muted">최종 갱신: 2026. 11. 4 · 일정 변경 시 업데이트</p>
      </header>

      {TOURNAMENTS.map((t, i) => (
        <Reveal as="section" key={t.badge} delay={i * 40}>
          <SectionHeading
            aside={
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[t.statusTone]}`}
              >
                {t.status}
              </span>
            }
          >
            {t.badge}
          </SectionHeading>

          <div className="panel p-5 md:p-6">
            <h2 className="text-lg font-semibold tracking-tight text-balance">
              {t.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-accent tnum">{t.period}</p>

            <div className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink/90">
              {t.body.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>

            <ul className="mt-4 flex flex-wrap gap-2">
              {t.points.map((pt) => (
                <li
                  key={pt}
                  className="rounded-lg border border-[var(--color-border)] bg-surface/60 px-2.5 py-1 text-xs font-medium text-muted"
                >
                  {pt}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
              {t.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-primary"
                >
                  {l.label}
                  <IconExternal width={12} height={12} />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      ))}

      <p className="text-xs text-muted">
        일정·개최지는 발표 기준이며 주최 측 사정으로 변경될 수 있습니다. 아시안컵
        연기 일정은 FIFA 최종 승인 전입니다.
      </p>
    </div>
  );
}
