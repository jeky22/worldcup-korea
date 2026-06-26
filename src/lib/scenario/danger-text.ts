import { teamKo } from "../teams";

export type WDL = "W" | "D" | "L";

export interface DangerInput {
  /** 위험 경기의 team1 (홈/A) */
  team1: string;
  /** 위험 경기의 team2 (원정/B) */
  team2: string;
  dangerResult: WDL | null;
  dangerThreatTeam: string | null;
  dangerThresholdMargin: number | null;
  dangerAlways: boolean;
  dangerProb: number | null;
}

/**
 * "탈락 위험" 문구 생성 (SurvivalRow / HomeHero 공통).
 * lead = 빨갛게 강조할 트리거, tail = 결과 설명.
 */
export function describeDanger(d: DangerInput): { lead: string; tail: string } {
  const threat = teamKo(d.dangerThreatTeam ?? d.team1);

  if (d.dangerAlways) {
    return { lead: "결과와 무관하게", tail: " 이 조 3위 한국 추월 확정" };
  }

  const T = d.dangerThresholdMargin;
  if (T === null) {
    const who =
      d.dangerResult === "W"
        ? `${teamKo(d.team1)} 승`
        : d.dangerResult === "L"
          ? `${teamKo(d.team2)} 승`
          : "무승부";
    const prob = d.dangerProb ?? 0;
    return {
      lead: `${who} 시`,
      tail:
        prob >= 0.9995
          ? " 이 조 3위 한국 추월 확정"
          : ` 이 조 3위 한국 추월 가능 (${(prob * 100).toFixed(0)}%)`,
    };
  }

  let lead: string;
  if (T >= 2) lead = `${threat} ${T}골차 이상 승 시`;
  else if (T === 1) lead = `${threat} 승 시`;
  else if (T === 0) lead = `${threat} 무·승 시`;
  else if (T === -1) lead = `${threat} 1골차 이내 패(무·승 포함) 시`;
  else lead = `${threat} ${-T}골차 이내 패 시`;
  return { lead, tail: " 이 조 3위 한국 추월 확정" };
}
