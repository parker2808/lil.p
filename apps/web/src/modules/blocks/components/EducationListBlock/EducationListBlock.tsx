import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { listEducation } from '@/modules/about/services/education.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

function yearRange(start: string, end: string): string {
  return `${start.slice(0, 4)} — ${end.slice(0, 4)}`;
}

export async function EducationListBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const rows = await listEducation(context.locale);
  if (rows.length < 1) {
    return null;
  }

  return (
    <Reveal className="col-span-full flex flex-col gap-8" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      <ul className="grid gap-3">
        {rows.map((row) => (
          <li
            key={row.id}
            lang={row.lang}
            className="bg-card border-border rounded-lg border px-4 py-4"
          >
            <p className="text-body font-semibold">{row.school}</p>
            <p className="text-meta text-muted-foreground">
              {row.degree}
              <span aria-hidden> · </span>
              {row.major}
            </p>
            <p className="text-eyebrow text-subtle-foreground mt-1 font-mono">
              {yearRange(row.startDate, row.endDate)}
            </p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function EducationListSkeleton() {
  return <Skeleton className="col-span-full h-32 w-full" />;
}
