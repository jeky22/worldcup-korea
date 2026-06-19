import type { ThirdPlaceRow } from "@/lib/scenario/third-place";
import type { GroupId } from "@/lib/types";
import { KOREA } from "@/lib/teams";
import { TeamLabel } from "./ui";

export function ThirdPlaceTable({
  rows,
  highlightGroup,
}: {
  rows: ThirdPlaceRow[];
  highlightGroup?: GroupId;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium text-muted">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">조 3위 팀</th>
            <th className="py-2 px-1 text-center font-medium tnum">경기</th>
            <th className="py-2 px-1 text-center font-medium tnum">승점</th>
            <th className="py-2 px-1 text-center font-medium tnum">득실</th>
            <th className="py-2 px-1 text-center font-medium tnum">득점</th>
            <th className="py-2 pl-1 text-right font-medium">진출</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isKorea = r.team === KOREA;
            const isHi = highlightGroup && r.group === highlightGroup;
            return (
              <tr
                key={r.group}
                className={`border-b transition-colors last:border-0 ${
                  isKorea || isHi ? "bg-surface" : "hover:bg-surface"
                } ${r.rank === 8 ? "border-b-2 border-b-warning/40" : ""}`}
              >
                <td className="py-2.5 pr-2">
                  <span
                    className={`inline-grid size-5 place-items-center rounded text-xs font-semibold tnum ${
                      r.qualifies
                        ? "bg-success-soft text-success"
                        : "text-muted"
                    }`}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="py-2.5 pr-2">
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted">{r.group}조</span>
                    <TeamLabel name={r.team} link />
                  </span>
                </td>
                <td className="px-1 text-center tnum text-muted">{r.played}</td>
                <td className="px-1 text-center font-semibold tnum">{r.points}</td>
                <td className="px-1 text-center tnum">
                  {r.gd > 0 ? `+${r.gd}` : r.gd}
                </td>
                <td className="px-1 text-center tnum text-muted">{r.gf}</td>
                <td className="py-2.5 pl-1 text-right">
                  {r.qualifies ? (
                    <span className="text-xs font-medium text-success">✓ 진출권</span>
                  ) : (
                    <span className="text-xs text-muted">탈락권</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        12개 조 3위 중 상위 8팀이 32강 진출. 경기가 진행 중이면 현재 시점 기준이며,
        페어플레이(경고·퇴장) 점수는 데이터 부재로 제외했습니다.
      </p>
    </div>
  );
}
