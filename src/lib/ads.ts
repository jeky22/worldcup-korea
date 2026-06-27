/** 광고 전체 표시 여부 마스터 스위치.
 *  기본 OFF — 화면에 보이는 광고(카카오 애드핏 등)를 전부 숨긴다.
 *  다시 켜려면 Vercel에 NEXT_PUBLIC_ADS=on 설정. */
export const ADS_ENABLED =
  (process.env.NEXT_PUBLIC_ADS ?? "off").toLowerCase() === "on";

/** Google AdSense — Vercel 환경 변수로 덮어쓰기 가능 */

const DEFAULT_CLIENT = "ca-pub-8205819697788557";

export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ??
  process.env.ADSENSE_CLIENT ??
  DEFAULT_CLIENT;

/** 기본 디스플레이 광고 유닛 ID */
export const ADSENSE_SLOT =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? process.env.ADSENSE_SLOT ?? "";

export function adsEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT && ADSENSE_SLOT);
}

/** 카카오 애드핏 광고 유닛 — 환경 변수로 덮어쓰기 가능 */
/** PC 가로 배너 728×90 */
export const ADFIT_UNIT_PC =
  process.env.NEXT_PUBLIC_ADFIT_UNIT_PC ?? "DAN-tzw0k3mIGouwCNcI";
/** 모바일 배너 320×100 */
export const ADFIT_UNIT_MOBILE =
  process.env.NEXT_PUBLIC_ADFIT_UNIT_MOBILE ?? "DAN-Ke4Y6efLuxbCj6Rg";
/** 애드핏 사용 여부 */
export const ADFIT_ENABLED = Boolean(ADFIT_UNIT_PC || ADFIT_UNIT_MOBILE);

/** ads.txt 한 줄 (ca-pub-xxx → pub-xxx) */
export function adsTxtContent(): string | null {
  if (!ADSENSE_CLIENT.startsWith("ca-pub-")) return null;
  const pub = ADSENSE_CLIENT.replace("ca-pub-", "pub-");
  return `google.com, ${pub}, DIRECT, f08c47fec0942fa0`;
}
