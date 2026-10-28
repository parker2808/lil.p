import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { StatBand } from '@portfolio/ui/components/StatBand/StatBand';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { getSite } from '@/modules/core/services/site.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function StatBandBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as {
    heading?: BlockHeadingProps;
    variant?: 'default' | 'compact';
    statIds?: number[];
  };
  const site = await getSite(context.locale);
  const candidates = props.statIds?.length
    ? site.profileStats.filter((stat) => props.statIds!.includes(stat.id))
    : site.profileStats;
  const selected = candidates.filter((stat) => !/^0(?:[.,]0+)?$/.test(String(stat.value).trim()));
  if (selected.length < 2) {
    return null;
  }

  return (
    <Reveal className="col-span-full flex flex-col gap-8" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      <StatBand stats={selected} variant={props.variant === 'compact' ? 'compact' : 'default'} />
    </Reveal>
  );
}

export function StatBandSkeleton() {
  return <Skeleton className="col-span-full h-28 w-full" />;
}
