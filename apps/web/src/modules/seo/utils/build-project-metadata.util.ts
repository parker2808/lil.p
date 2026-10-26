import type { Locale } from '@portfolio/contracts';
import type { Metadata } from 'next';

import { getSite } from '@/modules/core/services/site.service';
import { getProjectOrNull } from '@/modules/projects/services/projects.service';

import { fallbackMetadata } from './fallback-metadata.util';
import { projectMetadata } from './project-metadata.util';

export async function buildProjectMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const typed = locale as Locale;
    const [site, project] = await Promise.all([getSite(typed), getProjectOrNull(slug, typed)]);
    if (!project) {
      return fallbackMetadata(site);
    }
    return projectMetadata({ site, project, locale: typed });
  } catch {
    return fallbackMetadata();
  }
}
