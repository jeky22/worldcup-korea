import type { GroupId, Match } from "../types";
import { GROUP_IDS } from "../teams";
import { computeStandings, type Result } from "../standings";
import { thirdPlaceTable, type ThirdPlaceRow } from "./third-place";
import { sampleScoreline } from "./match-odds";

/** 몬테카를로 표본 수 (revalidate=3600으로 시간당 1회만 계산) */
const SAMPLES = 50_000;
/** 타 조 남은 경기 스코어 상한 (각 결과 버킷 내 0~4골 균등) */
const MC_CAP = 4;

type WDL = "W" | "D" | "L";

export type ClinchStatus = "확정" | "유력" | "경쟁" | "희박" | "탈락";

export interface WildcardRankBucket {
  rank: number;
  share: number;
  qualifies: boolean;
}

export interface MatchScoreScenario {
  score: [number, number];
  wdl: WDL;
  share: number;
  koreaRank: number;
  qualifyRate: number;
}

export interface PivotalMatch {
  id: string;
  group: GroupId;
  team1: string;
  team2: string;
  date: string;
  kickoff: number | null;
  ground: string;
  /** 결과별 한국 진출률 최대-최소 편차 (0~1) */
  impact: number;
  qualifyRate: number;
  /** 승/무/패 묶음 요약 (결과만 보고 싶을 때) */
  wdlSummary: WdlSummary[];
  scenarios: MatchScoreScenario[];
}

export interface WdlSummary {
  wdl: WDL;
  label: string;
  share: number;
  qualifyRate: number;
}

export interface GroupThirdRow {
  group: GroupId;
  /** 현재(스냅샷) 3위 팀 */
  team: string;
  points: number;
  gd: number;
  gf: number;
  complete: boolean;
  /** 이 조 남은 경기 수 */
  remaining: number;
  /** 이 조 3위 자리가 와일드카드 8위 안에 들 확률 */
  qualifyProb: number;
  /** 현재 시점 기준 8위 안인지 */
  currentlyQualifies: boolean;
  clinch: ClinchStatus;
  isFocus: boolean;
}

export interface WildcardRaceAnalysis {
  focusRow: ThirdPlaceRow;
  qualifyRate: number;
  clinch: ClinchStatus;
  rankDistribution: WildcardRankBucket[];
  groupTable: GroupThirdRow[];
  pivotalMatches: PivotalMatch[];
  sampleCount: number;
  remainingMatches: number;
  /** 타 조 미완료 수 */
  incompleteGroups: number;
}

function wdl(sa: number, sb: number): WDL {
  if (sa > sb) return "W";
  if (sa < sb) return "L";
  return "D";
}

function clinchFromProb(prob: number, complete: boolean): ClinchStatus {
  if (complete && prob >= 0.9999) return "확정";
  if (complete && prob <= 0.0001) return "탈락";
  if (prob >= 0.85) return "유력";
  if (prob <= 0.15) return "희박";
  return "경쟁";
}

function mergeGroupResults(
  matches: Match[],
  group: GroupId,
  hypo: Result[],
): Match[] {
  return matches.map((m) => {
    if (m.group !== group || m.score) return m;
    const h = hypo.find((x) => x.a === m.team1 && x.b === m.team2);
    if (h) {
      return {
        ...m,
        score: [h.sa, h.sb] as [number, number],
        status: "finished" as const,
      };
    }
    return m;
  });
}

function mergeAllPicks(matches: Match[], picks: Map<GroupId, Result[]>): Match[] {
  let out = matches;
  for (const [g, hypo] of picks) out = mergeGroupResults(out, g, hypo);
  return out;
}

interface RemainingRef {
  id: string;
  team1: string;
  team2: string;
}

function remainingInGroup(matches: Match[], group: GroupId): RemainingRef[] {
  return matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));
}

/** 한 조의 남은 경기를 Elo 분포로 1회 표본추출 */
function sampleGroup(remaining: RemainingRef[]): Result[] {
  return remaining.map((m) => {
    const [sa, sb] = sampleScoreline(m.team1, m.team2, MC_CAP);
    return { a: m.team1, b: m.team2, sa, sb };
  });
}

interface MatchMeta {
  id: string;
  group: GroupId;
  team1: string;
  team2: string;
  date: string;
  kickoff: number | null;
  ground: string;
}

