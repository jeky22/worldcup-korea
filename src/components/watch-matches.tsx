"use client";

import { useEffect, useState } from "react";
import { Flag } from "./ui";
import { WatchLinks } from "./watch-links";
import { teamKo } from "@/lib/teams";
import { kstDateTime } from "@/lib/format";
import type { WatchMatch } from "@/lib/scenario/watch-matches";
import { describeDanger } from "@/lib/scenario/danger-text";

export type { WatchMatch };

function useNow(active: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Countdown({ target, now }: { target: number; now: number }) {
  if (!now) {
    return <span className="font-mono text-sm tabular-nums text-muted">--:--:--</span>;
  }
  const diff = target - now;
  if (diff <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-kor-red)]">
        <span className="pulse-dot size-1.5 rounded-full bg-[var(--color-kor-red)]" />
        진행 중
      </span>
    );
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return (
    <span className="font-mono text-base font-bold tabular-nums text-ink">
      {days > 0 && <span className="text-[var(--color-kor-gold)]">D-{days} </span>}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

function MatchCard({ m, now }: { m: WatchMatch; now: number }) {
  const upcoming = m.kickoff != null && m.kickoff - now > 0;
  const danger = describeDanger(m);
  return (
    <div className="flex min-w-[15rem] flex-1 flex-col gap-2.5 rounded-xl border border-[var(--color-kor-red)]/15 bg-[var(--color-card)] p-3.5">
      <div className="flex items-center justify-between">
        <span className="rounded bg-[var(--color-kor-red-soft)]/60 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-kor-red)]">
          {m.group}조
        </span>
        {m.kickoff != null && (
          <Countdown target={m.kickoff} now={now} />
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <span className="truncate text-sm font-semibold">{teamKo(m.team1)}</span>
          <Flag name={m.team1} size={20} />
        </div>
        <span className="shrink-0 font-mono text-xs font-bold text-muted">VS</span>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Flag name={m.team2} size={20} />
          <span className="truncate text-sm font-semibold">{teamKo(m.team2)}</span>
        </div>
      </div>

      <div className="rounded-lg bg-[var(--color-kor-red-soft)]/40 px-2.5 py-1.5">
        <p className="text-xs text-muted">
          ⚠ <span className="font-semibold text-[var(--color-kor-red)]">{danger.lead}</span>
          {danger.tail}
        </p>
      </div>

      {m.kickoff != null && (
        <p className="text-[11px] tabular-nums text-muted">
          {upcoming ? kstDateTime(m.kickoff) : "오늘 진행"}
        </p>
      )}
    </div>
  );
}

export function WatchMatches({ matches }: { matches: WatchMatch[] }) {
  const hasUpcoming = matches.some(
    (m) => m.kickoff != null,
  );
  const now = useNow(hasUpcoming);

  if (matches.length === 0) return null;

  return (
    <div
      id="watch"
      className="scroll-mt-20 rounded-2xl border border-[var(--color-kor-red)]/15 bg-[var(--color-kor-red-soft)]/15 p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-kor-red)]">
            주목 경기 · 한국 운명 좌우
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">
            이 경기 결과에 따라 3위 경쟁국이 한국을 제치고 올라가면 한국이 와일드카드에서 밀려 탈락할 수 있어요
          </p>
        </div>
        <WatchLinks />
      </div>

      <div className="flex flex-wrap gap-2.5">
        {matches.map((m) => (
          <MatchCard key={`${m.group}-${m.team1}-${m.team2}`} m={m} now={now} />
        ))}
      </div>
    </div>
  );
}
