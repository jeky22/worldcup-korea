import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface SquadPlayer {
  no: number | null;
  pos: string;
  name: string;
  age: number | null;
  caps: number | null;
  goals: number | null;
  club: string;
}
export interface SquadsFile {
  fetchedAt: string;
  source: string;
  teams: Record<string, SquadPlayer[]>;
}

const SQUADS_FILE = path.join(process.cwd(), "data", "cache", "squads.json");

let cache: SquadsFile | null = null;

export async function getSquads(): Promise<SquadsFile | null> {
  if (cache) return cache;
  try {
    const txt = await fs.readFile(SQUADS_FILE, "utf8");
    cache = JSON.parse(txt) as SquadsFile;
    return cache;
  } catch {
    return null;
  }
}

export async function getSquad(team: string): Promise<SquadPlayer[] | null> {
  const all = await getSquads();
  return all?.teams[team] ?? null;
}

const POS_ORDER: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 };

export function sortSquad(players: SquadPlayer[]): SquadPlayer[] {
  return [...players].sort((a, b) => {
    const pa = POS_ORDER[a.pos] ?? 9;
    const pb = POS_ORDER[b.pos] ?? 9;
    if (pa !== pb) return pa - pb;
    return (a.no ?? 99) - (b.no ?? 99);
  });
}
