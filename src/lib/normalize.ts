import type { GroupId, Match, MatchStage } from "./types";

export interface RawGoal {
  name: string;
  minute: string;
  penalty?: boolean;
  owngoal?: boolean;
}
export interface RawMatch {
  round: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  score?: { ft: [number, number]; ht?: [number, number] };
  goals1?: RawGoal[];
  goals2?: RawGoal[];
  group?: string;
  ground: string;
}
export interface RawData {
  name: string;
  matches: RawMatch[];
}

const STAGE_MAP: Record<string, MatchStage> = {
  "Round of 32": "round-of-32",
  "Round of 16": "round-of-16",
  "Quarter-final": "quarter-final",
  "Semi-final": "semi-final",
  "Match for third place": "third-place",
  Final: "final",
};

/** "20:00 UTC-6" + date -> epoch ms (UTC). null if unparseable. */
export function parseKickoff(date: string, time: string): number | null {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?/);
  if (!m) return null;
  const [, hh, mm, offRaw] = m;
  const offset = offRaw ? parseInt(offRaw, 10) : 0;
  const [y, mo, d] = date.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const utc = Date.UTC(y, mo - 1, d, Number(hh) - offset, Number(mm));
  return Number.isFinite(utc) ? utc : null;
}

function isPlaceholder(name: string): boolean {
  return /^[0-9][A-L]$/.test(name) || /^[WL]\d+/.test(name) || name.includes("/");
}

export function normalize(raw: RawData): Match[] {
  return raw.matches.map((r, i) => {
    const stage: MatchStage = r.group ? "group" : STAGE_MAP[r.round] ?? "round-of-32";
    const group = (r.group?.replace("Group ", "") as GroupId) ?? null;
    const matchdayMatch = r.round.match(/Matchday (\d+)/);
    const matchday = matchdayMatch ? Number(matchdayMatch[1]) : null;
    const t1ph = isPlaceholder(r.team1);
    const t2ph = isPlaceholder(r.team2);
    return {
      id: r.num ? `m${r.num}` : `g${i}`,
      stage,
      group: stage === "group" ? group : null,
      matchday,
      date: r.date,
      timeRaw: r.time,
      kickoff: parseKickoff(r.date, r.time),
      team1: t1ph ? "" : r.team1,
      team2: t2ph ? "" : r.team2,
      team1Label: t1ph ? r.team1 : null,
      team2Label: t2ph ? r.team2 : null,
      score: r.score?.ft ?? null,
      status: r.score?.ft ? "finished" : "upcoming",
      ground: r.ground,
      goals1: r.goals1 ?? [],
      goals2: r.goals2 ?? [],
    } satisfies Match;
  });
}

export const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
