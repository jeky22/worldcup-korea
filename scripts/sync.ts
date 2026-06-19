import { promises as fs } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { normalize, OPENFOOTBALL_URL, type RawData } from "../src/lib/normalize";
import { TEAMS } from "../src/lib/teams";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z]/g, "");
}

const ALIASES: Record<string, string> = {
  // wikipedia heading (normalized) -> openfootball name
  unitedstates: "USA",
  turkiye: "Turkey",
  turkey: "Turkey",
  bosniaandherzegovina: "Bosnia & Herzegovina",
};

const TEAM_BY_NORM = new Map(TEAMS.map((t) => [norm(t.name), t.name]));

function resolveTeam(heading: string): string | null {
  const n = norm(heading);
  if (ALIASES[n]) return ALIASES[n];
  if (TEAM_BY_NORM.has(n)) return TEAM_BY_NORM.get(n)!;
  return null;
}

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

function parsePos(raw: string): string {
  const m = raw.match(/(GK|DF|MF|FW)/);
  return m ? m[1] : raw.replace(/^\d+/, "").trim();
}

function parseAge(raw: string): number | null {
  const m = raw.match(/aged?\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

function intOrNull(raw: string): number | null {
  const m = raw.replace(/,/g, "").match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

async function syncMatches() {
  const res = await fetch(OPENFOOTBALL_URL);
  if (!res.ok) throw new Error(`openfootball ${res.status}`);
  const raw = (await res.json()) as RawData;
  const dataset = {
    matches: normalize(raw),
    fetchedAt: new Date().toISOString(),
    source: "openfootball",
  };
  await fs.writeFile(
    path.join(CACHE_DIR, "worldcup.json"),
    JSON.stringify(dataset),
    "utf8",
  );
  console.log(`✓ matches: ${dataset.matches.length}`);
}

async function syncSquads() {
  const url =
    "https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup_squads&format=json&prop=text&formatversion=2";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`wikipedia ${res.status}`);
  const data = (await res.json()) as { parse: { text: string } };
  const $ = cheerio.load(data.parse.text);

  const teams: Record<string, SquadPlayer[]> = {};

  $("h3").each((_, el) => {
    const heading = $(el).text().replace(/\[edit\]/gi, "").trim();
    const team = resolveTeam(heading);
    if (!team) return;
    let tbl = $(el).closest(".mw-heading").nextAll("table").first();
    if (!tbl.length) tbl = $(el).nextAll("table").first();
    if (!tbl.length) return;

    const players: SquadPlayer[] = [];
    tbl.find("tr").each((i, tr) => {
      if (i === 0) return; // header
      const cells = $(tr)
        .find("td,th")
        .map((_, c) => $(c).text().replace(/\s+/g, " ").trim())
        .get();
      if (cells.length < 7) return;
      const [no, pos, name, dob, caps, goals, club] = cells;
      if (!name) return;
      players.push({
        no: intOrNull(no),
        pos: parsePos(pos),
        name,
        age: parseAge(dob),
        caps: intOrNull(caps),
        goals: intOrNull(goals),
        club,
      });
    });
    if (players.length > 0) teams[team] = players;
  });

  const file: SquadsFile = {
    fetchedAt: new Date().toISOString(),
    source: "Wikipedia: 2026 FIFA World Cup squads",
    teams,
  };
  await fs.writeFile(
    path.join(CACHE_DIR, "squads.json"),
    JSON.stringify(file),
    "utf8",
  );
  const count = Object.keys(teams).length;
  console.log(`✓ squads: ${count}/48 teams`);
  if (count < 48) {
    const missing = TEAMS.filter((t) => !teams[t.name]).map((t) => t.name);
    console.log(`  누락: ${missing.join(", ")}`);
  }
}

async function main() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await syncMatches();
  await syncSquads();
  console.log("동기화 완료");
}

main().catch((e) => {
  console.error("동기화 실패:", e.message);
  process.exit(1);
});
