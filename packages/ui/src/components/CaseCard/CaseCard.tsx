import type { PublicProjectListItem } from '@portfolio/contracts';
import { CoverPlaceholder } from '@portfolio/ui/components/CoverPlaceholder/CoverPlaceholder';
import { DiffStat } from '@portfolio/ui/components/DiffStat/DiffStat';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';
import {
  CARD_ARROW,
  CARD_INTERACTIVE,
  CARD_TITLE_LINK,
} from '@portfolio/ui/utils/card-chrome.util';
import { cloudinaryPreview } from '@portfolio/ui/utils/cloudinary-preview.util';
import { BADGE_HUE } from '@portfolio/ui/utils/hue.util';
import { defaultRenderLink, type RenderLink } from '@portfolio/ui/utils/render-link.util';
import { ArrowUpRight } from 'lucide-react';

const CHIP_LIMIT = 4;
const PLUS = '+';

export function CaseCard({
  project,
  href,
  labels,
  variant = 'default',
  renderLink = defaultRenderLink,
  className,
}: {
  project: PublicProjectListItem;
  href: string;
  labels: { nda: string };
  variant?: 'default' | 'featured';
  renderLink?: RenderLink;
  className?: string;
}) {
  const hue = project.domain?.hue ?? 'JADE';
  const chips = project.skills.slice(0, CHIP_LIMIT);
  const extra = project.skills.length - CHIP_LIMIT;
  const featured = variant === 'featured';

  return (
    <article
      data-slot="case-card"
      data-variant={variant}
      className={cn(CARD_INTERACTIVE, featured ? 'p-4 lg:p-5' : 'flex flex-col', className)}
    >
      <ArrowUpRight aria-hidden className={CARD_ARROW} />
      <div className={cn(featured && 'grid items-center gap-6 lg:grid-cols-12')}>
        {project.cover ? (
          <img
            src={project.cover.url}
            srcSet={project.cover.srcset}
            alt={project.cover.alt}
            width={project.cover.width ?? undefined}
            height={project.cover.height ?? undefined}
            sizes={featured ? '(min-width: 1024px) 58vw, 100vw' : '100vw'}
            fetchPriority={featured ? 'high' : 'auto'}
            decoding="async"
            className={cn(
              'w-full object-cover',
              featured ? 'rounded-lg lg:col-span-7' : 'border-b',
            )}
            style={{
              aspectRatio: '16 / 10',
              backgroundImage: cloudinaryPreview(project.cover.url)
                ? `url("${cloudinaryPreview(project.cover.url)}")`
                : undefined,
              backgroundSize: 'cover',
            }}
          />
        ) : (
          <CoverPlaceholder
            title={project.title}
            slug={project.slug}
            hue={hue}
            className={cn(featured ? 'lg:col-span-7' : 'border-b')}
          />
        )}
        <div className={cn('flex flex-1 flex-col gap-2', featured ? 'lg:col-span-5' : 'p-4')}>
          <div className="flex flex-wrap items-center gap-1.5">
            {project.domain ? (
              <Badge hue={BADGE_HUE[project.domain.hue]} className="normal-case">
                <Icon name={project.domain.iconKey} className="size-3" />
                {project.domain.name}
              </Badge>
            ) : null}
            {project.isConfidential ? <Badge variant="warning">{labels.nda}</Badge> : null}
          </div>
          <h3 className="pr-7">
            {renderLink({ href, className: CARD_TITLE_LINK, children: project.title })}
          </h3>
          <p className="text-body text-muted-foreground clamp-marks line-clamp-3">
            {project.tagline}
          </p>
          {project.topMetric ? (
            <DiffStat
              before={project.topMetric.before}
              after={project.topMetric.after}
              value={project.topMetric.value}
              label={project.topMetric.label}
            />
          ) : null}
          {project.skills.length ? (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {chips.map((skill) => (
                <li key={skill.slug}>
                  <Badge variant="neutral" className="normal-case">
                    {skill.name}
                  </Badge>
                </li>
              ))}
              {extra > 0 ? (
                <li>
                  <Badge variant="outline" className="normal-case">
                    {PLUS}
                    {extra}
                  </Badge>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
