import type {
  FocusBranch,
  FocusCondition,
  Outcome,
  ThirdFollowUp,
  ThirdWildcardSnapshot,
  WDL,
} from "@/lib/scenario/engine";
import type { FocusThirdPlaceWildcard } from "@/lib/scenario/third-place";
import type { GroupId } from "@/lib/types";
import { teamKo } from "@/lib/teams";
import { withJosa } from "@/lib/format";
import { OutcomePill } from "./ui";
import { ThirdPlaceTable } from "./third-place-table";
import type { ThirdPlaceRow } from "@/lib/scenario/third-place";

const WDL_CHAR: Record<WDL, string> = { W: "승", D: "무", L: "패" };
const WDL_VERB: Record<WDL, string> = { W: "이기면", D: "비기면", L: "지면" };
const WDL_BADGE: Record<WDL, string> = {
  W: "bg-[var(--color-kor-red)] text-white shadow-[0_2px_8px_oklch(0.48_0.21_355/0.35)]",
  D: "bg-[var(--color-kor-blue)] text-white shadow-[0_2px_8px_oklch(0.42_0.16_250/0.3)]",
  L: "bg-[var(--color-kor-ink)] text-white",
};

const OUTCOME_TILE = {
  advance: {
    label: "32강",
    bg: "bg-[var(--color-kor-red-soft)]",
    border: "border-[var(--color-kor-red)]/30",
    text: "text-[var(--color-kor-red)]",
  },
  third: {
    label: "3위",
    bg: "bg-[var(--color-kor-gold-soft)]",
    border: "border-[var(--color-kor-gold)]/35",
    text: "text-[var(--color-kor-gold)]",
  },
  out: {
    label: "탈락",
    bg: "bg-[var(--color-kor-ink-soft)]",
    border: "border-[var(--color-kor-ink)]/25",
    text: "text-[var(--color-kor-ink)]",
  },
} as const;

function pct(rate: number, digits = 0) {
  return `${(rate * 100).toFixed(digits)}%`;
}

function ownHeadline(focus: string, branch: FocusBranch): string {
  const focusKo = teamKo(focus);
  if (branch.ownMatches.length === 1 && branch.ownResult.length === 1) {
    const m = branch.ownMatches[0];
    const oppName = m.team1 === focus ? m.team2 : m.team1;
    return `${withJosa(focusKo, "이가")} ${withJosa(teamKo(oppName), "와과")} ${WDL_VERB[branch.ownResult[0]]}`;
  }
  const seq = branch.ownResult.map((w) => WDL_CHAR[w]).join("·");
  return `${withJosa(focusKo, "이가")} 남은 경기 ${seq}`;
}

