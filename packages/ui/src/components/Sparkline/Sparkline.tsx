import { cn } from '@portfolio/ui/lib/utils';

export function Sparkline({
  values,
  label,
  className,
}: {
  values: number[];
  label: string;
  className?: string;
}) {
  const width = 96;
  const height = 28;
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - 1 - (value / max) * (height - 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-7 w-24', className)}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
