import type { GroupId, Match } from "../types";
import { fifaRank, GROUP_IDS } from "../teams";
import { computeStandings } from "../standings";

export interface ThirdPlaceRow {
  group: GroupId;
  team: string;
  played: number;
  points: number;
  gd: number;
  gf: number;
  /** 12개 조 3위 중 순위 */
  rank: number;
  /** 상위 8위 안에 들어 와일드카드 진출권인지 */
  qualifies: boolean;
  /** 해당 조의 모든 경기가 끝났는지 */
  groupComplete: boolean;
}

/**
 * 각 조 3위 팀을 모아 FIFA 2026 와일드카드 기준으로 정렬한다.
 * 기준: 승점 → 득실차 → 다득점 → (페어플레이 생략) → FIFA 랭킹.
 * 상위 8개 조 3위가 32강(와일드카드) 진출.
 * 진행 중 경기가 있으면 "현재 시점" 스냅샷이다.
 */
export function thirdPlaceTable(matches: Match[]): ThirdPlaceRow[] {
  const thirds = GROUP_IDS.map((g) => {
    const st = computeStandings(matches, g);
    const third = st.find((r) => r.rank === 3)!;
    const groupMatches = matches.filter((m) => m.group === g);
    const groupComplete = groupMatches.every((m) => m.score);
    return { group: g, row: third, groupComplete };
  });

  const sorted = thirds
    .map((t) => t)
    .sort((x, y) => {
      const a = x.row;
      const b = y.row;
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return fifaRank(a.team) - fifaRank(b.team);
    });

  return sorted.map((t, i) => ({
    group: t.group,
    team: t.row.team,
    played: t.row.played,
    points: t.row.points,
    gd: t.row.gd,
    gf: t.row.gf,
    rank: i + 1,
    qualifies: i < 8,
    groupComplete: t.groupComplete,
  }));
}
