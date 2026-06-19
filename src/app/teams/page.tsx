import Link from "next/link";
import { GROUP_IDS, teamsInGroup, KOREA } from "@/lib/teams";
import { Flag } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "출전국 48팀",
  description:
    "2026 FIFA 월드컵 북중미 대회 출전 48개국 전체 목록. 조별 편성, FIFA 랭킹, 각 팀 명단·일정·조별리그 기록.",
  path: "/teams",
  keywords: ["월드컵 출전국", "48팀", "조별 편성", "FIFA 랭킹", "월드컵 명단"],
});

export default function TeamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "출전국 48팀", path: "/teams" },
        ])}
      />
      <header>
        <h1 className="text-2xl font-bold tracking-tight">출전국 48팀</h1>
        <p className="mt-1 text-sm text-muted">
          팀을 선택하면 명단·일정·기록을 볼 수 있습니다.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {GROUP_IDS.map((g, gi) => (
          <Reveal as="section" key={g} delay={Math.min(gi * 30, 200)}>
            <h2 className="mb-2 text-sm font-semibold text-muted">{g}조</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {teamsInGroup(g).map((t) => (
                <Link
                  key={t.code}
                  href={`/teams/${t.code}`}
                  className={`lift group flex items-center gap-2.5 rounded-xl border bg-[var(--color-card)] p-3 ${
                    t.name === KOREA ? "border-primary/40 bg-surface" : ""
                  }`}
                >
                  <span className="transition-transform group-hover:scale-110">
                    <Flag name={t.name} size={24} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-medium ${
                        t.name === KOREA ? "text-primary" : ""
                      }`}
                    >
                      {t.ko}
                    </span>
                    <span className="block text-xs text-muted tnum">
                      FIFA {t.fifaRank}위
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
