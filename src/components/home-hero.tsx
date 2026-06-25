"use client";

import { useEffect, useState } from "react";
import { Flag, TeamLabel } from "./ui";
import { HERO_VIDEO } from "@/lib/site";
import { kstDateTime } from "@/lib/format";

interface NextMatch {
  team1: string;
  team2: string;
  kickoff: number | null;
  ground: string;
  group: string;
}

interface LastMatch {
  team1: string;
  team2: string;
  score: [number, number];
}

export interface HomeHeroProps {
  koreaGroup: string;
  nextMatch?: NextMatch;
  lastMatch?: LastMatch;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(target: number | null) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || !now) return null;
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: diff === 0,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-2xl font-bold tabular-nums text-white md:text-3xl">
        {pad(value)}
      </span>
      <span className="text-[10px] font-medium text-white/50">{label}</span>
    </div>
  );
}

export function HomeHero({ koreaGroup, nextMatch, lastMatch }: HomeHeroProps) {
  const countdown = useCountdown(nextMatch?.kickoff ?? null);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    setMotionOk(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <section className="hero">
      <div className="hero-media">
        <video
          className="hero-bg-video"
          autoPlay={motionOk}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="hero-overlay" aria-hidden />

        <div className="hero-body">
          {nextMatch && countdown && !countdown.done && (
            <div className="mb-4 text-center">
              <p className="mb-2 text-[11px] font-semibold text-white/55">
                다음 경기까지 · {koreaGroup}조
              </p>
              <div className="inline-flex items-start gap-2 md:gap-3">
                <CountdownUnit value={countdown.days} label="일" />
                <span className="pt-1 font-light text-white/30">:</span>
                <CountdownUnit value={countdown.hours} label="시" />
                <span className="pt-1 font-light text-white/30">:</span>
                <CountdownUnit value={countdown.minutes} label="분" />
                <span className="pt-1 font-light text-white/30">:</span>
                <CountdownUnit value={countdown.seconds} label="초" />
              </div>
            </div>
          )}

          {nextMatch ? (
            <div className="rounded-xl border border-white/15 bg-black/45 px-4 py-4 backdrop-blur-sm md:px-5 md:py-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-white/85">
                  <span className="pulse-dot size-1.5 rounded-full bg-[var(--color-kor-red)]" />
                  다음 경기
                </span>
                {nextMatch.kickoff && (
                  <time
                    dateTime={new Date(nextMatch.kickoff).toISOString()}
                    className="text-white/50 tnum"
                  >
                    {kstDateTime(nextMatch.kickoff)}
                  </time>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 md:gap-8">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <Flag name={nextMatch.team1} size={44} />
                  <TeamLabel
                    name={nextMatch.team1}
                    bold
                    className="max-w-[7rem] justify-center text-center text-sm text-white"
                  />
                </div>
                <span className="shrink-0 font-mono text-lg font-bold text-white/30 md:text-xl">
                  VS
                </span>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <Flag name={nextMatch.team2} size={44} />
                  <TeamLabel
                    name={nextMatch.team2}
                    bold
                    className="max-w-[7rem] justify-center text-center text-sm text-white"
                  />
                </div>
              </div>
              {nextMatch.ground && (
                <p className="mt-3 text-center text-xs text-white/45">{nextMatch.ground}</p>
              )}
            </div>
          ) : lastMatch ? (
            <div className="rounded-xl border border-white/15 bg-black/45 px-4 py-5 text-center backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-white/45">최근 경기</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-lg font-bold text-white">
                <TeamLabel name={lastMatch.team1} className="flex-row-reverse text-white" />
                <span className="font-mono text-2xl tnum text-[var(--color-kor-red)]">
                  {lastMatch.score[0]} : {lastMatch.score[1]}
                </span>
                <TeamLabel name={lastMatch.team2} className="text-white" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
