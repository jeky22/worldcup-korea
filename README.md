# 월드컵 2026 허브

2026 FIFA 월드컵 **실데이터** 기반 정보 사이트. 더미 데이터를 쓰지 않습니다.

세 가지 핵심 가치:

1. **경기** — 일정·결과·경기장을 한국시간 기준으로 한눈에
2. **팀·선수** — 출전 48팀의 명단(포지션·소속·A매치·득점)과 기록
3. **진출 시나리오** — 남은 경기의 모든 스코어 조합을 FIFA 2026 순위 규정대로 전수 계산한 "경우의 수"

## 기술 스택

- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- 폰트: Pretendard(본문) · JetBrains Mono(숫자)

## 데이터 소스

| 데이터 | 소스 | 비고 |
| --- | --- | --- |
| 경기 일정·결과 | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) | 1시간 캐시 + 로컬 스냅샷 폴백 |
| 순위·타이브레이커 | 자체 계산 | FIFA 2026 규정 (h2h → 득실 → 다득점 → FIFA랭킹) |
| 진출 경우의 수 | 자체 계산 | 스코어라인 전수 열거 |
| 선수 명단 | Wikipedia: 2026 FIFA World Cup squads | `npm run sync`로 갱신 |

> 페어플레이(경고·퇴장) 타이브레이커와 선수 연봉·시장가치는 신뢰할 수 있는 무료 데이터가 없어 현재 제외했습니다.

## 실행

```bash
npm install
npm run sync   # openfootball + 위키 스쿼드를 data/cache 에 스냅샷
npm run dev    # http://localhost:3000
```

런타임에는 openfootball에서 직접 fetch(1시간 재검증)하고, 실패 시 `data/cache`의 스냅샷으로 폴백합니다. 두 소스가 모두 없으면 임시 데이터로 채우지 않고 오류 상태를 정직하게 표시합니다.

## 구조

```
src/
  lib/
    teams.ts            48팀 참조 데이터(코드·국기·FIFA랭킹)
    normalize.ts        openfootball → 도메인 모델 정규화
    data.ts             경기 데이터 로드(fetch + 캐시 폴백)
    standings.ts        순위 + FIFA 타이브레이커
    squads.ts           스쿼드 캐시 로드
    scenario/
      engine.ts         조별 경우의 수 전수 계산 + 분기 요약
      third-place.ts    조 3위 와일드카드 경쟁
  app/                  홈 / 경기 / 시나리오 / 팀
scripts/
  sync.ts               실데이터 스냅샷 생성
```
