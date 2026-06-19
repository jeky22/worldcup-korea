import "server-only";

/* ---------- 공통 유틸 ---------- */

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x?[0-9a-fA-F]+;/g, (m) => {
      const hex = /&#x/i.test(m);
      const code = parseInt(m.replace(/&#x?|;/gi, ""), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : m;
    })
    .replace(/&amp;/g, "&")
    .trim();
}

function pick(block: string, tag: string): string | null {
  const m = block.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return m ? decodeEntities(m[1]) : null;
}

async function fetchText(url: string, revalidate = 1800): Promise<string | null> {
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 8000);
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { "user-agent": "Mozilla/5.0 (worldcup-hub)" },
      next: { revalidate, tags: ["feeds"] },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/* ---------- 유튜브 하이라이트 ---------- */

export interface VideoItem {
  id: string;
  title: string;
  published: string;
  thumb: string;
}

// FIFA 공식 채널
const YT_FEEDS = [
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCpcTrCXblq78GZrTUTLWeBw",
];

export async function getHighlightVideos(limit = 6): Promise<VideoItem[]> {
  const out: VideoItem[] = [];
  for (const url of YT_FEEDS) {
    const xml = await fetchText(url, 1800);
    if (!xml) continue;
    const entries = xml.split("<entry>").slice(1);
    for (const e of entries) {
      const id = e.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)?.[1]?.trim();
      const title = pick(e, "title");
      const published = pick(e, "published") ?? "";
      if (!id || !title) continue;
      out.push({
        id,
        title,
        published,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
    }
  }
  // 월드컵 관련 우선 정렬
  const wc = (t: string) => /world cup|2026|월드컵/i.test(t);
  out.sort((a, b) => {
    const w = Number(wc(b.title)) - Number(wc(a.title));
    if (w !== 0) return w;
    return b.published.localeCompare(a.published);
  });
  // 중복 제거
  const seen = new Set<string>();
  return out.filter((v) => !seen.has(v.id) && seen.add(v.id)).slice(0, limit);
}

/* ---------- 뉴스 (이미지 포함 RSS) ---------- */

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  published: string;
  image: string | null;
  snippet: string | null;
}

const NEWS_FEEDS: { url: string; source: string }[] = [
  { url: "https://www.yna.co.kr/rss/sports.xml", source: "연합뉴스" },
  { url: "https://rss.donga.com/sports.xml", source: "동아일보" },
];

const NEWS_KEYWORDS =
  /월드컵|축구|FIFA|손흥민|이강인|김민재|황희찬|이재성|황인범|오현규|설영우|벤투|홍명보|A매치|조별리그|16강|32강|북중미/i;

function firstImage(block: string): string | null {
  const media =
    block.match(/<media:content[^>]*url="([^"]+)"/i)?.[1] ??
    block.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] ??
    block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i)?.[1] ??
    block.match(/<enclosure[^>]*url="([^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1];
  return media ?? null;
}

export async function getNews(limit = 6): Promise<NewsItem[]> {
  const all: NewsItem[] = [];
  for (const { url, source } of NEWS_FEEDS) {
    const xml = await fetchText(url, 1800);
    if (!xml) continue;
    const items = xml.split(/<item>/i).slice(1);
    for (const it of items) {
      const title = pick(it, "title");
      const link = pick(it, "link");
      const pub = pick(it, "pubDate") ?? "";
      if (!title || !link) continue;
      const snippet = pick(it, "description");
      all.push({
        title,
        link,
        source,
        published: pub,
        image: firstImage(it),
        snippet: snippet ? snippet.replace(/<[^>]+>/g, "").slice(0, 90) : null,
      });
    }
  }

  const ts = (s: string) => {
    const t = Date.parse(s);
    return Number.isNaN(t) ? 0 : t;
  };
  const isRelevant = (n: NewsItem) =>
    NEWS_KEYWORDS.test(n.title) || NEWS_KEYWORDS.test(n.snippet ?? "");

  const seen = new Set<string>();
  const deduped = all.filter((n) => !seen.has(n.title) && seen.add(n.title));

  // 관련도 → 이미지 보유 → 최신 순
  deduped.sort((a, b) => {
    const rel = Number(isRelevant(b)) - Number(isRelevant(a));
    if (rel !== 0) return rel;
    const img = Number(!!b.image) - Number(!!a.image);
    if (img !== 0) return img;
    return ts(b.published) - ts(a.published);
  });

  // 월드컵·축구 관련 기사가 충분하면 그것만, 아니면 전체로 보충
  const relevant = deduped.filter(isRelevant);
  const pool = relevant.length >= limit ? relevant : deduped;
  return pool.slice(0, limit);
}
