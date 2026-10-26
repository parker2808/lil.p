import 'server-only';

import {
  type Locale,
  type ProjectListParams,
  type PublicProjectDetail,
  type PublicProjectListItem,
  type PublicProjectListPage,
  publicProjectDetailSchema,
  publicProjectListPageSchema,
} from '@portfolio/contracts';
import { draftMode } from 'next/headers';

import { apiServer } from '@/modules/core/services/api-server.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

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

export async function listProjectsPage(
  locale: Locale,
  params: Partial<ProjectListParams> = {},
): Promise<PublicProjectListPage> {
  return apiServer(`/api/public/projects${queryString(params)}`, {
    locale,
    tags: ['projects'],
    schema: publicProjectListPageSchema,
  });
}

export async function listProjects(
  locale: Locale,
  params: Partial<ProjectListParams> = {},
): Promise<PublicProjectListItem[]> {
  const page = await listProjectsPage(locale, params);
  return page.items;
}

export async function getFeaturedProject(
  locale: Locale,
  projectId?: number | null,
  filters: Pick<ProjectListParams, 'domain' | 'skill'> = {},
): Promise<PublicProjectListItem | null> {
  if (projectId) {
    const items = await listProjects(locale, { pageSize: 100, sort: 'sortOrder' });
    return items.find((item) => item.id === projectId) ?? null;
  }
  const featured = await listProjects(locale, {
    featured: '1',
    pageSize: 1,
    sort: 'sortOrder',
    domain: filters.domain,
    skill: filters.skill,
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

export async function getProject(slug: string, locale: Locale): Promise<PublicProjectDetail> {
  const draft = await draftMode();
  if (draft.isEnabled) {
    return apiServer(`/api/admin/preview/projects/${encodeURIComponent(slug)}`, {
      locale,
      withAuth: true,
      schema: publicProjectDetailSchema,
    });
  }
  return apiServer(`/api/public/projects/${encodeURIComponent(slug)}`, {
    locale,
    tags: ['projects', `project:${slug}`],
    schema: publicProjectDetailSchema,
  });
}

export async function getProjectOrNull(
  slug: string,
  locale: Locale,
): Promise<PublicProjectDetail | null> {
  try {
    return await getProject(slug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function listPublishedSlugs(): Promise<string[]> {
  try {
    const page = await listProjectsPage('en', { pageSize: 100, sort: 'sortOrder' });
    return page.items.map((item) => item.slug);
  } catch {
    return [];
  }
}

export async function listRelatedProjects(
  locale: Locale,
  slug: string,
  domainSlug?: string,
): Promise<PublicProjectListItem[]> {
  if (!domainSlug) {
    return [];
  }
  const items = await listProjects(locale, {
    domain: domainSlug,
    pageSize: 6,
    sort: 'sortOrder',
  });
  return items.filter((item) => item.slug !== slug).slice(0, 2);
}
