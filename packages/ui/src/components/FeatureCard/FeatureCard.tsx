import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import { defaultRenderLink, type RenderLink } from '@portfolio/ui/utils/render-link.util';

export function FeatureCard({
  title,
  body,
  iconKey,
  href,
  renderLink = defaultRenderLink,
  className,
}: {
  title: string;
  body: string;
  iconKey: string;
  href?: string;
  renderLink?: RenderLink;
  className?: string;
}) {
  return (
    <article
      data-slot="feature-card"
      className={cn(
        'bg-card-glass border-border flex flex-col gap-2 rounded-lg border p-4',
        className,
      )}
    >
      <span className="bg-muted text-primary inline-flex size-7 items-center justify-center rounded-md">
        <Icon name={iconKey} className="size-4" />
      </span>
      <h3 className="text-body font-semibold">
        {href ? renderLink({ href, className: 'hover:text-primary', children: title }) : title}
      </h3>
      <p className="text-meta text-muted-foreground clamp-marks line-clamp-2">{body}</p>
    </article>
  );
}
