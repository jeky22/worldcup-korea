import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
  isIndexable,
} from "./site";

type PageMetaInput = {
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  keywords,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} · ${SITE_NAME}`;
  const index = !noIndex && isIndexable();

  return {
    title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false },
  };
}

export function rootMetadata(): Metadata {
  const index = isIndexable();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: absoluteUrl("/"),
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false },
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    inLanguage: "ko-KR",
  };
}

export function sportsEventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "2026 FIFA World Cup",
    alternateName: "2026 FIFA 월드컵",
    sport: "Soccer",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
    eventStatus: "https://schema.org/EventScheduled",
    location: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Mexico" },
    ],
    organizer: {
      "@type": "SportsOrganization",
      name: "FIFA",
      url: "https://www.fifa.com",
    },
    url: absoluteUrl("/"),
  };
}

export function sportsTeamJsonLd(name: string, code: string, group: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name,
    sport: "Soccer",
    memberOf: {
      "@type": "SportsEvent",
      name: "2026 FIFA World Cup",
    },
    url: absoluteUrl(`/teams/${code}`),
    description: `2026 FIFA 월드컵 ${group}조 ${name} — 명단, 일정, 조별리그 순위`,
  };
}
