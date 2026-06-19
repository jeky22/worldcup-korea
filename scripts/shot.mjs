import { chromium } from "playwright";

const targets = [
  { url: "/", name: "home" },
  { url: "/bracket", name: "bracket" },
  { url: "/scenario", name: "scenario" },
];

const b = await chromium.launch();
for (const t of targets) {
  for (const vp of [
    { w: 420, h: 900, tag: "mobile", dsf: 2 },
    { w: 1100, h: 900, tag: "desktop", dsf: 1 },
  ]) {
    const p = await b.newPage({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: vp.dsf,
    });
    try {
      const res = await p.goto(`http://localhost:3000${t.url}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      // 스크롤하여 진입 애니메이션(IntersectionObserver) 모두 트리거
      await p.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y <= h; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await p.waitForTimeout(800);
      await p.screenshot({
        path: `shots/${t.name}-${vp.tag}.png`,
        fullPage: true,
      });
      console.log(`${t.name}-${vp.tag}: ${res?.status()}`);
    } catch (e) {
      console.log(`${t.name}-${vp.tag}: ERROR ${e.message}`);
    }
    await p.close();
  }
}
await b.close();
