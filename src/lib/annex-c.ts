import type { GroupId } from "./types";
import annexCData from "../../data/annex-c.json";

/** FIFA 2026 Annex C — 495 third-place combination → 32강 슬롯 배정 */
export interface AnnexCRow {
  key: string;
  assign: Record<string, GroupId>;
}

const TABLE = annexCData as AnnexCRow[];

/** 진출한 8개 조 3위의 그룹 문자 → Annex C 키 (알파벳 정렬) */
export function annexCKey(qualifyingGroups: GroupId[]): string {
  return [...qualifyingGroups].sort().join("");
}

/** Annex C 조회: matchNum(73~87) → 해당 3위 팀의 조 */
export function annexCAssign(
  qualifyingGroups: GroupId[],
): Map<number, GroupId> | null {
  const key = annexCKey(qualifyingGroups);
  const row = TABLE.find((r) => r.key === key);
  if (!row) return null;
  const out = new Map<number, GroupId>();
  for (const [num, g] of Object.entries(row.assign)) {
    out.set(Number(num), g as GroupId);
  }
  return out;
}

/** 특정 조 3위가 배정되는 32강 경기 번호 (없으면 null) */
export function annexCMatchForGroup(
  qualifyingGroups: GroupId[],
  group: GroupId,
): number | null {
  const assign = annexCAssign(qualifyingGroups);
  if (!assign) return null;
  for (const [num, g] of assign) {
    if (g === group) return num;
  }
  return null;
}

/** 3위 슬롯이 있는 32강 경기 번호 */
export const THIRD_SLOT_MATCHES = [74, 77, 79, 80, 81, 82, 85, 87] as const;
