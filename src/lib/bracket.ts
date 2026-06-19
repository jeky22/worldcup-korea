import type { GroupId, Match, MatchStage } from "./types";
import type {
  BMatch,
  KoMatchInfo,
  KoRankStep,
  KoVerbBlock,
  OppCandidate,
  ProjectedBracket,
  WDL,
} from "./bracket-types";
import {
  annexCAssign,
  annexCMatchForGroup,
} from "./annex-c";
import { computeStandings } from "./standings";
import { thirdPlaceTable } from "./scenario/third-place";
import { fifaRank, GROUP_IDS, KOREA, getTeam } from "./teams";
import { focusFinishingRanks } from "./scenario/engine";

export type {
  BMatch,
  KoMatchInfo,
  KoRankStep,
  KoVerbBlock,
  OppCandidate,
  ProjectedBracket,
};

/* ---------- 그룹 순위 투영 ---------- */

interface GroupPos {
  first: string;
  second: string;
  third: string;
}

function groupPositions(matches: Match[]): Record<GroupId, GroupPos> {
  const out = {} as Record<GroupId, GroupPos>;
  for (const g of GROUP_IDS) {
    const st = computeStandings(matches, g);
    out[g] = {
      first: st[0]?.team ?? "",
      second: st[1]?.team ?? "",
      third: st[2]?.team ?? "",
    };
  }
  return out;
}

/* ---------- 라벨 파싱 ---------- */

const GROUP_SLOT = /^([12])([A-L])$/;
const THIRD_SLOT = /^3([A-L/]+)$/;
const WIN_REF = /^W(\d+)$/;
const LOSE_REF = /^L(\d+)$/;

function numFromId(id: string): number {
  return Number(id.replace(/^m/, ""));
}

function matchByNum(matches: Match[], num: number): Match | undefined {
  return matches.find((m) => numFromId(m.id) === num);
}

/* ---------- 대진 트리 순서 (결승에서 역추적) ---------- */

const WIN_FEEDER = /^W(\d+)$/;

/** 경기의 두 피더(승자) 경기 번호 (조별리그 슬롯이면 빈 배열) */
function feederNums(m: Match): number[] {
  const out: number[] = [];
  for (const label of [m.team1Label, m.team2Label]) {
    const w = label?.match(WIN_FEEDER);
    if (w) out.push(Number(w[1]));
  }
  return out;
}

export function orderByNums(matches: BMatch[], nums: number[]): BMatch[] {
  const byNum = new Map(matches.map((m) => [m.num, m]));
  return nums.map((n) => byNum.get(n)).filter(Boolean) as BMatch[];
}

/* ---------- 전체 대진 시뮬레이션 ---------- */

const STAGE_LABEL: Record<MatchStage, string> = {
  group: "조별리그",
  "round-of-32": "32강",
  "round-of-16": "16강",
  "quarter-final": "8강",
  "semi-final": "준결승",
  "third-place": "3·4위전",
  final: "결승",
};

function pickWinner(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return fifaRank(a) <= fifaRank(b) ? a : b;
}

/** favor 팀이 경기에 있으면 무조건 favor 승리, 아니면 FIFA 랭킹 */
function pickFavored(
  a: string | null,
  b: string | null,
  favor?: string,
): string | null {
  if (favor) {
    if (a === favor) return a;
    if (b === favor) return b;
  }
  return pickWinner(a, b);
}

/** FIFA Annex C 기반 3위 슬롯 → 팀명 */
function resolveThirdTeam(
  matchNum: number,
  pos: Record<GroupId, GroupPos>,
  thirdAssign: Map<number, GroupId> | null,
): string | null {
  if (!thirdAssign) return null;
  const g = thirdAssign.get(matchNum);
  return g ? pos[g].third || null : null;
}

