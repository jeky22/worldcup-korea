"use client";

import { useState } from "react";
import type { KoVerbBlock, OppCandidate, WDL } from "@/lib/bracket-types";
import { teamKo, teamFlagUrl } from "@/lib/teams";
import { kstDate } from "@/lib/format";

const KOREA_RANK = 23;

function verdict(oppRank: number): { label: string; cls: string } {
  const diff = oppRank - KOREA_RANK;
  if (oppRank <= 12) return { label: "세계 정상권 · 큰 도전", cls: "bg-danger-soft text-danger" };
  if (diff <= -6) return { label: "전력상 열세", cls: "bg-danger-soft text-danger" };
  if (Math.abs(diff) < 6) return { label: "백중세 · 해볼 만함", cls: "bg-warning-soft text-warning" };
  return { label: "전력상 우위", cls: "bg-success-soft text-success" };
}

function OppCard({ opp }: { opp: OppCandidate }) {
  const v = verdict(opp.fifaRank);
  const url = teamFlagUrl(opp.name, 40);
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-[var(--color-card)] p-3">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" aria-hidden className="h-7 w-10 shrink-0 rounded-[3px] object-cover ring-1 ring-black/5" />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{teamKo(opp.name)}</span>
          <span className="text-xs text-muted tnum">FIFA {opp.fifaRank}위</span>
        </div>
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${v.cls}`}>
          {v.label}
        </span>
      </div>
    </div>
  );
}

const RESULT_STYLE: Record<string, string> = {
  직행: "bg-success-soft text-success",
  와일드카드: "bg-warning-soft text-warning",
  탈락: "bg-danger-soft text-danger",
};

export function KoreaKnockout({ blocks }: { blocks: KoVerbBlock[] }) {
  const [verb, setVerb] = useState<WDL>("W");
  const active = blocks.find((b) => b.verb === verb) ?? blocks[0];

  const tab = (v: WDL, label: string) => (
    <button
      key={v}
      type="button"
      onClick={() => setVerb(v)}
      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
        verb === v
          ? "bg-primary text-[var(--color-on-primary)] shadow-sm"
          : "bg-surface text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="panel p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-base font-bold">한국이 마지막 경기에서…</span>
      </div>
      <p className="mb-3 text-xs text-muted">
        결과를 누르면 32강(본선)에서 만날 상대와 전력 분석이 나옵니다 (FIFA Annex C 기준).
      </p>

      <div className="mb-4 flex gap-2">
        {tab("W", "이기면 (승)")}
        {tab("D", "비기면 (무)")}
        {tab("L", "지면 (패)")}
      </div>

      <div className="flex flex-col gap-3" key={verb}>
        {active.ranks.map((step) => (
          <div
            key={step.rank}
            className="animate-[reveal-up_400ms_var(--ease-out-expo)] rounded-xl border bg-[var(--color-card)] p-3.5"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">조 {step.rank}위</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RESULT_STYLE[step.result]}`}>
                {step.result === "직행"
                  ? "32강 진출"
                  : step.result === "와일드카드"
                    ? "와일드카드 (32강)"
                    : "탈락"}
              </span>
            </div>

            {step.match ? (
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                  <span className="font-medium text-accent">{step.match.stageLabel}</span>
                  <span className="text-muted">상대:</span>
                  <span className="font-medium">{step.match.opponentLabel}</span>
                  {step.match.date && (
                    <span className="text-xs text-muted tnum">· {kstDate(step.match.kickoff)}</span>
                  )}
                  {step.match.ground && (
                    <span className="text-xs text-muted">· {step.match.ground}</span>
                  )}
                </div>
                {step.match.candidates.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {step.match.candidates.map((c) => (
                      <OppCard key={c.name} opp={c} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">상대 확정 전 (조별리그 진행 중)</p>
                )}
                {!step.match.fixed && step.match.candidates.length > 1 && (
                  <p className="mt-2 text-xs text-muted">
                    실제 상대는 다른 조 결과에 따라 이 중 하나로 정해집니다.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                본선(32강) 진출 실패 — 조별리그에서 탈락합니다.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
