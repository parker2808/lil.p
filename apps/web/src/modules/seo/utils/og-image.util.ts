import type { Locale } from '@portfolio/contracts';

import { getSite } from '@/modules/core/services/site.service';
import { getPostOrNull } from '@/modules/notes/services/posts.service';
import { getProjectOrNull } from '@/modules/projects/services/projects.service';

export async function loadHomeOg(locale: Locale): Promise<{
  title: string;
  domain: string;
}> {
  try {
    const site = await getSite(locale);
    return { title: site.profile.displayName, domain: site.settings.domain };
  } catch {
    return { title: '', domain: '' };
  }
}

export async function loadProjectOg(
  locale: Locale,
  slug: string,
): Promise<{
  title: string;
  domain: string;
  versionFrom: string | null;
  versionTo: string | null;
}> {
  try {
    const [site, project] = await Promise.all([getSite(locale), getProjectOrNull(slug, locale)]);
    return {
      title: project?.title ?? site.profile.displayName,
      domain: site.settings.domain,
      versionFrom: project?.versionFrom ?? null,
      versionTo: project?.versionTo ?? null,
    };
  } catch {
    return { title: '', domain: '', versionFrom: null, versionTo: null };
  }
}

export async function loadPostOg(
  locale: Locale,
  slug: string,
): Promise<{ title: string; domain: string }> {
  try {
    const [site, post] = await Promise.all([getSite(locale), getPostOrNull(slug, locale)]);
    return {
      title: post?.title ?? site.settings.siteName,
      domain: site.settings.domain,
    };
  } catch {
    return { title: '', domain: '' };
  }
}
