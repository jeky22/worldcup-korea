"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/lib/types";
import { GROUP_IDS } from "@/lib/teams";
import { kstDate } from "@/lib/format";
import { MatchRow } from "./match-list";

type Filter = "all" | "ko" | "knockout" | `g-${string}`;

const STAGE_KO: Record<string, string> = {
  "round-of-32": "32강",
  "round-of-16": "16강",
  "quarter-final": "8강",
  "semi-final": "준결승",
  "third-place": "3·4위전",
  final: "결승",
};

export function MatchesBrowser({
  matches,
  korea,
}: {
  matches: Match[];
  korea: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = matches;
    if (filter === "ko") {
      list = matches.filter((m) => m.team1 === korea || m.team2 === korea);
    } else if (filter === "knockout") {
      list = matches.filter((m) => m.stage !== "group");
    } else if (filter.startsWith("g-")) {
      const g = filter.slice(2);
      list = matches.filter((m) => m.group === g);
    }
    return [...list].sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0));
  }, [matches, filter, korea]);

  // 날짜별 그룹
  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = kstDate(m.kickoff);
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  const chip = (key: Filter, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setFilter(key)}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        filter === key
          ? "bg-primary text-[var(--color-on-primary)]"
          : "bg-surface text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {chip("all", "전체")}
        {chip("ko", "🇰🇷 한국")}
        {GROUP_IDS.map((g) => chip(`g-${g}` as Filter, `${g}조`))}
        {chip("knockout", "토너먼트")}
      </div>

      {byDate.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">해당 경기가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {byDate.map(([date, list]) => (
            <section key={date}>
              <h3 className="mb-1 text-sm font-semibold text-muted">{date}</h3>
              <div>
                {list.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="hidden w-12 shrink-0 text-xs text-muted sm:block">
                      {m.stage === "group" ? `${m.group}조` : STAGE_KO[m.stage]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <MatchRow match={m} hideDate />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
