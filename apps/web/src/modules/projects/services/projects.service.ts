import 'server-only';

import {
  type Locale,
  type ProjectListParams,
  type PublicProjectListItem,
  publicProjectListPageSchema,
} from '@portfolio/contracts';

import { apiServer } from '@/modules/core/services/api-server.service';

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export async function listProjects(
  locale: Locale,
  params: Partial<ProjectListParams> = {},
): Promise<PublicProjectListItem[]> {
  const page = await apiServer(`/api/public/projects${queryString(params)}`, {
    locale,
    tags: ['projects'],
    schema: publicProjectListPageSchema,
  });
  return page.items;
}

export async function getFeaturedProject(
  locale: Locale,
  projectId?: number | null,
): Promise<PublicProjectListItem | null> {
  if (projectId) {
    const items = await listProjects(locale, { pageSize: 100, sort: 'sortOrder' });
    return items.find((item) => item.id === projectId) ?? null;
  }
  const featured = await listProjects(locale, {
    featured: '1',
    pageSize: 1,
    sort: 'sortOrder',
  });
  return featured[0] ?? null;
}

export async function listCaseProjects(
  locale: Locale,
  options: {
    source: 'latest' | 'featured' | 'manual';
    projectIds: number[];
    domainSlug?: string;
    limit: number;
  },
): Promise<PublicProjectListItem[]> {
  const items = await listProjects(locale, {
    pageSize: 100,
    sort: 'sortOrder',
    featured: options.source === 'featured' ? '1' : undefined,
    domain: options.domainSlug,
  });

  if (options.source === 'manual') {
    return options.projectIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is PublicProjectListItem => Boolean(item));
  }

  return items.slice(0, options.limit);
}
