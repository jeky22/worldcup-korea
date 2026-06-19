import type { GroupScenario } from "@/lib/scenario/engine";
import { TeamLabel, StatusPill } from "./ui";
import { GrowBar, CountUp } from "./motion";

function Bar({ a, t, o }: { a: number; t: number; o: number }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface">
      <GrowBar width={a} className="relative h-full bg-success shimmer-on overflow-hidden" title={`32강 직행 ${Math.round(a * 100)}%`} />
      <GrowBar width={t} delay={120} className="h-full bg-warning" title={`3위 ${Math.round(t * 100)}%`} />
      <GrowBar width={o} delay={240} className="h-full bg-danger" title={`탈락 ${Math.round(o * 100)}%`} />
    </div>
  );
}

export function GroupOutcomes({ scenario }: { scenario: GroupScenario }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted">
        막대는 전체 경우의 수 중 각 결과가 차지하는 비율입니다 (승부 예측이 아님).
      </p>
      {scenario.teams.map((t) => (
        <div key={t.team} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <TeamLabel name={t.team} link />
            <StatusPill status={t.status} />
          </div>
          <Bar a={t.advanceRate} t={t.thirdRate} o={t.outRate} />
          <div className="flex justify-between text-xs text-muted tnum">
            <CountUp value={Math.round(t.advanceRate * 100)} prefix="32강 " suffix="%" className="text-success" />
            <CountUp value={Math.round(t.thirdRate * 100)} prefix="3위 " suffix="%" className="text-warning" />
            <CountUp value={Math.round(t.outRate * 100)} prefix="탈락 " suffix="%" className="text-danger" />
          </div>
        </div>
      ))}
    </div>
  );
}
