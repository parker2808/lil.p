import type { PublicProjectListItem } from '@portfolio/contracts';
import { CaseCard } from '@portfolio/ui/components/CaseCard/CaseCard';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { buttonVariants } from '@portfolio/ui/components/ui/button';
import { Empty } from '@portfolio/ui/components/ui/empty';
import {
  Pagination,
  PaginationItem,
  PaginationList,
  paginationLinkClassName,
} from '@portfolio/ui/components/ui/pagination';
import type { RenderLink } from '@portfolio/ui/utils/render-link.util';

import { projectsHref } from '../../utils/projects-query.util';

export function ProjectsGrid({
  items,
  featured,
  page,
  pageSize,
  total,
  domain,
  skill,
  emptyMessage,
  labels,
  renderLink,
}: {
  items: PublicProjectListItem[];
  featured: PublicProjectListItem | null;
  page: number;
  pageSize: number;
  total: number;
  domain?: string;
  skill?: string;
  emptyMessage: string;
  labels: {
    nda: string;
    clearFilters: string;
    previous: string;
    next: string;
    pagination: string;
  };
  renderLink: RenderLink;
}) {
  const pages = Math.ceil(total / pageSize);
  const filtered = Boolean(domain || skill);

  if (items.length < 1 && !featured) {
    return (
      <Empty
        className="col-span-full"
        action={
          filtered
            ? renderLink({
                href: '/projects',
                className: buttonVariants({ surface: 'public', variant: 'outline', size: 'sm' }),
                children: labels.clearFilters,
              })
            : undefined
        }
      >
        {emptyMessage}
      </Empty>
    );
  }

  return (
    <>
      {featured ? (
        <Reveal className="col-span-full">
          <CaseCard
            project={featured}
            href={`/projects/${featured.slug}`}
            labels={{ nda: labels.nda }}
            variant="featured"
            renderLink={renderLink}
          />
        </Reveal>
      ) : null}
      {items.map((project) => (
        <Reveal key={project.id}>
          <CaseCard
            project={project}
            href={`/projects/${project.slug}`}
            labels={{ nda: labels.nda }}
            renderLink={renderLink}
          />
        </Reveal>
      ))}
      {pages > 1 ? (
        <Pagination className="col-span-full" aria-label={labels.pagination}>
          <PaginationList>
            {page > 1 ? (
              <PaginationItem>
                {renderLink({
                  href: projectsHref({ domain, skill, page: page - 1 }),
                  className: paginationLinkClassName(),
                  children: labels.previous,
                })}
              </PaginationItem>
            ) : null}
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
              <PaginationItem key={number}>
                {renderLink({
                  href: projectsHref({ domain, skill, page: number }),
                  className: paginationLinkClassName(number === page),
                  children: number,
                })}
              </PaginationItem>
            ))}
            {page < pages ? (
              <PaginationItem>
                {renderLink({
                  href: projectsHref({ domain, skill, page: page + 1 }),
                  className: paginationLinkClassName(),
                  children: labels.next,
                })}
              </PaginationItem>
            ) : null}
          </PaginationList>
        </Pagination>
      ) : null}
    </>
  );
}
