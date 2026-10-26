import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { Markdown } from '@/modules/content/components/Markdown/Markdown';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function ProseBlock({ block }: { block: PublicBlock; context: BlockContext }) {
  const props = block.props as { heading?: BlockHeadingProps; body?: string; aside?: string };
  if (!props.body) {
    return null;
  }
  const split = block.layout === 'SPLIT_8_4' && Boolean(props.aside);

  return (
    <Reveal
      className={
        split
          ? 'col-span-full grid items-start gap-8 lg:grid-cols-12'
          : 'col-span-full flex flex-col gap-6'
      }
      lang={block.lang}
    >
      <div className={split ? 'lg:col-span-8' : undefined}>
        <BlockHeading heading={props.heading} />
        <Markdown source={props.body} />
      </div>
      {split && props.aside ? (
        <aside className="lg:col-span-4">
          <Markdown source={props.aside} compact />
        </aside>
      ) : null}
    </Reveal>
  );
}

export function ProseSkeleton() {
  return <Skeleton className="col-span-full h-48 w-full" />;
}
