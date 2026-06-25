import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataset } from "@/lib/data";
import { getSquad, sortSquad, getSquads } from "@/lib/squads";
import { computeStandings } from "@/lib/standings";
import { getTeamByCode, TEAMS, KOREA } from "@/lib/teams";
import { kstStamp } from "@/lib/format";
import { SectionHeading, SourceFooter, Flag } from "@/components/ui";
import { StandingsTable } from "@/components/standings-table";
import { MatchList } from "@/components/match-list";
import { SquadTable } from "@/components/squad-table";
import { DataError } from "@/components/data-error";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata, sportsTeamJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return TEAMS.map((t) => ({ code: t.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = getTeamByCode(code);
  if (!team) return { title: "팀" };

  return pageMetadata({
    title: `${team.ko} (${team.group}조)`,
    description: `2026 FIFA 월드컵 ${team.group}조 ${team.ko} — FIFA 랭킹 ${team.fifaRank}위, 선수 명단, 경기 일정·결과, 조별리그 순위.`,
    path: `/teams/${team.code}`,
    keywords: [
      team.ko,
      `${team.group}조`,
      "월드컵 명단",
      "월드컵 선수",
      "2026 월드컵",
    ],
  });
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = getTeamByCode(code);
  if (!team) notFound();

  let data;
  try {
    data = await getDataset();
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }

  const standings = computeStandings(data.matches, team.group);
  const teamMatches = data.matches
    .filter((m) => m.team1 === team.name || m.team2 === team.name)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0));

  const squad = await getSquad(team.name);
  const squadsMeta = await getSquads();
  const stamp = kstStamp(data.fetchedAt);

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={[
          sportsTeamJsonLd(team.ko, team.code, team.group),
          breadcrumbJsonLd([
            { name: "홈", path: "/" },
            { name: "출전국 48팀", path: "/teams" },
            { name: team.ko, path: `/teams/${team.code}` },
          ]),
        ]}
      />
      <Link href="/teams" className="text-sm text-muted hover:text-ink">
        ← 전체 팀
      </Link>

      <header className="flex items-center gap-4">
        <Flag name={team.name} size={44} />
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              team.name === KOREA ? "text-primary" : ""
            }`}
          >
            {team.ko}
          </h1>
          <p className="mt-0.5 text-sm text-muted tnum">
            {team.group}조 · FIFA 랭킹 {team.fifaRank}위 · {team.code}
          </p>
        </div>
      </header>

      <section>
        <SectionHeading
          aside={
            <Link href={`/scenario?g=${team.group}`} className="text-accent hover:underline">
              시나리오 →
            </Link>
          }
        >
          {team.group}조 순위
        </SectionHeading>
        <StandingsTable rows={standings} />
      </section>

      <section>
        <SectionHeading>경기</SectionHeading>
        <MatchList matches={teamMatches} />
      </section>

      <section>
        <SectionHeading
          aside={squad ? <span className="tnum">{squad.length}명</span> : null}
        >
          선수 명단
        </SectionHeading>
        {squad ? (
          <SquadTable players={sortSquad(squad)} teamKo={team.ko} />
        ) : (
          <p className="rounded-lg bg-surface p-4 text-sm text-muted">
            선수 명단 데이터를 준비 중입니다. `npm run sync`로 위키피디아 스쿼드를
            동기화하세요.
          </p>
        )}
        {squad && (
          <p className="mt-2 text-xs text-muted">
            선수 이름·소속 클럽을 누르면 구글 검색으로, <span className="font-medium">위키</span>·
            <span className="font-medium">TM</span>(Transfermarkt) 칩으로 위키백과·이적/시장가치
            정보로 연결됩니다. (A매치·득점·소속은 실데이터)
          </p>
        )}
      </section>

      <SourceFooter
        sources={[
          "openfootball",
          squadsMeta?.source ?? "Wikipedia",
        ]}
        fetchedAt={stamp}
      />
    </div>
  );
}
