import Link from "next/link";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "사이트 소개",
  description:
    "월드컵 경우의수는 2026 FIFA 월드컵의 진출 경우의 수를 FIFA 규정대로 계산해 보여주는 비공식 팬 사이트입니다. 데이터 출처와 계산 방식을 소개합니다.",
  path: "/about",
  keywords: ["월드컵 경우의수 소개", "데이터 출처", "계산 방식"],
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "사이트 소개", path: "/about" },
        ])}
      />

      <h1 className="text-2xl font-bold tracking-tight">사이트 소개</h1>

      <section className="mt-6 space-y-3 leading-relaxed text-ink/90">
        <p>
          <strong>월드컵 경우의수</strong>는 2026 FIFA 월드컵 조별리그의 진출
          경우의 수를 계산해 보여주는 비공식 팬 사이트입니다. 남은 경기의 모든
          스코어 조합을 FIFA 2026 순위 규정(승점 → 승자승 → 골득실 → 다득점 →
          FIFA 랭킹)에 따라 전수 계산하고, 대한민국 기준 32강 진출 조건을
          한 화면에 정리하는 것이 목표였습니다.
        </p>
        <p>
          대회 기간(2026년 6~7월)에는 경기 결과가 들어올 때마다 순위와
          시나리오를 다시 계산해 제공했으며, 대회가 끝난 지금은 조별리그
          순위·대진표·팀 기록을 담은 아카이브로 운영하면서 아시안컵·올림픽 등{" "}
          <Link href="/next" className="text-accent hover:underline">
            대표팀의 다음 대회
          </Link>{" "}
          소식을 정리하고 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">데이터 출처</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted">
          <li>
            경기 일정·결과:{" "}
            <a
              href="https://github.com/openfootball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              openfootball
            </a>{" "}
            공개 데이터
          </li>
          <li>팀·선수 정보: Wikipedia(MediaWiki API), Transfermarkt(연봉은 비공식 추정치)</li>
          <li>뉴스: 연합뉴스·동아일보 RSS</li>
          <li>하이라이트 영상: FIFA 공식 YouTube 채널</li>
          <li>순위 계산·진출 시나리오·확률 모델: 자체 계산</li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          모든 데이터 블록에는 출처와 갱신 시각을 함께 표기합니다. 동기화에
          실패한 데이터는 가짜 값으로 채우지 않고 표시하지 않습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">계산 방식</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          조별리그 남은 경기의 스코어 조합을 전수 탐색해 각 팀의 직행·3위
          와일드카드·탈락 비율을 계산합니다. 아직 열리지 않은 타 조 경기는
          FIFA 랭킹 포인트 기반 Elo 모델로 승·무·패 확률을 추정해 반영하며,
          3위 와일드카드 순위는 FIFA 2026 규정의 타이브레이커를 그대로
          적용합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">운영자</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          개인 개발자가 혼자 만들고 운영하는 사이트입니다. FIFA 및 각국
          축구협회와 무관한 비공식 사이트이며, 모든 상표와 로고의 권리는 각
          소유자에게 있습니다.
        </p>
        {CONTACT_EMAIL && (
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            문의·제보·오류 신고:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        )}
      </section>

      <p className="mt-8 text-sm text-muted">
        개인정보 처리에 대해서는{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          개인정보처리방침
        </Link>
        을 참고해주세요.
      </p>
    </div>
  );
}
