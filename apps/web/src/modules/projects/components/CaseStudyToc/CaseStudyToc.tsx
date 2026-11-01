'use client';

import type { TocItem } from '@portfolio/ui/components/SectionNav/SectionNav';
import { SectionNav } from '@portfolio/ui/components/SectionNav/SectionNav';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@portfolio/ui/components/ui/sheet';
import { cn } from '@portfolio/ui/lib/utils';
import { List, X } from 'lucide-react';
import { useRef, useState } from 'react';

export function CaseStudyToc({
  items,
  skills,
  liveUrl,
  labels,
}: {
  items: TocItem[];
  skills: { name: string }[];
  liveUrl: string | null;
  labels: { onThisPage: string; contents: string; close: string; live: string };
}) {
  const [open, setOpen] = useState(false);
  const target = useRef<string | null>(null);

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

  if (items.length < 1) {
    return (
      <>
        {chips}
        {live}
      </>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button surface="public" variant="outline" size="sm" className="lg:hidden">
            <List className="size-4" aria-hidden />
            {labels.contents}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="case-study-toc-sheet"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const id = target.current;
            target.current = null;
            if (!id) return;
            event.preventDefault();
            requestAnimationFrame(() => {
              document.getElementById(id)?.scrollIntoView();
              window.history.replaceState(window.history.state, '', `#${id}`);
            });
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <SheetTitle>{labels.onThisPage}</SheetTitle>
            <SheetClose asChild>
              <Button surface="public" variant="outline" size="sm" aria-label={labels.close}>
                <X className="size-4" aria-hidden />
              </Button>
            </SheetClose>
          </div>
          <div className="min-h-0 overflow-y-auto">
            <nav aria-label={labels.contents}>
              <ol className="flex flex-col">
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={cn(
                        'tap text-meta text-muted-foreground block py-2',
                        item.depth === 3 && 'pl-4',
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        target.current = item.id;
                        setOpen(false);
                      }}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            {chips}
            {live}
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block">
        <SectionNav items={items} label={labels.onThisPage} />
        {chips}
        {live}
      </div>
    </>
  );
}
