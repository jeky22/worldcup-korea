import type { StandingRow } from "@/lib/types";
import { KOREA } from "@/lib/teams";
import { TeamLabel } from "./ui";

const CLINCH_LABEL: Record<string, { text: string; cls: string }> = {
  "advanced-clinched": {
    text: "진출 확정",
    cls: "bg-[var(--color-kor-red)] text-white",
  },
  "advance-possible": {
    text: "직행 가능",
    cls: "bg-[var(--color-kor-red-soft)] text-[var(--color-kor-red)]",
  },
  "third-clinched": {
    text: "조 3위 · 경쟁",
    cls: "bg-[var(--color-kor-gold-soft)] text-[var(--color-kor-gold)]",
  },
  "out-clinched": {
    text: "탈락 확정",
    cls: "bg-[var(--color-kor-ink)] text-white",
  },
  alive: {
    text: "경쟁 중",
    cls: "bg-[var(--color-kor-blue-soft)] text-[var(--color-kor-blue)]",
  },
};

export function StandingsTable({
  rows,
  highlightTop = 2,
  statusMap,
}: {
  rows: StandingRow[];
  /** 상위 N위까지 직행권 표시 (보통 2) */
  highlightTop?: number;
  /** 팀별 진출 상태 (있으면 확정/미확정 배지 표시) */
  statusMap?: Record<string, string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium text-muted">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">팀</th>
            <th className="py-2 px-1 text-center font-medium tnum">경기</th>
            <th className="py-2 px-1 text-center font-medium tnum">승</th>
            <th className="py-2 px-1 text-center font-medium tnum">무</th>
            <th className="py-2 px-1 text-center font-medium tnum">패</th>
            <th className="hidden py-2 px-1 text-center font-medium tnum sm:table-cell">득</th>
            <th className="hidden py-2 px-1 text-center font-medium tnum sm:table-cell">실</th>
            <th className="py-2 px-1 text-center font-medium tnum">득실</th>
            <th className="py-2 px-1 text-center font-medium tnum">승점</th>
            {statusMap ? <th className="py-2 pl-1 text-right font-medium">상태</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isKorea = r.team === KOREA;
            const advancing = r.rank <= highlightTop;
            const clinch = statusMap ? CLINCH_LABEL[statusMap[r.team]] : undefined;
            return (
              <tr
                key={r.team}
                className={`border-b transition-colors last:border-0 ${
                  isKorea ? "bg-surface" : "hover:bg-surface"
                }`}
              >
                <td className="py-2.5 pr-2">
                  <span
                    className={`inline-grid size-5 place-items-center rounded text-xs font-semibold tnum ${
                      advancing
                        ? "bg-primary text-[var(--color-on-primary)]"
                        : r.rank === 3
                          ? "bg-warning-soft text-warning"
                          : "text-muted"
                    }`}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="py-2.5 pr-2">
                  <TeamLabel name={r.team} link />
                </td>
                <td className="px-1 text-center tnum text-muted">{r.played}</td>
                <td className="px-1 text-center tnum">{r.win}</td>
                <td className="px-1 text-center tnum">{r.draw}</td>
                <td className="px-1 text-center tnum">{r.loss}</td>
                <td className="hidden px-1 text-center tnum text-muted sm:table-cell">{r.gf}</td>
                <td className="hidden px-1 text-center tnum text-muted sm:table-cell">{r.ga}</td>
                <td className="px-1 text-center tnum">
                  {r.gd > 0 ? `+${r.gd}` : r.gd}
                </td>
                <td className="px-1 text-center font-semibold tnum">{r.points}</td>
                {statusMap ? (
                  <td className="pl-1 text-right">
                    {clinch ? (
                      <span
                        className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold ${clinch.cls}`}
                      >
                        {clinch.text}
                      </span>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
