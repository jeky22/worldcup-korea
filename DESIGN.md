---
name: World Cup 2026 Hub
description: 실데이터 기반 월드컵 정보·한국 진출 시나리오 도구
colors:
  bg: "#ffffff"
  surface: "#f5f4f5"
  surface-raised: "#ebeaeb"
  ink: "#1a1517"
  muted: "#5c5658"
  border: "#e2dfe0"
  primary: "#c41230"
  primary-deep: "#9e0e26"
  accent: "#1a4d8c"
  accent-soft: "#e8f0fa"
  success: "#0d6b3f"
  success-soft: "#e6f5ee"
  warning: "#9a6700"
  warning-soft: "#fef8e6"
  danger: "#9e0e26"
  danger-soft: "#fce8ec"
typography:
  display:
    fontFamily: "\"Pretendard Variable\", Pretendard, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "\"Pretendard Variable\", Pretendard, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "\"Pretendard Variable\", Pretendard, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "\"Pretendard Variable\", Pretendard, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Pretendard Variable\", Pretendard, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  data:
    fontFamily: "\"JetBrains Mono\", ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  status-advance:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-conditional:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-eliminated:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: World Cup 2026 Hub

## Overview

**Creative North Star: "The Curiosity Engine"**

경기장 피날레 직전, 관중석에서 스마트폰을 꺼내는 순간 — 화면은 순백, 숫자가 먼저 말하고, 태극기 레드는 한국과 진출 상태에만 쓰인다. FotMob의 스코어 명료함과 Linear의 도구적 정밀함을 합치되, SaaS 대시보드·뉴스 포털·베팅 UI 느낌은 배제한다.

사용자가 궁금해하는 것만 앞에 둔다. 48팀 전체를 한 화면에 쏟지 않고, A조 순위·다음 경기·핵심 시나리오 한 줄이 최상단에 온다. Choreographed 모션은 스코어 갱신·순위 변화·섹션 진입에만 쓰고, 탐색을 방해하지 않는다.

**Key Characteristics:**

- 궁금증 우선 레이아웃 — "지금 알고 싶은 한 가지"가 항상 첫 시선
- 표·숫자 중심 — 카드 그리드 대신 밀도 있는 데이터 행(row)과 순위표
- 모바일 경기 중 사용 — 44px 이상 터치 타깃, 하단 네비 고정
- 출처·갱신 시각 항상 노출
- 진출 상태는 색+아이콘+라벨 삼중 인코딩

## Colors

Restrained 전략: 순백 배경 위 primary(Korea Red) ≤10%. 따뜻함은 primary가 담당하고 surface는 중성에 가깝다.

### Primary

