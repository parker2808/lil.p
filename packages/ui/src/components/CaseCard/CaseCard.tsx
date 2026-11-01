import type { PublicProjectListItem } from '@portfolio/contracts';
import { CoverPlaceholder } from '@portfolio/ui/components/CoverPlaceholder/CoverPlaceholder';
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

const CHIP_LIMIT = 3;

// ASSET(Parker): replace mock cover with real 16:10 screenshot (NDA-masked)
const MOCK_COVERS = new Set([
  'particula',
  'cfw-back-office-field-config',
  'cfw-sales-crm',
  'msp-advanced',
  'msp-app-expansion',
  'migration-data-tool',
]);

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
  const featured = variant === 'featured';
  const mockCover = MOCK_COVERS.has(project.slug) ? `/mock/covers/${project.slug}.svg` : null;
  const year = project.endDate?.slice(0, 4) ?? project.startDate.slice(0, 4);
  const result = project.result.trim();

  return (
    <article
      data-slot="case-card"
      data-variant={variant}
      className={cn(
        'redesign-case-card',
        CARD_INTERACTIVE,
        featured ? 'p-4 lg:p-5' : 'flex flex-col',
        className,
      )}
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
        ) : mockCover ? (
          <img
            src={mockCover}
            alt=""
            width={1600}
            height={1000}
            className={cn(
              'w-full object-cover',
              featured ? 'rounded-lg lg:col-span-7' : 'border-b',
            )}
            style={{ aspectRatio: '16 / 10' }}
          />
        ) : (
          <CoverPlaceholder
            title={project.title}
            slug={project.slug}
            hue={hue}
            iconKey={project.domain?.iconKey}
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
          <p className="project-card-meta text-muted-foreground">
            {project.role} <span aria-hidden>·</span>{' '}
            <time dateTime={project.endDate ?? project.startDate}>{year}</time>
          </p>
          {result && !/\b(?:TODO|TBD)\b/i.test(result) ? (
            <p className="project-card-result text-body" data-testid="project-result">
              {result}
            </p>
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
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
