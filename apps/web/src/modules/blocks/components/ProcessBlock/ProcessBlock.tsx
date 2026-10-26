import type { PublicBlock } from '@portfolio/contracts';
import { FeatureCard } from '@portfolio/ui/components/FeatureCard/FeatureCard';
import { ProcessFlow } from '@portfolio/ui/components/ProcessFlow/ProcessFlow';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { listPrinciples } from '@/modules/about/services/principles.service';
import { listProcessSteps } from '@/modules/home/services/process-steps.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function ProcessBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps; showPrinciples?: boolean };
  const [steps, principles] = await Promise.all([
    listProcessSteps(context.locale),
    props.showPrinciples ? listPrinciples(context.locale) : Promise.resolve([]),
  ]);
  if (steps.length < 3) {
    return null;
  }

  return (
    <>
      <Reveal className="col-span-full">
        <BlockHeading heading={props.heading} />
      </Reveal>
      {principles.map((principle) => (
        <Reveal key={principle.id} lang={block.lang}>
          <FeatureCard title={principle.title} body={principle.body} iconKey={principle.iconKey} />
        </Reveal>
      ))}
      <Reveal className="col-span-full" lang={block.lang}>
        <ProcessFlow steps={steps} />
      </Reveal>
    </>
  );
}

export function ProcessSkeleton() {
  return <Skeleton className="col-span-full h-64 w-full" />;
}
