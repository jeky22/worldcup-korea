/** 사이트 공통 설정 — SEO·OG·sitemap에서 공유 */

export const SITE_NAME = "월드컵 경우의수";
export const SITE_SHORT_NAME = "월드컵 경우의수";

export const SITE_DESCRIPTION =
  "월드컵 경우의수 — 2026 FIFA 월드컵 진출 경우의 수 계산과 대회 기록 아카이브. 아시안컵·올림픽 등 대한민국 대표팀의 다음 대회 일정까지 한곳에서.";

export const SITE_KEYWORDS = [
  "월드컵 경우의수",
  "월드컵 경우의수 사이트",
  "월드컵 진출 경우의수",
  "월드컵 조별리그 경우의수",
  "한국 월드컵 경우의수",
  "대한민국 32강 경우의수",
  "2026 월드컵",
  "FIFA 월드컵",
  "월드컵 시나리오",
  "월드컵 순위",
  "월드컵 대진표",
  "아시안컵 일정",
  "2027 아시안컵",
  "올림픽 축구",
  "2030 월드컵",
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

/** 문의 이메일 — 비워두면 문의 안내가 노출되지 않음 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

/** 히어로 배경 영상 (public/hero/hero-bg.mp4) */
export const HERO_VIDEO = "/hero/hero-bg.mp4";

/** 사이트 로고 (public/logo/) */
export const LOGO = "/logo/logo-56.png";
export const LOGO_OG = "/logo/og-image.png";
