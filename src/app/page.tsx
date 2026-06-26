import Link from "next/link";
import { getDataset } from "@/lib/data";
import { getHighlightVideos, getNews } from "@/lib/feeds";
import { computeStandings } from "@/lib/standings";
import { analyzeGroup, focusBranches, analyzeThirdFollowUp } from "@/lib/scenario/engine";
import { focusThirdPlaceWildcard } from "@/lib/scenario/third-place";
import { analyzeKoreaSurvival } from "@/lib/scenario/korea-survival";
import { getWatchMatches } from "@/lib/scenario/watch-matches";
import { koreaKnockout } from "@/lib/bracket";
import { KOREA, teamKo, getTeam } from "@/lib/teams";
import { kstDate, kstStamp } from "@/lib/format";
import { SectionHeading, SourceFooter, StatusPill } from "@/components/ui";
import { HomeHero } from "@/components/home-hero";
import { ScenarioSummary } from "@/components/scenario-summary";
import { MatchList } from "@/components/match-list";
import { ScoreboardStrip } from "@/components/scoreboard-strip";
import { KoreaGroupTabs } from "@/components/korea-group-tabs";
import { HighlightVideos } from "@/components/highlight-videos";
import { NewsFeed } from "@/components/news-feed";
import { DataError } from "@/components/data-error";
import { Reveal, CountUp } from "@/components/motion";
import { IconPlay, IconNews } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { AdBanner } from "@/components/ads/ad-unit";
import { pageMetadata, sportsEventJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "월드컵 경우의수 — 한국 32강 진출 계산",
  description:
    "월드컵 경우의수 사이트. 2026 FIFA 월드컵 조별리그 남은 경기별 진출 경우의 수, 대한민국 32강 시나리오, A조 순위, 경기 일정을 실데이터로 확인하세요.",
  path: "/",
  keywords: [
    "월드컵 경우의수",
    "월드컵 경우의수 사이트",
    "월드컵 진출 경우의수",
    "한국 월드컵 경우의수",
    "대한민국 32강",
    "A조 순위",
  ],
});

export const revalidate = 3600;

