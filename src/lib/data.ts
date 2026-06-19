import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Dataset, GroupId, Match } from "./types";
import { normalize, OPENFOOTBALL_URL, type RawData } from "./normalize";

const CACHE_FILE = path.join(process.cwd(), "data", "cache", "worldcup.json");

async function readCache(): Promise<Dataset | null> {
  try {
    const txt = await fs.readFile(CACHE_FILE, "utf8");
    return JSON.parse(txt) as Dataset;
  } catch {
    return null;
  }
}

/**
 * Live fetch from openfootball (revalidated hourly), with on-disk snapshot fallback.
 * Never returns fabricated data — throws if no real source is available.
 */
export async function getDataset(): Promise<Dataset> {
  try {
    const res = await fetch(OPENFOOTBALL_URL, {
      next: { revalidate: 3600, tags: ["worldcup"] },
    });
    if (!res.ok) throw new Error(`openfootball ${res.status}`);
    const raw = (await res.json()) as RawData;
    return {
      matches: normalize(raw),
      fetchedAt: new Date().toISOString(),
      source: "openfootball",
    };
  } catch (err) {
    const cached = await readCache();
    if (cached) return cached;
    throw new Error(
      `실데이터 로드 실패: openfootball 접근 불가, 캐시 없음 (${(err as Error).message})`,
    );
  }
}

export function groupMatches(matches: Match[], group: GroupId): Match[] {
  return matches
    .filter((m) => m.group === group)
    .sort((a, b) => (a.kickoff ?? 0) - (b.kickoff ?? 0));
}
