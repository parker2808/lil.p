'use client';

import type { PublicDomain, PublicProjectListItem, PublicSkillChip } from '@portfolio/contracts';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { renderAppLink } from '@/modules/blocks/utils/render-app-link.util';

import { DomainFilter } from '../DomainFilter/DomainFilter';
import { ProjectsGrid } from '../ProjectsGrid/ProjectsGrid';
import { ProjectsView } from '../ProjectsView/ProjectsView';
import { TechFilter } from '../TechFilter/TechFilter';
import { parseProjectsSearch } from '../../utils/projects-query.util';

type Labels = {
  all: string;
  tech: string;
  any: string;
  empty: string;
  search: string;
  nda: string;
  clearFilters: string;
  previous: string;
  next: string;
  pagination: string;
};

type ProjectsBrowserProps = {
  projects: PublicProjectListItem[];
  domains: PublicDomain[];
  skills: PublicSkillChip[];
  pageSize: number;
  showFeatured: boolean;
  labels: Labels;
};

export function ProjectsBrowser(props: ProjectsBrowserProps) {
  const search = useSearchParams();
  return <ProjectsBrowserView {...props} search={Object.fromEntries(search.entries())} />;
}

/**
 * Client island for the projects block. `useSearchParams` suspends during static rendering,
 * so the fallback is the unfiltered view from this same chunk: the static HTML matches the
 * unfiltered client render (no CLS) and no extra lazy boundary suspends inside the fallback.
 */
export function ProjectsBrowserIsland(props: ProjectsBrowserProps) {
  return (
    <Suspense fallback={<ProjectsBrowserView {...props} search={{}} />}>
      <ProjectsBrowser {...props} />
    </Suspense>
  );
}

/**
 * Renders the browser for a given query. The block uses it with an empty query as the
 * Suspense fallback, so the static HTML matches the unfiltered client render (no CLS).
 */
export function ProjectsBrowserView({
  projects,
  domains,
  skills,
  pageSize,
  showFeatured,
  labels,
  search,
}: ProjectsBrowserProps & { search: Record<string, string> }) {
  const t = useTranslations('projects');
  const query = parseProjectsSearch(search);
  const filtered = projects.filter(
    (project) =>
      (!query.domain || project.domain?.slug === query.domain) &&
      (!query.skill || project.skills.some((skill) => skill.slug === query.skill)),
  );
  const featured =
    showFeatured && query.page === 1 ? filtered.find((item) => item.isFeatured) : null;
  const pageItems = filtered.slice((query.page - 1) * pageSize, query.page * pageSize);
  const items = featured ? pageItems.filter((item) => item.id !== featured.id) : pageItems;
  const filterName =
    domains.find((domain) => domain.slug === query.domain)?.name ??
    skills.find((skill) => skill.slug === query.skill)?.name;
  const emptyMessage = filterName ? t('noneFor', { name: filterName }) : labels.empty;

  return (
    <>
      <div className="projects-filters col-span-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <DomainFilter
          domains={domains}
          activeSlug={query.domain}
          skill={query.skill}
          labels={{ all: labels.all }}
          renderLink={renderAppLink}
        />
        <TechFilter
          skills={skills}
          activeSlug={query.skill}
          domain={query.domain}
          labels={{
            tech: labels.tech,
            any: labels.any,
            empty: labels.empty,
            search: labels.search,
          }}
        />
      </div>
      <ProjectsView>
        <ProjectsGrid
          items={items}
          featured={featured ?? null}
          page={query.page}
          pageSize={pageSize}
          total={filtered.length}
          domain={query.domain}
          skill={query.skill}
          emptyMessage={emptyMessage}
          labels={{
            nda: labels.nda,
            clearFilters: labels.clearFilters,
            previous: labels.previous,
            next: labels.next,
            pagination: labels.pagination,
          }}
          renderLink={renderAppLink}
        />
      </ProjectsView>
    </>
  );
}
