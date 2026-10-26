import type { PublicBlock } from '@portfolio/contracts';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { DomainFilter } from '@/modules/projects/components/DomainFilter/DomainFilter';
import { ProjectsGrid } from '@/modules/projects/components/ProjectsGrid/ProjectsGrid';
import { TechFilter } from '@/modules/projects/components/TechFilter/TechFilter';
import { listDomains } from '@/modules/projects/services/domains.service';
import { getFeaturedProject, listProjectsPage } from '@/modules/projects/services/projects.service';
import { listSkillOptions } from '@/modules/projects/services/skills.service';
import { parseProjectsSearch } from '@/modules/projects/utils/projects-query.util';

import type { BlockContext } from '../../types/entities/block-context.type';
import { renderAppLink } from '../../utils/render-app-link.util';

export async function ProjectsBrowserBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { showFeatured?: boolean; pageSize?: number };
  const query = parseProjectsSearch(context.searchParams);
  const pageSize = props.pageSize ?? 6;
  const showFeatured = props.showFeatured !== false && query.page === 1;

  const [page, domains, skills, featured, t, states, blocks] = await Promise.all([
    listProjectsPage(context.locale, {
      domain: query.domain,
      skill: query.skill,
      page: query.page,
      pageSize,
      sort: 'sortOrder',
    }),
    listDomains(context.locale),
    listSkillOptions(context.locale),
    showFeatured
      ? getFeaturedProject(context.locale, null, {
          domain: query.domain,
          skill: query.skill,
        })
      : Promise.resolve(null),
    getTranslations('projects'),
    getTranslations('states'),
    getTranslations('blocks'),
  ]);

  const items = featured ? page.items.filter((item) => item.id !== featured.id) : page.items;
  const filterName =
    domains.find((domain) => domain.slug === query.domain)?.name ??
    skills.find((skill) => skill.slug === query.skill)?.name;
  const emptyMessage = filterName ? t('noneFor', { name: filterName }) : states('empty');

  return (
    <>
      <div className="col-span-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <DomainFilter
          domains={domains}
          activeSlug={query.domain}
          skill={query.skill}
          labels={{ all: t('all') }}
          renderLink={renderAppLink}
        />
        <TechFilter
          skills={skills}
          activeSlug={query.skill}
          domain={query.domain}
          labels={{
            tech: t('tech'),
            any: t('any'),
            empty: states('empty'),
            search: t('search'),
          }}
        />
      </div>
      <ProjectsGrid
        items={items}
        featured={featured}
        page={page.page}
        pageSize={page.pageSize}
        total={page.total}
        domain={query.domain}
        skill={query.skill}
        emptyMessage={emptyMessage}
        labels={{
          nda: blocks('nda'),
          clearFilters: t('clearFilters'),
          previous: t('previous'),
          next: t('next'),
          pagination: t('pagination'),
        }}
        renderLink={renderAppLink}
      />
    </>
  );
}

export function ProjectsBrowserSkeleton() {
  return <Skeleton className="col-span-full h-80 w-full" />;
}