function resultChip(team1: string, team2: string, result: WDL) {
  const label =
    result === "D"
      ? "무"
      : result === "W"
        ? `${teamKo(team1)} 승`
        : `${teamKo(team2)} 승`;
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
        result === "W"
          ? "bg-[var(--color-kor-red-soft)] text-[var(--color-kor-red)]"
          : result === "L"
            ? "bg-[var(--color-kor-ink-soft)] text-[var(--color-kor-ink)]"
            : "bg-[var(--color-kor-blue-soft)] text-[var(--color-kor-blue)]"
      }`}
    >
      {label}
    </span>
  );
}

function OutcomeTiles({
  advance,
  third,
  out,
}: {
  advance: number;
  third: number;
  out: number;
}) {
  const items = (
    [
      { key: "advance" as const, rate: advance },
      { key: "third" as const, rate: third },
      { key: "out" as const, rate: out },
    ] as const
  ).filter((i) => i.rate > 0);

  if (items.length === 0) return null;

  if (items.length === 1) {
    const t = OUTCOME_TILE[items[0].key];
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${t.bg} ${t.border}`}
      >
        <span className={`text-xs font-bold ${t.text}`}>{t.label}</span>
        <span className={`text-lg font-black tabular-nums ${t.text}`}>
          {pct(items[0].rate, items[0].rate < 0.01 ? 1 : 0)}
        </span>
      </span>
    );
  }

  return (
    <div
      className={`grid gap-2 ${items.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
    >
      {items.map(({ key, rate }) => {
        const t = OUTCOME_TILE[key];
        return (
          <div
            key={key}
            className={`flex flex-col items-center rounded-lg border px-2 py-2 ${t.bg} ${t.border}`}
          >
            <span className={`text-[11px] font-bold ${t.text}`}>{t.label}</span>
            <span className={`text-xl font-black tabular-nums leading-tight ${t.text}`}>
              {pct(rate, rate < 0.01 ? 1 : 0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatGd(gd: number) {
  return gd > 0 ? `+${gd}` : String(gd);
}

function snapshotLine(s: ThirdWildcardSnapshot) {
  return `${s.rank}위 · ${s.points}점 · 득실 ${formatGd(s.gd)} · ${s.gf}득점`;
}

function ConditionRow({
  c,
  primarySnapshot,
  snapshotOnly,
}: {
  c: FocusCondition;
  primarySnapshot?: ThirdWildcardSnapshot;
  snapshotOnly?: boolean;
}) {
  const single = c.parts.length === 1;
  const multiOutcome = c.outcome.length > 1;
  const onlyThird = c.outcome.length === 1 && c.outcome[0] === "third";
  const onlyOut = c.outcome.length === 1 && c.outcome[0] === "out";

  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg bg-[var(--color-kor-red-soft)]/40 px-3 py-2 ring-1 ring-[var(--color-kor-red)]/10">
      <span className="min-w-[2.5rem] text-sm font-bold tabular-nums text-[var(--color-kor-red)]">
        {pct(c.share, c.share < 0.01 ? 1 : 0)}
      </span>
      {single ? (
        <>
          <span className="text-xs font-medium">
            {teamKo(c.parts[0].team1)} vs {teamKo(c.parts[0].team2)}
          </span>
          {resultChip(c.parts[0].team1, c.parts[0].team2, c.parts[0].result)}
        </>
      ) : (
        <span className="flex flex-wrap gap-1">
          {c.parts.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs">
              {teamKo(p.team1)} vs {teamKo(p.team2)} {resultChip(p.team1, p.team2, p.result)}
            </span>
          ))}
        </span>
      )}
      <span className="text-muted">→</span>
      {multiOutcome ? (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {(["advance", "third", "out"] as Outcome[]).map((o) => {
            const r = c.outcomeRates[o];
            if (!r) return null;
            return (
              <span key={o} className="inline-flex items-center gap-1">
                <OutcomePill outcome={o} />
                <span className="text-[11px] font-semibold text-muted tnum">{pct(r)}</span>
              </span>
            );
          })}
        </span>
      ) : onlyThird && primarySnapshot ? (
        <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
          <OutcomePill outcome="third" />
          <span className="text-muted">→</span>
          <span className="font-semibold text-[var(--color-kor-gold)]">
            3위 순위 {snapshotLine(primarySnapshot)}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              primarySnapshot.qualifies
                ? "bg-[var(--color-kor-gold-soft)] text-[var(--color-kor-gold)]"
                : "bg-[var(--color-kor-ink-soft)] text-[var(--color-kor-ink)]"
            }`}
          >
            {snapshotOnly
              ? primarySnapshot.qualifies
                ? "현재 8위권"
                : "현재 8위 밖"
              : primarySnapshot.qualifies
                ? "8위권 진출"
                : "8위 밖"}
          </span>
        </span>
      ) : onlyOut ? (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <OutcomePill outcome="out" />
          <span className="font-medium text-[var(--color-kor-ink)]">조별리그 탈락</span>
        </span>
      ) : (
        c.outcome.map((o) => <OutcomePill key={o} outcome={o} />)
      )}
    </li>
  );
}

function snapshotFromRow(r: {
  rank: number;
  points: number;
  gd: number;
  gf: number;
  played: number;
  qualifies: boolean;
}): ThirdWildcardSnapshot {
  return {
    rank: r.rank,
    points: r.points,
    gd: r.gd,
    gf: r.gf,
    played: r.played,
    qualifies: r.qualifies,
    share: 1,
  };
}

