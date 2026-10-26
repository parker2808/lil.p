'use client';

import type { PublicExperience } from '@portfolio/contracts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@portfolio/ui/components/ui/accordion';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';

import { groupExperience, highlightItems } from './group-experience.util';

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
  return `${min} — ${max}`;
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
  labels: { now: string; highlights: string; fallback: string };
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const groups = groupExperience(items);
  if (groups.length < 1) {
    return null;
  }

  return (
    <ol data-slot="timeline" className={cn('flex flex-col', className)}>
      {groups.map((group) => (
        <li
          key={group.company}
          className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 py-6 md:grid-cols-[7rem_auto_1fr]"
        >
          <p className="text-eyebrow text-subtle-foreground font-mono md:pt-1">
            {groupYears(group.items, labels.now)}
          </p>
          <span aria-hidden className="bg-border relative mx-auto hidden h-full w-px md:block">
            <span className="bg-primary absolute top-2 left-1/2 size-2 -translate-x-1/2 rounded-full" />
          </span>
          <div className="min-w-0">
            <h3 className="text-subheading font-semibold">
              {group.companyUrl ? (
                <a href={group.companyUrl} rel="noreferrer" className="hover:text-primary">
                  {group.company}
                </a>
              ) : (
                group.company
              )}
            </h3>
            <p className="text-meta text-muted-foreground">{group.location}</p>
            <ol className="mt-3 flex flex-col gap-4">
              {group.items.map((item) => {
                const highlights = highlightItems(item.highlights);
                const fallback = item.lang !== pageLocale;
                return (
                  <li key={item.id} lang={item.lang} className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body font-medium">{item.role}</p>
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
                    {highlights.length ? (
                      <Accordion type="multiple" defaultValue={reduced ? ['highlights'] : []}>
                        <AccordionItem value="highlights">
                          <AccordionTrigger>{labels.highlights}</AccordionTrigger>
                          <AccordionContent>
                            <ul className="flex flex-col gap-1">
                              {highlights.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
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
