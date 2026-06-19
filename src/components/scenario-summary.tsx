import type { FocusBranch, FocusCondition, Outcome, WDL } from "@/lib/scenario/engine";
import { teamKo } from "@/lib/teams";
import { withJosa } from "@/lib/format";
import { OutcomePill } from "./ui";

const WDL_CHAR: Record<WDL, string> = { W: "승", D: "무", L: "패" };
const WDL_VERB: Record<WDL, string> = { W: "이기면", D: "비기면", L: "지면" };
const WDL_BADGE: Record<WDL, string> = {
  W: "bg-success-soft text-success",
  D: "bg-surface text-ink",
  L: "bg-danger-soft text-danger",
};

/** "대한민국이 남아프리카공화국과의 경기에서 이기면" */
function ownPhrase(focus: string, branch: FocusBranch): string {
  const focusKo = teamKo(focus);
  if (branch.ownMatches.length === 1 && branch.ownResult.length === 1) {
    const m = branch.ownMatches[0];
    const oppName = m.team1 === focus ? m.team2 : m.team1;
    const oppKo = teamKo(oppName);
    return `${withJosa(focusKo, "이가")} ${withJosa(oppKo, "와과")}의 경기에서 ${WDL_VERB[branch.ownResult[0]]}`;
  }
  const seq = branch.ownResult.map((w) => WDL_CHAR[w]).join("·");
  return `${withJosa(focusKo, "이가")} 남은 경기를 ${seq}로 마치면`;
}

/** 한 경기 결과를 동사구로: "멕시코가 이기" / "비기" */
function matchResultVerb(team1: string, team2: string, result: WDL): string {
  if (result === "D") return "비기";
  const winner = result === "W" ? team1 : team2;
  return `${withJosa(teamKo(winner), "이가")} 이기`;
}

const RESULT_ORDER: Record<WDL, number> = { W: 0, D: 1, L: 2 };

/**
 * 같은 결과(outcome)로 이어지는 '다른 경기' 조건들을 자연어로 묶는다.
 * 다른 경기가 1개일 때: "체코 vs 멕시코에서 비기거나 멕시코가 이기면"
 */
function describeConditions(conds: FocusCondition[]): {
  text: string;
  outcome: Outcome[];
}[] {
  // outcome 별로 묶기
  const byOutcome = new Map<string, FocusCondition[]>();
  for (const c of conds) {
    const key = c.outcome.join("+");
    const arr = byOutcome.get(key) ?? [];
    arr.push(c);
    byOutcome.set(key, arr);
  }

  const out: { text: string; outcome: Outcome[] }[] = [];
  for (const [key, list] of byOutcome) {
    const outcome = key.split("+") as Outcome[];
    const sample = list[0];
    if (sample.parts.length === 1) {
      // 다른 경기 1개: 결과들을 모아서 한 문장
      const ref = sample.parts[0];
      const results = list
        .map((c) => c.parts[0].result)
        .sort((a, b) => RESULT_ORDER[a] - RESULT_ORDER[b]);
      const verbs = results.map((r) =>
        matchResultVerb(ref.team1, ref.team2, r),
      );
      const joined =
        verbs.length === 3
          ? "결과와 무관하게"
          : verbs.join("거나") + "면";
      const prefix =
        verbs.length === 3
          ? ""
          : `${teamKo(ref.team1)} vs ${teamKo(ref.team2)}에서 `;
      out.push({ text: `${prefix}${joined}`, outcome });
    } else {
      // 다른 경기 여러 개: 조합별 나열
      const lines = list.map((c) =>
        c.parts
          .map(
            (p) =>
              `${teamKo(p.team1)} vs ${teamKo(p.team2)} ${matchResultVerb(p.team1, p.team2, p.result)}고`,
          )
          .join(", ")
          .replace(/고$/, "면"),
      );
      out.push({ text: lines.join(" / "), outcome });
    }
  }
  // 진출 → 3위 → 탈락 순
  const ow = (o: Outcome[]) =>
    o.includes("advance") ? 0 : o.includes("third") ? 1 : 2;
  out.sort((a, b) => ow(a.outcome) - ow(b.outcome));
  return out;
}

function branchVerdictPill(b: FocusBranch) {
  if (b.verdict === "advance") return <OutcomePill outcome="advance" />;
  if (b.verdict === "advance-or-third")
    return <OutcomePill outcome="advance-or-third" />;
  if (b.verdict === "third") return <OutcomePill outcome="third" />;
  if (b.verdict === "out") return <OutcomePill outcome="out" />;
  return (
    <span className="text-sm font-medium text-warning">다른 경기에 따라 갈림</span>
  );
}

export function ScenarioSummary({
  focus,
  branches,
}: {
  focus: string;
  branches: FocusBranch[];
}) {
  if (branches.length === 0) {
    return (
      <p className="text-sm text-muted">
        {teamKo(focus)}의 남은 경기가 없어 시나리오가 확정되었습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {branches.map((b) => {
        const described =
          b.verdict === "depends" ? describeConditions(b.conditions) : [];
        return (
          <li
            key={b.ownResult.join()}
            className="group rounded-xl border bg-[var(--color-bg)] p-3.5 transition-all hover:border-ink/20 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition-transform group-hover:scale-110 ${
                    WDL_BADGE[b.ownResult[0]] ?? "bg-surface"
                  }`}
                >
                  {WDL_CHAR[b.ownResult[0]] ?? b.ownLabel}
                </span>
                <span className="text-sm font-medium text-balance">
                  {ownPhrase(focus, b)}
                </span>
              </div>
              {branchVerdictPill(b)}
            </div>

            {b.verdict === "depends" && (
              <ul className="mt-2.5 flex flex-col gap-1.5 border-t pt-2.5 text-sm">
                {described.map((d, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
                  >
                    <span className="text-muted">{d.text}</span>
                    <span className="text-muted">→</span>
                    {d.outcome.map((o) => (
                      <OutcomePill key={o} outcome={o} />
                    ))}
                    {d.outcome.length > 1 && (
                      <span className="text-xs text-muted">(득실차로 갈림)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
