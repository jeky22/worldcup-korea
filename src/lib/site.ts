/** 사이트 공통 설정 — SEO·OG·sitemap에서 공유 */

export const SITE_NAME = "월드컵 2026 허브";
export const SITE_SHORT_NAME = "월드컵 허브";

export const SITE_DESCRIPTION =
  "2026 FIFA 월드컵 북중미 대회 실데이터 기반 경기 일정·결과, 48개국 팀·선수 명단, 조별리그 순위, 대한민국 32강 진출 경우의 수와 토너먼트 대진표.";

export const SITE_KEYWORDS = [
  "2026 월드컵",
  "FIFA 월드컵",
  "북중미 월드컵",
  "월드컵 일정",
  "월드컵 결과",
  "월드컵 순위",
  "월드컵 대진표",
  "대한민국 월드컵",
  "한국 월드컵",
  "32강 진출",
  "조별리그",
  "월드컵 시나리오",
  "월드컵 명단",
  "월드컵 하이라이트",
];

/** 프로덕션 도메인 — Vercel 환경변수 미설정 시 fallback */
const PRODUCTION_URL = "https://www.경우의수.kr";

/** 배포 URL — Vercel에서 `NEXT_PUBLIC_SITE_URL=https://www.경우의수.kr` 설정 권장 */
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${p}`;
}

export function isIndexable(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.NEXT_PUBLIC_NOINDEX === "1") return false;
  return true;
}
