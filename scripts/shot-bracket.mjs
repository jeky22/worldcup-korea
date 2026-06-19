import { chromium } from "playwright";

const b = await chromium.launch();
for (const vp of [
  { w: 1100, h: 1000, tag: "desktop", dsf: 1 },
  { w: 420, h: 900, tag: "mobile", dsf: 2 },
]) {
  const p = await b.newPage({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.dsf,
  });
  await p.goto("http://localhost:3000/bracket", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  // 시뮬레이션 초기(32강 단계)
  await p.waitForTimeout(600);
  await p.screenshot({ path: `shots/bracket-mid-${vp.tag}.png`, fullPage: true });
  // 시뮬레이션 완료(우승까지)
  await p.waitForTimeout(6000);
  await p.screenshot({ path: `shots/bracket-done-${vp.tag}.png`, fullPage: true });
  console.log(`bracket-${vp.tag}: ok`);
  await p.close();
}
await b.close();
