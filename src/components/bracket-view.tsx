"use client";

import { useEffect, useRef, useState } from "react";
import type { BMatch, ProjectedBracket } from "@/lib/bracket-types";
import { teamKo, teamFlagUrl, KOREA } from "@/lib/teams";

const CARD_H = 52; // 카드 1개 높이(px) — 컬럼 정렬 기준

function Side({
  name,
  state,
}: {
  name: string | null;
  state: "pending" | "neutral" | "win" | "lose";
}) {
  // 아직 올라오지 않은 자리 — 빈 슬롯
  if (state === "pending") {
    return (
      <div className="flex h-6 items-center gap-1.5 px-1.5">
        <span className="inline-block h-3 w-[18px] shrink-0 rounded-[2px] bg-surface" />
        <span className="h-2 w-10 rounded-full bg-surface" />
      </div>
    );
  }
  const url = name ? teamFlagUrl(name, 40) : null;
  const isKorea = name === KOREA;
  return (
    <div
      className={`flex h-6 items-center gap-1.5 px-1.5 transition-colors duration-500 ${
        state === "win"
          ? "bg-success-soft font-semibold"
          : state === "lose"
            ? "text-muted/50 line-through decoration-1"
            : ""
      } ${isKorea && state !== "lose" ? "text-primary" : ""}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          aria-hidden
          className={`h-3 w-[18px] shrink-0 rounded-[2px] object-cover ring-1 ring-black/5 transition-opacity ${
            state === "lose" ? "opacity-40" : ""
          }`}
        />
      ) : (
        <span className="inline-block h-3 w-[18px] shrink-0 rounded-[2px] bg-surface" />
      )}
      <span className="truncate text-[11px] leading-none">
        {name ? teamKo(name) : ""}
      </span>
    </div>
  );
}

function MatchCard({
  m,
  teamsVisible,
  winnerVisible,
  justResolved,
}: {
  m: BMatch;
  teamsVisible: boolean;
  winnerVisible: boolean;
  justResolved: boolean;
}) {
  const sideState = (sideName: string | null): "pending" | "neutral" | "win" | "lose" => {
    if (!teamsVisible || !sideName) return "pending";
    if (!winnerVisible) return "neutral";
    return m.winner === sideName ? "win" : "lose";
  };
  return (
    <div
      style={{ height: CARD_H }}
      className={`flex flex-col justify-center overflow-hidden rounded-lg border bg-[var(--color-card)] transition-all duration-500 ${
        m.hasKorea && teamsVisible
          ? "border-primary/60 ring-1 ring-primary/25"
          : ""
      } ${justResolved ? "animate-[reveal-up_450ms_var(--ease-out-expo)] shadow-[var(--shadow-lift)]" : ""}`}
    >
      <Side name={m.side1.name} state={sideState(m.side1.name)} />
      <div className="h-px bg-[var(--color-border)]" />
      <Side name={m.side2.name} state={sideState(m.side2.name)} />
    </div>
  );
}

const STEP_LABELS = ["32강", "16강", "8강", "준결승", "결승"];

export function BracketView({ bracket }: { bracket: ProjectedBracket }) {
  const rounds = bracket.rounds;
  const totalSteps = rounds.length; // 5 (결승 승자 공개까지)
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const championRef = useRef<HTMLDivElement>(null);

  // 자동 진행
  useEffect(() => {
    if (step >= totalSteps) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 1000 : 900);
    return () => clearTimeout(t);
  }, [step, totalSteps]);

  // 진행 중인 라운드로 부드럽게 스크롤
  useEffect(() => {
    if (step === 0) return;
    const target =
      step >= totalSteps ? championRef.current : colRefs.current[step];
    target?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [step, totalSteps]);

  const replay = () => setStep(0);

  const bodyHeight = (rounds[0]?.matches.length ?? 16) * CARD_H + 40;

  return (
    <div>
      {/* 진행 표시 + 다시보기 */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          {STEP_LABELS.map((lbl, i) => (
            <span key={lbl} className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 font-medium transition-colors ${
                  step > i
                    ? "bg-success-soft text-success"
                    : step === i
                      ? "bg-primary text-[var(--color-on-primary)]"
                      : "bg-surface text-muted"
                }`}
              >
                {lbl}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <span className="text-muted/40">›</span>
              )}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={replay}
          className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          ↺ 다시 보기
        </button>
      </div>

      <div
        ref={containerRef}
        className="overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        <div className="flex min-w-max items-stretch gap-3 sm:gap-4">
          {rounds.map((round, ri) => {
            const teamsVisible = ri === 0 || step >= ri;
            const winnerVisible = step >= ri + 1;
            return (
              <div
                key={round.key}
                ref={(el) => {
                  colRefs.current[ri] = el;
                }}
                className="flex w-32 shrink-0 flex-col sm:w-36"
              >
                <h3 className="mb-2 flex items-center justify-center gap-1 text-center text-xs font-semibold">
                  <span className={step === ri ? "text-primary" : "text-muted"}>
                    {round.label}
                  </span>
                  {step === ri && step < totalSteps && (
                    <span className="pulse-dot inline-block size-1.5 rounded-full bg-primary" />
                  )}
                </h3>
                <div
                  style={{ minHeight: bodyHeight }}
                  className="flex flex-1 flex-col justify-around gap-1.5"
                >
                  {round.matches.map((m) => (
                    <MatchCard
                      key={m.id}
                      m={m}
                      teamsVisible={teamsVisible}
                      winnerVisible={winnerVisible}
                      justResolved={winnerVisible && step === ri + 1}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* 우승 */}
          <div
            ref={championRef}
            className="flex w-28 shrink-0 flex-col sm:w-32"
          >
            <h3 className="mb-2 text-center text-xs font-semibold text-muted">
              우승
            </h3>
            <div className="flex flex-1 items-center justify-center">
              <div
                className={`flex w-full flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-700 ${
                  step >= totalSteps
                    ? "animate-[reveal-up_600ms_var(--ease-out-expo)] border-warning/50 bg-gradient-to-b from-warning-soft to-transparent shadow-[var(--shadow-lift)]"
                    : "border-dashed bg-surface/40"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  🏆
                </span>
                {step >= totalSteps && bracket.champion ? (
                  <>
                    {teamFlagUrl(bracket.champion, 60) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teamFlagUrl(bracket.champion, 60)!}
                        alt=""
                        aria-hidden
                        className="h-6 w-9 rounded-[3px] object-cover ring-1 ring-black/5"
                      />
                    ) : null}
                    <span
                      className={`text-sm font-bold ${
                        bracket.champion === KOREA ? "text-primary" : ""
                      }`}
                    >
                      {teamKo(bracket.champion)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted">진행 중…</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
