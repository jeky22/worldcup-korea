"use client";

import { useState } from "react";
import type { KoVerbBlock } from "@/lib/bracket-types";
import type { ClinchStatus } from "@/lib/scenario/wildcard-race";
import type {
  KoreaSurvival,
  SurvivalGroup,
  ThirdRankRow,
} from "@/lib/scenario/korea-survival";
import type { GroupId, StandingRow } from "@/lib/types";
import { teamKo } from "@/lib/teams";
import { kstDate } from "@/lib/format";
import { StandingsTable } from "./standings-table";
import { KoreaKnockout } from "./korea-knockout";

function pct(rate: number, digits = 0) {
  return `${(rate * 100).toFixed(digits)}%`;
}

function formatGd(gd: number) {
  return gd > 0 ? `+${gd}` : String(gd);
}

const CLINCH_STYLE: Record<ClinchStatus, { cls: string; label: string }> = {
  확정: { cls: "bg-[var(--color-kor-red)] text-white", label: "진출 확정" },
  유력: {
    cls: "bg-[var(--color-kor-gold-soft)] text-[var(--color-kor-gold)]",
    label: "유력",
  },
  경쟁: {
    cls: "bg-[var(--color-kor-blue-soft)] text-[var(--color-kor-blue)]",
    label: "경쟁",
  },
  희박: { cls: "bg-[var(--color-kor-ink-soft)] text-[var(--color-kor-ink)]", label: "희박" },
  탈락: { cls: "bg-[var(--color-kor-ink)] text-white", label: "탈락" },
};

type TabId = "wildcard" | "standings" | "knockout";

const STATUS_STYLE: Record<
  SurvivalGroup["status"],
  { text: string; cls: string }
> = {
  above: { text: "위험 발생", cls: "bg-[var(--color-kor-red)] text-white" },
  below: {
    text: "해소",
    cls: "bg-[var(--color-kor-blue-soft)] text-[var(--color-kor-blue)]",
  },
  live: {
    text: "진행중",
    cls: "bg-[var(--color-kor-gold-soft)] text-[var(--color-kor-gold)]",
  },
};

function SurvivalRow({ g }: { g: SurvivalGroup }) {
  const s = STATUS_STYLE[g.status];
  const dangerTeams =
    g.dangerResult === "W"
      ? `${teamKo(g.dangerMatch!.team1)} 승`
      : g.dangerResult === "L"
        ? `${teamKo(g.dangerMatch!.team2)} 승`
        : "무승부";

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        g.status === "above"
          ? "border-[var(--color-kor-red)]/30 bg-[var(--color-kor-red-soft)]/30"
          : g.status === "below"
            ? "border-[var(--color-kor-ink)]/10 bg-[var(--color-card)] opacity-70"
            : "border-[var(--color-kor-gold)]/20 bg-[var(--color-card)]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] font-bold text-muted">{g.group}조</span>
        <span className="font-semibold">{teamKo(g.team)}</span>
        <span className="text-[11px] text-muted tnum">
          {g.points}점·{formatGd(g.gd)}
        </span>
        <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
          {s.text}
        </span>
        <span
          className={`min-w-[2.6rem] text-right text-sm font-black tabular-nums ${
            g.overtakeProb >= 0.6
              ? "text-[var(--color-kor-red)]"
              : g.overtakeProb <= 0.25
                ? "text-muted"
                : "text-ink"
          }`}
        >
          {pct(g.overtakeProb, g.overtakeProb > 0 && g.overtakeProb < 0.01 ? 1 : 0)}
        </span>
      </div>
      {g.status === "live" && g.dangerMatch && (
        <p className="mt-1 text-[11px] text-muted">
          ⚠ {teamKo(g.dangerMatch.team1)} vs {teamKo(g.dangerMatch.team2)} —{" "}
          <span className="font-semibold text-[var(--color-kor-red)]">{dangerTeams}</span>{" "}
          시 한국 추월
          {g.dangerMatch.kickoff && (
            <span className="ml-1 tnum">· {kstDate(g.dangerMatch.kickoff)}</span>
          )}
        </p>
      )}
    </div>
  );
}

