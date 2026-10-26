import type { PublicBlock } from '@portfolio/contracts';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { getSite } from '@/modules/core/services/site.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function CvDownloadBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const [site, t] = await Promise.all([getSite(context.locale), getTranslations('blocks')]);
  const resumeId = context.locale === 'vi' ? site.profile.resumeViId : site.profile.resumeEnId;
  if (!resumeId) {
    return null;
  }

  return (
    <Reveal
      className="bg-card border-border col-span-full flex flex-col gap-4 rounded-lg border px-4 py-4"
      lang={block.lang}
    >
      <BlockHeading heading={props.heading} />
      <Button asChild>
        <a href={`/api/public/media/${resumeId}`}>{t('downloadCv')}</a>
      </Button>
    </Reveal>
  );
}

export function CvDownloadSkeleton() {
  return <Skeleton className="col-span-full h-28 w-full" />;
}
