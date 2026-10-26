import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { SkillGroup } from '@portfolio/ui/components/SkillGroup/SkillGroup';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { listSkillsGrouped } from '@/modules/about/services/skills.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function SkillGroupsBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const [groups, t] = await Promise.all([
    listSkillsGrouped(context.locale),
    getTranslations('blocks'),
  ]);
  if (groups.daily.length + groups.shipped.length + groups.growing.length < 1) {
    return null;
  }

  return (
    <Reveal className="col-span-full flex flex-col gap-8" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      <SkillGroup
        groups={groups}
        labels={{ daily: t('daily'), shipped: t('shipped'), growing: t('growing') }}
      />
    </Reveal>
  );
}

export function SkillGroupsSkeleton() {
  return <Skeleton className="col-span-full h-40 w-full" />;
}
