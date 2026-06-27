import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 홈 */
export function IconHome(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

/** 경기 (일정) */
export function IconCalendar(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <circle cx="8.5" cy="14" r="0.5" fill="currentColor" />
      <circle cx="12" cy="14" r="0.5" fill="currentColor" />
      <circle cx="15.5" cy="14" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** 시나리오 (경우의 수 / 분기) */
export function IconScenario(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.2 10.8 15.8 6.8M8.2 13.2 15.8 17.2" />
    </svg>
  );
}

/** 대진표 (토너먼트) */
export function IconBracket(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5h4v5h4M4 19h4v-5" />
      <path d="M12 12h4M16 8h4M16 12V8M16 16h4M16 12v4" />
    </svg>
  );
}

/** 팀 */
export function IconTeam(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.5M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
    </svg>
  );
}

/** 재생 (영상) */
export function IconPlay(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 뉴스 */
export function IconNews(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5.5h12a1 1 0 0 1 1 1V18a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z" />
      <path d="M17 9h2a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2" />
      <path d="M7 9h6M7 12.5h6M7 16h4" />
    </svg>
  );
}

/** 외부 링크 */
export function IconExternal(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M14 5h5v5M19 5l-7 7" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/** 후원 (하트) */
export function IconHeart(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 20.5 4.2 12.8a4.6 4.6 0 0 1 6.5-6.5l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 6.5z" />
    </svg>
  );
}

/** 라이브 중계 (방송) */
export function IconBroadcast(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 16.5a6 6 0 0 0 0-9" />
      <path d="M5 5a9 9 0 0 0 0 14M19 19a9 9 0 0 0 0-14" />
    </svg>
  );
}
