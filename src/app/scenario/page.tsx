import Link from "next/link";
import { getDataset } from "@/lib/data";
import { computeStandings } from "@/lib/standings";
import { analyzeGroup, focusBranches, analyzeThirdFollowUp } from "@/lib/scenario/engine";
import { thirdPlaceTable, focusThirdPlaceWildcard } from "@/lib/scenario/third-place";
import { koreaKnockout } from "@/lib/bracket";
import { GROUP_IDS, KOREA, getTeam, teamsInGroup, teamKo } from "@/lib/teams";
import { kstStamp } from "@/lib/format";
import type { GroupId } from "@/lib/types";
import { SectionHeading, SourceFooter, TeamLabel } from "@/components/ui";
import { StandingsTable } from "@/components/standings-table";
import { GroupOutcomes } from "@/components/group-outcomes";
import { ScenarioSummary } from "@/components/scenario-summary";
import { ThirdPlaceTable } from "@/components/third-place-table";
import { KoreaKnockout } from "@/components/korea-knockout";
import { DataError } from "@/components/data-error";
import { JsonLd } from "@/components/json-ld";
import { AdBanner } from "@/components/ads/ad-unit";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ g?: string; focus?: string }>;
}) {
  const { g } = await searchParams;
  const group = g && GROUP_IDS.includes(g as GroupId) ? (g as GroupId) : null;

  if (group) {
    return pageMetadata({
      title: `${group}조 진출 시나리오`,
      description: `2026 FIFA 월드컵 ${group}조 조별리그 남은 경기별 진출 경우의 수. FIFA 규정 타이브레이커 기준 순위·32강 직행·3위·탈락 확률.`,
      path: `/scenario?g=${group}`,
      keywords: [`${group}조`, "월드컵 시나리오", "조별리그 순위", "32강 진출"],
    });
  }

  return pageMetadata({
    title: "월드컵 진출 경우의수 계산",
    description:
      "월드컵 경우의수 — 2026 FIFA 월드컵 12개 조별리그 모든 스코어 조합별 진출 경우의 수. FIFA 타이브레이커, 3위 팀 순위, 대한민국 32강 상대 분석.",
    path: "/scenario",
    keywords: [
      "월드컵 경우의수",
      "월드컵 진출 경우의수",
      "월드컵 조별리그 경우의수",
      "진출 시나리오",
      "타이브레이커",
    ],
  });
}

export default async function ScenarioPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string; focus?: string }>;
}) {
  let data;
  try {
    data = await getDataset();
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }

  const sp = await searchParams;
  const group = (GROUP_IDS.includes(sp.g as GroupId) ? sp.g : getTeam(KOREA)!.group) as GroupId;
  const groupTeams = teamsInGroup(group).map((t) => t.name);
  const defaultFocus = group === getTeam(KOREA)!.group ? KOREA : groupTeams[0];
  const focus = groupTeams.includes(sp.focus ?? "") ? sp.focus! : defaultFocus;

  const standings = computeStandings(data.matches, group);
  const scenario = analyzeGroup(data.matches, group);
  const branches = focusBranches(data.matches, group, focus);
  const thirdFollowUp = analyzeThirdFollowUp(data.matches, group, focus, "L");
  const thirdPlaceWildcard = focusThirdPlaceWildcard(data.matches, group, focus);
  const thirds = thirdPlaceTable(data.matches);
  const stamp = kstStamp(data.fetchedAt);
  const isKoreaGroup = group === getTeam(KOREA)!.group;
  const koBlocks = isKoreaGroup ? koreaKnockout(data.matches) : [];

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "진출 시나리오", path: "/scenario" },
          ...(group ? [{ name: `${group}조`, path: `/scenario?g=${group}` }] : []),
        ])}
      />
      <header>
        <h1 className="text-2xl font-bold tracking-tight">월드컵 진출 경우의수</h1>
        <p className="mt-1 text-sm text-muted">
          남은 경기의 모든 스코어 조합을 FIFA 2026 순위 규정대로 계산한 월드컵 경우의수
        </p>
      </header>

      <AdBanner />

      {/* 조 선택 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {GROUP_IDS.map((g) => (
          <Link
            key={g}
            href={`/scenario?g=${g}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              g === group
                ? "bg-primary text-[var(--color-on-primary)]"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            {g}조
          </Link>
        ))}
      </div>

      {/* 순위 */}
      <section>
        <SectionHeading>{group}조 현재 순위</SectionHeading>
        <StandingsTable
          rows={standings}
          statusMap={Object.fromEntries(
            scenario.teams.map((t) => [t.team, t.status]),
          )}
        />
      </section>

      {/* 한국 32강 상대 (A조 강조) */}
      {isKoreaGroup && scenario.remaining.length > 0 && (
        <section>
          <SectionHeading
            aside={
              <Link href="/bracket" className="text-xs text-accent hover:underline">
                대진표 전체 보기 →
              </Link>
            }
          >
            🇰🇷 한국 32강 상대 시뮬레이션
          </SectionHeading>
          <KoreaKnockout blocks={koBlocks} totalCombos={scenario.totalCombos} />
        </section>
      )}

      {/* 팀별 진출 가능성 */}
      <section>
        <SectionHeading
          aside={
            <span className="tnum">
              {scenario.remaining.length > 0
                ? `${scenario.totalCombos.toLocaleString()}가지 경우의 수`
                : "확정"}
            </span>
          }
        >
          팀별 진출 가능성
        </SectionHeading>
        <GroupOutcomes scenario={scenario} />
        <p className="mt-3 text-xs text-muted">
          {scenario.remaining.length === 0
            ? "조별리그 종료 — 최종 순위입니다."
            : scenario.exact
              ? `남은 ${scenario.remaining.length}경기의 모든 스코어 조합(0~${scenario.goalCap}골)을 전수 계산`
              : `남은 ${scenario.remaining.length}경기, 스코어 상한 ${scenario.goalCap}골로 근사 계산`}
        </p>
      </section>

      {/* 포커스 팀 분기 */}
      {scenario.remaining.length > 0 && (
        <section>
          <SectionHeading>경기 결과별 시나리오</SectionHeading>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {groupTeams.map((t) => (
              <Link
                key={t}
                href={`/scenario?g=${group}&focus=${encodeURIComponent(t)}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  t === focus
                    ? "bg-accent text-white"
                    : "bg-surface text-muted hover:text-ink"
                }`}
              >
                {teamKo(t)}
              </Link>
            ))}
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm">
            <TeamLabel name={focus} bold /> 기준
          </div>
          <ScenarioSummary
            focus={focus}
            branches={branches}
            totalCombos={scenario.totalCombos}
            thirdFollowUp={thirdFollowUp}
            thirdPlaceWildcard={thirdPlaceWildcard}
            focusGroup={group}
          />
        </section>
      )}

      {/* 3위 와일드카드 */}
      <section>
        <SectionHeading>조 3위 와일드카드 경쟁</SectionHeading>
        <ThirdPlaceTable rows={thirds} highlightGroup={group} />
      </section>

      <SourceFooter
        sources={["openfootball", "FIFA 규정 타이브레이커"]}
        fetchedAt={stamp}
        note="순위·경우의 수는 자체 계산"
      />
    </div>
  );
}
