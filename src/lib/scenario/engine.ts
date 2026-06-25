import type { GroupId, Match, StandingRow } from "../types";
import { teamsInGroup, GROUP_IDS } from "../teams";
import { rankTeams, resultsFromMatches, type Result } from "../standings";
import { thirdPlaceTable, type ThirdPlaceRow } from "./third-place";

/** 조 내 최종 성적 분류 */
export type Outcome = "advance" | "third" | "out";
// advance: 1·2위 직행, third: 조 3위(와일드카드 경쟁), out: 4위 탈락

export type WDL = "W" | "D" | "L"; // team1(home) 기준

export interface RemainingMatch {
  id: string;
  team1: string;
  team2: string;
}

export interface TeamScenario {
  team: string;
  /** 모든 경우의 수에서 나온 최종 분류 집합 */
  outcomes: Outcome[];
  status:
    | "advanced-clinched" // 직행 확정
    | "advance-possible" // 직행 가능
    | "third-clinched" // 조 3위 확정 (와일드카드 경쟁)
    | "out-clinched" // 탈락 확정
    | "alive"; // 직행~탈락 모두 가능
  /** 직행하는 경우의 비율 (0~1) */
  advanceRate: number;
  thirdRate: number;
  outRate: number;
}

export interface MatchRef {
  team1: string;
  team2: string;
}

export interface FocusCondition {
  /** 각 '다른 경기'의 결과 (team1 기준 W/D/L) */
  parts: { team1: string; team2: string; result: WDL }[];
  outcome: Outcome[];
  /** 이 분기 내 비율 (0~1) */
  share: number;
  /** 전체 경우의 수 대비 비율 (0~1) */
  shareTotal: number;
  comboCount: number;
  /** 이 조건에서 outcome별 비율 (득실차 등으로 갈릴 때) */
  outcomeRates: Partial<Record<Outcome, number>>;
}

export interface FocusBranch {
  /** 포커스 팀의 자기 경기 결과 (보통 1경기 → 길이 1) */
  ownResult: WDL[];
  ownLabel: string;
  /** 포커스 팀의 남은 경기 (상대 파악용) */
  ownMatches: MatchRef[];
  /** 이 분기에서 가능한 최종 분류 */
  outcomes: Outcome[];
  verdict:
    | "advance" // 무조건 직행
    | "advance-or-third" // 직행 또는 3위
    | "third" // 조 3위 확정
    | "depends" // 다른 경기에 따라 갈림
    | "out"; // 탈락
  /** depends일 때, 다른 경기 결과별 설명 */
  conditions: FocusCondition[];
  /** 전체 경우의 수 대비 이 분기 비율 (0~1) */
  share: number;
  comboCount: number;
  advanceRate: number;
  thirdRate: number;
  outRate: number;
}

export interface FocusVerbStat {
  share: number;
  comboCount: number;
  advanceRate: number;
  thirdRate: number;
  outRate: number;
  ranks: { rank: number; share: number; comboCount: number }[];
}

export interface GroupRankDistribution {
  total: number;
  /** rank(1~4) → 팀별 경우의 수 */
  byRank: Map<number, Map<string, number>>;
}

export interface GroupScenario {
  group: GroupId;
  current: StandingRow[];
  remaining: RemainingMatch[];
  teams: TeamScenario[];
  totalCombos: number;
  /** 스코어 상한(정밀도). 작을수록 근사 */
  goalCap: number;
  exact: boolean;
}

const OUTCOME_ORDER: Record<Outcome, number> = { advance: 0, third: 1, out: 2 };

function rankToOutcome(rank: number): Outcome {
  if (rank <= 2) return "advance";
  if (rank === 3) return "third";
  return "out";
}

/** 남은 경기 수에 맞춰 combo 예산(약 30만) 안에서 최대 스코어 상한 선택 */
function pickCap(n: number): { cap: number; exact: boolean } {
  const BUDGET = 300_000;
  for (let cap = 8; cap >= 1; cap--) {
    const perMatch = (cap + 1) * (cap + 1);
    if (Math.pow(perMatch, n) <= BUDGET) return { cap, exact: cap >= 5 };
  }
  return { cap: 1, exact: false };
}

