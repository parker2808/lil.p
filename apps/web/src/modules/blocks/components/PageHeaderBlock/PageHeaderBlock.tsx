import type { PublicBlock } from '@portfolio/contracts';
import { Eyebrow } from '@portfolio/ui/components/Eyebrow/Eyebrow';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import type { BlockContext } from '../../types/entities/block-context.type';

export function PageHeaderBlock({ block }: { block: PublicBlock; context: BlockContext }) {
  const props = block.props as { eyebrow?: string; title?: string; intro?: string };
  if (!props.title) {
    return null;
  }

  return (
    <header className="col-span-full mx-auto flex max-w-3xl flex-col gap-3 py-12" lang={block.lang}>
      {props.eyebrow ? <Eyebrow>{props.eyebrow}</Eyebrow> : null}
      <h1 className="font-heading text-title font-bold">{props.title}</h1>
      {props.intro ? (
        <p className="text-prose text-muted-foreground max-w-prose">{props.intro}</p>
      ) : null}
    </header>
  );
}

export function PageHeaderSkeleton() {
  return <Skeleton className="h-32 w-full" />;
}
