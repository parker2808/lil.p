import { isPlaceholderText } from '@/modules/core/utils/placeholder.util';
import type { PublicBlock } from '@portfolio/contracts';
import { Atmosphere } from '@portfolio/ui/components/Atmosphere/Atmosphere';
import { Eyebrow } from '@portfolio/ui/components/Eyebrow/Eyebrow';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { ChannelCards } from '@/modules/contact/components/ChannelCards/ChannelCards';
import { ContactForm } from '@/modules/contact/components/ContactForm/ContactForm';
import { listContactTopics } from '@/modules/contact/services/contact-topics.service';
import { getSite } from '@/modules/core/services/site.service';

import type { BlockContext } from '../../types/entities/block-context.type';

export async function ContactFormBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { eyebrow?: string; title?: string; intro?: string };
  if (!props.title) {
    return null;
  }

  const [site, topics] = await Promise.all([
    getSite(context.locale),
    listContactTopics(context.locale),
  ]);

  return (
    <>
      <div className="relative flex flex-col gap-6" lang={block.lang}>
        {site.settings.ambientEffects ? <Atmosphere variant="hero" enabled /> : null}
        {props.eyebrow ? <Eyebrow>{props.eyebrow}</Eyebrow> : null}
        <h1 className="font-heading text-title font-bold">{props.title}</h1>
        {props.intro ? (
          <p className="text-prose text-muted-foreground max-w-prose">{props.intro}</p>
        ) : null}
        {!isPlaceholderText(site.settings.contactIntro) ? (
          <p className="text-prose text-muted-foreground max-w-prose">
            {site.settings.contactIntro}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {!isPlaceholderText(site.settings.availabilityNote) ? (
            <Badge variant="primary">{site.settings.availabilityNote}</Badge>
          ) : null}
          {!isPlaceholderText(site.settings.replyTimeNote) ? (
            <p className="text-ui-meta text-muted-foreground">{site.settings.replyTimeNote}</p>
          ) : null}
        </div>
        <ChannelCards email={site.settings.contactEmail} socialLinks={site.socialLinks} />
      </div>
      <ContactForm locale={context.locale} topics={topics} />
    </>
  );
}

export function ContactFormSkeleton() {
  return <Skeleton className="h-96 w-full" />;
}