export default async function HomePage() {
  let data;
  try {
    data = await getDataset();
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }

  const { matches, fetchedAt } = data;
  const [videos, news] = await Promise.all([
    getHighlightVideos(6),
    getNews(7),
  ]);

  const koreaGroup = getTeam(KOREA)!.group;
  const standings = computeStandings(matches, koreaGroup);
  const scenario = analyzeGroup(matches, koreaGroup);
  const branches = focusBranches(matches, koreaGroup, KOREA);
  const thirdFollowUp = analyzeThirdFollowUp(matches, koreaGroup, KOREA, "L");
  const thirdPlaceWildcard = focusThirdPlaceWildcard(matches, koreaGroup, KOREA);
  const survival = analyzeKoreaSurvival(matches, koreaGroup, KOREA);
  const koreaScenario = scenario.teams.find((t) => t.team === KOREA)!;
  const statusMap = Object.fromEntries(
    scenario.teams.map((t) => [t.team, t.status]),
  );
  const koBlocks = koreaKnockout(matches);

  const koreaNext = matches
    .filter((m) => (m.team1 === KOREA || m.team2 === KOREA) && !m.score)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))[0];
  const koreaLast = matches
    .filter((m) => (m.team1 === KOREA || m.team2 === KOREA) && m.score)
    .sort((a, b) => (b.kickoff ?? 0) - (a.kickoff ?? 0))[0];

  const watchMatches = getWatchMatches(matches);

  const todayLabel = kstDate(Date.now());
  const todayMatches = matches
    .filter((m) => m.kickoff && kstDate(m.kickoff) === todayLabel)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0));

  const stamp = kstStamp(fetchedAt);

  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={[
          sportsEventJsonLd(),
          faqJsonLd([
            {
              question: "월드컵 경우의수는 어떻게 계산하나요?",
              answer:
                "조별리그 남은 경기의 모든 스코어 조합을 FIFA 2026 순위 규정(승점, 승자승, 골득실, 다득점, FIFA 랭킹)에 따라 계산합니다.",
            },
            {
              question: "한국 32강 진출 경우의수는 어디서 보나요?",
              answer:
                "홈과 시나리오 페이지에서 A조 대한민국 기준 32강 직행·3위·탈락 비율과 경기 결과별 진출 조건을 확인할 수 있습니다.",
            },
            {
              question: "월드컵 경우의수 사이트는 실제 데이터를 쓰나요?",
              answer:
                "openfootball 경기 결과와 FIFA 규정을 기반으로 하며, 더미 데이터는 사용하지 않습니다.",
            },
          ]),
        ]}
      />
      <HomeHero
        koreaGroup={koreaGroup}
        nextMatch={
          koreaNext
            ? {
                team1: koreaNext.team1,
                team2: koreaNext.team2,
                kickoff: koreaNext.kickoff,
                ground: koreaNext.ground,
                group: koreaGroup,
              }
            : undefined
        }
        lastMatch={
          !koreaNext && koreaLast?.score
            ? {
                team1: koreaLast.team1,
                team2: koreaLast.team2,
                score: koreaLast.score,
              }
            : undefined
        }
        watchMatches={watchMatches}
      />

      <AdBanner className="my-2" />

      {/* 한국 진출 시나리오 */}
      <Reveal as="section" delay={40}>
        <SectionHeading
          aside={
            <Link href="/scenario" className="text-accent hover:underline">
              전체 경우의 수 →
            </Link>
          }
        >
          한국 진출 시나리오
        </SectionHeading>

        {/* 상태 배너 */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[var(--color-kor-gold)]/20 bg-[var(--color-kor-gold-soft)]/40 px-4 py-3">
          <StatusPill status={koreaScenario.status} />
          {survival ? (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted">와일드카드 진출</span>
              <CountUp
                value={Math.round(survival.qualifyRate * 100)}
                suffix="%"
                className="text-2xl font-black tabular-nums text-[var(--color-kor-gold)]"
              />
              <span className="rounded bg-[var(--color-kor-gold)] px-1.5 py-0.5 text-[11px] font-bold text-white">
                {survival.clinch}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted tnum">
              직행{" "}
              <CountUp value={Math.round(koreaScenario.advanceRate * 100)} suffix="%" className="font-semibold text-success" />
              {" · "}3위{" "}
              <CountUp value={Math.round(koreaScenario.thirdRate * 100)} suffix="%" className="font-semibold text-warning" />
              {" · "}탈락{" "}
              <CountUp value={Math.round(koreaScenario.outRate * 100)} suffix="%" className="font-semibold text-danger" />
            </span>
          )}
          <span className="ml-auto text-xs text-muted">
            {scenario.remaining.length === 0
              ? `${koreaGroup}조 조별리그 종료`
              : `남은 ${scenario.remaining.length}경기 · ${scenario.totalCombos.toLocaleString()}조합`}
          </span>
        </div>

        {/* 남은 경기 결과별 분기 (조별리그 진행 중일 때만) */}
        {branches.length > 0 && (
          <div className="mb-4">
            <ScenarioSummary
              focus={KOREA}
              branches={branches}
              totalCombos={scenario.totalCombos}
              thirdFollowUp={thirdFollowUp}
              thirdPlaceWildcard={thirdPlaceWildcard}
              focusGroup={koreaGroup}
            />
          </div>
        )}

        {/* 3위 순위권 | A조 순위 | 32강 상대 */}
        <KoreaGroupTabs
          group={koreaGroup}
          standings={standings}
          statusMap={statusMap}
          koBlocks={koBlocks}
          koDecided={branches.length === 0}
          survival={survival}
          totalCombos={scenario.totalCombos}
        />
      </Reveal>

      <AdBanner className="my-2" />

      {/* 뉴스 */}
      <Reveal as="section" delay={40}>
        <SectionHeading
          aside={
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <IconNews width={13} height={13} /> 실시간 RSS
            </span>
          }
        >
          월드컵 뉴스
        </SectionHeading>
        <NewsFeed items={news} />

      </Reveal>

      {/* 오늘의 경기 (독단 한 줄) */}
      <Reveal as="section" delay={40}>
        <SectionHeading aside={<span className="tnum text-xs">{todayLabel}</span>}>
          오늘의 경기
        </SectionHeading>
        {todayMatches.length > 0 ? (
          <div className="panel px-4">
            <MatchList matches={todayMatches} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted">
            오늘 예정된 경기가 없습니다.
          </div>
        )}
      </Reveal>

      {/* 스코어보드 */}
      <Reveal as="section" delay={40}>
        <SectionHeading
          aside={
            <Link href="/matches" className="text-accent hover:underline">
              전체 일정 →
            </Link>
          }
        >
          스코어보드
        </SectionHeading>
        <ScoreboardStrip matches={matches} />
      </Reveal>

      {/* 하이라이트 영상 */}
      <Reveal as="section" delay={40}>
        <SectionHeading
          aside={
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <IconPlay width={13} height={13} /> FIFA 공식
            </span>
          }
        >
          하이라이트 영상
        </SectionHeading>
        <HighlightVideos videos={videos} />
        <SourceFooter
          sources={["openfootball", "FIFA·연합뉴스·동아 RSS"]}
          fetchedAt={stamp}
          note="순위·시나리오는 자체 계산"
        />
      </Reveal>
    </div>
  );
}