export function projectBracket(
  matches: Match[],
  opts?: { favor?: string },
): ProjectedBracket {
  const pos = groupPositions(matches);
  const tpt = thirdPlaceTable(matches);
  const qualifyingGroups = tpt.filter((r) => r.qualifies).map((r) => r.group);
  const thirdAssign = annexCAssign(qualifyingGroups);

  const koMatches = matches
    .filter((m) => m.stage !== "group")
    .sort((a, b) => numFromId(a.id) - numFromId(b.id));

  const winnerOf = new Map<string, string | null>();
  const loserOf = new Map<string, string | null>();

  const resolve = (matchId: string, label: string): string | null => {
    const gs = label.match(GROUP_SLOT);
    if (gs) {
      const p = gs[1];
      const g = gs[2] as GroupId;
      return p === "1" ? pos[g].first : pos[g].second;
    }
    const ts = label.match(THIRD_SLOT);
    if (ts) {
      return resolveThirdTeam(numFromId(matchId), pos, thirdAssign);
    }
    const w = label.match(WIN_REF);
    if (w) return winnerOf.get(`m${w[1]}`) ?? null;
    const l = label.match(LOSE_REF);
    if (l) return loserOf.get(`m${l[1]}`) ?? null;
    return null;
  };

  const built: BMatch[] = [];
  for (const m of koMatches) {
    const name1 = m.team1 || resolve(m.id, m.team1Label ?? "");
    const name2 = m.team2 || resolve(m.id, m.team2Label ?? "");
    let winner: string | null;
    let loser: string | null;
    if (m.score && m.team1 && m.team2) {
      winner = m.score[0] >= m.score[1] ? m.team1 : m.team2;
      loser = m.score[0] >= m.score[1] ? m.team2 : m.team1;
    } else {
      winner = pickFavored(name1, name2, opts?.favor);
      loser = winner === name1 ? name2 : name1;
    }
    winnerOf.set(m.id, winner);
    loserOf.set(m.id, loser);
    built.push({
      id: m.id,
      num: numFromId(m.id),
      stage: m.stage,
      side1: { name: name1, label: m.team1Label ?? m.team1 },
      side2: { name: name2, label: m.team2Label ?? m.team2 },
      winner,
      date: m.date,
      kickoff: m.kickoff,
      ground: m.ground,
      hasKorea: name1 === KOREA || name2 === KOREA,
    });
  }

  const byStage = (s: MatchStage) => built.filter((m) => m.stage === s);

  // 결승에서 역추적해 트리 시각 순서(위→아래) 계산
  const koByNum = new Map(koMatches.map((m) => [numFromId(m.id), m]));
  const finalMatch = koMatches.find((m) => m.stage === "final");
  const finalNum = finalMatch ? numFromId(finalMatch.id) : 104;

  const parentOf = new Map<number, number>();
  for (const m of koMatches) {
    const p = numFromId(m.id);
    for (const c of feederNums(m)) parentOf.set(c, p);
  }

  const leafOrder: number[] = [];
  const walk = (num: number) => {
    const m = koByNum.get(num);
    const ch = m ? feederNums(m) : [];
    if (ch.length < 2) {
      leafOrder.push(num);
      return;
    }
    walk(ch[0]);
    walk(ch[1]);
  };
  walk(finalNum);

  const nextRound = (order: number[]): number[] => {
    const res: number[] = [];
    for (let i = 0; i < order.length; i += 2) {
      const p = parentOf.get(order[i]);
      if (p != null) res.push(p);
    }
    return res;
  };

  const r32order = leafOrder;
  const r16order = nextRound(r32order);
  const qforder = nextRound(r16order);
  const sforder = nextRound(qforder);
  const finalorder = nextRound(sforder);

  const feedPairs: [number, number][] = [];
  for (let i = 0; i + 1 < r32order.length; i += 2) {
    feedPairs.push([r32order[i], r32order[i + 1]]);
  }

  const rounds = (
    [
      { key: "round-of-32" as MatchStage, nums: r32order },
      { key: "round-of-16" as MatchStage, nums: r16order },
      { key: "quarter-final" as MatchStage, nums: qforder },
      { key: "semi-final" as MatchStage, nums: sforder },
      { key: "final" as MatchStage, nums: finalorder },
    ] as const
  ).map(({ key, nums }) => ({
    key,
    label: STAGE_LABEL[key],
    matches: orderByNums(byStage(key), nums),
    feedPairs: key === "round-of-32" ? feedPairs : undefined,
  }));

  const final = byStage("final")[0];
  return {
    rounds,
    thirdPlace: byStage("third-place")[0] ?? null,
    champion: final?.winner ?? null,
  };
}

/* ---------- 한국 32강 상대 분석 ---------- */

