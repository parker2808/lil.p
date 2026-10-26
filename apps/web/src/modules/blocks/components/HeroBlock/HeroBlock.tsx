import type { PublicBlock } from '@portfolio/contracts';
import { AccentHeadline } from '@portfolio/ui/components/AccentHeadline/AccentHeadline';
import { Atmosphere } from '@portfolio/ui/components/Atmosphere/Atmosphere';
import { KickerPill } from '@portfolio/ui/components/KickerPill/KickerPill';
import { MigrationDiagram } from '@portfolio/ui/components/MigrationDiagram/MigrationDiagram';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { Link } from '@i18n/navigation';
import { getSite } from '@/modules/core/services/site.service';
import { listProcessSteps } from '@/modules/home/services/process-steps.service';
import { getFeaturedProject } from '@/modules/projects/services/projects.service';

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
  const [site, featured, steps, t] = await Promise.all([
    getSite(context.locale),
    split ? getFeaturedProject(context.locale) : Promise.resolve(null),
    split ? listProcessSteps(context.locale) : Promise.resolve([]),
    getTranslations('blocks'),
  ]);

  return (
    <Reveal
      className={
        split
          ? 'relative col-span-full grid items-center gap-8 overflow-hidden lg:grid-cols-12'
          : 'relative col-span-full overflow-hidden'
      }
      lang={block.lang}
    >
      {site.settings.ambientEffects ? <Atmosphere variant="hero" enabled /> : null}
      <div
        className={
          split
            ? 'relative flex flex-col gap-6 lg:col-span-7'
            : 'relative mx-auto flex max-w-3xl flex-col gap-6'
        }
      >
        <KickerPill>{site.profile.heroKicker}</KickerPill>
        <AccentHeadline
          text={site.profile.headline}
          accent={site.profile.headlineAccent}
          className="text-display"
        />
        <p className="text-prose text-muted-foreground max-w-prose" lang={site.profile.lang}>
          {site.profile.subheadline}
        </p>
        {props.showAvailability ? (
          <Badge variant="primary">{site.settings.availabilityNote}</Badge>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {props.primaryCta?.href && props.primaryCta.label ? (
            <Button asChild size="lg">
              <Link href={props.primaryCta.href}>{props.primaryCta.label}</Link>
            </Button>
          ) : null}
          {props.secondaryCta?.href && props.secondaryCta.label ? (
            <Button asChild size="lg" variant="outline">
              <Link href={props.secondaryCta.href}>{props.secondaryCta.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
      {split ? (
        <div className="relative lg:col-span-5">
          <MigrationDiagram
            versionFrom={featured?.versionFrom}
            versionTo={featured?.versionTo}
            skills={featured?.skills}
            fallbackSteps={steps}
            label={t('diagram')}
          />
        </div>
      ) : null}
    </Reveal>
  );
}

export function HeroSkeleton() {
  return <Skeleton className="col-span-full h-80 w-full" />;
}
