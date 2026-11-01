import type { PublicExperience } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';

import { achievementItems, groupExperience } from './group-experience.util';

function yearOf(value: string): number {
  return new Date(value).getUTCFullYear();
}

function groupYears(items: PublicExperience[], nowLabel: string): string {
  const starts = items.map((item) => yearOf(item.startDate));
  const open = items.some((item) => !item.endDate);
  const min = Math.min(...starts);
  if (open) {
    return `${min} — ${nowLabel}`;
  }
  const max = Math.max(...items.map((item) => yearOf(item.endDate!)));
  return min === max ? String(min) : `${min} — ${max}`;
}

function monthLabel(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function Timeline({
  items,
  pageLocale,
  labels,
  className,
}: {
  items: PublicExperience[];
  pageLocale: 'en' | 'vi';
  labels: { now: string; fallback: string };
  className?: string;
}) {
  const groups = groupExperience(items);
  if (groups.length < 1) {
    return null;
  }

  return (
    <ol data-slot="timeline" className={cn('flex flex-col', className)}>
      {groups.map((group) => (
        <li
          key={`${group.company}-${group.items[0]!.id}`}
          data-slot="timeline-entry"
          className="grid grid-cols-[auto_1fr] gap-x-4 md:grid-cols-[7rem_auto_1fr]"
        >
          <span
            data-slot="timeline-years"
            className="text-eyebrow text-subtle-foreground col-start-2 row-start-1 font-mono md:col-start-1 md:pt-1"
          >
            {groupYears(group.items, labels.now)}
          </span>
          <span
            aria-hidden
            className="bg-border relative col-start-1 row-span-2 row-start-1 h-full w-px md:col-start-2"
          >
            <span className="bg-primary absolute top-2 left-1/2 size-2 -translate-x-1/2 rounded-full" />
          </span>
          <div className="col-start-2 row-start-2 min-w-0 pt-1 pb-8 md:col-start-3 md:row-start-1 md:pt-0">
            <h3 className="text-subheading font-sans font-semibold">
              {group.companyUrl ? (
                <a href={group.companyUrl} rel="noreferrer" className="hover:text-primary">
                  {group.company}
                </a>
              ) : (
                group.company
              )}
            </h3>
            {group.location ? (
              <p className="text-meta text-muted-foreground">{group.location}</p>
            ) : null}
            <ol className="mt-3 flex flex-col gap-4">
              {group.items.map((item) => {
                const achievements = achievementItems(item.highlights);
                const fallback = item.lang !== pageLocale;
                return (
                  <li key={item.id} lang={item.lang} className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body font-sans font-medium">{item.role}</p>
                      {fallback ? <Badge variant="outline">{labels.fallback}</Badge> : null}
                    </div>
                    <p className="text-meta text-muted-foreground">
                      <time dateTime={item.startDate}>
                        {monthLabel(item.startDate, pageLocale)}
                      </time>
                      <span aria-hidden> — </span>
                      {item.endDate ? (
                        <time dateTime={item.endDate}>{monthLabel(item.endDate, pageLocale)}</time>
                      ) : (
                        <span>{labels.now}</span>
                      )}
                    </p>
                    {item.summary ? <p className="text-body">{item.summary}</p> : null}
                    {achievements.length ? (
                      <ul
                        data-slot="timeline-achievements"
                        className="text-body marker:text-primary flex max-w-[65ch] list-disc flex-col gap-1 pl-5"
                      >
                        {achievements.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </li>
      ))}
    </ol>
  );
}
