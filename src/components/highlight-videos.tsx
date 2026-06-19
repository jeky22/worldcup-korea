"use client";

import { useState } from "react";
import type { VideoItem } from "@/lib/feeds";
import { IconPlay, IconExternal } from "./icons";

function relTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "방금";
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

function VideoCard({ v }: { v: VideoItem }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="overflow-hidden rounded-xl border bg-black">
        <div className="relative aspect-video">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
            title={v.title}
            allow="accelerated-sensors; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="lift group block overflow-hidden rounded-xl border bg-[var(--color-bg)] text-left"
    >
      <div className="relative aspect-video overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.thumb}
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
          <IconPlay width={20} height={20} className="translate-x-px" />
        </span>
        {v.published && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white tnum">
            {relTime(v.published)}
          </span>
        )}
      </div>
      <p className="line-clamp-2 px-3 py-2.5 text-[13px] font-medium leading-snug">
        {v.title}
      </p>
    </button>
  );
}

export function HighlightVideos({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted">
        하이라이트 영상을 불러오지 못했습니다.
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>
      <a
        href="https://www.youtube.com/@FIFA/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-primary"
      >
        FIFA 공식 채널에서 더 보기
        <IconExternal width={13} height={13} />
      </a>
    </div>
  );
}
