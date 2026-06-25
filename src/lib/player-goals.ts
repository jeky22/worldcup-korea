import type { Match } from "./types";

/** 검색·매칭용 이름 정규화: 소문자, 발음기호 제거, 괄호 주석 제거, 공백 정리 */
export function normalizePlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/[.\u2019']/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 한 팀 선수들의 이번 월드컵 득점 수를 집계한다.
 * - owngoal(자책골)은 득점한 선수(상대팀 선수)로 기록되므로 제외한다.
 * - 페널티골은 포함한다.
 * 반환: 정규화된 선수 이름 → 득점 수
 */
export function tournamentGoalsByTeam(
  matches: Match[],
  teamName: string,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const m of matches) {
    let scorers;
    if (m.team1 === teamName) scorers = m.goals1;
    else if (m.team2 === teamName) scorers = m.goals2;
    else continue;
    for (const g of scorers) {
      if (g.owngoal) continue;
      const key = normalizePlayerName(g.name);
      if (!key) continue;
      out.set(key, (out.get(key) ?? 0) + 1);
    }
  }
  return out;
}
