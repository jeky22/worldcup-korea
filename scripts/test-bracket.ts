import { promises as fs } from "node:fs";
import { normalize, OPENFOOTBALL_URL, type RawData } from "../src/lib/normalize";
import { projectBracket, koreaKnockout } from "../src/lib/bracket";
import { teamKo, KOREA } from "../src/lib/teams";

async function load() {
  try {
    const raw = JSON.parse(
      await fs.readFile("data/cache/worldcup.json", "utf8"),
    );
    if (Array.isArray(raw.matches)) return raw.matches;
    return normalize(raw as RawData);
  } catch {
    const res = await fetch(OPENFOOTBALL_URL);
    return normalize((await res.json()) as RawData);
  }
}

async function main() {
  const matches = await load();

  console.log("=== 한국 32강 상대 분석 ===");
  for (const b of koreaKnockout(matches)) {
    console.log(`\n[${b.verbKo}]`);
    for (const s of b.ranks) {
      const m = s.match;
      const opp = m
        ? `${m.opponentLabel} (${m.candidates.map((c) => `${teamKo(c.name)} ${c.fifaRank}위`).join(", ")})`
        : "-";
      console.log(`  ${s.rank}위 · ${s.result} → ${opp}${m?.ground ? ` @ ${m.ground}` : ""}`);
    }
  }

  console.log("\n=== 한국 우승 시나리오 대진 ===");
  const br = projectBracket(matches, { favor: KOREA });
  for (const r of br.rounds) {
    console.log(`\n[${r.label}]`);
    for (const m of r.matches) {
      const t1 = m.side1.name ? teamKo(m.side1.name) : m.side1.label;
      const t2 = m.side2.name ? teamKo(m.side2.name) : m.side2.label;
      const w = m.winner ? teamKo(m.winner) : "?";
      console.log(`  ${t1} vs ${t2} → ${w}${m.hasKorea ? "  <한국>" : ""}`);
    }
  }
  console.log(`\n우승 예측: ${br.champion ? teamKo(br.champion) : "?"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
