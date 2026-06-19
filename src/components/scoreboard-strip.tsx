"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Match } from "@/lib/types";
import { teamCode, teamFlagUrl, teamKo, KOREA } from "@/lib/teams";
import { kstDate, kstTime } from "@/lib/format";

function MiniFlag({ name }: { name: string }) {
  const url = teamFlagUrl(name, 40);
  if (!url) return <span className="inline-block h-3.5 w-5 rounded-[2px] bg-surface" />;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt=""
      aria-hidden
      className="h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-black/5"
      loading="lazy"
    />
  );
}

function Side({
  name,
  label,
  score,
  win,
}: {
  name: string;
  label: string | null;
  score: number | null;
  win: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 ${win ? "font-bold" : ""}`}>
      <span className="flex min-w-0 items-center gap-1.5">
        {name ? <MiniFlag name={name} /> : null}
        <span
          className={`truncate text-sm ${name === KOREA ? "text-primary" : ""}`}
        >
          {name ? teamCode(name) : label ?? "미정"}
        </span>
      </span>
      {score != null ? (
        <span className="font-mono text-sm tnum">{score}</span>
      ) : null}
    </div>
  );
}

export function ScoreboardStrip({ matches }: { matches: Match[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const now = Date.now();

  const finished = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => (b.kickoff ?? 0) - (a.kickoff ?? 0))
    .slice(0, 5)
    .reverse();
  const upcoming = matches
    .filter((m) => m.status !== "finished" && (m.team1 || m.team1Label))
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0))
    .slice(0, 10);
  const window = [...finished, ...upcoming];

  const scroll = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {window.map((m) => {
          const fin = m.status === "finished";
          const s = m.score;
          const isNext = !fin && m === upcoming[0];
          const label =
            m.stage === "group" ? `${m.group}조` : "토너먼트";
          return (
            <div
              key={m.id}
              className={`relative flex w-40 shrink-0 snap-start flex-col gap-1.5 rounded-lg border bg-[var(--color-bg)] p-2.5 transition-colors hover:bg-surface ${
                isNext ? "border-primary/40" : ""
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>{label}</span>
                <span className="tnum">
                  {fin ? "종료" : `${kstDate(m.kickoff)} ${kstTime(m.kickoff)}`}
                </span>
              </div>
              <Side
                name={m.team1}
                label={m.team1Label}
                score={s ? s[0] : null}
                win={!!s && s[0] > s[1]}
              />
              <Side
                name={m.team2}
                label={m.team2Label}
                score={s ? s[1] : null}
                win={!!s && s[1] > s[0]}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="이전"
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-1/2 hidden size-7 -translate-y-1/2 place-items-center rounded-full border bg-[var(--color-bg)] text-muted shadow-sm transition-colors hover:text-ink md:grid"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="다음"
        onClick={() => scroll(1)}
        className="absolute -right-3 top-1/2 hidden size-7 -translate-y-1/2 place-items-center rounded-full border bg-[var(--color-bg)] text-muted shadow-sm transition-colors hover:text-ink md:grid"
      >
        ›
      </button>
    </div>
  );
}
