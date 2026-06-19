import type { SquadPlayer } from "@/lib/squads";

const POS_LABEL: Record<string, string> = {
  GK: "골키퍼",
  DF: "수비수",
  MF: "미드필더",
  FW: "공격수",
};
const POS_GROUPS = ["GK", "DF", "MF", "FW"];

export function SquadTable({ players }: { players: SquadPlayer[] }) {
  const byPos = POS_GROUPS.map((p) => ({
    pos: p,
    list: players.filter((pl) => pl.pos === p),
  })).filter((g) => g.list.length > 0);

  // 분류되지 않은 포지션
  const others = players.filter((pl) => !POS_GROUPS.includes(pl.pos));
  if (others.length) byPos.push({ pos: "기타", list: others });

  return (
    <div className="flex flex-col gap-5">
      {byPos.map((grp) => (
        <div key={grp.pos}>
          <h3 className="mb-1.5 text-sm font-semibold">
            {POS_LABEL[grp.pos] ?? grp.pos}
            <span className="ml-1.5 text-xs font-normal text-muted">
              {grp.list.length}명
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted">
                  <th className="py-1.5 pr-2 text-center font-medium tnum">번호</th>
                  <th className="py-1.5 pr-2 font-medium">선수</th>
                  <th className="py-1.5 px-1 text-center font-medium tnum">나이</th>
                  <th className="hidden py-1.5 px-1 text-center font-medium tnum sm:table-cell">A매치</th>
                  <th className="hidden py-1.5 px-1 text-center font-medium tnum sm:table-cell">득점</th>
                  <th className="py-1.5 pl-1 font-medium">소속 클럽</th>
                </tr>
              </thead>
              <tbody>
                {grp.list.map((p, i) => (
                  <tr key={`${p.name}-${i}`} className="border-b transition-colors last:border-0 hover:bg-surface">
                    <td className="py-2 pr-2 text-center tnum text-muted">{p.no ?? "-"}</td>
                    <td className="py-2 pr-2 font-medium">{p.name}</td>
                    <td className="px-1 text-center tnum text-muted">{p.age ?? "-"}</td>
                    <td className="hidden px-1 text-center tnum text-muted sm:table-cell">{p.caps ?? "-"}</td>
                    <td className="hidden px-1 text-center tnum text-muted sm:table-cell">{p.goals ?? "-"}</td>
                    <td className="py-2 pl-1 text-muted">{p.club}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
