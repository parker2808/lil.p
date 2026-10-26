import { cn } from '@portfolio/ui/lib/utils';

const BULLET = '▹';

export function RequirementColumns({
  columns,
  className,
}: {
  columns: { title: string; items: string[] }[];
  className?: string;
}) {
  if (columns.length < 1) {
    return null;
  }

  return (
    <div
      data-slot="requirement-columns"
      className={cn('my-4 grid gap-3', columns.length > 1 && 'md:grid-cols-2', className)}
    >
      {columns.map((column) => (
        <section key={column.title} className="bg-card border-border rounded-lg border px-4 py-4">
          <h3 className="text-meta mb-2 font-semibold">{column.title}</h3>
          <ul>
            {column.items.map((item) => (
              <li key={item} className="text-body relative py-1 pl-4">
                <span aria-hidden className="text-primary absolute left-0">
                  {BULLET}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
