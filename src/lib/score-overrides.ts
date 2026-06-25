import { promises as fs } from "node:fs";
import path from "node:path";
import type { Match, MatchGoal } from "./types";

export interface ScoreOverride {
  team1: string;
  team2: string;
  date?: string;
  score: [number, number];
  goals1?: MatchGoal[];
  goals2?: MatchGoal[];
}

const OVERRIDES_FILE = path.join(process.cwd(), "data", "score-overrides.json");

export async function loadScoreOverrides(): Promise<ScoreOverride[]> {
  try {
    const raw = JSON.parse(await fs.readFile(OVERRIDES_FILE, "utf8")) as {
      matches?: ScoreOverride[];
    };
    return raw.matches ?? [];
  } catch {
    return [];
  }
}

/** openfootball 반영 전 경기 결과를 로컬/캐시 데이터에 덮어씀 */
export function applyScoreOverrides(
  matches: Match[],
  overrides: ScoreOverride[],
): Match[] {
  if (!overrides.length) return matches;
  return matches.map((m) => {
    const o = overrides.find(
      (x) =>
        x.team1 === m.team1 &&
        x.team2 === m.team2 &&
        (!x.date || x.date === m.date),
    );
    if (!o) return m;
    return {
      ...m,
      score: o.score,
      status: "finished",
      goals1: o.goals1 ?? m.goals1,
      goals2: o.goals2 ?? m.goals2,
    };
  });
}
