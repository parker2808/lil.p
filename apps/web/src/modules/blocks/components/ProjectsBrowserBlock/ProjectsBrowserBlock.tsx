import type { PublicBlock } from '@portfolio/contracts';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
  LazyProjectsBrowser,
  LazyProjectsBrowserView,
} from '@/modules/projects/components/ProjectsBrowser/LazyProjectsBrowser';
import { listDomains } from '@/modules/projects/services/domains.service';
import { listProjectsPage } from '@/modules/projects/services/projects.service';
import { listSkillOptions } from '@/modules/projects/services/skills.service';

import type { BlockContext } from '../../types/entities/block-context.type';

export async function ProjectsBrowserBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { showFeatured?: boolean; pageSize?: number };
  const pageSize = props.pageSize ?? 6;
  const [firstPage, domains, skills, t, states, blocks] = await Promise.all([
    listProjectsPage(context.locale, { page: 1, pageSize: 100, sort: 'sortOrder' }),
    listDomains(context.locale),
    listSkillOptions(context.locale),
    getTranslations('projects'),
    getTranslations('states'),
    getTranslations('blocks'),
  ]);
  const remainingPages = Array.from(
    { length: Math.ceil(firstPage.total / 100) - 1 },
    (_, index) => index + 2,
  );
  const additionalPages = await Promise.all(
    remainingPages.map((page) =>
      listProjectsPage(context.locale, { page, pageSize: 100, sort: 'sortOrder' }),
    ),
  );
  const projects = [firstPage.items, ...additionalPages.map((page) => page.items)].flat();

  const browserProps = {
    projects,
    domains,
    skills,
    pageSize,
    showFeatured: props.showFeatured !== false,
    labels: {
      all: t('all'),
      tech: t('tech'),
      any: t('any'),
      empty: states('empty'),
      search: t('search'),
      nda: blocks('nda'),
      clearFilters: t('clearFilters'),
      previous: t('previous'),
      next: t('next'),
      pagination: t('pagination'),
    },
  };

  return (
    // The fallback is the unfiltered view, so static HTML and hydration share one layout.
    <Suspense fallback={<LazyProjectsBrowserView {...browserProps} search={{}} />}>
      <LazyProjectsBrowser {...browserProps} />
    </Suspense>
  );
}

export function ProjectsBrowserSkeleton() {
  return <Skeleton className="col-span-full h-80 w-full" />;
}
