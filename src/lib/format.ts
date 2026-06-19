/** 마지막 글자에 받침이 있는지 */
function hasBatchim(word: string): boolean {
  if (!word) return false;
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return false;
  return (c - 0xac00) % 28 !== 0;
}

type JosaPair = "이가" | "을를" | "와과" | "은는" | "으로로";

/** 단어 + 알맞은 조사 (받침 유무에 따라) */
export function withJosa(word: string, pair: JosaPair): string {
  const b = hasBatchim(word);
  const map: Record<JosaPair, [string, string]> = {
    이가: ["이", "가"],
    을를: ["을", "를"],
    와과: ["과", "와"],
    은는: ["은", "는"],
    으로로: ["으로", "로"],
  };
  const [withB, noB] = map[pair];
  return word + (b ? withB : noB);
}

/** epoch ms → KST 날짜/시간 표기 */
const KST_OFFSET = 9 * 60; // minutes

function toKstParts(epoch: number) {
  const d = new Date(epoch + KST_OFFSET * 60 * 1000);
  return {
    y: d.getUTCFullYear(),
    mo: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    mi: d.getUTCMinutes(),
    dow: d.getUTCDay(),
  };
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function kstDate(epoch: number | null): string {
  if (epoch == null) return "일정 미정";
  const p = toKstParts(epoch);
  return `${p.mo}/${p.d}(${DOW[p.dow]})`;
}

export function kstTime(epoch: number | null): string {
  if (epoch == null) return "--:--";
  const p = toKstParts(epoch);
  return `${String(p.h).padStart(2, "0")}:${String(p.mi).padStart(2, "0")}`;
}

export function kstDateTime(epoch: number | null): string {
  if (epoch == null) return "일정 미정";
  return `${kstDate(epoch)} ${kstTime(epoch)} KST`;
}

/** ISO 문자열 → "2026-06-19 14:32 KST" */
export function kstStamp(iso: string): string {
  const epoch = Date.parse(iso);
  if (Number.isNaN(epoch)) return iso;
  const p = toKstParts(epoch);
  return `${p.y}-${String(p.mo).padStart(2, "0")}-${String(p.d).padStart(2, "0")} ${String(p.h).padStart(2, "0")}:${String(p.mi).padStart(2, "0")} KST`;
}

/** 남은 시간(상대) 표기 */
export function relativeTo(epoch: number | null, now = Date.now()): string {
  if (epoch == null) return "";
  const diff = epoch - now;
  if (diff < 0) return "진행/종료";
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}분 후`;
  if (h < 24) return `${h}시간 후`;
  return `${Math.floor(h / 24)}일 후`;
}
