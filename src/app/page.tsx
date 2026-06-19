import Link from "next/link";
import { getDataset } from "@/lib/data";
import { getHighlightVideos, getNews } from "@/lib/feeds";
import { computeStandings } from "@/lib/standings";
import { analyzeGroup, focusBranches } from "@/lib/scenario/engine";
import { koreaKnockout } from "@/lib/bracket";
import { KOREA, teamKo, getTeam } from "@/lib/teams";
import { kstDate, kstDateTime, kstStamp, relativeTo } from "@/lib/format";
import { SectionHeading, SourceFooter, TeamLabel, StatusPill, Flag } from "@/components/ui";
import { StandingsTable } from "@/components/standings-table";
import { ScenarioSummary } from "@/components/scenario-summary";
import { MatchList } from "@/components/match-list";
import { ScoreboardStrip } from "@/components/scoreboard-strip";
import { WatchLinks } from "@/components/watch-links";
import { KoreaKnockout } from "@/components/korea-knockout";
import { HighlightVideos } from "@/components/highlight-videos";
import { NewsFeed } from "@/components/news-feed";
import { DataError } from "@/components/data-error";
import { Reveal, CountUp, TiltCard } from "@/components/motion";
import { IconPlay, IconNews, IconBroadcast } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
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
  const koreaScenario = scenario.teams.find((t) => t.team === KOREA)!;
  const koBlocks = koreaKnockout(matches);
  const koreaAlive = scenario.remaining.length > 0;

  const koreaNext = matches
    .filter((m) => (m.team1 === KOREA || m.team2 === KOREA) && !m.score)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))[0];
  const koreaLast = matches
    .filter((m) => (m.team1 === KOREA || m.team2 === KOREA) && m.score)
    .sort((a, b) => (b.kickoff ?? 0) - (a.kickoff ?? 0))[0];

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
      {/* 히어로 + 다음 경기 */}
      <section className="relative pt-2">
        <div className="flex flex-col gap-5">
          <Reveal>
            <p className="text-sm font-medium text-muted">2026 FIFA 월드컵 · 경우의수.kr</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              <span className="gradient-primary">월드컵 경우의수</span> — 한국 32강
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted text-balance">
              조별리그 남은 경기별 진출 경우의 수를 FIFA 규정대로 계산하는 월드컵 경우의수 사이트입니다.
            </p>
          </Reveal>

          {koreaNext ? (
            <Reveal delay={80}>
              <TiltCard className="panel relative overflow-hidden p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="pulse-dot inline-block size-1.5 rounded-full bg-primary" />
                    다음 경기 · {koreaGroup}조
                  </span>
                  <span className="tnum">{relativeTo(koreaNext.kickoff)}</span>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <div className="flex flex-col items-center gap-2">
                    <Flag name={koreaNext.team1} size={40} />
                    <TeamLabel name={koreaNext.team1} bold className="text-center text-sm" />
                  </div>
                  <span className="font-mono text-lg font-medium text-muted">VS</span>
                  <div className="flex flex-col items-center gap-2">
                    <Flag name={koreaNext.team2} size={40} />
                    <TeamLabel name={koreaNext.team2} bold className="text-center text-sm" />
                  </div>
                </div>
                <p className="my-4 text-center text-sm text-muted">
                  {kstDateTime(koreaNext.kickoff)} · {koreaNext.ground}
                </p>
                <WatchLinks />
              </TiltCard>
            </Reveal>
          ) : koreaLast ? (
            <Reveal delay={80}>
              <div className="panel p-6 text-center">
                <p className="text-xs font-medium text-muted">최근 경기</p>
                <div className="mt-3 flex items-center justify-center gap-4 text-lg font-semibold">
                  <TeamLabel name={koreaLast.team1} className="flex-row-reverse" />
                  <span className="font-mono tnum">
                    {koreaLast.score![0]} : {koreaLast.score![1]}
                  </span>
                  <TeamLabel name={koreaLast.team2} />
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* 한국 진출 시나리오 (독단 한 줄) */}
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

        <div className="panel p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusPill status={koreaScenario.status} />
            <span className="text-sm text-muted tnum">
              직행{" "}
              <CountUp value={Math.round(koreaScenario.advanceRate * 100)} suffix="%" className="font-semibold text-success" />
              {" · "}3위{" "}
              <CountUp value={Math.round(koreaScenario.thirdRate * 100)} suffix="%" className="font-semibold text-warning" />
              {" · "}탈락{" "}
              <CountUp value={Math.round(koreaScenario.outRate * 100)} suffix="%" className="font-semibold text-danger" />
            </span>
          </div>
          <ScenarioSummary focus={KOREA} branches={branches} />
          <p className="mt-3 text-xs text-muted">
            {scenario.exact
              ? `남은 ${scenario.remaining.length}경기, 모든 스코어 조합 ${scenario.totalCombos.toLocaleString()}가지를 FIFA 규정 기준으로 계산`
              : `남은 ${scenario.remaining.length}경기 근사 계산(${scenario.totalCombos.toLocaleString()}조합)`}
          </p>
        </div>
      </Reveal>

      {/* 결과별 32강 상대 | A조 순위 (한 줄) */}
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">


        <Reveal as="section" delay={40}>
          <SectionHeading
            aside={
              <Link href={`/scenario?g=${koreaGroup}`} className="text-accent hover:underline">
                {koreaGroup}조 상세 →
              </Link>
            }
          >
            {koreaGroup}조 순위
          </SectionHeading>
          <div className="panel overflow-hidden px-1">
            <StandingsTable rows={standings} />
          </div>
        </Reveal>
        <Reveal as="section" delay={40}>
          <SectionHeading
            aside={
              koreaAlive ? (
                <Link href="/bracket" className="text-accent hover:underline">
                  대진표 →
                </Link>
              ) : null
            }
          >
            결과별 32강 상대
          </SectionHeading>
          {koreaAlive ? (
            <KoreaKnockout blocks={koBlocks} />
          ) : (
            <div className="grid place-items-center rounded-2xl border border-dashed py-8 text-sm text-muted">
              조별리그 종료 — 최종 결과를 확인하세요.
            </div>
          )}
        </Reveal>
      </div>

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
