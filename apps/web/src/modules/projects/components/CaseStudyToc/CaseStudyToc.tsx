'use client';

import type { TocItem } from '@portfolio/ui/components/SectionNav/SectionNav';
import { SectionNav } from '@portfolio/ui/components/SectionNav/SectionNav';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@portfolio/ui/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export function CaseStudyToc({
  items,
  skills,
  liveUrl,
  labels,
}: {
  items: TocItem[];
  skills: { name: string }[];
  liveUrl: string | null;
  labels: { onThisPage: string; live: string };
}) {
  const chips =
    skills.length > 0 ? (
      <ul className="mt-6 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li key={skill.name}>
            <Badge variant="neutral" className="normal-case">
              {skill.name}
            </Badge>
          </li>
        ))}
      </ul>
    ) : null;

  const live = liveUrl ? (
    <Button surface="public" variant="outline" size="sm" className="mt-6" asChild>
      <a href={liveUrl} rel="noreferrer">
        {labels.live}
      </a>
    </Button>
  ) : null;

  return (
    <>
      <Collapsible className="lg:hidden">
        <CollapsibleTrigger className="text-eyebrow text-subtle-foreground inline-flex items-center gap-2 font-mono uppercase">
          {labels.onThisPage}
          <ChevronDown className="size-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <ol className="flex flex-col">
            {items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-meta text-muted-foreground block py-1.5">
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
          {chips}
          {live}
        </CollapsibleContent>
      </Collapsible>
      <div className="hidden lg:block">
        <SectionNav items={items} label={labels.onThisPage} />
        {chips}
        {live}
      </div>
    </>
  );
}
