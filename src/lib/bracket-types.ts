import type { MatchStage } from "./types";

export type WDL = "W" | "D" | "L";

/* 한국 32강 상대 분석 */
export interface OppCandidate {
  name: string;
  fifaRank: number;
  /** 해당 슬롯 경우의 수 비율 (0~1) */
  share: number;
}
export interface KoMatchInfo {
  stageLabel: string;
  date: string | null;
  kickoff: number | null;
  ground: string | null;
  opponentLabel: string;
  candidates: OppCandidate[];
  /** 상대가 100% 확정인지 */
  fixed: boolean;
  /** 상대 확률 계산 기준 조 (없으면 미정 슬롯) */
  sourceGroup?: string;
}
export interface KoRankStep {
  rank: number;
  /** 이 승/무/패 분기 내 순위 비율 (0~1) */
  share: number;
  comboCount: number;
  result: "직행" | "와일드카드" | "탈락";
  match: KoMatchInfo | null;
  /** 3위일 때 와일드카드 진출 비율 (해당 조 기준, 0~1) */
  wildcardRate?: number;
}
export interface KoVerbBlock {
  verb: WDL;
  verbKo: string;
  /** 전체 경우의 수 대비 이 결과 비율 (0~1) */
  share: number;
  comboCount: number;
  ranks: KoRankStep[];
}

/* 전체 대진 시뮬레이션 */
export interface BSide {
  name: string | null;
  label: string;
  /** 이 자리가 확정됐는지 (조별리그 완료로 진출·시드 확정, 또는 실제 경기 결과) */
  locked: boolean;
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
