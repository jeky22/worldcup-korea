import { getDataset } from "@/lib/data";
import { projectBracket, koreaKnockout } from "@/lib/bracket";
import { kstStamp } from "@/lib/format";
import { KOREA } from "@/lib/teams";
import { SectionHeading, SourceFooter } from "@/components/ui";
import { BracketView } from "@/components/bracket-view";
import { KoreaKnockout } from "@/components/korea-knockout";
import { DataError } from "@/components/data-error";
import { Reveal } from "@/components/motion";
import { JsonLd } from "@/components/json-ld";
import { AdBanner } from "@/components/ads/ad-unit";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "토너먼트 대진표",
  description:
    "2026 FIFA 월드컵 32강부터 결승까지 토너먼트 대진표. Annex C 3위 팀 배정 규정 반영, 대한민국 32강 상대 분석과 우승 시나리오 시뮬레이션.",
  path: "/bracket",
  keywords: ["월드컵 대진표", "32강 대진", "토너먼트", "월드컵 우승 시나리오"],
});

export default async function BracketPage() {
  let data;
  try {
    data = await getDataset();
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }

  const bracket = projectBracket(data.matches);
  const koBlocks = koreaKnockout(data.matches);
  const koreaDecided = !data.matches.some(
    (m) => (m.team1 === KOREA || m.team2 === KOREA) && !m.score,
  );
  const stamp = kstStamp(data.fetchedAt);

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "토너먼트 대진표", path: "/bracket" },
        ])}
      />
      <header>
        <h1 className="text-2xl font-bold tracking-tight">토너먼트 대진표</h1>
        <p className="mt-1 text-sm text-muted">
          본선(32강~결승) 대진과 한국 32강 상대 분석
        </p>
      </header>

      <AdBanner />

      {/* 한국 32강 상대 (강조) */}
      <Reveal as="section" delay={40}>
        <SectionHeading>한국 32강 상대 시뮬레이션</SectionHeading>
        <KoreaKnockout blocks={koBlocks} decided={koreaDecided} />
      </Reveal>

      {/* 대진표 (확정 / 예상) */}
      <Reveal as="section" delay={40}>
        <SectionHeading>대진표</SectionHeading>
        <BracketView bracket={bracket} />
        <p className="mt-3 text-xs text-muted">
          <span className="font-medium text-ink">확정</span>: 조별리그가 끝나 자리가 확정된
          진출팀.{" "}
          <span className="font-medium text-ink">예상</span>: 현재 순위 기준 32강 대진.{" "}
          <span className="font-medium text-ink">시뮬레이션</span>: FIFA 랭킹이 높은 팀이
          올라간다고 가정한 32강~결승 예측. 3위 와일드카드 배정은 FIFA Annex C 규정을
          따릅니다 (실제 예측 아님).
        </p>
      </Reveal>

      <SourceFooter
        sources={["openfootball", "FIFA 규정·랭킹 기반 자체 계산"]}
        fetchedAt={stamp}
      />
    </div>
  );
}
