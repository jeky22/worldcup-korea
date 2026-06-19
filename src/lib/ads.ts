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

/** ads.txt 한 줄 (ca-pub-xxx → pub-xxx) */
export function adsTxtContent(): string | null {
  if (!ADSENSE_CLIENT.startsWith("ca-pub-")) return null;
  const pub = ADSENSE_CLIENT.replace("ca-pub-", "pub-");
  return `google.com, ${pub}, DIRECT, f08c47fec0942fa0`;
}