const VERB_KO: Record<WDL, string> = { W: "이기면", D: "비기면", L: "지면" };

function cand(name: string): OppCandidate {
  return { name, fifaRank: fifaRank(name) };
}

function findSlot(
  matches: Match[],
  slot: string,
): { match: Match; oppLabel: string } | null {
  for (const m of matches) {
    if (m.team1Label === slot) return { match: m, oppLabel: m.team2Label ?? "" };
    if (m.team2Label === slot) return { match: m, oppLabel: m.team1Label ?? "" };
  }
  return null;
}

function resolveOppLabel(
  oppLabel: string,
  pos: Record<GroupId, GroupPos>,
): { label: string; candidates: OppCandidate[]; fixed: boolean } {
  const gs = oppLabel.match(GROUP_SLOT);
  if (gs) {
    const p = gs[1];
    const g = gs[2] as GroupId;
    const team = p === "1" ? pos[g].first : pos[g].second;
    return {
      label: `${g}조 ${p === "1" ? "1위" : "2위"}`,
      candidates: team ? [cand(team)] : [],
      fixed: true,
    };
  }
  return { label: oppLabel, candidates: [], fixed: false };
}

/** Annex C로 특정 조 3위의 32강 상대 확정 */
function thirdPlaceMatchInfo(
  matches: Match[],
  group: GroupId,
  pos: Record<GroupId, GroupPos>,
  qualifyingGroups: GroupId[],
): KoMatchInfo | null {
  const matchNum = annexCMatchForGroup(qualifyingGroups, group);
  if (!matchNum) return null;
  const m = matchByNum(matches, matchNum);
  if (!m) return null;

  // 3위는 away(2번) 슬롯, 1위 조가 home(1번)
  const oppLabel =
    m.team1Label?.match(GROUP_SLOT) ? m.team1Label : m.team2Label ?? "";
  const r = resolveOppLabel(oppLabel, pos);
  return {
    stageLabel: "32강",
    date: m.date,
    kickoff: m.kickoff,
    ground: m.ground,
    opponentLabel: r.label,
    candidates: r.candidates,
    fixed: true,
  };
}

export function koreaKnockout(matches: Match[]): KoVerbBlock[] {
  const group = getTeam(KOREA)!.group;
  const pos = groupPositions(matches);
  const tpt = thirdPlaceTable(matches);
  const qualifyingGroups = tpt.filter((r) => r.qualifies).map((r) => r.group);
  const koreaThirdQualifies = tpt.some(
    (r) => r.group === group && r.qualifies,
  );

  const ranksByVerb = focusFinishingRanks(matches, group, KOREA);
  const slot1 = findSlot(matches, `1${group}`);
  const slot2 = findSlot(matches, `2${group}`);

  const infoFor = (rank: number): KoMatchInfo | null => {
    if (rank === 1 && slot1) {
      const r = resolveOppLabel(slot1.oppLabel, pos);
      return {
        stageLabel: "32강",
        date: slot1.match.date,
        kickoff: slot1.match.kickoff,
        ground: slot1.match.ground,
        opponentLabel: r.label,
        candidates: r.candidates,
        fixed: r.fixed,
      };
    }
    if (rank === 2 && slot2) {
      const r = resolveOppLabel(slot2.oppLabel, pos);
      return {
        stageLabel: "32강",
        date: slot2.match.date,
        kickoff: slot2.match.kickoff,
        ground: slot2.match.ground,
        opponentLabel: r.label,
        candidates: r.candidates,
        fixed: r.fixed,
      };
    }
    if (rank === 3) {
      if (!koreaThirdQualifies) return null;
      return thirdPlaceMatchInfo(matches, group, pos, qualifyingGroups);
    }
    return null;
  };

  const verbs: WDL[] = ["W", "D", "L"];
  return verbs.map((verb) => {
    const ranks = ranksByVerb[verb];
    const steps: KoRankStep[] = ranks.map((rank) => ({
      rank,
      result:
        rank <= 2
          ? "직행"
          : rank === 3
            ? koreaThirdQualifies
              ? "와일드카드"
              : "탈락"
            : "탈락",
      match: rank <= 2 || (rank === 3 && koreaThirdQualifies) ? infoFor(rank) : null,
    }));
    return { verb, verbKo: VERB_KO[verb], ranks: steps };
  });
}
