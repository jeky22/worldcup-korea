import type { GroupId, Match } from "../types";
import { KOREA, getTeam } from "../teams";
import { analyzeKoreaSurvival } from "./korea-survival";

export type WDL = "W" | "D" | "L";

export interface WatchMatch {
  group: string;
  team1: string;
  team2: string;
  kickoff: number | null;
  /** 한국을 추월시키는 위험 결과 */
  dangerResult: WDL | null;
  /** 위험 결과 발생 시 추월 확률 */
  overtakeProb: number;
  /** 위험 문구용 임계 정보 (describeDanger와 공통) */
  dangerThreatTeam: string | null;
  dangerThresholdMargin: number | null;
  dangerAlways: boolean;
  dangerProb: number | null;
}

/**
 * 한국이 3위 경쟁 중일 때, 한국을 추월시킬 수 있는 "주목 경기" 목록.
 * 기존 탈락 위험 분석(analyzeKoreaSurvival)의 진행 중 조 결정적 경기를 킥오프 순으로 반환.
 */
export function getWatchMatches(matches: Match[]): WatchMatch[] {
  const koreaGroup = getTeam(KOREA)?.group as GroupId | undefined;
  if (!koreaGroup) return [];
  const survival = analyzeKoreaSurvival(matches, koreaGroup, KOREA);
  if (!survival) return [];
  return survival.groups
    .filter((g) => g.status === "live" && g.dangerMatch)
    .map((g) => ({
      group: g.group,
      team1: g.dangerMatch!.team1,
      team2: g.dangerMatch!.team2,
      kickoff: g.dangerMatch!.kickoff,
      dangerResult: g.dangerResult,
      overtakeProb: g.overtakeProb,
      dangerThreatTeam: g.dangerThreatTeam,
      dangerThresholdMargin: g.dangerThresholdMargin,
      dangerAlways: g.dangerAlways,
      dangerProb: g.dangerProb,
    }))
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0));
}
