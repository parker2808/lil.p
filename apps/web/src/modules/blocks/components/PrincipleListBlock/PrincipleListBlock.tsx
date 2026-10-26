import type { PublicBlock } from '@portfolio/contracts';
import { PrincipleList } from '@portfolio/ui/components/PrincipleList/PrincipleList';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { listPrinciples } from '@/modules/about/services/principles.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function PrincipleListBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const principles = await listPrinciples(context.locale);
  if (principles.length < 1) {
    return null;
  }

  return (
    <Reveal className="col-span-full flex flex-col gap-8" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      <PrincipleList principles={principles} />
    </Reveal>
  );
}

export function PrincipleListSkeleton() {
  return <Skeleton className="col-span-full h-48 w-full" />;
}
