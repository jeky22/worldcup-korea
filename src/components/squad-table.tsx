import type { SquadPlayer } from "@/lib/squads";
import { normalizePlayerName } from "@/lib/player-goals";

const POS_LABEL: Record<string, string> = {
  GK: "골키퍼",
  DF: "수비수",
  MF: "미드필더",
  FW: "공격수",
};
const POS_GROUPS = ["GK", "DF", "MF", "FW"];

function googleUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
function wikiUrl(query: string) {
  return `https://ko.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`;
}
function transfermarktUrl(query: string) {
  return `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`;
}
/** 검색어용 — "(captain)" 같은 괄호 주석 제거 */
function searchName(name: string) {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function RefChip({
  href,
  label,
  title,
}: {
  href: string;
  label: string;
  title: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted transition-colors hover:bg-[var(--color-accent)]/10 hover:text-accent"
    >
      {label}
    </a>
  );
}

export function SquadTable({
  players,
  teamKo,
  wcGoals,
}: {
  players: SquadPlayer[];
  teamKo?: string;
  /** 정규화된 선수 이름 → 이번 월드컵 득점 수 */
  wcGoals?: Record<string, number>;
}) {
  const byPos = POS_GROUPS.map((p) => ({
    pos: p,
    list: players.filter((pl) => pl.pos === p),
  })).filter((g) => g.list.length > 0);

  // 분류되지 않은 포지션
  const others = players.filter((pl) => !POS_GROUPS.includes(pl.pos));
  if (others.length) byPos.push({ pos: "기타", list: others });

  const ctx = teamKo ? ` ${teamKo}` : "";

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
                  <th className="hidden py-1.5 px-1 text-center font-medium tnum sm:table-cell" title="국가대표 A매치 통산 출전">A매치</th>
                  <th className="hidden py-1.5 px-1 text-center font-medium tnum sm:table-cell" title="국가대표 A매치 통산 득점">통산 득점</th>
                  <th className="py-1.5 px-1 text-center font-medium tnum" title="이번 월드컵 득점">2026 월드컵</th>
                  <th className="py-1.5 pl-1 font-medium">소속 클럽</th>
                </tr>
              </thead>
              <tbody>
                {grp.list.map((p, i) => {
                  const q = searchName(p.name);
                  const wc = wcGoals?.[normalizePlayerName(p.name)] ?? 0;
                  return (
                  <tr key={`${p.name}-${i}`} className="border-b align-top transition-colors last:border-0 hover:bg-surface">
                    <td className="py-2 pr-2 text-center tnum text-muted">{p.no ?? "-"}</td>
                    <td className="py-2 pr-2">
                      <div className="flex flex-col gap-1">
                        <a
                          href={googleUrl(`${q}${ctx} 축구 선수`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${q} 구글 검색`}
                          className="font-medium hover:text-accent hover:underline"
                        >
                          {p.name}
                        </a>
                        <span className="flex flex-wrap gap-1">
                          <RefChip
                            href={wikiUrl(q)}
                            label="위키"
                            title={`${q} 위키백과`}
                          />
                          <RefChip
                            href={transfermarktUrl(q)}
                            label="TM"
                            title={`${q} Transfermarkt (이적·시장가치)`}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-1 text-center tnum text-muted">{p.age ?? "-"}</td>
                    <td className="hidden px-1 text-center tnum text-muted sm:table-cell">{p.caps ?? "-"}</td>
                    <td className="hidden px-1 text-center tnum text-muted sm:table-cell">{p.goals ?? "-"}</td>
                    <td className="px-1 text-center tnum">
                      {wc > 0 ? (
                        <span className="font-semibold text-accent">{wc}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="py-2 pl-1">
                      {p.club ? (
                        <a
                          href={googleUrl(`${p.club} 축구 클럽`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${p.club} 구글 검색`}
                          className="text-muted hover:text-accent hover:underline"
                        >
                          {p.club}
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
