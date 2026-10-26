'use client';

import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';

const SKILL_SLOTS = [
  { x: 240, y: 42 },
  { x: 184, y: 228 },
  { x: 304, y: 228 },
  { x: 240, y: 140 },
  { x: 150, y: 86 },
  { x: 330, y: 86 },
] as const;

export function MigrationDiagram({
  versionFrom,
  versionTo,
  skills = [],
  fallbackSteps = [],
  label,
  className,
}: {
  versionFrom?: string | null;
  versionTo?: string | null;
  skills?: { name: string }[];
  fallbackSteps?: { title: string }[];
  label: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const hasVersions = Boolean(versionFrom && versionTo);
  const nodes = hasVersions
    ? [versionFrom, ...skills.slice(0, 6).map((skill) => skill.name), versionTo].filter(Boolean)
    : fallbackSteps.map((step) => step.title);

  return (
    <div
      data-slot="migration-diagram"
      data-mode={hasVersions ? 'rewire' : 'chain'}
      className={cn('bg-card-glass border-border shadow-1 rounded-xl border px-4 py-5', className)}
    >
      {hasVersions ? (
        <svg role="img" aria-label={label} viewBox="0 0 480 280" className="h-auto w-full">
          <circle
            cx="240"
            cy="140"
            r="118"
            className="diagram-orbit stroke-border fill-none"
            data-reduced={reduced || undefined}
            strokeDasharray="3 6"
          />
          <circle cx="240" cy="140" r="78" className="stroke-border fill-none" />
          <line
            x1="116"
            y1="140"
            x2="364"
            y2="140"
            className="stroke-primary"
            strokeWidth="1.5"
            opacity="0.45"
          />
          <polygon points="356,136 368,140 356,144" className="fill-primary" opacity="0.7" />
          <rect x="24" y="108" width="92" height="64" rx="8" className="fill-card stroke-border" />
          <text
            x="70"
            y="144"
            textAnchor="middle"
            className="fill-foreground text-eyebrow font-mono"
          >
            {versionFrom}
          </text>
          <rect
            x="364"
            y="108"
            width="92"
            height="64"
            rx="8"
            className="fill-primary-subtle stroke-primary"
          />
          <text x="410" y="144" textAnchor="middle" className="fill-primary text-eyebrow font-mono">
            {versionTo}
          </text>
          {skills.slice(0, 6).map((skill, index) => {
            const slot = SKILL_SLOTS[index] ?? SKILL_SLOTS[0];
            const width = Math.max(72, skill.name.length * 8);
            return (
              <g key={skill.name}>
                <rect
                  x={slot.x - width / 2}
                  y={slot.y - 14}
                  width={width}
                  height="28"
                  rx="14"
                  className="fill-card stroke-border"
                />
                <text
                  x={slot.x}
                  y={slot.y + 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-eyebrow font-mono"
                >
                  {skill.name}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <ol role="img" aria-label={label} className="flex flex-col gap-2">
          {fallbackSteps.map((step) => (
            <li
              key={step.title}
              className="border-border bg-card text-meta rounded-lg border px-3 py-2 font-mono"
            >
              {step.title}
            </li>
          ))}
        </ol>
      )}
      <p className="sr-only">{nodes.join(', ')}</p>
    </div>
  );
}
