import type { PublicDomain } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import { CARD_INTERACTIVE, CARD_TITLE_LINK } from '@portfolio/ui/utils/card-chrome.util';
import { HUE_TILE, HUE_TOP } from '@portfolio/ui/utils/hue.util';
import { defaultRenderLink, type RenderLink } from '@portfolio/ui/utils/render-link.util';

export function DomainCard({
  domain,
  href,
  labels,
  renderLink = defaultRenderLink,
  className,
}: {
  domain: PublicDomain;
  href: string;
  labels: { projects: string };
  renderLink?: RenderLink;
  className?: string;
}) {
  if (domain.projectCount < 1) {
    return null;
  }

  return (
    <article
      data-slot="domain-card"
      data-hue={domain.hue}
      className={cn(
        CARD_INTERACTIVE,
        'border-t-2 border-t-transparent p-4',
        HUE_TOP[domain.hue],
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-md',
            HUE_TILE[domain.hue],
          )}
        >
          <Icon name={domain.iconKey} className="size-4" />
        </span>
        <span className="text-eyebrow text-subtle-foreground inline-flex gap-1 font-mono">
          <span>{domain.projectCount}</span>
          <span>{labels.projects}</span>
        </span>
      </div>
      <h3>{renderLink({ href, className: CARD_TITLE_LINK, children: domain.name })}</h3>
      <p className="text-meta text-muted-foreground clamp-marks mt-1.5 line-clamp-2">
        {domain.description}
      </p>
    </article>
  );
}
