/**
 * 그라데이션 "26" 로고 PNG 생성 → public/logo/
 * 실행: npx tsx scripts/generate-logo.ts
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "logo");

function badgeSvg(size: number, fontSize: number, radius: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e63946"/>
      <stop offset="100%" stop-color="#457b9d"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff"
    font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="800">26</text>
</svg>`;
}

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0a0e"/>
      <stop offset="45%" stop-color="#3d0f1f"/>
      <stop offset="100%" stop-color="#0f1a2e"/>
    </linearGradient>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e63946"/>
      <stop offset="100%" stop-color="#457b9d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="72" y="64" width="56" height="56" rx="14" fill="url(#g)"/>
  <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" fill="#fff"
    font-family="system-ui,sans-serif" font-size="22" font-weight="700">26</text>
  <text x="144" y="100" dominant-baseline="middle" fill="#fff"
    font-family="system-ui,sans-serif" font-size="28" font-weight="600" opacity="0.9">월드컵 경우의수</text>
  <text x="72" y="280" fill="#fff" font-family="system-ui,sans-serif" font-size="56" font-weight="800">월드컵 경우의수</text>
  <text x="72" y="340" fill="#fff" font-family="system-ui,sans-serif" font-size="28" opacity="0.82">2026 FIFA 월드컵 조별리그 진출 경우의 수 · 한국 32강 시나리오</text>
  <text x="72" y="560" fill="#fff" font-family="system-ui,sans-serif" font-size="22" opacity="0.55">경기 · 시나리오 · 대진표 · 팀 정보</text>
</svg>`;

const BADGES: { file: string; size: number; fontSize: number; radius: number }[] = [
  { file: "icon-32.png", size: 32, fontSize: 14, radius: 8 },
  { file: "icon-192.png", size: 192, fontSize: 84, radius: 48 },
  { file: "logo-56.png", size: 56, fontSize: 22, radius: 14 },
  { file: "logo-128.png", size: 128, fontSize: 50, radius: 28 },
  { file: "logo-512.png", size: 512, fontSize: 200, radius: 112 },
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  for (const b of BADGES) {
    const buf = Buffer.from(badgeSvg(b.size, b.fontSize, b.radius));
    await sharp(buf).png().toFile(path.join(OUT, b.file));
    console.log(`✓ ${b.file}`);
  }

  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(OUT, "og-image.png"));
  console.log("✓ og-image.png");

  await fs.writeFile(path.join(OUT, "logo.svg"), badgeSvg(512, 200, 112), "utf8");
  console.log("✓ logo.svg");

  console.log(`\n저장 위치: public/logo/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
