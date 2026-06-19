import Link from "next/link";
import { teamKo, teamFlagUrl, teamCode, KOREA } from "@/lib/teams";
import type { Outcome } from "@/lib/scenario/engine";

export function Flag({ name, size = 18 }: { name: string; size?: number }) {
  const url = teamFlagUrl(name, 40);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden
      width={Math.round(size * 1.5)}
      height={size}
      className="inline-block shrink-0 rounded-[2px] object-cover align-middle ring-1 ring-black/5"
      style={{ width: Math.round(size * 1.5), height: size }}
      loading="lazy"
    />
  );
}

export function TeamLabel({
  name,
  className = "",
  bold,
  link,
}: {
  name: string;
  className?: string;
  bold?: boolean;
  /** true면 팀 상세로 링크 */
  link?: boolean;
}) {
  if (!name) return <span className="text-muted">미정</span>;
  const isKorea = name === KOREA;
  const inner = (
    <span
      className={`inline-flex items-center gap-2 ${isKorea || bold ? "font-semibold" : ""
        } ${isKorea ? "text-primary" : ""} ${className}`}
    >
      <Flag name={name} />
      <span>{teamKo(name)}</span>
    </span>
  );
  if (!link) return inner;
  return (
    <Link
      href={`/teams/${teamCode(name)}`}
      className="group/team inline-flex rounded transition-colors hover:text-primary"
    >
      <span className="border-b border-transparent group-hover/team:border-current">
        {inner}
      </span>
    </Link>
  );
}

export function SourceFooter({
  sources,
  fetchedAt,
  note,
}: {
  sources: string[];
  fetchedAt?: string;
  note?: string;
}) {
  return (
    <p className="mt-3 text-xs text-muted">
      출처: {sources.join(" · ")}
      {fetchedAt ? ` · 갱신: ${fetchedAt}` : ""}
      {note ? ` · ${note}` : ""}
    </p>
  );
}

export function SectionHeading({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-balance">{children}</h2>
      {aside ? <div className="shrink-0 text-sm text-muted">{aside}</div> : null}
    </div>
  );
}

const OUTCOME_STYLE: Record<
  Outcome | "advance-or-third",
  { label: string; cls: string; icon: string }
> = {
  advance: {
    label: "32강 직행",
    cls: "bg-success-soft text-success",
    icon: "✓",
  },
  "advance-or-third": {
    label: "32강/3위",
    cls: "bg-success-soft text-success",
    icon: "↗",
  },
  third: {
    label: "조 3위 (경쟁)",
    cls: "bg-warning-soft text-warning",
    icon: "",
  },
  out: { label: "탈락", cls: "bg-danger-soft text-danger", icon: "✕" },
};

export function OutcomePill({
  outcome,
  label,
}: {
  outcome: Outcome | "advance-or-third";
  label?: string;
}) {
  const s = OUTCOME_STYLE[outcome];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
    >
      {s.icon ? <span aria-hidden>{s.icon}</span> : null}
      {label ?? s.label}
    </span>
  );
}

const STATUS_LABEL: Record<string, { text: string; outcome: Outcome | "advance-or-third" }> = {
  "advanced-clinched": { text: "32강 진출 확정", outcome: "advance" },
  "advance-possible": { text: "32강 직행 가능", outcome: "advance-or-third" },
  "third-clinched": { text: "조 3위 확정", outcome: "third" },
  "out-clinched": { text: "탈락 확정", outcome: "out" },
  "alive": { text: "32강 진출 경쟁 중", outcome: "third" },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { text: status, outcome: "third" as const };
  return <OutcomePill outcome={s.outcome} label={s.text} />;
}