- **Korea Red** (#c41230 / oklch(0.52 0.19 355)): 한국 팀 강조, primary CTA, 진출 확정 pill. 채움 위 텍스트는 항상 흰색.
- **Korea Red Deep** (#9e0e26 / oklch(0.44 0.19 355)): primary hover·active.

### Secondary

*(omit — 단일 accent 전략)*

### Tertiary

*(omit)*

### Neutral

- **Pure White** (#ffffff / oklch(1.000 0.000 0)): 페이지 배경. 크림·베이지 금지.
- **Surface** (#f5f4f5 / oklch(0.97 0.004 355)): 순위표·패널 배경.
- **Surface Raised** (#ebeaeb / oklch(0.93 0.006 355)): hover 행, 선택 상태.
- **Ink** (#1a1517 / oklch(0.20 0.012 355)): 본문·팀명. bg 대비 ≥12:1.
- **Muted** (#5c5658 / oklch(0.42 0.008 355)): 출처, 타임스탬프, 보조 라벨. bg 대비 ≥5.5:1.
- **Border** (#e2dfe0 / oklch(0.90 0.006 355)): 표 구분선, 입력 테두리.

### Accent

- **Pitch Blue** (#1a4d8c / oklch(0.38 0.12 250)): 링크, 정보 배지, 중립 데이터 강조. primary와 hue·lightness 모두 구분.
- **Pitch Blue Soft** (#e8f0fa / oklch(0.95 0.025 250)): 링크 hover 배경, 정보 callout.

### Semantic

- **Advance Green** (#0d6b3f) + soft (#e6f5ee): 16강 진출 확정
- **Conditional Amber** (#9a6700) + soft (#fef8e6): 조건부·3위 경쟁
- **Eliminated Red** (#9e0e26) + soft (#fce8ec): 탈락·불가

### Named Rules

**The No-Cream Rule.** OKLCH L 0.84–0.97, C < 0.06, hue 40–100 웜 뉴트럴 배경 금지. `--paper`, `--cream`, `--sand` 토큰명 금지.

**The White-On-Red Rule.** primary·success·danger 채움(L 0.42–0.78, C ≥ 0.08) 위 텍스트는 항상 흰색.

**The Korea-Only Red Rule.** primary red는 한국 팀 행, 한국 관련 CTA, 진출 확정 상태에만. 전체 UI 장식용 red 남용 금지.

## Typography

**Display Font:** Pretendard Variable, Pretendard, system-ui, sans-serif
**Body Font:** 동일 패밀리
**Data Font:** JetBrains Mono, ui-monospace, monospace

**Character:** 기술적·정밀. 제품 UI 단일 sans. 스코어·승점·득실차·시나리오 숫자는 data(mono) 또는 `font-variant-numeric: tabular-nums`.

### Hierarchy

- **Display** (700, 1.75rem / 28px, lh 1.2): 페이지 타이틀만. fluid clamp 사용 금지.
- **Headline** (600, 1.25rem / 20px, lh 1.25): 섹션 제목, "Group A"
- **Title** (600, 1rem / 16px, lh 1.3): 경기 행 팀명
- **Body** (400, 0.9375rem / 15px, lh 1.6): 시나리오 설명. 최대 65ch.
- **Label** (500, 0.75rem / 12px, ls 0.02em): 표 헤더, 메타데이터
- **Data** (500, 0.875rem / 14px, mono): 스코어, 승점, 득실차

### Named Rules

**The Tabular Score Rule.** 모든 경기 숫자는 data 폰트 또는 tabular-nums. 열 정렬 흔들림 금지.

**The Fixed Scale Rule.** 제품 UI이므로 display에 fluid clamp 금지. 고정 rem 스케일(1.125 비율).

## Elevation

**The Flat-Data Rule.** 기본 평면. 깊이는 surface tonal layering으로. 그림자는 모달·드롭다운만.

### Shadow Vocabulary

- **lift** (`0 4px 16px oklch(0 0 0 / 0.10)`): `<dialog>`, popover, 모바일 시트
- **focus-ring** (`0 0 0 3px oklch(0.52 0.19 355 / 0.25)`): 키보드 포커스

### Named Rules

**The No-Card-Shadow Rule.** 순위표·경기 행에 ambient shadow 금지. hover는 background shift만.

## Components

### Buttons

- **Shape:** 8px radius, 12px 20px padding, 600 weight label
- **Primary:** Korea Red fill, white text. hover → primary-deep. focus → focus-ring.
- **Ghost:** transparent, ink text, surface hover. 보조 액션·탭 전환.

### Status Pills

- **Shape:** full radius, 4px 10px, label 12px 500
- **Advance:** success-soft bg + success text + ✓ 아이콘
- **Conditional:** warning-soft + warning text + ? 아이콘
- **Eliminated:** danger-soft + danger text + ✕ 아이콘
- 색상만으로 구분 금지 — 아이콘·한글 라벨 병행

### Standings Table

- **Structure:** `<table>` 시맨틱. 헤더 label 스타일, 숫자 열 data 폰트 우정렬.
- **Row:** 48px min-height. 한국 행은 surface 배경 + 좌측 3px primary bar(유일한 accent stripe 허용).
- **Hover:** surface-raised. 선택 없음.

### Match Row

- **Layout:** flex 1D — 시간 | 팀A data score 팀B | 경기장 muted
- **Live:** 스코어 숫자에 300ms ease-out-expo 색상 플래시(primary 200ms 후 복귀)
- **Upcoming:** score 자리에 "vs" muted

### Navigation

- **Desktop:** 상단 56px bar — 로고, 경기/시나리오/팀 링크
- **Mobile:** 하단 64px fixed tab bar — 홈·경기·시나리오·팀. safe-area-inset 반영
- **Active:** accent text + 2px bottom border(primary on Korea-related tab)

### Data Source Footer

- **Style:** label + muted, 각 섹션 하단
- **Content:** "출처: openfootball · 갱신: 2026-06-19 14:32 KST" 형식

## Do's and Don'ts

### Do:

- **Do** 화면 최상단에 Curiosity Block(한국 다음 경기 + A조 순위 + 핵심 시나리오 한 줄)을 배치한다.
- **Do** 모든 데이터 블록에 소스·갱신 시각을 표기한다.
- **Do** 스코어 갱신에 300ms `cubic-bezier(0.16, 1, 0.3, 1)` 전환을 쓴다.
- **Do** `prefers-reduced-motion: reduce`에서 transition-duration을 0.01ms로 대체한다.
- **Do** 진출 상태를 색상+아이콘+한글 라벨로 표현한다.
- **Do** 터치 타깃 최소 44×44px을 유지한다.

### Don't:

- **Don't** SaaS 대시보드처럼 보이게 한다 — 회색 카드 그리드, 히어로 메트릭, 아이콘+제목+설명 반복 카드.
- **Don't** 뉴스 포털처럼 광고 밀집·기사 나열형 레이아웃을 쓴다.
- **Don't** 게임/베팅 UI처럼 네온·과한 그라데이션·글래스모피즘을 쓴다.
- **Don't** AI 슬롭 — 크림/베이지 바디, 섹션마다 작은 대문자 eyebrow, 그라데이션 텍스트.
- **Don't** 48팀 데이터를 한 화면에 쏟아붓는다.
- **Don't** 더미·목업 데이터로 빈 화면을 채운다.
- **Don't** nested card(카드 안 카드)를 쓴다.
