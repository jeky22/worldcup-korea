import { adsTxtContent } from "@/lib/ads";

export function GET() {
  const body = adsTxtContent();
  if (!body) {
    return new Response("Not configured", { status: 404 });
  }
  return new Response(body + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