function WildcardRankBody({
  primary,
  snapshotOnly,
  incompleteGroups,
  comparisonTable,
  focusGroup,
}: {
  primary: ThirdWildcardSnapshot;
  snapshotOnly: boolean;
  incompleteGroups: number;
  comparisonTable: ThirdPlaceRow[];
  focusGroup: GroupId;
}) {
  return (
    <>
      <div className="mb-3 rounded-lg border border-[var(--color-kor-gold)]/20 bg-[var(--color-card)] p-3">
        {snapshotOnly ? (
          <p className="text-xs leading-relaxed text-muted">
            타 조{" "}
            <span className="font-bold text-[var(--color-kor-gold)]">
              {incompleteGroups}개 조
            </span>{" "}
            경기 미완료 · 아래는{" "}
            <span className="font-semibold text-ink">현재 실적 기준</span> 3위 순위
            (최종 진출권은 변동 가능)
          </p>
        ) : (
          <p className="text-xs font-semibold text-muted">12개 조 3위 와일드카드 순위</p>
        )}
        <p className="mt-1 text-sm font-bold text-balance">
          {snapshotLine(primary)}
          <span
            className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
              primary.qualifies
                ? "bg-[var(--color-kor-gold-soft)] text-[var(--color-kor-gold)]"
                : "bg-[var(--color-kor-ink-soft)] text-[var(--color-kor-ink)]"
            }`}
          >
            {snapshotOnly
              ? primary.qualifies
                ? "현재 8위권"
                : "현재 8위 밖"
              : primary.qualifies
                ? "진출권"
                : "탈락권"}
          </span>
        </p>
      </div>

      {comparisonTable.length > 0 && (
        <div className="rounded-lg border border-[var(--color-kor-red)]/10 bg-[var(--color-card)] p-2">
          <p className="mb-2 px-1 text-[11px] font-medium text-muted">
            12개 조 3위 비교 · 승점 → 득실 → 득점
            {snapshotOnly
              ? " (타 조는 현재 순위, 경기 후 실적 변동)"
              : " (타 조는 현재 순위)"}
          </p>
          <ThirdPlaceTable rows={comparisonTable} highlightGroup={focusGroup} />
        </div>
      )}
    </>
  );
}

function ThirdPlaceWildcardPanel({
  focus,
  wc,
  focusGroup,
}: {
  focus: string;
  wc: FocusThirdPlaceWildcard;
  focusGroup: GroupId;
}) {
  const primary = snapshotFromRow(wc.row);

  return (
    <article className="overflow-hidden rounded-xl border-2 border-[var(--color-kor-gold)]/30 bg-[var(--color-card)]">
      <div className="flex items-center gap-3 bg-[var(--color-kor-gold-soft)] px-3.5 py-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--color-kor-gold)] text-lg font-black text-white">
          3위
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {withJosa(teamKo(focus), "은는")} {focusGroup}조 3위 · 와일드카드 경쟁
          </p>
          <div className="mt-2">
            <OutcomeTiles advance={0} third={1} out={0} />
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-kor-gold)]/15 bg-[var(--color-kor-gold-soft)]/20 px-3.5 py-3">
        <p className="mb-2.5 text-xs font-bold tracking-wide text-[var(--color-kor-gold)]">
          조 3위 와일드카드 순위
        </p>
        <WildcardRankBody
          primary={primary}
          snapshotOnly={wc.snapshotOnly}
          incompleteGroups={wc.incompleteGroups}
          comparisonTable={wc.comparisonTable}
          focusGroup={focusGroup}
        />
      </div>
    </article>
  );
}

function ThirdFollowUpPanel({
  tf,
  focusGroup,
}: {
  tf: ThirdFollowUp;
  focusGroup: GroupId;
}) {
  const primary = tf.snapshots[0];

  return (
    <div className="border-t border-[var(--color-kor-gold)]/15 bg-[var(--color-kor-gold-soft)]/20 px-3.5 py-3">
      <p className="mb-2 text-xs font-bold tracking-wide text-[var(--color-kor-gold)]">
        패 이후 · 조 3위 와일드카드 순위
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-kor-gold)]/30 bg-[var(--color-kor-gold-soft)] px-2.5 py-1.5 text-xs">
          <span className="font-bold text-[var(--color-kor-gold)]">조 3위</span>
          <span className="text-lg font-black tabular-nums text-[var(--color-kor-gold)]">
            {pct(tf.rank3Share, tf.rank3Share < 0.01 ? 1 : 0)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-kor-ink)]/25 bg-[var(--color-kor-ink-soft)] px-2.5 py-1.5 text-xs">
          <span className="font-bold text-[var(--color-kor-ink)]">조 4위 탈락</span>
          <span className="text-lg font-black tabular-nums text-[var(--color-kor-ink)]">
            {pct(tf.rank4Share, tf.rank4Share < 0.01 ? 1 : 0)}
          </span>
        </span>
      </div>

      {primary && (
        <>
          {tf.snapshots.length > 1 && (
            <ul className="mb-3 flex flex-col gap-1 rounded-lg border border-[var(--color-kor-gold)]/20 bg-[var(--color-card)] p-3">
              {tf.snapshots.slice(0, 4).map((s, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                  <span className="font-bold tabular-nums text-[var(--color-kor-gold)]">
                    {pct(s.share, s.share < 0.01 ? 1 : 0)}
                  </span>
                  <span>{snapshotLine(s)}</span>
                </li>
              ))}
            </ul>
          )}
          <WildcardRankBody
            primary={primary}
            snapshotOnly={tf.snapshotOnly}
            incompleteGroups={tf.incompleteGroups}
            comparisonTable={tf.comparisonTable}
            focusGroup={focusGroup}
          />
        </>
      )}
    </div>
  );
}

export function ScenarioSummary({
  focus,
  branches,
  thirdFollowUp,
  thirdPlaceWildcard,
  focusGroup,
}: {
  focus: string;
  branches: FocusBranch[];
  totalCombos?: number;
  thirdFollowUp?: ThirdFollowUp | null;
  thirdPlaceWildcard?: FocusThirdPlaceWildcard | null;
  focusGroup?: GroupId;
}) {
  if (branches.length === 0) {
    if (thirdPlaceWildcard && focusGroup) {
      return (
        <ThirdPlaceWildcardPanel
          focus={focus}
          wc={thirdPlaceWildcard}
          focusGroup={focusGroup}
        />
      );
    }
    return (
      <p className="text-sm text-muted">
        {teamKo(focus)}의 남은 경기가 없어 시나리오가 확정되었습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {branches.map((b) => {
        const wdl = b.ownResult[0];
        const isWin = wdl === "W";
        const isDraw = wdl === "D";
        const rates = [b.advanceRate, b.thirdRate, b.outRate].filter((r) => r > 0);
        const singleOutcome = rates.length === 1;
        return (
          <article
            key={b.ownResult.join()}
            className={`overflow-hidden rounded-xl border-2 bg-[var(--color-card)] ${
              isWin
                ? "border-[var(--color-kor-red)]/25"
                : isDraw
                  ? "border-[var(--color-kor-blue)]/25"
                  : "border-[var(--color-kor-ink)]/20"
            }`}
          >
            <div
              className={`flex items-center gap-3 px-3.5 py-3 ${
                isWin
                  ? "bg-[var(--color-kor-red-soft)]"
                  : isDraw
                    ? "bg-[var(--color-kor-blue-soft)]"
                    : "bg-[var(--color-kor-ink-soft)]"
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-lg text-lg font-black ${
                  WDL_BADGE[wdl] ?? "bg-surface"
                }`}
              >
                {WDL_CHAR[wdl] ?? b.ownLabel}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-balance">{ownHeadline(focus, b)}</p>
                {singleOutcome && (
                  <div className="mt-2">
                    <OutcomeTiles
                      advance={b.advanceRate}
                      third={b.thirdRate}
                      out={b.outRate}
                    />
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 text-2xl font-black tabular-nums ${
                  isWin
                    ? "text-[var(--color-kor-red)]"
                    : isDraw
                      ? "text-[var(--color-kor-blue)]"
                      : "text-[var(--color-kor-ink)]"
                }`}
              >
                {pct(b.share, b.share < 0.01 ? 1 : 0)}
              </span>
            </div>

            {!singleOutcome && (
              <div className="px-3.5 py-3">
                <OutcomeTiles
                  advance={b.advanceRate}
                  third={b.thirdRate}
                  out={b.outRate}
                />
              </div>
            )}

            {b.verdict === "depends" && b.conditions.length > 0 && (
              <ul className="flex flex-col gap-1.5 border-t border-[var(--color-kor-red)]/10 px-3.5 py-3">
                {b.conditions.map((c, i) => (
                  <ConditionRow
                    key={i}
                    c={c}
                    primarySnapshot={
                      wdl === "L" ? thirdFollowUp?.snapshots[0] : undefined
                    }
                    snapshotOnly={wdl === "L" ? thirdFollowUp?.snapshotOnly : undefined}
                  />
                ))}
              </ul>
            )}

            {wdl === "L" && thirdFollowUp && b.thirdRate > 0 && focusGroup && (
              <ThirdFollowUpPanel tf={thirdFollowUp} focusGroup={focusGroup} />
            )}
          </article>
        );
      })}
    </div>
  );
}
