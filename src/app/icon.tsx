import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #e63946, #457b9d)",
          color: "white",
          fontSize: 14,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        26
      </div>
    ),
    { ...size },
  );
}
