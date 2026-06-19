import { getDataset } from "@/lib/data";
import { KOREA } from "@/lib/teams";
import { kstStamp } from "@/lib/format";
import { SourceFooter } from "@/components/ui";
import { MatchesBrowser } from "@/components/matches-browser";
import { DataError } from "@/components/data-error";
import { JsonLd } from "@/components/json-ld";
import { AdBanner } from "@/components/ads/ad-unit";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "경기 일정·결과",
  description:
    "2026 FIFA 월드컵 전 경기 일정, 킥오프 시간(KST), 경기장, 스코어와 하이라이트 링크. 조별리그·32강·토너먼트 전체 일정.",
  path: "/matches",
  keywords: ["월드컵 일정", "월드컵 결과", "월드컵 스코어", "2026 월드컵 경기"],
});

export default async function MatchesPage() {
  let data;
  try {
    data = await getDataset();
  } catch (e) {
    return <DataError message={(e as Error).message} />;
  }

  const stamp = kstStamp(data.fetchedAt);

  return (
    <div className="flex flex-col gap-4">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "경기 일정·결과", path: "/matches" },
        ])}
      />
      <header>
        <h1 className="text-2xl font-bold tracking-tight">경기 일정 · 결과</h1>
        <p className="mt-1 text-sm text-muted">
          전체 104경기 · 시간은 한국시간(KST) 기준
        </p>
      </header>

      <AdBanner />

      <MatchesBrowser matches={data.matches} korea={KOREA} />

      <SourceFooter sources={["openfootball"]} fetchedAt={stamp} />
    </div>
  );
}
