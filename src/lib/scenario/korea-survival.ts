import type { GroupId, Match } from "../types";
import { GROUP_IDS } from "../teams";
import { computeStandings, type Result } from "../standings";
import { thirdPlaceTable } from "./third-place";
import type { ClinchStatus, WildcardRankBucket } from "./wildcard-race";

/** 조별 남은 경기 스코어 상한 (0~4골 동일 확률) */
const CAP = 4;

type WDL = "W" | "D" | "L";

export interface SurvivalGroup {
  group: GroupId;
  /** 현재(스냅샷) 3위 팀 */
  team: string;
  points: number;
  gd: number;
  gf: number;
  complete: boolean;
  remaining: number;
  /** 이 조 최종 3위가 한국보다 좋은 성적일 확률 (조별 전수) */
  overtakeProb: number;
  /** 현재 시점 한국보다 위인지 */
  currentlyAbove: boolean;
  /** above=확정 위 / below=확정 아래 / live=진행중 */
  status: "above" | "below" | "live";
  /** 진행 중 조의 가장 결정적인 경기 */
  dangerMatch: { team1: string; team2: string; kickoff: number | null } | null;
  /** 위험 결과 라벨 (예: "스웨덴 승") */
  dangerResult: WDL | null;
  dangerLabel: string | null;
  /** 위험 결과 발생 시 추월 확률 */
  dangerProb: number | null;
}

export interface ThirdRankRow {
  rank: number;
  group: GroupId;
  team: string;
  points: number;
  gd: number;
  gf: number;
  played: number;
  complete: boolean;
  remaining: number;
  /** 현재 8위 이내 */
  qualifies: boolean;
  isFocus: boolean;
}

export interface KoreaSurvival {
  focusPoints: number;
  focusGd: number;
  focusGf: number;
  qualifyRate: number;
  clinch: ClinchStatus;
  /** 12개 조 3위 승점 순위표 (현재 스냅샷) */
  thirdTable: ThirdRankRow[];
  /** 현재 한국보다 위에 있는 조 수 */
  aboveNow: number;
  /** 한국 위가 확정된 조 수 */
  aboveLocked: number;
  /** 이 수 이상이 한국 위로 가면 탈락 (= 9위) */
  threshold: number;
  /** 3위 팀 중 한국 순위 분포 (rank = 위 조 수 + 1) */
  rankDistribution: WildcardRankBucket[];
  /** 경쟁 조 목록 (추월확률 내림차순) */
  groups: SurvivalGroup[];
  remainingMatches: number;
}

function scorelines(cap: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 0; a <= cap; a++) for (let b = 0; b <= cap; b++) out.push([a, b]);
  return out;
}

function remainingInGroup(matches: Match[], group: GroupId) {
  return matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0));
}

function mergeGroup(matches: Match[], group: GroupId, hypo: Result[]): Match[] {
  return matches.map((m) => {
    if (m.group !== group || m.score) return m;
    const h = hypo.find((x) => x.a === m.team1 && x.b === m.team2);
    return h
      ? { ...m, score: [h.sa, h.sb] as [number, number], status: "finished" as const }
      : m;
  });
}

function enumerateCombos(remaining: Match[]): Result[][] {
  if (remaining.length === 0) return [[]];
  const lines = scorelines(CAP);
  const out: Result[][] = [];
  const rec = (i: number, acc: Result[]) => {
    if (i === remaining.length) {
      out.push([...acc]);
      return;
    }
    const m = remaining[i];
    for (const [sa, sb] of lines) {
      acc.push({ a: m.team1, b: m.team2, sa, sb });
      rec(i + 1, acc);
      acc.pop();
    }
  };
  rec(0, []);
  return out;
}

function clinchFromProb(prob: number): ClinchStatus {
  if (prob >= 0.9999) return "확정";
  if (prob <= 0.0001) return "탈락";
  if (prob >= 0.85) return "유력";
  if (prob <= 0.15) return "희박";
  return "경쟁";
}

/** 독립 베르누이(p_g) 합의 정확 분포 (convolution) */
function convolution(probs: number[]): number[] {
  let dist = [1];
  for (const p of probs) {
    const next = new Array(dist.length + 1).fill(0);
    for (let k = 0; k < dist.length; k++) {
      next[k] += dist[k] * (1 - p);
      next[k + 1] += dist[k] * p;
    }
    dist = next;
  }
  return dist;
}

/**
 * 한국이 조 3위(와일드카드 경쟁)일 때 "탈락 위험" 분석.
 * 각 조의 최종 3위가 한국을 추월할 확률을 조별 전수 enumerate로 정확히 구하고,
 * 독립 합의 convolution으로 한국의 3위 순위 분포·진출 확률을 계산한다.
 * 모델: 각 조 남은 경기의 모든 스코어(0~4골)를 동일 확률로 가정.
 */