function findMatchMeta(matches: Match[], group: GroupId, r: Result): MatchMeta {
  const m = matches.find(
    (x) => x.group === group && x.team1 === r.a && x.team2 === r.b,
  )!;
  return {
    id: m.id,
    group,
    team1: m.team1,
    team2: m.team2,
    date: m.date,
    kickoff: m.kickoff,
    ground: m.ground,
  };
}

/**
 * 포커스 팀이 조 3위 확정일 때, 타 조 남은 경기 스코어(몬테카를로)으로
 * 12개 조 3위 와일드카드(상위 8) 진출 확률·순위 분포·경기별 득실 시나리오를 계산.
 * 모델: 각 경기 승/무/패 확률을 FIFA 랭킹 포인트 기반 Elo 모델로 산출하고,
 *       각 결과 버킷(0~4골) 안의 스코어라인을 균등 추출한다.
 */
export function analyzeWildcardRace(
  matches: Match[],
  focusGroup: GroupId,
  focus: string,
): WildcardRaceAnalysis | null {
  const focusStanding = computeStandings(matches, focusGroup).find(
    (r) => r.team === focus,
  );
  if (!focusStanding || focusStanding.rank !== 3) return null;

  const snapshot = thirdPlaceTable(matches);
  const focusRow = snapshot.find((r) => r.group === focusGroup);
  if (!focusRow) return null;

  const groupRemaining = new Map<GroupId, RemainingRef[]>();
  let remainingMatches = 0;
  for (const g of GROUP_IDS) {
    if (g === focusGroup) continue;
    const rem = remainingInGroup(matches, g);
    if (rem.length > 0) {
      groupRemaining.set(g, rem);
      remainingMatches += rem.length;
    }
  }

  const snapshotByGroup = new Map(snapshot.map((r) => [r.group, r]));
  const remainingByGroup = new Map<GroupId, number>(
    GROUP_IDS.map((g) => [g, remainingInGroup(matches, g).length]),
  );
  const incompleteGroups = snapshot.filter(
    (r) => !r.groupComplete && r.group !== focusGroup,
  ).length;

  // 남은 경기가 없으면 현재 스냅샷이 곧 최종
  if (groupRemaining.size === 0) {
    const groupTable: GroupThirdRow[] = snapshot.map((r) => ({
      group: r.group,
      team: r.team,
      points: r.points,
      gd: r.gd,
      gf: r.gf,
      complete: r.groupComplete,
      remaining: remainingByGroup.get(r.group) ?? 0,
      qualifyProb: r.qualifies ? 1 : 0,
      currentlyQualifies: r.qualifies,
      clinch: r.qualifies ? "확정" : "탈락",
      isFocus: r.group === focusGroup,
    }));
    return {
      focusRow,
      qualifyRate: focusRow.qualifies ? 1 : 0,
      clinch: focusRow.qualifies ? "확정" : "탈락",
      rankDistribution: [
        { rank: focusRow.rank, share: 1, qualifies: focusRow.qualifies },
      ],
      groupTable,
      pivotalMatches: [],
      sampleCount: 1,
      remainingMatches: 0,
      incompleteGroups: 0,
    };
  }

  const groupKeys = [...groupRemaining.keys()];
  const rankHist = new Map<number, number>();
  let focusQualifyCount = 0;
  const groupQualifyCount = new Map<GroupId, number>();
  for (const g of GROUP_IDS) groupQualifyCount.set(g, 0);

  type ScoreAcc = { count: number; qualify: number; rankSum: number };
  const matchScoreHist = new Map<string, ScoreAcc>();
  const matchMeta = new Map<string, MatchMeta>();

  for (let s = 0; s < SAMPLES; s++) {
    const picks = new Map<GroupId, Result[]>();
    for (const g of groupKeys) {
      picks.set(g, sampleGroup(groupRemaining.get(g)!));
    }

    const merged = mergeAllPicks(matches, picks);
    const tpt = thirdPlaceTable(merged);
    const kr = tpt.find((r) => r.group === focusGroup)!;

    rankHist.set(kr.rank, (rankHist.get(kr.rank) ?? 0) + 1);
    if (kr.qualifies) focusQualifyCount++;

    for (const row of tpt) {
      if (row.qualifies) {
        groupQualifyCount.set(row.group, (groupQualifyCount.get(row.group) ?? 0) + 1);
      }
    }

    for (const [g, results] of picks) {
      for (const r of results) {
        const meta = findMatchMeta(matches, g, r);
        matchMeta.set(meta.id, meta);
        const key = `${meta.id}:${r.sa}-${r.sb}`;
        const acc = matchScoreHist.get(key) ?? { count: 0, qualify: 0, rankSum: 0 };
        acc.count++;
        acc.rankSum += kr.rank;
        if (kr.qualifies) acc.qualify++;
        matchScoreHist.set(key, acc);
      }
    }
  }

  const rankDistribution: WildcardRankBucket[] = [...rankHist.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rank, count]) => ({
      rank,
      share: count / SAMPLES,
      qualifies: rank <= 8,
    }));

  const groupTable: GroupThirdRow[] = GROUP_IDS.map((g) => {
    const snap = snapshotByGroup.get(g)!;
    const prob = g === focusGroup ? focusQualifyCount / SAMPLES : (groupQualifyCount.get(g) ?? 0) / SAMPLES;
    return {
      group: g,
      team: snap.team,
      points: snap.points,
      gd: snap.gd,
      gf: snap.gf,
      complete: snap.groupComplete,
      remaining: remainingByGroup.get(g) ?? 0,
      qualifyProb: prob,
      currentlyQualifies: snap.qualifies,
      clinch: clinchFromProb(prob, snap.groupComplete),
      isFocus: g === focusGroup,
    };
  }).sort((a, b) => b.qualifyProb - a.qualifyProb || a.group.localeCompare(b.group));

  // 경기별 득실 시나리오
  const byMatch = new Map<string, MatchScoreScenario[]>();
  for (const [key, acc] of matchScoreHist) {
    if (acc.count < 30) continue;
    const [id, scoreStr] = key.split(":");
    const [sa, sb] = scoreStr.split("-").map(Number) as [number, number];
    const list = byMatch.get(id) ?? [];
    list.push({
      score: [sa, sb],
      wdl: wdl(sa, sb),
      share: acc.count / SAMPLES,
      koreaRank: Math.round(acc.rankSum / acc.count),
      qualifyRate: acc.qualify / acc.count,
    });
    byMatch.set(id, list);
  }

  // 경기 단위로 W/D/L 묶어 영향도 계산 (스코어가 아닌 결과 기준이 더 직관적)
  const pivotalMatches: PivotalMatch[] = [];
  for (const [id, scenarios] of byMatch) {
    const meta = matchMeta.get(id)!;

    // W/D/L 묶음 집계
    const byWdl = new Map<WDL, { share: number; q: number }>();
    for (const sc of scenarios) {
      const e = byWdl.get(sc.wdl) ?? { share: 0, q: 0 };
      e.share += sc.share;
      e.q += sc.qualifyRate * sc.share;
      byWdl.set(sc.wdl, e);
    }
    const wdlOrder: WDL[] = ["W", "D", "L"];
    const wdlSummary: WdlSummary[] = wdlOrder
      .filter((w) => byWdl.has(w))
      .map((w) => {
        const e = byWdl.get(w)!;
        return {
          wdl: w,
          label:
            w === "W"
              ? `${meta.team1} 승`
              : w === "L"
                ? `${meta.team2} 승`
                : "무",
          share: e.share,
          qualifyRate: e.share > 0 ? e.q / e.share : 0,
        };
      });
    const wdlRates = wdlSummary.map((e) => e.qualifyRate);
    const impact = wdlRates.length ? Math.max(...wdlRates) - Math.min(...wdlRates) : 0;
    const totalShare = scenarios.reduce((s, sc) => s + sc.share, 0);
    const weightedQ =
      totalShare > 0
        ? scenarios.reduce((sum, sc) => sum + sc.qualifyRate * sc.share, 0) / totalShare
        : 0;

    scenarios.sort((a, b) => b.share - a.share);
    pivotalMatches.push({
      ...meta,
      impact,
      qualifyRate: weightedQ,
      wdlSummary,
      scenarios: scenarios.slice(0, 9),
    });
  }

  pivotalMatches.sort((a, b) => b.impact - a.impact || (a.kickoff ?? 0) - (b.kickoff ?? 0));

  const qualifyRate = focusQualifyCount / SAMPLES;
  return {
    focusRow,
    qualifyRate,
    clinch: clinchFromProb(qualifyRate, true),
    rankDistribution,
    groupTable,
    pivotalMatches,
    sampleCount: SAMPLES,
    remainingMatches,
    incompleteGroups,
  };
}
