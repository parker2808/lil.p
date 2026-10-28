'use client';

import { cn } from '@portfolio/ui/lib/utils';
import { useEffect, useState } from 'react';

export type TocItem = { id: string; title: string; depth: 2 | 3 };

export function SectionNav({
  items,
  label,
  className,
}: {
  items: TocItem[];
  label: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    if (items.length < 1) {
      return;
    }
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setCurrent(visible.target.id);
        }
      },
      { root: headings[0]?.closest('#reader-content') ?? null, rootMargin: '-20% 0px -70% 0px' },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 1) {
    return null;
  }

  const list = (
    <ol className="flex flex-col">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={current === item.id ? 'true' : undefined}
            className={cn(
              'text-meta text-muted-foreground border-border block border-l-2 py-1.5 pl-3',
              item.depth === 3 && 'pl-6',
              current === item.id && 'text-foreground border-primary font-medium',
            )}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav
      data-slot="section-nav"
      aria-label={label}
      className={cn('lg:sticky lg:top-20', className)}
    >
      <details className="lg:hidden">
        <summary className="text-eyebrow text-subtle-foreground font-mono uppercase">
          {label}
        </summary>
        {list}
      </details>
      <div className="hidden lg:block">
        <p className="text-eyebrow text-subtle-foreground mb-3 font-mono uppercase">{label}</p>
        {list}
      </div>
    </nav>
  );
}
