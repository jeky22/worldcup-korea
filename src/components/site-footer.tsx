import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)]/70">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-6">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/about" className="transition-colors hover:text-ink">
            사이트 소개
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-ink">
            개인정보처리방침
          </Link>
          <Link href="/next" className="transition-colors hover:text-ink">
            다음 대회
          </Link>
        </nav>
        <p>
          © 2026 {SITE_NAME} · FIFA와 무관한 비공식 팬 사이트
        </p>
      </div>
    </footer>
  );
}
