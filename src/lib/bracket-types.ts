import type { MatchStage } from "./types";

export type WDL = "W" | "D" | "L";

/* 한국 32강 상대 분석 */
export interface OppCandidate {
  name: string;
  fifaRank: number;
}
export interface KoMatchInfo {
  stageLabel: string;
  date: string | null;
  kickoff: number | null;
  ground: string | null;
  opponentLabel: string;
  candidates: OppCandidate[];
  fixed: boolean;
}
export interface KoRankStep {
  rank: number;
  result: "직행" | "와일드카드" | "탈락";
  match: KoMatchInfo | null;
}
export interface KoVerbBlock {
  verb: WDL;
  verbKo: string;
  ranks: KoRankStep[];
}

/* 전체 대진 시뮬레이션 */
export interface BSide {
  name: string | null;
  label: string;
}
export interface BMatch {
  id: string;
  num: number;
  stage: MatchStage;
  side1: BSide;
  side2: BSide;
  winner: string | null;
  date: string;
  kickoff: number | null;
  ground: string;
  hasKorea: boolean;
}
export interface ProjectedBracket {
  rounds: {
    key: MatchStage;
    label: string;
    matches: BMatch[];
    feedPairs?: [number, number][];
  }[];
  thirdPlace: BMatch | null;
  champion: string | null;
}
