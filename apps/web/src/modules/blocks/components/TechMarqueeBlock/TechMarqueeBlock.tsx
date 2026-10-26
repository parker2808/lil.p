import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { TechMarquee } from '@portfolio/ui/components/TechMarquee/TechMarquee';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { listMarqueeSkills } from '@/modules/about/services/skills.service';
import { getSite } from '@/modules/core/services/site.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function TechMarqueeBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const [skills, site, t] = await Promise.all([
    listMarqueeSkills(context.locale),
    getSite(context.locale),
    getTranslations('blocks'),
  ]);
  if (skills.length < 1) {
    return null;
  }

  return (
    <Reveal className="col-span-full flex flex-col gap-6" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      <TechMarquee
        items={skills}
        enabled={site.settings.marqueeEnabled}
        labels={{ pause: t('pause'), play: t('play') }}
      />
    </Reveal>
  );
}

export function TechMarqueeSkeleton() {
  return <Skeleton className="col-span-full h-10 w-full" />;
}