function ThirdRankTable({ rows }: { rows: ThirdRankRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-kor-gold)]/15 bg-[var(--color-card)] p-2">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] font-medium text-muted">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">조 3위</th>
            <th className="px-1 text-center font-medium tnum">승점</th>
            <th className="px-1 text-center font-medium tnum">득실</th>
            <th className="px-1 text-center font-medium tnum">득점</th>
            <th className="py-2 pl-1 text-right font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cut = r.rank === 8;
            return (
              <tr
                key={r.group}
                className={`border-b last:border-0 ${
                  r.isFocus
                    ? "bg-[var(--color-kor-gold-soft)]/60"
                    : "hover:bg-surface"
                } ${cut ? "border-b-2 border-b-[var(--color-kor-gold)]/60" : ""}`}
              >
                <td className="py-2 pr-2">
                  <span
                    className={`inline-grid size-5 place-items-center rounded text-[11px] font-bold tnum ${
                      r.qualifies
                        ? "bg-[var(--color-kor-gold)] text-white"
                        : "bg-[var(--color-kor-ink-soft)] text-[var(--color-kor-ink)]"
                    }`}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted">{r.group}조</span>
                    <span className={r.isFocus ? "font-bold text-[var(--color-kor-gold)]" : "font-medium"}>
                      {teamKo(r.team)}
                    </span>
                  </span>
                </td>
                <td className="px-1 text-center font-semibold tnum">{r.points}</td>
                <td className="px-1 text-center tnum">{formatGd(r.gd)}</td>
                <td className="px-1 text-center tnum text-muted">{r.gf}</td>
                <td className="py-2 pl-1 text-right">
                  {r.complete ? (
                    <span className="rounded bg-[var(--color-kor-ink-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-kor-ink)]">
                      완료
                    </span>
                  ) : (
                    <span className="rounded bg-[var(--color-kor-blue-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-kor-blue)]">
                      잔여 {r.remaining}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted">
        12개 조 3위 중 상위 8팀이 32강(와일드카드) 진출 · 굵은 선이 8위 컷.
        진행 중인 조는 현재 3위 팀 기준이며 경기 후 바뀔 수 있습니다.
      </p>
    </div>
  );
}

function SurvivalPanel({ survival }: { survival: KoreaSurvival }) {
  const danger = survival.groups.filter((g) => g.status !== "below");
  const safe = survival.groups.filter((g) => g.status === "below");
  const margin = survival.threshold - survival.aboveNow;
  const likely = [...survival.rankDistribution].sort((a, b) => b.share - a.share)[0];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 핵심 요약 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col justify-center rounded-xl border-2 border-[var(--color-kor-gold)]/35 bg-[var(--color-kor-gold-soft)] px-5 py-4">
          <p className="text-[11px] font-bold text-[var(--color-kor-gold)]">
            한국 와일드카드 진출
          </p>
          <p className="text-4xl font-black tabular-nums leading-none text-[var(--color-kor-gold)]">
            {pct(survival.qualifyRate, survival.qualifyRate < 0.01 ? 1 : 0)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-[var(--color-kor-gold)]">
            {CLINCH_STYLE[survival.clinch].label}
            {likely ? ` · 예상 ${likely.rank}위권` : ""}
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-[var(--color-kor-red)]/20 bg-[var(--color-kor-red-soft)]/30 px-5 py-4">
          <p className="text-[11px] font-bold text-[var(--color-kor-red)]">
            한국 위로 간 조 (8이면 탈락)
          </p>
          <p className="leading-none">
            <span className="text-3xl font-black tabular-nums text-[var(--color-kor-red)]">
              {survival.aboveNow}
            </span>
            <span className="text-xl font-bold text-muted"> / {survival.threshold}</span>
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted">
            탈락하려면 {margin}개 조에서 한국보다 좋은 3위가 더 나와야 함
            {survival.aboveLocked > 0 && ` (확정 ${survival.aboveLocked}개)`}
          </p>
        </div>
      </div>

      {/* 12개 조 3위 승점 순위표 */}
      <div>
        <p className="mb-2 text-xs font-bold text-[var(--color-kor-gold)]">
          12개 조 3위 승점 순위
        </p>
        <ThirdRankTable rows={survival.thirdTable} />
      </div>

      {/* 최악(탈락) 시나리오 체크리스트 */}
      <div>
        <p className="mb-1 text-xs font-bold text-[var(--color-kor-red)]">
          탈락 위험 체크리스트 · 한국({survival.focusPoints}점·{formatGd(survival.focusGd)}·
          {survival.focusGf}득점)보다 좋은 3위가 나오면 위험
        </p>
        <p className="mb-2 text-[11px] text-muted">
          확률 = 그 조 최종 3위가 한국을 추월할 가능성. 경기 결과가 확정되면 자동으로 위험 발생/해소로
          갱신됩니다.
        </p>
        <div className="flex flex-col gap-1.5">
          {danger.map((g) => (
            <SurvivalRow key={g.group} g={g} />
          ))}
        </div>
        {safe.length > 0 && (
          <p className="mt-2 text-[11px] text-muted">
            ✓ 이미 안전(한국 아래 확정):{" "}
            {safe.map((g) => `${g.group}조 ${teamKo(g.team)}`).join(", ")}
          </p>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        12개 조 3위 중 상위 8팀이 32강 진출. 한국은 현재 3위 팀 중 {survival.aboveNow + 1}위(위{" "}
        {survival.aboveNow}개 조)이며, 8개 조가 한국을 넘어서야 탈락합니다. 타 조 남은{" "}
        {survival.remainingMatches}경기를 조별 모든 스코어(0~4골) 동일 가정으로 전수 계산했습니다.
      </p>
    </div>
  );
}

export function KoreaGroupTabs({
  group,
  standings,
  statusMap,
  koBlocks,
  koDecided = false,
  survival,
  totalCombos,
}: {
  group: GroupId;
  standings: StandingRow[];
  statusMap?: Record<string, string>;
  koBlocks: KoVerbBlock[];
  koDecided?: boolean;
  survival: KoreaSurvival | null;
  totalCombos?: number;
}) {
  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "wildcard", label: "3위 순위권", show: !!survival },
    { id: "standings", label: `${group}조 순위`, show: true },
    { id: "knockout", label: "32강 상대", show: koBlocks.length > 0 },
  ];
  const visible = tabs.filter((t) => t.show);
  const [tab, setTab] = useState<TabId>(visible[0]?.id ?? "standings");

  const accent: Record<TabId, string> = {
    wildcard:
      "bg-[var(--color-kor-gold)] text-white shadow-[0_4px_14px_oklch(0.72_0.14_85/0.35)]",
    knockout:
      "bg-[var(--color-kor-red)] text-white shadow-[0_4px_14px_oklch(0.48_0.21_355/0.35)]",
    standings: "bg-[var(--color-kor-blue)] text-white",
  };

  return (
    <div className="panel overflow-hidden p-0">
      <div className="flex gap-1 border-b border-[var(--color-kor-red)]/10 bg-[var(--color-kor-red-soft)]/25 p-2">
        {visible.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${
                on ? accent[t.id] : "bg-[var(--color-card)] text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        key={tab}
        style={{
          animation: "reveal-up 450ms var(--ease-out-expo)",
        }}
      >
        {tab === "wildcard" && survival && (
          <SurvivalPanel survival={survival} />
        )}
        {tab === "standings" && (
          <div className="px-3 py-3">
            <StandingsTable rows={standings} statusMap={statusMap} />
          </div>
        )}
        {tab === "knockout" && koBlocks.length > 0 && (
          <KoreaKnockout blocks={koBlocks} totalCombos={totalCombos} decided={koDecided} />
        )}
      </div>
    </div>
  );
}
