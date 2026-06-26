import type { GroupId, Team } from "./types";

/**
 * 48-team reference for the 2026 FIFA World Cup.
 * Names match the openfootball dataset (canonical key).
 * FIFA ranks are the Nov 2025 basis used for the draw (approximate; source: openfootball-keyed rankings).
 * This is static reference data (country codes, flags, Korean names, ranks) — not match results.
 */
export const TEAMS: Team[] = [
  // Group A
  { name: "Mexico", code: "MEX", a2: "mx", ko: "멕시코", flag: "🇲🇽", group: "A", fifaRank: 17, fifaPoints: 1675.75 },
  { name: "South Africa", code: "RSA", a2: "za", ko: "남아프리카공화국", flag: "🇿🇦", group: "A", fifaRank: 57, fifaPoints: 1426.74 },
  { name: "South Korea", code: "KOR", a2: "kr", ko: "대한민국", flag: "🇰🇷", group: "A", fifaRank: 23, fifaPoints: 1599.45 },
  { name: "Czech Republic", code: "CZE", a2: "cz", ko: "체코", flag: "🇨🇿", group: "A", fifaRank: 43, fifaPoints: 1487.00 },
  // Group B
  { name: "Canada", code: "CAN", a2: "ca", ko: "캐나다", flag: "🇨🇦", group: "B", fifaRank: 30, fifaPoints: 1559.15 },
  { name: "Bosnia & Herzegovina", code: "BIH", a2: "ba", ko: "보스니아 헤르체고비나", flag: "🇧🇦", group: "B", fifaRank: 74, fifaPoints: 1362.37 },
  { name: "Qatar", code: "QAT", a2: "qa", ko: "카타르", flag: "🇶🇦", group: "B", fifaRank: 36, fifaPoints: 1453.74 },
  { name: "Switzerland", code: "SUI", a2: "ch", ko: "스위스", flag: "🇨🇭", group: "B", fifaRank: 19, fifaPoints: 1654.69 },
  // Group C
  { name: "Brazil", code: "BRA", a2: "br", ko: "브라질", flag: "🇧🇷", group: "C", fifaRank: 5, fifaPoints: 1760.46 },
  { name: "Morocco", code: "MAR", a2: "ma", ko: "모로코", flag: "🇲🇦", group: "C", fifaRank: 11, fifaPoints: 1713.12 },
  { name: "Haiti", code: "HAI", a2: "ht", ko: "아이티", flag: "🇭🇹", group: "C", fifaRank: 86, fifaPoints: 1294.49 },
  { name: "Scotland", code: "SCO", a2: "gb-sct", ko: "스코틀랜드", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", fifaRank: 39, fifaPoints: 1506.77 },
  // Group D
  { name: "USA", code: "USA", a2: "us", ko: "미국", flag: "🇺🇸", group: "D", fifaRank: 16, fifaPoints: 1681.88 },
  { name: "Paraguay", code: "PAR", a2: "py", ko: "파라과이", flag: "🇵🇾", group: "D", fifaRank: 45, fifaPoints: 1501.50 },
  { name: "Australia", code: "AUS", a2: "au", ko: "호주", flag: "🇦🇺", group: "D", fifaRank: 24, fifaPoints: 1574.01 },
  { name: "Turkey", code: "TUR", a2: "tr", ko: "튀르키예", flag: "🇹🇷", group: "D", fifaRank: 26, fifaPoints: 1582.69 },
  // Group E
  { name: "Germany", code: "GER", a2: "de", ko: "독일", flag: "🇩🇪", group: "E", fifaRank: 9, fifaPoints: 1724.15 },
  { name: "Curaçao", code: "CUW", a2: "cw", ko: "쿠라소", flag: "🇨🇼", group: "E", fifaRank: 90, fifaPoints: 1294.49 },
  { name: "Ivory Coast", code: "CIV", a2: "ci", ko: "코트디부아르", flag: "🇨🇮", group: "E", fifaRank: 40, fifaPoints: 1489.59 },
  { name: "Ecuador", code: "ECU", a2: "ec", ko: "에콰도르", flag: "🇪🇨", group: "E", fifaRank: 23, fifaPoints: 1591.73 },
  // Group F
  { name: "Netherlands", code: "NED", a2: "nl", ko: "네덜란드", flag: "🇳🇱", group: "F", fifaRank: 7, fifaPoints: 1756.27 },
  { name: "Japan", code: "JPN", a2: "jp", ko: "일본", flag: "🇯🇵", group: "F", fifaRank: 17, fifaPoints: 1650.12 },
  { name: "Sweden", code: "SWE", a2: "se", ko: "스웨덴", flag: "🇸🇪", group: "F", fifaRank: 35, fifaPoints: 1487.13 },
  { name: "Tunisia", code: "TUN", a2: "tn", ko: "튀니지", flag: "🇹🇳", group: "F", fifaRank: 41, fifaPoints: 1497.13 },
  // Group G
  { name: "Belgium", code: "BEL", a2: "be", ko: "벨기에", flag: "🇧🇪", group: "G", fifaRank: 8, fifaPoints: 1730.71 },
  { name: "Egypt", code: "EGY", a2: "eg", ko: "이집트", flag: "🇪🇬", group: "G", fifaRank: 32, fifaPoints: 1520.68 },
  { name: "Iran", code: "IRN", a2: "ir", ko: "이란", flag: "🇮🇷", group: "G", fifaRank: 20, fifaPoints: 1617.02 },
  { name: "New Zealand", code: "NZL", a2: "nz", ko: "뉴질랜드", flag: "🇳🇿", group: "G", fifaRank: 89, fifaPoints: 1279.25 },
  // Group H
  { name: "Spain", code: "ESP", a2: "es", ko: "스페인", flag: "🇪🇸", group: "H", fifaRank: 2, fifaPoints: 1877.18 },
  { name: "Cape Verde", code: "CPV", a2: "cv", ko: "카보베르데", flag: "🇨🇻", group: "H", fifaRank: 70, fifaPoints: 1367.95 },
  { name: "Saudi Arabia", code: "KSA", a2: "sa", ko: "사우디아라비아", flag: "🇸🇦", group: "H", fifaRank: 58, fifaPoints: 1428.74 },
  { name: "Uruguay", code: "URU", a2: "uy", ko: "우루과이", flag: "🇺🇾", group: "H", fifaRank: 15, fifaPoints: 1672.62 },
  // Group I
  { name: "France", code: "FRA", a2: "fr", ko: "프랑스", flag: "🇫🇷", group: "I", fifaRank: 3, fifaPoints: 1870.00 },
  { name: "Senegal", code: "SEN", a2: "sn", ko: "세네갈", flag: "🇸🇳", group: "I", fifaRank: 18, fifaPoints: 1648.07 },
  { name: "Iraq", code: "IRQ", a2: "iq", ko: "이라크", flag: "🇮🇶", group: "I", fifaRank: 58, fifaPoints: 1438.92 },
  { name: "Norway", code: "NOR", a2: "no", ko: "노르웨이", flag: "🇳🇴", group: "I", fifaRank: 33, fifaPoints: 1533.14 },
  // Group J
  { name: "Argentina", code: "ARG", a2: "ar", ko: "아르헨티나", flag: "🇦🇷", group: "J", fifaRank: 1, fifaPoints: 1873.33 },
  { name: "Algeria", code: "ALG", a2: "dz", ko: "알제리", flag: "🇩🇿", group: "J", fifaRank: 38, fifaPoints: 1516.37 },
  { name: "Austria", code: "AUT", a2: "at", ko: "오스트리아", flag: "🇦🇹", group: "J", fifaRank: 22, fifaPoints: 1585.51 },
  { name: "Jordan", code: "JOR", a2: "jo", ko: "요르단", flag: "🇯🇴", group: "J", fifaRank: 62, fifaPoints: 1377.64 },
  // Group K
  { name: "Portugal", code: "POR", a2: "pt", ko: "포르투갈", flag: "🇵🇹", group: "K", fifaRank: 6, fifaPoints: 1760.38 },
  { name: "DR Congo", code: "COD", a2: "cd", ko: "콩고민주공화국", flag: "🇨🇩", group: "K", fifaRank: 56, fifaPoints: 1442.50 },
  { name: "Uzbekistan", code: "UZB", a2: "uz", ko: "우즈베키스탄", flag: "🇺🇿", group: "K", fifaRank: 53, fifaPoints: 1462.03 },
  { name: "Colombia", code: "COL", a2: "co", ko: "콜롬비아", flag: "🇨🇴", group: "K", fifaRank: 13, fifaPoints: 1701.30 },
  // Group L
  { name: "England", code: "ENG", a2: "gb-eng", ko: "잉글랜드", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", fifaRank: 4, fifaPoints: 1834.12 },
  { name: "Croatia", code: "CRO", a2: "hr", ko: "크로아티아", flag: "🇭🇷", group: "L", fifaRank: 10, fifaPoints: 1716.88 },
  { name: "Ghana", code: "GHA", a2: "gh", ko: "가나", flag: "🇬🇭", group: "L", fifaRank: 73, fifaPoints: 1351.09 },
  { name: "Panama", code: "PAN", a2: "pa", ko: "파나마", flag: "🇵🇦", group: "L", fifaRank: 31, fifaPoints: 1540.43 },
];

const BY_NAME = new Map(TEAMS.map((t) => [t.name, t]));
const BY_CODE = new Map(TEAMS.map((t) => [t.code, t]));

export function getTeam(name: string): Team | undefined {
  return BY_NAME.get(name);
}

export function getTeamByCode(code: string): Team | undefined {
  return BY_CODE.get(code.toUpperCase());
}

export function teamKo(name: string): string {
  return BY_NAME.get(name)?.ko ?? name;
}

export function teamFlag(name: string): string {
  return BY_NAME.get(name)?.flag ?? "🏳️";
}

/** flagcdn 국기 이미지 URL (높이 기준). 실제 국기 렌더용. */
export function teamFlagUrl(name: string, h: 20 | 40 | 60 = 40): string | null {
  const a2 = BY_NAME.get(name)?.a2;
  if (!a2) return null;
  return `https://flagcdn.com/h${h}/${a2}.png`;
}

export function teamCode(name: string): string {
  return BY_NAME.get(name)?.code ?? name.slice(0, 3).toUpperCase();
}

export function fifaRank(name: string): number {
  return BY_NAME.get(name)?.fifaRank ?? 999;
}

/** FIFA 랭킹 포인트 (Elo 확률 모델 입력). 미상 팀은 약체 기본값. */
export function fifaPoints(name: string): number {
  return BY_NAME.get(name)?.fifaPoints ?? 1200;
}

export const GROUP_IDS: GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export function teamsInGroup(group: GroupId): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

/** 한국 팀 식별 */
export const KOREA = "South Korea";
