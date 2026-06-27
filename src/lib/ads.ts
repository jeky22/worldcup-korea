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

/** 푸시/팝 광고 서비스워커(3nbf4.com) 사용 여부.
 *  애드센스·애드핏 심사 통과 시 NEXT_PUBLIC_PUSH_AD=off 로 끄면 된다. */
export const PUSH_AD_ENABLED =
  (process.env.NEXT_PUBLIC_PUSH_AD ?? "on").toLowerCase() !== "off";

/** ads.txt 한 줄 (ca-pub-xxx → pub-xxx) */
export function adsTxtContent(): string | null {
  if (!ADSENSE_CLIENT.startsWith("ca-pub-")) return null;
  const pub = ADSENSE_CLIENT.replace("ca-pub-", "pub-");
  return `google.com, ${pub}, DIRECT, f08c47fec0942fa0`;
}
