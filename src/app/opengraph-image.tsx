import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #1a0a0e 0%, #3d0f1f 45%, #0f1a2e 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #e63946, #457b9d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            26
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, opacity: 0.9 }}>{SITE_NAME}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }}>
            월드컵 경우의수
          </div>
          <div style={{ fontSize: 28, opacity: 0.82, maxWidth: 900, lineHeight: 1.4 }}>
            2026 FIFA 월드컵 조별리그 진출 경우의 수 · 한국 32강 시나리오
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.55 }}>경기 · 시나리오 · 대진표 · 팀 정보</div>
      </div>
    ),
    { ...size },
  );
}
