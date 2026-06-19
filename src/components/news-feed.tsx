import type { NewsItem } from "@/lib/feeds";
import { IconExternal } from "./icons";

function relTime(s: string): string {
  const t = Date.parse(s);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
      {source}
    </span>
  );
}

export function NewsFeed({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted">
        뉴스를 불러오지 못했습니다.
      </div>
    );
  }

  const [featured, ...rest] = items;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 대표 기사 */}
      <a
        href={featured.link}
        target="_blank"
        rel="noopener noreferrer"
        className="lift group flex flex-col overflow-hidden rounded-xl border bg-[var(--color-card)]"
      >
        {featured.image && (
          <div className="relative aspect-[16/9] overflow-hidden bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.image}
              alt=""
              aria-hidden
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="flex items-center gap-2">
            <SourceBadge source={featured.source} />
            <span className="text-[11px] text-muted tnum">
              {relTime(featured.published)}
            </span>
          </div>
          <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
            {featured.title}
          </h3>
          {featured.snippet && (
            <p className="line-clamp-2 text-xs text-muted">{featured.snippet}</p>
          )}
        </div>
      </a>

      {/* 나머지 목록 */}
      <ul className="flex flex-col divide-y rounded-xl border bg-[var(--color-card)]">
        {rest.map((n) => (
          <li key={n.title}>
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 transition-colors hover:bg-surface/60"
            >
              {n.image ? (
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-surface text-muted">
                  <IconExternal width={18} height={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-[13px] font-medium leading-snug transition-colors group-hover:text-primary">
                  {n.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                  <span>{n.source}</span>
                  <span aria-hidden>·</span>
                  <span className="tnum">{relTime(n.published)}</span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
