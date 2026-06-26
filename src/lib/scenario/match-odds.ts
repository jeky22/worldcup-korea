import { fifaPoints } from "../teams";
import type { Result } from "../standings";

/**
 * FIFA 랭킹 포인트 기반 승/무/패 확률 모델.
 *
 * 1) 무승부: 점수차가 클수록 감쇄 — P(무) = 0.33 · exp(-(ΔP/200)²)
 * 2) 잔여(승+패) = 1 − P(무)
 * 3) Elo 승리 기대치 E_A = 1 / (10^((P_B − P_A)/600) + 1)
 * 4) P(A승) = 잔여 · E_A, P(B승) = 잔여 · (1 − E_A)
 *
 * 점수가 같으면 승 33.5% / 무 33% / 패 33.5%로 수렴.
 */
export interface Wdl {
  /** team1(홈/A) 승 */
  win: number;
  draw: number;
  /** team2(원정/B) 승 */
  loss: number;
}

const DRAW_BASE = 0.33;
const DRAW_SCALE = 200;
const ELO_SCALE = 600;

export function matchOdds(pointsA: number, pointsB: number): Wdl {
  const delta = pointsA - pointsB;
  const draw = DRAW_BASE * Math.exp(-((delta / DRAW_SCALE) ** 2));
  const rest = 1 - draw;
  const expA = 1 / (10 ** ((pointsB - pointsA) / ELO_SCALE) + 1);
  return { win: rest * expA, draw, loss: rest * (1 - expA) };
}

export interface ScoreCell {
  sa: number;
  sb: number;
  /** 이 스코어라인의 확률 (한 경기 내 합 = 1) */
  p: number;
}

/**
 * 고정 스코어라인 빈도표 (경험적 분포, 승자 관점 high:low).
 * 결과(승/무/패) 버킷 안에서 스코어라인의 상대 빈도(모양)로만 쓰인다.
 * 절대 비율이 아니라, 버킷 내 정규화 후 Elo 승/무/패 비중과 곱한다.
 */
const WIN_FREQ: Record<string, number> = {
  "1:0": 10.26,
  "2:1": 8.02,
  "2:0": 6.41,
  "3:1": 3.34,
  "3:0": 2.67,
  "3:2": 2.09,
  "4:1": 1.04,
  "4:0": 0.84,
  "4:2": 0.65,
  "4:3": 0.27,
};
/** 무승부 스코어 빈도 (양 팀 동점 골수 → 빈도) */
const DRAW_FREQ: Record<number, number> = {
  0: 8.21,
  1: 12.82,
  2: 5.01,
  3: 0.87,
  4: 0.08,
};

/**
 * 한 경기의 스코어라인별 확률 분포.
 * Elo로 승/무/패 비중을 구하고, 각 버킷 안에서는 고정 스코어 빈도표
 * (WIN_FREQ / DRAW_FREQ)를 정규화해 배분한다. (균등 분배 아님)
 * 표에 없는 스코어(0~cap 밖 또는 미수록)는 0으로 둔다.
 */
export function scorelineDistribution(
  team1: string,
  team2: string,
  cap: number,
): ScoreCell[] {
  const odds = matchOdds(fifaPoints(team1), fifaPoints(team2));
  type Raw = { sa: number; sb: number; bucket: "W" | "D" | "L"; raw: number };
  const raws: Raw[] = [];
  let sumW = 0;
  let sumD = 0;
  let sumL = 0;
  for (let a = 0; a <= cap; a++)
    for (let b = 0; b <= cap; b++) {
      if (a > b) {
        const raw = WIN_FREQ[`${a}:${b}`] ?? 0;
        sumW += raw;
        raws.push({ sa: a, sb: b, bucket: "W", raw });
      } else if (a < b) {
        const raw = WIN_FREQ[`${b}:${a}`] ?? 0;
        sumL += raw;
        raws.push({ sa: a, sb: b, bucket: "L", raw });
      } else {
        const raw = DRAW_FREQ[a] ?? 0;
        sumD += raw;
        raws.push({ sa: a, sb: b, bucket: "D", raw });
      }
    }
  return raws.map(({ sa, sb, bucket, raw }) => {
    const p =
      bucket === "W"
        ? sumW > 0
          ? (odds.win * raw) / sumW
          : 0
        : bucket === "L"
          ? sumL > 0
            ? (odds.loss * raw) / sumL
            : 0
          : sumD > 0
            ? (odds.draw * raw) / sumD
            : 0;
    return { sa, sb, p };
  });
}

export interface ComboMatch {
  team1: string;
  team2: string;
}

/**
 * 남은 경기의 모든 스코어 조합을 순회하되, 각 조합에 Elo 모델 기반
 * 확률 가중치를 부여한다. cb(results, weight) — 전체 weight 합 ≈ 1.
 */
export function forEachComboWeighted(
  remaining: ComboMatch[],
  cap: number,
  cb: (results: Result[], weight: number) => void,
): void {
  const perMatch = remaining.map((m) =>
    scorelineDistribution(m.team1, m.team2, cap),
  );
  const rec = (i: number, acc: Result[], w: number) => {
    if (i === remaining.length) {
      cb(acc, w);
      return;
    }
    const m = remaining[i];
    for (const cell of perMatch[i]) {
      acc.push({ a: m.team1, b: m.team2, sa: cell.sa, sb: cell.sb });
      rec(i + 1, acc, w * cell.p);
      acc.pop();
    }
  };
  rec(0, [], 1);
}

/** 고정 스코어 분포(scorelineDistribution)에서 한 경기 스코어를 추출 */
export function sampleScoreline(
  team1: string,
  team2: string,
  cap: number,
): [number, number] {
  const cells = scorelineDistribution(team1, team2, cap);
  let r = Math.random();
  for (const c of cells) {
    r -= c.p;
    if (r <= 0) return [c.sa, c.sb];
  }
  const last = cells[cells.length - 1];
  return [last.sa, last.sb];
}
