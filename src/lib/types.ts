export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export interface Team {
  /** openfootball English name, used as the canonical key across sources */
  name: string;
  /** 3-letter code */
  code: string;
  /** ISO 3166-1 alpha-2 (or gb-eng/gb-sct) for flag images */
  a2: string;
  /** Korean display name */
  ko: string;
  /** flag emoji (fallback) */
  flag: string;
  group: GroupId;
  /** FIFA World Ranking (Nov 2025 basis, approximate) */
  fifaRank: number;
  /** FIFA/Coca-Cola World Ranking points (19 Nov 2025 official). Elo 확률 모델 입력값. */
  fifaPoints: number;
}

export type MatchStage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export interface MatchGoal {
  name: string;
  minute: string;
  penalty?: boolean;
  owngoal?: boolean;
}

export interface Match {
  id: string;
  stage: MatchStage;
  group: GroupId | null;
  matchday: number | null;
  /** ISO date (local to venue) */
  date: string;
  /** original time string, e.g. "20:00 UTC-6" */
  timeRaw: string;
  /** kickoff as epoch ms (UTC), or null if unparseable */
  kickoff: number | null;
  team1: string;
  team2: string;
  /** placeholder labels for knockout (e.g. "2A", "W73") when teams unknown */
  team1Label: string | null;
  team2Label: string | null;
  score: [number, number] | null;
  status: "finished" | "upcoming" | "live";
  ground: string;
  goals1: MatchGoal[];
  goals2: MatchGoal[];
}

export interface StandingRow {
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  /** 1-based rank within the group after tiebreakers */
  rank: number;
}

export interface Dataset {
  matches: Match[];
  /** ISO timestamp when this snapshot was produced */
  fetchedAt: string;
  /** which source produced the data */
  source: string;
}
