import { isPlaceholderText } from '@/modules/core/utils/placeholder.util';
import type { PublicBlock } from '@portfolio/contracts';
import { AccentHeadline } from '@portfolio/ui/components/AccentHeadline/AccentHeadline';
import { HeroStage } from '@/modules/core/components/HeroStage/HeroStage';
import { KickerPill } from '@portfolio/ui/components/KickerPill/KickerPill';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { buttonVariants } from '@portfolio/ui/components/ui/button';
import { cn } from '@portfolio/ui/lib/utils';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { Link } from '@i18n/navigation';
import { getSite } from '@/modules/core/services/site.service';

import type { BlockContext } from '../../types/entities/block-context.type';

type Cta = { label?: string; href?: string };

export async function HeroBlock({ block, context }: { block: PublicBlock; context: BlockContext }) {
  const props = block.props as {
    primaryCta?: Cta;
    secondaryCta?: Cta;
    showAvailability?: boolean;
    showDiagram?: boolean;
  };
  const split = block.layout === 'SPLIT_7_5' && Boolean(props.showDiagram);
  const site = await getSite(context.locale);

  return (
    <Reveal
      eager
      className={
        split
          ? 'hero-layout relative col-span-full grid items-center gap-8 lg:grid-cols-12'
          : 'hero-layout relative col-span-full'
      }
      lang={block.lang}
    >
      {props.showDiagram ? <HeroStage enabled={site.settings.ambientEffects} /> : null}
      <div
        className={
          split
            ? 'hero-copy relative flex flex-col gap-6 lg:col-span-9'
            : 'hero-copy relative flex flex-col gap-6'
        }
      >
        <KickerPill>{site.profile.heroKicker?.replace(/^\s*>+\s*/, '')}</KickerPill>
        <AccentHeadline
          text={site.profile.headline}
          accent={site.profile.headlineAccent}
          className="text-display"
        />
        <p className="text-prose text-muted-foreground max-w-prose" lang={site.profile.lang}>
          {site.profile.subheadline}
        </p>
        {!split && props.showAvailability && !isPlaceholderText(site.settings.availabilityNote) ? (
          <Badge variant="primary">{site.settings.availabilityNote}</Badge>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {props.primaryCta?.href && props.primaryCta.label ? (
            <Link href={props.primaryCta.href} className={cn(buttonVariants({ size: 'lg' }))}>
              {props.primaryCta.label}
            </Link>
          ) : null}
          {props.secondaryCta?.href && props.secondaryCta.label ? (
            <Link
              href={props.secondaryCta.href}
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
            >
              {props.secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </div>
      {split && props.showAvailability && !isPlaceholderText(site.settings.availabilityNote) ? (
        <aside className="hero-status lg:col-span-3">
          <header aria-hidden>
            <i />
            <i />
            <i />
          </header>
          <p>{site.settings.availabilityNote}</p>
          <div>{[site.profile.city, site.profile.timezone].filter(Boolean).join(' · ')}</div>
        </aside>
      ) : null}
    </Reveal>
  );
}

export function HeroSkeleton() {
  return <Skeleton className="col-span-full h-80 w-full" />;
}
