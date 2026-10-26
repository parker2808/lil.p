import type { PublicBlock } from '@portfolio/contracts';
import { AccentHeadline } from '@portfolio/ui/components/AccentHeadline/AccentHeadline';
import { Atmosphere } from '@portfolio/ui/components/Atmosphere/Atmosphere';
import { KickerPill } from '@portfolio/ui/components/KickerPill/KickerPill';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

import { Link } from '@i18n/navigation';
import { getSite } from '@/modules/core/services/site.service';

import type { BlockContext } from '../../types/entities/block-context.type';

type Cta = { label?: string; href?: string };

export async function HeroBlock({ block, context }: { block: PublicBlock; context: BlockContext }) {
  const site = await getSite(context.locale);
  const props = block.props as {
    primaryCta?: Cta;
    secondaryCta?: Cta;
    showAvailability?: boolean;
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24" lang={block.lang}>
      {site.settings.ambientEffects ? <Atmosphere variant="hero" enabled /> : null}
      <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-6">
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
    </section>
  );
}

export function HeroSkeleton() {
  return <Skeleton className="h-80 w-full" />;
}
