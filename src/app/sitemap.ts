import type { MetadataRoute } from "next";
import { TEAMS } from "@/lib/teams";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/matches"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/scenario"), lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: absoluteUrl("/bracket"), lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: absoluteUrl("/teams"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const teamPages: MetadataRoute.Sitemap = TEAMS.map((t) => ({
    url: absoluteUrl(`/teams/${t.code}`),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: t.code === "KOR" ? 0.9 : 0.65,
  }));

  return [...staticPages, ...teamPages];
}
