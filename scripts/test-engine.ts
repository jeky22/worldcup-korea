import { normalize, OPENFOOTBALL_URL, type RawData } from "../src/lib/normalize";
import { computeStandings } from "../src/lib/standings";
import { analyzeGroup, focusBranches } from "../src/lib/scenario/engine";
import { thirdPlaceTable } from "../src/lib/scenario/third-place";
import { teamKo, KOREA } from "../src/lib/teams";

async function main() {
  const res = await fetch(OPENFOOTBALL_URL);
  const raw = (await res.json()) as RawData;
  const matches = normalize(raw);

  console.log("=== Group A 현재 순위 ===");
  for (const r of computeStandings(matches, "A")) {
    console.log(
      `${r.rank}. ${teamKo(r.team).padEnd(10)} ${r.played}경기 ${r.points}점 (${r.win}승${r.draw}무${r.loss}패, ${r.gf}-${r.ga}, GD ${r.gd})`,
    );
  }

  console.log("\n=== Group A 시나리오 ===");
  const sc = analyzeGroup(matches, "A");
  console.log(`남은 경기: ${sc.remaining.length}, 경우의 수: ${sc.totalCombos}, cap ${sc.goalCap}, exact ${sc.exact}`);
  for (const t of sc.teams) {
    console.log(
      `${teamKo(t.team).padEnd(10)} ${t.status.padEnd(18)} 직행 ${(t.advanceRate * 100).toFixed(0)}% / 3위 ${(t.thirdRate * 100).toFixed(0)}% / 탈락 ${(t.outRate * 100).toFixed(0)}%`,
    );
  }

  console.log(`\n=== 한국(${teamKo(KOREA)}) 분기 ===`);
  for (const b of focusBranches(matches, "A", KOREA)) {
    console.log(`[${b.ownLabel}] → ${b.verdict} (${b.outcomes.join(",")})`);
    for (const c of b.conditions) {
      const parts = c.parts
        .map((p) => `${p.team1} vs ${p.team2}:${p.result}`)
        .join(" / ");
      console.log(`   - 다른경기 ${parts} → ${c.outcome.join(",")}`);
    }
  }

  console.log("\n=== 3위 와일드카드 현재 순위 (상위 8 진출) ===");
  for (const r of thirdPlaceTable(matches)) {
    console.log(
      `${String(r.rank).padStart(2)}. [${r.group}] ${teamKo(r.team).padEnd(12)} ${r.played}경기 ${r.points}점 GD ${r.gd} ${r.qualifies ? "✓진출" : "✗"}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