function wdl(sa: number, sb: number): WDL {
  if (sa > sb) return "W";
  if (sa < sb) return "L";
  return "D";
}

/** 한 경기의 가능한 스코어라인 (0..cap) */
function scorelines(cap: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 0; a <= cap; a++) for (let b = 0; b <= cap; b++) out.push([a, b]);
  return out;
}

/** 재귀적으로 모든 남은 경기 스코어 조합을 순회 */
function forEachCombo(
  remaining: RemainingMatch[],
  cap: number,
  cb: (results: Result[]) => void,
): number {
  const lines = scorelines(cap);
  let count = 0;
  const rec = (i: number, acc: Result[]) => {
    if (i === remaining.length) {
      cb(acc);
      count++;
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
  return count;
}

function ownVerdict(outcomes: Set<Outcome>): FocusBranch["verdict"] {
  const has = (o: Outcome) => outcomes.has(o);
  if (outcomes.size === 1) {
    if (has("advance")) return "advance";
    if (has("third")) return "third";
    return "out";
  }
  if (has("advance") && has("third") && !has("out")) return "advance-or-third";
  return "depends";
}

const WDL_KO: Record<WDL, string> = { W: "승", D: "무", L: "패" };

/**
 * 한 조의 모든 경우의 수를 스코어라인 단위로 열거해
 * 각 팀의 진출 가능성과, 포커스 팀의 분기별 조건을 계산한다.
 */
export function analyzeGroup(
  matches: Match[],
  group: GroupId,
): GroupScenario {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);
  const current = rankTeams(teams, real);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  // 남은 경기 없음 → 현재가 최종
  if (remaining.length === 0) {
    return {
      group,
      current,
      remaining,
      teams: current.map((r) => {
        const oc = rankToOutcome(r.rank);
        return {
          team: r.team,
          outcomes: [oc],
          status:
            oc === "advance"
              ? "advanced-clinched"
              : oc === "third"
                ? "third-clinched"
                : "out-clinched",
          advanceRate: oc === "advance" ? 1 : 0,
          thirdRate: oc === "third" ? 1 : 0,
          outRate: oc === "out" ? 1 : 0,
        } satisfies TeamScenario;
      }),
      totalCombos: 1,
      goalCap: 0,
      exact: true,
    };
  }

  const { cap, exact } = pickCap(remaining.length);

  // 팀별 분류 카운트
  const counts = new Map<string, Record<Outcome, number>>();
  for (const t of teams) counts.set(t, { advance: 0, third: 0, out: 0 });

  let total = 0;
  forEachCombo(remaining, cap, (hypo) => {
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    for (const row of st) {
      counts.get(row.team)![rankToOutcome(row.rank)]++;
    }
    total++;
  });

  const teamScenarios: TeamScenario[] = current.map((row) => {
    const c = counts.get(row.team)!;
    const outcomes: Outcome[] = (["advance", "third", "out"] as Outcome[]).filter(
      (o) => c[o] > 0,
    );
    let status: TeamScenario["status"];
    if (outcomes.length === 1) {
      status =
        outcomes[0] === "advance"
          ? "advanced-clinched"
          : outcomes[0] === "third"
            ? "third-clinched"
            : "out-clinched";
    } else if (!outcomes.includes("out") && outcomes.includes("advance")) {
      status = "advance-possible";
    } else {
      status = "alive";
    }
    return {
      team: row.team,
      outcomes: outcomes.sort((a, b) => OUTCOME_ORDER[a] - OUTCOME_ORDER[b]),
      status,
      advanceRate: c.advance / total,
      thirdRate: c.third / total,
      outRate: c.out / total,
    } satisfies TeamScenario;
  });

  return {
    group,
    current,
    remaining,
    teams: teamScenarios,
    totalCombos: total,
    goalCap: cap,
    exact,
  };
}

/**
 * 포커스 팀 관점의 분기 요약:
 * "이기면 X, 비기면 Y(다른 경기에 따라), 지면 Z" 형태.
 */
export function focusBranches(
  matches: Match[],
  group: GroupId,
  focus: string,
): FocusBranch[] {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  const ownMatches = remaining.filter(
    (m) => m.team1 === focus || m.team2 === focus,
  );
  const otherMatches = remaining.filter(
    (m) => m.team1 !== focus && m.team2 !== focus,
  );
  if (ownMatches.length === 0) return [];

  const { cap } = pickCap(remaining.length);

  // ownResultKey -> otherKey(WDL 시퀀스) -> { outcomes, count, outcomeCounts }
  type OtherEntry = {
    outcomes: Set<Outcome>;
    count: number;
    outcomeCounts: Record<Outcome, number>;
  };
  type Bucket = Map<string, Map<string, OtherEntry>>;
  const buckets: Bucket = new Map();
  const ownLabels = new Map<string, WDL[]>();
  let totalCombos = 0;

  forEachCombo(remaining, cap, (hypo) => {
    totalCombos++;
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    const focusRank = st.find((r) => r.team === focus)!.rank;
    const outcome = rankToOutcome(focusRank);

    // own result key (focus 기준 W/D/L)
    const ownWDL: WDL[] = ownMatches.map((m) => {
      const r = hypo.find((h) => h.a === m.team1 && h.b === m.team2)!;
      const res = wdl(r.sa, r.sb);
      // focus가 away면 뒤집기
      if (m.team1 === focus) return res;
      return res === "W" ? "L" : res === "L" ? "W" : "D";
    });
    const ownKey = ownWDL.join(",");
    ownLabels.set(ownKey, ownWDL);

    // other key: otherMatches 순서대로 team1 기준 W/D/L 한 글자씩
    const otherKey = otherMatches
      .map((m) => {
        const r = hypo.find((h) => h.a === m.team1 && h.b === m.team2)!;
        return wdl(r.sa, r.sb);
      })
      .join("");

    let byOther = buckets.get(ownKey);
    if (!byOther) {
      byOther = new Map();
      buckets.set(ownKey, byOther);
    }
    let entry = byOther.get(otherKey);
    if (!entry) {
      entry = {
        outcomes: new Set(),
        count: 0,
        outcomeCounts: { advance: 0, third: 0, out: 0 },
      };
      byOther.set(otherKey, entry);
    }
    entry.outcomes.add(outcome);
    entry.count++;
    entry.outcomeCounts[outcome]++;
  });

  const ownMatchRefs: MatchRef[] = ownMatches.map((m) => ({
    team1: m.team1,
    team2: m.team2,
  }));

  const branches: FocusBranch[] = [];
  for (const [ownKey, byOther] of buckets) {
    const ownWDL = ownLabels.get(ownKey)!;
    const allOutcomes = new Set<Outcome>();
    let branchCount = 0;
    const branchOutcomes: Record<Outcome, number> = {
      advance: 0,
      third: 0,
      out: 0,
    };
    for (const entry of byOther.values()) {
      branchCount += entry.count;
      for (const o of entry.outcomes) allOutcomes.add(o);
      branchOutcomes.advance += entry.outcomeCounts.advance;
      branchOutcomes.third += entry.outcomeCounts.third;
      branchOutcomes.out += entry.outcomeCounts.out;
    }
    const verdict = ownVerdict(allOutcomes);

    const conditions: FocusCondition[] = [];
    if (verdict === "depends") {
      for (const [otherKey, entry] of byOther) {
        const parts = otherMatches.map((m, i) => ({
          team1: m.team1,
          team2: m.team2,
          result: (otherKey[i] ?? "D") as WDL,
        }));
        const outcomeRates: Partial<Record<Outcome, number>> = {};
        for (const o of ["advance", "third", "out"] as Outcome[]) {
          if (entry.outcomeCounts[o] > 0) {
            outcomeRates[o] = entry.outcomeCounts[o] / entry.count;
          }
        }
        conditions.push({
          parts,
          outcome: [...entry.outcomes].sort(
            (a, b) => OUTCOME_ORDER[a] - OUTCOME_ORDER[b],
          ),
          share: entry.count / branchCount,
          shareTotal: entry.count / totalCombos,
          comboCount: entry.count,
          outcomeRates,
        });
      }
      conditions.sort((a, b) => b.share - a.share);
    }

    branches.push({
      ownResult: ownWDL,
      ownLabel: ownWDL.map((w) => WDL_KO[w]).join("·"),
      ownMatches: ownMatchRefs,
      outcomes: [...allOutcomes].sort((a, b) => OUTCOME_ORDER[a] - OUTCOME_ORDER[b]),
      verdict,
      conditions,
      share: branchCount / totalCombos,
      comboCount: branchCount,
      advanceRate: branchOutcomes.advance / branchCount,
      thirdRate: branchOutcomes.third / branchCount,
      outRate: branchOutcomes.out / branchCount,
    });
  }

  // 승 → 무 → 패 순 정렬 (첫 경기 기준)
  const orderKey = (b: FocusBranch) =>
    b.ownResult[0] === "W" ? 0 : b.ownResult[0] === "D" ? 1 : 2;
  branches.sort((a, b) => orderKey(a) - orderKey(b));
  return branches;
}

/**
 * 포커스 팀의 '다음 경기 결과(승/무/패)'별로 가능한 최종 순위(1~4) 집합.
 * 본선 대진(32강 상대) 분석에 사용.
 */
export function focusFinishingRanks(
  matches: Match[],
  group: GroupId,
  focus: string,
): Record<WDL, number[]> {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  const ownMatches = remaining.filter(
    (m) => m.team1 === focus || m.team2 === focus,
  );

  if (ownMatches.length === 0) {
    const st = rankTeams(teams, real);
    const r = st.find((x) => x.team === focus)?.rank ?? 4;
    return { W: [r], D: [r], L: [r] };
  }

  const firstOwn = ownMatches[0];
  const { cap } = pickCap(remaining.length);
  const byVerb: Record<WDL, Set<number>> = {
    W: new Set(),
    D: new Set(),
    L: new Set(),
  };

  forEachCombo(remaining, cap, (hypo) => {
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    const rank = st.find((x) => x.team === focus)!.rank;
    const r = hypo.find(
      (h) => h.a === firstOwn.team1 && h.b === firstOwn.team2,
    )!;
    let res = wdl(r.sa, r.sb);
    if (firstOwn.team1 !== focus) res = res === "W" ? "L" : res === "L" ? "W" : "D";
    byVerb[res].add(rank);
  });

  const sortNums = (s: Set<number>) => [...s].sort((a, b) => a - b);
  return { W: sortNums(byVerb.W), D: sortNums(byVerb.D), L: sortNums(byVerb.L) };
}

/**
 * 포커스 팀의 다음 경기 승/무/패별 경우의 수·순위·진출 비율.
 */
export function focusVerbStats(
  matches: Match[],
  group: GroupId,
  focus: string,
): { totalCombos: number; verbs: Record<WDL, FocusVerbStat> } | null {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  const ownMatches = remaining.filter(
    (m) => m.team1 === focus || m.team2 === focus,
  );
  if (ownMatches.length === 0) return null;

  const firstOwn = ownMatches[0];
  const { cap } = pickCap(remaining.length);

  type VerbAcc = {
    count: number;
    outcomes: Record<Outcome, number>;
    ranks: Map<number, number>;
  };
  const acc: Record<WDL, VerbAcc> = {
    W: { count: 0, outcomes: { advance: 0, third: 0, out: 0 }, ranks: new Map() },
    D: { count: 0, outcomes: { advance: 0, third: 0, out: 0 }, ranks: new Map() },
    L: { count: 0, outcomes: { advance: 0, third: 0, out: 0 }, ranks: new Map() },
  };
  let totalCombos = 0;

  forEachCombo(remaining, cap, (hypo) => {
    totalCombos++;
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    const row = st.find((x) => x.team === focus)!;
    const outcome = rankToOutcome(row.rank);
    const r = hypo.find(
      (h) => h.a === firstOwn.team1 && h.b === firstOwn.team2,
    )!;
    let res = wdl(r.sa, r.sb);
    if (firstOwn.team1 !== focus) res = res === "W" ? "L" : res === "L" ? "W" : "D";

    const v = acc[res];
    v.count++;
    v.outcomes[outcome]++;
    v.ranks.set(row.rank, (v.ranks.get(row.rank) ?? 0) + 1);
  });

  const verbs = {} as Record<WDL, FocusVerbStat>;
  for (const key of ["W", "D", "L"] as WDL[]) {
    const v = acc[key];
    verbs[key] = {
      share: v.count / totalCombos,
      comboCount: v.count,
      advanceRate: v.count ? v.outcomes.advance / v.count : 0,
      thirdRate: v.count ? v.outcomes.third / v.count : 0,
      outRate: v.count ? v.outcomes.out / v.count : 0,
      ranks: [...v.ranks.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([rank, comboCount]) => ({
          rank,
          comboCount,
          share: v.count ? comboCount / v.count : 0,
        })),
    };
  }

  return { totalCombos, verbs };
}

/**
 * 한 조의 남은 경기 경우의 수별 최종 순위(1~4) 팀 분포.
 */
export function groupRankDistribution(
  matches: Match[],
  group: GroupId,
): GroupRankDistribution {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  const byRank = new Map<number, Map<string, number>>();
  for (let r = 1; r <= 4; r++) byRank.set(r, new Map());

  if (remaining.length === 0) {
    const st = rankTeams(teams, real);
    for (const row of st) {
      byRank.get(row.rank)!.set(row.team, 1);
    }
    return { total: 1, byRank };
  }

  const { cap } = pickCap(remaining.length);
  let total = 0;

  forEachCombo(remaining, cap, (hypo) => {
    total++;
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    for (const row of st) {
      const m = byRank.get(row.rank)!;
      m.set(row.team, (m.get(row.team) ?? 0) + 1);
    }
  });

  return { total, byRank };
}

/**
 * 포커스 팀이 조 3위로 마칠 때, 와일드카드(32강) 진출 비율.
 * 해당 조 경우의 수만 열거하고 다른 조는 현재 순위 기준.
 */
export function focusThirdWildcardRate(
  matches: Match[],
  group: GroupId,
  focus: string,
): number | null {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  if (remaining.length === 0) return null;

  const { cap } = pickCap(remaining.length);
  let thirdCount = 0;
  let qualifyCount = 0;

  forEachCombo(remaining, cap, (hypo) => {
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    const row = st.find((x) => x.team === focus)!;
    if (row.rank !== 3) return;
    thirdCount++;

    const merged = matches.map((m) => {
      if (m.group !== group || m.score) return m;
      const h = hypo.find((x) => x.a === m.team1 && x.b === m.team2);
      if (h) return { ...m, score: [h.sa, h.sb] as [number, number] };
      return m;
    });
    const tpt = thirdPlaceTable(merged);
    if (tpt.some((r) => r.group === group && r.qualifies)) qualifyCount++;
  });

  return thirdCount ? qualifyCount / thirdCount : null;
}

/** 패(또는 지정 WDL) 이후 조 3위 → 와일드카드 순위(승점·득실) 비교 */
export interface ThirdWildcardSnapshot {
  points: number;
  gd: number;
  gf: number;
  played: number;
  rank: number;
  qualifies: boolean;
  /** 3위 시나리오 중 비율 */
  share: number;
}

export interface ThirdFollowUp {
  /** 패 분기 내 조 3위 비율 */
  rank3Share: number;
  /** 패 분기 내 조 4위(탈락) 비율 */
  rank4Share: number;
  /**
   * 3위일 때 와일드카드(8위권) 진출 비율.
   * 타 조에 미완료 경기가 있으면 '현재 스냅샷' 기준이며 최종 확률이 아님.
   */
  wildcardRate: number;
  /** true면 타 조 경기 미완료 — 순위·진출권은 변동 가능 */
  snapshotOnly: boolean;
  /** 비교표 기준 경기가 남은 타 조 수 (포커스 조 제외) */
  incompleteGroups: number;
  /** 3위일 때 승점·득실 조합별 와일드카드 순위 (share 내림차순) */
  snapshots: ThirdWildcardSnapshot[];
  /** 대표 3위 시나리오의 12개 조 3위 순위표 */
  comparisonTable: ThirdPlaceRow[];
}

function mergeGroupHypo(
  matches: Match[],
  group: GroupId,
  hypo: Result[],
): Match[] {
  return matches.map((m) => {
    if (m.group !== group || m.score) return m;
    const h = hypo.find((x) => x.a === m.team1 && x.b === m.team2);
    if (h) return { ...m, score: [h.sa, h.sb] as [number, number] };
    return m;
  });
}

/**
 * 포커스 팀이 특정 경기 결과(주로 패) 후 조 3위일 때
 * 12개 조 3위 와일드카드 순위(승점 → 득실 → 득점) 비교.
 * 해당 조 경우의 수만 열거하고 다른 조는 현재 순위 기준.
 */
export function analyzeThirdFollowUp(
  matches: Match[],
  group: GroupId,
  focus: string,
  ownFilter: WDL,
): ThirdFollowUp | null {
  const teams = teamsInGroup(group).map((t) => t.name);
  const real = resultsFromMatches(matches, group);

  const remaining: RemainingMatch[] = matches
    .filter((m) => m.group === group && !m.score && m.team1 && m.team2)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .map((m) => ({ id: m.id, team1: m.team1, team2: m.team2 }));

  const ownMatches = remaining.filter(
    (m) => m.team1 === focus || m.team2 === focus,
  );
  if (ownMatches.length === 0) return null;

  const firstOwn = ownMatches[0];
  const { cap } = pickCap(remaining.length);

  let branchCount = 0;
  let thirdCount = 0;
  let rank4Count = 0;
  let wcCount = 0;
  const snapshotCounts = new Map<
    string,
    { snap: ThirdWildcardSnapshot; count: number; merged: Match[] }
  >();
  let primaryKey = "";
  let primaryCount = 0;

  forEachCombo(remaining, cap, (hypo) => {
    const r = hypo.find(
      (h) => h.a === firstOwn.team1 && h.b === firstOwn.team2,
    )!;
    let res = wdl(r.sa, r.sb);
    if (firstOwn.team1 !== focus) res = res === "W" ? "L" : res === "L" ? "W" : "D";
    if (res !== ownFilter) return;

    branchCount++;
    const all = real.concat(hypo);
    const st = rankTeams(teams, all);
    const row = st.find((x) => x.team === focus)!;

    if (row.rank === 3) {
      thirdCount++;
      const merged = mergeGroupHypo(matches, group, hypo);
      const tpt = thirdPlaceTable(merged);
      const groupRow = tpt.find((x) => x.group === group)!;
      const qualifies = groupRow.qualifies;
      if (qualifies) wcCount++;

      const key = `${groupRow.points},${groupRow.gd},${groupRow.gf},${groupRow.rank}`;
      const existing = snapshotCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        snapshotCounts.set(key, {
          snap: {
            points: groupRow.points,
            gd: groupRow.gd,
            gf: groupRow.gf,
            played: groupRow.played,
            rank: groupRow.rank,
            qualifies,
            share: 0,
          },
          count: 1,
          merged,
        });
      }
      const entry = snapshotCounts.get(key)!;
      if (entry.count > primaryCount) {
        primaryCount = entry.count;
        primaryKey = key;
      }
    } else if (row.rank === 4) {
      rank4Count++;
    }
  });

  if (branchCount === 0) return null;

  const snapshots = [...snapshotCounts.values()]
    .map(({ snap, count }) => ({
      ...snap,
      share: thirdCount ? count / thirdCount : 0,
    }))
    .sort((a, b) => b.share - a.share);

  const primaryMerged = snapshotCounts.get(primaryKey)?.merged ?? matches;
  const comparisonTable = thirdCount ? thirdPlaceTable(primaryMerged) : [];
  const incompleteGroups = comparisonTable.filter(
    (r) => !r.groupComplete && r.group !== group,
  ).length;
  const snapshotOnly = GROUP_IDS.some((g) =>
    matches.some((m) => m.group === g && !m.score),
  );

  return {
    rank3Share: thirdCount / branchCount,
    rank4Share: rank4Count / branchCount,
    wildcardRate: thirdCount ? wcCount / thirdCount : 0,
    snapshotOnly,
    incompleteGroups,
    snapshots,
    comparisonTable,
  };
}
