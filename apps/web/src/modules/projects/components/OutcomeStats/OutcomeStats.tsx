import type { PublicProjectMetric } from '@portfolio/contracts';
import { DiffStat } from '@portfolio/ui/components/DiffStat/DiffStat';

export function OutcomeStats({ metrics }: { metrics: PublicProjectMetric[] }) {
  if (metrics.length < 1) {
    return null;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {metrics.map((metric) => (
        <li key={metric.id} className="bg-card border-border rounded-xl border px-4 py-4">
          <DiffStat
            before={metric.before}
            after={metric.after}
            value={metric.value}
            label={metric.label}
          />
        </li>
      ))}
    </ul>
  );
}
