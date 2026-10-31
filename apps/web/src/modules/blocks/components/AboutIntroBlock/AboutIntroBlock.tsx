import { isPlaceholderText } from '@/modules/core/utils/placeholder.util';
import type { PublicBlock } from '@portfolio/contracts';
import { Eyebrow } from '@portfolio/ui/components/Eyebrow/Eyebrow';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Avatar, AvatarFallback, AvatarImage } from '@portfolio/ui/components/ui/avatar';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Markdown } from '@/modules/content/components/Markdown/Markdown';
import { getSite } from '@/modules/core/services/site.service';
import { LOCATION_CAPTION } from '@/modules/core/constants/location-caption.constant';

import type { BlockContext } from '../../types/entities/block-context.type';
import { initials } from '../../utils/initials.util';

export async function AboutIntroBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as {
    eyebrow?: string;
    showCity?: boolean;
    showAvailability?: boolean;
  };
  const [site, t] = await Promise.all([getSite(context.locale), getTranslations('blocks')]);
  const languages = site.profile.languages
    .split(/[,·]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const resumeUrl = site.profile.resume?.url;
  const cityLine = LOCATION_CAPTION;

  return (
    <Reveal className="col-span-full grid items-start gap-8 lg:grid-cols-12" lang={block.lang}>
      <aside className="bg-card border-border flex flex-col gap-3 rounded-lg border p-4 lg:col-span-4">
        <Avatar className="size-20">
          {site.profile.avatar ? (
            <AvatarImage
              src={site.profile.avatar.url}
              srcSet={site.profile.avatar.srcset}
              alt={site.profile.avatar.alt}
            />
          ) : null}
          <AvatarFallback>{initials(site.profile.displayName)}</AvatarFallback>
        </Avatar>
        {props.showCity && cityLine ? (
          <p className="text-meta text-muted-foreground inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            <span>{cityLine}</span>
          </p>
        ) : null}
        {props.showAvailability && !isPlaceholderText(site.settings.availabilityNote) ? (
          <Badge variant="primary">{site.settings.availabilityNote}</Badge>
        ) : null}
        {resumeUrl ? (
          <Button asChild variant="outline">
            <a href={resumeUrl}>{t('downloadCv')}</a>
          </Button>
        ) : null}
      </aside>
      <div className="flex flex-col gap-4 lg:col-span-8">
        {props.eyebrow ? <Eyebrow>{props.eyebrow}</Eyebrow> : null}
        <h1 className="font-heading text-title font-bold">{site.profile.displayName}</h1>
        <Markdown source={site.profile.bio} />
        {languages.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {languages.map((language) => (
              <li key={language}>
                <Badge variant="neutral" className="normal-case">
                  {language}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Reveal>
  );
}

export function AboutIntroSkeleton() {
  return <Skeleton className="col-span-full h-64 w-full" />;
}
