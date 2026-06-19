import type { Match } from "@/lib/types";
import { kstDate, kstTime } from "@/lib/format";
import { teamKo } from "@/lib/teams";
import { TeamLabel } from "./ui";

function KnockoutSide({ name, label }: { name: string; label: string | null }) {
  if (name) return <TeamLabel name={name} />;
  return <span className="text-muted">{label ?? "미정"}</span>;
}

/** 유튜브 하이라이트 검색 링크 (실제 영상이 아닌 검색 연결) */
export function highlightUrl(team1: string, team2: string): string {
  const q = `${teamKo(team1)} ${teamKo(team2)} 월드컵 하이라이트`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

function HighlightLink({ match }: { match: Match }) {
  return (
    <a
      href={highlightUrl(match.team1, match.team2)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted transition-colors hover:bg-primary hover:text-[var(--color-on-primary)]"
      title="유튜브에서 하이라이트 검색"
    >
      <span aria-hidden>▶</span>
      <span className="hidden sm:inline">하이라이트</span>
    </a>
  );
}

export function MatchRow({ match, hideDate }: { match: Match; hideDate?: boolean }) {
  const finished = match.status === "finished";
  const score = match.score;

  return (
    <div className="flex items-center gap-3 border-b py-3 last:border-0">
      <div className="flex w-14 shrink-0 flex-col items-start">
        {!hideDate && (
          <span className="text-xs font-medium text-muted">{kstDate(match.kickoff)}</span>
        )}
        <span className="tnum text-sm font-medium">{kstTime(match.kickoff)}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 justify-end text-right">
          <KnockoutSide name={match.team1} label={match.team1Label} />
        </div>

        <div className="shrink-0 px-1">
          {finished && score ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 font-mono text-sm font-semibold tnum">
              <span>{score[0]}</span>
              <span className="text-muted">:</span>
              <span>{score[1]}</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-muted">vs</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 justify-start text-left">
          <KnockoutSide name={match.team2} label={match.team2Label} />
        </div>
      </div>

      <div className="flex w-auto shrink-0 items-center justify-end gap-2 sm:w-32">
        <span className="hidden max-w-[88px] truncate text-right text-xs text-muted sm:block">
          {match.ground}
        </span>
        {finished && match.team1 && match.team2 ? (
          <HighlightLink match={match} />
        ) : null}
      </div>
    </div>
  );
}

export function MatchList({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">경기가 없습니다.</p>;
  }
  return (
    <div>
      {matches.map((m) => (
        <MatchRow key={m.id} match={m} />
      ))}
    </div>
  );
}
