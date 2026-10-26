import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Timeline } from '@portfolio/ui/components/Timeline/Timeline';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { listExperience } from '@/modules/about/services/experience.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function TimelineBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const [items, t, states] = await Promise.all([
    listExperience(context.locale),
    getTranslations('blocks'),
    getTranslations('states'),
  ]);

  return (
    <Reveal className="col-span-full flex flex-col gap-8" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      {items.length < 1 ? (
        <p className="text-body text-muted-foreground">{states('empty')}</p>
      ) : (
        <Timeline
          items={items}
          pageLocale={context.locale}
          labels={{ now: t('now'), highlights: t('highlights'), fallback: t('fallback') }}
        />
      )}
    </Reveal>
  );
}

export function TimelineSkeleton() {
  return <Skeleton className="col-span-full h-80 w-full" />;
}
