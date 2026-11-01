import { isPlaceholderText } from '@/modules/core/utils/placeholder.util';
import type { PublicBlock } from '@portfolio/contracts';
import { Eyebrow } from '@portfolio/ui/components/Eyebrow/Eyebrow';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { aboutAvatar } from '@/modules/about/utils/about-avatar.util';
import { Markdown } from '@/modules/content/components/Markdown/Markdown';
import { getSite } from '@/modules/core/services/site.service';
import { LOCATION_CAPTION } from '@/modules/core/constants/location-caption.constant';
import { splitPublicList } from '@/modules/core/utils/public-list.util';

import type { BlockContext } from '../../types/entities/block-context.type';

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
  const { profile } = site;
  const languages = splitPublicList(profile.languages);
  const resumeUrl = profile.resume?.url;
  const avatar = aboutAvatar(profile);

  return (
    <Reveal className="col-span-full grid items-start gap-8 lg:grid-cols-12" lang={block.lang}>
      <aside className="bg-card border-border flex flex-col gap-3 rounded-lg border p-4 lg:col-span-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS srcset or the static mock SVG */}
        <img
          data-slot="about-avatar"
          src={avatar.src}
          srcSet={avatar.srcSet}
          alt={avatar.alt}
          width={96}
          height={96}
          className="bg-muted size-24 rounded-full object-cover"
        />
        {props.showAvailability && !isPlaceholderText(site.settings.availabilityNote) ? (
          <Badge variant="primary">{site.settings.availabilityNote}</Badge>
        ) : null}
        {resumeUrl ? (
          <Button surface="public" asChild variant="outline">
            <a href={resumeUrl}>{t('downloadCv')}</a>
          </Button>
        ) : null}
      </aside>
      <div className="flex flex-col gap-4 lg:col-span-8">
        {props.eyebrow ? <Eyebrow>{props.eyebrow}</Eyebrow> : null}
        <div data-slot="about-intro-lines" className="flex flex-col gap-1">
          <h1 className="font-heading text-title font-bold">{profile.displayName}</h1>
          {profile.headline ? (
            <p className="text-subheading text-muted-foreground">{profile.headline}</p>
          ) : null}
          {props.showCity ? (
            <p className="text-meta text-muted-foreground inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              <span>{LOCATION_CAPTION}</span>
            </p>
          ) : null}
        </div>
        <Markdown source={profile.bio} />
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
