import type { GroupId, Match, StandingRow } from "../types";
import { teamsInGroup } from "../teams";
import { rankTeams, resultsFromMatches, type Result } from "../standings";

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

  // ownResultKey -> otherKey(WDL 시퀀스) -> Set<Outcome>
  type Bucket = Map<string, Map<string, Set<Outcome>>>;
  const buckets: Bucket = new Map();
  const ownLabels = new Map<string, WDL[]>();

  forEachCombo(remaining, cap, (hypo) => {
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
    let set = byOther.get(otherKey);
    if (!set) {
      set = new Set();
      byOther.set(otherKey, set);
    }
    set.add(outcome);
  });

  const ownMatchRefs: MatchRef[] = ownMatches.map((m) => ({
    team1: m.team1,
    team2: m.team2,
  }));

  const branches: FocusBranch[] = [];
  for (const [ownKey, byOther] of buckets) {
    const ownWDL = ownLabels.get(ownKey)!;
    const allOutcomes = new Set<Outcome>();
    for (const set of byOther.values()) for (const o of set) allOutcomes.add(o);
    const verdict = ownVerdict(allOutcomes);

    const conditions: FocusCondition[] = [];
    if (verdict === "depends") {
      for (const [otherKey, set] of byOther) {
        const parts = otherMatches.map((m, i) => ({
          team1: m.team1,
          team2: m.team2,
          result: (otherKey[i] ?? "D") as WDL,
        }));
        conditions.push({
          parts,
          outcome: [...set].sort((a, b) => OUTCOME_ORDER[a] - OUTCOME_ORDER[b]),
        });
      }
    }

    branches.push({
      ownResult: ownWDL,
      ownLabel: ownWDL.map((w) => WDL_KO[w]).join("·"),
      ownMatches: ownMatchRefs,
      outcomes: [...allOutcomes].sort((a, b) => OUTCOME_ORDER[a] - OUTCOME_ORDER[b]),
      verdict,
      conditions,
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