export function analyzeKoreaSurvival(
  matches: Match[],
  focusGroup: GroupId,
  focus: string,
): KoreaSurvival | null {
  const focusStanding = computeStandings(matches, focusGroup).find(
    (r) => r.team === focus,
  );
  if (!focusStanding || focusStanding.rank !== 3) return null;

  const snapshot = thirdPlaceTable(matches);
  const focusRow = snapshot.find((r) => r.group === focusGroup);
  if (!focusRow) return null;

  const fp = focusRow.points;
  const fgd = focusRow.gd;
  const fgf = focusRow.gf;
  const beats = (p: number, gd: number, gf: number) =>
    p > fp || (p === fp && gd > fgd) || (p === fp && gd === fgd && gf > fgf);

  const snapByGroup = new Map(snapshot.map((r) => [r.group, r]));

  const otherGroups = GROUP_IDS.filter((g) => g !== focusGroup);
  const probs: number[] = [];
  const groups: SurvivalGroup[] = [];
  let aboveNow = 0;
  let aboveLocked = 0;
  let remainingMatches = 0;

  for (const g of otherGroups) {
    const snap = snapByGroup.get(g)!;
    const remaining = remainingInGroup(matches, g);
    remainingMatches += remaining.length;
    const combos = enumerateCombos(remaining);

    let beatCount = 0;
    for (const combo of combos) {
      const merged = mergeGroup(matches, g, combo);
      const third = computeStandings(merged, g).find((r) => r.rank === 3)!;
      if (beats(third.points, third.gd, third.gf)) beatCount++;
    }
    const overtakeProb = beatCount / combos.length;
    probs.push(overtakeProb);

    const currentlyAbove = beats(snap.points, snap.gd, snap.gf);
    if (currentlyAbove) aboveNow++;

    const complete = remaining.length === 0;
    if (complete && currentlyAbove) aboveLocked++;

    const status: SurvivalGroup["status"] = complete
      ? currentlyAbove
        ? "above"
        : "below"
      : "live";

    // 진행 중 조: 가장 결정적인 경기 + 위험 결과
    let dangerMatch: SurvivalGroup["dangerMatch"] = null;
    let dangerResult: WDL | null = null;
    let dangerLabel: string | null = null;
    let dangerProb: number | null = null;

    if (status === "live") {
      let bestSpread = -1;
      for (const m of remaining) {
        const byRes: Record<WDL, { n: number; beat: number }> = {
          W: { n: 0, beat: 0 },
          D: { n: 0, beat: 0 },
          L: { n: 0, beat: 0 },
        };
        for (const combo of combos) {
          const r = combo.find((x) => x.a === m.team1 && x.b === m.team2)!;
          const res: WDL = r.sa > r.sb ? "W" : r.sa < r.sb ? "L" : "D";
          const merged = mergeGroup(matches, g, combo);
          const third = computeStandings(merged, g).find((x) => x.rank === 3)!;
          byRes[res].n++;
          if (beats(third.points, third.gd, third.gf)) byRes[res].beat++;
        }
        const rates = (["W", "D", "L"] as WDL[]).map((k) =>
          byRes[k].n > 0 ? byRes[k].beat / byRes[k].n : 0,
        );
        const spread = Math.max(...rates) - Math.min(...rates);
        if (spread > bestSpread) {
          bestSpread = spread;
          // 위험 결과 = 추월 확률이 가장 높은 결과
          let bestRes: WDL = "W";
          let bestRate = -1;
          for (const k of ["W", "D", "L"] as WDL[]) {
            const rate = byRes[k].n > 0 ? byRes[k].beat / byRes[k].n : 0;
            if (rate > bestRate) {
              bestRate = rate;
              bestRes = k;
            }
          }
          dangerMatch = { team1: m.team1, team2: m.team2, kickoff: m.kickoff };
          dangerResult = bestRes;
          dangerProb = bestRate;
          dangerLabel =
            bestRes === "W"
              ? `${m.team1} 승`
              : bestRes === "L"
                ? `${m.team2} 승`
                : "무승부";
        }
      }
    }

    groups.push({
      group: g,
      team: snap.team,
      points: snap.points,
      gd: snap.gd,
      gf: snap.gf,
      complete,
      remaining: remaining.length,
      overtakeProb,
      currentlyAbove,
      status,
      dangerMatch,
      dangerResult,
      dangerLabel,
      dangerProb,
    });
  }

  // 한국 위 조 수 분포 (정확)
  const aboveDist = convolution(probs);
  const rankDistribution: WildcardRankBucket[] = aboveDist
    .map((share, above) => ({ rank: above + 1, share, qualifies: above + 1 <= 8 }))
    .filter((b) => b.share >= 0.0005);

  // 진출 = 위 조 수 ≤ 7 (= 8위 이내)
  let qualifyRate = 0;
  for (let above = 0; above <= 7 && above < aboveDist.length; above++) {
    qualifyRate += aboveDist[above];
  }

  groups.sort(
    (a, b) =>
      b.overtakeProb - a.overtakeProb || a.group.localeCompare(b.group),
  );

  // 12개 조 3위 승점 순위표 (스냅샷)
  const thirdTable: ThirdRankRow[] = snapshot.map((r) => ({
    rank: r.rank,
    group: r.group,
    team: r.team,
    points: r.points,
    gd: r.gd,
    gf: r.gf,
    played: r.played,
    complete: r.groupComplete,
    remaining: remainingInGroup(matches, r.group).length,
    qualifies: r.qualifies,
    isFocus: r.group === focusGroup,
  }));

  return {
    focusPoints: fp,
    focusGd: fgd,
    focusGf: fgf,
    qualifyRate,
    clinch: clinchFromProb(qualifyRate),
    thirdTable,
    aboveNow,
    aboveLocked,
    threshold: 8,
    rankDistribution,
    groups,
    remainingMatches,
  };
}
