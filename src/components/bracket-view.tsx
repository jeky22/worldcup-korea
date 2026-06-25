"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { BMatch, ProjectedBracket } from "@/lib/bracket-types";
import { teamKo, teamFlagUrl } from "@/lib/teams";
import { kstDate } from "@/lib/format";

const CARD_H = 56; // 매치 카드 높이(px)
const LABEL_H = 30; // 라운드 라벨 높이(px) — 컬럼/연결선 정렬 기준
const COL_W = 152; // 컬럼 너비
const CONN_W = 26; // 연결선 컬럼 너비

function Side({
  name,
  state,
}: {
  name: string | null;
  state: "pending" | "neutral" | "win" | "lose";
}) {
  if (state === "pending") {
    return (
      <div className="flex h-7 items-center gap-2 px-2">
        <span className="inline-block h-3.5 w-5 shrink-0 rounded-[2px] bg-surface" />
        <span className="h-2.5 w-12 rounded-full bg-surface" />
      </div>
    );
  }
  const url = name ? teamFlagUrl(name, 40) : null;
  return (
    <div
      className={`flex h-7 items-center gap-2 px-2 ${
        state === "win"
          ? "font-semibold text-ink"
          : state === "lose"
            ? "text-muted/60"
            : "text-ink"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          aria-hidden
          className={`h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/5 ${
            state === "lose" ? "opacity-50" : ""
          }`}
        />
      ) : (
        <span className="inline-block h-3.5 w-5 shrink-0 rounded-[2px] bg-surface" />
      )}
      <span className="truncate text-xs leading-none">
        {name ? teamKo(name) : ""}
      </span>
      {state === "win" && (
        <span className="ml-auto text-[10px] font-bold text-success">✓</span>
      )}
    </div>
  );
}

function MatchCard({ m }: { m: BMatch }) {
  const decided = !!(m.winner && m.side1.name && m.side2.name);
  const sideState = (
    sideName: string | null,
  ): "pending" | "neutral" | "win" | "lose" => {
    if (!sideName) return "pending";
    if (!decided) return "neutral";
    return m.winner === sideName ? "win" : "lose";
  };
  return (
    <div
      style={{ height: CARD_H }}
      className="flex flex-col justify-center overflow-hidden rounded-lg border bg-[var(--color-card)]"
    >
      <Side name={m.side1.name} state={sideState(m.side1.name)} />
      <div className="h-px bg-[var(--color-border)]" />
      <Side name={m.side2.name} state={sideState(m.side2.name)} />
    </div>
  );
}

/** 두 피더 → 다음 라운드 한 경기로 이어지는 ㅓ자 연결선 (SVG) */
function Connector({
  targetCount,
  bodyHeight,
}: {
  targetCount: number;
  bodyHeight: number;
}) {
  const midX = CONN_W / 2;
  const lines: ReactNode[] = [];
  for (let j = 0; j < targetCount; j++) {
    const yT = (bodyHeight * (j + 0.5)) / targetCount;
    const yA = (bodyHeight * (2 * j + 0.5)) / (2 * targetCount);
    const yB = (bodyHeight * (2 * j + 1.5)) / (2 * targetCount);
    lines.push(
      <path
        key={j}
        d={`M0 ${yA} H${midX} V${yB} H0 M${midX} ${yT} H${CONN_W}`}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={1.5}
      />,
    );
  }
  return (
    <div style={{ paddingTop: LABEL_H }} className="shrink-0">
      <svg width={CONN_W} height={bodyHeight} className="block">
        {lines}
      </svg>
    </div>
  );
}

const FALLBACK_ROUNDS = 16;

function FullBracket({ bracket }: { bracket: ProjectedBracket }) {
  const rounds = bracket.rounds;
  const leafCount = rounds[0]?.matches.length ?? FALLBACK_ROUNDS;
  const bodyHeight = leafCount * CARD_H + (leafCount - 1) * 8; // 카드 + gap

  return (
    <div className="overflow-x-auto pb-3 [scrollbar-width:thin]">
      <div className="flex min-w-max items-start">
        {rounds.map((round, ri) => (
          <div key={round.key} className="flex items-start">
            <div style={{ width: COL_W }} className="shrink-0">
              <div
                style={{ height: LABEL_H }}
                className="flex items-center justify-center text-xs font-semibold text-muted"
              >
                {round.label}
              </div>
              <div
                style={{ height: bodyHeight }}
                className="flex flex-col justify-around"
              >
                {round.matches.map((m) => (
                  <MatchCard key={m.id} m={m} />
                ))}
              </div>
            </div>
            {ri < rounds.length - 1 && (
              <Connector
                targetCount={rounds[ri + 1].matches.length}
                bodyHeight={bodyHeight}
              />
            )}
          </div>
        ))}

        {/* 결승 → 우승 연결 + 우승 카드 */}
        <div className="flex items-start">
          <div style={{ paddingTop: LABEL_H }} className="shrink-0">
            <svg width={CONN_W} height={bodyHeight} className="block">
              <path
                d={`M0 ${bodyHeight / 2} H${CONN_W}`}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={1.5}
              />
            </svg>
          </div>
          <div style={{ width: COL_W - 24 }} className="shrink-0">
            <div
              style={{ height: LABEL_H }}
              className="flex items-center justify-center text-xs font-semibold text-warning"
            >
              우승
            </div>
            <div
              style={{ height: bodyHeight }}
              className="flex flex-col justify-center"
            >
              <div className="flex flex-col items-center gap-2 rounded-xl border border-warning/50 bg-gradient-to-b from-warning-soft to-transparent p-3 text-center">
                <span className="text-3xl" aria-hidden>
                  🏆
                </span>
                {bracket.champion ? (
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
                    <span className="text-sm font-bold">
                      {teamKo(bracket.champion)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted">미정</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmedTeam({ name }: { name: string }) {
  const url = teamFlagUrl(name, 40);
  return (
    <div className="flex items-center gap-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          aria-hidden
          className="h-4 w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-black/5"
        />
      ) : (
        <span className="inline-block h-4 w-6 shrink-0 rounded-[2px] bg-surface" />
      )}
      <span className="text-sm font-semibold">{teamKo(name)}</span>
    </div>
  );
}

function ConfirmedBracket({ matches }: { matches: BMatch[] }) {
  const confirmed = matches.filter(
    (m) => m.side1.locked && m.side2.locked && m.side1.name && m.side2.name,
  );

  if (confirmed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted">
        아직 자리가 확정된 32강 대진이 없습니다.
        <br />
        <span className="text-xs">
          조별리그가 끝난 조의 1·2위가 정해지면 여기에 표시됩니다.
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {confirmed.map((m) => (
        <div
          key={m.id}
          className="rounded-xl border bg-[var(--color-card)] p-3"
        >
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
            <span className="font-semibold">32강</span>
            {m.kickoff ? <span className="tnum">{kstDate(m.kickoff)}</span> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <ConfirmedTeam name={m.side1.name!} />
            <span className="pl-1 text-[10px] font-bold text-muted">VS</span>
            <ConfirmedTeam name={m.side2.name!} />
          </div>
        </div>
      ))}
    </div>
  );
}

type Tab = "confirmed" | "projected";

export function BracketView({ bracket }: { bracket: ProjectedBracket }) {
  const r32 = bracket.rounds[0]?.matches ?? [];
  const confirmedCount = r32.filter(
    (m) => m.side1.locked && m.side2.locked && m.side1.name && m.side2.name,
  ).length;
  const [tab, setTab] = useState<Tab>(
    confirmedCount > 0 ? "confirmed" : "projected",
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "confirmed", label: `확정 대진${confirmedCount ? ` ${confirmedCount}` : ""}` },
    { id: "projected", label: "예상 대진" },
  ];

  return (
    <div>
      <div className="mb-3 inline-flex gap-1 rounded-lg border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-[var(--color-card)] text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "confirmed" ? (
        <ConfirmedBracket matches={r32} />
      ) : (
        <FullBracket bracket={bracket} />
      )}
    </div>
  );
}
