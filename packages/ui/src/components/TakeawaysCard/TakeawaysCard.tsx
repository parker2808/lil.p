import { cn } from '@portfolio/ui/lib/utils';

const BULLET = '▹';

export function TakeawaysCard({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  if (items.length < 1) {
    return null;
  }

  return (
    <aside
      data-slot="takeaways-card"
      className={cn('bg-primary-subtle border-border my-8 rounded-lg border px-4 py-4', className)}
    >
      <p className="text-eyebrow text-subtle-foreground mb-2 font-mono uppercase">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item} className="text-body relative py-1 pl-4">
            <span aria-hidden className="text-primary absolute left-0">
              {BULLET}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
