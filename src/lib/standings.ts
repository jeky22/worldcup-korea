import type { GroupId, Match, StandingRow } from "./types";
import { fifaRank, teamsInGroup } from "./teams";

/** A completed result used for standings math (real or hypothetical). */
export interface Result {
  a: string;
  b: string;
  sa: number;
  sb: number;
}

interface Stats {
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

function emptyStats(team: string): Stats {
  return { team, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

export function buildStats(teams: string[], results: Result[]): Map<string, Stats> {
  const map = new Map<string, Stats>();
  for (const t of teams) map.set(t, emptyStats(t));
  for (const r of results) {
    const A = map.get(r.a);
    const B = map.get(r.b);
    if (!A || !B) continue;
    A.played++; B.played++;
    A.gf += r.sa; A.ga += r.sb;
    B.gf += r.sb; B.ga += r.sa;
    if (r.sa > r.sb) { A.win++; A.points += 3; B.loss++; }
    else if (r.sa < r.sb) { B.win++; B.points += 3; A.loss++; }
    else { A.draw++; B.draw++; A.points++; B.points++; }
  }
  for (const s of map.values()) s.gd = s.gf - s.ga;
  return map;
}

/**
 * FIFA 2026 group-stage tiebreakers, in order:
 * 1) points
 * 2) head-to-head points (among tied teams)
 * 3) head-to-head goal difference
 * 4) head-to-head goals scored
 * 5) overall goal difference
 * 6) overall goals scored
 * 7) (fair-play conduct — omitted: card data not available)
 * 8) FIFA World Ranking
 *
 * Card-based fair play is intentionally skipped; the dataset has no reliable
 * disciplinary data. This is documented in the UI as a limitation.
 */
export function rankTeams(
  teams: string[],
  results: Result[],
): StandingRow[] {
  const stats = buildStats(teams, results);

  const compare = (x: string, y: string): number => {
    const sx = stats.get(x)!;
    const sy = stats.get(y)!;
    // 1) overall points
    if (sy.points !== sx.points) return sy.points - sx.points;

    // 2-4) head-to-head among all teams currently tied on points
    const tied = teams.filter((t) => stats.get(t)!.points === sx.points);
    if (tied.length > 1) {
      const h2h = buildStats(
        tied,
        results.filter((r) => tied.includes(r.a) && tied.includes(r.b)),
      );
      const hx = h2h.get(x)!;
      const hy = h2h.get(y)!;
      if (hy.points !== hx.points) return hy.points - hx.points;
      if (hy.gd !== hx.gd) return hy.gd - hx.gd;
      if (hy.gf !== hx.gf) return hy.gf - hx.gf;
    }

    // 5-6) overall gd, gf
    if (sy.gd !== sx.gd) return sy.gd - sx.gd;
    if (sy.gf !== sx.gf) return sy.gf - sx.gf;

    // 8) FIFA ranking (lower number = better)
    return fifaRank(x) - fifaRank(y);
  };

  const sorted = [...teams].sort(compare);
  return sorted.map((team, i) => {
    const s = stats.get(team)!;
    return {
      team,
      played: s.played,
      win: s.win,
      draw: s.draw,
      loss: s.loss,
      gf: s.gf,
      ga: s.ga,
      gd: s.gd,
      points: s.points,
      rank: i + 1,
    } satisfies StandingRow;
  });
}

/** Extract real completed results for a group from the match list. */
export function resultsFromMatches(matches: Match[], group: GroupId): Result[] {
  return matches
    .filter((m) => m.group === group && m.score && m.team1 && m.team2)
    .map((m) => ({ a: m.team1, b: m.team2, sa: m.score![0], sb: m.score![1] }));
}

export function computeStandings(matches: Match[], group: GroupId): StandingRow[] {
  const teams = teamsInGroup(group).map((t) => t.name);
  return rankTeams(teams, resultsFromMatches(matches, group));
}
