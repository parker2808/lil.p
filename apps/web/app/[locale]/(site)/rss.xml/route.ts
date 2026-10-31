import type { Locale } from '@portfolio/contracts';

import { getSite } from '@/modules/core/services/site.service';
import { isBuildPhase } from '@/modules/core/utils/build-phase.util';
import { localeStaticParams } from '@/modules/core/utils/static-params.util';
import { listPosts } from '@/modules/notes/services/posts.service';
import { renderRss } from '@/modules/seo/utils/rss.util';
import { absoluteUrl, siteUrl } from '@/modules/seo/utils/site-url.util';

export const revalidate = 3600;

// Route handlers do not inherit the locale layout's params.
export const generateStaticParams = localeStaticParams;

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typed: Locale = locale === 'vi' ? 'vi' : 'en';
  try {
    const [site, posts] = await Promise.all([
      getSite(typed),
      listPosts(typed, { pageSize: 50, sort: '-publishedAt' }),
    ]);
    const xml = renderRss({
      title: site.settings.siteName,
      siteUrl: siteUrl(),
      feedUrl: absoluteUrl(typed, '/rss.xml'),
      description: site.settings.seoDescription,
      locale: typed,
      posts,
    });
    return new Response(xml, {
      headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
    });
  } catch (error) {
    if (!isBuildPhase()) {
      throw error;
    }
    return new Response(
      renderRss({
        title: '',
        siteUrl: siteUrl(),
        feedUrl: absoluteUrl(typed, '/rss.xml'),
        description: '',
        locale: typed,
        posts: [],
      }),
      { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } },
    );
  }
}
