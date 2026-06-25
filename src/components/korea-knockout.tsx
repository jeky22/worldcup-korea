"use client";

import { useState } from "react";
import type { KoVerbBlock, OppCandidate, WDL } from "@/lib/bracket-types";
import { teamKo, teamFlagUrl } from "@/lib/teams";
import { kstDate } from "@/lib/format";

const KOREA_RANK = 23;

function pct(rate: number, digits = 0) {
  return `${(rate * 100).toFixed(digits)}%`;
}

function verdict(oppRank: number): { label: string; cls: string } {
  const diff = oppRank - KOREA_RANK;
  if (oppRank <= 12)
    return {
      label: "세계 정상권 · 큰 도전",
      cls: "bg-[var(--color-kor-red-soft)] text-[var(--color-kor-red)] font-semibold",
    };
  if (diff <= -6)
    return {
      label: "전력상 열세",
      cls: "bg-[var(--color-kor-red-soft)] text-[var(--color-kor-red)] font-semibold",
    };
  if (Math.abs(diff) < 6)
    return {
      label: "백중세 · 해볼 만함",
      cls: "bg-[var(--color-kor-gold-soft)] text-[var(--color-kor-gold)] font-semibold",
    };
  return {
    label: "전력상 우위",
    cls: "bg-[var(--color-kor-blue-soft)] text-[var(--color-kor-blue)] font-semibold",
  };
}

function OppCard({ opp, showShare }: { opp: OppCandidate; showShare: boolean }) {
  const v = verdict(opp.fifaRank);
  const url = teamFlagUrl(opp.name, 40);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-kor-red)]/15 bg-[var(--color-card)] p-3">
      {showShare && opp.share < 0.999 && (
        <span className="w-11 shrink-0 text-center text-base font-black tabular-nums text-[var(--color-kor-red)]">
          {pct(opp.share, opp.share < 0.01 ? 1 : 0)}
        </span>
      )}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" aria-hidden className="h-7 w-10 shrink-0 rounded-[3px] object-cover ring-1 ring-black/5" />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{teamKo(opp.name)}</span>
          <span className="text-xs text-muted tnum">FIFA {opp.fifaRank}위</span>
        </div>
        <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[11px] ${v.cls}`}>
          {v.label}
        </span>
      </div>
    </div>
  );
}

const RESULT_STYLE: Record<string, string> = {
  직행: "bg-[var(--color-kor-red)] text-white font-bold",
  와일드카드: "bg-[var(--color-kor-gold)] text-white font-bold",
  탈락: "bg-[var(--color-kor-ink)] text-white font-bold",
};

const VERB_TAB: Record<WDL, { label: string; active: string; idle: string }> = {
  W: {
    label: "승",
    active: "bg-[var(--color-kor-red)] text-white shadow-[0_4px_14px_oklch(0.48_0.21_355/0.4)]",
    idle: "bg-[var(--color-kor-red-soft)] text-[var(--color-kor-red)] hover:bg-[var(--color-kor-red)]/15",
  },
  D: {
    label: "무",
    active: "bg-[var(--color-kor-blue)] text-white shadow-[0_4px_14px_oklch(0.42_0.16_250/0.35)]",
    idle: "bg-[var(--color-kor-blue-soft)] text-[var(--color-kor-blue)] hover:bg-[var(--color-kor-blue)]/15",
  },
  L: {
    label: "패",
    active: "bg-[var(--color-kor-ink)] text-white",
    idle: "bg-[var(--color-kor-ink-soft)] text-[var(--color-kor-ink)] hover:bg-[var(--color-kor-ink)]/15",
  },
};

export function KoreaKnockout({
  blocks,
}: {
  blocks: KoVerbBlock[];
  totalCombos?: number;
}) {
  const [verb, setVerb] = useState<WDL>("W");
  const active = blocks.find((b) => b.verb === verb) ?? blocks[0];

  return (
    <div className="panel overflow-hidden p-0">
      <div className="flex gap-1.5 border-b border-[var(--color-kor-red)]/10 bg-[var(--color-kor-red-soft)]/30 p-2">
        {blocks.map((b) => {
          const s = VERB_TAB[b.verb];
          const on = verb === b.verb;
          return (
            <button
              key={b.verb}
              type="button"
              onClick={() => setVerb(b.verb)}
              className={`flex flex-1 flex-col items-center rounded-lg py-2.5 transition-all ${
                on ? s.active : s.idle
              }`}
            >
              <span className="text-sm font-bold">{s.label}</span>
              <span className="text-xs font-black tabular-nums opacity-95">
                {pct(b.share, b.share < 0.01 ? 1 : 0)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 p-4" key={verb}>
        {active.ranks.map((step) => (
          <div
            key={step.rank}
            className={`animate-[reveal-up_400ms_var(--ease-out-expo)] overflow-hidden rounded-xl border-2 ${
              step.result === "직행"
                ? "border-[var(--color-kor-red)]/20"
                : step.result === "와일드카드"
                  ? "border-[var(--color-kor-gold)]/25"
                  : "border-[var(--color-kor-ink)]/15"
            }`}
          >
            <div
              className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 ${
                step.result === "직행"
                  ? "bg-[var(--color-kor-red-soft)]"
                  : step.result === "와일드카드"
                    ? "bg-[var(--color-kor-gold-soft)]"
                    : "bg-[var(--color-kor-ink-soft)]"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black tabular-nums ${
                    step.result === "직행"
                      ? "text-[var(--color-kor-red)]"
                      : step.result === "와일드카드"
                        ? "text-[var(--color-kor-gold)]"
                        : "text-[var(--color-kor-ink)]"
                  }`}
                >
                  {pct(step.share, step.share < 0.01 ? 1 : 0)}
                </span>
                <span className="text-sm font-semibold">
                  {step.rank}위
                  {step.rank === 3 &&
                    step.wildcardRate != null &&
                    step.wildcardRate < 1 && (
                      <span className="ml-1.5 text-xs font-bold text-[var(--color-kor-gold)] tnum">
                        WC {pct(step.wildcardRate, step.wildcardRate < 0.01 ? 1 : 0)}
                      </span>
                    )}
                </span>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs ${RESULT_STYLE[step.result]}`}>
                {step.result === "직행"
                  ? "32강"
                  : step.result === "와일드카드"
                    ? "와일드카드"
                    : "탈락"}
              </span>
            </div>

            <div className="px-3.5 py-3">
              {step.match ? (
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                    <span className="font-bold text-[var(--color-kor-red)]">{step.match.stageLabel}</span>
                    <span className="font-medium">vs {step.match.opponentLabel}</span>
                    {step.match.date && (
                      <span className="text-xs text-muted tnum">· {kstDate(step.match.kickoff)}</span>
                    )}
                  </div>
                  {step.match.candidates.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {step.match.candidates.map((c) => (
                        <OppCard
                          key={c.name}
                          opp={c}
                          showShare={!step.match!.fixed || step.match!.candidates.length > 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">상대 미정</p>
                  )}
                </div>
              ) : step.result === "탈락" ? (
                <p className="text-sm font-medium text-[var(--color-kor-ink)]">32강 탈락</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
